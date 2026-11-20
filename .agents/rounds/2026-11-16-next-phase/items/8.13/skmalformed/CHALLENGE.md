# Sol Review Challenge — Item 8.13 Lane `skmalformed`

- Reviewer: Codex Sol (`gpt-6.2-sol`, `high` effort, read-only sandbox)
- Review artifact: `SOL-REVIEW.md`
- Diff reviewed: `git diff origin/main...5d6d7fb3` (`improvements/skills/sk-040-smart-contracts-malformed-input-gap.md`, `improvements/intake.json`, `improvements/INDEX.md`)

## Summary of Verdicts

| # | Severity (Sol) | Location | Verdict | Action |
|---|---|---|---|---|
| 1 | Major | `sk-040-smart-contracts-malformed-input-gap.md:21` | **Valid** (with nuance on `fixed-candidate`) | Removed the optional `probe:` block |
| 2 | Major | `sk-040-smart-contracts-malformed-input-gap.md:75` | **Valid** | Clarified `BytesN<N>` ABI-wrapper trap vs `Bytes` + `try_from`, and added concrete XDR mitigation |
| 3 | Minor | `sk-040-smart-contracts-malformed-input-gap.md:66` | **Valid** | Replaced mutable-`main` single-file command with pinned four-file loop and observed output |
| 4 | Nit | `sk-040-smart-contracts-malformed-input-gap.md:8` | **Valid** | Rewrote all `evidence:` entries into sentences of <= 20 words |
| 5 | Nit | `sk-040-smart-contracts-malformed-input-gap.md:14` | **Valid** | Stated the explicit posting-hold reason while `status: verified` |

Counts by class: **5 valid**, **0 invalid**, **0 valid but not worth fixing**.

## Finding-by-Finding Verification

### 1. Recurrence probe misclassification (`sk-040:21`, Major) — **Valid**

- **Claim**: The `http-text` probe on `security.md` produces `fixed-candidate` if an unrelated `### 12.` is added and stays `recurring` if upstream adds short-input / bounds-before-slicing guidance without the exact substrings `malformed`, `Malformed`, `copy_into_slice`, `from_xdr`, or `### 12.`.
- **Verification**: Read `scripts/improvements-run-probes.mjs:114-126`. The runner performs case-sensitive literal `body.includes(needle)` checks on one URL.
  - **Nuance**: Under `.agents/skills/improvements-pipeline/SKILL.md:187`, a probe miss (`fixed-candidate`) is explicitly a review signal rather than a status change, so the unrelated-`### 12.` false alarm is lower impact than Sol's framing suggests.
  - **Confirmed failure**: The opposite direction is a real defect. Because this gap is a semantic prose omission across four files (`SKILL.md`, `development.md`, `security.md`, `testing.md`), an upstream fix using natural phrasing (e.g., "short inputs", "check `len()` before slicing") would leave all `excludes` true and keep reporting `recurring` (and under `--append-drafts`, append a misleading recurrence draft).
  - **Precedent**: `probe:` is optional frontmatter (`SKILL.md:185`), and existing multi-file or prose-omission findings (`improvements/skills/sk-031-skills-site-orphaned-soroban-skill.md`, `improvements/stellar-docs/sd-108-wallet-user-signing-safety-guidance-missing.md`, `improvements/stellar-docs/sd-113-pi-network-not-stellar-faq-request.md`) omit `probe:`.
- **Fix**: Removed the optional `probe:` block from `sk-040`.

### 2. Recommendation can still trap on `BytesN<N>` and `FromXdr::from_xdr` (`sk-040:75`, Major) — **Valid**

- **Claim**: A wrong-length `BytesN<N>` argument traps inside the generated `#[contractimpl]` wrapper before contract code can return a typed `#[contracterror]`; a fixed-length but invalid XDR payload traps inside `FromXdr::from_xdr`.
- **Verification**: Read `stellar/rs-soroban-sdk@27ae4ffd9fce7cb93dcd704582f7540cc88f0701`:
  - `soroban-sdk-macros/src/derive_fn.rs:137-147` converts each contract entry-point argument via `TryFromValForContractFn::try_from_val_for_contract_fn` and immediately calls `UnwrapOptimized::unwrap_optimized`, trapping before the contract body executes.
  - `soroban-sdk/src/xdr.rs:114-117` calls `env.deserialize_from_bytes(b.into()).unwrap_infallible()` before `T::try_from_val`, and `xdr.rs` exposes no fallible raw-XDR deserializer. Thus malformed `ScVal` XDR traps in the host regardless of byte length.
- **Fix**: Updated `## Evidence` and `## Recommendation` in `sk-040` to:
  - Distinguish using `BytesN<N>` when ABI-boundary rejection is acceptable from accepting `Bytes` and converting via `BytesN::<N>::try_from` when the contract must return a typed `#[contracterror]`.
  - Recommend passing typed `#[contracttype]` arguments instead of raw untrusted XDR `Bytes` whenever typed error handling is required.

### 3. Single-file mutable-`main` reproduction command (`sk-040:66`, Minor) — **Valid**

- **Claim**: The fenced reproduction command fetched only `security.md` from mutable `main` without recording the response, whereas `SKILL.md:22` requires the live command and response for `verified` status and reproducible pinned evidence.
- **Verification**: Read `.agents/skills/improvements-pipeline/SKILL.md:22` ("with the command and response recorded") and `sk-040:64-68`. Confirmed the fenced block only checked `security.md` on `main` and omitted the observed output.
- **Fix**: Replaced the fenced command with the exact four-file `curl | rg` loop pinned to `421ca30a671cd32d7d6466e8b903f10d79dc1590` (re-executed live to confirm exact output, and noted identical output on `main` `79340b69bf1d5976ac8b0f7042de5bf9d63c9595`) plus the observed output summary.

### 4. `evidence:` sentences exceed 20-word upstream style guide (`sk-040:8`, Nit) — **Valid**

- **Claim**: `scripts/improvements-file-issue.mjs` copies frontmatter `evidence:` into the public issue body, and several `evidence:` sentences exceeded the 20-word limit in `references/upstream-writing-style.md`.
- **Verification**: Read `scripts/improvements-file-issue.mjs:277` (verbatim copy into `Additional recorded evidence:`), `references/upstream-writing-style.md:6` ("Keep each sentence at 20 words or fewer"), and recent `improvements/skills/sk-031-skills-site-orphaned-soroban-skill.md:8-14` (which keeps frontmatter `evidence:` sentences short). Confirmed multiple `sk-040` `evidence:` sentences ran 29-48 words.
- **Fix**: Rewrote every `evidence:` entry into short active sentences of <= 20 words each.

### 5. Missing reason for staying `verified` (`sk-040:14`, Nit) — **Valid**

- **Claim**: `"ready for upstream filing"` did not state why the finding stays `verified` instead of being posted, as required by `SKILL.md:95`.
- **Verification**: Read `.agents/skills/improvements-pipeline/SKILL.md:95` ("A finding that is not posted stays `verified`, with a note that says why, so it can be posted later") and `8.13-COMMON.md:38-39`.
- **Fix**: Updated the final `evidence:` entry to `"2026-11-20 posting hold: not posted upstream yet. Upstream posting waits for repository-owner approval."`.
