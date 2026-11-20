# Codex Sol Review Challenge — Item 8.13 Lane `codetools` (PR 2/2: `eval/**` code files)

- Reviewer: Codex CLI (`gpt-6.2-sol`, `model_reasoning_effort="high"`, read-only)
- Source review: `.agents/rounds/2026-11-16-next-phase/items/8.13/codetools/SOL-REVIEW-eval.md`
- Scope reviewed: `git diff origin/main...HEAD` on branch `np/8.13-codetools-eval` (PR #535)

## Verdict Summary

| Class | Count |
|---|---|
| Valid (confirmed and fixed) | 8 |
| Invalid | 0 |
| Valid but not worth fixing | 1 |

## Finding-by-Finding Verification

1. **High — `eval/report-live-surface.mjs:11` ("never printed" vs HTTP error body echo)**
   - **Verdict:** Valid — fixed.
   - **Evidence:** Confirmed at `eval/report-live-surface.mjs:50-52` and `:128`: `throw new Error(\`${url} → HTTP ${response.status}: ${text.slice(0, 200)}\`)` is printed to stderr, so a server echoing the `Authorization` header would surface it. (This wording predated our edit, and logic changes are out of scope for this comment-only lane.) Updated the header comment to state that the token is not logged directly while HTTP error paths still print up to 200 chars of response text.

2. **Medium — `eval/qa/run-qa.mjs:683` / `eval/qa/paired-verdict.mjs:636` (`qaImplementationSha256` changes)**
   - **Verdict:** Valid but not worth fixing.
   - **Evidence:** Confirmed at `eval/qa/run-qa.mjs:673-690`: `sourceIdentity()` hashes the raw UTF-8 bytes (including comments) of every `.mjs` file under `eval/qa/` and `eval/lib/`. Any comment edit in those directories changes `qaImplementationSha256` by construction, and lane `codetools` explicitly scopes comments in `eval/**` code files. Standard paired collection (`eval/qa/paired-collection-supervisor.mjs`) runs both baseline and candidate arms from the same runner checkout so both arms share the same `qaImplementationSha256`. Flagged in `REPORT.md` so the orchestrator can hold merging PR #535 if an in-flight paired run relies on a pre-PR baseline artifact.

3. **Medium — `eval/qa/agent-result.mjs:10` (collection-contract schema bump rule)**
   - **Verdict:** Valid — fixed.
   - **Evidence:** Confirmed from the pre-edit comment: v4 bumped because answering-agent isolation changed (affecting what the MCP connection record proves), not only JSON field shape. Updated the comment to say "Bump on breaking shape or collection-contract changes".

4. **Medium — `eval/qa/evidence-sanitizer.mjs:2` ("credential-free" overstatement)**
   - **Verdict:** Valid — fixed.
   - **Evidence:** Pattern- and key-name-based redaction cannot guarantee removal of arbitrary opaque standalone values (this wording predated our edit). Updated to "pattern-redacted" and "redacts known credential patterns and sensitive JSON keys".

5. **Medium — `eval/qa/evidence-sanitizer.mjs:658` (why no second plaintext pass + stack vs `JSON.stringify`)**
   - **Verdict:** Valid — fixed.
   - **Evidence:** Confirmed at `redactSensitiveValues` (explicit stack) and `sanitizeStructuredJson` (`JSON.stringify`). Clarified both the explicit-stack redaction vs single `JSON.stringify` pass and the exact failure mode (rescanning serialized JSON as plaintext consumes closing quotes and corrupts following fields).

6. **Medium — `eval/agentic/reconcile-capture.mjs:8` (adversarial trust boundary detail)**
   - **Verdict:** Valid — fixed.
   - **Evidence:** Restored the concrete reason adversarial isolation does not hold: the same-user evaluated process can modify the capture file or call upstream directly.

7. **Low — `eval/qa/source-sentinels.mjs:13` (exit 2 condition with `--previous` carried drift)**
   - **Verdict:** Valid — fixed.
   - **Evidence:** Confirmed at `eval/qa/source-sentinels.mjs:301` and `:314`: `carryDrift()` converts fetch errors into `verdict: "drift"` before line 314 checks `results.every((r) => r.verdict === "error" && !unread.has(r.id))`. Updated the header comment to state the exact exit-2 condition.

8. **Low — `eval/qa/agent-result.mjs:58` (safeguard markers scoped to `is_error` responses)**
   - **Verdict:** Valid — fixed.
   - **Evidence:** Confirmed at `eval/qa/agent-result.mjs:264-274`: `PROVIDER_SAFEGUARD_MARKERS` is only tested when `resultMessage?.is_error` is true, so a normal answer quoting the marker passes normally (the pre-edit comment claimed "neither appears in a model-authored answer"). Updated the comment to state that markers are checked on `resultMessage.is_error` responses.

9. **Low — `eval/run-routing.mjs:9` (`--dump-ranked` omits holdout)**
   - **Verdict:** Valid — fixed.
   - **Evidence:** Confirmed in `eval/run-routing.mjs` that `--dump-ranked` covers legacy, extended, skills, and protocol-history lanes, excluding holdout. Added "excluding holdout" to the header summary so it matches the flag comment.
