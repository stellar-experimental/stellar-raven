# Run 2.1 plan: Bell Mainnet vote, outcome A

Spec: [PRESTAGE.md](../1.4/dated/PRESTAGE.md) sections 1, 4, 5, 6 and 7. Lead brief:
[2.1-LEAD.md](../1.4/dated/2.1-LEAD.md). Branch `np/2.1-bell-goldens`, worktree
`/home/tyler/code/raven-wt/np-2.1`.

## Decision

The stale gate stays green and the Bell-dependent goldens state the post-vote truth. Three cases are
due 2026-11-24, so they must merge before 2026-11-25 00:00 UTC (cutoff 2026-11-24 20:00 UTC).

## Outcome: A, activated

Probe 1 ran at 2026-11-23T18:00:14Z ([probe-1.json](probe-1.json)); the lead re-read it at 18:01Z.
Every A condition holds:

| Claim | Class | URL | observedAt | Value or quote |
|---|---|---|---|---|
| Mainnet `current_protocol_version` (Horizon root) | F | `https://horizon.stellar.org/` | 2026-11-23T18:01Z | `current_protocol_version` 30, `core_supported_protocol_version` 30, `stellar-core 30.0.0` |
| Mainnet protocol (RPC `getLatestLedger`) | F | `https://mainnet.sorobanrpc.com` | 2026-11-23T18:00Z | `protocolVersion` 30 at ledger 65634153 |
| First Protocol 30 ledger L and L-1 | F | `https://horizon.stellar.org/ledgers/65633432`, `/65633431` | 2026-11-23T18:01Z | L 65633432 `closed_at` 2026-11-23T17:00:06Z `protocol_version` 30; L-1 65633431 17:00:01Z `protocol_version` 29 |
| Bell guide schedule line | A | `https://stellar.org/blog/developers/bell-protocol-30-upgrade-guide` | 2026-11-23T18:00Z | "November 23, 2026, 1700 UTC —Mainnet upgrade vote" (L closes 6 s after 17:00 UTC) |
| Status feed row (recorded; proves nothing) | C | `https://status.stellar.org/api/v2/scheduled-maintenances.json` | 2026-11-23T18:00Z | "Stellar Public Network Protocol Upgrade Vote", completed, 17:00 to 17:05 UTC |
| `stellar-core` Protocol 30 release | B | `https://github.com/stellar/stellar-core/releases/tag/v30.0.0` | 2026-11-23T18:01Z | v30.0.0 published 2026-10-16; newest release; no v31 tag or release |
| CAP-0084, CAP-0087, CAP-0088 | B | `https://github.com/stellar/stellar-protocol/blob/master/core/cap-00NN.md` | 2026-11-23T18:01Z | Muxed Contract Addresses; Host functions for ML-DSA signature verification; Millisecond-Resolution Close Times. Each "Status: Implemented", "Protocol version: 30" |
| P30 headline (second class) | A | `https://stellar.org/protocol-upgrades` | 2026-11-23T18:02Z | "It adds muxed contract addresses, post-quantum signature verification in smart contracts, and millisecond ledger close times." |
| Next announced Mainnet vote: none | C, A, B, D | `https://status.stellar.org/api/v2/scheduled-maintenances/upcoming.json`; `https://stellar.org/protocol-upgrades`; core releases and tags; one built-in web search | 2026-11-23T18:01Z | upcoming `"scheduled_maintenances":[]`; the upgrades page names Bell only; newest core tag v30.0.0; web search "Stellar Protocol 31 Mainnet upgrade vote date announced" found no Protocol 31 vote |

Not needed: a second probe (only B needs one). The Software Versions page
(`https://developers.stellar.org/docs/networks/software-versions.md`, 18:00Z) still heads
"Protocol 29 (Mainnet, October 1, 2026)" and lists no Protocol 30, so that case stays with 2.2a.

`sibling-check.mjs` last line: "pending-state matches among the cases this lane may not open: 0".

## Steps and files

`L` = 65633432, date = 2026-11-23. All case files are under `eval/qa/corpus/battery/`. Every
edited case: `truth.asOf` 2026-11-23, new corroboration row(s) citing the rows above, and
`caseAsOf` 2026-11-23 on its sentinels. Gospel changes set `truth.verified` = `{date: 2026-11-23,
by: "Dated run 2.1 (2026-11-23), .agents/rounds/2026-11-16-next-phase/items/2.1/", evidence:
[the URLs and quotes above], rootCause: ["freshness-drift"]}`.

1. **Edge** (`edge-behavior/q-edge-fresh-latest-protocol-version.json`), `reverifyBy` 2027-02-15.
   - `golden.answer`: Protocol 30 (Bell), activated 2026-11-23 at ledger 65633432; keep the behaviour clause. (the case file holds the text; `case-text-scan` bars quoting it here)
   - `golden.notes`: the example is Protocol 30 at ledger 65633432, as of 2026-11-23; accept a newer dated observation.
   - Key facts and avoid unchanged. Sentinel `mainnet-protocol-29-latest` becomes
     `mainnet-protocol-30-latest` (pattern `"current_protocol_version": ?30\b`, same guard).
2. **Upgrade timing** (`protocol-core/q-pc-protocol-upgrade-timing.json`), `reverifyBy` 2027-02-22.
   - `golden.answer`: Protocol 30 (Bell) since 2026-11-23 at ledger 65633432; no next Mainnet vote announced in the status calendar, SDF upgrade pages or stellar-core releases; the validator and SCP sentence stays; the SDK sentence is per reconciliation 5. (the case file holds the text; `case-text-scan` bars quoting it here)
   - Key fact 3: per reconciliation 5. Key facts 1
     and 2, avoid and notes unchanged.
   - `truth.notes`: the Testnet-deadline sentence becomes a dated statement that Bell's Testnet and
     Mainnet deadlines are historical (ledger 65633432).
   - Corroboration: the activation row, and the negative "No next Mainnet protocol vote is announced
     as of 2026-11-23" (`confirmed-as-of`, classes C, A, B, D).
   - Remove sentinel `bell-mainnet-vote-scheduled`; add `next-mainnet-upgrade-vote-absent`:
     `absent` on `https://status.stellar.org/api/v2/scheduled-maintenances/upcoming.json`, pattern
     `Upgrade Vote|Mainnet[^"]*Upgrade`, guard `"scheduled_maintenances":`.
3. **History list** (`protocol-core/q-protocol-version-history-list.json`), `reverifyBy` 2027-03-01.
   - `golden.answer`: the opening as-of sentence moves to 2026-11-23 and Protocol 30; the P30 Bell
     line (2026-11-23; CAP-0084, CAP-0087, CAP-0088 headlines) is appended after the P29 entry; the
     closing Testnet and scheduled-vote sentence is removed (fix the punctuation at the join).
   - Key fact 1 covers Protocols 19 to 30.
   - Add an avoid against calling P29 the latest after 2026-11-23.
   - `golden.notes` per reconciliation 4. `truth.notes`: the Testnet and Mainnet P29 sentence becomes a dated
     activation statement (Testnet 2026-11-03, Mainnet 2026-11-23, ledger 65633432).
   - Corroboration row for the P30 line (classes F, B, A).
   - Sentinel `mainnet-protocol-29-history` becomes `mainnet-protocol-30-history`.
4. **Quantum** (`history-org-tokenomics/q-hist-quantum-preparedness-plan.json`), judge-blind only,
   `reverifyBy` 2027-03-08. `golden.*` unchanged, so `truth.verified` changes only if the lint
   requires it. `truth.notes`: the Testnet-live and Mainnet-vote-scheduled sentences become
   one dated activation statement (Testnet 2026-11-03, Mainnet 2026-11-23, ledger 65633432).
   The classic-signer and deprecation sentences stay. Corroboration row (F ledger, B CAP-0087).
   Sentinel `mainnet-protocol-29` becomes `mainnet-protocol-30`; apply the staged test edit
   (PRESTAGE section 5) to `test/source-sentinels.test.mjs`.
5. **Dormant sibling** (`protocol-core/q-pc-quantum-preparedness-dormant.json`): `golden.answer`
   clause on CAP-0087 now says it is active on Mainnet since 2026-11-23. The dated no-rule
   negative stays (not re-swept). `truth.verified` with evidence and `rootCause`.
   Add a corroboration row. No `reverifyBy` or `scheduled` unless the lint requires one. Append a dated
   UPDATE line to `truth.notes` (Bell activated on Mainnet at ledger 65633432; CAP-0087 is live). `truth.asOf` 2026-11-23.
6. **Other openable siblings.** `q-protocol-ledger-close-time`: `truth.notes` "(Protocol 30;
   Mainnet vote scheduled 2026-11-23)" becomes "(Protocol 30, on Mainnet since 2026-11-23)"; no
   judge-facing change (its judge-facing Bell mention is structural). Every other printed sibling:
   no change (each Bell mention is dated, or there is none). The Software Versions case is 2.2a's.
7. **Compile and register.** `npm run eval:qa:compile`, then `npm run eval:qa:register` (stamps
   hashes, reopens entries). Then hand-edit, in `eval/qa/consistency-register.json`:
   - Bell trap: `triggerDateEvent` "the next Mainnet protocol vote, any later Mainnet protocol
     activation, or any AddressV2 successor change"; `disposition` "2026-11-23 dated run 2.1:
     Protocol 30 (Bell) activated on Mainnet at ledger 65633432 (closed 2026-11-23T17:00:06Z; ledger
     65633431 is Protocol 29), read on Horizon and RPC. No next Mainnet protocol vote is announced
     as of 2026-11-23. q-edge-fresh-latest-protocol-version reverifyBy 2027-02-15,
     q-pc-protocol-upgrade-timing reverifyBy 2027-02-22, and q-protocol-version-history-list
     reverifyBy 2027-03-01. q-infra-software-versions-current-protocol reverifyBy 2026-11-30
     re-reads the Software Versions page after the vote."
   - Invariant "Mainnet protocol activation history": append "; Protocol 30 (Bell) from ledger
     65633432 (2026-11-23)" to `authoritativeValue`; `rule` rewritten to state P27 to P30 as fixed
     history and P30 current as of 2026-11-23; add `Protocol 30`, `P30`, `Bell`, `65633432` to
     `acceptedSpellings`; add evidence rows (F ledger L and L-1, F Horizon root, A Bell guide);
     `datePolicy` `asOf` 2026-11-23, `recheckOn` "the next Mainnet protocol vote or any later
     Mainnet protocol activation".
   - Cluster notes with a P29-current or Bell-scheduled tail (007, 025, 032, 067, 112, 120, and any
     other reopened cluster with one): append or replace with a dated "Bell/P30 activated on
     Mainnet at ledger 65633432 on 2026-11-23" clause; keep historical dated sentences.
   - **Closure: none**, by the all-or-none rule of PRESTAGE section 6 (no per-entry reason is
     stated anywhere). Every reopened entry stays at `reopen` with no `reSwept` written. Re-run
     `npm run eval:qa:register` after the hand-edits and confirm it is green.
8. **TODO and ledger.** `.agents/TODO.md`: the Bell bullet records the activation and the new
   dates (Software Versions still 2.2a, due 11-30); "Close the register entries the dated runs
   leave open" gets the count of entries this run left at `reopen`. Ledger row 2.1 in
   `.agents/rounds/2026-11-16-next-phase.md`.

## Gates (bare, PRESTAGE section 7)

`npm run eval:qa:compile`; `npm run eval:qa:lint -- --since origin/main --stale --enforce-floors`;
`npm run eval:qa:register`; `npm run eval:qa:sentinels -- --ids mainnet-protocol-30
mainnet-protocol-30-latest mainnet-protocol-30-history next-mainnet-upgrade-vote-absent`;
`npm run eval:selftest`; `npm test`; `npm run secrets:scan -- --tree`. Compare parsed `cases.json`
before and after: only the six edited ids change.

## Stop rule and risks

- Stop at outcome A's edits; no eval, no paid call, no re-judge (stored verdicts on the edited ids
  predate the change).
- A red check twice, or a reviewer that cannot run: outcome X in a fresh commit. CI red or review
  unreconciled at 2026-11-24 20:00 UTC: leave the PR open, blocker at the top of REPORT.md, alert.
- Risk: the lint may require `tags.freshness: scheduled` or a `reverifyBy` on the dormant case for
  its new date; add only if it fails, and say so in EXEC.md.
- Risk: `next-mainnet-upgrade-vote-absent` pattern also matches past rows on a non-upcoming feed;
  the URL is the `upcoming` feed, so it holds while the list is empty.
- Nothing needed from the orchestrator or the owner.

## Review reconciliation (REVIEW.md, Claude Fable `claude-fable-5-2`, high)

Every finding is adopted; these override the steps above where they differ.

1. Sentinel gate ids are comma-separated: `npm run eval:qa:sentinels -- --ids
   mainnet-protocol-30,mainnet-protocol-30-latest,mainnet-protocol-30-history,next-mainnet-upgrade-vote-absent,protocol-upgrades-no-protocol-31`.
2. Quantum case: **append** its corroboration row; leave key fact 0 and corroboration row 0
   untouched (a fact-stage benchmark pins them by digest).
3. Quantum case: set `truth.verified` unconditionally (date 2026-11-23, `by` as above, evidence:
   Horizon root, ledger L and L-1, CAP-0087 header, `rootCause: ["freshness-drift"]`).
4. History list `golden.notes` become one short sentence accepting a later sourced Mainnet tail.
5. Upgrade timing, deviation from PRESTAGE section 4 (its universal SDK rule over-reaches the
   source, which says "not optional this cycle"). The answer's SDK sentence and key fact 3 say that
   SDK upgrade deadlines are set per network by each upgrade's SDF guide, before that network's
   vote, and that none is pending now. Add a class A corroboration row (Bell guide per-network
   deadlines; `https://stellar.org/protocol-upgrades` on upgrading the SDK before the votes).
   REPORT.md records the deviation.
6. The negative "no next vote announced" rests on classes A and B (upgrades page names Bell only;
   newest core tag v30.0.0; the CAP index lists no Protocol 31 CAP) plus the D search; its row notes
   that the status calendar listed no row for the 2026 P26, P27 and P29 votes, so the C read is
   weak. Add a second sentinel on the timing case: `protocol-upgrades-no-protocol-31`, `absent`, URL
   `https://stellar.org/protocol-upgrades`, pattern `Protocol 31\b`, guard `Protocol 30\b`,
   `caseAsOf` 2026-11-23.
7. Cluster-067's note: the quoted history-list `reverifyBy` becomes 2027-03-01.
8. `q-protocol-ledger-close-time` changes `truth.notes` only (`asOf`, `verified`, corroboration
   untouched). Expect about 17 entries left at `reopen`; the TODO gets the count
   `eval:qa:register` actually reports.
9. Dormant UPDATE line adds a sentence that the dormant-rule negative was not re-swept and stays
   dated 2026-11-14.
10. Quantum corroboration row cites the CAP index
    (`https://github.com/stellar/stellar-protocol/blob/master/core/README.md`: CAP-0087 is the only
    ML-DSA CAP; no implemented CAP adds a quantum-safe signer to classic accounts).
11. Cluster clauses are dated world facts only ("Bell/P30 activated on Mainnet at ledger 65633432
    on 2026-11-23."), with no "members agree" framing or statement of what was read.
12. `probe-1.json` is committed in the item folder (public, keyless data inside the write set).
13. Covered by 6.
