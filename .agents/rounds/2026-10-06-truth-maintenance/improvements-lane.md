# Improvements and upstream follow-up lane — 2026-10-06

Lane: read-only review (Claude Opus 5.5). No tracked file was edited. No GitHub comment, review,
issue, or thread action was taken. Every outward action below is a recommendation for the coordinator.

Branch at read time: `drift/2026-10-06-scout` (HEAD `c76b517c`, the drift lane's WIP commit).
Evidence copies are in `tmp/2026-10-06-maintenance/improvements-evidence/` (git-ignored).

Method:

- Enumerated 66 active findings and 74 distinct GitHub refs from frontmatter. The "last-checked"
  value is the newest date in each finding's frontmatter.
- Read every ref with `gh issue view` / `gh pr view` (state, stateReason, labels, comments, reviews,
  checks). For changed PRs, also read `gh api .../reviews`, `.../timeline`, the GraphQL review
  threads, and `repos/<repo>/rules/branches/<branch>`.
- Flagged a ref as changed when `updatedAt` > last-checked, or when the finding text does not record
  the current state.

## 1. Changed findings — deterministic state table

| finding | trigger | upstream ref | ref state (2026-10-06) | PR checks / reviews / blocker | live re-probe (2026-10-06) | verdict | recommended file update | next wake-up |
|---|---|---|---|---|---|---|---|---|
| `sls-089` | 65-request burst; 200 + `counts.total: 0` after a failed backend read | [stellarlight#1751](https://github.com/Stellar-Light/stellarlight/issues/1751) | OPEN, no comment, upd 2026-10-01. Scout shipped spec 1.9.62 on 2026-10-03 (`meta.partial`, `meta.failedReads`, 503 on stall). The issue does not mention it. | n/a | Burst replay at 2026-10-06T14:17Z: 0 of 64 searches returned 200 + total 0. 52 returned HTTP 503 (`retry-after: 2`). 1 client `fetch failed`. 2 returned 200 with `partial: true` and nonzero totals (Payments 303, Social Impact 21). 9 returned clean 200. | **fixed-upstream candidate; needs-response** | Add dated evidence: 1.9.62 contract plus burst result. Correct stale line 63 (see below). A distinct reviewer must repeat the burst before any status change. | Coordinator decides on a verification comment on #1751 (deployed fix → allowed by the no-noise rule) |
| `sd-037` | root `README.md` and `limits/README.md` on `master` lack an SLP index | [stellar-protocol#2021](https://github.com/stellar/stellar-protocol/pull/2021) (our PR); [#1981](https://github.com/stellar/stellar-protocol/issues/1981) CLOSED NOT_PLANNED (stale) | PR OPEN, head `53557ae2` (our merge of master, 2026-10-01T17:50Z). `leighmcculloch` APPROVED 2026-09-29T21:44:44Z (not dismissed). `leighmcculloch` enabled auto-merge (SQUASH) at 2026-09-29T21:45:54Z. | Checks `mddiffcheck`, `lineendings`, 2× Socket = SUCCESS. `mergeable_state: blocked`. **Blocker:** the branch ruleset sets `required_review_thread_resolution: true`. One Copilot thread is unresolved (outdated): [discussion_r4064649027](https://github.com/stellar/stellar-protocol/pull/2021#discussion_r4064649027). Our reply [r4137499419](https://github.com/stellar/stellar-protocol/pull/2021#discussion_r4137499419) says commit `65d35aeb` fixed it. | master `974df5f0` (2026-09-30): root README mentions `limits` only in the tree (line 50). `limits/README.md` has no "List of Proposals" and no `SLP-000` entry. | **still-repro; needs-response (author-owned PR action)** | Add evidence line: approval, auto-merge enabled, the thread-resolution blocker. | Coordinator: resolve the outdated thread (author-owned). Auto-merge will then squash-merge. Re-run both README checks after the merge. |
| `cs-002` | `concepts/aggregator.mdx` "(currently on Testnet)" for Phoenix/Aqua; `supported-amms.mdx` Aquarius "(Coming Soon)" | [soroswap/docs#47](https://github.com/soroswap/docs/issues/47) | OPEN. New comment by third party `SrvFernandes` 2026-10-02 with `/claim #47`, linking [soroswap/docs#48](https://github.com/soroswap/docs/pull/48). No maintainer activity. | #48: OPEN, head `08bccc15`, no checks, no reviews, `mergeStateStatus: CLEAN`. The diff removes both stale labels and adds a table that marks Soroswap, Phoenix, and Aqua "✅ Mainnet". | `main` `1d7a3c8a` (2026-09-06): line 13–14 still "(currently on Testnet)"; supported-amms line 3/12 still "coming soon"/"(Coming Soon)". Published `docs.soroswap.finance/concepts/aggregator` and `/aggregator/supported-amms` (HTTP 200) still carry both phrases. | **still-repro** (third-party candidate fix, unmerged) | Add evidence: candidate fix #48 by a third party, unmerged. | Next improvements round: if #48 merges, re-run the page checks and the `get_adapters()` simulation. No comment now. |
| `sk-025` | beta skill: "Never `Authorization: Bearer`" for beta host | [trustlesswork-skill#6](https://github.com/Trustless-Work/trustlesswork-skill/issues/6) | OPEN. New comment by third party `SrvFernandes` 2026-10-03 with `/claim #6`, linking [#18](https://github.com/Trustless-Work/trustlesswork-skill/pull/18). No maintainer activity. | #18: OPEN, REVIEW_REQUIRED, BLOCKED; CodeRabbit + Socket SUCCESS; bounty-claim body. Its new text says "all requests require `x-api-key` per deployed API verification". It does not scope bearer auth for the beta host, so it does not implement the sk-025 recommendation. | `main` `80e2467f` (2026-09-27): `trustless-work-dev/skills/api/v2/core-concepts.md:30` still says "Never `Authorization: Bearer`." | **still-repro** | Add evidence: third-party PR #18 does not address the beta bearer scope. | Next improvements round. No comment (no maintainer activity; PR unmerged). |
| `sk-026` | `.../errors/escrow-receiver-trustline-missing` and `.../errors/token-trustline-missing` return 404 | [trustlesswork-skill#16](https://github.com/Trustless-Work/trustlesswork-skill/issues/16) | OPEN. New comment by `SrvFernandes` 2026-10-03 with `/claim #16`, linking [#17](https://github.com/Trustless-Work/trustlesswork-skill/pull/17). No maintainer activity. | #17: OPEN, REVIEW_REQUIRED, BLOCKED; +336/−183 on one file. It fixes the two grouped URLs. It also adds `/errors/auth/` and `/errors/tx/` groups and codes. Four sample new URLs return 404 (`errors/auth/authentication-required`, `errors/tx/tx-submit-failed`, `errors/escrow/escrow-condition-expired`, `errors/token/token-limit-exceeded`). It also replaces "Never `Authorization: Bearer`" with a bearer header. | `main` `80e2467f`: line 179 and line 214 still carry the ungrouped URLs. Live: both ungrouped URLs 404; both grouped URLs 200. | **still-repro** | Add evidence: candidate PR #17 unmerged; it adds unverified error URLs (four sampled return 404). | Next improvements round. If #17 merges, re-run the four original URL checks and check the new URLs. |
| `sd-027` | Guestbook prerequisites require a LaunchTube JWT | [stellar-docs#2367](https://github.com/stellar/stellar-docs/pull/2367) CLOSED 2026-09-09 ("superseded by #2837", `ElliotFriend`); [#2700](https://github.com/stellar/stellar-docs/issues/2700) OPEN | Finding text still says "PR #2367 remains open" (latest recurrence, `sd-027…md:19`). `.agents/TODO.md:26-40` already records the closure and #2837. | [#2837](https://github.com/stellar/stellar-docs/pull/2837): OPEN, head `108ba24e` (unchanged since the 2026-09-29 TODO check), 9/9 checks SUCCESS, `xw-dd` APPROVED 2026-09-15, `reviewDecision: REVIEW_REQUIRED`, BLOCKED. | `developers.stellar.org/docs/build/apps/guestbook/passkeys-prerequisites`: HTTP 200, "launchtube" 30 hits, "smart account kit" 0 hits, `kalepail/passkey-kit` 2 links. | **still-repro** | Add a recurrence: #2367 closed and superseded by #2837 (unmerged). | Per TODO:26. No comment. |
| `sd-034` | smart-wallet guide names only Passkey Kit | same as sd-027 | Same as sd-027 (`sd-034…md:18` still says #2367 open). | same | `.../guides/contract-accounts/smart-wallets`: HTTP 200, "passkey kit" 5 hits, "smart account kit" 0 hits, `kalepail/passkey-kit` 2 links. | **still-repro** | Same as sd-027. | Per TODO:26. |
| `sd-048` | CAP-0075 lists `d` ∈ {3,5,7,11}; same CAP says only d=5 | [stellar-protocol#2010](https://github.com/stellar/stellar-protocol/issues/2010) | OPEN. `github-actions` added label `stale` and a stale comment 2026-10-02. The bot closes it after 30 more quiet days (on or after about 2026-11-01). | n/a | `core/cap-0075.md` on master: line 78 still "`d`: S-box degree (3, 5, 7, or 11)"; line 124 "Only d=5 is supported"; line 157 "`d` is not 5". Last path commit `d186cf31` (2026-08-20, #1996). | **still-repro** | Add evidence: stale label 2026-10-02. If it closes unfixed, classify `closed-unfixed` and keep the finding. | No keep-alive comment (no-noise rule). Re-check after about 2026-11-01. |
| `wai-001` | `workers-ai-provider` 4.0.0 throws `Unknown gateway provider "moonshotai"` | [cloudflare/ai#634](https://github.com/cloudflare/ai/issues/634) OPEN (upd 2026-08-15); [cloudflare/ai#639](https://github.com/cloudflare/ai/pull/639) | #639 OPEN, head `b57a507c` (unchanged). New comment 2026-10-01 by the PR author `edenbuilds` (third party): asks a maintainer to start CI. No maintainer reply. | No checks reported; REVIEW_REQUIRED; BLOCKED. | `npm view workers-ai-provider version` = 4.0.0 (published 2026-07-22). Installed `node_modules/workers-ai-provider` = 4.0.0. The published artifact that reproduced on 2026-09-09 is unchanged; the mock reproduction was not re-run. | **still-repro (unchanged artifact)** | Optional: note the author ping. No status change. | Next improvements round. No comment. |

Stale text to correct in `improvements/stellar-light-scout/sls-089-project-search-failed-read-zero-count.md:63`:
it says the consumer adapter repair "remains in `.agents/TODO.md`". The TODO has no such item. The
repair is in code: `src/adapters/scout.ts:23`, `:181` (the `/^backend read failed(?:\s|:|$)/` test),
and `:190` (the retry hint).

Cross-lane note for the drift lane (#223): since 1.9.62, Scout states `partial` and `failedReads` as
fields. The live spec says "Count real loss on this field, not on the 200 status." The Raven adapter
still keys on the warning prefix (`src/adapters/scout.ts:181`). That is own-repo work, not a finding.
It belongs in `.agents/TODO.md` if the drift lane does not absorb it.

## 2. Scout findings re-probed for the 1.9.61 → 1.9.71 drift (task 6)

Live spec: `https://stellarlight.xyz/api/openapi.json` reports `info.version` 1.9.71, SHA-256
`42031cdb1134e3916c8be8244e09f0d72eddca3c149e669f978710ac12efbd06` (read 2026-10-06T14:14Z).
GitHub state is unchanged for all rows below, except `sls-089` (section 1).

| finding | upstream ref | live re-probe (2026-10-06) | verdict |
|---|---|---|---|
| `sls-024` | [stellarlight#494](https://github.com/Stellar-Light/stellarlight/issues/494), [stellar-scout#9](https://github.com/Stellar-Light/stellar-scout/issues/9) (both CLOSED COMPLETED 2026-08-11) | `rendergate` and `clevercon` still return `deployment.network: "mainnet"`, `deployment.sourceUrl: null`, while `statusSourceUrl` points to `stellar.expert/explorer/testnet/...`. Full 1004-row population scan not re-run. | still-repro (targeted) |
| `sls-029` | [#514](https://github.com/Stellar-Light/stellarlight/issues/514), [#742](https://github.com/Stellar-Light/stellarlight/issues/742) (CLOSED) | `GET /api/projects/search?q=oracle&limit=100` (14:15:43Z, SHA-256 `9ca90b2d…094f`): `dia`, `band`, `redstone-finance`, `reflector` have `products: null`; `lightecho` has one `oracle-feed` product with `contractId: null`; no `oracleDeployments`. | still-repro |
| `sls-033` | [#519](https://github.com/Stellar-Light/stellarlight/issues/519), [#742](https://github.com/Stellar-Light/stellarlight/issues/742) (CLOSED) | `type=Wallet&limit=100` (14:15:43Z, SHA-256 `b20816ba…0e3c`): 72 rows; 10 null `productKind`; 39 empty `availability`. Identical to the 2026-09-29 counts. | still-repro |
| `sls-085` | [#1673](https://github.com/Stellar-Light/stellarlight/issues/1673) OPEN | `q=soroswap`: `CAG5LRYQ…JDDH` still labeled `"aggregator router"`. | still-repro |
| `sls-086` | [#1674](https://github.com/Stellar-Light/stellarlight/issues/1674) OPEN | `q=aquarius` `shortDescription` still ends "AQUA locks into ICE for on-chain DAO governance votes directing rewards across DEX/AMM markets." | still-repro |
| `sls-087` | [#1738](https://github.com/Stellar-Light/stellarlight/issues/1738) OPEN | `GET /api/repos/explain` (Horizon question), `generatedAt` 2026-10-06T14:15:21.696Z: answer `MaxSupportedProtocolVersion = 28`, `answerSource: knowledge-note`, `answerAsOf` 2026-09-01. `codeVerified.scannedRef` `ee5241ec8d9a3233b574ea432ec313b304b6851d` (2026-10-03) defines `MaxSupportedProtocolVersion uint32 = 29` at `internal/ingest/main.go:38`. The answer also cites "scanned ref 82660510", which is not the response's `scannedRef`. | still-repro |
| `sls-088` | [#1739](https://github.com/Stellar-Light/stellarlight/issues/1739) OPEN | Same response: `repoMeta.kind: "contract"`, `kindBasis: "isDeployableContract"`, `codeVerified.isDeployableContract: true`. | still-repro |
| `sk-019` | [stellar-scout#13](https://github.com/Stellar-Light/stellar-scout/issues/13) OPEN | Canonical `Stellar-Light/stellarlight` `public/skills/stellar-scout.md:253` still lists `POST /api/feedback`; `references/api-reference.md:251,276,344` still document the write and its schema helper. Served copy (`/api/skills/stellar-scout`, 34902 chars) line 253 same. | still-repro |
| `sk-027` | [stellar-scout#14](https://github.com/Stellar-Light/stellar-scout/issues/14) OPEN | Canonical file lines 14, 90, 240–241, 312 and `api-reference.md:189,194` unchanged. `/api/skills` now has 63 entries (sdf 8, community 20, external 12, lumenloop 8, stellarlight 15); `/api/skills/soroban` HTTP 404. The 1.9.71 `listSkills`/`getSkill` **API descriptions** are now accurate. The finding targets the skill text, which did not change. | still-repro |
| `sk-028` | [stellar-scout#15](https://github.com/Stellar-Light/stellar-scout/issues/15) OPEN | Canonical `stellar-scout.md:91` still "currently in the dozens, not hundreds"; `api-reference.md:104` still "~110 profiles". `/api/status` builders count is now **320** (233 on 2026-10-02). | still-repro (gap grew) |

Source freshness: the newest commit on `public/skills/stellar-scout.md` in `Stellar-Light/stellarlight`
is `eb27df33` (2026-09-08). The distribution repo `Stellar-Light/stellar-scout` HEAD is `3b587aa9`
(2026-09-08). The monorepo `main` is `b6a301b0` (2026-10-06T13:42Z). The 1.9.71 description rewrites
did not reach the skill files.

## 3. Unchanged findings

- 47 other findings: every upstream ref is unchanged since the finding's last recorded check (no
  state, label, comment, or review after that date). Not re-probed, except by the probe run below.
- `npm run improvements:probes` (exit 0): `8 recurring, 0 fixed-candidate, 0 inconclusive, 0 errors,
  8 run` — `ll-003`, `ll-007`, `sk-005`, `sk-007`, `sk-014`, `sk-015`, `sk-022`, `sd-054` all recur
  (`improvements-evidence/probes.txt`).
- No open inbound `[upstream-ready]` handoff issue exists in `stellar-experimental/stellar-raven`
  (`gh issue list --state all --limit 30`; newest #181 is CLOSED).
- No finding qualifies for `fixed-upstream` this round. `sls-089` is a candidate only (section 1).

## 4. Lint results

| command | exit | output |
|---|---|---|
| `npm run improvements:lint` | 0 | `improvements lint ok (66 findings)` |
| `npm run improvements:lint -- --live` | 0 | `improvements lint ok (66 findings, live intake checked)` |
| `npm run improvements:probes` | 0 | `probe summary: 8 recurring, 0 fixed-candidate, 0 inconclusive, 0 errors, 8 run` |

## 5. `.agents/TODO.md` items due on or before 2026-10-20

No item carries a calendar due date or `reverifyBy` date. These items are event-triggered "at the next
improvements/drift round", so they are due now:

1. **sd-027 / sd-034 — PR #2837** (`.agents/TODO.md:26`). Check: PR state and head. Result: unchanged
   (head `108ba24e`, 9/9 SUCCESS, REVIEW_REQUIRED, BLOCKED; last update 2026-09-29). Live pages still
   reproduce. Action: none; keep the item.
2. **sd-037 — PR #2021** (`.agents/TODO.md:42`). Check: merge blocker, state, new reviews. Result:
   the blocker is the unresolved outdated Copilot thread (ruleset `required_review_thread_resolution`).
   Auto-merge (squash) is armed. Corrections for the TODO text at lines 49–50: the approval time is
   2026-09-29T21:44:44Z UTC (TODO says 2026-09-30). The PR head is now `53557ae2` (TODO says
   `777561b2`). The REST review record reports `commit_id` `53557ae2` and state APPROVED.
   Action: resolve the thread (author-owned); no reminder comment.
3. **Horizon protocol-ceiling monitor** (`.agents/TODO.md:65`). Check: one free `explainRepo` reading.
   Result: value `28`, `generatedAt` 2026-10-06T14:15:21.696Z, `scannedRef` `ee5241ec…851d`,
   `answerSource` `knowledge-note`; the source at that ref says `29`. The blocker stays. Deviation:
   this lane called the public Scout API directly, not the local Raven server that the TODO names.
   The coordinator can repeat it through Raven if the ledger needs that path.
4. **Codemode short-token repair** (`.agents/TODO.md:265`). Check: upstream repair. Result: see
   section 6 — no repair exists.
5. **Docs title-set ceiling monitor** (`.agents/TODO.md:433`, drift-lane item). Check: count in
   `inventory/stellar-docs-titles.json`. Result: 666 titles (ceiling 1,000).
6. **Owner decision A** (`.agents/TODO.md:482`): the paired run waits for a weekend UTC day. The
   weekend of 2026-10-10/11 falls inside the window. This is owner-only and paid; no lane action.
   While it runs, the `ai` upgrade item (`.agents/TODO.md:196`) must not run or merge.

Stale-bot dates after the window (for awareness): issue `stellar-protocol#2010` (sd-048) can close on
or after about 2026-11-01. PR #2021 becomes stale-eligible about 30 days after its last activity
(2026-10-01).

## 6. Issue #167 verdict (codemode short-token prefix)

- [cloudflare/agents#2296](https://github.com/cloudflare/agents/issues/2296): OPEN, label `bug`, zero
  comments, `updatedAt` 2026-09-17T03:43:47Z, no linked PR.
- `npm view @cloudflare/codemode version time --json`: latest **0.5.3**, published
  2026-10-02T12:34:18.801Z (0.5.2: 2026-09-11).
- This repo pins **0.5.1**: `package.json:66` and `package-lock.json` (`node_modules/@cloudflare/codemode`
  version 0.5.1).
- 0.5.3 cannot contain the fix. `npm pack` of 0.5.2 and 0.5.3: every `dist/*.js` file is
  byte-identical (`dist/index.js` SHA-256 `846765d6835f74b61550c822b1b8e75d15e845ace250533394ed7d3c84f003b7`
  in both). The differences are `package.json` (version), `dist/index.d.ts` (a Standard Schema `types`
  field), its source map, and `docs/index.md`. `dist/index.js:1265` in 0.5.3 still has
  `field.tokens.some((c) => c.startsWith(token) || token.startsWith(c))`.
- Upstream `main` (`0a25ca92`): `packages/codemode/src/connectors/search.ts:68` still has the same
  rule. The last commit on that path is `80ad8deecf` (2026-07-21, #1969).
- Verdict: no upstream repair exists in any release or on `main`. `cs-001` stays `reported-upstream`.
  Issue #167 stays open. No dependency bump is needed for this defect.

## 7. Recommended actions for the coordinator (summary)

1. `sd-037`: resolve the outdated Copilot thread on stellar-protocol#2021 (author-owned; armed
   auto-merge then squashes). Then re-run both README checks.
2. `sls-089`: have a distinct reviewer repeat the burst (load-dependent; one replay is not proof).
   If it confirms explicit failures, decide on a verification comment on #1751 and the resolver path,
   or a successor if a residual remains. The live spec still does not define `counts.total` under
   `partial: true`.
3. Finding text updates: dated evidence for `sls-089`, `sd-037`, `cs-002`, `sk-025`, `sk-026`,
   `sd-048`, `sd-027`, `sd-034`; fix `sls-089…md:63`; fix `.agents/TODO.md:49-50` (date and head).
   Then run `npm run improvements:index` and `npm run improvements:lint`.
4. No comments on cs-002, sk-025, sk-026, sd-048, wai-001: no maintainer activity, and the
   third-party PRs are unmerged.

Load note: the `sls-089` burst replay sent 65 concurrent read-only requests to `stellarlight.xyz`
once, at 2026-10-06T14:17Z. A single request 20 s later returned HTTP 200 with `partial: false`.
