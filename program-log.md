# Golden-truth burn-down — program log

Branch `lane/golden-truth-burndown-20260827`, base `fadedf6`. Owner: Claude Fable 5 (Herdr pane
`wQ:p1`). Brief: `/tmp/raven-qadeep/own-goldentruth.md`. Rule set: `.agents/skills/golden-truth/SKILL.md`
plus the five non-negotiable truth rules in the brief. rootCause anchor for structural edits:
`.agents/TODO.md` → "Golden authoring lint warnings burn-down".

## Baseline (2026-08-27, before any edit)

`node eval/qa/lint-corpus.mjs`: 0 errors, 1,390 warnings.

| class (lint label) | count |
|---|---|
| key-fact: exceeds 90 characters | 801 |
| key-fact: multiple predicates | 192 |
| key-fact: negative predicate object absent | 131 |
| avoid: presentation/omission | 81 |
| avoid: sourcing-guard/judge-blind phrase | 47 |
| snapshot-date | 12 (11 cases) |
| symmetric-caution | 70 |
| corroboration | 56 |

Only the first six classes in the brief are in scope. Class order: snapshot-date → symmetric
cautions → presentation avoid items → negative predicates → compound predicates → long key facts.

## Crew

Workers: Codex `gpt-5.6-sol` high, `-a never -s workspace-write`, network on, web search on.
Reviewer: Grok 4.6 high (differs from author and owner); Opus high is the fallback.
Panes are recorded per batch below; the owner created every one of them.

## Batches

## Escalations

### E1 — q-sep6-sep24-sep31-choice: keyFact claims SEP-38 was Active (2026-08-27)

Raised by worker gt-sol-a during batch 1. The flagged keyFact reads "SEP-6, SEP-24, SEP-31, and
SEP-38 were Active as of 2026-07-11; ...". The `golden.answer` itself only calls SEP-6, SEP-24, and
SEP-31 Active, so the keyFact overreaches the answer: an eval-side authoring error.

Owner second-source confirmation, 2026-08-27:
- Class B (canonical owner): https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-0038.md
  preamble reads `Status: Draft`, `Updated: 2025-02-26`, `Version 2.5.0`; the last commit touching
  the file is 2025-06-17 (#1740), so the status was Draft on 2026-07-11 as well. The repo README
  table lists SEP-0038 under "Draft Proposals".
- Class D (web sweep, Perplexity search "SEP-38 Anchor RFQ API status"): no source calls SEP-38
  Active; developers.stellar.org pages describe Anchor Platform SEP-38 support (adoption, not status).

Proposed edit (held for reviewer co-sign): split the keyFact into "Dates the Active status of
SEP-6, SEP-24, and SEP-31 to an observation date." and "Adds SEP-38 when quotes or rates are part
of the corridor."; add avoid item "Do NOT claim SEP-38 is an Active SEP; it is Draft."; add a
`contradicted` corroboration row for the SEP-38-Active claim (class B + D); add a dated receipt in
golden.notes; rootCause `.agents/TODO.md` burn-down entry plus eval-side authoring overreach.

### Batch 1 — snapshot-date class (11 cases, 12 warnings → 0)

Crew: workers gt-sol-a (pane wQ:p2) and gt-sol-b (wQ:p3), Codex gpt-5.6-sol high; reviewer
gt-grok-rev (wQ:p4), Grok 4.6 high. Reports: `/tmp/raven-qadeep/gt/report-gt-sol-{a,b}-batch1.md`;
review: `/tmp/raven-qadeep/gt/review-batch1.md`.

Cases: q-builder-justin-rice-history, q-org-sdf-board-directors, q-raph-lobstr-legitimacy,
q-sep6-sep24-sep31-choice (E1), q-ti-openzeppelin-relayer, q-ti-scaffold-stellar,
q-ti-testnet-usdc-faucet, q-ti-video-tutorials, q-tool-freighter-wallet,
q-x402-payment-verification, q-zk-host-functions-status.

Edits: every flagged keyFact lost its snapshot-date literal and now gates the dated behavior
("... to an observation date"); durable content stayed as atomic facts. Owner corrections: dropped
an undated `0.0.26` version pin (registry already at 0.0.27), replaced a bare `Protocol 27` pin with
a dated-observation gate, and merged facts in three cases to respect the 1–5 keyFacts compile bound.
Reviewer verdict: APPROVE-WITH-FIXES — three new facts tripped the compound-predicate rule; all
three were reworded to one predicate. Reviewer independently re-derived the SDF board roster,
scaffold registry version, Protocol 27 on both networks, and x402 facilitators.

E1 (SEP-38 status) — owner second source (class B protocol repo + class D web sweep) and reviewer
co-sign both confirm SEP-38 is `Draft`; the keyFact was corrected, a contradicted corroboration row
and a dated receipt were added, and the avoid list gained "Do NOT claim SEP-38 is an Active SEP".

Lint: 1,390 → 1,365 warnings (snapshot-date 12 → 0; the splits also removed some long/compound
warnings). Register: 4 clusters auto-reopened by member hashes, closed by reSwept events as
form-only. Gates: compile, lint --since fadedf6 --stale (0 errors), typecheck, npm test (1270
passed), build, secrets scan — all green.

### Batch 2 — symmetric-caution class (70 cases, 70 warnings → 0)

Crew: gt-sol-a, gt-sol-b, gt-sol-c (pane wQ:p5, Codex gpt-5.6-sol high), four cases per prompt
(17 chunks; reports `/tmp/raven-qadeep/gt/report-gt-sol-*-batch2-*.md`); reviewer gt-grok-rev,
review `/tmp/raven-qadeep/gt/review-batch2.md`.

Edits: one caution sentence appended to golden.notes per case, naming the disputed claim from the
improvements/ finding in rootCause (finding id or fix date for resolved ones); no keyFacts, avoid,
or answer changed. One case (q-scf-history-soroswap) had an eval-side-only rootCause whose text
merely contained the string "improvements/"; it was reworded ("no upstream finding warranted") and
the reword is recorded in evidence. Workers flagged four cases with six pre-existing keyFacts; those
are compile-time migration exceptions and were left as-is.

Reviewer verdict: APPROVE-WITH-FIXES — 66 PASS, 4 FAIL. Three sd-008 cautions read as excusing a
current "Protocol 26 is Mainnet-current" claim (truth rule 3); one sd-003 caution named the golden
12-method inventory as the disputed claim, which would punish the golden fact. All four sentences
were replaced with the reviewer's exact wording and the fix recorded in truth.verified.evidence.
Reviewer independently confirmed Protocol 27 on Mainnet (software-versions page, Horizon) and
spot-checked six improvements/ files.

Lint: 1,365 → 1,295 warnings (symmetric-caution 70 → 0). Register: 79 entries auto-reopened by
member hashes (78 clusters + the Protocol 27 date trap + one first-seeded numeric invariant) and
closed by form-only reSwept events; the ten clusters already `reopen` at HEAD were left as they
were. Gates: compile, lint --since fadedf6 --stale (0 errors), typecheck, npm test (1270 passed),
build, secrets scan — all green.

### Batch 3 — presentation-avoid class (73 cases, 81 warnings → 0) — in progress

Crew: gt-sol-a/b/c, four cases per prompt; reviewer gt-grok-rev in two parts. Part 1 (24 cases,
chunks 00–05): `/tmp/raven-qadeep/gt/review-batch3-part1.md` — APPROVE, 24 PASS. Twenty-one
rewrites are "Do NOT present/frame X as Y" → "Do NOT claim X is Y"; three omission items were
deleted because a keyFact already requires the content (quoted in the review). Reviewer
independently confirmed the CAP-0068/0069 P23 membership and the 2022 Soroban Adoption Fund date.
Part 2 (30 cases, chunks 06–13): `/tmp/raven-qadeep/gt/review-batch3-part2.md` — APPROVE, 30 PASS.
Seven omission items deleted (each quoted against its covering keyFact); one moved into a new
83-character atomic keyFact (channel accounts). Reviewer independently re-checked the tx_bad_seq
error-handling page and the dated 0.5 XLM base reserve.
Part 3 (19 overlap cases also edited in batch 2): `/tmp/raven-qadeep/gt/review-batch3-part3.md` —
APPROVE-WITH-FIXES, 15 PASS, 4 FAIL on provenance only (`truth.verified.by` still named the
batch-2 worker); fixed. Owner correction: q-ti-secret-key-vs-mnemonic-derivation is a compile-time
migration exception pinned at exactly six keyFacts; the worker's fold to five was reverted and the
reviewer confirmed the deleted omission item is covered by the hardened-path keyFact.

Lint: 1,295 → 1,212 warnings (presentation-avoid 81 → 0; two "without an observation date"
sourcing guards now match the allowed form). Register: reopened clusters closed by form-only
reSwept events; two entries that carried hashes but no verdict at HEAD were stamped `consistent`
with a dated reason; the ten pre-existing `reopen` clusters remain untouched. Gates: compile, lint
--since fadedf6 --stale (0 errors), typecheck, npm test (1270 passed), build, secrets — all green.
