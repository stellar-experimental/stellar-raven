# Item 8.2 plan: audit the repository's documentation

Lead: Claude Opus 5.5, agentpc `t1yk`, 2026-11-18. Branch `np/8.2-docs-audit` from `origin/main`
`e0ad27d9` (item 8.1 merged). Bound by the orchestrator's `8.2-NOTE.md` and `7-COMMON.md`.

Owner instruction (2026-11-18, verbatim): "We should probably work with Fable and Sonnet to audit and
review all docs around this repo to ensure accuracy, cleanliness, organization, etc."

## Decision this changes

What the living docs say. After this item every living doc states current behavior on `main`, each
fact has one owning doc, and no living doc narrates history. No code change, except a stale code
comment that points at a doc or TODO trigger. No Worker bytes change, so no deploy.

## Stage 1: audit (read-only)

Living-doc inventory: `tmp/living.txt` in the worktree (81 files: tracked `*.md` minus `research/`,
`.agents/rounds/`, improvements finding files and case paths, plus the ADRs). Rules for every child:
[briefs/COMMON.md](briefs/COMMON.md).

| Set | Lane | Files |
|---|---|---|
| A | Sonnet 5.5, high | root docs, `docs/`, `.github/` templates, ADR links, the `mcp-tool-metadata.ts:29` comment |
| B | Sonnet 5.5, high | `.agents/README.md`, `model-roster.md`, all skills and references |
| C | Sonnet 5.5, high | `eval/` READMEs, `EVALS.md`, `eval/qa/` docs |
| D | Sonnet 5.5, high | `scripts/`, `improvements/`, `usage/`, `inventory/`, `test/`, `src/` READMEs, `ecosystem-skills/`, `plugins/openai/`, `assets/` |
| O | Fable 5.2, high | the whole set for organization, ownership, duplication, AGENTS.md rules, skills overlap, `ideas/` dispositions |

Lead's own mechanical checks before the children start: relative links and anchors in all 81 files
(`tmp/check-links.mjs`): 0 problems. Mention count per doc: only
`research/decisions/0004-correlation-id-continuity.md` is cited nowhere; ADR 0006 is absent.

## Stage 2: change list

Stage 1 is done: [audit/A.md](audit/A.md) (30 findings), [B.md](audit/B.md) (18), [C.md](audit/C.md)
(22), [D.md](audit/D.md) (24), [O.md](audit/O.md) (53). The proposed text for each change is in the
finding; this list says which findings land, how, and in which PR. "Adopt" means apply the finding's
proposed fix after re-reading the code it cites; an executor that finds the evidence wrong records
that in EXEC and skips the change.

### Correction to the frozen list in COMMON.md

COMMON.md froze too much. The dated runs read `AGENTS.md`, `golden-truth`, `improvements-pipeline`,
`eval/qa/README.md` and the TODO anchors as instructions and paths. So, until run 2.2c merges:

- **No path moves or renames** of those files, and the TODO anchors, the `golden-truth` section
  numbering, and the `Held-out split` heading and **Maintenance exception** paragraph stay as they are.
- **No rule moves or cuts** in `AGENTS.md`, `golden-truth` or `improvements-pipeline`: a dated lead
  follows them.
- **Accuracy fixes are allowed** in those files, sentence by sentence. Adding items to
  `.agents/TODO.md` is allowed (the 8.2 note asks for it); its frozen anchors stay byte-identical.

### Global decisions

1. **AGENTS.md.** Only accuracy and map fixes land now: A-01/O-03 (the `CLAUDE.md` sentence becomes
   "Claude Code reads this file natively. Do not add a `CLAUDE.md`."), A-02/O-23 (the `git grep`
   pointer names "Searching without reading case text"), and A-24/O-13 (map rows for `eval/EVALS.md`,
   `test/README.md`, `scripts/README.md`, `research/decisions/README.md`, `improvements/README.md`,
   `docs/stellar-docs.md`). Every rule change (O-10 posting authority, O-27 role terms, O-30, O-32 to
   O-38, O-40, C-17's Wrangler exception, "File and response size come second") is **proposed, not
   applied**: the report lists them for the orchestrator, and a TODO item applies the approved ones
   after run 2.2c merges.
2. **Case text in `ideas/` (O-01).** Remove it now. Ids and the orchestrator's question:
   [EXPOSURE.md](EXPOSURE.md). The executor reads only the named line ranges to rewrite them and
   quotes nothing from them in any record, commit or message.
3. **Code comments.** Fix only comments outside `src/` that point at a doc: 
   `test/helpers/mcp-tool-metadata.ts:28-29` (A's text), `scripts/build-catalog.mjs:619` and
   `eval/plan/build-op-classes.mjs:24` (`CLAUDE.md` → `AGENTS.md` "Hard rules"),
   `scripts/refresh-inventory.mjs:7` (Node 20+ → Node 24). Comments under `src/` (`src/mcp/tools.ts`
   179-181, `src/auth/gate.ts` and `redirects.ts` DESIGN.md pointers) change Worker bytes: one TODO
   item, no edit.
4. **Code defects become TODO items:** D-04 (`research/audits/2026-11-06-playground-final-resolution/
   blind-packets.test.mjs` runs in `npm test`), C-04's untagged agentic workflow, C-03's agent runner,
   O-46's `extractLossDetail` coupling (`src/policy/source-basis.ts:434`), the `src/` comments above.
5. **Records stay untouched:** D-09 and D-10 (PIN-REVIEW entries), C-02 (`eval/gates.json` note: a
   gate file under fingerprint tests), C-18/C-19 (instrument brief text), `research/prior-art.md:389`
   (ADR-0006 citation; the new ADR index explains the gap). Declined, with that reason.
6. **No new ADR, no new living doc for stellar.org.** O-20: reword `ARCHITECTURE.md:406-408` so the
   architecture owns the contract and the research file is the dated measurement. O-11: keep the
   links to round records (retention keeps a cited record by design) but relabel them by topic, not
   round item. An ADR for the stellar.org admission or the OAuth design is an owner call (report).
7. **Declined as low value:** A-22, A-23, D-18, D-23, O-21, O-27 "golden/gospel" and "lane/instrument"
   rows, O-12 split of `eval/qa/README.md` (deferred to a TODO item for after 2.2c; only its accuracy
   rows land now).

### PR 1: root, `docs/`, ADR index (executor E1, this worktree, branch `np/8.2-docs-audit`)

Files: `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `ARCHITECTURE.md`, `PLAN.md`, `SECURITY.md`,
`THIRD-PARTY-NOTICES.md`, `docs/operations.md`, `docs/stellar-docs.md` (if a finding needs it), new
`research/decisions/README.md`, the four code comments in decision 3, the round `DECISIONS.md`
section "Follow-up answers (2026-11-18)" (add the owner's 8.2 instruction, verbatim).

- Adopt: A-01, A-02, A-03, A-04 (with O-04: cite `SEARCH_DEFAULT_LIMIT` and link
  `src/catalog/README.md` instead of restating catalog numbers), A-05, A-06, A-07, A-08, A-09
  (with O-27 "alias host"), A-10, A-12 (cite AGENTS.md sections), A-14, A-15, A-16 (state current
  behavior without "migration" framing; relabel the link "OAuth per-origin design record"), A-17
  (O-25: delete the sentence), A-19, A-20, A-24, A-25, A-26, A-27 (rename the heading only if the
  link check stays clean), O-08 (ADR index: number, title, status, the living doc that applies it,
  and one line for 0006: withdrawn, deleted in #195; links ADR-0004 from ARCHITECTURE section 9,
  ADR-0011 beside ADR-0001 in `PLAN.md`, ADR-0009 in ARCHITECTURE scoring), O-14 (drop PLAN
  "Repository layout"; move its three unique rows to ARCHITECTURE's table),
  O-20, O-25 rows for ARCHITECTURE, O-27 rows "mirror/pin" and "LumenLoop" (`THIRD-PARTY-NOTICES.md:97`),
  `ARCHITECTURE.md:416` "instruction-map checks" (O section 7: verify; delete if nothing implements it).
- Owner question, no edit: A-11 (`/terms` 30 days vs operations 7 days; already in the TODO OpenAI item).
- A-18 counsel item: TODO item in PR 3; reword `THIRD-PARTY-NOTICES.md:30-31` to a fact that links it.

### PR 2: `.agents/` (executor E2, new worktree `np-8.2-agents`, branch `np/8.2-docs-agents`)

Files: `.agents/README.md`, `.agents/rounds/README.md`, `.agents/model-roster.md`, every skill
except `golden-truth` (no change).

- Adopt: B-01, B-02 (`SKILL-BEHAVIOR`), B-03, B-04 (`SKILL-BEHAVIOR`; with O-18), B-05
  (`SKILL-BEHAVIOR`), B-06 (with O-05; roster owns ids), B-07 (re-run the roster's "How to
  re-verify" with the CLIs on agentpc, update stamp and versions; `gpt-6.2-*` mapping is an owner
  question), B-08, B-09, B-10 and O-22 (describe the round folder form in `rounds/README.md`), B-11,
  B-13 (accuracy in a frozen skill), B-14, B-15, B-16, B-17, B-18, O-15 (`run-evals` "Hard rules":
  link `eval/EVALS.md` for the four instrument rules), O-16/O-45 (`SKILL-BEHAVIOR`: skills use the CI
  lint form `npm run eval:qa:lint -- --stale --enforce-floors`), O-17 (`run-evals` links
  `docs/stellar-docs.md`), O-18 (skill re-pin block links `ecosystem-skills/README.md`), O-41, O-42,
  O-43, O-44, and the `improvements-pipeline` "Raven scoping" sentence (O-06 contradiction: an own-repo
  scoping gap goes to `.agents/TODO.md`, not a finding; `SKILL-BEHAVIOR`).
- Defer to after 2.2c (TODO item): B-12 and the rest of O-06's skill side, O-10, the
  `golden-truth` lifecycle overlap.

### PR 3: folder guides, `ideas/`, TODO (executor E3, new worktree `np-8.2-guides`, branch `np/8.2-docs-guides`)

Files: `eval/**/*.md` (not case files), `scripts/README.md`, `test/README.md`, `src/catalog/README.md`,
`ecosystem-skills/README.md`, `ecosystem-skills/PIN-REVIEW.md` (header only), `plugins/openai/**/*.md`,
`assets/brand/*.md`, `usage/README.md`, `inventory/README.md`, `improvements/README.md`, `ideas/**`,
new `research/audits/2026-08-07-codegen-partner-report.md`, `.agents/TODO.md` (additions only).

- Eval docs. Adopt: C-01, C-03, C-04 (doc text; the tagging gap is a TODO item), C-05, C-06, C-07,
  C-08 (with O-05), C-09 (routing rows only), C-10, C-11, C-12, C-13 (one pointer line at the end of
  "Held-out split"; the heading and the Maintenance exception stay byte-identical), C-14, C-15, C-16,
  C-17 (playground README line only), C-20, C-21/O-24, C-22, O-25 rows for `eval/plan/README.md`.
  Instrument: a one-line note in `eval/qa/README.md` that the lead splits claim-read packets into
  chunk files (C-19); the brief itself is unchanged.
- Folder guides. Adopt: D-01, D-02, D-03, D-04 (doc text names the extra file), D-05 (map every
  unmapped test file into the table, grouping by area), D-06, D-07, D-08, D-11, D-12 to D-17 with
  O-09 (lift the standing procedure out of `RESUBMISSION.md` into `plugins/openai/README.md`;
  `RESUBMISSION.md` keeps the dated account; no subfolder move), D-19, D-20, D-21, D-22, D-24, D's
  "Other observations" (improvements filing channels → `intake.json` pointer, usage retention link,
  inventory env, `usage/wrangler.jsonc`), O-06 README half (charter keeps principle, collections,
  format, lifecycle, handoff; procedure links the skill), O-18 (PIN-REVIEW "Procedure" links the
  README; `inventory/README.md` links operations for `REFRESH_ISSUE_ASSIGNEE`), O-19
  (`test/README.md` links `../README.md#run-locally`), O-27 "catalog manifest / pin manifest" row,
  O section 7 counts in `inventory/README.md` and `ecosystem-skills/README.md` (point at the snapshot
  instead of restating).
- `ideas/`, one disposition each (O section 6):
  - `stellar-org-source-lane.md`: **delete, superseded** by PR #447 (`986ffbaa`); fix the two
    citations (`partner-doc-live-sources.md:185-186`, `source-delivery-ranked-references.md:504-506`).
  - `architecture-explorations.md`: **fold, then delete** (O-46): item 2 into the TODO p9
    claim-support item, the `extractLossDetail` leftover as a new TODO item, the rest recorded as
    covered (ADR-0001/0011, AGENTS.md, `docs/stellar-docs.md`) or rejected (no query text in logs).
  - `codegen-correctness-substrate.md`: **sanitize, move to** `research/audits/2026-08-07-codegen-partner-report.md`
    as a dated record (O-47): remove the case text and the partner-side detail first; fold the
    three residues into TODO (skill malformed-input gap as a candidate finding; the golden gaps by
    case id only, for a golden-maintenance lane; the missing long-horizon codegen instrument as a
    deferred program).
  - `observability-r2-retention.md`: **keep, cut** to the proposal and triggers (O-48).
  - `partner-doc-live-sources.md`: **keep**, trim the PR chronicle, add a TODO "Deferred programs"
    trigger for the overdue review (O-49).
  - `per-user-mcp-observability.md`: **keep, rename** to `user-controlled-personalization.md` (O-50).
  - `playground-chatgpt-subscription-login.md`: **keep**, two fixes.
  - `retrieval-demand-report.md`: **keep**.
  - `shareable-durable-playground-sessions.md`: **keep**, delete the shipped sections (O-51).
  - `skill-discovery-without-bundling.md`: **fold into a TODO item, then delete** (O-52).
  - `source-delivery-ranked-references.md`: **keep**, sanitize section 1 to finding ids (`sd-044`,
    `sd-004`, `sd-043`), keep section numbers, add "Code anchors are as of 2026-08-27."
  - `ideas/README.md`: **rewrite as an index** (O-53).
  Every deleted file is tracked in git, so history holds it; the disposition table goes in EXEC.
- `.agents/TODO.md` additions (new items; no frozen anchor changes): the folds above; A-18 counsel
  review; D-04 test in a record folder; C-03/C-04 confirmation-only tagging in the agent and agentic
  runners; the `src/` comment fixes; the deferred AGENTS.md rule changes and skill moves (after 2.2c,
  after orchestrator approval); O-12 `eval/qa/README.md` split (after 2.2c); the O-07 dated reviews.

## Gates

- Per PR: `npm run typecheck`, `npm test`, `npm run build`, `npm run secrets:scan -- --tree`, the link
  check, and the CONTRIBUTING "Checks" command for each area touched (`npm run improvements:lint` if
  `improvements/` changes; `node ecosystem-skills/build-index.mjs` sync if `ecosystem-skills/` changes).
- No model-calling eval, no QA lint, no deploy.

## Execution

Three Sonnet 5.5 executors run in parallel on disjoint files, one per PR, each on its own branch
from `origin/main`, each writing `EXEC-<n>.md` here. The lead adds the ledger row and the records.
`SKILL-BEHAVIOR` changes are listed in the PR 2 report for the orchestrator to approve before merge.
PRs merge in order 1, 2, 3; a later one rebases if a shared file conflicts (only the item records).

## Stop rule

Stage 1 ends when all five findings files exist. Findings without evidence are dropped. Once a PR's
gates pass and its Fable plan review findings are reconciled, it ships; no extra review rounds.

## Risks

- Frozen paths and anchors read by the dated runs until run 2.2c merges (COMMON.md lists them).
  Changes there are deferred to a TODO item, not made.
- Rewriting records by mistake: records get link fixes only.
- Losing work in `ideas/`: every deletion names where the content lives or why it is dead; any file
  not in git history is archived first (all `ideas/` files are tracked, so git history holds them).
- Instrument docs (`eval/qa/claim-read-brief.md`, judge material): flagged, not edited.

## Needs from the orchestrator

Approval of the AGENTS.md rule changes and skill behavior changes listed in each report.
