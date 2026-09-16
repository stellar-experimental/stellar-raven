# Review: Scout skill-reference filter for unlisted `/api/repos`

Reviewer: Grok high (Grok 4.6).
Clock: `2026-09-16T20:31:56Z`.
Mode: audit. No edits. No source, pin, or RWA acceptance.
Worktree: `/tmp/raven-execution-2026-09-16/skill-filter` at `a83b3c5943b27f585ab4caafe264518e09ab236a` plus six dirty files.
Trigger: `.agents/rounds/2026-09-16-maintenance-execution/light-pin-impact.md`.

## Verdict

**Accept this host filter.** It does not accept the Light pin `3b587aa9`, Scout 1.9.52, or `GET /api/rwa`.

The candidate Light `references/api-reference.md` quotes `/api/repos` as a stored-row collection. Neither accepted 1.9.1 nor candidate 1.9.52 OpenAPI lists that path. Exposed children remain `/api/repos/search`, `/api/repos/explain`, and `/api/repos/trust`. The old `text.includes("/api/repos")` guard would have treated those children as excluded. This patch splits “absent from spec” from “present and excluded,” matches exact path boundaries, and drops a complete blockquote instead of a partial sentence.

Independent focused run: 20 tests in `test/catalog-guards.test.mjs` and `test/skill-scrub.test.ts` passed.

## What the six files do

| File | Change |
|---|---|
| `src/policy/scout-exposure.ts` | Keep `EXCLUDED_SCOUT_OPS`. Add `SCOUT_PATHS_ABSENT_FROM_SPEC = {/api/repos}`. Union into `EXCLUDED_SCOUT_PATHS` for prose filtering only. |
| `scripts/build-catalog.mjs` | Keep the presence guard on excluded ops. Add the inverse: if an absent-from-spec path appears in OpenAPI, throw. |
| `scripts/exposure.mjs` | Re-export the new set so builders and Worker share one module. |
| `src/skills/scrub.ts` | Boundary regex `(?![\\w/-])`. Remove a complete consecutive `>` block that names an excluded path. Unstructured leftovers still throw. |
| `test/catalog-guards.test.mjs` | Presence still fails if `POST /api/feedback` disappears. Inverse fails if `/api/repos` is inserted into OpenAPI. |
| `test/skill-scrub.test.ts` | Quote removal keeps search/explain headings. Query-string `/api/repos?limit=1` matches; `/api/repos/search`, `/api/repos-extra`, `/api/repository` do not. |

Committed 1.9.1 inventory has no `/api/repos`. It has the three child paths.

## General behavior and fail-closed

- **Present-and-excluded ops** still must exist in OpenAPI. A rename of `GET /api/quality` still breaks the build.
- **Absent-from-spec paths** must stay absent. If Scout later lists `/api/repos`, the build throws until someone moves it to an expose or exclude decision. That is the required review, not a silent policy change.
- Those two sets must not both contain the same path. The inverse error names `SCOUT_PATHS_ABSENT_FROM_SPEC` as the place to reconcile.
- Scrub still fails closed on prose that is not a heading, table row, list item, or blockquote.
- Path match is exact: `/api/repos` plus a following word, slash, or hyphen does not match. A following `?` does. Child templates `/api/repos/{id}` stay unmatched because the next character is `/`.

This is general. It does not special-case one Light paragraph beyond listing the unlisted collection that the pin impact named.

## Source boundaries

Raven’s exposed Scout repo surface stays the OpenAPI children. The filter does not invent a `listRepos` operation. It does not add `/api/repos` to `EXCLUDED_SCOUT_OPS` (that would fail the presence guard on 1.9.1). Quality, verify, and RWA exclusion/exposure are untouched.

## Source-copy implications

This patch can land on current main without pinning Light `3b587aa9`.

When that pin is later reviewed, the new api-reference blockquote is:

```text
> **Two views of a repo, and which to ask.** `/api/repos` is the stored row;
> `/api/repos/search` is the curated agent view …
```

Applying this scrub to that candidate body (read-only check) drops the quotation, keeps `## GET /api/repos/search`, `explain`, and `trust`, and leaves no bare `/api/repos`. SKILL.md in the pin diff only names `/api/repos/search` and `/api/repos/trust`, so it would not trip fail-closed.

The comparison sentence in the quote is lost. That is the intended cost of not advertising an unlisted collection. The exposed search docs remain.

Do not treat that check as pin acceptance. RWA text in the same pin remains an unaccepted exposure proposal.

## Limits

- No catalog rebuild is in this six-file diff. Current served Scout skill bodies on 1.9.1 do not need `/api/repos` scrub until the pin lands.
- Numerical routing floors are out of scope.
- PR157 source/activation metadata is a separate lane.
