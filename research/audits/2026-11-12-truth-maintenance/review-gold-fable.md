# Review: golden edits for the SCF RFP roster (issue #422)

Reviewer: Claude Fable 5.2 lane (`t3qc`). Author: coordinator (`t2dn`). Reviewed 2026-11-12, about
14:40Z to 14:50Z, against `tmp/golden-rfp-matrix.md` (byte-identical to
`research/audits/2026-11-12-truth-maintenance/golden-rfp-matrix.md`). No tracked file was edited.

## Verdict: approve with changes

Every changed claim is supported by the matrix, no disputed or single-lineage value is pinned, and
all three gates pass. Findings 1 to 4 should be fixed before the commit; 5 to 10 are small.

## Gates run

| Command | Result |
|---|---|
| `npm run eval:qa:sentinels -- --ids scf-rfp-q4-roster,scf-rfp-q4-tooling-roster` | exit 0; both `hold`, `matches=1` |
| `npm run eval:qa:lint -- --since origin/main --stale --enforce-floors` | exit 0; `0 error(s), 81 warning(s)`. The only warnings on the six cases are three `sourcing-guard [without-evidence]` warnings on avoid items this diff did not touch. |
| `npm run eval:qa:register -- --check` | exit 0; `[register-helper] up to date` |

Not checked: that `cases.json`, `sample.json` and `lifecycle-registry.json` match a fresh compile.
`compile-qa.mjs` has no check mode and writes tracked files, so I left it to the CI sync check.

## Findings

### 1. Sentinel anchors miss an added brief, and each one covers only half its case (should fix)

Both cases name both briefs, but each new sentinel anchors one title. I replayed the saved page
through the repo's `normalize()` with simulated edits:

| Simulated page change | `scf-rfp-q4-roster` | `scf-rfp-q4-tooling-roster` |
|---|---|---|
| Third brief appended | hold | hold |
| Brief B (XDR/CAP) removed or replaced | hold | drift |
| Brief A (Web and API Analytics) removed or replaced | drift | hold |
| Both removed, placeholder restored | drift | drift |
| Date line inserted before the roster | hold | hold |

So a third Q4 brief raises no issue at all, and a one-brief change flags only one of the two cases
that state the roster. The retired patterns anchored the whole roster and were identical for both
cases. A full-roster anchor restores that. This pattern holds on the live page and drifts in every
add, remove and replace row above:

```
Current Open RFPs [^<]*<details> <summary><strong>Web and API Analytics for Stellar Ecosystem Projects</strong></summary>(?:(?!<summary>)[\s\S])*<details> <summary><strong>XDR/CAP-Coverage Audit Tool and Indexer-Hardening Guide</strong></summary>(?:(?!<summary>)[\s\S])*</details> If you have
```

Use it for both sentinels. The agent-instructions tail is not a problem for either the current or
the proposed anchor: the tail contains neither `Current Open RFPs` nor `<summary>`, and
`Current Open RFPs` occurs once in the normalized page.

### 2. The notes do not say how to grade a Scout-only answer while Scout lags (should fix)

Both primary cases declare the surface `scout.getRfps` and `scout.searchResearch`. Raven's sandbox
cannot read the handbook, so while Scout serves zero open briefs the system under test cannot meet
"Reports which briefs, if any, the official RFP Track page lists as open" or the new "Flags any
disagreement … in either direction". The notes say an attributed, dated Scout empty set "is accurate
about Scout" but stop short of a grade. The `-live` notes go further and require "the disagreement
flagged", which the same answer cannot do. `q-scf-open-rfps-live` already has the right escape in
its key fact: "or flags it unverified".

`golden-truth` asks for lenient grading on both sides of a corpus-versus-world contradiction, plus
an `improvements/` finding. Requested changes:

- In all six notes, state the grade for an answer that dates and attributes Scout's empty set, cites
  `briefRoster.checkedOn` 2026-11-04, and marks the official cross-check as unverified or sends the
  user to the official page. My recommendation is that it meets the roster and disagreement key
  facts.
- In the three `-live` notes, change "with the disagreement flagged" to "with the disagreement
  flagged or the official cross-check marked unverified".
- Record the Scout lag through `improvements-pipeline`, or record in the ledger why it is not filed.
  Stellar Light's own nightly check flagged it at 14:14Z, and Scout still served `open: 0`,
  `checkedOn: 2026-11-04` at 14:44Z.

Without this, the next round scores Scout's lag as a Raven failure, or the judge decides case by
case.

### 3. The reworded avoid item can still fire on a handbook-supported claim (should fix)

New text in `q-scf-rfp-tooling`: "Do NOT claim each brief carries its own community vote."

The false claim worth trapping is that proposals under a brief are chosen by community vote (matrix
row 15: "Submissions are reviewed by 2 reviewers from that quarter’s Category Delegate Panel").
But the handbook does tie the RFP set to a community vote. The Quarterly Governance Process page
(`https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/quarterly-governance-process.md`,
fetched 14:30:26Z) lists "RFPs for priority tooling / protocol gaps" among the updated resources and
then says: "Updated resources go through final SDF legal review as necessary, after which a
quarterly Community Vote on Soroban Governor is launched to formally approve of set changes." An
answer that says the quarter's RFPs are delegate-selected and ratified by a quarterly community vote
is repeating the handbook, and "its own" is a thin guard against a judge firing on it. I did not
verify that a Q4 vote took place.

Suggested wording: "Do NOT claim RFP Track proposals are selected by community vote." That matches
the register note "Only Open uses project-level community voting; Integration/RFP are panel-led".
If the item changes, the "Build entry and decision flow" re-sweep reason needs the same wording.

Dropping the "published bounty" half was right (matrix row 9). The new note, "Both Q4 briefs publish
a budget range; an attributed range is acceptable but not required", pins no figure.

### 4. The two primary cases have no 2026-11-12 `sources` or `corroboration` rows (should fix)

`q-scf-open-rfps` and `q-scf-rfp-tooling` carry rows for every earlier state (2026-09-03, 11-02,
11-05, 11-10). This diff adds none, so the newest corroboration row in each file still reads "On
2026-11-10 the official RFP Track page lists no open Q4 brief", directly under an answer that says
two briefs are listed. The lint does not force the rows here, but `golden-truth` places the matrix
in `truth.corroboration[]`, and these are dated roster claims. Add `confirmed-as-of` rows for:

- the official roster and its publication date: class A page, class B commit `4cc1fae`
  (2026-11-11T19:16:19Z), class D Stellar Light check bracket (matrix rows 1 and 2);
- Scout's zero open briefs and `checkedOn` 2026-11-04, as a source-relative reading (row 10);
- the round state from the Awards page and Scout (rows 12 and 13).

Do not add a `contradicted` row for "no RFP is open": no avoid item mirrors that claim.

### 5. "Both sources" misattributes the round state (minor)

`q-scf-open-rfps` answer: "Both sources show SCF #46 in Initial Review…". The two sources named
before that sentence are the RFP Track page and Scout. The RFP Track page shows no round state; the
official Awards page does (matrix row 13). Write "The official Awards page and Scout both show…".

### 6. The Scout-lag sentence is undated in the two primary notes (minor)

"Scout lags the official page: an undated or unattributed claim that no RFP is open contradicts the
official page…" reads as standing guidance. The lag is a volatile state that its operator has
already detected. Date it ("As of 2026-11-12, Scout lags…"), as the four `-live` notes already do.
Nothing watches for Scout catching up, since both sentinels read the handbook. A third sentinel on
`https://stellarlight.xyz/api/rfps?status=open` anchored to `"checkedOn":"2026-11-04"` would fire
when Scout re-checks; that is optional.

### 7. `q-scf-contract-verification-rfp-live`: new `asOf` without evidence for the core claim (minor)

`truth.asOf` moved to 2026-11-12 and `verified.evidence` was replaced with roster evidence only. The
first notes sentence still says "As of 2026-11-05, Scout returns the Q2 2026 Contract Source
Verification Service row as closed", and nothing in the new evidence covers that row. The claim
holds: at 14:29:36Z `https://stellarlight.xyz/api/rfps?status=closed` returned
`contract-source-verification` as `closed`, `q2-2026`, with `publishedBrief` (`title`, commit-pinned
`url` at `1e04b79`, `checkedOn` 2026-11-04, `functionalRequirements`, `outOfScope`) beside
`technicalRequirements`. Add that line to `verified.evidence`.

### 8. `verified.evidence` hygiene in all six cases (minor)

- "fetched 2026-11-12T14:2xZ" is a placeholder. The fetch was 14:29:35Z, re-read 14:34:36Z.
- The matrix path and "Sibling sweep:" are run together in one string with no separator.
- The sibling sweep omits `q-scf-hummingbot-kelp-closed-rfp`, which the register re-sweeps as
  unaffected.

### 9. Unrelated churn in `eval/qa/source-sentinels.json` (minor, scope)

Three lines outside the two sentinels changed from JSON escapes to literal characters (`✅` to
`✅` twice, `è` to `è`). The parsed values are identical. Revert them so the diff stays scoped.

### 10. Register: one member count is off (minor)

The "SCF program mechanics" cluster has 17 members. Its new reason says "q-scf-current-round,
q-scf-how-to-apply and the other fourteen members are unchanged", which with the two changed members
makes 18. It should be "the other thirteen".

## Confirmed without findings

- **Claims.** Two briefs with exact titles, "published 2026-11-11", "Q4 2026", Scout `open=0` with
  `checkedOn` 2026-11-04, #46 in Initial Review after the 2026-11-09 deadline, no submission window,
  no synthetic `scf-round` row, the current-quarter rule and the rolling interest form: all match
  matrix rows 1 to 3, 10, 12 to 15.
- **Tooling answer.** The XDR/CAP deliverables and "tooling for indexer authors; it does not ask for
  an indexer" match rows 6 and 8. The notes correctly tell the judge not to require a yes/no
  indexing label, so the interpretive part is not gated.
- **Nothing single-lineage is pinned.** No budget figure and no brief-1 eligibility line appears in
  an answer, key fact or avoid item.
- **Unchanged avoid items.** Still true, including "Do NOT claim the official RFP Track page listed
  Q4 2026 briefs on 2026-11-02" (row 16).
- **Key fact change.** "Flags any disagreement between Scout and the official RFP Track page, in
  either direction" is the right generalization; the `-live` and passkey answers got the matching
  two-way wording.
- **Passkey case.** "Neither officially listed Q4 brief concerns passkeys or smart accounts" matches
  row 19.
- **Hackathon evidence.** I re-read `https://stellarlight.xyz/api/hackathons?status=active`
  (`generatedAt` 14:37:46Z): one row, "Blockchain Innovation Challenge powered by Stellar,
  Waterloo", 2026-11-02 to 2026-11-18, active. `?status=upcoming` (14:44:08Z) returned zero rows.
- **Register.** The other four cluster re-sweeps, the two cluster notes and the date-contingent trap
  disposition are accurate. The four `-live` cases belong to no register cluster, so no further
  re-sweep is owed.
- **Ledger.** `.agents/rounds/2026-11-12-truth-maintenance.md` exists (untracked) and is the path
  the cases and register cite.
- **Root cause.** `freshness-drift` is correct for all six.
