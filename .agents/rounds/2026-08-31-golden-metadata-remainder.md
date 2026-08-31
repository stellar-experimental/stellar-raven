# Golden metadata remainder — 2026-08-31

Round record for block 1 of `.agents/NEXT.md` after PR #100. Skill: `golden-truth`. Branch
`next/golden-metadata-remainder`, base `35b5a38` (`main` HEAD on 2026-08-31). Orchestrator pane
`w1W:p1`. Artifact directory: `2026-08-31-golden-metadata-remainder/`.

## Scope

In scope:

1. Verify the 54 ids landed by PR #100 (`a617512`, merged 2026-08-30T13:24:37Z): 47 dead-provenance
   repairs, two dated-conflict dispositions, five same-100 candidates.
2. Close the stale bookkeeping in `.agents/TODO.md`, `.agents/NEXT.md`, and the 2026-08-30 ledger.
3. Repair the second temporary-path class: 37 battery files with a bare relative `scratchpad/…` path
   (`p4/h3-raph`, `p4/h3-raph-blind`, `p4/n2-events-blind`, `recon/jutsu-real-questions.md`), each
   through a verified touch and never through a bulk edit.
4. D1: reconcile the ledger-close-time documentation conflict on `q-protocol-ledger-close-time`,
   file a Stellar Docs finding if the conflict persists, and decide the caution question.
5. Close two metadata gaps found by the verification: a single-class corroboration row on
   `q-comp-finclusive-caas`, and the missing link between `q-protocol-base-reserve-min-balance` and
   `sd-046`.
6. Record the hackathon cluster decision from the landed register.

Out of scope: `solo://` references (retained historical dated records under `AGENTS.md`; never
edited); the 60 audited advisory lint warnings; paid Lumenloop research; paid eval commands; the
upstream filing of the new finding; push, PR, deploy.

## Baseline (2026-08-31, `35b5a38`)

- `git log --oneline main..HEAD` → empty; `git status --short` → clean.
- `node eval/qa/lint-corpus.mjs` → `0 error(s), 60 warning(s)`; `npm run eval:qa:register` →
  `up to date; 0 reopened`.
- Class-1 scan `grep -rlE 'conversions-copy-review|/tmp/raven-qadeep' eval/qa/corpus/battery` → 0.
- Bare-relative scan `grep -rlE '"scratchpad/' eval/qa/corpus/battery` → 37 files.
  `grep -rl 'solo://' eval/qa/corpus/battery` → 301 files (236 with `solo://proj/49/scratchpad/…`).
- The 54 landed ids all carry `truth.verified.date` 2026-08-30 with the round name in `by`.
- `improvements/`: 68 active findings; `sd-046` (`proposed`, from the base-reserve candidate) did not
  name its source case. No finding covered the ledger-close-time wording.
- `eval/qa/consistency-register.json`: `cluster-136` already held `q-gap-contracts-domain-empty`,
  `q-gap-hackathon-brief-evidence-boundaries`, `q-scout-hackathon-brief-first-hour`.
- Worktree had no `node_modules`; `npm ci` ran. A gitignored `.dev.vars` stub with the CI names was
  created and `npm run typegen` ran. The local result file
  `eval/qa/results/2026-08-30T03-43-11-variantA.json` was copied from the main checkout (gitignored).
- Seeded 12-id sample for the URL re-walk (seed `gmr-close-2026-08-31`, sha256 rank over the 54
  sorted ids): `sample-12.txt`.

## Lanes and route cards

| lane | agent (model, effort) | pane | write set | status |
| --- | --- | --- | --- | --- |
| Orchestration and every repository edit | Claude Fable 5, high | `w1W:p1` | case files after reconciled matrices; `sd-047`; `sd-046` link; TODO; NEXT; both round ledgers; generated artifacts; register | completed |
| V — verify the 54 landed ids and the 12-id URL re-walk | Codex `gpt-5.6-terra`, `model_reasoning_effort="high"` (`gmr2-terra-v`) | `w1W:p5` (split down from `w1W:p1`) | scratch pack only; mirrored as `v-report.md`, `v-checks.json`, `v-rewalk.json` | completed |
| A — S1-H research, 23 retail cases | Codex GPT-5.6 Sol, high | `w1W:p2` | mirrored as `matrices-lane-a-retail.md` | completed |
| B — S1-N and S1-R research, 14 cases, plus the D1 proposer matrix | Codex GPT-5.6 Sol, high | `w1W:p3` | mirrored as `matrices-lane-b-events-d1.md` | completed |
| R — blind re-derivations (D1, LOBSTR, SCF #43) and the final adversarial review | Grok 4.6, `--reasoning-effort high` | `w1W:p4` | `review-blind-ledger-close-grok.md`, `review-blind-lobstr-grok.md`, `review-blind-scf43-grok.md`, `review-final-grok.md` | completed |

Route cards:

- Lane V. CLI: Codex. Model: GPT-5.6 Terra. Effort: high. Reason: bounded verification of landed
  work; the result drives a bookkeeping close. Fallback: Sol high.
- Lanes A and B. Model family: GPT-5.6 Sol at high (research reports supplied to the orchestrator).
  Reason: dense per-fact live verification whose result drives a metadata edit. Workers never edited
  repository files.
- Lane R. Model: Grok 4.6 at high. Reason: vendor-diverse blind re-derivation and adversarial review;
  differs from the authors (Sol, Terra) and the orchestrator (Fable). Effort stayed at high.

## Evidence

Source classes follow `golden-truth` Step 2. Every keyFact of every touched case carries one dated
`Live re-check 2026-08-31` line with one URL and the second class named in text; the full URL and
quote inventories are in the mirrored lane reports.

- **P1 verification (54 ids).** Lane V and the orchestrator cross-check agree: the 47 dead-provenance
  ids pass all four checks (no class-1 path; `truth.verified` dated 2026-08-30 with the round name and
  the TODO pointer; one `Live re-check 2026-08-30` line per keyFact; a sibling-sweep line). The 7
  high-stakes ids carry their own lane names and TODO pointers by design, and their landed
  dispositions were confirmed (asOf values, rows, the July 8 / July 11 split, the 183 / 64 / 31
  counts, `reverifyBy` 2026-11-20, the sd-045 caution). Re-walk of the 12-id sample: 52 URL records,
  51 HTTP 200, 1 HTTP 403 (SEC EDGAR blocks automated clients), 40 phrase matches, 11 records the
  worker could not phrase-match. Orchestrator triage of those 11: 9 were phrase-match misses on true
  claims (re-confirmed by direct fetch or class-F recomputation), 2 were unverifiable by automation
  (SEC filing). No broken URL. Three findings came out of P1: the stale `~3-5s ledger close.` sentence
  in `golden.notes` of `q-protocol-ledger-close-time`; the single-class 2026-08-30 row on
  `q-comp-finclusive-caas`; the missing `sd-046` link on `q-protocol-base-reserve-min-balance`.
- **Lane A (retail, 23 cases, 52 keyFacts).** 20 confirmed, 31 confirmed-as-of, 1 disputed
  (`q-raph-lobstr-legitimacy` keyFact 5, on the restore article's "trusted services" sentence).
  Classes A (Stellar Docs, stellar.org, LOBSTR, Ledger, Kraken, Circle), B (stellar-xdr, CAP-0023,
  CAP-0035, SEP-0005, SEP-0006, SEP-0029, stellar-core op frames at pinned commits), D (FBI, CISA,
  Apple lookup, dated sweeps), F (Horizon ledger, transaction, account, claimable-balance, and asset
  probes).
- **Lane B (events and n3, 14 cases, 49 keyFacts; D1 proposer).** 35 confirmed, 14 confirmed-as-of,
  1 unverifiable (`q-scf-round-43-results` keyFact 5), 1 contradicted (D1 keyFact 1, on the full
  5–9 s observed range). Classes A (CME, DTCC, SDF, Meridian, HackMeridian, Circle, Stellar Docs),
  B (stellar-protocol CAPs and SLPs, x402-stellar, this repository's architecture and manifest),
  C (Scout as a non-origin witness; Horizon), D (CoinDesk, FX News Group, Crossmint, Gate, rekt.news,
  dated sweeps), F (`stellar network settings -n mainnet`, Horizon protocol boundaries).
- **Blind D1 (Grok).** Validators README (blob `37f879807c150e794578e80d2e751597938f8423`) says
  "every 3-5 seconds"; Stellar Stack (blob `06c92f8dbcd2f30e0f855bd18bf7abbc3c9e9713`) says "every
  5-7 seconds"; raw MDX, rendered HTML, and the docs index all carry both. Horizon sample
  64209159–64209358 at 13:10:23Z: 199 deltas, min 5 / max 9 / median 6 / mean 5.693 s. CAP-0070 and
  `NetworkConfig.h`: target 5000 ms, range [4000, 5000] ms (a bound on the configured target, not on
  observed closes). Lane B's second sample 64209225–64209424 at 13:16:30Z: min 5 / max 9 / median 6 /
  mean 5.688 s. Both lanes: conflict persists, no caution, finding has evidence. Lane disagreement on
  D1 keyFact 1 resolved on the evidence: the 5–7 band holds 196–198 of 199 deltas in both samples and
  the answer says "roughly", so the keyFact stands as confirmed-as-of and the notes name the rare
  8–9-second deltas.
- **Blind LOBSTR (Grok).** Every source-relative keyFact confirmed (KF1 confirmed-as-of 2026-08-31;
  KF3 as owner-docs attribution, with an encrypted server copy also documented; KF4 confirmed, the
  July 10, 2026 migration deadline passed and the exception still documented; KF5 confirmed as owner
  wording). "Trusted services" is ordinary English, not a product, which resolves lane A's dispute.
  The blind lane's extra metadata-control claim is not a keyFact and was not added. Orchestrator
  spot-checks: lobstr.co/terms (Ultra Stellar OÜ, unaffiliated with SDF), Apple lookup (ULTRA STELLAR,
  LLC 15.6.0, 2026-08-19), the security article's on-device decryption sentence.
- **Blind SCF #43 (Grok).** Official recap 2026-06-02 (Medium RSS `pubDate`), 85 submissions, 29 /
  $3,139,069 (recap and X post 2065181135135559896), 10 Open + 19 Integration, no RFP recipient. Live
  dashboard `Awarded` paid-state view at 13:52Z: 28 cards, $3,049,069, 12 Not Awarded, 21 Panel
  Review Failed, Bexo Wallet ($90,000) absent, 3,139,069 − 90,000 = 3,049,069. Orchestrator reproduced
  the 28/12/21 counts and Bexo's absence at 14:02:06Z. Public archives of an earlier dashboard
  snapshot are unavailable; the live view is verifiable today.
- **FinClusive second class.** Class D sweep → DFPI-hosted 2022-08-01 FinClusive comment letter:
  Regtech/Fintech TPSP description and a dated FinCEN MSB registration statement. Federal registration
  is not state licensing, so it coexists with the current "not a licensed Money Services Business"
  wording and does not establish a license (already guarded by the avoid item).
- **Sibling sweeps.** One fresh grep per touched case with the lane's terms; hit counts and the read
  siblings are recorded in each case's `Sibling sweep 2026-08-31` line. No sweep changed a verdict.

## Applied changes

- **P2 bookkeeping.** TODO: the three Goldens items rewritten to the true remainder, then closed as
  the work landed; a new "File `sd-047`" item. NEXT: state bullets, block 1, block 6, owner decisions.
  2026-08-30 ledger: `## Outcome` appended with the `cluster-136` hackathon decision (both added
  `scout.hackathonBrief` cases sit in that one cluster with `q-gap-contracts-domain-empty`; no SCF
  cluster gained a member), plus dated follow-up lines.
- **S1 verified touches, 37 of 37 files.** 35 in the first pass (`s1-applied-lines.json` holds the
  applied lines and sibling terms), then `q-raph-lobstr-legitimacy` and `q-scf-round-43-results`
  after the blind re-derivations. Per case: temp lines → the exact lane replacement line
  (`Independent Lane A|B review (temporary path, unrecoverable); its claims were re-verified live on
  2026-08-31 — see the Live re-check lines.`), one `Live re-check 2026-08-31` line per keyFact, a
  `Sibling sweep 2026-08-31` line, `truth.verified.date` 2026-08-31, `by` naming this round and lane,
  and the TODO pointer in `rootCause`. Bare-relative scan → 0. `solo://` lines unchanged.
- **Judge-facing changes (3), each stamped in the same diff.**
  `q-protocol-ledger-close-time`: `golden.notes` now carries only current guidance (roughly 5–7
  seconds by dated samples with rare 8–9-second deltas; the Bitcoin/Ethereum trap; the SCP closeTime
  hint; the citation hint); answer, keyFacts, avoid unchanged; new `confirmed-as-of` row for the two
  2026-08-31 samples (C, F, B); 2026-08-31 A and B evidence on the contradicted 3–5 row.
  `q-raph-lobstr-legitimacy`: answer date `as of 2026-07-11` → `as of 2026-08-31`; storage language
  stays source-relative; `truth.asOf` 2026-08-31, `reverifyBy` 2026-11-30; three dated rows.
  `q-scf-round-43-results`: answer, keyFact 5 ("Ranks the official 29 / $3,139,069 recap above the
  dashboard's 28 / $3,049,069 view" — one predicate; the compiler caps keyFacts at five), avoid item
  4, and a notes addendum label 28 / $3,049,069 as the dated dashboard `Awarded` paid-state view as of
  2026-08-31 and keep 29 / $3,139,069 as the official selection result; `tags.freshness` → `scheduled`,
  `truth.asOf` 2026-08-31, `reverifyBy` 2026-12-10; `status` stays `disputed`.
- **`sd-047`** (`improvements/stellar-docs/sd-047-validators-ledger-close-cadence-conflict.md`,
  `docs-content`, `verified`, discovered 2026-08-31): the two-page wording conflict, raw blob ids, the
  two Horizon samples, the CAP-0070 and `NetworkConfig.h` target range, docs-index hits, no existing
  issue or PR, and the mutual case link. Not filed upstream.
- **Gaps.** `q-comp-finclusive-caas`: class D evidence on the 2026-08-30 row.
  `q-protocol-base-reserve-min-balance`: `rootCause` names `sd-046`; `sd-046` evidence names the case.
- **Decisions.** `solo://` references are retained historical dated records under `AGENTS.md` and are
  never rewritten. `q-protocol-ledger-close-time` gets no canonical-page caution under ADR-0008; the
  advisory `symmetric-caution` lint warning is accepted.
- **Register.** First pass: 15 reopens (8 clusters, 3 numeric invariants, 4 date-contingent traps);
  `cluster-017` and `cluster-065` re-read member by member (no member states a cadence figure);
  13 closed as truth-only. Second pass: 3 reopens (`cluster-122`, invariant "SCF #43 official total",
  the SCF #44/#45 date trap) re-read member by member (no member pins a round-43 figure); the invariant
  rule now says "dated dashboard payment/card states" instead of "transient". Review-fix pass:
  `cluster-017` and `cluster-065` again, closed with a same-day reason. Each closure carries a dated
  `reSwept` reason; `reopened` markers removed; final `up to date; 0 reopened`.
- **Generated files** from their scripts: `eval/qa/cases.json`, `eval/qa/sample.json`,
  `eval/qa/lifecycle-registry.json` (`eval:qa:compile`), `eval/qa/consistency-register.json`
  (`eval:qa:register` plus closures), `improvements/INDEX.md` (`improvements:index`).
- **Affected ids** (`affected-case-ids.md`): 40 case files — 3 judge-facing, 37 truth-only.
- **Artifact hygiene.** Transient helpers removed from this directory after the review (`apply-s1.py`,
  `orch-checks.py`, `v-checks.mjs`, `v-rewalk.mjs`, `brief-v.md`); their results survive in
  `v-checks.json`, `v-rewalk.json`, `v-report.md`, `s1-applied-lines.json`, and `sample-12.txt`. The
  fresh sibling-grep JSON stays out of the repository because gitleaks flags a case-id list inside
  it; every applied sibling line is in the case files.

## Gates

Final run after the review fixes, base `35b5a38`, all exit 0:

- `npm run eval:qa:compile` → 500 cases, sha256 `0bb7be5b…`.
- `npm run eval:qa:register` → `up to date; 0 reopened`.
- `npm run eval:qa:lint -- --since 35b5a38 --stale` → `0 error(s), 61 warning(s)` (60 audited
  advisory warnings + the accepted `symmetric-caution` on `q-protocol-ledger-close-time`).
- `npm run improvements:index` and `npm run improvements:lint` → `improvements lint ok (69 findings)`.
- `npm run eval:plan -- eval/qa/results/2026-08-30T03-43-11-variantA.json` → grades unchanged
  (required covered 40 correct / 40 partial / 13 wrong / 0 error of 93; broad→detail used 2/3/2/0,
  skipped 10/16/2/0).
- `git diff --check` → clean.
- `npm run secrets:scan -- --tree` → clean (+ gitleaks); `gitleaks dir` on this ledger, this
  directory, and `sd-047` → 0 leaks.
- Final baseline after the review fixes: `npm run typecheck` clean; `npm test` 96 files, 1515 passed;
  `npm run build` dry run 7038.90 KiB. Narrow tests (`qa-corpus-lint`, `qa-golden-max-tx`, `qa-strkey`,
  `improvements-resolve`) passed 36 tests after the corpus edits. No application code changed.

## Review reconciliation

`review-final-grok.md` (Grok 4.6 high, reviewer ≠ author): `APPROVE-WITH-FIXES`, four findings.

1. **F1 (High) — `sd-047` overstated CAP-0070.** Fixed: the finding and the case corroboration notes
   now state only that the configured target cannot be set below 4000 ms and that the samples had no
   delta below 5 s; no text claims a 3-second observed close is impossible.
2. **F2 (Medium) — undocumented third Horizon window.** Fixed: the window 64209241–64209440 was
   removed from the case evidence, the corroboration row, and `sd-047`; only the two mirrored samples
   remain (blind lane 64209159–64209358; lane B 64209225–64209424).
3. **F3 (Medium) — stale NEXT handoff.** Fixed: 69 findings and 61 warnings with the accepted
   `symmetric-caution` named; the suggested sequence now starts with reconciling this review, the
   commit, and the `sd-047` filing.
4. **F4 (Low) — accretive `golden.notes`.** Fixed: the GT-32 correction narrative was dropped; the
   notes carry only current guidance (stamped as a gospel change with evidence and rootCause).

Orchestrator audit findings repaired in the same pass: this ledger had been truncated by an editing
error and was rewritten as one complete record; TODO no longer says a caution owner decision remains
in NEXT (the no-caution ADR-0008 decision is recorded instead); transient helper scripts were removed
from the artifact directory.

`review-final-followup-grok.md` rechecked F1 through F4, the rebuilt ledger, the route cards, TODO,
NEXT, and the helper removals. Its verdict is `PASS`, with no remaining findings.

## Outcome

- **Lane V:** PASS after triage — 54/54 landed ids meet their bar; 12/12 sampled cases re-walkable;
  50/52 URL records confirmed, 2 blocked for automated fetch.
- **Lanes A and B:** 37/37 S1 files repaired through verified touches (35 on the lane reports, 2 after
  blind re-derivation). Bare-relative temporary paths in the battery: 0.
- **Lane R:** three blind re-derivations agree with the applied gospel; final review
  `APPROVE-WITH-FIXES`; all four findings were repaired and re-gated; follow-up review `PASS`.
- **D1:** conflict confirmed by two lanes; `sd-047` `verified`; stale note superseded; no caution
  (ADR-0008).
- **Gaps:** both closed. **Hackathon decision:** recorded from `cluster-136`.
- **Affected ids:** 40 files (3 judge-facing, 37 truth-only), listed in `affected-case-ids.md`.
- **Remaining work:** commit the round on `next/golden-metadata-remainder`; file `sd-047` through
  `improvements:file` (TODO item); the SEC filing link on `q-defi-wisdomtree-crdt` stays verified only
  by its 2026-08-30 line; pane `w1W:p5` (`gmr2-terra-v`) is idle and open.
