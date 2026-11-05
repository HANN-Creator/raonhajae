import { EXPENSES, PEOPLE, won } from '../data';
import { settle } from '../settle';
import { B, Bg, BottomNav, Header, I, R, StatusBar } from '../ui';

const assetPathPrefix = "/assets/ebc54ad5-848f-4678-a4d0-36b99951e5aa";
const imgDivider = `${assetPathPrefix}/da758.svg`;
const imgTransferSurface = `${assetPathPrefix}/2cab6.svg`;
const imgButton = `${assetPathPrefix}/69fd9.svg`;

const BAR = ['#7d3d00', '#eab0a2'];

export default function ExpenseSettle() {
  const s = settle(EXPENSES, PEOPLE);
  const max = Math.max(...PEOPLE.map(p => s.paid[p]));
  const friend = PEOPLE[1];
  return (
    <div className="relative size-full">
      <Bg /><StatusBar />
      <Header title="함께 정산" sub={<p className={`${R} inset-[11.42%_68.18%_86.99%_5.05%] text-[#6e6c68] text-[12px]`}>예시 여행 · 나와 {friend}</p>} />
      <p className={`${B} inset-[17.69%_77.02%_80.37%_5.05%] text-[#6e6c68] text-[14px]`}>둘이 쓴 경비</p>
      <p className={`${B} inset-[20.78%_auto_74.43%_5.05%] text-[#7d3d00] text-[35px]`}>{won(s.total)}</p>
      <p className={`${R} inset-[27.74%_66.67%_70.66%_5.05%] text-[#6e6c68] text-[12px]`}>{PEOPLE.length}명에게 똑같이 나누면</p>
      <p className={`${B} inset-[30.82%_auto_66.44%_5.05%] text-[#24211d] text-[20px]`}>1인 {won(s.share)}</p>
      <I c="inset-[35.73%_5.05%_64.27%_5.05%]" s={imgDivider} pad="inset-[-0.5px_-0.14%]" />
      <p className={`${B} inset-[38.24%_53.79%_59.59%_5.05%] text-[#24211d] text-[16px]`}>누가 얼마나 결제했나요?</p>
      {PEOPLE.map((p, i) => {
        const o = i * 6.4;
        return (
          <div key={p} className="contents">
            <p className={`${B} left-[5.05%] text-[#24211d] text-[13px]`} style={{ top: `${43.49 + o}%` }}>{p}</p>
            <p className={`${B} right-[5.05%] text-[#24211d] text-[14px] text-right`} style={{ top: `${43.38 + o}%` }}>{won(s.paid[p])}</p>
            <div className="absolute left-[5.05%] right-[5.05%] h-[4px] rounded-full bg-[#ece7e0]" style={{ top: `calc(${46.92 + o}% - 2px)` }}>
              <div className="h-full rounded-full" style={{ width: `${(s.paid[p] / max) * 90}%`, background: BAR[i] }} />
            </div>
          </div>
        );
      })}
      <p className={`${R} inset-[55.59%_auto_42.92%_5.05%] text-[#6e6c68] text-[11px]`}>개인 지출 {won(s.personal)}은 정산에서 제외했어요.</p>
      <I c="inset-[60.96%_5.05%_23.74%_5.05%]" s={imgTransferSurface} />
      <p className={`${B} inset-[62.79%_78.03%_35.73%_9.09%] text-[#6e6c68] text-[11px]`}>정산하려면</p>
      <p className={`${B} inset-[65.75%_76.77%_31.51%_9.09%] text-[#24211d] text-[20px]`}>{s.transfer.from}가</p>
      <p className={`${B} inset-[65.53%_auto_31.51%_27.53%] text-[#7d3d00] text-[22px]`}>{won(s.transfer.amount)}</p>
      <p className={`${B} inset-[69.52%_auto_27.74%_9.09%] text-[#24211d] text-[20px]`}>{s.transfer.to}에게 보내요</p>
      <p className={`${R} inset-[73.29%_auto_25.23%_9.09%] text-[#6e6c68] text-[11px]`}>{friend} 몫 {won(s.share)} − {friend} 결제 {won(s.paid[friend])}</p>
      <p className={`${R} inset-[79.34%_30.05%_19.18%_5.05%] text-[#6e6c68] text-[11px]`}>결제 금액은 예시이며, 실제 등록 내역으로 다시 계산돼요.</p>
      <a className="absolute contents cursor-pointer" data-name="전체 지출 열기">
        <I c="inset-[82.65%_5.05%_11.87%_5.05%]" s={imgButton} />
        <p className={`${B} inset-[84.47%_36.11%_13.58%_36.11%] text-[14px] text-center text-white`}>전체 지출 확인하기</p>
      </a>
      <BottomNav active="expenses" />
    </div>
  );
}
