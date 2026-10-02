# Routing and adapter repairs — 2026-10-02

Lead `raven-next` (Claude Fable 5.1, pane `w3W:p2`). Base `origin/main` `76c7f02b`.
Owner instruction: "go on 1-3 and use /herdr to spawn multiple agents if as when and where needed."
Briefs: `2026-10-02-routing-adapter-repairs/brief-*.md`.

| Lane | TODO item | Worktree / branch | Author (tier, model, effort) | Reviewer |
| --- | --- | --- | --- | --- |
| A | Keep docs page-title keywords from rescuing docs operations on generic words (closes #215 when the title snapshot is absorbed) | `../stellar-raven-codemode-worktrees/lane-a` / `fix/docs-title-keyword-rescue` | Codex frontier, `gpt-6-astra`, high | Grok, `grok-4.7`, high (Codex frontier is the author; Grok is the next match for an assumption attack on a derivation rule) |
| B | Do not return a failed Scout backend read as data | `../stellar-raven-codemode-worktrees/lane-b` / `fix/scout-failed-read-not-data` | Codex workhorse, `gpt-6.1-sol`, high | Codex frontier, `gpt-6-astra`, high (matched tier: dense implementation; not author or orchestrator) |
| C | Repair the matching that let an article carry `scout.listSkills` for one MCP discovery probe | `../stellar-raven-codemode-worktrees/lane-c` / `fix/listskills-article-prefix` | Codex frontier, `gpt-6-astra`, high (second instance) | Grok, `grok-4.7`, high (Codex frontier is the author; Grok is the next match for an assumption attack on a scoring rule) |

Reviewer selection follows AGENTS.md "Model routing": reviewer ≠ author ≠ orchestrator (Fable).

## Panes

Recorded as created. Panes not listed here are not owned by this round.

| Pane | Role | Agent name | Cwd |
| --- | --- | --- | --- |
| `w3W:p1G` | Lane A author | `lane-a-astra` | `../stellar-raven-codemode-worktrees/lane-a` |
| `w3W:p1H` | Lane B author | `lane-b-sol` | `../stellar-raven-codemode-worktrees/lane-b` |
| `w3W:p1J` | Lane C author | `lane-c-astra` | `../stellar-raven-codemode-worktrees/lane-c` |
| `w3W:p1K` | Lane B reviewer | `rev-b-astra` | `../stellar-raven-codemode-worktrees/lane-b` |
| `w3W:p1M` | Lane C reviewer | `rev-c-grok` | `../stellar-raven-codemode-worktrees/lane-c` |
| `w3W:p1N` | Lane A reviewer | `rev-a-grok` | `../stellar-raven-codemode-worktrees/lane-a` |

## Lane log

(filled as lanes report)

### Lane B — author report received

Report: `2026-10-02-routing-adapter-repairs/lane-b-report.md`. Diff: `src/adapters/scout.ts` (new
failed-read branch before `meta.error`, header row), `test/adapters.test.ts` (+12 cases),
`test/smoke/executor.test.ts` (+2 cases), `ARCHITECTURE.md` (mapping paragraph). Matcher
`/^backend read failed(?:\s|:|$)/` over `meta.warnings`; maps to `ok:false`, `kind:"error"`,
`status:200`, hint "retry once, then inconclusive"; rows are discarded when the warning is present.
Author gates: typecheck 0, test 0 (2,377 passed), test:smoke 0 (104), build 0, secrets 0. Upstream
Scout backend source is not public, so the warning family is pinned to the observed prefix only.

Review (`2026-10-02-routing-adapter-repairs/review-lane-b-astra.md`): approve with changes.

| # | Severity | Finding | Reconciliation |
| --- | --- | --- | --- |
| 1 | should-fix | The error envelope kept only the first failed-read warning and dropped the advisory and any second failure warning | Applied: full `meta.warnings` array preserved under `error.details.warnings`; tests assert the advisory and the second failure warning |
| 2 | nit | Docs called `meta.warnings` a string and did not state the matcher boundary | Applied: `ARCHITECTURE.md` and the adapter header describe an element of the string array and the exact case-sensitive boundary |

Reviewer verification of the fixes: approve (84 adapter tests pass, typecheck 0). Commit `eef8cc9d`, PR #219.

### Lane A — author report received

Report: `2026-10-02-routing-adapter-repairs/lane-a-report.md`. Diff: `scripts/build-catalog.mjs`
(`stellarDocsTitleExtras` now takes the assembled catalog and keeps a title token only if it is not
a service-name token and either appears in a searchable operation or skill name or is absent from at
least one other searchable service; the service-frequency filter and cap still apply afterward),
`scripts/build-catalog.d.mts`, `test/title-keywords.test.ts` (five synthetic tests),
`src/catalog/README.md`, `inventory/stellar-docs-titles.json` (651 → 666 titles, live snapshot
absorbed), regenerated `catalog/manifest.json` (keywords on five Docs operations) and
`specs/super-spec.json` (timestamps), `eval/gates.json` (fingerprint, trace, note; legacy top-1
219 → 220 for `q-infra-hubble-vs-rpc-layer`, which moves the RPC/Horizon docs operation from rank 5
to rank 1). Before table (titles absorbed, no code): legacy top-3 297, `search_docs` out of the top
five on the x402 probe, `scout.listSkills` at 4/4/5 on the three skills probes. After: all four
probes back at their 2026-09-29 ranks; zero graded losses across 544 cases; eight alternative rules
measured and rejected (patches under the lane's `tmp/`). Gates: typecheck 0, test 0 (2,370), build
0, eval:selftest 0, routing gate 0, secrets 0.

Review (`2026-10-02-routing-adapter-repairs/review-lane-a-grok.md`): approve with changes. The
reviewer reproduced every number (regeneration byte-identical, gate, probes, flips) and stated the
rule from the code.

| # | Severity | Finding | Reconciliation |
| --- | --- | --- | --- |
| 1 | should-fix | The legacy top-1 gain is a tier artefact: `search_rpc_horizon_data_docs` moves to rank 1 as a backfill promotion at 445 after the stems `history` and `queries` left it; the band tolerates 220 against a 219 baseline, so raising the accepted total is unjustified | Sent back: restore 219 in both fields; describe the movement in the note |
| 2 | should-fix | One entry per service is enough to delete a stem, so real docs topics go (`oracle` leaves the data docs operation; the oracle-pick holdout hit leaves the page); the service set is unstable under adding or removing a service | Sent back: count a stem for a service only with more than one entry or an operation-name match, or a better general criterion; measure the two oracle queries |
| 3 | should-fix | Agent CLI pages match both the SDK/CLI prefix and the Soroban contract prefix `/docs/tools/cli/`, so the contract operation gains `spending`, `pay`, `x402`, `messages`, `authority`, `security`, `model`; "Sign messages" now ranks it first | Sent back: assign each title path to exactly one docs operation (longest prefix) |
| 4 | nit | Four of the five tests pass without the exclusion predicate | Sent back: add a fixture that fails when the predicate is removed |

Author repair (report section 7): legacy top-1 back to 219 with the Hubble movement described as a
backfill promotion; a stem counts for a service only through more than one searchable entry or an
operation name, exclusion needs that evidence from at least two other services, and a stem in the
owning service's descriptions stays eligible; each title path belongs to exactly one docs operation
by longest prefix (segment-bounded, ambiguity throws), with `specs/stellar-docs.json` gaining the
explicit `/docs/tools/cli/agent-cli` prefix on the SDK/CLI operation (inside its existing
`/docs/tools` prefix, so the runtime URL set is unchanged); eleven tests including one that fails
without the predicate. Re-measured: gate PASS with totals identical to `76c7f02b`, zero graded flips
across 544 cases, four probes at baseline ranks, oracle-pick and Reflector queries restored to
baseline, "Sign messages" no longer ranks the contract operation, Hubble back to rank 5. Reviewer
verification: **approve**. The reviewer regenerated the chain byte-identically, confirmed the added
prefix leaves the accepted URL set and every model-visible field except `keywords` (and the
`x-algolia.clientFilter` in `codemode.spec()`) unchanged, checked all 666 titles have one owner with
no equal prefixes, and probed the two-service threshold (one added service changes nothing; the
operation-name clause is currently inert because the id-tail allowlist returns first).

Combined re-gate after rebase onto `d1b46f2f` (lane C's acronym rescue): routing gate PASS with the
lane A fingerprint, zero graded boolean differences between the combined trace
(`routing-2026-10-02T17-13-13-195Z`) and lane A's own trace, eval:selftest 0, typecheck 0,
`npm test` 0 (2,415 passed), build 0. The `eval/gates.json` note now points at the round directory
rather than the lane's temporary report.

### Lane C — author report received

Report: `2026-10-02-routing-adapter-repairs/lane-c-report.md`. Diff: `src/catalog/scoring.ts`
(`prepareAcronymForms` + `acronymRescueScore`: when ordinary lexical coverage fails, score
alternatives that contract three to six consecutive content words to their initials, admitted only
when the entry description contains that uppercase acronym as a token), `test/scoring.test.ts`.
Probe "Are there any model context protocol skills for Stellar?" lists `scout.listSkills` at rank 3
(207); three controls unchanged; gate PASS with totals identical to `main`; zero per-case grade
changes across 532 graded rows. Two alternatives were measured and rejected: a minimum prefix length
of three in the vendor scorer (did not recover the probe; broke all three legacy bands and the
forbidden-capture ceiling; 67 legacy losses) and acronym max-over-alternatives for every entry (one
case lost top-1). Vendor scorer, manifest, gates, inventory untouched.

Review (`2026-10-02-routing-adapter-repairs/review-lane-c-grok.md`): **reject**. The reviewer
reproduced every author number (gate, per-case comparison, probe, and the live re-run of the
rejected prefix-minimum-three variant, which fails all three legacy bands and the capture ceiling).

| # | Severity | Finding | Reconciliation |
| --- | --- | --- | --- |
| 1 | blocker | A span that collapses to one acronym token becomes a one-token query with 100% coverage; "send every payment" ranks `stellarDocs.search_anchor_sep_docs` first at 295 via `SEP`, "recent protocol changes" ranks the RPC docs operation above `scout.getChanges`, and shout-words `NOT`, `ONE`, `ALL` in descriptions act as witnesses (twelve false positives tabled) | Sent back to the author: require a leftover matching content token outside the span; reject ordinary-word witnesses |
| 2 | should-fix | An entry with an ungated score can gain a lower gated score (SAC entry 812 ungated → 322 gated, moving it off rank 1) and an existing ungated score is maxed with the acronym form, contrary to the comment | Sent back: never mint a lower gated score or max an existing ungated score; fix the comment |
| 3 | should-fix | Tests pin the pure collapse (`"domain name system"` equals `"DNS"`) and the probe only at limit 5, not the default 10 | Sent back: pin the false-positive rejections, the SAC score split, and limit 5 and 10 |
| 4 | nit | `src/catalog/README.md` omits acronym rescue | Sent back |
| 5 | nit | Acronym forms are uncapped (4N−14 forms for N eligible tokens) | Sent back: cap forms or input tokens |

Author repair (report section 7): an acronym form now needs at least one content token outside the
span that overlaps the entry id, name, or description; a lowercase acronym that is an English
stopword, quantifier, number word, or emphasis word is skipped; the ungated path no longer uses
acronym forms and a gated rescue is admitted only when it is at least the entry's ungated score;
forms are capped at 32; README sentence added; tests replaced to pin the twelve false-positive
rejections, the SAC score split (ungated 812 kept, gated null), and the probe at limit 5 (rank 3)
and the default limit 10 (rank 5). Re-measured: gate PASS with totals identical to the pinned base,
zero graded changes across 532 rows, all twelve reviewer queries back to their lexical rank-1
entries. Reviewer verification: **reject** again; the five findings are resolved and two residual
findings remain.

| # | Severity | Finding | Reconciliation |
| --- | --- | --- | --- |
| 6 | should-fix | Acronym context uses `tokensOverlap`, whose 75% prefix branch accepts `stella`/`stellar`, `searc`/`search`, `toke`/`token`; "send every payment stella" admits the SEP docs operation at gated 183 above the lexical hits | Sent back: exact equality after `canonicalRoutingToken`; test pins the query |
| 7 | nit | `ACRONYM_WORDS` misses shouted ordinary words (`SAME`, `LIST`, `PEOPLE`, `BUILD`, `FULL`, `SKILL`, `ANSWER`, `NAMED`, `BUILT`, `SUPPLY`); "send alpha model every lumenloop" admits `lumenloop.list_documents` via `SAME` | Sent back: prefer a data-driven witness rule (reject an acronym whose lowercase form occurs as an ordinary token in catalog text), list extension only as fallback |

Second author repair (report section 8): acronym context now requires equality after
`canonicalRoutingToken`; the witness exclusion is data-driven (`src/catalog/search.ts` derives the set
of words that occur as lowercase prose in any catalog description or terminal name, cached per
catalog, and query preparation rejects an acronym whose lowercase form is in that set), so the static
list did not grow; tests pin the three prefix queries, the `SAME` query, and a valid plural context.
Re-measured: gate PASS, zero graded changes, probe at rank 3 (limit 5) and 5 (limit 10), the four
reviewer queries back to lexical rank-1 entries. Reviewer verification 2: **approve**. The reviewer
confirmed the cache is keyed by catalog object (a rebuilt catalog misses it; the loader parses once
per isolate), measured the hot path (first search 5.8 ms, later searches 2.4 ms), listed the derived
word set (627 words; it holds `rpc`, `cli`, `sdk`, `docs` and not `sep`, `mcp`, `scf`, `sac`), and
showed exact-context admissions behave as intended ("send every payment anchors" admits the SEP
docs operation; "send every payment on stellar" does not).

## Merge, deploy, receipt

### Lane B — PR #219

Squash-merged as `af740db5` after CI green (CodeQL, secrets, test). Deployed from a clean detached
worktree at `af740db5`: Worker Version `6d9e65f0-7496-4ebc-bb65-d23ad49e2ebc`; postdeploy usage
check passed. Release measurement: the new path only fires on a Scout failure warning that normal
traffic rarely produces, so a live QA run would not exercise it; the assembled-worker smoke tests
inject the failure in the real service-response position (zero rows and surviving rows) and pin
what the agent sees (error envelope, hint, ledger `error: 1`, evidence `service-inconclusive`).
The author's recommended matched live-QA diagnostic is recorded in its report for the owner to run
if wanted.

### Lane C — PR #220

Rebased onto `af740db5` (`1418383d`), CI green, squash-merged as `d1b46f2f`. Deployed from a clean
detached worktree at `d1b46f2f`: Worker Version `e05cc8ec-a5a0-42f0-83f4-e07f6f12e520`; postdeploy
usage check passed. Release measurement: the routing gate and the 532 graded rows are the
model-facing instrument for a scorer change and showed zero changes; the probe gain is outside the
graded battery by design.

### Lane A — PR #221

Rebased onto `d1b46f2f` (`9acbe399`), CI green, squash-merged as `e104e87f`. Deployed from a clean
detached worktree at `e104e87f`: Worker Version `0bf19507-b714-4731-92b0-c5dd894e4271`; postdeploy
usage check passed. Issue #215 receipt comment posted; the issue is closed. Release measurement: the
routing gate on the combined tree (zero graded changes) and the four drift probes are the
model-facing instrument for a keyword-derivation change.

### Production verification — 2026-10-02 17:19Z

Worker Version `0bf19507` serves 100% of traffic (created 2026-10-02T17:17:10Z). Authenticated
`search` through the Raven connector, `limit: 5`:

| Query | Result |
| --- | --- |
| Are there any model context protocol skills for Stellar? | `scout.listSkills` rank 3, score 207, gated (absent on `main` before #220) |
| Stellar skills for signing messages | `scout.listSkills` rank 3, score 166, gated; `stellarDocs.search_sdk_cli_tools_docs` rank 4, score 153 |
| How do x402, MPP, AP2, and ACP compare for agent payments, and which are Stellar-specific vs general? | `stellarDocs.search_docs` rank 3, score 326, backfill |

Lane B's path (a Scout failure warning) cannot be triggered on demand without a burst, which the
brief forbids; its behavior is pinned by the assembled-worker smoke tests.

## Round outcome

All three TODO items landed and deployed on 2026-10-02: PR #219 (`af740db5`, Version `6d9e65f0`),
PR #220 (`d1b46f2f`, Version `e05cc8ec`), PR #221 (`e104e87f`, Version `0bf19507`). Issue #215 is
closed. The three TODO items are retired in this receipt PR, and the drift ledger
`2026-10-02-drift-scout-1.9.61.md` records the lifted hold. The paired QA freeze was not active
(earliest launch 2026-10-03T00:00:00Z, plan unsigned); the launch revision will include these three
changes if the owner signs.

Reviewer record (AGENTS.md "Model routing"): lane B author Codex workhorse → reviewer Codex frontier
`gpt-6-astra` high (matched tier for implementation; one round, approve with changes → approve).
Lanes A and C author Codex frontier → reviewer Grok `grok-4.7` high (frontier tier was the author;
Grok is the next match for an assumption attack; lane A one round, lane C two rounds, both approve).
No xhigh escalation was needed.

