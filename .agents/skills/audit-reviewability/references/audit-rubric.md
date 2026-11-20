# Reviewability audit rubric

Use this rubric to classify candidates. A signal starts an inspection. Evidence creates a finding.

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

Context leak puts task conversation into permanent artifacts. Accretive editing appends a
correction to obsolete prose instead of replacing it.

- **Signals:** Comments about rejected designs, removed code, session corrections, plan phases,
  task numbers, prompts, unshipped alternatives, "now does X instead of Y", or absent code without
  a durable constraint.
- **Validate:** Check version history, requirements, ADRs, and migration promises to see whether a
  new maintainer needs the discarded alternative. A rejected idea alone is not a durable constraint.
- **Repair:** Replace obsolete prose with present-state text; delete session history; put
  user-visible removals in changelogs or migration guides and durable trade-offs in ADRs; express
  prohibitions as positive invariants. Keep a negative decision only when the tempting alternative
  remains likely and the reason still matters, without retelling the conversation.

## Comments and docblocks

**Keep or add** when a comment supplies a unique, verified fact:

- public API contract, side effect, failure mode, or caller obligation;
- business, protocol, security, data-loss, concurrency, or performance invariant;
- non-obvious domain reason, external-system limitation, or unavoidable surprising behavior;
- temporary condition with an owned issue and removal trigger.

**Debt signals:** Restates syntax, names, types, branches, or signatures; narrates lines; speculates
as fact; describes the diff, conversation, or old implementation; repeats a claim in one file;
exceeds the code because of avoidable complexity; adds disproportionate commentary to newly touched
code; or is stale, unverifiable, or contradicted by code or tests.

**Repair order:** (1) rename or simplify code; (2) encode constraints in types, schemas,
assertions, or tests; (3) keep the smallest comment carrying the unique reason or contract;
(4) delete when no unique fact remains. Never remove all comments mechanically, and never preserve
a comment only because another model might read it later.

## Documentation and references

- **Findings:** Describes past edits instead of current state; treats a local plan or scratch doc
  as durable; duplicates a fact across docs; references an absent, ignored, private, generated, or
  temporary file; uses a drifted section or line number; changes a broad essay for every local
  edit; hand-edits a generated doc; or repeats discoverable commands or stale facts in agent
  instructions.
- **Repairs:** Keep open work in the project queue (`.agents/TODO.md` in this repository),
  temporary context in a scratch surface, public behavior in API docs, durable decisions in ADRs,
  and low-level facts near their owning code. Replace duplicate prose with a link to the canonical
  owner, prefer stable headings or symbols over line numbers, regenerate generated docs via their
  owning command, and write instructions as positive current targets. Validate every link and named
  file.

## Code design and compatibility

- **Findings:** Simpler local design gives the same verified behavior; unused abstractions or
  indirection; duplicated logic; migration or compatibility machinery in a one-off script without a
  supported old state; v2 layered over v1 under a forward-only policy; deprecated paths, flags,
  shims, or fallbacks without an owner and removal trigger; or code accommodating an unshipped
  design.
- **Evidence before removal:** Check repository policy, released public contracts, persisted data,
  deployed clients, supported versions, and migration commitments. Absence of references in one
  file is insufficient.
- **Repairs:** Reuse established implementations; collapse speculative abstraction; remove
  unsupported compatibility and migration paths; keep required compatibility with owner, supported
  range, and removal condition; record unavoidable constraints once near the enforcing code.

## Change scope and review load

- **Findings:** Unrelated behavior, refactoring, formatting, documentation, or dependency work
  mixed in one change; broad rewrites for a small requirement; review fixes that invalidate prior
  review; generated output without an owning source change; descriptions harder to validate than
  the change; or an unclear behavioral delta and verification trail.
- **Repairs:** Revert unrelated edits; split independent work when permitted; keep tests with the
  behavior they verify; regenerate derived files from the smallest source change; summarize
  purpose, behavior, risk, and verification plainly; require a new review after a broad rewrite.

Judge conceptual scope alongside line counts: a focused 500-line generated artifact can be easier
than a scattered 100-line behavioral change.

## Tests and verification

- **Findings:** Asserts source text added by the same change; mirrors implementation logic as its
  oracle; checks framework wiring without an observable contract; repeats examples without covering
  boundaries or failure modes; bloats snapshots with incidental detail; claims "smoke" or
  "comprehensive" without supporting assertions; or hides intended behavior.
- **Repairs:** Test observable contracts through public boundaries when practical; add regression
  tests that fail on the original defect; use property-based testing only with an independent
  oracle or valid invariant; remove redundant cases after proving retained coverage; keep
  implementation-level tests when the detail is a supported contract.

Require both readable code and behavioral verification in proportion to risk.

## Human work and agent instructions

- **Preservation checks:** Compare the current file with the version read before editing; inspect
  user changes, debug statements, and comments outside the requested hunk; preserve nearby
  formatting and code unless the repair requires it; use history for preservation intent, not
  blame.
- **Instruction findings:** Blanket comment bans; negative instructions that keep unwanted concepts
  active; assuming files stay unchanged between turns; omitting scope, audience, deployment, or
  compatibility facts; conflicting or stale instruction files.
- **Positive instruction targets:**
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
rg --hidden -g '!.git' -n -i 'phase[[:space:]]+[0-9]+|item[[:space:]]+[0-9]+|as (requested|discussed)|previous implementation|we (changed|removed|decided)'
rg --hidden -g '!.git' -n -i 'backward.?compat|legacy|deprecated|migration|fallback|v[0-9]+'
rg --hidden -g '!.git' -n -i '[A-Za-z0-9_./-]+\.(md|txt|docx?)'
rg --hidden -g '!.git' -n -i 'TODO|FIXME|HACK|temporary|remove (after|when)'
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

## Why these rules exist

These rules synthesize practitioner reports and code-review studies. Neither justifies a universal
line limit or comment ratio; both show that reviewer attention is the bottleneck, obsolete prose
acts as negative context, uneven commentary creates false salience, and style markers produce false
accusations unless backed by concrete harm.

References:

- [PEP 8](https://peps.python.org/pep-0008/): contradictory comments are worse than no comments.
- [Google small-change guide](https://google.github.io/eng-practices/review/developer/small-cls.html)
  and [Modern code review at Google](https://research.google/pubs/modern-code-review-a-case-study-at-google).
- [Characteristics of useful code reviews (Microsoft)](https://www.microsoft.com/en-us/research/publication/characteristics-of-useful-code-reviews-an-empirical-study-at-microsoft):
  changes that span more files receive a lower share of useful comments.
- [Code-comment inconsistency (ICPC 2019)](https://dl.acm.org/doi/10.1109/ICPC.2019.00019).
- [More Code, Less Reuse](https://doi.org/10.1145/3793302.3793622): more redundancy in
  agent-generated pull requests in the studied sample.
- [Accretive Editing](https://justindfuller.com/programming/accretive-editing): replace obsolete
  prose instead of appending a correction.
- The practitioner discussion:
  [Hacker News item 49337050](https://news.ycombinator.com/item?id=49337050).
