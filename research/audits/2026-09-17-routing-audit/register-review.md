# Consistency-register review after the 2026-09-17 golden corrections

- **Date:** 2026-09-17.
- **Mode:** read-only. No corpus or register edits, paid calls, Git, servers, or Playground work.
- **Review file:** `/tmp/raven-routing-audit-2026-09-17/register-review.json`, SHA-256
  `553ee4a2ad9e7985ac0c0d35d959b6cf006b20ccf3cd27751efbd14d88b17e6d`, in `register-helper --review`
  schema.
- **Working scripts:** `/tmp/raven-routing-audit-2026-09-17/register-review-work/`.

## Result

| Cluster | Verdict in review file |
|---|---|
| cluster-006, cluster-012, cluster-014, cluster-021, cluster-031, cluster-038, cluster-045, cluster-046, cluster-076, cluster-084 | **consistent** |
| **cluster-022** | **not included — unresolved** |

**The ten-cluster review JSON remains valid** after the final Soroswap prose delta and the Fable
LOBSTR provenance narrowing:

- **Only three case files differ** from pinned main: `q-eco-lobstr-wallet`,
  `q-defi-aquarius-what-is`, and `q-defi-soroswap-what-is`.
- **Question, keyFacts, avoid, and tags** in all three are identical to the reviewed proposals.
- **Answer and notes differences** from the proposals are exactly the edits already reviewed:
  - LOBSTR: the network date 2026-07-10 → 2026-09-17, removal of "SCF $232,000, " from notes, and
    `lumenloop_get_project` → `lumenloop.get_project`
  - Aquarius: the added dICE/gdICE delegate sentence
  - Soroswap: the SOURCE STATUS paragraph, now ending "The verified adapter configuration remains
    the grading authority for this case." (no ADR-0008 text)
- **The LOBSTR narrowing is judge-blind.** It touches only `truth.corroboration[2]` (claim narrowed
  to operator and non-custody, with a class A row for `lobstr.co` and `ultrastellar.com` observed
  2026-09-17) and `truth.verified`.
- **Re-validation:** the review was applied with `node eval/qa/register-helper.mjs --register <copy>
  --corpus repo/eval/qa/corpus/battery --review register-review.json --date 2026-09-17` to a copy of
  the re-stamped register (SHA-256 `1e0bf0e0…2c32`). It exited 0 with "0 reopened", and only
  cluster-022 remained `reopen`. The repository register was not written.

Current member hashes in the candidate repository:

| Case | SHA-256 |
|---|---|
| `q-eco-lobstr-wallet` | `62d353c2ebdd45ac1bae2a24e7ac48b0fb4def6a25f035f41b83bfe802ffffce` |
| `q-defi-aquarius-what-is` | `d78fb98ad5d3d3fe98b3048bd96a53c2174d3aa889a2e1e2d26e1ad05ea3fa3f` |
| `q-defi-soroswap-what-is` | `85a819dfd79c3c03706a91fb88b5c41eeaa69863c33ce4027ef4b26acbde5b58` |

## Unresolved: cluster-022 (blocker)

- **Label:** "wallets and Ultra Stellar product family".
- **Members:** `q-defi-soroswap-vs-stellarx`, `q-eco-dex-saturation`, `q-eco-lobstr-wallet`,
  `q-eco-stellar-wallets-list`, `q-tool-passkeykit-smart-wallet`,
  `q-tool-smart-wallet-repos-discovery`.

**Cause:** the member goldens do not contradict each other. The cluster's own register `note` still
says:

> "LOBSTR currently supports Stellar+XRPL; scale remains attributed and its SCF totals disputed."

That clause is now false against the corrected member:

- `q-eco-lobstr-wallet` has `truth.status: mixed`. Its SCF-total corroboration row is
  `unverifiable`, not `disputed`.
- Its answer and notes state that the official SCF project record reports an awarded total and a
  paid total separately, that SCF amounts are optional, and that any cited total must name source,
  date, and basis.
- The 2026-05-21 archived official payload
  (`https://web.archive.org/web/20260521081837id_/https://communityfund.stellar.org/project/lobstr-gcn`)
  shows the two totals existed as separate official fields before the original "disputed" verdict.

**Why it is not marked consistent:**

- `register-helper` review items may set only `verdict`, `lastChecked`, `reSwept`,
  `triggerDateEvent`, and `disposition`. They cannot edit `note`.
- Clearing the reopen would leave a false claim in the register's cluster summary.

**Resolution required (register owner, not this lane):**

1. Edit the cluster-022 `note` clause to something like: "LOBSTR currently supports Stellar+XRPL;
   scale remains attributed; SCF amounts are optional and any cited total must name its source, date,
   and awarded-versus-paid basis."
2. Re-run `npm run eval:qa:register` so the stamps reflect the final files.
3. Then review cluster-022. Its member content is already consistent:
   - Ultra Stellar operates LOBSTR, StellarX, and StellarTerm in `q-eco-lobstr-wallet`,
     `q-defi-soroswap-vs-stellarx`, and `q-eco-dex-saturation`.
   - LOBSTR Stellar+XRPL support is dated to 2026-09-17.
   - `q-eco-stellar-wallets-list` keeps a dated illustrative roster.
   - The two smart-wallet cases are untouched.

## Verified-consistent clusters: basis

Each reason in the JSON restates the three changes and records what was re-read:

| Cluster | Basis |
|---|---|
| **006** (LOBSTR + wallets list) | Both members keep dated, source-attributed wallet facts. The wallets list pins no LOBSTR scale, network, or SCF figure. |
| **012** (per-project SCF totals) | Aquarius asserts no SCF amount before or after. The Soroswap grounding "SCF $346,750" is unchanged and matches `q-scf-history-soroswap` ($57,600 + $139,150 + $100,000 + $50,000). LOBSTR is not a member. `q-defi-rwa-scf-similar`'s Awarded/budget/totalPaid distinction agrees with the new LOBSTR basis rule. |
| **014** (Soroswap firstness) | The SOURCE NOTE accepts attributed first-DEX quotes and keeps unattributed history as the avoid item. This matches the factcheck case (SDEX older; CAP-0038/Protocol 18 pools are the AMM counterexample) and the CAP-0038 case. vs-StellarX still separates API, on-chain, and UI layers. |
| **021** (moving TVL figures) | Aquarius removed its frozen "~$48M"/"~20%" text and still treats TVL and rank as live, dated metrics. The other members keep provider/as-of discipline. |
| **031** (grader caution, dated answers) | The LOBSTR caution is retained, scoped to LumenLoop `scf.awarded_total` and `operating_region` while ll-013 and ll-008 stand, capped at partial. The anchor and SEP members are unchanged. |
| **038** (news chronology) | No date-field or chronology claim changed. The Soroswap dated adapter example is unchanged. |
| **045** (TVL precision) | Aquarius carries no TVL scalar or range. The other members are unchanged. |
| **046** (Quasar vs Soroswap) | Soroswap remains the PaltaLabs Soroban AMM and aggregation stack, distinct from QuasarSwap and Lightsail/Quasar. |
| **076** (award histories) | Aquarius asserts no award history before or after. The Blend and Soroswap histories are unchanged. |
| **084** (liquidity award basis) | Aquarius asserts no liquidity-award amount or status. Blend, the Build-cap case, and Soroswap are unchanged. |

## Independent check of the applied source changes

Checked against sources, not pilot scores:

- **LOBSTR date and archive.**
  - The 2026-09-17 network and platform date matches the same-day `lobstr.co` "Stellar & XRPL",
    Google Play (Stellar and XRPL; developer Ultra Stellar OU), and the Scout networks
    `["stellar","xrpl"]`.
  - The archived 2026-05-21 payload has `totalAwarded` 232000, `totalPaid` 267462.64, budgets
    144000 and 88000, and Awarded status. This supports "prior verification-scope error".
  - Class A for current operator pages is appropriate for operator and custody claims.
- **Aquarius delegate sentence.** `docs.aqua.network/aqua-and-ice/overview/tokens-for-delegated-voting-dice-and-gdice.md`
  defines dICE as delegated upvoteICE and gdICE as delegated governICE for DAO proposals. The
  delegate reward page computes voting power from dICE plus gdICE. The sentence is accurate and
  keeps "casting governance votes earns emissions" outside the claim.
- **Soroswap SOURCE STATUS.** `soroswap/docs` `concepts/aggregator.mdx:13-14` labels Phoenix and
  Aqua "(currently on Testnet)", and `aggregator/supported-amms.mdx:12` labels "Aquarius AMM (Coming
  Soon)". Both conflict with the unpaused mainnet adapters recorded in cs-002. The closing sentence
  adds no grading exception.

## Non-blocking observations

1. **LOBSTR source classes:** `truth.sources` still labels `lobstr.co` and `ultrastellar.com` as
   class D ("inferred at migration"). The narrowed corroboration row now treats them as class A.
   This is judge-blind, but a follow-up could align the source labels.
2. **Aquarius delegate pool:** delegate payouts partly track governance-delegated ICE (gdICE). The
   note handles this, but a judge could misread an answer that says governance delegates earn AQUA.
3. **Soroswap sibling note:** `q-defi-soroswap-vs-stellarx` notes still quote Scout's combined
   "routing across AMMs + SDEX with a Route API". Its answer and key facts separate the layers, so
   this is not a contradiction. It is a candidate for a separate wording pass.

## Coordinator reconciliation

The coordinator corrected cluster-022's authored note to the accepted source/date/basis rule.
The member review found no contradiction. The helper applies the accepted eleven-cluster review after final stamping.
The two operator source labels now use class A, consistent with their corroboration row.
