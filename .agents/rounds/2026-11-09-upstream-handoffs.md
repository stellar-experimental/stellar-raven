# Upstream handoffs and drift — November 9, 2026

Scope: every open issue and PR in `stellar-experimental/stellar-raven` on 2026-11-09. No PRs were
open. Fifteen issues were open: thirteen inbound `[upstream-ready]` notifications (twelve
stellar-docs findings; sd-058 arrived twice, #402 and #403), drift issue #223, and RWA routing
issue #167.

## Lanes

Coordinator: Claude Opus 5.5 (root, hc terminal t2dn). Lanes ran under herdr-core (`hc`) in
worktrees under `/private/tmp/claude-501/raven-wt/`.

| Lane | hc | Tier / model / effort | Role |
|---|---|---|---|
| ho-author | t38r | Codex workhorse / `gpt-6.1-sol` / high | Author live rechecks for the twelve findings |
| ho-review | t38s | Codex frontier / `gpt-6-astra` / high | Independent re-derivation, run in parallel without reading the author file |
| drift-author | t38t | Codex frontier / `gpt-6-astra` / high | #223 regeneration, classification, gates |

## Issue #167

No change since the 2026-11-03 status. Cloudflare agents #2296 is open with no comments (last
update 2026-09-17); `@cloudflare/codemode` is still 0.5.6. No general lexical intent mechanism is
ready. The issue stays open without a new comment.
