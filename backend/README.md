# 청도 한바퀴 백엔드

이 ZIP에는 길 추천 에이전트, 공개 데이터 API, 영수증 OCR API, 테스트와 설계 문서가 들어 있습니다. React 프론트엔드와 인증 정보는 포함하지 않았습니다.

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

Linux 컨테이너 배포 절차와 공개 노출 시 주의사항은 [`DEPLOYMENT.md`](DEPLOYMENT.md)를 참고하세요. 컨테이너는 인증이 추가되기 전까지 내부 ingress를 사용합니다.

## API

- `GET /api/bus-schedule`: 청도군 공식 페이지의 전체 노선 시간표 표와 출발 시각(7번 코스 호환 필드 포함)
- `GET /api/attractions`: 청도군 관광지 공개 자료 전체(인증키 필요, 없으면 저장된 요약본)
- `GET /api/weather?date=YYYY-MM-DD`: 선택 날짜 예보
- `GET /healthz`: 외부 서비스에 의존하지 않는 상태 확인
- `POST /api/route-recommendation`: JSON `{"date":"YYYY-MM-DD","arrival":"10:50","pace":"easy","walk_minutes":20}`
- `POST /api/receipt-ocr`: Azure AI 사용 시 JSON `{"image":"data:image/png;base64,...","azureConsent":true}`; 동의된 요청은 `prebuilt-receipt`, macOS는 동의/설정이 없으면 Vision 로컬 처리

길 추천 응답의 `agent.engine`이 `copilot`이면 코디네이터가 전문 에이전트로 핸드오프했고, 해당 에이전트가 유효한 코스 후보를 선택한 것입니다. `agent.specialist`는 `weather` 또는 `timetable`로 실제 선택 역할을 나타냅니다. `rules`이면 검증된 시간표 기반 대체 추천입니다. 버스 시간표는 실시간 운행 정보가 아닙니다.

추천 요청은 한국 시간 기준 오늘부터 1년 이내의 날짜만 받으며, 잘못된 조건은 외부 조회 전에 `400`으로 거절합니다. 성공 응답에는 `plan`, `reason`, `agent`, `source`, `transitOptions`가 포함됩니다. `transitOptions`는 청도에서 출발하는 공식 시간표 중 도착 시각 20분 이후의 가까운 출발 최대 12개를 보여줍니다. 이 항목은 편도 시간표 안내이며 환승·귀환편까지 검증된 왕복 일정으로 간주하지 않습니다. 기존 `plan`은 왕복 운행이 검증된 와인터널 7번 구간만 사용합니다. 시간표가 실시간 운행 정보가 아님은 `source.realTime: false`로 표시합니다.

Azure를 사용하려면 서버에 `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT`와 `AZURE_DOCUMENT_INTELLIGENCE_KEY`를 설정하고, 클라이언트가 전송 전에 사용자 동의를 받은 뒤 `azureConsent: true`를 보냅니다. 서버는 이 동의가 있어야 macOS 외 플랫폼에서 영수증 이미지를 Azure `prebuilt-receipt`로 전송하며, 동의하지 않으면 `428`과 개인정보 안내를 반환합니다. macOS에서는 동의가 없거나 Azure 설정이 없으면 Apple Vision 로컬 인식을 사용하고, Azure OCR이 실패하면 직접 입력으로 전환합니다. 인식 결과는 저장 전에 사용자가 확인·수정해야 합니다.

`walk_minutes`는 와인터널에서 추가 관광지까지 허용하는 **편도 최대 도보 시간**으로, `0`~`120`의 정수를 받으며 생략 시 `20`입니다. 관광지 전체 목록은 `PUBLIC_DATA_SERVICE_KEY`가 설정되면 청도군 공개 관광지 데이터에서 가져옵니다. 좌표로 계산한 도보 시간은 직선거리와 우회 보정계수를 사용한 추정치일 뿐, 실제 보행 경로·보도·안전성을 검증한 길 안내가 아닙니다. 응답의 `walkingEstimate.realPathVerified`는 항상 `false`입니다. 제공된 7번 버스 시간표는 와인터널 구간만 검증하므로, 코스는 그 주변 관광지로만 확장하며 다른 지역까지 이동할 대중교통을 만들어 내지 않습니다.

## 설정과 테스트

- `COPILOT_GITHUB_TOKEN`: 별도 Copilot 인증 토큰 사용 시 설정
- `ROUTE_AGENT_ENABLED=0`: 모델 호출 없이 규칙 추천
- `ROUTE_AGENT_TIMEOUT`: 모델 호출 제한 시간(기본 20초)
- `PUBLIC_DATA_SERVICE_KEY`: 관광지 OpenAPI 인증키(선택)
- `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT`: Azure Document Intelligence 리소스 endpoint (선택)
- `AZURE_DOCUMENT_INTELLIGENCE_KEY`: 해당 리소스의 API key (선택, 서버 비밀 설정에만 보관)

```sh
.venv/bin/python -m unittest discover -s tests -v
```

상세 범위와 API 계약은 `PRD.md`, `TRD.md`, `TDD.md`, `agent.md`를 참고하세요.
