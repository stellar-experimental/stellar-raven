# Item 7.2 plan: RWA card caveat, aiming to clear #167

Lead: Claude Opus 5.5, agentpc `t1wz`, 2026-11-17. Worktree `/home/tyler/code/raven-wt/np-7.2`, branch
`np/7.2-rwa-caveat` from `origin/main` `fdddbe26` (7.1 merged as #478). Binding notes:
`/home/tyler/code/raven-wt/orch/7-COMMON.md` and `7.2-NOTE.md`. Owner answer (DECISIONS.md, "Follow-up
answers (2026-11-17, after item 6.3)"): "sounds good, do it, I'd love to be able to reasonably clear the RWA
issue if possible". Reviewed by Claude Fable ([REVIEW.md](REVIEW.md)); every finding is reconciled in the
last section.

**Search rule (binds the lead and every child):** search with `rg --hidden -g '!.git' <pattern> [path]`; the
`.ignore` files keep it out of the case-bearing paths. Never use `grep -r`, `git grep`, `rg -u` or
`--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over `eval/` or `.agents/rounds/`.
Where `rg` is missing, use the `git grep` exclusion pathspec that `eval/qa/README.md` ("Held-out split")
prints. Never open a QA case, QA results or reviewed files; never run the QA lint. Rows on
`eval/routing-qa-overlap.json` are never used in the A/B, and their ids, ranks and hits are never printed.
`eval/run-routing.mjs` prints aggregates only since 7.1; never pass `--rows`.

## Decision this changes

Whether `scout.getRwaAssets` joins the exposed surface (ADR-0003) with one added card fact: the registry is
not a launch or news timeline, because `launchedAt` is Soroban contract creation only. Item 6.3 result 2 kept it excluded on one repeatable loss: on "notable
DeFi and RWA launches of 2025" (D3) the INCLUDED client stopped at registry rows, graded partial against
correct in 3 of 3 samples. If the caveat removes that loss without new harm under the unchanged 6.3
result-2 rule, RWA ships and #167 closes under the TODO's answer-level check 8. Otherwise RWA stays
excluded and the report recommends closing #167 as "decided: excluded by measurement".

## Facts re-checked on `fdddbe26` (lead)

- Product paths are unchanged since 6.3's base: `git diff --stat cd4520bd fdddbe26 -- src catalog specs
  scripts/catalog-data scripts/build-catalog.mjs eval/plan package.json package-lock.json wrangler.jsonc` is
  empty. `catalog/manifest.json` SHA-256 is `7a4fab76…5caa29`, 6.3's EXCLUDED arm.
- 6.3's commit I (`92f71b8d`) is in the object store. Its source part (`src/policy/scout-exposure.ts`,
  `scripts/catalog-data/card-caveats.mjs`, `eval/plan/build-op-classes.mjs`) applies cleanly to `fdddbe26`.
- **Where the caveat goes.** `cardCaveat` (from `scripts/catalog-data/card-caveats.mjs`) is read by
  `compactCard` in `src/mcp/tools.ts:204-215`, which appends it to the search card after ranking. No scorer
  reads it: `src/catalog/vendor/search-scoring.ts` and `src/catalog/scoring.ts` read `name`, `description`
  and `keywords`; `rg cardCaveat src scripts` finds only the renderer, the schema (`src/catalog/types.ts:194`),
  the builder and the emitted-text guard. So the words "launch", "news" and "timeline" are seen by the
  client on the card and never by the scorer. `compactCard` runs on the finished page
  (`src/mcp/tools.ts:350-358`). `codemode.describe`, `codemode.catalog` and sandbox `codemode.search` do not
  carry the field (`src/executor/providers.ts:746-793`); the public card is the only place it shows.
  `describe` does return the output schema, which states each clause's source (below).
- **Routing (free, run by the lead).** A variant manifest built from `fdddbe26` with commit I's source part
  and the caveat below (`node scripts/build-catalog.mjs --out tmp/7.2/variant-manifest.json`, SHA-256
  `8b655245…`) equals commit I's manifest apart from `generatedAt` and the `cardCaveat` string. Routing
  (`eval/run-routing.mjs --gate`, aggregates only):

  | Lane | EXCLUDED (main) | INCLUDED+CAVEAT |
  |---|---|---|
  | Legacy top1 / top3 / top5 / card@5 | 219 / 293 / 326 / 113 | 219 / 291 / 325 / 111 |
  | Holdout top1 / top3 / top5 / card@5 | 12 / 26 / 30 / 30 | 12 / 26 / 30 / 30 |
  | Holdout forbidden captures | 11 | 10 |
  | Extended, skills, protocol history | | unchanged |

  These equal 6.3's INCLUDED numbers. The Fable reviewer reproduced the table line for line, and a build with
  an earlier caveat wording gave identical output (the caveat feeds no score). **Holdout top3 stays at 26, its floor**: inclusion moves no holdout
  top-3 row. The variant's only gate failure is the expected manifest-fingerprint mismatch. The gate holds,
  so the answer runs may start.
- `GET https://stellarlight.xyz/api/rwa`, keyless, 2026-11-17 23:49Z: 200, 117 KB, `registryAsOf`
  2026-11-12, registry 113 rows (97 rwa.xyz-listed, 16 issuer-declared), 52 issuers, 100 returned, `coverage.basis`
  "curated-registry". Unchanged from 6.3.

## The caveat (pre-registered)

`scripts/catalog-data/card-caveats.mjs`, key `scout.getRwaAssets` (132 characters, one line, ends with a
period, under `CARD_CAVEAT_MAX_CHARS` 135):

```
Not a launch or news timeline: launchedAt is Soroban contract creation only. Includes fiat stablecoins; state is not product status.
```

- It names the field the D3 answers misread. 6.3 result 2's D3 deficiencies were "Lists only registry rows
  with 2025 launch dates" (`items/6.3/RESULTS-2.md:111`), and the rows carry `launchedAt`: "Contract
  creation date (Soroban). null for classic assets. Horizon does not date issuance." The style follows the
  file's `lumenloop.find_av_passages` line ("Do not use created_at as the recording date").
- Each clause restates served schema or description text: `launchedAt` as above; fiat stablecoins from the
  description; `state` "is an on-chain fact, not a product status" from the output schema. 6.3's
  `rwaxyzValueUsd` clause is dropped; the field's schema text ("rwa.xyz's own USD value") carries it.
- It is a fact about the source, not a query or operation exception in routing (#167's rule): it moves no
  score.
- The file's header rule says a caveat restates the full description. Commit C narrows the amendment to
  "its full description or its output schema already states the caveat", so `codemode.describe` (which
  returns the output schema) still returns everything the card cuts (`src/mcp/tools.ts:200-202`,
  `ARCHITECTURE.md:67`). Comment-only; under exclude it is reverted with commit C.

## Steps

The executor is a Claude Sonnet 5.5 `hc` child. Commits use the normal hooks, never `--no-verify`, and end
with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Scratch goes to ignored `tmp/7.2/`. No push.

### 1. Pre-registration commit P (before any answer)

PLAN.md, REVIEW.md and `briefs/`. The harness is 6.3's, **run in place and unchanged**:
`items/6.3/ab-run.mjs` (blob `40637797`), `blind.mjs` (`f2f48359`), `attribute.mjs` (`e1019c3d`),
`questions.json` (`b8c10ade`) and the result-1 `verdicts.json` (`bd970d64`). Every output path is moved by
flag to `tmp/7.2/rt/` (`--out`, `--capture-dir`, `--answers-dir`). Before
the commit the executor runs `node --check` and every selftest (`ab-run.mjs --selftest`, `blind.mjs
--selftest`, `blind.mjs --retest --selftest`, `attribute.mjs --selftest`) and `ab-run.mjs --arm excluded
--dry-run --keys C1,C2,C3,D3,N1,N2,N3 --samples 3 --out tmp/7.2/rt/answers-excluded.jsonl --capture-dir
tmp/7.2/rt` (it must print 21 runs and "capture dir tmp/7.2/rt"), and records in EXEC.md P's SHA, the five blob SHAs at P, and that
`git diff --stat fdddbe26 P -- . ':!.agents'` is empty. P's tree is the EXCLUDED arm. If a default path
cannot be moved by a flag, the executor stops before P and reports.

`scripts/run-eval-server.mjs` refuses an untracked file, and the identity check needs a clean tree. So
EXEC and RESULTS drafts, judge and attribution packets' notes and every scratch file stay in `tmp/7.2/`
until the INCLUDED arm's end checks pass. Every brief a child needs before then is in commit P.

### 2. EXCLUDED arm (tree P)

- One `npm run dev:eval -- --port <free port>` as an `hc` child; readiness: the `initialize` POST returns
  200.
- Identity at start and end: `serverInfo.sourceRevision` = P = worktree `HEAD`; `git show
  P:catalog/manifest.json | sha256sum` = `7a4fab76…5caa29`; `git status --porcelain=v1
  --untracked-files=all` empty. Probe: one MCP `search` for "Which tokenized real-world assets are live on
  Stellar?", top seven recorded, no `scout.getRwaAssets`. Warm-up: one `codemode.skill.read
  ("skills.stellar-light.stellar-scout", { sections: ["when-to-use-this-skill"] })` through `execute`.
- One harness process: `node .agents/rounds/2026-11-16-next-phase/items/6.3/ab-run.mjs --arm excluded
  --model claude-sonnet-5-5 --port <p> --keys C1,C2,C3,D3,N1,N2,N3 --samples 3 --max-attempts 22
  --out tmp/7.2/rt/answers-excluded.jsonl --capture-dir tmp/7.2/rt`. Stop the server after the end checks.

### 3. Commit C (INCLUDED+CAVEAT) and its arm

Commit C is the surface that would ship, fixed here before any answer:

- `git cherry-pick --no-commit 92f71b8d` (commit I: exclusion entry and its two comment lines removed, 6.3's caveat, the
  `broad` op class, regenerated manifest, super-spec, op classes). Then replace the `scout.getRwaAssets`
  caveat with the text above, amend the `card-caveats.mjs` header rule as above, and regenerate in place:
  `node scripts/build-catalog.mjs`, `npm run spec:build`, `npm run family-text:build`,
  `node eval/plan/build-op-classes.mjs`. Expected diff from `fdddbe26` outside `.agents/` is commit I's
  six files; the manifest equals `tmp/7.2/variant-manifest.json` apart from `generatedAt`. Any other diff:
  stop and report. One commit with its own message. Tests are not run at C (the guard tests
  that name `getRwaAssets` fail until step 6a).
- Routing re-check on C's committed manifest against `fdddbe26`: every number must equal the table above.
  Any difference: stop and report.
- Restart `dev:eval` on C; the same identity checks with C and its manifest SHA; the probe must list
  `scout.getRwaAssets` rank 1; one MCP `search` for the D3 question records the RWA card text and must show
  the caveat in full; one `execute` calling `scout.getRwaAssets({ limit: 3 })` at start and end records ok
  or the error kind and `asOfBasis`. Same warm-up. Save the served `stellar-light` skill's RWA reference
  section to `tmp/7.2/stellar-light-rwa-section.md` (for the Codex review).
- Harness with `--arm included`, `--max-attempts` = 45 minus EXCLUDED's attempts, `--out
  tmp/7.2/rt/answers-included.jsonl --capture-dir tmp/7.2/rt`. Stop the server. Record both windows; both
  arms run on the same UTC day and none starts between 23:30 and 00:00 UTC.
- Record that `git diff --stat P C -- .agents` is empty (both arms ran the same harness and questions).
  The local `.wrangler` state is cleared (`rm -rf .wrangler/state`) before each arm's server starts, so
  both arms start from the same empty local state; record it.

### 4. Judging (the same setup as 6.3 result 2)

Grading judge: Claude Opus 5.5, effort high, an `hc` child of the executor, `--cwd` its directory, blind;
it answered nothing. Attribution judge, only if the packed set is non-empty: Claude Fable, effort high, a
new session that is neither this plan's reviewer nor a grader. With `S=.agents/rounds/2026-11-16-next-phase/items/6.3`,
`J` and `A` fresh `mktemp -d` directories under `/tmp`:

1. `node $S/blind.mjs --retest --pack --dir $J --answers-dir tmp/7.2/rt`; the judge writes `$J/verdicts.json`.
2. `node $S/blind.mjs --retest --validate --verdicts $J/verdicts.json --answers-dir tmp/7.2/rt` (records the
   grade hash; at most one completion pass for missing fields, never a grade change).
3. `node $S/blind.mjs --retest --score --verdicts $J/verdicts.json --answers-dir tmp/7.2/rt --result1-verdicts $S/verdicts.json`.
4. If there are candidates: `node $S/attribute.mjs --pack --dir $A --grading-verdicts $J/verdicts.json --answers-dir tmp/7.2/rt`;
   the judge writes `$A/verdicts.json`.
5. `node $S/attribute.mjs --validate --dir $A --verdicts $A/verdicts.json --answers-dir tmp/7.2/rt` (at most
   one correction pass).
6. `node $S/attribute.mjs --score --dir $A --verdicts $A/verdicts.json --grading-verdicts $J/verdicts.json --answers-dir tmp/7.2/rt --result1-verdicts $S/verdicts.json`.

The deviation from blind judging is 6.3's, unchanged: the attribution
  judge sees the INCLUDED tool output, no EXCLUDED answer, no grade and no stake.

### 5. The rule (6.3 result 2, unchanged) and the stop

Grades, candidate pairs, the three clauses (bad loss net ≥ 2; attributable drop with `involvesRegistry`
≥ 2; wrong registry use ≥ 2), the two-pair and one-pair inconclusive cases and the carried result-1
clauses for D1, D2 and D4 are exactly `items/6.3/PLAN.md`, "Re-test rule (second measurement)", computed
by the same code. **Include only if no clause fires on any of the seven questions, no inconclusive
condition holds, and the carried D1, D2 and D4 clauses hold.** The outcome is computed once,
mechanically; the lead does not override it. The executor writes `RESULTS.md` (6.3 RESULTS-2's shape)
and stops. Reported, not counted: everything 6.3 result 2 reported, plus per question INCLUDED+CAVEAT
`rwaCalled` against 6.3 result 2's INCLUDED counts (C2's against 3 of 3 is the only proxy for whether the
caveat moves the client off the registry where it is right); whether the D3 answers name a non-registry
launch source; per INCLUDED run, whether a `search` call returned the RWA card before the first registry
call (from `calls[].tool` and `calls[].rwaInResult` in `answers-included.jsonl`); and D3's worse-pair count
stated plainly (the rule passes D3 at one attributable drop in three, so a partial fix must not read as a
full one). RESULTS states that the carried D1, D2 and D4 clauses are constants measured on 6.3's card, so
an include rests on the seven re-sampled questions.

### 6a. Include (follows 6.3 PLAN.md step 6a, with these changes)

Commit C stays. Further commits:

- **Policy record** `research/decisions/0012-rwa-registry-exposed.md` (ADR form as 0009 to 0011): the
  outcome and evidence (6.3 RESULTS, RESULTS-2, this RESULTS, the routing table); the changed check 8;
  the caveat and why it lives on the card; residual risk (a card slot on mixed implementation questions,
  C1:1-type misreads; registry use on D1 and D4 under the new card unmeasured, bounded because a client
  deterred from the registry falls back to what `main` does today; the caveat absent from `describe` and
  sandbox search, which return the output schema it restates; D3's worse-pair count);
  `asOfBasis: "observed"` against `meta.registryAsOf` and per-row `verifiedAt`; the
  100-row cap with no paging; no `retrievalProfile`; `src/policy/scout-exposure.ts` as the exposure and
  drift config.
- **Scout `/api/rwa` data-source caveats** (the 6.3 source check): owner (Stellar Light curates;
  `rwaxyzValueUsd` is rwa.xyz's valuation), period (`registryAsOf`, `verifiedAt`, six-hour `measured`
  lane), denominator (`counts.rwaxyzListed` / `counts.issuerDeclared`), components (rwa.xyz classes, fiat
  stablecoins as `productKind=stablecoin`). The TODO "Resolve held source ownership" RWA bullet gains that
  the registry serves no growth rate, so that correction stays held.
- **Tests:** the `npm test` failure list on C is the worklist, as 6.3 step 6a says (counts and lists move;
  guard tests that use `getRwaAssets` as the non-exposed example switch to `getQualityReport` or
  `verifyClaim`; `test/drift-141-routing.test.ts` loses the fixture catalog and "keeps RWA excluded", and its
  three `it.fails` controls become one passing test that the correct Docs operation is rank 1 on each, the
  third by a boolean assertion only; `test/fixtures/rwa-routing.ts` goes if nothing else imports it). No new
  card test: `test/server.test.ts:862-878` already asserts, for every entry with a `cardCaveat`, that the card
  ends with the whole caveat inside the 220 budget.
- **Third control (pre-registered):** if the boolean assertion fails (the correct Docs operation is not rank 1
  on #167's third control), the executor stops and reports, tunes nothing, and check 8 and the test claim
  rank 1 only for the controls where it holds. The PR then says `Refs #167` and the orchestrator decides.
- **Gates** `eval/gates.json` re-baselined under the `run-evals` rule: legacy top3 293 → 291, top5 326 →
  325, card@5 113 → 111; holdout captures 11 → 10 and `maxForbiddenCaptures` 11 → 10; holdout floors
  unchanged (top3 stays 26); manifest SHA-256, `baselinedAt`, `localTrace` from the `--gate` run; the
  `holdoutNote` and a new head note in `evidence.notes` as 6.3 step 6a says, naming this A/B and the
  independent review.
- **Text:** the `scout-exposure.ts` comment; `.agents/TODO.md` routing-repair item (the RWA bullet and the
  `it.fails` bullet go; check 8 becomes "A general RWA query reaches `scout.getRwaAssets` in the top three;
  on #167's mixed-intent controls the correct Docs operation stays rank 1 and answers do not degrade (round
  items 6.3 and 7.2)"); the 5.1 `matchPartners` re-exposure step matches the new `holdoutNote`;
  `ecosystem-skills/PIN-REVIEW.md` gains a dated line that the served `stellar-light` skill keeps its RWA
  section; other text that says RWA is excluded, found with `rg --hidden -g '!.git' -l -i -w -e rwa -e
  getRwaAssets -e "api/rwa" -g '!research/**' -g '!.agents/rounds/**'` (file names only) and opened only for
  files outside the case sets: never `eval/routing-qa-overlap.json`, `eval/discovery/cases.json`,
  `eval/agentic/sample.json`, `eval/partner-docs/cases.json` or `test/fixtures/evidence-pack.mjs`. Also
  sweep for the counts that move without the word: 285 entries, 65 spec paths, 29 Scout operations.
- **#167:** no commit message and no PR text carries a closing keyword; everything says `Refs #167`, and the
  lead greps the PR body for `(close|fix|resolve)[sd]? #` before reporting. The orchestrator closes #167
  after the deploy serves the operation, with the closing comment the lead drafts in the report: a checklist
  with one line per #167 condition, each met (with evidence) or replaced on the owner's instruction
  (DECISIONS.md, "Follow-up answers (2026-11-17, after item 6.3)"), and what was not tested (the third
  control was never answer-tested; C3 stood in). It says no general intent mechanism shipped and that the
  mixed-intent captures stay with the TODO routing repair and #223. The policy record carries the same
  checklist.
- Deploy needed (manifest, spec and a model-facing card).

### 6b. Exclude

- `git revert` commit C, so the evidence stays in history; record that `catalog/manifest.json` hashes to
  `7a4fab76…5caa29` again.
- The TODO RWA bullet gains this result in one or two sentences and the three re-open triggers: a Scout
  `/api/rwa` schema change, a general mixed-intent routing mechanism, or an owner product need. Check 8's
  "tested in round item 6.3 and not adopted" sentence becomes "round items 6.3 and 7.2". The lead posts one
  #167 status comment.
- The report recommends closing #167 as "decided: excluded by measurement", the TODO holding the triggers.
  The lead does not close it.
- No deploy.

### 6c. Inconclusive

- `git revert` commit C, with the same hash check. The TODO RWA bullet and a #167 status comment say
  "inconclusive" and name the questions with missing pairs. No close recommendation; a re-run is the
  orchestrator's call. No deploy.

On 6b and 6c the lead greps the PR body for `(close|fix|resolve)[sd]? #` before reporting.

### 7. Records

`items/7.2/EXEC.md` (what was done, each gate's summary, deviations), `RESULTS.md`, the un-blinded
`verdicts.json`. Answers and transcripts stay in ignored `tmp/7.2/`. The lead adds the ledger row with the
answer count.

## Caps, time and stop rule

- 42 planned answers (7 × 3 × 2, Sonnet 5.5 only); **45 attempts** in all, retries included, checked
  before every attempt; per run USD 4, per arm USD 10 (null cost at USD 4), each judge USD 15; item total
  USD 50 subscription-equivalent. Estimate: USD 5 for answers (6.3 result 2: USD 5.09), about 15 minutes
  of answers, 10 minutes of judging.
- Subscription Claude Code CLI only, as `hc` children, against one local `dev:eval` at a time. No AI
  Gateway, Workers AI or provider API. No fourth sample, no extra arm, no re-judge.
- Stop rules: the routing gate (held, above); collection ends when every run is answered or stopped under
  these caps; the outcome is computed once.

## Gates

On the final tree, each run bare: `npm run typecheck`, `npm test`, `npm run build`,
`npm run eval:routing -- --gate` (stdout to a file, GATE line read), `npm run eval:selftest`,
`npm run secrets:scan -- --tree`. On 6a also `npm run test:smoke` and
`node scripts/check-pin-review.mjs --base origin/main`.

## Required reviews after execution

- 6a only: Codex frontier (`gpt-6-astra`, high), the security and exposure review of 6.3's plan: GET,
  keyless and side-effect-free; argument validation against the input schema; a 117 KB response truncated
  or artifact-handled; the caveat stays out of scoring (re-run both manifests, counts only); every number
  in the gates note; the policy record. It also reads the three scripts' re-test mode for a blinding or
  scoring defect (6.3 planned this under its include branch, which never ran) and recomputes the outcome
  from `tmp/7.2/rt` and the two verdict files. It writes `tmp/7.2/CODEX-REVIEW.md`; the lead copies it in; the
  executor reconciles every finding. Tier: exposure and re-baseline reviews in this round used Codex
  frontier; Sonnet executes, Opus leads and grades, Fable reviewed the plan.
- 6b: none (no exposure change).

## Risks

- Three samples, one client, one grader: a large effect only. D3 lost 3 of 3 in 6.3, so a caveat that does
  nothing should lose again.
- The caveat could push the client away from the registry where it is the right source (C2's wins in 6.3
  came from registry rows). The rule counts that only if it causes a bad loss; it is reported either way.
- D1, D2 and D4 are carried from 6.3 result 1 (measured on 6.3's card), as the unchanged rule requires,
  so they cannot fail here and registry use on D1 and D4 under the new card is unmeasured. Carrying them is
  acceptable: three samples of each would add 18 answers past the cap, and a client deterred from the
  registry falls back to what `main` does today, so the worst case is no gain, not a loss against `main`.
  RESULTS and the policy record state it.
- The caveat shows only on the public `search` card. A run that reaches the registry through sandbox
  `codemode.search` never sees it; the per-run "card seen" report makes a D3 result readable.
- Live content moves between the sequential arms; the probes bracket each arm.
- If the Codex review requires a model-facing change, the measured arm no longer matches; the executor
  stops and the lead reports instead of shipping.

## Needs from the orchestrator

- Include: deploy from the Mac after merge, then close #167 with the drafted checklist comment.
- Exclude: accept or refuse the recommendation to close #167 as "decided: excluded by measurement".

## Reconciliation of the Fable review

| # | Severity | Disposition |
|---|---|---|
| 1 | blocking | Adopted with a variant: the caveat names `launchedAt` and restores "not product status": "Not a launch or news timeline: launchedAt is Soroban contract creation only. Includes fiat stablecoins; state is not product status." (132 characters). The `rwaxyzValueUsd` clause goes; its schema text carries it. Routing re-run on this wording: identical to the table. |
| 2 | should-fix | Adopted: the header amendment is narrowed to "full description or output schema already states the caveat"; every clause restates served text, so `describe` still returns what the card cuts. |
| 3 | should-fix | Adopted: Risks, RESULTS and the policy record state the carried clauses are constants from 6.3's card; C2's `rwaCalled` is the named proxy. |
| 4 | should-fix | Adopted: per INCLUDED run, whether a `search` returned the RWA card before the first registry call, from the existing records. |
| 5 | should-fix | Adopted: the dry run carries `--arm`, `--out` and `--capture-dir`. |
| 6 | should-fix | Adopted: all six judging commands written in full. |
| 7 | should-fix | Adopted: drafts and scratch stay in `tmp/7.2/` until the INCLUDED end checks pass. |
| 8 | should-fix | Adopted: the third-control stop is pre-registered, and the closing comment and policy record carry a per-condition checklist. |
| 9 | should-fix | Adopted the reviewer's recommendation: `Refs #167` everywhere, the PR-body grep, and the orchestrator closes after the deploy. |
| 10 | should-fix | Adopted: the 6a Codex review reads the scripts' re-test mode and recomputes the outcome. |
| 11 | should-fix | Adopted: exclude (6b) and inconclusive (6c) split; 6b writes the triggers into the TODO and updates check 8's sentence. |
| 12 | should-fix | Adopted: names-only sweep, the five files never opened, and the count sweep. |
| 13 | nit | Adopted: the planned card test is dropped; `test/server.test.ts:862-878` covers it. |
| 14 | nit | Adopted: `git diff --stat P C -- .agents` recorded. |
| 15 | nit | Adopted: `.wrangler/state` cleared before each arm's server, recorded. |
| 16 | nit | Adopted: same UTC day for both arms. |
| 17 | nit | Adopted: the revert's manifest hash check (6b, 6c). |
| 18 | nit | Adopted: D3's worse-pair count stated plainly in RESULTS and the policy record. |

The reviewer's own search-rule slip (a `wc -l` shell glob over `items/6.3/`, names and counts only) is
noted; no content was printed.
