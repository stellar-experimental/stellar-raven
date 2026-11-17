FAIL

Reviewed `131c6c1c..215598c4b76acb95cee04f77a25d44f927f8afd5` against the brief, AGENTS.md, PLAN.md's overriding reconciliation, and EXEC.md. The new tests pass, but ordinary shell forms bypass the hook and two ratchet failure modes defeat its stated guarantees. Reconcile these before approval.

1. **Major — command recognition loses ordinary environment prefixes and wrapper options.**

   Locations: `scripts/agent-hooks/case-search-guard.mjs:120`, `:224`, `:244`, `:259`.

   The decision function returns `{deny:false}` for all of these; executing each only in a synthetic checkout prints a protected canary:

   ```sh
   LC_ALL="C" grep -r CANARY eval
   LC_ALL=C \
   rg --no-ignore CANARY eval
   command -p grep -r CANARY eval
   env -i grep -r CANARY eval
   git ls-files | xargs -r rg CANARY
   ```

   Quoting an assignment's value marks the whole token quoted, so `resolveCommand` treats the assignment as the executable. Backslash-newline is retained instead of removed. The shared wrapper option table treats `command -p`, `env -i`, and `xargs -r` as taking arguments, consuming the actual executable. These are routine locale prefixes, multiline formatting, and empty-input protection, not adversarial syntax.

   Fix: preserve enough lexical information to distinguish quoted assignment values from quoted command names; remove shell line continuations; give each supported wrapper its own option arities and execution/query modes. Add the commands above to the deny table. As part of environment handling, use the effective last assignment: `CASE_TEXT=maintenance CASE_TEXT=normal grep -r CANARY eval` currently passes and prints the canary despite the final value being `normal`.

2. **Major — partially quoted globs, wildcard ancestors, and variable paths defeat path coverage.**

   Locations: `scripts/agent-hooks/case-search-guard.mjs:370`, `:382`.

   These all return `{deny:false}` and print a protected canary in the scratch checkout:

   ```sh
   grep CANARY "eval/qa/"*.json
   grep CANARY */*/*.json
   rg -g '*.json' CANARY "$PWD/eval"
   ```

   The first has an active unquoted wildcard, but any quote causes `shellGlobOverCases` to skip the entire token. The second expands into `eval/qa/cases.json` despite lacking a literal `eval/` prefix. The last is evaluated as a fictitious literal `$PWD` directory, making the guard believe the positive glob is scoped away from protected entries.

   Fix: track active unquoted metacharacters independently of quoted portions; compare glob patterns against protected paths even when wildcards occur in ancestor components. Do not treat unresolved expansion-bearing paths as proven-safe scopes. Resolve known safe values such as `$PWD` without executing input, or conservatively deny the risky search form when scope cannot be established. Test safe literal `src` scopes alongside these regressions.

3. **Major — working-directory state is applied across the wrong shell scopes and Git options.**

   Locations: `scripts/agent-hooks/case-search-guard.mjs:420`, `:489`, `:510`.

   Both commands return `{deny:false}` and print a protected canary:

   ```sh
   (cd src && true); rg -g '*.json' CANARY
   echo "$(rg -g '*.json' CANARY)"; cd src
   ```

   A subshell's `cd` incorrectly changes the guard's parent cwd. Conversely, every command substitution is analyzed with the final cwd after all segments, although the substitution above runs before `cd src`.

   There is also a Git-specific instance: `gitCwd` stops when it reaches the operand of the first `-C`, so it never processes a second `-C`. This returned allow and printed the scratch canary:

   ```sh
   git -C . -C eval grep CANARY -- . ':!eval/qa' ':!eval/corpus' \
     ':!eval/holdout-cases.json' ':!eval/protocol-history-blind-cases.json' \
     ':!eval/protocol-history-blind-cases-v2.json' \
     ':!.agents/rounds/2026-11-02-golden-audit' \
     ':!.agents/rounds/2026-11-14-golden-coverage-audit'
   ```

   The real Git cwd is `eval`, making those exclusions miss the actual protected files; the guard evaluates them from the repository root.

   Fix: associate substitutions with their segment's cwd and preserve subshell scope. Track possible cwd states conservatively across uncertain control flow. Consume Git global-option operands correctly, apply every `-C` sequentially, and keep `:(top,exclude)` resolution local to its own pathspec rather than mutating the cwd for subsequent pathspecs. Add canary tests for these cases.

4. **Major — heredocs executed by a shell are treated as inert document bodies.**

   Locations: `scripts/agent-hooks/case-search-guard.mjs:187`, `:494`.

   This returns `{deny:false}` and prints the scratch protected canary:

   ```sh
   bash <<'EOF_SCRIPT'
   grep -r CANARY eval
   EOF_SCRIPT
   ```

   The tokenizer discards the quoted heredoc body. The shell branch only examines a `-c` argument. Quoting the delimiter suppresses the outer shell's expansions; Bash still executes the body. This is a normal way to run a multiline script.

   Fix: retain heredoc association with the receiving command. Analyze bodies supplied as script input to supported shells, while continuing to allow literal heredocs passed to `cat`, `git commit -F -`, and PR-body construction. Add both deny and pass regressions.

5. **Major — the ratchet can print case text when corpus JSON is malformed.**

   Location: `eval/qa/case-text-scan.mjs:47` and the unsanitized call from the repository test.

   `JSON.parse(readFileSync(file, "utf8"))` can throw an error containing source text. The exception escapes `caseShingles`, `scanCaseText`, and the CLI; test runners can also render its message. In a wholly synthetic battery, replacing one case file with `SYNTHETIC_PRIVATE_CASE_TEXT` and invoking `scanCaseText` in a subprocess produces exit 1 and stderr containing that exact marker. Thus “paths and counts only, never text” does not hold on failure.

   Fix: catch parsing/validation errors at the individual corpus-file boundary and replace them with a fresh path-only or position-only diagnostic. Do not retain the original exception as a printable cause. Ensure both the exported API/test path and CLI are sanitized. Add a subprocess regression checking stdout and stderr for synthetic private markers on malformed input, while preserving a failing exit status.

6. **Major — the ratchet silently skips Git-quoted filenames.**

   Location: `eval/qa/case-text-scan.mjs:65`.

   `git ls-files -co --exclude-standard` uses quoted/escaped output for some filenames, but the scanner splits on newlines and opens those strings as literal paths. The read fails and is silently ignored. With the same synthetic 70-word golden copied into three files, the scan reports:

   | File | Count |
   |---|---:|
   | `plain.md` | 63 |
   | `résumé.md` | 0 / absent |
   | `quoted"name.md` | 0 / absent |

   Both omitted files exceed the 50-shingle floor. A naturally named document can therefore carry a bulk copy without failing the gate.

   Fix: use `git ls-files -z -co --exclude-standard` and split on NUL. Escape filenames for diagnostics so embedded newlines cannot forge output lines. Add synthetic non-ASCII, quote, and newline filename tests. Consider failing on unexpected read errors rather than silently treating them as clean; keep any legitimate deleted-file handling explicit.

7. **Major — default runner errors still expose case IDs, contrary to the new documented guarantee.**

   Locations: `eval/README.md:89`, `eval/run-routing.mjs:276` and `:564`, `eval/run-protocol-history.mjs:50` and `:69`; callees `eval/lib/protocol-history-source-epoch.mjs` and `eval/lib/confirmation-only.mjs`.

   Normal routing runs now suppress rows correctly, and the changed holdout card-resolution error is safe. Other reachable failures remain unsanitized. A synthetic `evaluateProtocolHistory` input with an otherwise qualifying contract header and `requiredCases: [{id:"SYNTHETIC_PRIVATE_ID", question:""}]` throws a message containing `SYNTHETIC_PRIVATE_ID`; the protocol runner lets it escape to stderr. The confirmation-only stale-list error likewise includes the listed case ID, and routing prints `err.message` verbatim. Malformed case JSON is another content-bearing exception path.

   These paths predate this diff and EXEC.md acknowledges them, but the new README says errors never name IDs, and review requirement 5 includes default stderr. The passing normal/manifest-mismatch tests do not exercise these paths.

   Fix: sanitize case-related parsing and validation failures to case/list positions at their source, or provide a runner error boundary that cannot echo case text. Preserve exit 1 and useful file/position diagnostics. Add synthetic malformed-contract and stale-list failure tests that inspect only derived leakage counts. Do not broaden real-case access for this review.

8. **Minor — remaining option semantics create a recursive-search bypass and routine false positives.**

   Locations: `scripts/agent-hooks/case-search-guard.mjs:260`, `:375`, `:448`, `:494`.

   Concrete decision-function results:

   - `grep --rec CANARY eval` returns allow and prints the protected scratch canary: GNU grep accepts the unambiguous abbreviation of `--recursive`, but the guard only matches the complete spelling.
   - `command -V git grep` returns deny even though it only reports command definitions.
   - `rg --hidden -g '*.json' -g '!eval/**' -g '!.agents/**' X .` returns deny despite the later negative globs excluding every protected subtree. The implementation tests whether any positive glob reaches an entry without accounting for later exclusions.
   - `CASE_TEXT=maintenance bash -c 'grep -r X .'` returns deny: the environment prefix is not propagated to the nested shell, unlike its real execution semantics. This blocks a legitimate maintenance form. The duplicate-assignment opt-in leak is covered in finding 1.

   Fix: normalize accepted recursive grep option abbreviations; distinguish wrapper query modes; respect ordered glob exclusions where safety can be proven; propagate the effective environment into child-shell scripts (but not into outer-shell command substitutions, where a command-local assignment has different semantics). Add regressions, or explicitly document intentionally conservative false positives where that is the chosen policy.

Validation and safety observations:

- Ran the five targeted files through `hc` child `7.1-codex-review-tests` (`t1ww`), with real ripgrep on PATH: **5 files, 152 tests passed**, exit 0, 31.30 seconds. The repository ratchet took 3.128 seconds, under the plan's 5-second threshold. Log: `tmp/codex-review-tests.log`.
- The `.ignore` entries and parent-folder behavior are pinned and pass the real-ripgrep synthetic test. CI installs ripgrep in the test job. No layout defect found within the tested scopes.
- The runner diff leaves result serialization and scoring/exit branches unchanged. Existing tests confirm zero counted held-out IDs on the normal routing gate and manifest-mismatch path, and nonzero only with `--rows`. The extracted protocol-history reporter passes its synthetic aggregate/rows tests; the source-expired limitation described in EXEC.md remains.
- The reviewed hook imports only Node built-ins and does not execute/evaluate command input or spawn commands. It reads the three ignore files, returns documented deny JSON with exit 0, and fails open as specified. The five-second configured timeout limits hook stalls. Repository hook code remains code trusted from the checked-out branch: built-in-only imports do not authenticate future PR modifications to the script. I found no input-to-code execution in the reviewed implementation.
- Routine scoped searches, literal commit messages, and literal PR bodies tested here pass. Findings 1–4 explain why the documentation currently overstates the command forms the hook denies; finding 7 identifies the runner documentation mismatch.
- Reproducer: `node tmp/codex-review-probes.mjs`; captured results: `tmp/codex-review-probes.log`. It imports the reviewed modules, reads only the three real ignore files, creates its own temporary Git repository and synthetic case/canary files, runs candidate searches only there, prints command/verdict/count evidence, and removes that scratch tree. The malformed-protocol probe used synthetic in-memory input only.
- Opened no forbidden case files or golden-audit records. The approved test harnesses accessed their normal inputs and exposed only test results/derived counts. No paid/model-calling eval, tracked-file edit, commit, or deployment was performed.
