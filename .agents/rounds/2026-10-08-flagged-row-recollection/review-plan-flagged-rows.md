# Pre-spend plan review — 2026-10-08 flagged-row re-collection

Reviewer: Claude Fable 5.1 (high). Read-only. No repository edits, no paid calls. The brief under review is
`/private/tmp/claude-501/round-2026-10-08-flagged-rows.md`. Evidence paths are absolute; line numbers
refer to `eval/qa/run-qa.mjs` at `ae39dcc9` unless stated.

Free checks I ran: three pairwise `git diff`s between `1cc1f3a6`, `dd8724e5`, and `cf060b7d`; the
runner's `--ids` and pin code paths; `scripts/run-eval-server.mjs` and `eval/lib/bound-server-identity.mjs`;
the stored B3 and T artifacts for the three rows (costs, tiers, answers, rationales); the goldens in
`eval/qa/cases.json`; the pinned stability register; the pinned Claude binary strings; Wrangler 4.145.0
inspector-port handling; `test/server.test.ts` and `test/mcp-instructions.test.ts` at `cf060b7d`
(89 passed, worktree still clean); and an exact enumeration of the reading rules' error rates at n = 5.

Severity scale: **Blocker** (a launch on the brief as written produces a misleading result),
**Major** (must be fixed or explicitly accepted before spend), **Minor** (should be fixed; not a gate).

---

## 1. Blocker — the attribution labels are inverted

**Evidence.** Arm A = `cf060b7d` = `dd8724e5` plus one commit. `git diff dd8724e5 cf060b7d` touches only
annotations: `search` loses `annotations.title`; `execute` loses `annotations.title`, `readOnlyHint`
true→false, `openWorldHint` false→true. `git diff 1cc1f3a6 cf060b7d` touches only description text
(the `EXECUTE_DESCRIPTION` string), the two title constants (same strings), one comment, and
`test/server.test.ts`. So:

- A and T share **descriptions** and differ only in annotations.
- A and B share **annotations** and differ only in descriptions.

The brief's rule says: "Annotation-explained if feature A ≥ B + 2 and |A − T| ≤ 1 (A behaves like T)".
If A behaves like T, the factor A shares with T is the **description** text. That outcome is
description-explained. Likewise "Description-explained if |A − B| ≤ 1 and T ≥ A + 2 (A behaves like B)":
A shares **annotations** with B, so if A behaves like B while carrying T's descriptions, the annotations
explain the drop. Both labels are swapped.

**Fix.** Keep the arithmetic, swap the labels:

- **Description-explained**: feature A ≥ feature B + 2 and |feature A − feature T| ≤ 1 (A behaves like T).
- **Annotation-explained**: |feature A − feature B| ≤ 1 and feature T ≥ feature A + 2 (A behaves like B).

Also state in the brief which concrete edits each label covers. "Annotations" = the three annotation
edits bundled in `cf060b7d` (`readOnlyHint`, `openWorldHint`, `annotations.title` on both tools); the
design cannot separate them. "Descriptions" = the `execute` scope sentence, the cap sentence, and the
7-day storage sentence; `search`'s description is identical in all three arms.

## 2. Major — arm A is a fair factorization; record it at the wire level, not only in git

**Evidence.** The three diffs above show a clean 2×2 factor split (annotations ∈ {B, T}, descriptions
∈ {B, T}). Catalog, manifest, server instructions, adapters, and executor are byte-identical across the
three worktrees (only `src/mcp/tools.ts` and tests differ). Unit tests at `cf060b7d` pass (89/89), and
the worktree stays clean. The branch `eval-annotation-only` is on no remote.

**Gap.** The manifest records three surface hashes "to record" but no check that the three live
`tools/list` payloads differ exactly as intended. A wrong worktree on a port, or a stale build, would
still pass the per-arm surface pin (each pin is asserted against its own recorded hash).

**Fix (free, before the first paid call).** Fetch `initialize` + `tools/list` from 8788, 8789, 8790 and
diff the three JSON payloads. Assert: A vs T differ only in the `annotations` objects of both tools;
A vs B differ only in `execute.description`; `instructions` and `serverInfo.name` are identical, and
`serverInfo` carries the expected revision per port. Record the three surface hashes and this diff
result in the manifest. All three hashes must be pairwise distinct.

## 3. Major — the per-row features are not yet blind-tallyable twice the same way

Checked against the stored 2026-10-07 answers (`eval/qa/results/2026-10-07-tool-surface-qa/
2026-10-07T23-25-14-variantA.json` for B3, `2026-10-08T02-40-37-variantA.json` for T) and the goldens.

**`q-comp-finclusive-caas`.** The brief's feature says "states or implies". "Implies" is not tallyable.
The actual T failure (judge `wrongClaims`, `avoidMatches: [3]`) is one sentence in T's own voice:
"FinClusive functions as a managed BSA/AML/KYC compliance layer plus **licensed** on/off-ramp". B3's
answer also says FinClusive "operates as a U.S. on-off ramp" but inside a quotation attributed to the SDF
webinar recap, and B3 uses "licensed/regulated" only for other anchors (Coins.ph, Anclap, ClickPesa).
A reviewer applying "implies" could tally B3 as present. The golden's avoid clause 3 is
"Do NOT infer a FinClusive license from registry absence/presence or company marketing."

Fix: *Present iff at least one sentence, in the answer's own voice (not inside quotation marks and not
introduced by "describes itself as" / "markets itself as" / "per [source], it says"), applies to
FinClusive any of: licensed, license, regulated (as a status, not "operates in a regulated space"), MSB,
money transmitter, money services business, registered (with a regulator), or VASP registration. An
"on/off-ramp" or "anchor" role claim alone is absent. A sentence that applies the word and in the same
sentence marks it as unverified, self-described, or a marketing claim is absent.* Calibration: T 2026-10-07
= present; B3 2026-10-07 = absent.

**`q-gap-leaderboard-project-not-builder`.** The feature says "any ecosystem-wide developer figure". T's
answer contains "300 profiles as of 2026-10-08" for `getBuilders`. A reviewer could count that as an
ecosystem developer figure and tally T as absent, which contradicts the 2026-10-07 failure (the judge's
three `missingFacts` all name the leaderboard's aggregate block). The golden key fact is "Leaderboard ranks
projects and supplies aggregate developer metrics."

Fix: *Present iff the answer contains no statement that the leaderboard operation or its response
includes, returns, or supplies aggregate or ecosystem-wide developer metrics. Qualifying mentions:
"ecosystem developer block/snapshot", "Electric Capital developer count", "developer macro block",
"aggregate developer metrics", or a numeric ecosystem developer count explicitly attributed to the
leaderboard. Counts attributed to `getBuilders`, Passport, or a people directory do not qualify.*
Calibration: T = present; B3 = absent ("Electric Capital dev-count macro block").

**`q-pc-quantum-preparedness-dormant`.** The feature is a conjunction of two elements (unreachable
holders affected by a forced cutoff; freeze-with-recovery vs. permanent lock). The brief does not say how
to tally an answer that has one element only. The golden grader caution names both elements.

Fix: *Define element E1 = the answer attributes to the QPP (or SDF) that a forced Ed25519 cutoff would
affect dormant accounts whose holders are unreachable; E2 = the answer states the design choice between
freezing with a recovery mechanism and permanent locking. Present iff E1 is absent. Record E2 separately
as telemetry, not as a gate.* Calibration: T = present (neither element); B3 = absent (both).

**Common fixes.**
- The blind pack for each row should include the two 2026-10-07 answers (B3, T) as hidden calibration
  items among the coded fresh answers. If the reviewer's tally on a calibration item disagrees with the
  expected value above, the feature definition is broken and the round's tally is redone with a repaired
  definition before any verdict. This costs nothing.
- Name the blind reviewer's tier and model now. Per `AGENTS.md`, the reviewer must differ from the
  brief's author and from the orchestrator. The brief says only "an independent reviewer".
- State that the blind reviewer sees answers and goldens only, never transcripts, costs, or timestamps.

## 4. Major — the reading thresholds have a stated meaning but unstated error rates at n = 5

I enumerated the rules exactly (two independent arms of five answers each).

Feature rule, under the null (same feature probability p in both arms):

| p | P(T − B ≥ 2) ("holds" half) | P(\|T − B\| ≤ 1) ("not reproduced" half) |
|---|---|---|
| 0.1 | 0.051 | 0.898 |
| 0.2 | 0.111 | 0.778 |
| 0.3 | 0.148 | 0.704 |
| 0.5 | 0.172 | 0.656 |

Feature rule, under a real effect:

| p_B → p_T | P(T − B ≥ 2) | P(\|T − B\| ≤ 1) (false "not reproduced") |
|---|---|---|
| 0.2 → 0.6 | 0.652 | 0.339 |
| 0.2 → 0.7 | 0.777 | 0.220 |
| 0.1 → 0.8 | 0.952 | 0.048 |

Score rule (mean T ≤ mean B − 0.3), under the null with a typical score mix [.6 correct, .3 partial,
.1 wrong] in both arms: P = 0.117; "not reproduced" half (mean T ≥ mean B − 0.1): P = 0.762. Under a
real 0.25 mean drop: P(holds) = 0.51, P(not reproduced) = 0.33.

Because "holds" needs both halves, the per-row false-"holds" rate is roughly 2–5 %, which is acceptable.
But "not reproduced" also needs both halves and lands at roughly 55–70 % under the null and at roughly
25–35 % under a moderate real effect. So the design is prone to a false "not reproduced" and cannot
distinguish "no effect" from "an effect of the size seen on 2026-10-07 that n = 5 missed". It is also prone
to "inconclusive" because the two rules can split (for example, feature T = B + 2 with mean drop 0.2).

The skill requires a noise floor that bounds what variance can explain. The brief names none.

**Fix.**
- Rename "Drop not reproduced" to "**Not detected at n = 5**", and in Allowed summaries forbid the
  phrases "answering variance" and "no effect" as conclusions. The honest form is "not detected at n = 5;
  the design detects a 0.2→0.7 feature shift about 78 % of the time".
- Add the table above (or the brief's own numbers) to the brief as the pre-declared operating
  characteristics.
- Pre-declare the noise floor: the within-arm spread of arm B across its five reps per row (feature
  count and score range). Report it beside every verdict. The 2026-10-07 single B3 and T answers are
  **not** pooled into the fresh n = 5; state this explicitly.
- Thresholds are fine to keep as they are. Changing them now is still pre-data; do not change them
  after the data. Pre-declare the exact tie-breaker for the gap between the rules: a row that meets one
  half of "holds" and one half of "not detected" is "inconclusive", full stop.

## 5. Major — "valid answer" and n are undefined, and n can differ between the two measures

The brief says "Missing or invalid answers lower n" without defining invalid. A judge error leaves the
feature tallyable but the score missing, so n_feature and n_score diverge.

**Fix.** Define: an answer is invalid iff `agent.failure` is non-null (the runner's single failure field)
or the row has no answer text. A judge `error` verdict removes the row from n_score only. State both
n_feature and n_score per arm and apply the n ≥ 4 rule to each measure separately. A refusal or
non-answer with `agent.failure` null is valid and is tallied by the feature rule as written.

## 6. Major — budget cap: enforceable, and the headroom is adequate; one ordering effect

**Enforceability.** `run-qa.mjs` requires exactly one `--max-budget-usd` (fail-closed parser), creates a
fresh ledger per invocation, passes only the remaining authorization to each answering call
(`--max-budget-usd` on the Claude CLI, line 804/949) and to each judge call, and stops on a missing cost.
Fifteen separate invocations with `3` each cannot exceed $45. Unused caps cannot transfer because each
ledger dies with its process. `--ids` is accepted with every pin unchanged: the only `--ids` exclusion is
`--judge-stored` (line 1659), which this plan does not use.

**Headroom (stored, same contract: rubric v2.10, pack p6, sonnet-5 both roles).** Per-row totals
(agent + all judge calls) from the 2026-10-07 artifacts:

| Row | B3 | T |
|---|---|---|
| `q-comp-finclusive-caas` | $0.336 (single) | $0.383 (single) |
| `q-gap-leaderboard-project-not-builder` | $0.163 (single) | $0.363 (3-vote boundary panel) |
| `q-pc-quantum-preparedness-dormant` | $0.592 (single) | $0.603 (single) |
| Method total | $1.09 | $1.35 |

The 100-row distribution: median row $0.40, p90 $0.61–0.64, max $1.30. Three rows at the observed max
would be $3.90, so the cap can bind in a pathological method, but the expected method is $1.1–1.4 and the
brief's "≈ $1.25" is right. Tier facts: the register gives `q-comp-finclusive-caas` usable history
(stability 0.857, 7 comparisons) so it is always a single vote; the other two have no usable history and
take a 3-vote panel on any boundary verdict (partial with ≤ 1 missing fact, or exactly one wrong claim).
`--max-panel-cases 34` is effectively unlimited for 3 rows, which is correct for parity with 2026-10-07.

**Ordering effect.** The runner ignores `--ids` order; it keeps battery order (line 1725, a filter over
the battery). Battery indices are 45, 162, 243, so the order happens to equal the brief's. The last row
is the most expensive one (quantum, ~$0.60). If a cap ever binds, it removes quantum first, lowering that
row's n systematically. With $3 this is unlikely; still, record in the manifest that execution order is
battery order and that a cap stop always costs the quantum row.

## 7. Major — three concurrent Wrangler servers: no shared state found, two things to record

Checked:

- **Ports.** 8788/8789/8790 are distinct. `boundServerIdentity` (line 1772) resolves the single listener
  on the port with `lsof`, reads its cwd, and requires that worktree's HEAD to equal `--server-revision`
  and to be clean. Each arm's worktree is a git worktree of the main repository, so the runner resolves
  all three revisions (`git rev-parse` of `1cc1f3a6`, `dd8724e5`, `cf060b7d` succeeds in `qa-runner2`).
- **Inspector port.** Wrangler 4.145.0 allocates it with `get-port`, so the second and third servers fall
  back to a free port rather than failing.
- **Local storage.** KV (`OAUTH_KV`) and R2 (`ARTIFACTS`) local simulations live under each worktree's
  `.wrangler/state`, which is per directory and gitignored. No cross-arm artifact or token state. With
  `DEV_ALLOW_UNAUTHENTICATED`, artifacts are owned by the fixed loopback-dev subject, per server.
- **Upstream credentials.** The three `.dev.vars` files are byte-identical (same hash), so the arms share
  Lumenloop/Algolia keys and rate limits. Methods run one at a time, so there is no concurrent load.
- **Cron.** `wrangler dev` does not fire the hourly skill canary on its own.
- **Host caches.** In-process per server; each arm warms on its first rep. The interleaving makes the cold
  rep fall on every arm once (rep 1), so this is balanced.

Record two things:
1. Wrangler's local dev registry is keyed by worker name; three same-named `stellar-raven-codemode`
   instances overwrite each other's entry. This matters only for service bindings, which the MCP path
   does not use. Note it as accepted.
2. The agent's `.mcp.json` points at one port per method. The launch script must take the port, server
   revision, and surface hash as one tuple per arm and must not derive one from another. The runner then
   asserts the tuple on pre- and postflight.

## 8. Major — the launch script does not exist yet, and the manifest cannot be checked without it

`/private/tmp/claude-501/qa-rows.sh` is referenced as the asserting script but is absent. The prior
script `qa-arm.sh` asserted runner revision, clean tree, binary hash, register hash, probe hash, remote
vector length, the 100-id sample hash, and the environment hash, then ran one `run-qa.mjs`.

**Fix.** Write it before the pre-spend gate closes and run it in print-only mode for each of the three
arms. Changes from `qa-arm.sh`: replace the sample-ID hash with a pin on the three case contents
(`caseInputSha256` of each id, which matched across B3 and T on 2026-10-07) and on their lifecycle state
(all three are active); take `<arm> <port> <server-rev> <surface-sha>` as arguments; pass
`--ids q-comp-finclusive-caas,q-gap-leaderboard-project-not-builder,q-pc-quantum-preparedness-dormant`
and `--max-budget-usd 3`; keep `--max-panel-cases 34` and the pinned register. The round's launch
manifest should list the exact 15 invocations in order, each with its arm tuple.

## 9. Minor — the remote-identity stop rule is right but its consequence is understated

The runner captures the remote vector around every answering call. The round will run about 15 methods
over two to three hours. A Lumenloop inventory, Scout OpenAPI, or Docs record change in that window stops
the method and, per the brief, the round. That is the correct rule. State the consequence now: samples
collected before the stop are kept, rows with n < 4 in any arm are inconclusive, and a continuation is a
new round with a new vector and new authorization. Do not pre-authorize a continuation under the old $45.

## 10. Minor — order balance and position effects

The fixed order gives first-position counts B 2, T 2, A 1 and last-position counts B 2, T 1, A 2.
This is adequate for n = 5. Record per-method start timestamps (the runner does) and read the within-rep
differences first if a time-of-day pattern appears. No change needed.

## 11. Minor — pre-register the one known client mechanism

The 2026-10-07 closeout noted that Claude 2.1.292 maps `readOnlyHint` to `isReadOnly()` and
`isConcurrencySafe()`. I confirmed in the pinned binary: `isConcurrencySafe(){return mayOverlap ||
(annotations?.readOnlyHint ?? false)}` and `isOpenWorld(){return annotations?.openWorldHint ?? false}`.
The binary also forwards `annotations` (title, readOnlyHint, destructiveHint, openWorldHint) in the tool
definition it sends to the API, so the model can see them too. The brief's telemetry ("parallel
tool-call batches") is the right instrument. Pre-register the prediction: if the corrected
annotation-explained outcome occurs, T should show execute calls issued in parallel with another tool call
in the same assistant turn, and A and B should show none. This is descriptive, not a gate.

## 12. Minor — owner authorization wording

The quoted owner line is general ("Whatever you think is best"). The brief then sets $45 itself. Record
one explicit owner acknowledgment of "15 methods × $3, $45 total, no transfer, no resume" in the ledger
before the first paid call, as the skill's bounded-authorization rule expects.

## 13. Minor — allowed summaries: add three exclusions

Add: no statement about the 100-row 2026-10-07 aggregates; no "surface regression" or "non-regression"
wording; attribution applies to the named row only and never to the bundle. Also state that the
2026-10-07 ledger gets a dated pointer and nothing else (the brief already says this).

---

## Verdict: **launch after fixes**

Required before the first paid call:

1. Swap the attribution labels (Finding 1).
2. Tighten the three feature definitions and add the calibration controls and the named blind reviewer
   (Finding 3).
3. Rename "not reproduced" to "not detected at n = 5", add the pre-declared error rates and the
   within-arm noise floor, and define valid answers and the two n's (Findings 4, 5).
4. Write and print-check `qa-rows.sh`, record the 15 invocations, and run the free three-way
   `tools/list` diff (Findings 2, 8).

The arm design is a fair 2×2 factorization, the pins and guards are the same ones that produced
comparable artifacts on 2026-10-07, the cap is enforceable, and three concurrent dev servers share no
state that can leak across arms. With the fixes above, the round can answer question 1 with honest
limits and question 2 with correctly labeled attribution.

---

## Delta re-review

Scope: the revised brief, `/private/tmp/claude-501/qa-rows.sh`, and the wire dumps `tl-8788.json`,
`tl-8789.json`, `tl-8790.json`. I checked each of the 13 findings and looked for new problems. I ran
the launch script in print-only mode for all three arms, recomputed the three surface hashes from the
dumps with `eval/lib/mcp-surface.mjs`, diffed the dumps field by field, and recomputed the three
case-content hashes. No paid call, no repository edit.

| # | Finding | Status | Evidence |
|---|---|---|---|
| 1 | Attribution labels inverted | **Resolved** | Brief now reads "Description-explained … (A behaves like T)" and "Annotation-explained … (A behaves like B)", with the shared-factor sentence and the bundled-edit definitions. |
| 2 | Wire-level arm check | **Resolved** | Deep diff of the dumps: A vs T differ only in `tools[0].annotations.title`, `tools[1].annotations.{title,readOnlyHint,openWorldHint}` (plus `serverInfo.sourceRevision`); A vs B differ only in `tools[1].description`; `instructions` identical (same hash) in all three; `serverInfo.sourceRevision` is `1cc1f3a6`/`dd8724e5`/`cf060b7d` on 8788/8789/8790. Recomputed surface hashes equal the brief and the script: B `bd42923e…`, T `83d9734f…`, A `36587236…`, pairwise distinct. |
| 3 | Feature definitions, calibration, named blind reviewer | **Resolved** | The three definitions match the proposed text (own-voice rule, leaderboard-attribution rule, E1 gate with E2 telemetry). Calibration items (B3 absent, T present) are in the pack. Reviewer named: Codex workhorse `gpt-6.1-sol`, high; differs from the author (Claude Opus) and from this reviewer. Reviewer sees answers and golden only. |
| 4 | Error rates and noise floor | **Resolved** | "Not detected at n = 5" replaces "not reproduced"; the enumerated rates are in the brief; the noise floor is arm B's within-arm spread; the 2026-10-07 answers are never pooled; the split-rule case is "inconclusive". |
| 5 | Validity and two n's | **Resolved** | Invalid iff `agent.failure` non-null or no answer text; judge `error` removes from n_score only; n ≥ 4 applied per measure. |
| 6 | Cap enforceability and row order | **Resolved** | Battery order and the "cap stop costs quantum first" consequence are recorded; stored per-row costs are in the Budget section; the script passes exactly one `--max-budget-usd 3` per invocation. |
| 7 | Concurrent servers | **Resolved** | Local-state row added to the manifest; dev-registry sharing recorded as accepted. Live check: one `workerd` listener per port, cwd `qa-b`/`qa-t`/`qa-a` respectively, so `boundServerIdentity` will resolve each arm's worktree. |
| 8 | Launch script absent | **Resolved** | `qa-rows.sh` exists, is executable, passes `zsh -n`, takes `<arm> <rep> <env|print>`, binds port + revision + surface as one tuple per arm, pins the three `caseInputSha256` values (verified equal to `cases.json` and to both 2026-10-07 artifacts), and runs one `run-qa.mjs --ids … --max-budget-usd 3`. Print-only mode passed for B, T, and A with all pins OK; the runner worktree stayed clean. |
| 9 | Identity-stop consequence | **Resolved** | "Stop consequences" paragraph added: keep collected samples, n < 4 inconclusive, continuation is a new round, no resume under $45. |
| 10 | Order balance | **No change needed** | As stated. |
| 11 | Pre-registered client mechanism | **Resolved** | Prediction recorded as descriptive, not a gate. |
| 12 | Explicit owner acknowledgment of the cap | **Partly resolved, accepted** | The brief says the owner is told the $45 cap in the message that reports the launch, so the acknowledgment arrives after spend starts. The owner's quoted blanket authorization covers the amount. Residual: if the owner objects to $45 after launch, methods already run are sunk. Not a gate. |
| 13 | Summary exclusions | **Resolved** | The forbidden phrases and the bundle/aggregate exclusions are in Allowed summaries. |

### New problems found in the revision

1. **Minor — the script's lifecycle check is a no-op.** It reads `k.lifecycle?.state`, but the
   compiled case keeps lifecycle at `k.truth.lifecycle.state`, so the `MISSING` branch fires only for
   an absent id. `caseInputSha256` covers question, golden, and two tags, not lifecycle, so a case that
   is quarantined between now and launch would pass the pin. All three are active today, and the runner
   records `excludedQuarantinedIds` in every artifact, so this is observable after the fact. One-line fix
   before the first method: use `k.truth?.lifecycle?.state`. Not a gate.
2. **Note, no action.** The fresh stable vector (`1a927dce…`, file written 10 minutes after the probe
   hash, consistent with three captures) differs from the 2026-10-07 vector. That is expected: live
   Scout moved to 1.9.72 while the three pinned servers still carry the pre-drift catalog. The mismatch
   is equal across arms and the round compares arms within this window only.
3. **Note, no action.** The environment hash printed in my shell (`01e5a3cf…`) is not the collection
   shell's value. The orchestrator records it from the collection shell before method 1 and passes it as
   the third argument to every invocation.

### Final verdict: **launch**

All gate items from the first review are closed. The one new item is a non-blocking one-line fix to the
launcher's lifecycle check, best applied before the first paid method.
