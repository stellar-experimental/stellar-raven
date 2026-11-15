# Step 3 review: the identifier pointer (item 5, commit `a49ee918`)

Reviewer: Claude Opus 5.5 (`claude-opus-5-5`), a fresh session in worktree `raven-wt/loop2`, at tip `aaabd4ed`. Tier: Claude Opus, the stable fallback. The
matched tier for an executor and policy change is Codex frontier; the orchestrator chose this reviewer, and the author (Claude Sonnet 5.5) and orchestrator
(Claude Fable 5.2) are both different from it. Effort: as set on the orchestrator's launch line. Inputs: `PLAN.md`, `PLAN-REVIEW.md` (A6, Q3, Q7), `PLAN-AMENDMENTS.md`,
`STEP-3-IMPL.md`, the round ledger, `git show a49ee918`. No model-calling eval ran. One read-only call went to the deployed server (section 2.3). No stored answer, golden or
held-out row was opened. The routing gate log prints holdout-lane case lines; I filtered them out unread.

## Verdict

**Fit to measure once two text fixes to R's reading rules are adopted (B1 and B2 below). Neither needs a code change.** The mechanism is general in how it is derived,
correct on every input I could build, and leaves `search` untouched. I reproduced the claims I could check:

- the 495 ordered top-five lists are byte-identical;
- the Worker at the tip is `a49ee918`'s;
- all six gates exit 0.

D1 is decided below with exact text. D2 is accepted. The code findings (F1 to F4) are low, and none blocks R. F1, the token-length bound, should land before ship.

| ID | Severity | Blocks | Finding | Exact fix |
|---|---|---|---|---|
| **B1** | medium | R | R0 compares two different quantities. The stored 19% to 33% is a row share by the committed definition: a script names an identifier and research is called. The plan's R0 asks whether research is called *with the identifier afterwards*. At about 14 rows per pass, the row share passes 33% by chance with no effect at all: P ≈ 0.38 for one pass and 0.28 for both passes pooled, at P1's 29% | See section 7: R0 decides on the per-fire follow rate, measured against the replay's own per-fire baseline (7 of 163). The row share is reported beside it |
| **B2** | medium | R | The keep rule counts rows (n = 17) but R collects two passes, and section 9 never says how two verdicts make one row verdict. So H3's T, R1's "two different rows" and H1/H2's "a row" are all undefined | See section 7: H3 is applied per pass at T = 3, R1 and H1/H2 combine the passes per row as stated there, and the pooled 34-row-pass net is reported with its own T = 4 |
| F1 | low | ship | The echoed token's length is unbounded. `\d+` accepts any run of digits, and the sentence quotes the token twice. `"SEP-" + "0"×200 + "45"` gives a 1,624-character checkpoint (probe, section 2.2) | `src/policy/identifier-token.ts`, `JOINED_TOKEN_RE`: change `(\d+)` to `(\d{1,6})`. A run of 7 or more digits then fails the `\b` and the token is skipped. Add a unit case. This changes no replayed output: the longest written number in nine runs has 4 digits (`CAP-0046`). The bound sentence is then at most 209 characters, and three sentences at most 629 |
| F2 | low | no | A month joined to a year reads as an identifier: `Sep-24`, `10-SEP-2024`, `2024-SEP-10`. Live, `scout.searchResearch({ q: "Sep-24", source: "sep" })` returns `sep-0024` as an **exact** row, so a query about a September 2024 event would be pointed at SEP-24 and handed an "exact" row for it. Never seen in nine stored runs | Not required. Any month list would be vocabulary. A general option, if R's read lists such a firing: refuse title-case letters (`Sep`, `Cap`) and keep all-upper and all-lower. R's read lists every firing whose letters are title case |
| F3 | low | no | Two cases where the pointer stays silent but arguably should fire. (a) A research call named the identifier with the wrong filter (`{ q: "SEP-45", source: "cap" }`): it cannot return the document, yet it silences the pointer (probe). (b) The pointer is per `execute`, so a later execute that names an identifier already researched fires again. The replay cannot see (b) before the pointer exists: 0 of 163 fires had research earlier in the row. **After a follow, re-fires are the expected case** | (a) Optional: count a research call as covering the identifier only when its filter is that series or absent. (b) The host keeps no cross-execute state, so R counts re-fires after a follow (section 7) |
| F4 | info | no | The pointer renders in build-stage runs, where the CANDIDATE block is suppressed and PRIOR-ART renders (probe: `scout.searchProjects({ q: "SEP-41 token" })` fires). R5 suppresses guidance there to keep build flows lean | None now. The rows `q-soroban-oz-token` and `q-nft-vault-contract-standards` are in the 17, so R reads this case. List their follow costs |

## 1. Generality (owner rule)

**General in how it is derived; one instance today; not a boost.** The rule (`src/catalog/document-series.ts`) contains no operation id, series, standard, question phrase or
case id. It selects any operation that has all of these:

- a candidate lane;
- a string `q` or `query` input;
- an input `source` enum;
- an output array whose rows carry `source` and `url`.

These are exactly the fields arm 2's `exactRowsOf` reads to mark a row exact. The series are the enum's plain-letter values, and the manifest check recomputes them, so a
hand edit fails. The sentence's free text is fixed. Every variable comes from the manifest (target, filter, query input, series) or from the model's own argument (the token).
Nothing ranks. The pointer reaches `scout.searchResearch` only because that is the one operation whose schema says "these rows are documents filed under a series". If
another operation declared the same shape, it would be covered with no edit. That makes it a document-lookup pointer, not a disguised boost. A6's note stands: a keep is
evidence for this one operation only.

**What would make it wrong.** (a) A series that Scout lists in its enum but does not hold as whole documents. For `sep` and `cap`, the implementer's live check found an exact row
for 22 of 22 identifiers. For the other five, see D1. (b) An identifier-shaped token that is not a document: D1 and F2. (c) A future operation whose `source` enum values are
plain letters but are not document series, with rows that carry `url`. The rule would admit it. The manifest check would not catch it, because the check enforces the
derivation, not the meaning. The build would make the change visible as a new `documentSeries` field in the manifest diff, and a drift review must read it there. Record (c)
in the `live-drift-resolution` skill's checklist when it next changes; that is not part of this step.

**D2, accepted.** The plan's wording ("an enum filter its row items also carry") would also match `getHackathons.source`, `listSkills.source`, `searchResearch.severity`,
`searchProjects.category` and others. A series such as `high` or `defi` joined to digits would then produce nonsense pointers. Requiring rows to carry `source` and `url` is
what makes a row a document, and it ties the pointer to the rule that marks exact rows. The narrowing is correct and stays general.

**D1, decided: keep the rule as built, so every plain-letter series fires on a hyphenated or joined token.** Replace A6's sentences "`audit-2024` fires only if the build
records `audit` as a numbered series. The R read lists every firing whose series is not `sep` or `cap`, and each one is a defect." with:

> A series name joined to digits fires (`audit-2024`, `release-23`, `paper1`). The manifest cannot say which series are numbered, and a list of the numbered ones is the hand
> list the owner forbids. The sentence is conditional ("If … names a document") and asserts nothing. Live on 2026-11-15, Scout's rows for `audit`, `release`, `incident`,
> `paper` and `lumenloop` carry no `<series>-<number>` URL slug: audit rows end in a bare number, release rows in `v23.x.y`, incident rows in `73-…`, and paper and
> lumenloop rows in file names. So arm 2 can mark no row of theirs exact, and a firing for them can cost one call but cannot deliver a document. The R read lists every
> firing whose series is not `sep` or `cap`, with whether the agent followed it. Each one is a recorded cost defect. It reverts only through H1 or H2 by a traced down. If one
> appears, the general fix is to fire only for a series that has produced an exact row. That needs observed data, so it is a design change for a later loop, not a list.

Why not "numbered series from a source the orchestrator names": that is a per-source annotation, which is the boost the owner rule forbids. Why not "a number of at most
3 digits": it would also refuse real four-digit identifier families (`EIP-1559` shape) and is a guess about numbering ranges. The replay sets the cost of keeping the rule
as built at zero: in nine runs no stored call string holds `audit-…`, `release-…`, `paper…` or `incident…`.

## 2. Correctness: inputs run

### 2.1 Token rule (`identifiersInArguments`, run directly, seven series)

| Input | Result | Right? |
|---|---|---|
| `…/ecosystem/sep-0045.md` (GitHub URL) | `sep-0045` → sep-45 | yes (the URL names the document) |
| `…/docs/build/apps/wallet/sep24` (Docs URL) | `sep24` | yes, and it adds a call (section 6) |
| `?id=sep-45&cap=46` (query parameter) | `sep-45` only | yes |
| `CAP-0046-01`, `CAP-46.1`, `release-23.0.1`, `sep-10-2024` | none | yes (longer identifiers) |
| G-address with `CAP45` inside, hex hashes, `0xcap1`, `deadbeef… audit0a1b` | none | yes (`\b` and hex letters) |
| `CAP12345` | `cap-12345` | harmless (conditional sentence; no such row) |
| `recap-46`, `Asep-41`, `mySep41`, `sep_45`, `SEP–45` (en dash), full-width `ＳＥＰ-45` | none | yes |
| `const sep10 = …; // see SEP-10` (code in a string) | `sep10` | yes (SEP-10 is named) |
| `audit-2024`, `release-23`, `incident-2023`, `lumenloop2025`, `paper1`, `paper-2` | fire | D1 |
| `audit 2024`, `release 23`, `SEP 45`, `protocol-23`, `Protocol23`, `p23` | none | yes (A6) |
| `Sep-24`, `10-SEP-2024`, `2024-SEP-10` | fire | **no**: F2 |
| `"SEP-" + "0"×300 + "45"`, `"sep" + "9"×50` | fire, echoed whole | **no**: F1 |
| An object key `{ "SEP-45": "x" }` | none | yes (values only) |
| A value at depth 5 | none | by design (depth 4) |

### 2.2 Pointer composition (the real `evidenceRecoveryHint`, `candidateEvidenceSection` and `evidenceCheckpointBlock`, in a temporary vitest file, deleted afterwards)

| Ledger | Pointer | Other blocks |
|---|---|---|
| Docs search names `SEP-45`; research `CAP-46` with an exact row; Lumenloop semantic names `SEP-10 sep-24 SEP-31 SEP-6` | `SEP-45`, `SEP-10`, `sep-24` (the cap drops `SEP-31` and `SEP-6`); nothing for the researched `CAP-46` | guard, one exact-row exception, detail sentence, alternatives sentence |
| A hackathon query with `Sep-24` | `Sep-24` | guard |
| Docs page read by a `sep24` URL | `sep24` | none |
| Docs search `SEP-45`; research `{ q: "SEP-45", source: "cap" }` | **none** | F3(a) |
| Docs search `SEP-43`; research with `source: "sep"` and no identifier | `SEP-43` | yes |
| Build stage: `scout.searchProjects({ q: "SEP-41 token" })` | `SEP-41` | CANDIDATE block suppressed: F4 |
| `scout.listAudits({ q: "Soroswap audit-2024" })` | `audit-2024` | D1 |

The implementer's tests already cover the required cases: the identifier already researched (any spelling, any outcome), an exact row already returned, a non-existent identifier,
mixed lanes, and the cap of three. I re-ran them under `npm test`. An exact row can come only from a candidate-lane call whose query names the identifier. Today only the
research operation returns rows that carry `source` and `url`, so "an exact row already returned" and "research named it" are the same condition.

### 2.3 Live, read-only, deployed server (one `execute`, seven calls)

`scout.searchResearch` was called once per series: `audit-2024`/`audit`, `release-23`/`release`, `incident-2023`/`incident`, `paper-1`/`paper`, `lumenloop-1`/`lumenloop`,
`Sep-24`/`sep` and `CAP-0046-01`/`cap`. Exact rows: `Sep-24` gave `sep-0024` (F2). Every other call gave none. The last URL segments of the rows that came back are in D1. For
`CAP-0046-01`, `cap-0046.md` was the first row but was not marked exact, which is correct, because the token rule refuses the longer identifier.

## 3. Interaction with the other host blocks

**Yes, one result can now carry all four host texts:** the corroboration guard (which ends the CANDIDATE block), an exact-row exception, the detail sentence, and up to three
identifier sentences, followed by the alternatives sentence (probe, first row of 2.2). Measured on that ledger, the candidate block is 1,235 characters and the checkpoint
1,547; this commit adds about 545 of them.

- **Worst-case added length.** Sentence = 159 + 2 × (token length) + 2 × (series length).
  - Today it is unbounded (F1).
  - With F1's bound, the longest token is `lumenloop-999999`, 209 characters. Three sentences plus spaces give 629, plus the 30-character header when the pointer stands alone.
  - On realistic tokens, the replay measured 175 to 181 per sentence and 541 at most.
- **No contradiction between blocks.** The pointer says "call it". The alternatives sentence that follows says to stop if exact evidence already answers. Both are
  conditional, and they are compatible. The pointer leads toward the standard's own file, which is the primary record the corroboration guard names, so it works with the guard.
- **Client clips.** Claude Code: no clip at these sizes. Grok keeps the first 20,000 bytes and drops the rest. The pointer sits after the CANDIDATE and PRIOR-ART blocks, so on
  a result near that limit it is cut, and by sitting before the alternatives sentence it can push that sentence past the limit too. This is the R6 situation. In 0 to 3
  firing executes per run the stored result is at or above 20,000 characters (STEP-3-IMPL 6.4). It is delivered there but not measured, as the license table already says.
  No block grows except the checkpoint.

## 4. `execute` results only

- **Ordered top five, reproduced.** In a scratch worktree at `7b17bb2f` (its own code and manifest), `node eval/run-routing.mjs --dump-ranked`, compared with the same command at
  the tip: `cmp` finds them identical, 495 cases (legacy, extended, skills and protocol-history lanes). The worktree has been removed.
- **The 49 holdout-lane cases are not in the dump.** The gate passes on unchanged totals, and they are unchanged by construction: `documentSeries` is read only by the manifest
  check (`src/catalog/search.ts`), `buildOpsFns` and `identifierPointersOf`, and never by scoring, cards or recovery. The single `{ ...entry }` spread in `scoring.ts:215`
  overrides only `description`.
- **Served surface.** No code path serializes a whole entry into served text. This agrees with the implementer's live check that `search`, `describe` and `catalog()` do not
  show the field, and with surface pin `42ec6102…f17f`.
- **`eval/gates.json` re-stamp: accepted.** Only the manifest fingerprint, the local trace and the note move, as the file's own rule requires, and the identity evidence is
  real. One wording fix when the file is next touched: the note should say "495 cases compared per case; the 49 holdout-lane cases by gate totals (scoring reads no new
  field)". Prior notes in the same file say 544, and the new note does not explain the difference.

## 5. Wording frozen before any stored answer was read

The commit order supports the claim: `7b17bb2f` 07:44 (ledger), **`a49ee918` 07:50 (code and sentence)**, `3d65d0ff` 07:57 (replay tooling), `ed6fd569` 07:59 (outputs).
`git diff a49ee918 HEAD -- src scripts catalog specs package.json wrangler.jsonc env.d.ts` is empty, so the sentence R measures is the one frozen at 07:50. The order cannot
show what the author read; that is unprovable from git. The structure limits the risk anyway. The only free text is fixed and generic ("If … names a document", "holds
documents of", "A row it marks exact is the document itself"), and the rest is filled from the manifest and the model's argument. No row-specific wording could have been
tuned in.

**D7 (the orchestrator recorded it as a deviation).** The exposure happened before `a49ee918` was committed. The first `npm test` failed on the fingerprint gate and printed
the routing holdout lane's ids and top-five lists. Those show ranking, which this commit cannot change, and no golden answer. The pointer's text cannot use them. I agree
it is record-only. Two cheap follow-ups:

- The held-out QA read at the end of the loop should be analysed by a lane other than `loop2-impl3`.
- `.agents/TODO.md` should get an item: the fingerprint gate's failure message should print the fingerprint mismatch only, not per-case tables. This is a tooling leak that
  any gate failure can repeat.

## 6. What the pointer can cost

- **Extra calls.** Each follow costs one research call: live latency is 0.4 to 3.3 seconds, and it returns about 5 chunks under the CANDIDATE block, typically one more execute
  turn. Needless follows happen in four cases:
  - the Docs page or a skill already answered the how-to;
  - D1 series, which cannot give an exact row;
  - F2 months;
  - F3(b) re-fires after a follow.

  R's cost flags (cost per answer up more than 20%, median turns up more than 1) are the right instrument. Add the re-fire count (section 7).
- **Pulling off a better source.** The sentence is additive ("If …, call it"); it does not say "instead". It names the standard's own file, which the corroboration guard treats
  as the primary record, so for standards-authorship and status claims it points toward the better source, not away from it. The real risk is the opposite substitution: an
  agent that gets an exact SEP row may treat it as the answer and skip the Docs integration page or skill section that holds the how-to (code, flows, current SDK calls). The
  exact-row exception limits what it may state ("only what its returned text shows"), but not what it skips. R must trace each down on the 17 rows for this: a Docs or skill
  call present in P0, P1 or P2 that is absent after a follow.

## 7. The targeted read R

**T: confirmed at 3, on a corrected basis.** A4 sets T from its own n and P0's measured all-rows rate (0.13), with the review's method: T = ⌈1.645 × √(n·p)⌉. That gave T = 5 on 58
rows at the same rate. For n = 17 it gives ⌈2.45⌉ = **3**; at 0.16 it is also 3, and at 0.34 it is 4. Exact symmetric-flip model:

| n | p | P(net ≥ 2) | P(net ≥ 3) | P(net ≥ 4) |
|---:|---:|---:|---:|---:|
| 17 | 0.13 | 0.146 | 0.044 | 0.010 |
| 17 | 0.16 | 0.173 | 0.061 | 0.017 |
| 17 | 0.34 | 0.265 | 0.147 | 0.071 |
| 34 | 0.13 | 0.232 | 0.113 | 0.046 |

STEP-3-IMPL section 9's "T = 2 at 0.13" is the quantile read with the wrong convention. Under "at or above T, stop", T = 2 stops on noise 15% of the time. So T = 3 is A4's rule
at P0's rate, not "the middle value". Record it that way. T is not a guess within the model; the model itself (independent, symmetric flips) is the guess, as PLAN.md already says.

**B1, R0 replaced (text for STEP-3-IMPL section 9, the R0 row):**

> R0, delivered and followed. (a) The sentence appears in every execute where the replay of R's own transcripts predicts it, and in no other. A miss either way is a build fault
> and voids the run for the pointer. (b) **Follow rate:** of the delivered sentences, the share followed by a call to `scout.searchResearch` whose arguments name that
> identifier, later in the same pass of the row. It passes above 33%. The per-fire baseline from the replay is 7 of 163 (4%): research for the fired identifier in a later
> execute of the row, with no pointer, over nine runs. Arm 1's detail pointer is the reference at 48%. (c) Reported, not decided: the row share by the committed definition, per
> pass and pooled, against Q7's bar, above 33% and above P1's 29%. Also reported: re-fires, meaning a sentence for an identifier the pass had already researched.

Why: with no effect, (b) passing has a chance near zero (about 26 delivered fires at a 4.3% baseline). (c) passes by chance 28% to 38% of the time, and it mixes rows that never
fire (`q-pc-sponsored-reserves` fires in no stored run; `q-comp-aml-analytics-vendors` in one, `q-pc-quantum-preparedness-dormant` in two). With a 33% bar, R0 fails only when
the pointer is genuinely ignored, so it cannot hide an effect.

**B2, combining the passes (text for STEP-3-IMPL section 9, before the table):**

> Each row has two R verdicts, one per pass, compared with its P2 verdict (P0 and P1 by reading rule b).
> - **H3** is applied to each pass's 17-row untraced net, at T = 3, and fails if either pass reaches it. The pooled 34-row-pass net is reported with its own T = 4 (n = 34,
>   p = 0.13).
> - **R1:** a row counts up when it is up in at least one pass by a trace to an exact row the pointer led to, and it is not down in the other pass.
> - **H1 and H2:** a row counts down when it is down by a trace in either pass.
>
> The tier-matched net is read first (A4).

The asymmetry is deliberate: harm counts on one pass, gain needs one traced pass and no contrary pass. That is the conservative reading of the existing rules, not a new bar.

**Can R mislead?**

- **Upward.** Two traced ups among 17 rows can come from rows where the agent would have found the document anyway: 1 or 2 per run research later on their own. The trace must
  show that the research call came after the sentence and named the pointed identifier, and the "returned" rule (b) applies.
- **Downward.** A down traced to a follow is, by F2, F3(b) and section 6, more likely to be the "exact row, then skipped the Docs or skill read" substitution than a wrong
  document. Trace which it was. Only the first is a pointer harm; a judge artifact is recorded and does not revert.
- **Small n.** With n = 17 and two passes, "inconclusive" is the likeliest honest outcome even for a real but small effect. That is a property of the budget, not a defect;
  inconclusive reverts, as planned.

**What R must not be read as.** Add these to section 9's list, which is otherwise complete:

- evidence about the five non-`sep`/`cap` series, which cannot produce exact rows today;
- evidence about title-case or month-shaped tokens (F2);
- evidence about the follow cost in sessions longer than these rows (re-fires);
- evidence that an exact standard row is a better source than the Docs page or skill for how-to questions;
- for build-stage runs, anything beyond the two build-stage rows it holds.

## 8. Gates (tip `aaabd4ed`, clean tree before and after; each command bare, output to a file)

| Command | Exit | Note |
|---|---:|---|
| `npm run typecheck` | 0 | |
| `npm test` | 0 | 165 files passed, 6 skipped; 3,639 tests passed, 3 expected fail, 6 skipped |
| `npm run build` | 0 | |
| `npm run test:smoke` | 0 | 9 files, 145 tests |
| `npm run eval:routing -- --gate` | 0 | GATE PASS; legacy 338 within band; holdout lane at or above floors |
| `npm run secrets:scan -- --tree` | 0 | |

My only tree changes were a temporary test file, created and deleted (`git status` empty afterwards), and a scratch worktree outside the repository, removed. This file is the
only commit.
