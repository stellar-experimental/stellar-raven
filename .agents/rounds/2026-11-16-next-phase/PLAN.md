# Plan: the next phase after tuning loop 2

Planner: Claude Fable 5.2, high effort, lane `next-plan` (`t40k`). Orchestrator: Claude Opus 5.5
(`t40j`). Written 2026-11-16 from `main` at `986ffbaa`. Brief: [briefs/PLAN-BRIEF.md](briefs/PLAN-BRIEF.md).
This file changes nothing; it proposes. The free checks behind its facts are listed at the end.

## Summary

- **Stop surface tuning.** Two loops cost USD 128 subscription-equivalent and produced two traced
  answer gains, both from one arm. The instrument cannot see the effects being tuned.
- **This week is truth maintenance,** all free, on the Mac: the `hono` fix, drift #223, three
  upstream handoffs, the branch and TODO debt, then the Bell goldens in a 31-hour window on
  2026-11-23 and 24.
- **Next product work is chosen from production usage,** not from another golden-driven loop: one
  free telemetry read, then the mechanisms it supports.
- **Planned paid spend: USD 0 through 2026-12-04.** One optional client diagnostic after that is
  capped at USD 16 subscription-equivalent (decision 7). No held-out read is planned.

## Verdict on the last ten days

**What worked**

| Work | Result | Cost |
|---|---|---|
| First-principles round ([record](../../../research/audits/2026-11-12-first-principles-round.md), [ADR-0011](../../../research/decisions/0011-tool-surface-stays-code-mode-trimmed.md)) | Closed the `retrieve` question. Shipped the trim: 41% fewer client tokens for a loss of about 0.03. Found that sources and goldens set the ceiling. | USD 583.40, API-billed; half of it judging |
| Golden coverage audit ([ledger](../2026-11-14-golden-coverage-audit.md)) | 501 cases to 247 on a 167-leaf map; judge-facing words 146,959 to 39,412; nine findings filed upstream (`sd-105` to `sd-110`, `sls-117` to `sls-119`) | Subscription; battery test USD 15.43 |
| Caps audit, client text limits, peer survey (`research/audits/2026-11-14-*`) | Found the stale 2,048 limit, Grok's 2,033 cut and 20,000-byte clip, Codex's one-line catalogue | Free |
| Family decider ([record](../../../research/audits/2026-11-14-family-decider.md)) | Its stop rule fired before spend and closed the engine question | USD 0.065 |
| 247-case baseline (`2026-11-14-baseline-tuning/BASELINE.md`) | The reference (82 correct, 144 partial, 21 wrong), four case defects, and a reviewed failure mix | Subscription, one run |

**What did not work: surface tuning as an accuracy lever.**

- Loop 1 (USD 56.43) and loop 2 (USD 71.59) ran seven paid panels and two held-out reads. Traced
  answer gains: two rows, both from loop 1's page-read pointer. Loop 2's five items produced none
  ([loop 2 ledger](../2026-11-15-tuning-loop-2.md): P1 "none traced", P2 "0 and 0", R "0 traced ups").
- The panel cannot resolve these effects. T is 5 on 58 rows; the same surface moved 17 of 50 rows in
  loop 1; 21 of 58 rows changed judge tier between P1 and P2.
- The identifier pointer was delivered exactly, followed 9 times in 42, returned the exact row 9 of
  9, and moved no verdict. The family decider found the same thing one layer down. Handing an agent
  the right document did not improve its answer.
- The second held-out read passed its rule and moved down: correct 51 to 50, wrong 7 to 9,
  core-correct 115 to 110, traps 7 of 7 to 5 of 7. Required-service coverage fell 58, 56, 55.
- What loop 2 did buy is cost and delivery: instructions 4,066 to 1,899 characters, both
  descriptions under Grok's cut, and a guard every client receives. Those are kept on "no harm
  shown", not on an accuracy gain.

**What the owner should stop paying for**

1. Panels that check text, caveat or pointer changes whose expected effect is under T.
2. A held-out read per loop. Each costs USD 25, can only return "no harm shown", and spends the
   set's blindness. The two reads were 39% of loop spend.
3. Plan, review, amend, implement, review, run for a change that ends "kept, unproven". Loop 2 left
   16 files for five such changes.
4. API-billed collection. The first-principles round is the only one, and it is closed.

## Where I differ from the orchestrator's assessment

Items 1 to 4 hold as written; item 1 is the verdict above. Changes to the rest:

- **Item 5, branches.** Worse than "ahead of main". Every branch holds content that is absent from
  `main`, and five commits that `.agents/TODO.md` and the loop 2 ledger cite as "in git history"
  (`a49ee918`, `940dc013`, `3d65d0ff`, `bd9719fb`, `b8ea957d`) exist only on `tune/loop-2-runs`.
  Deleting it orphans them. Bundle first (item 0.3).
- **Item 6, the split.** A full re-draw is wrong. A new salt would deal cases from the 79 tuning
  rows, which two loops read and tuned on, into the held-out set. Decision 2 gives a cheaper fix
  that reveals no membership.
- **Item 7, other clients.** The map removal changed little for the two eval clients. Grok already
  cut the instructions at 2,033 characters, so it saw about 134 characters of the map; Codex never
  put the instructions in context. Only OpenCode, which is not an eval client, lost the whole map.
  A committed runner is not the next step; a hand-run diagnostic is (item 4.2).
- **Item 8, source coverage.** Smaller than "28 leaves to re-check". The gap ledger already re-ran
  the weight-3 leaves and 13 of 16 did not reproduce; 11 leaves are marked "not re-run". On the
  rebuilt battery the reviewed failure mix is 39 agent failures, 9 own-repo gaps, 3 eval-side gaps
  and 3 upstream gaps (63 tuning rows, `BASELINE.md`). The 291-of-569 figure describes the old
  battery. What remains is about a day of keyless work (item 1.3). A battery cannot show gaps in
  questions it does not ask, so the pointer to the next source is production usage (item 3.1).
- **Item 9, ranker fixes.** They are free to measure, but they are not clean. The routing section of
  the TODO holds lexical variants after about thirty failed designs and says not to use "a tuned
  token-length threshold"; the scorer is vendored from upstream. One measurement per mechanism, no
  variants (item 3.3).

## Phases

Reviews are named only where a skill or a boundary requires one. "Gates" means `npm run typecheck`,
`npm test`, `npm run build` and `npm run secrets:scan -- --tree`, run bare, plus what the item
adds. Mac lanes work in worktrees under `/private/tmp`, and share one `npm run dev:eval` terminal
that the orchestrator starts. Phases 0 to 2 are one `truth-maintenance` round with one ledger.

### Phase 0: today and tomorrow (Mac, USD 0)

**0.1 Fix `hono` (#428).**
- Decision: closes #428 and removes five moderate advisories from the Worker's dependency tree.
- Work: `npm audit fix`; `npm audit` reproduces the finding today and offers the fix. 20 minutes.
- Stop rule: if the fix needs a major version or touches `overrides`, stop and record it under
  "Dependencies" in the TODO.
- Author: Codex workhorse. Review: none; the gates decide. Gates plus `npm run test:smoke`.
- Ends in a merge and a deploy.

**0.2 Absorb drift (#223).**
- Decision: what production serves, whether `eval/gates.json` moves, whether the exclusions stand.
- Classes, from the CI comment of 2026-11-16 (derive them again from the diff): skill re-pins for
  `openzeppelin-stellar`, `stellar-dev` (mirrored `standards` touched) and `stellar-light`; two
  community catalogs that add `cavos-stellar`; Scout routing text on `scout.analyzeEcosystem` and
  four schema-only changes; Docs inventory (979 to 982 pages) and anchors (18 changed pages, 8
  removed).
- One schema change is on `GET /api/quality`. That fires the TODO trigger "Re-evaluate Scout
  exposure after a routing-contract change": run its candidate check and record the result. It
  very likely stays excluded.
- The titles file is under a hold; see decision 3. Run that free A/B here.
- Also run the two standing drift duties: the Horizon protocol-ceiling reading and
  `npm run eval:protocol-history` (expected stop: `source-expired`).
- Time 2 to 3 hours. Stop rule: the routing gate passes unchanged, or one routing-text movement
  gets a named re-baseline with zero hit-to-miss rows. A skill body or the new community entry that
  fails the read is excluded in `ecosystem-skills/groups.json`, not absorbed.
- Author: Codex workhorse. Reviewer: Codex frontier, required by the skill for skill-pin and
  routing-text drift; it reads the skill body diffs and the new entry as a security review.
- Gates: step 7 of `live-drift-resolution`, with `check-mirrors.mjs --fetch` and
  `check-pin-review.mjs`.
- Ends in a merge, a deploy, and a comment on #223.

**0.3 Bundle the branches, then delete them.**
- Decision: ends "main only" without losing anything.
- Content absent from `main`, by file comparison:

  | Branch | Absent from `main` |
  |---|---|
  | `research/client-text-limits` | 184 files under the audit's `runs/` |
  | `tune/loop-2-runs` | 25 files: the pointer code, its replay tooling, 18 scan files; and the five cited commits |
  | `exp/family-decider` | 60 files: the harness, the FAM development set, the Jev bundle |
  | `exp/fd-lab-a`, `fd-lab-b`, `fd-sets`, `fd-st` | 6 to 9 files each: sets, plan, review |
  | local `audit/golden-coverage` | 1 file: the retired licensing case |
  | the other five | No absent file; 1 to 20 files differ from `main` |

- Work: one `git bundle` of all 13 refs to the owner's backup folder outside the repository;
  `git bundle verify`; record its path and SHA-256 in the ledger; replace the "in git history"
  citations with the bundle; delete the branches. Copy the bundle to agentpc when it is reachable.
- Time 30 minutes. Stop rule: if the bundle does not verify, delete nothing.
- Author: the orchestrator. Review: none. No merge beyond the ledger line. See decision 8.

**0.4 Reconcile the TODO and the two loop ledgers.**
- Decision: the queue matches the repository again. The list is below.
- Author: Claude Fable. Review: Codex workhorse checks each deletion against the repository.
  Docs-only merge after 0.2, no deploy. One hour.

### Phase 1: by 2026-11-20 (Mac, USD 0)

**1.1 Drain the three upstream handoffs.**
- Decision: closes #429 and #425, removes two golden caps, keeps #427 open with a dated reply.
- `sls-033`: remove the cap in the two cases that name it (`q-tool-wallets-comparison`,
  `q-scf-resolve-passport-superseded-slug`) through `golden-truth`, set `fixed-upstream`, run the
  retirement review, and post the resolution comment.
- `sls-107`: run the retirement review, including the BRLT row. `sls-116`: reply with the
  2026-11-14 result.
- Re-run the reproduction commands of `sd-105` to `sd-110` and `sls-117` to `sls-119`, and read
  each upstream ref.
- Time 2 hours, after 0.2 merges. Stop rule: one live re-run per finding; a trigger that still
  reproduces keeps its status.
- Author: Codex workhorse. Reviewer: the distinct retirement reviewer the pipeline requires, Claude
  Fable. Gates: the improvements index, lint, live lint and probes; QA lint with `--since`;
  `npm run eval:qa:register`. Merge, no deploy.

**1.2 Run the adapter review that was skipped.**
- Decision: whether the deployed `stellarOrg` adapter needs a fix. The vendor-diverse attack was
  asked for twice (`SORG-REVIEW.md`, `STEP-2-REVIEW.md`) and never run, and the source is in
  production. A requested review is a completion gate.
- Scope: the fetch boundary (host pinning, redirects, path handling in `get_page`), the title that
  passes uncapped, zero-row and filtered-row behaviour, and the single `/API/search` request.
- Reviewer: Codex frontier, read-only, one pass, findings to a file in this folder. Fallback: Grok.
  One hour.
- Stop rule: each finding is fixed or waived by the owner. A fix is authored by Codex workhorse,
  with gates plus the adapter test and a live smoke of both operations, then merged and deployed.

**1.3 Close the source-gap residue.**
- Decision: which gaps become upstream issues, which become own-repo items, and which are closed.
- Work, keyless reads through the local server and public pages:
  - the 11 gap-ledger leaves marked "not re-run";
  - the SEP-7 payment-request search miss, with the three-way comparison the TODO names;
  - the two snippet-only rows (contract id derivation; SEP-45 status);
  - the Blend audit-register titles on stellar.org;
  - the Anchor Directory case, which needs another source or a golden edit;
  - the canonical-page caution for `q-soroban-cli-bindings` (`sd-110` exists; the case does not
    name it yet).
- Each gap is classed: reached but not surfaced (TODO), held by a source Raven does not reach
  (decision 6), or stated nowhere (a gap finding with a concrete content recommendation).
- Time: one day. Stop rule: two wordings and one direct read of the owning surface per leaf, then
  class it. No model-graded step and no new battery case.
- Author: Claude Fable. Reviewer: Grok tries to find each "missing" fact in a reached source;
  fallback Codex frontier. Reserve finding ids before the lane starts (`sd-111` up, `sls-120` up).
- Gates: the improvements set; QA lint for the one golden edit. Merge after 1.1, no deploy.
  Posting follows decision 4.

**1.4 Pre-stage the Bell re-verification** (by 2026-11-22, 30 minutes, the 2.1 author). Write the
probe commands, the evidence slots, and the edit for each outcome, so that 2.1 is a fill-in.

### Phase 2: dated golden work (Mac, USD 0)

**2.1 Bell goldens: after 2026-11-23 17:00 UTC, merged before 2026-11-25 00:00 UTC.**
- Decision: keeps the stale gate green. The lint fails when `reverifyBy` is earlier than today in
  UTC, so the three cases dated 11-24 fail every pull request from 11-25 00:00 UTC.
- Today: Mainnet runs Protocol 29, core supports 30, Testnet runs 30.
- Cases: `q-edge-fresh-latest-protocol-version`, `q-pc-protocol-upgrade-timing`,
  `q-protocol-version-history-list`; the register's Bell date trap and its activation-history
  invariant; the three `mainnet-protocol-29*` sentinels. Include the three later cases if they
  verify the same day.
- If the vote slips or Mainnet has not activated: record a dated extension with its root cause, as
  `truth-maintenance` allows. Do not guess.
- Evidence: a Horizon or RPC probe of both networks, plus the upgrade announcement or the core
  release (two source classes, one primary).
- Author: Claude Fable. Reviewer: Codex workhorse re-derives from live sources without the author's
  notes. Time 1 to 2 hours.
- Gates: `eval:qa:compile`; `eval:qa:lint -- --since <base> --stale --enforce-floors`;
  `eval:qa:register`; `eval:qa:sentinels -- --ids`; `eval:selftest`. Merge, no deploy.
- Keep no other pull request open across the window.

**2.2 The three later cases: 2026-11-30 to 2026-12-04.**
- `q-infra-software-versions-current-protocol` (due 11-30). The Software Versions page does not
  mention Protocol 30 today. If it still does not on 12-01, file the finding the TODO describes
  and extend the case with that root cause.
- `q-hist-quantum-preparedness-plan` (12-01) and `q-scf-current-round` (12-04, after the SCF #46
  Panel Review).
- One pull request, same author, reviewer and gates as 2.1. Stagger the new dates by quarter.

### Phase 3: after phase 1 (Mac unless marked)

**3.1 Read production once.**
- Decision: the four cap decisions the TODO lists (public `MAX_SEARCH_LIMIT`, Lumenloop and Scout
  per-call timeouts, artifact caps, the `execute` timeout), and which product item comes next.
- Work: one 30-day window through `cloudflare-observability-review` and the usage reports. Per
  operation: calls, soft-empty and error rates, tail latency. Per client: requested limits, result
  sizes over 20,000 bytes, failed `execute` share. Also: which question areas real users bring,
  with application development and audits read first.
- Free, 2 to 3 hours. Stop rule: one window, one read. Counts stay out of the repository; record
  only the decisions.
- Author: Codex workhorse. Review: none. Ends in TODO edits only.

**3.2 Per-source status and per-call timeouts.**
- Decision: a failed or hung source stops looking like a coverage gap, and one hung call stops
  holding a script for 60 seconds.
- Work: carry the last HTTP status through Mintlify retry exhaustion; record attempts and final
  status per source on the `execute` event; add Lumenloop and Scout per-call timeouts sized from
  3.1's tails.
- Free, half a day. Stop rule: the tests in the TODO item's "done when".
- Author: Codex workhorse. Reviewer: Codex frontier (executor boundary). Gates plus
  `npm run test:smoke`. Merge and deploy.

**3.3 Two ranker mechanisms, one measurement each.**
- Decision: whether a `stellarOrg` card stops displacing a non-SDF card at limit 10 (3 of 25
  questions today), with no loss elsewhere.
- Mechanisms: the id token `org` no longer prefix-matches query words; a gate-failed candidate that
  outscores the page's weakest gated card keeps its slot. One per change.
- Free, half a day, after 0.2 merges so that it measures the fresh catalog.
- Pass rule, fixed now: the legacy, skills and holdout gates pass with zero hit-to-miss rows, the
  extended lane shows no regression, and the off-golden 40 and FAM development rows do not fall.
  Stop rule: the first measurement of each mechanism decides. A failed mechanism is recorded and
  dropped; no second variant.
- Author: Codex frontier. Reviewer: Claude Fable reads the per-case changes. Merge and deploy only
  on a pass.

**3.4 Free reads of stored transcripts (needs agentpc).**
- Decision: whether to bound the default `execute` result (M2 and the Grok clip), and the standing
  recount of `data.sections` misreads.
- Work: re-truncate stored `execute` results at 16,000 and 18,000 characters and count the cited
  facts that sit only past the cut. Select rows by tuning id before reading any other field.
- Free, 2 hours once agentpc resolves. Stop rule: if no cited fact sits past the cut, set the
  boundary by the environment variable and stop; if many do, keep 6,000 and close M2.
- Author: Codex workhorse. Review: none for the read; a boundary change takes the 3.2 reviewer and
  gates.

**3.5 Small own-repo fixes, one pull request.**
- The fingerprint gate's failure message (it printed holdout rows to a lane); the all-capitals
  date token; the micro-map rename, with the served hashes asserted unchanged.
- Free, half a day, after 0.2. Author: Codex workhorse. Review: none. Gates plus the routing gate.
  Merge; deploy only if Worker bytes change.

### Phase 4: optional, needs decision 7

**4.1 Client diagnostic on Terra and Grok.**
- Decision: whether Raven's shipped surface works on two of the three eval clients, and whether
  3.4's result bounding matters to a real Grok client.
- Work: hand-run `hc` lanes as `run-evals` section 2 describes, 24 tuning rows per client, once,
  no judge. A script reads four behaviours from the transcripts: the client reaches the tool
  descriptions; it passes a search `limit`; a result is clipped and a cited fact is lost; the
  connection and calls succeed.
- Cap USD 8 per client, subscription-equivalent. About 2 hours. Stop rule: 24 rows read per
  client; no repeat and no score comparison.
- Author: Codex workhorse for the driver script. Review: none. Ends in a short record.
- Build a committed runner only if this shows a defect that needs a before-and-after measurement.

## Do not do now

| Item | Reason |
|---|---|
| A third surface-tuning loop | Two traced gains in USD 128; the panel cannot see effects under T = 5 |
| Another held-out read | No candidate change has a plausible effect above the threshold; each read costs USD 25 and some blindness |
| A full re-draw of the split | It moves tuned-on cases into the held-out set |
| A committed Codex and Grok runner | The hand-run diagnostic answers the open questions first |
| Paid cap tests | M1 and M3 are decided; M2 waits for its free step |
| An identifier pointer on another surface, PH3, research-lane routing | R delivered the exact row and no verdict moved |
| A use for the sealed FAM rows | The engine question is closed; keep them sealed |
| The Algolia `pages` index or a Sanity key | The source was called on 3 of 58 rows; add depth only on a production detail-lookup failure |
| Rewording the `stellarOrg` description | It trades audit reach for displacement and fits one slice |
| The general routing repair, RWA exposure (#167) | Held; no new mechanism evidence |
| Key-fact polish (98 lint warnings) | No gate and no decision depends on it |
| A new 247-case baseline | One exists and no comparison is pending |
| Judge pack or rubric changes | Judging semantics need a paid self-test; no model-selection round is planned |
| The vitest pool migration, the `workers-ai-provider` move | No gate forces either; `npm audit` is clean after 0.1 |

## TODO reconciliation (for the 0.4 author; I edited nothing)

**Delete**

- Owner decision on the `fp/*` branches: none exists on origin.
- "Finish the 2026-11-14 golden coverage audit": every owner decision is done (`sls-119` is
  `reported-upstream` since #440), the baseline ran (#442), and the polish is optional.
- "Measure 'read past the snippet' guidance": loop 1's arm 1 was that measurement and shipped.
- "Point the total-guard failure at its sources": headroom is 2,197 characters, not 30.
- The `#426` bullet under "Improvements follow-up": the issue closed on 2026-11-14.
- "Find what costs the trimmed surface accuracy on live-data questions", if decision 5 is yes.
- "Two snippet-only rows no Docs page can answer", when 1.3 decides both.

**Rewrite**

- Priorities: 1 the dated truth maintenance; 2 the production read and the source-gap residue; 3
  mechanisms with a measured cause.
- Held-out status: it says 246 cases, 48 reserve, SHA `f683852e…` and "no product-tuning lane has
  opened any". Current: 247 cases, 79 tuning, 119 held-out, 49 reserve, SHA `697c550a…`
  ([loop 1 ledger](../2026-11-14-baseline-tuning.md)); two loops tuned on the tuning rows; two
  counts-only held-out reads; one exposed row.
- "Audit source coverage": 11 leaves, not 28; point at item 1.3 and decision 6.
- "Report per-source attempts": drop "comes before the coverage audit".
- "Treat stellar.org routing reach": the source merged in #447; the first paragraph is stale.
- "Prove the stellar.org source": remove the egress bullet once the ledger holds its evidence. No
  tracked file mentions deploy `c3596dcc`; only the brief does.
- "Point agents at the page when a docs hit has no body": arm 1 shipped; keep only the comparison
  of raw Discovery candidates with the site MCP for `sd-059`.
- "Re-verify the event-tied goldens": name the 11-30 case,
  `q-infra-software-versions-current-protocol`.
- "Settle the routing-row overlap": replace with decision 2's outcome.
- "Add a runner for Codex and Grok": the hand-run diagnostic comes first (4.1).
- "Re-evaluate Scout exposure": record that the 2026-11-16 drift fired its trigger, with 0.2's
  result.

**Merge**

- "Keep a default `execute` result under the Grok CLI clip" into "M2".
- "Get research called when a question names a SEP or CAP" into "`search` does not surface the
  research lane", as one held note if decision 6 on PH3 is yes.
- "Recount `data.sections` misreads" into the 3.4 read.

**Ledgers**

- Loop 2: add the merge (#447), the deploy and the post-deploy egress check; remove the duplicate
  `loop2-impl` row; `P1.md`, `P2.md` and `R.md` are on `main`, not "on that branch"; replace the
  five commit citations with the bundle.
- Loop 1: the `Lanes` and `Ledger` sections are empty. Fill them or remove them.
- At closure, apply the retention rule to both folders (`briefs/`, `scans/`).

## Owner decisions

Reply by number. Each has a recommendation and a safe default.

1. **No third tuning loop; no paid QA run without a new written authorization.** Recommend yes.
   Default: the same.
2. **Held-out integrity without a re-draw.** Recommend: (a) commit a list of every routing row
   whose question matches any of the 247 headline questions at token Jaccard 0.8 or more, and make
   those rows confirmation-only for routing work. It is computed from public files, so it reveals
   no membership. (b) When agentpc is reachable, move the one exposed row to tuning by a dated
   amendment and record the new SHA-256. Default: no held-out read, and no routing work that reads
   per-row output, until this is decided.
3. **The Docs titles hold.** The committed titles are 666 pairs against 982 live; upstream renamed
   pages, and #223 can never close while the hold stands. Recommend: absorb fresh titles if 0.2's
   free A/B loses at most the one known row on the gates and nothing on the off-golden sets, with
   a named re-baseline. Default: keep the hold.
4. **Standing authority to post upstream.** Verified findings as issues and resolution comments,
   never pull requests, at most five new issues per upstream repository per round. Recommend yes.
   Default: findings stay local and `verified`.
5. **Accept the live-data weakness as the price of the trim.** The only paired evidence is on
   rows that cannot be opened, and three surface changes have landed since. ADR-0011's reopening
   rules stand. Recommend yes. Default: the item stays and gets no spend.
6. **Sources and the research lane.** (a) PH4 is not met and PH3 does not open. (b) The Dashboard
   lumens API and a release and package-version source are decided after 3.1 shows demand. (c) The
   National Bank of Ukraine statement, the scam-recovery guidance and a Pi Network line are filed
   as content gaps. Recommend yes to all three. Default: nothing is added or filed.
7. **The client diagnostic (4.1).** 24 tuning rows each on GPT-6.1 Terra and Grok 4.7, no judge,
   USD 8 per client subscription-equivalent. Recommend yes, after phase 1. Default: not run, and
   the TODO states that Raven is measured on Claude Code only.
8. **Delete the 12 remote branches and the local one after a verified bundle.** Recommend yes.
   Default: delete all but `tune/loop-2-runs` and `exp/family-decider`.

## Parallelism and merge order

| Lane | Item | Write set | Can run with |
|---|---|---|---|
| A | 0.1 | `package-lock.json` | everything |
| B | 0.2 | `inventory/`, `catalog/`, `specs/`, `ecosystem-skills/`, the anchors file, generated `src/mcp/micro-map.ts`, `eval/plan/`, `eval/gates.json` | A, D, E |
| C | 0.3 | none in the tree | everything |
| D | 1.2 | a findings file in this folder | everything |
| E | 1.3 research | this folder only, until B and F merge | A, B, D |
| F | 1.1 | `improvements/`, two battery cases, the register | after B |
| G | 0.4 | `.agents/TODO.md`, the two ledgers | after B; nothing else edits the TODO meanwhile |
| H | 3.2 | `src/adapters/`, `src/executor/`, their tests | I only after B |
| I | 3.3, 3.5 | `src/catalog/`, `scripts/`, `src/mcp/`, CI files, `eval/gates.json` | after B; 3.3 before 3.5 |

- Start A, B, C, D and E together today.
- Merge order: A, B, G, F, E's findings, D's fixes, H, I. The golden pull requests (2.1, 2.2)
  merge on their dates, with nothing else open on 2026-11-23 and 24.
- Deploy after A and B together, then after each later merge that changes Worker bytes.
- F and E both regenerate `improvements/INDEX.md`: merge `main` and re-run the index before each.
- B and I both re-stamp `eval/gates.json`: I starts from `main` after B.
- agentpc is needed only for 3.4, decision 2(b), and the second copy of the bundle.

## Checks I ran

All free and read-only. No model-calling eval, no paid call, no held-out or reserve case opened.

- `gh issue list`, and `gh issue view` for 223, 428, 167, 425, 426, 427 and 429.
- `git fetch --prune`; ahead and behind counts; a per-file comparison of each branch with `main`;
  `git merge-base --is-ancestor` for the five cited commits.
- `npm run eval:qa:lint -- --stale`: 0 errors, 98 warnings. The `reverifyBy` dates were read from
  the battery, and the stale comparison from `eval/qa/lint-corpus.mjs`.
- `npm audit`: one moderate, `hono`, fix available.
- `curl` of the Horizon roots (Mainnet protocol 29, core supports 30; Testnet 30) and of the Docs
  Software Versions page (no "Protocol 30").
- `hc ls`: agentpc unreachable. No terminal was sent input.

Not checked: the deploy and egress result for `c3596dcc` (the brief states it; no tracked file
does); the content of any results file on agentpc; what the 2026-11-16 drift diff holds beyond the
CI summary.
