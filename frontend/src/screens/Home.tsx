import type { ScreenProps } from '../nav'

const assetPathPrefix = "/assets/63074331-c5ab-4c65-8481-c6e91566771a";
const imgSariamPhotoReplaceable = `${assetPathPrefix}/510c6.png`;
const imgWineTunnelPhotoReplaceable1 = `${assetPathPrefix}/8d90d.png`;
const imgCheongdoTownPhotoReplaceable1 = `${assetPathPrefix}/d5555.png`;
const img = `${assetPathPrefix}/faa59.svg`;
const imgDynamicIsland = `${assetPathPrefix}/6cb5d.svg`;
const imgCellSignal = `${assetPathPrefix}/640c9.svg`;
const imgWifiSignal = `${assetPathPrefix}/24393.svg`;
const imgBattery = `${assetPathPrefix}/99143.svg`;
const imgSearchField = `${assetPathPrefix}/1b45e.svg`;
const imgSearchIcon = `${assetPathPrefix}/f6e0c.svg`;
const imgSavedPlaces = `${assetPathPrefix}/a11d7.svg`;
const imgEditTrip = `${assetPathPrefix}/bac6e.svg`;
const imgPhotoContrastOverlay = `${assetPathPrefix}/4a72b.svg`;
const imgTitleUnderline = `${assetPathPrefix}/7b43a.svg`;
const imgThemeWalk = `${assetPathPrefix}/6aec0.svg`;
const imgThemeDiscounts = `${assetPathPrefix}/6f9a7.svg`;
const imgThemeExpenses = `${assetPathPrefix}/aa11b.svg`;
const imgThemePlaces = `${assetPathPrefix}/3f4fe.svg`;
const imgThemeBus = `${assetPathPrefix}/d44d4.svg`;
const imgWineTunnelPhotoReplaceable = `${assetPathPrefix}/bcd6e.svg`;
const imgWineTunnelPhotoOverlay = `${assetPathPrefix}/d1f43.svg`;
const imgCheongdoTownPhotoReplaceable = `${assetPathPrefix}/7774a.svg`;
const imgCheongdoTownPhotoOverlay = `${assetPathPrefix}/d3a6f.svg`;
const imgRouteCardSurface = `${assetPathPrefix}/1f561.svg`;
const imgRouteConnectors = `${assetPathPrefix}/093b5.svg`;
const imgRouteStops = `${assetPathPrefix}/70629.svg`;
const imgNavigationBackground = `${assetPathPrefix}/312fb.svg`;
const imgNavigationDivider = `${assetPathPrefix}/e3daa.svg`;
const imgHomeTabIcon = `${assetPathPrefix}/6e4a4.svg`;
const imgExpensesTabIcon = `${assetPathPrefix}/51a23.svg`;
const imgMyRouteTabIcon = `${assetPathPrefix}/9fce1.svg`;
const imgBenefitsTabIcon = `${assetPathPrefix}/5650c.svg`;
const imgPlacesTabIcon = `${assetPathPrefix}/7f589.svg`;
const imgHomeIndicator = `${assetPathPrefix}/10db8.svg`;

export default function Home({ go }: ScreenProps) {
  return (
    <div className="relative size-full">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={img} />
      <div className="absolute contents inset-[1.26%_2.84%_95.66%_4.8%]">
        <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[2.05%_86.36%_96.12%_4.8%] leading-[normal] text-[#0d0d0d] text-[13px] whitespace-nowrap">10:43</p>
        <div className="absolute inset-[1.26%_38.64%_95.66%_33.08%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDynamicIsland} /></div>
        <div className="absolute inset-[2.34%_13.31%_96.46%_82.83%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCellSignal} /></div>
        <div className="absolute inset-[2.32%_7.63%_96.47%_88.64%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWifiSignal} /></div>
        <div className="absolute inset-[2.4%_2.84%_96.58%_93.69%]"><div className="absolute inset-[-5.56%_0_-5.56%_-3.64%]"><img alt="" className="block max-w-none size-full" src={imgBattery} /></div></div>
      </div>
      <div className="absolute contents inset-[5.59%_5.87%_90.18%_5.05%]">
        <div className="absolute inset-[5.59%_23.23%_90.18%_5.05%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSearchField} /></div>
        <div className="absolute inset-[6.98%_88.25%_91.72%_8.89%]"><div className="absolute inset-[-7.81%]"><img alt="" className="block max-w-none size-full" src={imgSearchIcon} /></div></div>
        <p className="absolute font-['Noto_Sans_KR:Regular'] font-normal inset-[6.96%_55.05%_91.44%_14.14%] leading-[normal] text-[#66635f] text-[12px] whitespace-nowrap">청도에서 어디로 갈까요?</p>
        <a onClick={() => go('places')} className="absolute inset-[6.77%_15.47%_91.51%_81.38%]"><div className="absolute inset-[-7.96%_-9.62%]"><img alt="저장한 장소" className="block max-w-none size-full" src={imgSavedPlaces} /></div></a>
        <a onClick={() => go('myInput')} className="absolute inset-[6.65%_5.87%_91.48%_90.23%]"><div className="absolute inset-[-7.31%_-7.76%]"><img alt="여행 편집" className="block max-w-none size-full" src={imgEditTrip} /></div></a>
      </div>
      <div className="absolute inset-[11.87%_0_63.24%_0] overflow-hidden"><img alt="" className="absolute left-0 max-w-none size-full top-0 object-cover" src={imgSariamPhotoReplaceable} /></div>
      <div className="absolute inset-[11.87%_0_63.24%_0]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPhotoContrastOverlay} /></div>
      <div className="absolute contents inset-[14.73%_5.56%_64.73%_5.56%]">
        <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[14.73%_58.08%_81.96%_5.56%] leading-[normal] text-[24px] text-white whitespace-nowrap">내 시간에 맞춰</p>
        <div className="absolute inset-[18.15%_57.32%_81.85%_5.56%]"><div className="absolute inset-[-0.75px_0]"><img alt="" className="block max-w-none size-full" src={imgTitleUnderline} /></div></div>
        <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[18.38%_58.08%_78.31%_5.56%] leading-[normal] text-[24px] text-white whitespace-nowrap">청도를 한 바퀴</p>
        <p className="absolute font-['Noto_Sans_KR:Regular'] font-normal inset-[23.74%_55.05%_74.66%_5.81%] leading-[normal] text-[12px] text-white whitespace-nowrap">코스부터 이동, 경비까지 한눈에</p>
        <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[33.79%_5.56%_64.73%_88.64%] leading-[normal] text-[11px] text-right text-white whitespace-nowrap">1 / 3</p>
      </div>
      <div className="absolute contents inset-[38.93%_8.46%_50.8%_5.3%]">
        <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[38.93%_59.34%_58.9%_5.3%] leading-[normal] text-[#24211d] text-[16px] whitespace-nowrap">여행 테마별 모아보기</p>
        <a onClick={() => go('places')} className="absolute contents">
          <div className="absolute inset-[43.82%_67.25%_53.75%_27.61%]"><div className="absolute inset-[-6.14%_-6.43%]"><img alt="" className="block max-w-none size-full" src={imgThemeWalk} /></div></div>
          <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[47.72%_66.04%_50.8%_26.14%] leading-[normal] text-[#44413d] text-[11px] text-center whitespace-nowrap">산책길</p>
        </a>
        <a onClick={() => go('benefits')} className="absolute contents">
          <div className="absolute inset-[44.09%_48.93%_54.14%_46.66%]"><div className="absolute inset-[-8.44%_-7.5%]"><img alt="" className="block max-w-none size-full" src={imgThemeDiscounts} /></div></div>
          <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[47.72%_45.83%_50.8%_43.31%] leading-[normal] text-[#44413d] text-[11px] text-center whitespace-nowrap">할인 혜택</p>
        </a>
        <a onClick={() => go('expense')} className="absolute contents">
          <div className="absolute inset-[43.82%_30.74%_53.75%_65.84%]"><div className="absolute inset-[-6.14%_-9.64%]"><img alt="" className="block max-w-none size-full" src={imgThemeExpenses} /></div></div>
          <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[47.72%_27.15%_50.8%_61.99%] leading-[normal] text-[#44413d] text-[11px] text-center whitespace-nowrap">여행 경비</p>
        </a>
        <a onClick={() => go('places')} className="absolute contents">
          <div className="absolute inset-[43.62%_11.63%_53.75%_84.11%]"><div className="absolute inset-[-5.67%_-7.76%]"><img alt="" className="block max-w-none size-full" src={imgThemePlaces} /></div></div>
          <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[47.72%_8.46%_50.8%_80.68%] leading-[normal] text-[#44413d] text-[11px] text-center whitespace-nowrap">청도 장소</p>
        </a>
        <a onClick={() => go('bus')} className="absolute contents">
          <div className="absolute inset-[43.98%_85.7%_53.78%_8.68%]"><div className="absolute inset-[-6.68%_-5.87%]"><img alt="" className="block max-w-none size-full" src={imgThemeBus} /></div></div>
          <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[47.72%_83.21%_50.8%_5.93%] leading-[normal] text-[#44413d] text-[11px] text-center whitespace-nowrap">버스 코스</p>
        </a>
      </div>
      <p className="absolute font-['Noto_Sans_KR:Regular'] font-normal inset-[52.05%_58.08%_46.46%_5.3%] leading-[normal] whitespace-nowrap text-[#6e6c68] text-[11px]">언제 도착하든, 내 여행의 속도로</p>
      <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[54.11%_48.23%_43.26%_5.3%] leading-[normal] whitespace-nowrap text-[#24211d] text-[19px]">청도에서 보내는 반나절</p>
      <a onClick={() => go('placeDetail')} className="absolute contents">
        <div className="absolute inset-[57.99%_40.4%_27.63%_5.05%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-size-[216px_126px]" style={{ maskImage: `url("${imgWineTunnelPhotoReplaceable}")` }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute left-0 max-w-none size-full top-0 object-cover" src={imgWineTunnelPhotoReplaceable1} /></div>
        </div>
        <div className="absolute inset-[63.93%_40.4%_27.63%_5.05%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_-52px] mask-size-[216px_126px]" style={{ maskImage: `url("${imgWineTunnelPhotoReplaceable}")` }}>
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWineTunnelPhotoOverlay} />
        </div>
        <p className="absolute font-['Noto_Sans_KR:Regular'] font-normal inset-[66.78%_65.4%_31.74%_8.08%] leading-[normal] text-[11px] text-white whitespace-nowrap">7번 버스로 떠나는 코스</p>
        <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[69.06%_61.62%_29%_8.08%] leading-[normal] text-[14px] text-white whitespace-nowrap">와인터널과 송금마을</p>
      </a>
      <a onClick={() => go('places')} className="absolute contents">
        <div className="absolute inset-[57.99%_-7.58%_27.63%_62.63%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-size-[178px_126px]" style={{ maskImage: `url("${imgCheongdoTownPhotoReplaceable}")` }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute left-0 max-w-none size-full top-0 object-cover" src={imgCheongdoTownPhotoReplaceable1} /></div>
        </div>
        <div className="absolute inset-[63.93%_-7.58%_27.63%_62.63%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_-52px] mask-size-[178px_126px]" style={{ maskImage: `url("${imgCheongdoTownPhotoReplaceable}")` }}>
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheongdoTownPhotoOverlay} />
        </div>
        <p className="absolute font-['Noto_Sans_KR:Regular'] font-normal inset-[66.78%_15.66%_31.74%_65.66%] leading-[normal] text-[11px] text-white whitespace-nowrap">천천히 둘러보기</p>
        <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[69.06%_17.17%_29%_65.66%] leading-[normal] text-[14px] text-white whitespace-nowrap">청도읍 풍경</p>
      </a>
      <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold leading-[normal] whitespace-nowrap inset-[75.23%_66.67%_22.6%_5.3%] text-[#24211d] text-[16px]">오늘의 추천 동선</p>
      <a onClick={() => go('bus')} className="absolute font-['Noto_Sans_KR:Bold'] font-bold leading-[normal] whitespace-nowrap inset-[75.68%_5.56%_22.83%_80.05%] text-[#6e6c68] text-[11px] text-right">코스 보기 ↗</a>
      <a onClick={() => go('bus')} className="absolute contents">
        <div className="absolute inset-[78.6%_5.18%_10.56%_5.18%]"><div className="absolute inset-[-0.53%_-0.14%]"><img alt="" className="block max-w-none size-full" src={imgRouteCardSurface} /></div></div>
        <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[80.48%_54.55%_17.69%_9.34%] leading-[normal] text-[#24211d] text-[13px] whitespace-nowrap">와인터널·송금마을 반나절</p>
        <p className="absolute font-['Noto_Sans_KR:Regular'] font-normal inset-[80.71%_9.34%_17.81%_72.73%] leading-[normal] text-[#6b6863] text-[11px] text-right whitespace-nowrap">7번 버스 + 도보</p>
        <div className="absolute inset-[85.5%_23.99%_13.81%_18.69%]"><div className="absolute inset-[-8.33%_-0.22%_-8.33%_-0.44%]"><img alt="" className="block max-w-none size-full" src={imgRouteConnectors} /></div></div>
        <div className="absolute inset-[85.39%_17.93%_13.7%_12.63%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRouteStops} /></div>
        <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[86.42%_82.45%_12.1%_9.72%] leading-[normal] text-[#24211d] text-[11px] text-center whitespace-nowrap">청도역</p>
        <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[86.42%_47.35%_12.1%_42.3%] leading-[normal] text-[#24211d] text-[11px] text-center whitespace-nowrap">와인터널</p>
        <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[86.42%_13.76%_12.1%_75.88%] leading-[normal] text-[#24211d] text-[11px] text-center whitespace-nowrap">송금마을</p>
      </a>
      <div className="absolute contents inset-[91.67%_0_0_0]">
        <div className="absolute inset-[91.67%_0_0_0]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNavigationBackground} /></div>
        <div className="absolute inset-[91.67%_0_8.33%_0]"><div className="absolute inset-[-0.5px_0]"><img alt="" className="block max-w-none size-full" src={imgNavigationDivider} /></div></div>
        <div className="absolute inset-[93.04%_85.1%_4.91%_10.35%]"><div className="absolute inset-[-5.56%]"><img alt="" className="block max-w-none size-full" src={imgHomeTabIcon} /></div></div>
        <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[96%_85.98%_2.51%_11.24%] leading-[normal] text-[#22201d] text-[11px] text-center whitespace-nowrap">홈</p>
        <a onClick={() => go('myInput')} className="absolute contents">
          <div className="absolute inset-[93.32%_66.41%_4.91%_29.04%]"><div className="absolute inset-[-6.45%_-5.56%]"><img alt="" className="block max-w-none size-full" src={imgMyRouteTabIcon} /></div></div>
          <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[96%_64.52%_2.51%_27.15%] leading-[normal] text-[#6e6b66] text-[11px] text-center whitespace-nowrap">내 코스</p>
        </a>
        <a onClick={() => go('expense')} className="absolute contents">
          <div className="absolute inset-[93.04%_48.23%_4.91%_48.23%]"><div className="absolute inset-[-5.56%_-7.14%]"><img alt="" className="block max-w-none size-full" src={imgExpensesTabIcon} /></div></div>
          <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[96%_47.35%_2.51%_47.35%] leading-[normal] text-[#6e6b66] text-[11px] text-center whitespace-nowrap">경비</p>
        </a>
        <a onClick={() => go('benefits')} className="absolute contents">
          <div className="absolute inset-[93.04%_28.79%_4.91%_66.67%]"><div className="absolute inset-[-5.56%]"><img alt="" className="block max-w-none size-full" src={imgBenefitsTabIcon} /></div></div>
          <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[96%_28.66%_2.51%_66.04%] leading-[normal] text-[#6e6b66] text-[11px] text-center whitespace-nowrap">혜택</p>
        </a>
        <a onClick={() => go('places')} className="absolute contents">
          <div className="absolute inset-[92.87%_10.73%_4.91%_85.48%]"><div className="absolute inset-[-5.13%_-6.67%]"><img alt="" className="block max-w-none size-full" src={imgPlacesTabIcon} /></div></div>
          <p className="absolute font-['Noto_Sans_KR:Bold'] font-bold inset-[96%_9.97%_2.51%_84.72%] leading-[normal] text-[#6e6b66] text-[11px] text-center whitespace-nowrap">장소</p>
        </a>
        <div className="absolute inset-[98.74%_35.1%_0.8%_35.1%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgHomeIndicator} /></div>
      </div>
    </div>
  );
}
