# Connectors Directory item 8 efficacy round — 2026-08-26

## Objective

Determine whether Stellar Raven can satisfy the Connectors Directory description request without reducing service efficacy.

Implement and test only the smallest description change supported by evidence.

Do not change catalog descriptions, exposure, adapters, schemas, sandbox controls, or runtime evidence checkpoints.

## Authority

The user authorized an isolated Herdr worktree, implementation, independent reviews, evaluation, and necessary testing.

No deployment, Directory submission, credential creation, or upstream filing is authorized.

Paid evaluation remains bounded by this ledger and its independent pre-spend review.

## Pinned state

- Date: 2026-08-26.
- Worktree: `/Users/kalepail/Desktop/sr-wt-connectors-item8`.
- Branch: `audit/connectors-item8-20260826`.
- Base revision: `e488c4fc6a4a44b01ee58f4276baf7cd4dde2f47`.
- Source tree contained unrelated untracked research files. This worktree excludes them.
- Manifest SHA-256: `b5e8c3214c08c2d7620439951d61d343959f677e6984d03420ede71f29978ed9`.
- QA corpus SHA-256: `85a6b3d1b3c2d365908cab95bb8efb40cb27e3d5be214375cf659354348cabbb`.
- QA sample SHA-256: `28c2f1ef76c8a5f332572f5d3e9e00be23e78ba3686ce231567419438043f3c0`.
- QA runner SHA-256: `84a0840b1e9c78363d020ca1dd287ea05e45b4afb0b1621f23d53889d2ee9d4d`.
- Judge SHA-256: `11f7e9a20c18aa0aae3782c235e2c6951d8a836a6c56ff4e6a52428c1ae835d5`.
- Tool prose SHA-256: `d2674a39f24cd7afe0bd856c62129fd015d835800e10ebc43970cd4697152a9f`.

## Causal hypothesis

A narrow rewrite of only `SEARCH_DESCRIPTION` and `EXECUTE_DESCRIPTION` can satisfy Anthropic's wording requirement.

For Claude Code, the rewrite preserves valid calls, coverage, recovery, attribution, prior-art routing, and answer quality.

This experiment does not measure a Directory client that omits initialize-time server instructions.

## Fixed boundaries

- The manifest remains the exposed surface.
- Catalog descriptions and lexical scoring remain byte-identical.
- Exact operation and skill IDs remain unchanged.
- Data, soft-empty, and error responses remain distinct.
- Server instructions remain unchanged in the first experiment.
- Search `nextSteps` and execute runtime checkpoints remain unchanged.
- Secrets and service traffic remain host-side.
- No paid or side-effecting Lumenloop operation is exposed or called.

## Experimental arms

- Arm A: current descriptions and current server instructions.
- Arm B1: short descriptions and current server instructions.
- Arm B2: compact base instructions only after B1 passes and only if policy scope requires it.

Arm B1 changes one variable: the two top-level tool descriptions.

## Initial instruments

- Free baseline and generated-artifact cleanliness.
- Focused description and MCP contract tests.
- Routing gate as a required non-regression check.
- Paired QA collection and judging on affected targets and symmetric controls.
- Offline plan regrade for every stored QA result.
- Independent product, technical, and adversarial review.

## Spend controls

- No paid call runs before an independent adversarial brief review.
- The brief will use observed stored costs for the same answering and judge tuple.
- Each authorization covers one method run only.
- Collection and judging run as separate checkpoints.
- The runner's unsupported `--max-budget-usd` flag will not be used.
- The final case count, call count, hard cap, reserves, and stop rules remain pending review.

## Acceptance rules

- No reviewed control loses a required fact.
- No invalid JavaScript regression occurs.
- No wrong method-name regression occurs.
- No envelope misuse regression occurs.
- No required operation-coverage regression occurs.
- Both design targets retain prior-art adoption.
- Narrow controls do not add a prior-art detour.
- Open-world targets retain bounded recovery.
- Closed-world controls retain correct stopping.
- Attribution retains exact identity, source, and date where required.
- Every comparison uses identical case IDs, order, model roles, runner, corpus, rubric, and pack.

Reject the candidate after any blocking control, security, exposure, or comparability failure.

## Lanes

| Lane | Agent | Model and effort | Write set | Status |
| --- | --- | --- | --- | --- |
| Coordination and ledger | root | Codex, current | ledger and reconciliation | active |
| Description candidate | `connector-impl`, pane `wE:p2` | Terra high | `src/mcp/tools.ts`, focused tests | complete |
| Evaluation design | `connector-eval`, pane `wE:p3` | Sol high | read-only report | complete |
| Product and policy review | `connector-policy`, pane `wE:p4` | Fable high | read-only report | complete |
| Adversarial pre-spend review | `connector-adversary`, pane `wE:p5` | Grok high | read-only `/tmp` report | delta review pending |

## Results

### Clean free baseline

- `npm ci`: 310 packages installed; npm reported four existing high-severity audit findings.
- `npm run typegen`: passed with placeholder local binding values.
- `npm run typecheck`: passed.
- `npm test`: 84 files and 1,233 tests passed.
- `npm run build`: passed; dry-run upload 6,938.90 KiB and gzip 1,392.54 KiB.
- `npm run test:smoke`: 4 files and 77 tests passed.
- `npm run eval:selftest`: passed.
- `npm run eval:compile`: regenerated byte-identical routing cases.
- `npm run eval:qa:compile`: regenerated byte-identical QA cases and sample.
- `npm run eval:qa:lint -- --stale`: passed with 103 existing warnings and zero errors.
- `npm run eval:routing -- --gate`: passed all committed gates.
- Legacy strict: 61.8% top-1, 82.5% top-3, and 92.3% top-5 over 338 cases.
- Extended strict: 73.0% top-1, 89.3% top-3, and 95.9% top-5 over 122 cases.
- Skills strict: 69.6% top-1 and 100.0% top-3/top-5 over 23 cases.
- Worktree remained clean except for this round ledger.

### Product and policy review

- Reviewer: `connector-policy`, Fable high, independent from the implementation author.
- Sources: the SDF Google Doc, the Anthropic Software Directory Policy, review criteria, and submission guide.
- Anthropic publishes no character limit for a tool description or server instructions.
- The published rules require narrow, accurate descriptions that state function and invocation conditions.
- The review criteria reject unrelated behavior instructions inside tool descriptions.
- Policy 5.B names tool-call response tokens, not startup description tokens.
- Description-only Arm B1 probably meets the published description rules.
- Item 8 also counts `BASE_SERVER_INSTRUCTIONS` and asks to move its evidence rules.
- Therefore, Arm B1 might not close item 8 without written scope confirmation from SDF security.
- The search `nextSteps` text is about 2,500 characters per non-empty response.
- That response text is a more direct Policy 5.B risk than startup descriptions.
- The pinned skill bodies create a separate Policy 2.F interpretation risk.
- The Directory client injection path remains unknown.
- `/docs` does not yet contain the rules that item 8 asks the team to move.

### First Arm B1 implementation attempt

- `SEARCH_DESCRIPTION` fell from 4,934 to 598 characters.
- `EXECUTE_DESCRIPTION` fell from 9,337 to 1,250 characters.
- The pair fell from 14,271 to 1,848 characters, an 87.0% reduction.
- The focused description test passed.
- The full suite found three failed contract tests in `test/server.test.ts`.
- The candidate omitted exact helper-call syntax and the single-result wording.
- This failure shows that an arbitrary small limit can remove required mechanical contract text.
- The implementation author repaired the text without weakening those contract tests.
- The first repaired search description was 565 characters.
- The first repaired execute description was 1,247 characters.
- The two focused files passed 84 tests.

### Adversarial repair

- Grok high returned `DO-NOT-LAUNCH` before spend.
- The review found six launch blockers and four missing mechanical facts.
- The candidate now restores search truncation, recovery, and `widerCandidates` facts.
- The candidate now restores `soft-empty`, named-function, and source-basis facts.
- Each description now uses the measured 2,048-character Claude Code cap.
- The arbitrary 600-character and 1,250-character guards are removed.
- The final search description is 726 characters.
- The final execute description is 1,370 characters.
- The final pair is 2,096 characters, an 85.3% reduction.
- Candidate source commit: `1f961ab1116bb23f97c32b14502401ccb2441be7`.
- Arm A remains `e488c4fc6a4a44b01ee58f4276baf7cd4dde2f47`.
- The commit diff changes one production file: `src/mcp/tools.ts`.
- The other changed file is `test/mcp-instructions.test.ts`.

### Arm B1 free validation

- `npm run typecheck`: passed.
- `npm test`: 84 files and 1,234 tests passed.
- `npm run build`: passed; dry-run upload 6,926.44 KiB and gzip 1,387.18 KiB.
- `npm run test:smoke`: 4 files and 77 tests passed.
- `npm run eval:selftest`: passed.
- `npm run eval:routing -- --gate`: passed with baseline-identical routing metrics.

### Preregistered paid evaluation

- Reviewer: `connector-eval`, Sol high, independent from the implementation author.
- Use runner variant A. Variant B tests a retired search shape.
- Use `claude-sonnet-5` for answering and judging.
- Keep `QA_AGENT_PROMPT_APPEND` unset.
- Use rubric `v2.8` and evidence pack `p5`.
- Run the referee from a clean Arm A worktree.
- Serve Arm A from base revision `e488c4fc6a4a44b01ee58f4276baf7cd4dde2f47`.
- Serve Arm B1 from a clean immutable commit that changes only the description surface and tests.
- Keep server instructions, schemas, annotations, manifest, adapters, and checkpoints identical.
- This A/B measures Claude Code with full `BASE` injection, current `nextSteps`, current checkpoints, and the stock QA prompt.
- It does not measure a descriptions-only Directory client.
- A pass does not close item 8.
- A pass does not authorize Directory shipment when a client omits server instructions.
- Playground behavior is outside this paid instrument.

Fixed cases, in corpus order:

1. `q-comp-cross-moneygram-partnership-sep24` — cross-family attribution control.
2. `q-edge-closed-world-builder-directory-miss` — closed-world stopping control.
3. `q-edge-open-world-recovery-after-narrow-miss` — bounded recovery control.
4. `q-edge-partner-detail-soft-empty` — envelope distinction control.
5. `q-infra-simulate-transaction-howto` — exact-method and official-evidence control.
6. `q-sor-build-target-wasm32v1` — narrow debugging control.
7. `q-soroban-greenfield-escrow-prior-art-preflight` — contract-design target.
8. `q-tool-greenfield-indexer-prior-art-preflight` — indexer-design target.

Selected-case pins:

- Case count: 8.
- `casesSha256`: `8e0a57c44b98fa45655bf301e58d920be175e79e281a2fc11c9509bdad589b27`.
- `caseIdsSha256`: `21d72e64f0a3343111b573972fe79e479bd08737dba64fbe737b8d490221ab40`.

Order and repetition:

1. Collect A1.
2. Collect B1-1.
3. Inspect every A1 and B1-1 transcript against the mechanism gates.
4. Stop before more spend after any blocking first-pair regression.
5. Collect B1-2 only after the first-pair check passes.
6. Collect A2.
7. Judge B1-1, A1, A2, then B1-2 without arm labels.
8. Run the plan grader and composition analyzer on every result.

Mechanism gates:

- All four B1 design-target observations use bounded prior-art discovery.
- Each target uses Stellar Docs or the relevant skill for official authority.
- Both B1 repeats retain the requested implementation plan.
- The narrow debugging control uses no Scout prior-art detour.
- Both open-world B1 observations use one bounded broad pass.
- Both closed-world B1 observations stop at the source scope.
- Both envelope B1 observations distinguish soft-empty from failure.
- Both cross-service B1 observations use all three required families.
- B1 introduces no invalid JavaScript, unknown operation, or envelope misuse.
- B1 introduces no attribution regression, lost required fact, or wrong claim.
- No B1 row loses plan coverage against its paired A row.
- B1 has no judge error and no new wrong verdict.
- Correct, partial, and wrong totals are diagnostic only.
- A raw grade cannot override a verified fact-level regression.
- Repeat disagreement makes the result inconclusive.

Cost and call limits:

- Historical median estimate: `$5.1482` per eight-case run.
- Projected total: `$20.5928` for four complete runs.
- Historical range projection: `$10.4289` to `$36.5719`.
- There is no tuple-identical `v2.8` and `p5` cost precedent.
- The selected-case historical answering maximum is `$1.445818`.
- The selected-case historical judge maximum is `$0.396878`.
- Answering limit: 32 calls at `$1.75` per call.
- Judge limit: 32 calls at `$0.50` per call.
- Total limit: 64 calls and `$72.00`.
- An out-of-tree Claude wrapper must enforce each per-call limit.
- The runner has no working aggregate budget flag.
- Wrapper path: `/tmp/connectors-item8-eval-bin/claude`.
- Wrapper SHA-256: `6ff1e1663ba1f672723d75385be9d1f375d2d15757957f23847529e0c50b4ce5`.
- Real Claude path: `/Users/kalepail/.local/bin/claude`.
- Claude version: `2.1.246`.
- Claude SHA-256: `7b09f01cb76a38e0e3a7c47c5d698d382162a5ff26538fc778683770caf9218b`.

Collection stop rules:

- Stop if the adversarial review does not give a reconciled `LAUNCH-OK`.
- Stop if either worktree is dirty or Arm B1 lacks an immutable commit.
- Stop if the runtime diff includes another production file.
- Stop if any fixed surface or pin differs.
- Stop if another Wrangler process exists.
- Stop if a free live surface fingerprint does not match its declared arm.
- Stop after any artifact with a case-count, hash, source-identity, failure, or cost error.
- Stop if the wrapper reaches a per-call limit.
- Stop after any first-pair blocking mechanism regression.
- Stop after a judge error, missing judge cost, tuple change, or comparability failure.
- Do not retry, rejudge, or repair within this authorization.

### Live surface pins

- Arm A tool count: 2.
- Arm A description characters: 14,271.
- Arm A input-schema characters: 1,646.
- Arm A serialized-tool characters: 22,017.
- Arm A instruction characters: 7,873.
- Arm A advertised wire characters: 29,890.
- Arm A surface SHA-256: `db27c5eca38cd9979947a498568110c971a4acad89c4be1d9da0a7d3859f9a0e`.
- Arm B1 tool count: 2.
- Arm B1 description characters: 2,096.
- Arm B1 input-schema characters: 1,646.
- Arm B1 serialized-tool characters: 9,754.
- Arm B1 instruction characters: 7,873.
- Arm B1 advertised wire characters: 17,627.
- Arm B1 surface SHA-256: `86d008a22d567f7a31bc628c34a6a071c5b2467f8513f2eeb2bc21182d07b34c`.
- Each arm returned HTTP 200 for a real MCP initialize.
- One Wrangler process ran at a time on port 8788.

### Adversarial delta verdict

- Reviewer: `connector-adversary`, Grok high.
- Verdict: `LAUNCH-OK` for the scoped Claude Code QA path.
- The immutable runtime and baseline worktrees are clean.
- The wrapper pins and per-call limits match this ledger.
- The first-pair transcript checkpoint occurs before the second pair.
- The live surface fingerprints are pinned for both arms.
- The measured client and non-Directory limitation are explicit.
- Aggregate grades remain diagnostic only.
- All item-8 mechanical facts are restored in the candidate.
- The remaining limits are not launch blockers.
- A pass still does not close item 8 or authorize Directory shipment.

### Paid first pair

- A1 result: `eval/qa/results/2026-08-26T17-39-11-variantA.json` in the baseline worktree.
- A1 SHA-256: `02ac68ae8607f9bdbecc0a558b902d16eb9b1710449a13abf94cef7240606de9`.
- A1 collected 8 answers with zero agent failures and zero missing costs.
- A1 answering cost: `$2.3136272`.
- B1-1 result: `eval/qa/results/2026-08-26T17-44-25-variantA.json` in the baseline worktree.
- B1-1 SHA-256: `3d40f8768a019175d6c0eabf20dba10f4e5e46250c46785adf7b2f59b42a1c9e`.
- B1-1 collected 8 answers with zero agent failures and zero missing costs.
- B1-1 answering cost: `$1.3409158`.
- Total paid answering cost: `$3.6545430` across 16 calls.
- No judge call ran.
- Both artifacts match the case hashes, source guard, model, prompt, and live surface pins.
- No retry or rejudge occurred.

First-pair mechanism review:

- A1 covered 7 of 8 required plans.
- B1-1 covered 6 of 8 required plans.
- The greenfield indexer target regressed from required-plan coverage to a miss.
- A1 called `scout.searchProjects` twice for indexer prior art.
- B1-1 called no Scout operation for that target.
- This violates the target prior-art and no-plan-loss gates.
- The MoneyGram control lost the Stellar Docs family.
- A1 used Lumenloop, Scout, and Stellar Docs for that control.
- B1-1 used Lumenloop and Scout only.
- This violates the cross-service coverage gate.
- The open-world control used no tools in either arm.
- B1-1 therefore also fails the absolute open-world recovery gate.
- The closed-world control stopped at `scout.getBuilders` in both arms.
- The soft-empty control used `scout.getPartner` and explained `soft-empty` in both arms.
- The narrow debugging control used no Scout prior-art detour in either arm.
- The escrow design target used Scout prior art in both arms.
- Each arm recorded one execution failure on the escrow target, so B1 added no new execution failure.

The required first-pair stop fired. B1-2, A2, and all judging were cancelled before spend.

## Outcome

Pending.
