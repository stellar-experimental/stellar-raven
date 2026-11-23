# Review of the run 2.1 plan (Bell Mainnet vote, outcome A)

Reviewer: Claude Fable (`claude-fable-5-2`), plan review, read-only. Live re-checks ran
2026-11-23T18:08Z to 18:20Z, keyless (curl of Horizon, RPC, status.stellar.org, GitHub, stellar.org).

**Verdict: outcome A is correct and the plan is sound, with one gate command that fails as written
(finding 1) and seven changes worth making before the edit (findings 2 to 8).** No finding changes
the outcome, a `reverifyBy` date, or the "close none" decision. The plan's committed text does not
break the held-out rule.

## Findings

### 1. blocker: the sentinel gate command fails as written

- Evidence: `eval/qa/source-sentinels.mjs:257` reads one `--ids` value and splits it on commas;
  line 261 throws on any other bare argument. `eval/qa/README.md:313` documents `--ids a,b`.
  Reproduced with the current ids: `node eval/qa/source-sentinels.mjs --ids mainnet-protocol-29
  mainnet-protocol-29-latest` prints `unknown flag mainnet-protocol-29-latest` and exits 1.
- The plan's gate line separates the four ids with spaces, so it exits 1 before any fetch.
- Fix: `npm run eval:qa:sentinels -- --ids
  mainnet-protocol-30,mainnet-protocol-30-latest,mainnet-protocol-30-history,next-mainnet-upgrade-vote-absent`.
  Do not count the space-separated failure toward the "red check twice" stop rule.

### 2. should: append the quantum case's corroboration row; a test pins row 0 by digest

- Evidence: `eval/qa/fact-stage-benchmark.mjs:71-72` pins
  `q-hist-quantum-preparedness-plan.json#golden.keyFacts[index=0]` and
  `#truth.corroboration[index=0]` by SHA-256. `test/qa-fact-stage.test.mjs:89` resolves every
  `claimRefs` entry, and line 192 of the benchmark throws "does not match the claim it names".
- The plan says "Corroboration row" for step 4 without a position. A row inserted first, or an edit
  to row 0, turns `npm test` red.
- Fix: say "append" in step 4, and leave key fact 0 and corroboration row 0 untouched.

### 3. should: update `truth.verified` on the quantum case unconditionally

- Evidence: PRESTAGE section 4, quantum case: "Edit `truth.notes` …, `truth.asOf`,
  `truth.verified` and add a corroboration row." The plan makes it conditional ("changes only if
  the lint requires it"). The lint does not require it: `lintGospelChanges` fires only on
  `question`, `golden`, `tags.freshness` or `tags.trap` (`eval/qa/lint-corpus.mjs:419-425`, 456).
- Result under the plan: `truth.asOf` 2026-11-23 and `reverifyBy` 2027-03-08 beside a
  `truth.verified` dated 2026-11-14 whose evidence reads "current_protocol_version=29" and "Upgrade
  Vote, scheduled_for 2026-11-23".
- Fix: set `truth.verified` as for the other cases (date, `by`, the Horizon root, ledger L and
  CAP-0087 rows, `rootCause: ["freshness-drift"]`).

### 4. should: the history list keeps a judge-facing pending-state note

- Evidence: `q-protocol-version-history-list` `golden.notes` is "Accept a later sourced Mainnet tail
  (for example Bell once activated)." The plan lists `golden.notes` as unchanged. After the edit the
  answer states Bell as activated while the note still treats it as pending.
- Fix: "Accept a later sourced Mainnet tail." The planned `truth.verified` change already covers
  it.

### 5. should: timing key fact 3 states a universal rule the source limits to this cycle

- Evidence: the Bell guide, read 2026-11-23T18:10Z: "The SDK upgrade is not optional this cycle.
  Protocol 30 changes the ledger header format (CAP-88), and an older SDK may fail to decode
  Protocol 30 ledgers." The edge case's own sources hold a counterexample: stellar-core v29.0.0 was
  published 2026-10-05, after the 2026-10-01 Protocol 29 activation, and Protocol 29 had no new
  CAPs. The only corroboration row behind the claim covers Bell ("The Bell guide requires a
  compatible SDK before each network upgrades").
- The plan's sentence and key fact, "SDKs must support a new protocol before that network's upgrade
  vote", come from PRESTAGE section 4, so this is a spec defect the plan inherits. As a key fact it
  marks down an answer that says no deadline is pending.
- Fix (recommended): make it source-relative and say what is true now. Answer: "No SDK-upgrade
  deadline is pending; SDF's upgrade guides set one per network, before that network's vote." Key
  fact 3: "SDF upgrade guides set an SDK-upgrade deadline before each network's vote." Add a
  corroboration row at class A: the Bell guide's per-network deadlines, and
  `https://stellar.org/protocol-upgrades` ("Upgrade to the latest Stellar SDK before the votes").
  Record the deviation from PRESTAGE in REPORT.md.
- Minimum if the PRESTAGE wording stays: add that corroboration row and a `golden.notes` caution
  not to penalize an answer that ties the requirement to an XDR-changing protocol.

### 6. should: the status calendar missed half of 2026's Mainnet votes, and it is the only sentinel behind the negative claim

- Evidence: `https://status.stellar.org/api/v2/scheduled-maintenances.json` (50 rows, back to
  2023-06) lists three 2026 Mainnet votes: X-Ray 2026-01-22, Adapter 2026-09-16 and Bell
  2026-11-23. It has no row for the Protocol 26 (2026-05-06), Protocol 27 (2026-07-08) or Protocol
  29 (2026-10-01) activations.
- So an empty `upcoming.json` is weak evidence for "no next Mainnet protocol vote is announced",
  and `next-mainnet-upgrade-vote-absent` would have held through three of the last six Mainnet
  votes. The Horizon sentinels still catch an activation within a day; the gap is the window
  between an announcement and its vote, up to the 2027-02-22 backstop.
- Fix, two parts:
  - In the negative corroboration row and `truth.verified.evidence`, carry the claim on classes A
    and B (the upgrades page names Bell only; newest core tag v30.0.0; the CAP index lists no
    Protocol 31 CAP) and note that the calendar did not list those three votes.
  - Add a second sentinel on the SDF upgrades page, which is in the write set
    (`eval/qa/source-sentinels.json`): `absent`, URL `https://stellar.org/protocol-upgrades`,
    pattern `Protocol 31\b`, guard `Protocol 30\b`. Run through the repo's `normalize` and
    `evaluate` on the live page: `hold`, 0 matches. If the deadline is tight, record it in the
    TODO instead.

### 7. should: cluster-067's note quotes the history list's old `reverifyBy`

- Evidence: `eval/qa/consistency-register.json:1163`, cluster-067 `note`:
  "q-protocol-version-history-list reverifyBy 2026-11-24." No lint reads cluster notes
  (`lintDateContingentTraps`, `lint-corpus.mjs:399-413`, covers traps only), so it goes stale
  silently.
- Fix: when step 7 edits cluster-067's tail, change the quoted date to 2027-03-01.

### 8. should: state the close-time sibling's scope, and expect 17 entries left at `reopen`

- Evidence: `q-protocol-ledger-close-time` is a member of cluster-017 (12 members) and cluster-065
  (2 members). Neither is in PRESTAGE section 6's expected list. Editing the file reopens both, and
  under "close none" they stay open. The register has 0 entries at `reopen` today, so the run
  leaves 17: the Bell trap, the invariant, and 15 clusters (15 in total if the sibling is left
  alone). The quantum and dormant cases are in no register entry.
- The plan's header says every edited case gets `truth.asOf` 2026-11-23 and a new corroboration
  row; step 6 says `truth.notes` only. If `asOf` moves, the answer still reads "As of 2026-11-14"
  and the plan holds no cadence evidence.
- Fix: say in step 6 that this case changes `truth.notes` only (`asOf`, `verified` and
  corroboration untouched), and put 17 in the TODO. I recommend keeping the edit, as PRESTAGE
  asks. If you drop it, also remove the id from every committed file: the held-out rule lets a
  committed file name only the siblings you edit.
- For the record, the cadence did not change: seven consecutive Mainnet closes at Protocol 30,
  ledgers 65634241 to 65634248 (2026-11-23T18:07:31Z to 18:08:06Z), were each 5 s apart.

### 9. nit: the dormant case moves `truth.asOf` past a negative it does not re-sweep

- Evidence: step 5 sets `truth.asOf` 2026-11-23 and keeps "No primary source defines … as of
  2026-11-14" unswept.
- Fix: add to the planned UPDATE line: "The dormant-rule negative was not re-swept and stays dated
  2026-11-14." Keep the new corroboration row to the activation claim.
- Confirmed: no `tags.freshness: scheduled` or `reverifyBy` is needed. The case is `live`; only
  `scheduled` requires `reverifyBy` (`eval/qa/compile-qa.mjs:120`), and the "as of" check applies to
  `stable` cases only (`lint-corpus.mjs:518`). `test/qa-judge-qpp-dormant.test.mjs` reads the
  eligibility key fact, which the plan does not touch.

### 10. nit: the quantum note's "still future" sentence is kept without a read

- Evidence: `probe.mjs --quantum` reads CAP-0087's status only. The plan keeps "SDF still describes
  a native post-quantum signer for classic accounts as a future change" under a new `asOf`.
- Fix: cite the CAP index in the new corroboration row. Read 2026-11-23T18:19Z,
  `https://github.com/stellar/stellar-protocol/blob/master/core/README.md` lists CAP-0087 as the
  only ML-DSA CAP, and no implemented CAP adds a quantum-safe signer to classic accounts.

### 11. nit: word the appended cluster clauses as dated world facts

- Evidence: cluster-007's note uses "members agree that …". The entries stay at `reopen` and not
  every member was read.
- Fix: append "Bell/P30 activated on Mainnet at ledger 65633432 on 2026-11-23." with no "members
  agree" framing and no statement of what was read.

### 12. nit: `probe-1.json` sits in the item folder

- Evidence: PRESTAGE section 2: "Keep probe output in your scratch folder and quote the rows you
  need in the evidence table." PLAN.md links `probe-1.json` in the item folder.
- Fix: either commit it (public data, inside the write set) or drop the link. Do not leave a link
  to an uncommitted file.

### 13. nit: the absent pattern is case-sensitive

- Evidence: `Upgrade Vote|Mainnet[^"]*Upgrade` matches all seven Mainnet vote rows in the history
  feed and no Testnet row, but not a lowercase title such as "Protocol 31 Mainnet upgrade vote".
  Adding `"flags": "i"` raises history matches from 7 to 13, because Testnet rows mention the
  Mainnet upgrade in their body text.
- Fix: none needed if finding 6's second sentinel lands. Otherwise accept the gap knowingly.

## Checked, no finding

- **Outcome A facts**, re-derived:
  - Horizon root: `current_protocol_version` 30, `core_supported_protocol_version` 30,
    `stellar-core 30.0.0`.
  - Ledger 65633432: `closed_at` 2026-11-23T17:00:06Z, Protocol 30. Ledger 65633431: 17:00:01Z,
    Protocol 29.
  - RPC `getLatestLedger`: `protocolVersion` 30.
  - Bell guide: "November 23, 2026, 1700 UTC —Mainnet upgrade vote."
  - Status feed: upcoming `"scheduled_maintenances":[]`, active `[]`.
  - stellar-core: newest release and tag v30.0.0, published 2026-10-16T21:09:15Z; no v31.
  - CAP-0084, CAP-0087, CAP-0088: titles as the plan quotes, each "Status: Implemented",
    "Protocol version: 30".
  - `https://stellar.org/protocol-upgrades`: the headline quote matches; no "Protocol 31".
  - Software Versions page: still heads "Protocol 29 (Mainnet, October 1, 2026)", so it stays
    with 2.2a.
  - Testnet: first Protocol 30 ledger is 5540313, closed 2026-11-03T17:00:05Z, so "activated on
    Testnet 2026-11-03" is right.
- **Judge-facing texts.** The edge answer and notes, the timing answer's first sentence, the
  history-list answer, key fact 1 and new avoid, and the dormant clause match PRESTAGE section 4
  and the evidence. The four `reverifyBy` dates match PRESTAGE's table.
- **Lint.**
  - Gospel lane: the planned `truth.verified` on the edge, timing, history and dormant cases
    satisfies it.
  - Corroboration: the new timing key fact 3 and history key fact 1 do not match `NUMERIC_RE`, so
    the lint forces no row for them.
  - Invariant "Mainnet protocol activation history": it carries no forbidden values, and existing
    rows on the edge and timing cases already cover its label.
  - Trap: the planned `disposition` quotes equal the planned dates, and the Software Versions
    quote stays 2026-11-30.
- **Register.** CI runs `npm run eval:qa:register -- --check` (`.github/workflows/ci.yml:75`); it
  passes with entries at `reopen` once hashes are stamped. "Close none" follows PRESTAGE section
  6, and the plan states no per-entry reason.
- **Sentinels and the staged test.**
  - The renamed pattern holds on the live Horizon root.
  - The staged test's four assertions evaluate to hold, drift, drift, error.
  - `next-mainnet-upgrade-vote-absent` validates, holds on the live upcoming feed, and returns
    `error` on an empty or challenge body.
  - No other test or doc pins the old ids except `.agents/TODO.md:204`, which step 8 rewrites.
- **Held-out rule.** PLAN.md names only dated cases and the siblings it edits, quotes only the
  `sibling-check.mjs` last line, and gives no per-entry count or reason. See finding 8 for the one
  condition.
