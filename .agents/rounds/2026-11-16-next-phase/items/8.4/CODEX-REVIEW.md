gpt-6.2-sol · Codex workhorse · high · agentpc t1zc

**Verdict** approve with changes

1. **should** — `.agents/model-roster.md:101` still directs a lead to use the previous model after a failed launch. The resolver only selects the newest visible model, so following that direction requires a manual version selection and conflicts with the dated briefs' fail-closed rule (`items/1.4/dated/2.1-LEAD.md:82-85`) and `briefs/ITEM-LEAD.md:84-85`. Replace it with “If resolution or launch fails, record the reason and follow the lane's tier fallback.”
2. **nit** — `.agents/rounds/2026-11-16-next-phase/items/8.4/EXEC.md:132` has a trailing space. Remove it to clear `git diff --check origin/main..HEAD`.

All 13 edited launch lines passed Bash argument checks with real offline resolution and a stubbed `hc`. With a resolver exit of 17, every line returned 17 and skipped `hc`. This review session's `hc` argv confirms the scoped Sol launch. The dated lead starts on `origin/main` with `--model opus` (`launch-dated-lead.sh:125-135`). All five dated diffs are confined to the requested edits and retain the reviewer tier, fallback order and recording rule where applicable.

The plain Node v24.22.3 gauntlet import passed and all 37 tests in `test/demo-model-config.test.ts` passed. The membership test catches removal or replacement of a default client (`:82-87`). The gateway doc's placeholders and explicit config match the model validation and identity hash (`eval/qa/gateway-judge.mjs:16-21,41-49`, `eval/qa/gateway-rejudge.mjs:27-32`). The scan found no other live version selections beyond the reconciled catalog literals and the fixed Kimi transport control (`src/demo/model-config.ts:27`).
