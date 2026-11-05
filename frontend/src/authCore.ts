// Pure helpers for auth.ts (no imports, so node tests can load them directly).

export const normalizeEmail = (e: string) => e.trim().toLowerCase();

/** Same rules as the backend (backend/auth.py validate_signup) plus the confirm field. Empty object = valid. */
export function validateSignup(f: { name: string; email: string; password: string; confirm: string }) {
  const err: Record<string, string> = {};
  if (!f.name.trim()) err.name = '이름을 입력해 주세요.';
  else if (f.name.trim().length > 20) err.name = '이름은 20자 이하로 입력해 주세요.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) err.email = '이메일 형식을 확인해 주세요.';
  if (f.password.length < 8) err.password = '비밀번호는 8자 이상이어야 해요.';
  else if (f.password.length > 64) err.password = '비밀번호는 64자 이하로 입력해 주세요.';
  else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) err.password = '영문과 숫자를 함께 넣어 주세요.';
  if (f.confirm !== f.password) err.confirm = '비밀번호가 서로 달라요.';
  return err;
}

export type ApiUser = { id: number; email: string; name: string };

/** Backend auth response → user, or a field→message error map (field from the API, else 'form'). */
export function readAuthResponse(status: number, body: unknown): { user?: ApiUser; errors?: Record<string, string> } {
  const b = (typeof body === 'object' && body ? body : {}) as Record<string, unknown>;
  const u = b.user as Record<string, unknown> | undefined;
  if (status < 300 && u && typeof u.email === 'string' && typeof u.name === 'string' && typeof u.id === 'number')
    return { user: { id: u.id, email: u.email, name: u.name } };
  const message = typeof b.error === 'string' ? b.error : `요청에 실패했어요 (${status}).`;
  return { errors: { [typeof b.field === 'string' ? b.field : 'form']: message } };
}
