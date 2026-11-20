# Item 8.13 (`improvements`): Challenge of Codex Sol Review

- **Reviewer:** Codex Sol (`gpt-6.2-sol`, `model_reasoning_effort="high"`, read-only sandbox)
- **Review file:** [SOL-REVIEW.md](./SOL-REVIEW.md)
- **Reviewed diff:** `origin/main...247b0469`
- **Verdict counts:** **6 valid** (all fixed; 2 with factual/mechanism clarifications noted below), **0 invalid**, **0 valid but not worth fixing**

## Finding-by-Finding Verification

### 1. Medium — `ll-007:63`: `ll-007` gives a replay that misses both affected events
- **Verdict:** **Valid**.
- **Evidence:** Re-executed live against `POST https://api.lumenloop.com/v1/tools/search_content_semantic` on 2026-11-20:
  - `{query: "Stellar Build Station India builder sprint", types: ["events"], date_start: "2026-06-01"}` returned 20 events including Jaipur `1444`, and omitted both Bhopal `1597` (`has1597: false`) and Jabalpur `1598` (`has1598: false`).
  - `{query: "Bhopal Jabalpur Build On Stellar workshop", types: ["events"], date_start: "2026-06-01", limit: 100}` (the configured frontmatter probe) returned both `1597` and `1598` (`has1597: true, has1598: true`).
  - Dropping the historical `2026-07-03 and 2026-07-09` date qualifier in `## Evidence` made the old query read as a currently working replay for `1597`/`1598`.
- **Fix applied:** Updated `improvements/lumenloop/ll-007-event-summary-date-prose-mismatch.md` `## Evidence` to give the working probe query for `1597`/`1598` and the `Stellar Builders Camp Jaipur` query for `1444`.

### 2. Medium — `ll-006:53`: `ll-006` asks for date controls that already work for articles
- **Verdict:** **Valid** (note: the unconditional wording pre-existed in `ll-006` before this PR, and our slimming retained it).
- **Evidence:** Inspected `GET https://api.lumenloop.com/v1/tools/search_content_semantic` and re-ran both bounded July 6–10 article queries on 2026-11-20:
  - Input schema already exposes `date_field` (`enum: ["publishing_date", "created_at"]`, `"For articles only: force a specific date field. Default is COALESCE(publishing_date, created_at)."`).
  - Default call returned `9319 (Jul 8)`, `9443 (Jul 7)`, `9106 (Jul 6)`, `9163 (Jul 8)`, `9168 (Jul 8)`, `9054 (null)` — undated row mixed in and non-chronological.
  - Call with `date_field: "publishing_date"` excluded `9054` (returned `9319`, `9443`, `9106`, `9163`, `9168`, `9102`, all dated July 6–8), while order remained non-chronological and non-article collections have no `date_field` option.
- **Fix applied:** Narrowed `improvements/lumenloop/ll-006-article-ranking-freshness.md` `## Recommendation` to credit `date_field: "publishing_date"` for `articles` and scope the remaining request to default `COALESCE` handling of undated rows, non-article collections, and explicit chronological (`date-desc`) ordering.

### 3. Low — `ll-017:54`: `ll-017` misstates the top Tyler similarity
- **Verdict:** **Valid** (with mechanism clarified).
- **Evidence:** Re-executed live on 2026-11-20:
  - `search_content_semantic({query: "Tyler van der Hoeven", limit: 5})` returned `_top_similarity: 0.229`.
  - `search_content_semantic({query: "Tyler van der Hoeven", limit: 10})` returned `_top_similarity: 0.231` (and 30 rows); `"Strupey"` at `limit: 10` returned `_top_similarity: 0.259`.
  - `0.229` was a genuine `_top_similarity` value from our `limit: 5` probe (not a misread of a lower article row), but pairing it with `"and 30 rows"` (the `limit: 10` result) was inconsistent.
- **Fix applied:** Updated `improvements/lumenloop/ll-017-semantic-person-match-provenance.md` `## Evidence` to specify `limit: 10` and record the matching `_top_similarity` values (`0.231` vs `0.259`).

### 4. Low — `ll-009:48`: `ll-009` overstates the consumer impact
- **Verdict:** **Valid**.
- **Evidence:** Re-executed `POST https://api.lumenloop.com/v1/tools/get_document` `{collection: "articles", id: 5945}` on 2026-11-20: returned HTTP 200 `"Q1 2026: Execution at network scale"` with SDF's own `$2B` RWA figure, without the Messari misattribution. Saying "any agent answering RWA questions from Lumenloop alone reproduces it" overstated the scope (carried over from the pre-edit text).
- **Fix applied:** Narrowed `improvements/lumenloop/ll-009-messari-report-misattribution.md` `## Evidence` to state that an agent answering from the affected roundup or media records reproduces it, noting separate SDF article `5945`.

### 5. Low — `sd-009:51`: `sd-009` drops the fallback for the unresolved source gap
- **Verdict:** **Valid**.
- **Evidence:** Checked pre-edit `improvements/stellar-docs/sd-009-sep-6-interactive-deprecation-undiscoverable.md` lines 72–75. Slimming dropped the fallback rule ("treat the QA row as a corpus/source-coverage diagnostic..."), which changes a reviewer's next action under `8.13-SLIM.md` ("Keep: every rule or fact that changes someone's next action").
- **Fix applied:** Restored the one-sentence diagnostic fallback in `improvements/stellar-docs/sd-009-sep-6-interactive-deprecation-undiscoverable.md` `## Recommendation`.

### 6. Low — Seven November 20 rechecks are missing from `recurrences`
- **Verdict:** **Valid**.
- **Evidence:** Confirmed against `.agents/skills/improvements-pipeline/SKILL.md:146` (`still reproduces | Keep the status; add a dated local recurrence`) and the seven cited files (`ll-009`, `ll-012`, `ll-025`, `ll-030`, `sd-005`, `sk-027`, `sk-028`). Each of those seven files explicitly recorded a `2026-11-20` live still-reproducing observation in its body or `evidence` without a matching `2026-11-20` entry in frontmatter `recurrences`, leaving frontmatter and `improvements/INDEX.md` recurrence counts behind the prose in the same file.
- **Fix applied:** Added concise `2026-11-20` recurrence entries to `ll-009`, `ll-012`, `ll-025`, `ll-030`, `sd-005`, `sk-027`, and `sk-028`, and regenerated `improvements/INDEX.md` via `npm run improvements:index`.
