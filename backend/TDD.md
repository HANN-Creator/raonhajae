# TDD — 길 추천 에이전트 테스트 설계

이 문서에서 TDD는 **Test-Driven Development / 테스트 설계**를 뜻한다. 구현에서 보장해야 할 동작을 테스트 케이스로 정의한다.

## 1. 검증 대상

| 구분 | 테스트 | 기대 결과 |
| --- | --- | --- |
| 입력 | 잘못된 날짜·시각·속도 | HTTP 400; 시간표 조회와 모델 호출 전에 종료 |
| 후보 | 도착 20분 이내 출발 | 후보에서 제외 |
| 후보 | 시각 순서가 뒤집힌 버스 운행 | 후보에서 제외 |
| 후보 | 귀환 전 이동 여유 부족 | 해당 코스에서 제외 |
| 데이터 | 정상 시간표 | 응답의 버스 시각이 서버가 받은 원본 운행과 정확히 일치 |
| 모델 | 존재하는 후보 ID 선택 | `engine: copilot`, 선택 후보 일정 반환 |
| 모델 | 없는 후보 ID 또는 형식 오류 | 규칙 추천, `invalid_output` 표시 |
| 모델 | SDK·인증·타임아웃 실패 | 규칙 추천, `unavailable` 표시 |
| 날씨 | 비 예보가 높은 경우의 대체 추천 | 규칙 추천은 와인터널 중심 후보 선호 |
| 빈 결과 | 가능한 왕복 버스가 없음 | `no_route`, 모델 미호출 |
| HTTP | 정상 POST | 서버에서 계산한 일정·출처·추천 방식 JSON 반환 |
| UI | 추천 요청 중/성공/실패 | 로딩, AI 또는 시간표 기준 표시, 연결 실패 안내 |

## 2. 자동 테스트 명령

```sh
cd outputs/cheongdo-trip-planner
.venv/bin/python -m unittest discover -s tests -v
cd frontend
npm test
npm run build
```

`tests/test_route_agent.py`는 Copilot 네트워크를 모의 선택자로 대체하여 후보 검증과 실패 전환을 반복 가능하게 검사한다. HTTP 테스트는 임시 로컬 포트에서 실제 `Handler`에 POST한다.

## 3. 실연동 확인

Copilot SDK 런타임을 내려받은 후 로그인된 환경에서 `route_agent.recommend()`를 실제 호출해 `{"engine":"copilot","status":"used"}` 결과를 확인했다. 이것은 현재 개발 컴퓨터의 인증/네트워크에서 작동한다는 확인이며 학교 미니 PC의 인증 상태를 대신 검증하지 않는다. 다른 컴퓨터에서는 응답의 `agent` 필드를 먼저 확인해야 한다.

## 4. 현재 실행 결과

- Python: 11개 테스트 통과.
- React: 3개 테스트 통과.
- Vite 프로덕션 빌드 성공.
- SDK 1.0.28 + Agent Framework GitHub Copilot 연동 2.1.1로 실제 Copilot 후보 선택 성공.

## 5. 배포 전 추가 검증

학교 미니 PC에서 Copilot 로그인/런타임, 청도군 페이지 접근, 긴 응답 시간, 여러 요청 동시 처리, 실제 정류장 위치와 보행 경로를 별도로 점검한다. 실시간 운행 여부가 제공되지 않으므로 현장 확인 안내는 유지한다.
