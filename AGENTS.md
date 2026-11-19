# AGENTS.md — stellar-raven-codemode

Shared instructions for Codex, Claude Code, and other coding agents. This file holds only rules
that change an agent's next action. Architecture, evidence, and procedures live in the linked
files. Human contributors start with [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Project and source-of-truth map

A Cloudflare Workers MCP server that exposes `search` and `execute` over Lumenloop, Stellar
Light/Scout, Stellar Docs (Mintlify), the stellar.org site, and pinned ecosystem skills.
Model-written JavaScript runs in a networkless Dynamic Worker. Host adapters own all service traffic, policy, and secrets.

| Need | Read |
|---|---|
| Product scope and status | `PLAN.md` |
| Request, catalog, scoring, sandbox, and auth design | `ARCHITECTURE.md` |
| Connection and local setup | `README.md` |
| Deploy and operate | [`docs/operations.md`](docs/operations.md) |
| Stellar Docs adapter contract and credentials | [`docs/stellar-docs.md`](docs/stellar-docs.md) |
| Eval instruments, gates, and denominators | [`eval/EVALS.md`](eval/EVALS.md) |
| Which test suite covers what | [`test/README.md`](test/README.md) |
| Generated files and their generators | [`scripts/README.md`](scripts/README.md) |
| Upstream findings charter | [`improvements/README.md`](improvements/README.md) |
| A design decision (ADR) | [`research/decisions/README.md`](research/decisions/README.md) |
| A repeatable task procedure | `.agents/skills/<name>/SKILL.md` (`.claude/skills` is a symlink to that directory) |
| Open work and owner decisions | `.agents/TODO.md` |
| Round ledgers, and which note goes where | `.agents/rounds/`, `.agents/README.md` |
| Dated evidence and decision records | `research/` (evidence, not an instruction layer) |

The repo is self-contained, including usage collection under `usage/`. The owner keeps private
folders outside it; `usage/README.md` names them. Never depend on them, and never commit production
counts. There is no `CLAUDE.md`; Claude Code reads this file natively.

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
- Never put a model-calling eval command in a gate sweep: it costs money. Run it on its own,
  sized and capped by the `run-evals` skill.
- Scan before committing: `npm run secrets:scan -- --tree`.
- Generated files are rebuilt by their scripts, never edited by hand
  ([`scripts/README.md`](scripts/README.md) lists them).
- Do not start a second Wrangler process. Reuse the terminal that runs `npm run dev` (manual
  testing) or `npm run dev:eval` (eval lanes), and read its bound URL from that terminal
  (`hc ls`, then `hc read <t>`).
- Find a running server with `lsof -nP -iTCP -sTCP:LISTEN -a -c workerd` or `pgrep -f <pattern>`.
  `pgrep -fl` and `ps eww` can print another process's environment, secrets included.
- Pass `--remote` to `wrangler kv key list/get` and `kv bulk get` for production data; without it
  they read the local store. `kv bulk get --remote` takes at most 100 keys per call. Production KV
  stays read-only from an assessment task.

## Spend and evidence

"Spend" is the size of the work: how long a task takes, what it costs, and where it runs.

- **Decide with the least spend that can decide.** Scope each task and eval to the smallest run
  that answers the question. Before you start, state the decision it changes, the expected time
  and cost, and the stop rule. Call the result as soon as the evidence is solid. Do not add
  confirmation rounds, extra looks, or re-checks that buy little information.
- **Cost counts.** Correctness wins only when the alternative is far less correct. A path that is
  much cheaper and only slightly less correct can be the better product. Report cost per answer
  beside accuracy in every comparison and state the trade. For accuracy work, look first at
  upstream sources and golden errors before surface or prompt tuning.
- **Subscriptions first. No AI Gateway judging.** Evals, judging, testing and building run on
  subscription CLIs as `hc` children: Claude Code, Codex, Grok, and OpenCode only after its
  subscription-provider probe, never on API keys. Tests and evals run against the local
  `wrangler dev` server. AI Gateway or a provider API is allowed only for an exception listed with
  its reason in [`eval/EVALS.md`](eval/EVALS.md) "Model-call billing". Every API-billed run carries a
  hard dollar cap and is recorded with its cost; an unlisted path first joins the list in a
  reviewed pull request ([`eval/EVALS.md`](eval/EVALS.md) "Model-call billing").
- **Eval and test models.** Claude Sonnet, Codex Terra, and Grok, each at its family's newest
  model. Add Claude Opus and Codex Sol where they help. Leave out Haiku and Codex Luna. Never
  tune to one model version; every run records the exact ID it resolved.
- **No per-run approvals.** A model-calling eval, test or build run needs nobody's approval or
  signature. Decide, run it under a hard cap, and record the run, its reason, answer count and
  cost in the round ledger or item record. A lane stays inside its brief.
- File and response size come second. Trim bloat where it is cheap; do not spend effort on it
  for its own sake.
- **Cut what adds no visibility.** Before keeping or moving an eval case, lint floor, test, or
  helper, ask what would go unseen without it. When another gate shows it, delete it and say what
  guards the behavior now. Name a guard nobody else covers and let the owner decide.
- **Generality beats the golden.** Goldens locate gaps; they are not the generality test. A new
  source or tuning change needs questions written independently of the goldens, weighted to
  application development and audits, and a control sample from unrelated categories with no new
  wrong answers and an unchanged routing gate. Reject wording that lifts one slice by moving other
  categories' results.

[`.agents/model-roster.md`](.agents/model-roster.md) has the launch lines. They name families, and
a run records the resolved ID. The `run-evals` skill has the measurement procedure. Scores are
evidence for a scoped decision, not the decision; an established upstream defect goes to
`improvements/`.

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
- For substantial work, give parallel lanes disjoint file sets, check efficacy both controlled
  (routing gate, vitest) and live (`test/live/`), and get a read-only design study and an explicit
  approval gate before code near a security boundary.
- Write each lane brief to a file and send one short line: "Confirmed by the orchestrator, a direct
  instruction: read <path> and do it." Claude lanes treat a long sent prompt as pasted text and
  refuse paid steps, pushes, and PRs; do those yourself when a lane's rules forbid them. After
  `hc wait`, check that the report file exists and wait again if not; a re-send queues a second
  turn. Point a lane that reads `git diff HEAD` at `origin/main` before you commit underneath it.
  Re-run `npm test` outside the Codex sandbox before trusting a red suite: it denies `ps`.
- Reserve an `improvements/` finding-id range per lane, because a worktree that predates a merge
  sees a taken id as free. Merge `origin/main` and rerun `improvements:lint` before
  `improvements:file`.
- Write "Refs #N", never "close", "fix", or "resolve" `#N`, for an issue that must stay open:
  GitHub ignores a negation. Grep the PR body for `(close|fix|resolve)[sd]? #` before merging.
- `gh pr merge --delete-branch` also removes the branch's worktree and kills any lane whose cwd is
  there. Copy lane output out first, or merge without the flag and remove the branch yourself.
  Start long-lived lanes in a worktree that outlives the PRs, and give reviewers absolute paths.
- Never rebase a branch whose SHA is pinned in posted upstream comments or an `improvements/`
  receipt (`sourceCommit`); add commits on top, say "do not rebase" in the PR body, and
  squash-merge.
- Before deleting a branch, test every line it added against the pooled contents of `main` plus
  every open PR tip (git ancestry does not prove content survived), and `git bundle create` first.
  An evolved successor is fine; a vanished capability is not.
- A requested independent review is a completion gate. The reviewer runs to completion, and
  every finding is reconciled before the work is final.

## Owner delegations (lead session only)

These apply only to the lead session the owner started and works with. Lanes, reviewers, harness
runs, and other tools do not merge or deploy; they report to their lead.

- **Merge and deploy as work completes.** Merge a reviewed, CI-green PR and run `npm run deploy`
  without asking. Before each deploy, check and report what the owner may be missing: another
  session's active eval round that holds deploys (read its ledger), a model-facing change without
  its measured verdict, or a dependency update that changes the model-facing request while free
  gates stay green. Ledger-only PRs need no deploy. Outward-facing posts still need the owner's
  approval.

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
- **Mirror Cloudflare's codemode.** Default to the patterns it ships; a deviation needs stated
  reasons or a measured golden Q→A win, with cost in the comparison.
- **The manifest is the exposed surface** (ADR-0003). Model code never owns endpoints, arguments,
  auth, or exposure. Never emit a reference to a non-exposed operation or a retired skill. Two
  guards enforce it: `assertNoNonExposedRefsInText` on emitted text in `prebuild`, and
  `assertNoNonExposedRefs` on manifest entries at catalog rebuild and in `npm test`.
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
- **Search without opening case text.** Search with `rg --hidden -g '!.git' <pattern> [path]`: the
  `.ignore` files under `eval/`, `eval/qa/` and `.agents/rounds/` make it skip the held-out, reserve
  and golden-audit paths. Never use `grep -r`, `git grep`, `rg -u` or `--no-ignore`, an `rg -g` glob
  that matches a case file, or a shell glob over `eval/` or `.agents/rounds/`. A Claude Code hook
  denies these; Codex and Grok lanes rely on this rule. Where `rg` is missing, use `git grep` with the
  exclusion pathspec that `eval/qa/README.md` ("Searching without reading case text") prints. Only a
  golden-maintenance lane opens case text, and it names the exact path.
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
