import { ExpenseForm } from '../expenseUi';
import type { ScreenProps } from '../nav';
import { FlowPage } from '../ui';

/** New expense (no editId) or edit/delete an existing one. */
export default function ExpenseCapture({ go, editId }: ScreenProps & { editId?: string }) {
  return (
    <FlowPage title={editId ? '경비 수정' : '경비 등록'} sub={editId ? undefined : '사진에서 읽은 내용은 초안이에요. 저장 전에 확인하세요.'}>
      <ExpenseForm editId={editId} onDone={() => go(editId ? 'back' : 'expenseAll')} />
    </FlowPage>
  );
}
