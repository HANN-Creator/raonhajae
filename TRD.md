# 기술 설계 — 청도 한바퀴

## 기술 스택

- 프론트엔드: React, TypeScript, Vite, Tailwind CSS
- 백엔드: Python 3.9+, FastAPI, Pydantic
- 배포: 프론트엔드 정적 산출물과 FastAPI를 동일 출처로 제공하는 구성을 기본으로 합니다.

## 현재 요청 흐름

```text
브라우저
  ├─ GET /api/places ───────────────> FastAPI 장소 목록
  └─ POST /api/recommendations ─────> FastAPI 코스 예시
```

개발 서버의 Vite proxy는 `/api`를 `API_PROXY_TARGET`으로 전달하며 기본값은 `http://127.0.0.1:8000`입니다. API 호출 실패나 응답 계약 오류 시 프론트엔드는 예시 데이터를 보여주고 사용자에게 fallback 상태를 표시합니다.

## API 계약

- `GET /api/health`: `{ "status": "ok" }`
- `GET /api/places`: 장소 목록. 장소에는 `id`, `name`, `category`, `description`, `area`, `image_url`, `tags`가 있습니다.
- `POST /api/recommendations`: `visit_date`(날짜), `arrival_time`(시각), `pace`(`easy` 또는 `slow`)를 받습니다. 응답은 `title`, `summary`, `schedule_confirmed`, `schedule_source`, `stops`를 제공합니다.
- 시간표가 공식 서버 데이터로 확인된 경우에만 `schedule_confirmed: true`, 출처, 각 정류장 시간을 반환해야 합니다. 현재 구현은 시간표 미연동 상태이며 시간 없이 동선 예시를 반환합니다.

## 제한 및 후속 연동

- 현재 장소와 코스는 정적 예시 데이터입니다. 대중교통 운행·실시간 도착·관광지 운영 정보는 권위 있는 원천 데이터를 연결하기 전까지 확정 정보로 취급하지 않습니다.
- 혜택·경비 화면의 정보와 계산은 목업 데이터이며 서버 영속화가 없습니다.
- LLM/Agent Framework 구성은 저장소에 계획만 있고 아직 요청 경로에 연결되어 있지 않습니다.
- 비밀 값은 환경변수 또는 배포 앱 설정으로만 전달합니다. 서버 입력 검증은 Pydantic을 사용하며, 브라우저의 오류 상태는 fallback임을 명시합니다.

## 실행

백엔드:

```bash
pip install -r backend/requirements.txt
cd backend && uvicorn app.main:app --reload
```

프론트엔드 실행과 테스트 명령은 [frontend/README.md](frontend/README.md)를 참고하세요.
