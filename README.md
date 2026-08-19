# PRISM / Shadow Analyzer

PRISM is an experimental cognitive-security application that extracts text
from public news URLs and uses an AI model to examine framing, rhetorical
devices, omitted context, and plausible narrative intent.

Its output is an AI-generated assessment, not a fact check, verified truth, or
professional advice. Important claims should always be checked against primary
sources.

## Architecture

- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion.
- **Primary production API:** Vercel Python functions under `/api`.
- **Optional standalone API:** FastAPI on port 8001, deployable with Docker or
  Render.
- **Extraction:** bounded HTTP(S) fetching without executing article
  JavaScript.
- **Analysis:** OpenAI Chat Completions with an output schema validated by
  Pydantic.
- **Abuse protection:** Redis-backed fixed-window limiting in production.

The frontend uses same-origin Vercel functions by default. Set `VITE_API_URL`
only when using the standalone FastAPI service.

## Security model

Public URL processing is treated as hostile input:

- only HTTP on port 80 and HTTPS on port 443 are accepted;
- credentials, local hostnames, private IPs, metadata ranges, mixed public and
  private DNS answers, and non-global addresses are rejected;
- each redirect is resolved and validated again;
- connections are pinned to a validated public IP while preserving Host, TLS
  SNI, and certificate verification, preventing DNS rebinding;
- response bodies are capped at 2 MB and extracted text at 25,000 characters;
- production refuses to start without exact CORS origins, Redis, an HMAC salt,
  and an OpenAI key;
- submitted URLs and raw IP addresses are excluded from application logs;
- request attempts are counted before external fetching or model inference.

An outbound firewall that denies private, link-local, and metadata networks is
still recommended as defense in depth.

## Requirements

- Node.js 20.19 or newer (Node 22 LTS recommended)
- Python 3.14
- Redis for production
- an OpenAI API key

## Local setup

Clone the actual repository:

~~~bash
git clone https://github.com/Daniele-Cangi/SHADOW-ANALYZER.git
cd SHADOW-ANALYZER
~~~

Create local configuration. Never commit the resulting `.env` file:

~~~powershell
Copy-Item .env.example .env
~~~

Install and run the frontend:

~~~bash
npm ci
npm run dev
~~~

In another terminal, install and run the FastAPI service:

~~~powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.venv\Scripts\python.exe server.py
~~~

The frontend is available at `http://localhost:5173`; FastAPI runs at
`http://localhost:8001`. Interactive API documentation is enabled only outside
production.

## Production configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `APP_ENV=production` | standalone API | enables fail-closed checks |
| `OPENAI_API_KEY` | yes | server-side secret; rotate before deployment |
| `OPENAI_MODEL` | no | defaults to `gpt-4o` |
| `ALLOWED_ORIGINS` | yes | comma-separated exact frontend origins |
| `RATE_LIMIT_REDIS_URL` | yes | durable cross-instance rate limit |
| `RATE_LIMIT_SALT` | yes | random HMAC secret for client identifiers |
| `TRUSTED_PROXY_HOPS` | yes behind a proxy | client position counted from the right side of X-Forwarded-For |
| `MAX_ANALYSES_PER_IP` | no | defaults to 3 |
| `RATE_LIMIT_WINDOW_SECONDS` | no | defaults to 86400 |
| `MAX_CONCURRENT_ANALYSES` | no | standalone API concurrency cap |

For Vercel, configure the same secrets in the project settings. For Render,
the blueprint marks operator-supplied values with `sync: false`; existing
services must be updated manually because Render does not apply new
`sync: false` values during later blueprint syncs.

## Validation

~~~bash
npm run check
npm audit --audit-level=high
python -m ruff format --check .
python -m ruff check .
python -m pytest -q --cov --cov-fail-under=60
python -m pip_audit -r requirements.txt
python -m pip_audit -r api/requirements.txt
~~~

Python direct and transitive dependencies are resolved exactly in
`requirements.txt`, `requirements-dev.txt`, and `api/requirements.txt`.
Regenerate them from the corresponding `.in` files with `pip-compile`.

## Responsible operation

Submit only public article URLs that you are permitted to access and process.
The extracted text is sent to the configured OpenAI API. Do not submit private,
confidential, personal, paywalled, infringing, or unlawfully obtained material.

Read [Privacy](PRIVACY.md), [Terms](TERMS.md), [Security](SECURITY.md), and
[Contributing](CONTRIBUTING.md) before deploying or contributing.

## License

PRISM is licensed under the [Apache License 2.0](LICENSE). Third-party
dependencies and content remain subject to their respective licenses.
