import { BENEFITS_URL, BenefitList } from '../benefits';
import type { ScreenProps } from '../nav';
import { FlowPage } from '../ui';

export default function Benefits({ go }: ScreenProps) {
  return (
    <FlowPage title="여행 혜택" sub="디지털 관광주민증으로 받을 수 있는 혜택" tab="benefits">
      <BenefitList onDetail={() => go('benefitDetail')} />
      <a href={BENEFITS_URL} target="_blank" rel="noreferrer" className="mt-4 flex h-11 items-center justify-center rounded-xl bg-[#7d3d00] text-[14px] font-bold text-white">관광주민증 혜택 확인하기 ↗</a>
    </FlowPage>
  );
}
