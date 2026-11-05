# API 라우트

현재 FastAPI 엔드포인트는 `backend/app/main.py`에 있습니다.

- `GET /api/health`: 헬스 체크
- `GET /api/places`: 목업 장소 목록
- `POST /api/recommendations`: 날짜, 청도 도착 시각, 여행 속도에 따른 동선 예시

공식 버스 시간표가 서버에 연동되기 전까지 코스 응답은 `schedule_confirmed: false`이며 방문 지점 시간을 반환하지 않습니다.
