# 2026-11-02 — upstream filing for official-source findings

## Scope

The owner asked for active upstream fixes where official sources are wrong (decision D1 in
`2026-11-02-grading-policy.md`; ADR-0008 amendment of 2026-11-02). This round covers every
`verified` finding in `improvements/stellar-docs/` and `improvements/canonical-source/` that the
2026-11-02 golden audit left unfiled.

## Method

1. Four read-only agents (Opus 5.5) re-checked each defect live, ran the skill's calibration checks,
   deduped against open and closed upstream issues and PRs, and read each rendered issue as a
   maintainer. Their reports set the verdicts below.
2. Four applier agents applied the report edits to disjoint finding files.
3. The orchestrator committed and pushed the edits (`cb9360f3`), so each issue body links an
   immutable snapshot that matches the filed text. Then it filed through
   `npm run improvements:file`.

## Results

Filed (15):

| finding | issue |
|---|---|
| `sd-060` | stellar/stellar-docs#2997 |
| `sd-061` | stellar/stellar-docs#2998 (cites draft PR #2752) |
| `sd-062` | stellar/stellar-docs#2999 |
| `sd-063` | stellar/stellar-docs#3000 |
| `sd-065` | stellar/stellar-docs#3001 |
| `sd-066` | stellar/stellar-docs#3002 |
| `sd-067` | stellar/stellar-docs#3003 |
| `sd-068` | stellar/stellar-docs#3004 |
| `sd-069` | stellar/stellar-docs#3005 |
| `sd-071` | stellar/stellar-docs#3006 (cites draft PR #2673) |
| `sd-072` | stellar/stellar-docs#3007 |
| `sd-073` | stellar/stellar-docs#3008 |
| `cs-003` | stellar/stellar-protocol#2055 |
| `cs-004` | circlefin/stellar-cctp#36 |
| `cs-005` | circlefin/stellar-cctp#37 |

Pre-existing upstream work, no new issue (3): `sd-064` (PR #2945, open), `sd-070` (draft PR
#2763), and `sd-074` (PR #2708, open). Each moved to `reported-upstream` with the PR in its
evidence.

Fixed upstream during the round (1): `sd-075`. PR stellar/stellar-docs#2991 merged at
2026-11-02T20:13:29Z, and the live Hello World page no longer calls plain `cargo build` an
equivalent. The finding is `fixed-upstream`, and `q-sor-build-target-wasm32v1` notes record the fix.

Not filed (3):

- `sd-077` (stellar.org Marketing Grants pages) and `cs-006` (Paxos `stellar.toml`): no public
  tracker. Their intake rule is `unclear`. They need a direct contact with the page owner.
- `cs-007` (a third-party project README): not an official source, so it is out of this round's
  scope.

## Follow-ups

- Re-check each filed issue when its owner responds. A closed issue or merged PR is evidence to
  inspect, not proof of a fix.
- Retire `sd-075` to `improvements/resolved.json` in the next resolver pass.
