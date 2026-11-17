# Item 6.3 plan: RWA re-test (issue #167)

Lead: Claude Opus 5.5, agentpc `t1w3`, 2026-11-17. Worktree `/home/tyler/code/raven-wt/np-6.3`,
branch `np/6.3-rwa-retest` from `origin/main` `cd4520bd` (6.2 merged as #474). Binding notes:
`/home/tyler/code/raven-wt/orch/6-COMMON.md` and `6.3-NOTE.md`. Owner answer (DECISIONS.md,
"Follow-up answers (2026-11-17, assumptions review)", item 1): "do it". Reviewed by Claude Fable
([REVIEW.md](REVIEW.md)); every finding is reconciled in the last section.

**Search rule (binds the lead and every child):** every repo-wide search is
`git grep ... -- ':!eval/qa' ':!eval/corpus' ':!test/fixtures/evidence-pack.mjs'`, never a bare
recursive grep. A search whose pattern can hit case sets lists file names only (`git grep -l -w`), and
never opens `eval/holdout-cases.json`, `eval/routing-qa-overlap.json` (except by id lookup in a script
that prints booleans), `eval/discovery/`, `eval/agentic/` or that fixture. Never print the stdout of
`node eval/run-routing.mjs` (it prints the holdout table): redirect it to a file under `tmp/6.3/` and
read totals with `node tmp/6.3/compare.mjs <base result> <variant result>`, which prints lane totals,
holdout counts and listed (non-holdout, non-confirmation-only) rows only. Never open a QA case, QA
results or reviewed files; never run the QA lint. Rows on `eval/routing-qa-overlap.json` are never used
in the A/B and their ids, ranks and hits are never printed.

## Decision this changes

Whether `GET /api/rwa` (`scout.getRwaAssets`) joins the exposed surface (ADR-0003), and with it
whether #167's acceptance check 8 changes from "unrelated questions never capture it in the top five"
to "the target stays rank 1 and answers do not degrade". Every record so far measured rank only; this
item adds one answer-level A/B.

## Facts re-checked on `cd4520bd` (lead; reproduced by the Fable reviewer)

INCLUDED manifest: `src/policy/scout-exposure.ts` with the `["GET /api/rwa", "getRwaAssets"]` entry
and its two comment lines removed, then `node scripts/build-catalog.mjs --out
tmp/6.3/included-manifest.json` (the policy file restored after). 285 → 286 entries; `scout.getRwaAssets`
is the only added entry. 23 other Scout entries change because the scrub no longer removes
`getRwaAssets` from their schema text: 20 change `keywords`, 12 `outputSchema` (9 both). An in-place
build also changes `specs/super-spec.json` (65 → 66 paths, Scout 29 → 30 operations, compact size
208,786 → 211,724 bytes) and `eval/plan/op-classes.json` (the new id); `family-text:build` changes
nothing.

Routing (`run-routing.mjs --gate`, base on `catalog/manifest.json`, variant with `--manifest`):

| Lane | EXCLUDED (main) | INCLUDED |
|---|---|---|
| Legacy top1 / top3 / top5 / card@5 | 219 / 293 / 326 / 113 | 219 / 291 / 325 / 111 |
| Extended top1 / top3 / top5 / card@5 | 93 / 112 / 117 / 16 | unchanged |
| Skills top1 | 17 | 17 |
| Protocol history | unchanged | unchanged |
| Holdout (counts): top1 / top3 / top5 / card@5 | 12 / 26 / 30 / 30 | unchanged |
| Holdout forbidden captures / passed | 11 / 24 | 10 / 25 |

- The variant's only gate failure is the expected manifest-fingerprint mismatch: legacy stays inside
  its ±3 band, holdout floors hold, captures fall below the ceiling 11. The note's step 2 condition
  ("the routing gates hold") is met.
- Three legacy rows go hit to miss, none confirmation-only, each an RWA question on which
  `scout.getRwaAssets` enters and pushes the labelled Lumenloop card down one rank. At the public
  `search` page of 7: `q-defi-rwa-overview` card 3 → 4; `q-defi-rwa-scf-similar` card 4 → 5;
  `q-eco-2025-defi-launches` card 6 → 7 (on the page edge).
- Top-five list changes: legacy 16, extended 3, skills 1, protocol history 0. `getRwaAssets` is in
  the top five of 11 listed legacy rows, 2 listed extended rows, 1 skills row and 2 holdout rows
  (count only).
- Of #167's three controls, two are free text (C1, C2 below) and match no QA headline question
  (boolean check with the overlap generator's matcher). The third is a confirmation-only row and is
  not used or ranked here. On C1 and C2 the correct Docs operation stays rank 1 on both arms, RWA is
  rank 3 and 2, and one card leaves the page of 7.
- Without RWA, "Which tokenized real-world assets are live on Stellar?" has no Scout data operation in
  its first two ranks; with RWA it is rank 1.
- `GET https://stellarlight.xyz/api/rwa` is keyless and returns 200: registry 113 rows (97
  rwa.xyz-listed, 16 issuer-declared), 52 issuers, `registryAsOf` 2026-11-12, at most 100 rows per
  call, no paging parameter. The Scout adapter calls it with no change (`callScout` is generic over
  `entry.transport`, `src/adapters/scout.ts:89-130`; the manifest is the allowlist).
- The search card keeps the first 220 characters of the description, which cut before the stablecoin
  inclusion and "absence means untracked" (`src/mcp/tools.ts:203-214`). The envelope `asOf` reads only
  `dataAsOf`/`asOf` paths (`src/executor/providers.ts:295-300`), so RWA results carry
  `asOfBasis: "observed"` (call time), not `meta.registryAsOf`.

## Steps

Commits use the normal hooks, never `--no-verify`, and end with
`Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Scratch goes to ignored `tmp/6.3/`.

### 1. Pre-registration commit (before any answer)

One commit holding PLAN.md, REVIEW.md, `briefs/`, `questions.json`, `ab-run.mjs` and `blind.mjs`.
EXEC.md records its SHA as proof that the questions, rubric, scoring and rule predate every answer.
The tree of this commit is the EXCLUDED arm (only `.agents/` differs from `main`).

- `ab-run.mjs`: a copy of `items/6.2/ab-run.mjs` with these changes only:
  - `--arm excluded|included`;
  - cost cap USD 10 per arm (null cost counted at USD 4, per-run budget USD 4), checked **before
    every attempt**, retries included (the 6.2 "Limits" fix);
  - the reference-path matcher generalized to full URLs on any host;
  - per run, `rwaCalled` (`/\bscout\.getRwaAssets\s*\(/` over the `execute` code) and `rwaMentioned`
    (any mention) recorded separately; the rule uses `rwaCalled`.
  Everything else (the QA runner's `runAgent`, prompt, isolation flags, 24-turn cap, one transport
  retry, two-consecutive-unanswered stop, the `QA_AGENT_PROMPT_APPEND` deletion, `mkdtempSync` agent
  cwd) is unchanged.
- `blind.mjs`: a copy of `items/6.2/blind.mjs` reduced to one client (`claude-sonnet-5-5`) and one
  judge (Claude Opus 5.5), with the rubric and scoring below.
  - A packet entry carries the opaque pair id, the question, the reference URLs and, for X and Y, the
    answer text and the deduplicated result URLs **minus every URL containing
    `stellarlight.xyz/api/rwa`** (both arms). No tool-call list, and no arm, question key or class,
    file name, timestamp, cost, token count or model name.
  - X and Y by a balanced random split (5 pairs each way, `crypto.randomInt` shuffle), stored only in
    `tmp/6.3/blind-key.json`; pairs shuffled under opaque ids.
  - `--score` prints the rule outcome (include, exclude, inconclusive) mechanically. The lead does not
    override it.
  - `--selftest` on synthetic answers checks the scoring of every rule clause and that no packet
    contains `excluded`, `included`, `arm`, `getRwaAssets` outside answer text, or `api/rwa` in
    `resultUrls`. It and `node --check` on both scripts pass before the commit.
- `questions.json`: the ten questions below in table order, each with an opaque key, the exact text
  and the reference URLs (final URLs after redirects). Routing-row texts are copied by id from
  `eval/routing-cases.json`. The executor re-checks each URL once and records in EXEC.md its status and
  the required string from the table; a failing URL goes back to the lead before the commit.

### 2. EXCLUDED arm (tree = the pre-registration commit)

- One `npm run dev:eval -- --port <free port>` as an `hc` child of the executor. Readiness: the
  `initialize` POST from the `run-evals` skill returns 200.
- Identity, at arm start and end: `serverInfo.sourceRevision` equals the arm commit;
  `git show <rev>:catalog/manifest.json | sha256sum` recorded; `git status --porcelain` empty. Probe:
  one MCP `search` for "Which tokenized real-world assets are live on Stellar?"; record the top seven
  (must not list `scout.getRwaAssets`).
- One harness process: `node ab-run.mjs --arm excluded --model claude-sonnet-5-5 --port <p> --out
  tmp/6.3/answers-excluded.jsonl`. Stop the server after the end checks.

### 3. INCLUDED arm commit (I) and run

Commit I is the surface that would ship, decided before any answer:

- `src/policy/scout-exposure.ts`: delete the RWA entry and its two comment lines.
- `scripts/catalog-data/card-caveats.mjs`: add
  `"scout.getRwaAssets": "Includes fiat stablecoins (productKind=stablecoin). rwaxyzValueUsd is rwa.xyz's valuation; state counts holders, not product status."`
  (132 characters; the envelope already covers absence, so the file's rule leaves that out). The text
  never feeds scoring.
- `eval/plan/build-op-classes.mjs` `OP_OVERRIDES`: `"scout.getRwaAssets": "broad"` (a collection,
  like its sibling `scout.getStablecoins`).
- No `retrievalProfile` (the `directory` lane takes part in admission and would move routing; 22 other
  operations have none).
- Regenerate in place: `node scripts/build-catalog.mjs`, `npm run spec:build`,
  `npm run family-text:build`, `node eval/plan/build-op-classes.mjs`. Expected diffs, and nothing else
  (stop and report on any other): `catalog/manifest.json` (equal to `tmp/6.3/included-manifest.json`
  apart from `generatedAt` and the new entry's `cardCaveat`), `specs/super-spec.json` (+1 path, Scout
  30), `eval/plan/op-classes.json` (+1 id, `broad`).
- Re-run the routing comparison once on the committed manifest against main: every number must equal
  the table above (the caveat feeds no score). Stop and report on any difference.
- Commit the four source and three generated files. Tests are not run at this commit (the guard tests
  that name `getRwaAssets` fail until step 6a).
- Restart `dev:eval` on commit I; the same identity checks; the probe must list `scout.getRwaAssets`
  rank 1; one `execute` calling `scout.getRwaAssets` with `{ limit: 3 }` at start and end, recording ok
  or the error kind and `asOfBasis`. At start, read the served `stellar-light` skill through the server
  and save its RWA reference section to `tmp/6.3/stellar-light-rwa-section.md` (for the Codex review).
- Run the harness with `--arm included` to `tmp/6.3/answers-included.jsonl`. Stop the server. Record
  both arms' windows and whether they straddle 00:00 UTC.

### 4. Blind grading

- `blind.mjs --pack` into a fresh `mktemp -d` directory under `/tmp` holding only `packet.json` and
  `RUBRIC.md`. Judge: Claude Opus 5.5 (`--model opus`, effort high, `--max-budget-usd 15`), an `hc` child
  of the executor, `--cwd` that directory. It did not answer in this comparison (Sonnet did). It may
  fetch any URL and writes `verdicts.json` there.
- Rubric, per answer:
  - `correctness`: `correct` (every material claim agrees with the reference pages or other live
    primary sources the judge fetches, and the question is answered), `partial` (right but missing a
    material part, or one minor error), `wrong` (a material claim contradicts those sources, or the
    question is not answered).
  - `fabrication`: `true` when the answer states a specific identifier, asset code, issuer, number,
    API name or URL that none of these supports: the reference pages, the pages it cites, its listed
    result URLs, or the registry `https://stellarlight.xyz/api/rwa` (a source for every pair). The judge
    fetches before marking it.
  - `offTopic`: `true` when the answer spends material content on assets, issuers, products or
    registries the question did not ask about, or rests a main claim on such data.
  - One line of reason per pair.
  - Source notes in the rubric: the registry is curated (absence means untracked, not "not on
    Stellar"), returns at most 100 of its 113 rows per call and takes `state`, `kind` and `level`
    filters; rwa.xyz values are rwa.xyz's own valuations; fetch `app.rwa.xyz` with `curl` (its data sits
    in `__NEXT_DATA__`).

### 5. Scoring and the rule (the executor stops here)

`blind.mjs --score` un-blinds and computes. An answer is **bad** when `correctness` is `wrong` or
`fabrication` is true. INCLUDED **loses** a pair when its answer is bad and EXCLUDED's is not, and
**wins** in the reverse case. INCLUDED also loses a C or N pair on an **attributable drop**: INCLUDED
`partial`, EXCLUDED `correct`, and the INCLUDED run has `rwaCalled`. An INCLUDED answer **calls RWA
wrongly** when its run has `rwaCalled` and the judge marked it `offTopic`. A pair is **missing** when
either run is unanswered.

**Decision rule (pre-registered; adjusted on the Fable review before any answer, never after).
Include RWA only if all hold:**

1. **Controls C1 to C3 and neutrals N1 to N3:** no INCLUDED loss, and no INCLUDED answer calls RWA
   wrongly.
2. **Displacement questions D2 and D3** (lost routing rows whose primary source is Lumenloop): no
   INCLUDED loss.
3. **Registry questions D1 and D4:** INCLUDED losses minus wins ≤ 0.

**Inconclusive** when any C, N, D2 or D3 pair is missing, or both D1 and D4 are missing. Correct
against partial without an RWA call is reported, not counted.

Reported, not counted: per run `rwaCalled`, `rwaMentioned`, operations called, turns, cost; per C and N
pair where INCLUDED called RWA, the turn and cost difference; the judge's reasons; `offTopic` on
EXCLUDED answers. RESULTS.md says that on D1 to D4 the registry is both the treatment and a reference.

The executor writes `items/6.3/RESULTS.md` (per arm: answered runs, failures, calls, turns, tokens,
cost; the per-pair table with key, class, both grades, `offTopic`, `rwaCalled`, the reason; probes and
identity checks; the rule outcome), then stops and reports to the lead. The lead resumes it on 6a or
6b.

### 6a. If the rule says include

Exposure change (ADR-0003). Commit I stays. Further commits:

- **Policy record** `research/decisions/0012-rwa-registry-exposed.md` (ADR form, as 0009 to 0011): the
  rule outcome and evidence (PLAN, RESULTS, routing comparison); the changed check 8; residual risk (a
  card slot on mixed implementation questions); the source check below; that RWA results carry
  `asOfBasis: "observed"` while the registry dates itself by `meta.registryAsOf` and per-row
  `verifiedAt`; the 100-row cap with no paging; no `retrievalProfile`; that `src/policy/scout-exposure.ts`
  is the drift and exposure config (`assertScoutExclusionsResolve` reads it), so the deleted line is
  the config change.
- **Source check** (the card, not a growth rate): owner (Stellar Light curates the registry;
  `rwaxyzValueUsd` is rwa.xyz's valuation); period (`meta.registryAsOf`, per-row `verifiedAt`, the
  six-hour `measured` lane); denominator (rwa.xyz's Stellar listing plus every asset a tracked issuer's
  stellar.toml declares, `counts.rwaxyzListed` / `counts.issuerDeclared`); components (rwa.xyz asset
  classes, fiat stablecoins as `productKind=stablecoin`). The TODO "Resolve held source ownership" RWA
  bullet gains one sentence: the registry serves no growth rate, so the correction stays held.
- **Tests:** take the `npm test` failure list on the INCLUDED tree as the worklist (the reviewer saw 22
  failures in 9 files, including `test/catalog.test.ts`, `test/super-spec.test.ts`,
  `test/plain-operation-harness.test.mjs`, `test/search.test.ts`, `test/emitted-text-guard.test.ts`,
  `test/catalog-guards.test.mjs`, `test/description-notes.test.mjs` and
  `test/run-routing-manifest-evidence.test.mjs`). Counts and lists move to the new surface; guard tests
  that use `getRwaAssets` as the example non-exposed name switch to `getQualityReport` or `verifyClaim`.
  `test/drift-141-routing.test.ts`: the fixture catalog goes (use `catalog`); "keeps RWA excluded" is
  deleted; the three `it.fails` controls become one passing test that the correct Docs operation is
  rank 1 on each (C1 `stellarDocs.search_rpc_horizon_data_docs`, C2 `stellarDocs.search_asset_token_docs`,
  the third control's operation confirmed by a boolean assertion only, never printed) with a comment
  naming this A/B; "separates RWA discovery" keeps its controls on the real catalog.
  `test/fixtures/rwa-routing.ts` and its `test/README.md:53` line go if nothing else imports it.
- **Gates** `eval/gates.json` re-baselined under the `run-evals` rule: legacy top3 293 → 291, top5
  326 → 325, card@5 113 → 111 (`acceptedTotals.legacy` and the band block); holdout accepted captures
  11 → 10, passed 24 → 25, ceiling `maxForbiddenCaptures` 11 → 10; manifest SHA-256, `baselinedAt`,
  `localTrace` from the `--gate` run. `holdoutNote`: the ceiling is 10 with RWA exposed and
  `matchPartners` removed; re-exposing `matchPartners` tightens it to the measured count (expected 9).
  A new note at the head of `evidence.notes`: the owner's answer; that this departs from the
  zero-regression standard on that answer and the A/B; the three legacy rows by id with their
  page-of-7 moves; holdout by count; list-change counts; the A/B outcome; the "Independent review:"
  line; then "Prior note:" and the current text. `npm run eval:routing -- --gate` exits 0 (stdout to a
  file).
- **Text:** the `scout-exposure.ts` comment; `.agents/TODO.md` routing-repair item ("Held by this
  item": the RWA bullet and the `it.fails` bullet go; check 8 becomes "A general RWA query reaches
  `scout.getRwaAssets` in the top three; on #167's mixed-intent controls the correct Docs operation
  stays rank 1 and answers do not degrade (round item 6.3 A/B)"); the 5.1 `matchPartners` re-exposure
  step 4 matches the new `holdoutNote`; `ecosystem-skills/PIN-REVIEW.md` gains a dated line that the
  served `stellar-light` skill now keeps its RWA reference section; other text that says RWA is
  excluded, found with
  `git grep -l -w -i -e rwa -e getRwaAssets -e "api/rwa" -- ':!eval/qa' ':!eval/corpus' ':!research' ':!.agents/rounds' ':!test/fixtures/evidence-pack.mjs'`
  and opened only for files outside the case sets named in the search rule.
- **#167:** `Refs #167` by default. An include replaces #167's acceptance (no general intent mechanism
  ships; the controls still show the registry in the top three) rather than meeting it, so "Closes
  #167" only if the orchestrator confirms closing by supersession; the closing text then says what was
  not built and that the mixed-intent captures stay with the TODO routing repair and #223. The lead
  stops status-checking cloudflare/agents#2296 on #167 (Raven vendors its scorer); the TODO watch
  stays.

### 6b. If the rule says exclude, or inconclusive

- `git revert` commit I, so the evidence stays in history.
- Exclude: the TODO RWA bullet and check 8 cite the A/B (RESULTS.md link, the failing clause) and say
  the A/B is not re-run on routine drift; check 8 keeps its rank wording; the `it.fails` controls stay.
- Inconclusive: the TODO bullet and the #167 comment say "inconclusive", name the missing pairs, and
  leave a re-run to the orchestrator.
- The lead posts one status comment on #167 with the result (Raven's own repo). Nothing upstream.

### 7. Records, own commit

`items/6.3/EXEC.md` (what was done, a short summary of each gate's output, deviations), `RESULTS.md`,
and the un-blinded `verdicts.json` (answers and transcripts stay in ignored `tmp/`). The lead adds the
ledger row.

## Questions (pre-registered)

Page-of-7 ranks are from the INCLUDED manifest; "leaves" is the card that falls off the page.

| Key | Class | Question | References (required string) |
|---|---|---|---|
| C1 | #167 control; Docs rank 1 both arms, RWA 3 | Simulate a transfer of a tokenized bond through Stellar RPC. | developers.stellar.org `/docs/data/apis/rpc/api-reference/methods/simulateTransaction` ("simulateTransaction"), `/docs/learn/fundamentals/contract-development/contract-interactions/transaction-simulation` ("simulat"), `/docs/tokens/stellar-asset-contract` ("transfer") |
| C2 | #167 control; Docs rank 1 both arms, RWA 2 | How do I read a wallet balance for tokenized treasury assets? | `/docs/data/apis/horizon/api-reference/resources/accounts` ("balances"), `/docs/data/apis/rpc/api-reference/methods/getLedgerEntries` ("getLedgerEntries"), `/docs/tokens/stellar-asset-contract` ("balance") |
| C3 | mixed-intent control `q-crp-tokenize-personal-rwa` (extended); RWA 1 | (routing row text) | `/docs/tokens/control-asset-access` ("authoriz"), `https://stellar.org/solutions/real-world-assets` ("real-world"), `https://stellarlight.xyz/api/rwa` ("registryAsOf") |
| D1 | registry, lost row `q-defi-rwa-overview`; RWA 1 | (routing row text) | `https://app.rwa.xyz/networks/stellar` ("Stellar"), `https://stellarlight.xyz/api/rwa` ("registryAsOf"), `https://stellar.org/solutions/real-world-assets` ("BENJI") |
| D2 | displacement, lost row `q-defi-rwa-scf-similar`; RWA 1 | (routing row text) | `https://communityfund.stellar.org/projects` ("tokeniz"), `https://stellarlight.xyz/api/rwa` ("registryAsOf") |
| D3 | displacement, lost row `q-eco-2025-defi-launches`; RWA 3 | (routing row text) | `https://stellar.org/blog/foundation-news/2025-year-in-review` ("End of Year 2025"), `https://stellar.org/solutions/real-world-assets` ("real-world"), `https://stellarlight.xyz/api/rwa` ("registryAsOf") |
| D4 | registry `q-hist-franklin-templeton-benji`; RWA 1 | (routing row text) | `https://stellar.org/case-studies/franklin-templeton` ("Franklin Templeton"), `https://stellar.org/solutions/real-world-assets` ("BENJI"), `https://stellarlight.xyz/api/rwa` ("BENJI") |
| N1 | off-target `q-scf-academic-research-grant`; RWA 2 | (routing row text) | `https://stellar.org/grants-and-funding` ("research"), `https://communityfund.stellar.org/projects` ("Stellar") |
| N2 | off-target `q-sep-8-regulated-assets`; RWA 4 | (routing row text) | `https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0008.md` ("approval_server"), `/docs/learn/fundamentals/stellar-ecosystem-proposals` ("SEP") |
| N3 | off-target `q-ti-historical-pointintime-balances` (extended); RWA 4 | (routing row text) | `/docs/data/analytics/hubble` ("Hubble"), `/docs/data/analytics/hubble/data-catalog` ("catalog") |

Selection rules: C1 and C2 are #167's free-text controls verbatim; #167's third control is a
confirmation-only row (6-COMMON: never in an A/B), so C3 is the listed, non-holdout extended row of the
same class (a how-to with RWA vocabulary) with the strongest capture. D1 to D3 are the three legacy rows
that go hit to miss, so the A/B measures each routing loss at the answer level; D4 is an issuer question
the registry answers. N1 to N3 are the three listed, non-RWA routing rows where RWA ranks highest on the
page of 7 (off target is the harm the exclusion guards against; an untouched question has the same page
on both arms). None of the routing rows is on `eval/routing-qa-overlap.json` (checked by id); C1 and C2
match no QA headline question (boolean check, the generator's matcher).

## Caps, time and stop rule

- 20 answered runs at most (10 × 2, Sonnet 5.5 only), one transport retry per run, one resume per arm;
  one judge session over 10 pairs. No re-judge, no second sample, no extra arm.
- Per run `--max-budget-usd 4`; per arm USD 10 (null cost at USD 4), checked before every attempt;
  judge USD 15; item total USD 40 subscription-equivalent. Estimate about USD 2 for answers (Sonnet
  took USD 0.93 to 0.96 per 10-question arm in 6.2) plus the judge; 45 to 75 minutes wall time.
- Subscription CLIs only, as `hc` children, against the single local `dev:eval`. No AI Gateway,
  Workers AI or provider API.
- Stop rule: collection ends when every run is answered or stopped under these rules; the rule is
  computed once by `blind.mjs --score`; a stop is handled by the inconclusive clause.

## Gates

On the final tree, each run bare: `npm run typecheck`, `npm test`, `npm run build`,
`npm run eval:routing -- --gate` (stdout to a file), `npm run eval:selftest`,
`npm run secrets:scan -- --tree`. On 6a also `npm run test:smoke` (the sandbox gains a binding and a
larger spec) and `node scripts/check-pin-review.mjs --base origin/main`. No QA lint.

## Required reviews after execution

- 6a only: Codex frontier (`gpt-6-astra`, high), the note's security and exposure review. It reads the
  diff, the policy record and `tmp/6.3/stellar-light-rwa-section.md`; checks the operation is GET,
  keyless and side-effect-free, that the adapter validates arguments against the input schema, and that a
  117 KB response is truncated or artifact-handled; re-runs `run-routing.mjs` on both manifests (counts
  only, stdout to a file) and checks every number in the gates note; checks `ab-run.mjs` and `blind.mjs`
  for a blinding or scoring defect. It writes `tmp/6.3/CODEX-REVIEW.md`; the lead copies it in. The
  executor reconciles every finding. Tier reason: exposure and re-baseline reviews in this round used
  Codex frontier (0.2, 5.1, 6.2); Sonnet authors, Opus leads and judges, Fable reviewed the plan.
- 6b: no further review (no exposure change; evidence only).

## Risks

- One sample per pair and one client: the A/B detects a large effect only. The bad-answer outcome and
  the attributable-drop clause keep a lone correct-against-partial flip from deciding (6.2 Sonnet: 5 of
  10 such flips on equivalent arms, 0 bad flips).
- Live content can change between the sequential arms; the RWA probe brackets the INCLUDED arm.
- Answer text can still show registry rows; the judge is not told what is compared.
- If the Codex review requires a model-facing change, the measured arm no longer matches; the executor
  stops and the lead reports instead of shipping.

## Needs from the orchestrator

- Deploy from the Mac if RWA is included (the manifest gains an operation and model-facing schema
  text; routing measured by the gate, answers by this A/B).
- Confirm or refuse closing #167 by supersession if RWA is included.
- Nothing on the Mac if excluded.

## Reconciliation of the Fable review

| # | Severity | Disposition |
|---|---|---|
| 1 | blocking | Adopted without a stop: 6-COMMON's "never pick one for an answer A/B" binds over the note's list, so #167's third control leaves the A/B and its rank is no longer printed here; C3 is `q-crp-tokenize-personal-rwa`. The boolean QA check on C1 and C2 ran (both false) with the overlap generator's matcher, printing nothing else. The 6a test keeps the third control's text (already in the test) as a boolean rank assertion; the report asks the orchestrator whether that is acceptable. |
| 2 | blocking | Adopted: bad-answer outcome, attributable drop, mechanical outcome from `--score`. |
| 3 | blocking | Adopted: file-names-only search, the fixture exclusion in the search rule and every brief. |
| 4 | should-fix | Adopted: `rwaCalled` by call regex, registry as a source for every pair with its limits, turn and cost difference reported. |
| 5 | should-fix | Adopted: D2 and D3 as displacement pairs (no loss), D1 and D4 losses minus wins ≤ 0, inconclusive on D2 or D3 missing. |
| 6 | should-fix | Adopted: neutrals chosen by rule (highest page-of-7 RWA rank among listed non-RWA rows); every rank at limit 7. |
| 7 | should-fix | Adopted: readable URLs with a required string each; D2 projects page, D3 year-in-review, D4 case study; final URLs; rwa.xyz by `curl`; treatment-as-reference stated. |
| 8 | should-fix | Adopted: registry URLs dropped from packets, balanced split, selftest leak checks, judge budget, per-attempt budget check. |
| 9 | should-fix | Adopted: card caveat and `broad` op class in commit I, no retrieval profile, expected generated diffs, routing re-check, served skill section saved, facts corrected, policy record states `asOf` and the cap. The caveat omits "absence means untracked" because `card-caveats.mjs` says the envelope covers it. |
| 10 | should-fix | Adopted: `npm test` failure list as the worklist, `holdoutNote` and TODO ceiling wording, zero-regression departure and page-of-7 ranks in the note, `eval:selftest`, `check-pin-review`, `test:smoke` on 6a, drift config named in the policy record. |
| 11 | should-fix | Adopted: `Refs #167` unless the orchestrator confirms supersession. |
| 12 | should-fix | Adopted: inconclusive has its own text. |
| 13 | nits | Adopted: midnight straddle recorded; Codex checks argument validation and truncation. |
