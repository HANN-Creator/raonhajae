import { fallbackRecommendation, readRecommendation } from '../api'
import { B, Bg, BottomNav, Header, I, R, StatusBar } from '../ui'

const assetPathPrefix = '/assets/9d03be9c-4c6b-4474-8cb4-a4d4e06d7275'
const imgWineTunnelPhoto = `${assetPathPrefix}/d1f42.png`
const imgPaceDot = `${assetPathPrefix}/13b2a.svg`
const imgPhotoShade = `${assetPathPrefix}/c2ba5.svg`
const imgOverviewSurface = `${assetPathPrefix}/8864c.svg`
const imgOverviewDivider = `${assetPathPrefix}/f6cdd.svg`
const imgItinerarySpine = `${assetPathPrefix}/30563.svg`
const imgBusNode = `${assetPathPrefix}/5396e.svg`
const imgWalkNode = `${assetPathPrefix}/2e658.svg`
const imgRouteDetailButton = `${assetPathPrefix}/69fd9.svg`

const STEP_LAYOUTS = [
  { y: ['56.85%', '42.01%'], time: ['56.28%', '42.12%'], title: ['56.16%', '42.01%'], detail: ['58.56%', '39.95%'], divider: '61.76%' },
  { y: ['63.13%', '35.73%'], time: ['62.56%', '35.84%'], title: ['62.44%', '35.73%'], detail: ['64.84%', '33.68%'], divider: '68.04%' },
  { y: ['69.41%', '29.45%'], time: ['68.84%', '29.57%'], title: ['68.72%', '29.45%'], detail: ['71.12%', '27.4%'], divider: '74.32%' },
  { y: ['75.68%', '23.17%'], time: ['75.11%', '23.29%'], title: ['75%', '23.17%'], detail: ['77.4%', '21.12%'] },
]

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day, 12)
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  return `${month}월 ${day}일 ${weekdays[date.getDay()]}요일`
}

export default function MyResult() {
  const stored = readRecommendation()
  const recommendation = stored?.recommendation ?? fallbackRecommendation
  const stops = recommendation.stops
  const firstTime = recommendation.scheduleConfirmed ? stops.find((stop) => stop.time)?.time : undefined
  const lastTime = recommendation.scheduleConfirmed ? [...stops].reverse().find((stop) => stop.time)?.time : undefined
  const pace = stored?.request.pace === 'slow' ? '여유롭게 둘러보기' : '가볍게 둘러보기'

  return (
    <div className="relative size-full">
      <Bg />
      <StatusBar />
      <Header title="추천 코스" />
      <p className={`${B} inset-[12.67%_50.25%_85.73%_5.05%] text-[#24211d] text-[12px]`}>
        {stored ? `${formatDate(stored.request.visitDate)} · ${stored.request.arrivalTime} 청도 도착` : '여행 조건을 입력하고 코스를 만들어보세요'}
      </p>
      <a className={`${B} inset-[12.79%_5.05%_85.73%_78.03%] text-[#7d3d00] text-[11px] text-right cursor-pointer`} data-name="Back to home">조건 바꾸기 ↗</a>
      <I c="inset-[16.1%_92.93%_83.22%_5.56%]" s={imgPaceDot} />
      <p className={`${R} inset-[15.64%_72.47%_82.88%_8.84%] text-[#6e6c68] text-[11px]`}>{pace}</p>
      <div className="absolute inset-[18.38%_5.05%_61.76%_5.05%] overflow-hidden rounded-[16px]">
        <img alt="청도 와인터널" className="absolute inset-0 size-full object-cover" src={imgWineTunnelPhoto} />
        <img alt="" className="absolute inset-0 size-full" src={imgPhotoShade} />
      </div>
      <p className={`${B} inset-[31.05%_38.38%_66.32%_9.09%] text-[19px] text-white`}>{recommendation.title}</p>
      <p className={`${R} inset-[34.7%_45%_63.7%_9.09%] text-[11px] text-white`}>{recommendation.summary}</p>
      <I c="inset-[40.07%_5.05%_50.8%_5.05%]" s={imgOverviewSurface} />
      <p className={`${B} inset-[41.89%_76.01%_55.48%_10.86%] text-[#7d3d00] text-[17px]`}>{firstTime ?? '—'}</p>
      <p className={`${R} inset-[45.55%_78.28%_52.97%_10.86%] text-[#6e6c68] text-[10px]`}>첫 일정</p>
      <I c="inset-[41.67%_65.4%_52.28%_34.6%]" s={imgOverviewDivider} pad="inset-[-0.94%_-0.5px]" />
      <p className={`${B} inset-[41.89%_46.97%_55.48%_39.9%] text-[#7d3d00] text-[17px]`}>{lastTime ?? '—'}</p>
      <p className={`${R} inset-[45.55%_49.24%_52.97%_39.9%] text-[#6e6c68] text-[10px]`}>귀환 일정</p>
      <I c="inset-[41.67%_36.62%_52.28%_63.38%]" s={imgOverviewDivider} pad="inset-[-0.94%_-0.5px]" />
      <p className={`${B} inset-[41.89%_21.46%_55.48%_68.43%] text-[#7d3d00] text-[17px]`}>{recommendation.scheduleConfirmed ? '확정' : '미확정'}</p>
      <p className={`${R} inset-[45.55%_17.42%_52.97%_68.43%] text-[#6e6c68] text-[10px]`}>시간표</p>
      <p className={`${B} inset-[51.48%_79.04%_46.35%_5.05%] text-[#24211d] text-[16px]`}>추천 동선</p>
      <a className={`${B} inset-[52.05%_5.05%_46.46%_72.22%] text-[#7d3d00] text-[11px] text-right cursor-pointer`} data-name="버스 코스 자세히 보기">이동 정보 ↗</a>
      <I c="inset-[56.62%_91.92%_22.95%_8.08%]" s={imgItinerarySpine} pad="inset-[-0.56%_-1px]" />
      {stops.map((stop, index) => {
        const layout = STEP_LAYOUTS[index]
        if (!layout) return null
        const node = index === 0 || index === stops.length - 1 ? imgBusNode : imgWalkNode
        return (
          <div key={`${stop.title}-${index}`} className="contents">
            <div className="absolute left-[6.82%] right-[90.66%]" style={{ top: layout.y[0], bottom: layout.y[1] }}>
              <img alt="" className="absolute inset-0 size-full" src={node} />
            </div>
            <p className={`${B} left-[12.37%] right-[79.29%] text-[#7d3d00] text-[11px]`} style={{ top: layout.time[0], bottom: layout.time[1] }}>
              {recommendation.scheduleConfirmed ? stop.time ?? '—' : '—'}
            </p>
            <p className={`${B} left-[26.77%] text-[#24211d] text-[12px]`} style={{ top: layout.title[0], bottom: layout.title[1] }}>{stop.title}</p>
            <p className={`${R} left-[26.77%] text-[#6e6c68] text-[10px]`} style={{ top: layout.detail[0], bottom: layout.detail[1] }}>{stop.description}</p>
            {layout.divider && <div className="absolute left-[12.37%] right-[5.05%] border-t border-[#e6e1da]" style={{ top: layout.divider }} />}
          </div>
        )
      })}
      <p className={`${R} inset-[81.51%_30%_17.01%_5.05%] text-[#6e6c68] text-[10px]`}>
        {recommendation.scheduleConfirmed
          ? `서버 확인 시간표${recommendation.scheduleSource ? ` · ${recommendation.scheduleSource}` : ''}`
          : stored?.usingFallback
            ? `${stored.error ?? '예시 동선'} · 시간표는 공식 안내에서 확인하세요.`
            : '예시 동선 · 버스 운행 시간표는 공식 안내에서 확인하세요.'}
      </p>
      <a className="absolute contents cursor-pointer" data-name="버스 코스 자세히 보기">
        <I c="inset-[84.59%_5.05%_9.93%_5.05%]" s={imgRouteDetailButton} />
        <p className={`${B} inset-[86.42%_34.09%_11.64%_34.09%] text-[14px] text-center text-white`}>버스 이동 정보 보기</p>
      </a>
      <BottomNav active="myRoute" />
    </div>
  )
}
