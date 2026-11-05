"""Email + password accounts with server-side sessions (stdlib only: sqlite3, hashlib.scrypt, secrets).

- Passwords: scrypt (N=2^14, r=8, p=1) with a random 16-byte salt; only the hash is stored.
- Sessions: random 256-bit token in an HttpOnly cookie; the DB stores only its SHA-256.
- Login: same error for unknown email and wrong password, a dummy hash keeps timing similar,
  and 5 failures per email+IP within 10 minutes are blocked.
"""

from __future__ import annotations

import hashlib
import hmac
import os
import re
import secrets
import sqlite3
import threading
import time
from pathlib import Path

DB_PATH = Path(os.environ.get("AUTH_DB_PATH", Path(__file__).resolve().parent / "data" / "auth.db"))
SESSION_COOKIE = "cheongdo_session"
SESSION_SECONDS = 14 * 24 * 3600
LOGIN_WINDOW_SECONDS = 10 * 60
LOGIN_MAX_FAILURES = 5
SCRYPT = {"n": 2**14, "r": 8, "p": 1, "dklen": 32}
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")


class AuthError(ValueError):
    """User-facing auth failure; `status` is the HTTP status, `field` the offending input (if any)."""

    def __init__(self, message: str, status: int = 400, field: str | None = None):
        super().__init__(message)
        self.status = status
        self.field = field


_lock = threading.Lock()
_failures: dict[str, list[float]] = {}


def _db() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(DB_PATH, timeout=5)
    con.execute("PRAGMA foreign_keys = ON")
    con.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS sessions (
            token_hash TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            expires_at INTEGER NOT NULL
        );
        """
    )
    return con


def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, maxmem=64 * 1024 * 1024, **SCRYPT)
    return f"scrypt${SCRYPT['n']}${SCRYPT['r']}${SCRYPT['p']}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, n, r, p, salt, digest = stored.split("$")
        actual = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=int(n), r=int(r), p=int(p),
                                dklen=len(digest) // 2, maxmem=64 * 1024 * 1024)
    except (ValueError, TypeError):
        return False
    return hmac.compare_digest(actual.hex(), digest)


_DUMMY_HASH = hash_password("timing-equaliser")


def normalize_email(value: object) -> str:
    return value.strip().lower() if isinstance(value, str) else ""


def validate_signup(payload: dict) -> tuple[str, str, str]:
    name = payload.get("name").strip() if isinstance(payload.get("name"), str) else ""
    email = normalize_email(payload.get("email"))
    password = payload.get("password") if isinstance(payload.get("password"), str) else ""
    if not name:
        raise AuthError("이름을 입력해 주세요.", field="name")
    if len(name) > 20:
        raise AuthError("이름은 20자 이하로 입력해 주세요.", field="name")
    if not EMAIL_RE.match(email) or len(email) > 254:
        raise AuthError("이메일 형식을 확인해 주세요.", field="email")
    if len(password) < 8:
        raise AuthError("비밀번호는 8자 이상이어야 해요.", field="password")
    if len(password) > 64:
        raise AuthError("비밀번호는 64자 이하로 입력해 주세요.", field="password")
    if not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
        raise AuthError("영문과 숫자를 함께 넣어 주세요.", field="password")
    return name, email, password


def _public(row) -> dict:
    return {"id": row[0], "email": row[1], "name": row[2]}


def _new_session(con: sqlite3.Connection, user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    now = int(time.time())
    con.execute("DELETE FROM sessions WHERE expires_at < ?", (now,))
    con.execute("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
                (hashlib.sha256(token.encode()).hexdigest(), user_id, now + SESSION_SECONDS))
    return token


def signup(payload: dict) -> tuple[dict, str]:
    """Create the account and log it in. Returns (user, session token)."""
    name, email, password = validate_signup(payload)
    password_hash = hash_password(password)
    with _db() as con:
        try:
            cur = con.execute("INSERT INTO users (email, name, password_hash, created_at) VALUES (?, ?, ?, ?)",
                              (email, name, password_hash, int(time.time())))
        except sqlite3.IntegrityError:
            raise AuthError("이미 가입한 이메일이에요. 로그인해 주세요.", 409, "email") from None
        return {"id": cur.lastrowid, "email": email, "name": name}, _new_session(con, cur.lastrowid)


def _rate_key(email: str, client: str) -> str:
    return f"{email}|{client}"


def login(payload: dict, client: str = "") -> tuple[dict, str]:
    email = normalize_email(payload.get("email"))
    password = payload.get("password") if isinstance(payload.get("password"), str) else ""
    if not email or not password:
        raise AuthError("이메일과 비밀번호를 입력해 주세요.")
    key, now = _rate_key(email, client), time.time()
    with _lock:
        recent = [t for t in _failures.get(key, []) if now - t < LOGIN_WINDOW_SECONDS]
        _failures[key] = recent
        if len(recent) >= LOGIN_MAX_FAILURES:
            raise AuthError("로그인 시도가 너무 많아요. 10분 뒤 다시 시도해 주세요.", 429)
    with _db() as con:
        row = con.execute("SELECT id, email, name, password_hash FROM users WHERE email = ?", (email,)).fetchone()
        ok = verify_password(password, row[3] if row else _DUMMY_HASH) and row is not None
        if not ok:
            with _lock:
                _failures.setdefault(key, []).append(now)
            raise AuthError("이메일 또는 비밀번호가 맞지 않아요.", 401)
        with _lock:
            _failures.pop(key, None)
        return _public(row), _new_session(con, row[0])


def current_user(token: str | None) -> dict | None:
    if not token:
        return None
    with _db() as con:
        row = con.execute(
            "SELECT u.id, u.email, u.name FROM sessions s JOIN users u ON u.id = s.user_id "
            "WHERE s.token_hash = ? AND s.expires_at > ?",
            (hashlib.sha256(token.encode()).hexdigest(), int(time.time())),
        ).fetchone()
    return _public(row) if row else None


def logout(token: str | None) -> None:
    if token:
        with _db() as con:
            con.execute("DELETE FROM sessions WHERE token_hash = ?", (hashlib.sha256(token.encode()).hexdigest(),))


def session_cookie(token: str, secure: bool) -> str:
    return (f"{SESSION_COOKIE}={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age={SESSION_SECONDS}"
            + ("; Secure" if secure else ""))


def clear_cookie(secure: bool) -> str:
    return f"{SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0" + ("; Secure" if secure else "")
