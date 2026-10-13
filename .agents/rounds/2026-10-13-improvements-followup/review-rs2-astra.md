CHANGES-NEEDED

Reviewed `git diff 7087abdf cc2305bf` and `/private/tmp/claude-501/w1013/s-comments.md` on 2026-10-13.
HEAD is `cc2305bf2d220d8f881f3c3862e3f0a05235e372`.
Two P3 corrections remain. I found no new functional defect.

1. **P3 — The comments still contain an idiom and unnecessary internal terms.**

   Evidence: `/private/tmp/claude-501/w1013/s-comments.md:71` says “Raven closes the loop on this PR.”
   The same line says “PR #2837 carried this work to `main`.”
   Line 53 retains “under its ephemeral improvements lifecycle.”
   Line 98 uses “shipped” for documentation changes.
   The writing rules prohibit idioms and unnecessary jargon.
   See `.agents/skills/improvements-pipeline/references/upstream-writing-style.md` and the supplied AGENTS.md instructions.
   RS-3 therefore remains partly unresolved, despite the shorter sentences.

   Fix: use “Raven verified the fix that replaced this PR.”
   Then use “PR #2837 added the documentation changes to `main`.”
   At line 53, use “Raven will retire both findings.”
   At line 98, state which instructions the pages now contain.
   Keep the exact marker quotations and technical identifiers.

2. **P3 — The new cluster-022 review reason incorrectly describes its other members.**

   Evidence: `eval/qa/consistency-register.json:668` says the other five members do not mention the guide or archived pointer.
   Those five include `q-tool-passkeykit-smart-wallet`.
   Its `golden.notes` explicitly describes the former kalepail repositories as archived move pointers.
   See `eval/qa/corpus/battery/tooling-infra/q-tool-passkeykit-smart-wallet.json:25`.
   Its evidence also names the smart-wallets guide at line 149.
   Its answer and avoid clause discuss the former legacy framing at lines 10 and 19.
   The consistency verdict is supported, but the new explanation contains a false absence claim.

   Fix: limit the absence claim to the four wallet and DEX members.
   State that `q-tool-passkeykit-smart-wallet` retains the archived-pointer history, sibling distinction, and separate audit boundaries.
   Update the review reason through the register helper, then run `npm run eval:qa:register -- --check`.

The other requested corrections pass:

- Comment E covers #2367 with the dated live result, resolving PR, merge commit, and both source snapshots.
- The posting matrix includes all five references. The ledger removes the #2367 exception.
- The golden evidence dates the old observation and marks it superseded.
- Parsed objects match both `6891dca2` and `7087abdf` outside `truth.verified`.
- All 501 compiled cases match their source objects. The sample and corpus hashes match.
- The lifecycle registry hash matches the compiler's canonical hash function.
- Each post-retirement replacement matches once. Together, they remove every pending-retirement phrase from `truth.verified`.
- The replacement text identifies the receipt and source commit. The ledger also requires compilation and register review.
- The prepared comments contain no placeholders or sentences above 20 words. Their paragraphs contain at most six sentences.
- I found no credentials or partner-tier details in the comments or delta.

Both public GitHub snapshot pages returned HTTP 200 without authentication.
Their raw contents match the local finding files exactly at `087cc6b5a863811d8311ad0ed15a5f4746d0f773`.
Fresh live-page reads at `2026-10-13T16:41:31Z` match both recorded RS SHA-256 values.
The existing RS evidence supports the comment facts and marker results.

| Check | Result |
|---|---|
| `npm run eval:qa:register -- --check` | Passed; up to date |
| `npm run eval:qa:lint -- --stale --enforce-floors` | Passed; 0 errors, 62 warnings |
| `node eval/qa/lint-corpus.mjs --since 6891dca2` | Passed; 0 errors, 62 warnings |
| `npm run improvements:lint` | Passed; 73 findings |
| `npm run secrets:scan -- --tree` | Passed; no leaks |

I changed no tracked files, posted nothing, pushed nothing, and made no paid calls.
Only this review report was written. Actual posting and retirement remain pending.
