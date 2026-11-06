# Independent Scout golden review — 2026-11-05

Reviewer: Docs lane, Astra high, hc t2dv; author: Scout lane t2dw. **PASS: all12 authored case diffs reviewed against fec1c79f. No blocking findings.** Eight gospel corrections and four provenance-only confirmations match independently fetched sources. Register reconciliation is a separate root-owned follow-up, not covered by this case-diff approval. No shared corpus/register edits by reviewer.

## Independently established facts

Fresh independent public receipts are in `tmp/truth-2026-11-05/docs/independent/` and `tmp/truth-2026-11-05/docs/golden-review/`. Original finding re-execution is documented in [upstream-independent.md](upstream-independent.md). These reads preceded the golden author's final edits.

- **RFP roster:** `https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/rfp-track.md` and raw `https://raw.githubusercontent.com/stellar/scf-handbook/main/scf-awards/build-award/rfp-track.md` say Q4 briefs coming soon, with no named current brief. Live `https://stellarlight.xyz/api/rfps?status=open` agrees: open0, closed16, q4-2026, one synthetic round46 row. `?quarter=q3-2026` returns both former briefs closed; `/ideas` and both detail pages label Q3 closed. A/B are the same editorial lineage; Scout is the system being checked, not independent editorial corroboration.
- **Round state:** independently refetched `https://communityfund.stellar.org/awards` and `/awards/recxrSMYwAl8vcglg`:46 Submission through November9,45/44 Ended; panel November11–18; notification TBD. Source text has no deadline time/timezone. Default urllib UA403 was retried successfully with an explicit review UA. Live Scout round metadata agrees. Keep historical attributed November8 distinct from current November9, and preserve event-tied November10/11/12 recheck deadlines.
- **Historical source-verification brief:** `https://stellarlight.xyz/api/rfps?q=source%20verification` separates original idea text from publishedBrief. Its linked official snapshot at `https://raw.githubusercontent.com/stellar/scf-handbook/1e04b79973358e3dea58d821ed6419b50c93370c/scf-awards/build-award/rfp-track.md` confirms six SEP58 keys, public/tarball/content-addressed modes, SDF-allowlisted images, Mainnet/Testnet and exclusion of deterministic-Rust research. Reproducible rebuilding itself remains in scope. Closed Q2 is not an open opportunity.
- **Events:** live `/api/hackathons?status=active` returns Waterloo November2–18,15000USD; official `https://uwaterloo.ca/events/events/blockchain-innovation-challenge-powered-stellar` agrees. Istanbul query returns completed RiseIn September19–20,15000USD; `https://www.risein.com/programs/stellar-pro-hackathon` has September18–20 card versus explicit September19–20 prose, which Scout explains. Keep source-relative coverage, not global absence.
- **Funding baseline:** `/api/analyze?dimension=funding` uses nonempty previous581/hash67022e31bd3e0ec7, current582/hashb44bd87c48cd5ef9 and only scopuly added,+217100USD. The reconstruction remains distinct from official awarded/paid figures. Current route rejects invalid baseline hashes/counts and incomplete reads; no production fault injection claimed.
- **Builder coverage:** `/api/builders?limit=200&offset=0`,200,400 produce200/200/1 and401 distinct usernames; all59 Latin America filtered rows occur in that union. These are public eligible rows, not proof that every collection record is public or eligible.

## Prepared consistency checks

Read the current gospel of current-round, edge-current-round, open-rfps, rfp-tooling, open-rfps-live, passkey-rfps-live, rfps-hackathons-live, contract-verification-rfp-live, how-to-apply, submission-lifecycle-deadlines, hummingbot-kelp-closed-rfp, hackathons-active, total-distributed and builder-by-region-latam. Initial snapshots retained locally for parsed comparison.

Register cluster081/085 and the SCF dateContingentTrap contain the old Scout-Q3-lag narrative and require reconciliation with the new cases. Other intersecting cluster IDs:011,027,030,033,040,074,079,091,121,122. Preserve application invitation gating, historical43 results, program caps, funded-project versus submission-membership denominators, and roster versus round distinction. Three existing round sentinels must follow any caseAsOf change: scf-46-submission-deadline, scf-45-ended, scf-46-submission-deadline-edge. All three anchor strings independently confirmed in fresh awards HTML.

The final case review below supersedes the preparation status. Compile/lint/register regeneration remain coordinator-owned; this review did not run paid evals or expand into unrelated corpus topics.

## Final diff verdict

Reviewed the exact12 files listed in [scout-golden-changes.md](scout-golden-changes.md), using parsed before/after JSON against `fec1c79f`, the complete changed gospel, all new source/corroboration/verification entries, and the topical siblings named above.

- RFP cases correctly replace current lag with current agreement, retain source-relative dated absence, distinguish the synthetic round, and do not require invented brief deliverables. Invitation gating remains intact. The two changed Q3 avoid clauses permit genuinely fresh reopening evidence rather than pinning permanent closure. Historical November8 attribution remains distinct from the current November9 deadline.
- Source-verification now chooses `publishedBrief` for official requirements and labels the retained idea separately. The SEP58 scope and deterministic-Rust distinction match the immutable official source.
- Event cases now describe Waterloo active and the upcoming result as feed-relative empty. Independent final GET of `https://stellarlight.xyz/api/hackathons?status=upcoming` returned HTTP200, partial=false, returned0, with fallback channels explicitly scoped to this feed. Independent organizer GET at `https://www.velocityincubator.com/programs-events/the-blockchain-innovation-challenge-powered-by-stellar` returned200 and confirms all University of Waterloo students/November2–18. Our prior independent full-feed receipt contains29 events.
- Funding notes correctly describe nonempty581→582 reconstruction-set comparison, only scopuly/+217100USD, with no inference of newly paid awards. Historical official awarded/paid bases remain dated and unchanged.
- Round and builder cases have no gospel edits. Independent final GETs of `/api/builders?limit=2` and `?q=Strupey` returned200: returned2/total401; then returned0/total0/partialfalse and advisory401/filter miss respectively. No assertion that the person does not exist.

Programmatic diff checks passed for all12: questions, tags and lifecycle unchanged; every reverifyBy unchanged; latest verified evidence/rootCause populated. All keyFacts unchanged. The two round asOf dates remain11-02 and their due dates11-12; all three existing source-sentinel caseAsOf values remain11-02 and match. RFP due dates remain11-10/11-11. No new deadline extension, cap, scoring target or paid measurement was introduced.

Sibling gospel checks found no conflict in how-to-apply, submission-lifecycle-deadlines, hummingbot-kelp-closed-rfp, both hackathon comparison cases, gap-builders-person-empty, regional-india, and builder-by-region-latam. Historical dated directory counts and historical event examples do not assert today's roster. Shared program caps/payment mechanics were not changed.

**Remaining coordination gate:** root must reconcile register cluster081/085 and the SCF dateContingentTrap old-lag narrative, regenerate/stamp impacted clusters, and run required deterministic corpus checks. That pending register diff will receive the separately requested small review. The12 case edits themselves are approved; no author revision requested.

### Reviewed case fingerprints

SHA256 fingerprints bind this approval to the examined file contents. Exact compact machine receipt: `tmp/truth-2026-11-05/docs/golden-review/reviewed-files.json`. Public final-read receipts are alongside it.

| Case | Gospel fields changed | SHA256 |
|---|---|---|
| q-scf-open-rfps | answer, avoid, notes | 6eabfc335e0969db9cf945bd1f25229665dca19f8b19cbd47b3b920d168a1c0e |
| q-scf-rfp-tooling | answer, avoid, notes | 4d5e3891ba78550312e7a4305897a46ed5b281f7a848c3d204dbfcfbe437f189 |
| q-scf-open-rfps-live | notes | 8499d4d257dd614882468fa49c744293a8870496967723680418033b245028ad |
| q-scf-passkey-rfps-live | notes | 1d0eea853b13d69987362f5bc0f4ba13b3f0ada34d14749f3f18e37323ec3646 |
| q-scf-rfps-hackathons-live | notes | e6f91b0c91c1dc5db7b67b9554bced881e7a2c4970a0bc0184797337baa20bea |
| q-scf-contract-verification-rfp-live | answer, notes | 932a5935e9a56a092c786af50a2684a85b28432dc2378fcc0a3dc63f747f6843 |
| q-scf-hackathons-active | answer, notes | 24787b0351b84c216517ac3f5eb964e4178c09338a717f3f1e613168ceec2308 |
| q-scf-total-distributed | notes | 1d6f0ac719af2dbe125659d67d0f83629636d7119d512a6e371111d54b53ee2a |
| q-scf-current-round | none | cb2c10d2a8a6f19861ea56c1ba229e2cbea05cf00ec92afe2d121a56696e2240 |
| q-edge-fresh-latest-scf-round | none | 7406e45cf19d9818b998f43d80bf1b733c5dc085aef422a2dd27549a7d374769 |
| q-gap-leaderboard-project-not-builder | none | 4f53ad02512a451e3b1dd8a69b15e99c79fc4a8e5ef7265502d6d1b5ba535292 |
| q-edge-closed-world-builder-directory-miss | none | 0baf5b657b328b0066500ee74cbf7babf61b6ef51016a567cf6acf37314d85a4 |

## Register follow-up review

Reviewed the SCF/builder subset against `fec1c79f`: clusters011/027/030/033/035/040/074/079/081/085/089/091/121/122/128/134, numeric SCF Submission, and the SCF phase-transition trap. Current081/085 notes and the trap correctly remove present-tense lag while preserving historical attribution. The invariant authoritativeValue/rule/acceptedSpellings/datePolicy and trap trigger/requiredRecheck/caseIds are unchanged. New primary evidence agrees with the independent awards reads. Builder128/134 preserve person/project and source-miss boundaries. No deadline extension or gospel defect found.

Two bookkeeping findings sent to root; register signoff awaits their reconciliation:

1. `cluster-035.reSwept.reason` names an Indexer/Mirror edit absent from its members; the changed member is total-distributed. Use funding reconstruction-set delta with unchanged free/paid research boundaries. Reasons for074/079/091 similarly should name the event-feed correction, not an RFP change absent from their members. Mirror these corrections in register-review.md.
2. Later immutable-reference rewrites made five member stamps stale for two cases: total-distributed in011/035/122/SCFtrap and hummingbot-kelp-closed-rfp in085. The Hummingbot diff changes only historical sls096 local references to its immutable snapshot; the funding source ref similarly becomes immutable sls103. Gospel remains as reviewed. Regenerate/reconcile affected stamps after final reference edits; do not silently accept stale hashes.

The original12-case approval remains valid for gospel. Its raw file hash for total-distributed is superseded by that reference-only edit; the final register check will record current fingerprints. No shared file changes by reviewer.

### Register semantic reconciliation — PASS

Root corrected035 to the funding reconstruction-set delta and074/079/091 to the event-feed update; the revised reasons now describe their actual changed members while preserving paid-operation boundaries, Growth Hack amount bases and program tracks. The semantic SCF/builder review is approved across the18 entries listed above. The numeric SCF value/datePolicy and phase-transition trigger remain unchanged and supported. No dates extended. The earlier reason mismatch is resolved.

The remaining member-stamp refresh is explicitly deferred until root completes all immutable-reference rewrites and reruns the register helper/final check. This does not reopen the approved semantic verdict; it remains a mechanical completion gate. No lifecycle or corpus edits by reviewer. All15 owned hc command terminals were previously removed, and current terminal inventory contains no remaining child of t2dv.

## Bounded wallet rename review — PASS

Independently reviewed the final `q-eco-stellar-wallets-list` addition against the pre-author snapshot. SHA256: `7acc5af8f61dfad090cfde25d627fe1499fe48dcf58bf65d5371bdbf91aa68cf`. The answer, keyFacts, avoid, original notes prefix, November2 asOf and February15 reverifyBy remain unchanged. The dated roster/counts are explicitly historical and are not represented as newly verified.

Our fresh independent Scout receipts establish both Freighter/Varial resolve to slug freighter, name Varial, former-name alias Freighter, October29 rename and varialwallet.com. The public wallet redirect/current official repository agree. Separately inspected the other lane's exact HTTP200 public Lumenloop receipts from November6 01:08UTC: get_project freighter still returns title Freighter, empty other_names and freighter.app; search_directory varial is semantic fallback with ten neighbors and excludes the wallet. This supports the explicit still-open ll032 distinction without broadening the reviewed roster. The three added sources, corroboration and latest-verification record match this bounded scope.

The Hana sibling already dates its domain observation November2 and makes no current Scout rename-lag claim; no semantic edit needed. Wallet addition approved. All owned hc child terminals remain cleaned up; root retains the final register member-stamp and deterministic validation gates.

## Final register completion — PASS

Reviewed register-review.md final appendix and all12 final reopened entries: clusters006/011/012/018/022/029/034/035/085/108/122 and the SCF phase-transition trap. The five wallet clusters006/012/022/029/034 change only their review metadata/member stamps; their existing notes and membership remain intact. Across their members, the sole changed golden is the independently approved wallet note. LOBSTR, operator/network/authorization, award/payment basis, OrbitCDP uncertainty, issuer roles, builder/funding/CLI and dated roster boundaries are preserved. The seven other final entries reconcile only immutable-reference edits after their earlier semantic approval.

Independently checked all73 member stamps across the11 listed clusters: zero mismatches. The wallet file still has approved SHA256 `7acc5af8f61dfad090cfde25d627fe1499fe48dcf58bf65d5371bdbf91aa68cf`. Independently ran `npm run eval:qa:register -- --check`: up to date, exit0, covering the phase-transition trap as well. All previously deferred register mechanics are complete; no remaining finding in this bounded review.
