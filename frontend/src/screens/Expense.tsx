import { Breakdown, Btn, ExpenseList, StorageNote, useSettlement } from '../expenseUi';
import { won } from '../data';
import { useExpenses } from '../expenses';
import type { ScreenProps } from '../nav';
import { FlowPage } from '../ui';

export default function Expense({ go }: ScreenProps) {
  const { expenses, people } = useExpenses();
  const s = useSettlement();
  return (
    <FlowPage title="여행 경비" sub={`청도 여행 · ${people.join(' · ')}`}>
      {expenses.length ? <Breakdown expenses={expenses} /> : (
        <div className="rounded-2xl bg-[#f7f4ef] p-6 text-center">
          <p className="text-[15px] font-bold">아직 기록한 경비가 없어요</p>
          <p className="mt-1 text-[12px] text-[#6e6c68]">결제 사진을 올리거나 직접 입력해 보세요.</p>
          <div className="mt-4"><Btn onClick={() => go('expenseCapture')}>경비 등록</Btn></div>
        </div>
      )}
      {!!expenses.length && <>
        <div className="mt-6 flex items-end justify-between border-t border-[#ece7e0] pt-4">
          <h2 className="text-[16px] font-bold">최근 내역</h2>
          <button className="text-[12px] font-bold text-[#7d3d00]" onClick={() => go('expenseAll')}>전체 {expenses.length}건 보기</button>
        </div>
        <ExpenseList limit={3} onEdit={id => go('expenseEdit', id)} />
        <button onClick={() => go('expenseSettle')} className="mt-4 flex w-full items-center justify-between rounded-2xl bg-[#f7f0e7] p-4 text-left" aria-label="함께 정산 보기">
          <span>
            <span className="block text-[13px] font-bold">함께 정산 <span className="font-normal text-[#6e6c68]">· {people.length}명</span></span>
            <span className="mt-1 block text-[20px] font-bold text-[#7d3d00]">1인 {won(s.share)}</span>
            <span className="block text-[11px] text-[#6e6c68]">정산 대상 {won(s.total)}{s.personal ? ` · 개인 지출 ${won(s.personal)} 제외` : ''}</span>
          </span>
          <span className="text-[20px] text-[#7d3d00]" aria-hidden>›</span>
        </button>
      </>}
      <div className="mt-4"><Btn full onClick={() => go('expenseCapture')}>◉ 영수증·결제 캡처 등록</Btn></div>
      <div className="mt-4"><StorageNote /></div>
    </FlowPage>
  );
}
