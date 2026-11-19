# Challenge of Codex Sol review — item 8.12 lane `driftissues`

- Reviewer: Codex CLI `gpt-6.2-sol` (`reasoning effort: high`, sandbox `read-only`), reviewed `origin/main...HEAD` (commit `2f5da16d`, PR #519).
- Review file: [`SOL-REVIEW.md`](./SOL-REVIEW.md).
- Summary counts: **10 valid (fixed)**, **1 invalid**, **0 valid but not worth fixing**.

## Findings

### F1 (high) — `.github/workflows/refresh.yml:181` (cold-runner 404 pin crashes catalog build before drift sync)
- **Verdict: valid** (pre-existing on `origin/main`, directly impacts the new `pins:ecosystem-skills` key).
- **Verification**: Checked `git show origin/main:.github/workflows/refresh.yml` (lines 173–176) and `scripts/build-catalog.mjs:40` / `scripts/build-super-spec.mjs:49`. Both builders call `loadSkillTexts()` from `scripts/lib/skill-mirror.mjs`, which fetches pinned files from upstream on a cold runner (`ecosystem-skills/.cache` is empty). If `check-mirrors --fetch` reports `state=unresolvable` (exit 1), `build-catalog.mjs` fails on the same 404 before `detect drift` or `sync drift issues` runs, so `pins:ecosystem-skills` can never open and the failure falls through to `refresh-failure`.
- **Fix**: Grouped `build-catalog.mjs`, `family-text:build`, and `spec:build` under `id: builders` guarded by `if: steps.pins.outputs.state != 'unresolvable'`, passed `--derived-checked` from `steps.builders.outcome == 'success'` to `sync-drift-issues.mjs collect`, and updated `canCloseKey` to hold any open `inventory:derived` issue when derived builders were skipped. Normal runs (`pins != unresolvable`) still run all builders unconditionally so real builder crashes still route to `refresh-failure`.

### F2 (medium) — `scripts/sync-drift-issues.mjs:568` (`canary:stale` closes `canary:failing`)
- **Verdict: valid**.
- **Verification**: Read `scripts/classify-canary.mjs:64-73` ("AGE BEFORE VERDICT, for both booleans. An old `ok:false` is not evidence that retrieval is failing *now*... both only prove the detector stopped") and `scripts/sync-drift-issues.mjs:567-571` (`checks.canary !== "error"`). If a failing canary ages past 3 hours without a new verdict, `checks.canary` becomes `"stale"`, which caused `canCloseKey("canary:failing", checks)` to return `true` and close the outage issue as "cleared" with no fresh healthy verdict.
- **Fix**: Updated `canCloseKey` for `canary` so `canary:failing` closes only on `checks.canary === "clean"`, while `canary:stale` closes on any fresh verdict (`"clean"` or `"failing"`). Added unit test coverage in `test/sync-drift-issues.test.mjs`.

### F3 (medium) — `.github/workflows/refresh.yml:234` (non-default branch dispatch mutating `main`'s drift issues)
- **Verdict: valid** (default-branch guard; stale reruns are standard GitHub Actions behavior across all repo workflows).
- **Verification**: Checked `.github/workflows/golden-sentinels.yml:41-42` ("The issue tracks the default branch only; a dispatch from another branch must not close it"). Because `refresh.yml` now closes cleared issues automatically, a manual `workflow_dispatch` on a feature branch that already absorbed a drift would close `main`'s open issue prematurely.
- **Fix**: Added a default-branch check (`github.ref == format('refs/heads/{0}', github.event.repository.default_branch)`) on `sync drift issues` so non-default refs run with `--dry-run` (logging planned actions without mutating `main`'s issues).

### F4 (medium) — `scripts/summarize-live-drift.mjs:527` (`inventory:derived` dropped when non-catalog source drifts)
- **Verdict: valid**.
- **Verification**: Read `inventory/README.md:6-8` (`build-catalog.mjs` reads only `lumenloop.json`, `stellar-light.json`, and `stellar-docs-titles.json`; `stellar-docs.json`, `stellar-org.json`, and `stellar-docs-anchors.json` do not feed `catalog/` or `specs/`). Gating `inventory:derived` on `sourceItems.length === 0` caused a real `catalog/` or `specs/` diff to disappear (and close `inventory:derived`) whenever an unrelated anchor, backend-probe, or `stellar-org` diff appeared in the same run.
- **Fix**: Gated `inventory:derived` on `!sourceItems.some((item) => CATALOG_FEEDING_SOURCES.has(item.source))` where `CATALOG_FEEDING_SOURCES = new Set(["lumenloop", "stellar-light", "stellar-docs-titles"])`.

### F5 (medium) — `scripts/sync-drift-issues.mjs:939` (`--assignee --dry-run` flag swallowing + live writes with `--open-issues`)
- **Verdict: valid**.
- **Verification**: Read `scripts/sync-drift-issues.mjs:931-943` and `runSync`. `parseFlags` accepted any defined `argv[i + 1]` even when it started with `--`, so `--assignee --dry-run` consumed `--dry-run` as the assignee value and executed live mutations; furthermore `--open-issues` was accepted without `--dry-run`.
- **Fix**: Updated `parseFlags` to throw when a value-taking flag's next token is missing or starts with `--`, and updated `runSync` to reject `--open-issues` unless `--dry-run` is also set. Added unit test coverage in `test/sync-drift-issues.test.mjs`.

### F6 (medium) — `scripts/sync-drift-issues.mjs:363` (unclassified sibling directory routed under `skills-pin`)
- **Verdict: invalid**.
- **Verification**: Read `scripts/check-skills-drift.mjs:137-205` and `306-315`. `check-skills-drift.mjs` itself models one result per source `id`, classifies every non-directory source under `Source remediation` (covering both `ecosystem-skills/update.sh` and `ecosystem-skills/sources.json` / `ecosystem-skills/groups.json`), and emits both commit drift and unclassified siblings in that source's `note`. `sync-drift-issues.mjs` already includes both the full `entry.note` and the `sources.json` / `groups.json` instructions in `skills-pin:<id>`. Keeping one issue per pinned source matches the lane brief ("using the classes and sources the workflow and `scripts/check-skills-drift.mjs` already report") and avoids filing two separate issues for one upstream commit that adds a sibling skill directory. If a maintainer re-pins without classifying the sibling, `entry.note` changes, the fingerprint updates, and the same issue comments the remaining unclassified sibling until resolved.
- **Fix**: None.

### F7 (medium) — `scripts/sync-drift-issues.mjs:32` (unanchored marker regex matches examples in legacy issues)
- **Verdict: valid**.
- **Verification**: Read `scripts/sync-drift-issues.mjs:32,50-55` and compared against `.github/workflows/dependency-audit.yml:68` (`head -n 1`) and `.github/workflows/golden-sentinels.yml:76` (`split("\n") | .[0]`). Because `MARKER_RE` scanned the entire body without anchoring to line 1, a legacy or manual `drift` issue containing an example marker in a fenced code block would match `parseDriftMarker` and be auto-closed on a clean run.
- **Fix**: Anchored `parseDriftMarker` strictly to the trimmed first line (`^<!--\s*raven-drift\s+...-->$`). Added unit test coverage in `test/sync-drift-issues.test.mjs`.

### F8 (medium) — `scripts/sync-drift-issues.mjs:849` (single `gh` error aborts reconciliation of remaining keys)
- **Verdict: valid**.
- **Verification**: Read `executePlan` (`scripts/sync-drift-issues.mjs:830-874`). A single failing `gh` command (e.g., an issue deleted or locked between list and comment) threw out of the loop and skipped all remaining independent keys.
- **Fix**: Wrapped each action in `try/catch`, logged `::error::`, continued reconciling all remaining keys, and threw an aggregated error at the end if any action failed so the CI step still exits nonzero.

### F9 (low) — `scripts/sync-drift-issues.mjs:469` (unrecognized skill status silently discarded)
- **Verdict: valid**.
- **Verification**: Read `scripts/sync-drift-issues.mjs:469-495`. Filtering only for `"DRIFT"`, `"error"`, and `"skipped"` silently treated an entry with an unrecognized status (or missing `id`) as clean rather than failing closed.
- **Fix**: Validated every `skillsJson.results` entry against `VALID_SKILL_STATUSES = new Set(["ok", "DRIFT", "error", "skipped"])` and a non-empty string `id`; any invalid entry sets `skillsError = true` and `skillsCheckOk = false`. Added unit test coverage in `test/sync-drift-issues.test.mjs`.

### F10 (low) — `scripts/sync-drift-issues.mjs:764` (pagination cap silently truncates at 100 pages)
- **Verdict: valid**.
- **Verification**: Read `ghApiPaginateArray` (`scripts/sync-drift-issues.mjs:761-773`). Breaking silently after `page <= 100` instead of failing closed would return a truncated comment list if the cap were ever reached.
- **Fix**: Changed `ghApiPaginateArray` to return when `batch.length < 100` and throw `pagination limit (100 pages) exceeded` if all 100 pages were full.

### F11 (low) — `inventory/README.md:29` (wording says "per drifted source" instead of "per drift kind")
- **Verdict: valid**.
- **Verification**: Read `inventory/README.md:29`. A single source like `stellar-docs` can have distinct keys (`anchors:stellar-docs`, `inventory:stellar-docs`, `inventory:stellar-docs-titles`, `inventory:stellar-docs-anchors`).
- **Fix**: Updated `inventory/README.md:29` to say "one `drift`-labeled issue per drift kind (keyed by drift class and source)".
