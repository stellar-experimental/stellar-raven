# Remaining-work adversarial audit — Opus report

Date: 2026-09-01
Scope: read-only independent audit of `.agents/NEXT.md` and `.agents/TODO.md`
Brief: `.agents/rounds/2026-09-01-remaining-work-adversarial-audit/brief.md`

## 1. Runtime

| Item | Value |
| --- | --- |
| Model | Claude Opus 5 (`claude-opus-5`) |
| Provider or CLI | Claude Code CLI |
| Requested effort | max |
| Observed effort or variant | max, as stated in the task instruction |

The runtime exposes no separate effort telemetry. The observed value repeats the requested value.

This lane read the brief and every required source. It read no other auditor report. Two other
report files appeared in the round directory during the audit. This lane listed their names only.
It did not open them.

Commands used: `cat`, `sed`, `grep`, `ls`, `wc`, `shasum -a 256`, `node -e` over JSON files,
`git` read commands, and one free `npm run eval:qa:lint`. That lint writes no file. It runs `git`
read commands only (`eval/qa/lint-corpus.mjs:857`). No network call ran. No paid call ran. No
model ran. Cost: `$0`. The only file this lane wrote is this report.

## 2. Verdict

`PASS-WITH-FIXES`

The queue is disciplined and mostly accurate. Every mechanical claim this lane could re-check was
correct. Examples: 69 finding files in `improvements/`; corpus lint 0 errors and 61 warnings split
44 / 16 / 1 / 0 exactly as recorded; 301 battery files with a `solo://` reference;
`TERMS_EFFECTIVE_DATE` is `August 5, 2026` at `src/site.ts:998`; commit `24de1220` exists;
`src/catalog/vendor/search-scoring.ts` still hashes to `718924d1…e611b14`. The forbidden-action
language is strong. No queue statement authorizes an unsafe action.

Fourteen defects still block a clean handoff. Four are High. The queue omits one item of live
product work. It contradicts its own source of truth on one finding status. It reuses the tokens
`T1` to `T5` with two incompatible meanings inside the same two files. It puts one owner decision
in front of the owner without the fact that decides it.

None of these defects is a `BLOCK`. A `BLOCK` needs an instruction that would cause harm or waste
if followed. These defects cause a wrong action only after a further mistake by the reader.

## 3. Findings

### F1 — High — A merged user-facing Playground change is not in the queue

Sources: `.agents/NEXT.md:9-11`; `.agents/NEXT.md:48-49`; `.agents/TODO.md` (absent).

Problem. `NEXT.md:9-11` records production at Worker Version ID
`6282fe2a-54d8-471e-9f0a-0a2565110af1`, deployed 2026-08-28 from `main` HEAD. `NEXT.md:48-49`
records that PR #99 "shipped the Playground limit … at commit `3c7f0e5`". Commit `3c7f0e5` merged
on 2026-08-30. The last commit dated 2026-08-28 on `main` is `b933ddc`. A diff over the deployed
paths shows real product movement:

```
git diff --stat b933ddc 9815785 -- src catalog wrangler.jsonc package.json
 package.json       | 10 +
 src/demo/budget.ts |  6 +-
 src/demo/chat.ts   | 44 +-
 src/demo/page.ts   | 65 +-
```

`src/demo/page.ts` gains a live character counter, an over-limit state that disables Send, an
`aria-invalid` attribute, and a screen-reader announcement. These are public `/playground` files.
The queue uses the word "shipped" for a change that only merged. No queue item tracks the deploy.

Consequence. A user-visible fix and an accessibility repair sit undeployed. No item names an owner,
a prerequisite, or a completion gate for them. The word "shipped" hides the gap from a reader.

Required repair. Add a `.agents/TODO.md` item under a new "Deployment" section. State the
prerequisite: `npm run test:smoke`, because `AGENTS.md` requires it when `src/demo` changes. State
the permitted action: prepare and verify only. State the forbidden action: no deploy without owner
authorization, because a deploy is a production change. State the completion gate: the new
production Worker Version ID is recorded, and a live `/playground` check confirms the limit
behavior. Replace "shipped" with "merged" wherever a change is on `main` but not deployed.

This lane did not read production. The audit forbids a live fetch. The conclusion rests on the
queue's own dates and on the local git history.

### F2 — High — The queue contradicts `sls-080` on its own status

Sources: `.agents/NEXT.md:14`; `.agents/TODO.md:30`; against
`improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md:3`
(`status: reported-upstream`) and `.agents/rounds/2026-08-31-rejected-experiments-closeout.md:33`.

Problem. `NEXT.md:14` says "`sls-080` is verified." `TODO.md:30` says "`sls-080` is a verified
active Scout finding." The finding file says `reported-upstream`. The closeout ledger says
"`sls-080` is the reported-upstream active Scout finding from this result". `verified` and
`reported-upstream` are separate lifecycle states in `eval/EVALS.md` and `improvements/README.md`.

Consequence. An agent reading only the queue concludes that `sls-080` still needs upstream filing.
The queue never names the existing issue. The filing already happened at
https://github.com/Stellar-Light/stellarlight/issues/1134 on 2026-08-31. A duplicate upstream issue
is an outward-facing action that is hard to reverse.

The same `NEXT.md` block handles `sd-047` correctly two lines earlier. It gives the status and the
issue URL together.

Required repair. Change both lines to: "`sls-080` is `reported-upstream` at
https://github.com/Stellar-Light/stellarlight/issues/1134." Use the `sd-047` line as the pattern.

### F3 — High — `T1` to `T5` carry two incompatible meanings in the same files

Sources: `.agents/TODO.md:115` against `.agents/TODO.md:84-87`; `.agents/NEXT.md:102-104`;
`.agents/skills/run-evals/SKILL.md` "Five-track accounting contract"; `eval/qa/README.md` paired
section.

Problem. `TODO.md:115` says "The Raven trap failed T3." Here `T3` is the five-track safety track.
`TODO.md:86`, thirty lines later, says "T3 is an owner decision to open a new box for a non-card
evidence source." Here `T3` is a routing reopen trigger. The same collision applies to `T1` and
`T4`. `T1` is first-pass answer quality in the five-track contract and a paired exclusion class in
`eval/qa/README.md`. `T1` is an upstream card change at `TODO.md:84`. `NEXT.md:102-104` repeats the
collision.

Consequence. A new agent can read "The Raven trap failed T3" as "reopen trigger T3 fired". That
misreading looks like permission to open a new routing box. The reverse misreading treats
"T4 needs two unrelated live misses" as a harness-health statement. Both misreadings move work into
the wrong block.

Required repair. Rename the routing triggers in the queue to a non-colliding namespace, for example
`R1` to `R4`. State once that `R1` to `R4` are the brief's `T1` to `T4`. Do not rewrite
`brief-fable.md` section 16. A ledger records what happened, per `.agents/README.md`. Write
"five-track T3 (safety)" wherever the track is meant.

### F4 — High — The paired-margin owner decision omits the fact that decides it

Sources: `.agents/NEXT.md:131-143`; `.agents/rounds/2026-08-29-paired-verdict.md:149-151`;
`eval/qa/README.md` paired section; `.agents/rounds/2026-08-29-five-track-same-100.md`;
`eval/qa/paired-verdict.mjs:15` (`MINIMUM_ELIGIBLE_IDS = 100`).

Problem. The decision object offers three margins and four probability columns. It asks the owner
to choose the largest acceptable product loss. It never states the dominant fact. The method needs
exactly 100 **eligible** IDs after the T4 and T5 union exclusion. Every collection so far selected
exactly 100. The validator's missingness model gives mean eligibility 95.959 of 100 and a terminal
`INDETERMINATE` rate of 99.356%. The single real same-100 artifact already failed this way. One T4
exclusion left 99 eligible IDs, so the method returned `INDETERMINATE`.

No margin choice changes that outcome. The margin only matters after the denominator survives.

The table also drops the `(mixed-tuple calibration)` label that `eval/qa/README.md` puts on every
row. `NEXT.md:134` does name the mixed-tuple source. It does not state the consequence. Every
number changes at recalibration, so the owner may have to decide twice.

Consequence. The owner spends judgment on the second-order parameter. The first-order defect stays
unfixed. The empirical record on this failure mode is one for one.

Required repair. Split the decision into two ordered questions. See section 4, decision D1 and
decision D2. Add a fifth column to the margin table for the terminal `INDETERMINATE` rate. Label
every row `(mixed-tuple calibration)`.

### F5 — Medium-High — The capability-boundary block states no design constraints

Sources: `.agents/TODO.md:110-123`; `.agents/NEXT.md:58-66`;
`.agents/rounds/2026-08-31-rejected-experiments-closeout.md:54-71`; `eval/qa/run-qa.mjs:558-580`;
`eval/qa/run-qa.mjs:585-615`; unmerged snapshot commit `fb9a35eb`.

Problem. Method 1 added two sentences to `agentPrompt()` inside `eval/qa/run-qa.mjs`. The exact
text was `QA_RAVEN_CAPABILITY_BOUNDARY`. The queue records none of the following four constraints.

1. It never names the changed surface. `agentPrompt` is a measurement-contract artifact. It is not
   a product surface. Raven ships its prose in `src/mcp/tools.ts` (`SERVER_INSTRUCTIONS`, tool
   descriptions, schema `.describe()` strings), in `search` `nextSteps`, in `src/adapters/` hints,
   in `src/policy/truncate.ts` footers, and in `src/executor/providers.ts` error strings.
2. It never states the comparability cost. `runIdentity()` hashes every `.mjs` under `eval/qa/` and
   `eval/lib/` into `qaImplementationSha256`. It hashes `run-qa.mjs` again into `runnerFileSha256`.
   The paired contract requires a shared QA implementation. A prompt-mechanism arm therefore cannot
   reuse any stored baseline. **Both arms must be collected fresh under one modified runner.** That
   doubles the paid cost of the next A/B.
3. It never states that the prompt already carries the general rule. `eval/qa/run-qa.mjs:596` and
   `:614` already say: "If the tools cannot support an answer … say that plainly and briefly
   instead of guessing or playing along." Method 1 added more words to a surface that already said
   it. The `run-evals` prose-surface check names this exact pattern and tells the author to prefer
   a mechanism.
4. It never names the product hypothesis. No file in `.agents/` states the target behavior at the
   capability boundary as an observable in an answer.

Consequence. "A stronger mechanism" has no definition. The next author can repeat Method 1 in a new
form. The doubled-cost constraint appears only after a brief is written and reviewed.

Required repair. Rewrite the item. Name the product hypothesis. Restrict candidate mechanisms to a
shipped surface or to a non-prose mechanism. Record the comparability constraint and its budget
consequence. See section 7.

### F6 — Medium — Four monitor triggers cannot fire as written

Sources: `.agents/TODO.md:126-132`; `.agents/TODO.md:33,40`; `.agents/TODO.md:99-108`;
`.agents/TODO.md:87`.

(a) Friendbot. The item says "the same failure appears in two unrelated cases". It never describes
the failure. It gives no case id, no symptom, and no ledger path. The only description on `main` is
one table row at `.agents/rounds/2026-08-29-five-track-same-100.md:553`: "Friendbot Testnet-only
wording … with Testnet, Futurenet, and local Quickstart." The detailed record never merged. A
second occurrence cannot be matched against an undefined first occurrence.

(b) Repository-tooling recovery. The block gate is "a free Horizon probe returns `28`". The queue
never names the command. The one recorded reading needed a local Raven server on port 8788 and an
exact question string. That detail lives only in `sls-080`'s `recurrences[]`. `sls-080` carries no
`probe:` frontmatter, so `npm run improvements:probes` never runs it. Six findings carry a probe.
None of them is a Scout finding. The item names no cadence and no owner.

(c) Vendor short-token prefix. The item says "or a re-vendor changes the rule". That check is
mechanical, but the item records neither the file nor its hash.
`src/catalog/vendor/search-scoring.ts` hashes to
`718924d10533ea49d472602f600ece0e4d7a0aae3e9e0ca5a95d9a8c6e611b14` today. That value equals the
pin in the attempt-three ledger.

(d) Routing trigger T4. It needs "two unrelated live routing misses with transcripts". No file
holds the tally. "Unrelated" has no definition. The queue does not say whether a miss on one of the
19 frozen positives counts. It must not count. Those misses are the reason the box existed.

Consequence. Four triggers look active and are unfireable. Monitor-only work that cannot escalate
is dead weight in the queue.

Required repair. Give each monitor a one-line "what counts" definition, an evidence pointer, and a
named free check. See section 7.

### F7 — Medium — The routing completion gate is weaker than the frozen acceptance table

Sources: `.agents/TODO.md:90-92`; against `brief-fable.md` sections 8 and 17.

Problem. `TODO.md:90-92` says: "Done when: a protocol-history or incident question surfaces
`scout.searchResearch` in `search`, measured on the routing eval rather than on this one case." The
real bar is the section 8 table. It requires 8/8 and 11/11 positives in the top five, 0 control
captures on both contracts, legacy within ±3 of 208/279/311, skills top-1 at or above 16, holdout
10/22/25 with at most 11 forbidden captures, extended at least 90/109/117 with accept-either
122/122, and an unchanged strict top-1 for `q-protocol-version-history-list`.

Consequence. Attempt three reached original top-five 7/8 and blind top-five 10/11. It captured 2/4
and 7/9 controls. Under the `TODO.md` sentence that reads like progress toward done. Under section
8 it is a `FAIL`. A future agent can close the item on the weaker sentence.

The larger risk follows. Attempt three landed one positive short on each contract. A T2 decision
that lowers the bar to 7/8 and 10/11 would convert the recorded `FAIL` into a `PASS` with no new
evidence. That is the post-hoc goal change the pre-registration exists to prevent. Nothing in the
queue forbids it.

Required repair. Replace the "Done when" with a reference to the section 8 table. Add an
anti-retrofit rule: a T2 bar change may not cite a spent attempt's own misses as its reason.

### F8 — Medium — A round is listed as finished with its closeout obligation unmet

Sources: `.agents/NEXT.md:36-38`; `.agents/skills/run-evals/SKILL.md` Step 7 and its checklist;
`eval/qa/README.md`.

Problem. `NEXT.md:36-38` lists `.agents/rounds/2026-08-29-five-track-same-100.md` under "Ledgers
for the finished blocks". The `run-evals` Step 7 says: "The committed record is the READMEs —
update the relevant lane README's results section with the exact results-file stamp, the numbers
table, and honest reading notes." The checklist repeats it. `eval/qa/README.md` has no section for
`2026-08-30T03-43-11-variantA.json`. It mentions that run once, for a cost figure only, at line
826. Its newest same-100 section is 2026-08-28.

Consequence. The most expensive measurement in the repository is invisible in the committed QA
record. That run cost `$40.9579502` over 314 paid calls. It used rubric `v2.9` and a pinned
register. It scored 45 correct, 42 partial, and 13 wrong. It carries a full independent review and
the decision `VALID WITH A T4 EXCEPTION`. A reader of `eval/qa/README.md` takes the 2026-08-28
numbers as current. Those numbers are 45C/35P/16W/4E under rubric `v2.8` with no register.

Required repair. Add a `.agents/TODO.md` item to land the 2026-08-30 same-100 section in
`eval/qa/README.md`. Stop listing the round as finished until it lands. The work is free and
offline.

### F9 — Medium — Durable content lives only in the deletable handoff file

Sources: `.agents/NEXT.md:5`; `.agents/NEXT.md:88-89`; `.agents/NEXT.md:128-149`;
`.agents/TODO.md:135-136`; `.agents/README.md`.

Problem. `NEXT.md:5` says: "Delete or rewrite this file when the block is done." `.agents/README.md`
gives `NEXT.md` the lifetime "until that block is done". Three durable items sit only in that file.

1. `sources.locate` (`NEXT.md:88-89`). `NEXT.md:4` states that "`TODO.md` holds the full item
   text". No `sources.locate` item exists in `TODO.md`. A Large deferred program loses its only
   queue pointer when block 2 finishes.
2. The two open owner decisions (`NEXT.md:128-149`). `TODO.md:135` routes them here on purpose.
   `.agents/README.md` says the opposite for binding content: "A decision that should bind future
   work belongs in `AGENTS.md`, a skill, or an ADR under `research/decisions/`."
3. The accepted `symmetric-caution` disposition (`NEXT.md:20-21`). The substance is safe. ADR-0008
   already fixes the accepted set as "exactly base reserve, Horizon lifecycle, and RPC pagination".
   Only the operational disposition is at risk.

Consequence. A rewrite of `NEXT.md` silently drops a deferred program and two unanswered owner
questions.

Required repair. Add a one-line `sources.locate` item to `TODO.md` that points at
`ideas/source-delivery-ranked-references.md` section 8. Move the two owner decisions to a durable
location. See section 7.

### F10 — Medium — Trigger T1 has three different definitions

Sources: `.agents/NEXT.md:103`; `.agents/TODO.md:84`; `brief-fable.md` section 16.

Problem. The brief says: "Two hashes change together." It names
`inventory/stellar-light.json` against `1a261c4a…8671b0`, and the `x-routing` object hash against
`468a9d98…ba716b`. `NEXT.md:103` compresses this to "T1 is an upstream card change". `TODO.md:84`
compresses it to "T1 is an upstream `x-routing` change for `GET /api/research`". The two
compressions disagree with each other and with the brief.

Consequence. `inventory/stellar-light.json` moves on any Stellar-Light surface change. The daily
drift CI touches it routinely. The `NEXT.md` form therefore fires on ordinary drift. The `TODO.md`
form drops the inventory half. Neither form carries a hash, so no reader can evaluate the trigger
from the queue.

Required repair. State the conjunction and both pinned hashes once in `TODO.md`. Have `NEXT.md`
point at that text.

### F11 — Medium — No free instrument watches the frozen protocol-history contracts

Sources: `eval/gates.json`; `.github/workflows/ci.yml:96-113`; `eval/EVALS.md:20-21`.

Problem. `eval/gates.json` has no protocol-history entry. Its top keys are `$comment`,
`gradingRule`, `baselinedAt`, `evidence`, `note`, `legacy`, `skills`, `holdoutNote`, and `holdout`.
CI runs `eval:selftest`, `eval:qa:lint`, `eval:qa:register --check`, and `eval:routing --gate`. CI
never runs `npm run eval:protocol-history`. `eval/EVALS.md:21` calls that instrument "free,
seconds".

Consequence. An unrelated scoring, catalog, or vendor change can move both frozen contracts and
nobody sees it. That is also the cheapest possible detector for a T1-class upstream card change.
The queue instead asks a human to compare two hashes by hand.

Required repair. Record both contract counts in every round that touches `src/catalog/**`,
`catalog/manifest.json`, `scripts/build-catalog.mjs`, or `src/catalog/vendor/search-scoring.ts`.
Keep it a recorded diagnostic. Do not promote it to a gate. The one-headline and two-gate contract
stays intact.

### F12 — Low-Medium — Rejected-experiment provenance depends on unreachable commits

Sources: `.agents/rounds/2026-08-31-rejected-experiments-closeout.md:11-12`.

Problem. The closeout cites snapshot commits `6baec0a4a1e0fc5b84ccce30a656af7f9ddcaa68` and
`fb9a35ebb5f76bad773050c2977deabe77ab74da`. `git branch -a --contains` returns nothing for either
commit. No `refs/pull/*` ref is fetched. Both objects resolve in this clone only. Both PRs closed
without merge. The 339-line Method 1 round ledger in that snapshot never landed on `main`. The
merged record is a 20-line section.

Consequence. The design detail the next capability-boundary plan needs (F5) lives only in
unreachable objects. One `git gc --prune` removes the local copies. This repeats a lesson the
repository already learned: git ancestry does not prove content survival.

Required repair. Extract the load-bearing facts into the merged record. Record the mechanism text,
the file it edited, the five-track T3 result, the control result, and the environment-hash delta.
A `git bundle` of both snapshots is an acceptable alternative.

### F13 — Low — A broken measurement and a product failure are reported as one result

Sources: `.agents/TODO.md:115-116`; `.agents/NEXT.md:62-63`;
`.agents/rounds/2026-08-29-five-track-same-100.md` stopping rules.

Problem. The queue reports two facts in one breath. The Raven trap failed five-track T3. The
inherited environment hash differed from the registered value `f17ba7ff…41a42ff`. The first is a
result. The second is a broken measurement. The five-track stopping rules say: "Stop if the
recorded environment hash changes between methods."

Consequence. A reader treats the negative result as stronger than the evidence supports. The pin
also stays broken for the next diagnostic.

Required repair. Separate the two statements. Make the environment-hash repair a stated
prerequisite of the next diagnostic. State the two options: re-derive and re-register the watched
hash, or record why it moved.

### F14 — Low — Open items are missing from the ranked blocks

Sources: `.agents/NEXT.md:56-105`; `.agents/TODO.md:12-18`; `.agents/TODO.md:99-108`;
`scripts/improvements-lint.mjs:294`.

Problem. `NEXT.md` claims to rank the remaining work. The vendor short-token monitor
(`TODO.md:99-108`) appears nowhere in `NEXT.md`. The `#1031` watch (`TODO.md:12-18`) appears only
in the state block, not in a ranked block. `sls-080` is `reported-upstream` with issue `#1134`
open, and no watch item covers it. `npm run improvements:lint -- --live` checks intake repository
reachability only. It never checks issue state. Neither issue has a mechanical watcher.

Consequence. Two open items sit outside the ranking. The upstream watch coverage is asymmetric. A
retired finding has a watch; an active one does not.

Required repair. Rank every open `TODO.md` item in `NEXT.md`. Replace the single-issue watch with
one rule covering every `reported-upstream` finding.

### F15 — Low — Two instruction surfaces carry a stale headline denominator

Sources: `eval/EVALS.md:25`; `eval/EVALS.md:39-40`;
`.agents/skills/run-evals/SKILL.md` "Denominator note"; against `eval/qa/README.md:8` and
`eval/qa/README.md:621` and the compiled `eval/qa/cases.json`.

Problem. `eval/EVALS.md` says the main battery holds 499 cases. It calls 499 "the authoritative
current denominator … as of 2026-08-19". The `run-evals` denominator note repeats 499. The compiled
`eval/qa/cases.json` holds 500 cases. `eval/qa/README.md` records 500 as of 2026-08-28.

Consequence. `run-evals` tells every round to re-read `eval/EVALS.md` as "the current truth". Two
of three instruction surfaces disagree with the artifact on the headline denominator.

Required repair. Update both surfaces to 500 as of 2026-08-28. Keep the historical chain intact.

## 4. Human decisions

### D1 — Authorize an over-selection rule for paired collections

Exact question. May a future paired collection select more than 100 case IDs, so that at least 100
survive the T4 and T5 union exclusion?

Options.

| Option | Effect |
| --- | --- |
| A. Authorize over-selection (recommended) | A new pinned set of about 108 IDs. At least 100 survive typical exclusion. The method can reach a verdict. |
| B. Keep exactly 100 selected | The method stays at high risk of `INDETERMINATE`. The observed record is one failure in one attempt. |
| C. Retire the paired method | No further paired spend. The repository keeps sample-30 and diagnostics only. |

Evidence needed. None beyond what exists. `eval/qa/paired-verdict.mjs:15` fixes
`MINIMUM_ELIGIBLE_IDS = 100`. The validator gives mean eligibility 95.959 of 100 and a 99.356%
terminal `INDETERMINATE` rate. The one real artifact lost one ID to a T4 contradiction and returned
`INDETERMINATE` at 99 eligible IDs.

Safe default. Option A. It costs nothing to decide. It is a planning rule, not a run. It touches no
gate and no frozen contract. The paired lane keeps its own denominator, so no lane merges. A larger
eligible denominator makes the published n=100 tables conservative, not optimistic. The new pinned
set needs its own recorded identity hashes.

This decision does not authorize a collection. Paid authorization stays separate.

### D2 — Choose a product-loss margin for the paired QA method

Exact question. What is the largest true drop in end-to-end answer quality that you will accept
from a change that the paired method passes?

Options. `0.05`, `0.08`, or `0.10`, expressed as a proportion of the two cumulative-grade
components.

Evidence needed. Two things, in this order. First, D1 must resolve, because a method that cannot
return a verdict has no use for a margin. Second, one same-tuple pinned pair must exist, so that
`npm run eval:qa:paired:validate -- --recalibrate <baseline> <candidate>` can replace the
mixed-tuple tables. The current tables use the 2026-08-27 and 2026-08-28 discordance upper bound
across different judge-tier contracts.

Safe default. Defer. Do not choose from the current table. Every number in it changes at
recalibration. The queue's own instruction is "Choose the largest acceptable product loss from
product impact. Do not choose it from power alone." A power table cannot answer a product question.
The correct sequence states the tolerance first and then reports what it costs.

An interim answer is available at no cost. The owner can state the tolerance in plain product terms
now, for example: "I will not ship a change that costs more than N points of correct answers on the
same pinned set." The method then reports whether it can detect that at acceptable error rates.

### D3 — Decide whether protocol-history routing can reopen

Exact question. Do you want to change the frozen control set or the 19/19 positive bar (trigger
T2), or open a new box for a non-card evidence source (trigger T3)?

Options.

| Option | Effect |
| --- | --- |
| A. Neither; stay trigger-only (recommended) | The box stays spent. Reopen needs T1 or T4 evidence. |
| B. T3, a new non-card box | A new brief for corpus-derived route vocabulary. It needs the pre-registration list in brief section 16. Its review must pass before any fetch. |
| C. T2, change the contract | Attempt three's recorded `FAIL` could become a `PASS` with no new evidence. |

Evidence needed for option C. New evidence that the current bar is wrong. That evidence must not be
a spent attempt's own misses.

Safe default. Option A. Section 9 of this report gives the reasoning.

### D4 — Authorize the deploy of the merged Playground change

Exact question. Do you want to deploy the merged Playground composer fix (`3c7f0e5`) to
production?

Options. Deploy now; deploy with the next production change; or hold.

Evidence needed. `npm run test:smoke` passes, because `src/demo` changed. The full baseline passes.
The secrets scan is clean.

Safe default. Deploy with the next production change. The fix is user-facing and includes an
accessibility repair, so an indefinite hold is the worst option. This lane did not read production
and cannot confirm the live state.

## 5. Evaluation ladder

Each stage lists its entry gate, instrument, exit gate, and authorization boundary. A stage never
inherits the authorization of the stage below it.

| Stage | Entry gate | Instrument | Exit gate | Authorization boundary |
| --- | --- | --- | --- | --- |
| L0 Free baseline | Any change to tracked files | `npm run typecheck`; `npm test`; `npm run build`; `npm run eval:selftest`; `npm run eval:qa:compile`; `npm run eval:qa:lint -- --since <ref> --stale`; `npm run eval:qa:register -- --check`; `npm run eval:routing -- --gate`; `npm run secrets:scan -- --tree`; add `npm run test:smoke` when `src/executor` or `src/demo` changes | All pass. The gate verdict is recorded. | None needed. Free and offline. |
| L1 Frozen offline diagnostics | A change to `src/catalog/**`, `catalog/manifest.json`, `scripts/build-catalog.mjs`, or `src/catalog/vendor/search-scoring.ts` | `npm run eval:protocol-history`; the extended lane read from the same routing run | Both contract counts are recorded in the round ledger | None needed. Free. This stays a diagnostic. It is never a gate. |
| L2 Reviewed plan | A block needs a new mechanism | A pre-registered brief: mechanism, inputs, metrics, acceptance table, stop rules, leakage guards, tuning guards | An independent reviewer returns `PASS` after full reconciliation. A major revision needs one bounded delta re-review. | A plan `PASS` authorizes implementation only. It never authorizes a run, a fetch, or a paid call. |
| L3 Free or cache-only referee | L2 `PASS` and a recorded 40-character implementation commit | One deterministic referee. One invocation. One result file. | The acceptance table returns a verdict. A separate lane re-verifies the result from the same inputs. | None needed. Any terminal outcome spends the attempt. |
| L4 Paid focused diagnostic | L2 `PASS` for a question that no offline instrument can answer. All pins restored: watched-environment hash, agent binary hash, server revision, surface SHA-256, clean tree. A stated product gate exists. | `node eval/qa/run-qa.mjs --ids …` with exactly one `--max-budget-usd` | The artifact is complete, cost-complete, pin-complete, and comparable. The stated product gate passes or fails. | Its own bounded owner authorization, scoped by call count. A diagnostic authorization never transfers to a headline. |
| L5 Paid headline | L4 passed its product gate. A pre-spend adversarial review of the round brief passed. | `run-qa.mjs` sample-30 for the headline lane, or the pinned same-100 for the paired lane with its own denominator | The `run-evals` Step 7 closeout completes: lane README updated with the stamp, the numbers, and reading notes; every failure triaged; findings filed in `improvements/`; the ledger Outcome closed. | A separate owner authorization per method. A re-run needs its own authorization. |
| L6 Paired promotion | Two same-tuple pinned arms exist. Each has at least 100 eligible IDs after union exclusion. One frozen register is pinned across all arms. | `npm run eval:qa:paired -- <b> <c> --json`, then `npm run eval:qa:paired:validate -- --recalibrate <b> <c>` | Recalibrated tables exist. The owner margin decision is recorded in a durable file. | L5 twice. |

Two actions sit outside this ladder. A production deploy needs its own owner authorization. An
upstream message needs a `verified` finding and the `improvements-pipeline` intake rule.

## 6. Block map

### Actionable now, free, no owner input

| Item | Source | Note |
| --- | --- | --- |
| Repair F2, F3, F7, F10, F13, F14, F15 | `.agents/NEXT.md`, `.agents/TODO.md`, `eval/EVALS.md`, `run-evals` | Documentation only |
| Land the 2026-08-30 same-100 section in `eval/qa/README.md` | F8 | Free and offline. It closes a `run-evals` Step 7 obligation. |
| Record the mechanism detail from the two unreachable snapshots | F12 | Free. It protects the next capability-boundary plan. |
| Give each monitor a "what counts" line and a named check | F6 | Free |
| Draft the capability-boundary plan for L2 review | `.agents/TODO.md:110-123` | Free until the review passes |

### Owner-blocked

| Item | Decision |
| --- | --- |
| Paired method promotion | D1, then D2 |
| Protocol-history reopen through T2 or T3 | D3 |
| Playground deploy | D4 |
| Any paid diagnostic or headline sample | Bounded spend authorization at L4 or L5 |

### Evidence-triggered, no action now

| Item | Trigger | Detector today |
| --- | --- | --- |
| Repository-tooling recovery v3 | A free Horizon probe returns `28` | None. See F6(b). |
| Docs-versus-repository conflict | Three recurrences | None |
| Ranking selection for recovery | Three recurring misses | None |
| Friendbot network-context | Two unrelated cases, a contract mismatch, or trace evidence | None, and the failure is undefined. See F6(a). |
| Vendor short-token prefix | A second unrelated case, or a re-vendor | Partial. The hash check is possible but unrecorded. See F6(c). |
| Protocol-history routing | R1 to R4 in brief section 16 | None. See F10 and F11. |
| `sources.locate` phase-zero study | `ideas/source-delivery-ranked-references.md` section 8 | None, and no `TODO.md` item exists. See F9. |

### Upstream-blocked

| Item | State |
| --- | --- |
| `sls-074` and Stellar-Light/stellarlight#1031 | Open. The maintainer owns the close. Do not post reminders. |
| `sls-080` and Stellar-Light/stellarlight#1134 | Open. `reported-upstream`. No watch item exists. |
| `sd-047` and stellar/stellar-docs#2805 | Open. `reported-upstream`. |

### Complete

| Item | Evidence |
| --- | --- |
| Golden metadata remainder | PR #106 merged as `0916e09`. The `NEXT.md` "Completed blocks" section can be deleted; its retained rule already exists at `.agents/skills/golden-truth/SKILL.md:212`. |
| Judge-stability register refresh | The count held at 57. The TODO is closed. |
| `qa-five-track-v1`, paired verdict, judge `v2.10`, golden lifecycle contracts | Implemented |
| Protocol-history attempts one, two, and three | Three verified `FAIL` results. The box is spent. |
| Repository tooling recovery v2 and the QA capability-boundary prompt | Rejected. Recorded in the 2026-08-31 closeout. |

## 7. Suggested `.agents/` edits

### E1 — `.agents/TODO.md`, "Improvements backlog"

Replace the single `#1031` watch with one rule. Substance: "Every `reported-upstream` finding
carries an upstream reference. The next improvements round records the state of each one.
`improvements:lint -- --live` checks intake repository reachability only; it never checks issue
state. Open references today: `sls-074` at stellarlight#1031 (the finding is retired; the
maintainer owns the close), `sls-080` at stellarlight#1134, and `sd-047` at stellar-docs#2805.
Untouched open issues stay quiet. Do not post reminders. Done when: the next improvements round
records every state."

### E2 — `.agents/TODO.md`, "Routing", recovery item

Fix the status word and make the gate executable. Substance: replace "`sls-080` is a verified
active Scout finding" with "`sls-080` is `reported-upstream` at
https://github.com/Stellar-Light/stellarlight/issues/1134." Then add: "The free reading is a
`scout.explainRepo` call against a local Raven server. It asks 'Which Horizon ingestion constant
pins the highest supported protocol version, and what is its value?' for `stellar/stellar-horizon`.
The last reading returned `25` at `2026-08-31T01:42:10.098Z` with scanned ref
`82660510ecda7fd365a14d08badb9d85fa22bc32`. Take one reading per improvements round. Record it in
`sls-080`'s `recurrences[]`. An `http-text` probe on the upstream endpoint is an option; free-text
substring matching over a model answer is weak, so a human reads the value."

### E3 — `.agents/TODO.md`, "Routing", protocol-history item

Three changes.

1. Rename the triggers to `R1` to `R4`. Add one sentence: "`R1` to `R4` are the brief section 16
   triggers `T1` to `T4`. This queue renames them, because `T1` to `T5` already name the five-track
   tracks."
2. Restate `R1` with its conjunction and both hashes: "`R1` fires when both hashes move.
   `inventory/stellar-light.json` differs from `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0`.
   The `x-routing` object at `openapi.paths['/api/research'].get` differs from
   `468a9d9834e8cb50cb905f80ccc42f9d3daa7a3d0ff2d8c5194d566812ba716b` under `JSON.stringify`.
   Routine inventory drift alone does not fire `R1`."
3. Replace the "Done when" with: "Done when the section 8 acceptance table in
   `.agents/rounds/2026-09-01-protocol-history-attempt-three/brief-fable.md` returns `PASS` on a
   reviewed mechanism. That table is 8/8 and 11/11 positives in the top five, 0 control captures on
   both contracts, and every routing lane intact. A fix that only helps one case is unshipped. An
   `R2` bar change may not cite a spent attempt's own misses as its reason."

Also record for `R4`: "A miss on one of the 19 frozen positives never counts toward `R4`. Record
each qualifying miss here with its date, its question, and its transcript path."

### E4 — `.agents/TODO.md`, "Eval instruments", vendor short-token item

Add the mechanical check. Substance: "The rule lives in `src/catalog/vendor/search-scoring.ts`. Its
SHA-256 is `718924d10533ea49d472602f600ece0e4d7a0aae3e9e0ca5a95d9a8c6e611b14` today. A changed hash
means a re-vendor. Compare it during any catalog or scoring round."

### E5 — `.agents/TODO.md`, "Eval instruments", capability-boundary item

Replace the item body. Substance:

- Product hypothesis: state the target behavior as an observable in an answer. Method 1 targeted an
  offer of a lookup that no exposed operation supports.
- Rejected mechanism: two sentences appended to `agentPrompt()` in `eval/qa/run-qa.mjs`, in the
  unmerged snapshot `fb9a35eb`. It failed five-track T3. The external lookup control was partial.
- Constraint 1: `eval/qa/run-qa.mjs` is a measurement-contract file, not a product surface. Raven
  ships prose in `src/mcp/tools.ts`, `search` `nextSteps`, `src/adapters/`,
  `src/policy/truncate.ts`, and `src/executor/providers.ts`.
- Constraint 2: any edit to a `.mjs` file under `eval/qa/` or `eval/lib/` changes
  `qaImplementationSha256` and `runnerFileSha256`. A prompt-mechanism arm cannot reuse a stored
  baseline. Both arms must be collected fresh under one runner. Budget for two arms.
- Constraint 3: `run-qa.mjs` already tells the agent to say plainly when the tools cannot support
  an answer. The `run-evals` prose-surface check therefore disqualifies more words. Prefer a
  mechanism.
- Prerequisite: re-derive and re-register the watched-environment hash, or record why it moved from
  `f17ba7ffa59d9bcb58cd45601ced3a2cde358565c1a49997c485f53c141a42ff`.
- Done when: an independently reviewed plan names the mechanism, the surface, the diagnostic, the
  acceptance table, and the stop rules. The plan review authorizes implementation only. The
  diagnostic run needs its own bounded spend authorization. A headline sample needs a separate
  authorization after the diagnostic passes its product gate.

### E6 — `.agents/TODO.md`, "Eval instruments", Friendbot item

Define the failure. Substance: "The case is the Friendbot network-context row from the 2026-08-30
same-100 collection. The observed defect is Testnet-only wording where Testnet, Futurenet, and a
local Quickstart all apply. The record is
`.agents/rounds/2026-08-29-five-track-same-100.md`, final review reconciliation table. Done when
the same wording defect appears in a second unrelated case, a contract mismatch appears, or trace
evidence shows the prompt requests the wrong behavior. Record each occurrence here with its case id
and its result stamp."

### E7 — `.agents/TODO.md`, new "Deployment" section

Add: "### Deploy the merged Playground composer fix. PR #99 merged at `3c7f0e5` on 2026-08-30. It
changed `src/demo/budget.ts`, `src/demo/chat.ts`, and `src/demo/page.ts`. Production still runs the
2026-08-28 version. The change adds a character counter, an over-limit state that disables Send,
`aria-invalid`, and a screen-reader announcement. Prerequisite: `npm run test:smoke` passes,
because `src/demo` changed. Forbidden without owner authorization: the deploy itself. Done when the
new production Worker Version ID is recorded and a live `/playground` check confirms the limit
behavior."

### E8 — `.agents/TODO.md`, new "Eval records" section

Add: "### Record the 2026-08-30 same-100 round in `eval/qa/README.md`. The `run-evals` Step 7
closeout requires the lane README to carry the stamp, the numbers, and reading notes. The section
is missing. The round is `.agents/rounds/2026-08-29-five-track-same-100.md`. The stamp is
`2026-08-30T03-43-11-variantA.json`. Its SHA-256 is
`211577ce0dcb7c994dcc1bbec0be7cc0fca534c6638be261420d21a761502387`. The counts are 45 correct, 42
partial, and 13 wrong. The tuple is `claude-sonnet-5` / `claude-sonnet-5` / `v2.9` / `p5` with a
pinned register. The decision is `VALID WITH A T4 EXCEPTION`. Result JSON files stay local. Done
when the section lands and `NEXT.md` stops listing the round as finished."

### E9 — `.agents/TODO.md`, new "Deferred programs" section

Add: "### `sources.locate` source-delivery program stays deferred. The owner deferred it on
2026-08-28. The design note is `ideas/source-delivery-ranked-references.md`. Its section 8 holds
three alternative reopen paths and four preconditions. One independently reproduced high-impact
user block opens a phase-zero study. Two unrelated reproduced incidents also open it.
Evaluation-only evidence needs three verified cases across two repositories and two fact classes,
with one case outside the current golden family. No trigger authorizes implementation. Done when a
trigger fires and the owner approves a phase-zero spike, or the note is retired."

### E10 — `.agents/NEXT.md`, "State at handoff"

Two edits. Change line 14 to "`sls-080` is `reported-upstream` at
https://github.com/Stellar-Light/stellarlight/issues/1134." Change "PR #99 shipped" to "PR #99
merged", and add "It is not deployed."

### E11 — `.agents/NEXT.md`, "Completed blocks"

Delete the whole section. `golden-truth` already owns its retained rule at
`.agents/skills/golden-truth/SKILL.md:212`. PR #106 records the work. A completed block in a ranked
handoff invites a reopen.

### E12 — `.agents/NEXT.md`, "Owner decisions"

Replace with four decisions in this order: D1 over-selection, D2 margin, D3 routing reopen, D4
Playground deploy. Present D1 before D2, and state why. Add the terminal `INDETERMINATE` column to
the margin table. Label every row `(mixed-tuple calibration)`. Add: "Record each answer in
`research/decisions/` or `eval/qa/README.md` before deleting the question, per `.agents/README.md`.
Do not leave a pending decision in this file alone."

### E13 — `.agents/NEXT.md`, "Ranked blocks"

Rank every open `TODO.md` item. Add the vendor short-token monitor, the `#1031` watch, the
`eval/qa/README.md` record, the Playground deploy, and the `sources.locate` deferral. Keep the
one-line-per-item form.

### E14 — `.agents/NEXT.md` and `.agents/TODO.md`, naming

Apply the `R1` to `R4` rename from E3 in both files. Write "five-track T3 (safety)" wherever the
track is meant.

## 8. Residual uncertainty

These facts the available evidence cannot settle from this lane.

1. **Production state.** This lane did not read production. The audit forbids a live fetch. F1
   rests on the queue's own dates and on local git history. The deployed version could differ from
   the recorded Worker Version ID.
2. **Whether the Playground change is intentionally held.** No file states a hold. A silent hold and
   a forgotten deploy look identical from the repository.
3. **The exact Friendbot failure.** The only surviving description on `main` is one table row. The
   detailed record is in the unmerged PR #103 branch. This lane did not open the unreachable
   snapshot's ledger, because the queue does not cite it as evidence.
4. **Whether an upstream `http-text` probe can reliably read the Horizon constant.** The probe
   runner supports `contains` and `excludes` over response text. A DeepWiki answer is free-form
   model text. No Scout finding in the repository carries a probe, so no precedent exists.
5. **Whether over-selection changes the paired operating characteristics in a way the current
   validator does not model.** The validator reports n=90 and n=100 only. A run with 104 eligible
   IDs should be at least as good as the n=100 row. This lane did not run the simulator at a third
   denominator.
6. **Whether attempt three's 7/8 and 10/11 result is close to a real ceiling or far from it.** The
   three attempts share one evidence source: catalog card text. The strict reachability audit found
   0-of-8 and 0-of-7 content-token overlap on two positives. That supports a vocabulary gap, not a
   ranker gap. It does not prove what a non-card source would achieve.
7. **The other auditors' conclusions.** This lane read no other report by instruction. Overlap and
   disagreement are unknown to it.
8. **Whether the two closed PR branches still exist on GitHub.** This lane made no network call.
   Local reachability is `false` for both snapshot commits.

## Answers to the brief's questions

1. **Omissions.** Yes. The merged, undeployed Playground change (F1). The `eval/qa/README.md`
   record for the 2026-08-30 round (F8). The `sources.locate` deferral has no `TODO.md` item (F9).
   The `sls-080` upstream watch is missing (F14).
2. **Completed work kept active.** Not in a harmful way. The `NEXT.md` "Completed blocks" section
   holds a finished block only to carry a rule that `golden-truth` already owns. Delete it (E11).
   The reverse error occurs instead: one round is listed as finished with its closeout obligation
   unmet (F8).
3. **Prerequisites, permitted actions, forbidden actions, and completion gates.** Partly. The
   routing block is the strongest; it names forbidden actions precisely. The capability-boundary
   block names no prerequisite and no design constraint (F5). Four monitors have completion gates
   that cannot fire (F6). One completion gate is weaker than its own frozen contract (F7).
4. **Capability-boundary design constraints.** No. See F5. Four constraints are missing. The
   comparability constraint alone doubles the next A/B's cost.
5. **Diagnostic against headline separation.** Mostly correct. The queue says the diagnostic needs
   independent review before a headline sample, and that Method 1's result does not authorize
   Method 2. It omits one step: the diagnostic run itself costs money and needs its own bounded
   authorization. Method 1 cost `$0.4597096`.
6. **Evidence needed before a stronger mechanism ships.** Nine items, in order. A named product
   hypothesis. A prose-surface inventory with transcript evidence that the agent read past existing
   guidance. A mechanism on a shipped surface, or a non-prose mechanism. A pre-registered diagnostic
   with positives and clean controls; the Method 1 control was only partial, and a control that
   does not separate cannot grade a trap. An independent plan review by a lane that is neither
   author nor orchestrator, at high effort. Restored measurement pins, including the watched
   environment hash. A comparability plan: two fresh arms for a harness-side mechanism, or a
   routing-gate re-run plus a server pin for a `src/` mechanism. Bounded spend authorization for
   the diagnostic. A separate authorization for any headline sample after the product gate passes.
7. **Paired owner decision object.** No. It presents the margin without the denominator fact that
   dominates it (F4). It also drops the calibration label, and it asks for a product judgment while
   showing only a power table.
8. **Artifacts and reviews still blocking paired promotion.** Four. One over-selection decision
   (D1). Two same-tuple pinned arms, each with at least 100 eligible IDs, under one pinned register.
   One recalibration through `eval:qa:paired:validate -- --recalibrate`. One recorded owner margin
   decision in a durable file. Each paid arm needs a pre-spend review and its own authorization.
9. **Should protocol-history routing stay trigger-only.** Yes. Three mechanisms failed the same
   way. Attempt three solved recall: blind top-five rose from 3/11 to 10/11 and original top-five
   rose from 4/8 to 7/8. It failed on collateral damage: legacy fell to 220/266/276, holdout
   forbidden captures rose to 19, extended fell to 55/89/96, and the protocol-version top-one
   flipped. That pattern is consistent across mechanisms. `scout.searchResearch` carries 25 positive
   clauses against a catalog median of 6, so any support-growing or fit-based reranker raises it
   everywhere. Meanwhile the strict audit found zero content-token overlap on two positives. A
   card-text mechanism must bridge a gap that card text does not contain, and its only lever floods
   the other lanes. A fourth card-text attempt is predicted to fail for the same reason. Keep it
   trigger-only, and disfavour a T2 contract change.
10. **Are T1 to T4 sufficient, measurable, and resistant to goal changes.** Sufficient in kind: new
    upstream text, new evidence source, new live evidence, and an owner override. One gap remains:
    no trigger covers an incidental movement from unrelated scoring work, and no free instrument
    watches it (F11). Measurable: `T1` yes in the brief but not in the queue (F10); `T4` no (F6d);
    `T2` and `T3` are decisions and are labelled correctly. Resistant: partly. `T2` is the hole.
    Attempt three landed one positive short on each contract, which makes a bar change tempting.
    Add the anti-retrofit rule in E3.
11. **Sequencing.** Mostly correct, with three defects. Repository recovery correctly sits behind a
    free probe, but the probe has no named command, cadence, or detector. `sources.locate` sits
    correctly behind a measured trigger, but it has no `TODO.md` item. Friendbot and the token
    prefix sit correctly in monitor-only, but neither can escalate. The upstream watches are
    asymmetric: a retired finding has one, and an active one does not.
12. **Task categories.**

| Need | Tasks |
| --- | --- |
| Human product judgment | D2 margin; D3 routing reopen; the capability-boundary product hypothesis |
| Human spend authorization | D1 follow-on collections; any L4 diagnostic; any L5 headline; a recovery collection after the `28` reading |
| Independent model review | The capability-boundary plan; any new routing brief; any pre-spend round brief |
| Mechanical checks only | The `sls-080` status repair; the denominator repair in `eval/EVALS.md` and `run-evals`; the vendor hash comparison; `npm run eval:protocol-history`; the `eval/qa/README.md` record; the `R1` hash comparison |
| Owner authorization outside evals | D4 Playground deploy |

13. **Weak evidence.** Five statements. The `sls-080` status is contradicted by its own file (F2).
    The paired margin table rests on a mixed-tuple upper bound and loses that label in the queue
    (F4). The rejected-experiment provenance rests on unreachable commits (F12). Two instruction
    surfaces carry a stale 499 denominator against a 500-case artifact (F15). The Method 1 negative
    result is reported beside a broken environment pin, which weakens it (F13). By contrast, every
    lint, count, and hash claim this lane re-checked was exactly right.
14. **Block-by-block plan.** Five steps, in order.

    - Step 1, free and immediate: apply E1 to E14. Land the `eval/qa/README.md` record. Extract the
      snapshot detail. No spend. No owner input. Exit when the queue has no contradiction and every
      monitor can fire.
    - Step 2, owner: answer D1 and D4. Both are cheap. D1 unblocks the paired programme. D4
      unblocks a user-facing fix.
    - Step 3, free: draft the capability-boundary plan under the E5 constraints. Send it to an
      independent reviewer at high effort. The reviewer differs from the author and the
      orchestrator. Exit at a reviewer `PASS`. That `PASS` authorizes implementation only.
    - Step 4, owner: authorize the focused diagnostic with a bounded call count. Run it at L4. Read
      it against its stated product gate. Stop there if it fails. A failure spends that mechanism,
      not the block.
    - Step 5, owner: after a diagnostic pass, authorize a headline sample separately. Close it under
      the `run-evals` Step 7 checklist.

    Guard against accidental reopening: the protocol-history box is spent, so no step above touches
    it. Repository recovery stays monitor-only until its free reading returns `28`. The
    `sources.locate` note stays deferred. Each step names its own exit, so no step inherits the
    authorization of the step before it.
15. **Exact `.agents/` edits.** E1 to E14 in section 7.
