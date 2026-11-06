# OpenAI branch integration review — 2026-11-06

**Recommendation: integrate the complete additive package and three TODOs, with the sanitization and toolchain repairs now in the working tree; squash the local candidate commits before publication.** No reason was found to discard the submission package or deployed challenge-service source. This lane does not authorize plugin publication, sending correspondence, or removing/deploying the challenge Worker. Root owns final cross-review, baseline validation, promotion, and cleanup.

## Scope and disposition

Reviewed all three unique commits of `codex/openai-review-remediation` (`82a83917`) against main `e62c2b97`, with merge-base `b1dc8663`:

- `8b39faf1`: retain the plugin manifest/MCP configuration/icon, dated eight-case report/evidence, submission documentation, and standalone verification Worker.
- `2555740d`: retain the October 23 resubmission outcome and unsent follow-up as historical records.
- `82a83917`: retain consolidation, exception, and eventual Worker-removal tasks; correct their status and removal conditions.

The root's initial cherry-picks were `ae724744`, `02e9707d`, and `ac36b5f5`. The original delta is 19 files, confined to `plugins/openai/` and 56 added TODO lines. No shared Raven runtime, auth, tool annotation, catalog, or deployment configuration changed. Subsequent root/sibling edits elsewhere were preserved.

## Findings and repairs

1. **Private account context — repaired.** Removed personal email/legal identity, unrelated organization verification, billing/biometric narrative, private plugin/version identifiers, and the credential-file location from public notes. No password, OAuth token, API-key value, partner-tier detail, or production usage aggregate was found in the imported payload. The public domain challenge, Cloudflare account/route/version IDs, public Stellar issuer addresses, public SCF award figures, and controlled rehearsal call counts are not credentials or private production counts. Artifact handles were already omitted.
2. **Misleading present-tense claims — repaired.** Portal state, reviewer access, exception correspondence, and rehearsal results are explicitly dated. Corrected the contradictory outstanding-declarations sentence. Preserved the original manifest hash/date as the October snapshot: current main has the same 60 operations/20 skill entries, but a different manifest hash/date. Preserved the genuine policy discrepancy: `src/site.ts` describes query/response logs for 30 days; `docs/operations.md` describes operational metadata retention of at most seven days. The TODO now tracks that publication follow-up without changing legal text.
3. **TODO errors — repaired.** The challenge Worker has no secrets or service bindings. Corrected the consolidation cross-reference and made removal conditional on no remaining verification requirement, including a meaningful withdrawal completion condition.
4. **Vulnerable development toolchain — repaired under root's later authorization.** Initial `npm audit` returned nine high-severity dependency entries. Updated `cf` from beta.13 to beta.28 and `@cloudflare/vite-plugin` from beta.sha-52b0dc0e9 to beta.v.12; regenerated the lockfile with npm, without force or overrides. Transitive fixes include `sharp` 0.35.4 → 0.35.5, `undici` 7.29.1 → 7.30.1, and `zod` 4.4.3 → 4.6.6. The updated CLI requires a newer Node patch, so the nested package declares `^24.22.0`; validation used an isolated Node 24.22.0, leaving system Node unchanged. Final audit: **zero vulnerabilities**.

Exact underlying advisories: sharp `GHSA-wq5f-xc86-pv6w`; zod `GHSA-mrhx-c7xc-m3w5`; undici `GHSA-4qv8-2p9j-2685`, `GHSA-f72v-6w45-q472`, `GHSA-xjj6-f33q-929c`, `GHSA-4w7w-5xrc-9h26`, `GHSA-2m5v-pch6-74hx`, `GHSA-qrxm-fqhp-jwvm`, `GHSA-9fm3-97px-rjf6`, and `GHSA-55wc-3pg8-jfw6`. Audit totals count affected dependency entries, not distinct advisories. These were development dependencies; inspection of the generated Worker found only the fixed-response handler.

## Validation

- Passed `npm run secrets:scan -- --tree` before and after repairs. Separate redacted gitleaks scan of `b1dc8663..82a83917` passed across all three commits.
- Both upload JSON files pass the locally saved Agent Plugins 1.0.0 JSON schemas using Ajv 2020. The saved 0.1.2 ZIP passes CRC and contains exactly the three matching source files. Manifest SHA-256 matches the rehearsal evidence; the PNG is byte-identical to the existing brand icon. Manifest, MCP config, icon, case report, and evidence JSON remain unchanged.
- Evidence case totals, verdict totals, call counts, and response-hash formats are consistent. The recorded 0.1.2 negatives have zero tool calls. This is a structural evidence review, not a new live run or independent factual regrade of every answer; raw response hashes alone cannot establish source support.
- Worker checks passed for GET, HEAD, wrong method (405/Allow), wrong host/path (404), and trailing slash (404). No direct network, storage, secret, or binding access exists in its handler.
- Nested `npm ci --ignore-scripts`, `npm run typecheck`, `npm run build`, and `npm audit` passed on Node 24.22.0. One intermediate build failed because an outer `npm exec --call` configuration reached cf's nested npx; rerunning directly with the isolated Node on PATH passed. No source workaround was needed.
- Markdown file targets and `git diff --check` passed. Root reports baseline and budget tests complete; this lane did not repeat them. Root-level typecheck/build alone do not validate the nested Worker package.

## Remaining boundaries

Current portal/publisher/credential status and live route requirements were not rechecked. The recorded exposure and artifact-annotation findings still require written disposition; merging this package does not solve them. Retain the challenge Worker until its removal condition is established. Existing eight-case results remain dated, one-run Codex rehearsals, not approval or current reliability evidence. No Git/GitHub mutation, message to OpenAI, deploy, or runtime implementation edit was performed by this lane. Independent cross-review is the remaining integration gate.

## Cleanup confirmation

Confirmed after cross-review acceptance: every owned command terminal was removed (`t2vn`, `t2vp`,
`t2vt`, `t2vv`, `t2vw`, `t2vz`, `t2w1`, `t2w3`, `t2w4`, `t2w5`); the current terminal inventory
contains no live child of this lane (`t2vh`). Both generated nested directories,
`plugins/openai/domain-verification/node_modules` and `plugins/openai/domain-verification/.cloudflare`,
are absent. No source files were edited during this cleanup confirmation.
