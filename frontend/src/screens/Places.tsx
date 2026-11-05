import { useEffect, useMemo, useState } from 'react'
import { fallbackPlaces, getPlaces, type Place } from '../api'
import { B, Bg, BottomNav, Header, R, StatusBar } from '../ui'

const FILTERS = ['전체', '체험', '볼거리', '산책'] as const

export default function Places() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('전체')
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState<Place[]>(fallbackPlaces)
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    let active = true
    getPlaces().then((result) => {
      if (!active) return
      setPlaces(result.places)
      setUsingFallback(result.usingFallback)
      setApiError(result.error ?? '')
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  const visiblePlaces = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    return places.filter((place) => {
      const matchesFilter = filter === '전체' || place.category === filter
      const searchable = [place.name, place.description, place.area, ...place.tags]
        .join(' ')
        .toLocaleLowerCase()
      return matchesFilter && (!term || searchable.includes(term))
    })
  }, [filter, places, query])

  return (
    <div className="relative size-full">
      <Bg />
      <StatusBar />
      <Header title="청도 장소" sub={<p className={`${R} inset-[11.42%_56.57%_86.99%_5.05%] text-[#6e6c68] text-[12px]`}>동선에 넣을 장소를 골라보세요</p>} />

      <div className="absolute inset-[15.5%_0_8.33%_0] overflow-y-auto px-[5.05%] pb-5">
        <label className="flex h-[48px] items-center gap-3 rounded-[10px] border border-[#e6e1da] bg-white px-4">
          <span className="text-[20px] text-[#7d3d00]" aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="장소 이름이나 지역 검색"
            aria-label="장소 검색"
            className={`${R} w-full bg-transparent text-[13px] text-[#24211d] outline-none placeholder:text-[#8b8985]`}
          />
        </label>

        <div className="mt-4 flex gap-2" role="group" aria-label="장소 종류">
          {FILTERS.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              aria-pressed={filter === category}
              className={`rounded-full border px-4 py-2 text-[12px] ${
                filter === category
                  ? 'border-[#7d3d00] bg-[#7d3d00] text-white'
                  : 'border-[#e6e1da] bg-white text-[#4c4945]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <p className={`${R} mt-3 text-[10px] text-[#77736e]`} role="status" aria-live="polite">
          {loading
            ? '청도 장소를 불러오는 중…'
            : usingFallback
                ? `${apiError || '저장된 관광지 정보'} · ${places.length}곳`
                : `공공 관광지 API에서 ${places.length}곳을 불러왔어요.`}
        </p>

        <div className="mt-2 flex flex-col gap-3">
          {visiblePlaces.map((place) => (
            <article key={place.id} className="overflow-hidden rounded-[12px] border border-[#e6e1da] bg-white">
              <button
                className="block w-full text-left"
                data-name={place.id === 'rail-bike' ? '레일바이크 상세' : '와인터널 상세'}
                aria-label={`${place.name} 상세 정보 보기`}
              >
                <img
                  src={place.imageUrl}
                  alt=""
                  className="h-[150px] w-full object-cover"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.src = fallbackPlaces[0].imageUrl
                  }}
                />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#f7f1e8] px-2.5 py-1 text-[10px] text-[#7d3d00]">{place.category}</span>
                    <span className={`${R} text-[10px] text-[#77736e]`}>{place.area}</span>
                  </div>
                  <h2 className={`${B} static mt-2 text-[16px] text-[#24211d]`}>{place.name}</h2>
                  <p className={`${R} mt-1 text-[11px] leading-5 text-[#6e6c68]`}>{place.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {place.tags.map((tag) => (
                      <span key={tag} className="rounded bg-[#f5f3ef] px-2 py-1 text-[9px] text-[#77736e]"># {tag}</span>
                    ))}
                  </div>
                </div>
              </button>
            </article>
          ))}
          {!visiblePlaces.length && (
            <div className="rounded-[12px] bg-white px-4 py-10 text-center">
              <p className={`${B} static text-[14px] text-[#24211d]`}>조건에 맞는 장소가 없어요</p>
              <p className={`${R} mt-2 text-[11px] text-[#6e6c68]`}>검색어를 바꾸거나 다른 종류를 선택해보세요.</p>
            </div>
          )}
        </div>
        <p className={`${R} mt-4 text-center text-[10px] text-[#77736e]`}>운영시간과 혜택은 방문 전 공식 안내에서 확인하세요.</p>
      </div>
      <BottomNav active="places" />
    </div>
  )
}
