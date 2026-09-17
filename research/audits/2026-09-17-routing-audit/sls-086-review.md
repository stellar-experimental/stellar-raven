# sls-086 draft — independent source-report gate

- Reviewer: Fable high. Read-only; free live checks only. Draft bytes reviewed: `/tmp/raven-routing-audit-2026-09-17/sls-086-draft.md` (4,298 bytes, 2026-09-16 23:36 local).

## Verdict: PASS — file after two mechanical items and one optional strengthening line.

## Independently reproduced

| Claim | Class | My observation (2026-09-17 ~03:37Z) |
|---|---|---|
| Scout `aquarius` shortDescription ends "AQUA locks into ICE for on-chain DAO governance votes directing rewards across DEX/AMM markets." | C | `scout.searchProjects({q:"Aquarius"})` generatedAt 2026-09-17T03:37:18Z: identical sentence; statusAsOf 2026-09-15. |
| ICE-tokens page lines 46–48 (ICE tracks locked AQUA, "No direct operational use"; upvoteICE "Votes for markets"; governICE "Votes on governance proposals") | A | Fetched `.md`; sha256 `1cf038f3…` matches the draft; lines 46–48 verbatim. |
| Governance page line 12 "Governance voting does not offer rewards — it's purely for protocol decision-making." | A | sha256 `28186c71…` matches; line 11 governICE, line 12 verbatim. |
| How-to-vote page "Voting uses governICE" | A | sha256 `e1c7c8cc…` matches; line 15 verbatim. |
| Contrast (not in draft): Lumenloop `get_project aquarius` | C | "the community voting on which markets to incentivize" — accurate, no governance/reward conflation. |

## Owner, scope, dedupe, frontmatter

- Owner: Stellar-Light/stellarlight (directory data), per intake. Scope bounded to one description with an explicit "not surveyed" line.
- Repo dedupe: no active or resolved finding covers the description; resolved sls-026 is Aquarius SCF totals. Upstream: `gh search issues` for "governICE", "upvoteICE", "ICE governance" → 0; "aquarius" → #511 (sls-026), #727 (typo search), #517 (DEX cluster) — none overlap.
- Frontmatter parses with the repo lib: 8 evidence entries, title 77 chars (20–120), status `verified`, no errors. sls-086 is the next free id (sls-085 active, resolved tops at sls-084).
- Recommendation is general and matches the docs.

## Mechanical items before filing

1. Evidence line 8 cites `/tmp/raven-routing-audit-2026-09-17/code/upstream-two/`. Create the research snapshot (e.g. `research/audits/2026-09-17-routing-audit/aquarius-description-roles.md`) and point the line at it. Copy only the Aquarius files (the three docs pages, llms.txt, scout-aquarius.json); `veridise-1.json` in that directory belongs to the rejected Veridise item and must not travel with this finding.
2. Evidence line 5 ("Consumer context … paired answers for q-defi-aquarius-what-is") references gitignored result artifacts by implication. Either add the two artifact hashes (M1-B1 `ef988d64…`, M1-C1 `9f5fdab8…`) or keep the line as non-load-bearing context (it already disclaims causality).

## Optional strengthening (recommended)

Aquarius's own voting page (https://docs.aqua.network/voting-and-rewards/aquarius-voting.md, sha256 `7c54a89b…`, lines 5 and 7) says "How ICE holders direct SDEX and AMM rewards by voting for markets" and "users place **ICE** votes on the markets". A maintainer could cite that colloquial "ICE votes" wording to defend the description. Add one evidence line quoting it and state the distinction precisely: the docs use "ICE votes" loosely for *market* voting, which does direct rewards; the Scout sentence attributes reward direction to *governance* votes, which the governance page says carry no rewards. The defect is the word "governance", not the word "ICE".
