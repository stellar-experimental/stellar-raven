# Golden-truth session 3 — long-fact worker rules (2026-08-29)

Repository: /Users/kalepail/.herdr/worktrees/stellar-raven-codemode/codex-golden-truth-session-3
Case files: eval/qa/corpus/battery/<category>/<id>.json
Skill to follow: .agents/skills/golden-truth/SKILL.md (read it once at the start of the loop).
Your matrix file (append-only; the orchestrator mirrors it into .agents/rounds/2026-08-29-golden-truth-session-3/ before each commit, because the Codex sandbox denies writes under .agents/): /private/tmp/claude-501/-Users-kalepail--herdr-worktrees-stellar-raven-codemode-codex-golden-truth-session-3/cd770b91-1023-4d78-86f6-0defe2e06b20/scratchpad/gt3/pack/matrices/matrices-sol-<worker>.md
Chunk reports (scratch): /private/tmp/claude-501/-Users-kalepail--herdr-worktrees-stellar-raven-codemode-codex-golden-truth-session-3/cd770b91-1023-4d78-86f6-0defe2e06b20/scratchpad/gt3/pack/reports/chunk-NN.md

## Goal of one chunk

Clear every `[key-fact] ... exceeds 90 characters` lint warning on the four assigned case ids by
rewriting the offending `golden.keyFacts` entries, while keeping every claim and refreshing the
provenance. This is a FORM change. The truth must not change.

## Hard limits

- Edit only the four case files named in the prompt, plus your own matrix file. Never touch another
  case, even a sibling, even to fix an obvious problem — report it instead.
- Do not run git. Do not run `npm run eval:qa:compile` or `npm run eval:qa:register`. The only
  repo command you run is the read-only lint: `node eval/qa/lint-corpus.mjs 2>&1 | grep "<id>"`.
- Do not run paid Lumenloop research. Never print secrets.
- Write JSON back with two-space indent, the same key order, and a trailing newline
  (`JSON.stringify(obj, null, 2) + "\n"`). Do not reformat untouched fields.

## Lint form rules (eval/qa/lint-corpus.mjs → lintGoldenAuthoring)

1. Each keyFact ≤ 90 characters.
2. One predicate per keyFact. Splitting on ` and | but | while | whereas ` or `;` must not leave two
   clauses that both contain a predicate verb (is/are/uses/states/explains/requires/… see
   KEY_FACT_PREDICATE_RE). Lists of nouns joined by "and" are fine when only one verb is present.
3. A keyFact of the form `rejects|separates|distinguishes X` needs X's terms to appear in the
   question; otherwise phrase positively or move X to `golden.avoid`.
4. No keyFact may contain `truth.asOf` or `truth.verified.date` (snapshot-date rule). Since you set
   `truth.verified.date` to `2026-08-29`, a keyFact must not contain `2026-08-29`.
5. `golden.keyFacts` holds 1–5 entries. Two migration exceptions must keep their pinned count
   exactly: `q-ti-stellar-lab-usage-and-new-ui` (6) and `q-tool-cctp-stellar-integration` (7).
6. `q-hist-quantum-preparedness-plan` keyFacts[0] is sha256-pinned by
   `eval/qa/fact-stage-benchmark.mjs`; if that case is assigned and only [0] is long, report it as
   `PINNED` and do not change [0].
7. New `golden.avoid` items must be concrete false-content claims starting with `Do NOT`, must not
   contain the judge-blind words corpus/reviewer/golden/source data/cited records/catalog/directory/
   transcripts, and must not be pure presentation/omission requirements.

## Claim preservation (the rule the session-2 reviewer failed 33 of 233 cases on)

- Enumerate every atomic claim in the old fact before rewriting. Each claim must survive in one of:
  a keyFact, `golden.answer` (when it is already stated there — do not add new answer text unless
  you also record it), or `golden.avoid` (only a "not X" / "do not claim X" tail, as a concrete
  false claim).
- Never add a qualifier, number, version, date, abbreviation, product name, or taxonomy distinction
  that the old fact did not carry. Never drop the object of a claim to shorten it.
- Prefer splitting a two-claim fact into two facts when the count cap allows. When it does not,
  fold the secondary claim into `golden.answer` only if the answer already carries it (then say
  "kept in answer"), else tighten wording without dropping.
- Per case, the matrix must state exactly one of: `Claims kept: <list>`, `Moved to avoid: <list>`
  (plus the kept list), or `None dropped`.

## Verification per rewritten fact (golden-truth, class letters from the skill)

For every rewritten keyFact, do ONE live re-check against a primary source (class A official docs,
class B source code/repo, or class F run it) using curl/web fetch, and record
`Live re-check 2026-08-29: <url> — <what the page/source confirms>`. Prefer the URLs already in
`truth.sources[]`. If the live source contradicts the claim, do NOT edit that fact: record
`CONFLICT: <claim> vs <url> — <observed text>` in the matrix and the report. Leave THAT fact
unchanged (its warning stays) but still rewrite the other long facts of the case and refresh
`truth.verified` for them; the orchestrator resolves the conflict through golden-truth separately. If a URL is unreachable, use another primary URL for the same fact; if none is
reachable, record `UNREACHED: <url>` and leave that fact unchanged (rewrite the others).

Sibling sweep per case: grep the battery for the entity names and key numbers of the changed facts
(`grep -rl "<term>" eval/qa/corpus/battery`), read the hits, and record
`Sibling sweep 2026-08-29: grep <terms> → <ids>; no contradiction` (or the contradiction).

## truth.verified update (required; the gospel lint refuses the edit without it)

- `date`: `2026-08-29`
- `by`: `golden-truth session 3 (2026-08-29, long-fact batch, worker gt3-sol-<a|b|c>)`
- `evidence`: keep existing lines except dead temporary paths (see below); append
  `Structural re-form (long-fact): <one sentence on what was split/shortened>; truth unchanged.`,
  the `Live re-check 2026-08-29: …` lines, and the `Sibling sweep 2026-08-29: …` line.
- `rootCause`: append `.agents/TODO.md — Golden authoring lint warnings burn-down (long-fact class)`.
- Leave `truth.asOf`, `truth.reverifyBy`, `truth.status`, `truth.sources`, `truth.corroboration`
  unchanged unless the prompt says otherwise.

## Dead-provenance repair (only on cases you are already editing)

Replace, in `truth.verified.evidence` (and nowhere else):

- `/tmp/raven-qadeep/gt2/review-b4-part1.md` → `program-log.md § Session 2 › Batch 4 › Part 1 review (gt2-grok-rev)`;
  same pattern for `review-b4-part2/3` and `review-b5-part1/2/3` (Batch 5).
- `/tmp/raven-qadeep/review-judge.md` → `research/qa-deep-dive-2026-08-25/review-judge.md`.
- Any line naming `.../scratchpad/p4/conversions-copy-review.md` (an expired, unrecoverable Fable
  review report): replace that line with
  `Independent Fable copy-review report (temporary path, unrecoverable); its claims were re-verified live on 2026-08-29 — see the Live re-check lines.`
  This is allowed only because you re-verified every keyFact of the case live in this pass.
- Leave `solo://…` references and `Solo scratchpad …` lines alone (historical provenance).

Record `Dead provenance: none | replaced <n> line(s)` per case in the matrix.

## Order of work for one chunk

1. Read the four case files and the lint lines for them.
2. Draft the rewrites and do the live re-checks and sibling sweeps.
3. APPEND the evidence matrix for all four cases to your matrix file (format below). Do this before
   editing any case file.
4. Edit the case files.
5. Run `node eval/qa/lint-corpus.mjs 2>&1 | grep -E "(<id1>|<id2>|<id3>|<id4>)"`; the output must be
   empty (or only pre-existing `[avoid]`/`[corroboration]` lines — never a `[key-fact]` or
   `[gospel]` or `[snapshot-date]` line and never an ERROR).
6. Write the chunk report to the report path and reply with ONLY that path.

## Matrix format (append to your matrix file)

```
## chunk-NN — <worker> — 2026-08-29

### <case id>
- keyFacts[i] before: "<old>" (<len>)
- keyFacts[i] after: "<new>" (<len>)  [repeat per changed fact; note "split into [i],[j]"]
- Claims kept: … | Moved to avoid: … | None dropped
- Live re-check 2026-08-29: <url> — <confirmation>   [one per rewritten fact]
- Sibling sweep 2026-08-29: grep <terms> → <ids>; <verdict>
- Dead provenance: none | replaced <n> line(s)
- Special review flags: new-number|new-version|new-date|new-abbreviation|new-taxonomy|none
- Result: DONE | CONFLICT | UNREACHED | PINNED
```

## Chunk report (scratch file)

A short Markdown list: per case `id — DONE|CONFLICT|UNREACHED|PINNED — <one line>`, then the
lint grep output, then anything the orchestrator must know (an unassigned problem you saw, an
unreachable URL). Reply with only the file path.
