# Answer-style guidance as result data — design decision

Status: implemented on branch `w1010/a`. The paired QA measurement ran on 2026-10-11. The
independent result review ([`review-result-astra.md`](review-result-astra.md)) rates it
INDETERMINATE: the candidate arm shows a repeated Strupey attribution failure, but its baseline
confirmation re-judge is T4. The merge is blocked. See
[`measurement-ledger.md`](measurement-ledger.md).

Source item: `.agents/TODO.md`, "Move answer-style guidance from server instructions into result
data".

## Problem

`BASE_SERVER_INSTRUCTIONS` tells the client how to phrase findings. It tells the client how to
word an absence, when to abstain, when to ask for context, and to date volatile values. The client
reads these rules before it sees any result. The host already knows most of the facts behind these
rules when a call returns. The host does not put those facts on the ok envelope.

Today an ok envelope is `{ ok: true, data }`. The host keeps three structural facts in a private
call ledger: whether the payload has rows, the operation's catalog retrieval lane, and
allowlisted upstream metadata such as `meta.asOf` and `match_mode`. The ledger feeds run-level
blocks. Model code never sees these facts per call. An untruncated run with no captured metadata
and no error gets no footer, so the client sees no observation time.

## Decision

Use one host mechanism with two carriers. The operation dispatcher in
`src/executor/providers.ts` (`buildOpsFns`) derives the signals once per service call. The
signals then appear in two places:

1. **On the ok envelope** that model code receives:
   `{ ok: true, data, asOf, asOfBasis, inconclusive? }`.
2. **In the source-basis footer** that the client receives. The footer is now appended to every
   execute result that made an ok or failed service call. The `calls:` line marks each inconclusive call. A new
   `observedAt:` line gives the host observation time.

Failed envelopes do not change. `error.kind` stays `"error"` or `"soft-empty"`. Exact-match ID
resolution does not change. A soft-empty call never gets `inconclusive`, because it is not an ok
result.

### Signal: `inconclusive`

The dispatcher sets `inconclusive` on an ok result only when host data proves it:

| Value | Rule | Host data used |
|---|---|---|
| `"empty"` | `hasServiceData(data)` is false: no non-empty collection and no scalar detail outside metadata branches. | Result shape |
| `"candidates"` | The payload has rows, and the catalog `retrievalProfile.lane` is `semantic`, `research`, or `av`. | Catalog metadata |
| `"candidates"` | The payload has rows, and captured `matchMode` or `match_mode` is `"semantic"` or `"corrected"`. | Allowlisted upstream metadata |

Scout `meta.matchMode` values `loose-1` and `majority` stay unmarked. They are relaxed keyword
tiers, so their rows are still keyword-confirmed. Only `semantic` (no keyword tier matched) and
`corrected` (spelling correction only) mark candidates.

The match-mode rule covers directory searches that fall back to vector neighbours. Lumenloop
`search_directory` documents `match_mode: "semantic"` for that case. Scout documents
`meta.matchMode` `"semantic"` (no keyword tier matched) and `"corrected"` (rows matched only
through a spelling correction, so identity needs a check). Both come from the committed inventory
descriptions. The rule reads one value. It does not inspect row content.

The host cannot detect "adjacent" or "off-target" rows. That needs the question, and the host does
not read model intent. Those judgments stay with the client and stay in the instructions.

The run-level `candidateEvidence` count (which triggers the existing `--- CANDIDATE EVIDENCE ---`
block) now counts calls with `inconclusive: "candidates"`. This replaces the hand-kept
`EVIDENCE_OPERATION_IDS.candidate` set, so one rule decides "candidate" everywhere. Effects:

- `lumenloop.search_directory` and `scout.searchProjects` count only when their match mode says
  semantic or corrected. A substring or keyword match no longer triggers the block.
- `lumenloop.find_content_about_project`, `scout.vetIdea`, and `scout.scfPitch` now count, because
  their catalog lane is semantic or research.
- An operation without a retrieval profile gets only the `"empty"` and match-mode signals.

### Signal: `asOf` and `asOfBasis`

Every ok service result carries `asOf` (an ISO-8601 string) and `asOfBasis`:

- When the upstream payload states a parseable data date at an allowlisted path, `asOf` is that
  exact string, and `asOfBasis` is the path. The precedence is `data.dataAsOf`,
  `data.meta.dataAsOf`, `data.asOf`, `data.meta.asOf`.
- Otherwise `asOf` is the host clock when the response arrived, and `asOfBasis` is `"observed"`.

`generatedAt` is not a data date. Scout documents it as a response-generation stamp, so it adds
nothing over the host observation time. It still appears on the footer `sourceMetadata:` line, but
it never becomes `asOf`. For most Docs, Scout, and Lumenloop calls, no data date exists, so
`asOf` is the observation time. The instructions therefore name `asOfBasis` beside `asOf`.

The host has no per-operation volatility flag. All three services serve mutable data, and docs
pages change too. One rule for every ok result is simpler than a hand-kept volatile list, and it
cannot drift. The footer `observedAt:` line gives the latest observation time across the run's ok
calls. Upstream dates already appear on the footer `sourceMetadata:` line.

### Footer trigger

Before: the footer appeared after truncation, captured source metadata, or an error call.
After: the footer appears after truncation, an ok service call, or an error call. A run whose
calls all soft-emptied gets no footer: it has no data to date, and each envelope already says
soft-empty. Skill-only and discovery-only runs get no footer. The marker contract does not change: only `--- SOURCE BASIS ---` marks
truncation, and `--- SOURCE METADATA ---` marks an untruncated footer. The 1,600-character footer
budget does not change. The budget loop drops per-call atoms first. The totals keep the
inconclusive count, and the `observedAt:` line is fixed.

A clean ok-only run (no truncation, no failed call, no captured source metadata) gets a compact
footer: the marker, `calls:`, `observedAt:`, and `guidance:`. On such a run the `shape:`,
`canonicalUrls:`, and `artifact:` lines carry nothing. The compact form costs about 300
characters instead of about 456 for a one-call run. Every other trigger keeps the full form.

### Rejected options

- **A new `--- EVIDENCE SIGNALS ---` block.** It duplicates the footer's `calls:` and
  `sourceMetadata:` lines, and it adds a fourth evidence block.
- **`inconclusive: true` as a boolean.** The reason (`empty` versus `candidates`) changes the
  next step: broaden versus verify identity. A string costs nothing extra.
- **Per-operation volatility flags.** No catalog field holds them, and a hand list would drift.
- **Row-relevance scoring for "adjacent".** It needs the question text. The host must not guess.

## Instruction sentences

Measured on `main` `d15a4ce5`: `BASE_SERVER_INSTRUCTIONS` 1,977 characters, full
`SERVER_INSTRUCTIONS` 7,864 characters. The micro-map does not carry answer-style rules, so it does
not change. On the branch after the review fixes: 1,952 and 7,839 characters.

### Removed (a signal replaces it)

| Sentence | Replacement |
|---|---|
| "Evidence discipline: date volatile values with their as-of date." | `asOf` and `asOfBasis` on each ok result; footer `observedAt:` and `sourceMetadata:` lines. |
| 'Say "not found in these sources", not "does not exist".' | `inconclusive: "empty"` on the call, the footer marker, and the existing `--- EVIDENCE RECOVERY ---` block, which scopes an empty result to the named source. |
| "Broaden vocabulary or abstain after empty entity lookups." | `inconclusive: "empty"` plus the kept broad-pass rule below. The client decides to abstain when the broad pass is still inconclusive. |
| "…; otherwise say unverified or ask for context." | `inconclusive: "candidates"` and the existing `--- CANDIDATE EVIDENCE ---` block, which keeps any non-verification source-scoped. Asking the user is a client choice, not a server rule. |

### Changed

| Before | After | Why |
|---|---|---|
| "Every service call resolves to { ok: true, data } or …" | "… { ok: true, data, asOf, asOfBasis, inconclusive? } or …", plus one sentence that defines `asOf` with its basis and one that defines `inconclusive`. | The envelope contract must name the new fields. A client that reads only the clipped base text must see that `asOf` can be the observation time. |
| "…ok rows that are empty, off-target, adjacent, or only semantic candidates are inconclusive: make one broad pass." | "…`inconclusive`, off-target, or adjacent ok rows ground nothing: make one broad pass." | The signal now names the empty and candidate classes. Off-target and adjacent stay, because the host cannot detect them. |

### Kept (and why)

| Sentence | Why it stays |
|---|---|
| Orientation, workflow, `codemode.describe`, skill read and run, raw-row filtering. | Workflow, not answer style. |
| Envelope shape, `.data` path, and `error.kind` semantics. | Envelope contract (AGENTS.md hard rule). |
| "A closed-world exact empty applies only there." | Scope depends on the question. The host does not know if the question is closed-world. |
| The broad-pass rule and the four broad operations. | It is a planning rule. A result signal arrives after the script ran. Claude Code clips tool descriptions at 2,048 characters, so this base text is the only place where the rule survives for that client. |
| "Require exact identity or canonical slug plus source and date before attribution." | It is an evidence rule for the script, not phrasing. The candidate block repeats it only after candidate lanes ran. |
| "Copy exact symbols, types, formulas, and identifiers from results." | Fidelity to source text. No host signal can detect a paraphrase. |
| "State visible source conflicts instead of choosing silently." | The host does not compare content across calls. |
| Host blocks, artifact reads, exact-match IDs. | Truncation recovery and ID discipline. |

## Surfaces to update

- `src/executor/providers.ts`: derive the signals; let the envelope guard skip the new keys;
  update the guard error message and the `codemode.describe` usage line.
- `src/executor/run.ts`: count inconclusive and candidate calls from the ledger; footer trigger;
  `observedAt`.
- `src/policy/source-basis.ts`: per-call marker, totals, `observedAt:` line, guidance text.
- `src/mcp/tools.ts`: `BASE_SERVER_INSTRUCTIONS`; envelope and footer text in
  `EXECUTE_DESCRIPTION`; the `--- EVIDENCE RECOVERY ---` block, which now names
  `inconclusive: "empty"`.
- `src/demo/tools.ts`, `src/site.ts`, `scripts/build-super-spec.mjs` (then `npm run spec:build`):
  envelope wording.
- `ARCHITECTURE.md` and the `retrieval-system-audit` evidence contract: current envelope and
  footer behavior.

## Risks

- **Removed phrasing can change answer style.** A client may stop scoping absences or stop asking
  for context. The paired QA brief measures abstention, absence, soft-empty, and volatile-value
  cases against a control slice.
- **Candidate-block trigger change.** A substring directory match no longer adds the candidate
  block. Three operations newly add it. The measurement attributes the bundle, not each part.
- **Footer on more runs.** A compact footer costs about 75 tokens, and a full untruncated
  footer about 115 tokens. The QA cost estimate includes it.
- **Clock precision.** The Workers clock advances only across I/O. Each `asOf` with basis
  `"observed"` is the time after the response arrived, which is the correct observation time.
