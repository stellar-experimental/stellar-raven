# Golden Q→A answer-accuracy eval — the headline instrument

Measures what the routing evals (`eval/run-routing.mjs`, `eval/agentic/`) can't: does an agent
driving this MCP server end-to-end (**search → execute → answer**) produce a **factually
correct, current, non-fabricated answer** to a real Stellar-ecosystem question?

The battery is **owned**: one hand-authored JSON file per case under `eval/qa/corpus/battery/`,
499 cases as of 2026-08-19, edited directly and reviewed like code. The 2026-08-18 retrieval
audit added five service-semantics cases to the prior 492-case corpus. The 2026-08-19
maintenance change added two broad `scout.hackathonBrief` cases. Provenance is first-class (`truth` block per case), gospel changes are CI-linted at
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
  agent-result.mjs                  # pure spawn → structured outcome parser (failure class, usage, artifacts)
  verdict-consistency.mjs           # deterministic verdict-vs-lists checks (no I/O, no model)
  evidence-sanitizer.mjs            # bounded, credential-redacted CLI-failure evidence
  re-judge.mjs                      # side-artifact re-judge of saved rows (never edits the source file)
  verify-evidence-pack-fixtures.mjs # maintenance: checks committed pack fixtures against saved rows
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
  "id": "q-sor-build-target-wasm32v1", // == filename; q-* kebab; stable forever
  "question": "…",
  "surface": ["stellarDocs.search_sdk_cli_tools_docs"], // advisory op/skill ids; NEVER judge/
  // agent-visible; non-empty unless service == "none"
  "golden": {
    // EXACTLY what the judge sees. Nothing else.
    "answer": "…",
    "keyFacts": ["…"], // 1–5 atomic must-appear facts (pinned migration
    // exceptions at 6–7 listed in compile-qa.mjs)
    "avoid": ["…"], // concrete wrong-content traps (phrasing linted)
    "notes": "…" // optional; rendered under the GRADER NOTES heading
  },
  "tags": {
    // machine branching / stratification only
    "category": "soroban", // must equal the parent directory
    "service": "stellarDocs", // stellarDocs | scout | lumenloop | skills | none
    "freshness": "scheduled", // stable | scheduled | live
    "trap": "paid-bait" // optional; value IS judge-visible (interpolated)
  },
  "truth": {
    // judge-blind provenance, first-class
    "domain": "real-world", // real-world | corpus-grounded | mixed
    "status": "confirmed", // confirmed | disputed | unverifiable | mixed
    "asOf": "2026-07-11", // required when freshness != stable OR status != confirmed
    "reverifyBy": "2026-10-01", // required when freshness == scheduled; CI stale gate
    "sources": [{ "class": "A", "ref": "https://…" }], // classes A–F per golden-truth
    "corroboration": [
      // claim rows; required-when rules below; verdicts:
      {
        "claim": "…",
        "verdict": "confirmed", // confirmed | confirmed-as-of | disputed |
        // unverifiable | corpus-only | contradicted
        "evidence": [{ "class": "A", "ref": "…", "observedAt": "…" }]
      }
    ],
    "verified": {
      // LATEST verification event only — git holds the rest
      "date": "2026-07-11",
      "by": "…",
      "evidence": ["<url, results stamp, or .agents/rounds/… path>"],
      // rootCause is required when the event CHANGED gospel;
      // "freshness-drift" is an allowed explicit value
      "rootCause": ["improvements/…"]
    },
    "origin": "raven-next q-sor-build-target-wasm32v1" // lineage; or "authored YYYY-MM"
  }
}
```

Who consumes what (condensed):

| Field                                                 | Consumers                                                                                                                                                      |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `question`, `golden.*`, `tags.trap`, `tags.freshness` | **judge-facing** — the prompt renders exactly these (plus the evidence pack); any change is a gospel change under the CI lint                                  |
| `golden.keyFacts` / `golden.avoid`                    | judge `missingFacts` / `wrongClaims` drivers; numeric-invariant + avoid-phrasing lint                                                                          |
| `surface`                                             | lint (ids must be manifest-exposed), coverage floors — never rendered to judge or agent                                                                        |
| `tags.service`                                        | deterministic sampler strata, per-service reporting                                                                                                            |
| `tags.freshness`                                      | judge leniency block and evidence-pack gate (both test `!== "stable"`); `scheduled` requires `truth.asOf` + `truth.reverifyBy`; `live` means behavioral golden |
| `truth.*`                                             | judge-blind: gospel-change lint, corroboration lint, stale gate, ledger cross-checks, triage signals copied into result rows (`truth.status`/`asOf`)           |

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

# Paid judge behavior self-test: seven judge calls; reports call count and total cost; no MCP server
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
node eval/qa/run-qa.mjs --variant A --sample 30 --port 8788 --server-revision <commit> --expect-sha256 <surface-sha256> --expect-agent-binary-sha256 <wrapper-sha256>
node eval/qa/run-qa.mjs --cases eval/qa/corpus/live/live-cases.json --port 8788 --server-revision <commit> --expect-sha256 <surface-sha256> --expect-agent-binary-sha256 <wrapper-sha256>
node eval/qa/run-qa.mjs --cases eval/qa/corpus/live/live-digest-supplement-cases.json --port 8788 --server-revision <commit> --expect-sha256 <surface-sha256> --expect-agent-binary-sha256 <wrapper-sha256>
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

Server for live lanes: reuse a pane already running `npm run dev:eval` when one exists. Otherwise,
run `npm run dev:eval -- --port 8788`. The launcher requires a clean worktree and compiles its
commit into the Worker's MCP `serverInfo`.

`run-qa.mjs` requires `--server-revision <commit>`, `--expect-sha256 <surface-sha256>`, and
`--expect-agent-binary-sha256 <wrapper-sha256>`. These flags pin the source revision, the bound
server, and the capped Claude executable before spending. The runner checks the listener, revision,
clean state, compiled source revision, and surface again after collection. It rejects a comparison
if these values change.
It still writes the paid rows. It marks the artifact as non-comparable and suppresses aggregates.
Other flags include `--ids a,b,c`, `--no-judge`, `--model`, `--judge-model`, `--cases <path>`,
and `--surface per-operation` for the isolated 50-operation architecture instrument
(`compare-architecture-ab.mjs`). Variant A = the shipped `search` (ADR-0001); B requires a
build exposing a code-shaped tool plus `--search-tool`. Results land in
`eval/qa/results/<stamp>-variant<X>.json` (local-only): rows carry `truth.status`/`truth.asOf`
for triage, the verdict's `{rubric, packVersion, promptSha256}` stamps, and the evidence-pack
hash/size.

**Stored agent outcome (`qa-agent-result-v4`).** `eval/qa/agent-result.mjs` is the
pure parser between one `claude -p --output-format stream-json` spawn and one row;
`run-qa.mjs` and the saved stream fixtures in `test/fixtures/qa-agent-streams/` are its only
adapters, so a failure shape can be pinned without spending. Each row carries exactly ONE
failure field, `agent.failure` — `null`, or `{class, reason, retryable, messageExcerpt, subtype,
exitStatus, signal}` with `class` from `provider-safeguard | transport | timeout | spawn |
protocol | agent | unclassified`. Only `transport` is ever retryable; a provider safeguard is
terminal and is never re-issued or rewritten. The parser blanks the provider notice, so a
safeguard can no longer reach a judge as a candidate answer (the 2026-08-14
`q-n3-ssrf-metadata-endpoint` row recorded `agent.error="success"` — indistinguishable from a
transport blip). Rows also carry `agent.usage.{final,perTurn,perTurnAvailable}` and a bounded
redacted `agent.stderr.{chars,sha256,excerpt}`. `meta.resultsSchema` stamps the shape;
`--judge-stored` refuses a file collected under any other schema.

Version 4 keeps the full search input and a bounded search-result projection. It also requires an
answering-agent directory outside the repository. Answering agents use `--setting-sources ""`,
`--disable-slash-commands`, and `--strict-mcp-config`. They do not use `--safe-mode`, because
Claude Code 2.1.247 drops explicit MCP servers in that mode. Judges keep `--safe-mode` because
they use no MCP server. Recollect version 1, version 2, and version 3 artifacts before comparison
or stored judging. Each artifact hashes the inherited Claude-related environment without recording
its values. Compare this hash between arms.
Each row also records the MCP server status from Claude's system init event. The row fails unless
the explicit `raven` server reports `connected`. The runner stops the batch after the first such
failure and marks the saved artifact as non-comparable.
Other agent failures remain visible as error rows. They do not make a complete QA artifact
non-comparable by themselves. Discovery uses a stricter rule and suppresses aggregates after any
agent error.

The implementation hash covers `eval/qa/*.mjs` and every `eval/lib/*.mjs` file.

**Redaction reads through terminal escapes.** CLI evidence is captured raw, so a credential name
can arrive split by escape bytes that a terminal never shows — `API<OSC>…<BEL>_KEY=…` looks like
`API_KEY=…` on screen but not to a plain string scan. `evidence-sanitizer.mjs` therefore strips every ANSI form
before credential matching: CSI and the control strings (OSC, DCS, SOS, PM, APC) in both their
`ESC`-introduced and single-byte C1 spellings, any other escape sequence, and the remaining C0/C1
controls. Newline, carriage return, and tab survive, so line boundaries do not move. The stripped
text is only emitted when it redacts strictly **more** than the original, so ordinary diagnostics —
a lowercase `token expired before retry`, colored or not — keep their original bytes.
**BEL terminates OSC only.** Inside DCS, SOS, PM, and APC it is ordinary payload, so
those four require ESC-ST or C1-ST; ending them at a BEL would spill the rest of the payload back
into the text and break a split credential name apart again. The same byte-preserving decode runs
on successful judge output — before the envelope is JSON-parsed and before the `resultText`
fallback — so a credential hidden behind a raw 8-bit introducer cannot reach the
unparseable-verdict `rationale`.

String **leaves of a parsed structure** run the same control-aware choice, so an escape- or
NUL-split credential inside `cliFailure.parsedEnvelope` is joined before matching. A leaf runs the
plaintext credential scan only — never the JSON path — because a leaf whose text merely looks like
JSON would otherwise be parsed and re-serialized, rewriting a string nothing was wrong with. A leaf
that gains no redaction keeps its original bytes, colored escapes included, and safe sibling fields
are untouched.

**Property names are classified the same way.** The sensitive-key predicate and the usage-count
allowlist both run on the control-normalized name, so a NUL or escape inside `API_KEY` cannot hide
the credential term from a check while a reader still sees `API_KEY`. Normalization is used for
classification only, and the normalized form never becomes the emitted name. What survives depends
on the name: an **ordinary** name is emitted unchanged, obfuscating bytes included, because an
obfuscated key is itself evidence — classifying it sensitive collapses only its value, and a name
that normalizes to nothing sensitive keeps both its name and its value. A name that **carries a
credential** is rewritten, as described below.

A name carrying an **unterminated** control sequence redacts its value outright. The sequence
swallows whatever followed it, so the normalized name is missing the part that would have
classified it and no check can clear the property as benign — truncation short-circuits the
sensitive test and the usage-count allowlist alike. Such a name is also rewritten rather than
emitted verbatim, because the scanner fails closed on the truncation and replaces the swallowed
tail with the marker.

**The name itself is scanned for credentials.** A property name can BE the secret —
`{"PASSWORD=SECRET": ...}`, a bare prefixed token, `Bearer <token>`, URL userinfo — so each name
runs through the same credential scanner as a string leaf. An ordinary name scans clean and is
emitted unchanged, and a plain `API_KEY` keeps its spelling (it is a name, not an assignment) while
the key predicate still collapses its value. When two secret names scan to the same marker, the
second takes the next free positional suffix (`[redacted]-2`), so no field is silently dropped. The
suffix is positional and never derived from the key: a digest would hand the secret back to anyone
able to test a guess.

Auth schemes match **case-insensitively** (RFC 9110), so `bearer <token>` and `bAsIc <base64>`
redact exactly like the capitalized spelling, in a property name and in plaintext alike. The one
exception is a bare all-lowercase `token`, which is ordinary prose in CLI diagnostics far more
often than a scheme; `Token`, `TOKEN`, and any mixed spelling are treated as the scheme.

Colliding names are assigned in **linear total time**: each base name remembers its next free
suffix instead of restarting the search at 2, which would cost about N²/2 lookups for N names
scanning to the same marker — tens of seconds at 20k keys.

Decoding runs before sanitizing, and it is not `Buffer.toString("utf8")`. That decoder is lossy
for raw C1 bytes: a lone `0x9b` is not valid UTF-8, so it becomes U+FFFD and the 8-bit CSI
introducer is gone before the sanitizer can see it — a credential split by a raw C1 byte would
survive into the excerpt. `decodeCliEvidenceText` decodes every well-formed UTF-8 sequence verbatim
(including sequences whose continuation bytes fall inside 0x80-0x9f, such as `→` = E2 86 92),
maps an invalid byte in 0x80-0x9f to its C1 code point, and leaves any other invalid byte as
U+FFFD. This changes the sanitized **excerpt** only: `totalBytes` and `sha256` are always taken from
the raw captured buffer. One visible consequence — a raw C1 byte now costs two excerpt bytes
(U+0080) rather than three (U+FFFD), so excerpt truncation starts later for C1-heavy streams.

That comparison counts **redaction events reported by the sanitizer**, never occurrences of the
`[redacted]` marker in the output. Evidence can already contain that literal text, and stripping a
control byte out of `[re<NUL>dacted]` would otherwise read as a redaction that never happened and
silently rewrite the excerpt. An **unterminated** escape form wins outright: its hidden tail is
replaced by the marker rather than dropped, because dropping it would lower the stripped variant's
count and hand the choice back to the un-stripped original — which still carries the secret the
escape was hiding.

**Cost totals are reported-only.** `judgeCase` can return a verdict with no `costUsd` when the
provider omits cost data, and the old `costUsd ?? 0` totals made that indistinguishable from a
genuinely free call — silently understating spend. `meta.totalAgentCostUsd`,
`meta.totalJudgeCostUsd`, and `meta.totalCostUsd` now sum **only reported** costs (rounded to 12
decimals), and `meta.costAccounting` says how many were reported out of how many were expected:
`{expectedJudgeCalls, reportedJudgeCalls, missingJudgeCosts, expectedAgentRuns,
reportedAgentCosts, missingAgentCosts}`. A nonzero `missing*` means the totals are a **lower
bound on real spend**, not a complete figure. `expectedJudgeCalls` counts rows that actually
reached a judge, so an unjudged row reads as unjudged rather than as a lost cost.
`re-judge.mjs` carries the same accounting for its own artifacts.

The two usage fields are **not** the same kind of data:

- `agent.usage.final` **preserves the provider's own final usage object verbatim**. Whatever the
  provider emitted is kept as-is — nested blocks, tier and geo strings, iteration arrays and all.
  Nothing inside it is normalized, renamed, or filtered, so do not assume any particular field is
  present or numeric.
- `agent.usage.perTurn` is **normalized by this repo**: one record per assistant message, holding
  exactly `{turn, inputTokens, outputTokens, cacheCreationInputTokens, cacheReadInputTokens}`.
  Only numeric counters are carried; an absent counter stays `null` and is never inferred from
  characters. `turn` is the assistant-message ordinal, so a turn that emits no usage block does
  not shift later turns' labels. `perTurnAvailable` is false when the provider emitted none.

**Artifact-continuation telemetry (`row.artifacts`).** `handlesObserved`, `callSites`, and
`readExecutes` are three different quantities; the first implementation conflated them, so each
now has its own name:

| Field | Meaning |
| --- | --- |
| `handlesObserved` | distinct artifact ids visible in execute results |
| `callSites.{info,read}` | static textual occurrences of `codemode.artifact.info/read(` in execute source; not a runtime call count and not a bound |
| `readExecutes.{total,bounded,truncated,guardFailed,hostDenied,otherFailed}` | read-containing executes by how the execute itself ended; the five buckets always sum to `total` |
| `readOutcomes.{total,successful,denied,indeterminate}` | what the execute PROVED about the read; the three states always sum to `total` |
| `hostDenialReasons` | closed host set from `src/executor/providers.ts`; sums to `readExecutes.hostDenied` |
| `finalProjection` | state of the last read-containing execute: `none`, `bounded`, `truncated`, `guard-failed`, `host-denied`, or `other-failed` |
| `readBytes` | always `null`; host byte evidence is separate and is not estimated |

Bucket precedence is `guardFailed` → `hostDenied` → `otherFailed` → `truncated` →
`bounded`. The `otherFailed` bucket includes the two historical post-read
`Cannot read properties of undefined` rows: `q-pc-sponsored-reserves` and
`q-protocol-operation-types-list`.

**`readExecutes` and `readOutcomes` answer different questions, so never read one as the other.**
A bucket says how the execute ended. An outcome says what the execute proved about the read.

`readOutcomes.successful` counts one thing only: the execute completed (`bounded`) AND its own
visible result body parses as an object with `ok: true`. Both halves are load-bearing. An errored
execute can leave an `ok:true` envelope in its wreckage, which is not a projection any answer
could use. Source text proves nothing either, because source is text and text does not run: a
guard or a `.data` use can sit on the failure return, inside a string, or inside a comment.
A truncated body hides its own envelope by construction, and `r.data ?? fallback` prints the same
output whether the read returned data or was denied.

This fails closed by design. A real, correctly guarded read whose execute projected a small answer
instead of the envelope counts as `indeterminate`. The instrument therefore under-claims, and an
instrument that under-claims is repairable where one that invents evidence is not.

## CI contract

Every push/PR (`.github/workflows/ci.yml`):

- **Byte-pins**: the generated-artifacts step recompiles and byte-diffs `eval/qa/cases.json`
  AND `eval/qa/sample.json`. Never hand-edit them.
- **`eval:qa:lint -- --stale`**: all deterministic lint lanes; any past-due `truth.reverifyBy`
  fails. In CI the **gospel-change guard** is automatically diff-aware against the merge base:
  a change to `question`, `golden.*`, `tags.freshness`, or `tags.trap` fails unless
  `truth.verified` changed in the same diff with non-empty `evidence` + `rootCause` (score-only
  rationales rejected; `freshness-drift` allowed). Local/pre-push equivalent for every lane:
  `npm run eval:qa:lint -- --since <ref>`.
- `eval:selftest` asserts the live v2 contracts (name, ordered membership, content digest).

CI deliberately does **not** run `eval:qa:selftest`. That command spawns the live `claude` CLI
once per `SELF_TEST_CANDIDATES` entry — seven paid judge calls at the current candidate count —
so it is a manual paid gate owned by
[`run-evals`](../../.agents/skills/run-evals/SKILL.md), not an offline CI step. It needs no MCP
server, and it also checks 15 offline `promptSha256` fixtures, but it is not free: it prints
`expected`, `actual`, `reportedCosts`, `missingCosts`, and `totalCostUsd`. Run it only when the
judging rubric, prompt, evidence pack, or judge adapter changes.

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

Known limitation of the currentness tier: it matches the _word_ "version", not version literals,
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
(`evidence-pack.mjs`, pack `p5`); sourced drift from the golden snapshot is tolerated, confident
unsourced contradiction is not.

Rubric `v2.5` adds judge-owned `coreAnswer` and `avoidMatches` fields. A deterministic
consistency check maps contradictory field and score combinations to **error**, preserves the
raw model score as `judgeScore`, and records stable `consistencyViolations`. The check never
parses candidate prose or decides whether an avoid item matches.

Rubric `v2.6` removes the conflicting wrong-score clause for missing key facts. The existing
omission-only partial rule now controls when the core answer is correct.

Rubric `v2.7` (2026-08-21) makes the claim fields strict: `missingFacts`, `wrongClaims`, and
`avoidMatches` must be arrays of the right element type. A non-array or non-string-element value
maps the verdict to **error** with stable `invalid-missing-facts` / `invalid-wrong-claims`
violations instead of silent normalization; returned fields stay arrays. The omission-only-wrong
check fires only when both `wrongClaims` and `avoidMatches` are valid, so an invalid field reports
its own violation rather than a competing score rule.

`avoidMatches` has its own element rules under `v2.7`: entries must be **unique one-based
integers within the golden `avoid` range** (`1 <= index <= avoid.length`). A duplicate,
zero, non-integer, or out-of-range entry emits a stable `invalid-avoid-match` violation and maps
the verdict to **error**. The consistency check always sees the raw model array, but the emitted
verdict collapses an invalid `avoidMatches` to `[]`; a valid fired index is retained even when a
different violation maps the verdict to error.

Rubric `v2.8` (2026-08-24) rejects a `partial` verdict when the core answer is correct and all
three issue arrays are empty. Such a verdict has no recorded reason for the lower score.

Every consistency error emits `coreAnswer: null`, whatever the judge returned. An **error** is not
a grade, so it carries no graded core answer — the same shape the CLI-failure and
unparseable-verdict paths already emit. The raw model score is still recoverable as `judgeScore`;
the contradicted `coreAnswer` has no equivalent meaning and is not kept. This changes the emitted
shape only. The judge prompt is byte-identical and no score changes, so it needs no rubric bump.

**A consistency error is terminal; a judge-side CLI or parse error is not.** `--judge-stored`
re-attempts an `error` verdict on an answered row only when the call itself failed
(`isRetryableJudgeError` in `judge.mjs`). A consistency error carries `judgeScore`, so the same
prompt contradicts itself again on every attempt: the row keeps its verdict, the file still
finalizes, and no resume spends a second paid call on it.

**Comparability rules:**

- Re-judge identity is the **judge model + rubric + pack** tuple (currently `claude-sonnet-5` /
  `v2.8` / `p5`; `JUDGE_RUBRIC` is exported from `judge.mjs` and `PACK_VERSION` from
  `evidence-pack.mjs`, each with a short changelog in its own file header). Compare stored rows
  only when that tuple, the exact selected-case snapshot, and prompt/pack-hash semantics match.
  Otherwise, re-judge the saved `rows[].answer` under the
  target tuple first (cheap; feed back through `judgeCase` with the row's transcript).
- `re-judge.mjs --flips-vs <baseline>` guards the **baseline** on the same contract as the source,
  and that guard is **absolute**. The baseline selects which rows are worth paying to re-judge, so
  a score difference is only a real flip when three things hold: the baseline's recorded
  selected-case snapshot still reproduces, its judge tuple is the current one, and **every case id
  shared with the source has identical content on both sides**. The last one needs its own check —
  two cases files can each reproduce their own snapshot while the same id carries a different
  question or golden on each side, which reads as a flip but is a different question. A mismatch
  refuses before selection and before the first judge call, so `--dry-run` refuses too.
  `--allow-non-identical` covers a source snapshot that no longer reproduces; it does **not** waive
  a baseline mismatch. Re-judge the baseline under the current tuple instead. A passing guard is
  reported as `guards.baseline` and recorded as `meta.baselineGuard`.
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
- **Pack p5** (2026-08-17, current) recognizes emitted `SOURCE BASIS` boundaries, retains exact
  facts from clipped JSON, and flags transcript-supported claims that a bounded pack omitted. The
  diagnostic never changes the judge score or its claim lists. `p4` was an intermediate build of
  the same 2026-08-17 work; it reached only the superseded paid probe recorded below and is never
  the current pack.
- **Noise floor**: per-row any-flip rate **23.3%** across three identical v2.4/p3 re-judge
  passes (pairwise score disagreement 15.6%). Isolated single-run score movement at or below
  that scale is variance until confirmed by live transcript review or a repeated mechanism.
  Read `wrong` counts before `correct` counts; compare variants on the same sample.
- **Denominator note**: the owned battery is **499 cases as of 2026-08-19**. The retrieval audit
  added five service-semantics cases to the 492-case corpus. The current maintenance change added
  two broad `scout.hackathonBrief` cases to the 497-case corpus. Commit `6e1f979` previously added two
  Soroban cases to the 490-case corpus. The 2026-07-11 baseline remains a historical
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
  The 492→497 compile retained 9 sample ids and replaced 21. Two new cases entered sample-30:
  `q-gap-vet-pitch-vertical-null` and `q-ti-scout-refresh-cached-rows`. Use a common-id set for
  comparisons across this boundary, or disclose the sample change.
  The 497→499 compile retained 28 sample ids and replaced two. It removed
  `q-edge-noinfo-exact-tvl-figure` and `q-scf-total-distributed`; it added
  `q-edge-partner-detail-soft-empty` and `q-scf-v7-changes`. Use a common-id set for comparisons
  across this boundary, or disclose the sample change.

## 2026-08-27 connector response-guidance A/B

This targeted A/B tested the held connector response-guidance candidate against the merged
control. Both arms used `claude-sonnet-5`, variant A, the same eight case IDs, and no judge.
The qualification and both arms passed every revision, surface, environment, completeness, and
comparability guard. Nothing was tuned after collection, and the numbers below are as-is.

| Role | Results stamp | SHA-256 | Rows | Answering cost |
| --- | --- | --- | ---: | ---: |
| treatment qualification | `2026-08-27T18-20-57-variantA.json` | `1a93d19ed6dddeb0c1cda6f4e5e8175bcdaac9b1d38dc494a843d186b9230f6e` | 1 | `$0.1098888` |
| treatment A1 | `2026-08-27T18-50-04-variantA.json` | `fc2cc5424a45a35c43f96ee7a76349970eb068876f18fe6904e82654cd233665` | 8 | `$2.2461662` |
| control B1 | `2026-08-27T18-59-44-variantA.json` | `78170de4d3879d3a54d248309337500be58b40bb79b4e2bf58238a0c5cf2a295` | 8 | `$2.3726368` |

The paired collection cost `$4.6188030`. The three v5 artifacts cost `$4.7286918`.
The total task spend was `$4.9673564`, including earlier method and harness checks.

Manual review found three treatment regressions. The MoneyGram answer omitted required Stellar
Docs evidence. The indexer answer skipped Scout prior-art discovery. The escrow skeleton blocked
all remaining milestones after one disputed milestone resolved. Both arms also promoted
`Stroopy.AI` for the `Strupey` query because Scout labeled the spelling neighbor as a strict match.

The `FIRST-PAIR-BLOCK` verdict rejected the candidate before replication or judging. No aggregate
score is available from these raw, unjudged rows. The shared Scout defect became resolved ledger entry `sls-076` and
[Stellar-Light/stellarlight#1055](https://github.com/Stellar-Light/stellarlight/issues/1055).
The full case review and method record are in
[`2026-08-27-connectors-description-ab.md`](../../.agents/rounds/2026-08-27-connectors-description-ab.md).

## 2026-08-18 retrieval-audit branch checkpoint

This checkpoint tested clean branch revision `a94f11eeccd64a934fb6aed4ee29182f93172b34`.
The runner and the local server used that same revision. The source-identity guard passed for
all three lanes. The answering and judge tuple was `claude-sonnet-5` / `v2.4` / `p5`.

This run is a branch checkpoint, not a paired A/B. The 497-case compile changed the sample
membership as described above. Therefore, this run proves no aggregate product gain.

| Lane | Raw result | Reviewed result | Required plan coverage | Mean on-plan ratio |
| --- | --- | --- | ---: | ---: |
| headline sample-30 | 14C / 14P / 2W / 0E | 14C / 15P / 1W / 0E | 28/30 (93%) | 0.96 |
| impacted 27-case set | 9C / 15P / 1W / 2E | unchanged | 20/27 (74%) | 0.96 |
| canonical live-data v3 | 12C / 3P / 0W / 0E | unchanged | 14/15 (93%) | 0.93 |

The impacted errors were `q-defi-streaming-payments-prior-art` and
`q-gap-contracts-domain-empty`. Both stopped before the first model turn because Claude returned
HTTP 529 overloads. Both rows reported zero tokens, tools, and cost. They were not rerun.

The allowed identity rejudge changed both headline wrong labels to partial. Independent review
accepted the ledger-cadence change. The answer described five seconds as approximate and denied
an exact fixed interval. It still omitted the observed 5–7-second range and CAP-0070.

Independent review rejected the DeFindex rejudge. Its rationale claimed that the answer separated
strategy adapters from products. The answer instead called all eight contracts a product lineup.
Live Scout, DeFiLlama, and operator evidence confirmed seven BlendStrategy adapters and
source-relative TVL. The reviewed DeFindex result remains wrong.

The impacted rejudge kept `q-scf-rfp-tooling` wrong. The official RFP page confirms that this
track funds developer tooling. It also documents the interest-form-to-invitation path. The answer
misframed the track and omitted the brief-versus-round distinction.

| Results stamp | SHA-256 | Cost |
| --- | --- | ---: |
| `2026-08-18T17-28-23-variantA.json` | `b683a8fbe2e14187b2777fdef5867463299ff62b02b95b36d9677b00dc623d4b` | `$20.8868124` |
| `2026-08-18T17-59-49-variantA.json` | `406b8e67a58066dc5bd274747a82346fc1e0fcf59e50db8dfe77dcdc2ade5976` | `$14.8116201` |
| `2026-08-18T18-19-09-variantA.json` | `7396e308d3cf97c643e6992a290353f9df371bf11b3191eaabaabf1e878dcf19` | `$9.2531535` |
| `2026-08-18T18-28-10-rejudge.json` | `591d58720014fd65251e03424fa4784bd704fb39f33b7fbe3fbf525335e38450` | `$0.0847194` |
| `2026-08-18T18-29-08-rejudge.json` | `8d98ba231923f9e790005d7b0dd3c08466ee46fc3af1fc80dd5812a1f6a670c4` | `$0.0607869` |

The three initial lanes used 72 answer attempts and 70 judge calls. The identity rejudges used
three more judge calls. Every paid call reported a cost. This checkpoint cost `$45.0970923`.
An earlier seven-call self-test cost `$0.9728457` separately. The combined audit spend was
`$46.0699380`.

This is the same self-test spend recorded in the 2026-08-17 p4 section below. The combined figure
includes it once and excludes the other 2026-08-17 rejudge spend.

The transcript review found repeated answer and retrieval patterns. Agents dropped live metadata,
made global claims from bounded rows, stopped before exact detail sources, and removed dates or
methods during projection. The canonical live lane returned usable evidence for all three partial
rows. No reviewed row proved a new service gap or justified a query-specific rule.

The result and plan files remain gitignored local evidence. The routing gate stayed at the prior
free baseline. This checkpoint therefore records branch behavior and remaining diagnostic work.
It does not establish a material retrieval gain.

## 2026-08-17 p3→p4 evidence-pack integrity probe (historical, superseded by p5)

This section records the earlier p4 probe exactly as it ran. Every figure in it is a p4 figure.
The p5 matrix below supersedes it as the current record. Do not cite these rows as p5 evidence.

This paid probe tested measurement quality on saved 2026-08-14 answers. It did not collect new
answers or change the MCP product. The tuple was `claude-sonnet-5` / `v2.4` / `p3→p4`. The
re-judges pinned corpus revision `70726884a723786c669283953f576277ce9d955b`. This revision matches
the source artifact's runner and server revision.

The paid self-test made seven judge calls and cost `$0.9728457`. Two four-row re-judge passes made
eight more judge calls and cost `$0.9932361`. The complete sequence used 15 judge calls, cost
`$1.9660818`, and made zero answering-agent calls.

Both passes judged the same four rows: `q-tool-indexer-repos-discovery` (target),
`q-comp-cross-moneygram-partnership-sep24`, `q-soroban-auth-delegation-p27`, and
`q-soroban-oz-token` (controls). That is a reduced slice of the eight rows the execution plan
registered for M1, so this probe carries three controls, not the six its Gate 3 acceptance rule
asks for.

| Results stamp                      | SHA-256                                                            | Row movements                                          |
| ---------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| `2026-08-17T18-57-50-rejudge.json` | `da8dee8927048a608203c37464e88ededcef81e7aa97a6cea0ecd7e5a48fc8d6` | MoneyGram C→C; Auth C→C; OpenZeppelin C→P; Indexer W→P |
| `2026-08-17T19-00-00-rejudge.json` | `c0a87715e834651343e5e4e8f960b8ddce9026d147cddbd3017d03a787529886` | MoneyGram C→C; Auth C→P; OpenZeppelin C→P; Indexer W→P |

Indexer improved because p4 restored four transcript-supported repository facts that p3 omitted.
OpenZeppelin lost a correct control verdict twice because its saved answer omitted a required audit
caveat. Auth also omitted the Mainnet-live date. These control losses came from answer gaps, not
pack loss.

Both paid passes finished at 19:00:00Z. `eval/qa/evidence-pack.mjs` then changed again, while the
label still read `p4`, so for a short window one label covered two different pack builds. The
Indexer pack measured 11,967 characters in these passes and measures 11,992 characters under the
current build. That ambiguity is exactly why the pack moved to `p5`: a pack whose bytes change
takes a new version. Treat the verdicts above as a record of the p4 run and nothing else.

The predeclared stop rule ended the wider p4 matrix after the repeated OpenZeppelin control loss.
Therefore, the live, digest, and tie-break lanes did not run under p4. The p5 matrix below ran
those lanes under the approved fact-level amendment.

## 2026-08-17 p3→p5 evidence-pack repair and paid M1 matrix

This is the current record. The tuple is `claude-sonnet-5` / `v2.4` / `p3→p5`. Every re-judge
pinned corpus revision `70726884a723786c669283953f576277ce9d955b`, which matches the source
artifacts' runner and server revision. The matrix judged saved 2026-08-14 answers. It collected no
new answer, made zero answering-agent calls, and changed no product or Playground file.

The free deterministic side is reproducible:

```sh
# 10 committed fixtures against their saved rows, then the 117-row p3→p5 replay
node eval/qa/verify-evidence-pack-fixtures.mjs --portfolio
```

`--portfolio` reads the gitignored `eval/qa/results/` artifacts, so it prints
`SKIP (no ignored result artifacts found)` on a machine that does not hold the 2026-08-14 run.
The recorded replay is `rows=117 eligible=70 allRowsWithSourceBasis=64
packEligibleSourceBasisRows=38 p3Mean=9228.06 p5Mean=10580.16 supportedTerms=1156
omissions=399->114 improved=55 tied=15 worsened=0`.

The paid matrix ran three lanes over eight rows: `q-tool-indexer-repos-discovery` and
`q-live-beans-cross-service-reconcile` (targets), plus `q-comp-cross-moneygram-partnership-sep24`,
`q-soroban-auth-delegation-p27`, `q-soroban-oz-token`, `q-live-zk-repos-current`,
`q-live-fluxity-status-provenance`, and `q-live-digest-blend-coverage` (controls).

| Pass | Results stamp | SHA-256 |
| --- | --- | --- |
| initial | `2026-08-17T21-46-24-rejudge.json` | `629ed1905c94ee1c4c65244466964193f0c2640b177df9ffff03fbdba4c149c9` |
| initial | `2026-08-17T21-48-02-rejudge.json` | `3b6b314ab41eea1a6324b3ae53e9a925ff82a5c1aeadb6b545c4f71b1fe7330e` |
| initial | `2026-08-17T21-49-43-rejudge.json` | `d3209503931ca910621cf1cd1cfcdc1ec1ae5431ba3cd07f5e86bfba43e2d7f6` |
| repeat | `2026-08-17T22-05-20-rejudge.json` | `1f371cb2b40aa126a7ec608a0246f9dd65265639fd6f3e4ded8354ff27704217` |
| repeat | `2026-08-17T22-06-59-rejudge.json` | `f9dd24ec2e34fbb4d05bf630945e93fc3cc67032278e27e4ffaf06727f539fed` |
| repeat | `2026-08-17T22-08-58-rejudge.json` | `b557433682984f51518694d19046eff61f9dfc69d174e0c8c98ee7bed4291f20` |
| tie-break | `2026-08-17T22-26-02-rejudge.json` | `e2f6a80882febca394ac5cb3b0f920eee1f716d6d052d09b7435dc53b00764ca` |

The initial pass used 8 judge calls and cost `$1.6608864`. The repeat pass used 8 calls and cost
`$0.4486947`. The tie-break used 1 call and cost `$0.0478449`. The matrix reported 17 of 17 judge
calls, zero missing costs, and `$2.157426`.

| Row | p3 stored | p5 initial | p5 repeat | p5 tie-break | Final |
| --- | --- | --- | --- | --- | --- |
| Indexer target | wrong | partial | partial | — | partial |
| Beans target | wrong | correct | correct | — | correct |
| OpenZeppelin control | correct | correct | partial | partial | partial |
| MoneyGram control | correct | correct | correct | — | correct |
| Auth delegation control | correct | correct | correct | — | correct |
| ZK repos control | correct | correct | correct | — | correct |
| Fluxity control | correct | correct | correct | — | correct |
| Blend digest control | correct | correct | correct | — | correct |

Indexer moved because p5 cleared both p3 wrong claims. Its remaining provenance and
external-label omissions are real answer gaps. The Galexie enumeration difference between the two
p5 passes is monitor-only. Beans moved because p5 grounds the five specifics p3 called
unsupported. OpenZeppelin reached a 2-of-3 majority of partial; its audit-scope caveat is an
answer omission, and the initial-to-repeat movement is judge severity variance on byte-identical
input, not p5 pack fact loss. No stop condition fired under the approved fact-level amendment.

The matrix changed QA measurement only. It does not prove an MCP product gain. See
[`research/mcp-quality-improvement-results-2026-08-17.md`](../../research/mcp-quality-improvement-results-2026-08-17.md)
for the full evidence and next experiment.

## 2026-07-27 stale-gap re-measurement (checkpoint, not a re-baseline)

Run after a 16-day measurement gap to answer "what is answer quality today?" — not an A/B of any
change. Clean committed HEAD `dbee852ebc755cc815d8c50dd50d86ec4a10ce92`, passed as
`--server-revision`; the working tree was stashed and asserted empty before and after every paid
lane. `QA_AGENT_PROMPT_APPEND` unset. `claude-sonnet-5` answering and judging, v2.4/p3 — the
measurement tuple is unchanged. Sample file `25af52f9…c81c`, ids `8dddeddb…de96`, corpus content
digest `fef31c49…37ac`. Run in six ≤5-case `--ids` shards for budget checkpointing; the shard union
was asserted byte-identical to the pinned sample order.

| lane                        | raw                                                     | stamps                                                                                                   |
| --------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| headline sample-30          | **10C / 17P / 3W / 0E**                                 | `2026-07-27T21-34-19`, `22-32-31`, `22-36-20`, `22-39-50`, `22-43-14`, `22-50-16` (all `-variantA.json`) |
| canonical live-data v3 (15) | **11C / 4P / 0W / 0E**                                  | `2026-07-27T23-05-03-variantA.json`                                                                      |
| plan regrade (offline)      | 28/30 requiredCovered (93%), mean onPlanRatio 0.93–1.00 | `*.plan.json` alongside each shard                                                                       |

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

| lane               | verdicts                | results stamp                       |
| ------------------ | ----------------------- | ----------------------------------- |
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

| result  |   count |         rate |
| ------- | ------: | -----------: |
| correct | **154** | **31.4286%** |
| partial | **218** | **44.4898%** |
| wrong   | **118** | **24.0816%** |
| error   |   **0** |       **0%** |

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

## 2026-08-19 full-battery QA round (497 cases; reviewed record)

This round measured the service at revision
`90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0`. It used variant A, `search` and
`execute`, `claude-sonnet-5` for answering and judging, and rubric/pack `v2.4/p5`.
The fresh collection has 101 local-only artifacts. Their three shard manifests contain 497
unique current IDs exactly once. The ordered-union SHA-256 is
`76b9c75d61bc7171dc284e0ccdbfd5d254aacfd2f19706381d1d20e0f8e16174`.

The saved artifacts report **188C / 222P / 87W / 0E**. Reviewers then checked all
non-correct rows, selected correct canaries, exact golden joins, and source evidence. The reviewed
aggregate is distinct from the saved artifacts. Final arbitration changed seven classifications:
two wrong-to-partial, one wrong-to-correct,
three correct-to-partial, and one partial-to-correct. The reviewed aggregate is
**187C / 226P / 84W / 0E**. The review did not rewrite any artifact.

| record | correct | partial | wrong | error | strict | half-credit |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| saved artifacts | 188 | 222 | 87 | 0 | 37.8270% | 60.1610% |
| reviewed aggregate | **187** | **226** | **84** | **0** | **37.6258%** | **60.3622%** |

The reviewed half-credit instrument is **(187 + 0.5×226) / 497 = 300 / 497 =
60.3622%**. Fresh full-battery collection cost **$303.86782035**. This cost excludes
the separate live-15, digest-2, sample-replicate, and saved-answer regrade lanes. Those lanes
have separate contracts and denominators. They do not contribute to this headline aggregate.

The direct 30-case checkpoint used the exact baseline sample and three current observations per
ID: one full-battery row and two sample replicates. The baseline was **14C / 14P / 2W**. Raw
per-ID majority scoring produced **15C / 13P / 2W**. It had three movements:
`q-aas-list-token-on-exchanges-aggregators` moved correct-to-partial, while
`q-eco-stellar-rwa-stablecoin-volume` and `q-edge-1xlm-activation-fee` moved
partial-to-correct. Review rejected both upgrades as judge inconsistencies. The reviewed majority
was **13C / 15P / 2W**, with only the first downgrade retained. This checkpoint shows no material
quality gain.

The week-scale comparison used the 100 continuing IDs in the current-goldens p3-to-p5 regrade.
Raw regraded scores were **40C / 46P / 14W / 0E**. Raw fresh scores on those IDs were
**38C / 48P / 14W / 0E**, with 15 upgrades, 18 downgrades, and 67 unchanged rows. Reviewed
regraded scores were **40C / 47P / 12W / 1E**. Reviewed fresh scores were
**38C / 49P / 13W / 0E**, with 14 upgrades, 17 downgrades, and 69 unchanged rows. The corpus
and evidence pack differ, so this is not a paired A/B. The nearly balanced movements do not show
a material causal improvement.

The canary review inspected 53 of 188 saved-correct rows. It changed three to partial. The
remaining 135 saved-correct rows were not inspected in detail. The reviewed correct count can
therefore contain a small, unquantified overstatement. The canary selection was adversarial, so its
flip rate is not a representative estimate. Shard 2 batch 24 was also a category outlier: five
Soroban cases scored **1C / 0P / 4W**.

The 2026-08-04 reviewed round remains historical context only. It used 490 cases, an older
candidate, and rubric/pack `v2.4/p3`; it recorded 154C / 218P / 118W, 31.4286% strict, and
53.6735% half-credit. It is not a paired A/B comparison with this round. No aggregate movement
receives causal credit without a common-ID, same-tuple comparison and mechanism evidence.

The review deduplicated accepted upstream work. Live Scout on 2026-08-19 returned four
Fluxity-named repositories. Three mapped to `project.slug: "wagent"` despite their Fluxity names and
descriptions. This was the repository-to-project linkage defect in `sls-068`. It was distinct from
resolved `sls-058`, which covered SCF funding fields. A 2026-08-25 live recheck returned all four
repositories with `project.slug: "fluxity"`. The upstream report is
[Stellar-Light/stellarlight#972](https://github.com/Stellar-Light/stellarlight/issues/972).

Solo todos 1737 through 1748 track the accepted own-repository, golden-truth, and free-probe work.
Verified finding `sk-017` already owns the Passkey Kit legacy-label issue, so this round does not
duplicate it. Ledgers 828 through 831 retain the accepted monitor-only items.

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

Pin the corpus revision when the battery has moved since collection — otherwise the identity
guard compares saved rows against today's working tree and refuses.

**Corpus pinning is not pack identity.** `--cases-ref` fixes only the case snapshot. The guard
also compares the judge tuple (model / rubric / pack), and the evidence pack is currently `p5`
while the 2026-08-14 artifacts were collected under `p3`. That mismatch refuses on its own, so
this example is necessarily a **non-identical** re-judge — it produces a loudly labeled side
artifact, and its verdicts are NOT identical-input evidence and can never be cited as judge
variance:

```sh
# NON-IDENTICAL re-judge of two rows: corpus pinned to the collecting commit, but the pack
# moved p3 → p5 since collection. Paid: one judge call per row.
node eval/qa/re-judge.mjs eval/qa/results/2026-08-14T03-56-23-variantA.json \
  --ids q-pc-sponsored-reserves,q-protocol-operation-types-list \
  --cases-ref 7072688 \
  --allow-non-identical \
  --dry-run          # drop --dry-run to actually spend
```

Without `--allow-non-identical`, the dry run reports `"wouldRefuse": true` with the offending
tuple (`packVersion: "p3"` vs `"p5"`), and a real run fails with
`refusing non-identical re-judge: judge tuple differs (…)`. Drop `--allow-non-identical` only
when the source artifact's tuple still matches the current one — then the re-judge is genuinely
identical-input.

**Effective score and agreement.** `re-judge.mjs` compares the **effective** score — `judgeScore`
when a verdict is a consistency error, the recorded score otherwise — so a stored `wrong` and a
recomputed `{score: "error", judgeScore: "wrong"}` count as the same grade in `--flips-vs`
selection and in the per-row log. Each artifact row also carries `agreement`, which is `null`
whenever either side has no grade at all: an unjudged source row, or an effective `error` from a
CLI crash or an unparseable reply. A missing measurement is not a disagreement.

Every flag `re-judge.mjs` accepts:

- `--ids <id,id,…>` — re-judge exactly these saved rows. May be supplied once, with no repeats,
  and cannot mix saved verdicts with `--no-judge` rows.
- `--flips-vs <baseline-results>` — select the rows whose score differs from that baseline
  instead of naming ids.
- `--judge-model <name>` — override the judge model. Overriding it makes the run non-identical.
- `--cases-ref <git-revision>` — resolve the case snapshot from that revision instead of the
  working tree. This is how a saved artifact stays judgeable after the corpus moves.
- `--allow-non-identical` — proceed when identity checks fail (drifted case snapshot, or a
  judge-model/rubric/pack tuple that no longer matches). The result is a **loudly labeled**
  side artifact and is **never** identical-input re-judge evidence, so it cannot be used as
  variance evidence.
- `--allow-empty` — only meaningful with `--flips-vs`: write the artifact even when no score
  changed. Without it, an empty flip set is refused rather than persisted as a zero-row file.
- `--dry-run` — resolve, guard, and report without spending.
- `--help` / `-h` — print usage and exit.

Re-judge always writes a NEW `-rejudge` artifact; it never edits the source results file. First
judging of a `--no-judge` capture goes through `run-qa.mjs --judge-stored`, not through here.

### 2026-07-13 release-closeout targeted diagnostics

Three paid targeted probes exercised the six new cases and their nearest controls. They were
**not** the deterministic sample-30 and are not a new headline baseline. All used
`claude-sonnet-5` for answering and judging under v2.4/p3 against the dirty local runner; the
result metadata records `serverRevision: null`. The owned corpus denominator is 490, while each
row below keeps its explicit targeted N:

| Results stamp                       |                                           Scope |                          Raw QA |                                                 Offline plan regrade |
| ----------------------------------- | ----------------------------------------------: | ------------------------------: | -------------------------------------------------------------------: |
| `2026-07-13T18-59-22-variantA.json` |                    evidence-poor retrieval, N=7 | 2 correct / 4 partial / 1 wrong |  6/7 required covered (86%); mean on-plan 0.94; progression used 1/3 |
| `2026-07-13T19-09-10-variantA.json` |      bounded same-model recovery follow-up, N=3 |                       0 / 2 / 1 |  2/3 required covered (67%); mean on-plan 1.00; progression used 0/2 |
| `2026-07-13T20-07-14-variantA.json` | prior-art preflight plus no-detour control, N=3 |                       0 / 3 / 0 | 3/3 required covered (100%); mean on-plan 1.00; progression used 2/2 |

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
