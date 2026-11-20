# Contributing to Stellar Raven

Issues and pull requests are welcome. See [README.md](./README.md) for an overview.

## Where to send what

| You found | Send it to |
|---|---|
| A bug or gap in Raven | A GitHub issue or pull request |
| Wrong or missing data in Lumenloop, Stellar Light/Scout, Stellar Docs, stellar.org, or an upstream skill | A GitHub issue (recorded under [`improvements/`](./improvements/README.md) and filed with the service owner) |
| An upstream fix for a recorded finding | The **Upstream improvement ready for verification** issue form |
| A security problem | [SECURITY.md](./SECURITY.md) — never open a public issue |
| A question | `#raven` in the [Stellar Developers Discord](https://discord.gg/stellardev) |

## Set up

Follow steps 1–3 of [Run locally](./README.md#run-locally).

- `npm ci` installs the pre-commit secret-scanning hook (`scripts/git-hooks/pre-commit`).
- Placeholder `.dev.vars` values suffice for typecheck and tests; without `.dev.vars`, `Env` lacks
  secret members and typecheck fails.

## Checks

Run the baseline bare (pipes hide exit status) before pushing:

```sh
npm run typecheck
npm test
npm run build
npm run secrets:scan -- --tree
```

Run the matching CI gate for any area you touch:

| Area | Command |
|---|---|
| `src/executor/` or `src/demo/` | `npm run test:smoke` |
| `eval/` | `npm run eval:selftest`, `npm run eval:qa:lint -- --stale --enforce-floors`, `npm run eval:qa:register -- --check`; for live-case changes, also `node eval/qa/lint-corpus.mjs --live-contract eval/qa/corpus/live/live-cases.json --since "$(git merge-base HEAD origin/main)"` |
| Catalog, routing, or skills | `npm run eval:routing -- --gate` |
| `ecosystem-skills/` pins | `node scripts/check-pin-review.mjs --base origin/main` |
| `improvements/` | `npm run improvements:lint` |
| `usage/` | `npm run build:usage`, `npm run test:usage-report`, `npm run build:usage-report` |
| Any generated file | Rerun its generator ([`scripts/README.md`](./scripts/README.md)); CI rejects out-of-sync outputs |

See [`test/README.md`](./test/README.md) for test suites and [`eval/EVALS.md`](./eval/EVALS.md) for
eval gates. For an upstream-fix handoff PR, append `?template=upstream-improvement-handoff.md` to
the new PR URL ([template](./.github/PULL_REQUEST_TEMPLATE/upstream-improvement-handoff.md)).

## Rules

Every change must follow [AGENTS.md "Hard rules"](./AGENTS.md#hard-rules): rebuild generated files
via their scripts, keep secrets host-side, never commit partner-tier details or production counts,
and keep the design forward-only. Coding agents read [`AGENTS.md`](./AGENTS.md) first.
