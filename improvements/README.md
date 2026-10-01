# improvements/ — upstream findings from eval runs

## Principle

Tuning this MCP server alone has a low ceiling. Evals against the server are better at finding
gaps and errors upstream. The upstream targets are the services and the provider package that
Raven depends on. A primary product of each eval run is a set of evidence-backed recommendations
for those targets. This directory holds that set.

## Collections

- `lumenloop/` — the Lumenloop API and its content corpus: slugs, extraction quality,
  vocabularies, and endpoint completeness.
- `stellar-light-scout/` — the Stellar Light/Scout API: response semantics, missing fields, and
  content-type consistency. It also records positive trust anchors.
- `stellar-docs/` — the Stellar Docs search surface (the Algolia index): ranking, tokenization,
  and vocabulary coverage. A docs-content finding also belongs here when the indexed source
  content is stale or ambiguous. It also belongs here when the content lacks an explanation that
  grounded agents need (for example `sd-037`). Raven's operator holds Algolia maintenance credentials, so some findings here have a
  direct-remediation path. See [Resolution paths](#resolution-paths-stellar-docs-upstream-vs-direct-algolia).
- `skills/` — the upstream skill sources pinned in `ecosystem-skills/MANIFEST.json`.
  Recommendations target the source repositories. Raven does not vendor skill bodies, so there is
  no local copy to patch. A re-pin to a fork or to a patched branch is not a fix.
- `workers-ai-provider/` — Cloudflare's `workers-ai-provider` package and its AI Gateway delegate
  surface. Recommendations target `cloudflare/ai`.
- `canonical-source/` — a primary dependency or product source that no collection above owns.
  Examples are a package that Raven vendors and a product repository's own docs. Recommendations
  target the repository that owns the defective fact or code.

Classify a web finding before you file it. The classes are `docs-content`, `docs-search`,
`site-content`, `site-search`, and `canonical-source`. The two search classes include the related
Algolia or crawler layer. Only `canonical-source` has its own collection. The other classes are
routing categories, not directories.

- A missing search result does not show that Docs or `stellar.org` must own the content.
- Do not create an empty collection. A collection needs a verified finding and an identified
  owner.
- Correct a fact in the SEP, CAP, implementation, or product repository that owns it.
- Add a dedicated site collection only when no existing service lifecycle can represent a verified
  site finding honestly.

## Record format

One file per finding. YAML-ish frontmatter, then three short sections.

```
---
id: <collection>-NNN
service: lumenloop | stellar-light-scout | stellar-docs | skills | workers-ai-provider | canonical-source
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

| Status | Meaning |
|---|---|
| `proposed` | Every finding starts here. |
| `verified` | Live re-execution evidence confirms the finding. The opinion of an eval judge alone is not verification. |
| `reported-upstream` | The finding is filed with the service owner. |
| `declined-upstream` | An owner explicitly declined a change that still reproduces. The record carries the decline reference and a `disposition`. |
| `fixed-upstream` | An author-side live re-check confirms the fix. |

Refresh the status when upstream changes. A drift refresh is a natural checkpoint.

This directory is an active queue, not an archive. `fixed-upstream` is a short-lived state before
deletion. Before the active file is deleted, a distinct reviewer must do these steps:

1. Re-run the original trigger independently.
2. Inspect the upstream resolution and its deployment.
3. Scan for residuals and for repository references.
4. Confirm the cleanup.

Resolution appends a compact receipt to `resolved.json`. IDs in that ledger are never reused. A
GitHub closure or merge alone never meets the evidence bar.

Keep declined, wontfix, legacy, and overfit decisions while the original defect still reproduces.
Retire a superseded record only when its upstream reference points to a self-contained successor.
That successor must preserve the essential evidence.

Findings here are for the **services**. Fixes to this repository go to
[`.agents/TODO.md`](../.agents/TODO.md): adapters, normalizers, the catalog, eval goldens, and eval
instruments. A finding file can note that a fix landed here, but the own-repo work stays in that
queue.

## Upstream filing channels

`reported-upstream` means that a GitHub issue, or an equivalent, exists with the service owner.
Record the exact issue URL in the finding's `evidence` list.

- `stellar-light-scout/` findings and Scout-sourced `skills/` findings go to the Stellar-Light
  organization. File on the repository that owns the failing surface. When you are not sure, file
  on `stellarlight` and cross-link.
  - <https://github.com/Stellar-Light/stellarlight> — the discovery-layer service behind the
    Stellar Light API. Use it for data, content, and API-semantics findings.
  - <https://github.com/Stellar-Light/stellar-scout> — the Scout skill. Use it for skill-content
    and research-corpus findings.
  - <https://github.com/Stellar-Light/scout-mcp> — their MCP server surface.
- `stellar-docs/` content and content-structure findings go to
  <https://github.com/stellar/stellar-docs>. A pure Algolia ranking or tokenization finding can
  still need search-owner triage when that repository cannot plausibly own the behavior.
- `lumenloop/` API and content findings go to <https://github.com/lumenloop/lumenloop-backend>
  (authenticated issue access). Directory-record corrections go to
  <https://github.com/lumenloop/stellar-ecosystem-db>. Skill-content findings go to
  <https://github.com/lumenloop/lumenloop-skills>.
- `workers-ai-provider/` findings go to <https://github.com/cloudflare/ai>.
- `canonical-source/` findings go to the owning repository. Set it as a per-finding override in
  `improvements/intake.json` after you verify the owner. The service rule is `mixed`, so the filer
  refuses a finding without an override.

### File a finding

```sh
npm run improvements:file -- --file improvements/<collection>/<finding>.md --dry-run
```

The dry run shows the resolved owner and the standardized body. Omit `--dry-run` to file the
issue. The generated issue has these parts:

- An automated-content notice and a durable `generated-by-stellar-raven` marker at the top.
- A link to the exact public finding.
- A resolution handoff back to this repository.
- The `raven` label, when the target repository provides it. Every body keeps Raven provenance
  when that label is unavailable.

Find Raven-filed issues across repositories with this command:

```sh
gh search issues --match body '"generated-by-stellar-raven"'
```

The quoted form is required. An unquoted query tokenizes and matches unrelated repositories.
Older Raven-filed issues have no marker, so a marker search does not find every Raven filing.

When upstream work is deployed, a maintainer can open the **Upstream improvement ready for
verification** issue form. The form takes the finding ID, the resolving issue or pull request, the
deployment version or timestamp, and the smallest live recheck. Raven verifies the live surface
independently before it marks a finding fixed.

Before Raven retires a resolved file, it posts two items on the upstream reference: the dated live
result and the commit-pinned source snapshot. New filing bodies include the active `main` link and
an immutable snapshot. The source therefore stays auditable after the active queue is empty.

### Follow up

Leave untouched open issues quiet. A routine live recurrence stays in the local finding. It does
not justify a reminder, a status request, or a backlink-only comment. Follow up only for these
events:

- Substantive owner activity.
- A claimed fix that needs verification.
- Materially new evidence that changes the action.
- Author-owned pull request work.

Read back every newly recorded GitHub URL before you accept it as evidence.

Do not file an issue only for bookkeeping when a live recheck already proves that the defect is
fixed. `fixed-upstream` without an issue URL is valid when its evidence records that dated
recheck. Add an existing resolving issue or pull request when you can find one. Do not invent a
ceremonial report.

## Resolution paths (stellar-docs: upstream vs. direct Algolia)

Filing upstream is the default. `stellar-docs` findings divide by root cause:

- **Content gaps.** A page is stale, wrong, ambiguous, or missing (for example `sd-004` and
  `sd-037`). These findings stay upstream on `stellar/stellar-docs`. Do not rewrite index records
  to correct them. The crawler overwrites such a change, and the shared corpus then differs from
  its source.
- **Search-mechanism gaps.** The cause is ranking, tokenization, synonyms or vocabulary, or
  crawler configuration (`sd-003`; `sd-001` and `sd-006` are resolved precedents). The operator
  can correct these directly with the maintenance Algolia credentials in `.env`. Possible changes
  are a general rule or synonym, an index-settings change, or a crawler-configuration fix with a
  reindex.

A direct Algolia change must meet the bar in
[`docs/stellar-docs.md`](../docs/stellar-docs.md#binding-write-guardrails). Read "Operator risk
ladder" and "Binding write guardrails" there. Measure the read-only A/B result with
`npm run eval:algolia-raven` before the change.

Record a direct Algolia remediation in the finding's `evidence`, exactly as for an upstream fix.
Give the change, the A/B result before and after, and the live re-check. Keep the GitHub reference
too when the cause is also a content or crawler problem that the docs owner must know about.

The `sd-001` crawler fix and the resolved `sd-006` precedent keep separate canaries. The `sd-001`
canary reports drift. The load-bearing `sd-006` rule canary fails on drift.

**Analytics as evidence.** The Search Analytics and usage keys give aggregated top-query and
no-result-query reports. They are a low-risk evidence source. Use them to measure how common a
finding is. That measure is stronger than the approximation from the eval corpus. Use them also
to find content and vocabulary gaps that the evals do not show. Cite the analytics query and
window in `evidence`.

## When findings get filed

File findings after **every eval round**. [`eval/EVALS.md`](../eval/EVALS.md) describes the eval
workflow. Filing the round's findings into this directory is part of closing the round.
