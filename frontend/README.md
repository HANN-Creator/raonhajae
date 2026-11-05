# 청도 한바퀴 프론트엔드

React, TypeScript, Vite, Tailwind CSS로 만든 모바일 중심 여행 가이드입니다. 제공된 청도 화면 목업과 에셋을 반영했습니다.

## 실행

```bash
npm ci
npm run dev
```

Vite는 기본적으로 `/api` 요청을 `http://127.0.0.1:8766`으로 전달합니다. 다른 백엔드를 사용할 때는 `API_PROXY_TARGET` 환경 변수를 지정합니다.

```bash
API_PROXY_TARGET=http://localhost:9000 npm run dev
```

## Azure 배포

프론트엔드는 Azure Static Web Apps로 배포합니다.

1. Azure Portal에서 **Static Web App** 리소스를 만들고 GitHub 저장소 `HANN-Creator/raonhajae`, 브랜치 `main`을 연결합니다. Build preset은 **Custom**, App location은 `/frontend`, API location은 비워 두고 Output location은 `/dist`로 설정합니다.
2. Static Web App의 배포 토큰을 복사해 GitHub 저장소의 **Settings → Secrets and variables → Actions → New repository secret**에 `AZURE_STATIC_WEB_APPS_API_TOKEN` 이름으로 저장합니다. Portal이 생성한 워크플로가 있으면 중복 배포를 막기 위해 제거하고 이 저장소의 `.github/workflows/deploy-azure-static-web-app.yml`만 사용합니다.
3. 저장소의 **Actions**에서 **Deploy frontend to Azure Static Web Apps**를 실행하거나 `main`에 프론트엔드 변경을 push합니다. 성공한 실행의 Azure 도메인에서 사이트를 확인합니다.

워크플로는 테스트와 프로덕션 빌드를 마친 뒤 `frontend/dist`만 Azure에 올립니다. 프론트엔드 API 요청은 기본적으로 같은 도메인의 `/api`를 사용합니다. 별도 백엔드가 준비되어 있으면 저장소의 **Settings → Secrets and variables → Actions → Variables**에 `VITE_API_BASE_URL`을 추가하고 `https://<백엔드-호스트>`를 값으로 설정하세요(끝 `/` 없이). 백엔드는 `/api/attractions`, `/api/bus-schedule`, `/api/route-recommendation`, `/api/weather`, `/api/receipt-ocr` 경로를 제공하고 Azure 프론트엔드 도메인의 CORS 요청을 허용해야 합니다. 이 저장소의 `backend/`는 현재 별도 API 계약과 일치하지 않는 스캐폴드이므로, 해당 API 서버를 별도로 배포하지 않으면 여행 데이터 화면은 내장 예시/대체 데이터로 표시됩니다.

정적 배포 산출물과 목업 경비 정산 테스트:

```bash
npm run build
npm test
```

## 백엔드 API 계약

프론트엔드는 `hann-creator-add-backend-folder` 백엔드 브랜치의 HTTP API를 사용합니다. 이 브랜치의 기본 서버 주소는 `http://127.0.0.1:8766`입니다.

- `GET /healthz`: 서버 상태 확인
- `GET /api/attractions`: `{ status, items, source }`. 공개 관광지 데이터 또는 명시된 저장 스냅샷을 반환합니다.
- `GET /api/bus-schedule`: `{ status, runs, publishedAt, checkedAt, source }`. `status`가 `live`이면 현재 공개 시간표, `fallback`이면 저장 시간표입니다.
- `GET /api/weather?date=YYYY-MM-DD`: 선택일 시간별 예보 및 데이터 출처
- `POST /api/route-recommendation`: `{ "date": "YYYY-MM-DD", "arrival": "HH:MM", "pace": "easy" | "slow" }`. 응답의 `plan.steps`와 `plan.run`은 백엔드가 시간표를 검증해 생성하며, 가능한 편이 없으면 `status: "no_route"`와 `plan.run: null`을 반환합니다.
- `POST /api/receipt-ocr`: `{ "image": "data:image/png;base64,..." }`. OCR 결과는 수정 가능한 입력 제안이며, macOS Vision을 사용할 수 없는 서버에서는 직접 입력 안내 오류를 반환합니다.

코스 화면은 서버가 반환한 `live` 시간표의 일정 시각을 확인된 값으로, `fallback` 시간표 시각은 저장본으로 구분해 표시합니다. 시간표는 실시간 운행 정보가 아닙니다. 브라우저는 버스 시각을 계산하거나 만들어내지 않습니다. 관광지 API/시간표의 저장 스냅샷 및 OCR 실패 사유는 UI에 드러나며, 장소·코스 예시는 API 연결 오류에 대한 프론트엔드 fallback입니다.

장소와 코스 응답은 세션 저장소에만 저장합니다. 영수증 OCR은 입력란을 채우는 제안만 제공하며 경비 저장은 지원하지 않습니다. 경비 내역과 혜택은 목업이며 서버에 저장하거나 실제 결제·혜택을 보장하지 않습니다.
