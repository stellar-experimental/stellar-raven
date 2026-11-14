# Review: tuning plan, first loop on the 2026-11-14 baseline

Reviewer: Claude Opus 5.5 (`claude-opus-5-5`), fresh session, on `evals/baseline-2026-11-14` at
`49cc4e8c`. Tier: Claude Opus, the stable fallback. Claude Fable was skipped because it wrote the
plan and runs the orchestrator. Inputs: [`TUNING-PLAN.md`](TUNING-PLAN.md), [`BASELINE.md`](BASELINE.md),
the `run-evals` skill, `AGENTS.md` ("Spend and evidence"), `research/audits/2026-11-14-caps-audit.md`
and its review (`origin/main`), and `research/audits/2026-11-14-mcp-peer-survey.md`
(`origin/research/mcp-peer-survey`). The orchestrator's rulings were inputs: D1 approved, D2 approved
(arm 3 last), and D3 (the orchestrator launches the held-out read with a sealed id list).

Free checks I ran myself, with no model call and no network: a static scan of the stored baseline
(`2026-11-14T20-13-51-variantA`) restricted to `sets.tuning` (79 ids, asserted) before any field was
read, and a noise simulation (described in finding 1). No held-out or reserve row was opened.

## Verdict

**Launch after the listed amendments.** The two mechanisms are general and well aimed, and the plan
is honest about how far each one reaches. But the keep rule as written cannot separate a real change
from verdict noise. On one sample per row it reverts almost any arm, good or neutral (finding 1).
Arm 1 is also compared against the very sample the panel was selected on (finding 2). Amendments A1
to A4 block launch. A5 to A10 should land before the arm they affect.

## Reproduced numbers

| Plan claim | Reproduced | Note |
|---|---|---|
| Ten tuning rows read a page; they averaged USD 0.194 | **Yes**: 10 rows, USD 0.194 all-in (agent plus judge) | Agent cost alone: USD 0.115 against 0.101 (+14%), not +8% |
| Only 2 of the 9 target 1 rows called `scout.searchResearch` (`q-sep-43…`, `q-sep-53…`) | **Yes**, exactly those two | |
| Panel baseline 24 correct, 21 partial, 3 wrong | **Yes** | 48 unique ids |
| 49 of 79 tuning rows ran a Docs search with no page read | **No**: 56 counting all 12 Docs search operations (arm 1's edge set), 50 counting the four generic ones | Arm 1 is exposed on about 71% of rows, not 62% |
| Arm 2's rule fires on 3 tuning rows; 18 other research-calling rows | **No**: research queries name a SEP or CAP id on 6 rows (adds `q-comp-aml-analytics-vendors` "SEP-12 …", `q-edge-asset-site-scam-detection` "… SEP-1 toml", `q-protocol-version-history-list` "… CAP-0056 …"). 25 rows call research | Two of the three added rows are panel controls |

Panel column errors from the same scan: `q-sep6-sep24-sep31-choice` (`search_anchor_sep_docs`, no
page read) and `q-nft-vault-contract-standards` (three `search_docs` calls; its result even carried
an EVIDENCE CHECKPOINT) are marked "no" in the Docs column and are exposed. `q-protocol-tier1-requirements`
called research and is marked "no".

## Findings, ranked

### 1. Blocking: one sample per row cannot carry K1 to K3

**Evidence.** The repo has measured verdict noise before: a 23.3% per-row any-flip rate across three
identical re-judges, 15.6% pairwise (`eval/qa/reviewed/2026-07-super-corpus-baseline.md`), and 23 of 93
rows discordant between two same-surface collections (`.agents/rounds/2026-10-07-tool-surface-qa.md`,
a diagnostic only). Those use older rubrics, but nothing suggests rubric v2.11 is an order of magnitude
steadier. I modelled each row as keeping its verdict or being redrawn from the baseline mix, calibrated
to pairwise discordance of 0.10, 0.16, and 0.25. I applied the plan's rules to the 38 arm-1-exposed
rows (21 non-correct, 17 correct controls) with no real effect at all.

| Discordance | P(K1 met by noise) | P(K2 holds) | P(K3 holds) | P(keep) with no effect |
|---|---:|---:|---:|---:|
| 0.10 | 0.13 to 0.22 | 0.57 | 0.07 | 0.01 to 0.02 |
| 0.16 | 0.17 to 0.22 | 0.41 | 0.01 | under 0.01 |
| 0.25 | 0.17 to 0.19 | 0.25 | 0.001 | under 0.001 |

The model overstates movement on stable rows, so take the outer numbers loosely. The conclusion
holds under any plausible rate. Even if a correct control falls only 5% of the time, the chance
that none of 17 falls is 0.95^17 = 0.42, before the trap rule. K3 and K2 are zero-tolerance counts
over 17 to 45 noisy rows. Down attribution needs only that "the mechanism's text [appeared] in any
result", which arm 1's text does on about 70% of rows. So a neutral arm reverts about 98% of the
time, and a good arm reverts nearly as often, because the noise-driven downs do not depend on the
arm. K1's raw counts are met by noise about one time in five. The rule cannot tell a real change from
a flip. With "two arms in a row revert", the loop would then stop on noise.

The plan's own noise floor (arm 2's same-surface rows) arrives only after arm 1 is decided.

**Cheapest fix.** It costs nothing in model calls: make attribution causal in both directions, as
the plan already does for "up". Add one same-surface repeat (A2), which also fixes finding 2. Do not
enlarge the panel. Cost scales with rows, and traced attribution removes most of the noise for free.

**Amendment A1** (replace the "in the path" bullet and K1 to K3 in section 2, "Pass rule"):

> - **traced**: a row's change is traced to the arm when the review finds the cause in the
>   after-transcript. Up: the answer now states the fact the review found missing, and that fact's
>   text is in a result the mechanism produced (arm 1: a `get_doc_page` read that followed the
>   detail sentence; arm 2: a row flagged exact). Down: the new wrong claim, or the lost fact,
>   traces to the same kind of result, or to a call the mechanism's text displaced (the agent read
>   a page instead of a call it made at the step before, and the lost fact came from that call).
>   A change with no traced cause is a noise observation. Record both verdicts. It counts neither
>   for nor against the arm.
>
> | # | Rule | Reverts when |
> |---|---|---|
> | K1 | **More correct.** At least two different rows go up, traced, and traced ups outnumber traced downs. | Fewer than two traced ups, or not more traced ups than traced downs |
> | K2 | **No new wrong answer.** No row becomes `wrong` by a traced down. | One such row |
> | K3 | **No control regression.** No control goes down by a traced down, and every trap row passes its trap. A trap failure is reviewed from the transcript. One that the review classifies as a judge artifact, under the skill's triage table, is recorded and does not revert | One traced control down, or one trap failure that is not a judge artifact |
> | K5 | **Untraced movement within noise.** The untraced net (downs minus ups) over the panel is no larger than the larger of 3 and the net observed between step 0 and step 0′ | A larger untraced net: stop and re-plan, because the arm may act through a path the review cannot see |

### 2. Blocking: arm 1 is compared against the selection sample, under a different judge tier

**Evidence.** The panel's roles come from the stored baseline: targets were picked because they
failed in it, and controls because they passed. Arm 1 is the only arm compared with that same
sample, so regression to the mean pushes targets up and controls down whatever the arm does. Arms
2 and 3 are compared with fresh samples and avoid this. Separately, in the stored run 13 of the 48
panel rows were boundary-eligible for a judge panel. Only 4 were panelled; 9 were single-judged
because the 247-row run hit `--max-panel-cases 34`. A 48-row run under the same cap panels all of
them, so step 0 and step 1 differ in judge tier on exactly the borderline rows. "Record
`judgeTierUsed` on both sides" exposes this but does not remove it.

**Amendment A2** (add to section 2, "Method", before the Step 0 bullet; change Step 0 references in
the four lines, the pass rule, and section 5 step 3 to step 0′):

> - **Step 0′.** Before arm 1, collect the 48-row panel once on the baseline revision
>   (`66301389…`, surface `b336fa14…3404`), under its own authorization, cap USD 12, with exactly the
>   flags every arm run will use. Arm 1 is compared with step 0′, not with the stored run. Step 0
>   against step 0′ is the panel's measured same-surface movement (verdict changes, net downs minus
>   ups, and new wrongs), reported before arm 1 is read. A row that differs between step 0 and step
>   0′ is marked unstable. Its later moves are noise observations unless traced. Step 0′ also serves
>   as the remote-vector re-baseline, so the existing "if the vector moved" amendment folds into it.
> - **Judge tiering.** Every panel run (0′, 1, 2, 3) uses the same `--max-panel-cases`, set so that
>   no boundary-eligible panel row is skipped (48), and the same stability register.

### 3. Blocking: the panel breaks its own selection rules, and drops the audit rows

**Evidence.** The selection rules are stated as mechanical, but the table does not follow them
(see "Reproduced numbers"). Two baseline partials in `soroban`, a priority category, ran a Docs
search with no page read. Under the "priority partials" rule they belong in the panel and are
missing: `q-soroban-vuln-classes` (`search_docs` plus research, with a checkpoint) and
`q-soroban-oz-token` (`search_asset_token_docs`). Section 2 says the opposite: "the ones in the two
priority categories ran no exposed call at baseline." These are the two most audit-centred
application-development rows in tuning. The owner rule says audits matter most. Without them, the
panel's only audit-centred row is `q-soroban-pre-mainnet-security-steps`. Arm 2's "can fire"
column also misses two panel controls (`q-comp-aml-analytics-vendors`, `q-edge-asset-site-scam-detection`)
whose research queries name SEP-12 and SEP-1.

**Amendment A3** (section 2, "The panel"):

> Exposure is computed by one committed, deterministic scan of the stored executes (path recorded
> in the ledger), over `sets.tuning` only. It counts a row as arm 1 exposed when any `stellarDocs.search_*`
> operation was called and `stellarDocs.get_doc_page` was not, and as arm 2 exposed when a
> `scout.searchResearch` query string contains a letters-plus-digits identifier. The table is
> regenerated from that scan. Changes from the current table: `q-sep6-sep24-sep31-choice` and
> `q-nft-vault-contract-standards` become Docs "yes"; `q-protocol-tier1-requirements` becomes research
> "yes"; `q-comp-aml-analytics-vendors` and `q-edge-asset-site-scam-detection` are listed as arm 2
> can-fire controls. Add `q-soroban-vuln-classes` and `q-soroban-oz-token` as priority partials. The
> panel becomes 50 rows (24 correct, 23 partial, 3 wrong), and the per-run cap becomes USD 12.50.

### 4. Blocking: arm 2 labels a citing row as "the document itself"

**Evidence.** The plan's first exactness branch is "the row's `exactKeys` is a non-empty array". The
Scout schema in `catalog/manifest.json` defines `exactKeys` as "the named keys this row carries
verbatim". A row that only cites a CVE, a GHSA id, or an audit finding id carries the key verbatim,
just as `sep-0060.md` cites SEP-43. Under that branch it would be labelled "the document itself:
cite its own text, status, and date". That is the false-identity error the unverified-match guard
exists to stop, and it would hit audit rows, the category the owner ranks first. The
identifier-agreement branch does not have this flaw, because the URL slug must name the document.
Second, research rows are chunks, and agents project them (`content.slice(0,300)` appears in the
baseline). "Cite its own … status, and date" invites a status taken from a chunk that does not
contain the preamble. It also invites a date taken from `publishedAt`, which for a spec file is an
ingest or commit date, not the standard's version date. That is a fabrication path.

The guard is not otherwise weakened. Identifier agreement means "canonical slug plus source", which
`SERVER_INSTRUCTIONS` already accepts as identity. A result with no exact row keeps byte-identical
text, so there is no new absence signal. D1 stands.

**Amendment A4** (section 1, arm 2, mechanism steps 1 and 3):

> - Step 1: delete the `exactKeys` branch from "exact". Rows with non-empty `exactKeys` keep today's
>   label. If upstream later serves a document-identity statement (finding 5's `docKind: "spec"`
>   or an `exactKeys` that covers SEP and CAP identifiers as document identity), that statement
>   replaces the identifier rule.
> - Step 3, the generated sentence becomes: "Exception: `<op>` returned the document the query
>   names by identifier (`<key>`, `<url>`). That row is the document itself, not a candidate. State
>   only what its returned text shows. A status or version line that is not in the returned text is
>   unverified. The other rows stay candidates."
> - Free check 1 adds two unit cases: a row with non-empty `exactKeys` and a non-matching slug (not
>   exact), and a matching row whose content chunk lacks the preamble (exact; the sentence makes no
>   status claim).

### 5. Arm 2 should not buy a 48-row run, and the routing failure should not be the arm

Arm 2's host text is byte-identical on every row where no exact row is returned. That is about 43
of 48 panel rows at baseline behaviour. Running those rows buys only noise. On the 5 rows where it
can fire, one sample each cannot meet K1 except by luck, and the plan admits "a real chance of a
revert on a change I recommend". The change is also a contract correction: the host labels Scout's
canonical document a candidate, for every client. That is wrong whatever the verdicts say. The
routing failure (7 of the 9 rows never reach research) should not be this loop's arm. It is held
under PH3 and PH4, and it is the family decider's target on sealed sets. Tuning it here, on the 7
named rows, is the fitting the owner rule forbids.

**Amendment A5** (replace section 2's arm 2 row in "Which rows each change can affect", the arm 2
part of the K1 paragraph, the "Arm 2 gives the loop its noise floor" paragraph, and section 5 step 4):

> Arm 2 is a contract fix, decided by its free checks plus one targeted behaviour read, not by a
> panel run. After free checks 1 to 3 pass, collect the panel rows whose baseline research query
> names an identifier (`q-sep-43-web-wallet-api`, `q-sep-53-sign-verify-message`,
> `q-pc-sponsored-reserves`, `q-comp-aml-analytics-vendors`, `q-edge-asset-site-scam-detection`).
> Collect each three times on the arm 2 commit, under its own authorization, cap USD 4. Keep arm 2
> when, in at least 2 of the 3 rows where an exact row came back, a majority of repeats use the
> exact row's text (the answer cites it, or states what it shows). The other gate: no repeat states
> a status or date that the returned text does not show, and no control repeat loses its correct
> core answer by a traced down. Otherwise revert. The same-surface noise floor comes from step 0′
> (A2). Arm 3's "with map" side is the arm 1 run (step 1). Rows where an exact row appeared in
> either arm 3 side are left out of arm 3's comparison and reported apart.

### 6. Arm 3 can only remove the map, its panel under-samples where the map acts, and it does not decide the family decider

**Evidence.** Removing the map is a fair test of its value only for Claude Code v2.1.296 or later.
That client reads all 4,066 characters. claude.ai and Desktop drop server instructions entirely
(community evidence, `anthropics/claude-ai-mcp#93`). They already run without both BASE and the map,
so arm 3 says nothing about them. Older Claude Code cuts at 2,048 and sees BASE plus about 150
characters of map. For Codex the vendor advice is to keep the first 512 characters self-contained,
and no cut is stated; the plan's "Codex users would already run without the map" holds only if the
probe confirms a cut. Fresh against fresh on 48 rows, the net (losses minus gains) under no effect
has a standard deviation of about 2.9 to 3.6 rows, with a 95th percentile of 5 to 6. "Keep the map
only if removing it costs more than the flip rate can explain" therefore keeps it only for a loss of
at least about 6 of 48 rows (12.5 points). This is a decision by default, as the caps audit review
already said. The panel was built for arms 1 and 2: 38 of its 48 rows are Docs exposed. The map's
working rules are family-routing rules ("for ecosystem facts … start Scout/Lumenloop"). Those act on
the scf, history, defi, and retail rows and on the 7 target 3 rows, and the panel carries 5 of the
17 tuning rows in those four categories and none of the target 3 rows. The verdict statistic is the
weakest instrument for what the map does. The plan regrade measures family choice directly and
deterministically. Finally, the current map holds the false SEP and CAP authority claims. A null
result on this map cannot bound a rewritten one, so "whether the family decider's arm B has
anything to win" is not something arm 3 decides.

**Amendment A6** (section 2, the arm 3 rule; section 4, the M3 row):

> Arm 3 decides one thing: keep or delete the current micro-map in `SERVER_INSTRUCTIONS` for Claude
> Code v2.1.296 or later. It is a decision by default: the map stays only if removing it costs at
> least 6 net panel rows (the 95th-percentile null net for two fresh runs; recompute it from the step 0 and step 0′
> movement), or lowers required-service coverage in `npm run eval:plan` on 3 or more rows with no
> offsetting gain. A traced trap failure also keeps the map. The result does not license any claim
> about claude.ai, Desktop, Codex, Grok, or older Claude Code. It does not decide whether a rewritten
> map (the family decider's arm B) can win, and it does not settle PR 439 beyond freeing the
> characters. The `search` description's FAMILY_LINE stays in both sides, so the result is the
> map's value on top of it. If the orchestrator accepts the burden of proof on the map without a
> run, under "cost counts", record that and skip the run. Arm 3 can change the outcome only for a
> loss of 6 or more rows.

### 7. Arm 1: right surface, but its sentence conflicts with the checkpoint, and the playground is unaddressed

The recovery graph is the right home. Agents project hits to `title`, `url`, and `snippet` in their
scripts, so a hint inside the result rows would be stripped. A host block after the result
survives. Keeping the detail edge out of `walkRecoveryCandidates` displaces none of the three
alternatives. Rendering it before the unprofiled-operation early return is correct, because the
pointer makes no "narrow lookups only" claim. Three problems remain.

- **Contradiction.** The unchanged next sentence says "If exact evidence already answers the
  request … stop at that scope without extra calls". An agent holding a 300-character snippet will
  call that exact evidence and stop, which is the target 2 failure. The detail sentence has to say
  that a search section is not exact evidence for a specific it does not show whole.
- **Playground.** `src/demo/tools.ts` allows one recovery-advice cycle per turn
  (`recoveryAdviceDelivered`). A detail-only hint after the first Docs search would use it up, and
  that would suppress a later cross-family alternatives hint. The playground also has 3 execute
  calls, so a page read costs a third of them. The "must not change" list covers the call budget,
  not this.
- **Over-reading and cost.** The sentence fires on about 71% of rows, many already correct. Page
  results are large. The execute boundary (6,000 tokens) will truncate some, which adds artifact
  reads and turns. The baseline's page-reading rows cost 14% more in agent cost, though that figure
  is confounded by selection. K4 names no threshold.

**Amendment A7** (section 1, arm 1, step 6; "It must not change"; K4; K0):

> - Step 6 draft: "`<source ops>` returned sections of pages, not whole pages. A section is exact
>   evidence only for what it shows whole. Before you state a list, number, formula, code, or
>   status it does not show whole, read the page: `stellarDocs.get_doc_page({ path })` with that
>   hit's `path`." The wording is frozen and committed before free check 4, and is not changed
>   after any target transcript or golden has been read.
> - "It must not change" adds: in the playground, a hint whose only content is detail targets does
>   not use the turn's recovery-advice cycle. A test proves that an alternatives hint after it is
>   still shown.
> - K0 for arm 1: among panel rows where the detail sentence appeared, at least half read a page
>   afterwards (the stored tuning rate is 10 page reads among 66 Docs-searching rows). A rise from
>   0 of 9 targets is not enough, because chance alone gives at least 1 of 9 about 70% of the time.
> - K4 for arm 1 also reports results that reached the execute boundary and artifact reads per
>   answer. The orchestrator flags the arm when cost per answer rises more than 20%, or median turns
>   rise by more than 1, on rows whose verdict did not change.

### 8. The held-out reading is a coin flip

**Evidence.** Under no effect, with discordance 0.16 to 0.25, "ship when correct ≥ 37 and
wrong ≤ 10" passes about 41% of the time. With a real gain of 3 corrects it passes about 53%, and
with 6 about 60%. It cannot tell improvement from noise, and it holds a neutral surface 59% of the
time. A one-sample held-out read can serve as a harm check, nothing more. Under no effect, the 5th
percentile of correct is 31 to 32, and the 95th percentile of wrong is 14.

**Amendment A8** (section 2, "Held-out counts", the reading paragraph):

> Reading, fixed now: the held-out read checks for harm, not for gain. Ship the kept changes unless
> wrong is at least 15 or correct is at most 31. Together these hold a neutral surface about 6 to
> 10% of the time. The launcher also prints paired counts against the stored baseline, as a
> diagnostic: rows up, rows down, rows that became wrong, rows that left wrong. It prints no ids.
> No held-out result is described as an improvement. Run the read when at least one arm is kept,
> including arm 2 kept as a contract fix (A5).

### 9. Held-out and tuning hygiene

The plan's sealing is sound: D3, a sealed id list, counts only. Three gaps remain. (a) Free check 2's
replay and my scans read the stored baseline file, which also holds the 168 held-out and reserve
transcripts. (b) The held-out results file will sit in `eval/qa/results/`, which register and plan
scripts glob. (c) The implementer reads each target's missing facts (free check 4) before arm 1's
wording is final.

**Amendment A9** (section 2, "Held-out counts", and arm 1 free check 2):

> Every script that reads a stored results file selects rows by `sets.tuning` id before it reads
> any other field, and asserts 79 (or the panel size). After the held-out read prints its counts,
> the launcher moves the results file out of `eval/qa/results/` into a sealed path outside the
> repository, records its SHA-256 in the ledger, and no register or plan script is run on it. Arm
> 1's sentence and arm 2's sentence are committed before any free check that reads a golden or a
> missing fact. The reviewer of each arm's diff checks that neither changed afterwards.

### 10. Spend: what can be cut without changing a decision

- **Cut arm 2's 48-row run** (USD 8.80, 30 min). Replace it with A5's 5-row × 3 read (about USD 3,
  10 min). The other 43 rows see byte-identical text.
- **Add step 0′** (USD 8.80, 30 min, A2). Without it, arm 1's decision has no valid control.
- **Arm 3** can be cut if the orchestrator accepts that the burden of proof is on the map (A6). It
  changes the outcome only for a loss of 6 or more rows. I would keep it as cheap insurance before
  deleting 2,165 characters from every client's instructions. It is the cut to make if the weekly
  limit is tight.
- Net loop estimate: step 0′, arm 1, the arm 2 read, and arm 3 come to about USD 31 in panel runs (50 rows at USD 0.183, arm 1 at +10%),
  plus USD 21.80 for the held-out read: about USD 53 against the plan's USD 48. Without arm 3,
  about USD 44.
- Nothing else is worth cutting. Every other check is free.

### 11. Smaller corrections

- **Section "What the free checks added", first bullet.** The 49 should be 56 (all Docs search
  operations, which are arm 1's edges) or 50 (generic searches only). The USD 0.179 comparison is
  USD 0.177 on the 56. Restate the cost delta as +9% all-in and +14% agent-only, confounded by
  selection.
- **Arm 2, free check 3.** "Then the other 18 research-calling tuning rows": 25 rows call research
  in total. Run all of them. Expect an exact row also on SEP-12, SEP-1, and the CAP ids in
  `q-protocol-version-history-list`, if Scout returns those files.
- **Section 3, "Disjoint text".** Arm 2's sentence (cite the SEP row) and the map's authority rule
  (SEP status needs Docs corroboration) contradict each other in arm 2's measurement. Note it as a
  known confound of arm 2 under the map. Arm 3 removes it.
- **Section 5, step 6.** "Two arms in a row revert → stop and re-plan" should count only reverts
  under the amended rule. Under the original rule this stop would fire on noise.

## What I did not check

- I did not run the code gates. The plan changes no code.
- I did not read target transcripts beyond their `execute` scripts and checkpoint text.
- The noise model is a simple redraw model calibrated to dated, older-rubric measurements. Step 0′
  replaces it with this panel's own measurement.
- I did not verify the live production read in the plan's section "How a SEP or CAP row can be
  recognized".
