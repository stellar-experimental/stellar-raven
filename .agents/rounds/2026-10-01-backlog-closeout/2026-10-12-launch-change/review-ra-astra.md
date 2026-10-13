# Review RA

Reviewed commit `830a35b4` against `63647bfc`.
I checked the implementation, installed package source, documentation, and offline tests.
I made no model call or upstream call.
I started no server and ran none of the prohibited commands.

## Findings by severity

### P1: A lost listener does not stop the next paid attempt

Evidence: `eval/qa/paired-collection-supervisor.mjs:979` checks listeners only when releasing a row or the postflight.
`eval/qa/run-qa.mjs:1872` checks cancellation before authorizing each attempt, but it does not check listeners.
`eval/qa/run-qa.mjs:1907` immediately starts another attempt after an eligible transport failure.

Thus a server can lose its listener during an attempt, and the runner can authorize a paid retry.
The supervisor receives no completed-row message before that retry.
It therefore cannot detect the loss through the new check.
This is a missing check between attempts, beyond the unavoidable interval between a check and a call.

P6 has the same phase-level limit.
`.agents/rounds/2026-10-01-backlog-closeout/paired-launch.mjs:212` checks listeners once before P6.
`eval/qa/run-p6-judge-self-test.mjs:206` then runs seven paid calls without another listener check.
A server loss during P6 does not stop its remaining calls.

Add a local listener check before each new paid attempt while servers must remain available.
Include retries and successive P6 calls.
Preserve shared cancellation, the recorded reason, and the rule against restarting servers.
Add offline tests that lose a listener after the first attempt and prohibit the next paid invocation.

The documentation also overstates this guarantee.
`.agents/TODO.md:688` and `.agents/rounds/2026-10-01-backlog-closeout/paired-run-sheet.md:416` promise a stop before the next paid call.
The amendment acknowledges retries at line 436, but that exception contradicts the promise and the brief.
The amendment omits the P6 interval and the interval between sequential listener checks and row release.
State the remaining intervals after fixing the missing checks.

### P2: The toolchain check accepts an unrecorded esbuild binary override

Evidence: `.agents/rounds/2026-10-01-backlog-closeout/paired-server-toolchain.mjs:30` rejects only `MINIFLARE_WORKERD_PATH`.
Lines 34 and 41 record the esbuild package identity, without checking `ESBUILD_BINARY_PATH`.
The launcher inherits the environment at `.agents/rounds/2026-10-01-backlog-closeout/paired-launch.mjs:22`.

The installed esbuild reads `ESBUILD_BINARY_PATH` at `node_modules/wrangler/node_modules/esbuild/lib/main.js:1893`.
It selects that executable when the path exists at line 1975.
Thus the launch can use an external executable while the plan identifies the candidate's installed esbuild package.
A relative override also depends on each server's working directory.

I called `assertSharedServerToolchain` with and without `ESBUILD_BINARY_PATH=./custom-esbuild`.
Both calls passed and returned identical records.
This check read files only; it did not execute esbuild.

Reject `ESBUILD_BINARY_PATH`, as the code already rejects the workerd override.
Alternatively, resolve and record the actual executable for each server working directory.
Add an offline regression test for this override.

## Answers to the review questions

### 1. Toolchain reuse and identity

The reuse method works for the normal installed package tree, subject to finding P2.
`node_modules/wrangler/bin/wrangler.js:27` starts its own `wrangler-dist/cli.js` and inherits the working directory.
`node_modules/wrangler/wrangler-dist/cli.js:17` imports esbuild and miniflare from Wrangler's package tree.
`node_modules/miniflare/dist/src/index.js:116643` imports workerd from miniflare's package tree.
Its runtime command uses that package's default export at line 116877.
Its spawn preserves the working directory at line 116980.

Wrangler finds the config from the working directory at `node_modules/wrangler/wrangler-dist/cli.js:3539`.
It resolves the entry and project root from that config at line 204062.
Its bundle options use the source entry and project root at line 189926.
Source imports therefore retain baseline dependency resolution.
Wrangler's injected helpers and compatibility plugins come from the shared toolchain, as expected for this treatment change.
I found no command that replaces the baseline install or config.

The local identity check reported these versions:

| Package | Version |
| --- | --- |
| Wrangler | `4.149.0` |
| miniflare | `5.20261006.1-alpha` |
| workerd | `1.20261006.1` |
| esbuild | `0.28.2` |

The workerd binary SHA-256 was `ddafaa2a1c1f68ffad60f843c8ddaf46fa855a7da3391ce9fea0702ac14c5ef8`.
The helper correctly selected Wrangler's nested esbuild, rather than the root package.
Missing packages, unequal records, or a workerd override stop the check.
`assemble-paired-plan.mjs:167` compares the recorded identity with a fresh identity.
`assemble-paired-plan.mjs:94` includes it in the plan.
`eval/qa/paired-collection-supervisor.mjs:95` hashes the complete canonical plan.
The record therefore has signed hash coverage, but P2 limits its accuracy.

### 2. Lost-port behavior and safe failure

Both specified outcomes stop the next row when they leave no listener before the check.
The checks also reject a changed listener process.
The launcher throws and enters cleanup; the supervisor records cancellation and releases no row.
I found no added restart path.
Wrangler's own internal runtime restart remains possible before these checks detect a change.

Finding P1 prevents the stronger next-paid-call guarantee.
The checks inspect listening sockets; they do not test whether those sockets accept connections.
A server can fail after its individual check and before row release.
The four checks run sequentially, so this interval includes the later checks.

`eval/lib/bound-server-identity.mjs:3` gives each local command a 10,000 ms timeout.
A slow or failed `lsof` or `git` command throws, even when the server remains healthy.
That false stop is safe for spending: the supervisor releases no new row and cancels both arms.
The implementation does not retry the check or restart a server.
The run sheet should state this possible false stop and the socket-check limit.

### 3. Offline test results

I ran these commands directly, without pipes:

| Command | Result |
| --- | --- |
| `node_modules/.bin/vitest run test/qa-paired-launch.test.mjs test/qa-paired-collection-supervisor.test.mjs` | Exit 1; 131 passed, 29 failed. |
| `node_modules/.bin/vitest run test/qa-paired-launch.test.mjs -t 'paired server toolchain\|paired server listener stop\|paired plan assembly'` | Exit 0; 13 passed, 46 skipped. |
| `node_modules/.bin/vitest run test/qa-paired-collection-supervisor.test.mjs` | Exit 0; 101 passed. |

The full run encountered `spawnSync ps EPERM` in existing process-management tests.
Some dependent fixtures then timed out while waiting for their files.
The sandbox prevents those checks here; I cannot confirm the full launch test file passes.

The new tests verify fake package resolution, identity rejection, listener failures, cancellation, and plan hash coverage.
They use no real server or network.
They do not prove a live baseline launch or source-bundle equivalence.
They also lack the retry, P6, and esbuild-override cases described above.

### 4. Documentation and treatment

The amendment and TODO correctly describe reuse, its reason, the treatment change, and the required fresh signed plan.
The amendment correctly distinguishes the earlier installation experiment from the untested reuse launch.
Their stop guarantee needs the corrections in finding P1.
The amendment should also state the socket-check limit and safe false-stop behavior.

CODE: CHANGES: Check listeners before each new paid attempt, reject esbuild binary overrides, and correct the stated stop guarantee.
