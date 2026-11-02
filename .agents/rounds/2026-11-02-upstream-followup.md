# 2026-11-02 upstream follow-up

Author: Claude Opus 5.5 at high (`improvements-pipeline` skill, "Upstream issue and PR follow-up").
Scope: every GitHub issue and PR ref that an active finding records (105 unique refs on
`main` `ce21317f`), the open Raven issues, and the residual that the sd-075 review recorded.

## Ref sweep

A GraphQL read at 2026-11-02T22:20Z resolved 104 of the 105 refs: 83 are open and 21 are not open.
One ref returns HTTP 404: `soroswap/docs#47` (`cs-002`), which the existing TODO item "Repair the `cs-002` owner
after `soroswap/docs` disappeared" covers.

Most closed refs are old and their findings already record the closure (`sd-004`, `sd-009`,
`sd-032`, `sd-035`, `sls-024`, `sls-029`, `sls-033`, `sls-039`). The table lists the refs that
needed action.

| finding | upstream ref | ref state | live re-check | repo action |
|---|---|---|---|---|
| `sd-055` | stellar/stellar-docs#2906, PR #2933 | closed by merge `50531cb5` | fixed on the deployed pages; the contract-restoration example is still broken | `fixed-upstream`, retire; successor `sd-081` |
| `sd-057` | stellar/stellar-docs#2908, PR #2929 | closed by merge `93f05612` | fixed; the optional issuer sentence was dropped in review | `fixed-upstream`, retire |
| `sls-085` | Stellar-Light/stellarlight#1673, PR #1805 | closed 2026-10-08 | fixed on Scout 1.9.116 | `fixed-upstream`, retire |
| `sls-086` | Stellar-Light/stellarlight#1674, PR #1805 | closed 2026-10-08 | fixed on Scout 1.9.116 | `fixed-upstream`, retire |
| `sls-088` | Stellar-Light/stellarlight#1739, PR #1806 | closed 2026-10-08 | classification fixed on Scout 1.9.116; fixture interfaces still have no source paths | `fixed-upstream`, retire; successor `sls-114` |
| `sd-048` | stellar/stellar-protocol#2010 | closed not_planned by the stale bot | still reproduces on master `0da06899` | closed-unfixed recurrence; status unchanged |
| `wai-001` | cloudflare/ai#634, PR #639 | PR closed unmerged; package frozen | still reproduces on 4.0.1 | `declined-upstream`; TODO "Move the demo off the deprecated `workers-ai-provider`" |
| `sd-059` | stellar/stellar-docs#2995 | open; the triage bot asks the maintainers to decide | site MCP search finds the codes; Raven's Discovery API path does not | evidence line; reply on #2995 posted (see "Upstream comments"); TODO option added |

stellar/stellar-dev-skill issues #162 to #166 (`sk-032` to `sk-036`) closed, and PRs #167 to #171
merged on 2026-11-02 (main `9c604c2b`). The deployed skills.stellar.org files match main. All five
findings are `fixed-upstream`. Raven serves them after the pin update (`.agents/TODO.md`).

Open refs with bot-opened fix PRs that wait for maintainer review: `sd-053` (#2899), `sd-054` (#2931), `sd-058` (#2932), `sd-060`, `sd-062`, `sd-063`, `sd-065` to
`sd-069`, and `sd-071` to `sd-073` (#3009 to #3021), and `sd-078` (#3022). They need no Raven action until a merge and deploy. The comment on
Inferara/soroban-security-portal#256 (`cs-009`) is a contributor's request to be assigned. It needs
no Raven reply.

## sd-059 two-path recheck

The triage bot wrote on #2995 that the site's MCP search finds the result-code pages, and that it
could not reach the endpoint that Raven measured. Raven reran the identifier probe at 22:28Z on both
paths:

| query | site MCP `search_stellar_developer_docs`, first hit | Raven `stellarDocs.search_docs` (Discovery API), top 5 |
|---|---|---|
| `op_bad_signer` | Set Options Result Codes | no result-code page |
| `op_too_many_signers` | Set Options Result Codes | no result-code page |
| `op_line_full` | Manage Sell Offer Result Codes | no result-code page |
| `op_cross_self` | Manage Buy Offer Result Codes | no result-code page |
| `op_low_reserve` | Allow Trust Result Codes (Set Options third) | no result-code page |
| `tx_bad_auth_extra` | Transaction Result Codes | no result-code page |
| the verbatim Set Options sentence | Set Options Result Codes | `list-of-operations#set-options` first, no result-code page |

For these seven queries, the docs content and the site MCP search return the result-code pages. The
Raven column is the author's authenticated production measurement. It was not compared with the raw
Discovery candidates, so the cause is not yet assigned: it can be the Discovery ranking or the
adapter's path scope and query-term guard. The `.agents/TODO.md` item for `sd-059` names that
comparison as the first step.

## New finding

`sd-080`: `fuzzing.mdx` line 197 tells readers to run `soroban contract build`. None of the four
documented install methods ships a `soroban` binary. The sd-075 reviewer recorded this residual. A docs-tree scan
found no other live `soroban` CLI instruction.

## Reviews

- Codex `gpt-6.1-sol` at high (lane `rv-fu`), two passes:
  [`rv-fu-review.md`](2026-11-02-upstream-followup/rv-fu-review.md) and
  [`rv-fu-review2.md`](2026-11-02-upstream-followup/rv-fu-review2.md). Every FIX item is reconciled
  in commit `9e3ec615` (`sd-059` body, `sd-081` shared-import residual, `sls-114` attribution, the
  pin TODO, and this ledger).
- Grok `grok-4.7` at high (lane `rv-fl`):
  [`rv-fl-review.md`](2026-11-02-upstream-followup/rv-fl-review.md). It accepted the resolver change,
  confirmed the `cs-002` retirement, and found the probe escape bug. The YAML unquote fix and the
  added resolver tests reconcile its notes. With the fix, `npm run improvements:probes` reports 18
  recurring and 0 fixed-candidate.

## Upstream comments (posted and read back with `gh api`, 2026-11-02)

| ref | purpose | comment |
|---|---|---|
| stellar/stellar-docs#2562 | `sd-081` added defects | https://github.com/stellar/stellar-docs/issues/2562#issuecomment-6590839544 |
| stellar/stellar-docs#2906 | `sd-055` resolution, residual `sd-081` | https://github.com/stellar/stellar-docs/issues/2906#issuecomment-6590846860 |
| stellar/stellar-docs#2908 | `sd-057` resolution | https://github.com/stellar/stellar-docs/issues/2908#issuecomment-6590847175 |
| Stellar-Light/stellarlight#1673 | `sls-085` resolution | https://github.com/Stellar-Light/stellarlight/issues/1673#issuecomment-6590847484 |
| Stellar-Light/stellarlight#1674 | `sls-086` resolution | https://github.com/Stellar-Light/stellarlight/issues/1674#issuecomment-6590847807 |
| Stellar-Light/stellarlight#1739 | `sls-088` resolution, residual `sls-114` | https://github.com/Stellar-Light/stellarlight/issues/1739#issuecomment-6590848126 |
| stellar/stellar-docs#2995 | `sd-059` two-path table; content change withdrawn | https://github.com/stellar/stellar-docs/issues/2995#issuecomment-6590941274 |
| cloudflare/ai#634 | `wai-001` decline acknowledged; closed not planned | https://github.com/cloudflare/ai/issues/634#issuecomment-6590945505 |
| stellar/stellar-dev-skill#162 to #166 | `sk-032` to `sk-036` resolutions | comments `6590848522`, `6590848916`, `6590849279`, `6590849669`, `6590850074` |

New filings: `sd-080` as stellar/stellar-docs#3024 and `sls-114` as Stellar-Light/stellarlight#1906.

## Retirements

`improvements/resolved.json` now holds `sd-055`, `sd-057`, `sls-085`, `sls-086`, `sls-088`, `sk-032`
to `sk-036`, and `cs-002`. The `cs-002` receipt records `upstreamRefsGone` for `soroswap/docs#47`
(HTTP 404), so no comment applied. Its golden `q-defi-soroswap-what-is` now names the resolved
receipt in `truth.verified.rootCause`. Only judge-blind truth changed, and the four reopened
clusters (`cluster-012`, `cluster-014`, `cluster-038`, `cluster-046`) were re-swept as consistent.
`npm run improvements:lint -- --live` passes.

## Open after this round

- `sd-059`: compare raw Discovery candidates with the adapter output (TODO item), then report on #2995 only if Discovery itself omits the pages.
- Pin bump for `sk-032` to `sk-036` waits for the overnight golden QA run (TODO item).
- `wai-001` migration (TODO item). `sd-048` stays `reported-upstream` after the stale-bot closure.

## Ecosystem filing batch

Three Codex lanes (`fl-s1`, `fl-s2`, `fl-lk`) rechecked 21 verified findings live. Grok `grok-4.7`
at high reviewed all of them ([`rv-fl-review.md`](2026-11-02-upstream-followup/rv-fl-review.md)):
20 FILE and one HOLD.

- `sls-095` (HOLD): merged Stellar-Light/stellarlight#1889 claims the Varial rename, but production
  still returns `found: false` for `varial` at 2026-11-02T23:18Z. Raven posted that result on the PR
  (https://github.com/Stellar-Light/stellarlight/pull/1889#issuecomment-6590972277) instead of a
  duplicate issue. The record is `reported-upstream`.
- The four 22:30Z probe fixed-candidates (`sls-095`, `sls-096`, `sls-100`, `sls-102`) were false: the
  probe parser kept `\"` in needles. The parser fix is in #336.
- Before filing, the Lumenloop records dropped internal lane wording and scratch file paths, and
  `sls-099` names `sls-085` as resolved.

Filed on 2026-11-02 and read back with `gh api` (state open, author `kalepail`, immutable snapshot
link present):

| finding | issue |
|---|---|
| `ll-032` | lumenloop/stellar-ecosystem-db#13 |
| `ll-033` | lumenloop/stellar-ecosystem-db#14 |
| `ll-034` | lumenloop/lumenloop-backend#48 |
| `ll-035` | lumenloop/lumenloop-backend#49 |
| `ll-036` | lumenloop/lumenloop-backend#50 |
| `ll-037` | lumenloop/lumenloop-backend#51 |
| `ll-038` | lumenloop/stellar-ecosystem-db#15 |
| `sk-030` | lumenloop/lumenloop-skills#6 |
| `sk-031` | stellar/stellar-dev-skill#172 |
| `sls-096` | Stellar-Light/stellarlight#1907 |
| `sls-097` | Stellar-Light/stellarlight#1908 |
| `sls-098` | Stellar-Light/stellarlight#1909 |
| `sls-099` | Stellar-Light/stellarlight#1910 |
| `sls-100` | Stellar-Light/stellarlight#1911 |
| `sls-101` | Stellar-Light/stellarlight#1912 |
| `sls-102` | Stellar-Light/stellarlight#1913 |
| `sls-103` | Stellar-Light/stellarlight#1914 |
| `sls-104` | Stellar-Light/stellarlight#1915 |
| `sls-105` | Stellar-Light/stellarlight#1916 |
| `sls-106` | Stellar-Light/stellarlight#1917 |
