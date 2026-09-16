# Independent review: PR #157 Trustless Work candidate

Reviewer: Grok high (Grok 4.6). Distinct from the Trustless Work contributor, the Sol repair author, and the Astra coordinator.
Mode: audit only. No owned-code edits, push, paid evaluation, or GitHub posts.
Clock: `2026-09-16T19:17:19Z`.
Candidate: `/tmp/raven-execution-2026-09-16/pr157` (`fix/trustless-work-review`, HEAD `b447ff40` plus dirty repairs).
Fixed point: `722eef5f2a81845ebdd8206e17ee100344eabd58`.
Author report read for scope only: `/tmp/raven-execution-2026-09-16/pr157-report.md`.

## Verdict

**Do not accept the Trustless Work source, and do not activate the golden.**

The materialized three-file proposal-stage diff may land. It changes no active cases. The lifecycle test count update belongs in that stage, not in activation.

The 22 pinned files are internally coherent escrow guidance. The parser and root-path helpers match the reported defects. The auth/custody gospel is directionally right.

The five routing identity movements are irrelevant captures. Aggregate gate totals do not approve them. The SKILL.md description invites those captures. Repair that description or the general scoring path before acceptance. Do not add a per-query exception.

## Scope

| Item | Value |
|---|---|
| Range | `722eef5f` through dirty candidate at `/tmp/raven-execution-2026-09-16/pr157` |
| Pin | `634f32bd4be6769b0cae52e72db4899d5f5a069c` |
| Selection | `sel:7c6d71f8eef2` (verified with `node scripts/check-pin-review.mjs --digests`) |
| Selected files | 22; every git-blob SHA matches `ecosystem-skills/MANIFEST.json` |
| Proposal patch | `/tmp/raven-execution-2026-09-16/pr157-proposal-stage.patch` SHA-256 `ce542910b96d99dc0fa34ba43787929d10472489a6dcd61c5ccd46ff7d6dffb0` (two files; superseded for landing) |
| Proposal worktree | `/tmp/raven-execution-2026-09-16/proposal` |
| Routing dumps | `/tmp/raven-execution-2026-09-16/pr157-ranked-base.json` and `pr157-ranked-final.json` |

This lane did not treat the Sol report as proof. It re-fetched the 22 bodies, official Core API docs, SDK transport, and the backoffice sign-and-send hook.

## Findings

### High — five irrelevant top-five captures

Location: catalog description of `skills.trustless-work.trustless-work-dev`; routing identities in the ranked dumps.

Independent dump comparison: 495 rows on each side. Exactly these five top-five arrays change. No other row changes.

| Case | Question | Base rank-5 occupant replaced | Candidate occupant |
|---|---|---|---|
| `q-asset-path-payment-ops` | How do path payments work on Stellar and which two operations implement them? | `stellarDocs.search_docs_in_category` | `skills.trustless-work.trustless-work-dev` |
| `q-defi-stellarx-what-is` | What is StellarX and is it built by the Stellar Development Foundation? | `stellarDocs.search_soroban_contract_docs` | `skills.trustless-work.trustless-work-dev` |
| `q-edge-fresh-latest-blend-tvl` | What's Blend's TVL today and how has it trended this quarter? | `scout.getHackathons` | `skills.trustless-work.trustless-work-dev` |
| `q-org-sdf-mandate-buckets` | How does the Stellar Development Foundation organize its work / spending priorities? | `stellarDocs.search_doc_titles` | `skills.trustless-work.trustless-work-dev` |
| `q-soroban-cli-bindings` | How do I generate a typed TypeScript or Rust client for a deployed Soroban contract? | `stellarDocs.search_docs` | `skills.trustless-work.trustless-work-dev` |

None of those questions is about Trustless Work escrow, API keys, or unsigned XDR.

Cause in the served description (INDEX and catalog, folded from SKILL.md):

```text
Also use when users mention escrow, conditional payments, non-custodial payments, USDC escrow,
freelance platforms, marketplace payments, grant disbursements, Soroban contracts, or Stellar
blockchain payments — even if they don't explicitly mention Trustless Work.
```

That clause is a general Stellar-payments vacuum. Path payments, StellarX, Blend TVL, SDF spending, and CLI bindings match those tokens.

The gated totals remain `213/279/312`, `16/23/23`, and `10/22/26` with 11 forbidden captures. That is not acceptance evidence for these five identities.

Smallest repair: shorten the description to Trustless Work escrow integration. Re-run the routing gate. Confirm these five identities return to the base occupants, or to another relevant hit. Do not add a per-query scoring exception.

Until that repair, do not accept the source and do not activate the QA case.

### Medium — golden pins one submit path

Location: dirty battery case and proposal patch, keyFact “The client sends the signed XDR to /stellar/send-transaction for network submission.”

Independent sources:

- Pinned V1 skill (`constitution.md` L115, `skills/api/core-concepts.md`, SKILL.md): submit is `POST /helper/send-transaction`.
- Pinned V2 skill (`skills/api/v2/core-concepts.md`, `skills/react-sdk/v2/react-sdk.md`): submit is `POST /stellar/send-transaction`; V1 used `/helper`.
- Official Core API (class A, `introduction.md` and `send-transaction.md`, fetched 2026-09-16): build → wallet signs `unsignedXdr` / `unsignedTransaction` → `POST /stellar/send-transaction`.
- Backoffice hook (class B): signs `buildResult.unsignedXdr` and calls `sendTransaction(signedXdr)`.

The unsigned-XDR plus local wallet sign is confirmed. The exact path is version-dependent. Pinning `/stellar/send-transaction` as a required keyFact can punish a V1-skill-faithful `/helper/send-transaction` answer.

Smallest repair: keep the build/sign/submit behavior. Name both documented paths, or say the client submits the signed XDR through the documented send-transaction helper for that API version. Do this in the proposal patch before activation.

### Medium — description also over-claims topic for pin safety

Location: SKILL.md description and INDEX row.

The 22 files stay on Trustless Work escrow. They add no `ignore previous` instruction, no Raven non-exposed operation, no `request_research`, and no `solo://` path. `x-api-key` mentions are header shapes and placeholders. Blocks files contain `npm install` / `npx trustless-work` supply-chain prompts; PIN-REVIEW already records that class.

The independent source-content gate therefore does not fail on hijack or secrets. It still fails acceptance because the served description pulls unrelated routing rows. A pin can be internally safe and still unfit to serve until that description is repaired.

## Golden-truth matrix

Question kept narrow: authentication and who signs/submits. Avoid list unchanged in the proposal. That part is correct.

| Claim | Verdict | A | B |
|---|---|---|---|
| Pinned skill requires `x-api-key` on every request and rejects `Authorization` | confirmed for the pin | n/a | `constitution.md` L114: `x-api-key` on every request, including reads; “Never `Authorization:`”. API core-concepts shows only `x-api-key`. |
| Current Core API accepts `x-api-key` or `Authorization: Bearer <jwt>` | confirmed | `introduction.md` Authentication section, fetched 2026-09-16 | SDK `http-transport.ts` at `4121f925`: sets `headers["x-api-key"]` when an API key exists and `Authorization: Bearer ${token}` when `getAccessToken` returns a token. |
| Universal “bearer is never accepted” | contradicted | same Core API intro | same SDK |
| API never signs; wallet signs unsigned XDR locally; client submits signed XDR | confirmed-as-of | Core API: “The API never signs anything.” Send-transaction flow signs then `POST /stellar/send-transaction`. | `useSignAndSend.ts` signs `unsignedXdr` in the wallet kit, then `sendTransaction(signedXdr)`. |
| Submit path is always `/stellar/send-transaction` | disputed / version-dependent | Core API uses `/stellar/send-transaction` | Pinned V1 uses `/helper/send-transaction`; pinned V2 documents the route change. |
| V1 is the only production path a golden must teach | not claimed in the repaired golden | Core API intro: new Core API is testnet beta; previous backend remains on mainnet/dev | Skill: V1 is production/mainnet default; V2 is beta/testnet-only. The repaired golden correctly dropped those volatile version claims. |

`truth.status: "disputed"` is correct for authentication exclusivity. Do not pin bearer as required. Do not pin “API-key only.”

Sibling sweep from this lane: `q-crp-partner-detail-after-discovery` and `q-soroban-greenfield-escrow-prior-art-preflight` mention Trustless Work and do not assert exclusive API-key auth or server-side signing. No contradiction.

The PR #157 dirty candidate still places the case in the battery as `quarantined` / `queued`. That interim state must not enter the two-stage history. Stage 1 is the three-file proposed-lane diff below.

Proposal gospel (auth dispute, unsigned XDR, local sign, no secret-key trap) is approved except the over-pinned submit path. That path correction can wait for activation. It does not block this proposal-stage land.

## Three-file proposal-stage diff

Clock for this addendum: `2026-09-16T19:19:07Z`.
Worktree: `/tmp/raven-execution-2026-09-16/proposal`.
HEAD: `c4b2ff095cf9c3f318a09dab5ae58cf1711b1982` (contains `d4a6cefb`; branch tracks `origin/main`).
Dirty files versus HEAD, and only these three:

| File | Change |
|---|---|
| `eval/qa/corpus/proposed/compliance-rwa-payments/q-tw-escrow-api-auth-custody.json` | new, untracked, `truth.lifecycle.state: "proposed"` |
| `eval/qa/lifecycle-registry.json` | `counts.proposed: 1`, `counts.active: 500` unchanged, `reservedIds` length 501, new proposed entry |
| `test/qa-lifecycle.test.mjs` | expects `proposed: 1` and `reservedIds` length 501; still expects compiled `cases` length 500 |

`git status` shows no dirty `eval/qa/cases.json`, no dirty `eval/qa/sample.json`, and no battery file for this ID.
Compiled `cases.json` still has 500 cases. The ID is absent from the compiled battery.
Registry entry path is the proposed lane. `caseContentSha256` `738dc7790e62d13fca16a7cf2059cbf55a89e8ed20174b6c5eb2fb366602630b` matches a canonical-JSON SHA-256 of the proposed file.

The earlier two-file patch was not enough. `npm test` hard-codes registry counts. Updating `test/qa-lifecycle.test.mjs` in this same stage is required. Do not defer that test edit to activation.

This three-file diff is the valid stage-1 land. It does not accept the skill source. It does not activate the case.

## Parser and helper tests

`scripts/lib/skill-markdown.mjs` folds `>`, `>-`, and `>+`. Generated Trustless Work descriptions in the dirty catalog, INDEX, and super-spec start with `Use when integrating Trustless Work escrow`, not `>`.

`scripts/lib/skill-source-selection.mjs` requires a child skill directory under `path: "."`. Root `README.md` and `LICENSE.md` are excluded. Empty-path single-skill mode remains separate.

Tests in `test/skill-markdown.test.mjs` and `test/skill-source-selection.test.mjs` assert those behaviors. That is acceptance evidence for the Sol parser/root-path repairs. It is not acceptance evidence for the source pin.

This lane did not re-run `npm test`. The author report recorded 36 passing focused tests and a full baseline. Those logs are not this reviewer’s proof of routing relevance.

## Standards and spec

**Standards.** The helpers are small, present-state, and tested at the reported failure. PIN-REVIEW no longer claims an independent review that has not happened. Generated INDEX no longer keeps a stray `>` on this skill. No extra compatibility shim. Residual: the SKILL.md description is still speculative generality for “any Stellar payment.”

**Spec.** The originating need is a new escrow skill source plus truthful eval coverage. Parser/root-path repairs match that need. Serving a description that captures path payments, StellarX, Blend TVL, SDF budgets, and CLI bindings does not match “escrow-as-a-service skill.” Activating a golden before independent routing repair does not match the lifecycle spec.

## Acceptance evidence (what does pass)

- All 22 selected files fetched from `634f32bd`. Git-blob SHAs match the manifest. `sel:7c6d71f8eef2` matches the live digest command.
- No hijack directive, literal credential, retired skill, or non-exposed Raven operation in those 22 files.
- Auth disagreement is real and encoded, not pinned.
- Unsigned-XDR plus local wallet sign is independently confirmed.
- Proposal patch SHA-256 matches the author report. The landing stage adds `test/qa-lifecycle.test.mjs` so the reserved/proposed counts stay consistent. Active compiled cases remain 500.
- Folded-YAML and root-path helpers have targeted tests.

## Not accepted

- Trustless Work source pin for merge/serve, until the five identities are repaired without a per-query exception.
- Golden activation.
- Any claim that unchanged aggregate routing totals approve the five captures.

## Required follow-ups

1. Land the three-file proposal-stage diff now. Include the lifecycle test count update. Do not wait for activation.
2. Repair the served Trustless Work description (or an equivalent general scoring rule). Re-run `npm run eval:routing -- --gate --dump-ranked …`. The five named identities must no longer place this skill in the top five unless a later review proves relevance.
3. Before activation, stop requiring `/stellar/send-transaction` as the only submit path.
4. Rebuild PR #157 from the proposal-stage squash. Do not copy the dirty `quarantined` battery state into that history.
5. After those repairs, a later independent pass can activate the case with a real `truth.lifecycle.activation` object that names this reviewer only if the routing identities then pass.

PIN-REVIEW may keep `independent review pending` until follow-up 1 is done. This document is that pending review’s result: **reject acceptance**.

## Proposal-count review — closed

Clock: `2026-09-16T19:21:41Z`.
Base: `origin/main` `c4b2ff095cf9c3f318a09dab5ae58cf1711b1982`.
Worktree: `/tmp/raven-execution-2026-09-16/proposal` at that commit, dirty three files only.

| Check | Result |
|---|---|
| Files versus `c4b2ff09` | proposed case (untracked), `eval/qa/lifecycle-registry.json`, `test/qa-lifecycle.test.mjs` |
| `eval/qa/cases.json` / battery | clean |
| Compiled cases | 500; ID absent |
| Registry counts | `active: 500` unchanged; `proposed: 0 → 1`; `quarantined: 0`; `retired: 0` |
| `reservedIds` | 500 → 501; only new ID is `q-tw-escrow-api-auth-custody` |
| Changed registry entries | that ID only |
| Test | still expects 500 compiled cases; now expects `proposed: 1` and reserved length 501 |
| Proposed lifecycle | `state: "proposed"`, `reviewState: "none"` |
| Content digest | `539b8174973d4225c6399fd5f3769b28646b22df0c0ebf01dfad69d5b8b1360c` matches the proposed file |

No remaining proposal-count finding. The test update belongs in this stage. Land these three files.

The proposed gospel now scopes submit paths by API version. It names `/helper/send-transaction` for pinned V1 and `/stellar/send-transaction` for pinned V2 and current Core API. Notes say the path is not a required key fact. That closes the earlier Medium submit-path finding for this proposal.

## Remaining findings

Only one finding remains, and it is not in this three-file proposal:

**High — host-curated description / five irrelevant captures.**
The served Trustless Work description still pulls path payments, StellarX, Blend TVL, SDF spending, and CLI bindings into the top five. Parent accepted this. Sol will add a small host-curated description, keep upstream bodies immutable, and will not change shared scoring. This lane stays available for that corrected source review and the drift review.

Do not activate the golden, and do not accept the source pin, until that description repair is independently reviewed.
