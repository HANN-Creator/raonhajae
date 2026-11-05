import { useEffect, useState, type MouseEvent } from 'react';
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

const SCREEN_META: Record<ScreenId, { title: string; description: string; group: string }> = {
  home: { title: '청도 한바퀴', description: '청도에서 보내는 시간을 한곳에서 준비해요.', group: '둘러보기' },
  places: { title: '청도 장소', description: '공공 관광지 정보를 검색하고 관심 장소를 찾아보세요.', group: '둘러보기' },
  placeDetail: { title: '장소 상세', description: '주소와 방문 정보를 확인해요.', group: '둘러보기' },
  benefits: { title: '여행 혜택', description: '여행 중 활용할 수 있는 혜택 정보를 둘러보세요.', group: '둘러보기' },
  benefitDetail: { title: '혜택 상세', description: '혜택 이용 전 적용 조건을 확인하세요.', group: '둘러보기' },
  myInput: { title: '내 코스', description: '도착 시간과 여행 속도에 맞춰 코스를 추천받아요.', group: '여행 준비' },
  myResult: { title: '추천 코스', description: '서버가 확인한 시간표와 이동 순서를 살펴보세요.', group: '여행 준비' },
  bus: { title: '버스 이동 정보', description: '청도군 게시 시간표와 추천 코스의 이동 정보를 확인해요.', group: '여행 준비' },
  expense: { title: '여행 경비', description: '여행 지출을 살펴보고 함께 정산할 수 있어요.', group: '여행 기록' },
  expenseAll: { title: '전체 지출', description: '여행 중 기록한 지출 내역을 확인해요.', group: '여행 기록' },
  expenseCapture: { title: '영수증 인식', description: '사진에서 지출 정보를 읽어 입력을 도와드려요.', group: '여행 기록' },
  expenseSettle: { title: '함께 정산', description: '함께 사용한 금액을 기준으로 정산 내용을 확인해요.', group: '여행 기록' },
};

const NAV_ITEMS: { label: string; target: ScreenId; icon: string }[] = [
  { label: '홈', target: 'home', icon: '⌂' },
  { label: '장소 탐색', target: 'places', icon: '⌕' },
  { label: '코스 만들기', target: 'myInput', icon: '↗' },
  { label: '버스 정보', target: 'bus', icon: '▰' },
  { label: '여행 혜택', target: 'benefits', icon: '✳' },
  { label: '여행 경비', target: 'expense', icon: '₩' },
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
  '와인터널 상세': 'placeDetail',
  '전체 지출 열기': 'expenseAll',
  '07 Settlement preview': 'expenseSettle',
  '08 Receipt upload actions': 'expenseCapture',
};

const screenFromHash = (hash: string): ScreenId =>
  Object.hasOwn(SCREEN_META, hash.replace(/^#\/?/, ''))
    ? hash.replace(/^#\/?/, '') as ScreenId
    : 'home';

export default function App() {
  const [stack, setStack] = useState<ScreenId[]>(() => [screenFromHash(window.location.hash)]);
  const current = stack[stack.length - 1] ?? 'home';

  useEffect(() => {
    if (!window.history.state?.screen) {
      window.history.replaceState({ screen: current, stack }, '', `#${current}`);
    }
    const handlePopState = (event: PopStateEvent) => {
      if (Array.isArray(event.state?.stack) && event.state.stack.every((entry: unknown) => typeof entry === 'string')) {
        setStack(event.state.stack as ScreenId[]);
      } else {
        setStack([screenFromHash(window.location.hash)]);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const go = (target: ScreenId | 'back') => {
    if (target === 'back') {
      if (stack.length > 1) window.history.back();
      else if (current !== 'home') {
        const nextStack: ScreenId[] = ['home'];
        setStack(nextStack);
        window.history.pushState({ screen: 'home', stack: nextStack }, '', '#home');
      }
      return;
    }
    const nextStack: ScreenId[] = [...stack, target];
    setStack(nextStack);
    window.history.pushState({ screen: target, stack: nextStack }, '', `#${target}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const element = (event.target as HTMLElement).closest<HTMLElement>('[data-name]');
    const target = element?.dataset.name ? LINK_TARGETS[element.dataset.name] : undefined;
    if (target) go(target);
  };

  const screens: Record<ScreenId, React.ReactNode> = {
    home: <Home go={go} />,
    expense: <Expense />,
    bus: <Bus />,
    myInput: <MyInput go={go} />,
    myResult: <MyResult />,
    benefits: <Benefits />,
    benefitDetail: <BenefitDetail />,
    places: <Places />,
    placeDetail: <PlaceDetail />,
    expenseAll: <ExpenseAll />,
    expenseCapture: <ExpenseCapture />,
    expenseSettle: <ExpenseSettle />,
  };
  const meta = SCREEN_META[current];

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
          <div className="workspace-heading">
            <div>
              <p className="breadcrumbs">청도 한바퀴 <span>/</span> {meta.group}</p>
              <h1>{meta.title}</h1>
              <p>{meta.description}</p>
            </div>
            <button className="workspace-primary" onClick={() => go('myInput')}>내 코스 만들기 <span>→</span></button>
          </div>

          <div className="workspace-content">
            <main className="screen-stage" aria-label={meta.title}>
              {screens[current]}
            </main>
            <aside className="workspace-aside">
              <section className="welcome-card">
                <p className="card-kicker">PLAN YOUR DAY</p>
                <h2>내 여행에 맞는<br />청도 하루를 찾아요</h2>
                <p>도착 시각을 입력하면 서버가 확인한 버스 시간표를 바탕으로 이동 가능한 코스를 추천해요.</p>
                <button onClick={() => go('myInput')}>코스 추천 받기 <span>↗</span></button>
              </section>
              <section className="quick-links">
                <h2>빠른 이동</h2>
                {NAV_ITEMS.slice(1, 5).map((item) => (
                  <button key={item.target} onClick={() => go(item.target)}>
                    <span className="quick-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    <span className="quick-arrow">→</span>
                  </button>
                ))}
              </section>
              <p className="aside-footnote">여행 정보는 방문 전 공식 안내에서 최신 내용을 확인해 주세요.</p>
            </aside>
          </div>
          <footer className="workspace-footer">청도 여행을 더 가볍게, 청도 한바퀴</footer>
        </div>
      </div>
    </div>
  );
}
