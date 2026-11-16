# Item 0.1 plan: fix `hono` (#428)

Lead: Claude Opus 5.5 on agentpc (`hc` `t1qk`). Worktree `/home/tyler/code/raven-wt/np-0.1`,
branch `np/0.1-hono` from `origin/main` at `2623fcc2`. Reconciled with [REVIEW.md](REVIEW.md).

## Decision

Whether the lockfile moves `hono` out of the vulnerable range (`<=4.13.15`; five advisories, four
moderate and one low) with no other change. If it does, `npm audit` is clean, and the
dependency-audit workflow closes #428 itself on the merge push.

This is lockfile hygiene, not a fix to a served vulnerability: `hono` is not in the Worker bundle
(REVIEW.md finding 2: no `hono` or `@hono` input in the `wrangler deploy --dry-run --metafile`
output). The Worker reaches MCP through `agents/mcp`; only the SDK's Node transport imports
`@hono/node-server`.

## Facts re-checked at `2623fcc2`

- `npm audit` reports one package, `hono` (package severity moderate), five advisories, "fix
  available via `npm audit fix`". Matches #428.
- `hono@4.13.14` is transitive only: `@modelcontextprotocol/sdk@1.32.1` (`hono: ^4.11.4`) and
  `@hono/node-server@2.1.6` (peer `^4 || ^5.0.0-0`). Nothing in the repo imports it.
- `npm audit fix --dry-run`: `change hono 4.13.14 => 4.13.19`, nothing added or removed.
- `overrides` holds `miniflare` and the vitest-pool pins only; the fix touches neither.
- agentpc has Node v26.13.0 only; the repo pins Node 24 (`engines`, `.nvmrc`, CI).

## Steps (executor)

0. Setup, nothing committed. Write the names-only stub from `.github/workflows/ci.yml` ("stub
   .dev.vars for type generation") to `.dev.vars` with mode 600, run `npm run typegen`, and confirm
   `npm run typecheck` exits 0. Run `npm run build` and record `sha256sum dist/server.js` as the
   baseline (the reviewer measured
   `d6a5a7a0dc9b80c5a0ddfb474a853eb02f5dd79142a8a8e3f578a01c89362bdb`).
1. Run `npm audit fix` (no `--force`). Expected diff: `package-lock.json` only, three lines of the
   `node_modules/hono` entry (`version`, `resolved`, `integrity`). Any other change triggers the
   stop rule.
2. `npm ls hono --all` shows one deduped `hono@4.13.19`; `npm audit` exits 0.
3. Gates, each run bare: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke`
   (the round plan asks for it), `npm run secrets:scan -- --tree`.
4. Bundle check: `sha256sum dist/server.js` after the bump equals the step 0 baseline. A different
   hash is a finding to explain before shipping, not a pass.
5. Write `EXEC.md`: Node and npm versions, the diff, each gate's result in a line, the two hashes,
   any deviation.
6. Commit on `np/0.1-hono` with normal hooks: `package-lock.json` plus this item folder (`PLAN.md`,
   `REVIEW.md`, `EXEC.md`, `briefs/`). Not `.dev.vars`, not `env.d.ts`. The lead adds the ledger
   row and `REPORT.md` afterwards in its own commit.

## Gates

Step 3's five commands, `npm audit` exit 0, and the step 4 hash match. No `CONTRIBUTING.md` area
gate applies. No model-calling command, no local server. Because agentpc runs Node 26, the pull
request's CI run on Node 24 is the binding gate run.

## Stop rule

Stop and record under "Dependencies" in `.agents/TODO.md` instead of shipping if the fix needs
`--force`, a major version, a `package.json` or `overrides` change, or moves any package other than
`hono`; or if a gate fails because of the bump. To attribute a local gate failure, re-run that gate
on the old lockfile (`git checkout 2623fcc2 -- package-lock.json`, `npm ci`); a failure that
reproduces there is environmental and is reported, not charged to the bump. Otherwise ship as soon
as the gates pass.

## Risks

- None to the Worker if the step 4 hash matches: no served byte changes.
- Off-engine local run (Node 26). Covered by the attribution step and CI on Node 24.

## Review

The round adds the Fable plan review (REVIEW.md). No skill or security boundary requires a further
review: a transitive patch bump within declared ranges, outside the bundle, touching no secret,
sandbox or exposure surface.

## Reconciliation of REVIEW.md

1. Blocker, typecheck needs the stub `.dev.vars` and typegen: adopted as step 0.
2. `hono` is not bundled: adopted. Smoke reason dropped, transport risk replaced by the bundle hash
   check (step 4), the decision reworded as lockfile hygiene, and no deploy is needed for this item.
3. Off-engine Node and failure attribution: adopted in the stop rule and gates. No Node 24 manager
   is installed on agentpc, so CI on Node 24 binds.
4. Advisory severities: adopted (four moderate, one low).
5. Ledger row ownership: adopted in step 6.

## Needs from the orchestrator

- Merge. No deploy for this item: it changes no Worker bytes (step 4). The round's "deploy after A
  and B together" reduces to deploying B.
- The pull request says `Refs #428`. `dependency-audit.yml` runs on a push to `main` that touches
  `package-lock.json` and closes #428 when `npm audit` is clean.
