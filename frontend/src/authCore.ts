// Pure helpers for auth.ts (no imports, so node tests can load them directly).
const ITERATIONS = 210_000;

export const b64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf)));
export const unb64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0));

export async function hashPassword(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: ITERATIONS }, key, 256);
  return b64(bits);
}
/** Constant-time compare so a wrong password doesn't leak how many characters matched. */
export const same = (a: string, b: string) => a.length === b.length && [...a].reduce((d, c, i) => d | (c.charCodeAt(0) ^ b.charCodeAt(i)), 0) === 0;

export const normalizeEmail = (e: string) => e.trim().toLowerCase();

/** Returns field → message for invalid signup input (empty object when valid). */
export function validateSignup(f: { name: string; email: string; password: string; confirm: string }) {
  const err: Record<string, string> = {};
  if (!f.name.trim()) err.name = '이름을 입력해 주세요.';
  else if (f.name.trim().length > 20) err.name = '이름은 20자 이하로 입력해 주세요.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) err.email = '이메일 형식을 확인해 주세요.';
  if (f.password.length < 8) err.password = '비밀번호는 8자 이상이어야 해요.';
  else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) err.password = '영문과 숫자를 함께 넣어 주세요.';
  else if (f.password.length > 64) err.password = '비밀번호는 64자 이하로 입력해 주세요.';
  if (f.confirm !== f.password) err.confirm = '비밀번호가 서로 달라요.';
  return err;
}

