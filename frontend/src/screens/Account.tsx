import { useState } from 'react';
import { auth, useAuth } from '../auth';
import { Alert, Btn, inputCls } from '../expenseUi';
import type { Go, ScreenProps } from '../nav';
import { FlowPage } from '../ui';

/** Login / signup form in normal flow; used by the mobile screens and the desktop site. */
export function AuthForm({ mode, go }: { mode: 'login' | 'signup'; go: Go }) {
  const { user } = useAuth();
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const signup = mode === 'signup';

  if (user) return (
    <div className="space-y-4">
      <Alert tone="ok">{user.name}님으로 로그인되어 있어요 · {user.email}</Alert>
      <p className="text-[13px] text-[#6e6c68]">경비 기록은 계정마다 따로 저장돼요. 아직 서버 동기화는 없어서 이 브라우저에서만 볼 수 있어요.</p>
      <div className="flex gap-2">
        <Btn onClick={() => go('home')}>홈으로</Btn>
        <Btn ghost onClick={() => auth.logout()}>로그아웃</Btn>
      </div>
    </div>
  );

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    const result = signup ? await auth.signup(f) : await auth.login(f.email, f.password);
    setBusy(false);
    const errors = typeof result === 'string' ? (result ? { form: result } : {}) : result;
    setErr(errors);
    if (!Object.keys(errors).length) go('back');
  };
  const field = (key: keyof typeof f, label: string, type: string, auto: string, hint?: string) => (
    <label className="block text-[12px] font-bold">{label}
      <input type={type} autoComplete={auto} value={f[key]} onChange={e => setF({ ...f, [key]: e.target.value })}
        aria-invalid={!!err[key]} aria-describedby={err[key] ? `${key}-err` : undefined}
        className={`${inputCls} ${err[key] ? 'border-[#a84032]' : ''}`} />
      {err[key] ? <span id={`${key}-err`} role="alert" className="mt-1 block text-[12px] font-normal text-[#a84032]">{err[key]}</span>
        : hint && <span className="mt-1 block text-[11px] font-normal text-[#77736e]">{hint}</span>}
    </label>
  );

  return (
    <form className="space-y-4" noValidate onSubmit={e => { e.preventDefault(); submit(); }}>
      {err.form && <Alert tone="error">{err.form}</Alert>}
      {signup && field('name', '이름', 'text', 'name')}
      {field('email', '이메일', 'email', 'email')}
      {field('password', '비밀번호', 'password', signup ? 'new-password' : 'current-password', signup ? '8자 이상 · 영문과 숫자 포함' : undefined)}
      {signup && field('confirm', '비밀번호 확인', 'password', 'new-password')}
      <Btn type="submit" full disabled={busy}>{busy ? (signup ? '가입하는 중…' : '로그인하는 중…') : (signup ? '회원가입' : '로그인')}</Btn>
      <p className="text-center text-[13px] text-[#6e6c68]">
        {signup ? '이미 계정이 있나요? ' : '처음이신가요? '}
        <button type="button" className="font-bold text-[#7d3d00] underline" onClick={() => go(signup ? 'login' : 'signup')}>{signup ? '로그인' : '회원가입'}</button>
      </p>
      <p className="text-[11px] leading-5 text-[#9c978f]">계정은 서버에 저장되고 비밀번호는 암호화돼요. 경비 기록은 아직 이 브라우저에만 저장돼요.</p>
    </form>
  );
}

export function LoginScreen({ go }: ScreenProps) {
  return <FlowPage title="로그인" tab="home" sub="로그인하면 경비 기록을 계정별로 따로 관리할 수 있어요."><AuthForm mode="login" go={go} /></FlowPage>;
}
export function SignupScreen({ go }: ScreenProps) {
  return <FlowPage title="회원가입" tab="home"><AuthForm mode="signup" go={go} /></FlowPage>;
}
