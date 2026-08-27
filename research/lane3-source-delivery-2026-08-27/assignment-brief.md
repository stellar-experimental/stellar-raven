# Draft brief — Lane 3 idea: scored source delivery (not content reading)

Worktree: `/Users/kalepail/Desktop/sr-wt-lane3` (branch `lane/source-delivery-idea-20260827`,
based on main `37dc50d`). Read-only except your single draft file. No code changes.
When done, reply with exactly the draft path.

## The owner's philosophy — this governs every design choice

Verbatim intent from the service owner, 2026-08-27:

1. Do NOT overfit to the golden QA. Build a system that is generally useful for all
   questions, especially beyond the golden corpus.
2. Raven should NOT read repositories on the calling agent's behalf. Instead it
   should DELIVER SOURCES to the calling agent — scored, precise pointers the agent
   can then call/fetch itself with its own tools.
3. Balance: delivering material vs delivering sources. "Delivering the right
   sources, well scored, is often better than delivering potentially truncated
   content."
4. Show sources. Do not take opinions the system should not have.

Your draft must internalize this: the unit of value is a SCORED, VERIFIABLE SOURCE
POINTER — repo, path, line range, commit/ref, and why-it-matches — not fetched
file contents. Content fetching stays the calling agent's job.

## Context to read (main checkout + your worktree)

- `research/qa-improvement-plan-2026-08-25.md` §Track C item 1 (the canonical
  technical source reader — the prior framing you are REFRAMING per the
  philosophy above) and its doctrinal-conflict table
- `research/qa-deep-dive-2026-08-25/terra-max.md` top-10 table (rows 1, 3, 8)
- `research/qa-deep-dive-2026-08-25/fable-max.md` §7 open question 6
  (repo-level ops for "how do I do X in tool Y")
- `ARCHITECTURE.md` (manifest-as-surface, ADR-0003, networkless sandbox,
  host-side secrets) — the draft must fit this doctrine exactly
- `ideas/README.md` + two neighboring idea files for house format/tone
- Miss cases that motivate this: base-reserve formula vs Core
  (`research/qa-deep-dive-2026-08-25/grok-xhigh.md` §2), quickstart manual-close,
  RPC limits wording, extendTo minus-one

## Draft requirements (`ideas/source-delivery-ranked-references.md`)

1. **Problem statement** grounded in evidence, not vibes — cite the exact miss
   classes and the docs-vs-Core dispute pattern.
2. **Doctrine fit**: show how source-pointer cards live INSIDE ADR-0003 (they are
   manifest-declared, host-scored, no new runtime powers, no secrets, sandbox stays
   networkless — the calling agent does the fetching with ITS tools).
3. **Proposed surface** (concrete but small): extend search/execute results with a
   `sources` block — scored references like
   `{repo, ref/pin, path, lineRange?, locatorKind, matchReason, verificationUrl}`
   attached to existing hits, PLUS a small manifest-declared index-builder that
   maintains the source locator index host-side (allowlisted repos only, pinned
   refs, provenance recorded). No content transit through Raven.
4. **Scoring design**: how a reference earns rank (entity match, path/locator
   specificity, recency of pin, verification status) — generally useful, no
   per-question rules, no golden-corpus coupling.
5. **Alternatives matrix** (at minimum): pure pointer cards; bounded host content
   fetch op (why this violates the philosophy / when it might still be justified);
   hybrid with receipts-only enrichment; doing nothing. Honest costs, risks,
   failure modes for each.
6. **Overfit guardrails**: explicit list of what this design must NOT do
   (per-question locators, golden-derived indexes, golden-QA-only fields).
7. **General-utility argument**: three concrete non-battery use cases (e.g. a
   builder debugging an RPC cursor question; an agent verifying a SEP status; a
   contract dev needing the exact CAP text) that show value beyond the golden QA.
8. **Open questions** for the owner — include at minimum: pin freshness policy;
   how calling agents without fetch tools are served (degraded mode?);
   index-build cost/budget; whether locator precision (line ranges) is worth
   maintenance drag; licensing/attribution notes for delivered source pointers.
9. **Sizing**: rough effort (S/M/L per component), what ships first, what is
   explicitly deferred.

Tone: house idea-file style — plain, decision-ready, no marketing. Length target:
comparable to existing idea files (read two first). This is a DRAFT FOR REVIEW,
not a decision record.
