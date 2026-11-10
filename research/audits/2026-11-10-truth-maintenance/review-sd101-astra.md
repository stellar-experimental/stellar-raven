# Independent sd-101 retirement review — 2026-11-10

**Verdict: partial (successors needed). The precise sd-101 missing-definitions/dependency trigger is fixed and deployed; I approve retiring that finding once the two independently reproduced adjacent defects below are preserved as self-contained successors and the normal retirement cleanup/comments are verified.** Do not describe the entire page as compiling or the wallet as fully reviewed.

Reviewer: Codex session `hc t3ks`, independently of coordinator Claude Opus `t2dn`. I read the finding, upstream issue/PR, live production page, and upstream source directly. I did not read or rely on the author's recheck. Repository files were read-only; all reviewer artifacts are under `tmp/rv-sd101-evidence/`. No external comments, finding edits, commits, or resolution actions were performed. The brief explicitly reserved those actions for the coordinator.

## 1. Current upstream evidence

Commands run directly (raw JSON retained in `issue.json`, `issue-rest.json`, `pr.json`, `handoff.json`, and `merge-checks.json`):

```sh
gh issue view 407 --repo stellar-experimental/stellar-raven --json number,title,state,author,body,comments,closedAt,updatedAt,url
gh issue view 3079 --repo stellar/stellar-docs --json number,title,state,author,body,comments,closedAt,updatedAt,url
gh api repos/stellar/stellar-docs/issues/3079
gh pr view 3081 --repo stellar/stellar-docs --json number,title,state,author,body,comments,reviews,reviewDecision,mergedAt,mergedBy,mergeCommit,headRefOid,statusCheckRollup,files,url
gh api repos/stellar/stellar-docs/commits/d5df6416769d3645028b2062be26c4e598a271a1/check-runs
gh pr diff 3081 --repo stellar/stellar-docs
```

- [Issue #3079](https://github.com/stellar/stellar-docs/issues/3079): CLOSED, `state_reason: completed`, closed `2026-11-10T16:54:34Z`; author `kalepail`. Its two comments are from `stellar-triage-bot`, not independent maintainer verification. They acknowledge the missing definitions and open PR3081. No Raven post-fix resolution comment was present at observation.
- [PR #3081](https://github.com/stellar/stellar-docs/pull/3081): MERGED, review decision APPROVED, merged `2026-11-10T16:54:33Z` by `ElliotFriend`, merge commit `d5df6416769d3645028b2062be26c4e598a271a1`; author `app/stellar-triage-bot`. Only `docs/build/guides/auth/check-auth-tutorials.mdx` changed (224 additions / 89 deletions).
- Maintainer `ElliotFriend` requested changes at `2026-11-09T22:05:31Z` on `bb7f2cf…`, requiring constructor initialization, WebAuthn validation, saturating TTL math, updated attribution and a teaching-example warning. The same maintainer APPROVED at `2026-11-10T16:50:19Z` on final head `ad4b8e8c1ca7d2ed21ff3fe3b3a9abb05954580e`. The older requested-changes review is superseded, not outstanding.
- All eight final-head checks succeeded. All five checks on the **merge commit** succeeded. Mintlify Deployment started `2026-11-10T16:54:36Z`, completed successfully `2026-11-10T16:54:56Z`; [check API](https://api.github.com/repos/stellar/stellar-docs/check-runs/129981067339). Its output identifies `docs/build/guides/auth/check-auth-tutorials.mdx` as the targeted update and says the production deployment is live.
- [Inbound #407](https://github.com/stellar-experimental/stellar-raven/issues/407): OPEN, author `ElliotFriend`, updated `2026-11-10T16:56:08Z`, no comments. Its build/deployment claims were treated as claims, independently repeated below.

## 2. Production fetch and byte identity

```sh
date -u '+%Y-%m-%dT%H:%M:%SZ'
curl --fail --location --silent --show-error --dump-header tmp/rv-sd101-evidence/live.headers \
  https://developers.stellar.org/docs/build/guides/auth/check-auth-tutorials.md \
  -o tmp/rv-sd101-evidence/live.md
shasum -a 256 tmp/rv-sd101-evidence/live.md
```

Fetch start and finish: **2026-11-10T22:51:08Z**. HTTP 200; content type `text/markdown; charset=utf-8`; 60,778 bytes. Response date is the same UTC second; `x-version: dpl_596ePT575z4qnAFksq1biRW97aLY`.

- Served page SHA-256: `58bc90a34748ec864a582279d0a7a36b7ba67c07e7bd06c283a875541fc0aa11`.
- Tutorial 2 complete Rust fence SHA-256 (includes supplied final newline): `8699bc9cef036cb7d491a09b5181c2a76ee934d2075e9d8779057f8fd90f0055`.
- Tutorial 1 complete contract SHA-256: `ed0a018aabf40d428cfa826ce0c029988f38143605c8db9eaa98ab101b5730b2`.
- Tutorial 1 following test fence SHA-256: `4fa1a745d35ac3276ad23a5fa0b5deac9c327d44288e108e131d095a07a1c5f7`.

An initial Python urllib fetch received HTTP 403; the subsequent curl request above succeeded. No content was accepted from the failed request.

I fetched raw source through `gh api 'repos/stellar/stellar-docs/contents/docs/build/guides/auth/check-auth-tutorials.mdx?ref=d5df6416769d3645028b2062be26c4e598a271a1' -H 'Accept: application/vnd.github.raw+json'`. Both complete-contract fences and Tutorial 1's test fence are byte-identical between production and [merge source](https://github.com/stellar/stellar-docs/blob/d5df6416769d3645028b2062be26c4e598a271a1/docs/build/guides/auth/check-auth-tutorials.mdx). This corroborates deployment independently of the check status.

## 3. Original trigger, freshly executed

I split the fetched Markdown on `#### Complete code`, selected the second section, and extracted the first Rust fence using `^```rust[^\n]*\n(.*?)^```` with multiline/dotall matching. Its body was written unchanged to `tmp/rv-sd101-evidence/tutorial2/src/lib.rs`. The final source digest was rechecked after all tests and remains the value above.

Toolchain:

```text
rustc 1.93.0 (254b59607 2026-01-19)
cargo 1.93.0 (083ac5135 2025-12-15)
```

The page documents `soroban-sdk = { workspace = true }`, not a concrete SDK version. Per the brief I resolved that workspace dependency to exactly 29.0.1; serde dependency declarations were copied from the page. The testutils dev dependency is the harness setup needed for the page's embedded native test, not an additional fix to its Rust source.

```toml
[package]
name = "review-tutorial2"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
soroban-sdk = "=29.0.1"
serde = { version = "1", default-features = false, features = ["derive"] }
serde-json-core = { version = "0.6", default-features = false }

[dev-dependencies]
soroban-sdk = { version = "=29.0.1", features = ["testutils"] }
```

Resolved versions: SDK 29.0.1, serde 1.0.229, serde-json-core 0.6.0. Lockfile retained. Commands ran in the scratch crate with `CARGO_TARGET_DIR` pointing to `tmp/rv-sd101-evidence/target`:

| Command | UTC start → finish | Result |
|---|---|---|
| `cargo check --offline` | 22:51:49.116 → 22:52:23.054 | exit 0; no errors or warnings |
| `cargo test --offline` | 22:52:23.055 → 22:53:01.875 | exit 0; 1 passed, 0 failed; 0 doctests; no errors or warnings |

```text
running 1 test
test test::test ... ok
test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

Full logs: `tutorial2-check.log`, `tutorial2-test.log`; exact timings: `build-results.json`; runner: `run-builds.py`.

Definitions are present in the served complete fence: `const WEEK_OF_LEDGERS`, `const ADMIN_SIGNER_COUNT`, and `struct ClientDataJson<'a>`. There are **zero `base64_url::` calls anywhere on the served page**; both walkthrough and complete contract call their supplied `encode` function.

## 4. Walkthrough, changed behavior, and residuals

There are exactly two `Complete code` sections. Tutorial 2's eight Rust walkthrough fences match their corresponding complete-code portions after whitespace normalization, with one nonfunctional comment difference: “Set” versus “Get” the maximum TTL. The updated constructor/authentication prose agrees with the code. Constants, error variants, serde types, base64 calls, validation order, and saturation math agree between both versions.

A separate scratch crate, `adjacent/`, preserves the verbatim Tutorial 2 source prefix and appends reviewer tests. `cargo test --offline --manifest-path tmp/rv-sd101-evidence/adjacent/Cargo.toml` passed **5 tests**, including the page's original test, without warnings (`adjacent-test.log`). The added tests independently establish:

- Eight malformed-input/unknown-signer cases return their expected typed errors: short and oversized authenticator data, absent User Present, oversized client data, malformed JSON, wrong WebAuthn type, wrong challenge, unknown signer.
- `add` without wallet auth is rejected.
- Constructor initialization succeeds with max TTL below one week.
- The duplicate-admin accounting defect below reproduces.

No newly introduced regression was found in the changed behavior exercised here. These are bounded native checks, not a full security audit or a wasm/deployment test.

### Successor A — Tutorial 1 complete example and test are not runnable with SDK 29.0.1

Owner/surface: `stellar/stellar-docs`, docs-content, same page, Tutorial 1. This is separate from sd-101's Tutorial 2 omissions.

Reproduction: copy the first complete Rust fence to `src/lib.rs` and the following “These are the test cases” Rust fence to `src/test.rs`. Use SDK 29.0.1 plus its testutils dev feature. No repairs were applied to `tutorial1/`.

```text
cargo check --offline: exit 101
error[E0432]: unresolved import `soroban_sdk::Hash`
 --> src/lib.rs:4:18

cargo test --offline: exit 101
error[E0432]: unresolved import `soroban_sdk::Hash`
error[E0432]: unresolved import `ed25519_dalek` (two imports)
error[E0432]: unresolved import `rand`
error[E0425]: cannot find type `Vec` in this scope
 --> src/test.rs:29:46
```

The walkthrough already imports `crypto::Hash`; the complete fence incorrectly imports root `Hash`. The page gives no Tutorial 1 test dependency setup. Full original logs: `tutorial1-check.log`, `tutorial1-test.log`; both ran at 22:53:01–22:53:04Z.

I continued in **a repaired scratch copy only** to distinguish compile failures from later runtime failures. Correcting `crypto::Hash` and the `Vec` import, declaring `ed25519-dalek 2.2.0` with `rand_core` and `rand 0.8.8`, and adapting old `Keypair` calls to `SigningKey` gets the test through compilation. It then fails at its hardcoded `protocol_version: 1`:

```text
HostError: Error(Context, InternalError)
"ledger protocol version too old for host", 1
```

The compiler also warns that the test's `... == AccError::TimeLimitExceeded;` discards its result instead of asserting, and that `AccountContractClient` hides an elided lifetime. After preserving `env.ledger().get().protocol_version` in both ledger updates, adding `assert_eq!`, and spelling `AccountContractClient<'_>`, that scratch copy passes its one test with no warnings. Full repair evidence: `tutorial1-repaired/`, `tutorial1-repaired-test.log`, `tutorial1-repaired-final-test.log` (an intermediate deprecated protocol-version getter experiment is separately preserved in `tutorial1-repaired-deprecation-test.log`).

Recommendation: synchronize the complete import with the walkthrough, document compatible test dependencies/API usage, import `Vec`, preserve a supported test ledger protocol version, and make the expected-error check an actual assertion. Compile and run the complete contract and its supplied test before marking this successor fixed.

Provenance: Tutorial 1 is **byte-identical** between PR parent `0678e4dcd49cbbd813f996957cdd5197976a520e` and merge commit. This PR did not introduce these defects.

### Successor B — Re-adding an existing admin inflates its count and permits removal of the last admin

Owner/surface: `stellar/stellar-docs`, docs-content, Tutorial 2's walkthrough and complete contract, `set_signer` / `update_admin_signer_count` / `remove`.

The admin branch increments `ADMIN_SIGNER_COUNT` unconditionally, even when it overwrites an existing persistent signer. `remove` trusts that count to prevent the final admin from being removed. The invariant can therefore be bypassed through ordinary authorized signer management, leaving no administrator.

Fresh reproduction is the passing test `independent_review::duplicate_admin_allows_removing_last_actual_admin` in `adjacent/src/lib.rs`:

1. Register the unmodified served contract with one constructor admin ID/key.
2. Enable `env.mock_all_auths()` **only to represent legitimate wallet-authorized management calls**, not to claim an unauthenticated exploit.
3. Call `client.add(&same_id, &same_pk, &true)`.
4. Observe count `Some(2)` with only one persistent signer ID.
5. Call `client.remove(&same_id)`; it succeeds.
6. Observe the signer absent while admin count remains `Some(1)`.

Expected: replacing/re-adding an existing admin must not increment the number of distinct admins, and removing the sole admin must fail. Actual: the wallet can lose all stored admin authority while claiming an admin remains. This does not show unauthorized takeover. It demonstrates a management-triggered loss of the invariant intended to prevent lockout.

Recommendation: increment only when introducing a distinct persistent admin (including promotion from session status); maintain count through replacements/promotions/demotions/removals; test duplicate-ID updates and rejection of final-admin removal. Preserve this in a separate finding, not sd-101's compilation record.

Provenance: the parent's `add` already increments unconditionally before setting the same persistent key. PR3081 moved that logic into `set_signer`; it did not introduce the accounting flaw. The parent and merged raw sources are retained as `parent.mdx` and `merge.mdx`.

A search of active improvements and resolved receipts for the diagnostic names, duplicate-admin and last-admin descriptions found no existing dedicated finding covering these two residuals. The coordinator should assign new IDs from the then-current maximum, not reuse sd-101.

## 5. Persistent reference inventory and retirement conditions

I ran the requested `rg -n --glob '!node_modules/**' 'sd-101' .`, then repeated with `--hidden --glob '!.git/**' --glob '!node_modules/**' --glob '!tmp/**'` to cover `.agents/`. Exact initial persistent matches are in `references.txt`; a final filename scan at **22:56:07Z** also found the coordinator's newly created current-round ledger. I did not read that ledger's author-side findings.

| Persistent location | References and reconciliation |
|---|---|
| `improvements/stellar-docs/sd-101-webauthn-complete-example-missing-definitions.md:2` | Active record: add independent live evidence and resolving ref, then remove through resolver after successors/comments are handled. It has no probe frontmatter. |
| `improvements/INDEX.md:56` | Generated active row: regenerate with resolver/index script; never hand-edit. |
| `improvements/resolved.json:1658,1659` | sd-098's dated receipt identifies sd-101 as its then-unresolved successor. Preserve historical evidence; append the new sd-101 receipt to close the chain. Do not rewrite the old observation as if the later fix existed then. |
| `.agents/TODO.md:81` and following paragraph | Active task says PR3081 awaits deployment and complete compilation is broken. Replace this stale wake-up with the verified result and successor work; retain unrelated docs work. |
| `.agents/rounds/2026-11-09-upstream-handoffs.md:42,55,65,66,68` | Historical table, successor explanation, and filing record. Retain dated facts and upstream URLs; link current resolution if clarification is needed. Do not rewrite old verification as current state. |
| `research/audits/2026-11-09-improvements-sweep/lane-docs.md:33,404` | Dated still-repro table/section. Preserve historical evidence; current round supplies the new result. |
| `research/audits/2026-11-09-improvements-sweep/review-astra-sd100.md:60` | Historical instruction to retain unrelated sd-101 work. No live task remains in that audit; preserve. |
| `.agents/rounds/2026-11-10-truth-maintenance.md` | Appeared during this review. Coordinator owns reconciliation with this verdict, evidence, successor IDs, and resolution action. Its contents were not used as independent evidence. |
| Golden corpus and `eval/qa/consistency-register.json` | No `sd-101` reference. Broader searches for the page/omitted symbols found conceptual account/WebAuthn goldens, not a compilation workaround or partial cap tied to this finding. No automatic golden or register edit justified. |
| `improvements/intake.json` | No per-finding sd-101 override. Normal stellar-docs service routing applies; no override to remove. |

**Cleanup is not yet verified and is not authorized in this reviewer lane.** The active file/index row still exist and no sd-101 resolved receipt has been appended by me. Required coordinator finalization:

1. Preserve the two self-contained residuals in appropriately deduplicated successor records; link them from the sd-101 resolution context.
2. Post/read back dated live result plus commit-pinned Raven source on upstream issue3079 and resolving PR3081, as required by the follow-up runbook; acknowledge/close inbound407 with the scoped outcome. At my upstream read, none contained a post-recheck Raven resolution comment.
3. Dry-run and execute the resolver with the independent evidence, resolving refs, references-reviewed and upstream-commented assertions only after true; verify active deletion, absence of any probe/intake override, regenerated index and complete receipt.
4. Reconcile the current TODO/round ledger and run applicable improvements gates. No repo code changed in this lane, so baseline repo code tests are not pertinent to this report.

The observed dirty-tree changes belong to other lanes. I changed only scratch artifacts under `tmp/` and removed only the five build terminals I created (`t3kt`, `t3m1`–`t3m4`).
