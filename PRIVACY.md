# Privacy Notice

Effective date: 20 August 2026

PRISM is local-first software. The project does not operate a hosted PRISM
instance and does not receive data from copies run by other people. Whoever
runs a copy is responsible for its configuration, data handling, and legal
obligations.

## Data flow

When a local user requests an analysis, that copy of PRISM processes:

- the public article URL submitted by the user;
- text extracted from the article;
- the generated analysis;
- a pseudonymous client identifier used for local rate limiting;
- minimal operational error metadata.

The extracted article text is sent directly from the locally operated backend
to the OpenAI API account configured in that backend's `.env` file. API keys
remain server-side and are never included in the frontend bundle.

## Storage and logs

PRISM does not intentionally persist extracted article text or generated
analysis. The default rate limiter is process-local memory and the geographic
news cache expires after five minutes. Submitted URLs and raw client IP
addresses are intentionally excluded from application logs.

The optional PRISM v2 metadata index stores source URLs and discovery metadata,
not article bodies. Its database is local and ignored by Git.

## Third parties

Article publishers, DNS resolvers, OpenAI, and any infrastructure chosen by a
local operator process data under their own terms. Review their policies before
using PRISM, and do not submit private, paywalled, confidential, personal, or
unlawfully obtained material.

## Your choices

Do not submit a URL if you do not want its text processed by your configured AI
provider. To remove locally held data, stop the processes and delete the local
runtime files under `.acquisition_v2/`; those files are not part of the
repository.

Forks or independently exposed instances must publish privacy information
appropriate to their own operator, jurisdiction, configuration, and users.
