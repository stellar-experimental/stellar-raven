# Round 2026-10-08 — re-collect the three flagged tool-surface rows

Status: complete. 15 of 15 methods ran, all comparable; blind tally calibrated; closeout review reconciled (Review).

## Question

The 2026-10-07 tool-surface round (`rounds/2026-10-07-tool-surface-qa.md`) flagged three reproduced,
live-verified downward differences on single saved answers. Re-judging fixed answers does not measure
answering variance. This round asks two questions:

1. Do the three drops hold over fresh answering samples?
2. For a drop that holds: is it best explained by the `execute`/`search` annotation change, or by the
   description-text changes?

## Owner authorization

On 2026-10-08 the owner wrote: "Whatever you think is best I'm fine with. Certainly happy to run more
evals and spend more if needed." The orchestrator sets the cap: **$45 total**, as 15 methods of
**$3** each (one `--max-budget-usd 3` per method). Unused caps never transfer. A stopped method is
never resumed; a replacement needs a new written authorization in this ledger.

## Arms

| Arm | Revision | Surface |
|---|---|---|
| B | `1cc1f3a6` (bundle `eval/qa/results/2026-10-07-tool-surface-qa/eval-baseline-pre-tool-surface.bundle`) | Pre-change surface (same as 2026-10-07 B) |
| T | `dd8724e5` | Shipped surface (same as 2026-10-07 T) |
| A | `dd8724e5` + one local commit | T's descriptions with B's annotations: `execute` `readOnlyHint: false`, `openWorldHint: true`; no `annotations.title` on either tool. Top-level `title` stays as in T (B has the same strings). |

B and A are local commits, never pushed. Only `src/mcp/tools.ts` and its tests differ across arms.
Each arm has its own clean worktree and its own `npm run dev:eval` server: B on 8788, T on 8789,
A on 8790, all running for the whole collection window. (Three Wrangler processes run at once, one
per revision. This is a stated deviation from "reuse one dev pane": the arms need different
revisions, and interleaving needs them up together.)

## Instrument

- Rows (3): `q-comp-finclusive-caas`, `q-gap-leaderboard-project-not-builder`,
  `q-pc-quantum-preparedness-dormant`, passed as `--ids` in this order.
- Runner: clean worktree at `ae39dcc9` (the 2026-10-07 B3/T harness; same judge-stall fix).
- Answering `claude-sonnet-5`, judge `claude-sonnet-5`, rubric `v2.10`, pack `p6`,
  `stability-boundary-v1`, the same stability register file and hash as 2026-10-07, `--max-panel-cases 34`,
  `QA_AGENT_PROMPT_APPEND` unset.
- Claude `2.1.292` via the private `PATH` link, sha `97a01e5b…`, `DISABLE_AUTOUPDATER=1`. Agent
  environment hash recorded before the first method and asserted before each.
- Remote identity: one fresh stable probe (3 captures, 5-minute spacing) before the first method;
  the same vector is asserted for every method.
- Five repetitions per arm. Interleaved order, fixed now:
  rep 1 B T A · rep 2 T A B · rep 3 A B T · rep 4 B T A · rep 5 T A B.
  Total 15 methods, 45 answers.
- Collection-only failures (a missing cost, an identity change) stop that method. The rest of the
  schedule continues only if the stop is not an identity failure; an identity failure stops the round.

## Per-row features (fixed before spend)

Each answer is scored by the judge as usual (correct 1, partial 0.5, wrong 0). Each answer is also
tallied for one row feature by a blind reviewer: **Codex workhorse `gpt-6.1-sol`, high** (differs from
the author and the orchestrator, Claude Opus). The reviewer sees only coded, shuffled answer texts and
the golden, never arm labels, transcripts, costs, or timestamps. Each row's pack also hides the two
2026-10-07 answers (B3, T) as calibration items. If a calibration tally differs from its expected value
below, the definition is broken: it is repaired and the whole tally is redone before any verdict.

| Row | Feature (present = the 2026-10-07 T failure) | Calibration |
|---|---|---|
| `q-comp-finclusive-caas` | Present iff at least one sentence in the answer's own voice (not inside quotation marks, and not introduced by "describes itself as", "markets itself as", or "per [source]") applies to FinClusive any of: licensed, license, regulated (as a status, not "operates in a regulated space"), MSB, money transmitter, money services business, registered with a regulator, or VASP registration. An on/off-ramp or anchor role claim alone is absent. A sentence that applies the word and, in the same sentence, marks it as unverified, self-described, or a marketing claim is absent. | T present; B3 absent |
| `q-gap-leaderboard-project-not-builder` | Present iff the answer has no statement that the leaderboard operation or its response includes, returns, or supplies aggregate or ecosystem-wide developer metrics. Qualifying mentions: "ecosystem developer block/snapshot", "Electric Capital developer count", "developer macro block", "aggregate developer metrics", or a numeric ecosystem developer count attributed to the leaderboard. Counts attributed to `getBuilders`, Passport, or a people directory do not qualify. | T present; B3 absent |
| `q-pc-quantum-preparedness-dormant` | E1 = the answer attributes to the QPP (or SDF) that a forced Ed25519 cutoff would affect dormant accounts whose holders are unreachable. Present iff E1 is absent. E2 (the choice between freezing with recovery and permanent locking) is recorded as telemetry, not as a gate. | T present; B3 absent |

Validity: an answer is invalid iff `agent.failure` is non-null or the row has no answer text. A judge
`error` verdict removes the row from n_score only. n_feature and n_score are reported per arm, and the
n ≥ 4 rule applies to each measure separately. A refusal with `agent.failure` null is valid.
The 2026-10-07 single answers are calibration only; they are never pooled into the fresh n = 5.

## Reading rules (fixed before spend)

Per row, with n = valid answers per arm (expected 5):

- **Drop holds** if mean score T ≤ mean score B − 0.3 **and** feature count T ≥ feature count B + 2.
- **Not detected at n = 5** if mean score T ≥ mean score B − 0.1 **and** |feature T − feature B| ≤ 1.
- Otherwise **inconclusive**, including a row that meets one half of each rule.
- A row with n < 4 in any arm, for either measure, is inconclusive.

Operating characteristics (reviewer's exact enumeration, two arms of five): with no real effect, the
feature half of "holds" fires 5–17% of the time and the joint rule about 2–5%. With no real effect,
"not detected" also fires only 55–70% of the time, and with a real 0.2→0.7 feature shift it still
fires about 22% of the time (34% for 0.2→0.6). So "not detected at n = 5" never means "no effect" or
"answering variance". The noise floor is arm B's within-arm spread over its five reps per row (feature
count and score range), reported beside every verdict.

Attribution, only for a row whose drop holds. Arm A shares the **descriptions** with T and the
**annotations** with B. "Annotations" = the bundled annotation edits (`execute` `readOnlyHint`,
`openWorldHint`, and `annotations.title` on both tools); the design cannot separate them.
"Descriptions" = the `execute` scope, cap, and 7-day storage sentences; `search`'s description is the
same in all arms.

- **Description-explained** if feature A ≥ feature B + 2 and |feature A − feature T| ≤ 1 (A behaves like T).
- **Annotation-explained** if |feature A − feature B| ≤ 1 and feature T ≥ feature A + 2 (A behaves like B).
- Otherwise **mixed/inconclusive**.

Pre-registered prediction (descriptive, not a gate): Claude 2.1.292 maps `readOnlyHint` to
`isConcurrencySafe()` and forwards annotations to the API. If an annotation-explained row appears,
T should show `execute` calls issued in parallel with another tool call in one assistant turn, and
A and B should not.

Descriptive telemetry per arm (not a gate): `execute` call count per answer, `codemode.artifact.read`
calls, parallel tool-call batches, turns, and cost.

Allowed summaries: per-row verdicts as defined above, and attribution only where defined, for the
named row only, never for the bundle. With n = 5 per arm, no statistical significance is claimed.
Forbidden: "no effect", "answering variance", "surface regression", "non-regression", any battery-wide
or release verdict, and any statement about the 2026-10-07 100-row aggregates. The 2026-10-07 ledger
gets a dated pointer to this round and nothing else.

Stop consequences: an identity change stops the round. Samples collected before the stop are kept;
rows with n < 4 in any arm are inconclusive; a continuation is a new round with a new vector and a new
authorization, never a resume under this $45.

## Budget

Stored evidence: 2026-10-07 B3 $40.70 and T $41.61 for 100 rows each (≈ $0.41 per row, answering +
judging + panels). Per-row stored costs (same contract): FinClusive $0.34–0.38,
leaderboard $0.16–0.36 (3-vote panel in T), quantum $0.59–0.60; method $1.09–1.35. The 100-row p90 is
$0.61–0.64 and the max $1.30, so $3 binds only in a pathological method. The runner executes in battery
order (FinClusive, leaderboard, quantum) whatever `--ids` says, so a cap stop always costs quantum
first. 15 × $3 = $45 maximum.

## Launch manifest

Filled and checked before the first paid call; any change stops the method and is never adopted.

| Pin | Value |
|---|---|
| Runner | `/private/tmp/claude-501/qa-runner2`, `ae39dcc9fcde983f75709f95964f9f080a8c0091`, clean |
| B server | `/private/tmp/claude-501/qa-b`, `1cc1f3a685cc79b4021aaf6be127b28834d1812f`, port 8788, surface `bd42923ed1dbda0a4b93e83a6a344272c220acc2e025e939d873481b2c2f37f9` (= 2026-10-07 B) |
| T server | `/private/tmp/claude-501/qa-t`, `dd8724e533153dd7306d338690a2a4cda6983c49`, port 8789, surface `83d9734fc92bb9d328755de4cf6641171fb7591ec16567c5e28c3af7063f981f` (= 2026-10-07 T) |
| A server | `/private/tmp/claude-501/qa-a`, `cf060b7d8fc41d6457e84083f8779eae1008f094` (local branch `eval-annotation-only`), port 8790, surface `365872367d31d7ca4dd3828d263a693d2b436205dcbde800c81abba0d15fdb9a` |
| Wire diff (free, before spend) | live `initialize` + `tools/list`: A vs T differ only in `tools[1].annotations.{readOnlyHint,openWorldHint,title}` and `tools[0].annotations.title`; A vs B differ only in `tools[1].description`; `instructions` identical; `serverInfo.sourceRevision` matches each port |
| Cases | `caseInputSha256` FinClusive `9c937eab…`, leaderboard `fb5032af…`, quantum `acb06bdd…`, all active; equal to 2026-10-07 |
| Local state | per-worktree `.wrangler/state` (KV, R2); identical `.dev.vars`; the local dev registry is keyed by worker name and shared, which matters only for service bindings (unused by MCP; accepted) |
| Claude | `2.1.292`, sha `97a01e5bc74a199e67189435d0331ea3a24eac2e07db4b76d9148c5b0386138f` |
| Stability register | `/private/tmp/claude-501/qa-stability-register.json`, sha `1ec822cd…` |
| Launch script | `/private/tmp/claude-501/qa-rows.sh` (asserts every pin, then one `run-qa.mjs --ids … --max-budget-usd 3`) |
| Agent environment | `a859df4a7b48a558d493c80552a73fcf21fdbc1cffe345cc41e6a08f4b09ddbe` (collection pane `w3W:p2C`). The first launch attempt stopped on the environment pin before any paid call: each nested `zsh` re-sourced `~/.zshenv` and changed `PATH`. The launcher now sets `PATH` to `qa-bin` plus one frozen copy (`/private/tmp/claude-501/qa-path.txt`) and the schedule calls it with `zsh -f`; three invocation styles give the same hash. Same `PATH` for every arm; no measurement change. |
| Remote vector | `1a927dce05ba9a1b4e7481c85ebfc7c4d4110aa2cb681de0f0a11fc7d43c0c7b` (fresh stable probe, 3 captures; probe script hash unchanged) |
| Schedule | `/private/tmp/claude-501/qa-schedule.sh`: 1 B, 2 T, 3 A (rep 1) · 4 T, 5 A, 6 B (rep 2) · 7 A, 8 B, 9 T (rep 3) · 10 B, 11 T, 12 A (rep 4) · 13 T, 14 A, 15 B (rep 5); each `qa-rows.sh <arm> <rep> <env>`; stops at the first non-zero exit for review |
| Print-check | all three arms passed every pin, including the case-content pin |

## Review

Pre-spend plan review: Claude Fable `claude-fable-5-1`, high ([`review-plan-flagged-rows.md`](2026-10-08-flagged-row-recollection/review-plan-flagged-rows.md), kept because the Reading rules cite its exact n = 5 enumeration).
Verdict: launch after fixes. Reconciled: 1 (blocker, attribution labels swapped) fixed; 2 wire diff
recorded; 3 features tightened, calibration items and the blind reviewer named; 4 renamed to "not
detected at n = 5", operating characteristics and noise floor added; 5 validity and the two n's
defined; 6 battery order recorded; 7 local state recorded; 8 launcher written with a case-content pin
and print-checked; 9 stop consequences stated; 10 no change; 11 prediction pre-registered; 12 the owner
wrote the general authorization quoted above and is told the $45 cap in the same message that reports
the launch; 13 exclusions added. Delta re-review (same file): launch; its one new minor (the launcher's lifecycle
check read `k.lifecycle?.state`) was fixed to `k.truth?.lifecycle?.state` before the first paid call.

Closeout review: Claude Fable `claude-fable-5-1`, high; approve with changes. It re-derived every
number, verdict, calibration item, and the spend from the archive. Reconciled: 1 the routing lane's
ledger is `2026-10-08-maintenance.md` (Scope, Lanes, Outcome), now cited beside the folder; 2 this
section; 3 artifact-read qualifiers added; 4 directional glosses removed; 5 the 2026-10-07 pointer now
says it changes nothing; 6 the TODO cites the maintenance ledger; 7 stale routing-repair paths noted;
8 `tl-8789.json` archived and the archive subfolder named; 9 the plan review is kept (cited above);
10 only the listed paths are committed. Delta re-review: approve; its two wording items (a gloss in
the maintenance Outcome, the routing-review tier reason) are fixed.

## Results

Collection 2026-10-08 18:02–19:21 UTC, schedule as fixed. A first launch at 18:01 stopped on the
environment pin before any paid call (see the manifest). All 15 methods exited 0 with
`meta.comparable: true`, no incomplete or unattempted IDs, and no identity stop. Every answer is
valid: n_feature = n_score = 5 per row and arm. Spend: $18.9254812 reported over 15 methods
(max $1.4199966; each under its $3 cap; $45 authorized). Archive (local, gitignored):
`eval/qa/results/2026-10-08-flagged-rows/` (15 result files, blind packs, key, launcher, wire diff,
and the arm A bundle). `methods.json` and `rows-ledger.tsv` name each file as
`eval/qa/results/<file>` (its runner path); the archived copy is in that subfolder. Committed summaries: `rounds/2026-10-08-flagged-row-recollection/`.

Blind tally: Codex workhorse `gpt-6.1-sol`, high, read only the three coded packs. All six calibration
items matched (2026-10-07 T present, B3 absent, for each row), so no definition was repaired.

| Row | Arm | Judge verdicts (rep 1–5) | Mean score | Core correct | Feature present | E2 |
|---|---|---|---|---|---|---|
| FinClusive | B | wrong, partial, partial, wrong, wrong | 0.2 | 3/5 | 0/5 | – |
| | T | partial, wrong, partial, partial, wrong | 0.3 | 5/5 | 1/5 | – |
| | A | wrong, partial, partial, wrong, wrong | 0.2 | 3/5 | 1/5 | – |
| Leaderboard | B | correct ×5 | 1.0 | 5/5 | 3/5 | – |
| | T | correct ×5 | 1.0 | 5/5 | 3/5 | – |
| | A | correct ×5 | 1.0 | 5/5 | 0/5 | – |
| QPP dormant | B | partial, partial, wrong, wrong, correct | 0.4 | 3/5 | 4/5 | 1/5 |
| | T | correct, wrong, partial, correct, correct | 0.7 | 4/5 | 2/5 | 3/5 |
| | A | partial, correct, correct, partial, correct | 0.8 | 5/5 | 2/5 | 3/5 |

Noise floor (arm B within-arm spread): FinClusive scores 0–0.5, feature 0/5; leaderboard 1.0–1.0,
feature 3/5; QPP 0–1.0, feature 4/5.

Per-row verdicts (rules as fixed before spend):

1. `q-comp-finclusive-caas`: **not detected at n = 5.** Mean T 0.3 ≥ B 0.2 − 0.1; feature T 1 vs B 0.
2. `q-gap-leaderboard-project-not-builder`: **not detected at n = 5.** Mean 1.0 in both; feature 3 vs 3.
3. `q-pc-quantum-preparedness-dormant`: **inconclusive.** The score half of "not detected" holds
   (T 0.7 ≥ B 0.4 − 0.1), but the feature counts differ by 2 (T 2, B 4), in the opposite direction from
   the 2026-10-07 drop. The "holds" rule fails on both halves.

Attribution: not applicable; no row's drop holds.

Descriptive telemetry (not a gate; mean per answer unless stated):

| Row | Arm | `execute` calls | `search` calls | Turns | Artifact reads (total) | Cost |
|---|---|---|---|---|---|---|
| FinClusive | B / T / A | 2.8 / 2.6 / 3.0 | 2.6 / 2.8 / 2.8 | 7.4 / 7.4 / 7.8 | 1 / 1 / 1 | $0.43 / $0.42 / $0.44 |
| Leaderboard | B / T / A | 0.4 / 0.6 / 0.0 | 3.0 / 2.8 / 2.8 | 5.4 / 5.4 / 4.8 | 0 / 0 / 0 | $0.20 / $0.21 / $0.16 |
| QPP dormant | B / T / A | 4.2 / 4.0 / 5.0 | 2.6 / 3.0 / 2.8 | 8.8 / 9.0 / 9.8 | 5 / 0 / 4 | $0.68 / $0.63 / $0.63 |

The pre-registered parallel-call prediction cannot be checked: stored transcripts list tool calls
without assistant-turn boundaries. Attempted artifact reads (`codemode.artifact.read(` call sites in
`execute` code; the harness records no successful read outcome: all 12 are `indeterminate`) are 6 in B,
1 in T, and 5 in A. The difference is on the QPP row only (B 5 calls in 3 answers, T 0, A 4 calls in 2
answers); FinClusive is 1/1/1 and the leaderboard 0/0/0. That matches the 2026-10-07 direction (8 → 3)
and puts A with B, the arm that shares its annotations. It is not a gate; it is a lead for the
annotation TODO, not a finding.

## Conclusion

None of the three 2026-10-07 drops holds over five fresh samples per arm. FinClusive and the
leaderboard row are **not detected at n = 5**; the QPP row is **inconclusive** (means B 0.4, T 0.7,
A 0.8, descriptive only). By the pre-declared operating characteristics, "not detected" does not exclude a smaller
real effect; it does mean the single-answer drops of 2026-10-07 did not repeat at the observed rates.
Attribution applies to no row. This is a three-row diagnostic, not a battery-wide or release verdict,
and it says nothing about the 2026-10-07 100-row aggregates.

## Outcome

- Verdicts: FinClusive and leaderboard not detected at n = 5; QPP inconclusive.
  Stamps: 15 result files `2026-10-08T18-07-12` … `2026-10-08T19-21-27` (`methods.json`).
- Spend: $18.9254812 reported of the $45 authorization; no method stopped.
- Follow-up: `.agents/TODO.md` "Measure the execute annotation change in isolation" carries the
  artifact-read lead and the transcript turn-boundary prerequisite.
- Retained evidence: this folder (needed by that TODO item); full archive local and gitignored.
- Remaining risk: n = 5 per arm cannot exclude a smaller real effect on these rows.
