# Answer-accuracy evaluation

This evaluation measures whether an agent gives a correct, current answer through `search` and `execute`.
It is the headline instrument in the [evaluation map](../EVALS.md).
Use the [run-evals workflow](../../.agents/skills/run-evals/SKILL.md) to plan and size a round.

## Directory / lane map

| Path | Purpose |
|---|---|
| `corpus/battery/<category>/<id>.json` | Authored active and quarantined cases |
| `corpus/proposed/` | Proposals that await verification and activation |
| `corpus/retired/` | Permanent retirement records |
| `corpus/live/live-cases.json` | Frozen `live-data-canonical-v3`, with 15 cases |
| `corpus/live/live-digest-supplement-cases.json` | Frozen `live-digest-supplement-v2`, with two cases |
| `cases.json`, `sample.json`, `lifecycle-registry.json` | Generated headline cases, sample, membership, and identity records |
| `tool-cases.json` | Generated tool-contract lane: battery cases with `truth.lane: "tool"` |
| `taxonomy.json` | Coverage map: domains, leaves with weight, volatility, and case target, and open slots |
| `consistency-register.json` | Cross-case contradictions and numeric invariants |
| `results/` | Local, ignored collection and judging artifacts |
| `reviewed/` | Retained dated evidence |
| `claim-read-packets.mjs`, `claim-read-brief.md` | Packets and the standing brief for the governance and attribution claim read; the lead splits the packets into chunk files and gives each reader one |
| `heldout-read.sh`, `heldout-read.mjs` | Orchestrator-only held-out launcher and its counts-only plan/summary helper; defaults `STABILITY_REGISTER` to `/home/tyler/raven-data/qa/judge-stability.json` outside any worktree |

[lifecycle-registry.json](lifecycle-registry.json) owns current battery membership.
Keep the battery, canonical live cases, and digest supplement separate in reports.
Live-contract edits require a contract-version change, provenance, and updated content digests.

## Commands

Run these offline checks before collection:

```sh
npm run eval:qa:lint -- --stale --enforce-floors
npm run eval:qa:register -- --check
npm run eval:selftest

# Regenerate outputs after approved case changes.
npm run eval:qa:compile

# Check expected-answer changes against a reference.
npm run eval:qa:lint -- --since <ref>
```

Lint findings name the case id, the check and a field path, never golden or question text.

The headline battery measures Stellar truth by taxonomy leaf. It does not measure operation reach,
skill reach, or response-envelope traps; the routing gates, the skills routing cases, unit tests,
the frozen live lanes, and the tool lane own those.

`--coverage` checks headline cases against [taxonomy.json](taxonomy.json). Every headline case names an existing `truth.leaf`, and no leaf holds more than its `cases` target plus one primary case.
An empty weight-2 or weight-3 leaf warns unless `openSlots` names it with a reason; `--enforce-floors` makes it an error.
An open slot whose leaf has an active case is an error, so the list only shrinks. `--stale` rejects expired `truth.reverifyBy` values.
Use `npm run eval:qa:register` to update member hashes after reviewed changes.
An unclustered case cannot trigger a cluster's automatic reopening; register coverage needs separate review.

After independent review, use `npm run eval:qa:register -- --review <file.json>` to close reopened entries.
Stamp member changes before applying that review.
The review file uses these collections and exact selectors:

| Collection | Selector |
| --- | --- |
| `clusters` | `id` |
| `numericInvariants` | `matchLabel` |
| `dateContingentTraps` | `matchTriggerDateEvent` |

Each closure needs `verdict: "consistent"`, `lastChecked`, matching `reSwept` evidence, and `clearReopened: true`.
The helper preserves member hashes and authoritative values. It rejects unknown collections and ambiguous selectors.

For paid collection, reuse a running `dev:eval` server with the expected revision.
The launcher requires a clean worktree and includes that revision in MCP `serverInfo`.
Follow the run-evals workflow if the required server is absent.

```sh
node eval/qa/run-qa.mjs \
  --variant A \
  --sample 30 \
  --port 8788 \
  --max-budget-usd <usd> \
  --server-revision <commit> \
  --expect-sha256 <surface-sha256> \
  --expect-agent-binary-sha256 <wrapper-sha256> \
  --expect-agent-environment-sha256 <environment-sha256> \
  --remote-identity-probe eval/qa/probe-remote-identities.mjs \
  --expect-remote-identity-probe-sha256 <probe-sha256> \
  --expect-remote-identity-sha256 <vector-sha256>
```

Use the actual bound port. Variant A uses the shipped `search` tool.
For the canonical live lane, replace `--sample 30` with `--cases eval/qa/corpus/live/live-cases.json`.
For the digest lane, use `--cases eval/qa/corpus/live/live-digest-supplement-cases.json`.
For the tool-contract lane, use `--cases eval/qa/tool-cases.json`; report it apart from the headline.
Use one `--ids a,b,c` argument for an explicit selection.

The [runner parser](run-qa.mjs) owns the complete flag contract.
`--no-judge` is its only bare boolean flag. Other flags require one spaced value.
Unknown flags, equals forms, stray arguments, and duplicate required flags fail before a paid call.
The `--judge-stored` mode rejects `--ids`; use the re-judge tool to select saved rows.

`--surface per-operation` selects a separate 61-operation diagnostic: 18 Lumenloop, 29 Scout, 12 Docs and 2 stellar.org operations.
[plain-operation-harness.mjs](plain-operation-harness.mjs) defines that surface.
[compare-architecture-ab.mjs](compare-architecture-ab.mjs) compares its results with the two-tool surface.

## Identity and budget requirements

Every paid runner mode requires the total budget, executable hash, and environment hash.
Collection also requires the server revision, surface hash, probe path, probe hash, and stable remote-vector hash.
The runner checks local identities before and after collection.
A stable local listener does not establish remote service identity.

Pin the versioned executable, not a self-updating launcher.
A launcher such as `~/.local/bin/claude` is a link that another session can move during an update.
Put a private directory that holds only a link to the versioned executable first on `PATH`.
Turn off the CLI's auto-update in the collection shell; for Claude Code, set `DISABLE_AUTOUPDATER=1`.
A changed pin stops the method before the next paid call. A new pin starts a new run.

Compute every pin in the collection shell, after all Claude-related variables have their final values:

```sh
SERVER_REVISION=<clean 40-character server commit>
node eval/report-live-surface.mjs --port "$PORT" --expect-source-revision "$SERVER_REVISION" --json /tmp/raven-eval-surface.json
SURFACE_SHA256=<surfaceSha256 from the report>
AGENT_BINARY_SHA256=<SHA-256 of the capped Claude wrapper resolved on PATH>
AGENT_ENVIRONMENT_SHA256=$(node --input-type=module -e 'import { agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs"; process.stdout.write(agentEnvironmentIdentity().sha256)')
```

The artifact records environment names and hashes, never their values.
[executable-identity.mjs](../lib/executable-identity.mjs) defines the executable and environment identity checks.
After collection, confirm the `meta.*` identity fields and `meta.comparable` in the artifact.
Loopback sessions use a fixed `dev-local` artifact owner and write artifacts to the local simulated R2 binding.

Before a new paid run, run the committed public identity probe:

```sh
REMOTE_IDENTITY_PROBE=eval/qa/probe-remote-identities.mjs
REMOTE_IDENTITY_PROBE_SHA256=$(shasum -a 256 "$REMOTE_IDENTITY_PROBE" | cut -d ' ' -f 1)
REMOTE_IDENTITY_SHA256=$(env -i PATH="$PATH" "$REMOTE_IDENTITY_PROBE" --stable-sha256)
```

This live read-only command makes no model calls: it captures three vectors five minutes apart (Scout OpenAPI, Lumenloop public inventory, and keyless Stellar Docs `llms.txt` / `llms-full.txt`, avoiding the org's 10,000 req/hr Mintlify API quota) and requires matching hashes. It receives only `PATH` and records no credentials; it does not detect Mintlify ranking changes without content changes. See [probe-remote-identities.mjs](probe-remote-identities.mjs) for canonicalization, retries, and timeouts.

The runner checks remote identity around every answering call and at final postflight. A before-call check may reuse an after-call capture ≤ 60 s old on a monotonic clock when no call intervened (first check and postflight always capture fresh). On probe unavailability, it retries after 30 s, 60 s, and 120 s (never retrying mismatches or missing baselines); four failed attempts or a changed vector stop spend, suppress aggregates (`meta.comparable: false`, `meta.aggregatesSuppressed: true`), and prevent resuming under the same budget ledger. See [run-qa.mjs](run-qa.mjs) for check-entry timestamps and `elapsedMs` fields.

`--max-budget-usd` caps cumulative spend across answering, judging, panels, retries, and stored-judge resumes; each call receives only the remaining budget and missing cost data invalidates the method. Because a harness-killed judge prints no cost, `judge.mjs` owns fetch timeouts and retries with the harness timeout as backstop; a total with missing costs is a lower bound only.

## Case schema and golden lifecycle

Use the [corpus guide](corpus/README.md) for case authoring.
[compile-qa.mjs](compile-qa.mjs), [lifecycle.mjs](lifecycle.mjs), and [lint-corpus.mjs](lint-corpus.mjs) enforce the case contract.
Do not edit generated cases, samples, or registry records by hand.

| Field | Consumer |
|---|---|
| `question`, `golden.*`, `tags.trap`, `tags.freshness` | Judge prompt and expected-answer change checks |
| `surface` | Manifest exposure checks; hidden from agent and judge |
| `tags.service` | Sample selection and service reports |
| `truth.*` | Provenance, verification, lifecycle, and consistency checks; hidden from the judge |
| `truth.leaf`, `truth.secondaryLeaf` | Taxonomy coverage (one primary leaf, at most one secondary) |
| `truth.notes` | Provenance text moved out of `golden.notes`; judge-blind |
| `truth.lane` | `tool` moves a Raven-mechanics case out of the headline into `tool-cases.json` |

The filename must equal the case ID. The directory must equal `tags.category`.
IDs remain permanently reserved. Key facts use one to five entries.
Scheduled cases require `truth.asOf` and `truth.reverifyBy`.
Live cases use behavioral expectations instead of fixed volatile values.

Changes to questions, expected answers, or judge-facing tags require the [golden-truth workflow](../../.agents/skills/golden-truth/SKILL.md).
The change must include a new verification event, evidence, and a supported root cause.
A desired score increase is not evidence.

Only active and quarantined battery cases compile.
New IDs first enter as proposals. A later reviewed commit can activate them.
Activation requires verification, duplicate checks, boundary checks, and a reviewer who differs from the author.

A credible truth or validity conflict can quarantine a case.
Record its cause, evidence, author, independent reviewer, start date, review date, and decision record.
The first review date must fall within 30 days after the start.
Renewal requires another independent review and a new bounded review date.
Judge noise queues review; it does not justify quarantine.

Retirement requires a reason independent of scores and a permanent retirement record.
That record keeps the final content digest, evidence, independent review, and replacement IDs.
A merged case is a retirement whose replacement ID is its survivor. A migration-ledger row may keep a retired destination; the tombstone points forward.
The compiler rejects missing reserved IDs, direct battery additions, duplicate IDs, and retired-ID reuse.

Mass review starts at the earliest configured threshold: 25 queued active cases, five percent queued, or three calendar months.
The percentage calculation rounds upward.
[corpus/lifecycle-policy.json](corpus/lifecycle-policy.json) records the cadence anchor and frozen review identity.
Keep corpus-health results separate from system-quality results.

### Held-out split

A round that tunes against the battery draws its split once, at close, from the final headline
battery. Key each case by `sha256("qa-split-<round date>:" + id)`. Stratify by taxonomy domain
(the prefix of `truth.leaf`) and `tags.freshness`, sort each stratum by key, and deal positions
in order: tuning, held-out, held-out, reserve, repeating (25/50/25 percent). A case added later
goes to reserve until the next draw, which uses a new salt. Write the split to
`eval/qa/results/splits/<date>.json`; that directory is git-ignored and no tuning lane reads it by
default. Record only its SHA-256 in the round ledger, and never copy a held-out or reserve ID into
a ledger or `.agents/TODO.md`.

A held-out or reserve case whose content an agent or the orchestrator saw moves to tuning by a dated
amendment that writes a new split file and leaves the old one in place; a re-draw is a separate
owner decision. Record the amendment in the new file's `amended` field and in the round ledger, with
the new file's SHA-256. The tuning row count lives in one constant (`TUNING_ROW_COUNT` in
`tuning-rows.mjs`), and `split-amend.mjs` holds the checked move.

How to search without reading case text: see [Searching without reading case text](#searching-without-reading-case-text).

**Maintenance exception.** A golden-maintenance lane may open and edit a held-out or reserve
case without moving it. The lane is its lead, its executor and its reviewers. Its brief says
that it runs under the exception and names the trigger before any case is opened. All of these
hold:

- **Trigger.** It is a fact about the world, not about Raven: a `reverifyBy` date, a
  source-sentinel drift, an upstream event shown by a primary source, or a consistency-register
  entry that such an edit reopened. An edit prompted by a Raven answer, transcript, or verdict
  on that case is not maintenance, and that case moves to tuning.
- **No Raven output.** The lane reads no stored answer, transcript, or verdict for a case it
  opens, and runs no model-calling eval.
- **Edit.** It changes only what the trigger made stale, through `golden-truth` and its
  independent re-derivation.
- **Write set.** The lane's sessions and its pull request change no product code, catalog,
  prompt, rubric, judge pack, or gate threshold, and its sessions do no other work. They may
  change the corpus and its compiled outputs, the register, the source sentinels and the test
  that pins them, `improvements/`, and the lane's own records.
- **Records.** The lane works by case id and never looks up or writes which set a case is in; an
  id written without its set is not a copy in the sense above. Outside the corpus and the
  register, nothing it writes quotes or paraphrases a case's judge-facing text: not its report,
  review file, ledger row, TODO entry, finding, commit message, pull-request body, or a message
  to another terminal.
- **Readers.** No other agent, and not the orchestrator, opens the case files, the pull
  request's diff of them, or a log that prints them. The orchestrator merges on the review
  verdict and the check status.

A lane that does not claim the exception, or misses a condition, keeps the rule above. Anyone
outside the lane who sees the content still triggers the move. The exception moves no case
back: a case already in tuning stays there. A held-out read reports, as a count, the cases with
a judge-facing change since the split was drawn and since the read it is compared with.

### Searching without reading case text

A recursive search of the repository must not put golden, held-out or reserve text in an agent's
context. Three parent-folder `.ignore` files carry the paths, and ripgrep skips them from any
starting folder; an explicit path argument still searches them:

| File | Entries |
|---|---|
| `eval/.ignore` | `corpus/`, `holdout-cases.json`, `protocol-history-blind-cases.json`, `protocol-history-blind-cases-v2.json` |
| `eval/qa/.ignore` | `corpus/`, `reviewed/`, `results/`, `cases.json`, `sample.json`, `tool-cases.json`, `consistency-register.json`, `source-sentinels.json` |
| `.agents/rounds/.ignore` | `2026-11-02-golden-audit/`, `2026-11-14-golden-coverage-audit/` |

`test/case-search-ignore.test.mjs` pins the entries and runs real ripgrep over a canary tree. CI
installs ripgrep and fails that test when it is missing; locally the behavior test skips with a
printed reason when `rg` is not on `PATH`. In a Claude Code shell `rg` is a function that runs the
Claude binary, so it is absent from a plain `bash -c`.

**How to search.** Use `rg --hidden -g '!.git' <pattern> [path]`. Plain `rg` also skips hidden
folders, so it never reaches `.agents/`, `.github/` or `.claude/`; `--hidden` with `!.git` fixes that
without walking `.git/`. Where `rg` is missing, use `git grep` with an exclusion for every listed path:

```sh
git grep <pattern> -- . ':!eval/qa' ':!eval/corpus' ':!eval/holdout-cases.json' \
  ':!eval/protocol-history-blind-cases.json' ':!eval/protocol-history-blind-cases-v2.json' \
  ':!.agents/rounds/2026-11-02-golden-audit' ':!.agents/rounds/2026-11-14-golden-coverage-audit'
```

**The agent `PreToolUse` hook.** One script, `scripts/agent-hooks/case-search-guard.mjs`, is wired
into four CLIs:

| CLI | Config file | Tools guarded | Notes |
|---|---|---|---|
| Claude Code | `.claude/settings.json` | `Bash`, `Grep` | Runs in every Claude session in a checkout. Shell rules probed live; `Grep` branch unit-tested only. |
| Codex | `.codex/hooks.json` | `Bash` | Runs when Codex is launched with `--dangerously-bypass-hook-trust`, which the launch line in [`.agents/model-roster.md`](../../.agents/model-roster.md) carries. Probed live with that flag in the main checkout and in worktrees that `~/.codex/config.toml` does not list as trusted. Without the flag, Codex runs a project hook only after it is approved in `/hooks`; treat such a session as unguarded. |
| Grok | `.grok/hooks/case-search-guard.json` | `Bash` (`run_terminal_command`, `Shell`), `Grep` (`grep`) | Probed live (shell and built-in `grep`) in a trusted project under `--always-approve`. Grok also reads `.claude/settings.json` when Claude compatibility is enabled; the native `.grok/hooks/` file keeps the guard active when Claude compatibility is off. Truncated inputs (`toolInputTruncated: true`) on guarded tools deny. |
| Antigravity (`agy`) | `.agents/hooks.json` | `run_command`, `grep_search` | `run_command` probed live under `--dangerously-skip-permissions`; `grep_search` unit-tested only. Allowed calls emit empty stdout (pass-through); `{}` would default proto3 `allow_tool` to `false`. |

The hook stops accidental, ordinary search forms (deliberate bypasses are out of scope): recursive `grep`, `git grep` without the full exclusions above, `rg -u`/`--unrestricted`/`--no-ignore*`, positive `-g`/`--glob`/`--iglob` or Grep-tool globs matching a listed name, shell globs or `$(...)` lists expanding to a listed path, and `xargs`/`find -exec` invoking `grep`/`rg`. It parses quote-aware across wrappers, subshells, and `cd` targets, blocks without rewriting, fails open on parse/startup errors, and accepts the false positive of `rg -g '*.json' -g '!eval/**'` (use `rg X src` instead). See [`scripts/agent-hooks/case-search-guard.mjs`](../../scripts/agent-hooks/case-search-guard.mjs) for full parser rules.

**Opt-in.** A golden-maintenance lane working under the maintenance exception above prefixes the
search segment with `CASE_TEXT=maintenance` (a segment-level environment prefix, for example
`cd eval/qa && CASE_TEXT=maintenance rg -u <pattern> corpus`) or opens a file by its exact path. The
last assignment of the variable that reaches the command counts, and it reaches a shell script the
command runs (`CASE_TEXT=maintenance bash -c '...'`), not the outer shell's command substitutions.
No other lane uses it.

**What the guard does not stop.** `cat`, the Read tool, `git diff`, `git show`, `git log -p`, an
explicit path to a listed file, a pull request's diff, a script file or a pipe into a shell
(`echo '...' | bash`), `ag`, `ack` and `ugrep`, an unglobbed search through an agent's built-in
grep tool if that tool does not honor `.ignore` (unverified for Grok `grep` and for Antigravity's
in-process fallback when embedded ripgrep is unavailable), a Codex session launched without
`--dangerously-bypass-hook-trust` or `/hooks` approval, a Grok session in an untrusted folder, and
any CLI outside the four above. `rg -g '*.json'` re-includes a file-level entry, so the hook denies
it where active; those sessions and other CLIs rely on the rule in `AGENTS.md`.

**Copies of golden text.** `eval/qa/case-text-scan.mjs` counts 8-word golden shingles (unique to at
most two cases) that a file git lists outside the paths above repeats. `npm test` fails when a file
with 50 or more is not in `case-text-baseline.json`, or exceeds its ceiling. Ceilings carry headroom;
a pull request that changes the corpus may raise one with a `reason`. The floor catches a bulk copy,
not a short quote: cite the case id and field, and never quote judge-facing text.

### Source sentinels

A sentinel re-reads a golden's own primary source and tests one anchor for a volatile value.
[source-sentinels.json](source-sentinels.json) holds them; [source-sentinels.mjs](source-sentinels.mjs) runs them.
A check is `present` (the source still states the value), `absent` (a roadmap item has not shipped), or `count` (a roster still has N rows).
A check that can hold on an empty page (`absent`, or a count of 0) also names a `guard` pattern that proves the page loaded; a failed guard is a read error.
A failed check is a drift: it queues the case for the golden-truth workflow before its `truth.reverifyBy` date.
A drift is never evidence for a gospel change.

```sh
npm run eval:qa:sentinels -- --check        # offline: schema, case IDs, caseAsOf pins
npm run eval:qa:sentinels -- --ids a,b      # live read of selected sentinels
```

`caseAsOf` pins the case's `truth.asOf`. A re-verification that changes `truth.asOf` must re-confirm the anchor live (`--ids <id>` also reads a stale sentinel) and update `caseAsOf` in the same change.
`npm test` fails while the dates differ. It cannot prove the live re-confirmation, so the reviewer checks the run output.
Write an anchor from text that a plain fetch returns, confirm that it holds live, and avoid commit-pinned URLs, which cannot drift.
The daily [golden-sentinels workflow](../../.github/workflows/golden-sentinels.yml) keeps one issue, labeled `golden-sentinels`, in step with the drift set.
The [2026-11-02 trial](../../research/audits/2026-11-02-golden-freshness-probe/README.md) records the method's recall and false-alarm measurements.

## Stored outcomes and retries

[agent-result.mjs](agent-result.mjs) parses each agent process into `qa-agent-result-v4` (`agent.failure` holds one failure class or `null`). Only a first-pass answering `transport` failure gets one retry (identical input bytes); only judge `cli` and `parse` failures get one total retry across collection and stored-judge resumes. Safeguards, timeouts, spawn/protocol/consistency/limit failures never retry. First-attempt answers, outcomes, and verdicts remain top-level values; retries live in `attempts.agent[]` and `attempts.judge[]`.

Answering agents run outside the repo with empty setting sources, disabled slash commands, and strict MCP config; every row must confirm `raven` connected (failure stops the batch and marks the artifact non-comparable). Search calls retain full inputs and bounded `resultProjection`; execute calls retain bounded text—compare usage tokens, not captured char counts, across surfaces. Shared `assistantTurn` ordinals show calls requested in one assistant message, not overlapping host execution. Attempt timestamps (`startedAt`/`endedAt`) and `originalFailureClass` are written by [run-qa.mjs](run-qa.mjs); `assistantTurn`/`assistantTurnBasis`, `agent.usage`, and redaction semantics are owned by [agent-result.mjs](agent-result.mjs) and [evidence-sanitizer.mjs](evidence-sanitizer.mjs); older artifacts may omit newer metadata fields.

## Five-track result contract

[ADR-0008](../../research/decisions/0008-human-review-eval-and-playground-policy.md) and [five-track.mjs](five-track.mjs) define T1 through T5.
Every rate includes its denominator, and each outcome category lists its IDs.

| Track | Reports |
|---|---|
| T1 | First-attempt coverage, valid-grade coverage, conditional quality, and agent-limit failures |
| T2 | Transport retry attempts, recoveries, repeated failures, and unattempted retries |
| T3 | Answered trap coverage, explicit grades, avoid matches, and consistency evidence |
| T4 | Harness and judge errors, invalid tests, quarantined diagnostics, panels, retries, and costs |
| T5 | Answering and judging safeguards and timeouts, plus answering transport failures |

Sampling uses the complete active-plus-quarantined pool, then reporting partitions the selected IDs.
Quarantined rows stay in T4 and outside T1 and T3.
The runner never replaces selected cases to improve coverage.
`summary.overall` contains raw first-attempt score diagnostics; it is not the T1 or T3 measure.

Artifact telemetry distinguishes static call sites, execute outcomes, and proven read outcomes.
`readOutcomes.successful` requires a bounded execute result whose visible JSON has `ok: true`.
A projected answer without that envelope can remain `indeterminate`.
`readBytes` remains `null`; the instrument does not estimate host byte evidence.

## Judging rubric and score comparability

The default answering model and the default judge model are both the Claude Code alias `sonnet`, so each takes the newest Sonnet. The rubric is `v2.11` and the evidence pack `p9`.
The artifact records the exact IDs that ran (`meta.model`, `meta.judgeModel`) beside the aliases requested (`meta.requestedModel`, `meta.judgeRequestedModel`).
Within a run, the first response pins the resolved ID for every later call of that role. A call that reports no resolved ID stops judging, or makes the answering rows non-comparable.
A resumed or re-judged file keeps the judge it recorded; an explicit different `--judge-model` is refused or labeled non-identical, as before.
Stored verdicts from `claude-sonnet-5` are a different judge from the current default. The first judged run on the new judge sets a new baseline, after the paid seven-case self-test on that judge.
The self-test calibrates one exact judge, so it requires `--judge-model <exact ID>` and refuses an alias. Resolve the alias first with the roster's one-call read (`claude -p --model sonnet --output-format json "Reply ok" | jq '.modelUsage|keys'`), then pass that exact ID. Each candidate runs on that ID and fails when its verdict reports a different model. The strict call record has no model key, so record the exact ID beside the summary.
`meta.judgeTiering.stabilityRegisterJudgeMatch` says whether the local judge-stability register was built from the judge in use (`true`, `false`, or `null` when the register predates the list). It stays advisory.
An artifact answered by an earlier model differs in answering identity; compare it with a new one only as a labeled cross-model comparison.
[judge.mjs](judge.mjs) owns the prompt and rubric. [evidence-pack.mjs](evidence-pack.mjs) owns evidence selection and serialization.

For ordinary cases, `correct` requires all substantive key facts and no wrong claim or fired avoid.
`partial` permits omissions or minor errors when no avoid fires and the verdict names the issue.
`wrong` covers an incorrect core answer, fabrication, or a fired avoid.

For traps, the golden defines the complete required behavior.
A bare refusal is insufficient when the golden also requires an answer, boundary, warning, alternative, or clarifying question.
A completed safe behavior can be correct without background facts that only explain it.
`error` records judge failure and never grades the answer.

The judge ignores style, length, and citation format.
Beyond-golden details remain unverified unless the evidence establishes a contradiction.
The freeze clause of a must-avoid item (a permanent, complete, exhaustive, timeless, or network-wide list) does not fire on a list the candidate presents as dated, source-scoped, or non-exhaustive.
An omitted list item in such an answer is a missing key fact, not a fired avoid.
An explicit permanence claim, or an instruction not to re-check, overrides that exemption even when the answer carries a date or a source.
A completeness claim overrides it only when it exceeds the stated source or date bounds or lacks support; a complete query result within its stated source stays exempt.
Other conditions in the same must-avoid item, such as operator verification, bind on their own terms.
Concrete wrong content inside the list still fires, such as a category called empty when the golden names live members.
For non-stable cases, the bounded evidence pack supports sourced changes from the golden snapshot.
Pack absence does not prove source absence.
The pack omits detected A/V `created_at` values and preserves source-basis boundaries.

### Claim support in pack `p9`

`claimSupport` shows execute-result text for candidate claims within the 12,000-character budget (stable rows still receive no pack). Anchors derive strictly from the candidate answer and saved execute results—never from judge verdicts—covering quoted/exact/phrase anchors, claim-word fallback sentences (with differing related statements kept neutrally), and `role=entity-list` units for multi-record claims.

- Selection anchors/claim words never enter the pack; when matched text does not fit or entity-list coverage has a gap, the pack emits only the general `claimSupportNotice` (naming no anchor, entry, or count).
- `caseSnippets` holds question/golden terms absent from the answer.
- `explainTranscriptEvidencePack` and `findTranscriptEvidencePackOmissions` (which counts only source text and `sourceMetadata` values, never labels or counters) are audit/diagnostic-only and never enter the judge prompt. See [evidence-pack.mjs](evidence-pack.mjs) for anchor tiers, entity-list parsing, and budget shrinking order.

[verdict-consistency.mjs](verdict-consistency.mjs) checks issue arrays, avoid indexes, and score consistency (preserving `judgeScore`, setting `coreAnswer: null` on error, never parsing answer prose).

Compare artifacts only when case content, model, rubric, pack, prompt semantics, and judge-tier policy match; otherwise require an explicitly labeled comparison under a common target contract. Grading changes require a rubric-version bump; evidence selection/serialization changes require a pack-version bump; use prompt-hash fixtures to prove comment/formatting edits preserve prompt bytes. Code keeps only the current pack—to import earlier packs from git, use `d15a4ce5` (`p6`), or `7e00ede2` (`p7`) / `36e77d40` (`p8`) after `git fetch origin pull/264/head` (see [the p9 replay](../../.agents/rounds/2026-10-12-pack-p9/replay-p9.mjs)).

The sampler allocates by service, sorts IDs, and selects evenly spaced cases; corpus growth shifts membership even at fixed sample size, so match IDs or disclose membership changes before comparing aggregates. Single-run movement needs transcript review or repeats before claiming a regression ([retained QA records](reviewed/2026-09-30-qa-guide-records.md)).

### Measurement shares

Complete judged artifacts report these active-row measures; suppressed aggregates omit them.

| Field | Meaning |
|---|---|
| `halfCreditShare` | `(correct + partial / 2) / active rows` |
| `strictCorrectShare` | `correct / active rows` |
| `coreAnswerCorrectShare` | Correct core answers divided by graded rows |
| `gradedCoreAnswerNullCount` | Graded rows with a null core answer |
| `coreAnswerVerdictCount` | The graded-row denominator |

There is no key-fact coverage share.
`missingFacts` contains judge prose, so its length cannot measure missing golden facts.

## Judge-tier contract

The default policy is `stability-boundary-v1`.
It starts with one judge vote and can expand to three votes.
A usable stability score below `0.75` triggers a panel without using the boundary cap.
A usable score at or above the threshold stays single.

Without usable history, boundary verdicts can trigger panels within `--max-panel-cases`.
The default cap is `ceil(selected / 3)`, bounded between 10 and 34.
`--max-panel-cases` or `QA_MAX_PANEL_CASES` can override it, including with zero.
A skipped boundary panel records its reason and remains single.

Judge errors never trigger tier escalation.
`--judge-panel 2|3` forces a fixed panel. Re-judging uses one vote by default and does not use tier selection.

[judge-stability.mjs](judge-stability.mjs) derives the local register from saved results.
A missing or invalid register selects the boundary path and records that status.
`meta.judgeTiering` records the policy, threshold, register hash, cap, source, denominator, and panel counts.
A stored resume preserves its first cap and refuses a different explicit cap.
Freeze one register for paired comparisons and use the same `--stability-register <file>` in all arms and resumes.
`heldout-read.sh` defaults `STABILITY_REGISTER` to `/home/tyler/raven-data/qa/judge-stability.json` (with its pinned SHA-256), alongside the archived stored QA results in `/home/tyler/raven-data/qa/results/`, outside any repository worktree.

## Paid judge self-test

Run this only for the paid rubric, prompt, pack, or adapter check:

```sh
npm run eval:qa:selftest -- \
  --runner-revision <commit> \
  --claude-path <absolute-path> \
  --expect-claude-binary-sha256 <sha256> \
  --expect-claude-environment-sha256 <sha256> \
  --judge-model <exact-judge-model-id> \
  --out eval/qa/results/<stamp>-p6-selftest.json
```

The wrapper requires a clean tree and checks runner, executable, and environment identities before and after judging.
It makes seven calls with a `$0.50` per-call cap and a `$3.50` total cap.
The output path and its `.tmp` path must not exist.
An optional `--paired-listeners <absolute listeners.json>` with `--expect-paired-listeners-sha256 <sha256>` checks recorded server listeners.
The record must match the digest and name exactly `baseline` and `candidate`, with four distinct listeners.
The wrapper checks those listeners before each call. A lost or replaced listener stops the remaining calls with code `paired-server-lost`.
This command is paid and does not run in CI.

## Offline stable-row evidence diagnostic

[diagnose-stable-evidence.mjs](diagnose-stable-evidence.mjs) checks saved `verdict.wrongClaims` against saved execute results (default: `freshness: "stable"` rows; read-only, prints JSON; excludes search hits, execute inputs, errors, console output, and host footers):

```sh
node eval/qa/diagnose-stable-evidence.mjs eval/qa/results > tmp/stable-evidence.json
node eval/qa/diagnose-stable-evidence.mjs <saved-result.json> --all-freshness --ids <case-id>
```

Only probes present in the saved answer count (`prose-match` / `term-match`; source-only matches go to `excludedMatches` / `judge-text-only`). Matches are fragment support only—neither proof of correctness nor fabrication on absence—and never modify saved artifacts, grades, or denominators. Pass `--help` or `-h` for full CLI usage; see [diagnose-stable-evidence.mjs](diagnose-stable-evidence.mjs) for probe normalization and output fields.

## Re-judge stored results

Use `run-qa.mjs --judge-stored <results>` for first judging of a capture made with `--no-judge`.
It requires a comparable artifact, matching schema and case snapshot, reproducible evidence, and the paid identity and budget flags.
It updates that capture's judging records and cumulative spend.

Use [re-judge.mjs](re-judge.mjs) to grade saved answers again into a separate `qa-rejudge-v1` artifact.
It never overwrites the source artifact and does not report T1 through T5.

```sh
node eval/qa/re-judge.mjs eval/qa/results/<stamp>-variantA.json \
  --ids <id-a,id-b> \
  --cases-ref <collecting-commit> \
  --dry-run
```

For a paid run, replace `--dry-run` with these flags:

```text
--max-budget-usd <usd>
--claude-path <absolute-path>
--expect-agent-binary-sha256 <sha256>
--expect-agent-environment-sha256 <sha256>
```

| Flag | Effect |
|---|---|
| `--ids <ids>` | Select saved rows once, without repeated IDs |
| `--flips-vs <baseline>` | Select rows with a different effective score from the baseline |
| `--cases-ref <revision>` | Resolve the case snapshot at that revision |
| `--judge-model <model>` | Select the judge model; a changed model makes the comparison non-identical |
| `--judge-panel <2|3>` | Use a fixed panel instead of one vote |
| `--allow-non-identical` | Permit source case or judge-tuple differences and label the artifact accordingly |
| `--allow-golden-drift` | Acknowledge goldens dated after the source collection |
| `--allow-empty` | Permit a zero-row flip artifact |
| `--dry-run` | Inspect selection and guards without paid calls |
| `--diagnostic-source` | Re-grade eligible explicit IDs from a settled Playground source, retaining failed-answer cells; always emit a non-promotable diagnostic |
| `--help` / `-h` | Print the parser's full usage contract |

`--cases-ref` does not establish pack identity. A `p6` source still differs from a `p9` re-judge.
Non-identical comparisons cannot establish identical-input judge variance.
`--allow-non-identical` does not waive baseline guards for `--flips-vs`.
`--allow-golden-drift` does not waive case, tuple, or baseline identity checks.
The flip baseline must reproduce its snapshot and share current judge identity and identical overlapping case content.

Re-judging records preflight and postflight executable identities separately from judging outcomes.
An identity or attestation failure remains visible even when judging also fails.
Missing grades produce `agreement: null`; they do not count as disagreements.

`--diagnostic-source` permits analysis of valid saved answers in a settled shard containing
judge errors or unsuccessful answer terminals. It requires explicit `--ids`, matching case
inputs, recorded model provenance, and a complete, consistent cost ledger. It rejects quarantine,
identity drift, missing costs, and unattempted rows. Failed-answer rows remain skipped observations
in the artifact; they do not become successful answers or disappear from the selected denominator.
Judge calls are accounted only where the source actually had an answer. This mode does not waive
the ordinary model/rubric/pack or golden-time guards. The new artifact retains the original
source budget and non-promotability under `meta.diagnosticSource`, sets `nonPromotable: true`
and `summary: null`, and cannot be used to promote a model or claim an aggregate comparison.
The source file is never edited; changing its budget/status flags is not a valid workaround.

Judging runs on the Claude Code CLI. There is no AI Gateway judge. A non-Claude
second judge follows the TODO item "Build a subscription second judge on OpenCode when a decision
needs one".

### Flip panel annotations

Flip and paired reports annotate each compared verdict as `skipped-max-panel-cases` (`panelEscalationSkipped: "max-panel-cases"`), `panel-result` (`judgeTierUsed: "panel"`), or `no-panel-metadata` (never inferred from `panelSize`), exposed under `flipPanelConfidence` / `skippedPanelRoles` / `skippedPanelArms`. Annotations change no IDs, grades, caps, or denominators.

### Offline planning-text diagnostic

[planning-text.mjs](planning-text.mjs) scans saved `rows[].answer` fields recursively (no model calls) for action statements and preparation preambles, excluding markdown quotes, code examples, uncertainty notes, and conditional offers ([fixture examples](../../test/fixtures/qa-planning-text-examples.json)):

```sh
node eval/qa/planning-text.mjs <results-directory> --sample-size 20
node eval/qa/planning-text.mjs <results-directory> --sample-size 20 --review <review.json>
```

Samples use deterministic SHA-256 order; `--review` validates `inputSha256`, row match, `label` (`planning` | `falsePositive` | `uncertain`), and recomputed counts/summaries. Report-only (changes no grade, prompt, or gate); see [the 2026-10-09 review](reviewed/2026-10-09-planning-text.json) for measured precision (does not establish recall or production prevalence).

## Paired `PASS` / `FAIL` / `INDETERMINATE` verdict

[paired-verdict.mjs](paired-verdict.mjs) is an experimental stored-result printer, not a release gate.
It requires at least 100 eligible IDs after exclusions, so it does not apply to sample-30.

```sh
npm run eval:qa:paired -- <baseline.json> <candidate.json> --json
npm run eval:qa:paired:validate
```

Each eligible ID must have an identical, recomputable `caseInputSha256` across artifacts.
The artifacts must share answering identity, judge identity, schemas, implementation, prompt additions, tier policy, and pinned stability register.
Both must be complete and comparable, with matching remote baseline vectors.

The method compares two cumulative-grade differences: `correct`, and `correct` plus `partial`.
T4 and T5 outcomes exclude an ID from both arms.
An agent-limit termination remains a T1 system failure and counts as wrong.
A candidate-only T4/T5 loss forces `INDETERMINATE`.

The default `0.08` margin is an experimental no-change confidence radius, not an accepted product tolerance.
`FAIL` requires an upper bound below zero for either component.
After that check, `PASS` requires both lower bounds above the negative experimental margin.
All other results remain `INDETERMINATE`.
[validate-paired-verdict.mjs](validate-paired-verdict.mjs) owns the deterministic calibration checks.

Stop after an initial `PASS` or `FAIL`.
Only an initial statistical `INDETERMINATE` permits one complete repeat of both arms with unchanged IDs and pins.
Use `--baseline-repeat` and `--candidate-repeat` for that second look, then stop.
Do not repeat guard failures, insufficient denominators, or candidate-only T4/T5 losses.

### Concurrent paired collection

[paired-collection-supervisor.mjs](paired-collection-supervisor.mjs) validates and runs `qa-paired-collection-plan-v2` (200 fixed selected IDs; read its validator before authoring a plan):

```sh
npm run eval:qa:paired:capacity -- --out /absolute/path/to/paired-capacity.json
npm run eval:qa:paired:plan-sha256 -- /absolute/path/to/paired-collection-plan.json
npm run eval:qa:paired:collect -- \
  --plan /absolute/path/to/paired-collection-plan.json \
  --plan-sha256 <canonical-plan-sha256>
```

- **Capacity check:** live public check (no model calls or local server) requiring two overlapping captures, 12 clean responses (Scout 2, Lumenloop 6, Docs 4) within 120 s, zero retries/`Retry-After`; valid for 24 hours (`86,400,000 ms`).
- **Plan pinning:** freeze capacity artifact and command arrays, record `--plan-sha256` outside the plan, and run the planned P6 self-test (`7 × $0.50`, `--paired-listeners`) before launching; the P6 command carries the collection's exact `--judge-model`. Keep the plan uncommitted and delete it after the run.
- **Bound invariants:** four distinct worktrees (two runners, two servers) and four distinct ports with different server revisions/surface hashes; pinned `selected.activeCorpusCount` (≥ 200) and ordered active-ID hash reproduced by both runners; identical binary, env, remote-probe, remote-vector, and stability-register hashes; salted `.dev.vars` hash (fresh 64-hex salt + sorted `[name, value]` entries, no raw values); baseline `add-missing` and candidate `verify-native` adapter modes; explicit `--ids`, `--no-judge`, and `--paired-control-arm` (no `--sample`); per-arm collection cap and higher cumulative stored-judge cap, with `twoArmCumulativeUsd` equal to the sum of the two cumulative arm caps; directed flip re-judge capped at `$15` with `--allow-empty` and no drift/non-identical overrides.
- **Execution:** supervisor enforces row barriers, alternating IPC release order, 4-hour deadline, and pre-row/pre-attempt listener checks (`lsof`/`git`, cancelling both arms on `paired-server-lost`, guard failure, budget exhaustion, or child error without restarting servers; the launch operator verifies surviving process-group members before signaling). Emits a receipt only after both complete artifacts pass all checks; run stored judging afterwards (requires `meta.comparable === true`, matching identities, and complete judging evidence with unsuppressed aggregates before advancing). Repeats preserve each arm's port pair.

## CI contract and evidence

CI regenerates and compares `cases.json`, `sample.json`, `tool-cases.json`, and `lifecycle-registry.json` byte-for-byte.
It runs the offline corpus, consistency-register, and frozen-contract checks.
The paid judge self-test is paid and runs only when its trigger holds; it does not run in CI.
The [golden-truth workflow](../../.agents/skills/golden-truth/SKILL.md) defines verification and independent-review requirements.
The [truth-maintenance workflow](../../.agents/skills/truth-maintenance/SKILL.md) owns expired verification schedules.

The [headline baseline record](reviewed/2026-07-super-corpus-baseline.md), [canonical live baseline](reviewed/2026-07-12-live-v3-baseline.md), and [cited QA records](reviewed/2026-09-30-qa-guide-records.md) retain evidence referenced by current artifacts.
