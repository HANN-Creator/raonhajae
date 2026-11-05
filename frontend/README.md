# 청도 한바퀴 프론트엔드

React, TypeScript, Vite, Tailwind CSS로 만든 모바일 중심 여행 가이드입니다. 제공된 청도 화면 목업과 에셋을 반영했습니다.

## 실행

```bash
npm ci
npm run dev
```

Vite는 기본적으로 `/api` 요청을 `http://127.0.0.1:8766`으로 전달합니다. 다른 백엔드를 사용할 때는 `API_PROXY_TARGET` 환경 변수를 지정합니다.

```bash
API_PROXY_TARGET=http://localhost:9000 npm run dev
```

정적 배포 산출물과 목업 경비 정산 테스트:

```bash
npm run build
npm test
```

## 백엔드 API 계약

프론트엔드는 `hann-creator-add-backend-folder` 백엔드 브랜치의 HTTP API를 사용합니다. 이 브랜치의 기본 서버 주소는 `http://127.0.0.1:8766`입니다.

- `GET /healthz`: 서버 상태 확인
- `GET /api/attractions`: `{ status, items, source }`. 공개 관광지 데이터 또는 명시된 저장 스냅샷을 반환합니다.
- `GET /api/bus-schedule`: `{ status, runs, publishedAt, checkedAt, source }`. `status`가 `live`이면 현재 공개 시간표, `fallback`이면 저장 시간표입니다.
- `GET /api/weather?date=YYYY-MM-DD`: 선택일 시간별 예보 및 데이터 출처
- `POST /api/route-recommendation`: `{ "date": "YYYY-MM-DD", "arrival": "HH:MM", "pace": "easy" | "slow" }`. 응답의 `plan.steps`와 `plan.run`은 백엔드가 시간표를 검증해 생성하며, 가능한 편이 없으면 `status: "no_route"`와 `plan.run: null`을 반환합니다.
- `POST /api/receipt-ocr`: `{ "image": "data:image/png;base64,..." }`. OCR 결과는 수정 가능한 입력 제안이며, macOS Vision을 사용할 수 없는 서버에서는 직접 입력 안내 오류를 반환합니다.

코스 화면은 서버가 반환한 `live` 시간표의 일정 시각을 확인된 값으로, `fallback` 시간표 시각은 저장본으로 구분해 표시합니다. 시간표는 실시간 운행 정보가 아닙니다. 브라우저는 버스 시각을 계산하거나 만들어내지 않습니다. 관광지 API/시간표의 저장 스냅샷 및 OCR 실패 사유는 UI에 드러나며, 장소·코스 예시는 API 연결 오류에 대한 프론트엔드 fallback입니다.

장소와 코스 응답은 세션 저장소에만 저장합니다. 영수증 OCR은 입력란을 채우는 제안만 제공하며 경비 저장은 지원하지 않습니다. 경비 내역과 혜택은 목업이며 서버에 저장하거나 실제 결제·혜택을 보장하지 않습니다.
