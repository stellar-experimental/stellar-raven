# Independent review of `audit/scope-decisions`

Lane `scope-review`, Claude Sonnet 5.5, 2026-11-14. Reviewer of branch `audit/scope-decisions`
(HEAD `26f44301`, author Claude Opus 5.5). Tier: matched tier (Claude Fable) not used because the
orchestrator assigned this lane; the reviewer differs from the author and from the scope lane.
No case, code or register was edited. No model-calling eval ran. Nothing was posted.

## Verdict

**Fit to merge once findings F1 and F2 are applied and F3 is applied or the custody proposal
activates in the same change.** No finding is a blocker for the retirement, the four rewrites,
`sls-119`, the taxonomy slots, the `judge.mjs` pin or the code gates. Both proposals are right on
their Stellar-side core; two key facts need to change (F1, F2). All gates passed at `26f44301`.

| Item | Decision |
|---|---|
| `q-comp-xlm-us-classification` | **amend** (F1, F5), then activate |
| `q-comp-issuer-institutional-custody` | **amend** (F6), then activate |
| Retirement of `q-pay-anchor-msb-licensing` | accept; replacements verified true |
| Four edited tombstones | accept two, amend one (F3), one nit (F7) |
| Four rewritten cases | accept; F2 (agentic payments), F4 (EURC) amend |
| Clusters 015, 029, 034, 039, 060 | all five confirmed (no reopen), F7 wording |
| `sls-119` | meets the `verified` bar; reproduction re-ran |
| Taxonomy open slots, `judge.mjs` pin | accept |

## Blind derivations (written before opening any author file)

Read 2026-11-14. Classes per `briefs/common.md`.

### Q1. "Is XLM a security in the United States?"

1. The SEC/CFTC joint interpretation (Release 33-11412, effective 2026-03-23) classes Stellar (XLM) as a **digital commodity**, one of sixteen named examples.
   - A: https://www.sec.gov/files/rules/interp/2026/33-11412.pdf and https://www.govinfo.gov/content/pkg/FR-2026-03-23/html/2026-05635.htm — "Examples of digital commodities include Aptos (APT); ... Solana (SOL); Stellar (XLM); Tezos (XTZ); and XRP (XRP)."
   - D: https://www.lowenstein.com/.../sec-issues-interpretive-framework-for-crypto-asset-classification-fctm (2026-03-20) — lists "Stellar (XLM)" among "examples of digital commodities".
2. A digital commodity is not a security (derives value from the programmatic operation of a functional crypto system and supply and demand, not from others' managerial efforts).
   - A: same release, section III.A. D: Baker Botts 2026-03-26 "A digital commodity is therefore not a security."
3. The asset's classification is separate from how it is sold: a non-security crypto asset can be sold subject to an investment contract, and that does not turn the asset into a security.
   - A: release fn 47 — "The fact that a non-security crypto asset is subject to an investment contract does not transform the non-security crypto asset itself into a security." D: WilmerHale 2026-03-24 "A non-security crypto asset can be sold subject to an investment contract".
4. The interpretation is Commission interpretive guidance, not a binding rule, and was a statement "as of the date of this release" (fn 51: each named asset underlies a CFTC-regulated futures contract on a DCM, which explains its selection).
   - A: release fn 51 and SUMMARY ("interpretation; guidance"). D: Baker Botts "an interpretation — not a binding regulation".

Not used: any pre-2026 "no SEC action against XLM" claim (negative claim, not swept).

### Q2. Issuer key protection and Stellar custodians

Key protection:
1. Issue from a separate issuing account to a distribution account; the distribution account is the hot one. A compromised issuing key lets the attacker mint unlimited supply; a compromised distribution account can be frozen and replaced without touching the issuer.
   - A: https://developers.stellar.org/docs/tokens/control-asset-access ("if the account you're distributing from is also the issuing account and it is compromised ... the actor can now issue as much of the asset as they want"). A (second page; same class, so one witness unless paired): https://skills.stellar.org/skills/assets/SKILL.md "Create issuing account (should be separate from distribution)". Independent class: B/D — none read; **single class (A)**.
2. Multisig with thresholds lets the issuer keep the master key offline: a lower-weight key authorizes trustlines (low threshold) but cannot sign Payments (medium), so compromising it cannot mint.
   - A: https://developers.stellar.org/docs/learn/fundamentals/transactions/signatures-multisig "keep its issuing key offline ... this key does not allow anyone who compromises your anchor to issue credit."
   - Second class: not read (single class A).
3. Do not set the issuer master weight to 0 unless no other signer can meet the thresholds, and only after all issuance is done; locking is irreversible and removes the ability to issue, clawback, or manage flags.
   - A: control-asset-access (2026-11-14) "Be very careful ... Only then is the issuer unable to issue any more assets." and security encyclopedia "Doing so may permanently lock".
   Note: locking is wrong for a regulated issuer that needs auth/clawback flags (my inference, from the same page; not a quoted fact).

Custodians (each with a vendor class and a Stellar-side class):
4. Taurus (Taurus-PROTECT custody) supports Stellar: 2024-06-24 launch, and 2026-10-29 Soroban smart-contract assets.
   - A: https://stellar.org/press/taurus-custody-and-issuance-platforms-now-available-on-stellar (2024-06-24). Vendor: https://www.taurushq.com/blog/taurus-expands-stellar-integration-with-soroban-smart-contract-support-across-custody-and-tokenization (2026-10-29) "live support for smart contract-based assets on the Stellar network through Taurus-PROTECT".
5. BitGo custodies Stellar assets: lumens plus tokens since 2019, Stellar USDC later.
   - A (SDF): https://stellar.org/blog/ecosystem/leading-crypto-custodian-bitgo-now-supports-stellar-usdc "BitGo began supporting digital assets on Stellar starting with lumens and a number of additional tokens". Vendor class not read.
6. Fireblocks lists Stellar as a supported blockchain (vendor) and SDF's institutional page names Fireblocks for institutional custody on Stellar.
   - Vendor: https://www.fireblocks.com/supported-assets lists "Stellar" and "Stellar Testnet". A: https://stellar.org/institutions-solutions "Fireblocks secures over $5 trillion ... powering institutional adoption on Stellar with enterprise-grade custody".
7. Copper lists Stellar (XLM) under custody-supported assets — the native asset only; Stellar issued assets not confirmed.
   - Vendor: https://copper.co/en-us/ecosystem/platform-connectivity/custody-supported-assets.

Honesty: for the key-protection facts I hold one class (A, three Stellar docs pages). Only the Q1 facts, and custodian facts 4 and 6, have two classes. A rubric asking an agent for a closed custodian list is unfair: no primary source enumerates "which custodians support Stellar assets"; a correct agent may name different good ones.

## Decisions on the two proposals

The derivations above were written before I opened either case file.

### `q-comp-xlm-us-classification`: amend

What matched my derivation: Stellar (XLM) is named a digital commodity in the March 17, 2026 joint
release (my facts 1 and 2); the classification is interpretive guidance, not binding rule text, and
revisable (fact 4); the sale-under-an-investment-contract nuance is correctly kept in `notes`
(fact 3). `scheduled` and `reverifyBy 2027-02-11` fit. I also read the 2026-11-02 SEC staff FAQ
(`faqs-crypto-assets`, "Last Reviewed or Updated: Nov. 2, 2026"): it restates "digital commodities
are not themselves securities" and withdraws nothing. I read the SDF letter
(`s7202627-1103179-3882886.pdf`): dated "October 20, 2026", signed by SDF's Chief Legal and Policy
Officer, "The final rules should also codify the 2026 Interpretation's digital commodity
classification". The SDF date and quote are true.

Problems:

1. **KF3 and the last-but-one answer sentence require a fact that the question does not ask for**
   (F1). A correct agent that answers from the SEC release alone cannot satisfy KF3, and an
   SDF comment letter is not part of "is XLM a security".
2. **The avoid item overstates its source** (F5). The 2022 Grayscale information statement (SEC
   EDGAR, `d348502dex991.htm`) says the outcome of the SEC's XRP action "may affect the Sponsor's
   analysis regarding the status of XLM as a 'security'". That is a risk disclosure, not a
   statement that XLM may be a security.

Amended judge-facing fields (replace exactly):

```json
{
  "answer": "Not under current SEC guidance. A joint SEC–CFTC release of March 17, 2026 names Stellar (XLM) a digital commodity, which the SEC treats as not itself a security. That is an SEC interpretation, not rule text, and the SEC says it may revise it. Not legal advice.",
  "keyFacts": [
    "A joint SEC–CFTC release of March 2026 classes XLM as a digital commodity, not a security.",
    "The classification is SEC interpretive guidance, not codified rule text."
  ],
  "avoid": [
    "Do NOT present a pre-2026 risk disclosure, such as Grayscale's 2022 information statement, as XLM's current US status."
  ],
  "notes": null
}
```

(`notes` stays as written.) Keep the SDF letter and the 2026-10-20 date in `truth.sources`,
`truth.corroboration` and `truth.notes`; update `truth.verified` to record the removal and the
Grayscale source class (A, SEC EDGAR).

Evidence for the amended facts:

```json
[
  {"class":"A","ref":"https://www.sec.gov/files/rules/interp/2026/33-11412.pdf","observedAt":"2026-11-14","quote":"Examples of digital commodities include ... Solana (SOL); Stellar (XLM); Tezos (XTZ); and XRP (XRP)."},
  {"class":"A","ref":"https://www.govinfo.gov/content/pkg/FR-2026-03-23/html/2026-05635.htm","observedAt":"2026-11-14","quote":"Stellar (XLM); Tezos (XTZ); and XRP (XRP)."},
  {"class":"D","ref":"https://www.lowenstein.com/news-insights/publications/client-alerts/sec-issues-interpretive-framework-for-crypto-asset-classification-fctm","observedAt":"2026-11-14","quote":"Stellar (XLM), Tezos (XTZ), and XRP."},
  {"class":"D","ref":"https://www.bakerbotts.com/thought-leadership/publications/2026/march/sec-and-cftc-issue-interpretive-guidance-establishing-crypto-asset-classification-framework","observedAt":"2026-11-14","quote":"an interpretation — not a binding regulation"},
  {"class":"A","ref":"https://www.sec.gov/Archives/edgar/data/1761325/000119312522222422/d348502dex991.htm","observedAt":"2026-11-14","quote":"may affect the Sponsor’s analysis regarding the status of XLM as a “security”"}
]
```

### `q-comp-issuer-institutional-custody`: amend

Matches my derivation: key-protection facts 2 and 3 (offline or multisig; do not lock the issuer
lightly); custodian facts 4 and 5 (Taurus, BitGo). I verified every source the author cites:
`how-to-issue-an-asset` ("Many users secure their issuing account with cold storage techniques, such
as a hardware wallet or multisignature setup."), `asset-issuance-stack` (Layer 3 "Examples:
Anchorage · BitGo · Taurus"; Layer 2 wallet software "is not, by itself, a regulatory custody
status"; "Do not assume support for Stellar generally means support for a specific contract token or
permissioned standard"; footnote "as at November 2026"), the Anchorage press page (datePublished
"Jun 15, 2026", Stellar), and `developers.bitgo.com/docs/stellar-tokens` (per-asset `xlm:` coin
types). Fireblocks also documents Stellar support (`fireblocks.com/supported-assets`; SDF
`institutions-solutions`), so "such as" is the right form for the roster.

Problem: **KF3 does not say how many custodians the agent must name** while `notes` says "any
two". A reader of the key fact alone cannot grade it (F6). Not blocking: the case is otherwise
compact, a correct agent with a different source (for example Fireblocks) can satisfy it, and the
avoid item is a documented false claim.

Amended judge-facing field (replace exactly; all else unchanged):

```json
{
  "keyFacts": [
    "Keep issuing-account keys in cold storage, such as a hardware wallet, or under multisig.",
    "An issuer may self-custody, use wallet infrastructure, or appoint a regulated custodian.",
    "Names at least two institutional custodians with documented Stellar support, such as Anchorage, BitGo or Taurus.",
    "Network support does not mean a custodian supports a specific asset or contract token."
  ]
}
```

Not required, noted: the most common Stellar guidance for issuers, "issue from a separate issuing
account and keep only the distribution account hot" (`control-asset-access`, "Security"), is not in
the case. A correct agent that adds it is not penalized and one that omits it is not wrong, so I did
not add a key fact.

```json
{
  "proposals": [
    {"id": "q-comp-xlm-us-classification", "decision": "amend", "ravenReach": "not assessed"},
    {"id": "q-comp-issuer-institutional-custody", "decision": "amend", "ravenReach": "not assessed"}
  ],
  "summary": {"accept": 0, "amend": 2, "reject": 0}
}
```

I did not repeat the Raven reach checks; the author recorded them as observations, and neither
proposal's key facts depend on Raven reaching them.

## Findings, ranked, with the exact fix

**F1 (medium). XLM case requires a fact the question does not ask for.**
`eval/qa/corpus/proposed/compliance-rwa-payments/q-comp-xlm-us-classification.json`,
`golden.keyFacts[2]` and the sentence "On October 20, 2026, SDF asked the SEC to write the
classification into Regulation Crypto Assets." in `golden.answer`. A correct agent answering from
the SEC release cannot satisfy it. Fix: the amended fields above. Then
`truth.verified` is rewritten to name the change.

**F2 (medium). A negative claim on a `live` case is undated and has no later-change clause.**
`eval/qa/corpus/battery/defi-ecosystem/q-defi-agentic-payment-standards-compare.json`,
`golden.keyFacts[2]` ("Stellar docs define payment methods for x402 and MPP only, not for AP2 or
ACP.") and the matching clause in `golden.answer`. The case is tagged `live`; golden-truth section 3
says a negative claim is "phrased as of a date and relative to the source", and the register error
list says a `live` key fact must accept a later figure. If Stellar docs add an AP2 method, a correct
agent is marked wrong. Fix, replace exactly:

```json
{
  "keyFact_3": "As of November 2026, Stellar docs define payment methods for x402 and MPP, not for AP2 or ACP.",
  "answer_clause": "Stellar docs define methods for them that settle SEP-41 token transfers through Soroban authorization, and, as of November 2026, none for AP2 or ACP.",
  "notes_append": "Accept a later Stellar docs method for AP2 or ACP when the answer names its source."
}
```

I did not re-run the author's corroboration for the negative claim (A, B, E, D rows); it is dated
2026-11-14 and the fix makes the key fact say so.

**F3 (medium-low). A tombstone's replacement is a proposal, and it tests different knowledge.**
`eval/qa/corpus/retired/q-crp-custodial-vs-noncustodial-wallets.json`, `replacementIds`
`["q-comp-issuer-institutional-custody"]`. The lifecycle contract wants an active replacement; the
lifecycle script below reports this as the only non-active replacement in the registry. The
retired case graded a consumer wallet's custody model, the issuer case grades an issuer's
custodian choice (the author says so in APPLY.md deviation 5). Fix, either:
(a) activate `q-comp-issuer-institutional-custody` in the same change so the pointer is active and
keep the reason's "for issuers" wording; or
(b) set `replacementIds` to `[]` and reword the reason to "...which later retired; the
consumer custodial-versus-non-custodial distinction left the battery, and
`q-tool-wallets-comparison` covers hardware and non-custodial wallets as products." Option (a) is
the cheaper and is what I recommend, since both proposals are being activated.

**F4 (low). Provenance and a tool name in judge-facing notes.**
`eval/qa/corpus/battery/retail-consumer/q-asset-usdc-eurc-issuer.json`, `golden.notes`:
"...the organization in Circle's stellar.toml, which Scout repeats as issuer of record." Fix, replace
that sentence with: "Circle Internet Financial, LLC is an affiliate reseller and the organization
named in Circle's stellar.toml; an answer that names it as EURC's issuer, attributed to that file,
does not fail on that point alone." The legal-entity truth and the leniency are unchanged.

**F5 (low). Avoid item overstates the Grayscale disclosure.** Covered by the F1 amendment
(`golden.avoid`).

**F6 (low). Custody KF3 omits its count.** Covered by the custody amendment.

**F7 (low). Bookkeeping to finish at merge.**
- Clusters 015, 029, 034, 039 and 060: I re-read each (below) and confirm all five. Replace the
  trailing "Pending confirmation by the scope-apply diff reviewer." in the five `reSwept.reason`
  strings in `eval/qa/consistency-register.json` with "Confirmed by independent diff review,
  decisions/REVIEW.md." and re-run `npm run eval:qa:register -- --check`.
- `eval/qa/corpus/retired/q-pay-anchor-msb-licensing.json` `retired.reviewer` names the owner's
  approval and the scope lane. Append "; diff reviewed in decisions/REVIEW.md" once the findings
  land.
- On activation of each proposal: remove its `openSlots` entry in `eval/qa/taxonomy.json` (the
  lint errors if you do not), move `truth.lifecycle.state` to `active` and the file to
  `corpus/battery/compliance-rwa-payments/`, set `truth.verified.by` to the reviewer (it still says
  "proposal only, blind re-derivation and independent review pending"), and re-run compile.

**Observation, no action.** `protocol.signatures-multisig` now has two primary cases
(`q-pc-multisig-setup-lifecycle`, `q-protocol-accounts-signers-thresholds`) against a taxonomy case
target of 1, and `security.key-custody` has one secondary. That follows the owner-approved SCOPE.md
B4 move; the lint passes. After the custody case activates, `security.key-custody` has a primary.

## Step 2 checks

**Retirement and tombstones.** Lifecycle proof (script, run at `26f44301` against
`origin/main:eval/qa/lifecycle-registry.json`):

```
main entries 543, head 545, missing/reactivated: none
added: q-comp-issuer-institutional-custody, q-comp-xlm-us-classification (both proposed)
state changes: q-pay-anchor-msb-licensing: active->retired
counts {proposed 2, active 251, quarantined 0, retired 292}
replacement not active: q-crp-custodial-vs-noncustodial-wallets -> q-comp-issuer-institutional-custody (proposed)
```

- `q-pay-anchor-msb-licensing` tombstone: the reason is score-independent (scope, no Raven source
  holds the law), it has author, reviewer, date, ledger, `lastCaseContentSha256`
  (`d31b48f4…`, equal to the case digest on `origin/main`) and two active replacements. I read both
  replacements: `q-comp-aml-analytics-vendors` KF2 "Meeting KYC and AML rules is the anchor's own
  obligation." and `q-crp-remittance-founder-advisory` KF4 "Integrate existing anchors first; SEPs
  guarantee no liquidity, licence or coverage." plus its avoid item on definitive licensing advice,
  both exist and say what the tombstone quotes (its quote of KF4 is shortened but true). The routing
  label file `eval/routing-cases.json` still lists the id; it already lists 111 retired ids, so that
  is the convention.
- `q-pay-travel-rule-aid-flows`, `q-comp-finclusive-caas`, `q-crp-become-an-anchor-licensing`:
  reasons now say licensing law left the battery; true. Their empty or unchanged survivors are
  consistent (`replacementIds: []` is already used by `q-comp-finclusive-caas`).
- `q-crp-custodial-vs-noncustodial-wallets`: F3.

**The four rewrites (and the multisig leaf swap).**
- `q-defi-agentic-payment-standards-compare`: lost the AP2 and ACP key facts (non-Stellar); the
  two Stellar-side facts stay; the new KF3 is Stellar-side. Needs F2.
- `q-defi-agent-identity-stellar-experimental`: only the ERC-8004 Draft key fact moved to notes
  (non-Stellar); the Stellar-side facts and both avoid items are intact. Provenance-free. OK.
- `q-asset-usdc-eurc-issuer`: lost only the EU legal-entity key fact; the answer still states it;
  the Circle-issues, issuer-address and launch-date facts stay. Needs F4. The circle.com terms read
  today confirm the SAS issuer and the LLC reseller.
- `q-edge-oos-solana-vs-aptos`: the framework key fact moved to a welcome-not-required note; the
  avoid clause shrank. No Stellar-side fact existed to lose. OK.
- `q-pc-multisig-setup-lifecycle`: only `truth.leaf` and `truth.secondaryLeaf` swapped; question,
  golden, tags byte-identical. OK.
- None of the five states a non-Stellar fact as required after the changes, and none carries
  provenance in judge-facing text except F4.

**Register clusters (re-read, all confirmed, none reopened).**
- `cluster-060`: member diff is two lines in `truth`; judge-facing bytes unchanged. Consistent.
- `cluster-015`: EURC-by-Circle and 2023-09-26 unchanged in the member. Consistent.
- `cluster-029`: the member only moved a non-Stellar fact to notes; the cluster's "supported core"
  note holds. Consistent.
- `cluster-034`: only `q-asset-usdc-eurc-issuer` mentions Circle Internet Financial (grep of the
  battery), and it keeps SAS as legal issuer; no other member claims an issuer entity. Consistent.
- `cluster-039`: the pair still shares "boundary plus redirect, no forced Stellar answer, no tool
  names". The framework is still in the answer. Consistent.

**`sls-119`.** Re-ran its reproduction 2026-11-14 : `GET
https://stellarlight.xyz/api/stablecoins?peg=EUR&limit=50` returned 6 rows (`meta.dataAsOf`
2026-11-14T06:45:10.678Z); the row for issuer `GDHU6WRG…NPP2` has `company` "Circle",
`issuerOfRecord` "Circle Internet Financial, LLC", `issuerOfRecordCheck` "named",
`issuerOfRecordSourceUrl` `https://circle.com/.well-known/stellar.toml`, `issuerOfRecordNote` null.
The toml has `ORG_NAME="Circle Internet Financial, LLC"` and an EURC entry with no issuing-entity
field. `circle.com/legal/eurc-terms` section 1 says "EURC is a digital token issued by Circle
Internet Financial Europe SAS" and the LLC "acts as a reseller of EURC". The finding states its
prevalence limit (USDC not assessed). It is not posted. `npm run improvements:lint` exits 0. It meets
the `verified` bar.

**Taxonomy and `judge.mjs`.** The two `openSlots` entries match the tree (each leaf has no active
primary case: `security.regulation-policy` none; `security.key-custody` only a secondary) and each
reason is honest and names its pending case; both must go at activation (F7). `judge.mjs`: one line,
the `q-edge-oos-solana-vs-aptos` prompt pin; `npm test` and `npm run eval:selftest` pass with it,
which means it equals the prompt the amended golden renders. The golden edit was owner-approved. No
other code changed.

## Gates

Run bare at `26f44301`, working tree clean afterward (compile reproduced the committed
`cases.json`, `sample.json`, `tool-cases.json`, `lifecycle-registry.json`).

| Command | Exit |
|---|---|
| `npm run eval:qa:compile` | 0 (245 cases, 6 tool cases, 545 reserved ids) |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 (0 errors, 95 warnings) |
| `npm run eval:qa:lint -- --since origin/main --stale` | 0 (0 errors, 95 warnings) |
| `npm run eval:qa:register -- --check` | 0 |
| `npm run eval:selftest` | 0 |
| `npm run typecheck` | 0 |
| `npm test` | 0 (3398 passed, 3 expected fail, 1 skipped) |
| `npm run build` | 0 |
| `npm run improvements:lint` | 0 (84 findings) |
| `npm run secrets:scan -- --tree` | 0 |
| `npm run eval:qa:sentinels -- --check` | 0 (21 sentinels, 0 stale) |

The lint raises no warning on either proposal or on the four rewrites beyond two pre-existing
styles (`q-asset-usdc-eurc-issuer` avoid wording, `q-n3-pi-network-wrong-chain` key fact).

## What I did not verify

- Raven's reach on either proposal (not required for the decision).
- Anchorage's current product page for Stellar assets beyond the CETES press release.
- The Nov 2 SEC staff FAQ beyond the sections that restate "not themselves securities".
- No pre-2026 "no SEC action against XLM" claim was swept; neither case makes it.
