# Item 0.1 execution: fix `hono` (#428)

Executor: Claude Sonnet 5.5, worktree `/home/tyler/code/raven-wt/np-0.1`, branch `np/0.1-hono`
from `2623fcc2`. Stop rule did not fire.

## Environment

Node v26.13.0, npm 11.20.0 (off-engine: the repo pins Node 24, so `npm` printed `EBADENGINE`
warnings). CI on Node 24 is the binding gate run.

## Diff

`package-lock.json` only, 3 lines of the `node_modules/hono` entry:

- `version` 4.13.14 -> 4.13.19
- `resolved` -> `hono-4.13.19.tgz`
- `integrity` -> `sha512-KmXvQAXwcAHV+muzbIwoJ23niEB5nMoDVr9WcRkU8mvjUECm/1+7v4Jgp7P7a+H6MLFrh+vXrGonGrGS+RQfkA==`

`npm audit fix` (no `--force`) said "changed 1 package". No `package.json`, `overrides`, or other
package change.

## Gates (each run bare)

- Setup: names-only stub `.dev.vars` (mode 600, untracked, ignored), `npm run typegen`, baseline
  `npm run typecheck` exit 0 and `npm run build` exit 0.
- `npm ls hono --all`: one `hono@4.13.19`, deduped under `@hono/node-server@2.1.6`. Exit 0.
- `npm audit`: found 0 vulnerabilities. Exit 0.
- `npm run typecheck`: exit 0.
- `npm test`: exit 0. 164 files passed (5 skipped), 3608 tests passed, 3 expected fail, 5 skipped.
- `npm run build`: exit 0. Run with output redirected to `/dev/null`, not piped, so the exit
  status is the build's own.
- `npm run test:smoke`: exit 0. 9 files, 144 tests passed.
- `npm run secrets:scan -- --tree`: clean.

## Bundle hash (`dist/server.js`, sha256)

- Before (step 0): `d6a5a7a0dc9b80c5a0ddfb474a853eb02f5dd79142a8a8e3f578a01c89362bdb`
- After the bump:  `d6a5a7a0dc9b80c5a0ddfb474a853eb02f5dd79142a8a8e3f578a01c89362bdb`

Identical, and equal to the reviewer's measurement. No served byte changes; no deploy needed.

## Deviations

None. No gate failed, so the old-lockfile attribution step was not needed.
