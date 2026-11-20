# Codex Sol Review Challenge — Lane `codesrc` (Item 8.13)

- **Reviewer**: Codex CLI (`codex exec`), resolved model ID `gpt-6.2-sol`, `model_reasoning_effort="high"`, `-s read-only`
- **Reviewed commits**: PR #528 (`bea9af79`) and PR #529 (`2a6e7774`) against merge base `c52dca8a`
- **Review file**: [SOL-REVIEW.md](SOL-REVIEW.md)

## Verdict Summary

| Class | PR #528 (Med / Low) | PR #529 (Med / Low) | Total |
|---|---:|---:|---:|
| **Valid** | 15 (5 / 10) | 8 (5 / 3) | **23** (10 / 13) |
| **Invalid** | 0 | 0 | **0** |
| **Valid, not worth fixing** | 0 | 0 | **0** |

All 23 findings were independently checked against source code, tests, installed dependency code, or live Node probes. Every finding was verified as **valid** and fixed in follow-up commits (`7607f122` on PR #528; `b2b2847b` on PR #529).

---

## PR #528 (`np/8.13-codesrc`) — 15 Findings

### 1. `src/catalog/types.ts:40` (Medium) — **Valid**
- **Sol claim**: Overstated that `"file"` is the only catalog field driving host URLs and blurred format validation vs fetched-byte verification.
- **Verification**: Inspected `src/catalog/types.ts` (Zod schema only checks regexes for URL shape, 40-char git `sha`, and 64-char `sha256`), `src/skills/source.ts` (verifies fetched bytes against `sha256` and git blob `sha`), `src/adapters/scout.ts` (`transport.base` + `path`), and `src/adapters/stellar-docs.ts` (`transport.apiBase`).
- **Action**: Fixed in `7607f122` — restored distinction between schema URL/digest format checks, `src/skills/source.ts` byte verification, and `global_fetch_strictly_public` private-network blocking.

### 2. `src/executor/spec-sandbox.ts:4` (Medium) — **Valid**
- **Sol claim**: Service-global sentence read as part of the spec-search sandbox contract, and the rewrite dropped why `execute` serves `codemode.spec()` over host RPC instead of in-source injection.
- **Verification**: Inspected `src/executor/spec-sandbox.ts` and `src/executor/run.ts`: experimental spec-search passes `[]` (no service providers) to `executor.execute`, while production `execute` injects `codemode` as a provider global (carrying `skill.read`, `artifact.*`, etc.) which an in-source `const codemode` would shadow.
- **Action**: Fixed in `7607f122` — clarified experimental `[]` providers vs production `execute` service globals and the `const codemode` shadowing reason for host RPC.

### 3. `src/executor/providers.ts:4` (Medium) — **Valid**
- **Sol claim**: "never throwing" is false because `buildOpsFns` awaits `callService` without a `try/catch`, and `scout.ts` `fillPathTemplate` calls `encodeURIComponent` before its `try`, rejecting with `URIError` on an unpaired UTF-16 surrogate.
- **Verification**: Read `src/executor/providers.ts` (`buildOpsFns`) and `src/adapters/scout.ts` (`fillPathTemplate` runs before `try`), and ran Node probe `encodeURIComponent("\uD800")` -> threw `URIError: URI malformed`.
- **Action**: Fixed in `7607f122` — narrowed wording to `returning { ok } envelopes for validation and handled adapter outcomes`. (The underlying code behavior is logged under Open Questions in `REPORT.md` because this lane is comments-only.)

### 4. `src/catalog/scoring.ts:357` (Medium) — **Valid**
- **Sol claim**: Described alias canonicalization as a fallback when original scoring fails, whereas `aliasMaxScore` scores both original and canonical forms and takes `Math.max` even when the original passes.
- **Verification**: Inspected `src/catalog/scoring.ts` `aliasMaxScore` and `scoreEntryWeighted`: `aliasMaxScore` unconditionally scores both raw and canonical query when an alias matches, and returns the max; stopword-filtering is a fallback on `null`, and `acronymRescueScore` runs only when gated scoring returns `null`.
- **Action**: Fixed in `7607f122` — restored exact control flow (full query -> stopword fallback on `null`; alias queries take max of original and canonical; acronym rescue on `null`).

### 5. `src/policy/identifier-token.ts:6` (Medium) — **Valid**
- **Sol claim**: Dropped the known false-positive tradeoff where space-separated dates like `"10 SEP 24"` match `sep-24`.
- **Verification**: Inspected regex and normalization in `src/policy/identifier-token.ts`: space before `SEP 24` is permitted for `"Protocol 19 CAP-40"`, so `"10 SEP 24"` / `"SEP 10, 2024"` still extract `sep-24` if a row's source/slug aligns.
- **Action**: Fixed in `7607f122` — restored the accepted space-separated date tradeoff beside the `Protocol 19 CAP-40` rationale.

### 6. `src/mcp/tools.ts:97` (Low) — **Valid**
- **Sol claim**: Named Claude Code's 4,096-char cap while omitting the binding 2,033-char Grok cut on both descriptions and server instructions, and conflated the 117-char description first-line limit with the 200-char instructions first-line limit.
- **Verification**: Read `test/mcp-instructions.test.ts` and `test/helpers/mcp-tool-metadata.ts`: `GROK_CUT_CHARS = 2_033` is the binding ceiling for both tool descriptions and `SERVER_INSTRUCTIONS`, description first line is capped at `117`, and instructions first line is capped at `200`.
- **Action**: Fixed in `7607f122` — cited exact binding test limits (`2,033` overall, `117` description first line, `200` server instructions first line).

### 7. `src/policy/validate.ts:3` (Low) — **Valid**
- **Sol claim**: Claimed Zod v4 cannot convert JSON Schema to Zod, which is stale in pinned `zod@4.6.7`.
- **Verification**: Checked `package-lock.json` (`zod@4.6.7`) and ran live Node probe: `import("zod").then(z => z.fromJSONSchema({ type: "string" }).safeParse("ok"))` -> `{ success: true, data: "ok" }`.
- **Action**: Fixed in `7607f122` — removed the stale Zod limitation claim and kept the real rationale (small hand-rolled validator for the bounded manifest dialect producing concise model-actionable error paths host-side).

### 8. `src/catalog/load.ts:1` (Low) — **Valid**
- **Sol claim**: "Node-safe" is misleading because native Node rejects `import manifestJson from "../../catalog/manifest.json"` without `with { type: "json" }`.
- **Verification**: Ran live Node probe `node -e 'import("./src/catalog/load.ts")'` -> failed with `ERR_IMPORT_ATTRIBUTE_MISSING`. Loads cleanly in Worker/esbuild and Vitest bundlers.
- **Action**: Fixed in `7607f122` — replaced `(Node- and Worker-safe)` with `(no cloudflare:workers import; loads in Worker and Vitest bundlers)`.

### 9. `src/catalog/search.ts:212` (Low) — **Valid**
- **Sol claim**: Stated that every recovery/detail edge requires valid join keys, whereas join-key validation applies only to `detail` edges (`cited-research` recovery edges have no join keys).
- **Verification**: Inspected `refinedCatalogSchema.superRefine` in `src/catalog/search.ts`: all recovery edges must target a distinct exposed operation, while join-key validation is gated specifically on `edge.kind === "detail"`.
- **Action**: Fixed in `7607f122` — separated recovery-edge target invariant from `detail`-edge join-key validation.

### 10. `src/catalog/search.ts:600` (Low) — **Valid**
- **Sol claim**: Described `inputOnly` as emitting "short-doc input types only", hiding that it still emits the two-arm callable line and omits only the output type declaration.
- **Verification**: Inspected `renderSignature` in `src/catalog/search.ts`: `inputOnly` omits the output type block while keeping short-doc input types and the two-arm envelope-typed callable line.
- **Action**: Fixed in `7607f122` — clarified that `inputOnly` omits the output type declaration while keeping short-doc input types and the two-arm callable line.

### 11. `src/catalog/search.ts:1149` (Low) — **Valid**
- **Sol claim**: Conflated `NaN` bypassing `Math.min/max` with `Infinity` (which clamps to min/max rather than bypassing, while `Number.isFinite` defaults all non-finite inputs to `DEFAULT_SEARCH_LIMIT`).
- **Verification**: Verified in JS (`Math.max(1, Math.min(20, Infinity)) === 20`, `Math.max(1, Math.min(20, NaN))` is `NaN`) and read `searchCatalogPage` in `src/catalog/search.ts`.
- **Action**: Fixed in `7607f122` — clarified `NaN` bypass vs non-finite defaulting to `DEFAULT_SEARCH_LIMIT`.

### 12. `src/skills/store.ts:4` (Low) — **Valid**
- **Sol claim**: Stated heading drift fails closed on all reads, whereas targeted section reads fail only on uncataloged headings while whole-skill reads fail on any heading/catalog drift.
- **Verification**: Read `src/skills/store.ts`: section reads look up the requested cataloged heading (refusing uncataloged headings), whereas whole-skill reads compare parsed headings against cataloged sections and fail on drift.
- **Action**: Fixed in `7607f122` — distinguished section reads (refuse uncataloged headings) from whole reads (fail on heading/catalog drift).

### 13. `src/skills/runners/stellar-ecosystem-digest.ts:5` (Low) — **Valid**
- **Sol claim**: Stated unexpected upstream shapes abort with an error envelope, without distinguishing primary payloads (which abort) from optional upcoming-events payloads (which degrade to `null`).
- **Verification**: Inspected `src/skills/runners/stellar-ecosystem-digest.ts`: malformed primary payloads abort with an error envelope; `projectUpcoming` returns `null` for malformed upcoming-events payloads and the digest still succeeds.
- **Action**: Fixed in `7607f122` — specified `unexpected primary payload shapes abort with an error envelope (upcoming events degrade to null)`.

### 14. `src/skills/canary.ts:150` (Low) — **Valid**
- **Sol claim**: "Short edge cache bounds KV reads" overstated the guarantee because missing/unusable verdicts return `503` with `no-store` and hit KV on every request.
- **Verification**: Read `skillHealthResponse` in `src/skills/canary.ts`: `no-store` is returned when no usable verdict exists; `public, max-age=60` applies only on the usable-verdict response path.
- **Action**: Fixed in `7607f122` — narrowed comment to `Cache usable verdicts for 60s to reduce KV reads on this unauthenticated route without hurting freshness.`

### 15. `src/catalog/extract-keywords.ts:3` (Low) — **Valid**
- **Sol claim**: Attributed both `tokenize` and `STOPWORDS` to the vendor, whereas `STOPWORDS` is owned by Raven's `scoring.ts`.
- **Verification**: Checked lines 6–7 of `src/catalog/extract-keywords.ts`: `import { tokenize } from "./vendor/search-scoring.ts"` and `import { STOPWORDS } from "./scoring.ts"`.
- **Action**: Fixed in `7607f122` — updated to `Uses the vendored tokenize and scoring.ts STOPWORDS`.

---

## PR #529 (`np/8.13-codesrc-surfaces`) — 8 Findings

### 16. `src/auth/workos.ts:42` & `214` (Medium) — **Valid**
- **Sol claim**: Dropped the explicit warning that KV `get` + `delete` is non-atomic and eventually consistent, while the nearby callback comment said "Single-use".
- **Verification**: Inspected `handleCallback` in `src/auth/workos.ts` (lines 210–216): `OAUTH_KV.get` followed by `OAUTH_KV.delete` has a race window under concurrent callbacks and relies on Workers KV eventual consistency.
- **Action**: Fixed in `b2b2847b` — updated the callback comment to `Best-effort single-use` and restored the explicit KV non-atomic / eventually-consistent caveat.

### 17. `src/site.ts:1469` (Medium) — **Valid**
- **Sol claim**: Grouped `browser-bound state` as protecting the `/authorize` POST, whereas it protects `/callback` (it is minted only after the POST validates approval and the double-submit CSRF cookie).
- **Verification**: Inspected `src/auth/workos.ts` `/authorize` POST handler and `/callback` handler: POST verifies explicit approval and double-submit CSRF cookie before minting parked state + `__Host-MCP_STATE`; `/callback` checks the binding cookie.
- **Action**: Fixed in `b2b2847b` — separated POST protection (explicit approval + double-submit CSRF token) from `/callback` protection (browser-bound state).

### 18. `src/demo/budget.ts:3` (Medium) — **Valid**
- **Sol claim**: "slightly overrun" understated KV concurrency overrun (N concurrent requests reading the same count can all pass), and "hard per-request caps enforce spend bounds" implied per-request caps bound the hourly bucket.
- **Verification**: Inspected `demoThrottle` in `src/demo/budget.ts`: non-atomic KV read-modify-write can admit concurrent bursts above the hourly cap; `DEMO_CAPS` bounds each individual turn, not the hourly bucket.
- **Action**: Fixed in `b2b2847b` — clarified `can overrun under concurrency (read-modify-write); hard per-request caps bound each turn (not the hourly bucket)`.

### 19. `src/adapters/types.ts:3` (Medium) — **Valid**
- **Sol claim**: Repeated the false "Adapters never throw toward the sandbox" invariant (see finding #3 for `scout.ts` `fillPathTemplate` `URIError`).
- **Verification**: Same verification as finding #3 (`src/adapters/scout.ts` `fillPathTemplate` runs before `try`).
- **Action**: Fixed in `b2b2847b` — reframed as `Expected adapter contract: return { ok: true, data } or { ok: false, error } envelopes ... for upstream/validation outcomes rather than throwing.`

### 20. `src/demo/model-config.ts:126` (Medium) — **Valid**
- **Sol claim**: Listed `"max"` effort (not in `DemoReasoningEffort`, which stops at `"xhigh"`) and claimed `@ai-sdk/anthropic` does not guard 5.x models, which is stale in pinned `@ai-sdk/anthropic@4.0.106`.
- **Verification**: Read `src/demo/model-config.ts` (`DemoReasoningEffort` stops at `"xhigh"`) and inspected `node_modules/@ai-sdk/anthropic/dist/index.js`: the pinned SDK already lists `claude-fable-5`, `claude-fable-5-1`, `claude-fable-5-2` and checks `rejectsThinkingDisabled` / `rejectsThinkingDisabledAboveHighEffort`.
- **Action**: Fixed in `b2b2847b` — updated effort list to `low|medium|high|xhigh`, removed the stale SDK-lack claim, and stated Raven's current policy (explicit adaptive thinking + `low` floor to keep the Anthropic payload under our control; 4.x ids fall through to `{}`).

### 21. `src/adapters/scout.ts:5` (Low) — **Valid**
- **Sol claim**: Omitted precedence (`meta.partial` / `"backend read failed"` is checked before `meta.error`), that `meta.error` must be non-empty, and that a malformed JSON 404 returns `error`.
- **Verification**: Inspected response handling in `src/adapters/scout.ts`: `meta.partial` / warning check runs before `meta.error`; empty `meta.error: ""` stays `ok`; malformed JSON returns `error`.
- **Action**: Fixed in `b2b2847b` — stated precedence and `non-empty meta.error` cleanly (`meta.partial` or warning maps to `error` even with partial rows; otherwise 404 and non-empty `meta.error` map to `soft-empty`). (Left the malformed-JSON parse-error case implicit in the 5-line file header because all JSON adapters return `error` on malformed JSON.)

### 22. `src/adapters/stellar-docs.ts:5` (Low) — **Valid**
- **Sol claim**: Omitted that the query-term soft-empty check only fires when at least one topic term survives normalization (stopword-only queries like `"how to"` return `ok`).
- **Verification**: Inspected `src/adapters/stellar-docs.ts` topic-term filter: if no topic terms survive normalization, the filter does not convert in-scope results to `soft-empty`.
- **Action**: Fixed in `b2b2847b` — added `when surviving topic terms exist, results whose kept sections contain none return soft-empty`.

### 23. `src/demo/page.ts:221` (Low) — **Valid**
- **Sol claim**: "Dynamic content uses `textContent` only" obscured `createTextNode` and the `a.href` Markdown link sink (which relies on URL filtering).
- **Verification**: Inspected `src/demo/page.ts` Markdown renderer (around line 474): uses `textContent` and `createTextNode` for text nodes, and restricts `a.href` to `http(s)` or same-origin paths.
- **Action**: Fixed in `b2b2847b` — updated to `Dynamic text uses textContent/createTextNode (no innerHTML); Markdown links allow only http(s) or same-origin paths.`
