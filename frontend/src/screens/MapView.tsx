import { useEffect, useMemo, useState } from 'react';
import { fallbackPlaces, getPlaces, type Place } from '../api';
import TripMap, { courseRoute, STATION, mapLink, placePins } from '../map';
import type { Go } from '../nav';

/** Map of all places + the 7번 bus course. `desktop` drops the app header and uses a side list. */
export default function MapView({ go, desktop, onOpenPlace }: { go: Go; desktop?: boolean; onOpenPlace?: (p: Place) => void }) {
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [error, setError] = useState('');
  const [focus, setFocus] = useState<string>();
  const [course, setCourse] = useState(true);
  useEffect(() => { let on = true; getPlaces().then(r => { if (on) { setPlaces(r.places); setError(r.error ?? ''); } }); return () => { on = false; }; }, []);
  // backend may send only some places; keep the saved ones it leaves out so the course stays complete
  const all = useMemo(() => places ? [...places, ...fallbackPlaces.filter(f => !places.some(p => p.id === f.id))] : [], [places]);
  const pins = useMemo(() => [STATION, ...placePins(all)], [all]);
  const active = pins.find(p => p.id === focus);

  const list = (
    <ul className="divide-y divide-[#ece6dd]">
      {pins.map(p => (
        <li key={p.id}>
          <button onClick={() => setFocus(p.id)} className={`flex w-full items-center gap-3 px-4 py-3 text-left ${p.id === focus ? 'bg-[#f7f0e7]' : ''}`}>
            <span className={`size-2.5 shrink-0 rounded-full ${p.kind === 'station' ? 'bg-[#24211d]' : 'bg-[#7d3d00]'}`} />
            <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{p.name}</span><span className="block truncate text-xs text-[#6e6c68]">{p.note}</span></span>
          </button>
        </li>
      ))}
    </ul>
  );
  const controls = (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label className="flex items-center gap-2"><input type="checkbox" checked={course} onChange={e => setCourse(e.target.checked)} />7번 버스 코스 표시</label>
      {active && <a href={mapLink(active)} target="_blank" rel="noreferrer" className="ml-auto font-bold text-[#7d3d00]">{active.name} 길찾기 ↗</a>}
    </div>
  );
  const map = <TripMap pins={pins} route={course ? courseRoute() : undefined} focus={focus} onSelect={setFocus} className={desktop ? 'h-[560px]' : 'h-full'} />;

  if (desktop) return (
    <>
      <div className="mb-8"><p className="text-xs font-bold tracking-[0.14em] text-[#9e6b3f]">MAP</p><h1 className="mt-2 text-3xl font-bold tracking-tight">청도 지도</h1><p className="mt-2 text-sm text-[#6e6c68]">장소와 7번 버스 코스를 지도에서 확인하세요</p></div>
      <div className="grid grid-cols-[1fr_300px] gap-6">
        <div className="space-y-3">{map}{controls}</div>
        <div className="overflow-hidden rounded-2xl border border-[#ece6dd] bg-white">{list}
          {onOpenPlace && all.some(p => p.id === focus) && <div className="p-4"><button onClick={() => onOpenPlace(all.find(p => p.id === focus)!)} className="text-sm font-bold text-[#7d3d00]">장소 상세 보기 →</button></div>}
        </div>
      </div>
      {error && <p className="mt-4 text-xs text-[#9c978f]">{error}</p>}
      <p className="mt-2 text-xs text-[#9c978f]">일부 위치는 대략적인 지점이에요 · 지도 © OpenStreetMap</p>
    </>
  );

  return (
    <div className="flex size-full flex-col bg-white text-[#24211d]">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#ece6dd] px-4">
        <button onClick={() => go('back')} aria-label="이전 화면" className="text-xl text-[#7d3d00]">‹</button>
        <h1 className="text-lg font-bold">청도 지도</h1>
      </header>
      <div className="relative min-h-0 flex-1">{map}</div>
      <div className="shrink-0 space-y-2 border-t border-[#ece6dd] px-4 py-3">{controls}</div>
      <div className="max-h-[32%] shrink-0 overflow-y-auto pb-20">{list}</div>
    </div>
  );
}
