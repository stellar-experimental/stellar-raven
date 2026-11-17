# Item 1.2 execution report

Executor: Claude Sonnet 5.5, worktree `np-1.2`, branch `np/1.2-stellarorg-review`, base `ada75c0d`.
No subagents, no other terminals, no model call, no deploy, no push.

## What changed, per finding

All code is in `src/adapters/stellar-org.ts`; tests are in `test/stellar-org-adapter.test.ts`.

- **X1 (caps).** One `clip(value, max)` helper cuts to at most `max` characters and ends with `…`
  (it also drops a lone high surrogate before the `…`). `MAX_TITLE_CHARS = 300` applies to `title`
  on page, tutorial and partner rows, and to the audit `title`, `project` and `firm`. The audit
  title is split at `" -"` on the **original** title before the three clips. `stringTags` drops
  non-strings and `""`, keeps the first 10, and clips each to 200. The partner category merge stops
  at 10 tags (R5).
- **X2 (header echoes).** The full URL is validated first, unchanged. Only the displayed excerpt is
  clipped to `MAX_ECHO_CHARS = 200`: the redirect target in both refusal messages and the
  content type in the non-HTML error. The unparsable-Location message is unchanged (R7).
- **X3 (raw text).** One generator, `scan(html, intoHead?)`, now serves `mainHtml`, `htmlToText`
  and `documentTitle`. Raw-text set: `script`, `style`, `noscript`, `iframe`, `title`
  (`textarea` left out, R5). A raw-text start tag (trailing `/` ignored) skips to its end tag with no
  tag or comment parsing in between. Nested set: `svg`, `template`, `head`. The raw-text jump runs
  below the skip logic, so it also applies inside a skipped `head` and `template` (R3), and is off
  inside `svg`, where only `svg` tags count and `/>` is honoured (R2).
- **R1 (linear end search).** The end tag is found in two steps: a global regex
  `</name(?![\w-])` (flags `gi`, one per name, `lastIndex` set to the start tag's end), then
  `html.indexOf(">", index)`. If either finds nothing, the rest is skipped and the scan stops
  (`break`, so a pending nested skip is still yielded). A candidate is never searched for twice.
- **X4 (title).** `documentTitle` runs `scan(html, true)` (enters `head`, still skips `svg` and
  `template`) and takes the first `title` raw-text token: decoded, whitespace-normalized, clipped
  to 300. An unterminated `<title>` skips the rest of the page and gives no title (the page is then
  soft-empty if `<main>` came after it; this matches the old regex, which needed `</title>`).
- **X5.** `normalizeSitePath` checks `underPrefix(trimmed.toLowerCase(), "/api")`; the returned
  path keeps its case. `/apiary` and `/Apiary/Page` are accepted.
- **Docs.** `research/services/stellar-org-site.md` "Design" states the caps, the `…` marker, the
  200-character echo, `/api` in any case, and the raw-text and nested element rules. `.agents/TODO.md`:
  the "Adapter review residue" bullet is deleted and the first clause of that entry's "Done when" is
  removed (reflowed to one paragraph). Nothing else in the TODO changed.

## Tests added (all in `test/stellar-org-adapter.test.ts`)

Path guard: `/API`, `/API/search`, `/Api/search` refused with 0 fetches; `/apiary`, `/Apiary/Page`
accepted; a redirect to `/API/search` or `/Api/search` is refused before the second fetch.
`stellarOrg output bounds`: titles on every kind, audit split with a 200,000-character project that
keeps `firm`, a 100,000-character firm, tag count and length, the partner-merge tag cap, a clipped
document title (1.6 MB, decoded and whitespace-normalized), long off-origin, `/api` and query
Locations and a long content type (each message under 1,000 characters and ending in `…`), short
values left whole. `htmlToText and mainHtml`: the two review fixtures for X3, `<style>` with
`"<style>"`, `"<!--"` in a script string, mixed-case `<SCRIPT>x</ScRiPt >`, `noscript`/`iframe`,
an unterminated script, `<script-x>` kept, the R3 `head` and `template` fixtures, the R2 `svg`
fixtures (`<svg><title/></svg>`, `<svg><style/><path/></svg>`), comment handling, eight title
cases (comment, script literal, style literal, mixed-case tag, entities, `svg` title, none, empty,
unterminated), the title in a skipped head, and five 1.9 MB linear-time bodies through `get_page`
(repeated `<script>` starts with no end, repeated `</script ` with no `>`, the same for `<title>`
and `<style>`, and `<script></scripts>` pairs), plus 100,000 short script elements. Existing tests
are unchanged; none asserted a now-capped value.

## Gates (bare, in the worktree)

The worktree had no `.dev.vars`, so `Env` lacked the secret members. I created the placeholder
from `ci.yml` (names with value `x`; git-ignored) and ran `npm run typegen`, per `README.md`.

| Gate | Result |
|---|---|
| `npm run typecheck` | pass, no output |
| `npm test` | pass: 166 files passed, 5 skipped; 3,678 tests passed, 3 expected fail, 5 skipped. The adapter file alone: 105 tests (was 72) |
| `npm run build` | pass (`wrangler deploy --dry-run`, exits at the dry run) |
| `npm run secrets:scan -- --tree` | clean |

Not run, per the brief: `test:smoke`, any eval, any model call.

## Live smoke (R6)

`node --experimental-strip-types tmp/1.2-smoke/snapshot.mts tmp/1.2-smoke/after.json`, 7 calls,
about 14 keyless requests to stellar.org. Compared with `before.json` (`ada75c0d`):
`get_page` `title` and `content` identical on `/`, `/foundation/roadmap`, `/learn`, `/ecosystem`,
`/audit-bank/projects` (content lengths 3105, 5804, 1551, 4049, 1121), and `search_site` `hits`
identical for `roadmap` (1 hit) and `OtterSec` (9 hits). **No difference**, so the old-adapter
comparison was not needed.

## Deviations from the plan

- None in behavior. Two implementation choices the plan left open:
  - Comments come back from `scan` as unnamed tags, so `htmlToText` still drops comment text as
    before.
  - An unterminated `<title>` gives no document title (path fallback), as the old regex did.
- Plan text said clipping `title` for `project`/`firm` is "at most 300 each"; `clip` returns at
  most 300 including the `…`.
- Nothing was run to prove the new linear-time tests fail against a quadratic implementation; they
  pass here in about 0.1 s each, against a 1,000 ms budget.

## For the fix review

Targets from R9: the two-step end-tag search in `scan` (R1), `svg` content (R2), and the live diff
above (R6). The scanner is the `scan` generator and `END_TAG_RES`.
