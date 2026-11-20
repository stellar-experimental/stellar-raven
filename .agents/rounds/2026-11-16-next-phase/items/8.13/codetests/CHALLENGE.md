# Codex Sol review challenge — item 8.13 (`codetests`)

- Reviewer: `codex` CLI (`gpt-6.2-sol`, effort `high`, sandbox `read-only`)
- Review record: `.agents/rounds/2026-11-16-next-phase/items/8.13/codetests/SOL-REVIEW.md`
- Scope verification by reviewer: 0 non-comment token changes across all 59 modified files; 0 files outside `test/`.

## Summary

| Verdict | Count |
|---|---|
| valid | 10 (4 medium, 6 low) |
| invalid | 0 |
| valid but not worth fixing | 0 |

Every finding caught a real precision regression introduced while tightening comments in the first pass. All 10 were independently verified against the source/test/library code and fixed.

## Findings

### Medium

1. **`test/demo-model-config.test.ts:137`** — **valid** (fixed)
   - Claim: Comment said `store: false` "enables Zero Data Retention", whereas Zero Data Retention is already a gateway/org setting.
   - Evidence: Verified in `src/demo/model-config.ts:117-124` ("The demo gateway is Zero Data Retention, so OpenAI never persists response items... `store: false` makes `@ai-sdk/openai` request `reasoning.encrypted_content`").
   - Fix: Updated comment to state that the gateway is Zero Data Retention and `store: false` makes the SDK request `reasoning.encrypted_content` instead of replaying unstored response IDs.

2. **`test/policy.test.ts:334`** — **valid** (fixed)
   - Claim: Dropping the padding math hid why `pad: "x".repeat(maxChars - 30)` is load-bearing (`secret` must straddle the 24k cut while `[REDACTED]` fits inside it).
   - Evidence: Verified exact serialized offset in `test/policy.test.ts:335-346`: `{"pad":"` (8) + `maxChars - 30` + `","leak":"` (10) = `maxChars - 12`, placing 12 chars of the 29-char `secret` before `maxChars` and 17 after, while `[REDACTED]` (10 chars) stays inside the kept prefix. Moving the secret fully before the cut would let clip-then-redact pass the same assertions.
   - Fix: Restored one line explaining that padding must place the 29-char secret across the 24k cut while `[REDACTED]` fits inside the kept prefix.

3. **`test/smoke/demo-openai-tool-request.test.ts:15`** — **valid** (fixed)
   - Claim: Shortened header hid that `capturedToolLoop()` reconstructs `streamText` directly without calling `src/demo/chat.ts`, while `test/smoke/server.test.ts` stops before model calls.
   - Evidence: Verified in `test/smoke/demo-openai-tool-request.test.ts:106-138` (calls `streamText` directly using `prepareDemoStep`) and `rg` over `test/demo-chat.test.ts` (no direct `prepareDemoStep` assertion there).
   - Fix: Added one sentence stating that the tool-loop test reconstructs `streamText` directly without running `src/demo/chat.ts`, and `server.test.ts` stops pre-model.

4. **`test/skill-runners.test.ts:346`** — **valid** (fixed)
   - Claim: Saying "the fetch-stub test below and code review enforce confinement" overstated what a single-input fetch-stub test enforces and dropped that runners run host-side (not in the isolate).
   - Evidence: Verified in `test/skill-runners.test.ts:379-388`: `inputs` runs only one input per runner (`{ subject: "RWA tokenization" }`, theme mode only), so a `fetch` call on an unexercised branch would not be caught by the stub test alone.
   - Fix: Reworded to state that this is a static drift belt (not a sandbox boundary) and that runners run host-side, so single-input fetch-stub tests support first-party code review rather than replacing runtime isolation.

### Low

5. **`test/auth.test.ts:314`** — **valid** (fixed)
   - Claim: Saying a credential-less 401 carries "only the protected-resource pointer" conflicts with the provider emitting `realm="OAuth"` and `scope="..."` alongside `resource_metadata`.
   - Evidence: Verified in `node_modules/@cloudflare/workers-oauth-provider/dist/oauth-provider.js:4954-4962` (`buildWwwAuthenticateHeader` emits `Bearer realm="OAuth"`, `resource_metadata="..."`, and `scope="..."`).
   - Fix: Updated comment to describe a Bearer challenge with `resource_metadata`, no `error=`, and an empty body.

6. **`test/adapters.test.ts:2`** — **valid** (fixed)
   - Claim: Saying "recorded fixtures" obscured that the Mintlify (`stellar-docs-*`) fixtures are synthetic.
   - Evidence: Verified against the pre-edit header and `test/fixtures/stellar-docs-*.json`; only Lumenloop and Scout fixtures are recorded responses, while `stellar-docs-*` are synthetic Mintlify-shaped fixtures.
   - Fix: Updated header to say "recorded fixtures and synthetic Mintlify fixtures".

7. **`test/qa-judge-evidence.test.mjs:1099`** — **valid** (fixed)
   - Claim: Saying "only the value collapses" over-generalized beyond the NUL and terminated control sequences in that test, conflicting with the neighboring truncated-sequence test where both key and value redact.
   - Evidence: Verified `test/qa-judge-evidence.test.mjs:1098-1118` (NUL and terminated ANSI/C1/OSC forms preserve the key and redact the value) vs `test/qa-judge-evidence.test.mjs:1178-1215` (unterminated sequences redact both key and value).
   - Fix: Scoped the comment to "for these NUL and terminated sequences, the property name stays intact and only the value collapses".

8. **`test/qa-measure-harness.test.mjs:148`** — **valid** (fixed)
   - Claim: "Three paraphrases of one missing fact exceed the 2 key facts; no coverage share is emitted" read as conditional on exceeding `keyFacts`, whereas coverage share is retired for every row.
   - Evidence: Verified `test/qa-measure-harness.test.mjs:112-172`: `MEASUREMENT_METRIC_KEYS` omits coverage share unconditionally across all rows.
   - Fix: Clarified that the three paraphrases illustrate why `missingFacts` is never counted as a coverage ratio (coverage share is retired for every row).

9. **`test/search.test.ts:106`** — **valid** (fixed)
   - Claim: "any single match triggers tier-2 backfill" is inaccurate when a single matched token passes tier 1 (e.g., `"stellar"` fills from tier 1 with zero backfill).
   - Evidence: Verified `test/search.test.ts:94-96` and `src/catalog/search.ts`: tier 2 runs only when tier 1 returns fewer than `limit` hits.
   - Fix: Changed to "even weak overlap can surface tier-2 backfill on an otherwise-empty page".

10. **`test/skill-content-not-vendored.test.ts:3`** — **valid** (fixed)
    - Claim: The header allowlist omitted verbatim `##` section headings and single-line companion-file titles, which the same file asserts at lines 23–34 and 42–47.
    - Evidence: Verified `test/skill-content-not-vendored.test.ts:23-34` (`expect(e.description, e.id).toBe(heading)`) and `42-47` (`keeps every companion-file entry to a single-line title`).
    - Fix: Added verbatim section headings and single-line companion-file titles to the header list.
