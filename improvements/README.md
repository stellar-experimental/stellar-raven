# improvements/ — upstream findings from eval runs

## Principle

This MCP server's own tuning ceiling is limited. But running evals against it gives
outsized leverage for **discovering gaps and errors in the upstream surfaces and
provider package it depends on**. From now on, a primary artifact of every eval run is a recorded,
evidence-backed improvement recommendation set for those services. This directory is
that collection.

## Collections

- `lumenloop/` — findings about the Lumenloop API and its content corpus (slugs,
  extraction quality, vocabularies, endpoint completeness).
- `stellar-light-scout/` — findings about the Stellar Light/Scout API (response
  semantics, missing fields, content-type consistency; positive trust anchors too).
- `stellar-docs/` — findings about the Stellar Docs search surface (Algolia index):
  ranking, tokenization, vocabulary coverage. Docs-content findings also belong
  here when the indexed source content is stale, ambiguous, or missing a current
  explanation needed by grounded agents (for example `sd-007`). As of 2026-07-09 we
  hold operator Algolia credentials (write / crawler / analytics — see
  `research/services/stellar-docs-algolia.md`), so some `stellar-docs` findings now have
  a **direct-remediation** path in addition to filing upstream; see "Resolution paths"
  below for which findings that applies to and the bar it must clear.
- `skills/` — findings about the **upstream skill sources** pinned in
  `ecosystem-skills/MANIFEST.json`. Recommendations target the source repos. Bodies are not
  vendored here (they are fetched from the pinned commit and hash-verified), so there is no
  local copy to patch — and re-pinning to a fork or a patched branch is not a fix either.
- `workers-ai-provider/` — findings about Cloudflare's `workers-ai-provider` package and its
  AI Gateway delegate surface. Recommendations target `cloudflare/ai`.

Web findings are classified before filing as `docs-content`, `docs-search`, `site-content`,
`site-search`, or `canonical-source`. The two search categories include the corresponding Algolia
or crawler layer. These are routing categories, not automatic directories: a missing search result
does not establish that Docs or `stellar.org` should own the content, and empty collections are not
created without a verified finding and identified owner. Facts owned by a SEP, CAP, implementation,
or product repository are corrected there. A dedicated site collection should be added only when a
verified site finding cannot be represented honestly by an existing service lifecycle.

## Record format

One file per finding. YAML-ish frontmatter, then three short sections.

```
---
id: <collection>-NNN
service: lumenloop | stellar-light-scout | stellar-docs | skills | workers-ai-provider
status: proposed | verified | reported-upstream | declined-upstream | fixed-upstream
discovered: YYYY-MM-DD
upstreamTitle: <reader-first issue title; required before filing>
evidence:
  - eval/qa/results/<results-file stamp>
  - live verification note
  - .agents/TODO.md item or round-ledger ref
---

## Finding        (what's wrong, factually)
## Evidence       (how we know — stamps, paths, re-execution notes)
## Recommendation (the concrete upstream change)
```

## Lifecycle

- A finding enters as `proposed`. It graduates to `verified` **only with live
  re-execution evidence** — an eval judge's opinion alone is not verification.
- `reported-upstream` when it has been filed with the service owner;
  `declined-upstream` when an owner explicitly declines a still-reproducing change and the record
  carries the decline ref plus a `disposition`; `fixed-upstream` when an author-side live re-check
  confirms the fix. Refresh status whenever upstream changes (drift refresh is a natural checkpoint).
- This directory is an active queue, not an archive. `fixed-upstream` is a short-lived deletion
  candidate. A distinct reviewer must independently re-run the original trigger, inspect the
  upstream resolution/deploy, scan residuals and repo references, and confirm cleanup before the
  active file is deleted. Resolution appends a compact receipt to `resolved.json`; IDs in that
  ledger are never reused. GitHub closure or merge alone never clears the evidence bar.
- Declined, wontfix, legacy, and overfit decisions are retained while the original defect still
  reproduces. A superseded record can be retired only after its upstream ref points to a
  self-contained successor and that successor preserves the essential evidence.
- Findings here are for the **services**. Fixes to this repo (adapters, normalizers, catalog,
  eval goldens, and eval instruments) go to [`.agents/TODO.md`](../.agents/TODO.md). A finding file
  can note that a fix landed here, but the own-repo work stays in that queue.

## Upstream filing channels

`reported-upstream` means a GitHub issue (or equivalent) exists with the service owner.
Known channels (issue access confirmed 2026-07-09):

- `stellar-light-scout/` and `skills/` (Scout-sourced) findings → the Stellar-Light org:
  - <https://github.com/Stellar-Light/stellarlight> — the discovery-layer service behind
    the Stellar Light API (data/content/API-semantics findings).
  - <https://github.com/Stellar-Light/stellar-scout> — the Scout skill (skill-content and
    research-corpus findings).
  - <https://github.com/Stellar-Light/scout-mcp> — their MCP server surface.
  File on the repo that owns the failing surface; when unsure, file on `stellarlight`
  and cross-link. Record the issue URL in the finding's `evidence` list.
- `stellar-docs/` content/content-structure findings →
  <https://github.com/stellar/stellar-docs>; pure Algolia ranking/tokenization findings may still
  need search-owner triage when that repository cannot plausibly own the behavior.
- `lumenloop/` API/content findings → <https://github.com/lumenloop/lumenloop-backend>
  (authenticated issue access confirmed 2026-07-13). Directory-record corrections belong in
  <https://github.com/lumenloop/stellar-ecosystem-db>; skill-content findings remain in
  <https://github.com/lumenloop/lumenloop-skills>. Record the exact issue URL in the finding.
- `workers-ai-provider/` findings → <https://github.com/cloudflare/ai>.

Use `npm run improvements:file -- --file improvements/<collection>/<finding>.md --dry-run` to
review the resolved owner and standardized body, then omit `--dry-run` to file it. The generated
issue opens with an automated-content notice and a durable `generated-by-stellar-raven` marker,
links the exact public finding, and includes a resolution handoff back to this repository. Find
Raven-filed issues across repositories with `gh search issues --match body
'"generated-by-stellar-raven"'` — the quoted form is required, since an unquoted query tokenizes and
matches unrelated repositories. Issues filed before 2026-07-30 predate the disclosure and are not
backfilled; the marker identifies filings from that date forward, not the whole historical corpus.
The filer applies the `raven` label when the target repository provides it; every body retains Raven
provenance when that label is unavailable.
When upstream work is deployed, maintainers can open the **Upstream improvement ready for
verification** issue form with the finding id, resolving issue/PR, deploy/version timestamp, and
smallest live recheck. Raven independently verifies the live surface before marking a finding fixed.

Before a resolved file is retired, Raven posts the dated live result and its commit-pinned source
snapshot on the upstream ref. Future filing bodies include both the active `main` link and an
immutable snapshot so the source remains auditable after the active queue is drained.

Untouched open issues stay quiet. Routine live recurrences remain in the local finding and do not
justify reminder, status-chasing, or backlink-only comments. Follow up only on substantive owner
activity, a claimed fix that needs verification, materially new evidence that changes the action, or
author-owned PR work. Every newly recorded GitHub URL is read back before it is accepted as evidence.

Do not file an issue solely for bookkeeping when a live recheck already proves the defect fixed.
`fixed-upstream` without an issue URL is valid when its evidence records that dated recheck; add an
existing resolving issue/PR when one can be found without inventing a ceremonial report.

## Resolution paths (stellar-docs: upstream vs. direct Algolia)

Filing upstream is still the default. But `stellar-docs` findings split by root cause, and one class
is now directly remediable with the operator Algolia credentials in `.env`
(`research/services/stellar-docs-algolia.md`):

- **Content gaps** — a page is stale, wrong, ambiguous, or missing (e.g. `sd-007`, `sd-008`). These
  stay **upstream** on `stellar/stellar-docs`. Do not "fix" them by rewriting index records; the
  crawler would overwrite it and we would be diverging a shared corpus from its source.
- **Search-mechanism gaps** — ranking, tokenization, synonym/vocabulary, or crawler-config issues
  (`sd-003`; `sd-001` and `sd-006` are resolved precedents). These we *can* now remediate directly (a general rule/synonym, an
  index-settings change, a crawler-config fix + reindex), subject to a hard bar:
  - a **general mechanism only** — no per-page/per-query rules or synonyms (same anti-overfitting
    rule the eval loop enforces);
  - a **measured win on the read-only A/B harness** (`scripts/eval-algolia-raven.mjs`,
    `npm run eval:algolia-raven`) before it lands — the load-bearing `raven-promote-stellar-cli-install`
    rule is the ceiling of an acceptable single-target mechanism, not a template;
  - **shared-corpus caution** — it also serves the real DocSearch frontend, so prefer the lowest-risk
    rung (analytics read < rule/settings < crawler/index write) that closes the gap.

  Record a direct Algolia remediation in the finding's `evidence` (what changed, the A/B before/after,
  the live re-check) exactly like an upstream fix; keep the GitHub ref too when the underlying cause is
  also a content/crawler issue the docs owner should know about. The `sd-001` crawler fix and the
  resolved `sd-006` precedent retain separate canaries. The `sd-001` canary reports drift, while the
  load-bearing `sd-006` rule canary fails on drift.

**Analytics as evidence.** The Search Analytics / usage keys give us aggregated top-query and
no-result-query reports — a new, low-risk evidence source. Use them to quantify a finding's prevalence
(stronger than the eval corpus's approximation) and to surface content/vocabulary gaps we would
otherwise never see. Cite the analytics query and window in `evidence`.

## When findings get filed

After **every eval round**. See `eval/EVALS.md` for the eval workflow; filing the
round's findings into this directory is part of closing the round.
