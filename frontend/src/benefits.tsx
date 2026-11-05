// Benefit data + list, shared by the mobile screen and the desktop site.
import { useState } from 'react';
import { kstToday } from './api';

export type Benefit = {
  id: string; cat: '체험' | '관람' | '식음료'; name: string; deal: string;
  condition: string; how: string[]; url: string;
  /** YYYY-MM-DD the info was checked against the official page; leave out when unknown. */
  checkedAt?: string;
  /** Last valid day; past → shown under "종료된 혜택", never as a current discount. */
  endsAt?: string;
  detail?: boolean; address?: string; hours?: string; phone?: string;
};

export const BENEFITS_URL = 'https://korean.visitkorea.or.kr/dgtourcard/biz/regn/regnMain.do?mtpcDoCd=47&signguCd=47820';

export const BENEFITS: Benefit[] = [
  { id: 'railbike', cat: '체험', name: '청도 레일바이크', deal: '탑승권 20% 할인', condition: '디지털 관광주민증 소지자 · 현장 결제 시',
    how: ['디지털 관광주민증 쿠폰 발급', '현장 QR 스캔', '직원에게 쿠폰 확인', '할인 금액으로 결제'],
    url: 'https://korean.visitkorea.or.kr/dgtourcard/biz/mbrb/mbrbPtcl.do?mbrbId=51c5ee50-3def-4e99-a318-d8f668d385ff',
    detail: true, address: '청도읍 하지길 46-51', hours: '09:00–18:00', phone: '054-373-2426' },
  { id: 'comedy', cat: '관람', name: '한국코미디타운', deal: '입장 1천원 · 공연 5천원 할인', condition: '디지털 관광주민증 제시', how: ['매표소에서 관광주민증 제시'], url: BENEFITS_URL },
  { id: 'ogamz', cat: '식음료', name: '오감즈카페', deal: '음료 10% 할인', condition: '디지털 관광주민증 제시', how: ['주문할 때 관광주민증 제시'], url: BENEFITS_URL },
];

export const isEnded = (b: Benefit) => !!b.endsAt && b.endsAt < kstToday();
export const checkedLabel = (b: Benefit) =>
  b.checkedAt ? `${b.checkedAt.replaceAll('-', '.')} 확인` : '확인일 미기재 · 공식 페이지에서 조건 확인';

export function BenefitList({ onDetail, grid }: { onDetail: () => void; grid?: boolean }) {
  const [cat, setCat] = useState<'전체' | Benefit['cat']>('전체');
  const list = BENEFITS.filter(b => cat === '전체' || b.cat === cat);
  const current = list.filter(b => !isEnded(b)), ended = list.filter(isEnded);
  const card = (b: Benefit, past = false) => (
    <article key={b.id} className={`rounded-2xl border border-[#ece6dd] bg-white p-5 ${past ? 'opacity-60' : ''}`}>
      <p className="text-[12px] font-bold text-[#9e6b3f]">{b.cat} · 디지털 관광주민증</p>
      <h3 className="mt-1 text-[17px] font-bold">{b.name}</h3>
      <p className={`mt-1 text-[18px] font-bold ${past ? 'text-[#77736e] line-through' : 'text-[#7d3d00]'}`}>{b.deal}</p>
      {past && <p className="text-[12px] font-bold text-[#a84032]">종료된 혜택 · {b.endsAt} 종료</p>}
      <p className="mt-2 text-[13px] text-[#4c4945]"><b>적용 조건</b> · {b.condition}</p>
      <p className="mt-1 text-[13px] text-[#4c4945]"><b>사용 방법</b> · {b.how.join(' → ')}</p>
      <p className="mt-2 text-[11px] text-[#9c978f]">{checkedLabel(b)}{b.endsAt && !past ? ` · ${b.endsAt}까지` : ''}</p>
      <div className="mt-3 flex gap-3 text-[13px] font-bold">
        {b.detail && !past && <button className="text-[#7d3d00]" onClick={onDetail}>사용 방법 자세히 →</button>}
        <a className="text-[#7d3d00]" href={b.url} target="_blank" rel="noreferrer">공식 페이지 ↗</a>
      </div>
    </article>
  );
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="혜택 분류">
        {(['전체', '체험', '관람', '식음료'] as const).map(c => (
          <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
            className={`h-9 rounded-full px-4 text-[13px] font-bold ${cat === c ? 'bg-[#7d3d00] text-white' : 'border border-[#e3dcd2] bg-white'}`}>{cat === c ? '✓ ' : ''}{c}</button>
        ))}
      </div>
      <div className={grid ? 'grid grid-cols-3 gap-6' : 'space-y-3'}>{current.map(b => card(b))}</div>
      {!current.length && <p className="py-10 text-center text-[13px] text-[#6e6c68]">지금 받을 수 있는 {cat} 혜택이 없어요.</p>}
      {ended.length > 0 && <><h3 className="mb-2 mt-6 text-[14px] font-bold text-[#6e6c68]">종료된 혜택</h3>
        <div className={grid ? 'grid grid-cols-3 gap-6' : 'space-y-3'}>{ended.map(b => card(b, true))}</div></>}
      <p className="mt-6 text-[11px] leading-5 text-[#9c978f]">출처 대한민국 구석구석 · 디지털 관광주민증 · 혜택 조건은 바뀔 수 있어요. 방문 전 공식 페이지에서 확인하세요.</p>
    </div>
  );
}
