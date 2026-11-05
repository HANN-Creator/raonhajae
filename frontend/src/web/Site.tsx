// Desktop website: normal flow layout (not the scaled Figma phone frames), same API and routing.
import { useEffect, useState, type ReactNode } from 'react';
import {
  createRecommendation, fallbackRecommendation, getBusSchedule, getPlaces, readRecommendation, tripDateRange, validateTrip,
  saveRecommendation, type BusSchedule, type Place, type PlaceCategory, type TripRequest,
} from '../api';
import { COURSE_PINS, CourseResult, type StoredResult } from '../courseUi';
import { BENEFITS, BENEFITS_URL, BenefitList, checkedLabel } from '../benefits';
import { PlaceInfo } from '../screens/PlaceDetail';
import { AuthForm } from '../screens/Account';
import { auth, useAuth } from '../auth';

import { won } from '../data';
import { useExpenses } from '../expenses';
import { Breakdown, ExpenseForm, ExpenseList, SettlementPanel, StorageNote, useSettlement } from '../expenseUi';
import type { Go, ScreenId } from '../nav';
import TripMap, { courseRoute, visitsVillage, placePins } from '../map';
import MapView from '../screens/MapView';


const HERO = '/assets/63074331-c5ab-4c65-8481-c6e91566771a/8d90d.png';
const BUS_URL = 'https://www.cheongdo.go.kr/traffic/contents/01/bus/bus_time.jsp';
const RAILBIKE_URL = 'https://korean.visitkorea.or.kr/dgtourcard/biz/mbrb/mbrbPtcl.do?mbrbId=51c5ee50-3def-4e99-a318-d8f668d385ff';

const NAV: [ScreenId, string, ScreenId[]][] = [
  ['home', '홈', ['home', 'walk', 'courseStory', 'townView']],
  ['places', '장소', ['places', 'placeDetail']],
  ['map', '지도', ['map']],
  ['myInput', '코스 만들기', ['myInput', 'myResult']],
  ['bus', '버스', ['bus']],
  ['benefits', '혜택', ['benefits', 'benefitDetail']],
  ['expense', '경비', ['expense', 'expenseAll', 'expenseCapture', 'expenseEdit', 'expenseSettle']],
];


/* ---------- shared bits ---------- */
const Btn = ({ children, onClick, ghost, type = 'button', disabled }: { children: ReactNode; onClick?: () => void; ghost?: boolean; type?: 'button' | 'submit'; disabled?: boolean }) => (
  <button type={type} disabled={disabled} onClick={onClick}
    className={`inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold transition disabled:opacity-50 ${ghost ? 'border border-[#e3dcd2] bg-white text-[#7d3d00] hover:bg-[#f7f2eb]' : 'bg-[#7d3d00] text-white hover:bg-[#622e00]'}`}>
    {children}
  </button>
);
const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-[#ece6dd] bg-white p-6 ${className}`}>{children}</div>
);
const PageHead = ({ kicker, title, desc, action }: { kicker: string; title: string; desc?: string; action?: ReactNode }) => (
  <div className="mb-8 flex items-end justify-between gap-6">
    <div>
      <p className="text-xs font-bold tracking-[0.14em] text-[#9e6b3f]">{kicker}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
      {desc && <p className="mt-2 text-sm text-[#6e6c68]">{desc}</p>}
    </div>
    {action}
  </div>
);
const Notice = ({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'error' }) => (
  <p className={`rounded-xl px-4 py-3 text-sm ${tone === 'error' ? 'bg-[#fdecea] text-[#b3261e]' : 'bg-[#f7f4ef] text-[#6e6c68]'}`}>{children}</p>
);

function usePlaces() {
  const [state, setState] = useState<{ places: Place[]; error?: string } | null>(null);
  useEffect(() => { let on = true; getPlaces().then(r => on && setState(r)); return () => { on = false; }; }, []);
  return state;
}

/* ---------- pages ---------- */
function BusStatus() {
  const [b, setB] = useState<{ schedule: BusSchedule | null; error?: string } | null>(null);
  useEffect(() => { let on = true; getBusSchedule().then(r => on && setB(r)); return () => { on = false; }; }, []);
  return <p role="status" className="mt-1 text-xs text-[#77736e]">{!b ? '버스 시간표 확인 중…' : b.schedule
    ? `${b.schedule.status === 'live' ? '청도군 게시 시간표' : '저장된 시간표'}${b.schedule.publishedAt ? `(${b.schedule.publishedAt})` : ''} · ${b.schedule.runs.map(r => r.depart).join(' · ') || '운행편 없음'} 출발 · 실시간 아님`
    : '시간표를 불러오지 못했어요 · 원문에서 확인해 주세요'}</p>;
}

function HomePage({ go, openPlace }: { go: Go; openPlace: (p: Place) => void }) {
  const data = usePlaces();
  return (
    <>
      <section className="relative overflow-hidden rounded-3xl">
        <img src={HERO} alt="와인터널" className="h-[420px] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/0" />
        <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-center p-12 text-white">
          <p className="text-sm font-bold tracking-[0.14em] opacity-80">CHEONGDO TRAVEL</p>
          <h1 className="mt-3 text-5xl font-bold leading-tight tracking-tight">내 시간에 맞춰<br />청도를 한 바퀴</h1>
          <p className="mt-4 text-lg opacity-90">코스부터 이동, 경비까지 한눈에</p>
          <div className="mt-8 flex gap-3">
            <Btn onClick={() => go('myInput')}>내 코스 만들기</Btn>
            <button onClick={() => go('places')} className="h-11 rounded-xl border border-white/60 px-5 text-sm font-bold text-white hover:bg-white/10">장소 둘러보기</button>
          </div>
        </div>
      </section>

      <section className="mt-12 grid grid-cols-5 gap-4">
        {([['bus', '버스 코스', '7번 버스 시간표'], ['walk', '산책길', '걷기 좋은 곳'], ['benefits', '할인 혜택', '관광주민증'], ['expense', '여행 경비', '함께 정산'], ['places', '청도 장소', '볼거리 · 체험']] as const).map(([to, t, s]) => (
          <button key={t} onClick={() => go(to)} className="rounded-2xl border border-[#ece6dd] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#d9c7b3]">
            <p className="font-bold">{t}</p><p className="mt-1 text-sm text-[#6e6c68]">{s}</p>
          </button>
        ))}
      </section>

      <section className="mt-14">
        <div className="mb-5 flex items-end justify-between">
          <div><p className="text-sm text-[#6e6c68]">언제 도착하든, 내 여행의 속도로</p><h2 className="mt-1 text-2xl font-bold">청도에서 보내는 반나절</h2></div>
          <button onClick={() => go('places')} className="text-sm font-bold text-[#7d3d00]">전체 보기 →</button>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-6">
          {([['courseStory', STORY.course.photo, '7번 버스로 떠나는 코스', '와인터널과 송금마을'], ['townView', STORY.town.photo, '천천히 둘러보기', '청도읍 풍경']] as const).map(([to, img, k, t]) => (
            <button key={to} onClick={() => go(to)} className="group relative h-64 overflow-hidden rounded-2xl text-left">
              <img src={img} alt="" className="size-full object-cover transition group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-5 left-6 text-white"><span className="block text-sm opacity-90">{k}</span><span className="block text-2xl font-bold">{t}</span></span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
          {(data?.places ?? []).slice(0, 3).map(p => <PlaceCard key={p.id} p={p} onOpen={() => openPlace(p)} />)}
          {!data && [0, 1, 2].map(i => <div key={i} className="h-72 animate-pulse rounded-2xl bg-[#f1ede7]" />)}
        </div>
      </section>

      <section className="mt-14">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#6e6c68]">오늘의 추천 동선 · 7번 버스 + 도보</p>
            <h2 className="mt-1 text-xl font-bold">와인터널 · 송금마을 반나절</h2>
            <p className="mt-3 text-sm text-[#24211d]">청도역 → 와인터널 → 송금마을</p>
            <BusStatus />
          </div>
          <div className="flex gap-3"><Btn ghost onClick={() => go('bus')}>버스 보기</Btn><Btn onClick={() => go('myInput')}>내 시간에 맞추기</Btn></div>
        </Card>
      </section>
    </>
  );
}

const PlaceCard = ({ p, onOpen }: { p: Place; onOpen: () => void }) => (
  <button onClick={onOpen} className="group overflow-hidden rounded-2xl border border-[#ece6dd] bg-white text-left transition hover:-translate-y-0.5 hover:shadow-lg">
    <div className="h-48 overflow-hidden bg-[#f1ede7]">{p.imageUrl && <img src={p.imageUrl} alt={p.name} className="size-full object-cover transition group-hover:scale-105" />}</div>
    <div className="p-5">
      <p className="text-xs font-bold text-[#9e6b3f]">{p.category} · {p.area}</p>
      <p className="mt-1 text-lg font-bold">{p.name}</p>
      <p className="mt-1 line-clamp-2 text-sm text-[#6e6c68]">{p.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">{p.tags.map(t => <span key={t} className="rounded-full bg-[#f7f2eb] px-2.5 py-1 text-xs text-[#7d3d00]">{t}</span>)}</div>
    </div>
  </button>
);

function PlacesPage({ openPlace }: { openPlace: (p: Place) => void }) {
  const data = usePlaces();
  const [cat, setCat] = useState<'전체' | PlaceCategory>('전체');
  const [q, setQ] = useState('');
  const list = (data?.places ?? []).filter(p => (cat === '전체' || p.category === cat) && `${p.name} ${p.area} ${p.description}`.includes(q.trim()));
  return (
    <>
      <PageHead kicker="PLACES" title="청도 장소" desc="동선에 넣을 장소를 골라보세요" />
      <div className="mb-6 flex items-center gap-3">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="장소 이름이나 지역 검색" aria-label="장소 검색"
          className="h-11 w-80 rounded-xl border border-[#e3dcd2] bg-white px-4 text-sm outline-none focus:border-[#7d3d00]" />
        {(['전체', '체험', '볼거리', '산책'] as const).map(c => (
          <button key={c} onClick={() => setCat(c)} className={`h-11 rounded-full px-5 text-sm font-bold ${cat === c ? 'bg-[#7d3d00] text-white' : 'border border-[#e3dcd2] bg-white text-[#24211d]'}`}>{c}</button>
        ))}
      </div>
      {data?.error && <div className="mb-6"><Notice>{data.error}</Notice></div>}
      {!!list.length && <div className="mb-6"><TripMap pins={placePins(list)} className="h-72"
        onSelect={id => { const p = list.find(x => x.id === id); if (p) openPlace(p); }} /></div>}
      <div className="grid grid-cols-3 gap-6">
        {!data && [0, 1, 2].map(i => <div key={i} className="h-72 animate-pulse rounded-2xl bg-[#f1ede7]" />)}
        {list.map(p => <PlaceCard key={p.id} p={p} onOpen={() => openPlace(p)} />)}
      </div>
      {data && !list.length && <p className="py-16 text-center text-[#6e6c68]">조건에 맞는 장소가 없어요</p>}
      <p className="mt-8 text-xs text-[#9c978f]">장소 정보는 공개 관광 자료 기준 · 방문 전 확인</p>
    </>
  );
}

function CoursePage({ go }: { go: Go }) {
  const stored = readRecommendation();
  const range = tripDateRange();
  const [req, setReq] = useState<TripRequest>(() => {
    const r = stored?.request;
    return r && r.visitDate >= range.min && r.visitDate <= range.max ? r : { visitDate: range.min, arrivalTime: '10:50', pace: 'easy' };
  });
  const [result, setResult] = useState<StoredResult | null>(stored);
  const [busy, setBusy] = useState(false);
  const [invalid, setInvalid] = useState('');
  const submit = async () => {
    const err = validateTrip(req);
    setInvalid(err);
    if (err || busy) return;
    setBusy(true);
    const r = await createRecommendation(req);
    saveRecommendation(r.recommendation, req, r.usingFallback, r.error);
    setResult({ ...r, request: req });
    setBusy(false);
  };
  const focusForm = () => document.getElementById('arrival-time')?.focus();
  return (
    <>
      <PageHead kicker="MY COURSE" title="내 시간에 맞는 코스" desc="도착 시간에 맞는 여행 동선을 찾아드려요." />
      <div className="grid grid-cols-[380px_1fr] gap-8">
        <Card>
          <form onSubmit={e => { e.preventDefault(); submit(); }} className="space-y-6" noValidate>
            <label className="block text-sm font-bold">여행 날짜
              <input type="date" required min={range.min} max={range.max} value={req.visitDate} onChange={e => setReq({ ...req, visitDate: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[#e3dcd2] px-3 font-normal" />
              <span className="mt-1 block text-xs font-normal text-[#6e6c68]">오늘부터 1년 이내 · 한국 시간 기준</span>
            </label>
            <label className="block text-sm font-bold">청도 도착 시각
              <input id="arrival-time" type="time" required value={req.arrivalTime} onChange={e => setReq({ ...req, arrivalTime: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[#e3dcd2] px-3 font-normal" />
              <span className="mt-1 block text-xs font-normal text-[#6e6c68]">승차 위치로 이동할 여유 20분 이상을 더해요.</span>
            </label>
            <fieldset><legend className="text-sm font-bold">여행 속도</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {([['easy', '가볍게 둘러보기', '핵심 장소를 차례로'], ['slow', '여유롭게 둘러보기', '한 장소에서 더 오래']] as const).map(([v, t, s]) => (
                  <button type="button" key={v} onClick={() => setReq({ ...req, pace: v })} aria-pressed={req.pace === v}
                    className={`rounded-xl border p-3 text-left ${req.pace === v ? 'border-[#7d3d00] bg-[#f7f0e7]' : 'border-[#e3dcd2]'}`}>
                    <p className="text-sm font-bold">{req.pace === v ? '✓ ' : ''}{t}</p><p className="text-xs text-[#6e6c68]">{s}</p>
                  </button>
                ))}
              </div>
            </fieldset>
            {invalid && <Notice tone="error">{invalid}</Notice>}
            <Btn type="submit" disabled={busy}>{busy ? 'AI가 코스를 고르는 중… (최대 30초)' : '내 시간에 맞는 코스 보기'}</Btn>
            <p className="text-xs text-[#9c978f]">청도군 공개 시간표 기준 · 실시간 도착정보 아님</p>
          </form>
        </Card>
        <Card>
          {busy && <p className="py-20 text-center text-[#6e6c68]" role="status">청도군 시간표와 날씨를 보고 AI가 코스를 고르는 중… 최대 30초쯤 걸려요.</p>}
          {!busy && !result && <p className="py-20 text-center text-[#6e6c68]">왼쪽에서 조건을 고르고 코스를 찾아보세요</p>}
          {!busy && result && <CourseResult result={result} onRetry={submit} onChange={focusForm} onBus={() => go('bus')} retrying={busy} />}
        </Card>
      </div>
    </>
  );
}

function BusPage() {
  const [s, setS] = useState<{ schedule: BusSchedule | null; error?: string } | null>(null);
  useEffect(() => { let on = true; getBusSchedule().then(r => on && setS(r)); return () => { on = false; }; }, []);
  const rec = readRecommendation()?.recommendation ?? fallbackRecommendation;
  return (
    <>
      <PageHead kicker="BUS" title="7번 버스 코스" desc="청도역 → 와인터널 → 송금마을"
        action={<a href={BUS_URL} target="_blank" rel="noreferrer"><Btn ghost>시간표 원문 ↗</Btn></a>} />
      <div className="grid grid-cols-[1fr_360px] gap-8">
        <Card>
          <h2 className="text-lg font-bold">운행 시간표</h2>
          {!s && <p className="py-10 text-center text-[#6e6c68]">버스 시간표를 불러오는 중…</p>}
          {s?.error && <div className="mt-4"><Notice tone="error">{s.error}</Notice></div>}
          {s?.schedule && <>
            <p className="mt-1 text-xs text-[#9c978f]">{s.schedule.status === 'live' ? '청도군 게시 시간표' : '저장 시간표'}{s.schedule.publishedAt ? ` · ${s.schedule.publishedAt}` : ''}</p>
            <table className="mt-4 w-full text-sm">
              <thead className="text-left text-[#6e6c68]"><tr className="border-b border-[#ece6dd]"><th className="py-2">청도역 출발</th><th>와인터널 도착</th><th>귀환 출발</th><th>청도역 도착</th></tr></thead>
              <tbody>{s.schedule.runs.map((r, i) => (
                <tr key={i} className="border-b border-[#f3efe9] font-bold"><td className="py-3">{r.depart}</td><td>{r.arrive}</td><td>{r.returnDepart}</td><td>{r.returnArrive}</td></tr>
              ))}</tbody>
            </table>
            {!s.schedule.runs.length && <p className="py-6 text-center text-[#6e6c68]">운행편 없음</p>}
          </>}
          <h2 className="mt-8 text-lg font-bold">코스 지도</h2>
          <div className="mt-3"><TripMap pins={COURSE_PINS} route={courseRoute(visitsVillage(readRecommendation()?.recommendation.stops ?? []))} className="h-80" /></div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">이렇게 이동해요</h2>
          <ol className="mt-4 space-y-4 text-sm">
            {(rec.stops.length ? rec.stops : [{ title: '청도역', description: '7번 버스 승차' }, { title: '와인터널', description: '하차 후 관람' }, { title: '송금마을', description: '도보 연결' }]).map((st, i) => (
              <li key={i} className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#7d3d00] text-xs text-white">{i + 1}</span>
                <div><p className="font-bold">{st.title}</p><p className="text-[#6e6c68]">{st.description}</p></div></li>
            ))}
          </ol>
          <p className="mt-6 text-xs text-[#9c978f]">실시간 도착 정보가 아니에요. 방문 전 공식 시간표를 확인해 주세요.</p>
        </Card>
      </div>
    </>
  );
}

function BenefitsPage({ go }: { go: Go }) {
  return (
    <>
      <PageHead kicker="BENEFITS" title="여행 혜택" desc="디지털 관광주민증으로 받을 수 있는 혜택"
        action={<a href={BENEFITS_URL} target="_blank" rel="noreferrer"><Btn>관광주민증 혜택 확인하기 ↗</Btn></a>} />
      <BenefitList grid onDetail={() => go('benefitDetail')} />
    </>
  );
}

function BenefitDetailPage() {
  return (
    <>
      <PageHead kicker="체험 · 관광주민증" title="청도 레일바이크" desc="청도읍 하지길 46-51"
        action={<a href={RAILBIKE_URL} target="_blank" rel="noreferrer"><Btn>공식 혜택 페이지 열기 ↗</Btn></a>} />
      <div className="grid grid-cols-2 gap-8">
        <Card>
          <p className="text-3xl font-bold text-[#7d3d00]">탑승권 20% 할인</p>
          <p className="mt-2 text-sm text-[#4c4945]"><b>적용 조건</b> · {BENEFITS[0].condition}</p>
          <p className="mt-1 text-xs text-[#9c978f]">{checkedLabel(BENEFITS[0])}</p>
          <h2 className="mt-8 text-lg font-bold">이렇게 사용해요</h2>
          <ol className="mt-4 space-y-3 text-sm">
            {['디지털 관광주민증 쿠폰 발급', '현장 QR 스캔', '직원에게 쿠폰 확인', '할인 금액으로 결제'].map((t, i) => (
              <li key={t} className="flex gap-3"><span className="grid size-6 place-items-center rounded-full bg-[#f7f0e7] text-xs font-bold text-[#7d3d00]">{i + 1}</span>{t}</li>
            ))}
          </ol>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">이용 전 확인</h2>
          <dl className="mt-4 grid grid-cols-[80px_1fr] gap-y-3 text-sm">
            <dt className="text-[#6e6c68]">운영시간</dt><dd className="font-bold">09:00–18:00</dd>
            <dt className="text-[#6e6c68]">문의</dt><dd><a href="tel:054-373-2426" className="font-bold">054-373-2426</a></dd>
            <dt className="text-[#6e6c68]">예약</dt><dd>공식 안내에 별도 예약은 불필요</dd>
            <dt className="text-[#6e6c68]">준비</dt><dd>현장 위치와 주민증 발급 여부 확인</dd>
          </dl>
          <p className="mt-6 text-xs text-[#9c978f]">최신 운영·할인 조건은 공식 페이지에서 다시 확인</p>
        </Card>
      </div>
    </>
  );
}

function ExpensePage({ go, editId, mode }: { go: Go; editId?: string; mode: ScreenId }) {
  const { expenses, people } = useExpenses();
  const s = useSettlement();
  const formOpen = mode === 'expenseCapture' || mode === 'expenseEdit';
  return (
    <>
      <PageHead kicker="EXPENSES" title="여행 경비" desc={`청도 여행 · ${people.join(' · ')}`}
        action={<Btn onClick={() => go('expenseCapture')}>+ 경비 등록</Btn>} />
      <div className="grid grid-cols-3 gap-6">
        <Card><p className="text-sm text-[#6e6c68]">총 지출</p><p className="mt-1 text-3xl font-bold">{won(expenses.reduce((n, e) => n + e.amount, 0))}</p><p className="mt-1 text-sm text-[#6e6c68]">{expenses.length}건</p></Card>
        <Card><p className="text-sm text-[#6e6c68]">1인 정산 금액</p><p className="mt-1 text-3xl font-bold text-[#7d3d00]">{won(s.share)}</p><p className="mt-1 text-sm text-[#6e6c68]">정산 대상 {won(s.total)} · 개인 {won(s.personal)} 제외</p></Card>
        <Card className="bg-[#f7f0e7]"><p className="text-sm text-[#6e6c68]">정산하려면</p>
          {s.transfers.length ? s.transfers.slice(0, 3).map((t, i) => <p key={i} className="mt-1 text-xl font-bold">{t.from} → {t.to} <span className="text-[#7d3d00]">{won(t.amount)}</span></p>)
            : <p className="mt-1 text-xl font-bold">보낼 돈이 없어요</p>}
        </Card>
      </div>
      <div className="mt-6 grid grid-cols-[1fr_380px] gap-6">
        <Card>
          <h2 className="mb-4 text-lg font-bold">전체 지출 <span className="text-sm font-normal text-[#6e6c68]">행을 누르면 수정해요</span></h2>
          <ExpenseList onEdit={id => go('expenseEdit', id)} />
          <div className="mt-4"><StorageNote /></div>
        </Card>
        <div className="space-y-6">
          {formOpen && <Card>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">{editId ? '경비 수정' : '경비 등록'}</h2>
              <button className="text-sm text-[#6e6c68]" onClick={() => go('expense')} aria-label="닫기">닫기 ✕</button></div>
            <ExpenseForm key={editId ?? 'new'} editId={editId} onDone={() => go('expense')} />
          </Card>}
          <Card><h2 className="mb-4 text-lg font-bold">항목별 · 일자별</h2><Breakdown expenses={expenses} /></Card>
          <Card><h2 className="mb-4 text-lg font-bold">함께 정산</h2><SettlementPanel /></Card>
        </div>
      </div>
    </>
  );
}

function HeaderAccount({ go }: { go: Go }) {
  const { user } = useAuth();
  return user
    ? <div className="ml-auto flex items-center gap-3 text-sm"><button onClick={() => go('login')} className="font-bold">{user.name}님</button>
        <button onClick={() => auth.logout()} className="text-[#6e6c68] hover:text-[#24211d]">로그아웃</button></div>
    : <div className="ml-auto flex items-center gap-2 text-sm"><button onClick={() => go('login')} className="rounded-lg px-3 py-2 font-bold text-[#6e6c68] hover:text-[#24211d]">로그인</button>
        <button onClick={() => go('signup')} className="rounded-lg bg-[#7d3d00] px-4 py-2 font-bold text-white">회원가입</button></div>;
}

const AuthPage = ({ mode, go }: { mode: 'login' | 'signup'; go: Go }) => (
  <div className="mx-auto max-w-md">
    <PageHead kicker="ACCOUNT" title={mode === 'login' ? '로그인' : '회원가입'} desc="로그인하면 경비 기록을 계정별로 따로 관리할 수 있어요." />
    <Card><AuthForm mode={mode} go={go} /></Card>
  </div>
);

const STORY = {
  course: { photo: '/assets/a4aec938-4fa3-4a25-82cb-aa0aa330f13d/866bb.png', credit: '사진 Roadgo · Wikimedia Commons' },
  town: { photo: '/assets/1de36c93-54d2-4d50-8c21-a76f236cac85/37863.png', credit: '사진 한국학중앙연구원 · Wikimedia Commons' },
};

const Hero = ({ src, alt, credit }: { src: string; alt: string; credit: string }) => (
  <div className="relative overflow-hidden rounded-3xl">
    <img src={src} alt={alt} className="h-[360px] w-full object-cover" />
    <span className="absolute bottom-3 right-4 text-[11px] text-white drop-shadow">{credit}</span>
  </div>
);
const RowLink = ({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) => (
  <button onClick={onClick} className="flex w-full items-center justify-between rounded-2xl border border-[#ece6dd] bg-white p-5 text-left hover:border-[#d9c7b3]">
    <span><span className="block font-bold">{title}</span><span className="block text-sm text-[#6e6c68]">{desc}</span></span>
    <span className="text-xl text-[#7d3d00]" aria-hidden>→</span>
  </button>
);

/** 74:2 산책길 */
function WalkPage({ go }: { go: Go }) {
  return (
    <>
      <PageHead kicker="WALK" title="와인터널에서 송금마을까지" desc="버스에서 내려 마을 쪽으로 천천히 걸어봐요. · 도보 약 10~15분" />
      <div className="grid grid-cols-[1.4fr_1fr] gap-8">
        <div className="space-y-2">
          <TripMap pins={COURSE_PINS.filter(p => p.id !== 'station')} route={courseRoute().filter(s => s.walk)} className="h-[420px]" />
          <p className="text-xs text-[#9c978f]">실제 도보길과 진입로는 현장에서 확인해 주세요. · 지도는 위치와 방향을 설명하는 개략 자료입니다.</p>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-bold">이 길에서 만나요</h2>
          <RowLink title="와인터널 · 송금마을" desc="버스 하차 후 이어지는 산책 코스" onClick={() => go('courseStory')} />
          <RowLink title="청도읍에서 더 둘러보기" desc="방문할 장소를 골라 천천히 돌아봐요" onClick={() => go('townView')} />
        </div>
      </div>
    </>
  );
}

/** 69:22 와인터널·송금마을 상세 */
function CourseStoryPage({ go }: { go: Go }) {
  const stops = [['청도역 인근', '7번 버스 승차 위치를 확인해요.'], ['와인터널', '남성현(와인터널)에서 내려 둘러봐요.'], ['송금마을', '도보로 산책한 뒤 귀환 버스를 확인해요.']];
  return (
    <>
      <Hero src={STORY.course.photo} alt="와인터널 내부" credit={STORY.course.credit} />
      <div className="mt-10 grid grid-cols-[1.2fr_1fr] gap-10">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-[#9e6b3f]">BUS &amp; WALK · 반나절 코스</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight">7번 버스로 이어지는<br />청도의 반나절</h1>
          <p className="mt-4 leading-7 text-[#6e6c68]">청도역 인근에서 출발해 와인터널을 둘러보고 송금마을까지 걸어보는 코스예요.<br />도착 시각에 맞는 왕복 버스는 내 코스에서 확인해요.</p>
          <p className="mt-4 flex gap-5 text-sm font-bold text-[#7d3d00]"><span>🚌 7번 버스</span><button onClick={() => go('walk')}>🚶 도보 이동 →</button></p>
          <div className="mt-8 flex gap-3"><Btn onClick={() => go('myInput')}>내 코스 만들기</Btn><Btn ghost onClick={() => go('bus')}>버스 동선 보기</Btn></div>
          <p className="mt-3 text-xs text-[#9c978f]">공개 시간표 기준 · 실시간 운행 정보 아님</p>
        </div>
        <Card>
          <h2 className="text-lg font-bold">이렇게 둘러봐요</h2>
          <ol className="mt-4 space-y-4">{stops.map(([n, d], i) => (
            <li key={n} className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f7f0e7] text-sm font-bold text-[#7d3d00]">{i + 1}</span>
              <span><span className="block font-bold">{n}</span><span className="block text-sm text-[#6e6c68]">{d}</span></span></li>
          ))}</ol>
          <div className="mt-5"><TripMap pins={COURSE_PINS} route={courseRoute()} className="h-56" /></div>
        </Card>
      </div>
    </>
  );
}

/** 69:127 청도읍 풍경 상세 */
function TownViewPage({ go }: { go: Go }) {
  return (
    <>
      <Hero src={STORY.town.photo} alt="산 사이로 펼쳐진 청도읍 전경" credit={STORY.town.credit} />
      <div className="mt-10 grid grid-cols-[1.2fr_1fr] gap-10">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-[#9e6b3f]">SLOW TRAVEL · 청도읍</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight">청도읍을<br />천천히 바라보는 시간</h1>
          <p className="mt-4 leading-7 text-[#6e6c68]">산 사이로 펼쳐진 마을의 풍경을 보며 청도 여행을 시작해 보세요.<br />마음에 드는 장소를 골라 천천히 둘러봐요.</p>
          <p className="mt-5 rounded-xl bg-[#f7f4ef] px-4 py-3 text-xs leading-5 text-[#6e6c68]">이 사진은 청도읍 전경을 담은 자료 사진입니다. 촬영 지점까지의 길 안내는 제공하지 않습니다.</p>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-bold">청도읍에서 들를 곳</h2>
          <RowLink title="청도 레일바이크" desc="청도읍 하지길 46-51 · 체험 및 혜택 확인" onClick={() => go('placeDetail', 'rail-bike')} />
          <h2 className="pt-4 text-lg font-bold">여행을 이어가요</h2>
          <RowLink title="청도 장소 둘러보기" desc="볼거리와 체험을 골라보세요" onClick={() => go('places')} />
          <RowLink title="도착 시각에 맞는 코스 찾기" desc="7번 버스 왕복 동선을 확인해요" onClick={() => go('myInput')} />
        </div>
      </div>
    </>
  );
}

/* ---------- shell ---------- */
export default function Site({ current, id, go }: { current: ScreenId; id?: string; go: Go }) {
  const openPlace = (p: Place) => go('placeDetail', p.id);
  const page: Record<ScreenId, ReactNode> = {
    home: <HomePage go={go} openPlace={openPlace} />,
    map: <MapView go={go} desktop onOpenPlace={openPlace} />,
    walk: <WalkPage go={go} />, courseStory: <CourseStoryPage go={go} />, townView: <TownViewPage go={go} />,
    login: <AuthPage mode="login" go={go} />, signup: <AuthPage mode="signup" go={go} />,
    places: <PlacesPage openPlace={openPlace} />, placeDetail: <PlaceInfo id={id} go={go} wide />,
    myInput: <CoursePage go={go} />, myResult: <CoursePage go={go} />, bus: <BusPage />,
    benefits: <BenefitsPage go={go} />, benefitDetail: <BenefitDetailPage />,
    expense: <ExpensePage go={go} mode="expense" />, expenseAll: <ExpensePage go={go} mode="expenseAll" />,
    expenseCapture: <ExpensePage go={go} mode="expenseCapture" />, expenseEdit: <ExpensePage go={go} mode="expenseEdit" editId={id} />,
    expenseSettle: <ExpensePage go={go} mode="expenseSettle" />,
  };
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#24211d]">
      <header className="sticky top-0 z-20 border-b border-[#ece6dd] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-10 px-8">
          <button onClick={() => go('home')} className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-[#7d3d00] font-bold text-white">청</span>
            <span className="text-lg font-bold tracking-tight">청도 한바퀴</span>
          </button>
          <nav className="flex gap-1">
            {NAV.map(([to, label, group]) => (
              <button key={to} onClick={() => go(to)} aria-current={group.includes(current) ? 'page' : undefined}
                className={`rounded-lg px-4 py-2 text-sm font-bold ${group.includes(current) ? 'bg-[#f7f0e7] text-[#7d3d00]' : 'text-[#6e6c68] hover:text-[#24211d]'}`}>{label}</button>
            ))}
          </nav>
          <HeaderAccount go={go} />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-8 py-10">{page[current]}</main>
      <footer className="border-t border-[#ece6dd] py-8 text-center text-xs text-[#9c978f]">청도 여행을 더 가볍게, 청도 한바퀴 · 버스 시간은 실시간 도착 정보가 아니에요.</footer>
    </div>
  );
}
