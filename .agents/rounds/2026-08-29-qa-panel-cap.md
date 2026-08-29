# QA panel cap — 2026-08-29

## Route card

| Field | Value |
| --- | --- |
| Lane | Panel-cap implementation only |
| Trigger | `.agents/TODO.md` item: `--max-panel-cases 10` is too small for 100-case runs |
| Skill | `.agents/skills/run-evals/SKILL.md` |
| Scope | Add a bounded denominator-scaled boundary-panel limit. Print its contract and counts. |
| Out of scope | Paid QA or judge calls, judge selection semantics, lane membership, corpus changes, unrelated TODO items, generated-file edits |
| Required evidence | Focused small, 30-case, 100-case, override, artifact-field, and summary-output tests; all requested free gates |
| Report | `/tmp/qa-panel-cap-sol.md` |

## Decisions

- Set the default to `min(34, max(10, ceil(selected / 3)))`.
- Preserve the prior limit of 10 for every denominator through 30.
- Cap the default at 34 for denominators above 100.
- Compute the selected denominator after `--ids` and `--sample` selection.
- Apply an explicit CLI or `QA_MAX_PANEL_CASES` value without scaling.
- Keep stability-triggered panels uncapped.
- Count boundary eligibility from `escalationReason` values that start with `boundary-`.
- Preserve a stored cap and source across resume. Refuse a different explicit resume cap.
- Accept only trimmed decimal digits for cap overrides.
- Keep all QA, routing, live-data, and historical denominators unchanged.

## Evidence

- The 2026-08-28 same-100 run had 31 boundary-eligible rows.
- Its explicit limit admitted 10 panels and skipped 21 panels.
- Its mean panel cost was `$0.180`. Its mean single-call cost was `$0.069`.
- Covering all 31 boundary rows adds about `$2.40` of judge cost.
- The prior sample-30 default was 10 panels.
- The floor preserves limits for the frozen 2-case, 15-case, and 30-case lanes.
- The ceiling prevents an unsupported rise to 167 panels for a 500-case run.
- ADR-0008 keeps panel behavior in T4 and forbids hidden denominator changes.
- `resolvePanelCaseLimit(30)` returns 10.
- `resolvePanelCaseLimit(100)` returns 34.
- `resolvePanelCaseLimit(499)` and `resolvePanelCaseLimit(500)` return 34.
- Small-denominator fixtures cover 0, 1, 2, 15, and 30 selected cases.
- Direct CLI and environment fixtures preserve exact overrides and reject invalid syntax.
- `meta.judgeTiering` stamps the selected count, cap source, clamp, and four panel counts.
- `boundaryEligibleCases` records only the boundary demand controlled by the cap.
- Summary fixtures cover the cap, source, selected count, boundary demand, use, and skips.
- Both inline judging and `--judge-stored` compute the limit after case selection.
- Stored judging seeds the boundary budget from already stored panel rows on resume.
- Crash-resume fixtures cover an existing panel, an existing skip, and a cap mismatch.
- The generated routing and QA artifacts stayed unchanged after their script-owned rebuilds.

## Review reconciliation

All five findings in `/tmp/qa-panel-cap-review-grok.md` were blocking.

1. Stored resume now preserves the stamped cap. It refuses a different explicit cap.
2. Override parsing now accepts only trimmed decimal digits.
3. The floor preserves frozen small lanes. The ceiling limits the policy to same-100 evidence.
4. Artifacts now stamp `boundaryEligibleCases`. Both summaries print the full cap contract.
5. Stored resume tests now cover panels, skips, and cap mismatch behavior.

## Gates

| Gate | Result |
| --- | --- |
| Focused tests | Pass: 3 files, 62 tests |
| `npm run eval:selftest` | Pass: all checks |
| `npm run eval:compile` | Pass: 338 legacy, 122 extended; generated output unchanged |
| `npm run eval:qa:compile` | Pass: 500 cases, sample 30; generated output unchanged |
| `npm run eval:qa:lint -- --stale` | Pass: 0 errors, 60 existing warnings |
| `npm run eval:routing -- --gate` | Pass: legacy 338 and all other lane gates |
| `npm run typecheck` | Pass |
| `npm test` | Pass: 91 files, 1,399 tests |
| `npm run build` | Pass: Wrangler dry run |
| `npm run secrets:scan -- --tree` | Pass: repository scanner and Gitleaks found no leaks |

## Outcome

Pass. The bounded policy preserves every frozen small-lane cap. It raises the 100-case default to
34 and holds larger defaults at 34. Explicit overrides remain exact. Stored resumes preserve the
stamped contract. Artifacts and console output report the cap and its boundary demand. No paid
command ran.

## Independent recheck

Route: an independent Grok reviewer performed a vendor-diverse adversarial recheck after the
Codex implementation. The reviewer read the specification, ADR-0008, the eval runbook, the diff,
and the same-100 cost evidence. The reviewer changed no source file and ran no paid command.

The first review made five findings. All five findings blocked completion.

1. Stored resume did not pin the first cap. The implementation now preserves the stored cap and
   source. It refuses a different explicit cap before another judge call.
2. Override parsing accepted non-decimal forms. The parser now accepts trimmed decimal digits
   only. Direct CLI and environment fixtures cover valid and invalid values.
3. The unbounded scale reduced small lanes and extrapolated at 500 cases. The final policy uses a
   floor of 10 and a ceiling of 34. It preserves frozen lanes and stays within same-100 evidence.
4. The first artifact count mixed boundary demand with other panels. `boundaryEligibleCases` now
   counts only `boundary-` reasons. Both summaries print the complete cap contract.
5. Stored resume lacked cap-budget coverage. The tests now cover a stored panel, a stored skip,
   another boundary row, and a mismatched resume cap.

The Grok recheck ran the three focused files. All 62 tests passed. It verified these results:

- A stored cap of 1 remains 1 during resume.
- A changed cap of 2 causes a refusal and zero judge calls.
- Denominators 2, 15, and 30 use 10.
- Denominators 100, 499, and 500 use 34.
- `boundaryEligibleCases` excludes stability and forced panels.
- Both run paths print the resolved contract before spend and the final counts after judging.

Final reviewer verdict: **PASS**. Issues 1 through 5 are resolved. No blocking finding remains.

## Finalization checks

| Check | Result |
| --- | --- |
| Focused panel-cap tests | Pass: 3 files, 62 tests |
| `npm run eval:qa:lint -- --stale` | Pass: 0 errors, 60 known warnings |
| `npm run eval:qa:register` | Pass: up to date, 0 reopened |
| `git diff --check` | Pass |
| `npm run secrets:scan -- --tree` | Pass: no leaks found |
