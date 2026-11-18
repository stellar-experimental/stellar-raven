# Item 8.3 report: model families at their latest

Lead: Claude Opus 5.5, agentpc `t1yy`, 2026-11-18. Branch `np/8.3-model-families` (from
`origin/main` at `74d3aebf`, after #493).

## Pull request and result

[#494](https://github.com/stellar-experimental/stellar-raven/pull/494), one PR. Records and code
are in separate commits. No issue applies, so there is no `Refs`.

- **Launch lines, roster, `AGENTS.md`, `run-evals`, `.agents/README.md`.** They name families.
  Claude Code takes `sonnet`, `opus` and `fable` natively; the `sonnet` smoke resolved
  `claude-sonnet-5-5`. Codex and Grok have no alias, so the new `scripts/latest-model.mjs <family>`
  picks the newest model from the CLI's offline catalog cache. Today it resolves `gpt-6.2-sol`,
  `gpt-6.2-astra`, `gpt-6.1-terra` and `grok-4.7`. Launch lines use the two-step
  `M=$(...) && hc run ... -m "$M"` form, so a resolver failure stops the launch. The Codex reviews
  in this item ran on that path.
- **Eval artifacts record the exact ID that ran.** The requested alias is stored beside it.
  - The first response pins the ID for the rest of the run.
  - An unknown or mixed model stops judging, or makes the run non-comparable.
  - A resume or re-judge keeps the judge the file recorded.
  - The comparators, the re-judge guard, the Playground validator and the stability register
    refuse an alias or a null as an identity.
  - Stored v4 QA files and v3 Playground files stay readable.
- **`eval/EVALS.md` rule 7.** A change of resolved model is not like for like, and a baseline
  re-baselines when its resolved model changes.
- **Playground.** No provider offers a family or `latest` alias. AI Gateway `custom/` aliases were
  considered and rejected: they live in the account, add a second fallback layer, and still need
  a manual bump. `DEMO_CATALOG_LATEST` therefore holds the exact catalog IDs, and a TODO item
  names the bump trigger.
- **Reviews.**
  - Claude Fable plan review: all 11 findings adopted.
  - Codex workhorse diff review (`gpt-6.2-sol`, high): 4 blockers and 7 others. Two re-checks
    followed, and the last approves.
  - Sonnet 5.5 executor: three rounds.
  - Records: `REVIEW.md`, `CODEX-REVIEW.md`, `CODEX-RECHECK.md`, `CODEX-RECHECK-2.md` and
    `EXEC.md`.
- **Gates.** I ran each one bare at the final head: typecheck, `npm test` (4283 passed),
  build, `test:smoke` (173), `eval:selftest` and `secrets:scan`. All pass. `eval:qa:lint` and
  `eval:qa:register` are left to CI under the case rules.
- **Model calls.** Four trivial CLI smokes by the lead: Claude twice, Codex once, Grok once. The
  second Claude smoke was over the note's one-per-CLI allowance. Fable finding 9 asked for it, to
  confirm that stream-json `init.model` under an alias is the exact ID. No eval and no paid API
  call ran.

## Deploy

Needed, with no behavior change. `src/demo/model-config.ts` bytes change. The Playground primary
(`openai/gpt-6.1-terra`) and fallback (`anthropic/claude-haiku-5.5`) are byte-for-byte unchanged.
The Grok control constant moves from `xai/grok-4.6` to `xai/grok-4.7`, and only tests read it. The
change is model-facing in name only, so no verdict needs measuring.

## Dated runs

The change is safe to merge before 2026-11-23 18:00 UTC. The dated briefs carry their own explicit
launch lines (`gpt-6.1-sol`, `grok-4.7`, Claude aliases), run no eval and no re-judge, and were not
edited.

## For the orchestrator

- Merge #494 and deploy from the Mac.
- `briefs/ITEM-LEAD.md` and the dated item 1.4 briefs still pin `gpt-6-astra` and `gpt-6.1-sol` in
  their Codex lines. I left them alone because they are dated round files and the dated runs
  depend on them. If you want them on the family form, change them after run 2.2c merges.
- **Measurement change: the QA judge default** moves from `claude-sonnet-5` to `sonnet`
  (`claude-sonnet-5-5`). Stored `claude-sonnet-5` verdicts and the local stability register become
  a different judge. Resumes and re-judges of those files stay on `claude-sonnet-5`. Before the
  next headline judged run, the paid seven-case self-test must run on the resolved judge under its
  own authorization. The TODO item "Run the judge self-test on the resolved judge model" holds it.
  The self-test now requires an exact `--judge-model`, and its wrapper hash changed, so a frozen
  run sheet must record the new hash.
- **Mac paths.** The resolver reads `~/.codex` and `~/.grok` on whichever machine runs it, so the
  Mac's caches decide its launch IDs. Nothing else is Mac-only.
- **One note from the Codex reviewer.** A broad search returned a match from
  `eval/discovery/cases.json`. That file is not on the case-search ignore list and is not a QA
  held-out or reserve file. The reviewer did not use it. Its re-check also notes that the existing
  `re-judge.test.ts` suite reads case fixtures internally; no case text was shown.

## Open questions for the owner

None blocking. One judgement is the owner's to override: under "latest", the QA judge moves at
every Sonnet release, and each move costs a paid self-test and a new baseline. I applied the
instruction as written ("eval defaults"). If the owner prefers to keep the judge on one exact ID
between deliberate moves, that is a one-line default change; the identity machinery is still
needed.
