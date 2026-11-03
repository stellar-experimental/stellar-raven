# HackMeridian golden proposals — 2026-11-03

## Outcome

Lane hm added two proposals. The 501-case battery and its sample remain unchanged.
The registry reserves 507 IDs, including six proposals.
The author updated the lifecycle test's proposal-count checks.
Independent activation review remains outstanding.
The brief prohibited sub-agents, paid calls, activation, commits, and upstream changes.

## Coverage decisions

| Topic | Decision | Evidence |
| --- | --- | --- |
| R04, nested `try_*` results | Existing case | `q-sor-decode-hosterror-codes` requires both result layers and shows each common branch. |
| R20, next Testnet reset | New proposal | `q-infra-testnet-reset-schedule-recovery` asks for the published date and recovery steps. |
| R23, OpenZeppelin version and audits | Existing case | `q-soroban-oz-token` records v0.8.0 and release-scoped audit coverage. |
| R31, stablecoin issuers | Existing case | `q-asset-stablecoin-issuers-discovery` asks which companies issue stablecoins on Stellar. |
| Q18, Testnet oracle addresses | New proposal | `q-sor-reflector-testnet-contract-addresses` requires three full, labeled Reflector Testnet addresses. |

The existing Reflector integration case covers ABI, argument encoding, traps, and Mainnet examples.
The new proposal tests a direct Testnet deployment lookup.
A reviewer must confirm that boundary before activation.

## Public-source matrices

Each proposal contains complete claim-level rows under `truth.corroboration`.
All observations have the date 2026-11-03.

| Proposal | Claim | Classes | Public evidence |
| --- | --- | --- | --- |
| R20 | Networks lists December 16, 2026 as the next reset | A, B | [Networks](https://developers.stellar.org/docs/networks), [repository source](https://github.com/stellar/stellar-docs/blob/main/docs/networks/index.mdx) |
| R20 | Resets clear ledger state and history | A, B | [Networks](https://developers.stellar.org/docs/networks), [operator procedure](https://github.com/stellar/packages/blob/master/docs/testnet-reset.md) |
| R20 | Recreate test state and synchronize Horizon | A, B | [Networks](https://developers.stellar.org/docs/networks), [operator procedure](https://github.com/stellar/packages/blob/master/docs/testnet-reset.md) |
| Q18 | All three full addresses have Testnet deployments and the stated feed labels | A, C, F | [Oracle Providers](https://developers.stellar.org/docs/data/oracles/oracle-providers), [operator configuration](https://orchestrator-testnet.reflector.network/config), live interface reads on Testnet RPC |
| Q18 | The DEX feed's data source differs from its deployment network | A, C | Oracle Providers and operator configuration |
| Q18 | Testnet RPC reports the documented passphrase | A, F | Networks and live `getNetwork` |
| Q18 | An interface read does not prove price freshness or correctness | B, F | [provider README](https://github.com/reflector-network/reflector-contract/blob/master/README.md), separate interface and simulation reads |
| Q18 | Resets require deployment checks | A, B | Networks and its repository source |

The schedule page and its repository source share one editorial origin.
The proposal states the published schedule, rather than claiming independent announcements or a guaranteed future event.
The next verification dates are 2026-12-02 for R20 and 2026-12-09 for Q18.
Neither proposal fixes an event hour or a permanent contract roster.

## Verification

The compiler preserves the 501-case battery and the 30-case sample byte-for-byte.
The registry changes only the two proposal records and their membership counts.
The consistency helper reports zero reopened groups.

Required commands passed:

- `npm run eval:qa:compile`
- `npm run eval:qa:register`
- `npm run eval:qa:lint -- --since origin/main --stale --enforce-floors`
- `npm run eval:qa:register -- --check`
- `npm test`

The final lint reports zero errors and 93 existing battery warnings.
The final test run passes 144 files and 3122 tests, with three expected failures.
The first test run exposed the old proposal-count checks; the author updated them and repeated the suite.
Proposal-only surface, authoring, avoid, corroboration, and freshness checks report zero findings.
The author also verified generated-file scope and ran `git diff --check`.

## Remaining activation work

Keep each new ID in a proposal commit before a later activation commit.
Obtain an independent duplicate, boundary, and truth review before activation.
Add live source sentinels after activation; the current sentinel validator accepts battery cases only.
Use the Networks date and Oracle Providers Testnet table as the proposed sentinel anchors.
No saved answer or plan grade changed, and no paid evaluation ran.
