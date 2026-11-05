import { useEffect, useState } from 'react';
import { fallbackPlaces, getPlaces, type Place } from '../api';
import TripMap, { mapLink, placePins } from '../map';
import type { Go, ScreenProps } from '../nav';
import { FlowPage } from '../ui';

/** API places, plus saved ones the API leaves out (e.g. 송금마을). */
export function usePlaces() {
  const [s, set] = useState<{ places: Place[]; live: boolean; error?: string } | null>(null);
  useEffect(() => {
    let on = true;
    getPlaces().then(r => on && set({
      places: [...r.places, ...fallbackPlaces.filter(f => !r.places.some(p => p.id === f.id))],
      live: r.status === 'live', error: r.error,
    }));
    return () => { on = false; };
  }, []);
  return s;
}

const IN_COURSE = ['wine-tunnel', 'songgeum-village'];

/** Place info in normal flow; used by the mobile screen and the desktop site. */
export function PlaceInfo({ id, go, wide }: { id?: string; go: Go; wide?: boolean }) {
  const data = usePlaces();
  if (!data) return <p role="status" className="py-16 text-center text-[13px] text-[#6e6c68]">장소 정보를 불러오는 중…</p>;
  const place = data.places.find(p => p.id === id) ?? (id ? undefined : data.places[0]);
  if (!place) return (
    <div className="space-y-3 py-10 text-center">
      <p className="text-[15px] font-bold">장소를 찾을 수 없어요</p>
      <button className="h-10 rounded-xl bg-[#7d3d00] px-4 text-[13px] font-bold text-white" onClick={() => go('places')}>장소 목록으로</button>
    </div>
  );
  const pin = placePins([place])[0];
  const info = (
    <div className="space-y-5">
      <div>
        <p className="text-[12px] font-bold text-[#9e6b3f]">{place.category} · {place.area}</p>
        <h1 className="mt-1 text-[26px] font-bold">{place.name}</h1>
        <p className="mt-1 text-[13px] text-[#6e6c68]">{place.description}</p>
      </div>
      <dl className="grid grid-cols-[52px_1fr] gap-y-2 border-y border-[#ece6dd] py-4 text-[13px]">
        <dt className="text-[#6e6c68]">주소</dt><dd className="font-bold">{place.address ?? `청도군 ${place.area}`}</dd>
        <dt className="text-[#6e6c68]">문의</dt><dd>{place.phone ? <a href={`tel:${place.phone}`} className="font-bold underline">{place.phone}</a> : '공식 안내에서 확인'}</dd>
      </dl>
      <p className="text-[11px] text-[#9c978f]">
        {data.live ? '공공 관광지 API 자료' : '저장된 공개 자료'}{place.referenceDate ? ` · ${place.referenceDate} 기준` : ''} · 운영시간과 입장료는 방문 전 현장에서 확인
      </p>
      {IN_COURSE.includes(place.id) && <button onClick={() => go('bus')} className="block w-full rounded-2xl bg-[#f7f0e7] p-4 text-left">
        <span className="block text-[12px] text-[#6e6c68]">이 코스에 들어 있어요</span>
        <span className="block text-[15px] font-bold">7번 버스 · 와인터널 반나절</span>
        <span className="block text-[12px] text-[#6e6c68]">청도역 → 와인터널 → 송금마을 · <b className="text-[#7d3d00]">코스 보기 →</b></span>
      </button>}
      <div className="flex flex-wrap gap-2">
        <button className="h-11 rounded-xl bg-[#7d3d00] px-5 text-[14px] font-bold text-white" onClick={() => go('myInput')}>내 시간에 맞는 코스 찾기</button>
        {pin && <a className="inline-flex h-11 items-center rounded-xl border border-[#e3dcd2] px-5 text-[14px] font-bold text-[#7d3d00]" href={mapLink(pin)} target="_blank" rel="noreferrer">길찾기 ↗</a>}
      </div>
    </div>
  );
  const photo = <img src={place.imageUrl} alt={place.name} className={`w-full object-cover ${wide ? 'h-[420px] rounded-3xl' : 'h-52 rounded-2xl'}`} />;
  const map = pin && <TripMap pins={[pin]} focus={pin.id} className={wide ? 'h-56' : 'h-44'} />;
  return wide
    ? <div className="grid grid-cols-[1.3fr_1fr] gap-10"><div className="space-y-4">{photo}{map}</div>{info}</div>
    : <div className="space-y-5">{photo}{info}{map}</div>;
}

export default function PlaceDetail({ go, id }: ScreenProps & { id?: string }) {
  return <FlowPage title="장소 상세" tab="places"><PlaceInfo id={id} go={go} /></FlowPage>;
}
