# Independent review: Raven #158–#162 / sd-040, sd-041, sd-044, sd-045, sd-051

Reviewer: Grok high (Grok 4.6). Distinct from the Sol findings author and the Astra orchestrator.
Date: 2026-09-16.
Checkout: `/Users/kalepail/Desktop/stellar-raven-codemode` on `docs/cleanup-current-guidance`.
Scope: original-trigger closure readiness only. This lane did not edit tracked files, post comments, close issues, or run paid evaluations.

This report re-derives each trigger from the active finding files, current GitHub issue/PR/deploy state, live rendered Docs HTML, and the Raven `stellarDocs` adapter. It does not reuse the Sol author transcript as proof.

## Result

All five original defects are gone on the live rendered source and on the Raven Docs index.

| Finding | Raven issue | Original trigger | Source | Index | Deployed | Verdict |
|---|---|---|---|---|---|---|
| sd-040 | #158 | unwrap on `from_xdr` | fixed | fixed | yes | **retire** |
| sd-041 | #159 | past-tense memo lead | fixed | fixed | yes | **retire** |
| sd-044 | #160 | flag omitted and unsearchable | fixed | original search fixed | yes | **retire** |
| sd-045 | #161 | unqualified Freighter HTTPS sentence | fixed | fixed | yes | **retire** |
| sd-051 | #162 | Phase 1 Mainnet Edition on Feb 5 | fixed | fixed | yes | **retire** |

Parent still owns mutations. Do not delete files until the parent:

1. Sets each finding to `fixed-upstream` with this live recheck.
2. Posts the resolver comment on every upstream issue/PR.
3. Reconciles persistent goldens, especially `q-ti-freighter-localhost-not-detected`.
4. Runs `npm run improvements:resolve` and then closes Raven #158–#162.

## Reviewer identity and method

- Lane: Grok high independent reviewer.
- Author lane excluded: Sol high `rv-findings-0916`.
- Orchestrator excluded: Astra.
- No child agents.

Original triggers came from the active files:

- `improvements/stellar-docs/sd-040-address-from-xdr-unwrap-malformed-input.md`
- `improvements/stellar-docs/sd-041-pooled-accounts-memo-past-tense-lead.md`
- `improvements/stellar-docs/sd-044-quickstart-manual-close-flag-undocumented.md`
- `improvements/stellar-docs/sd-045-freighter-https-requirement-unqualified.md`
- `improvements/stellar-docs/sd-051-protocol-20-mainnet-heading-date.md`

GitHub reads used `gh api` and GraphQL, not HTML-escaped issue tools. Live source used HTTP GET to `developers.stellar.org`. Index reads used `callStellarDocs` with `stellarDocs.get_doc_page_sections` and `stellarDocs.search_docs`. Credential names were loaded from `.dev.vars` into process memory. Values were not printed.

Existing round scripts under `.agents/rounds/2026-09-16-truth-maintenance/improvements-evidence/` were inspected first. They load secrets without logging them. This lane did not treat their stored JSON as evidence. It ran a separate probe:

```sh
node /tmp/raven-execution-2026-09-16/independent-docs-index-probe.mjs
```

Bounded machine output:

- `/tmp/raven-execution-2026-09-16/docs-review.json`
- `/tmp/raven-execution-2026-09-16/independent-index-results.json`
- `/tmp/raven-execution-2026-09-16/source-markers.json`
- `/tmp/raven-execution-2026-09-16/source-snippets.json`

## GitHub and deployment

`stellar-docs` `main` at review time is `0efbb0559b4851fdc2bff83beb1b03a851641630` (PR #2845). Every listed merge commit is on `main` (`ahead_by: 0`).

| Finding | Upstream issue | State | Closing / resolving PR | Merge SHA | Build and push stellar-docs |
|---|---|---|---|---|---|
| sd-040 | [stellar-docs#2768](https://github.com/stellar/stellar-docs/issues/2768) | CLOSED completed 2026-09-14T20:33:11Z by ElliotFriend via PR | [#2849](https://github.com/stellar/stellar-docs/pull/2849) merged | `41919839b9cfc38ebf80a393d461f5644169de98` | [run 34893615637](https://github.com/stellar/stellar-docs/actions/runs/34893615637) success 20:38:31Z |
| sd-041 | [stellar-docs#2769](https://github.com/stellar/stellar-docs/issues/2769) | CLOSED completed 2026-09-14T20:15:25Z by ElliotFriend via PR | [#2853](https://github.com/stellar/stellar-docs/pull/2853) merged | `525c722ceaeb4b839f46d03c2503cb61a019f4d9` | [run 34891807895](https://github.com/stellar/stellar-docs/actions/runs/34891807895) success 20:20:17Z |
| sd-044 | [stellar-docs#2772](https://github.com/stellar/stellar-docs/issues/2772) | CLOSED completed 2026-09-15T14:54:03Z | [#2850](https://github.com/stellar/stellar-docs/pull/2850) merged; follow-up [#2859](https://github.com/stellar/stellar-docs/pull/2859) merged | `6a8bea6a253a74ab646023b82459a007072f1baf`; `6aafb49f59522b399f0a60642dd815d730cd6904` | [run 34984769468](https://github.com/stellar/stellar-docs/actions/runs/34984769468) success 14:59:00Z; [run 34992371097](https://github.com/stellar/stellar-docs/actions/runs/34992371097) success 16:06:54Z |
| sd-045 | [stellar-docs#2773](https://github.com/stellar/stellar-docs/issues/2773) | CLOSED completed 2026-09-14T20:11:33Z by ElliotFriend via PR | [#2851](https://github.com/stellar/stellar-docs/pull/2851) merged | `29728e1f15890151859d340ba5c8a8fad24ec6b1` | [run 34891414642](https://github.com/stellar/stellar-docs/actions/runs/34891414642) success 20:16:35Z |
| sd-051 | [stellar-docs#2843](https://github.com/stellar/stellar-docs/issues/2843) | CLOSED completed 2026-09-15T19:38:15Z by ElliotFriend via PR | [#2845](https://github.com/stellar/stellar-docs/pull/2845) merged | `0efbb0559b4851fdc2bff83beb1b03a851641630` | [run 35014808562](https://github.com/stellar/stellar-docs/actions/runs/35014808562) success 19:43:23Z |

Raven inbound handoffs #158–#162 are OPEN, authored by `ElliotFriend` on 2026-09-15, with zero comments.

Comment authors on upstream issues:

- `devtechedge` and `kaankacar` discussed the work before merge.
- `ElliotFriend` posted owner handoff comments that point at Raven #158–#162.
- No Raven resolution comment with a live recheck and a commit-pinned source exists yet. The parent must post that comment before `improvements:resolve --upstream-commented`.

#162 body contains one date typo: `Stellar Core v20.2.0 on 2026-02-05`. Live source and index both say February 5, 2024. Correct the handoff while closing #162. Do not treat the typo as a live Docs defect.

## Source / index convergence

### sd-040

Original trigger: `stellarDocs.get_doc_page_sections({ path: "/docs/build/guides/conversions/address-conversions", includeContent: true })` returned `Address::from_xdr(&env, &bytes).unwrap()`.

Live GET 200. Raw HTML `unwrap` count is 0. The example is:

```text
pub fn address_from_xdr_bytes(env: Env, bytes: Bytes) -> Result<Address, ConversionError> {
    Address::from_xdr(&env, &bytes)
}
```

Prose names both failure modes, including `the conversion panics`.

Index: 7 complete sections. `#xdr-conversions-in-smart-contracts` has `Result&lt;Address, ConversionError&gt;` and `Address::from_xdr(&amp;env, &amp;bytes)` with no `.unwrap()`. `ConversionError` count 2.

Convergence: yes.

Residual: the page still has no malformed-byte test snippet. That was a recommendation extra. It does not restore the original unwrap defect.

### sd-041

Original trigger: live page lead `We used memos in the past for this purpose, however, using muxed accounts is better in the long term.`

Live GET 200. That phrase count is 0. Current lead:

```text
Transaction memos were traditionally used for this purpose, and many services still rely on them.
Muxed accounts are better in the long term, but they aren't yet supported by all wallets,
exchanges, and anchors, so you may want to support both memos and muxed accounts, at least for a while.
This guide covers both approaches.
```

Index: 15 complete sections. Page-root record matches the same lead. Memo section still says support both.

Convergence: yes.

### sd-044

Original triggers:

1. Docs pages under `/docs/tools/quickstart/` omitted `--enable-core-manual-close`.
2. `stellarDocs.search_docs({ query: "enable-core-manual-close quickstart manual close ledger" })` returned only LedgerCloseMeta ingestion hits.

Live GET 200 on operation-modes, run-command-examples, and network-modes. All three name `--enable-core-manual-close`. Operation Modes documents `MANUAL_CLOSE`, default `false`, `NODE_IS_VALIDATOR`, persistent-volume no-effect, `curl "http://localhost:11626/manualclose"`, and one ledger per call. Run Commands source contains `--local` plus `--enable-core-manual-close` on the next line and `127.0.0.1:11626:11626`. Network Modes lists the flag with a link to Operation Modes.

Index page reads:

- operation-modes: complete, 5 sections, `#manual-close-mode` carries the flag and constraints.
- network-modes: complete, 7 sections, `#local` lists the flag.
- run-command-examples: **soft-empty**. Path is not in the Docs index.

Original search now returns exactly 2 hits, both relevant:

- `/docs/tools/quickstart/advanced-usage/operation-modes#manual-close-mode`
- `/docs/tools/quickstart/network-modes#local`

Exact-flag search `enable-core-manual-close` returns the same two hits. No ingestion-only result remains.

Convergence for the original omission and search trigger: yes.
Convergence for the Run Commands page as a page-index record: no. See residuals.

Container page `/docs/tools/quickstart/advanced-usage/container` still omits the flag. The finding listed it as part of the family. The recommendation targeted advanced-usage run options, which now exist. Non-blocking.

### sd-045

Original trigger: frontend guide sentence `Freighter wallet requires a secure connection (HTTPS) to interact with your dapp.`

Live GET 200. That exact sentence count is 0. `secure connection (HTTPS)` count is 0. Current text:

```text
Freighter wallet requires a secure connection to interact with your dapp.
Browsers treat http://localhost and http://127.0.0.1 as secure contexts per the W3C Secure Contexts specification,
so local development over plain HTTP works without extra setup.
To enable HTTPS on localhost anyway...
```

`--experimental-https` remains as optional.

Index: 35 complete sections. `#setup-https-on-localhost` matches the corrected text. No parenthetical `(HTTPS)` requirement.

Convergence: yes.

Residual: original search `Freighter not detected localhost https` still does not place `frontend-guide` in the top 20. That search was secondary evidence in 2026-08-14. The page-content defect is gone. Do not stretch sd-045 into a ranking finding.

### sd-051

Original trigger: heading `Protocol 20: Soroban Phase 1 (Mainnet Edition) (February 5, 2024)` on `/docs/networks/software-versions`.

Live GET 200. `Mainnet Edition` count is 0. Current heading and body:

```text
Protocol 20: Soroban Phase 0 (Mainnet, February 20, 2024)
Mainnet activated Protocol 20 on February 20, 2024 at 1700 UTC ...
Stellar Core v20.2.0 on February 5, 2024
```

Sibling headings remain Phase 1 (February 27, 2024) and Phase 2 (March 19, 2024). New anchor is `#protocol-20-soroban-phase-0-mainnet-february-20-2024`. Old anchor `#protocol-20-soroban-phase-1-mainnet-edition-february-5-2024` is absent from live HTML.

Index: 159 complete sections. Matching section uses the new anchor and breadcrumb `Protocol 20: Soroban Phase 0 (Mainnet, February 20, 2024)`. Content has the activation sentence and the Core 2024-02-05 release date. `Mainnet Edition` count 0. Heading strings live in breadcrumb/anchor, not in the content field.

Search for the old heading ranks the new Phase 0 anchor first. No hit in the first 20 carries `Mainnet Edition`.

Convergence: yes. Repo `rg` also finds no live pin of the old anchor.

## Adjacent residual: sd-044 Run Commands indexing

`stellarDocs.get_doc_page_sections` for `/docs/tools/quickstart/advanced-usage/run-command-examples` returns kind `soft-empty`:

```text
no indexed sections found for /docs/tools/quickstart/advanced-usage/run-command-examples — the path is not in the docs index
```

The rendered page is live and contains the docker example. Operation Modes links to it as `Run Commands`. Search recovers the flag from two other indexed pages.

This residual does not restore the original sd-044 defect. Do not stretch sd-044. A successor `docs-search` finding is optional if the parent wants the crawler to index that MDX page. It is not required to retire sd-044.

Exact residual probe:

```js
await stellarDocs.get_doc_page_sections({
  path: "/docs/tools/quickstart/advanced-usage/run-command-examples",
  includeContent: true,
});
```

## Persistent references

`rg` over the repo (goldens, registries, research, intake, probes):

| Location | IDs | Action on retire |
|---|---|---|
| `improvements/stellar-docs/sd-04*.md` and `sd-051-*.md` | all five | resolver deletes these files |
| `improvements/INDEX.md` | all five | regenerate |
| `improvements/intake.json` overrides | all five | resolver removes |
| `improvements/resolved.json` | none of these IDs | append receipts; IDs are unused |
| Probe frontmatter | none | nothing to delete |
| Algolia rule notes | none for these IDs | no rule change |
| `.agents/TODO.md` | none | none required for these IDs |
| `eval/qa/corpus/battery/tooling-infra/q-ti-freighter-localhost-not-detected.json` and generated `eval/qa/cases.json` | sd-045 | **must update before or with retirement** |
| `eval/qa/corpus/battery/tooling-infra/q-quickstart-manual-ledger-close.json` | flag facts, no finding id | optional Docs source refresh; not a dangling id |
| `eval/qa/corpus/battery/retail-consumer/q-jutsu-what-is-a-memo.json` | page URL, no sd-041 id | leave |
| `eval/qa/corpus/battery/history-org-tokenomics/q-hist-soroban-launch-protocol20.json` | no sd-051 id | leave |
| `research/audits/*`, `research/qa-*`, `ideas/source-delivery-ranked-references.md` | dated evidence | leave; do not rewrite history |

sd-045 golden still states:

- Canonical-page caution that HTTPS is required, expiring when sd-045 is `fixed-upstream` and the live guide drops that wording. Both conditions now hold.
- Corroboration note quoting `'Freighter wallet requires a secure connection (HTTPS) to interact with your dapp.' (sd-045 reported-upstream, recurrence 2026-08-30).`
- `truth.verified.rootCause` includes `improvements/stellar-docs/sd-045-freighter-https-requirement-unqualified.md`.

Parent must run `golden-truth` on that case. After retirement, point `rootCause` at the resolved receipt, not the deleted file.

## Per-finding verdicts

### sd-040 / Raven #158 — retire

Original unwrap trigger is absent on source and index. PR #2849 is merged and deployed. Follow-up: parent lifecycle plus optional note that no malformed-byte test snippet shipped.

### sd-041 / Raven #159 — retire

Past-tense lead is absent on source and index. Current lead states present-tense memo use. PR #2853 is merged and deployed.

### sd-044 / Raven #160 — retire

Flag is documented and searchable. PRs #2850 and #2859 are merged and deployed. Record the Run Commands page-index miss as an adjacent residual, not a reason to keep sd-044.

### sd-045 / Raven #161 — retire

Unqualified HTTPS sentence is absent on source and index. Loopback secure-context wording is present. PR #2851 is merged and deployed. Required follow-up: update `q-ti-freighter-localhost-not-detected` before deleting the finding file.

### sd-051 / Raven #162 — retire

Mainnet Edition heading is gone. Phase 0 / February 20 activation and February 5 Core release are distinct. PR #2845 is merged and is current `stellar-docs` main. Required follow-up: fix the `2026-02-05` typo in Raven #162 when closing it.

## Exact probes

Rendered source:

```sh
curl -LsS https://developers.stellar.org/docs/build/guides/conversions/address-conversions
curl -LsS https://developers.stellar.org/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos
curl -LsS https://developers.stellar.org/docs/tools/quickstart/advanced-usage/operation-modes
curl -LsS https://developers.stellar.org/docs/tools/quickstart/advanced-usage/run-command-examples
curl -LsS https://developers.stellar.org/docs/tools/quickstart/network-modes
curl -LsS https://developers.stellar.org/docs/build/guides/dapps/frontend-guide
curl -LsS https://developers.stellar.org/docs/networks/software-versions
```

Raven Docs adapter (same catalog ops the findings used):

```js
await stellarDocs.get_doc_page_sections({ path: "/docs/build/guides/conversions/address-conversions", includeContent: true });
await stellarDocs.get_doc_page_sections({ path: "/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos", includeContent: true });
await stellarDocs.get_doc_page_sections({ path: "/docs/tools/quickstart/advanced-usage/operation-modes", includeContent: true });
await stellarDocs.get_doc_page_sections({ path: "/docs/tools/quickstart/advanced-usage/run-command-examples", includeContent: true });
await stellarDocs.get_doc_page_sections({ path: "/docs/tools/quickstart/network-modes", includeContent: true });
await stellarDocs.get_doc_page_sections({ path: "/docs/build/guides/dapps/frontend-guide", includeContent: true });
await stellarDocs.get_doc_page_sections({ path: "/docs/networks/software-versions", includeContent: true });
await stellarDocs.search_docs({ query: "enable-core-manual-close quickstart manual close ledger", includeContent: true, hitsPerPage: 20 });
```

Independent bundled probe used in this review:

```sh
node /tmp/raven-execution-2026-09-16/independent-docs-index-probe.mjs
```

Expected now:

- sd-040/041/045/051 page reads complete, original defect strings absent.
- sd-044 operation-modes and network-modes complete with the flag.
- sd-044 run-command-examples soft-empty.
- sd-044 original search: 2 hits, both Quickstart flag pages.

## Parent follow-ups

These are mutations. This reviewer did not perform them.

1. Mark the five findings `fixed-upstream` with this report as `--review-evidence`.
2. Post the resolver comment on #2768, #2769, #2772, #2773, #2843 and the resolving PRs.
3. Update `q-ti-freighter-localhost-not-detected` through `golden-truth`.
4. Run `npm run improvements:resolve` per file with `--references-reviewed --upstream-commented`.
5. Close Raven #158–#162 after receipts land. Correct the #162 `2026-02-05` typo.
6. Optional: file a successor only for the unindexed Run Commands page, with a new id.

## Limits

- No paid eval round.
- No production MCP `execute` through a live worker. The adapter talks to the same Docs Algolia index the worker uses.
- No crawler write and no Algolia rule write.
- Dated research notes still describe the 2026-09-14 stale-index state. They are historical.

## Golden-truth matrix: `q-ti-freighter-localhost-not-detected`

Independent 2026-09-16 re-derivation for removing the expired HTTPS conflict caution.
This lane did not edit the case file. The parent applies the gospel change.

Skill: `golden-truth`. Domain: real-world. Classes used: A (Stellar frontend guide, W3C Secure Contexts, Freighter connecting docs) and B (commit-pinned Freighter manifest and API source). Class C/D/F were not required for the caution-removal claim.

### Caution expiry

The notes say the canonical-page caution expires when `sd-045` reaches `fixed-upstream` and the live guide no longer carries that wording.

Live guide wording is gone. Independent review of `sd-045` is retire. ADR-0008's accepted caution set is base reserve, Horizon lifecycle, and RPC pagination. This extra caution should not remain after the page is reconciled.

Do not pin "all localhost setups work."

### A+B claim matrix

| Claim | Verdict | Class A | Class B | Gospel action |
|---|---|---|---|---|
| Official frontend guide still says Freighter requires HTTPS to interact with a dapp | **contradicted** (old golden sentence) | GET `https://developers.stellar.org/docs/build/guides/dapps/frontend-guide#setup-https-on-localhost` 200. Exact old sentence count 0. `secure connection (HTTPS)` count 0. Current text: "Freighter wallet requires a secure connection to interact with your dapp. Browsers treat http://localhost and http://127.0.0.1 as secure contexts per the W3C Secure Contexts specification, so local development over plain HTTP works without extra setup. To enable HTTPS on localhost anyway..." | Not a source-code claim. | Remove the canonical-page caution. Remove "Official Stellar frontend docs nevertheless say HTTPS is required." Rewrite the HTTPS keyFact. |
| `http://localhost` and `http://127.0.0.1` can be potentially trustworthy origins | **confirmed** | W3C Secure Contexts §3.1: host matching `127.0.0.0/8` or `::1/128` returns Potentially Trustworthy. Host `localhost` / `localhost.` / `.localhost` is Potentially Trustworthy only if the user agent follows [let-localhost-be-localhost]. §5.2: user agents MAY treat localhost names that way only when localhost never resolves to a non-loopback address. Frontend guide now cites this spec. | N/A | May state the loopback secure-context rule with the W3C condition. Do not drop the UA/resolution caveat. |
| Freighter manifest uses a scheme-restricted origin allowlist that blocks HTTP localhost | **contradicted** | Freighter connecting docs do not state an HTTPS origin allowlist. | Pin `0f08d9ee973f6f79582d8c6003a8cc75f8a473a2` (5.43.0 bump, 2026-07-07) `extension/public/static/manifest/v3.json`: `content_scripts.matches=["<all_urls>"]`, `run_at=document_start`, no `all_frames`. Same matches on `master` (file version 5.45.0) and tag `5.48.0` (published 2026-09-03). | Keep "not categorically blocked by a Freighter origin allowlist." |
| Nested / iframe pages always receive the content script | **unverifiable / likely false** | Connecting docs do not promise iframe injection. | Manifest omits `all_frames` at 5.43 pin, master, and 5.48.0. | Keep the top-level-page diagnostic. Do not claim every localhost page works. |
| Every HTTP localhost setup detects Freighter | **unverifiable** | W3C §5.2 is conditional on resolver behavior. Frontend guide says plain HTTP works without extra setup for loopback secure contexts; it is not a universal detection guarantee. | Manifest proves injection match, not runtime detection in every browser profile, unlocked state, or nested frame. `isConnected` returns a structured object and a node error outside the browser. | Keep avoid: do not claim HTTP always works, or that HTTPS always fixes detection. |
| `isConnected`, `isAllowed`, and `requestAccess` are distinct client-side APIs | **confirmed** | `https://docs.freighter.app/extension-freighter-api/connecting.md`: `isConnected` checks installation; `isAllowed` checks prior authorization; `requestAccess` is the recommended one-call allow-list plus public key. Returns are structured objects with optional `error`. Always check `isConnected` before `requestAccess`. | Pin `isConnected.ts` returns `{ isConnected: boolean } & { error? }` and uses `isBrowser` / `window.freighter` / `requestConnectionStatus()`, else `FreighterApiNodeError`. `isAllowed.ts` and `requestAccess.ts` are separate structured APIs. Master `isConnected.ts` matches the pin. Frontend guide still imports `isConnected` and `setAllowed` from `@stellar/freighter-api`. | Preserve these API claims. Do not treat them as part of the expired HTTPS dispute. |
| Official HTTPS guidance and the manifest still disagree on a universal localhost HTTPS rule | **no longer disputed** | The guide now agrees loopback HTTP is a secure context and treats HTTPS as optional (`To enable HTTPS on localhost anyway`, `--experimental-https`). | Manifest still has no HTTPS-only match. The remaining gap is detection reliability, not a docs-versus-source HTTPS requirement. | Replace the `disputed` corroboration row. Candidate new row: docs and spec now qualify loopback HTTP; detection is still not universal. `truth.status` may move from `disputed` to `confirmed` if the avoid item keeps the universal-HTTP/HTTPS traps. |
| Messaging times out after no content-script response | **not re-derived this pass** | Connecting docs do not state that timeout. | `isConnected.ts` calls `requestConnectionStatus()` when `window.freighter` is absent. This lane did not open the messaging helper. | Preserve the original wording. Do not strengthen or delete it in the caution-removal edit. |

Observed at: 2026-09-16.

### What to change

Parent-only gospel edit, after this matrix:

1. Delete the `Canonical-page caution: ... sd-045 ...` paragraph from `golden.notes`.
2. Delete the answer clause that official docs still require HTTPS.
3. Replace keyFact `Preserves the official HTTPS and current source/manifest disagreement.` with a present-state fact: loopback HTTP can be a secure context; HTTPS remains optional; detection is not universal.
4. Replace corroboration claim `Official HTTPS guidance and current manifest/injection behavior disagree on a universal localhost rule.`
5. Keep avoid item 2 exactly, unless the parent rewrites it to the same negative traps.
6. Keep the API, iframe, profile/unlock, and no-secret claims.

### What not to change in this edit

- Do not claim all localhost setups work.
- Do not restore the stale 5.43 / 5.46 version sentence. The later proposal correctly dates Freighter evidence to commit `be7c780c`. That is the current snapshot, not a missing version refresh.
- Do not rewrite `window.freighterApi` in the question. Pinned `isConnected.ts` reads `window.freighter`. That naming gap is outside the HTTPS caution.
- Do not expand ADR-0008. Removing this extra caution returns the case to the accepted three-caution set.

### Sibling sweep

Checked topical siblings for a leftover unqualified HTTPS requirement or a conflicting localhost rule.

| Case | HTTPS / localhost fact | Conflict with caution removal? |
|---|---|---|
| `q-ti-connect-wallet-button-code` | `isConnected` is installation detection; `requestAccess` is the connect call. No official-HTTPS-required claim. | No |
| `q-ti-bindings-to-nextjs-integration` | Freighter stays in a `"use client"` component. Avoid SSR. No universal HTTPS rule. | No |
| `q-tool-freighter-wallet` | SDF identity and non-exclusive official-wallet fact. No localhost HTTPS rule. | No |
| `q-eco-freighter-wallet` | SDF self-custody identity. No localhost HTTPS rule. | No |
| `q-ti-find-export-secret-key` | No secret export into app code. Matches this case's secret avoid. | No |

No sibling still quotes `Freighter wallet requires a secure connection (HTTPS) to interact with your dapp.`

### Consistency register

`eval/qa/consistency-register.json` does not list `q-ti-freighter-localhost-not-detected` in `clusters`, `numericInvariants`, or `dateContingentTraps`.

After the parent edits the case, still run:

```sh
npm run eval:qa:register
npm run eval:qa:lint -- --since origin/main
npm run eval:qa:compile
```

The register command re-stamps members and reopens changed clusters. This ID is not a current member, so no cluster reopen is expected. The gospel-change lint still requires a new `truth.verified` block with evidence and rootCause in the same diff.

Suggested `truth.verified.rootCause` after the edit:

- `improvements/stellar-docs/sd-045-freighter-https-requirement-unqualified.md` until the resolver receipt exists, then the resolved ledger entry
- `freshness-drift` for the expired canonical-page caution

Bounded machine copy: `/tmp/raven-execution-2026-09-16/sd045-golden-matrix.json`.
Its `generatedAt` is the clock time `2026-09-16T19:06:14Z`, not an invented later stamp.

## Golden proposal review — 2026-09-16 follow-up

Independent matrix first, then assessment of the unlanded file
`/tmp/raven-execution-2026-09-16/freighter-golden-proposal.json`.
This follow-up message is not evidence. The owned case is still unedited.
Freighter snapshot: `be7c780c7c7d6d1d2900515531b549fdce9a5ef3`.
PR #156 merge commit is `d4a6cefb3db52702e8f3b605d7693e83974e10fd`.
The tested pre-merge head is `e4c34d18`. CI succeeded on that head.

### Independent matrix at `be7c780c`

Re-fetched on 2026-09-16 after the follow-up, without reading the proposal first.

| Claim | Verdict | A | B |
|---|---|---|---|
| Frontend guide still requires HTTPS for Freighter | contradicted | GET frontend-guide 200. Old sentence count 0. Current: loopback HTTP is a secure context; HTTPS is optional (`To enable HTTPS on localhost anyway`). | n/a |
| `127.0.0.0/8` and `::1/128` are potentially trustworthy | confirmed | W3C Secure Contexts §3.1 returns Potentially Trustworthy for those CIDRs. | n/a |
| Host `localhost` is always trustworthy | unverifiable | §3.1 and §5.2: only if the UA follows let-localhost-be-localhost and localhost never resolves off-loopback. | n/a |
| Manifest blocks HTTP localhost | contradicted | Connecting docs state no HTTPS allowlist. | Snapshot manifest version `5.45.0`: `matches=["<all_urls>"]`, `run_at=document_start`, `all_frames` absent. |
| Every HTTP localhost setup detects Freighter | unverifiable | Guide and spec do not prove every UA, profile, or nested frame. | `all_frames` absent. `isConnected` is structured and returns `FreighterApiNodeError` outside the browser. |
| `isConnected` / `isAllowed` / `requestAccess` are distinct structured APIs | confirmed | Connecting docs: install check, allow-list check, recommended one-call access. | Snapshot `isConnected.ts`, `isAllowed.ts`, `requestAccess.ts` keep separate return types. `isConnected` reads `window.freighter`, not `window.freighterApi`. |

Owned case still contains the expired caution and the `disputed` HTTPS row.

### Proposal verdict

**Approve the judge-facing gospel. Do not land the provenance block as written.**

The answer, keyFacts, avoid list, and notes match the independent matrix:

- The expired canonical-page caution is gone.
- The answer dates the loopback guidance to 2026-09-16.
- HTTPS is optional, not a universal detection fix.
- The snapshot SHA is the required `be7c780c` commit.
- The text says the manifest is not a TLS-only rule and does not prove every localhost setup.
- Avoid item 2 is unchanged.
- Unrelated API claims remain.
- `truth.status` may be `confirmed` because sources no longer disagree on an HTTPS requirement. The remaining limit stays in avoid.

### Needed proposal corrections

The parent applies the approved gospel in `/tmp/raven-execution-2026-09-16/docs`.
That worktree already contains `.agents/rounds/2026-09-16-docs-resolutions.md`.
The earlier “missing evidence file” finding was a primary-checkout miss. It is withdrawn.

The same landing diff will carry the `sd-045` receipt before commit.
`improvements/resolved.json` is then a valid rootCause pointer in that commit, not in the earlier primary tree.

The reviewer stamp now records completed review. Do not keep `independent review pending`.

No further gospel edits. Keep the narrower question. Keep the three avoid rules.

### Do not change in the proposal

- Keep the current question, including `window.freighterApi`.
- Keep all three avoid items byte-identical.
- Keep dating the Freighter evidence to commit `be7c780c7c7d6d1d2900515531b549fdce9a5ef3`.
  That current-snapshot date is the intended replacement for the stale 5.43 / 5.46 version claims.
  Do not restore those version strings.
  Do not rewrite the snapshot as GitHub release `5.48.0`.
- Keep the 2026-09-16 loopback wording in the answer.

### Landing order

1. Keep the `sd-045` receipt in the same commit as the golden edit.
2. Keep the resolutions-ledger evidence path that exists in the docs worktree.
3. Keep the completed-review stamp.
4. Run `eval:qa:register`, `eval:qa:lint -- --since origin/main`, and `eval:qa:compile`.

Gospel content: approved.
Provenance in the docs worktree landing plan: approved.

Clock used for matrix `generatedAt`: `2026-09-16T19:06:14Z`.
