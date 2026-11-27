# Issue, PR, and live-drift triage — 2026-11-27

## Scope

Process all open PRs and issues in `stellar-experimental/stellar-raven` on 2026-11-27 (2 open external draft PRs; 10 open issues; 1 test-only CodeQL alert `#36`):

1. **External draft PRs (`#575`, `#576`, author `devodii`):** Adversarial security, supply-chain, primary-source, and policy review (read-only; zero contributor code executed; no workflows approved; outward-facing responses drafted for owner approval per `AGENTS.md`).
2. **Maintenance-exception docs handoffs PR (`improvements/2026-11-27-docs-handoffs`):** `#568` (`sd-105`), `#569` (`sd-106`), `#570` (`sd-109`), `#571` (`sd-114`). Live verification, distinct-reviewer re-derivation under `eval/qa/README.md` maintenance exception, lifted partial-cap removals on `q-token-xlm-supply-total-circulating` and `q-infra-testnet-vs-futurenet`, upstream resolution/partial-verification comments on `stellar/stellar-docs`, retirement of `sd-105`/`sd-106`/`sd-109` to `improvements/resolved.json`, and keeping `sd-114` active as `reported-upstream`.
3. **Live drift PR (`drift/2026-11-27-live-drift`):** `#565` (`stellar-docs-anchors`), `#566` (`stellar-light` 1.9.173), `#567` (`skills-pin: stellar-light`), `#572` (`stellar-docs`), `#573` (`stellar-docs-titles`), `#574` (`skills-pin: stellar-dev`), plus standing Horizon protocol-ceiling monitor (`scout.explainRepo` on `stellar/stellar-horizon`), ADR-0003 exposure decisions, `PIN-REVIEW.md`, `eval/gates.json`, independent review, merge, and production deploy.

Out of scope: untouched open upstream issues/PRs (stay silent per `improvements-pipeline` step 6); paid QA evals (USD 0 spend; subscription CLIs and free read-only HTTP/GitHub checks only).

## Lanes

| Lane | Agent (tier / model / effort) | Terminal | Write set | Status |
| --- | --- | --- | --- | --- |
| coordinator / drift author | Gemini 4 Neon (high) | `t2ny` | Drift branch, upstream comments, PRs, merges, deploy | complete |
| `pr-review-astra` | Codex frontier (`gpt-6.2-astra`, xhigh) | `t2nz` (removed) | [review-prs-astra.md](2026-11-27-issue-pr-triage/review-prs-astra.md) | complete (`#575` Reject/close, `#576` Hold as draft) |
| `handoffs-fable` | Claude Fable 5.2 (`claude-fable-5-2`, high) | `t2p2` (removed) | Maintenance-exception handoffs worktree + [handoffs-fable-report.md](2026-11-27-issue-pr-triage/handoffs-fable-report.md) | complete (3 fixed, 1 partial; all gates green) |
| `handoffs-review-astra` | Codex frontier (`gpt-6.2-astra`, high) | `t2p6` (removed) | [review-handoffs-astra.md](2026-11-27-issue-pr-triage/review-handoffs-astra.md) | complete (`PASS WITH FINDINGS` — 3 RETIRE, 1 KEEP ACTIVE) |
| `drift-review-fable` | Claude Fable 5.2 (`claude-fable-5-2`, high) | `t2p5` (removed) | [review-drift-fable.md](2026-11-27-issue-pr-triage/review-drift-fable.md) | complete (`PASS WITH FINDINGS` — S1–S4 & L1–L5 reconciled) |

## Ledger

### Standing monitors (2026-11-27)

- **Horizon protocol-ceiling monitor (`scout.explainRepo` on `stellar/stellar-horizon`):** `answerSource: "stellarlight-code-scan"`, `generatedAt: null`, `codeVerified.scannedRef: "01ba44a988b3ebc2d68d3cb6747fa2c2733773cd"` (`scannedAt: "2026-11-16T18:39:38.290Z"`), `sourceCheck.scannedValue: "30"` (`MaxSupportedProtocolVersion = 30`; conflict with dated note value `29` at `430a28e` flagged cleanly). Pass.
- **`npm run improvements:probes -- --service stellar-docs` (pre-retirement):** 5 run — `sd-105` and `sd-109` `fixed-candidate`; `sd-106` `recurring` (expected: Option 2 added pointers, not org names); `sd-107` and `sd-110` `recurring` (untouched upstream, kept silent).

### Upstream-ready handoffs state table (`improvements-pipeline` step 2)

Independent re-derivation record: [review-handoffs-astra.md](2026-11-27-issue-pr-triage/review-handoffs-astra.md) (Codex frontier `gpt-6.2-astra`, high, `t2p6`, maintenance exception).

| finding | trigger | upstream ref | ref state | PR checks or blocker | live re-check | repo action | next check |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `sd-105` | `#568` (Lumens supply contradiction) | [stellar-docs#3143](https://github.com/stellar/stellar-docs/issues/3143), [PR #3147](https://github.com/stellar/stellar-docs/pull/3147) | issue closed (completed); PR merged 2026-11-24T16:58Z | 8/8 checks green; none | fixed: `"will ever exist"` absent; line 49 agrees with Definitions lines 74–76 | lifted partial cap on `q-token-xlm-supply-total-circulating` under maintenance exception; retired to `resolved.json`; comment [7229314417](https://github.com/stellar/stellar-docs/issues/3143#issuecomment-7229314417) | none |
| `sd-106` | `#569` (Tier 1 orgs page) | [stellar-docs#3144](https://github.com/stellar/stellar-docs/issues/3144), [PR #3148](https://github.com/stellar/stellar-docs/pull/3148) | issue closed (completed); PR merged 2026-11-24T16:58Z | 8/8 checks green; none | fixed (Option 2): `## Current Tier 1 Organizations` links `stellar/packages` (10 `HOME_DOMAIN`s) & Obsrvr Radar (30 validators, 3 per domain, exact match) | verified `q-net-tier1-roster-current` needs no edit; retired to `resolved.json`; comment [7229314887](https://github.com/stellar/stellar-docs/issues/3144#issuecomment-7229314887) | none |
| `sd-109` | `#570` (Passkeys Friendbot C-address claim) | [stellar-docs#3150](https://github.com/stellar/stellar-docs/issues/3150), [PR #3152](https://github.com/stellar/stellar-docs/pull/3152) | issue closed (completed); PR merged 2026-11-24T16:59Z | 8/8 checks green; none | fixed: `"only funds classic"` & `"can't top up"` absent; line 49 agrees with `networks.md:38` and `faucet.md:11` | lifted partial cap on `q-infra-testnet-vs-futurenet` under maintenance exception; retired to `resolved.json`; comment [7229315188](https://github.com/stellar/stellar-docs/issues/3150#issuecomment-7229315188) | none |
| `sd-114` | `#571` (Docs search contract ID derivation) | [stellar-docs#3170](https://github.com/stellar/stellar-docs/issues/3170), [PR #3171](https://github.com/stellar/stellar-docs/pull/3171) | issue closed (completed); PR merged 2026-11-24T16:59Z | 8/8 checks green; primary search query still fails | partial: content & 3 links live; 3/5 natural queries rank #4/#2/#1, but primary `"how is a Soroban contract ID derived"` still returns 0/40 sections from `stellar-transaction` (`"how are Soroban contract addresses derived"` still #36) | kept `reported-upstream`; dated recurrence; updated `.agents/TODO.md`; verification reply [7229315504](https://github.com/stellar/stellar-docs/issues/3170#issuecomment-7229315504) asking to reopen `#3170` | after upstream re-ranks primary query into top 5 |

### External draft PR audit (`#575`, `#576`)

Independent adversarial review: [review-prs-astra.md](2026-11-27-issue-pr-triage/review-prs-astra.md) (Codex frontier `gpt-6.2-astra`, xhigh, `t2nz`).

- **PR `#575` (`7c8e2640`) — Recommend Reject & Close:** `sd-115` misidentifies 26 modern `#[contractevent]` `.publish(&env)` calls across 7 pages (including 5 already fixed in `stellar/stellar-docs#3067`, `resolved.json:1663-1677`) as deprecated `Events::publish`; `scripts/improvements-from-sdk-feed.mjs` fetches a mutable unlicensed personal repo (`devodii/state-of-soroban`) with path traversal in `slug()` and unquoted YAML/SSRF `probe.url` injection; `sd-116`–`sd-118` probes download 6.6 MB `llms-full.txt` 3× with broken absence semantics while Docs already shows `env.register(...)` and `register_stellar_asset_contract_v2`.
- **PR `#576` (`f1279c6e`) — Recommend Hold as Draft:** SDK 30.0.0 migration advice checks out and contains no prompt injection, but `truth.verified.by`/`rootCause` (`freshness-drift`) are inaccurate, `surface` only partially grounds the rubric, and merging reserves a permanent ID in `lifecycle-registry.json` before overlap with the existing `soroban.testing` case is evaluated.

### Live drift review (`#565`, `#566`, `#567`, `#572`, `#573`, `#574`)

Independent review: [review-drift-fable.md](2026-11-27-issue-pr-triage/review-drift-fable.md) (Claude Fable 5.2 `claude-fable-5-2`, high, `t2p5`, `PASS WITH FINDINGS` — 0 Blocking, 4 Should-fix, 6 Low; S1–S4 and L1–L5 reconciled).

- Reconciled `S1` (exact manifest commit SHAs in `PIN-REVIEW.md`), `S2` (`.agents/TODO.md` 2026-11-27 trigger stamps/deferrals for `GET /api/quality`, `GET /api/verify`, and `GET /api/rwa`), `S3` (full disclosure of 10 non-holdout + 2 holdout top-5 entries and accepted trade in `eval/gates.json`), `S4` (direct-upstream wording + `.agents/TODO.md` follow-up for `meta.token.candidates` `no-rows` caveat), `L1` (precise counts & extended moves), `L2` (`hackathonBuilds[]` scrub wording + TODO), `L3` (`eval/qa/README.md` 63/31 counts), `L4` (`OP_OVERRIDES` `broad` in `eval/plan/build-op-classes.mjs`), `L5` (WalletConnect override note in `.agents/TODO.md`).

## Outcome

- Drift PR, maintenance-exception handoffs PR, production deploy, and issue closures recorded via GitHub PRs and issue closure comments (see PRs linked from `#565`–`#574`).
- External draft PRs `#575` and `#576` left unposted/unchanged on GitHub pending owner sign-off on suggested replies.
- Open CodeQL alert `#36` (`test/server.test.ts:375`, `test`-classified regex strip in a unit test) noted separately for owner awareness.
- **Spend:** USD 0 API (subscription CLIs and free read-only HTTP/GitHub checks only).
