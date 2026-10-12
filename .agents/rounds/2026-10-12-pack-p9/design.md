# Pack p9: sibling records for entity-list claims

Date: 2026-10-12. Author: Claude Opus 5.5 (lane J). Status: offline only. No model call was made.
Branch `w1012/j`, rebased on `origin/main` `63396840`. The p9 code is commit `4b4fb9e2`.
The plan for a paid measurement is [measurement-plan-p9.md](measurement-plan-p9.md). It authorizes nothing.

## Why

Review R8-1 ([rr8-review.md](../2026-10-10-weekend/pack-p8/post-run-review-p8b/rr8-review.md))
found a gap in p8. The disputed answer sentence lists nine DEX venues and ends "and Comet marked Inactive".
p8 showed only the StellarTerm record (`status="Live"`). It dropped the records of the other listed venues.
p6 had shown Comet (`Inactive`) and Zenex (`Live`) together in one snippet.
Without the sibling records, a judge cannot check either reading of the sentence.
The narrow reading ("only Comet is inactive") matches the source. The broad reading does not.

## The p9 rule

p9 adds one unit type, the entity-list unit (`role=entity-list`). The code is in
[evidence-pack.mjs](../../../eval/qa/evidence-pack.mjs). The rule has no case ID and no entity name.

1. A record is an object in a JSON array of two or more items. It has an identity field:
   `title`, `name`, `fullName`, `label`, or `slug`. A plain lowercase word, such as `medium`, is not a name.
2. Records of one array are siblings. A clipped JSON body has no parent array.
   Its complete identified objects form one group.
3. An entity-list claim is one answer claim (sentence) that names two or more sibling records.
4. A claim field is a field that the claim names (`TVL` for `tvlUSD`).
   It is also a field whose text value of a listed record the claim states (`Inactive` for `status`).
   A claim without a claim field is not an entity-list claim.
5. The unit shows each named record as `{name: Comet | status: Inactive}`. Null fields are not shown.
   Records keep their source order. The header names the entry and the array path.
6. A later claim that names only records an earlier unit shows, with the same fields, adds no unit.
7. Caps: 24 records for each unit, 4 claim fields, 3 groups for each claim, and 12 units for each pack.
8. A unit ranks with the specific-anchor units. It sits right after its claim's first specific-anchor unit.
   The p8 budget steps are unchanged.

The measure (`entityListCoverage`, exported) runs on rendered source text only (`packSourceEvidenceText`).
A record counts as shown when its identity field and each non-null claim field are on one line.
The fields must follow the identity, before the next record's identity on that line.
So a value of the previous record never counts for the next record.
The pack measures this coverage on the serialized text after every budget cut, and again after a clip.
A gap adds the general `claimSupportNotice` line. The notice is a label line, so it never changes the measure.
The audit (`explainTranscriptEvidencePack`) records the final coverage. It never enters the judge prompt.
The claims come from the answer and the saved execute results only, so the measure is the same for p6, p7, p8, and p9.

p9 keeps every p8 rule. A pack with no entity-list unit keeps the p8 text byte for byte.

## Replay

[replay-p9.mjs](replay-p9.mjs) wrote [replay-p9.json](replay-p9.json) at `4b4fb9e2` with a clean pack module.
It makes no model call. It loads p6 (`d15a4ce5`), p7 (`7e00ede2`), and p8 (`36e77d40`) from git.

The arm worktrees of the p7 and p8 runs no longer exist. Their re-judge artifacts are in
`eval/qa/results/2026-10-10-pack-rejudge/raven-p{6,7,8}-arm/` of the main checkout (read only).
The replay checks each artifact against the SHA-256 in its manifest.
[inputs.mjs](inputs.mjs) rebuilds each judge input from the saved source result and the recorded cases.
It checks the cases hash of every artifact. All 96 stored packs and all 96 stored prompts reproduce.

"Every claim's evidence" means two things for one pack. Every entity-list record is shown.
Every disputed claim keeps its transcript support. The disputed claims are the wrong claims of every stored vote.
That set includes the p6, p7, p8, and p8b votes.

### Summary

| Check | p6 | p7 | p8 | p9 |
|---|---|---|---|---|
| 32 measured rows: entity-list records shown (of 63, in 6 rows) | 19 | 8 | 12 | **62** |
| 32 measured rows: disputed claims held (of 37 with transcript support) | 15 | 36 | 36 | 36 |
| 32 measured rows: rows with every claim's evidence | 21 | 26 | 26 | **30** |
| 32 measured rows: answer probes missing | 80 | 37 | 40 | 40 |
| 11 omission rows: supported disputed claims held (of 12) | 2 | 11 | 12 | 12 |
| 11 omission rows: entity-list records shown (of 11, in 2 rows) | 5 | 5 | 4 | 11 |
| 270 control rows: entity-list records shown (of 437, in 57 rows) | 180 | 115 | 131 | **434** |
| 270 control rows: rows with complete entity lists (of 57) | 21 | 14 | 19 | **54** |
| 270 control rows: answer probes missing | 493 | 283 | 270 | 277 |
| 270 control rows: rows with 2 or fewer source items | 153 | 158 | 144 | 146 |
| 187 stable rows: judge prompt identical to p6 | — | — | — | 187 |

- The control inventory has 270 rows, not the 207 rows of the p8 replay. The stable set has 187 rows, not 131.
  New saved results have arrived since 2026-10-10. The rules for row selection did not change.
- p9 changes the prompt of 6 of the 32 measured rows. Those are the rows with an entity-list unit.
  The other 26 p9 prompts equal the recorded p8 prompts.
- The largest p9 pack is 11,999 characters in the measured rows and 12,000 in the control rows.

### The R8-1 row

`S2a` `q-defi-arbitrage-pathpayment-bots`: p6 shows 6 of 11 records, p7 0, p8 5, and p9 11.
p8 misses Phoenix, Comet, Zenex, Noether, Raum Network, and Octarine, as R8 found.
The p9 pack (11,906 characters) shows this unit:

```text
entry=1 path="dexProjects" role=entity-list
span: {name: Soroswap | status: Live | tvlUSD: 1243997}; {name: Aquarius | status: Live | tvlUSD: 38937692}; {name: Phoenix | status: Live}; {name: StellarTerm | status: Live}; {name: Comet | status: Inactive}; {name: Zenex | status: Live}; {name: Noether | status: Pre-Release}; {name: Raum Network | status: Development}; {name: Octarine | status: Live}
```

Hoops Finance is in the same array, but the sentence does not name it, so the unit omits it.
p9 shows the evidence for both readings. It does not decide what the candidate meant.
The candidate's sentence scope stays a reading question for the judge and the reviewer.

### The 32 measured rows

List columns show records shown under p6 / p7 / p8 / p9, of the total. "—" means none in this row.

| Inv. | Row | List records shown | Disputed claims held | Pack chars | Every claim's evidence |
|---|---|---|---|---|---|
| S1a | `q-defi-etherfuse-stablebonds` | 4 / 4 / 4 / 8 of 8 | — | 11990 / 11720 / 11854 / 11934 | no / no / no / yes |
| S1b | `q-edge-fresh-latest-blend-tvl` | 1 / 1 / 0 / 3 of 3 | 0 / 1 / 1 / 1 of 1 | 11979 / 11994 / 11967 / 11782 | no / no / no / yes |
| S1b | `q-sor-deploy-invoke-from-js-sdk` | — | 2 / 8 / 8 / 8 of 8 | 10888 / 11895 / 11985 / 11985 | no / yes / yes / yes |
| S1b | `q-ti-rpc-gettransactions-pagination-xdr` | — | 0 / 7 / 7 / 7 of 7 | 10724 / 11994 / 11945 / 11945 | no / yes / yes / yes |
| S1c | `q-hist-quantum-preparedness-plan` | — | 2 / 3 / 3 / 3 of 3 | 11632 / 11902 / 11960 / 11960 | no / yes / yes / yes |
| S1c | `q-soroban-oz-upgradeable-macro` | — | 0 / 5 / 5 / 5 of 5 | 8419 / 10655 / 10644 / 10644 | no / yes / yes / yes |
| S2a | `q-aas-list-token-on-exchanges-aggregators` | — | — | 11911 / 11878 / 11982 / 11982 | yes / yes / yes / yes |
| S2a | `q-asset-stablecoin-issuers-discovery` | 6 / 1 / 1 / 36 of 37 | — | 11981 / 11863 / 11982 / 11975 | no / no / no / no |
| S2a | `q-comp-cross-moneygram-partnership-sep24` | — | — | 11667 / 11939 / 11380 / 11380 | yes / yes / yes / yes |
| S2a | `q-defi-arbitrage-pathpayment-bots` | 6 / 0 / 5 / 11 of 11 | 1 / 1 / 1 / 1 of 1 | 11992 / 11749 / 11882 / 11906 | no / no / no / yes |
| S2a | `q-eco-pyusd-stellar-freshness` | — | — | 11816 / 10325 / 10060 / 10060 | yes / yes / yes / yes |
| S2a | `q-edge-fresh-latest-scf-round` | — | — | 5042 / 4798 / 4784 / 4784 | yes / yes / yes / yes |
| S2a | `q-mpp-discovery-and-modes` | — | — | 8824 / 11955 / 11573 / 11573 | yes / yes / yes / yes |
| S2a | `q-raph-remove-scam-token` | — | — | 9332 / 11977 / 11939 / 11939 | yes / yes / yes / yes |
| S2a | `q-scf-funding-by-category` | — | — | 10241 / 9819 / 9393 / 9393 | yes / yes / yes / yes |
| S2a | `q-sep-43-web-wallet-api` | — | — | 12000 / 11810 / 11702 / 11702 | yes / yes / yes / yes |
| S2a | `q-sor-cross-warmancer-zk-stack` | — | — | 11621 / 11940 / 11999 / 11999 | yes / yes / yes / yes |
| S2a | `q-soroban-contract-build-verification` | — | — | 11978 / 11955 / 11833 / 11833 | yes / yes / yes / yes |
| S2a | `q-ti-vocab-content-tags-live` | — | — | 7145 / 9953 / 8827 / 8827 | yes / yes / yes / yes |
| S2b | `q-agent-identity-erc8004-stellar` | 0 / 0 / 0 / 2 of 2 | — | 11979 / 11939 / 11806 / 11966 | no / no / no / yes |
| S2b | `q-protocol-27-cap-0071` | — | — | 11965 / 11890 / 11999 / 11999 | yes / yes / yes / yes |
| S2b | `q-soroban-token-transfer-pattern` | — | — | 7541 / 10449 / 10440 / 10440 | yes / yes / yes / yes |
| S2c | `q-hist-quantum-preparedness-plan` | — | 3 / 3 / 3 / 3 of 3 | 11698 / 11933 / 11958 / 11958 | yes / yes / yes / yes |
| S2c | `q-raph-withdraw-exchange-self-custody` | — | — | 9600 / 7831 / 8756 / 8756 | yes / yes / yes / yes |
| S2d | `q-gap-leaderboard-project-not-builder` | 2 / 2 / 2 / 2 of 2 | — | 9846 / 7515 / 7195 / 7338 | yes / yes / yes / yes |
| S2e | `q-pc-quantum-preparedness-dormant` | — | 5 / 5 / 5 / 5 of 5 | 11334 / 11885 / 11984 / 11984 | yes / yes / yes / yes |
| S3a | `q-defi-bridge-evm-to-stellar-axelar` | — | 1 / 2 / 1 / 1 of 2 | 11983 / 11862 / 11913 / 11913 | no / yes / no / no |
| S3b | `q-ti-freighter-localhost-not-detected` | — | — | 11867 / 11929 / 11982 / 11982 | yes / yes / yes / yes |
| S3c | `q-sor-force-fast-archival-localnet` | — | 0 / 0 / 1 / 1 of 1 | 11567 / 11958 / 11942 / 11942 | no / no / yes / yes |
| S3d | `q-scf-verified-members` | — | — | 11500 / 11853 / 11966 / 11966 | yes / yes / yes / yes |
| S3d | `q-soroban-sdk-cve` | — | — | 11948 / 11984 / 11686 / 11686 | yes / yes / yes / yes |
| S3d | `q-tool-sdk-repos-discovery` | — | 1 / 1 / 1 / 1 of 1 | 11935 / 11886 / 11985 / 11985 | yes / yes / yes / yes |

### The 11 saved omission rows

| Row | Source file | List records shown | Supported claims held | Pack chars |
|---|---|---|---|---|
| `q-defi-arbitrage-pathpayment-bots` | `2026-08-27T00-02-11` | — | 0 / 1 / 1 / 1 of 1 | 9618 / 11924 / 11697 / 11697 |
| `q-ti-freighter-localhost-not-detected` | `2026-08-27T00-02-11` | — | 1 / 1 / 1 / 1 of 1 | 11921 / 11886 / 11745 / 11745 |
| `q-asset-rwa-tokenized-freshness` | `2026-08-28T19-27-08` | — | 0 / 1 / 1 / 1 of 1 | 11910 / 11937 / 11859 / 11859 |
| `q-defi-arbitrage-pathpayment-bots` | `2026-08-28T19-27-08` | — | 0 / 1 / 1 / 1 of 1 | 11738 / 11768 / 11930 / 11930 |
| `q-sor-p23-auto-restore-extendto` | `2026-08-30T03-43-11` | — | 0 / 1 / 1 / 1 of 1 | 11928 / 11836 / 11804 / 11804 |
| `q-defi-etherfuse-stablebonds` | `2026-10-07T19-43-18` | 4 / 4 / 4 / 8 of 8 | 0 / 0 / 1 / 1 of 1 | 11990 / 11720 / 11854 / 11934 |
| `q-edge-fresh-latest-blend-tvl` | `2026-10-07T23-25-14` | 1 / 1 / 0 / 3 of 3 | 0 / 1 / 1 / 1 of 1 | 11979 / 11994 / 11967 / 11782 |
| `q-sor-deploy-invoke-from-js-sdk` | `2026-10-07T23-25-14` | — | 1 / 2 / 2 / 2 of 2 | 10888 / 11895 / 11985 / 11985 |
| `q-ti-rpc-gettransactions-pagination-xdr` | `2026-10-07T23-25-14` | — | 0 / 1 / 1 / 1 of 1 | 10724 / 11994 / 11945 / 11945 |
| `q-hist-quantum-preparedness-plan` | `2026-10-08T02-40-37` | — | 0 / 1 / 1 / 1 of 1 | 11632 / 11902 / 11960 / 11960 |
| `q-soroban-oz-upgradeable-macro` | `2026-10-08T02-40-37` | — | 0 / 1 / 1 / 1 of 1 | 8419 / 10655 / 10644 / 10644 |

Rows without a saved `caseInput` read the cases of the p8 tree (`e7ca3fb0`). The p8 omission repairs hold: 12 of 12.

## Costs and limits

- Two measured rows stay incomplete under p9.
  - `q-asset-stablecoin-issuers-discovery` shows 36 of 37 records. Its answer has 13 list claims.
    The 12-unit cap drops the last claim (`EURC` and `For Yield`).
  - `q-defi-bridge-evm-to-stellar-axelar` misses the "Spectra Bridge (Certora)" support. p8 misses it too; p7 held it.
    This gap comes from p8, not from the list rule.
- The list units take budget from other units. In the control rows, 5 rows lose 1 or 2 answer probes against p8.
  The total is 277 against 270 for p8 (493 for p6). The measured rows keep 40, the same as p8.
  The 5 rows are `q-agent-identity-erc8004-stellar`, `q-defi-etherfuse-stablebonds` (both `2026-10-07T16-51-53`),
  `q-asset-rwa-tokenized-freshness`, `q-scf-cross-reflector-rounds-current`, and `q-scf-pitch-prep-live` (all `2026-10-08T02-40-37`).
  In four of these rows p9 also shows list records that p8 dropped (for example 7 of 7 against 0 of 7).
  In `q-scf-cross-reflector-rounds-current`, p8 already showed all 8 list records.
  There, p9 still adds list units, because the rule skips only records that an earlier list unit shows.
  The row loses 2 probes for no list gain. A rule that skips records any kept unit shows could remove this cost.
- The detection is a heuristic. A claim field can match an ordinary word.
  For example, "live numbers" matches a `Live` status. The unit then shows true source values, but it uses budget.
- The measure can miss a record whose claim field comes before its identity field on one line.
  It then under-counts. It never counts a value of another record.
- An answer that names a record by another form, such as a slug, does not match its name.
- The revisions `d15a4ce5`, `7e00ede2`, and `36e77d40` are on the PR #264 branch (`origin/w1010/r`), not on `main`.

## Files

| File | Role |
|---|---|
| [replay-p9.mjs](replay-p9.mjs), [replay-p9.json](replay-p9.json) | The offline replay and its output |
| [inputs.mjs](inputs.mjs) | Shared input loader for the replay and the reading command |
| [measurement-plan-p9.md](measurement-plan-p9.md) | The paid measurement plan (not authorized) |
| [rejudge-artifacts-p9.json](rejudge-artifacts-p9.json) | The predeclared manifest for that measurement |
| [analyze-rejudge-p9.mjs](analyze-rejudge-p9.mjs) | The predeclared reading command |
| [rejudge-summary-p9-notrun.json](rejudge-summary-p9-notrun.json) | The reading before any run: 26 reused rows valid, 6 rows `not-run` |
| [rejudge-summary-p9-standin.json](rejudge-summary-p9-standin.json) | The reading with p8 panels as a stand-in: every changed row `INCONCLUSIVE` |
| [launcher/](launcher/) | The arm-B launcher. It refuses to run until a reviewed commit is recorded |
