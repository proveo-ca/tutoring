# Running the Proveo RAG Stack

This repository contains three containerised services wired together with **Docker Compose**:

| Service        | Image (Dockerfile)                | Port | Role                                                         |
| -------------- | --------------------------------- | ---- | ------------------------------------------------------------ |
| **rag-service**| `docker/rag-service.Dockerfile`   | 8000 | Python · FastAPI · Handles Retrieval-Augmented Generation   |
| **api**        | `docker/api.Dockerfile`           | 3000 | Node · Fastify · Gateway / proxy to all backend microservices |
| **web**        | `docker/web.Dockerfile`           | 8080 | Nginx · Serves React UI built with Vite                     |



---

## 1 · Prerequisites

* **Docker** ≥ 24
* **Docker Compose** (now included as `docker compose`)
* Optionally **pnpm** ≥ 9 if you plan to run the dev servers outside Docker.

---

## 2 · Environment variables

Create a `.env` file at the repo root (Compose automatically picks it up):

```dotenv
# LangSmith
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_xxx
LANGSMITH_PROJECT=proveo-docs

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxx
ANTHROPIC_MODEL_NAME=claude-3-haiku-20240307
```

```bash
docker compose -f docker/compose.yaml up -d --build
```

## 3 · Smoke-test

Ask a question

```bash
curl -X POST http://localhost:3000/rag/ask \
-H "Content-Type: application/json" \
-d '{"question":"Summarise the onboarding steps"}'
```
API Health check
```bash
curl http://localhost:3000/health
# → {"status":"ok"}
```
Web render
```bash
curl http://localhost:8080
```
## 4 · Development workflow (hot-reload)
```bash
# 1 · Install JS deps once
pnpm install

# 2 · Run all three services in watch mode
pnpm run dev
```

## 5 · Logs, rebuilds & tear-down

```bash
DOCKER_BUILDKIT=1 docker compose --progress=plain \
  -f docker/compose.yaml up --build
```

```bash
# Follow logs from all services
docker compose -f docker/compose.yaml logs -f --tail=50
```

```bash
# Rebuild only rag-service after changing its Dockerfile
docker compose -f docker/compose.yaml build rag-service
```

```bash
# Stop and remove containers, networks, volumes
docker compose -f docker/compose.yaml down
```
