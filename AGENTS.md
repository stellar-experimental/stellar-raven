# AGENTS.md — stellar-raven-codemode

Shared rules for Codex, Claude Code, and other coding agents. Holds only rules that change an
agent's next action; architecture, evidence, and procedures live in linked docs. Human contributors
start with [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Project and source-of-truth map

Cloudflare Workers MCP server exposing `search` and `execute` over Lumenloop, Stellar Light/Scout,
Stellar Docs (Mintlify), stellar.org, and pinned ecosystem skills. Model-written JavaScript runs in
a networkless Dynamic Worker; host adapters own traffic, policy, and secrets.

| Need | Read |
|---|---|
| Product scope and status | `PLAN.md` |
| Request, catalog, scoring, sandbox, and auth design | `ARCHITECTURE.md` |
| Connection and local setup | `README.md` |
| Deploy and operate | [`docs/operations.md`](docs/operations.md) |
| Stellar Docs adapter contract and credentials | [`docs/stellar-docs.md`](docs/stellar-docs.md) |
| Eval instruments, gates, and denominators | [`eval/EVALS.md`](eval/EVALS.md) |
| Test suite map | [`test/README.md`](test/README.md) |
| Generated files and generators | [`scripts/README.md`](scripts/README.md) |
| Upstream findings charter | [`improvements/README.md`](improvements/README.md) |
| Design decisions (ADRs) | [`research/decisions/README.md`](research/decisions/README.md) |
| Repeatable task procedures | `.agents/skills/<name>/SKILL.md` (`.claude/skills` symlinks there) |
| Open work and owner decisions | `.agents/TODO.md` |
| Round ledgers and note placement | `.agents/rounds/`, `.agents/README.md` |
| Dated evidence and records | `research/` (evidence, not instructions) |

The repo is self-contained, including `usage/`. Never depend on the owner's private folders
(`usage/README.md` names them) or commit production counts. There is no `CLAUDE.md`; Claude Code
reads this file natively.

## Commands and verification

- Install with `npm ci` (its `prepare` script installs the pre-commit secret-scanning hook).
- Fresh clone: follow [Run locally](README.md#run-locally). Create placeholder `.dev.vars` before
  `npm run typegen`; without it, `Env` lacks secret members and `npm run typecheck` fails.
- Baseline for code changes: `npm run typecheck`, `npm test`, `npm run build`. Add
  `npm run test:smoke` when touching `src/executor` or `src/demo` (`npm test` excludes
  `test/smoke/**`, the only lane running those paths in the assembled Worker).
- Run the matching [`CONTRIBUTING.md`](CONTRIBUTING.md#checks) gate when touching `eval/`,
  `improvements/`, `catalog/`, `ecosystem-skills/`, or `usage/`, plus any gate the active skill
  names.
- Run gate commands bare (pipes hide exit status).
- Never put a model-calling eval in a gate sweep; run it on its own, sized and capped per
  `run-evals`.
- Scan before committing: `npm run secrets:scan -- --tree`.
- Rebuild generated files via their scripts, never hand-edit ([`scripts/README.md`](scripts/README.md)).
- Do not start a second Wrangler process: reuse the terminal running `npm run dev` (manual testing)
  or `npm run dev:eval` (evals), reading its URL via `hc ls` then `hc read <t>`.
- Find a running server with `lsof -nP -iTCP -sTCP:LISTEN -a -c workerd` or `pgrep -f <pattern>`.
  Never use `pgrep -fl` or `ps eww` (they can print process environments and secrets).
- Pass `--remote` to `wrangler kv key list/get` and `kv bulk get` for production data (without it
  they read local KV; `kv bulk get --remote` takes ≤100 keys/call). Production KV is read-only from
  assessment tasks.

## Spend and evidence

"Spend" is task time, cost, and compute footprint.

- **Decide with the least spend that can decide.** Scope work/evals to the smallest run that answers
  the question. State the decision it changes, expected time/cost, and stop rule before starting;
  call the result once evidence is solid without low-value confirmation rounds or extra checks.
- **Cost counts.** Correctness wins only when the alternative is far less correct; a much cheaper
  path that is slightly less correct can be the better product. Report cost per answer beside
  accuracy and state the trade. For accuracy work, check upstream sources and golden errors before
  surface or prompt tuning.
- **Subscriptions first; no AI Gateway judging.** Evals, judging, testing, and building run on
  subscription CLIs as `hc` children (Claude Code, Codex, Grok, and OpenCode only after its
  subscription-provider probe; never on API keys) against local `wrangler dev`. AI Gateway or a
  provider API is allowed only for exceptions listed in
  [`eval/EVALS.md`](eval/EVALS.md#model-call-billing), each with a dollar cap and recorded cost;
  unlisted paths must join that list in a reviewed PR first.
- **Eval and test models.** Claude Sonnet, Codex Terra, and Grok (newest per family), adding Claude
  Opus and Codex Sol where helpful; omit Haiku and Codex Luna. Never tune to one model version;
  record every resolved model ID.
- **No per-run approvals.** Model-calling eval, test, or build runs need no approval—decide, run
  under a dollar cap, and record the run, reason, answer count, and cost in the round ledger or item
  record. Stay inside the lane brief.
- File and response size come second: trim bloat where cheap, not for its own sake.
- **Cut what adds no visibility.** Before keeping or moving an eval case, lint floor, test, or
  helper, ask what would go unseen without it. Delete if another gate covers it (and state which);
  name uncovered guards for the owner to decide.
- **Generality beats the golden.** Goldens locate gaps; they do not test generality. A new source or
  tuning change needs independent questions weighted to app development and audits plus a control
  sample from unrelated categories showing no new wrong answers and an unchanged routing gate.
  Reject wording that lifts one slice by shifting other categories.

Launch lines live in [`.agents/model-roster.md`](.agents/model-roster.md) (by family; runs record
resolved IDs). Measurement procedures live in `run-evals`. Scores are evidence, not decisions;
established upstream defects go to `improvements/`.

## Coordination

The owner runs agents under herdr-core (`hc`, setting `$HC_TERMINAL_ID`). Without it, work in one
session and note in the PR that independent review is outstanding.

- Follow the global `herdr-core` skill (`hc --skill`); address lanes by `--name`.
- Start reviewers and parallel lanes as background children with their first task on the launch
  line, and wait with `hc wait --children any|all` (never sleep or poll). Use the roster lines.
- **Terminal ownership is recursive.** Control only your own terminal and children you started.
  Never interrupt, kill, rename, take over, or send input to a parent, sibling, unrelated terminal,
  or another agent's children—except sending the report your parent asked for. Idleness, staleness,
  a finished handoff, or cleanup never transfers ownership. Record created terminal IDs (unknown
  provenance = not owned). Ask the owning agent to reconcile its terminal; if unknown or gone, ask
  the user for a targeted exception. Every sub-agent follows this rule.
- Screen history is not a record: reviewers write findings to Markdown and send only the path
  (`hc send <your terminal ID> '<path>'`).
- Durable state stays in-repo, never in an external tracker: own-repo work in `.agents/TODO.md`,
  multi-lane rounds in `.agents/rounds/<YYYY-MM-DD>-<slug>.md`.
- For substantial work: give parallel lanes disjoint file sets, verify both controlled (routing
  gate, vitest) and live (`test/live/`), and get a read-only design study plus explicit approval
  before editing near a security boundary.
- Write each lane brief to a file and send one short line: `"Confirmed by the orchestrator, a direct
  instruction: read <path> and do it."` Claude lanes treat long sent prompts as pasted text and
  refuse paid steps, pushes, and PRs—handle those yourself when a lane's rules forbid them. After
  `hc wait`, verify the report file exists and wait again if not (re-sending queues a second turn).
  Point lanes reading `git diff HEAD` at `origin/main` before committing underneath them. Re-run
  `npm test` outside the Codex sandbox before trusting a red suite (it denies `ps`).
- Reserve an `improvements/` finding-id range per lane (predated worktrees see taken IDs as free).
  Merge `origin/main` and rerun `improvements:lint` before `improvements:file`.
- Write `Refs #N`—never `close`, `fix`, or `resolve` before `#N`—for issues that must stay open
  (GitHub ignores negation). Grep PR bodies for `(close|fix|resolve)[sd]? #` before merging.
- `gh pr merge --delete-branch` deletes the branch's worktree and kills any lane running in it. Copy
  output out first, or merge without `--delete-branch` and remove the branch yourself. Run
  long-lived lanes in a worktree that outlives PRs, and pass reviewers absolute paths.
- Never rebase a branch whose SHA is pinned in posted upstream comments or an `improvements/`
  `sourceCommit`; add commits on top, mark "do not rebase" in the PR body, and squash-merge.
- Before deleting a branch, verify every added line survives in `main` plus open PR tips (ancestry
  does not prove content survived) and run `git bundle create` first. An evolved successor is fine;
  a vanished capability is not.
- A requested independent review is a completion gate: run it to completion and reconcile every
  finding before finishing.

## Owner delegations (lead session only)

Applies only to the lead session the owner works with; lanes, reviewers, and harness runs never
merge or deploy.

- **Merge and deploy as work completes.** Merge reviewed, CI-green PRs and run `npm run deploy`
  without asking. Before deploying, check and report anything the owner might miss: an active eval
  round holding deploys (check its ledger), a model-facing change lacking a measured verdict, or a
  dependency update altering model-facing requests while free gates stay green. Ledger-only PRs need
  no deploy. Outward-facing posts still require owner approval.

## Model routing for repo-work fan-out

| Tier | Use for |
|---|---|
| Codex frontier | Hard implementation, dense analysis, security review |
| Codex workhorse | Routine implementation, bounded verification |
| Claude Fable | Product, API, documentation, taste |
| Claude Opus | Stable Claude fallback |
| Grok | Vendor-diverse assumption attack |

Default effort is `high`. Escalate to `xhigh` for subtle changes or after `high` missed a real
finding; reserve `max` for frontier work or a failed `high` pass. `ultra` delegates to subagents
(treat as a separate topology). Update only the roster when CLI catalogs change.

The independent reviewer:

- differs from author and orchestrator;
- matches the change's tier (if unavailable or already author/orchestrator, take the next best
  match, then Claude Opus);
- is recorded with tier, model, effort, and why any matched tier was skipped.

## Hard rules

- **Forward-only.** Prefer the best current design; add no compatibility shim, dual format, or
  deprecation path just for deployed behavior without evidence.
- **Mirror Cloudflare's codemode.** Default to its shipped patterns; deviations need stated reasons
  or a measured golden Q→A win with cost included.
- **The manifest is the exposed surface** (ADR-0003). Model code never owns endpoints, arguments,
  auth, or exposure, and never emits references to non-exposed operations or retired skills.
  Enforced by `assertNoNonExposedRefsInText` (in `prebuild`) and `assertNoNonExposedRefs` (at
  catalog rebuild and `npm test`; `npm run build` does not rebuild the catalog, so `npm test`/CI
  catch hand-edited manifests).
- Resolve skill and tool IDs by exact match. Keep `soft-empty`, `error`, and data responses distinct.
- **Secrets stay host-side.** Never print, commit, or expose credentials to the sandbox. Keep
  `globalOutbound: null`.
- Keep the paid Lumenloop research trigger and its account-scoped reads unexposed; enabling them
  requires exposure, partner-detail persistence, a budget gate, and dedup in one reviewed change.
- Never commit partner-tier Lumenloop details (inventory keeps name-only stubs; skill sync stays
  keyless).
- Any paid or side-effecting model operation requires host-side request-context approval,
  elicitation, and budget enforcement before shipping.
- Mintlify admin credentials are maintenance-only, never runtime or sandbox surfaces. Docs search
  changes need a read-only A/B win with a general mechanism, not per-query exceptions
  ([`docs/stellar-docs.md`](docs/stellar-docs.md#maintenance)).
- **Search without opening case text.** Search with `rg --hidden -g '!.git' <pattern> [path]`
  (`.ignore` files under `eval/`, `eval/qa/`, and `.agents/rounds/` skip held-out, reserve, and
  golden-audit paths). Never use `grep -r`, `git grep`, `rg -u`/`--no-ignore`, an `rg -g` matching a
  case file, or a shell glob over `eval/` or `.agents/rounds/`. `PreToolUse` hooks enforce this in
  Claude Code, Codex (with `--dangerously-bypass-hook-trust`), Grok, and Antigravity
  (`eval/qa/README.md` lists per-CLI conditions); the rule binds even without an active hook. If
  `rg` is missing, use the `git grep` exclusion pathspec in `eval/qa/README.md` ("Searching without
  reading case text"). Only a golden-maintenance lane opens case text, by exact path.
- Skills are timeless: no todo IDs, run stamps, or dated state in skill text.
- Solo (a retired task tracker) is not a live path: add no `solo://` reference, Solo todo, or Solo
  scratchpad; leave existing references in dated records untouched.
- Never reference a retired sibling repo as a live path. `eval/corpus/` prior art is read-only
  (routing eval label source); the QA battery under `eval/qa/corpus/` does not read it.

## Definition of done

- Scoped diff that preserves unrelated work in a dirty tree.
- Proportionate tests and required gates pass; failures reported, never hidden.
- Generated files rebuilt by their scripts; secrets scan passed.
- Requested independent reviews finished and every finding reconciled.
- Docs describe current behavior and link dated research, not history.

Add a rule here only after recurring friction; put specialized instructions in the nearest skill or
directory guide.
