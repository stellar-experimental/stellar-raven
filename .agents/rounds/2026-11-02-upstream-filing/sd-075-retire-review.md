# Distinct review: sd-075

Verdict: **RETIRE**

Reviewer: Grok (this session). No repository files were edited. Nothing was posted to GitHub.
Worktree: `/private/tmp/claude-501/raven-sd075-1102`, branch `improvements/resolve-sd-075`.
At the end of this review, `HEAD` is `d0260c937ffe921c0693f17a68ce3bc875d61335`.
`origin/main` is `d6ad7350046e8e283cda4c19b553dc903041d019`. The branch is 1 commit ahead of `origin/main`.
Finding file still present: `improvements/stellar-docs/sd-075-hello-world-build-wrapper-claim.md` (`status: fixed-upstream`).
`improvements/resolved.json` has no `sd-075` entry. `improvements/intake.json` has no `sd-075` override. The finding has no probe.

The upstream fix is deployed. No stellar-docs page still presents plain `cargo build --target wasm32v1-none --release` as an equivalent shortcut. The golden answer is unchanged. The author's pointer at the resolved receipt is early: the receipt and the cited ledger heading are not in the tree yet. Add both in the retirement commit. Do not ship `d0260c93` alone.

## Upstream refs

Read with `gh` at 2026-11-02T21:26:14Z. Issue state read again at 2026-11-02T21:33:31Z.

| Ref | State | Time |
|---|---|---|
| https://github.com/stellar/stellar-docs/pull/2991 | MERGED | `mergedAt` 2026-11-02T20:13:29Z |
| Merge commit `42ad5aa26a77ebb79cb560cb4e177fea83d1f72a` | on main | committer date 2026-11-02T20:13:28Z |
| https://github.com/stellar/stellar-docs/issues/2974 | CLOSED | `closedAt` 2026-11-02T20:13:30Z |

PR title: "Build contracts with stellar contract build and fix wasm32v1-none paths".
Issue title: "Hello World and the smart-contracts skill: the build commands and wasm paths they show fail".
Issue author: `oceans404` (Steph). Closed by PR 2991.
ElliotFriend (MEMBER) approved the PR at 2026-11-02T20:13:11Z on commit `6b1e44098802152ed290acef412ffb1d83c7bf33`.
Raven did not open the issue. That matches the finding evidence.

Issue comments at 2026-11-02T21:33:31Z, authors only:

- `stellar-triage-bot[bot]` 2026-11-01T21:49:22Z
- `oceans404` 2026-11-01T22:12:41Z (`/triage`)
- `stellar-triage-bot[bot]` 2026-11-02T00:55:01Z
- `stellar-triage-bot[bot]` 2026-11-02T02:50:29Z

PR issue comments:

- `mintlify[bot]` 2026-11-02T00:57:51Z (preview)
- `stellar-triage-bot[bot]` 2026-11-02T13:22:15Z

No resolution comment from this repo is on either ref. Use `--upstream-comment-na`. The finding was never filed by Raven. Do not pass `--upstream-commented`.

The PR's pre-merge check "Mintlify Deployment" completed success at 2026-11-02T00:58:38Z. That run is the preview. It is not the production deploy.

## Deployed, not only merged

Production host checked at 2026-11-02T21:28:00Z.

- URL: https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world
- HTTP 200. `date: Mon, 02 Nov 2026 21:28:00 GMT`. `cf-cache-status: DYNAMIC`. `age: 4395`. `last-modified: Mon, 02 Nov 2026 21:23:42 GMT`. `cf-ray: a54639fca955ade3-ATL`. `x-mintlify-client-version: 0.0.4045`.
- JSON-LD `dateModified`: `2026-11-02T20:14:03.327Z`.
- `deploymentId`: `dpl_36EDyZCDfRuoUD9af5CH4M1bqY2h`.

Markdown URL checked at 2026-11-02T21:28:01Z:

- https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world.md
- HTTP 200. `date: Mon, 02 Nov 2026 21:28:01 GMT`. `last-modified: Mon, 02 Nov 2026 20:20:24 GMT`. `age: 4056`. `cf-cache-status: DYNAMIC`. `cf-ray: a54639fdebab48cf-ATL`.

The HTML body and the markdown both contain this sentence:

> This is a wrapper around `cargo build` that sets the target to `wasm32v1-none` and the profile to `release` (it also optimizes the resulting `.wasm` file by default). It also processes the contract's specification after the build, a step that `soroban-sdk` 28 and later requires. For this reason, always build contracts with `stellar contract build`. With `soroban-sdk` 28 or later, running `cargo build --target wasm32v1-none --release` directly fails with the error `soroban-sdk requires stellar-cli v25.2.0+ to build a contract`.

The markdown has zero matches for `shortcut for`. The HTML matches for `shortcut` are `rel="shortcut icon"` only.

Source on GitHub, fetched 2026-11-02T21:28:25Z. The same sentence is line 309 of `docs/build/smart-contracts/getting-started/hello-world.mdx` at:

- merge commit `42ad5aa26a77ebb79cb560cb4e177fea83d1f72a`
- main `85d2d1b8e7a4451b7a6af0931f587ce73109b816` (committer date 2026-11-02T20:14:01Z, "Fund testnet accounts with fundAddress in the agent skills (#2988)")

`dateModified` 2026-11-02T20:14:03.327Z is after that main commit. The live sentence matches that file.

On the merge commit, check run "Mintlify Deployment" completed success at 2026-11-02T20:14:18Z (started 2026-11-02T20:13:52Z).

GitHub deployments API at 2026-11-02T21:29:06Z lists Mintlify entries as environment `staging` and description "Mintlify Preview Deployment". The newest ones include sha `85d2d1b8e7a4` at 2026-11-02T20:14:19Z and 2026-11-02T20:14:43Z. No deployment in that list uses environment `production`. The production proof is the live host above.

Pre-fix source, parent of the merge, `d1469871805ef641f542ae6be0eebea109ef6602`, fetched 2026-11-02T21:33:31Z. `hello-world.mdx` lines 309-312:

> This is a small wrapper around `cargo build` that sets the target to `wasm32v1-none` and the profile to `release` (it also [optimizes](#optimizing-builds) the resulting `.wasm` file by default). You can think of it as a shortcut for the following command:
>
> ```sh
> cargo build --target wasm32v1-none --release
> ```

That sentence is gone on the live page.

## SDK build.rs at release tags

Fetched 2026-11-02T21:29:48Z.

- Tag `v28.0.0` is commit `48d506712f964094d14176e2f0b02afcd1054567`, committer date 2026-09-18T00:34:38Z.
- Tag `v29.0.1` is commit `e1671a0cb58d4b8c0bb8de115caf080ca01676e8`, committer date 2026-10-12T21:15:01Z.
- File: `soroban-sdk/build.rs` at both tags.

Both files contain:

```rust
let env_name = "SOROBAN_SDK_BUILD_SYSTEM_SUPPORTS_SPEC_SHAKING_V2";
println!("cargo::rerun-if-env-changed={env_name}");
if std::env::var(env_name).is_err()
    && std::env::var("CARGO_CFG_TARGET_FAMILY").unwrap_or_default() == "wasm"
{
    eprintln!(
        "\
\nerror: soroban-sdk requires stellar-cli v25.2.0+ to build a contract\
\n\
\nTo fix, build with `stellar contract build` using stellar-cli v25.2.0+.\
"
    );
    std::process::exit(1);
}
```

The live docs quote the first error line. The gate exists at the v28.0.0 tag and at the v29.0.1 tag. It applies to a Wasm target when the CLI marker is absent. It is not limited to the literal command `cargo build`.

## Residuals

`TEMPLATE.mdx` before the merge (same parent, fetched 2026-11-02T21:28:25Z), lines 132-135:

> To build the contract, use the `cargo build` command.
>
> ```sh
> cargo build --target wasm32v1-none --release
> ```

Current main `85d2d1b8e7a4451b7a6af0931f587ce73109b816`, lines 132-135:

> To build the contract, use the `stellar contract build` command.
>
> ```sh
> stellar contract build
> ```

Publication check at 2026-11-02T21:31:06Z:

- `.mintignore` on that main sha, line 14: `/docs/build/smart-contracts/example-contracts/TEMPLATE.mdx`
- https://developers.stellar.org/docs/build/smart-contracts/example-contracts/TEMPLATE returns HTTP 404
- https://developers.stellar.org/docs/build/smart-contracts/example-contracts/TEMPLATE.mdx returns HTTP 404

The template residual is fixed in source. The template is not a published page.

GitHub code search, repo `stellar/stellar-docs`, default branch:

- 2026-11-02T21:28:36Z, query `shortcut for`: no code hits.
- 2026-11-02T21:28:36Z, query `cargo build --target wasm32v1-none`: hello-world (says the command fails) and `docs/tools/cli/agent-cli/guides/build-and-deploy-contracts.mdx` (tells the agent not to use that command).
- 2026-11-02T21:29:48Z, query `cargo build`: those two pages, `.mintlify/skills/smart-contracts/SKILL.md`, and `docs/build/smart-contracts/example-contracts/fuzzing.mdx`.

Skill source on main, fetched 2026-11-02T21:31:06Z:

- Line 138: `stellar contract build`
- Lines 712-714: CI runs `rustup target add wasm32v1-none` and `stellar contract build`
- Line 718: `Build with stellar contract build, not cargo build: soroban-sdk 28+ fails a plain cargo build for a wasm target.`

The docs host returns HTTP 404 for `/.mintlify/skills/smart-contracts/SKILL.md` and `/mintlify/skills/smart-contracts/SKILL.md` (same check time). The repo copy no longer shows the failing command as the build procedure.

Adjacent text that does not restate the retired claim:

- `fuzzing.mdx` line 197, fetched 2026-11-02T21:31:06Z: "This can be worked around by building the contract with either `soroban contract build` or `cargo rustc --crate-type cdylib` instead of the typical `cargo build`." This is an LTO note. It uses the old CLI name. It does not call plain `cargo build --target wasm32v1-none --release` a shortcut for `stellar contract build`.
- Live https://developers.stellar.org/docs/build/guides/transactions/upload-wasm-bytecode.md at 2026-11-02T21:31:37Z (HTTP 200, `last-modified` the same second) shows `stellar contract build` and then a shell comment: `# cargo rustc --manifest-path=contracts/hello_world/Cargo.toml --crate-type=cdylib --target=wasm32v1-none --release`. The command the reader runs is `stellar contract build`.

No successor finding.

## sd-075 references

`rg -n "sd-075" . --glob '!node_modules/**' --glob '!.git/**'` at 2026-11-02T21:32:33Z:

- `improvements/INDEX.md` (generated; the resolver regenerates this when the file is deleted)
- `improvements/stellar-docs/sd-075-hello-world-build-wrapper-claim.md` (delete on retire)
- `eval/qa/corpus/battery/soroban/q-sor-build-target-wasm32v1.json`
- `eval/qa/cases.json`
- `eval/qa/consistency-register.json` (two re-sweep reasons)
- Dated round notes under `.agents/rounds/` keep the id. Leave those notes as history.

No intake override. No probe entry.

## Golden change

Commit `d0260c937ffe921c0693f17a68ce3bc875d61335` (author date 2026-11-02T21:28:42Z), message "eval: point q-sor-build-target-wasm32v1 at the sd-075 resolved receipt".
Compared with parent `d6ad7350` at 2026-11-02T21:32:33Z.

Unchanged: `golden.answer`, `golden.keyFacts`, `golden.avoid`, `truth.claims`, `truth.sources`, `truth.status` (`confirmed`).

Changed pointer only:

- `golden.notes` now ends the fix sentence with `finding sd-075, resolved 2026-11-02; see improvements/resolved.json`.
- `truth.verified.rootCause` second item is `improvements/resolved.json entry sd-075 (fixed upstream by stellar/stellar-docs#2991, merged 2026-11-02)`.
- `truth.verified.by` is `sd-075 resolver pass 2026-11-02 (.agents/rounds/2026-11-02-upstream-filing.md, "Resolver pass: sd-075")`.

Hashes recomputed at 2026-11-02T21:32:33Z and they match the commit:

- Raw case file sha256 `1563846d3a312dc7ae701c986d9b5a86248535ba38dc7a19a6c321c6f1e5ca63` equals both `memberContentSha256` values in `eval/qa/consistency-register.json`.
- `contentSha256` of the case is `5131c06cc5b691d81750587bb84d33da4f02a048008332454d328c2f9896ea28`. `eval/qa/lifecycle-registry.json` stores that value.
- `sha256(JSON.stringify(cases))` is `8d8400a43e0477b17deb49be2922dc1f9db48d7f00bef27f6142152900d3f2a0`. `eval/qa/cases.json` and `eval/qa/sample.json` both store that value. The cases.json copy of this case has the same canonical hash as the corpus file.

The judged truth is unchanged. The pointer is not correct yet:

- `improvements/resolved.json` has no `sd-075` receipt.
- `.agents/rounds/2026-11-02-upstream-filing.md` has no heading `Resolver pass: sd-075`. It has `Resolver pass: sd-056`. Its follow-up still says: "Retire `sd-075` to `improvements/resolved.json` in the next resolver pass."
- The re-sweep reason says the notes point at the receipt "instead of the deleted finding file." The finding file is still present.

Put the receipt, the index regeneration, the finding deletion, and a real ledger heading in the retirement commit. Until that commit, `d0260c93` cites a receipt and a section that are not there.

## Retirement mechanics still to do

This review does not run the resolver.

- Append a complete `sd-075` receipt to `improvements/resolved.json`.
- Delete the active finding file. Regenerate `improvements/INDEX.md`.
- There is no per-finding intake override to remove.
- Pass `--upstream-comment-na`.
- Keep the golden pointer only in the commit that adds the receipt. Fix the `by` heading so it names a section that exists.
- Live recheck string can cite the 2026-11-02T21:28:00Z production fetch and the sentence quoted above.
