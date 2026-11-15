# Plan amendments: second tuning loop

Source: [`PLAN-REVIEW.md`](PLAN-REVIEW.md) (Claude Opus 5.5, at the commit that added it). Each
block below is copied byte for byte from that file by line range (the range is named above each
block); nothing is paraphrased. Where this file and the review differ, the review governs.

Orchestrator rulings, 2026-11-15: every amendment A1 to A10 is adopted. Q1 is decided as amendment
A2 (the primary record counts; a party's statement about itself does not). Q2 to Q7 are decided as
the reviewer answers them (appendix). [`PLAN.md`](PLAN.md) is read with these amendments applied.

## A1 (high). The guard's home — review lines 83 to 95

**Amendment, replacing the first paragraph of "Mechanism, guard (commit G)":**

> **Mechanism, guard (commit G).** One generated sentence (A2's wording). It renders at the end of
> the CANDIDATE EVIDENCE block, before any exact-row exception. When that block does not render, the
> sentence renders as its own line after the result whenever the run made an ok call that returned
> rows from a family outside `<families>`. It is not added when the PRIOR-ART block renders, because
> that block carries its own audit clause. Both conditions come from the call ledger, and no
> operation or topic is listed by name. Replay estimate: the standalone line appears on 1 to 3 of
> 50 panel rows per stored run, and on 11 of 79 tuning rows in the baseline.

Change "It must not change" accordingly: the block's own text and its render rule stay as they
are. Add a unit case for a `scout.listAudits`-only run and one for a `scout.searchRepos`-only run.
Free check 2 must report the standalone count as well.

## A2 (high). Q1 wording, cases, rubric — review lines 125 to 168

**Amendment, replacing the quoted guard sentence:**

> Audit, incident, governance and standards-authorship claims are fact only when `<families>` or a
> primary record a result returned (the audit report itself, the standard's own file, the decision
> record) states them. Anything else, including a party's statement about itself (its own audit
> claim, its post-mortem, its marketing), is that source's claim: name the source and date, and do
> not state it as fact.

That is 416 characters with today's `<families>` ("Stellar Docs, a skill"), against the plan's
241. It is about 45 tokens more, on results only. A result is 10,000 to 17,000 characters, so the
difference is negligible. Freeze it under the plan's own rule (frozen before any stored answer is
read by the implementer). I wrote it after reading the arm 3 record and two answers' audit sentences
(section "Limits"). It names no case and no source.

**Cases the guard and the read must still catch** (unit fixtures for the replay, and rubric
examples):

1. A project's own claim that it was audited (README, blog, Medium post, marketing page), stated
   bare.
2. An audit report used beyond its scope: a report on one version, commit or contract, stated as
   "P is audited" for the current product.
3. A post-mortem by the party at fault, with its cause or impact stated as fact.
4. An incident, exploit or hack taken from a Lumenloop article or a Scout research row and stated
   bare.
5. A governance status from community content ("approved", "accepted", "ratified", "activated")
   with no standard file, Docs page or meeting note behind it.
6. Standards authorship taken from a community row, with no header in the standard's own file.
7. "No audit" or "never exploited" taken from candidate rows. The existing block already covers
   this ("not … absence proof"); keep it in the fixtures.

**The guard must not catch** an audit statement that cites the report a result returned, with its
auditor and date. That is the OtterSec line.

**Rubric amendment (section 4, "Governance and attribution read").** Replace the support classes
with:

1. an official family;
2. the primary record, returned in a result;
3. a party's statement about itself;
4. candidate rows only;
5. none.

A violation is a bare statement whose support is class 3, 4 or 5. Keep class 3 in its own column,
so the orchestrator can see what the Q1 choice changes without a second read.

## A3 (high). Denominator and reference — review lines 185 to 190

**Amendment, replacing the P1 "No rise in violations" row:**

> | No rise in violations | Violations in P1's claim-word answers (with or without the guard)
> are at most the P0 rate on the same read times P1's count, rounded up, plus one. The stored
> with-map rate (24 answers) is reported beside it | The map stays; the guard is kept if delivered and
> harmless. The "plus one" is a guess |

## A4 (medium). T on 58 rows — review lines 200 to 207

**Amendment, appended to the T bullet:**

> T is computed per comparison from its own n and P0's measured all-rows rate. When P0 cannot give
> a rate (drift), use p = 0.34, not T = 6. Report the tier-matched net and its T beside it. A
> result that reaches T only on all rows, and not on the tier-matched rows, is "no decision".

**Amendment to the P1 "Map" row:** "on the 58" becomes "on the 58 rows, minus rows whose movement is
traced to the guard sentence; n reported".

## A5 (medium). `search` opening — review lines 218 to 226

**Amendment, replacing the `search` bullet in item 4:**

> - `search`: an opening that fits in 117 characters, ends at a sentence end, and names every
>   family, generated from the family list. Draft: "Ranked search over lumenloop, scout,
>   stellarDocs and stellarOrg operations and skills. Hits are cards, not evidence." (116; 104
>   before `stellarOrg`). The test asserts both properties, so a new family that overflows forces a
>   rewording.

The `execute` draft is fine: the globals sentence that follows it names every global.

## A6 (medium). Item 5 trigger — review lines 239 to 247

**Amendment, appended to item 5's "Run" bullet:**

> The pre-call trigger accepts only a hyphenated or joined token (`SEP-45`, `CAP-0046`, `sep24`),
> not one with a space. Unit cases: `audit 2024`, `release 23`, `incident 2023` and `paper 1` do
> not fire. `audit-2024` fires only if the build records `audit` as a numbered series. The R read
> lists every firing whose series is not `sep` or `cap`, and each one is a defect.

On generality: the pointer is derived from the catalog, not from a list. It changes no ranking, so
it is not a boost. It does have exactly one instance today: one operation of one source. Its keep

## A7 (medium). Q5 required before P2 — review lines 256 to 262

**Amendment, replacing Q5's recommendation:**

> Required before P2 is authorized. With owner authorization, upload a non-production version
> (`wrangler versions upload`, preview URL, no traffic) of the rebased commit. Then run one keyed
> `execute` that calls `stellarOrg.search_site` and `stellarOrg.get_page`, and record the version
> ID. If preview URLs are off and no upload is authorized, label P2's source reading "workstation
> egress". The post-deploy check then becomes a gate: revert the source commit alone if it fails.

## A8 (low). P2's neither rows — review lines 273 to 275

**Amendment, replacing the plan's sentence:** "A row in neither set differs from P1 by the item 4
text and by item 2's always-on description text; its movement is a harm test of both together, and
H3 at T stops the step without assigning cause."

## A9 (low). Length arithmetic; delivery claim — review lines 279 to 294

- **Length arithmetic.** At the branch tip, `execute` is already 1,999 characters with `stellarOrg`
  added: the branch dropped the opening namespace list, as item 4 does. The plan's 2,008 adds +14
  to item 4's 1,994 on `main`, so it counts the same trim twice.
  - Margins after each step:
    - `main`: instructions 4,066 (30 under 4,096), `search` 1,930, `execute` 2,029 (4 under
      2,033).
    - After P1: instructions 1,899 (134 under 2,033), and the descriptions unchanged.
    - After the rebase: measure the rebased text. Expected: `search` about 1,951 and `execute`
      about 1,994 or less.
    - After item 5: nothing changes in instructions or descriptions.
  - **Amendment:** the implementer records every length from the assembled Worker at each step
    (as `ARM-3-REVIEW.md` did), and the 2,033 test governs. No length comes from adding
    differences.
- **Delivery claim.** "Grok receives the instructions whole for the first time" is wrong. BASE
  (1,899) already arrived whole inside Grok's 2,033 cut. What changes for Grok is that the
  truncated map fragment and the `… [truncated]` marker go away.

## A10 (optional). Spend that decides nothing — review lines 298 to 304

P2's two extra passes over the 12 source rows (24 collections, about USD 4.6 and 15 minutes) feed
only the gain figure. The plan says that figure is "reported, not required". The source keep rule
rests on harm, and harm is read on all 58 rows. Cutting them changes no decision. Keep the extra
passes if the orchestrator wants the gain figure for the owner.

P1's extra passes over the guard rows stay, because they feed the violation rule in the owner's
first-priority area. R's passes stay, because R0 needs the denominator.

## Appendix: the reviewer's answers to the orchestrator's questions — review lines 306 to 376

## The orchestrator's specific questions

**Map removal on one Claude Code panel when Grok and OpenCode also read the map.** The license
differs by client:

| Client | What it receives today | What removal licenses |
|---|---|---|
| Grok | BASE whole, plus the map's header and a partial Lumenloop line ending "… [truncated]". It has none of the authority rules | Removal is a pure delivery improvement, licensed by the probe alone |
| Codex | The map only inside `ALL_TOOLS`, and only when the model prints it | Unaffected in context |
| OpenCode | The whole map, and the map is its only up-front family scope (see A5) | Loses rules 1 and 3 (routing preferences) unmeasured. Rule 2 reaches OpenCode through results once A1 lands, which is better coverage than any client had before |

Removal is defensible under the forward-only rule as a product decision. It must not be read as
measured on OpenCode. Add this line to the license table, row "Map removed", OpenCode column:

> Loses routing rules 1 and 3 unmeasured. Family scope up front only via the `search` opening (A5).
> Rule 2 via results (A1).

**Q1.** Reject the wording as written and accept A2. A2 is narrower than the plan's wording and
broader than the old official-families-only rule: the primary record counts, and a party's
statement about itself does not. The plan's wording lets through, as fact:

- self-attested audits, such as the Runtime Verification sentence in the stored record;
- post-mortems by the party at fault;
- marketing pages and auditor client lists;
- foundation posts asserting governance outcomes.

The removed rule stopped all of these. A2 keeps them out as fact and still lets a report-backed
audit statement stand. That removes the over-hedging the plan worried about. Combined with A1, the
guard also reaches `scout.listAudits` and Scout repository rows, which the plan's placement misses.

**Q2.** Ship seven cards on the free evidence. Inside P2 is acceptable.

- **Cost per search for other clients.** A card is 1,048 characters (median) or 1,122 (mean) over
  the stored searches. Two more cards add about 2,100 to 2,250 characters, roughly 550 tokens, to
  every default-limit search. That is a third more than the median default page (6,461 characters;
  maximum 9,813).
- **Cost per question.** For a client that never passes `limit`, this is about 1 to 3% of input
  tokens per question once rereads are counted. That is an estimate: no client but Claude Code is
  measured. It stays under M1's 5% bar, under Grok's 20,000-byte clip, and under Codex's
  10,000-token print budget.
- **Confounding the source reading.** Only slightly. The default limit applied on 1 of the 12
  source rows in the baseline, and on 1, 0 and 0 of the 4 panel source rows in the three panel
  runs. The plan's "both sets count for neither" rule removes those rows, so the source reading
  loses 0 to 2 of 36 passes.
- **Leakage.** The routing evidence for seven cards (11 of 182 legacy rows) is an aggregate over
  rows that include the off-limits duplicates. The ruling allows that, but the held-out read is
  then not independent evidence for item 3. The plan already claims no improvement, so this costs
  nothing; record it.

**Q3.** Yes, with A6. The pointer changes `execute` results only, so `search` hits, order,
`recovery`, the PH3 box and the routing rows are untouched.

**Q4.** Yes. The panel rule is deterministic over `sets.tuning` and selects by golden source URL,
which is case metadata, not golden content. Two notes:

- The 8 added rows have no sample on the current surface before P0, so the null is measured on the
  50 shared rows only. T for 58 rows follows A4.
- The reachability record reads golden-cited URLs. After it is read, the `stellarOrg` adapter,
  scorer and descriptions are frozen at the rebased tip. Any later change reopens the off-golden 40
  as its acceptance test, never the 12 rows.

**Q5.** Yes, and required before P2 (A7).

**Q6.** Agree: do not re-home it now. If P2 shows intrusions, put the "not for protocol behaviour"
scope in the `stellarOrg` results rather than in a description. Results are not scored, so the
scorer does not read "protocol" as a positive token there.

**Q7.** Keep the order. Without the map, `q-sep-43-web-wallet-api` lost its research call, the one
plausible map effect. Report each run's research-call share on the 17 identifier rows in P0 and P1
as a free transcript count. R0's bar then stays above both 33% and the P1 share, whichever is
higher.
