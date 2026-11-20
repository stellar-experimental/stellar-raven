# TODO — own-repo work queue

Own-repo work only: adapters, catalog, executor, scoring, eval instruments, goldens, gates, and
documentation. Upstream service defects go to [`improvements/`](../improvements/README.md).

Add an item when you find work you are not doing now; delete it when done (git history is the
archive). State what is wrong, current state, next step or trigger, and "done when". Keep history in
the linked ledger. Every item follows the spend rules in
[`AGENTS.md`](../AGENTS.md#spend-and-evidence).

## Priorities

"Round item N" is an item of the [2026-11-16 round](rounds/2026-11-16-next-phase.md). Its
[plan](rounds/2026-11-16-next-phase/PLAN.md) proposes; the
[owner decisions](rounds/2026-11-16-next-phase/DECISIONS.md) bind.

1. Dated truth maintenance, started by timers on agentpc. Run 2.1 on 2026-11-23 18:00 UTC must
   merge before 2026-11-25 00:00 UTC. Runs 2.2a, 2.2b and 2.2c follow on 2026-11-30, 2026-12-01 and
   2026-12-04. After them comes the register maintenance lane ("Close the register entries the
   dated runs leave open").
2. One Workers Logs session on the Mac on 2026-11-25: "Watch sign-in rejects after the
   oauth-provider 1.x deploy", "Decide the `execute` timeout from one more Workers Logs read" (with
   its `recoveryHint`, `skipped`, `errorName` and user-agent questions), "Read the `skill_read`
   shape distribution", and "Confirm `npm run mcp-key` on wrangler 4.164.0".
3. Owner decisions (the list at the end).
4. Free own-repo fixes that need no paid measurement: the case-file move once every dated run and follow-up has merged and `systemctl --user list-timers`
   on agentpc shows no `raven-dated` or `raven-watchdog` unit.

Everything not named here is a hold, a monitor, or waits on its trigger. Do not start one without
its trigger.

No third tuning loop (owner, 2026-11-16, decision 1). A QA headline run starts only when a named
decision needs it (`run-evals` section 1); it needs no approval. The general routing repair stays
held until new mechanism evidence exists. The tool surface stays trimmed `search` + `execute`
([ADR-0011](../research/decisions/0011-tool-surface-stays-code-mode-trimmed.md); live-data loss
accepted in [decision 5](rounds/2026-11-16-next-phase/DECISIONS.md), reopened by a fix that keeps
most of the token saving).

## Held-out status

The first-principles split is void, because the 2026-11-14 golden coverage audit rebuilt the
battery. The current split, the held-out status that the dated runs read, is drawn by the rule in
[`eval/qa/README.md`](../eval/qa/README.md) ("Held-out split") from the 247 headline cases:

- SHA-256 `6a032d098ea9f8e4dadcfdd4599d610d1d2eca9d704d6bb1a30c7f71c144c85f`.
- 98 tuning, 105 held-out, and 44 reserve cases.
- The file is on the owner's Linux machine at `~/backups/gca-2026-11-14-split-v12.json`. Tuning
  scans pass `--split ~/backups/gca-2026-11-14-split-v12.json`.
- An earlier split file, a Mac copy of one, or an id list taken from one is stale. The
  [round ledger](rounds/2026-11-16-next-phase.md) holds the SHA-256 and the reason of every
  amendment.

State and rules:

- Two tuning loops tuned on the tuning rows ([loop 1](rounds/2026-11-14-baseline-tuning.md),
  [loop 2](rounds/2026-11-15-tuning-loop-2.md)).
- The audit's battery test read the answers of 70 headline cases before the draw
  ([ids](rounds/2026-11-14-golden-coverage-audit/qa/ids.txt)).
- The baseline and one read per loop ran the held-out rows, counts only. The stored held-out reads
  and their thresholds are on 119 rows, and a future read pairs on the current split's 105
  held-out rows.
- An item may name a case by ID; never record which set a case is in, and tune no product change
  on a held-out or reserve case.
- A golden-maintenance lane may open and edit a held-out or reserve case without moving it, under
  the conditions in the README's "Held-out split" ("Maintenance exception").
- Routing and discovery rows whose question matches a QA headline question are confirmation-only:
  [`eval/routing-qa-overlap.json`](../eval/routing-qa-overlap.json) lists them, and no lane tunes
  on them or reads their per-row output ([`eval/README.md`](../eval/README.md), "Confirmation-only
  rows").

## Caps audit follow-ups

Source: [caps audit](../research/audits/2026-11-14-caps-audit.md) and round items
[3.1](rounds/2026-11-16-next-phase/items/3.1/EXEC.md) /
[3.2](rounds/2026-11-16-next-phase/items/3.2/REPORT.md). Standing limits live in
[`ARCHITECTURE.md`](../ARCHITECTURE.md) §7; only the `execute` timeout is open.

### Decide the `execute` timeout from one more Workers Logs read

`EXECUTE_TIMEOUT_MS` is 60 seconds, which matches Codex's default `tool_timeout_sec` (60s), so a
run near the limit can lose its structured timeout result to the client. Round item 3.1 found no
failed `execute` past 59s in 6.5 days, but platform queries returned no rows for cancelled or
disconnected `POST /mcp` invocations past 59s. Keep 60s until the read below finishes.

Next: one free Workers Logs read on the Mac on 2026-11-25 (priority 2; Workers Logs keep at most 7
days) covering:

- Row type discovery: group one recent hour by `$metadata.type` to find which row type carries
  path `/mcp`, user-agent, `$workers.wallTimeMs`, and `$workers.outcome` (earlier filters on
  `$metadata.type = "cf-worker-event"` returned no rows).
- Wall time and outcome of `POST /mcp` invocations over 59 seconds (decides the timeout).
- User-agent families (attributes the client loops in "Triage the runtime and client gaps from the
  HackMeridian telemetry").
- Keys `recoveryHint`, `skipped`, and `errorName` by name (feed that triage item and "Explain the
  soft-empty and skipped-write anomalies from the production read").

Done when: the `execute` timeout decision (keep 60s or change) is recorded in the round ledger or
an ADR; figures stay in the owner's private evidence folder.

### Re-verify each external client limit before changing model-facing text

`test/helpers/mcp-tool-metadata.ts` and `test/mcp-instructions.test.ts` pin client text limits
measured on 2026-11-14 in [`research/audits/2026-11-14-client-text-limits.md`](../research/audits/2026-11-14-client-text-limits.md)
(Claude Code 4,096 up front / 16,384 tool search / 25k-token output / 50k spill; Grok 2,033 cut
plus marker and 20k-byte result clip; Codex ~230-char catalogue line + full instructions appended;
OpenCode 120-char listing; claude.ai/Desktop drops server instructions per `anthropics/claude-ai-mcp#93`).
`test/mcp-instructions.test.ts` pins instructions and both tool descriptions under Grok's 2,033 cut
(1,899, 1,960, and 1,964 chars today, with self-contained first lines).

State on 2026-11-18: agentpc runs newer client versions (Claude Code 2.1.327, Codex 0.169.0, Grok
1.0.88), but re-verification waits on the trigger below.

Trigger: before changing server instructions or tool descriptions, or when a client's release notes
name an MCP text limit (a version bump alone does not fire it). Check Grok's 2,033-char cut first
via the audit's "Re-verifying the external facts" table.

Done when: the audit table matches current client versions and `test/mcp-instructions.test.ts`
still holds.

## Tuning loop 2 follow-ups

Record: [loop 2 ledger](rounds/2026-11-15-tuning-loop-2.md).

### Carry the guard to absence-of-standard statements

The corroboration guard addresses claims a source makes, not bare absence statements (e.g., "no
official standard or SEP") inferred from empty hits. In loop 2, P2 and R read 0 violations in 25
and 20 claim-word answers, and readers disagreed on whether absence-inferred statements violated the
rule. Do not reword on that evidence.

Held: zero P2/R violations, reader disagreement, and no third tuning loop (owner decision 1).
Trigger: the next corroboration-guard revision, or a QA/production transcript review surfacing
repeated bare absence-of-standard claims with the guard present.

Done when: readers agree on the class on a panel with enough absence rows, and a general wording
change is measured against the unchanged sentence.

### Watch required-service coverage on the 58-row panel

Monitor: `npm run eval:plan` covered 58/58 rows' required services in P0, 56 in P1, and 55 in P2
(verdicts did not move; the planner does not list `stellarOrg`).

Trigger: the next 58-row panel run. Done when: it reports coverage against 55/58, and any drop to
53 or fewer is traced in transcripts before shipping.

### Test the `stellarOrg` result rule for the corroboration guard

`stellarOrg` stays outside the corroborating families (each result carries the guard line;
`eval/qa/claim-read-brief.md` treats `get_page` as class 2 for SDF programmes and class 3 for
governance/incidents). Neither the rule nor its over-hedging risk is tested (0 claim statements in
P2/R rested on `stellarOrg`).

Held: no judged run with enough `stellarOrg`-backed claim answers is scheduled (P2 called it on 3/58
rows; no third tuning loop). Trigger: the next judged QA run (e.g., "Prove the stellar.org source")
or corroboration review producing at least 5 claim-word answers resting on `stellarOrg`; do not run
a dedicated collection for this alone.

Done when: readers score violation and over-hedge counts on at least 5 such answers; change the rule
only on that read.

## Family decider follow-ups

### Hold the sealed FAM confirmation rows

82 FAM confirmation questions, written without goldens and labeled by two lanes, stay sealed and
unspent ([record](../research/audits/2026-11-14-family-decider.md);
[decision](rounds/2026-11-16-next-phase/DECISIONS.md), "Follow-up answers (2026-11-17)"). SHA-256:
`07587dc04e2c993a92736d18610e4fc8fa78e04e77541863df4cfa83c85244ec` (held by the orchestrator; second
copy of `~/backups/fd-2026-11-14/split/` on the Mac).

Single-use rule: spend them once, only on an answer-outcome test (not routing reach) with a
pre-registered pass rule and named decision. No test is planned.

Done when: spent once on such a test, or retired by the owner; record which.

## Golden answers

### Prove the stellar.org source

`stellarOrg.search_site` and `stellarOrg.get_page` shipped in tuning loop 2
([ledger](rounds/2026-11-15-tuning-loop-2.md)) and are **unproven**: P2 called the source on 3 of 12
tuning rows citing stellar.org (5/12 cannot reach a cited page from the question as written); 1
answer used a fact from it and 0 verdicts moved. `search_site` returns up to ~21,700 chars and was
ignored on 2/3 rows. Harm is clean only down to what T=5 on 58 rows can detect.

- **Routing reach (accepted, owner 2026-11-17):** top-5 on 8/40 off-golden questions; displaces
  non-SDF cards on 0/1/3 of 25 at limits 5/7/10 ([3.3 MEASURE.md](rounds/2026-11-16-next-phase/items/3.3/MEASURE.md)).
  General ranker tweaks failed no-loss; no `stellarOrg`-only rule. Reopen only on a production
  transcript where a `stellarOrg` card cost an answer.
- **Algolia `pages` index (held):** ranked ~5/9 missed body-text phrases in top 4 (2026-11-14
  dashboard check; audit coverage unconfirmed). Add depth only on a production detail-lookup
  failure, using a search-only key.

Done when: a run on the 12 source rows shows the source supplying a judged fact, or the owner
accepts it as a coverage fix without a scored gain.

### Re-verify the event-tied goldens after SCF #46 Panel Review and the Bell vote

`npm run eval:qa:lint -- --stale --enforce-floors` fails every pull request once a `reverifyBy`
date passes. Six cases keep dates before 2027 because each depends on a known event:

- **SCF.** `q-scf-current-round` is due 2026-12-04. The RFP Scout-lag check is done: the audit
  retired five of the six RFP cases, and the survivor (due 2027-01-28) records that Scout and the
  official page both listed the two Q4 briefs on 2026-11-14.
- **Bell/P30 Mainnet vote, 2026-11-23 17:00 UTC.** `q-pc-protocol-upgrade-timing`,
  `q-protocol-version-history-list`, and `q-edge-fresh-latest-protocol-version` are due 11-24.
  `q-hist-quantum-preparedness-plan` is due 12-01. `q-infra-software-versions-current-protocol`,
  which states the Protocol 29 release set, is due 11-30; `--stale` lists it. The
  `mainnet-protocol-29` source sentinel fires when Mainnet activates Protocol 30. Update the
  register's Bell date trap in the same change.

Round items carry the work. Item 1.4 staged it as timer-started dated runs
([PRESTAGE.md](rounds/2026-11-16-next-phase/items/1.4/dated/PRESTAGE.md)): 2.1 on 2026-11-23
18:00 UTC edits the three cases due 11-24 and the quantum case, and merges before 2026-11-25 00:00
UTC, when the stale lint starts failing every pull request on them; 2.2a, 2.2b and 2.2c take the
rest on 2026-11-30, 2026-12-01 and 2026-12-04. A run that cannot show the event extends the dates
and schedules its own follow-up. Each run updates its own bullet here.

Use the `golden-truth` skill, then `npm run eval:qa:register`.
[Ledger](rounds/2026-11-12-truth-maintenance.md).

Done when: no battery case has a `reverifyBy` date before 2027-01-01.

### Close the register entries the dated runs leave open

The owner adopted the maintenance exception (2026-11-17; rule in
[`eval/qa/README.md`](../eval/qa/README.md), "Held-out split"; answer in
[DECISIONS.md](rounds/2026-11-16-next-phase/DECISIONS.md), "Follow-up answers (2026-11-17)"). The
dated runs keep their narrow scope: a run closes its reopened register entries all or none, and
closes none when it could not read every member (orchestrator's answer 2 (1) in
[`QUESTION.md`](rounds/2026-11-16-next-phase/items/1.4/QUESTION.md)). Such an entry stays at
`reopen`. Count left open so far: none recorded yet. Each dated run adds its count here.

Next, after round item 2.2c: one maintenance lane under the exception reads every member of each
left-open entry and closes or accepts it. Its brief must claim the exception and name the trigger
(a register entry that an earlier edit reopened). It must also override the "Never open a held-out
or reserve QA case" rule in `ITEM-LEAD.md`.

Folded corpus-guide audit (deferred from item 8.2, which could not open `.ignore`d corpus paths):
also audit `eval/qa/corpus/README.md` and `eval/corpus/PROVENANCE.md` against the code and fix
what is stale (neither file is QA case text, and no other lane has read them). Because the
maintenance exception restricts its own session to work made necessary by the qualifying trigger
(`eval/qa/README.md`, "Held-out split": "its sessions do no other work"), run this two-guide audit
as a separate post-2.2c session and PR (not inside a maintenance-exception session, and even if the
dated runs leave zero open register entries), with a brief authorizing only those two guide paths,
or have the owner accept both guides as unaudited.

Done when: the left-open register count is zero (or the owner accepts the entries still open), and
both corpus guides are checked and corrected in that separate post-2.2c pass (or the owner accepts
them as unaudited).

### Golden follow-ups from the sls-024 and sls-029 cap review

From [review-caps-fable.md](../research/audits/2026-11-12-truth-maintenance/review-caps-fable.md):
reword the "state-conditional sls-024 discriminator" label on `q-live-fluxity-status-provenance`
(grading rule holds; editing notes changes the frozen `live-data-canonical-v3` digest).

Trigger: next deliberate live-contract revision. Done when: that revision carries the reworded
label.

### Resolve held source ownership and bounty policy

Three corrections from [source triage](../research/audits/2026-11-03-qa-followup/additional-source-triage.md)
and [bounty access record](../research/audits/2026-11-03-qa-followup/bounty-policy-access.json)
remain held (do not infer from search snippets):

- **RWA:** source owner, measurement period, denominator, and component set.
- **Phoenix:** source owner, dated submission IDs, and award-status filter reconciliation.
- **Bounty:** readable current controlling HackerOne policy revision.

Held: primary evidence was unpublished or returned an application error on 2026-11-03. Trigger:
primary evidence becomes readable, or a `golden-truth` / `improvements` review touches one of the
three topics.

Done when: primary evidence supports a reviewed correction or an explicit continued hold.

### Review the codegen-adjacent goldens by case id

The [2026-08-07 codegen partner report](../research/audits/2026-08-07-codegen-partner-report.md)
found no battery case directly testing its Soroban defect classes. Cases below are nearest matches
or carry a stale pointer (ids and fields only):

| Case id | Field | Concern |
|---|---|---|
| `q-zk-nullifier-storage` | golden | Closest to persistent-collection vs. entry-cap gap; not a match |
| `q-soroban-wasm-size-limit` | avoid clauses | Same gap; adjacent only |
| `q-sor-decode-hosterror-codes` | golden | Closest to event-assertion reset and auth-error-surface gaps |
| `q-soroban-unit-testing` | notes | Points at a case id absent from the owned battery |
| `q-sor-testing-negative-auth-events` | none in owned battery | Exists only in retired prior art; author or reroute pointer |
| `q-sor-evm-to-soroban-porting` | golden | Only EVM-vocabulary entry; retrieval-vocabulary candidate |

Four unowned topics: entry-cap write failure on growing persistent collections, per-call reset of
test-side event reads, auth failure error remapping, and `try_*` client method semantics.

Held: coverage gaps and stale pointers are not maintenance-exception triggers
([`eval/qa/README.md`](../eval/qa/README.md), "Held-out split"), so opening held-out/reserve cases
amends the split. Trigger: next deliberate corpus-coverage revision.

Done when: each row is edited via `golden-truth`, confirmed unchanged, or rerouted, and each topic
is authored or declined with a reason.

## Improvements follow-up

Recheck only when the named trigger fires (full per-finding tables in the
[2026-11-05 ledger](rounds/2026-11-05-truth-maintenance.md)).

- **sls-116** (stellarlight#1952; inbound handoff #427 closed 2026-11-19, item 8.12b): all three
  items reproduced on 2026-11-17 (Scout 1.9.150) with no reply. Trigger: Scout release touching SCF
  data or reply on #1952. Check: (1) `GET /api/projects/search?scfAwarded=true&limit=100` (offsets
  0–700) names `soroban-contract-source-verification-service-bax` (official page shows
  `lastAwardedRound` 44); (2) a public endpoint serves the 27-award baseline; (3) `peer` carries
  non-null `scfSourceUrl` and `scfAsOf`. Retire only when all three are sourced or declared out of
  scope; comment upstream only on a change.
- **sls-121, sls-122** (Scout wallet findings, 2026-11-17): 5 `Live` wallet rows with gone
  operators (`sls-121`); `q=wallet` repeats `coca` (196 rows for `total` 195, `sls-122`). Trigger:
  Scout release touching wallet rows or project search.
- **Docs pull requests:** unmerged PRs, blockers, and triggers (including draft2752, generated-skill
  PR3069, and author-owned protocol PR2059) live in the
  [Docs table](rounds/2026-11-05-truth-maintenance/docs.md) and
  [continuation table](rounds/2026-11-06-remaining-sweep/docs.md). Recheck pages after deployment
  (green checks close nothing); answer substantive review on PR2059 without keepalive rebases.
- **Software Versions (not filed).** Protocol 30 is live on Testnet, but
  https://developers.stellar.org/docs/networks/software-versions.md lists nothing above
  Protocol 29. Upstream normally adds a version around Mainnet activation. The dated run 2.2a
  (2026-11-30, merge before 2026-12-01 00:00 UTC) owns the recheck: if Mainnet runs Protocol 30
  and the page still lacks it, it files the finding as the class of resolved sd-008
  ([ledger](rounds/2026-11-10-truth-maintenance.md)) and
  [PRESTAGE.md](rounds/2026-11-16-next-phase/items/1.4/dated/PRESTAGE.md) says how. The
  orchestrator's deadline overrides the earlier "on or after 2026-12-01".
- **ll-022, ll-023, ll-024:** original records lack reproducible errors; obtain original/corrected
  records or an owner explanation before closure or renewal
  ([table](rounds/2026-11-05-truth-maintenance/other.md)).
- **cs-006:** Paxos `stellar.toml` wording still reproduces with no public owning repo. Hold until
  an intake repo is found or the owner authorizes published support contact.
- **sk-031:** orphan legacy skill still live. Trigger: owner applies the workflow cleanup patch;
  verify both skill URLs and preserve preview deployments.
- **Coins.ph (not filed):** Scout partner profile describes current PHP ramps while marked `aging` /
  `isCurrent: false`. File only if it drops that flag while keeping the claim.

Done when: each triggered check has a fresh live result and independent retirement review, or a
precise remaining defect in its active finding.

### Monitor the Horizon protocol-ceiling note

The Scout DeepWiki note for `stellar/stellar-horizon` goes stale at protocol bumps (failed as
`sls-087` and `sls-115`; passed 2026-11-16 at value 30, `scannedRef` `01ba44a9`,
[item 0.2](rounds/2026-11-16-next-phase/items/0.2/EXEC.md)).

Trigger: each improvements or drift round. Run one free local `scout.explainRepo` query on
`stellar/stellar-horizon`: "Which Horizon ingestion constant pins the highest supported protocol
version, and what is its value?" Record value, `generatedAt`, `scannedRef`, and `answerSource` in
the ledger. Passes only when the value matches source at `scannedRef`; on failure, file a finding
citing both receipts.

The backing repository-recovery program stays rejected
([closeout](rounds/2026-08-31-rejected-experiments-closeout.md); earlier candidate in closed PR
#102 at `6baec0a4`). Passing readings authorize nothing. Reopening requires three qualifying
positive operation-selection misses (Docs-vs-repo conflicts stay monitor-only until three dated
successful Docs-first → inspect → `scout.explainRepo` re-executions), a reviewed plan citing
ADR-0008, and the 10/12 positive + 0/8 premature-detour gate.

Done when: a reviewed v3 plan ships, or the owner retires the recovery program.

## Routing

Search stays lexical-only (owner, 2026-11-03;
[results](rounds/2026-11-03-model-ranking/results.md)). Repairs must not depend on model evidence.

### Preserve structured routing intent across extraction caps and gate tiers

The scorer flattens phrases, truncates at early tokens, lets generic schema words and substrings
satisfy the coverage gate, and lets five weak gated rows beat strong ungated evidence. About 30
lexical designs across four rounds ([2026-10-08](rounds/2026-10-08-maintenance.md),
[2026-10-09](rounds/2026-10-09-backlog/routing-design/),
[2026-10-28](rounds/2026-10-28-routing-repair.md),
[2026-11-02](rounds/2026-11-02-routing-repair.md)) and 8 model-ranking variants failed acceptance
checks, so the current scorer stands.

Held: no baseline change or operation/question-specific exception authorized. Trigger: owner
authorization for a general scoring repair with new mechanism evidence.

Held by this item:

- **Excluded Scout ops (`src/policy/scout-exposure.ts`):** `GET /api/rwa` (issue #167 closed
  2026-11-18 after three pre-registered answer tests returned exclude:
  [6.3 RESULTS](rounds/2026-11-16-next-phase/items/6.3/RESULTS.md),
  [RESULTS-2](rounds/2026-11-16-next-phase/items/6.3/RESULTS-2.md),
  [7.2 RESULTS](rounds/2026-11-16-next-phase/items/7.2/RESULTS.md); reopen only on `/api/rwa`
  schema change, general mixed-intent routing, or owner product need — never on routine drift, and
  any re-test needs an owner or orchestrator decision),
  `GET /api/quality`, `reviewSubmission`, `analyzeHackathonSubmissions`, `getHackathonSubmission`,
  and `locateSource`.
- **Builder extraction of Scout enums and examples:** `scripts/build-catalog.mjs` turns input-schema
  enum values into `keywords` (`anchor`, `dex`, `rpc`, `indexer`) and generic `exampleQuestions`
  tokens into `routingKeywords` (`stellar`, `building`, `use`, `show`), admitting
  `analyzeHackathonSubmissions`, `getHackathonSubmission`, and `searchHackathonBuilds` to
  non-hackathon pages ([evidence](rounds/2026-10-28-routing-repair/verify/final.md), O3). Fix with
  this repair (needs the 12 checks below plus the verify lane's 22 hackathon negative probes, with
  no graded loss).
- **Mixed-intent controls:** three `it.fails.each` cases in `test/drift-141-routing.test.ts`; remove
  `.fails` when the repair passes.
- **Zero holdout headroom (`eval/gates.json`; #223 closed):** `top1` is at floor 12, `top3` at
  floor 26, and `forbiddenCaptures` at ceiling 11 (`top5` is 30 vs. floor 29). Any single-row loss
  or extra capture fails the gate.
- **`SKILL_DESCRIPTION_OVERRIDES`** holds `skills.stellar-dev.dapp`'s search text.
- **Known test/selector traps from prior rounds:** `test/search.test.ts` (`rfp` case) relies on
  schema-only `scout.getRfps` admission; check 11 is a selector gap in `src/catalog/search.ts`
  (quota replacement cannot fire above quota). Restore legitimate recall before removing spurious
  schema/substring admission; measure all 544 rows on current and fresh sources (helper:
  `rounds/2026-10-09-followup/routing-step1/acceptance.mjs`, measuring its own baseline).
- **Optional no-loss lane (64 FAM dev rows):** archived in agentpc bundle
  `~/backups/raven-next-phase/raven-branches-2026-11-16.bundle` (`refs/heads/exp/family-decider`,
  `.agents/rounds/2026-11-14-family-decider/sets/fam.development.discovery.json`) and
  `~/backups/fd-2026-11-14/split/` (Mac copy held by orchestrator), SHA-256
  `0246ad022163f1d67247671b8ed640d7bb61f1aec6cad65a937ffa33b56cf89c`. Move into `eval/discovery/`
  only as part of that attempt.

Acceptance checks:

1. Protocol-history additions do not remove `yieldblox` or `reflector` intent.
2. `through`, `network`, `each`, and `walk through` cannot route alone.
3. `contract` cannot route `explainRepo` without a repository or code anchor.
4. Added `use` cannot promote `hackathonBrief` above account-merge Docs.
5. `has` cannot match inside the schema keyword `phase`.
6. Strong Docs evidence remains eligible after five weak gated Scout candidates.
7. All eight regression rows meet their clean grades.
8. A general RWA query reaches `scout.getRwaAssets`, while unrelated Friendbot, RPC, WASM,
   simulation, and balance questions do not capture it.
9. The leaderboard and RFP improvements remain.
10. The legacy, skills, and holdout routing gates pass, with no extended-diagnostic regression.
11. A controlled-vocabulary operation reaches the top five for general directory-taxonomy queries.
12. On a fresh Scout snapshot (1.9.71+), the four real 1.9.71 regressions meet main grades,
    `reviewSubmission` does not rank on non-hackathon questions, and absorb needs only a
    manifest-fingerprint re-baseline.

Done when: all twelve checks pass in a reviewed general scoring/builder change, and
`analyzeHackathonSubmissions`, `getHackathonSubmission`, and `searchHackathonBuilds` no longer enter
non-hackathon pages in the 544-row corpus or the verify lane's 22 hackathon negative probes, with no
graded loss.

### `search` does not surface the research lane for protocol-history questions

`scout.searchResearch` does not rank in top 10 for protocol-history or standards questions
(`stellarDocs.*` wins). Three reviewed attempts failed
([last record](rounds/2026-09-02-protocol-history-free-evidence.md)); the v2 contracts
([decisions](rounds/2026-09-03-owner-decisions.md)) specify 19 required, 9 forbidden, and 4 neutral
cases.

`npm run eval:protocol-history` stops as `source-expired` (v2 contracts pin an old manifest epoch);
do not repin them. Run it as a free diagnostic after changes to `src/catalog/**`,
`catalog/manifest.json`, `scripts/build-catalog.mjs`, or `src/catalog/vendor/search-scoring.ts` and
record its output.

Held: owner ruled on 2026-11-16 (decision 6(a)) that the 2026-11-14 baseline did not meet PH4 and
PH3 does not open. Reopen rules:

- **PH4 (new live routing evidence):** two dated transcripts from different question families and
  entities showing the same absent-lane pattern, neither paraphrasing a frozen positive. Opens a
  token-reachability audit; owner then decides on PH3.
- **PH3 (new non-card evidence box):** owner-opened for corpus-derived route vocabulary or another
  non-card source, with an independently authored contract on an accepted epoch and a
  pre-registration brief carrying every item from the attempt-three brief §16 that passes
  independent review before any fetch.

The **identifier pointer** is part of this hold. Loop 2's host-pointer trial R did not ship (21%
per-fire follow rate vs. >33% bar; 0 traced verdict moves; archived in
`~/backups/raven-next-phase/raven-branches-2026-11-16.bundle`, `refs/heads/tune/loop-2-runs`,
commits `a49ee918`, `940dc013`, replay `3d65d0ff`). Carry two fixes into any later attempt: select
identifiers from the question rather than the first three seen, and do not fire on a `get_doc_page`
path already being read. A later attempt also needs a different surface and a case where the exact
row supplies judged facts beyond a preamble.

Done when: a reviewed mechanism passes both contracts (19/19 required top-5, 0 forbidden) and all
routing gates. For a pointer attempt: a general mechanism raises per-fire follow rate >33% on
SEP/CAP rows and lifts ≥2 distinct rows by traced cause, with no grade, cost, or trap regression,
over ≥17 rows run twice.

### Stop identity substitution on spelling-corrected matches

On `q-edge-strupey-ambiguous-stellar-history`, one run treated Stroopy.AI as the asked entity
despite Scout's `caveat: "unverified-match"`
([result](rounds/2026-10-10-weekend/answer-style/result-v2.md)). Scout's `didYouMean` path needs no
change.

Held: single-row residual risk, model-facing fix requires paid verification, and no third tuning
loop is planned. Trigger: a second distinct ambiguous-entity case or production transcript
presenting an `unverified-match` result as the asked entity, or the next deliberate answer-style or
adapter-envelope revision.

Done when: a reviewed general mechanism (no per-question rule) makes both runs flag identity as
unverified or ask for context, with no abstention/absence regression.

### Re-check the upstream codemode short-token repair

Two upstream `@cloudflare/codemode` bugs reproduce through `0.5.6`:

- **`cs-001`** ([Cloudflare #2296](https://github.com/cloudflare/agents/issues/2296)): false routing
  on short-token prefixes (Raven mirrors the rule; reverse-prefix deletion and Porter stemming
  failed coverage — do not use query exceptions or a tuned length threshold).
- **`cs-012`** ([Cloudflare #2897](https://github.com/cloudflare/agents/issues/2897)): non-Error
  throws reach Raven as `error: undefined` (`ok: true`; no local workaround). Upstream
  [#2898](https://github.com/cloudflare/agents/pull/2898) (open) turns them into `ok: false` with
  `String(err)` (model-facing) and reserves `String`, `Object`, `Proxy`, `JSON`, `Math`,
  `Uint8Array`, `ArrayBuffer`, `btoa`, `atob` (none collides with Raven).

Trigger: `@cloudflare/codemode` release past `0.5.6` carrying either fix. For `cs-012`, re-run the
[item 5.2 scratch repro](rounds/2026-11-16-next-phase/items/5.2/EXEC.md) and retire `cs-012` via
`improvements-pipeline`.

Done when: upstream or general local fixes pass original triggers, positive controls, and routing
gates, and both findings are retired.

### Revisit general directory admission after the rejected D3 experiment

D3 failed its answer gate on 2026-09-17 and did not ship; the directory field-placement exception
remains a known design risk ([evidence](../research/audits/2026-09-17-routing-audit/m1-c1-passkeys-loss-review.md)).
Do not repeat D3 or add entity-specific exceptions.

Held: same trigger as "Preserve structured routing intent across extraction caps and gate tiers",
or a routing defect traced directly to the directory field-placement exception.

Done when: a general mechanism passes frozen routing controls and independently reviewed answer
checks.

### Re-evaluate Scout exposure after a routing-contract change

Trigger: a new Scout inventory changes `x-routing`, description, request schema, or response schema
of `GET /api/quality` or `GET /api/verify` (version-only bumps do not count). `scout.verifyClaim`
ships only after general Scout routing regressions resolve
([review](rounds/2026-09-03-truth-maintenance/final-routing-review-terra.md)). Last fired
2026-11-16 (Scout 1.9.150): `GET /api/quality` stayed excluded
([SCOUT-EXPOSURE.md](rounds/2026-11-16-next-phase/items/0.2/SCOUT-EXPOSURE.md)).

When triggered: rebuild catalog/surfaces, run exposure tests and `npm run eval:routing -- --gate`
without changing `eval/gates.json`, and record manifest hash and lane totals.

Done when: a changed contract passes the gate and independent review; otherwise both stay in
`EXCLUDED_SCOUT_OPS`.

### Re-expose `scout.matchPartners` when `sls-123` is fixed

`scout.matchPartners` was excluded on 2026-11-17 (round item 5.1; `eval/gates.json` `evidence.notes`
quotes owner authorization for raising holdout `forbiddenCaptures` ceiling 10→11 for this removal
only). The adapter's 503 hint stays and routes to `scout.getPartners`.

Trigger: `sls-123` ([stellarlight#1976](https://github.com/Stellar-Light/stellarlight/issues/1976))
verified live (one POST from the finding returns 200 with `matches`; single call only — upstream
model-backed).

Re-exposure steps:
1. Delete `["POST /api/partners/match", "matchPartners"],` from `EXCLUDED_SCOUT_OPERATIONS`.
2. Reverse edits in [item 5.1 EXEC.md](rounds/2026-11-16-next-phase/items/5.1/EXEC.md).
3. Run per-case routing comparison on both manifests.
4. Restore holdout ceiling to 10 if comparison shows 10 captures; otherwise report the count.

Done when: re-exposed via steps 1–4, or owner decides to keep it removed and deletes this item.

## Executor and tool surface

### Recheck `sd-059` after upstream action on Mintlify Discovery search

`sd-059` ([stellar/stellar-docs#2995](https://github.com/stellar/stellar-docs/issues/2995)):
Mintlify Discovery rarely indexes `<ResponseField>` text. Raw-candidate comparisons ruled out
Raven's filter, site-MCP fusion/replacement failed latency/recall checks (2026-11-03), and tuning
arm 1 shipped the `stellarDocs.get_doc_page` pointer (#446,
[ARM-1.md](rounds/2026-11-14-baseline-tuning/ARM-1.md)).

Trigger: upstream action on `stellar/stellar-docs#2995` (open; last checked 2026-11-09). Re-run the
`op_bad_signer` (`pageSize: 50`) and 190-token checks in
[`improvements/stellar-docs/sd-059-responsefield-text-unsearchable.md`](../improvements/stellar-docs/sd-059-responsefield-text-unsearchable.md).

Done when: `sd-059` is fixed upstream and retired under `improvements-pipeline`.

### Fix two Raven `search` misroutes of canonical Docs pages

Raven `search` sends two questions to an operation whose path scope excludes the canonical page,
while `stellarDocs.search_docs` ranks the page in its top 5 (re-probe 2026-11-20,
[PROBE.md](rounds/2026-11-16-next-phase/items/8.13/docsprobe/PROBE.md)):

- Testnet reset: `search_soroban_contract_docs` ranks first and excludes `/docs/networks`.
- Fee sponsorship: `search_rpc_horizon_data_docs` or `search_protocol_concepts_docs` ranks first;
  both exclude `/docs/build/guides/transactions/*`.

The Custom Account example now passes on both paths. The contract-id derivation miss is Mintlify
ranking, filed as `sd-114` ([stellar-docs#3170](https://github.com/stellar/stellar-docs/issues/3170)).

Held: holdout top1, top3 and forbidden captures sit on their gate limits, and per-query exceptions
are banned. Trigger: the general routing repair ("Preserve structured routing intent across
extraction caps and gate tiers") gains headroom. Then add routing cases for both pages first; a fix
must be general and pass a free retrieval A/B ([`docs/stellar-docs.md`](../docs/stellar-docs.md#maintenance))
and `npm run eval:routing -- --gate`.

Done when: both questions reach an operation that can return the canonical page.

### Clarify the model-facing `codemode.describe` response shape

`codemode.describe` returns `{ ok: true, signature, inputSchema, ... }` at top level, while service
calls use `{ ok: true, data }`. One 2026-11-09 Playground check hit and recovered from reading
`spec.data.signature` ([record](../research/audits/2026-11-09-playground-product-decision.md)).

Held: single recovered failure does not justify a standalone model-facing eval. Trigger: repeated
`spec.data.*` shape errors in Playground/QA transcripts or production logs, or the next measured
change to `src/mcp/tools.ts`, `src/demo/tools.ts`, or `src/executor/providers.ts`.

Done when: one reviewed, measured change (docs or forward-only shape change) clarifies the shape.

### Triage the runtime and client gaps from the HackMeridian telemetry

Private evidence: `2026-10-26-hackmeridian` (`usage/README.md`). Check each before fixing:

- **`recoveryHint`:** emitted on most successful executes, so agents likely ignore it; consider
  limiting to empty, thin, or conflicting results. Read the `recoveryHint` key in the 2026-11-25
  Workers Logs session ("Decide the `execute` timeout from one more Workers Logs read").
- **Client loops:** Grok CLI 401 loop (local no-auth run in item 4.1 succeeded on protocol
  2026-07-28, pointing at OAuth), Copilot CLI 404 loop, and browser CSRF mismatch on consent.
  Reproduce against post-1.x production and attribute via the 2026-11-25 user-agent read (see also
  "Watch sign-in rejects after the oauth-provider 1.x deploy").
- **Codex / Grok ergonomics ([item 4.1 RECORD.md](rounds/2026-11-16-next-phase/items/4.1/RECORD.md)):**
  Codex often relied on the catalogue line alone and sent `execute` without `code` in 3/24 rows.
  Test a stronger first instruction line or catalogue argument hint only as a measured
  routing/description change. Grok's 20,000-byte clip lost 0/61 answers (spend/time only).

Done when: each bullet has a merged fix or a recorded "no change" decision.

### Explain the soft-empty and skipped-write anomalies from the production read

From round item 3.1:

- `lumenloop.get_scf_submissions` and `scout.getRepoTrust` returned soft-empty on most calls. Check
  triggering arguments via live probes (query text is not logged) and whether hints should suggest a
  broader call.
- Many `artifact_write` events logged `ok = false` (skipped writes log `skipped`; thrown writes log
  `errorName`).

Next: read `skipped` and `errorName` in the 2026-11-25 Workers Logs session ("Decide the `execute`
timeout from one more Workers Logs read"), and sample soft-empty `op` events by operation and
`caveat`.

Done when: each anomaly has a cause and a merged fix or recorded "no change" decision.

### Fix the `getChangelog` ranking trap for release questions

Raven lacks current npm/JSR/crates versions, latest OpenZeppelin stellar-contracts releases, and
`stellar-rpc` release dates; `search` also ranks `scout.getChangelog` (Scout's API log) above
`scout.searchResearch` (`source: "release"`). Owner decision 2 owns the release-source choice; this
item owns the ranking trap independently ("proceeds either way" in decision 2 means neither branch
resolves or blocks it).

Held: no measured demand in round item 3.1 (few first-place `scout.getChangelog` searches overall;
upper bound only since query text is not logged), the held general routing repair, and zero holdout
headroom in `eval/gates.json` (`top1` 12, `top3` 26, `forbiddenCaptures` 11). Trigger: owner
authorization for the general scoring repair ("Preserve structured routing intent across extraction
caps and gate tiers"), an Owner decision 2 choice that adds a release source and revisits
release-query routing, or production/query-log evidence of release callers hitting
`scout.getChangelog`.

Fix must be a general mechanism or description change (no operation-specific exception) passing
`npm run eval:routing -- --gate` with no holdout loss (tested on HackMeridian probes Q5, R23, R33,
R35).

Done when: the trap is fixed via a gated general change, and either the four probes pass or Owner
decision 2 leaves release data upstream and the request is filed in `improvements/`.

## Authentication follow-ups

### Watch sign-in rejects after the oauth-provider 1.x deploy

Deploy `9f01ae3e` (#484, 2026-11-18,
[DESIGN.md](rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/DESIGN.md)) switched to per-origin
providers (`<origin>/mcp`), a native-callback allowlist (`https`, loopback `http`, `claude:`,
`cursor:`, `warp:`), `404` on root `/.well-known/oauth-protected-resource`, and dropped bare-origin
grants (<10, all Devin CLI — accepted under 7.3 delegation). Immediate 150s post-deploy tail showed
0 target rejects (one `token_not_found`).

Next (priority 2, 2026-11-25 Mac Workers Logs read; 7-day window): check for:

- `auth_reject` with `redirect_refused:<scheme>` (missing native scheme in `NATIVE_REDIRECT_SCHEMES`,
  `src/auth/redirects.ts`; ignore `http` and `other`). Add schemes by name only for real clients.
- `oauth_error` with `grant_audience_unbound`, `token_audience_unbound`, or `invalid_target` beyond
  the known bare-origin class.
- `legacy_grant_resource_mismatch` and `resource_not_configured`.

Denominator rule: auth logs only failures, so count `/authorize`, `/token`, and `/register` by
status if platform rows are readable (see "Decide the `execute` timeout from one more Workers Logs
read"); otherwise note rejects-only and run one positive control (fresh Claude Code sign-in via
`claude:`).

Rollback target: Worker version `fe3708cb` (storage-compatible; strands CIMD `private_key_jwt`
clients).

Done when: the 2026-11-25 read shows no unexplained rejects (recording exact window if slipped), or
each is fixed or recorded.

## Observability and retention

### Keep 30 days of observability data, including queries and responses

Owner, 2026-11-18: "30 is an allowance, today we have 7. I'd like to convert to actually doing 30
everywhere. Do this work carefully, or plan for it maybe for now in TODO."

Current state: `/terms` (`src/site.ts`, "Operational and quality logs" and "Your choices";
counsel-owned, treated by the owner as a 30-day allowance) permits storing observability data,
"which may include the queries submitted and the responses returned, for 30 days, after which it is
deleted", with opt-out and account deletion on request. Production today keeps less:

- Workers Logs/traces/request metadata: ≤7 days (Cloudflare platform limit).
- AI Gateway request metadata: row-count policy (`docs/operations.md#data-retention`; payload
  collection off in `src/demo/model-config.ts`).
- No query or response text is logged (several TODO items assume this).
- R2 `stellar-raven-artifacts`: 7 days (result cache; whether to extend to 30 days is part of this
  design). D1 usage rows (13 months) and OAuth records do not change.

References: `docs/operations.md#data-retention`, `src/auth/retention.ts`, and
[`ideas/observability-r2-retention.md`](../ideas/observability-r2-retention.md).

Design study required before code (with Fable review and Codex frontier security review, since this
stores user content):

1. Transport & cost: Workers Logpush to an R2 bucket (30-day lifecycle) vs. tail consumer
   (`stellar-raven-usage`) writing to R2.
2. Capture set: `search` queries, `execute` code, capped tool responses (with artifact pointers),
   Playground turns. Never capture credentials or tokens (hard rule); also exclude emails and IPs
   (matching the usage-statistics promise unless the owner decides otherwise).
3. Opt-out: per-account flag keyed by hashed WorkOS subject, enforced in capture path with a test.
4. Deletion on request: delete one account's archive records by hashed subject.
5. Access: private bucket, read-only analysis tooling, never commit production data/counts.
6. Single retention constant in `src/auth/retention.ts`, enforced by bucket lifecycle and
   `test/retention.test.ts`.

Stays within `/terms` as written (no counsel review unless expanding beyond `/terms`).

Trigger: Owner decision 5 go (touches no dated-run files).

Done when: Raven's archive retains 30 days and deletes after 30 days (platform Workers Logs stay
≤7 days; AI Gateway stays on row-count policy), opt-out and per-account deletion are tested,
`docs/operations.md`, `src/auth/retention.ts`, `/terms`, and `usage/README.md` agree, TODO items
assuming no query logging are updated, the idea file is folded/deleted, and a day-31 read confirms
expiry.

## Eval instruments

### Method note: same-surface verdict noise, and the judge-tier cap

Standing note, not a task. Same-surface 50-row reruns differed on 17 rows (8 up, 9 down; 7/35 once
judge tier matched; [STEP-0-PRIME.md](rounds/2026-11-14-baseline-tuning/STEP-0-PRIME.md)), partly
from mismatched `--max-panel-cases` caps. Standing rules:

- Fix `--max-panel-cases` and the stability register across compared runs; report every changed
  row's tier and the tier-matched net beside the all-rows net.
- Treat changes inside the independent-flip null as noise (50 rows at 0.12–0.20 flip rate gives
  95th-percentile net 4–5; 0.34 gives 7); trace every moved row in its transcript before counting.
- Never read a single row's move as an effect.

Already enforced: `eval/qa/paired-verdict.mjs` (`comparisonProblems`) rejects mismatched
`tieringTuple` fields (`policy`, `judgePanel`, `stabilityThreshold`, `maxPanelCases`,
`maxPanelCasesSource`, `defaultPanelPolicy`, `stabilityRegisterSha256`) on cross-revision runs
(requiring ≥100 eligible rows for a statistical verdict), and `eval/qa/run-qa.mjs --judge-stored`
rejects mismatched `--max-panel-cases`. Remaining: sub-100 comparison paths
(`eval/qa/heldout-read.mjs`, `eval/qa/compare-architecture-ab.mjs`, manual 50-row reads) do not
enforce a matching tiering tuple, and no same-surface full-panel repeat (50+ rows, unlike loop 2's
17-row trial R) at a fixed tiering tuple on the current surface has measured the panel null directly.

Done when: either `heldout-read.mjs` and `compare-architecture-ab.mjs` enforce the full matching
`tieringTuple` and these rules move to `eval/EVALS.md`, or a same-surface full-panel repeat (50+
rows) at one fixed tiering tuple measures the null directly. Delete this note then.

### Keep OpenCode out of client diagnostics

OpenCode stays out of client diagnostics (owner, 2026-11-17; item 4.1 measured Codex CLI and Grok
CLI, [RECORD.md](rounds/2026-11-16-next-phase/items/4.1/RECORD.md)). ChatGPT and SuperGrok OAuth
logins work on Mac and agentpc (checked 2026-11-17); Anthropic is API-key-only in OpenCode and
excluded by rule.

Trigger: OpenCode appears in the production user-agent read or a reported OpenCode failure. Then
run the [`eval/EVALS.md#model-call-billing`](../eval/EVALS.md#model-call-billing) OpenCode OAuth
probe first, rewrite [opencode-mac.md](rounds/2026-11-16-next-phase/items/4.1/briefs/opencode-mac.md)
for ChatGPT, and run smoke-first under a cap. (The one allowed OpenCode use today is "Build a
subscription second judge on OpenCode when a decision needs one".)

Done when: triggered diagnostic completes or owner retires OpenCode support.

### Build a subscription second judge on OpenCode when a decision needs one

One judge exists today: Claude Sonnet via Claude Code (`eval/qa/judge.mjs`; item 8.6 removed AI
Gateway judging). No current decision needs vendor diversity. Agentpc CLI checks (2026-11-18/19):

| CLI | Tool-blind? | Evidence |
|---|---|---|
| Codex (`0.169.0`) | No (unsupported) | Offline `codex debug prompt-input` still exposes `exec`, `wait`, `request_user_input`, `collaboration` with all `--disable` flags ([8.7 EXEC.md](rounds/2026-11-16-next-phase/items/8.7/EXEC.md)) |
| Grok (`1.0.88`) | No | Probe with `--tools ""`, `--deny 'mcp__*'` still executed `read_file` ([PROBE.md](rounds/2026-11-16-next-phase/items/8.7/probes/PROBE.md)); version change or non-empty allowlist needs a new pre-registered probe |
| OpenCode (`v2.3.0`) | Yes at execution boundary | `permission: {"*": "deny"}` resolves to deny-all in `opencode debug agents --standalone` (tool defs may still reach model) |

Trigger: a decision requiring a non-Claude judge (e.g., cross-arm dispute a second Claude family
cannot settle). Steps under a cap:
1. Run the [`eval/EVALS.md#model-call-billing`](../eval/EVALS.md#model-call-billing) OAuth probe
   for `openai` (ChatGPT) or `xai` (SuperGrok); confirm model via `opencode models --standalone`.
2. Define a `judge` agent with `permission: {"*": "deny"}`, verify via `opencode debug agents
   --standalone`, and run `--standalone -m <provider>/<model> --agent judge`.
3. Calibrate on the 7 `npm run eval:qa:selftest` fixtures.
4. Verify `opencode.db` has zero tool parts for the session after every run.

Done when: calibration passes with a clean after-run check, or the decision settles without it.

### Close the remaining claim-support gaps of judge pack p9

Pack `p9` ([result-p9.md](rounds/2026-10-12-pack-p9/result-p9.md)) has known limits:

- **Long-list truncation:** an 85-row tag list clipped to 82 rows in the Nov 3 sweep
  ([ledger](rounds/2026-11-03-playground-model-sweep.md)); before another model-selection round,
  inspect the rendered pack and repair confirmed truncation.
- **Field/unit limits & probe losses:** Etherfuse 5/7 records, stablecoin issuers 41/42, ERC-8004
  0/2; 5 control rows lose 1–3 probes vs. p8; R8-1 sentence scope unresolved.
- **Capped-transcript vs. artifact gap:** agents read full payloads via `codemode.artifact.read`
  while judges see capped transcripts, leaving live aggregates ("N of M") unanchorable. Root fix: a
  gitignored per-stamp pre-cap evidence sidecar in `run-qa.mjs` preferred by the pack builder
  (runner + pack-version change; needs reviewed measurement).
- **Cited-text input check (from `fp-2026-11-12`):** the round harness called correctly quoted
  facts "fabricated" in ~2% of prototype `retrieve`/`read` answers and 0% of arm A (`search` +
  `execute`). `eval/qa/evidence-pack.mjs` omits source-basis blocks for `freshness: stable` cases,
  and non-`execute` sources had no block. Before revising `p9`/rubric, reviving a non-`execute`
  prototype, or if a cited-fact dispute appears on the committed QA judge, inspect the exact stored
  judge prompt to separate harness input, pack, and rubric causes (confirming disputes disappear
  without grading unsupported claims up).

Held: no pack revision is scheduled. Trigger: before another model-selection round (to inspect the
rendered pack and repair confirmed truncation), next deliberate `p9` revision, revival of a
non-`execute` prototype, or a cited-fact dispute on the committed judge.

Done when: a reviewed, measured later pack closes these gaps, or the owner accepts them as standing
`p9` limits.

### Decide whether a sourced summary error matches must-avoid "unsupported memory"

In review R8 (PR #264), 2/3 judges matched a misread directory status to must-avoid "Do NOT claim
unsupported memory is a source-supported current observation" (forcing `wrong` under rubric
`v2.11`), though saved evidence showed no memory. Separating misread sources from unsupported memory
is a judging-semantics change (paid 7-call self-test, independent review, paired re-judge).

Held: single historical row, not worth a standalone rubric change. Trigger: next deliberate revision
to rubric `v2.11` or judge pack `p9` (alongside "Close the remaining claim-support gaps of judge
pack p9"), or another judged run matching a sourced misread to unsupported memory.

Done when: a reviewed decision is recorded, with measurement if the rubric changes.

### Reconcile the QA answering prompt with out-of-scope goldens

`eval/qa/run-qa.mjs` asks for brief out-of-scope refusals, while goldens like
`q-edge-oos-solana-vs-aptos` and `q-raph-stolen-wallet-recovery` require decision support or
acknowledgment. The delegated 2026-10-01 adjudication keeps both
([record](rounds/2026-10-01-backlog-closeout/owner-adjudications.md), owner veto open).

Held: editing the prompt changes `qaImplementationSha256` and requires paid before/after
measurement. Trigger: owner veto of the 2026-10-01 adjudication, a prompt revision already moving
`qaImplementationSha256`, or repeated out-of-scope failures traced to the brief-refusal rule.

Done when: a reviewed decision measures a prompt change on out-of-scope cases or records why it
stays.

### Monitor Raven capability-boundary offers

Three reviewed QA cases offered a later Raven lookup by G-address or tx hash (unexposed).
Monitor-only by owner decision ([decisions](rounds/2026-09-03-owner-decisions.md),
[adjudications](rounds/2026-10-01-backlog-closeout/owner-adjudications.md)); any future fix must not
suppress public lookup guidance (`q-jutsu-check-account-history`).

Trigger: production occurrence, transcript attempting an account-scoped op, model-facing prose
advertising it, or a new distinct QA case. Reopens a free cause audit and reviewed plan (no extra
QA-prompt layer or case facts in prompts); paid diagnostics run under their own caps.

Done when: owner retires the monitor or a fired trigger reaches a reviewed resolution.

### Monitor Friendbot network-context synthesis

`q-edge-send-me-free-xlm` twice called Friendbot Testnet-only without a tool call (Docs distinguish
Testnet, Futurenet, and local Quickstart). Single-case repeats do not fire this monitor.

Trigger & done when: the same defect recurs in a second unrelated case (different question family
and primary service), a contract mismatch appears, or traces show the prompt asks for it. Record
recurrences with case ID, stamp, and transcript.

### Move the compiled case files into `eval/qa/compiled/`

`eval/qa/cases.json`, `sample.json`, and `tool-cases.json` sit where an unguarded `rg -g '*.json'`
can reach them (hooks block this only where active; see `eval/qa/README.md`, "Searching without
reading case text"). Moving them closes the hole (~30 references).

Trigger (priority 4): after every dated run and follow-up merges and `systemctl --user list-timers`
on agentpc shows no `raven-dated` or `raven-watchdog` unit (dated scripts and
`~/.local/share/raven-dated/` read current paths).

Done when: `rg -g '*.json'` from repo root reaches none of the three files, and hook + `.ignore`
tests are updated.

### Tag confirmation-only rows in the agent discovery runner and the agentic workflow

`eval/run-routing.mjs`, `eval/run-protocol-history.mjs` (`eval/lib/protocol-history-report.mjs`),
`eval/discovery/run-discovery.mjs`, and `eval/discovery/run-replay.mjs` import
`eval/lib/confirmation-only.mjs`. `eval/discovery/run-agent-discovery.mjs` (prints per-row stdout),
`eval/discovery/classify-misses.mjs` (stdout is `{ outPath, counts }` only; JSON writes untagged
`rows`), and `eval/agentic/{workflow-agentic-routing.js,capture-proxy.mjs,reconcile-capture.mjs}`
do not, though both guides ([`eval/discovery/README.md`](../eval/discovery/README.md),
[`eval/agentic/README.md`](../eval/agentic/README.md)) mandate counts-only reporting.

Held: neither paid diagnostic is scheduled and `classify-misses.mjs` stdout is counts-only. Trigger:
before the next paid run of `run-agent-discovery.mjs` or the agentic workflow, or before inspecting
per-row `classify-misses.mjs` output (unless owner accepts the guide rule). Wire
`confirmation-only.mjs` fail-closed so listed rows print `confirmation-only`.

Done when: every runner replaying listed rows tags them, or owner accepts the guide rule.

### Run the judge self-test on the resolved judge model

The QA judge defaults to Claude Code alias `sonnet` (resolving to `claude-sonnet-5-5` as of
2026-11-18) and launches with `--setting-sources ""`. The paid 7-case `npm run eval:qa:selftest` has
not graded that model or launch flag yet.

Trigger: first headline judged run or any run with comparable verdicts (also repeat whenever the
resolved judge ID moves). Resolve `sonnet` via `modelUsage`, pass the exact `--judge-model` ID
(aliases are refused), run under a cap to set the new baseline (`eval/EVALS.md`, rule 7), and record
the resolved ID beside the summary.

Done when: self-test passes under its cap with the resolved judge ID recorded.

### Bump the Playground catalog IDs when the AI Gateway lists a newer model

`DEMO_CATALOG_LATEST` in `src/demo/model-config.ts` pins exact AI Gateway IDs for Terra, Haiku, and
Grok (no provider offers a family alias).

Trigger: AI Gateway lists a newer Terra, Haiku, or Grok (owner: orchestrator on next catalog read).
Bump the constant and check `DEMO_ANTHROPIC_5X_MODEL` (matches gen 5 only; an unmatched Claude ID
silently drops adaptive thinking). Run the Playground gauntlet first for any new primary/fallback
(`eval/playground/README.md`).

Done when: no trigger remains open (delete and re-add at next trigger).

## Documentation follow-ups

### Apply the item 8.2 deferred documentation changes after run 2.2c merges

Deferred from round item 8.2 until run 2.2c merges (~2026-12-04), because dated runs read
`AGENTS.md`, `golden-truth`, `improvements-pipeline`, `eval/qa/README.md`, and TODO anchors. Waits
on orchestrator approval of "Approval list" point 3 in
[8.2 RECONCILE.md](rounds/2026-11-16-next-phase/items/8.2/RECONCILE.md):

- `CLAUDE.md` prohibition ("there is no `CLAUDE.md`" already landed).
- O-10: one statement of posting authority across `AGENTS.md` and skills (deploy authority is
  already unified).
- O-27: define owner, lead, orchestrator, and lane once in `AGENTS.md` "Coordination".
- O-30 (move `wrangler kv` rules to `docs/operations.md`), O-32–O-38 (move/reword orchestrator
  handoff rules in `AGENTS.md`). O-40 is moot: the Solo rule was removed on 2026-11-20.
- C-17: document the playground gauntlet's per-model Wrangler exception or let it reuse a server.
- "File and response size come second" in `AGENTS.md` "Spend and evidence".
- B-13, B-14, "Raven scoping" in `improvements-pipeline`, and `golden-truth` lifecycle overlap
  (B-12 declined as superseded).
- O-12: split `eval/qa/README.md` (operator guide, repo-wide rules, pack internals, dated results).
- Point the case-search hook message and three `.ignore` headers at "Searching without reading case
  text".

Done when: approved changes land and the rest are declined in the round ledger.

## Dependencies

### Move `wrangler`, `miniflare`, and `@cloudflare/vitest-plugin` together

Standing note. `@cloudflare/vitest-plugin` pins `wrangler`, `miniflare`, `esbuild`, and `zod`
exactly; `package.json` holds exact pins for `wrangler`, `miniflare`, and `esbuild` with no
`overrides` (root `zod` stays ranged, so a nested dev-only `zod` copy is expected while the plugin's
pin trails root). Bump the plugin and `wrangler` together, check the lockfile for exactly one
`node_modules/workerd` entry, and check `vitest` (`^5.1.0`) against the plugin's peer range
(`^4.1.0 || ^5.0.0`). Never revert to deprecated `@cloudflare/vitest-pool-workers` (breaks on
`miniflare >= 5.20261103.0-beta`) or `overrides`.

Done when: the plugin stops pinning `wrangler` exactly. Delete this note then.

### Move the demo off the deprecated `workers-ai-provider`

`workers-ai-provider@4.0.1` is frozen and deprecated. Replacement `createAI` (`agents/models/ai-sdk`)
needs `agents >= 0.32.0` (met at `0.33.0`) but is blocked on `cs-010`
([cloudflare/agents#2809](https://github.com/cloudflare/agents/issues/2809)): string catalog models
drop `providerOptions.anthropic` (adaptive `thinking`/`effort`) on the binding `/run` path (repro in
`rounds/2026-11-03-demo-createai/repro/`, reproduced on `0.33.0`). Owner decided (2026-11-03) not
to change transport. `createAI` also has no stream-resume opt-out (`cloudflare/agents#2790` closed
not-planned), so migration needs a reviewed decision covering stream resume.

Trigger: an `agents` release forwarding `providerOptions.anthropic` for `anthropic/*` catalog IDs.

Done when: `cs-010` repro passes, stream-resume decision is reviewed, `src/demo` and
`test/demo-{model-config,chat,eval-cost}.test.ts` drop `workers-ai-provider`, `npm run test:smoke` +
single-`workerd` + full Playground model runs pass, and `wai-001` closes via a reviewed lifecycle
decision (migration alone is not `fixed-upstream` evidence).

### Verify that xAI accepts the explicit tool `strict` field

Both Playground tools set `strict: false`, which reaches `DEMO_GROK_CONTROL_MODEL`'s
OpenAI-compatible transport unverified.

Trigger & done when: before the next Grok control-model lane, the gauntlet (`--models`) confirms xAI
accepts it, or a reviewed change omits `strict` for that transport.

### Confirm `npm run mcp-key` on wrangler 4.164.0

`scripts/mcp-key.mjs` wraps `wrangler kv key list/put/delete` (fail-closed; `rotate` overwrites
without deleting). Local list and `--help` flags passed on wrangler 4.164.0 (2026-11-18); only the
remote path is unchecked.

Next (priority 2, 2026-11-25 Mac session): run read-only `wrangler kv key list --binding OAUTH_KV
--remote --prefix raven:api-key:v1:` and record output shape only (never a key name). Fix any error
before any `npm run mcp-key` use, including revoking `openai-review-20261007`.

Done when: remote list parses as expected and shape is recorded, or the script is fixed.

## Deferred programs

### Write ADRs for the per-origin OAuth design and the stellar.org admission

Neither has an ADR; living docs cite
[DESIGN.md](rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/DESIGN.md) and #447.

Trigger (owner, 2026-11-18): next change to OAuth host model, callback allowlist, or the
`stellarOrg` source/admission. Done when: ADR is in `research/decisions/` and indexed.

### Keep `sources.locate` deferred

Deferred by owner (2026-08-28). Reopen rule:
[`ideas/source-delivery-ranked-references.md`](../ideas/source-delivery-ranked-references.md) §8.
Condition 3 needs live repository-recovery steering (does not exist); log incidents meeting
conditions 1, 2, and 4 in the Horizon monitor item without counting them until condition 3 holds.

Done when: full §8 trigger fires and owner approves a phase-0 study, or owner retires the program.

### Consider consolidating the auxiliary Workers

Three auxiliary Workers run beside `stellar-raven-codemode`: usage collector, usage report API, and
OpenAI domain challenge. Owner asked (2026-10-25) whether fewer would do. Answer before any change:

- Can the main Worker serve the report API and challenge on fixed routes without widening MCP, the
  sandbox, or D1 reach?
- Can a Worker be its own tail consumer? (Cite Cloudflare docs.)
- Does the collector's "no HTTP route" isolation (`usage/README.md`) hold if it absorbs the report
  API?
- What changes in `usage-health`, `scripts/check-usage-deployment.mjs`, fork setup, and
  `USAGE_REPORT_URL`?

Done when: owner accepts and ships a reviewed design note, or keeps the split and deletes this item.

### Read the `skill_read` shape distribution

[`ideas/skill-discovery-without-bundling.md`](../ideas/skill-discovery-without-bundling.md) sets
pre-registered decision rules for `skill_read.shape` and `id` (after 100 organic events or
2026-09-30, now overdue). Workers Logs hold ≤7 days; if fewer than 100 organic events exist in that
window, record the count and re-read later.

Next (priority 2, 2026-11-25 Mac Workers Logs session): run the `cloudflare-observability-review`
calculation and apply the note's rules as written (do not paraphrase them here).

Done when: both questions are answered where the note specifies, and the note is deleted.

### Measure long-horizon codegen with Raven installed

No instrument exists; the only evidence is n=1
([2026-08-07 codegen partner report](../research/audits/2026-08-07-codegen-partner-report.md),
unattributed defects despite served guidance).

Trigger: partner's per-round bug report arrives, or owner funds a capped with- vs. without-Raven
codegen A/B against the partner taxonomy. Done when: a capped A/B attributes the defects or owner
retires the question.

## OpenAI plugin submission

### Obtain a written exception for the accepted two-tool endpoint

Package `0.1.2` submitted 2026-10-23; last recorded portal state is `In review` / `Not published`
with an unsent draft reply ([`plugins/openai/README.md`](../plugins/openai/README.md)). Check portal
and correspondence first; re-run the rehearsal because the trimmed surface changed tool descriptions.

Before publication, resolve publisher verification and privacy coverage (the `/terms` 30-day
allowance vs. 7-day metadata-only practice is tracked in "Keep 30 days of observability data,
including queries and responses"). After the final decision, revoke reviewer key
`openai-review-20261007` (only after "Confirm `npm run mcp-key` on wrangler 4.164.0").

Done when: OpenAI grants the exceptions, or owner approves another approach.

### Remove the OpenAI domain verification Worker after approval

Trigger: OpenAI publishes the app or owner withdraws the submission. Confirm in the portal that the
challenge is no longer needed, then delete `stellar-raven-openai-verification` Worker + route,
delete `plugins/openai/domain-verification/`, and update `plugins/openai/{README,VERIFICATION}.md`.

Done when: Worker, route, and source are gone, and the published app passes portal connection checks
(or withdrawal is confirmed).

## Owner decisions

Each decision states the question and safe default. Record the answer in a round ledger or ADR, then
delete it here.

1. **Which source, if any, to test for facts no reached source holds.** Round item 1.3 classed every
   residual source gap ([CLASSIFICATION.md](rounds/2026-11-16-next-phase/items/1.3/CLASSIFICATION.md),
   [LEAVES.md](rounds/2026-11-16-next-phase/items/1.3/LEAVES.md)). NBU waits upstream (`ll-039`);
   Pi Network does not earn a source and is not forwarded (owner, 2026-11-17). The
   remaining candidate is an other-chain source for XRP Ledger (`ecosystem.chain-comparisons`,
   xrpl.org). Pass bar: more correct answers and no more wrong ones. No query/answer logging means
   no measured demand (not absence); item 3.1 decides nothing here. Safe default: test none.
2. **Release and package-version data, and the Dashboard lumens API (decision 6(b)).** Options:
   upstream Scout request in `improvements/`, or a new host adapter (ADR-0003 exposure change). Safe
   default for release data: leave upstream and file the request. Safe default for Dashboard lumens
   API: do not add (no telemetry proxy; item 1.3 `sdf-mandate-holdings` shows it is unneeded for
   that fact). "Fix the `getChangelog` ranking trap for release questions" proceeds either way.
3. **The MCP Skills extension** (SEP-2640, MCP SDK 2.4; experimental `attach`). Could expose pinned
   ecosystem skills via native client skill listing/reading. ADR-0003 surface change: needs this
   decision, a design study, and a measured A/B. Safe default: not started.
4. **A production bearer credential for post-deploy checks**
   (`research/audits/2026-11-06-remaining-sweep/live-host-check.mjs`, skipped after 7.3 deploys
   because no prod bearer credential sits on Mac/agentpc). Only free check of both wire eras on all
   three hosts. Safe default: none (keep OAuth metadata, `/mcp` 401, and one connector `execute`).
5. **Keep 30 days of observability data, including queries and responses.** Whether to start the
   design study for 30-day retention and query/response capture ("Keep 30 days of observability
   data, including queries and responses"). `/terms` (counsel-owned, treated by the owner as a
   30-day allowance) permits storing observability data, "which may include the queries submitted
   and the responses returned", "for 30 days, after which it is deleted", with opt-out and account
   deletion on request; production keeps ≤7 days in Workers Logs (AI Gateway on row-count policy)
   and logs no query text. Safe default: not started (stay at 7 days, no query/response capture).

Owner-blocked actions that already have an item (no decision needed here):

- OpenAI portal check and reply: "Obtain a written exception for the accepted two-tool endpoint".
- `sk-031` workflow cleanup patch and `cs-006` contact authorization: "Improvements follow-up".
- Auxiliary-Workers question (2026-10-25): "Consider consolidating the auxiliary Workers".
