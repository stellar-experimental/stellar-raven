# Run 2.1 report: Bell Mainnet vote

- **Outcome: A, activated.** Mainnet runs Protocol 30 (Bell) from ledger 65633432, closed
  2026-11-23T17:00:06Z; ledger 65633431 (17:00:01Z) is Protocol 29.
- **Lead:** Claude Opus 5.5 (`claude-opus-5-5`), agentpc `t245`, timer-started.
- **Pull request:** see the PR for this branch (`np/2.1-bell-goldens`); the post-merge report
  records the merge commit.
- **Deploy:** not needed (`eval/qa` data, one test, records; no Worker bytes change).
- **Exposure: 1.** A gate printed one warning naming a case this run may not open. It was not used,
  and the id sits in `~/.local/state/raven-dated/2.1-EXPOSURE.txt`, which is not committed.
- **Launcher:** at 18:00:04Z it logged "readiness could not be established" (`FAILED-2.1.txt`,
  alert issue #552) after 2 seconds of idle checks, but this lead started and ran the whole run. The
  readiness check needs a fix; that is outside this run's write set.

## Ids edited

`q-edge-fresh-latest-protocol-version`, `q-pc-protocol-upgrade-timing`,
`q-protocol-version-history-list`, `q-hist-quantum-preparedness-plan` (judge-blind only),
`q-pc-quantum-preparedness-dormant`, `q-protocol-ledger-close-time` (`truth.notes` only). New
`reverifyBy`: edge 2027-02-15, timing 2027-02-22, history 2027-03-01, quantum 2027-03-08. The
Software Versions case stays with run 2.2a (due 2026-11-30): at 18:00Z its page still headed
"Protocol 29 (Mainnet, October 1, 2026)".

Sentinels: `mainnet-protocol-29`, `-29-latest` and `-29-history` became `mainnet-protocol-30`,
`-30-latest` and `-30-history`. `bell-mainnet-vote-scheduled` was replaced by
`next-mainnet-upgrade-vote-absent` (an event-name check on the upcoming status feed) and
`protocol-upgrades-no-protocol-31` (`https://stellar.org/protocol-upgrades`). The staged
sentinel-test edit (PRESTAGE section 5) is applied.

## Evidence rows (observed 2026-11-23)

| Claim | Class | URL | observedAt | Value or quote |
|---|---|---|---|---|
| Mainnet `current_protocol_version` | F | `https://horizon.stellar.org/` | 18:01Z | 30; `core_supported_protocol_version` 30; `stellar-core 30.0.0` |
| Mainnet protocol (RPC) | F | `https://mainnet.sorobanrpc.com` `getLatestLedger` | 18:00Z | `protocolVersion` 30, ledger 65634153 |
| First P30 ledger L and L-1 | F | `https://horizon.stellar.org/ledgers/65633432`, `/65633431` | 18:01Z | 17:00:06Z P30; 17:00:01Z P29 |
| Bell guide schedule line | A | `https://stellar.org/blog/developers/bell-protocol-30-upgrade-guide` | 18:00Z | "November 23, 2026, 1700 UTC—Mainnet upgrade vote" |
| Status feed row (proves nothing) | C | `https://status.stellar.org/api/v2/scheduled-maintenances.json` | 18:00Z | "Stellar Public Network Protocol Upgrade Vote", completed, 17:00 to 17:05 |
| `stellar-core` P30 release | B | `https://github.com/stellar/stellar-core/releases/tag/v30.0.0` | 18:01Z | v30.0.0 (2026-10-16), newest; no v31 tag or release |
| CAP-0084, -0087, -0088 | B | `stellar/stellar-protocol` `core/cap-00NN.md` | 18:01Z | Muxed Contract Addresses; ML-DSA signature verification; Millisecond-Resolution Close Times; each Implemented, Protocol 30 |
| P30 headline (second class) | A | `https://stellar.org/protocol-upgrades` | 18:02Z | "muxed contract addresses, post-quantum signature verification in smart contracts, and millisecond ledger close times" |
| Next Mainnet vote: none announced | C, A, B, D | upcoming status feed; protocol-upgrades page; core releases and tags; CAP-0089 and CAP-0090 (Draft, Protocol version 31); one built-in web search | 18:01Z | upcoming `[]`; page names Bell only; no v31; a draft CAP is not a scheduled vote; the search found no Protocol 31 vote |

## Gates (run bare by the lead at the final head)

- `eval:qa:compile`: exit 0, no further change.
- `eval:qa:lint -- --since origin/main --stale --enforce-floors`: exit 0, 0 errors, 99 warnings.
  One warning is new: timing key fact 3 runs 100 characters against a 90-character style
  guideline.
- `eval:qa:register`: exit 0, up to date. `-- --check`: exit 0.
- `eval:qa:sentinels -- --ids` (the five above): exit 0, all hold.
- `eval:selftest`: exit 0. `npm test`: exit 0 (174 files, 4166 tests). `secrets:scan -- --tree`: exit 0.
- Parsed `cases.json`: 247 cases before and after; exactly the six ids above differ.

## Register

Reopened by the edit: 17. Closed: 0, under the all-or-none rule (PRESTAGE section 6). No `reSwept`
was written, and the count is recorded in `.agents/TODO.md`. Hand-edited while still open: the Bell
trap (`triggerDateEvent`, and `disposition` with quoted `reverifyBy` dates equal to the cases), the
activation-history invariant, and the P29 or Bell tails of six cluster notes.

`sibling-check.mjs` last line: "pending-state matches among the cases this lane may not open: 0".

## Reviews

- **Plan review:** Claude Fable (`claude-fable-5-2`), high. 13 findings, all adopted
  ([REVIEW.md](REVIEW.md)).
- **Re-derivation reviewer:** Codex Sol tier (`gpt-6.2-sol`, resolved at launch), high, read-only.
  It ran without the lead's notes or evidence tables ([CODEX-REVIEW.md](CODEX-REVIEW.md)). 43 claim
  rows: all changed claims confirmed. One finding was a blocker: an evidence note said CAP-0089 and
  CAP-0090 had no protocol version, but both name Protocol 31. That note is fixed. Of 8 findings, 4
  were adopted, 1 in part, and 3 declined with reasons; the executor reconciled them
  ([EXEC.md](EXEC.md)).
- **Executor:** Claude Sonnet 5.5 (`claude-sonnet-5-5`), high.

## Deviation from PRESTAGE

On the upgrade-timing case, PRESTAGE section 4's SDK sentence ("SDKs must support a new protocol
before that network's upgrade vote") was replaced by wording tied to the source. The Bell guide
limits its requirement to "this cycle", and the Protocol 29 security release had no SDK deadline.
The new answer says deadlines come from each upgrade's SDF guide and that none is announced for a
next upgrade. The new key fact is "Reports any SDK-upgrade deadline from the target network's
upgrade guide, or that none is announced." Both reviewers raised this.

## Spend

No model-calling eval, no paid call, no stored-row re-judge (stored verdicts on the edited ids
predate the change). Three subscription CLI children, and USD 0 on APIs.
