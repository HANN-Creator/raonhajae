# TRD — 길 추천 백엔드 기술 설계

## 1. 구성

```text
React 내 코스 입력
  → POST /api/route-recommendation (server.py)
  → 청도군 전체 노선 시간표 + 관광지 자료 + Open-Meteo 예보 조회
  → route_agent.py: 입력/도보 한도 검증 → 좌표 기반 근거리 관광지 후보 계산(최대 64개)
  → Microsoft Agent Framework GitHubCopilotAgent 코디네이터
      → 날씨/시간표 전문 에이전트로 제어 핸드오프
      → GitHub Copilot SDK CopilotClient (empty mode, 내장 도구 없음)
      → 전문 에이전트가 후보 ID 1개 선택
  → 후보 ID 검증 → 일정/청도발 편도 선택지/출처/에이전트 상태 JSON
  → React 추천 코스 화면
```

`GitHubCopilotAgent`는 Microsoft Agent Framework의 GitHub Copilot 연동이며 내부에서 GitHub Copilot SDK를 사용한다. 코디네이터는 허용된 전문 역할을 JSON으로 반환하고, 애플리케이션이 해당 전문 에이전트로 실행 제어를 넘긴다. 전문 에이전트의 후보 ID만 서버에서 검증하여 채택한다. 이 connector의 `GitHubCopilotAgent`는 Agent Framework `HandoffBuilder`가 요구하는 core `Agent` 타입과 다르므로, SDK/Agent Framework connector를 유지하는 명시적 역할 핸드오프를 사용한다. SDK 클라이언트는 `mode="empty"`와 별도 상태 디렉터리로 구성한다. 참고: [Agent Framework 연동 구현](https://github.com/microsoft/agent-framework/blob/main/python/packages/github_copilot/agent_framework_github_copilot/_agent.py), [GitHub Copilot SDK Python](https://github.com/github/copilot-sdk/blob/main/python/README.md).

## 2. 주요 파일

| 파일 | 역할 |
| --- | --- |
| `route_agent.py` | 조건 검증, 후보 생성, 코디네이터→전문 에이전트 핸드오프, 후보 검증, 규칙 대체 추천 |
| `server.py` | HTTP API, 시간표/날씨 캐시와 데이터 수집 |
| `frontend/src/App.jsx` | 추천 API 요청 및 상태 관리 |
| `frontend/src/Explore.jsx` | 로딩·추천 결과·추천 방식 표시 |
| `tests/test_route_agent.py` | 후보 안전성, 모델 실패, API 경계 테스트 |

## 3. API 계약

### 요청

`POST /api/route-recommendation` · `Content-Type: application/json` · 최대 4KB

```json
{"date":"2026-11-07","arrival":"10:50","pace":"easy","walk_minutes":20}
```

`pace`는 `easy` 또는 `slow`다. `walk_minutes`는 와인터널에서 추가 관광지까지 허용하는 편도 최대 도보 시간(0~120 정수, 기본 20)이다. 날짜는 한국 시간 기준 오늘부터 1년 이내여야 한다. 잘못된 입력은 `400`과 `{"error":"..."}`을 반환한다.

### 성공 응답의 주요 필드

```json
{
  "status": "ok",
  "plan": {
    "routeId": "1120-1445-wine-only",
    "title": "와인터널 중심 반나절",
    "date": "2026-11-07",
    "arrival": "10:50",
    "pace": "easy",
    "walkMinutes": 20,
    "run": {"depart":"11:20","arrive":"11:35","returnDepart":"14:45","returnArrive":"15:05"},
    "steps": [],
    "waitingMinutes": 30,
    "returnBuffer": 35,
    "busMinutes": 15,
    "durationMinutes": 225,
    "nearbyAttraction": "공개 데이터 관광지",
    "walkingEstimate": {"oneWayMinutes": 12, "method": "straight_line_distance_with_detour_factor", "realPathVerified": false}
  },
  "reason": "청도 도착 후 30분 여유를 두고 7번 버스를 탈 수 있어요.",
  "agent": {"engine":"copilot","status":"used","specialist":"weather"},
  "source": {"url":"https://www.cheongdo.go.kr/traffic/contents/01/bus/bus_time.jsp","status":"live","publishedAt":"2026-10","checkedAt":"2026-11-05T10:00+09:00","realTime":false,"attractions":{"status":"live","source":"https://www.data.go.kr/data/15021141/standard.do","checkedAt":"2026-11-05T10:00+09:00"}},
  "alternatives": []
}
```

예시의 `steps`와 `alternatives`는 간결하게 생략했다. 실제 응답에는 계산된 일정 단계와 나머지 후보가 담긴다. 이용 가능한 왕복 후보가 없으면 `status: "no_route"`, `plan.run: null`, `agent.status: "not_needed"`를 반환한다. `nearbyAttraction`과 `walkingEstimate`은 좌표 기반 추정으로, 실제 보행 경로가 검증되지 않았음을 나타낸다.

응답의 `transitOptions`는 청도발 공식 시간표 중 도착 시각 20분 이후 출발하는 가까운 편도 선택지 최대 12개다. 반환편과 환승이 검증되지 않았으므로 이 항목은 왕복 관광 일정이 아니다. `GET /api/bus-schedule`은 공식 시간표 페이지의 노선별 표, 원문 행, 출발 시각과 각 표의 기준일을 제공한다. 노선별 기준일이 다를 수 있고, 자료는 실시간 운행 정보가 아니다.

### 영수증 OCR

`POST /api/receipt-ocr`는 설정된 Azure 설정과 명시적 요청 동의(`azureConsent: true`)가 함께 있을 때 Azure AI Document Intelligence `prebuilt-receipt`를 사용한다. macOS에서는 동의가 없으면 Apple Vision 로컬 처리로 대체하고, macOS 외 환경에서는 동의 전송이 없을 경우 `428`과 `privacyNotice`를 반환한다. Azure의 `MerchantName`, `TransactionDate`, `Total` 필드가 OCR 텍스트 기반 추정보다 우선한다. 합계 통화가 KRW가 아니면 원화 금액으로 오인하지 않고 `amount: null`을 반환한다. 동의된 요청 응답에도 이미지 전송 사실을 `privacyNotice`로 표시한다.

`agent.status` 값은 `used`, `invalid_output`, `unavailable`, `disabled`, `not_needed` 중 하나다. `engine: "copilot"`은 모델이 유효한 후보 ID를 반환한 경우에만 사용한다.

## 4. 데이터와 제약

- 시간표: `server.py`에서 청도군 페이지를 30분 캐시한다. 조회 실패 시 저장된 2025-07 시간표를 `fallback`으로 표시한다.
- 관광지: `PUBLIC_DATA_SERVICE_KEY`가 있으면 청도군 공개 관광지 전체를 조회하고 6시간 캐시한다. 누락 시 저장된 요약본을 사용한다. 좌표가 유효하고 와인터널에서 추정 도보 시간이 요청 한도 이내인 장소만 추가 후보가 된다.
- 도보 추정: 하버사인 직선거리에 1.3 우회 보정계수와 시속 4km를 적용해 올림한다. 실제 보행 네트워크·안전성 검증은 없으며 응답에 `realPathVerified: false`를 담는다.
- 날씨: 선택일이 예보 범위 안이면 Open-Meteo를 20분 캐시한다. 없거나 실패하면 날씨 정보 없이 추천한다.
- 후보: 시간 형식과 순서를 검사하고, 도착 후 최소 20분, 귀환 전 이동 여유를 확인한다. 코디네이터는 허용 전문 역할을, 전문 에이전트는 후보 ID만 반환한다. 추가 관광지는 사용자 도보 한도 이내의 좌표 후보로 제한한다.
- 추천 설명은 선택된 후보의 검증된 수치로 서버가 작성한다. 모델의 자유 문장은 화면에 그대로 노출하지 않는다.
- Copilot SDK `mode="empty"`, `available_tools=[]`로 내장 파일·셸·웹·MCP 도구를 제공하지 않는다. 역할 핸드오프는 애플리케이션이 허용된 두 전문 에이전트 중 하나만 호출한다.
- React는 같은 조건으로 추천 코스 화면을 다시 여는 경우 결과를 5분 동안 재사용하여 모델 중복 호출을 줄인다.

## 5. 실행과 배포

Python 3.11 이상과 GitHub Copilot 사용 권한/로그인이 필요하다. 설치된 패키지는 `agent-framework-github-copilot`과 `github-copilot-sdk`이며 `requirements.txt`에 명시했다. 전체 관광지 공개 데이터에는 `PUBLIC_DATA_SERVICE_KEY`가 필요하다.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m copilot download-runtime
.venv/bin/python server.py
```

SDK 런타임 다운로드 시 macOS Python 인증서 설정이 필요하면 `SSL_CERT_FILE`을 신뢰할 수 있는 CA 번들로 지정한다. 이 환경에서는 `certifi.where()`를 지정하여 다운로드를 검증했다. 서버 인증 정보는 브라우저에 전달하지 않는다. `COPILOT_GITHUB_TOKEN`을 설정하면 SDK 클라이언트에 전달하며, 설정하지 않으면 로컬 Copilot 로그인 상태를 사용한다.

| 환경변수 | 기본값 | 의미 |
| --- | --- | --- |
| `ROUTE_AGENT_ENABLED` | `1` | `0`이면 규칙 추천만 사용 |
| `ROUTE_AGENT_TIMEOUT` | `20` | 모델 호출 제한 시간(5~60초로 제한) |
| `ROUTE_AGENT_STATE_DIR` | `.agent-state/` | SDK 상태 저장 위치 |
| `COPILOT_GITHUB_TOKEN` | 없음 | 별도 GitHub Copilot 토큰을 사용할 때만 설정 |
| `PUBLIC_DATA_SERVICE_KEY` | 없음 | 청도군 관광지 공개 데이터 전체 조회 키; 미설정 시 저장된 요약본 사용 |
| `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT` | 없음 | Azure Document Intelligence 리소스 endpoint |
| `AZURE_DOCUMENT_INTELLIGENCE_KEY` | 없음 | 해당 리소스 API key; 서버 비밀 설정에만 보관 |

현재 서버는 `127.0.0.1`에 바인딩된다. 학교 미니 PC에서 외부 접속을 열 때는 HTTPS 역방향 프록시, 인증, 요청 제한, 로그 관리가 별도로 필요하다. Copilot 클라이언트는 요청마다 시작하므로 동시 요청이 많아지면 재사용 가능한 워커로 옮겨야 한다.

## 6. 실패 처리와 관측

모델 인증 실패, SDK 런타임 오류, 타임아웃, 응답 JSON 오류, 후보 ID 불일치가 생겨도 API는 검증된 규칙 추천을 반환한다. 응답의 `agent` 필드가 실제 경로를 드러낸다. 시간표와 날씨의 조회 상태는 각각 출처 및 추천 결과에 반영한다. 사용자 입력·토큰·모델 원문은 현재 서버 로그에 기록하지 않는다. Azure OCR 오류 로그에는 오류 종류만 기록하고, API는 직접 입력 안내를 반환한다.
