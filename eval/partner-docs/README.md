# Partner-doc retrieval diagnostic

This todo-910 lane measures whether a fixed, code-allowlisted set of public partner Markdown
pages contains facts that Raven's current sources do not retrieve on the same question. It is a
diagnostic source-admission instrument, not the headline QA eval and not a production routing map.

Run against an existing local Raven `dev` pane:

```sh
npm run eval:partner-docs -- --raven-url http://localhost:8787/mcp
```

The harness makes only read-only GETs to URLs declared in `cases.json`. Code-owned validation
restricts Alchemy to `https://www.alchemy.com/docs/**/*.md` or admitted `llms.txt` files and
OpenZeppelin to MDX below the `OpenZeppelin/docs` Stellar/Relayer content roots. Redirect targets,
content type, UTF-8 decoding, and a 256 KiB per-document cap are enforced. It never connects to a
partner MCP server and never calls an API described by the fetched documentation.

The CLI validates the complete suite before the fetch loop starts. The fetch helper applies the
same URL allowlist to each request and redirect target.

Measured OpenZeppelin case URLs are commit-pinned; each result records `resolvedCommit` alongside
the body SHA-256. Any Raven baseline error makes the retrieval gate `inconclusive` rather than
silently shrinking the comparison denominator.

## 2026-07-10 baseline

Canonical diagnostic run: `2026-07-10T03:15:21.411Z`, local Raven at `7cf6213`, eight cases / 64
fact groups. Current-Raven arm used one fixed relevant operation or mirrored skill per case;
candidate arm fetched one admitted first-party Markdown/MDX page. Both arms were scored with the
same literal fact-group matcher.

| Case | Current Raven | Candidate docs |
| --- | ---: | ---: |
| `alchemy-stellar-data-overview` | 0/8 | 8/8 |
| `alchemy-stellar-transfers` | 1/8 | 8/8 |
| `alchemy-stellar-balances` | 0/8 | 7/8 |
| `alchemy-stellar-rpc-quickstart` | 5/8 | 8/8 |
| `openzeppelin-stellar-suite` | 1/8 | 8/8 |
| `openzeppelin-smart-account` | 0/8 | 8/8 |
| `openzeppelin-stellar-rwa` | 0/8 | 8/8 |
| `openzeppelin-stellar-relayer` | 0/8 | 8/8 |
| **Total** | **7/64 (10.9%)** | **63/64 (98.4%)** |

Suite validation admitted every candidate URL. Candidate fetches had zero errors, prompt-signal
matches, or content-type violations. Median document fetch was 46.0 ms and p95 was 172.4 ms in
this single local run. The retrieval-admission threshold passed (+87.5 percentage points, eight
wins, zero regressions).

### What the current-Raven arm does and does not include

Read the 10.9% with its scope attached, because the column header overstates it. The arm calls
**one operation per case** from the restricted set the suite schema allows: three
`stellarDocs.search_*` operations and two mirrored OpenZeppelin skill reads. The entire Scout
family is outside that set — including `scout.searchResearch` (vector search over the Stellar
research corpus) and `scout.getPartners` (the published ecosystem partner directory), which are the
lanes a real agent would reach for on a provider-roster question.

So the figure measures *Raven minus its research lane*, not Raven. Three consequences:

- The +87.5 point delta is an upper bound on the real gap, not a measurement of it.
- The run predates [stellarlight#657](https://github.com/Stellar-Light/stellarlight/pull/657)
  (merged 2026-07-21) by eleven days. That PR added a `data-providers` research anchor aimed, in
  its own words, at "stellar-raven#18's exact case" — the `alchemy` query that surfaced
  event-ingest guides instead of the Providers and Indexers roster docs. The lane it improved is
  the one this arm never calls.
- **It is stale inside the lane it does call.** `stellar/stellar-docs#2573` merged 2026-07-14 and
  was live-verified 2026-07-15 (`sd-010`), four and five days after this run. Its corrected Alchemy text sits at
  `/docs/data/indexers`, inside `search_rpc_horizon_data_docs`'s `/docs/data` prefix, and five of
  the eight fact groups for `alchemy-stellar-data-overview` — recorded here at 0/8 — now appear
  verbatim in that single bullet. That is rendered-HTML scoring, so read it as an indication of
  staleness; only the baseline operation itself can measure the arm.

A phase-1 pass therefore needs a baseline that can reach the research lane **and** a live re-measure
of the current-Raven arm across all 12 cases. The 2026-07-10 per-case numbers cannot serve as the
comparison arm.

### The one MISS is a case-authoring defect, not a source gap

`alchemy-stellar-balances` scores 7/8 because of the group
`["data envelope", "results under a data envelope"]`. The word "envelope" appears **zero** times on
`get-stellar-balances.md`; the phrase lives on the sibling overview page. The balances page does
document the wrapper — its OpenAPI block has `required: [data]` with `data.balances` — just never
in those words.

The fact is true of the endpoint; the group asks one page for another page's prose. Left unchanged
deliberately, so the canonical 2026-07-10 comparison stays intact — but "reproduced 63/64 exactly"
therefore reproduces a known authoring defect alongside genuine source stability, and the two should
not be read as one result. Repointing or widening that group is a maintainer call.

This is deliberately not a ship result. The cases were derived from the candidate pages, Raven's
arm did not get an answering agent or multi-query recovery, one run does not establish reliability,
and the narrow prompt-signal scanner is not a security proof. The paired end-to-end QA, resilience,
drift, and security gates in `research/partner-doc-source-onboarding.md` remain unrun, so the harness
reports `headlineQaGate: not-run` and `shipDecision: do-not-ship-runtime-adapter`.

## Case cohorts and the phase-1 floor

Every case carries a `caseType`. `page-derived` marks the 2026-07-09 cohort, written by reading the
candidate page — the weakness the ship gate calls out by name. `paraphrase`, `negative`, and
`conflict` mark **independent** cases, whose information need came from somewhere other than the
candidate page; each records that origin in `provenance` so a reviewer can check the claim instead
of trusting it.

Phase 1 asks for at least four independent cases. That floor is now enforced in
`summarize()` (`PHASE1_MIN_INDEPENDENT_CASES`), not just written down here: a suite that has not
been expanded reports `fail`, and page-derived cases cannot backfill the count. `npm test` also
asserts the committed suite stays above the floor and keeps all three independent kinds present.

**What `caseType` does not do.** It classifies the information need behind the question. It does
not change the rubric: fact groups in *both* cohorts are literal strings drawn from the candidate
page, so a near-perfect candidate score is expected for any case and is not evidence of
generalisation. `provenance` is a human-reviewable claim, not a machine-checked one. Treating a
100% independent-cohort score as a result would be reading the instrument backwards.

**Absence claims in `provenance` must say how absence was established.** Several independent cases
turn on one — "no Stellar-side source states this", "the pinned skill mirror carries neither" — and
that is the shape of claim most easily got wrong. Cf.
[stellarlight#447](https://github.com/Stellar-Light/stellarlight/pull/447) →
[#448](https://github.com/Stellar-Light/stellarlight/pull/448) (2026-07-10), where a negative grep
over a text-stripped, data-rendered page produced a false negative about a tier-1 validator
listing and had to be retracted: a negative grep over fetched HTML is not evidence of absence. The
absence claims here are scoped to named pinned artifacts and a named operation set rather than to
the ecosystem, and the paired `--raven-url` run is what actually tests them.

## 2026-07-31 expansion and candidate re-measurement

Four independent cases were added, taking the suite to 12 cases / 96 fact groups:

| Case | Kind | Why it is independent |
| --- | --- | --- |
| `alchemy-stellar-nfts-filter-exclusivity` | negative | The correct answer is a refusal — `contractId` and `assetCode`/`assetIssuer` are mutually exclusive — that no Stellar-side source states. |
| `alchemy-data-api-versus-rpc-product-split` | conflict | The two-product conflation this lane's design doc warns about: different host, auth scheme, and protocol. |
| `openzeppelin-fee-abstraction-token-fees` | paraphrase | A dapp-team capability question about a package none of the three mirrored skills document. |
| `openzeppelin-sponsored-fee-token-scope-conflict` | conflict | Two first-party OpenZeppelin surfaces with different scopes; answering from either alone is wrong. |

Candidate-arm run `2026-07-31T14:26:33.718Z`: 15 fetches over **10 unique documents**, 144,396 bytes
transferred (98,824 unique — the harness scores each case on its own sources and does not cache).
Only two documents are new since the eight-case cohort: `get-stellar-nfts.md` and
`fee-abstraction.mdx`.

| Cohort | Candidate docs |
| --- | ---: |
| Eight page-derived cases | 63/64 (98.4%) |
| Four independent cases | 32/32 |
| Pooled | 95/96 |

Suite validation admitted every candidate URL. Fetches had zero errors and zero prompt-signal
matches.

**The pooled row is not 96 independent measurements.** The suite scores 96 fact groups but only
**85 distinct** ones: a conflict case deliberately re-checks strings its single-page siblings
already cover. `summarize()` now reports `distinctFactGroups` beside `totalFacts` so that
duplication is visible rather than flattering. In particular
`alchemy-data-api-versus-rpc-product-split` scores the `data envelope` group as a HIT purely
because it fetches three concatenated documents, converting the cohort's one MISS into a pass
without new evidence.

Latency is not measurable from these runs. Three identical 15-fetch runs gave p95 480 ms, 749.8 ms,
and 243.6 ms (medians 47.3, 158.3, 67.8). That is network noise, not a property of the corpus, and
it is not comparable with the 172.4 ms recorded above.

The page-derived cohort reproduced its 2026-07-10 score **exactly**, 21 days later, with every
pinned and unpinned URL still resolving. Read that as candidate-side source stability only — and
with the authoring defect above attached. It says nothing about the baseline side, whose corpora
both changed in the same window.

**This run does not advance the gate.** No local Raven was available, so the baseline arm did not
run: `baselineCases: 0` and the gate is `inconclusive` by design, never a silently shrunken
comparison. Phase 1 stays unmet until someone re-runs the paired arms with `--raven-url` over all
12 cases. Phases 2–4 remain unrun.

Two things that re-run must account for, or it will not be a phase-1 result either:

- **Widen the baseline** so it can reach the Scout lane; the current enum cannot express the
  comparison a real agent would make.
- **Do not reuse the 2026-07-10 numbers.** Both baseline corpora were replaced afterwards. The
  `stellarDocs` index is live and was never snapshot-pinned — a standing non-reproducibility. The
  mirrored skill pin moved from `d72005b5` (2026-04-14) to `6f215af6` (2026-07-15) in commit
  `42be531`: `develop-secure-contracts` `SKILL.md` went 13,227 → 14,509 bytes, so
  `openzeppelin-stellar-rwa` is not comparable to its recorded 0/8, while `setup-stellar-contracts`
  is byte-identical and `openzeppelin-stellar-suite` / `openzeppelin-smart-account` stay exactly
  reproducible.

One limitation worth stating plainly: a literal fact matcher can only show that both sides of a
`conflict` case are *retrievable*. Whether an answering agent keeps them apart — rather than
merging them into one synthetic claim — is exactly what phase 3 measures, and this harness cannot
stand in for it.
