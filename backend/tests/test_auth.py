"""Signup / login / session behaviour, through the real HTTP handler."""

from __future__ import annotations

import http.client
import json
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch

import auth
import server

USER = {"name": "왕휘도", "email": "Tester@Example.com", "password": "testpass123"}


class PasswordTests(unittest.TestCase):
    def test_hash_is_salted_and_verifies(self):
        a, b = auth.hash_password("abcd1234"), auth.hash_password("abcd1234")
        self.assertNotEqual(a, b)
        self.assertNotIn("abcd1234", a)
        self.assertTrue(auth.verify_password("abcd1234", a))
        self.assertFalse(auth.verify_password("abcd1235", a))
        self.assertFalse(auth.verify_password("abcd1234", "garbage"))

    def test_signup_validation(self):
        for altered, field in (({"name": " "}, "name"), ({"email": "nope"}, "email"),
                               ({"password": "short1"}, "password"), ({"password": "onlyletters"}, "password"),
                               ({"password": "1" * 8}, "password"), ({"password": "a1" * 40}, "password")):
            with self.subTest(altered=altered), self.assertRaises(auth.AuthError) as ctx:
                auth.validate_signup({**USER, **altered})
            self.assertEqual(ctx.exception.field, field)


class AuthApiTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db = patch.object(auth, "DB_PATH", Path(self.tmp.name) / "auth.db")
        self.db.start()
        auth._failures.clear()
        self.httpd = ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()

    def tearDown(self):
        self.httpd.shutdown()
        self.httpd.server_close()
        self.db.stop()
        self.tmp.cleanup()

    def call(self, method, path, body=None, cookie=None, content_type="application/json"):
        con = http.client.HTTPConnection("127.0.0.1", self.httpd.server_port, timeout=10)
        headers = {"Content-Type": content_type} if body is not None else {}
        if cookie:
            headers["Cookie"] = cookie
        con.request(method, path, body=json.dumps(body) if body is not None else None, headers=headers)
        res = con.getresponse()
        data = json.loads(res.read())
        set_cookie = res.getheader("Set-Cookie")
        con.close()
        return res.status, data, set_cookie

    def test_signup_login_me_logout_flow(self):
        status, data, cookie = self.call("POST", "/api/auth/signup", USER)
        self.assertEqual(status, 201)
        self.assertEqual(data["user"]["email"], "tester@example.com")
        self.assertNotIn("password", json.dumps(data))
        self.assertIn("HttpOnly", cookie)
        self.assertIn("SameSite=Lax", cookie)
        session = cookie.split(";")[0]

        self.assertEqual(self.call("GET", "/api/auth/me", cookie=session)[1]["user"]["name"], "왕휘도")
        self.assertEqual(self.call("GET", "/api/auth/me")[0], 401)

        status, _, _ = self.call("POST", "/api/auth/signup", {**USER, "email": "tester@example.com"})
        self.assertEqual(status, 409)

        status, data, login_cookie = self.call("POST", "/api/auth/login", {"email": " TESTER@example.com ", "password": "testpass123"})
        self.assertEqual((status, data["user"]["name"]), (200, "왕휘도"))
        other_session = login_cookie.split(";")[0]

        status, _, cleared = self.call("POST", "/api/auth/logout", {}, cookie=session)
        self.assertEqual(status, 200)
        self.assertIn("Max-Age=0", cleared)
        self.assertEqual(self.call("GET", "/api/auth/me", cookie=session)[0], 401)
        self.assertEqual(self.call("GET", "/api/auth/me", cookie=other_session)[0], 200)

    def test_wrong_password_and_unknown_email_look_the_same(self):
        self.call("POST", "/api/auth/signup", USER)
        wrong = self.call("POST", "/api/auth/login", {"email": USER["email"], "password": "wrongpass1"})
        unknown = self.call("POST", "/api/auth/login", {"email": "nobody@example.com", "password": "testpass123"})
        self.assertEqual(wrong[:2], unknown[:2])
        self.assertEqual(wrong[0], 401)

    def test_repeated_failures_are_rate_limited(self):
        self.call("POST", "/api/auth/signup", USER)
        for _ in range(auth.LOGIN_MAX_FAILURES):
            self.call("POST", "/api/auth/login", {"email": USER["email"], "password": "wrongpass1"})
        status, data, _ = self.call("POST", "/api/auth/login", {"email": USER["email"], "password": "testpass123"})
        self.assertEqual(status, 429)
        self.assertIn("10분", data["error"])

    def test_form_posts_are_rejected(self):
        status, _, _ = self.call("POST", "/api/auth/login", {"email": "a", "password": "b"}, content_type="application/x-www-form-urlencoded")
        self.assertEqual(status, 415)

    def test_forged_or_expired_session_is_rejected(self):
        self.assertEqual(self.call("GET", "/api/auth/me", cookie=f"{auth.SESSION_COOKIE}=forged")[0], 401)
        _, _, cookie = self.call("POST", "/api/auth/signup", USER)
        with patch("auth.time.time", return_value=auth.time.time() + auth.SESSION_SECONDS + 1):
            self.assertEqual(self.call("GET", "/api/auth/me", cookie=cookie.split(";")[0])[0], 401)

    def test_secure_flag_when_configured(self):
        with patch.dict("server.os.environ", {"COOKIE_SECURE": "1"}):
            _, _, cookie = self.call("POST", "/api/auth/signup", USER)
        self.assertIn("Secure", cookie)


if __name__ == "__main__":
    unittest.main()
