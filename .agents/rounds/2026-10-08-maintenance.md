# Maintenance round — drift #223, audit #233, routing repair, flagged-row eval — 2026-10-08

## Scope

In: the open live-drift issue #223, the dependency audit issue #233, the general routing repair that
`.agents/TODO.md` "Preserve structured routing intent…" waits for, and the bounded re-collection of
the three rows flagged by `2026-10-07-tool-surface-qa.md`. Owner authorization (2026-10-08): "Whatever
you think is best I'm fine with. Certainly happy to run more evals and spend more if needed."

Out: issue #167 (RWA exposure; its close condition is unchanged), the owner's weekend paired subset
measurement, and the `ai`/`@ai-sdk/*` upgrade (held by its own TODO item).

## Lanes

| lane | agent (model, effort) | pane | write set | status |
|---|---|---|---|---|
| drift absorb | orchestrator, Claude Opus `claude-opus-5-5` | `w3W:p1P` | catalog, inventory, specs, `ecosystem-skills/`, `eval/gates.json`, `scripts/description-notes.mjs`, one test | merged #240 |
| drift review | Grok `grok-4.7`, high (vendor-diverse attack on a catalog change) | `w3W:p28` | `/private/tmp/claude-501/review-drift-038d6bf2.md` | approve after changes |
| dependency fix | Codex workhorse `gpt-6.1-sol`, high (routine implementation) | `w3W:p26` | `package.json`, `package-lock.json` | merged #241 |
| dependency review | Claude Fable `claude-fable-5-1`, high (Codex frontier busy with the routing lane; Grok busy with the drift review) | `w3W:p2A` | `/private/tmp/claude-501/review-deps.md` | approve after changes |
| routing repair | Codex frontier `gpt-6-astra`, high (dense scorer analysis) | `w3W:p27` | worktree `raven-routing`; no commit | rejected; no change |
| routing review | Claude Fable `claude-fable-5-1`, high, spawned by the routing lane (Codex frontier was the author) | `w3W:p29` | `2026-10-08-routing-repair/independent-audit.md` | agrees with rejection |
| flagged-row eval | orchestrator; plan and closeout review Claude Fable high; blind tally Codex workhorse high | `w3W:p2A`–`p2D` | `2026-10-08-flagged-row-recollection.md` | complete |

## Ledger

- 17:39 UTC — `node scripts/refresh-inventory.mjs`: Scout 1.9.61 → 1.9.72 (+3 hackathon GETs; routing
  text on 12 operations), Docs titles 666 → 674, Lumenloop and Docs settings unchanged. Full fresh
  build: legacy 220/295/324 vs the 219/298/326 baseline. Scout held, as on 2026-10-06.
- Docs titles alone: 544-row diff, 0 graded flips, 2 order changes; `q-tool-wallets-kit` loses
  `stellarDocs.search_wallet_dapp_docs` (565). Titles held.
- `ecosystem-skills/update.sh`: stellar-dev `d9ca04bf07d1` → `e9ab7dbb662d` (5 files read: x402
  `inclusionFeeStroops`, `MuxedAddress` E0283, Blux examples); catalog 63 → 67, community +4.
  Pin alone: 0 graded flips, 6 order changes. Commit `038d6bf2`.
- Drift review (Grok): approve with changes. The dApp description sentence "Blux is also an option."
  moved six lists through short tokens. Fix `4b9a6d36`: a `SKILL_DESCRIPTION_OVERRIDES` entry keeps the
  previous dApp search text; 544 rows then match main with 0 grade, order, and score changes. Delta
  re-review: approve.
- PR #240 merged `2bf5841e`; deployed version `48d59fc1-13d2-40ac-b722-96bd447bd745`.
- Dependency lane: SDK 1.30.0 → 1.31.0, client 2.0.0 → 2.2.0 (GHSA-6qxp-vccf-f47h) through a scoped
  `agents` peer override; `sharp` 0.35.4 → 0.35.5 (GHSA-wq5f-xc86-pv6w) through a global `miniflare`
  override. Its sandbox failed 29 `ps`-based tests; outside it, `npm test` passed 2429 + 3 expected
  failures and `npm audit` found 0. Review (Fable): approve with changes (stale TODO sentence) — fixed
  `8b317dee`. PR #241 merged `5a1e8ef6`; `main` CI passed on the combined tree; issue #233 closed by
  the audit workflow; deployed version `3ca73459-8cd5-459f-b214-9a75c8b8f90d`. Production: `/` 200,
  unauthenticated `POST /mcp` 401 with the Bearer challenge.
- Routing repair: ten general policies, each on current and fresh sources, all 544 rows. None passes
  the TODO's checks; see `2026-10-08-routing-repair/routing-repair-report.md`. No commit. Comment on
  #223: https://github.com/stellar-experimental/stellar-raven/issues/223#issuecomment-6066282965.
- Flagged-row eval: see `2026-10-08-flagged-row-recollection.md`.

## Outcome

- **Drift #223:** partly resolved. The skill pin and the catalog snapshots ship (#240). Scout 1.9.72 and
  the 674-title Docs snapshot stay held; #223 stays open as the hold record. Remaining risk: the daily
  drift report keeps firing until the routing repair lands.
- **Audit #233:** resolved (#241, closed). Remaining risk: the `agents` and `miniflare` overrides; their
  removal conditions are in `.agents/TODO.md`.
- **Routing repair:** rejected with evidence ([report](2026-10-08-routing-repair/routing-repair-report.md), [audit](2026-10-08-routing-repair/independent-audit.md)). The TODO item records the new mechanisms (the `dApp` →
  `app` prefix match, short-token matches, the `submission` identity fallback) and the exposure
  recommendation. Retained evidence: `2026-10-08-routing-repair/` (needed by that TODO item); full
  set in the owner's local archive `eval/results/2026-10-08-routing-repair-evidence.tar.gz`.
- **Flagged-row eval:** no 2026-10-07 drop held at n = 5 (two not detected, one inconclusive). Spend $18.9254812 of $45. Retained evidence: `2026-10-08-flagged-row-recollection/`
  (needed by the annotation TODO item).
