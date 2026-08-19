# Privacy Notice

Effective date: 19 August 2026

PRISM analyzes public article URLs submitted by visitors. This notice describes
the data flow implemented by this repository. Deployers are responsible for
adapting it to their identity, jurisdiction, hosting choices, and legal duties.

## Data processed

When you request an analysis, the service processes:

- the article URL you submit;
- text extracted from the public article;
- an IP-derived pseudonymous identifier used only for abuse prevention;
- minimal operational error metadata.

The current guest interface does not create user accounts and does not use
advertising or analytics cookies.

## Why and how data is used

Extracted article text is sent to the configured OpenAI API to produce the
requested narrative analysis. Do not submit private, paywalled, confidential,
personal, or unlawfully obtained material.

The service hashes client addresses with a deployment-specific secret before
rate-limit storage. By default, rate-limit entries expire after 24 hours.
Submitted URLs and raw client IP addresses are intentionally excluded from
application logs. The geographic news cache contains only public feed data and
expires after five minutes.

## Service providers

Deployments may use hosting, Redis, DNS, and OpenAI API providers. Those
providers process data under their own terms and the deployer's agreements.
Review the current OpenAI API data controls before operating a public instance.

## Retention and security

PRISM does not intentionally persist extracted article text or generated
analysis. Provider logs, backups, and security records may have separate
retention periods configured by the deployer. The application restricts target
URLs to public HTTP(S) resources, limits request and response sizes, and applies
rate limiting, but no internet service can guarantee absolute security.

## Your choices

Do not submit a URL if you do not want its article text processed by the
configured AI provider. For privacy questions or deletion requests relating to
the reference deployment, contact info@unityloop.ai. For another deployment,
contact its operator.

## Changes

Material changes should update this file and its effective date before release.
