FROM python:3.14-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN groupadd --system prism \
    && useradd --system --gid prism --create-home --home-dir /app prism

WORKDIR /app

COPY requirements.txt ./
RUN python -m pip install --no-cache-dir --requirement requirements.txt

COPY --chown=prism:prism analysis_engine.py ./
COPY --chown=prism:prism article_extractor.py ./
COPY --chown=prism:prism geo_service.py ./
COPY --chown=prism:prism rate_limit.py ./
COPY --chown=prism:prism server.py ./
COPY --chown=prism:prism url_security.py ./

USER prism

EXPOSE 8001

CMD ["python", "server.py"]
