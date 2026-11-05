import { Btn, ExpenseList, StorageNote } from '../expenseUi';
import { won } from '../data';
import { useExpenses } from '../expenses';
import type { ScreenProps } from '../nav';
import { FlowPage } from '../ui';

export default function ExpenseAll({ go }: ScreenProps) {
  const { expenses } = useExpenses();
  return (
    <FlowPage title="전체 지출">
      <div className="mb-3 flex items-end justify-between">
        <p className="text-[13px] font-bold text-[#6e6c68]">총 {expenses.length}건</p>
        <p className="text-[22px] font-bold text-[#7d3d00]">{won(expenses.reduce((s, e) => s + e.amount, 0))}</p>
      </div>
      <ExpenseList onEdit={id => go('expenseEdit', id)} />
      <div className="mt-5"><Btn full onClick={() => go('expenseCapture')}>+ 새 지출 등록</Btn></div>
      <div className="mt-4"><StorageNote /></div>
    </FlowPage>
  );
}
