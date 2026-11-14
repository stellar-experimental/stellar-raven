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

1. Ship the trimmed surface and work its known weakness on live-data questions (first item).
2. The golden-truth pass, then source coverage: the first-principles round found that sources and
   goldens limit accuracy, not the shape of the tool.
3. Event-tied golden re-verification, on its dates.

The general routing repair stays held. It needs new mechanism evidence, not another lexical
variant.

## First-principles round follow-ups

Round `fp-2026-11-12`: [ledger](rounds/2026-11-12-fp.md),
[record](../research/audits/2026-11-12-first-principles-round.md), and
[ADR-0011](../research/decisions/0011-tool-surface-stays-code-mode-trimmed.md). The tool surface
stays `search` + `execute`, trimmed for cost.

Held-out status: the 100 even-position cases are spent, and the stopped second look opened 4
odd-position cases. 96 odd-position cases and the 150 reserve cases are unopened; keep them
unseen. The ledger's
[held-out status](rounds/2026-11-12-fp.md#held-out-status-after-the-round) is authoritative. Never
copy a held-out or reserve case ID into this file.

### Find what costs the trimmed surface accuracy on live-data questions

On the held-out look, the trimmed surface scored 0.646 against 0.707 on questions whose answer
depends on live data, with 12 wrong answers against 6. Stable and scheduled facts were level or
close. Next: find which change costs it (five cards per search, the removed `search` output
schema, or the shorter instructions) from the stored transcripts before spending on a fix.

Done when: a reviewed change closes the gap on a scoped live-data run, or the owner accepts the
gap as the price of the trim.

### Run a golden-truth pass on procedural key facts

A word-pattern screen flags 77 of the 569 key facts in the tuning set: 70 prescribe how the answer
is produced or worded, and 9 name a Raven operation. An agent that uses any other tool cannot
satisfy them, so every design comparison tilts toward the current design. One suspected
source-against-golden conflict (Protocol 27 credential validity) and two noted ones (hand-edited
generated bindings, CAP-89) need a primary source. The screen is not a ruling: no golden was
edited.

Next, with the `golden-truth` skill: split each case's key facts into world facts and process
requirements, remove operation names from key facts, and resolve the conflicts. The review needs
no model spend. Re-scoring stored answers is about 366 judge votes.

Done when: the reviewed corpus change merges and the flagged count is recorded.

### Audit source coverage

291 of 569 tuning key facts have no supporting passage in anything Raven retrieved, and in a
sample of 60 of them, 55% were not found by a targeted search of Raven's sources. Nothing shows
yet which sources are missing. Do this after the golden-truth pass and the per-source status
item below.

Next: for each unsupported world fact, find where support exists (a source Raven reaches but did
not surface, a source it does not reach, or nowhere). Then test the one or two sources that
recover the most facts, with a pass condition fixed in advance: more correct answers and no more
wrong ones.

Done when: the classification is recorded and the owner decides which source, if any, to test.

### Report per-source attempts and final status

A failed call already carries its upstream status: HTTP 429 survives all three adapters, and 5xx
survives Lumenloop and Scout. Two gaps remain:

- Mintlify retry exhaustion on 5xx returns an error with no numeric status
  (`mintlifyRequest` in `src/adapters/stellar-docs.ts`).
- No result or log event records how many attempts each source took, or each source's final
  status across one `execute`.

The round also reported that a successful response hid a failed source. That came from the
round's own aggregation layer and is not reproduced in production Raven; reproduce it before
treating it as a product defect. Keep the per-operation failure envelopes as they are. This work
comes before the coverage audit.

Done when: a Mintlify retry exhaustion carries the last HTTP status, and the `execute` log event
records attempts and final status per source, with tests.

### Keep a default `execute` result under the Grok CLI clip

The Grok CLI cuts any MCP result at 20,000 bytes and keeps the head. On the held-out look the
trimmed surface sent no `search` result over that size, but 275 of 565 `execute` results from the
three decisive clients were over it. Next: confirm the clip in the Grok CLI, then put status
lines first and bound the default result (about 18 KB) with the artifact path for the rest.

Done when: a reviewed change ships, or the check shows the clip does not lose answer evidence.

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

## Golden answers

### Re-verify the event-tied goldens after SCF #46 Panel Review and the Bell vote

`npm run eval:qa:lint -- --stale --enforce-floors` fails every pull request once a `reverifyBy`
date passes. Eight cases keep dates before 2027 because each depends on a known event:

- **SCF.** The six RFP cases carry the two Q4 briefs published on 2026-11-11. Scout served no
  open brief on 2026-11-12. On or after 2026-11-19, re-read
  `https://stellarlight.xyz/api/rfps?status=open`. If it still serves no Q4 brief, file a Scout
  finding; when it catches up, drop the dated Scout-lag sentence from the six cases' notes.
  `q-scf-current-round` is due 2026-12-04.
- **Bell/P30 Mainnet vote, 2026-11-23 17:00 UTC.** `q-pc-protocol-upgrade-timing`,
  `q-protocol-version-history-list`, and `q-edge-fresh-latest-protocol-version` are due 11-24;
  `q-hist-quantum-preparedness-plan` is due 12-01. The `mainnet-protocol-29` source sentinel
  fires when Mainnet activates Protocol 30. Update the register's Bell date trap in the same
  change.

Use the `golden-truth` skill, then `npm run eval:qa:register`.
[Ledger](rounds/2026-11-12-truth-maintenance.md).

Done when: no battery case has a `reverifyBy` date before 2027-01-01.

### Golden follow-ups from the sls-024 and sls-029 cap review

From the [review](../research/audits/2026-11-12-truth-maintenance/review-caps-fable.md):

- At the next deliberate live-contract revision, reword the "state-conditional sls-024
  discriminator" label of `q-live-fluxity-status-provenance`. The grading rule holds; a notes
  edit changes the frozen `live-data-canonical-v3` digest.
- In the next golden pass, recheck the "DIA/Lightecho/Orally too" mainnet note of
  `q-eco-defi-market-map`. On 2026-11-12 Scout showed DIA's only contract as an absent testnet
  address and Lightecho's mainnet feeds as stale.

### Add golden cases for the confirmed HackMeridian gaps

Three gaps already have cases: R04 (`q-sor-decode-hosterror-codes`), R23
(`q-soroban-oz-token`), and R31 (`q-asset-stablecoin-issuers-discovery`). Two proposals, R20
(`q-infra-testnet-reset-schedule-recovery`) and Q18
(`q-sor-reflector-testnet-contract-addresses`), passed independent review with ACTIVATE but are
held: activation would lift the scheduled share above the 35% cap in `eval/qa/lint-corpus.mjs`,
and both facts expire with the 2026-12-16 Testnet reset. The owner decided on 2026-11-02 against
a dedicated paid battery for them. Records:
[proposals](rounds/2026-11-03-hackmeridian-golden-proposals.md),
[review](rounds/2026-11-03-hackmeridian-golden-proposals-review.md).

Reopen after the reset with post-reset facts, when the scheduled share has room, or by converting
other scheduled cases to behavioral wording. Raising the cap is an owner decision.

Done when: the cases pass `npm run eval:qa:lint -- --stale --enforce-floors` and merge.

### When Scout hackathon submission operations are exposed

Trigger: a reviewed exposure change makes `scout.getHackathonSubmission` or
`scout.analyzeHackathonSubmissions` callable. Both are excluded today.

- **Winner goldens.** `q-scf-kale-winner-live` and `q-gap-hackathon-winner-order` require the
  event-detail path as the only route, while the submission operation returns an explicit
  `placement`. Accept placement from either path through `golden-truth`, or record why the
  event-detail path stays the only route
  ([review](rounds/2026-10-06-scout-hackathon-goldens/review-astra.md)).
- **Proposals.** Four cases wait in `eval/qa/corpus/proposed/scf-grants-builders/`. Three are
  cleared for activation. `q-scout-hackathon-placed-share-kale-vs-zk` is blocked: its winner
  totals have no witness independent of DoraHacks
  ([ledger](rounds/2026-10-06-scout-hackathon-goldens.md)).

Done when: the dated facts are re-probed, each activated case carries
`truth.lifecycle.activation`, the fourth case has an independent source or a reviewed rewrite,
and the floors lint passes for both operations.

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

- **sls-033** stays active: nine unavailable platform facts lack a source URL
  ([result](https://github.com/Stellar-Light/stellarlight/issues/519#issuecomment-6827190900)).
  Recheck when the owner adds a source field.
- **sls-107**: require the owner-enabled issuer-of-record write (PR1923) to populate issuer,
  source, and date for the nine AUDD/Currency One records and the MGUSD control. On 2026-11-12
  all 37 rows still had null issuer fields.
- **Docs pull requests.** The [Docs table](rounds/2026-11-05-truth-maintenance/docs.md) and the
  [continuation table](rounds/2026-11-06-remaining-sweep/docs.md) name each unmerged pull
  request, its blocker, and its live trigger, including draft2752 and the generated-skill
  PR3069. Recheck the pages after deployment; green checks alone close nothing. The
  author-owned protocol PR2059 awaits review; answer substantive review without a keepalive
  rebase.
- **Software Versions (not filed).** Protocol 30 is live on Testnet, but
  https://developers.stellar.org/docs/networks/software-versions.md lists nothing above
  Protocol 29. Upstream normally adds a version around Mainnet activation. Recheck on or after
  2026-12-01; if the page still lacks Protocol 30, file it as the class of resolved sd-008
  ([ledger](rounds/2026-11-10-truth-maintenance.md)).
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
([round](rounds/2026-11-12-truth-maintenance.md)).

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
  reports it as drift and its `source.authEnv` names deleted secrets that nothing reads. Fresh
  titles alone drop `stellarDocs.search_wallet_dapp_docs` from `q-tool-wallets-kit`.
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

Done when: a reviewed mechanism passes both contracts (19 of 19 required top-five hits, zero
forbidden captures) and all routing gates.

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

### Measure "read past the snippet" guidance

In the HackMeridian review, 11 of 29 weaker answers stopped at a cut snippet, the first page, or
the first ten rows. Candidate: when a result is a cut snippet or a partial page of rows, say so
and name the call that reads the rest. Upstream codemode is the default, so a change needs a
measured win.

Done when: a measured change ships, or the measurement shows no gain and this item is deleted.

### Clarify the model-facing `codemode.describe` response shape

`codemode.describe` returns `{ ok: true, signature, inputSchema, ... }` at the top level, while
service calls use `{ ok: true, data }`. A production check recovered from reading
`spec.data.signature`
([record](../research/audits/2026-11-09-playground-product-decision.md)). Decide between
model-facing documentation and a forward-only shape change, and measure that change on its own.

Done when: one reviewed, measured correction makes the shape clear to models.

### Triage the runtime and client gaps from the HackMeridian telemetry

Each needs a check before a fix:

- `scout.matchPartners` returned the upstream "AI not configured" failure on every call. Check
  live Scout; if it still fails, remove it from the exposed surface (ADR-0003).
- `execute` failures have no error class. Add a bounded `errorName` (SyntaxError, TypeError,
  ReferenceError, timeout) to the `execute` event and span, with no message text.
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

Done when: each bullet has a merged fix or a recorded "no change" decision.

### Add a release and package-version source

Raven cannot answer "what changed, with dates" or "which version is current". Scout's release
index has dated rows for stellar-cli, stellar-core, js-stellar-sdk, and rs-soroban-sdk, but not
stellar-rpc. No source gives the current npm, JSR, or crates version of common packages or the
latest OpenZeppelin stellar-contracts release. Search also ranks `scout.getChangelog` (Scout's
own API log) above `scout.searchResearch` with `source: "release"`.

Decide between an upstream Scout request (file it in `improvements/`) and a new host adapter
(an ADR-0003 exposure change). Fix the `getChangelog` ranking trap either way.

Done when: probes Q5, R23, R33, and R35 of the HackMeridian review pass again, or the owner
leaves release data upstream and the finding is filed.

## Eval instruments

### Add a runner for Codex and Grok as QA answering clients

`eval/qa/run-qa.mjs` drives only the Claude CLI. No committed runner drives Codex or Grok as a
QA answering client; the `run-evals` skill tells agents to run them as `hc` lanes against the
loopback MCP server. Two of the three default eval clients (GPT-6.1 Terra and Grok 4.7)
therefore have no repeatable harness.

Done when: a committed runner drives the Codex and Grok CLIs as answering clients against the
local server and writes results the judge can grade, or a recorded decision keeps the hand-run
lanes.

### Close the remaining claim-support gaps of judge pack p9

The judge uses pack `p9` ([result](rounds/2026-10-12-pack-p9/result-p9.md)). Known limits:

- The November 3 model sweep reported an 85-row tag list cut to 82 rows in judge evidence, with
  false wrong verdicts on `q-ti-vocab-project-tags-live`
  ([ledger](rounds/2026-11-03-playground-model-sweep.md)). Before another model-selection round,
  recover the transcript, compare its rendered pack, and repair any confirmed truncation.
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
goldens such as `q-edge-oos-solana-vs-aptos` and `q-n3-wallet-hacked-support-redirect` require
decision support or acknowledgment. The delegated October 1 adjudication keeps both
([record](rounds/2026-10-01-backlog-closeout/owner-adjudications.md)); the owner can veto it. A
prompt change changes the implementation hash and needs a reviewed decision and measurement.

Done when: a reviewed decision changes the prompt with a measured before and after on the
out-of-scope cases, or records why the prompt stays.

### Recount `data.sections` misreads in the next authorized QA round

The section-shape text (PR #270) cut section misreads from 5 in 38 scripts to 0 in 35 on a
16-row sample: a direction, not a rate
([result](rounds/2026-10-12-call-pattern-triage/result-text-v2.md)). The sandbox guard was
indeterminate and does not ship without a new design or an owner decision.

Done when: an authorized QA round on current `main` recounts section misreads, `.data`
omissions, and failed calls with an omitted reason, and records them here.

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

- **The round's reusable harness.** The `fp/harness` branch holds a generic agent loop, a spend
  ledger, and a paired analysis, unmerged and unreviewed. Is it worth its own reviewed pull
  request? Default: leave the branch unmerged.
