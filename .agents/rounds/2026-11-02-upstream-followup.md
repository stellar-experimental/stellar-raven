# 2026-11-02 upstream follow-up

Author: Claude Opus 5.5 at high (`improvements-pipeline` skill, "Upstream issue and PR follow-up").
Scope: every GitHub issue and PR ref that an active finding records (104 unique refs on
`main` `ce21317f`), the open Raven issues, and the residual that the sd-075 review recorded.

## Ref sweep

A GraphQL read at 2026-11-02T22:20Z returned 83 open refs and 21 refs that are not open. One ref
is missing: `soroswap/docs#47` (`cs-002`), which the existing TODO item "Repair the `cs-002` owner
after `soroswap/docs` disappeared" covers.

Most closed refs are old and their findings already record the closure (`sd-004`, `sd-009`,
`sd-032`, `sd-035`, `sls-024`, `sls-029`, `sls-033`, `sls-039`). The table lists the refs that
needed action.

| finding | upstream ref | ref state | live re-check | repo action |
|---|---|---|---|---|
| `sd-055` | stellar/stellar-docs#2906, PR #2933 | closed by merge `50531cb5` | fixed on the deployed pages | `fixed-upstream`, retire |
| `sd-057` | stellar/stellar-docs#2908, PR #2929 | closed by merge `93f05612` | fixed; the optional issuer sentence was dropped in review | `fixed-upstream`, retire |
| `sls-085` | Stellar-Light/stellarlight#1673, PR #1805 | closed 2026-10-08 | fixed on Scout 1.9.116 | `fixed-upstream`, retire |
| `sls-086` | Stellar-Light/stellarlight#1674, PR #1805 | closed 2026-10-08 | fixed on Scout 1.9.116 | `fixed-upstream`, retire |
| `sls-088` | Stellar-Light/stellarlight#1739, PR #1806 | closed 2026-10-08 | fixed on Scout 1.9.116 | `fixed-upstream`, retire |
| `sd-048` | stellar/stellar-protocol#2010 | closed not_planned by the stale bot | still reproduces on master `0da06899` | closed-unfixed recurrence; status unchanged |
| `wai-001` | cloudflare/ai#634, PR #639 | PR closed unmerged; package frozen | still reproduces on 4.0.1 | `declined-upstream`; TODO "Move the demo off the deprecated `workers-ai-provider`" |
| `sd-059` | stellar/stellar-docs#2995 | open; the triage bot asks the maintainers to decide | site MCP search finds the codes; Raven's Discovery API path does not | evidence line; reply on #2995; TODO option added |

Open refs with bot-opened fix PRs that wait for maintainer review: `sk-035` (#167), `sk-036` (#168),
`sd-053` (#2899), `sd-054` (#2931), `sd-058` (#2932), `sd-060`, `sd-062`, `sd-063`, `sd-065` to
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

The docs content and the site search are sound. The gap is in the Discovery API ranking that Raven
uses, which the docs owner cannot change.

## New finding

`sd-080`: `fuzzing.mdx` line 197 tells readers to run `soroban contract build`. Homebrew and the
install script ship only `stellar`. The sd-075 reviewer recorded this residual. A docs-tree scan
found no other live `soroban` CLI instruction.

## Review

Pending: the distinct reviewer re-derives the five deletion candidates, the two status changes, the
sd-059 evidence, and the sd-080 draft.
