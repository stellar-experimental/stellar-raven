# Review: second tuning loop plan

Reviewer: Claude Opus 5.5 (`claude-opus-5-5`), a fresh session, effort high. Author: Claude Fable 5.2
(planner). Orchestrator: Claude Fable 5.2. Tier: Claude Opus, the stable fallback. The Fable tier is
both the author and the orchestrator, so it could not review. Scope: `PLAN.md` at `3fad8fcd`, read
against its brief, the loop 1 record (ledger, `TUNING-PLAN-REVIEW.md`, `STEP-0-PRIME.md`,
`ARM-1.md` to `ARM-3.md`, `ARM-3-REVIEW.md`), `research/audits/2026-11-14-client-text-limits.md`,
the `run-evals` skill, `AGENTS.md` ("Spend and evidence"), and the code the plan cites. No model
call and no spend. I read stored runs for `sets.tuning` ids only, selecting by id before reading
any other field, from the split file whose hash the loop 1 ledger records (`697c550a…`). I read no
held-out or reserve row.

## Verdict: launch after the listed amendments

**P0 can launch once the ledger records its authorization.** It runs `main` unchanged, and nothing
below changes it. The only P0 addition is a read (A3), which happens after collection.

Each amendment must be in the plan or the ledger before the step it gates:

| Gate | Amendments |
|---|---|
| Before the guard wording is frozen and before P1's free checks | A1, A2, A3, A4 |
| Before item 4 is committed | A5 |
| Before P2 is authorized | A7, A8, A9 |
| Before item 5 is built | A6 |
| Optional, saves spend | A10 |

The plan's structure is sound. P0 serves as both the control and the null, each kept run becomes
the next step's control, traced attribution decides moves, and every guessed bar is labelled as a
guess. The serious problems are in item 1, the owner's first priority:

- The guard's home reaches only about half of the claim-bearing answers.
- The Q1 wording lets through self-attested audit claims.
- The read that decides whether the map stays samples the wrong denominator.

## Reproduced numbers

I reproduced these with my own scans under the reviewer's scratchpad. The scans are not committed,
because the implementer's committed scans govern.

| Plan claim | Reproduced |
|---|---|
| CANDIDATE EVIDENCE block on 29 of 79 tuning rows in the baseline | **29 of 79** |
| Block and a claim word together in 12, 6, 6 and 8 answers (32 total); 15 distinct rows, 10 in the panel, 7 of those in two or more runs; the 7 named guard rows | **12, 6, 6, 8 = 32; 15; 10; 7, the same seven ids.** This needs `hack` matched as a word: `hack\w*` also matches "hackathon" and gives 14, 7, 6, 8 |
| Text sizes on `main`: instructions 4,066, BASE 1,899, `search` 1,930, `execute` 2,029, `FAMILY_LINE` 359 | **Same.** Read from the source modules |
| Sizes at the branch tip `b81e7a03`: 4,690, `search` 2,026, `execute` 1,999, `FAMILY_LINE` 441, map `stellarOrg` line 501 | **Same** |
| One tuning row carries `trap: governance` | **Same** (`q-edge-factcheck-soroswap-first-amm`) |

## Findings, ranked, with amendment text

### A1 (high). The guard's home misses about half of the claim-bearing answers, including the audit directory

The CANDIDATE EVIDENCE block does not follow every Scout or Lumenloop call. It renders only when a
call has `caveat: "unverified-match"`, which means a `semantic`, `research` or `av` lane or a
candidate match mode (`src/executor/run.ts:169`, `src/executor/providers.ts:244,282`). It is also
suppressed on build-stage runs (`hasPriorArtPreflight`).

Calls that never carry it include:

- `scout.listAudits`: Scout's audit directory, which is in the `directory` lane. It is the
  canonical operation for the owner's first-priority claim kind.
- `scout.searchRepos`.
- `scout.getRepoTrust`.
- `lumenloop.get_project`.
- `lumenloop.get_document`.
- both `stellarOrg` operations (`corpus` and `detail` lanes).

Stored runs, tuning rows only:

- **Answers with a claim word but no block:** 14 of 26 (baseline), 7 of 13, 6 of 12 and 8 of 16
  (the three panel runs).
- **Of those, answers whose run called Scout or Lumenloop:** 6, 1, 2 and 1. Mostly
  `scout.searchRepos` on application-development rows (`q-soroban-oz-token`,
  `q-nft-vault-contract-standards`).

In those answers the audit wording came from Stellar Docs and was attributed, so the stored record
shows no violation there. The map reached those answers, though, and once the map is gone no served
text would. The removed rule covered every community-sourced row, not only the candidate lanes.

The PRIOR-ART block already says audit status "remain[s] unknown unless the returned evidence
directly establishes" it, so the build-stage suppression is covered.

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

### A2 (high). Q1: "the named party's own document" admits the claims the removed rule existed to stop

The stored record already shows the gap. The counted arm 3 answer
(`q-edge-factcheck-soroswap-first-amm`, `ARM-3.md` section 6) contains two audit statements:

- **"audited by OtterSec", citing the report URL.** The report is the primary record, so this is
  acceptable.
- **"The Medium post also cites Runtime Verification".** Soroswap's own post about its own audit.
  The plan's wording counts it as support, because it is "the named party's own document". The
  removed rule 2 called it community content that needs corroboration.

"Named party" is ambiguous for audits: there are two parties, the auditor and the audited project.
Read as the audited project, the wording turns every self-attested security claim into fact:

- a project's README or blog saying "audited by X";
- a marketing page saying "audited and battle-tested";
- an auditor's client list;
- a post-mortem by the party at fault, stating its own cause and impact;
- an SDF or foundation post asserting a governance outcome that the decision record does not show.

Application developers act on audit claims, so a false "audited" is the costliest fabrication in
this product.

The strict reading, official families only, is also wrong. Stellar Docs holds almost no third-party
audits, so a sourced answer would have to hedge a true fact. The fix is to name the record rather
than the party, and to require attribution, not doubt, for everything else. That attribution form
is the one the section 4 rubric already accepts.

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

### A3 (high). The read that decides whether the map stays has the wrong denominator and reference

1. **Reference.** The 32 stored answers include arm 3's 8 no-map answers. The "with the map, no
   guard" reference is the 24 answers from the baseline, step 0-prime and arm 1 (12, 6 and 6).
   Arm 3's 8 answers form a second reference: no map and no guard. Report both. Also apply the read
   to P0, which gives a reference from the same week on the same judge policy, at no spend.
2. **Scope.** Rule 2 of the map covered every answer. The guard covers only answers whose results
   carry it. Read every answer that contains a claim word, whether or not a block or guard line
   appeared. A violation in an answer with no guard is exactly the gap the map removal opens, and
   it counts against removing the map.
3. **Claim words.** The list has no standards-authorship words and almost no governance-status
   words. Add: `author*`, `approved`, `accepted`, `activated`, `adopted`, `final` near a SEP or CAP
   identifier, `vulnerab*`, `CVE`, `security review`, `bug bounty`. Match `hack` as a whole word,
   not as a prefix, so "hackathon" does not count.

**Amendment, replacing the P1 "No rise in violations" row:**

> | No rise in violations | Violations in P1's claim-word answers (with or without the guard)
> are at most the P0 rate on the same read times P1's count, rounded up, plus one. The stored
> with-map rate (24 answers) is reported beside it | The map stays; the guard is kept if delivered and
> harmless. The "plus one" is a guess |

### A4 (medium). T on 58 rows, and what counts against the map

- **T.** At loop 1's all-rows flip rate (17 of 50, p = 0.34), the one-sided 95th percentile of the
  net on 58 rows is 1.645 × √(58 × 0.34) ≈ 7.3, so T = 8. At the tier-matched rate (0.20) it is
  about 6. The plan's "expect 6" holds only at the lower rate.
- **Denominator.** The map row says "on the 58". Section 2 says the map is judged "on everything
  else". A down that is traced to the guard sentence must not count against the map.

**Amendment, appended to the T bullet:**

> T is computed per comparison from its own n and P0's measured all-rows rate. When P0 cannot give
> a rate (drift), use p = 0.34, not T = 6. Report the tier-matched net and its T beside it. A
> result that reaches T only on all rows, and not on the tier-matched rows, is "no decision".

**Amendment to the P1 "Map" row:** "on the 58" becomes "on the 58 rows, minus rows whose movement is
traced to the guard sentence; n reported".

### A5 (medium). Item 4's `search` opening removes the only family list that OpenCode sees up front

OpenCode lists each tool with 117 characters of its description. Today that text names
`lumenloop.*, scout.*, stellarDocs.*`. After P1, the map is gone. `FAMILY_LINE` sits past
character 117, so OpenCode sees it only through a sandbox `search` call. The plan's draft, "Ranked
search over every exposed operation and skill. …", therefore leaves OpenCode with no up-front
family list, and it would never see `stellarOrg` up front. This is information removed, not a
contract fix.

**Amendment, replacing the `search` bullet in item 4:**

> - `search`: an opening that fits in 117 characters, ends at a sentence end, and names every
>   family, generated from the family list. Draft: "Ranked search over lumenloop, scout,
>   stellarDocs and stellarOrg operations and skills. Hits are cards, not evidence." (116; 104
>   before `stellarOrg`). The test asserts both properties, so a new family that overflows forces a
>   rewording.

The `execute` draft is fine: the globals sentence that follows it names every global.

### A6 (medium). Item 5's trigger fires on tokens that are not identifiers

The trigger uses arm 2's token rule, `/\b([A-Za-z]+)[- ]?(\d+)\b/`, which accepts a space. The
`source` enum includes `audit`, `incident`, `paper`, `release` and `lumenloop` as well as `sep` and
`cap`. Arm 2 is safe, because it also checks the row's source and its URL slug. Item 5 runs before
any row exists, so a query such as "Soroswap audit 2024", "release 23" or "incident 2023" would be
told that `audit 2024` "names a document". That is false, and it would happen in the audit area.

In the stored executes, all 215 SEP and CAP tokens are hyphenated (199) or joined (16). None uses a
space, and no other series appears. The replay therefore cannot see this defect.

**Amendment, appended to item 5's "Run" bullet:**

> The pre-call trigger accepts only a hyphenated or joined token (`SEP-45`, `CAP-0046`, `sep24`),
> not one with a space. Unit cases: `audit 2024`, `release 23`, `incident 2023` and `paper 1` do
> not fire. `audit-2024` fires only if the build records `audit` as a numbered series. The R read
> lists every firing whose series is not `sep` or `cap`, and each one is a defect.

On generality: the pointer is derived from the catalog, not from a list. It changes no ranking, so
it is not a boost. It does have exactly one instance today: one operation of one source. Its keep
result is evidence for that operation only, and the plan should say so in the license table.

### A7 (medium). Q5 is required before P2, not optional

`dev:eval` runs workerd locally, so its `stellarOrg` calls leave from the workstation. If
stellar.org treats Cloudflare Worker subrequests differently, P2 measures a source that production
cannot reach. P2 is the step that spends on the source.

**Amendment, replacing Q5's recommendation:**

> Required before P2 is authorized. With owner authorization, upload a non-production version
> (`wrangler versions upload`, preview URL, no traffic) of the rebased commit. Then run one keyed
> `execute` that calls `stellarOrg.search_site` and `stellarOrg.get_page`, and record the version
> ID. If preview URLs are off and no upload is authorized, label P2's source reading "workstation
> egress". The post-deploy check then becomes a gate: revert the source commit alone if it fails.

### A8 (low). P2's "neither" rows do not differ from P1 by item 4 alone

Every P2 row also sees item 2's always-on text:

- `FAMILY_LINE` +82 characters;
- the `execute` globals sentence +14;
- the schema text +16;
- `stellar.org` in the guard's `<families>`, on any row that carries the guard.

**Amendment, replacing the plan's sentence:** "A row in neither set differs from P1 by the item 4
text and by item 2's always-on description text; its movement is a harm test of both together, and
H3 at T stops the step without assigning cause."

### A9 (low). Length arithmetic after the rebase; one wrong delivery claim

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

### A10 (optional). Spend that decides nothing

P2's two extra passes over the 12 source rows (24 collections, about USD 4.6 and 15 minutes) feed
only the gain figure. The plan says that figure is "reported, not required". The source keep rule
rests on harm, and harm is read on all 58 rows. Cutting them changes no decision. Keep the extra
passes if the orchestrator wants the gain figure for the owner.

P1's extra passes over the guard rows stay, because they feed the violation rule in the owner's
first-priority area. R's passes stay, because R0 needs the denominator.

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

## The plan's own review questions

1. **Overfitting.** No step passes by fitting:
   - the guard wording and the map removal are general;
   - seven cards is one constant;
   - item 4 is structural;
   - item 5 is derived from the catalog (but see A6 on its single instance);
   - the source is the owner's decision, judged on harm.

   Residual risks:
   - the reachability record must not feed back into the adapter (Q4);
   - the A1 placement keeps the guard where application developers get audit facts (repository
     and audit rows), which the plan's placement did not.
2. **Noise.** Traced attribution carries every keep decision. Untraced nets only stop a step.
   T is measured, while its model and the "plus one" are labelled guesses. A4 corrects the expected
   value of T and the denominator. The P1 violation rule is low-powered: about 30 exposed answers
   against a reference rate near zero, so it can only say "no visible rise". The plan should say so
   in the result.
3. **Confounding.**
   - **P1** (guard and map): may share a run. The owner wants the end state, and the guard is
     traceable. A guard-only arm buys nothing. With A4, traced guard rows are removed from the
     map's net.
   - **P2** (source, delivery text, seven cards): may share a run, under A8's corrected reading.
     Moving seven cards to the final kept commit would remove even the small confound at no cost,
     but it would add the same confound to R. Its effect on R's measure is nil, because seven cards
     never surfaces the research lane: 0 of 8 at limits 5, 8 and 10. Either placement is
     acceptable, so keep it in P2.
   - **R** must stay separate.
4. **Item 5.** Covered in A6. It is general in derivation, single in instance, and can mislead only
   through the space-separated token.
5. **The `stellarOrg` landing.** Covered in A7 and A9.
6. **Clients without a runner.**
   - **Safe as contract fixes:** the length and first-line tests, the `execute` opening, and
     dropping a duplicate that something else still delivers whole.
   - **Not safe:** dropping information from the 117 characters OpenCode shows (A5).
   - **Waits for a runner:** answer quality on Codex, Grok and OpenCode, and whether those clients
     pass `limit`.
7. **Held-out discipline.**
   - The plan keeps routing to aggregates and keeps the four named `stellarOrg` cases out.
   - When the branch's TODO bullet is rewritten at the rebase, it must add no further held-out
     ids.
   - The held-out bars are recomputed from P0 before launch. Loop 1's held-out pair moved 34 of 119
     rows (29%), so expect the correct-count bar near 41, not 42.
8. **Spend.** A10 is the one cut that changes no decision.
   - Total with the cut: about USD 67.6 estimated, USD 86 cap.
   - Without it: USD 72.2 estimated, USD 92 cap.

## Limits

- One sample per row per stored run, and keyword scans. The committed scans replace mine.
- To check what the uncovered claims were, I read the audit sentences of two tuning-row answers,
  `q-soroban-oz-token` and `q-nft-vault-contract-standards`, from three stored runs. I also read the
  Soroswap quotes in `ARM-3.md`. The A2 wording was written after those reads and names neither row.
- Cost-per-client figures for seven cards are estimates from Claude Code transcripts. No other
  client's token use was measured.
