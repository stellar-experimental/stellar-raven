# Routing and direction audit — 2026-09-17

Status: in progress. D3 and measurement repairs passed independent review. Paid collection is paused for verified golden corrections.

## Authority and scope

The user requested general routing repairs, an overfitting audit, and sufficient tests and evaluations.
The user approved a **$250 total paid evaluation cap** on 2026-09-17 UTC.
Previous commit, push, and deployment authority remains active.
Each paid method needs a pinned, independently reviewed brief before collection.
Historical paid plans remain closed. This round does not resume them.

Keep RWA excluded until a general repair passes its exposure and routing checks.
Do not tune against the frozen routing holdout. Do not change historical acceptance records.
Preserve unrelated worktrees and dirty experiments.

## Baseline

- Revision: `848edec4c9a156ef16f71dc0605409aa59c0be5c`.
- Implementation worktree: `/tmp/raven-routing-audit-2026-09-17/repo`.
- Branch: `fix/routing-generalization`.
- Production version: `6ec344ba-e39f-4108-9a5a-f5bbf1668315`.
- Baseline artifact directory: `/tmp/raven-routing-audit-2026-09-17`.
- Type generation, typecheck, build, evaluation self-test, routing compile, and QA compile passed.
- Unit tests: 2,152 passed; three skipped. Smoke tests: 94 passed.
- Routing acceptance gate passed. The protocol-history diagnostic still reports FAIL.
- Generated artifacts left the tree clean before this ledger was added.

## Parallel audit assignments

| Agent | Model and effort | Owned pane | Scope |
| --- | --- | --- | --- |
| route-audit-code | Claude Opus, high | `w3G:p13` | Scoring, catalog generation, admission, aliases, and overfitting |
| route-audit-direction | Claude Fable, high | `w3G:p14` | Tool guidance, recovery, execution, and evidence direction |
| route-audit-evals | Claude Opus, high | `w3G:p15` | Coverage, fresh controls, evaluation design, and cost estimates |

The code agent implemented D3. The evaluation agent repaired discovery labels and preflight.
The direction agent reviewed both changes. Agents cannot launch paid evaluations or modify the holdout.
The coordinator owns implementation, spending, Git, deployment, and external findings.

## Pending work

- Reconcile audit findings and fresh controls.
- Pin the manifest, corpus, runner, environment, and live surface.
- Inventory every exposed operation and whole skill.
- Review the experiment brief before paid collection.
- Test general repairs against unrelated targets and symmetric controls.
- Review every consequential verdict change and account for all spend.
- Complete independent code review, required checks, and production verification before release.

## Paid evaluation accounting

Approved cap: **$250**. Evaluation spend: **$5.8820244**. Revised methods: $182 maximum; $68 remains unallocated.
Audit agent sessions are orchestration work, separate from the evaluation runner receipts.

## Candidate and review

D3 removes a directory admission exception based on catalog field placement.
Commit `181d5b0f` contains the deletion and synthetic controls across two unrelated domains.
Commit `26f64237` activates the existing RWA controls whenever the selected catalog exposes RWA.
RWA remains excluded. The three known RWA capture failures remain unresolved.

The independent Fable high review found one real directory result loss for the Soroswap question.
Other directory routes remain available. The paid comparison must test answer impact.
The reviewer rejected a test that required this lost result; the coordinator removed that test.
Legacy strict, extended, skills, frozen holdout, and fresh challenge aggregates remain unchanged.
Accept-either legacy top-five falls from 337 to 336. This loss is disclosed, not rebaselined.

The runtime benchmark shows no per-query median regression above 10%.
The medians are 3.443 ms baseline and 3.420 ms candidate. This does not establish a speed gain.

The read-only production inventory covered 58 of 60 operations and all 20 whole skills.
Two generation operations were excluded from the read-only inventory.
All successful operation probes met their top-level required-field projection.
This check does not establish full semantic or nested schema correctness.
See `research/audits/2026-09-17-routing-audit/surface-ledger.json` for each operation, its profile, coverage, and probe evidence.

Discovery contained 29 section references that search cannot return.
The repair maps supported tasks to whole skills and removes unsupported routes.
Both experimental arms use identical repaired labels and one shared loader.
The final free baseline reports family@3 35/43 and usable-operation@5 29/43.
Receipt: `2026-09-17T00-57-49-303Z.json`.

## Paid plan reconciliation

Fable high approved v3 with four conditions.
Every command will pin port 8793, source revisions, surface, binary, environment, and budget.
M1 rises to $20 per run: $178 total allocation and $72 reserve.
Historical QA costs are a p5/v2.8-v2.9 proxy, not observed p6/v2.10 costs.
The candidate commit and exact command arrays will be frozen before collection.
Any incomplete M1 run voids its pair. Any verified required-fact loss blocks D3.
The paired printer remains INDETERMINATE because fewer than 100 IDs participate.
C1 and C2 share one server session; B1 and B2 use separate sessions.
Fresh questions and results remain sealed from the implementation agent.

The protocol-history diagnostic remains FAIL on the baseline and candidate.
Its existing source-contract expiry requires separate reconciliation; this round does not repin it.

## Evidence and pilot collection

The dated evidence lives in [research/audits/2026-09-17-routing-audit](../../../research/audits/2026-09-17-routing-audit/).
The final code review passed runtime and measurement changes. Its evidence placement and review-status findings are resolved.

M1-B1 produced `2026-09-17T01-33-03-variantA.json`: 16 answers, 48 accounted calls, cost $5.8820244.
The runner reported complete, comparable collection with no execution failure or missing cost.
Its grades are preliminary: three correct, seven partial, six wrong under the original goldens.
Independent source verification found stale LOBSTR SCF framing, Aquarius context, and a Soroswap provenance caution.
Later paid methods are paused until these corrections and symmetric regrading receive review.
The questions and denominator remain frozen. The original answer artifact will not be rewritten.

The published dependency finding is [Cloudflare #2296](https://github.com/cloudflare/agents/issues/2296).
[Raven #167](https://github.com/stellar-experimental/stellar-raven/issues/167#issuecomment-5706841109) records the unchanged RWA block.
Reverse-prefix deletion and Porter stemming failed coverage checks; neither will ship.
The test table now includes all three original RWA controls. Runtime routing remains unchanged from D3.

The recorded pilot contains 36 public search calls. D3 changes none of their ranked results.
This checks observed queries only; it does not establish identical future answers or internal execute searches.
The RWA-inclusive control run fails all three original questions; the default excluded surface passes.

## Golden correction review and resumption

Opus verification and Fable high independent review accepted three source-based corrections.
Affected IDs: `q-eco-lobstr-wallet`, `q-defi-aquarius-what-is`, and `q-defi-soroswap-what-is`.
Questions and required facts remain unchanged. No case leaves the frozen 16-case denominator.
LOBSTR now requires an awarded-versus-paid basis when funding is mentioned; no amount becomes a required fact.
Aquarius distinguishes governance voting from liquidity incentives and removes stale TVL context.
Soroswap drops a caution that confused operation prose with project text.
The verified adapter configuration remains authoritative; no new ADR-0008 canonical-page grading exception is added.

The independent resumption review requires matching three-judge regrades for the three corrected B1 and C1 rows.
These overlays take precedence. M5 must not regrade those B1/C1 rows again.
The revised method ceiling is $182, leaving $68 unallocated under the $250 cap.
M0-C1 and M5 require exact artifact paths and separate command review before launch.
The coordinator accepts the conservative stop: one verified fact loss blocks D3, even if answer variance contributes.
A fresh three-capture upstream identity check matched the original pin before resumption.
The answer instrument remains diagnostic; B1/C1 has changed case-input identity and fewer than 100 cases.

The final Fable high completion gate passes golden and pipeline changes.
All eleven consistency groups pass. The corpus lint reports zero errors and 62 existing warnings.
The final unit run passes 2,179 tests with four skips. Type checking, build, and secret scanning pass.
An earlier unit run caught a stale generated improvements index after recurrence evidence changed; regeneration resolved it.
