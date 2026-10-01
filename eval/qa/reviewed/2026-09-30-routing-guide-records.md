# Retained eval/README.md records — 2026-09-30

These sections preserve dated evidence cited by current artifacts.
Their wording describes each recorded run, not the current system.
Source guide: `eval/README.md` at merge commit `49e04c16`.

## Re-baseline (2026-07-04, issue #2): stellar-light 1.4.4 drift

Same-day follow-up to the ADR-0003 re-baseline (commit `b62938a`): the daily live-drift CI caught
the upstream stellar-light OpenAPI 1.3.2 → 1.4.4 refresh — additive response-schema fields on
existing ops, upstream description rewords (`searchResearch` trimmed to "security incidents"
phrasing), docs-titles refresh. No operation added/removed, no exposure decisions.

Run: `routing-2026-07-04T15-58-31-434Z.json` (grading rule v3; **current baseline** in
`eval/gates.json`).

| scope | rule | top-1 | top-3 | top-5 |
|---|---|---|---|---|
| legacy 338 (prior gate, ADR-0003 above) | v3 | 203 | 265 | 303 |
| legacy 338 (**new gate**) | **v3** | **213** | **267** | **303** |
| skills lane 23 (floor unchanged) | v3 | 18 | — | — |

Reading notes:

- **+10/+2/0 is upstream description quality, not our scoring**: 14 scout improvements from the
  richer 1.4.4 descriptions vs 8 strict regressions, 7 of which hold under accept-either (grading
  severity, not ranking); only `q-edge-inject-ignore-instructions` truly drops (top3→top5).
- Agentic-verified **before** the re-baseline (30-case Sonnet low+med effort): overall primary low
  70→76.7%, med 73.3→80%; docs 100% unchanged. Full decision record in the `note` field of
  `eval/gates.json`.
- Gate verdict: this is the current gate — `--gate` enforces legacy within ±1% of 213/267/303 and
  the skills lane floor 18/23, under gradingRule `v3-manifest-exposed`.

## Round 844 (2026-07-06, todo 844): real-user lane + alias lever shipped (lever 6)

The round-5e alias lever was blocked on an instrument, not on merit. This round built the
instrument: a **real-user routing lane** mined from the retired raven-golden-qa raw jutsu pool
(25,875 genuine user questions, 2025-11→2026-02 — months before round 5, so independence from
the lever is inherent).

**Lane construction** (local-only: `eval/local-lanes/jutsu-real-user/`, gitignored — derived
from the privacy-sensitive raw pool at `~/Desktop/raven-golden-qa/jutsu_stellar_questions_export/`;
regenerate with the scrub script recorded in the Solo round log): drop seed/email-bearing +
<2/>60-token + duplicate messages → 222 alias-register questions (contain tx/txn/txs/acct/addr;
the offline corpus has 10 total) + 250 random control. **Labels:** dual independent Fable passes
(labelers saw question + service charters only — never search results or the scorer), 96.6%
agreement, 16 adjudicated; distribution stellarDocs 337 / none 96 / scout 26 / skills 8 /
lumenloop 6. `none` (out-of-gateway-scope) cases are skipped at grading.

**Baseline vs lever (strict / accept-either, top-1·3·5 of graded cases):**

| group | pre-lever strict | post-lever strict | pre AE | post AE |
|---|---|---|---|---|
| alias (n=213) | 72·135·173 (33.8/63.4/81.2%) | **87·154·179 (40.8/72.3/84.0%)** | 82·142·178 | **97·159·184** |
| control (n=163) | 67·106·128 | 67·106·128 (byte-identical) | 85·122·139 | byte-identical |

The alias register routed **7.3 points worse** than control at strict top-1 pre-lever; the lever
closes that entire gap (+15/+19/+6 strict), while the control group and every offline lane are
byte-identical (legacy 213/268/305, extended 79/104/110, skills 18/22/22 — GATE PASS, no
re-baseline). Unlike the offline corpus (extended AE top-5 = 100%), this lane is unsaturated
(top-5 81–86%), so it becomes the target metric for future retrieval work alongside the legacy
non-regression gate.

**Shipped:** `QUERY_TOKEN_ALIASES` + `canonicalizeQuery` + max-of-two-queries scoring
(scoring.ts lever 6) — the exact round-5e design (same 5 vetted pairs; amm/dex/defi/nft/etc.
remain excluded as load-bearing catalog vocabulary). Unit tests pin the no-op path, token-only
substitution, and the register bridge.

## Round 806 (2026-07-06, todo 806): codemode.skill.run A/B — ship decision

The `codemode.skill.run` ship gate from `research/skill-run-design.md` §10, run exactly as
designed: instruments first (commit `eb412bd` — ranked-id dump, whole execute results,
composition analyzer, plan-grader recognition, the two opt-in live-digest supplement cases),
BEFORE lanes on that instrumented main, feature commit `f99be10`, AFTER lanes same day, same judge, same
rubric (v2.1). QA result stamps live in `eval/qa/results/`, routing runs in `eval/results/`
(both git-ignored/local-only, so this section is the durable record).

**Routing neutrality (gate part 1, both halves green):** the per-case ranked-id dump on the
feature build diffs **EMPTY** against the settled-main baseline
(`eval/results/ranked-baseline-806.json`) — rank/membership identity proven directly, the true
invariant (runnable-skill hits gain `signature` by design, so byte identity was never the
claim). `eval:routing -- --gate` **PASS** against the unchanged 2026-07-04 baseline
(`routing-2026-07-07T00-34-41-282Z.json`), no re-baseline.

**QA verdicts (gate parts 2–4):**

| lane | BEFORE | AFTER |
|---|---|---|
| targeted `--ids` battery (6 cases: 5 dossier-shaped incl. the fabrication trap + 1 digest-shaped) | 4 correct / 1 partial / 1 wrong (`2026-07-06T20-41-52-variantA`) | **6 / 0 / 0** (`2026-07-07T00-38-53-variantA`) |
| canonical + digest supplement (12 cases = membership-frozen 10 + opt-in 2, historically run from one then-combined file; not a canonical-lane denominator) | 11 / 0 / 1 (`2026-07-06T20-51-40-variantA`) | 11 / 0 / 1 (`2026-07-07T00-47-30-variantA`) — the **same pre-existing wrong** (`q-live-hackathon-recent-winners`), unrelated to the feature |

**Composition** (`analyze-composition.mjs`, ids battery): mean turns 4.83 → 4.5, execute
scripts 8 → 7, constituent op calls 24 → 21 (skill.run calls expanded through declared ops for
comparability), truncated-input cases 1 → 0. Canonical + digest supplement: mean turns 5.83 → 5.0, op calls
60 → 53, execution failures 2 → 0 — but execute scripts went **up** 22 → 25, so read the
combined-lane composition delta as mixed, not a win.

**Adoption, per runner — the honest split:**

- **Digest: 2 of 3 digest-shaped cases adopted** `codemode.skill.run`, both single-script,
  both correct: `q-edge-fresh-most-recent-news` (ids battery) and `q-live-digest-rwa-recent`
  (digest supplement). The third (`q-live-digest-blend-coverage`, also supplement) answered
  correctly without it.
- **Dossier: 0 of 5 dossier-shaped cases adopted.** All 5 were answered correctly via manual
  op composition in the AFTER run — which means the ids-battery verdict flips
  (`q-defi-phoenix-scf` wrong→correct, `q-scf-history-soroswap` partial→correct; both were
  fabricated per-round SCF breakdowns in the BEFORE) are **NOT attributable to the feature**.
  Stated plainly: the 6/0/0 headline satisfies the non-regression + improvement gate, but the
  improvement rides on run-to-run agent/judge behavior on the fabrication traps, not on
  dossier-runner usage.

**Verdict (design §10.5 ship rule): SHIP-APPROVED.** Ranked-id diff empty AND gate green AND
verdict non-regression AND a real composition delta on the targeted battery (fewer scripts,
fewer op calls, fewer turns) — with adoption demonstrated for one of the two runners. The
**per-runner adoption gap is the named follow-up**: dossier-runner surfacing (description /
signature prominence for dossier-shaped questions) needs its own round; §10.4's zero-adoption
do-not-ship rule was cleared by digest adoption, not blanket adoption. Deploy was held at
decision time for an unrelated merge-train window — ship approval and deploy timing are
separate facts.

### Round 806 postscript (2026-07-07, todo 849): dossier runner retired, digest confirmed

The adoption follow-up resolved by measurement (full trail in todo 849 + the design doc §10
postscript): three surfacing levers all failed the no-regression bar, the dossier runner was
retired (962a71c, retrieval-neutral by ranked-id proof), and a third 6-case battery run
(`2026-07-07T02-28-31-variantA`) confirmed the digest runner's adoption reproduces (1/6 = the
digest-shaped case, single-script, both keyFacts) while no transcript ever touched the dossier.
That run's headline 4C/1P/1W calibrates to ~5–6C: the wrong is a live-proven judge artifact —
every "fabricated" award label and the "invented" fourth submission are verbatim
`get_scf_submissions` rows (todo 853; transcript-blindness class) — and the partial dinged the
adopting case only for a missing honesty-caveat phrase with both keyFacts satisfied.

## Skills-form A/B (2026-07-13, todo 890): sections leave search — SHIPPED

The full program record (R1 evidence / R2 pre-registered design / R3 form-factor + prior art,
P2 synthesis, offline screen, grok-4.5 pre-spend adversarial review + reconciliation, paid
round, P4 decision) lives in Solo scratchpad `skills-program-how-r--608`. Summary: four
manifest arms differing only in the skills search representation (A current, B sections
`searchable:false`, C all skills out of search, D section vocabulary distilled onto parents),
built by `scripts/build-catalog.mjs --skills-form`, served sequentially through the Solo dev
process under a SHA-verified swap/restart/probe procedure after the pre-spend review proved
disk hash ≠ served catalog without it.

Offline screen: D eliminated (recapture hazard confirmed: parent keyword bags at full kind
weight, interloper top-1 59 vs B's 56); C banked (+30/−1 legacy but kills the skills lane by
design); **B advanced** (legacy strict 205/272/305 → 209/285/316, skills lane at floor 18/23,
extended/overlay improved, capture 68→56 top-1 / 278→214 top-5, deterministic discovery
one-shot + replay improved). Paid round, counterbalanced 3× paired blocks: QA-30 **A
39C/42P/9W vs B 41C/42P/7W** over 90 gradings/arm; stable per-case wins 3–1 for B; skills
stratum flat (OpenZeppelin correct 6/6 — whole-skill discovery carries the load-bearing case);
carried live-v2 ten: B zero wrongs across 3 runs; agent discovery: B ≥ A on every overall
metric in every run. No pre-registered blocker fired; ledger ~738 top-level jobs under the
850/$228 ceiling.

**Shipped**: `buildSkills` stamps every skill-section entry `searchable:false` (exposed for
`skill.read`/`availableSections`/future arms; out of search scoring, results, and totals).
Whole-skill entries, the runnable digest, the bundle, and all scoring constants unchanged.
Gate re-baselined to `routing-2026-07-13T08-54-21-839Z.json` (209/285/316; skills floor 18 —
q-skill-eco-scout-rwa-landscape moved top-1→top-3). Arm C remains a possible future round from
this baseline; arm A stays buildable for replication.

The honest decomposition — corrected by the grok-4.5 adversarial review (scratchpad 606),
which caught an arithmetic error in the first draft of this record: of the 50 scout losses,
lever 7 recovers **20** (not 42), leaving **30** residual; all 22 capture-relief gains hold
(−50 + 20 + 22 = −8). The full cost is stated, not laundered: legacy scout-scope top-1 falls
67 → 37, printed accept-either top-1 268 → 236, card@5 100 → 89. Extended strict improves
71/101/107 → **85/102/109**, but by composition shift — docs 49 → 81 while scout collapses
22 → 4 — and skills moves 18 → **19**/23/23. The 30 residual cases routed on prose upstream
deliberately deleted, and their distinctive vocabulary does not appear in `x-routing` either,
so no blend setting recovers them (sweep above); several route to plausible alternates
(lumenloop SCF ops on SCF questions, skills on how-to). Accepted as the honest new floor with
the upstream curation gap filed as sls-052, the successor finding to sls-051. Decision record:
`solo://proj/49/scratchpad/drift-issue-21-scout--605`. Baseline result:
`routing-2026-07-12T21-12-46-662Z.json`.
