# Upstream handoffs audit — Grok 4.6 high — 2026-09-09

Reviewer: Grok 4.6, high effort, pane `w3G:p8`.
This reviewer is not the handoff author (`kaankacar`) and is not the orchestrator.
No subagent ran.
No paid call, transaction, deploy, commit, push, upstream comment, or golden edit occurred.
The only write is this file.

Checks: `2026-09-09T16:36:50Z` through `2026-09-09T16:41:34Z`.
Git HEAD at review: `1ef0cdd2bd839c156ec175e04b61df9db51926b9` on `maintenance/drift-141`.
Accepted committed pin: `stellar-dev` `03b2f8e8c88a42b16551926a938ec8173763b45a`.
Astra worktree candidate, not accepted: `stellar-dev` `0472452a05731de5e0a1e886d8aae6df24873fe2` (`synced_at` `2026-09-09T16:34:39Z`).

## Verdict

Do not retire `sk-021`, `sk-023`, or `sk-024`.
Do not accept the Astra pin.
Do not change finding status in this lane.

Canonical upstream source and `skills.stellar.org` no longer reproduce the original defects.
The accepted Raven pin still does.
The dirty candidate pin is not a reviewed `PIN-REVIEW.md` selection.

| Finding | Canonical / live original trigger | Accepted pin `03b2f8e8` | Committed catalog pin (not a live Worker check) | Candidate pin `0472452a` (unaccepted at that read) | Pipeline action |
|---|---|---|---|---|---|
| `sk-021` | **fixed** | **still-repro** | **still-repro** | would be fixed (same bytes as live) | keep `reported-upstream` |
| `sk-023` | **fixed** | **still-repro** | **still-repro** | would be fixed (same bytes as live) | keep `reported-upstream`; probe false-positive |
| `sk-024` | **fixed** | **still-repro** | **still-repro** | would be fixed (same bytes as live) | keep `reported-upstream` |

Retirement is not eligible.
A later pin that serves the live `SKILL.md` / `mpp.md` / `x402.md` bytes can support retirement review.
The parent must re-run the original trigger against the accepted pin and own the edits.

## Three layers (do not collapse)

1. **Canonical fix.** `stellar/stellar-dev-skill` `main` `1f57ed1a2b67e9f6e0adedc8f7897ea4935902a6` and live `https://skills.stellar.org` carry the three corrections. Live SHA-256 values match `main` and the resolving merge trees.
2. **Raven pin acceptance.** Not done. Committed `ecosystem-skills/MANIFEST.json` still pins `03b2f8e8`. `PIN-REVIEW.md` has no new `sel:` entry. The Astra worktree pin is a candidate only.
3. **Committed catalog pin, not live Worker evidence.** This lane did not call a production Worker. The committed `catalog/manifest.json` still pointed every `stellar-dev` skill URL at `03b2f8e8`. That is catalog inference only. It does not prove what a deployed Worker served.

GitHub issue closure and PR merge are not the live trigger.

## State table

| finding | trigger evidence | upstream ref | ref state | PR checks/reviews | live re-check | action |
|---|---|---|---|---|---|---|
| `sk-021` | Protocol 27 RC example + "Mainnet is on protocol 26" | https://github.com/stellar/stellar-dev-skill/issues/124 | closed `completed` `2026-09-09T03:46:53Z` by `kaankacar` | PR #127 merged `711d6e29`; checks success | live/main **fixed**; pin **still-repro** | keep active; no drain |
| `sk-024` | `Needs facilitator? \| Yes (OZ Channels)` + bare `OZ_API_KEY is required` | https://github.com/stellar/stellar-dev-skill/issues/126 | closed `completed` `2026-09-09T04:02:31Z` by `kaankacar` | PR #128 merged `d987f9ff`; Copilot comments addressed in later commits | live/main **fixed**; pin **still-repro** | keep active; no drain |
| `sk-023` | no payment-method-agnostic scope sentence | https://github.com/stellar/stellar-dev-skill/issues/125 | closed `completed` `2026-09-09T04:17:57Z` by `kaankacar` | PR #129 merged `1f57ed1a`; two Copilot comments remain | live/main **fixed** for original defect; pin **still-repro**; probe still matches kept bullet | keep active; do not treat probe hit as recurrence |

Raven notifications:

| Raven issue | finding | author | created | state | comments |
|---|---|---|---|---|---|
| https://github.com/stellar-experimental/stellar-raven/issues/136 | `sk-021` | `kaankacar` | `2026-09-09T03:50:04Z` | open | one comment by `kalepail` at https://github.com/stellar-experimental/stellar-raven/issues/136#issuecomment-5595645949 (`2026-09-09T04:09:40Z`) |
| https://github.com/stellar-experimental/stellar-raven/issues/138 | `sk-024` | `kaankacar` | `2026-09-09T04:07:20Z` | open | none |
| https://github.com/stellar-experimental/stellar-raven/issues/140 | `sk-023` | `kaankacar` | `2026-09-09T04:20:03Z` | open | none |

Comment authorship: the `#136` comment is this repository's owner, not the upstream maintainer.
Upstream issue comments are from `kaankacar` (automated triage bot) and record the PRs that this review re-checked from source.

Immutable snapshots named in the handoffs exist at `8af90c173d8f41a7d2fdc6cf32b7a0b1d83c9e7d`.

## Original triggers (independent re-run)

Fetched `2026-09-09T16:36:50Z`. Live `Last-Modified: Wed, 09 Sep 2026 04:19:28 GMT`.

### sk-021

Original defect: `soroban-sdk = "27.0.0-rc.1"` plus comment `Mainnet is on protocol 26 at the time of writing`.

Accepted pin `03b2f8e8` SHA-256 `2561ecf136096d2418ff17f6eee896aaa1323d4e07fd8ea21e7352dc822835eb` (matches finding):

```
soroban-sdk = "27.0.0-rc.1"  # protocol 27; pre-releases need the exact version string.
                             # Mainnet is on protocol 26 at the time of writing — use "26" there
```

Live / `main` / merge `711d6e29` SHA-256 `205faa248dd6c828da4679cee9bfdbf0d71d99269a9a469bafd526756b2a273e`:

```
soroban-sdk = "27"  # protocol 27, which mainnet runs at the time of writing.
```

Live counts: `Mainnet is on protocol 26 at the time of writing` = 0; `soroban-sdk = "27.0.0-rc.1"` = 0; `soroban-sdk = "27"` = 1.

Horizon Mainnet `https://horizon.stellar.org/` at `2026-09-09T16:38:09Z`: `current_protocol_version` 27, `core_supported_protocol_version` 28, response SHA-256 `0beb773ae67f3de393bad819cdea06013c3a42ca87670b5cc920f7e9e4e74577`.
Horizon Testnet: `current_protocol_version` 28.
crates.io `soroban-sdk` at `2026-09-09T16:38:43Z`: `max_stable_version` 27.0.6, `newest_version` 28.0.0-rc.1.

The wider edit off `27.0.0-rc.1` is required. A comment-only 26→27 change would contradict the RC pin. Stable 27 exists. Testnet 28 / `28.0.0-rc.1` stay out of the Mainnet example. This review did not rerun `cargo build`.

### sk-024

Original defect: router table `Needs facilitator? | Yes (OZ Channels)`; shared setup `x402 additionally needs the web-only OZ Channels key generator`; seller `OZ_API_KEY is required`.

Accepted pin:

- `SKILL.md` SHA-256 `2af48a37773b2d1eaa42270b13dae6c49ebbf49050c58457e47fe2e2372af570`; count of `Needs facilitator? | Yes (OZ Channels)` = 1.
- `x402.md` SHA-256 `c3c92eaa7b4266ee08c74f92ff7447e135a25c34200dcde6bc6085e0ba2bd5bc`; count of bare `OZ_API_KEY is required` = 1; no `## Facilitator options`.

Live / `main` / merge `d987f9ff`:

- `SKILL.md` SHA-256 `56ee9da71ea09ff58ba319fc5b34cf358713347274ecfa70357bf43ec1b5423d`; table cell is `Yes — hosted or your own ([options](x402.md#facilitator-options))`.
- `x402.md` SHA-256 `6b7e58d8c49139edbadea37387b24c67bc0a59c58ffeef34b4d3100a66819304`; `## Facilitator options` present; `x402 is permissionless` present; remaining `OZ_API_KEY is required` strings are scoped: `OZ_API_KEY is required by the OZ Channels facilitator`.

Live `https://x402.org/facilitator/supported` at `2026-09-09T16:38:43Z`: one Stellar kind, `network: "stellar:testnet"`, `scheme: "exact"`, `extra.areFeesSponsored: true`. No `stellar:pubnet` entry.
Stellar Docs `https://developers.stellar.org/docs/build/agentic-payments/x402` SHA-256 `3631a62eeedb6bc92b2f3519847c336a9c6237f1aa03b579a39d71b41b6d17f7` still names Coinbase and OpenZeppelin.

This review did not call OpenZeppelin `/supported` (401-without-key is a public check; skipped to keep the paid/auth surface untouched).

### sk-023

Original defect: `mpp.md` never states payment-method-agnostic scope; only Stellar-specific lead and "Stellar-native payment stack" bullet.

Accepted pin SHA-256 `1ce5499a55d5144b0a58399afc3a790b7c7adca7030ad234b39fb8ed9d334b60`: no `payment-method-agnostic HTTP 402 protocol`; lead is `Facilitator-free machine payments settled directly on Stellar`.

Live / `main` / merge `1f57ed1a` SHA-256 `2c5daaee9d723727f227160ce706aad1363715c11beed65081596af86ab345c1`. First paragraph:

```
MPP is a payment-method-agnostic HTTP 402 protocol, not a Stellar-only one: the core protocol standardizes the 402 Challenge/Credential exchange, and each **payment method** defines how one network settles it ([protocol spec](https://mpp.dev/protocol)). Tempo, Stripe and EVM are other payment methods; this guide documents the [Stellar payment method](https://mpp.dev/payment-methods/stellar). The packages split the same way: `mppx` is the general MPP framework, and `@stellar/mpp` is the Stellar payment method that extends it.
```

The kept bullet `You're building a Stellar-native payment stack without relying on third-party infrastructure` is still present. The finding recommendation said to keep the rest of the guide unchanged.

`https://mpp.dev/protocol.md` SHA-256 `a2abfffc6ed63c99c29a9dfc1797a284c954b2f975e0fe2171f513b07435575d` (matches finding). Section `Payment method agnostic`. Text: `MPP works with any payment network`.
`https://mpp.dev/payment-methods/stellar.md` SHA-256 `41edeb085743c5ee499872cb025c4a23c7ec4fef7e1910963c4200c2afd27173`: `@stellar/mpp` "extends `mppx`".

## Neighboring claims

Protocol 26 mentions outside the stale Mainnet comment remain CAP availability facts. They are unchanged between pin and `main` in `skills/smart-contracts/development.md`, `skills/zk-proofs/SKILL.md`, and `skills/standards/SKILL.md` (`Protocol 26+`, CAP-0080). They are not this defect.

Router `SKILL.md` still says "payments on Stellar" as the skill scope. The finding asked for a scope sentence in `mpp.md`, not a router rewrite. Residual is acceptable for `sk-023`.

`sk-024` remaining `OZ_API_KEY` text is provider-scoped. Copilot's four PR #128 comments (universal "no key" claim, wrong startup error, web-only step count, EVM-only self-facilitation link) are addressed in the live bytes.

PR #129 Copilot comments were not addressed before merge:

1. No new `evals/` scenario for the taught scope fact. That file is not served by Raven.
2. "each payment method defines how one network settles it" may be narrow versus Stripe and NEAR Intents methods. The protocol page says methods "define how specific networks integrate". This is not the original missing-scope defect. Record as a residual. Do not stretch `sk-023`. Do not file a successor in this lane.

## Pin review: accepted old source vs candidate new source

Do not accept the pin.

### Accepted old source (committed, reviewed)

- Source: `stellar-dev`
- Commit: `03b2f8e8c88a42b16551926a938ec8173763b45a` (`2026-09-05T16:28:59Z`)
- `PIN-REVIEW.md` entry: `### 2026-09-08 — stellar-dev re-pin (drift issue #91)`, `sel:e9f82f593834`
- That entry correctly records that `sk-023` and `sk-024` still reproduce at that pin.

### Candidate new source (Astra worktree, unreviewed as a pin)

- `stellar-dev` commit: `0472452a05731de5e0a1e886d8aae6df24873fe2` (`2026-09-09T04:12:04Z`, PR #129 head)
- Current `main`: `1f57ed1a2b67e9f6e0adedc8f7897ea4935902a6` (merge of #129)
- Compare `0472452a...1f57ed1a`: ahead_by 1, **files empty**. Served skill tree is identical to `main`.
- Worktree digest from `node scripts/check-pin-review.mjs --digests`: `stellar-dev 0472452a0573 sel:7b68c8b72b2f`
- At `2026-09-09T16:41Z` `PIN-REVIEW.md` was not dirty and had no new `sel:` entry. That statement is true for that read. A later Astra entry superseded it; see the addenda.

Served `stellar-dev` blobs that move (git blob SHA → content SHA-256):

| file | accepted blob / SHA-256 | candidate blob / SHA-256 |
|---|---|---|
| `skills/smart-contracts/SKILL.md` | `99903bd4…` / `2561ecf1…` | `626ad2e9…` / `205faa24…` (live match) |
| `skills/agentic-payments/SKILL.md` | `cfadf070…` / `2af48a37…` | `ab6ea05b…` / `56ee9da7…` (live match) |
| `skills/agentic-payments/x402.md` | `2012c1ca…` / `c3c92eaa…` | `81623e78…` / `6b7e58d8…` (live match) |
| `skills/agentic-payments/mpp.md` | `0fa181ae…` / `1ce5499a…` | `d389cd61…` / `2c5daaee…` (live match) |

All other `stellar-dev` selected files are byte-identical.

Also in the candidate, out of this finding trio: `stellar-light` moves `d25b9f6bd842159b5a33aa6125ecb62373c2d8b5` → `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6` (`sel:339145ff9f53`). Changed files: `SKILL.md` and `references/api-reference.md` (6 commits ahead). This lane did not read that body diff. A bundled pin cannot be accepted on `stellar-dev` review alone.

### Pin-safety read of the four served `stellar-dev` diffs

The four changed skill bodies stay on topic.
They add no behavior-hijack instruction, no literal credential, no retired skill, and no non-exposed Raven operation.
Self-facilitation names an `S...` key prefix as the settler account. That is the existing Stellar secret-key pattern, not a leaked secret.
The x402 buyer sample comments that `@x402/core` falls back to `https://x402.org/facilitator` when a URL is unset. The served example does not do that. Both `HTTPFacilitatorClient` sites use `process.env.FACILITATOR_URL || "https://channels.openzeppelin.com/x402/testnet"`. An unset `FACILITATOR_URL` in that example still talks to OpenZeppelin. The leak warning applies only if that `||` default is removed.
Bounded external claims: live `/supported`, crates.io, Horizon protocol, OZ key-generator URLs. The skill already tells the reader to re-check those.

If the parent later accepts a pin, pin `0472452a` or `1f57ed1a`. Both serve the same selected `stellar-dev` tree. Record that fact in the new `PIN-REVIEW.md` entry. Review `stellar-light` first.

## Golden, register, intake, probe

Active references inspected. No gospel edit is required for these three findings.

| surface | `sk-021` | `sk-023` | `sk-024` |
|---|---|---|---|
| `eval/qa/corpus/battery/**` ID / `rootCause` | none | none | none |
| `eval/qa/consistency-register.json` | none | none | none |
| `improvements/resolved.json` | none | none | none |
| `improvements/intake.json` override | `stellar/stellar-dev-skill` | `stellar/stellar-dev-skill` | `stellar/stellar-dev-skill` |
| `improvements/INDEX.md` | `reported-upstream` | `reported-upstream` | `reported-upstream` |
| finding `probe` | none | `http-text` main `mpp.md` contains `building a Stellar-native payment stack` | `http-text` main `SKILL.md` contains `Needs facilitator? \| Yes (OZ Channels)` |

Related goldens already encode the true facts. They do not cite these finding IDs.

- `q-defi-x402-on-stellar-what`: Coinbase testnet-only vs OpenZeppelin hosted key; do not claim x402 never needs keys.
- `q-soroban-x402-auth-entry-signing`: API key is hosted-provider-specific; `truth.status: disputed` is the wallet roster, not the key scope.
- `q-defi-agentic-payment-standards-compare`: MPP is payment-method-agnostic; avoid "call MPP a Stellar standard".
- `q-mpp-discovery-and-modes`: MPP is HTTP 402; Stellar Charge/Session are the Stellar method.
- `q-agent-payment-standard-choice`: x402 and MPP are distinct HTTP 402 protocols.
- `q-tool-skill-detail-install`: Scout slug resolution; not this defect.
- `q-pc-protocol-26-yardstick`: historical Yardstick Protocol 26 go-live. Not the skill comment.

Sibling sweep: no battery file encodes "Mainnet is on protocol 26" or "Yes (OZ Channels)" as gospel.

Probe semantics (`scripts/improvements-run-probes.mjs`): `expect.contains` hit means the probe is `ok` and is treated as a recurrence. Probes fetch **`main`**, not the Raven pin.

- `sk-024` probe on live `main`: the needle is gone → probe miss. That matches the canonical fix. It does not prove the accepted pin is fixed.
- `sk-023` probe on live `main`: the needle remains → probe hit. That is a **false recurrence**. The recommendation kept that bullet. Handoff #140 asked to repoint the probe. Parent owns that edit. Do not run an unfiltered probe drain on `sk-023` until the probe measures the original defect (absence of the scope sentence), not the kept bullet.

`.agents/TODO.md` has open items for `#136` pin acceptance and `#138` verification. `.agents/NEXT.md` line 259 points at the `sk-021` gate. Historical round notes may keep the IDs.

## Residuals (not original-trigger recurrences)

1. Accepted pin `03b2f8e8` still serves all three original defects.
2. Committed catalog URLs still point at that pin.
3. Astra candidate pin is unpublished, lacks a `PIN-REVIEW.md` `sel:` entry, and also moves `stellar-light`.
4. `sk-023` probe will still match live `main`.
5. PR #129 Copilot: missing evals scenario; possible over-narrow "one network" phrasing. Successor only if parent wants a new finding after independent check of Stripe/NEAR methods.
6. Router still frames the skill as payments on Stellar. Intended skill scope, not the original `mpp.md` gap.
7. `sd-039` remains a separate Docs Relayer/Channels identity finding.
8. No wasm rebuild of `soroban-sdk = "27"` in this lane.

## Complete reference cleanup list

Do not clean up now.

When an accepted pin serves the live bytes, and a distinct reviewer re-runs the original triggers against that pin, drain work will need:

For each of `sk-021`, `sk-023`, `sk-024`:

- delete `improvements/skills/sk-021-smart-contracts-mainnet-protocol-comment-stale.md`
- delete `improvements/skills/sk-023-mpp-general-protocol-identity.md`
- delete `improvements/skills/sk-024-x402-facilitator-and-api-key-scope.md`
- remove intake overrides `sk-021`, `sk-023`, `sk-024` from `improvements/intake.json`
- regenerate `improvements/INDEX.md`
- append three receipts to `improvements/resolved.json` (IDs never reused)
- before delete: repoint or drop the `sk-023` probe so a last probe run cannot draft a false recurrence
- close Raven `#136`, `#138`, `#140` after terminal receipts (parent posts the live result; this lane does not comment)
- close TODO items `Accept the corrected Smart Contracts source before retiring sk-021` and `Verify new sk-024 handoff #138`
- update `.agents/NEXT.md` only if it still names the gates
- add a **new** `PIN-REVIEW.md` entry for the accepted `sel:` digest; do not rewrite the 2026-09-08 entry
- rebuild catalog/manifest from `update.sh`; do not hand-edit generated files

Keep:

- historical `.agents/rounds/**` mentions
- `PIN-REVIEW.md` 2026-09-08 recurrence sentence (it describes that pin)
- eval goldens (no ID citations; no gospel change from this audit)
- `eval/qa/consistency-register.json` (no ID citations)
- `research/gauntlets/**` and reviewed eval artifacts (archival)
- `sd-039` and neighboring Protocol 26+ CAP text

Resolver dry-run is parent-owned. This lane did not run `improvements:resolve`.

## Evidence URLs and dates

| what | url | date |
|---|---|---|
| Raven `#136` | https://github.com/stellar-experimental/stellar-raven/issues/136 | created `2026-09-09T03:50:04Z` |
| Raven `#136` comment | https://github.com/stellar-experimental/stellar-raven/issues/136#issuecomment-5595645949 | `2026-09-09T04:09:40Z`, author `kalepail` |
| Raven `#138` | https://github.com/stellar-experimental/stellar-raven/issues/138 | created `2026-09-09T04:07:20Z` |
| Raven `#140` | https://github.com/stellar-experimental/stellar-raven/issues/140 | created `2026-09-09T04:20:03Z` |
| upstream `#124` | https://github.com/stellar/stellar-dev-skill/issues/124 | closed `2026-09-09T03:46:53Z` |
| upstream `#125` | https://github.com/stellar/stellar-dev-skill/issues/125 | closed `2026-09-09T04:17:57Z` |
| upstream `#126` | https://github.com/stellar/stellar-dev-skill/issues/126 | closed `2026-09-09T04:02:31Z` |
| PR `#127` | https://github.com/stellar/stellar-dev-skill/pull/127 | merged `2026-09-09T03:46:52Z`, merge `711d6e293b0ba6ae110db0ae307a4d7805a00b8a` |
| PR `#128` | https://github.com/stellar/stellar-dev-skill/pull/128 | merged `2026-09-09T04:02:30Z`, merge `d987f9ff8c4b8fcdf6bddd327337628fd9f48def` |
| PR `#129` | https://github.com/stellar/stellar-dev-skill/pull/129 | merged `2026-09-09T04:17:57Z`, merge `1f57ed1a2b67e9f6e0adedc8f7897ea4935902a6` |
| Pages deploy `#127` | https://github.com/stellar/stellar-dev-skill/actions/runs/34308521287 | success, `workflow_dispatch`, head `711d6e29`, `03:48:15Z`–`03:49:05Z` |
| Pages deploy `#128` | https://github.com/stellar/stellar-dev-skill/actions/runs/34309419809 | success, `push`, head `d987f9ff`, `04:02:32Z`–`04:03:19Z` |
| Pages deploy `#129` | https://github.com/stellar/stellar-dev-skill/actions/runs/34310426955 | success, `push`, head `1f57ed1a`, `04:17:59Z`–`04:19:12Z` |
| gh-pages build | https://github.com/stellar/stellar-dev-skill/actions/runs/34310501124 | success, `dynamic`, pages SHA `aecb9550`, `04:19:09Z`–`04:19:35Z` |
| live smart-contracts | https://skills.stellar.org/skills/smart-contracts/SKILL.md | `Last-Modified 2026-09-09T04:19:28Z`, SHA-256 `205faa24…` |
| live agentic SKILL | https://skills.stellar.org/skills/agentic-payments/SKILL.md | same Last-Modified, SHA-256 `56ee9da7…` |
| live x402 | https://skills.stellar.org/skills/agentic-payments/x402.md | same Last-Modified, SHA-256 `6b7e58d8…` |
| live mpp | https://skills.stellar.org/skills/agentic-payments/mpp.md | same Last-Modified, SHA-256 `2c5daaee…` |
| Horizon Mainnet | https://horizon.stellar.org/ | `2026-09-09T16:38:09Z`, protocol 27 |
| crates.io soroban-sdk | https://crates.io/api/v1/crates/soroban-sdk | `2026-09-09T16:38:43Z`, stable 27.0.6 |
| x402 `/supported` | https://x402.org/facilitator/supported | `2026-09-09T16:38:43Z`, `stellar:testnet` only |
| MPP protocol | https://mpp.dev/protocol.md | `2026-09-09T16:38:43Z`, SHA-256 `a2abfffc…` |
| MPP Stellar method | https://mpp.dev/payment-methods/stellar.md | `2026-09-09T16:38:43Z`, SHA-256 `41edeb08…` |
| Stellar x402 docs | https://developers.stellar.org/docs/build/agentic-payments/x402 | SHA-256 `3631a62e…` |
| finding snapshots | https://github.com/stellar-experimental/stellar-raven/blob/8af90c173d8f41a7d2fdc6cf32b7a0b1d83c9e7d/improvements/skills/ | commit `8af90c17` |

## Safe action for parent

Keep all three findings `reported-upstream`.
Leave Raven `#136`, `#138`, and `#140` open.
Do not accept the Astra pin.
Do not drain, comment, or edit goldens from this review.
After a reviewed pin that includes `0472452a` / `1f57ed1a` served bytes, re-fetch the accepted-pin files, confirm the three original needles are gone, then run resolver gates.

This reviewer's fresh live triggers support a later retirement review. They do not complete it.

## Addendum — Astra pin files after `2026-09-09T16:42Z`

Astra wrote `ecosystem-skills/PIN-REVIEW.md` while this report was landing.
The new heading is `### 2026-09-09 — issue #141 candidate review; acceptance blocked`.
It names `stellar-dev` `0472452a` `sel:7b68c8b72b2f` and `stellar-light` `3b587aa9` `sel:339145ff9f53`.
It states that the record attests to reading the candidate and does not approve serving it.

Worktree `MANIFEST.json` at `2026-09-09T16:43Z` no longer matches that pair:

- `stellar-dev` `0472452a05731de5e0a1e886d8aae6df24873fe2`
- `stellar-light` `d25b9f6bd842159b5a33aa6125ecb62373c2d8b5` (accepted pin restored)

`node scripts/check-pin-review.mjs --digests` then printed `stellar-dev 0472452a0573 sel:7b68c8b72b2f` and `stellar-light d25b9f6bd842 sel:56a2798fd09a`.

The four `stellar-dev` served diffs still match live/main bytes reviewed above.
The PIN-REVIEW entry still lists a `stellar-light` move that the current manifest does not serve.
The entry itself says acceptance is blocked.
This lane still does not accept the pin.

## Addendum — corrections after the isolated-pin acceptance review

Date: `2026-09-09T16:51Z`. Reviewer: Grok 4.6 high, same pane.

The production column in the verdict table inferred the committed catalog. It was not a live Worker execute. The corrected header is `Committed catalog pin (not a live Worker check)`.

The earlier `PIN-REVIEW.md` "no new `sel:` entry" sentence remains true for the `16:41Z` read. Astra later wrote `### 2026-09-09 — issue #141 candidate review; acceptance blocked`, which records `sel:7b68c8b72b2f`. That later read supersedes the "lacks PIN-REVIEW" claim.

The unset-`FACILITATOR_URL` leak claim is inaccurate for the served example. The example defaults the URL to OpenZeppelin Channels testnet. See `.agents/rounds/2026-09-09-skill-pin-acceptance-grok.md`.
