# Improvements follow-up — 2026-09-21

## Scope

Review every active `improvements/` finding and its upstream refs. Respond only where the
no-noise rule allows a response. Out of scope: eval runs, golden edits, deploys, and Raven code.

## Lanes

| lane | agent (model, effort) | pane | write set | status |
|---|---|---|---|---|
| Orchestrator and author | Claude Fable 5.1 | none | `improvements/`, `.agents/TODO.md`, this ledger | done |
| `sd-029` gate review | Codex `gpt-5.6-sol`, high. Sol is the matched lane for dense source analysis | none (`codex exec`, stdin closed) | its own scratch directory only | done |
| `sd-029` second pass | Claude subagent on the orchestrator model. Not eligible as the gate; used as an author-side check | none | none | done |

## Ledger

- 16:25Z. `gh pr list` and `gh issue list` on `stellar-experimental/stellar-raven`: no open PR, one open issue (#167).
  #167 received a status comment earlier on 2026-09-21. No further comment. No inbound handoff issue exists.
- `rg` for GitHub issue and PR URLs under `improvements/`: 73 finding-to-ref pairs, 67 distinct refs.
  `gh api repos/<repo>/issues/<n>` for each ref, then `.../timeline` for cross-references. The table below holds the result.
- `gh pr view 2837 -R stellar/stellar-docs`: open, head `108ba24e0884f46e0c543996e4e94be754709840`, nine checks pass,
  `REVIEW_REQUIRED`, last event 2026-09-16T21:54:25Z (author-side comment). Verdict: no change, no comment.
- `gh pr view 2844 -R stellar/stellar-docs`: open, head `581b884e20f3ec7e39f9fac64539ff1922d93f6d`. One new approval on
  2026-09-19T09:18:23Z from `yocsan2112-ship-it`; the decision is still `REVIEW_REQUIRED`. Verdict: no comment.
- `gh pr view 2810 -R stellar/stellar-docs`: draft, last event 2026-09-15. `gh pr view 639 -R cloudflare/ai`: open, author
  `edenbuilds`, `REVIEW_REQUIRED`, last update 2026-08-15. `cloudflare/agents#2296`: bot label and bot assignment only.
- 16:33:42Z. `curl -sL https://developers.stellar.org/docs/data/apis/rpc/admin-guide/configuring`: HTTP 200. Counts:
  `BACKFILL` 4, `SERVE_LEDGERS_FROM_DATASTORE` 2, "Backfilling History on Startup" 4. Footer: "Last updated on Sep 14, 2026".
- Production Raven `stellarDocs.search_docs`: "RPC BACKFILL startup history" and "SERVE_LEDGERS_FROM_DATASTORE backfill"
  return `configuring#backfilling-history-on-startup` first. Bare "BACKFILL" returns six Hubble backfill pages first.
  That is a ranking matter, not a content defect.
- `npm run improvements:probes`: 7 recurring (`ll-003`, `ll-007`, `sk-005`, `sk-007`, `sk-014`, `sk-015`, `sk-022`),
  0 fixed-candidate, 0 inconclusive, 0 errors.
- `npm run improvements:lint -- --live` before edits: `improvements lint ok (61 findings, live intake checked)`.
- `sd-037` source check at `stellar/stellar-protocol` `265d64edc87627707941a31bd12798b7fdeb47d1`: root README SHA-256
  `ecb809f47f17a42046265c3df7de0f05c2357bc0e909167b0e73697b0da33a0d`, `limits/README.md` SHA-256
  `4bfd8ffeff53ec0697d77fbee8234152af869574e50c73c0832a7eeeba39d2a3`. Both equal the 2026-09-04 values. Still reproduces.
- `sls-080` monitor. Production Raven `scout.explainRepo`, repository `stellar/stellar-horizon`, the queue question.
  Returned `MaxSupportedProtocolVersion = 28`, `generatedAt` `2026-09-21T16:36:54.877Z`, `answerSource` `knowledge-note`,
  `answerAsOf` `2026-09-01T00:00:00Z`, `scannedRef` `84553bb4dc6d0c0300d052f76cb745178ede0be1`. The source at that ref and at
  `master` has `MaxSupportedProtocolVersion uint32 = 28` on line 38 of `internal/ingest/main.go`. Pass.
  Limitation: the call used the production Raven MCP server, not the local server that the queue entry names.
- `scout.searchProjects` for `aquarius` at 16:38:57Z: the description still says "AQUA locks into ICE for on-chain DAO
  governance votes directing rewards". `sls-086` still reproduces. The `sls-085` contract label was not conclusively re-run.
- `sd-029` reviews. Sol high report: [sd-029-review-sol.md](2026-09-21-improvements-followup/sd-029-review-sol.md).
  Both reviews: narrowed scope FIXED-AND-DEPLOYED; full recommendation PARTIALLY-FIXED; no source mismatch at
  `stellar-rpc` `v28.0.1`. Sol classed two residuals as verified defects: the ordinary fresh-start statement and the
  gapless local database requirement. Both classed the missing reverse links as optional.
- The orchestrator verified both source claims directly at tag `v28.0.1` (`273f19e4fcb183b568948bd2b810abfe87150a9c`):
  `service.go` lines 182-191 and `backfill.go` lines 104-109 and 264.
- Root cause of a corrected first verdict: the orchestrator first classed `sd-029` as fixed from the live page alone.
  The PR body asks to keep #2602 open, and the finding's own safety list has one item that no live page states.
  The reviews caught this before any status change or upstream post.
- After edits: `npm run improvements:index` wrote 62 findings; `npm run improvements:lint` passed.

## State table

| finding | status | upstream refs (state, last update) | ref updated since 2026-09-17 | live re-check | action |
|---|---|---|---|---|---|
| `cs-001` | reported-upstream | cloudflare/agents#2296 open (upd 2026-09-17) | yes | Not run; no maintainer reply, auto-assigned by bot | None |
| `cs-002` | reported-upstream | soroswap/docs#47 open (upd 2026-09-17) | yes | Not run; no upstream change | None |
| `ll-001` | reported-upstream | lumenloop/lumenloop-backend#21 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-002` | reported-upstream | lumenloop/lumenloop-backend#22 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-003` | reported-upstream | lumenloop/lumenloop-backend#23 open (upd 2026-07-13) | no | Probe recurring 2026-09-21 | None |
| `ll-004` | reported-upstream | lumenloop/lumenloop-backend#42 open (upd 2026-07-27) | no | Not run; no upstream change | None |
| `ll-005` | reported-upstream | lumenloop/lumenloop-backend#19 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-006` | reported-upstream | lumenloop/lumenloop-backend#18 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-007` | reported-upstream | lumenloop/lumenloop-backend#20 open (upd 2026-07-13) | no | Probe recurring 2026-09-21 | None |
| `ll-008` | reported-upstream | lumenloop/stellar-ecosystem-db#3 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-009` | reported-upstream | lumenloop/lumenloop-backend#25 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-010` | reported-upstream | lumenloop/lumenloop-backend#27 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-011` | reported-upstream | lumenloop/lumenloop-backend#24 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-012` | reported-upstream | lumenloop/lumenloop-backend#29 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-013` | reported-upstream | lumenloop/lumenloop-backend#26 open (upd 2026-09-17) | yes | Not run; our 2026-09-17 evidence comment is the last event | None |
| `ll-014` | reported-upstream | lumenloop/lumenloop-backend#30 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-015` | reported-upstream | lumenloop/lumenloop-backend#28 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-016` | reported-upstream | lumenloop/lumenloop-backend#31 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-017` | reported-upstream | lumenloop/lumenloop-backend#36 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-018` | reported-upstream | lumenloop/lumenloop-backend#34 open (upd 2026-08-11) | no | Not run; no upstream change | None |
| `ll-019` | reported-upstream | lumenloop/lumenloop-backend#35 open (upd 2026-08-19) | no | Not run; no upstream change | None |
| `ll-020` | reported-upstream | lumenloop/lumenloop-backend#32 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-022` | reported-upstream | lumenloop/lumenloop-backend#38 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-023` | reported-upstream | lumenloop/lumenloop-backend#39 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-024` | reported-upstream | lumenloop/lumenloop-backend#33 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-025` | reported-upstream | lumenloop/lumenloop-backend#37 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-026` | reported-upstream | lumenloop/lumenloop-backend#40 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-027` | reported-upstream | lumenloop/lumenloop-backend#41 open (upd 2026-07-13) | no | Not run; no upstream change | None |
| `ll-028` | reported-upstream | lumenloop/lumenloop-backend#43 open (upd 2026-08-19) | no | Not run; no upstream change | None |
| `ll-029` | reported-upstream | lumenloop/lumenloop-backend#35 open (upd 2026-08-19) | no | Not run; no upstream change | None |
| `ll-030` | reported-upstream | lumenloop/lumenloop-backend#44 open (upd 2026-09-09) | no | Not run; no upstream change | None |
| `sd-003` | reported-upstream | stellar/stellar-docs#2566 open (upd 2026-07-27); stellar/stellar-docs#2572 closed (upd 2026-07-10) | no | Not run; no upstream change | None |
| `sd-004` | declined-upstream | stellar/stellar-docs#2567 closed completed (upd 2026-07-14); stellar/stellar-docs#2572 closed (upd 2026-07-10) | no | Not run; no upstream change | None |
| `sd-005` | reported-upstream | stellar/stellar-docs#2565 open (upd 2026-07-27) | no | Not run; no upstream change | None |
| `sd-009` | declined-upstream | stellar/stellar-docs#2575 closed not_planned (upd 2026-07-14) | no | Not run; no upstream change | None |
| `sd-014` | reported-upstream | stellar/stellar-docs#2611 open (upd 2026-07-21) | no | Not run; no upstream change | None |
| `sd-027` | reported-upstream | stellar/stellar-docs#2700 open (upd 2026-08-05); stellar/stellar-docs#2367 closed (upd 2026-09-10) | no | Not run; PR #2837 unchanged at `108ba24e` since 2026-09-16 | None. Re-check on head change, merge, or close |
| `sd-029` | reported-upstream | stellar/stellar-docs#2602 open (upd 2026-08-04) | no | Live page and search re-run 2026-09-21T16:33Z: fixed and deployed | Partial fix recorded. Retire through `sd-053` after the #2602 verification comment |
| `sd-032` | reported-upstream | stellar/stellar-docs#2606 open (upd 2026-08-04); stellar/stellar-docs#2410 closed (upd 2026-07-15) | no | Not run; PR #2810 is still a draft | None. Re-check after merge and deploy |
| `sd-034` | reported-upstream | stellar/stellar-docs#2700 open (upd 2026-08-05); stellar/stellar-docs#2367 closed (upd 2026-09-10) | no | Not run; PR #2837 unchanged at `108ba24e` since 2026-09-16 | None. Keep separate from `sd-027` |
| `sd-035` | reported-upstream | stellar/stellar-docs#2609 open (upd 2026-08-04); stellar/stellar-docs#2659 closed (upd 2026-07-21) | no | Not run; no upstream change | None |
| `sd-037` | reported-upstream | stellar/stellar-protocol#1981 closed not_planned (upd 2026-09-14) | no | Source check 2026-09-21: still reproduces; both README hashes equal the 2026-09-04 values | Owner decision pending: reopen or successor. No keep-alive comment |
| `sd-046` | reported-upstream | stellar/stellar-docs#2842 open (upd 2026-09-09) | no | Not run; PR #2844 open at `581b884e`, maintainer approval pending | None. Re-check after merge and deploy |
| `sd-048` | reported-upstream | stellar/stellar-protocol#2010 open (upd 2026-09-01) | no | Not run; no upstream change | None |
| `sd-050` | reported-upstream | stellar/stellar-docs#2561 open (upd 2026-08-04) | no | Not run; no upstream change | None |
| `sd-052` | reported-upstream | stellar/stellar-cli#2722 open (upd 2026-09-09) | no | Not run; no upstream change | None |
| `sk-004` | reported-upstream | lumenloop/lumenloop-skills#1 open (upd 2026-07-07) | no | Not run; no upstream change | None |
| `sk-005` | reported-upstream | lumenloop/lumenloop-skills#2 open (upd 2026-07-09) | no | Probe recurring 2026-09-21 | None |
| `sk-007` | reported-upstream | lumenloop/lumenloop-skills#3 open (upd 2026-07-09) | no | Probe recurring 2026-09-21 | None |
| `sk-014` | reported-upstream | OpenZeppelin/openzeppelin-skills#13 open (upd 2026-08-11) | no | Probe recurring 2026-09-21 | None |
| `sk-015` | reported-upstream | OpenZeppelin/openzeppelin-skills#14 open (upd 2026-08-11) | no | Probe recurring 2026-09-21 | None |
| `sk-019` | reported-upstream | Stellar-Light/stellar-scout#13 open (upd 2026-08-19) | no | Not run; no upstream change | None |
| `sk-022` | reported-upstream | OpenZeppelin/openzeppelin-skills#14 open (upd 2026-08-11); OpenZeppelin/openzeppelin-skills#16 open (upd 2026-09-09) | no | Probe recurring 2026-09-21 | None |
| `sk-025` | reported-upstream | Trustless-Work/trustlesswork-skill#6 open (upd 2026-09-16) | no | Not run; our 2026-09-16 evidence comment is the last event | None |
| `sls-024` | reported-upstream | Stellar-Light/stellar-scout#9 closed completed (upd 2026-08-25); Stellar-Light/stellarlight#494 closed completed (upd 2026-09-08) | no | Not run; no upstream change | None |
| `sls-029` | reported-upstream | Stellar-Light/stellarlight#514 closed completed (upd 2026-07-15); Stellar-Light/stellarlight#742 closed completed (upd 2026-08-19) | no | Not run; no upstream change | None |
| `sls-033` | reported-upstream | Stellar-Light/stellarlight#519 closed completed (upd 2026-07-15); Stellar-Light/stellarlight#742 closed completed (upd 2026-08-19) | no | Not run; no upstream change | None |
| `sls-039` | declined-upstream | Stellar-Light/stellarlight#522 closed completed (upd 2026-07-14); Stellar-Light/stellarlight#530 closed (upd 2026-07-14) | no | Not run; no upstream change | None |
| `sls-085` | reported-upstream | Stellar-Light/stellarlight#1673 open (upd 2026-09-17) | yes | Not run; no upstream change | None |
| `sls-086` | reported-upstream | Stellar-Light/stellarlight#1674 open (upd 2026-09-17) | yes | `scout.searchProjects` 2026-09-21T16:38:57Z: description unchanged, still reproduces | None. Untouched issue stays quiet |
| `wai-001` | reported-upstream | cloudflare/ai#634 open (upd 2026-08-15); cloudflare/ai#639 open (upd 2026-08-15) | no | Not run; PR #639 unchanged since 2026-08-15, review required, author `edenbuilds` | None |
| `sd-053` | reported-upstream | stellar/stellar-docs#2602 open (upd 2026-08-04) | no | Live page and `v28.0.1` source read 2026-09-21: reproduces | New successor of `sd-029` |

## Draft verification comment for stellar/stellar-docs#2602

Not posted. Post it once, after the branch with `sd-053` is on `main`, so that the source link resolves.
Replace `<commit>` with that commit. Read the comment back from GitHub before recording its URL.

> Verification result for the merged half, checked on 2026-09-21.
>
> PR #2789 is live. The configuring page now has "Backfilling History on Startup". It states the flag, v25.1.0, the
> default, the synchronous order, the retention target, the coverage limits, and the serve-flag error. The sample config
> has both flags. Each claim matches `options.go` at `stellar-rpc` `v28.0.1`. Our original finding for that half is closed.
>
> Two statements remain for the RPC-team half, both verified at `v28.0.1`:
>
> - `ingest/service.go` lines 182-191: with an empty database, RPC starts at the current History Archive tip. A larger
>   `HISTORY_RETENTION_WINDOW` alone restores no older rows.
> - `ingest/backfill.go` lines 104-109 and 264: backfill requires a local database with no ledger-sequence gaps. A gap stops
>   startup with `db verify: gap detected in local DB`.
>
> Source record: https://github.com/stellar-experimental/stellar-raven/blob/<commit>/improvements/stellar-docs/sd-053-rpc-backfill-fresh-start-and-gap-check.md

## Outcome

- Upstream comments posted in this round: none. No ref had maintainer activity that needed a reply.
- `sd-029`: partial fix recorded with dated evidence; status stays `reported-upstream` until the resolver gates complete.
- `sd-053`: new successor finding for the two verified residuals, tracked by the open issue #2602.
- `improvements/intake.json`: stale `sd-029` reason corrected; `sd-053` override added.
- `.agents/TODO.md`: PR #2837 re-check recorded; `sd-037` source check recorded; new entry for the `sd-029` retirement
  and the golden caution update.
- Remaining risk: the work is uncommitted on branch `chore/improvements-followup-2026-09-21`. The #2602 comment, the
  resolver run, and the golden caution update depend on a merge to `main`.
- Owner decision still open: `sd-037` (reopen #1981 or file a successor).

## Closeout — 2026-09-21, after owner approval to commit, merge, and deploy

- PR #175 merged as `c53d6f7c`. PR #176 merged as `302399f780b7bea83d057c3d00401efc9e0efdb8`. It set `sd-029` to
  `fixed-upstream` and landed the golden caution update for `q-ti-self-host-retention-backfill`.
  `npm run eval:qa:compile` changed exactly one case. `npm run eval:qa:lint -- --since origin/main`: 0 errors.
  Cluster-018 reopened on the hash change and was re-swept as consistent through `--review`.
- One upstream comment posted and read back: https://github.com/stellar/stellar-docs/issues/2602#issuecomment-5764382567
  (author `kalepail`, 2026-09-21T17:04:28Z). It carries the live result, the immutable `sd-029` snapshot, and the two
  `sd-053` statements with source links. The draft above is superseded by that posted text.
- `npm run improvements:resolve` retired `sd-029` with source commit `302399f7`. The receipt title was set by hand to
  the original finding sentence, because the generator read the dated state note.
- References reconciled: the intake override is removed, `INDEX.md` is regenerated, and the golden case keeps its
  `rootCause` path by the `sd-023` and `sd-028` precedent. Dated audits and round ledgers stay as history.
- `sd-037` decision: no reopen of stellar-protocol #1981. The reason is in `.agents/TODO.md`.
