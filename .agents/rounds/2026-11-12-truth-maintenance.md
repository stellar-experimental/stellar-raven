# Truth maintenance 2026-11-12

## Scope

Owner request: a truth-maintenance pass on #223 (live drift) and #167 (RWA routing) plus related
remaining work, then the drift, issue and improvements comb again.

Starting state at `origin/main` 8cb76750: no open PRs; open issues #223, #167, #422 (golden
sentinels: `scf-rfp-q4-roster` and `scf-rfp-q4-tooling-roster` drifted) and five inbound Scout
handoffs, #417–#421 (sls-101, sls-115, sls-024, sls-033, sls-111). 81 active findings. The
stale-gospel gate was green.

## Lane plan

Coordinator: Claude Opus 5.5 (hc t2dn). Worktree `/private/tmp/claude-501/raven-wt/tm-1112`
(branch `tm-2026-11-12`); `tm-1112-base` held a clean `origin/main` checkout for the routing
comparison.

| Lane | hc | Tier / model / effort | Role |
|---|---|---|---|
| rv-drift | t3q3 | Codex frontier / `gpt-6-astra` / high | Independent review of the Scout 1.9.135 absorb |
| comb-scout-ll | t3q4 | Codex workhorse / `gpt-6.1-sol` / high | Comb: Scout and Lumenloop findings, handoffs #417–#421 |
| comb-other | t3q5 | Codex workhorse / `gpt-6.1-sol` / high | Comb: Docs, skills, canonical-source, Workers AI provider |
| rv-gold | t3qc | Claude Fable / `fable` / high | Golden corroboration matrix for #422, then review of the coordinator's golden edits |
| rv-retire | t3r6 | Codex frontier / `gpt-6-astra` / high | Distinct retirement review of the Scout fixed candidates |
| gold-caps | t3rg | Codex workhorse / `gpt-6.1-sol` / high | Golden author for the sls-024/sls-029 caps (follow-up change, worktree `caps-1112`) |

Reviewer selection: the Scout candidates were authored by a Codex workhorse lane, so the
retirement reviewer is Codex frontier (dense live re-derivation). The coordinator authored the
drift absorb, so its reviewer is Codex frontier as well. Golden edits were authored by the
coordinator; Fable reviews them for grading and product judgment.

## Drift verdict

Issue #223 (last CI update 2026-11-12T06:32Z). Regenerated locally with read keys:

- `inventory/stellar-light.json`: Scout spec 1.9.127 → 1.9.135. `diff-inventory.mjs surface` exit
  0 (no operation added, removed or renamed; all twelve exclusions remain). `text` exit 1:
  `getLeaderboard` and `getStablecoins` change description text, and `getStablecoins` drops the
  `gyen` keyword. `deep` exit 1: four shared schemas change (`LeaderboardProject`, `Project`,
  `Repo`, `Stablecoin`). Model-visible schemas move on nine exposed operations, and derived
  routing keywords on twelve. Class: routing-relevant text plus model-visible schema drift. No
  runner declares an affected operation.
- `inventory/lumenloop.json`, `inventory/stellar-docs.json`: unchanged.
  `inventory/stellar-docs-titles.json` stays on its held bytes (the Docs-title hold continues).
- Anchors: 977 pages, 0 changed, 0 removed.
- Routing: all 544 rows compared against a clean `origin/main` run. No grade changes and every
  accepted total is identical. Three top-five lists move without grade effect:
  `q-eco-most-active-defi-projects` reorders (`scout.getLeaderboard` 5 → 4);
  `q-aas-publish-asset-metadata-toml` admits `scout.explainRepo` and drops `scout.vetIdea`;
  `q-holdout-c-15-launch-copy` admits `scout.searchRepos` at 5 and drops `stellarDocs.search_docs`,
  with no forbidden capture. Only the manifest fingerprint moves: `eval/gates.json` evidence is
  re-baselined to manifest SHA-256 `3766a77e…c711` with this acceptance note.

Independent review (rv-drift,
[review-drift-astra.md](../../research/audits/2026-11-12-truth-maintenance/review-drift-astra.md)):
approve with changes. F1: the first note said "three rows reorder"; corrected to one reorder plus
two membership swaps. F2: the note cited this ledger before it existed; this file resolves it.
F3 (handoff): six Scout records gained schema fields that address them; their status changes only
on live rechecks (see the improvements verdict). The reviewer reran typecheck (after
`npm run typegen`), `npm test` (3,388 passed), build, secrets scan and `git diff --check`.

Model-facing: the catalog and spec change, so production needs a deploy.

#223 stays open: the Docs-title hold and the general routing repair are its remaining close
conditions. #167 stays open: Cloudflare agents#2296 is still open with no comments (last update
2026-09-17), and `@cloudflare/codemode` 0.5.6 is out while the repository pins 0.5.1; neither
moves the RWA close condition, which needs an owner-authorized general routing repair. No comment
on either.

Horizon monitor (free direct Scout reading, 2026-11-12T14:29:58Z, by comb-scout-ll): answer `30`,
`answerSource` `stellarlight-code-scan`, `scannedRef` `6a13f418…`; the source at that ref defines
`MaxSupportedProtocolVersion uint32 = 30` (`internal/ingest/main.go:38`). The answer equals its own
scan for the first time since November 6. See sls-115 below.

## Eval verdict

No eval instrument beyond the routing gate was needed. The drift moves no grade; no paid run.

## Golden verdict

Trigger: #422. The official SCF RFP Track page
(`stellar/scf-handbook` commit `4cc1fae3`) published two Q4 briefs on 2026-11-11: T1 "Web and API
Analytics for Stellar Ecosystem Projects" and T2 "XDR/CAP-Coverage Audit Tool and Indexer-Hardening
Guide". Scout lags: `/api/rfps` reports no open brief and its roster was checked 2026-11-04.
SCF #46 is in Initial Review.

Corroboration: the Fable matrix
([golden-rfp-matrix.md](../../research/audits/2026-11-12-truth-maintenance/golden-rfp-matrix.md))
with classes A (handbook page and commit), C (Scout `/api/rfps`, communityfund awards) and D.

| Case | Change |
|---|---|
| q-scf-open-rfps | names T1 and T2 (2026-11-11), the Scout lag and the #46 phase; key fact flags Scout/official disagreement in either direction |
| q-scf-rfp-tooling | adds T1/T2 scope (T2 is tooling for indexer authors, not an indexer); "community vote" trap narrowed to a per-brief vote claim |
| q-scf-open-rfps-live, q-scf-passkey-rfps-live | 2026-11-05 "no open brief" sentence replaced; disagreement flag in either direction |
| q-scf-rfps-hackathons-live | same sentence; hackathon recheck added (Waterloo active Nov 2–18) |
| q-scf-contract-verification-rfp-live | same sentence |

All six carry `truth.verified` 2026-11-12 with `rootCause` `freshness-drift`. Both sentinels,
`scf-rfp-q4-roster` and `scf-rfp-q4-tooling-roster`, anchor the full two-brief roster
(`caseAsOf` 2026-11-12) and hold live. Register clusters 011, 030, 081, 085, 089 and the SCF #46
date-contingent trap were re-swept consistent; `register --check` is up to date.

Review (rv-gold,
[review-gold-fable.md](../../research/audits/2026-11-12-truth-maintenance/review-gold-fable.md)):
approve with changes. All ten findings were applied:

1. Each sentinel anchored one title, so a third brief raised nothing and a one-brief change
   flagged only one case. Both now use the reviewer's full-roster pattern.
2. The notes now grade a Scout-only answer: dating and attributing Scout's empty set, citing the
   2026-11-04 roster check, and marking the official cross-check unverified meets the roster and
   disagreement facts. The `-live` notes accept "flagged or marked unverified".
3. The tooling avoid item now reads "Do NOT claim RFP Track proposals are selected by community
   vote": the handbook's quarterly vote approves the RFP set, so a per-brief vote trap could fire on
   a true claim. Register cluster 089's reason matches.
4. The two primary cases gained `confirmed-as-of` corroboration rows (roster: A, B, D; Scout's
   reading: C; round state: A, C) and two sources.
5. The round state is attributed to the Awards page and Scout, not "both sources".
6. The Scout-lag sentence is dated.
7. The contract-verification case's evidence now covers its closed Q2 row.
8. Evidence timestamps, the matrix/sweep separator and the omitted
   `q-scf-hummingbot-kelp-closed-rfp` sweep member are fixed.
9. Unrelated `\u` escape churn in `source-sentinels.json` is reverted.
10. The cluster-011 member count reads "thirteen".

The fixes reopened the same six register entries; the re-sweeps stand and were closed again.

#422 closes on the first clean sentinel run after merge.

Look-ahead (next four weeks): three protocol cases due 2026-11-24 (Mainnet vote November 23),
`q-hist-quantum-preparedness-plan` (12-01), `q-infra-testnet-reset-schedule-recovery` (12-02),
`q-scf-current-round` (12-04), `q-sor-reflector-testnet-contract-addresses` (12-17). All are already
queued in `.agents/TODO.md` against their events.

Upstream candidates, not filed: the Scout RFP roster lag, because the operator's own nightly check
already reports it
([stellarlight#847](https://github.com/Stellar-Light/stellarlight/issues/847#issuecomment-6826003546),
2026-11-12T14:14Z) and it is one day old (see own-repo todos); the handbook page's dead
`ideas.stellarlight.xyz` link (minor).

## Improvements/issues/PR verdict

Comb reports:
[comb-scout-lumenloop.md](../../research/audits/2026-11-12-truth-maintenance/comb-scout-lumenloop.md),
[comb-other.md](../../research/audits/2026-11-12-truth-maintenance/comb-other.md).

**Scout and Lumenloop.** Six Scout findings have fixed-candidate evidence (upstream PRs
1942/1943/1945/1946/1947/1948 merged 2026-11-12 with green checks; Scout serves 1.9.135):
sls-024, sls-029, sls-033, sls-101, sls-111, sls-115. sls-107 still reproduces its issuer-of-record
residual (37/37 issuer fields null; PR1923's data job not run) while its asset classes improved.
sls-039 keeps its accepted declined boundary. ll-022/023/024 stay inconclusive. All other
Lumenloop refs are unchanged since the sweep.

Retirement review (rv-retire,
[review-retire-astra.md](../../research/audits/2026-11-12-truth-maintenance/review-retire-astra.md)):
the reviewer re-derived every claim from GitHub and fresh live GETs without reading the author
lane's report.

| Finding | Trigger | Upstream ref | Ref state | Live re-check | Repo action |
|---|---|---|---|---|---|
| sls-101 | handoff #417 | [stellarlight#1912](https://github.com/Stellar-Light/stellarlight/issues/1912), [PR1943](https://github.com/Stellar-Light/stellarlight/pull/1943) | closed; merged 00:53Z, refresh run succeeded | fixed: total 185,490,765 over 10 rows, 0 stale; Spiko/Etherfuse null with dated reasons; Sentora remapped | retired |
| sls-115 | handoff #418 | [stellarlight#1933](https://github.com/Stellar-Light/stellarlight/issues/1933), [PR1942](https://github.com/Stellar-Light/stellarlight/pull/1942) | open; merged 00:42Z | fixed: answer 30 from the code scan, explicit 29-vs-30 conflict at the matching `scannedRef` | retired |
| sls-111 | handoff #421 | [stellarlight#1903](https://github.com/Stellar-Light/stellarlight/issues/1903), [PR1946](https://github.com/Stellar-Light/stellarlight/pull/1946) | open; merged 01:34Z | fixed for round 45: 40/40 source-page identities; earlier rounds still miss awards | retired; successor sls-116 filed as [stellarlight#1952](https://github.com/Stellar-Light/stellarlight/issues/1952) |
| sls-024 | handoff #419 | [stellar-scout#9](https://github.com/Stellar-Light/stellar-scout/issues/9), [stellarlight#494](https://github.com/Stellar-Light/stellarlight/issues/494) | closed; PR1947 merged 03:16Z | fixed: 1,020 rows, all 99 positive deployments sourced and dated | RETIRE; waits for golden cap reconciliation |
| sls-029 | spec 1.9.134 | [stellarlight#514](https://github.com/Stellar-Light/stellarlight/issues/514), [#742](https://github.com/Stellar-Light/stellarlight/issues/742) | closed; PR1948 merged 03:28Z | fixed: 28 oracle records with product, network, address source and dated observations | RETIRE; waits for golden cap reconciliation |
| sls-033 | handoff #420 | [stellarlight#519](https://github.com/Stellar-Light/stellarlight/issues/519) | closed; PR1945 merged 01:23Z | partial: 74 rows typed and dated; 9 of 12 unavailable platform facts have no source URL | KEEP; result posted |
| sls-107 | schema drift | [stellarlight#1900](https://github.com/Stellar-Light/stellarlight/issues/1900) | closed; PR1923 needs an owner data job | still-repro: 37/37 issuer fields null; classes improved | none |

Successor sls-116: the coordinator re-read two of its four examples (Passkey UI round 44 awarded
officially and absent from Scout; StellarPay round 30 in Scout with no source while the official
page shows round 2 Awarded and round 30 Not Awarded) before filing.

Resolution comments (all read back, author kalepail):
[1912](https://github.com/Stellar-Light/stellarlight/issues/1912#issuecomment-6827173413),
[1943](https://github.com/Stellar-Light/stellarlight/pull/1943#issuecomment-6827173800),
[1933](https://github.com/Stellar-Light/stellarlight/issues/1933#issuecomment-6827174175),
[1942](https://github.com/Stellar-Light/stellarlight/pull/1942#issuecomment-6827174551),
[1903](https://github.com/Stellar-Light/stellarlight/issues/1903#issuecomment-6827174998),
[1946](https://github.com/Stellar-Light/stellarlight/pull/1946#issuecomment-6827175523); sls-033
result on [519](https://github.com/Stellar-Light/stellarlight/issues/519#issuecomment-6827190900).

sls-024 and sls-029 back partial caps in five goldens (`q-defi-named-newer-protocols`,
`q-eco-stellar-wallets-list`, `q-pc-l2-payment-channels-starlight`, `q-hist-remittance-corridors`,
`q-defi-reflector-oracle`). ADR-0008 removes a cap with its finding, so their retirement lands in a
follow-up change with a golden lane (gold-caps, hc t3rg, Codex workhorse `gpt-6.1-sol` high) and
an independent review. Handoff #419 stays open until then.

Active findings: 81 → 79 (three retired, one filed).

**Docs, skills, canonical source, Workers AI provider.** 36 findings, 42 refs read; no fixed or
superseded candidate.

- sd-074: [PR2708](https://github.com/stellar/stellar-docs/pull/2708) moved from mergeable to
  CONFLICTING/DIRTY (base drift, no new activity); both served pages still name
  `environments.toml` while the CLI uses `scaffold.yml`. Recorded here; no upstream comment.
- Author-owned [stellar-protocol#2059](https://github.com/stellar/stellar-protocol/pull/2059):
  open, REVIEW_REQUIRED, BEHIND, all checks green, no review activity. No action.
- Probes recur for sk-005/007/014/015/022 and cs-004/005/006/007; skills sk-019/027/028/031 and
  cs-006 rechecks still reproduce. Recurrences stay in this ledger, following the November 10
  practice.
- New signal, not a finding: Scout `/api/skills` self-reports `agent-browser-webauthn` as
  unreachable (58 listed, 57 served) while `meta.partial` is false.

## Own-repo todos

- `.agents/TODO.md` SCF event entry: Q4 briefs are published; recheck Scout `/api/rfps` on or after
  2026-11-19 and file a Scout lag finding only if it still reports no open brief.
- `.agents/TODO.md` Scout follow-up and Horizon monitor entries updated with this round's results.
- `.github/ISSUE_TEMPLATE/upstream-improvement-ready.yml` uses sls-024 as its placeholder; update
  it in the sls-024 retirement change.

## Decisions

- Absorb Scout 1.9.135 with a fingerprint-only re-baseline: no grade moves.
- #223 and #167 stay open without comment.
- One upstream filing: successor sls-116. The Scout RFP lag is not filed (one day old, and the
  operator's own check reports it).
- sls-033 stays active instead of splitting its URL-provenance gap into a new id: it is the same
  dimension the original finding asked for.

## Final checklist

- Lanes t3q3, t3q4, t3q5, t3qc and t3r6 finished; their reports are in
  `research/audits/2026-11-12-truth-maintenance/` (raw evidence stayed in ignored `tmp/`). The
  gold-caps lane (t3rg) finished; its change and review continue in the follow-up change.
- Gates on this change, each exit 0: `npm run typecheck` (after `npm run typegen`), `npm test`,
  `npm run test:smoke`, `npm run build`, `npm run eval:selftest`,
  `npm run eval:qa:lint -- --stale --enforce-floors` (also `--since origin/main`), the live-contract
  lint, `npm run eval:qa:register -- --check`, `npm run improvements:lint` (also `--live`),
  `node scripts/check-pin-review.mjs --base origin/main`, `npm run eval:routing -- --gate`,
  `npm run secrets:scan -- --tree`, `git diff --check`, and the generated-artifact sync block
  (no change). Local `npm test` and smoke runs hit 5-second timeouts under heavy machine load
  (17 and then 11 unit tests, one smoke test, different tests each run). The 24 affected unit files
  (600 tests) and the full smoke lane (140 tests) passed when rerun with two workers; CI runs the
  full lanes.
- Upstream writes, all read back: six resolution comments, the sls-033 result on stellarlight#519,
  and new issue [stellarlight#1952](https://github.com/Stellar-Light/stellarlight/issues/1952).
- After merge: deploy (catalog and spec changed), comment on and close handoffs #417, #418, #420
  and #421, and let the next sentinel run close #422.
