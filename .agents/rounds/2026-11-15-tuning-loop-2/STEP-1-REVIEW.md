# Review: step 1 of the second tuning loop (the guard, then the map)

Reviewer: Claude Opus 5.5 (`claude-opus-5-5`), a fresh session, terminal `t1pn` (`loop2-diff-review`), effort high.
Author: Claude Sonnet 5.5 (`loop2-impl`). Orchestrator: Claude Fable 5.2. Tier: Claude Opus, the stable fallback. The
matched tiers were taken: Codex frontier was not used because this lane was launched as a Claude session by the
orchestrator, and Fable is the orchestrator. I also wrote `PLAN-REVIEW.md`, so amendments A1 and A2 (placement and
wording) are my own text. I say so wherever a finding is against them.

Scope: `origin/main` (`0a603453`) to `4a22d973` on `tune/loop-2`. I read the plan, the plan review, the amendments,
`STEP-1-IMPL.md`, the ledger, and the diffs of `15e07a87`, `1b264ee2`, `b8ea957d`, `5fb6efcc`, `0a343e3f`, `807f1b6d` and
`f088a21a`. No model call and no spend. Stored runs were read for `sets.tuning` rows only, selected by id with
`eval/qa/tuning-rows.mjs` before any other field, from the split whose hash the loop 1 ledger records (`697c550a…`). I read
no held-out or reserve row, no golden answer and no key fact. The routing gate was read as its aggregate line only. All
throwaway files (two worktrees, two scratch smoke tests, size scripts) lived in my scratchpad and were deleted.

## Verdicts, per commit

| Commit | What | Verdict |
|---|---|---|
| `15e07a87` | `PLAN-AMENDMENTS.md` | **Fit.** All ten blocks are byte-exact copies of their stated ranges. Two ranges are too short (R4). Not blocking, because the file says the review governs |
| `1b264ee2` | Panel scan | **Fit.** The rule, the 58 ids and the counts reproduce |
| `b8ea957d` | Guard (G) | **Fit to measure.** Wording is A2 byte for byte, placement is A1, and it appears exactly once wherever A1 says it should. No blocking finding. R5 and R6 are known limits that go in the record |
| `5fb6efcc` | Answer-reading scans | **Fit.** Selection by id is correct. The replay is a static text check, and the standalone count is an upper bound (both disclosed) |
| `0a343e3f` | Map removal (M) | **Fit to measure.** The built Worker serves BASE exactly, both descriptions and both input schemas are byte-identical, nothing user-facing or model-facing still mentions the map, D1 to D4 are fixed, and the commit reverts alone. It must not ship without A5's `search` opening (R7) |
| `807f1b6d`, `f088a21a` | Reference read; read packets and brief | **Blocking for the read, not for collection.** The A2 rubric (my text) scores a claim attributed to a source that no result returned as no violation. Fix R1 before any P0 or P1 answer is read |
| Proposed P1 command (`STEP-1-IMPL.md` section 7) | | **Two blocking fixes before launch** (R2, R3) |

P1 is fit to collect once R2 and R3 are fixed and the P0 lane has released `gca-eval`. R1 must be in the ledger before the
P0 read starts.

## Blocking findings and exact fixes

### R1 (high, against my A2 rubric). A fabricated attribution counts as no violation

A2's rubric counts a violation only for a *bare* statement of class 3, 4 or 5. A statement attributed to a source that
no result returned is class 5 with form `attributed`, so it scores as clean. The stored reference read already holds
such statements:

- baseline `q-pc-quantum-preparedness-dormant`: "The 2026-11-06 weekly roundup says Bell went live on testnet, with a
  mainnet vote on November 23." No such roundup appears in any result.
- baseline `q-protocol-version-history-list`: "The guide's changelog says the Mainnet upgrade completed 2025-10-22." The
  guide was never returned.
- baseline `q-soroban-vuln-classes`: "the Halborn report on Peridot Finance flags an auth-ordering gap…". This is an
  audit claim citing a report that the read found in no result.

All three come from packets that were cut at 14,000 characters and were **not** re-read uncut, because only violation
rows were re-read. So they may be truncation artifacts, or they may be real fabrications. Either way the rule cannot
tell.

This matters most for P1. The guard tells the agent to "name the source and date". If an agent with no source invents
one, the bare violation becomes a clean attributed sentence. The read would then credit the guard for a worse answer.
That is the misleading direction R1 opens (see "The P1 comparison" below).

**Fix (ledger entry plus a code change in `eval/qa/corroboration-rubric.mjs`, `claim-read-brief.md` and the fixtures):**

> A violation is a statement of the four kinds that is (a) bare, with support class 3, 4 or 5, or (b) attributed or
> hedged to a named source or record that no result returned (class 5). Report (b) in its own column, "unreturned
> attribution". A source-scoped absence statement about a source that was searched ("the index has no audit evidence")
> is not (b).

Add a ninth fixture: a class 5 attributed sentence that must count. Then re-read the packets of the five class 5 rows
from uncut results: the three above, plus arm 1 and arm 3 `q-defi-agent-identity-stellar-experimental`. Re-tally both
references. Nothing else in the read changes, because the support and form columns already exist.

### R2 (high). The P1 command's judge policy differs from P0's authorization

The ledger authorizes P0 with `--max-panel-cases 58`. The proposed P1 command passes `--max-panel-cases 100` on every
call. `eval/qa/paired-verdict.mjs` puts `maxPanelCases` in the collection tuple (`tieringTuple`). Every candidate run must
equal the baseline's tuple, or the tool reports `measurement-tuple`. So the paired P0/P1 check would refuse the pair.

On verdicts the two values make no difference, because neither binds at 58 or 10 rows. On the record they differ, and
the plan's standing method says "one judge policy". Loop 1 set the cap to the run size: its runs carry 50 (`cli-override`),
and its 79-row baseline carries 34 (`bounded-scaled-default`).

**Fix:** read `meta.judgeTiering.maxPanelCases` from P0's results file and pass that value (58) to all three P1 calls,
the guard-row passes included. Record in the ledger that the plan's "100" is superseded by P0's value. Also record that
the P0-against-arm-1 null pairs a cap of 58 with a cap of 50. Both caps are at or above the run size, so no row is skipped.

### R3 (medium). Repeat passes change the denominator of the P1 violation rule

A3's rule is "violations in P1's claim-word answers ≤ the P0 rate on the same read × P1's count, rounded up, + 1". P1's
count would include the 20 answers from the two repeat passes over the 10 guard rows. The guard rows were chosen because
they are the most claim-dense rows. P0 has one pass over the 58. The P1 rate is therefore drawn from a richer mix of rows
than the P0 rate. It can rise from composition alone, and the rule would then keep the map for no reason. If the guard
rows are cleaner than average, it can also fall from composition alone.

**Fix:** apply the A3 rule to P1 pass 1 only, the same 58 rows as P0. Report the repeat passes in a separate per-row
table against those rows' P0 samples, and use them for the over-hedging trace (H1, H2) and the "Guard delivered" row.

The P1 command also starts in `/home/tyler/code/raven-wt/gca-eval`, where the P0 lane (`loop2-run`, server `p0-server`)
is working now. P1 must not check out there until that lane has finished and released the worktree. The orchestrator
owns that ordering.

## Non-blocking findings

- **R4 (low). Two amendment ranges cut text.** The A6 block ends mid-sentence ("Its keep"). Review line 248, "result is
  evidence for that operation only, and the plan should say so in the license table", is missing. The A3 block holds
  only the replacement row. It drops the reference, scope and claim-word paragraphs (review lines 172 to 183), which the
  implementer applied anyway. Fix: extend the ranges to 239–248 and 172–190 and recopy. A6 gates item 5, not step 1.
- **R5 (low, against my A1). A build-stage run with a candidate-lane call carries no guard.** When the PRIOR-ART block
  renders, the CANDIDATE block stays suppressed (existing behaviour) and A1 also suppresses the line. The PRIOR-ART
  clause covers audit status only, not incident, governance or standards authorship from a research or semantic row.
  The stored tuning runs show this on 3 of 398 executes (rows `q-nft-vault-contract-standards`, a panel row with claim
  words, and `q-infra-which-indexer`). Do not change it before P1. The P1 read must read
  `q-nft-vault-contract-standards`, which it does anyway, because the read covers claim-word answers with or without the
  guard. If it shows a violation, the fix is the line after the PRIOR-ART block when `candidateEvidence > 0`.
- **R6 (low). On Grok, the guard arrives only on results under 20,000 bytes.** Grok keeps the first 20,000 bytes and
  moves the tail to a file. The guard sits at the tail, like every host block. Of the stored tuning `execute` results,
  52 of 398 (13%) already exceed 20,000 bytes, and so do 29 of the 103 that carry the CANDIDATE block (28%). The guard
  pushes 1 of 398 results over the line. Grok never received rule 2 (its 2,033 cut fell inside the map header), so this
  is still a net gain. Put it in the license table: "Grok: the guard on results under 20,000 bytes only".
- **R7 (medium, forward). M depends on A5.** After M, OpenCode, which lists 117 characters of each description, has no
  up-front family list until item 4's `search` opening lands (A5). Nothing deploys before the held-out read, so this is
  safe during the loop. It becomes a rule at the keep commit: M ships only with A5's opening, or M reverts.
- **R8 (medium, forward to step 2). Adding `stellarOrg` to `CORROBORATING_FAMILIES` would make SDF's own posts
  official by data.** The plan adds `stellar.org` to `<families>`. Through this code, that both names it in the sentence
  and exempts its calls from the standalone line. A2's class 3 explicitly includes "a foundation post asserting a
  governance outcome". The step 2 review must decide whether the SDF site is an official family for all four claim kinds
  or only for its programme and directory pages. It should not land as the one-line data change the plan describes.
- **R9 (low). The claim-word scan misses common incident words.** The list has no `attack`, `drain(ed)`, `compromis*`,
  `stolen` or `theft`. It picks the rows to read, and the same scan runs on both arms, so the gap is symmetric but costs
  recall where the owner cares most. Optional: add them before the P0 read and apply them to both arms.
- **R10 (low). A commit-message overstatement.** `b8ea957d` says the wording was "frozen before any stored answer or
  transcript was read". Deviation 2 discloses one peek before it. The record (`STEP-1-IMPL.md`, the ledger) is accurate.
  The message cannot change, so this note stands as the correction.

## The checks, one by one

### 1. Amendments verbatim

A script split `PLAN-AMENDMENTS.md` at each heading and compared each block with `PLAN-REVIEW.md` over the range its
heading names. A1 to A10 and the appendix (306–376) are all byte-exact. Range defects: R4.

### 2. Wording frozen, and the peek

- The template in `scripts/catalog-data/source-families.mjs` equals A2's quoted sentence byte for byte, with
  `` `<families>` `` replaced by `{families}`. Its SHA-256 is `780fae73…9a3c`, and a test pins it.
- The rendered sentence is 415 characters. My review said 416, and my count was wrong.
- `git log -S CORROBORATION_GUARD_TEMPLATE` shows one commit, `b8ea957d` (03:23:29). The first answer-reading scan
  (`5fb6efcc`) came after it (03:28:52), and no later commit touches the template.

**The peek could not have shaped the wording.** Every word of the sentence is mine, copied verbatim. The only free choices
were the substitution, whose names and order A2 fixed ("Stellar Docs, a skill"), and the form of the standalone line. A1
says "its own line", and the implementer added no heading. Nothing an implementer saw in one claim-free answer and two
result excerpts could move either choice. I wrote A2 after reading two answers' audit sentences, as `PLAN-REVIEW.md`
"Limits" records, and named neither row.

### 3. Placement, collisions and cost

**Run, not inferred.** A throwaway smoke test in a clean worktree at `0a343e3f` sent 14 `execute` scripts through the
assembled Worker's `/mcp` (miniflare, stubbed upstream, the real executor and Dynamic Worker):

| Script | Guard | Where | Other blocks |
|---|---:|---|---|
| Docs search only (ok) | 0 | | SOURCE METADATA, CHECKPOINT |
| Skill read only | 0 | | |
| `scout.listAudits` (rows) | 1 | Own line after SOURCE METADATA, before CHECKPOINT | |
| `scout.listAudits` (no rows) | 0 | | EVIDENCE RECOVERY |
| `scout.searchRepos` | 1 | Own line | |
| `lumenloop.get_project` | 1 | Own line | |
| `scout.searchResearch` with an exact row | 1 | End of CANDIDATE block | Exact-row exception after it |
| Lumenloop semantic + Docs | 1 | End of CANDIDATE block | |
| Docs + `listAudits` | 1 | Own line | |
| Research + `listAudits` | 1 | End of CANDIDATE block (no second line) | |
| Build skill + `searchRepos` (prior art) | 0 | | PRIOR-ART |
| Build skill + `searchRepos` + research | 0 | | PRIOR-ART (R5) |
| Throws after `listAudits` | 0 | | isError |
| No service call | 0 | | |

Each result has the guard once at most. It never appears with the PRIOR-ART block, and it always comes before the
exact-row exception and the EVIDENCE CHECKPOINT. A runnable skill's internal calls also reach the ledger (`buildOpsFns`
feeds both the sandbox and the skill-run facade with the same `onOpCall`), so a skill run over Lumenloop or Scout gets the
line too. That was not run, but follows from the code. The Playground is covered by unit and smoke tests only.

**Cost.** The guard adds 416 characters inside the block (a space and the sentence) and 417 as its own line, about 100
tokens. In the stored tuning runs, 103 of 398 `execute` results carry the block, and the standalone line would add at
most about 20 more. That is roughly half a guarded result per row. The median result is about 8,200 bytes, so a guarded
result grows about 5%. Per question it is well under 1% of client input tokens (an estimate, not measured).

**Boundaries.** Host blocks are appended after the 24,000-character `execute` truncation, so the guard never displaces
evidence. Claude Code's cap is 25,000 tokens, far above any result. Grok: R6.

### 4. What the fixtures prove

`test/fixtures/corroboration-cases.json` holds eight invented sentences, the seven catch cases and the one pass case,
each with a hand-assigned support class and form. The test proves three things:

- the claim-word pre-screen picks each sentence;
- the form heuristic sorts it as labelled;
- `classify` turns the hand labels into the right violation flag.

So the fixtures test the read's arithmetic. Case 2 (a report used beyond its scope) passes only because it is labelled
class 5. The scope rule lives in the brief's class 5 example, not in code. That is acceptable, because a human or model
reader assigns the class.

The fixtures do **not** test:

- whether the guard text changes what an agent writes (only P1 can say that);
- whether a reader assigns classes correctly (the first read found 11 violations, and the uncut re-read found 2);
- the scan's recall on real answers (R9);
- the unreturned-attribution case (R1).

The guard itself is text, not a filter. Its tests (`test/corroboration-guard.test.ts`, `test/server.test.ts`, and the
smoke run above) prove delivery and placement only.

### 5. Generality

The lines that the diff from `origin/main` to `0a343e3f` adds under `src`, `scripts`, `catalog` and `wrangler.jsonc` hold:

- no `q-` case id;
- no project, auditor or standard name (Soroswap, OtterSec, Runtime Verification, OpenZeppelin, ERC-3643, Aquarius,
  Blend);
- no SEP or CAP number;
- no boost, weight or score term.

A 5-word shingle comparison of those lines against the 79 tuning questions finds no shared phrase. The families come from
data. The ledger condition (`hasServiceData`, the op's family) names no operation or topic. I did not open golden text,
so "no golden fragment" rests on the provenance: the only new model-facing prose is A2's sentence, which I wrote without
reading a golden.

### 6. The map removal

- **Served text, from the assembled Worker** (smoke `initialize` and `tools/list` through `/mcp`, both tips):

  | Tip | Instructions | `search` | `execute` |
  |---|---|---|---|
  | G | 4,066 `5d9244e5…3c2e`, includes the map | 1,930 `1f8a31b5…8478` | 2,029 `51d3f830…d8a5` |
  | M | 1,899 `67a6bd0b…6c00`, `=== BASE_SERVER_INSTRUCTIONS` true | same | same |

  Both input-schema hashes are also identical across the tips. The built bundle (`dist/server.js`) at M holds no "Source
  Micro-Map", no "Authority Rules", no Playground "and Source Micro-Map" phrase, and no site rule paragraph. It still
  holds `FAMILY_LINE` and the guard.
- **Dangling mentions.** `git grep` over everything except dated records finds only file names (`micro-map.ts`,
  `build-micro-map.mjs`, `micro-map:build`) and maintenance comments. The plan defers the renames to the keep commit.
  `plugins/openai/VERIFICATION.md:257` is a dated verification note. No served text, site page, README, skill or
  ARCHITECTURE sentence still claims the map exists.
- **D1 to D4.** Each fix is the replacement `ARM-3-REVIEW.md` prescribed: ARCHITECTURE paragraph, README, the site's
  "which to trust" phrase and its rule paragraph (deleted), and the drift skill comment.
- **Reverts alone.** `git revert --no-commit 0a343e3f` at M gives a tree identical to `5fb6efcc`. On the branch tip
  `4a22d973` it applies cleanly and differs from `5fb6efcc` only by the later tooling test.
- **What each client loses, and what now carries it:**

  | Client | Lost | Carried now by |
  |---|---|---|
  | Claude Code 2.1.296+ | The four family lines and rules 1 to 3 | Rule 2: the guard, in results after the call rather than at planning time. Family scope: `FAMILY_LINE` in `search`. Rule 1: in part, BASE's "classify claim scope; plan source families". Rule 3 ("start Scout or Lumenloop even when Docs mention it"): nothing. That is what P1's map row measures |
  | Claude Code before 2.1.296 | The first about 147 characters of the map past BASE | Nothing needed |
  | Grok | The map header, part of a Lumenloop line and the `… [truncated]` marker | Rule 2 via the guard, on results under 20,000 bytes (R6) |
  | Codex | The map inside `ALL_TOOLS`, only when printed | Guard in results, if the model prints the host block |
  | OpenCode | The whole map, its only up-front family list | Rule 2 via the guard. Family list up front only after A5 (R7). Rules 1 and 3 unmeasured |
  | Playground | The whole map in its system prompt, and the preamble pointer | Rule 2 via the guard (`candidateEvidenceSection`). Not measured |

### 7. Scans and row hygiene

- `tuning-rows.mjs` reads `split.sets.tuning` only, asserts 79 unique ids, and `selectById` filters every results or
  cases list on `id` alone and asserts the count. `scan-tuning-panel.mjs`, `scan-corroboration.mjs`,
  `claim-read-packets.mjs` and `replay-guard.test.ts` all select through it before reading any other field. None opens
  `sets.heldout` or a reserve set. The replay is env-gated, so `npm test` reads no results file.
- **58-row panel.** I recomputed the panel from `panel.json` as loop 1's 50 (asserted identical across the three stored
  panel runs) plus every tuning row whose golden source URL is on `stellar.org` outside `/blog`, `/press` and `/events`.
  It matches `panel-ids.txt` exactly.
- **10 guard rows.** From `corroboration.json`'s per-pass data, panel rows with the block and an A3 claim word in two or
  more stored runs, plus the `trap: governance` row, give exactly `guard-ids.txt`. The plan's word list gives the plan's 8.
  Two notes for the record:
  - The 8 added rows have one stored sample each, so they cannot meet "two or more runs".
  - The rule selects by the block, not by A1's placement. With the standalone line counted (a static upper bound),
    `q-soroban-oz-token` would also qualify. It is the row I named in `PLAN-REVIEW.md`. The orchestrator fixed the rule
    at 10, and I do not reopen it. The P1 read covers that row's pass 1 answer anyway.

### 8. Gates

These ran bare in clean detached worktrees of each tip, after `npm ci`, the CI placeholder `.dev.vars` and
`npm run typegen`. Exit codes:

| Tip | typecheck | test | build | test:smoke | eval:routing -- --gate | secrets:scan -- --tree |
|---|---:|---:|---:|---:|---:|---:|
| `b8ea957d` | 0 | 0 (3,495 passed, 3 expected fail, 3 skipped) | 0 | 0 (143) | 0 (GATE PASS) | 0 |
| `0a343e3f` | 0 | 0 (3,502 passed, 3 expected fail, 4 skipped) | 0 | 0 (143) | 0 (GATE PASS) | 0 |

`git status --porcelain` was empty after the gates on both tips, so the generated files are in sync.

### 9. The P1 comparison: how it can mislead, and what it must not be read as

**It can favour the guard falsely:**

- Fabricated attributions score as clean (R1).
- The violation rule is low-powered: the reference is about 1 in 29, so "no rise" is the strongest result it can
  return.
- The reader is not blind. The guard sentence is in P1's transcripts, so a reader can tell the arms apart. Use one reader
  model and one brief for P0 and P1, interleave their packets, and send every violation and every unreturned attribution
  to a second reader.

**It can count against the map or the guard falsely:**

- The composition of the repeat passes (R3).
- An untraced net under T is "no decision", not harm.
- A judge may mark down an answer that correctly attributes a fact the golden states as plain fact. That is the H2
  over-hedging check, and it must be traced to the guard sentence before it counts.

**It must not be read as:**

- evidence that the guard reduces violations;
- evidence that the map had no value. T is about 8 on 58 rows at p = 0.34, so up to about 7 net downs from losing rule 3
  are invisible;
- a result for OpenCode, Grok, Codex, the Playground, or any model other than Claude Sonnet 5.5;
- a result for the guard on Grok results over 20,000 bytes, or on build-stage runs (R5, R6);
- independent evidence from the 10 guard rows' repeat passes, which are three samples of 10 rows, not 30 rows;
- an improvement, on any set.

## Limits

- The lane test used stubbed upstream shapes. It proves the host's placement logic in the assembled Worker, not live
  upstream behaviour (the implementer's live `dev:eval` check covered `searchResearch` and `listAudits`).
- I spot-checked the reference read by its tables, not by re-reading every packet. The two counted violations are both
  borderline:
  - The Aquarius line describes a whitelist mechanism.
  - "Protocol-level AMMs before Soroban" rests on a Docs page. The activation date it implies is unsupported.

  The read's own variance (11, then 2) is larger than the rule's margin. That is why R1's re-read and the second reader
  matter.
- Cost per question is estimated from stored result sizes. No client's token use was measured.
