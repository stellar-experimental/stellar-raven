# Skill retirement live review — Grok 4.6 high — 2026-09-09

Reviewer: Grok 4.6, high effort.
This reviewer is not the author and is not the orchestrator.
No subagent ran.
This file is the only write from this lane.

This lane did not edit findings, the root ledger, generated files, goldens, intake, PIN-REVIEW, or source.
It posted no GitHub comment.
It ran no paid QA, payment, crawler write, or credential print.
It did not expand provider research for this close.

Bounded gate: four changed skill bodies versus pin `0472452a05731de5e0a1e886d8aae6df24873fe2`, plus original triggers through production Raven `codemode.skill.read`.
Unrelated provider checks are not part of this gate.

Production `skill.read` stamps: `2026-09-09T18:20:09.258Z` and `2026-09-09T18:21:41.061Z`.
Raw-byte hashes: `2026-09-09T18:23Z`.
GitHub issue/PR state used `gh api` bodies, not MCP `issue_read`.

Root finding edits and `.agents/rounds/2026-09-09-outstanding-closeout.md` are not live evidence.

## Verdict

**Live gate PASS for `sk-021`, `sk-023`, and `sk-024`.**

No unresolved live-gate blocker.

All four changed files at pin `0472452a05731de5e0a1e886d8aae6df24873fe2` match live `main` and live `skills.stellar.org/skills/…` byte-for-byte.
Production `codemode.skill.read` URLs pin that commit.
Each original trigger phrase is gone from the served bodies.
Corrected positive phrases are present.

| Finding | Four-body pin match | Original production `skill.read` trigger | Live gate |
|---|---|---|---|
| `sk-021` | `smart-contracts/SKILL.md` SHA-256 `205faa24…` | `protocol 26` absent; `soroban-sdk = "27"` present | **PASS** |
| `sk-023` | `mpp.md` SHA-256 `2c5daaee…` | `payment-method-agnostic HTTP 402 protocol` present | **PASS** |
| `sk-024` | `SKILL.md` `56ee9da7…` and `x402.md` `6b7e58d8…` | `Yes (OZ Channels)` absent; key scoped to OZ Channels | **PASS** |

Root later marked the three files `fixed-upstream`.
This lane independently confirms that classification for the original triggers.
This lane does not drain the files.

## Unresolved blocker

**None for this live gate.**

Unavailable and not required: a Worker-bundle git SHA on version `0dad1151-56f5-4e7d-ae75-b4b81f3601f9`.
Wrangler lists that version at 100% from `2026-09-09T17:58:54.979658Z`.
It does not print a git commit.
Production `skill.read` pin URLs are the body proof.

Drain work remains for root and is outside this gate: finding snapshots, upstream resolution comments, resolver receipts, intake/index cleanup, TODO/NEXT, and a later diff review.

## Production pin URLs

All production reads returned commit `0472452a05731de5e0a1e886d8aae6df24873fe2`:

- https://raw.githubusercontent.com/stellar/stellar-dev-skill/0472452a05731de5e0a1e886d8aae6df24873fe2/skills/smart-contracts/SKILL.md
- https://raw.githubusercontent.com/stellar/stellar-dev-skill/0472452a05731de5e0a1e886d8aae6df24873fe2/skills/agentic-payments/SKILL.md
- https://raw.githubusercontent.com/stellar/stellar-dev-skill/0472452a05731de5e0a1e886d8aae6df24873fe2/skills/agentic-payments/mpp.md
- https://raw.githubusercontent.com/stellar/stellar-dev-skill/0472452a05731de5e0a1e886d8aae6df24873fe2/skills/agentic-payments/x402.md

`HEAD` `b6913d13e8ea0df15382503eb16ed47327a450d6` pins the same stellar-dev commit in `ecosystem-skills/MANIFEST.json`.
`stellar/stellar-dev-skill` `main` is `1f57ed1a2b67e9f6e0adedc8f7897ea4935902a6`.
Compare `0472452a...HEAD`: ahead 1, files empty.

## Four-file hash comparison

Independent SHA-256 and git-blob SHA-1 of pinned raw bytes, live `main`, and `https://skills.stellar.org/skills/…` (`Last-Modified: Wed, 09 Sep 2026 04:19:28 GMT`):

| File | pin / main / org SHA-256 | git blob | bytes |
|---|---|---|---|
| `smart-contracts/SKILL.md` | `205faa248dd6c828da4679cee9bfdbf0d71d99269a9a469bafd526756b2a273e` | `626ad2e9ec636a88f962dcaa16d0d49f05171ae3` | 9103 |
| `agentic-payments/SKILL.md` | `56ee9da71ea09ff58ba319fc5b34cf358713347274ecfa70357bf43ec1b5423d` | `ab6ea05b678e20be97ef701f0578b5a645ec2527` | 6753 |
| `agentic-payments/mpp.md` | `2c5daaee9d723727f227160ce706aad1363715c11beed65081596af86ab345c1` | `d389cd61c097d0b0045a71352aaf7b8b81505ed9` | 31834 |
| `agentic-payments/x402.md` | `6b7e58d8c49139edbadea37387b24c67bc0a59c58ffeef34b4d3100a66819304` | `81623e783f8bb0803c9148c6c74bd543fa990d54` | 24606 |

All three sources are equal for each file.
HEAD catalog transport SHA-256 and blobs match this table.

In-sandbox hashes of `skill.read` text differ (`fde84e2e…`, `2846aca3…`, `397c1bdd…`, `7bbb8eb5…`).
That is returned/scrubbed text, not raw pin bytes.
The production trigger is pin URL plus phrase evidence.
Raw-byte proof is the table above.

## Original production triggers

Calls: `codemode.skill.read` on `skills.stellar-dev.smart-contracts` and `skills.stellar-dev.agentic-payments`.
Sections: `versions`, `project-setup`, `quick-decision`, `testnet-setup-shared`, `file:mpp.md`, `file:x402.md`.

### sk-021 — PASS

Original trigger: `soroban-sdk = "27.0.0-rc.1"` with comment `Mainnet is on protocol 26`.

Production field/phrase evidence:

- `Mainnet is on protocol 26`: absent
- `Mainnet is on Protocol 26`: absent
- `protocol 26`: absent
- `soroban-sdk = "27.0.0-rc.1"`: absent
- `soroban-sdk = "27"`: present
- Comment: `soroban-sdk = "27"  # protocol 27, which mainnet runs at the time of writing.`

Upstream: https://github.com/stellar/stellar-dev-skill/issues/124 closed `completed` `2026-09-09T03:46:53Z` by `kaankacar`.
PR https://github.com/stellar/stellar-dev-skill/pull/127 merged `711d6e293b0ba6ae110db0ae307a4d7805a00b8a`.

### sk-023 — PASS

Original trigger: `mpp.md` omits a payment-method-agnostic scope sentence.

Production opening paragraph:

> MPP is a payment-method-agnostic HTTP 402 protocol, not a Stellar-only one: the core protocol standardizes the 402 Challenge/Credential exchange, and each **payment method** defines how one network settles it ([protocol spec](https://mpp.dev/protocol)). Tempo, Stripe and EVM are other payment methods; this guide documents the [Stellar payment method](https://mpp.dev/payment-methods/stellar). The packages split the same way: `mppx` is the general MPP framework, and `@stellar/mpp` is the Stellar payment method that extends it.

- `payment-method-agnostic HTTP 402 protocol`: present (count 1)
- `` `mppx` is the general MPP framework ``: present
- `` `@stellar/mpp` is the Stellar payment method ``: present
- `You're building a Stellar-native payment stack`: still present; kept use-case bullet, not the missing-scope defect

Finding probe excludes `payment-method-agnostic HTTP 402 protocol` on live `main`.
That sentence is present, so the probe must miss.
A miss is the fix.

Upstream: https://github.com/stellar/stellar-dev-skill/issues/125 closed `completed` `2026-09-09T04:17:58Z` by `kaankacar`.
PR https://github.com/stellar/stellar-dev-skill/pull/129 merged `1f57ed1a2b67e9f6e0adedc8f7897ea4935902a6`; head `0472452a`.

### sk-024 — PASS

Original trigger: `Needs facilitator? | Yes (OZ Channels)` and bare `OZ_API_KEY is required`.

Production router cell:

> `| Needs facilitator? | Yes — hosted or your own ([options](x402.md#facilitator-options)) | No | No |`

Production setup:

> `the OZ Channels facilitator that x402.md configures has its own web-only key generator. Each facilitator sets its own auth requirement — the x402.org one needs none`

Production seller guard:

> `"OZ_API_KEY is required by the OZ Channels facilitator. Generate one at https://channels.openzeppelin.com/testnet/gen …"`

- `Needs facilitator? | Yes (OZ Channels)`: absent
- `x402 additionally needs the web-only OZ Channels key generator`: absent
- `Required, not optional`: absent
- `## Facilitator options`: present
- `OZ_API_KEY is required by the OZ Channels facilitator`: present

Finding probe contains `Needs facilitator? | Yes (OZ Channels)`.
That needle is absent, so the probe must miss.

Upstream: https://github.com/stellar/stellar-dev-skill/issues/126 closed `completed` `2026-09-09T04:02:31Z` by `kaankacar`.
PR https://github.com/stellar/stellar-dev-skill/pull/128 merged `d987f9ff8c4b8fcdf6bddd327337628fd9f48def`.

## Persistent references

`rg` of finding IDs in goldens, gates, and `research/` returned zero current-gospel hits.

| Surface | Result | After live gate |
|---|---|---|
| `eval/qa/corpus/battery` | no `sk-021` / `sk-023` / `sk-024` | no golden edit |
| `eval/gates.json` | none | none |
| `research/` | none as current instruction | keep dated gauntlets |
| `improvements/intake.json` | overrides for all three | drop with resolver |
| `improvements/INDEX.md` | now `fixed-upstream` | regenerate on drain |
| finding files + probes | active `fixed-upstream` | delete via resolver |
| `.agents/TODO.md` | production-acceptance item | close after receipts |
| `.agents/NEXT.md` L119 | deploy/retirement trigger | remove after receipts |
| `ecosystem-skills/PIN-REVIEW.md` L242 | historical `03b2f8e8` still-repro | keep |
| Raven #136, #138, #140 | open; 17:11 comments predate this read | root comments after snapshots |
| stellar-dev #124, #125, #126 | closed; no production-recheck comment | root comments after snapshots |

Adjacent goldens already state the corrected facts and do not cite these IDs.
No golden edit is required for this gate.

## Sibling impacts

Do not stretch these findings.

- `sd-005` remains a Docs landscape finding.
- `sd-039` is already resolved; `sk-024` only points at that receipt.
- `sk-012` and `sk-016` are resolved MPP name/discovery records.
- `sk-022` remains an OpenZeppelin upgrade-skill finding.
- Router skill scope “payments on Stellar” is outside the `mpp.md` scope sentence.
- Kept MPP bullet “You're building a Stellar-native payment stack” is not the original defect.
- Dirty worktree Scout inventory edits are outside this gate.

## Retirement checklist for root

This live gate is complete.
Drain is a later root step, then a final diff review.

1. Snapshot the three finding files.
2. Comment live result and commit-pinned source on issues 124, 125, and 126.
3. Update Raven handoffs 136, 140, and 138.
4. Run `improvements:resolve` with `--review-evidence` pointing at this file.
5. Confirm file delete, intake drop, `resolved.json` receipts, and index regen.
6. Close the TODO item and the NEXT trigger.
7. Ask this reviewer for the cleanup diff. Do not treat this file as that diff review.
