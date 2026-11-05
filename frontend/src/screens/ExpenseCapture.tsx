import { useState } from 'react';
import { B, Bg, BottomNav, Header, I, R, StatusBar } from '../ui';

const assetPathPrefix = "/assets/32743681-00a4-4aaf-b309-9c15b4a0f506";
const imgCaptureSurface = `${assetPathPrefix}/d7412.svg`;
const imgCamera = `${assetPathPrefix}/af3d9.svg`;
const imgCaptureDivider = `${assetPathPrefix}/b1658.svg`;
const imgField = `${assetPathPrefix}/d2797.svg`;
const imgHalfField = `${assetPathPrefix}/e6e71.svg`;
const imgDropdown = `${assetPathPrefix}/f84c3.svg`;
const imgPayerField = `${assetPathPrefix}/bc410.svg`;
const imgButton = `${assetPathPrefix}/69fd9.svg`;

const field = "absolute font-['Noto_Sans_KR:Bold'] font-bold bg-transparent outline-none text-[#24211d] appearance-none";

export default function ExpenseCapture() {
  const [file, setFile] = useState('payment_1104.png');
  const [shared, setShared] = useState(true);
  return (
    <div className="relative size-full">
      <Bg /><StatusBar />
      <Header title="경비 등록" />
      <label className="absolute contents cursor-pointer">
        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && setFile(e.target.files[0].name)} />
        <I c="inset-[12.9%_5.05%_71.92%_5.05%]" s={imgCaptureSurface} />
        <I c="inset-[16.25%_83.28%_81.32%_10.55%]" s={imgCamera} pad="inset-[-6.75%_-5.87%]" />
        <p className={`${B} inset-[15.87%_58.08%_82.19%_20.71%] text-[#24211d] text-[14px]`}>결제 내역 캡처</p>
        <p className={`${R} inset-[18.84%_auto_79.68%_20.71%] text-[#6e6c68] text-[11px]`}>{file} · 이미지 교체</p>
      </label>
      <I c="inset-[22.03%_9.09%_77.97%_9.09%]" s={imgCaptureDivider} pad="inset-[-0.5px_-0.15%]" />
      <p className={`${R} inset-[24.09%_44.19%_74.43%_9.09%] text-[#7d3d00] text-[11px]`}>이미지에서 읽은 내용을 아래에 채웠어요.</p>
      <p className={`${R} inset-[29.57%_55.81%_68.95%_5.05%] text-[#6e6c68] text-[11px]`}>인식 결과 예시 · 저장 전 수정 가능</p>

      <p className={`${B} inset-[33.79%_86.36%_64.61%_5.05%] text-[#24211d] text-[12px]`}>사용처</p>
      <I c="inset-[36.53%_5.05%_57.88%_5.05%]" s={imgField} pad="inset-[-1.02%_-0.14%]" />
      <input aria-label="사용처" defaultValue="와인터널 입장" className={`${field} inset-[36.53%_8%_57.88%_8.59%] text-[14px]`} />

      <p className={`${B} inset-[44.75%_89.14%_53.65%_5.05%] text-[#24211d] text-[12px]`}>금액</p>
      <I c="inset-[47.49%_5.05%_46.92%_5.05%]" s={imgField} pad="inset-[-1.02%_-0.14%]" />
      <input aria-label="금액" inputMode="numeric" defaultValue="₩11,000" className={`${field} inset-[47.49%_8%_46.92%_8.59%] text-[18px]`} />

      <p className={`${B} inset-[55.37%_86.36%_43.04%_5.05%] text-[#24211d] text-[12px]`}>사용일</p>
      <I c="inset-[58.11%_52.53%_36.53%_5.05%]" s={imgHalfField} pad="inset-[-1.06%_-0.3%]" />
      <input type="date" aria-label="사용일" defaultValue="2026-11-04" className={`${field} inset-[58.11%_54%_36.53%_8.59%] text-[12px]`} />

      <p className={`${B} inset-[55.37%_41.67%_43.04%_52.53%] text-[#24211d] text-[12px]`}>항목</p>
      <I c="inset-[58.11%_5.05%_36.53%_52.53%]" s={imgHalfField} pad="inset-[-1.06%_-0.3%]" />
      <I c="inset-[60.39%_9.09%_39.04%_88.38%]" s={imgDropdown} pad="inset-[-18%_-9%]" />
      <select aria-label="항목" defaultValue="기타" className={`${field} inset-[58.11%_6%_36.53%_56.06%] text-[12px] cursor-pointer`}>
        {['숙박', '식비', '교통', '쇼핑', '기타'].map(c => <option key={c}>{c}</option>)}
      </select>

      <p className={`${B} inset-[65.75%_80.3%_32.65%_5.05%] text-[#24211d] text-[12px]`}>결제한 사람</p>
      <I c="inset-[68.49%_5.05%_26.14%_5.05%]" s={imgPayerField} pad="inset-[-1.06%_-0.14%]" />
      <I c="inset-[70.78%_9.09%_28.65%_88.38%]" s={imgDropdown} pad="inset-[-18%_-9%]" />
      <select aria-label="결제한 사람" className={`${field} inset-[68.49%_6%_26.14%_8.59%] text-[12px] cursor-pointer`}>
        <option>나</option><option>민지</option>
      </select>

      <p className={`${B} inset-[76.37%_68.43%_21.8%_5.05%] text-[#24211d] text-[13px]`}>함께 쓴 경비로 정산</p>
      <button role="switch" aria-checked={shared} aria-label="함께 쓴 경비로 정산" onClick={() => setShared(!shared)}
        className={`absolute inset-[75.34%_5.05%_21.69%_83.59%] rounded-full cursor-pointer transition-colors ${shared ? 'bg-[#7d3d00]' : 'bg-[#d7d1c9]'}`}>
        <span className={`absolute top-[11%] bottom-[11%] aspect-square rounded-full bg-white transition-all ${shared ? 'right-[6%]' : 'left-[6%]'}`} />
      </button>
      <p className={`${R} inset-[80.37%_41.67%_18.15%_5.05%] text-[#6e6c68] text-[11px]`}>사진과 인식 결과는 직접 확인한 뒤 저장하세요.</p>

      <a className="absolute contents cursor-pointer" data-name="전체 지출 열기">
        <I c="inset-[84.36%_5.05%_10.16%_5.05%]" s={imgButton} />
        <p className={`${B} inset-[86.19%_30.81%_11.87%_30.81%] text-[14px] text-center text-white`}>수정한 내용으로 경비 추가</p>
      </a>
      <BottomNav active="expenses" />
    </div>
  );
}
