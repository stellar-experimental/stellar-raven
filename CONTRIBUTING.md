# Contributing to Stellar Raven

Issues and pull requests are welcome. [README.md](./README.md) describes the project.

## Where to send what

| You found | Send it to |
|---|---|
| A bug or a gap in Raven | A GitHub issue or a pull request |
| Wrong or missing data in Lumenloop, Stellar Light/Scout, Stellar Docs, or an upstream skill | A GitHub issue. Raven records it as a finding in [`improvements/`](./improvements/README.md) and files it with the service owner. |
| An upstream fix for a recorded finding | The **Upstream improvement ready for verification** issue form |
| A security problem | [SECURITY.md](./SECURITY.md). Do not open a public issue. |
| A question | The `#raven` channel in the [Stellar Developers Discord](https://discord.gg/stellardev) |

## Set up

Follow steps 1 to 3 of [Run locally](./README.md#run-locally) in the README.

- `npm ci` also installs the pre-commit hook (`scripts/git-hooks/pre-commit`), which blocks a
  commit that contains a secret.
- Placeholder values in `.dev.vars` are enough for typecheck and tests. Without `.dev.vars`, the
  generated `Env` type has no secret members and typecheck fails.

## Checks

A pull request must pass CI. Run the baseline before you push:

```sh
npm run typecheck
npm test
npm run build
npm run secrets:scan -- --tree
```

Run each command bare; a pipe hides its exit status. CI also runs the gates below. Run the
matching one when you change its area:

| Area | Command |
|---|---|
| `src/executor/` or `src/demo/` | `npm run test:smoke` |
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

The "Hard rules" in [`AGENTS.md`](./AGENTS.md#hard-rules) bind every change, whoever writes it:
generated files come from their scripts, secrets stay on the host, partner-tier details and
production counts are never committed, and the design is forward-only. Coding agents read
[`AGENTS.md`](./AGENTS.md) first.
