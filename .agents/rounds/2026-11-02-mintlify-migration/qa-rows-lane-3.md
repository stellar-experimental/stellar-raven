# Rows lane 3 — QA row review (arm A Algolia vs arm B Mintlify)

Reviewer: rows-lane-3 (Claude Opus 5.5). Live checks done 2026-11-02 ~17:10Z. Replays used
`replay.mts`, plus an untruncated copy at `scratchpad/qa/ti/replay-full.mts` (same code, no 12k cut).
Raw replay outputs for row 4 are in `scratchpad/qa/ti/<n><A|B>.json` (call list: `ti/calls.txt`).

Summary table

| Row | A | B | Docs backend the cause? | Main cause |
|---|---|---|---|---|
| q-builder-content-by-person | wrong (partial/wrong/wrong) | wrong (wrong/correct/partial) | Partly, in A only | A: Algolia name search junk + agent absence claim. B: agent stated a dead-URL title from memory. Golden source is now dead (golden-issue). |
| q-raph-remove-scam-token | wrong | wrong | No | agent (same omission both arms) |
| q-sor-confidential-tokens | wrong | wrong | No | golden-issue (stale "unaudited preview") + agent (generic Merkle recipe, both arms) |
| q-ti-enumerate-holders-airdrop | wrong | (not run) | B would retrieve better pages | agent synthesis in A; Mintlify replay surfaces golden-supporting pages Algolia missed |

---

## 1. q-builder-content-by-person

**Verdicts.**
- A: `wrong`, panel [partial, wrong, wrong]. Wrong claim: "No SDF people roster, meeting notes, or stellarDocs hits reference him by full name directly". Avoid #1 fired.
- B: `wrong`, panel [wrong, correct, partial]. Wrong claim: "Authors roster (developers.stellar.org/meetings/authors) lists Tyler as Developer Advocate Director". The judge says this is unvalidated. Avoid #2 fired. Missing: the seven-post author index.

**Docs calls and replays.**
- A: one call, `search_docs({query:"Tyler van der Hoeven"})`. Algolia replay returns 10 unrelated hits: x402, logging, storage strategies. The snippets match "can", "per", "dev", "an", so Algolia matched stopword-like tokens. Nothing names him. A never called `search_meeting_notes`, but its answer still says "meeting notes" do not name him. An Algolia `search_meeting_notes` replay returns `meetings/authors/kalepail` ("Documentation > Tyler van der Hoeven"). A would have found him if it had asked.
- B: one call, `get_doc_page({path:"/meetings/authors"})`. The replay gives soft-empty 404 "No docs page exists at /meetings/authors". The page is absent in the Mintlify repo at de385430 and 7cb5e8a4. It left in the Docusaurus to Mintlify migration (stellar/stellar-docs #2941, 2026-10-22). The dfccf526 adapter also returns soft-empty on 404, so B's `authorsSnippet` was almost certainly null. A live Raven re-run of B's other turn-5 calls returned no "Developer Advocate Director" text: Lumenloop semantic/AV, Scout research/people (total=0). B's title and URL therefore came from model memory, not from tool output.
- A Mintlify `search_meeting_notes({query:"Tyler van der Hoeven"})` replay returns the 2024 meeting pages with the byline `[Tyler van der Hoeven](https://github.com/kalepail), Developer Advocate Director`. Neither arm made this call.

**Cause.**
- A: `docs-backend-retrieval` (Algolia search_docs returns junk for a person name) combined with agent overreach (an absence claim for a lane it did not query).
- B: `agent-variance`. The agent asserted a page it did not read. The judge's provenance reasoning (that the claim came from scout.getPeople) is wrong. Its conclusion (unvalidated) is right.
- The A/B difference is mostly agent and judge variance. B's panel split shows a borderline grade.
- Also `golden-issue`: the golden's "official Developer Docs author index (seven posts)" no longer exists live.

**Live verification of wrong claims.**
- A's claim is false. https://developers.stellar.org/meetings/2024/06/13 (live 2026-11-02) renders "Tyler van der Hoeven … Developer Advocate Director". A GitHub code search of stellar/stellar-docs finds 7 meeting pages with this byline (2024-01-26, 02-08, 02-22, 03-07, 03-21, 04-18, 06-13).
- B's claim is stale, with a dead URL. https://developers.stellar.org/meetings/authors returns HTTP 404 (2026-11-02). The Wayback snapshot of 2026-04-14 (web.archive.org/web/20260414153953/…/meetings/authors) reads "Tyler van der Hoeven 7 Developer Advocate Director". The title is real but dated 2024. B labels it "Current/credited role". That framing is false as current: Scout's builder bio says "Independent Stellar developer".

**Action.**
- Golden re-verification needed. Replace "official Developer Docs author index (seven posts)" with the seven live meeting pages that carry his byline. Note that the author index was removed in the 2026-10-22 Mintlify migration. The 2026-09-30 note "author index still lists seven posts" is now stale.
- Upstream finding candidate (stellarDocs, Algolia arm only): a person-name `search_docs` returns stopword-matched junk. This is moot if Mintlify ships.
- No own-repo fix is needed for the Mintlify arm. `search_meeting_notes` works there.

---

## 2. q-raph-remove-scam-token

**Verdicts.**
- A: `wrong`, coreAnswer incorrect. Missing: key fact 3 (do not sign unfamiliar links or send the balance to a random address). Wrong claim: "returning to the issuer burns them" with no qualification. Avoid #3 fired.
- B: `wrong`. Missing: key fact 3. No wrong claims. The judge penalized "send any remaining units back to the issuer or elsewhere" because it has no caution.

**Docs calls and replays.**
- A: `search_asset_token_docs("anatomy of an asset asset code and issuer")` and `search_anchor_sep_docs("stellar.toml SEP-1…")`.
- B: `search_asset_token_docs("asset anatomy asset code issuer")` and `search_docs("remove trustline changeTrust limit 0 delete unwanted asset")`.
- Both arms got equivalent evidence: anatomy-of-an-asset, publishing-asset-info, control-asset-access, list-of-operations, and the `stellar-dev.assets` skill. A probe search for "scam token phishing unfamiliar link" returns no safety-warning page in either backend. The golden's warning source is a stellar.org blog post (how-to-protect-yourself-from-scammers), which is outside developers.stellar.org. Neither agent searched Lumenloop or consumer-safety content.

**Cause.** `agent-variance` with the same outcome in both arms. Both agents gave developer-oriented answers and skipped the required consumer safety warning. The docs backend is not involved.

**Live verification of A's wrong claim.** The claim is true but incomplete, not false.
- https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/assets (2026-11-02): "To delete, or "burn", an asset, you must send it back to the account that issued it."
- The golden's qualifier is also correct. list-of-operations: `PAYMENT_SRC_NOT_AUTHORIZED` "The source account is not authorized to send this payment."
- The verdict rests on missing key fact 3, which the golden marks as required. That is a fair basis.

**Action.** None for the docs backend. Optional: track this as an agent-guidance gap. Retail safety questions do not trigger a consumer-safety source pass.

---

## 3. q-sor-confidential-tokens

**Verdicts.**
- A: `wrong`. Missing: key fact 1 (ordinary assets are public by default). Wrong claims: (a) OZ Confidential Tokens v0.8.0 is "audited"; (b) a generic Merkle-leaf "Net procedure". Avoid #1 and #3 fired.
- B: `wrong`. Missing: key fact 1 and key fact 5. Wrong claim: it presents Strategy 11 "Merkle roots and derived state" as "Stellar's documented pattern" for the audit. Avoid #3 fired.

**Docs calls and replays.**
- Both arms used `search_wallet_dapp_docs` for privacy and confidential tokens, and a storage-strategies search for Strategy 11.
- In both backends the replay returns /docs/build/apps/privacy with the same caution text: "OpenZeppelin's v0.8.0 audit covers the confidential token contracts and circuits…". Both backends also return the storage-strategies page.
- The evidence is the same in both arms, and both agents produced the same Merkle synthesis.

**Cause.** No A/B difference to explain. Both arms fail for two reasons:
- `golden-issue`: key fact 2 and avoid #1 are stale.
- Agent synthesis: both arms omit key fact 1 and both invent the generic Merkle recipe (avoid #3, which is valid).

**Live verification.**
- (a) "audited" is TRUE live. https://developers.stellar.org/docs/build/apps/privacy (2026-11-02): "OpenZeppelin's v0.8.0 audit covers the confidential token contracts and circuits." This changed in stellar/stellar-docs fc4b3c90 (#2915, 2026-10-21). The earlier text was "developer preview … unaudited". The OZ v0.8.0 release was published 2026-10-20. The audit PDF path returns HTTP 200. The golden (asOf 2026-09-02) says "not audited" and "Testnet developer preview". That is stale. Only the demo remains a Testnet developer preview. The non-ZK UltraHonk caveat still applies.
- (b) The Merkle recipe is wrong for the named protocol. The OZ `packages/confidential/README.md` at v0.8.0 has 0 mentions of "Merkle". It says balances are "unchunked Pedersen commitments" and that "auditors recover amounts through per-transfer ECDH" (release notes). The overview says transfers emit "an event carrying … the auditor ciphertexts". The protocol-defined audit evidence is the event-borne auditor ciphertexts plus the registered auditor key, not a Merkle path. Strategy 11 in storage-strategies is a storage pattern for airdrops and governance and does not mention confidential tokens. B's wrong claim is upheld. A's second claim is upheld.
- Key fact 1 is supported live: privacy page, "Stellar is a public blockchain: every transaction is recorded onchain and visible to anyone." Both agents had this page and omitted the fact.

**Action.** Golden re-verification needed:
- Update key fact 2 and the golden answer. The OZ `stellar-confidential` v0.8.0 is a released, audited library (2026-10-20/21). Its verifier is non-ZK UltraHonk, so OZ does not guarantee privacy yet. The demo is Testnet only.
- Narrow avoid #1 to "approved/private-by-default Mainnet infrastructure" and drop "audited".
- Optionally name the protocol-defined auditor path (per-transfer auditor ciphertexts and auditor key registry) as the example for key fact 5.
- No docs-backend action.

---

## 4. q-ti-enumerate-holders-airdrop (arm A only; B stopped)

**Verdict.**
- A: `wrong`, no wrong claims. Avoid #3 fired: it airdrops without defining holder classes or idempotent retry state.
- A is missing 5 items: C-address exclusion, crawl is not an atomic snapshot (pin the ledger or use Hubble), holder-class eligibility, a zero-balance filter, and a recipient ledger with a canary step.

**A's docs calls.** There are 14 stellarDocs calls (see `ti/calls.txt`). I replayed all 14 in both arms without truncation.

**What Algolia returned (A).** Mostly operation result-code pages, ingestion-filtering, Lab horizon-endpoint anchors, the pagination and page-arguments pages, and error-handling. It never returned `/horizon/api-reference/list-all-accounts`, which is a golden source. It never returned a Hubble snapshot table or `queries-for-horizon-like-data`.

**What Mintlify would return (B replay of the same queries).**
- `list-all-accounts` (calls 7 and 10). The page says: "asset … Every account in the response will have a trustline for the given asset", limit "1 to 200", and cursor.
- Hubble `silver/trustlines-snapshot` (calls 1, 7, 11). It includes a SQL example over `crypto-stellar.snapshots.trustlines_snapshot` with `valid_from`/`valid_to` date pinning. This supports pinning a ledger or date and using Hubble.
- Hubble `gold/asset-balances-daily-agg` (call 1). It says: "count of accounts holding a trustline … including accounts with a zero balance", and gives a separate "count of positive contract balance holders". This supports the zero-balance filter and the fact that contract balances are separate from trustlines.
- `list-all-claimable-balances`, `submit-async-transaction`, `error-handling`, `timeout`, and SDP `retry-payments`.

**Would Mintlify have changed the evidence?** Yes, it would have been materially better on golden key facts 1, 2 (indirectly), and 4. No page states outright "/accounts excludes C-addresses" or "a crawl is not atomic". The agent would still need to infer both. Recipient-ledger and canary advice is not in the docs in either backend.

**Cause.** In arm A the cause is agent synthesis on thin evidence. For a hypothetical arm B the cause would be `docs-backend-retrieval` (better). I predict B improves to partial at best, not correct, because key fact 5 and avoid #3 depend on the agent.

**Action.** None for the golden; its claims match the docs above. Record this row as evidence that Mintlify retrieves the Horizon reference and Hubble pages better than Algolia for this query family. If B is re-run, re-check this row first.

---

## Cross-row notes
- Two goldens are stale because of the 2026-10-21/22 docs changes:
  - q-builder-content-by-person: the author index page was removed.
  - q-sor-confidential-tokens: the docs now say "audited".
- The `golden-truth` skill should re-verify both before any verdict comparison uses them.
- None of the 3 rows that are wrong in both arms is caused by the docs backend.
