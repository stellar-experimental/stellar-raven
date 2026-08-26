# QA quality deep dive — 2026-08-25

## Scope

Diagnose why the headline QA score sits near 65% (half-credit basis) and produce an
evidence-backed improvement plan. Five max-effort lanes fan out under Herdr; the
orchestrator synthesizes into two research documents.

## Evidence base

- Latest full battery run: `eval/qa/results/2026-08-14T03-56-23-variantA.json`
  (100 cases, answering model `claude-sonnet-5`, judge `claude-sonnet-5`, rubric
  `v2.4`, pack `p3`). Verdicts: 45 correct / 39 partial / 15 wrong / 1 error.
- Rejudge of the same run: `eval/qa/results/2026-08-18T22-04-13-rejudge.json`:
  40 / 46 / 14. Judge flip rate between passes: 17/100 (7 up, 10 down).
- Half-credit score: ~63–64.5% — the "~65%" under review.

## Lanes

| lane | agent (model, effort) | report |
| --- | --- | --- |
| golden-truth legitimacy + judge audit | Claude Fable (`fable`, effort max) | `/tmp/raven-qadeep/fable-max.md` |
| pipeline failure forensics | Codex (`gpt-5.6-sol`, max) | `/tmp/raven-qadeep/sol-max.md` |
| assumption attack + alternatives | Grok (`grok-4.6`, xhigh) | `/tmp/raven-qadeep/grok-xhigh.md` |
| service coverage gap map | Codex (`gpt-5.6-terra`, max) | `/tmp/raven-qadeep/terra-max.md` |
| SOTA survey + fresh-eyes spot audit | OpenCode (`moonshotai/kimi-k3`) | `research/qa-deep-dive-2026-08-25/kimi-k3.md` |

All lanes read-only against the repository except their own report file.

## Ledger

- `2026-08-25T21:40Z` — round opened; evidence base compiled from existing results;
  no new eval runs started yet.
- `2026-08-25T21:52Z` — five panes split from `w3:p13`; agents started: fable-max
  (Claude `fable`, effort max) at `w3:p14`, sol-max (Codex `gpt-5.6-sol`, max) at
  `w3:p15`, grok-xhigh (Grok 4.6, xhigh) at `w3:p16`, terra-max (Codex
  `gpt-5.6-terra`, max) at `w3:p17`. All four confirmed working on briefs from
  `/tmp/raven-qadeep/brief-*.md`.
- `2026-08-25T21:58Z` — OpenCode TUI wedged twice for kimi-k3 (`w3:p18` closed;
  relaunched non-interactively as `opencode run` in new pane `w3:p19`). Report path
  moved in-repo to `research/qa-deep-dive-2026-08-25/kimi-k3.md` because
  non-interactive mode auto-rejects writes outside the project directory. Confirmed
  reading eval docs and working.
- `2026-08-25T22:20Z` — kimi-k3 stalled on an oversized single write attempt and
  looped no-op shell calls; killed PID and relaunched detached
  (`opencode run`, prompt file `/tmp/raven-qadeep/kimi-prompt2.txt`) with a
  chunked-write rule (each write under 3,000 characters). Confirmed working.
- `2026-08-25T22:47Z` — four pane lanes complete; reports archived to
  `research/qa-deep-dive-2026-08-25/`: fable-max (55,534 B), grok-xhigh
  (42,230 B), sol-max (33,678 B), terra-max (24,662 B). Orchestrator live probes:
  base-reserve routing/content verified discoverable via `stellarDocs.search_docs`;
  Scout wallet roster verified enumerable via `scout.searchProjects` (20 rows).
  Synthesis documents started.
- `2026-08-25T23:40Z` — kimi-k3 third launch succeeded after two stalls (oversized
  write; a rejected `rm`); report written in staged chunks to
  `research/qa-deep-dive-2026-08-25/kimi-k3.md` (24,124 B, citations verified live).
  All five lanes complete.
- `2026-08-25T23:45Z` — synthesis complete:
  `research/qa-miss-analysis-2026-08-25.md` and
  `research/qa-improvement-plan-2026-08-25.md`. Key consensus: retrieval/routing is
  the primary loss on only ~2 of 55 misses; answer discipline (~15–19) and source
  truth (~12–22) dominate; the wrong bucket is mostly measurement artifact; judge
  identical-input flip rate is 9.6%. Round ready for review.
- `2026-08-26T00:20Z` — owner decisions recorded: dating volatile claims is a product
  requirement (disclose to agents); grading is source-agnostic arrival-at-truth with
  docs-faithful answers capped at partial where a filed upstream defect stands;
  judging escalates to multi-org panels only for unstable cases driven by a per-case
  stability memory; goldens never downgrade off one cheap contradiction — deep
  multi-source verification required. See `research/qa-improvement-plan-2026-08-25.md`.
- `2026-08-26T00:35Z` — three Herdr worktrees created from `e488c4f`:
  `../sr-wt-measure` (`lane/measure-harness-20260825`, workspace `wB`),
  `../sr-wt-product` (`lane/product-executor-20260825`, `wC`),
  `../sr-wt-corpus` (`lane/corpus-goldens-20260825`, `wD`). Prior analysis agents
  released and terminated; their reports remain archived under
  `research/qa-deep-dive-2026-08-25/`. Builders started on worktree root panes:
  build-measure (`gpt-5.6-sol` high), build-product (`gpt-5.6-sol` xhigh),
  build-corpus (`gpt-5.6-sol` high). Briefs in `/tmp/raven-qadeep/build-*.md`.
  Integration gate after review: typecheck, test, test:smoke (product lane), build,
  routing/lint/selftest, corpus compile.
- `2026-08-26T09:25Z` — all three builders complete and committed on their branches;
  reports in `/tmp/raven-qadeep/build-{measure,product,corpus}.md`.
  - `lane/measure-harness-20260825` @ `2260ec6`: R8 recorded-revision rejudge +
    golden-drift refusal; R9 ungradeable-answer skip; A6 trap-precedence rule;
    A8 coreAnswer/coverage reporting; A1 opt-in `--judge-panel` with majority/tie
    rules. Gates: typecheck 0 errors; 1,242 tests pass; build pass.
  - `lane/product-executor-20260825` @ `49a7b65`: B1 payload-shape proxy trap
    (prototype-level; hot path preserved); B2 exact-path provenance sidecar into
    SOURCE BASIS (1,600-char cap kept); B3 evidence-discipline instructions block,
    1,998/2,000 chars. Gates incl `test:smoke`: all pass.
  - `lane/corpus-goldens-20260825` @ `cb14f14`: six authoring-warning lint classes
    (+1,362 warnings on existing corpus, warning-severity only); answering-contract
    dating/exactness line; symmetric cautions added where the rule fires (2 cases);
    WisdomTree CRDT golden issuer/SAC repaired against two live sources with dated
    receipts (toml + Horizon agree); battery recompiled at 499 cases.
- `2026-08-26T09:30Z` — independent reviewers started: review-judge (Claude `fable`)
  on measure+corpus diffs; review-executor (`gpt-5.6-sol` high) on product diff with
  security lens. Findings to `/tmp/raven-qadeep/review-{judge,executor}.md`.
- `2026-08-26T12:15Z` — reviews returned CHANGES-REQUESTED on all three branches with
  verified blocking findings: M-B1 (legacy agent-error rows still regraded — probe
  showed judge call still firing on the real SSRF row), M-B2 (`--allow-golden-drift`
  unreachable under revision pinning), E-B1 (SOURCE BASIS marker reused on
  untruncated results corrupts truncation semantics), E-B2 (prototype replacement
  broke instanceof/null-proto), C-B1 (consistency register would reopen 7 clusters
  silently), C-B2 (`freshness-drift` root cause false; old IDs failed CRC16 — they
  were never valid strkeys). Plus advisories.
- `2026-08-26T14:30Z` — all three builders landed fix commits addressing every
  blocking finding and the actionable advisories: `033ccd9` (legacy-error skip with
  regression test on the real artifact row; `--cases-ref worktree` unpinned mode;
  abstention-on-error panels; narrowed trap regex; casesPath mapping),
  `a7656b7` (distinct `--- SOURCE METADATA ---` marker with escaping against result
  spoofing; Object.create bridge restoring prototype chain; own-descriptor-only
  scans; smoke helper scoping; instruction wording restored at 2,000-char budget),
  `ec235d2` (CRDT rootCause corrected to transcription error per golden-truth skill,
  TODO entry added, improvements refs kept; avoid-lint exempts answer-visible dating).
  Updated reports in `/tmp/raven-qadeep/build-*.md`; lint warnings settled at 0
  errors / 1,390 warnings.
- `2026-08-26T18:50Z` — integration complete in main checkout: three `--no-ff`
  merges plus integration commit `83b6ec8`. Orchestrator-owned obligations done:
  evidence-pack/analyze-composition taught to treat SOURCE METADATA as non-loss
  (141 consumer tests pass; fixture provenance PASS) and consistency-register
  re-stamped with 7 dated reopens whose reconciliation rides the planned same-100
  rerun. Full gate battery green: typecheck clean; 85 files / 1,265 tests; build ok;
  smoke 4 / 82; eval:selftest pass; routing GATE PASS vs 2026-08-25 baseline;
  secrets scan clean. No push performed. Worktrees retained at `../sr-wt-*` with
  lane branches for inspection.
