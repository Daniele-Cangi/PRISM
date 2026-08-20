# Security Policy

## Supported version

Security fixes are applied to the latest commit on the default branch. Older
commits, forks, and third-party deployments are not supported by this project.

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Use
[GitHub private vulnerability reporting](https://github.com/Daniele-Cangi/PRISM/security/advisories/new)
and include:

- affected commit and deployment;
- reproduction steps;
- expected impact;
- any logs or proof of concept with secrets and personal data removed.

You should receive an acknowledgement within five business days. Please allow
reasonable time to investigate and release a fix before public disclosure.

## Deployment requirements

A production deployment must configure:

- a rotated **OPENAI_API_KEY**;
- exact **ALLOWED_ORIGINS**;
- durable **RATE_LIMIT_REDIS_URL**;
- a random **RATE_LIMIT_SALT**;
- the correct **TRUSTED_PROXY_HOPS** for its network path.

Use an egress firewall as defense in depth so the scraper cannot reach private,
link-local, or metadata networks even if application validation regresses.
