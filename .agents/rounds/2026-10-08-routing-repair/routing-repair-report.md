# Routing repair report — 2026-10-08

Author: Codex frontier `gpt-6-astra`, high. Retained here: this report and the cited small files. The full
54 MB evidence set (every per-policy result, moved-row table, and script) is in the owner's local archive
`eval/results/2026-10-08-routing-repair-evidence.tar.gz` (gitignored); links to it are written as paths.

No tested general repair meets the acceptance checks.
I restored the scorer, inventories, and generated files.
The tracked tree remains clean at `f2197caec9d80c36487df3c4dcf0aeccda7f24fb` on `routing/structured-intent-repair`.
I made no commit, as the brief forbids a partial scoring commit.
I did not push, open a pull request, deploy, or run a paid evaluation.

The work remains incomplete as a repair.
The findings below support continued deferral, not a new baseline.
The two requested commits depend on a passing repair, so neither commit exists.

## Scope and evidence

The baseline contains Scout 1.9.61 and 666 Docs titles.
The live refresh returned Scout 1.9.72, 41 upstream operations, and 674 Docs titles.
The trial manifest exposes 33 Scout operations, including all three new operations.
This trial tests their routing behavior. It does not approve their exposure.
The final manifest restores 30 Scout operations.

The full refresh used the existing main checkout's `.env` through Node's `--env-file` option.
No credential value appears in the report or experiment files.
Lumenloop and the Docs settings snapshot remained unchanged.
No skill pin changed. The optional `038d6bf2` pin is outside this comparison.

The routing comparison includes all 544 rows:
338 legacy, 122 extended, 23 skills, 49 holdout, and 12 protocol-history rows.
Each lane keeps its own denominator.
Exact-card denominators are 182 legacy, 28 extended, 23 skills, and 49 holdout cases.
No case, label, threshold, accepted total, or gate fingerprint changed.

Baseline: main-routing.json (local archive `routing-repair/main-routing.json`).
Fresh sources: fresh-routing.json (local archive `routing-repair/fresh-routing.json`).
Restored result: restored-routing.json (local archive `routing-repair/restored-routing.json`).
The restored result has zero graded changes and zero top-five order changes across all 544 rows.

## The wallets-kit mechanism

The new title is `Choose a fee sponsorship approach`.
Its path is `/docs/build/guides/transactions/fee-sponsorship`.
The title adds `sponsorship` and `approach` to `stellarDocs.search_soroban_contract_docs`.

`tokenize` splits `dApp` into `d` and `app`.
The vendor scorer accepts `approach` as a prefix match for `app`.
`scoreWithKeywords` appends the entire keyword array to the description.
This enables the unrelated prefix match after other keywords establish initial evidence.

The full query has 21 tokens.
Adding `approach` raises augmented coverage from 12/21 to 13/21.
Coverage crosses the 60% gate, from 57.1% to 61.9%.
The full augmented vendor score becomes 445.
The schema blend rescues the operation at `round(445 × 0.4) = 178`.
Adding `sponsorship` alone changes neither admission nor score.

The fifth gated result fills the page.
The selected services then contain three Scout rows and two Docs rows.
The quota for five results is two per service.
`fullPageUngatedAdmission` rejects the wallet candidate because Docs already has two rows.
The unchanged wallet candidate scores 565, but its backfill score never competes.
It disappears despite having more than three times the new gated result's score.

Source locations:
[`scoreWithKeywords`](../../../src/catalog/scoring.ts:188),
[`fullPageUngatedAdmission`](../../../src/catalog/search.ts:1028), and
[`preserveStrongBackfill`](../../../src/catalog/search.ts:985).

The [wallet trace](wallet-trace.json) isolates both additions and records tokens, coverage, scores, and tiers.
Restoring only the contract Docs keywords restores the complete main result order.
This is a general keyword-boundary and page-admission defect.
It is not evidence that the fee-sponsorship page belongs to wallet Docs.

## Other mechanism findings

The current phrase extractor already preserves field boundaries.
It allocates its 256-token budget across fields and alternates each field's first and last phrases.
The existing tests preserve `yieldblox` and `reflector` under a synthetic cap.
No first-token truncation remains in this extractor.
The cap still applies: fresh `searchResearch` retains 27 phrases and 256 tokens from 89 phrases and 421 tokens.
It drops 61 keyword phrases and one useWhen phrase. Main and fresh sources have the same cap result.
That operation therefore has different retained phrase evidence and flat scoring vocabulary.

The scoring path still flattens `routingKeywords` into description text.
One coherent phrase can admit an operation, after which unrelated routing tokens contribute scores and coverage.
The negative-intent comparison also treats example phrases as positive intent.
An example can therefore override a negative clause using incidental topic words.

The identity fallback accepts any non-generic component of an operation name.
`submission` can admit `reviewSubmission` for transaction submission or SCF submission questions.
Requiring all identity components removes the sequence-number capture.
It does not remove captures admitted through positive phrases.

Schema keywords still combine property names and title vocabulary.
Removing their admission role fixes some false gates but loses valid title and schema routes.
The tested repair cannot distinguish those evidence sources reliably.

The existing standalone `has`/`phase` test passes, but it does not cover combined keyword evidence.
For `has widgets`, adding `phase` beside an independently matched `widgets` keyword raises the score from 141 to 143.
The standalone admission guard passes, but the combined keyword projection fails.
The final structural candidate retains this defect because an already-gated entry keeps its original numeric score.
The separate 19/19 probe passes because its base score is null and the new gate check runs.
That probe does not cover an already-gated entry.
See [schema-substring-probe.json](schema-substring-probe.json).
Generic properties `status`, `phase`, and `value` also admit a synthetic operation at score 46.
These tests show that successful narrow fixtures do not establish complete field isolation.

## Tested policies

Each policy applies to all operations. None contains an operation ID or a question-specific exception.
The experiments reuse existing numerical constants.
I did not adjust thresholds after reading holdout failures.
The frozen holdout files remain byte-identical.

| Policy | General change |
|---|---|
| `keyword-boundaries` | Append only keyword tokens with bounded whole-token matches. |
| `schema-rank-only` | Prevent schema keywords from rescuing a failed base gate. Keep their ungated ranking contribution. |
| `example-admission` | Exclude examples from positive admission and negative-clause comparisons. Preserve other example consumers. |
| `cross-service` | Permit strong backfill replacement when the victim's service has another result, even below its quota. |
| `structured-combined` | Combine the preceding four policies. |
| `admission-only` | Exclude examples only from standalone positive admission. Preserve negative comparisons and example corroboration. |
| `identity-coherence` | Require all non-generic operation-name tokens for the identity fallback. |
| `gate-only-keywords` | Check failed gates with matched keyword tokens. Preserve successful numeric scores. |
| `structured-scoring` | Score routing tokens only from coherent source phrases. Also bound schema keyword matches. |
| `structural` | Combine gate-only keywords, admission-only examples, identity coherence, and broader backfill replacement. |

The first harness tried to add coherent scoring after replacing the same expression for keyword boundaries.
That replacement had no effect.
The `structured-combined` record now names the four policies that actually ran.
The second matrix separately tests coherent scoring as `structured-scoring`.
This report does not attribute the first combined result to coherent scoring.

Reproduction scripts:
apply-policy.mjs (local archive `routing-repair/apply-policy.mjs`),
run-experiments.mjs (local archive `routing-repair/run-experiments.mjs`), and
run-second.mjs (local archive `routing-repair/run-second.mjs`).
The scripts temporarily replace the scorer and manifest. Run them only in a disposable checkout.
The saved candidate sources are in the local archive under `routing-repair/`.

## Measured results

`L` means legacy top1/top3/top5/cardHit5.
`E` means extended top1/top3/top5/cardHit5.
`H` means holdout top1/top3/top5/forbidden captures.
Each experiment's movement counts compare the same source snapshot with the unchanged scorer.
Grade-flag counts cover 532 primary rows. Order counts cover all 544 rows.
Protocol-history stores target ranks instead of grade flags; its derived diagnostic flips appear separately below.
Fresh-source main-relative losses also appear in [comparison-summary.json](comparison-summary.json).

| Policy / source | L | E | H | Graded / order changes | Loss / gain rows | Gate exit |
|---|---|---|---|---|---|---:|
| `fresh-routing` | 220/295/324/110 | 92/112/117/16 | 12/26/29/10 | 8 / 84 | 6 / 2 | 1 |
| `keyword-boundaries-main` | 215/298/325/105 | 89/107/113/13 | 11/26/30/10 | 28 / 128 | 21 / 7 | 1 |
| `keyword-boundaries-fresh` | 216/295/323/104 | 89/108/113/13 | 11/26/30/10 | 28 / 133 | 20 / 8 | 1 |
| `schema-rank-only-main` | 220/298/326/111 | 93/111/117/16 | 12/25/29/10 | 3 / 41 | 2 / 1 | 1 |
| `schema-rank-only-fresh` | 221/295/324/111 | 92/112/117/16 | 12/25/29/10 | 4 / 45 | 2 / 2 | 1 |
| `example-admission-main` | 218/297/327/107 | 93/111/117/16 | 12/26/29/11 | 11 / 37 | 10 / 1 | 1 |
| `example-admission-fresh` | 218/296/327/107 | 92/112/117/16 | 12/26/29/11 | 14 / 62 | 9 / 5 | 1 |
| `cross-service-main` | 219/297/326/112 | 93/111/117/16 | 12/26/29/10 | 1 / 22 | 1 / 0 | 0 |
| `cross-service-fresh` | 220/294/324/110 | 92/112/117/16 | 12/26/29/10 | 1 / 22 | 1 / 0 | 1 |
| `structured-combined-main` | 215/297/326/102 | 89/107/113/13 | 11/25/30/11 | 40 / 174 | 31 / 10 | 1 |
| `structured-combined-fresh` | 216/296/326/103 | 89/108/113/13 | 11/25/30/11 | 42 / 193 | 28 / 15 | 1 |
| `admission-only-main` | 219/298/327/107 | 93/111/117/16 | 12/26/29/11 | 10 / 36 | 9 / 1 | 1 |
| `admission-only-fresh` | 219/297/327/107 | 92/112/117/16 | 12/26/29/11 | 13 / 59 | 8 / 5 | 1 |
| `identity-coherence-main` | 218/297/323/114 | 93/112/116/16 | 12/26/29/10 | 9 / 19 | 5 / 4 | 0 |
| `identity-coherence-fresh` | 219/294/321/111 | 92/113/117/16 | 12/26/29/10 | 7 / 18 | 4 / 3 | 1 |
| `gate-only-keywords-main` | 217/298/326/106 | 90/108/114/13 | 11/26/30/10 | 21 / 73 | 15 / 6 | 1 |
| `gate-only-keywords-fresh` | 218/295/324/105 | 90/109/114/13 | 11/26/30/10 | 21 / 78 | 14 / 7 | 1 |
| `structured-scoring-main` | 206/290/322/93 | 88/104/110/8 | 12/26/30/10 | 57 / 216 | 50 / 8 | 1 |
| `structured-scoring-fresh` | 209/288/322/94 | 89/106/110/8 | 12/26/30/10 | 55 / 224 | 46 / 10 | 1 |
| `structural-main` | 216/297/324/104 | 90/108/113/13 | 11/26/30/11 | 38 / 129 | 28 / 10 | 1 |
| `structural-fresh` | 216/296/324/105 | 90/108/113/13 | 11/26/30/11 | 41 / 151 | 26 / 15 | 1 |
| `restored-routing` | 219/298/326/112 | 93/111/117/16 | 12/26/29/10 | 0 / 0 | 0 / 0 | 0 |

All skills top3, top5, and cardHit5 counts remain 23.
Skills top1 is 18 for keyword-boundaries, structured-combined, gate-only-keywords, structured-scoring, and structural.
It is 17 for the baseline and other policies.

Fresh runs also fail the manifest-fingerprint check because no source change was accepted.
A zero gate exit does not establish all twelve acceptance checks.
For example, `identity-coherence-main` passes the band gate but loses three legacy top-five hits.

## Every changed row and its cause

The linked tables below list every primary grade-flag flip and every top-five order change.
[Protocol diagnostic flips](protocol-diagnostic-flips.md) lists every derived diagnostic threshold change across the remaining twelve rows.
Identity-coherence and structural each add a deployment-control capture in both source runs.
Structured-scoring loses two diagnostic top1 hits and one top3 hit, while removing one control capture.
These diagnostic results remain separate from the three routing gates.
Each table records the full before/after order, scores, entrants, exits, and the controlled policy change.
The matching `*-diff-544.json` file retains all 544 rows, including unchanged rows.

For fresh-source changes, [source-attribution.md](source-attribution.md) gives a per-row causal test.
The test restores each changed scoring field or removes each new operation separately.
It evaluates 56 interventions on every one of the 84 changed source rows.
source-attribution.json (local archive `routing-repair/source-attribution.json`) records each resulting order, score, and tier.
A field listed there changes the observed result order when restored.
The test does not claim that one field explains every interacting change.

The combined policies have multiple causes.
Their isolated component experiments identify direct effects, but they do not prove independent additivity.
The tables report mechanical changes, not a semantic approval of every result.
No experiment qualifies for acceptance, so no unreviewed movement becomes a new floor.

The fresh-source run has eight graded flips:

| Row | Grade change | Measured cause |
|---|---|---|
| `q-defi-agentic-payment-standards-compare` | top3 true→false | Build-search routing keywords raise its score from 202 to 212. New hackathon analysis also changes page membership. |
| `q-defi-blend-alternatives` | top5 true→false | The cluster example admits the operation through `lending` and `stellar`. Restoring its phrases restores main order. |
| `q-defi-rwa-overview` | top3 true→false | A named hackathon example supplies `real` and `world`. Restoring its phrases restores main order. |
| `q-defi-stellarx-what-is` | top1 false→true | Restoring the old build-search description restores main order. Its schema keywords have a separate score effect. |
| `q-defi-streaming-payments-prior-art` | cardHit5 true→false | Pitch keywords and idea-review keywords and phrases change competition. The retained exact-card label is narrow. |
| `q-scf-funded-similar-payroll` | top3, top5, cardHit5 true→false | Idea-review admission, pitch keywords, and the new review operation jointly displace historical submission search. |
| `q-edge-scf-v7-centralization-myths` | top3 false→true | Pitch routing vocabulary changes the score. Restoring that vocabulary restores main order. |
| `q-pc-sequence-numbers-ordering-replace` | top1 true→false | The new review operation ranks first. Removing it restores main order. |

The wallets-kit order changes without a graded flip because its labels accept any Docs operation.
This confirms that service-level grades can hide an operation-selection failure.

## Acceptance checks

The table evaluates the final `structural` experiment on fresh sources.
A passing narrow test does not override a failed broader requirement.
The focused suite passed 98 tests and retained three expected failures.
The restored full suite passed 2,429 tests and retained the same expected failures.

| Check | Result | Evidence |
|---|---|---|
| 1. Preserve YieldBlox and Reflector intent | PASS for existing controls | The synthetic fair-allocation tests and eight-row incident control pass. The extractor already implements field allocation. |
| 2. Generic wording cannot route alone | PASS | All four `through`, `network`, `each`, and `walk through` controls pass. |
| 3. `contract` requires a repository anchor | PASS | Both the negative `contract` probe and positive repository probe pass. |
| 4. Added `use` cannot promote hackathon briefing | PASS for the existing control | Account-merge Docs remain present and `hackathonBrief` remains absent. |
| 5. `has` cannot match inside `phase` | FAIL generally | The old standalone test passes. The combined-keyword probe still increases 141→143. |
| 6. Strong Docs remain eligible against weak gated rows | PASS for the existing control | The staking/yield Docs control passes. The gate-only keyword check restores wallets-kit by preventing the false fifth gated result. |
| 7. Eight original rows meet clean grades | PASS | `keeps the eight attributed rows clean` passes on the fresh structural candidate. |
| 8. RWA discovery excludes unrelated implementation | FAIL | Basic positive and negative controls pass. All three mixed implementation controls still capture RWA. |
| 9. Leaderboard and RFP improvements remain | PASS | Both dedicated controls pass. |
| 10. Three routing gates and extended non-regression | FAIL | Holdout top1 falls 12→11 and captures rise 10→11. Extended totals fall 93/111/117→90/108/113. |
| 11. Controlled vocabulary remains visible | PASS | Directory category and region controls pass. |
| 12. Fresh Scout meets all required conditions | FAIL | Payroll loses top3. Non-hackathon review captures remain. The candidate needs more than a fingerprint update. |
| Added wallets-kit requirement | PASS for rejected candidates only | The structural fresh candidate retains wallet Docs at rank 2, score 565. The unchanged fresh scorer drops it. |

The `it.fails` markers remain because all three assertions still fail.
The fresh structural candidate ranks RWA third for the mixed simulation question.
It ranks RWA second for the mixed wallet-balance question and first for the asset-issuer protocol question.
See [structural-fresh-acceptance.json](structural-fresh-acceptance.json).

The four recent regression rows have these results:

| Row | Main | Unchanged scorer with fresh sources | Structural candidate with fresh sources |
|---|---|---|---|
| Agent payment standards | Docs rank 3 | Docs rank 4 | Docs rank 3: recovered |
| Blend alternatives | Lumenloop rank 5 | Lumenloop absent | Lumenloop rank 5: recovered |
| RWA overview | Lumenloop rank 3 | Lumenloop rank 4 | Lumenloop rank 3: recovered |
| Funded payroll | Similar-submission search rank 3 | Similar-submission search absent | Similar-submission search rank 4: still fails top3 |

The structural candidate removes `reviewSubmission` from the sequence-number question.
It still selects that operation for Phoenix SCF history, the current SCF round, historical payroll funding, and Blend directory lookup.
None asks for a hackathon-submission review.
Check 12 therefore fails even without the payroll rank failure.

The protocol-history v2 diagnostic remains `source-expired`.
Its command exits 1 and scores no questions.
I did not create a new source epoch or change its frozen contract.

## Exposure and operation classes

I recommend eventual exposure of both read operations after a passing routing repair and their golden activation checks.
Keep the fresh snapshot held now.
A paired ablation removes both read operations from the same fresh snapshot, with review excluded.
It confirms zero primary graded flips, zero diagnostic rank changes, and 17 order changes.
[The complete difference](new-read-operation-diff.txt) lists every changed row.
The changed operation set is the controlled cause in this comparison.
The rewritten routing text causes the four required regressions.
Ungraded captures still make immediate exposure an unsupported semantic acceptance.
For example, submission detail ranks first for ecosystem listing and partner jobs.
The report keeps the brief's stricter sequence: repair first, then accept the complete snapshot.

| Operation | Recommendation | Plan class | Reason |
|---|---|---|---|
| `scout.analyzeHackathonSubmissions` | Expose after the repair passes | `broad` | It returns population counts, grouped trends, and winner comparisons. Its declared denominators separate known and unknown values. |
| `scout.getHackathonSubmission` | Expose after the repair passes | `detail` | A required submission ID identifies one stored submission. The response returns its write-up, links, placement, and provenance. |
| `scout.reviewSubmission` | Keep excluded when a future snapshot is accepted | `detail` | A required link identifies one stored submission. Unrelated SCF and transaction captures remain. |

The two defaulted `meta` classifications are therefore `broad` for analysis and `detail` for review.
A read-only feedback composite is not service metadata merely because its name starts with `review`.
If review stays excluded, add no dead override for it.
Only the analysis override belongs in a future manifest that excludes review.

No exposure or classification edit ships in this rejected experiment.
Keep `/api/rwa` and `/api/quality` excluded.
The three mixed RWA failures prohibit an RWA exposure change.

## Drift impact audit

| Area | Finding and disposition |
|---|---|
| Inventory, catalog, and spec | Surface diff adds exactly three GET operations. Full paths and components differ. The builder and generated chain run successfully. |
| Routing text | Twelve existing operations change their routing text. The comparison tests all generated scoring-field changes, including Docs vocabulary. |
| Runtime source | The trial rebuild produces the new read schemas and signatures. No runtime change is accepted because routing fails. |
| Runners | The only runner declares three Lumenloop reads. None intersects the changed Scout operations. No runner live re-verification applies. |
| Golden and eval files | Existing proposals and hackathon-winner path reconciliation remain deferred. No labels or golden facts change to conceal losses. |
| Improvements | The failures concern Raven scoring and selection. Existing TODO items own them. No new upstream defect was live-verified. |
| Documentation | Current behavior remains unchanged. No production description, example, or runbook needs a speculative update. |
| Skill pins | No pin or selected file changes. The pin-review command passes. |
| Upstream follow-up | No upstream finding changes status. No message or issue was sent to another person. |

The runner operations are `lumenloop.search_content_semantic`, `lumenloop.list_documents`, and `lumenloop.find_content_by_entity`.
The source refresh changes none of them.
The golden proposals still need the separate truth-maintenance workflow before activation.
A successful offline routing result would not establish answer quality or correct live aggregate counts.

## Verification

These commands run against the restored tree unless the table states otherwise.
Each required verification command ran without a pipe.
The table records actual process exit codes.

| Command | Exit | Result |
|---|---:|---|
| `npm ci` | 0 | Installs 278 packages. The optional hook setup cannot write the main checkout's Git config. |
| `npm run typegen` | 0 | Generates Env types from placeholder `.dev.vars` names. Wrangler reports a blocked external log write. |
| `npm run typecheck` | 0 | Passes. |
| `npm test` | 0 | 136 files; 2,429 passed and three expected failures. |
| `npm run test:smoke` | 0 | Seven files and 104 passed tests. Wrangler reports a blocked external log write. |
| `npm run build` | 0 | Worker dry-run build passes. No deployment occurs. |
| `npm run eval:selftest` | 0 | All offline grading and evidence checks pass. |
| `npm run eval:compile` | 0 | Rebuilds 338 legacy and 122 extended rows without a tracked change. |
| `npm run eval:routing -- --gate` | 0 | Baseline and restored runs pass. Experiment exits appear in the result table. |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 | Zero errors and 62 warnings on the restored catalog. |
| `npm run eval:qa:register -- --check` | 0 | Register is current. |
| `npm run improvements:lint` | 0 | 65 findings pass. |
| `npm run secrets:scan -- --tree` | 0 | Tracked-file checks and Gitleaks pass. |
| `node scripts/build-catalog.mjs` | 0 | Runs on fresh and restored sources. Exposure guards pass. |
| `npm run micro-map:build` | 0 | Runs on fresh and restored sources. |
| `npm run spec:build` | 0 | Fresh trial has 67 paths. Restored spec has 64 paths. |
| `npm run site:globes` | 0 | Regenerates both globe modules. |
| `node scripts/check-mirrors.mjs` | 0 | Mirror checks pass. |
| `node ecosystem-skills/build-index.mjs` | 0 | Regenerates 21 categorized entries. |
| `node eval/corpus/raven-next/research/golden/_meta/compile.mjs` | 0 | Compiles 538 retained cards. |
| `node eval/compile-routing.mjs` through `npm run eval:compile` | 0 | Generated routing rows remain current. |
| `node eval/qa/compile-qa.mjs` | 0 | Compiles 501 cases, 30 sample cases, and 505 reserved IDs. |
| `node eval/plan/build-op-classes.mjs` | 0 | Fresh trial warns about two defaults. Restored output has no unmatched operations. |
| CI generated-artifact `git diff --exit-code --stat` command | 0 | All listed generated artifacts match Git. |
| `node scripts/check-pin-review.mjs --base HEAD` | 0 | No pin or file selection moved. |
| `git diff --check` | 0 | No whitespace errors. |
| `npm run eval:protocol-history` | 1 | Expected `source-expired`; no questions were scored. |
| Focused Vitest command on the structural fresh candidate | 0 | Four files; 98 passed and three expected failures. |
| `node scripts/refresh-inventory.mjs` without credentials | 1 | Missing `LUMENLOOP_API_KEY`. |
| `node scripts/refresh-inventory.mjs --service stellar-light` | 0 | Fetches Scout 1.9.72. |
| Full refresh with the existing main `.env` | 0 | Fetches 674 titles; other service snapshots remain unchanged. |
| `diff-inventory.mjs surface` | 1 | Expected drift: three additions. |
| `diff-inventory.mjs text` | 1 | Expected routing-text drift. |
| `diff-inventory.mjs deep` | 1 | Expected differences in paths and components. |
| Both experiment matrix scripts | 0 | All child routing runs finish. Their individual gate exits remain recorded. |
| `compare-results.mjs` | 0 | Checks all 544 IDs per comparison and writes every moved row. |
| `source-attribution.mjs` | 0 | Completes 56 interventions for each of 84 source reorders. |
| Routing with `--manifest tmp/routing-repair/fresh-without-new-reads-probe.json --gate` | 0 | Numerical gates pass. The override does not replace canonical gate evidence. |
| Read-operation difference and diagnostic comparison | 0 | 544 rows; zero grade changes, zero diagnostic rank changes, and 17 order changes. |
| `protocol-diffs.mjs` | 0 | Records all diagnostic threshold changes separately. |
| `source-deltas.mjs` | 0 | Compares each policy across the old and fresh snapshots. |

The focused command was:

```sh
npx vitest run test/drift-141-routing.test.ts test/routing-evidence.test.ts test/extract-routing-phrases.test.ts test/scoring.test.ts
```

The full refresh command was:

```sh
node --env-file=/Users/kalepail/Desktop/stellar-raven-codemode/.env scripts/refresh-inventory.mjs
```

The CI artifact comparison was:

```sh
git diff --exit-code --stat -- catalog specs src/mcp/micro-map.ts src/demo/globe.ts src/consent-globe.ts ecosystem-skills/INDEX.md eval/corpus/raven-next/research/golden/compiled/golden.json eval/routing-cases.json eval/qa/cases.json eval/qa/sample.json eval/qa/lifecycle-registry.json eval/plan/op-classes.json
```

Two initial local probe helpers used the wrong case-array shape and exited 1.
I corrected them before using their results.
The saved acceptance and comparison artifacts come from completed runs.
No failed helper result appears as a passing verification.

## Remaining work and filesystem limits

The existing structured-routing TODO remains open.
This session has read-only access to `.agents/` and the linked Git metadata.
I did not bypass those restrictions or ask another agent to bypass them.
The requested TODO text is prepared in todo-update.md (local archive `routing-repair/todo-update.md`).
It needs placement under the existing item by a session with write access.

No failed scorer change remains for an owner to accidentally commit.
No gate adjustment can make these failed acceptance checks valid.
A later repair needs separate evidence for schema names, title vocabulary, declared intent, and examples.
It also needs an admission rule that preserves strong cross-service results without the measured collateral losses.

## Complete row tables

- [fresh-routing](fresh-routing-moved-rows.md): 8 graded changes; 84 order changes.
- keyword-boundaries-main (local archive `routing-repair/keyword-boundaries-main-moved-rows.md`): 28 graded changes; 128 order changes.
- keyword-boundaries-fresh (local archive `routing-repair/keyword-boundaries-fresh-moved-rows.md`): 28 graded changes; 133 order changes.
- schema-rank-only-main (local archive `routing-repair/schema-rank-only-main-moved-rows.md`): 3 graded changes; 41 order changes.
- schema-rank-only-fresh (local archive `routing-repair/schema-rank-only-fresh-moved-rows.md`): 4 graded changes; 45 order changes.
- example-admission-main (local archive `routing-repair/example-admission-main-moved-rows.md`): 11 graded changes; 37 order changes.
- example-admission-fresh (local archive `routing-repair/example-admission-fresh-moved-rows.md`): 14 graded changes; 62 order changes.
- cross-service-main (local archive `routing-repair/cross-service-main-moved-rows.md`): 1 graded changes; 22 order changes.
- cross-service-fresh (local archive `routing-repair/cross-service-fresh-moved-rows.md`): 1 graded changes; 22 order changes.
- structured-combined-main (local archive `routing-repair/structured-combined-main-moved-rows.md`): 40 graded changes; 174 order changes.
- structured-combined-fresh (local archive `routing-repair/structured-combined-fresh-moved-rows.md`): 42 graded changes; 193 order changes.
- admission-only-main (local archive `routing-repair/admission-only-main-moved-rows.md`): 10 graded changes; 36 order changes.
- admission-only-fresh (local archive `routing-repair/admission-only-fresh-moved-rows.md`): 13 graded changes; 59 order changes.
- identity-coherence-main (local archive `routing-repair/identity-coherence-main-moved-rows.md`): 9 graded changes; 19 order changes.
- identity-coherence-fresh (local archive `routing-repair/identity-coherence-fresh-moved-rows.md`): 7 graded changes; 18 order changes.
- gate-only-keywords-main (local archive `routing-repair/gate-only-keywords-main-moved-rows.md`): 21 graded changes; 73 order changes.
- gate-only-keywords-fresh (local archive `routing-repair/gate-only-keywords-fresh-moved-rows.md`): 21 graded changes; 78 order changes.
- structured-scoring-main (local archive `routing-repair/structured-scoring-main-moved-rows.md`): 57 graded changes; 216 order changes.
- structured-scoring-fresh (local archive `routing-repair/structured-scoring-fresh-moved-rows.md`): 55 graded changes; 224 order changes.
- structural-main (local archive `routing-repair/structural-main-moved-rows.md`): 38 graded changes; 129 order changes.
- structural-fresh (local archive `routing-repair/structural-fresh-moved-rows.md`): 41 graded changes; 151 order changes.
- restored-routing (local archive `routing-repair/restored-routing-moved-rows.md`): 0 graded changes; 0 order changes.

## Source changes with each scorer held fixed

These additional comparisons test old sources against fresh sources under each identical policy.
They preserve every row and report each source-induced grade or order change.

- keyword-boundaries (local archive `routing-repair/keyword-boundaries-source-delta.md`): 9 graded changes; 77 order changes.
- schema-rank-only (local archive `routing-repair/schema-rank-only-source-delta.md`): 10 graded changes; 80 order changes.
- example-admission (local archive `routing-repair/example-admission-source-delta.md`): 5 graded changes; 50 order changes.
- cross-service (local archive `routing-repair/cross-service-source-delta.md`): 8 graded changes; 84 order changes.
- structured-combined (local archive `routing-repair/structured-combined-source-delta.md`): 4 graded changes; 42 order changes.
- admission-only (local archive `routing-repair/admission-only-source-delta.md`): 5 graded changes; 50 order changes.
- identity-coherence (local archive `routing-repair/identity-coherence-source-delta.md`): 9 graded changes; 79 order changes.
- gate-only-keywords (local archive `routing-repair/gate-only-keywords-source-delta.md`): 8 graded changes; 78 order changes.
- structured-scoring (local archive `routing-repair/structured-scoring-source-delta.md`): 11 graded changes; 72 order changes.
- structural (local archive `routing-repair/structural-source-delta.md`): 2 graded changes; 34 order changes.

## Independent review and reconciliation

The independent reviewer completed the review and accepted the decision to reject every candidate.
Reviewer: Claude Fable tier, `claude-fable-5-1`, high effort, in owned Herdr pane `w3W:p29`.
The reviewer differs from the Codex author and reviewed the API exposure and report evidence.
Codex frontier was the author, so the next matched tier was used.

[Independent audit](independent-audit.md).
Retained reviewer evidence (local archive `routing-repair/reviewer-evidence/README.md`).
The reviewer independently rebuilt the fresh manifest and reproduced the wallets-kit mechanism.
The fresh manifest matched byte-for-byte.
The reviewer also isolated Scout-only and titles-only source changes.

| Review finding | Reconciliation |
|---|---|
| Wallet restoration had the wrong policy attribution | Attributed it to gate-only keywords and the restored short page. |
| Standalone schema test missed the combined-keyword defect | Added the reproducible entry, query, 141/143 result, and null-base distinction. |
| Phrase cap still applies | Added 421→256 tokens and the exact dropped-phrase counts. |
| Temporary operation classes were mistaken for committed content | Reviewer corrected the claim after `git show HEAD` verified 60 operations and no unmatched entries. |
| Identity coherence was incorrectly called the only sequence repair | Reviewer corrected the claim; gate-only keywords also remove that capture. |
| First combined harness contained an ineffective replacement | Recorded its four actual policies and kept the separate coherent-scoring experiment. |
| Experiment metadata lacked lane totals | The report uses `comparison-summary.json` and the saved result JSONs. |
| Primary helper omitted diagnostic thresholds | Added the separate diagnostic-flip appendix and the 532/544 denominator distinction. |
| Read-operation grade neutrality needed a direct comparison | Added a paired removal test; recorded all 17 ungraded order changes. |

The reviewer did not independently execute live adapter calls or semantically review every changed result.
The reviewer inspected the field-restoration artifact but did not rerun all 4,704 interventions.
The report preserves those limits and approves no deployment or source acceptance.
