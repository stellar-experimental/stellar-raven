# Item 1.1 retirement review brief (Claude Fable 5.2, high)

You are the distinct retirement reviewer that `improvements-pipeline` step 7 requires for
**sls-033** and **sls-107**. You are not the author (the executor is Claude Sonnet 5.5) and not
the lead (Claude Opus 5.5). Worktree: `/home/tyler/code/raven-wt/np-1.1`. Read `AGENTS.md`,
`.agents/skills/improvements-pipeline/SKILL.md`, and `PLAN.md` in this directory (revision 2).

Hard rules:
- Read-only except your findings file. No posting anywhere. No model-calling eval.
  Keyless public reads (`curl`, `gh api` reads) are what you need.
- Do NOT open, print, grep the content of, or diff `q-tool-wallets-comparison` (battery file or
  its row in `eval/qa/cases.json`) until the lead sends you part B. Open no other QA case except
  `q-scf-resolve-passport-superseded-slug`. Nothing under `~/backups` beyond `ls`/`sha256sum`.

## Part A (now)

For each of sls-033 and sls-107, independently of the author's notes:
1. Read the finding and every upstream ref it records (state, close reason, linked PRs, latest
   maintainer comment), and the inbound handoffs #429 and #425 on stellar-experimental/stellar-raven.
2. Confirm the fix is deployed live, not merely merged (OpenAPI version / changelog).
3. Re-execute the original trigger yourself and record command, time and result.
   - sls-033: `type=Wallet&limit=200`: every platform fact has `sourceUrl`; no unavailable fact
     lacks a URL; spot-fetch at least two `sourceUrl`s and compare with the row note.
   - sls-107: `/api/stablecoins` and `?assetType=Fiat-Backed`: the AUDD, C1 and MGUSD checks in
     the handoff; no null `assetType`; same-minute toml reads for the three issuers.
4. Scan adjacent behaviour for residuals. For sls-107 decide explicitly on **BRLT** (all
   issuer-of-record fields null, check never ran; home_domain reportedly unresolvable) and
   **USDT0** (`not-named` with a note). Note sls-119 (#1971) already carries the EURC residual.
   Classify each: residual that needs a successor finding (say what it would state), or not a
   residual (say why).
5. Verdict per finding: RETIRE, RETIRE WITH SUCCESSOR (named), or DO NOT RETIRE.

Write `REVIEW-RETIRE.md` in this directory with a "Part A" section, then
`hc send t1r5 '<abs path of REVIEW-RETIRE.md>'` and wait in this terminal.

## Part B (when the lead sends "part B")

On the pushed branch: reconcile every `rg -n --hidden --glob '!.git' "sls-033" .` and the same
for sls-107 (goldens, register, intake, TODO, research, round records; dated records and the
generated `inventory/stellar-light.json` OpenAPI text are history/upstream text left unchanged).
Check the wallets-case golden edit (you may open it then; it is in tuning in v4) and the passport
repoint against golden-truth. Append a "Part B" section with verdict, then send the path again.
