# Item 1.2 plan: the vendor-diverse review of the deployed `stellarOrg` adapter

Lead: Claude Opus 5.5, agentpc `t1r9`. Worktree `/home/tyler/code/raven-wt/np-1.2`, branch
`np/1.2-stellarorg-review` from `origin/main` `ada75c0d`.

## Decision this changes

Whether the deployed `stellarOrg` adapter (`src/adapters/stellar-org.ts`, last changed in
`986ffbaa`, #447, deployed) needs a fix. Both earlier reviews (`SORG-REVIEW.md`,
`STEP-2-REVIEW.md`) were Claude; each asked for a vendor-diverse attack that never ran. A requested
review is a completion gate, so the TODO entry "stellar.org as a source" cannot close its adapter
residue without it.

## Facts re-checked on `ada75c0d`

- The adapter is unchanged since `986ffbaa` (the PLAN.md base); production runs this source.
- `get_page` titles come from `documentTitle` with no cap; `search_site` row titles have no cap
  (descriptions are capped at 500). The TODO records a 200,000-character title passing through.
- Zero site rows → `soft-empty`. All rows filtered → `ok`, `hits: []`, `meta.candidates`.
- `normalizeSitePath` checks `/api` case-sensitively: `/API/search` sends one GET, answered 307 and
  refused (`SORG-REVIEW.md` G4, left to the owner).
- Prior fixes are in: no `%` in `PATH_RE`, linear `TAG_RE`, empty-page `soft-empty`, split
  redirect messages, 24 s operation budget, capped search body.

## Steps

1. **Review (done).** Codex frontier `gpt-6-astra`, high, workspace-write sandbox used
   read-only (writes only `tmp/`), one pass, one hour, keyless stellar.org probes only. Brief:
   [briefs/codex-review.md](briefs/codex-review.md). Findings copied to `CODEX-REVIEW.md` here.
   Fallback if Codex fails to run: Grok 4.7, high, same brief.
2. **Triage (lead).** Each finding gets one disposition in the table below: fix in this item,
   owner waiver (a product choice, goes to the report), or no change (with the reason).
3. **Fable review** of this plan with the triage, findings to `REVIEW.md`; every finding adopted
   or answered here.
4. **Sonnet execution** of the fixes: `src/adapters/stellar-org.ts`,
   `test/stellar-org-adapter.test.ts`, `research/services/stellar-org-site.md`, and deletion of
   the TODO entry's "Adapter review residue" bullet. `EXEC.md` here. Time box: 90 minutes.
   Brief: [briefs/exec.md](briefs/exec.md).
5. **Fix review.** The same Codex child (`t1rb`) re-reads the diff in one short pass (30
   minutes), aimed at the linear-time end-tag search (R1), `svg` content (R2), and the
   before/after live diff (R6). Brief: [briefs/codex-fix-review.md](briefs/codex-fix-review.md).
6. **Verify, ledger, PR, report.** Lead reads the diff, runs the gates bare, adds the ledger row,
   opens the PR (`Refs` the TODO item; no issue number exists for 1.2), writes `REPORT.md`.

## Gates

`npm run typecheck`, `npm test`, `npm run build`, `npm run secrets:scan -- --tree`. No
`test:smoke` (neither `src/executor` nor `src/demo` changes). Live smoke of both operations:
`search_site` and `get_page` through the adapter with real `fetch` against stellar.org (keyless,
`node --experimental-strip-types tmp/1.2-smoke/snapshot.mts <out>`, not committed; `tsx` is
not installed). Pass rule (R6): `get_page` `title` and `content` identical before and after on
`/`, `/foundation/roadmap`, `/learn`, `/ecosystem`, `/audit-bank/projects`, and `search_site`
hits identical for `roadmap` and `OtterSec`. The before file is `tmp/1.2-smoke/before.json`
(taken by the lead on `ada75c0d`). Any difference stops the item until explained; to separate
site drift from a regression, re-run the snapshot against `origin/main`'s adapter copied into
`tmp/` at the same moment. About 14 requests.

## Stop rule

Every finding is fixed here or listed for an owner waiver. No second review round unless the fix
review finds a blocking defect. If Codex reports no defect, the item lands as a records-only PR
(findings file, TODO update, ledger row) and needs no deploy.

## Risks

- The reviewer re-reports closed items: the brief lists them and asks for re-verification.
- A fix changes routing: the adapter is not in the search index text, so a code-only change
  cannot move routing; a catalog description change would, and is out of scope here.
- Live probes hit stellar.org: capped at about 40 keyless requests.

## Triage

Review: [CODEX-REVIEW.md](CODEX-REVIEW.md) (`gpt-6-astra`, high, one pass, 8 live keyless
requests, tree untouched). Verdict: 0 blocking, 0 should fix, 5 low, 2 info. No input moved a
request off `https://stellar.org`; every prior finding it re-ran held closed. All five lows are
cheap and local to one file, so each is fixed here rather than sent for a waiver.

| Id | Finding | Disposition | Fix (all in `src/adapters/stellar-org.ts`) |
|---|---|---|---|
| X1 | Titles and tags uncapped: a 200,000-char row title or 1.5 MB `<title>` fills the host's 6k-token return before `path`, `reportUrl` or `content` | Fix | `MAX_TITLE_CHARS = 300` on every search kind's `title` and on `documentTitle`'s normalized text. Audit: split the **original** title at `" -"` first, then clip `title`, `project`, `firm` to 300 each. Tags: at most 10, each at most 200 chars, empty strings dropped. Clipping is silent (no flag): the cap is 6x the longest live title seen. |
| X2 | `Location` and `Content-Type` echo unbounded into error text | Fix | Validate the full URL first, unchanged; clip only the **displayed** excerpt (redirect target in both refusal messages, and the content-type) to 200 chars with `…` (R4 `clip`). The unparsable-Location message echoes nothing and stays as is. |
| X3 | `script`/`style` treated as nestable: `"<script>"` in a JS string swallows the rest of `<main>`; `<script/>` is honoured as self-closing so its body leaks | Fix | Raw-text elements `script`, `style`, `noscript`, `iframe`, `textarea`, `title`: on a start tag (self-closing slash ignored), jump to the first case-insensitive `</name` followed by a non-name char, with no tag or comment parsing in between (this also stops an unterminated `<!--` inside a script string from eating the page). If none, the rest is skipped. Keep nesting for `svg`, `template`, `head`. One shared scanner used by `mainHtml`, `htmlToText` and `documentTitle`; it stays linear (an exec loop on a global regex, `lastIndex` moved past the end tag; a per-name sticky/global end-tag regex, not `indexOf` on a lower-cased copy, whose indices can shift). |
| X4 | `documentTitle` matches inside comments and script strings | Fix | Take the first `<title>` start tag the shared scanner sees outside comments and raw-text bodies (including `<head>`, which the title scan must enter), then its text up to `</title`. Decode, normalize whitespace, clip (X1). |
| X5 | `/api` guard is case-sensitive (G4): `/API/search` sends one GET | Fix | `underPrefix(trimmed.toLowerCase(), "/api")`; the returned path keeps its case. `/apiary` stays accepted. |
| X6 | Zero vs filtered rows | No change | Host keeps them distinct (`soft-empty` vs `ok` + `no-rows`, `hasServiceData: false`); neither becomes evidence. |
| X7 | Page text is an injection surface, as Docs is | No change | Same class as every content source; no sanitizer is justified by this pass. |

Tests (all in `test/stellar-org-adapter.test.ts`): X1 row title, audit split with a long title
that keeps its firm, long `<title>`, tag count and length; X2 long off-origin Location, long
same-origin `/api` Location, long content-type, each message under 1,000 chars; X3 the two
fixtures from the review plus `<style>` with `"<style>"`, `<script>"<!--"</script>` followed by
text, unterminated `<script>` skips the rest, nested `<svg>` test unchanged; X4 the comment and
script-literal fixtures return `REAL_TITLE`; X5 `/API`, `/API/search`, `/Api/search` refused with
0 fetches, a redirect to `/API/search` refused before the second fetch, `/apiary` accepted. The
existing linear-time tests (1.9 MB inputs) must still pass, plus a new one: 1.9 MB of repeated
`<script>` start tags with no end tag.

Fix review (step 5): yes. X3, X4 and X5 change the scanner and the path guard, so the same Codex
child (`t1rb`, its context kept) re-reads the diff in one short pass.

Docs: the "Adapter review residue" bullet in `.agents/TODO.md` is deleted (R8), and the entry's
"Done when" drops its first clause (the vendor-diverse review is done). `research/services/stellar-org-site.md` "Design" states the caps and
the path rule, so it gains: titles clipped at 300 (audit `project` and `firm` too), at most 10
tags of 200 characters, `/api` refused in any case, and script-like elements skipped as raw text.
`specs/stellar-org.json` is not touched (catalog text would move routing).

Deploy: needed after merge (Worker bytes change). Production smoke after deploy: one
`search_site` and one `get_page` through the deployed MCP (orchestrator, Mac).

## Needs from the orchestrator or owner

- Deploy, if a fix lands (Mac-only).
- Any waiver listed in the triage table.

## Reconciliation of the Fable review ([REVIEW.md](REVIEW.md))

All nine findings adopted. Where they refine the triage table, this section wins.

- **R1 (blocking), adopted.** The raw-text end is found in two steps: a **global** (not sticky)
  regex for `</name(?![\w-])` (flags `gi`) with `lastIndex` at the start tag's end finds the
  `</name`; then `html.indexOf(">", thatIndex)` finds the end. If either finds nothing, the rest
  of the input is skipped and the scan stops; it never searches for a further candidate. Tests:
  through `get_page`, 1.9 MB `<main>ok<script>` + repeated `</script ` with no `>`, and the same
  shape for `<title>` in `<head>`; each within the existing linear-time test budget.
- **R2, adopted.** Inside a skipped `svg`, only `svg` tags count, as now; no raw-text jump and `/>`
  honoured. Tests: `<svg><title/></svg><p>after</p>` and `<svg><style/><path/></svg><p>after</p>`
  return `after`. The title scan (X4) skips `svg` and `template` and enters only `head`; test: no
  document title plus `<svg><title>icon</title></svg>` gives `title` = the path.
- **R3, adopted.** The raw-text jump runs below the skip logic, so it applies inside a skipped
  `head` and `template` too. Tests: `<head><script>var s = "</head><main>fake</main>";</script></head><main>real</main>`
  returns `real`; `<SCRIPT>x</ScRiPt >` is skipped.
- **R4, adopted.** One `clip(value, max)` helper ends a cut value with `…` (the result is at most
  `max` characters), used for `title`, `project`, `firm`, the document title, and the X2 excerpts.
  No new key. The description clip is unchanged. Correction: the longest title seen is 115
  characters (`test/fixtures/stellar-org-search.json`), so 300 is about 2.6x, still sound.
- **R5, adopted.** The tag count cap (10) also applies to the partner category merge. `textarea`
  leaves the raw-text set; the set is `script`, `style`, `noscript`, `iframe`, `title`
  (`title` text is dropped from content, as `head` already drops it in practice).
- **R6, adopted.** The live pass rule is in Gates above.
- **R7, adopted.** Plan text corrected in Steps and Gates; time boxes added.
- **R8, adopted.** The TODO bullet is deleted, not rewritten.
- **R9, adopted.** The fix review brief names its three targets.
