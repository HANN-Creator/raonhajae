# API 라우트 구조

현재 디렉터리는 초기 FastAPI 스캐폴드에 남아 있는 라우트 자리표시자입니다. 현재 프론트엔드가 연결하는 실제 API 서버는 백엔드 브랜치 `hann-creator-add-backend-folder`의 `backend/server.py`이며, 기본 포트 `8766`에서 실행합니다.

프론트엔드 계약은 [frontend/README.md](../../../frontend/README.md)에 정리되어 있습니다. 백엔드 스캐폴드의 `GET /api/places` 및 `POST /api/recommendations`는 프론트엔드 기본 대상이 아닙니다.
