# Routing and direction audit — 2026-09-17

Status: in progress. D3 and measurement repairs passed independent review. Paid spend remains $0.

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

Approved cap: **$250**. Evaluation spend: **$0**. Planned methods: $178 maximum; $72 remains unallocated.
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
See `surface-ledger.json` for each operation, its profile, coverage, and probe evidence.

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
