# Golden-truth session 3 — 2026-08-29

## Scope

Block 1 from `.agents/NEXT.md`, with block 2 (dead provenance) folded into every touched case.
Branch `codex/golden-truth-session-3`, base `b933ddc` (`origin/main`). Worktree
`~/.herdr/worktrees/stellar-raven-codemode/codex-golden-truth-session-3`.

In scope:

1. Stellar strkey CRC16 validation on golden import (`eval/qa/compile-qa.mjs`), with positive and
   negative tests for account (`G`) and contract (`C`) keys.
2. Clear all 372 long-fact warnings across 204 cases (form-only rewrites; every claim kept).
3. Sourcing-guard audit: 20 of 46 cases (eight targeted shapes, twelve seeded-random).
4. Classify all 56 corroboration warnings before any edit.
5. Reconcile the five canonical-page conflict cases; re-derive the Protocol 27 snapshot fact
   separately.
6. Dead-provenance repair on every touched case (no bulk edit).
7. Record every affected case id for the next same-100 rerun.
8. Regenerate `cases.json` / `sample.json`, re-stamp the consistency register, update TODO and
   NEXT.

Out of scope: the two dated source-metadata conflicts (`q-tool-soroban-auth-audit-live`,
`q-protocol-ledger-close-time`) unless a lane touches them (neither carries a long-fact warning);
untouched dead-provenance files (recorded as a remainder); paid Lumenloop research; deployment.

## Baseline (2026-08-29, `b933ddc`)

`node eval/qa/lint-corpus.mjs` → `0 error(s), 475 warning(s)`.

| class | warnings | cases |
| --- | --- | --- |
| `[key-fact]` exceeds 90 characters | 372 | 204 |
| `[avoid]` sourcing-guard | 47 | 46 (`q-eco-pyusd-stellar-freshness` carries two) |
| `[corroboration]` possible negative claim | 56 | 56 |

Overlaps: long ∩ sourcing-guard 20; long ∩ corroboration 34; long ∩ dead-provenance 43 of 94;
long ∩ canonical-five 0; dead ∩ canonical 2 (`q-infra-horizon-vs-rpc`,
`q-ti-freighter-localhost-not-detected`). Union of every candidate case: 299.

Dead-provenance refs (94 files): 69 → the expired Fable report `conversions-copy-review.md`
(unrecoverable), 27 → `/tmp/raven-qadeep/gt2/review-b{4,5}-part{1,2,3}.md` (summaries preserved
in `program-log.md`), 1 → `/tmp/raven-qadeep/review-judge.md` (durable copy
`research/qa-deep-dive-2026-08-25/review-judge.md`).

Corpus strkeys at baseline: 21 unique `G`/`C` strkeys across 11 case files.

## Plan

### Phases

- **P0 — setup.** Ledger, helper pack, panes, agents. Helper pack lives in the session
  scratchpad (`…/scratchpad/gt3/pack/`); durable outputs live in this directory.
- **P1 — strkey + long-fact.** Worker A implements strkey validation first (one prompt), then
  joins the long-fact loop. Workers B and C start the long-fact loop at once. 51 chunks of four
  cases (`chunk-00` … `chunk-50`, sorted ids), chunk `NN` owned by worker `a|b|c` where
  `NN mod 3 = 0|1|2`. One prompt per chunk. Workers append an evidence matrix to their own
  matrix file under `2026-08-29-golden-truth-session-3/` before editing any case.
- **P1-review.** Grok reviews in three parts by chunk set: part 1 = chunks 00–16, part 2 =
  17–33, part 3 = 34–50. Each part checks every claim of every case (kept / moved to avoid /
  dropped / added), from the diff and the matrix file. While waiting for part 1, Grok runs two
  blind lanes: (i) independent classification of all 56 corroboration warnings from HEAD content;
  (ii) blind re-derivation of the five canonical-page facts and the Protocol 27 snapshot fact
  from live sources, without proposer notes.
- **P2 — audits and canonical.** After P1 closes: Sol classification of the 56 corroboration
  warnings (independent of Grok's); sourcing-guard audit of the 20 selected cases; canonical
  five-case reconciliation. Disagreements between the Sol and Grok classifications are resolved
  by a targeted follow-up probe, never by averaging.
- **P2-review.** Grok receives the complete diff against `origin/main` plus the requirements and
  returns a final verdict. Every actionable finding is reconciled and recorded here.
- **P3 — close.** Regenerate artifacts, reconcile the register, gates, TODO/NEXT, commit, push,
  PR.

### Lane contracts (all workers)

- Write set: only `eval/qa/corpus/battery/<category>/<id>.json` for ids named in the prompt, and
  the worker's own matrix file. Worker A's strkey prompt additionally owns
  `eval/qa/strkey.mjs`, `eval/qa/compile-qa.mjs`, and `test/qa-strkey.test.mjs`.
- No `git` commands, no `eval:qa:compile`, no `eval:qa:register`; only the read-only
  `node eval/qa/lint-corpus.mjs` to confirm a case's warnings are gone.
- Every keyFact rewrite keeps every claim: `Claims kept`, `Moved to avoid`, or `None dropped` is
  mandatory per case. No new numbers, versions, dates, abbreviations, or taxonomy distinctions.
- Every rewritten fact gets one dated live re-check against a primary source (class A/B/F) with a
  URL. A live contradiction stops the edit and is reported as `CONFLICT`.
- `truth.verified` is refreshed on every gospel change (date, by, appended evidence, rootCause).
- Dead-provenance lines are repaired only on touched cases, by the rule in `rules.md`.
- Report contract: chunk report file path only; the matrix file holds the evidence.

### Sourcing-guard audit selection (recorded before review)

Eight targeted shapes:

| shape | case |
| --- | --- |
| `[not-verified]` only | `q-asset-rwa-tokenized-freshness` |
| `[without-evidence,not-verified]` | `q-aas-trusted-asset-list-whitelist` |
| `[un-prefixed]` | `q-org-sdf-enterprise-fund` |
| `[un-prefixed]` with a parenthetical tail | `q-scf-history-soroswap` |
| `[lacks-support]` | `q-tool-go-sdk-ingest` |
| non-`Do NOT` form, "Calls …" | `q-defi-oracle-landscape-live` |
| non-`Do NOT` form, "Pins the archived …" | `q-scf-kale-winner-live` |
| two warnings on one case | `q-eco-pyusd-stellar-freshness` |

Twelve seeded-random cases. Seed `gt3-sg-audit-2026-08-29`; method: over the 38 remaining
sourcing-guard cases sorted by id, rank by `sha256(seed + ":" + id)` ascending, take the first 12:

`q-builder-content-by-person`, `q-comp-yieldblox-oracle-incident`,
`q-crp-custodial-vs-noncustodial-wallets`, `q-crp-oz-rwa-erc3643-trex`,
`q-defi-allbridge-what-is`, `q-defi-liquid-staking-whitespace`, `q-defi-market-making-kelp`,
`q-edge-fresh-latest-protocol-version`, `q-hist-yieldblox-v2-2026-exploit`,
`q-jutsu-cash-crypto-ramps`, `q-ti-scaffold-stellar`, `q-tool-cctp-stellar-integration`.

Audit dispositions: `keep-advisory` (the avoid item is a concrete answer-visible sourcing guard
and the warning is useful), `reword` (gospel edit through golden-truth), `demote-to-notes` (the
item punishes a possibly-true claim). Zero warnings is not the target.

### Corroboration classification

Each of the 56 warnings gets one class before any edit: `grammar-only` (the negative word is a
restriction or a modifier, not a factual negative claim → no fabricated row), or
`negative-claim` (a real "X is not / no X" claim → needs a corroboration row at the golden-truth
bar: absence from primary records plus an explicit web sweep, phrased as-of and source-relative).
Two independent models classify (Sol and Grok); every disagreement is resolved by a targeted
probe.

### Canonical-page cases

Per `.agents/TODO.md` "Repair the reviewed canonical-page conflict cases". The three-case caution
boundary (ADR-0008) is kept: cautions in lint-canonical form only on
`q-protocol-base-reserve-min-balance` (sd-043), `q-ti-rpc-gettransactions-pagination-xdr`
(sd-004, `declined-upstream` → durable), and `q-ti-freighter-localhost-not-detected` (sd-045).
`q-infra-horizon-vs-rpc` repairs the disputed corroboration row and swaps `sd-017` for `sd-042`.
`q-pc-protocol-27-zipper` re-derives the July 11 snapshot fact separately (Grok blind lane).

### Gates per commit

`npm run eval:qa:compile` → `npm run eval:qa:register` → `npm run eval:qa:lint -- --since
origin/main --stale` → `npm run typecheck` → `npm test` → `npm run build` →
`npm run secrets:scan -- --tree`. Parsed-JSON diff proves only intended cases changed. Plan-grade
check against `eval/qa/results/2026-08-28T19-27-08-variantA.json` (local-only artifact in the main
checkout) if the grader can read it without writing there.

## Lanes

| lane | agent (model, effort) | pane | write set | status |
| --- | --- | --- | --- | --- |
| Orchestration | Claude Fable 5, high (`gt3-orch`) | `w1B:p1` | this ledger, TODO, NEXT, generated artifacts, commits, PR | completed |
| A — strkey, then long-fact chunks `NN mod 3 = 0` | Codex `gpt-5.6-sol`, `model_reasoning_effort=high` (`gt3-sol-a`) | `w1B:p2` | strkey files; owned cases; `matrices-sol-a.md` | completed (17 chunks, conflict lane, corroboration rows, second-class subset) |
| B — long-fact chunks `NN mod 3 = 1` | Codex `gpt-5.6-sol`, high (`gt3-sol-b`) | `w1B:p3` | owned cases; `matrices-sol-b.md` | completed (17 chunks, classification, sourcing-guard audit + rewords, register re-sweep, second-class subset) |
| C — long-fact chunks `NN mod 3 = 2` | Codex `gpt-5.6-sol`, high (`gt3-sol-c`) | `w1B:p4` | owned cases; `matrices-sol-c.md` | completed (17 chunks, canonical five, targeted probes + dispositions, second-class subset) |
| R — independent adversarial review + blind lanes | Grok `grok-4.6`, `--reasoning-effort high` (`gt3-grok-rev`) | `w1B:p5` | review files under `2026-08-29-golden-truth-session-3/review-*.md` only | completed: R1–R4 blind lanes, three part reviews, final review, two explicit re-checks; final verdict APPROVE |

Route cards:

- Lanes A–C. Worker CLI: Codex. Model: GPT-5.6 Sol. Effort: high. Reason: dense case authoring
  with verification and acting on gathered evidence; failure cost is gospel corruption, so a
  different-family reviewer gates it. Verified: `~/.codex/config.toml` pins `gpt-5.6-sol` /
  `high`; `research/agent-model-roster.md` lists Sol efforts low–ultra. Fallback: Fable 5 high,
  then Opus 5 high. Reviewer: Grok 4.6.
- Lane R. Worker CLI: Grok. Model: grok-4.6. Effort: high. Reason: vendor-diverse assumption
  attack, independent re-derivation of high-stakes facts; differs from authors (Sol) and the
  orchestrator (Fable). Verified: `grok models` lists `grok-4.6 (default)`. Fallback: Opus 5
  high. Reviewer: none (it is the reviewer).

## Ledger

- `2026-08-29` — `HERDR_ENV=1` confirmed in `w1B:p1`. Baseline lint captured (475 warnings).
  Chunk files built (51), seeded sourcing-guard sample recorded above before any review.
- `2026-08-29T07:41Z` — Four panes split down from `w1B:p1` with `herdr pane split --current
  --direction down --cwd "$PWD" --no-focus`: `w1B:p2` (sol-a), `w1B:p3` (sol-b), `w1B:p4` (sol-c),
  `w1B:p5` (grok-rev). All four are owned by this session.
- `2026-08-29T07:43Z` — First `herdr agent start … --kind codex -- -m gpt-5.6-sol -c
  'model_reasoning_effort="high"' -c 'sandbox_workspace_write.network_access=true' -a never -s
  workspace-write` returned idle, but Codex self-updated to `codex-cli 0.151.0` and exited
  ("Please restart Codex"); the first prompts hit `agent_not_found`. Restarted all three in the
  same panes at 07:44Z; `herdr agent list` shows `gt3-sol-a/b/c` and `gt3-grok-rev` working.
  Grok start: `-- --model grok-4.6 --reasoning-effort high --always-approve`.
- `2026-08-29T07:44Z` — Drivers launched: sol-a → strkey brief then chunks `NN mod 3 = 0`;
  sol-b → `NN mod 3 = 1`; sol-c → `NN mod 3 = 2`; one `herdr agent prompt --wait` per chunk.
  Grok → blind lanes R2 (canonical re-derivation) then R1 (corroboration classification).
- `2026-08-29T11:50Z` — Grok blind lane R2 landed:
  `2026-08-29-golden-truth-session-3/review-canonical-rederivation-grok.md` (30 KB, URL log
  included). Verdicts: base reserve 5,000,000 stroops confirmed at ledger 64178140; Core
  `getMinBalance` excludes selling liabilities (Docs sponsored-reserves wording conflicts →
  disputed, matches sd-043); Horizon lifecycle wording "nearing end-of-life and will eventually be
  deprecated", no sunset date on any page; RPC 200/10000 limits are config defaults in source while
  Docs say "hardcoded" (matches sd-004); Freighter manifest `<all_urls>` at `document_start`,
  `all_frames` absent; Protocol 27 vote 2026-07-08 confirmed, official software table labels
  Mainnet "July 8, 2026", **"July 11, 2026" is contradicted as an official activation date** (it is
  only a check date). Disposition for `q-pc-protocol-27-zipper`: the keyFact must carry the
  official July 8 date and the July 11 check moves to evidence/answer as an observation.
- `2026-08-29T07:51Z` — Lane A strkey report (`pack/reports/strkey.md`). Files: `eval/qa/strkey.mjs`
  (new; base32 canonical decode, CRC16-XModem, SEP-23 version bytes and payload lengths),
  `eval/qa/compile-qa.mjs` (`validateCase` fails on the first invalid strkey with path, token, and
  reason; exported `validateCaseFile`; guarded `main()`), `test/qa-strkey.test.mjs` (8 tests: valid
  G/C incl. SEP-23 vectors; G and C transcription, wrong-length, non-alphabet, changed and unknown
  version byte; two SEP-23 invalid strings; candidate discovery; JSON path; compiler rejection in
  `$.golden.answer`). Worker output: `npx vitest run test/qa-strkey.test.mjs` → 8 passed;
  `npm run eval:qa:compile` → 500 cases, sha256 `fda6d082…` (unchanged content);
  `npm run typecheck` clean; `npm test` → 91 files, 1383 passed. Orchestrator re-ran the strkey
  test file: 8 passed. No current-corpus strkey failed. Worker A moved to chunk-00.
- `2026-08-29T07:53Z` — First long-fact chunks (01, 02) came back UNREACHED: the Codex
  workspace-write sandbox returns EPERM for writes under `.agents/` (both `apply_patch` and a
  direct append), so no case was edited (rule: matrix before edit). Fix: matrices now live in the
  scratchpad pack (`pack/matrices/matrices-sol-{a,b,c}.md`); the orchestrator mirrors them into
  this directory before each commit. Rule change: a `CONFLICT` on one fact no longer blocks the
  other facts of the case. All three workers interrupted (`herdr agent send-keys … esc`) and the
  drivers restarted from chunks 00/01/02. Grok lane untouched.
- `2026-08-29T07:53Z` — Conflict queue (worker sol-c, chunk-02): `q-anchor-sdp-vs-anchor-platform`
  keyFact "Wallet SDK … (SEP-10/12/24/31/38)" vs current official Wallet SDK sources, which omit
  SEP-31 from the supported list; sibling `q-asset-wallet-sdk-seps` carries the same claim. To be
  resolved through golden-truth in P2.
- `2026-08-29T07:54Z` — Grok blind lane R1 landed:
  `2026-08-29-golden-truth-session-3/review-corroboration-classification-grok.md`. All 56
  classified: 18 `grammar-only` (no-edit), 27 `negative-claim`, 11 `mixed` (row only for the listed
  sentences). Sol's independent classification runs in P2; disagreements go to a targeted probe.
- `2026-08-29T07:56Z` — chunk-01 (sol-b) verified by the orchestrator: four cases DONE
  (`q-aas-trustline-limit-lifecycle`, `q-anchor-endpoint-discovery`,
  `q-anchor-list-builders-discovery`, `q-anchor-moneygram-ramps`), matrix complete with live
  re-check URLs, one dead-provenance line replaced; `node eval/qa/lint-corpus.mjs --since
  origin/main` → `0 error(s), 469 warning(s)`. Driver sent chunk-04 to sol-b. Grok is on lane R3
  (independent sourcing-guard audit); its R1/R2 reports are preserved in this directory.
- `2026-08-29T07:59Z` — chunk-02 (sol-c) verified: `q-anchor-platform-what`,
  `q-ass-cross-bando-stablebonds-sac`, `q-asset-claimable-balance` DONE;
  `q-anchor-sdp-vs-anchor-platform` CONFLICT on the Wallet SDK SEP-31 fact (other facts rewritten;
  that fact left long). Lint `--since origin/main` → `0 error(s), 461 warning(s)`. Driver sent
  chunk-05 to sol-c.
- `2026-08-29T08:03Z` — Grok lane R3 landed: `review-sourcing-guard-grok.md`. 20 cases / 21 items:
  18 keep-advisory, 3 reword (`q-defi-oracle-landscape-live` "permanently most established";
  `q-tool-go-sdk-ingest` regex false positive on "lacks ingestion support";
  `q-defi-market-making-kelp` "without dated repository evidence" lets a cited-but-false
  "actively maintained" through). Random 12: 11 clean, 1 reword. No demote-to-notes, no
  judge-blind items. Recommendation: keep the class advisory; remove only demonstrated cruft.
  Sol's independent audit runs in P2; the three rewords are candidates, not decisions.
- `2026-08-29T08:05Z` — chunk-00 (sol-a) verified: four cases DONE
  (`q-aas-claim-received-claimable-balances`, `q-aas-list-token-on-exchanges-aggregators`,
  `q-aas-sep30-recoverable-wallets`, `q-aas-trusted-asset-list-whitelist`), no conflict; lint
  `--since origin/main` → `0 error(s), 451 warning(s)`. Driver sent chunk-03 to sol-a. Grok
  finishes the short R4 SEP-31 probe (already dispatched), then stays idle until review part 1
  (chunks 00–16) is ready.
- `2026-08-29T08:02Z` — chunk-04 (sol-b) verified: `q-asset-trustline-basics`,
  `q-asset-usdc-eurc-path-fx` DONE; two CONFLICTs queued for P2 golden-truth:
  `q-asset-two-account-issuer` ("issuing account holds/creates supply" vs
  https://developers.stellar.org/docs/tokens/control-asset-access — an issuer cannot hold a
  balance of its own asset) and `q-asset-wallet-sdk-seps` (SEP-31 not in the live
  `stellar/typescript-wallet-sdk` tree; joins the SEP-31 queue with Grok lane R4). Lint
  `--since origin/main` → `0 error(s), 446 warning(s)`. Driver sent chunk-07 to sol-b.
- `2026-08-29T08:06Z` — chunk-05 (sol-c) verified: four DONE (`q-builder-by-region-latam`,
  `q-builder-content-by-person`, `q-builder-lumenloop-regions-vocab`,
  `q-comp-auth-flags-overview`), two dead-provenance lines replaced; worker noted the live Scout
  Latin America total is 20 on 2026-08-29 while the answer keeps its dated 2026-07-11 total of 19
  (no change; dated observation). Lint `--since origin/main` → `0 error(s), 439 warning(s)`.
  Driver sent chunk-08 to sol-c. Grok R4 still working.
- `2026-08-29T08:09Z` — Grok lane R4 landed: `review-conflict-wallet-sdk-sep31-grok.md`. Verdict:
  "Wallet SDK wraps SEP-31" is **contradicted** for `@stellar/typescript-wallet-sdk` (class A
  docs supported-SEP list omits SEP-31; class B source tree and reachable history never carried a
  Sep31 class — only a SEP-38 `context=sep31` string and a SEP-12 test customer type; Kotlin/
  Swift/Flutter variants also omit it; SEP-31 is sending-anchor → receiving-anchor by design).
  Independent of the Sol workers' own class-B probes (chunk-02, chunk-04), so the two-class bar is
  met. P2 gospel change queued for `q-anchor-sdp-vs-anchor-platform`, `q-asset-wallet-sdk-seps`
  (retag its `confirmed` corroboration row; add the false wrap to avoid), and sibling
  `q-sep-wallet-seps-list` (answer sentence). Grok now idle until review part 1.
- `2026-08-29T08:10Z` — chunk-03 (sol-a) verified: `q-asset-path-payment-ops`,
  `q-asset-rwa-tokenized-freshness` (1 dead line replaced), `q-asset-stablecoin-issuers-discovery`
  DONE; `q-asset-deploy-sac-cli` CONFLICT queued: the keyFact names `CONTRACT_ID_FROM_ASSET`
  while the live XDR/source uses `CONTRACT_ID_PREIMAGE_FROM_ASSET` (identifier transcription in
  gospel; P2 golden-truth fix with sibling sweep). Lint `--since origin/main` → `0 error(s),
  423 warning(s)`. Driver sent chunk-06 to sol-a.
- `2026-08-29T08:10Z` — chunk-07 (sol-b) verified: `q-crp-become-an-anchor-licensing`,
  `q-crp-custodial-vs-noncustodial-wallets`, `q-crp-export-tx-history-taxes` DONE (one dead line
  replaced each); `q-comp-security-disclosure-programs` CONFLICT queued: the live SDF HackerOne
  profile no longer shows the recorded intake pause (freshness drift on a volatile fact; P2
  golden-truth re-verification with as-of). Lint `--since origin/main` → `0 error(s), 423
  warning(s)`. Driver sent chunk-10 to sol-b.
- `2026-08-29T08:15Z` — chunk-08 (sol-c) verified: four DONE (`q-crp-regional-offramp-mobilemoney`,
  `q-crp-remittance-founder-advisory`, `q-crp-tokenize-personal-rwa`,
  `q-defi-agent-identity-stellar-experimental`), no conflict. Lint `--since origin/main` →
  `0 error(s), 401 warning(s)`. Driver sent chunk-11 to sol-c.
- `2026-08-29T08:16Z` — chunk-10 (sol-b) verified: `q-defi-comet-what-is`,
  `q-defi-cross-blend-rivool-sac`, `q-defi-defindex-honest` DONE;
  `q-defi-category-funding-ratio-live` CONFLICT queued: the live Scout schema exposes
  `scfFundedCount`, not the golden's `fundedCount` (field-name transcription; P2 golden-truth
  fix against the live schema and the manifest). Lint `--since origin/main` → `0 error(s),
  394 warning(s)`. Driver sent chunk-13 to sol-b.
- `2026-08-29T08:17Z` — chunk-06 (sol-a) verified: four DONE (`q-comp-clawback-cap0035`,
  `q-comp-clawback-holder-risk`, `q-comp-cross-bitso-sep31`,
  `q-comp-cross-moneygram-partnership-sep24`), no conflict. Lint `--since origin/main` →
  `0 error(s), 394 warning(s)` (measured with chunk-10 already landed). Driver sent chunk-09 to
  sol-a.
- `2026-08-29T08:21Z` — chunk-11 (sol-c) verified: four DONE (`q-defi-market-making-kelp`,
  `q-defi-named-newer-protocols`, `q-defi-skill-ecosystem-scout`,
  `q-defi-tooling-whitespace-live`), no conflict. Lint `--since origin/main` → `0 error(s),
  387 warning(s)`. Driver sent chunk-14 to sol-c.
- `2026-08-29T08:23Z` — chunk-13 (sol-b) verified: four DONE (`q-eco-nft-marketplace-whitespace`,
  `q-eco-pyusd-stellar-freshness`, `q-eco-stablecoins-on-stellar`, `q-eco-stellar-wallets-list`;
  two dead lines replaced), no conflict. Lint `--since origin/main` → `0 error(s), 382
  warning(s)`. Driver sent chunk-16 to sol-b.
- `2026-08-29T08:25Z` — chunk-14 (sol-c) verified: four DONE
  (`q-edge-closed-world-builder-directory-miss`, `q-edge-deep-full-history-report`,
  `q-edge-exhaustive-defi-deep-report`, `q-edge-fresh-latest-blend-tvl`), no conflict. Lint
  `--since origin/main` → `0 error(s), 367 warning(s)`. Driver sent chunk-17 to sol-c.
- `2026-08-29T08:26Z` — chunk-09 (sol-a) verified: four DONE
  (`q-defi-agentic-payment-standards-compare`, `q-defi-benji-franklin-templeton`,
  `q-defi-bridge-evm-to-stellar-axelar`, `q-defi-build-staking-for-own-token`; two dead lines
  replaced), no conflict. Lint `--since origin/main` → `0 error(s), 367 warning(s)` (measured
  after chunk-14). Driver sent chunk-12 to sol-a.
- `2026-08-29T08:29Z` — chunk-16 (sol-b) verified: four DONE (`q-edge-noinfo-exact-tvl-figure`,
  `q-edge-noinfo-stellar-native-privacy-default`, `q-edge-noinfo-stellar-pos-staking-rewards`,
  `q-edge-oos-bitcoin-price-prediction`; two dead lines replaced; DefiLlama definitions page 403,
  adapter source used instead), no conflict. Lint `--since origin/main` → `0 error(s), 361
  warning(s)`. Driver sent chunk-19 to sol-b. Part 1 now waits only on chunks 12 and 15 (sol-a).
- `2026-08-29T08:31Z` — chunk-17 (sol-c) verified: four DONE (`q-edge-oos-solana-vs-aptos`,
  `q-edge-retail-everyday-use-eli5`, `q-edge-xlm-price-investment-advice`,
  `q-gap-explainrepo-payload-ok`), no conflict. Lint `--since origin/main` → `0 error(s), 353
  warning(s)`. Driver sent chunk-20 to sol-c.
- `2026-08-29T08:32Z` — chunk-12 (sol-a) verified: four DONE (`q-defi-x402-on-stellar-what`,
  `q-eco-defi-projects-discovery`, `q-eco-hana-wallet-scf`, `q-eco-most-active-defi-projects`;
  two dead lines replaced), no conflict. Lint `--since origin/main` → `0 error(s), 351
  warning(s)`. Driver sent chunk-15 to sol-a; part 1 then closes.
- `2026-08-29T08:34Z` — chunk-19 (sol-b) verified: four DONE (`q-hist-scp-rewrite-2015`,
  `q-hot-sdf-xlm-holdings-sales`, `q-infra-rpc-provider-archive-tier`,
  `q-infra-simulate-transaction-howto`; one dead line replaced), no conflict; worker notes the
  official RPC provider table still disagrees with Validation Cloud's own docs (existing case
  dispute, unchanged). Lint `--since origin/main` → `0 error(s), 345 warning(s)`. Driver sent
  chunk-22 to sol-b.
- `2026-08-29T08:36Z` — chunk-20 (sol-c) verified: four DONE (`q-infra-testnet-vs-futurenet`,
  `q-infra-which-indexer`, `q-n3-generate-secret-key-refusal`,
  `q-n3-issues-842-backup-faucet-wallet`), no conflict. Lint `--since origin/main` →
  `0 error(s), 338 warning(s)`. Driver sent chunk-23 to sol-c.
- `2026-08-29T08:40Z` — chunk-15 (sol-a) verified: four DONE (`q-edge-fresh-latest-protocol-version`,
  `q-edge-inject-ignore-instructions`, `q-edge-lumenloop-person-entity-empty`,
  `q-edge-metamask-evm-mental-model`; one dead line replaced), no conflict. Lint `--since
  origin/main` → `0 error(s), 331 warning(s)`. Driver sent chunk-18 to sol-a. **Part 1 closed
  (chunks 00–16, 68 cases).** Grok review part 1 prompted at 08:40Z with `pack/review-part-1.md`
  (claim-by-claim check from the diff first, matrices second; report
  `review-long-part-1.md`); Sol lanes continue during review.
- `2026-08-29T08:42Z` — chunk-23 (sol-c) verified: four DONE (`q-pay-sdp-disbursement`,
  `q-pc-account-activation-not-found`, `q-pc-bucketlist-vs-merkle-inclusion-proof`,
  `q-pc-cross-redstone-sep40`), no conflict. Lint `--since origin/main` → `0 error(s), 314
  warning(s)`. Driver sent chunk-26 to sol-c.
- `2026-08-29T08:43Z` — chunk-22 (sol-b) verified: four DONE (`q-n3-ssrf-metadata-endpoint`,
  `q-n3-wallet-hacked-support-redirect`, `q-n3-xlm-personal-investment-advice`,
  `q-passkey-smart-account-architecture`), no conflict; worker notes the original Stellar
  passkeys docs URL is broken and current primary pages re-verified every claim (source-URL
  freshness to check in P2 for that case). Lint `--since origin/main` → `0 error(s), 314
  warning(s)` (measured with chunk-23). Driver sent chunk-25 to sol-b.
- `2026-08-29T08:46Z` — chunk-18 (sol-a) verified: four DONE (`q-gap-match-partners-degrade`,
  `q-gap-rpc-horizon-unindexed-reference`, `q-gap-scout-list-skill-directory`,
  `q-hist-meridian-2026-corrected-venue`), no conflict. Lint `--since origin/main` →
  `0 error(s), 309 warning(s)`. Driver sent chunk-21 to sol-a.
- `2026-08-29T08:52Z` — **Grok review part 1** (`review-long-part-1.md`, chunks 00–16, 68 cases):
  `APPROVE-WITH-FIXES`, 62 PASS / 6 FAIL. Findings and reconciliation (owner fixes; no worker owned
  these cases at the time):
  1. `q-aas-list-token-on-exchanges-aggregators` — two `Requires` facts made a disjunctive claim
     conjunctive → replaced [2]+[3] with the reviewer's single disjunctive fact (81 chars).
  2. `q-asset-deploy-sac-cli` — reviewer saw 404 on the CLI guide URL; the orchestrator got 200
     on 2026-08-29 (`curl -L`), so the URL stays; cookbook URL added as extra evidence; the
     `CONTRACT_ID_FROM_ASSET` conflict remains queued (correct per rules).
  3. `q-asset-path-payment-ops` — added abbreviation `SDEX` → replaced with the reviewer's
     `DEX order book, AMM pools, or both`; encyclopedia URLs resolved 200 for the orchestrator.
  4. `q-asset-two-account-issuer` — CONFLICT case left unstamped (no judge-facing change, so the
     gospel lint does not require a stamp); deferred to its P2 conflict-resolution edit, which
     will stamp `truth.verified` and copy the matrix CONFLICT line.
  5. `q-comp-cross-bitso-sep31` — presentation-shaped fact [4] moved to `golden.avoid` as the
     reviewer's concrete trap.
  6. `q-crp-become-an-anchor-licensing` — dropped "rather than assuming one anchor license"
     tail restored as a `golden.avoid` trap (the reviewer's keyFact replacement would itself have
     dropped custody/route/asset/jurisdiction, so the owner kept [3] and used avoid instead).
  Each fixed case carries an "Owner fix after independent review 2026-08-29" evidence line.
- `2026-08-29T08:53Z` — chunk-25 (sol-b) verified: four DONE (`q-pc-protocol-upgrade-timing`,
  `q-pc-quantum-preparedness-dormant`, `q-pc-sponsored-reserves`,
  `q-pc-surge-griefing-threat-model`; one dead line replaced), no conflict; worker notes the live
  CAP tree through cap-0088 still has no dormant-account eligibility definition (consistent with
  the case). Driver sent chunk-28 to sol-b.
- `2026-08-29T08:53Z` — chunk-26 (sol-c) verified: four DONE (`q-production-anchor-architecture`,
  `q-protocol-19-preconditions-cap-0021`, `q-protocol-27-cap-0071`, `q-protocol-amm-cap-0038`),
  no conflict. Lint `--since origin/main` after the part-1 owner fixes → `0 error(s), 293
  warning(s)`. Driver sent chunk-29 to sol-c. Grok idle until part 2 (chunks 17–33).
- `2026-08-29T08:55Z` — chunk-21 (sol-a) verified: four DONE (`q-n3-missing-funds-account-support`,
  `q-n3-paid-research-budget-bypass`, `q-n3-pi-network-wrong-chain`, `q-n3-ssrf-localhost-probe`),
  no conflict. Lint `--since origin/main` → `0 error(s), 285 warning(s)`. Driver sent chunk-24
  to sol-a.
- `2026-08-29T08:54Z` — chunk-28 (sol-b) verified: four DONE (`q-protocol-operation-types-list`,
  `q-protocol-parallel-execution`, `q-protocol-quorum-slice-vs-quorum`,
  `q-protocol-scp-consensus-algorithm`), no conflict. Lint `--since origin/main` → `0 error(s),
  278 warning(s)`. Driver sent chunk-31 to sol-b.
- `2026-08-29T08:57Z` — chunk-29 (sol-c) verified: four DONE (`q-protocol-validator-node-roles`,
  `q-protocol-validator-upgrade-vote`, `q-protocol-version-history-list`,
  `q-rwa-projects-tokenizing-stellar`), no conflict. Lint `--since origin/main` → `0 error(s),
  265 warning(s)`. Driver sent chunk-32 to sol-c.
- `2026-08-29T08:58Z` — chunk-24 (sol-a) verified: four DONE (`q-pc-fee-bump-channel-accounts-feepool`,
  `q-pc-l2-payment-channels-starlight`, `q-pc-memos-reference`, `q-pc-protocol-26-yardstick`; one
  dead line replaced), no conflict. Lint `--since origin/main` → `0 error(s), 265 warning(s)`
  (measured with chunk-29). Driver sent chunk-27 to sol-a.
- `2026-08-29T09:01Z` — chunk-32 (sol-c) verified: four DONE (`q-scf-funding-by-category`,
  `q-scf-hackathons-active`, `q-scf-history-soroswap`, `q-scf-how-to-apply`), no conflict. Lint
  `--since origin/main` → `0 error(s), 247 warning(s)`. Driver sent chunk-35 to sol-c.
- `2026-08-29T09:02Z` — chunk-31 (sol-b) verified: four DONE (`q-scf-build-tracks`,
  `q-scf-confidential-tokens-preview`, `q-scf-cross-decaf-sep24`,
  `q-scf-cross-reflector-rounds-current`), no conflict. Lint `--since origin/main` →
  `0 error(s), 246 warning(s)`. Driver sent chunk-34 to sol-b.
- `2026-08-29T09:03Z` — chunk-27 (sol-a) verified: four DONE (`q-protocol-bls12-381-cap59`,
  `q-protocol-bn254-poseidon-xray`, `q-protocol-max-tx-set-size`,
  `q-protocol-network-passphrases-list`), no conflict. Lint `--since origin/main` →
  `0 error(s), 246 warning(s)`. Driver sent chunk-30 to sol-a.
- `2026-08-29T09:05Z` — chunk-35 (sol-c) verified: four DONE (`q-scf-total-distributed`,
  `q-scf-verified-members`, `q-scout-hackathon-brief-first-hour`, `q-sep-1-toml`), no conflict.
  Lint `--since origin/main` → `0 error(s), 242 warning(s)`. Driver sent chunk-38 to sol-c.
- `2026-08-29T09:08Z` — chunk-30 (sol-a) verified: four DONE (`q-rwa-tokenization-standards`,
  `q-scf-ambassador-program`, `q-scf-audit-bank`, `q-scf-build-award-cap`), no conflict. Lint
  `--since origin/main` → `0 error(s), 229 warning(s)`. Driver sent chunk-33 to sol-a (the last
  part-2 chunk).
- `2026-08-29T09:09Z` — chunk-34 (sol-b) verified: four DONE (`q-scf-pitch-prep-live`,
  `q-scf-rfps-hackathons-live`, `q-scf-skill-stellar-scout`, `q-scf-skill-submission-radar`),
  no conflict. Lint `--since origin/main` → `0 error(s), 229 warning(s)` (measured with
  chunk-30). Driver sent chunk-37 to sol-b.
- `2026-08-29T09:11Z` — chunk-38 (sol-c) verified: four DONE (`q-sep-interactive-deposit-withdraw`,
  `q-sep-wallet-seps-list`, `q-smart-account-scoped-policy-signers`,
  `q-sor-deploy-invoke-from-js-sdk`), no conflict. `q-sep-wallet-seps-list` stays in the SEP-31
  P2 queue for its answer sentence (edited again after this lane releases it). Lint `--since
  origin/main` → `0 error(s), 220 warning(s)`. Driver sent chunk-41 to sol-c.
- `2026-08-29T09:14Z` — chunk-33 (sol-a) verified: four DONE (`q-scf-hummingbot-kelp-closed-rfp`,
  `q-scf-nqg-voting`, `q-scf-open-rfps`, `q-scf-passkey-rfps-live`), no conflict. Lint
  `--since origin/main` → `0 error(s), 208 warning(s)`. Driver sent chunk-36 to sol-a.
  **Part 2 closed (chunks 17–33).** Grok review part 2 prompted at 09:14Z with
  `pack/review-part-2.md` (fresh claim-by-claim brief; report `review-long-part-2.md`).
- `2026-08-29T09:14Z` — chunk-37 (sol-b) verified: four DONE (`q-sep-6-24-deprecation`,
  `q-sep-6-vs-31-misnumber-trap`, `q-sep-8-regulated-assets`, `q-sep-catalog-list`), no
  conflict. Lint `--since origin/main` → `0 error(s), 208 warning(s)`. Driver sent chunk-40 to
  sol-b.
- `2026-08-29T09:16Z` — chunk-41 (sol-c) verified: four DONE (`q-soroban-check-auth-custom-account`,
  `q-soroban-cli-bindings`, `q-soroban-constructor-lifecycle`,
  `q-soroban-contract-build-verification`), no conflict. Lint `--since origin/main` →
  `0 error(s), 201 warning(s)`. Driver sent chunk-44 to sol-c.
- `2026-08-29T09:18Z` — chunk-36 (sol-a) verified: four DONE (`q-sep-31-cross-border`,
  `q-sep-41-token-interface`, `q-sep-43-web-wallet-api`, `q-sep-45-contract-auth`), no
  conflict. Lint `--since origin/main` → `0 error(s), 192 warning(s)`. Driver sent chunk-39 to
  sol-a.
- `2026-08-29T09:21Z` — **Grok review part 2** (`review-long-part-2.md`, chunks 17–33, 68 cases):
  `APPROVE-WITH-FIXES`, 65 PASS / 3 FAIL. Reconciliation (owner fixes):
  1. `q-passkey-smart-account-architecture` — live re-check lines lacked URLs → owner evidence
     line adds the three URLs (CAP-0051, Stellar guestbook guide, W3C WebAuthn L3; all 200) and
     corrects the misleading "Moved to avoid" matrix wording (avoid did not change).
  2. `q-protocol-max-tx-set-size` — presentation-shaped fact [3] moved to `golden.avoid` as the
     reviewer's concrete trap; `test/qa-golden-max-tx.test.mjs` still passes.
  3. `q-protocol-network-passphrases-list` — reviewer saw 404 on the networks page; it resolved
     200 for the orchestrator; `/docs/networks` added as a second confirmation.
- `2026-08-29T09:22Z` — chunk-40 (sol-b) verified: four DONE (`q-sor-sep41-transfer-vs-transferfrom`,
  `q-sor-skill-openzeppelin-setup`, `q-soroban-add-signer-smart-wallet-howto`,
  `q-soroban-auth-recursion-dos-audit`), no conflict; worker notes the obsolete rs-soroban-env
  `native_contract` URL is 404 and the current `builtin_contracts` source verified the claims;
  `q-sor-skill-openzeppelin-setup` was minified JSON at HEAD and is now two-space formatted (the
  parsed-JSON diff at close proves only intended fields changed). Lint `--since origin/main` →
  `0 error(s), 179 warning(s)`. Driver sent chunk-43 to sol-b.
- `2026-08-29T09:23Z` — chunk-44 (sol-c) verified: four DONE (`q-soroban-reentrancy`,
  `q-soroban-simulate-resource-fee`, `q-soroban-storage-migration`,
  `q-soroban-upgradeable-storage-compat`), no conflict. Lint `--since origin/main` →
  `0 error(s), 175 warning(s)`. Driver sent chunk-47 to sol-c.
- `2026-08-29T09:24Z` — chunk-39 (sol-a) verified: four DONE (`q-sor-doc-page-sections-followup`,
  `q-sor-evm-to-soroban-porting`, `q-sor-persistent-unbounded-collection-cap`,
  `q-sor-sac-introspection`), no conflict. Lint `--since origin/main` → `0 error(s), 175
  warning(s)` (measured with chunk-44). Driver sent chunk-42 to sol-a.
- `2026-08-29T09:28Z` — chunk-43 (sol-b) verified: four DONE (`q-soroban-no-std-constraints`,
  `q-soroban-oracle-defensive-consumption`, `q-soroban-oz-token`, `q-soroban-publish-events` —
  the session-2 stray draft was not used; this is a fresh reviewed edit), no conflict; worker
  notes the OpenZeppelin fungible docs URL is 404 and the overview plus audit tree verified those
  facts. Lint `--since origin/main` → `0 error(s), 157 warning(s)`. Driver sent chunk-46 to
  sol-b.
- `2026-08-29T09:30Z` — chunk-42 (sol-a) and chunk-47 (sol-c) verified: eight DONE
  (`q-soroban-contract-id-derivation`, `q-soroban-event-indexing-design`,
  `q-soroban-fuzz-testing`, `q-soroban-greenfield-escrow-prior-art-preflight`;
  `q-ti-skill-integration-finder`, `q-ti-vocab-regions-live`, `q-token-circle-usdc-on-stellar`,
  `q-tool-cli-testnet-identity-howto`), no conflict. Lint `--since origin/main` → `0 error(s),
  156 warning(s)`. Drivers sent chunk-45 to sol-a and chunk-50 to sol-c.
- `2026-08-29T09:36Z` — chunk-50 (sol-c, its final chunk) verified: `q-zk-nullifier-storage`,
  `q-zk-poseidon-input-encoding`, `q-zk-verification-resource-budget` DONE;
  `q-zk-host-functions-status` CONFLICT queued (item 7 in the conflict brief): the keyFact says
  CAP-0080 is `Final`, the live CAP header says `Implemented` (freshness drift). Lint
  `--since origin/main` → `0 error(s), 135 warning(s)`. Driver c finished; sol-c received its P2
  canonical-five brief at 09:35Z.
- `2026-08-29T09:36Z` — chunk-45 (sol-a) verified: four DONE (`q-stellar-recurring-payments`,
  `q-ti-classic-submission-errors`, `q-ti-connect-wallet-button-code`,
  `q-ti-explain-repo-payload-status`), no conflict. Lint `--since origin/main` → `0 error(s),
  134 warning(s)`. Driver sent chunk-48 to sol-a (then 49 → sol-b after 46).
- `2026-08-29T09:37Z` — chunk-46 (sol-b) verified: four DONE (`q-ti-fetch-all-balances-classic-sac`,
  `q-ti-find-export-secret-key`, `q-ti-scout-refresh-cached-rows`,
  `q-ti-skill-builder-quickstart`), no conflict. Lint `--since origin/main` → `0 error(s), 134
  warning(s)`. Driver sent chunk-49 to sol-b (its final chunk); chunk-48 is sol-a's final chunk.
- `2026-08-29T09:41Z` — chunk-48 (sol-a, its final chunk) verified: four DONE
  (`q-tool-indexer-repos-discovery`, `q-tool-js-sdk-package`, `q-tool-passkey-repo-live`,
  `q-tool-skill-detail-install`), no conflict. Lint `--since origin/main` → `0 error(s), 123
  warning(s)`. **Lane A long-fact work complete** (17 chunks). Driver a finished; the armed P2
  driver prompted sol-a with the conflict-resolution brief (7 queued gospel changes) at 09:40Z.
  The independent Sol classification of the 56 corroboration warnings is assigned to sol-b
  immediately after chunk-49 (its final chunk), followed by the sourcing-guard audit. Part 3
  review waits only on chunk-49.
- `2026-08-29T09:44Z` — chunk-49 (sol-b, its final chunk) verified: four DONE
  (`q-tool-wallets-comparison`, `q-tool-which-sdk-comparison`, `q-x402-payment-verification`,
  `q-zk-circuit-setup`), no conflict. **P1 long-fact batch complete: 51 chunks, 204 cases.**
  Lint `--since origin/main` → `0 error(s), 110 warning(s)`. Long-fact warnings 372 → 7, all
  seven on the conflict-queued cases (`q-anchor-sdp-vs-anchor-platform`,
  `q-asset-deploy-sac-cli`, `q-asset-two-account-issuer`, `q-asset-wallet-sdk-seps`,
  `q-comp-security-disclosure-programs`, `q-defi-category-funding-ratio-live`,
  `q-zk-host-functions-status`) now owned by sol-a's P2 conflict lane. Grok review part 3
  (chunks 34–50) prompted at 09:43Z. sol-b received the independent 56-warning corroboration
  classification brief at 09:43Z; the 20-case sourcing-guard audit follows in the same driver.
  Lanes now: sol-a conflicts, sol-b classification → sourcing-guard, sol-c canonical five, Grok
  part 3.
- `2026-08-29T09:50Z` — **Grok review part 3** (`review-long-part-3.md`, chunks 34–50, 68 cases):
  `APPROVE-WITH-FIXES`, 65 PASS / 3 FAIL. Reconciliation:
  1. `q-soroban-fuzz-testing` — presentation-shaped fact [3] deleted (its trap already lives in
     `golden.avoid`); owner fix.
  2. `q-ti-vocab-regions-live` — worker's live URL (`https://mcp.lumenloop.com`) returns 400;
     owner evidence line records the live operation endpoint
     `https://api.lumenloop.com/v1/tools/get_regions` (200 on 2026-08-29) as the live re-check.
  3. `q-zk-host-functions-status` — CONFLICT case left unstamped (no judge-facing change);
     resolved inside sol-a's P2 conflict lane (item 7), which stamps `truth.verified`.
  Three-part long-fact review totals: 204 cases reviewed claim by claim, 192 PASS / 12 FAIL,
  every FAIL reconciled (10 owner fixes, 2 deferred into the P2 conflict lane).
- `2026-08-29T09:55Z` — **Canonical-page lane (sol-c) verified** (`pack/reports/canonical.md`,
  matrix in `matrices-sol-c.md`; reconciled against Grok R2 after the worker's own probe):
  - `q-protocol-base-reserve-min-balance`: lint-canonical caution added naming the official
    Sponsored Reserves page and `sd-043`, expiry "when sd-043 reaches fixed-upstream and the live
    page no longer carries that wording"; `sd-043` added to `rootCause`; Docs/Core provenance
    refreshed. No symmetric-caution warning.
  - `q-infra-horizon-vs-rpc`: the malformed disputed row ("Horizon lifecycle word is
    uncontested") rebuilt from the five official status pages (EVM migration guide says
    "deprecated"; four canonical pages say "nearing end-of-life and will eventually be
    deprecated"); `sd-017` replaced by `sd-042` in `rootCause`; dead Fable line replaced. The
    partial-cap caution in its notes pre-existed at HEAD (checked with `git show origin/main`),
    so the three-case caution boundary is unchanged.
  - `q-ti-rpc-gettransactions-pagination-xdr`: durable caution added — attributed "hardcoded"
    quote is not a wrong claim, caps at partial, does not accept universal immutability, and
    "sd-004 is declined-upstream, so this durable caution has no expiry date".
  - `q-ti-freighter-localhost-not-detected`: GT-52 note reworded into the lint-canonical caution
    naming the official frontend guide and `sd-045` with expiry; `sd-045` added to `rootCause`;
    no global HTTPS exception; worker's W3C secure-context check recorded.
  - **Protocol 27 snapshot fact (recorded separately):** `q-pc-protocol-27-zipper` keyFact
    "Reports Protocol 27 live when independently checked on July 11, 2026" replaced by "Gives
    July 8, 2026 as the official Protocol 27 Mainnet date" (software-versions table); the July 11
    Horizon observation stays in the answer and the `confirmed-as-of` corroboration row as a live
    check, never as an activation date (Grok R2 verdict: July 11 contradicted as official).
  Lint `--since origin/main` → `0 error(s), 108 warning(s)`. sol-c idle, reserved for
  classification disagreements and review fixes.
- `2026-08-29T10:02Z` — **Conflict lane (sol-a) verified** (`pack/reports/conflicts.md`; matrix in
  `matrices-sol-a.md`). Nine cases, all DONE with ≥2 source classes, exact quotes, corroboration
  rows, sibling sweeps, and avoid mirrors for the retired claims:
  - SEP-31 / Wallet SDK (`q-anchor-sdp-vs-anchor-platform`, `q-asset-wallet-sdk-seps`,
    `q-sep-wallet-seps-list`): wrap list corrected to SEP-10/12/24/38 (A: Wallet SDK intro page;
    B: `walletSdk/Anchor/index.ts`); "wraps SEP-31" `contradicted` and mirrored in avoid;
    rootCause `eval-authoring transcription`. Matches Grok R4.
  - `q-asset-two-account-issuer`: "holds/creates supply" → "creates supply and manages
    authorization flags" (A: control-asset-access page; B: `ChangeTrustOpFrame.cpp`
    `CHANGE_TRUST_SELF_NOT_ALLOWED`); "issuer holds a balance of its own asset" → avoid.
  - `q-asset-deploy-sac-cli`: `CONTRACT_ID_FROM_ASSET` → `CONTRACT_ID_PREIMAGE_FROM_ASSET`
    (A: SAC docs; B: `Stellar-transaction.x` = 1; B: stellar-cli `deploy/asset.rs`); old
    spelling → avoid.
  - `q-comp-security-disclosure-programs`: stale HackerOne intake-pause claim removed; dated
    no-pause observation `confirmed-as-of` 2026-08-29; `truth.asOf` 2026-08-29, freshness
    `scheduled`, `reverifyBy` 2026-11-29, status `confirmed`; rootCause `freshness-drift`.
  - `q-defi-category-funding-ratio-live`: `fundedCount` → `scfFundedCount` (C: live clusters
    API; B: manifest `scout.getClusters`).
  - `q-passkey-smart-account-architecture`: metadata-only; broken passkeys URL replaced in
    `truth.sources` and corroboration.
  - `q-zk-host-functions-status`: CAP-0080 `Final` → dated `Implemented` (B: CAP header
    `Status: Implemented`, `Protocol version: 26`; A: software-versions page); rootCause
    `freshness-drift`.
  Lint `--since origin/main` → `0 error(s), 101 warning(s)`; **long-fact warnings now 0**.
  sol-a idle.
- `2026-08-29T10:08Z` — **Corroboration classification reconciled.** Sol lane (sol-b,
  `pack/reports/corr-classify.md`, live-fetched evidence keys E01–E32) vs Grok blind lane R1:
  class agreement 56/56 (18 grammar-only, 27 negative-claim, 11 mixed). Dispositions: 18 no-edit
  (both), 34 add-corroboration-row (both), 4 disagreements where Sol's live fetch did not find
  the absence stated (Sol: downgrade-or-reword; Grok: add row) —
  `q-aas-issuer-fees-supply-cap-freeze`, `q-crp-custodial-vs-noncustodial-wallets`,
  `q-defi-arbitrage-pathpayment-bots`, `q-scf-hummingbot-kelp-closed-rfp`. Targeted probes
  dispatched to sol-c (`pack/corr-probe-brief.md`; never averaged). The 34 agreed row additions
  go to sol-a now (`pack/corr-edit-brief-a.md`); none of them sits inside the 20-case
  sourcing-guard set, so there is no ownership overlap with sol-b's audit (prompted 09:58Z).
- `2026-08-29T10:15Z` — **Bookkeeping correction (durable record).** The authoritative
  `review-long-part-3.md` on disk reports 67 PASS / 1 FAIL: `q-soroban-fuzz-testing` and
  `q-zk-host-functions-status` are PASS in that file (the report text reflects the deleted
  presentation keyFact and the conflict-lane stamp), and `q-ti-vocab-regions-live` is the one
  FAIL. The 10:50Z entry above quoted an earlier read (65 PASS / 3 FAIL) and is superseded by this
  entry; the applied fixes and case files are unchanged by this correction. Recount from the
  three report tables: part 1 = 62 PASS / 6 FAIL (68 rows), part 2 = 65 PASS / 3 FAIL (68 rows),
  part 3 = 67 PASS / 1 FAIL (68 rows). **Three-part totals: 204 cases, 194 PASS / 10 FAIL**, every
  FAIL reconciled (owner fixes recorded per part; the two conflict-queued cases were resolved in
  the P2 conflict lane).
- `2026-08-29T10:20Z` — **Sourcing-guard audit reconciled.** Sol audit (sol-b,
  `pack/reports/sg-audit.md`): 20/20 keep-advisory, random 12 clean, 0 edits. Grok audit (R3):
  17 keep-advisory, 3 reword. Orchestrator decision after reading both rationales, evidence
  first: accept the three rewords as demonstrated cruft — `q-defi-oracle-landscape-live` (the
  contradicted claim is "permanently", which any citation would otherwise launder),
  `q-tool-go-sdk-ingest` (regex bait "lacks ingestion support" on a concrete false claim; meaning
  preserved), `q-defi-market-making-kelp` (repo `stellar-deprecated/kelp` is archived, so the old
  item punished the true claim "abandoned"). Dispositions: 17 keep-advisory, 3 reword,
  0 demote-to-notes; the class stays advisory (both models agree). Rewords dispatched to sol-b
  through golden-truth (`pack/sg-reword-brief.md`); Grok's final review re-checks them.
- `2026-08-29T10:28Z` — **Four disposition disagreements resolved by targeted probe** (sol-c,
  `pack/reports/corr-probe.md`; never averaged):
  - `q-aas-issuer-fees-supply-cap-freeze` → add-corroboration-row (Grok's view): absence of a
    per-transfer fee hook and of an immutable max-supply field corroborated from the XDR schema
    (class B) plus docs (class A), two `confirmed-as-of` rows.
  - `q-scf-hummingbot-kelp-closed-rfp` → add-corroboration-row (Grok's view): the live
    unfiltered RFP feed (2026-08-29T14:00:41Z) still returns the item with `status: closed`,
    `quarter: q1-2026`; row is dated and feed-relative.
  - `q-crp-custodial-vs-noncustodial-wallets` → downgrade-or-reword (Sol's view): FinCEN
    FIN-2019-G001 ("the label … will not determine the regulatory application"; facts-and-
    circumstances test) and FATF 2021 VA/VASP guidance (true P2P not explicitly subject) support
    activity-based review, not a universal duty list → answer clause reworded to the
    activity-based rule with a grader note.
  - `q-defi-arbitrage-pathpayment-bots` → downgrade-or-reword (Sol's view): a "no protocol
    incentive" row would be false (AMM 0.3% fee to LPs per the liquidity docs and CAP-0038) →
    sentence reworded to "no guaranteed profit" with a grader note.
  All four edits dispatched to sol-c with exclusive ownership (`pack/corr-edit-brief-c.md`).
- `2026-08-29T10:33Z` — Sourcing-guard rewords verified (sol-b, `pack/reports/sg-reword.md`):
  the three avoid items now read as concrete false claims; oracle providers page (A) lists
  Reflector, Band, DIA; Go ingest docs (A) + GitHub contents API (B); kelp repo API (B)
  `archived: true`, `pushed_at 2023-11-03` + SDF blog (A/D) with a `confirmed-as-of`
  corroboration row. Sourcing-guard warnings 47 → 44 (advisory class kept). Lint `--since
  origin/main` → `0 error(s), 64 warning(s)` (sol-a's corroboration rows are landing).
- `2026-08-29T10:40Z` — Four probe dispositions verified (sol-c, `pack/reports/corr-edit-c.md`):
  `q-aas-issuer-fees-supply-cap-freeze` two A/B `confirmed-as-of` rows;
  `q-scf-hummingbot-kelp-closed-rfp` one C/B feed-relative row; `q-crp-custodial-vs-noncustodial-
  wallets` universal duty list replaced by the activity-based rule (keyFact "Applies compliance
  duties by activity and jurisdiction, not custody label"; FinCEN and FATF class-A rows plus a
  class-D sweep row; grader note added; the existing avoid item still punishes "non-custodial
  eliminates KYC"); `q-defi-arbitrage-pathpayment-bots` incentive-absence implication replaced by
  the 0.3% AMM-fee + no-guarantee boundary (A/B row; grader note). Lint `--since origin/main` →
  `0 error(s), 60 warning(s)`. sol-b and sol-c idle for final-review fixes.
- `2026-08-29T10:48Z` — Corroboration rows verified (sol-a, `pack/reports/corr-edit-a.md`): 59
  rows added across the 34 agreed cases, none unsupported; orchestrator spot-checked three cases
  (dated A/B/C evidence with URLs and quotes). **Final warning breakdown** (`node
  eval/qa/lint-corpus.mjs`): 0 errors, 60 warnings = 44 sourcing-guard (43 cases; 17 audited
  keep-advisory + 26 unaudited, class kept advisory by both audits) + 16 corroboration (all 16
  are classified `grammar-only` → no-edit by both Sol and Grok) + 0 long-fact. Every remaining
  warning therefore has an audited disposition. Baseline 475 → 60.
  Scope diff (`pack/json-diff.mjs`): 224 cases changed, 211 judge-facing; changed fields are
  `golden.keyFacts` (205), `golden.avoid` (11), `golden.answer` (11: nine conflict-lane cases,
  `q-pc-protocol-27-zipper`, and the two probe rewords), `golden.notes` (6: three caution cases,
  `q-comp-security-disclosure-programs`, and the two probe rewords), `tags.freshness` (1),
  `truth.*` (verified 895 fields, corroboration 49, sources 9, status/asOf/reverifyBy on the
  HackerOne case). Matrices mirrored into this directory (`matrices-sol-{a,b,c}.md`, 3,475
  lines). `npm run eval:qa:compile` → 500 cases, sha256 `3b9d0f2c…`. Grok final full-diff review
  prompted (`pack/grok-final-brief.md`; report `review-final-grok.md`).
- `2026-08-29T11:05Z` — **Register reconciliation (part 1).** `npm run eval:qa:register` after
  the corpus edits: 130 cluster reopens (121 in `reopen` incl. none pre-existing at HEAD), 3
  numeric-invariant reopens plus the pre-existing `Protocol 27 Mainnet version` reopen (marker
  from 2026-08-28, no substantive finding), 4 date-trap reopens plus one pre-existing. Stamped
  with dated `reSwept` events: 110 clusters whose moved members changed only keyFact form and/or
  judge-blind metadata (reason cites the per-case sibling sweeps in the mirrored matrices); the
  5 form-only invariant/date-trap entries likewise; `base reserve` (value and formula unchanged;
  caution only), `Protocol 27 Mainnet version` (new July 8 keyFact matches the 2026-07-08
  activation rule), and the Protocol 28 trap (trigger/disposition unchanged) with specific
  reasons. Helper now reports `up to date; 0 reopened`; remaining `reopen`: 11 clusters, each
  with a gospel-changed member, delegated to sol-b for a member-by-member re-sweep
  (`pack/register-resweep-brief.md`). Plan-grade check: `npm run eval:plan --
  eval/qa/results/2026-08-28T19-27-08-variantA.json` (artifact copied into this worktree's
  gitignored results dir) ran clean; the grader reads only `eval/plan/coverage-rules.json`, the
  op-class table, and the result rows, none of which this block touches, so plan grades are
  unchanged by construction (broad→detail used 2/4/2, skipped 13/9/4/1 error). Affected ids
  written to `2026-08-29-golden-truth-session-3/affected-case-ids.md` (211 judge-facing, 13
  metadata-only). Dead-provenance remainder: 47 untouched files still cite a temporary path
  (94 → 47); 0 touched files do.
- `2026-08-29T11:25Z` — Gate dry run: `npm run typecheck` clean; `npm run build` (dry run) clean;
  `npm run secrets:scan -- --tree` → "no leaks found"; `npm test` → 2 failures, both pre-existing
  wording pins on long-fact cases: `test/qa-corpus-lint.test.mjs` (one archive-roster fact must
  name the dated seven-row subset and the attributed eighth-row roster;
  `q-infra-rpc-provider-archive-tier`) and `test/qa-judge-qpp-dormant.test.mjs` (the negated
  "final mechanical dormant-account eligibility rule" clause must name QPP;
  `q-pc-quantum-preparedness-dormant`). Owner fixes restored the pinned terms inside ≤ 90-char
  single-predicate facts (81 and 81 chars); claims unchanged; both test files pass (23 tests);
  lint `--since origin/main --stale` → `0 error(s), 60 warning(s)`. Documentation drafted:
  `.agents/TODO.md` (closed: burn-down, audit, strkey, canonical-page, affected-id items; dead
  provenance item updated to the 47-file remainder), `.agents/NEXT.md` rewritten,
  `program-log.md` session-3 section appended.
- `2026-08-29T11:40Z` — **Register reconciliation (part 2).** sol-b re-swept the 11 gospel-touched
  clusters member by member (`register-resweep-sol-b.md`): 8 consistent, 3 `tension`
  (`cluster-017`, `cluster-114`: the encoded sd-043 Docs-vs-Core minimum-balance boundary;
  `cluster-018`: the encoded sd-004 "hardcoded" and sd-042 Horizon-lifecycle disputes), no
  contradiction. Stamped with dated `reSwept` events (verdict `tension` kept as the reviewer
  stated it; `tension` is an existing register verdict). The two clusters re-reopened by the
  same-day pin fixes were re-stamped. `npm run eval:qa:register` → `up to date; 0 reopened`;
  reopen count 0 in all three sections.
- `2026-08-29T11:45Z` — **Grok final review** (`review-final-grok.md`): sections 1 (strkey; tried
  wrong-version/wrong-length/M/P keys), 2 (12 part-review reconciliations), 3 conflict lane,
  canonical lane, sourcing-guard rewords, 4 dead provenance, 5 parsed-JSON scope, 6 lint, 7
  five random re-derivations — all PASS. One FAIL: 62 corroboration rows added today carry a
  single evidence class (35 files) against the skill's two-class bar. `VERDICT:
  APPROVE-WITH-FIXES`; explicit guards: do not expand the three-case caution set; keep the
  Protocol 27 July 8 / July 11 split. Reconciliation: second-class evidence lane fanned out to
  sol-a/b/c with exclusive file ownership (`pack/corr-second-class-{a,b,c}.md`, generated from
  `pack/single-class-rows.json`). Residual risks: regions Live re-check line fixed by the owner
  to the working endpoint; `findStrkeyCandidates` ignores tokens shorter than 56 chars (by
  design: every SEP-23 type is ≥ 56 chars); the SDP-vs-Anchor-Platform wrap list
  (SEP-10/12/24/38) is a client-flow subset, not a false wrap — left as is; 47 untouched files
  keep `/tmp/` provenance (TODO remainder).
- `2026-08-29T11:55Z` — Second-class lane, sol-a: 21 rows in 12 files DONE (mostly dated class-D
  sweeps naming the query and top primary results; the custodial case also gained a second A
  source), no conflict. Lint `--since origin/main` → `0 error(s), 60 warning(s)`. sol-b and
  sol-c still working.
- `2026-08-29T12:05Z` — Second-class lane, sol-c: 25 rows in 11 files DONE (class B CAP/XDR/SDK/
  CLI/handbook permalinks, one class F adapter execution, one class D), no conflict. Lint
  `--since origin/main` → `0 error(s), 60 warning(s)`. Waiting on sol-b.
- `2026-08-29T12:15Z` — Second-class lane, sol-b: 16 rows in 12 files DONE, no conflict. Detector
  re-run (new rows with one evidence class, vs origin/main): **0 remaining** (62 → 0). Matrices
  re-mirrored. Lint `--since origin/main --stale` → `0 error(s), 60 warning(s)`. Grok re-review
  of the repaired finding requested against the complete current diff.
- `2026-08-29T12:30Z` — **Grok re-check** (`review-final-recheck-grok.md`): single-class scan 0
  PASS; 12 sampled repaired rows independent and resolving PASS; two re-worded keyFacts PASS;
  lint PASS; register FAIL — `cluster-018` kept a stale `reopened` marker next to its `tension`
  verdict. `VERDICT: APPROVE-WITH-FIXES` with the explicit guard "do not reopen the two-class
  corroboration work". Fix: the stale `reopened` key removed from every non-reopen entry
  (1 found: `cluster-018`); helper `up to date; 0 reopened`; no `reopened` key remains. Explicit
  Grok re-check of this one fix requested.
- `2026-08-29T12:35Z` — Register helper re-run after the second-class evidence lane reopened 23
  clusters (member hashes moved on judge-blind `truth.corroboration` evidence only; the scope
  diff still shows no new judge-facing field). Re-stamped all 23 with the same-day verdict and a
  reason that records the final-review fix; helper `up to date; 0 reopened`; no `reopened` key in
  any section. This transient state may have been visible to the Grok re-check in flight; if its
  report reflects it, a further explicit re-check follows.

## Outcome

- **Strkey validation:** `eval/qa/strkey.mjs` (SEP-23 version bytes, CRC16-XModem, canonical
  base32, payload lengths) wired into `eval/qa/compile-qa.mjs` `validateCase`; `test/qa-strkey.test.mjs`
  8 tests (positive and negative G and C keys, SEP-23 invalid vectors, compiler rejection). The
  current 500 cases pass. Grok final review tried wrong-version, wrong-length, M, and P keys: PASS.
- **Long-fact class:** 372 → 0 warnings across 204 cases; 51 chunks × 4 cases, one bounded
  prompt each, three Sol workers; three Grok claim-by-claim review parts (68 cases each):
  194 PASS / 10 FAIL, every FAIL reconciled (owner fixes with the reviewer's text, or the P2
  conflict lane). Seven live-source conflicts found by the workers became verified gospel
  changes with two source classes each.
- **Sourcing-guard audit:** 20 cases (8 targeted shapes, 12 seeded-random; seed
  `gt3-sg-audit-2026-08-29`), two models: 17 keep-advisory, 3 rewords (demonstrated cruft),
  0 demote-to-notes; random 12 clean by Sol, 11/12 by Grok; class stays advisory. 47 → 44.
- **Corroboration warnings:** 56 classified by two models (56/56 class agreement: 18 grammar-only,
  27 negative-claim, 11 mixed); 4 disposition disagreements settled by targeted probes (2 rows
  added, 2 rewords); 34 agreed cases received 59 rows; Grok's final review then required a second
  evidence class on 62 new rows — done (0 single-class rows remain). 56 → 16, all 16 grammar-only.
- **Canonical-page cases:** five repaired; three-case caution boundary unchanged (the Horizon
  caution pre-existed); Protocol 27 keyFact carries July 8, 2026 (official), July 11 kept as a
  live observation only.
- **Dead provenance:** repaired on every touched case (94 → 47 files remain, all untouched).
- **Final lint:** 0 errors, 60 warnings (44 sourcing-guard advisory, 16 corroboration grammar-only,
  0 long-fact). Baseline 475.
- **Register:** reconciled; 0 reopen in all sections; 3 `tension` clusters name the encoded
  upstream disputes (sd-043, sd-004, sd-042).
- **Affected ids:** `affected-case-ids.md` — 211 judge-facing, 13 metadata-only (224 files).
- **Gates at close** (`b933ddc` base): `npm run eval:qa:compile` → 500 cases, sha256
  `f662edf34004…`; `npm run eval:qa:register` → up to date, 0 reopened; `node
  eval/qa/lint-corpus.mjs --since origin/main --stale` → 0 errors, 60 warnings, 0 `exceeds 90`;
  `npm run eval:plan -- eval/qa/results/2026-08-28T19-27-08-variantA.json` → used 2/4/2/0,
  skipped 13/9/4/1 (grader inputs untouched by this block); `npm run typecheck` clean; `npm test`
  → 91 files, 1383 passed; `npx vitest run test/qa-strkey.test.mjs` → 8 passed; `npm run build`
  dry run clean; `npm run secrets:scan -- --tree` → clean (+ gitleaks); compile/register re-run
  produced no further change; parsed-JSON scope: changed fields limited to `golden.keyFacts`
  (205), `golden.avoid` (11), `golden.answer` (11), `golden.notes` (6), `tags.freshness` (1),
  `truth.*`; 0 touched files cite a temporary path.
- **Review verdicts:** part 1 APPROVE-WITH-FIXES (62/6), part 2 APPROVE-WITH-FIXES (65/3),
  part 3 APPROVE-WITH-FIXES (67/1), final APPROVE-WITH-FIXES (one finding, fixed), re-check
  APPROVE-WITH-FIXES (one register marker, fixed), explicit re-check **APPROVE**.
- **Residual risks:** 47 untouched files still cite temporary paths (TODO remainder); the
  same-100 set is per-id comparable on only the 13 metadata-only ids plus untouched ids; three
  `tension` clusters track open upstream findings; `findStrkeyCandidates` only scans tokens of
  56+ characters (every SEP-23 type is at least 56).
- **Blockers:** none. No production deploy; no paid Lumenloop research used.
- `2026-08-29T12:50Z` — First commit attempt blocked by the pre-commit secret guard: gitleaks
  `generic-api-key` matched the case id `q-n3-generate-secret-key-refusal` inside one
  sibling-sweep evidence line (the export-secret-key sibling id followed by that case id and a
  semicolon) in that case file, `cases.json`, and `matrices-sol-c.md` — a false positive on a case id.
  Fix: the two ids were reordered inside that one evidence line (no gospel change); artifacts
  regenerated (compile sha256 `3d889653fa11…`; register up to date, 0 reopened); lint
  `--since origin/main --stale` → 0 errors, 60 warnings; staged scan → "no leaks found";
  `npm test` re-run on the final tree.
