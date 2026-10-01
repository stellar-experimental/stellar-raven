# Authority measurement reader

Verdict: BOUNDED PASS.

The four analysis slots pass the plan regression tests.
This report stops before any release claim.
No selected case fails the routing-regression test.
No selected case fails the verified-answer-regression test.
Both candidate repetitions pass the protocol class rule.
There is no routing gain. Both baseline repetitions also pass.

## Class rule

The class uses the first successful execute script.
The family pattern is the plan expression.
E means every family is an expected family.
T means one expected family plus another family.
O means no expected family.
N means no successful service call.
An empty family set is N.
E and T pass. O and N fail.
Citation families come from the final answer text.
Scout means the answer says Scout or links stellarlight.xyz.
Stellar Docs means a developer-docs name or developers.stellar.org link.
The award answers cite the SCF Handbook.
Those rows use scout because the saved scout text contains the handbook sentences.
No answer names Lumenloop.

The row file is `authority-reader-grok.json` in this same directory.

## Counts

Each run has 4 E rows and 2 T rows.
The T rows are the anchor case and the stablecoin case.
The award case is E in every run.
Every protocol row is E.
The anchor execute families are scout, lumenloop, and stellarDocs in every run.
The stablecoin execute families are scout, stellarDocs, and lumenloop in every run.
baseline-2 lists lumenloop before stellarDocs. The class stays T.

Both baseline award scripts call scout and lumenloop.
Both candidate award scripts call scout only.
Those calls are scout.searchResearch and scout.scfPitch.
The class stays E.
The first search filter is lumenloop on every award row.
That filter is diagnostic only.

Some protocol rows search skills on a later call.
The first search filter is stellarDocs on every protocol row.

## Slots, pins, and budget

The run order is baseline-1, candidate-1, candidate-2, then baseline-2.
Each slot has the same six case IDs.
Each quarantine folder is empty.
BASE is commit 5ebffbac3c8bb33657c1f57fb1c5a494770e5d3f.
CANDIDATE is commit 894f5fea589ecb836c3db7b1ed7c0511b50ebe38.
The artifact heads match those commits.
The server logs show the same revision lines.
Both recorded trees are clean.
The selected-case SHA-256 is 207ca631c052341b73a3b0ed173104e8848c6f3f824e97bdd977a6ba6127f16d.
The plan input hashes match the four artifacts.
The judge is Claude Code 2.1.287.
Its SHA-256 is 6eab8333fe2121553100d8f40bfada384a3e989b94f947e18ba6677a6fcb41ea.
DISABLE_AUTOUPDATER is 1 on every paid command.
The judge temperature stays the provider default.
The answer model is openai/gpt-5.6-terra.
The API mode is responses.
The reasoning effort is none.
The temperature is 0.1.

The repaired receipt probe cost is $0.0028798.
That cost is below $0.50.
The method cap stays $10.
The round ceiling stays $52.
Each run reports 12 calls, zero missing costs, and no exhaustion.
Every answer cost frame has equal calls and reported calls.
The frame error is null.
The four-run total is $3.2288699.
The probe plus four runs total $3.2317497.
No replacement run was used.
The consumed caps are 0, 6, 12, and 18.
The old probe is `authority-results/receipt-probe`.
That artifact has a null answer cost and zero calls.
It is not one of the four slots.
The repaired probe is `authority-results-2/receipt-probe`.
Its cost frame has error null, one call, and a positive cost.
The BASE quote includes the original clause.
This report does not copy that clause.

## Source identity

Five identity probes share one SHA-256.
The hash is 1ad47664d99713cb3334f1a5218c5a81de0f19e0b3a28957294ef838b4454a79.
The times run from 22:57:26Z to 23:15:08Z on 2026-10-01.
A stable identity hash does not prove every page byte stayed fixed.
The saved stablecoin caps agree where the rows include marketCapUSD.

## Grade differences

### q-asset-stablecoin-issuers-discovery

baseline-1 is partial. Both candidate rows are partial. baseline-2 is correct.
The baseline-1 wrong-claim text does not match the saved caps.
The saved top caps are USDY $537,627,505 and USDC $390,851,663.
APSUSDM is $171,508,051. C1USD is $50,000,000.
The baseline-1 answer names those four assets.
USDM1 is about $1,119,010. That is the likely misread.
candidate-2 states the same top four.
The judge did not call that sentence wrong.
candidate-1 and baseline-2 both name Circle USDC and EURC.
Neither answer says dominant.
The judge scored only candidate-1 partial for that gap.
This difference is judge variance.
The identity hash did not change. This is not source drift.
The verified-answer-regression test does not fire.

### q-scf-build-award-cap

baseline-1 and candidate-1 are wrong.
candidate-2 and baseline-2 are partial.
Every saved result states an award of up to $150,000 worth of XLM.
Every saved result says the award is paid in four installments.
The wrong rows omit the observation date.
The partial rows show 2026-10-01 or Oct. 1, 2026.
All four answers omit the four installments.
The score split follows the visible date.
The two arms match. This is answer content.
The verified-answer-regression test does not fire.

## Shared partial rows

All four `q-protocol-base-reserve-min-balance` rows are partial.
Each answer gives the current 0.5 XLM base reserve.
Each answer counts a pool-share trustline as two subentries.
Each answer limits its formula to a non-sponsored account.
No saved result contains numSponsoring or numSponsored.
sd-046 is resolved in `improvements/resolved.json` on 2026-09-29.
The pool-share rule is present in these answers.
The sponsorship formula remains a shared omission.
The word rent in baseline-1 is commit-log text, not the Soroban rent model.

All four `q-sep-45-contract-auth` rows are partial.
Each answer names SEP-45 and contrasts SEP-10.
No answer calls SEP-45 final.
No saved guide text contains Draft or an as-of date.
No answer cites SEP-43.

All four `q-soroban-storage-types` rows are partial.
Each answer names Temporary, Persistent, and Instance.
No answer states the two XDR durability variants.
No answer states the Protocol 23 auto-restore rule.
The saved text names RestoreFootprintOp.
No answer says Temporary data is restorable.

## Anchor rows

All four `q-anchor-list-builders-discovery` rows are correct.
Each answer dates the Scout directory as 2026-10-01.
Each answer says the roster is not complete.
Checked names and the coins-ph slug are in the stored results.
Several execute results are host-truncated near 24,000 characters.
The judge pack is smaller than the transcript result.
Name checks use `rows[].transcript` and `rows[].answer`.

## Evidence limits

This review uses the saved artifacts only.
It does not call live sources.
It does not run a paid rejudge.
It does not recompute the description hashes.
`arm-pins.json` records those hashes.
The candidate text was not edited.
The stablecoin grade gap is judge variance, as recorded above.
