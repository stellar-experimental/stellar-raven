# Golden metadata remainder — 2026-08-30

## Scope

Block 1 from `.agents/NEXT.md` plus the two `scout.hackathonBrief` consistency-cluster decisions from
`.agents/TODO.md` "Staleness". Branch `next/golden-metadata-remainder`, base `b53f62d` (`main`).
Worktree `~/.herdr/worktrees/stellar-raven-codemode/next-golden-metadata-remainder`. Skill:
`golden-truth`.

In scope:

1. Dead provenance: the 47 untouched case files that still cite a temporary path (24 cite the expired
   Fable report `…/scratchpad/p4/conversions-copy-review.md`; 26 cite `/tmp/raven-qadeep/gt2/review-b{4,5}-part{1,2,3}.md`
   or `/tmp/raven-qadeep/review-judge.md`; 3 files carry both). Each file is repaired only inside a
   verified touch: every keyFact re-verified live on 2026-08-30, one `Live re-check` line per keyFact,
   a sibling sweep, and a refreshed `truth.verified`. No bulk edit.
2. The two dated source-metadata conflicts: `q-tool-soroban-auth-audit-live` (`asOf` 2026-08-25 vs
   verification 2026-08-28) and `q-protocol-ledger-close-time` (official 5–7-second wording; dated
   199-ledger observation).
3. The five same-100 candidates: `q-protocol-base-reserve-min-balance`, `q-comp-finclusive-caas`,
   `q-eco-stellar-wallets-list`, `q-pc-protocol-27-zipper`, `q-ti-freighter-localhost-not-detected`.
4. Consistency-cluster membership for `q-gap-hackathon-brief-evidence-boundaries` and
   `q-scout-hackathon-brief-first-hour`, plus affected consistency metadata.
5. Affected case-id list, gates, local commit.

Out of scope: `.agents/NEXT.md` and `.agents/TODO.md` (coordinator owns queue reconciliation); paid
Lumenloop research; paid evals; push, PR, deploy, upstream filing. A second temporary-path class
(relative `scratchpad/p4/h3-raph/…` and `scratchpad/p4/n2-events-blind/…` lines, 79 files) is not in
the TODO item and is recorded as a remainder, not edited.

## Baseline (2026-08-30, `b53f62d`)

`node eval/qa/lint-corpus.mjs` → `0 error(s), 60 warning(s)` (44 sourcing-guard, 16 corroboration; both
classes carry an audited advisory disposition — not chased). Register: 135 clusters, 0 reopen entries.

## Lanes

| lane | agent (model, effort) | pane | write set | status |
| --- | --- | --- | --- | --- |
| Orchestration + all case edits | Claude Fable 5, high (`golden-next`) | `w1J:p1` | this ledger and directory, case files, generated artifacts, register, commit | running |
| A — dead-provenance research, 16 cases (compliance, defi, edge) | Codex `gpt-5.6-sol`, `model_reasoning_effort="high"` (`gmr-sol-a`) | `w1J:p2` | scratch pack `matrices/a/*.json`, `matrices-a.md` | running |
| B — dead-provenance research, 16 cases (edge, history, protocol, scf) | Codex `gpt-5.6-sol`, high (`gmr-sol-b`) | `w1J:p3` | `matrices/b/*.json`, `matrices-b.md` | running |
| C — dead-provenance research, 15 cases (soroban, tooling) | Codex `gpt-5.6-sol`, high (`gmr-sol-c`) | `w1J:p4` | `matrices/c/*.json`, `matrices-c.md` | running |
| D — proposer matrices for the seven high-stakes cases | first idle Sol worker (lane A/B/C agent) | its pane | `matrices/d/*.json`, `matrices-d.md` | queued |
| R — blind re-derivation of the seven high-stakes facts, then final adversarial review of the diff | Grok `grok-4.6`, `--reasoning-effort high` (`gmr-grok-rev`) | `w1J:p5` | `matrices/grok/*.md`, `review-*.md` | running (blind lane) |

Research workers never edit repository files (Codex sandbox also denies writes under `.agents/`; matrices
live in the session scratch pack and are mirrored into `2026-08-30-golden-metadata-remainder/` before
the commit). The orchestrator owns reconciliation and every case edit.

Route cards:

- Lanes A–D. Worker CLI: Codex. Model: GPT-5.6 Sol. Effort: high. Reason: bounded data collection
  whose result drives a consequential gospel-metadata action (fleet: Terra → Sol when the result drives a
  consequential action); dense per-fact verification with tool calling. Verified: `~/.codex/config.toml`
  pins `gpt-5.6-sol` / `high`; `herdr agent start` returned idle for all three. Fallback: Fable 5 high,
  then Opus 5 high. Reviewer: Grok 4.6 (different family).
- Lane R. Worker CLI: Grok. Model: grok-4.6. Effort: high. Reason: independent research and adversarial
  challenge; differs from the matrix authors (Sol) and from the orchestrator/editor (Fable). Verified:
  `grok models` lists `grok-4.6 (default)`. Fallback: Opus 5 high. Reviewer: none (it is the reviewer).
- Orchestrator/editor: Fable 5 high (this session). Reviewer for the final diff: Grok 4.6 high (differs
  from author and orchestrator).

## Rules for this round

- Dead-provenance replacement (session-3 rule, `2026-08-29-golden-truth-session-3/worker-rules.md`):
  `/tmp/raven-qadeep/gt2/review-bN-partM.md` → `program-log.md § Session 2 › Batch N › Part M review (gt2-grok-rev)`;
  `/tmp/raven-qadeep/review-judge.md` → `research/qa-deep-dive-2026-08-25/review-judge.md`;
  the Fable `conversions-copy-review.md` line → `Independent Fable copy-review report (temporary path, unrecoverable); its claims were re-verified live on 2026-08-30 — see the Live re-check lines.`
  The Fable replacement is applied only when every keyFact of the case has a `confirmed` or
  `confirmed-as-of` verdict in the lane matrix. A `CONFLICT`/`UNREACHED` case keeps its dead line and is
  listed as a remainder.
- `truth.verified` on every touched case: `date` 2026-08-30, `by` names this round and lane, `evidence`
  appends one `Live re-check 2026-08-30` line per keyFact plus the sibling sweep, `rootCause` appends
  `.agents/TODO.md — Replace expired temporary evidence in golden truth metadata`.
- High-stakes cases change gospel only where the proposer matrix (Sol) and the blind lane (Grok) agree;
  a disagreement goes to a targeted follow-up probe by the orchestrator, never averaged.
- Gates: `eval:qa:compile` → `eval:qa:register` → `eval:qa:lint -- --since b53f62d` and `--stale` →
  `eval:plan` on the saved 2026-08-30 result → `typecheck` → `test` → `build` → `secrets:scan -- --tree`.

## Ledger

- `2026-08-30T12:30Z` — Baseline captured; panes `w1J:p2`–`w1J:p5` split down from `w1J:p1` (owned by this session); agents `gmr-sol-a/b/c` (Codex Sol high) and `gmr-grok-rev` (Grok 4.6 high) started and prompted with lane briefs A/B/C and the blind re-derivation brief.
- `2026-08-30T12:37Z` — Grok blind lane landed: `review-blind-rederivation-grok.md` (28 KB, URL inventory). Verdicts: V2.1 Veridise appendix id and zero valid-Critical confirmed, V2-specific id/severity pairing unverifiable from a live file (V2 PDF 404s); Light research `V-SOR-APP-VUL-003` row without `meta.exactMiss` and `-999` control with `exactMiss` confirmed-as-of 2026-08-30; fresh 199-delta Pubnet sample min 5 / max 7 / mean 5.678 / median 6 s, no official page says 3–5 s, official phrasing ranges 5-second / ~5-second / under 6 seconds / a few seconds; base reserve 5,000,000 stroops at ledger 64193767, pool-share two reserves confirmed by liquidity-pools page + CAP-0038 while lumens/accounts pages list pool shares as ordinary subentries; FinClusive TPSP not-a-bank not-an-MSB text quoted; wallet search total 183, `types` array, 31 exact sole-type Wallet / 66 containing Wallet; Protocol 27 live, Protocol 28 not live (core_supported 28); Freighter manifest <all_urls> document_start no all_frames, latest release 5.46.0, HTTPS sentence unchanged.
- `2026-08-30T12:48Z` — Lanes A, B, C landed (47 matrices; `matrices-sol-{a,b,c}.md`, per-case JSON in the scratch pack). A: 16 DONE. B: 12 DONE, 4 CONFLICT where a general stellar.org index page disagrees with the dedicated controlling page (`q-protocol-cap-process`, `q-scf-academic-research-grant`, `q-scf-sdf-bug-bounty`, `q-scf-vs-sdf-enterprise-fund`); in each the golden already sides with the controlling page and its corroboration rows already name the conflict, so the orchestrator accepted them as verified with an explicit `Source conflict 2026-08-30` evidence line (`overrides.json`) and no new canonical-page caution (ADR-0008 keeps the boundary at three cases). C: 15 DONE after a sweep redo on five cases whose first `siblingSweep` reused an older dated string (lane A performed the redo). `apply-dead.mjs` applied the session-3 replacement rule to all 47 files; `grep conversions-copy-review|/tmp/raven-qadeep` over the battery → 0 files. Source repairs on five cases from worker notes, each URL re-checked by the orchestrator with curl on 2026-08-30: Circle forwarder path 404 → cctp/references/stellar; Stellar Docs smart-contracts/security 404 → build/security-docs (index only; Certora roadmap and the fees/resource-limits page used instead); PDAX 2022 announcement 404 (kept, dated); the three earlier SCF submission refs resolve to 0xAuth/Metafyed/Verseprop, so the Talwex and TERWA submission URLs were added; general Stellar Immunefi page Not Found (deprecated per HackerOne), SDF bug-bounty page added as a stale-conflict source.
- `2026-08-30T12:49Z` — Orchestrator defect and fix: `apply-dead.mjs` was run twice on lane C (10 cases received duplicated 2026-08-30 lines); duplicates removed by an exact-line dedupe restricted to the 2026-08-30 line classes, lanes A and B checked clean, and the script is now idempotent (skips a case whose `truth.verified.by` already names this round). `q-soroban-vuln-classes`: the worker's two lines cited the 404 Docs URL; replaced by the orchestrator with the live Certora roadmap (class D, quote checked) and the official fees/resource-limits page ("If the transaction attempts to exceed the declared resource limits, it will fail."); the dead source ref was swapped accordingly.
- `2026-08-30T13:07Z` — Lane D landed (`matrices-sol-d.md`, `d-all.md`). Reconciliation of the seven high-stakes cases against the blind lane: (1) `q-tool-soroban-auth-audit-live` — both lanes confirm the live retrieval behavior; the volatile claim is that behavior, so `truth.asOf` → 2026-08-30; the V2-specific id is witnessed by the stellarsecurityportal V2 copy (class D) because the V2 PDF is no longer served. (2) `q-protocol-ledger-close-time` — lanes disagreed on a 3–5-second official page; orchestrator direct fetch confirmed `docs/validators` says 'every 3-5 seconds' while `stellar-stack` says 'every 5-7 seconds'; both fresh 199-delta samples had median 6 s (one 9-second delta in one sample). Golden unchanged ('roughly 5–7' with a dated sample); a confirmed-as-of row for the fresh samples and a `contradicted` row for the avoid-mirrored 3–5 claim added; no caution added (ADR-0008 three-case boundary) — the Stellar Docs finding for the stale validators page is an owner decision. (3) `q-protocol-base-reserve-min-balance` — two-reserve pool-share rule kept (CAP-0038 + liquidity page); Lumens and Accounts pages added as conflicting provenance; base reserve 5,000,000 stroops re-confirmed. (4) `q-comp-finclusive-caas` — TPSP/not-a-bank/not-an-MSB legal text and the marketing claims recorded as a corroboration row; asOf → 2026-08-30. (5) `q-eco-stellar-wallets-list` — judge-facing refresh of the illustrative count (183 keyword total / 64 records with Wallet in `types` / 31 sole-type), rootCause freshness-drift. (6) `q-pc-protocol-27-zipper` — judge-facing refresh of the Horizon example (27 live on 2026-08-30, core supports 28, P28 not live; first-day ledger 63386819 added); register P28 trap disposition refreshed. (7) `q-ti-freighter-localhost-not-detected` — judge-facing version-reference refresh (5.43 dated; master/5.46.0 on 2026-08-30), reverifyBy → 2026-11-20, caution and manifest fact unchanged. Register: helper reopened 71 entries; 63 closed as truth-only, 8 (five wallet clusters, cluster-120, the P28 trap, the Protocol 27 invariant) re-read member by member — no sibling pins the superseded values — closed consistent; cluster-136 added for the hackathonBrief decision; second stamp → 0 reopened.
- `2026-08-30T13:08Z` — Gates (after `npm ci`; the worktree had no node_modules): `eval:qa:compile` 500 cases; `eval:qa:register` up to date, 0 reopened; `lint-corpus --since b53f62d --stale` → 0 error(s), 60 warning(s) (unchanged advisory classes); `eval:plan` on `eval/qa/results/2026-08-30T03-43-11-variantA.json` (main checkout, local) → grades unchanged (broad→detail 10 correct / 16 partial / 2 wrong / 0 error of 28); `typecheck` clean; `npm test` 95 files, 1506 passed; `build` dry-run ok (7036.53 KiB); `secrets:scan -- --tree` clean. Parsed-JSON diff: 54 case files, 3 judge-facing, 51 truth-only (`affected-case-ids.md`). Grok final review prompted with the full diff against b53f62d.
- `2026-08-30T13:17Z` — Grok final review (`review-final-grok.md`): APPROVE-WITH-FIXES, 25 URLs spot-checked live, three findings, all accepted and fixed: (1) wallets-list answer clause now says 64 records with Wallet in `types` and 31 sole-type (the corroboration row's wording); (2) the vuln-classes DoS/invariants line retargeted from the state-archival page (no such wording) to the Certora roadmap; (3) the six judge-facing `reSwept` reasons rewritten to name only the durable rule each cluster actually shares. Register re-stamped after the two case edits; reopened entries closed with the specific reasons; 0 reopened.
- `2026-08-30T13:18Z` — Close: final gates re-run after the review fixes (compile, register 0 reopened, lint --since b53f62d --stale 0 errors / 60 warnings, plan grades unchanged, typecheck, test, build, secrets scan) and committed locally on `next/golden-metadata-remainder`. Not done here (coordinator-owned): `.agents/TODO.md` / `.agents/NEXT.md` reconciliation; push/PR; the Stellar Docs finding for the stale `docs/validators` 3-5-second wording and the owner decision on a caution; the second temporary-path class (relative `scratchpad/p4/h3-raph/…` and `scratchpad/p4/n2-events-blind/…` lines, 79 files) which the TODO item does not name. Panes `w1J:p2`–`w1J:p5` (agents gmr-sol-a/b/c, gmr-grok-rev) are idle and owned by this session.
