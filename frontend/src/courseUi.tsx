// Course recommendation result, shared by the mobile result screen and the desktop course page.
import { useEffect, useState } from 'react';
import { fallbackPlaces, getWeather, type Recommendation, type TripRequest, type Weather } from './api';
import TripMap, { STATION, courseRoute, placePins, visitsVillage } from './map';

export const BUS_URL = 'https://www.cheongdo.go.kr/traffic/contents/01/bus/bus_time.jsp';
export const COURSE_PINS = [STATION, ...placePins(fallbackPlaces.filter(p => p.id !== 'rail-bike'))];
const hm = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}시간 ` : '') + (m % 60 ? `${m % 60}분` : '');

export function WeatherBox({ date, from }: { date: string; from: string }) {
  const [w, setW] = useState<Weather | null | undefined>(undefined);
  useEffect(() => { let on = true; setW(undefined); getWeather(date).then(x => on && setW(x)); return () => { on = false; }; }, [date]);
  if (w === undefined) return <p className="text-[12px] text-[#9c978f]">날씨 예보를 확인하는 중…</p>;
  const hours = (w?.hours ?? []).filter(h => h.time.slice(11, 16) >= from.slice(0, 2) + ':00').slice(0, 6);
  if (!hours.length) return <p className="text-[12px] text-[#9c978f]">이 날짜·시간대의 날씨 예보는 아직 없어요.</p>;
  const rain = Math.max(...hours.map(h => h.rainChance));
  return (
    <div className="rounded-xl bg-[#f7f4ef] p-4">
      <p className="text-[13px] font-bold">{date.slice(5).replace('-', '/')} 도착 후 날씨 <span className="font-normal text-[#6e6c68]">· 강수 확률 최대 {rain}%</span></p>
      <div className="mt-3 grid grid-cols-6 text-center text-[12px]">{hours.map(h => (
        <div key={h.time}><p className="text-[#6e6c68]">{h.time.slice(11, 13)}시</p><p className="mt-1 font-bold">{Math.round(h.temperature)}°</p><p className="text-[10px] text-[#6e6c68]">{h.rainChance}%</p></div>
      ))}</div>
      {rain >= 50 && <p className="mt-3 text-[12px] text-[#a84032]">비 소식이 있어요. 실내인 와인터널 위주로 다녀보세요.</p>}
    </div>
  );
}

const courseText = (rec: Recommendation, req: TripRequest) => [
  `[청도 한바퀴] ${rec.title}`,
  `${req.visitDate} · ${req.arrivalTime} 도착`,
  rec.run ? `7번 버스 ${rec.run.depart} 출발 → ${rec.run.arrive} 도착 / 귀환 ${rec.run.returnDepart} → ${rec.run.returnArrive}` : '',
  ...rec.stops.map(s => `${s.time ?? '  —  '} ${s.title} · ${s.description}`),
  `공개 시간표 기준 · 실시간 아님 · ${rec.scheduleSource ?? BUS_URL}`,
].filter(Boolean).join('\n');

export type StoredResult = { recommendation: Recommendation; request: TripRequest; usingFallback: boolean; error?: string };

export function CourseResult({ result, onRetry, onChange, onBus, retrying }: {
  result: StoredResult; onRetry: () => void; onChange: () => void; onBus?: () => void; retrying?: boolean;
}) {
  const { recommendation: rec, request, error } = result;
  const [copied, setCopied] = useState('');
  const copy = async () => {
    try { await navigator.clipboard.writeText(courseText(rec, request)); setCopied('코스를 복사했어요.'); }
    catch { setCopied('복사하지 못했어요. 화면을 길게 눌러 직접 복사해 주세요.'); }
  };
  const btn = 'inline-flex h-10 items-center rounded-xl px-4 text-[13px] font-bold';
  const primary = `${btn} bg-[#7d3d00] text-white`, ghost = `${btn} border border-[#e3dcd2] bg-white text-[#7d3d00]`;
  const source = <p className="text-[11px] leading-5 text-[#9c978f]">
    {rec.scheduleStatus === 'live' ? '청도군 게시 시간표' : '저장된 공개 시간표'}{rec.schedulePublishedAt ? ` · ${rec.schedulePublishedAt} 게시` : ''} · 실시간 운행·도착 정보 아님 ·{' '}
    <a href={rec.scheduleSource ?? BUS_URL} target="_blank" rel="noreferrer" className="underline">시간표 원문 ↗</a>
  </p>;

  // server unreachable / rejected the request
  if (error) return (
    <div className="space-y-4">
      <p role="alert" className="rounded-xl bg-[#fdecea] px-4 py-3 text-[13px] text-[#a84032]">코스 서버에 연결하지 못했어요. {error}</p>
      <p className="text-[13px] text-[#6e6c68]">버스 시각은 공개 시간표 원문에서 직접 확인할 수 있어요. 잠시 후 다시 시도해 보세요.</p>
      <div className="flex flex-wrap gap-2">
        <button className={primary} onClick={onRetry} disabled={retrying}>{retrying ? '다시 찾는 중…' : '다시 시도'}</button>
        <button className={ghost} onClick={onChange}>조건 바꾸기</button>
        <a className={ghost} href={BUS_URL} target="_blank" rel="noreferrer">시간표 원문 ↗</a>
      </div>
    </div>
  );

  if (rec.status === 'no_route') return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-bold">이 시간에 맞는 왕복 버스가 없어요</h2>
      <p className="text-[13px] text-[#6e6c68]">{request.arrivalTime} 도착 기준으로 다녀올 수 있는 7번 버스 왕복편을 찾지 못했어요. 더 이른 도착 시각으로 바꿔 보세요.</p>
      <div className="flex flex-wrap gap-2">
        <button className={primary} onClick={onChange}>도착 시각 바꾸기</button>
        <a className={ghost} href={BUS_URL} target="_blank" rel="noreferrer">시간표 원문 ↗</a>
      </div>
      {source}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5">
        <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${rec.engine === 'copilot' ? 'bg-[#7d3d00] text-white' : 'bg-[#f1ede7] text-[#4c4945]'}`}>
          {rec.engine === 'copilot' ? '✦ AI가 고른 코스' : '시간표 기준 추천'}</span>
        {rec.scheduleStatus === 'fallback' && <span className="rounded-full bg-[#fff4dc] px-3 py-1 text-[12px] font-bold text-[#8a5a00]">저장본 기준{rec.schedulePublishedAt ? ` · ${rec.schedulePublishedAt} 게시` : ''} · 탑승 전 운행 확인</span>}
      </div>
      <div>
        <h2 className="text-[22px] font-bold leading-tight">{rec.title}</h2>
        {(rec.durationMinutes || rec.waitingMinutes) ? <p className="mt-1 text-[13px] font-bold text-[#7d3d00]">
          {rec.durationMinutes ? `총 ${hm(rec.durationMinutes)}` : ''}{rec.waitingMinutes ? ` · 버스 대기 여유 ${hm(rec.waitingMinutes)}` : ''}</p> : null}
        {rec.reason && <p className="mt-2 text-[13px] leading-5 text-[#4c4945]"><b>추천 이유</b> · {rec.reason}</p>}
      </div>
      {rec.run && <div className="grid grid-cols-2 gap-2 text-[13px]">
        <div className="rounded-xl bg-[#f7f4ef] p-3"><p className="text-[#6e6c68]">첫 일정 · 7번 버스</p><p className="mt-1 font-bold">{rec.run.depart} → {rec.run.arrive}</p></div>
        <div className="rounded-xl bg-[#f7f4ef] p-3"><p className="text-[#6e6c68]">귀환 · 7번 버스</p><p className="mt-1 font-bold">{rec.run.returnDepart} → {rec.run.returnArrive}</p></div>
      </div>}
      <ol aria-label="일정">
        {rec.stops.map((s, i) => (
          <li key={i} className="flex gap-3 border-l-2 border-[#ead9c6] pb-4 pl-4 last:pb-0">
            <span className="w-12 shrink-0 text-[13px] font-bold text-[#7d3d00]">{s.time ?? ''}</span>
            <div className="min-w-0"><p className="text-[14px] font-bold">{s.kind === 'bus' ? '🚌 ' : s.kind === 'place' ? '📍 ' : ''}{s.title}</p><p className="text-[12px] text-[#6e6c68]">{s.description}</p></div>
          </li>
        ))}
      </ol>
      <TripMap pins={COURSE_PINS} route={courseRoute(visitsVillage(rec.stops))} className="h-56" />
      <WeatherBox date={request.visitDate} from={request.arrivalTime} />
      {!!rec.alternatives?.length && <div>
        <p className="text-[13px] font-bold">다른 코스 후보</p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-3">{rec.alternatives.map(a => (
          <li key={a.id} className="rounded-xl border border-[#ece6dd] p-3 text-[12px]"><p className="font-bold">{a.title}</p><p className="text-[#6e6c68]">{a.depart} 출발 · {a.returnArrive} 귀환</p></li>
        ))}</ul>
      </div>}
      <div className="flex flex-wrap gap-2">
        <button className={primary} onClick={copy}>코스 복사</button>
        {onBus && <button className={ghost} onClick={onBus}>버스 코스 자세히</button>}
        <button className={ghost} onClick={onChange}>조건 바꾸기</button>
      </div>
      {copied && <p role="status" className="text-[12px] text-[#3d6b45]">{copied}</p>}
      {source}
    </div>
  );
}
