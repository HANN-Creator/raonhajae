import { useState, type MouseEvent } from 'react';
import type { ScreenId } from './nav';
import Home from './screens/Home';
import Expense from './screens/Expense';
import Bus from './screens/Bus';
import MyInput from './screens/MyInput';
import MyResult from './screens/MyResult';
import Benefits from './screens/Benefits';
import BenefitDetail from './screens/BenefitDetail';
import Places from './screens/Places';
import PlaceDetail from './screens/PlaceDetail';
import ExpenseAll from './screens/ExpenseAll';
import ExpenseCapture from './screens/ExpenseCapture';
import ExpenseSettle from './screens/ExpenseSettle';

// Clickable Figma layers are tagged with data-name; map them to destinations.
const LINKS: Record<string, ScreenId | 'back'> = {
  'Back to home': 'back',
  '홈 열기': 'home',
  '내 코스 열기': 'myInput',
  '경비 열기': 'expense',
  '혜택 열기': 'benefits',
  '장소 열기': 'places',
  '추천 코스 보기': 'myResult',
  '버스 코스 자세히 보기': 'bus',
  '레일바이크 상세': 'benefitDetail',
  '와인터널 상세': 'placeDetail',
  '전체 지출 열기': 'expenseAll',
  '07 Settlement preview': 'expenseSettle',
  '08 Receipt upload actions': 'expenseCapture',
};

export default function App() {
  const [stack, setStack] = useState<ScreenId[]>(['home']);
  const cur = stack[stack.length - 1];
  const go = (s: ScreenId | 'back') => {
    setStack(st => (s === 'back' ? (st.length > 1 ? st.slice(0, -1) : ['home']) : [...st, s]));
    window.scrollTo(0, 0);
  };
  const onClick = (e: MouseEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-name]');
    const to = el && LINKS[el.dataset.name!];
    if (to) go(to);
  };
  const screens: Record<ScreenId, React.ReactNode> = {
    home: <Home go={go} />, expense: <Expense />, bus: <Bus />,     myInput: <MyInput go={go} />, myResult: <MyResult />,
    benefits: <Benefits />, benefitDetail: <BenefitDetail />, places: <Places />, placeDetail: <PlaceDetail />,
    expenseAll: <ExpenseAll />, expenseCapture: <ExpenseCapture />, expenseSettle: <ExpenseSettle />,
  };
  return (
    <main onClick={onClick} className="mx-auto w-full max-w-[396px] aspect-[396/876] relative bg-white overflow-hidden">
      {screens[cur]}
    </main>
  );
}
