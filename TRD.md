# 기술 설계 — 청도 한바퀴

## 기술 스택과 요청 흐름

- 프론트엔드: React, TypeScript, Vite, Tailwind CSS
- API 서버: 백엔드 브랜치 `hann-creator-add-backend-folder`의 Python HTTP 서버
- 기본 API 주소: `http://127.0.0.1:8766` (`API_PROXY_TARGET`으로 변경 가능)

```text
React 장소 목록 ── GET /api/attractions ───────────┐
React 버스 화면 ── GET /api/bus-schedule ─────────┤
코스 입력 ──────── POST /api/route-recommendation ├──> 백엔드 서버
영수증 이미지 ──── POST /api/receipt-ocr ─────────┘
                                  └─ 서버가 관광·시간표·날씨 자료를 조회하고 코스 후보를 계산
```

현재 브랜치의 `backend/app/main.py`는 초기 FastAPI 스캐폴드이며 프론트엔드 기본 대상이 아닙니다. 실제 계약은 백엔드 브랜치의 `backend/server.py`와 `backend/route_agent.py`에 있습니다.

## API 계약

- `GET /healthz`: `{ "status": "ok" }`
- `GET /api/attractions`: `{ status, items, source }`. 항목은 이름·주소·좌표·연락처·설명·기준일을 제공하고, `status`는 `live`, `key_required`, `api_unavailable` 중 하나입니다.
- `GET /api/bus-schedule`: `{ status, runs, publishedAt, checkedAt, source }`. `runs`의 각 항목은 `depart`, `arrive`, `returnDepart`, `returnArrive`를 갖습니다. `status`는 `live` 또는 `fallback`입니다.
- `GET /api/weather?date=YYYY-MM-DD`: 선택일 시간별 예보 및 출처 상태입니다.
- `POST /api/route-recommendation`: 요청은 `{ "date": "YYYY-MM-DD", "arrival": "HH:MM", "pace": "easy" | "slow" }`입니다. 응답은 `status`, `plan`, `reason`, `agent`, `source`, `alternatives`를 포함합니다. 경로가 없으면 `status: "no_route"`와 `plan.run: null`입니다.
- `POST /api/receipt-ocr`: 요청은 `{ "image": "data:image/png;base64,..." }`입니다. 응답은 `merchant`, `amount`, `date`, `category`, `recognizedFields`, `rawText`, `status`를 포함합니다. 이 endpoint는 지출을 저장하지 않습니다.

프론트엔드는 출처 상태를 보존합니다. 공개 시간표(`live`)의 단계 시각은 확인된 게시 일정으로, 저장본(`fallback`) 시각은 오래되었을 수 있는 안내로 분리해 표시합니다. API 오류 시 브라우저는 버스 시각을 만들지 않으며, 코스·장소 fallback을 사용할 때 오류를 함께 표시합니다.

## 제한 및 후속 연동

- 시간표는 실시간 차량 위치·도착 정보가 아닙니다. 저장 시간표가 사용되면 게시 기준일과 fallback 상태를 표시해야 합니다.
- 관광지 정보는 백엔드 공개 데이터 또는 저장 스냅샷입니다. 화면 이미지는 로컬 프로토타입 에셋을 사용합니다.
- 영수증 OCR은 백엔드에서 제공하는 macOS Vision 기능이며, 인식 결과는 편집 제안일 뿐 경비 등록·저장 기능은 아닙니다.
- 혜택·경비 내역과 정산은 목업 데이터이며 사용자별 서버 저장이 없습니다.
- 브라우저에 비밀 값을 두지 않습니다. 외부 데이터와 Copilot 모델 호출은 백엔드에서 수행합니다.

## 검증

프론트엔드 빌드, lint, API 계약 테스트와 목업 경비 정산 테스트는 `frontend/README.md`의 명령을 사용합니다. 백엔드 테스트와 실행법은 백엔드 브랜치의 문서를 참고합니다.
