import { useState } from 'react'
import { createRecommendation, readRecommendation, saveRecommendation } from '../api'
import { CourseResult } from '../courseUi'
import type { ScreenProps } from '../nav'
import { FlowPage } from '../ui'

export default function MyResult({ go }: ScreenProps) {
  const [result, setResult] = useState(readRecommendation)
  const [busy, setBusy] = useState(false)
  const retry = async () => {
    if (!result || busy) return
    setBusy(true)
    const r = await createRecommendation(result.request)
    saveRecommendation(r.recommendation, result.request, r.usingFallback, r.error)
    setResult({ ...r, request: result.request })
    setBusy(false)
  }
  return (
    <FlowPage title="추천 코스" tab="myRoute">
      {busy && <p role="status" className="py-16 text-center text-[13px] text-[#6e6c68]">청도군 시간표로 코스를 다시 찾는 중…</p>}
      {!busy && !result && (
        <div className="rounded-2xl bg-[#f7f4ef] p-6 text-center">
          <p className="text-[15px] font-bold">아직 찾은 코스가 없어요</p>
          <p className="mt-1 text-[12px] text-[#6e6c68]">날짜와 도착 시각을 고르면 맞는 코스를 찾아드려요.</p>
          <button className="mt-4 h-10 rounded-xl bg-[#7d3d00] px-4 text-[13px] font-bold text-white" onClick={() => go('myInput')}>코스 조건 입력</button>
        </div>
      )}
      {!busy && result && <CourseResult result={result} onRetry={retry} onChange={() => go('back')} onBus={() => go('bus')} retrying={busy} />}
    </FlowPage>
  )
}
