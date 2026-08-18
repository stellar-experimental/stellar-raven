---
name: audit-reviewability
description: "Audit and repair code, comments, documentation, tests, agent instructions, and pull-request changes for reviewability debt. Use when cleaning AI-generated code, removing AI slop, restoring codebase readability, reducing review burden, pruning transient narratives, finding stale or redundant comments, removing speculative compatibility or scope creep, preserving human edits, or reviewing a large generated change."
---

# Audit reviewability

Protect the human attention budget. Judge each artifact by truth, durable value, and review cost.
Judge the artifact without guessing whether a human or model wrote it.

Read [`references/audit-rubric.md`](references/audit-rubric.md) completely before classifying
candidates. For disputed rules or skill maintenance, read
[`research/reviewability-audit-2026-08-18.md`](../../../research/reviewability-audit-2026-08-18.md).

## Choose the mode and scope

Infer the mode from the request:

- **Audit mode:** Inspect and report. Keep the repository unchanged.
- **Repair mode:** Audit, edit, and verify. Use this mode when the user asks to clean, fix, prune,
  simplify, or repair.

Resolve the narrowest complete scope from the request:

1. Use the supplied fixed point for a change review.
2. Otherwise, use the supplied files or directories.
3. Otherwise, audit the repository when the request names the codebase.

State the selected mode, scope, and fixed point. Ask only when different choices would materially
change the result.

## Establish the baseline

1. Read the applicable repository instructions and the nearest directory instructions.
2. Inspect the worktree before editing. Record existing changes and preserve unrelated work.
3. Read the product scope, architecture, style guides, generated-file rules, and compatibility
   policy that govern the target.
4. Identify the repository's validation commands and current test baseline.
5. Re-read a file immediately before editing it. Assume another human or agent can change it
   between turns.

Complete this step when the audit has an explicit truth source, compatibility posture, dirty-tree
boundary, and verification plan.

## Build the candidate inventory

Inspect every in-scope surface that can consume reviewer attention:

- implementation code, names, types, branches, abstractions, and compatibility paths;
- inline comments, docblocks, TODOs, and references from code;
- READMEs, guides, plans, ADRs, changelogs, generated documents, and agent instructions;
- tests, fixtures, snapshots, and assertions;
- the change description and review replies when the user supplies them.

For a change review, inspect the complete diff and its surrounding code. Separate functional work,
tests, documentation, formatting, generated output, and unrelated edits. For a repository audit,
use repository search and history to identify clusters before reading each candidate in context.

Use mechanical signals only to find candidates. Phrase matches, comment length, line ratios, and
large diffs never prove a finding. Do not build an AI-style detector.

Complete this step when every in-scope file is either inspected or covered by an explicit,
evidence-based exclusion.

## Classify each candidate

Apply every rubric gate:

1. **Truth:** Does the artifact match current code, tests, configuration, and supported behavior?
2. **Durability:** Will a future reader need this after the current task and conversation disappear?
3. **Signal:** Does it explain a contract, invariant, constraint, non-obvious reason, or operational
   fact that another artifact cannot express better?
4. **Locality:** Does the fact live in one canonical place near its owner, with valid references?
5. **Proportion:** Does its value justify its reading and maintenance cost?
6. **Scope:** Does it serve the requested change instead of an unrelated improvement?
7. **Verification:** Does a test check behavior rather than mirror the implementation or memorialize
   text?
8. **Preservation:** Would changing it erase useful domain knowledge, public contracts, debugging
   work, or concurrent human edits?

Record a finding only when evidence establishes a concrete harm. Use these severities:

- **Critical:** The artifact can cause unsafe behavior, data loss, security failure, or a false
  public contract.
- **High:** The artifact hides correctness, makes the change impractical to review, preserves
  unsupported behavior, or overwrites human intent.
- **Medium:** The artifact adds misleading, redundant, transient, or disproportionate maintenance
  cost.
- **Low:** The artifact has a local clarity cost. Report low findings only when a repair is specific
  or a repeated pattern makes the cost material.

For each finding, provide a location, observed evidence, consequence, and smallest valid repair.
Keep authorship claims out of the finding.

## Repair in risk order

In repair mode, make the repository describe the present system as if it were written correctly
from the start. Preserve history in version control, a changelog, or an ADR only when future readers
need that history.

Apply repairs in this order:

1. Correct false contracts, stale comments, broken references, and unsupported claims.
2. Remove unrelated edits, dead paths, and speculative compatibility after proving they lack a
   requirement.
3. Simplify code, names, types, and control flow before adding explanatory prose.
4. Replace conversational or diff narratives with concise present-state intent.
5. Consolidate duplicated documentation into its canonical owner.
6. Replace tautological or implementation-mirroring tests with behavior-level coverage.
7. Tighten agent instructions with positive targets, explicit project constraints, and preservation
   rules.

Prefer deletion when an artifact carries no unique durable fact. Prefer a rewrite when the fact is
valuable but the current form is stale, duplicated, or transient. Preserve a comment when it carries
a verified invariant, public contract, safety constraint, domain reason, or surprising behavior.

Keep repairs reviewable. Avoid opportunistic refactors. Do not create compatibility layers,
migrations, or new documentation solely to explain removed or rejected work.

## Verify the result

1. Review the final diff line by line.
2. Confirm that each changed comment and document matches the resulting code.
3. Resolve each reference and ensure that one canonical owner remains.
4. Confirm that useful existing comments and unrelated human edits remain intact.
5. Run the narrowest relevant tests, then the repository's required validation commands.
6. Compare behavior before and after each simplification. Add or improve tests when evidence is weak.
7. Treat lower line counts as an observation, not a success condition.

The repair is complete when every finding is fixed or explicitly deferred, behavior remains correct,
and the final diff is smaller to understand than the problem it solves.

## Report the outcome

Lead with the verdict. Then report:

1. the audited scope and fixed point;
2. findings in severity order, including repaired findings;
3. repairs made and useful material deliberately preserved;
4. verification commands and results;
5. unresolved risks, exclusions, and deferred work.

In audit mode, provide repair guidance without editing. In repair mode, distinguish changed files
from pre-existing worktree changes.
