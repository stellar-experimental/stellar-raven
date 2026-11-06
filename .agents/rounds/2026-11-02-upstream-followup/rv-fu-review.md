> Copy of the first review report. Its relative links (`evidence/`, `evidence2/`, `fixtures/`) point
> to the reviewer's scratch folder `tmp/rv-fu/` in the review worktree. That folder is not committed.
> The findings restate the evidence that a stranger needs.

| Item | Severity | Verdict | Required action |
| --- | --- | --- | --- |
| `sd-055` | BLOCKER | RETIRE-WITH-SUCCESSOR | Preserve the separate contract-restoration defects before deletion. |
| `sd-057` | NOTE | RETIRE | Record the maintainer's accepted scope adjustment. Complete the deletion steps. |
| `sls-085` | FIX | RETIRE | Repair the research link and two active finding references. |
| `sls-086` | FIX | RETIRE | Repair the research link. |
| `sls-088` | FIX | RETIRE-WITH-SUCCESSOR | Preserve the missing fixture-source paths as a separate residual. |
| `wai-001` | FIX | KEEP `declined-upstream` | Correct stale body text and qualify the retirement condition. |
| `sd-048` | NOTE | KEEP `reported-upstream` | The stale-bot closure did not fix the contradiction. |
| `sd-059` | FIX | KEEP | Name the tested search path. Limit the conclusions to the evidence. |
| `sd-080` | BLOCKER | FILE-WITH-FIXES | Correct the Cargo claim and supply the intake override. |
| Round ledger | FIX | Correct before completion | Separate completed actions, pending actions, and later upstream changes. |
| Search TODO addition | FIX | Keep with corrections | All seven queries return a relevant result-code page first. |
| Migration TODO addition | FIX | Keep with corrections | Distinguish module availability from catalog-ID support. |

# Review basis

Reviewer: Codex, distinct from the Claude Opus author.
Target: commit `26e4e4207eb59da0268a9b1c71b181cf35b61c1f` on `improvements-followup-1102`.
I collected fresh evidence on 2026-11-02, between approximately 22:34Z and 22:45Z.
I read the required skill sections, the filing style reference, and `improvements/README.md`.
I also read `PLAN.md`, `ARCHITECTURE.md`, the findings, and the complete target diff.

BLOCKER stops the named retirement or filing step.
FIX requires a correction to the record or its references.
NOTE records a supported result or a verification limit.
A RETIRE verdict confirms the substantive fix; it does not replace the resolver's required steps.

I used `gh api` for GitHub reads.
The evidence directory contains the returned issue bodies, comments, PR bodies, patches, reviews, and check results.
I fetched deployed pages with `curl`, rather than treating a merge as deployment evidence.
The SDK tests used local fixtures and submitted no network transaction.
The Soroswap checks used unsigned simulation only.

Evidence files are under [evidence/](evidence/).
The local SDK harness is [fixtures/check-docs.mjs](fixtures/check-docs.mjs).
Its output is [sdk-check.log](evidence/sdk-check.log).
The original and hidden-reference scans have separate files for each candidate.

# A1. `sd-055` — BLOCKER — RETIRE-WITH-SUCCESSOR

Commands run:

```sh
gh api repos/stellar/stellar-docs/issues/2906
gh api repos/stellar/stellar-docs/issues/2906/comments
gh api repos/stellar/stellar-docs/pulls/2933
gh api repos/stellar/stellar-docs/pulls/2933/files
gh api repos/stellar/stellar-docs/pulls/2933/reviews
gh api repos/stellar/stellar-docs/issues/2933/comments
rg -n "sd-055" .
rg -n --hidden --glob '!.git/**' --glob '!tmp/**' "sd-055" .
```

I fetched these deployed Markdown paths under `https://developers.stellar.org/`:

- `docs/build/guides/archival/restore-data-js.md`
- `docs/learn/fundamentals/contract-development/storage/state-archival.md`
- `docs/build/guides/transactions/submit-transaction-wait-js.md`
- `docs/learn/fundamentals/contract-development/contract-interactions/transaction-simulation.md`
- `docs/build/guides/archival/restore-contract-js.md`

I ran `node check-docs.mjs` from `tmp/rv-fu/fixtures` with SDK `17.4.0`.
I also scanned the fresh docs checkout for `assembleTransaction\(`.

Observed result:

[PR #2933](https://github.com/stellar/stellar-docs/pull/2933) merged as `50531cb5ed71e72c01d9de748f24031cc5ef93ff`.
Issue #2906 closed at `2026-11-02T18:27:46Z`.
ElliotFriend approved the PR. Its reported check runs passed.
All five deployed Markdown reads returned HTTP 200.

Every correction requested by `sd-055` appears in the deployed repaired examples:

- All three affected assembly calls use `.build()` before signing.
- Both archival examples import `Operation` and set restoration time bounds.
- The shared polling helper returns or throws `finalStatus`.
- Both simulation examples use `new Server()`, `getAccount()`, and transaction time bounds.
- Example 1 awaits `prepareTransaction()`.
- The examples import the required helpers and use named invocation arguments.
- Example 2 awaits simulation and authorization through `Promise.all()`.
- Example 2 selects address credentials through current XDR fields.
- Its expiration uses `simResult.latestLedger + 12`.
- The other assembly examples retain `.build()`.

Fourteen execution checks passed against the deployed extracts.
Both archival functions passed success and restoration branches.
The signed restoration and retry transactions used sequences `1` and `2`.
The polling helper passed success, failure, not-found, and immediate rejection branches.
Example 1 passed with source authorization.
Example 2 passed with source, legacy address, and V2 address credentials.
The harness verified envelope signatures and authorization expiration.

The adjacent contract-restoration example still fails TypeScript parsing.
Its `getWasmLedgerKey` declaration has an empty return type.
The fifteenth harness check confirms that failure.
Both the state-archival page and `restore-contract-js.md` retain the defective example.

Further defects remain in that example:

- It omits the `xdr` import.
- It calls obsolete XDR getter methods.
- It attempts to derive a WASM hash from the instance ledger key.
- It passes a ledger response where the footprint needs a ledger key.
- It builds the restoration transaction without time bounds.

The repaired data-restoration snippets also redeclare `Api` when combined literally with the linked polling-guide imports.
PR #2933 names both residual areas explicitly.
Fresh upstream search found [issue #2562](https://github.com/stellar/stellar-docs/issues/2562).
That open issue already names the contract-restoration syntax defect and missing import.
Do not file a duplicate issue for those parts.

Required fix:

Create a self-contained successor named **Contract-restoration examples fail parsing and use obsolete ledger/XDR access**.
Include both deployed pages, the local failure, the shared-import problem, and issue #2562.
Deduplicate the remaining runtime corrections against #2562 before any additional filing.
Keep `sd-055` focused on its repaired assembly and simulation defects.

References to reconcile when deleting:

- Remove the `sd-055` override from `improvements/intake.json:238`.
- Regenerate `improvements/INDEX.md` after deletion.
- Append the resolution to `.agents/rounds/2026-11-02-upstream-followup.md:19`.
- Preserve the dated October backlog and golden-audit records as historical evidence.
- Preserve `.agents/rounds/2026-11-02-golden-audit/pass1/soroban-02.json:1452` as a dated observation.

No active golden or consistency-register entry contains `sd-055`.
I inspected `q-sor-deploy-invoke-from-js-sdk.json` separately.
Its prohibition against signing an unbuilt builder remains correct and needs no change.
No candidate probe requires removal.

# A2. `sd-057` — NOTE — RETIRE

Commands run:

```sh
gh api repos/stellar/stellar-docs/issues/2908
gh api repos/stellar/stellar-docs/pulls/2929
gh api repos/stellar/stellar-docs/pulls/2929/files
gh api repos/stellar/stellar-docs/pulls/2929/comments
gh api repos/stellar/stellar-docs/pulls/2929/reviews
curl -fsSL https://developers.stellar.org/docs/platforms/anchor-platform/admin-guide/assets-and-client-wallets.md
rg -n "sd-057" .
rg -n --hidden --glob '!.git/**' --glob '!tmp/**' "sd-057" .
```

I also read Circle's current address table and scanned the fresh docs tree for the Testnet issuer.

Observed result:

[PR #2929](https://github.com/stellar/stellar-docs/pull/2929) merged as `93f05612f490d4a35aa0b2d8ba906793934af6ee`.
Issue #2908 closed at `2026-11-02T18:20:36Z`.
The deployed page labels the example USDC on Testnet and links Circle's address table.
[Circle's table](https://developers.circle.com/stablecoins/usdc-contract-addresses) confirms separate Stellar Mainnet and Testnet issuers.
The deployed example retains the valid Testnet address.

The recommendation requested an explicit issuer-difference sentence.
ElliotFriend, a repository MEMBER, rejected that sentence as excessive in this explanation.
He then approved the shorter correction.
His [review](https://github.com/stellar/stellar-docs/pull/2929#pullrequestreview-5603768448) supports the recorded scope adjustment.
The original missing-network defect is fixed.
The repeated issuer scan found the other admin-guide explanation only here.
Other repeated occurrences include Testnet configurations and API fixtures.
Those occurrences do not establish a new wrong-network claim.

Required deletion changes:

- Remove the `sd-057` override from `improvements/intake.json:242`.
- Regenerate `improvements/INDEX.md`.
- Append the resolution to the current round ledger.
- Preserve the dated October backlog references.

The scans found no active golden, register, TODO, research-link, or other-finding reference requiring repair.
No candidate probe requires removal.

# A3. `sls-085` — FIX — RETIRE

Commands run:

```sh
gh api repos/Stellar-Light/stellarlight/issues/1673
gh api repos/Stellar-Light/stellarlight/issues/1673/comments
gh api repos/Stellar-Light/stellarlight/pulls/1805
gh api repos/Stellar-Light/stellarlight/pulls/1805/files
curl -s 'https://stellarlight.xyz/api/projects/search?q=soroswap&limit=3'
rg -n "sls-085" .
rg -n --hidden --glob '!.git/**' --glob '!tmp/**' "sls-085" .
```

I fetched both owner deployment manifests and ran `fixtures/check-soroswap.mjs`.
I also fetched the live Scout OpenAPI at `/api/openapi.json`.

Observed result:

[PR #1805](https://github.com/Stellar-Light/stellarlight/pull/1805) merged on 2026-10-08.
Issue #1673 closed that day.
The maintainer verification comment is by `theboycoder`, a COLLABORATOR.
The live API reports version `1.9.116`.

The original AMM address now has label `amm router`.
The separate aggregator address appears with label `aggregator`.
Both labels match the owner manifests.
Unsigned live simulation confirmed `get_factory` on the AMM router.
It confirmed `get_adapters` on the aggregator, including the AMM router under protocol `0`.
The PR patch derives these labels from the owner deployment records.
All three recommendation items are satisfied.

The adjacent venue-list problem already has finding `sls-099`.
It does not invalidate the repaired contract roles.

Required reference changes:

- `research/audits/2026-09-17-routing-audit/soroswap-contract-role.md:115` links the soon-deleted file.
- Replace that link with its immutable source snapshot or the resolved receipt.
- Update the active-record wording in `improvements/stellar-light-scout/sls-099-soroswap-aggregator-venue-list-stale.md:20`.
- Update the active-record wording in `improvements/stellar-light-scout/sls-113-dex-venue-role-sparse.md:12`.
- Regenerate `improvements/INDEX.md` and append the current ledger's resolution.

Preserve the dated research statements at lines `95` and `99`.
Preserve the September and October round records and their saved responses.
The hidden-reference scan lists each historical location.
No golden, register, TODO, intake override, or probe requires a change.

# A4. `sls-086` — FIX — RETIRE

Commands run:

```sh
gh api repos/Stellar-Light/stellarlight/issues/1674
gh api repos/Stellar-Light/stellarlight/issues/1674/comments
gh api repos/Stellar-Light/stellarlight/pulls/1805/files
curl -s 'https://stellarlight.xyz/api/projects/search?q=aquarius&limit=3'
rg -n "sls-086" .
rg -n --hidden --glob '!.git/**' --glob '!tmp/**' "sls-086" .
```

I fetched the current Aquarius ICE and governance documentation.
I also checked `/api/projects/resolve?q=aquarius` for adjacent identity evidence.

Observed result:

The merged PR and the closed issue match the finding.
The maintainer verification comment is by `theboycoder`, a COLLABORATOR.
The deployed description separates upvoteICE market voting from governICE proposal voting.
It states that governance proposal voting has no rewards.
The current Aquarius documentation supports those distinctions.
The source remains recorded in the upstream issue and the PR's curation-map comment.
The search row does not expose that documentation URL as a source field.
The recommendation does not require a new API source field.
I found no remaining governance-versus-market-voting error in the tested description.

Required reference changes:

- Repair `research/audits/2026-09-17-routing-audit/aquarius-description-roles.md:10` before deleting the target file.
- Use an immutable source link or the resolved receipt.
- Regenerate `improvements/INDEX.md` and append the current ledger's resolution.

Preserve the dated September and October round records.
No golden, register, TODO, intake override, other active finding, or probe requires a change.

# A5. `sls-088` — FIX — RETIRE-WITH-SUCCESSOR

Commands run:

```sh
gh api repos/Stellar-Light/stellarlight/issues/1739
gh api repos/Stellar-Light/stellarlight/issues/1739/comments
gh api repos/Stellar-Light/stellarlight/pulls/1806
gh api repos/Stellar-Light/stellarlight/pulls/1806/files
curl -fsSG https://stellarlight.xyz/api/repos/explain \
  --data-urlencode 'repo=stellar/stellar-horizon' \
  --data-urlencode 'q=Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?'
rg -n "sls-088" .
rg -n --hidden --glob '!.git/**' --glob '!tmp/**' "sls-088" .
```

I checked the live OpenAPI and the GitHub tree at the returned `scannedRef`.
I also queried `soroswap/core` and `stellar/quickstart` as adjacent controls.

Observed result:

[PR #1806](https://github.com/Stellar-Light/stellarlight/pull/1806) merged on 2026-10-08.
Issue #1739 closed that day.
The live response returns `kind: platform`, `kindBasis: knownPlatform`, and `isDeployableContract: false`.
Its scanned commit is `597544b60c20f8536d532d32abca8462394874f3`.
All Rust contract paths in that tree sit below `internal/integration/contracts`.

The PR applies the infrastructure distinction during scanning and serving.
It adds the `platform` schema value.
It includes a Horizon-shaped fixture test and a genuine product-crate positive control.
The live `soroswap/core` control remains `contract` with `isDeployableContract: true`.
The live `stellar/quickstart` control returns `platform` with `isDeployableContract: false`.
The original product-classification defect is fixed.

One recommendation remains incomplete.
The live response preserves fixture symbols and interfaces, but supplies no source paths for them.
For example, it returns `IncrementContract.increment()` without `internal/integration/contracts/increment/src/lib.rs`.
The repository-level `sources.repoUrl` does not provide that attribution.

Required fix:

Preserve a separate residual named **Fixture contract interfaces in explainRepo lack source paths**.
Record the live response and the matching paths at the scanned commit.
Do not describe every recommendation as implemented without that residual or an explicit accepted scope adjustment.
The missing paths do not justify keeping the old product-classification claim active.

Deletion references:

- Regenerate `improvements/INDEX.md` and append the current ledger's resolution.
- Preserve the dated September maintenance records.
- Preserve the October improvements-lane record and `sls-087-drain-review.md`.

The scans found no direct research link, golden, register, TODO, intake override, or probe requiring repair.

# B1. `wai-001` — FIX — KEEP `declined-upstream`

Commands run:

```sh
gh api repos/cloudflare/ai/issues/634
gh api repos/cloudflare/ai/pulls/639
gh api repos/cloudflare/ai/issues/639/comments
gh api repos/cloudflare/ai/issues/comments/6295163611
npm view workers-ai-provider version deprecated dist-tags --json
```

I installed npm `workers-ai-provider@4.0.1` and `@ai-sdk/openai@4.0.91` in the isolated fixture directory.
I ran `node check-wai.mjs` there.

Observed result:

PR #639 closed unmerged.
Issue #634 remains open.
The [decline comment](https://github.com/cloudflare/ai/pull/639#issuecomment-6295163611) is by `mattzcarey`, a repository MEMBER.
It explicitly states the deprecation, feature freeze, replacement, and reason for closing the PR.
This is a maintainer decision, not an author comment presented as maintainer approval.

npm still reports latest `4.0.1` and the recorded deprecation notice.
The original trigger still throws `GatewayDelegateError` for `moonshotai/kimi-k3`.
The mocked binding receives `0` calls.
The providers-less control constructs the model.
The status change is accurate.

Required fixes:

- The Finding body still calls `4.0.0` the current npm latest.
- The Evidence body still presents PR #639 as a current candidate fix.
- Make those statements historical, or replace them with the verified current state.
- Qualify the disposition's promise to retire after a Raven migration.

A consumer migration does not fix the upstream trigger.
Keep the declined record unless a separately reviewed lifecycle rule permits a no-longer-consumed resolution receipt.
Do not label that consumer migration as an upstream fix.

# B2. `sd-048` — NOTE — KEEP `reported-upstream`

Commands run:

```sh
gh api repos/stellar/stellar-protocol/issues/2010
gh api repos/stellar/stellar-protocol/issues/2010/comments
gh api repos/stellar/stellar-protocol/issues/2010/events
gh api repos/stellar/stellar-protocol/commits/master
curl -fsSL https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0075.md
```

Observed result:

The closing actor is `github-actions[bot]`.
The close time is `2026-11-02T18:09:27Z`; the reason is `not_planned`.
The only issue comment is the stale notice.
No maintainer decision appears in the returned comments.

Master remains `0da06899c02f818be0132f42cea1f45d6396e20a`.
Line `78` lists degrees `3, 5, 7, or 11`.
Line `124` says only `d=5` is supported.
Line `157` lists `d` not equal to `5` as an error.
The file's last commit remains `d186cf3187722ebcdbd647e782449e543f9d0ef3`, dated 2026-08-20.

The recurrence is accurate.
No correction is required for this status change.

# B3. `sd-059` — FIX — KEEP, with a narrower search-path claim

Commands run:

```sh
gh api repos/stellar/stellar-docs/issues/2995
gh api repos/stellar/stellar-docs/issues/2995/comments
```

For each query below, I sent this request shape with `curl`:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_stellar_developer_docs",
    "arguments": { "query": "op_bad_signer" }
  }
}
```

The endpoint was `POST https://developers.stellar.org/mcp`.
The headers were `Content-Type: application/json` and `Accept: application/json, text/event-stream`.
The saved responses are `evidence/mcp-0.txt` through `evidence/mcp-6.txt`.

| Query | Independently observed site MCP result |
| --- | --- |
| `op_bad_signer` | Set Options Result Codes first |
| `op_too_many_signers` | Set Options Result Codes first |
| `op_line_full` | Manage Sell Offer Result Codes first |
| `op_cross_self` | Manage Buy Offer Result Codes first |
| `op_low_reserve` | Allow Trust first; Manage Data second; Set Options third |
| `tx_bad_auth_extra` | Transaction Result Codes first |
| `Any additional signers added to the account cannot be the master key` | Set Options Result Codes first |

These results reproduce the new evidence's site MCP column.
All seven queries return a relevant result-code page first.
Several operations legitimately share `op_low_reserve`.

For Raven, I used the brief's permitted source-inspection substitute.
I did not call the hosted Raven path with an OAuth session.
I cannot independently confirm its seven production result sets.

The checked source uses this endpoint:

```text
POST https://api.mintlify.com/discovery/v1/search/stellardevelopmentfoundation
{ "query": "<query>", "pageSize": 50 }
```

`specs/stellar-docs.json:11` supplies the API base.
Lines `12` and `15` supply the search path and candidate window.
`src/adapters/stellar-docs.ts:488` defaults the requested output size to `5`.
Line `492` sends the candidate window as `pageSize`.
The adapter then applies path scope and a query-term guard.
It takes the first requested sections at line `537`.
`search_docs` excludes meeting paths by default.
The adapter does not call the site's MCP endpoint.

Required fixes:

- Name the Discovery API in the Finding body and the recommendation's recheck.
- The current broad claim about “the Stellar Docs search” also describes a working tested surface.
- Keep the successful site MCP comparison visible.
- Label the production Raven observations as the author's measurements, pending an authenticated independent check.
- Limit the ledger's conclusion to the tested queries and paths.

The seven successful MCP queries do not prove that all docs content or all site search behavior is sound.
The adapter inspection also does not prove which upstream owner can change Discovery ranking.
Its filtering and candidate window remain possible contributors until raw candidates and adapter results are compared.

# C. `sd-080` — BLOCKER — FILE-WITH-FIXES

Commands run:

```sh
gh api repos/stellar/stellar-docs/commits/main
git clone --depth 1 https://github.com/stellar/stellar-docs.git tmp/rv-fu/stellar-docs
rg -n '\bsoroban[ \t]+[a-z][a-z-]*\b' tmp/rv-fu/stellar-docs/docs tmp/rv-fu/stellar-docs/.mintlify
gh api repos/stellar/stellar-cli/contents/cmd/stellar-cli/Cargo.toml
gh api 'repos/stellar/stellar-cli/contents/cmd/stellar-cli/Cargo.toml?ref=v28.1.0'
gh api repos/microsoft/winget-pkgs/contents/manifests/s/Stellar/StellarCLI/28.1.0/Stellar.StellarCLI.installer.yaml
```

I fetched the named raw source files, the deployed fuzzing page, and the published `stellar-cli-28.1.0.crate`.
I inspected its normalized `Cargo.toml` without building or installing the CLI.
I also inspected `installer.iss` at `v28.1.0`.

Observed result:

The docs head remains `85d2d1b8e7a4451b7a6af0931f587ce73109b816`.
`fuzzing.mdx:197` still recommends `soroban contract build`.
The deployed Markdown contains the same instruction.
The install page lists the four recorded installation methods.
`install.sh` installs `BINARY_NAME="stellar"`.
The Homebrew formula runs `cargo install --bin=stellar`.
`build.rs:339` selects `cargo rustc`; line `349` adds `--crate-type=cdylib`.
The proposed one-command correction is supported.

However, the Cargo exception is false.
`cmd/soroban-cli/Cargo.toml` declares binaries for the separate `soroban-cli` package.
The documented command installs the `stellar-cli` package.
Its manifest sets `autobins = false` and declares only the `stellar` binary.
The published `stellar-cli` `28.1.0` crate confirms that declaration.
Its dependency on `soroban-cli` does not install that dependency's binaries.

Therefore, `cargo install --locked stellar-cli` does not also install `soroban`.
Remove that claim from the body and the frontmatter evidence.

The winget manifest names the `28.1.0` Inno installer.
Its tagged `installer.iss` installs `stellar.exe` and adds its directory to PATH.
It does not list `soroban.exe`.
I did not execute the Windows installer.
The record can cite this source inspection with that limit.

The repeated-claim scan supports the narrow correction.
The only live `soroban` CLI instruction found outside historical notes is `fuzzing.mdx:197`.
Other matches include ordinary prose, an echo string, and software-history entries.
The history has additional old subcommands at lines `963`, `1932`, and `1944`, beyond the recorded line `2198`.
Those history entries do not require current-command changes.

Fresh upstream search found closed issue #2238 about an Apple Silicon fuzzing failure.
Its sanitizer/linker problem differs from this missing-command problem.
The existing `sd-075` resolution also concerns a different example.
I found no duplicate issue for this instruction.

I ran the exact requested dry run:

```sh
npm run improvements:file -- --file https://github.com/stellar-experimental/stellar-raven/blob/610a7c3c25b2d582709f17a0beb8628a0f8f9cf5/improvements/stellar-docs/sd-080-fuzzing-note-soroban-contract-build.md --dry-run
```

It exited `2` because the service intake is mixed and `sd-080` has no override.
I then ran a read-only rendering check:

```sh
npm run improvements:file -- --file https://github.com/stellar-experimental/stellar-raven/blob/610a7c3c25b2d582709f17a0beb8628a0f8f9cf5/improvements/stellar-docs/sd-080-fuzzing-note-soroban-contract-build.md --repo stellar/stellar-docs --dry-run
```

That command passed.
The rendered title states the affected example and the missing executable.
The body retains the automated notice and all five required sections.
The public immutable source URL resolves successfully.
The smallest correction is clear.
The rendered Cargo statement remains false and blocks filing.

Required fixes before filing:

1. Correct both Cargo statements using the actual `stellar-cli` package manifest.
2. Add the `sd-080` intake override for `stellar/stellar-docs`.
3. Add the checked winget source evidence, or retain a precise limit on that claim.
4. Run the exact dry run again and inspect the corrected rendered body.
5. Use a new matching committed snapshot, or omit an outdated snapshot after edits.

# D1. Round ledger — FIX

Commands run:

```sh
git show 26e4e420 -- .agents/rounds/2026-11-02-upstream-followup.md
git ls-tree -r --name-only ce21317f improvements
```

I extracted GitHub issue and PR references from every active finding at `ce21317f`.
I fetched those references with `gh api`.
I also checked the additional fix PRs named in the ledger.
The saved summaries are `frontmatter-ref-sweep.json` and `ledger-pr-sweep.json`.

Observed result:

The five live fixes, the maintainer decline, and the stale-bot closure are supported.
The ledger still needs these corrections:

- Replace unqualified retirement instructions for `sd-055` and `sls-088` with the successor requirements above.
- Replace the broad “docs content and site search are sound” conclusion with the measured seven-query result.
- Do not state that the docs owner cannot change Discovery ranking without direct ownership evidence.
- Mark “reply on #2995” as pending, or supply the posted comment URL.

My readback of #2995 contains only the two triage-bot comments.
It does not contain the claimed Raven follow-up reply.
This review posted nothing.

The baseline extraction contains `105` unique references: `104` resolve and one returns 404.
The missing reference is the recorded `soroswap/docs#47`.
Clarify whether the ledger's `104` count excludes that missing reference.
A timestamped list would make the count auditable.

Upstream also changed during this review.
Skill issues #162, #163, and #164 closed after the ledger's sweep time.
Skill PR #167 merged at `2026-11-02T22:40:13Z`.
Record that later event separately; it does not prove the earlier snapshot was false.
PR #168 and the specifically named remaining docs fix PRs remain open in my check.
Do not describe #167 as still awaiting review when closing this round.

# D2. Search TODO addition — FIX

Commands run:

```sh
git show 26e4e420 -- .agents/TODO.md
```

I compared the addition with the seven fresh MCP results and the checked adapter.

The proposed alternate search path is a valid investigation task.
Its general mechanism and retrieval-comparison requirements remain appropriate.
However, the six-of-seven wording understates the observed relevant first hits.
All seven queries return a result-code page first.
For `op_low_reserve`, Set Options ranks third among several valid operation-specific results.
State that distinction explicitly.

Keep the Raven top-five result attributed to the author's dated production measurement.
This independent review verified the implementation path, but did not repeat its authenticated production queries.

# D3. Migration TODO addition — FIX

Commands run:

```sh
npm view agents@0.28.1 --json --cache /private/tmp/rv-fu-npm-cache
npm view agents@0.32.0 --json --cache /private/tmp/rv-fu-npm-cache
```

I inspected both published tarballs.
I then installed each version in a separate temporary directory.
I tested `createAI({ binding })("moonshotai/kimi-k3")` with a mocked binding.

Observed result:

Both versions export `createAI` through `agents/models/ai-sdk`.
Version `0.28.1` rejects the catalog ID before any binding call.
Version `0.32.0` accepts it before any binding call.
The logs are `agents028-check.log` and `agents032-check.log`.

The migration direction and the catalog-support distinction are supported.
The wording implies that the module itself first ships in `0.32.0`.
Replace that implication with the verified catalog-support distinction.
An upgrade can still be necessary for the requested catalog ID.
I did not establish the first release that added this capability.

The proposed smoke tests and model checks remain sensible migration requirements.
Qualify the `wai-001` completion condition as described in B1.
A successful Raven migration must not become false evidence that the deprecated upstream package was fixed.

# Retirement steps still outstanding — NOTE

I did not delete finding files, run a mutating resolver, or append resolution receipts.
I found no completed Raven resolution comments carrying this fresh review result and a pinned source snapshot.
The upstream fixes and maintainer comments do not replace that handoff.

Before deletion, the author must complete these steps:

1. Record the required successors and repair the active links listed above.
2. Post the dated live result and commit-pinned source on each relevant upstream issue and PR.
3. Read each new comment back through `gh api`.
4. Run the resolver dry run, then the authorized resolution.
5. Confirm each complete receipt in `improvements/resolved.json`.
6. Confirm removal of the active file and its intake override, where present.
7. Regenerate the index and run the required improvements checks.

None of these five finding files has probe frontmatter.
Only `sd-055` and `sd-057` have per-finding intake overrides.
The reference scans found no candidate-ID references in active goldens or the consistency register.

`npm run improvements:lint` passed with `123` findings during this review.
The requested `sd-080` dry run failed as reported above.
The dry run with an explicit repository passed.
The deployed SDK extracts passed their execution checks.
The adjacent parse-failure check reproduced the residual.

I made no tracked-file edits, commits, or GitHub writes.
The tree was initially clean.
A later status check showed concurrent changes in four unrelated tracked files:

- `.agents/skills/improvements-pipeline/SKILL.md`
- `scripts/improvements-lint.mjs`
- `scripts/improvements-resolve.mjs`
- `test/improvements-resolve.test.ts`

I left those changes untouched and excluded them from this commit review.
