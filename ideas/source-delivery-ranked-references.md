# Source delivery: scored, verifiable source pointers instead of content reading

Status: draft for review, 2026-08-27, revised the same day after one independent review
(`CHANGES-REQUESTED`, nine findings, all addressed below). No committed work. This note reframes
Track C item 1 of
[`research/qa-improvement-plan-2026-08-25.md`](../research/qa-improvement-plan-2026-08-25.md)
("canonical technical source reader") under the owner's stated philosophy. It is not a decision
record. Nothing here ships without the gates in §9.

## 0. The governing philosophy

Verbatim intent from the service owner, 2026-08-27:

1. Do not overfit to the golden QA. Build a system that is generally useful for all questions,
   especially beyond the golden corpus.
2. Raven should not read repositories on the calling agent's behalf. It should deliver sources to
   the calling agent: scored, precise pointers the agent can then fetch itself with its own tools.
3. Balance material against sources. "Delivering the right sources, well scored, is often better
   than delivering potentially truncated content."
4. Show sources. Do not take opinions the system should not have.

Consequence for this draft: the unit of value is a **scored, verifiable source pointer** — repo,
pinned ref, path, optional locator, and a stated reason it matched. Content fetching stays the
calling agent's job. Every alternative in §6 is judged against these four points first.

## 1. Problem statement

Two evidence-backed miss classes motivate this. Both are named in the 2026-08-25 deep dive; neither
is a routing defect.

**Class 1 — the fact exists only in source, and no exposed operation carries it.**

- `q-quickstart-manual-ledger-close`: `--enable-core-manual-close` exists only in the
  `stellar/quickstart` `start` script (line 47 default, line 202 parse, line 520 config write, per
  `sd-044`). README and Docs omit it. Eight docs executes plus one `scout.searchResearch` could not
  surface it; the answer asserted non-existence (`fable-max.md` §2.1, `sol-max.md` row 32).
  `scout.explainRepo` was the only plausible exposed route and was not tried (`fable-max.md` §7 Q6).
- `q-ti-rpc-gettransactions-pagination-xdr`: the getTransactions defaults (50/200) are
  operator-configurable in `stellar-rpc` `options.go`, but the docs page says "hardcoded in
  Stellar-RPC" and `sd-004` is declined upstream (`grok-xhigh.md` §2). Terra classes the row
  UPSTREAM-LACKS: "no current Raven carrier for complete canonical RPC reference."

**Class 2 — official docs and the canonical implementation disagree, and the agent cannot see
the second voice.**

- `q-protocol-base-reserve-min-balance`: `stellar-core` `getMinBalance` in
  `src/transactions/TransactionUtils.cpp` excludes selling liabilities; the sponsored-reserves
  docs page adds `+ liabilities.selling` (`sd-043`). Grok's verdict: "Core agrees with the golden,
  official docs do not... This grades 'did you read Core?' not 'did Raven retrieve Stellar docs?'"
- Fable §7 Q2 names six goldens that "punish docs-faithful answers" and asks for a docs-vs-source
  policy. Terra's top-10 puts a canonical technical reader at rank 1 (up to 14 rows), an advisory
  source at rank 8, and docs repair at rank 3.

**Not in either class.** `q-sor-p23-auto-restore-extendto` is classified ANSWER-FAIL
(`fable-max.md` §2.2), carrier EXPOSED with fix class `output-contract` (`terra-max.md` row 87);
the `max_entry_ttl` value was visible in a result and the final formula dropped the minus-one
(`sol-max.md` row 40). A precise CAP pointer may help questions of that shape (§5, precision use
case), but the recorded evidence does not show that this mechanism would have fixed that answer.

The pattern across both classes: the calling agent's best possible next step was "go read this
exact file at this exact ref," and Raven had no way to say that. The prior framing (Track C item 1)
answered with "let Raven read it." The owner's philosophy answers with "let Raven point at it,
score the pointer, and show every matching authority." That is the reframing this draft carries
out.

What this draft is **not** for: routing misses, judge noise, golden staleness, or answer craft.
Those have their own tracks (A, B0–B7). Source pointers do nothing for empty corpora
(WisdomTree CRDT) or for behavior goldens (wallets roster).

## 2. Doctrine fit — pointers live inside ADR-0003

[ADR-0003](../research/decisions/0003-build-time-exposure-filtering.md): the manifest is the
exposed surface; model code never owns endpoints, arguments, auth, or exposure.

Stated exactly: this design adds **one new host capability** — a read-only locator lookup over a
host-held index — exposed as one manifest operation. It adds **no direct outbound network** to the
sandbox. Those are different statements, and both are true.

| Doctrine point | How source pointers satisfy it |
| --- | --- |
| Manifest is the surface | The only new callable is `sources.locate` (§3.2), emitted by `build-catalog.mjs` like any other entry. Pointer attachments on `search` hits are host-computed result metadata, not a callable. |
| Networkless sandbox (`globalOutbound: null`) | Unchanged. Raven never fetches repository content at request time. The calling agent fetches with its own tools (GitHub MCP, `gh`, `WebFetch`, a browser). |
| Secrets stay host-side | The index is built by a maintenance script with a host token, like `ecosystem-skills/update.sh`. **No new secret enters `Env`.** The runtime does need one new binding: an R2 object (or KV namespace) holding the index (§3.4). That binding holds no credential. |
| Serve, do not store (ARCHITECTURE §6) | Raven stores **pointers, identifiers, and hashes**, never file bodies. The index holds repo, ref, path, locator strings (symbol names, heading text), blob hash, and short match terms. That is stricter than the skills lane, which forwards bodies. |
| Non-exposed references | Raven-authored text (match-reason templates, role labels, guidance sentences) is guarded at **build time** by the existing `assertNoNonExposedRefsInText` path. Source identifiers (paths, symbols, headings) are relayed **unchanged**; there is no runtime scrub of pointer payloads, consistent with ADR-0003's rule against runtime scrubbing of relayed evidence. |
| Show sources, no opinions | A pointer carries `matchReason` and `verificationUrl`, never a paraphrase of file content. When several authority roles match one entity, Raven returns all of them with roles and says only that roles matched; it never states agreement or disagreement (§3.3). |
| Exposure is a build choice | **No flag.** Each phase ships forward-only, per the repository's hard rule, and each phase's surface is a **complete surface on its own**. Two surfaces are defined. **Locate surface** (phase 1): the `sources.locate` manifest entry, its super-spec path, the sandbox `sources` namespace, its telemetry, and one instruction sentence naming `sources.locate`. **Attachment surface** (phase 2): the `sources`/`sourceIds` fields in the static `search` output schema (`src/mcp/tools.ts`), the `codemode.search` projection, the source-basis line, and the instruction sentence update. Each surface lands in one reviewed change. Two consistency tests (`test/sources-locate-surface.test.ts`, `test/sources-attachment-surface.test.ts`) assert that every part of the named surface is present together or absent together; the attachment test also requires the locate surface to be present. There is no runtime-conditional exposure and no half-advertised state. |

Contrast with the item Terra flagged as a doctrinal conflict: "a model must not receive generic
outbound web access or client-chosen URLs." A pointer is neither. It is host-authored data about
where truth lives, and the fetch happens outside Raven under the calling agent's own authority
and rate limits.

## 3. Proposed surface

Small on purpose. Four pieces, with one query rule that governs all of them.

### 3.0 Query ownership — one rule

Every pointer is scored against **one explicit query string**, and the projection that emits it
names where that string came from:

| Projection | Query source | Pointer output |
| --- | --- | --- |
| Top-level `search` | The tool's `query` argument | Response-level source table + per-hit source ids (§3.1) |
| `codemode.search(q)` | The script's `q` | Same shape, inside the sandbox result |
| `sources.locate({ q })` | The script's `q` | Paged pointer list (§3.2) |
| `execute` source-basis block | **Only** the `q` of `sources.locate` calls made in that run | 1–2 compact pointers from those calls' top results (§3.3) |

Raven never infers a question from code text, operation arguments, or result payloads. An
`execute` run that made no `sources.locate` call gets no pointers in its source basis.

### 3.1 The `sources` table on search responses

Both search paths add two optional fields to the existing response:

```ts
sources?: SourcePointer[];        // response-level, deduplicated by {repo, ref, path, locator}
// each hit gains:
sourceIds?: string[];             // ≤ 3 per hit, indexes into `sources`
```

```ts
type SourcePointer = {
  id: string;               // short stable id, e.g. "s1"
  repo: string;             // "stellar/stellar-core" — allowlisted only
  ref: string;              // 40-hex commit the pointer was verified at
  path: string;             // "src/transactions/TransactionUtils.cpp"
  locatorKind: "file" | "symbol" | "heading";   // "line-range" deferred, §8 Q4
  locator?: string;         // "getMinBalance" | "Effect on minimum balance"
  authorityRole: "implementation" | "specification" | "reference-docs" | "tooling" | "advisory";
  matchReason: string;      // ≤ 100 chars; names the query term and the index term it matched
  verifiedAt: string;       // ISO date the ref/path/blob were last confirmed by the builder
  blobSha: string;          // git blob hash at ref — provenance, not security
  verificationUrl: string;  // https://github.com/<repo>/blob/<ref>/<path>
  score: number;            // 0–100, §4
  factors?: string;         // compact, e.g. "entity:exact locator:symbol fresh:0.9 pin:1.0"
};
```

Budgets (separate from, and not charged against, existing fields):

- `search` response: the `sources` table is capped at **12 pointers** and **3,000 characters**
  serialized; hits reference ids, so a pointer that serves several hits costs its bytes once.
  Overflow is reported as `sourcesTotal` and `sourcesTruncated`, with `nextSteps` naming
  `sources.locate({ q, page })` for the rest.
- `codemode.search`: same caps inside the sandbox; the final result cap still applies to anything
  the script returns.
- Worst-case measurement (50 hits, 12 pointers, maximum field lengths) is part of the ship gate
  (§9) and is recorded in the `search` telemetry event's `responseChars`, which already exists
  for this purpose.

### 3.2 One manifest-declared locator operation

`sources.locate({ q, repo?, role?, page? })` → the standard envelope.

- Read-only, host-side, no network. Lexical lookup over the loaded index (§3.4).
- **Envelope semantics, stated exactly:**
  - matches found → `{ ok: true, data: { pointers, total, truncated, page, indexAsOf } }`;
  - no matches → `{ ok: true, data: { pointers: [], total: 0, ... } }` — data-shaped empty. The
    host ledger classifies it as inconclusive, like every other empty success (ARCHITECTURE §4);
  - invalid `q`, unknown `repo` or `role` → `{ ok: false, error: { kind: "error" } }` naming the
    valid set, mirroring `prepareCatalogSearch`'s service-filter behavior;
  - index unavailable, unparseable, or stale beyond the allowed window → `kind: "error"` with a
    hint to retry; the operation degrades, `execute` does not fail;
  - **`soft-empty` never occurs.** There is no upstream service behind this operation, so there is
    no "service answered with nothing" case. The catalog entry's `retrievalProfile` records
    `emptyScope: "corpus"`.
- Page size 10, hard cap 5 pages per call. Per-page byte budget 3,000 characters.
- `q` is required. This is the only way `execute` gets pointers (§3.0).

Adding a `sources` service is not free: `CATALOG_SERVICES` (`src/catalog/types.ts`) and the
adapter dispatcher (`src/adapters/index.ts`) are closed lists, and the super spec, sandbox
namespace, projections, telemetry, and tests all follow. §9 sizes that.

### 3.3 Source-basis pointers on `execute`

When a run called `sources.locate` at least once, the source-basis block gains one line:

```
sources: s1 stellar/stellar-core@<ref7> src/transactions/TransactionUtils.cpp#getMinBalance (implementation); s2 ...
```

- At most **2** compact pointers, taken from the top results of that run's `sources.locate`
  calls, ranked by §4. Short ref (7 hex) in this line only; the full ref is in the call result.
- Character budget: **220 characters**, inside the existing `SOURCE_BASIS_MANIFEST_MAX_CHARS`
  (1,600) and placed after the call ledger and derived URLs so it can never displace them. If the
  block cannot fit both, it carries one; if it cannot fit one, it carries none and says
  `sources: see sources.locate result`.
- **Roles-matched note.** When the run's pointers for one query span more than one
  `authorityRole`, the line ends with `roles matched: implementation, reference-docs — compare
  before asserting`. Raven does not read either source at request time, so it cannot know
  whether they agree. It reports that both matched and stops. Known disputes stay in dated
  research and `improvements/`, not in inferred runtime metadata.

### 3.4 The index and its builder (maintenance-only)

`scripts/build-source-locators.mjs`, run in `refresh.yml` beside `check-mirrors --fetch`:

- Input: `sources/ALLOWLIST.json` — repo, pinned ref, path globs, `authorityRole`, license id and
  upstream notice link, and the locator extraction rule per file type (symbols for Go/C++/Rust,
  headings for Markdown, option flags for shell). Allowlist edits are reviewed like
  `ecosystem-skills/MANIFEST.json` pins.
- Output: `sources/locators.json` — pointers plus short match terms. No file bodies. Size budget
  set by the phase-zero spike (§9).
- Provenance per pointer: `ref`, `blobSha`, `verifiedAt`, builder version. A pointer whose blob
  no longer resolves at its ref is a drift class, reported the way `check-mirrors` reports an
  unresolvable pin. Refs are never auto-advanced without review (§8 Q1).
- **Binding the runtime index to the reviewed deployment.** The index is mutable storage, so it
  must not be able to change repositories, roles, or pointers without a matching deployment:
  - `sources/locators.json` carries `schemaVersion`. The builder also writes a committed
    **descriptor**, `sources/locators.descriptor.json`: `{ schemaVersion, indexSha256,
    allowlistSha256, builderVersion, objectKey, builtAt }`. The descriptor is reviewed and
    committed with the allowlist change; the index body is not committed.
  - `objectKey` is content-addressed: `locators/v<schemaVersion>/<indexSha256>.json`. An object
    under that key is immutable and idempotent to re-upload. A stale object can never be selected
    because the deployed descriptor names exactly one key.
  - **Upload order:** build index → compute `indexSha256` and `allowlistSha256` → upload the
    object under its key (a maintainer-run script with a scoped R2 token, like
    `ecosystem-skills/update.sh`; `refresh.yml` is detection-only today and holds no storage
    write permission, so it does not do this) → commit descriptor + allowlist → deploy. Deploy
    after upload, never before.
  - **Load and validate:** the Worker imports the descriptor from the bundle, reads the object
    named by `objectKey` through a new R2 binding `SOURCE_LOCATORS` (to be added to
    `wrangler.jsonc`; none exists today), computes SHA-256 over the bytes, and parses the full
    index against a zod schema for `schemaVersion` (the same fail-loud posture as
    `refinedCatalogSchema.parse`). Any mismatch — digest, schema version, allowlist digest
    inside the index versus the descriptor, or builder version — **rejects** the index: it is not
    memoized, `sources.locate` returns `kind: "error"` naming `index-mismatch`, attachments
    disable, and a `sources_index` telemetry event records the reason. `search` and `execute`
    themselves never fail because of the index.
  - **Cache policy:** memoize per isolate keyed by `indexSha256`; no TTL is needed because the
    key is immutable. A colo Cache API layer is optional transport, re-verified on every hit,
    exactly as the skills path treats its cache. Rolling back a deployment rolls back the
    descriptor, and therefore the index, with no storage action.
- There is **no build-time fallback digest**. When the index is unavailable or rejected, the
  system degrades cleanly as above. (The earlier fallback idea conflicted with the required
  `score` field and would have advertised unscored pointers; it is dropped.)
- Cost gates: index bytes, parse time, per-query lookup time, and Worker memory are measured in
  the phase-zero spike and become CPU/latency floors in the ship gate.

Initial allowlist candidates, each with a one-line role justification in the allowlist file:
implementation — `stellar/stellar-core`, `stellar/stellar-rpc`, `stellar/quickstart`;
specification — `stellar/stellar-protocol` (CAPs and SEPs); reference-docs —
`stellar/stellar-docs`, included so the same entity can surface with two roles. Phase 0 starts
with two of these (§9).

## 4. Scoring design

Scoring is **uniform and free of per-question rules**: the same formula for every query, no
case-specific weights, no golden-derived terms, nothing that reads `eval/`. Some components
depend on the query — that is what scoring means — but none depends on which question it is.

The score is **query-global**: one pointer has one `score` per response, computed from the query
and the pointer alone. No hit influences it, so a pointer that serves several hits has one
unambiguous value and the response-level table has one ordering.

```
score = round(100 × (0.55·E + 0.25·L + 0.15·F + 0.05·P))     range 0–100
```

| Component | Definition | Values |
| --- | --- | --- |
| E entity match | Best match between a query token and the pointer's index terms (symbol, flag, heading, CAP/SEP number). Reuses the vendored lexical tiers (exact > prefix > phrase > substring). | exact 1.0, prefix 0.7, phrase 0.5, substring 0.25, none 0 (pointer is dropped) |
| L locator specificity | `locatorKind` | symbol/heading 1.0, file 0.4; line-range (deferred) would be 1.0 |
| F verification freshness | `days = now − verifiedAt` | `max(0, 1 − days/90)`; a 90-day-old verification scores 0 but is still returned |
| P pin proximity | Commits behind upstream default-branch HEAD at last check (detection only) | 0 behind 1.0; ≤ 30 behind 0.5; else 0 |

Authority role is **not** a score component. It is an eligibility filter, applied per hit after
scoring, and it never changes a pointer's `score` or the table order. For `sources.locate`, the
caller's optional `role` argument is likewise a filter, not a weight.

Tie order: higher E, then higher L, then shorter `path`, then repo name ascending. Diversity: at
most 2 pointers per repo in one hit's `sourceIds`; the table itself is not diversity-capped.
`factors` carries the component values compactly so a calling agent can see why a pointer ranked.

**Hit-to-pointer eligibility (separate from scoring).** A hit lists a pointer in `sourceIds` only
when (1) the pointer is in the response table (E > 0 for this query), and (2) the hit's
preferred-role set is empty or contains the pointer's `authorityRole`. Preferred roles come only
from reviewed manifest data:

| Entry evidence | Preferred roles |
| --- | --- |
| `service: "stellarDocs"` | reference-docs |
| `service: "scout"` and `retrievalProfile.recoverWith[]` contains `relation: "source-code"` | implementation, tooling |
| `service: "scout"` otherwise, or `service: "lumenloop"` | none |
| `kind: "skill"` with a new optional, reviewed field `sourceRoles: SourceRole[]` (§3.4 allowlist governance applies; validated at catalog load; whole-skill entries only, like other skill-level metadata) | the listed roles |
| Skills without `sourceRoles`, and every `skill-section` entry | none |

`buildAuthorityRoles` is **not** used: its contract states that it never claims a returned
repository applies, and it is permitted only on whole-skill entries. `retrievalProfile.lane` is
not used either; it describes empty-result semantics, not authority. "None" means every table
pointer is eligible for that hit. A hit with no eligible pointer omits `sourceIds` rather than
emitting it empty. Pointers eligible for no hit still appear in the table when the query matched
them; the hits simply do not reference them.

Gates, stated correctly:

- **Source-locator ranking gate (new, frozen, with targets set now).** The independent locator
  evaluation from §9 is frozen before implementation, and its minimum targets are fixed in this
  draft, before any result exists: positive cases — top-1 pointer names the expert's file on
  ≥ 70%, and the expert's file is within the top 3 on ≥ 85%; negative queries — ≥ 90% return an
  empty pointer list, and no negative query returns any pointer with `score ≥ 60`. A first
  measurement below these targets is a stop, not a floor. Formula and extraction changes are
  tuned only on a separate **development set** written by the implementers; the frozen
  evaluation is the untouched final gate.
- **Routing gate (existing, separate).** `eval/gates.json` floors and its 1% legacy band must
  hold. It cannot measure pointer correctness; it is a no-regression check on search only. It does
  not require zero top-1 movement.

## 5. General-utility argument

The reviewer's finding stands: my first three examples were battery-adjacent. The honest
statement is that the **class** is general — "which file at which ref holds the normative
answer" — and that proving it requires questions nobody in this repo wrote. §9 therefore replaces
the probe with an independently authored, frozen evaluation. The shapes below describe the class;
they are not the evaluation.

1. **Configuration truth for an operator.** "Which config key controls X in service Y?" for any
   allowlisted repo. Today Raven returns docs prose or nothing; a pointer to the option parser
   with role implementation lets the operator confirm in their editor.
2. **Normative status or text for a protocol document.** "What does the header/section of
   document Z say right now?" for any CAP or SEP. A heading-locator pointer at a pinned ref lets
   the agent quote and date the sentence.
3. **Precision use case (unproven for the recorded failure).** Exact bounds, argument types, and
   formulas where prose approximations lose a term. The extendTo row shows the failure shape, but
   its recorded cause was answer craft, so the pointer's effect on that class is a hypothesis for
   the evaluation, not a claim.

In every case the calling agent's tools are enough to finish, and Raven's contribution is
precision and provenance rather than content.

## 6. Alternatives matrix

| Option | Fits philosophy | Cost | Risks and failure modes | Verdict |
| --- | --- | --- | --- | --- |
| **A. Pointer table + `sources.locate`** (this draft) | Yes on all four points | L program (§9) | Agents without fetch tools get pointers they cannot act on (§8 Q2). Stale refs if re-pin discipline slips. Index availability becomes a runtime dependency (degrades, never fails). No help for content outside the allowlist. | Recommended, gated by the phase-zero spike. |
| **B. Bounded host content fetch op** (Track C item 1 as written) | **Violates point 2 directly** — Raven reads the repository for the agent. That is the decisive reason. | M adapter + deadlines, cache, drift class, licensing review for relayed bodies | Data flow, stated correctly: the full body enters the **sandbox**, and only the script's projection crosses the model boundary (`source-basis.ts` guidance). So truncation is a script-quality risk, not a certainty. The real costs are operational: request-time GitHub egress and rate limits, a 20s-style deadline, cache-as-transport rules, and Raven becoming a content proxy that "serve, do not store" then has to police. | Not planned. Would need the owner to change point 2 explicitly. |
| **C. Pointers + receipts-only enrichment** (Raven confirms at request time that the blob still resolves at `ref`; returns `blobSha`, byte size, and the pin's commit date — never a body) | Yes; a receipt is provenance | A + S runtime check | Host-side network on the request path; shared-egress rate limits (same class as the skills canary). Git blobs carry no modification time, so the receipt uses commit date and `verifiedAt`, not `mtime`. | Phase 2 candidate if the measured stale-pointer rate is high. |
| **D. Do nothing; rely on `scout.explainRepo`** | Partly | Zero | It returns an **answer**, not a pointer, and does so via DeepWiki — an opinion Raven relays. It degrades to `deepWikiUrl` when DeepWiki is down. It cannot return two authorities for one entity. In the miss it was not even tried. | Keep; steer to it in recovery hints (B4). Not a substitute. |
| **E. Steering text only** | Yes, trivially | XS | Instruction budget is nearly full; gains bounded by one op's coverage; no provenance gain. | Do alongside A. |

Costs are gut sizings for review, not estimates.

## 7. Overfit guardrails

This design must not:

- add a pointer, locator, alias, or allowlist entry because a specific golden question needs it;
  every allowlist line justifies itself by repo authority role, not by a case id;
- read `eval/` at build time or carry any golden-derived index, term list, or weight;
- carry a field that only a judge or evidence pack consumes; every `SourcePointer` field must be
  useful to a calling agent with no knowledge of the battery;
- encode per-question locators; locators come from the extraction rule for the file type,
  uniformly;
- infer agreement or disagreement between sources; when roles match, all ship with the
  roles-matched note and nothing more;
- infer a query from code, arguments, or payloads (§3.0);
- fetch content at request time (option A) or become a mirror (any option);
- tune scoring, the allowlist, or extraction rules against failed cases of the frozen evaluation;
- report a battery delta as the ship reason.

## 8. Open questions for the owner

1. **Pin freshness policy.** Skills never auto-advance because bodies are prompt input. Pointers
   are not prompt input. Is a monthly automatic re-pin acceptable when the blob hash at the new
   ref is unchanged, with human review only on changed blobs?
2. **Agents without fetch tools.** Some MCP clients have no GitHub, shell, or web tool. Options:
   (a) return pointers anyway with `verificationUrl` for a human; (b) a degraded hint that steers
   to `scout.explainRepo` for the same repo; (c) option C receipts so the agent can at least cite
   a verified ref. Which do you want, if any?
3. **Index cost and budget.** Symbol granularity over five repos is likely tens of thousands of
   pointers. What ceiling do you accept for index bytes, parse time per isolate, and per-query
   lookup CPU? The phase-zero spike reports measurements against that ceiling.
4. **Line ranges.** Most useful locator, fastest to rot. Proposal: `file`, `symbol`, `heading`
   only until a measured stale rate justifies ranges. Agree?
5. **Attribution.** The index stores extracted headings, symbol names, and short match terms from
   upstream repositories, plus URLs and hashes. What attribution or license handling do you want
   for that stored material and for delivered pointers — per-repo license id and notice link in
   the allowlist, surfaced in responses, or something else? This draft does not decide the legal
   answer.
6. **Docs-vs-source policy** (Fable §7 Q2, restated). The product layer returns every matching
   role and a roles-matched note. Confirm that it should stay neutral even where a dated finding
   already records which source is right.
7. **Query ownership.** Confirm §3.0: no inferred questions, and `execute` source basis carries
   pointers only after an explicit `sources.locate({ q })` call.
8. **Index availability.** When the R2 object is unavailable or rejected by the descriptor
   check, attachments disable and `sources.locate` errors while `search`/`execute` continue.
   This draft proposes clean degrade with no fallback pointers. Is an hourly Worker-side canary
   over the index (like `runSkillCanary`) wanted from phase 1?
9. **CPU and latency limits.** What per-request budget may attachment scoring consume on the
   `search` path before it must move to `sources.locate` only?
10. **Conflict grouping.** Should pointers for one entity across roles be grouped under one
    entity key in the table, or stay flat with the note? Grouping helps agents; it also invites the
    inference this draft forbids.
11. **Skill `sourceRoles` metadata.** The eligibility rule (§4) needs a new reviewed skill-level
    field to give skills a preferred authority role. Do you want that field at all, or should
    skills keep "none" (every table pointer eligible) until measured evidence asks for more?
12. **Allowlist governance.** Same reviewers and evidence bar as a skill pin, plus the role
    justification and license fields?

## 9. Sizing and sequence

**Program size: Large** until the phase-zero spike reports. The prior S/M sizing omitted storage,
the closed service and adapter lists, spec generation, projections, telemetry, tests, and the
extractor's parser decisions.

| Phase | Work | Size | Gate to proceed |
| --- | --- | ---: | --- |
| 0 — spike | Two repos (`stellar/quickstart`, `stellar/stellar-protocol`); shell-flag and Markdown-heading extractors only; `sources.locate` only; `SOURCE_LOCATORS` R2 binding, descriptor, and digest check (§3.4); measure pointer count, index bytes, parse time, lookup time, Worker memory, worst-case response bytes. Also author and freeze the independent evaluation and write the implementers' development set. | M | Measurements within the owner's ceiling (Q3, Q9); evaluation frozen with the §4 targets attached; a first measurement below target stops the program. |
| 1 — locate surface | The complete **locate surface** (§2): `sources` service in `CATALOG_SERVICES`, dispatcher, `sources.locate` manifest entry and super-spec path, sandbox namespace, telemetry, the locate instruction sentence, and `test/sources-locate-surface.test.ts`; scoring per §4; allowlist grows to the five candidates with symbol extractors for Go/C++. | L | Locate-surface consistency test passes; frozen locator gate holds; routing gate holds; secrets scan clean; response-size measurements recorded. |
| 2 — attachment surface | The complete **attachment surface** (§2): `sources` table and `sourceIds` in the static `search` output schema and on both search paths, hit eligibility per §4 (with `sourceRoles` only if Q11 says yes), the source-basis line, the instruction update within the 2,000-character budget, and `test/sources-attachment-surface.test.ts`. | M | Attachment-surface consistency test passes; worst-case `search` response bytes within budget; no routing-gate regression; locator gate unchanged. |
| 3 — deferred | Line-range locators (Q4), receipts (option C), non-Stellar-org repos, heading pointers beyond CAPs/SEPs. | — | Each on its own measured trigger. |

Phase-1 locators (flags, headings, Go/C++ symbols) are the locator kinds the frozen evaluation
exercises; the evaluation author is told the allowlist and locator kinds, not the battery.

**The independent locator evaluation.** Authored by someone who has **not read the battery** and
did not write this draft. It contains: questions across the allowlisted repos; entities and task
types unrelated to any battery family; questions the initial allowlist was not chosen for;
**negative queries** whose correct result is an empty pointer list; and, for each positive case,
the file (and locator, where applicable) an expert would open. It is frozen before implementation.
Nobody tunes scoring, extraction, or the allowlist against its failures. Its minimum targets are
the ones fixed in §4 (top-1 file ≥ 70%, top-3 ≥ 85%, negatives empty ≥ 90%, no negative pointer
at `score ≥ 60`); they are set now, not from the first measurement. Implementers keep a separate
development set for formula and extractor changes. The frozen set is run only as the final gate
for each phase, following the no-tuning contract of `eval/holdout-cases.json`.

**Battery role:** regression only. A same-100-id rerun is run and reported; a battery gain is not
the ship reason, and a battery-only gain with a flat locator gate is a stop signal.

## References

- [`research/qa-improvement-plan-2026-08-25.md`](../research/qa-improvement-plan-2026-08-25.md)
  Track C item 1 and §0 ground rules
- [`research/qa-deep-dive-2026-08-25/terra-max.md`](../research/qa-deep-dive-2026-08-25/terra-max.md)
  top-10 rows 1, 3, 8; row 87; the doctrinal-conflict table
- [`research/qa-deep-dive-2026-08-25/fable-max.md`](../research/qa-deep-dive-2026-08-25/fable-max.md)
  §2.1, §2.2 (extendTo), §7 questions 2 and 6
- [`research/qa-deep-dive-2026-08-25/grok-xhigh.md`](../research/qa-deep-dive-2026-08-25/grok-xhigh.md)
  §2 verification table (base reserve, getTransactions)
- [`research/qa-deep-dive-2026-08-25/sol-max.md`](../research/qa-deep-dive-2026-08-25/sol-max.md)
  rows 32, 40, 49
- [`research/decisions/0003-build-time-exposure-filtering.md`](../research/decisions/0003-build-time-exposure-filtering.md)
- [`ARCHITECTURE.md`](../ARCHITECTURE.md) §3 (networkless sandbox, source-basis lane), §4
  (envelope contract), §5 (`codemode.search`), §6 (pins, serve-do-not-store)
- Code anchors: `src/policy/source-basis.ts` (`SOURCE_BASIS_MANIFEST_MAX_CHARS = 1600`),
  `src/catalog/search.ts` (`MAX_SEARCH_LIMIT = 50`), `src/catalog/types.ts`
  (`CATALOG_SERVICES`), `src/adapters/index.ts` (dispatcher), `eval/gates.json` (routing floors
  and holdout contract)
- Findings: `sd-003`, `sd-004`, `sd-043`, `sd-044` under
  [`improvements/stellar-docs/`](../improvements/stellar-docs/)
- Neighboring held source lanes for format precedent:
  [`partner-doc-live-sources.md`](./partner-doc-live-sources.md),
  [`stellar-org-source-lane.md`](./stellar-org-source-lane.md)
