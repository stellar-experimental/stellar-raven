# Golden Q→A answer-accuracy eval — the headline instrument

Measures what the routing evals (`eval/run-routing.mjs`, `eval/agentic/`) can't: does an agent
driving this MCP server end-to-end (**search → execute → answer**) produce a **factually
correct, current, non-fabricated answer** to a real Stellar-ecosystem question?

The battery is **owned**: one hand-authored JSON file per case under `eval/qa/corpus/battery/`,
492 cases as of 2026-08-12, edited directly and reviewed like code. Commit `6e1f979` added two
Soroban cases. Provenance is first-class (`truth` block per case), gospel changes are CI-linted at
the moment of change, and the compiled artifacts are generated + byte-pinned. History — the
vendored-corpus/override era, rubric evolution, and the run archaeology through 2026-07-10 — lives in
[`research/audits/2026-07-qa-history.md`](../../research/audits/2026-07-qa-history.md); the
migration proof is [`reviewed/2026-07-super-corpus-migration.md`](./reviewed/2026-07-super-corpus-migration.md).

## Directory / lane map

```
eval/qa/
  corpus/
    battery/<category>/<id>.json    # THE corpus — one hand-owned JSON per case, 10 category dirs
    live/live-cases.json            # frozen contract live-data-canonical-v3 (15 cases)
    live/live-digest-supplement-cases.json  # frozen contract live-digest-supplement-v2 (2 cases)
    migration-ledger.json           # permanent losslessness ledger (dispositions per source id)
  cases.json  sample.json           # GENERATED battery + stratified sample-30 (CI byte-pinned)
  consistency-register.json         # cross-question contradiction register + numericInvariants
  compile-qa.mjs  judge.mjs  evidence-pack.mjs  run-qa.mjs  lint-corpus.mjs  register-helper.mjs  lib.mjs
  results/                          # local-only run evidence (gitignored)
  reviewed/                         # dated committed review records
```

Categories (= directory names = `tags.category`): `protocol-core`, `soroban`, `tooling-infra`,
`assets-anchors-seps`, `defi-ecosystem`, `scf-grants-builders`, `compliance-rwa-payments`,
`history-org-tokenomics`, `retail-consumer`, `edge-behavior`.

Lanes never merge: the main battery, the canonical live lane (the 15-case live-data-canonical-v3 contract; historically named live-10 before the 2026-07-12 expansion), and the opt-in digest-supplement-2
are separate scopes with separate denominators (`eval/EVALS.md`). The live contracts are frozen
whole-file contracts — `eval/self-test.mjs` asserts contract name, ordered membership, and
`caseContentDigest`; changing live case content requires a version bump and digest update.

## Case schema (`corpus/battery/<category>/<id>.json`)

```jsonc
{
  "id": "q-sor-build-target-wasm32v1",   // == filename; q-* kebab; stable forever
  "question": "…",
  "surface": ["stellarDocs.search_sdk_cli_tools_docs"],  // advisory op/skill ids; NEVER judge/
                                          // agent-visible; non-empty unless service == "none"
  "golden": {                             // EXACTLY what the judge sees. Nothing else.
    "answer": "…",
    "keyFacts": ["…"],                    // 1–5 atomic must-appear facts (pinned migration
                                          // exceptions at 6–7 listed in compile-qa.mjs)
    "avoid": ["…"],                       // concrete wrong-content traps (phrasing linted)
    "notes": "…"                          // optional; rendered under the GRADER NOTES heading
  },
  "tags": {                               // machine branching / stratification only
    "category": "soroban",                // must equal the parent directory
    "service": "stellarDocs",             // stellarDocs | scout | lumenloop | skills | none
    "freshness": "scheduled",             // stable | scheduled | live
    "trap": "paid-bait"                   // optional; value IS judge-visible (interpolated)
  },
  "truth": {                              // judge-blind provenance, first-class
    "domain": "real-world",               // real-world | corpus-grounded | mixed
    "status": "confirmed",                // confirmed | disputed | unverifiable | mixed
    "asOf": "2026-07-11",                 // required when freshness != stable OR status != confirmed
    "reverifyBy": "2026-10-01",           // required when freshness == scheduled; CI stale gate
    "sources": [{ "class": "A", "ref": "https://…" }],  // classes A–F per golden-truth
    "corroboration": [                    // claim rows; required-when rules below; verdicts:
      { "claim": "…", "verdict": "confirmed",  // confirmed | confirmed-as-of | disputed |
                                               // unverifiable | corpus-only | contradicted
        "evidence": [{ "class": "A", "ref": "…", "observedAt": "…" }] }
    ],
    "verified": {                         // LATEST verification event only — git holds the rest
      "date": "2026-07-11", "by": "…", "evidence": ["solo://…"],
      "rootCause": ["improvements/…"]     // required when the event CHANGED gospel;
    },                                    // "freshness-drift" is an allowed explicit value
    "origin": "raven-next q-sor-build-target-wasm32v1"  // lineage; or "authored YYYY-MM"
  }
}
```

Who consumes what (condensed):

| Field | Consumers |
|---|---|
| `question`, `golden.*`, `tags.trap`, `tags.freshness` | **judge-facing** — the prompt renders exactly these (plus the evidence pack); any change is a gospel change under the CI lint |
| `golden.keyFacts` / `golden.avoid` | judge `missingFacts` / `wrongClaims` drivers; numeric-invariant + avoid-phrasing lint |
| `surface` | lint (ids must be manifest-exposed), coverage floors — never rendered to judge or agent |
| `tags.service` | deterministic sampler strata, per-service reporting |
| `tags.freshness` | judge leniency block and evidence-pack gate (both test `!== "stable"`); `scheduled` requires `truth.asOf` + `truth.reverifyBy`; `live` means behavioral golden |
| `truth.*` | judge-blind: gospel-change lint, corroboration lint, stale gate, ledger cross-checks, triage signals copied into result rows (`truth.status`/`asOf`) |

Corroboration **required-when** (lint-enforced): `truth.status ∈ {disputed, unverifiable}` ⇒
rows required; a case named by a register `numericInvariants` entry ⇒ a row covering that
invariant; numeric/version/date keyFacts on `real-world` cases ⇒ a covering row (error for
authored cases, warn for migration-carried debt). `contradicted` is legal only for claims
mirrored in `golden.avoid`. Negative-claim detection is heuristic (warn); the hard bar for
negative claims is the golden-truth skill and review gates.

The compile enforces: filename == id, directory == category, unique ids, closed enums, keyFacts
1–5 (pinned migration exceptions aside), non-empty class-labeled sources, `asOf`/`reverifyBy`
required-when rules, ledger and register cross-checks. Trap enum: `out-of-scope | injection |
paid-bait | fabrication-bait | scam-check | speculation | cant-do | ambiguous` (one legacy
`governance` case tolerated pending relabel).

Every gospel change (question, `golden.*`, judge-facing tags) goes through the
[`golden-truth` skill](../../.agents/skills/golden-truth/SKILL.md); rounds are orchestrated by
[`run-evals`](../../.agents/skills/run-evals/SKILL.md).

## Commands

```sh
# Compile the battery → cases.json + sample.json (deterministic, byte-identical re-runs; no flags)
npm run eval:qa:compile

# Judge self-test (no server): scored fixtures + the 15 pinned promptSha256 fixtures
npm run eval:qa:selftest

# Corpus lint (deterministic, offline)
npm run eval:qa:lint                       # surface/manifest, numeric invariants, avoid phrasing,
                                           #   corroboration required-when, ledger checks
npm run eval:qa:lint -- --stale            # + FAIL on any truth.reverifyBy past due
npm run eval:qa:lint -- --coverage         # + per-op/skill/category floor report (warn)
npm run eval:qa:lint -- --enforce-floors   # coverage floors as errors (P4-close gate)
npm run eval:qa:lint -- --since <ref>      # + gospel-change guard vs that ref (auto merge-base in CI)

# Consistency-register member hashes: stamp/auto-reopen entries whose case files changed
npm run eval:qa:register                   # --seed to baseline, --check for CI-style dry run

# Run the battery (boot the server first; see below)
node eval/qa/run-qa.mjs --variant A --sample 30 --port 8788
node eval/qa/run-qa.mjs --cases eval/qa/corpus/live/live-cases.json --port 8788
node eval/qa/run-qa.mjs --cases eval/qa/corpus/live/live-digest-supplement-cases.json --port 8788
npm run eval:plan -- eval/qa/results/<stamp>-variantA.json    # plan regrade, offline
```

Register hashes cover cluster members, numeric-invariant `affectedCaseIds`, and date-trap
`caseIds` ("date trap" = an entry in the register's `dateContingentTraps` section — a known
time-bomb paired with its cases' `reverifyBy` schedules); CI runs `eval:qa:register -- --check`
to enforce them, and lint checks every string-valued date-trap field for any quoted case
`reverifyBy` date.

Coverage as of 2026-07-28: the 133 clusters name 252 of 490 cases (51%; 253 counting the
numeric-invariant and date-trap `caseIds`), so **auto-reopen is blind to the other 238 cases** —
a contradiction introduced in an unclustered case changes no stamped hash and reopens nothing.
Cluster coverage is therefore a standing extension job, not a finished one: each contradiction
sweep should cluster more of the remainder, weighted toward the strata where breaks concentrate —
freshness-sensitive cases (141 of the 238 unclustered are `live`/`scheduled`) and numeric,
version, or date claims, which drift between sweeps while `stable` conceptual cases mostly do not.

Server for live lanes: reuse the Solo `dev` process when it exists; otherwise
`npx wrangler dev --port 8788 --host localhost` — `--host localhost` is REQUIRED (custom-domain
routes otherwise rewrite request.url and every request 401s).

`run-qa.mjs` flags: `--ids a,b,c` (smoke), `--no-judge` (collect only), `--model` /
`--judge-model` (defaults `claude-sonnet-5`), `--cases <path>`, `--surface per-operation`
(+`--server-revision`) for the isolated 50-operation architecture instrument
(`compare-architecture-ab.mjs`). Variant A = the shipped `search` (ADR-0001); B requires a
build exposing a code-shaped tool plus `--search-tool`. Results land in
`eval/qa/results/<stamp>-variant<X>.json` (local-only): rows carry `truth.status`/`truth.asOf`
for triage, the verdict's `{rubric, packVersion, promptSha256}` stamps, and the evidence-pack
hash/size.

## CI contract

Every push/PR (`.github/workflows/ci.yml`):

- **Byte-pins**: the generated-artifacts step recompiles and byte-diffs `eval/qa/cases.json`
  AND `eval/qa/sample.json`. Never hand-edit them.
- **`eval:qa:lint -- --stale`**: all deterministic lint lanes; any past-due `truth.reverifyBy`
  fails. In CI the **gospel-change guard** is automatically diff-aware against the merge base:
  a change to `question`, `golden.*`, `tags.freshness`, or `tags.trap` fails unless
  `truth.verified` changed in the same diff with non-empty `evidence` + `rootCause` (score-only
  rationales rejected; `freshness-drift` allowed). Local/pre-push equivalent for Solo lanes:
  `npm run eval:qa:lint -- --since <ref>`.
- **`eval:qa:selftest`**: judge fixtures incl. the 15 pinned promptSha256 hashes.
- `eval:selftest` asserts the live v2 contracts (name, ordered membership, content digest).

The daily refresh workflow (`refresh.yml`) also runs `lint-corpus --stale`, so a `reverifyBy`
date passing fires within 24 h, not on the next unrelated PR. Remedies are auditable either
way: re-verify (update `verified` + `asOf` + a new `reverifyBy`) or an explicit dated extension
with rootCause. The stale queue is owned by the
[`truth-maintenance`](../../.agents/skills/truth-maintenance/SKILL.md) skill; authors set
`reverifyBy` quarter-granular and staggered so the queue drips instead of cliffing.

For the former 2026-10-01 cohort (76 cases originally shared `reverifyBy: 2026-10-01` — the
cliff the 2026-07-28 stagger dissolved), sort first by `truth.status !== "confirmed"`, then by a
currentness match in the question/key facts, then by id. The currentness test is
**word-boundary anchored** — `/\b(?:current|as of|version|release|scheduled|status|roster|provider|playlist|active|mainnet|draft|final|latest|dated|date|live on|still underway)\b/i`
applied to `question` plus `golden.keyFacts` joined. The anchoring is load-bearing, not
decoration: without `\b`, `version` matches "conversion", `active` matches "interactive", and
`date` matches "update", which changes the tier for 28 corpus cases and makes the schedule
irreproducible. Starting Thursday 2026-10-01, place each case on the Thursday of the next
Monday–Sunday week with capacity after already-scheduled cases, capped at four cases per week;
skip full weeks. This sends unconfirmed and live/version/roster/program claims first while stable
protocol and safety facts follow, without creating a new weekly cliff.

Capacity caveat, recorded 2026-07-28: the four-per-week cap governs NEW allocations and is
applied after already-scheduled cases; it is not a corpus-wide invariant. Pre-existing
non-Thursday dates already put several Q4-2026 weeks at 5-7. When a volatile case must be
re-verified soon, a short interval beats cap purity - placing it in Q4 at week-total five is
the correct trade against pushing it to 2027 to keep a number tidy.

Known limitation of the currentness tier: it matches the *word* "version", not version literals,
and has no inflection tolerance ("releases" and "Dates" do not match). Five late-scheduled cases
pinned a version or protocol literal; three are Protocol-N facts that are defensibly stable.
`q-tool-passkeykit-smart-wallet` was pulled forward by the 2026-07-28 re-verification round
(now `reverifyBy` 2026-08-27), leaving `q-ti-self-host-retention-backfill` (RPC v27.1.1 /
Horizon v27.0.0) at 2027-03-18 — about eight months after its 2026-07-11 `asOf`. Recorded rather
than special-cased: re-shuffling the cohort for one case would trade a reproducible rule for a
hand-tuned one. Pull it forward at the next verification pass if it matters.

## Judging rubric and score comparability

`judge.mjs` grades factual agreement with the golden answer + keyFacts, one headless
`claude -p --model claude-sonnet-5` call per grade. Scores: **correct** (all or all-but-trivial
keyFacts present, no wrong claims), **partial** (core right; omissions alone cap here),
**wrong** (core incorrect, an `avoid` item present, fabrications, or — trap cases — playing
along), **error** (the judge itself failed; never a grade of the candidate).

Style, length, and citation format are ignored. Beyond-golden specifics are "unverified", not
wrong. Avoid items bind only on answer-visible content; support-relative avoid phrasing is
advisory (and linted). Cases with `tags.freshness != "stable"` get the freshness-leniency block
and a deterministic bounded **source-basis evidence pack** built from the saved execute results
(`evidence-pack.mjs`, pack `p3`); sourced drift from the golden snapshot is tolerated, confident
unsourced contradiction is not.

**Comparability rules:**

- Re-judge identity is the **judge model + rubric + pack** tuple (currently `claude-sonnet-5` /
  `v2.4` / `p3`; rubric and pack are exported as `JUDGE_RUBRIC` / `PACK_VERSION`, with a short
  changelog in the `judge.mjs` header). Compare stored rows only when that tuple and
  prompt/pack-hash semantics match — otherwise re-judge the saved `rows[].answer` under the
  target tuple first (cheap; feed back through `judgeCase` with the row's transcript).
- A `--no-judge` capture has no source judge tuple or verdict. Its first judging goes through
  `run-qa.mjs --judge-stored <results>` (2026-07-29, Solo todo 1261): judges every unjudged row
  in place, stamps the judge tuple, per-row + meta judge costs, and a `meta.judgeStored`
  provenance block, and refuses drifted case snapshots, non-reproducing evidence packs, and
  judge-tuple mixing. First-judging is still not an identical-input re-judge — never variance
  evidence. The `re-judge.mjs --ids --allow-non-identical` path remains only as the loudly
  labeled side-artifact escape hatch when the snapshot no longer reproduces; it cannot be mixed
  with already judged rows or used with `--flips-vs`.
- **A rubric bump is required** for any change to grading semantics: judge prompt text, score
  meanings, avoid/freshness/trap handling. A pack bump is required for evidence-pack
  serialization/selection changes. Cosmetic refactors that keep `buildJudgePrompt` output
  byte-identical (provable via the promptSha256 fixtures) need no bump.
- **Noise floor**: per-row any-flip rate **23.3%** across three identical v2.4/p3 re-judge
  passes (pairwise score disagreement 15.6%). Isolated single-run score movement at or below
  that scale is variance until confirmed by live transcript review or a repeated mechanism.
  Read `wrong` counts before `correct` counts; compare variants on the same sample.
- **Denominator note**: the owned battery is **492 cases as of 2026-08-12**. Commit `6e1f979`
  added two Soroban cases to the 490-case corpus. The 2026-07-11 baseline remains a historical
  484-case denominator, and the 490-case results remain 490-denominated. Neither denominator is
  retroactively relabeled. The approximately 469-case pre-rebuild aggregates are also archival
  (see the history doc). Per-id comparisons remain valid for continuing cases under the same
  rubric/pack tuple.
- **Deterministic sample history**: the sampler code and N=30 contract did not change. Six new
  cases added three members to the Scout stratum and three to LumenLoop. Because the algorithm
  uses even-spaced picks over each id-sorted service stratum, the 490-case compile retained 25
  sample ids and replaced five: removed `q-defi-liquid-staking-whitespace`,
  `q-hist-quantum-preparedness-plan`, `q-scf-current-hackathons-compare-live`,
  `q-scf-rfps-hackathons-live`, and `q-ti-explain-repo-payload-status`; added
  `q-defi-defindex-honest`, `q-hist-meridian-2026-corrected-venue`, `q-scf-current-round`,
  `q-scf-sdf-bug-bounty`, and `q-ti-openzeppelin-relayer`. None of the six new cases itself
  entered sample-30. The 490→492 expansion retained 24 sample ids and replaced six. Removed:
  `q-protocol-27-cap-0071`, `q-protocol-quorum-slice-vs-quorum`, `q-raph-offramp-xlm-usdc`,
  `q-sep-38-quotes`, `q-sor-build-target-wasm32v1`, and `q-sor-scval-conversion`; added:
  `q-protocol-accounts-signers-thresholds`, `q-protocol-scp-consensus-algorithm`,
  `q-raph-phishing-pending-claim`, `q-sep-41-token-interface`,
  `q-sor-classic-dex-from-contract`, and `q-sor-sep41-transfer-vs-transferfrom`. Compare
  aggregate headline runs across either the 484→490 or 490→492 boundary only on an explicit
  common-id set, or disclose that sample membership changed.

## 2026-07-27 stale-gap re-measurement (checkpoint, not a re-baseline)

Run after a 16-day measurement gap to answer "what is answer quality today?" — not an A/B of any
change. Clean committed HEAD `dbee852ebc755cc815d8c50dd50d86ec4a10ce92`, passed as
`--server-revision`; the working tree was stashed and asserted empty before and after every paid
lane. `QA_AGENT_PROMPT_APPEND` unset. `claude-sonnet-5` answering and judging, v2.4/p3 — the
measurement tuple is unchanged. Sample file `25af52f9…c81c`, ids `8dddeddb…de96`, corpus content
digest `fef31c49…37ac`. Run in six ≤5-case `--ids` shards for budget checkpointing; the shard union
was asserted byte-identical to the pinned sample order.

| lane | raw | stamps |
| --- | --- | --- |
| headline sample-30 | **10C / 17P / 3W / 0E** | `2026-07-27T21-34-19`, `22-32-31`, `22-36-20`, `22-39-50`, `22-43-14`, `22-50-16` (all `-variantA.json`) |
| canonical live-data v3 (15) | **11C / 4P / 0W / 0E** | `2026-07-27T23-05-03-variantA.json` |
| plan regrade (offline) | 28/30 requiredCovered (93%), mean onPlanRatio 0.93–1.00 | `*.plan.json` alongside each shard |

Total agent cost $21.88. Routing gate PASS, unchanged from the committed baseline.

**Reading: no detectable movement.** The 2026-07-11 baseline of record was 8C/18P/4W and its
same-day checkpoint six hours later was 12C/14P/4W; this run lands between them. On the strict
24-id unchanged-golden slice (ids sha256 `6aca0406…3482`, excluding
`q-sor-build-target-wasm32v1`, whose golden changed after the baseline) there were 6 flips, of
which `q-pc-muxed-accounts` flipped `partial → correct` when re-judged on identical saved input —
confirmed judge variance. Real movement is therefore **5/24 = 20.8%, below the committed 23.3%
any-flip noise floor**. Re-judge artifacts: `2026-07-27T23-06-14`, `23-07-00`, `23-07-34`,
`23-08-25-rejudge.json`.

Triage outcome (round record: Solo scratchpads 715/717/718): 3 wrongs → 1 judge artifact
(`q-defi-defindex-honest`) and 2 upstream findings (`sls-058`, `sd-039`). 17 partials → **zero**
upstream findings. **Correction, 2026-07-28:** this section originally read "11 of 17 missed facts
that live probes returned on the first hit, so they are an answering-agent retrieval pattern." A
prose-surface inventory and its independent adversarial review both overturned that. The failure is
NOT a clean retrieval stop-short: several cases fetched the missed fact and lost it in synthesis,
while the lane that first said "predominantly synthesis" was itself wrong on 2 of the 4 cases when
the transcripts were checked. The `EVIDENCE CHECKPOINT` did fire in 19 of 21 partial transcripts,
but that proves delivery rather than coverage — it instructs a wider pass only for open-world
identity/history questions, and these were scoped technical ones, so the applicable
clause-completeness guidance was never present to be read past. What all three passes agree on: no
production prose or mechanism change is justified, a server-side answer-completeness guard cannot
exist (the final answer never crosses the MCP boundary), and the single true retrieval miss stays
red under anti-overfitting. Rescoped in Solo todo 1231; the next step is a clause-coverage A/B on
the eval instrument, not a service change. Single-case gaps —
Lumenloop's Meridian 2026 event record, the raw JS ScVal/BytesN boundary, and Lab signer-UI
documentation — are recorded monitor-only, below the 2-unrelated-cases acting bar.

## 2026-07-28 verification checkpoint (paired vs 07-27; not a re-baseline)

Purpose: verify the day's cumulative service changes (canonical-URL collector fix + dedup,
zero-gated/zero-hit `nextSteps` copy, provider-error telemetry) caused no detectable aggregate
regression within this sample and noise floor. Pre-registered brief with adversarial pre-spend gate (three revisions before
LAUNCH-OK); two-phase spend enforcement (`--no-judge` collection → 30/30-row + agent-cost
checkpoint → judge); runner revision `a77ccb0` (demo-only diff from the brief's `94c1ad8`
pin — MCP surface identical); v2.4/p3, sonnet-5 both roles.

| lane | verdicts | results stamp |
|---|---|---|
| headline sample-30 | **10C / 16P / 4W / 0E** | `2026-07-28T22-52-45-variantA.json` |

Paired n=30 vs the six 07-27 sample shards: 5 flips (16.7%), 2 up / 3 down — inside the
23.3% noise floor's variance bound (~7 expected; the floor bounds, it is not a
significance threshold). Two of the down-flips retracted on re-judge (judge variance;
artifact `2026-07-28T23-17-20-rejudge.json`); the two up-flips were not re-judged, so no
gain is claimed. The 4 wrongs: 2 are the stable known-upstream defects reproducing
exactly (`sls-058`/stellarlight#744 Fluxity aggregate; `sd-039`/stellar-docs#2707 Relayer
conflation — both wrong in baseline too), 1 retracted on re-judge, 1 stable single-case
answer-craft slip (`q-sor-scval-conversion`: "bigint or number" for i128 against the
avoid's unsafe-JS-number trap; monitor-only). Attribution readback found no wrong or
down-flip involving truncated-URL evidence or zero-hit/all-backfill steering
(execute-visible); changed search-body behavior was not attributable from the stored evidence
because search bodies were not stored. **Verdict: no detectable aggregate regression within this
sample and noise floor; no measured gain claimed; checkpoint shape
matches 07-27.** Independent adversarial review of these conclusions (recomputed tables,
transition matrix, transcript audit): CONCLUSIONS-OK after three packaging revisions.
Tooling gaps found (judge-stored mode, judge-cost stamping): Solo todo 1261.

Cost-stamp caveat: this results file has `meta.totalJudgeCostUsd: 0` and a
`meta.judgedStored` stamp because a session-local script judged the stored rows before
`--judge-stored` was committed. The actual judge spend is the sum of `rows[].verdict.costUsd`,
about $5.42; reading only the meta total understates the run cost.

## 2026-07-29 clause-coverage A/B: cancelled at the free-audit gate (todo 1231; no spend)

Todo 1231's recorded next step was a clause-coverage A/B via `QA_AGENT_PROMPT_APPEND` (arm B
adds a decompose-and-cover instruction to the answering prompt; eval-instrument only, never
production prose). The pre-registered brief (Solo scratchpad 737) went through the mandatory
adversarial pre-spend review (Opus arm, 16 findings, verdict LAUNCH-WITH-FIXES), whose first
blocking gate was a **free offline audit fixing the gainable denominator** before any paid
token: classify the 16 baseline partials (`2026-07-28T22-52-45-variantA.json`, joined with
goldens) into coverage-gainable vs not, cancel if fewer than 6 are gainable.

**The audit landed at at most 3 of 16 gainable — the round was cancelled with $0 spent.** Per-row
classification (transcript keyword probes + spot-reads, recorded in scratchpad 737):

- **Framing discipline, untargeted by clause coverage (~6 rows):** missing as-of dating
  (`q-crp-become-an-anchor-licensing`, `q-crp-remittance-founder-advisory`,
  `q-sor-build-target-wasm32v1`), honest-disagreement presentation (`q-defi-defindex-honest`),
  distinction-drawing (`q-protocol-27-cap-0071`, `q-gap-builders-person-empty`).
- **Domain completeness never retrieved (~4 rows):** the missing fact is not an asked clause
  and was absent from the transcript (`q-aas-list-token-on-exchanges-aggregators`,
  `q-jutsu-what-is-a-memo`, `q-scf-current-round`, `q-raph-offramp-xlm-usdc` — the last
  answered with zero tool calls).
- **Upstream/coverage rows the treatment cannot touch (2):** `q-hist-meridian-2026-corrected-venue`
  (Lumenloop event-record gap, monitor-only above), `q-agent-identity-erc8004-stellar` — the
  candidate **explicitly and correctly declined** to state ERC-8004's provisions because no
  tested surface indexes them; the treatment's "say plainly your sources did not return it" is
  exactly what it already did, and it still graded partial.
- **Retrieved-and-dropped, the treatment's actual target (fragments in ≤4 rows):**
  `q-edge-1xlm-activation-fee` (trap; pre-excluded from any gain numerator),
  `q-scf-sdf-bug-bounty`, `q-soroban-no-std-constraints`, `q-pc-muxed-accounts` (the
  documented judge-variance row) — each with additional unrecoverable facts, so none clearly
  flips even under perfect treatment behavior.

The review had independently shown the brief's original bank threshold (net ≥ +3 paired flips)
fires on pure judge noise roughly one round in five, and that banking a prompt append forks the
measurement contract (all stored baselines and the 23.3% floor are unmodified-prompt artifacts)
while drifting the headline toward measuring answer craft instead of the MCP. With at most 3 gainable
rows, even a perfect treatment cannot clear a noise-safe threshold — underpowered by
construction. **Measured answer for todo 1231: the sample's partial mass is answer-framing
discipline and domain-completeness, not clause coverage; no instrument change is banked; no
production change was ever in scope.** Durable side-products landed instead:
`meta.promptAppend` {sha256, chars} is now stamped by `run-qa.mjs` so any future prompt-append
arm is identifiable and verifiable against a known arm text, and `--judge-stored` gained crash-safe per-row
persistence plus re-attemptable judge-side error verdicts (review findings 3 and 10).

## 2026-08-04 full-battery truth-maintenance round (490 cases; not a re-baseline)

Purpose: inspect every owned golden and every produced answer, not measure a product change. The
run used clean runner/server revision `8fbeaf9641b969c9bf01239df33b8209dae11017`, variant A,
`search-execute` / `search`, `claude-sonnet-5` for answering and judging, and rubric/pack v2.4/p3.
The 49 immutable ten-row artifacts run from `2026-08-04T16-23-45-variantA.json` through
`2026-08-05T00-32-54-variantA.json`; results remain local-only. Their ordered union is exactly
490 canonical unique ids (JSON id hash `edbbfc36…a746`, newline id hash `b496a58d…902`) with
uniform case, operation, manifest, source-revision, and two-tool-surface stamps.

One primary row, `q-crp-remittance-founder-advisory`, carried a nonempty connection-closed
payload plus `agent.error="success"`. It was therefore treated as a transport E despite its
stored W, then rerun once in sealed repair artifact `2026-08-05T00-37-39-variantA.json`
(file SHA-256 `09ecf09a…aebf`) and accepted as P. The primary artifacts were not modified. Raw
stored verdicts were **179C / 218P / 93W / 0E**; replacing only that invalid row yields
**179C / 219P / 92W / 0E**. A shared runner predicate now requires both a nonempty answer and
no agent error before building evidence or spending on a judge, with a focused regression test.

Every row then received independent answer-visible review against its transcript, owned golden,
and current primary sources. The final repaired independent disposition is:

| result | count | rate |
| --- | ---: | ---: |
| correct | **154** | **31.4286%** |
| partial | **218** | **44.4898%** |
| wrong | **118** | **24.0816%** |
| error | **0** | **0%** |

The explicit half-credit instrument is **(154 + 0.5×218) / 490 = 263 / 490 = 53.6735%**;
strict correctness is **154 / 490 = 31.4286%**. This reviewed full-battery score is diagnostic,
not a new baseline and not directly comparable to sample-30 checkpoints. Executed artifact cost
was **$312.9159162**; including the precharge ledger, **$317.4159162**, below the $500 cap.

Post-run truth maintenance corrected provenance-bearing stale or false goldens and hardened the
improvements ledger. Those edits generated corpus SHA-256 `256ff1bb…9397` and were **not paid
remeasured**, so no score gain is claimed. The sealed run remains evidence for its pinned input
snapshots; the current generated corpus is the forward-looking truth source.

The independent 154/218/118 disposition is preserved row by row in Solo Todo 1345 and scratchpad
761 (`solo://proj/49/todo/1345`, `solo://proj/49/scratchpad/truth-maintenance-20--761`); unlike the
artifact tallies, it is a reviewed classification rather than a locally reproducible judge output.
Regenerating the consistency register leaves 43 clusters with a `reopen` verdict, 39 more than
HEAD, because the corrected gospel fields intentionally invalidate prior cross-case confirmations.
Forty clusters carry a `2026-08-05` reopening stamp (including one pre-existing reopened cluster),
the UTC rollover of this 2026-08-04 local round. Register-wide, the four numeric invariants and two
date-contingent traps bring the totals to 49 reopened entries and 46 stamped on `2026-08-05`.
These are explicit follow-up signals, not remeasurement results.

Follow-up completed on 2026-08-05. Four evidence waves reconciled those 43 clusters, four numeric
invariants, and two date traps. The accepted metadata and truth repairs then reopened five more
shared clusters, so the final register drain covered **48 clusters + 4 numeric invariants + 2 date
traps = 54 entries** and leaves zero `reopen` verdicts. Among that reconciled set, only clusters
008, 009, 018, 030, and 088 retain their documented intentional tensions. The rebuilt 490-case
corpus SHA-256 is `1d4357e475e4eca81dd03386cc47da6ba2d84678e389800447aeea079cc6a831`.

Offline triage of the sealed run's 41 unique plan-coverage misses found only seven strict,
below-correct gain candidates. A fixed 16-case treatment/control diagnostic received independent
`LAUNCH-OK` with a $25 hard cap but was not launched. The plan grader was not loosened: top-level
`search` output is catalog-navigation metadata, not evidence for live return values. No post-repair
score or measured gain is claimed without a paid remeasurement.

## Current baseline of record

The 2026-07-11 post-rebuild baseline is recorded in
[`reviewed/2026-07-super-corpus-baseline.md`](./reviewed/2026-07-super-corpus-baseline.md).
It ran the designed deterministic headline sample-30 plus the separately denominated canonical
live (live-data-canonical-v3, then 10-case) and digest-2 contracts with `claude-sonnet-5` answering and judging under v2.4/p3.
Results stamps: `2026-07-11T15-36-44-variantA.json`,
`2026-07-11T15-50-19-variantA.json`, and `2026-07-11T15-52-51-variantA.json`.
Raw results were 8C/18P/4W, 8C/2P/0W, and 2C/0P/0W respectively; live review calibrated the
canonical lane to 9C/1P/0W. Results JSONs remain local-only evidence.

The most recent checkpoint against this baseline is the 2026-07-11 tier-interleave round
([`reviewed/2026-07-11-tier-interleave-round.md`](./reviewed/2026-07-11-tier-interleave-round.md),
stamps `2026-07-11T21-44-47-variantA.json` headline, `2026-07-11T21-55-31-variantA.json` canonical
live lane (then 10-case), `2026-07-11T21-59-10-variantA.json` digest-2; same v2.4/p3 + `claude-sonnet-5` contract and
the same 30 sample ids). Raw were 12C/14P/4W, 10C/0P/0W, and 0C/2P/0W; reviewed (re-judging every
flip) were 12C/14P/4W, 10C, and 2C — 5 confirmed stable gains and 2 confirmed regressions vs the
baseline headline. The super-corpus baseline above remains the baseline of record; the tier-interleave
round is a checkpoint, not a re-baseline.

The canonical live-data lane moved to the frozen 15-case `live-data-canonical-v3` contract on
2026-07-12 (the v2 ten carried byte-identical under an independent projection digest, plus five
behavioral additions). Its baseline of record is
[`reviewed/2026-07-12-live-v3-baseline.md`](./reviewed/2026-07-12-live-v3-baseline.md)
(stamp `2026-07-12T08-04-12-variantA.json`: raw 11C/3P/1W, reviewed 12C/2P/1W; carried-ten
reviewed 9C/1P). v3 aggregates are 15-case-denominated and never compared to v2's 10-case
aggregates; per-id comparison stays valid for the carried ten. A 2×3 answering-model A/B
(Opus 4.8 / Fable 5 / Sonnet-5 control, two replicates each, blind cross-vendor adjudication)
is recorded in
[`reviewed/2026-07-12-answering-model-ab.md`](./reviewed/2026-07-12-answering-model-ab.md) —
verdict inconclusive: zero strict adjudicated recoveries for either stronger arm, so the
persistent partial mass is not simply answering-model-bound and no default-model change follows.
Re-judges now persist as machine-readable artifacts: `eval/qa/re-judge.mjs <results> --ids a,b`
or `--flips-vs <baseline-results>` re-judges identical saved input behind casesSha256 identity
and judge-model/rubric/pack tuple guards, writing `results/<stamp>-rejudge.json`.

### 2026-07-13 release-closeout targeted diagnostics

Three paid targeted probes exercised the six new cases and their nearest controls. They were
**not** the deterministic sample-30 and are not a new headline baseline. All used
`claude-sonnet-5` for answering and judging under v2.4/p3 against the dirty local runner; the
result metadata records `serverRevision: null`. The owned corpus denominator is 490, while each
row below keeps its explicit targeted N:

| Results stamp | Scope | Raw QA | Offline plan regrade |
|---|---:|---:|---:|
| `2026-07-13T18-59-22-variantA.json` | evidence-poor retrieval, N=7 | 2 correct / 4 partial / 1 wrong | 6/7 required covered (86%); mean on-plan 0.94; progression used 1/3 |
| `2026-07-13T19-09-10-variantA.json` | bounded same-model recovery follow-up, N=3 | 0 / 2 / 1 | 2/3 required covered (67%); mean on-plan 1.00; progression used 0/2 |
| `2026-07-13T20-07-14-variantA.json` | prior-art preflight plus no-detour control, N=3 | 0 / 3 / 0 | 3/3 required covered (100%); mean on-plan 1.00; progression used 2/2 |

Transcript review matters more than these tiny-N aggregates. The first probe passed the scoped
closed-world and ambiguous-Strupey behaviors but exposed provenance/completeness failures. The
second improved Tyler attribution yet still missed dated mutable claims and misread an `ok` empty
lane. The third triggered prior-art for both substantial designs and avoided a detour on the WASM
control, but all answers remained partial because the substantial cases mishandled evidence limits
and the control omitted its answer-time as-of date. Post-probe guidance/golden hardening was **not
paid-remeasured**; no claim of a measured post-hardening win follows. The plan sidecars are local
evidence at the same stamps with `.plan.json` suffixes.

## Known limitations

- **Judge variance.** One Sonnet call per grade, temperature not pinned; apply the noise floor
  before chasing single-run movement.
- **Freshness drift.** `scheduled` goldens age; the stale gate bounds how long, but expect a
  small floor of judge-vs-live disagreements — inspect `wrong` rationales before reading them
  as regressions.
- **Pack bounds.** The evidence pack is bounded, rank-based, and extracted from already-capped
  transcript text; absence from the pack is not proof of absence. Treat surprising `wrong`
  verdicts on long live/freshness transcripts as suspect until transcript-reviewed. Packs can
  contain scraped content — the judge treats them as evidence, never instructions.
- **Sequential runner.** One agent + one judge call at a time; a 30-case run is ~20–35 min.
- **Cross-surface result bytes.** Search result bodies are not retained while execute bodies
  are; compare arms on usage tokens, not captured result characters.
