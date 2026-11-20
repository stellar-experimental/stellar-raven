# improvements/ — upstream service findings

Evals surface upstream gaps and errors more reliably than server-side tuning can mask them. This directory holds evidence-backed findings for upstream services and provider packages that Raven depends on.

## Collections

- `lumenloop/` — Lumenloop API and corpus (slugs, extraction, vocabularies, endpoints).
- `stellar-light-scout/` — Stellar Light/Scout API (response semantics, missing fields, content types, positive trust anchors).
- `stellar-docs/` — Stellar Docs (Mintlify) search ranking/chunking/vocabulary and stale, ambiguous, or missing indexed docs content ([Resolution paths](#resolution-paths-stellar-docs)).
- `skills/` — Upstream skill repos pinned in `ecosystem-skills/MANIFEST.json`. Raven does not vendor skill bodies; re-pinning to a fork is not a fix.
- `workers-ai-provider/` — Cloudflare's `workers-ai-provider` package and AI Gateway delegate (`cloudflare/ai`).
- `canonical-source/` — Primary dependencies or product repos not owned above; targets the repo that owns the defective fact or code.

Classify web findings as `docs-content`, `docs-search`, `site-content`, `site-search`, or `canonical-source` before filing (only `canonical-source` has its own directory; search classes include ingestion). A missing search hit does not prove Docs or `stellar.org` should own the fact—fix facts in the owning SEP, CAP, or product repo. Never create an empty collection; add a site collection only when no existing lifecycle fits a verified finding.

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

This directory is an active queue, not an archive. `fixed-upstream` is short-lived before deletion; a distinct reviewer re-derives each deletion candidate (see "Drain `fixed-upstream`" in [`improvements-pipeline`](../.agents/skills/improvements-pipeline/SKILL.md)). Resolution appends a receipt to `resolved.json`; resolved IDs are never reused, and a GitHub closure or merge alone never proves a fix.

Keep declined, wontfix, legacy, and overfit records while the defect still reproduces. Retire a superseded record only when its upstream reference points to a self-contained successor preserving essential evidence.

Own-repo fixes (adapters, normalizers, catalog, goldens, evals) go to [`.agents/TODO.md`](../.agents/TODO.md), not here.

## Upstream filing channels

`improvements/intake.json` resolves target repos per collection and per finding ([`improvements-pipeline`](../.agents/skills/improvements-pipeline/SKILL.md) owns the rules and follow-up loop). Record the exact upstream issue URL in `evidence` when marking `reported-upstream`.

### File a finding

```sh
npm run improvements:file -- --file improvements/<collection>/<finding>.md --dry-run
```

Filed bodies include a `generated-by-stellar-raven` marker, an active `main` link, and (when committed cleanly) an immutable commit-pinned snapshot. Search Raven-filed issues with the quoted marker (older filings predate the marker):

```sh
gh search issues --match body '"generated-by-stellar-raven"'
```

When upstream deploys a fix, maintainers can open the **Upstream improvement ready for verification** issue form; Raven verifies live independently before marking fixed. Before retiring a resolved file, post the dated live check and commit-pinned source snapshot on the upstream reference.

## Resolution paths (stellar-docs)

Raven has no write path to Mintlify content or search config, so filing upstream is the default:

- **Content gaps** (stale, wrong, ambiguous, or missing pages): file with the content owner, usually `stellar/stellar-docs`.
- **Search-mechanism gaps** (bad Mintlify ranking/chunking or omitted pages): file upstream with the query, expected page, and observed hits.

Gaps in Raven's own docs scoping (path scopes, candidate window, query-term guard) go to `.agents/TODO.md` and require a general mechanism plus a read-only retrieval A/B win ([`docs/stellar-docs.md`](../docs/stellar-docs.md)).

## When findings get filed

File upstream defects during eval rounds ([`eval/EVALS.md`](../eval/EVALS.md)), drift refreshes, audits, or upstream handoffs.
