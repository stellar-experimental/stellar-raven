# Item 1.2 — Codex fix review

Reviewer: Codex frontier, `gpt-6-astra`, high effort. Date: 2026-11-17 UTC.
Reviewed commit: `272939f56a33b62437d2eb508b0565e18f644e45`, against `ada75c0d` / `origin/main`.
Read-only pass; no tracked changes, model calls, or live requests.

**Verdict: not fit to merge yet — 0 blocking, 1 should fix, 2 low.** The original reproducers for X1–X5 are fixed and the scanner passes the requested complexity attacks, but its SVG exception fails inside another skipped element and introduces silent content loss.

## Y1 — Should fix: SVG inside a template still takes the HTML raw-text jump

Locations: `src/adapters/stellar-org.ts:259`, `:270`, `:278`.

Concrete input to `get_page({path:'/t'})`, fake HTML response:

```html
<main>before<template><svg><title/></svg></template><p>after</p></main>
```

Observed by importing the actual old adapter from `git show ada75c0d:src/adapters/stellar-org.ts` and the current adapter, then running both on the same body:

```text
old: ok:true, content:"before\nafter"
new: ok:true, content:"before"           (no truncated/incomplete flag)
```

Replacing `<svg><title/></svg>` with `<svg><style/><path/></svg>` produces the same regression. With `<head><svg><title/></svg></head><main>real</main>`, old returns `content:'real'`, while new returns `soft-empty` and “rendered no server-side text.” The template example alone is sufficient: an inert template containing an SVG icon must not hide a later visible paragraph.

The `skipping !== 'svg'` exception only examines the **outermost** skipped name. Once `skipping` is `template` (or `head`), the scanner never records that it entered SVG. It interprets SVG's self-closing `<title/>` or `<style/>` as an unterminated HTML raw-text element, consumes the remaining input, and misses the enclosing close and following text. The direct SVG tests pass because their outermost skipped element is SVG.

Smallest fix: preserve nested SVG context while inside an already skipped template/head, and suppress raw-text jumps throughout that SVG region. For example, track the SVG region independently while retaining the enclosing skip/depth, or use a small nested-region stack. Honor SVG self-closing tags, restore the enclosing context at `</svg>`, and keep the raw-text jump for real HTML script/style elements inside templates. Add the two template fixtures above through both extraction and `get_page`; retain the existing nested-SVG and script-in-template tests. No full HTML parser or dependency is needed to address this counterexample.

This is a new extraction regression, not an egress issue. No affected live page was demonstrated. R2 is **not fully satisfied**; X3's original cases pass, but its replacement cannot be accepted unchanged.

## Y2 — Low: unrelated removal of literal NBSP normalization

Location: `src/adapters/stellar-org.ts:311`.

The old whitespace character class contained U+00A0. The new class contains a second ordinary space instead:

```text
input: <main>A\u00a0\u00a0B</main>   (literal U+00A0 characters)
old: content = "A B"
new: content = "A\u00a0\u00a0B"
```

Both versions still turn `<main>A&nbsp;&nbsp;B</main>` into `A B`, so equivalent literal and entity input now produces different output. This change is unrelated to X1–X5 and is not listed among the behavior changes in EXEC.md.

Smallest fix: restore U+00A0, preferably explicitly as `\u00a0`, in the whitespace class. A small literal/entity comparison protects against another invisible-character edit. This is a formatting regression, not a security boundary failure.

## Y3 — Low: the clipping-marker documentation overstates the implementation

Locations: `research/services/stellar-org-site.md:74`–`:76`; `src/adapters/stellar-org.ts:15`–`:17`, `:98`.

The new prose lists descriptions alongside the bounded fields and says “A clipped value ends with `…`.” Descriptions intentionally retain the old `slice(0, max)` behavior. Probe:

```text
siteHits([{kind:'page', title:'t', url:'/t', description:'D'.repeat(501)}])
  => description.length = 500
  => description.endsWith('…') = false
```

Smallest fix: narrow the marker statement to clipped titles, names, individual tags, and header excerpts; say descriptions retain their existing silent clipping. Do not change description output merely to make the new wording true: the reconciled plan explicitly preserves it. The header-excerpt prose at research line 86 should likewise say the ellipsis appears **when clipped**, since short excerpts are unchanged.

## X1–X5 closure

- **X1 — Closed for the requested upstream-field bounds.** The original 200,007-character search title now returns 300 characters; an audit's project is 300 with `firm:'Firm'` preserved and `reportUrl` visible. A 1.5 MB document title returns 300 characters with `USEFUL_CONTENT` still visible through the real host truncator. A 200,000-character tag returns 200. The new tests cover all kinds, the 10-tag cap and partner-category merge. Exact-limit values stay intact; clipping uses an ellipsis. The path fallback for a missing document title can still be 512 characters (the existing path bound); it does not revive the upstream-title amplification problem.
- **X2 — Closed.** The original 40 KB off-origin Location, same-origin Location, and content-type probes now produce messages of 262, 299, and 225 characters respectively, with no final-output truncation. Full URL validation precedes display clipping. Unparseable headers still echo nothing. No new fetch-boundary issue appeared.
- **X3 — Original reproducers closed; replacement not fully closed because of Y1.** Script/style opening-tag strings no longer swallow the later paragraph, `<script/>` no longer leaks its body, and a comment opener inside a script string no longer consumes later content. Mixed-case closes and nested head/template control cases pass. SVG nested inside another skipped region is the new counterexample.
- **X4 — Closed for the original false-title cases.** Comment and script-literal titles now yield `REAL_TITLE`; the shared scanner skips the hidden regions. Direct SVG titles do not become document titles. Its dependence on the scanner is subject to Y1, but the old uncontextualized-title regex is gone.
- **X5 — Closed.** `/API/search` and `/Api/search` now make zero requests. A redirect from `/start` to `/API/search` makes only the initial request. `/apiary`, `/Apiary/Page`, and other permitted paths retain their original case.

## R1: complexity attack

The end-search implementation is structurally linear in the scanned string: it finds one candidate, searches once for its `>`, then advances the outer scanner past that region; an unsuccessful search terminates scanning. I did not find a path that re-searches the same suffix from each candidate. The three consumers make a fixed number of passes. Shared end-regex `lastIndex` is reset for each use; the consumers are synchronous.

Fresh timings below are **full `get_page` calls**, including `mainHtml`, `htmlToText`, and title extraction, against fake responses. Each pair targets approximately 0.95 and 1.9 MB. Separate `mainHtml` and direct `htmlToText` timings were also recorded by the scratch script.

| Pattern | ~0.95 MB | ~1.9 MB |
|---|---:|---:|
| Repeated `</script ` without `>` | 23.70 ms | 2.00 ms |
| Many `<script>` starts, no end | 3.10 ms | 4.24 ms |
| Repeated `</style ` without `>` | 1.49 ms | 0.65 ms |
| Repeated `</title ` without `>` | 1.25 ms | 0.55 ms |
| Near-end names `</scriptx>` | 4.45 ms | 8.38 ms |
| Many mixed-case short scripts | 49.97 ms | 98.05 ms |
| Nested head/template/script units | 35.91 ms | 66.63 ms |
| Nested template/script units | 43.50 ms | 88.27 ms |
| Unterminated comment before raw text | 2.25 ms | 4.73 ms |
| Unterminated comment after raw text | 2.41 ms | 4.97 ms |
| Comment opener inside each script string | 37.54 ms | 77.91 ms |
| Nested SVG with self-closing titles | 74.80 ms | 148.47 ms |

The first call includes initialization; tiny measurements and warm-up differences are not scaling estimates. No measured full call exceeded 149 ms after that initialization, and no super-linear trend emerged. This is Node evidence, not a workerd CPU/heap guarantee. R1 passes this review.

## R2: old/new extraction comparison

I compared 21 bodies, including the committed page fixture, the original X3/X4 inputs, direct and template-wrapped SVG, nested head/template, comments before/inside/after scripts, mixed-case tags, `</scriptx>`, literal/entity NBSP, and a title outside head.

The committed fixture is byte-identical. Original X3/X4 inputs improve as intended. Direct SVG, the nested head/template controls, and exterior-comment handling remain unchanged. The new removal of title text from main content is the explicitly adopted plan behavior. Unexpected differences are Y1 and Y2; the SVG regressions prevent accepting R2 as complete.

## R6: live comparison is sound for its stated sample

I read `tmp/1.2-smoke/snapshot.mts` and independently deep-compared the saved `before.json` and `after.json`. Both contain exactly seven successful envelopes, and **the entire envelopes are equal**, stronger than only comparing the fields required by the plan:

| Sample | Equal output size |
|---|---:|
| `/` | 3,105 content characters |
| `/foundation/roadmap` | 5,804 |
| `/learn` | 1,551 |
| `/ecosystem` | 4,049 |
| `/audit-bank/projects` | 1,121 |
| Search `roadmap` | 1 hit |
| Search `OtterSec` | 9 hits |

The script calls the adapter's real request path and records full envelopes, so it cannot mistake two failed calls for matching content; I explicitly checked all seven `ok` values. It makes seven operation calls; EXEC.md's “about 14 requests” is an estimate, not an instrumented count. The saved files do not retain raw HTTP bodies or embed a source hash; the before-commit provenance rests on the lead's record. These are limits of the evidence, not a failed comparison.

The comparison meets the registered pass rule and does not need a redundant live repeat. It demonstrates unchanged sampled outputs, not full scanner equivalence: those pages did not expose Y1/Y2. I used **zero additional live requests** in this fix review.

## Verification and scope

- `npx vitest run test/stellar-org-adapter.test.ts test/stellar-org-detail-hint.test.ts test/stellar-org-guard.test.ts`: **115 tests passed**, 3 files, exit 0.
- Re-ran the original `tmp/1.2-probes/boundary.mjs` against the fix: all assertions passed; captured the changed caps, API refusals, header errors, body cancellation, redirect limits, and `[12000,12000,6000]` deadline arguments. Its old diagnostic labels such as `direct-valid-path` are labels only; the output now correctly shows `/API/search` refused.
- Reproduction scripts: `tmp/1.2-probes/fix-compare.mjs`, `tmp/1.2-probes/fix-timing.mjs`, and the old adapter copy `tmp/1.2-probes/old-adapter.ts` (only its runtime types-module import relocated for execution).
- Fetch origin, request headers, manual redirect behavior, body caps, and deadlines are otherwise unchanged by the diff. The earlier hostile-host/URL matrix still passes. No credentials or `.dev.vars` were read.
- `git diff --exit-code` passed; the working tree remained clean. No tracked edits, new agents, Wrangler process, install, commit, push, or deployment. I did not rerun broad build/typecheck/smoke gates; EXEC.md records the author's gates and the lead owns the final sweep.
