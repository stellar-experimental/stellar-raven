# Recovered Playground experiment

`playground-sweep.patch` preserves the exact five local commits from
`fec1c79f3ae4e4210e7d988c3aff40cda9928482` to
`0d90bbb7be03fb3be1bc0a10119ec1953f5c093d`, produced by `git format-patch --stdout`.
It is historical evidence, not a patch to apply to current main.

The completed transport/SDK changes and repaired gauntlet were integrated during cleanup.
The original Codex judge adapter remains unapplied: review found unenforced subscription billing
assumptions, incomplete CLI/environment comparison identity, and inadequate tool/event isolation.
The original gauntlet also contains the subsequently repaired missing-cost continuation defect.
The patch retains those original implementations and tests so deleting the old branch loses no
experimental work. Do not use its old tests as acceptance criteria for a future adapter.

The dated sweep ledger and summaries are retained under their original paths. Stage 3 did not
produce a final model-selection decision. Ignored raw-run files and the referenced selection
are not supplied by this patch; their availability must be established before any resumed study.
Current code keeps the shipped primary/fallback and the Claude judge contract.

See `.agents/rounds/2026-11-06-main-only-cleanup.md` and its independent review for disposition,
validation, and the exact remaining gates. Cleanup does not authorize paid collection.
