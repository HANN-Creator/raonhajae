import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createRecommendation,
  getBusSchedule,
  getPlaces,
  readRecommendation,
  recognizeReceipt,
  saveRecommendation,
} from './api.ts'

function mockFetch(payload: unknown, status = 200) {
  const originalFetch = globalThis.fetch
  let requestUrl = ''
  let requestInit: RequestInit | undefined
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    requestUrl = String(input)
    requestInit = init
    return new Response(JSON.stringify(payload), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }) as typeof fetch
  return {
    request: () => ({ url: requestUrl, init: requestInit }),
    restore: () => { globalThis.fetch = originalFetch },
  }
}

test('loads backend attraction records and keeps data provenance', async () => {
  const fetchMock = mockFetch({
    status: 'key_required',
    source: 'https://data.go.kr/source',
    items: [{
      name: '청도레일바이크',
      address: '경상북도 청도군 청도읍 하지길 46-51',
      latitude: 35.58,
      longitude: 128.76,
      phone: '054-373-2426',
      referenceDate: '2026-07-23',
      description: '청도천변 옛 철길',
    }],
  })
  try {
    const result = await getPlaces()
    assert.equal(fetchMock.request().url, '/api/attractions')
    assert.equal(result.status, 'key_required')
    assert.equal(result.usingFallback, true)
    assert.equal(result.places[0].id, 'rail-bike')
    assert.equal(result.places[0].area, '청도읍')
    assert.equal(result.places[0].imageUrl.startsWith('/assets/'), true)
    assert.equal(result.places[0].address, '경상북도 청도군 청도읍 하지길 46-51')
  } finally {
    fetchMock.restore()
  }
})

test('posts route criteria in the backend schema and preserves server times', async () => {
  const fetchMock = mockFetch({
    status: 'ok',
    plan: {
      title: '와인터널·송금마을 반나절',
      date: '2026-11-07',
      arrival: '10:50',
      steps: [
        { time: '10:50', title: '청도 도착', detail: '버스 승차 위치로 이동', kind: 'start' },
        { time: '11:20', title: '7번 버스', detail: '11:35 남성현 하차', kind: 'bus' },
        { time: '11:50', title: '와인터널', detail: '12:40까지 관람', kind: 'place' },
        { time: '12:50', title: '송금마을', detail: '13:40까지 산책', kind: 'place' },
        { time: '14:45', title: '청도 귀환', detail: '15:05 청도 도착', kind: 'bus' },
      ],
    },
    reason: '시간표에 맞춘 코스입니다.',
    agent: { engine: 'rules', status: 'disabled' },
    source: { status: 'live', url: 'https://cheongdo.go.kr/bus', publishedAt: '2026-10', realTime: false },
    alternatives: [],
  })
  try {
    const result = await createRecommendation({
      visitDate: '2026-11-07',
      arrivalTime: '10:50',
      pace: 'easy',
    })
    const request = fetchMock.request()
    assert.equal(request.url, '/api/route-recommendation')
    assert.equal(request.init?.method, 'POST')
    assert.deepEqual(JSON.parse(String(request.init?.body)), {
      date: '2026-11-07',
      arrival: '10:50',
      pace: 'easy',
    })
    assert.equal(result.recommendation.status, 'ok')
    assert.equal(result.recommendation.scheduleConfirmed, true)
    assert.equal(result.recommendation.stops.length, 5)
    assert.equal(result.recommendation.stops[1].time, '11:20')
  } finally {
    fetchMock.restore()
  }
})

test('does not present saved timetable data as live confirmation', async () => {
  const fetchMock = mockFetch({
    status: 'ok',
    plan: {
      title: '와인터널 중심 반나절',
      date: '2026-11-07',
      arrival: '10:50',
      steps: [{ time: '11:20', title: '버스 탑승', detail: '저장 시간표 기준', kind: 'bus' }],
    },
    reason: '저장 시간표 기준 코스입니다.',
    agent: { engine: 'rules', status: 'disabled' },
    source: { status: 'fallback', url: 'https://cheongdo.go.kr/bus', publishedAt: '2025-07', realTime: false },
    alternatives: [],
  })
  try {
    const result = await createRecommendation({ visitDate: '2026-11-07', arrivalTime: '10:50', pace: 'slow' })
    assert.equal(result.recommendation.scheduleConfirmed, false)
    assert.equal(result.recommendation.scheduleStatus, 'fallback')
    assert.equal(result.recommendation.stops[0].time, '11:20')
    assert.equal(result.usingFallback, true)
  } finally {
    fetchMock.restore()
  }
})

test('handles a valid no-route response without inventing itinerary stops', async () => {
  const fetchMock = mockFetch({
    status: 'no_route',
    plan: { run: null, steps: [] },
    reason: '도착 20분 뒤 출발하는 왕복편을 찾지 못했어요.',
    agent: { engine: 'rules', status: 'not_needed' },
    source: { status: 'live', url: 'https://cheongdo.go.kr/bus', realTime: false },
    alternatives: [],
  })
  try {
    const result = await createRecommendation({ visitDate: '2026-11-07', arrivalTime: '18:00', pace: 'easy' })
    assert.equal(result.usingFallback, false)
    assert.equal(result.recommendation.status, 'no_route')
    assert.equal(result.recommendation.stops.length, 0)
    assert.match(result.recommendation.summary, /왕복편/)
  } finally {
    fetchMock.restore()
  }
})

test('round-trips the normalized route through session storage', async () => {
  const fetchMock = mockFetch({
    status: 'ok',
    plan: {
      title: '와인터널 중심 반나절',
      date: '2026-11-07',
      arrival: '10:50',
      busMinutes: 15,
      run: { depart: '11:20', arrive: '11:35', returnDepart: '14:45', returnArrive: '15:05' },
      steps: [{ time: '11:20', title: '7번 버스', detail: '와인터널로 이동', kind: 'bus' }],
    },
    reason: '시간표에 맞춘 코스입니다.',
    agent: { engine: 'rules', status: 'disabled' },
    source: { status: 'live', url: 'https://cheongdo.go.kr/bus', realTime: false },
    alternatives: [],
  })
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage')
  const values = new Map<string, string>()
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
  })
  try {
    const request = { visitDate: '2026-11-07', arrivalTime: '10:55', pace: 'easy' as const }
    const result = await createRecommendation(request)
    saveRecommendation(result.recommendation, request, result.usingFallback)
    const stored = readRecommendation()
    assert.equal(stored?.recommendation.stops[0].title, '7번 버스')
    assert.equal(stored?.recommendation.busMinutes, 15)
    assert.equal(stored?.recommendation.run?.returnDepart, '14:45')
  } finally {
    fetchMock.restore()
    if (originalStorage) Object.defineProperty(globalThis, 'sessionStorage', originalStorage)
    else Reflect.deleteProperty(globalThis, 'sessionStorage')
  }
})

test('parses bus schedule and receipt OCR endpoint contracts', async () => {
  const scheduleMock = mockFetch({
    status: 'live',
    runs: [{ depart: '11:20', arrive: '11:35', returnDepart: '14:45', returnArrive: '15:05' }],
    publishedAt: '2026-10',
    checkedAt: '2026-11-05T10:00+09:00',
    source: 'https://cheongdo.go.kr/bus',
  })
  try {
    const result = await getBusSchedule()
    assert.equal(scheduleMock.request().url, '/api/bus-schedule')
    assert.equal(result.schedule?.runs[0].returnDepart, '14:45')
  } finally {
    scheduleMock.restore()
  }

  const receiptMock = mockFetch({
    status: 'recognized',
    merchant: '청도식당',
    amount: 11000,
    date: '2026-11-04',
    category: '식비',
    recognizedFields: ['merchant', 'amount', 'date'],
    rawText: '청도식당\n11,000원',
  })
  try {
    const result = await recognizeReceipt('data:image/png;base64,aGVsbG8=')
    assert.equal(receiptMock.request().url, '/api/receipt-ocr')
    assert.deepEqual(JSON.parse(String(receiptMock.request().init?.body)), {
      image: 'data:image/png;base64,aGVsbG8=',
    })
    assert.equal(result.amount, 11000)
  } finally {
    receiptMock.restore()
  }
})

test('surfaces backend errors instead of parsing them as successful payloads', async () => {
  const fetchMock = mockFetch({ error: '사진은 8MB 이하로 올려주세요.' }, 413)
  try {
    await assert.rejects(
      recognizeReceipt('data:image/png;base64,aGVsbG8='),
      /사진은 8MB 이하로 올려주세요/,
    )
  } finally {
    fetchMock.restore()
  }
})

test('reuses an identical successful recommendation for 5 minutes', async () => {
  let calls = 0
  const originalFetch = globalThis.fetch
  globalThis.fetch = (async () => {
    calls++
    return new Response(JSON.stringify({
      status: 'ok',
      plan: { title: '캐시 확인', date: '2026-12-01', arrival: '09:00', run: null, steps: [{ time: '09:00', title: '청도 도착', detail: '이동', kind: 'start' }] },
      agent: { engine: 'rules', status: 'disabled' }, source: { status: 'live' }, alternatives: [],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }) as typeof fetch
  try {
    const req = { visitDate: '2026-12-01', arrivalTime: '09:00', pace: 'slow' as const }
    await createRecommendation(req)
    await createRecommendation(req)
    assert.equal(calls, 1)
    await createRecommendation({ ...req, pace: 'easy' })
    assert.equal(calls, 2)
  } finally {
    globalThis.fetch = originalFetch
  }
})
