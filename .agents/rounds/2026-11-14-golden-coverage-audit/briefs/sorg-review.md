# Lane brief: sorg-review (independent review of the stellar.org source)

You are the independent reviewer of branch `feat/stellar-org-source` (author: Claude Opus). Read
`AGENTS.md`, `briefs/stellar-org-source.md`, then `decisions/SORG.md`, then
`git diff origin/main...HEAD`. Write only the file named under Output. No deploy, no upstream
posts, no model-calling eval commands.

Check, in this order:

1. **The fetch boundary** (`src/adapters/stellar-org.ts`). Attack the path guard and redirect
   handling: encoded slashes and dots, backslashes, `@`, unicode, CRLF, a redirect chain that ends
   off-origin, protocol-relative forms, oversized and non-HTML bodies, content-type and charset
   handling, time-outs. Write failing inputs as test cases in your report (exact input, expected,
   observed by running them against the adapter). Confirm no secret, binding, or sandbox egress
   changed and `globalOutbound` is still `null`.
2. **Untrusted text.** Page text and search rows reach the model. Compare with how the Docs
   adapter labels or bounds upstream text, and say whether this adapter is weaker.
3. **Envelope and errors**: ok, `no-rows`, soft-empty, and error stay distinct, as the other
   adapters do.
4. **Routing**: re-run `npm run eval:routing -- --gate`. Confirm the author's claim of 0 grade and
   0 top-1 changes against `origin/main`, and judge the six changed top-five lists. Judge the
   `eval/gates.json` change by the `run-evals` re-baseline rule.
5. **Generated files** came from scripts (run the CI "generated artifacts in sync" sequence;
   `git diff --exit-code` must be clean).
6. **Bloat** (owner rule: cut what adds no visibility). For each of deviations 1, 2, 5, 6 and the
   drift classifier and inventory lane, say keep or cut, with the reason. 2,147 added lines for two
   operations is a lot: name anything that can go.
7. **Micro-map authority rule 3 tension** that the author left open: propose the exact wording or
   say leave it.
8. **Docs** describe current behaviour.
9. Gates bare with exit codes: `npm run typecheck`, `npm test`, `npm run build`,
   `npm run test:smoke`, `npm run secrets:scan -- --tree`.

## Output

`.agents/rounds/2026-11-14-golden-coverage-audit/decisions/SORG-REVIEW.md`: verdict first (fit to
merge, or blocking findings), then findings ranked with file, line, and the exact fix, then gates.
