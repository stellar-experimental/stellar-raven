# Review of the item 0.1 plan

Reviewer: Claude Fable 5.2, high effort, as a child of the lead (`t1qk`). Checked at `2623fcc2`
on agentpc (Node v26.13.0, npm 11.20.0). The worktree is unchanged; no model was called.

Verdict: the fix itself is right and the plan's dependency facts hold. One blocker (the typecheck
gate cannot pass in this worktree as it stands), two "should" findings, two nits.

## Findings

### 1. Blocker: `npm run typecheck` fails in this worktree before any change

- Evidence: the worktree has no `.dev.vars` and no `env.d.ts` (both ignored). `npm run typecheck`
  at `2623fcc2` exits 1 with 77 errors, all of the form "Property 'OAUTH_KV' does not exist on
  type 'Env'". The plan runs the gate with no setup step, and the lead brief copies `.dev.vars`
  only "if the item needs the local server".
- Effect: the executor meets a red gate that has nothing to do with `hono`, and the stop rule
  ("a gate fails because of the bump") gives it no way to tell.
- Change: add a step 0. Write the names-only stub from the "stub .dev.vars for type generation"
  step of `.github/workflows/ci.yml` to `.dev.vars` (mode 600), run `npm run typegen`, and confirm
  `npm run typecheck` exits 0 before step 1. Neither file is committed.

### 2. Should: `hono` is not in the Worker bundle, so three statements in the plan are wrong

- Evidence: `wrangler deploy --dry-run --metafile` at `2623fcc2`, written to a scratch directory:
  528 bundle inputs, none under `node_modules/hono` or `node_modules/@hono`, and no such string in
  `server.js`. In the SDK only `server/streamableHttp.js` (the Node transport) imports
  `@hono/node-server`; the Worker goes through `agents/mcp`. Nothing under `src`, `test`,
  `scripts`, `eval` or `usage` imports `hono` or that transport.
- What it changes:
  - Step 3's reason for `npm run test:smoke` ("hono sits under the MCP SDK the Worker bundles")
    is false. Keep the gate, because the round plan asks for it, and drop the reason.
  - The first risk (a behavior change in the SDK's HTTP transport) does not apply to the Worker.
  - "Merge, then deploy together with item 0.2": this item changes no Worker bytes, so it needs
    no deploy. Say so in `REPORT.md`, which must state whether a deploy is needed. The round
    plan's "Ends in a merge and a deploy" is overtaken by this evidence; the deploy belongs to
    0.2.
  - The five advisories are not reachable in production. The commit and pull request should
    describe a lockfile hygiene fix, not a fix to a served vulnerability.
- Change: replace the risk with a direct check. The bundle is byte-reproducible (two dry-run
  builds gave the same hash). After the bump, `sha256sum dist/server.js` should equal the
  baseline `d6a5a7a0dc9b80c5a0ddfb474a853eb02f5dd79142a8a8e3f578a01c89362bdb`. Record the result
  in `EXEC.md`. If the hash differs, that is a finding to explain before shipping, not a pass.

### 3. Should: the stop rule needs a way to attribute a gate failure, and the box is off-engine

- Evidence: `package.json` `engines` is `>=24 <25`, `.nvmrc` and CI use Node 24, and agentpc has
  only Node v26.13.0 on `PATH` (npm prints `EBADENGINE`, a warning). The plan's second risk names
  the npm version only.
- The lockfile is not affected: see "Confirmed" below. The gates are: they run on a Node major
  the repo does not support, so a local failure may be environmental.
- Change: record the Node version in `EXEC.md`. On a local gate failure, re-run that one gate
  with the old lockfile (`git checkout 2623fcc2 -- package-lock.json`, `npm ci`) before applying
  the stop rule; a failure that reproduces there is reported, not attributed to the bump. Treat
  the pull request's CI run on Node 24 as the binding gate run.

### 4. Nit: four moderate advisories and one low, not five moderate

- Evidence: `npm audit --json` rates GHSA-3gg2-335m-rxc6 (the `css` helper) low and the other
  four moderate. The package-level severity is moderate, which is what #428 shows.
- Change: write "five advisories (four moderate, one low)" in the plan, commit and pull request.

### 5. Nit: step 4 and the write set disagree about the ledger row

- Evidence: the write set lists the lead's row in `.agents/rounds/2026-11-16-next-phase.md`;
  step 4's commit list does not. The lead brief has the lead add that row in its verify step,
  after execution, and also write `REPORT.md` in the item folder.
- Change: state that the executor's commit is `package-lock.json` plus the item folder, and that
  the lead commits the ledger row and `REPORT.md` afterwards.

## Confirmed, no change needed

- `npm audit`: one package, `hono` `<=4.13.15`, five advisories, "fix available via
  `npm audit fix`", exit 1. It matches #428, which is open with the `dependency-audit` label.
- `npm ls hono --all`: one `hono@4.13.14`, under `@modelcontextprotocol/sdk@1.32.1` (`^4.11.4`)
  and deduped under `@hono/node-server@2.1.6` (peer `^4 || ^5.0.0-0`). `src/` does not import it.
- `npm audit fix --dry-run`: `change hono 4.13.14 => 4.13.19`, nothing added or removed. The
  registry's `latest` is `4.13.19`.
- Exact diff: I ran `npm audit fix --package-lock-only` on a copy of `package.json` and
  `package-lock.json` in a scratch directory outside the repository. The result differs from the
  committed lockfile in three lines (`version`, `resolved`, `integrity` of `node_modules/hono`),
  `package.json` is unchanged, and `npm audit` on the copy reports 0 vulnerabilities. Step 1's
  expected diff is right under this npm and Node.
- `overrides` holds `miniflare` and the two `@cloudflare/vitest-pool-workers` pins only.
- Gate set: `typecheck`, `test`, `build`, `test:smoke`, `secrets:scan -- --tree`, plus `npm audit`
  exit 0. That is the `AGENTS.md` baseline plus the round plan's smoke lane. No `CONTRIBUTING.md`
  area gate applies to a lockfile-only change.
- Stop rule: a superset of the round plan's (major version or `overrides`). Sound once finding 3
  is adopted.
- Closing #428: `dependency-audit.yml` runs on a push to `main` that touches `package-lock.json`
  and closes the open issue when there are no findings. `Refs #428` is the right keyword.
- Nothing is in excess. No further review is required for this change.
