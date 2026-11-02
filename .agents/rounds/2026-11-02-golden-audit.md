# 2026-11-02 — full golden audit and Varial rename

## Scope

The owner asked for the Varial rename in the goldens and for a deep audit of every battery case,
with research across all source classes. This round covers all 501 active battery cases. It also
covers four open `.agents/TODO.md` golden items:

- "Add the Varial rename to the goldens that name Freighter" (18 cases).
- "Qualify the Confidential Tokens privacy claim in three goldens".
- "Resolve the SCF RFP roster conflict in two goldens before 2026-11-12".
- "Re-verify the next near-due goldens before the stale gate fails CI".

## Method

The `golden-truth` skill sets the evidence bar. One Workflow run partitions the battery into 49
batches. Four batches are topic lanes (Varial retail, Varial developer, Confidential Tokens, SCF
round and RFPs). The other 45 are family slices. Each batch passes three agents in a pipeline:

1. A proposer verifies every judge-facing claim against two or more independent source classes and
   writes a corroboration matrix and a proposal file. It edits no repository file.
2. An independent verifier reads only the proposals, not the proposer's evidence, and re-derives
   each changed fact from live sources.
3. An applier edits the batch's case files. It applies only changes that the verifier accepted, and
   it escalates the rest.

A final consistency pass checks the whole diff for cross-case contradictions and rubric hazards.

Source classes: official docs (A), GitHub source (B), live services through Raven and direct
Lumenloop and Stellar Light reads (C), general web through Parallel and Perplexity (D), the Stellar
Docs index (E), and free live execution (F). Paid Lumenloop research stays off. No paid eval
command runs in this round.

Matrices, proposals, and verifier files live outside the repository under
`/private/tmp/claude-501/golden-audit/`. Each changed case carries its own evidence in
`truth.verified`, `truth.sources`, and `truth.corroboration`.

## Results

Pending.
