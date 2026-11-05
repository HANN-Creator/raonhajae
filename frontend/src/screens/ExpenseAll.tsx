import { B, Bg, BottomNav, Header, I, R, StatusBar } from '../ui';

const assetPathPrefix = "/assets/608c049f-6bae-4c9b-abb2-80d86d176c7c";
const imgDivider = `${assetPathPrefix}/da758.svg`;
const imgButton = `${assetPathPrefix}/69fd9.svg`;

// [title-top %, name, meta, amount]; meta sits +2.51%, amount +0.57%, divider +5.7%
const ROWS: [number, string, string, string][] = [
  [26.83, '와인터널 입장', '기타 · 나 결제', '₩11,000'],
  [33.9, '청도반시 구매', '쇼핑 · 나 결제 · 개인', '₩23,000'],
  [40.98, '청도 시내버스', '교통 · 민지 결제', '₩11,000'],
  [51.94, '청도 숙소', '숙박 · 나 결제', '₩125,000'],
  [59.02, '청도 식당', '식비 · 나 결제', '₩46,000'],
  [66.1, '카페', '식비 · 민지 결제', '₩27,000'],
  [73.17, '택시', '교통 · 나 결제', '₩18,000'],
];
const p = (n: number) => `${n}%`;

export default function ExpenseAll() {
  return (
    <div className="relative size-full">
      <Bg /><StatusBar />
      <Header title="전체 지출" sub={<p className={`${R} inset-[11.42%_64.14%_86.99%_5.05%] text-[#6e6c68] text-[12px]`}>예시 여행 · 청도 1박 2일</p>} />
      <p className={`${B} inset-[16.44%_86.11%_81.74%_5.05%] text-[#6e6c68] text-[13px]`}>총 7건</p>
      <p className={`${B} inset-[15.75%_5.05%_81.39%_71.21%] text-[#7d3d00] text-[21px] text-right`}>₩261,000</p>
      <I c="inset-[20.21%_5.05%_79.79%_5.05%]" s={imgDivider} pad="inset-[-0.5px_-0.14%]" />
      <p className={`${B} inset-[22.95%_82.32%_75.23%_5.05%] text-[#24211d] text-[13px]`}>11월 4일</p>
      <p className={`${B} inset-[48.06%_82.32%_50.11%_5.05%] text-[#24211d] text-[13px]`}>11월 3일</p>
      {ROWS.map(([t, name, meta, amt]) => (
        <div key={name} className="contents">
          <p className={`${B} left-[5.05%] text-[#24211d] text-[13px]`} style={{ top: p(t) }}>{name}</p>
          <p className={`${R} left-[5.05%] text-[#6e6c68] text-[11px]`} style={{ top: p(t + 2.51) }}>{meta}</p>
          <p className={`${B} right-[5.05%] text-[#24211d] text-[14px] text-right`} style={{ top: p(t + 0.57) }}>{amt}</p>
          <div className="absolute left-[5.05%] right-[5.05%] h-px" style={{ top: p(t + 5.7) }}><img alt="" className="absolute inset-0 size-full" src={imgDivider} /></div>
        </div>
      ))}
      <a className="absolute contents cursor-pointer" data-name="08 Receipt upload actions">
        <I c="inset-[83.11%_5.05%_11.42%_5.05%]" s={imgButton} />
        <p className={`${B} inset-[84.93%_33.46%_13.13%_33.46%] text-[14px] text-center text-white`}>영수증·결제 캡처 등록</p>
      </a>
      <BottomNav active="expenses" />
    </div>
  );
}
