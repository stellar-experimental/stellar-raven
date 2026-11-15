# The kept set: `tune/loop-1`

Prepared by the run lane (Claude Sonnet 5.5, terminal `tune-run`) on the orchestrator's instruction after the rulings: arm 1 kept by the owner as a named
exception, arm 2 kept by rule, arm 3 not merged (the map stays). Nothing here is measured: it is the measured code plus the non-blocking review fixes,
the TODO entries, and the held-out launcher.

## 1. What the branch is

`tune/loop-1` = `origin/main` as of `6ce86dce` (the code base of every measured run) plus arm 1 (`a321c5b7`), arm 2 (`3eb40f56`), and this round's records.
`origin/main` has since moved to `3d2ef5ea` (the client-text-limits and family-decider records, PRs 444 and 445). It changed no file under `src`, `test`,
`scripts`, `catalog`, `eval` or `package.json`; it changed `.agents/TODO.md` (65 lines added, 8 removed), where this branch also adds entries, so expect a
text merge in that file and nothing else. `git merge-tree` against `3d2ef5ea` showed no conflict before this round's TODO edits.

**Gates were run on `5fca33a3`** (the code and TODO commit). The branch tip adds this file only: `git diff 5fca33a3 origin/tune/loop-1 --stat` lists
`KEPT-SET.md` alone.

| Gate (each run bare) | Exit |
|---|---:|
| `npm run typecheck` (after `npm run typegen`) | 0 |
| `npm test` (153 files passed, 3 skipped; 3,452 tests passed, 3 expected fail, 3 skipped) | 0 |
| `npm run build` | 0 |
| `npm run test:smoke` (9 files, 143 tests) | 0 |
| `npm run eval:routing -- --gate` (GATE PASS) | 0 |
| Generated artifacts: the ten CI generators, exit; then `git diff --exit-code --stat` on the CI path list | 0 and 0 |
| `npm run secrets:scan -- --tree` | 0 (clean) |

Also run, free and outside the gate list: the arm 2 live replay (90 read-only Scout calls) again after N7: **identical to the pre-fix replay on every call**
(90 ok, the same 17 with an exact row, none on a query that names no existing document).

## 2. What changed since the measured commits

Arm 1's code is unchanged from `a321c5b7` (its checkpoint sentence, relation, manifest and routing evidence are byte-identical; `evidence-checkpoint.ts`, `detail-relation.ts` and
`catalog/manifest.json` have no diff). Arm 2's code is unchanged from `3eb40f56` except two changes that touch behaviour (N6, N7); both are free of any effect on a measured call.

| File | Change | Measured behaviour affected? |
|---|---|---|
| `src/policy/exact-evidence.ts` (N6) | One sentence per exact row, not per call. The A4 wording is unchanged, word for word | Only for a call with two or more exact rows. In the five-row read every marked call carried one exact row, so the model-facing text of every measured call is byte-identical |
| `src/executor/providers.ts` (N7) | The identifier token is not matched when a dash or dot and another digit follow it (`CVE-2024-1234`, `SEP-43.1`) | No A5 query changes. I checked 175 distinct research queries (the 90 replay calls, the 81 stored baseline queries, and every `searchResearch` query in the panel, arm 1, arm 2 and arm 3 artifacts): exactly one differs, "Stellar outage 9-20-14 post mortem RAM", whose old reading was a spurious `outage-9` token. The replay above is unchanged |
| `src/adapters/types.ts`, `src/site.ts` (N9) | The prose example no longer names SEP-43 ("a SEP or CAP number", "a slug such as `<series>-<number>`") | No: the comment is not served; the public page is not in the MCP surface. `src/site.ts` is the public page copy |
| `eval/gates.json` (N4) | The re-baseline note records the independent review | None |
| `src/catalog/README.md`, `ARCHITECTURE.md` (N3, N6, N7, N8) | Text only (see section 3) | None |
| `test/exact-evidence.test.ts`, `test/executor-providers.test.ts` | The per-row sentence; a unit case for the longer identifier | |
| `eval/qa/heldout-read.sh`, `eval/qa/heldout-read.mjs`, `test/heldout-read.test.mjs` | The held-out launcher and its counting logic (section 5) | None on the product |
| `.agents/TODO.md` | Section 4 | None |

The served surface is the arm 2 surface plus nothing: the MCP surface hash of the measured baseline (`b336fa14…3404`) is unchanged by these edits (no instruction, tool
description or catalog text changed). The Playground-only text and the micro-map are as on `origin/main`.

## 3. Review fixes N1 to N10 (TUNE-DIFF-REVIEW.md), as written

| # | Disposition |
|---|---|
| N1 | **Recorded here, no code.** `codemode.describe(id)` and `codemode.catalog()` return `retrievalProfile`, which for the 11 Docs search operations now includes `{ id: "stellarDocs.get_doc_page", relation: "detail", on: ["partial"] }`. "Everything else in a result is byte-identical" is true of `execute` text and false of `describe` and `catalog` results. Under A1 K5, a page read that follows a `describe` of a Docs search operation is a path arm 1 opened |
| N2 | **Not applied, as the review says.** The sentence's nouns ("sections of pages, not whole pages") are A7's frozen wording, and they stay until a second family gets a `detail` edge, when they should be generated from the edge |
| N3 | **Applied** (note in `src/catalog/README.md`: a `detail` edge does not read `on`, so `on` on it is cosmetic). No code, no test |
| N4 | **Applied**: the `eval/gates.json` note now ends "Independent review: Claude Opus 5.5, `.agents/rounds/2026-11-14-baseline-tuning/TUNE-DIFF-REVIEW.md` (it re-ran the runner on both manifests and found 544 of 544 rows identical)". The gate passes |
| N5 | **No action, as the review says.** The exact-row URLs in the ledger and telemetry are public; the model-facing footer carries keys only |
| N6 | **Applied with a test**: one A4 sentence per exact row (`exactEvidenceSentences`), wording verbatim. The test checks two sentences for a two-row call, each naming its own row |
| N7 | **Applied with a test**, after confirming on the full query strings that no A5 query has a dash or dot and a digit after its identifier (section 2). Regex `/\b([A-Za-z]+)[- ]?(\d+)\b(?![-.]\d)/g`. The unit case: `CVE-2024-1234` names no `cve-2024` row; `SEP-43.1` marks nothing; `SEP-43-draft`, `what is SEP-43?` and `SEP-43,` still mark `sep-0043`. One consequence the review noted as arguable: `SEP-43.1` used to mark `sep-0043` and now marks nothing |
| N8 | **Applied** in `ARCHITECTURE.md`: "The host trusts the upstream `source` label; it does not check the URL host." |
| N9 | **Applied** (optional in the review): the SEP-43 examples in `src/site.ts` and `src/adapters/types.ts` are generic. Tests pass (`test/auth.test.ts` pins only the envelope line) |
| N10 | **Not applied, as the review says** (no fix needed now). If a candidate operation with two arrays of `source` and `url` items appears, add the array key |

Also fixed in the same commit, in `ARCHITECTURE.md`: the sentences about the per-row exception and the identifier rule now describe N6 and N7.

## 4. TODO entries added (`.agents/TODO.md`)

- **Routing** (after the PH4 item): "Get research called when a question names a SEP or CAP" (the gap arm 2 cannot reach), with a done-when rule.
- **Executor and tool surface** (before "Measure read past the snippet guidance"): "Two snippet-only rows no Docs page can answer" (`q-soroban-contract-id-derivation`, `q-sep-45-contract-auth`), with a done-when rule. The two older arm 1 notes there are updated from "under measurement" to the measured result.
- **Caps audit follow-ups**, after M3: the arm 3 result in M3 and a new item, "Carry the corroboration guard on a surface every client receives, then remove the micro-map", with a done-when rule (evidence: `ARM-3.md`, `research/audits/2026-11-14-client-text-limits.md`, which arrives with the merge of `origin/main`).
- **Eval instruments**: a standing method note, "same-surface verdict noise, and the judge-tier cap" (17 of 50 rows; fix `--max-panel-cases` and the register per run), with a done-when rule for deleting it.

## 5. The held-out launcher: `eval/qa/heldout-read.sh`

Written for the orchestrator to run; I did not run it, and I read nothing from the split file beyond `sets.tuning` (this round, only the 50 panel ids are used).

**Behaviour.**

- Arguments: the sealed ids file (commas, spaces or newlines), a port, a sealed output directory (must exist, must be outside the repository), and the stored baseline results file.
- It starts nothing. A `dev:eval` server on the kept commit must already listen on the port; `report-live-surface --expect-source-revision <HEAD>` stops the run if the server does not serve this commit. It requires a clean worktree.
- Before any spend, `heldout-read.mjs plan` asserts the ids are distinct, all in `eval/qa/cases.json`, and all lifecycle-active, so the runner's planned jobs equal the id count (it also compares with a separate count of the ids file). Any failure prints counts only.
- Pins as TUNE-IMPL-1.md section 7: the pinned Claude Code 2.1.325 wrapper (stops unless its hash is the panel runs'), the environment hash, the probe hash (stops unless it is the panel runs'), the remote vector, the stability register (`STABILITY_REGISTER`, default `gca-eval`'s file, stops unless its hash is the panel runs'), and the live surface hash. The vector and the surface hash are recorded, not compared with a constant, because the kept surface differs from the baseline's only if a text changed.
- One collection: `--max-budget-usd 30`, `--max-panel-cases <id count>`, so no boundary-eligible row is skipped, the same policy as the panel runs.
- All runner, probe and surface-report output goes to `runner.log` and `launcher.log` inside the sealed directory. The pins go to `pins.txt` there. The script never echoes the ids and does not use `set -x`.
- The results file leaves `eval/qa/results/`: it is moved to `<sealed>/results.json`, its SHA-256 goes to `<sealed>/results.sha256`, and no plan, register or paired script is run on it.
- It prints only: the results SHA-256, the runner's exit code, jobs planned and completed (and judged), cost, counts of correct, partial, wrong and error, core-answer-correct, trap rows passed of total (a trap row passes when its verdict is `correct`), and the paired counts against the stored baseline (rows up, rows down, became wrong, left wrong), with the number of rows it could not pair. A row is paired only when both files hold the same `caseInputSha256` (a case edited since the stored run, such as the four PR 442 cases, is not paired).

**Known exposure outside the script.** `run-qa.mjs` takes its ids as one `--ids` argument, so the ids are in the runner's process arguments (`ps`) for the length of the run. Run it on a machine where that is acceptable, or add an `--ids-file` flag to the runner first.

**Exact invocation** (the held-out read needs the kept commit, a keyed server, and about 5 minutes for the remote-identity probe before the first call):

```sh
KEPT=$(git -C /home/tyler/code/raven-wt/tune rev-parse origin/tune/loop-1)          # the tip after this push
cd /home/tyler/code/raven-wt/gca-eval && git checkout --detach "$KEPT" \
  && npm ci && npm run typegen && test -z "$(git status --porcelain)"
hc run --bg --name kept-server --cwd /home/tyler/code/raven-wt/gca-eval npm run dev:eval -- --port 8800
hc wait kept-server --output Ready
eval/qa/heldout-read.sh /path/to/sealed-ids.txt 8800 /path/to/sealed-dir \
  /home/tyler/code/raven-wt/gca-eval/eval/qa/results/2026-11-14T20-13-51-variantA.json
hc kill kept-server
```

The sealed ids file and sealed directory must be outside the repository. The stored baseline file is the held-out comparison's reference (A8's paired counts, "a diagnostic, no ids").

**Test of the counting logic.** `test/heldout-read.test.mjs` (8 tests, in `npm test`) covers the id parsing, the plan check (an empty list, a duplicate, an unknown id and a quarantined case each fail with counts and no id), the counts on a synthetic file pair (verdicts, core answers, traps, paired up and down, became wrong, left wrong, an unpaired changed case, an ungraded row, a short run), that the rendered text carries no id, and that the shell script is valid bash, has no `set -x` and no echo of the ids, and refuses wrong arguments without printing an id. As the instruction asked, I also ran the counting on the 50 panel ids against the step 0-prime results only, with the stored baseline as the reference:

```
jobs planned: 50
jobs completed: 50 (judged 50)
cost USD: 9.7419
verdicts: correct 22, partial 25, wrong 3, error 0
core-answer-correct: 48 of 50
trap rows passed (verdict correct): 4 of 6
paired against the stored baseline on 50 rows (0 not paired: case input changed, absent, or ungraded): rows up 8, rows down 9, became wrong 3, left wrong 3
```

Every figure equals the independently computed step 0-prime numbers (`STEP-0-PRIME.md`: 22/25/3, 8 up, 9 down, 3 new wrongs, 3 left wrong, cost 9.74; 4 of 6 trap rows correct; core-answer-correct 96.0%).

## 6. Open points for the orchestrator

- The `ps` exposure above is the one place an id can leave the sealed directory. An `--ids-file` flag on `run-qa.mjs` would close it; I did not touch the runner.
- The launcher's pin constants are the panel runs' (wrapper, probe, register). If Claude Code or the probe changes before the held-out read, the script stops, by design; a new pin needs a new authorization.
- Merging `tune/loop-1` into `main` will conflict only in `.agents/TODO.md`.
