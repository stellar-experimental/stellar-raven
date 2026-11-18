# Item 8.6 disposition: removed gateway judge files

Round item 8.6 removes the ability to produce new AI Gateway judge verdicts. All four files stay in git
history at the commit shown. Nothing needs the `~/backups` archive.

| Removed file | Last commit | What covers its job now |
|---|---|---|
| `eval/qa/gateway-judge.mjs` (233 lines) | `657ae988` (2026-11-06, #387) | Judging: `eval/qa/judge.mjs` on the Claude Code CLI, now gated by `assertClaudeSubscription`. A non-Claude second judge: the TODO item "Build a subscription second judge on OpenCode when a decision needs one". Stored receipts: `research/audits/2026-11-06-playground-final-resolution/gateway-receipt.mjs`, which keeps verbatim copies of `isSettledJudgeRowFailure` and `gatewayJudgeConfig`, the only two functions a stored receipt validator used. |
| `eval/qa/gateway-rejudge.mjs` (222 lines) | `b623d5ac` (2026-11-18, #494) | The Claude re-judge, `eval/qa/re-judge.mjs`, plus `diagnostic-rejudge-source.mjs` (admission of saved answers). Nothing produces `gateway-rejudge-v1` receipts any more. |
| `eval/qa/gateway-judge.md` (151 lines) | `b623d5ac` (2026-11-18, #494) | `eval/EVALS.md` "Model-call billing" (no AI Gateway judging) and `eval/qa/README.md` "Judge" notes. The seven calibration fixtures it reused are the seven-case self-test, which never depended on the gateway judge. |
| `test/gateway-judge.test.mjs` (228 lines) | `b623d5ac` (2026-11-18, #494) | Offline tests of the stored-receipt reader: `test/playground-final-orchestrator.test.mjs` (receipt validation, `validateReceipt`, `settle*`). The new `test/model-call-billing.test.mjs` guards against a new gateway caller. |

## Notes

- **`partialRecoverySource`.** The "verifies all25 source cases ... plans exactly two B calls" test used
  `prepareGatewayRejudge` for the only direct partial-recovery assertions: the two prepared prompts, the
  non-promotable source and the "all attempted" refusal. Those assertions are gone with the producer. The
  function still runs in `test/playground-final-orchestrator.test.mjs`: the reject cases (`it.each` of
  eleven corrupt partial sources, then "classifies the harness shape") call it directly, and the accept
  path runs through `validateReceipt` in the `settlePartial` tests. `diagnostic-rejudge-source.test.mjs`
  covers `diagnosticRejudgeSource` and `isHarnessTransportFailure`, not `partialRecoverySource`.
- **Inert bookkeeping.** `orchestrate.mjs` keeps `freezeJudgeB`, the `judge-b` external reservation and
  the `gateway-rejudge-v1` receipt checks. With no producer they are bookkeeping for a closed study
  (`.agents/rounds/2026-11-09-playground-resumption.md`: no more B collection or recovery is planned).
  They stay as the record of how the stored receipts were validated.
- **Not removed.** `eval/qa/diagnostic-rejudge-source.mjs` has "Gateway" strings that check the
  Playground answer cost proof, not a judge. `judge-stability.mjs`, `run-p6-judge-self-test.mjs`,
  `judge.mjs`, `run-qa.mjs`, `re-judge.mjs` and `lib.mjs` never referenced the gateway judge.
