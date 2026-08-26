# QA miss analysis — where the errors and failures come from

Date: 2026-08-25. Round: `.agents/rounds/2026-08-25-qa-quality-deep-dive.md`.
Question: the headline QA score sits near 65% half-credit. Where do the misses come
from, are they consistent, and are they legitimate?

Method: five max-effort lanes analyzed the same evidence base independently, plus
orchestrator live probes through Raven itself. Lane reports live beside this file in
`research/qa-deep-dive-2026-08-25/`:

| lane | report | assignment |
| --- | --- | --- |
| Claude Fable (`fable`, effort max) | `fable-max.md` | golden-truth legitimacy + judge audit, all 55 misses |
| Codex (`gpt-5.6-sol`, max) | `sol-max.md` | pipeline stage forensics off transcripts |
| Grok (`grok-4.6`, xhigh) | `grok-xhigh.md` | assumption attack + independent re-answer of 10 goldens |
| Codex (`gpt-5.6-terra`, max) | `terra-max.md` | service coverage gap map against the committed manifest |
| OpenCode (`moonshotai/kimi-k3`) | `kimi-k3.md` | external SOTA survey + fresh-eyes cold audit of six failed cases |

## 1. What the number actually is

- Latest full 100-case run (`eval/qa/results/2026-08-14T03-56-23-variantA.json`,
  answering and judging model `claude-sonnet-5`, rubric `v2.4`, pack `p3`):
  **45 correct / 39 partial / 15 wrong / 1 error** → 64.5% half-credit, 45% strict.
- Rejudge four days later (`2026-08-18T22-04-13-rejudge.json`, pack `p5`,
  non-identical goldens): **40 / 46 / 14**, 17 flips.
- Full-battery reviewed record (`eval/qa/README.md`, 497 cases):
  **187 / 226 / 84** → 60.4% half-credit, 37.6% strict.
- The "~65%" figure is therefore the optimistic sample; the owned battery sits lower,
  and every number carries a ±3–4 point judge-noise band (section 4).

The score is checklist coverage: an LLM judge walks each case's key facts and
must-avoid traps. It is not a user-quality measure. Two lanes independently concluded
that treating it as one distorts the improvement conversation (Grok §1, Fable §7).

## 2. Where the misses come from — three taxonomies, one story

All three forensic lanes classified the same 55 non-correct rows independently.

**By pipeline stage** (Sol, transcript-level):

| stage | rows | share |
| --- | ---: | ---: |
| A — search failed to surface a carrying op | 2 | 3.6% |
| B — execute misused (wrong args, unread top hit, envelope mistakes) | 6 | 10.9% |
| C — output lost inside the sandbox projection | 3 | 5.5% |
| D — multi-hop composition broke (one evidence role covered, another dropped) | 9 | 16.4% |
| E — answerer failure (evidence reached the model; prose squandered it) | 15 | 27.3% |
| F — no exposed source carried the fact | 20 | 36.4% |

**By root cause** (Fable, golden/judge-aware):

| class | rows | fair verdicts if fixed |
| --- | ---: | --- |
| ANSWER-FAIL | 19 | 19 partial |
| CONTENT-GAP | 12 | 4 wrong, 8 partial |
| JUDGE-HARSH | 11 | 6 correct, 5 partial |
| GOLDEN-WRONG (authoring defects, not Stellar errors) | 9 | 7 correct, 2 partial |
| RETRIEVAL-MISS | 2 | 2 partial |
| BY-DESIGN trap misgraded | 1 | correct |
| HARNESS-ERROR | 1 | excluded |

**By exposure status** (Terra, against the committed manifest): EXPOSED carrier exists
for 31 rows (56%), upstream lacks the fact for 22 (40%), one unexposed Scout write op,
one genuinely-nowhere (SSRF). Failure classes: content 38, contract 15, routing 2.

### Convergent finding 1 — retrieval is almost never the failure

Sol stage A = Fable RETRIEVAL-MISS = Terra routing = **the same 2 rows**
(`q-anchor-sdp-vs-anchor-platform` second-hop page; `q-tool-sep41-status-live` SEP
preamble via an unread skill). Kimi's independent cold audit agrees: retrieval was
adequate on 4 of its 6 audited misses. Orchestrator live probes agree: base-reserve
docs rank first and carry the content; the Scout wallet roster enumerates cleanly
today. Any plan that starts with "fix search ranking" attacks ~2 of 55 rows.

One adjacent, distinct surface failure does exist and is cheap to fix: **the MPP
discovery mechanism is invisible in model-visible text**. No manifest description,
skill-section description, or keyword carries "OpenAPI", "x-payment-info", or
"advertise that agents can pay" (Kimi grep-verified). The answering model filled the
gap with a plausible wrong claim — a description-text fix, not a ranking fix.

### Convergent finding 2 — the biggest masses are answer discipline and source truth

- Answer-side (E + parts of D/B/C): the transcript shows dates, exact types, formulas,
  or source conflicts present in context that the final prose dropped, rounded
  ("September 2025" vs 2025-09-18), flattened, or contradicted.
- Source-side (F ≈ Terra's UPSTREAM-LACKS): stale pinned skills (fixed upstream
  2026-08-19 as `sk-016`/`sk-017`), unindexed RPC reference pages (`sd-003`), docs
  pages that contradict Core (`sd-042/043/045`), undocumented flags (`sd-044`),
  missing entity coverage (CRDT, `ll-012`), and whole domains no exposed operation
  carries (vendor/issuer facts, advisory/CVE maps, research-grant page).

### Convergent finding 3 — the `wrong` bucket is mostly a measurement artifact

Only ~4 of the 16 wrong/error rows survive a corrected golden plus a calibrated judge
(Fable §6 step 1–2: 60/36/4). Grok independently contests 6 of 15 wrongs as
docs-faithful answers punished for quoting live official pages (Horizon lifecycle,
Freighter HTTPS, RPC limits wording, passkey-kit guidance, SCF v7 blog wording,
wallet-roster ritual). Both lanes also agree a small hard core is genuinely wrong:
the CRDT confident-denial, indexer alias fabrication, custodial C-address gaps.

## 3. Are the misses legitimate? Case-level legitimacy ledger

Combining all lanes' per-case work:

| legitimacy bucket | n (of 100) | meaning |
| --- | ---: | --- |
| Genuinely wrong answer, legitimately scored | ~5–7 | fabrications, denials, real omissions on compound facts |
| Right core, docked for depth/completeness (fair partials) | ~20–24 | legitimate partials; recoverable by answer discipline + sources |
| Docs-faithful or dispute answers scored wrong/harsh | ~10–11 | golden encodes a dispute with official docs; needs symmetric caution or golden repair |
| Golden authoring defect (self-referential snapshot dates, negative-claim key facts, contradictory notes) | ~9 | measurement debt, not product debt |
| Judge miscalibration on otherwise-covered answers | ~11 | boundary noise + rubric clauses since removed (v2.6+) |
| Harness artifacts (error graded as wrong; golden refreshed after collection; local-skill leak) | ~4 | pure instrumentation |
| Time-bomb cases (answer was correct on collection day) | ~2 | SCF round phase moved under the saved answer |

Notable specific illegitimate-or-contested findings worth reading in full:

- **Garbled golden identifiers**: the WisdomTree CRDT golden's issuer/SAC addresses do
  not match live Horizon/stellar.toml (Grok verified character-by-character;
  `grok-xhigh.md` §2). This golden would fail against reality today.
- **Boilerplate dating key facts**: 19 of 31 live cases carry "makes the as-of date
  visible" style key facts. Correct rate with them: 26%. Without: 83%
  (Fable §3). The answering prompt never asks for dates.
- **Compound key-fact cliffs**: wrong rows average 3.6 key facts / 373 characters vs
  2.56 / 245 for correct rows; 12 misses hinge on a single sub-clause.
- **Must-avoid items binding on true statements**: e.g. the SEP-41 wrapper typed
  `to: Address` compiles (`MuxedAddress: From<&Address>`), yet binding it as wrong
  flipped a fully-covered answer two levels (verified against docs.rs).

## 4. Consistency: how stable is the measurement?

- **Identical-input judge flip rate: 9.6% per row.** A second full p5 rejudge exists
  (37 minutes before the recorded one) on byte-identical prompts for 94 rows; the two
  passes disagree on 9. Historical README noise floor: up to 23% any-flip.
- **The famous 17 flips decompose into five mechanisms** (Fable §4): 8 systematic
  evidence-pack changes (p3→p5 grew packs 2.3–4.5 KB and the judge invented new
  omissions), 5 pure sampling noise, 2 goldens edited after answer collection, 1
  initial-pass outlier, 1 harness error graded as wrong. Only 1 flip happened on a
  truly identical prompt.
- **Boundary concentration**: 27% of wrong rows move to partial when rejudged on
  identical prompts; stable rows almost never move. The judge is noisiest exactly
  where the score lives.
- **Structural causes with line references** (Fable §5): no temperature/seed control
  (`judge.mjs:234-238`), conflicting omission clauses in v2.4 (since fixed in v2.6),
  pack-before-answer anchoring (`judge.mjs:130-148`), avoid items that punish
  phrasing instead of false claims, trap-precedence gap, rejudge harness lacking the
  `hasSuccessfulAnswer` guard (`re-judge.mjs:407-447`), and `--allowedTools` not
  blocking built-in Skill/ToolSearch tools (2 rows contaminated by local skills).

Bottom line on consistency: the headline number has roughly a ±3–4 point band from
judge sampling alone. Movement smaller than that is not evidence of anything.

## 5. What this means for "get closer to 100%"

Decomposition of the 35.5-point gap (Fable §6 ceiling table, cross-checked against
Sol's stage ceilings and Grok's refusal-to-launder analysis):

| lever | half-credit gain | nature |
| --- | ---: | --- |
| Fix judging + harness + golden authoring (same answers rescored) | +13.5 → ~78% | measurement honesty |
| Bank already-shipped upstream fixes (skill re-pins) + filed docs repairs land | +6 → ~84% | upstream truth |
| Second-hop retrieval + multi-clause composition support | +1 to +5 | product |
| Answer-discipline loop (verify-every-sub-question, keep dates/exact types) | +4 to +6 | product |
| Hard floor: genuinely unanswerable through the exposed surface today | −4 to −6 cases | doctrine-bound |

Two honest readings coexist and the round does not hide either:

1. **Fable's**: ~89–91% is reachable on this battery if measurement debt is paid,
   upstream fixes land, and answering discipline improves.
2. **Grok's**: promising 100% on a 5-key-fact checklist judged by the same model
   family, against goldens that pin live phases and encode docs disputes, is a
   promise about the meter, not the product. The defensible quarter target is
   hygiene + one or two general mechanisms (~68–75% half-credit, strict 45→52%),
   with a parallel "usable answer" panel as the user-truth number.

Both readings agree on the action list for the first month; they disagree on what
number to promise. See `research/qa-improvement-plan-2026-08-25.md`.

## 6. Orchestrator live-probe receipts (2026-08-25)

- `stellarDocs.search_docs("base reserve minimum balance")`: six hits led by the
  Lumens/Base reserves and Accounts pages; content states "One base reserve is
  currently 0.5 XLM". Routing and content healthy; the saved miss came from the docs'
  own liability-in-formula ambiguity (`sd-043`) tripping a must-avoid trap.
- `scout.searchProjects({query:"wallet"})`: 20 wallet projects returned cleanly.
  The roster is enumerable; the saved miss was projection metadata loss (dropped
  `generatedAt`) plus roster-ritual key facts, not discovery.
