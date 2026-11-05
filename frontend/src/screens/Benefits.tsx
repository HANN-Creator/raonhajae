import { useState } from 'react';
import { B, Bg, BottomNav, Header, I, R, StatusBar } from '../ui';

const assetPathPrefix = "/assets/92c401e9-7acb-4460-be6a-10b9f9cf88ca";
const imgExperienceFilter = `${assetPathPrefix}/2869b.svg`;
const imgFoodFilter = `${assetPathPrefix}/1d3f7.svg`;
const imgRailbikeFeatureSurface = `${assetPathPrefix}/95054.svg`;
const imgRailbikeTicketMark = `${assetPathPrefix}/a7aba.svg`;
const imgComedyCategoryMark = `${assetPathPrefix}/82b20.svg`;
const imgComedyTicketIcon = `${assetPathPrefix}/0bd5d.svg`;
const imgComedyChevron = `${assetPathPrefix}/a8541.svg`;
const imgComedyDivider = `${assetPathPrefix}/da758.svg`;
const imgCafeCupIcon = `${assetPathPrefix}/1e247.svg`;
const imgOfficialButton = `${assetPathPrefix}/69fd9.svg`;
const imgBenefitsTabIcon = `${assetPathPrefix}/66f6b.svg`;

const FILTERS = [
  { label: '전체', box: 'inset-[16.67%_78.28%_79.45%_5.05%]', txt: 'inset-[17.81%_83.71%_80.59%_10.48%]', src: imgExperienceFilter },
  { label: '체험', box: 'inset-[16.67%_58.33%_79.45%_23.74%]', txt: 'inset-[17.81%_64.39%_80.59%_29.8%]', src: imgExperienceFilter },
  { label: '관람', box: 'inset-[16.67%_38.38%_79.45%_43.69%]', txt: 'inset-[17.81%_44.44%_80.59%_49.75%]', src: imgExperienceFilter },
  { label: '식음료', box: 'inset-[16.67%_17.17%_79.45%_63.64%]', txt: 'inset-[17.81%_22.47%_80.59%_68.94%]', src: imgFoodFilter },
];
// which filters show each card: railbike/comedy = 체험·관람, cafe = 식음료
const show = (f: number, cats: number[]) => f === 0 || cats.includes(f);

export default function Benefits() {
  const [f, setF] = useState(0);
  return (
    <div className="relative size-full">
      <Bg /><StatusBar />
      <Header title="여행 혜택" sub={<p className={`${R} inset-[11.42%_43.94%_86.99%_5.05%] text-[#6e6c68] text-[12px]`}>디지털 관광주민증으로 받을 수 있는 혜택</p>} />
      {FILTERS.map((x, i) => (
        <button key={x.label} className="absolute contents cursor-pointer" onClick={() => setF(i)}>
          {i === f
            ? <div className={`absolute ${x.box} rounded-full bg-[#7d3d00]`} />
            : <I c={x.box} s={x.src} pad="inset-[-1.47%_-0.7%]" />}
          <p className={`${B} ${x.txt} text-[12px] text-center ${i === f ? 'text-white' : 'text-[#24211d]'}`}>{x.label}</p>
        </button>
      ))}
      {show(f, [1]) && <a className="absolute contents cursor-pointer" data-name="레일바이크 상세">
        <I c="inset-[23.06%_5.05%_53.31%_5.05%]" s={imgRailbikeFeatureSurface} />
        <p className={`${B} inset-[25.34%_69.19%_73.17%_9.6%] text-[#7d3d00] text-[11px]`}>디지털 관광주민증</p>
        <p className={`${B} inset-[28.31%_56.31%_62.9%_8.84%] text-[#7d3d00] text-[64px]`}>20%</p>
        <p className={`${B} inset-[32.99%_38.13%_64.38%_53.03%] text-[#24211d] text-[19px]`}>할인</p>
        <p className={`${B} inset-[37.33%_61.62%_60.39%_9.6%] text-[#24211d] text-[17px]`}>청도 레일바이크</p>
        <p className={`${R} inset-[40.87%_57.58%_57.53%_9.6%] text-[#6e6c68] text-[12px]`}>현장 QR 발급 후 직원 확인</p>
        <p className={`${B} inset-[43.49%_72.22%_54.91%_9.6%] text-[#7d3d00] text-[12px]`}>사용 방법 보기</p>
        <I c="inset-[26.25%_12.99%_71.81%_82.18%]" s={imgRailbikeTicketMark} pad="inset-[-8.44%_-7.5%]" />
      </a>}
      <p className={`${B} inset-[49.32%_63.38%_48.52%_5.05%] text-[#24211d] text-[16px]`}>청도에서 더 누리기</p>
      {show(f, [1, 2]) && <>
        <I c="inset-[53.54%_82.32%_40.75%_5.05%]" s={imgComedyCategoryMark} />
        <I c="inset-[55.31%_86.36%_42.87%_9.09%]" s={imgComedyTicketIcon} pad="inset-[-8.44%_-7.5%]" />
        <p className={`${B} inset-[54%_56.31%_44.06%_20.71%] text-[#24211d] text-[14px]`}>한국코미디타운</p>
        <p className={`${R} inset-[56.74%_45.96%_41.78%_20.71%] text-[#6e6c68] text-[11px]`}>입장 1천원 · 공연 5천원 할인</p>
        <I c="inset-[55.59%_6.82%_43.26%_91.92%]" s={imgComedyChevron} pad="inset-[-9%_-18%]" />
        <I c="inset-[60.62%_5.05%_39.38%_5.05%]" s={imgComedyDivider} pad="inset-[-0.5px_-0.14%]" />
      </>}
      {show(f, [3]) && <>
        <I c="inset-[62.56%_82.32%_31.74%_5.05%]" s={imgComedyCategoryMark} />
        <I c="inset-[64.38%_83.08%_32.42%_8.08%]" s={imgCafeCupIcon} pad="inset-[-4.46%_-3.57%]" />
        <p className={`${B} inset-[63.01%_62.88%_35.05%_20.71%] text-[#24211d] text-[14px]`}>오감즈카페</p>
        <p className={`${R} inset-[65.75%_62.12%_32.76%_20.71%] text-[#6e6c68] text-[11px]`}>음료 10% 할인</p>
        <I c="inset-[69.63%_5.05%_30.37%_5.05%]" s={imgComedyDivider} pad="inset-[-0.5px_-0.14%]" />
      </>}
      <p className={`${R} inset-[72.15%_44.19%_26.37%_5.05%] text-[#6e6c68] text-[11px]`}>출처 대한민국 구석구석 · 디지털 관광주민증</p>
      <p className={`${R} inset-[74.66%_39.14%_23.86%_5.05%] text-[#6e6c68] text-[11px]`}>혜택 조건은 방문 전 공식 페이지에서 확인하세요.</p>
      <a className="absolute contents cursor-pointer" href="https://korean.visitkorea.or.kr/dgtourcard/biz/regn/regnMain.do?mtpcDoCd=47&signguCd=47820" target="_blank" rel="noreferrer">
        <I c="inset-[82.65%_5.05%_11.87%_5.05%]" s={imgOfficialButton} />
        <p className={`${B} inset-[84.47%_31.19%_13.58%_31.19%] text-[14px] text-center text-white`}>관광주민증 혜택 확인하기</p>
      </a>
      <BottomNav active="benefits" activeIcon={imgBenefitsTabIcon} />
    </div>
  );
}
