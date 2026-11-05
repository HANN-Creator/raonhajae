FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=8766 \
    ROUTE_AGENT_ENABLED=0 \
    ROUTE_AGENT_STATE_DIR=/tmp/agent-state

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt \
    && python -m copilot download-runtime \
    && useradd --system --uid 10001 --create-home appuser \
    && mkdir -p /tmp/agent-state \
    && chown 10001:10001 /tmp/agent-state

COPY --chown=10001:10001 receipt_ocr.swift receipt_parser.py route_agent.py server.py ./

USER 10001:10001
EXPOSE 8766

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8766/healthz', timeout=2).read()"

CMD ["python", "server.py"]
