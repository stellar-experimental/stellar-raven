# Independent review: sd-103 and sd-104

Reviewer: Codex, hc terminal `t3pg`, distinct review lane. Date: 2026-11-11.
Scope: independently re-read the active findings, upstream issue/PR state, and improvements-pipeline step 6; freshly fetched and tested the deployed page. No tracked files were edited. No upstream comments, closures, or filings were made.

## Verdicts

| Finding | Verdict | Independent evidence |
| --- | --- | --- |
| sd-103 | **fixed** | The verbatim Tutorial 1 complete contract and following test build against `soroban-sdk = "=29.0.1"`; `cargo test` exits 0, one test passes, no warnings. |
| sd-104 | **fixed** | The verbatim Tutorial 2 complete contract builds against SDK 29.0.1; both supplied tests and two independently authored integration tests pass, no warnings. Re-adding sole admin X preserves count 1 and `try_remove(X)` returns `Err(Ok(Error::NotPermitted))`. |

These are live-fix verdicts, not certification that the repository retirement transaction is already complete. Cleanup and resolution-comment requirements remain below.

## Fresh deployed-page evidence (applies to both verdicts)

GET <https://developers.stellar.org/docs/build/guides/auth/check-auth-tutorials.md>:

- Started `2026-11-11T20:23:06.503665+00:00`; finished `2026-11-11T20:23:06.802052+00:00`.
- HTTP 200; curl exit 0.
- SHA-256: `9c82b212b21662b67c06a527dfbd587d5d627f1971444fced3803ee2eb72f57a`.
- Response `x-served-version`: `dpl_DqYu5MPb49gWBBbUGgpHQUmCHY3P`.
- Raw response, headers, and timestamp/hash record: `tmp/independent-sd-review/page.md`, `page.headers`, `fetch.json`.

The fetched production page itself contains the fixes and was the input to every Rust reproduction. The Mintlify merge-commit checks below are **skipped**, not successful deployment checks; the live page and passing reproductions provide the deployed-fix evidence.

Extracted fences are byte-identical to the served fences, with a trailing newline:

| File under `tmp/independent-sd-review/` | SHA-256 |
| --- | --- |
| `tutorial1/src/lib.rs` | `8f0b87efec17b8fe44903982f009e2e83544d9037bcadbfe5b48b2ace9357743` |
| `tutorial1/src/test.rs` | `79617b7081e8dd47b11d68c5c370e879f74155ce8cba17e3fdaeb8a362880331` |
| `tutorial2/src/lib.rs` | `27854d700ddfa05f02c6f4f3e2012042b5d0627b316918edc4d279b1b741cd3e` |

`verify-extraction.py` independently compares these files with the fetched fences and checks the fix content, walkthrough agreement, and warning-free logs. Toolchain: `rustc 1.93.0 (254b59607 2026-01-19)`, `cargo 1.93.0 (083ac5135 2025-12-15)`.

## Upstream state read directly with gh api

- [Issue #3097](https://github.com/stellar/stellar-docs/issues/3097): closed, `state_reason=completed`, closed `2026-11-11T00:06:30Z`.
- [PR #3102](https://github.com/stellar/stellar-docs/pull/3102): merged `2026-11-11T00:06:28Z`, merge commit `fdf4e15c5fcf8356848dbb84b1e4fc0fc9d0dba1`. ElliotFriend approved at `00:06:20Z`. Merge-commit `Mintlify Deployment`: completed, **skipped**, completed `2026-11-11T17:14:31Z`.
- [Issue #3098](https://github.com/stellar/stellar-docs/issues/3098): closed, `state_reason=completed`, closed `2026-11-11T00:06:07Z`.
- [PR #3104](https://github.com/stellar/stellar-docs/pull/3104): merged `2026-11-11T00:06:05Z`, merge commit `005f15bf21ab5959afa9b7e52986b407ca3000a8`. ElliotFriend approved at `00:05:58Z`. Merge-commit `Mintlify Deployment`: completed, **skipped**, completed `2026-11-11T17:14:30Z`.
- Both PR bodies explicitly close their respective issues. Both were authored by `stellar-triage-bot[bot]`; the bot's issue comments describe proposed fixes, not an independent human live verification. The PR comments are Mintlify preview-ready notices. Reviews have no outstanding requested changes; inline review-comment arrays are empty. Other returned merge-commit checks succeed.
- Full API payloads are retained as `issues-*.json`, `pulls-*.json`, `checks-*.json`, `comments-*.json`, and `pull-*-reviews.json` in the scratch directory.

## sd-103 reproduction and adjacent scan

Copied the Rust fence after Tutorial 1 “Complete code” to `tutorial1/src/lib.rs`, and the Rust test fence after “These are the test cases” to `tutorial1/src/test.rs`, without repairing either. Manifest uses SDK `=29.0.1` in dependencies and dev-dependencies with `testutils`, and the exact page-specified `ed25519-dalek = "1.0.1"` and `rand = "0.7.3"`. The workspace SDK reference was resolved to the requested exact version in this standalone scratch crate.

Observed: the complete contract imports `crypto::Hash`; the test imports `Vec`; no `protocol_version: 1` remains in Tutorial 1; it uses `env.ledger().set_timestamp(...)`; the failed time-limit invocation is checked by `assert_eq!(..., AccError::TimeLimitExceeded)`. The walkthrough uses the correct Hash import too. The page test `test::test_token_auth` passes, with zero compiler warnings. No residual build/test defect of the reported kind was found in the adjacent Tutorial 1 code/prose.

## sd-104 reproduction and adjacent scan

Copied the Tutorial 2 complete Rust fence verbatim to `tutorial2/src/lib.rs`, retaining its supplied tests. Dependencies match the page: SDK `=29.0.1`, `serde` version 1 with default features disabled and `derive`, `serde-json-core` version 0.6 with default features disabled. Enabled SDK `testutils` for native tests.

The signer-management block from `set_signer` through `update_admin_signer_count` is identical in walkthrough and complete code. Both increment only inside `if !env.storage().persistent().has(&id)`. Promotion removes the temporary entry and adds one admin; admin replacement leaves the count unchanged. Demotion decrements before removing the persistent entry; attempting to decrement the sole-admin count fails with `NotPermitted`.

Independently written `tutorial2/tests/reviewer.rs` has:

1. `independent_original_trigger`: constructor with sole admin X, `mock_all_auths`, `add(X, same key, true)`, storage assertion that count remains 1, `try_remove(X)` assertion for `Err(Ok(Error::NotPermitted))`, and confirmation that the admin remains stored.
2. `promotion_demotion_replacement_keep_count_and_last_admin`: key replacement of sole admin, rejected sole-admin demotion with state preserved, session add/replacement, promotion to admin, admin replacement, demotion when two admins exist, session removal, adding another admin, removing one of two admins, and rejecting removal of the remaining admin. Each transition checks stored count and expected persistent/temporary membership and keys.

Both independent tests pass. Both supplied tests (`test::test` and `test::test_readd_admin_keeps_last_admin`) also pass. No residual count drift through the tested promotion/demotion/replacement/removal paths, and no build warnings. These management tests intentionally mock wallet authorization, as the original finding concerns authorized management; they do not claim to audit WebAuthn cryptography or all possible storage-expiry behavior.

## Persistent references and required reconciliation

The requested `rg -n "sd-103|sd-104" .` exited 0. Outside the index and two active finding files it returned:

- `improvements/resolved.json:1735`: historical sd-101 receipt names sd-103 and sd-104 as its successors. Preserve; new resolved receipts will make those identifiers durably resolvable.
- `research/audits/2026-11-09-improvements-sweep/lane-docs.md:351`: historical hypothetical “duplicate sd-103,” predating these findings. Preserve as dated research; it is not a live dependency on this finding.

Because ordinary rg omits hidden directories, I also ran `rg -n --hidden --glob '!.git/**' --glob '!tmp/**' 'sd-103|sd-104' .` (exit 0). Additional persistent references:

- `.agents/TODO.md:82,84`: live Docs continuation entry requests rechecking these two findings after deployment. **Update this entry when retiring them** to record resolution and remove the obsolete pending recheck.
- `.agents/rounds/2026-11-10-truth-maintenance.md:116,130,133,158,159`: historical sd-101 retirement, successor filing, and queue-change record. Preserve the dated history.

No golden, register, intake override, or standalone probe references were found by these scans. Raw outputs are `references.txt` and `references-hidden.txt`.

## Retirement gates still for the coordinator

At review time both active files and index entries still exist, and no new receipt has been appended. The direct issue/PR comments read above do not yet contain a Raven resolution comment with this live result and a commit-pinned source snapshot. Step 6 therefore still requires posting/read-back of resolution comments on the upstream refs, resolving each finding with its fixing PR, removal of the active files (and any associated probe/intake override), index regeneration, complete resolved receipts, and TODO reconciliation. This review does not claim those future changes have been checked. No successor is needed for a residual identified by this scoped review.

## Commands and exit codes

Working directory: `/private/tmp/claude-501/raven-wt/retire-sd103-104`. Evidence commands below all exited **0**:

```sh
curl --fail --silent --show-error --location --dump-header tmp/independent-sd-review/page.headers https://developers.stellar.org/docs/build/guides/auth/check-auth-tutorials.md -o tmp/independent-sd-review/page.md
rustc --version
cargo --version
cargo test --manifest-path /private/tmp/claude-501/raven-wt/retire-sd103-104/tmp/independent-sd-review/tutorial1/Cargo.toml
cargo test --manifest-path /private/tmp/claude-501/raven-wt/retire-sd103-104/tmp/independent-sd-review/tutorial2/Cargo.toml
python3 tmp/independent-sd-review/verify-extraction.py
rg -n "sd-103|sd-104" .
rg -n --hidden --glob '!.git/**' --glob '!tmp/**' 'sd-103|sd-104' .
git status --short
```

Cargo commands ran sequentially through `run-tests.py` in my child terminal `t3pk` (`sd-review-tests`). Exact argv and individual exit codes are in `cargo-results.json`; full logs are `tutorial1-cargo-test.log` and `tutorial2-cargo-test.log`. An initial attempt to inline the runner in a shell-quoted hc command exited 1 with a shell parse error before launching tests; writing the runner to a file and launching it succeeded. The runner and both cargo commands exited 0.

The following exact API commands each exited **0**:

```sh
gh api repos/stellar/stellar-docs/issues/3097
gh api repos/stellar/stellar-docs/issues/3098
gh api repos/stellar/stellar-docs/pulls/3102
gh api repos/stellar/stellar-docs/commits/fdf4e15c5fcf8356848dbb84b1e4fc0fc9d0dba1/check-runs
gh api repos/stellar/stellar-docs/pulls/3104
gh api repos/stellar/stellar-docs/commits/005f15bf21ab5959afa9b7e52986b407ca3000a8/check-runs
gh api repos/stellar/stellar-docs/issues/3097/comments
gh api repos/stellar/stellar-docs/issues/3098/comments
gh api repos/stellar/stellar-docs/issues/3102/comments
gh api repos/stellar/stellar-docs/issues/3104/comments
gh api repos/stellar/stellar-docs/pulls/3102/reviews
gh api repos/stellar/stellar-docs/pulls/3102/comments
gh api repos/stellar/stellar-docs/pulls/3104/reviews
gh api repos/stellar/stellar-docs/pulls/3104/comments
```

Final tracked working tree check was clean. All review artifacts are under `tmp/`.
