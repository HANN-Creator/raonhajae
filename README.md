# 청도 한바퀴

청도 여행 동선과 장소 정보를 제공하는 모바일 중심 여행 가이드입니다. 제공된 화면 목업을 기반으로 주요 화면과 장소·코스 API를 구현했습니다.

## 프로젝트 구조

```text
.
├── PRD.md
├── TRD.md
├── frontend/       # React + Vite + TypeScript
├── backend/        # FastAPI
│   └── app/
│       ├── agents/ # Microsoft Agent Framework
│       ├── llm/    # GitHub Copilot SDK 연결
│       ├── routes/
│       ├── services/
│       └── tools/
├── infra/          # 필요한 경우에만 Azure 설정
├── Dockerfile
└── .github/workflows/
```

## 로컬 실행

백엔드 API:

```bash
pip install -r backend/requirements.txt
cd backend && uvicorn app.main:app --reload
```

다른 터미널에서 프론트엔드 실행:

```bash
cd frontend
npm ci
npm run dev
```

프론트엔드 개발 서버는 `/api` 요청을 `http://127.0.0.1:8000`으로 전달합니다. 상세 API 계약과 테스트 명령은 [frontend/README.md](frontend/README.md) 및 [TRD.md](TRD.md)를 참고하세요. 코스 화면의 운행 시각은 공식 시간표 연동 전까지 미확정으로 표시하며, 경비와 혜택 화면은 목업입니다.
