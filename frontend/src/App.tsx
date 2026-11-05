import { useEffect, useState, type MouseEvent } from 'react';
import { PARENT, parseHash, toHash, type Entry, type Go, type ScreenId } from './nav';
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
import Site from './web/Site';
import MapView from './screens/MapView';
import { LoginScreen, SignupScreen } from './screens/Account';
import { AccountPill } from './ui';

// Matches the 760px breakpoint in index.css: wider = website, narrower = mobile app.
const desktopQuery = window.matchMedia('(min-width: 761px)');
function useDesktop() {
  const [d, setD] = useState(desktopQuery.matches);
  useEffect(() => { const f = () => setD(desktopQuery.matches); desktopQuery.addEventListener('change', f); return () => desktopQuery.removeEventListener('change', f); }, []);
  return d;
}

const SCREEN_META: Record<ScreenId, { title: string }> = {
  home: { title: '청도 한바퀴' },
  places: { title: '청도 장소' },
  placeDetail: { title: '장소 상세' },
  benefits: { title: '여행 혜택' },
  benefitDetail: { title: '혜택 상세' },
  myInput: { title: '내 코스' },
  myResult: { title: '추천 코스' },
  bus: { title: '버스 이동 정보' },
  expense: { title: '여행 경비' },
  expenseAll: { title: '전체 지출' },
  expenseCapture: { title: '경비 등록' },
  expenseEdit: { title: '경비 수정' },
  expenseSettle: { title: '함께 정산' },
  map: { title: '청도 지도' },
  login: { title: '로그인' },
  signup: { title: '회원가입' },
};

const NAV_ITEMS: { label: string; target: ScreenId; icon: string }[] = [
  { label: '홈', target: 'home', icon: '⌂' },
  { label: '장소 탐색', target: 'places', icon: '⌕' },
  { label: '코스 만들기', target: 'myInput', icon: '↗' },
  { label: '버스 정보', target: 'bus', icon: '▰' },
  { label: '여행 혜택', target: 'benefits', icon: '✳' },
  { label: '여행 경비', target: 'expense', icon: '₩' },
];

const MOBILE_NAV_ITEMS: { label: string; target: ScreenId; icon: string; screens: ScreenId[] }[] = [
  { label: '홈', target: 'home', icon: '⌂', screens: ['home', 'bus'] },
  { label: '내 코스', target: 'myInput', icon: '↗', screens: ['myInput', 'myResult'] },
  { label: '경비', target: 'expense', icon: '₩', screens: ['expense', 'expenseAll', 'expenseCapture', 'expenseEdit', 'expenseSettle'] },
  { label: '혜택', target: 'benefits', icon: '✳', screens: ['benefits', 'benefitDetail'] },
  { label: '장소', target: 'places', icon: '⌕', screens: ['places', 'placeDetail', 'map'] },
];

const LINK_TARGETS: Record<string, ScreenId | 'back'> = {
  'Back to home': 'back',
  '홈 열기': 'home',
  '내 코스 열기': 'myInput',
  '경비 열기': 'expense',
  '혜택 열기': 'benefits',
  '장소 열기': 'places',
  '추천 코스 보기': 'myResult',
  '버스 코스 자세히 보기': 'bus',
  '레일바이크 상세': 'benefitDetail',
  '와인터널 상세': 'placeDetail',  // Figma links without an id open the first place
  '전체 지출 열기': 'expenseAll',
  '07 Settlement preview': 'expenseSettle',
  '08 Receipt upload actions': 'expenseCapture',
  '지도 열기': 'map',
  '계정 열기': 'login',
};

export default function App() {
  const [stack, setStack] = useState<Entry[]>(() => [parseHash(window.location.hash)]);
  const top = stack[stack.length - 1] ?? { screen: 'home' as ScreenId };
  const current = top.screen;

  useEffect(() => {
    if (!Array.isArray(window.history.state?.stack)) window.history.replaceState({ stack }, '', toHash(top));
    const handlePopState = (event: PopStateEvent) => {
      const st = event.state?.stack;
      setStack(Array.isArray(st) && st.every((e: unknown) => typeof e === 'object' && e && 'screen' in e) ? st as Entry[] : [parseHash(window.location.hash)]);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const go: Go = (target, id) => {
    if (target === 'back') {
      if (stack.length > 1) return window.history.back();
      // opened directly: go up to the parent list instead of leaving the app
      const up: Entry = { screen: PARENT[current] ?? 'home' };
      if (current === 'home') return;
      setStack([up]);
      window.history.replaceState({ stack: [up] }, '', toHash(up));
      return;
    }
    const next: Entry[] = [...stack, id ? { screen: target, id } : { screen: target }];
    setStack(next);
    window.history.pushState({ stack: next }, '', toHash(next[next.length - 1]));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const element = (event.target as HTMLElement).closest<HTMLElement>('[data-name]');
    const target = element?.dataset.name ? LINK_TARGETS[element.dataset.name] : undefined;
    if (target) go(target);
  };

  const screens: Record<ScreenId, React.ReactNode> = {
    home: <><Home go={go} /><AccountPill className="right-[5.05%] top-[1.2%]" /></>,
    expense: <Expense go={go} />,
    bus: <Bus />,
    myInput: <MyInput go={go} />,
    myResult: <MyResult go={go} />,
    benefits: <Benefits go={go} />,
    benefitDetail: <BenefitDetail />,
    places: <Places go={go} />,
    placeDetail: <PlaceDetail go={go} id={top.id} />,
    expenseAll: <ExpenseAll go={go} />,
    expenseCapture: <ExpenseCapture key="new" go={go} />,
    expenseEdit: <ExpenseCapture key={top.id} go={go} editId={top.id} />,
    expenseSettle: <ExpenseSettle go={go} />,
    map: <MapView go={go} />,
    login: <LoginScreen go={go} />,
    signup: <SignupScreen go={go} />,
  };
  const { title } = SCREEN_META[current];
  const desktop = useDesktop();
  if (desktop) return <Site current={current} id={top.id} go={go} />;

  return (
    <div className="web-app" onClick={onClick}>
      <header className="web-topbar">
        <button className="brand-lockup" data-name="홈 열기" aria-label="청도 한바퀴 홈">
          <span className="brand-mark">청</span>
          <span><strong>청도 한바퀴</strong><small>CHEONGDO TRAVEL</small></span>
        </button>
        <div className="topbar-actions">
          <span className="service-status"><span /> 청도 여행 가이드</span>
          <button className="topbar-back" onClick={() => go('back')} aria-label="이전 화면">← <span>이전</span></button>
        </div>
      </header>

      <div className="web-layout">
        <aside className="web-sidebar" aria-label="주 메뉴">
          <p className="sidebar-caption">여행 메뉴</p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.target}
              className={`sidebar-link ${current === item.target || (item.target === 'myInput' && current === 'myResult') ? 'is-active' : ''}`}
              onClick={() => go(item.target)}
              aria-current={current === item.target ? 'page' : undefined}
            >
              <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <div className="sidebar-note">
            <span className="note-icon">i</span>
            <p>버스 시간은 실시간 도착 정보가 아니에요. 방문 전에 공식 시간표를 확인해 주세요.</p>
          </div>
        </aside>

        <div className="workspace">
          <div className="workspace-content">
            <main className="screen-stage" aria-label={title}>
              {screens[current]}
            </main>
          </div>
          <footer className="workspace-footer">청도 여행을 더 가볍게, 청도 한바퀴</footer>
        </div>
      </div>
      <nav className="mobile-nav" aria-label="주요 메뉴">
        {MOBILE_NAV_ITEMS.map((item) => {
          const active = item.screens.includes(current);
          return (
            <button
              key={item.target}
              className={`mobile-nav-link ${active ? 'is-active' : ''}`}
              onClick={() => go(item.target)}
              aria-current={active ? 'page' : undefined}
            >
              <span className="mobile-nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
