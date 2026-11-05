// Accounts live on the backend (/api/auth/*): scrypt-hashed passwords, HttpOnly session cookie.
// The browser never sees the session token; it only knows who is logged in via /api/auth/me.
import { useEffect, useState } from 'react';
import { readAuthResponse, validateSignup, type ApiUser } from './authCore';
import { expenseStore } from './expenses';

export { normalizeEmail, validateSignup } from './authCore';
export type User = { email: string; name: string };

const subs = new Set<(u: User | null) => void>();
let user: User | null = null;
let checked = false;

function setUser(u: ApiUser | User | null) {
  user = u ? { email: u.email, name: u.name } : null;
  expenseStore.useOwner(user?.email ?? null);
  subs.forEach(f => f(user));
}

async function call(path: string, body?: unknown) {
  try {
    const res = await fetch(`/api/auth/${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'same-origin',
      signal: AbortSignal.timeout(10000),
    });
    return readAuthResponse(res.status, await res.json().catch(() => null));
  } catch {
    return { errors: { form: '서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.' } };
  }
}

// Remove accounts saved by the old browser-only login (they held password hashes).
try { localStorage.removeItem('cheongdo.accounts'); localStorage.removeItem('cheongdo.session'); } catch { /* storage blocked */ }

/** Restore the session from the cookie once at startup. */
export const authReady = (typeof window === 'undefined' ? Promise.resolve() : call('me').then(r => { checked = true; setUser(r.user ?? null); }));

export const auth = {
  /** Returns field → message errors; empty object on success. */
  async signup(f: { name: string; email: string; password: string; confirm: string }): Promise<Record<string, string>> {
    const err = validateSignup(f);
    if (Object.keys(err).length) return err;
    const r = await call('signup', { name: f.name.trim(), email: f.email.trim(), password: f.password });
    if (r.user) setUser(r.user);
    return r.errors ?? {};
  },
  /** Returns '' on success, otherwise the message to show. */
  async login(email: string, password: string): Promise<string> {
    if (!email.trim() || !password) return '이메일과 비밀번호를 입력해 주세요.';
    const r = await call('login', { email: email.trim(), password });
    if (r.user) { setUser(r.user); return ''; }
    return Object.values(r.errors ?? {})[0] ?? '로그인하지 못했어요.';
  },
  async logout() {
    await call('logout', {});
    setUser(null);
  },
  current: () => user,
  checked: () => checked,
};

export function useAuth() {
  const [u, set] = useState(user);
  useEffect(() => { subs.add(set); set(user); return () => { subs.delete(set); }; }, []);
  return { user: u };
}
