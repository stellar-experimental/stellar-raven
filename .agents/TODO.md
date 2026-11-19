# TODO — own-repo work queue

Own-repo work only: adapters, catalog, executor, scoring, eval instruments, goldens, gates, and
documentation. An upstream service defect goes to `improvements/` (see
[`improvements/README.md`](../improvements/README.md)).

Add an item when you find work you are not doing now. Delete it when it is done; git history is
the archive. An item states what is wrong, its current state, the next step or trigger, and what
"done" means. Keep the history in the linked ledger, not here. The spend rules in
[`AGENTS.md`](../AGENTS.md#spend-and-evidence) apply to every item: a run needs no
approval, and each runs under a hard cap and is recorded with its cost.

## Priorities

"Round item N" is an item of the [2026-11-16 round](rounds/2026-11-16-next-phase.md). Its
[plan](rounds/2026-11-16-next-phase/PLAN.md) proposes; the
[owner decisions](rounds/2026-11-16-next-phase/DECISIONS.md) bind.

1. Dated truth maintenance, started by timers on agentpc. Run 2.1 on 2026-11-23 18:00 UTC must
   merge before 2026-11-25 00:00 UTC. Runs 2.2a, 2.2b and 2.2c follow on 2026-11-30, 2026-12-01 and
   2026-12-04. After them comes the register maintenance lane ("Close the register entries the
   dated runs leave open").
2. One Workers Logs session on the Mac on 2026-11-25: the sign-in watch ("Watch sign-in rejects
   after the oauth-provider 1.x deploy"), then the `execute` timeout read with its `recoveryHint`,
   `skipped`, `errorName` and user-agent questions ("Decide the `execute` timeout from one more
   Workers Logs read"), and the read-only remote `kv key list` for `mcp-key` ("Confirm `npm run
   mcp-key` on wrangler 4.164.0").
3. Owner decisions (the list at the end).
4. Free own-repo fixes that need no paid measurement: the Freighter and Scout SDK-status golden
   look, the timing flake, the `test/live/` suites, the judge-stability register move, the
   skill-scrub narrowing, the card binding, the golden-round JSON flush, the hook wiring, and the
   case-file move once every dated run and follow-up has merged and `systemctl --user list-timers`
   on agentpc shows no `raven-dated` or `raven-watchdog` unit.

Everything not named here is a hold, a monitor or waits on its trigger. Do not start one without
its trigger.

No third tuning loop (owner, 2026-11-16, decision 1). A QA headline run starts only when a named
decision needs it (`run-evals` section 1); it needs no approval. The general routing repair stays held.
It needs new mechanism evidence, not another lexical variant.

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

## First-principles round follow-ups

Round `fp-2026-11-12`: [ledger](rounds/2026-11-12-fp.md),
[record](../research/audits/2026-11-12-first-principles-round.md), and
[ADR-0011](../research/decisions/0011-tool-surface-stays-code-mode-trimmed.md). The tool surface
stays `search` + `execute`, trimmed for cost. The owner accepted the loss on live-data questions
as the price of the trim ([decision 5](rounds/2026-11-16-next-phase/DECISIONS.md)). A fix that
keeps most of the token saving reopens it; ADR-0011's reopening rules are unchanged.

### Check what the judge saw before changing how it weighs cited text

In the round's harness, the judge called a correctly quoted fact "fabricated" in about 2% of the
new variants' answers and in none of the current design's. That is a finding about the round's
judge input, not about the committed QA judge. The committed judge does receive tool evidence:
`eval/qa/judge.mjs` adds a compact source-basis block from pack `p9`, built from the answer's
`execute` results, and `eval/qa/evidence-pack.mjs` leaves it out for a case tagged
`freshness: stable`. Two different gaps can therefore produce the same verdict:

- No evidence block at all: a stable case, or an answer whose sources did not come through
  `execute` (the prototype `retrieve` and `read` tools; unverified).
- An evidence block that omits the cited text: the p9 limits in "Close the remaining
  claim-support gaps of judge pack p9" below.

Next: read the exact stored judge prompt of the disputed answers, then choose between a harness
input fix, a pack change, and a rubric change. A pack or rubric change belongs to the p9 item
and is a judging-semantics change under the `run-evals` skill.

Done when: the disputed verdicts are traced to one of those causes. Any fix is measured: the
disputes disappear, and no answer with a truly unsupported claim is graded up.

## Caps audit follow-ups

Source: [caps audit](../research/audits/2026-11-14-caps-audit.md). The audit changed no cap that
reaches the model. Round item 3.1 read production once and decided the caps; round item 3.2
shipped the operation timeout ([#462](https://github.com/stellar-experimental/stellar-raven/pull/462)).
The decisions and reasons are in [3.1 EXEC.md](rounds/2026-11-16-next-phase/items/3.1/EXEC.md),
the round ledger row for 3.1, and [3.2 REPORT.md](rounds/2026-11-16-next-phase/items/3.2/REPORT.md);
the figures stay in the owner's private evidence folder. Standing values: public `MAX_SEARCH_LIMIT`
50, Lumenloop and Scout calls 24 seconds each as one wall-clock budget per operation call, and
the artifact caps `ARTIFACT_INFO_CAP` 8 and `ARTIFACT_READ_CAP` 4. Tuning loop 2 kept seven search
cards by default and removed the source map ([ledger](rounds/2026-11-15-tuning-loop-2.md)). Only
the `execute` timeout is open. A paid test runs under a cap
sized by the `run-evals` skill and is recorded with its cost.

### Decide the `execute` timeout from one more Workers Logs read

`EXECUTE_TIMEOUT_MS` is 60 seconds, and its decision is open. The 3.1 production read found no
failed `execute` past 59 seconds in its 6.5-day window. The rule also counts `POST /mcp`
invocations that ended cancelled or disconnected after 59 seconds, and the platform queries
returned no rows for that half. Codex's default `tool_timeout_sec` is 60, so a run near Raven's
limit can lose its structured timeout result to the client. Keep 60 until the read below is done.

Next: one free Workers Logs read on the Mac, in the 2026-11-25 session (see "Priorities"). Workers
Logs keep at most 7 days, so a later read loses days. The read answers every question the first
one left:

- Which row type carries the data. Key discovery returned a capped list, and every query that
  filtered `$metadata.type = "cf-worker-event"` with path `/mcp`, or grouped by the user-agent
  header, returned no rows. First group one recent hour by `$metadata.type`, and check which row
  type carries the path, user-agent, `$workers.wallTimeMs` and `$workers.outcome`.
- The wall time of `POST /mcp` invocations over 59 seconds, with their outcome. This decides the
  timeout.
- The user-agent families. They attribute the client loops in "Triage the runtime and client gaps
  from the HackMeridian telemetry".
- The keys `recoveryHint`, and the artifact-write `skipped` and `errorName`: search the key list for
  each by name first. They feed the same triage item and "Explain the soft-empty and skipped-write
  anomalies from the production read".

Done when: the `execute` timeout has a recorded decision (keep 60 or change it) in the round
ledger or a decision record. The figures stay in the owner's private evidence folder.

### Re-verify each external client limit before changing model-facing text

The test constants copy limits that belong to clients. Claude Code: 4,096 characters for server
instructions and for tools loaded up front, 16,384 through tool search, a 25,000-token MCP output
cap, and a spill to file above 50,000 characters; before v2.1.296 the cut was 2,048. Grok CLI: a
20,000-byte MCP result clip. Measured on 2026-11-14 in
`research/audits/2026-11-14-client-text-limits.md` (Claude Code 2.1.325, Codex 0.167.0, Grok 1.0.77,
OpenCode v2.2.7): Claude Code's 4,096 and 16,384 held; Grok cuts instructions and tool descriptions at
2,033 characters plus a marker; Codex shows one catalogue line of about 230 characters per server and
appends the full instructions to each tool description in its JavaScript runtime; OpenCode puts the
instructions whole in the system prompt and lists tools up front with 120 characters each. Codex and
ChatGPT docs say to keep the first 512 characters of server instructions self-contained and state no
cut. claude.ai web and Claude Desktop: community evidence (`anthropics/claude-ai-mcp#93`) that server
instructions are dropped, so the tool descriptions are the whole contract there. The audit's
"Re-verifying the external facts" table has the method for each.

State on 2026-11-18: agentpc runs Claude Code 2.1.327, Codex 0.169.0 and Grok 1.0.88, so every
measured version has moved and the re-check is due.

Trigger: before a change to the server instructions or the tool descriptions, and when a client's
release notes name an MCP text limit. A client version bump alone does not fire it. The cheapest
check is the audit table's method for Grok's 2,033-character cut, because the pin in
`test/mcp-instructions.test.ts` depends on it.

Done when: the table's rows match the current client versions. Grok's 2,033-character cut has its
guard: `test/mcp-instructions.test.ts` pins the instructions and both tool descriptions under 2,033
(1,899, 1,960 and 1,964 today, and the first line of each stands alone).

## Tuning loop 2 follow-ups

Record: [round ledger](rounds/2026-11-15-tuning-loop-2.md) and its P0, P1, P2 and R files. The loop
kept the corroboration guard, the source-map removal, the delivery text, the `stellarOrg` source,
seven cards and the title-case rule for exact rows. It did not ship the identifier pointer. Each
item below is evidence for what it names, not an improvement claim.

### Carry the guard to absence-of-standard statements

The guard sentence is about a claim a source makes. P1's repeat passes still produced bare statements
such as "no official standard or SEP" on a guard row with the guard in the result, inferred from the
absence of a hit, and the readers disagreed on whether they were violations (their own calls on P0
read 1, 2 and 1). P2 and R read 0 violations in 25 and 20 claim-word answers, so the rule cannot see
the case. Do not reword the sentence on that evidence.

Done when: a targeted read of the answers that state a standard, audit or incident is absent, on a
panel with enough such rows to give a rate, has the readers agreeing on the class; then a reviewed
general wording change is measured against the unchanged sentence.

### Watch required-service coverage on the 58-row panel

`npm run eval:plan` covered 58 of 58 rows' required services in P0, 56 in P1 and 55 in P2. The
misses were rows whose verdicts did not move (a Docs-required row where only Scout was touched,
and the reverse), so no step was blamed. The planner does not name `stellarOrg` as a service.

Done when: the next panel run reports the count against 55 of 58, and a fall to 53 or fewer is
traced in the transcripts before any change ships.

### Test the `stellarOrg` result rule for the corroboration guard

R8 decided that `stellarOrg` stays outside the corroborating families, so each of its results
carries the guard line, and `eval/qa/claim-read-brief.md` reads a `get_page` result as class 2 for
SDF's own programmes and class 3 for governance and incident claims. No claim statement in P2 or R
rested on a `stellarOrg` result, so the rule and its over-hedging risk are untested.

Done when: a run with at least 5 claim-word answers that rest on a `stellarOrg` result is read with
the brief, and the readers' violation and over-hedge counts are recorded; the rule changes only on
that read.

## Family decider follow-ups

Source: [family decider record](../research/audits/2026-11-14-family-decider.md). The engine question
is closed for the search page; nothing below reopens it. The record also bore on the seven-card default (kept in
tuning loop 2): seven lexical cards against five was +3/−0 on 64 FAM development rows.

### Hold the sealed FAM confirmation rows

82 FAM confirmation questions, written without goldens and labeled by two lanes, are sealed and
unspent (SHA-256 `07587dc04e2c993a92736d18610e4fc8fa78e04e77541863df4cfa83c85244ec`, held by the
orchestrator; the record lists the paths). They can be used once, and only by an answer-outcome
test: its outcome is an answer, not a card on the page, it states the decision it changes, and its
pass rule is fixed before the rows open. A routing-reach test does not earn them: the rows a
decider can win are reached by general search operations the base instructions already name. No
test is planned. The set stays sealed and unspent
([decision](rounds/2026-11-16-next-phase/DECISIONS.md), "Follow-up answers (2026-11-17)"). A second
copy of `~/backups/fd-2026-11-14/split/` is on the Mac, held by the orchestrator.

Done when: such a test is written and the rows are spent on it once, or the owner retires the set;
record which.

## Golden answers

### Look at the Freighter and Scout SDK-status goldens

Docs retitled the Freighter guides "Varial" (2026-11-16), and Scout 1.9.150 added SDK-status
fields ([record](rounds/2026-11-16-next-phase/items/0.2/REPORT.md)). `q-tool-freighter-wallet`,
`q-tool-wallets-comparison`, and the matching `eval/qa/cases.json` entries need a `golden-truth`
look. A stale golden mis-grades answers, and the fix is free.

Next: one `golden-truth` lane whose brief claims the maintenance exception and names the trigger:
an upstream event shown by a primary source (the Docs retitle of 2026-11-16, Scout 1.9.150). Open
no case beyond these.

Done when: each case is edited through `golden-truth` or confirmed unchanged.

### Prove the stellar.org source

The source is in (`stellarOrg.search_site` and `stellarOrg.get_page`, merged in tuning loop 2) and
it is **unproven**: P2 called it on 3 of 58 rows (3 of the 12 `sets.tuning` rows whose golden cites
a served stellar.org page), all calls ok, one answer used a fact from it, and no verdict moved
because of it; 5 of the 12 rows cannot reach a cited page from the question as written. The
`search_site` result is large (up to about 21,700 characters) and was ignored on 2 of 3 rows. Its
harm side is clean at what T = 5 on 58 rows can see, not below it. The deployed Worker reaches
stellar.org through the adapter's own path (checked after the #447 deploy,
[loop 2 ledger](rounds/2026-11-15-tuning-loop-2.md)). What remains:

- **Routing reach (closed as accepted, owner, 2026-11-17).** Standing numbers, from the round item
  3.3 baseline on `main` before item 5.1 and not re-measured since: top five for 8 of 40
  off-golden questions in question form; a `stellarOrg` card displaces a non-SDF card on 0, 1 and
  3 of 25 questions at limits 5, 7 and 10, as backfill on short pages. Both general ranker
  mechanisms failed the no-loss rule
  ([record](rounds/2026-11-16-next-phase/items/3.3/MEASURE.md)). A `stellarOrg`-only rule is the
  per-slice fitting the owner ruled out. Reopen only on a production transcript where a
  `stellarOrg` card cost an answer, not on another probe count.
- **Algolia `pages` index.** Orchestrator evidence, 2026-11-14, read in the Algolia dashboard: of
  nine body-text phrases the keyless search missed, the `pages` index ranked the right page in its
  top four for about five. Whether it holds audit records is unconfirmed. Decision (round plan):
  add depth only on a production detail-lookup failure, and then with a search-only key.

Done when: a run on the 12 source rows shows the source supplying a judged fact (or the owner
accepts it as a coverage fix without a scored gain).

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

Done when: the count is zero, or the owner accepts the entries still open.

### Golden follow-ups from the sls-024 and sls-029 cap review

From the [review](../research/audits/2026-11-12-truth-maintenance/review-caps-fable.md):

At the next deliberate live-contract revision, reword the "state-conditional sls-024
discriminator" label of `q-live-fluxity-status-provenance`. The grading rule holds; a notes edit
changes the frozen `live-data-canonical-v3` digest. (The audit's rewrite of the DeFi market-map
case removed the "DIA/Lightecho/Orally too" note from judge-facing text; it survives only as
judge-blind provenance.)

Done when: the live contract's next reviewed revision carries the reworded label.

### Resolve held source ownership and bounty policy

The [source triage](../research/audits/2026-11-03-qa-followup/additional-source-triage.md) and
[bounty access record](../research/audits/2026-11-03-qa-followup/bounty-policy-access.json) hold
three corrections:

- RWA: identify the source owner, measurement period, denominator, and component set before
  correcting a growth rate.
- Phoenix: identify the source owner and dated submission IDs; reconcile the headline with the
  same award-status filter.
- Bounty: obtain the current controlling policy and its revision before settling scope,
  severity, or reward claims.

Do not infer an owner, denominator, deployment, or policy from search snippets.

Done when: primary evidence supports a reviewed correction or an explicit continued hold.

### Review the codegen-adjacent goldens by case id

The [2026-08-07 codegen partner report](../research/audits/2026-08-07-codegen-partner-report.md)
found no battery case that tests its Soroban defect classes directly. Each case below is the
nearest one to a class, or carries a stale pointer. A lane that may open case text decides each;
this item names ids and fields only.

| Case id | Field | Concern |
|---|---|---|
| `q-zk-nullifier-storage` | golden | Closest to the persistent-collection versus entry-cap gap; not a match |
| `q-soroban-wasm-size-limit` | avoid clauses | Same gap; adjacent only |
| `q-sor-decode-hosterror-codes` | golden | Closest to the event-assertion reset gap; also adjacent to the auth-error-surface gap |
| `q-soroban-unit-testing` | notes | Points at a case id that is not in the owned battery |
| `q-sor-testing-negative-auth-events` | none in the owned battery | The pointer target exists only in the retired prior art; author it or reroute the pointer |
| `q-sor-evm-to-soroban-porting` | golden | The only case entering from EVM vocabulary; a retrieval-vocabulary candidate |

Four topics have no owning case: the entry-cap write failure for a growing persistent collection,
the per-call reset of test-side event reads, auth failure error remapping, and `try_*` client
method semantics.

Done when: each row is edited through `golden-truth`, confirmed unchanged, or has its pointer
rerouted, and each topic is authored as a case or declined with a reason.

### Audit the two corpus guides no lane has read

`eval/qa/corpus/README.md` and `eval/corpus/PROVENANCE.md` are living guides that the item 8.2
documentation audit could not open: both sit under paths no audit lane may read. Their claims are
unchecked against the code.

Next: a golden-maintenance lane that is allowed to open those two paths checks each claim against
the code and fixes what is stale.

Done when: both guides are checked and corrected, or the owner accepts them as unaudited.

## Improvements follow-up

Recheck only when the named change or new evidence arrives. An untouched issue needs no
reminder. The [November 5 ledger](rounds/2026-11-05-truth-maintenance.md) and its per-finding
tables cover every finding.

- **sls-116** (stellarlight#1952, inbound handoff #427): three items still reproduce on
  2026-11-17 (Scout 1.9.150) and #1952 has no maintainer reply. Next check, only after a Scout
  release that touches SCF data or a reply on #1952: (1) `GET
  /api/projects/search?scfAwarded=true&limit=100` at offsets 0 to 700 should name
  `soroban-contract-source-verification-service-bax` on a row (the official page
  `https://communityfund.stellar.org/project/soroban-contract-source-verification-service-bax`
  shows `lastAwardedRound` 44); (2) a public endpoint should serve the owner's 27-award baseline
  (the 1.9.150 OpenAPI has no round-count operation); (3) `peer` should carry `scfSourceUrl` and
  `scfAsOf` (both null, rounds `[22, 26]`). Retire only when all three are sourced or explicitly
  out of scope. Comment upstream only on a change.
- **Scout wallet findings (2026-11-17).** Round item 1.3 reproduced both reads and filed `sls-121`
  (5 `Live` wallet rows whose later `availabilityCheck` says the operator is gone) and `sls-122`
  (`q=wallet` returns `coca` twice, 196 rows for `total` 195). Check the upstream issues
  only on a Scout release that touches wallet rows or project search.
- **Docs pull requests.** The [Docs table](rounds/2026-11-05-truth-maintenance/docs.md) and the
  [continuation table](rounds/2026-11-06-remaining-sweep/docs.md) name each unmerged pull
  request, its blocker, and its live trigger, including draft2752 and the generated-skill
  PR3069. Recheck the pages after deployment; green checks alone close nothing. The
  author-owned protocol PR2059 awaits review; answer substantive review without a keepalive
  rebase.
- **Software Versions (not filed).** Protocol 30 is live on Testnet, but
  https://developers.stellar.org/docs/networks/software-versions.md lists nothing above
  Protocol 29. Upstream normally adds a version around Mainnet activation. The dated run 2.2a
  (2026-11-30, merge before 2026-12-01 00:00 UTC) owns the recheck: if Mainnet runs Protocol 30
  and the page still lacks it, it files the finding as the class of resolved sd-008
  ([ledger](rounds/2026-11-10-truth-maintenance.md)) and
  [PRESTAGE.md](rounds/2026-11-16-next-phase/items/1.4/dated/PRESTAGE.md) says how. The
  orchestrator's deadline overrides the earlier "on or after 2026-12-01".
- **ll-022, ll-023, ll-024.** The original records kept no reproducible wrong milestone,
  preview-boundary omission, or stale venue row, and current checks do not prove those errors.
  Before a closure or a renewed claim, obtain the original and corrected record or an owner
  explanation ([table](rounds/2026-11-05-truth-maintenance/other.md)).
- **cs-006.** The Paxos metadata wording still reproduces, but no public repository owns the
  served TOML. Keep intake unclear until a metadata repository is identified or the owner
  authorizes contact through the published support channel.
- **sk-031.** The orphan legacy skill is still live. After the owner applies the supplied
  workflow cleanup patch, verify both skill URLs and preserve preview deployments.
- **Coins.ph (not filed).** Scout's partner profile describes current PHP ramps but marks itself
  `aging` with `isCurrent: false`. File it only if the profile drops that flag and keeps the
  claim.

Done when: each triggered check has a fresh live result and an independent retirement review, or
a precise remaining defect in its active finding.

### Monitor the Horizon protocol-ceiling note

The Scout DeepWiki note for `stellar/stellar-horizon` is a dated fact that goes stale at each
protocol bump. It failed twice (`sls-087`, `sls-115`) and passed on 2026-11-12
([round](rounds/2026-11-12-truth-maintenance.md)) and 2026-11-16 (value 30 at `scannedRef`
`01ba44a9`, [round item 0.2](rounds/2026-11-16-next-phase/items/0.2/EXEC.md)).

During each improvements or drift round, run one free `scout.explainRepo` reading against the
local Raven server for `stellar/stellar-horizon`: "Which Horizon ingestion constant pins the
highest supported protocol version, and what is its value?" Record the value, `generatedAt`,
`scannedRef`, and `answerSource` in the ledger. It passes only when the answer equals the source
value at the response's own `scannedRef`. On a failure, file a new finding and cite both
receipts.

The repository-recovery program behind this monitor stays rejected
([closeout](rounds/2026-08-31-rejected-experiments-closeout.md)). A passing reading authorizes
nothing. A new plan must cite ADR-0008, keep the 10-of-12 positive and 0-of-8 premature-detour
gate, and pass an independent plan review. It reopens on three
qualifying positive operation-selection misses; the Docs-versus-repository conflict stays
monitor-only until three dated successful re-executions of the Docs-first, inspect, then one
later `scout.explainRepo` sequence. The earlier candidate is in closed PR #102 at `6baec0a4`.

Done when: a reviewed v3 plan ships, or the owner retires the recovery program.

### Probe the malformed-input gap in the pinned smart-contracts skill

The security reference in `skills.stellar-dev.smart-contracts` (repository `stellar/stellar-dev-skill`)
numbers its vulnerability classes, and none covers malformed or short input. The nearest entry is
check-then-act races, a different thing. Only generic input-validation advice exists; a length or
bounds guard before decoding or slicing is absent. The evidence is the
[2026-08-07 codegen partner report](../research/audits/2026-08-07-codegen-partner-report.md), so it
is older than the current pin.

Next: a recurrence probe against the current pinned commit, through the `improvements-pipeline`
skill. If the gap still reproduces, file a finding under `improvements/skills/`.

Done when: the probe shows the gap closed, or a finding records it.

## Routing

Search stays lexical-only (owner, 2026-11-03;
[results](rounds/2026-11-03-model-ranking/results.md)). A lexical repair must not depend on
model evidence.

### Preserve structured routing intent across extraction caps and gate tiers

The scorer flattens phrases, truncates at the first tokens, lets generic schema words and
substrings satisfy the coverage gate, and lets five weak gated rows beat strong ungated
evidence. About thirty lexical designs in four rounds, and eight model-ranking variants, failed
the acceptance checks, so the current scorer stays. Trigger: owner authorization for a general scoring repair. This item
authorizes no baseline change and no operation-specific or question-specific exception.

Held by this item:

- `GET /api/rwa` stays excluded.
  [Issue #167](https://github.com/stellar-experimental/stellar-raven/issues/167) closed on
  2026-11-18 as "decided: excluded by measurement". Three pre-registered answer tests returned
  exclude: round item 6.3, result 1 and result 2
  ([RESULTS.md](rounds/2026-11-16-next-phase/items/6.3/RESULTS.md),
  [RESULTS-2.md](rounds/2026-11-16-next-phase/items/6.3/RESULTS-2.md)), and the card-caveat variant
  of round item 7.2 ([RESULTS.md](rounds/2026-11-16-next-phase/items/7.2/RESULTS.md)). Re-open only
  on a Scout `/api/rwa` schema change, a general mixed-intent routing mechanism, or an owner
  product need. Do not re-run the A/B on routine drift; a re-test needs an owner or orchestrator
  decision. `GET /api/quality` stays excluded (response-schema keywords caused unrelated
  captures). `reviewSubmission`, `analyzeHackathonSubmissions`, `getHackathonSubmission`, and
  `locateSource` stay excluded.
- Three mixed-intent controls run as `it.fails` in `test/drift-141-routing.test.ts`. Remove the
  markers when the repair passes.
- [Issue #223](https://github.com/stellar-experimental/stellar-raven/issues/223) stays open for the
  repair. Holdout top3 now sits on its floor (26) after the live Docs titles were absorbed (round item 6.2),
  so the next change that costs one holdout top-3 fails the gate.
- A `SKILL_DESCRIPTION_OVERRIDES` entry for `skills.stellar-dev.dapp` holds that skill's search
  text.

What the attempts established:

| Round | Result |
|---|---|
| [2026-10-08](rounds/2026-10-08-maintenance.md) | Ten policies fail. `tokenize` splits `dApp` into `d` + `app`; short tokens prefix- and substring-match unrelated queries. |
| [2026-10-09 design and steps 1 and 2](rounds/2026-10-09-backlog/routing-design/) | Strict whole-word coverage starves the gated tier. Whole-content anchors raise holdout forbidden captures. Rank-only schema keywords lose the Groth16 holdout row. Check 11 is a selector gap in `src/catalog/search.ts`: quota replacement cannot fire when a service is above its quota. |
| [2026-10-28](rounds/2026-10-28-routing-repair.md) | Five designs fail; none passes check 8. The best clean parent is C2 (schema keywords add rank only within whole-token boundaries) with the stem fold scoped to the schema-support test. `test/search.test.ts:1039` holds only through a spurious schema-only `scout.getRfps` admission. |
| [2026-11-02](rounds/2026-11-02-routing-repair.md) | Nine designs fail. `morph` token boundaries plus the schema rule fix the short-token and schema-only classes, but broad retrieval and skills recall collapse. |

Next attempt: restore that recall with legitimate evidence first, then remove the spurious
kind. Change one mechanism at a time from the accepted baseline and measure all 544 rows on the
current and a fresh source. The acceptance helper is
`rounds/2026-10-09-followup/routing-step1/acceptance.mjs`; its inputs exist only in the owner's
ignored archives under `eval/results/`, so a new attempt measures its own baseline.

An optional no-loss lane for that attempt: the 64 FAM development rows. They are archived in the
branch bundle (agentpc `~/backups/raven-next-phase/raven-branches-2026-11-16.bundle`) at ref
`refs/heads/exp/family-decider`, path
`.agents/rounds/2026-11-14-family-decider/sets/fam.development.discovery.json`, and in
`~/backups/fd-2026-11-14/split/`; both copies have SHA-256
`0246ad022163f1d67247671b8ed640d7bb61f1aec6cad65a937ffa33b56cf89c`. A second copy of the folder is
on the Mac (orchestrator, 2026-11-17, hashes checked). Moving the rows into `eval/discovery/` is
owed by that attempt, not before: the loader now accepts `stellarOrg`, the move changes the
routing set, and it needs its own gate run.

Acceptance checks:

1. Protocol-history additions do not remove `yieldblox` or `reflector` intent.
2. `through`, `network`, `each`, and `walk through` cannot route alone.
3. `contract` cannot route `explainRepo` without a repository or code anchor.
4. Added `use` cannot promote `hackathonBrief` above account-merge Docs.
5. `has` cannot match inside the schema keyword `phase`.
6. Strong Docs evidence remains eligible after five weak gated Scout candidates.
7. All eight regression rows meet their clean grades.
8. A general RWA query reaches `scout.getRwaAssets`, while unrelated Friendbot, RPC, WASM,
   simulation, and balance questions do not capture it. The proposed answer-level form ("the
   target stays rank 1 and answers do not degrade") was tested in round items 6.3 and 7.2 and not adopted,
   because the pre-registered rule returned exclude.
9. The leaderboard and RFP improvements remain.
10. The legacy, skills, and holdout routing gates pass. The extended diagnostic shows no
    regression.
11. A controlled-vocabulary operation reaches the top five for general directory-taxonomy
    queries.
12. On a fresh Scout snapshot (1.9.71 or later), the four real 1.9.71 regressions meet their
    main grades, `reviewSubmission` does not rank on non-hackathon questions, and the absorb
    needs only a manifest-fingerprint re-baseline.

Done when: all twelve checks pass in a reviewed general scoring change.

### Stop schema enum values and example tokens from admitting new Scout operations

Own-repo extraction, not Scout text, admits `analyzeHackathonSubmissions`,
`getHackathonSubmission`, and `searchHackathonBuilds` to non-hackathon pages. The builder turns
input-schema enum values into entry `keywords` (`anchor`, `dex`, `rpc`, `indexer`) and extracts
generic tokens from Scout `exampleQuestions` into `routingKeywords` (`stellar`, `building`,
`use`, `show`). Treat it with the repair above; a narrow builder rule needs the same twelve
checks ([evidence](rounds/2026-10-28-routing-repair/verify/final.md), O3).

Done when: those operations no longer enter non-hackathon pages in the 544-row corpus and the
verify lane's 22 hackathon negative probes, with no graded loss.

### Bind the `scout_hackathon_detail` card to its operation

`cardMatches` in `eval/lib/grade.mjs` matches the expected text `hackathon_detail` against
`gethackathon`, so the card binds to no catalog operation. The routing eval cannot credit
`scout.getHackathon` on `q-scf-hackathon-detail-results`. Fix the binding generally, re-run
`npm run eval:routing -- --gate`, and record any cardHit5 change through the accepted-evidence
process.

Done when: every card in the routing corpus binds to a catalog operation or service, with a
test that fails on an unbound card.

### `search` does not surface the research lane for protocol-history questions

`scout.searchResearch` holds every fact for `q-protocol-24-whisk-incident`, but `search` does
not rank it in the top ten; `stellarDocs.*` wins. Three reviewed mechanisms failed and the
three-attempt box is spent
([last record](rounds/2026-09-02-protocol-history-free-evidence.md)). The owner set the v2
contracts on 2026-09-03 ([decisions](rounds/2026-09-03-owner-decisions.md)): 19 required, nine
forbidden, and four neutral cases.

`npm run eval:protocol-history` stops as `source-expired`, because both v2 contracts pin an old
manifest epoch. That stop is correct. Do not repin the v2 epoch. Run the command as a free
diagnostic after a change to `src/catalog/**`, `catalog/manifest.json`,
`scripts/build-catalog.mjs`, or `src/catalog/vendor/search-scoring.ts`, and record its output.

A new attempt needs one of:

- **PH3, a new non-card evidence box.** The owner opens it for corpus-derived route vocabulary
  or another named non-card source, with a new independently authored contract on an accepted
  source epoch. The brief carries every pre-registration item from the attempt-three brief,
  section 16, and passes independent review before any fetch.
- **PH4, new live routing evidence.** Two cases show the same absent-lane pattern, from
  different question families and entities, neither paraphrasing a frozen positive, each with a
  dated transcript. PH4 opens a note here and a token-reachability audit; the owner then decides
  on PH3.

The upstream card and the Scout inventory have both changed since the contracts froze (the PH1
trigger). That allows the free diagnostic and authorizes no mechanism.

The 2026-11-14 baseline ([BASELINE.md](rounds/2026-11-14-baseline-tuning/BASELINE.md)) is the PH4
evidence offered: on nine standards questions from three families, seven never called
`scout.searchResearch`, and `search` returned it on none of the eight that searched.

**Held.** The owner ruled on 2026-11-16 that PH4 is not met and PH3 does not open (decision 6(a)).
What reopens this item is PH4 evidence of the kind stated above, then an owner ruling on PH3.

Row evidence (2026-11-17, round item 1.3): `q-sep-45-contract-auth` needs the SEP-45 status
("Draft"). No Docs page states it (`/docs/platforms/anchor-platform/sep-guide/sep45` gives the
SEP-10 relation only). The SEP file in `stellar/stellar-protocol` states `Status: Draft`, `Version:
0.1.1`, `Updated: 2025-12-16`, and `scout.searchResearch` returns that preamble at rank 1 for
"SEP-45 Stellar Web Authentication for Contract Accounts status". The fact is reached when the agent
calls research; the golden still matches the SEP file. No finding: the SEP file owns the status.

The identifier pointer is part of the same hold. Tuning arm 2 marks the document a research query
names by identifier, but it can act only when the agent makes that query. Tuning loop 2 tried a
host pointer in the `execute` result and **did not ship it**. R (17 identifier rows, two passes,
Claude Sonnet 5.5): the sentence fired 42 times and agents followed it 9 times (21% per fire
against a bar above 33%; the replay baseline without it is 4%), every follow returned an exact row
(9 of 9), and no verdict moved by a traced cause. Delivery was exact and the model's behaviour was
the limit. Two general defects to carry into any later attempt: the cap of three keeps the first
three identifiers, not the ones the question names (on one row it dropped the two the question is
about), and a token read from a `get_doc_page` path string fires for a page the agent is already
reading. The implementation is archived in the branch bundle (agentpc
`~/backups/raven-next-phase/raven-branches-2026-11-16.bundle`, ref `refs/heads/tune/loop-2-runs`:
commits `a49ee918`, `940dc013`, replay tooling `3d65d0ff`); restore with
`git fetch <bundle> <ref>:<ref>`.

A later attempt needs a different surface (the sentence was already in the result the agent reads
next) and a reason to expect the exact row to matter: in R it supplied a header (status, version,
dates, authors) and no judged fact, so a higher follow rate alone would not have moved a verdict.
This is a routing and instruction problem, not a result-marking one.

Done when: a reviewed mechanism passes both contracts (19 of 19 required top-five hits, zero
forbidden captures) and all routing gates. The bar a later pointer attempt must meet: a reviewed
general mechanism (no list of standards, no per-case vocabulary) raises the per-fire follow rate
above 33% on rows that name a SEP or CAP, and at least two different rows go up by a trace to the
exact row it led to, with no grade, cost, or trap regression, on a read of at least 17 rows
twice.

### Stop identity substitution on spelling-corrected matches

On `q-edge-strupey-ambiguous-stellar-history`, one run called Stroopy.AI "almost certainly" the
asked entity although the result carried `caveat: "unverified-match"` and no record linked the
names; another ended with an unscoped absence claim
([result](rounds/2026-10-10-weekend/answer-style/result-v2.md)). Scout's own `didYouMean` path
already attaches the caveat and needs no change.

Next: a general mechanism, in result data or adapter behavior and not a per-question rule, that
keeps a corrected-name match from being presented as the asked entity.

Done when: a reviewed measurement shows both runs of the row say the identity is unverified or
ask for context, with no regression in the abstention or absence slices.

### Re-check the upstream codemode short-token repair

`@cloudflare/codemode` routes falsely on short-token prefixes (`cs-001`,
[Cloudflare #2296](https://github.com/cloudflare/agents/issues/2296)). It reproduces through
0.5.6, and Raven has an ungated copy of the same rule. Reverse-prefix deletion
and Porter stemming failed routing coverage; do not replace them with query exceptions or a
tuned token-length threshold.

`cs-012` ([Cloudflare #2897](https://github.com/cloudflare/agents/issues/2897)) :
through 0.5.6, a non-Error throw reaches Raven as `error: undefined` and is logged `ok: true`.
Raven has no local workaround. A fix such as
[#2898](https://github.com/cloudflare/agents/pull/2898) (open, unmerged) makes a non-Error throw
`ok: false` with `String(err)`, which is model-facing when it ships, and reserves the provider names
`String`, `Object`, `Proxy`, `JSON`, `Math`, `Uint8Array`, `ArrayBuffer`, `btoa` and `atob`; none
collides with Raven's. When a release carries the fix, re-run the item 5.2 scratch test (source in
[`items/5.2/EXEC.md`](rounds/2026-11-16-next-phase/items/5.2/EXEC.md), "Reproduction") and retire
`cs-012` under the `improvements-pipeline` skill.

Done when: an upstream or general local repair passes the original triggers, the positive
controls, and Raven's routing gates.

### Revisit general directory admission after the rejected D3 experiment

The D3 deletion failed its answer gate and did not ship. The directory field-placement
exception remains a known design risk. Do not repeat D3 or add entity-specific exceptions
([evidence](../research/audits/2026-09-17-routing-audit/m1-c1-passkeys-loss-review.md)).

Done when: a general mechanism passes frozen routing controls and independently reviewed answer
checks.

### Re-evaluate Scout exposure after a routing-contract change

Trigger: a new Scout inventory changes the `x-routing`, description, request schema, or response
schema of `GET /api/quality` or `GET /api/verify`. A version-only change does not count.
`scout.verifyClaim` causes no routing regression on its own, but it ships only after the general
Scout routing regressions have an independent resolution
([review](rounds/2026-09-03-truth-maintenance/final-routing-review-terra.md)).

For a candidate: rebuild the catalog and generated surfaces, run the focused exposure tests and
`npm run eval:routing -- --gate` without changing `eval/gates.json`, and record the manifest
hash and all routing lane totals against the accepted surface.

Last fired 2026-11-16 (Scout 1.9.150 changed the `GET /api/quality` response schema): quality stays
excluded ([SCOUT-EXPOSURE.md](rounds/2026-11-16-next-phase/items/0.2/SCOUT-EXPOSURE.md)).

Done when: a changed contract passes the existing gate and an independent review accepts the
exposure. Otherwise both stay in `EXCLUDED_SCOUT_OPS`.

### Re-expose `scout.matchPartners` when `sls-123` is fixed

`scout.matchPartners` is removed from the exposed surface (2026-11-17, round item 5.1; the owner's
authorization is quoted in `eval/gates.json` `evidence.notes`). No observed call has succeeded since
2026-10-26: "AI not configured" on 2026-10-26, HTTP 502 on 2026-11-02 (the resolved `sls-097`), 503
`unavailable` on 2026-11-17 through Raven and direct on Scout 1.9.150. The adapter's 503 hint stays
and routes to `scout.getPartners`. The removal moved the frozen holdout lane's forbidden captures
from 10 to 11, and the owner authorized the ceiling 11 for this removal only.

Trigger: `sls-123`
([stellarlight#1976](https://github.com/Stellar-Light/stellarlight/issues/1976)) is verified live:
one POST of the command recorded in the finding returns 200 with `matches`. That POST is
model-backed on the upstream's account, so one call per verification is enough.

Re-exposure then:

1. deletes the `["POST /api/partners/match", "matchPartners"],` line from
   `EXCLUDED_SCOUT_OPERATIONS`;
2. reverses the edits listed in round item 5.1
   [EXEC.md](rounds/2026-11-16-next-phase/items/5.1/EXEC.md);
3. re-runs the per-case routing comparison on both manifests;
4. restores the holdout ceiling to 10, but only if the comparison shows 10 captures; otherwise it
   reports the count.

Done when: the operation is exposed again through those four steps, or the owner decides to keep it
removed and this item is deleted.

## Executor and tool surface

### Point agents at the page when a docs hit has no body

`sd-059`: Mintlify search rarely returns `<ResponseField>` text, so a result-code page often
comes back as its title-and-description chunk only. An agent with the Set Options result-code
page in a hit did not read it and gave a wrong code mapping. The site's own public MCP search
returns a relevant result-code page first for all seven probe queries, while Raven's Discovery
path returned none in its top five
([evidence](rounds/2026-11-02-upstream-followup.md), probes in
`rounds/2026-11-02-mintlify-migration/identifier-probe.json`).

Next: compare the raw Discovery candidates with the adapter output, to rule out Raven's own
filtering. Then choose: mark such hits with a hint to call `stellarDocs.get_doc_page`, read
those pages host-side, or serve `search_docs` from the site MCP backend (check its rate limits
and terms). Each changes the output contract and needs a general mechanism, a free retrieval
A/B on the golden docs pages and the probe, and the routing gate.

Done when: the `op_bad_signer` query yields the `SET_OPTIONS_BAD_SIGNER` mapping in one search
call or one hinted page read. Remove when `sd-059` is fixed upstream.

Tuning arm 1 shipped the page-read pointer for this class (#446; the owner kept it as a named
exception to the pre-registered rule, [measurement](rounds/2026-11-14-baseline-tuning/ARM-1.md)).
The item stays for `sd-059` itself.

### Fix Docs search misses on canonical pages

Two mechanisms miss canonical Docs pages, and they need different fixes. Keep them apart:

- Raven `search` routing (which operation and page cards a question reaches). The HackMeridian
  review of 2026-10-26 found three misses: the testnet reset section on `/docs/networks`, the
  Custom Account example, and the fee-sponsorship pages. It predates #474, which on 2026-11-17
  replaced 666 Algolia-era page titles with 982 live ones, and those titles feed the catalog
  keywords. The misses may be gone.
- `stellarDocs.search_docs` ranking (Mintlify). The fact for `q-soroban-contract-id-derivation` is on
  `/docs/learn/fundamentals/contract-development/contract-interactions/stellar-transaction`
  ("based on `contractIDPreimage` value and the network identifier") and, with "sha256", on
  `/docs/tokens/stellar-asset-contract`. On 2026-11-17 `stellarDocs.search_docs` did not return the
  first page for the question wording or for `contractIDPreimage` in the top 10;
  `HOST_FUNCTION_TYPE_CREATE_CONTRACT` returned it at rank 1. Round item 1.3 classed it "reached, not
  surfaced" ([CLASSIFICATION.md](rounds/2026-11-16-next-phase/items/1.3/CLASSIFICATION.md)). This
  miss is not filed upstream. Round item 1.3 filed the same class for SEP-7 as `sd-112`, and that
  precedent applies if the re-probe shows a Mintlify ranking miss.

Next: one free re-probe of the three HackMeridian pages and the contract-id page on current `main`,
recorded per search path (Raven `search`, then `stellarDocs.search_docs`). Add routing cases only
for what still misses, and add them first. A mechanism must be general (no per-query exception),
pass a free retrieval A/B ([`docs/stellar-docs.md`](../docs/stellar-docs.md), "Maintenance"), and
pass `npm run eval:routing -- --gate`. A Mintlify ranking miss goes to `improvements/`.

Done when: the re-probe is recorded per path, and each page that still misses has a routing case
and a merged general fix or a filed finding.

### Clarify the model-facing `codemode.describe` response shape

`codemode.describe` returns `{ ok: true, signature, inputSchema, ... }` at the top level, while
service calls use `{ ok: true, data }`. A production check recovered from reading
`spec.data.signature`
([record](../research/audits/2026-11-09-playground-product-decision.md)). Decide between
model-facing documentation and a forward-only shape change, and measure that change on its own.

Done when: one reviewed, measured correction makes the shape clear to models.

### Narrow the skill scrub so an excluded operation keeps the skill's workflow

`src/skills/scrub.ts` scrubs skill bodies from the same exclusion list that removes operations
from the manifest. The removal of `scout.matchPartners` (round item 5.1) therefore also dropped, from
the served `stellar-scout` skill, the partner-filter step in its workflow (the directory filters, the
stablecoin peg guidance and the "none listed at our source" rule), one sentence of the `getPartner`
paragraph, and the match section of the API reference. The step helps a caller who never uses the
excluded operation.

Next: add a narrower scrub unit, so the partner-filter step survives an operation exclusion. Then
check the served skill text. The skill is model-facing, so the change needs its own gate run.
"Re-expose `scout.matchPartners` when `sls-123` is fixed" would also restore the dropped text, so
this item matters while the removal stands.

Done when: the served `stellar-scout` skill keeps the partner-filter step with the operation
excluded, a test pins it, and the served text was checked afterwards.

### Triage the runtime and client gaps from the HackMeridian telemetry

Each needs a check before a fix. The review's evidence is in the owner's private snapshot
`2026-10-26-hackmeridian` (`usage/README.md`).

- `recoveryHint` appears on most successful executes, so agents probably ignore it. Show it only
  for empty, thin, or conflicting results. Round item 3.1's production read could not read
  the key: it was not in the capped key list. The Workers Logs read in "Decide the `execute`
  timeout from one more Workers Logs read" searches for it by name.
- Clients: Grok CLI never completed OAuth (every `/mcp` request got 401), Copilot CLI looped on
  404 (protocol 2026-07-28), and one browser looped on the consent page with "CSRF token
  mismatch". Reproduce each against current production, because the 2026-11-18 oauth-provider 1.x
  deploy changed the OAuth path; "Watch sign-in rejects after the oauth-provider 1.x deploy" holds
  the new reject events. Round item 4.1 ran Codex and Grok with no auth against the local server
  and both completed: Grok speaks 2026-07-28 and the local server answers `server/discover` with
  200, which points the Grok 401 loop at the OAuth path rather than the protocol. The 3.1 read
  could not attribute the loops: user-agent queries returned no rows, and `/mcp` 401 responses are
  a large share of requests whatever the client. The user-agent read in "Decide the `execute`
  timeout from one more Workers Logs read" can.
- Codex and Grok findings (round item 4.1, [record](rounds/2026-11-16-next-phase/items/4.1/RECORD.md)):
  Codex printed both tool descriptions in 9 of 24 rows, so most runs reached `search` and `execute`
  from the catalogue line alone, and in 3 rows sent `execute` without `code`; Codex passed `limit` on
  4 of 38 `search` calls, Grok on every call. Check whether a stronger first sentence of the server
  instructions or an argument hint in the catalogue-visible text helps Codex, as a routing/description
  question with its own measurement. Grok's 20,000-byte clip cost no answer (61 events, none lost) but
  cost spend and time.

Done when: each bullet has a merged fix or a recorded "no change" decision.

### Explain the soft-empty and skipped-write anomalies from the production read

Round item 3.1 saw two things it was not asked to measure:

- `lumenloop.get_scf_submissions` returns soft-empty on most calls, and `scout.getRepoTrust` on most
  of its (few) calls. A soft-empty is inconclusive, not absence, so a caller that stops there may
  answer wrongly. Check which arguments produce them (a round or year filter that matches nothing,
  a repository Scout does not track) and whether the hint should name a broader call.
- A large share of `artifact_write` events carry `ok = false`. The code logs a skipped write as
  `ok = false` with a `skipped` reason, and a thrown write with `errorName`; neither field was
  readable in the first read.

Next: read the `skipped` and `errorName` values in the Workers Logs read named in "Decide the
`execute` timeout from one more Workers Logs read", and sample the soft-empty calls' `op` events by operation
and `caveat` (no query text is logged, so reproduce with live probes).

Done when: each anomaly has a cause, and a merged fix or a recorded "no change" decision.

### Fix the `getChangelog` ranking trap for release questions

Raven cannot answer "what changed, with dates" or "which version is current". Scout's release
index has dated rows for stellar-cli, stellar-core, js-stellar-sdk, and rs-soroban-sdk, but not
stellar-rpc. No source gives the current npm, JSR, or crates version of common packages or the
latest OpenZeppelin stellar-contracts release. Search also ranks `scout.getChangelog` (Scout's
own API log) above `scout.searchResearch` with `source: "release"`.

The source choice is the owner's ("Owner decisions", decision 2). This item holds the own-repo
part, the ranking trap. The production read (round item 3.1) gives an upper bound only: history
questions reach `scout.searchResearch` often, and `scout.getChangelog` ranks first in few searches,
so the trap touches few callers and the fix is low value. Query text is not logged, so silence is
"no measured demand", not absence. The fix needs a general mechanism or a description change that
passes `npm run eval:routing -- --gate` with no holdout loss; no operation-specific exception. The
test is probes Q5, R23, R33, and R35 of the HackMeridian review.

Done when: the ranking trap is fixed through a gated general change, and either the four probes
pass again or the owner's decision leaves release data upstream and the request is filed in
`improvements/`.

### Decouple `extractLossDetail` from the truncation footer wording

`extractLossDetail` in `src/policy/source-basis.ts` finds the loss detail with a regular expression
over the footer that `truncate.ts` appends (`--- TRUNCATED --- Result was ~N tokens (limit: N).`
then the detail, then ` Re-run returning`). A wording edit to that footer silently empties
`lossDetail`, and one indirect test guards it.

Next: have `truncate.ts` return the detail as a field, or export one constant that both sides use,
and add a direct test that fails when the footer changes.

Done when: a footer wording change fails a test instead of emptying `lossDetail`.

## Authentication follow-ups

### Watch sign-in rejects after the oauth-provider 1.x deploy

Deploy `9f01ae3e` (#484, 2026-11-18, round item 7.3 PR 4) changed the OAuth path:

- One provider per served origin, with the resource `<origin>/mcp`.
- A native-callback allowlist: https, loopback http, `claude:`, `cursor:` and `warp:`.
- The root `/.well-known/oauth-protected-resource` document now answers `404`.
- Grants bound to the bare origin `https://raven.stellar.org` (fewer than 10, all Devin CLI) are no
  longer honored. They get `401` on the access token and `invalid_grant` on refresh. A client that
  follows the `401` challenge or sends no `resource` signs in once; one that re-derives the bare
  origin gets `invalid_target` and cannot sign in. This is the known bare-origin class
  ([design](rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/DESIGN.md), D1).

The orchestrator accepted the bare-origin loss under the owner's 7.3 delegation ("decide and execute
what sticks"). The owner does not use Devin. Devin CLI is one of many third-party dynamic client
registration clients.

What to watch in Workers Logs:

- `auth_reject` with `redirect_refused:<scheme>`: a real client's scheme may be missing from
  `NATIVE_REDIRECT_SCHEMES` (`src/auth/redirects.ts`). `redirect_refused:http` (non-loopback http)
  and `redirect_refused:other` (unparseable) are not native-scheme leads (`redirectSchemeToken`,
  `src/auth/redirects.ts`).
- `oauth_error` with `grant_audience_unbound`, `token_audience_unbound` or `invalid_target`, beyond
  the known bare-origin class.
- `legacy_grant_resource_mismatch` and `resource_not_configured`.

Baseline: the orchestrator's 150-second tail right after the deploy showed none of these, only one
`token_not_found`.

Auth logs only failures. A week with no rejects looks the same as a week with no sign-in attempts,
so the read needs a denominator. Count `/authorize`, `/token` and `/register` requests by status if
the platform rows can be read (the row-type question in "Decide the `execute` timeout from one more
Workers Logs read"). If they cannot, the record says the read shows rejects only, and one positive
control is added: a fresh Claude Code sign-in through the `claude:` callback.

A refused scheme is a lead, not proof of demand. Add a scheme by name, and only for a real client.

Rollback target: Worker version `fe3708cb`. It is storage-compatible, but it strands a CIMD
`private_key_jwt` client.

Done when: one read on 2026-11-25 shows no unexplained rejects, or each one is fixed or recorded.
Workers Logs keep at most 7 days, so a later read loses deploy days; if the read slips, the record
states the window it read.

### Confirm the WorkOS GitHub sign-in recovery and decide its record

One person's GitHub sign-in reaches an older, unverified WorkOS user instead of their active one.
WorkOS support confirmed this is expected behavior, not a defect. The owner approved and sent a
reply asking support to remove only the GitHub link from the older user.

Still outstanding: support's confirmation of the removal, and the person's verified GitHub
sign-in. Raven's callback keys on the WorkOS user ID (`src/auth/workos.ts`), so no Raven code
change follows.

The record is an untracked file on the Mac checkout,
`research/audits/2026-11-17-workos-github-email-collision.md`. It is not on agentpc and is not
recreated here. Owner decision 4 covers whether to commit it, and with what redaction. Until it
is decided, the orchestrator keeps a second copy outside the checkout.

Done when: the recovery is confirmed and the record is committed or discarded.

## Observability and retention

### Keep 30 days of observability data, including queries and responses

Owner, 2026-11-18: "30 is an allowance, today we have 7. I'd like to convert to actually doing 30
everywhere. Do this work carefully, or plan for it maybe for now in TODO." This item is that plan.

What is wrong: `/terms` (`src/site.ts`, "Operational and quality logs") says the Service stores
observability data, which may include queries and responses, for 30 days, and that a user may opt
out of query and response logging. Today Raven keeps less than that:

- Workers Logs, traces and request metadata: at most 7 days (Cloudflare's platform limit; it cannot
  be raised in Workers Logs itself).
- No query or response text is logged. Several TODO items rely on that fact ("query text is not
  logged, so silence is no measured demand"); 30-day capture would make demand measurable.
- Oversized `execute` artifacts in R2 `stellar-raven-artifacts`: 7 days. These are a result cache,
  not observability; whether they move to 30 days is a decision inside this item.
- D1 usage rows (13 months) and OAuth records are not observability and do not change.

`docs/operations.md` ("Data retention") and `src/auth/retention.ts` own the periods;
[`ideas/observability-r2-retention.md`](../ideas/observability-r2-retention.md) has an earlier
Logpush-to-R2 sketch.

Design questions to settle before code (a design study, a Fable review, and a Codex frontier
security review, because this stores user content):

1. Transport: Workers Logpush to an R2 bucket with a 30-day lifecycle rule, or the existing tail
   consumer (`stellar-raven-usage`) writing to R2. Cost estimated from current request volume.
2. Capture set: `search` queries, `execute` code, tool responses (with a size cap and a pointer for
   artifacts), Playground turns. What is never captured: credentials, tokens, email addresses, IP
   addresses (match the usage-statistics promise unless the owner decides otherwise).
3. Opt-out, which `/terms` already promises: a per-account flag keyed by the hashed WorkOS subject,
   checked in the capture path, with a test.
4. Deletion on request: delete one account's records across the archive by its hashed subject.
5. Access: private bucket, read-only analysis tooling, and the AGENTS.md rule that production data
   and counts are never committed.
6. One retention constant in `src/auth/retention.ts`, enforced by the bucket lifecycle and checked by
   `test/retention.test.ts`.

The work stays inside the `/terms` text as written, so no counsel review is needed; capturing
anything the terms do not name would need the legal lane first.

Next: an owner go to start the design study. It touches no file the dated runs read.

Done when: every observability store keeps 30 days and deletes after it, opt-out and per-account
deletion are implemented and tested, `docs/operations.md`, `src/auth/retention.ts`, `/terms` and
`usage/README.md` agree, the TODO items that assume "query text is not logged" are updated, the
idea file is folded or deleted, and a read 31 days after the deploy shows the oldest records gone.

## Eval instruments

### Repair the `test/live/` suites against current code

On 2026-11-18 (round item 7.3, PR 2) both live suites failed against a local `npm run dev`, with
identical results on `origin/main` `0683d266` and on the upgraded branch, so no dependency change
caused it:
- `run-live-execute.mjs` failed 3 checks: `initialize` reports no envelope contract in its
  instructions, case 6's result is unparseable, and case 8 is `isError` with
  `Cannot read properties of undefined (reading 'slice')`;
- `run-live-spec-search.mjs` failed case 4, whose oversized whole-spec result is meant to be
  truncated host-side with the footer.

The cause was not investigated. Until they are repaired, AGENTS.md's live
check depends on the handshake and smoke lanes.

Done when: both suites pass against a current local server, or each failing check is rewritten to
the current contract or deleted with a stated guard.

### Method note: same-surface verdict noise, and the judge-tier cap

Standing note, not a task. Two runs of the same 50 panel rows on the same surface differed on 17 rows (8
up, 9 down, net 1) in the first measurement
([step 0 to step 0-prime](rounds/2026-11-14-baseline-tuning/STEP-0-PRIME.md)); 7 of 35 rows differed once
the judge tier matched. Part of that was the judge-tier cap: the stored run capped boundary panels at
34 and left 10 eligible rows on one judge; the repeat capped at 50. Five of the eight ups in the
arm 3 run were panel-to-single moves. Rules that follow:

- Fix `--max-panel-cases` and the stability register for every run that will be compared, so no
  boundary-eligible row is skipped on one side only. Report the tier of every changed row and the
  net on tier-matched rows beside the all-rows net.
- A change smaller than the null is not a result: model the null as independent row flips (50 rows,
  flip rate 0.12 to 0.20 gives a 95th-percentile net of 4 to 5; 0.34 gives 7), and trace each moved
  row to a cause in the transcript before counting it.
- A verdict is one sample from one judge tier. Do not read a single row's move as an effect.

Done when: `run-qa.mjs` or a compare script refuses to pair two runs whose panel cap or register
differ, or a same-surface pair at one cap measures the null directly. Delete this note then.

### Keep OpenCode out of client diagnostics

OpenCode stays out of client diagnostics (owner, 2026-11-17): no decision depends on it. Round item
4.1's [record](rounds/2026-11-16-next-phase/items/4.1/RECORD.md) measured GPT-6.1 Terra in the Codex
CLI and Grok 4.7 in the Grok CLI. Reopen on a production signal: OpenCode in the user-agent read,
or a reported OpenCode failure. Then run Codex Terra through the ChatGPT login, smoke first, under
under its own cap, after the [brief](rounds/2026-11-16-next-phase/items/4.1/briefs/opencode-mac.md)
and the smoke rule are rewritten for that provider.

Logins, checked 2026-11-17 with one trivial prompt each: ChatGPT and SuperGrok are logged in to
OpenCode on the Mac and on agentpc. OpenCode offers Anthropic only through an API key, which the
owner's rule excludes. Any OpenCode run starts with the probe in [`eval/EVALS.md`](../eval/EVALS.md#model-call-billing)
("OpenCode probe"), which checks that the provider's login is `oauth` and that no API-key provider is
enabled. "Build a subscription second judge on OpenCode when a decision needs one" is the one OpenCode
use the owner's rule leaves open.

### Build a subscription second judge on OpenCode when a decision needs one

The repository has one judge: Claude Sonnet on the Claude Code subscription (`eval/qa/judge.mjs`).
Round item 8.6 removed the AI Gateway judge, which existed because the Codex CLI could not be shown
tool-blind (#387). No current decision needs judge-vendor diversity, so nothing is built. Checked
on agentpc, 2026-11-18 and 2026-11-19 (Codex offline with no model call; one Grok probe call):

| CLI | Tool control | Tool-blind? |
|---|---|---|
| Codex (`codex-cli 0.169.0`) | `--disable <FEATURE>` and per-feature switches; no all-tools-off control | No. Offline `codex debug prompt-input` with every plausible `--disable` flag, web search disabled and an empty `CODEX_HOME` still defines the `exec` host, `wait`, `request_user_input` and the `collaboration` tools (2026-11-19, no model call; the command and tool list are in [EXEC.md](rounds/2026-11-16-next-phase/items/8.7/EXEC.md)). A deny-list also goes stale when a release adds a tool. Stays unsupported |
| Grok (`grok 1.0.88`) | `--tools` (an allowlist), `--disallowed-tools`, `--deny` | No. Probe 2026-11-19 ([PROBE.md](rounds/2026-11-16-next-phase/items/8.7/probes/PROBE.md)): with `--tools ""`, `--deny 'mcp__*'` and no web search, `read_file` returned the canary and the full built-in set stayed defined. Not execution-blind. A different configuration (a non-empty allowlist of one inert built-in, or a permission mode that refuses every tool) would need its own pre-registered probe, and a Grok version change reopens this row |
| OpenCode (`v2.3.0`) | Agent `permission` rules; an agent with `permission: {"*": "deny"}` resolves to a deny-all rule in `opencode debug agents --standalone` | Yes at the execution boundary (config verified offline). Tool definitions may still reach the model |

Trigger: a decision that needs a second, non-Claude judge, such as a cross-arm grade difference that
a second Claude family cannot settle. Then, under its own cap:

1. Run the probe in [`eval/EVALS.md`](../eval/EVALS.md#model-call-billing) for `openai` (ChatGPT) or
   `xai` (SuperGrok), and confirm the exact model in `opencode models --standalone`.
2. Define a `judge` agent with `permission: {"*": "deny"}`, check it with `opencode debug agents
   --standalone`, and launch with `--standalone -m <provider>/<model> --agent judge`.
3. Grade the seven fixtures behind `npm run eval:qa:selftest` as calibration.
4. After every run, check that `opencode.db` holds no tool part for the session.

Done when: the judge passes the calibration under its own cap and the after-run check is
clean, or the decision is made without it. Delete this item then.

### Close the remaining claim-support gaps of judge pack p9

The judge uses pack `p9` ([result](rounds/2026-10-12-pack-p9/result-p9.md)). Known limits:

- The November 3 model sweep reported an 85-row tag list cut to 82 rows in judge evidence, with
  false wrong verdicts on `q-ti-vocab-project-tags-live`
  ([ledger](rounds/2026-11-03-playground-model-sweep.md)). The 2026-11-14 audit retired that
  case as Raven mechanics, but a long list can still be truncated. Before another
  model-selection round, recover the transcript, compare its rendered pack, and repair any
  confirmed truncation.
- Field and unit limits: Etherfuse shows 5 of 7 records, stablecoin issuers 41 of 42, and
  ERC-8004 0 of 2.
- Five control rows lose 1 to 3 answer probes against p8.
- The R8-1 sentence scope is unresolved.
- The round follow-up "Check what the judge saw before changing how it weighs cited text" may
  add a cited-text gap here.
- Judges see capped transcript text and claim-anchored packs, while agents read full payloads
  through `codemode.artifact.read`, so live-computed aggregates ("N of M events") stay
  unanchorable. A pre-cap evidence sidecar would close it at the root: `run-qa.mjs` captures
  uncapped `execute` payloads (or dev R2 artifact bodies) into a gitignored per-stamp sidecar, and
  the pack builder prefers the sidecar over the capped transcript. Without it, the first break is
  count and aggregation claims on live digest cases. This is a runner change and a pack-version
  change, so it needs its own reviewed measurement.

Done when: a reviewed later pack closes these gaps with a capped measurement, or the owner
accepts them as the standing limits of p9.

### Decide whether a sourced summary error matches must-avoid "unsupported memory"

Two of three judges matched a candidate's misread directory status to the must-avoid item "Do
NOT claim unsupported memory is a source-supported current observation", which forces `wrong`
under rubric `v2.11`. The saved evidence does not show memory (review R8, PR #264). A rubric or
prompt change that separates a misread source from unsupported memory is a judging-semantics
change: it needs the paid seven-call self-test, an independent review, and a paired re-judge.
It fits the same change as the judge-evidence item in the round follow-ups.

Done when: a reviewed decision is recorded, and any rubric change has its measurement.

### Reconcile the QA answering prompt with out-of-scope goldens

The answering prompt asks for a plain, brief out-of-scope answer (`eval/qa/run-qa.mjs`), while
goldens such as `q-edge-oos-solana-vs-aptos` and `q-raph-stolen-wallet-recovery` require
decision support or acknowledgment. The second absorbed `q-n3-wallet-hacked-support-redirect` in
the 2026-11-14 audit. The delegated October 1 adjudication keeps both
([record](rounds/2026-10-01-backlog-closeout/owner-adjudications.md)); the owner can veto it. A
prompt change changes the implementation hash and needs a reviewed decision and measurement.

Done when: a reviewed decision changes the prompt with a measured before and after on the
out-of-scope cases, or records why the prompt stays.

### Monitor Raven capability-boundary offers

Three reviewed QA cases offered a later Raven lookup by G-address or transaction hash, which
Raven does not expose. Monitor-only by owner decision
([decisions](rounds/2026-09-03-owner-decisions.md),
[adjudications](rounds/2026-10-01-backlog-closeout/owner-adjudications.md)). The control case
`q-jutsu-check-account-history` asks for public lookup guidance; a valid mechanism must not
suppress it.

Reopen a free cause audit after a production occurrence, a transcript with an attempted
account-scoped operation, model-facing prose that advertises the capability, or a new distinct
QA case. A fired trigger allows free scans, a plan, and an independent plan review; a diagnostic
and a headline sample each run under their own caps. Do not add another QA-prompt wording
layer or copy case facts into a prompt.

Done when: the owner retires the monitor, or a fired trigger leads to a reviewed resolution.

### Monitor Friendbot network-context synthesis

`q-edge-send-me-free-xlm` called Friendbot Testnet-only with no tool call, twice. Stellar Docs
distinguish Testnet, Futurenet, and local Quickstart. One answering failure is not a finding. A
repeat of the same case does not fire this monitor.

Done when: the same defect appears in a second unrelated case (a different question family and
primary service), a contract mismatch appears, or trace evidence shows the prompt requests the
wrong behavior. Record each recurrence with its case ID, result stamp, and transcript.

### Move the pinned judge-stability register out of the `gca-eval` worktree

`eval/qa/heldout-read.sh` defaults its register to
`/home/tyler/code/raven-wt/gca-eval/eval/qa/judge-stability.json` and stops unless its SHA-256 is the
pinned value, so that detached worktree stays as a data directory; the stored QA results live in its
ignored files too. Both are also in the held-out archive of the 2026-11-16 branch cleanup
([record](rounds/2026-11-16-next-phase/items/0.3/DISPOSITION.md)).

Done when: the register and the stored QA results sit at a fixed path outside any worktree, the script
default points there with the same pin, and the `gca-eval` worktree is removed, in a reviewed change.

### Stabilize the timing-ratio assertion in `test/qa-judge-evidence.test.mjs`

The test `scans failed and userinfo-free URL candidates in bounded linear time` is flaky. On
2026-11-18, PR #484's CI run 44223760712 on its final head `997f8e30` failed attempt 1 at
`test/qa-judge-evidence.test.mjs:1519`: `largeMs / smallMs` was 8.41 against `< 8`. Attempt 2 of the
same run passed with no code change. The failed attempt is
<https://github.com/stellar-experimental/stellar-raven/actions/runs/44223760712/attempts/1>.

Scope: that one test. Line 1519 compares two single wall-clock samples, and line 1518
(`largeMs < 250`) is also one single sample. The other timed assertions in the file (lines 715,
1587, 1808, 1821) are out of scope.

Approach: count work instead of time where the scanner allows it. Otherwise take the minimum of
several runs for each size, because noise only adds time.

Done when: no assertion in that test compares a single timed sample.

### Flush the uncited golden-round JSON

The two golden rounds (`.agents/rounds/2026-11-02-golden-audit/` and
`.agents/rounds/2026-11-14-golden-coverage-audit/`) hold JSON intermediates that carry case text
outside the case folders. At round item 7.1, 109 files were removal candidates. The corpus cites 24 of them as per-case provenance and `sd-108` cites a 25th, so 84 could
go. Round item 7.1 left the flush out so it would not land in a code commit
([report](rounds/2026-11-16-next-phase/items/7.1/REPORT.md)). The `.ignore` files and the hook
already keep agents out of the folders, so this is cleanup, not exposure.

Next: write a committed token-only script that lists the files neither the corpus nor an
`improvements/` finding cites. It searches the case folders and `improvements/` without printing any
case text. Then one records-only pull request removes the listed files with `git rm`. Reviewers read
`--stat` only and never open the files.

Done when: the files are gone, and the script proves that nothing cited by the corpus or by an
`improvements/` finding went.

### Move the compiled case files into `eval/qa/compiled/`

`eval/qa/cases.json`, `sample.json` and `tool-cases.json` sit where a non-Claude lane's
`rg -g '*.json'` glob can reach them. The case-search hook covers Claude Code only. Moving them
closes that hole at the source. About 30 references change.

Trigger: after every dated run and follow-up has merged, and `systemctl --user list-timers` on
agentpc shows no `raven-dated` or `raven-watchdog` unit. The dated runs read the current paths
(`items/1.4/dated/PRESTAGE.md`, `launch-dated-lead.sh`, `watchdog-dated.sh`, `sibling-check.mjs`),
and so do the installed copies under `~/.local/share/raven-dated/`. A run that cannot show its
event schedules a follow-up, so the last merge can fall after 2026-12-04.

Done when: no `rg -g '*.json'` file entry reaches the three files from the repo root, and the hook
and `.ignore` tests are updated.

### Wire the case-search guard into Codex and Grok

The Claude Code hook (`.claude/settings.json` and `scripts/agent-hooks/case-search-guard.mjs`, round item 7.1) denies the ordinary forms that open
case text. Codex and Grok lanes rely on the `AGENTS.md` rule alone. Codex 0.169 has a Claude-shaped
`PreToolUse` deny contract, so the same script may serve, but its payload field names are
unverified. Grok 1.0.88 has a hook dispatcher that nobody has investigated.

Next: read each CLI's hook contract, wire the guard, and run the hook's probe set through each CLI
once as a live probe on the subscription login.

Done when: each CLI denies the hook's probe set in a live probe, or this item records why one
cannot.

### Tag confirmation-only rows in the agent discovery runner and the agentic workflow

Only `run-discovery.mjs` and `run-replay.mjs` import `lib/confirmation-only.mjs`.
`run-agent-discovery.mjs`, `classify-misses.mjs` and the agentic workflow
(`eval/agentic/workflow-agentic-routing.js`, its capture proxy and reconciler) do not tag or hide a
row that matches a QA headline question, although `routing-qa-overlap.mjs` lists an `agentic` set.
The guides now say so and ask for counts only.

Next: wire the tag into those paths so a listed row prints `confirmation-only` in place of its
outcome, with the same fail-closed behavior as the one-shot runner. Or decide the counts-only rule
is enough and delete this item.

Done when: every runner that replays a listed row tags it, or the owner accepts the guide rule.

### Move the playground blind-packets test out of a record folder

`research/audits/2026-11-06-playground-final-resolution/blind-packets.test.mjs` is tracked, and
`vitest.config.ts` excludes no `research/` path, so `npm test` and CI run it from a dated record
folder. A record folder should not hold a test that gates CI.

Next: move the file under `test/`, or add `research/**` to the vitest exclude and retire the test.
Either way, update the `test/README.md` scope line that now names the extra file.

Done when: `npm test` runs no file under `research/`.

### Run the judge self-test on the resolved judge model

The QA judge default is the Claude Code alias `sonnet` (item 8.3), so it moved from `claude-sonnet-5`
to the newest Sonnet (`claude-sonnet-5-5` on 2026-11-18). The paid seven-case self-test
(`npm run eval:qa:selftest`) has never graded that model. Item 8.3 made no paid call, so it could not
close this.

Trigger: the first headline judged run, or any run whose verdicts will be compared. Run the self-test
under its own cap first, and let that run set the new baseline (`eval/EVALS.md`, rule 7).
The self-test requires an exact `--judge-model` and refuses an alias: resolve `sonnet` first (the
roster's one-call `modelUsage` read), pass that ID, and each candidate fails if its verdict reports
another model. The call record has an exact key set and no model field, so record the exact ID beside
the summary. Repeat it whenever the resolved judge model moves.

The judge also launches with `--setting-sources ""` since item 8.6, which the same self-test covers.

Done when: the self-test passes under its own cap and its record names the resolved judge
ID.

### Bump the Playground catalog IDs when the AI Gateway lists a newer model

No provider offers a family alias, so `DEMO_CATALOG_LATEST` in `src/demo/model-config.ts` (Terra,
Haiku, Grok) names exact AI Gateway catalog IDs (item 8.3). The gauntlet default follows
`DEMO_MODELS`, the shipped primary and fallback.

Trigger: the AI Gateway catalog lists a newer Terra, Haiku or Grok. Owner: the orchestrator,
when it next reads the catalog. Bump the constant. Check `DEMO_ANTHROPIC_5X_MODEL` in the same
change: it matches generation 5 only, and an unmatched Claude ID silently loses the
adaptive-thinking options. A new primary or fallback
model is a Playground change, so run the gauntlet on the candidate first
(`eval/playground/README.md`).

Done when: no trigger remains open. Delete this item then and add it back at the next trigger.

## Documentation follow-ups

### Apply the item 8.2 deferred documentation changes after run 2.2c merges

Round item 8.2 audited the living documents. It left these changes for after run 2.2c has merged
(about 2026-12-04), because the dated runs read `AGENTS.md`, `golden-truth`, `improvements-pipeline`,
`eval/qa/README.md` and the TODO anchors at launch. This item waits for the orchestrator's approval
of the list; do not apply it before then. The list is the "Approval list" point 3 in the item's
[RECONCILE.md](rounds/2026-11-16-next-phase/items/8.2/RECONCILE.md):

- The `CLAUDE.md` prohibition (the fact "there is no `CLAUDE.md`" already landed).
- O-10: one statement of posting and deploy authority across `AGENTS.md`, two skills and
  `ecosystem-skills/README.md`.
- O-27: define owner, lead, orchestrator and lane once in `AGENTS.md` "Coordination".
- O-30 (the `wrangler kv` usage sentences move to `docs/operations.md`), O-32 to O-38 (move or
  reword `AGENTS.md` rules that are orchestrator handoff detail), and O-40 (shorten the Solo rule).
- C-17: record the playground gauntlet's own Wrangler per model as an exception to "do not start a
  second Wrangler process", or let the gauntlet reuse a server.
- "File and response size come second" in `AGENTS.md` "Spend and evidence".
- B-12 (declined as superseded), B-13, B-14 and the "Raven scoping" sentence in
  `improvements-pipeline`, and the `golden-truth` lifecycle overlap.
- O-12: split `eval/qa/README.md` (about 860 lines holding an operator guide, repo-wide agent rules,
  pack internals and dated results).
- Point the case-search hook message and the three `.ignore` headers at "Searching without reading
  case text"; with the pointer line in "Held-out split" they stay navigable until then.

Done when: the approved changes are applied and the rest are declined in the round ledger.

### Fix the document pointers in `src/` comments

Three comments under `src/` point at text that no longer fits. Editing them changes Worker bytes,
so they ride with the next code change, not a documentation pull request.

- `src/mcp/tools.ts` (the `BASE_SERVER_INSTRUCTIONS` comment) narrates the removed per-family source
  map. State what the string is and where the family orientation lives.
- `src/auth/gate.ts` and `src/auth/redirects.ts` cite "DESIGN.md D1" and "D2 of the oauth-provider
  1.x round". That file sits in a round folder that retention may delete. Point them at the
  per-origin provider description in `ARCHITECTURE.md`.

Done when: the comments state current behavior with no history and no pointer to a round file.

## Dependencies

### Wait for a picomatch release that fixes GHSA-fc5q-39xc-vjpf

Issue #481 (`npm audit`, 8 high; it replaced #473, closed on 2026-11-17) traces to one advisory:
picomatch through 4.0.7 has a ReDoS on single-branch repeated extglobs (GHSA-fc5q-39xc-vjpf,
published 2026-10-19). Every reported package reaches it through `picomatch` 4.0.7, which is still
the latest release on 2026-11-18, and the advisory names no patched version. The fixes `npm audit`
offers are downgrades and are not taken: `agents@0.8.3`, `vitest@3.1.4`, and
`@cloudflare/vitest-plugin@0.0.0`.

Reach on 2026-11-18: `picomatch` comes in through `vitest`, `tinyglobby` and `fdir` (tests), and
through `agents` via `vite` and `@rolldown/plugin-babel` (build tooling). The built Worker bundle
(`dist/server.js`, built from `bb171055`) contains no `picomatch` text (0 matches), and Raven passes
no untrusted glob to any of these tools. Production has no exposure; the risk is local tooling only.

Done when: a picomatch release fixes the advisory, the lockfile takes it (an `overrides` entry if a
parent pins it), `npm audit` reports none, and the dependency-audit workflow closes #481.

### Move `wrangler`, `miniflare`, and `@cloudflare/vitest-plugin` together

Standing note. `@cloudflare/vitest-plugin` pins `wrangler`, `miniflare`, `esbuild`, and `zod` exactly,
and `package.json` holds exact pins for `wrangler`, `miniflare`, and `esbuild`, with no `overrides`.
Bump the plugin and `wrangler` in the same change, and expect a nested dev-only `zod` copy while
the plugin's `zod` pin trails the root's. Check the lockfile for one `workerd` copy (exactly one key
ending in `node_modules/workerd`) after every toolchain bump.

The deprecated `@cloudflare/vitest-pool-workers` 0.23.0 is the dead end: it imports `getNodeCompat`
from `miniflare`, which miniflare removed in `5.20261103.0-beta`. Its ceiling is `wrangler` 4.156.2
with miniflare `5.20261102.0-beta`. Do not go back to the pool or to an `overrides` route.

`vitest` is on 5.x (5.1.0 from round item 7.3, PR 5), inside the plugin's peer range
`^4.1.0 || ^5.0.0`. Check that range before moving either one.

Done when: the plugin no longer pins `wrangler` exactly. Delete this note then.

### Move the demo off the deprecated `workers-ai-provider`

Cloudflare froze `workers-ai-provider`, and npm marks 4.0.1 deprecated (checked 2026-11-18). The
replacement is `createAI` from `agents/models/ai-sdk`, which needs `agents` 0.32.0 or later;
`agents` is 0.33.0 now, so that precondition is met. Still blocked: `createAI` string catalog
models drop `providerOptions.anthropic` (adaptive `thinking` and `effort`) on the binding `/run`
path (`cs-010`, [cloudflare/agents#2809](https://github.com/cloudflare/agents/issues/2809), open;
repro under `rounds/2026-11-03-demo-createai/repro/`). The repro was re-run on `agents` 0.33.0 on
2026-11-09 and still reproduces. The owner decided on 2026-11-03 to keep current behavior and not
migrate through a different transport. The binding path has no stream-resume opt-out:
cloudflare/agents#2790 was closed as not planned on 2026-11-03, so `createAI` keeps stream resume,
and the reviewed decision the migration needs covers that.

Done when: an `agents` release forwards Anthropic provider options for `anthropic/*` catalog ids
(re-run the `cs-010` repro), a reviewed decision covers stream resume, `src/demo` and
`test/demo-model-config.test.ts` no longer import the package, and `wai-001` is closed under the
`improvements-pipeline` skill. The migration moves the demo model path, so it needs
`npm run test:smoke`, the single-`workerd` check, and a Playground run of every demo model. The
migration is not `fixed-upstream` evidence for `wai-001`; that close-out needs a reviewed
lifecycle decision.

### Verify that xAI accepts the explicit tool `strict` field

Both Playground tools set `strict: false`, and the field reaches the OpenAI-compatible chat
transport of the Grok control model (`DEMO_GROK_CONTROL_MODEL`, the newest Grok in the AI Gateway
catalog). xAI acceptance is unverified.

Done when: the gauntlet with the Grok control model selected by `--models` shows it accepts the
request before the next control-model lane, or a reviewed change omits the field for that transport.

### Confirm `npm run mcp-key` on wrangler 4.164.0

`scripts/mcp-key.mjs` writes and revokes API keys through `wrangler kv key list`, `put` and
`delete`. Wrangler moved to 4.164.0 in #483. Checked on 2026-11-18: `--help` for all three commands
still lists `--binding`, `--remote`, `--prefix` and `--path`, and a local `kv key list --binding
OAUTH_KV --prefix raven:api-key:v1:` returned a JSON array. The script fails closed: a failed list or
put throws before any credential is written, and `rotate` overwrites without a delete first. Only
the remote run is unchecked.

Next: in the 2026-11-25 Mac session, run one read-only `wrangler kv key list --binding OAUTH_KV
--remote --prefix raven:api-key:v1:`. Record the output shape only, never a key name. If it errors,
fix the script before the next `npm run mcp-key` use of any kind, including the OpenAI reviewer-key
revoke in "Obtain a written exception for the accepted two-tool endpoint".

Done when: the remote list parses as the script expects and the shape is recorded, or the script is
fixed.

## Deferred programs

### Write ADRs for the per-origin OAuth design and the stellar.org admission

Neither has a decision record; living docs cite the round records instead
([DESIGN.md](rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/DESIGN.md) for per-origin OAuth
providers and the native-callback allowlist; #447 for the stellar.org source). Owner, 2026-11-18:
write them if and when that area is tackled again.

Trigger: the next change to the OAuth host model, the callback allowlist, or the stellar.org source
or its admission. Done when: the ADR is in `research/decisions/` and its index lists it.


### Keep `sources.locate` deferred

Deferred by the owner on 2026-08-28. The design and the reopen rule are in
`ideas/source-delivery-ranked-references.md`, section 8. Condition 3 needs live
repository-recovery steering, which does not exist. Log an incident that meets conditions 1, 2,
and 4 in the Horizon monitor item, but do not count it until condition 3 holds.

Done when: the full section 8 trigger fires and the owner approves a phase-zero study, or the
owner retires the program.

### A future `retrieve` or `read` tool

No build is planned: eleven `retrieve` variants scored below the current design, and the best
one failed live. If the idea returns, start from the design rules in the round record: accept a
lone string for a list argument, give every model-written part a deterministic fallback, return
PDF text or say it is unsupported, score lazily, and do not write a brief inside the request.

### Consider consolidating the auxiliary Workers

Three Workers run beside `stellar-raven-codemode`: the usage collector, the usage report API,
and the OpenAI domain challenge. The owner asked on 2026-10-25 whether fewer would do. Answer
before any change:

- Can the main Worker serve the report API and the challenge as fixed routes without widening
  the MCP surface, the sandbox boundary, or the D1 binding's reach?
- Can a Worker be its own tail consumer? Cite Cloudflare docs.
- Does the collector's "no HTTP route" isolation in `usage/README.md` hold if it absorbs the
  report API?
- What changes in `usage-health`, `scripts/check-usage-deployment.mjs`, the fork setup, and the
  dashboard's `USAGE_REPORT_URL`?

Done when: the owner accepts a reviewed design note and it ships, or the owner keeps the split
and this item is deleted.

### Run the overdue partner-documentation review

[`ideas/partner-doc-live-sources.md`](../ideas/partner-doc-live-sources.md) holds the partner
Markdown source lane behind a four-phase gate and set its review for 2026-10-31. The date passed
with no recorded result. The first step costs no model call: re-evaluation step 1 is the paired
12-case `npm run eval:partner-docs -- --raven-url <bound URL>` against the reused `dev` terminal.
The baseline arm is the unmeasured half, and stellar.org and the newer Scout index now exist.

Next: run it once, then follow the note's re-evaluation steps. Stop at an empty residue and close the
idea again without an implementation round.

Done when: the result is recorded in the note's status and the idea is held, closed, or promoted to
the gate's next phase.

### Read the `skill_read` shape distribution

[`ideas/skill-discovery-without-bundling.md`](../ideas/skill-discovery-without-bundling.md)
pre-registered its decision rules for the `skill_read` events: read after 100 organic events or
2026-09-30, whichever comes first. The date has passed and nothing fired the read. It is one Workers
Logs calculation over `skill_read.shape` and `id` by the `cloudflare-observability-review` skill.
Workers Logs hold at most seven days, so a read can count only the organic events from that window;
if it counts fewer than 100, record the count and re-read later.

Next: take it in the next Workers Logs session (priority 2 above), apply the note's rules as
written, and do not paraphrase them here.

Done when: the answers to both questions are recorded where the note says, and the note is deleted.

### Measure long-horizon codegen with Raven installed

No instrument measures long-horizon codegen with Raven installed. The only evidence is one external
partner's run, in the
[2026-08-07 codegen partner report](../research/audits/2026-08-07-codegen-partner-report.md): Raven
served guidance for many of the reported defect classes, the defects occurred anyway, and the cause
is unattributed (n=1).

Trigger: the partner's per-round bug report arrives, or the owner funds a with-Raven versus
without-Raven codegen A/B graded against the partner's external defect taxonomy. The A/B is a direction call
and runs under a hard cap.

Done when: a capped A/B attributes the defects or the owner retires the question.

## OpenAI plugin submission

### Obtain a written exception for the accepted two-tool endpoint

Package `0.1.2` was submitted on 2026-10-23; the last recorded portal state is `In review` and
`Not published`, with the reply to OpenAI still an unsent draft. Check the portal and the
correspondence before acting. The trimmed surface changes the tool descriptions the review
cases describe; re-run the rehearsal before the next submission step.
[`plugins/openai/README.md`](../plugins/openai/README.md) has the records and rules.

Before publication, resolve publisher verification and privacy coverage. The `/terms` 30-day
observability promise against today's 7 days is tracked in "Keep 30 days of observability data,
including queries and responses". After the final review
decision, revoke the reviewer API key `openai-review-20261007`. Before that revoke, finish
"Confirm `npm run mcp-key` on wrangler 4.164.0".

Done when: OpenAI grants the exceptions, or the owner approves another approach.

### Remove the OpenAI domain verification Worker after approval

Trigger: OpenAI approves and publishes the app, or the owner withdraws the submission. Confirm
in the portal that nothing still needs the live challenge. Then delete the
`stellar-raven-openai-verification` Worker and its route, delete
`plugins/openai/domain-verification/`, and update `plugins/openai/README.md` and
`plugins/openai/VERIFICATION.md`.

Done when: the Worker, its route, and its source are gone, and the published app still passes
the portal's connection check or the owner has confirmed withdrawal.

## Owner decisions

Each decision names the question and the safe default. Record the answer in a round ledger or a
decision record, then delete it here.

1. **Which source, if any, to test for the facts no reached source holds.** Round item 1.3 classed
   every residual source gap
   ([CLASSIFICATION.md](rounds/2026-11-16-next-phase/items/1.3/CLASSIFICATION.md); probes in
   [LEAVES.md](rounds/2026-11-16-next-phase/items/1.3/LEAVES.md)). Two facts remain: the XRP
   Ledger facts (`ecosystem.chain-comparisons`, xrpl.org) and the NBU statement (`ll-039`). The NBU
   fact waits upstream as `ll-039`, so the testable candidate is an other-chain source for
   `ecosystem.chain-comparisons`. Pi Network's relation to Stellar (`sd-113`,
   `wallets.pi-network`) does not earn a source, and `sd-113` is not forwarded (owner,
   2026-11-17). Pass condition, fixed in advance: more correct answers and no more wrong ones.
   Query and answer text are not logged, so telemetry shows no demand for these facts; silence is
   no measured demand, not absence. Decision 6(b) deferred the choice until after round item 3.1,
   and that read decides nothing here. Safe default: test none. The gaps stay recorded in the 1.3
   classification.
2. **Release and package-version data, and the Dashboard lumens API (decision 6(b)).** Options: an
   upstream Scout request filed in `improvements/`, or a new host adapter (an ADR-0003 exposure
   change). Safe default for release data: leave it upstream and file the request. Safe default for
   the Dashboard lumens API: not added. It has no telemetry proxy (`stellarOrg` is two generic
   operations and arguments are not logged), and round item 1.3's `sdf-mandate-holdings` row shows it
   is not needed for that fact. "Fix the `getChangelog` ranking trap for release questions"
   proceeds either way.
3. **The MCP Skills extension** (SEP-2640, MCP SDK 2.4; from round item 7.3 PR 2's report). It could
   publish Raven's pinned ecosystem skills through native client skill listing and reading. Its
   `attach` is experimental. A new client-visible surface falls under ADR-0003, so it needs this
   decision, a design study and a measured A/B. Safe default: not started.
4. **The WorkOS recovery record.** Commit it (and with what redaction) or discard it. See
   "Confirm the WorkOS GitHub sign-in recovery and decide its record". Safe default: it stays
   untracked on the Mac, and the orchestrator keeps a second copy outside the checkout until it is
   decided.
5. **Install ripgrep on agentpc** (owner, needs sudo; round item 7.1). Safe default: Claude lanes use
   the `rg` from Claude Code's shell, and other lanes use the `git grep` exclusion form in
   [`eval/qa/README.md`](../eval/qa/README.md) ("Held-out split").
6. **A production bearer credential for post-deploy checks**
   (`research/audits/2026-11-06-remaining-sweep/live-host-check.mjs`, not run after the round item
   7.3 deploys because no production bearer credential exists on the Mac or agentpc). It is the
   only free check of both wire eras on all three hosts. Safe default: none. Deploy checks stay on
   the OAuth metadata, the `/mcp` 401 and one connector `execute`.
Owner-blocked actions that already have an item (one line each, no decision needed here):

- The OpenAI portal check and reply: "Obtain a written exception for the accepted two-tool endpoint".
- The `sk-031` workflow cleanup patch and the `cs-006` contact authorization: "Improvements
  follow-up".
- The auxiliary-Workers question of 2026-10-25: "Consider consolidating the auxiliary Workers".
