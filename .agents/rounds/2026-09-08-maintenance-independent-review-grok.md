# Independent review — 2026-09-08 maintenance

Reviewer: Grok 4.6, high effort.
Role: independent adversarial reviewer.
This reviewer is not the Astra orchestrator and is not a Sol author.
No subagent ran.

## Verdict

**CHANGES-REQUIRED** for the first review, then **H1/H2/M1/M2 confirmed repaired** at `2026-09-09T03:08:04Z`.

Keep `sd-039`, `sd-042`, and `sd-047` open.
Keep Raven handoffs #130 and #132 open.
Do not treat the Docs source corrections as search-index fixes.

The Docs report’s live checks hold.
`ll-004` and `wai-001` hold.
Issue `#40` stays open for authenticated production copy acceptance only.
`.agents/NEXT.md` now ranks that remaining `#40` check.
The Saved Keypairs goldens and `sd-049` `fixed-upstream` record now match the 2026-09-09T03:14:02Z reconciliation.
See the later final verdict: **PASS** for that golden and retirement delta. Queue B9 and filing rows stay until the resolver.

## Scope and fixed point

- Mode: audit only. This file is the only write.
- Fixed point: `b2dbde53e9c9910b6d49a87ccea829555eeb4ef1`
- Branch: `chore/maintenance-2026-09-08`
- Worktree: this main worktree
- Independent checks: `2026-09-09T03:00:55Z`
- Skills read: `AGENTS.md`, `improvements-pipeline`, `audit-reviewability` plus its rubric, `improvements/README.md`, `upstream-writing-style.md`, and `research/services/stellar-docs-algolia.md` in full before any operator Algolia read

Reviewed files:

- `.agents/TODO.md`
- `.agents/NEXT.md`
- `improvements/lumenloop/ll-004-partner-items-hidden-from-tools.md`
- `improvements/workers-ai-provider/wai-001-moonshotai-catalog-slug-registry.md`
- `improvements/stellar-docs/sd-039-openzeppelin-relayer-conflated-with-managed-channels.md`
- `improvements/stellar-docs/sd-042-horizon-deprecated-present-tense-regression.md`
- `improvements/stellar-docs/sd-047-validators-ledger-close-cadence-conflict.md`
- `improvements/INDEX.md` as generated output
- `.agents/rounds/2026-09-08-docs-index-execution-astra.md`
- `.agents/rounds/2026-09-08-maintenance-execution.md` as authority context only

Excluded until a later named report:

- the thirteen verified filing files (`ll-030`, `sd-046`, `sd-049`, `sd-050`, `sd-051`, `sd-052`, `sk-021`, `sk-022`, `sk-023`, `sk-024`, `sls-082`, `sls-083`, `sls-084`)
- the `fix/search-name-and-noun-ranking` worktree

No commit, GitHub write, paid call, deploy, crawler write, index write, or operator settings write occurred.
No credential value entered this report.

## Findings

### H1. `NEXT.md` still ranks the completed midnight check and omits `sd-039`

**Location:** `.agents/NEXT.md` lines 4, 79, 113, and 125.

**Observed:**

- Line 4 still says the Docs follow-up left only `sd-042` and `sd-047` on a crawler trigger.
- Line 79 repeats that pair and omits `sd-039`.
- Line 113 tells agents to recheck those two searches after `2026-09-09T00:00Z`.
- Line 125 keeps the same pair in the upstream-blocked list.
- Line 127 still treats all 55 reported findings as silent until new evidence exists.

`.agents/TODO.md` lines 16–42 already include `sd-039`, cite PR #2723, and set the next check after `2026-09-09T12:05Z`.
The Docs report at `.agents/rounds/2026-09-08-docs-index-execution-astra.md` lines 105–116 and 157–166 records that the midnight slot passed with no newer completed crawl.

This reviewer re-read the crawler and index at `2026-09-09T03:00:55Z`:

- `lastReindexStartedAt`: `2026-09-08T12:00:01.930Z`
- `lastReindexEndedAt`: `2026-09-08T12:03:10.118Z`
- stored schedule: `every 1 day at 12:00 am`
- primary and replica `updatedAt`: `2026-09-08T12:03:01.745Z`
- `entries`: `14781`

Algolia’s schedule page states that `12:00 am` means midnight UTC.
The observed completed run started at 12:00 UTC.
The midnight expression and the noon start still disagree.
The `00:00Z` action in `NEXT.md` is therefore not the next check.

**Consequence:** An agent that follows `NEXT.md` will skip `sd-039`, rerun a window that already failed, and treat the three findings as part of the silent 55.

**Repair:** Rank `sd-039`, `sd-042`, and `sd-047` together.
Point the next action at `2026-09-09T12:05Z` and the Astra report.
Carve these three out of the silence rule.
Keep #130 and #132 open.

### H2. `sd-042` and `sd-047` still state the old page defects as current

**Location:**

- `improvements/stellar-docs/sd-042-horizon-deprecated-present-tense-regression.md` lines 21–34
- `improvements/stellar-docs/sd-047-validators-ledger-close-cadence-conflict.md` lines 32–50

**Observed:** Both files now lead with a search-index residual.
The bodies then keep present-tense page claims.

`sd-042` still says the EVM guide uses present tense and quotes `the deprecated Horizon API`.
Independent HTML at this review: the live EVM article says `Horizon API (nearing end-of-life)` and does not contain `deprecated Horizon`.

`sd-047` still says the Validators page says `every 3-5 seconds`.
It then says both sentences are live in rendered HTML.
It then says: `This is a docs-content defect. Both strings are indexed, so search is not the cause.`
Independent HTML at this review: Validators contains `every 5-7 seconds` and does not contain `every 3-5 seconds`.
Independent production search at this review: `query:"3-5 seconds"` still returns the stale Validators record.

The remaining defect is search ingestion, not the live page text.
`INDEX.md` copies the new lead sentences, so the index summary and the Finding body now disagree.

**Consequence:** The next round can treat live pages as still wrong, or can treat search as already ruled out.

**Repair:** Keep the search residual in present tense.
Move the original page conflict into past tense with its dated evidence.
Delete or rewrite `search is not the cause`.
Do not close the findings.

`sd-039` already uses past tense for the old alias on the live pages.
Its remaining search claim matches this review’s `managed Channels` hits.

### M1. The current handoff still says the round has no review gate

**Location:** `.agents/NEXT.md` line 6.

**Observed:** The file now describes the 2026-09-08 maintenance as active.
The same header still says `The round has no review gate.`
This review was required, and Grok 4.6 high is the named independent route in the execution ledger.

**Consequence:** A later agent can skip review of queue and finding edits.

**Repair:** Limit that sentence to the 2026-09-03 closeout, or remove it from the current header.

### M2. The open Docs recommendations still ask for the deployed page edits

**Location:**

- `sd-039` lines 92–117
- `sd-042` lines 54–65
- `sd-047` lines 64–76

**Observed:** Each file adds a correct current action: wait for a completed post-deploy crawl and keep the finding open.
Each file then keeps the original “change this page” ask as the rest of `Recommendation`.

The filer will not re-file a `reported-upstream` record.
A reader who copies `Recommendation` can still ask for work that already shipped.

**Repair:** Keep one present-tense recommendation: verify crawl and corrected positive records; do not rewrite index rows.
Move the original page ask under a historical heading.

### L1. Proposed Docs replies are factually supported; keep the targets distinct

**Location:** `.agents/rounds/2026-09-08-docs-index-execution-astra.md` lines 127–148.

**Observed:** The drafts were not posted.
This reviewer re-checked the cited GitHub state with `gh api`:

| ref | state | note |
| --- | --- | --- |
| `stellar/stellar-docs#2723` | merged `df8417ab…` at `2026-09-08T17:13:49Z` | deploy run `34255828473` success at `17:19:07Z` |
| `stellar/stellar-docs#2806` | merged `ad0accbd…` at `2026-09-08T15:05:25Z` | deploy run `34242504493` success at `15:10:43Z` |
| `#2707`, `#2770`, `#2805` | closed completed | `#2770` and `#2805` each have one ElliotFriend handoff comment |
| Raven `#130`, `#132` | open, zero comments | keep open |
| `#2723` thread `discussion_r3950651835` | unresolved, outdated | live Relayer page now says the operator controls the signer and names local keystore, Google Cloud KMS, and Turnkey |

The draft sentences match the live pages and the still-stale search hits.
`#2770` already flags the unshipped shared-partial, so `as your handoff states` is true on that issue.

**Repair:** Keep the drafts unposted until H1 and H2 land.
When posted, put the verification result on Raven `#130` and `#132` first.
If the same result goes to closed Docs issues, say it is a search-index verification, not a request to reopen the page occurrence.
Do not use one body as if `#130` and `#2770` were the same audience.

## What holds

These claims were re-derived, not taken from author prose.

### Docs source versus search

Live articles pass the original content checks:

- `/docs/tools` and `/docs/tools/openzeppelin-relayer` distinguish Relayer, the Channels plugin, and the managed service. The old alias is absent.
- `/docs/learn/migrate/evm/smart-contract-deployment` says `Horizon API (nearing end-of-life)`.
- `/docs/validators` and `/docs/learn/fundamentals/stellar-stack` both say `every 5-7 seconds`.
- Four canonical Horizon pages still use future deprecation wording.

Production Raven search still returns the old snippets:

- `search_sdk_cli_tools_docs({query:"managed Channels",hitsPerPage:15,includeContent:true})` still aliases both Tools pages.
- `search_docs({query:"deprecated Horizon API stellar-sdk networking layer",hitsPerPage:10,includeContent:true})` still returns the EVM Soroban Client hit.
- `search_docs({query:"3-5 seconds",hitsPerPage:10,includeContent:true})` still returns Validators.

GitHub blob SHAs on `stellar/stellar-docs` `main` match the Docs report:

- `docs/tools/README.mdx` `86243e6c…`
- `docs/tools/openzeppelin-relayer.mdx` `8ef7a6f2…`
- `docs/learn/migrate/evm/smart-contract-deployment.mdx` `c7b63187…`
- `docs/validators/README.mdx` `f74c2629…`

The last completed crawl ended before both deploys.
No completed post-deploy crawl is in evidence.
Do not call this a verified extraction failure.
Do not call it a normal midnight delay.

### `ll-004`

Status `reported-upstream` is correct.
Issue `lumenloop/lumenloop-backend#42` is still open.
Independent name-only check in this review:

- anonymous `GET /v1/tools`: 18 names; no account-scoped names
- authenticated `GET /v1/tools`: 21 names, including `list_my_research`, `request_research`, and `research_result`
- same-key `GET /v1/me`: `available=21`, `visible=21`

One passing check does not prove the intermittent cause is gone.
Do not resolve.

### `wai-001`

Status `reported-upstream` is correct.
Independent checks:

- npm `latest` is `4.0.0`
- local `workers-ai-provider` is `4.0.0`
- `createWorkersAI({ providers: [openai] })("moonshotai/kimi-k3")` throws `GatewayDelegateError` with zero binding calls
- `test/demo-model-config.test.ts`: 16 passed, 0 failed
- `cloudflare/ai#639` is open at `b57a507cd4a4e0eb8b2330196b75477c8eddfc64`, unmerged, combined status pending with zero statuses
- the PR touches private `packages/gateway-core/src/gateway-providers.ts` plus a provider patch changeset
- installed package.json names `@cloudflare/gateway-core` `0.0.0`

Keep the finding open until a published package passes the local reproduction.

### Queue authority that already matches the evidence

`TODO.md` correctly keeps the three Docs findings open, names the noon checkpoint, and withholds operator writes.
Decision B and decision F in `NEXT.md` now record owner authority.
Paid QA, golden blockers, and deployment remain blocked.
`improvements:lint` reports 71 findings: 55 reported, 13 verified, 3 declined.

## Tests

| check | result |
| --- | --- |
| `npm run improvements:lint` | pass, 71 findings |
| `npx vitest run test/demo-model-config.test.ts` | pass, 16 tests |
| production Raven exact search triggers | still stale; see H2 and “What holds” |
| live Docs HTML fetches | content corrections present |
| Algolia search-only index list | `updatedAt` still `2026-09-08T12:03:01.745Z` |
| crawler projected metadata | noon run, midnight schedule, not blocked, not reindexing |
| Lumenloop name-only listing | 18 / 21 / 21 as claimed |
| `gh api` on cited PRs and issues | merge, close, and handoff state as claimed |
| `npm view workers-ai-provider version` | `4.0.0` |
| local `moonshotai/kimi-k3` construction | throws before `run` |

No `typecheck`, full `npm test`, `build`, or secret scan ran.
This diff has no runtime code change.

## Unresolved risks

- The crawler still reports `running: true` with `reindexing: false` and no newer completed run. The cause of the noon start is unknown.
- Per-URL fetch, cache, and extraction evidence is still unavailable. The Docs report’s `/urls?limit=1` 404 and dashboard 401 were not re-tried as writes or auth changes.
- A crawl that completes after this review can change search evidence. Re-run the exact triggers before any comment or resolver step.
- `ll-004` remains intermittent. This pass is not a deployed-fix receipt.
- Finding-prep edits to the thirteen verified files are outside this review.
- Search-repair work is outside this review.
- This review did not re-read the 2026-09-03 Opus `LAUNCH-OK` file. It only confirmed commit `352e517` exists.

## Exact reviewed scope

In scope: the files listed above against `b2dbde53e9c9910b6d49a87ccea829555eeb4ef1`, plus independent cheap source checks.

Out of scope: search worktree, thirteen verified filing files, GitHub comments, issue closure, crawler or index writes, paid eval, and deployment.

## Confirmation of H1, H2, M1, and M2 — 2026-09-09T03:08:04Z

Root repaired the first-review findings. This reviewer re-read the exact delta. No finding-prep report was read.

### H1 — confirmed repaired

`.agents/NEXT.md` now names `sd-039`, `sd-042`, and `sd-047` together.
The next check is after `2026-09-09T12:05Z`, not `2026-09-09T00:00Z`.
Lines 114–116 point at the Astra report and keep `#130` and `#132` open.
Lines 128–131 carve those three out of the silence rule.

### H2 — confirmed repaired

`sd-042` and `sd-047` now lead with the search residual.
Each puts the old page defect under `## Original content finding` in past tense.
`sd-047` no longer says search is not the cause.
`sd-039` uses past tense for the old alias and keeps the search residual current.

### M1 — confirmed repaired

`.agents/NEXT.md` line 6 now says the 2026-09-03 closeout completed its review.
It says the active maintenance execution still requires independent review.

### M2 — confirmed repaired

All three Docs findings now have `## Original content recommendation`.
The present-tense recommendation is crawl verification only.

Residual: `sd-039` still keeps the original finding body under `## Finding` instead of a dated heading.
The verbs are past tense, so this does not reopen H2.

## Issue `#40` queue item

`.agents/TODO.md` lines 16–25 match public comment `5595065793`.

Read-back: https://github.com/stellar-experimental/stellar-raven/issues/40#issuecomment-5595065793

`gh api` body at `2026-09-09T02:55:48Z`, author `kalepail`:

> I will keep the 8000-character input limit for this demonstration.
> The current source and server checks use 8000, rather than the original 4000.
> The copy button shipped, as recorded in the August 27 comment.
> All 51 local tests for copying, input limits, chat validation, budgets, and page wiring passed today.
> I will not add persistent chat history to the demonstration.
> I will keep this issue open for one remaining acceptance check.
> The production page requires sign-in, so this check did not verify copying in an authenticated browser session.
> No paid chat request ran.

Issue `#40` remains `open`. The August 27 comment `5440708431` is the copy-button ship record.

Independent local rerun of the five-file suite:

| file | tests |
| --- | ---: |
| `test/demo-copy-core.test.ts` | 11 passed |
| `test/demo-composer-limit-core.test.ts` | 4 passed |
| `test/demo-chat.test.ts` | 11 passed |
| `test/demo-budget.test.ts` | 14 passed |
| `test/demo-page.test.ts` | 11 passed |
| total | **51 passed**, 0 failed |

This is not an authenticated production copy check.
The queue item does not claim one.
`.agents/NEXT.md` still does not rank this remaining check. Add it under trigger-only or human-gated work so the ranked handoff matches `TODO.md`.

## Independent Saved Keypairs re-derivation (`sd-049` cluster)

Golden-truth skill read first.
This cluster did not read `.agents/rounds/2026-09-08-filing-preparation-sol.md` or the dirty `sd-049` evidence.
No secrets were used. No key was generated or imported. No signing or submission ran. No paid call ran.

Observation time: **2026-09-09T03:08:04Z**.

### Default branch

`GET https://api.github.com/repos/stellar/laboratory` returns `default_branch: "main"`.
`main` HEAD is `bbbe48c79b8a90bbc548115a0573c912b1e9fa9e` (2026-09-08T20:19:01Z).
`master` still exists at `75ab0573fe8ecc2c147d03d593e37813ea6a68b0`.
`master` is not the default branch.

The 2026-09-03 golden B refs use `blob/master/src/helpers/localStorageSavedKeypairs.ts`.
That path is stale as a current-default citation.

### A/B/F matrix

| claim | A Docs | B current `main` source | F live served Lab | verdict |
| --- | --- | --- | --- | --- |
| Docs say saved keys are obfuscated, not encrypted | confirmed | compatible | UI does not use “obfuscated” | confirmed for Docs; disputed across surfaces |
| Current default-branch writer stores plaintext JSON | contradicted | `set()` calls `encryptJson` | served `set` is `btoa(xor(JSON.stringify(e), TESTNET))` | **do not pin** |
| Writer is cryptographic encryption | contradicted | XOR with public `Networks.TESTNET`; comment says obscure, not sensitive data | same XOR+`btoa` in the live chunk | confirmed as obfuscation only |
| Legacy plaintext rows can still be read | confirmed (pre-September 2025 caveat) | `get()` `JSON.parse` first, then decrypt | served `get` `JSON.parse` then `atob`+XOR | confirmed |
| Saved Keypairs is Testnet/Futurenet only, not Mainnet custody | confirmed | UI gates on testing networks | warning tells users not to save value-bearing Mainnet keys | confirmed |
| Live UI says unencrypted / no protection | Docs do not use that sentence | source warning string still says unencrypted | served warning matches | confirmed for UI copy |

### Class A — official Docs

Live HTML `200` at https://developers.stellar.org/docs/tools/lab/saved/keypairs

Quote:

> This page shows your saved keypairs for the selected network (only Testnet and Futurenet) in the browser's local storage. Saved keypairs are obfuscated, but not encrypted — treat any secret key saved here as recoverable by anyone (or any script) with access to your browser (and note that keypairs saved before September 2025 may remain in plain text until they're re-saved).

Also: save only on test networks, never on Mainnet.

Source MDX on `stellar/stellar-docs` `main`, blob `fe3ddb90459ffe25023cee4a5a9461fd6aa4802d`, path `docs/tools/lab/saved/keypairs.mdx`, matches that paragraph.

### Class B — Laboratory source on the current default branch

https://github.com/stellar/laboratory/blob/main/src/helpers/localStorageSavedKeypairs.ts
blob `1b4293ceb13634b6ec795ead6ce4e2f23d6d3437` at `main` `bbbe48c…`

`set` stores `encryptJson(savedKeypairs)`.
`get` tries `JSON.parse` first, then `decryptJson`.

https://github.com/stellar/laboratory/blob/main/src/helpers/jsonCipher.ts
blob `670eaef3387cd75f318781cc19441e046e06e5fb`

Quote:

> // Local salt to obscure the data. Do not use this for sensitive data.
> const SALT = Networks.TESTNET;
> … xorCipher … btoa(xorCipher(JSON.stringify(data), SALT))

`Networks.TESTNET` is the public passphrase `Test SDF Network ; September 2015`.
This is reversible obfuscation. It is not encryption.

The helper landed in https://github.com/stellar/laboratory/commit/624d40ff29ca897f07290ca52011893175dae200 (`Obscure saved keypairs`, 2025-09-04, PR #1576).

https://github.com/stellar/laboratory/blob/main/src/app/(sidebar)/account/saved/page.tsx
still contains:

> Saved keypairs are stored in the browser’s localstorage unencrypted and with no protection.

`master` helper blob `fb28b858967b16815b505e49784fa84529a047b6` still uses `JSON.stringify` / `JSON.parse` only.
`jsonCipher.ts` is `404` on `master`.
Do not treat `master` as current Lab.

### Class F — live UI / served implementation

Page: https://lab.stellar.org/account/saved (`200`).
The warning is not in the first HTML. It is in the client chunk.

Served file: https://lab.stellar.org/_next/static/chunks/app/(sidebar)/account/saved/page-dbc03db5d85268bb.js

Quotes from that chunk:

> Saved keypairs are stored in the browser’s localstorage unencrypted and with no protection.

> let n=r(24233).a.TESTNET,a=(e,t)=>e.split("").map((e,r)=>String.fromCharCode(e.charCodeAt(0)^t.charCodeAt(r%t.length))).join("")

> try{return JSON.parse(e)}catch(t){return … JSON.parse(a(atob(e),n)) … Failed to decrypt JSON data

> set:e=>localStorage.setItem(i.Zz,btoa(a(JSON.stringify(e),n)))

Live Lab ships the XOR obfuscation writer and still tells testers the store is unencrypted.

No key was created. No `localStorage` write ran from this reviewer.

### `sd-030` retirement

`improvements/resolved.json` entry `sd-030` resolved 2026-07-27.
Its live recheck quoted the obfuscated-but-not-encrypted Docs sentence.
That sentence is still on the live page.
The retirement of `sd-030` remains valid.
`sd-030` does not cover the later UI-versus-Docs wording split, and it does not make `master` current.

### Is `sd-049` retirement valid?

No full retirement.

The obsolete claim is: current default-branch source still writes plaintext JSON through `JSON.stringify`.
That claim is false on `main` and in the live bundle.

The remaining defect is real: Docs and `jsonCipher` describe obfuscation; the live UI still says unencrypted and no protection.
Keep an active finding for that surface split, or narrow the existing one.
Do not close it as `fixed-upstream` on the XOR writer alone.

### Narrow golden corrections — do not apply in this review

`eval/qa/corpus/battery/tooling-infra/q-ti-stellar-lab-usage-and-new-ui.json`

- `asOf` is `2026-09-03`. Re-verify. `reverifyBy` is `2026-10-01`.
- Stop pinning “current source writes `SavedKeypair.secretKey` through direct JSON serialization.”
- Replace `blob/master/...localStorageSavedKeypairs.ts` with `main` plus `jsonCipher.ts`.
- Keep the canonical-page caution, but name the current split: Docs say obfuscated-not-encrypted; UI says unencrypted; source XOR-obfuscates with a public TESTNET salt and still JSON-parses legacy plaintext.
- An attributed Docs obfuscation quote is not a wrong claim.
- An attributed UI “unencrypted” quote is not a wrong claim if it means no cryptographic protection.
- An unqualified “source stores plaintext JSON on current Lab” claim is now wrong.
- Keep Testnet/Futurenet-only and the Mainnet-custody ban.

`eval/qa/corpus/battery/tooling-infra/q-ti-secret-key-vs-mnemonic-derivation.json`

- The last Lab sentence that says current source serializes secrets as plaintext JSON is stale.
- Narrow replacement: current write path obfuscates with a public XOR salt; pre-September 2025 plaintext rows remain readable; this is not custody.
- Keep the SEP-5 / SEP-23 / SEP-52 / CLI facts. They were outside this cluster except that Lab sentence.
- The `sd-030` symmetric caution may stay. `sd-030` remains resolved.

Sibling note: both cases still agree that Saved Keypairs is not Mainnet custody.
After the narrow storage-format repair they will agree again.

### Cluster tests

| check | result |
| --- | --- |
| five-file playground suite | 51 passed |
| `gh api` comment `5595065793` | matches TODO boundary; issue remains open |
| Laboratory default branch | `main`, not `master` |
| live Docs Saved Keypairs | obfuscated, not encrypted |
| `main` helper + `jsonCipher.ts` | XOR obfuscation writer |
| `master` helper | plaintext JSON; not default |
| live Lab JS chunk | XOR writer plus “unencrypted” warning |

### Cluster exclusions

Did not read the finding-prep report or dirty `sd-049` evidence.
Did not edit goldens or findings.
The other twelve filing candidates remain excluded.

## Reconciliation — UI/Docs wording is not a storage-format conflict — 2026-09-09T03:14:02Z

Earlier cluster text above is historical. This section corrects the remaining-conflict inference.
This reviewer still did not read the dirty finding-prep `sd-049` evidence.
The original premise was read from committed `b2dbde53e9c9910b6d49a87ccea829555eeb4ef1`.
Root independently rendered the public UI and read the current writer, cipher, and Docs.
No keys or storage writes occurred here.

### Exact statements

Docs, live and MDX:

> Saved keypairs are obfuscated, but not encrypted — treat any secret key saved here as recoverable by anyone (or any script) with access to your browser (and note that keypairs saved before September 2025 may remain in plain text until they're re-saved).

UI source and served chunk:

> Saved keypairs are stored in the browser’s localstorage unencrypted and with no protection.

Current `main` writer/cipher:

> Local salt to obscure the data. Do not use this for sensitive data.
> `set()` stores `btoa(xorCipher(JSON.stringify(data), Networks.TESTNET))`.

The UI sentence does not say “not obfuscated”.
It does not say “plain JSON”.
It does not name a serialization format.
“Unencrypted” and “no protection” do not deny reversible public-salt XOR.
Omission of the word “obfuscated” is not a contradiction.

These three claims can all be true:

1. The store is obfuscated.
2. The store is not encrypted and has no confidentiality protection.
3. Anyone with browser access can recover the secrets.

No quoted UI statement conflicts with the Docs “obfuscated, but not encrypted” clause.

### Invalid premise versus new residual

Committed `sd-049` premise at the base:

> The current storage helper serializes each SavedKeypair directly with JSON.stringify.
> The page and the implementation describe different protection properties.

Its B ref is `blob/master/src/helpers/localStorageSavedKeypairs.ts`.
`master` still has that plaintext writer.
The default branch is `main`.
`main` has used the XOR writer since 2025-09-04 (`624d40ff`, PR #1576).

That premise is invalid as a current default-branch defect.
It is not a new residual.

`sd-030` concerned warning prominence on the Docs page.
Its 2026-07-27 live recheck still matches the live obfuscated-but-not-encrypted sentence.
`sd-030` retirement remains valid and is a different defect.

There is no supported new docs-content residual that is only “UI omitted obfuscated”.
Do not keep `sd-049` open merely to host the golden caution.

### Corrected conclusions

- Retirement of `sd-049` can be valid once the obsolete `master` writer premise is recorded.
- Do not file or keep a successor for UI-versus-Docs wording on this evidence.
- `q-ti-stellar-lab-usage-and-new-ui` should drop the disputed canonical-page conflict that treats Docs “obfuscated” as opposed to UI “unencrypted”.
- Keep the Testnet/Futurenet and no-Mainnet-custody facts.
- Still retarget B refs from `master` to `main` plus `jsonCipher.ts`.
- Still stop pinning current source as direct plaintext `JSON.stringify`.
- An obfuscation claim that matches the current writer is true, not a partial-only attributed quote.
- `q-ti-secret-key-vs-mnemonic-derivation` still needs the same writer-format repair in its Lab sentence.

This reviewer does not edit those goldens or findings in this lane.

### NEXT `#40` rank

Earlier text said `.agents/NEXT.md` omitted the remaining `#40` check.
Root added it under Trigger-only:

> Playground #40: use an authorized authenticated production session to copy an existing answer without a new paid chat request.
> The 8000-character limit stays; persistent history is declined. Local tests pass, but production acceptance remains open.

That rank now matches `.agents/TODO.md` and comment `5595065793`.
Keep `#40` open until the authenticated production copy check runs.
This reviewer still makes no production-acceptance claim.

## Final verdict — golden and `sd-049` retirement delta — 2026-09-09T03:24:18Z

**PASS**

This reviewer compared the two case files and `sd-049` to `b2dbde53e9c9910b6d49a87ccea829555eeb4ef1`.
No goldens, register, or findings were edited in this lane.
No paid rejudge ran.
The other twelve filing candidates remain outside this review.

### Two golden cases

`q-ti-stellar-lab-usage-and-new-ui` and `q-ti-secret-key-vs-mnemonic-derivation` now pin the current storage boundary:

- new writes use reversible XOR/base64 obfuscation
- legacy plaintext rows remain readable
- no confidentiality or custody
- Testnet/Futurenet only; never Mainnet custody

Removed:

- the unsupported Docs-versus-UI conflict
- the expired `sd-030` warning-prominence caution
- `blob/master/...localStorageSavedKeypairs.ts` as current Lab
- `truth.status: "disputed"` on the Lab-usage case

Preserved:

- no-Mainnet / no-custody traps
- no universal non-egress negative
- signer, CLI, and SEP facts
- `reverifyBy` `2026-10-01` and `2027-01-14`

Only the storage claim received new A/B/F corroboration dated 2026-09-09.
Other claims keep their prior dated rows.
`asOf` is now `2026-09-09`.
`rootCause` records an eval-side obsolete-`master` error, not a new upstream defect.

`npm run eval:qa:lint -- --since b2dbde53e9c9910b6d49a87ccea829555eeb4ef1` returned **0 errors** and 63 warnings.
`eval/qa/cases.json` still has 500 active cases.

Low residual, not a fail: the served Lab chunk is labeled class `B` while it is live implementation evidence. Class `A` Docs, class `B` GitHub `main`, and class `F` UI still exist.

### `sd-049`

Status is `fixed-upstream`.
The file states the original premise used obsolete `master`.
It states this is not a new upstream fix.
It distinguishes resolved `sd-030` warning prominence from this source-selection error.
Recommendation is do not file, and retire after goldens and register reconcile.

`improvements:lint` passed with 71 findings.
`INDEX.md` already shows `sd-049` as `fixed-upstream`.

### Clusters

`cluster-137` members are the two storage cases.
Their file SHA-256 values match the register hashes.
Both cases now share the same storage boundary.
Recommend **consistent**.

`cluster-023` reopened because the Lab-usage member hash changed.
The six other members still bind Friendbot to non-production Testnet/Futurenet funding and reject Mainnet faucets.
The Lab-usage case still says Friendbot is non-production Testnet funding and still forbids Mainnet Friendbot.
The storage-format edit does not change that funding boundary.
Recommend **consistent** for this reopen.

Pre-existing, not introduced here: `q-edge-send-me-free-xlm` forbids “Friendbot is Testnet-only”, while the Lab-usage answer still says “non-production Testnet funding” without Futurenet. That tension predates this delta.

### Remaining `sd-049` references for retirement

Keep as provenance: the two goldens, `cases.json`, `sample.json`, and dated round notes.

Clear at resolver time:

- `.agents/TODO.md` still lists `sd-049` among the thirteen verified filing findings
- `.agents/NEXT.md` still lists `sd-049` in the filing wave, owner map, and B9 caution
- `improvements/intake.json` still has the `sd-049` override

Those queue rows are expected until the resolver deletes the active file and writes `improvements/resolved.json`.
They are not a golden defect.

### Retirement eligibility

The goldens no longer need the old caution.
The invalid `master` premise is recorded.
No successor docs-content residual is required.
A distinct reviewer can run the resolver after those queue rows are removed in the same closeout.

## Lab keyFact wording delta — 2026-09-09T03:26:25Z

**PASS**

The Lab-usage keyFact is now:

> Explains the current obfuscated-write and legacy-plaintext storage formats.

The prior reviewed line was:

> Distinguishes obfuscated writes and legacy plaintext from secure custody.

The new line still names both storage formats.
It does not restore the conflict or the expired `sd-030` caution.
Answer, notes, and avoid still keep no-encryption, no-custody, and legacy plaintext.

`npm run eval:qa:lint -- --since b2dbde53e9c9910b6d49a87ccea829555eeb4ef1` now has 0 errors and 62 warnings.
That case has no remaining lint hit.
The prior negative-predicate warning is gone.
