# Pass-3 critic: rubric hazards (2026-11-02)

Worktree: `/private/tmp/claude-501/raven-goldens-1102` (branch `eval/golden-audit-2026-11-02`).
Role: read-only critic. I edited no repository file.

Inputs:

- `git diff origin/main` and `git diff HEAD` (pass 3 only; uncommitted) over
  `eval/qa/corpus/battery`, `eval/qa/consistency-register.json`, and `improvements/`.
- The pass-2 critic reports `pass2/critic-rubric.md` and `pass2/critic-entities.md`.
- The pass-3 outputs `pass3/critic-cleanup.*.json`, `pass3/peer-handoff.*.json`, and the saved raw
  sources in `pass3/cc-raw`, `pass3/src-core`, and `pass3/web`.

Pass 3 changed 24 battery cases and 10 `improvements/` files. It added ll-037, ll-038, and sd-077.
It renamed the branch's sd-059 to sd-076, because main's #309 took the number sd-059. The
consistency register has no pass-3 edit.

## Instruments

- `node eval/qa/lint-corpus.mjs --since origin/main --stale` gave exit 1 with 488 errors.
  - 486 errors are expected `caseContentSha256 is stale` errors.
  - `[date-trap] q-edge-fresh-latest-protocol-version: disposition reverifyBy 2026-12-15 does not
    match truth.reverifyBy 2026-11-24`. Pass 3 caused this error (see P2).
  - `[gospel] q-sor-doc-title-discovery: changed gospel requires non-empty
    truth.verified.rootCause`. This is a rebase artifact (see P1).
- `node scripts/improvements-lint.mjs` failed: "improvements/INDEX.md is stale".
- `node scripts/scan-secrets.mjs --tree` was clean.
- A regex sweep of the pass-3 diff and the three untracked findings found no keys or tokens.
- A fixed-string search for the Lumenloop key value found no match in `eval/`, `improvements/`,
  `.agents/`, or `pass3/`. The key value was not printed.
- No keyFact in the battery is longer than 90 characters.
- No `reverifyBy` is before 2026-11-10. Every `scheduled` case has an `asOf` and a `reverifyBy`.
  The most dates on one day is 5.
- Live spot checks on 2026-11-02:
  - `gh api` shows stellar-docs PR #2743 merged 2026-08-13T14:36:09Z and issue #2574 closed
    2026-08-13T15:31:59Z. The new sd-008 rootCause text is correct.
  - The CAP-0081 preamble reads `Status: Accepted` and `Protocol version: TBD`.
  - The saved stellar-core v30.0.0 source confirms the new read-path claim in
    `q-soroban-instance-storage-dos`. `addReads` calls `validateContractLedgerEntry` for each live
    footprint entry. `NetworkConfig.cpp` accepts a contract-data entry-size limit down to the
    2,000 B floor.
  - The saved mpp.dev page says "You can run both protocols on the same endpoint with `mppx`". It
    scopes inline x402 support to "x402-compatible EVM charges". The new MPP note matches it.
  - The saved Lab API Explorer page shows "Horizon is considered deprecated." on its card. The APIs
    overview and the Lab Horizon Endpoints page say "nearing end-of-life". The new
    `q-infra-horizon-vs-rpc` answer sentence matches them.

## Pass-2 critic issues: status

| Issue | Status | Note |
|---|---|---|
| R1 / M2 (`/private/tmp` refs) | Owner decision | The orchestrator rewrites these mechanically. The rewrite needs a target for pass 3 (see P6). |
| R2 / E1 (expired sd-008 cap) | Resolved in cases | Both sentences are gone. The rootCause gives the correct dates (PR 2026-08-13; resolved 2026-08-28). Register cluster-024 is still stale (P2). |
| R3 (caps outside ADR-0008) | Partly open | The origin/main caps are an owner decision. The `q-scf-regional-india` widening is not on origin/main. It is not reverted and not ledgered (P3). |
| R4 / E4 (unfiled findings) | Mostly resolved | sd-073, sls-097, and sd-061 are cited. ll-037, ll-038, and sd-077 are filed and cited. The sls-099 consumer line is fixed. No "not yet filed" text remains. `improvements/INDEX.md` is still stale (P5). |
| R5 / E4 (slender.fi) | Resolved | ll-033 and `q-defi-flash-loans` now label the quote as a class-D cached copy (2026-08-08) and record NXDOMAIN. |
| R6 (re-judge) | Owner decision | — |
| R7 (stable dated content) | Partly resolved | The Yardstick clause moved to the notes with a membership guard. The four cases on main are unchanged and not ledgered (P7). The live-case policy is an owner decision. |
| R8 (score-rationale rootCause) | Resolved | `q-asset-wallet-sdk-seps` `rootCause[0]` now names the avoid that could fire. |
| R9 (shape leftovers) | Resolved, with a new hazard | The YieldBlox keyFact now has one predicate. avoid[1] still gates the 14,000 USDC borrow. Both avoids are answer-visible. One rewrite adds a new hazard (P4). |
| E2 (rebase) | Regressed | The branch is on #315. origin/main now has #317 and #309 on top (P1). |
| E3 (SCF Nov-8 cap) | Resolved | Both round cases use the plain rule. Cluster-011, cluster-081, and trap 2 name only the RFP cases for the do-not-penalize line. |
| E5 (answer dates) | Resolved | The Horizon lifecycle sentence is dated 2026-11-02. The MoneyGram case has a dated either-path note. |
| E6 (cluster-120 reverifyBy) | Resolved in case | reverifyBy is 2026-11-24, and the explicit P30 sentence is present. Register trap 0 is still stale (P2). |
| E7 (bookkeeping) | Open | See P6. |

## New or remaining issues

### P1 (medium): origin/main moved again, and two branch goldens name a retired operation

- `git merge-base HEAD origin/main` is 1539a872 (#315). origin/main is now 5d7a4f88 (#309), on top
  of 8e5fe599 (#317).
- #309 moved stellarDocs to Mintlify. It renamed `get_doc_page_sections` to `get_doc_page`.
- The branch golden text of `q-sor-doc-title-discovery` and `q-sor-doc-page-sections-followup`
  still tells the answer to call `get_doc_page_sections`. After the merge, the judge would grade
  against an operation that the manifest no longer exposes. This also breaks the hard rule on
  non-exposed references.
- Both sides edited these files, so a rebase conflicts:
  - `q-edge-doc-page-sections-soft-empty`, `q-sor-doc-page-sections-followup`, and
    `q-sor-doc-title-discovery`. #309 updated all three for `get_doc_page`.
  - `eval/qa/source-sentinels.json`. #317 replaced `ml-dsa-not-shipped` with
    `mainnet-protocol-29` (caseAsOf 2026-07-11). The branch bumps `ml-dsa-not-shipped` caseAsOf
    to 2026-11-02.
  - `improvements/stellar-docs/sd-003`. #309 marks it fixed-upstream. The branch adds a 2026-11-02
    line that says it is still soft-empty and cites sd-076.
  - `improvements/stellar-docs/sd-009`.
- sd-076 ("search index stale after the Mintlify migration") describes the Algolia index that #309
  removed. Its premise no longer describes Raven. sd-003, sd-072, and `q-infra-horizon-vs-rpc`
  evidence cite it.
- The `q-anchor-endpoint-discovery` and `q-soroban-instance-storage-dos` rootCauses cite hand-off
  files "on branch feat/mintlify-docs-migration". Those files are now on main.
- The `[gospel] q-sor-doc-title-discovery` lint error appears because the diff against
  origin/main reverts #309.
- Fix:
  1. Rebase onto 5d7a4f88. Take #309's `get_doc_page` wording in the three doc-page cases, and
     re-apply the audit's other edits on top.
  2. Take #317's sentinel entry. Bump only the sentinels that still exist.
  3. Reconcile sd-003 with its fixed-upstream state.
  4. Resolve or withdraw sd-076, and update the three citations.
  5. Drop "on branch feat/mintlify-docs-migration" from the two rootCauses.
  6. Run `npm test`, `npm run eval:qa:sentinels -- --check`, and the lint again.

### P2 (medium): pass 3 left the register stale, and one lint error now fails CI

- `dateContingentTraps[0].disposition` still says `q-edge-fresh-latest-protocol-version reverifyBy
  2026-12-15`. The case now says 2026-11-24. The lint reports a `[date-trap]` error, so the CI
  `eval:qa:lint -- --stale` step fails.
- The cluster-024 note says "only q-protocol-27-cap-0071 still carries the older-copy Software
  Versions caution tied to ... sd-008 (fixed 2026-08-18)". Pass 3 removed that caution, so the
  sentence is now false. The fix date is also wrong: the PR merged 2026-08-13, and the finding was
  resolved 2026-08-28.
- The critic-cleanup applier listed both items under `registerStale`. Nobody edited them.
- Fix: change both texts in `eval/qa/consistency-register.json` (trap 0 to 2026-11-24; cluster-024
  to "no member carries the sd-008 caution; all three removed it on 2026-11-02 after the
  2026-08-13 fix"). Then the orchestrator re-stamps the hashes.

### P3 (medium): the widened `q-scf-regional-india` aggregator cap is still in place

- origin/main: "Accurately quoting the canonical LumenLoop source on the Builders Camp as Goa on
  August 14–18, 2026 is not a wrong claim ...; grade caps at partial ...".
- Branch: "... as a Goa edition (its current summary and slug), or with its earlier August 14–18,
  2026 dates, is not a wrong claim ...". Either element alone now earns the cap.
- This text is not on origin/main, so the owner decision on existing aggregator caps does not cover
  it. Pass-2 R3 asked for a revert. No pass-3 task took it, and the ledger does not list it.
- The "earlier August 14–18 dates" trigger has expired. The case's own 2026-11-02 verifier-C
  evidence shows Lumenloop event 1444 with title Jaipur and `start_at` 2026-08-21.
- The cap also conflicts with the case's `avoid[3]`: "Do NOT repeat the stale Goa/July Builders
  Camp description".
- ADR-0008 bars new partial caps for aggregator claims.
- Fix: replace the sentence with a plain rule. An answer that attributes the Goa summary or slug
  to Lumenloop and reports Jaipur, 21–25 August 2026, from the event page is correct. An answer
  that presents Goa as the venue fires `avoid[3]`. Drop the expired date clause.

### P4 (low): a new avoid in `q-scf-open-rfps-live` turns a missing date into a wrong verdict

- New `avoid[1]`: "Do NOT call Q2 2026 RFP briefs open now, or name a current SCF round without an
  as-of date."
- The item joins two predicates.
- The second clause duplicates `keyFacts[1]` ("Includes source links and current round
  as-of/phase/deadline/verifyAt").
- The rubric says a fired avoid makes the verdict `wrong`. So a correct but undated statement that
  #46 is in Submission through 2026-11-09 moves from `partial` (missing keyFact) to `wrong`. The
  earlier text did not carry that penalty for an undated true claim.
- Fix: keep only "Do NOT call Q2 2026 RFP briefs open now." Let `keyFacts[1]` grade the date.

### P5 (low): `improvements/INDEX.md` is still stale

- `improvements:lint` fails with "improvements/INDEX.md is stale". The new ll-037, ll-038, sd-076,
  and sd-077 files are not indexed.
- Fix: run `npm run improvements:index` after the rebase in P1.

### P6 (low): the round record does not hold pass 2 or pass 3

- The ledger `.agents/rounds/2026-11-02-golden-audit.md` has no pass-2 or pass-3 content. Its
  Results section says "Pending". It does not list the owner decisions.
- 18 evidence lines cite "task critic-cleanup" or "task peer-handoff" in that ledger. The ledger
  does not name those tasks.
- `.agents/rounds/2026-11-02-golden-audit/` has `pass1/` and `pass2/` but no `pass3/`. The
  orchestrator's mechanical `/private/tmp` rewrite has no repository target for pass 3.
- `.agents/TODO.md` still has "Resolve the SCF RFP roster conflict in two goldens before
  2026-11-12" with the two-brief state.
- Fix:
  1. Add `pass3/critic-cleanup.json` and `pass3/peer-handoff.json` summaries.
  2. Fill in the ledger Method and Results sections, with the owner-decision list.
  3. Close the TODO item.

### P7 (low): stable-tagged dated content remains without a decision

- Pass-2 R7 named four stable cases on main with dated volatile values. None changed, and the
  ledger does not list them:
  - `q-defi-reflector-oracle` ("As of 2026-07-10, its three public mainnet feeds").
  - `q-defi-wisdomtree-crdt` ("As of 2026-08-26, Stellar metadata identifies issuer").
  - `q-eco-lobstr-wallet` ("As of 2026-09-17, current operator and live directory evidence").
  - `q-eco-dex-saturation` ("As of 2026-07-10, a strict live venue-family review").
- Pass 3 edited `q-anchor-endpoint-discovery`. That case is stable, has `asOf` 2026-11-02, and has
  no reverifyBy. Its notes carry "As of 2026-11-02, SEP-24 v3.8.0 (Active) ... SEP-45 (Draft)".
  The graded rule (SEP-10 or SEP-45) does not depend on the version, so the risk is small.
- Fix: tag these cases `scheduled` with a staggered reverifyBy, or add them to the ledger's
  owner-decision list next to the live-case policy.

## Checked and clean

- New leniency is tied to a named, verified ambiguity:
  - The `q-mpp-discovery-and-modes` keyFact loosens from "adapters and payloads" to "payloads". The
    reason is the dated mpp.dev one-endpoint statement and the mppx Negotiator source. Relabeling a
    payload stays wrong.
  - The `q-builder-content-by-person` partial cap is now a plain source-scoped rule. An inference
    that nothing was published still fires `avoid[0]`.
  - The MoneyGram either-path note names the widget/legacy split. SEP-24 semantics stay gated by
    `keyFacts[3]` and `keyFacts[4]`.
  - The `q-anchor-endpoint-discovery` note explains how `keyFacts[2]` grades behavior. It cites
    SEP-24 discovery through `TRANSFER_SERVER_SEP0024`. An answer that takes endpoints from
    directory metadata still misses the keyFact.
  - The `q-soroban-instance-storage-dos` read-path qualifier is symmetric. Ordinary growth that
    makes an entry unreadable or permanently bricks the contract is still wrong.
- The SCF round rule now matches the RFP siblings in effect. 2026-11-09 meets the deadline keyFact,
  and an attributed November 8 is not wrong but does not meet it. No ADR-0008 cap form remains.
- No pass-3 case adds a partial cap. The only caps changed since origin/main are
  `q-scf-regional-india` (P3) and `q-infra-horizon-vs-rpc`. The `q-infra-horizon-vs-rpc` cap is in
  the ADR-0008 Horizon-lifecycle set, names sd-072, and has an expiry.
- Each new rootCause names an `improvements/` path, `freshness-drift`, or an eval-side authoring
  flaw. None is a score rationale.
- No new pinned disputed value. The `q-scf-sdf-marketing-grant` source conflict is now sd-077, and
  the case does not penalize either attributed wording.
- Secrets: clean (see Instruments).
