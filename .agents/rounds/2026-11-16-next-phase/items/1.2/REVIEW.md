# Plan review — item 1.2

Reviewer: Claude Fable plan reviewer (terminal `t1rg`). Model: `claude-fable-5-2`. Effort: high
(from this terminal's launch arguments). Date: 2026-11-17. Reviewed: `PLAN.md` with its triage,
`CODEX-REVIEW.md`, `src/adapters/stellar-org.ts` and its test on `ada75c0d`.

**Verdict: the dispositions are right; execute after R1 (blocking) and R2 to R6 are written into
the plan.** All of them tighten the X3/X4 scanner or the X1 caps. None adds a step.

Evidence beyond reading: one Node timing (R1) and five keyless GETs of live stellar.org pages
(`/`, `/foundation/roadmap`, `/learn`, `/ecosystem`, `/audit-bank/projects`), used in R2, R4 and
R5. No model call, no tracked file edited.

## Findings

**R1 — blocking. The end-tag search can be quadratic, and the planned test does not catch it.**
- Targets X3: "jump to the first case-insensitive `</name` followed by a non-name char ...
  `lastIndex` moved past the end tag", and the new test "1.9 MB of repeated `<script>` start
  tags with no end tag".
- The plan does not say how the end tag's `>` is found. The obvious single regex,
  `/<\/script(?![\w-])[^>]*>/gi`, rescans to the end of the input from every `</script`
  candidate. Measured on `"<script>" + "</script ".repeat(n)`: 2.5 s at 180 KB, 10 s at 360 KB,
  40 s at 720 KB. A 1.9 MB page would take minutes. That is worse than any low this item fixes.
- Change:
  - State two steps. First search `/<\/name(?![\w-])/gi` from the start tag's end. Then find the
    `>` with `indexOf(">", ...)`. The same search on those inputs took under 0.1 ms.
  - If either step finds nothing, skip the rest and stop. Never search for another candidate.
  - Call the regex global only. "Sticky/global" is wrong: a sticky regex cannot search.
  - Add two 1.9 MB linear-time tests through `get_page`: `<main>ok<script>` followed by repeated
    `</script ` with no `>`, and the same shape for `<title>` in `<head>`.

**R2 — should change. Raw-text rules must not apply inside `svg`.**
- Targets X3: "on a start tag (self-closing slash ignored), jump to the first `</name`" and
  "Keep nesting for `svg`, `template`, `head`".
- Inside `<svg>` the HTML parser does not treat `script`, `style` or `title` as raw text, and it
  honours `/>`. With `title` and `style` in the raw-text set, `<svg><title/></svg><p>after</p>`
  drops everything after it, silently. `<svg><style/>` does the same. The current scanner keeps
  that text, so this would be a new drop.
- No live page has this today: the five pages hold 142 to 181 `<svg>` each, with no self-closed
  raw-text tag and no `<title>` inside an `<svg>`.
- Change:
  - While inside a skipped `svg`, count only `svg` tags, as the code does now. Apply no raw-text
    jump there.
  - Add tests: `<svg><title/></svg><p>after</p>` and `<svg><style/><path/></svg><p>after</p>`
    both return `after`.
  - The title scan (X4) skips `svg` and `template` and enters only `head`, so an icon's
    `<title>` is never the page title. Add one test: no document title plus an `<svg><title>`
    returns the path.

**R3 — should change. Say that raw-text rules apply inside `head` and `template`, and test it.**
- Targets X3: "One shared scanner used by `mainHtml`, `htmlToText` and `documentTitle`".
- Today a skipped `head` counts only `head` tags, so
  `<head><script>var s = "</head><main>fake</main>";</script></head><main>real</main>` returns
  `fake`. This is the same class as X3, one level up. The shared scanner fixes it only if the
  raw-text jump runs below the skip logic.
- Change: state that, and add this fixture (expect `real`). Also add a mixed-case end tag
  (`<SCRIPT>x</ScRiPt >`) to the X3 tests.

**R4 — should change. Mark clipping with `…`, and correct the reason given for silence.**
- Targets X1: "Clipping is silent (no flag): the cap is 6x the longest live title seen."
- The longest title seen is 115 characters, a page row in the committed
  `test/fixtures/stellar-org-search.json`. The live `/audit-bank/projects` page title is 81. So
  300 is about 2.6 times the longest seen, not 6 times. The cap is still sound.
- `title`, `project` and `firm` are identity fields, and the served instructions ask for exact
  identity before attribution. A cut name should not read as the whole name.
- Change: one `clip(value, max)` helper that ends a cut value with `…`, used for X1 (title,
  project, firm, document title) and for X2. No new key, so the key-set test and the spec stay
  as they are. Leave the description clip alone.

**R5 — should change. The tag cap must cover the partner merge, and `textarea` should leave the
raw-text set.**
- Targets X1: "Tags: at most 10, each at most 200 chars, empty strings dropped", and the X3
  element list.
- Partner tags do not come from `stringTags`. They accumulate one category per row at lines
  159 to 162, and the adapter never caps the row count. A 256,000-byte body can hold thousands
  of partner rows, so one partner hit can still carry thousands of tags. Apply the count cap
  there too, with a test.
- `textarea` is not skipped today, so its text is returned. The plan does not say whether the
  new scanner keeps or drops it, and no finding needs it (none on the five live pages). Remove
  it from the set. Keep `title` and state that its text is dropped from content.
- The caps are otherwise sound. Each hit stays under about 3,400 characters, and `path` and
  `reportUrl` come before `tags` in key order, so no field can displace them. A hostile 10-hit
  result can still pass 24,000 characters; the host footer already flags that.

**R6 — should change. Give the live smoke a pass rule.**
- Targets Gates: "Live smoke of both operations ... before and after the fix."
- The scanner rewrite's real risk is a silent change to live extraction. No live page shows X3
  or X4, so the output should not move.
- Change: `get_page` `title` and `content` are identical before and after on five pages (the
  five above will do), and `search_site` hits are identical for two queries. Any difference
  stops the item until it is explained. About 14 requests, inside the 40-request cap.

**R7 — nit. Plan text.**
- X2 lists "the unparsable-Location case", but that message echoes nothing (line 418). Drop it
  from the list so the executor does not add an echo.
- Step 4 limits the executor to two files plus the TODO bullet. The Docs paragraph also edits
  `research/services/stellar-org-site.md`. Add it to step 4.
- Gates name "a tsx one-off". `tsx` is not installed (the Codex run hit exit 127). Use
  `node --experimental-strip-types` or a Vitest config under `tmp/`, as Codex did.
- Step 1 still says "(running)".
- Add a time box for steps 4 and 5. `AGENTS.md` asks for expected time and cost up front.

**R8 — nit. Delete the TODO bullet instead of rewriting it.**
- Targets Docs: "rewritten to say the review ran (this item) and its five lows are fixed".
- The bullet sits under "What remains". Once the lows are fixed, nothing remains, and a bullet
  that reports finished work is history. The ledger row and this folder are the record.

**R9 — nit. Hand the fix reviewer its three targets.**
- Targets "Fix review (step 5)". One short pass is the right size. Name the targets in its task:
  the linear-time end-tag search (R1), `svg` content (R2), and the before/after live diff (R6).

## Agreed without change

- **Fix all five lows.** X3 and X4 are the only costly ones, and their failure is silent loss of
  page text, the worst kind for a retrieval source. A waiver would save little.
- **X5.** `PATH_RE` is ASCII, so `toLowerCase()` cannot shift indices. The fix matches the hint
  the tool already gives. `REPORT.md` should say G4 closed by a fix, since the TODO calls it the
  owner's call.
- **X6 and X7, no change.** Neither is a defect. The Codex host probes show neither empty shape
  becomes evidence, and a sanitizer is a product change this pass does not justify.
- **X2 at 200 characters.** With a path of at most 512, every message stays under 1,000.
- **Gates and spec.** No `test:smoke` and no routing gate are needed. `specs/stellar-org.json`
  stays untouched: `…` adds no field, and its "/api paths are refused" text stays true.
- **Stop rule and deploy note.** Right as written.
