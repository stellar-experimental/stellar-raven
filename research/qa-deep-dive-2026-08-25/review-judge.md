# review-judge — measurement harness + corpus/goldens

Reviewer: Claude (Fable 5), independent of both lane authors (`gpt-5.6-sol`). Read-only against every
repository and worktree. Base `e488c4f`. Reviewed `lane/measure-harness-20260825` @ `2260ec6` and
`lane/corpus-goldens-20260825` @ `cb14f14`. Every changed hunk was read.

## Verdicts

- **Target 1 — measure harness (`2260ec6`): CHANGES-REQUESTED.** Two blocking findings. Both are
  measurement-integrity gaps against the brief's own question ("do R8/R9 actually prevent the two
  artifacts that produced false flips/hard-wrongs in the 2026-08-18 rejudge?"). R8 does; R9 does not for
  the artifact in question. Everything else is sound.
- **Target 2 — corpus goldens (`cb14f14`): CHANGES-REQUESTED.** One blocking finding (the
  consistency register was not re-stamped; seven clusters silently go stale, zero at base) and one
  truth-provenance finding that must be corrected before landing (the `freshness-drift` root cause is
  false: the old identifiers were never valid strkeys). The WisdomTree repair itself is correct and
  independently re-verified live.
- **Interaction:** the two branches merge cleanly (one shared file, disjoint hunks); typecheck and the
  five affected test files pass on the merged tree. No compile-order dependency.

---

## Target 1 — measure harness

### Blocking

**M-B1. R9 does not skip the row that produced the 2026-08-18 hard-wrong.**
`eval/qa/re-judge.mjs` — `rejudgeRows`, the new `hasSuccessfulAnswer(row.answer, row.agent?.failure)`
skip.
The 2026-08-18 rejudge (`2026-08-18T22-04-13-rejudge.json`) re-judged
`2026-08-14T03-56-23-variantA.json`. In that artifact the `q-n3-ssrf-metadata-endpoint` row carries
`agent.error: "success"`, **no** `agent.failure` key, and a non-empty `answer` that is the provider
safeguard text. `hasSuccessfulAnswer` therefore returns `true`, and the skip never fires. I imported
the new `rejudgeRows` with a stub judge and fed it that exact saved row: **judge calls = 1, new score =
"wrong", skipped = undefined.** The flip `error → wrong` recurs unchanged.
This is not a corner case: every collection artifact before 2026-08-18 has 0 rows with an
`agent.failure` key (`2026-08-14T03-56-23` 0/100, `04-13-13` 0/15, `04-16-32` 0/2, all 2026-08-05 runs
0/10). Only the three 2026-08-18 runs (schema `qa-agent-result-v1`) carry it. The headline 100-case
artifact the plan says to rerun and compare against is exactly the unprotected shape.
*Fix:* in the re-judge skip, also treat as ungradeable a saved verdict that is an agent-level error:
`row.verdict?.score === "error" && row.verdict.promptSha256 == null && typeof row.verdict.judgeScore !== "string"`
(agent-error verdicts are the only error verdicts emitted with a null prompt hash; judge CLI failures,
unparseable verdicts, and consistency errors all carry a prompt hash or a `judgeScore`). Add a test
using the legacy row shape (`agent.error`, no `failure`, safeguard text as `answer`). Keep the
`hasSuccessfulAnswer` branch for modern rows.

**M-B2. R8 removes the only sanctioned way to judge a modern artifact against current goldens.**
`eval/qa/re-judge.mjs` — `resolveCasesRef` default + `readCasesAtRevision` hard-fail + ordering in
`main()`.
With the recorded `runnerRevision` as default, `--cases-ref` is now the only lever, and every
`--cases-ref` value goes through the revision-pinned identity guard, which `fail()`s on any hash
mismatch. Because the compiled case content (including `truth.asOf`/`verified.date`) is inside the
hashed snapshot, a revision whose goldens changed can never pass that guard, so the new
`--allow-golden-drift` path is unreachable for any artifact that records a `runnerRevision`. Verified on
the real artifact: default pin → identity `true`; `--cases-ref HEAD` → "revision-pinned case identity
guard failed"; `--cases-ref HEAD --allow-golden-drift` → same hard failure. At base the working-tree path
produced a loudly labeled `nonIdentical` artifact under `--allow-non-identical`; that option is now
dead for pinned artifacts. `--allow-golden-drift` and the golden-time guard only ever execute for
artifacts with no `runnerRevision` (none exist in `eval/qa/results/`) or for the test's synthetic case
(a golden dated after its own collection at the same revision).
*Fix:* add an explicit working-tree mode (`--cases-ref worktree` or `--no-cases-pin`) that restores
the base path — identity guard reported, not fatal; `nonIdentical` label; `goldenTimeConsistency`
enforced there, with `--allow-golden-drift` as its escape hatch. That is where the golden-time guard
has teeth. Update the usage line and the R8 test to exercise that path rather than the synthetic one.

### Verified as correct (not trusted)

- **R8 pin is effective.** `git show 7072688:eval/qa/cases.json` for the 2026-08-14 artifact's selected
  100 ids hashes to `9f0bc00f…`, equal to `meta.inputSnapshot.casesSha256`. Nine of those cases changed
  since collection; six live/scheduled golden dates are newer than `finishedAt`, including both flips
  Fable §4.2 attributes to "golden edited 08-18" (`q-edge-fresh-latest-scf-round`, `q-scf-open-rfps`).
  Under the default pin both are judged against the collection-time goldens. Collection already
  enforces a clean tree and a 40-hex `runnerRevision` (`assertCollectionSourceIdentity`), so the pin is
  safe for every modern artifact.
- **Golden-time guard logic** (`goldenTimeConsistency`): correct on the fields it reads, tolerant of a
  missing/invalid `finishedAt` (returns `matches: true`), scoped to `live`/`scheduled`. Reachability is
  the issue (M-B2), not the arithmetic.
- **A1 panel:** default path returns the original verdict object (`toBe` identity in the test —
  byte-compatible). Majority with worst-first tie: 2-panel `[correct, partial]` → `partial`; 3-way split
  `[correct, partial, wrong]` → `wrong` (documented "worse score"). Cost: `costUsd` summed only over
  finite costs; `panelReportedCostCount` / `panelMissingCostCount` recorded; a panel with zero reported
  costs emits no `costUsd` (correct — no fabricated zero). `judgeCostAccounting` (re-judge) and
  `costAccounting` (run-qa) both count expected calls × panel size and reported calls from the panel
  metadata; skipped rows contribute nothing because agent-error verdicts carry no cost. Judge-stored
  attempts record `callCount`/`reportedCostCount`. Cost accounting is preserved.
- **A8 math:** `halfCreditShare` = (correct + partial/2) / all rows — same denominator convention as the
  README's 64.5% figure. `coreAnswerCorrectShare` denominator = graded rows only (consistency-error rows
  and agent errors excluded, as the brief specifies). Coverage excludes zero-key-fact cases and ungraded
  rows; empty inputs return `null`, not NaN (tested). Stored-judge path writes the same fields.
- **A6 rule** fires only with a trap tag, `coreAnswer: "correct"`, empty `wrongClaims` and
  `avoidMatches`, a `partial`/`wrong` score, and a refusal-confirming rationale. Judge prompt and rubric
  text unchanged (confirmed by diff). Effect is the existing consistency-error mechanism: the verdict
  becomes `score: "error", judgeScore: <raw>` — it never promotes to `correct`.
- **Scope:** exactly the eight declared files; `agentPrompt` untouched on this branch. Gates as
  reported: `typecheck` clean and the harness/consistency/re-judge/judge-stored tests pass on the merged
  tree (101/101).

### Advisory

- **A1 error votes.** A single judge CLI/parse error in a 2-panel (`[correct, error]`) or a 3-way
  disagreement with one error (`[error, correct, partial]`) resolves to `error` — the whole panel's
  spend yields no grade. `[correct, correct, error]` correctly yields `correct`. Consider treating
  `error` votes as abstentions when at least one graded vote remains, or retrying the erroring vote.
- **A6 regex false positives.** Probed: "Adoption has *declined*; … omits two facts" and "The answer
  *rejected* the user's valid premise" both trigger the violation. Also, "correctly refused the injected
  instruction **but did not answer the legitimate part**" triggers it, converting a legitimate partial
  (rubric: "answers the legitimate part while refusing the illegitimate part") into an error. Narrow
  to refusal verbs with an object (`refus\w+ (the|to)`, `declin\w+ to`) and exempt rationales that
  mention the legitimate part being omitted.
- **A8 `coreAnswerNullCount`** counts every error verdict (agent errors, judge failures, consistency
  errors all set `coreAnswer: null`), so it mostly measures error rows, not judge omissions. Either name
  it accordingly or restrict it to graded rows.
- **Judge-stored panel mixing.** `judgeStoredResults` refuses when `meta.judgePanel` is set and
  differs, but a file judged single-call has no `meta.judgePanel`, so resuming it with `--judge-panel 2`
  silently mixes panel and single verdicts. Treat an absent `judgePanel` as 1 in that check.
- **Cross-checkout artifacts.** `meta.casesPath` is recorded absolute. With the pin now the default,
  re-judging a main-checkout artifact from a worktree fails immediately with "casesPath is outside the
  repository" (previously it fell through to the working-tree path). Given the repo's worktree-based
  lanes, map the recorded path by its `eval/qa/…` suffix onto the current `REPO_ROOT`.
- `TOOL_VERSION` bumped to `re-judge/v4` with no consumer of the string besides the artifact; fine.

---

## Target 2 — corpus goldens

### Blocking

**C-B1. Consistency register not re-stamped; seven clusters go stale.**
`eval/qa/consistency-register.json` (untouched) vs. edited members
`q-defi-wisdomtree-crdt` (cluster with member hash `b3c9cfb6…`), `q-infra-horizon-vs-rpc`
(`e1865a28…`), `q-ti-rpc-gettransactions-pagination-xdr` (`f850792c…`, in two clusters).
The golden-truth skill makes `npm run eval:qa:register` mandatory on every gospel change. Run in a
scratch clone of `cb14f14`: **7 clusters REOPEN**, including the one carrying the register's own
2026-08-24 "no member claim changed" re-sweep note; at `e488c4f` the same command reopens **0**.
The lane declined because the register is outside its owner surface — that is a coordination fact,
not a reason the repo may land with a stale register. *Fix:* either extend the lane's surface and
commit the re-stamp with a reopen note per cluster, or record in the round ledger that the merge
commit must run the register and reconcile the seven reopens before the branch lands.

**C-B2. `rootCause: ["freshness-drift"]` on `q-defi-wisdomtree-crdt` is false.**
`eval/qa/corpus/battery/defi-ecosystem/q-defi-wisdomtree-crdt.json` — `truth.verified.rootCause`.
I checked the strkey checksums: the OLD issuer `GBWMQUGGGS5P…` and OLD SAC `CBQDK4Y3EWQH…` both fail
the CRC16 check (the SAC is also one base32 character short); the NEW values both validate. The old
identifiers were never valid Stellar keys, so nothing "drifted" — the 2026-07-11 sweep transcribed
them wrongly (Fable's "garbled gospel" reading is right). The skill routes eval-side authoring flaws
to a `.agents/TODO.md` entry, not to `freshness-drift`. The rewrite also drops the two `improvements/`
refs (`sls-023`, `ll-012`) from `rootCause`; that both loses the upstream links and, as a side effect,
exempts this case from the branch's own new symmetric-caution warning. *Fix:* keep the two
`improvements/` refs, replace `freshness-drift` with a `.agents/TODO.md` authoring-defect entry (or an
explicit "transcription error in the 2026-07-11 import" line plus that entry), and add the symmetric
caution the new lint expects.

### Verified as correct (not trusted)

- **WisdomTree receipts are sufficient and consistent.** `/tmp/raven-qadeep/wisdomtree-toml.txt`
  line 289–290 shows `code="CRDT"` / `issuer="GBWMQUGPPLSC62YPGD5CEHATOQRQMNLNAV2TMEXJ4ZYOTY4TJD6J2P45"`;
  `horizon-crdt.json` returns the same issuer with `contract_id
  CBQDK4Y3B2RYUSXE6JYYTHB6AIW655FPGE4OW7A2BWDZXZ5RALQ3UK3P` (231 authorized accounts). Headers match
  the reported fetch times/ETag. I re-fetched both sources live on 2026-08-26: TOML unchanged; Horizon
  `assets?asset_code=CRDT` lists five issuers and only the WisdomTree one carries that SAC. Two classes
  (A owner TOML, C live Horizon) agree, meeting the entity-attribution bar. Source-class edits are
  consistent with the skill (owner site/IR → A, Horizon → C). The old strings appear nowhere else in
  the tree; the three named siblings contain no conflicting CRDT identity.
- **Compile consistency.** Running `compile-qa.mjs` on a scratch copy of `cb14f14` reproduces
  `cases.json` and `sample.json` byte-for-byte; `sample.json` differs from base only in
  `corpusContentSha256`; the 30 sampled ids are unchanged. `cases.json` diff is exactly the three case
  edits plus the digest.
- **Symmetric cautions** on the two cases are scoped ("while the filed upstream defect stands", "for
  that dispute", "unless the answer contradicts the golden fact independently of the quoted page") and
  each case's notes already name the disputed claim (Horizon lifecycle polarity; hardcoded-vs-configurable
  RPC limits). They cannot be read to excuse an unrelated false claim. Consistent with the skill's
  "add a symmetric grader caution" instruction and with the author's source-agnostic policy.
- **`agentPrompt` change** is the single stated line, added identically to both surfaces; no other
  prompt semantics changed. Consistent with the "dating volatile claims is a product requirement"
  policy.
- **Lint plumbing:** `lintGoldenAuthoring` added to `runLint` and `lintLiveContract`; all six classes
  emit `warn`; `printFindings` exits non-zero on errors only, so CI is unaffected in both modes.
  Fixture positives/negatives match the regexes; 22 lint tests pass on the merged tree.
- **Scope:** nine declared files only.

### Advisory

- **The avoid lint contradicts the answering contract it ships with.** 81 of the 156
  `presentation, omission, or phrasing` warnings hit the `without … date/provider/scope` form
  ("Do NOT present a changeable current measurement without its provider, scope, and observation
  date"). The judge prompt explicitly classifies those as ANSWER-VISIBLE sourcing conditions that bind,
  and the same commit adds a prompt rule requiring exactly that dating. Warning on them invites
  authors to delete legitimate answer-visible conditions. Exempt the `without <a dated source | its
  provider/scope/date>` form from `NON_CONTENT_AVOID_RE`.
- **Warnings-only is acceptable for landing** because the counts (801 / 192 / 131 / 156 / 12 / 70)
  make an error gate impossible today, but 1,465 standing warnings will be ignored. Suggest a
  ratchet: record the per-class baseline and fail CI when a class count rises.
- **`hasSymmetricCaution` requires a near-verbatim three-part template**; the two cautions the branch
  wrote satisfy it, but paraphrases will not. Either document the required sentence in the
  golden-truth skill or loosen the regex.
- **Key-fact predicate splitter** splits on bare `and`, so "Identifies X, Y, and Z" survives only
  because the second clause lacks a verb; facts like "States the cap and notes it is configurable"
  will warn even when atomic in intent. Acceptable for a warning.
- **`verified.by` history** was replaced rather than appended. The skill says the file carries the
  latest event only, so this is per policy; the dropped 2026-07-11 evidence lines remain in git.

---

## Interaction between the branches

- **Shared file:** `eval/qa/run-qa.mjs` only. Measure edits imports, cost accounting, judge-stored,
  metrics, and CLI; corpus adds one prompt line in each `agentPrompt` branch. `git merge` in a scratch
  clone: auto-merged, **no conflicts**. On the merged tree: `npm run typecheck` clean; the five affected
  test files pass (101 tests).
- **Compile order:** none. Corpus regenerates `cases.json`/`sample.json`; measure reads them at run
  time only. Landing order is free.
- **Measurement note:** the prompt line changes `runnerFileSha256`/`qaImplementationSha256`, so any
  "same-100 rerun" after both land carries a contract change alongside the harness changes. Not a
  defect; record it in the round ledger so the rerun delta is not attributed to R8/R9/A8 alone.
- **C-B1 is amplified** by the merge: the register reopens happen whichever branch lands first, and
  no branch owns the fix.

## What I ran (all read-only against the repos; scratch copies only)

- `git log --stat` / `git diff e488c4f..HEAD` on both worktrees; every hunk read.
- Node probes importing `rejudgeRows`, `judgeCasePanel`, `checkVerdictConsistency` from the measure
  worktree with the real `2026-08-14T03-56-23` row (R9) and synthetic votes/rationales (A1, A6).
- `re-judge.mjs --dry-run` on a scratch copy of the 2026-08-14 artifact under the new code (pinned
  default, `--cases-ref HEAD`, `--cases-ref HEAD --allow-golden-drift`) and under base `e488c4f`.
- Hash check of `git show 7072688:eval/qa/cases.json` against `inputSnapshot.casesSha256`; golden-date
  scan of the 100 selected cases at the pinned revision and at HEAD.
- Survey of `agent.failure` presence across all 147 `*variantA.json` artifacts.
- Scratch clone of the repo: `compile-qa.mjs` byte-diff, `register-helper.mjs` at `cb14f14` and at
  `e488c4f`, `lint-corpus.mjs --since e488c4f` warning breakdown, merge of both branches, typecheck,
  and the five affected vitest files.
- Strkey CRC16 validation of old and new issuer/SAC strings; live re-fetch of the WisdomTree TOML and
  Horizon `assets?asset_code=CRDT`.
