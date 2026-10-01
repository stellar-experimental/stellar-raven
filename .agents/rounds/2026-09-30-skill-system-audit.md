# Skill system audit — 2026-09-30

## Scope

Audit the ecosystem-skill pin set, its documentation, and the repo runbooks for correctness,
clarity, and currency. Land the clear, low-risk fixes in one PR.

In scope: stale counts and versions in docs, the runbook list in `AGENTS.md`, a documented
procedure for admitting a new skill source, one upstream skill finding (`sk-027`), and the
2026-10-01 source-metadata case from the September 14 golden review.

Out of scope, recorded instead:

- The two sibling golden freshness items (`q-defi-x402-on-stellar-what`,
  `q-gap-builders-person-empty`). They change judge-facing text and need independent
  re-derivation. Queued in `.agents/TODO.md`.
- A pin decision for the twelve Stellar Light `scf-*` skills. Owner decision K in [`.agents/NEXT.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md).
- Upstream filing of `sk-027`. The finding is `verified`; filing is an outward-facing write that
  waits for the owner.
- 28 `research/skill-exposure-inventory.json` evidence refs to the removed
  `ecosystem-skills/skills/` tree. They are dated evidence and stay unchanged.

## Lanes

| lane | agent (model, effort) | pane | write set | status |
| --- | --- | --- | --- | --- |
| audit + fixes | Claude Opus 5.5 | `w46:p1` | files in this PR | done |

No independent review was requested for this round.

## Ledger

- Base `origin/main` `605c1558`. Working tree clean before the branch.
- `node scripts/check-skills-drift.mjs` → all five sources `ok` against upstream HEAD;
  `stellarlight-catalog 43 entries (snapshot 2026-09-29T19:23:49Z) 43 entries ok`; exit 0.
- `node scripts/check-mirrors.mjs` → `mirror checks ok`.
- Raven production `search` over skills plus about 200 varied `codemode.search` queries returned
  the same 20 skill IDs, matching `catalog/manifest.json` (`operation: 60, skill: 20,
  skill-section: 202`).
- `GET https://stellarlight.xyz/api/skills` (2026-09-30T19:41:24Z) → 43 entries, `sdf` 8,
  `generatedAt` 2026-09-30T19:24:07.210Z. `GET /api/skills/soroban` → HTTP 404
  `unknown skill: soroban`. Raven `scout.getSkill({ name: "soroban" })` → `soft-empty` 404.
- Pinned `Stellar-Light/stellar-scout@3b587aa9` text names `soroban` and "7 official SDF skills"
  in `SKILL.md`, `references/api-reference.md`, `README.md`, and `references/examples.md`.
  Upstream issue search found no duplicate. Filed locally as
  `improvements/skills/sk-027-scout-skill-stale-skills-catalog.md` (`verified`).
- Stale docs found by grep: `ecosystem-skills/README.md` (42 entries; 7 SDF skills including
  `soroban`), `ecosystem-skills/update.sh` (7 SDF skills), `eval/plan/coverage-rules.json`
  (42 entries), `research/skill-exposure-inventory.md` (18 exposed vs 20 in the JSON),
  [`.agents/NEXT.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) (Scout `1.9.52` vs `1.9.54` deployed in PR #182), `.agents/TODO.md`
  (latest ledger pointer). `AGENTS.md` omitted the `retrieval-system-audit` runbook.
- `q-ti-stellar-lab-usage-and-new-ui` re-probe at 2026-09-30T19:42:17Z:
  `docs/tools/cli/cookbook/contract-assets` HTTP 404;
  `docs/tools/cli/cookbook/deploy-stellar-asset-contract` HTTP 200 with both
  `stellar contract asset deploy` and `stellar contract id asset`; Lab, transactions, saved
  keypairs, and Quickstart pages HTTP 200 with the quoted text; `stellar/laboratory` main has
  no commit to the two storage helpers after `624d40ff29ca` (2025-09-04); the live saved-keypairs
  bundle is still `page-dbc03db5d85268bb.js`; local `stellar 28.1.0` help matches.
- `npm run eval:qa:register` → reopened `cluster-023` and `cluster-137` (member hash changed).
  [`npm run eval:qa:register -- --review .agents/rounds/2026-09-30-skill-system-audit/register-review.json`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-30-skill-system-audit/register-review.json)
  → `updated; 0 reopened`.
- `npm run eval:qa:compile` → `eval/qa/cases.json (501 cases; sha256 06d348f6…)`; only content
  hashes moved in `sample.json` and `lifecycle-registry.json`.

## Outcome

Gates on the branch:

- `npm run eval:qa:lint -- --since origin/main --stale` → `0 error(s), 62 warning(s)`; `main`
  has the same 62 warnings, none for the edited case.
- `node scripts/check-pin-review.mjs --base origin/main` → `no skill pin or file selection moved.`
- `npm run improvements:lint` → `improvements lint ok (64 findings)`.
- `npm run typecheck` → exit 0.
- `npm test` → `120 passed` files, `2185 passed | 4 skipped` tests.
- `npm run build` → dry-run bundle built, exit 0.
- `npm run secrets:scan -- --tree` → clean.

Remaining risk: none for runtime. The PR changes no Worker source, catalog, or spec.

## Independent review round

Opened 2026-09-30 after the merge and deploy of PR #183. `sk-027` was filed as
https://github.com/Stellar-Light/stellar-scout/issues/14 before the round. Brief:
[`.agents/rounds/2026-09-30-skill-system-audit/review-brief.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-30-skill-system-audit/review-brief.md).

| lane | agent (model, effort) | pane | write set | status |
| --- | --- | --- | --- | --- |
| product, docs, and upstream text | `rev-fable` (Claude Fable 5.1, high) | `w46:p2` | [`review-rev-fable.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-30-skill-system-audit/review-rev-fable.md) | running |
| pipeline and gate compliance | `rev-astra` (GPT-6-Astra, high) | `w46:p5` | [`review-rev-astra.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-30-skill-system-audit/review-rev-astra.md) | running |
| code-versus-docs and missed work | `rev-sol` (GPT-6.1-Sol, high) | `w46:p3` | [`review-rev-sol.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-30-skill-system-audit/review-rev-sol.md) | running |
| live re-derivation and assumption attack | `rev-grok` (Grok 4.7, high) | `w46:p4` | `review-rev-grok.md` | running |

All four reviewers differ from the author and orchestrator (Claude Opus 5.5, pane `w46:p1`), which
created and owns panes `w46:p2`–`w46:p5`.

### PR #183 release receipt

- Merged by squash as `f65e165db4d579042d756a9c07a6a22b17e11347` after CI passed (`Analyze`, `CodeQL`,
  `secrets`, `test`).
- `npm run deploy` from `main` → Worker Version ID `c4d27b61-e0f0-47a4-a6fe-6ce298fb1b81`, deployment
  `6ebfc176-1365-45e0-892e-37142c7f3b5c`, created `2026-09-30T19:49:09.958Z`, 100% of traffic
  (`wrangler deployments status`; confirmed read-only by `rev-fable`, `rev-sol`, and `rev-grok`).
- The `postdeploy` hook returned HTTP 401 with the default credential, as on 2026-09-29.
  `WRANGLER_PROFILE=sdf node scripts/check-usage-deployment.mjs` → `Usage tail consumer and daily
  retention schedule are present.`
- Six public routes returned HTTP 200; unauthenticated `POST /mcp` returned HTTP 401.
- Authenticated production check through the Raven connector after the deploy: 55 varied
  `codemode.search` queries returned exactly the 20 manifest skill IDs; `scout.listSkills({ source:
  "sdf" })` returned the eight SDF slugs; `codemode.skill.read` of `skills.stellar-dev.cross-chain`
  returned content. The Codex reviewers could not repeat this (their MCP approval policy is `never`).
- `sk-027` filed 2026-09-30T19:53:24Z as https://github.com/Stellar-Light/stellar-scout/issues/14
  (commit `2f79caab` records `reported-upstream`).

### Reconciliation

All four verdicts: `accept with fixes`. Reviews: [`review-rev-fable.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-30-skill-system-audit/review-rev-fable.md), [`review-rev-astra.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-30-skill-system-audit/review-rev-astra.md),
[`review-rev-sol.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-30-skill-system-audit/review-rev-sol.md), `review-rev-grok.md` in this round's directory. The Codex sandbox blocks writes
under `.agents/`, so `rev-astra` and `rev-sol` wrote to the ignored `tmp/` and the orchestrator copied
the files unchanged.

| finding | reviewers | disposition |
| --- | --- | --- |
| Admission bar says credential or write steps are scrubbed; the worked example serves them | fable F1, sol 1 | fixed: bar now treats them as reference content, names what `src/skills/scrub.ts` removes, and routes remaining prompts to `PIN-REVIEW.md` |
| Step 6 allows a routing case instead of per-skill QA coverage; proposal-first activation missing | fable F3, astra 1, sol 3, grok 3 | fixed: step 6 requires `skill floor 1` coverage per skill, proposal-first, independent activation |
| Step 5 links regeneration only; count contracts, fingerprint, routing comparison missing | fable F2, astra 2, sol 3, grok 3 | fixed: step 5 names the acceptance gates, count contracts, `eval/gates.json` fingerprint, and separate routing decisions |
| `unpinnedUpstream` omitted; drift check infers cherry-pick mode from a non-empty map | fable F4, sol 2, grok 3 | docs fixed (step 3 and the design-choices text); code change queued in `TODO.md` |
| Reviewer independence from the orchestrator missing; decision location omits [`NEXT.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) | sol 3, fable F8, grok 3 | fixed |
| `sk-027` misses `SKILL.md:90`, `README.md:76-78` (`soroban`, `anchors`), `api-reference.md:196`; recommendation writes a new fixed roster | fable F5, astra 4, sol 6, grok 1 | fixed in the finding; one correction comment posted (allowed: it changes the proposed action): https://github.com/Stellar-Light/stellar-scout/issues/14#issuecomment-5919085549 |
| Golden refresh stamped `asOf` over claims the first pass did not re-derive; no independent matrix or plan comparison | astra 3, grok 2 | fixed: signer-category and Quickstart `/lab` rows added with 2026-09-30 evidence; four reviewers re-derived the claims; plan comparison below |
| Quickstart has no `/lab` | grok 2 | rejected: `rev-grok` read the stale `master` branch (tip `258a5b6e0e99`, 2025-03-26). Default branch `main` (tip `8f5dcf166978`, 2026-09-29) README lists `http://localhost:8000/lab`; `common/nginx/etc/conf.d/lab.conf` proxies `/lab`; `common/lab/bin/start` sets `NEXT_PUBLIC_DEFAULT_NETWORK=custom` |
| PR #183 body said each golden claim had re-verified evidence | astra 3 | corrected here: the first pass re-verified the storage, CLI, Lab, and Quickstart-production claims; the signer and `/lab` claims gained evidence in this follow-up |
| `update.sh:36` "≈30 entries"; `update.sh:25` retired tracker id | fable F6, F12, sol 7 | fixed |
| Stale descriptions: `inventory/README.md:7`, observability "204", run-evals collections | sol 7 | fixed |
| Selector accepts truncated trees and missing picks; mirror check accepts an empty source | sol 4 | fixed with tests; each real source still selects exactly its manifest file count |
| Swap is two moves and the index builds after them | sol 4 | README claim narrowed; staged index queued in `TODO.md` |
| Pin-review digest omits `owner`, `repo`, `path` | sol 5 | queued in `TODO.md` (re-keys every `sel:` digest; served bytes stay hash-verified) |
| Inactive private-archive branches in `build-index.mjs` | sol add. 4 | queued in `TODO.md` |
| Decision K omits overlap, upstream push date, layout, and `fetch-external-doc` path; body read not queued | fable F7, grok 4, astra add. 1 | fixed in [`NEXT.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) K; body read queued in `TODO.md` |
| [`NEXT.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) header stamp; `EVALS.md` link; `coverage-rules.json` kind list | fable F10, add. 5, add. 6 | fixed |
| Deploy id and live check missing from the ledger | fable F9, astra add. 3 | fixed (release receipt above) |
| Scout skill states the Builders directory as dozens / ~110; live has 226 | grok add. 1 | filed locally as successor `sk-028` (`verified`); upstream filing waits for the owner |
| Filer repeats frontmatter evidence in the issue body | fable F11, astra add. 4 | no change: filer template behavior, not this finding |
| `THIRD-PARTY-NOTICES.md` scrub counts unpinned by a test | fable add. 7 | no change: `rev-sol` verified 7 LumenLoop + 1 Stellar Light files match |
| Research chunk counts disagree inside the Scout skill | grok add. 2 | no change: unverified; not filed |

New item found during reconciliation: the `https://skills.stellar.org/` index has a Community section
with skills absent from the Stellar Light snapshot. Queued in `TODO.md`.

### Golden verification record

- Claim matrix for `q-ti-stellar-lab-usage-and-new-ui`: capability (Lab, transactions, upload-deploy
  Docs), storage (keypairs Docs, `stellar/laboratory` helpers, live bundle), SAC CLI (cookbook, CLI
  28.1.0 help), Quickstart (`stellar/quickstart` main README and `lab.conf`, Quickstart Docs). Each row
  carries 2026-09-30 evidence in `truth.corroboration`. Independent re-derivations: `rev-fable`
  (19:58Z), `rev-astra`, `rev-sol`, and `rev-grok` (20:03Z–20:07Z), each without the author's notes.
- `npm run eval:qa:register` reopened clusters 023 and 137 again after the evidence edit;
  [`npm run eval:qa:register -- --review .agents/rounds/2026-09-30-skill-system-audit/register-review-2.json`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-30-skill-system-audit/register-review-2.json)
  → `updated; 0 reopened`; `npm run eval:qa:register -- --check` → `up to date`.
- `npm run eval:plan -- eval/qa/results/2026-08-30T03-43-11-variantA.json` (the latest saved result;
  it has no row for the edited case) → identical output with the `605c1558` coverage rules and with
  this branch (`required covered 40 correct 40 partial 13 wrong / 93`). No re-judge applies.

### Verification pass

Each reviewer checked `f65e165d..a6db8c1a` against its own findings. Files: [`verify-rev-fable.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-30-skill-system-audit/verify-rev-fable.md),
[`verify-rev-astra.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-30-skill-system-audit/verify-rev-astra.md), [`verify-rev-sol.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-30-skill-system-audit/verify-rev-sol.md), [`verify-rev-grok.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-30-skill-system-audit/verify-rev-grok.md) (written to the ignored `tmp/` and
copied unchanged). Verdicts: `rev-fable` accept, `rev-grok` accept, `rev-astra` reject, `rev-sol`
reject. Both rejections accepted the functional fixes and named these remaining problems; each is
fixed in the next commit.

| problem | reviewer | fix |
| --- | --- | --- |
| The golden record above says the reviewers worked "without the author's notes". They read the notes first, so their checks were independent live source checks, not blind re-derivation. The first review round also did not check the upload-deploy page or the Quickstart implementation. | astra | Correction to the "Golden verification record": replace "each without the author's notes" with "after reading the author's notes (independent source checks, not blind)". The case's `truth.verified` now says who checked which source in which pass. Clusters re-closed with [`register-review-3.json`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-30-skill-system-audit/register-review-3.json). |
| Directory mode without picks accepts a child directory with no `SKILL.md`; the reconciliation marked the selector finding fixed | sol | The selector now rejects every selected directory without `SKILL.md`, picked or not, with a test. All five real sources still select exactly their manifest files. |
| `check-mirrors.mjs` throws on `skills: {}` and accepts a skill whose `SKILL.md` row is missing | sol, astra | The per-source checks moved to `pinnedSourceFailures` in `scripts/lib/skill-mirror.mjs`, which guards non-array values and requires a `SKILL.md` row. `test/pinned-source-shape.test.mjs` covers it. |
| Admission step 5 ran `--enforce-floors` before step 6 activated the new cases; the reconciliation marked the finding fixed | sol | Steps reordered: rebuild (5), QA activation with compile and register (6), acceptance gates on the complete tree (7), review and deploy (8). |
| The README still said `update.sh` "fails closed at every step" | sol | Narrowed to the steps before the swap, naming the new tree and `SKILL.md` checks. |
| The `TODO.md` digest item said a projection change needs new attestations for all sources | sol | Corrected: the checker applies one projection to base and head, so only a later selection or location change needs a new entry. |

Accepted as deferred by the reviewers: the drift check's inferred cherry-pick mode (both current
cherry-picked sources have non-empty exclusion maps), the staged index, the digest location fields,
the inactive `build-index.mjs` branches, the SCF body read, and the filer's repeated evidence.

### Re-check pass

`rev-astra` and `rev-sol` re-checked `a6db8c1a..406301af` ([`recheck-rev-astra.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-30-skill-system-audit/recheck-rev-astra.md),
[`recheck-rev-sol.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-30-skill-system-audit/recheck-rev-sol.md)). `rev-astra`: accept. `rev-sol`: reject on one remaining problem, which
`rev-astra` also reproduced as non-blocking.

Correction to the "Verification pass" table: the `check-mirrors.mjs` row was only fixed for the
offline mode. With `--fetch`, which `refresh.yml` runs daily, `checkPinsResolve()` still iterated
`skills: {}` and the command exited 2 (`source.skills is not iterable`) instead of 1.

Fix in the next commit: `checkPinsResolve()` skips a source that `pinnedSourceFailures` rejects, so
its recorded shape failure keeps the exit at 1. `test/check-mirrors-cli.test.mjs` runs the real
checker on a throwaway tree with a malformed manifest and requires exit 1 in both modes. Without the
fix the `--fetch` case fails (`1 failed | 1 passed`); with it both pass.

### Final verdicts

`rev-sol` re-checked `406301af..5a72232e` ([`final-rev-sol.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-30-skill-system-audit/final-rev-sol.md)): accept. It reproduced exit 1 in both
modes for `skills: {}` and exit 2 at `406301af`, and found no new defect.

Final state: `rev-fable` accept (verification pass), `rev-grok` accept (verification pass),
`rev-astra` accept (re-check pass), `rev-sol` accept (final re-check). Every finding is fixed,
rejected with evidence, or queued in `.agents/TODO.md` with the reviewer's agreement. Panes
`w46:p2`–`w46:p5` stay open under this orchestrator until the PR merges and deploys.

### PR #184 release receipt

`raven-next` recorded this receipt on 2026-09-30 (`.agents/rounds/2026-09-30-raven-next.md`).
The merge, deploy, and `postdeploy` facts come from the owner's handoff. `raven-next` re-checked
the deployment, the routes, and the usage check read-only between 20:53Z and 20:57Z.

- GitHub merged the PR by squash as `6dd9439461a286f5ca5f87722fb60f238c610d3d` at
  2026-09-30T20:46:08Z. CI passed first (`secrets`, `Analyze`, `test`, `CodeQL`).
- The owner ran `npm run deploy` from `main`. Worker Version ID:
  `9f5a4151-8fa6-41d9-a68d-776052d6ddd5`. Version created 2026-09-30T20:46:26.467Z. Deployment
  created 2026-09-30T20:46:29.652Z. `wrangler deployments status` showed 100% of traffic on it at
  20:53Z.
- The `postdeploy` hook returned HTTP 401 with the default credential, as on 2026-09-29 and for
  PR #183. `WRANGLER_PROFILE=sdf node scripts/check-usage-deployment.mjs` → `Usage tail consumer
  and daily retention schedule are present.`
- Nine public routes returned HTTP 200: `/`, `/playground`, `/terms`, `/health`,
  `/health/skills`, `/og.png`, `/robots.txt`, `/sitemap.xml`, and
  `/.well-known/oauth-authorization-server`. Unauthenticated `POST /mcp` returned HTTP 401.
  `/health/skills` reported `checked: 64` at 2026-09-30T20:07:19Z.
- The owner's authenticated check after the deploy served 20 skills. The re-check ran one
  authenticated `search` and one `execute` through the Raven connector. The `execute` made four
  parallel service calls. All four returned `ok`. `scout.getStatus` reported `apiVersion` `1.9.54`.
- This receipt releases panes `w46:p2`–`w46:p5`.
