// Expense UI shared by the mobile screens and the desktop site (normal flow layout).
import { useMemo, useState, type ReactNode } from 'react';
import { recognizeReceipt } from './api';
import { CATEGORIES, dayLabel, won, type Category } from './data';
import { expenseStore, parseWon, sortByDate, useExpenses, type ExpenseInput, type ExpenseRecord } from './expenses';
import { settle } from './settle';
import { useAuth } from './auth';

export const CAT_COLORS: Record<Category, string> = {
  항공: '#3f5f7d', 숙박: '#e8b4a6', 식비: '#c8776a', 쇼핑: '#9a5b4f', 교통: '#6b3f37', 체험: '#7d3d00', 기타: '#a9a39a',
};
const DAY_COLORS = ['#7d3d00', '#c8776a', '#e8b4a6', '#6b3f37', '#a9a39a', '#3f5f7d'];
const MAX_IMAGE = 8 * 1024 * 1024;

export const inputCls = 'mt-1 h-11 w-full rounded-xl border border-[#e3dcd2] bg-white px-3 text-[14px] font-normal text-[#24211d] outline-none focus:border-[#7d3d00]';
export const Btn = ({ children, onClick, ghost, danger, type = 'button', disabled, full }: {
  children: ReactNode; onClick?: () => void; ghost?: boolean; danger?: boolean; type?: 'button' | 'submit'; disabled?: boolean; full?: boolean;
}) => (
  <button type={type} disabled={disabled} onClick={onClick}
    className={`inline-flex h-11 items-center justify-center rounded-xl px-5 text-[14px] font-bold transition disabled:opacity-50 ${full ? 'w-full' : ''} ${
      danger ? 'border border-[#e8c4bf] bg-white text-[#a84032]' : ghost ? 'border border-[#e3dcd2] bg-white text-[#7d3d00] hover:bg-[#f7f2eb]' : 'bg-[#7d3d00] text-white hover:bg-[#622e00]'}`}>
    {children}
  </button>
);
export const Alert = ({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'error' | 'ok' }) => (
  <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-[13px] leading-5 ${
    tone === 'error' ? 'bg-[#fdecea] text-[#a84032]' : tone === 'ok' ? 'bg-[#eef5ec] text-[#3d6b45]' : 'bg-[#f7f4ef] text-[#6e6c68]'}`}>{children}</p>
);

export function StorageNote() {
  const { error } = useExpenses();
  const { user } = useAuth();
  return (
    <div className="space-y-2">
      {error && <Alert tone="error">{error}</Alert>}
      <p className="text-[11px] leading-5 text-[#77736e]">
        {user ? `${user.name}님 계정에 저장돼요 · 이 브라우저에서만 볼 수 있어요` : '로그인하지 않으면 이 브라우저의 게스트 기록으로 저장돼요'} · 서버 동기화 없음
      </p>
    </div>
  );
}

/* ---------- donut ---------- */
type Slice = { label: string; value: number; color: string };
export function Donut({ slices, size = 160 }: { slices: Slice[]; size?: number }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = 40, c = 2 * Math.PI * r, gap = slices.length > 1 ? 3 : 0;
  let offset = 0;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`총 지출 ${won(total)}`}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#f1ede7" strokeWidth="12" />
      {total > 0 && slices.map(s => {
        const len = Math.max((s.value / total) * c - gap, 0.01);
        const el = <circle key={s.label} cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} transform="rotate(-90 50 50)" />;
        offset += (s.value / total) * c;
        return el;
      })}
      <text x="50" y="45" textAnchor="middle" fontSize="7" fill="#6e6c68" fontWeight="700">총 지출</text>
      <text x="50" y="58" textAnchor="middle" fontSize="10" fill="#24211d" fontWeight="700">{won(total)}</text>
    </svg>
  );
}

export function Breakdown({ expenses }: { expenses: ExpenseRecord[] }) {
  const [mode, setMode] = useState<'cat' | 'day'>('cat');
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const slices: Slice[] = mode === 'cat'
    ? CATEGORIES.map(c => ({ label: c, value: expenses.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0), color: CAT_COLORS[c] })).filter(s => s.value > 0)
    : [...new Set(sortByDate(expenses).map(e => e.date))].reverse().map((d, i) => ({ label: dayLabel(d), value: expenses.filter(e => e.date === d).reduce((s, e) => s + e.amount, 0), color: DAY_COLORS[i % DAY_COLORS.length] }));
  return (
    <div>
      <div className="grid grid-cols-2 rounded-xl bg-[#f4f1ec] p-1" role="tablist" aria-label="보기 방식">
        {(['cat', 'day'] as const).map(m => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
            className={`h-9 rounded-lg text-[13px] font-bold ${mode === m ? 'bg-white text-[#7d3d00] shadow-sm' : 'text-[#6e6c68]'}`}>{m === 'cat' ? '항목별' : '일자별'}</button>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4">
        <Donut slices={slices} size={150} />
        <ul className="min-w-0 flex-1 space-y-2">
          {slices.map(s => (
            <li key={s.label} className="flex items-center gap-2 text-[13px]">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
              <span className="font-bold">{s.label}</span>
              <span className="text-[12px] text-[#6e6c68]">{Math.round((s.value / total) * 100)}%</span>
              <span className="ml-auto font-bold">{won(s.value)}</span>
            </li>
          ))}
          {!slices.length && <li className="text-[13px] text-[#6e6c68]">아직 지출이 없어요</li>}
        </ul>
      </div>
    </div>
  );
}

/* ---------- list ---------- */
export function ExpenseList({ onEdit, limit }: { onEdit: (id: string) => void; limit?: number }) {
  const { expenses } = useExpenses();
  const [cat, setCat] = useState<'전체' | Category>('전체');
  const list = sortByDate(expenses).filter(e => cat === '전체' || e.category === cat);
  const shown = limit ? list.slice(0, limit) : list;
  const dates = [...new Set(shown.map(e => e.date))];
  return (
    <div>
      {!limit && <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label="카테고리 필터">
        {(['전체', ...CATEGORIES] as const).map(c => (
          <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
            className={`h-8 shrink-0 rounded-full px-3.5 text-[12px] font-bold ${cat === c ? 'bg-[#7d3d00] text-white' : 'border border-[#e3dcd2] bg-white text-[#4c4945]'}`}>{cat === c ? '✓ ' : ''}{c}</button>
        ))}
      </div>}
      {!shown.length && <p className="py-10 text-center text-[13px] text-[#6e6c68]">{expenses.length ? `${cat} 항목 지출이 없어요. 다른 카테고리를 골라 보세요.` : '아직 등록한 지출이 없어요.'}</p>}
      {dates.map(d => (
        <section key={d}>
          {!limit && <h3 className="pb-1 pt-3 text-[13px] font-bold text-[#24211d]">{dayLabel(d)}</h3>}
          {shown.filter(e => e.date === d).map(e => (
            <button key={e.id} onClick={() => onEdit(e.id)} aria-label={`${e.name} 수정`}
              className="flex w-full items-center justify-between gap-3 border-b border-[#ece7e0] py-3 text-left">
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-[14px] font-bold text-[#24211d]">{e.name}
</span>
                <span className="block truncate text-[12px] text-[#6e6c68]">{e.category} · {limit ? dayLabel(e.date) : `${e.payer} 결제`}{e.shared ? '' : ' · 개인'}{e.memo ? ` · ${e.memo}` : ''}</span>
              </span>
              <span className="shrink-0 text-[15px] font-bold text-[#24211d]">{won(e.amount)}</span>
            </button>
          ))}
        </section>
      ))}
    </div>
  );
}

/* ---------- form (new / edit, with receipt OCR) ---------- */
const todayKst = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

export function ExpenseForm({ editId, onDone }: { editId?: string; onDone: () => void }) {
  const { expenses, people } = useExpenses();
  const existing = editId ? expenses.find(e => e.id === editId) : undefined;
  const [f, setF] = useState(() => existing
    ? { ...existing, amount: String(existing.amount) }
    : { name: '', amount: '', date: todayKst(), category: '기타' as Category, payer: people[0] ?? '나', shared: true, memo: '' });
  const [ocr, setOcr] = useState<{ tone: 'info' | 'error' | 'ok'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  if (editId && !existing) return (
    <div className="space-y-4"><Alert tone="error">이 지출을 찾을 수 없어요. 이미 삭제되었을 수 있어요.</Alert><Btn onClick={onDone}>전체 지출로 가기</Btn></div>
  );

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setOcr({ tone: 'error', text: '이미지 파일만 올릴 수 있어요.' });
    if (file.size > MAX_IMAGE) return setOcr({ tone: 'error', text: '사진은 8MB 이하로 올려주세요. 직접 입력해도 돼요.' });
    setBusy(true); setOcr({ tone: 'info', text: `${file.name} · 사진에서 사용처와 금액을 읽는 중…` });
    try {
      const data = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(new Error('사진을 읽지 못했습니다.')); r.readAsDataURL(file); });
      const r = await recognizeReceipt(data);
      const got: string[] = [];
      setF(v => {
        const n = { ...v };
        if (r.merchant) { n.name = r.merchant; got.push('사용처'); }
        if (r.amount) { n.amount = String(r.amount); got.push('금액'); }
        if (/^\d{4}-\d{2}-\d{2}$/.test(r.date)) { n.date = r.date; got.push('날짜'); }
        if ((CATEGORIES as readonly string[]).includes(r.category)) { n.category = r.category as Category; got.push('분류'); }
        return n;
      });
      setOcr(r.status === 'no_text' || !got.length
        ? { tone: 'error', text: '사진에서 글자를 찾지 못했어요. 아래에 직접 입력해 주세요.' }
        : { tone: 'ok', text: `${got.join('·')}을(를) 초안으로 채웠어요. 저장 전에 확인하고 고쳐 주세요.` });
    } catch (e) {
      setOcr({ tone: 'error', text: `${(e as Error).message || '사진 인식을 할 수 없어요.'} 아래에 직접 입력해 주세요.` });
    } finally { setBusy(false); }
  };

  const save = () => {
    const amount = parseWon(f.amount);
    const errs = [
      !f.name.trim() && '사용처를 입력해 주세요.',
      !(amount > 0) && '금액을 1원 이상 숫자로 입력해 주세요.',
      !/^\d{4}-\d{2}-\d{2}$/.test(f.date) && '사용일을 선택해 주세요.',
      !people.includes(f.payer) && '결제한 사람을 다시 골라 주세요.',
    ].filter(Boolean) as string[];
    setErrors(errs);
    if (errs.length) return;
    const input: ExpenseInput = { name: f.name.trim(), amount, date: f.date, category: f.category, payer: f.payer, shared: f.shared, memo: f.memo.trim() };
    if (editId ? expenseStore.update(editId, input) : expenseStore.add(input)) onDone();
    else setErrors(['저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.']);
  };
  const del = () => { if (editId && confirm(`'${existing?.name}' 지출을 삭제할까요?`)) { expenseStore.remove(editId); onDone(); } };

  return (
    <form className="space-y-4" onSubmit={e => { e.preventDefault(); save(); }} noValidate>
      {!editId && <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[#d9c7b3] bg-[#fcfaf7] p-4 hover:bg-[#faf6f0]">
        <span className="grid size-10 place-items-center rounded-full bg-[#7d3d00] text-lg text-white" aria-hidden>◉</span>
        <span><span className="block text-[14px] font-bold">결제 사진·캡처 올리기</span><span className="block text-[12px] text-[#6e6c68]">8MB 이하 · 사진 없이 직접 입력해도 돼요</span></span>
        <input type="file" accept="image/*" capture="environment" className="sr-only" disabled={busy} onChange={e => onFile(e.target.files?.[0])} />
      </label>}
      {ocr && <Alert tone={ocr.tone}>{ocr.text}</Alert>}
      {errors.length > 0 && <Alert tone="error">{errors.join(' ')}</Alert>}
      <label className="block text-[12px] font-bold">사용처<input className={inputCls} value={f.name} maxLength={60} onChange={e => setF({ ...f, name: e.target.value })} aria-invalid={errors.some(x => x.includes('사용처'))} /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-[12px] font-bold">금액(원)<input className={inputCls} inputMode="numeric" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} aria-invalid={errors.some(x => x.includes('금액'))} /></label>
        <label className="block text-[12px] font-bold">사용일<input type="date" className={inputCls} value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></label>
        <label className="block text-[12px] font-bold">분류<select className={inputCls} value={f.category} onChange={e => setF({ ...f, category: e.target.value as Category })}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label>
        <label className="block text-[12px] font-bold">결제한 사람<select className={inputCls} value={f.payer} onChange={e => setF({ ...f, payer: e.target.value })}>{people.map(p => <option key={p}>{p}</option>)}</select></label>
      </div>
      <label className="block text-[12px] font-bold">메모<input className={inputCls} value={f.memo} maxLength={100} placeholder="선택" onChange={e => setF({ ...f, memo: e.target.value })} /></label>
      <label className="flex items-center justify-between rounded-xl bg-[#f7f4ef] px-4 py-3 text-[14px] font-bold">
        <span>함께 쓴 경비로 정산<span className="block text-[12px] font-normal text-[#6e6c68]">{f.shared ? '인원수로 나눠서 정산해요' : '개인 지출 · 정산에서 빠져요'}</span></span>
        <input type="checkbox" role="switch" className="size-5 accent-[#7d3d00]" checked={f.shared} onChange={e => setF({ ...f, shared: e.target.checked })} />
      </label>
      <div className="flex gap-2">
        <Btn type="submit" disabled={busy} full>{editId ? '수정 내용 저장' : '경비 추가'}</Btn>
        {editId && <Btn danger onClick={del}>삭제</Btn>}
      </div>
    </form>
  );
}

/* ---------- settlement ---------- */
export function useSettlement() {
  const { expenses, people } = useExpenses();
  return useMemo(() => settle(expenses, people), [expenses, people]);
}

export function SettlementPanel() {
  const { expenses, people } = useExpenses();
  const s = useSettlement();
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const max = Math.max(1, ...people.map(p => s.paid[p]));
  const add = () => { const e = expenseStore.addPerson(name); setMsg(e); if (!e) setName(''); };
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[13px] font-bold text-[#6e6c68]">함께 쓴 경비</p>
        <p className="text-[32px] font-bold text-[#7d3d00]">{won(s.total)}</p>
        <p className="text-[13px] text-[#6e6c68]">{people.length}명이 나누면 1인 <b className="text-[#24211d]">{won(s.share)}</b>{s.remainder ? ` · 남는 ${s.remainder}원은 앞의 ${s.remainder}명이 1원씩 더 부담` : ''}</p>
        {s.personal > 0 && <p className="mt-1 text-[12px] text-[#6e6c68]">개인 지출 {won(s.personal)}은 정산에서 뺐어요.</p>}
      </div>

      {!expenses.some(e => e.shared) ? <Alert>아직 함께 쓴 지출이 없어요. 경비를 등록하면 자동으로 계산돼요.</Alert> : <>
        <div>
          <p className="mb-2 text-[15px] font-bold">누가 얼마나 결제했나요?</p>
          <ul className="space-y-3">{people.map((p, i) => (
            <li key={p}>
              <div className="flex justify-between text-[13px]"><span className="font-bold">{p}</span><span><b>{won(s.paid[p])}</b> <span className="text-[#6e6c68]">/ 부담 {won(s.shares[p])}</span></span></div>
              <div className="mt-1 h-1.5 rounded-full bg-[#ece7e0]"><div className="h-full rounded-full" style={{ width: `${(s.paid[p] / max) * 100}%`, background: DAY_COLORS[i % DAY_COLORS.length] }} /></div>
            </li>
          ))}</ul>
        </div>
        <div className="rounded-2xl bg-[#f7f0e7] p-4">
          <p className="text-[12px] font-bold text-[#6e6c68]">정산하려면</p>
          {s.transfers.length ? <ul className="mt-2 space-y-2">{s.transfers.map((t, i) => (
            <li key={i} className="text-[17px] font-bold">{t.from} → {t.to} <span className="text-[#7d3d00]">{won(t.amount)}</span></li>
          ))}</ul> : <p className="mt-1 text-[15px] font-bold">이미 똑같이 냈어요. 보낼 돈이 없어요.</p>}
        </div>
      </>}

      <div>
        <p className="mb-2 text-[15px] font-bold">동행인 <span className="text-[12px] font-normal text-[#6e6c68]">{people.length}명</span></p>
        <ul className="flex flex-wrap gap-2">{people.map(p => (
          <li key={p} className="flex items-center gap-1 rounded-full border border-[#e3dcd2] bg-white py-1 pl-3 pr-1 text-[13px]">{p}
            <button aria-label={`${p} 삭제`} className="grid size-6 place-items-center rounded-full text-[#9c978f] hover:bg-[#f4f1ec]" onClick={() => setMsg(expenseStore.removePerson(p))}>×</button>
          </li>
        ))}</ul>
        <form className="mt-3 flex gap-2" onSubmit={e => { e.preventDefault(); add(); }}>
          <label className="sr-only" htmlFor="new-person">동행인 이름</label>
          <input id="new-person" className={`${inputCls} mt-0`} value={name} maxLength={12} placeholder="이름 추가" onChange={e => setName(e.target.value)} />
          <Btn type="submit" ghost>추가</Btn>
        </form>
        {msg && <div className="mt-2"><Alert tone="error">{msg}</Alert></div>}
      </div>
    </div>
  );
}
