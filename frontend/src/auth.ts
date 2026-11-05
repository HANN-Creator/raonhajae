// Frontend-only accounts: stored in this browser's localStorage, no server.
// Passwords are never stored: PBKDF2-SHA256 (WebCrypto) with a per-account random salt.
// ponytail: this keeps accounts apart on one device; it is NOT real authentication (anyone with
// the device can read/clear localStorage). Move to backend auth before storing anything sensitive.
import { useEffect, useState } from 'react';
import { expenseStore } from './expenses';

export type User = { email: string; name: string };
type Account = User & { salt: string; hash: string; createdAt: string };

const ACCOUNTS = 'cheongdo.accounts', SESSION = 'cheongdo.session';

import { b64, hashPassword, normalizeEmail, same, unb64, validateSignup } from './authCore';
export { hashPassword, normalizeEmail, validateSignup };

function readAccounts(): Account[] {
  try { const v = JSON.parse(localStorage.getItem(ACCOUNTS) ?? '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}
function readSession(): User | null {
  try {
    const email = localStorage.getItem(SESSION);
    const a = email ? readAccounts().find(x => x.email === email) : undefined;
    return a ? { email: a.email, name: a.name } : null;
  } catch { return null; }
}

let user = readSession();
expenseStore.useOwner(user?.email ?? null);
const subs = new Set<(u: User | null) => void>();
function setUser(u: User | null) {
  user = u;
  try { if (u) localStorage.setItem(SESSION, u.email); else localStorage.removeItem(SESSION); } catch { /* session just won't persist */ }
  expenseStore.useOwner(u?.email ?? null);
  subs.forEach(f => f(u));
}
if (typeof window !== 'undefined') addEventListener('storage', ev => {
  if (ev.key === SESSION || ev.key === ACCOUNTS) { user = readSession(); expenseStore.useOwner(user?.email ?? null); subs.forEach(f => f(user)); }
});

export const auth = {
  async signup(f: { name: string; email: string; password: string; confirm: string }): Promise<Record<string, string>> {
    const err = validateSignup(f);
    if (Object.keys(err).length) return err;
    const email = normalizeEmail(f.email);
    const accounts = readAccounts();
    if (accounts.some(a => a.email === email)) return { email: '이미 가입한 이메일이에요. 로그인해 주세요.' };
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const account: Account = { email, name: f.name.trim(), salt: b64(salt), hash: await hashPassword(f.password, salt), createdAt: new Date().toISOString() };
    try { localStorage.setItem(ACCOUNTS, JSON.stringify([...accounts, account])); }
    catch { return { form: '이 브라우저에 계정을 저장할 수 없어요. 저장 공간 설정을 확인해 주세요.' }; }
    setUser({ email, name: account.name });
    return {};
  },
  /** Returns '' on success, otherwise a message that doesn't reveal whether the email exists. */
  async login(emailInput: string, password: string): Promise<string> {
    const email = normalizeEmail(emailInput);
    if (!email || !password) return '이메일과 비밀번호를 입력해 주세요.';
    const a = readAccounts().find(x => x.email === email);
    // hash even for unknown emails so both paths take the same time
    const h = await hashPassword(password, a ? unb64(a.salt) : new Uint8Array(16));
    if (!a || !same(h, a.hash)) return '이메일 또는 비밀번호가 맞지 않아요.';
    setUser({ email: a.email, name: a.name });
    return '';
  },
  logout: () => setUser(null),
  current: () => user,
};

export function useAuth() {
  const [u, set] = useState(user);
  useEffect(() => { subs.add(set); set(user); return () => { subs.delete(set); }; }, []);
  return { user: u };
}
