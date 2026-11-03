# Independent review: stellar-dev skill pin

Verdict: APPROVE

Reviewer: Grok, read-only. The author is the Codex lane in `tmp/pin/REPORT.md`.
This review did not edit a tracked file, commit, push, start an agent, or read `.dev.vars`.

## Findings

No findings.

## Evidence

### 1. The pin moved only through `ecosystem-skills/update.sh`

`git diff origin/main` changes 11 tracked files. The source pin change is only `stellar-dev`.

`ecosystem-skills/MANIFEST.json:192` pins `9c604c2be6ae69f962fbb578bce6b681d462fea5`.
`git ls-remote https://github.com/stellar/stellar-dev-skill.git refs/heads/main` returns that same commit.
The GitHub commit API reports committer date `2026-11-02T22:48:07Z`. That matches `commit_date` in the manifest.
Compare against `main` reports `status: identical`.

Against `origin/main`, the manifest changes are:

- `stellar-dev` commit `cac64041d0c759a3b10ce6fba4fa3e0672bcbe0f` to `9c604c2be6ae69f962fbb578bce6b681d462fea5`
- eight existing blob hashes, plus new `assets/regulated-assets.md`
- top-level `synced_at`

The other four source commits and their file blobs are unchanged.
`ecosystem-skills/catalog.json` and `ecosystem-skills/community.json` change only `fetched_at`.
`tmp/pin/update.log` shows `update.sh` pinned `stellar-dev` at `9c604c2be6ae` and printed nine body diffs.
`node scripts/check-pin-review.mjs --digests` prints `stellar-dev 9c604c2be6ae sel:257d79093df5`.
`node scripts/check-pin-review.mjs --base origin/main` reports that one selection change, and it is recorded at `ecosystem-skills/PIN-REVIEW.md:51`.

The GitHub tree at that commit has 23 `skills/` blobs. All 23 match the manifest path, git blob sha, and size.
A raw fetch of all 23 files matches `git hash-object` and the manifest sha.
The nine changed files also match the SHA-256 values in `tmp/pin/pin-verification.json`.
The manifest holds 67 files: lumenloop 15, openzeppelin-stellar 3, stellar-dev 23, stellar-light 4, trustless-work 22.
`tmp/pin/mirrors-fetch.exit` is 0. This review re-hashed the 23 `stellar-dev` files. The other 44 blobs are unchanged from `origin/main`.

### 2. The nine skill bodies

`tmp/pin/update.log` is the full old-to-new line diff. This review fetched both commits and re-diffed the files.
No changed text contains an instruction override, a literal credential, a retired skill id, or a non-exposed operation name.
`assertNoNonExposedRefsInText` passes on all nine raw bodies. The exposure scrub does not change those bytes.
`assertNoNonExposedRefs` passes on the rebuilt catalog (284 entries).

Checked claims:

- SEP-0008 text matches the current spec: both auth flags, the three `[[CURRENCIES]]` fields, the five-operation payment shape, the five response statuses, `timeout` 0, HTTP 400 on `rejected`, `Access-Control-Allow-Origin: *`, and "the server signs and the wallet submits." The revised-transaction check matches the spec's source-account warning.
- The Go reference server is gone. `stellar/go-stellar-sdk` commit `bbdf313247f7` (2025-10-29) removes `services/regulated-assets-approval-server`. The path is HTTP 404 on `main`.
- `@stellar/stellar-sdk` 17.4.0 `pollTransaction` defaults to 30 attempts. `BasicSleepStrategy` sleeps 1000 ms. `parseRawSendTransaction` maps `errorResultXdr` to `errorResult`.
- stellar-core `TRANSACTION_QUEUE_BAN_LEDGERS` is 10. The retry text matches that ban.
- Horizon root on 2026-11-03 reports protocol 29. `soroban-sdk` 29.0.1 is the latest stable crate. `stellar-cli` tag `v28.1.0` exists and is the latest release.
- SDK 28 requires `stellar contract build` and CLI v25.2.0 or newer. `deploy_contract` and `update_current_contract(ContractExecutable)` are the CAP-85 replacements. The skill states both.
- SDK 29 `InvocationResourceLimits::mainnet()` is instructions 400000000, memory 41943040, ledger entries 400, disk-read entries 200, write entries 200, disk-read bytes 200000, write bytes 132096. The edited limits table matches that snapshot.
- `skills/dapp/SKILL.md:3` still ends with `Blux is also an option.` The catalog description for `skills.stellar-dev.dapp` does not. `scripts/description-notes.mjs:34` still holds the override.
- `skills/dapp/SKILL.md:332` still says to batch a contract call with classic operations. That is the recorded `sk-037` claim. The pin does not present it as fixed. `improvements/` is unchanged.

One upstream symbol is shorter than the XDR name. `assets/regulated-assets.md` says `AUTHORIZED_TO_MAINTAIN_LIABILITIES`. The XDR flag is `AUTHORIZED_TO_MAINTAIN_LIABILITIES_FLAG`. The SEP-0008 text itself uses a third spelling. The instruction still names the maintain-liabilities state. It does not block this pin.

### 3. `assets/regulated-assets.md` is wired as a companion

The assets skill links the file directly (`skills/assets/SKILL.md`, the new SEP-0008 paragraph).
The catalog adds one id: `skills.stellar-dev.assets#file:regulated-assets.md` at `catalog/manifest.json:25579`.
`searchable` is false. `kind` is `skill-section`. The transport has no `section` field. That matches `skills.stellar-dev.cross-chain#file:cctp.md`.
Blob `3c2d4d5eea1e21df8b66b68bd04d0b6a8292a09f` and SHA-256 `db38238c113adfdecf7260f31b47ff91cb0bcf3ae160fd2f14118174d9776650` match the raw file.
A local `readSkill` of `skills.stellar-dev.assets` with `sections: ["file:regulated-assets.md"]` returns one section. The section starts with `# Regulated Assets (SEP-0008)`. `availableSections` includes that id.
Searchable whole skills stay 20. No new callable operation exists. All 60 operation records are byte-identical to `origin/main`.
`specs/super-spec.json` adds `file:regulated-assets.md` to the assets section list and sets `catalogEntries` to 284.
`src/mcp/micro-map.ts` changes the skills line from 203 sections to 204 sections.

### 4. `eval/gates.json` and the 544 routing rows

A structural diff of `eval/gates.json` against `origin/main` changes two values only:

- `eval/gates.json:9` catalog SHA-256, from `88ab54571841313ac6641351233d11cdbe55eb4b5a9aaee63dec66cc1099063a` to `df6d79cfe1c0925ff56eeac90bfebc1298ce59272826602637d0ffa578bd25c7`
- `eval/gates.json:54`, the note

`shasum -a 256 catalog/manifest.json` equals the new fingerprint.
`baselinedAt` stays `2026-11-03T17:11:57.560Z`. No threshold, accepted total, label, or other input hash moved.

`tmp/pin/routing-comparison.json` names the before and after result files. This review recomputed every row from those files.
Each file has 338 legacy, 122 extended, 23 skills, 49 holdout, and 12 protocol-history rows (544).
Zero rows differ in grade, top-hit id, rank, or score.
The same full-case compare of `routing-2026-11-03T17-56-21-237Z.json` to the last result, `routing-2026-11-03T18-00-09-573Z.json`, also has zero diffs.
That last run uses catalog SHA-256 `df6d79cf…` and `gate.pass` true.
Lane totals match the report: legacy 219/293/327 and cardHit5 113; skills 17/23/23 and cardHit5 23; holdout 12/27/30, cardHit5 30, forbidden captures 10, passed 25.

`tmp/pin/before-ranked.json`, `after-ranked.json`, and `final-ranked.json` are byte-identical for 495 cases.
The ranked dump omits holdout. 495 + 49 = 544. The holdout rows are in the full result compare above.

### 5. Test counts match the catalog

The current catalog has 284 entries: 60 operations, 20 whole skills, and 204 skill sections.
Entries with `service: "skills"` number 224. Searchable whole skills number 20.
`test/catalog.test.ts:364` expects 204 sections. `test/catalog.test.ts:369` expects 284 entries.
`test/skills.test.ts:82` expects 224 pinned skill transports.
The old catalog was 283 entries, 203 sections, and 223 skill transports. The increase is the one companion.

### 6. `tmp/pin/TODO.patch` is accurate

`git apply --check tmp/pin/TODO.patch` exits 0.
The patch updates the open pin item in `.agents/TODO.md`. It does not mark the item done.
It keeps the overnight QA release condition from the current item.
The new sentences match the checks above: commit `9c604c2b`, nine diffs, the companion, 67 files, 284 entries, 204 sections, 544 identical rows, fingerprint-only gate edit, the dapp override, and unfixed `sk-037`.
This lane did not write `.agents/`.

## Scope note

Deployment and production `codemode.skill.read` remain with the coordinator.
This review accepts the pin for that handoff. It does not deploy it.
