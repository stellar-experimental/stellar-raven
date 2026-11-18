# Item 8.2 organization audit and ideas/ dispositions (set O)

Read `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/briefs/COMMON.md` first; its rules bind you. You are a Claude Fable 5.2 reviewer,
read-only. Write your findings to `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/audit/O.md`, then report. Four Claude Sonnet lanes check
facts against code in parallel (sets A to D); you judge organization, ownership, duplication,
clarity and value. Do not spend effort re-verifying commands or counts; note any you happen to see.

## Read

The full living-document list is `/home/tyler/code/raven-wt/np-8.2/tmp/living.txt` (81 files, from
`git ls-files` minus records and case paths; it includes `.agents/TODO.md`, which item 8.1 just
audited: read it only to see what is tracked there, and to decide where an idea folds in). Read every
living doc other than TODO.md. ADRs under `research/decisions/` are records: judge only whether living
docs point at them well. Skim `research/` and `.agents/rounds/` folder layout (not their content)
to judge whether living docs link records rather than restate them.

## Judge

1. **Map.** Is the AGENTS.md source-of-truth map true and complete? Does each fact have one owning
   document that others link? List every fact or procedure that two or more living docs own (name
   each place and which should own it). Pay attention to: setup and run-locally steps (README,
   CONTRIBUTING, docs/operations.md); the eval procedure (run-evals skill, eval/README.md,
   eval/EVALS.md, eval/qa/README.md); the search rule and case-path layout (AGENTS.md, eval/qa/README.md,
   COMMON-style briefs); the improvements procedure (improvements-pipeline skill, improvements/README.md);
   drift (live-drift-resolution skill, docs/operations.md, inventory/README.md); model IDs (roster vs
   elsewhere).
2. **Placement and navigation.** Headings and file placement a reader would look for; files that
   belong elsewhere; files nothing links to (`research/decisions/0004-correlation-id-continuity.md`
   is cited by no file; `0006` is missing from the ADR numbering; there is no ADR index). Propose an
   index or link only where a reader needs it.
3. **Cleanliness.** History narration in living docs; dated status that belongs in a record; stale
   TODO-like text outside TODO.md; inconsistent terms (list each term pair and the preferred term).
   Is `plugins/openai/` a living guide, a record set, or both, and should anything move?
4. **AGENTS.md itself.** Its rule is "Add a rule here only after recurring friction." For each rule,
   say keep, cut, move (to a skill or folder guide), or reword, with the reason. Label these
   `AGENTS-RULE`. Note: `CLAUDE.md` no longer exists on `main` (commit 88659e30 dropped it), yet
   AGENTS.md says `CLAUDE.md` imports it.
5. **Skills.** Organization and overlap between the eight skills under `.agents/skills/`; any skill
   that should merge, split or retire. Label behavior changes `SKILL-BEHAVIOR`.
6. **ideas/ (12 files, read each in full).** For each file decide one disposition, with the evidence:
   - keep (a live, unbuilt idea worth keeping; say what would make it actionable);
   - fold into a TODO item (name the item) or an ADR;
   - delete as done (name what shipped it: file, PR or commit), rejected (where the decision is
     recorded) or superseded (by what).
   Also judge `ideas/README.md`. Check claims of "done" or "shipped" against the code.

Rank findings by reader impact. Be concrete: each proposal names the file, the section and the change.
