# Delta review: 7d00d61f

The delta passes this review. I found no defect or standards violation in the changed expression.

Reviewed HEAD: `7d00d61fb0dda51a2b49e45bc12fb8faaf3dd070`.
Comparison: `git diff 59f5490a 7d00d61f -- eval/`.
The comparison changes only `VERSION_ANCHOR_RE` at `eval/qa/evidence-pack.mjs:1321`.
This review does not reopen the earlier p9 review.

The file tool rejected the requested output path under `.agents` because of the write restrictions.
This report therefore resides in the permitted temporary directory.
Requested destination: `.agents/rounds/2026-10-12-pack-p9/review-delta-7d00d61f-astra.md`.

1. Language and match positions

The expressions accept the same strings for every input, when execution completes.
The changed suffix is:

```text
old: (?:\.?\d+)*
new: \d*(?:\.\d+)*
```

Both expressions accept an empty string.
Every nonempty old match contains digit groups, with an optional dot before each group.
Merge adjacent groups that have no intervening dot.
The result contains an optional initial digit sequence, followed by zero or more dot-prefixed digit sequences.
That is exactly the new expression.
Conversely, each nonempty initial sequence and each dot-prefixed sequence satisfies one repetition of the old expression.
Thus, both directions hold.

The match positions and matched text also remain identical.
Both expressions greedily consume the longest available suffix at each unchanged prefix and tag choice.
The old expression can divide a digit sequence into multiple groups, but those divisions consume the same text.
The final negative lookahead rejects an endpoint before a remaining digit or before a dot followed by a digit.
Thus, shortening a consumed digit sequence or removing a complete dotted group cannot produce an earlier successful endpoint.

The unchanged tag alternatives retain their order, including `pre` before `preview`.
The unchanged optional suffix, version prefix, lookbehind, and flags retain their behavior.
Neither changed group captures text.
Therefore, the global search also produces the same successive matches.
No match-position counterexample exists under these rules.

I compared complete match arrays, including positions, for 142,206 generated inputs.
All comparisons passed on Node `v24.13.0`.
Cases included Unicode boundaries, every tag, uppercase tags, dotted suffixes, blockers, and subsequent matches.
The cases also included every suffix through seven characters over `1`, `2`, `.`, `x`, and `-`.
These checks support the argument; they do not replace it.

2. Backtracking

The exponential backtracking from the changed suffix is gone.
The old expression can partition an uninterrupted sequence of `n` digits in `2^(n-1)` ways.
A final letter forces failure and exposes those alternatives.
The new expression assigns the initial digits to one repetition.
Each later group requires a dot, so successive groups cannot divide the same uninterrupted digit sequence.
Backtracking can shorten digit sequences, but it cannot multiply equivalent partitions across them.

I tested each expression in a separate child process, with a 2,000 ms timeout and `SIGKILL` on timeout.
All inputs started with `1.2.3-rc` and ended with `x`.
Completed calls returned no matches.
The table gives regex execution times; timeout values refer to the whole child process.

| Middle text | Input length | Old | New |
|---|---:|---:|---:|
| `"1.".repeat(50000)` | 100009 | 1.002 ms | 0.994 ms |
| `"1".repeat(20)` | 29 | 18.591 ms | 0.458 ms |
| `"1".repeat(24)` | 33 | 295.195 ms | 0.493 ms |
| `"1".repeat(28)` | 37 | Timeout | 0.481 ms |
| `"1".repeat(32)` | 41 | Timeout | 0.438 ms |
| `"1".repeat(100000)` | 100009 | Timeout | 0.959 ms |
| `"11.".repeat(10000)` | 30009 | Timeout | 0.743 ms |

The suggested single-digit dotted input does not expose the old defect because its digit groups cannot split.
Long digit sequences and repeated two-digit dotted groups expose it.
These measurements verify this correction, not a general performance guarantee for the evidence pack.

The reproducible script and results are available at:

```text
/private/tmp/claude-501/w1013/jreview-checks/regex-check.mjs
/private/tmp/claude-501/w1013/jreview-checks/regex-results.json
```

3. Replay comparison

I parsed and recursively compared both supplied replay files:

```text
/private/tmp/claude-501/w1013/replay-59f.json
/private/tmp/claude-501/w1013/replay-7d0.json
```

Exactly one value differs: `revisions.p9` changes from `59f5490a` to `7d00d61f`.
After normalizing only that value, `assert.deepStrictEqual` passed for the complete parsed documents.
All 32 measured rows retain identical p9 pack hashes and full prompt hashes.
The six prompts that differ from p8 remain the same six prompts.
All replay summaries, control results, and the 187 stable-row results remain unchanged.
The supplied evidence therefore shows no measured pack or prompt change from this delta.

I did not rerun the replay.

4. Verification

`node eval/qa/judge.mjs --self-test-static` passed with exit 0.
The static check made no paid call.

I ran the same four relevant fixture files as the preceding review:

```sh
node /Users/kalepail/Desktop/stellar-raven-codemode/node_modules/vitest/vitest.mjs run --config /private/tmp/claude-501/w1013/jreview-checks/vitest.config.mjs --configLoader native test/evidence-pack-claim-support.test.mjs test/evidence-pack-per-operation.test.mjs test/qa-judge-evidence.test.mjs test/qa-verdict-consistency.test.mjs
```

All four files passed: 274 tests, exit 0, Vitest `4.1.11`.
The temporary configuration selected this worktree and resolved Vitest from the permitted dependency directory.
It placed the Vite cache under `/private/tmp` and disabled the Vitest results cache.
The run required no writes to the dependency checkout.
`git diff --check 59f5490a 7d00d61f` also passed.

I changed no tracked file and made no commit.
This verdict covers only the regex delta and preserves the earlier review's limits.

DELTA: APPROVE
