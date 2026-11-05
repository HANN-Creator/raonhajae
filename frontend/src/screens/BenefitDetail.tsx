import { BENEFITS, checkedLabel } from '../benefits';
import { B, Bg, BottomNav, Header, I, R, StatusBar } from '../ui';

const assetPathPrefix = "/assets/9363a106-9969-43b9-ac73-e885ea5b6285";
const imgBenefitTypeChip = `${assetPathPrefix}/5f88c.svg`;
const imgHeadingDivider = `${assetPathPrefix}/da758.svg`;
const imgStepBadge = `${assetPathPrefix}/06f0f.svg`;
const imgStepDivider = `${assetPathPrefix}/ab89a.svg`;
const imgInformationSurface = `${assetPathPrefix}/3e41b.svg`;
const imgButton = `${assetPathPrefix}/69fd9.svg`;
const imgBenefitsTabIcon = `${assetPathPrefix}/66f6b.svg`;

// step rows are 8.56% apart vertically
const STEPS = [
  ['현장 QR 스캔', '디지털 관광주민증 쿠폰 발급'],
  ['직원에게 쿠폰 확인', '현장 위치와 주민증 발급 여부 확인'],
  ['할인 금액으로 결제', '공식 안내에 별도 예약은 불필요'],
];
const pct = (n: number) => `${n.toFixed(2)}%`;

export default function BenefitDetail() {
  return (
    <div className="relative size-full">
      <Bg /><StatusBar />
      <Header title="혜택 상세" />
      <I c="inset-[13.58%_67.93%_83.33%_5.3%]" s={imgBenefitTypeChip} />
      <p className={`${B} inset-[14.38%_70.83%_84.13%_8.21%] text-[#7d3d00] text-[11px] text-center`}>체험 · 관광주민증</p>
      <p className={`${B} inset-[18.72%_52.53%_77.85%_5.3%] text-[#24211d] text-[25px]`}>청도 레일바이크</p>
      <p className={`${B} inset-[22.72%_41.92%_73.29%_5.3%] text-[#7d3d00] text-[29px]`}>탑승권 20% 할인</p>
      <p className={`${R} inset-[27.63%_68.69%_70.78%_5.3%] text-[#6e6c68] text-[12px]`}>청도읍 하지길 46-51</p>
      <I c="inset-[31.74%_4.8%_68.26%_5.3%]" s={imgHeadingDivider} pad="inset-[-0.5px_-0.14%]" />
      <p className={`${B} inset-[34.36%_67.93%_63.47%_5.05%] text-[#24211d] text-[16px]`}>이렇게 사용해요</p>
      {STEPS.map(([t, s], i) => {
        const o = i * 8.56;
        return (
          <div key={t} className="contents">
            <div className="absolute left-[5.3%] right-[87.63%]" style={{ top: pct(38.36 + o), bottom: pct(58.45 - o) }}><img alt="" className="absolute inset-0 size-full" src={imgStepBadge} /></div>
            <p className={`${B} left-[7.83%] right-[90.15%] text-[#7d3d00] text-[12px] text-center`} style={{ top: pct(39.16 + o) }}>{i + 1}</p>
            <p className={`${B} left-[15.66%] text-[#24211d] text-[13px]`} style={{ top: pct(39.04 + o) }}>{t}</p>
            <p className={`${R} left-[15.66%] text-[#6e6c68] text-[11px]`} style={{ top: pct(41.55 + o) }}>{s}</p>
            {i < 2 && <div className="absolute left-[15.66%] right-[5.05%] h-px" style={{ top: pct(44.75 + o) }}><img alt="" className="absolute inset-0 size-full" src={imgStepDivider} /></div>}
          </div>
        );
      })}
      <I c="inset-[64.04%_5.05%_23.29%_5.05%]" s={imgInformationSurface} />
      <p className={`${B} inset-[65.64%_75.51%_32.76%_9.09%] text-[#24211d] text-[12px]`}>이용 전 확인</p>
      <p className={`${R} inset-[68.61%_80.56%_29.91%_9.09%] text-[#6e6c68] text-[11px]`}>운영시간</p>
      <p className={`${B} inset-[68.61%_9.6%_29.91%_73.74%] text-[#24211d] text-[11px] text-right`}>09:00–18:00</p>
      <p className={`${R} inset-[71.69%_85.61%_26.83%_9.09%] text-[#6e6c68] text-[11px]`}>문의</p>
      <a href="tel:054-373-2426" className={`${B} inset-[71.69%_9.6%_26.83%_71.72%] text-[#24211d] text-[11px] text-right`}>054-373-2426</a>
      <p className={`${R} inset-[78.77%_38.38%_19.75%_5.05%] text-[#6e6c68] text-[11px]`}>{checkedLabel(BENEFITS[0])} · 최신 조건은 공식 페이지에서 확인</p>
      <a className="absolute contents cursor-pointer" href="https://korean.visitkorea.or.kr/dgtourcard/biz/mbrb/mbrbPtcl.do?mbrbId=51c5ee50-3def-4e99-a318-d8f668d385ff" target="_blank" rel="noreferrer">
        <I c="inset-[82.65%_5.05%_11.87%_5.05%]" s={imgButton} />
        <p className={`${B} inset-[84.47%_34.09%_13.58%_34.09%] text-[14px] text-center text-white`}>공식 혜택 페이지 열기</p>
      </a>
      <BottomNav active="benefits" activeIcon={imgBenefitsTabIcon} />
    </div>
  );
}
