import { useEffect, useState } from 'react';
import { CATEGORIES, DEFAULT_PEOPLE, type Category } from './data';

export type ExpenseRecord = {
  id: string; name: string; category: Category; date: string; amount: number;
  payer: string; shared: boolean; memo: string;
};
export type ExpenseInput = Omit<ExpenseRecord, 'id'>;

type State = { expenses: ExpenseRecord[]; people: string[]; error: string };

// Each account (or the guest) has its own expense book in this browser.
let owner = 'guest';
const keys = () => ({ e: `cheongdo.expenses:${owner}`, p: `cheongdo.people:${owner}` });

function load(): State {
  try {
    const { e, p } = keys();
    const raw = localStorage.getItem(e), rawP = localStorage.getItem(p);
    const expenses = raw ? (JSON.parse(raw) as (ExpenseRecord & { sample?: boolean })[])
      .filter(x => x && typeof x.id === 'string' && typeof x.amount === 'number' && !x.sample) : [];
    const people = rawP ? (JSON.parse(rawP) as string[]).filter(x => typeof x === 'string') : DEFAULT_PEOPLE;
    return {
      expenses: expenses.map(x => ({ ...x, category: CATEGORIES.includes(x.category) ? x.category : '기타', memo: x.memo ?? '' })),
      people: people.length ? people : DEFAULT_PEOPLE, error: '',
    };
  } catch {
    return { expenses: [], people: DEFAULT_PEOPLE, error: '이 브라우저에 저장된 경비를 읽지 못했어요.' };
  }
}

let state = load();
const subs = new Set<(s: State) => void>();
const emit = () => subs.forEach(f => f(state));
function commit(next: Omit<State, 'error'>) {
  let error = '';
  try { const { e, p } = keys(); localStorage.setItem(e, JSON.stringify(next.expenses)); localStorage.setItem(p, JSON.stringify(next.people)); }
  catch { error = '저장하지 못했어요. 이 창을 닫으면 방금 바꾼 내용이 사라질 수 있어요.'; }
  state = { ...next, error };
  emit();
  return !error;
}
if (typeof window !== 'undefined') addEventListener('storage', ev => {
  const { e, p } = keys();
  if (ev.key === e || ev.key === p) { state = load(); emit(); }
});

const newId = () => (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export const expenseStore = {
  get: () => state,
  /** Switch to another account's book (called by auth on login/logout). */
  useOwner: (id: string | null) => { owner = id ?? 'guest'; state = load(); emit(); },
  add: (e: ExpenseInput) => commit({ ...state, expenses: [{ ...e, id: newId() }, ...state.expenses] }),
  update: (id: string, e: ExpenseInput) => commit({ ...state, expenses: state.expenses.map(x => x.id === id ? { ...e, id } : x) }),
  remove: (id: string) => commit({ ...state, expenses: state.expenses.filter(x => x.id !== id) }),
  /** Returns an error message, or '' when added. */
  addPerson: (name: string) => {
    const n = name.trim();
    if (!n) return '이름을 입력해 주세요.';
    if (n.length > 12) return '이름은 12자 이하로 입력해 주세요.';
    if (state.people.includes(n)) return '이미 있는 이름이에요.';
    commit({ ...state, people: [...state.people, n] });
    return '';
  },
  removePerson: (name: string) => {
    if (state.expenses.some(e => e.payer === name)) return '결제 내역이 있는 사람은 삭제할 수 없어요. 먼저 결제자를 바꿔 주세요.';
    if (state.people.length <= 1) return '정산하려면 한 명 이상 있어야 해요.';
    commit({ ...state, people: state.people.filter(p => p !== name) });
    return '';
  },
};

export function useExpenses() {
  const [s, set] = useState(state);
  useEffect(() => { subs.add(set); set(state); return () => { subs.delete(set); }; }, []);
  return s;
}

/** Shared amount-input parsing: "₩11,000" → 11000. */
export const parseWon = (v: string) => Number(v.replace(/[^\d]/g, ''));
export const sortByDate = (list: ExpenseRecord[]) => [...list].sort((a, b) => b.date.localeCompare(a.date));
