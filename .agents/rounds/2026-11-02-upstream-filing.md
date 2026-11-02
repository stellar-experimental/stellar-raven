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

## Resolver pass: sd-056

On 2026-11-02 `sd-056` moved to `improvements/resolved.json`. stellar/stellar-docs#2930 is
deployed, and the live Ledgers page no longer has the error. Claude Fable 5.1 at high re-derived the
fix as the distinct reviewer: [`sd-056-retire-review.md`](2026-11-02-upstream-filing/sd-056-retire-review.md),
verdict RETIRE, no residual. The resolution comment is
https://github.com/stellar/stellar-docs/issues/2907#issuecomment-6588462663. This closes the handoff
issue #316. `sd-075` stays `fixed-upstream`: a golden `rootCause` cites it, and its evidence names
`TEMPLATE.mdx` line 135 as a possible residual. Review both before it retires.

## Resolver pass: sd-075

On 2026-11-02 `sd-075` moved to `improvements/resolved.json`. stellar/stellar-docs#2991 is deployed,
and the live Hello World page no longer calls `stellar contract build` a shortcut for plain
`cargo build`. Grok 4.7 at high re-derived the fix as the distinct reviewer:
[`sd-075-retire-review.md`](2026-11-02-upstream-filing/sd-075-retire-review.md), verdict RETIRE.
`TEMPLATE.mdx` is a draft page (404 on the site) and now uses `stellar contract build`, so it is no
residual. The golden `q-sor-build-target-wasm32v1` now points at the resolved receipt (truth
unchanged; clusters 095 and 129 re-swept). Raven did not file this finding; the resolution comment
is on the owner's issue: https://github.com/stellar/stellar-docs/issues/2974#issuecomment-6589044826.

Follow-up outside this finding: the reviewer saw `docs/build/smart-contracts/.../fuzzing.mdx` line
197 name the old `soroban contract build` CLI. That is a separate stale-name defect for the next
filing batch.

## HackMeridian findings (2026-11-02)

Source: `.agents/TODO.md` "File the HackMeridian upstream findings". Author: Claude Opus high
(lanes hm-f and hm-fix). Independent review: Grok 4.7 high,
[hackmeridian-review.md](2026-11-02-upstream-filing/hackmeridian-review.md), FILE-WITH-FIXES. Every
fix is applied. Live checks ran between 21:23Z and 22:05Z.

| Item | Outcome |
|---|---|
| stellar-dev-skill R04, R07+Q1, R08, R30, R34 (`sendTransaction`) | new `sk-033`, `sk-032`, `sk-034`, `sk-035`, `sk-036` |
| stellar-dev-skill R34 (`getTransaction`) | rejected: `data/SKILL.md` already lists the three values |
| Scout R31 issuer and asset class | new `sls-107` (AUDD and C1USD only; MGUSD matches its `ORG_NAME`) |
| Scout R10, R15 "Live" network | dropped: `unknown` is a declared state; `sls-024` keeps its residual |
| Scout R17, R23 audits | new `cs-009` against `Inferara/soroban-security-portal`; Scout mirrors the portal |
| Scout R36 partner SEPs | merged into `sls-098` (title broadened; no source shows Bitso SEP-24) |
| Scout R16, R18 repo ranking | new `sls-109` |
| Scout R24 rubric | new `sls-110` (weights only) |
| Scout R26, R27 descriptions and tracks | rejected: null descriptions are honest; all six 2025 tracks are set |
| Scout R28 SCF #45 | new `sls-111` |
| Scout Q2, Q18 MetaMask and Chainlink rows | new `sls-112` |
| Scout Q6 DEX sub-types | new `sls-113` |
| stellar-docs state-archival `+ 4095` | merged into `sd-063` (stellar/stellar-docs#3000, open) |
| stellar-docs "Building with AI" alias host | new `sd-079` |
| stellar-docs `llms.txt` alias host | not reproduced; `sd-079` fixes the source page |
| Lumenloop R21 weekend roundup | not recorded: the semantic search needs a live keyed call to re-run |

`sls-108` is an unused id: the portal finding moved to `canonical-source` before any commit. The
upstream issue links are in each finding file.
