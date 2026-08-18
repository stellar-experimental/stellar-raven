# Reviewability audit rubric

Use this rubric to classify candidates. A signal starts an inspection. Evidence creates a finding.

## Contents

1. Core invariants
2. Context leak and accretive editing
3. Comments and docblocks
4. Documentation and references
5. Code design and compatibility
6. Change scope and review load
7. Tests and verification
8. Human work and agent instructions
9. Candidate searches
10. Finding decision table

## Core invariants

- **Provenance-blind:** Evaluate the artifact. Writing style does not prove authorship or quality.
- **Present-state:** Source files explain the current system. Version control, changelogs, and ADRs
  hold necessary history.
- **Human-reviewable:** A responsible human can understand and verify the system without trusting an
  unverified summary.
- **One truth owner:** Store each durable fact once. Point other surfaces to that owner.
- **Behavior-backed:** Use tests, types, schemas, and executable checks for behavior claims.
- **Preservation-first:** Retain public contracts, domain reasons, invariants, safety notes, and human
  edits unless better verified expression replaces them.

Do not ban words, punctuation, sentence shapes, or model-associated phrases. Terms such as
"load-bearing" and normal punctuation can be useful human language. Judge meaning and cost.

Treat line limits, comment ratios, and phrase tables as optional team gates. They can control intake,
but they cannot decide truth or value.

## Context leak and accretive editing

Context leak moves a task conversation into a permanent artifact. Accretive editing retains obsolete
information and appends a correction instead of replacing it.

### Candidate signals

- A comment explains a rejected design, removed code, or a correction requested during the session.
- A source file refers to a plan phase, task number, acceptance step, review exchange, or prompt.
- Prose compares the implementation with an alternative that never shipped.
- A new sentence says the system now does one thing and no longer does another.
- A comment explains why absent code is absent without recording a durable constraint.

### Validation

Ask whether a new maintainer needs the discarded alternative to operate or change the current system.
Check version history, requirements, ADRs, and public migration promises. A rejected idea alone is not
a durable constraint.

### Repair

- Replace obsolete text with accurate present-state text.
- Delete session history that adds no current constraint.
- Put user-visible removal history in the changelog or migration guide.
- Put durable architectural trade-offs in an ADR.
- Express a real prohibition as a positive invariant when possible.

Keep a negative decision only when the tempting alternative remains likely and the reason remains
important. State the invariant and reason without retelling the conversation.

## Comments and docblocks

### Valuable comment content

Preserve or add a comment when it supplies unique, verified information about:

- a public API contract, side effect, failure mode, or caller obligation;
- a business or protocol invariant;
- a security, data-loss, concurrency, or performance constraint;
- a non-obvious domain reason or external-system limitation;
- surprising behavior that simpler code cannot remove;
- a temporary condition with an owned issue and a removal trigger.

### Reviewability debt

- The comment restates syntax, names, types, branches, or the function signature.
- The docblock repeats a class name or narrates each line.
- The comment contains speculation presented as fact.
- The comment describes the diff, author conversation, or old implementation.
- Multiple comments repeat the same claim within one file.
- The explanation is longer than the code because the code uses avoidable complexity.
- Newly touched code has disproportionate commentary that creates false salience.
- The comment is stale, unverifiable, or contradicted by code or tests.

### Repair order

1. Rename or simplify the code.
2. Encode constraints in types, schemas, assertions, or tests.
3. Keep the smallest comment that still carries the unique reason or contract.
4. Delete the comment when no unique fact remains.

Never remove all comments mechanically. A blanket deletion can erase niche knowledge and public
contracts. Never preserve a comment only because another model might read it later.

## Documentation and references

### Findings

- A document describes a past edit instead of the current system.
- A local plan or scratch document is treated as a durable source.
- Several documents own the same fact and can drift independently.
- A source comment references an absent, ignored, private, generated, or temporary file.
- A section-number or line-number reference moved and now targets unrelated text.
- A broad architectural essay changes for every local implementation edit.
- A generated document was edited by hand.
- An agent instruction file repeats discoverable commands or stale repository facts.

### Repairs

- Keep user tasks in the task tracker and temporary agent context in a scratch surface.
- Keep public behavior in API documentation and durable design decisions in ADRs.
- Move low-level facts close to the code that owns them.
- Replace duplicate prose with a link to the canonical owner.
- Prefer stable headings, symbols, or repository-supported permalinks over fragile line references.
- Regenerate generated documents through their owning command.
- Write instructions as positive, current targets rather than a history of prior failures.

Validate every link and named file. A precise broken reference causes more harm than a broad valid
reference.

## Code design and compatibility

### Findings

- A simpler local design provides the same verified behavior.
- New abstractions, configuration, or indirection serve no current caller.
- Similar logic is duplicated instead of using an established implementation.
- A one-off script contains migration or compatibility machinery without a supported old state.
- A v2 path is layered over a v1 path when the repository requires a forward-only change.
- Deprecated paths, feature flags, shims, or fallback branches lack an owner and removal trigger.
- A correction adds code that explains or accommodates a design that never shipped.

### Evidence required before removal

Check the repository policy, released public contracts, persisted data, deployed clients, supported
versions, and migration commitments. Absence of evidence in the current file is insufficient.

### Repairs

- Reuse the established implementation when its contract matches.
- Collapse speculative abstraction into the current use case.
- Remove unsupported compatibility and migration paths.
- Keep required compatibility with a precise owner, supported range, and removal condition.
- Record an unavoidably surprising constraint once, near the code that enforces it.

## Change scope and review load

### Findings

- One change mixes unrelated behavior, refactoring, formatting, documentation, or dependency work.
- A small requirement rewrites broad areas without a demonstrated need.
- A review correction produces a new large diff that invalidates prior review.
- Generated output dominates a change without an owning source change.
- A description or review reply requires more effort to validate than the change itself.
- A reviewer cannot identify the behavioral delta and evidence from the supplied materials.

Size is contextual. Count changed lines and files, but judge conceptual scope. A focused 500-line
generated artifact can be easier than a scattered 100-line behavioral change.

### Repairs

- Revert unrelated edits from the requested change.
- Split independent work into separately reviewable changes when the workflow permits.
- Keep related tests with the behavior they verify.
- Regenerate derived files from the smallest source change.
- Summarize purpose, behavior, risk, and verification in human words.
- Require a new review after a broad rewrite instead of treating it as a small response.

## Tests and verification

### Findings

- A test asserts that a source file contains the text added by the same change.
- A test mirrors the implementation and uses the mirror as its oracle.
- A test checks framework wiring without an observable contract.
- Many examples repeat one behavior without covering boundaries or failure modes.
- A snapshot or fixture grows because it records incidental implementation detail.
- A test label claims "smoke" or "comprehensive" without assertions that support the claim.
- Reviewers cannot understand the generated test's intended behavior.

### Repairs

- Test observable contracts through public boundaries when practical.
- Add a regression test that fails on the original defect.
- Use property-based testing only with an independent oracle or valid invariant.
- Remove redundant cases after proving retained coverage.
- Keep implementation-level tests when the implementation detail is itself a supported contract.

Test volume does not replace readable code. Readability does not replace behavioral verification.
Require both in proportion to risk.

## Human work and agent instructions

### Human preservation checks

- Compare the current file with the version read before editing.
- Inspect user changes, debug statements, and comments outside the requested hunk.
- Preserve formatting and nearby code unless the repair requires it.
- Use history when authorship or intent affects preservation, not to assign blame.

### Instruction findings

- A blanket comment ban causes useful comments to disappear.
- A negative instruction keeps the unwanted concept active in future context.
- The agent assumes files remain unchanged between turns.
- The project omits important scope, audience, deployment, or compatibility facts.
- Several instruction files conflict or copy stale commands.

### Instruction repairs

Use positive targets:

- "Document current purpose, contracts, invariants, and non-obvious reasons."
- "Preserve existing comments unless the changed code makes them false or redundant."
- "Re-read each file immediately before editing it."
- "Make the smallest change that satisfies the current requirement."
- "Use the repository's declared compatibility posture."
- "Place temporary task context in the designated scratch surface."

## Candidate searches

Adapt these commands to the repository. Exclude generated and vendored paths according to local
instructions.

```bash
git status --short
git diff --stat <fixed-point>...
git diff --numstat <fixed-point>...
git diff --check <fixed-point>...
rg -n -i 'phase[[:space:]]+[0-9]+|item[[:space:]]+[0-9]+|as (requested|discussed)|previous implementation|we (changed|removed|decided)'
rg -n -i 'backward.?compat|legacy|deprecated|migration|fallback|v[0-9]+'
rg -n -i '[A-Za-z0-9_./-]+\.(md|txt|docx?)'
rg -n -i 'TODO|FIXME|HACK|temporary|remove (after|when)'
```

Search hits are candidates. Read the full symbol, caller, document section, and relevant policy
before reporting them.

## Finding decision table

| Evidence | Action |
|---|---|
| False or stale claim | Correct or remove immediately |
| No unique durable fact | Delete |
| Useful fact in transient form | Rewrite for present-state intent |
| Useful fact in several places | Keep one canonical owner and link |
| Complexity exists only to explain itself | Simplify code, then reassess prose |
| Compatibility has no supported consumer | Remove after evidence check |
| Compatibility has a supported consumer | Keep and document the exact contract |
| Test mirrors implementation | Replace with behavior or an independent invariant |
| Existing human intent remains valid | Preserve |
| Only a phrase or length signal exists | Do not report a finding |

Account for every candidate. Record uncertain cases as risks rather than silently deleting them.
