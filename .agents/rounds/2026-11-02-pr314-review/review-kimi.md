# Independent review — PR #314 (golden source sentinels)

Reviewer: kimi-k3. Scope: `git diff ecc6da78..1ba59ccd` (12 files). Every number below was
re-derived from the files, from live fetches, or from local probes under `tmp/`.

## Findings

### 1. medium — an errors-only run with no open issue is silent; a dead source never surfaces

- `file:line`: `.github/workflows/golden-sentinels.yml:61-85` (branch logic), with
  `eval/qa/source-sentinels.mjs:145-147` (a 404 is an `error`, not `drift`).
- Defect: the workflow opens or edits the issue only when `DRIFT > 0`, and closes it only when
  `ERRORS = 0`; when `DRIFT = 0`, `ERRORS > 0`, and no issue is open, it prints a log line and
  takes no action.
- Scenario: a sentinel's source page is removed (HTTP 404) one day after the last fully clean
  run. Every daily run from then on prints "No drift and no open issue (1 unreadable)" and does
  nothing. The golden's primary source is gone — the exact condition the sentinel exists to
  flag — yet no issue is ever opened and the signal appears only in the Actions log.
- Reproduce: static; the branch chain `if DRIFT>0 … elif [ -n "$existing" ] && [ "$ERRORS" -eq 0 ]
  … elif [ -n "$existing" ] … else echo "No drift and no open issue"` has no notification path
  for the errors-only case. Marked **unconfirmed live** (the workflow cannot be run under the
  read-only rule), but the runner side is confirmed: `--report` on a dead host yields
  `drift=0`, `errors=2` (probe `tmp/dead.json`).
- Note: the header comment defends "leave an open issue as is" for the close direction; the
  same silence applies to the open direction, which the comment does not address.

### 2. low — `normalize` throws RangeError on an out-of-range numeric entity, turning a readable page into an error

- `file:line`: `eval/qa/source-sentinels.mjs:121-122` (`String.fromCodePoint` is called on the
  raw entity value without a range guard).
- Defect: any page containing a numeric entity above U+10FFFF (for example `&#99999999;`, which
  broken CMS output produces) makes `normalize` throw; the fetch is then retried once and the
  sentinel is recorded as `error` even though the anchor text is present.
- Scenario: a watched page gains one malformed entity in unrelated chrome; the sentinel reports
  `error` on every run and — per finding 1 — can do so silently if no issue is open.
- Reproduce (confirmed):
  `node -e "import('./eval/qa/source-sentinels.mjs').then(async m => { const f = async () => ({ok:true,status:200,headers:new Headers({'content-type':'text/html'}),text:async()=>'<p>Deadline: November 9</p>&#99999999;'}); console.log(await m.runSentinels([{id:'t1',caseId:'q-a',url:'https://x.example/',check:{kind:'present',pattern:'Deadline: November 9'}}], f)); })"`
  → `[{… "verdict":"error","detail":"Invalid code point 99999999"}]`.

### 3. low — the SDF board roster anchor misses additions and breaks on a cosmetic reorder

- `file:line`: `eval/qa/source-sentinels.json:56-64` (`sdf-board-roster`).
- Defect: the anchor is the ordered concatenation of the five current directors' names
  (`Board of directors Jed McCaleb Lin-Hua Wu Ronaldo Lemos Ginger Baker Asiff Hirji Advis`), so
  it tests removal, rename, and order — but not membership growth.
- Scenario (weak): SDF appoints a sixth director at the end of the list; the pattern still
  matches and the roster change goes undetected until `reverifyBy`. Scenario (brittle): SDF
  reorders the existing five names with no membership change; the anchor drifts and costs a
  re-verification over a cosmetic edit. A count over the section, or five independent
  per-name `present` anchors, would not have either property.
- Reproduce: pattern semantics; live run confirms the anchor matches exactly once today.

### 4. low — an invisible U+200B literal sits inside the whitespace-collapse regex

- `file:line`: `eval/qa/source-sentinels.mjs:124` (`/[\s​]+/g` — the second character in the
  class is a literal zero-width space, bytes `e2 80 8b`).
- Defect: it works, but an invisible code point in source is a reviewability hazard; an editor
  retyping the line drops the behavior without any visible diff, and every other escape in the
  file is written explicitly.
- Reproduce: `sed -n '124p' eval/qa/source-sentinels.mjs | hexdump -C` → `5c 73 e2 80 8b 5d`.
  `\u200b` would be identical semantically.

### 5. low — the workflow's fail-safe contract has no test coverage

- `file:line`: `test/source-sentinels.test.mjs` (absence); the contract lives in
  `eval/qa/source-sentinels.mjs:19-20, 236-248`.
- Defect: the behaviors the workflow depends on — exit 2 when every fetch fails, the exact
  `drift=`/`errors=`/`fingerprint=` stdout lines for `$GITHUB_OUTPUT`, and the exclusion of
  stale sentinels from live runs — are untested; `main()` is never exercised. The 10 tests are
  honest about their scope (validation, normalization, check kinds, fetch reuse, report shape);
  nothing misnamed, but a regression in `main()` would pass the suite and reach the daily
  workflow unobserved.
- Reproduce: probe evidence that the behavior exists today — `node eval/qa/source-sentinels.mjs
  --sentinels tmp/dead.json --report tmp/dead-report.md` exits 2 and prints exactly the three
  output lines; no test asserts this.

### 6. low — duplicate open issues are never reconciled

- `file:line`: `.github/workflows/golden-sentinels.yml:60` (`--jq '.[0].number // empty'`).
- Defect: if two open issues ever carry the `golden-sentinels` label (manual creation, a
  recovered-outage race before the concurrency group existed), the sync touches only the first;
  the second is never updated and never closed, contradicting the "keeps exactly one open
  issue" contract. The same defect exists verbatim in `dependency-audit.yml:60`, so this is an
  inherited pattern, not a new one.
- Reproduce: static; `--jq '.[0].number'` discards the rest of the list. Unconfirmed live.

### 7. unconfirmed — `gh issue view | head -n 1` under `pipefail` could fail the step on a large body

- `file:line`: `.github/workflows/golden-sentinels.yml:68`.
- Defect: GitHub Actions runs bash with `-eo pipefail`; `head -n 1` closes the pipe after the
  first line, and a large body could give `gh` SIGPIPE (exit 141), failing the sync step. The
  generated body is ~20 short lines and fits one pipe buffer, so this cannot fire today; it
  would matter only if the report format grew substantially. Same inherited pattern as
  `dependency-audit.yml:68`. Marked **unconfirmed**.

## What I checked and found sound

- **Live run**: `node eval/qa/source-sentinels.mjs` — all 22 sentinels hold, exit 0.
  `npm run eval:qa:sentinels -- --check` — 22 sentinels, 0 errors, 0 stale.
- **Controls reproduce**: `sentinel-controls.json` run live gives 4 drift, 0 errors, 1 hold
  (Meridian), matching the audit's "4 of 5 detected"; report mode emits a correct issue body
  with the fingerprint marker as line 1.
- **Quote-sweep arithmetic**: `quote-sweep.json` has 154 rows; 82 recorded July–October 2026;
  75 fetched without error; 3 of the 75 are PDFs; of the other 72, 68 hold and the 4 drift rows
  are exactly the four the README names (noether.exchange, agentic-commerce-protocol README,
  stellar-mpp-sdk README, MetaMask). The README's numbers are exact.
- **Coverage claim**: probes.json has 35 probes; the sentinels cover 20 distinct cases, all of
  them probe cases; 15 uncovered. Matches "20 of 35".
- **`caseAsOf` guard**: all 22 `caseAsOf` values equal their case's `truth.asOf`; the stale
  path is a distinct severity (not an error) and exits 1 in `--check`; the committed-set test
  wires this into `npm test` (3006 passed, 3 expected fail — the PR's claim).
- **Exit codes**: exit 2 when every fetch fails (confirmed via `tmp/dead.json`), and the report
  file plus the three `$GITHUB_OUTPUT` lines are written before the exit, so a total outage
  fails the step and can never close the issue. Unknown `--ids` exits 1 before any fetch.
- **Token handling**: `Authorization` is added only for URLs starting `https://api.github.com/`
  (lookalike hosts fail the trailing-slash prefix check); no committed sentinel URL carries the
  token to a non-GitHub host; a full live run with no `GITHUB_TOKEN` in the environment
  succeeded, confirming the "needs no key" claim.
- **Workflow mechanics**: cron ordering comment is accurate (refresh 06:17, dependency-audit
  06:41, sentinels 07:17); label creation precedes the label-scoped issue query; the sed
  fingerprint extraction matches the report marker format; the state machine matches the header
  comment and the `dependency-audit.yml` pattern plus the errors guard; permissions are minimal;
  shell quoting of `$GITHUB_SHA` and issue numbers is sound; `gh issue edit` accepts the URL
  that `gh issue create` prints.
- **Anchor quality for the other 19 sentinels**: each tests the golden's actual volatile value
  (SCF round state and deadline, archive-row count vs. the golden's nine, Zenex mainnet claim,
  SEP-55/58 Draft status, the $15,000 instaward cap, the $100m enterprise-fund figure, ledger
  limits, MPP payment intents, base reserve 5,000,000 stroops via Horizon, advisory count 3 via
  the GitHub API, MetaMask default-network support, SDP TSS definition, HackerOne partnership,
  ML-DSA absence, x402 SEP absence). The two `absent` anchors can false-positive on a mere
  roadmap mention, but the cost is one bounded re-verification, which the method documents.
- **Docs and skills**: `eval/qa/README.md`, the `golden-truth` and `truth-maintenance` skill
  edits, and the audit Part 2 all match the implemented behavior; the "a drift never changes
  gospel by itself" rule is preserved everywhere; the completed TODO item was removed; the
  pre-existing `dependency-audit.yml` comparison holds.
- **Lint**: `npm run eval:qa:lint -- --stale --enforce-floors` → 0 errors (62 pre-existing
  warnings).
