# Challenge of Codex Sol Review — Item 8.13 (`docsroot`)

- **Reviewer:** Codex Sol (`gpt-6.2-sol`, effort `high`, read-only)
- **Reviewed diff:** `git diff origin/main...HEAD` at `738d9008`
- **Review file:** `.agents/rounds/2026-11-16-next-phase/items/8.13/docsroot/SOL-REVIEW.md`
- **Verdict summary:** 26 valid (2 with partial challenges to Sol's own claims, 1 partially split), 0 invalid, 1 valid but not worth fixing (plus 1 sub-item of F23 not worth fixing).

Every finding below was independently checked against `origin/main`, `HEAD`, and the cited source files.

## Findings and verdicts

### F1 (High) — `AGENTS.md:138` — Release authority
- **Verdict:** **valid** (fixed)
- **Evidence:** `origin/main:AGENTS.md:151-152` states: *"These apply only to the lead session the owner started and works with. Lanes, reviewers, harness runs, and other tools do not merge or deploy; they report to their lead."* Our rewrite dropped *"started and"*, *"and other tools"*, and *"; they report to their lead."* Restored all three conditions verbatim.

### F2 (High) — `AGENTS.md:175` — Exposure applies to host output too
- **Verdict:** **valid** (fixed)
- **Evidence:** `origin/main:AGENTS.md:190` had *"Never emit a reference to a non-exposed operation or a retired skill."* as a standalone imperative covering host-emitted text (`scripts/build-family-text.mjs:91`, `scripts/build-catalog.mjs`). Merging it into the *"Model code never owns..."* sentence narrowed its grammatical subject to model code. Restored as a standalone sentence.

### F3 (Medium) — `AGENTS.md:86` — Evaluation independence
- **Verdict:** **valid** (fixed)
- **Evidence:** `origin/main:AGENTS.md:92` requires *"questions written independently of the goldens."* Our rewrite shortened this to *"independent questions,"* weakening the anti-leakage constraint. Restored *"questions written independently of the goldens."*

### F4 (Medium) — `AGENTS.md:73` — API billing requirements
- **Verdict:** **valid** (fixed)
- **Evidence:** `origin/main:AGENTS.md:76-78` requires exceptions *"listed with its reason"* and states *"Every API-billed run carries a dollar cap and is recorded with its cost."* Our rewrite omitted the reason and attached the cap/cost clause to *"exceptions"* rather than per run. Restored both requirements explicitly.

### F5 (Medium) — `AGENTS.md:157` — Model effort limits
- **Verdict:** **valid** (fixed)
- **Evidence:** `origin/main:AGENTS.md:171` says *"Run every tier at high effort. Escalate to xhigh only for..."* Our rewrite softened this to *"Default effort is `high`. Escalate to `xhigh` for..."* Restored the mandatory baseline and *"only"* qualifier.

### F6 (Medium) — `AGENTS.md:107` — Terminal exceptions must identify the target
- **Verdict:** **valid** (fixed)
- **Evidence:** `origin/main:AGENTS.md:118` requires *"an exception that names the exact target."* *"A targeted exception"* is looser. Restored *"an exception that names the exact target."*

### F7 (Medium) — `AGENTS.md:171` — Forward-only deviations need evidence
- **Verdict:** **valid** (fixed)
- **Evidence:** `origin/main:AGENTS.md:186` ends with the standalone rule *"A deviation needs evidence."* Attaching *"without evidence"* only to the compatibility-shim clause narrowed its scope. Restored the standalone sentence.

### F8 (Low) — `AGENTS.md:71` — Local Wrangler requirement expands
- **Verdict:** **valid** (fixed)
- **Evidence:** `origin/main:AGENTS.md:75-76` separates *"Tests and evals run against the local `wrangler dev` server."* from *"Evals, judging, testing and building run on subscription CLIs..."* Merging them implied `npm run build` (an offline dry-run at `package.json:17`) needs `wrangler dev`. Restored the separate sentence.

### F9 (Low) — `AGENTS.md:66, 78` — Two spend qualifiers disappeared
- **Verdict:** **valid** (fixed)
- **Evidence:** `origin/main:AGENTS.md:71` specifies *"in every comparison"* and `:83-84` specifies *"approval or signature."* Restored both qualifiers.

### F10 (Low) — `AGENTS.md:101` — Wait command not copyable
- **Verdict:** **valid** (fixed)
- **Evidence:** Inside inline code, `` `hc wait --children any|all` `` would be parsed as a shell pipe to `all`. Changed to `` `hc wait --children any` or `hc wait --children all` ``.

### F11 (Low) — `ARCHITECTURE.md:27, 241` and PR diff size
- **Verdict:** **valid** (fixed)
- **Evidence:** `ARCHITECTURE.md:27` packed 7 sentences into one ~1,100-char line and `:241` packed 5 telemetry topics into one 560-char bullet; the combined diff was 1,535 changed lines (just over the ~1,500 threshold in `8.13-SLIM.md`). Split both blocks into short bullets and reduced unnecessary line-wrap churn in `AGENTS.md`, bringing the total 8-file diff well below 1,500 changed lines.

### F12 (Medium) — `docs/operations.md:13` — Deploy override hides what it bypasses
- **Verdict:** **valid** (fixed)
- **Evidence:** Verified in `scripts/deploy-preflight.mjs:21-56`: preflight runs `git fetch --quiet origin main`, fails closed on fetch failure, dirty tree, unreadable refs, or `HEAD !== origin/main`, and `DEPLOY_ALLOW_UNCLEAN=1` skips the entire preflight and deploys the working tree as-is (`origin/main:docs/operations.md:14-15`). Restored all of these details.

### F13 (Medium) — `docs/operations.md:35, 61` — Canary `200` can predate the deploy
- **Verdict:** **valid** (fixed)
- **Evidence:** Verified in `src/skills/canary.ts:178-214` and `scripts/classify-canary.mjs:64-73`: `/health/skills` returns `200` whenever stored `record.ok === true` without checking age, and returns `503` if missing, failed, or unreadable/invalid. Updated deploy verification step 4 to require `checkedAt` after the deploy and noted unreadable/invalid verdicts in the Health checks table.

### F14 (Medium) — `ARCHITECTURE.md:27` — OAuth origin rejection is conditional
- **Verdict:** **valid** (fixed)
- **Evidence:** Verified in `src/server.ts:234-255`: `canonicalHostRedirect`, `authenticateApiKey`, and `allowDevUnauthenticated` run before `selectOAuthOrigin`. Restored *"Any request reaching `selectOAuthOrigin` from an unsupported origin..."* (`origin/main:ARCHITECTURE.md:40-41`).

### F15 (Medium) — `ARCHITECTURE.md:193` — Playground body limit mixes bytes and characters
- **Verdict:** **valid** (fixed)
- **Evidence:** Verified in `src/demo/chat.ts:88, 124-127, 573-574`: `MAX_BODY_CHARS = 384 * 1024`; `Content-Length > 384 * 1024` returns `413`, and decoded `raw.length > 393_216` returns `400 bad_request`. Updated the table row to state both checks concisely.

### F16 (Medium) — `docs/stellar-docs.md:176` — Docs A/B requirement reads as narrower than the contract
- **Verdict:** **valid** (fixed)
- **Evidence:** `origin/main:docs/stellar-docs.md:217` applied the A/B bar to *"A change inside Raven, such as a new scope or a guard change"*, matching `AGENTS.md`. Shortening it to *"Scope or guard changes"* appeared to exempt ranking changes. Restored broader phrasing (*"Any Raven-side search change (e.g. a new scope, guard change, or ranking adjustment)"*).

### F17 (Low) — `docs/operations.md:53` — KV propagation is variable
- **Verdict:** **valid** (fixed)
- **Evidence:** `origin/main:docs/operations.md:59-61` stated *"can take 60 seconds or more"* and *"Revocation is not an immediate emergency control."* Changing it to *"takes 60s+"* implied a minimum delay. Restored conditional wording and the emergency-control warning.

### F18 (Low) — `ARCHITECTURE.md:187` — Loopback Playground auth does not mint a `dev-loopback` cookie
- **Verdict:** **valid** (fixed)
- **Evidence:** Verified in `src/demo/chat.ts:73, 115-117`: `dev-loopback` is a fallback subject when `verifyDemoCookie` returns null and `allowDevUnauthenticated` passes—no cookie is minted. Reworded to state this directly.

### F19 (Low) — `ARCHITECTURE.md:201` — `Promise.all` preflight is narrower than stated
- **Verdict:** **valid** (fixed; partial challenge to Sol's quote)
- **Evidence:** Verified in `src/demo/tools.ts:273-282`: `demoExecutePreflightError` parses via `parseExpressionAt(code, 0, { ecmaVersion: "latest" })` and returns `null` if that parse throws, so it only catches detected expression-parseable calls. **Challenge note:** Sol's recommended text *"Restore 'rejects detected object-literal `Promise.all` calls before execution'"* fabricated an `origin/main` quote; `origin/main:ARCHITECTURE.md:360` actually read *"Reject known-invalid `Promise.all({ ... })` before execution."* Fixed concisely to *"rejects detected `Promise.all({ ... })` before running."*

### F20 (Low) — `ARCHITECTURE.md:231` — Generated-output staleness is checked by tests and CI
- **Verdict:** **valid** (fixed; partial challenge to Sol's attribution)
- **Evidence:** Confirmed that builders regenerate outputs rather than checking staleness (except `build-super-spec.mjs:561` checking manifest vs runner registry); saying *"Builders fail on ... stale generated outputs"* was imprecise (`origin/main:ARCHITECTURE.md:417` said *"checks reject stale generated outputs"*). **Challenge note:** Sol attributed staleness detection solely to `.github/workflows/ci.yml:123-140`, missing that unit tests (`test/super-spec.test.ts:140` and `test/family-text.test.mjs:28,36`) also fail on stale generated outputs during `npm test`. Fixed to name both unit tests and the CI artifact-sync gate.

### F21 (Low) — `ARCHITECTURE.md:213` — Artifact ledger holds up to 12 calls
- **Verdict:** **valid** (fixed)
- **Evidence:** Verified in `src/artifacts/store.ts:204, 264-290`: `fitCustomMetadata` pops entries from `opLedger.calls` to stay under the 8,192-byte metadata cap. Changed *"first 12 calls"* to *"up to 12 calls within cap."*

### F22 (Low) — `THIRD-PARTY-NOTICES.md:36` — Skill notice overstates what is derived
- **Verdict:** **valid** (fixed)
- **Evidence:** Verified in `scripts/build-catalog.mjs:1023-1026, 1075-1088` and `test/skill-content-not-vendored.test.ts:49-54`: 45 companion files in `catalog/manifest.json` commit their first H1/H2 title (or filename fallback), and whole-skill descriptions fall back to the first paragraph or skill name if frontmatter omits `description`. Updated the paragraph to accurately list all committed metadata and fallbacks.

### F23 (Low) — `docs/stellar-docs.md:47, 114` — Mintlify absence and redirect conditions
- **Verdict:** **valid** on absence test & `/index` redirect trigger (fixed); **valid but not worth fixing** on response-path omission fallback
- **Evidence:** Verified in `src/adapters/stellar-docs.ts:42, 95, 125, 454-466, 483`: both endpoints share `ABSENT_MESSAGES`, and a path already ending in `/index` probes for a redirect after one absent lookup. Fixed both cleanly. Left out the edge case where a redirected Mintlify page response omits `page.path` (`stellar-docs.ts:483`)—that is an upstream-bug fallback, not part of the operator contract.

### F24 (Low) — `docs/stellar-docs.md:89` — Title search uses a weighted score
- **Verdict:** **valid** (fixed)
- **Evidence:** Verified in `src/adapters/stellar-docs.ts:391-402`: `groupPages` scores `2` per title term match + `1` per path term match, breaking ties by upstream rank (two path matches tie one title match). Stated the exact weights and tie-break.

### F25 (Low) — `docs/stellar-docs.md:139` — Docs query-term guard applies to the result set + hints
- **Verdict:** **valid** (fixed)
- **Evidence:** Verified in `src/adapters/stellar-docs.ts:515-537`: the guard runs only when `terms.length > 0` and passes if at least one in-scope section matches; only the path-scope branch hints `stellarDocs.search_docs` (empty upstream hints rephrasing; zero-term-match hints rephrasing or corroborating with Lumenloop/Scout). Fixed all three cases accurately.

### F26 (Low) — `docs/stellar-docs.md:105` — Snippets are biased toward text after the match
- **Verdict:** **valid but not worth fixing**
- **Evidence:** Verified in `src/adapters/stellar-docs.ts:337-346`: the window starts at `Math.max(0, at - Math.floor(SNIPPET_CHARS / 3))` (~100 chars before the match, ~200 after) and falls back to index 0 when no term matches. However, *"centered on the first query term"* was already in `origin/main:docs/stellar-docs.md:126` and `specs/stellar-docs.json`, and 100 vs 150 chars of lead-in changes no operator or agent decision. Not worth adding verbosity in a slimming lane.

### F27 (Low) — `docs/stellar-docs.md:98` — Anchor uniqueness is relative to the deployed snapshot
- **Verdict:** **valid** (fixed)
- **Evidence:** Verified in `src/adapters/stellar-docs.ts:291-298`, `scripts/build-stellar-docs-anchors.mjs:147-155`, and `origin/main:docs/stellar-docs.md:226-227`: slimming dropped the note that the anchor index is a snapshot and live headings can drift until refreshed. Restored concise snapshot notes in both the `url` description and `Anchor index` under `Maintenance`.
