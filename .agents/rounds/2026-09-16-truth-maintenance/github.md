# GitHub audit

## Verdict

The audit reviewed both open pull requests and all seven open Raven issues.
PR [#156](https://github.com/stellar-experimental/stellar-raven/pull/156) needs one documentation correction.
PR [#157](https://github.com/stellar-experimental/stellar-raven/pull/157) is not ready for acceptance.
No finding proves a Raven runtime defect.
PR #157 has evidence, review, generated-text, latent-exposure, and routing-acceptance defects.

## Scope and boundaries

Audit mode was read-only, except for this requested report.
Each GitHub base and head SHA defines the audit boundary.
No source pin, policy, golden, finding, gate, issue, PR, branch, or deployment changed.
No paid evaluation or model collection ran.
No Wrangler development server started.

| Surface | Exact boundary | Result |
| --- | --- | --- |
| [PR #156](https://github.com/stellar-experimental/stellar-raven/pull/156) | `722eef5f2a81845ebdd8206e17ee100344eabd58...ac1769f75f72ba41622534f5f53b9c8944aeb69d` | 13 files; one medium finding |
| [PR #157](https://github.com/stellar-experimental/stellar-raven/pull/157) | `722eef5f2a81845ebdd8206e17ee100344eabd58...b447ff403f82734a0297b56c78a1a5515aa1f824` | 26 files; three high and three medium findings |
| Open Raven issues | #40, #141, #158 to #162 | All seven read on 2026-09-16 |
| Active improvements | 61 records | Isolated `npm run improvements:lint` passed |

## Findings

| Severity | Axis | Location | Evidence | Smallest repair |
| --- | --- | --- | --- | --- |
| High | Spec and safety | `eval/qa/corpus/battery/compliance-rwa-payments/q-tw-escrow-api-auth-custody.json:8-19,97-106` | V1-only mainnet and V2-only testnet claims are volatile. The case labels them `stable`. The deployment corroboration has only class B. The linked official landing page does not prove V1/V2 exclusivity. | Keep the case proposed until independent evidence exists. Or mark it scheduled, add in-answer `asOf`, add `reverifyBy`, and use two independent classes. |
| High | Spec and lifecycle | `q-tw-escrow-api-auth-custody.json:29-45`; `eval/gates.json:54` | Both records cite a future maintainer review. GitHub has no human maintainer review. Five Copilot threads remain unresolved. | Do not record a future review. Keep the case proposed. Record a completed independent review after it happens. |
| High | Acceptance | [workflow 35001188272](https://github.com/stellar-experimental/stellar-raven/actions/runs/35001188272) | GitHub reports `event=pull_request`, head `b447ff4`, and `conclusion=action_required`. It has no jobs and the head has no check runs. PR state is `blocked`. | Resolve the Actions approval requirement. Re-run required CI on the current head. |
| Medium | Truth and reviewability | `scripts/lib/skill-markdown.mjs:37-55`; `catalog/manifest.json:20619`; `ecosystem-skills/INDEX.md:66`; `specs/super-spec.json:5028` | The flat parser retains a YAML folded-scalar marker. The index says only `>`. Catalog outputs say `> Use when ...`. | Support folded scalars in the shared parser. Regenerate outputs. Add parser and generated-output tests. |
| Medium | Exposure safety | `ecosystem-skills/update.sh:80-124` | Exact current-head jq reproduction creates `README.md` and `LICENSE.md` skill records without an allow-list. Trustless Work has an explicit allow-list, so it is safe now. Evidence: [root-mode check](pr157-root-mode-check.json). | Require a child directory for `path: "."`. Add a root-Markdown regression test. |
| Medium | Acceptance risk | `eval/gates.json:54`; [routing identity evidence](routing-identity-diff.json) | The gate-input fingerprint statement is correct. Only `catalog/manifest.json` changed among the four gate inputs. The separate row comparison found five changed top-five rows. | Record and review the changed rows as an acceptance risk. Do not call this a paid QA regression. |
| Medium | Spec and documentation | `PLAN.md:22` in PR #156 | `src/policy/guard.ts:2-20` owns host-side argument validation. `src/server.ts:214-240` and `src/auth/` own authentication. Adapters own service traffic. | State the separate owners. Limit adapter ownership to service traffic and host-side secrets. |

The golden finding is missing evidence, not a proven deployment or runtime defect.
The root-mode finding is a latent generic-mode defect, not a current Trustless Work exposure.

### PR #157 routing identity evidence

Both revisions produced 495 ranked rows.
The comparison found 490 unchanged rows and five changed rows.
The skill replaced a previous top-five result in every changed row.
No accepted total changed.

| Row | Base difference | Head difference |
| --- | --- | --- |
| `q-asset-path-payment-ops` | `stellarDocs.search_docs_in_category` rank 3 | `skills.trustless-work.trustless-work-dev` rank 3 |
| `q-defi-stellarx-what-is` | `stellarDocs.search_soroban_contract_docs` rank 5 | `skills.trustless-work.trustless-work-dev` rank 5 |
| `q-edge-fresh-latest-blend-tvl` | `scout.getHackathons` rank 5 | `skills.trustless-work.trustless-work-dev` rank 5 |
| `q-org-sdf-mandate-buckets` | `stellarDocs.search_doc_titles` removed from rank 5 | `skills.trustless-work.trustless-work-dev` added at rank 3 |
| `q-soroban-cli-bindings` | `stellarDocs.search_docs` rank 3 | `skills.trustless-work.trustless-work-dev` rank 5 |

This is a ranking identity change.
It is not proof of a runtime fault.
It does not establish a paid QA regression.

### PR #157 review state

GitHub reports `mergeable=true` and `mergeable_state=blocked`.
The current head has 34 commits and 26 changed files.
The author replied to five Copilot threads.
All five threads remain unresolved.
No human maintainer review exists.

| Thread | State | Audit result |
| --- | --- | --- |
| [Catalog count](https://github.com/stellar-experimental/stellar-raven/pull/157#discussion_r4018148631) | Unresolved | Isolated full tests passed. The count repair appears effective. |
| [Proposed-first lifecycle](https://github.com/stellar-experimental/stellar-raven/pull/157#discussion_r4018148685) | Unresolved | Commit history has a proposed stage. Independent reviewer evidence is still absent. |
| [Pin timestamp](https://github.com/stellar-experimental/stellar-raven/pull/157#discussion_r4018148747) | Unresolved | `synced_at` now follows the pin commit date. |
| [Served and mirrored counts](https://github.com/stellar-experimental/stellar-raven/pull/157#discussion_r4018148789) | Unresolved | The revised pin review distinguishes count types. |
| [Gate decision record](https://github.com/stellar-experimental/stellar-raven/pull/157#discussion_r4018148842) | Unresolved | The new-source note exists. Its claimed maintainer review does not exist. |

## Complete PR file coverage

Each row was read in the complete pinned diff and its governing contract.

### PR #156

| File | Coverage result |
| --- | --- |
| `.agents/NEXT.md` | Current handoff rewrite preserved paid and owner limits. |
| `.agents/TODO.md` | Current task links only. |
| `ARCHITECTURE.md` | Current framing remained accurate. |
| `PLAN.md` | One owner-map finding at line 22. |
| `eval/README.md` | Historical evaluation status has a current-state boundary. |
| `eval/discovery/README.md` | Seed provenance clarification matches scope. |
| `eval/playground/README.md` | Removed stale count. |
| `eval/qa/README.md` | Lifecycle guidance remains current. |
| `ideas/README.md` | Research-only status remains clear. |
| `ideas/architecture-explorations.md` | Historical experiment text remains historical. |
| `ideas/observability-r2-retention.md` | Dated research remains dated. |
| `ideas/per-user-mcp-observability.md` | Dated research remains dated. |
| `inventory/README.md` | Cache description matches generated-inventory ownership. |

### PR #157

| File | Coverage result |
| --- | --- |
| `THIRD-PARTY-NOTICES.md` | New source row matches the pin record. |
| `catalog/manifest.json` | Current generated output has the folded-scalar defect. |
| `ecosystem-skills/INDEX.md` | Current generated output has only `>` as its description. |
| `ecosystem-skills/MANIFEST.json` | Pin hashes and timestamp are internally consistent. |
| `ecosystem-skills/PIN-REVIEW.md` | Pin review exists. It cannot replace a PR maintainer review. |
| `ecosystem-skills/README.md` | Root-mode documentation matches implementation. |
| `ecosystem-skills/build-index.mjs` | It repeats the folded-scalar parsing defect. |
| `ecosystem-skills/groups.json` | Group placement and `scripts/` exclusion are explicit. |
| `ecosystem-skills/update.sh` | It has the latent root-Markdown exposure defect. |
| `eval/gates.json` | Gate-input fingerprints change only for the catalog. Review evidence remains absent. |
| `eval/qa/cases.json` | Generated output matches the active case. |
| `eval/qa/corpus/battery/compliance-rwa-payments/q-tw-escrow-api-auth-custody.json` | Evidence and lifecycle findings apply. |
| `eval/qa/lifecycle-registry.json` | Generated proposed-to-active history is present. |
| `eval/qa/sample.json` | Generated sample matches the source case. |
| `research/skill-exposure-inventory.json` | Source row exists. It does not prove acceptance. |
| `scripts/check-skills-drift.mjs` | Root path normalization is consistent. |
| `scripts/lib/skill-mirror.mjs` | Digest and source URL checks remain intact. |
| `specs/super-spec.json` | Generated description has the folded-scalar defect. |
| `src/demo/page.ts` | Generated count change only. |
| `src/mcp/micro-map.ts` | Generated count change only. |
| `test/catalog.test.ts` | Count contract changed and passed. |
| `test/demo-page.test.ts` | Count contract changed and passed. |
| `test/qa-lifecycle.test.mjs` | Registry count changed and passed. |
| `test/search.test.ts` | Ranking count changed and passed. |
| `test/skill-exposure-classification.test.ts` | New inventory requirement passed. |
| `test/skills.test.ts` | Pinned transport count changed and passed. |

## GitHub issues and improvements

| Issue | Current state | Audit disposition | Next action |
| --- | --- | --- | --- |
| [#40](https://github.com/stellar-experimental/stellar-raven/issues/40) | Open; updated 2026-09-09 | Copying has local evidence. Authenticated production acceptance remains open. | Run the existing authorized browser check without a paid chat. |
| [#141](https://github.com/stellar-experimental/stellar-raven/issues/141) | Open, `drift`; updated 2026-09-16 | Metadata only. The issue records unresolved Scout drift. This audit did not regenerate a candidate. | Drift owner runs source and routing acceptance checks. |
| [#158](https://github.com/stellar-experimental/stellar-raven/issues/158) | Open | `sd-040` handoff claims a deployed Docs fix. GitHub state does not prove its trigger. | Improvements owner re-runs the original trigger. |
| [#159](https://github.com/stellar-experimental/stellar-raven/issues/159) | Open | `sd-041` handoff claims a deployed Docs fix. GitHub state does not prove its trigger. | Improvements owner re-runs the original trigger. |
| [#160](https://github.com/stellar-experimental/stellar-raven/issues/160) | Open | `sd-044` handoff claims a deployed Docs fix. GitHub state does not prove its trigger. | Improvements owner re-runs the original trigger. |
| [#161](https://github.com/stellar-experimental/stellar-raven/issues/161) | Open | `sd-045` handoff claims a deployed Docs fix. GitHub state does not prove its trigger. | Improvements owner re-runs the original trigger. |
| [#162](https://github.com/stellar-experimental/stellar-raven/issues/162) | Open | `sd-051` handoff claims a deployed Docs fix. GitHub state does not prove its trigger. | Improvements owner re-runs the original trigger. |

The improvements owner owns live triggers for #158 to #162.
This audit did not run those triggers or change their statuses.

## Branches and worktrees

`main` and `origin/main` are `722eef5f2a81845ebdd8206e17ee100344eabd58`.
`docs/cleanup-current-guidance` and its origin ref are `ac1769f75f72ba41622534f5f53b9c8944aeb69d`.
PR #157 comes from `armandocodecr/stellar-raven:feat/trustless-work-source` at `b447ff403f82734a0297b56c78a1a5515aa1f824`.
The shared checkout contains externally-owned round artifacts.
This audit preserved them.
It created detached temporary worktrees under `/tmp/raven-audit-2026-09-16/`.
One externally-owned detached drift worktree is registered.
No branch, stash, audit evidence directory, or external worktree was deleted.

### Cleanup dispositions

The durable [routing identity evidence](routing-identity-diff.json) has SHA-256 `971ad199e19557dc6115c19b347a86aed9070a5e9137f14a4b205e82f4eeacc9`.
The audit logs remain under `/tmp/raven-audit-2026-09-16/`.
The isolated `base-worktree` is clean at `722eef5f2a81845ebdd8206e17ee100344eabd58`.
The isolated `pr-157-worktree` is clean at `b447ff403f82734a0297b56c78a1a5515aa1f824`.
Their ignored files contain generated outputs, local caches, a placeholder `.dev.vars`, and symlinked dependencies.
They contain no unique unrecorded work.
The audit removed only those two worktrees after this check.
It kept `/tmp/raven-audit-2026-09-16/` and the external drift worktree.

## Verification evidence

```sh
/opt/homebrew/bin/gh api 'repos/stellar-experimental/stellar-raven/pulls?state=open&per_page=100'
/opt/homebrew/bin/gh api 'repos/stellar-experimental/stellar-raven/issues?state=open&per_page=100'
/opt/homebrew/bin/gh api 'repos/stellar-experimental/stellar-raven/pulls/156/files?per_page=100'
/opt/homebrew/bin/gh api 'repos/stellar-experimental/stellar-raven/pulls/157/files?per_page=100'
/opt/homebrew/bin/gh api graphql ...reviewThreads...
git fetch origin pull/157/head:refs/audit/pr-157
git worktree add --detach /tmp/raven-audit-2026-09-16/pr-157-worktree refs/audit/pr-157
npm test
npm run build
npm run test:smoke
npm run eval:qa:lint -- --stale --enforce-floors
npm run eval:qa:register -- --check
npm run improvements:lint
node scripts/check-pin-review.mjs --base 722eef5f2a81845ebdd8206e17ee100344eabd58
node eval/run-routing.mjs --dump-ranked /tmp/raven-audit-2026-09-16/base-ranked.json
node eval/run-routing.mjs --dump-ranked /tmp/raven-audit-2026-09-16/head-ranked.json
```

The isolated PR #157 run passed 2,074 unit tests and 94 smoke tests.
It passed build, QA lint, registry check, improvements lint, pin review, and routing gate.
The QA lint had 0 errors and 60 existing warnings.
The isolated run did not run `npm run typecheck`.
The temporary PR worktree was removed before this audit received the typecheck request.
Typecheck remains an explicit unrun limitation.
The first sandbox run failed from network, loopback, and GPG restrictions.
The escalated isolated run passed with loopback and public pinned-source reads.

## Limitations and next actions

GitHub state is evidence, not source, index, or production proof.
The #158 to #162 live triggers remain outside this audit's ownership.
The #141 candidate was not regenerated, tested, accepted, or deployed.
The #40 authenticated production check was not run.
The Trustless Work API received no request.

1. Hold PR #157 until all high findings and the CI blocker are resolved.
2. Require a human maintainer review after the corrected PR #157 head exists.
3. Review the five changed routing rows before a re-baseline claim.
4. Correct PR #156 `PLAN.md:22` before accepting its owner statement.
5. Keep #141 and #158 to #162 open until owners provide original-trigger evidence.
