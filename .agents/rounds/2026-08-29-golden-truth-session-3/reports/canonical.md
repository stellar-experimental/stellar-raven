# Golden-truth session 3 — P2 canonical report

- q-protocol-base-reserve-min-balance — DONE — Added the scoped sd-043 caution and refreshed Docs/Core provenance.
- q-infra-horizon-vs-rpc — DONE — Rebuilt the disputed row from all five official status pages and replaced sd-017 with sd-042.
- q-ti-rpc-gettransactions-pagination-xdr — DONE — Added the durable declined-upstream caution without accepting universal immutability.
- q-ti-freighter-localhost-not-detected — DONE — Added the scoped sd-045 caution and reconciled guide, manifest, and secure-context layers.
- q-pc-protocol-27-zipper — DONE — Encoded July 8 as the official Mainnet date and kept July 11 as a live observation.

## Lint

Command:

`node eval/qa/lint-corpus.mjs --since origin/main 2>&1 | grep -E "q-protocol-base-reserve-min-balance|q-infra-horizon-vs-rpc|q-ti-rpc-gettransactions-pagination-xdr|q-ti-freighter-localhost-not-detected|q-pc-protocol-27-zipper|ERROR"`

Output:

`[lint-corpus] WARN [avoid] q-ti-freighter-localhost-not-detected: sourcing-guard [without-evidence]: Do NOT lead with CSP/RPC CORS without evidence or export a secret as a workaround.`

The lint returned no ERROR. It returned no symmetric-caution warning for the three caution cases.

## Reviewer reconciliation

The blind review agreed on the base-reserve and RPC conflicts. It also agreed that July 11 was only a check date.

A targeted live check confirmed the EVM guide's present-tense Horizon label. Four other official pages still use future-tense wording.

A targeted W3C check confirmed that browsers can treat localhost as potentially trustworthy. The Freighter caution stays limited to the official guide quote.

## Matrix handoff

The sandbox blocked writes under `.agents`. The matrix was appended before case edits at:

`/private/tmp/claude-501/-Users-kalepail--herdr-worktrees-stellar-raven-codemode-codex-golden-truth-session-3/cd770b91-1023-4d78-86f6-0defe2e06b20/scratchpad/gt3/pack/matrices/matrices-sol-c.md`
