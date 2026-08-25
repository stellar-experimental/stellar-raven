# eval/corpus — vendored golden-question source material (archival)

Captured 2026-07-02 ahead of retiring the `stellar-raven`, `stellar-raven-next`, and
`raven-golden-qa` sibling checkouts. Everything here is **read-only archival input**:
codemode's eval case formats stay our own (spirit, not schema — see `eval/qa/README.md`).

> **Scope (as of 2026-07-11).** The QA battery is **owned** at `eval/qa/corpus/` and is no
> longer compiled from these snapshots; they remain the **routing eval's committed label
> source** (`eval/compile-routing.mjs` reads `raven-golden-qa/big.json` and `raven-next/`)
> and archival prior art. **Mining them for gospel is prohibited** — the owned corpus plus
> `eval/qa/corpus/migration-ledger.json` are the truth record.

## What's here

### `raven-next/research/golden/` — the canonical 538-case golden corpus

Verbatim copy of `stellar-raven-next/research/golden/` at repo commit
`a3aaa2d8cca6b9026912c2f1c902c63a2dfc12f8` (last corpus-touching commit `ed34114`, 2026-06-29;
copy verified byte-identical with `diff -r`).

- `<category>/q-*.md` — 538 per-question files. **Frontmatter is the full label superset**
  (`expected_cards`, `acceptable_cards`, `forbidden_cards`, `expected_service`, `should_fire`,
  weighted rubric, `must_cite`, `pass_threshold`, freshness). Markdown bodies are the cited
  reference dossiers — the human-auditable "gospel" each rubric was derived from.
- `compiled/golden.json` — the compiled artifact (verified current with the md tree at capture:
  538/538 id parity, compiled commit at/after last source commit, content spot-checked).
- `README.md`, `_template.md` — the corpus spec + authoring skeleton (scoring model, controlled
  vocabularies, ban policy, authoring rules).
- `_meta/` — TAXONOMY/CATALOG/CARDS, GENERATION-BRIEF + ANSWERING-BRIEF (the corpus-growing
  method), `compile.mjs`/`build-index.mjs` (reference only), and `_prior-art/` — the
  **reconciliation trail** proving which external question collections were absorbed:
  - `review-cf-flue.md`: the cf-flue battery — 28/36 COVERED, 3 NEW adopted (x402 lane,
    contract-source-verification, smart-account-kit lineage), 1 skipped.
  - `review-theboycoder-stellarlight-*.md`: the boxy/StellarLight data-layer set — 4 adopted,
    7 covered, **8 DEFERRED (still unadopted — triage candidates)**, 3 rejected as adapter tests.
  - `review-raven-main/pr11/pr12.md`, `review-gist.md`, `review-codex-synthesis.md`,
    `_adopt-spec.md` — the other absorbed collections.
- `_candidates/` — the jutsu mining pipeline: method brief, per-chunk findings, and the
  2026-06-29 net-new themes doc that produced the +144 expansion (commit `09a9b9e`, 539→538
  after dedupe).

> **Vendored README scope.** `raven-next/research/golden/README.md` is preserved verbatim from
> the retired prior-art system. Its references to that system's runtime files, reviewers, and
> answer shape are historical, not operating instructions for this codemode repo. Current eval
> operation lives in `eval/README.md`, `eval/EVALS.md`, and `eval/qa/README.md`.

> **Name-collision note (historical scoping).** The vendored doc
> `raven-next/research/golden/_meta/_prior-art/review-raven-main.md` cites its source as
> `github.com/kalepail/stellar-raven` @ `main`. At capture time (2026-07-02) that name belonged
> to the **retired prior-art repo** whose route-card battery it reviews. On 2026-07-02 the
> repo you are reading was *renamed to* `stellar-raven` (from `stellar-raven-codemode`), so the
> GitHub name now resolves to a different codebase. The citation is **historically scoped** — it
> points at the retired repo's contents, not this one. (Vendored content is read-only archival;
> this note lives in PROVENANCE, not in the vendored file.)

### `raven-golden-qa/` — the loose corpus exports (was NOT a git repo; no other provenance)

| File | sha256 (source) | What it is |
|---|---|---|
| `big.json` (395) | `df1465d5…afdb2e4e14`* | Old `stellar-raven`'s compiled route-card battery. 392/395 questions are a subset of the 538; its labels (incl. `acceptable_cards` — non-empty on 383, cross-service on 361) are the routing eval's current source. |
| `raph.json` (90), `kaan.json` (84), `flue.json` (36), `og.json` (35) | see git blob hashes | The semantic/cf-flue battery: `expect.semantic` rubrics (passIf/failIf/inconclusiveIf/canonicalFacts/discriminator), `answerRegex` anchors, `skillsAny` labels **using codemode's ecosystem-skill names**. Content already reconciled into the 538 (see `_prior-art/`); the rubric machinery + skill labels remain unique. |
| `boxy.json` (21) | — | StellarLight **live-data discrimination set** (`liveSource: true`, answerable only via live tool queries) — raw material for a codemode live-data/execute lane (Solo todo 818). |

\* Full hashes recorded in Solo scratchpad 520 and reproducible from these files.

### `jutsu/` — the raw real-user question pool: **REMOVED for privacy (2026-07-03)**

The `jutsu/questions.jsonl.gz` (25,875 verbatim user questions across 9,526 threads / ~6,016
real user ids) and its `jutsu/summary.json` were **deleted from this repo and purged from git
history** before it could be made public. The raw content carried real personal data —
user-pasted **Stellar secret keys** (29 checksum-valid), 133 email addresses, phone numbers, and
per-message user/thread ids. Nothing in the eval pipeline read it at runtime (it was archival
"future mining source" only): `compile-routing.mjs` uses `big.json` + the curated 538-corpus, and
the jutsu pool had already been mined upstream into the corpus (the +144 net-new goldens on
2026-06-29 and the `_candidates/` theme docs). This pool must not be re-imported: any future
work of this kind needs a fresh privacy review first, and a raw pool is never committed here.

Also **excluded** upstream (never vendored): `messages_by_thread_raw.json` (166 MB),
`threads_raw.json`, `questions.{json,csv,md}` (format duplicates), `errors.json` (empty).

## Overlap facts (measured 2026-07-02, normalized question text)

- `big.json` 395 ∩ raven-next 538 = **392** (big is effectively a subset; 3 stragglers are
  normalization diffs).
- Semantic battery: 266 cases → **161 unique** questions; **0** exact-text overlap with either
  set, but content-level coverage was reconciled upstream via `_meta/_prior-art/`.
- jutsu pool → already harvested into the 538 (+144 on 2026-06-29).

## Consumers

- `eval/compile-routing.mjs` → `raven-golden-qa/big.json` (labels) + `raven-next/` (extended
  lane: `research/golden/compiled/golden.json` + per-question frontmatter)
- `eval/qa/compile-qa.mjs` no longer reads this directory — the QA battery compiles from the
  owned per-case files at `eval/qa/corpus/battery/` (see the scope note above); lineage from
  these snapshots is recorded per case in `truth.origin` and in
  `eval/qa/corpus/migration-ledger.json`.

The routing compile is deterministic; after repointing to these copies the regenerated
`routing-cases.json` was verified byte-identical to the pre-capture artifact.
