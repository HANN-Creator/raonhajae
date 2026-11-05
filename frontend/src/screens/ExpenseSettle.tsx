import { Btn, SettlementPanel, StorageNote } from '../expenseUi';
import type { ScreenProps } from '../nav';
import { FlowPage } from '../ui';

export default function ExpenseSettle({ go }: ScreenProps) {
  return (
    <FlowPage title="함께 정산">
      <SettlementPanel />
      <div className="mt-6"><Btn full ghost onClick={() => go('expenseAll')}>전체 지출 확인하기</Btn></div>
      <div className="mt-4"><StorageNote /></div>
    </FlowPage>
  );
}
