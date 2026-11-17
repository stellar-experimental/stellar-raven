# TODO — own-repo work queue

Own-repo work only: adapters, catalog, executor, scoring, eval instruments, goldens, gates, and
documentation. An upstream service defect goes to `improvements/` (see
[`improvements/README.md`](../improvements/README.md)).

Add an item when you find work you are not doing now. Delete it when it is done; git history is
the archive. An item states what is wrong, its current state, the next step or trigger, and what
"done" means. Keep the history in the linked ledger, not here. The spend rules in
[`AGENTS.md`](../AGENTS.md#spend-and-evidence) apply to every item: no item below authorizes a
paid run.

## Priorities

"Round item N" is an item of the [2026-11-16 round](rounds/2026-11-16-next-phase.md). Its
[plan](rounds/2026-11-16-next-phase/PLAN.md) proposes; the
[owner decisions](rounds/2026-11-16-next-phase/DECISIONS.md) bind.

1. Dated truth maintenance: the Bell goldens after the 2026-11-23 vote and the three later cases
   (round items 1.4, 2.1 and 2.2), and the upstream handoffs (round item 1.1).
2. The owner's source choice, now that the production read (round item 3.1) and the source-gap
   residue (round item 1.3) are in: "Audit source coverage" and "Add a release and package-version
   source".
3. Mechanisms with a measured cause. Round items 3.2 and 3.3 are done: 3.2 merged as #462, and
   3.3 measured both ranker mechanisms and dropped them (see "Treat stellar.org routing reach as a
   lexical and description question"). No mechanism here is pending.

No third tuning loop, and no paid QA run without a new written owner authorization, except round
item 4.1 under decision 7 (owner, 2026-11-16, decision 1). The general routing repair stays held.
It needs new mechanism evidence, not another lexical variant.

## First-principles round follow-ups

Round `fp-2026-11-12`: [ledger](rounds/2026-11-12-fp.md),
[record](../research/audits/2026-11-12-first-principles-round.md), and
[ADR-0011](../research/decisions/0011-tool-surface-stays-code-mode-trimmed.md). The tool surface
stays `search` + `execute`, trimmed for cost. The owner accepted the trimmed surface's loss on
live-data questions as the price of the trim (2026-11-16, decision 5). A fix that keeps most of
the token saving reopens it; ADR-0011's reopening rules are unchanged.

Held-out status: the first-principles split is void, because the 2026-11-14 golden coverage audit
rebuilt the battery. The current split is drawn by the rule in
[`eval/qa/README.md`](../eval/qa/README.md) ("Held-out split") from the 247 headline cases:

- SHA-256 `04107a463c462eecb02a64fe0b69fab6cb4a1bc388197c3e3a01107e9350c362`.
- 87 tuning, 113 held-out, and 47 reserve cases.
- The file is on the owner's Linux machine at `~/backups/gca-2026-11-14-split-v6.json`. It
  replaces `gca-2026-11-14-split-v5.json` (SHA-256
  `c8796ec14c4d77d114693cfcf5a51a9f5da80a6506956bb7f88c6992725f4b15`, 86/114/47), which stays in
  place, and v4 (81/117/49), v3 (80/118/49) and v2 (79/119/49) before it. A Mac copy of an
  earlier split, or an id list taken from one, is stale. Tuning scans pass
  `--split ~/backups/gca-2026-11-14-split-v6.json`.
- v5 is a dated amendment of v4 by the orchestrator's answer in
  [round item 1.4 `QUESTION.md`](rounds/2026-11-16-next-phase/items/1.4/QUESTION.md): five
  dated-golden cases moved to tuning so the dated runs (round items 2.1 and 2.2) can open and edit
  them. In the v5 note, "scheduled" means "has a `reverifyBy`".
- v6 is a dated amendment of v5 by the orchestrator's answer in
  [round item 1.4 `FOLLOWUP.md`](rounds/2026-11-16-next-phase/items/1.4/FOLLOWUP.md): one case
  whose provenance an incidental search in the item 1.4 Codex review displayed moved to tuning.
  A script took its id from the session log; nobody saw it.

Two tuning loops tuned on the tuning rows ([loop 1](rounds/2026-11-14-baseline-tuning.md),
[loop 2](rounds/2026-11-15-tuning-loop-2.md)). The audit's battery test read the answers of 70
headline cases before the draw ([ids](rounds/2026-11-14-golden-coverage-audit/qa/ids.txt)). The
baseline and one read per loop ran the held-out rows, counts only. One held-out answer was exposed
(loop 2); it moved to tuning on 2026-11-16 (decision 2(b)). One more case moved to tuning on
2026-11-17 (round item 1.1, orchestrator's answer in its `QUESTION.md`), because its notes were
opened and edited, five more on 2026-11-17 (round item 1.4, v5; see the owner decision below),
and one more the same day (v6). The stored held-out reads and their thresholds are on 119 rows,
and a future read pairs on v6's 113. An item may name a case by ID; never record which set a case is in, and tune no product change on a held-out or reserve case.

Routing and discovery rows whose question matches a QA headline question are confirmation-only:
[`eval/routing-qa-overlap.json`](../eval/routing-qa-overlap.json) lists them, and no lane tunes on
them or reads their per-row output ([`eval/README.md`](../eval/README.md), "Confirmation-only rows").

### Audit source coverage

Round item 1.3 classed every residual source gap
([CLASSIFICATION.md](rounds/2026-11-16-next-phase/items/1.3/CLASSIFICATION.md); probes in
[LEAVES.md](rounds/2026-11-16-next-phase/items/1.3/LEAVES.md); an independent Grok attack in
[GROK-REVIEW.md](rounds/2026-11-16-next-phase/items/1.3/GROK-REVIEW.md) moved three rows to
"reached"). Of the 11 "not re-run" leaves, none is a source gap today: 10 are reached or did not
reproduce, and one leaves a Raven-side TODO (the `scout.matchPartners` 503, below). New findings:
`sd-111`, `sd-112`, `sd-113`, `ll-039`, `sls-121`, `sls-122`. The facts no reached source holds are
now few: the XRP Ledger facts (`ecosystem.chain-comparisons`, xrpl.org), the NBU statement
(`ll-039`), and Pi Network's relation to Stellar (`sd-113`).

Next, the owner's choice only: which one or two sources to test for the facts that no reached source
holds, with a pass condition fixed in advance (more correct answers and no more wrong ones).
Decision 6(b) deferred it until after round item 3.1; that read is done and decides nothing here:
query and answer text are not logged, so telemetry shows no demand for these facts, and silence is
"no measured demand", not absence. Candidate: an other-chain source for
`ecosystem.chain-comparisons`.

Done when: the owner decides which source, if any, to test.

- **Contract-id derivation reachability (2026-11-17).** `q-soroban-contract-id-derivation`: the fact is on
  `/docs/learn/fundamentals/contract-development/contract-interactions/stellar-transaction`
  ("based on `contractIDPreimage` value and the network identifier") and, with "sha256", on
  `/docs/tokens/stellar-asset-contract`. `stellarDocs.search_docs` does not return the first page
  for the question wording or for `contractIDPreimage` in the top 10; `HOST_FUNCTION_TYPE_CREATE_CONTRACT`
  returns it at rank 1. Next check: only if a free retrieval-level A/B shows a general mechanism
  that surfaces the page (no per-query exception; `docs/stellar-docs.md`, "Maintenance").

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
reaches the model. Tuning loop 2 decided two of its three measured caps without a paid test of their
own: seven search cards by default (M1, kept) and the micro-map (M3, removed); see
[the round ledger](rounds/2026-11-15-tuning-loop-2.md). The first item below holds what is left of the third. The
free telemetry read of four more caps is done; its decisions are in the second. A paid test needs
its own written authorization under the `run-evals` skill; none is granted here. Run the free step
first and stop there when it decides.

### M2: bound the default `execute` result under the Grok clip

Round item 3.4 closed the boundary question: it stays 6,000 tokens
([result](rounds/2026-11-16-next-phase/items/3.4/RESULT.md)). The free read re-truncated the stored
tuning transcripts at 16,000 characters (the 4,000-token cut): 32 of the 44 rows with a result over
it state a fact found only past it, so 4,000 is unlikely to hold and no paid comparison runs. At
18,000 characters it is 30 of 38 rows, and a 4,500-token boundary does not fit under the Grok clip
(79 to 100 of 119 results still exceed 20,000 bytes), so neither value is a candidate.

The same read recounted the call patterns on the baseline (87 rows) and the shipped surface (58
rows): `data.sections` misreads 0 of 26 and 0 of 19 section-read scripts, `.data` omissions 0 and
0, failed calls with an omitted reason 0 of 4 and 0 of 8 scripts with a failed call. The sandbox
guard stays unshipped without a new design or an owner decision.

Still open: the Grok CLI cuts any MCP result at 20,000 bytes and keeps the head. In the
first-principles round's held-out look the trimmed surface sent no `search` result over that size
(the largest stored one here is 18,755 characters), but 275 of 565 `execute` results from the
three decisive clients were over it. Of 939 stored tuning `execute` results, 119 are over it, and
the head clip would lose a fact an answer states on 23 of 38 exposed rows; part of that is the
host source block, which carries the as-of date. A candidate: put status lines first and bound the
default result (about 18 KB) with the artifact path for the rest. Round item 4.1's client
diagnostic shows whether a real Grok client meets it.

Done when: a reviewed change bounds the default result under the Grok clip, or item 4.1 shows the
clip costs no Grok answer. A paid comparison of Sonnet 5.5, GPT-6.1 Terra and Grok 4.7 (Grok in
the Grok CLI so its clip applies) needs a new owner authorization.

### Ship the cap decisions from the production read

Round item 3.1 read production once: a 6.5-day Workers Logs window (the 7-day retention, less one
slice) plus 30 days of usage and invocation counts. The figures stay in the owner's private
evidence folder; this item records the decisions. Four caps wait on it
(`cloudflare-observability-review`):

- Public `MAX_SEARCH_LIMIT`: **keep 50.** After the seven-card deploy, more than 5% of top-level
  searches ask for more than 10, so the rule for lowering it to 10 fails. The model-facing text
  reads "default 7, max 50" and stays. Results above 20,000 characters became rare after that
  deploy, so the size case for lowering the cap is also gone. Nothing ships.
- Lumenloop and Scout per-call timeouts: **24 seconds each**, the Stellar Docs budget. No
  operation has more than 1% of its ok calls above 24 seconds. A few operations (Scout
  `searchProjects` and `explainRepo`, Lumenloop `find_similar_scf_submissions`) have more than 1% above
  12 seconds, so no shorter value leaves them a margin. The tails are a lower bound: a call still
  pending at 60 seconds logs no event, and `op` `ms` includes retries and host queueing. Shipped
  (round item 3.2): 24 seconds is one wall-clock budget per operation call, not per attempt, so an
  adapter retry takes the remaining budget and a timeout cannot multiply.
- Artifact caps (`ARTIFACT_INFO_CAP` 8, `ARTIFACT_READ_CAP` 4): **keep.** No `info-cap` or
  `read-cap` refusal in the window, and per-run artifact reads stayed far below both caps.
- `EXECUTE_TIMEOUT_MS` (60 s): **not decided.** No failed `execute` ran past 59 seconds in the
  window, but the rule also counts `POST /mcp` invocations that ended cancelled or disconnected after
  59 seconds, and the platform queries returned no rows. Keep 60 until that half is read. Codex's
  default `tool_timeout_sec` is 60, so a run near Raven's limit can lose its structured timeout
  result to the client.

Next: one free Workers Logs follow-up (run on the Mac) reads
what the first read could not: key discovery returned a capped list, so first search the keys for
`recoveryHint` and the artifact-write `skipped` and `errorName` by name. Every query that
filtered `$metadata.type = "cf-worker-event"` with path `/mcp`, or grouped by the user-agent header,
returned no rows; the cause is unknown, so first group one recent hour by `$metadata.type` and
check which row type carries the path, user-agent, `$workers.wallTimeMs` and `$workers.outcome`.
Then read the wall time of `POST /mcp` invocations over 59 seconds with their outcome, and the
user-agent families. The user-agent read also lets the Grok, Copilot and browser loops in "Triage the
runtime and client gaps" be attributed.

Done when: the `execute` timeout has a recorded decision from the follow-up read.

### Re-verify each external client limit when its version changes

The test constants copy limits that belong to clients. Re-check a limit whenever its client
version changes, and update the cited page and version. Claude Code: 4,096 characters for server
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

Done when: the table's rows match the current client versions. Grok's 2,033-character cut has its
guard: `test/mcp-instructions.test.ts` pins the instructions and both tool descriptions under 2,033
(1,899, 1,960 and 1,964 today, and the first line of each stands alone).

## Tuning loop 2 follow-ups

Record: [round ledger](rounds/2026-11-15-tuning-loop-2.md) and its P0, P1, P2 and R files. The loop
kept the corroboration guard, the micro-map removal, the delivery text, the `stellarOrg` source,
seven cards and the title-case rule for exact rows. It did not ship the identifier pointer. Each
item below is evidence for what it names, not an improvement claim.

### Rename the micro-map files for what they emit

The guard is in the result and the map is gone from the served instructions, but the generator and
its output still carry the old name: `src/mcp/micro-map.ts`, `scripts/build-micro-map.mjs`,
`npm run micro-map:build`, `test/micro-map.test.mjs`, and the CI and skill references to them.
They now emit the instructions text, the family line of `search`, and the guard sentence. Rename
them for that, and assert the served hashes are unchanged (surface `42ec6102…f17f`, instructions
`67a6bd0b…6c00`).

Round item 3.5 does this.

Done when: no tracked file outside dated records says `micro-map`, and the surface hash is still
`42ec6102…f17f`.

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

### Close the all-capitals date gap in the identifier token

`Sep-24` (a month) is no longer an identifier, but `10-SEP-2024` and `2024-SEP-10` still read as
SEP-2024 and SEP-10, so a query about a September date can mark that document exact. The rule is
letter case; a month list would be vocabulary and is forbidden. No stored run shows the case.

Round item 3.5 does this.

Done when: a general rule (for example, an identifier is not preceded or followed by a numeric
date part) separates the date from the standard with unit cases for both, and the 90-query replay
of `test/replay-exact-rows.test.ts` is byte-identical except for the date inputs.

### Stop the routing gate run from printing the holdout rows

Under `--gate` the runner prints the holdout and protocol-history per-case tables on every run,
CI's `npm run eval:routing -- --gate` included. The fingerprint failure message no longer points at
them, but any gate run still writes holdout case ids and top-five lists to stdout. Print the
holdout aggregate only and keep the rows in the results file.

Done when: a gate run's stdout holds no holdout case id.

## Family decider follow-ups

Source: [family decider record](../research/audits/2026-11-14-family-decider.md). The engine question
is closed for the search page; nothing below reopens it. The record also bore on the seven-card default (kept in
tuning loop 2): seven lexical cards against five was +3/−0 on 64 FAM development rows.

### Decide what test earns the sealed FAM confirmation rows

82 FAM confirmation questions, written without goldens and labeled by two lanes, are sealed and
unspent (SHA-256 `07587dc04e2c993a92736d18610e4fc8fa78e04e77541863df4cfa83c85244ec`, held by the
orchestrator; the record lists the paths). They can be used once. A routing-reach test does not earn
them: the rows a decider can win are reached by general search operations the base instructions
already name. A test earns them when its outcome is an answer, not a card on the page, it states the
decision it changes, and its pass rule is fixed before the rows open. Free first step: in the stored
agent transcripts (tuning loop 2's runs hold three), count how often an agent called a family's general search
operation (`stellarDocs.search_docs`, `lumenloop.search_content_semantic`, `scout.searchResearch`)
when the page lacked it. A high rate means no page change helps; a low rate points to a static fix (a
`nextSteps` clause, or two named general ids after the page) inside a paired QA run.

Done when: such a test is written and the rows are spent on it once, or the owner retires the set;
record which.

### Treat stellar.org routing reach as a lexical and description question

Routing reach of the `stellarOrg` operations (top five for 8 of 40 off-golden questions, loop 2
step 2) is this item; "Prove the stellar.org source" points here. The
[family decider record](../research/audits/2026-11-14-family-decider.md) answers it: an engine is
not the fix. On
the 20 development stellar.org questions (natural form) today's page reaches 3, a model-free
family floor 19, and the engines on the rewritten statements +10 to +12 over seven lexical cards
against the floor's +16. The floor is not a ship either: it admitted a `stellarOrg` card on 33 of the 46 FAM development rows that do not
label it. The lead is the family text and the `stellarOrg` descriptions, which the frozen statements
in `research/audits/2026-11-14-family-decider/statements/` show can raise a model's family precision
from 0.73 to 0.95. Under ADR-0009 a change needs +3 at top five with per-case review, and the owner's
rule stands: do not fit the service to the stellar.org slice at the expense of other categories.

Tuning loop 2's P2 measured it: on the 58 panel questions as written a `stellarOrg` operation
enters the top five of none; at the limit agents use (10) it displaces a non-SDF card on about 3 of
25 non-SDF questions. The causes are three, and two are ranker properties: the id token `org`
matches every query word that starts with "org" (the vendor scorer's prefix rule has no minimum
length), and a weakly scored operation that passes the lexical gate fills the gated page so a
higher-scoring one that fails the gate loses its backfill slot. Two general ranker changes follow,
each needing the routing gate and the off-golden 40 as its acceptance check: require 4 or more
characters for the vendor prefix rule, as `tokensOverlap` already does, and let a gate-failed
candidate that beats the page's weakest gated card keep its slot when the page is full. The
description is not changed: a reword that removes the security displacement cut off-golden reach
from 8 to 6 of 40 and moves the cost to other audit questions. Round item 3.3 measured the two
ranker changes once each ([record](rounds/2026-11-16-next-phase/items/3.3/MEASURE.md)); both
failed the pass rule and are dropped, with no second variant:

- **Prefix floor** (4 characters, both directions, both scorers). It removes the `org` match on the
  two spot queries and lifts FAM development reach (55, 58, 63 to 57, 60, 64), but it fails every
  no-loss rule that counts: legacy and holdout rows go hit-to-miss, one holdout row is newly
  captured, extended top3, top5 and cardHit5 fall, and non-SDF displacement at limit 10 rises from 3
  to 5. The 2026-10-02 floor of 3 failed the same gate
  ([lane C report](rounds/2026-10-02-routing-adapter-repairs/lane-c-report.md)); the code is kept
  as `prefix-floor.patch`.
- **Gate-failed slot keeping.** It returns `search_soroban_contract_docs` to the reentrancy spot
  page, but legacy rows go hit-to-miss on four metrics, one holdout row loses top3, FAM development
  reach at limit 10 falls from 63 to 61, and non-SDF `stellarOrg` displacement rises at limits 5 and
  7 (0 to 2 and 1 to 3 of 25). The code is kept as `slot-keeping.patch`.
- The round plan's metric (a `stellarOrg` card displacing a non-SDF card at limit 10, 3 of 25) is
  cause 1, the `search_site` description: all three displacing cards are gate-failed backfill on
  short pages, matched by exact description and id tokens. Neither mechanism removes any of the
  three; the prefix floor adds two at limit 10 and slot keeping adds two at limits 5 and 7. This
  item leaves the description unchanged.

The FAM development rows are archived in the branch bundle (agentpc
`~/backups/raven-next-phase/raven-branches-2026-11-16.bundle`) at ref `refs/heads/exp/family-decider`, path
`.agents/rounds/2026-11-14-family-decider/sets/fam.development.discovery.json`, and in
`~/backups/fd-2026-11-14/split/`; both copies have SHA-256
`0246ad022163f1d67247671b8ed640d7bb61f1aec6cad65a937ffa33b56cf89c`. Moving them into `eval/discovery/` is
owed when this item is worked: the loader now accepts `stellarOrg`, the move changes the routing set,
and it needs its own gate run.

Done when: a general description, lexical or ranker change raises stellar.org reach on the
off-golden questions with no loss elsewhere, measured on FAM development and the SORG development
rows and confirmed on questions not used to write it, or the owner closes the item.

## Golden answers

### Look at the Freighter and Scout SDK-status goldens

Docs retitled the Freighter guides "Varial" (2026-11-16), and Scout 1.9.150 added SDK-status
fields ([record](rounds/2026-11-16-next-phase/items/0.2/REPORT.md)). `q-tool-freighter-wallet`,
`q-tool-wallets-comparison`, and the matching `eval/qa/cases.json` entries need a `golden-truth`
look (a later golden lane; round items 1.1 and 1.3 do not take it). Open no case beyond these.

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

- **Routing reach.** See "Treat stellar.org routing reach as a lexical and description question".
- **Algolia `pages` index.** Orchestrator evidence, 2026-11-14, read in the Algolia dashboard: of
  nine body-text phrases the keyless search missed, the `pages` index ranked the right page in its
  top four for about five. Whether it holds audit records is unconfirmed. Decision (round plan):
  add depth only on a production detail-lookup failure, and then with a search-only key.
- **Audit register (done).** The stellar.org audit register titles 4 of 77 records "Unnamed
  record" (3 are Blend's). Filed as `sd-111` (`verified`, intake `unclear`, unposted; stellar.org
  copy has no public tracker). Whether the owner forwards `sd-111`, `sd-113`, and `sd-077` to the
  stellar.org web team is the owner's call.
- **Anchor Directory (done).** Not an out-of-source fact: the Docs Anchor Tools and Ramps pages and
  the Anchors fundamentals page name `https://anchors.stellar.org`, and
  `stellarDocs.search_docs("Anchor Directory")` returns them at ranks 1 and 4. No golden edit.

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

### Decide whether golden maintenance may open held-out cases (owner decision)

The held-out rule ([`eval/qa/README.md`](../eval/qa/README.md), "Held-out split") moves a case to
tuning once an agent has opened it. A dated golden edit must open its case, so each one exposes it.
Round item 1.4 took option 1 (amend split v5 now) by the orchestrator's answer in its
[`QUESTION.md`](rounds/2026-11-16-next-phase/items/1.4/QUESTION.md). Counts only:

- 66 cases outside tuning carry a `reverifyBy` (split v6). Each one is exposed when its date comes due, so
  option 1 erodes the held-out set every quarter. The next such date is 2027-01-14.
- Option 2 is the durable fix: a golden-maintenance lane that changes no product code may open a
  held-out or reserve case without moving it. It changes the README rule and owner decision 2, so
  it needs the owner.
- Register entries that the dated runs left at `reopen`: a run closes its reopened entries all or
  none, and closes none when it could not read every member (orchestrator's answer 2 (1) in
  `QUESTION.md`). Count left open so far: none recorded yet. Each dated run adds its count here.

Done when: the owner chooses option 1 or option 2 for the quarterly dates, and the left-open
register entries are closed or accepted.

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
gate, and pass an independent plan review and its own spend authorization. It reopens on three
qualifying positive operation-selection misses; the Docs-versus-repository conflict stays
monitor-only until three dated successful re-executions of the Docs-first, inspect, then one
later `scout.explainRepo` sequence. The earlier candidate is in closed PR #102 at `6baec0a4`.

Done when: a reviewed v3 plan ships, or the owner retires the recovery program.

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

- `GET /api/rwa` stays excluded until check 8 passes;
  [issue #167](https://github.com/stellar-experimental/stellar-raven/issues/167) tracks its
  three deferred controls. `GET /api/quality` stays excluded (response-schema keywords caused
  unrelated captures). `reviewSubmission`, `analyzeHackathonSubmissions`,
  `getHackathonSubmission`, and `locateSource` stay excluded.
- Three mixed-intent controls run as `it.fails` in `test/drift-141-routing.test.ts`. Remove the
  markers when the repair passes.
- `inventory/stellar-docs-titles.json` stays at its Algolia-era bytes, so the daily refresh
  reports it as drift and its `source.authEnv` names deleted secrets that nothing reads. On
  2026-11-16 fresh titles (982 Docs pages) cost three graded rows with no gain (two legacy, one
  holdout-lane row by count), and the earlier `q-tool-wallets-kit` loss no longer reproduces.
  Under decision 3 the hold stays
  ([TITLES-AB.md](rounds/2026-11-16-next-phase/items/0.2/TITLES-AB.md)).
  [Issue #223](https://github.com/stellar-experimental/stellar-raven/issues/223) stays open for
  this hold and the repair.
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
0.5.4. Raven stays on 0.5.1 and has an ungated copy of the same rule. Reverse-prefix deletion
and Porter stemming failed routing coverage; do not replace them with query exceptions or a
tuned token-length threshold.

An upgrade past 0.5.1 must also move `src/executor/spec-sandbox.ts`, which mirrors the 0.5.1
`truncateResponse`, `sandboxResponseText`, and in-sandbox `__truncateResponse`; 0.5.3 replaces
them with host-side `truncateResult` (24,000 characters). `test/spec-sandbox.test.ts` pins the
0.5.1 behavior.

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

Fired 2026-11-16: Scout 1.9.150 changed the `GET /api/quality` response schema. The candidate gave
+1 legacy, −1 extended and −1 protocol-history, so quality stays excluded
([SCOUT-EXPOSURE.md](rounds/2026-11-16-next-phase/items/0.2/SCOUT-EXPOSURE.md)).

Done when: a changed contract passes the existing gate and an independent review accepts the
exposure. Otherwise both stay in `EXCLUDED_SCOUT_OPS`.

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

### Clarify the model-facing `codemode.describe` response shape

`codemode.describe` returns `{ ok: true, signature, inputSchema, ... }` at the top level, while
service calls use `{ ok: true, data }`. A production check recovered from reading
`spec.data.signature`
([record](../research/audits/2026-11-09-playground-product-decision.md)). Decide between
model-facing documentation and a forward-only shape change, and measure that change on its own.

Done when: one reviewed, measured correction makes the shape clear to models.

### Triage the runtime and client gaps from the HackMeridian telemetry

Each needs a check before a fix:

- `scout.matchPartners` returned the upstream "AI not configured" failure on every call; live Scout
  now answers HTTP 503 "AI matchmaking isn't available right now". Decision (orchestrator,
  2026-11-17): keep it exposed. The adapter's 503 hint routes to `scout.getPartners`. Measured the
  same day: removing it held every legacy, extended and skills grade and total, but moved the frozen
  holdout lane's forbidden captures from 10 to 11 (ceiling 10) through a lexical corpus shift, and
  dropped `scout.searchRepos` from a pinned top five in `test/search.test.ts`. To recreate the
  removal, add one line, `["POST /api/partners/match", "matchPartners"],`, to
  `EXCLUDED_SCOUT_OPERATIONS` in `src/policy/scout-exposure.ts`, then run the normal rebuild and
  make the test and eval edits listed in the item 3.2 [EXEC.md](rounds/2026-11-16-next-phase/items/3.2/EXEC.md).
  Revisit when the upstream answers again, or when a catalog change leaves holdout headroom.
- `recoveryHint` appears on most successful executes, so agents probably ignore it. Show it only
  for empty, thin, or conflicting results.
- The Playground often stopped at `DEMO_CAPS.maxOutputTokens` (4096). Review the cap.
- Docs ranking misses canonical pages: the testnet reset section on `/docs/networks`, the Custom
  Account example, and the fee-sponsorship pages. Add routing cases first.
- Clients: Grok CLI never completed OAuth (every `/mcp` request got 401), Copilot CLI looped on
  404 (protocol 2026-07-28), and one browser looped on the consent page with "CSRF token
  mismatch". Reproduce each.

The review's evidence is in the owner's private snapshot `2026-10-26-hackmeridian`
(`usage/README.md`).

Production read (round item 3.1, 6.5 days): `scout.matchPartners` still failed on nearly every
call; the decision and its measurement are in the first bullet. Playground replies that stopped at the output cap were rare, so
the cap review can close as "no change" unless the owner sees otherwise. `recoveryHint` could not be
read: its key was not in the capped key list ("Ship the cap decisions from the production read"
has the follow-up). The client loops could not be attributed: user-agent queries returned no rows,
and `/mcp` 401 responses are a large share of requests whatever the client.

Done when: each bullet has a merged fix or a recorded "no change" decision.

Shipped (round item 3.2): the bounded `execute` `errorName` (SyntaxError, TypeError, ReferenceError,
timeout, other) on the event and span. Out of scope there: a script that throws a non-Error
(`throw "x"`) has no `err.message`, so `@cloudflare/codemode` returns no error and the run is
recorded as `ok: true`; `errorName` never sees it.

### Explain the soft-empty and skipped-write anomalies from the production read

Round item 3.1 saw two things it was not asked to measure:

- `lumenloop.get_scf_submissions` returns soft-empty on most calls, and `scout.getRepoTrust` on most
  of its (few) calls. A soft-empty is inconclusive, not absence, so a caller that stops there may
  answer wrongly. Check which arguments produce them (a round or year filter that matches nothing,
  a repository Scout does not track) and whether the hint should name a broader call.
- A large share of `artifact_write` events carry `ok = false`. The code logs a skipped write as
  `ok = false` with a `skipped` reason, and a thrown write with `errorName`; neither field was
  readable in the first read.

Next: read the `skipped` and `errorName` values in the Workers Logs follow-up named in "Ship the cap
decisions from the production read", and sample the soft-empty calls' `op` events by operation
and `caveat` (no query text is logged, so reproduce with live probes).

Done when: each anomaly has a cause, and a merged fix or a recorded "no change" decision.

### Add a release and package-version source

Raven cannot answer "what changed, with dates" or "which version is current". Scout's release
index has dated rows for stellar-cli, stellar-core, js-stellar-sdk, and rs-soroban-sdk, but not
stellar-rpc. No source gives the current npm, JSR, or crates version of common packages or the
latest OpenZeppelin stellar-contracts release. Search also ranks `scout.getChangelog` (Scout's
own API log) above `scout.searchResearch` with `source: "release"`.

The owner decides this, and a Dashboard lumens API source (decision 6(b)): an upstream Scout
request (file it in `improvements/`) or a new host adapter (an ADR-0003 exposure change). Fix the
`getChangelog` ranking trap either way.

The production read (round item 3.1) does not decide it. The Dashboard lumens API has no
telemetry proxy (`stellarOrg` is two generic operations and arguments are not logged): not
measurable. For releases the read gives an upper bound only. History questions reach
`scout.searchResearch` often, and `scout.getChangelog` ranks first in few searches, so the ranking
trap touches few callers. Query text is not logged, so silence is "no measured demand", not
absence. The evidence that can decide stays the committed one: round item 1.3's classification
(its `sdf-mandate-holdings` row shows the Dashboard API is not needed for that fact), and the
HackMeridian probes above.

Done when: probes Q5, R23, R33, and R35 of the HackMeridian review pass again, or the owner
leaves release data upstream and the finding is filed.

## Eval instruments

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

### Add a runner for Codex and Grok as QA answering clients

`eval/qa/run-qa.mjs` drives only the Claude CLI. No committed runner drives Codex or Grok as a
QA answering client; the `run-evals` skill tells agents to run them as `hc` lanes against the
loopback MCP server. Two of the three default eval clients (GPT-6.1 Terra and Grok 4.7)
therefore have no repeatable harness.

Tuning loop 2's item 4 (the first 120 characters of each description and the first line of the
instructions stand alone) is therefore unverified outside Claude Code: delivery is arithmetic against
measured limits (Codex's catalogue line, OpenCode's two listings, Grok's 2,033-character cut), not a
session, and whether any of it changes an answer on Codex, Grok or OpenCode, whether a Codex model
prints `ALL_TOOLS`, whether an OpenCode model reads past 117 characters, and whether those clients
pass `limit` (which decides what seven cards do for them) are all open. The client probe harness
the plan names calls models and needs its own authorization line.

The hand-run diagnostic comes first (round item 4.1, owner decision 7 in
[DECISIONS.md](rounds/2026-11-16-next-phase/DECISIONS.md)): 24 tuning rows per client on GPT-6.1
Terra and Grok 4.7, no judge, cap USD 8 per client subscription-equivalent. OpenCode joins only if
a subscription login works inside it; no lane uses a per-token API path. A committed runner
follows only if that diagnostic shows a defect that needs a before-and-after measurement.

Done when: round item 4.1's record reports those four behaviours per client, and either a
committed runner drives the Codex and Grok CLIs as answering clients against the local server and
writes results the judge can grade, or a recorded decision keeps the hand-run lanes.

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

Done when: a reviewed later pack closes these gaps with an authorized measurement, or the owner
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
and a headline sample each need their own authorization. Do not add another QA-prompt wording
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

## Dependencies

### Migrate the deprecated vitest pool and remove its overrides

`@cloudflare/vitest-pool-workers` 0.23.0 is deprecated in favor of `@cloudflare/vitest-plugin`
and pins `wrangler`, `miniflare`, and `zod` exactly. `package.json` `overrides` therefore keeps
three entries: the global `"miniflare": "$miniflare"` (without it, `npm audit` reports 4 high
findings and the tree gets a second `workerd`), and the pool's `"wrangler": "$wrangler"` (one
`workerd`) and `"zod": "$zod"` (2 high findings without it).

Done when: the tests run on `@cloudflare/vitest-plugin`, all three overrides are gone, and
`npm audit`, `npm test`, `npm run test:smoke`, and the single-`workerd` check pass.

### Move the demo off the deprecated `workers-ai-provider`

Cloudflare froze `workers-ai-provider`; the replacement is `createAI` from
`agents/models/ai-sdk`, which needs `agents` 0.32.0 or later. Blocked: `createAI` string catalog
models drop `providerOptions.anthropic` (adaptive `thinking` and `effort`) on the binding `/run`
path (`cs-010`, repro under `rounds/2026-11-03-demo-createai/repro/`). The owner decided on
2026-11-03 to keep current behavior and not migrate through a different transport. The binding
path also has no stream-resume opt-out (cloudflare/agents#2790).

Done when: an `agents` release forwards Anthropic provider options for `anthropic/*` catalog ids
(re-run the `cs-010` repro), a reviewed decision covers stream resume, `src/demo` and
`test/demo-model-config.test.ts` no longer import the package, and `wai-001` is closed under the
`improvements-pipeline` skill. The `agents` upgrade moves the MCP server runtime, so it needs
`npm run test:smoke`, the single-`workerd` check, and a Playground run of every demo model. The
migration is not `fixed-upstream` evidence for `wai-001`; that close-out needs a reviewed
lifecycle decision.

### Verify that xAI accepts the explicit tool `strict` field

Both Playground tools set `strict: false`, and the field reaches the OpenAI-compatible chat
transport of the Grok control model `xai/grok-4.6`. xAI acceptance is unverified.

Done when: the model gauntlet shows `xai/grok-4.6` accepts the request before the next
control-model lane, or a reviewed change omits the field for that transport.

## Deferred programs

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

## OpenAI plugin submission

### Obtain a written exception for the accepted two-tool endpoint

Package `0.1.2` was submitted on 2026-10-23; the last recorded portal state is `In review` and
`Not published`, with the reply to OpenAI still an unsent draft. Check the portal and the
correspondence before acting. The trimmed surface changes the tool descriptions the review
cases describe; re-run the rehearsal before the next submission step.
[`plugins/openai/README.md`](../plugins/openai/README.md) has the records and rules.

Before publication, resolve publisher verification and privacy coverage: `/terms` in
`src/site.ts` describes query and response logging for 30 days, while `docs/operations.md`
describes operational metadata retention of at most seven days. After the final review
decision, revoke the reviewer API key `openai-review-20261007`.

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

None open.
