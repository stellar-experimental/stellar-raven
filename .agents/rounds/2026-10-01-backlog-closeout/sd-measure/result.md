# Stellar Docs adapter measurement — 2026-10-01

**RELEASE OK.** The predeclared release rule passes. No verified adapter regression remains.
This closeout adds records only. It does not deploy, commit, stage, push, or file an upstream issue.

## Identities and scope

| Item | Identity |
| --- | --- |
| Baseline | `bcfa617ffcb6e58e6a7498a1e42135a059535402` |
| Candidate | `36787b3a9b051fa366b7648ca201691715253fbc` |
| Plan SHA-256 | `b1f014f1cec7a5de1ec53a4058b0abf284a9c0cca68613842b1a6d6cdffe2028` |
| Answer / judge model | `claude-sonnet-5` / `claude-sonnet-5` |
| Rubric / evidence pack / forced panel | `v2.10` / `p6` / `2` |
| Surface / variant | `search-execute` / `A` |
| Surface SHA-256 | `ff66f1f80c01147dbbb9e15c51174f842f139b2821cd48f4b20cb8d20c32a949` |
| Remote identity SHA-256 | `1ad47664d99713cb3334f1a5218c5a81de0f19e0b3a28957294ef838b4454a79` |
| Claude Code | `2.1.287` |
| Claude executable SHA-256 | `6eab8333fe2121553100d8f40bfada384a3e989b94f947e18ba6677a6fcb41ea` |

The free differential passed 101/101 pairs with 255 HTTP attempts and no adapter error.
It covered 50 content pairs, all nine content branches, and all eight filtered branches.
Its 19 differences matched the permitted default-limit and miss-message changes.
All four collection artifacts passed identity, completeness, cost, and evidence-pack hash checks.
All four report `comparable: true`. That flag does not prove stable upstream responses.

## Original collection totals

| Lane | Complete | Correct | Partial | Wrong | Error | Cost |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Baseline battery | 20/20 | 10 | 7 | 3 | 0 | $7.2556242 |
| Candidate battery | 20/20 | 10 | 7 | 3 | 0 | $7.6201438 |
| Baseline live | 15/15 | 12 | 2 | 1 | 0 | $5.7672872 |
| Candidate live | 15/15 | 9 | 4 | 2 | 0 | $5.8781516 |

All 70 answers received manual review. The original grades remain unchanged.
Ten candidate rows reached changed behavior. All ten retained the same grade across arms.
None of the six initial grade differences reached changed behavior.
The live totals do not establish an adapter effect or a full-battery improvement.

## Repeated judging

The frozen union included five battery cases and four live cases, repeated in both arms.
Four commands completed 18 panels and 36 judge calls. Each command ran once under its $5 cap.
Five aggregate grades changed on identical inputs. Four initial differences disappeared.
The SEP-9999 and Beans differences remained. No answer or evidence pack changed.
All 36 repeated calls received an evidence disposition.

| Rejudge lane | Panels | Calls | Cost |
| --- | ---: | ---: | ---: |
| Baseline battery | 5 | 10 | $0.6190308 |
| Baseline live | 4 | 8 | $0.7562356 |
| Candidate battery | 5 | 10 | $0.6725618 |
| Candidate live | 4 | 8 | $0.7283468 |

## Difference dispositions

Grades below list baseline, then candidate.

| Case | Original → repeated | Final disposition |
| --- | --- | --- |
| `q-cctp-v2-usdc-stellar` | Partial/Wrong → Partial/Partial | Judge variance. No Docs call. Fast-fee metadata does not contradict Standard-only outbound support. |
| `q-edge-noinfo-sep-9999` | Wrong/Correct → Wrong/Correct | Answer variance. All Docs calls returned `ok` with explicit limits. No changed behavior was reached in either arm. |
| `q-protocol-bn254-poseidon-xray` | Correct/Partial → Correct/Correct | Judge variance and a CAP-0059 attribution error. The successful meeting call used explicit limit 10. |
| `q-live-oracle-repo-triage` | Correct/Partial → Correct/Correct | Judge variance. The candidate's 53-in-23–46 error remains real. Both successful Docs calls used explicit limits. |
| `q-live-leaderboard-active-projects` | Correct/Partial → Correct/Correct | Judge variance. The raw data contains Pipeline's RWA tag. No Docs call. |
| `q-live-beans-cross-service-reconcile` | Correct/Wrong → Partial/Wrong | The p6 pack omitted captured evidence. A separate unsupported side claim remains. Neither arm called Docs. |
| `q-sor-cross-socketfi-auth` | Partial/Partial; outside union | Cleared through the same-input replay. Both adapters returned identical envelopes for all three inputs. |
| `q-live-ecosystem-crowded-underbuilt` | Correct/Correct; outside union | A direct burst reproduced a backend timeout with HTTP 200 and zero counts. Neither arm called Docs. |

SocketFi lost a required explanation at the answer level.
The candidate query lacks that explanation with either adapter; the replay also equals the stored candidate envelope.
The differing query choices explain the loss without an adapter mechanism.
See the [replay](evidence/replay-socketfi.json) and the [independent review](review-result.md).

The Scout burst reproduced one failed read among 65 requests, including one status request.
This proves the failure mechanism, not its frequency or all eleven original zero responses.
Sequential controls returned Tooling `184`, User-Facing App `407`, and Payments `303` before and after the burst.
The shared OpenAPI warning description restricts warnings to unread parameters, which conflicts with the failed-read response.
See [the burst](evidence/burst-burst-1790895846790.json) and [the OpenAPI excerpt](evidence/scout-openapi-contract.json).

The unchanged Strupey and parallel-execution Wrong answers remain separate defects.
The jobs Wrong panels retain unsupported grouping or recency claims; the candidate preserved all 30 URLs.
None establishes an adapter regression. The ERC-8004 candidate trace contains no miss message.

## Spend and reviews

Collection cost **$26.52** (`$26.5212068`) stayed below its $90 cap.
Repeated judging cost **$2.78** (`$2.7761750`) stayed below its separate $20 cap.
The exact combined cost is `$29.2973818`.
All 246 paid calls reported costs: 70 answer calls and 176 judge calls.
Stops and the final closeout added no paid calls.

- [Implementation review](review-adapter.md): **ACCEPT**. No actionable correctness or security finding; release required the separate measurement.
- [Independent result review](review-result.md): **RELEASE OK**. Claude Fable 5.1 (`claude-fable-5-1`, high), `scf-fable`, cleared every release condition.
- Rejudge command review: **GO REJUDGE OK**. The `scf-grok` review found no issue with the frozen union or commands.

The result review contains its original external references because this closeout preserves the exact review text.
The local `evidence/` directory retains the SocketFi replay, Scout captures, request script, and OpenAPI excerpt.
The [artifact manifest](evidence/artifact-manifest.json) preserves the eight collection/rejudge hashes and retained review-evidence hashes.

## Closeout actions

The completed measurement TODO is deleted. The p6 evidence-omission TODO remains.
The Scout TODO uses the reviewer's exact wording. It requires a separately measured adapter repair.
[Upstream record sls-089](../../../../improvements/stellar-light-scout/sls-089-project-search-failed-read-zero-count.md) records the contract mismatch.
The existing intake rule selects `Stellar-Light/stellarlight`; no override is needed.
The filing dry run prepares the issue only. No issue is filed.
No recurring probe is attached because a deterministic request cannot force the timeout.

## Validation

- `npm run typecheck`: passed.
- `npm test`: 126 files passed; 2,213 tests passed; three expected failures.
- `npm run improvements:lint`: passed, 66 findings.
- `npm run secrets:scan -- --tree`: passed.
- Additional Gitleaks scans covered the new untracked result files and upstream record; both passed.
- `git diff --check`: passed.
- The filing dry run passed and retained the source record and resolution handoff.
- The copied result review matches the original byte for byte. All eight measurement artifact hashes remain unchanged.
