# Stale-gospel refresh

Date: 2026-09-01
Status: complete; merged as `8ee41f3` (PR #115)
Branch: `maintenance/stale-gospel-2026-09-02`
Pull request: `#115`
Base: `8c0f0069dff2f5b1d8d69666bd779dff994c6f08`
Author and orchestrator: Codex GPT-5.6 Sol

## Trigger

The free release preflight crossed midnight UTC during the agent-discovery guard round.
`npm run eval:qa:lint -- --stale` found seven cases with `truth.reverifyBy: 2026-09-01`.
CI runs this gate, so the stale cases must be reverified before the guard release can merge.

## Scope

The affected IDs are:

- `q-sor-confidential-tokens`
- `q-sor-evm-to-soroban-porting`
- `q-sor-reflector-integration-code`
- `q-soroban-av-passkeys-talk`
- `q-ti-openzeppelin-relayer`
- `q-ti-friendbot-ratelimit-alternatives`
- `q-ti-testnet-usdc-faucet`

This round re-verifies current truth with at least two source classes per volatile claim.
It updates judge-facing gospel only when current evidence requires a correction.
It never bumps a date without a dated evidence record and a sibling sweep.
It makes no paid Lumenloop call and does not invoke a faucet.

## Route cards

### Soroban privacy, migration, and Reflector

Worker CLI: Claude.
Model: Fable 5.
Effort: high.
Cases: `q-sor-confidential-tokens`, `q-sor-evm-to-soroban-porting`, and
`q-sor-reflector-integration-code`.
Source mix: official docs, source repositories, CAP/SEP text, and read-only live surfaces.
Output: `.agents/rounds/2026-09-01-stale-gospel-refresh/soroban-core-matrix.md`.

### Passkeys and OpenZeppelin Relayer

Worker CLI: Grok.
Model: Grok 4.6.
Effort: high.
Cases: `q-soroban-av-passkeys-talk` and `q-ti-openzeppelin-relayer`.
Source mix: official event/docs pages, vendor source/releases, and independent current checks.
Output: `.agents/rounds/2026-09-01-stale-gospel-refresh/passkeys-relayer-matrix.md`.

### Friendbot and Testnet USDC

Worker CLI: Codex.
Model: GPT-5.6 Terra.
Effort: high.
Cases: `q-ti-friendbot-ratelimit-alternatives` and `q-ti-testnet-usdc-faucet`.
Source mix: official Stellar docs, Circle/provider docs, source or protocol semantics, and
read-only service checks.
Output: `.agents/rounds/2026-09-01-stale-gospel-refresh/testnet-funding-matrix.md`.

### Final review

Worker CLI: Claude.
Model: Opus 5.
Effort: high.
Scope: the complete diff, all matrices, generated outputs, consistency closures, and improvement routing.
Outputs:

- `.agents/rounds/2026-09-01-stale-gospel-refresh/review-final-opus.md`
- `.agents/rounds/2026-09-01-stale-gospel-refresh/review-delta-opus.md`
- `.agents/rounds/2026-09-01-stale-gospel-refresh/review-closure-opus-2.md`
- `.agents/rounds/2026-09-01-stale-gospel-refresh/review-closure-opus-2-delta.md`
- `.agents/rounds/2026-09-01-stale-gospel-refresh/review-closure-opus-2-final.md`

## Authorization

| Action | State |
| --- | --- |
| Primary-source web and repository reads | authorized |
| Free read-only service checks | authorized |
| Paid Lumenloop research | prohibited |
| Faucet or other value-changing request | prohibited |
| Golden edits | authorized only after matrix reconciliation |
| Deployment | not applicable |

### Authorization deviation

A reviewer called the documented Channels key-issuance endpoint while treating a `GET` as read-only.
`https://channels.openzeppelin.com/gen` returned HTTP 201 and issued an API key. The reviewer did
not record, use, or expose the key. No relay, payment, faucet, or other value-changing action
followed. The golden-truth skill now treats provisioning, issuing, and creation endpoints as side
effects regardless of their HTTP method.

## Matrix reconciliation

| Case | Verdict | Gospel action | Next review |
| --- | --- | --- | --- |
| `q-sor-confidential-tokens` | confirmed | Refresh the dated Testnet-preview observation and provenance. | 2026-12-15 |
| `q-sor-evm-to-soroban-porting` | confirmed | Refresh provenance for unchanged SEP-57 and Solang status. | 2026-12-01 |
| `q-sor-reflector-integration-code` | live-site claim contradicted; Beam deployment unverifiable | Replace the obsolete live-site `x_last_price` conflict and qualify the published Beam evidence. | 2026-11-01 |
| `q-soroban-av-passkeys-talk` | confirmed | Refresh the current operation and response-shape evidence. | 2026-12-10 |
| `q-ti-openzeppelin-relayer` | corrected | Update v1.8.0, fair-use terms, inactive Statuspage, and the canonical-page caution. | 2026-11-24 |
| `q-ti-friendbot-ratelimit-alternatives` | confirmed | Refresh current Friendbot, Quickstart, Validation Cloud, and Circle evidence. | 2026-12-01 |
| `q-ti-testnet-usdc-faucet` | corrected | Remove the unverified named Lab distribution route and refresh the issuer/faucet date. | 2026-12-01 |

The sibling sweeps found no contradiction. The register helper reopened six clusters and one date
trap because member hashes changed. Each entry received a dated authored reconciliation.
The durable review input is `register-review.json` in this round directory.

The funding sources were observed on 2026-09-01. The orchestrator reconciled those matrices on
2026-09-02, so their `truth.asOf` and `truth.verified.date` values intentionally differ.

## Improvement follow-up

The Stellar Docs alias conflict still reproduces. The round added a 2026-09-02 recurrence to
`improvements/stellar-docs/sd-039-openzeppelin-relayer-conflated-with-managed-channels.md`.
Issue `stellar/stellar-docs#2707` remains open without comments or maintainer activity.
The round posted no recurrence-only comment.

The Reflector README Beam example points to a verified Pulse contract ID. This is a
`canonical-source` defect in `reflector-network/reflector-contract`, not an exposed-service defect.
The final review kept it ledger-only. No existing improvements collection or intake owner applies,
and no own-repo correction belongs in `.agents/TODO.md`.

## Validation plan

- Reconcile every claim matrix before editing.
- Run a sibling-consistency sweep for each changed case.
- Run `npm run eval:qa:compile`.
- Run `npm run eval:qa:register`.
- Run `npm run eval:qa:lint -- --since main --stale`.
- Run the release baseline and secret scan.
- Obtain an independent Opus 5 high final review.

## Outcome

All three verification lanes completed. Seven case edits and their generated corpus outputs are
present. The improvements index and lint pass with 66 active findings.

The register review closed six clusters and one date trap. `eval:qa:register -- --check` passes.
The stale lint reports zero errors and the same 62 warnings as `main`.

The independent claim review and delta review passed after all findings were reconciled. A second
Opus review found five safety gaps in the new register review path. The round fixed all five gaps.
The final bounded review returned `PASS` with no remaining finding on that path.

Final validation passes `eval:selftest`, `eval:qa:compile`, the register check, stale lint,
`improvements:lint`, typecheck, the full test suite, the build, the secret scan, and diff check.
No saved `eval/qa/results` directory exists for a saved-answer rejudge or plan regrade.
No product deployment was required.
PR #115 merged into `main` as `8ee41f3` on 2026-09-02.
Task-state cleanup is complete.
