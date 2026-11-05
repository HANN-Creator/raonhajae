import { useState } from 'react';
import { recognizeReceipt } from '../api';
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
  const [file, setFile] = useState('');
  const [shared, setShared] = useState(true);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [category, setCategory] = useState('기타');
  const [recognizing, setRecognizing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const readImage = (image: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('사진을 읽지 못했습니다.'));
    reader.onerror = () => reject(new Error('사진을 읽지 못했습니다.'));
    reader.readAsDataURL(image);
  });

  const onFileChange = async (image?: File) => {
    if (!image) return;
    setFile(image.name);
    setError(false);
    if (image.size > 8_000_000) {
      setError(true);
      setMessage('사진은 8MB 이하로 올려주세요.');
      return;
    }
    setRecognizing(true);
    setMessage('영수증 내용을 읽고 있어요…');
    try {
      const result = await recognizeReceipt(await readImage(image));
      setMerchant(result.merchant);
      setAmount(result.amount === null ? '' : String(result.amount));
      setExpenseDate(result.date);
      setCategory(result.category);
      setMessage(result.status === 'recognized'
        ? `인식된 항목 ${result.recognizedFields.length}개 · 저장 전 내용을 확인해 주세요.`
        : '글자를 찾지 못했어요. 내용을 직접 입력해 주세요.');
    } catch (reason) {
      setError(true);
      setMessage(reason instanceof Error ? reason.message : '영수증을 인식하지 못했습니다.');
    } finally {
      setRecognizing(false);
    }
  };
  return (
    <div className="relative size-full">
      <Bg /><StatusBar />
      <Header title="경비 등록" />
      <label className="absolute contents cursor-pointer">
        <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="hidden" disabled={recognizing} onChange={e => void onFileChange(e.target.files?.[0])} />
        <I c="inset-[12.9%_5.05%_71.92%_5.05%]" s={imgCaptureSurface} />
        <I c="inset-[16.25%_83.28%_81.32%_10.55%]" s={imgCamera} pad="inset-[-6.75%_-5.87%]" />
        <p className={`${B} inset-[15.87%_58.08%_82.19%_20.71%] text-[#24211d] text-[14px]`}>결제 내역 캡처</p>
        <p className={`${R} inset-[18.84%_auto_79.68%_20.71%] text-[#6e6c68] text-[11px]`}>{file ? `${file} · 이미지 교체` : '사진을 선택해 영수증을 인식해요'}</p>
      </label>
      <I c="inset-[22.03%_9.09%_77.97%_9.09%]" s={imgCaptureDivider} pad="inset-[-0.5px_-0.15%]" />
      <p role="status" aria-live="polite" className={`${R} inset-[24.09%_8%_74.43%_9.09%] ${error ? 'text-[#a84032]' : 'text-[#7d3d00]'} text-[11px]`}>{message}</p>
      <p className={`${R} inset-[29.57%_55.81%_68.95%_5.05%] text-[#6e6c68] text-[11px]`}>인식 결과 · 저장 전 수정 가능</p>

      <p className={`${B} inset-[33.79%_86.36%_64.61%_5.05%] text-[#24211d] text-[12px]`}>사용처</p>
      <I c="inset-[36.53%_5.05%_57.88%_5.05%]" s={imgField} pad="inset-[-1.02%_-0.14%]" />
      <input aria-label="사용처" value={merchant} onChange={e => setMerchant(e.target.value)} className={`${field} inset-[36.53%_8%_57.88%_8.59%] text-[14px]`} />

      <p className={`${B} inset-[44.75%_89.14%_53.65%_5.05%] text-[#24211d] text-[12px]`}>금액</p>
      <I c="inset-[47.49%_5.05%_46.92%_5.05%]" s={imgField} pad="inset-[-1.02%_-0.14%]" />
      <input aria-label="금액" inputMode="numeric" value={amount ? `₩${Number(amount).toLocaleString('ko-KR')}` : ''} onChange={e => setAmount(e.target.value.replace(/\D/g, ''))} className={`${field} inset-[47.49%_8%_46.92%_8.59%] text-[18px]`} />

      <p className={`${B} inset-[55.37%_86.36%_43.04%_5.05%] text-[#24211d] text-[12px]`}>사용일</p>
      <I c="inset-[58.11%_52.53%_36.53%_5.05%]" s={imgHalfField} pad="inset-[-1.06%_-0.3%]" />
      <input type="date" aria-label="사용일" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} className={`${field} inset-[58.11%_54%_36.53%_8.59%] text-[12px]`} />

      <p className={`${B} inset-[55.37%_41.67%_43.04%_52.53%] text-[#24211d] text-[12px]`}>항목</p>
      <I c="inset-[58.11%_5.05%_36.53%_52.53%]" s={imgHalfField} pad="inset-[-1.06%_-0.3%]" />
      <I c="inset-[60.39%_9.09%_39.04%_88.38%]" s={imgDropdown} pad="inset-[-18%_-9%]" />
      <select aria-label="항목" value={category} onChange={e => setCategory(e.target.value)} className={`${field} inset-[58.11%_6%_36.53%_56.06%] text-[12px] cursor-pointer`}>
        {['항공', '숙박', '식비', '교통', '쇼핑', '체험', '기타'].map(c => <option key={c}>{c}</option>)}
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
        <p className={`${B} inset-[86.19%_30.81%_11.87%_30.81%] text-[14px] text-center text-white`}>{recognizing ? '영수증 인식 중…' : '수정한 내용으로 경비 추가'}</p>
      </a>
      <BottomNav active="expenses" />
    </div>
  );
}
