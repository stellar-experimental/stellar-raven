# Lane brief: scope (advice for two owner decisions)

Read `briefs/common.md` first (rules, sources, limits). This lane writes one file and changes
nothing else: no case edits, no commits, no upstream posts, no model-calling eval commands.

The battery was rebuilt this round (ledger: `.agents/rounds/2026-11-14-golden-coverage-audit.md`,
Outcome section). Two owner decisions are open. The owner asked for your independent view, with
research and live probing, before deciding.

## Decision A: topics outside Raven's sources

Chain comparisons (Stellar versus another chain; now graded on Stellar-side facts only), Pi Network,
and regulation have cases in the battery, but Raven's four sources (Lumenloop, Scout, Stellar Docs,
skills) do not ground the non-Stellar side.

The owner's stance, quoted: "I definitely don't care much to help people understand non-stellar
facts/truth but where it's relevant in comparisons or it's tied closely and could be misleading
without this maybe it's smart."

Work out:
1. Which active cases and taxonomy leaves are affected (list every case id, its leaf, and which key
   facts are non-Stellar). Use `eval/qa/taxonomy.json`, `eval/qa/corpus/battery/`, `map/map-demand.json`.
2. How much real demand each topic has (map-demand evidence; `usage/` if it helps; web research).
3. What Raven returns today: probe each topic live with 2 to 4 realistic questions through Raven's
   `search` and `execute` (the way common.md describes), and record what grounded and what did not.
4. The harm of each failure mode: a wrong non-Stellar claim, a refusal, a Stellar-only answer that
   misleads by omission (for example Pi Network's relation to Stellar Core/SCP, or a regulatory
   status claim about XLM or a Stellar stablecoin).
5. Options per topic: keep as is; keep but grade only Stellar-side facts plus an honest boundary
   ("Raven's sources do not cover X; verify elsewhere"); narrow to the closely tied facts only;
   retire. Give cost (cases, tokens per run, maintenance of time-sensitive facts) and what would go
   unseen for each option.
6. A recommendation per topic and a per-case action list (keep, rewrite how, retire), short enough
   to apply in one pass.

## Decision B: does custody deserve its own leaf?

Review finding L5 (`review/REVIEW.md`): leaf `security.key-custody` is covered only by
`q-pc-multisig-setup-lifecycle`, a multisig question. Work out:
1. What "custody" means for Stellar users and builders (self-custody, seed phrases and hardware
   wallets, institutional custody providers, smart-account and passkey custody, recovery) and which
   of those other leaves already cover (`wallets.lost-keys`, `soroban.contract-accounts`,
   `protocol.signatures-multisig`, and others you find).
2. Whether Raven's sources ground a real custody answer (probe live, 2 to 4 questions).
3. Options: leave as is; swap primary and secondary so custody shows as an open slot; add one
   custody case (draft its question and up to four single-predicate key facts with sources, as a
   proposal only); delete the leaf and fold it into neighbours. Impacts, pros and cons of each.
4. A recommendation.

## Output

Write `.agents/rounds/2026-11-14-golden-coverage-audit/decisions/SCOPE.md`: a five-line summary with
both recommendations first, then the evidence for A and B, then what you could not verify. Plain,
compact prose; cite case ids, file paths, URLs and dated probe results. Do not record which
held-out set any case is in.
