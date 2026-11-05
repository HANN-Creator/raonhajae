export type PlaceCategory = '체험' | '볼거리' | '산책'
export type DataStatus = 'live' | 'fallback' | 'key_required' | 'api_unavailable' | 'unavailable'

export type Place = {
  id: string
  name: string
  category: PlaceCategory
  description: string
  area: string
  imageUrl: string
  tags: string[]
  address?: string
  phone?: string
  latitude?: number
  longitude?: number
  referenceDate?: string
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
  kind?: 'start' | 'bus' | 'place'
}

export type Recommendation = {
  status: 'ok' | 'no_route'
  title: string
  summary: string
  scheduleConfirmed: boolean
  scheduleStatus: DataStatus
  scheduleSource?: string
  schedulePublishedAt?: string
  busMinutes?: number
  run?: BusRun | null
  reason?: string
  stops: RouteStop[]
}

export type BusRun = {
  depart: string
  arrive: string
  returnDepart: string
  returnArrive: string
}

export type BusSchedule = {
  status: 'live' | 'fallback'
  runs: BusRun[]
  publishedAt?: string
  checkedAt?: string
  source: string
}

export type ReceiptRecognition = {
  merchant: string
  amount: number | null
  date: string
  category: string
  recognizedFields: string[]
  rawText: string
  status: 'recognized' | 'no_text'
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
  status: 'no_route',
  title: '추천 코스를 불러오지 못했어요',
  summary: '도착 시간과 여행 속도에 맞춘 추천 동선을 확인할 수 없습니다.',
  scheduleConfirmed: false,
  scheduleStatus: 'unavailable',
  stops: [],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isDataStatus(value: unknown): value is DataStatus {
  return value === 'live' || value === 'fallback' || value === 'key_required' ||
    value === 'api_unavailable' || value === 'unavailable'
}

function normalizeName(value: string) {
  return value.replace(/\s/g, '')
}

function parseAttraction(value: unknown): Place {
  if (!isRecord(value) || typeof value.name !== 'string' || typeof value.address !== 'string') {
    throw new Error('관광지 응답 형식이 올바르지 않습니다.')
  }
  const { name, address } = value
  const known = fallbackPlaces.find((place) => normalizeName(place.name) === normalizeName(name))
  const latitude = typeof value.latitude === 'number'
    ? value.latitude
    : typeof value.latitude === 'string' && value.latitude.trim()
      ? Number(value.latitude)
      : Number.NaN
  const longitude = typeof value.longitude === 'number'
    ? value.longitude
    : typeof value.longitude === 'string' && value.longitude.trim()
      ? Number(value.longitude)
      : Number.NaN
  const area = address.split(/\s+/).find((part) => /(읍|면|동|리)$/.test(part)) || '청도군'
  return {
    id: known?.id ?? normalizeName(name),
    name,
    category: known?.category ?? '볼거리',
    description: typeof value.description === 'string' && value.description
      ? value.description
      : known?.description ?? '청도군 관광지',
    area,
    imageUrl: known?.imageUrl ?? fallbackPlaces[0].imageUrl,
    tags: known?.tags ?? [],
    address,
    phone: typeof value.phone === 'string' ? value.phone : undefined,
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
    referenceDate: typeof value.referenceDate === 'string' ? value.referenceDate : undefined,
  }
}

function parseRecommendation(value: unknown): Recommendation {
  if (!isRecord(value) || (value.status !== 'ok' && value.status !== 'no_route') || !isRecord(value.plan)) {
    throw new Error('코스 응답 형식이 올바르지 않습니다.')
  }
  const plan = value.plan
  const source = isRecord(value.source) ? value.source : {}
  const scheduleStatus = isDataStatus(source.status) ? source.status : 'unavailable'
  const scheduleConfirmed = scheduleStatus === 'live'
  const title = typeof plan.title === 'string' ? plan.title : '추천 코스'
  const reason = typeof value.reason === 'string' ? value.reason : undefined
  const rawSteps = plan.steps
  if (!Array.isArray(rawSteps) || (value.status === 'ok' && rawSteps.length === 0) || rawSteps.length > 5) {
    throw new Error('코스 응답에 방문 지점이 없습니다.')
  }

  const stops = rawSteps.map((rawStop): RouteStop => {
    if (!isRecord(rawStop) || typeof rawStop.title !== 'string' || typeof rawStop.detail !== 'string') {
      throw new Error('방문 지점 응답 형식이 올바르지 않습니다.')
    }
    if (rawStop.time !== undefined && rawStop.time !== null &&
      (typeof rawStop.time !== 'string' || !TIME_PATTERN.test(rawStop.time))) {
      throw new Error('서버 시간표 형식이 올바르지 않습니다.')
    }
    const timeAvailable = scheduleStatus === 'live' || scheduleStatus === 'fallback'
    return {
      title: rawStop.title,
      description: rawStop.detail,
      time: timeAvailable && typeof rawStop.time === 'string' ? rawStop.time : undefined,
      kind: rawStop.kind === 'start' || rawStop.kind === 'bus' || rawStop.kind === 'place'
        ? rawStop.kind
        : undefined,
    }
  })
  const rawRun = plan.run
  const run = rawRun === null || rawRun === undefined
    ? rawRun
    : parseRun(rawRun)

  return {
    status: value.status,
    title: value.status === 'no_route' ? '가능한 버스 코스를 찾지 못했어요' : title,
    summary: reason ?? (value.status === 'no_route'
      ? '선택한 도착 시각에 맞는 왕복편이 없습니다.'
      : `${typeof plan.date === 'string' ? plan.date : ''} · ${typeof plan.arrival === 'string' ? plan.arrival : ''} 도착`),
    scheduleConfirmed,
    scheduleStatus,
    scheduleSource: typeof source.url === 'string' ? source.url : undefined,
    schedulePublishedAt: typeof source.publishedAt === 'string' ? source.publishedAt : undefined,
    busMinutes: typeof plan.busMinutes === 'number' && Number.isFinite(plan.busMinutes) && plan.busMinutes >= 0
      ? plan.busMinutes
      : undefined,
    run,
    reason,
    stops,
  }
}

function parseRun(value: unknown): BusRun {
  if (!isRecord(value) || typeof value.depart !== 'string' || !TIME_PATTERN.test(value.depart) ||
    typeof value.arrive !== 'string' || !TIME_PATTERN.test(value.arrive) ||
    typeof value.returnDepart !== 'string' || !TIME_PATTERN.test(value.returnDepart) ||
    typeof value.returnArrive !== 'string' || !TIME_PATTERN.test(value.returnArrive)) {
    throw new Error('버스 운행 시각 응답 형식이 올바르지 않습니다.')
  }
  return {
    depart: value.depart,
    arrive: value.arrive,
    returnDepart: value.returnDepart,
    returnArrive: value.returnArrive,
  }
}

function parseBusSchedule(value: unknown): BusSchedule {
  if (!isRecord(value) || (value.status !== 'live' && value.status !== 'fallback') ||
    !Array.isArray(value.runs) || typeof value.source !== 'string') {
    throw new Error('버스 시간표 응답 형식이 올바르지 않습니다.')
  }
  const runs = value.runs.map(parseRun)
  return {
    status: value.status,
    runs,
    publishedAt: typeof value.publishedAt === 'string' ? value.publishedAt : undefined,
    checkedAt: typeof value.checkedAt === 'string' ? value.checkedAt : undefined,
    source: value.source,
  }
}

function parseStoredRecommendation(value: unknown): Recommendation {
  if (!isRecord(value) || (value.status !== 'ok' && value.status !== 'no_route') ||
    typeof value.title !== 'string' || typeof value.summary !== 'string' ||
    typeof value.scheduleConfirmed !== 'boolean' || !isDataStatus(value.scheduleStatus) ||
    !Array.isArray(value.stops) || value.stops.length > 5) {
    throw new Error('저장된 코스 응답 형식이 올바르지 않습니다.')
  }
  const stops = value.stops.map((rawStop): RouteStop => {
    if (!isRecord(rawStop) || typeof rawStop.title !== 'string' ||
      typeof rawStop.description !== 'string' ||
      (rawStop.time !== undefined && (typeof rawStop.time !== 'string' || !TIME_PATTERN.test(rawStop.time))) ||
      (rawStop.kind !== undefined && rawStop.kind !== 'start' && rawStop.kind !== 'bus' && rawStop.kind !== 'place')) {
      throw new Error('저장된 방문 지점 응답 형식이 올바르지 않습니다.')
    }
    return {
      title: rawStop.title,
      description: rawStop.description,
      time: rawStop.time,
      kind: rawStop.kind,
    }
  })
  return {
    status: value.status,
    title: value.title,
    summary: value.summary,
    scheduleConfirmed: value.scheduleConfirmed,
    scheduleStatus: value.scheduleStatus,
    scheduleSource: typeof value.scheduleSource === 'string' ? value.scheduleSource : undefined,
    schedulePublishedAt: typeof value.schedulePublishedAt === 'string' ? value.schedulePublishedAt : undefined,
    busMinutes: typeof value.busMinutes === 'number' && Number.isFinite(value.busMinutes) && value.busMinutes >= 0
      ? value.busMinutes
      : undefined,
    run: value.run === null ? null : value.run === undefined ? undefined : parseRun(value.run),
    reason: typeof value.reason === 'string' ? value.reason : undefined,
    stops,
  }
}

function parseReceipt(value: unknown): ReceiptRecognition {
  if (!isRecord(value) || (value.status !== 'recognized' && value.status !== 'no_text') ||
    typeof value.merchant !== 'string' || (value.amount !== null && typeof value.amount !== 'number') ||
    typeof value.date !== 'string' || typeof value.category !== 'string' ||
    !Array.isArray(value.recognizedFields) || !value.recognizedFields.every((field) => typeof field === 'string') ||
    typeof value.rawText !== 'string') {
    throw new Error('영수증 인식 응답 형식이 올바르지 않습니다.')
  }
  return {
    status: value.status,
    merchant: value.merchant,
    amount: value.amount,
    date: value.date,
    category: value.category,
    recognizedFields: value.recognizedFields,
    rawText: value.rawText,
  }
}

async function requestJson(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(path, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
    signal: AbortSignal.timeout(8000),
  })
  const payload: unknown = await response.json()
  if (!response.ok) {
    const message = isRecord(payload) && typeof payload.error === 'string'
      ? payload.error
      : `API 요청 실패 (${response.status}).`
    throw new Error(message)
  }
  return payload
}

export async function getPlaces(): Promise<{
  places: Place[]
  usingFallback: boolean
  status: DataStatus
  source?: string
  error?: string
}> {
  try {
    const payload = await requestJson('/api/attractions')
    if (!isRecord(payload) || !Array.isArray(payload.items) || !isDataStatus(payload.status)) {
      throw new Error('관광지 응답 형식이 올바르지 않습니다.')
    }
    const places = payload.items.map(parseAttraction)
    if (!places.length) throw new Error('관광지 응답에 장소가 없습니다.')
    const status = payload.status
    return {
      places,
      usingFallback: status !== 'live',
      status,
      source: typeof payload.source === 'string' ? payload.source : undefined,
      error: status === 'key_required'
        ? '공공데이터 API 키가 없어 저장된 관광지 정보를 표시합니다.'
        : status === 'api_unavailable'
          ? '관광지 API에 연결하지 못해 저장된 정보를 표시합니다.'
          : undefined,
    }
  } catch (error) {
    return {
      places: fallbackPlaces,
      usingFallback: true,
      status: 'unavailable',
      error: error instanceof Error ? error.message : '장소 API에 연결할 수 없어 예시 장소를 보여드립니다.',
    }
  }
}

export async function getBusSchedule(): Promise<{
  schedule: BusSchedule | null
  error?: string
}> {
  try {
    return { schedule: parseBusSchedule(await requestJson('/api/bus-schedule')) }
  } catch (error) {
    return {
      schedule: null,
      error: error instanceof Error ? error.message : '버스 시간표를 불러오지 못했습니다.',
    }
  }
}

export async function createRecommendation(input: TripRequest): Promise<{
  recommendation: Recommendation
  usingFallback: boolean
  error?: string
}> {
  try {
    const response = await requestJson('/api/route-recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: input.visitDate,
        arrival: input.arrivalTime,
        pace: input.pace,
      }),
    })
    const recommendation = parseRecommendation(response)
    return {
      recommendation,
      usingFallback: recommendation.scheduleStatus === 'fallback',
    }
  } catch (error) {
    return {
      recommendation: fallbackRecommendation,
      usingFallback: true,
      error: error instanceof Error ? error.message : '코스 API에 연결할 수 없어 예시 동선을 보여드립니다.',
    }
  }
}

export async function recognizeReceipt(image: string): Promise<ReceiptRecognition> {
  return parseReceipt(await requestJson('/api/receipt-ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image }),
  }))
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
      recommendation: parseStoredRecommendation(JSON.parse(recommendation) as unknown),
      request: tripRequest,
      usingFallback: sessionStorage.getItem('cheongdo.recommendation-fallback') === 'true',
      error: sessionStorage.getItem('cheongdo.recommendation-error') ?? undefined,
    }
  } catch {
    return null
  }
}
