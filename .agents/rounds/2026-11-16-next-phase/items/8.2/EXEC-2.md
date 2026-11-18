# Item 8.2 EXEC-2: `.agents/` README, rounds guide, roster, skills (PR 2)

Executor: Claude Sonnet 5.5 (`claude-sonnet-5-5`), worktree `np-8.2-agents`, branch
`np/8.2-docs-agents` from `origin/main` `e0ad27d9`, 2026-11-18. Brief: `briefs/exec-2.md`. Overrides
applied: RECONCILE R-01 (B-03 text), R-04 (no edit to `golden-truth` or `improvements-pipeline`),
R-14 (B-07 offline block only). No model call, no paid call, no case file opened.

## Findings

| Id | Result | What changed |
|---|---|---|
| B-01 | applied | `run-evals` §5 step 1: `dev:eval` differs from `dev` by the clean-worktree refusal and the revision stamp in MCP `serverInfo` that `--server-revision` checks. Evidence re-read: `package.json` `dev` already passes `--host localhost`; `scripts/run-eval-server.mjs:15-24`. |
| B-02 | applied, **SKILL-BEHAVIOR** | `run-evals` §5 step 4: cost estimate reads `meta.totalCostUsd` with `jq` from the results files the round ledgers name, never by glob. |
| B-03 | applied (R-01 text) | `cloudflare-observability-review` "What joins": rotation changes every `clientHash`, gives each user a new subject (new `subjectHash`) at the next sign-in while an older grant keeps its old subject, and stops signed Playground cookies verifying. The `clientHash = null` line now also names an unset `MCP_SERVER_SECRET` (`telemetryClientHash` returns null without a secret, `src/observability-request.ts:46-49`). |
| B-04 | applied, **SKILL-BEHAVIOR** (with O-18) | `live-drift-resolution` §8 step 3 links `docs/operations.md#deploy`. A drift deploy now also checks `/health` and `/health/skills`, which the operations list holds. |
| B-05 | applied, **SKILL-BEHAVIOR** | `truth-maintenance` §1: ledger headings are the `rounds/README.md` shape (`Scope`, `Lanes`, `Ledger`, `Outcome`) with the old extras folded into `Outcome`. |
| B-06 | applied (with O-05) | `run-evals` §2: the five-row table and the Haiku and Luna bullet are replaced by a link to the roster ("Models for evals and tests") and "pass the full ID to `run-qa.mjs --model <id>`". The roster still holds the exclusion. |
| B-07 | applied, offline only | Roster stamp is now 2026-11-18: Codex `0.169.0`, Claude Code `2.1.327`, Grok `1.0.88`. See "B-07 record". |
| B-08 | applied | `evidence-contract.md`: source list adds stellar.org; coverage adds `temporal`. |
| B-09 | applied | `run-evals` §4: adds the `build-op-classes.mjs` line to the block and `qa/tool-cases.json` to the generated list (`ci.yml:138` pins it). |
| B-10 | applied (with O-22) | `.agents/README.md`: the `rounds/` row names the ledger and the optional working folder; the 0.3 DISPOSITION link gets "retained for this index". |
| B-11 | applied | `rounds/README.md` Rules: keeps "write the Outcome section" and links `../README.md#retention` for where open work and rules go. |
| B-12 | declined | R-06: superseded by O-06; `improvements-pipeline` is frozen (R-04). |
| B-13, B-14 | deferred | R-04: `improvements-pipeline` is frozen until run 2.2c merges. Carried by the post-2.2c TODO item (PR 3). |
| B-15 | applied | Observability skill: the gateway cache TTL is "dashboard-side config, 300 seconds when last read" (`wrangler.jsonc:42` says gateway rules are dashboard-side; the figure appears only in test comments); `skill_read` `from` adds `none` (`src/observability.ts:106`); the MCP request summary adds `apiKeyName` (`src/observability-request.ts:6-12`). |
| B-16 | applied | `live-drift-resolution`: `refresh-inventory.mjs` rewrites on a content change, ignoring `fetchedAt`; the provenance row drops `fetchedAt` (`scripts/refresh-inventory.mjs:8-10`). |
| B-17 | applied | `audit-rubric.md`: "Keep open work in the project's designated queue (`.agents/TODO.md` in this repository) and temporary agent context in a scratch surface." |
| B-18 | applied | `run-evals` §2: a Codex lane launched with `-a never` cannot approve MCP tool calls; read the roster's Codex note. |
| O-05 | applied (PR 2 part) | Roster "Run on `hc` agents first" bullet cut (`AGENTS.md` "Spend and evidence" owns it); `run-evals` table cut (B-06). The `eval/EVALS.md:12-17` half belongs to PR 3. |
| O-15 | applied | `run-evals` "Hard rules": the four instrument rules become one link to `eval/EVALS.md#evaluation-rules`. Kept: "closer to the headline wins", "no schemas or judge code copied", secrets, sandbox. |
| O-16 / O-45 | applied, **SKILL-BEHAVIOR** | Skills use the CI lint form `npm run eval:qa:lint -- --stale --enforce-floors`: `run-evals` §4 and §8 (the §8 line keeps `--since <ref>`), `truth-maintenance` §2 and §4, `live-drift-resolution` §7. `golden-truth` line 131 keeps its form (frozen skill). |
| O-17 | applied (PR 2 part) | `run-evals` §7 "No overfitting": the docs-scoping bar links `docs/stellar-docs.md#maintenance` instead of naming `improvements-pipeline`. The `improvements-pipeline` copy is frozen. |
| O-18 | applied (skill part) | `live-drift-resolution` §1 "Skill pins" links `ecosystem-skills/README.md#re-pin` and keeps the rebuild order; §8 links operations (B-04). `PIN-REVIEW.md` and `inventory/README.md` halves are PR 3. |
| O-22 | applied | `rounds/README.md` describes the working folder: round `PLAN.md` and `DECISIONS.md`, `items/<n>/` with `PLAN.md`, `briefs/`, findings, review files, `EXEC.md`; the ledger indexes it and carries the Outcome. Checked against `rounds/2026-11-16-next-phase/` and `2026-11-14-baseline-tuning{,.md}`. |
| O-27 rows | applied | "round record" becomes "round ledger" in `run-evals` (four places); "playground/demo telemetry" becomes "Playground telemetry" in the observability skill description. No "pane" in this set. |
| O-41 | applied | `truth-maintenance` §2: the stagger bullet is cut; the sentinel bullet keeps the queue trigger and the "re-author the anchor" sentence (no other doc holds it), then points at `golden-truth` section 5 for per-case rules. |
| O-42 | applied | Observability skill: the `ideas/skill-discovery-without-bundling.md` clause is deleted (R-05: the file stays); ADR-0004 linked at the correlation-ID sentence. |
| O-43 | applied | Observability skill: the `sources` and `errorName` bullet keeps the two traps (a `timeout` bucket is the per-call budget; a non-Error throw is `ok: true`) and links `ARCHITECTURE.md#9-observability`. |
| O-44 | applied | The stored-results shape trap moves from the observability skill to `run-evals` §6. |
| O-06 skill side, "Raven scoping" sentence, O-10 | not touched | R-04: `improvements-pipeline` is frozen. In the post-2.2c item. |

## Gates

Run bare, in `/home/tyler/code/raven-wt/np-8.2-agents`.

| Gate | Result |
|---|---|
| `npm run typegen` | ran once; no error |
| `npm run typecheck` | exit 0 |
| `npm test` | exit 0; 174 files passed, 5 skipped; 4190 tests passed, 3 expected fail, 8 skipped |
| `npm run build` | exit 0 (wrangler dry run) |
| `npm run secrets:scan -- --tree` | exit 0; clean |
| link check (`tmp/check-links.mjs` with the brief's file list) | 0 problems |
| `git diff --quiet origin/main -- .agents/skills/golden-truth .agents/skills/improvements-pipeline` | clean |
| `git diff --stat origin/main -- src public wrangler.jsonc catalog specs` | empty |

`npm run test:smoke` not run: no `src/executor` or `src/demo` change.

## B-07 record

Offline block of the roster's "How to re-verify" only. The two network reads (`grok models`, the
`claude -p` alias probe, a model call) were skipped (R-14).

- Versions: `codex --version` 0.169.0 (its cache reports client 0.170.0), `grok --version` 1.0.88,
  `claude --version` 2.1.327.
- Every tier row still matches the caches: `gpt-6-astra` 272k, default `medium`, low to max plus
  ultra; `gpt-6.1-sol` 500k, default `low`; `gpt-6.1-terra` listed; `gpt-6-luna` listed;
  `grok-4.7` 256k, default `high`, low to xhigh. `claude --help` lists `--model` aliases
  `fable`, `opus`, `sonnet` and efforts low to max.
- Not in the roster: `gpt-6.2-sol` (500k, default `low`) and `gpt-6.2-astra` (272k, default
  `low`), both visible, with efforts low to max plus ultra. `~/.codex/config.toml` sets
  `model = "gpt-6.2-astra"`. The roster says an unlisted entry is not a tier until `AGENTS.md`
  names one, so no tier changed.
- **Owner question:** does `gpt-6.2-*` replace or join the Codex tiers (`gpt-6-astra` frontier,
  `gpt-6.1-sol` workhorse)? I did not map by name.

## SKILL-BEHAVIOR list for the orchestrator

1. **B-02** (`run-evals` §5 step 4): the cost estimate no longer globs `results/`.
2. **B-04** (`live-drift-resolution` §8): a drift deploy runs the full operations checks, so it adds
   `/health` and `/health/skills`.
3. **B-05** (`truth-maintenance` §1): the round ledger uses the `rounds/README.md` headings.
4. **O-16 / O-45**: skills run the CI form of the QA lint (`--stale --enforce-floors`).

Smaller, not behavior-changing: B-18 adds a caution; O-15 and O-05 replace copies with links.

## Deviations

- B-10 kept the DISPOSITION link in `.agents/README.md` and annotated it, the finding's second
  option, because moving it to a round's Outcome would orphan the index.
- O-41 kept one sentence the finding would have cut, because no other doc holds it.
- B-15 states the gateway TTL as dashboard-side config, since no file in the repository sets it.
- O-15 kept two "Hard rules" bullets that `eval/EVALS.md` does not hold.
- The roster's "Run on `hc` agents first" cut also drops its "record the reason in the round
  ledger" clause; `AGENTS.md` says "record why".
- `eval/EVALS.md` still says the skill holds the model IDs. PR 3 owns that file (O-05 part 2).

## Findings with wrong evidence

None. B-03's evidence was wrong and R-01 had already replaced its text.
