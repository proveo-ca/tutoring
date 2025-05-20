#FROM python:3.12-slim
#
#WORKDIR /app
#ENV PYTHONDONTWRITEBYTECODE=1
#ENV PYTHONUNBUFFERED=1
#
#COPY packages/core/rag-service/requirements.txt .
#RUN pip install --no-cache-dir -r requirements.txt
#
#COPY packages/core/rag-service /app/rag-service
#
#EXPOSE 8000
#ENTRYPOINT ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8800"]

FROM python:3.12-slim AS builder

# ➊ System deps you need only to *build* wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /opt/rag
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

COPY packages/core/rag-service/requirements.txt .

RUN pip install --upgrade pip && \
    pip wheel --wheel-dir /opt/wheels -r requirements.txt


FROM python:3.12-slim

WORKDIR /opt/rag
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY --from=builder /opt/wheels /opt/wheels
RUN pip install --no-cache-dir --no-index --find-links=/opt/wheels /opt/wheels/*

COPY packages/core/rag-service/ .

EXPOSE 8800
ENTRYPOINT ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8800"]
