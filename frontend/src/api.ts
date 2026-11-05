export type PlaceCategory = '체험' | '볼거리' | '산책'

export type Place = {
  id: string
  name: string
  category: PlaceCategory
  description: string
  area: string
  imageUrl: string
  tags: string[]
}

export type TripRequest = {
  visitDate: string
  arrivalTime: string
  pace: 'easy' | 'slow'
}

export type RouteStop = {
  time?: string
  title: string
  description: string
}

export type Recommendation = {
  title: string
  summary: string
  scheduleConfirmed: boolean
  scheduleSource?: string
  stops: RouteStop[]
}

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/

export const fallbackPlaces: Place[] = [
  {
    id: 'wine-tunnel',
    name: '와인터널',
    category: '볼거리',
    description: '옛 철도 터널 · 감와인 숙성 공간',
    area: '화양읍',
    imageUrl: '/assets/1dc7d20f-3da6-4fa3-9ea8-ccad9a3ab29e/9b617.png',
    tags: ['실내', '감와인'],
  },
  {
    id: 'rail-bike',
    name: '청도 레일바이크',
    category: '체험',
    description: '청도천변 옛 철길을 따라 달리는 체험',
    area: '청도읍',
    imageUrl: '/assets/63074331-c5ab-4c65-8481-c6e91566771a/510c6.png',
    tags: ['가족 여행', '야외'],
  },
  {
    id: 'songgeum-village',
    name: '송금마을',
    category: '산책',
    description: '와인터널 코스와 함께 둘러보기 좋은 마을',
    area: '화양읍',
    imageUrl: '/assets/63074331-c5ab-4c65-8481-c6e91566771a/d5555.png',
    tags: ['마을 산책', '로컬'],
  },
]

export const fallbackRecommendation: Recommendation = {
  title: '와인터널·송금마을 반나절',
  summary: '도착 시간과 여행 속도에 맞춘 추천 동선 예시',
  scheduleConfirmed: false,
  stops: [
    { title: '청도역에서 출발 준비', description: '정류장 위치와 당일 운행 정보를 확인하세요.' },
    { title: '와인터널 둘러보기', description: '운영시간과 입장 정보를 방문 전에 확인하세요.' },
    { title: '송금마을 산책', description: '와인터널에서 마을까지 이동 방법을 현장에서 확인하세요.' },
    { title: '청도역으로 돌아오기', description: '귀환 교통편은 공식 시간표에서 확인하세요.' },
  ],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isPlaceCategory(value: unknown): value is PlaceCategory {
  return value === '체험' || value === '볼거리' || value === '산책'
}

function parsePlace(value: unknown): Place {
  if (!isRecord(value)) throw new Error('장소 응답 형식이 올바르지 않습니다.')
  const { id, name, category, description, area, image_url, tags } = value
  if (
    typeof id !== 'string' ||
    typeof name !== 'string' ||
    !isPlaceCategory(category) ||
    typeof description !== 'string' ||
    typeof area !== 'string' ||
    typeof image_url !== 'string' ||
    !Array.isArray(tags) ||
    !tags.every((tag) => typeof tag === 'string')
  ) {
    throw new Error('장소 응답 형식이 올바르지 않습니다.')
  }
  return { id, name, category, description, area, imageUrl: image_url, tags }
}

function parseRecommendation(value: unknown): Recommendation {
  if (
    !isRecord(value) ||
    typeof value.title !== 'string' ||
    typeof value.summary !== 'string' ||
    typeof value.schedule_confirmed !== 'boolean'
  ) {
    throw new Error('코스 응답 형식이 올바르지 않습니다.')
  }

  const scheduleConfirmed = value.schedule_confirmed === true
  const scheduleSource = typeof value.schedule_source === 'string' ? value.schedule_source : undefined
  if (scheduleConfirmed && !scheduleSource) {
    throw new Error('확정 시간표에 출처가 없습니다.')
  }
  if (!Array.isArray(value.stops) || value.stops.length === 0 || value.stops.length > 4) {
    throw new Error('코스 응답에 방문 지점이 없습니다.')
  }

  const stops = value.stops.map((rawStop): RouteStop => {
    if (!isRecord(rawStop) || typeof rawStop.title !== 'string' || typeof rawStop.description !== 'string') {
      throw new Error('방문 지점 응답 형식이 올바르지 않습니다.')
    }

    if (
      scheduleConfirmed &&
      rawStop.time !== undefined &&
      (typeof rawStop.time !== 'string' || !TIME_PATTERN.test(rawStop.time))
    ) {
      throw new Error('서버 시간표 형식이 올바르지 않습니다.')
    }
    const time = scheduleConfirmed && typeof rawStop.time === 'string' ? rawStop.time : undefined
    return { title: rawStop.title, description: rawStop.description, time }
  })

  return { title: value.title, summary: value.summary, scheduleConfirmed, scheduleSource, stops }
}

async function requestJson(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(path, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`API 요청 실패 (${response.status}).`)
  return response.json()
}

export async function getPlaces(): Promise<{ places: Place[]; usingFallback: boolean; error?: string }> {
  try {
    const payload = await requestJson('/api/places')
    const rows = Array.isArray(payload)
      ? payload
      : isRecord(payload) && Array.isArray(payload.places)
        ? payload.places
        : null
    if (!rows) throw new Error('장소 응답 형식이 올바르지 않습니다.')
    return { places: rows.map(parsePlace), usingFallback: false }
  } catch {
    return {
      places: fallbackPlaces,
      usingFallback: true,
      error: '장소 API에 연결할 수 없어 예시 장소를 보여드립니다.',
    }
  }
}

export async function createRecommendation(input: TripRequest): Promise<{
  recommendation: Recommendation
  usingFallback: boolean
  error?: string
}> {
  try {
    const response = await requestJson('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visit_date: input.visitDate,
        arrival_time: input.arrivalTime,
        pace: input.pace,
      }),
    })
    return { recommendation: parseRecommendation(response), usingFallback: false }
  } catch {
    return {
      recommendation: fallbackRecommendation,
      usingFallback: true,
      error: '코스 API에 연결할 수 없어 예시 동선을 보여드립니다.',
    }
  }
}

export function saveRecommendation(
  value: Recommendation,
  request: TripRequest,
  usingFallback: boolean,
  error?: string,
) {
  sessionStorage.setItem('cheongdo.recommendation', JSON.stringify(value))
  sessionStorage.setItem('cheongdo.trip-request', JSON.stringify(request))
  sessionStorage.setItem('cheongdo.recommendation-fallback', String(usingFallback))
  if (error) sessionStorage.setItem('cheongdo.recommendation-error', error)
  else sessionStorage.removeItem('cheongdo.recommendation-error')
}

function parseTripRequest(value: unknown): TripRequest | null {
  if (!isRecord(value)) return null
  if (
    typeof value.visitDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value.visitDate) ||
    typeof value.arrivalTime !== 'string' ||
    !TIME_PATTERN.test(value.arrivalTime) ||
    (value.pace !== 'easy' && value.pace !== 'slow')
  ) {
    return null
  }
  return { visitDate: value.visitDate, arrivalTime: value.arrivalTime, pace: value.pace }
}

export function readRecommendation(): {
  recommendation: Recommendation
  request: TripRequest
  usingFallback: boolean
  error?: string
} | null {
  try {
    const recommendation = sessionStorage.getItem('cheongdo.recommendation')
    const request = sessionStorage.getItem('cheongdo.trip-request')
    if (!recommendation || !request) return null
    const tripRequest = parseTripRequest(JSON.parse(request) as unknown)
    if (!tripRequest) return null
    return {
      recommendation: parseRecommendation(JSON.parse(recommendation) as unknown),
      request: tripRequest,
      usingFallback: sessionStorage.getItem('cheongdo.recommendation-fallback') === 'true',
      error: sessionStorage.getItem('cheongdo.recommendation-error') ?? undefined,
    }
  } catch {
    return null
  }
}
