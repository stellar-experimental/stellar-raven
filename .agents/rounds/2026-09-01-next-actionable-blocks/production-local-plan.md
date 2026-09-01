# Production local plan — 2026-09-01

Lane: production local plan. Worker: Claude Fable 5, high.
Scope: compare local revisions, then design the read-only production query plan.

## 1. Method and limits

This report uses local git objects and repository files only.
It made no request to GitHub, Cloudflare, Raven, Wrangler, or any live service.
It ran no test, build, typecheck, or Wrangler command.
It changed no file except this report.

`origin/main` means the local tracking ref at `981578552a40ccf7cb847ef80a7f96c9edb8802f`.
This lane did not fetch, so the remote can already be ahead of that ref.

All times below are UTC. Git stores them at `-0400`; this report adds four hours.

## 2. Local revision map

| Ref | Commit | Committed (UTC) | Role |
| --- | --- | --- | --- |
| Recorded deploy candidate | `0133653f9953ece6181a7771d15f399bdcbacc9b` | 2026-08-28 13:37:50 | Last commit before the 2026-08-28 deployment record |
| Docs close | `c9b99f7f4582a412a0292c070a2ec2271923833d` | 2026-08-28 13:41:51 | Records the deployment; ledger only |
| Grok pin (#89) | `17291e2278f433e054c783d61039f3b029074dcd` | 2026-08-28 20:32:53 | Changes `src/demo/model-config.ts` |
| NEXT rewrite (#90) | `ccaed27` | 2026-08-28 21:10:25 | First mention of Version ID `6282fe2a…` |
| PR #99 merge | `3c7f0e544e8a9417bcc79ddcdf5508f5650b141c` | 2026-08-30 12:57:53 | Playground limit, tool-loop test, title cleanup |
| `origin/main` | `981578552a40ccf7cb847ef80a7f96c9edb8802f` | 2026-09-01 14:56:49 | PR #111 |
| Stacked branch base | `9d4362f73ae51e495ac75ee6160593fa2738ef03` | 2026-09-01 16:29:47 | PR #112, docs only |

At the Fable lane snapshot, branch `eval/answering-agent-environment-pin` was at `9d4362f`.
The working tree then had three modified files: `eval/qa/README.md`, `eval/qa/run-qa.mjs`, and
`test/qa-harness-preconditions.test.mjs`. It also had this round's untracked ledger files.
None of those files enters the Worker bundle.

### Bundle input set

The deploy preflight bundles the working tree. The bundle inputs are `src/`, `catalog/`, `specs/`,
`wrangler.jsonc`, `package.json`, and `package-lock.json`. `ecosystem-skills/MANIFEST.json`
reaches the bundle only through the committed `catalog/manifest.json`.

### Bundle-relevant deltas

`git diff --stat 0133653 3c7f0e5^ -- src catalog specs wrangler.jsonc package.json package-lock.json`

- `src/demo/model-config.ts`: `DEMO_GROK_CONTROL_MODEL` changed from `xai/grok-4.5` to
  `xai/grok-4.6` in `17291e2` (#89).
- `package.json`: two eval script entries. Script entries do not change the bundle.

`git diff --stat 3c7f0e5 9815785 -- src catalog specs wrangler.jsonc package.json package-lock.json`

- `package.json`: eight eval script entries. No bundle change.

`git diff --stat 9815785 9d4362f -- src catalog specs wrangler.jsonc package.json package-lock.json`

- Empty. The stacked base is bundle-identical to `origin/main`.

### Bundle-equivalence classes

| Class | Commit range on `origin/main` | Page CSP script hash | `maxUserMessageChars` | Grok control model |
| --- | --- | --- | --- | --- |
| P | `d08212f` … `c9b99f7` (includes `0133653`) | `sha256-J5utxnf3Yyxow6cDGr6zPQ9lyVj1Y4JUbUBOYCGDJus=` | 4000 | `xai/grok-4.5` |
| Q | `17291e2` … `b53f62d` | `sha256-J5utxnf3Yyxow6cDGr6zPQ9lyVj1Y4JUbUBOYCGDJus=` | 4000 | `xai/grok-4.6` |
| R | `3c7f0e5` … `9d4362f` | `sha256-ZB8MB5SKhRnJx0CaegzHU7J/JhdbqAhUdhGgxaO8z+o=` | 8000 | `xai/grok-4.6` |

The CSP hash is the `DEMO_SCRIPT_SHA256` constant in `src/demo/page.ts:909`.
`DEMO_PAGE_HEADERS` (`src/demo/page.ts:911-920`) sends it in `content-security-policy` on every
`GET /playground` response. The locked page and the chat page share the header
(`src/server.ts:182-188`). `test/demo-page.test.ts:31-36` recomputes the hash from the rendered
script, so the constant tracks the shipped script exactly.

## 3. Recorded deployment state

The repository holds two different Version IDs for the same 2026-08-28 deployment.

| Version ID | Source | Context |
| --- | --- | --- |
| `2dc2afcb-2449-4553-8b65-a6c082950a0d` | `.agents/rounds/2026-08-28-live-drift-86.md:59-66,578-579` | `npm run deploy` after CI passed for repair commit `0133653`; three routes returned `200`; unauthenticated `POST /mcp` returned `401` |
| `6282fe2a-54d8-471e-9f0a-0a2565110af1` | `.agents/NEXT.md:11-12`, `.agents/TODO.md:16-17`; introduced by `ccaed27` (#90) | "deployed 2026-08-28 from `main` HEAD"; no ledger records this deployment |

No round ledger dated 2026-08-28 to 2026-08-31 records a second `npm run deploy`.
`.agents/rounds/2026-08-28-eval-block2.md` records the Grok pin change but no deployment.

Two readings fit the local evidence:

1. One deployment happened at about 13:38 to 13:41 UTC. Production is class P. One of the two IDs
   is a transcription error.
2. A second deployment happened between 13:41 and 21:10 UTC without a ledger entry. If it shipped
   `17291e2`, production is class Q.

Local evidence cannot select a reading. The live read must return both IDs, or show that one does
not exist.

## 4. PR #99 paths and material behavior

Merge commit `3c7f0e5`, 12 files, +439/-97.

### Worker bundle paths

| Path | Material behavior |
| --- | --- |
| `src/demo/budget.ts` | `DEMO_CAPS.maxUserMessageChars` changed from 4000 to 8000. The comment now says the server mirrors "composer validation", not `maxlength`. |
| `src/demo/chat.ts` | `parseChatBody` now returns `{ messages }`, `{ error: "message_too_long" }`, or `null`. An oversized user message returns `400 message_too_long` with hint "Each user message must contain at most 8000 characters." Before PR #99 the server silently cut user content at 4000 characters. The check runs before the throttle, so a rejected request burns no chat budget and makes no model call. The stream `done` frame maps SDK finish reason `other` to `incomplete`. Fallback and tool-budget branches use the same `finishReason` variable. |
| `src/demo/page.ts` | New exported `DEMO_COMPOSER_LIMIT_CORE` with `updateComposerLimitState` and `composerSubmission`. The textarea lost `maxlength` and gained `aria-describedby="composer-count"`. A `#composer-count` element shows "N / 8,000 characters" and the exact excess. Over the limit: Send disabled, `aria-invalid="true"`, red count, one screen-reader announcement. Submit over the limit sets an error note and sends nothing. `DEMO_SCRIPT_SHA256` moved from `sha256-J5ut…` to `sha256-ZB8M…`. |

### Non-bundle paths

| Path | Material behavior |
| --- | --- |
| `scripts/improvements-lib.mjs` | `oneLineTitle` strips leading blockquote markers before flattening. |
| `improvements/INDEX.md` | Regenerated; `sd-036` title lost its `>` prefix. |
| `ideas/shareable-durable-playground-sessions.md` | Records that the 8,000-character contract shipped. |
| `test/demo-budget.test.ts` | Cap fixture 4000 → 8000. |
| `test/demo-chat.test.ts` | Real `ai` tool loop with a model stub; accepts 7999 and 8000 characters; rejects a bypassed 8001-character message; covers `done` with reason `incomplete`. |
| `test/demo-composer-limit-core.test.ts` | New; runs the composer core in a DOM stub. |
| `test/demo-page.test.ts` | Asserts the new markup and the `userMessageLimit` constant. |
| `test/improvements-resolve.test.ts` | Covers the blockquote strip. |
| `test/playground-eval-contract.test.ts` | Cap fixture 4000 → 8000. |

### Later local changes that touch PR #99 paths

`git log 3c7f0e5..9d4362f -- <all twelve paths>` returns four commits: `b59517d` (#104),
`35b5a38` (#105), `0916e09` (#106), `1bfb983` (#107). All four change only
`improvements/INDEX.md` (+3/-1, regenerated). No later commit touches the three `src/demo` files,
`scripts/improvements-lib.mjs`, or any of the six test files.

SHA-256 at `9d4362f`:

- `src/demo/budget.ts` `17e6112654e957554c23a4eb0de50c3c711fb8d2a6bea118c9f7f9774ab5db29`
- `src/demo/chat.ts` `f504ce4c177f6eb79877b940301da04c22e965b44fee00b1c20d8cf447535b53`
- `src/demo/page.ts` `68dc9a477966cef7560c673cc8294e68102b0f5b2b620b6eb6bdd93845eb123b`
- `scripts/improvements-lib.mjs` `7a126ed9b1556d19787b3aaaefcffba2f624273f6c8209830b85e28c17ab3221`

### Documentation drift found

The `ARCHITECTURE.md:771` row was repaired in this round. It now describes the 8,000-character
limit and rejection behavior. This lane did not edit `ARCHITECTURE.md`.

## 5. What local evidence can and cannot establish

Local evidence establishes:

- The exact content of PR #99 and its twelve paths.
- That no source change after PR #99 touches any PR #99 path.
- That the only bundle-relevant source changes from `0133653` to `9d4362f` are four files:
  `src/demo/budget.ts`, `src/demo/chat.ts`, `src/demo/page.ts`, and `src/demo/model-config.ts`.
- That `origin/main` `9815785` and the branch base `9d4362f` build the same bundle.
- That `npm run deploy` refuses a dirty tree or a `HEAD` that differs from `origin/main`
  (`scripts/deploy-preflight.mjs`). The current branch and tree would fail that preflight.
- The CSP fingerprint that separates class R from classes P and Q.
- That the two recorded Version IDs conflict and only one has a ledger.

Local evidence cannot establish:

- Which Version ID serves `raven.stellar.org` now.
- Whether either recorded Version ID exists in the Cloudflare account.
- Whether a deployment used `DEPLOY_ALLOW_UNCLEAN=1`. Such a deployment maps to no commit.
- Whether a deployment happened after 2026-08-28 outside the repository record.
- Secret, binding, KV, R2, route, or edge-propagation state.
- Whether the live bundle bytes equal any local `npm run build` output.

## 6. Read-only production query plan (owner authorization 1)

Goal: read the live Worker version and map it to a source revision. No write, no deploy, no
edit, no login flow, no paid model call.

### 6.1 Preferred source: Wrangler version and deployment lists

Use the pinned Wrangler (`wrangler` `4.124.0` in `devDependencies`) through `npx`.
Bind the owning account profile first (`README.md` "Development": `wrangler auth list`,
`wrangler auth activate <name> .`). `wrangler.jsonc` sets the Worker name, so no `--name` flag is
needed from the repository root. Confirm each command and flag with `--help` before the run; this
lane did not execute Wrangler.

```sh
npx wrangler deployments status
npx wrangler deployments list
npx wrangler versions list
npx wrangler versions view <version-id>
```

Fields to record:

- Active deployment: deployment ID, `Created`, `Source`, and each Version ID with its traffic
  percentage. Expect one version at 100%.
- For each of the two recorded IDs and the active ID: Version ID, version number, `Created` (UTC),
  `Source` (expect `Upload`), `Tag`, `Message`.
- `versions view` detail: `compatibility_date` (expect `2026-06-11`), compatibility flags (expect
  `nodejs_compat`, `global_fetch_strictly_public`), binding names (expect `LOADER`, `AI`,
  `OAUTH_KV`, `ARTIFACTS`), and the cron trigger `7 * * * *`. These confirm the Worker identity.
  They do not identify the commit.

Expected outputs:

- Reading 1 from section 3: exactly one of `2dc2afcb…` or `6282fe2a…` exists, created about
  2026-08-28 13:38 to 13:45 UTC, and is active.
- Reading 2: both exist; `6282fe2a…` is newer and active.
- Any other active ID means an unrecorded deployment. Record it and stop; do not deploy.

### 6.2 Alternative source: Cloudflare REST API through the Cloudflare API MCP

Use `GET` only:

- `GET /accounts/{account_id}/workers/scripts/stellar-raven-codemode/deployments`
- `GET /accounts/{account_id}/workers/scripts/stellar-raven-codemode/versions`
- `GET /accounts/{account_id}/workers/scripts/stellar-raven-codemode/versions/{version_id}`

Record `id`, `number`, `metadata.created_on`, `metadata.source`,
`annotations["workers/message"]`, `annotations["workers/tag"]`,
`annotations["workers/triggered_by"]`, `resources.script_runtime.compatibility_date`, and the
binding names. Do not record `author_email` or the account ID. Confirm field names against the
response; this lane did not verify them live.

### 6.3 Fallback A: telemetry version field

Use the `cloudflare-observability-review` workflow. First call `telemetry/keys` for the service
`stellar-raven-codemode` and find the script-version key. The expected name is
`$workers.scriptVersion.id`; confirm it from the keys result before use. Then query:

- Filters: `$metadata.service = "stellar-raven-codemode"`, `$metadata.type = "cf-worker-event"`.
- Group by the version key. Calculation: count.
- Windows: consecutive 6-hour slices over the last 7 days. Never one flat multi-day query.

Expected output: one Version ID per slice, or a change point that dates an unrecorded deployment.
Retention is at most seven days, so this view reaches back only to about 2026-08-25.

### 6.4 Fallback B: zero-credential HTTP fingerprint

```sh
curl -sS -D - -o /dev/null https://raven.stellar.org/playground
curl -sS https://raven.stellar.org/health/skills
```

Record from the first response: status (expect `200`), `date`, `cf-ray`, and the
`script-src 'sha256-…'` value in `content-security-policy`.
Map it with the class table in section 2:

- `J5utxnf3…` → class P or Q. PR #99 is not deployed.
- `ZB8MB5SK…` → class R. PR #99 is deployed.
- Any other value → an unknown bundle. Stop and investigate.

Record from `/health/skills`: `ok`, `checkedAt`, `checked`, `ms`, `error`
(`src/skills/canary.ts:169-215`). A `checkedAt` older than three hours means the canary cron is
not running on the live version.

`GET /playground` mints no state. Do not request `/playground/login`; it parks single-use state in
KV. Do not `POST /playground/chat`; it needs a session cookie and can reach a paid model.
Both probes appear in production logs as ordinary invocations.

Fallback B gives the class, not the Version ID. It cannot separate P from Q.

### 6.5 Map a live Worker Version ID to a source revision

1. Read the version's `created_on` (UTC) and its `workers/tag` and `workers/message` annotations.
2. If an annotation carries a commit SHA, use it. The current `deploy` script passes no tag or
   message, so past versions carry none.
3. Otherwise apply the preflight invariant. `npm run deploy` runs `scripts/deploy-preflight.mjs`,
   which fetches `origin/main` and refuses unless the tree is clean and `HEAD == origin/main`.
   The deployed source is therefore the first-parent `origin/main` commit whose committer time is
   the latest time at or before `created_on`:
   `git log --first-parent origin/main --until="<created_on>" -1 --format='%H %ci %s'`.
4. Reduce the commit to its bundle-equivalence class with
   `git diff --quiet <commit> <class-representative> -- src catalog specs wrangler.jsonc package.json package-lock.json`.
   An empty diff means the same bundle.
5. Cross-check the class with the CSP fingerprint from 6.4 and the telemetry version from 6.3.
6. Record the mapping as `Version ID → commit → class` with the evidence used at each step.
7. The mapping fails if `DEPLOY_ALLOW_UNCLEAN=1` was used, or if `created_on` falls before the
   nearest commit's push. Record `unknown` and do not guess.

Expected result for reading 1: `created_on` about 2026-08-28 13:38 to 13:45 UTC → `0133653` or
`c9b99f7` → class P.
Expected result for reading 2: `created_on` between 20:33 and 21:10 UTC → `17291e2` → class Q.

### 6.6 Privacy rules for the live read

- Report Version IDs, deployment IDs, UTC timestamps, commit SHAs, paths, statuses, and Ray IDs.
- Do not write the Cloudflare account ID, any API token, author email, IP address, or IP-derived
  field into the repository. The repository is public.
- Redact `author_email` to a role such as "the owner".
- Do not paste raw telemetry rows. Record grouped counts and the fields named above.
- Never print `.env`, `.dev.vars`, or Wrangler credential files.

### 6.7 Recommendation for future deployments

Pass a commit identifier when Wrangler supports it: `npm run deploy -- --tag <short-sha>` or
`--message "main <short-sha>"`. Confirm the flags with `npx wrangler deploy --help` first.
This removes step 3 of the mapping for every later version. It needs no code change.

## 7. Local comparison, smoke, and baseline (free, before any deployment proposal)

Run from a clean checkout of `origin/main` after a fetch. Run each gate bare; do not pipe.
This lane ran none of them.

Local comparison:

```sh
git fetch origin main
git diff --stat 0133653 origin/main -- src catalog specs wrangler.jsonc package.json package-lock.json
git log --format='%h %ci %s' 3c7f0e5..origin/main -- src/demo scripts/improvements-lib.mjs
git show origin/main:src/demo/page.ts | grep -o 'DEMO_SCRIPT_SHA256 = "[^"]*"'
git show origin/main:src/demo/budget.ts | grep -o 'maxUserMessageChars: [0-9]*'
```

Expected: only the four `src/demo` files plus `package.json` scripts; the CSP hash `ZB8MB5SK…`;
`maxUserMessageChars: 8000`.

Narrow tests:

```sh
npx vitest run test/demo-chat.test.ts test/demo-page.test.ts test/demo-composer-limit-core.test.ts test/demo-budget.test.ts test/playground-eval-contract.test.ts test/demo-model-config.test.ts
```

Baseline (`AGENTS.md` "Commands and verification"):

```sh
npm ci
# create .dev.vars with the CI names from .github/workflows/ci.yml, values irrelevant
npm run typegen
npm run typecheck
npm test
npm run build
npm run test:smoke
npm run secrets:scan -- --tree
```

`npm run test:smoke` is required because the change touches `src/demo`. It covers
`GET /playground` headers, the locked page, the dev-bypass chat page, and the
`POST /playground/chat` gauntlet up to body validation (`test/smoke/server.test.ts:295-395`).
On a cold checkout `npm test` and the smoke lane fetch pinned skill bodies from
`raw.githubusercontent.com`; that is a network read and needs no authorization beyond the normal
gate.

## 8. Deployment preflight (owner authorization 2)

Preconditions:

- The live read in section 6 is recorded, and the live class is P or Q.
- The owner records "deploy" in the round ledger with the target commit.
- Section 7 gates passed on that exact commit.

Sequence:

1. Checkout `origin/main` in a clean tree. `git status --porcelain` must be empty.
2. `git rev-parse HEAD origin/main` must print one SHA twice.
3. `npm run build` (dry run) passes.
4. `npm run deploy`. The `predeploy` hook re-fetches and re-checks. Do not set
   `DEPLOY_ALLOW_UNCLEAN`.
5. Record the "Current Version ID" line that Wrangler prints, the three routes, the commit SHA, and
   the UTC time.
6. Wait about one minute for edge propagation before any check
   (`.agents/skills/live-drift-resolution/SKILL.md` step 8).

## 9. Post-deployment playground check

Free checks, no credentials:

- `GET /playground` → `200`; `content-security-policy` contains `sha256-ZB8MB5SKhRnJx0CaegzHU7J/JhdbqAhUdhGgxaO8z+o=`.
- `GET /`, `GET /docs`, `GET /terms` → `200` on `raven.stellar.org`; the two alias hosts → `200`.
- Unauthenticated `POST /mcp` → `401`; `GET /.well-known/oauth-protected-resource` → `200` JSON.
- `GET /health/skills` → `200` with `checkedAt` within three hours after the next `:07` cron tick.
- Telemetry: the version field from 6.3 shows the new Version ID for new `cf-worker-event` rows.

Owner browser check, signed in at `/playground`:

- The counter reads `0 / 8,000 characters` under the composer.
- Paste 8,001 characters: the count turns red with "1 character over the limit", Send is disabled,
  the textarea has `aria-invalid="true"`, and the text stays editable.
- Remove one character: Send is enabled and the count is normal.
- Optional free API check from the browser console with the session cookie: `POST /playground/chat`
  with one 8,001-character user message → `400 { error: "message_too_long" }`. This runs before the
  throttle and before any model call.
- Do not press Send unless the owner accepts one normal chat turn. That turn is a paid model call.

## 10. Hold condition

Hold, record the reason, and record the reopen condition when any of these is true:

- The live read returns an active Version ID that maps to no known class.
- The live read shows a deployment after 2026-08-28 that no ledger records.
- Any section 7 gate fails.
- `/health/skills` on the live version reports `ok: false` or a stale `checkedAt`. Diagnose first.
- The owner declines.

If the live read already shows class R, no deployment is needed. Record the Version ID, the
mapping, and the `/playground` check, then close the block.

A silent hold is not acceptable (`.agents/NEXT.md` "Deploy or hold after live verification").

## 11. Rollback evidence

Before deployment, record the active Version ID from section 6 as the rollback target.
If the post-deployment check fails:

1. `npx wrangler rollback <previous-version-id>`; confirm the syntax with `--help` first.
2. Wait about one minute.
3. `GET /playground` returns the class P/Q hash `sha256-J5utxnf3Yyxow6cDGr6zPQ9lyVj1Y4JUbUBOYCGDJus=`.
4. `npx wrangler deployments status` shows the previous Version ID at 100%.
5. Telemetry shows the previous Version ID on new rows.
6. Record the failing check, the rollback time, both Version IDs, and the reopen condition.

A rollback restores the 4,000-character silent truncation. Record that user-visible regression.

## 12. Authorization boundaries

| Action | State |
| --- | --- |
| Local comparison, fingerprint table, this report | done in this lane |
| Section 7 gates on a clean `origin/main` checkout | free; not run in this lane |
| Live read (sections 6.1 to 6.4) | blocked pending owner authorization 1 |
| Deployment (section 8) | blocked pending the live read and owner authorization 2 |
| `ARCHITECTURE.md:771` correction | repaired in this round; this lane did not edit it |
| Reconcile the two recorded Version IDs in `NEXT.md` and `TODO.md` | after the live read |

## 13. Evidence index

- `git show --stat 3c7f0e5`; `git show 3c7f0e5 -- src/demo scripts/improvements-lib.mjs`
- `git log 3c7f0e5..9d4362f -- <PR #99 paths>`; `git diff --stat 3c7f0e5 9d4362f -- <PR #99 paths>`
- `git diff --stat 0133653 9d4362f -- src catalog specs wrangler.jsonc package.json package-lock.json`
- `git log -S'6282fe2a' --all -- .agents`; `git log -S'2dc2afcb' --all`
- `.agents/rounds/2026-08-28-live-drift-86.md:59-66,578-579`
- `.agents/rounds/2026-08-28-eval-block2.md:22,32-35`
- `scripts/deploy-preflight.mjs`; `package.json` `predeploy`, `deploy`, `build`, `test:smoke`
- `src/server.ts:157-201`; `src/demo/page.ts:909-920,1049-1090`; `src/demo/chat.ts:101-160`
- `src/skills/canary.ts:162-215`; `test/smoke/server.test.ts:295-395`; `test/demo-page.test.ts:31-36`
- `.agents/skills/cloudflare-observability-review/SKILL.md`; `research/observability-cloudflare.md:60-80`
- `.agents/skills/live-drift-resolution/SKILL.md` step 8
