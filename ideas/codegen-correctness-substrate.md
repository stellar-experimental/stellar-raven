# Raven as a codegen correctness substrate

Status: research note only. No committed work. Opened 2026-08-07 from the first external report of
this usage mode.

Recorded from an external partner report, 2026-08-05 → 2026-08-07. Identity, triage, and full
message provenance are held in Solo scratchpad 784 and deliberately not repeated here.

## The report

An external team porting a regulated-token contract from EVM to Soroban installed Raven on
2026-08-05. By 2026-08-07 it had an MVP and reported a 32-entry taxonomy of defects its own audit
passes had found in the generated Rust, plus the axes checklist from its agent configuration. The
ask was whether correctness can be increased, on the argument that otherwise the drift surfaces in
live testing rather than at integration.

The reported method: Claude Fable 5 Fast Max, each module test-first, then ~10 audit passes per module until
a pass found no net-new errors. The taxonomy grew one entry per pass.

## The finding that makes this worth a note

**Guidance for many of the reported defect classes is present in what Raven serves. The defects happened
anyway. What failed in between is not yet established.**

That second sentence is the whole finding, and it is deliberately weaker than the one this note
carried in its first revision (which asserted "the gap is activation, not coverage"). That was a
causal claim the evidence here cannot support — see "What this does not establish" below.

Checked live on 2026-08-07 against `skills.stellar-dev.smart-contracts` (served from pinned commit
`52baea1d8cb1aa9441004ce44b723f55cbc90901`) and the `stellarDocs.*` surface:

Verdicts below were independently re-derived by an adversarial reviewer instructed to refute them.
The consolidated evidence is in Solo scratchpad 784. Three of the original eight did not survive.
The table carries the corrected verdicts.

| Reported defect class | What Raven serves | Verdict |
|---|---|---|
| #20 event assertion read after an intervening call | `testing.md` § Events states verbatim: `env.events().all()` "returns the events of the **most recent invocation** … it resets on every call — **assert right after the call under test**". The same file documents identical reset semantics for `env.auths()` | **CONFIRMED** |
| #10 host-blocked re-entry | `SKILL.md` § platform-constraints: "cross-contract reentrancy is blocked by the host". `security.md`: "the host blocks reentrant calls, direct or indirect, on normal cross-contract paths" | **CONFIRMED** |
| #8 persistent key, no rent → archival | `development.md`: "Every entry has a TTL … and is archived (persistent/instance) … when it expires"; "Rent is charged at invocation time". `security.md` class 8: "persistent entries archive and add restoration friction. Extend TTLs in hot paths" | **CONFIRMED** |
| #12 mutator with no auth gate | `security.md` class 1 "Missing authorization", with a `// BAD: anyone can drain` example: "Every privileged path needs `require_auth()` on the right address" | **CONFIRMED** |
| #6 missing `IdentityVerifier` / SEP-57 | golden `q-sor-evm-to-soroban-porting` names ERC-3643 → SEP-57 Draft v0.3.0 + OZ RWA modules | **CONFIRMED** |
| #24/#25 wrong target / host triple | Target guidance is exact — "Compile for the `wasm32v1-none` target (Rust ≥ 1.84) — the only Wasm target the Stellar runtime supports". But **host-triple / toolchain diagnosis is absent** (not found after 4 targeted queries: `host triple`, `rustc --print`, `rustup show`, `native target`) | **PARTIAL** |
| #9 unbounded collection vs entry cap | `development.md` states the number — "Ledger entry size (incl. whole instance storage) \| 64 KB" — and "Keep keys fine-grained … not one giant Map". But it **never connects a growing collection under one persistent key to eventual entry-cap write failure** (no match after 6 targeted queries) | **PARTIAL** |
| #11 panic on malformed input | Only adjacent generic advice: "validate sign and range on inputs" and "When panicking, use `panic_with_error!` … not bare `panic!`". **No malformed-input or length-guard guidance exists** (not found after 6 targeted queries: `malformed`, `length guard`, `input length`, `out of bounds`, `slice`, `decode`). `security.md` class 7 is check-then-act races, not malformed input | **REFUTED — real content gap** |

**#11 is the single weakest item and is now a genuine, independently verified content gap** in a
skill that markets itself to EVM porters — the exact population that arrives expecting a length
guard. It is a candidate `improvements/skills/` finding against `stellar/stellar-dev-skill`; it has
live re-execution evidence from two independent agents, but still needs a recurrence probe before
filing.

Incidental find worth keeping: `development.md` documents `extend_ttl(threshold, extend_to)` as a
**"no-op unless current TTL < threshold"**. That is a served operation whose normal behaviour is
silent success — squarely in the reporter's headline family (direction 4 below).

`security.md` carries 11 numbered vulnerability classes and two checklists; `development.md` is
27 KB across 21 sections. The material is not thin.

### What "covered" means in that table — and what it does not

The column above answers one narrow question: *does correct text exist in a section a reader could
open?* That is the weakest of three different bars, and they must not be run together:

1. **Present** — a paragraph exists in a served file, if you already opened the right section.
2. **Retrievable** — `search`/`execute` actually returns it for a query phrased the way a porter
   would phrase it.
3. **Pinned** — a golden case measures it, which measures answering-when-asked, not writing.

Only bar 1 is established. Bars 2 and 3 are demonstrably weaker in places, and the live probes in
scratchpad 784 undercut the table's own verdicts: **re-entry (#10) returned no relevant docs hit**,
and **event assertions (#18/#20) returned only a weak page**. The table still marks #10 "Covered"
because the skill text and a golden case exist. That is presence, not servability on the path a
writing agent actually takes.

This matters more than a bookkeeping quibble. If "covered" is allowed to mean "somewhere in 27 KB
if you dig," then every non-coverage explanation is eliminated by definition and activation becomes
the only surviving bucket **by construction**. Candidate direction 3 below — vocabulary-sensitive
retrieval — *is itself a coverage/retrieval failure mode*, which is flatly inconsistent with
exonerating coverage in the headline.

### What this does not establish

"The guidance did not reach the model at write time" is a **causal** claim. Distinguishing it from
the competing explanations needs at least one of: Raven call traces from those sessions, evidence
about what was in context when a bad write happened, or an A/B with Raven forced versus absent. We
have none of the three.

Competing explanations, none currently excluded:

- **Non-use.** Installed is not consulted. An MCP server can sit unused for two days.
- **Retrieval failure.** The vocabulary sensitivity measured below is a coverage-layer defect, not
  an activation one.
- **Model ceiling.** Fable 5 Fast Max is a speed-tuned variant; under-reading and under-tooling are
  plausible without any Raven involvement.
- **The reporter's own harness dominating.** That `CLAUDE.md` axes may be doing most of the work either way.
- **Raven simply being marginal here.** A ten-passes-per-module audit loop is itself a correctness
  substrate, and a strong one. It is entirely possible the team built the mitigation itself and Raven's
  contribution — positive or negative — is below the noise floor of this report.

Note also that a taxonomy grown one entry per audit pass is a **selection machine for defect
classes**. It says what kinds of bugs the reporter's process finds. It is not a Raven failure rate and must not
be read as one.

## Why the mode matters

Raven's design assumption is interactive discovery: an agent has a question, calls `search`, composes
an `execute`, and gets a grounded answer. Every instrument we run measures that assumption — QA
measures answer quality, routing measures operation choice, `eval/plan` measures op-class coverage,
`eval/agentic` measures tool-calling behaviour.

What the reporter reports looks different. Over two days of multi-module Rust codegen, the agent is mostly
**writing**, not asking. Raven is installed and available, but the moment a defect enters the code
may be a moment the model did not think it had a question. Ten audit passes then find the defect —
which is what the reporter means by drift surfacing late.

**Hold that as a hypothesis about one partner, not as a discovered product object.** The safe claim
is: *one partner used Raven as an ambient install during long write sessions.* The unsafe claim — and
the one the first revision of this note made — is that we have discovered a "codegen mode" whose
defining characteristic is an activation gap. n=1, two calendar days, a private codebase we cannot
read, a speed-tuned model variant, and zero tool-call logs do not carry that weight. "MVP in two
days" is as consistent with Raven helping as with Raven being irrelevant.

What is genuinely true and does not depend on the sample: **we have no instrument that measures
long-horizon codegen with Raven installed, in either direction.** That absence is the real subject
of this note.

## Where the ownership line actually falls

The triage in scratchpad 784 split the 32 classes into "the project spec", "the harness", and
"ours-adjacent", and assigned the whole parity band #1–#7 to *the project spec*. **That was too generous to
us.** Project-specific names and ratified units (#1, #5, and the specific shapes in #7) genuinely
belong to the project. But event topic placement versus EVM `indexed`, event field semantics, error-surface
conventions, and cross-contract client shape are **platform education Raven actively markets to EVM
porters** — `q-sor-evm-to-soroban-porting` exists precisely to teach that band. The split was also
internally inconsistent: it assigned #6 to ours-adjacent while assigning the rest of #1–#7 away.

Corrected in 784. Recording it here because dumping the parity band off-books shrinks "ours" and
makes the coverage picture look better than it is.

## Candidate directions

Unranked, none committed. Each needs its own evidence before it becomes work.

1. **Measure the mode before changing anything.** The honest first step. A codegen lane that writes a
   small Soroban module twice — once with Raven available, once without — and grades both against a
   fixed defect rubric. The reporter's 32-entry taxonomy is a ready-made external rubric we did not author,
   which makes it unusually good evidence. Without this, any "correctness" change is unmeasured.
2. **Pull versus push.** A coding agent reads a skill once, at the start, then writes for hours. Ask
   whether there is a preflight affordance worth exposing for a build session — something an agent
   consults per module rather than once per project. This is a real design question, not an obvious
   yes: it cuts against the manifest-is-the-surface rule (ADR-0003) if done carelessly.
3. **Retrieval under EVM vocabulary.** Measured 2026-08-07: `"contract events topics testing assert"`
   returned only `storing-data#tests`; `"test assert contract events emitted env.events().all()
   ordering"` returned the correct `test-contract-events` and `example-contracts/events#tests`. Same
   concept, different phrasing, materially different quality. Porters phrase in EVM terms
   (`indexed`, `msg.sender`, `nonReentrant`, `address(0)`). `q-sor-evm-to-soroban-porting` is
   currently the only golden case entering from that vocabulary, and it carries a very wide surface
   alone.
4. **The silent-success family.** The reporter's own headline: 7 of the 32 (#2, #17, #23, #24, #26, #27,
   #28) collapse to one shape — *an operation that reports success while changing nothing, or
   changing the wrong thing*. The reporter calls it the most productive class to hunt. Raven already models
   this distinction internally as soft-empty versus error. Worth asking whether that discipline is
   expressed in anything we serve to a code-writing agent, or whether it only exists host-side.
5. **Question whether prose is the right substrate at all.** Directions 2–4 all assume the fix is
   better or better-timed *text*. The silent-success family may be structural to AI codegen and
   immune to documentation: an operation that reports success while changing nothing is caught by
   compile gates, property tests, mutation testing, or differential execution against the EVM
   reference — not by a paragraph the model did not read. The reporter's own ten-pass audit loop is
   evidence for this reading, and it is a mitigation built without us. If this direction is
   right, most of the others are misdirected, and Raven's honest contribution is discovery, not
   correctness. Do not skip past this one because it is the least flattering.

## Golden-question gaps found while checking

Real, narrow, and independent of everything above. All four were independently re-verified against
all 490 battery cases. The review sharpened two claims and found a fifth issue. Full evidence is in
Solo scratchpad 784.

- **Persistent unbounded collection vs the entry cap** (#9) — **gap real, narrower than first
  stated.** The closest case is not the one originally named: `q-zk-nullifier-storage` already
  teaches "use individually keyed persistent nullifiers with explicit TTL and rent handling, not an
  unbounded instance map" — but it is instance-framed and grades double-spend, not a write hitting
  the cap. `q-soroban-wasm-size-limit` pins 64 KiB deliberately as a *contrast* value ("Do NOT call
  64 KiB … a universal ledger-entry limit"). The persistent-write-failure path is nowhere the graded
  subject.
- **Event-assertion discipline in tests** (#18/#20) — **partial; the original claim missed the case
  that matters.** `q-sor-decode-hosterror-codes` does grade test-side event inspection, including the
  import trap and the rollback trap: "For events import `testutils::Events as _` and inspect
  `env.events().all().events()`; failed calls roll events back." What is nowhere in the corpus is the
  **per-call reset semantic** — that an assertion read after an intervening invocation is
  meaningless. Zero hits corpus-wide. That narrower gap stands.
- **Auth failure error surface** (#13) — **GAP CONFIRMED.** Zero hits corpus-wide for `map_err`,
  `contracterror`, "domain error", "custom error", "swallow". Twelve cases mention `require_auth`;
  none address error remapping. `q-sor-decode-hosterror-codes` is adjacent but is a *diagnosis*
  rubric — about not misreading an error code, not about not rewriting one.
- **`try_*` client semantics** — **GAP CONFIRMED.** Zero occurrences of any `try_*` method across all
  490 files; the only regex hits were the substring inside `contract_data_entry_size_bytes`. Also
  zero hits for `Result<`, "swallow", "silent success", "ignore the Result". Squarely the
  silent-success shape and entirely unpinned.

### Separate corpus defect found while verifying

`q-soroban-unit-testing` carries a **stale pointer to a case that does not exist in the owned
battery**. Its notes delegate: "the failure-path concern (proving an UNAUTHORIZED caller is rejected
— where `mock_all_auths` is the wrong tool) is owned by `q-sor-testing-negative-auth-events`." That
case exists only in the retired, read-only, routing-eval-only prior art at
`eval/corpus/raven-next/research/golden/soroban/`. The owned battery never received it, so the
delegated concern is owned by nothing. Its prior-art `must_haves` cover ground both the event-assert
and auth-error gaps circle. **This is a repo defect independent of the partner team and should be reconciled on
its own.**

## Unanalyzed product risk

The "building with AI" page is what sold him ("very impressed"), install followed the same evening,
and Jane has since told him the feedback goes "to the Raven team". That sequence creates a
correctness expectation which this note's non-goals then disclaim. The gap between what the on-ramp
implies and what the non-goals reserve has not been examined, and it is being carried by a partner
heading into DTCC and SEC processes. The product question — whether the on-ramp promises something
the server does not own — belongs here and is open. The consolidated partner-side handling is in
Solo scratchpad 784.

## Non-goals

- Raven does not become a Soroban linter, auditor, or codegen harness. It is a discovery and
  composition gateway; correctness of generated Rust is not a surface it owns.
- No change to the manifest exposure rule to accommodate a codegen workflow.
- Do not file upstream `improvements/` findings from this report as it stands. The defects are in
  the partner's generated code, not demonstrated in an upstream surface. A finding needs live
  re-execution evidence against a named service, which we do not yet have for any of these.

## What is blocking

- The **per-round bug report** the reporter offered has not been delivered.
- The **agent configuration** referenced above sits in a private repository we cannot read.
- **Attribution is absent.** Nowhere does the report separate defects the model produced with Raven consulted
  from defects it produced unaided. Without that split, "increase correctness" cannot be scoped.
