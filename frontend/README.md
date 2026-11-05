# 청도 한바퀴 프론트엔드

React, TypeScript, Vite, Tailwind CSS로 만든 모바일 중심 여행 가이드입니다. 제공된 청도 화면 목업과 에셋을 반영했습니다.

## 실행

```bash
npm ci
npm run dev
```

Vite는 기본적으로 `/api` 요청을 `http://127.0.0.1:8000`으로 전달합니다. 다른 백엔드를 사용할 때는 `API_PROXY_TARGET` 환경 변수를 지정합니다.

```bash
API_PROXY_TARGET=http://localhost:9000 npm run dev
```

정적 배포 산출물과 목업 경비 정산 테스트:

```bash
npm run build
npm test
```

## 연결 API

- `GET /api/places`: 청도 장소 목록. API가 응답하지 않거나 계약이 맞지 않으면 목업 장소를 사용하고 화면에 fallback임을 표시합니다.
- `POST /api/recommendations`: `{ "visit_date": "YYYY-MM-DD", "arrival_time": "HH:MM", "pace": "easy" | "slow" }`를 전달합니다. 응답은 `title`, `summary`, `schedule_confirmed`, `schedule_source`, `stops`를 포함합니다.

시간은 `schedule_confirmed: true`인 서버 응답에서만 표시하며, 그 경우에도 `schedule_source`가 있어야 합니다. 브라우저는 도착 시각으로 버스 시간이나 소요 시간을 계산하지 않습니다. 현재 백엔드는 코스 동선 예시만 반환하며 공식 시간표를 연동하지 않았으므로 시간은 미확정으로 표시합니다.

장소와 코스 응답은 세션 저장소에만 저장합니다. 경비 화면과 혜택 화면의 결제·할인 정보는 목업이며 서버에 저장하거나 실제 결제·혜택을 보장하지 않습니다.
