# Rows lane 2 — the four rows where arm B scored higher

Replays: `node replay.mts` (copy without the 12000-char cut at `l2r/replay-full.mts`). Replay outputs are in
`scratchpad/qa/l2r/`. Live checks were made on 2026-11-02.

Summary:

| Row | A → B | Cause | Docs backend decisive? |
|---|---|---|---|
| q-mpp-discovery-and-modes | partial → correct | judge-variance (+ golden-issue) | No. B made no docs call. |
| q-raph-hardware-wallet | partial → correct | agent-variance | No |
| q-soroban-instance-storage-dos | wrong → partial | docs-backend-retrieval (contributing) + golden-issue | Partly |
| q-soroban-reentrancy | wrong → partial | agent-variance (wording), single judge | No. No docs page says "reentrancy". |

Net: one of the four B gains has a real Mintlify retrieval contribution (instance-storage). The other three are not
evidence for the backend.

---

## q-mpp-discovery-and-modes (partial → correct)

1. **Verdicts.** A: partial, panel 3/3 partial (no disagreement). B: correct, panel `[correct, correct, partial]`.
   Both arms have the same single missing fact: "MPP and x402 require separate adapters; never relabel payloads."
   There are no wrong claims and no avoid matches in either arm.
2. **Docs calls.**
   - A: `search_docs_in_category({category:"build", query:"MPP machine payments protocol agent advertise"})`.
     The replay returns `/docs/build/agentic-payments/mpp#what-is-mpp`, the agentic-payments index, x402 quickstart,
     and building-with-ai.
   - A: `get_doc_page_sections({path:"/docs/build/agentic-payments/mpp"})`. The replay returns sections
     what-is-mpp, supported-mpp-intents, charge, session, install, demo, examples, and learn-more.
   - B: no stellarDocs call. Both arms built the answer from `skills.stellar-dev.agentic-payments` `file:mpp.md`
     (Discovery section).
   - The live Stellar MPP page has no OpenAPI or discovery content. The discovery facts in both answers come from the skill.
   - The two answers have the same substance. A: "x402 is the related, facilitator-based alternative … not MPP".
     B: "An alternative, facilitator-based route — x402 — exists alongside MPP". Neither says "separate adapters".
3. **Cause: `judge-variance`.** The evidence was the same (skill), the synthesis was near-identical, and the same fact
   was missing. One of three B judges held partial. The panel stability score is 0.5 in both arms (unstable register).
4. No `wrong` verdict.
5. **Action: golden re-verification is needed** (reverifyBy 2026-11-01 has passed). Live findings:
   - A golden source is stale. `https://developers.stellar.org/docs/build/apps/agentic-payments/mpp` returns **404**.
     The current page is `/docs/build/agentic-payments/mpp` (200).
   - Two golden sources are unreachable. `gh api repos/stellar/mpp` returns 404, and
     `repos/interop-alliance/mpp-services` returns 404. The live reference SDK is `stellar/stellar-mpp-sdk`
     (pushed 2026-10-26).
   - **Key fact 5 is now partly stale.** https://mpp.dev/mpp-vs-x402 (2026-11-02) says:
     "You can run both protocols on the same endpoint with `mppx`". It also says the server
     "emits both MPP and x402 Challenges, accepts either Credential format" (this is for x402-compatible EVM charges).
     The headers stay distinct (`PAYMENT-REQUIRED` vs `WWW-Authenticate: Payment`), so "do not relabel payloads"
     still holds. "Separate adapters" is no longer a safe universal claim. Recommended re-form: "Distinct protocols
     with distinct challenge, credential, and receipt formats. One server can offer both through mppx, but must not
     relabel one as the other."
   - Facts 1–4 still hold. https://mpp.dev/advanced/discovery has "OpenAPI 3.1 … at `/openapi.json` with
     `x-payment-info`". It also has "Discovery is advisory", and "The runtime `402` Challenge remains the
     authoritative source". It lists MPPScan and https://mpp.dev/services, and `https://mpp.dev/mcp/services` is
     "read-only". The Stellar MPP page says Session uses "unidirectional payment channels … signing cumulative
     commitments".
   - A minor naming drift: https://mpp.dev/payment-methods/stellar calls the intents "**charge**" and "**channel**".
     The Stellar docs and the skill say "Session".

## q-raph-hardware-wallet (partial → correct)

1. **Verdicts.** A: partial, panel unanimous. It is missing the boundary caveat (the device cannot protect you if
   you reveal the phrase, approve a malicious transaction, or use a fake app). B: correct, panel unanimous, with nothing
   missing. Neither arm has wrong claims or avoid matches.
2. **Docs calls.**
   - A, `search_wallet_dapp_docs("Ledger hardware wallet signing")`: **soft-empty** on Algolia.
   - A, `search_docs("hardware wallet Ledger")`: authority-model#key-storage-security, stellar-cli options,
     troubleshooting, and wallets#stellar-wallet-kit.
   - A, `search_docs("secret key custody risk…")`: glossary, create-account, and x402/mpp guides.
   - B, `search_wallet_dapp_docs` (same query): sep7, sep10, and wallet/intro. These are off-topic, so B gained nothing
     from this call.
   - B, `search_docs("Ledger hardware wallet")`: the same core pages as A (wallets, stellar-cli, troubleshooting).
   - B, `search_sdk_cli_tools_docs`: authority-model and the quickstart.
   - B, two `search_protocol_concepts_docs` calls: signatures-multisig and glossary.
   - B also called `scout.searchResearch` (Key Management 101, sdf-blog). A did not.
   - Both arms quoted the same decisive docs line: "Hardware confirmation acts as a physical approval gate"
     (authority-model, live 2026-11-02).
   - B's winning caveat ("won't stop you from physically approving a malicious/phished transaction") is agent
     reasoning. B itself labels it "by its own design logic in these docs". No docs result contains "phish",
     "malicious", or "recovery phrase". The only related replay hit is the secure-store "strand the account" line,
     which B cited by analogy.
3. **Cause: `agent-variance`.** The core docs evidence was the same. B made more calls (multisig docs, Scout research)
   and added the caveat. A did not add it. The Mintlify wallet search was worse than Algolia's soft-empty, not better.
4. No `wrong` verdict.
5. **Action: none.** Golden sources are live: the freighter guide returns 200 and key-management-101 returns 200.

## q-soroban-instance-storage-dos (wrong → partial)

1. **Verdicts.**
   - A: wrong, panel unanimous, escalation `boundary-wrong-claim`. Wrong claim: "worst case the contract becomes
     unusable … entry can no longer be read/written". Avoid match [1] (permanent brick). Missing: fact 3 (atomic
     failure, prior state preserved).
   - B: partial, panel unanimous. Missing: the same fact 3. No wrong claims, and the avoid item did not fire. B still
     says "bricking onboarding for new users" and "writes fail for the whole contract".
2. **Docs calls.**
   - A, `search_soroban_contract_docs("instance storage size limit contract data entry")`:
     choosing-the-right-storage#instance-storage and #storage-types, test-ttl-extension, and extend-persistent-entry-js.
     Decisive text: "the protocol only requires it to stay at or above a small fixed minimum, so it isn't guaranteed to
     never decrease".
   - B, `search_soroban_contract_docs("instance storage growing unbounded denial of service")`: the
     **storage-strategies "🚩 Red flags in review"** section comes first. It says: "An unbounded `Map` or `Vec` under
     one key. It grows toward the 64 KiB entry cap, every update rewrites the whole value, and all writers contend on
     one entry." B quoted this verbatim. The second B query ("persistent vs temporary vs instance storage TTL rent")
     also returned storage-strategies.
   - **Cross-replay (backend, not query, made the difference):**
     - B's query on Algolia returns deploy-sac-with-code, send-and-receive-payments, storing-data,
       example-contracts/storage, and contract-instances. It does not return storage-strategies.
     - A's query on Mintlify returns choosing-the-right-storage, storage-strategies (Appendix: Mainnet limits), and
       use-instance.
3. **Cause: `docs-backend-retrieval` (contributing), plus `golden-issue`.**
   - Mintlify put a concrete, authored failure mode in front of B ("grows toward the cap … rewrites the whole value").
     B stayed close to it.
   - A had only the "limit may decrease" text and extrapolated to "can no longer be read".
   - Neither arm stated fact 3. The partial → wrong gap is the avoid match only.
4. **Live verification of A's wrong claim.** The claim is *conditionally true*, not false:
   - stellar-core `src/transactions/InvokeHostFunctionOpFrame.cpp` (master `b46d35c5`, 2026-10-14) calls
     `validateContractLedgerEntry` in `addReads` (line 612) for each live footprint entry read, not only on write
     (line 774). `TransactionUtils.cpp:2028-2037` fails when `maxContractDataEntrySizeBytes() < entrySize` with
     "ContractData size exceeds network config maximum size". The result is
     `INVOKE_HOST_FUNCTION_RESOURCE_LIMIT_EXCEEDED`.
   - So if validators lower the limit below an existing instance entry's size, every invocation fails at read until
     the limit goes up again. The docs warn of exactly this: "it isn't guaranteed to never decrease. Leave headroom"
     (https://developers.stellar.org/docs/build/guides/storage/choosing-the-right-storage, 2026-11-02).
   - Under organic growth, the golden is right. The over-limit write is rejected, and the prior entry (≤ limit)
     stays readable. A did not condition its claim on a limit decrease ("approach the entry-size limit … can no
     longer be read/written"), so the judge was right to call A's unconditioned framing an overstatement.
5. **Actions.**
   - **Golden re-verification needed.** Add a qualifier to fact 3 and the avoid item: an over-limit write fails
     atomically. But an existing instance entry larger than a *later-lowered* `contract_data_entry_size_bytes` fails
     every read, so it makes the contract unusable until the limit is raised. This is why the docs say to leave
     headroom. Cite the stellar-core lines above. Without this, a correct limit-decrease answer reads as the banned
     "permanent brick".
   - No own-repo fix and no upstream finding. The B retrieval gain is the expected benefit.

## q-soroban-reentrancy (wrong → partial)

1. **Verdicts.** Both arms used a single judge (no panel); stability 0.75.
   - A: wrong. Wrong claim: "audit scrutiny … 'consistent with reentrancy being a closed class at the host level'".
     The judge read this as an exceptionless-host rule. Avoid match [2]. Missing: fact 3 (internal and `__check_auth`
     modes).
   - B: partial. Missing: the same fact 3. No wrong claims and no avoid matches.
2. **Docs calls.**
   - A, `search_docs("reentrancy")`: **soft-empty**.
   - A, `search_soroban_contract_docs("cross-contract calls reentrancy authorization")`: cross-contract-call example,
     conventions/cross-contract, and contract-authorization.
   - A, `search_docs("reentrant call host")`: contract-lifecycle#execution, environment-concepts, and fees metering.
   - A, `search_docs("contract calls itself recursion")`: an unrelated mix.
   - A, `get_doc_page_sections` for smart-contracts/overview and contract-interactions: no "reentr" match.
   - B, `search_soroban_contract_docs("reentrancy cross-contract call security")`: cross-contract-call,
     contract-authorization, conventions/cross-contract, and contract-interactions(/cross-contract).
   - B, `search_docs("reentrant call host prevents")`: contract-interactions/overview, contract-lifecycle,
     environment-concepts, and simulateTransaction.
   - No replay result in either arm contains "reentr". Mintlify `search_docs("reentrancy")` is also soft-empty:
     "None of the 42 candidate sections … contains a query term".
   - Both answers rest on the same skill line: "the host blocks reentrant calls, direct or indirect, on normal
     cross-contract paths". Both also cite the same Runtime Verification Moonlight audit (Scout).
   - A added unqualified phrasing: "blocks reentrant calls outright", "closed class at the host level",
     "re-entry itself is impossible". B kept "on normal cross-contract paths" throughout.
3. **Cause: `agent-variance`** (A dropped the skill's scope qualifier). A single judge, with no panel escalation, made
   the difference wrong rather than partial. Docs had no role.
4. **Live verification of A's wrong claim.** It is mostly true for public calls, but overstated:
   - `rs-soroban-env/soroban-env-host/src/host/frame.rs` (main; last change `e3342ddc`, 2026-08-17) defines
     `ContractReentryMode { Prohibited, SelfAllowed, Allowed }`. `default_external_call()` uses `Prohibited`, and the
     error is "Contract re-entry is not allowed". `host.rs:2497`: `call` is "always set `ContractReentryMode::Prohibited`".
     `host.rs:2534`: `try_call` passes Prohibited too.
   - The exception is `builtin_contracts/account_contract.rs:164-166`, which runs `__check_auth` with
     `ContractReentryMode::SelfAllowed` "to be able to do wallet admin ops using the auth framework itself".
     `Allowed` is `#[allow(dead_code)]`.
   - "Closed class" is accurate for classic public reentrancy. It is false as a literal host-wide rule because of the
     custom-account `SelfAllowed` path. A's "re-entry itself is impossible" has the same flaw. The judge's call
     follows the golden's GT-46 scope correction, so the verdict is defensible but harsh. The answer has no other
     error.
5. **Action: none for the golden.** It matches the source. For your judgment: this row and instance-storage both turn
   on a scope qualifier, and this one used a single judge. Consider whether an avoid match on a hedged inference
   ("consistent with …") should escalate to the panel. That is an own-repo judge-tier question, not a fix from this
   lane.
