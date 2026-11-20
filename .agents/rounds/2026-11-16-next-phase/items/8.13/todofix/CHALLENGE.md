# Challenge of Codex Sol review — item 8.13 lane `todofix`

- **Reviewer:** Codex CLI (`codex-cli 0.169.0`), resolved model `gpt-6.2-sol`, reasoning effort `high`, sandbox `read-only`
- **Reviewed commit:** `51697682` (PR #522)
- **Review file:** [SOL-REVIEW.md](SOL-REVIEW.md)
- **Verdict counts:** 4 valid, 1 invalid, 0 valid but not worth fixing

Every finding from `SOL-REVIEW.md` was independently verified against the cited files, scripts, and lane rules before deciding whether to edit `.agents/TODO.md`.

## Finding-by-finding verification

### 1 (Medium) — Corpus-guide audit could run inside a maintenance-exception session that forbids it

- **Claim (`SOL-REVIEW.md`):** `.agents/TODO.md:323` offered a "separate step or follow-up PR" conditioned on whether editing `eval/corpus/PROVENANCE.md` widened the PR, whereas the maintenance exception in `eval/qa/README.md:244-259` restricts the session itself to work made necessary by the qualifying trigger ("its sessions do no other work"). A lane could close the register and audit both guides in the same session, violating the exception even if neither guide needed edits; and tying it only to closing left-open entries could skip it when the dated runs leave zero open entries.
- **Verification:** Checked `eval/qa/README.md:244-265`. Confirmed verbatim:
  - `Edit. It changes only what the trigger made stale, through golden-truth and its independent re-derivation.`
  - `Write set. The lane's sessions and its pull request change no product code, catalog, prompt, rubric, judge pack, or gate threshold, and its sessions do no other work.`
  Auditing `eval/qa/corpus/README.md` and `eval/corpus/PROVENANCE.md` is not triggered by a world-fact event or reopened register entry, so running it inside the maintenance-exception session itself would indeed violate the session-exclusivity rule, and it should still run after 2.2c even if the dated runs close every register entry.
- **Verdict:** **valid**
- **Action taken:** Updated the folded corpus-guide paragraph and `Done when:` in `"Close the register entries the dated runs leave open"` to require a separate post-2.2c session and PR (not inside a maintenance-exception session, and running even if the dated runs leave zero open register entries), with a brief authorizing only those two guide paths (or owner acceptance as unaudited). Preserved the frozen heading and first paragraph (`none recorded yet`) byte-identically.

### 2 (Medium) — Verdict-noise completion rule allows mismatched judge policies

- **Claim (`SOL-REVIEW.md`):** `.agents/TODO.md:1033` required sub-100 comparison paths to enforce matching `maxPanelCases` and `stabilityRegisterSha256`, which allows a forced three-judge run and a tiered run to share both values and still be paired. With synthetic inputs, `eval/qa/heldout-read.mjs:72` paired such rows and counted a downgrade.
- **Verification:** Read `eval/qa/paired-verdict.mjs:143-158` and `eval/qa/heldout-read.mjs:72-86`. Confirmed `tieringTuple()` in `paired-verdict.mjs` checks 10 fields (`policy`, `judgePanel`, `tieringJudgePanel`, `stabilityThreshold`, `stabilityRegisterStatus`, `stabilityRegisterSource`, `stabilityRegisterSha256`, `maxPanelCases`, `maxPanelCasesSource`, `defaultPanelPolicy`), while `heldout-read.mjs:72-86` checks only `caseInputSha256` and valid score values. Checking only `maxPanelCases` and `stabilityRegisterSha256` would indeed miss a mismatched `policy` or `judgePanel` mode.
- **Verdict:** **valid**
- **Action taken:** Updated both the "What is already enforced" summary and `Done when:` in `"Method note: same-surface verdict noise, and the judge-tier cap"` to require matching the full `tieringTuple` (including panel mode and policy, `maxPanelCases`, and `stabilityRegisterSha256`).

### 3 (Medium) — Claimed gap in fixed-cap repeat evidence is too broad

- **Claim (`SOL-REVIEW.md`):** `.agents/TODO.md:1030` stated that "no same-surface repeat at one fixed panel cap has measured the null directly" and `Done when:` accepted "a same-surface pair at one cap". Tuning-loop run R (`.agents/rounds/2026-11-15-tuning-loop-2.md:375`) repeated 17 identifier rows twice on frozen Worker `940dc013` at `--max-panel-cases 58`; as written, someone could cite that narrow 17-row trial to delete the note before calibrating a full panel.
- **Verification:** Read `.agents/rounds/2026-11-15-tuning-loop-2.md:373-381`. Confirmed run R ran 17 identifier rows twice on frozen Worker `940dc013`, same surface, `--max-panel-cases 58`, recording nets -1 and +2 across passes. That was a narrow 17-row identifier trial on a non-shipped pointer commit, not a 50+-row full-panel null calibration on the current surface.
- **Verdict:** **valid**
- **Action taken:** Scoped both the gap statement and `Done when:` to a same-surface repeat of a full panel (50+ rows, explicitly distinguished from the 17-row identifier trial R in tuning loop 2) at one fixed tiering tuple on the current surface.

### 4 (Low) — Mintlify migration ledger still points to the old TODO heading

- **Claim (`SOL-REVIEW.md`):** `.agents/rounds/2026-11-02-mintlify-migration.md:227` still reads `Own repo: .agents/TODO.md → "Point agents at the page when a docs hit has no body"`, so leaving it unchanged misses the cross-reference requirement in `8.13-LANES.md:40`.
- **Verification:** Checked `8.13-LANES.md:35`, `.agents/README.md:34-35`, and ran `rg --hidden -g '!.git' "Point agents at the page|point-agents-at-the-page|docs hit has no body"`.
  - `8.13-LANES.md:35` explicitly limits lane `todofix`'s write set to `.agents/TODO.md`, `ideas/README.md`, the post-2.2c brief (none committed), and its item folder; `.agents/rounds/2026-11-02-mintlify-migration.md` is outside the authorized write set.
  - `.agents/README.md:34-35` ("Retention") forbids rewriting retained dated records to reflect current state ("Git keeps the history; do not rewrite a retained record to describe current tools").
  - Zero living documents outside dated `.agents/rounds/` records reference the old heading.
- **Verdict:** **invalid**
- **Action taken:** None. Left `.agents/rounds/2026-11-02-mintlify-migration.md` untouched.

### 5 (Low) — `getChangelog` hold overstates what telemetry measured

- **Claim (`SOL-REVIEW.md`):** `.agents/TODO.md:891` cited "low measured caller impact in round item 3.1", whereas `.agents/rounds/2026-11-16-next-phase/items/3.1/EXEC.md:42` recorded an upper bound only (`scout.getChangelog` ranks first in few searches; no query text; "No measured demand; silence is not absence"), which cannot establish low impact among release callers specifically.
- **Verification:** Read `.agents/rounds/2026-11-16-next-phase/items/3.1/EXEC.md:42`. Confirmed verbatim: `Upper bound only: history queries use scout.searchResearch heavily; scout.getChangelog ranks first in few searches. No measured demand; silence is not absence.` Writing "low measured caller impact" overstated what 3.1 could measure without query text.
- **Verdict:** **valid**
- **Action taken:** Replaced `"low measured caller impact in round item 3.1"` in the `Held:` paragraph with `"no measured demand in round item 3.1 (few first-place scout.getChangelog searches overall, upper bound only because query text is not logged)"`.
