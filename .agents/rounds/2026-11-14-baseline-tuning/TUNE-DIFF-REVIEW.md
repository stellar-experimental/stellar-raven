# Independent review: tuning loop 1, the two arm diffs

Reviewer: Claude Opus 5.5 (`claude-opus-5-5`), a fresh Claude Code session (hc `t1p0`). The
matched tier for a product and API change is Claude Fable. The orchestrator is Claude Fable 5.2,
so it was skipped and the review falls back to Claude Opus, as AGENTS.md says. Author: Claude
Sonnet 5.5. Scope: commit `a321c5b7` (arm 1) and commit `3eb40f56` (arm 2) on `tune/loop-1`, read
against `origin/main` (`efb236e1`). Since `6ce86dce`, `origin/main` has not changed anything under
`src`, `test`, `scripts`, `catalog`, `eval/gates.json` or `package.json`, and the branch merges onto
it with no conflict. I read TUNING-PLAN.md, TUNING-PLAN-REVIEW.md, TUNING-PLAN-AMENDMENTS.md and
TUNE-IMPL-1.md first. I made no model call and no paid call.

## Verdicts

**Arm 1 (`a321c5b7`): fit to measure.** No blocking finding. One condition applies before the paid
arm 1 run, and it costs nothing: the live Docs check (section 6) is still unverified. Run one keyed
`execute` on the arm 1 measuring server before collection starts, and stop if the checkpoint does
not show the sentence.

**Arm 2 (`3eb40f56`): fit to measure** (the A5 behaviour read). No blocking finding. I tried to get
a citing row, a wrong-number row, a lookalike slug and a non-spec source marked exact. Every
citing row, every wrong number and every lookalike in the A5 shape was refused. A few contrived
shapes do come back exact, and none of them can occur on the five A5 rows. N7 has an optional
one-line fix.

The non-blocking findings follow (N1 to N10), each with its fix. None of them changes a measured
row, so none has to land before the runs.

## 1. Generality and the owner rule

- **No case vocabulary in a product path.** I searched the added product lines (`src`, `scripts`,
  `catalog`) for case ids, panel-row vocabulary and identifiers. There are two hits, and both are
  examples in prose: a type comment in `src/adapters/types.ts` ("for example `sep-0043`") and the
  public page `src/site.ts` ("for example `SEP-43`"). Neither is read by the matcher. Neither is in
  the MCP surface, whose surface hash stays `b336fa14…3404`, as the implementer measured. See N9.
- **Arm 1** is one relation that the catalog checks. `detailJoinKeys` requires that the target is
  on the detail lane, that it has required inputs, and that the source's row items carry every one
  of them. It is defined in one place, `src/catalog/detail-relation.ts`, and used by the build, the
  manifest check and the execute walk. The sentence is generated from the edge. The family has no
  per-source boost.
- **Arm 2** is identifier agreement only: the token in the query, the row's `source` and the URL
  slug must agree. It has no list of standards and no per-series constant.
- **Can either arm cost another category?** Arm 1 fires on any Docs search that returned rows, in
  every category. That reach is its hypothesis, and K1 to K5 and the A7 K4 cost flag (cost per
  answer up more than 20%, or median turns up more than 1) measure it. Arm 2 also applies to the
  Lumenloop semantic lane, so it reaches categories outside the evidence it was built on (N8). In
  the live replay of the stored queries, it marked rows only on queries that named a SEP or CAP
  that exists (TUNE-IMPL-1 section 4).

## 2. Arm 1

| Check | Result |
|---|---|
| Sentence matches A7 | **Yes.** Rendered for `stellarDocs.search_docs`, it equals A7's text exactly (string compare, 286 characters). |
| Committed before any golden-reading check (A9) | **Yes, as far as git can show.** Every arm 1 commit in this worktree's reflog, from the first (`ea0ffe42`, 21:03Z) to `a321c5b7`, holds the same sentence hash. `evidence-checkpoint.ts` has not changed after `a321c5b7`. Git cannot prove when goldens were read. It does not need to: the text is A7's frozen wording, word for word, so no read could have shaped it. |
| Fires only after Docs searches that returned rows | **Yes.** I probed `evidenceRecoveryHint` directly. A Docs search with rows gets the pointer. A Docs search with no rows, a soft-empty, an error, a research call, and a search followed by a page read (even a failed one) get none. A title search, or an unprofiled operation plus a Docs search, gets a `detail-only` checkpoint, where `main` showed no checkpoint at all. That is plan step 5, as intended. |
| Displaces none of the three alternatives | **Yes.** `walkRecoveryCandidates` skips `detail` edges. The other `recoverWith` walks are unaffected. `catalogDirectoryAnchors` reads only directory-lane sources. `catalogBroadAnchors` counts only targets on broad lanes, and `detail` is not one of them. The `widerCandidates` filter reads only `broader-semantic`. All 544 routing rows are identical (section 5). |
| Playground rule and test | **Yes.** `src/demo/tools.ts` counts and reserves the cycle only when the hint has alternatives. A detail-only hint takes the `else` branch, the same as `main` with no hint, so a pending hint never survives into `prepareDemoStep`. The smoke test drives three executes: (1) a detail-only hint, after which the cycle is not spent, `recoveryHintedExecutes` is 0 and the step note has no alternatives; (2) an alternatives hint that is still shown, with the pointer first; (3) a later hint whose alternatives are suppressed while its pointer stays. Against `main`'s handler the first execute would spend the cycle, so the test fails at (1). I established this by reading the code, not by running it. |
| Characters per result | One source operation: +287 beside alternatives, +316 for detail-only (with the 30-character header). Two Docs search operations in one execute: 328 for the sentence. All 11 at once: 664. Results with no Docs search that returned rows are unchanged. No tool description or instruction text changes. |

Non-blocking:

- **N1. A second model-visible channel.** `codemode.describe(id)` and `codemode.catalog()` return
  `retrievalProfile` (`src/executor/providers.ts:681`, `:713`). For the 11 Docs search operations
  they now include `{ id: "stellarDocs.get_doc_page", relation: "detail", on: ["partial"] }`.
  TUNE-IMPL-1 says "everything else in a result is byte-identical". That is true of `execute` text
  and false of `describe` and `catalog` results. Fix: none to the code. Record it in the ledger.
  Under A1 K5, treat a page read that follows a `describe` of a Docs search op as a path the arm
  opened.
- **N2. Fixed nouns in a general relation.** The sentence hardcodes "sections of pages, not whole
  pages". For `search_doc_titles`, which returns page-level titles, it is slightly inaccurate. The
  advice still holds. A future non-Docs `detail` edge would also say "pages". A7 froze the wording,
  so leave it for this loop. When a second family gets a `detail` edge, generate the nouns from the
  edge.
- **N3. Unused trigger.** The edges' `on: ["partial"]` is ignored by `detailTargetsFromSources`.
  It is cosmetic. Leave it, or note in `src/catalog/README.md` that `detail` edges do not read `on`.
- **N4. Provenance of the re-baseline.** The `eval/gates.json` note names no independent review,
  while the earlier notes do. Fix at merge: append "Independent review: Claude Opus 5.5,
  TUNE-DIFF-REVIEW.md".

## 3. Arm 2

| Check | Result |
|---|---|
| Identifier agreement only, no `exactKeys` branch | **Yes.** `exactRowsOf` never reads `exactKeys`. A unit test proves that a row with `exactKeys: ["SEP-43"]` and slug `sep-0060` is not marked exact. |
| A4 sentence | **Yes,** word for word, generated from the operation, the key and the URL. It is unchanged since its first commit (`8d16c7c7`, 21:08Z). See N6. |
| The two A4 unit cases | **Present.** A row with non-empty `exactKeys` and a slug that does not match is not exact. A matching row whose chunk lacks the preamble is exact. |
| Adversarial inputs | See the table below. |
| A result with no exact row is byte-identical to `main` | **Yes, end to end.** I ran the same probe file on `origin/main` and on the arm 2 tip, in workerd through the real runner, with these research results: a citing row only, no identifier, and a wrong number. The result text, `SOURCE METADATA` footer, outcome keys, operation summary, hint and candidate block were byte-identical after timestamps and milliseconds were normalized. The envelope keys stay `ok, data, asOf, asOfBasis, caveat`. |
| The additive `exactRows` breaks no consumer | **None found.** No skill runner, eval or usage script, or telemetry consumer enumerates or strictly validates envelope keys. The sandbox envelope guard lists `exactRows` as an envelope key. The documented envelope strings (`describe` usage, server instructions, the playground hint) are unchanged on purpose. Smoke tests pass. |

Adversarial run: `exactRowsOf(entry, { q }, data)` on the arm 2 tip, with my inputs. "none" means
no exact row.

| Input | Result |
|---|---|
| Citing row: slug `sep-0060`, content and title name SEP-43 | none |
| Citing row: `sep-0060.md?ref=sep-0043`, `sep-0060.md#sep-0043`, `…/sep-0043/sep-0060.md` | none |
| Citing row: `exactKeys: ["SEP-43","sep-0043"]`, slug `sep-0060` | none |
| Wrong number: rows `sep-0430` and `sep-0004` for SEP-43; queries SEP-430, SEP-4 and SEP-43a against `sep-0043` | none |
| Lookalike: `sep-0043.md.bak`, `sep-0043-draft.md`, `sep_0043.md`, `sep%2D0043.md`, Cyrillic `ѕep-0043.md`, source `"sep "` | none |
| Non-spec source: source `cap` with slug `sep-0043`; Lumenloop source `stellar.org`; the Docs corpus lane | none |
| Query `CVE-2024-1234`, row source `cve`, slug `cve-2024` | **exact** (`cve-2024`). See N7 |
| Query `SEP-43.1`, or `SEP-0043-v2`, with row `sep-0043` | **exact** (`sep-0043`). Arguably right: no other document has that name |
| Source `sep`, slug `sep-0043` on another host (`https://evil.example/fork/sep-0043.md`) | **exact.** The URL is quoted in the block. See N8 |
| Source `sep`, URL `…/sep-0060/assets/sep-0043` | **exact.** Contrived |
| Same-label non-spec sources: `blog`/`blog-12` for "blog 12", Lumenloop `scf`/`scf-36` for "SCF 36", `protocol`/`protocol-23` for "Protocol 23" | **exact.** See N8 |
| `http://` URL | exact, with no URL quoted, as designed |
| 7 identical matching rows | capped at 5, as designed |
| Decoy first array `related: [sep-0043 row]` before `results` | exact, with the index into `related`. See N10 |

Non-blocking:

- **N5. Footer and telemetry carry upstream URLs.** The ledger's `exactRows` (up to 5 https URLs of
  at most 200 characters) flow into the `op` log event and into the `calls.first` telemetry. The
  URLs are public and pass the redaction of `data`. The model-facing footer carries only keys.
  Fix: none needed. Note it if a telemetry field policy says otherwise.
- **N6. "That row" when a call has several exact rows.** The rows are joined with `; ` inside one
  sentence, so a call with 2 or 3 exact rows says "That row is the document itself". The live
  replay found that in 4 of its 17 exact calls, all from `q-protocol-version-history-list`, which is
  not an A5 row. Fix, optional: render one A4 sentence per row in `exactEvidenceSentences`. The
  wording stays verbatim.
- **N7. A multi-part identifier can match its prefix.** `IDENTIFIER_TOKEN_RE` stops at the first
  run of digits, so `CVE-2024-1234` yields `cve`/`2024`. That needs a row whose slug is exactly the
  prefix, which no live Scout row is known to have. Audit rows are the owner's first-ranked
  category, though, so the fix is cheap insurance:
  `/\b([A-Za-z]+)[- ]?(\d+)\b(?![-.]\d)/g`, plus a unit case. None of the A5 queries quoted in TUNE-IMPL-1 section 4 has a dash or dot followed by a digit
  after its identifier. Confirm that on the full stored strings before applying it. If applied
  before the A5 read, re-run the arm 2 gates and record the revision.
- **N8. The trust anchor is upstream's `source` label, not the URL host.** A fork or mirror that
  upstream labels `sep` is marked exact, and so is any row whose label equals the query's letters
  and whose slug matches (`scf-36`, `protocol-23`). Lumenloop labels are domains or channels
  ("stellar.org"), which contain a dot and never match, so that path is mostly closed in practice.
  This is the rule as designed: "canonical slug plus source". Fix: none for this loop. Record it in
  ARCHITECTURE's paragraph ("the host trusts the upstream source label; it does not check the URL
  host").
- **N9. A target's identifier as a prose example.** `src/site.ts` and the comment in
  `src/adapters/types.ts` use SEP-43, the identifier of the panel target `q-sep-43-web-wallet-api`.
  It is not model-facing and not in the matcher. Fix, optional: "for example a SEP or CAP number".
- **N10. The envelope does not name the rows array.** `index` counts in the first top-level array
  whose items carry `source` and `url`. For `scout.searchResearch` that is `results`, the only
  array. No fix needed now. If a candidate operation with two such arrays appears, add the array
  key.

## 4. Envelope, error and soft-empty contracts; secrets; egress

- Error and soft-empty envelopes are unchanged. `exactRowsOf` runs only on the ok branch, and the
  detail walk reads only ok calls that returned rows. `caveat` keeps its vocabulary and the rules
  for when it is set. `data` is untouched (unit test and the identity probe above).
- No change to `wrangler.jsonc`, `src/auth`, `src/policy/redact.ts`, `src/policy/guard.ts`,
  `src/adapters/index.ts` or `specs`. `globalOutbound` is untouched. No secret enters the sandbox
  or the output. `npm run secrets:scan -- --tree` is clean on both tips.

## 5. `eval/gates.json` re-stamp

It follows the run-evals rule: a named, legitimate reason, updated in the same commit, zero
hit-to-miss regressions, provenance filled. I verified it rather than taking it from the record. I
ran `npm run eval:routing` on `origin/main` and on `a321c5b7` and compared every case row in
`cases`, `extendedCases`, `skillsCases`, `holdoutCases` and `protocolHistoryCases`: **544 of 544
identical**. `overall`, `perService`, `acceptEitherOverall` and every lane total are identical. Only
`manifest` (the fingerprint) and `ranAt` differ. The arm 2 tip gives the same rows. The manifest
regenerates from `node scripts/build-catalog.mjs` on `a321c5b7` with no diff. The new fingerprint
`c0c821fb…5e9d` matches `gates.json`. See N4 for the missing reviewer line.

## 6. Arm 1's live Docs check

**Not verified. It remains open.** I copied `/home/tyler/code/raven-wt/gca/.dev.vars` into a
scratch worktree at `a321c5b7` without printing it. Its `DEV_ALLOW_UNAUTHENTICATED` was not `true`,
so I set that one line to `true` in my copy. I ran my own `npm run dev:eval -- --port 8811` as hc
child `t1p4`, then stopped it and restored the placeholder file. Every `stellarDocs.search_docs`
call returned `Unauthorized` (`stellarDocs.search_docs=error/174ms [http-401]`). That key does not
authorize Mintlify either, which is the implementer's result. As designed, no checkpoint was
emitted for a failed call.

What remains unverified is that the pointer renders on a real Mintlify response: real
`hits[].path` values, `hasServiceData` true on a live hit page, and no interaction with live
truncation. The workerd smoke tests cover the code path with a stubbed Mintlify. Condition for the
paid arm 1 run: on the keyed arm 1 server, before `run-qa.mjs`, run one free `execute` of
`stellarDocs.search_docs` alone and confirm that the result contains "returned sections of pages,
not whole pages". Then run a search followed by `get_doc_page` and confirm the sentence is absent.
That run also showed `scout.searchResearch` working with the gca file. On arm 1 it had no
`exactRows`, as expected.

## 7. Each arm reverts alone

On a scratch checkout of `c9c9f63a`, I reverted each arm commit on its own, with the other arm and
every later commit in place:

| Reverted | Conflict | typecheck | test | test:smoke | routing gate | build |
|---|---|---|---|---|---|---|
| `a321c5b7` (arm 1) | none | 0 | 0 | 0 | 0 | 0 |
| `3eb40f56` (arm 2) | none | 0 | 0 | 0 | 0 | 0 |

## 8. Gates on each arm tip, run bare, exit codes

| Tip | typecheck | test | build | test:smoke | `eval:routing -- --gate` | `secrets:scan -- --tree` |
|---|---|---|---|---|---|---|
| `a321c5b7` (arm 1) | 0 | 0 (3426 passed, 3 expected fail, 2 skipped) | 0 | 0 (142) | 0, GATE PASS | 0 |
| `3eb40f56` (arm 2; same code as `c9c9f63a`) | 0 | 0 (3443 passed, 3 expected fail, 3 skipped) | 0 | 0 (143) | 0, GATE PASS | 0 |

Both first `npm test` runs were made with the two tips running in parallel. Each failed 2 tests on
the 5-second timeout: `test/gateway-judge.test.mjs` ("pins model, effort…") and
`test/qa-paired-verdict.test.mjs` ("runs reduced deterministic…"). Run alone, both tips exit 0, so
the failures came from machine load and are not a defect. The first arm 1 typecheck failed because
my scratch worktree had no generated `env.d.ts`. After `npm run typegen` (byte-identical to the
branch's) it exits 0. The table shows the clean runs.

## What I did not check

- The panel scan and the 50-row table (commits `ce80303b` and `38a43209`), and the replay tests'
  numbers. Both were outside this review's scope. I did not open any stored results file.
- Arm 2's live Scout replay. I relied on the implementer's record and on my own unit and identity
  probes.
- `.agents/TODO.md` (`f3c05347`).

The probes I wrote (`zz-review-*`) ran in scratch worktrees and are not committed.
