// Desktop website: normal flow layout (not the scaled Figma phone frames), same API and routing.
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  createRecommendation, fallbackRecommendation, getBusSchedule, getPlaces, readRecommendation,
  recognizeReceipt, saveRecommendation, type BusSchedule, type Place, type PlaceCategory, type TripRequest,
} from '../api';
import { EXPENSES, PEOPLE, won } from '../data';
import { settle } from '../settle';
import type { Go, ScreenId } from '../nav';

const HERO = '/assets/63074331-c5ab-4c65-8481-c6e91566771a/8d90d.png';
const BUS_URL = 'https://www.cheongdo.go.kr/traffic/contents/01/bus/bus_time.jsp';
const BENEFITS_URL = 'https://korean.visitkorea.or.kr/dgtourcard/biz/regn/regnMain.do?mtpcDoCd=47&signguCd=47820';
const RAILBIKE_URL = 'https://korean.visitkorea.or.kr/dgtourcard/biz/mbrb/mbrbPtcl.do?mbrbId=51c5ee50-3def-4e99-a318-d8f668d385ff';

const NAV: [ScreenId, string, ScreenId[]][] = [
  ['home', '홈', ['home']],
  ['places', '장소', ['places', 'placeDetail']],
  ['myInput', '코스 만들기', ['myInput', 'myResult']],
  ['bus', '버스', ['bus']],
  ['benefits', '혜택', ['benefits', 'benefitDetail']],
  ['expense', '경비', ['expense', 'expenseAll', 'expenseCapture', 'expenseSettle']],
];

const BENEFITS = [
  { id: 'railbike', cat: '체험', name: '청도 레일바이크', deal: '탑승권 20% 할인', how: '현장 QR 발급 후 직원 확인', detail: true },
  { id: 'comedy', cat: '관람', name: '한국코미디타운', deal: '입장 1천원 · 공연 5천원 할인', how: '디지털 관광주민증 제시' },
  { id: 'ogamz', cat: '식음료', name: '오감즈카페', deal: '음료 10% 할인', how: '디지털 관광주민증 제시' },
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
        {([['bus', '버스 코스', '7번 버스 시간표'], ['places', '산책길', '걷기 좋은 곳'], ['benefits', '할인 혜택', '관광주민증'], ['expense', '여행 경비', '함께 정산'], ['places', '청도 장소', '볼거리 · 체험']] as const).map(([to, t, s]) => (
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
      <div className="grid grid-cols-3 gap-6">
        {!data && [0, 1, 2].map(i => <div key={i} className="h-72 animate-pulse rounded-2xl bg-[#f1ede7]" />)}
        {list.map(p => <PlaceCard key={p.id} p={p} onOpen={() => openPlace(p)} />)}
      </div>
      {data && !list.length && <p className="py-16 text-center text-[#6e6c68]">조건에 맞는 장소가 없어요</p>}
      <p className="mt-8 text-xs text-[#9c978f]">장소 정보는 공개 관광 자료 기준 · 방문 전 확인</p>
    </>
  );
}

function PlaceDetailPage({ place, go }: { place: Place | null; go: Go }) {
  if (!place) return <Notice>장소를 먼저 선택해 주세요.</Notice>;
  return (
    <div className="grid grid-cols-[1.3fr_1fr] gap-10">
      <img src={place.imageUrl} alt={place.name} className="h-[460px] w-full rounded-3xl object-cover" />
      <div>
        <p className="text-sm font-bold text-[#9e6b3f]">{place.category} · {place.area}</p>
        <h1 className="mt-2 text-4xl font-bold">{place.name}</h1>
        <p className="mt-3 text-[#6e6c68]">{place.description}</p>
        <dl className="mt-8 grid grid-cols-[80px_1fr] gap-y-3 border-y border-[#ece6dd] py-6 text-sm">
          <dt className="text-[#6e6c68]">주소</dt><dd className="font-bold">{place.address ?? place.area}</dd>
          {place.phone && <><dt className="text-[#6e6c68]">문의</dt><dd><a href={`tel:${place.phone}`} className="font-bold">{place.phone}</a></dd></>}
        </dl>
        <p className="mt-4 text-xs text-[#9c978f]">운영시간과 입장료는 방문 전 현장에서 확인</p>
        <div className="mt-8 flex gap-3"><Btn onClick={() => go('myInput')}>내 코스에 넣기</Btn><Btn ghost onClick={() => go('bus')}>가는 버스 보기</Btn></div>
      </div>
    </div>
  );
}

function CoursePage() {
  const stored = readRecommendation();
  const [req, setReq] = useState<TripRequest>(stored?.request ?? { visitDate: '2026-11-07', arrivalTime: '10:50', pace: 'easy' });
  const [result, setResult] = useState(stored);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    const r = await createRecommendation(req);
    saveRecommendation(r.recommendation, req, r.usingFallback, r.error);
    setResult({ ...r, request: req });
    setBusy(false);
  };
  const rec = result?.recommendation;
  return (
    <>
      <PageHead kicker="MY COURSE" title="내 시간에 맞는 코스" desc="도착 시간에 맞는 여행 동선을 찾아드려요." />
      <div className="grid grid-cols-[380px_1fr] gap-8">
        <Card>
          <form onSubmit={e => { e.preventDefault(); submit(); }} className="space-y-6">
            <label className="block text-sm font-bold">여행 날짜
              <input type="date" required value={req.visitDate} onChange={e => setReq({ ...req, visitDate: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[#e3dcd2] px-3 font-normal" />
            </label>
            <label className="block text-sm font-bold">청도 도착 시각
              <input type="time" required value={req.arrivalTime} onChange={e => setReq({ ...req, arrivalTime: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[#e3dcd2] px-3 font-normal" />
              <span className="mt-1 block text-xs font-normal text-[#6e6c68]">승차 위치로 이동할 여유 20분 이상을 더해요.</span>
            </label>
            <fieldset><legend className="text-sm font-bold">여행 속도</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {([['easy', '가볍게 둘러보기', '핵심 장소를 차례로'], ['slow', '여유롭게 둘러보기', '한 장소에서 더 오래']] as const).map(([v, t, s]) => (
                  <button type="button" key={v} onClick={() => setReq({ ...req, pace: v })} aria-pressed={req.pace === v}
                    className={`rounded-xl border p-3 text-left ${req.pace === v ? 'border-[#7d3d00] bg-[#f7f0e7]' : 'border-[#e3dcd2]'}`}>
                    <p className="text-sm font-bold">{t}</p><p className="text-xs text-[#6e6c68]">{s}</p>
                  </button>
                ))}
              </div>
            </fieldset>
            <Btn type="submit" disabled={busy}>{busy ? '코스 찾는 중…' : '내 시간에 맞는 코스 보기'}</Btn>
            <p className="text-xs text-[#9c978f]">청도군 공개 시간표 기준 · 실시간 도착정보 아님</p>
          </form>
        </Card>
        <Card>
          {!rec && <p className="py-20 text-center text-[#6e6c68]">왼쪽에서 조건을 고르고 코스를 찾아보세요</p>}
          {rec && <>
            {result?.error && <div className="mb-4"><Notice tone="error">{result.error}</Notice></div>}
            {result?.usingFallback && !result.error && <div className="mb-4"><Notice>저장된 시간표로 계산했어요.</Notice></div>}
            {rec.status === 'ok' && <p className="text-xs font-bold text-[#9e6b3f]">AI 추천 결과{rec.scheduleSource ? ` · ${rec.scheduleSource}` : ''}</p>}
            <h2 className="mt-1 text-2xl font-bold">{rec.title}</h2>
            <p className="mt-2 text-sm text-[#6e6c68]">{rec.summary}</p>
            {rec.run && <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-[#f7f4ef] p-4"><p className="text-[#6e6c68]">첫 일정</p><p className="mt-1 font-bold">{rec.run.depart} 출발 → {rec.run.arrive} 도착</p></div>
              <div className="rounded-xl bg-[#f7f4ef] p-4"><p className="text-[#6e6c68]">귀환 일정</p><p className="mt-1 font-bold">{rec.run.returnDepart} 출발 → {rec.run.returnArrive} 도착</p></div>
            </div>}
            <ol className="mt-6 space-y-0">
              {rec.stops.map((s, i) => (
                <li key={i} className="flex gap-4 border-l-2 border-[#ead9c6] pb-5 pl-5 last:pb-0">
                  <span className="w-14 shrink-0 text-sm font-bold text-[#7d3d00]">{s.time ?? ''}</span>
                  <div><p className="font-bold">{s.title}</p><p className="text-sm text-[#6e6c68]">{s.description}</p></div>
                </li>
              ))}
            </ol>
            {rec.reason && <p className="mt-6 text-sm text-[#6e6c68]">추천 근거: {rec.reason}</p>}
          </>}
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
  const [cat, setCat] = useState('전체');
  return (
    <>
      <PageHead kicker="BENEFITS" title="여행 혜택" desc="디지털 관광주민증으로 받을 수 있는 혜택"
        action={<a href={BENEFITS_URL} target="_blank" rel="noreferrer"><Btn>관광주민증 혜택 확인하기 ↗</Btn></a>} />
      <div className="mb-6 flex gap-2">
        {['전체', '체험', '관람', '식음료'].map(c => <button key={c} onClick={() => setCat(c)} className={`h-10 rounded-full px-5 text-sm font-bold ${cat === c ? 'bg-[#7d3d00] text-white' : 'border border-[#e3dcd2] bg-white'}`}>{c}</button>)}
      </div>
      <div className="grid grid-cols-3 gap-6">
        {BENEFITS.filter(b => cat === '전체' || b.cat === cat).map(b => (
          <Card key={b.id}>
            <p className="text-xs font-bold text-[#9e6b3f]">{b.cat} · 디지털 관광주민증</p>
            <p className="mt-2 text-lg font-bold">{b.name}</p>
            <p className="mt-1 text-xl font-bold text-[#7d3d00]">{b.deal}</p>
            <p className="mt-3 text-sm text-[#6e6c68]">{b.how}</p>
            {b.detail && <button onClick={() => go('benefitDetail')} className="mt-4 text-sm font-bold text-[#7d3d00]">사용 방법 보기 →</button>}
          </Card>
        ))}
      </div>
      <p className="mt-8 text-xs text-[#9c978f]">출처 대한민국 구석구석 · 디지털 관광주민증 · 혜택 조건은 방문 전 공식 페이지에서 확인하세요.</p>
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

type Row = (typeof EXPENSES)[number];
const CATS = ['숙박', '식비', '교통', '쇼핑', '기타'];

function ExpensePage() {
  // ponytail: no expense API on the backend yet — added rows live in this tab only
  const [rows, setRows] = useState<Row[]>(EXPENSES);
  const s = useMemo(() => settle(rows, PEOPLE), [rows]);
  const all = rows.reduce((n, e) => n + e.amount, 0);
  const [form, setForm] = useState({ name: '', amount: '', date: '2026-11-04', cat: '기타', payer: '나', shared: true });
  const [ocr, setOcr] = useState('');
  const onFile = async (f?: File) => {
    if (!f) return;
    setOcr('영수증을 읽는 중…');
    try {
      const img = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(f); });
      const r = await recognizeReceipt(img);
      setForm(v => ({ ...v, name: r.merchant || v.name, amount: r.amount ? String(r.amount) : v.amount, date: r.date || v.date, cat: CATS.includes(r.category) ? r.category : v.cat }));
      setOcr(r.status === 'recognized' ? '이미지에서 읽은 내용을 채웠어요. 저장 전에 확인해 주세요.' : '글자를 찾지 못했어요. 직접 입력해 주세요.');
    } catch (e) { setOcr(`인식하지 못했어요 · ${(e as Error).message}`); }
  };
  const add = () => {
    const amount = Number(form.amount.replace(/\D/g, ''));
    if (!form.name.trim() || !amount) return setOcr('사용처와 금액을 입력해 주세요.');
    const [, m, d] = form.date.split('-').map(Number);
    setRows([{ name: form.name.trim(), amount, cat: form.cat, payer: form.payer, shared: form.shared, date: `${m}월 ${d}일` }, ...rows]);
    setForm({ ...form, name: '', amount: '' }); setOcr('추가했어요.');
  };
  const input = 'mt-1 h-10 w-full rounded-lg border border-[#e3dcd2] px-3 text-sm font-normal';
  return (
    <>
      <PageHead kicker="EXPENSES" title="여행 경비" desc="청도 1박 2일 · 나와 민지" />
      <div className="grid grid-cols-3 gap-6">
        <Card><p className="text-sm text-[#6e6c68]">총 지출</p><p className="mt-1 text-3xl font-bold">{won(all)}</p><p className="mt-1 text-sm text-[#6e6c68]">{rows.length}건</p></Card>
        <Card><p className="text-sm text-[#6e6c68]">1인 정산 금액</p><p className="mt-1 text-3xl font-bold text-[#7d3d00]">{won(s.share)}</p><p className="mt-1 text-sm text-[#6e6c68]">정산 대상 {won(s.total)} · 개인 {won(s.personal)} 제외</p></Card>
        <Card className="bg-[#f7f0e7]"><p className="text-sm text-[#6e6c68]">정산하려면</p><p className="mt-1 text-2xl font-bold">{s.transfer.from} → {s.transfer.to}</p><p className="mt-1 text-3xl font-bold text-[#7d3d00]">{won(s.transfer.amount)}</p></Card>
      </div>
      <div className="mt-6 grid grid-cols-[1fr_360px] gap-6">
        <Card>
          <h2 className="text-lg font-bold">전체 지출</h2>
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-[#6e6c68]"><tr className="border-b border-[#ece6dd]"><th className="py-2">날짜</th><th>사용처</th><th>항목</th><th>결제</th><th className="text-right">금액</th></tr></thead>
            <tbody>{rows.map((e, i) => (
              <tr key={i} className="border-b border-[#f3efe9]"><td className="py-3 text-[#6e6c68]">{e.date}</td><td className="font-bold">{e.name}</td><td>{e.cat}</td><td>{e.payer}{e.shared ? '' : ' · 개인'}</td><td className="text-right font-bold">{won(e.amount)}</td></tr>
            ))}</tbody>
          </table>
        </Card>
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-bold">항목별</h2>
            <div className="mt-4 space-y-3">{CATS.map(c => { const v = rows.filter(e => e.cat === c).reduce((n, e) => n + e.amount, 0); return (
              <div key={c}><div className="flex justify-between text-sm"><span>{c}</span><span className="font-bold">{won(v)}</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-[#f1ede7]"><div className="h-full rounded-full bg-[#7d3d00]" style={{ width: `${all ? (v / all) * 100 : 0}%` }} /></div></div>
            ); })}</div>
          </Card>
          <Card>
            <h2 className="text-lg font-bold">경비 추가</h2>
            <label className="mt-4 flex h-20 cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#d9c7b3] text-sm text-[#7d3d00] hover:bg-[#faf6f0]">
              영수증·결제 캡처 올리기<input type="file" accept="image/*" className="hidden" onChange={e => onFile(e.target.files?.[0])} />
            </label>
            {ocr && <p className="mt-2 text-xs text-[#7d3d00]">{ocr}</p>}
            <div className="mt-4 space-y-3 text-xs font-bold">
              <label className="block">사용처<input className={input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
              <div className="grid grid-cols-2 gap-2">
                <label>금액<input className={input} inputMode="numeric" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></label>
                <label>사용일<input type="date" className={input} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label>
                <label>항목<select className={input} value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value })}>{CATS.map(c => <option key={c}>{c}</option>)}</select></label>
                <label>결제한 사람<select className={input} value={form.payer} onChange={e => setForm({ ...form, payer: e.target.value })}>{PEOPLE.map(p => <option key={p}>{p}</option>)}</select></label>
              </div>
              <label className="flex items-center gap-2 font-normal"><input type="checkbox" checked={form.shared} onChange={e => setForm({ ...form, shared: e.target.checked })} />함께 쓴 경비로 정산</label>
            </div>
            <div className="mt-4"><Btn onClick={add}>경비 추가</Btn></div>
          </Card>
        </div>
      </div>
    </>
  );
}

/* ---------- shell ---------- */
export default function Site({ current, go }: { current: ScreenId; go: Go }) {
  const [place, setPlace] = useState<Place | null>(null);
  const openPlace = (p: Place) => { setPlace(p); go('placeDetail'); };
  const page: Record<ScreenId, ReactNode> = {
    home: <HomePage go={go} openPlace={openPlace} />,
    places: <PlacesPage openPlace={openPlace} />, placeDetail: <PlaceDetailPage place={place} go={go} />,
    myInput: <CoursePage />, myResult: <CoursePage />, bus: <BusPage />,
    benefits: <BenefitsPage go={go} />, benefitDetail: <BenefitDetailPage />,
    expense: <ExpensePage />, expenseAll: <ExpensePage />, expenseCapture: <ExpensePage />, expenseSettle: <ExpensePage />,
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
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-8 py-10">{page[current]}</main>
      <footer className="border-t border-[#ece6dd] py-8 text-center text-xs text-[#9c978f]">청도 여행을 더 가볍게, 청도 한바퀴 · 버스 시간은 실시간 도착 정보가 아니에요.</footer>
    </div>
  );
}
