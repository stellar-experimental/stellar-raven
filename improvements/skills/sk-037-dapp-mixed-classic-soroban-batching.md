---
id: sk-037
service: skills
status: proposed
discovered: 2026-11-03
upstreamTitle: "Remove unsupported classic-operation batching from the dapp skill invocation guidance"
evidence:
  - "2026-11-03 exactly one public contents request checked stellar/stellar-dev-skill main: https://api.github.com/repos/stellar/stellar-dev-skill/contents/skills/dapp/SKILL.md?ref=main. HTTP 200; Git blob 6b2a072e602b94874d962ce6d931d3fa3c9caf93; decoded source SHA256 4abc828abbfebd5452e4abc159095b5703c392b21b1abe74a5f56e8220696f75. Line 332 still recommends batching a contract call with classic operations."
  - "The served immutable source also contains that sentence: https://raw.githubusercontent.com/stellar/stellar-dev-skill/cac64041d0c759a3b10ce6fba4fa3e0672bcbe0f/skills/dapp/SKILL.md. Retained body SHA256 18813d453677e8808808db68d82626f841f20eade68c3525cf53b1a4160c7faf."
  - "Independent SDK boundary: stellar/js-stellar-sdk v17.4.0 src/rpc/transaction.ts rejects assembly outside the single supported Soroban-operation shape. Retained source SHA256 be386ee34388e57c83c47db874ff3946e6cc381bb50cb66440bad8363847230a."
  - "Dedupe includes all skills findings, every other namespace, recurrence text, resolved.json, and intake in MAIN and the method tree. sk-033 concerns Rust try-client nesting; sk-036 concerns sendTransaction statuses. Neither covers mixed operation batching."
  - "research/audits/2026-11-02-golden-overnight/tail-source-receipts.json records the latest-branch check, immutable served evidence, public source boundaries, and pending runtime fixture checks. No simulation or transaction ran."
---

## Finding

The dapp skill recommends low-level invocation for batching a contract call with classic operations.
That recommendation conflicts with the supported single-operation Soroban transaction shape used by its SDK preparation path.
A reader can select this path expecting it to assemble an unsupported mixed transaction.
The current main-branch file and the served immutable version both retain the sentence.

## Evidence

The affected section is “Advanced: low-level invocation without a client” in `skills/dapp/SKILL.md`.
The [current source](https://github.com/stellar/stellar-dev-skill/blob/main/skills/dapp/SKILL.md) still contains the claim at the recorded observation time.
The public contents response identifies immutable Git blob `6b2a072e602b94874d962ce6d931d3fa3c9caf93`.
That is a blob identity, not an inferred commit hash.
The [served source](https://github.com/stellar/stellar-dev-skill/blob/cac64041d0c759a3b10ce6fba4fa3e0672bcbe0f/skills/dapp/SKILL.md) pins the exposed version.

Those two skill versions share one producer.
The separate [SDK assembly implementation](https://github.com/stellar/js-stellar-sdk/blob/v17.4.0/src/rpc/transaction.ts) supplies the applicable operation-shape boundary.
No assembled mixed transaction or network simulation ran here.
The first introducing commit is unknown and is not inferred from the observed versions.

## Recommendation

Remove the mixed classic/Soroban batching example from the low-level invocation guidance.
Use a supported reason, such as explicit transaction resource or authorization control.
State that the inner Soroban transaction retains its single supported operation.
Distinguish contract-to-contract composition from batching separate transaction operations.
Keep valid client invocation and transaction preparation examples unchanged.

Recheck adjacent operation guidance and validate a local mixed-operation rejection fixture before publication.
