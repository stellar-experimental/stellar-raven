# Source delivery: scored, verifiable source pointers instead of content reading

Status: deferred by the owner on 2026-08-28 (phase-zero spike not approved). The measured reopen
rule in §8 controls when discovery may resume (tracked in [`.agents/TODO.md`](../.agents/TODO.md),
"Keep `sources.locate` deferred"). Reframes Track C item 1 of
[`research/qa-improvement-plan-2026-08-25.md`](../research/qa-improvement-plan-2026-08-25.md); code
anchors are as of 2026-08-27.

## 0. Governing philosophy

Owner intent (2026-08-27):

1. Build for general utility beyond the golden corpus; never overfit.
2. Deliver scored, precise source pointers (repo, pinned ref, path, optional locator, match reason)
   so the calling agent fetches content with its own tools — Raven does not read repos on its behalf.
3. Prefer well-scored pointers over potentially truncated content.
4. Show every matching authority; never take opinions Raven should not hold.

## 1. Problem statement

Targets two non-routing miss classes:

- **Class 1 (source-only fact):** exists only in source, not in any exposed op (e.g., `sd-044`
  [now resolved] on `q-quickstart-manual-ledger-close`; `sd-004` on
  `q-ti-rpc-gettransactions-pagination-xdr`).
- **Class 2 (docs vs. implementation conflict):** official docs and canonical code disagree and the
  agent cannot see the second voice (e.g., `sd-043` [now resolved] on
  `q-protocol-base-reserve-min-balance`).

Out of scope: routing misses, judge noise, golden staleness, answer craft, empty corpora, or
behavior goldens.

## 2. Doctrine fit (ADR-0003)

Adds one read-only, host-side manifest operation (`sources.locate`) over a host-held index, with no
sandbox network (`globalOutbound: null`):

- **Manifest & exposure:** `sources.locate` is emitted by `build-catalog.mjs`; `search` pointer
  attachments are host-computed metadata. No runtime flag — ship forward-only in two complete
  surfaces: **locate surface** (phase 1, guarded by `test/sources-locate-surface.test.ts`) and
  **attachment surface** (phase 2, guarded by `test/sources-attachment-surface.test.ts`).
- **Secrets & storage:** Maintenance script builds the index; runtime adds one credential-free R2
  binding (`SOURCE_LOCATORS`). Stores pointers, identifiers, and hashes only — never file bodies
  ([`ARCHITECTURE.md`](../ARCHITECTURE.md) §6).
- **Non-exposed refs & neutrality:** Raven-authored text passes build-time
  `assertNoNonExposedRefsInText`; source identifiers relay unchanged (no runtime scrub). Return all
  matching authority roles without asserting agreement or disagreement.

## 3. Proposed surface

### 3.0 Query ownership

Every pointer scores against one explicit query string (never inferred from code, op arguments, or
payloads): top-level `search` uses `query`; `codemode.search(q)` uses `q`; `sources.locate({ q })`
uses `q`; `execute` source-basis includes pointers *only* from explicit `sources.locate` calls in
that run.

### 3.1 `sources` table on search responses

Optional response fields: `sources?: SourcePointer[]` (deduplicated by `{repo, ref, path, locator}`,
capped at 12 pointers / 3,000 serialized chars; overflow reports `sourcesTotal`, `sourcesTruncated`,
and `nextSteps` pointing to `sources.locate`) and per-hit `sourceIds?: string[]` (≤3 per hit).

```ts
type SourcePointer = {
  id: string;               // e.g. "s1"
  repo: string;             // allowlisted "owner/repo"
  ref: string;              // 40-hex pinned commit
  path: string;
  locatorKind: "file" | "symbol" | "heading"; // "line-range" deferred (§8 Q4)
  locator?: string;
  authorityRole: "implementation" | "specification" | "reference-docs" | "tooling" | "advisory";
  matchReason: string;      // ≤100 chars: query term + matched index term
  verifiedAt: string;       // ISO date last confirmed by builder
  blobSha: string;          // provenance only
  verificationUrl: string;  // https://github.com/<repo>/blob/<ref>/<path>
  score: number;            // 0–100 (§4)
  factors?: string;         // compact breakdown
};
```

### 3.2 `sources.locate({ q, repo?, role?, page? })`

Read-only lexical lookup over the loaded index (`q` required; page size 10, max 5 pages, 3,000
chars/page; `emptyScope: "corpus"` — `soft-empty` never occurs):

- Matches → `{ ok: true, data: { pointers, total, truncated, page, indexAsOf } }`.
- No matches → `{ ok: true, data: { pointers: [], total: 0, ... } }` (inconclusive empty).
- Invalid `q` / unknown `repo` or `role` → `{ ok: false, error: { kind: "error" } }` listing valid values.
- Index unavailable, invalid, or stale → `kind: "error"` with retry hint (`execute` does not fail).

Adding a `sources` service updates closed lists `CATALOG_SERVICES` (`src/catalog/types.ts`) and
`src/adapters/index.ts`, plus super spec, sandbox namespace, projections, telemetry, and tests.

### 3.3 Source-basis pointers on `execute`

When `sources.locate` ran at least once, append one line inside `SOURCE_BASIS_MANIFEST_MAX_CHARS`
(1,600, placed after call ledger and derived URLs; ≤220 chars, ≤2 pointers with 7-hex refs, falling
back to `sources: see sources.locate result`). If pointers span multiple `authorityRole` values,
append `roles matched: <roles> — compare before asserting`.

### 3.4 Index and builder (maintenance-only)

`scripts/build-source-locators.mjs` (checked in `refresh.yml` beside `check-mirrors --fetch`):

- **Input:** reviewed `sources/ALLOWLIST.json` (repo, pinned ref, path globs, `authorityRole`,
  license ID + notice link, per-file-type extractor). Initial candidates: `stellar/stellar-core`,
  `stellar/stellar-rpc`, `stellar/quickstart` (`implementation`); `stellar/stellar-protocol`
  (`specification`); `stellar/stellar-docs` (`reference-docs`).
- **Output & binding:** uncommitted `sources/locators.json` uploaded to R2 under content-addressed
  key `locators/v<schemaVersion>/<indexSha256>.json` *before* deploying committed descriptor
  `sources/locators.descriptor.json` (`schemaVersion`, `indexSha256`, `allowlistSha256`,
  `builderVersion`, `objectKey`, `builtAt`). No build-time fallback digest.
- **Load & degrade:** Worker loads `objectKey` via `SOURCE_LOCATORS`, verifies SHA-256 and zod
  schema, checks `schemaVersion`, embedded `allowlistSha256`, and `builderVersion` against the
  deployed descriptor, and memoizes per isolate by `indexSha256` (optional colo Cache API
  re-verified on hit). Any mismatch rejects the index (`index-mismatch` error on `sources.locate`,
  attachments disabled, `sources_index` telemetry; `search`/`execute` never fail).

## 4. Scoring design

Uniform, query-global formula (zero per-question rules, never reads `eval/`):

```
score = round(100 × (0.55·E + 0.25·L + 0.15·F + 0.05·P))     range 0–100
```

- **E (entity match):** vendored lexical tiers — exact `1.0`, prefix `0.7`, phrase `0.5`, substring
  `0.25`, none `0` (dropped).
- **L (locator specificity):** symbol/heading `1.0`, file `0.4`.
- **F (freshness):** `max(0, 1 − daysSinceVerified/90)` (0 after 90 days; still returned).
- **P (pin proximity):** commits behind default-branch HEAD — `0` → `1.0`, `≤30` → `0.5`, else `0`.

Tie order: higher E → higher L → shorter `path` → repo ascending. Diversity: ≤2 pointers/repo per
hit's `sourceIds` (table uncapped).

**Hit eligibility (filter, not weight):** a hit includes a table pointer (`E > 0`) when its
preferred-role set is empty or matches `authorityRole` — `stellarDocs` → `reference-docs`; `scout`
with `recoverWith` relation `source-code` → `implementation`, `tooling`; other `scout`/`lumenloop`
and unannotated skills/sections → none (all eligible); whole skills with optional reviewed
`sourceRoles` → listed roles. Do not use `buildAuthorityRoles` or `retrievalProfile.lane`.

**Gates:**
- **Frozen locator gate (pre-set targets):** positive top-1 ≥70%, top-3 ≥85%; negative queries
  empty ≥90%, zero negative pointers with `score ≥ 60`. Tune only on a separate dev set.
- **Routing gate:** existing `eval/gates.json` floors and 1% legacy band hold (no-regression check).

## 5. General utility

Covers operator config-key truth (option parsers), normative CAP/SEP wording at pinned refs, and
exact bounds/types where prose approximates — all proven via an independently authored frozen
evaluation (§9), not golden examples.

## 6. Alternatives

| Option | Verdict | Reason |
|---|---|---|
| **A. Pointer table + `sources.locate`** (this draft) | Recommended (gated by phase-0 spike) | Satisfies all four philosophy points; L program; degrades cleanly. |
| **B. Bounded host content fetch** (original Track C) | Not planned | Directly violates philosophy point 2 (Raven reads repos) and adds egress/rate-limit/content-proxy burden. |
| **C. Pointers + request-time blob receipts** | Phase-2 candidate if stale rate is high | Adds request-path network/egress cost. |
| **D. Rely on `scout.explainRepo`** | Keep as complement | Returns DeepWiki opinions, single authority only, degrades to URL. |
| **E. Steering text only** | Do alongside A | Instruction budget nearly full; no provenance gain. |

## 7. Overfit guardrails

Never add pointers, aliases, or allowlist entries for specific golden IDs; never read `eval/` at
build time; never add judge-only fields or per-question locators; never infer agreement/disagreement
or implicit queries; never fetch bodies at request time or mirror repos; never tune against the
frozen evaluation or ship on a battery delta.

## 8. Reopen rule and deferred design questions

Deferred on 2026-08-28. Ask the twelve questions below only after this trigger opens a phase-zero
study. A verified incident must satisfy all four conditions:

1. Missing fact exists at a pinned ref in an allowlist-candidate repo with a nameable file, symbol,
   or heading locator.
2. Docs, skills, one drift refresh, and one pinned `scout.explainRepo` rephrase return no quotable
   support.
3. Repository-recovery steering from ADR-0008 was live when the failure occurred.
4. Triage confirms source coverage (not routing, answer craft, judge error, or golden error).

Opens phase-zero discovery on: one independently reproduced high-impact user block (no exposed op
let the user complete the task), OR two unrelated reproduced incidents (each with question,
transcript, and Ray ID/date when available), OR evaluation-only evidence of three verified cases
across two repos and two fact classes (at least one outside current golden families). No trigger
authorizes implementation.

Deferred questions (with non-binding 2026-08-27 recommended defaults in parentheses):

1. **Pin freshness:** auto-repin monthly only when every indexed blob hash is unchanged; review all
   changed blobs/paths/extractor output? (Yes.)
2. **Agents without fetch tools:** return pointer + `verificationUrl` only, degraded hint to
   `scout.explainRepo`, or option C receipts? (Pointer + `verificationUrl` only.)
3. **Index budget:** ceilings for serialized bytes, parsed memory, cold parse, lookup CPU? (5 MiB
   serialized, 32 MiB parsed, 25 ms cold parse, 5 ms lookup CPU.)
4. **Line ranges:** ship `file`/`symbol`/`heading` only and defer line ranges? (Yes.)
5. **Attribution/licensing:** per-repo SPDX + notice link in allowlist and surfaced once per
   response? (Recommended; legal review required.)
6. **Docs-vs-source neutrality:** stay neutral with roles-matched note even when a finding records
   which source is right? (Yes.)
7. **Query ownership:** confirm §3.0 explicit-query rule? (Yes.)
8. **Index availability:** clean degrade with no fallback + hourly Worker-side index canary? (Yes.)
9. **Attachment CPU/latency cap:** budget before moving to `sources.locate`-only? (5 ms CPU, 20 ms
   p95 wall time.)
10. **Conflict grouping:** keep pointers flat with `authorityRole` rather than entity/conflict
    groups? (Flat.)
11. **Skill `sourceRoles`:** omit initially until measured attachment errors require it? (Omit.)
12. **Allowlist governance:** skill-pin review bar + role reason, license data, extractor rule,
    descriptor update, drift checks? (Yes.)

## 9. Sizing and sequence

**Size: Large** (pending phase-0 measurements):

| Phase | Scope | Size | Gate |
|---|---|---:|---|
| 0 — spike | Two repos (`quickstart`, `stellar-protocol`), shell-flag + heading extractors, `sources.locate`, `SOURCE_LOCATORS` R2 + descriptor/digest check, latency/memory/size measurements; author & freeze independent eval + separate dev set. | M | Within Q3/Q9 ceilings; independent eval frozen with §4 targets (miss stops program). |
| 1 — locate surface | Full locate surface (§2), `sources` in `CATALOG_SERVICES`/dispatcher/super-spec/sandbox/telemetry, Go/C++ symbol extractors across 5 candidate repos, `test/sources-locate-surface.test.ts`. | L | Consistency test, frozen locator gate, routing gate, secrets scan, size checks pass. |
| 2 — attachment surface | Full attachment surface (§2): `sources`/`sourceIds` in search schema & paths, source-basis line, instruction update inside client cap, `test/sources-attachment-surface.test.ts`. | M | Consistency test, response-byte budget, routing & locator gates hold. |
| 3 — deferred | Line ranges (Q4), receipts (C), non-Stellar-org repos, extra heading pointers. | — | Own measured trigger each. |

The independent evaluation is authored by someone who has not read the QA battery, frozen before
implementation, and never tuned against (like `eval/holdout-cases.json`). QA battery rerun is
regression-only.

## References

- [`research/qa-improvement-plan-2026-08-25.md`](../research/qa-improvement-plan-2026-08-25.md),
  [`research/qa-deep-dive-2026-08-25/fable-max.md`](../research/qa-deep-dive-2026-08-25/fable-max.md),
  [ADR-0003](../research/decisions/0003-build-time-exposure-filtering.md),
  [`ARCHITECTURE.md`](../ARCHITECTURE.md) §3–§6
- Code anchors: `src/policy/source-basis.ts` (`SOURCE_BASIS_MANIFEST_MAX_CHARS = 1600`),
  `src/catalog/search.ts` (`MAX_SEARCH_LIMIT = 50`), `src/catalog/types.ts` (`CATALOG_SERVICES`),
  `src/adapters/index.ts`, `eval/gates.json`
- Findings: active `sd-004` (`improvements/stellar-docs/`); resolved `sd-003`, `sd-043`, `sd-044`
  ([`improvements/resolved.json`](../improvements/resolved.json))
- Neighboring held source lane: [`partner-doc-live-sources.md`](./partner-doc-live-sources.md)
