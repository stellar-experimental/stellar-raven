# Closeout — golden coverage audit, 2026-11-14

Lane `instrument`, fourth task (`briefs/closeout.md`). Worktree `/home/tyler/code/raven-wt/gca`,
branch `audit/golden-coverage` at `33070a05`. Nothing was committed. Golden edits follow the
`golden-truth` skill. Every changed case has a new `truth.verified` event with root cause
`.agents/TODO.md — Finish the 2026-11-14 golden coverage audit`. Its evidence is the source I
checked; `qa/RESULT.md` is cited as the trigger only.

## 1. Cases the QA test showed to be flawed

I judged each case on its own terms: does a key fact bundle predicates, ask for something the
question does not, or claim what the sources do not support? I did not treat a verdict as a
defect.

| Case | Defect found | Change |
|---|---|---|
| `q-comp-yieldblox-oracle-incident` | Key fact 4 bundled a causal claim ("staleness was not causal") with a list of three defenses. | Split into two facts: "The manipulated price was fresh, so oracle staleness was not the cause." and "Defenses for thin collateral include market-depth minimums, value bounds and supply caps." **Declined:** "accept any two defenses". It only eases grading, and the question asks for the lessons. |
| `q-defi-agent-identity-stellar-experimental` | Key fact 2 (ERC-8004 leaves payments to x402) is not asked: the question is what exists on Stellar and how mature it is. | Key fact 2 deleted; the answer keeps it as context. **Kept** key fact 1 (ERC-8004 is an Ethereum Draft). It is one side of the case's three-way distinction. Checked live: eips.ethereum.org shows status "Draft". |
| `q-defi-blend-alternatives` | Key facts 2–3 required disclaimers about YieldBlox, DeFindex, OrbitCDP, EquitX and Templar, which the question does not ask for. | Both became avoid items ("Do NOT call … independent lenders" / "… Stellar money-market lenders"). An answer that names these systems must still classify them right. Notes: naming them is not required. **Declined:** collapsing to one "accept any example" fact. The avoid items keep the misclassification guard. |
| `q-defi-blend-audit-record` | Key fact 3 required two of the three hosting locations; the question ("where can I read them") is answered by any one. | "Names a place to read the reports: Blend's docs, its repositories or the Security Portal." Checked live: `docs.blend.capital/audits-and-bug-bounties.md`. |
| `q-hist-meridian-2026-corrected-venue` | Key fact 2 bundled the superseded plan with its dates and an announcement date that is not asked. | "The earlier Abu Dhabi plan for Meridian 2026 was superseded by the move to Lisbon." The answer keeps the dates, and the avoid item still rejects Abu Dhabi and October 21–22. |
| `q-pay-anchor-msb-licensing` | The question names no jurisdiction, and `golden.notes` says no jurisdictional rules are asserted, yet key fact 2 required the US regimes. | "Registration and licensing are distinct duties that differ by jurisdiction." The answer keeps the US example. Evidence: fincen.gov MSB registration page (federal registration; re-registration under State law). |
| `q-sor-classic-dex-from-contract` | Key fact 4 (programmable escrow) is neither asked nor in the golden answer. | Deleted. |
| `q-stellar-vs-xrp-ledger` | Three of four key facts were XRP Ledger-side, which no Raven source covers. | Restated, with the leaf kept. Key facts are now Stellar-side: each SCP validator chooses its own quorum set; Stellar replaced its Ripple-derived consensus with SCP in 2015; Stellar fees go to a locked account that no one can spend; classic assets have an issuer and holders opt in with a trustline. XRP Ledger properties (UNL, destroyed fees, trust-line tokens) stay in the answer. Notes call them attributed context, not required, and say a false XRP Ledger claim is still wrong. Verified live against primary sources: the Docs SCP page ("A node's trusted set of nodes is called a quorum set"), the fees page ("go into a locked account and are not given to or used by anyone"), the assets page ("an account must establish a trustline with the issuing account"), the lumens page, and SDF's 2015-11-03 post "The upgraded Stellar network is here! … It uses the Stellar Consensus Protocol". Two corroboration rows added. Consistent with `q-hist-scp-rewrite-2015`: the fork's causation is not asserted. |
| `q-ti-parse-raw-ledger-data` | Key fact 2 (getTransactions field types) is not asked; the question names LedgerCloseMeta, getLedgers, v4 meta and `.xdr.zst`. | Removed from the answer and key facts. A stale "key fact 5" reference in `truth.notes` was fixed. |
| `q-ti-testnet-usdc-faucet` | The SAC-address clause is not asked. | Removed from the answer and key facts. **Kept** the reserve and trustline fact; the proposal did not touch it. |
| `q-raph-stolen-wallet-recovery` (judge artifact) | None independent of the verdict. Key fact 2 says why XLM itself cannot be clawed back, which answers the question directly; the issued-asset clause is the qualifier that keeps it true. | **No change.** |
| `q-scf-service-provider-directories` (judge artifact) | None independent of the verdict. Key fact 1 is the leaf's canonical answer; verify-gap accepted it from the live page. Rewording to "names a maintained directory" would only ease grading. | **No change.** The note "accept another maintained partner directory" can be read as an addition or as a substitute; I left it, because settling it would set grading strictness from a verdict. `sls-117` covers the reach gap. |

## 2. Delta review

- **D1:** `q-soroban-simulate-resource-fee` gained the avoid item "Do NOT claim simulation runs
  through a Horizon endpoint; it is a Stellar RPC method." Evidence: the live Docs RPC reference
  page for `simulateTransaction`.
- **D2:** The 16 named tombstone reasons are now one self-contained sentence each: no verifier
  commentary, no instruction, no stale survivor. Every ID, file, and test they name exists and is
  in the state the sentence says (checked against the battery, `corpus/retired/`, the live lanes,
  `eval/skills-cases.json`, and `test/`). Only the `reason` line changed in each file. The
  `q-infra-secp256r1-passkeys` and `q-infra-simulate-transaction-howto` reasons now state what the
  survivor carries.
- **D4:** The verification event of `q-token-xlm-supply-total-circulating` now cites the delta
  review's "Re-derived correction" as the independent check, and says verify-gap reviewed the case
  before the correction. Its `golden.notes` gained the lint-canonical caution: "Quoting the
  canonical Stellar Docs Lumens page sentence that all XLM that will ever exist was created at
  launch is not a wrong claim while sd-105 stands; grade caps at partial." `sd-105` is `verified`,
  so the cap lint accepts it. The finding is in `rootCause`, so the symmetric-caution lint is
  satisfied too.

## 3. Gap ledger

- **Case cautions:** the one entry in `gaps/GAPS.md` (`q-token-xlm-supply-total-circulating`,
  `sd-105`) is applied, as D4 above.
- **Recurrences** (frontmatter `recurrences`, dated 2026-11-14, in the improvements-pipeline form):
  - `sls-118`: `q-pc-slp-0004-0006-status` and `q-pc-quorum-freeze-cap77` missed the Limits
    Proposals.
  - `sd-106`: `q-net-tier1-roster-current` could not retrieve the Tier 1 roster.

  `npm run improvements:index` and `npm run improvements:lint` both exit 0 (83 findings). Status
  is unchanged and nothing was posted.
- **`.agents/TODO.md`, "Golden answers":** two entries, each with what is wrong, current state,
  next step, and done-when:
  - "Decide whether stellar.org pages outside Docs belong in a Raven source" (three leaves;
    `sls-117` covers the Scout part).
  - "Check Docs search for the SEP-7 payment-request page before filing" (a retrieval-level check
    at the Mintlify backend and through Raven).

  Neither entry names a case ID.

## 4. Held-out split

Drawn by the `eval/qa/README.md` rule (salt `qa-split-2026-11-14:`, strata = taxonomy domain ×
`tags.freshness`, dealt tuning / held-out / held-out / reserve) from the final `cases.json`.

| Item | Value |
|---|---|
| File | `eval/qa/results/splits/2026-11-14.json` (git-ignored), copied to `~/backups/gca-2026-11-14-split.json` |
| SHA-256 | `f683852ee2922dce1b73504582fca7109a21b5cdff89d72a219c51d6f9890efa` |
| Sets | tuning 79, held-out 119, reserve 48 (246 cases, 41 strata) |

The shares are 32 / 48 / 20, not 25 / 50 / 25, because 41 strata are small and each deal starts
at tuning; the rule produces that. I first drew the split before a final wording fix and re-drew it
after: the sets were identical, and only the recorded source hash changed. No tracked file holds
split membership. This report names edited cases (already named in `qa/RESULT.md`) and never says
which set a case is in.

## 5. Register

`npm run eval:qa:register` reopened 7 entries on my edits: `cluster-017`, `-023`, `-029`,
`-053`, the YieldBlox borrow-totals invariant, the YieldBlox remediation trap, and the Meridian
post-event trap. I re-read the members of each, and every one stays consistent: the edits changed
no shared fact. They are closed by [`closeout-review.json`](closeout-review.json). A later
one-predicate rewording of the YieldBlox staleness fact reopened the two YieldBlox entries again;
[`closeout-review-2.json`](closeout-review-2.json) closed them. 0 entries are reopened.

## Final counts

| | Count |
|---|---|
| Headline cases | 246 |
| Tool lane | 6 |
| Retired | 291 |
| Registry | 543 reserved IDs |
| Leaves covered | 164 of 167; `openSlots` 2 (both waived) |
| Judge-facing words | 39,412 (160 per case) |
| Lint warnings | 98 (from 100); 0 errors |
| Cases edited | 12 (10 from the QA list, plus D1 and D4); 16 tombstones |

## 6. Gates

All commands were run bare in this worktree after the last edit. `origin/main` is an ancestor of
`HEAD`.

| Command | Exit | Result |
|---|---|---|
| `npm run eval:qa:compile` | 0 | 246 headline, 30 sample, 6 tool, 543 reserved IDs |
| `npm run eval:qa:register -- --check` | 0 | up to date |
| `npm run typecheck` | 0 | |
| `npm test` | 0 | 150 files pass, 1 skipped; 3,398 tests pass, 3 expected fail, 1 skipped |
| `npm run build` | 0 | |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 | 0 errors, 98 warnings; `headline=246; tool=6; leaves=167; covered=164; openSlots=2` |
| `npm run eval:qa:lint -- --since origin/main --stale` | 0 | 0 errors, 98 warnings |
| `npm run eval:selftest` | 0 | |
| `npm run eval:compile` | 0 | |
| `npm run eval:routing -- --gate` | 0 | |
| `npm run eval:qa:sentinels -- --check` | 0 | 21 sentinels, 0 errors, 0 stale |
| `npm run improvements:index` | 0 | 83 findings |
| `npm run improvements:lint` | 0 | 83 findings |
| `npm run secrets:scan -- --tree` | 0 | clean |

Not run:
- `npm run improvements:lint -- --live`: no intake repository or GitHub ref changed.
- `npm run test:smoke`: no change under `src/executor` or `src/demo`.

## Open

- Delta-review D3 (seven answers dated later than `asOf`) was not in this brief. The reviewer
  calls all seven defensible.
- Under the TODO's done-when, verify-gap's nine unreachable or not-surfaced cases each need a
  finding or a recorded decision:
  - Six have findings: `sls-117` (two cases), `sls-118`, `sd-106`, `sd-107`, `sd-108`.
  - One, the SEP-7 case, has the new TODO entry.
  - Two, `q-stellar-vs-xrp-ledger` and `q-crp-public-sector-cbdc-pilots-stellar`, are recorded in
    `gaps/GAPS.md` only as owner source-coverage questions. A recorded owner decision is still
    missing for these two.
