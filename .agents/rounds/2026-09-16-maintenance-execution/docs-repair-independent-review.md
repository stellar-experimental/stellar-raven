# Independent review: upstream Docs repair patches

Date: 2026-09-16

Reviewer: Sol high

This review covers only the two specified uncommitted patches. It does not release either author hold.

## Verdict

| Patch | Base | Verdict |
|---|---|---|
| `docs2844-repair` | `1e67426a49b7152f45c6ee559e964fc2f0cda1d9` | **ACCEPT** |
| `docs2837-repair` | `3855b52ed4933d3ad50fab6d546675f66f0fe76f` | **ACCEPT** |

The `docs2844-repair` patch is accurate, scoped, and ready for the upstream author workflow.

The three parent-owned prose edits resolve both prior `docs2837-repair` findings.

Neither verdict approves, comments, merges, commits, pushes, or releases an author hold.

## Resolved findings

### D2837-1: The link now states the batching difference

Status: Resolved

File: `docs/build/apps/guestbook/frontend.mdx:408`

The local snippet correctly limits each `getLedgerEntries` request to 200 keys.

The link now names only the key-building helper and message-count read.

That linked file still sends all keys through one `rpc.getLedgerEntries(...ledgerKeysArray)` call.

The paragraph explicitly warns that the linked file sends all message keys in one request.

It tells readers to use the tutorial batching for lists longer than 200 keys.

The linked Git blob is `ed1b2a981d81e2dc3f13ece50a5105a10918bb5e`.

This warning matches the current linked source. The tutorial batching remains required.

### D2837-2: The cancellation statements now have the supported scope

Status: Resolved

Files:

- `docs/build/apps/guestbook/frontend.mdx:117`
- `docs/build/apps/guestbook/setup-passkeys.mdx:150`

Both lines now apply only to signup and login.

The shown signup and login flows use that helper. The transaction-signing flows do not use it.

This scope matches the shown callers and the linked source.

The linked Git blobs are:

- Login: `9da9b1f0d6b8d83a99c38865bb4c42a3b2133521`
- Signup: `309d0c3823eb31f1992775ecb88d69534efb7b90`
- GuestbookMessage: `6b07787b4e193da0949b03f3dac7135c8cc785aa`

The text no longer claims that all passkey flows use the helper.

## Accepted fact checks

### PR 2844 reserve wording

Both edited paragraphs now describe pool-share trustlines accurately.

CAP-0038 says a pool-share trustline counts as two subentries and requires two base reserves.

`stellar-core` applies a multiplier of two to pool-share trustlines. Other trustlines use a multiplier of one.

Claimable balances use the claimant count through separate multiplier logic. The new text does not obscure that rule.

Both internal links target the existing `### Trustlines` heading.

### PR 2837 RPC batching

The OpenRPC schema sets a maximum of 200 ledger keys.

The repaired snippet chunks requests sequentially. It appends each response in request order.

An offline extracted-snippet mock produced these results:

| Input keys | Request sizes | Maximum size | Order preserved |
|---:|---|---:|---|
| 0 | none | 0 | yes |
| 1 | `1` | 1 | yes |
| 200 | `200` | 200 | yes |
| 201 | `200, 1` | 200 | yes |
| 401 | `200, 200, 1` | 200 | yes |

The batching code is correct. The new warning accurately describes the linked source difference.

### PR 2837 SvelteKit prefix wording

The default SvelteKit public prefix is `PUBLIC_`. `$env/static/private` rejects imports from client code.

Variables outside the public prefix remain private under the tutorial's default configuration.

Therefore, the scoped `PRIVATE_*` statement is accurate for this tutorial.

### PR 2837 audit wording

The patch removes four unsupported “audited” claims. It does not invent an audit artifact or identifier.

No “audited” claim remains in the five reviewed files. The retained OpenZeppelin links resolve successfully.

## CONTRIBUTING review

Both worktrees contain the same `CONTRIBUTING.md` content.

Its SHA-256 is `3aa89468bd9a4e07cc1e08c59f6a3b856e313ba435174bc083738ea315c7fd83`.

I checked every modified hunk against its focused-change, formatting, link, build, and approval rules.

Both patches keep one repair concern. Internal links use relative `.mdx` targets.

The external links use valid forms. No route changes exist.

No modified hunk violates the repository contribution rules.

## Validation evidence

`docs2844-repair` has the parent-reported CI-equivalent build, route equality, formatting, and diff checks.

`docs2837-repair` now has a successful full build. Its direct Prettier and diff checks also pass.

Both worktrees remain uncommitted. Their status contains only the expected modified MDX files.

The `docs2837-repair-report.md` stat says 22 insertions. The current exact patch has 27 insertions.

The repair report predates the three prose fixes. Its recorded patch hash is now stale.

This report performed no paid request. It performed no live write operation.

## Exact patch hashes

### `docs2844-repair`

Binary diff SHA-256: `8b5947faf4d1cf76f9692475cf623a9d9afe9c9217de3138a6ac60ddcfb92822`

| File | SHA-256 |
|---|---|
| `docs/learn/fundamentals/lumens.mdx` | `eb4d2148c580332144cd39d2e2e7a82ed5a1a94cc9637bc4b27dbd8ff266c7e7` |
| `docs/learn/fundamentals/stellar-data-structures/accounts.mdx` | `31ed24a401d7d1ced760f69c0e5363002ac147ec0b193e9bad2151f65c5fa2eb` |

### `docs2837-repair`

Binary diff SHA-256: `c12a79e721f33f8807188bbf1fb812dcceaa959223daae136a2ad7cc12c510ed`

| File | SHA-256 |
|---|---|
| `docs/build/apps/guestbook/frontend.mdx` | `17a757e545add9e028c0c18a4e6f3c4ff5f347f5b578288e4e1e370539364a1d` |
| `docs/build/apps/guestbook/overview.mdx` | `8d05c1515210a16cfff22bf9fa5074c19466de0307348e3da8a3aee930c8e83b` |
| `docs/build/apps/guestbook/passkeys-prerequisites.mdx` | `6dd06485c09d1978e4759303939f3f13ae05d829ed9bfdf27654d88cb190ee01` |
| `docs/build/apps/guestbook/setup-passkeys.mdx` | `b23115407064e6c43afedd60d6a832ec60a5897269ba0a426e78e3e21c590029` |
| `docs/build/guides/contract-accounts/smart-wallets.mdx` | `0c2c8259e95bfa0b09e66feb5164f9ab6a43a5e8b661f5da4d23eeac649b48ca` |

## Input report hashes

| Report | SHA-256 |
|---|---|
| `docs2844-repair-report.md` | `9fe60cd3372d6f6fee002ce96dbaa5135301fc3fd0422dca5831a6e43efa9d85` |
| `docs2837-repair-report.md` | `1e38199041030a6ec080422a8954320eb2a36dbe6661b0580715330c5cc52c30` |
| `upstream-docs-pr-readiness.md` | `d88792fbc937507e9cdecdfb7769c2af4b92772a93fc9ea713b3e75dc8b31783` |

## Narrow rereview axes

### Standards

**PASS.** The three prose edits follow `CONTRIBUTING.md` and add no review smell.

### Spec

**PASS.** The three prose edits resolve D2837-1 and D2837-2 without changing source behavior.

Summary: Standards has zero findings. Spec has zero findings.

## Remaining actions

1. The upstream maintainers must complete their normal approval workflow.
2. The release owner must retain both author holds until that workflow finishes.
