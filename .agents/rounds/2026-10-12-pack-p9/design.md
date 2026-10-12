# Pack p9: sibling records for entity-list claims

Date: 2026-10-12. Author: Claude Opus 5.5 (lane J). Status: offline only. No model call was made.
Branch `w1012/j`, rebased on `origin/main` `63396840`. The p9 code is commit `e0dd1953` (first `4b4fb9e2`; review RJ fixes in `d07fffc8`, `4bfcdb4d`, and `89ff6313`; review RJ2 fix in `e0dd1953`).
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
   Its complete identified objects form one group. An object nested inside another identified object is not a sibling.
3. An entity-list claim is one answer claim (sentence) that names two or more sibling records.
4. A claim field is a field that the claim names (`TVL` for `tvlUSD`).
   It is also a field whose text value of a listed record the claim states (`Inactive` for `status`).
   A claim without a claim field is not an entity-list claim.
5. The requirements are every qualifying group, every named record, and every claim field.
   Rendering limits never shrink them (review RJ-2).
6. The unit shows each named record as `{name: Comet | status: Inactive}`. Null fields are not shown.
   A value with a separator (`|`, `;`, `,`, a brace, or a quote) is quoted. Records keep their source order.
   The header names the entry and the array path.
7. A later claim that names only records an earlier unit shows, with the same fields, adds no unit.
8. Rendering limits: 3 groups for each claim, 24 records for each unit, 4 claim fields, and 12 units for each pack.
   The audit's `entityListLimits` names each record or field that a limit removed.
9. A unit ranks with the specific-anchor units. It sits right after its claim's first specific-anchor unit.
   The p8 budget steps are unchanged.

The measure (`entityListCoverage`, exported) runs on rendered source text only (`packSourceEvidenceText`).
A small parser splits each line into record scopes (reviews RJ-1 and RJ2). Each object in braces is one scope
that owns only its direct fields. A nested object is its own scope. A quoted value is read whole, so text inside it
never reads as a field. Offsets are UTF-16 code units throughout. An object that the line clips runs to the line end.
The text outside every object is one more scope. A source-item line's `fields="..."` value reads as fields of that item.
A line that starts inside a clipped string is read with that string closed first.
A record counts as shown when one scope holds its exact identity value and the exact value of each non-null claim field.
A quoted value ends at its closing quote. Any other value ends at a separator or at the next field.
So a field of another object, a nested object, a longer name, or a longer value never counts.
A scope outside braces that names two records never counts. Two records with one name need two scopes.
The pack measures this coverage on the serialized text after every budget cut, and again after a clip.
A gap adds the general `claimSupportNotice` line. The notice is a label line, so it never changes the measure.
The audit (`explainTranscriptEvidencePack`) records the final coverage. It never enters the judge prompt.
The requirements come from the answer and the saved execute results only, so the measure is the same for p6, p7, p8, and p9.

p9 keeps every p8 rule. A pack with no entity-list unit keeps the p8 text byte for byte.

## Replay

[replay-p9.mjs](replay-p9.mjs) wrote [replay-p9.json](replay-p9.json) at `e0dd1953` with a clean pack module.
It makes no model call. It loads p6 (`d15a4ce5`), p7 (`7e00ede2`), and p8 (`36e77d40`) from git.

The arm worktrees of the p7 and p8 runs no longer exist. Their re-judge artifacts are in
`eval/qa/results/2026-10-10-pack-rejudge/raven-p{6,7,8}-arm/` of the main checkout (read only).
The replay checks each artifact against the SHA-256 in its manifest.
[inputs.mjs](inputs.mjs) rebuilds each judge input from the saved source result and the recorded cases.
It checks the cases hash of every artifact. All 96 stored packs and all 96 stored prompts reproduce.
The replay is also the baseline verification command: part B checks each rebuilt p6 pack and prompt against arm A.

"Detected evidence complete" means two things for one pack. Every detected entity-list record is shown.
Every transcript-supported probe of the stored disputed claims is present.
The disputed claims are the wrong claims of every stored vote, including the p6, p7, p8, and p8b votes.
This check does not test other claims of the answer.

### Summary

| Check | p6 | p7 | p8 | p9 |
|---|---|---|---|---|
| 32 measured rows: entity-list records shown (of 70, in 6 rows) | 19 | 7 | 11 | **65** |
| 32 measured rows: disputed claims held (of 37 with transcript support) | 15 | 36 | 36 | 36 |
| 32 measured rows: rows with detected evidence complete | 21 | 26 | 26 | **28** |
| 32 measured rows: answer probes missing | 80 | 37 | 40 | 40 |
| 11 omission rows: supported disputed claims held (of 12) | 2 | 11 | 12 | 12 |
| 11 omission rows: entity-list records shown (of 20, in 3 rows) | 5 | 4 | 3 | 18 |
| 270 control rows: entity-list records shown (of 463, in 56 rows) | 174 | 108 | 124 | **429** |
| 270 control rows: rows with complete entity lists (of 56) | 15 | 13 | 17 | **43** |
| 270 control rows: answer probes missing | 493 | 283 | 270 | 278 |
| 270 control rows: rows with 2 or fewer source items | 153 | 158 | 144 | 146 |
| 187 stable rows: judge prompt identical to p6 | — | — | — | 187 |

- The control inventory has 270 rows, not the 207 rows of the p8 replay. The stable set has 187 rows, not 131.
  New saved results have arrived since 2026-10-10. The rules for row selection did not change.
- p9 changes the prompt of 6 of the 32 measured rows. Those are the rows with an entity-list unit.
  The other 26 p9 prompts equal the recorded p8 prompts.
- The largest p9 pack is 11,999 characters in the measured rows and 12,000 in the control rows.
- In the measured rows, p9 misses 5 list records. A rendering limit removed each of them: 4 by the 4-field limit
  (`q-defi-etherfuse-stablebonds` and `q-agent-identity-erc8004-stellar`) and 1 by the 12-unit limit.
  In the control rows, p9 misses 34 records. The audit names 32 field-limit and 3 unit-limit removals.
  Some missed records have another cause, such as a budget cut (for example 12 of 13 in `q-asset-rwa-tokenized-freshness`).
- These numbers come from the record-scoped measure. The first replay (`4b4fb9e2`) used the line-window measure
  that review RJ-1 rejected, and its limited denominators (RJ-2). Its numbers are not comparable.

### The R8-1 row

`S2a` `q-defi-arbitrage-pathpayment-bots`: p6 shows 6 of 11 records, p7 0, p8 5, and p9 11.
The 11 records are 9 distinct venues plus Aquarius and Soroswap a second time.
A later sentence ("live numbers") matches the `Live` status value, so it counts them again. It adds no unit.
p6 shows Comet and Zenex, as R8 found. p8 misses Phoenix, Comet, Zenex, Noether, Raum Network, and Octarine.
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
| S1a | `q-defi-etherfuse-stablebonds` | 3 / 3 / 3 / 5 of 7 | — | 11990 / 11720 / 11854 / 11894 | no / no / no / no |
| S1b | `q-edge-fresh-latest-blend-tvl` | 2 / 1 / 0 / 6 of 6 | 0 / 1 / 1 / 1 of 1 | 11979 / 11994 / 11967 / 11654 | no / no / no / yes |
| S1b | `q-sor-deploy-invoke-from-js-sdk` | — | 2 / 8 / 8 / 8 of 8 | 10888 / 11895 / 11985 / 11985 | no / yes / yes / yes |
| S1b | `q-ti-rpc-gettransactions-pagination-xdr` | — | 0 / 7 / 7 / 7 of 7 | 10724 / 11994 / 11945 / 11945 | no / yes / yes / yes |
| S1c | `q-hist-quantum-preparedness-plan` | — | 2 / 3 / 3 / 3 of 3 | 11632 / 11902 / 11960 / 11960 | no / yes / yes / yes |
| S1c | `q-soroban-oz-upgradeable-macro` | — | 0 / 5 / 5 / 5 of 5 | 8419 / 10655 / 10644 / 10644 | no / yes / yes / yes |
| S2a | `q-aas-list-token-on-exchanges-aggregators` | — | — | 11911 / 11878 / 11982 / 11982 | yes / yes / yes / yes |
| S2a | `q-asset-stablecoin-issuers-discovery` | 6 / 1 / 1 / 41 of 42 | — | 11981 / 11863 / 11982 / 11834 | no / no / no / no |
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
| S2b | `q-agent-identity-erc8004-stellar` | 0 / 0 / 0 / 0 of 2 | — | 11979 / 11939 / 11806 / 11966 | no / no / no / no |
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
| `q-asset-rwa-tokenized-freshness` | `2026-08-28T19-27-08` | 0 / 0 / 0 / 7 of 7 | 0 / 1 / 1 / 1 of 1 | 11910 / 11937 / 11859 / 11829 |
| `q-defi-arbitrage-pathpayment-bots` | `2026-08-28T19-27-08` | — | 0 / 1 / 1 / 1 of 1 | 11738 / 11768 / 11930 / 11930 |
| `q-sor-p23-auto-restore-extendto` | `2026-08-30T03-43-11` | — | 0 / 1 / 1 / 1 of 1 | 11928 / 11836 / 11804 / 11804 |
| `q-defi-etherfuse-stablebonds` | `2026-10-07T19-43-18` | 3 / 3 / 3 / 5 of 7 | 0 / 0 / 1 / 1 of 1 | 11990 / 11720 / 11854 / 11894 |
| `q-edge-fresh-latest-blend-tvl` | `2026-10-07T23-25-14` | 2 / 1 / 0 / 6 of 6 | 0 / 1 / 1 / 1 of 1 | 11979 / 11994 / 11967 / 11654 |
| `q-sor-deploy-invoke-from-js-sdk` | `2026-10-07T23-25-14` | — | 1 / 2 / 2 / 2 of 2 | 10888 / 11895 / 11985 / 11985 |
| `q-ti-rpc-gettransactions-pagination-xdr` | `2026-10-07T23-25-14` | — | 0 / 1 / 1 / 1 of 1 | 10724 / 11994 / 11945 / 11945 |
| `q-hist-quantum-preparedness-plan` | `2026-10-08T02-40-37` | — | 0 / 1 / 1 / 1 of 1 | 11632 / 11902 / 11960 / 11960 |
| `q-soroban-oz-upgradeable-macro` | `2026-10-08T02-40-37` | — | 0 / 1 / 1 / 1 of 1 | 8419 / 10655 / 10644 / 10644 |

Rows without a saved `caseInput` read the cases of the p8 tree (`e7ca3fb0`). The p8 omission repairs hold: 12 of 12.

## Costs and limits

- Three measured rows stay incomplete under p9.
  - `q-defi-etherfuse-stablebonds` (5 of 7) and `q-agent-identity-erc8004-stellar` (0 of 2): the claims have
    more than 4 claim fields (up to 8). The 4-field limit drops the rest, and the measure requires all of them.
    Many of these fields come from a loose match: "SCF" in the claim names every `scf*` field.
  - `q-asset-stablecoin-issuers-discovery` shows 41 of 42 records. Its answer has 13 list claims.
    The 12-unit limit drops the last claim; `For Yield` is not shown elsewhere.
- `q-defi-bridge-evm-to-stellar-axelar` misses the "Spectra Bridge (Certora)" support. p8 misses it too; p7 held it.
  This gap comes from p8, not from the list rule.
- The list units take budget from other units. In the control rows, 5 rows lose 1 to 3 answer probes against p8.
  The total is 278 against 270 for p8 (493 for p6). The measured rows keep 40, the same as p8.
  - In 3 rows, p9 also shows list records that p8 dropped: `q-agent-identity-erc8004-stellar` (7 of 7 against 0),
    `q-asset-rwa-tokenized-freshness` (12 of 13 against 1), and `q-scf-pitch-prep-live` (2 of 2 against 1).
  - In 2 rows, p9 gains no list record over p8, because the field limit removes required fields:
    `q-defi-etherfuse-stablebonds` (`2026-10-07T16-51-53`, 1 of 3) and `q-scf-cross-reflector-rounds-current`
    (`2026-10-08T02-40-37`, 6 of 9, 3 more probes lost). There the list units cost budget for no measured gain.
  - Two changes could remove this cost: skip a unit whose records other kept units already show,
    and narrow the "names the field" match. Neither is built. Both change judge input and need review.
- The detection is a heuristic. A claim field can match an ordinary word.
  For example, "live numbers" matches a `Live` status. The unit then shows true source values, but it uses budget.
- The measure under-counts when a value has a separator but is not quoted (older packs), or when a
  number is written with thousands separators. It never counts a field of another record.
- An answer that names a record by another form, such as a slug, does not match its name.
- The revisions `d15a4ce5`, `7e00ede2`, and `36e77d40` are on the PR #264 branch (`origin/w1010/r`), not on `main`.

## Review RJ reconciliation

The independent review (`/private/tmp/claude-501/w1012/rj-review.md`, outside the repository) returned
CODE: CHANGES and PLAN: BLOCKED on `dabdea00`.

| Finding | Fix | Evidence |
|---|---|---|
| RJ-1: coverage crossed record boundaries and accepted partial names and values | Record scopes by braces, nested objects removed, exact complete values, ambiguous outside scopes skipped, one scope for each same-named record; a clipped opening string is handled | 7 new fixtures, including all four reviewer fragments; replay refreshed |
| RJ-2: limits shrank the requirements before the measure | Requirements keep every group, record, and claim field; limits apply only when units are selected; `entityListLimits` names each removal | 2 new fixtures (the 25-record case); replay counts removals by limit |
| RJ-3: the plan compared the p9 prompt with the p6 prompt for arm A | Separate conditions for each arm; the reading command now checks the rebuilt p6 pack and prompt against arm A | [measurement-plan-p9.md](measurement-plan-p9.md); [analyze-rejudge-p9.mjs](analyze-rejudge-p9.mjs) |

Two more fixes came from the refreshed replay. A clipped JSON fragment no longer counts an object nested
inside an identified record as a sibling. The scope scanner reads a snippet that starts inside a string.
The replay now says "detected evidence complete" instead of "every claim's evidence", as the review asked.
The changed-row set did not change: p9 still changes the prompts of the same 6 measured rows.

The delta review (`/private/tmp/claude-501/w1012/rj2-review.md`) confirmed RJ-2 and RJ-3 resolved and RJ-1 partly
resolved. It returned CODE: CHANGES and PLAN: BLOCKED on `740c24f6`.

| Finding | Fix | Evidence |
|---|---|---|
| RJ2-1: text inside another field's quoted value counted as an identity or a field | A structural parser reads a quoted value whole and reads fields only at their owning object's level | 2 fixtures (both reviewer fragments) |
| RJ2-2: astral characters shifted the nested-object masks | The parser uses UTF-16 offsets throughout and builds no code-point array | 1 fixture: the nested status stays missing; a direct status still counts |

The parser also unwraps a source-item line's `fields="..."` value (1 fixture), which the p8 shape needs.
The pack text did not change: all p9 packs and prompts in the replay are the same as at `89ff6313`.
Only the p6 control count moves (172 to 174 records), because the parser reads two more p6 records correctly.

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
