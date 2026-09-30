# Review brief — PR D (golden freshness pass), round raven-next 2026-09-30

You are the independent reviewer this `golden-truth` change requires. The author is `raven-next`
(Claude Fable 5.1). Review branch `golden/queued-freshness-2026-09-30` against `origin/main` in the
worktree `/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/raven-next-d`.

Read `.agents/skills/golden-truth/SKILL.md` (Steps 1 to 6 and Hard rules) and the "PR D" section of
`.agents/rounds/2026-09-30-raven-next.md` first.

## What changed

Five case files under `eval/qa/corpus/battery/`, the generated `eval/qa/cases.json`, `sample.json`,
`lifecycle-registry.json`, `consistency-register.json` (eight clusters re-stamped through
`.agents/rounds/2026-09-30-raven-next/register-review-d.json`), two `TODO.md` items removed, and
`NEXT.md` item 3.

## What to verify, independently and live

Re-derive every claim in the corroboration matrices from the sources yourself, today, without
trusting the author's notes:

1. `q-gap-builders-person-empty`: `https://stellarlight.xyz/api/builders?q=zzzzqqq` and
   `/api/status` (count, advisory wording). If you can call the Raven connector, repeat
   `scout.getBuilders` too.
2. `q-defi-x402-on-stellar-what`: `https://stellar.org/x402`, the Linux Foundation press release
   named in the case, `https://x402.org/members`. Say whether "SDF holds a Governing Board seat"
   is supported by more than SDF's own page, and whether the three dates in the new sentence are
   right.
3. `q-asset-trustline-basics` and `q-asset-amm-fee-reserve`: the lumens and liquidity-pools pages
   and `https://horizon.stellar.org/ledgers?order=desc&limit=1`.
4. `q-builder-content-by-person`: count the articles in the main list of
   `https://developers.stellar.org/meetings/authors/kalepail`; check the archived state of
   `kalepail/passkey-kit` and `stellar/launchtube` through the GitHub API.

Then check the encoding against the skill: no disputed fact pinned; volatile facts dated in the
golden text and `truth.asOf`; `truth.verified` carries date, by, evidence, and a non-score
`rootCause`; sibling sweeps recorded; no new judge-blind avoid item; key facts still durable. Say
whether any change could launder a score (a change that only helps an agent's answer grade
right). Run `npm run eval:qa:compile`, `npm run eval:qa:lint -- --since origin/main --stale`, and
`npm run eval:qa:register -- --check`, and report the exact results.

Do not edit repository files. Do not post anything upstream. Do not run paid evaluations.

## Output

Write your findings to `tmp/review-d-grok.md` under the worktree root: a verdict line (`accept`,
`accept with fixes`, or `reject`), a numbered list of findings with file, claim, evidence, and
expected fix, then what you verified and found correct. Reply in the pane with only the path.
