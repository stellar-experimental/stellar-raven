# Pipeline and gate review — rev-astra

Reviewer: GPT-6-Astra, high. Date: 2026-09-30.
Author and orchestrator: Claude Opus 5.5.
Reviewed change: `605c1558..f65e165d`, plus the filing receipt in `2f79caab`.

## Verdict

**accept with fixes** — The factual corrections hold, but the admission procedure and golden closure omit required checks.

## Findings

### 1. should-fix — The admission procedure permits insufficient QA coverage

Location: `ecosystem-skills/README.md:199`.

Step 6 permits one golden **or** one skills-routing case for an entire source.
CI requires active QA coverage for **each exposed skill**.
A routing case does not satisfy that requirement.

Evidence:

- `eval/qa/lint-corpus.mjs:626` counts each skill's appearances in QA case `surface` arrays.
- The floor is one per skill, except the digest skill, which requires two.
- `.github/workflows/ci.yml` runs the lint with `--enforce-floors`.
- `.agents/rounds/2026-09-16-trustless-work/independent-review.md:26` records the actual failure: `skill floor 1; found 0`.
- That review required activation of the previously committed proposal in the source admission commit.

Exact fix: require active QA coverage for every newly exposed skill.
Permit reuse of suitable existing cases after evidence review.
Require proposal-first commits and independent activation review for new case IDs.
Keep routing cases as a separate requirement when routing coverage needs them.

### 2. should-fix — The admission procedure points to regeneration instead of the complete acceptance gates

Location: `ecosystem-skills/README.md:197`.

Step 5 says to “gate exactly” through `live-drift-resolution` Step 1.
That step regenerates artifacts and checks pins.
It does not run the routing acceptance gate or reconcile its catalog fingerprint.
The stated Trustless Work example required both.

Evidence:

- `.agents/skills/live-drift-resolution/SKILL.md`, Step 1, supplies the regeneration procedure.
- `.agents/rounds/2026-09-16-trustless-work/independent-review.md:28` requires the new catalog fingerprint in the same candidate.
- The same review rejects an intermediate source-only tree because coverage and routing gates fail.
- `git show --stat 58954b67` includes `eval/gates.json`, count-contract tests, and QA lifecycle artifacts.

Exact fix: link the complete classification, verification, independent-review, and deployment steps.
Explicitly require the routing gate, coverage floors, generated-artifact checks, and reviewed fingerprint reconciliation.
Preserve numerical floors unless a separate decision authorizes their change.
State that deployment still requires existing owner authority.

### 3. should-fix — The golden refresh closed before the skill's verification workflow completed

Locations: `.agents/rounds/2026-09-30-skill-system-audit.md:29` and `:67`.

The ledger records one author lane and says nobody requested independent review.
It records no independent claim matrix before the refresh.
It also records no `eval:plan` comparison.
Those requirements come from the invoked skill, independently of a separate user request.

Evidence:

- `.agents/skills/golden-truth/SKILL.md:24` applies the workflow to the judge-blind `truth` block.
- Lines 143–146 require an independent agent per claim cluster before the author edits owned cases.
- Lines 208–209 require `npm run eval:plan -- <last-results>` and unchanged plan grades.
- The case changes `truth.asOf` to `2026-09-30` and `truth.reverifyBy` to `2026-12-31`.
- The round ledger records the review round only after merge and deployment, at line 82.
- GitHub job `110066978474` passed every configured step, but that job contains no saved-result plan comparison.

The refreshed capability row also retains July source-code and empirical evidence descriptors without exact source locations.
Its new evidence comes only from two official documentation pages.
Thus PR #183's statement that “each of its claims” received fresh verification exceeds the recorded evidence.
The storage and CLI claims have substantially better current evidence.

Exact fix: reconcile this independent review and the other current review lanes before final closeout.
Record the claim matrix, its reviewers, and the retained verification limits.
Run the saved-result plan comparison and record its input and result.
If no suitable result exists, record that limitation explicitly.
Link the closure to `f65e165d` and the follow-up review commit.

This is a process finding, not evidence that the golden answer is false.
My parsed comparison found no change to `question`, `golden`, or `tags`.
The coverage rules also match the base after removal of the explanatory `why` field.

### 4. should-fix — sk-027 misses an adjacent instruction that still sends curated entries to SDF

Location: `improvements/skills/sk-027-scout-skill-stale-skills-catalog.md:52`.

The recommendation correctly broadens the content endpoint beyond SDF.
However, the next upstream paragraph still constructs an SDF installation URL for every returned entry.
An owner can follow the listed correction and retain that broken instruction.

Evidence at pinned commit `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6`:

- `references/api-reference.md:196` directs installation through `https://skills.stellar.org/skills/{name}/SKILL.md`.
- Live `GET https://stellarlight.xyz/api/skills/stellar-scout` returns a `stellarlight` entry with 34541 content characters.
- Its source is `https://stellarlight.xyz/skills/stellar-scout.md`.
- `README.md:76` also retains `skills.stellar.org/soroban`, outside the finding's listed stale locations.
- `.agents/skills/improvements-pipeline/SKILL.md:117` requires an adjacent and repeated-claim sweep.

Exact fix: include line 196 in the local finding and require returned installation/source metadata for curated entries.
Include README line 76 in the same correction.
Change “five places” to an accurate count or remove the count.
These are residuals of sk-027; a duplicate finding is unnecessary.

## Additional work

1. **simple** — Put the decision K body-review task in `TODO.md`, and link it from [`NEXT.md:153`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md).
   The owner decision belongs in [`NEXT.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md); its pending investigation belongs in the work queue.
   `.agents/README.md:30` assigns own-repo follow-ups to `TODO.md`.
   Current searches find the SCF body-review task only in [`NEXT.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md).

2. **simple** — Add a complete sibling-check list to the golden closure.
   The current evidence names two Lab siblings and the removed URL search.
   Also record `q-asset-deploy-sac-cli` and `q-sor-sac-introspection`, which share the refreshed SAC command distinction.
   Record all seven members of cluster 023 when describing that cluster as re-swept.
   I found no contradiction in the examined funding, storage, and SAC distinctions.

3. **simple** — Add the deployment receipt to the round ledger.
   The review brief names `c4d27b61-e0f0-47a4-a6fe-6ce298fb1b81`; the ledger does not contain that identifier.
   Record the deployed commit, version, time, and post-deployment check.
   The public health result alone cannot establish that deployment identity.

4. **simple** — Separate evidence summaries from long frontmatter bullets in future issue filings.
   Issue #14 preserves the required sections, but repeats long evidence sentences under “Additional recorded evidence”.
   `.agents/skills/improvements-pipeline/references/upstream-writing-style.md` requires short sentences and one idea per sentence.
   Do not post a cosmetic follow-up to the untouched issue.

## Checked and correct

### Golden evidence, dates, and generated records

The following independent reads succeeded on 2026-09-30:

| Claim | Direct check | Result |
| --- | --- | --- |
| Replacement cookbook | [Current cookbook](https://developers.stellar.org/docs/tools/cli/cookbook/deploy-stellar-asset-contract) | HTTP 200; separate deployment and ID commands |
| Removed cookbook | `https://developers.stellar.org/docs/tools/cli/cookbook/contract-assets` | HTTP 404 |
| Saved-keypair storage | [Official keypair page](https://developers.stellar.org/docs/tools/lab/saved/keypairs) | Obfuscation, recoverable secrets, legacy plaintext, test-network restriction |
| Current storage implementation | `stellar/laboratory` main, `src/helpers/jsonCipher.ts` and `src/helpers/localStorageSavedKeypairs.ts` | XOR/base64 writes; JSON-first legacy reads |
| Storage source history | `gh api 'repos/stellar/laboratory/commits?sha=main&path=src/helpers/jsonCipher.ts&per_page=1'`, repeated for the writer | Both return `624d40ff29ca897f07290ca52011893175dae200`, dated `2025-09-04T19:34:02Z` |
| Served implementation | [Saved-keypairs page](https://lab.stellar.org/account/saved), then its referenced `page-dbc03db5d85268bb.js` | Same XOR/base64 writer and legacy reader; explicit storage warning |
| Funding and transaction controls | [Lab](https://developers.stellar.org/docs/tools/lab), [transactions](https://developers.stellar.org/docs/tools/lab/transactions) | Testnet/Futurenet funding; named sequence and operation controls |
| Quickstart boundary | [Quickstart](https://developers.stellar.org/docs/tools/quickstart) | Explicit non-production warning |
| CLI distinction | `stellar --version`; `stellar contract asset --help`; `stellar contract id asset --help` | `28.1.0`; deploy and deterministic ID derivation remain distinct |

The `freshness-drift` root cause is valid for the URL refresh.
Replacing the prior verification event is allowed; the skill assigns historical events to Git history.
The December date follows the September check and satisfies the quarter-scale refresh convention.
The answer retains its dated September 9 storage observation.
It does not turn that observation into a timeless assertion.

The register review supplies dated reasons for both reopened clusters.
`npm run eval:qa:register -- --check` returned `[register-helper] up to date`.
The parsed battery comparison found exactly one changed case: `q-ti-stellar-lab-usage-and-new-ui`.
No judge-facing field changed in any case.

### Filing and live skill state

`gh api repos/Stellar-Light/stellar-scout/issues/14` returned the open issue, authored by `kalepail`, with zero comments.
Its body includes the automation marker and all five required sections.
Its source links include the public record and the immutable `f65e165d` snapshot.
Its resolution handoff links the correct Raven issue template.

Commit `2f79caab` records `reported-upstream`, the durable issue URL, and the regenerated index.
The intake override selects the correct skill repository.
The repository has no `raven` label, so its absence is correct.
The complete 14-item issue listing revealed no earlier duplicate catalog finding.
The original dry-run execution remains unverified; the published body satisfies its output contract.

Direct pinned-source reads confirmed every cited stale phrase.
Live `/api/skills` returned 43 entries: `sdf: 8`, `stellarlight: 15`, `lumenloop: 8`, `external: 12`.
`/api/skills/soroban` returned 404; `/api/skills/smart-contracts` returned 200.
`/api/skills/stellar-scout-mcp` returned null content, supporting the metadata-only branch of the recommendation.

### Repository gates and scope

| Check | Observed result |
| --- | --- |
| `node scripts/check-skills-drift.mjs` | All five sources and the 43-entry catalog `ok` |
| `node scripts/check-mirrors.mjs` | `mirror checks ok` |
| `node scripts/check-pin-review.mjs --base 605c1558` | No pin or file-selection change |
| `npm run eval:qa:lint -- --since 605c1558 --stale` | 0 errors, 62 warnings |
| `npm run improvements:lint` | 64 findings; passed |
| `npm run improvements:lint -- --live` | 64 findings; live intake checked; passed |
| Local catalog count | 60 operations, 20 skills, 202 skill sections |

[PR CI job 110066978474](https://github.com/stellar-experimental/stellar-raven/actions/runs/36768015097/job/110066978474) passed every listed step.
Those steps include typecheck, builds, unit tests, smoke tests, routing, coverage floors, register checks, and generated-artifact synchronization.
The separate secrets check also passed.
I found no skipped configured CI gate.
I did not repeat builds or generators because this review permits only its report file to change.

The TODO edit preserves the two remaining freshness tasks and states their completion conditions.
The NEXT item correctly ranks them and retains the open owner decision.
The Scout version matches `inventory/stellar-light.json` at `1.9.54`.
The source tables, license table, and exposure-count correction match the current local artifacts.

Production search returned the pinned Scout skill and its section list.
`GET https://raven.stellar.org/health/skills` returned HTTP 200 and `ok: true`.
That result reports `checked: 64` at `2026-09-30T19:07:27.474Z`, before the claimed deployment.
The exact deployment identifier and the exhaustive production 20/202 counts remain **unverified** in this lane.

The MCP approval layer rejected `execute`: “MCP tool call requires approval, but approval policy is never”.
That blocked the production skill-body and soft-empty rechecks through Raven.
I used permitted direct upstream reads for those upstream facts.
I made no GitHub writes, deployment changes, Git state changes, or paid evaluation calls.
