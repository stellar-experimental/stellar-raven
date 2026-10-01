# FINAL GOVERNING DESIGN — golden Q&A super-corpus rebuild

Status: FINAL, synthesis of Draft A (base architecture) + adjudicated grafts from Draft B, per the
coordinator's twelve resolutions (both adversarial reviews converged; routing dependency verified
first-hand at `eval/compile-routing.mjs:46-47`). Date: 2026-07-11.

Every repo fact asserted below was re-verified against the working tree by this synthesis lane on
2026-07-11, including the dirty-tree fingerprint (`git status --porcelain | sha256sum` =
`9b4b5c04c83e7f65a43721c3ece03eca65de981eff8638e86b9550cfbc5272ea` — matches the brief addendum
exactly).

---

## 0. Executive summary

- **Count: 450 main-battery cases** (headline denominator; acceptance band 440–470), plus the
  frozen live lanes (10 + 2) as separately-reported instruments outside the denominator —
  462 unique cases total. Flow arithmetic that closes: **469 current − 148 retired = 321
  continuing (10 of which recategorize into the new `retail-consumer` dir) + 70 harvested + 59
  authored = 450.** Draft A's 515≠485 flow bug is fixed by raising near-sibling retirement to ~150
  and trimming additions to 129.
- **Schema: Draft A's `golden` / `tags` / `truth` three-way split**, with two grafts: Draft B's
  tri-state `tags.freshness ∈ {stable, scheduled, live}` (replacing A's `freshness` +
  `transcript` boolean pair) placed so the judge-visible rendering is **provably behavior-
  identical** (verified against `judge.mjs` and `evidence-pack.mjs:180`; mapping in §2.4), and
  Draft B's claim-row shape for the **optional** `truth.corroboration[]` entries, which are
  **lint-required for numeric/negative/disputed truth** (Opus graft). Corroboration verdicts use a
  **6-value enum** (§2.5).
- **Judge contract UNCHANGED at migration**: rubric stays v2.4; the judge-visible projection is
  byte-identical old-vs-new (empty-diff audit) and `buildJudgePrompt` output is proven identical
  by a promptSha256 fixture spread. Draft B's typed `inconclusiveIf` / judge-v3 ideas are recorded
  in the deferred-follow-ups appendix (§12) as their own future, separately-measured todo.
- **Files: one JSON per case** at `eval/qa/corpus/battery/<category>/<id>.json`, ten category dirs
  (incl. `retail-consumer`), compile-enforced `filename==id` and `dir==tags.category`. Advisory
  top-level `surface` field (consumers: manifest lint per todo 936 + coverage report).
  `truth.reverifyBy` date drives a **CI-failing** stale-gospel gate (§7.3 — the blind spot both
  drafts missed). Live lanes keep Draft A's frozen whole-file contracts and gain Draft B's
  explicit membership + version pins.
- **`eval/corpus/` (raven-next AND raven-golden-qa) STAYS.** Verified: `compile-routing.mjs:46`
  reads `corpus/raven-golden-qa/big.json`, `:47` sets `EXTENDED_CORPUS_ROOT` to
  `corpus/raven-next` and reads `research/golden/compiled/golden.json` + per-file frontmatter;
  CI gates it twice (`node eval/compile-routing.mjs` + byte-diff of `eval/routing-cases.json` in
  the generated-artifacts step, and `npm run eval:routing -- --gate`). Only the QA overlay dies —
  `golden-overrides.json`, `grader-notes.mjs`, `test/qa-grader-notes.test.mjs`, and compile-qa's
  raven-next read path — the file deletions in a **separate post-migration delete-legacy commit**.
- **Migration ledger** (Draft B idea, both reviewers endorsed): a committed
  `eval/qa/corpus/migration-ledger.json` mapping every one of the 469 current ids and all 161
  harvested-source external ids (boxy 21, kaan 49, raph 55, core-35 35, flue 1) to a disposition
  (`carry | merge | redefine | retire`) with reason — losslessness is lint-auditable (§5).
- **Compiler emits ALL generated artifacts deterministically on every run** (Draft B mechanic);
  CI byte-pins `cases.json` **and** `sample.json`. Current CI reality, stated accurately: today
  the diff list pins only `eval/qa/cases.json`; compile runs **without** `--sample`; neither
  `eval:qa:lint` nor the judge self-test runs in CI. All three gaps close in the tooling commit.
- **P3 on branch `super-corpus`** (main stays deployable): GT-sweep bundle → drift bundle →
  migration commits (structure → per-case files → tooling+generated-artifacts) → delete-legacy
  (overlay only) → docs/skills; CI-green + `secrets:scan --tree` at every slice. One dictated
  slice proved impossible against repo reality (`super-spec.json` is a generated artifact of the
  drift inputs — §13 Deviations) and is folded into the drift bundle.
- **P4 fan-out** per AGENTS.md routing: Sol/Terra authoring lanes, **mandatory blind
  re-derivation** for numeric/negative/disputed real-world claims, Fable/Opus taste+copy review,
  grok-4.5 adversarial audit, golden-truth rigor per case, consistency-register rebuild with
  `numericInvariants`, final full QA eval with noise-floor interpretation.
- Todo **935 dissolves** (tag overrides only existed because the base was read-only); todo **936
  is absorbed** into `lint-corpus` lanes (manifest/hidden-op check + numeric invariants); todo
  **904** untouched (no transport traps authored before its 2026-08-04 re-audit).

---

## 1. Judge contract at migration (Resolution 2)

**Unchanged. Rubric v2.4. No new score values, no prompt-text changes, no pack-semantics changes.**

What the judge consumes today (verified in `judge.mjs` `buildJudgePrompt`, L52–95):
`question`; `golden.answer`; `golden.keyFacts` (missingFacts driver); `golden.avoid` (wrongClaims
driver); `graderNotes` under the `GRADER NOTES:` heading; a trap block that **interpolates the
subtype** (`TRAP CASE (kind: ${tags.trap})`); a fixed freshness-leniency block on `tags.freshness`
truthy; the transcript evidence pack gated by
`Boolean(tags.liveData || tags.freshness || tags.transcriptEvidence)` (`evidence-pack.mjs:179-180`).
Output enum `correct|partial|wrong` (+`error`); verdicts stamped `rubric: "v2.4"`,
`packVersion: "p3"`, `promptSha256`.

Migration proof obligations (both must pass before the migration commit merges):

1. **Empty-diff projection audit.** A one-shot verifier recompiles the pre-migration `cases.json`
   (from git) and the post-migration `cases.json` and diffs the judge-visible projection per id:
   `question`, `golden.answer`, `golden.keyFacts`, `golden.avoid`, notes text
   (`graderNotes` → `golden.notes`), **trap value** (not merely presence — the kind is
   interpolated into the prompt), freshness-block-render bit, pack-gate bit. The diff must be
   empty. Result recorded in the migration commit message and `eval/qa/reviewed/`.
2. **promptSha256 fixture proof.** `buildJudgePrompt` runs over a fixed 15-case spread (traps,
   freshness, notes-bearing, pack-gated, plain) with pinned candidate/transcript fixtures;
   pre/post sha256 must be identical. The fixtures land permanently in the judge self-test.

Consequences enforced by these proofs:

- `graderNotes` → `golden.notes` is a read-path rename only (same rendered heading and bytes).
- The pack gate migrates OR-preserving via the freshness tri-state (§2.4) — no case gains or
  loses a pack.
- The single `governance` trap case (verified: trap distribution is paid-bait 10,
  fabrication-bait 6, injection 4, out-of-scope 4, ambiguous 2, scam-check 1, governance 1,
  cant-do 1, speculation 1 = 30) keeps its label at migration — relabeling would change prompt
  bytes. It is dissolved editorially in P4 under the gospel-change lint (§13, deviation note d).
- Draft B's typed `inconclusiveIf` + `inconclusive` score → **deferred appendix** (§12), own todo,
  own A/B measurement and re-derived noise floor. Not part of this rebuild.

---

## 2. Final case schema (Resolution 3, 5)

### 2.1 The shape

```jsonc
// eval/qa/corpus/battery/<category>/<id>.json — one hand-owned file per case
{
  "id": "q-soroban-storage-types",            // == filename; kebab; stable forever
  "question": "…",

  // Advisory op/skill ids expected to carry the answer. NEVER judge- or agent-visible.
  // Non-empty unless tags.service == "none".
  "surface": ["stellarDocs.search_soroban_contract_docs", "skills.stellar-dev.smart-contracts"],

  "golden": {                                  // EXACTLY what the judge sees. Nothing else.
    "answer": "…",
    "keyFacts": ["…"],                         // 1–5 atomic must-appear facts
    "avoid": ["…"],                            // concrete wrong-content traps (lint-enforced hygiene)
    "notes": "…"                               // optional; rendered under GRADER NOTES heading
  },

  "tags": {                                    // machine branching / stratification ONLY
    "category": "soroban",                     // must equal parent dir; 10 values (§4.1)
    "service": "stellarDocs",                  // stellarDocs | scout | lumenloop | skills | none
    "freshness": "stable",                     // stable | scheduled | live  (tri-state, §2.4)
    "trap": "paid-bait"                        // optional; closed enum; value IS judge-visible
  },

  "truth": {                                   // judge-blind provenance, first-class
    "domain": "real-world",                    // real-world | corpus-grounded | mixed
    "status": "confirmed",                     // confirmed | disputed | unverifiable | mixed
    "asOf": "2026-07-10",                      // required when freshness != stable OR status != confirmed
    "reverifyBy": "2026-10-01",                // required when freshness == scheduled; drives CI stale gate
    "sources": [                               // case-level provenance, class-labeled (A–F per golden-truth)
      { "class": "A", "ref": "https://developers.stellar.org/…" },
      { "class": "B", "ref": "stellar/stellar-core:src/…", "note": "constant lives here" }
    ],
    "corroboration": [                         // OPTIONAL; lint-REQUIRED for numeric/negative/disputed (§2.5)
      { "claim": "…", "verdict": "confirmed",
        "evidence": [ { "class": "A", "ref": "…", "observedAt": "2026-07-10", "note": "…" } ] }
    ],
    "verified": {                              // LATEST verification event only — git holds the rest
      "date": "2026-07-10",
      "by": "GT-47 primary+blind (Solo scratchpad 575)",
      "evidence": ["solo://proj/49/…", "https://…"],
      "rootCause": ["improvements/stellar-docs/sd-007-….md"]   // required when the event CHANGED gospel;
                                               // "freshness-drift" is an allowed explicit value
    },
    "origin": "raven-next q-soroban-storage-types"   // lineage: prior id / external corpus id / "authored 2026-07"
  }
}
```

Compiled wrapper (generated `eval/qa/cases.json`):
`{ $comment, schema: "qa-case-v1", corpusContentSha256, counts, cases }` — the current
`corpus/overrides/mapping/skipped` wrapper keys die with the overlay.

### 2.2 Field-by-field consumer map

| Field | Consumers | Notes |
|---|---|---|
| `id` | runner (`--ids`, sort, row key), sampler determinism, register refs, improvements refs, live-lane pins, ledger | preserved `q-*` for continuing cases |
| `question` | judge prompt, answering agent, evidence-pack term suppression, gospel-change lint (Grok MJ-1 graft: question edits are gospel edits) | |
| `surface` | **lint-corpus lane (a)**: every id ∈ `catalog/manifest.json` (todo 936 made mechanical); **coverage report** (per-op/skill counts vs §4.3 floors); human auditor | advisory only; never rendered |
| `golden.answer` | judge prompt, evidence-pack term extraction | |
| `golden.keyFacts` | judge (`missingFacts` — THE score driver), numeric-invariant lint | |
| `golden.avoid` | judge (`wrongClaims`), avoid-phrasing lint | `contradicted` corroboration rows document why avoid traps exist (§2.5) |
| `golden.notes` | judge prompt (unchanged GRADER NOTES heading), evidence-pack term extraction | rename of `graderNotes`; nested under `golden` because judge-visible |
| `tags.category` | sampler report, grade-plan rules, directory layout (compile-enforced) | |
| `tags.service` | **sampler strata** (`lib.mjs` id-sorted deterministic strata — kept; Grok MJ-3), by-service report, grade-plan rules | gains `skills` value |
| `tags.freshness` | judge leniency block (`!= "stable"`), evidence-pack gate (`!= "stable"`), stale gate scoping, live-lane semantics | tri-state, §2.4 |
| `tags.trap` | judge behavior branch (value interpolated), traps report, safety sampling | closed enum §2.5 |
| `truth.domain` | gospel-change lint, corroboration-requirement lint, human triage | |
| `truth.status` | run-qa result rows (verdict-triage skepticism signal, replacing dead `confidence`), gospel lint (`disputed` ⇒ golden must not pin — warn), stale gate | |
| `truth.asOf` | gospel lint required-when rules, stale gate, human auditor | |
| `truth.reverifyBy` | **CI stale gate** (`lint-corpus --stale`: past-due = FAIL, §7.3) | date, not a horizon enum; consumer ships in same PR |
| `truth.sources[]` | gospel lint (non-empty; class-mix warn for numeric claims), human auditor | old dead-at-runtime `golden.sources` moved here |
| `truth.corroboration[]` | corroboration-requirement lint, register sweeps, human auditor | B's claim-row shape; optional; required-when rules §2.5 |
| `truth.verified` | **gospel-change CI lint** (the score-laundering guard), human auditor | latest event only; `git log -p` is history |
| `truth.origin` | migration-ledger cross-check, human auditor | one cheap string |

### 2.3 Dropped fields (unchanged from Draft A; all verified consumer-free or superseded)

`tags.difficulty` (zero consumers ever), `tags.confidence` (superseded by `truth.status` + dated
corroboration), `tags.freshnessHorizon` (10-value vocab, zero consumers → `reverifyBy` date with a
shipped consumer), `tags.liveData`/`tags.transcriptEvidence` (folded into the tri-state, §2.4),
`golden.sources` (moved to `truth.sources`), top-level `graderNotes`/`graderNotesHistory` (git is
history; appends baked into `golden.notes` at migration), the entire override subsystem, wrapper
`skipped/mapping/overrides`, external `answerRegex`/weighted rubrics/`pass_threshold`, typed
`passIf/failIf/inconclusiveIf` routing (deferred, §12), per-case `schemaVersion`, B's required
`coverage.class` (weakest-earning field per both reviews), B's headline `contracts.json`
membership indirection (glob of owned files suffices).

Migration-record note (Opus blind spot): `run-qa.mjs` copies `c.tags` verbatim into result rows,
so old result files carry `difficulty/confidence` keys and new ones will not; nothing branches on
them, but the migration record states the row-shape change for anyone diffing old vs new results.

### 2.4 Freshness tri-state — Draft B's encoding, behavior-identical placement (Resolution 5)

`tags.freshness ∈ { "stable", "scheduled", "live" }`, judge-visible in `tags` (Opus graft #1 —
NOT buried under judge-blind `truth`).

Verified current state: battery has 241 `freshness:true` cases, **0** `liveData`, **0**
`transcriptEvidence` anywhere; all 12 live-lane cases are `freshness:true, liveData:true`. So the
triple-OR pack gate's truth table over real data is exactly "freshness is truthy".

Migration mapping (mechanical, provably behavior-identical):

| Old flags | New value | Cases |
|---|---|---|
| `liveData: true` | `"live"` | 12 (live lanes only) |
| `freshness: true`, no liveData | `"scheduled"` | 241 (battery) |
| neither | `"stable"` | 228 (battery) |

Code changes: judge renders the **same fixed** freshness-leniency string iff
`tags.freshness !== "stable"` (previously: truthy — identical set, identical bytes); pack gate
becomes `tags.freshness !== "stable"` (previously the triple-OR — identical truth table). Both
covered by the promptSha256 fixture proof. `scheduled` additionally requires `truth.asOf` +
`truth.reverifyBy`; `live` means behavioral golden + live-lane or live-flavored battery case
(reverifyBy optional — live goldens assert behavior, not snapshots). Pruning packs from
`scheduled` cases is a **deferred measured decision** (§12), not smuggled into migration.

### 2.5 Closed enums

- `tags.trap` (8 values): `out-of-scope | injection | paid-bait | fabrication-bait | scam-check |
  speculation | cant-do | ambiguous`. `governance` (1 case) is tolerated at migration with a lint
  warn and dissolved in P4; the enum then closes at 8.
- `truth.corroboration[].verdict` (**6 values**, Resolution 3):
  `confirmed | confirmed-as-of | disputed | unverifiable | corpus-only | contradicted`.
  Rules: `confirmed-as-of` for dated point-facts; `contradicted` is legal **only** for claims
  mirrored in `golden.avoid` (it documents, with evidence, why an avoid trap exists) and never for
  claims the golden answer asserts — lint-enforced. The GT-sweep's 34 ad-hoc verdict strings
  normalize onto these 6 (+ free-text `note` for nuance); the normalization table is a migration
  deliverable reviewed in P3.R.
- Corroboration **required-when** (lint lane): FAIL if `truth.status ∈ {disputed, unverifiable}`
  and `corroboration` is empty; FAIL if the case is listed in a register `numericInvariants`
  entry's affected ids and has no corroboration row for the invariant claim; FAIL if a keyFact
  matches the numeric/version/date detector on a `real-world` case and no corroboration row
  covers it. Negative-claim detection is heuristic (phrase patterns → warn level); the hard
  requirement for negative claims is carried by the golden-truth skill + P4 review gates, stated
  honestly rather than pretending a regex can prove negativity.
- `truth.sources[].class`: `A–F` exactly as the golden-truth skill defines.

### 2.6 Provenance import rules (lossless, no re-litigation)

- The 372 effective-override cases: `truthDomain`→`truth.domain`; corroboration normalized 34→6 +
  note; latest `evidence`/`rootCause`→`truth.verified`; `why` collapses into `verified.by` + the
  ledger.
- The ~97 non-overridden cases: `verified.by` = their GT cluster ref from the checksummed cluster
  JSONL in scratchpad 575 (re-verify `sortedActiveIdsSha256` first); sources moved from
  `golden.sources` with classes inferred from a domain table
  (developers.stellar.org→A, github.com/stellar→B, stellarlight/lumenloop→C, else D;
  `note: "class inferred at migration"`).
- Dispute encodings (SEP-7/8, MoneyGram scopes, YieldBlox figures, LOBSTR totals, PYUSD
  time-slices, Meridian venue, TVL ranges) carried **verbatim** as `status: "disputed"` +
  corroboration rows — never flattened.
- **No attribution to failed process 3376** anywhere (Grok #12). The GT-53 trio
  (run-tune-own-horizon, scaffold-stellar, sdk-package-rename) carries whatever final state 3153
  landed; if their blind lane did not complete, `verified` notes provisional status and they get
  near-term `reverifyBy` dates.

---

## 3. File / directory structure (Resolution 5)

```
eval/qa/
  corpus/
    battery/                              # THE corpus — one JSON per case, hand-owned
      protocol-core/  soroban/  tooling-infra/  assets-anchors-seps/  defi-ecosystem/
      scf-grants-builders/  compliance-rwa-payments/  history-org-tokenomics/
      retail-consumer/  edge-behavior/    # 10 dirs, ~19–68 files each
    live/
      live-cases.json                     # contract live-data-canonical-v2 (frozen whole file)
      live-digest-supplement-cases.json   # contract live-digest-supplement-v2
    migration-ledger.json                 # committed permanently; lint-enforced exhaustive (§5)
  cases.json                              # GENERATED compiled battery (committed, CI byte-pinned)
  sample.json                             # GENERATED stratified sample (committed, CI byte-pinned — new)
  consistency-register.json               # path UNCHANGED (skills reference it — Grok #16); rebuilt §9.4
  compile-qa.mjs  judge.mjs  evidence-pack.mjs  run-qa.mjs  lint-corpus.mjs  lib.mjs
  results/                                # local-only, unchanged
  reviewed/                               # dated records incl. migration audit record
```

Decisions:

- One file per case, strict JSON (no frontmatter — the regex parsing is precisely the fragility
  being retired), `filename == id`, `dir == tags.category`, both compile-enforced. Per-case git
  history replaces the override/history apparatus; concurrent Solo lanes stop contending on one
  1 MB file.
- Category subdirs (10), not flat, not service dirs — service is a mutable routing expectation;
  category is a property of the question. No id↔category coupling: recategorization never forces
  a re-id.
- Generated artifacts keep their **current paths** (`eval/qa/cases.json`, `eval/qa/sample.json`)
  — less CI churn than B's `generated/` move (Grok MN-5), same effect once both are byte-pinned.
- **Live lanes: Draft A's frozen whole-file contracts + Draft B's membership/version pins.** Both
  files bump to v2 (schema-migrated bodies: tri-state freshness, dropped `difficulty`, `truth`
  blocks with behavioral status). Each file carries `contract` (name-v2), an explicit ordered
  `membership` id array, and `contractProvenance.caseContentDigest`; `eval/self-test.mjs` asserts
  all three (it already asserts membership + digest for v1 — verified). Membership stays frozen at
  10 + 2; expansion is a deferred, version-bumped decision (§12).
- **`eval/corpus/` KEPT** (raven-next and raven-golden-qa). Not sentiment — verified live routing
  dependency (§0) and the external harvest sources (boxy/kaan/raph/core-35) live there.
  `eval/corpus/PROVENANCE.md` gains one scope paragraph: "as of <date> the QA battery is owned at
  eval/qa/corpus/ and no longer compiled from these snapshots; they remain the routing eval's
  label source and archival prior art. Mining them for gospel is prohibited — the owned corpus +
  migration ledger are the truth record." (Policy replaces `rm -rf`, per Grok fork 3.)
- **Overlay DELETED post-migration** in its own commit: `golden-overrides.json` (1.03 MB),
  `grader-notes.mjs` (63 lines), `test/qa-grader-notes.test.mjs` (71 lines).

---

## 4. Taxonomy + coverage matrix (Resolution 6)

### 4.1 Categories (10)

Draft A's taxonomy verbatim: `protocol-core`, `soroban`, `tooling-infra`, `assets-anchors-seps`,
`defi-ecosystem`, `scf-grants-builders`, `compliance-rwa-payments`, `history-org-tokenomics`,
`retail-consumer` (new — raph lane + jutsu wallet/payments demand), `edge-behavior` (rename of
`edge-governance`; judge-blind, safe at migration). In-catalog traps live in their subject
category with `tags.trap`; only decline-family none-service cases live in `edge-behavior`.
`tags.service` gains `skills` (~13 existing cases re-tag at migration; P4 grows the stratum).

### 4.2 Coverage matrix — sums verified

Battery target **450**. Flow: **469 − 148 retired = 321 continuing (incl. 10 recategorized into
retail-consumer) + 70 harvested + 59 authored = 450.** Every column and row below closes.

| Category | Current | Retired | Recat (net) | Harvested | Authored | **Target** |
|---|---:|---:|---:|---:|---:|---:|
| protocol-core | 55 | −15 | 0 | 0 | +6 | **46** |
| soroban | 79 | −27 | 0 | +10 | +6 | **68** |
| tooling-infra | 83 | −36 | −4 | +9 | +6 | **58** |
| assets-anchors-seps | 55 | −12 | −4 | +4 | +4 | **47** |
| defi-ecosystem | 71 | −27 | −2 | +8 | +5 | **55** |
| scf-grants-builders | 45 | −15 | 0 | +8 | +8 | **46** |
| compliance-rwa-payments | 29 | −3 | 0 | +8 | +4 | **38** |
| history-org-tokenomics | 15 | −2 | 0 | +1 | +5 | **19** |
| retail-consumer | 0 | 0 | +10 | +20 | +3 | **33** |
| edge-behavior | 37 | −11 | 0 | +2 | +12 | **40** |
| **Totals** | **469** | **−148** | **0** | **+70** | **+59** | **450** |

Harvest by source (70): boxy 16 (tooling 5, defi 6, scf 5) · kaan 24 (soroban 10, compliance 8,
assets 4, tooling 2) · raph 22 (retail 20, edge 2) · core-35+flue 8 (tooling 2, defi 2, scf 3,
history 1). Between B's starved 54 and A's 84, per Grok MJ-6.

Authored by lane (59): gap-ops 22 (pc 2, sor 4, tool 6, ass 2, defi 4, scf 4) · 2026-events 12
(pc 3, scf 2, comp 2, hist 5) · **safety/refusal 12** (edge — incl. the issues/842 faucet-lure
pattern as the marquee injection case, SSRF/sandbox probes validating `globalOutbound: null`,
price-advice, account-support redirect, Pi-Network confusion) · cross-service 10 (pc 1, sor 2,
ass 2, defi 1, scf 2, comp 2) · retail jutsu-phrasing 3.

The per-category **targets are binding minimums** at P4 close (see §13 deviation c for the
reading); the band 440–470 exists so floors win over the round number if the coverage report
shows a hole.

### 4.3 Cross-cutting floors (binding; enforced by `lint-corpus --coverage` from `surface`)

- **Every exposed operation ≥2 case mentions** in advisory surface (one happy path, one
  edge/degrade/NEG), **except partner-onboarding-type exclusions** (`partnerOnboard` 0–1: it is
  interactive and weakly Q&A-shaped).
- **Every served skill (18) ≥1 case where the skill is the best source**; `skill.run` digest ≥2
  battery-adjacent cases (plus the 2 frozen supplements).
- **Dedicated cross-service set ≥12** (10 authored + ≥2 harvested composition cases; keyFacts must
  require both families — "could have used either" does not count).
- Every catalog-note trap = 1 dedicated case (person-entity empty lane, winner-order, AV offset ≠
  timestamp, payload `data.ok`, unindexed API refs, semantic fallback, matchPartners 503,
  zero-upcoming fallback). NEG/soft-empty ≥20; VOCAB ≥6.
- Freshness-pinned share target ≤35% (from 51%) via Lane R behavioral conversions — maintenance is
  cut structurally, not by count.
- Expected service mix ≈ stellarDocs 185 / scout 120 / lumenloop 75 / skills 42 / none 28 (=450).

Non-goals carried from Draft A (endorsed by both reviews): no multilingual lane (English
measurement contract; B's ES/PT slice is an unfunded judge-contract change — deferred §12), no
compiler-error-debugging lane, no routing-eval migration in this program.

### 4.4 Retirement rules (Lane R; ~148)

Retire only for: (i) keyFact-subset redundancy inside a register cluster (keep the strongest);
(ii) >3 cases on the same docs page with no distinct failure mode; (iii) trap variants beyond
subtype quota; (iv) golden restates another golden. NEVER for being hard, freshness-costly
(convert instead), or scoring badly. Every retirement gets a ledger row with reason.

---

## 5. Migration ledger (Resolution 7)

`eval/qa/corpus/migration-ledger.json` — committed permanently, seeded by the migration script,
maintained by P4 lanes, **completeness lint-enforced**.

Row shape:

```jsonc
{ "sourceId": "q-soroban-storage-types",     // or external: "boxy sl-07", "kaan k-31", …
  "source": "battery-2026-07",               // battery-2026-07 | boxy | kaan | raph | core-35 | flue
  "disposition": "carry",                    // carry | merge | redefine | retire
  "destination": ["q-soroban-storage-types"],// required for carry/merge/redefine
  "reason": "…" }                            // required for merge/redefine/retire
```

- At the migration commit: all 469 battery ids = `carry` (mechanical, byte-continuous goldens).
- P4 Lane R flips ~148 to `retire`/`merge` with reasons; harvest lanes add all 161 external-source
  rows (boxy 21, kaan 49, raph 55, core-35 35, flue 1): adopted items → `redefine` (new `q-*`
  destination, `truth.origin` mirrors the lineage) or `merge` (absorbed into an existing case);
  not-adopted → `retire` + reason.
- Lint (part of `lint-corpus`): every battery id appears exactly once; every external id appears
  by P4 close; dispositions valid; destinations exist in the compiled battery; `carry`/`redefine`
  destinations' `truth.origin` cross-checks the ledger. Losslessness is thereby auditable in one
  command, without shipping duplicate questions and without keeping the overlay.
- `big.json`/og/flue-core rows: recorded `retire`-superseded wholesale (they remain in-tree as the
  routing label source; no truth is mined from them).

ID policy (unanimous across drafts/reviews): preserve `q-*` ids wherever content is continuous
(GT provenance, 110 improvements findings, register, live pins, longitudinal results all key on
them); fresh ids `q-<short-domain>-<intent>` for new/harvested; never recycle; substantive
redefinition ⇒ new id (false continuity is worse than a broken series).

---

## 6. Tooling deltas (with estimates)

| # | Component | Change | Est. |
|---|---|---|---|
| 1 | `scripts/migrate-qa-corpus.mjs` (one-shot; kept in git, deleted after landing) | Read compiled post-override `cases.json`; emit per-case files (renames; tri-state mapping §2.4; truth blocks §2.6; verdict normalization 34→6); emit ledger; convert live lanes to v2 | ~350 |
| 2 | Projection + promptSha256 verifier | §1 proof obligations; fixtures land in judge self-test | ~120 |
| 3 | `compile-qa.mjs` | Full rewrite, smaller: glob `corpus/battery/**/*.json`; validate (required fields, closed enums, filename==id, dir==category, unique ids, keyFacts 1–5, `asOf`/`reverifyBy` required-when, sources non-empty w/ valid classes, ledger cross-checks, register finding-id cross-check); sort by id; **always emit `cases.json` + `sample.json`** (B mechanic; `--sample` flag deleted — sampler verified deterministic: id-sorted strata, even-spaced picks, no seed) | new ~230; deletes corpus-read/frontmatter/override plumbing from the 292-line current file |
| 4 | `judge.mjs` | Read `golden.notes`; freshness test `!== "stable"`; self-test gains the promptSha256 fixtures. **No rubric bump** | ~35 |
| 5 | `evidence-pack.mjs` | Gate = `tags.freshness !== "stable"` (one line at :180); term extraction reads `golden.notes` | ~10 |
| 6 | `run-qa.mjs` | Renames; copy `truth.status`/`truth.asOf` into result rows (replaces dead `confidence` triage signal) | ~25 |
| 7 | `lint-corpus.mjs` (replaces 104-line `lint-goldens.mjs`) | Six lanes: **(a)** manifest/surface check — every `surface` id ∈ manifest + emitted-text guard over question/golden/notes for non-exposed op/skill refs (reuse `scripts/emitted-text-guard.mjs` / `assertNoNonExposedRefs` approach, incl. paid-Lumenloop names); **(b)** numeric invariants — read register `numericInvariants` (reserves, fees, min-balance formula, protocol floor, dated ceilings — todo 936); exact contradiction = FAIL, fuzzy = warn; **(c)** gospel-change guard (CI, merge-base diff): change to `question` OR `golden.*` OR judge-facing tags (`freshness`, `trap`) ⇒ `truth.verified` changed in same diff with non-empty evidence + rootCause; rootCause denylist (score/result-file-only rationales rejected); `freshness-drift` allowed (Grok MJ-1 widening); **(d)** avoid-phrase hygiene (ported); **(e)** `--coverage` floors (§4.3); **(f)** `--stale`: past `reverifyBy` = **FAIL** (§7.3); plus corroboration required-when (§2.5) and ledger completeness (§5) | ~450 |
| 8 | `eval/self-test.mjs` | Live v2 contracts: assert name, ordered membership, caseContentDigest; optional corpusContentSha256 recompute pin | ~30 |
| 9 | `.github/workflows/ci.yml` | **Current reality (verified):** diff list pins `eval/qa/cases.json` only; compile runs without `--sample`; neither `eval:qa:lint` nor judge self-test runs. **Change:** add `eval/qa/sample.json` to the diff list (compiler now always emits it); add `lint-corpus` gate (incl. gospel lane, needs `fetch-depth: 0`) + `eval:qa:selftest`; add `--stale` to PR CI and to the daily drift workflow (§7.3) | ~20 yaml |
| 10 | Register helper | `memberContentSha256` stamp/auto-reopen vs per-case file hashes (A) + `numericInvariants` + `dateContingentTraps` collections (B graft); seed hashes at migration; missing historical hashes never block (Grok #9) | ~90 |
| 11 | `grade-plan.mjs`, `lib.mjs` | 10-category table + `skills` service; path constants | ~25 |
| 12 | Misc renames | `compare-architecture-ab.mjs`, `cluster-missing-facts.mjs`, `analyze-composition.mjs`, `scripts/run-playground-semantic-eval.mjs` (Grok #17) | ~20 |
| 13 | Docs/skills | §10 | ~½ day |

Deletions: `golden-overrides.json` (1.03 MB), `grader-notes.mjs` (63), `test/qa-grader-notes.test.mjs`
(71), `lint-goldens.mjs` (104), compile-qa's raven-next/frontmatter/override code. Net: the compile
is smaller than what it replaces; ~550 KB of per-case files added.

---

## 7. CI contract (Resolutions 5, 9, 10)

### 7.1 Byte-identity

The generated-artifacts step keeps its exact mechanism; the QA entries in the diff list become
`eval/qa/cases.json eval/qa/sample.json`. `eval/routing-cases.json` stays pinned and
`compile-routing.mjs` keeps compiling from `eval/corpus/` untouched — **routing CI must stay green
with raven-next present at every slice**; that is an acceptance criterion, not a side effect.

### 7.2 Gospel-change guard (score-laundering successor)

Compile-time perpetual override provenance is replaced by moment-of-change CI enforcement
(lint lane c, §6#7). Residual gap — local/out-of-CI edits — is covered by (i) merges gating on CI,
(ii) a documented `lint-corpus --since <ref>` pre-push check written into the golden-truth skill
for Solo lanes.

### 7.3 Stale gospel = failing signal (Resolution 9 — the blind spot both drafts missed)

`lint-corpus --stale` fails on any case whose `truth.reverifyBy` is past due. Wired twice: the PR
lint gate, and the **daily drift workflow** (so a date passing fires within 24 h, not on the next
unrelated PR). The failure's remedies are both auditable: re-verify (update `verified` + `asOf` +
new `reverifyBy` — gospel lint sees the evidence) or an explicit dated extension with rootCause.
Operability rules: `reverifyBy` dates are set quarter-granular and staggered by the verifying
author so the queue drips instead of cliffing; the truth-maintenance skill owns the queue.

---

## 8. P3 commit plan (Resolution 8)

All work on branch **`super-corpus`** off current main; main stays deployable throughout. Every
slice must pass: `npm run typecheck`, `npm test`, `npm run build` (dry-run), the generated-artifacts
byte-identity step, `npm run improvements:lint` (where improvements change), and
`npm run secrets:scan -- --tree`. Merge to main happens once, after P3.R review reconciles.

**P3.0 — preflight.** Verify `git status --porcelain | sha256sum` =
`9b4b5c04…72ea` (verified matching on 2026-07-11 by this lane); create the branch. Any mismatch is
investigated before slicing. Corpus content is **frozen** from C1 until C5 lands — golden edits in
the window would fork truth between overrides and owned files.

**C1 — GT-sweep bundle** (todo 917 work product; cites scratchpad 575 rev 291). From 3153's
declared roots: `eval/qa/{golden-overrides.json, cases.json, sample.json, README.md,
consistency-register.json, compile-qa.mjs}`; all of `improvements/` (modified: INDEX.md,
intake.json, ll-003/005/006/007/008/009, sk-006, sd-003/005/007, sls-011; untracked: ll-011–019,
sk-009/010, sd-011–036, sls-019–045); all of `research/audits/` (the 17 untracked GT-31…GT-56
audit docs). CI-consistent standalone: compile-qa reads corpus+overrides only, no manifest
dependency.

**C2 — drift bundle** (issue 19 artifacts; issue **stays open** — deploy-authorized closure is
separate work; the super corpus never depends on it): `catalog/manifest.json`,
`inventory/{stellar-docs-titles.json, stellar-light.json}`, `research/services/stellar-light.md`,
**plus `specs/super-spec.json`** — a DEVIATION from the dictated "(b) NOT super-spec / (c) spec
lane" split, forced by repo reality: `super-spec.json` is generated by `npm run spec:build`
(`scripts/build-super-spec.mjs` reads `inventory/stellar-light.json` at :578-579 and
`catalog/manifest.json` at :582), and CI's generated-artifacts step runs `spec:build` and
byte-diffs `specs/` — committing manifest+inventory without the regenerated super-spec is CI-red
in either order. The commit message attributes the super-spec regen to the spec lane explicitly.
The dictated standalone Commit C dissolves (§13a).

**C3 — migration structure.** `eval/qa/corpus/` skeleton, `scripts/migrate-qa-corpus.mjs`, the
projection/promptSha256 verifier, ledger schema doc. Inert; CI-green.

**C4 — per-case files.** Script output: 469 battery files + `migration-ledger.json` (all `carry`)
+ live v2 file bodies staged. Inert — the old compiler still reads corpus/raven-next+overrides;
nothing reads the new files yet. CI-green.

**C5 — tooling + generated artifacts (atomic).** Compile rewrite, judge/pack/run-qa/lib/grade-plan
deltas, `lint-corpus.mjs`, live-lane v2 cutover + self-test digests, ci.yml changes, regenerated
`cases.json` + `sample.json`. Atomic because the byte-identity step runs the new compiler — new
tooling with old artifacts (or vice versa) is CI-red by construction (§13b). The projection
audit + promptSha256 proof run here and their results are recorded in the commit message and
[`eval/qa/reviewed/2026-07-super-corpus-migration.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/eval/qa/reviewed/2026-07-super-corpus-migration.md).

**C6 — delete-legacy (overlay only; Resolution 4).** `golden-overrides.json`, `grader-notes.mjs`,
`test/qa-grader-notes.test.mjs`. Nothing else — raven-next/raven-golden-qa untouched. A repo-wide
grep proves no runtime/docs/skill references to the deleted files remain (skills currently carry
6 `golden-overrides` references — rewritten in C7, so C6+C7 may merge-review together, but the
deletion diff stays its own commit for unambiguous review).

**C7 — docs/skills** (§10): README rewrite, four skill updates, PROVENANCE.md scope note,
AGENTS.md correction.

**P3.R — independent adversarial review of C3–C6** (reviewer ≠ author): `grok-4.5` high runs the
verifier, spot-audits 20 random per-case files against scratchpad 575 / KV sealed matrices for
provenance fidelity, checks dispute encodings verbatim and the 3376-attribution ban. Every finding
reconciled; then merge `super-corpus` → main. Todo 917's evidence chain stays intact (C1 message
cites it). Estimated P3 wall time: ~1.5–2 days.

---

## 9. P4 build plan (Resolution 11)

P4 runs as scoped PRs after the P3 merge. Model routing per AGENTS.md; all Solo-spawned lanes
non-interactive with the saved bypass flag; disjoint file sets per lane (category dirs make this
natural). The fan-out unit is a truth cluster.

### 9.1 Lanes

| Lane | Scope (count) | Author | Verification policy |
|---|---|---|---|
| R rebalance | retire ~148 + freshness→behavioral conversions + governance-trap dissolution + ~10 recategorizations | `gpt-5.6-terra` high proposes; **Fable/Opus adjudicates** (taste call); ledger rows mandatory | conversions change gospel ⇒ full golden-truth process + gospel lint |
| H1 boxy + core-35 (24) | live-data behavioral redefinitions, orchestration/meta | `gpt-5.6-sol` high | **primary + blind** for every numeric/negative point fact |
| H2 kaan (24) | zk depth, agentic payments (x402/MPP), passkey, CCTP, anchors | `gpt-5.6-sol` high | primary + blind for CAP/protocol status claims (stale-status risk class; expect improvements findings) |
| H3 raph + retail (25) | retail-consumer lane + jutsu phrasing | `gpt-5.6-terra` high | blind for scam/negative claims; **Fable review** for retail voice |
| N1 gap ops (22) | zero-coverage operations + catalog-note traps | `gpt-5.6-terra` high | live probe (class C/F) + op spec/docs (class A); no blind needed for service-contract truths |
| N2 2026 events (12) | Q1–Q2 timeline, SLP, incidents, Meridian/TVL disputes-as-disputes | `gpt-5.6-sol` high | **primary + blind** (recent web-sourced facts) |
| N3 safety (12) | 842 faucet lure, SSRF/sandbox probes, price-advice, account-support redirect | `gpt-5.6-terra` high | **Fable review** (behavior-grading semantics); behavioral, no blind |
| X cross-service (10) | 2+-family composition | `gpt-5.6-sol` high | probe both families; corroboration per contributing claim |

**Blind re-derivation is MANDATORY for real-world numeric/status/negative claims and anything
`disputed`** (Resolution 11): the blind lane seals its matrix (scratchpad/KV) before reading the
primary — the GT-sweep pattern, kept. Corpus-grounded claims need live probe + external-footprint
sample; behavioral/live goldens need probe + contract doc. If any lane misses the quality bar,
rerun with a stronger listed model without waiting (AGENTS.md).

### 9.2 Golden-truth rigor per case

Unchanged migrated cases: accepted GT result imported, no re-litigation (reopen only on expired
evidence, consolidation, or new contradiction). Wording-only edits: semantic-identity check +
`verified` update rootCaused `eval-authoring`. New/changed stable claims: ≥2 independent source
classes, primary required for protocol/numeric/version/date/attribution. Corpus-grounded:
labeled `corpus-only` when no external footprint. Volatile: dated primary + independent class,
`scheduled` with visible as-of, or converted to behavioral `live`. Negative/disputed: blind
mandatory; disputes stay disputes. Safety: verify the premise and the safe boundary; a trap can
never punish a possibly-true claim. Executable procedures: class F unless unsafe (limitation
recorded).

### 9.3 Gates per lane and at close

Per lane: compile + `lint-corpus` (all lanes) + judge self-test + 3-case smoke against the Solo
dev process. Round close: full baseline gates; register sweep over every new/changed cluster;
`--coverage` vs §4.3 floors; ledger completeness (all 469 + 161 external ids dispositioned);
**independent adversarial review of the whole corpus diff** — `grok-4.5` high fact-check
spot-audit (≥10%), **Fable/Opus** question/answer quality + copy review — every finding
reconciled (reviewer ≠ author, run to completion).

### 9.4 Consistency-register rebuild

Register stays at its path; rebuilt with three collections: `clusters` (member ids +
`memberContentSha256` + last-checked + verdict + finding refs; auto-reopen on member-hash change),
`numericInvariants` (named semantic invariant, authoritative value/rule, evidence, date policy,
affected ids — the lint lane-b input; todo 936), `dateContingentTraps` (trigger date/event,
required recheck, disposition). Hashes seeded at migration; historical sweeps without hashes never
block.

### 9.5 Final measurement re-anchor

One **full-battery QA run** (450 cases) + sample-30 + live-10 under rubric v2.4 / pack p3, models
per the run-evals measurement contract. This is the new baseline of record. Interpretation is
**noise-floor-aware**: deltas within the established ~23% judge noise floor are not treated as
signal; old baselines are archived in `reviewed/` with an explicit "denominator changed at the
rebuild" note; per-id comparisons remain valid for continuing cases (same rubric — the point of
Resolution 2). Expected byproduct: a fresh batch of `improvements/` findings from H1/H2/N2 — the
corpus's actual product — filed via the improvements-pipeline as they surface.

P4 estimate: ~5–8 agent-days compressed to 2–3 wall days with 6–8 parallel lanes; review ~1 day.
Paid research spend concentrates in H1/H2/N2 (gospel is worth expensive verification).

---

## 10. Docs, skills, and todo dispositions (Resolution 12)

- **`eval/qa/README.md` rewritten current-state-only, ~10 KB** (from 40,661 bytes): schema
  reference, directory/lane map, commands, comparability rules, links to skills. All run
  archaeology and rubric narrative move to a dated [`research/audits/2026-07-qa-history.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/research/audits/2026-07-qa-history.md);
  the short rubric changelog already in the `judge.mjs` header stays (Grok MN-3).
- **`golden-truth` SKILL.md**: rewritten for owned files — edits land in per-case files; the
  gospel-change lint replaces override enforcement; corroboration required-when rules; the
  `lint-corpus --since` pre-push check; blind/fan-out rules unchanged.
- **`run-evals` SKILL.md**: paths, new lint gates, baseline/denominator note, stale-gate triage.
- **`truth-maintenance` SKILL.md**: the `reverifyBy` stale queue replaces batch re-audits as the
  freshness lane.
- **`improvements-pipeline` SKILL.md**: "fix via golden-overrides entry" language → owned-case
  workflow (Grok MJ-8: the repo-wide reference sweep is an acceptance gate; 6 skill references to
  `golden-overrides` exist today).
- **`eval/corpus/PROVENANCE.md`**: scope paragraph (§3).
- **AGENTS.md**: the vendored-corpus line is corrected to state both roles: "Retained prior art is
  read-only under `eval/corpus/`; it is also the routing eval's committed label source. The QA
  battery is owned under `eval/qa/corpus/` and does not read it."
- **Todo 935 (tags overrides): DISSOLVES.** It existed only because freshness/trap tags lived in a
  read-only vendored base and could be changed solely through the override file. Under owned
  per-case files a tag edit is an ordinary reviewed diff caught by the gospel-change lint
  (freshness/trap are judge-facing). Close with a pointer to this design.
- **Todo 936 (manifest lint + numeric invariants): ABSORBED** into `lint-corpus` lanes (a) and (b);
  close when C5 lands in CI.
- **Todo 904** (2026-08-04 transport re-audit): untouched; one authoring note — no
  MCP-transport-adjacent trap cases before that re-audit lands.
- **Issue 19**: stays open by design; C2 is not deploy authorization.

---

## 11. Acceptance criteria (the rebuild is done only when all hold)

1. Fingerprint verified pre-slice; C1–C7 each landed CI-green + secrets-scanned on `super-corpus`.
2. **Empty judge-visible projection diff** (incl. trap values, freshness-block and pack-gate bits)
   and **identical promptSha256** across the fixture spread; rubric stamped v2.4 throughout.
3. Routing eval green with `eval/corpus/` intact: `compile-routing.mjs` byte-identity +
   `eval:routing --gate` pass at every slice.
4. Migration ledger exhaustive and lint-enforced: 469 battery ids + 161 external ids, each with a
   valid disposition, destinations resolvable, `truth.origin` cross-checked.
5. Overlay deleted in its own commit; repo-wide grep shows zero references to
   `golden-overrides.json` / `grader-notes.mjs` outside git history and dated research.
6. Battery = 450 (band 440–470) with the §4.2 matrix satisfied as per-category minimums and every
   §4.3 floor met per the coverage report; safety lane includes the 842 lure.
7. `lint-corpus` fully green in CI: manifest/surface + emitted-text guard, numeric invariants,
   gospel-change guard (question + golden + judge-facing tags), avoid hygiene, corroboration
   required-when, coverage floors, ledger completeness — and `--stale` wired as a **failing**
   signal in PR CI and the daily drift workflow.
8. `cases.json` AND `sample.json` byte-pinned in CI; compiler emits all artifacts on a bare run;
   judge self-test runs in CI.
9. Live lanes at v2 with membership/version/digest pins asserted by `eval/self-test.mjs`;
   membership still 10 + 2.
10. Register rebuilt (clusters + numericInvariants + dateContingentTraps) with member hashes
    seeded; every new/changed cluster swept.
11. Blind re-derivation evidence exists for every numeric/negative/disputed real-world claim
    added or changed in P4; disputes encoded as disputes; zero attribution to process 3376.
12. Independent adversarial reviews (P3.R migration; P4 close) completed with every finding
    reconciled; reviewers differed from authors.
13. Docs/skills describe only the current system; todos 935/936 dispositioned; new full-battery
    baseline recorded with the noise-floor interpretation note.

---

## 12. Deferred follow-ups (recorded, NOT part of this rebuild — each is its own future todo,
separately measured on the run-evals boundary)

1. **Judge v3: typed `inconclusiveIf` + non-scored `inconclusive` outcome** (Draft B). Solves the
   real soft-empty/live coin-flip problem. Requires: rubric version bump, new self-test fixtures,
   re-derived noise floor, A/B against v2.4, and an authoring quota/lint so `inconclusiveIf` cannot
   become a coverage-hiding channel (Grok MJ-7).
2. **Pack-gate pruning for `scheduled` cases** (drop evidence packs from the ~241-case class):
   measured A/B, pack-version bump if serialization changes.
3. **Routing-eval migration onto owned labels** — the only path that ever unlocks deleting
   `eval/corpus/`; a separate measurement contract.
4. **Live-digest membership expansion 2→+N** (Draft B's four behavioral candidates): explicit
   contract version bump + digest pin + separate reporting.
5. **Multilingual ES/PT slice**: needs bilingual judge fixtures and a deliberate
   measurement-contract change.
6. **`coverage.class` stratification field**: only if the sampler demonstrably needs it; today it
   profiles like the deleted `difficulty`.

---

## 13. Deviations from dictated resolutions (verified against repo reality)

a. **Resolution 8's (b)/(c) split is impossible with CI-green at every slice.**
   `specs/super-spec.json` is a generated artifact: `npm run spec:build` →
   `scripts/build-super-spec.mjs`, which reads `inventory/stellar-light.json` (L578-579) and
   `catalog/manifest.json` (L582); CI's generated-artifacts step runs `spec:build` and byte-diffs
   the `specs/` directory. Committing the drift bundle without super-spec (or super-spec without
   the drift inputs, in either order) produces a non-empty diff → red. **Implemented:** super-spec
   rides in C2 with explicit spec-lane attribution in the commit message; the standalone spec-lane
   commit dissolves. The recon's ownership concern ("keep super-spec out of the sweep bundle") is
   still honored — it is not in C1.

b. **Resolution 8's "tooling → generated artifacts" as separate commits** cannot both be CI-green:
   the byte-identity step runs the (new) compiler, whose wrapper output differs from the old
   artifacts, so the compiler rewrite and the regenerated `cases.json`/`sample.json` (plus live v2
   + self-test digests + ci.yml path additions) must land atomically. **Implemented:** C5 is one
   atomic tooling+artifacts commit; the dictated ordering is otherwise preserved
   (structure C3 → per-case files C4 → C5).

c. **Resolution 6's "Draft A's per-category floors as binding minimums"** cannot mean Draft A's
   485-summing targets (they exceed the dictated ~450 total). **Implemented as the only coherent
   reading:** the reconciled 450-summing matrix values (§4.2) are the binding per-category
   minimums, and Draft A's cross-cutting surface floors (§4.3) are binding exactly as dictated.

d. **Trap-subtype relabeling deferred to P4.** Draft A dissolved the `governance` catch-all "at
   migration", but `judge.mjs:54` interpolates the trap kind into the prompt, so any relabel
   breaks Resolution 2's byte-identical projection. Verified blast radius: exactly **1**
   `governance` case (not ~20 as Draft A estimated). It migrates verbatim (lint warn) and is
   relabeled in P4 Lane R under the gospel-change lint.

e. **Interpretation note (not a deviation):** Resolution 6's "safety/refusal lane included (~12)"
   is implemented as ~12 newly-authored safety/refusal cases (lane N3, incl. the 842 faucet lure)
   within the 40-case `edge-behavior` category — matching Draft A's N3 lane and both reviews'
   endorsement of a ~32–40-case safety category.
