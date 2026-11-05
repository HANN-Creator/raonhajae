import { B, Bg, BottomNav, Header, I, R, StatusBar } from '../ui';

const assetPathPrefix = "/assets/484e168c-6830-429d-b268-9d32397ffb11";
const imgHero = `${assetPathPrefix}/499fc.png`;
const imgDivider = `${assetPathPrefix}/da758.svg`;
const imgRouteSurface = `${assetPathPrefix}/16110.svg`;
const imgButton = `${assetPathPrefix}/69fd9.svg`;
const imgPlacesTabIcon = `${assetPathPrefix}/2a0f9.svg`;

export default function PlaceDetail() {
  return (
    <div className="relative size-full">
      <Bg /><StatusBar />
      <Header title="장소 상세" />
      <div className="absolute inset-[10.62%_0_60.73%_0] overflow-hidden"><img alt="와인터널 내부" className="absolute inset-0 size-full object-cover" src={imgHero} /></div>
      <p className={`${R} inset-[36.87%_53.03%_61.76%_5.05%] text-[10px] text-white`}>사진 Roadgo · Wikimedia Commons</p>
      <p className={`${B} inset-[40.87%_71.72%_55.71%_5.05%] text-[#24211d] text-[25px]`}>와인터널</p>
      <p className={`${R} inset-[45.43%_49.49%_52.97%_5.05%] text-[#6e6c68] text-[12px]`}>옛 철도 터널에서 만나는 청도 감와인</p>
      <I c="inset-[48.97%_5.05%_51.03%_5.05%]" s={imgDivider} pad="inset-[-0.5px_-0.14%]" />
      <p className={`${B} inset-[51.37%_89.65%_47.15%_5.05%] text-[#6e6c68] text-[11px]`}>주소</p>
      <p className={`${B} inset-[51.26%_54.29%_47.15%_22.22%] text-[#24211d] text-[12px]`}>화양읍 송금길 100</p>
      <p className={`${B} inset-[55.02%_89.65%_43.49%_5.05%] text-[#6e6c68] text-[11px]`}>문의</p>
      <a href="tel:054-371-1904" className={`${B} inset-[54.91%_57.58%_43.49%_22.22%] text-[#24211d] text-[12px]`}>054-371-1904</a>
      <I c="inset-[58.45%_5.05%_41.55%_5.05%]" s={imgDivider} pad="inset-[-0.5px_-0.14%]" />
      <p className={`${B} inset-[60.73%_58.59%_37.1%_5.05%] text-[#24211d] text-[16px]`}>이 코스에 들어 있어요</p>
      <a className="absolute contents cursor-pointer" data-name="버스 코스 자세히 보기">
        <I c="inset-[64.5%_5.05%_24.77%_5.05%]" s={imgRouteSurface} />
        <p className={`${B} inset-[66.21%_50.76%_31.85%_9.09%] text-[#24211d] text-[14px]`}>7번 버스 · 와인터널 반나절</p>
        <p className={`${R} inset-[69.29%_54.55%_29.22%_9.09%] text-[#6e6c68] text-[11px]`}>청도역 → 와인터널 → 송금마을</p>
        <p className={`${B} inset-[72.03%_80.05%_26.48%_9.09%] text-[#7d3d00] text-[11px]`}>코스 보기</p>
      </a>
      <p className={`${R} inset-[78.77%_45.71%_19.75%_5.05%] text-[#6e6c68] text-[11px]`}>운영시간과 입장료는 방문 전 현장에서 확인</p>
      <a className="absolute contents cursor-pointer" data-name="추천 코스 보기">
        <I c="inset-[82.65%_5.05%_11.87%_5.05%]" s={imgButton} />
        <p className={`${B} inset-[84.47%_37.75%_13.58%_37.75%] text-[14px] text-center text-white`}>내 코스에서 보기</p>
      </a>
      <BottomNav active="places" activeIcon={imgPlacesTabIcon} />
    </div>
  );
}
