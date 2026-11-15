# Tuning loop 1: implementation record

Implementer: Claude Sonnet 5.5 (`claude-sonnet-5-5`), branch `tune/loop-1`, from `origin/main` at
`6ce86dce`. Inputs: [`TUNING-PLAN.md`](TUNING-PLAN.md), [`TUNING-PLAN-REVIEW.md`](TUNING-PLAN-REVIEW.md),
[`TUNING-PLAN-AMENDMENTS.md`](TUNING-PLAN-AMENDMENTS.md) (A1 to A9, A11; A2 and A5 appended from the
review in the first commit of this branch). Free work only: no model call, no paid run. The
orchestrator authorizes each run in the ledger after an independent reviewer reads the diffs.

## 0. Commits, in order

| Commit | What | Reverts alone |
|---|---|---|
| `4be3ddb7` | Append amendments A2 and A5 verbatim from the review | yes |
| `ce80303b` | Exposure scan (A3), its test, the regenerated 50-row panel | yes |
| `38a43209` | Scan: export the tuning-row selector, declare the exports | yes |
| `a321c5b7` | **Arm 1**: the `detail` relation and the frozen sentence | yes, checked below |
| `3eb40f56` | **Arm 2**: exact rows on research results | yes, checked below |
| `f3c05347` | `.agents/TODO.md`: the nine arm 1 rows as evidence; the dated PH4 note | yes |
| (this file) | `TUNE-IMPL-1.md` | |

The wording of both sentences was committed (a321c5b7, 3eb40f56) before any check that reads a
golden or a missing fact. Those checks (reachability, the TODO notes) came after. The reviewer
of each diff should confirm that `src/policy/evidence-checkpoint.ts` (arm 1) and
`src/policy/exact-evidence.ts` (arm 2) do not change afterwards.

**Each arm reverts alone.** I reverted each commit on a scratch branch, with the other arm and
every later commit in place: no conflict, `npm run typecheck`, `npm test`, and
`npm run eval:routing -- --gate` all exit 0. Arm 2 keeps its code out of arm 1's files for that
reason (its sentence builder is `src/policy/exact-evidence.ts`; `evidence-checkpoint.ts` is
untouched by it). The first version of this branch put both in one file and the arm 1 revert
conflicted; the history was rebuilt before it was pushed.

**Which revision each run uses.** Step 0-prime: `6ce86dce6959278eecedefef8f17204c09ed48f3`
(A11). Arm 1: `a321c5b73b63251db79bf00ae7b1cc0f909f8799`. Arm 2 (A5 behaviour read, not a panel
run): `3eb40f561f66a37c944e81c9f02f46fd54d2198a`. Arm 2 sits on arm 1; if arm 1 is reverted,
`git cherry-pick 3eb40f56` onto the last kept commit applies cleanly.

## 1. Exposure scan and the 50-row panel (amendment A3)

Script: `eval/qa/scan-tuning-exposure.mjs` (test: `test/tuning-exposure-scan.test.mjs`).
Command, run from the repository root:

```sh
node eval/qa/scan-tuning-exposure.mjs \
  --split ~/backups/gca-2026-11-14-split-v2.json \
  --results eval/qa/results/2026-11-14T20-13-51-variantA.json   # the gca-eval worktree's copy
```

Hygiene (A9): the script reads `sets.tuning` from the split and nothing else, selects the results
rows by that id list before it reads any other field, and asserts 79. Its test proves a row outside
the set is never read past its id. No held-out or reserve row was opened. The same selector
(`selectTuningRows`) backs both replay checks in section 4.

Definitions (A3): arm 1 exposed is any `stellarDocs.search_*` call with no `stellarDocs.get_doc_page`
in any script of the row. Arm 2 exposed is a `scout.searchResearch` query that contains a
letters-plus-digits identifier (`[A-Za-z]{2,}`, an optional hyphen or space, digits). A query held in
a variable (`qs.map(q => searchResearch({ q }))`) cannot be read directly; the string literals of
the same script stand in, and the cell says "(inferred)". That match is loose by A3's wording: it
also matches `burn 50`, `USDT0`, `issue 842`, `Tier 1`, `ERC-8004`. Only a direct match makes a
non-target row an "A2 rule fires" row.

Panel rules the script applies, from the plan: targets are the plan's named rows; "A2 rule fires" is a
non-target row with a direct identifier match; baseline-correct rows are controls, exposed when arm 1
or arm 2 exposure is true; baseline-partial rows in `soroban` or `tooling-infra` are priority partials
when a Docs search with no page read or a research call is present. The four rows PR 442 edited
(`q-token-xlm-supply-total-circulating`, `q-scf-hackathons-active`, `q-infra-testnet-vs-futurenet`,
`q-raph-stolen-wallet-recovery`) stay out of the panel, as in the plan's "left out" list.

Result: the scan reproduces the plan's 48 rows with the plan's roles, changes exactly the three
cells that A3 names (`q-sep6-sep24-sep31-choice` and `q-nft-vault-contract-standards` Docs "yes",
`q-protocol-tier1-requirements` research "yes"), and adds exactly `q-soroban-vuln-classes` and
`q-soroban-oz-token` as priority partials. 50 rows, 24 correct, 23 partial, 3 wrong, as A3 states.
I compared the scan's table with the plan's table by script: no other cell differs.

Review's reproduced numbers: 56 arm 1 exposed rows (the review's 56), 10 Docs-searching rows read a
page of 66 (the A7 figure), 26 rows call research.

Notes for the reviewer:

- `q-protocol-version-history-list` (partial, protocol-core) names CAP ids in research queries
  only through variables, so its match is inferred, not direct. It is not an "A2 rule fires" row
  under the script's rule, which keeps the panel at A3's 50. The live replay in section 4 shows the
  host would mark exact rows on four of its queries. If the orchestrator wants it in the panel, the
  panel is 51 rows and the per-run cap USD 12.75. A5 moved arm 2 off the panel run, so the cost of
  leaving it out is small.
- `q-token-xlm-supply-total-circulating` has a direct loose match (`burn 50`), is a PR 442 row, and
  is out of the panel for that reason. A11's sentence about the four edited cases applies only if
  one of them is added.
- The 50 ids, sorted, for `--ids`:
  `q-aas-trustline-limit-lifecycle,q-asset-usdc-eurc-issuer,q-asset-usdt0-layerzero-oft,q-comp-aml-analytics-vendors,q-comp-sep8-regulated-assets-approval-server,q-crp-oz-rwa-erc3643-trex,q-defi-agent-identity-stellar-experimental,q-defi-agentic-payment-standards-compare,q-edge-asset-site-scam-detection,q-edge-factcheck-soroswap-first-amm,q-edge-inject-ignore-instructions,q-edge-noinfo-stellar-native-privacy-default,q-edge-oos-solana-vs-aptos,q-hot-fee-pool-burn-deflation,q-infra-rpc-methods-list,q-infra-which-indexer,q-n3-issues-842-backup-faucet-wallet,q-n3-pi-network-wrong-chain,q-net-protocol-meeting-notes-find-cap,q-nft-vault-contract-standards,q-pc-account-activation-not-found,q-pc-cross-redstone-sep40,q-pc-quantum-preparedness-dormant,q-pc-sequence-numbers-ordering-replace,q-pc-sponsored-reserves,q-protocol-ledger-close-time,q-protocol-tier1-requirements,q-scf-instawards,q-sep-43-web-wallet-api,q-sep-45-contract-auth,q-sep-53-sign-verify-message,q-sep24-interactive-deposit-flow,q-sep6-sep24-sep31-choice,q-smart-account-scoped-policy-signers,q-smart-wallet-fee-sponsorship,q-sor-custom-errors-find-failure-cause,q-sor-deploy-invoke-from-js-sdk,q-soroban-check-auth-custom-account,q-soroban-cli-bindings,q-soroban-contract-id-derivation,q-soroban-oz-token,q-soroban-pre-mainnet-security-steps,q-soroban-reentrancy,q-soroban-storage-types,q-soroban-vuln-classes,q-ti-classic-submission-errors,q-ti-enumerate-holders-airdrop,q-ti-parse-raw-ledger-data,q-tool-js-sdk-package,q-zk-host-functions-status`

### Scan output

Tuning rows scanned: 79 (asserted 79).
Arm 1 exposed (a `stellarDocs.search_*` call and no `get_doc_page`): 56 of 79.
Docs-searching rows that read a page: 10; Docs-searching rows in all: 66.
Rows that called `scout.searchResearch`: 26.
Arm 2 exposed (a research query holds a letters-plus-digits identifier): 12, 8 from a string literal in the call and 4 inferred from the script's literals.
Panel: 50 rows (24 correct, 23 partial, 3 wrong).

| Case | Role | Category | Baseline | Docs search, no page read | Research called | Identifier in research query |
|---|---|---|---|---|---|---|
| `q-infra-rpc-methods-list` | A1 target | tooling-infra | partial | yes | no | no |
| `q-pc-account-activation-not-found` | A1 target | protocol-core | partial | yes | no | no |
| `q-pc-cross-redstone-sep40` | A1 target | protocol-core | partial | yes | no | no |
| `q-pc-sequence-numbers-ordering-replace` | A1 target | protocol-core | partial | yes | no | no |
| `q-smart-wallet-fee-sponsorship` | A1 target | compliance-rwa-payments | partial | yes | no | no |
| `q-soroban-cli-bindings` | A1 target | soroban | wrong | yes | no | no |
| `q-soroban-contract-id-derivation` | A1 target | soroban | partial | yes | no | no |
| `q-ti-classic-submission-errors` | A1 target | tooling-infra | partial | yes | no | no |
| `q-sep-45-contract-auth` | A1 and A2 target | assets-anchors-seps | partial | yes | no | no |
| `q-crp-oz-rwa-erc3643-trex` | A2 target | compliance-rwa-payments | wrong | yes | no | no |
| `q-edge-factcheck-soroswap-first-amm` | A2 target | edge-behavior | correct (trap) | no | no | no |
| `q-net-protocol-meeting-notes-find-cap` | A2 target | protocol-core | partial | yes | no | no |
| `q-nft-vault-contract-standards` | A2 target | assets-anchors-seps | partial | yes | no | no |
| `q-protocol-ledger-close-time` | A2 target | protocol-core | partial | yes | no | no |
| `q-sep-43-web-wallet-api` | A2 target | assets-anchors-seps | wrong | yes | yes | SEP-43 |
| `q-sep-53-sign-verify-message` | A2 target | assets-anchors-seps | partial | yes | yes | SEP-53 |
| `q-sep6-sep24-sep31-choice` | A2 target | assets-anchors-seps | partial | yes | no | no |
| `q-pc-sponsored-reserves` | A2 rule fires | protocol-core | partial | yes | yes | CAP-33 |
| `q-asset-usdt0-layerzero-oft` | control, exposed | assets-anchors-seps | correct | yes | yes | USDT0 |
| `q-comp-aml-analytics-vendors` | control, exposed | compliance-rwa-payments | correct | yes | yes | SEP-12 (inferred) |
| `q-comp-sep8-regulated-assets-approval-server` | control, exposed | compliance-rwa-payments | correct | yes | no | no |
| `q-defi-agent-identity-stellar-experimental` | control, exposed | defi-ecosystem | correct | yes | yes | ERC-8004 (inferred) |
| `q-defi-agentic-payment-standards-compare` | control, exposed | defi-ecosystem | correct | yes | no | no |
| `q-edge-asset-site-scam-detection` | control, exposed | edge-behavior | correct | yes | yes | SEP-1 |
| `q-edge-inject-ignore-instructions` | control, exposed | edge-behavior | correct (trap) | yes | no | no |
| `q-edge-noinfo-stellar-native-privacy-default` | control, exposed | edge-behavior | correct (trap) | yes | no | no |
| `q-n3-issues-842-backup-faucet-wallet` | control, exposed | edge-behavior | correct (trap) | yes | yes | issue 842 |
| `q-n3-pi-network-wrong-chain` | control, exposed | edge-behavior | correct (trap) | yes | yes | no |
| `q-pc-quantum-preparedness-dormant` | control, exposed | protocol-core | correct | yes | no | no |
| `q-protocol-tier1-requirements` | control, exposed | protocol-core | correct | yes | yes | Tier 1 |
| `q-scf-instawards` | control, exposed | scf-grants-builders | correct | yes | yes | no |
| `q-sep24-interactive-deposit-flow` | control, exposed | assets-anchors-seps | correct | yes | no | no |
| `q-smart-account-scoped-policy-signers` | control, exposed | soroban | correct | yes | yes | no |
| `q-soroban-reentrancy` | control, exposed | soroban | correct | yes | yes | no |
| `q-zk-host-functions-status` | control, exposed | soroban | correct | yes | no | no |
| `q-aas-trustline-limit-lifecycle` | control, unexposed | assets-anchors-seps | correct | no | no | no |
| `q-asset-usdc-eurc-issuer` | control, unexposed | retail-consumer | correct | no | no | no |
| `q-edge-oos-solana-vs-aptos` | control, unexposed | edge-behavior | correct (trap) | no | no | no |
| `q-hot-fee-pool-burn-deflation` | control, unexposed | history-org-tokenomics | correct | no | no | no |
| `q-infra-which-indexer` | control, unexposed | tooling-infra | correct | no | no | no |
| `q-sor-custom-errors-find-failure-cause` | control, unexposed | soroban | correct | no | no | no |
| `q-sor-deploy-invoke-from-js-sdk` | priority partial | soroban | partial | yes | no | no |
| `q-soroban-check-auth-custom-account` | priority partial | soroban | partial | yes | no | no |
| `q-soroban-oz-token` | priority partial | soroban | partial | yes | no | no |
| `q-soroban-pre-mainnet-security-steps` | priority partial | soroban | partial | no | yes | no |
| `q-soroban-storage-types` | priority partial | soroban | partial | yes | no | no |
| `q-soroban-vuln-classes` | priority partial | soroban | partial | yes | yes | no |
| `q-ti-enumerate-holders-airdrop` | priority partial | tooling-infra | partial | yes | no | no |
| `q-ti-parse-raw-ledger-data` | priority partial | tooling-infra | partial | yes | no | no |
| `q-tool-js-sdk-package` | priority partial | tooling-infra | partial | yes | no | no |


## 2. Arm 1: the `detail` relation (commit `a321c5b7`)

**Diff summary** (18 files, +693 −27, of which 77 are manifest lines and about 430 are tests; product code in bold).

- **`src/catalog/types.ts`**: `"detail"` added to `RETRIEVAL_RELATIONS`.
- **`src/catalog/detail-relation.ts`** (new): `detailJoinKeys(source, target)` is the one definition
  of a valid detail edge: the target's lane is `detail`, it has at least one required input, and one
  array of the source's output has items that carry every required input. It returns the required
  keys (here `["path"]`) or null.
- **`scripts/build-catalog.mjs`** (`attachRetrievalProfiles`) and **`src/catalog/search.ts`**
  (manifest check): both reject a `detail` edge for which `detailJoinKeys` is null. This makes the
  relation a checked fact; another family can add the edge later with no new code.
- **`scripts/catalog-data/retrieval-profiles.mjs`**: `{ id: "stellarDocs.get_doc_page", relation:
  "detail", on: ["partial"] }` appended as the last edge of all 11 Docs search profiles. The guard
  accepted all 11, so none was dropped. `catalog/manifest.json` regenerated by
  `node scripts/build-catalog.mjs` (+77 lines, only these edges).
- **`src/catalog/search.ts`**: `walkRecoveryCandidates` skips `detail` edges, so the three
  alternatives, the `search` tool's `recovery` cards, `widerCandidates`, hit order and the
  three-candidate cap are untouched. A new `detailTargetsFromSources(catalog, fromIds, excludeIds)`
  returns the detail targets, grouped, minus targets already called in the execute.
- **`src/executor/run.ts`**: `evidenceRecoveryHint` now computes detail targets first, from the
  successful calls that returned rows, before the unprofiled-operation early return and
  independent of `mode`; the old body is `evidenceAlternativesHint`, unchanged. A hint with detail
  and no alternatives has `mode: "detail-only"`.
- **`src/policy/evidence-checkpoint.ts`**: `EvidenceRecoveryHint` gains `detail?` and the
  `"detail-only"` mode; `evidenceCheckpointBlock` renders the sentence first, generated from the
  edge. The two mode sentences are byte-identical (a test proves it by string replacement).
- **`src/demo/tools.ts`** (Playground): a hint whose only content is detail targets does not use
  the turn's recovery-advice cycle, is not counted in `recoveryHintedExecutes`, and shows in the
  result. When the cycle is spent, a later hint's pointer still shows and its alternatives do not.
- **`eval/gates.json`**: the manifest fingerprint, `localTrace` and note (see deviations).
- **Docs**: `src/catalog/README.md` ("Advisory recovery") and `ARCHITECTURE.md` describe the relation and the sentence.
- **Tests**: `test/evidence-checkpoint.test.ts` (frozen sentence, ordering, byte-identical mode
  sentences, multi-key rendering, no case vocabulary), `test/search.test.ts` (last edge of all 11
  profiles, absent from every alternatives walk, no search page changes for four queries, grouping,
  exclusion), `test/catalog.test.ts` (build guard accepts the valid edge and rejects a non-detail
  target and an uncarried key; manifest check rejects a broken edge),
  `test/smoke/executor.test.ts` (real Worker path: pointer beside the three alternatives, absent
  after a page read), `test/smoke/demo-tools.test.ts` (the playground rule: a detail-only hint, then
  an alternatives hint that is still shown, then a suppressed one that keeps its pointer),
  `test/replay-detail-hint.test.ts` (section 4).

**Model-facing text it adds.** One sentence per detail target, generated from the edge, placed first
after the `--- EVIDENCE CHECKPOINT ---` header. For `stellarDocs.search_docs`, 286 characters:

> `stellarDocs.search_docs` returned sections of pages, not whole pages. A section is exact evidence only for what it shows whole. Before you state a list, number, formula, code, or status it does not show whole, read the page: `stellarDocs.get_doc_page({ path })` with that hit's `path`.

It is the A7 wording. The operation names and the key come from the edge: `sourceOperations.join(", ")`,
the target id, and `keys`. Several source operations render as one backticked list; several keys
render as `{ a, b }` and "`a` and `b`". Result sizes: a Docs-search-only execute's checkpoint grows
by 287 characters when the hint also has alternatives (591 to 878), and a detail-only checkpoint
is 316 characters including the 30-character header. Everything else in a result is byte-identical.

**Guards (tool descriptions, instructions).** No instruction or tool-description text changes, so
the lengths are those of `main`. Measured on the built objects:

| Text | Length | Guard | Headroom |
|---|---:|---|---:|
| `SERVER_INSTRUCTIONS` | 4,066 | 4,096 (`CLAUDE_CODE_INSTRUCTIONS_CAP_CHARS`) | 30 |
| `BASE_SERVER_INSTRUCTIONS` | 1,899 | 2,000 budget, inside the 2,048 pre-v2.1.296 limit | 101 |
| `execute` description | 2,029 | 4,096 (`CLAUDE_CODE_TOOL_DESCRIPTION_CAP_CHARS`) | 2,067 |
| `search` description | 1,930 | 4,096 | 2,166 |

`test/mcp-instructions.test.ts` passes. The live surface hash (measured on my own `dev:eval` at
`1f60d651`, the stacked arms before the history rebuild; `tools/list` and the instructions have not
changed since) is `b336fa142e9a618a8857179d5b1f96495f08d36d7af15c13556c8e95c67c3404`, the baseline's. **The surface pin therefore cannot tell the
baseline from either arm; the server-revision pin and the manifest fingerprint can.** Arm 1's
manifest is `c0c821fbf5c0466a330bc7f55fd52a45583322872564773bf3e98ded288a5e9d` (the baseline's was
`7be9c595ffe62e8326a7799f05a08bad4a2cb0e2d2adeb42fe1cf4a71d09b567`).

## 3. Arm 2: exact rows on research results (commit `3eb40f56`)

**Diff summary** (15 files, +523 −10).

- **`src/executor/providers.ts`**: `exactRowsOf(entry, args, data)`. It applies only to candidate
  lanes (semantic, research, A/V). A row is exact when all three agree: the query (`q` or `query`)
  holds a token of letters, an optional hyphen or space, and digits; the row's `source` equals
  those letters, ignoring case; and the last URL path segment, without its extension, is those
  letters, a hyphen, and the same number, zero padding ignored. No list of standards and no
  per-series constant. **A4: no `exactKeys` branch.** At most 5 rows. The ok envelope gains
  `exactRows: [{ index, key }]`, present only when non-empty; `caveat` and `data` are untouched.
  The ledger carries the same rows plus a quotable `url` (plain https, at most 200 characters, no
  whitespace or backtick). The sandbox envelope guard lists `exactRows` as an envelope key so that
  a payload field of that name cannot shadow it.
- **`src/adapters/types.ts`**: `ExactRow`, and the optional field on the ok envelope.
- **`src/policy/source-basis.ts`**: the `calls:` footer shows `[caveat: unverified-match; exact: sep-0043]`.
- **`src/policy/exact-evidence.ts`** (new): the exception sentence and `withExactEvidence`, which
  appends it to the candidate block. An empty block stays empty, and a block with no exact row is
  returned unchanged.
- **`src/executor/run.ts`**: `ExecuteOperationSummary.exactEvidence` (a count) and
  `ExecuteOutcome.exactEvidence` (the calls, for the block). **`src/mcp/tools.ts`**,
  **`src/demo/tools.ts`**: wrap the candidate block with `withExactEvidence`. `src/site.ts`: one
  prose sentence on the public page. `ARCHITECTURE.md`: the envelope field, the footer marker, and the rule.
- **Tests**: ten tests in `test/executor-providers.test.ts` (nine groups of `exactRowsOf` cases and
  an envelope-and-ledger test): the named document, a row that only cites it, a neighbouring
  number, an identifier with no document, a query with no identifier, zero padding and spacing
  (`SEP-0043`, `sep 43`, `SEP43`), two identifiers in one query, a matching slug under another
  source, **a non-empty `exactKeys` with a non-matching slug (A4, not exact)**, **a matching row
  whose chunk lacks the preamble (A4, exact; the sentence makes no status claim)**, a non-candidate
  lane, and quoting only plain https. `test/exact-evidence.test.ts`, `test/source-basis.test.ts`,
  `test/server.test.ts` (the MCP block, with and without an exact row), `test/smoke/executor.test.ts`
  (real Worker path), `test/replay-exact-rows.test.ts` (section 4).

**Model-facing text it adds.** Only in a result that has an exact row, appended to the CANDIDATE
EVIDENCE block, one sentence per call (the A4 wording; `<op>`, `<key>`, `<url>` generated):

> Exception: `<op>` returned the document the query names by identifier (`<key>`, `<url>`). That row is the document itself, not a candidate. State only what its returned text shows. A status or version line that is not in the returned text is unverified. The other rows stay candidates.

The template is 286 characters before the three values. With the live `scout.searchResearch`, `sep-0043`
and its 77-character GitHub URL it is 377 characters (a leading space included). The `calls:` footer
grows by `; exact: sep-0043` (16 characters). A result with no exact row is byte-identical, which
`test/exact-evidence.test.ts` and the unchanged `test/server.test.ts` blocks prove.

**Guards.** No instruction, tool description, catalog entry, micro-map or `search` text changes.
The table in section 2 holds. The `{ ok: true, data, asOf, asOfBasis, caveat? }` strings in the
model-facing `describe` usage line and in the page copy that `test/auth.test.ts` pins stay as they
are; a model learns `exactRows` from the result and the block.

**Assembled-server check** (my own `npm run dev:eval`, stopped afterwards; revision `1f60d651`, the
same code as `3eb40f56` before the sentence builder moved files): an `execute` of
`scout.searchResearch({ q: "SEP-43 standard interface" })` returned `exactRows: [{index 0, key
"sep-0043"}]` with `caveat: "unverified-match"`, the footer `[caveat: unverified-match; exact:
sep-0043]`, and the exception sentence in the CANDIDATE EVIDENCE block, followed by the unchanged
checkpoint.

## 4. Free checks

### Arm 1, check 2: replay over the stored tuning executes

`test/replay-detail-hint.test.ts` (skipped unless `RAVEN_REPLAY_SPLIT` and `RAVEN_REPLAY_RESULTS`
are set) reduces each stored `execute` script of the 79 tuning rows to its operation ids, assumes each
succeeded with rows, and runs them through the real `evidenceRecoveryHint`. Selection by `sets.tuning`
id comes first (A9). Result:

| Measure | Value |
|---|---:|
| `execute` calls replayed | 153 |
| with a Docs search and no page read in that `execute` | 101 |
| detail sentence on those | 101 of 101 |
| detail sentence on any other `execute` | 0 |
| rows with a sentence on at least one `execute` | 65 |
| rows exposed under A3 (Docs search, no page read anywhere) | 56, all 56 have a sentence |

The nine rows beyond the 56 read a page in a later `execute`; the sentence appeared before it.
Alternatives against the stored checkpoint text: 118 identical, 16 with neither, 15 with the same source
set in a different order (the stored order is call-completion order, the replay's is script order),
4 where the stored `execute` produced no checkpoint because it failed or soft-emptied
(`q-raph-official-help-sdf-cannot-recover` twice, `q-soroban-reentrancy`,
`q-validator-why-run-no-rewards`), which a static replay cannot see. No stored `execute` differs in
its alternatives for any other reason.

### Arm 1, check 3: a live `execute`

Not done as the plan wrote it. The worktree's `.dev.vars` holds placeholder keys, so a Docs call on a
live `dev:eval` server returns `Unauthorized` (I ran it: `stellarDocs.search_docs=error ... [http-401]`,
no checkpoint, as designed). I did not read another worktree's keys. Substitute: the workerd smoke
tests drive the real Worker and executor with a stubbed Mintlify and assert both cases. A Docs search only
produces the pointer next to the three alternatives (`recoveryHint.detail`); a search then
`get_doc_page` in the same `execute` produces none and leaves the alternatives unchanged. Added
characters: 287 (alternatives hint) or 286 plus the 30-character header (detail only). A keyed live
check can run on the measuring lane's server at step 0-prime.

### Arm 1, check 4: reachability

Method, no model: for each of the nine arm 1 target rows I took the Docs paths the agent already had in
its baseline results, in order, fetched the first two (and the page the review names, when it was
later) as Markdown from the public site (`https://developers.stellar.org<path>.md`; no Mintlify key was
available, so this stands in for `get_doc_page`), and checked the facts the judge listed as missing.
"First two" is the plan's rule. "Any path seen" is the pages the agent held a path for.

| Row | Fact the review found missing | First two pages | Any path seen | Reachable |
|---|---|---|---|---|
| `q-soroban-cli-bindings` | other languages are plugin placeholders; `--contract-id` is a bindings input | yes, `/docs/tools/cli/stellar-cli` lists python, java, flutter, swift, php, kmp as "requires external plugin" and the three inputs; the regenerate note is on no page checked | yes | **yes** |
| `q-infra-rpc-methods-list` | the 12 application methods | no | yes, the methods index (path 5) lists them; the retention text is not on it | **yes** (first fact) |
| `q-soroban-contract-id-derivation` | SHA-256 of the contract id preimage plus the network id | no | no page states the formula; the deployer pages say only "derived from deployer address and salt" | **no** |
| `q-smart-wallet-fee-sponsorship` | a C-address holds the asset without a trustline | no | yes, `/docs/tokens/stellar-asset-contract` (path 12): a contract `Address` balance lives in contract storage, "as opposed to a trustline" | **yes** |
| `q-ti-classic-submission-errors` | retry guidance; `SET_OPTIONS_BAD_SIGNER` | yes for retry (error-handling page: polling, retry, "resubmit only when unchanged"), not in the 429/5xx words | yes, `SET_OPTIONS_BAD_SIGNER` is on list-of-operations (path 4) | **yes** |
| `q-pc-cross-redstone-sep40` | RedStone's Mainnet SEP-40 contract | yes, oracle-providers (path 1) lists it | yes | **yes** |
| `q-pc-sequence-numbers-ordering-replace` | `minSeqNum` advance; failed op still consumes the sequence; 10x replace-by-fee | yes for the `minSeqNum` rule ("the account will always set its sequence number to the transaction's"); the failed-op fact is stated on no page checked | yes, 10x is on the fee-bump page (path 8) | **yes** (two of three) |
| `q-pc-account-activation-not-found` | a sponsored `CreateAccount` can use `startingBalance` 0 | yes, sponsored-reserves (path 1), also create-account (path 4) | yes | **yes** |
| `q-sep-45-contract-auth` | SEP-45 is Draft | no: the Docs `sep45` page and the other paths carry no status line | no; the status is in the Scout research preamble | **no** (not by arm 1; it is arm 2's row) |

Seven reachable, two not. Per the plan, `q-soroban-contract-id-derivation` and `q-sep-45-contract-auth`
cannot move under arm 1 and are not counted against it. Five rows have the fact on one of the first
two pages the agent held.

### Arm 2: unit cases and a live read-only replay

The unit cases are listed in section 3. The live replay (`test/replay-exact-rows.test.ts`, skipped
unless `RAVEN_REPLAY_SPLIT`, `RAVEN_REPLAY_RESULTS` and `RAVEN_REPLAY_LIVE=1` are set) runs each
stored tuning `execute` script in a stub sandbox that records the arguments of every
`scout.searchResearch` call made before the script stops (81 calls from 26 rows), adds nine fixed
probes, and sends all 90 to the live Scout API through the real operation wrapper, 1.6 seconds
apart. The first attempt hit Scout's rate limit (HTTP 429, retry-after 14) after 60 calls and
completed none of the rest; I added a 429 retry and pacing and ran it again; all 90 returned ok.

| Query | Exact rows |
|---|---|
| `SEP-43`, `SEP-53`, `SEP-57`, `SEP-45`, `CAP-33`, `CAP-38`, `SEP-12`, `SEP-1` | one each, the named document (`sep-0043`, ...) |
| `SEP-9999` | none |
| the stored `SEP-43 standard interface`, `SEP-53`, `CAP-33 sponsored reserves ...`, `SEP-12 KYC ...`, `... SEP-1 toml` | one each |
| four `q-protocol-version-history-list` queries naming CAP ids | the named CAPs: 2, 3, 2, 3 rows |
| every other of the 81 stored queries (including `Protocol 21`, `USDT0 Stellar`, `Tier 1`, `Pi Network`) | none |

17 of 90 calls have an exact row, 0 on a query that does not name a document that exists. The replay
captured `q-sep-43-web-wallet-api` and `q-sep-53-sign-verify-message` as expected (both exact), and
`q-pc-sponsored-reserves`. Limits: a stub sandbox returns empty data, so a script that depends on a
first call's rows records only the calls before it fails.

## 5. Gates

Each run bare, exit code printed. `build` is `wrangler deploy --dry-run`. "Sync" is the CI step
"generated artifacts in sync" (ten generators, then `git diff --exit-code` on the CI path list).

| Commit | typecheck | test | build | smoke | routing gate | eval:selftest | qa:lint | qa:register | sync | secrets |
|---|---|---|---|---|---|---|---|---|---|---|
| `a321c5b7` arm 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `3eb40f56` arm 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

The routing gate failed once on arm 1 before re-baselining, on the manifest fingerprint only
(`SHA-256 does not match the committed gate evidence`). All totals passed. Section 6 explains the
re-baseline. I ran the table on the code of each arm tip; the last history rebuild changed no file
other than this record (I compared the trees with `git diff`), so the results hold for the commits above.
After the last code change I also reverted each arm alone on a scratch branch with the other arm and
the TODO commit in place: no conflict; `typecheck`, `test`, and the routing gate all exit 0.

## 6. Deviations and decisions for the reviewer

1. **Sentence length.** A7's wording is 286 characters; the plan said "about 260". A7 governs.
2. **A detail pointer needs rows, not only `ok`.** The plan said "successful source operations". I use
   the ledger's own evidence predicate (`outcome ok` and `hasServiceData !== false`): an empty Docs
   search has no hit to read, and "returned sections of pages" would be false for it.
3. **`eval/gates.json` re-baselined in the arm 1 commit.** The manifest fingerprint is part of the
   routing gate's evidence, so `npm test` and CI fail on any manifest change. I ran the routing
   runner on both manifests and compared the full result: every case, grade, rank, score and
   accepted total is identical; only the manifest identity differs. The commit updates the
   fingerprint, `localTrace` and the note, as the file's own rule and PR 435 do.
4. **Hint type.** `EvidenceRecoveryHint.mode` gains `"detail-only"`, and `detail?` is optional, so
   telemetry that logs `recoveryHint` carries the new field.
5. **Arm 1 check 3 not live** (section 4). **Reachability pages** come from the public site's
   Markdown, not `get_doc_page`.
6. **Panel: 50 rows, A3's number**, with two notes (section 1).
7. **Exports for the replay.** `evidenceRecoveryHint` and `summarizeOperationLedger` are exported from
   `src/executor/run.ts` in the arm 1 commit; nothing else about them changed.
8. **`.dev.vars`.** To start `dev:eval` I set `DEV_ALLOW_UNAUTHENTICATED=true` in this worktree's
   ignored `.dev.vars` (the README's step). No secret was printed or read.
9. **Public page copy** (`src/site.ts`) mentions `exactRows` in prose; the envelope line that tests pin
   is unchanged.
10. **Not done** (not in the instruction list): the target 3 coverage count, the two upstream
    findings for `improvements/` (these need a live check of `docKind` before filing), and M1's
    replay.
11. **Measurement tooling.** K0 for arm 1 needs "rows where the sentence appeared, and those that read a
    page afterwards". I did not write that counter. It is `scanTranscript` plus a string match on
    `returned sections of pages, not whole pages` in the stored results; offered if wanted. Note A9:
    a script that reads a panel results file must select by id and assert the panel size.

## 7. Proposed run commands

Neither is launched. Both need the orchestrator's authorization in the ledger first. Pins are
computed in the collection shell; the values below are the ones I can state now.

**Common shell setup** (collection shell, after every Claude-related variable has its final value):

```sh
export DISABLE_AUTOUPDATER=1
PIN_BIN=$(mktemp -d) && ln -s ~/.local/share/claude/versions/2.1.325 "$PIN_BIN/claude" && export PATH="$PIN_BIN:$PATH"
AGENT_BINARY_SHA256=$(sha256sum "$PIN_BIN/claude" | cut -d' ' -f1)
# expect 0dc4f4a9a165fc60746d7ae8489712e5fc352f1e7ad4eb22e7141bd0812eb0cf (the baseline's Claude Code 2.1.325)
AGENT_ENVIRONMENT_SHA256=$(node --input-type=module -e 'import { agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs"; process.stdout.write(agentEnvironmentIdentity().sha256)')
# computed per shell; PATH is hashed, so it differs from the baseline's d63594e2... and is checked within each run only
REMOTE_IDENTITY_PROBE=eval/qa/probe-remote-identities.mjs
REMOTE_IDENTITY_PROBE_SHA256=$(shasum -a 256 "$REMOTE_IDENTITY_PROBE" | cut -d' ' -f1)
# expect aabfb83fb8e956856d70f9b5657ea6fca2f64551073812fb646b3689a8f28d99
REMOTE_IDENTITY_SHA256=$(env -i PATH="$PATH" "$REMOTE_IDENTITY_PROBE" --stable-sha256)
# expect 046b02808eabfdca9477d7e90c2d3ef3a15729911a86280ba4f91471c4a727e8 unless the remote moved; see below
STABILITY_REGISTER=/home/tyler/code/raven-wt/gca-eval/eval/qa/judge-stability.json
# SHA-256 must be 4322dd4d1ebfc30bc02a9def008039aba4f4b2395b1f9da5cabef56ec24bf458 (checked: it is)
PANEL_IDS=q-aas-trustline-limit-lifecycle,q-asset-usdc-eurc-issuer,q-asset-usdt0-layerzero-oft,q-comp-aml-analytics-vendors,q-comp-sep8-regulated-assets-approval-server,q-crp-oz-rwa-erc3643-trex,q-defi-agent-identity-stellar-experimental,q-defi-agentic-payment-standards-compare,q-edge-asset-site-scam-detection,q-edge-factcheck-soroswap-first-amm,q-edge-inject-ignore-instructions,q-edge-noinfo-stellar-native-privacy-default,q-edge-oos-solana-vs-aptos,q-hot-fee-pool-burn-deflation,q-infra-rpc-methods-list,q-infra-which-indexer,q-n3-issues-842-backup-faucet-wallet,q-n3-pi-network-wrong-chain,q-net-protocol-meeting-notes-find-cap,q-nft-vault-contract-standards,q-pc-account-activation-not-found,q-pc-cross-redstone-sep40,q-pc-quantum-preparedness-dormant,q-pc-sequence-numbers-ordering-replace,q-pc-sponsored-reserves,q-protocol-ledger-close-time,q-protocol-tier1-requirements,q-scf-instawards,q-sep-43-web-wallet-api,q-sep-45-contract-auth,q-sep-53-sign-verify-message,q-sep24-interactive-deposit-flow,q-sep6-sep24-sep31-choice,q-smart-account-scoped-policy-signers,q-smart-wallet-fee-sponsorship,q-sor-custom-errors-find-failure-cause,q-sor-deploy-invoke-from-js-sdk,q-soroban-check-auth-custom-account,q-soroban-cli-bindings,q-soroban-contract-id-derivation,q-soroban-oz-token,q-soroban-pre-mainnet-security-steps,q-soroban-reentrancy,q-soroban-storage-types,q-soroban-vuln-classes,q-ti-classic-submission-errors,q-ti-enumerate-holders-airdrop,q-ti-parse-raw-ledger-data,q-tool-js-sdk-package,q-zk-host-functions-status
```

**Step 0-prime** (A2, A11): the baseline surface on the panel, from `origin/main` at `6ce86dce`, in the
clean `gca-eval` worktree (its old results JSON is git-ignored and survives a checkout):

```sh
cd /home/tyler/code/raven-wt/gca-eval && git checkout --detach 6ce86dce6959278eecedefef8f17204c09ed48f3
npm ci && npm run typegen && test -z "$(git status --porcelain)"
SERVER_REVISION=6ce86dce6959278eecedefef8f17204c09ed48f3; PORT=8796
hc run --bg --name base-server --cwd /home/tyler/code/raven-wt/gca-eval npm run dev:eval -- --port "$PORT"
hc wait base-server --output Ready
# readiness: the initialize POST from the run-evals skill must return 200
node eval/report-live-surface.mjs --port "$PORT" --expect-source-revision "$SERVER_REVISION" --json /tmp/raven-eval-surface.json
SURFACE_SHA256=$(node -e 'console.log(JSON.parse(require("fs").readFileSync("/tmp/raven-eval-surface.json","utf8")).surfaceSha256)')
test "$SURFACE_SHA256" = b336fa142e9a618a8857179d5b1f96495f08d36d7af15c13556c8e95c67c3404   # A11: stop if not
node eval/qa/run-qa.mjs --variant A --port "$PORT" --ids "$PANEL_IDS" --max-budget-usd 12.5 \
  --max-panel-cases 50 --stability-register "$STABILITY_REGISTER" \
  --server-revision "$SERVER_REVISION" --expect-sha256 "$SURFACE_SHA256" \
  --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" \
  --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256" \
  --remote-identity-probe "$REMOTE_IDENTITY_PROBE" \
  --expect-remote-identity-probe-sha256 "$REMOTE_IDENTITY_PROBE_SHA256" \
  --expect-remote-identity-sha256 "$REMOTE_IDENTITY_SHA256"
# then, free: npm run eval:plan -- eval/qa/results/<stamp>-variantA.json ; hc kill base-server
```

Models are the runner's defaults, as in the baseline (`claude-sonnet-5-5` answering, judge
`claude-sonnet-5`, judge panel tier `stability-boundary-v1`). The runner must plan 50 jobs before it
spends (assert it). Estimate: 50 rows at the baseline's USD 0.183 and about 38 s a case, about
USD 9.2 and 32 minutes. Cap USD 12.50 (A3). This run is also the remote-vector re-baseline (A2):
`REMOTE_IDENTITY_SHA256` is whatever the probe returns now, recorded beside the baseline's
`046b0280...27e8`. The four PR 442 cases are not in the panel; A11's exclusion therefore removes no row.

**Arm 1** (same shell setup and pins, a different server revision and port; compare with step 0-prime):

```sh
cd /home/tyler/code/raven-wt/gca-eval && git checkout --detach a321c5b73b63251db79bf00ae7b1cc0f909f8799
npm ci && npm run typegen && test -z "$(git status --porcelain)"
SERVER_REVISION=a321c5b73b63251db79bf00ae7b1cc0f909f8799; PORT=8797
hc run --bg --name arm1-server --cwd /home/tyler/code/raven-wt/gca-eval npm run dev:eval -- --port "$PORT"
hc wait arm1-server --output Ready
node eval/report-live-surface.mjs --port "$PORT" --expect-source-revision "$SERVER_REVISION" --json /tmp/raven-eval-surface.json
SURFACE_SHA256=<surfaceSha256 from the report>   # expected b336fa14...3404, the same as step 0-prime
node eval/qa/run-qa.mjs --variant A --port "$PORT" --ids "$PANEL_IDS" --max-budget-usd 12.5 \
  --max-panel-cases 50 --stability-register "$STABILITY_REGISTER" \
  --server-revision "$SERVER_REVISION" --expect-sha256 "$SURFACE_SHA256" \
  --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" \
  --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256" \
  --remote-identity-probe "$REMOTE_IDENTITY_PROBE" \
  --expect-remote-identity-probe-sha256 "$REMOTE_IDENTITY_PROBE_SHA256" \
  --expect-remote-identity-sha256 "$REMOTE_IDENTITY_SHA256"   # the vector step 0-prime recorded
```

Estimate USD 10 (arm 1 adds page reads; the plan's +10%) and 35 minutes; cap USD 12.50. A keyed
`dev:eval` is required for the Docs calls (`MINTLIFY_ASSISTANT_API_KEY` real); the `gca-eval` worktree is
the one the baseline used. Both servers' pins differ only in `--server-revision` and the manifest
fingerprint recorded in `meta.sourceIdentity`; the surface hash is identical by design.

**Arm 2** (A5, a behaviour read, not a panel run): revision `3eb40f561f66a37c944e81c9f02f46fd54d2198a`,
the five rows `q-sep-43-web-wallet-api,q-sep-53-sign-verify-message,q-pc-sponsored-reserves,q-comp-aml-analytics-vendors,q-edge-asset-site-scam-detection`,
three collections each, cap USD 4. Not proposed in detail until arm 1 is decided.

## 8. Remote vector

`env -i PATH="$PATH" eval/qa/probe-remote-identities.mjs --stable-sha256` (three captures five minutes
apart, read-only, no model) returned `046b02808eabfdca9477d7e90c2d3ef3a15729911a86280ba4f91471c4a727e8`
and exit 0 on 2026-11-14 at about 21:30 UTC. That is the baseline's vector: the remote has not moved
since the stored run. Step 0-prime still re-collects the panel (A2); its remote pin is the vector it
computes, expected to equal this one.
