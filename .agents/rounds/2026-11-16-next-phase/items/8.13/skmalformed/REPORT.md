# Item 8.13 Lane `skmalformed` — Report

## Outcome

The malformed-input gap in `skills.stellar-dev.smart-contracts` (`stellar/stellar-dev-skill`) **still reproduces** on the current pinned commit (`421ca30a671cd32d7d6466e8b903f10d79dc1590`, 2026-11-12), on live `stellar/stellar-dev-skill` `main` (`79340b69bf1d5976ac8b0f7042de5bf9d63c9595`, 2026-11-19), and on published `https://skills.stellar.org/skills/smart-contracts/security.md`. All four skill files (`SKILL.md`, `development.md`, `security.md`, `testing.md`) are byte-identical between the pin and `main`. `security.md` (blob `aa56fe9ff663922f13331c337217c8ac7a5b1fb0`, 11,280 bytes) still lists 11 numbered vulnerability classes with zero malformed/short-input class and zero length or bounds guards before slicing, copying, or decoding caller-supplied bytes.

Recorded local `verified` finding `sk-040` through the improvements pipeline (local only; no upstream issue posted).

## What Changed

- Added `improvements/skills/sk-040-smart-contracts-malformed-input-gap.md` (`status: verified`, `discovered: 2026-08-07`, next unused `sk-` ID above active `sk-031` and resolved `sk-039`).
- Added `sk-040` intake routing (`stellar/stellar-dev-skill`) and bumped `"updated": "2026-11-20"` in `improvements/intake.json`.
- Regenerated `improvements/INDEX.md` via `npm run improvements:index` (94 findings).
- Added round records under `.agents/rounds/2026-11-16-next-phase/items/8.13/skmalformed/`: `SOL-REVIEW.md`, `CHALLENGE.md`, and `REPORT.md`.

## Pull Request

- PR: https://github.com/stellar-experimental/stellar-raven/pull/521
- Branch: `np/8.13-skmalformed`

## Worker Bytes & Model-Facing Impact

- Worker bytes changed (`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc`): **No** (empty diff).
- Model-facing change: **No** (touches only `improvements/` and `.agents/rounds/`).

## Gates (Post-Fix Verification)

All commands run bare after applying Sol-challenge fixes:

| Command | Exit Code | Result |
|---|---|---|
| `npm run improvements:index` | `0` | Wrote `improvements/INDEX.md` (94 findings) |
| `npm run improvements:lint` | `0` | `improvements lint ok (94 findings)` |
| `npm run improvements:lint -- --live` | `0` | `improvements lint ok (94 findings, live intake checked)` |
| `npm run improvements:file -- --file improvements/skills/sk-040-smart-contracts-malformed-input-gap.md --dry-run` | `0` | Clean reader-first body and title; resolved to `stellar/stellar-dev-skill` |
| `npm run typecheck` | `0` | Clean (`tsc --noEmit`) |
| `npm test` | `0` | 174 passed \| 5 skipped (179 files); 4165 passed \| 3 expected fail \| 5 skipped |
| `npm run build` | `0` | Dry-run bundle succeeded (6922.73 KiB / gzip 1376.10 KiB) |
| `npm run secrets:scan -- --tree` | `0` | Clean across all tracked files |

## Codex Sol Review & Challenge

- Reviewer: Codex CLI (`gpt-6.2-sol`, `high` effort, read-only sandbox) on `git diff origin/main...5d6d7fb3`.
- Artifacts: `SOL-REVIEW.md` and `CHALLENGE.md`.
- Verdict counts by class:
  - **Valid**: `5` (2 Major, 1 Minor, 2 Nit — all 5 fixed and re-gated)
  - **Invalid**: `0`
  - **Valid but not worth fixing**: `0`
- Summary of fixes applied from the challenge:
  1. Removed the optional `probe:` block (semantic four-file omission cannot be reliably probed by literal single-URL substring excludes; aligns with `sk-031`, `sd-108`, `sd-113`).
  2. Verified `rs-soroban-sdk@27ae4ffd9f` (`soroban-sdk-macros/src/derive_fn.rs:137-147` and `soroban-sdk/src/xdr.rs:114-117`) and updated `## Recommendation` to distinguish `BytesN<N>` ABI-boundary rejection from `Bytes` + `BytesN::<N>::try_from` for typed `#[contracterror]` returns, and to recommend typed `#[contracttype]` inputs over `FromXdr::from_xdr` when typed errors are required.
  3. Replaced the mutable-`main` single-file reproduction command with the pinned four-file loop (`421ca30a671cd32d7d6466e8b903f10d79dc1590`) and recorded its exact observed output.
  4. Shortened every `evidence:` sentence to <= 20 words to match `upstream-writing-style.md` when `improvements:file` renders them into the public issue body.
  5. Recorded the explicit posting-hold reason while `status: verified` (`SKILL.md:95`).

## TODO Item Closed & Recommended `.agents/TODO.md` Change

Per lane rules, this lane did not edit `.agents/TODO.md`. Recommended orchestrator edit after PR #521 merges:

- **Delete** `### Probe the malformed-input gap in the pinned smart-contracts skill` (`.agents/TODO.md:457-469`). Its `Done when` bar ("the probe shows the gap closed, or a finding records it") is met by `improvements/skills/sk-040-smart-contracts-malformed-input-gap.md`.
- **Update** Priorities bullet 4 (`.agents/TODO.md:30-31`) to remove the clause `"the smart-contracts malformed-input recurrence probe (\"Probe the malformed-input gap in the pinned smart-contracts skill\"),"`.
- No further local probe item remains. The only follow-up is the owner/orchestrator decision on whether to run `npm run improvements:file -- --file improvements/skills/sk-040-smart-contracts-malformed-input-gap.md` against `stellar/stellar-dev-skill` after merge.

## Model Calls Made

| CLI / Tool | Resolved Model ID | Effort | Purpose | Billing |
|---|---|---|---|---|
| Antigravity | Gemini 4 Neon | high | Lane execution: live recurrence probe, `sk-040` authoring, Sol challenge, fixes, gates, PR | Subscription |
| Codex CLI (`codex exec`) | `gpt-6.2-sol` | high | Independent read-only review of `git diff origin/main...5d6d7fb3` | Subscription |

No AI Gateway, Workers AI, or provider-API calls were made.

## Open Questions

- Should the orchestrator post `sk-040` upstream to `stellar/stellar-dev-skill` via `npm run improvements:file -- --file improvements/skills/sk-040-smart-contracts-malformed-input-gap.md` once PR #521 merges to `main`?
