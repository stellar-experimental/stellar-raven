---
id: sk-036
service: skills
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "Data skill's sendTransaction example handles only PENDING; DUPLICATE, TRY_AGAIN_LATER, and ERROR fall through silently"
evidence:
  - "2026-11-02T21:23Z stellar/stellar-dev-skill main 313832e98b7606feba2cb0b03c4f9542b2d0c4c3 skills/data/SKILL.md lines 128-145, 'Send Transaction': 'if (response.status === \"PENDING\") { ... }' with no else branch. No skill file lists the sendTransaction status values."
  - "skills/data/SKILL.md line 151 lists the getTransaction values: '// status: \"SUCCESS\" | \"FAILED\" | \"NOT_FOUND\"'. That sub-claim of the HackMeridian item (no getTransaction status values) does not reproduce."
  - "skills/dapp/SKILL.md lines 421-424 check only status 'ERROR' before polling. skills/smart-contracts/testing.md line 162 sends without a status check."
  - "2026-11-02T21:24:49Z GET https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/sendTransaction.md: 'Available options: `PENDING`, `DUPLICATE`, `TRY_AGAIN_LATER`, `ERROR`'. 'errorResultXdr ... If the transaction status is `ERROR`...'."
  - "Field name, 2026-11-02T22:03:43Z: the sendTransaction docs page names the JSON field 'errorResultXdr' and its JavaScript sample logs 'result.errorResultXdr'. js-stellar-sdk v17.4.0 src/rpc/api.ts: the parsed SendTransactionResponse has 'errorResult?: TransactionResult' (line 519); RawSendTransactionResponse has 'errorResultXdr?: string' (line 530). skills/dapp/SKILL.md line 423 uses 'response.errorResult', which matches the parsed SDK type."
  - "Dedupe 2026-11-02: no stellar/stellar-dev-skill issue or PR (all states) mentions sendTransaction status handling. Resolved sd-003 covered the docs search index for RPC method pages, not this skill."
  - ".agents/TODO.md 'File the HackMeridian upstream findings' item R34."
  - upstream issue filed 2026-11-02: https://github.com/stellar/stellar-dev-skill/issues/166
---

## Finding

The data skill's "Send Transaction" example polls only when `sendTransaction` returns `PENDING`.
It has no branch for `DUPLICATE`, `TRY_AGAIN_LATER`, or `ERROR`.
For those values the example does nothing and reports nothing.
No skill file lists the four `sendTransaction` status values.

The dapp skill handles `ERROR` only.
A client built from either example can drop a rejected or throttled transaction without an error.

The `getTransaction` values are present (`SUCCESS`, `FAILED`, `NOT_FOUND`), so that part needs no change.

## Evidence

The RPC reference page for `sendTransaction` gives the enum `PENDING`, `DUPLICATE`, `TRY_AGAIN_LATER`, `ERROR`.
It says `errorResultXdr` is set when the status is `ERROR`.

## Recommendation

List the four `sendTransaction` values next to the `getTransaction` values in `skills/data/SKILL.md`.
In the example, throw on `ERROR` with the field the SDK returns (`errorResult` on the parsed `rpc.Server` response; the raw JSON field is `errorResultXdr`), retry on `TRY_AGAIN_LATER`, and poll on `DUPLICATE` as on `PENDING`.
Apply the same branches to the dapp `submitSorobanTransaction` example.
