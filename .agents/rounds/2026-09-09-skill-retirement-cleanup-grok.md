# Skill retirement cleanup review — Grok 4.6 high — 2026-09-09

Reviewer: Grok 4.6, high effort.
This reviewer is not the author and is not the orchestrator.
No subagent ran.
This file is the only write.

This lane posted no GitHub comment and made no paid call.
It did not rerun production `skill.read`.
The completed live gate in `.agents/rounds/2026-09-09-skill-retirement-live-grok.md` supports that delta.

Scope: `sk-021`, `sk-023`, and `sk-024` only.
Ignored: dirty Scout inventory, catalog generation, tests, and other unrelated worktree files. Those files are not accepted.

Snapshot under test: `09820d46ad3cbc64a9cced3786831aa24ab1c8a6`.
HEAD is that commit.
Cleanup lives in the worktree versus that snapshot.

## Verdict

**PASS**

No concrete finding blocks drain of these three skill records.

Public snapshot blobs match local git bytes.
All nine listed resolution comments exist.
Author is `kalepail` on every comment.
Receipt fields are complete.
Active queue pointers are gone.
The skill-only cleanup diff versus `09820d4` is the expected resolver set plus TODO/NEXT.

Raven handoffs `#136`, `#138`, and `#140` remain open.
That is outside this cleanup-diff gate.
Root listed them as pending close after this review.

## Public source snapshots

Commit https://github.com/stellar-experimental/stellar-raven/commit/09820d46ad3cbc64a9cced3786831aa24ab1c8a6 is public (`200`).
Date: `2026-09-09T18:30:35Z`.
Parent: `b6913d13e8ea0df15382503eb16ed47327a450d6`.
Remote: `origin/maintenance/outstanding-2026-09-09`.

Independent raw fetches equal `git show 09820d4:<path>`:

| Finding | Public URL | bytes | SHA-256 | git blob |
|---|---|---|---|---|
| `sk-021` | https://github.com/stellar-experimental/stellar-raven/blob/09820d46ad3cbc64a9cced3786831aa24ab1c8a6/improvements/skills/sk-021-smart-contracts-mainnet-protocol-comment-stale.md | 3635 | `809b2c9912f26bd66b270414e94b9c735f7440179fcec5b43d159f787dd03c1f` | `2fdf157b5a0f846da7fa2af1ee0f714aa320c735` |
| `sk-023` | https://github.com/stellar-experimental/stellar-raven/blob/09820d46ad3cbc64a9cced3786831aa24ab1c8a6/improvements/skills/sk-023-mpp-general-protocol-identity.md | 6281 | `678b1a8bec54d904c2858406f0490285f6a7c0402a51f91f227c7b6ae090f1a4` | `74af8b364a4b172de2c36241564172d98208bc57` |
| `sk-024` | https://github.com/stellar-experimental/stellar-raven/blob/09820d46ad3cbc64a9cced3786831aa24ab1c8a6/improvements/skills/sk-024-x402-facilitator-and-api-key-scope.md | 8206 | `499d6b23d4c4576a57ca6289072b365258d8f838f54a729682fba6f3e8dc8ef6` | `fd9a175032d960b6ffcbad5bc28203a4958aca13` |

Comment review URL is also public and byte-equal:

- https://github.com/stellar-experimental/stellar-raven/blob/09820d46ad3cbc64a9cced3786831aa24ab1c8a6/.agents/rounds/2026-09-09-skill-retirement-live-grok.md
- SHA-256 `8c5d006196ebc3fefd24409fde1a2bb523bfab3c5af58135122653b613bcccd2`, 10403 bytes, blob `581b7eb8c4b3bbb8e3b7ca2a6b173e2871311d29`

## Comment bodies and authors

Bodies were read with `gh api …/comments/<id>`, not MCP `issue_read`.

| Finding | URL | id | author | created |
|---|---|---|---|---|
| `sk-021` | https://github.com/stellar/stellar-dev-skill/issues/124#issuecomment-5606818314 | 5606818314 | `kalepail` | `2026-09-09T18:31:34Z` |
| `sk-021` | https://github.com/stellar/stellar-dev-skill/pull/127#issuecomment-5606818613 | 5606818613 | `kalepail` | `2026-09-09T18:31:36Z` |
| `sk-021` | https://github.com/stellar-experimental/stellar-raven/issues/136#issuecomment-5606818877 | 5606818877 | `kalepail` | `2026-09-09T18:31:37Z` |
| `sk-023` | https://github.com/stellar/stellar-dev-skill/issues/125#issuecomment-5606819192 | 5606819192 | `kalepail` | `2026-09-09T18:31:39Z` |
| `sk-023` | https://github.com/stellar/stellar-dev-skill/pull/129#issuecomment-5606819499 | 5606819499 | `kalepail` | `2026-09-09T18:31:40Z` |
| `sk-023` | https://github.com/stellar-experimental/stellar-raven/issues/140#issuecomment-5606819822 | 5606819822 | `kalepail` | `2026-09-09T18:31:42Z` |
| `sk-024` | https://github.com/stellar/stellar-dev-skill/issues/126#issuecomment-5606820137 | 5606820137 | `kalepail` | `2026-09-09T18:31:43Z` |
| `sk-024` | https://github.com/stellar/stellar-dev-skill/pull/128#issuecomment-5606820497 | 5606820497 | `kalepail` | `2026-09-09T18:31:45Z` |
| `sk-024` | https://github.com/stellar-experimental/stellar-raven/issues/138#issuecomment-5606820777 | 5606820777 | `kalepail` | `2026-09-09T18:31:46Z` |

Each trio shares one body.
Every body names the finding, pin `0472452a05731de5e0a1e886d8aae6df24873fe2`, worker `0dad1151-56f5-4e7d-ae75-b4b81f3601f9`, the matching snapshot URL, and the live-review URL.
Author is `kalepail`, not a bot.

## Receipt fields

All three receipts sit in `improvements/resolved.json`.
Required fields are present: `id`, `title`, `service`, `discovered`, `resolved`, `repo`, `upstreamRefs`, `resolvingRefs`, `liveRecheck`, `reviewEvidence`, `sourceCommit`, `sourceUrl`.

| Field | `sk-021` | `sk-023` | `sk-024` |
|---|---|---|---|
| `resolved` | `2026-09-09` | `2026-09-09` | `2026-09-09` |
| `repo` | `stellar/stellar-dev-skill` | same | same |
| `sourceCommit` | `09820d46ad3cbc64a9cced3786831aa24ab1c8a6` | same | same |
| `sourceUrl` | public `sk-021` blob above | public `sk-023` blob | public `sk-024` blob |
| `resolvingRefs` | PR #127 | PR #129 | PR #128 |
| `liveRecheck` | production `skill.read` `18:20Z`/`18:21Z`, pin `0472452a`, worker `0dad1151` | same pin/worker; MPP scope sentence | same pin/worker; facilitator options and scoped key |
| `reviewEvidence` | Grok 4.6 high + `2026-09-09-skill-retirement-live-grok.md` | same | same |

IDs do not collide with remaining active files.

Residual, not a fail: `sk-021` `upstreamRefs` includes Raven `#136`. `sk-023` and `sk-024` omit `#140` and `#138`. Comments still exist on those three handoffs.

## Absence of active pointers

Worktree versus snapshot:

- Deleted: `improvements/skills/sk-021-smart-contracts-mainnet-protocol-comment-stale.md`
- Deleted: `improvements/skills/sk-023-mpp-general-protocol-identity.md`
- Deleted: `improvements/skills/sk-024-x402-facilitator-and-api-key-scope.md`
- Probes lived in those files. They are gone with the files.
- `improvements/intake.json` dropped overrides `sk-021`, `sk-023`, `sk-024`.
- `improvements/INDEX.md` total `67 → 64`. The three rows are gone. Remaining finding markdown files: 64.
- Remaining skills files: `sk-004`, `sk-005`, `sk-007`, `sk-014`, `sk-015`, `sk-019`, `sk-022`.
- `.agents/TODO.md` no longer has `Complete production acceptance for sk-021, sk-023, and sk-024`.
- `.agents/NEXT.md` no longer has the deploy/retirement trigger.

`rg` for the three IDs outside round archives, `resolved.json`, and `PIN-REVIEW.md` returned no hits.
`TODO.md`, `NEXT.md`, `INDEX.md`, and `intake.json` have no remaining IDs.

Keep as history:

- `ecosystem-skills/PIN-REVIEW.md` line 242 records still-repro at pin `03b2f8e8`.
- Dated round ledgers.

## Cleanup diff versus `09820d4`

Skill-only paths:

```
M .agents/NEXT.md
M .agents/TODO.md
M improvements/INDEX.md
M improvements/intake.json
M improvements/resolved.json
D improvements/skills/sk-021-smart-contracts-mainnet-protocol-comment-stale.md
D improvements/skills/sk-023-mpp-general-protocol-identity.md
D improvements/skills/sk-024-x402-facilitator-and-api-key-scope.md
```

No extra skill-queue path is in that set.
Scout, catalog, inventory, specs, micro-map, and test edits are present in the broader worktree.
This review ignores them and does not accept them.

## Residuals for root after PASS

1. Close Raven handoffs `#136`, `#140`, and `#138` if this PASS is the remaining close signal.
2. Do not rewrite the `PIN-REVIEW.md` `03b2f8e8` history line.
3. Do not mix Scout catalog work into this skill drain commit.
