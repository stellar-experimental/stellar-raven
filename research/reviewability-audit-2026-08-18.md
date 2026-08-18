# Reviewability audit evidence and derivation

This file records why the audit rules exist. It is not a phrase blacklist or an AI detector.

## Contents

1. Source coverage
2. Discussion synthesis
3. Counterarguments retained
4. Derived audit principles
5. External evidence
6. Evidence limits

## Source coverage

The primary discussion is the Hacker News item
["My coworkers continue to dump hundreds of lines of AI documentation in every PR ..."](https://news.ycombinator.com/item?id=49337050).

The source was reviewed on 2026-08-18 through three independent access paths:

- A rendered `agent-browser` pass found 188 visible comment text blocks.
- The official [Hacker News API](https://github.com/HackerNews/API) tree contained 197 nodes:
  188 live, 3 deleted, and 6 dead. The maximum reply depth was 9.
- A full Parallel extraction captured 112,712 characters from the rendered discussion.

The API traversal covered the opening comment and all 196 descendants. Deleted and dead nodes added
no recoverable argument. The audit rules below classify the substantive claims without copying the
discussion.

## Discussion synthesis

### Transient history became permanent context

Comments described rejected designs, removed code, review conversations, plan numbers, and files
that never entered the repository. Participants called this "context leak" and
["accretive editing"](https://news.ycombinator.com/item?id=49343740).

Representative branches:

- [Comments about code that never shipped](https://news.ycombinator.com/item?id=49338341)
- [Docblocks comparing against nonexistent alternatives](https://news.ycombinator.com/item?id=49340650)
- [Plan phases and task numbers in comments](https://news.ycombinator.com/item?id=49340619)
- [References to absent or scratch documents](https://news.ycombinator.com/item?id=49340011)
- [Document the current state, not the diff](https://news.ycombinator.com/item?id=49338947)

### Volume exceeded human review capacity

The opening concern separated delivery metrics from readability. Later replies separated prose
quality from volume: even accurate text can overwhelm review when generation is much cheaper than
evaluation.

Representative branches:

- [The volume and repeated rewrite problem](https://news.ycombinator.com/item?id=49339129)
- [Volume remains a separate problem from quality](https://news.ycombinator.com/item?id=49339503)
- [A large correction invalidates the prior review](https://news.ycombinator.com/item?id=49338791)
- [The verification stage becomes the bottleneck](https://news.ycombinator.com/item?id=49340447)

### Comments became untrusted model memory

Some participants valued verbose comments as context for later model passes. Others reported that
stale, duplicated, or speculative comments misled later passes. The durable conclusion is not a
blanket ban. Permanent context must be true, canonical, and worth maintaining.

Representative branches:

- [Comments as model context](https://news.ycombinator.com/item?id=49337387)
- [Redundant or wrong context](https://news.ycombinator.com/item?id=49337986)
- [Compounding context contamination](https://news.ycombinator.com/item?id=49345003)
- [Speculation presented as fact](https://news.ycombinator.com/item?id=49341839)

### Generated code also expanded design and compatibility scope

The discussion connected narrative residue with speculative migrations, parallel versions, and
compatibility for states that no supported user had. Other branches reported unrelated refactors in
feature changes.

Representative branches:

- [Speculative backward compatibility](https://news.ycombinator.com/item?id=49341248)
- [Compatibility machinery in one-off scripts](https://news.ycombinator.com/item?id=49341912)
- [Parallel v2 implementation](https://news.ycombinator.com/item?id=49343774)
- [Rejecting unrelated changes](https://news.ycombinator.com/item?id=49341082)

### Test quantity also created review debt

Participants described tests that inspected source text, mirrored implementations, repeated
tautologies, or memorialized every edit. The strongest proposed remedy was behavior-level testing
through public boundaries.

Representative branches:

- [A test that checks whether Dockerfile lines exist](https://news.ycombinator.com/item?id=49340656)
- [Mirror implementations as property-test oracles](https://news.ycombinator.com/item?id=49341804)
- [Tautological generated tests](https://news.ycombinator.com/item?id=49340681)
- [Black-box tests as an independent check](https://news.ycombinator.com/item?id=49344204)

### Cleanup can destroy valuable human work

A distinct branch reported agents removing useful human comments, debug statements, and nearby
edits. Another reply traced this behavior to an overly broad instruction against "what" comments.

Representative branches:

- [Useful comments removed during a small edit](https://news.ycombinator.com/item?id=49337615)
- [Nearby human changes overwritten](https://news.ycombinator.com/item?id=49337853)
- [Re-read files and preserve intervening edits](https://news.ycombinator.com/item?id=49338381)

### Proposed controls varied in strength

Participants proposed comment-length hooks, line budgets, standardized descriptions, review skills,
pre-commit checks, present-state documentation, meaningful names, and blocking review. These are
candidate controls. None can replace contextual review.

Representative branches:

- [Two-line comment hook focused on reasons](https://news.ycombinator.com/item?id=49338208)
- [Meaningful names before explanatory comments](https://news.ycombinator.com/item?id=49339713)
- [Simple-language review instructions](https://news.ycombinator.com/item?id=49337155)
- [Purpose and intent without obvious comments](https://news.ycombinator.com/item?id=49339226)
- [Human explanation as evidence of understanding](https://news.ycombinator.com/item?id=49337346)

## Counterarguments retained

The skill preserves these tensions instead of selecting an extreme:

- **More context can help a model.** Keep it only when it is verified, durable, canonical, and also
  reviewable by humans.
- **Deleting all comments can reduce noise.** It can also erase contracts, niche knowledge, and
  human work. Classify each comment.
- **Tests and live validation can reduce reliance on source reading.** They cannot prove every
  requirement or replace accountable human understanding.
- **Hard limits can protect review throughput.** They are intake gates, not semantic judgments.
- **Style markers can correlate with generated text.** They also produce false accusations against
  human writers. Audit concrete harm without inferring provenance.
- **Team enforcement can improve standards.** Organizational incentives and retaliation risks vary.
  Report neutral artifact evidence rather than prescribing workplace confrontation.
- **Some historical facts matter.** Put release history in changelogs and durable trade-offs in ADRs,
  rather than scattering them through current-state code comments.

## Derived audit principles

These principles are inferences from the complete discussion and the external evidence:

1. **The primary scarce resource is reviewer attention.** Comment count is one possible consumer.
2. **Permanent artifacts are poor scratch memory.** Use source, tests, types, canonical documents,
   ADRs, and designated scratch surfaces for their respective jobs.
3. **Rejected alternatives can survive as negative context.** A present-state rewrite removes this
   residue while preserving necessary decisions in the correct historical surface.
4. **Generation moves the bottleneck to verification.** Small, focused changes protect review
   quality better than faster summaries of large changes.
5. **Uneven commentary creates false salience.** Both humans and models can over-weight heavily
   documented recent code.
6. **Readability and tests are complementary controls.** Distrust in generated code increases the
   need for both.
7. **Artifact quality is provenance-independent.** Human-written noise and model-written noise cost
   the same attention.

## External evidence

- [PEP 8](https://peps.python.org/pep-0008/) states that contradictory comments are worse than
  absent comments. It also advises sparing use of inline comments and rejects obvious restatement.
- [Google's small-change guide](https://google.github.io/eng-practices/review/developer/small-cls.html)
  defines a small change as one self-contained change. It also keeps related tests with that change.
- [Microsoft's empirical study](https://www.microsoft.com/en-us/research/publication/characteristics-of-useful-code-reviews-an-empirical-study-at-microsoft)
  analyzed 1.5 million review comments. It found that changes spanning more files received a lower
  proportion of useful comments.
- [The Google code-review case study](https://research.google/pubs/modern-code-review-a-case-study-at-google)
  studied 9 million reviewed changes. It supports lightweight review and small, self-contained
  changes.
- [The ICPC code-comment inconsistency study](https://dl.acm.org/doi/10.1109/ICPC.2019.00019)
  mined 1.3 billion AST-level changes from 1,500 systems. It documents the maintenance burden and
  inconsistency risk when code and comments evolve.
- [More Code, Less Reuse](https://doi.org/10.1145/3793302.3793622) reports more redundancy in
  agent-generated pull requests than human pull requests in its studied sample. It also reports a
  disconnect between that redundancy and reviewer sentiment.
- [Accretive Editing](https://justindfuller.com/programming/accretive-editing) provides the
  practitioner term and the present-state rewrite. It recommends replacing obsolete prose rather
  than appending a correction.
- [Git Links](https://replicated.live/blog/link) describes one experimental method for detecting
  stale line-specific references. The audit uses the broader principle: references must be stable
  and verifiable.

## Evidence limits

The Hacker News discussion is practitioner testimony, not a controlled study. Its model-specific
claims and causal explanations remain hypotheses. The linked practitioner articles also describe
individual experience.

The external studies cover particular organizations, languages, repositories, or samples. They do
not justify a universal line limit or comment ratio. Apply the rubric through repository evidence,
not numerical folklore.
