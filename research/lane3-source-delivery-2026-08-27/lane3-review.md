# Lane 3 draft review

Verdict: **CHANGES-REQUESTED**

## Scope

I reviewed the assignment brief and the complete draft.
I checked each cited research file in the main checkout.
I also checked the current architecture, catalog types, adapter dispatch, source-basis code, and routing gates.
This was a read-only audit, except for this review file.

## Measurement summary

| Criterion | Result | Reason |
| --- | --- | --- |
| Owner philosophy | Partial | The pointer-only design is clear. The dispute behavior and validation set still need correction. |
| ADR-0003 doctrine | Partial | The manifest and network boundaries fit. The scrub, envelope, binding, and flag details do not. |
| Workers host-adapter feasibility | Not ready | The query path, index access, CPU budget, and result budget remain unresolved. |
| Alternatives matrix | Needs correction | Option B uses a false model-boundary claim. Option C requests unavailable Git metadata. |
| Sizing | Understated | The design omits storage work and several cross-cutting surface changes. |
| Open questions | Partial | All five required questions appear. Several implementation-blocking questions remain absent. |
| Evidence accuracy | Mostly accurate | The Quickstart, RPC, reserve, and SEP claims match the cited records. The `extendTo` classification does not. |
| General utility | Not demonstrated | The three claimed non-battery cases closely repeat battery cases and findings. |

## Findings

### High — The draft does not define how each result obtains a query-scored pointer

Locations: draft lines 92-94, 117-149, and 234-238.

The top-level `search` and `codemode.search` paths have a query.
The `execute` source-basis path does not have the user's question.
The current `execute` contract accepts only `{ code }` (`ARCHITECTURE.md:312-315`).
Its source basis receives calls, metadata, URLs, and artifact state (`src/executor/run.ts:502-510`).

Build-time attachment cannot select the best pointer for a future query.
Static role and service-family attachment can only supply broad candidate sets.
The R2 or KV proposal covers `sources.locate`, but not normal search-hit projection.

This gap prevents correct `score`, `matchReason`, and overflow values on `execute` results.
It also risks returning generic pointers that do not match the user's question.

Smallest repair:

- Define one query source for every projection.
- Let both search paths query the full locator index with their existing query.
- Add source-basis pointers only after an explicit `sources.locate({ q })` call in that execute run.
- Do not infer a question from arbitrary code or operation arguments.
- State the exact storage, load, cache, and failure path used by both search projections.

### High — The proposed card counts cannot fit the current result budgets

Locations: draft lines 90-95, 113-124, and 234-238.

The source-basis block has a hard 1,600-character limit (`src/policy/source-basis.ts:3`).
Eight complete `SourcePointer` cards cannot fit with the existing ledger and guidance.
Each card includes two 40-character hashes, a path, a URL, a reason, and other fields.

The top-level search allows 50 hits (`src/catalog/search.ts`, `MAX_SEARCH_LIMIT`).
Five pointers per hit can therefore emit 250 full cards.
The draft gives no search-response byte budget or deduplication rule.

This design can displace existing evidence or create very large MCP results.
Its stated overflow count does not solve the byte limit.

Smallest repair:

- Use one response-level, deduplicated source table.
- Let hits reference compact source IDs.
- Set separate byte budgets for search and source basis.
- Keep only one or two compact pointers in source basis.
- Send callers to paged `sources.locate` results for the remaining pointers.
- Add worst-case response-size measurements to the ship gate.

### High — The general-utility evidence remains coupled to the golden corpus

Locations: draft lines 177-195 and 266-272.

The RPC case repeats the `getTransactions` and retention problem family.
The SEP case uses SEP-6 and `sd-009`, which already supports a battery row.
The CAP case reuses the `extendTo` miss named in the brief.

These questions can be absent from the battery while remaining battery-derived variants.
The proposed 20-question probe uses the same shapes.
This does not demonstrate utility beyond the corpus.

Smallest repair:

- Freeze an independent locator evaluation before implementation.
- Have an author who did not read the battery create the questions.
- Include unrelated repositories, entities, task types, and negative queries.
- Include questions that did not motivate the initial allowlist.
- Do not tune against failed cases after the set is frozen.
- Keep the battery as a regression check only.

### Medium — The runtime cannot infer a source disagreement from role labels

Locations: draft lines 75-77, 119-121, 220, and 246-248.

An implementation pointer and a documentation pointer can agree.
Different `authorityRole` values do not prove a content conflict.
Raven does not read either source at request time.
It therefore cannot state that the sources disagree.

This behavior adds a host opinion that the pointer-only design cannot verify.
It conflicts with the owner's instruction to show sources without taking opinions.

Smallest repair:

- Say that multiple authority roles matched the same entity.
- Return all matching roles without declaring agreement or disagreement.
- Tell the calling agent to compare the sources before making a claim.
- Keep known disputes in dated research, not inferred runtime metadata.

### Medium — Several doctrine details conflict with current ADR-0003 behavior

Locations: draft lines 68, 72-76, 126-132, and 266-269.

The design adds a new host capability, although it adds no direct sandbox network access.
Those are different statements.

Draft line 76 applies `scrubNonExposedRefs` to pointer text.
ADR-0003 forbids runtime payload scrubbing of relayed evidence.
The scrub currently applies to served skill bodies (`ARCHITECTURE.md:600-609`).

The draft also omits the locator operation's envelope cases.
The architecture distinguishes data-shaped empty, `soft-empty`, and `error` (`ARCHITECTURE.md:439-450`).

Draft line 74 says nothing enters `Env`.
An R2 or KV design needs a Worker binding, although that binding need not contain a secret.
The phase-one flag also lacks build-time or runtime semantics.
Runtime-conditional exposure would conflict with the manifest doctrine.

Smallest repair:

- State that the sandbox gains a manifest operation, but no direct outbound network.
- Guard Raven-authored text at build time, and preserve source identifiers unchanged.
- Define no matches as `ok: true` with an empty pointer list.
- Define invalid arguments and index failures as `error` outcomes.
- State whether any real upstream empty response can produce `soft-empty`.
- Say that no new secret enters `Env`; list any required binding.
- Define the flag as a build or deployment choice with a matching manifest.

### Medium — The scoring contract is not implementable or accurately gated

Locations: draft lines 157-175.

The design calls every signal query-independent.
However, entity match and authority-role fit depend on the query or selected hit.
The intended rule is general scoring without per-question exceptions.

The `high`, `medium`, and `low` weights do not define a numeric score.
A single total score also does not explain why the pointer ranked.

The claimed holdout rule is inaccurate.
The current routing gate uses floors and a one-percent legacy band (`eval/gates.json:55-72`).
It does not require zero top-one movement.
The routing gate also cannot measure source-pointer correctness.

Smallest repair:

- Replace “query-independent” with “uniform and free of per-question rules.”
- Define numeric components, normalization, decay, tie order, and score range.
- Return compact score factors when they help the calling agent.
- Add a frozen source-locator ranking gate.
- Keep the existing routing gate as a separate no-regression check.

### Medium — The alternatives matrix contains false implementation claims

Locations: draft lines 197-205 and 242-245.

Option B says every fetched body crosses the model boundary and gets cut.
That is false for a host operation called inside `execute`.
The full result enters the sandbox, and only the returned projection crosses the boundary.
The source-basis guidance states this behavior (`src/policy/source-basis.ts:276-286`).

The owner's philosophy still rejects Option B.
The matrix should use that direct reason and its actual operating costs.

Option C requests a file `mtime` from Git.
Git blobs do not carry file modification times.
The design can return a commit date or `verifiedAt` instead.

The licensing question starts with an unsupported conclusion that pointers carry no license burden.
The index also stores extracted headings, symbols, and match terms.
The open question must not decide the legal answer first.

Smallest repair:

- Correct Option B's data-flow description.
- Keep its owner-philosophy conflict as the decisive reason.
- Replace `mtime` with supported provenance metadata.
- Ask the attribution question without a legal conclusion.

### Medium — The `extendTo` miss is misclassified as a source-delivery failure

Locations: draft lines 41-53 and 188-192.

`sol-max.md:118` says a result exposed `max_entry_ttl` and the final answer lost the minus-one.
`fable-max.md:87` classifies the row as `ANSWER-FAIL`.
`terra-max.md:87` classifies its carrier as `EXPOSED` and its fix as `output-contract`.

The cited evidence does not place this row in a missing-source or second-voice class.
A precise CAP pointer can still help similar questions.
However, this row does not prove that the proposed mechanism fixes its recorded failure.

Smallest repair:

- Move `extendTo` to a precision use case.
- State that its effect remains unproven for this recorded answer failure.
- Keep Quickstart, RPC, and base-reserve as the direct source-delivery evidence.

### Medium — The phase plan understates work and contains internal conflicts

Locations: draft lines 151-155 and 252-275.

The allowlist says it contains implementation and specification roles only.
The same sentence includes `stellar/stellar-docs` with a `reference-docs` role.

The first phase defers Markdown heading locators.
Two of the three general-use examples require SEP or CAP heading locators.

The current catalog service enum and adapter dispatcher are closed lists.
A `sources` namespace needs changes in both (`src/catalog/types.ts:33`, `src/adapters/index.ts:23-35`).
It also needs schema generation, super-spec coverage, projections, telemetry, and tests.

The plan does not size R2 or KV provisioning, index loading, caching, or Worker CPU costs.
Scoring tens of thousands of pointers per request needs a measured CPU and memory gate.
The multi-language symbol extractor also needs dependency and parser decisions.

Smallest repair:

- Size the complete program as large until the storage and CPU spike finishes.
- Add a phase-zero spike for pointer count, bytes, parse time, lookup time, and Worker memory.
- Start with one or two repositories and `sources.locate` only.
- Add automatic result attachments after the index path meets its budget.
- Align phase-one locators with the cases used for its ship gate.
- Add open questions for query ownership, index availability, CPU limits, conflict grouping, and flag semantics.

## Preserved strengths

The draft clearly keeps repository content outside Raven's result payloads.
It uses pinned refs, paths, hashes, verification URLs, and explicit match reasons.
It keeps secrets host-side and preserves `globalOutbound: null`.
It rejects per-question locators, golden-derived indexes, and battery-only fields.
It includes every required owner question about freshness, degraded clients, cost, line ranges, and attribution.
It also gives honest risks for stale pins, unsupported repositories, and clients without fetch tools.

No repository files changed.
