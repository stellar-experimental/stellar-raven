# AGENTS.md — stellar-raven-codemode

Canonical repository instructions for Codex, Claude Code, and other coding agents. Keep this file
short, current, and operational. Put architecture, research, history, and task runbooks in the
linked docs and skills instead of accumulating them here. Human contributors start with
[`CONTRIBUTING.md`](CONTRIBUTING.md).

## Project and source-of-truth map

This is a Cloudflare Workers MCP server exposing `search` and `execute` over Lumenloop, Stellar
Light/Scout, Stellar Docs (Algolia), and selected ecosystem skills. Model-authored JavaScript runs
in a networkless Dynamic Worker; host adapters own all service traffic, policy, and secrets.

- Read `PLAN.md` for current product scope and status, then `ARCHITECTURE.md` for the implemented
  request, catalog, scoring, sandbox, and auth design.
- Use `README.md` for connection and local setup, and [`docs/operations.md`](docs/operations.md)
  for operator procedures.
- Use `research/` for dated evidence and design context; it is not an instruction layer.
- This repo is self-contained, including usage collection and reporting under `usage/`. Owner-only
  private folders exist outside the repository; `usage/README.md` names them and their roles. Never
  depend on them, and never commit production counts here.
- Use `.agents/skills/<name>/SKILL.md` for repeatable task workflows. `.claude/skills` is the
  committed symlink to the same canonical directory.
- Use `.agents/TODO.md` for the own-repo work queue, priorities, and open owner decisions, and
  `.agents/rounds/` for round ledgers. `.agents/README.md` says which note belongs where.
- `CLAUDE.md` imports this file. Do not duplicate shared rules there.

## Commands and verification

- Install reproducibly: `npm ci`. The `prepare` script installs a pre-commit hook that scans
  staged files for secrets.
- Fresh clone: follow "Run locally" in `README.md`. `npm run typegen` needs the placeholder
  `.dev.vars` first; without it, `Env` has no secret members and `npm run typecheck` fails.
- Baseline validation for code changes: `npm run typecheck`, `npm test`, and `npm run build`.
  `npm test` excludes `test/smoke/**`; add `npm run test:smoke` when touching `src/executor` or
  `src/demo` — it is the only lane exercising those paths against the assembled worker
  (unit tests import the modules directly; CI always runs both).
- CI (`.github/workflows/ci.yml`) also runs `npm run eval:selftest`,
  `npm run eval:qa:lint -- --stale --enforce-floors`, `npm run eval:qa:register -- --check`,
  `npm run improvements:lint`, `node scripts/check-pin-review.mjs --base <ref>`,
  `npm run eval:routing -- --gate`, and a generated-artifact sync check. Run the matching command
  when you touch `eval/`, `improvements/`, `catalog/`, or `ecosystem-skills/`.
- Run the narrowest relevant eval or maintenance command in addition to the baseline; the selected
  skill defines the exact gate for eval, drift, golden-truth, improvements, and observability work.
- Scan before committing: `npm run secrets:scan -- --tree`.
- Do not start a second Wrangler process. Reuse the pane that already runs `npm run dev` (manual
  testing) or `npm run dev:eval` (eval lanes; see `run-evals`), and read its bound URL from that
  pane's output.
- Generated outputs are rebuilt by their `package.json` scripts, never edited by hand.

## Coordination

The owner runs agents under Herdr, and the rules in this section and the next describe that setup.
Without Herdr, work in one session. State in the pull request that the independent review is
outstanding; the owner runs it.

- Agents, panes, and worktrees run under Herdr. Use the global `herdr` skill for the CLI contract;
  it is the authority on command syntax, lifecycle states, and ID handling. Confirm
  `HERDR_ENV=1` before any control command, and read IDs out of JSON responses rather than
  predicting them.
- Spawn a reviewer or a parallel lane by splitting a pane from your own —
  `herdr pane split --current --direction <right|down> --cwd "$PWD" --no-focus`; `--direction` is
  required — then `herdr agent start <name> --kind <codex|grok|claude> --pane <id> -- <cli args>`.
  Name the model and effort explicitly after `--`. Wait with `herdr agent wait <name>` or
  `herdr agent prompt … --wait`; do not poll.
- **Pane and agent ownership is recursive:** control only the pane you occupy and panes you
  split yourself. Never close, interrupt, restart, send input to, rename, move, focus, resize, or
  take over a parent, a sibling, an unrelated pane, or another agent's descendants. Apply the same
  rule to every sub-agent. Idleness, staleness, a completed handoff, or a request to clean up does
  not transfer ownership: leave a pane you do not own alone and ask its owning agent to reconcile
  it. Record the pane IDs you create; unknown provenance means not owned. If the owner is unknown
  or unavailable, ask the user for an explicit exception naming the exact target; never adopt it.
- `herdr agent read` cannot recover output that scrolled off an alternate screen. For any reviewer
  whose findings matter, have the agent write them to a Markdown file and reply with only the path.
- Durable working state lives in the repository, never in an external tracker. Own-repo work goes
  to `.agents/TODO.md`; a multi-lane round keeps its ledger at
  `.agents/rounds/<YYYY-MM-DD>-<slug>.md`. See `.agents/README.md` for the routing table.
- Independent adversarial review is a completion gate when requested: reviewer must differ from
  author, run to completion, and have every finding reconciled before finalization.

## Model routing for repo-work fan-out

Launch fan-out through Herdr panes, one agent per lane. State model and effort explicitly on the
`herdr agent start` command line. Route by role tier:

- **Codex frontier** at high — hard implementation, dense analysis, and security review.
- **Codex workhorse** at high — routine implementation and bounded verification.
- **Claude Fable** at high — product, API, documentation, and taste.
- **Claude Opus** at high — the stable Claude fallback.
- **Grok** at high — vendor-diverse assumption attack.

Reserve max for frontier work or a failed high-effort pass; treat ultra as a separate delegated
topology. [`.agents/model-roster.md`](.agents/model-roster.md) maps each tier to an exact model ID
and launch line. When a CLI catalog changes, update the roster only. Eval answering and judge
models remain separate measurement contracts controlled by `run-evals`.

Choose the independent reviewer under "Coordination" by tier, not by a fixed model:

- **Eligibility.** The reviewer differs from the author *and* from the orchestrator. An
  orchestrator that is also a candidate reviewer drops out of the pool for that gate.
- **Effort.** Run the gate at high. Escalate to xhigh only for a subtle change, or after a
  high pass missed a real finding. Never make xhigh the standing default.
- **Selection and fallback.** Match the tier to the change: Claude Fable for product, API, and
  taste; Codex frontier for dense implementation or analysis; Grok for vendor-diverse assumption
  attack. When that tier is the author, the orchestrator, or unavailable, take the next best
  match, then Claude Opus at high as the last resort. Record the tier, model, and effort used, and
  why the matched tier was skipped.

## Hard rules

- **Forward-only:** prefer the best current design; do not add compatibility shims, dual formats,
  or deprecation paths merely to preserve deployed behavior. Deviations still need evidence.
- **The manifest is the exposed surface** (ADR-0003). Model code never owns endpoints, arguments,
  auth, or exposure. Never emit references to non-exposed operations or retired skills. Two guards
  enforce this: `assertNoNonExposedRefsInText` runs in `prebuild` (via `build-micro-map.mjs`) over
  emitted text, and `assertNoNonExposedRefs` checks manifest entries when the catalog is rebuilt
  (`build-catalog.mjs`) and on every `npm test`. `npm run build` alone does NOT rebuild the catalog,
  so a hand-edited manifest is caught by `npm test`/CI rather than by the build.
- Keep exact-match resolution for skill/tool IDs. Preserve service distinctions among soft-empty,
  error, and data responses.
- **Secrets stay host-side:** never print, commit, or expose credentials to the sandbox;
  `globalOutbound` remains `null`.
- The paid Lumenloop research trigger and its account-scoped read operations remain unexposed.
  Enabling them requires the exposure change, partner-detail persistence, budget gate, and dedup in
  one reviewed change.
- Partner-tier Lumenloop details are never committed. Inventory keeps name-only stubs and skill
  sync remains keyless.
- Any paid or side-effecting model operation requires host-side request-context approval,
  elicitation, and budget enforcement before it can ship.
- Algolia operator credentials are maintenance-only and never a runtime/sandbox surface. Any write
  needs a read-only A/B win, a general mechanism rather than per-query hacks, and the guardrails in
  [`docs/stellar-docs.md`](docs/stellar-docs.md).
- Evals produce evidence-backed upstream findings in `improvements/`; scores are instruments, not
  the final product.
- Solo, a retired task tracker, is not a live path. Never add a `solo://` reference, a Solo todo,
  or a Solo scratchpad. Leave existing Solo references in dated records unchanged.
- Retired sibling repos must not be referenced as live paths. Retained prior art is read-only under
  `eval/corpus/`; it is also the routing eval's committed label source. The QA battery is owned
  under `eval/qa/corpus/` and does not read it.

## Task runbooks

Use the matching skill when the task triggers it. Each skill's frontmatter says when.
Repository skills: `truth-maintenance`, `live-drift-resolution`, `run-evals`,
`improvements-pipeline`, `golden-truth`, `retrieval-system-audit`,
`cloudflare-observability-review`, and `audit-reviewability`. The global `herdr` skill owns pane,
agent, and worktree control.

Add durable repo-wide rules here only after recurring friction. Put specialized instructions in the
closest relevant skill or directory-level `AGENTS.md`.

## Definition of done

- The diff is scoped and preserves unrelated work in the dirty tree.
- Proportionate tests and required skill gates pass; failures are reported, not hidden.
- Generated artifacts came from scripts and secrets scanning passed where required.
- Requested independent reviews completed and every finding was reconciled.
- Documentation describes current behavior and links dated research instead of embedding history.
