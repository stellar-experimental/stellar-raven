# Contributing to Stellar Raven

Issues and pull requests are welcome. This guide gives the setup, the checks, and the rules that a
change must follow. [README.md](./README.md) describes the project.

## Where to send what

| You found | Send it to |
|---|---|
| A bug or a gap in Raven | A GitHub issue or a pull request |
| Wrong or missing data in Lumenloop, Stellar Light/Scout, Stellar Docs, or an upstream skill | A GitHub issue. Raven records it as a finding in [`improvements/`](./improvements/README.md) and files it with the service owner. |
| An upstream fix for a recorded finding | The **Upstream improvement ready for verification** issue form |
| A security problem | [SECURITY.md](./SECURITY.md). Do not open a public issue. |
| A question | The `#raven` channel in the [Stellar Developers Discord](https://discord.gg/stellardev) |

## Set up

Use Node 24 (`.nvmrc`). Follow [Run locally](./README.md#run-locally) in the README:

1. `npm ci`. It also installs the pre-commit hook (`scripts/git-hooks/pre-commit`), which blocks
   commits that contain secrets.
2. Create `.dev.vars` with the names from the `.dev.vars` step in
   [`ci.yml`](./.github/workflows/ci.yml). Placeholder values are enough for typecheck and tests.
3. `npm run typegen`. Without `.dev.vars`, the generated `Env` type has no secret members and
   typecheck fails.

## Checks

A pull request must pass CI. Run the baseline before you push:

```sh
npm run typecheck
npm test
npm run build
npm run secrets:scan -- --tree
```

Run `npm run test:smoke` when you change `src/executor/` or `src/demo/`. CI also runs these gates.
Run the matching one when you change its area:

| Area | Command |
|---|---|
| `eval/` | `npm run eval:selftest`, `npm run eval:qa:lint -- --stale --enforce-floors`, `npm run eval:qa:register -- --check` |
| Catalog, routing, or skills | `npm run eval:routing -- --gate` |
| `ecosystem-skills/` pins | `node scripts/check-pin-review.mjs --base origin/main` |
| `improvements/` | `npm run improvements:lint` |
| `usage/` | `npm run test:usage-report` |
| Any generated file | Rerun its generator. [`scripts/README.md`](./scripts/README.md) lists them. CI fails when a generated file is out of sync. |

[`test/README.md`](./test/README.md) maps the test suites, and
[`eval/EVALS.md`](./eval/EVALS.md) describes the evaluation gates.

A pull request that hands back an upstream fix for a recorded finding can use the
[upstream-improvement handoff template](./.github/PULL_REQUEST_TEMPLATE/upstream-improvement-handoff.md).
Add `?template=upstream-improvement-handoff.md` to the new pull request URL to apply it.

## Rules

- Never edit a generated file by hand. Run its script.
- The generated manifest (`catalog/manifest.json`) is the exposed surface. Model code never owns
  endpoints, arguments, authentication, or exposure.
- Secrets stay on the host. Never print, commit, or pass a credential to the sandbox.
- Never commit partner-tier Lumenloop details or production usage counts.
- Prefer the best current design. Do not add compatibility shims or dual formats.

[`AGENTS.md`](./AGENTS.md) holds the full rules. Coding agents must read it first.
