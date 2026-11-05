import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Place } from './api';
import { BUS_STATION_TO_WINE, WALK_WINE_TO_VILLAGE } from './routeShapes';

export type Pin = { id: string; name: string; lat: number; lng: number; note?: string; kind?: 'place' | 'station' };

// Coordinates for places the backend may not send. 와인터널·레일바이크 match the backend snapshot.
// ponytail: 청도역·송금마을 are approximate hand-picked points; replace with API coordinates when available
const KNOWN: Record<string, [number, number]> = {
  'wine-tunnel': [35.71513567, 128.7205341],
  'rail-bike': [35.58811543, 128.7661723],
  'songgeum-village': [35.7105, 128.7213],
};
export const STATION: Pin = { id: 'station', name: '청도역', lat: 35.6474, lng: 128.7337, note: '7번 버스 승차', kind: 'station' };

export function placePins(places: Place[]): Pin[] {
  return places.flatMap(p => {
    const c = p.latitude !== undefined && p.longitude !== undefined ? [p.latitude, p.longitude] : KNOWN[p.id];
    return c ? [{ id: p.id, name: p.name, lat: c[0], lng: c[1], note: p.address ?? p.area, kind: 'place' as const }] : [];
  });
}

/** A drawn leg: bus legs are solid, walking legs dotted (spec §7). */
/** `path` follows the road; without it the leg is a straight line between the pins. */
export type Segment = { ids: string[]; walk?: boolean; path?: [number, number][] };
/** 7번 버스 course: 청도역 →(bus) 와인터널 →(walk) 송금마을. Village leg hidden for the wine-tunnel-only course. */
const FULL: Segment[] = [
  { ids: ['station', 'wine-tunnel'], path: BUS_STATION_TO_WINE },
  { ids: ['wine-tunnel', 'songgeum-village'], walk: true, path: WALK_WINE_TO_VILLAGE },
];
const WINE_ONLY: Segment[] = [FULL[0]];
// constants so TripMap's effect doesn't redraw/refit on every render
export const courseRoute = (village = true): Segment[] => (village ? FULL : WINE_ONLY);
/** Whether a recommendation visits 송금마을 (wine-tunnel-only courses don't). */
export const visitsVillage = (stops: { title: string }[]) => !stops.length || stops.some(s => s.title.includes('송금'));

const esc = (t: string) => t.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

const icon = (kind: Pin['kind'], active: boolean) => L.divIcon({
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);background:${kind === 'station' ? '#24211d' : active ? '#b85c00' : '#7d3d00'}"></div>`,
});

export default function TripMap({ pins, route, focus, onSelect, className = 'h-80' }: {
  pins: Pin[]; route?: Segment[]; focus?: string; onSelect?: (id: string) => void; className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!el.current) return;
    const m = L.map(el.current, { scrollWheelZoom: false, attributionControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18, attribution: '&copy; OpenStreetMap',
    }).addTo(m);
    map.current = m;
    return () => { m.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const layer = L.layerGroup().addTo(m);
    for (const p of pins) {
      const mk = L.marker([p.lat, p.lng], { icon: icon(p.kind, p.id === focus), title: p.name })
        .bindPopup(`<b>${esc(p.name)}</b>${p.note ? `<br>${esc(p.note)}` : ''}`).addTo(layer);
      if (onSelect) mk.on('click', () => onSelect(p.id));
      if (p.id === focus) mk.openPopup();
    }
    for (const seg of route ?? []) {
      const line = seg.ids.map(id => pins.find(p => p.id === id)).filter((p): p is Pin => !!p);
      if (line.length < 2) continue;
      L.polyline(seg.path ?? line.map(p => L.latLng(p.lat, p.lng)), { color: seg.walk ? '#b0865c' : '#7d3d00', weight: seg.walk ? 3 : 5, dashArray: seg.walk ? '2 8' : undefined, lineCap: 'round' })
        .bindTooltip(seg.walk ? '도보 (개략)' : '7번 버스 (개략)', { sticky: true }).addTo(layer);
    }
    const f = pins.find(p => p.id === focus);
    if (f) m.setView([f.lat, f.lng], 14);
    else if (pins.length) m.fitBounds(L.latLngBounds(pins.map(p => L.latLng(p.lat, p.lng))), { padding: [40, 40], maxZoom: 14 });
    return () => { layer.remove(); };
  }, [pins, route, focus, onSelect]);

  return (
    <div className={`relative z-0 overflow-hidden rounded-2xl ${className}`}>
      <div ref={el} className="size-full" role="region" aria-label="청도 지도" />
      {route && route.length > 0 && <div className="pointer-events-none absolute bottom-2 left-2 z-[500] rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] leading-4 text-[#24211d] shadow">
        <b>개략 동선</b> · 실제 길 안내 아님<br />
        <span className="text-[#7d3d00]">━ 버스</span> <span className="text-[#b0865c]">┅ 도보</span>
      </div>}
    </div>
  );
}

export const mapLink = (p: Pin) => `https://map.kakao.com/link/map/${encodeURIComponent(p.name)},${p.lat},${p.lng}`;
