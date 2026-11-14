# AGENTS.md — stellar-raven-codemode

Shared instructions for Codex, Claude Code, and other coding agents. This file holds only rules
that change an agent's next action. Architecture, evidence, and procedures live in the linked
files. Human contributors start with [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Project and source-of-truth map

A Cloudflare Workers MCP server that exposes `search` and `execute` over Lumenloop, Stellar
Light/Scout, Stellar Docs (Mintlify), and pinned ecosystem skills. Model-written JavaScript runs in
a networkless Dynamic Worker. Host adapters own all service traffic, policy, and secrets.

| Need | Read |
|---|---|
| Product scope and status | `PLAN.md` |
| Request, catalog, scoring, sandbox, and auth design | `ARCHITECTURE.md` |
| Connection and local setup | `README.md` |
| Deploy and operate | [`docs/operations.md`](docs/operations.md) |
| A repeatable task procedure | `.agents/skills/<name>/SKILL.md` (`.claude/skills` is a symlink to that directory) |
| Open work and owner decisions | `.agents/TODO.md` |
| Round ledgers, and which note goes where | `.agents/rounds/`, `.agents/README.md` |
| Dated evidence and decision records | `research/` (evidence, not an instruction layer) |

The repo is self-contained, including usage collection under `usage/`. The owner keeps private
folders outside it; `usage/README.md` names them. Never depend on them, and never commit production
counts. `CLAUDE.md` imports this file; do not duplicate rules there.

## Commands and verification

- Install with `npm ci`. Its `prepare` script installs a pre-commit hook that scans staged files
  for secrets.
- Fresh clone: follow "Run locally" in `README.md`. `npm run typegen` needs the placeholder
  `.dev.vars` first; without it `Env` has no secret members and `npm run typecheck` fails.
- Baseline for a code change: `npm run typecheck`, `npm test`, and `npm run build`. Add
  `npm run test:smoke` when you touch `src/executor` or `src/demo`: `npm test` excludes
  `test/smoke/**`, and that lane is the only one that runs those paths in the assembled Worker.
- CI runs more gates per area. The "Checks" table in `CONTRIBUTING.md` maps each area to its
  command; run the matching one when you touch `eval/`, `improvements/`, `catalog/`,
  `ecosystem-skills/`, or `usage/`. The selected skill names any further gate.
- Run a gate command bare. A pipe hides its exit status.
- Never put a model-calling eval command in a gate sweep. Those commands cost money and need
  their own authorization (the `run-evals` skill).
- Scan before committing: `npm run secrets:scan -- --tree`.
- Generated files are rebuilt by their scripts, never edited by hand
  ([`scripts/README.md`](scripts/README.md) lists them).
- Do not start a second Wrangler process. Reuse the terminal that runs `npm run dev` (manual
  testing) or `npm run dev:eval` (eval lanes), and read its bound URL from that terminal
  (`hc ls`, then `hc read <t>`).

## Spend and evidence

"Spend" is the size of the work: how long a task takes, what it costs, and where it runs.

- **Decide with the least spend that can decide.** Scope each task and eval to the smallest run
  that answers the question. Before you start, state the decision it changes, the expected time
  and cost, and the stop rule. Call the result as soon as the evidence is solid. Do not add
  confirmation rounds, extra looks, or re-checks that buy little information.
- **Cost counts.** Correctness wins only when the alternative is far less correct. A path that is
  much cheaper and only slightly less correct can be the better product.
- **Run here, on `hc`, first.** Development tests and evals run against the local `wrangler dev`
  server with the subscription CLI agents (Claude Code, Codex, Grok) as `hc` children. Use an
  API-billed path (Cloudflare AI Gateway, a provider API) only when no CLI path can do the job,
  and record why.
- **Eval and test models.** Claude Sonnet 5.5, GPT-6.1 Terra, and Grok 4.7. Add Claude Opus 5.5
  and GPT-6.1 Sol where they help. Leave out Haiku and GPT-6 Luna.
- A paid method needs its own written authorization. A diagnostic budget does not transfer to
  headline collection.
- File and response size come second. Trim bloat where it is cheap; do not spend effort on it
  for its own sake.

[`.agents/model-roster.md`](.agents/model-roster.md) has the model IDs and launch lines. The
`run-evals` skill has the measurement procedure. Scores are evidence for a scoped decision, not
the decision; an established upstream defect goes to `improvements/`.

## Coordination

The owner runs agents under herdr-core (`hc`); `$HC_TERMINAL_ID` is set inside it. Without it, work
in one session and state in the pull request that the independent review is outstanding.

- The global `herdr-core` skill holds the `hc` contract (`hc --skill`). Address a lane by the
  `--name` you gave it.
- Start each reviewer or parallel lane as a background child with its first task on the launch
  line, and wait with `hc wait --children any` or `all`. Do not sleep or poll. The roster has the
  exact lines.
- **Terminal ownership is recursive.** Control only your own terminal and the children you
  started. Never interrupt, kill, rename, take over, or send input to a parent, a sibling, an
  unrelated terminal, or another agent's children; the one exception is the report your parent
  asked for. Idleness, staleness, a finished handoff, or a cleanup request does not transfer
  ownership. Record the terminal IDs you create; unknown provenance means not owned. Ask the
  owning agent to reconcile its terminal. If that agent is unknown or gone, ask the user for an
  exception that names the exact target. Every sub-agent follows the same rule.
- Screen history is not a record. A reviewer writes its findings to a Markdown file and sends you
  only the path (`hc send <your terminal ID> '<path>'` in its task).
- Durable working state lives in the repository, never in an external tracker: own-repo work in
  `.agents/TODO.md`, a multi-lane round in `.agents/rounds/<YYYY-MM-DD>-<slug>.md`.
- A requested independent review is a completion gate. The reviewer runs to completion, and
  every finding is reconciled before the work is final.

## Model routing for repo-work fan-out

| Tier | Use for |
|---|---|
| Codex frontier | Hard implementation, dense analysis, security review |
| Codex workhorse | Routine implementation, bounded verification |
| Claude Fable | Product, API, documentation, taste |
| Claude Opus | The stable Claude fallback |
| Grok | Vendor-diverse assumption attack |

Run every tier at high effort. Escalate to xhigh only for a subtle change or after a high pass
missed a real finding, and reserve max for frontier work or a failed high pass. `ultra`
delegates to subagents; treat it as a separate topology. The roster maps each tier to a model
ID; when a CLI catalog changes, update the roster only.

The independent reviewer:

- differs from the author and from the orchestrator;
- comes from the tier that matches the change. When that tier is the author, the orchestrator,
  or unavailable, take the next best match, then Claude Opus;
- is recorded with its tier, model, effort, and the reason a matched tier was skipped.

## Hard rules

- **Forward-only.** Prefer the best current design. Add no compatibility shim, dual format, or
  deprecation path only to preserve deployed behavior. A deviation needs evidence.
- **The manifest is the exposed surface** (ADR-0003). Model code never owns endpoints, arguments,
  auth, or exposure. Never emit a reference to a non-exposed operation or a retired skill.
  `npm run build` does not rebuild the catalog, so `npm test` and CI catch a hand-edited
  manifest, not the build.
- Skill and tool IDs resolve by exact match. Keep soft-empty, error, and data responses distinct.
- **Secrets stay host-side.** Never print or commit a credential or expose one to the sandbox.
  `globalOutbound` stays `null`.
- The paid Lumenloop research trigger and its account-scoped reads stay unexposed. Enabling them
  takes the exposure change, partner-detail persistence, a budget gate, and dedup in one reviewed
  change.
- Partner-tier Lumenloop details are never committed. Inventory keeps name-only stubs, and skill
  sync stays keyless.
- A paid or side-effecting model operation needs host-side request-context approval, elicitation,
  and budget enforcement before it ships.
- Mintlify admin credentials are maintenance-only, never a runtime or sandbox surface. A docs
  search change needs a read-only A/B win and a general mechanism, not a per-query exception
  ([`docs/stellar-docs.md`](docs/stellar-docs.md), "Maintenance").
- Skills are timeless: no todo IDs, run stamps, or dated state in skill text.
- Solo, a retired task tracker, is not a live path. Add no `solo://` reference, Solo todo, or Solo
  scratchpad. Leave Solo references in dated records unchanged.
- Never reference a retired sibling repo as a live path. Prior art under `eval/corpus/` is
  read-only; it is the routing eval's label source. The QA battery lives under `eval/qa/corpus/`
  and does not read it.

## Definition of done

- The diff is scoped and keeps unrelated work in a dirty tree.
- Proportionate tests and the required gates pass. Failures are reported, not hidden.
- Generated files came from their scripts, and the secrets scan passed.
- Every requested independent review finished and every finding was reconciled.
- Documentation describes current behavior and links dated research, not history.

Add a rule here only after recurring friction. A specialized instruction goes in the nearest
skill or directory-level guide.
