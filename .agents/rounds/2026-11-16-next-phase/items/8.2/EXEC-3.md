# Item 8.2 EXEC-3: folder guides, `ideas/`, TODO additions (PR 3)

Executor: Claude Sonnet 5.5, worktree `np-8.2-guides`, branch `np/8.2-docs-guides` from `origin/main`
`e0ad27d9`. Commits (not pushed):

| Commit | Topic |
|---|---|
| `c1551e36` | `eval/**` guides |
| `a96356aa` | folder guides: `scripts/`, `test/`, `src/catalog/`, `ecosystem-skills/`, `inventory/`, `usage/`, `improvements/`, `plugins/openai/`, `assets/brand/` |
| `96426ad5` | `ideas/` |
| `082bc8dd` | `.agents/TODO.md` (additions only) |
| `9b18cab3` | EXEC-3 |

## Findings

### Eval docs

| Id | Result | How |
|---|---|---|
| C-01 | applied | Deleted the Scout version sentence from `eval/README.md`. |
| C-02 | not mine | `gates.json` is outside the PR 3 list; PLAN declines it. |
| C-03 | applied | `eval/discovery/README.md`: the one-shot and replay runners tag; the agent runner and classifier do not. |
| C-04 | applied | `eval/agentic/README.md` states the `agentic` set in `routing-qa-overlap.json` and "report as counts only". Added one sentence to `eval/README.md` ("Confirmation-only rows") naming the two paths that do not tag. TODO item added for the tagging gap. |
| C-05 | applied | Regex now names `stellarOrg`. |
| C-06 | applied | Deleted the Vectorize lines; the Discovery row's Status cell links ADR-0009. |
| C-07 | applied | Deleted both dated paragraphs; one line points at `research/audits/`. |
| C-08 (with O-05) | applied | `EVALS.md` scoping paragraph now links the `run-evals` skill and the roster heading "Models for evals and tests". `playground/README.md` keeps "API-billed, no CLI can stand in" and links the skill for scoping and spend rules. |
| C-09 | applied | Routing rows only: counts replaced by set names. Non-routing counts stay. |
| C-10 | applied (changed) | Replaced the dated counts with one link sentence. Kept the "do not establish recall or production prevalence" caveat, merged into one sentence with the first-line-cue sentence dropped; the `155/500` and "sample covers" lines went with the counts. |
| C-11 | applied | Added the closed-PR #264 fetch note. |
| C-12 | applied (changed) | The two-arm cap equals the sum of the two arms' cumulative caps (`paired-collection-supervisor.mjs:690-692`), so the text says that, not "sum of the arm caps". `$80/$120/$240` stay as "the reviewed run used". |
| C-13 | applied | One pointer line before `**Maintenance exception.**`. |
| C-14, C-15 | applied | Both sentences deleted. |
| C-16 | applied | Text as proposed. |
| C-17 | applied | README line: "It starts its own Wrangler per model on its own port." No "exception". The rule change is in the TODO deferred item. |
| C-18 | not applied | Instrument text; flagged only. |
| C-19 | applied | A row in the `eval/qa/README.md` directory map names `claim-read-packets.mjs`, the brief, and the chunk-file split. The brief is unchanged. |
| C-20 | applied | "The Codex CLI documents ...". |
| C-21 / O-24 | applied | `downstream` carries the review wording; the "Miss Classification" section is deleted. |
| C-22 | applied | `match_` dropped. |
| O-25 rows, `eval/plan/README.md` | applied | Title, intro (pinned skills, house voice), "Limitations". |
| O-27 rows | applied | "Playground lane", "terminal" for "pane" in `eval/playground/README.md`. |

### Folder guides

| Id | Result | How |
|---|---|---|
| D-01, D-02, D-03 | applied | `scripts/README.md`: `tool-cases.json`; two rows (`update.sh`, `refresh-inventory.mjs`); `build-family-text.mjs` declaration. The `build-index.mjs` row's guard reads "yes (this regeneration only)". |
| D-04 | applied | `test/README.md` scope line names the extra audit packet test. TODO item added for the code defect. |
| D-05 (R-13) | applied | Four new group rows (OAuth origins and hosts; corroboration and claim-read; case-search guards; adapters and source status) plus stragglers added to the nearest rows. A script check shows all 178 `test/*.test.*` files match a row. The table says it names groups. |
| D-06 | applied | Runner and outbound-wall sentence. |
| D-07, D-08 | applied | `ecosystem-skills/README.md`. |
| D-09, D-10 | declined | PIN-REVIEW entries are attestations. |
| D-11 (with O-18, O-25) | applied | PIN-REVIEW header only: present-tense rule; "Procedure" links the README "Re-pin" and keeps the digest and diff commands. Entries untouched. |
| D-12 to D-16 (with O-09, R-09) | applied (changed) | `plugins/openai/README.md`: status paragraph points at the queue and RESUBMISSION; "Kind" column; the account-preparation, portal-update and sign-in text copied into "Reviewer access procedure" ("last run 2026-10-23; check the portal before you act"); "recorded check" label; D-16 reworded; commit-list bullet deleted (O-25 row). `RESUBMISSION.md` and `EXCEPTION-REQUEST.md` are byte-identical. |
| D-17, D-18, D-23 | declined | R-09, PLAN decision 7. |
| D-19, D-20 | applied | `domain-verification/README.md`. |
| D-21, D-22 | applied | D-22: deleted the sentence (the evidence file does record `scfAsOf`). |
| D-24 | applied | `src/catalog/README.md` (the only `src/` file in the diff). |
| Other observations | applied | `intake.json` pointer, usage retention link, inventory env, `usage/wrangler.jsonc`. |
| O-06 README half (R-06) | applied | Deleted only what the skill holds: the drain list (one sentence plus a skill pointer), the file-command detail, the "Follow up" list, the admin-key paragraph, `README:100-118` (one-line `intake.json` pointer). Kept the marker name, the `gh search` command, the handoff form and the own-repo-scoping rule. Title and closing section no longer say "from eval runs". Skill not edited. |
| O-18 | applied | PIN-REVIEW as above; `inventory/README.md` links operations for the assignee default. |
| O-19 | applied | `test/README.md` links `../README.md#run-locally`. |
| O-27 | applied | `ecosystem-skills/README.md` "catalog manifest (`catalog/manifest.json`)". |
| O section 7 counts | applied | `inventory/README.md` and `ecosystem-skills/README.md` no longer restate tool, skill, operation or source counts. |

### Not applied from PR 3's list

- O-09 problem 2 (cut "Open review requirements" to one link): kept the section. The queue item does
  not hold the tool-exposure and annotation requirements, so a cut would lose them. D-15 and D-16
  fixes landed in it.
- A-18: the `THIRD-PARTY-NOTICES.md` reword is PR 1. This PR adds the owner decision 7 in the TODO.

## `ideas/` dispositions

"Last commit" is the last commit that held the earlier version (`git log -1 -- <path>` before the change).

| File | Disposition | Where the content went | Last commit | Commit |
|---|---|---|---|---|
| `stellar-org-source-lane.md` | Deleted (shipped in #447). Not opened. | Shipped as `specs/stellar-org.json`; lessons in `run-evals/references/source-addition.md`; live state in the TODO "Prove the stellar.org source". Its citation in `partner-doc-live-sources.md` now points at `source-addition.md`; in `source-delivery-ranked-references.md` the line is removed. | `42496f22` | `96426ad5` |
| `architecture-explorations.md` | Folded, deleted | See the item table below. | `42496f22` | `96426ad5`, `082bc8dd` |
| `codegen-correctness-substrate.md` | Not touched (PR 4). Never opened. | PR 4 moves it; residues in the TODO ("Review the codegen-adjacent goldens by case id", "Probe the malformed-input gap ...", "Measure long-horizon codegen ..."). `ideas/README.md` links the dated record. | n/a | n/a |
| `observability-r2-retention.md` | Kept, cut from 299 to 78 lines | Proposal, query fallback, triggers and a two-stage build. Dropped: the 2026-07-07 observed state, doc drift, Stage 3 and the gate-baseline prefix (`baselineResults` no longer exists in `eval/gates.json`), Solo lines. Links ADR-0004. | `378994a3` | `96426ad5` |
| `partner-doc-live-sources.md` | Kept; chronicle trimmed to three bullets | Status says the 2026-10-31 review is overdue; TODO "Run the overdue partner-documentation review". | `3b2808bc` | `96426ad5`, `082bc8dd` |
| `per-user-mcp-observability.md` | Renamed `user-controlled-personalization.md` | Link fixed in `retrieval-demand-report.md` and the index. | `378994a3` | `96426ad5` |
| `playground-chatgpt-subscription-login.md` | Kept | "What changed" folded into "Decision" as "Support" and "Open: hosted multi-tenant credential custody"; "GPT-5.4 path" now "shipped Playground model"; the date of the external facts is stated. | `378994a3` | `96426ad5` |
| `retrieval-demand-report.md` | Kept | One sentence absorbs architecture item 3. | `76c7f02b` | `96426ad5` |
| `shareable-durable-playground-sessions.md` | Kept; shipped sections deleted | "Issue #40 status" and "Input-limit decision" removed (owner: `ARCHITECTURE.md` budget table); a pointer to the auxiliary-Workers TODO item beside the D1 choice. | `378994a3` | `96426ad5` |
| `skill-discovery-without-bundling.md` | Kept (R-05) | Three dead references fixed (`eval/README.md` twice, the skill heading), two Solo references dropped; the "single home" paragraph now points at the TODO trigger. TODO "Read the `skill_read` shape distribution" fires the read and says Workers Logs hold at most seven days. The decision rules are not paraphrased. | `378994a3` | `96426ad5`, `082bc8dd` |
| `source-delivery-ranked-references.md` | Kept; only the status line and lines 504-506 changed | "Code anchors are as of 2026-08-27." added; the `stellar-org-source-lane` citation removed. Lines 28-62 not opened. | `4602ca00` | `96426ad5` |
| `README.md` | Rewritten as an index | State, trigger and queue item per idea; the folder rule; a link to the research record. | `42496f22` | `96426ad5` |

### `architecture-explorations.md` items (R-17)

| Item | Disposition |
|---|---|
| 1 Code-shaped search re-test | Covered by ADR-0001 and ADR-0011 "Reopening". |
| 2 Pre-cap evidence sidecar | Appended as one bullet to the TODO item "Close the remaining claim-support gaps of judge pack p9". |
| 3 Telemetry-mined live cases | Rejected: logs hold no query text (`ARCHITECTURE.md`) and the discovery guide forbids raw user traffic. One sentence in `retrieval-demand-report.md` keeps the held alternative. |
| 4 Upstream approval runtime | Rejected as a pointer: it names `@cloudflare/codemode` v0.3/0.4 behavior nobody re-verified at 0.5.6. `AGENTS.md` "Hard rules" and "Mirror Cloudflare's codemode" already make reading upstream the first step for any paid or side-effecting operation. |
| 5 Docs recency, first half | Covered by `docs/stellar-docs.md` (a recency boost needs a read-only A/B win). |
| 5 Docs recency, second half (expose modification dates) | Rejected: `rg` finds no modification-date field in the Stellar Docs adapter, spec or inventory, so there is nothing to expose. Reopen if an upstream response carries one. |
| Leftover: judge-regression replay gate | Closed decision; dropped. |
| Leftover: `extractLossDetail` coupling | New TODO item "Decouple `extractLossDetail` from the truncation footer wording". |

## TODO additions (`.agents/TODO.md`, commit `082bc8dd`, 181 insertions, 0 deletions)

p9 bullet; "Review the codegen-adjacent goldens by case id" (ids and fields only); "Audit the two corpus guides no lane has read" (R-12); "Probe the malformed-input gap in the pinned smart-contracts skill"; "Decouple `extractLossDetail` ..."; "Tag confirmation-only rows ..."; "Move the playground blind-packets test out of a record folder"; new section "Documentation follow-ups" with "Apply the item 8.2 deferred documentation changes after run 2.2c merges" (RECONCILE "Approval list" point 3, waits for the orchestrator) and "Fix the document pointers in `src/` comments"; "Run the overdue partner-documentation review"; "Read the `skill_read` shape distribution"; "Measure long-horizon codegen with Raven installed"; owner decision 7 (counsel review, A-18).

## Gates (run in `np-8.2-guides`)

| Gate | Result |
|---|---|
| `npm run typegen` | ran once, ok |
| `npm run typecheck` | exit 0, no errors |
| `npm test` | 174 files passed, 5 skipped; 4190 tests passed, 3 expected fail, 8 skipped |
| `npm run build` | wrangler dry run ok |
| `npm run secrets:scan -- --tree` | clean; the pre-commit scan was clean on all four commits |
| `npm run improvements:lint` | ok (93 findings) |
| `node ecosystem-skills/build-index.mjs` | `INDEX.md written: 21 categorized`; `git status` shows no diff |
| Link check (command in the brief) | 5 problems, all expected: four links to `research/audits/2026-08-07-codegen-partner-report.md` (PR 4 adds it; in `ideas/README.md` and three in `.agents/TODO.md`) and one link to `rounds/2026-11-16-next-phase/items/8.2/RECONCILE.md` (PR 1 carries it). Nothing else. |
| 8.1 frozen anchors | all eight anchor strings present once, byte-identical; `git diff` of `.agents/TODO.md` has no deleted line |
| `eval/qa/README.md` | the `### Held-out split` heading and the Maintenance exception block are unchanged; the diff has six hunks, none inside them (one insertion before the exception) |
| `git diff --stat origin/main -- src public wrangler.jsonc catalog specs` | `src/catalog/README.md` only |

## Deviations and notes

- **Incidental view of `codegen-correctness-substrate.md`.** A Solo-reference search over `ideas/`
  (`rg -n -i solo ideas`) printed four lines from that file: lines 7, 33, 178 and 221. Each line
  showed only a "Solo scratchpad 784" reference; no case text appeared. Lines 178 and 221 sit in the
  range EXPOSURE.md lists, so the orchestrator should count this terminal (E3) as having seen those
  two lines' text, which holds no case content. I did not open the file otherwise.
- `stellar-org-source-lane.md` was deleted without opening it, so line 34 is not quoted anywhere.
- The `ideas/README.md` link to the codegen record and the TODO's three links to it fail the link
  check until PR 4 merges. Order the merges 4 before 3, or accept the red check.
- The TODO "Apply the item 8.2 deferred documentation changes" item links `RECONCILE.md` in this
  folder, which PR 1 adds. Merge order 1 before 3.
- `eval/EVALS.md` says the `run-evals` skill owns the smallest run, stop rule and cost estimate; the
  skill's section 1 ("Decide before you spend") holds that today. PR 2 changes the skill's model
  table to a roster pointer; the roster heading the link names keeps its text.
- No model call, no QA lint, no `wrangler dev`, no deploy, no push.
