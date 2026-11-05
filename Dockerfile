# One container: the backend (server.py) also serves the built frontend from ./frontend/dist.
FROM node:22-alpine AS web
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=8766 \
    ROUTE_AGENT_ENABLED=0 \
    ROUTE_AGENT_STATE_DIR=/tmp/agent-state \
    AUTH_DB_PATH=/data/auth.db

WORKDIR /app

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt \
    && python -m copilot download-runtime \
    && useradd --system --uid 10001 --create-home appuser \
    && mkdir -p /tmp/agent-state /data \
    && chown 10001:10001 /tmp/agent-state /data

COPY --chown=10001:10001 backend/auth.py backend/receipt_ocr.swift backend/receipt_parser.py backend/route_agent.py backend/server.py ./
COPY --from=web --chown=10001:10001 /web/dist ./frontend/dist

USER 10001:10001
EXPOSE 8766

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8766/healthz', timeout=2).read()"

CMD ["python", "server.py"]
