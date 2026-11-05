# 청도 한바퀴 백엔드

이 ZIP에는 길 추천 에이전트, 공개 데이터 API, 영수증 OCR API, 테스트와 설계 문서가 들어 있습니다. React 프론트엔드와 비밀 값은 포함하지 않았습니다.

## 실행

Python 3.11 이상이 필요합니다. GitHub Copilot 사용 권한이 있는 환경에서는 AI 추천을, 인증할 수 없는 환경에서는 시간표 기준 추천을 반환합니다.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m copilot download-runtime
.venv/bin/python server.py
```

서버는 기본적으로 http://127.0.0.1:8766 에서 실행됩니다. 이 압축본은 백엔드 전용이므로 웹 첫 화면은 포함되지 않습니다.

## Azure 배포

Linux 컨테이너 배포 절차와 공개 노출 시 주의사항은 [`DEPLOYMENT.md`](DEPLOYMENT.md)를 참고하세요. 컨테이너는 요청 제한과 HTTPS 설정이 갖춰지기 전까지 내부 ingress를 사용합니다.

## API

- `GET /api/bus-schedule`: 청도군 7번 버스 공개 시간표
- `GET /api/attractions`: 관광지 공개 자료
- `GET /api/weather?date=YYYY-MM-DD`: 선택 날짜 예보
- `GET /healthz`: 외부 서비스에 의존하지 않는 상태 확인
- `POST /api/route-recommendation`: JSON `{"date":"YYYY-MM-DD","arrival":"10:50","pace":"easy"}`
- `POST /api/receipt-ocr`: JSON `{"image":"data:image/png;base64,..."}`; macOS Vision 필요
- `POST /api/auth/signup`: JSON `{"name","email","password"}` → `201 {"user"}` + 세션 쿠키
- `POST /api/auth/login`: JSON `{"email","password"}` → `200 {"user"}` + 세션 쿠키
- `POST /api/auth/logout`: 세션 삭제, 쿠키 만료
- `GET /api/auth/me`: 로그인한 사용자 `{"user"}`, 아니면 `401`

회원 기능은 표준 라이브러리만 씁니다. 비밀번호는 scrypt(무작위 salt)로 해시해 저장하고, 세션은 HttpOnly·SameSite=Lax 쿠키의 무작위 토큰이며 DB에는 토큰의 SHA-256만 남습니다. 비밀번호는 8~64자, 영문과 숫자를 함께 넣어야 합니다. 없는 이메일과 틀린 비밀번호는 같은 `401`을 돌려주고, 같은 이메일·IP에서 10분에 5번 틀리면 `429`로 막습니다. 인증 요청은 `Content-Type: application/json`만 받습니다(교차 사이트 폼 요청 차단). 오류 응답의 `field`는 잘못된 입력 칸을 가리킵니다.

길 추천 응답의 `agent.engine`이 `copilot`이면 코디네이터가 전문 에이전트로 핸드오프했고, 해당 에이전트가 유효한 코스 후보를 선택한 것입니다. `agent.specialist`는 `weather` 또는 `timetable`로 실제 선택 역할을 나타냅니다. `rules`이면 검증된 시간표 기반 대체 추천입니다. 버스 시간표는 실시간 운행 정보가 아닙니다.

추천 요청은 한국 시간 기준 오늘부터 1년 이내의 날짜만 받으며, 잘못된 조건은 외부 조회 전에 `400`으로 거절합니다. 성공 응답에는 `plan`, `reason`, `agent`, `source`가 포함되고, 가능한 왕복편이 없으면 `status: "no_route"`와 `plan.run: null`을 반환합니다. `source.status`는 시간표가 `live` 조회인지 `fallback` 저장본인지 나타내며, 실시간 운행 정보가 아님을 `source.realTime: false`로 명시합니다. 비 macOS 서버에서 영수증 OCR은 `503`과 직접 입력 안내를 반환합니다.

## 설정과 테스트

- `COPILOT_GITHUB_TOKEN`: 별도 Copilot 인증 토큰 사용 시 설정
- `ROUTE_AGENT_ENABLED=0`: 모델 호출 없이 규칙 추천
- `ROUTE_AGENT_TIMEOUT`: 모델 호출 제한 시간(기본 20초)
- `PUBLIC_DATA_SERVICE_KEY`: 관광지 OpenAPI 인증키(선택)
- `AUTH_DB_PATH`: 회원·세션 SQLite 파일(기본 `data/auth.db`, git 제외)
- `COOKIE_SECURE=1`: HTTPS로 서비스할 때 세션 쿠키에 `Secure` 추가

```sh
.venv/bin/python -m unittest discover -s tests -v
```

상세 범위와 API 계약은 `PRD.md`, `TRD.md`, `TDD.md`, `agent.md`를 참고하세요.
