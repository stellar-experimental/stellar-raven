# Retrieval audit closeout — 2026-08-18

This note preserves the remaining repository-level decisions from the 2026-08-18 retrieval audit.
It does not replace the verified findings, tests, golden provenance, or evaluation records.

## Completed work

- The two stale Circle EURC references now use
  `https://developers.circle.com/stablecoins/eurc-contract-addresses`.
- The owned QA battery stablecoin goldens no longer make an absolute algorithmic-absence claim.
- The same goldens now use a durable filtered-count rule instead of a timeless service observation.
- Shared retrieval repairs preserve result scope, dates, methods, source identity, and empty-result meaning.
- `sls-067` records the verified Scout RFP contract and round-state defect.

## Deferred work

### Run a sibling-golden consistency pass

Review the related open-RFP and SCF round cases through the `golden-truth` workflow.
The audit found different requirements for `syntheticRounds` across similar questions.
Do not change either golden from evaluation results alone.
Use current Scout data and independent official SCF sources before any edit.

The read-only raven-next prior-art card still contains the old algorithmic-absence sentence.
Its compiled prior-art output carries the same residual text.
Do not edit or mine the read-only archive as a source of gospel.

### Test a skill-scope mechanism

Do not add another prompt reminder for `kind: "skill"`.
The search contract already explains that filter in four places.
Historical agents used any `kind` filter in only 6 of 237 searches.

Test a product mechanism against the skills lane, extended lane, and discovery runs.
Candidate mechanisms include a decisive scope hint or an explicit scope choice in the schema.
Freeze the design before one blind holdout read.
Run a free transcript replay before any paid A/B evaluation.
Do not add per-question routing rules.

### Decide whether to file `sls-067` upstream

The local finding is verified and indexed.
No external issue was filed during this audit.
Use the improvements workflow before filing or changing intake state.
Check for an existing upstream report before creating a new one.

## Private evaluation evidence

Raw ignored evaluation artifacts remain outside Git in an owner-only local archive.
No raw model transcript, credential, or private artifact belongs in the repository.
