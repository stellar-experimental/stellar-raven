# improvements/ — upstream service findings

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
- `stellar-docs/` — the Stellar Docs search surface (the Mintlify search): ranking, chunking,
  and vocabulary coverage. A docs-content finding also belongs here when the indexed source
  content is stale or ambiguous. It also belongs here when the content lacks an explanation that
  grounded agents need. See [Resolution paths](#resolution-paths-stellar-docs).
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
search index and its ingestion. Only `canonical-source` has its own collection. The other classes are
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
deletion. A distinct reviewer re-derives each deletion candidate; the skill's "Drain
`fixed-upstream`" step has the checks.

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

`improvements/intake.json` resolves the repository for each collection and for each finding
(`services.*` rules and per-finding overrides); the
[improvements-pipeline skill](../.agents/skills/improvements-pipeline/SKILL.md) has the rules.
`reported-upstream` means that a GitHub issue, or an equivalent, exists with the service owner.
Record the exact issue URL in the finding's `evidence` list.

### File a finding

```sh
npm run improvements:file -- --file improvements/<collection>/<finding>.md --dry-run
```

The dry run shows the resolved owner and the standardized body. Every filed body carries a durable
`generated-by-stellar-raven` marker. Find Raven-filed issues across repositories with this command:

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

The skill owns the follow-up loop and the rule to leave untouched open issues quiet.

## Resolution paths (stellar-docs)

Filing upstream is the default. The docs site runs on Mintlify, and Raven has no write path to its
content or search configuration. `stellar-docs` findings divide by root cause:

- **Content gaps.** A page is stale, wrong, ambiguous, or missing (for example `sd-004`). These
  findings stay upstream with the content owner, usually `stellar/stellar-docs`.
- **Search-mechanism gaps.** The Mintlify search ranks or chunks a page badly, or omits it. File
  these upstream with the query, the expected page, and the observed hits.

A gap in Raven's own docs scoping (path scopes, the candidate window, or the query-term guard) is
an own-repo fix, not a finding. It goes to `.agents/TODO.md` and needs a general mechanism and a
read-only retrieval-level A/B win before it ships. `docs/stellar-docs.md` defines the scoping
contract.

## When findings get filed

File a finding when an eval round, a drift refresh, an audit, or an upstream handoff shows an
upstream defect. Filing the round's findings is part of closing the round; the
[evaluation map](../eval/EVALS.md) describes the eval workflow.
