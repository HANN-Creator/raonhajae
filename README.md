# 청도 한바퀴

청도 여행 동선과 장소 정보를 제공하는 모바일 중심 여행 가이드입니다. 제공된 화면 목업을 기반으로 주요 화면을 구성하고, 백엔드 브랜치의 관광지·버스 시간표·코스 추천·영수증 인식 API와 연결합니다.

## 프로젝트 구조

```text
.
├── PRD.md
├── TRD.md
├── frontend/       # React + Vite + TypeScript
├── backend/        # 현재 브랜치에는 FastAPI 초기 구조가 있으며 API 서버는 백엔드 브랜치에서 제공
├── infra/          # 필요한 경우에만 Azure 설정
├── Dockerfile
└── .github/workflows/
```

## 로컬 실행

프론트엔드 실행:

```bash
cd frontend
npm ci
npm run dev
```

API 개발 서버는 백엔드 브랜치 `hann-creator-add-backend-folder`에서 제공하며 기본 주소는 `http://127.0.0.1:8766`입니다. 이 브랜치의 Vite 개발 서버는 `/api` 요청을 해당 주소로 전달합니다. 다른 서버를 사용할 때 `API_PROXY_TARGET`을 지정하세요. 상세 API 계약은 [frontend/README.md](frontend/README.md)를 참고하세요. 시간표 시각은 서버가 반환한 실시간 게시본 또는 저장본 출처에 따라 구분하며, 실시간 운행 정보는 아닙니다. 경비 저장과 혜택 기능은 목업이고, 영수증 OCR API는 입력 제안만 제공합니다.
