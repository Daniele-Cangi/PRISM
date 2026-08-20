# PRISM v2 — Narrative X-Ray Trajectory

> **Status:** Proposed direction / technical spike
> **Goal:** Turn PRISM from a single-article AI bias analyzer into a provenance-aware engine that reconstructs how the same event changes across sources, countries and time.

---

## 1. Why PRISM must change

The current product is visually strong, but the analytical core is still too close to:

```text
article -> extract text -> LLM -> score + narrative analysis
```

That is useful as a prototype, but it is not defensible as a unique product.

The next version should not try to answer:

> "Is this article true?"

or:

> "How biased is this article from 0 to 100?"

Instead, PRISM should answer:

> **What remains invariant across independent sources, what changes, what disappears, who introduces each claim, and how does the narrative mutate over time and geography?**

That becomes the core product.

---

# 2. Core thesis

## PRISM is not a truth detector

PRISM becomes a **Narrative Provenance & Differential Engine**.

Its job is to reconstruct an event from many sources and expose:

- shared factual claims;
- contested claims;
- source-specific additions;
- missing context;
- causal attribution differences;
- changes in certainty;
- source lineage and syndication;
- geographic narrative differences;
- temporal narrative drift.

The product should make the transformation of information observable.

---

# 3. The hard problem: acquisition

The hardest part of PRISM v2 is not the LLM.

It is reliably obtaining enough independent coverage of the same event.

The hardened v1 approach remains URL-centric:

```text
URL
 -> scheme, port and hostname validation
 -> public DNS resolution
 -> IP-pinned, TLS-verified HTTPS
 -> bounded HTML response
 -> BeautifulSoup
 -> article text
```

This is fragile because every publisher has different infrastructure, paywalls, JavaScript, WAFs, consent layers and article templates.

PRISM v2 must stop thinking:

> "I need to fetch this exact page."

and start thinking:

> **"I need sufficient evidence about this event."**

This is a fundamental architectural change.

## Principle

### We do not need every page. We need every story.

If Article A cannot be fetched, PRISM should not spend unlimited effort fighting that publisher.

It should look for:

- the same syndicated copy;
- the original wire source;
- RSS content;
- AMP or alternate representations where legitimately exposed;
- JSON-LD metadata;
- another publisher carrying the same event;
- quoted passages in downstream coverage;
- cached internal copies previously acquired;
- other independent sources reporting the same claim.

The acquisition system should optimize for **event coverage completeness**, not individual URL conquest.

No system can guarantee literal access to every article. The engineering target is therefore:

> **Always produce the richest evidence graph possible, with explicit visibility into what could and could not be acquired.**

---

# 4. Resilient News Acquisition Layer

The new acquisition layer should be a pipeline rather than a single scraper.

```text
                 DISCOVERY
                    |
      +-------------+-------------+
      |             |             |
 Google News      RSS        external indexes
      |             |             |
      +-------------+-------------+
                    |
             EVENT CANDIDATES
                    |
            CANONICAL RESOLUTION
                    |
             ACQUISITION LADDER
                    |
     +--------------+---------------+
     |              |               |
 structured      HTTP text       browser
 metadata        extraction      fallback
     |              |               |
     +--------------+---------------+
                    |
           NORMALIZED ARTICLE
                    |
          DEDUP / SOURCE LINEAGE
```

## 4.1 Discovery sources

PRISM should support several discovery adapters instead of depending on one feed.

Initial candidates:

- Google News RSS;
- publisher RSS feeds;
- publisher sitemaps / news sitemaps;
- GDELT;
- Media Cloud;
- optional commercial/event APIs later;
- direct user URL.

All discovery adapters should return the same internal object:

```text
DiscoveredArticle {
    url
    title
    publisher
    published_at
    language
    discovery_source
    event_hint
}
```

Discovery should be cheap and parallel.

---

## 4.2 Canonical resolution

Before fetching an article body:

- normalize tracking parameters;
- follow safe redirects;
- identify canonical URL where available;
- normalize publisher domain;
- detect Google News redirect wrappers;
- detect obvious syndicated mirrors;
- compute a stable article identity.

The same story discovered from three different feeds must not become three separate documents.

---

## 4.3 Acquisition ladder

Fetching should follow the cheapest and most stable route first.

### Stage A — structured metadata

Try to collect:

- `NewsArticle` JSON-LD;
- OpenGraph metadata;
- canonical URL;
- author;
- publication time;
- modification time;
- headline;
- description;
- publisher;
- article section.

Even if the body is unavailable, this information remains useful.

### Stage B — normal HTTP extraction

Use a normal HTTP request with strict limits.

Extract article content using a dedicated article extraction strategy rather than generic `soup.get_text()`.

Possible extraction stages:

```text
HTML
 -> remove boilerplate
 -> identify article container
 -> paragraph segmentation
 -> quote extraction
 -> metadata validation
```

### Stage C — bounded failure

A public service must not render arbitrary user-supplied URLs in a privileged
browser. If the regular response is only a JavaScript shell:

- mark direct acquisition as partial or unavailable;
- continue through controlled feeds, discovery and syndication routes;
- retain metadata when it is still useful;
- never weaken the network boundary to fight a publisher's anti-bot layer.

Any future browser-based acquisition belongs in a separately isolated service
with strict egress controls, not in the public request path.

### Stage D — alternate evidence route

If direct body acquisition fails:

- search known syndication siblings;
- identify likely AP / Reuters / AFP lineage;
- search other discovered articles for quoted or duplicated paragraphs;
- retain metadata-only representation;
- mark the source as partial.

The pipeline must continue.

---

# 5. Acquisition state must be explicit

Every article should expose an acquisition state.

```text
FULL
PARTIAL
METADATA_ONLY
BLOCKED
PAYWALLED
REMOVED
FAILED
```

And an extraction method:

```text
JSON_LD
HTTP
READABILITY
PLAYWRIGHT
RSS_BODY
SYNDICATION_RECOVERY
```

This information becomes part of the final evidence model.

PRISM must never silently pretend that a partial page is a complete article.

---

# 6. Security requirements for fetching

The current public URL fetch path must be hardened before PRISM is exposed again.

Minimum requirements:

- accept only `http` and `https`;
- reject embedded credentials;
- resolve DNS before connection;
- block loopback addresses;
- block RFC1918/private networks;
- block link-local addresses;
- block cloud metadata addresses;
- block private and special IPv6 ranges;
- repeat validation after every redirect;
- strict connect/read timeout;
- strict maximum response size;
- redirect limit;
- per-host concurrency limit;
- global worker concurrency limit;
- persistent rate limiting;
- trusted-proxy configuration for client IP headers;
- restricted CORS;
- isolated browser workers;
- controlled browser egress where practical.

The acquisition layer is an untrusted network boundary.

Treat every supplied URL as hostile input.

---

# 7. Normalized article model

The output of acquisition must stop being a single 25k-character string.

Target representation:

```text
Article {
    id
    canonical_url
    original_url

    publisher
    author
    title
    language

    published_at
    updated_at
    fetched_at
    extraction_version

    paragraphs[]
    quotations[]
    outbound_links[]
    named_entities[]

    acquisition_state
    extraction_method
    completeness_score

    content_hash
    similarity_hash

    discovery_source
    probable_origin
    lineage_group
}
```

Paragraphs must keep stable IDs so every later claim can point back to exact evidence.

Example:

```text
article_14:p17
```

---

# 8. Source lineage before consensus

A central rule of PRISM v2:

> **Ten publishers repeating Reuters do not equal ten independent confirmations.**

Before calculating consensus, PRISM must detect source families.

Signals:

- identical / near-identical paragraphs;
- explicit wire attribution;
- byline patterns;
- publication timestamps;
- headline similarity;
- semantic similarity;
- quotation overlap;
- canonical links;
- source references.

Example:

```text
Reuters origin
  |
  +-- Outlet A
  +-- Outlet B
  +-- Outlet C

AP origin
  |
  +-- Outlet D
  +-- Outlet E

Independent local reporting
  |
  +-- Outlet F
```

PRISM should display:

```text
17 articles
6 independent narrative origins
```

This is substantially more useful than a raw source count.

---

# 9. Claim extraction with provenance

The LLM should no longer output free-floating "facts".

Every extracted claim must be evidence-bound.

Example:

```text
ClaimInstance {
    id
    article_id
    paragraph_id
    source_text

    normalized_claim

    subject
    predicate
    object

    claim_type
    certainty
    attribution
    timestamp_reference
}
```

Example:

```text
source_text:
"Officials said the blast occurred shortly after 2 p.m."

normalized_claim:
"The blast occurred shortly after 14:00."

certainty:
ATTRIBUTED_ASSERTION

paragraph_id:
article_14:p17
```

No claim without provenance.

---

# 10. Claim clustering

Different wording can describe the same underlying claim.

```text
"The blast happened at about 2 p.m."
"The explosion occurred shortly after 14:00."
"At approximately two in the afternoon, an explosion was reported."
```

These should become one canonical claim cluster.

```text
CanonicalClaim C17
  |- instance Reuters:p4
  |- instance BBC:p8
  |- instance DR:p3
```

Clustering can initially combine:

- embeddings;
- entity overlap;
- temporal normalization;
- LLM adjudication only for ambiguous pairs.

The model should resolve ambiguity, not invent the data structure.

---

# 11. The core product: Claim × Source Matrix

The primary analytical object becomes a matrix.

```text
                         Reuters   BBC   RT   CNN   DR
C1 explosion occurred      +       +     +     +     +
C2 X caused explosion      ?       0     -     +     0
C3 twelve fatalities       +       +     +     +     +
C4 prior warning existed   0       +     0     +     +
```

Suggested states:

```text
+  supports / asserts
-  contradicts
?  explicitly uncertain
0  not mentioned
```

Every populated cell must be clickable back to the source paragraph.

A `0` is not automatically manipulation.

An omission only becomes analytically relevant when the missing claim is central to the event or disproportionately present among independent sources.

---

# 12. Event DNA

From the claim matrix PRISM can construct an **Event DNA**.

## 12.1 Invariant Core

Claims independently present across a high proportion of source families.

This is not labelled "truth".

It is labelled:

> **Cross-source invariant**

## 12.2 Contested Claims

Claims where independent sources assert incompatible versions.

## 12.3 Narrative Delta

For each source:

- unique claims;
- unusual omissions;
- changed causal attribution;
- changed agency;
- changed certainty;
- emotionally loaded additions;
- contextual additions absent elsewhere.

## 12.4 Source Independence

How many apparently separate reports actually derive from distinct origins.

## 12.5 Evidence Coverage

How much of the event's extracted claim space is supported by directly acquired evidence.

---

# 13. Replace the magic bias score

Remove the single 0-100 "propaganda" score as the central product metric.

Replace it with evidence-derived indicators.

Possible metrics:

```text
SOURCE INDEPENDENCE
CLAIM CONSENSUS
NARRATIVE DIVERGENCE
CAUSALITY DIVERGENCE
EVIDENCE COVERAGE
SOURCE LINEAGE CONCENTRATION
```

These metrics should be derived from observable data.

Example:

```text
Claim Consensus =
independent source families supporting claim
/
independent source families covering event
```

The LLM should not invent the number.

---

# 14. Narrative drift over time

PRISM should keep article publication and update timestamps.

This allows reconstruction of narrative evolution.

```text
09:14  first report appears
09:31  claim X introduced
10:03  claim X appears in 8 outlets
10:47  source wording changes
11:12  official statement contradicts X
12:05  four outlets update
14:20  three outlets retain original claim
```

This can become one of the product's most distinctive views.

The important question becomes:

> **Where did a claim originate and how did it propagate?**

---

# 15. Geographic refraction

The existing world map should become analytical rather than decorative.

Current concept:

```text
country -> top local headlines
```

PRISM v2:

```text
same event
   |
   +-- Denmark -> framing A
   +-- Germany -> framing A'
   +-- Italy   -> framing B
   +-- US      -> framing C
```

The user selects an event, not merely a country.

The map then displays:

- source count per country;
- independent source families;
- dominant claim differences;
- causal attribution differences;
- unique local claims;
- narrative divergence.

This gives the existing map a real reason to exist.

---

# 16. Existing fact-check enrichment

Where available, canonical claims can be connected to external published fact checks.

Important distinction:

PRISM should not ask an LLM:

> "Is this claim true?"

Instead it can show:

```text
Claim C17

Independent sources: 5
Contradicting source families: 2

Existing third-party fact checks:
- Source A -> False
- Source B -> Misleading
```

External fact checks are evidence attached to the claim graph, not absolute authority embedded into the model.

---

# 17. Product view: Narrative X-Ray

The first PRISM v2 interface should be one page.

Do not rebuild the whole frontend.

## Event header

```text
EVENT
Location / timestamp / source coverage
```

## Invariant Core

Claims shared by independent source families.

## Contested

Claims with incompatible versions.

## Narrative Deltas

What each major source adds, removes or changes.

## Source Lineage

Show syndication / likely origin graph.

## Claim Matrix

The evidence table.

## Timeline

Show claim origin and propagation when enough temporal data exists.

Every analytical statement should be traceable back to article evidence.

---

# 18. Technical architecture

```text
                         PRISM v2

                      DISCOVERY LAYER
      Google News / RSS / GDELT / Media indexes / URL
                             |
                             v
                       EVENT BUILDER
                             |
                             v
                    ACQUISITION MANAGER
          metadata -> HTTP -> renderer -> recovery
                             |
                             v
                       ARTICLE STORE
                             |
               +-------------+-------------+
               |                           |
               v                           v
        SOURCE LINEAGE               CLAIM EXTRACTION
               |                           |
               +-------------+-------------+
                             |
                             v
                       CLAIM CLUSTERING
                             |
                             v
                    CLAIM x SOURCE MATRIX
                             |
               +-------------+-------------+
               |             |             |
               v             v             v
           EVENT DNA      TIMELINE       GEO DELTA
               |             |             |
               +-------------+-------------+
                             |
                             v
                       NARRATIVE X-RAY
```

---

# 19. Spike plan — only a few hours first

Do not build the full platform yet.

The first spike should answer one question:

> **Does the Narrative X-Ray reveal something materially harder to obtain than asking a normal LLM to summarize several articles?**

## Phase 0 — freeze current product

Do not invest in the existing bias score architecture.

Keep the frontend components worth reusing.

## Phase 1 — acquisition spike

Choose one real event with broad international coverage.

Target:

```text
10-15 article candidates
>= 6 publishers
>= 3 countries if possible
```

Build a small acquisition runner that:

1. discovers or receives candidate URLs;
2. canonicalizes them;
3. tries the acquisition ladder;
4. stores paragraph-level normalized articles;
5. records acquisition state;
6. deduplicates obvious syndication.

### First success criterion

At least **8 useful article representations** for the event without manually copying article text.

A representation can be FULL or sufficiently useful PARTIAL content.

If this repeatedly fails across normal news events, acquisition remains the blocking problem and we do not continue into UI work.

## Phase 2 — claim extraction spike

From the acquired corpus:

- extract provenance-bound claims;
- cluster equivalent claims;
- classify support / contradiction / uncertainty / absence.

Generate the first Claim × Source matrix.

## Phase 3 — minimal Narrative X-Ray

Reuse the existing frontend.

Render only:

- Invariant Core;
- Contested Claims;
- Claim Matrix;
- Source Lineage summary.

No redesign.

No authentication.

No monetization.

No additional themes.

No unnecessary infrastructure.

---

# 20. Kill criteria

PRISM v2 should be abandoned or frozen if the spike shows that:

1. reliable multi-source acquisition requires constant publisher-specific maintenance;
2. the Claim Matrix cannot maintain evidence provenance;
3. source lineage is too noisy to distinguish syndication from independent reporting;
4. the final view provides little beyond what a generic LLM can produce from the same corpus;
5. acquisition cost or latency makes normal event analysis impractical.

The goal is not to save the project at all costs.

The goal is to discover whether there is a genuinely differentiated product inside it.

---

# 21. Success criteria

PRISM deserves continued development if one event analysis can demonstrate all of the following:

- multiple independent sources acquired automatically;
- exact paragraph provenance for every major claim;
- duplicated/syndicated reporting separated from independent origins;
- meaningful cross-source invariant claims;
- at least one contested or materially divergent claim exposed clearly;
- a Claim × Source matrix understandable in seconds;
- an insight that is difficult to obtain from reading a single article or running a single generic prompt.

If those conditions are met, PRISM is no longer a bias analyzer.

It becomes an **observability system for information narratives**.

---

# 22. Immediate engineering priority

The first implementation task is **not the LLM layer**.

It is:

## `acquisition_v2`

A small isolated module responsible for:

```text
URL / discovery candidate
        |
        v
safe canonical resolution
        |
        v
structured metadata
        |
        v
HTTP article extraction
        |
        v
bounded failure / partial record
        |
        v
alternate / syndication recovery
        |
        v
Normalized Article + acquisition diagnostics
```

The module should be testable independently from the current UI and analysis engine.

Once acquisition is robust enough, the rest of PRISM v2 becomes tractable.

Until then, acquisition is the project.

---

## Final principle

> **Do not fight to fetch every URL. Build a system that refuses to lose the event when one URL fails.**

---

# 23. Spike implementation contract — 20 August 2026

This section supersedes conflicting details in the earlier proposal while the
technical spike is active.

## Public acquisition boundary

- The hardened v1 URL fetcher is the required security baseline for every v2
  HTTP adapter.
- The public request path does not use a browser or execute publisher
  JavaScript.
- The earlier `PLAYWRIGHT` extraction method and `renderer` architecture box
  are not part of the spike. A future renderer would require a separately
  isolated service with controlled egress.
- Google News RSS is a discovery hint, not a guaranteed publisher URL resolver.
  Wrapper failures must remain explicit and must not count as useful articles.

The active extraction methods are:

```text
STRUCTURED_METADATA
HTTP_ARTICLE
JSON_LD_BODY
RSS_BODY
SYNDICATION_RECOVERY
```

## Benchmark scope

The acquisition gate is evaluated across at least three events:

1. a broadly covered international event;
2. a controversial political event;
3. a local event that receives international coverage.

The spike passes only if at least two events produce, without manual article
copying:

```text
>= 10 candidates
>= 8 FULL or useful PARTIAL articles
>= 6 publishers
>= 4 probable independent lineage groups
```

Metadata-only, blocked, removed, paywalled and failed records remain visible in
the report but do not satisfy the useful-article threshold.

## Persistence and evidence versioning

Every normalized article records `fetched_at`, `extraction_version`, content
hashes and paragraph IDs. Production storage is out of scope until the spike
passes. Before any public persistent Article Store is introduced, the Privacy
Notice, Terms, retention policy and third-party-content handling must be
updated.

## Current implementation boundary

The first implementation lives in the isolated `acquisition_v2` package and
produces local JSON benchmark artifacts. It does not change the v1 API, score,
prompt, frontend or production persistence.

That is the acquisition philosophy PRISM v2 should be built around.

---

# 24. Acquisition spike result - 20 August 2026

The live spike separates extraction quality from discovery quality. This is a
benchmark result, not a claim that every publisher is fetchable or that one
public provider is reliable enough for production.

## Automated discovery

`Iran Hormuz oil sanctions`, 12 candidates requested:

- GDELT returned HTTP 429 from the shared public quota even after the documented pause.
- Google News RSS returned 12 wrappers rather than documented publisher URLs.
- The run retained all 12 records as `METADATA_ONLY` and produced 0 useful articles.

**Outcome: FAIL.** Automated discovery is still the blocking part of acquisition.

## Direct-URL acquisition control

No article text was copied into PRISM. Public editorial URLs were supplied as
bounded candidates so the extractor could be evaluated independently.

| Event corpus | Candidates | Useful | Publishers | Origins | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| International / Hormuz | 12 | 9 | 7 | 9 | PASS |
| Controversial / Ukraine, initial mix | 12 | 7 | 7 | 7 | FAIL by 1 article |
| Controversial / accessible-source mix | 12 | 9 | 8 | 9 | PASS |
| European local-to-global / Schengen | 12 | 11 | 8 | 11 | PASS |

The rebalanced controversial corpus replaces two externally blocked/challenged
sources while keeping the event, threshold, concurrency limits and extraction
algorithm unchanged.

**Outcome: the extractor passes, but the full acquisition gate does not yet
pass.** Manual URL selection proves extraction viability; it does not satisfy
the requirement for automatic multi-source discovery.

## Decision

- Do not start claim extraction, UI changes or persistent article storage yet.
- Keep `acquisition_v2` isolated from the v1 public request path.
- Before continuing, add and benchmark at least one second discovery adapter that
  returns documented direct publisher URLs with predictable quotas, then add
  caching and explicit provider fallback.

The next investment is a reliable direct-URL discovery source and selection policy,
rather than more extraction heuristics or browser automation.

---

# 25. Discovery fabric decision - 20 August 2026

Automatic acquisition must not depend on one feed or on progressively more
aggressive scraping. The selected engineering direction is a provider fabric
that degrades by losing coverage, not by losing the whole event.

```text
event query
   |
   +-- owned feed/sitemap metadata index (primary)
   +-- Google News resolver (free bootstrap)
   +-- optional GDELT / commercial adapters (coverage)
   |
   v
normalize -> preserve provenance -> deduplicate -> diversify domains/countries
   |
   v
bounded article acquisition
```

## Provider lanes

1. **The owned metadata-only index is the primary lane.** The implemented
   SQLite/FTS catalog stores only URL/title/publisher/time/language/provenance,
   automatically retains resolved direct URLs and can poll an operator-reviewed
   registry of RSS feeds and explicit news sitemap `urlset` files.
2. **Google News is the free bootstrap sensor.** The isolated resolver is enabled
   for the spike so a new query can seed the index. It has a CLI kill switch,
   preserves the original wrapper and degrades to an explicit per-candidate
   error when the undocumented protocol changes.
3. **GDELT is an optional public sensor.** Quota failures do not discard local
   index or Google candidates.
4. **Brave is an optional commercial comparison adapter.** It is never selected
   by default, is not required by the architecture and cannot satisfy the free
   production lane.

The Google resolver is deliberately non-standard, but it is not a hidden
production dependency: input/output sizes are capped, POST redirects are
disabled, every result preserves the wrapper URL and resolution method, and a
protocol change produces an explicit per-candidate error.

## Fusion and failure policy

- fan out only within a fixed per-event request and time budget;
- apply provider-specific circuit breakers after repeated quota or protocol
  failures;
- cache discovery metadata by normalized query, locale and freshness window;
- prefer direct publisher URLs over unresolved wrappers;
- deduplicate canonical URLs before acquisition;
- select for publisher, country and probable-origin diversity instead of raw
  rank alone;
- never log provider secrets or copy them across origin redirects;
- keep a candidate when one optional enrichment step fails.

## Owned-index boundary

The local SQLite/FTS metadata catalog is implemented with a default 14-day
retention window. It never stores RSS bodies or acquired article text. Its
versioned source registry is empty by default so each feed can receive an
operator terms review before activation. Polling uses `ETag`/`Last-Modified`,
bounded two-megabyte responses, a minimum per-source interval and exponential
failure backoff. Sitemap indexes are not recursively expanded; each child news
sitemap must be explicitly reviewed and registered. A production service should
move the same contract to durable storage only after retention and rights review.

## Go/no-go gate

The free acquisition spike continues only if at least two of the three event
runs satisfy the existing useful-article, publisher and lineage thresholds.
After an event is seeded, an index-only replay must recover its direct URLs
without Google or a paid API. Before production, the reviewed RSS/sitemap
registry must provide enough ongoing coverage that a Google protocol failure
reduces recall rather than disabling discovery. Brave is not required.

## Three-event live validation

The experimental Google resolver was rerun end-to-end on all three established
corpora, with 12 automatically discovered candidates per event.

| Event corpus | Resolved | Useful | Publishers | Origins | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| International / Hormuz | 12/12 | 8 | 8 | 8 | PASS |
| Controversial / Ukraine | 12/12 | 6 | 5 | 5 | FAIL |
| European local-to-global | 12/12 | 11 | 8 | 11 | PASS |

All 36 wrappers resolved to direct publisher URLs, no wrappers remained and no
resolver error was recorded. Two of the three end-to-end runs passed the
existing acquisition thresholds. The political corpus failed on useful article
and publisher counts after publisher acquisition, not on wrapper resolution.

This converts the earlier Google metadata-only failure into a viable free
bootstrap route and satisfies the experimental two-of-three event threshold.
The production gate now depends on index-only replay and reviewed feed coverage,
not on a Brave subscription or any other paid discovery API.


## Free index replay validation

The international corpus was rerun through the new free default fabric and then
replayed with Google and every external discovery provider disabled:

| Discovery mode | Candidates | Useful | Publishers | Origins | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| Local index + Google bootstrap | 12 | 8 | 8 | 8 | PASS |
| Local index only | 12 | 8 | 8 | 8 | PASS |

All 12 replay candidates were emitted as `LOCAL_METADATA_INDEX`. The SQLite
database contained 12 rows and only URL/title/publisher/time/language/country,
resolution provenance and lifecycle metadata columns; no RSS content or article
body column exists. This proves that one successful free bootstrap can be replayed
without Google, GDELT, Brave or another paid discovery API.

The remaining production work is breadth and freshness: populate the reviewed
RSS/news-sitemap registry and repeat index-only validation across all three
event classes after the retention window.
