# Item 7.2 plan review (RWA card caveat)

Reviewer: Claude Fable 5.2, effort high, 2026-11-17, for lead `t1wz`. Scope: `PLAN.md` in this folder
against `fdddbe26`, the binding notes (`7-COMMON.md`, `7.2-NOTE.md`), item 6.3's records and scripts, the
cited code, issue #167 and the `run-evals` skill. I edited no plan, made no commit and ran no model.

**Verdict: the design is sound and the routing table reproduces exactly. Fix finding 1 (the caveat's
wording) before commit P, because the treatment cannot change after the one run the cap allows. The other
findings are plan-text fixes that do not change the rule.** 1 blocking, 11 should-fix, 6 nits.

## What I checked and found sound

- **Placement (check 1).** No scorer, admission, rerank or skill-search path reads `cardCaveat` or the
  rendered card.
  - `rg cardCaveat src scripts` finds five readers: the schema (`src/catalog/types.ts:194`), a kind check
    at manifest load (`src/catalog/search.ts:272`), the builder (`scripts/build-catalog.mjs:1217-1233`),
    the ADR-0003 text guard (`:1271`) and the renderer (`src/mcp/tools.ts:204-215`).
  - `compactCard` runs on the finished page (`src/mcp/tools.ts:350-358`), after `recoveryStage.resolve`.
  - The scorers read `id`, `name`, `service`, `description`, `keywords`, `routingKeywords` and
    `routingPhrases` (`src/catalog/vendor/search-scoring.ts:116`, `src/catalog/scoring.ts:195-215,387,523`).
  - `codemode.describe`, `codemode.catalog` and sandbox `codemode.search` hits do not carry the field
    (`src/executor/providers.ts:746-759,786-793`; `SearchHit`, `src/catalog/search.ts:64`). The plan's
    statement that the public card is the only place the client sees it is correct. Finding 2 follows
    from it.
- **Routing table, reproduced.** I applied commit I's three source files and the plan's caveat, built
  `tmp/7.2-review/variant.json`, restored with `git checkout -- .` (`git status` shows only this folder),
  and ran `eval/run-routing.mjs --gate` on both manifests with stdout to files.
  - My variant equals the lead's `tmp/7.2/variant-manifest.json` apart from `generatedAt`, and equals
    commit I's manifest apart from `generatedAt` and the RWA `cardCaveat`.
  - Legacy 219/293/326/113 becomes 219/291/325/111. Holdout stays 12/26/30/30, so **top3 stays on its
    floor of 26**. Captures go 11 to 10. Extended, skills and protocol history do not move.
  - The base run prints GATE PASS. The variant's only failure is the manifest fingerprint. Both outputs
    match the lead's saved files line for line.
- **Script reuse (check 3).** The five blob SHAs in step 1 match `HEAD`. All four selftests pass and
  write nothing in the tree. Every default path follows a flag:
  - `ab-run.mjs`: `--out` and `--capture-dir`; the stop file is `<out>.stop.json`.
  - `blind.mjs --retest` and `attribute.mjs`: the key, grade hash, attribution key and score files all
    default to `--answers-dir`.
  - `questions.json` and the result-1 `verdicts.json` are read beside the scripts, as intended.
  - No check refuses a fresh `tmp/7.2/rt`. `eval/qa/run-qa.mjs`, which the harness imports, did not
    change between `cd4520bd` and `fdddbe26`.
  - Two command lines in the plan do not run as written (findings 5 and 6).
- **The rule (check 4).** Step 5 restates 6.3's "Re-test rule (second measurement)" exactly: three
  clauses at 2 or more, the two-pair and one-pair cases, the carried clauses, computed by the same code
  (`blind.mjs:545-648`).
- **Caveat mechanics.** 132 characters, one line, ends with a period, under the 135 cap. 6.3's caveat was
  also 132, so the 87 characters of description on the card are the same as in 6.3's INCLUDED arm.
- **Caps and spend (check 7).** 42 planned, 45 attempts checked before every attempt, subscription CLI
  only, one `dev:eval` at a time, decision, estimate and stop rule stated. The owner answer is recorded
  (`DECISIONS.md:102`).
- **Exclude branch.** The three re-open triggers match the note, and the lead does not close the issue.

## Findings

### 1. Blocking: the caveat does not name the field the D3 answers misread, and one clause is garbled

- **Evidence.**
  - Registry rows carry `launchedAt`: "Contract creation date (Soroban). null for classic assets. Horizon
    does not date issuance." (output schema in the variant manifest). The entry's scored `keywords`
    already hold `launched` from that field.
  - 6.3's D3 loss was a misreading of that field: "Lists only registry rows with 2025 launch dates and
    names no 2025 DeFi launches" (`items/6.3/RESULTS-2.md:111`).
  - The plan's sentence, "Registry rows are not a launch or news timeline", contradicts what the client
    then sees in the rows (a field called `launchedAt` with 2025 dates) and does not say why.
  - "state counts holders" lost 6.3's "not product status". It now reads as "state is the number of
    holders". The fact is that `live` means two or more holders, not an active product.
- **Why blocking.** The cap allows one run. A wording that fails cannot be replaced without a new
  authorization, and the owner wants #167 cleared if that is reasonable.
- **Fix.** Name the field, in the style the file already uses (`lumenloop.find_av_passages`: "Do not use
  created_at as the recording date"). Either of these passes the builder's check:
  - 130 characters, my recommendation: `Not a launch or news timeline: launchedAt is contract creation,
    Soroban only. Includes fiat stablecoins; state is by holder count.`
  - 133 characters: `Not a launch or news timeline; launchedAt is Soroban contract creation. Includes fiat
    stablecoins; rwaxyzValueUsd is rwa.xyz's value.`
  - The first drops the rwa.xyz attribution, which the field name and its schema text already carry. The
    second drops the `state` fact.
  - Routing is unaffected by construction. If the lead keeps its own wording, say why in the
    reconciliation and restore "not product status" or drop the `state` clause.

### 2. Should-fix: the header-rule amendment is too broad and breaks the "describe returns everything" rule

- **Evidence.**
  - The plan's amendment allows a caveat that "names a limit of the source's scope that cannot go in the
    scored description". That licenses unscored steering text on any card, for example "not for
    implementation questions". #167 forbids query and operation exceptions; this would be the same
    exception by another channel.
  - `src/mcp/tools.ts:200-202` and `ARCHITECTURE.md:67` say `codemode.describe(id)` returns everything the
    card cuts. Under the plan's caveat that is false: a client that finds the operation through
    `codemode.search` or reads `codemode.describe` never sees the timeline fact.
- **Fix.** With finding 1's wording the caveat restates served schema text, so a narrow amendment is
  enough: "Add an operation only when its full description or its output schema already states the
  caveat". `describe` returns the output schema, so the invariant holds. If the lead keeps a caveat that
  no served text states, 6a must also correct those two sentences, and the policy record must list
  "absent from `describe` and sandbox search" as residual risk.

### 3. Should-fix: the carried D1, D2 and D4 clauses cannot fail in this run, and the plan does not say so

- **Evidence.** `carriedClauses` recomputes from 6.3's committed `verdicts.json` (`blind.mjs:554-572`).
  Those are single samples measured on 6.3's card, without the timeline sentence. In 7.2 they are
  constants. D1 and D4 are the two questions where the registry is the right source, so the run does not
  measure whether the caveat pushes the client off the registry there. D4 is a history question, the
  kind a "not a timeline" line is most likely to deter.
- **Is carrying acceptable? Yes.** The note fixes the question set, the rule and the 45 cap, and D1, D2
  and D4 at three samples would add 18 answers. The unmeasured risk is also bounded: a client deterred
  from the registry falls back to what EXCLUDED does today, so the worst case is no gain, not a loss
  against `main`.
- **Fix.** Say this in "Risks" and require it in RESULTS and in the policy record's residual risk: the
  carried clauses are constants from a different card; an include rests on seven questions; registry use
  on D1 and D4 under the new card is unmeasured, bounded as above. Name C2's `rwaCalled` count against
  6.3's 3 of 3 as the only proxy (the plan already reports it).

### 4. Should-fix: nothing reports whether the client saw the caveat

- **Evidence.** The caveat exists only on a public `search` card. The client writes its own queries, and
  a client that reaches the operation through `codemode.search` never sees the line. A D3 result is then
  unreadable: a pass may owe nothing to the caveat, and a loss may come from runs that never saw it.
- **Fix.** Add to "Reported, not counted", per INCLUDED run: whether a `search` call returned the RWA
  card before the first registry call. The records already hold it (`calls[].tool`, `calls[].rwaInResult`
  in `answers-included.jsonl`, `ab-run.mjs:120-121`), so the harness does not change.

### 5. Should-fix: the dry-run command in step 1 fails

- **Evidence.** `node .../ab-run.mjs --dry-run --keys C1,C2,C3,D3,N1,N2,N3 --samples 3` exits 1 with
  "--arm must be excluded or included" (`ab-run.mjs:76`; I ran it). With `--arm` but no `--out` it prints
  "capture dir tmp/6.3/rt".
- **Fix.** `--arm excluded --dry-run --keys ... --samples 3 --out tmp/7.2/rt/answers-excluded.jsonl
  --capture-dir tmp/7.2/rt`. It prints 21 runs and "capture dir tmp/7.2/rt".

### 6. Should-fix: write every judging command in full

- **Evidence.** Step 4 gives `--answers-dir` for `--pack` and `--score` but not for `blind.mjs --retest
  --validate` or the three `attribute.mjs` calls. Without it each reads `tmp/6.3/rt`
  (`blind.mjs:843-849`, `attribute.mjs:46,205-209`). That directory does not exist in this worktree, so
  the call fails closed, but the executor should not have to work the flags out mid-run.
- **Fix.** List the six commands with `--answers-dir tmp/7.2/rt` on each, `--verdicts` and
  `--grading-verdicts` pointing at the judge directory, `--dir` for the attribution packet, and
  `--result1-verdicts` on both `--score` calls. No `--key`, `--attr-key`, `--hash-file` or `--out` is
  needed.

### 7. Should-fix: EXEC.md cannot be written in this folder while an arm runs

- **Evidence.** `scripts/run-eval-server.mjs:18-21` refuses to start on any untracked file, and the
  identity check demands an empty `git status --untracked-files=all`. Step 1 tells the executor to record
  P's SHA "in EXEC.md", which is written after P and is therefore untracked. 6.3 said where drafts live
  ("RESULTS-2 and EXEC drafts stay in `tmp/6.3/` until both arms end"); this plan does not.
- **Fix.** State it: EXEC and RESULTS drafts, the judge and attribution briefs and every scratch file
  stay in `tmp/7.2/` until the INCLUDED arm's end checks pass. Every brief a child needs before that is
  in commit P.

### 8. Should-fix: the include branch has no path for the third control, and #167's checks are not mapped

- **Evidence.**
  - The new check 8 says the correct Docs operation "stays rank 1" on #167's mixed-intent controls. C1
    and C2 are measured. The third control is a confirmation-only row; in #167's own table the registry
    was rank 1 on it. The 6a test asserts rank 1 "on each, the third by a boolean assertion only", and
    the plan does not say what happens when that assertion fails.
  - #167's acceptance has seven conditions. An include meets some and replaces others: no general intent
    mechanism ships, and "implementation questions avoid the registry" is not met (6.3: C1 called it in
    2 of 3 runs, C2 in 3 of 3).
- **Fix.**
  - Pre-register the branch: if the third control's assertion fails, the executor stops and reports,
    tunes nothing, and check 8 and the test claim rank 1 only for the controls where it holds. The PR
    then says `Refs #167` and the orchestrator decides.
  - Put a checklist in the closing comment and the policy record, one line per #167 condition: met,
    with evidence, or replaced on the owner's instruction (DECISIONS.md), and what was not tested (the
    third control was never answer-tested; C3 stood in).

### 9. Should-fix: a closing keyword can close #167 on the wrong branch or before production changes

- **Evidence.** Commit C is written before the outcome is known and stays in history under 6b. A squash
  merge copies commit messages into the merge body, and GitHub closes on "closes", "fixes" or "resolves"
  even inside other text (AGENTS.md, "Coordination"). On include, `Closes #167` in the PR body closes the
  issue at merge, before the orchestrator deploys.
- **Fix.** No commit message carries a closing keyword; C's message says `Refs #167`. On 6b, grep the PR
  body for `(close|fix|resolve)[sd]? #` before merge. On 6a, either accept "closed at merge, deploy
  pending" in the report, or use `Refs #167` and let the orchestrator close after production serves the
  operation. I recommend the second.

### 10. Should-fix: the scoring scripts have never had an independent review

- **Evidence.** 6.3 planned a Codex check of `ab-run.mjs`, `blind.mjs` and `attribute.mjs` "for a
  blinding or scoring defect" under 6a only. 6.3 ended in exclude, so it never ran
  (`items/6.3/REPORT.md:42`). This plan's Codex list drops that check. An include would then rest on
  scorers that only plan reviewers and selftests have seen.
- **Fix.** Add to the 6a Codex review: read the three scripts' re-test mode for a blinding or scoring
  defect, and recompute the outcome from `tmp/7.2/rt` and the two verdict files.

### 11. Should-fix: 6b recommends closing after an inconclusive result

- **Evidence.** Step 6b covers "Exclude or inconclusive" and then recommends closing #167 as "decided:
  excluded by measurement". An inconclusive run measured nothing decisive. The TODO edit is also only
  "one sentence", while the note wants the TODO to hold the re-open triggers.
- **Fix.** Split the branch. Exclude: the recommendation as written, and this PR writes the three
  re-open triggers into the TODO RWA bullet and adds "and 7.2" to check 8's "tested and not adopted"
  sentence. Inconclusive: no close recommendation; name the missing pairs and leave a re-run to the
  orchestrator, as 6.3 did.

### 12. Should-fix: the text sweep lists files the executor must not open

- **Evidence.** I ran the sweep in step 6a. It is names-only and the search guard allows it, but its 57
  files include `eval/routing-qa-overlap.json`, `eval/discovery/cases.json`, `eval/agentic/sample.json`,
  `eval/partner-docs/cases.json` and `test/fixtures/evidence-pack.mjs`. 6.3's plan added "opened only
  for files outside the case sets"; this plan dropped that sentence.
- **Fix.** Restore it and name those five. The edit set is prose and tests that say RWA is excluded.
  Also sweep for the counts that move and do not contain "rwa": 285 entries, 65 spec paths, 29 Scout
  operations.

### Nits

13. **The new card test duplicates an existing one.** `test/server.test.ts:862-878` already asserts, for
    every entry with a `cardCaveat`, that the card ends with the whole caveat inside the 220 budget. Drop
    the planned test, or say what it shows that this loop does not.
14. **Harness identity across arms.** Record that `git diff --stat P C -- .agents` is empty, so both
    arms ran the same harness and questions.
15. **Local server state.** 6.3 served INCLUDED from a fresh worktree. Here the INCLUDED arm inherits the
    EXCLUDED arm's `.wrangler` state. Record whether it is kept or cleared, and treat both arms the same.
16. **Clock.** State that both arms run on the same UTC day, not only that none starts between 23:30
    and 00:00.
17. **6b check.** After the revert, record that `catalog/manifest.json` hashes to `7a4fab76…5caa29`
    again.
18. **Residual risk wording.** The rule passes D3 at one attributable drop in three. Have RESULTS and the
    policy record state D3's worse-pair count plainly, so a partial fix is not read as a full one.

## Reviewer notes

- One slip against the search rule: I ran `wc -l` with a shell glob over `items/6.3/`. It printed file
  names and line counts only, no file content.
- Scratch I left, all git-ignored: `tmp/7.2-review/` (variant manifest, build log, two routing outputs)
  and two files under `eval/results/`. The tracked tree is unchanged.
- I did not run the boolean check on #167's third control. It is a confirmation-only row, and a
  reviewer's result would feed the plan.
