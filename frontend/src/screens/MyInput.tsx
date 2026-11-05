import { useState } from 'react';
import { createRecommendation, saveRecommendation } from '../api';
import type { ScreenProps } from '../nav';
import { B, Bg, BottomNav, Header, I, R, StatusBar } from '../ui';

const assetPathPrefix = "/assets/06d166a1-f626-4a15-b891-d6ea61851e9c";
const imgDateField = `${assetPathPrefix}/eeffa.svg`;
const imgCalendarIcon = `${assetPathPrefix}/42db1.svg`;
const imgDateChevron = `${assetPathPrefix}/01ff0.svg`;
const imgSaturdayChipSelected = `${assetPathPrefix}/7c9ab.svg`;
const imgSundayChip = `${assetPathPrefix}/8aa90.svg`;
const imgArrivalTimeField = `${assetPathPrefix}/8f1a7.svg`;
const imgClockFace = `${assetPathPrefix}/00557.svg`;
const imgClockHands = `${assetPathPrefix}/32100.svg`;
const imgEasyPaceSelected = `${assetPathPrefix}/e3586.svg`;
const imgEasySelectionDot = `${assetPathPrefix}/0ea08.svg`;
const imgEasySelectionInner = `${assetPathPrefix}/e8e30.svg`;
const imgSlowPaceOption = `${assetPathPrefix}/60b56.svg`;
const imgSlowSelectionCircle = `${assetPathPrefix}/bc2f5.svg`;
const imgCalculationNoteSurface = `${assetPathPrefix}/e88e5.svg`;
const imgFindCourseButton = `${assetPathPrefix}/69fd9.svg`;

// chip column positions [chip box, weekday label, day number]
const CHIP_LAYOUTS = [
  ['inset-[34.93%_78.79%_58.45%_5.05%]', 'inset-[35.96%_85.48%_62.56%_11.74%]', 'inset-[38.01%_85.35%_59.36%_11.62%]'],
  ['inset-[34.93%_60.35%_58.45%_23.48%]', 'inset-[35.96%_67.05%_62.56%_30.18%]', 'inset-[38.01%_66.92%_59.36%_30.05%]'],
  ['inset-[34.93%_41.92%_58.45%_41.92%]', 'inset-[35.96%_48.61%_62.56%_48.61%]', 'inset-[38.01%_48.48%_59.36%_48.48%]'],
  ['inset-[34.93%_23.48%_58.45%_60.35%]', 'inset-[35.96%_30.18%_62.56%_67.05%]', 'inset-[38.01%_28.66%_59.36%_65.53%]'],
  ['inset-[34.93%_5.05%_58.45%_78.79%]', 'inset-[35.96%_11.74%_62.56%_85.48%]', 'inset-[38.01%_10.23%_59.36%_83.96%]'],
];

export default function MyInput({ go }: ScreenProps) {
  const [day, setDay] = useState(0);
  const [time, setTime] = useState('10:50');
  const [slow, setSlow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dates = Array.from({ length: 5 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 2);
    return date;
  });
  const selectedDate = dates[day];
  const pad = (value: number) => String(value).padStart(2, '0');
  const visitDate = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const [easyBox, slowBox] = slow
    ? ['inset-[62.9%_5.05%_28.65%_51.52%]', 'inset-[62.9%_51.52%_28.65%_5.05%]']
    : ['inset-[62.9%_51.52%_28.65%_5.05%]', 'inset-[62.9%_5.05%_28.65%_51.52%]'];
  const findCourse = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    const request = { visitDate, arrivalTime: time, pace: slow ? 'slow' as const : 'easy' as const };
    try {
      const { recommendation, usingFallback, error: apiError } = await createRecommendation(request);
      saveRecommendation(recommendation, request, usingFallback, apiError);
      go('myResult');
    } catch {
      setError('추천 코스를 저장하지 못했어요. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative size-full" data-name="코스 조건" data-visit-date={visitDate}>
      <Bg /><StatusBar />
      <Header title="내 코스" />
      <p className={`${B} inset-[12.67%_50.76%_84.47%_5.05%] text-[#24211d] text-[21px]`}>언제 청도에 오세요?</p>
      <p className={`${R} inset-[16.32%_43.18%_82.08%_5.05%] text-[#6e6c68] text-[12px]`}>도착 시간에 맞는 여행 동선을 찾아드려요.</p>
      <p className={`${B} inset-[20.78%_82.07%_77.4%_5.05%] text-[#24211d] text-[13px]`}>여행 날짜</p>
      <I c="inset-[23.74%_5.05%_69.98%_5.05%]" s={imgDateField} pad="inset-[-0.91%_-0.14%]" />
      <I c="inset-[25.9%_85.83%_72.14%_9.82%]" s={imgCalendarIcon} pad="inset-[-6.14%]" />
      <p className={`${B} inset-[26.03%_44.7%_72.03%_18.69%] text-[#24211d] text-[14px]`}>{selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 {weekdays[selectedDate.getDay()]}요일</p>
      <I c="inset-[26.26%_9.34%_72.37%_89.14%]" s={imgDateChevron} pad="inset-[-7.5%_-15%]" />
      <p className={`${B} inset-[32.19%_80.3%_66.21%_5.05%] text-[#6e6c68] text-[12px]`}>가까운 날짜</p>
      {CHIP_LAYOUTS.map(([box, wd, num], i) => (
        <button key={i} className="absolute contents cursor-pointer" onClick={() => setDay(i)}>
          <I c={box} s={i === day ? imgSaturdayChipSelected : imgSundayChip} pad={i === day ? 'inset-[-1.03%_-0.94%]' : 'inset-[-0.86%_-0.78%]'} />
          <p className={`${i === day ? B : R} ${wd} ${i === day ? 'text-[#7d3d00]' : 'text-[#6e6c68]'} text-[11px] text-center`}>{weekdays[dates[i].getDay()]}</p>
          <p className={`${B} ${num} ${i === day ? 'text-[#7d3d00]' : 'text-[#24211d]'} text-[19px] text-center`}>{dates[i].getDate()}</p>
        </button>
      ))}
      <p className={`${B} inset-[44.41%_75.25%_53.77%_5.05%] text-[#24211d] text-[13px]`}>청도 도착 시각</p>
      <I c="inset-[47.37%_5.05%_45.78%_5.05%]" s={imgArrivalTimeField} pad="inset-[-0.83%_-0.14%]" />
      <I c="inset-[49.43%_84.34%_47.83%_9.6%]" s={imgClockFace} pad="inset-[-4.17%]" />
      <I c="inset-[49.89%_86.11%_48.74%_12.63%]" s={imgClockHands} pad="inset-[-8.33%_-20%]" />
      <input type="time" aria-label="청도 도착 시각" value={time} onChange={e => setTime(e.target.value)}
        className={`${B} inset-[49.43%_40%_47.83%_19.95%] text-[#24211d] text-[20px] bg-transparent outline-none`} />
      <p className={`${B} bottom-[48.52%] left-[78.54%] right-[10.61%] top-1/2 text-[#7d3d00] text-[11px] text-right pointer-events-none`}>시각 변경</p>
      <p className={`${R} inset-[55.14%_43.69%_43.38%_5.05%] text-[#6e6c68] text-[11px]`}>승차 위치로 이동할 여유 20분 이상을 더해요.</p>
      <p className={`${B} inset-[59.82%_82.07%_38.36%_5.05%] text-[#24211d] text-[13px]`}>여행 속도</p>
      <I c={easyBox} s={imgEasyPaceSelected} pad="inset-[-0.81%_-0.35%]" />
      <I c={slowBox} s={imgSlowPaceOption} pad="inset-[-0.68%_-0.29%]" />
      <button className="absolute inset-[62.9%_51.52%_28.65%_5.05%] cursor-pointer" aria-label="가볍게 둘러보기" onClick={() => setSlow(false)} />
      <button className="absolute inset-[62.9%_5.05%_28.65%_51.52%] cursor-pointer" aria-label="여유롭게 둘러보기" onClick={() => setSlow(true)} />
      {slow ? <>
        <I c="inset-[64.38%_89.39%_34.25%_7.58%]" s={imgSlowSelectionCircle} pad="inset-[-5.83%]" />
        <I c="inset-[64.38%_42.93%_34.25%_54.04%]" s={imgEasySelectionDot} />
        <I c="inset-[64.84%_43.94%_34.7%_55.05%]" s={imgEasySelectionInner} />
      </> : <>
        <I c="inset-[64.38%_89.39%_34.25%_7.58%]" s={imgEasySelectionDot} />
        <I c="inset-[64.84%_90.4%_34.7%_8.59%]" s={imgEasySelectionInner} />
        <I c="inset-[64.38%_42.93%_34.25%_54.04%]" s={imgSlowSelectionCircle} pad="inset-[-5.83%]" />
      </>}
      <p className={`${B} inset-[64.16%_65.4%_34.02%_12.63%] text-[#24211d] text-[13px] pointer-events-none`}>가볍게 둘러보기</p>
      <p className={`${R} inset-[67.35%_69.19%_31.16%_9.09%] text-[#6e6c68] text-[11px] pointer-events-none`}>핵심 장소를 차례로</p>
      <p className={`${B} inset-[64.16%_15.91%_34.02%_59.09%] text-[#24211d] text-[13px] pointer-events-none`}>여유롭게 둘러보기</p>
      <p className={`${R} inset-[67.35%_21.97%_31.16%_55.56%] text-[#6e6c68] text-[11px] pointer-events-none`}>한 장소에서 더 오래</p>
      <I c="inset-[73.86%_5.05%_19.06%_5.05%]" s={imgCalculationNoteSurface} />
      <p className={`${B} inset-[75.23%_71.21%_23.17%_8.59%] text-[#24211d] text-[12px]`}>추천에 반영돼요</p>
      <p className={`${R} inset-[77.74%_42.68%_20.78%_8.59%] text-[#6e6c68] text-[11px]`}>7번 버스 왕복 시각 · 도보 여유 · 여행 속도</p>
      <p role={error ? 'alert' : undefined} className={`${R} inset-[81.96%_40.4%_16.55%_5.05%] ${error ? 'text-[#a84032]' : 'text-[#6e6c68]'} text-[11px]`}>
        {error || '시간표는 서버가 확인한 경우에만 코스에 반영돼요.'}
      </p>
      <button className="absolute contents cursor-pointer disabled:cursor-wait" onClick={findCourse} disabled={loading}>
        <I c="inset-[84.59%_5.05%_9.93%_5.05%]" s={imgFindCourseButton} />
        <p className={`${B} inset-[86.42%_32.07%_11.64%_32.07%] text-[14px] text-center text-white`}>
          {loading ? '코스를 찾고 있어요…' : '내 시간에 맞는 코스 보기'}
        </p>
      </button>
      <BottomNav active="myRoute" />
    </div>
  );
}
