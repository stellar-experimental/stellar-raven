FAIL

Rechecked `215598c4..6bcee35833a97bae28fbde7f5987c21d7d2b1fab` against the reconciliation brief and the lead's decisions. All original reproducer commands are now handled as decided, and the five targeted test files pass (261 tests). Three adjacent ordinary command forms still bypass the guard, and a heredoc parser regression blocks routine document construction. Reconcile the findings below before approval. None requires a stronger adversarial threat model or changing the agreed fail-open policy for malformed input.

1. **Major — `env -C` does not reach the nested shell's working-directory analysis.**

   Locations: `scripts/agent-hooks/case-search-guard.mjs:630`, `:740`, `:753`, `:763`.

   Both commands return `{deny:false}` from `decide`, and the installed-hook subprocess in the synthetic checkout also allows them (exit 0, no deny output). Executing each in that scratch checkout exits 0 and prints one protected canary:

   ```sh
   env -C eval/qa bash -c 'grep CANARY *.json'
   env -C src bash -c 'rg -g "*.json" CANARY ../eval'
   ```

   `segmentVerdict` applies `cwdShift` only to the outer resolved command. `walk` propagates its environment into the nested script, but no cwd; `collectCwd` collects only `cd`/`pushd` targets. The nested shell is consequently analyzed from the original repository root. This is an ordinary combination of the newly supported directory-changing wrapper and shell execution, in the same scope as original findings 1 and 3.

   Fix: carry the effective wrapper cwd into nested command analysis, or include wrapper-resolved directories in the conservative cwd set before evaluating nested scripts. Resolve the shift before resolving any relative `cd` in that script; use unknown scope when it cannot be established. Add both canary regressions, plus a safe scoped control.

2. **Major — `timeout -- DURATION COMMAND` mistakes the duration for the executable.**

   Locations: `scripts/agent-hooks/case-search-guard.mjs:379`, `:386`, `:418`.

   ```sh
   timeout -- 5 grep -r CANARY eval
   ```

   `decide` returns `{deny:false}`; the hook subprocess allows it; real execution in the scratch repository exits 0 and prints one protected canary. The `--` branch breaks out of wrapper parsing before consuming the required timeout duration, so the outer resolution loop returns command name `5`. `--` is a normal option terminator, not a deliberate bypass. The original `timeout 5 ...` test does not cover it.

   Fix: separate wrapper option parsing from required positional operands. For `timeout`, consume the duration after the option terminator and then resolve its command. Add deny tests for `timeout -- 5 grep -r ...` and `timeout -k 1 -- 5 rg -u ...`, and a pass control with a harmless wrapped command.

3. **Major — valid brace globs containing slashes trigger an internal regex error and fail open.**

   Locations: `scripts/agent-hooks/case-search-guard.mjs:574`, `:576`, `:582`.

   ```sh
   grep CANARY {eval/qa,src}/*.json
   rg CANARY {eval/qa,src}/*.json
   ```

   With a harmless `src/safe.json` and a protected `eval/qa/cases.json` in the scratch checkout, both real commands exit 0 and print one protected canary. Both decision-function calls throw `Invalid regular expression: /^(?:eval$/i: Unterminated group`. Both hook subprocesses exit 0 without deny output and print the fail-open diagnostic.

   `globPositionalReaches` splits the path on `/` before interpreting braces, turning a valid shell alternation into the incomplete component `{eval`. This is the same ordinary wildcard-ancestor coverage required by original finding 2. The agreed fail-open contract is operating correctly; the defect is treating valid, routine shell syntax as a parser failure.

   Fix: handle brace alternatives before component splitting, or conservatively classify an active brace expression spanning components as unknown risky scope without compiling incomplete regex fragments. Keep the agreed fail-open behavior for actual parse errors. Add these two canary tests and a safe brace-glob control.

4. **Minor — unquoted heredoc substitution scanning uses offsets into the wrong string.**

   Locations: `scripts/agent-hooks/case-search-guard.mjs:124`, `:146`, `:151`, `:155`.

   This document-construction command is denied as `recursive grep` by both the decision function and the hook subprocess:

   ```sh
   cat <<EOF_DOC
   $(date +%F)
   The policy forbids the following command:
   grep -r X eval
   EOF_DOC
   ```

   Bash only runs `date` and prints the remaining lines as document text. Synthetic execution exits 0 and performs no search. `substitutions(text)` indexes the heredoc body, but its `skipSubstitution` helper closes over the entire outer `input`. The mismatched offsets cause the extracted substitution to swallow later literal body lines, which `walk` analyzes as executable commands. This is not the accepted conservative false positive for ordered negative globs or cwd sets.

   Fix: pass the string being scanned explicitly to the substitution matcher and use offsets relative to that same string. Add a pass regression for this interpolated document, and retain deny tests for an actual search inside a heredoc substitution. Exercise both `$()` and backticks.

Disposition of the original eight findings:

| Original finding | Recheck result |
|---|---|
| 1. Assignment quoting, continuations, wrappers, last opt-in assignment | Original examples fixed. The new timeout option-terminator gap remains (finding 2 above). |
| 2. Partial quoting, ancestor wildcards, unresolved paths | Original examples fixed; safe `src` scopes pass. Slash-containing brace alternatives remain a related gap (finding 3 above). |
| 3. Subshell/substitution cwd and repeated Git `-C` | Original examples fixed under the expressly accepted conservative cwd-set policy. Wrapper cwd does not reach nested scripts (finding 1 above). |
| 4. Shell-fed heredocs | Original shell-fed heredoc now denies; quoted document heredocs and the authorized shell opt-in pass. Interpolated ordinary documents have the new false positive in finding 4 above. |
| 5. Malformed corpus JSON prints text | Fixed. API and CLI tests preserve failure while suppressing synthetic private markers. The deviation to a sorted position and category folder instead of a case filename is acceptable and avoids disclosing a case id. |
| 6. Git-quoted filenames omitted | Fixed. Non-ASCII and quote filenames now each count 63 shingles; targeted tests also cover newline and space names, deleted files, diagnostic escaping, and the explicit symlink skip. |
| 7. Default runner error leakage | The identified paths are fixed: protocol contract errors use positions, stale overlap-list errors use list positions, and runner JSON parsing uses a sanitized file diagnostic. The default routing gate/manifest-error tests pass their leakage checks; the new synthetic error tests pass. The documented legacy-overlay id exception is outside the held-out-id guarantee. |
| 8. Grep abbreviations, command query modes, opt-in propagation, ordered negative globs | Fixed as decided. The retained deny for ordered negative globs is expressly documented and accepted. |

The `.agents/*` deviation is acceptable: expanding to the `rounds` parent still allows ripgrep to apply the parent `.ignore`; the protected round children are not explicitly named by that expansion. The conservative cwd-set false positives are also the lead's explicit decision, not new findings.

Verification and limits:

- Original probe rerun: `PATH="$PWD/tmp/bin:$PATH" node tmp/codex-review-probes.mjs`; output `tmp/codex-recheck-original-probes.log`. All 14 risky command rows deny; the `.agents` Markdown control passes. Real ripgrep was available through the shim, and the scratch executions confirm canary output for the denied risky forms. All three ratchet filename counts are 63; malformed input exits 1 with no marker in stderr.
- Extended synthetic probe: `tmp/codex-recheck-probes.mjs`; output `tmp/codex-recheck-probes.log`. It creates and removes its own scratch Git checkout, copies only the hook and three ignore files into it, compares pure decisions with actual hook-process output, and executes candidate searches only there. Unsuccessful exploratory candidates in the log are not findings; e.g. Git rejects glued `-Csrc`, so it does not establish a bypass. The explicit opt-in followed by `unset` is also not used to support this verdict.
- Targeted tests ran as owned hc child `7.1-codex-recheck-tests` (`t1wy`): `test/case-search-guard.test.mjs`, `test/case-text-scan.test.mjs`, `test/runner-error-text.test.mjs`, `test/run-routing-manifest-evidence.test.mjs`, and `test/protocol-history-report.test.mjs`. **5 files, 261 tests passed**, exit 0, 31.21 s. Log: `tmp/codex-recheck-tests.log`. The real-repository ratchet test took 3.106 s, below the plan's approximately five-second threshold.
- Four 200-line commands were measured: quoted document heredoc, unquoted document heredoc, shell-script heredoc, and a document with 200 harmless command substitutions. Direct decisions took approximately **0.14, 0.78, 1.53, and 2.11 ms**; fresh hook processes took **22.9, 26.5, 36.4, and 38.2 ms**, respectively. All exited 0 without diagnostic output or timeouts. No performance defect found in these requested normal-size probes; this is not an adversarial complexity proof.
- The hook still imports only Node built-ins and does not execute command input. No additional case-content error leak was found in the revised ratchet or the identified runner error paths. The bypass findings concern real searches being allowed, demonstrated with synthetic data only.
- Opened no forbidden case file or golden-round record. Approved tests accessed their normal inputs and exposed test results/derived counts. No model-calling eval, tracked-file edit, commit, deployment, or full-gate rerun was performed. The only writes were review artifacts under ignored `tmp/` and synthetic scratch files. The pre-existing untracked item directory is unchanged.
