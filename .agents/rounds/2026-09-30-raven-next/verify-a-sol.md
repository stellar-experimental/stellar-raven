accept with fixes

Five findings are fixed. Finding 6 remains partly fixed.
I checked `6dd9439461a286f5ca5f87722fb60f238c610d3d..fc38c12eeb86b492fed67ca3de33d1003e49e21b`.
I also compared the correction against the original reviewed commit, `8ce44d58`.

1. **Fixed — Missing maintainer approval.**

   `.agents/rounds/2026-09-30-raven-next.md:57-61,160-164` records the approval, the blocked merge, and the unmerged source fix.
   `.agents/TODO.md:169-176` records the same approval and retains the follow-up.
   A fresh GitHub read confirms `leighmcculloch` approved head `777561b29a8f8350815a2988e16b69e87a7aca5d` at `2026-09-29T21:44:44Z`.
   The PR remains open, and GitHub reports `BLOCKED`.
   All four reported checks passed; the record does not misidentify a failed check as the blocker.
   `sd-037` remains `reported-upstream`, and the text prohibits an approval-only reminder.

2. **Fixed — Premature Terra retirement.**

   `research/agent-model-roster.md:70-76` removes the retirement instruction.
   It states the catalog descriptions and identifies the routing change as an open owner decision.
   `AGENTS.md` retains authority over routing policy.
   The correction leaves its Terra assignment unchanged.

3. **Fixed — Omitted queued work and usage limits.**

   `.agents/rounds/2026-09-30-raven-next.md:165-177` adds both adapter tasks and the source-authority task.
   The adapter-default item requires measurement before shipping.
   The source-authority item identifies the missing answer-cost accounting and judge dollar cap.
   Lines 27-31 explicitly keep daily cleanup verification open.
   Lines 179-180 limit the usage conclusion to the stated checks.
   Lines 184-188 record the selected work and the deferrals.

4. **Fixed — Unnecessary golden scheduling gate.**

   `.agents/rounds/2026-09-30-raven-next.md:141-150` separates queued updates from dated checks.
   Item 9 labels the four queued updates `simple` and retains the required golden-truth checks.
   It explicitly removes further scheduling approval.
   Item 9b preserves the future dates and the October 8 trap restriction.
   Lines 186-188 assign the queued golden updates to PR D.

5. **Fixed — False blanket model claims.**

   `.agents/rounds/2026-09-30-raven-next.md:80-88,109-115` names the changed defaults, versions, and Grok context figure.
   It no longer claims every previous ID is stale.
   `research/agent-model-roster.md:73-74` distinguishes the three 5.6 descriptions.
   A fresh cache read confirms those descriptions.

6. **Partly fixed — Writing rules.**

   The receipt and the finding evidence use shorter sentences.
   The roster introduction uses active voice, and its calibration paragraph separates several ideas.
   However, the remaining sentences below exceed the 20-word limit.
   Counts use whitespace-separated words and omit list markers and heading text.

   | File | Lines | Words | Remaining sentence |
   | --- | --- | ---: | --- |
   | `.agents/rounds/2026-09-30-raven-next.md` | 9-10 | 24 | The sentence beginning “Each one passes its gates” |
   | `.agents/rounds/2026-09-30-raven-next.md` | 13-14 | 26 | The approval list |
   | `.agents/rounds/2026-09-30-raven-next.md` | 85-87 | 32 | The sentence beginning “Since then the Codex default moved” |
   | `.agents/rounds/2026-09-30-raven-next.md` | 116-118 | 26 | The issue closure and live-manual sentence |
   | `.agents/rounds/2026-09-30-raven-next.md` | 119-121 | 31 | The classification and resolver sentence |
   | `.agents/rounds/2026-09-30-raven-next.md` | 122-123 | 21 | The audit-fix and undici sentence |
   | `.agents/rounds/2026-09-30-raven-next.md` | 126-128 | 28 | The stale-pointer sentence |
   | `.agents/rounds/2026-09-30-raven-next.md` | 129-132 | 32 | The three skill-tooling changes |
   | `.agents/rounds/2026-09-30-raven-next.md` | 136-137 | 22 | The SCF body-read instruction |
   | `.agents/rounds/2026-09-30-raven-next.md` | 141-144 | 25 | The four queued cases |
   | `.agents/rounds/2026-09-30-raven-next.md` | 160-162 | 22 | The PR #2021 approval and TODO sentence |
   | `.agents/rounds/2026-09-30-raven-next.md` | 179-180 | 21 | The survey conclusion |
   | `.agents/rounds/2026-09-30-raven-next.md` | 184-185 | 27 | The PR A scope sentence |
   | `research/agent-model-roster.md` | 75-76 | 24 | The open routing decision and policy distinction |
   | `research/agent-model-roster.md` | 79-81 | 21 | The hidden-model sentence |
   | `research/agent-model-roster.md` | 97-98 | 24 | The bare-ID restriction and slug instruction |
   | `research/agent-model-roster.md` | 100-102 | 21 | The reviewer output and copy instruction |
   | `research/agent-model-roster.md` | 195-197 | 24 | The host-default and configuration-inheritance sentence |
   | `research/agent-model-roster.md` | 208-209 | 29 | The effort-curve sentence |
   | `research/agent-model-roster.md` | 234-236 | 21 | The completed-review evidence sentence |
   | `improvements/stellar-docs/sd-052-cli-bindings-placeholder-languages.md` | 16 | 22 | The resolver-gates evidence entry |

   The roster also retains passive wording at lines 55-56: `description is quoted`.
   Its generation paragraph at lines 70-76 contains eight sentences, exceeding the six-sentence paragraph limit.
   Fix: split these sentences and the long paragraph while preserving the technical items.
   Correct the reconciliation row at `.agents/rounds/2026-09-30-raven-next.md:216` until the writing fixes are complete.
   I exclude the original review brief under the user's explicit preservation instruction.
   I also preserve the copied review reports as records of the completed reviews.
   Commands, tables, and exact catalog quotations need no rewriting.

Verification:

- `npm run improvements:lint` passed for 65 findings and verified the generated index bytes.
- `git diff --check 6dd94394..fc38c12e` passed.
- The original review brief has no correction diff.
- The tracked tree was clean before this pass.
- I changed only `tmp/verify-a-sol.md` and made no upstream write.
- I ran no paid evaluation, deployment, service start, or pane control command.
