# Azure Container Apps deployment

The backend can be built as a Linux container and deployed to Azure Container Apps. The container runs as a non-root user and has a `/healthz` endpoint for health checks. Receipt OCR depends on macOS Vision and is therefore unavailable in the Linux container; the API returns `503` and keeps manual entry available.

## Deploy privately

Install and sign in to the Azure CLI with the Container Apps extension, then run these commands from this directory:

```sh
az login
az extension add --name containerapp --upgrade
az containerapp up \
  --name cheongdo-backend \
  --resource-group cheongdo-app \
  --location koreacentral \
  --source . \
  --ingress internal \
  --target-port 8766
```

The internal ingress is deliberate: the API now has email/password accounts with login throttling, but no general request rate limits, so it should not be exposed directly to the public internet. Put it behind an authenticated frontend or gateway before enabling external ingress. Re-running the command rebuilds and updates the app from this directory.

The image defaults `ROUTE_AGENT_ENABLED=0`, which keeps the service useful through its timetable-based recommendations without model credentials. To enable Copilot, configure `COPILOT_GITHUB_TOKEN` as a Container App secret and map the environment variable to that secret in the Azure portal. Never commit tokens or put them in a checked-in deployment file. Set `ROUTE_AGENT_ENABLED=1` only after verifying that the deployed runtime is authorized for GitHub Copilot.

Container Apps logs are available through the Azure portal and `az containerapp logs show`. Application logs record data-source fallback and recommendation engine/status without logging request bodies, model prompts, or credentials.

## Accounts

Accounts and sessions are stored in SQLite at `AUTH_DB_PATH` (the image uses `/data/auth.db`). Mount persistent storage at `/data`, otherwise accounts are lost when the container restarts. Set `COOKIE_SECURE=1` when the app is served over HTTPS so the session cookie is never sent over plain HTTP. Only a scrypt hash of each password and a SHA-256 of each session token are stored; logs record account ids, never emails or passwords.
