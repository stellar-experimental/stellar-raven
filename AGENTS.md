# AGENTS.md — stellar-raven-codemode

Canonical repository instructions for Codex, Claude Code, and other coding agents. Keep this file
short, current, and operational. Put architecture, research, history, and task runbooks in the
linked docs and skills instead of accumulating them here.

## Project and source-of-truth map

This is a Cloudflare Workers MCP server exposing `search` and `execute` over Lumenloop, Stellar
Light/Scout, Stellar Docs (Algolia), and selected ecosystem skills. Model-authored JavaScript runs
in a networkless Dynamic Worker; host adapters own all service traffic, policy, and secrets.

- Read `PLAN.md` for current product scope and status, then `ARCHITECTURE.md` for the implemented
  request, catalog, scoring, sandbox, and auth design.
- Use `README.md` for connection and operator setup.
- Use `research/` for dated evidence and design context; it is not an instruction layer.
- Use `.agents/skills/<name>/SKILL.md` for repeatable task workflows. `.claude/skills` is the
  committed symlink to the same canonical directory.
- `CLAUDE.md` imports this file. Do not duplicate shared rules there.

## Commands and verification

- Install reproducibly: `npm ci`. A fresh clone then needs **both** of the following before
  `npm run typecheck` is usable, because `env.d.ts` *and* `.dev.vars` are generated/gitignored:
  create a placeholder `.dev.vars` carrying the names CI uses (see the `.dev.vars` step in
  [`ci.yml`](.github/workflows/ci.yml) — values are irrelevant, the names define `Env`'s secret
  members), then run `npm run typegen`. `typegen` alone is not enough: without `.dev.vars` it
  emits an `Env` missing every secret and typecheck still fails on `WORKOS_*`,
  `MCP_SERVER_SECRET`, and `DEV_ALLOW_UNAUTHENTICATED`.
- Baseline validation for code changes: `npm run typecheck`, `npm test`, and `npm run build`.
  `npm test` excludes `test/smoke/**`; add `npm run test:smoke` when touching `src/executor` or
  `src/demo` — it is the only lane exercising those paths against the assembled worker
  (unit tests import the modules directly; CI always runs both).
- Run the narrowest relevant eval or maintenance command in addition to the baseline; the selected
  skill defines the exact gate for eval, drift, golden-truth, improvements, and observability work.
- Scan before committing: `npm run secrets:scan -- --tree`.
- Do not start a second Wrangler process. Use the existing Solo `dev` process for `npm run dev` and
  obtain its bound URL through Solo.
- Generated outputs are rebuilt by their `package.json` scripts, never edited by hand.

## Coordination

- Use the global `fan-solo` skill to route every Solo/Solo Docs task to the fewest focused Solo
  skills. Use `solo-orchestrate-agents` for cross-model fan-out; use the focused process, agent,
  todo, and scratchpad skills it selects for those surfaces. The bound Solo project is currently
  49; confirm scope with `whoami` and inspect `list_processes` before process action.
- **Solo process ownership is recursive:** an agent may spawn processes only as its own
  descendants and may stop, close, interrupt, restart, or otherwise lifecycle-manage only
  itself or descendants it spawned. Never lifecycle-manage a parent, sibling, unrelated process,
  or another agent's descendants. Apply the same rule to every sub-agent. Idleness, staleness, a
  completed handoff, release cleanup, or a request to clean Solo state does not transfer ownership;
  leave a process you do not own alone and ask its owning parent to reconcile it. If the owner is
  unknown or unavailable, ask the user for an explicit exception naming the exact target; never
  adopt it.
- Apply the same ownership gate to `send_input`, rename, output clearing, UI selection, timer
  delivery, and other target-process control. Solo reads do not expose reliable parentage: record
  returned child IDs; unknown provenance means not owned. YAML-backed commands are shared project
  processes, not descendants; control one only when the task or matching runbook authorizes it.
- Independent adversarial review is a completion gate when requested: reviewer must differ from
  author, run to completion, and have every finding reconciled before finalization.

## Model routing for repo-work fan-out

Use `fan-solo` to select the focused workflow and `solo-orchestrate-agents` for multi-agent
fan-out. State model and effort explicitly: Sol high for hard implementation/analysis, Terra high
for routine implementation or bounded verification, Fable xhigh/high for product/API/taste or
adversarial review, Opus high as the stable Claude fallback, and Grok high for vendor-diverse
assumption attack. Reserve max for frontier work or a failed high-effort pass; treat ultra as a
separate delegated topology. Callable-runtime evidence and launch mechanics live in
`research/agent-model-roster.md`; dated policy evidence is in
`research/solo-agent-orchestration-2026-07-15.md`. Eval answering and judge models remain separate
measurement contracts controlled by `run-evals`.

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
  `research/services/stellar-docs-algolia.md`.
- Evals produce evidence-backed upstream findings in `improvements/`; scores are instruments, not
  the final product.
- Retired sibling repos must not be referenced as live paths. Retained prior art is read-only under
  `eval/corpus/`; it is also the routing eval's committed label source. The QA battery is owned
  under `eval/qa/corpus/` and does not read it. Use `research/prior-art.md` for history.

## Task runbooks

Use the matching skill when the task triggers it:

- `fan-solo` — route broad or mixed Solo work to the fewest focused global Solo skills.
- `solo-orchestrate-agents` — coordinate cross-model agents and integrate independent lanes.
- `truth-maintenance` — coordinate a full live-drift/eval/golden/improvements maintenance pass.
- `live-drift-resolution` — regenerate, classify, verify, and resolve live catalog drift.
- `run-evals` — select instruments, review verdicts, triage causes, and file findings.
- `improvements-pipeline` — maintain finding lifecycle, intake, probes, index, and upstream follow-up.
- `golden-truth` — change golden answers with provenance and explicit uncertainty.
- `cloudflare-observability-review` — investigate production logs, traces, telemetry, and Ray IDs.
- `audit-reviewability` — audit or repair reviewability debt in code, comments, documentation,
  tests, agent instructions, and generated changes.

Add durable repo-wide rules here only after recurring friction. Put specialized instructions in the
closest relevant skill or directory-level `AGENTS.md`.

## Definition of done

- The diff is scoped and preserves unrelated work in the dirty tree.
- Proportionate tests and required skill gates pass; failures are reported, not hidden.
- Generated artifacts came from scripts and secrets scanning passed where required.
- Requested independent reviews completed and every finding was reconciled.
- Documentation describes current behavior and links dated research instead of embedding history.
