# Azure Container Apps deployment

The backend can be built as a Linux container and deployed to Azure Container Apps. The container runs as a non-root user and has a `/healthz` endpoint for health checks. Configure Azure AI Document Intelligence endpoint and key to enable cross-platform receipt OCR. Without those settings, macOS uses local Vision and other platforms keep manual entry available.

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

The internal ingress is deliberate: this API does not implement end-user authentication or request rate limits, so it should not be exposed directly to the public internet. Put it behind an authenticated frontend or gateway before enabling external ingress. Re-running the command rebuilds and updates the app from this directory.

The image defaults `ROUTE_AGENT_ENABLED=0`, which keeps the service useful through its timetable-based recommendations without model credentials. To enable Copilot, configure `COPILOT_GITHUB_TOKEN` as a Container App secret and map the environment variable to that secret in the Azure portal. Never commit tokens or put them in a checked-in deployment file. Set `ROUTE_AGENT_ENABLED=1` only after verifying that the deployed runtime is authorized for GitHub Copilot.

For receipt recognition, create or select an Azure AI Document Intelligence resource and configure its endpoint and key as Container App settings/secrets. Store the key as a secret, not a plain environment value:

```sh
az containerapp secret set \
  --name cheongdo-backend \
  --resource-group cheongdo-app \
  --secrets azure-document-intelligence-key=YOUR_RESOURCE_KEY
az containerapp update \
  --name cheongdo-backend \
  --resource-group cheongdo-app \
  --set-env-vars AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://YOUR_RESOURCE.cognitiveservices.azure.com AZURE_DOCUMENT_INTELLIGENCE_KEY=secretref:azure-document-intelligence-key
```

Receipt images and extracted text are sent to that Azure resource for analysis. Keep the service's regional/data-retention settings consistent with the application's privacy requirements.

Container Apps logs are available through the Azure portal and `az containerapp logs show`. Application logs record data-source fallback and recommendation engine/status without logging request bodies, model prompts, or credentials.
