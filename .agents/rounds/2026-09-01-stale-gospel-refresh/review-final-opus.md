# Final independent review — stale-gospel refresh

Round: `.agents/rounds/2026-09-01-stale-gospel-refresh.md`
Reviewer: Claude Opus 5, high effort. Independent of the orchestrator and of all three lanes.
Review date: 2026-09-02 UTC (2026-09-01 local).
Base: `8c0f0069dff2f5b1d8d69666bd779dff994c6f08` (`main`).
Branch: `maintenance/stale-gospel-2026-09-02`.
Files changed: 13. No file was edited by this review.

**Verdict: CHANGES REQUIRED.** Three blocking items remain. The evidence work itself is strong.

---

## 1. What this review did

This review re-derived the volatile high-weight claims from current primary sources. It did not
trust any prior `truth.verified` text, and it did not trust the three lane matrices. It re-fetched
the sources itself.

Read-only commands run:

- `node eval/qa/lint-corpus.mjs --since main --stale` (branch): 2 errors, 62 warnings.
- `node eval/qa/lint-corpus.mjs --stale` (clean `main` export): 7 errors, 62 warnings.
- `node eval/qa/compile-qa.mjs` in an isolated copy, then `lint-corpus --stale`: 1 error, 62 warnings.
- `node eval/qa/register-helper.mjs --check` in that copy: `up to date`.
- `npm run improvements:lint`: `ok (66 findings)`.
- `npm run secrets:scan -- --tree`: `clean (+ gitleaks)`.

Compile and register ran inside a scratch copy of the tree. The working tree was not modified.

---

## 2. Re-derived claims

Each row below was fetched by this review from the named primary source on 2026-09-02 UTC.

| Claim in the diff | Source class | Result |
| --- | --- | --- |
| Relayer latest release `v1.8.0`, published 2026-08-19 | B (GitHub releases API) | Confirmed. `published_at` `2026-08-19T13:58:23Z`. `v1.7.0` is 2026-07-28. |
| Rendered docs stable is 1.5.x; no 1.7.x or 1.8.x path | A + C | Confirmed. `/relayer/1.5.x` → 200. `/relayer/1.7.x` → 404. `/relayer/1.8.x` → 404. |
| Channels is free under a fair-use stroop limit that resets after 24 hours | A | Confirmed. "Free to Use: No credits, subscriptions, or payment systems (subject to fair use policy)"; "Each API key has a fee consumption limit (measured in stroops)"; "The limit resets automatically 24 hours after your first transaction". |
| The public Channels Statuspage is inactive | C | Confirmed. `status.channels.openzeppelin.com` → 302 → `relayerchannelsmainnet.statuspage.io/inactive`, title "Stellar Relayer Channels Mainnet Status - Page Inactive". The status JSON returns 401. |
| Stellar Docs still conflates Relayer with Channels (sd-039) | A | Confirmed. "OpenZeppelin Relayer, also known as Stellar Channels Service, is a managed infrastructure…". |
| Confidential Tokens is an unaudited developer preview | A | Confirmed. "Confidential tokens on Stellar are a developer preview. The contracts and demo linked below are unaudited — not yet intended for production use or real assets." |
| Balances and amounts private; addresses public | A | Confirmed, verbatim on the privacy page. |
| CAP-0059 Final at Protocol 22 | B | Confirmed in `core/cap-0059.md`. |
| CAP-0074 Final at Protocol 25 | B | Confirmed in `core/cap-0074.md`. |
| CAP-0075 Final at Protocol 25 | B | Confirmed in `core/cap-0075.md`. |
| SEP-57 Draft, version 0.3.0, updated 2026-06-11 | B | Confirmed in `ecosystem/sep-0057.md`. |
| Solang v0.3.5 is the newest tag | B | Confirmed. Tag list top is `v0.3.5`. The repository is `hyperledger-solang/solang`. |
| Solang Soroban target is pre-alpha and not production-ready | B | Confirmed. "The Soroban target is still pre-alpha."; "not yet feature-complete or production-ready". |
| Three Reflector Mainnet oracle IDs | C + A | Confirmed. The live `orchestrator.reflector.network/config` carries `CAFJ…4DLN`, `CALI…LE6M`, `CBKG…CJZC`, plus `CBQSUF…XQLSE`. The official oracle-providers table lists the same three with matching labels. |
| The operator site no longer shows `x_*` names | A | Confirmed. `reflector.network` serves `app.15f5d5389a86b33026a9.js`, the exact bundle the lane named. It contains 0 occurrences of `x_last_price`. |
| Pulse `lastprice(asset)`; Beam `lastprice(caller, asset)` | B | Confirmed in the README interface blocks of `reflector-network/reflector-contract` at `42f3116`. |
| README Beam example points to a Pulse ID | B | Confirmed. The `ReflectorBeam` example hard-codes `CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN`, a verified Pulse oracle. |
| Circle Testnet USDC issuer `GBBD47IF…FLA5` | A | Confirmed on Circle's contract-address page. |
| Friendbot funds fake XLM and is rate limited without a numeric quota | A | Confirmed. "funds accounts and contracts with fake XLM"; "Requests are rate limited, so use wisely". No numeric quota is published. |
| Fund one account, then use Create Account | A | Confirmed verbatim on the Networks page. |
| No current Lab USDC path-payment distribution route | A | Confirmed by two pages the lane did not cite. See finding N5. |
| Validation Cloud lists a Stellar Testnet XLM path | A | Confirmed, with a nuance the case dropped. See finding N6. |

Nothing in the re-derivation contradicts the diff. Every dated number in the seven cases is correct
for 2026-09-02 UTC. The `asOf` split between 2026-09-01 and 2026-09-02 is also correct: the two
funding lanes observed before 00:00 UTC, and the Soroban lane observed at 00:42–00:48 UTC.

---

## 3. Removed claims

Requirement: prove that each removed claim was truly unsupported.

**3.1 `q-ti-testnet-usdc-faucet` — the Lab path-payment distribution route. Removal is correct.**

This review checked two official pages that the lane did not cite. `docs/tools/lab/account` says
"Click on the 'Fund account with Friendbot' button to add 10,000 XLM to the account" and "Once an
account is funded with 10,000 XLM, you can create a trustline with USDC or EURC". It gives no way
to receive test USDC units. `docs/build/guides/transactions/path-payments` is a JavaScript SDK
tutorial, not a Lab flow, and it converts assets the sender already holds. Neither page supports a
Lab-based USDC distribution demo. The removal is sound and the replacement clause is weaker and
safer.

**3.2 `q-sor-reflector-integration-code` — the "official site text mentions `x_*`" clause. Removal
is correct.** This review fetched the same bundle and found zero matches.

**3.3 `q-ti-openzeppelin-relayer` — the "managed Channels billing/top-up" framing. Removal is
correct.** Channels currently publishes free access under a fair-use policy. A "billing/top-up"
framing would now be wrong.

No removal deleted a supported claim.

---

## 4. Blocking findings

### B1 — Generated artifacts are stale (BLOCKING)

`eval/qa/cases.json`, `eval/qa/sample.json`, and `eval/qa/lifecycle-registry.json` do not match the
case files. `lint-corpus` reports:

```
ERROR [lifecycle-registry] q-ti-openzeppelin-relayer: registry caseContentSha256 is stale
```

The only content difference is one key fact in `q-ti-openzeppelin-relayer`. The committed artifacts
hold "Distinguishes the funding model for each product." The case file now holds "Explains each
product's funding model." The corpus hash must move from
`6ed237dcefc10cf16ddee834ec25cb69f571c8d397d7f90966e32ca6768e38a3` to
`6fb082e43cef20b8336fd423ee0151440600a423376e8b0ae51799e072350c64`.

CI byte-pins these files, so this blocks merge.

Fix: run `npm run eval:qa:compile`. This review confirmed in an isolated copy that the compile
clears this error and changes nothing else.

### B2 — Date-trap disposition is stale (BLOCKING)

```
ERROR [date-trap] q-sor-confidential-tokens: disposition reverifyBy 2026-09-01 does not match truth.reverifyBy 2026-12-15
```

This is the one error the handoff expected. It needs an authored edit. The exact receipt is in
section 6.

### B3 — Six reopened clusters are unreconciled (BLOCKING)

`register-helper` set `verdict: "reopen"` on six clusters and on one date trap. The lint does not
error on this state, but the round ledger states the close condition itself: "Each entry needs a
dated authored reconciliation before close." Committing a register with six open `reopen` verdicts
would ship an unreconciled consistency state.

No entry on `main` keeps a `reopened` key next to a closed verdict. The precedent is therefore
clear: on close, set the verdict, refresh `lastChecked`, write `reSwept`, and delete `reopened`.
Section 6 gives the exact text for all seven entries.

---

## 5. Non-blocking findings

### N1 — `q-soroban-av-passkeys-talk` notes emit a retired operation id and contradict the answer

`golden.notes` says "lumenloop_find_av_passages is the transcript/AV-passage lane" and "Each
surfaced passage carries its talk/podcast source (lumenloop_find_av_passages)". The exposed id is
`lumenloop.find_av_passages`. The case's own `avoid` item says "Do NOT emit retired
lumenloop_find_av_passages". AGENTS.md states the hard rule: "Never emit references to non-exposed
operations or retired skills."

The same notes say the case is "graded on returning real transcript passages". The answer says the
response "does **not** contain transcript text". A grader reading both gets opposite instructions.

This text is pre-existing. This diff did not introduce it. It is still a defect this round should
have caught, because the lane matrix P2, P7, and P8 examined exactly this contract and stamped a
new `truth.verified` event on 2026-09-02. The prebuild guard `assertNoNonExposedRefsInText` covers
emitted text, not `golden.notes`, so no gate catches it.

Recommended: replace both notes occurrences with `lumenloop.find_av_passages`, and change "real
transcript passages" to "real summary rows with their talk or podcast provenance". Keep the `avoid`
occurrence, which correctly names the trap.

### N2 — GT snapshot dates refreshed in four cases and left stale in three

The round refreshed `GT-42` to 2026-09-02, `GT-53` to 2026-09-02, and `GT-54` to 2026-09-01. It
left `GT-41 snapshot 2026-07-10`, `GT-44 live service contract 2026-07-11`, and `GT-52 CORRECTION
2026-07-11` unchanged, while moving `truth.asOf` on all three to 2026-09-02 or 2026-09-01.

The `GT-41` case is the clearest. Its note tells the grader "SEP-57 Draft v0.3.0 and Solang 0.3.5
pre-alpha are volatile" under a 2026-07-10 stamp. Both values were re-verified as current on
2026-09-02. The soroban matrix already flagged this date as an optional touch. The condition it
attached — that `truth.verified` must move in the same diff — is already met.

Recommended: refresh all three GT stamps, or state in the ledger that a GT label is provenance for
the original correction and is never refreshed. Either rule is fine. The current mix is not.

### N3 — Reflector `x_*` corroboration verdict should be `contradicted`, not `unverifiable`

The evidence is positive evidence of absence. The lane fetched the site bundle and its chunks and
found zero `x_*` names. This review reproduced that on the same bundle hash. The compile schema
accepts `contradicted`, and the same diff uses `contradicted` for the Channels Statuspage row on an
identical evidentiary shape. `unverifiable` understates what the lane actually established.

### N4 — The Beam-deployment row from the matrix was dropped

The soroban matrix wrote a paste-ready row: "A live Mainnet Beam oracle deployment exposing
lastprice(caller, asset) exists" with verdict `unverifiable`. The case file does not carry it. The
answer still states "Beam uses `lastprice(caller, asset)`" with no qualification, and the notes now
warn about the README Beam example. A later reader cannot tell that the Beam signature is
source-confirmed only, and that no Beam oracle appears in the operator config or the official
provider table. Recommended: add the row the matrix already wrote.

### N5 — Dead provenance on the Lab corroboration row

The class A ref is `https://lab.stellar.org/account/fund`. This review fetched it and got a
JavaScript application shell with no readable content. The class D ref is the lane file, whose own
source S13 cites `/tmp/stellar-lab-usdc-evidence.json`. That path does not survive the round. The
register's own history records this pattern as the "temporary-path provenance" class that earlier
rounds burned down.

The verdict is right and the removal is right. The provenance is not re-walkable.

Recommended: re-anchor on `https://developers.stellar.org/docs/tools/lab/account`, which this
review verified states Friendbot funding of 10,000 XLM and USDC/EURC trustline creation, and
provides no mechanism to receive test USDC units. Add
`https://developers.stellar.org/docs/build/guides/transactions/path-payments` as a second class A
row showing the path-payment route is an SDK tutorial, not a Lab distribution demo.

The friendbot lane has the same `/tmp` pattern in three rows. Those rows did not reach the case
file, so no case is affected.

### N6 — The Validation Cloud nuance was dropped from the case

The friendbot lane found `https://docs.validationcloud.io/v1/about/faucets`. This review confirmed
it: Validation Cloud "link[s] to other existing and working testnet faucets" for Stellar, and
operates its own faucet only for ICP. That page is the source that backs the golden's caution "not
assumed independent of Friendbot". The case file cites only the marketing page
`https://www.validationcloud.io/multi-chain-faucets`.

The lane offered a precision rewording and the author declined it. Declining the rewording is
defensible. Dropping the source that justifies the existing caution is not. Recommended: add the
docs page as a class A evidence row.

### N7 — Friendbot 400-versus-429 asymmetry has no grader protection

The lane found that Circle's Stellar trustline guide documents "Friendbot funding failed: 400" for
its rate-limit example. The golden gates on `429` plus `Retry-After`. The lane said "Do not add an
avoid clause that rejects a dated `400` report". No such avoid clause exists, so nothing is wrong
today. There is also no positive protection. An answer that correctly reports a dated `400` has no
grader cover. Recommended: one "also good" clause allowing a dated `400` report.

### N8 — `catalog/manifest.json` misdescribes `created_at`; this is own-repo work

The passkeys lane P6 found a real defect in this repository. The catalog says "created_at (the
recording's date — use it to judge and cite how recent the talk is)". Live rows disagree: a DEVCON
2024 talk carries `created_at` `2026-04-02T23:21:21.744Z`, and "Passkeys: The Future of Passwords"
carries `2026-04-28T05:25:34.817Z`. The field behaves as an ingest or index date.

The catalog is generated from repository-owned data, so this is an own-repo defect. Under
`improvements/README.md` it belongs in `.agents/TODO.md`, not in `improvements/`. The round left it
in the matrix only. Recommended: add a TODO item. Correct the description, or route the
recording-date claim to a field that carries it.

### N9 — The `/gen` request was an authorization deviation, not only an accident

The ledger records: "One read-only review request to `https://channels.openzeppelin.com/gen`
unexpectedly returned HTTP 201 and issued an API key."

This review checked the containment and found it complete. No key value appears in any round file,
in any case file, or in the ledger. `npm run secrets:scan -- --tree` is clean. No relay, payment,
or faucet call followed. Nothing needs remediation.

The classification is still too soft. The round's own authorization table prohibits a "Faucet or
other value-changing request". The Channels guide documents `/gen` as the key-issuance endpoint,
and the path name says so. The outcome was foreseeable, so this was a deviation from the
authorization table, not an unforeseeable accident.

`.agents/skills/golden-truth/SKILL.md` has no read-only probe rule. That is the gap.

Recommended, in order:

1. Change the ledger sentence to name it as an authorization deviation with a stated cause.
2. Add one timeless rule to the golden-truth skill: a read-only probe reads a documented read path;
   never call an endpoint whose documented purpose is provisioning, issuing, or creating.

### N10 — sd-039 can carry two more verified facts

The recurrence is correct and necessary. This review reproduced the alias framing on
`developers.stellar.org/docs/tools/openzeppelin-relayer` on 2026-09-02, so the finding still
reproduces and the count bump from 3 to 4 is right. `improvements:lint` passes and `INDEX.md`
matches.

Two newly verified facts strengthen the record's own "date the mutable claims" recommendation. The
same SDF page still links `https://status.channels.openzeppelin.com/`, which is now an inactive
Statuspage. It also still links `docs.openzeppelin.com/relayer/1.3.x/guides/stellar-channels-guide`,
two stable versions behind the rendered 1.5.x path. Recommended: append both to the 2026-09-02
recurrence evidence line.

### N11 — The staggering rule was applied inconsistently

The confidential-tokens rationale is explicit: use 2026-12-15 to avoid a second cliff on
2026-11-19. The Relayer case was then set to 2026-11-19. That date already held 9 cases and is the
corpus's largest bucket. It now holds 10. The new dates count 5, 10, 4, 6, and 1 cases. This is low
priority and does not change any fact. Recommended: move the Relayer case a few days, or state why
2026-11-19 is correct for it.

### N12 — `verified.date` and `asOf` differ on the two funding cases

`q-ti-friendbot-ratelimit-alternatives` and `q-ti-testnet-usdc-faucet` carry `asOf` 2026-09-01,
evidence `observedAt` 2026-09-01, and `verified.date` 2026-09-02. The five other cases are uniform
at 2026-09-02. This is correct. The observation date and the reconciliation date are different
things, and the lanes really did observe before UTC midnight. A later reader will not know that.
Recommended: one sentence in the ledger.

---

## 6. Exact closure receipts

### 6.1 The date trap (clears the B2 lint error)

In `eval/qa/consistency-register.json`, in the `dateContingentTraps` entry whose `caseIds` are
`q-edge-noinfo-stellar-native-privacy-default`, `q-scf-confidential-tokens-preview`, and
`q-sor-confidential-tokens`:

Replace `triggerDateEvent`:

```
"2026-11-19/2026-12-15 review or any Confidential Tokens Mainnet approval/launch"
```

Replace `disposition`:

```
"open — Testnet developer preview, unaudited, re-verified 2026-09-02; q-sor-confidential-tokens reverifyBy 2026-12-15 and q-scf-confidential-tokens-preview reverifyBy 2026-11-19."
```

Set `verdict` to `"consistent"`, set `lastChecked` to `"2026-09-02"`, delete `reopened`, and
replace `reSwept` with:

```json
{
  "date": "2026-09-02",
  "reason": "Stale-gospel refresh (2026-09-02): q-sor-confidential-tokens changed only by an in-answer as-of date (2026-07-10 to 2026-09-02) and judge-blind truth metadata; the preview status it dates is unchanged. Re-derived from https://developers.stellar.org/docs/build/apps/privacy ('developer preview ... unaudited — not yet intended for production use or real assets') and https://stellar.org/blog/developers/developer-preview-confidential-tokens-on-stellar. No Mainnet approval evidence exists as of 2026-09-02, so the trap stays open with refreshed reverifyBy references.",
  "verdict": "consistent"
}
```

The `2026-11-19` reference is still correct. This review confirmed
`q-scf-confidential-tokens-preview` carries `reverifyBy` `2026-11-19`.

### 6.2 The six clusters

For each cluster: set `verdict` to `"consistent"`, set `lastChecked` to `"2026-09-02"`, delete the
`reopened` object, and replace `reSwept` with the object below. Leave `memberContentSha256` alone.
`register-helper --check` already reports the hashes as up to date, and it never re-adds `reopened`
unless a stamped hash moves again.

**cluster-008 — CAP statuses and protocol assignments**

```json
{
  "date": "2026-09-02",
  "reason": "Stale-gospel refresh (2026-09-02): only q-sor-confidential-tokens changed, and only by an in-answer as-of date plus judge-blind truth metadata. No CAP id, status, or protocol assignment moved. The cluster's own assignments were re-derived from canonical source: cap-0059.md Status Final / Protocol version 22; cap-0074.md Final / 25; cap-0075.md Final / 25. The cluster note stands unchanged.",
  "verdict": "consistent"
}
```

**cluster-023 — Friendbot/testnet funding boundaries**

```json
{
  "date": "2026-09-02",
  "reason": "Stale-gospel refresh (2026-09-02): q-ti-testnet-usdc-faucet refreshed its dated issuer and faucet observation to 2026-09-01 and removed an unsupported named Lab path-payment distribution route. The durable Friendbot, trustline, reserve, and SAC boundaries are unchanged. Removal verified against https://developers.stellar.org/docs/tools/lab/account, which documents Friendbot XLM funding and USDC/EURC trustline creation but no way to receive test USDC units. Members re-read: q-ti-stellar-lab-usage-and-new-ui already avoids 'say a trustline credits tokens'; q-tool-cli-testnet-identity-howto, q-infra-testnet-vs-futurenet, q-edge-send-me-free-xlm, q-edge-jailbreak-generate-secret-keys, and q-ti-custodial-account-generation-c-address assert no Lab USDC distribution route. No contradiction.",
  "verdict": "consistent"
}
```

**cluster-047 — Default transparency versus optional privacy applications**

```json
{
  "date": "2026-09-02",
  "reason": "Stale-gospel refresh (2026-09-02): q-sor-confidential-tokens changed only by an in-answer as-of date and judge-blind truth metadata. The preview status, the visibility boundary, and the primitives-are-not-a-product boundary are unchanged, and were re-derived from https://developers.stellar.org/docs/build/apps/privacy on 2026-09-02. Sibling q-edge-noinfo-stellar-native-privacy-default carries an older asOf of 2026-07-10, but the fact it dates did not move. No contradiction.",
  "verdict": "consistent"
}
```

**cluster-092 — q-sor-confidential-tokens + q-edge-noinfo-stellar-native-privacy-default**

```json
{
  "date": "2026-09-02",
  "reason": "Stale-gospel refresh (2026-09-02): the only member change is the q-sor-confidential-tokens in-answer as-of date plus judge-blind truth metadata. The dated preview status and the conditional-evidence framing that this cluster records are both unchanged. No contradiction.",
  "verdict": "consistent"
}
```

**cluster-110 — Default transparency versus primitives**

```json
{
  "date": "2026-09-02",
  "reason": "Stale-gospel refresh (2026-09-02): q-sor-confidential-tokens changed only by an in-answer as-of date and judge-blind truth metadata. BN254 and Poseidon remain Protocol 25 primitives, re-derived from cap-0074.md and cap-0075.md (both Status Final, Protocol version 25) and from https://developers.stellar.org/docs/build/apps/zk. No contradiction.",
  "verdict": "consistent"
}
```

**cluster-127 — Confidential Tokens developer preview and network availability**

```json
{
  "date": "2026-09-02",
  "reason": "Stale-gospel refresh (2026-09-02): q-sor-confidential-tokens changed only by an in-answer as-of date and judge-blind truth metadata. All members still describe a Testnet developer preview and not a Mainnet launch. Re-derived 2026-09-02 from https://developers.stellar.org/docs/build/apps/privacy and the SDF developer-preview post, which says the contract is live on testnet and not yet approved for mainnet. Sibling q-scf-confidential-tokens-preview keeps reverifyBy 2026-11-19 and is unchanged. No contradiction.",
  "verdict": "consistent"
}
```

---

## 7. Improvement routing decisions

### 7.1 sd-039 — a recurrence update was needed and is correct

The defect still reproduces. This review confirmed the alias sentence on the live Stellar Docs page
on 2026-09-02. The recurrence entry is dated, evidence-bearing, and newest-first. The count moved
from 3 to 4 in `INDEX.md`. `improvements:lint` passes with 66 findings. The decision not to post a
recurrence-only comment on issue `stellar/stellar-docs#2707` follows the round's stated practice.

One enhancement is available and is not required. See finding N10.

### 7.2 The Reflector README Beam example — ledger-only

The defect is real. This review confirmed it independently: the `ReflectorBeam` example in
`reflector-network/reflector-contract` README hard-codes
`CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN`, which the operator config and the
official Stellar Docs provider table both identify as a Pulse oracle. A developer who copies that
example calls `lastprice(caller, asset)` against a contract that exposes `lastprice(asset)`. That
is exactly the trap the case asks about.

Decision: **ledger-only. No improvements record, no upstream issue, no TODO.**

Reasons, under repository policy:

1. `improvements/` holds findings about the exposed upstream surfaces and the provider package.
   The collections are `lumenloop/`, `stellar-light-scout/`, `stellar-docs/`, `skills/`, and
   `workers-ai-provider/`. `reflector-network/reflector-contract` is none of these. It is not an
   exposed service and it is not a pinned skill source in `ecosystem-skills/MANIFEST.json`.
2. `improvements/README.md` routes this class directly: "Facts owned by a SEP, CAP, implementation,
   or product repository are corrected there." It also says a new collection is added "only when a
   verified site finding cannot be represented honestly by an existing service lifecycle". No
   existing lifecycle owns a third-party oracle repository.
3. `improvements/intake.json` has no owner mapping for `reflector-network`. `npm run
   improvements:file` cannot resolve a target, so filing upstream would leave the process.
4. Nothing in this repository is wrong, so `.agents/TODO.md` does not apply.
5. The useful part is already captured where it pays off. The case notes now carry the "also good"
   clause "Warns that the README Beam example points to a Pulse contract ID." That protects an
   answer that spots the trap.

The ledger already records the defect with its class B and class C evidence. That is the right
resting place.

---

## 8. Baseline warnings, not this round's problems

Requirement 9. The following are pre-existing and are explicitly not findings against this diff.

- 62 lint warnings. The count is identical on `main` and on this branch. None of them names any of
  the seven cases.
- The two `symmetric-caution` warnings on `q-protocol-bn254-poseidon-xray` and
  `q-protocol-ledger-close-time`. Both exist on `main`.
- All 44 `avoid` sourcing-guard warnings and all 16 `corroboration` negative-claim warnings.
- The seven `[stale]` errors on `main` are the reason this round exists. All seven are cleared.

The round's own report of "two new key-fact warnings and the Relayer symmetric-caution warning"
checks out. All three are fixed. The warning count did not rise above baseline.

---

## 9. Quality and reviewability notes

The three matrices are the strongest part of this round. They separate rival witnesses instead of
averaging them. The Relayer assumption-attack log is a good example: it refuses the "v1.6.0 Latest"
HTML snippet, the `1.9.0` changelog heading inside the v1.8.0 release body, and the npm SDK version
`1.10.0`, and it names the tag plus `Cargo.toml` as the deciding witnesses. This review reached the
same conclusion from the releases API and agrees.

Prose quality is good. The matrices are dense, but almost every row earns its place. I found no
padding worth removing. Two placement problems only:

- The `/gen` incident sits inside the Authorization section under a table, with no heading. A
  reader scanning headings will miss it. It deserves its own short heading.
- The soroban matrix's "Cross-case summary for the orchestrator" repeats the three per-case verdict
  blocks. This is acceptable, because it is the hand-off table the author works from.

Evidence-reference quality is uneven in one respect only. Real URLs replaced the legacy "verbatim
legacy evidence descriptor" rows everywhere, which is a large improvement. The exceptions are the
two rows named in N5 and N6, plus the three `/tmp` rows inside the friendbot lane that never
reached a case file.

---

## 10. Summary

| # | Finding | Class |
| --- | --- | --- |
| B1 | Generated artifacts stale; `lifecycle-registry` lint error | BLOCKING |
| B2 | Date-trap disposition mismatch lint error | BLOCKING |
| B3 | Six reopened clusters and one date trap unreconciled | BLOCKING |
| N1 | `q-soroban-av-passkeys-talk` notes emit retired id and contradict the answer | NON-BLOCKING |
| N2 | GT snapshot dates refreshed in four cases, stale in three | NON-BLOCKING |
| N3 | Reflector `x_*` verdict should be `contradicted` | NON-BLOCKING |
| N4 | Beam-deployment `unverifiable` row dropped from the case | NON-BLOCKING |
| N5 | Dead provenance on the Lab corroboration row | NON-BLOCKING |
| N6 | Validation Cloud docs source dropped from the case | NON-BLOCKING |
| N7 | No grader cover for a dated Friendbot `400` | NON-BLOCKING |
| N8 | Catalog `created_at` description is wrong; needs a TODO | NON-BLOCKING |
| N9 | `/gen` call was an authorization deviation; skill has no probe rule | NON-BLOCKING |
| N10 | sd-039 can carry two more verified facts | NON-BLOCKING |
| N11 | Staggering rule applied inconsistently | NON-BLOCKING |
| N12 | `verified.date` and `asOf` differ on two cases | NON-BLOCKING |

The truth work passes. Every dated claim in the seven cases is correct for 2026-09-02 UTC, and
every removal deleted an unsupported claim. The remaining work is mechanical and bookkeeping.

**CHANGES REQUIRED.** Clear B1, B2, and B3. Then re-run `npm run eval:qa:compile`, `npm run
eval:qa:register -- --check`, `npm run eval:qa:lint -- --since main --stale`, the release baseline,
and `npm run secrets:scan -- --tree`. The lint must reach 0 errors and 62 warnings.
