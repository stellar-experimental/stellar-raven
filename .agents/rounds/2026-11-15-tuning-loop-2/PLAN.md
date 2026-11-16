# Tuning plan: second loop

Planner: Claude Fable 5.2, lane `loop2-plan`, branch `tune/loop-2` from `origin/main` at `0a603453`.
Reviewer: Claude Opus 5.5. Implementer and run lane: Claude Sonnet 5.5. Brief:
`briefs/loop2-plan.md` (deleted at closure). Inputs: the loop 1 record in
[`../2026-11-14-baseline-tuning/`](../2026-11-14-baseline-tuning/), the four 2026-11-14 audits in
`research/audits/`, `feat/stellar-org-source` (PR 439), the `run-evals` skill, and `AGENTS.md`.

This plan changes no code and ran no model. Its counts come from scratch scans of the four stored
loop 1 runs, read for `sets.tuning` rows only (79 or 50 ids, selected by id before any other
field), from the case metadata of those rows (question, tags, `surface`, source URLs; no golden
answer or key fact was opened), and from one free replay of stored `search` queries. The
implementer commits each scan before a number from it is used; if a committed scan disagrees with a
count here, the scan governs and the difference is reported.

## The four lines

1. **Decision.** For each of the five owner items: keep or revert the change, or leave the case
   red. At the end: ship the kept set, or hold it. The steps are P0 (control), step 1 (the guard,
   then the map), step 2 (the `stellarOrg` source, the delivery fixes, seven cards), step 3 (a
   pointer to the document a call names by identifier).
2. **Smallest run.** Three collections of one fixed 58-row tuning panel (P0, P1, P2), each later
   one with two more passes over the rows its step targets, and one targeted read of 17 rows for
   step 3. Claude Sonnet 5.5 answers, the pinned judge grades. One client: the QA runner drives
   only Claude Code, and section 6 says what that leaves undecided for the other three. Two items
   get no run of their own, because free checks show a paid run cannot decide them: seven cards
   (section 1, item 3) and the delivery text (item 4). One held-out read at the end, counts only.
3. **Stop rule, cap, estimate.** Each run is one collection and one reading. A step that misses
   its rule is reverted and is not run again; no variant is tried. Estimates use loop 1's measured
   USD 0.183 to 0.195 per panel case and 0.21 per held-out case: P0 USD 11.0 (cap 14.5), P1 14.1
   (cap 18.5), P2 15.6 (cap 20.5), step 3 6.5 (cap 8.5), held-out 25.0 (cap 30). Total estimate
   USD 72, caps USD 92. A changed pin, a cap, or a rate limit stops a run: report what completed,
   do not resume, do not re-judge.
4. **Review coverage.** In every panel run: each row whose verdict or wrong-claim list changed
   (both transcripts), each row of the step's target set (every pass), every trap row, the
   governance and attribution rows (section 4), and every fifth unchanged row in panel order. The
   rest are named as unreviewed. Held-out rows: counts only, never opened.

Subscription spend on Claude models only, under the owner's approval in the loop 1 ledger. Each
paid run needs its own authorization line in the ledger before launch, and each step's diff gets
an independent review before its run.

## What the free checks found

These change the shape of the loop, so they come before the items.

- **The guard has a home that already says half of it.** The CANDIDATE EVIDENCE block
  (`src/policy/evidence-checkpoint.ts`, `candidateEvidenceBlock`) follows every `execute` that made
  a semantic, research, A/V or fallback-directory call. It says the rows "are candidates, not
  identity or absence proof", asks for "an exact identity or canonical slug plus source and date",
  and says to "keep any non-verification source-scoped". It does not say that an audit, incident,
  governance or standards-authorship claim needs more than that. Those four claim kinds are the
  map's rule 2, and no other served text carries them.
- **Where the guard can act.** The block appeared on 29 of 79 tuning rows in the stored baseline
  and on 32 rows in at least one of the four stored runs. In 32 stored answers (12 baseline, then
  6, 6 and 8 in the three panel runs) the block appeared and the answer used an audit, incident or
  governance word. That is 15 distinct rows, 10 of them in loop 1's panel, 7 of those in two or
  more runs. One tuning row carries the `governance` trap tag.
- **SDF-site facts.** 26 of 79 tuning rows cite a `stellar.org` page among their golden sources;
  12 cite a page outside `/blog`, `/press` and `/events`, which is what the new source serves. Four
  of the 12 are in loop 1's panel. **None of the four cases that `SORG.md` and the branch's TODO
  name as "affected" is in `sets.tuning`**, so no lane may run or open them.
- **Agents already put the identifier in a call and still skip research.** `scout.searchResearch`
  declares a `source` filter whose enum includes `sep` and `cap`. In each stored run, 15 to 18
  rows have an `execute` string that names an identifier whose letters are one of those enum values
  (`SEP-45`, `CAP-46`), and in 12 or 13 of them no `execute` that names it also calls research.
  Every tuning row whose question names such an identifier also put it in a call string.
- **The search default binds on about a fifth of searches.** Claude Sonnet 5.5 passed an explicit
  `limit` (8 or 10 in nearly every case) on 56 of 68 stored `search` calls in the baseline, and on
  34 of 46, 35 of 43 and 40 of 49 in the panel runs. A default-limit search occurred on 11 of 79
  rows, then 12, 8 and 8 of 50. Replayed at 5 and 7, the larger page adds an operation from the
  case's `surface` list on 1 to 3 rows per run, and on at most one row per run was that row not
  correct with no `surface` operation called.
- **Text sizes.** On `main`: instructions 4,066 characters (BASE 1,899), `search` 1,930, `execute`
  2,029, `FAMILY_LINE` 359. At the tip of `feat/stellar-org-source`: instructions 4,690, `search`
  2,026, `execute` 1,999, `FAMILY_LINE` 441; the map's `stellarOrg` line is 501 characters. Grok
  cuts each field at 2,033.

## 1. The five items

### Item 1: the corroboration guard, then the map (step 1, one run: P1)

**Mechanism, guard (commit G).** One generated sentence at the end of the CANDIDATE EVIDENCE block,
before any exact-row exception:

> An audit, incident, governance, or standards-authorship claim is fact only when `<families>` or
> the named party's own document states it. From a candidate row alone, attribute it to that row's
> source and date and call it unverified.

`<families>` is generated from a short list in `scripts/catalog-data/source-families.mjs`
("Stellar Docs, a skill" today) through `scripts/build-micro-map.mjs` into `src/mcp/micro-map.ts`,
so that item 2 adds `stellar.org` by data. About 245 characters, on results that carry the block
only. The wording is frozen and committed before any free check reads a stored answer, and is not
changed afterwards. Open question Q1 is whether "the named party's own document" stays.

Files: `source-families.mjs`, `build-micro-map.mjs`, `src/mcp/micro-map.ts` (generated),
`src/policy/evidence-checkpoint.ts`, `test/evidence-checkpoint.test.ts`, `test/exact-evidence.test.ts`,
`test/server.test.ts`, `ARCHITECTURE.md`. `src/mcp/tools.ts` and `src/demo/tools.ts` call the same
function and need no edit.

**Mechanism, map (commit M, on top of G).** Loop 1's arm 3 commit `d4919118` cherry-picked:
`SERVER_INSTRUCTIONS` equals BASE through the generator, `FAMILY_LINE` stays in the `search`
description, the Playground phrase is corrected. The served instructions must be the 1,899
characters with SHA-256 `67a6bd0b…6c00` that `ARM-3-REVIEW.md` proved. The four stale documents
(D1 to D4 there) and the renames the TODO asks for go in the keep commit, after the decision, with
the served hashes asserted unchanged.

**It must not change.** The block's existing sentences and when it renders; the exact-row
exception and its order after the block; the EVIDENCE CHECKPOINT; any result with no candidate
call; both tool descriptions; BASE; `search` output; the Playground's recovery-advice cycle (a test
shows an alternatives hint still appears).

**Free checks before P1.**

1. Gates, each bare: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke`,
   `npm run eval:routing -- --gate`, the generated-files sync, `npm run secrets:scan -- --tree`.
2. Replay the stored `execute` results of the tuning rows: the sentence appears exactly where the
   block does and nothing else differs.
3. One keyed live `execute` on the step's `dev:eval` server with a research call shows the
   sentence; `report-live-surface` shows 1,899 characters and unchanged descriptions.
4. **The reference count.** Apply the section 4 rubric to the stored answers where the block and a
   claim word coincide (32 by the scratch scan). This gives violations per exposed answer without
   the guard and with the map: the measured rate the P1 rule uses. Loop 1 read five no-map
   answers this way, swept the rest by keyword, and found one.

**Paid run.** P1: the 58-row panel once, then the 8 guard rows (section 3) twice more, on the M
commit. One run measures the end state the owner asked for (guard present, map gone) against P0
(map present, no guard). A guard-only arm is not bought: the sentence is traceable in a result, so
its effect is read from the transcript on either side of the map.

### Item 2: the `stellarOrg` source (step 2, shares P2)

**Rebase.** `feat/stellar-org-source` (tip `b81e7a03`, merge base `66301389`) onto `main` after
step 1 merges. The map entry and the rule 3 sentence it added have no home once the map is gone
and are dropped. Generated files are rebuilt by their scripts; `eval/gates.json` is re-stamped
with the review rule it already followed. If step 1 leaves the map in place, the source cannot
land as built (594 characters over Claude Code's cut) and waits for an owner decision.

**Model-facing text it adds, and where it fits.**

| Text | Size | Where |
|---|---|---|
| `stellarOrg=SDF site: strategy, roadmap, programs, provider and audit directories; ` | +82 | `FAMILY_LINE`, in the `search` description |
| `stellarOrg` in the `execute` globals sentence and the `service` parameter description | +14, +16 | `execute`; the `search` input schema |
| `stellar.org` in the guard's `<families>` | +13 | the CANDIDATE EVIDENCE block |
| Two operation cards and their `describe` text | as on the branch | `search` pages that rank them |
| A `detail` edge `stellarOrg.search_site` to `stellarOrg.get_page`, joined on `path` | about 290, on a result with a site search | the EVIDENCE CHECKPOINT. The edge carries its own nouns; the Docs sentence stays byte-identical |

With item 4's drafts the totals are 1,951 (`search`) and 2,008 (`execute`), instructions 1,899:
all under Grok's 2,033, `execute` by 25. The operation descriptions are frozen at the branch tip. The
branch kept its "not for protocol behaviour; blog, press and events elsewhere" wording in the map
only, because the scorer reads description tokens; with the map gone that guidance is served
nowhere (Q6).

**It must not change.** `globalOutbound` stays `null`; the adapter's fetch boundary as reviewed in
`SORG-REVIEW.md`; routing gate totals (the branch showed 0 grade and 0 top-1 changes on 544 rows).

**Free checks before P2.** The gates above. The routing gate is read as aggregate counts only:
the ruling in the ledger forbids per-row output for rows that may duplicate held-out questions,
and a lane cannot tell which rows those are. The off-golden 40-question set
(`research/services/stellar-org-queries.json`, `sorg-general/measure.mts`) is rerun as the free
routing check: adapter recall (33 of 40 and 37 of 40 on the branch) and catalog reach at 5 and at
7 cards (7 of 40 at 5). Replay every `search` call of P0 and P1 on the rebased catalog and list the
panel rows whose page gains a `stellarOrg` card and what it displaced. Then, with nothing left to
edit, a read-only reachability record for the 12 source rows: does `search_site` on the question
return a page the golden cites, and does `get_page` return its text. A row marked unreachable
cannot move and is not counted against the source.

**Paid run.** P2, with the 12 source rows read three times. Section 5 has the rule.

### Item 3: seven search cards by default (no run of its own; rides P2)

`SEARCH_DEFAULT_LIMIT` 5 to 7 in `src/mcp/tools.ts`, the schema text "default 7", and the bound in
`test/server.test.ts`. The Playground default, `MAX_SEARCH_LIMIT`, `codemode.search` and the
ranking do not change.

A paid 7-against-5 arm cannot decide this on Claude Code. The default applies to about 20% of
this client's searches, the replay finds at most one row per run where a needed operation waits at
rank 6 or 7, and two traced gains (the skill's bar for acting) cannot come from one exposed row.
M1's own stop rule ("if none, stop and keep 5") is close to firing. I recommend deciding it on the
free evidence instead (Q2): seven cards gained 11 operation-card hits on 182 legacy rows and lost
none, gained 3 of 64 on the FAM development rows and lost none, and six is a known trap. The agent
asks for 8 or 10 in three searches of four, so pages of that size already run with no observed
harm. The token cost, computed from the P0 and P1 transcripts (1,899 bytes per default page times
its rereads), should be near 0.1% of client tokens per question against M1's 5% bar.

Free checks: gates; the largest default page at 7 over the routing questions stays under Grok's
20,000-byte result clip (16,839 in the caps audit, recheck with the new cards; an aggregate).

### Item 4: per-client delivery (contract fixes; rides P2)

Section 6 has the reasoning. The changes:

- Tests: BASE and both descriptions at most 2,033 characters (Grok 1.0.77, measured), replacing the
  2,048 and 2,000 constants, which it subsumes; the first line of the instructions is one line of
  at most 200 characters ending in a full stop (Codex shows about 201 with two servers); the first
  117 characters of each description end at a sentence end (OpenCode shows 117 and an ellipsis).
- `search`: open with sentences that fit in 117 characters without the namespace list, which
  `FAMILY_LINE` repeats. Draft: "Ranked search over every exposed operation and skill. Hits are
  cards to compose in `execute`, not evidence." (107). This also stops item 2 from pushing the
  first sentence to 118.
- `execute`: the same. Draft: "Run one JavaScript async arrow function in a sandbox with no
  network. It calls only operations found with `search`." (115). Drop the namespace list the
  globals sentence repeats. With these drafts `search` is 1,869 characters and `execute` 1,994.
- BASE's first line is left alone: 133 characters, already whole in Codex's catalogue.

Every load-bearing phrase test in `test/mcp-instructions.test.ts` must still pass. The upstream
links stay last in `search`, where any cut costs least.

### Item 5: research on a named SEP or CAP (step 3, one targeted read)

**A general mechanism exists for half of the gap.** It is arm 2's identity rule applied before
the call instead of after it, rendered like arm 1's `detail` pointer.

- Build: for an operation whose input has an enum filter that its row items also carry (today
  only `scout.searchResearch`, `source`), the catalog records the filter and its values. A build
  guard fails when the filter is not an input enum or not a row key. No list of standards: the
  series come from the upstream enum, so a series Scout adds later is covered with no edit.
- Run: when a string argument of any call in an `execute` holds an identifier (arm 2's token rule,
  letters then digits) whose letters equal one of those values, and no call to that operation in
  the same `execute` names it, the EVIDENCE CHECKPOINT adds one generated sentence. Draft:
  "`SEP-45` names a document. `scout.searchResearch` holds documents of source `sep`: call it with
  `{ q: "SEP-45", source: "sep" }`. A row it marks exact is the document itself." About 175
  characters, on those results only. Frozen before any target transcript is read.
- It hands the agent to arm 2: the research call returns the document, arm 2 marks it exact.

Files: `scripts/build-catalog.mjs`, `src/catalog/types.ts`, `src/catalog/search.ts` (the manifest
check), `src/executor/run.ts`, `src/policy/evidence-checkpoint.ts`, `catalog/manifest.json`
(generated), tests, `ARCHITECTURE.md`.

**It must not change.** Anything `search` returns: hits, order, `recovery`, `widerCandidates`. So
the routing gates, the PH3 box and the overlap ruling are untouched. Results with no such
identifier stay byte-identical.

**What stays red.** `search` still does not rank the research lane for a standards question (0 of
8 target rows at limits 5, 8 and 10 in loop 1). That is a ranking change. Three reviewed
mechanisms failed on it, its routing rows overlap held-out questions, and PH3 is the owner's to
open. Nothing here touches it.

**Free checks.** Gates. Unit cases shared with arm 2's token rule. Replay over the stored
executes: the sentence on 12 or 13 rows per run, none where research already named the
identifier, none elsewhere. Live and read-only: for each distinct identifier in the stored call
strings (about 25), the call the sentence names, and whether an exact row comes back. That share is
the mechanism's ceiling, recorded before the paid read.

**Paid run.** The 17 identifier rows (section 3), two passes, on the step 2 kept commit plus this
change. It can be built while steps 1 and 2 are measured; it is measured last, as the owner
ordered.

## 2. Which changes share a run

| Run | Surface | What it decides | Compared with |
|---|---|---|---|
| P0 | `main` at `0a603453` | Nothing. Control, and the null (below) | Stored arm 1 run |
| P1 | G + M | Guard; map | P0 |
| P2 | P1 kept + item 4 + item 2 + item 3 | Source; harm from the delivery text and from seven cards | P1 (P0 if the map stays) |
| R | P2 kept + item 5 | Identifier pointer | The same rows in P0, P1, P2 |

**One control serves every step, because each kept run becomes the next step's control.** P0 is
collected once. A step that reverts leaves the earlier run as the control. If the map stays and
the guard is kept, P0 is P2's control and rows that carry the guard sentence are read by trace.

**P0 also measures the null for free.** `main` differs from the stored arm 1 run
(`2026-11-14T23-04-27-variantA`, cap 50, none skipped) only where arm 2 marks an exact row. On the
50 shared rows, minus rows with an exact marker in P0 (frozen before any verdict is read), P0
against that run is a same-surface pair at one judge policy: the first one this battery has. Its
flip rate sets T below. If the remote identity vector moved since that run, the pair also carries
drift; say so and use T = 6.

**Why these groupings are not confounded.**

- P1 holds one result sentence and one instruction change. The sentence is traced in the
  transcript; the map's absence cannot be, so the map is judged on everything else.
- P2 holds three changes, separated by facts that are deterministic and frozen before any verdict
  is read. *Source-exposed*: a `stellarOrg` id on a search page or in a script. *Seven-exposed*: a
  default-limit search; *seven-used*: a called operation that the row's own query ranks 6 or 7. A
  row in neither set differs from P1 only by the item 4 sentences, so its movement is the text's
  harm test and a second null. A row in both sets is reported apart and counts for neither.
- R changes a result only where its sentence appears, which the replay predicts.

A step never shares a run with another change of the same kind: P1 has the only instruction
change, P2 the only description, catalog and page changes.

## 3. The panel

Loop 1's 50 rows stay, so each keeps its four stored samples. Rule for the change, applied by the
committed scan over `sets.tuning` only: **add every tuning row whose golden cites a `stellar.org`
page outside `/blog`, `/press` and `/events`.** Eight rows join; the panel is 58.

Added: `q-data-network-metrics-sources`, `q-eco-stellar-rwa-stablecoin-volume`,
`q-hot-sdf-xlm-holdings-sales`, `q-org-sdf-structure-mandate`,
`q-raph-official-help-sdf-cannot-recover`, `q-scf-ambassador-program`, `q-scf-how-to-apply`,
`q-scf-vs-sdf-enterprise-fund`.

This also repairs the weakness `ARM-3-REVIEW.md` named. The 50 rows are 35 Docs-primary, 6 Scout
and 0 Lumenloop by `tags.service`; the 58 are 36, 12 and 1. The map's ecosystem-routing rules act
on exactly the rows that were missing.

Target sets, each fixed by rule before its run:

| Set | Rule | Rows |
|---|---|---|
| Guard rows (8) | Panel rows where the block and a claim word coincided in two or more stored runs, plus every row tagged `trap: governance` | `q-crp-oz-rwa-erc3643-trex`, `q-defi-agent-identity-stellar-experimental`, `q-n3-issues-842-backup-faucet-wallet`, `q-smart-account-scoped-policy-signers`, `q-soroban-pre-mainnet-security-steps`, `q-soroban-reentrancy`, `q-soroban-vuln-classes`, `q-edge-factcheck-soroswap-first-amm` |
| Source rows (12) | The panel rule above, all rows | The 8 added, plus `q-asset-usdc-eurc-issuer`, `q-comp-aml-analytics-vendors`, `q-hot-fee-pool-burn-deflation`, `q-soroban-pre-mainnet-security-steps` |
| Identifier rows (17) | Panel rows where an `execute` string named an enum-series identifier in two or more stored runs | `q-comp-aml-analytics-vendors`, `q-comp-sep8-regulated-assets-approval-server`, `q-crp-oz-rwa-erc3643-trex`, `q-edge-asset-site-scam-detection`, `q-edge-inject-ignore-instructions`, `q-net-protocol-meeting-notes-find-cap`, `q-nft-vault-contract-standards`, `q-pc-cross-redstone-sep40`, `q-pc-quantum-preparedness-dormant`, `q-pc-sponsored-reserves`, `q-sep-43-web-wallet-api`, `q-sep-45-contract-auth`, `q-sep-53-sign-verify-message`, `q-sep24-interactive-deposit-flow`, `q-sep6-sep24-sep31-choice`, `q-soroban-oz-token`, `q-zk-host-functions-status` |

Claim words, as the scan matches them in an answer: audit and its forms; incident, exploit, hack,
breach, outage, halt, post-mortem; governance, vote, ratify. The scan picks rows to read. It does
not judge them.

The 21 tuning rows outside the panel are not run. The held-out read covers what the panel misses.

## 4. Pass rules

**Standing method, every run.**

- One judge policy: `--max-panel-cases 100` (above the largest run, so no boundary-eligible row is
  skipped; loop 1's runs skipped none either), the stability register `4322dd4d…f458`, the pinned
  judge, rubric and pack, and the pinned Claude Code wrapper. Report the tier of every changed row
  and the tier-matched net beside the all-rows net.
- A repeat pass is its own `run-qa.mjs` call under the same authorization, capped at the budget
  that remains. Assert the job count before spend. Compare rows only on equal `caseInputSha256`.
- **Traced attribution (loop 1's A1).** A row's move counts for or against a change only when the
  review finds its cause in the after-transcript: the fact gained or lost is in a result the
  mechanism produced, or in a call its text displaced. Anything else is a noise observation.
- **T, the untraced-net threshold.** The 95th percentile of the null net, at the flip rate P0
  measures, on the rows being compared. The rate is measured; the model (independent, symmetric
  flips) is a guess. Loop 1's rates give 5 to 7 on 50 rows; expect 6.
- **Harm rules, every step.** H1: no row becomes `wrong` by a traced down. H2: no row that was
  correct in the control goes down by a traced down, and every trap row keeps its trap behaviour
  (a failure the review classes as a judge artifact is recorded and does not revert). H3: the
  untraced net, downs minus ups, is below T; at or above T, stop and re-plan.
- **Governance and attribution read (standing).** On every answer where the block appeared and
  the scan finds a claim word, plus loop 1's five rows. For each audit, incident, governance or
  standards-authorship statement record its *support* in the transcript (an official family; the
  named party's own document; candidate rows only; none) and its *form* (source and date named;
  hedged; bare). A violation is a bare statement with candidate-only support. Bare statements
  resting on the party's own document are counted in a second column, so Q1 can be applied either
  way without a second read.
- **Cost and tokens.** Agent cost per answer, median and mean turns, client input tokens per
  question, first-turn prefix tokens, `execute` result characters, on all rows and on rows whose
  verdict did not change. Loop 1's flags stand as flags, not rules: cost per answer up more than
  20%, or median turns up by more than 1, on unchanged rows. Both numbers are guesses.

**P1.**

| Rule | Keep | Otherwise |
|---|---|---|
| Guard delivered | The sentence is in every result that carries the block | Fix the build; the run is void for the guard |
| No rise in violations | Violations in the guard-side exposed answers are at most the reference rate times that count, rounded up, plus one | The guard does not replace rule 2: the map stays. The "plus one" is a guess that allows one sampling event; a single instance no longer decides |
| No over-hedging | No traced down in which a fact the transcript supports with an official or first-party document is withheld or called unverified (H1, H2) | Revert the guard; the map stays |
| Map | Removal does not cost T net rows on the 58, and required-service coverage in `npm run eval:plan` does not fall on 3 or more rows with no offsetting gain | The map stays |

The guard is kept by default when delivered and harmless: the owner asked for it to be carried.
It reverts when the read shows no change in how such claims are stated and a cost flag fires.

**P2.** Source: lands unless H1 or H2 fails on a source-exposed row, or two unrelated rows outside
the source set go down by a traced displacement (a `stellarOrg` card or call took the place of the
call that held the fact). The owner already decided to add the source, so gain is reported, not
required: the share of the 36 source-row passes that call it, and traced ups on reachable rows.
Seven cards: kept unless two seven-used rows go down by a traced displacement, or the computed
token rise passes 5%. Delivery text: kept unless the rows in neither set show an untraced net at
or above T on that denominator.

**R.** R0, delivered: the sentence where the replay predicts, and research called with the
identifier afterwards in a larger share of passes than the same rows showed without it. The four
stored runs give that share as 19% to 33%; the bar is above 33%, a measured rate. For reference,
arm 1's pointer was followed on 48% of rows. R1: two different rows go up, traced to an exact row
the pointer led to, and traced ups outnumber traced downs. Two is the skill's bar for acting. H1
to H3 hold. Inconclusive reverts, and the item leaves the loop red with this record.

**What a result licenses, per client.**

| Change | Claude Code 2.1.296+ | OpenCode | Grok CLI | Codex | claude.ai web, Desktop |
|---|---|---|---|---|---|
| Guard, identifier pointer (results) | Behaviour measured | Delivered; behaviour not measured | Same, inside its 20,000-byte result clip | Same, inside the model's own print budget | Delivered; not measured |
| Map removed | Measured, Sonnet 5.5 only | Loses a map it received whole; not measured | Had one source line of it; now gets the instructions whole | Never had it in context | Never had it |
| Source, seven cards | Measured | Not measured | Not measured | Not measured | Not measured |
| Delivery text | Harm only | Delivery by probe | Delivery by probe | Delivery by probe | No claim |

No result here is a claim about answers on Codex, Grok or OpenCode, about the Playground, or
about a rewritten map.

## 5. Landing `stellarOrg`

- **Order.** Step 1 merges to `main`; PR 439 rebases onto it; item 4's description edits go in
  first so the source adds a family clause and nothing else to a sentence a client cuts.
- **Paired check.** The 12 source rows, three passes after, against their P0 and P1 samples
  before. A row counts up when the answer states a fact the review found missing and that fact is
  in a `stellarOrg` result. The unrelated control is the other 46 panel rows in the same run, read
  under the source-exposed rule of section 2.
- **Not the four named cases.** They are outside `sets.tuning`. The branch's TODO bullet that plans
  a paired run on them is rewritten at the rebase to name this check.
- **Free routing check.** The 40 off-golden questions, as item 2 lists. It is reported, never a
  gate: the set leans on page-title words.
- **After deploy.** From the Worker, `stellarOrg.search_site` returns hits and
  `stellarOrg.get_page` returns text for one page each. Every live call so far ran from a
  workstation. If stellar.org's front refuses Worker egress, revert the source commit alone and
  redeploy; the rest of the kept set stands.

## 6. Clients the runner cannot drive

**Decided by the probe harness** (`research/audits/2026-11-14-client-text-limits/`, subscription
CLIs, no API billing): what each client delivers. After step 2, run the Raven sessions again on
the `dev:eval` server and record, per client, the last characters of the instructions and of each
description. Expected: Codex's catalogue line is the first line, whole; OpenCode's two 120-character
lines end at a sentence; Grok receives the instructions whole for the first time (1,899 under
2,033) and both descriptions whole.

**Safe as contract fixes.** The three tests, the two opening rewrites, and the cut of a
duplicated namespace list (item 4). They remove no rule, and their only risk on the measured
client is read in P2.

**Waits for a Codex or Grok answering runner** (`.agents/TODO.md`, "Add a runner for Codex and Grok
as QA answering clients"): whether any of this changes an answer on those clients; whether a Codex
model prints `ALL_TOOLS` and so reads the instructions at all; whether a rule belongs in the first
line; whether an OpenCode model reads past 117 characters; and whether those clients pass a
`limit`, which decides how much item 3 matters to them.

## 7. Item 5 in one paragraph

A general mechanism exists for the half of the gap where the agent names the identifier in a call
and never asks research, which is most of it (12 or 13 rows per stored run). It uses no boost and
no vocabulary: the series come from an enum the upstream schema declares, and the rule is the one
arm 2 already applies after the call. No general mechanism is proposed for the other half, the
`search` ranking of the research lane. That stays red with the PH4 evidence.

## 8. Spend

| Run | Collections | Estimate | Cap | Time |
|---|---:|---:|---:|---:|
| P0 | 58 | USD 11.0 | 14.5 | 38 min |
| P1 | 58 + 2 × 8 = 74 | 14.1 | 18.5 | 48 min |
| P2 | 58 + 2 × 12 = 82 | 15.6 | 20.5 | 53 min |
| R | 2 × 17 = 34 | 6.5 | 8.5 | 22 min |
| Held-out | 119 | 25.0 | 30.0 | 75 min |
| **Total** | 367 | **72.2** | **92.0** | |

Estimates are loop 1's USD 0.19 per panel case (9.74, 9.61 and 9.16 for 50; 2.90 for 15) and 0.21
per held-out case (25.02 for 119); caps are USD 0.25 per case. Loop 1 spent 56.43. Two things were
cut: a guard-only arm, and a seven-cards arm.

**The held-out read.** Once, on the final kept commit, when at least one change is kept, launched
by the orchestrator with `eval/qa/heldout-read.sh` from the sealed id list. Counts only. Its
reference is loop 1's read of the kept surface (51 correct, 61 partial, 7 wrong; cap 119, as this
one), so the pair is matched on judge policy. Fixed reading: **ship unless correct is at most 42
or wrong is at least 13.** Correct: 51 less 1.65 standard deviations of the null at a 20% flip
rate on 119 rows (about 9). Wrong: 7 plus the same multiple for the 13 wrong-row moves loop 1's
pair showed (about 6). A neutral surface trips one of them about one time in ten. Recompute both
from P0's measured rate and fix them in the ledger before launch. No held-out result is called an
improvement.

## 9. Deploy points

One production deploy, after the held-out read passes, of the kept commit on `main`. Everything
kept ships together; the held-out read is the gate, and it is read once. Merges to `main` during
the loop do not deploy.

After the deploy, each check free and read-only, and the Version ID recorded:

1. `initialize` returns 1,899 characters of instructions with the measured hash, and `tools/list`
   returns descriptions with the measured hashes.
2. A keyed `execute` with a research call shows the guard; one with a Docs search that names a
   SEP shows the detail sentence and, if kept, the identifier sentence; a `search` with no `limit`
   returns 7 hits.
3. The Worker egress check of section 5, and the outbound status in Workers observability.
4. The four-client delivery probe against production.

## Open questions for the orchestrator

| # | Question | My recommendation |
|---|---|---|
| Q1 | Does the guard accept the named party's own document (an audit firm's report, a SEP file, a post-mortem) as support, or only official families as the map's rule did? Under the first reading loop 1's one counted instance is not a violation: the row was the report and the answer cited it. | Accept it. Arm 2 already treats a row that is the document as evidence for what it shows. Stellar Docs holds almost no third-party audit, so the strict reading makes a sourced audit answer hedge a true fact, in the category the owner ranks first. The read records both columns. |
| Q2 | Item 3: decide on free evidence and ship 7, keep 5 under M1's stop rule, or buy a 7-against-5 arm? | Ship 7 inside P2. A paid arm cannot decide it on this client, and the free evidence shows gains with no loss. |
| Q3 | Item 5: may the identifier pointer run, although the TODO holds the item with PH3? | Yes. It changes `execute` results only. The ranking half stays held. |
| Q4 | Approve the 58-row panel and the repeat passes. | Yes: USD 1.5 more per run, and the first panel that samples ecosystem rows. |
| Q5 | One deploy after the held-out read. Should Worker egress to stellar.org be tested first on a non-production version (a preview upload, no traffic)? | Yes, if the owner's Cloudflare setup allows a preview URL: it costs nothing and protects P2's source evidence. Otherwise accept the risk; the source is its own commit. |
| Q6 | The source's "not for" guidance is served nowhere once the map is gone. Re-home it? | No. Read the intrusions in P2 first (source-exposed rows outside the 12), and act on two unrelated cases. |
| Q7 | Item 5 is measured last by the owner's order, but step 1 removes the map line that names research for Scout. Measure it first instead? | Keep the order. P1 does not charge an untraced down to the map below T, and the pointer is then measured on the surface it has to work on. |

## Limits

- Every count under "What the free checks found" is a scratch scan by the planner, on one sample
  per row per run. The committed scans replace them.
- I read no golden answer and no transcript result. The guard and pointer wordings are drafts; the
  implementer freezes them before reading stored answers, and the reviewer checks they did not
  change afterwards.
- The numbers this plan sets by guess, each named where it is used: the "plus one" in P1, the two
  traced rows in P2 and R, the 20% and one-turn cost flags, the 5% token bar, three samples per
  target row, and the null model behind T and the held-out reading. Measured: Grok's 2,033,
  OpenCode's 117, Codex's 201, the flip rate P0 will give, the 33% and 48% follow rates.
- One client and one answering model. Section 4's table is the whole of what a result licenses.
