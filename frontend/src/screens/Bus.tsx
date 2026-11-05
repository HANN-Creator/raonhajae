import { visitsVillage } from '../map';
import { MapFab } from '../ui';
import { useEffect, useState } from 'react';
import { fallbackRecommendation, getBusSchedule, readRecommendation, type BusSchedule } from '../api';

const assetPathPrefix = "/assets/123f7f76-b1d6-4ccf-931a-fd84185a76e4";
const img = `${assetPathPrefix}/faa59.svg`;
const imgBackToHome = `${assetPathPrefix}/f3d6d.svg`;
const imgSaveRouteBookmark = `${assetPathPrefix}/9a43e.svg`;
const imgHeaderDivider = `${assetPathPrefix}/0b784.svg`;
const imgCourseBusDot = `${assetPathPrefix}/32018.svg`;
const imgCourseWalkingDot = `${assetPathPrefix}/13b2a.svg`;
const imgMapPanel = `${assetPathPrefix}/2dbd2.svg`;
const imgWesternRoad = `${assetPathPrefix}/6a1a3.svg`;
const imgNorthernLane = `${assetPathPrefix}/74623.svg`;
const imgEasternLane = `${assetPathPrefix}/8e2ca.svg`;
const imgCentralRoad = `${assetPathPrefix}/fd0a0.svg`;
const imgSouthernRoad = `${assetPathPrefix}/b8f22.svg`;
const imgStationLane = `${assetPathPrefix}/b83fa.svg`;
const imgMiddleLane = `${assetPathPrefix}/02baf.svg`;
const imgVillageLane = `${assetPathPrefix}/d60ad.svg`;
const imgLowerCrossLane = `${assetPathPrefix}/1c37f.svg`;
const imgUpperCrossLane = `${assetPathPrefix}/ce7da.svg`;
const imgBusPathCasing = `${assetPathPrefix}/c0262.svg`;
const imgBusPathSchematic = `${assetPathPrefix}/231e2.svg`;
const imgWalkingPathCasing = `${assetPathPrefix}/0eae3.svg`;
const imgWalkingLinkSchematic = `${assetPathPrefix}/568a9.svg`;
const imgStationHalo = `${assetPathPrefix}/5605a.svg`;
const imgStationPoint = `${assetPathPrefix}/218c7.svg`;
const imgStationCenter = `${assetPathPrefix}/06d66.svg`;
const imgTunnelHalo = `${assetPathPrefix}/38ac4.svg`;
const imgTunnelPoint = `${assetPathPrefix}/c59c7.svg`;
const imgTunnelCenter = `${assetPathPrefix}/d5a03.svg`;
const imgVillagePoint = `${assetPathPrefix}/9e67e.svg`;
const imgStationLabelGround = `${assetPathPrefix}/cec60.svg`;
const imgTunnelLabelGround = `${assetPathPrefix}/64fbf.svg`;
const imgVillageLabelGround = `${assetPathPrefix}/d1456.svg`;
const imgDiagramLabelGround = `${assetPathPrefix}/25964.svg`;
const imgBusBadgeGround = `${assetPathPrefix}/a8cb6.svg`;
const imgWalkingBadgeGround = `${assetPathPrefix}/6afbe.svg`;
const imgTimelineSpine = `${assetPathPrefix}/5d9cb.svg`;
const imgDepartureDot = `${assetPathPrefix}/5396e.svg`;
const imgWalkDot = `${assetPathPrefix}/2e658.svg`;
const imgOfficialTimetableButton = `${assetPathPrefix}/69fd9.svg`;
const imgNavigationBackground = `${assetPathPrefix}/312fb.svg`;
const imgHomeTabIcon = `${assetPathPrefix}/6e4a4.svg`;
const imgMyRouteTabIcon = `${assetPathPrefix}/9fce1.svg`;
const imgExpensesTabIcon = `${assetPathPrefix}/a30b4.svg`;
const imgBenefitsTabIcon = `${assetPathPrefix}/7e949.svg`;
const imgPlacesTabIcon = `${assetPathPrefix}/7f589.svg`;

const I = ({ c, s, pad }: { c: string; s: string; pad?: string }) =>
  pad ? <div className={`absolute ${c}`}><div className={`absolute ${pad}`}><img alt="" className="block max-w-none size-full" src={s} /></div></div>
      : <div className={`absolute ${c}`}><img alt="" className="absolute block inset-0 max-w-none size-full" src={s} /></div>;
const B = "absolute font-['Noto_Sans_KR:Bold'] font-bold leading-[normal] whitespace-nowrap";
const R = "absolute font-['Noto_Sans_KR:Regular'] font-normal leading-[normal] whitespace-nowrap";

export default function Bus() {
  const recommendation = readRecommendation()?.recommendation ?? fallbackRecommendation;
  const [schedule, setSchedule] = useState<BusSchedule | null>(null);
  const [scheduleError, setScheduleError] = useState('');
  useEffect(() => {
    let active = true;
    getBusSchedule().then((result) => {
      if (!active) return;
      setSchedule(result.schedule);
      setScheduleError(result.error ?? '');
    });
    return () => { active = false; };
  }, []);
  const stops = recommendation.stops;
  const placeStops = stops.filter((stop) => stop.kind === 'place');
  // no saved recommendation → show the full course; wine-tunnel-only course hides the village leg
  const hasVillage = visitsVillage(stops);
  const routeSummary = placeStops.length
    ? `청도역 → ${placeStops.map((stop) => stop.title.replace(/ 둘러보기| 산책$/, '')).join(' → ')}`
    : '서버 추천 동선의 이동 안내';
  const timeFor = (index: number) => stops[index]?.time ?? '미정';
  const returnTime = timeFor(stops.length - 1);
  const scheduleSummary = schedule
    ? `${schedule.status === 'live' ? '청도군 게시 시간표' : '저장 시간표'} · ${schedule.runs.map((run) => run.depart).join(' · ') || '운행편 없음'}`
    : scheduleError || '버스 시간표를 불러오는 중…';
  return (
    <div className="relative size-full" data-name="버스 코스 화면">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={img} />
      <button aria-label="이전 화면" className="absolute block cursor-pointer inset-[2.4%_92.42%_95.77%_5.56%]" data-name="Back to home">
        <div className="absolute inset-[-7.5%_-15%]"><img alt="뒤로" className="block max-w-none size-full" src={imgBackToHome} /></div>
      </button>
      <p className={`${B} inset-[1.72%_64.14%_95.32%_14.14%] text-[#24211d] text-[22px]`}>버스 코스</p>
      <I c="inset-[6.68%_6.69%_91.53%_90.03%]" s={imgSaveRouteBookmark} pad="inset-[-7.96%_-9.62%]" />
      <I c="inset-[7.5%_0_92.5%_0]" s={imgHeaderDivider} pad="inset-[-0.5px_-0.13%]" />
      <p className={`${B} inset-[12.33%_42.42%_85.05%_5.05%] text-[#24211d] text-[19px]`}>{recommendation.title}</p>
      <p className={`${R} inset-[15.87%_55.3%_82.53%_5.05%] truncate text-[#6e6c68] text-[12px]`}>{routeSummary}</p>
      <I c="inset-[19.18%_92.93%_80.14%_5.56%]" s={imgCourseBusDot} />
      <p className={`${B} inset-[18.72%_79.55%_79.79%_8.84%] text-[#7d3d00] text-[11px]`}>{recommendation.busMinutes !== undefined ? `버스 ${recommendation.busMinutes}분` : '7번 버스'}</p>
      <I c="inset-[19.18%_67.93%_80.14%_30.56%]" s={imgCourseWalkingDot} />
      <p className={`${B} inset-[18.72%_46.46%_79.79%_33.84%] text-[#6e6c68] text-[11px]`}>{hasVillage ? '도보 연결' : '이동 안내'}</p>
      <p className={`${B} inset-[18.72%_5.05%_79.79%_78%] text-[#6e6c68] text-[10px] text-right`}>{returnTime} 귀환</p>
      <I c="inset-[21.69%_5.05%_45.32%_5.05%]" s={imgMapPanel} />
      <I c="inset-[27.05%_44.95%_70.23%_4.55%]" s={imgWesternRoad} pad="inset-[-21.02%_-2.5%_-21.01%_-2.5%]" />
      {hasVillage && <I c="inset-[21.58%_59.34%_63.93%_20.96%]" s={imgNorthernLane} pad="inset-[-2.76%_-4.49%]" />}
      <I c="inset-[21.92%_5.05%_62.56%_64.9%]" s={imgEasternLane} pad="inset-[-3.31%_-3.78%_-3.31%_-3.77%]" />
      <I c="inset-[35.51%_5.05%_58.97%_4.55%]" s={imgCentralRoad} pad="inset-[-8.28%_-1.12%]" />
      <I c="inset-[46.83%_5.05%_49.47%_4.55%]" s={imgSouthernRoad} pad="inset-[-15.44%_-1.4%_-15.45%_-1.4%]" />
      <I c="inset-[36.53%_83.33%_49.89%_12.88%]" s={imgStationLane} pad="inset-[-2.94%_-23.34%]" />
      <I c="inset-[23.86%_43.94%_47.15%_45.41%]" s={imgMiddleLane} pad="inset-[-1.18%_-7.12%_-1.18%_-7.11%]" />
      {hasVillage && <I c="inset-[25.57%_13.64%_46.8%_81.17%]" s={imgVillageLane} pad="inset-[-1.24%_-14.59%]" />}
      <I c="inset-[42.81%_5.05%_54.35%_4.55%]" s={imgLowerCrossLane} pad="inset-[-10.07%_-0.7%]" />
      <I c="inset-[22.84%_54.04%_74.27%_4.55%]" s={imgUpperCrossLane} pad="inset-[-9.9%_-1.52%_-9.91%_-1.52%]" />
      <p className={`${R} inset-[40.07%_56.57%_58.11%_34.34%] text-[#d7d1c9] text-[13px]`}>청도읍</p>
      <p className={`${R} inset-[50.23%_26.52%_48.17%_64.9%] text-[#d7d1c9] text-[12px]`}>남성현</p>
      <I c="inset-[29.92%_39.65%_51.48%_15.91%]" s={imgBusPathCasing} pad="inset-[-3.99%_-3.69%]" />
      <I c="inset-[29.92%_39.65%_51.48%_15.91%]" s={imgBusPathSchematic} pad="inset-[-1.84%_-1.7%]" />
      {hasVillage && <>
        <I c="inset-[31.28%_18.43%_56.96%_60.35%]" s={imgWalkingPathCasing} pad="inset-[-4.86%_-5.95%]" />
        <I c="inset-[31.28%_18.43%_56.96%_60.35%]" s={imgWalkingLinkSchematic} pad="inset-[-1.94%_-2.38%]" />
      </>}
      <I c="inset-[46.92%_80.56%_49.89%_12.37%]" s={imgStationHalo} />
      <I c="inset-[47.6%_82.07%_50.57%_13.89%]" s={imgStationPoint} />
      <I c="inset-[48.23%_83.46%_51.2%_15.28%]" s={imgStationCenter} />
      <I c="inset-[29.57%_35.86%_67.01%_56.57%]" s={imgTunnelHalo} />
      <I c="inset-[30.25%_37.37%_67.69%_58.08%]" s={imgTunnelPoint} />
      <I c="inset-[30.94%_38.89%_68.38%_59.6%]" s={imgTunnelCenter} />
      {hasVillage && <>
        <I c="inset-[41.44%_14.9%_55.37%_78.03%]" s={imgStationHalo} />
        <I c="inset-[42.12%_16.41%_56.05%_79.55%]" s={imgVillagePoint} />
        <I c="inset-[42.75%_17.8%_56.68%_80.93%]" s={imgStationCenter} />
      </>}
      <I c="inset-[50.34%_73.99%_46.8%_6.06%]" s={imgStationLabelGround} />
      <p className={`${B} inset-[51.03%_80.18%_47.49%_11.99%] text-[#24211d] text-[11px] text-center`}>청도역</p>
      <I c="inset-[26.14%_27.53%_71%_47.98%]" s={imgTunnelLabelGround} />
      <p className={`${B} inset-[26.83%_34.47%_71.69%_55.18%] text-[#24211d] text-[11px] text-center`}>와인터널</p>
      {hasVillage && <>
        <I c="inset-[44.63%_6.82%_52.51%_70.71%]" s={imgVillageLabelGround} />
        <p className={`${B} inset-[45.32%_13.01%_53.2%_76.64%] text-[#24211d] text-[11px] text-center`}>송금마을</p>
      </>}
      <I c="inset-[22.83%_78.28%_74.32%_7.83%]" s={imgDiagramLabelGround} />
      <p className={`${B} bottom-3/4 left-[10.73%] right-[81.44%] top-[23.52%] text-[#6e6c68] text-[11px] text-center`}>개략 동선</p>
      <p className={`${R} inset-[23.6%_auto_75%_20.5%] text-[#9c978f] text-[10px]`}>실제 길 안내 아님 · 현장에서 확인</p>
      <I c="inset-[22.83%_7.83%_74.32%_67.68%]" s={imgBusBadgeGround} />
      <I c="inset-[23.86%_27.78%_75.46%_70.71%]" s={imgCourseBusDot} />
      <p className={`${B} bottom-3/4 left-[74.75%] right-[15.15%] top-[23.52%] text-[#7d3d00] text-[11px]`}>7번 버스</p>
      {hasVillage && <>
        <I c="inset-[50.46%_7.83%_46.69%_65.66%]" s={imgWalkingBadgeGround} />
        <I c="inset-[51.48%_30.05%_47.83%_68.43%]" s={imgCourseWalkingDot} />
        <p className={`${B} inset-[51.26%_13.13%_47.37%_71.72%] text-[#6e6c68] text-[10px]`}>도보 연결</p>
      </>}
      <p className={`${B} inset-[56.39%_67.93%_41.44%_5.05%] text-[#24211d] text-[16px]`}>이렇게 이동해요</p>
      <a href="https://www.cheongdo.go.kr/traffic/contents/01/bus/bus_time.jsp" target="_blank" rel="noreferrer" className={`${B} inset-[56.96%_5.05%_41.55%_78.03%] text-[#7d3d00] text-[11px] text-right`}>시간표 원문 ↗</a>
      {stops.length > 0 ? <>
        <I c="inset-[61.42%_91.92%_21.46%_8.08%]" s={imgTimelineSpine} pad="inset-[-0.67%_-1px]" />
        {stops.map((stop, index) => {
          const rowHeight = 18.5 / stops.length;
          const top = 61 + index * rowHeight;
          const node = stop.kind === 'bus' ? imgCourseBusDot : stop.kind === 'place' ? imgWalkDot : imgDepartureDot;
          return (
            <div key={`${stop.title}-${index}`} className="contents">
              <div className="absolute left-[6.82%] right-[90.66%]" style={{ top: `${top + 0.1}%`, bottom: `${100 - top - 1.5}%` }}>
                <img alt="" className="absolute inset-0 size-full" src={node} />
              </div>
              <p className={`${B} left-[12.63%] right-[79.04%] text-[#7d3d00] text-[11px]`} style={{ top: `${top}%`, bottom: `${100 - top - 1.3}%` }}>
                {stop.time ?? '미정'}
              </p>
              <p className={`${B} left-[27.53%] right-[5.05%] truncate text-[#24211d] text-[12px]`} style={{ top: `${top}%`, bottom: `${100 - top - 1.3}%` }}>
                {stop.title}
              </p>
              <p className={`${R} left-[27.53%] right-[5.05%] truncate text-[#6e6c68] text-[10px]`} style={{ top: `${top + 1.25}%`, bottom: `${100 - top - 3.2}%` }}>
                {stop.description}
              </p>
              {index < stops.length - 1 && <div className="absolute left-[12.63%] right-[5.05%] border-t border-[#e6e1da]" style={{ top: `${top + rowHeight - 0.1}%` }} />}
            </div>
          );
        })}
      </> : (
        <p className={`${R} absolute inset-[64%_8%_23%_12.63%] text-[#6e6c68] text-[12px]`} role="status">
          {recommendation.reason ?? recommendation.summary}
        </p>
      )}
      <p className={`${R} inset-[81.39%_10%_17.12%_5.05%] truncate text-[#6e6c68] text-[10px]`} role="status" aria-live="polite">
        {scheduleSummary}{schedule?.publishedAt ? ` · ${schedule.publishedAt}` : ''}
      </p>
      <a className="absolute contents cursor-pointer" href="https://www.cheongdo.go.kr/traffic/contents/01/bus/bus_time.jsp" target="_blank" rel="noreferrer">
        <I c="inset-[84.59%_5.05%_9.93%_5.05%]" s={imgOfficialTimetableButton} />
        <p className={`${B} inset-[86.53%_30.93%_11.64%_30.93%] text-[13px] text-center text-white`}>청도군 7번 버스 시간표 확인</p>
      </a>
      <div data-mock-bottom-nav className="contents">
      <I c="inset-[91.67%_0_0_0]" s={imgNavigationBackground} />
      <I c="inset-[91.67%_0_8.33%_0]" s={imgHeaderDivider} pad="inset-[-0.5px_-0.13%]" />
      <a className="absolute contents cursor-pointer" data-name="홈 열기">
        <I c="inset-[93.04%_85.1%_4.91%_10.35%]" s={imgHomeTabIcon} pad="inset-[-5.56%]" />
        <p className={`${B} inset-[96%_85.98%_2.51%_11.24%] text-[#7d3d00] text-[11px] text-center`}>홈</p>
      </a>
      <a className="absolute contents cursor-pointer" data-name="내 코스 열기">
        <I c="inset-[93.32%_66.41%_4.91%_29.04%]" s={imgMyRouteTabIcon} pad="inset-[-6.45%_-5.56%]" />
        <p className={`${B} inset-[96%_64.52%_2.51%_27.15%] text-[#6e6c68] text-[11px] text-center`}>내 코스</p>
      </a>
      <a className="absolute contents cursor-pointer" data-name="경비 열기">
        <I c="inset-[93.04%_48.23%_4.91%_48.23%]" s={imgExpensesTabIcon} pad="inset-[-5.56%_-7.14%]" />
        <p className={`${B} inset-[96%_47.35%_2.51%_47.35%] text-[#6e6c68] text-[11px] text-center`}>경비</p>
      </a>
      <a className="absolute contents cursor-pointer" data-name="혜택 열기">
        <I c="inset-[93.26%_29.04%_4.91%_66.67%]" s={imgBenefitsTabIcon} pad="inset-[-6.25%_-5.88%]" />
        <p className={`${B} inset-[96%_28.66%_2.51%_66.04%] text-[#6e6c68] text-[11px] text-center`}>혜택</p>
      </a>
      <a className="absolute contents cursor-pointer" data-name="장소 열기">
        <I c="inset-[92.87%_10.73%_4.91%_85.48%]" s={imgPlacesTabIcon} pad="inset-[-5.13%_-6.67%]" />
        <p className={`${B} inset-[96%_9.97%_2.51%_84.72%] text-[#6e6c68] text-[11px] text-center`}>장소</p>
      </a>
      </div>
      <MapFab c="right-[5.05%] top-[1.8%]" />
    </div>
  );
}
