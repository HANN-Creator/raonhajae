# 청도 한바퀴 (라온하재)

청도를 대중교통으로 여행하는 사람을 위한 웹 앱입니다. 도착 시각에 맞는 7번 버스 코스 추천(GitHub Copilot 에이전트 + 시간표 규칙), 장소·혜택 안내, 지도, 경비 기록과 정산, 회원가입·로그인을 제공합니다. 모바일에서는 앱처럼, PC에서는 웹사이트처럼 보입니다.

## 프로젝트 구조

```text
.
├── frontend/   # React + Vite + TypeScript + Tailwind
├── backend/    # Python 표준 라이브러리 HTTP 서버 (server.py), 코스 에이전트, 인증, OCR
├── Dockerfile  # 프론트 빌드 + 백엔드를 한 컨테이너로
└── .github/workflows/
```

## 로컬 실행

```bash
# 백엔드 (http://127.0.0.1:8766)
cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt && .venv/bin/python server.py
# 프론트엔드 개발 서버 (/api → 8766 프록시)
cd frontend && npm ci && npm run dev
```

## 한 컨테이너로 실행

```bash
docker build -t cheongdo .
docker run -p 8766:8766 -v cheongdo-data:/data cheongdo
```

백엔드가 빌드된 프론트엔드를 같은 주소에서 제공합니다. API와 설정은 [backend/README.md](backend/README.md), 배포는 [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md)를 참고하세요.
