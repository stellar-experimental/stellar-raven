# Bounded delta review — commit-hook `gitleaks:allow` comments

Date: 2026-08-31
Reviewer: Grok 4.6 high
Source review: `.agents/rounds/2026-08-31-eval-routing-next/final-review-grok.md` (PASS)
Changed file: `eval/vectorize/preflight-clause-model.mjs`
Status: complete. No model fetch ran. No model load ran. The referee was not rerun. This reviewer wrote only this file.

This delta does not authorize a production change. It does not authorize a second referee.

## Verdict

**PASS**

The only implementation delta after `final-review-grok.md` is two line comments on the public tokenizer-file SHA-256 pins. The comments are narrow, truthful, behavior-neutral, and reviewable. The four pin values are unchanged. The original preflight hash remains the historical hash at that review. The live hash is `29dff3a31163f2cebd2558c6a3853104b936c0f958cb1827b6c45cc0aeca0764`.

The operator reports that the staged repository secret scanner and gitleaks now pass. This review did not rerun those scanners.

## Delta

Live file SHA-256 `29dff3a31163f2cebd2558c6a3853104b936c0f958cb1827b6c45cc0aeca0764` (2,808 bytes).

Staged blob matches the worktree. Unstaged implementation diff is empty.

The two added comments:

```js
["tokenizer_config.json", "977648852447cb6587327ff3205b0a84cf2fc9f05621d6c8e88a497caafab2e1"], // gitleaks:allow — public file SHA-256
["tokenizer.json", "def76fb086971c7867b829c23a26261e38d9d74e02139253b38aeb9df8b4b50a"], // gitleaks:allow — public file SHA-256
```

Removing those exact suffixes restores the historical file. The reconstructed SHA-256 is `c2c6b7f8f450755c8a592c895581b50c637f87994803ba5431793030c92f0c5a` (2,724 bytes). That is the hash recorded in `review-grok-finish.md` and `final-review-grok.md`.

`config.json` and `onnx/model_quantized.onnx` pins have no comment. The four hashes themselves are unchanged.

## Comment checks

| Check | Result |
| --- | --- |
| Narrow | Only the two tokenizer pin lines that gitleaks treated as secrets. Not a file-level allow. Not applied to the other two pins. |
| Truthful | Those strings are SHA-256 pins of public Hugging Face tokenizer files for `onnx-community/Qwen3-Embedding-0.6B-ONNX`. They are not credentials. |
| Behavior-neutral | JavaScript line comments. `PINS` remains four `[path, hash]` pairs. Runtime parsing is unchanged. |
| Reviewable | Same `// gitleaks:allow — …` form as `eval/qa/judge.mjs` for a committed SHA-256 fixture. |

## No other post-review implementation change

These live hashes still match `final-review-grok.md`:

| File | SHA-256 | Result |
| --- | --- | --- |
| Clause builder | `4c776e0cfa1c42ef3b7f52e56f11569085dec96e0aa2ac1862eede1e5f9db5bd` | Match |
| Clause config | `39e0b2c42d845913541231dce90b8ecd0e949adc11c50eefea015b7cb291932e` | Match |
| Clause retrieval | `a99e32319d27fe66c92887299971da257a1938073dececc095e7201c29c27cd9` | Match |
| Referee | `dac5457d6f967cda8e50c8596347ab50afaebe3c6225f743bf731ca5c7fced61` | Match |
| Embedder | `0976e8bbf5c7083dc954be4d9a21d4606fcfff53087b7dfeb9ee146fbb675e5f` | Match |
| Clause tests | `c11a7f6b47e12a05dea3615a57ac7c800ad60f11baca6cbd422a036877567143` | Match |
| `package.json` | `2ac7f8402d0fcb24c812c71d487f37b0fc8aef60cf4c70302ed3fa1cd134844a` | Match |
| Clause artifact | `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4` | Match |

`src/` has no unstaged or staged post-review implementation edit beyond the already-reviewed closeout set. The preflight comments are the only implementation bytes that changed after the final review.

An unstaged nine-line addition exists in `.agents/rounds/2026-08-31-eval-routing-next.md`. That is the shared ledger. This review did not edit it.

## Hash supersession

| When | Preflight SHA-256 | Status |
| --- | --- | --- |
| `review-grok-finish.md` and `final-review-grok.md` | `c2c6b7f8f450755c8a592c895581b50c637f87994803ba5431793030c92f0c5a` | historical |
| This delta | `29dff3a31163f2cebd2558c6a3853104b936c0f958cb1827b6c45cc0aeca0764` | live |

Use the live hash for any later pin. Keep the historical hash as the file that those reviews saw.

## Actionable findings

None.

## What this PASS allows

- Retry the commit with the two `gitleaks:allow` comments in the staged preflight file.
- Keep the final-review `PASS` for the measured `FAIL` and the closeout.

## What this PASS does not allow

- A production change, a second referee, a model fetch, or an artifact rebuild.
- A broader secret-scan allow than these two public tokenizer-file pins.
- Treating the historical preflight hash as the current file.
