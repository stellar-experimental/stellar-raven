# Local repair: stellar-docs PR 2837

Implementer: Grok high (Grok 4.6). Independent reviewer still required.
Clock: `2026-09-16T21:20:04Z` (clone) / `2026-09-16T21:22:00Z` (repair complete).
Checkout: `/tmp/raven-execution-2026-09-16/docs2837-repair`
Frozen head: `3855b52ed4933d3ad50fab6d546675f66f0fe76f` (`docs: scope the guestbook testing caveat to the frontend`)
Uncommitted binary diff SHA-256: `a1fa52bc2afb1d6ce926009eb1b80e73bbd43b8052c9e03bb9c34dccf39ad875`
Status: **uncommitted** local edits only. No commit, push, comment, approve, merge, or PR-body change. Author hold is untouched.

File SHA-256 at freeze:

| Path | SHA-256 |
|---|---|
| `docs/build/apps/guestbook/frontend.mdx` | `2bfd4c48ba26938957abfd530afaf097b10f5e12c31738b738a33c13c266712f` |
| `docs/build/apps/guestbook/overview.mdx` | `8d05c1515210a16cfff22bf9fa5074c19466de0307348e3da8a3aee930c8e83b` |
| `docs/build/apps/guestbook/passkeys-prerequisites.mdx` | `6dd06485c09d1978e4759303939f3f13ae05d829ed9bfdf27654d88cb190ee01` |
| `docs/build/apps/guestbook/setup-passkeys.mdx` | `7bbc524fc375241195bf3c31c107b7e05765af42e01aa6d5953457f41c8fb88f` |
| `docs/build/guides/contract-accounts/smart-wallets.mdx` | `0c2c8259e95bfa0b09e66feb5164f9ab6a43a5e8b661f5da4d23eeac649b48ca` |

## Scope

Four verified defects from `/tmp/raven-execution-2026-09-16/upstream-docs-pr-readiness.md`, re-checked on this head:

1. Unscoped “audited” claims (overview, prerequisites, smart-wallets).
2. Unbounded `rpc.getLedgerEntries` (frontend list-all snippet).
3. `PRIVATE_` described as a SvelteKit access-control prefix.
4. “Cancelled” toast prose that the shown callers do not implement.

Did not release **Please do not merge yet**. Did not edit the GitHub PR body.

## Diff (exact)

Five files. `git diff --stat` versus the frozen head:

```
 docs/build/apps/guestbook/frontend.mdx             | 28 ++++++++++++----------
 docs/build/apps/guestbook/overview.mdx             |  4 ++--
 docs/build/apps/guestbook/passkeys-prerequisites.mdx |  4 ++--
 docs/build/apps/guestbook/setup-passkeys.mdx       |  2 +-
 docs/build/guides/contract-accounts/smart-wallets.mdx |  2 +-
 The final patch also contains the three parent-owned prose corrections reviewed below.
```

### 1. Audit claims — removed, not invented

Issue #2700 requires an exact artifact, Wasm hash, release, and audit URL. This head had none of those. The repair drops the word “audited” and keeps the OpenZeppelin docs link.

- overview L27: “targets the OpenZeppelin Smart Account contracts”
- overview L56: “the contract framework each user's smart account is deployed from”
- passkeys-prerequisites L8: “deploys an OpenZeppelin Smart Account”
- smart-wallets L45: “modular smart account framework” (was “audited, modular”)

No new audit URL was invented.

### 2. RPC 200-key cap

`openrpc/src/stellar-rpc/schemas/LedgerEntries.json` in this checkout: “The maximum number of ledger keys accepted is 200.”

The snippet now chunks keys with `MAX_LEDGER_KEYS = 200` and concatenates `result.entries`. Surrounding prose says “batched … at most 200 keys (the Stellar RPC cap)” instead of “a single batched call” / “one request”.

### 3. `PRIVATE_` convention

SvelteKit `$env/static/private` contains variables that **do not** match the public prefix (`PUBLIC_` by default). `PRIVATE_` is not a special prefix.

The info box now: SvelteKit treats `PUBLIC_` as the client-visible prefix; any other name, including these `PRIVATE_*` names, stays on `$env/static/private`.

Source: https://svelte.dev/docs/kit/$env-static-private

### 4. Cancelled-passkey prose

frontend.mdx callers at this head still do `if (userDismissedPasskey(err)) return;` with no `"Cancelled"` string.

setup-passkeys.mdx now: “A cancelled prompt returns without treating the dismissal as a failure, instead of showing a red ‘something went wrong.’”

## Validation

| Check | Result |
|---|---|
| `git rev-parse HEAD` | `3855b52ed4933d3ad50fab6d546675f66f0fe76f` |
| `git status` | five modified files; no commit |
| `git diff --check` | clean |
| Direct Prettier 3.9.4 `--check` | **pass** (see command below) |
| `SKIP_YARN_COREPACK_CHECK=1 pnpm install --frozen-lockfile` | **pass**, 16s; lockfile unchanged |
| CLI prep + `pnpm build` | **pass**; generated CLI stubs restored so the repair stays five files |

**Initial install failure (retained).** Same class as the 2844 checkout. Reproduced 2026-09-16T21:23:19Z in `/tmp/raven-execution-2026-09-16/docs2837-repair` by invoking Yarn 1.22.22 against the repo `package.json` (`packageManager`: `pnpm@11.6.0+sha512.…`). Do **not** use `pnpm exec`.

```
error This project's package.json defines "packageManager": "yarn@pnpm@11.6.0". However the current global version of Yarn is 1.22.22.

Presence of the "packageManager" field indicates that the project is meant to be used with Corepack, a tool included by default with all official Node.js distributions starting from 16.9 and 14.19.
Corepack must currently be enabled by running corepack enable in your terminal. For more information, check out https://yarnpkg.com/corepack.
```

Cause: `postman-code-generators` postinstall (`node npm/deepinstall.js`) runs `yarn install --production --frozen-lockfile` (Yarn 1.22.22). That Yarn process reads the **parent** docs `package.json` `packageManager` field and rejects it. Yarn prints `yarn@pnpm@11.6.0` because it prefixes the stored value.

Working format check (no `pnpm exec`):

```
node node_modules/.pnpm/prettier@3.9.4/node_modules/prettier/bin/prettier.cjs --config .prettierrc.js --check \
  docs/build/apps/guestbook/overview.mdx \
  docs/build/apps/guestbook/passkeys-prerequisites.mdx \
  docs/build/apps/guestbook/setup-passkeys.mdx \
  docs/build/apps/guestbook/frontend.mdx \
  docs/build/guides/contract-accounts/smart-wallets.mdx
```

Exit 0: `All matched files use Prettier code style!`

**Environment-only retry (no manifest/lock change).** Parent’s switch:

```
SKIP_YARN_COREPACK_CHECK=1 pnpm install --frozen-lockfile
```

This checkout: 2026-09-16T21:25:40Z, log `/tmp/raven-execution-2026-09-16/docs2837-install.log`. `Done in 16s using pnpm v11.6.0`. `package.json` and `pnpm-lock.yaml` stayed clean.

Then standard CLI prep and full build (`SKIP_YARN_COREPACK_CHECK=1`):

1. `node scripts/stellar_cli.mjs -- --cli-ref=main` — exit 0 (CLI v28.0.0). Log `/tmp/raven-execution-2026-09-16/docs2837-cli-build.log`.
2. `./scripts/fix_cli_links.sh` — exit 0.
3. Direct Prettier `--check` on the five repair files — exit 0.
4. `pnpm build` — exit 0. Log `/tmp/raven-execution-2026-09-16/docs2837-build.log`. Static files in `build/`; 942 markdown files processed.

CLI prep also rewrote generated `docs/tools/cli/cookbook/*.mdx` and `src/helpers/stellarCli.ts`. Those files were restored with `git checkout --` so this repair stays the original five MDX files. No dependency changes.

## Risks

- The tutorial snippet may now differ from `ye-olde-guestbook` `src/lib/server/getLedgerEntries.ts` if that repo still sends all keys in one call. The docs link to that file as “full implementation.”
- Removing “audited” without a scoped replacement is weaker marketing copy; it is the smallest honest fix for #2700.
- `PRIVATE_*` names still work because they are not `PUBLIC_*`. A reader who copies `RELAYER_API_KEY` without `PUBLIC_` also stays private.

## Source citations

- Frozen PR head: `3855b52ed4933d3ad50fab6d546675f66f0fe76f`
- RPC cap: `openrpc/src/stellar-rpc/schemas/LedgerEntries.json` (“maximum number of ledger keys accepted is 200”)
- SvelteKit env: https://svelte.dev/docs/kit/$env-static-private
- OpenZeppelin Smart Account docs (link only): https://docs.openzeppelin.com/stellar-contracts/accounts/smart-account
- CONTRIBUTING.md: maintainer approval; prettier; full build; route-removal. This repair does not change routes.
- Independent review of defects: `/tmp/raven-execution-2026-09-16/upstream-docs-pr-readiness.md`

A separate independent reviewer should check this uncommitted tree before any upstream publication.

## Final independent review

Sol high accepted the final patch in `docs-repair-independent-review.md`.
The parent scoped cancellation text to signup and login.
The source link now names its helper scope and states its current batching difference.
These three prose edits passed the pinned formatter and whitespace checks.
The prior complete build covered the unchanged code and route structure.
Final patch SHA-256: `c12a79e721f33f8807188bbf1fb812dcceaa959223daae136a2ad7cc12c510ed`.
