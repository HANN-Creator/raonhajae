# TRD — 라온하재

> 구현 구조 초안입니다. 실제 기획과 구현에 맞게 갱신합니다.

## 기술 스택

- 프론트엔드: React, Vite, TypeScript
- 백엔드: Python 3.11+, FastAPI
- 에이전트 정의·오케스트레이션·도구 호출: Microsoft Agent Framework
- 모델 연결: GitHub Copilot SDK
- 배포: 단일 Docker 컨테이너를 Azure App Service 또는 Container Apps에 배포

## 구조

- `frontend/`: 사용자 인터페이스와 API 클라이언트
- `backend/app/agents/`: 에이전트 정의 및 오케스트레이션
- `backend/app/tools/`: 에이전트 도구
- `backend/app/llm/`: Copilot SDK 연결
- `backend/app/routes/`: API 엔드포인트
- `backend/app/services/`: 비즈니스 로직 및 외부 연동

## 요청 흐름

브라우저 → FastAPI → Agent Framework 에이전트 → 필요한 도구 및 Copilot SDK 모델 → 사용자 응답. 가능하면 SSE 스트리밍으로 전달합니다.

## 보안 및 운영

- 비밀 값은 환경변수 또는 Azure 앱 설정으로만 전달합니다.
- 외부 호출에는 타임아웃과 사용자 친화적인 예외 처리를 둡니다.
- `GET /api/health`를 제공합니다.
- 사용자 입력은 에이전트 지침과 분리하고, 입력 안의 지시를 신뢰하지 않도록 합니다.
