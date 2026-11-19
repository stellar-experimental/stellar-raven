/**
 * The case-search guard (scripts/agent-hooks/case-search-guard.mjs): a table of commands it must
 * deny and must pass, real PreToolUse payloads piped to the script, and the settings wiring.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { decide, formatOutput, loadEntries, parsePayload } from "../scripts/agent-hooks/case-search-guard.mjs";

const REPO = join(import.meta.dirname, "..");
const SCRIPT = join(REPO, "scripts/agent-hooks/case-search-guard.mjs");
const entries = loadEntries(REPO);

const bash = (command, cwd = REPO) => decide({ toolName: "Bash", toolInput: { command }, cwd, entries, projectDir: REPO });
const grepTool = (toolInput, cwd = REPO) => decide({ toolName: "Grep", toolInput, cwd, entries, projectDir: REPO });

const FULL_EXCLUSION = [
  ":!eval/qa",
  ":!eval/corpus",
  ":!eval/holdout-cases.json",
  ":!eval/protocol-history-blind-cases.json",
  ":!eval/protocol-history-blind-cases-v2.json",
  ":!.agents/rounds/2026-11-02-golden-audit",
  ":!.agents/rounds/2026-11-14-golden-coverage-audit",
]
  .map((spec) => `'${spec}'`)
  .join(" ");

const MUST_DENY = [
  // recursive grep, every spelling
  "grep -r X .",
  "grep -R X .",
  "grep -rn X src",
  "grep -nr X src",
  "grep -inrE 'a|b' .",
  "grep --recursive X .",
  "grep --dereference-recursive X .",
  "grep -d recurse X .",
  "grep -drecurse X .",
  "grep --directories=recurse X .",
  "egrep -r X .",
  "fgrep -r X .",
  "/usr/bin/grep -r X .",
  "\\grep -r X .",
  // command position behind wrappers, separators and substitutions
  "sudo grep -r X .",
  "env FOO=1 grep -r X .",
  "command grep -r X .",
  "echo start; grep -r X .",
  "true && grep -r X .",
  "false || grep -r X .",
  "cat list | grep -r X .",
  "(grep -r X .)",
  "{ grep -r X .; }",
  "echo $(grep -r X .)",
  'echo "$(grep -r X .)"',
  "echo `grep -r X .`",
  "bash -c 'grep -r X .'",
  'sh -c "cd src && grep -r X ."',
  "eval 'grep -r X .'",
  "cat <<EOF\n$(grep -r X .)\nEOF",
  "cd eval && grep -r X .",
  // git grep without a full exclusion
  "git grep X",
  "git -C . grep X",
  "git --no-pager grep X",
  "git grep X -- ':!eval/qa' ':!eval/corpus'",
  "git grep X -- eval/qa/corpus",
  // file lists into a search
  "git ls-files | xargs grep X",
  "git ls-files | xargs rg X",
  "find . -name '*.json' | xargs -n1 grep X",
  "find . -type f -exec grep X {} +",
  "find . -type f -exec rg X {} +",
  "rg X $(git ls-files)",
  "rg X `git ls-files`",
  "grep X $(git ls-files)",
  // rg flags that drop the ignore files
  "rg -u X",
  "rg -uu X",
  "rg -uuu X",
  "rg -iu X",
  "rg --unrestricted X",
  "rg --no-ignore X",
  "rg --no-ignore-vcs X",
  "rg --no-ignore-dot X",
  "rg --no-ignore-parent X",
  // positive globs that re-include a file-level entry
  "rg -g '*.json' X",
  "rg -g'*.json' X",
  "rg --glob '*.json' X eval",
  "rg --glob='*.json' X",
  "rg --iglob '*CASES*' X",
  "rg -g '*cases*' X",
  "rg --files -g '*.json'",
  "rg --hidden -g '*.json' CANARY eval",
  "rg -g '*.json' -g '!*.ts' X",
  "rg -g 'qa/*.json' X",
  "rg -g '*' X",
  // shell globs and brace lists over the case folders
  "rg X eval/qa/*",
  "rg X eval/*",
  "rg X eval/qa/*.json",
  "rg X ./eval/qa/*.json",
  "rg X eval/qa/{cases,sample}.json",
  "rg --hidden X .agents/rounds/*",
  "grep X eval/qa/*.json",
  `grep X ${REPO}/eval/qa/*.json`,
  "cd eval/qa && rg X *",
  // environment prefixes and wrapper options (Codex review, finding 1)
  'LC_ALL="C" grep -r X .',
  "LC_ALL='C' rg --no-ignore X eval",
  "LC_ALL=C \\\nrg --no-ignore X eval",
  "grep -r \\\n  X .",
  "command -p grep -r X .",
  "env -i grep -r X .",
  "env -u FOO grep -r X .",
  "env FOO=1 BAR=2 grep -r X .",
  "env -S 'grep -r X .'",
  "env -C eval rg -g '*.json' X",
  "git ls-files | xargs -r rg X",
  "git ls-files | xargs -0 grep X",
  "git ls-files | xargs -n 1 -P 4 grep X",
  "git ls-files | xargs -I {} rg X {}",
  "timeout 5 grep -r X .",
  "timeout -k 1 5 grep -r X .",
  "timeout --signal=KILL 5 rg -u X",
  "nice -n 5 grep -r X .",
  "nice -10 grep -r X .",
  "sudo -u root grep -r X .",
  "nohup grep -r X . &",
  "CASE_TEXT=maintenance CASE_TEXT=normal grep -r X .",
  "CASE_TEXT=maintenance env -i grep -r X .",
  "CASE_TEXT=maintenance env -u CASE_TEXT grep -r X .",
  'CASE_TEXT="maintenance" CASE_TEXT="" grep -r X .',
  // globs: partial quotes, wildcard ancestors, variable paths (finding 2)
  'grep X "eval/qa/"*.json',
  "rg X 'eval/qa/'*",
  "grep X 'eval/qa/'*.json",
  "grep X */*/*.json",
  "grep X ./*/*/*.json",
  "grep X eval/*/cases.json",
  "rg X eval/qa/c*",
  "rg X eval/q?/cases.json",
  "rg -g '*.json' X \"$PWD/eval\"",
  "rg -g '*.json' X \"${PWD}/eval\"",
  "rg -g '*.json' X $PWD",
  "rg -g '*.json' X \"$SOMEWHERE\"",
  "rg -g '*.json' X $UNSET/x",
  'rg X "$PWD/eval/qa/"*.json',
  // working directory: every possible cwd, subshells, substitutions, git -C (finding 3)
  "(cd src && true); rg -g '*.json' X",
  "cd src; (cd .. && true); rg -g '*.json' X",
  "echo \"$(rg -g '*.json' X)\"; cd src",
  "cd src && cd ../eval/qa && rg -g '*.json' X",
  "cd eval && (rg -g '*.json' X)",
  "cd eval && echo $(rg -g '*.json' X)",
  "cd \"$SOMEWHERE\" && rg -g '*.json' X src",
  `git -C . -C eval grep X -- ${FULL_EXCLUSION}`,
  "git -C eval grep X -- ':(top,exclude)eval/qa' ':!.agents'",
  "git -C \"$SOMEWHERE\" grep X",
  // heredocs fed to a shell (finding 4)
  "bash <<'EOF'\ngrep -r X .\nEOF",
  "bash <<EOF\ngrep -r X .\nEOF",
  "sh <<-'EOF'\n\trg -u X\n\tEOF",
  "bash -s <<'EOF'\ngrep -r X .\nEOF",
  "zsh <<'EOF'\nrg -g '*.json' X\nEOF",
  "bash <<< 'grep -r X .'",
  "env bash <<'EOF'\ngrep -r X .\nEOF",
  "cat <<'EOF' | bash\nls\nEOF\nbash <<'EOF'\ngit grep X\nEOF",
  // option abbreviations GNU grep accepts (finding 8)
  "grep --rec X .",
  "grep --recur X .",
  "grep --recursive X .",
  "grep --dereference X .",
  "grep --dere X .",
  "grep --dir=recurse X .",
  "grep --directories recurse X .",
  // ordered negative globs stay denied: an accepted false positive, `rg X src` is the substitute
  "rg --hidden -g '*.json' -g '!eval/**' -g '!.agents/**' X .",
  // re-check: wrapper cwd carries into a shell script, timeout's terminator, brace globs
  "env -C eval/qa bash -c 'grep X *.json'",
  "env -C src bash -c 'rg -g \"*.json\" X ../eval'",
  "env -C src env -C ../eval rg -g '*.json' X",
  "env -C eval/qa bash -c 'cd .. && grep X qa/*.json'",
  "env -C eval sh <<'EOF'\nrg -g '*.json' X\nEOF",
  'env -C "$SOMEWHERE" bash -c \'rg -g "*.json" X\'',
  "timeout -- 5 grep -r X .",
  "timeout -k 1 -- 5 rg -u X",
  "timeout --foreground -- 5 grep -r X .",
  "grep X {eval/qa,src}/*.json",
  "rg X {eval/qa,src}/*.json",
  "rg X {src,eval}/*",
  "rg X {src,{eval/qa,test}}/*.json",
  "rg -g '*.json' X {src,eval}",
  "rg X {a,b}{c,d}{e,f}{g,h}{i,j}{k,l}{m,n}/*.json",
  // heredoc substitutions run for real
  "cat <<EOF\n$(date +%F)\n$(grep -r X eval)\nEOF",
  "cat <<EOF\n`grep -r X eval`\nEOF",
  "cat <<EOF\ntext\n`rg -u X`\nEOF",
];

const MUST_PASS = [
  "grep X file",
  "grep -n X file.txt",
  "grep -e r file",
  "grep -A3 -B2 X file",
  "grep -E 'a|b' file",
  "grep -m1 r file",
  "grep -- -r file",
  "ps aux | grep node",
  "git log --grep=X",
  "git log --grep X",
  "git log -S X --oneline",
  "git -C . log --grep X",
  "rg X",
  "rg X src",
  "rg X eval/qa/corpus",
  "rg X eval/qa/cases.json",
  "rg --hidden -g '!.git' X",
  "rg --hidden -g '!.git' X src eval",
  "rg -trust X",
  "rg -tjson X",
  "rg -t json X",
  "rg -g '!*.ts' X",
  "rg -g '*.ts' X src",
  "rg -g '*.json' X src",
  "rg -g '*.json' X eval/qa/corpus",
  "rg 'eval/*' src",
  "rg --version",
  "command -v rg",
  "rg -l X | head",
  `git grep X -- ${FULL_EXCLUSION}`,
  "git grep X -- ':(exclude)eval' ':(exclude).agents'",
  "git commit -m \"deny git grep and grep -r in agent hooks\"",
  "git commit -m 'rg -u and grep -r are denied'",
  "gh pr create --title t --body \"grep -r, git grep and rg -u are denied by the hook\"",
  "echo \"grep -r X .\"",
  "printf '%s' 'git grep X'",
  "cat <<'EOF'\ngrep -r X .\ngit grep X\nEOF",
  "git commit -F - <<EOF\nthe rule bans grep -r\nEOF",
  "cat <<EOF > note.md\nrg -u and grep -r\nEOF",
  "# grep -r X .",
  "npm test 2>&1 | tail -5",
  "find . -name '*.ts'",
  "ls eval/qa",
  // per-segment opt-in
  "CASE_TEXT=maintenance grep -r X eval/qa/corpus",
  "cd eval/qa && CASE_TEXT=maintenance grep -r X corpus",
  "CASE_TEXT=maintenance git grep X",
  "CASE_TEXT=maintenance rg -u X",
  // wrappers that only query, ordered options that stay inside the scope (finding 1, 8)
  "command -v rg",
  "command -V git grep",
  "command -v grep rg",
  "command -pv grep",
  "env FOO=1 true",
  "LC_ALL=C rg X src",
  'FOO="a b" grep X file',
  "git ls-files | xargs -0 echo",
  "git ls-files | xargs -r -n1 wc -l",
  "timeout 5 npm test",
  "nice -n 5 npm test",
  "grep --recursiv-ish X file",
  "grep --no-messages X file",
  "grep --regexp=rec X file",
  // globs and variable paths that stay inside their scope (finding 2)
  'grep X "src/"*.ts',
  "grep X src/*.ts",
  "rg X .agents/*",
  "rg X eval/discovery/*.mjs",
  'rg X "$PWD/src"',
  "rg -g '*.json' X \"$PWD/src\"",
  "rg -g '*.json' X ./src ./test",
  "rg X \"$SOMEWHERE\"",
  // cwd handling stays precise where it can (finding 3)
  "echo \"$(rg X src)\"; cd eval",
  "(cd eval && true); rg X src",
  "cd src && rg X .",
  `git -C . -C . grep X -- ${FULL_EXCLUSION}`,
  "git -c core.pager=cat grep X -- ':(top,exclude)eval' ':(top,exclude).agents'",
  "git -C eval grep X -- ':(top,exclude)eval' ':(top,exclude).agents'",
  // heredocs that are documents, not scripts (finding 4)
  "cat <<'EOF'\ngrep -r X .\nEOF",
  "git commit -F - <<'EOF'\nthe hook denies grep -r and rg -u\nEOF",
  "gh pr create --title t --body-file - <<'EOF'\ngrep -r X .\ngit grep X\nEOF",
  "bash script.sh <<'EOF'\ngrep -r X .\nEOF",
  "bash -c 'echo hi' <<'EOF'\ngrep -r X .\nEOF",
  "tee note.md <<EOF\nrg -u X\nEOF",
  // opt-in: the last assignment wins and reaches a child script (finding 1, 8)
  "CASE_TEXT=normal CASE_TEXT=maintenance grep -r X .",
  "CASE_TEXT=maintenance env FOO=1 grep -r X .",
  "env CASE_TEXT=maintenance grep -r X .",
  "CASE_TEXT=maintenance bash -c 'grep -r X .'",
  "CASE_TEXT=maintenance bash <<'EOF'\ngrep -r X .\nEOF",
  "CASE_TEXT=maintenance eval 'grep -r X .'",
  // re-check: safe scopes under a wrapper, timeout, braces, interpolated documents
  "env -C src bash -c 'rg X .'",
  "env -C src bash -c 'rg -g \"*.json\" X .'",
  "env -C eval/qa bash -c 'echo hi'",
  "timeout -- 5 npm test",
  "timeout -k 1 -- 5 echo hi",
  "timeout 5 npm test",
  "rg X {src,test}/*.ts",
  "grep X {src,test}/*.ts",
  "rg -g '*.json' X {src,test}",
  "rg X {src,{test,scripts}}/*.mjs",
  "rg X {unmatched",
  "cat <<EOF_DOC\n$(date +%F)\nThe policy forbids the following command:\ngrep -r X eval\nEOF_DOC",
  "cat <<EOF\n`date`\nThe policy forbids rg -u and grep -r\nEOF",
  "cat <<EOF\n$(echo ok) and $(date)\ngit grep X\nEOF",
];

describe("case-search guard decisions", () => {
  it.each(MUST_DENY)("denies %j", (command) => {
    expect(bash(command).deny, command).toBe(true);
  });

  it.each(MUST_PASS)("passes %j", (command) => {
    expect(bash(command).deny, command).toBe(false);
  });

  it("applies the opt-in to its own segment only", () => {
    expect(bash("CASE_TEXT=maintenance true && grep -r X .").deny).toBe(true);
  });

  it("keeps the opt-in out of outer command substitutions", () => {
    expect(bash("CASE_TEXT=maintenance echo $(grep -r X .)").deny).toBe(true);
    expect(bash("CASE_TEXT=maintenance bash -c 'echo $(grep -r X .)'").deny).toBe(false);
  });

  it("denies a glob from a working directory that sits above the listed path", () => {
    expect(bash("rg -g '*.json' X", join(REPO, "eval")).deny).toBe(true);
    expect(bash("rg -g '*.json' X", join(REPO, "src")).deny).toBe(false);
    expect(bash("rg X *", join(REPO, "eval/qa")).deny).toBe(true);
  });

  it("covers the Grep tool: a positive glob through an unset or ancestor path", () => {
    expect(grepTool({ pattern: "X", glob: "*.json" }).deny).toBe(true);
    expect(grepTool({ pattern: "X", glob: "*.json", path: "." }).deny).toBe(true);
    expect(grepTool({ pattern: "X", glob: "*.json", path: "eval" }).deny).toBe(true);
    expect(grepTool({ pattern: "X", glob: "*cases*", path: "eval/qa" }).deny).toBe(true);
    expect(grepTool({ pattern: "X" }).deny).toBe(false);
    expect(grepTool({ pattern: "X", glob: "*.ts" }).deny).toBe(false);
    expect(grepTool({ pattern: "X", glob: "*.json", path: "src" }).deny).toBe(false);
    expect(grepTool({ pattern: "X", glob: "*.json", path: "eval/qa/corpus" }).deny).toBe(false);
    expect(grepTool({ pattern: "X", glob: "!*.json" }).deny).toBe(false);
  });

  it("never throws on odd glob syntax", () => {
    for (const command of ["grep X {", "rg X [", "rg X *[", "grep X }{", "rg -g '{' X", "rg -g '[' X src", "rg X {,}/*", "rg X {a,}/*.json", "rg X *{"]) {
      expect(() => bash(command), command).not.toThrow();
    }
  });

  it("covers Grok and Antigravity tool shapes, tool-level cwd, and truncated inputs", () => {
    expect(decide({ toolName: "run_terminal_command", toolInput: { command: "grep -r X ." }, cwd: REPO, entries, projectDir: REPO }).deny).toBe(true);
    expect(decide({ toolName: "Shell", toolInput: { command: "rg -g '*.json' X eval" }, cwd: REPO, entries, projectDir: REPO }).deny).toBe(true);
    expect(decide({ toolName: "run_terminal_command", toolInput: { command: "rg -g '*.json' X", working_directory: "eval" }, cwd: REPO, entries, projectDir: REPO }).deny).toBe(true);
    expect(decide({ toolName: "run_terminal_command", toolInput: { command: "rg -g '*.json' X", cwd: "eval" }, cwd: REPO, entries, projectDir: REPO }).deny).toBe(true);
    expect(decide({ toolName: "run_terminal_command", toolInput: { command: "rg -g '*.json' X", working_directory: "src" }, cwd: REPO, entries, projectDir: REPO }).deny).toBe(false);
    expect(decide({ toolName: "grep", toolInput: { pattern: "X", glob: "*.json", path: "eval" }, cwd: REPO, entries, projectDir: REPO }).deny).toBe(true);
    expect(decide({ toolName: "grep", toolInput: { pattern: "X", glob_pattern: "*.json", target_directory: "eval" }, cwd: REPO, entries, projectDir: REPO }).deny).toBe(true);
    expect(decide({ toolName: "grep", toolInput: { pattern: "X", glob: "*.json", path: "src" }, cwd: REPO, entries, projectDir: REPO }).deny).toBe(false);
    expect(decide({ toolName: "run_terminal_command", toolInput: { command: "echo hi" }, cwd: REPO, entries, projectDir: REPO, truncated: true }).deny).toBe(true);
    expect(decide({ toolName: "Read", toolInput: { file_path: "README.md" }, cwd: REPO, entries, projectDir: REPO, truncated: true }).deny).toBe(false);

    expect(decide({ toolName: "run_command", toolInput: { CommandLine: "grep -r X ." }, cwd: REPO, entries, projectDir: REPO }).deny).toBe(true);
    expect(decide({ toolName: "run_command", toolInput: { CommandLine: "rg -g '*.json' X", Cwd: "eval" }, cwd: REPO, entries, projectDir: REPO }).deny).toBe(true);
    expect(decide({ toolName: "run_command", toolInput: { CommandLine: "grep -n IGNORE_FILES scripts/agent-hooks/case-search-guard.mjs" }, cwd: REPO, entries, projectDir: REPO }).deny).toBe(false);
    expect(decide({ toolName: "grep_search", toolInput: { Query: "X", Includes: ["*.json"], SearchPath: "eval" }, cwd: REPO, entries, projectDir: REPO }).deny).toBe(true);
    expect(decide({ toolName: "grep_search", toolInput: { Query: "X", Includes: ["*.json"], SearchPath: "src" }, cwd: REPO, entries, projectDir: REPO }).deny).toBe(false);
  });

  it("normalizes PreToolUse payloads and outputs for all four CLIs", () => {
    const codex = parsePayload({
      hook_event_name: "PreToolUse",
      tool_name: "Bash",
      tool_input: { command: "grep -r X ." },
      cwd: REPO,
      session_id: "s1",
      turn_id: "t1",
      tool_use_id: "u1",
      model: "gpt-6.2-sol",
      permission_mode: "default",
      transcript_path: null,
    });
    expect(codex).toEqual({ format: "claude", toolName: "Bash", toolInput: { command: "grep -r X ." }, cwd: REPO, truncated: false });

    const grok = parsePayload({
      hookEventName: "pre_tool_use",
      hook_event_name: "PreToolUse",
      toolName: "run_terminal_command",
      toolInput: { command: "rg -u X" },
      workspaceRoot: REPO,
      toolInputTruncated: true,
    });
    expect(grok).toEqual({ format: "claude", toolName: "run_terminal_command", toolInput: { command: "rg -u X" }, cwd: REPO, truncated: true });

    const agy = parsePayload({
      hookEventName: "PreToolUse",
      toolCall: { id: "tc1", name: "run_command", args: { CommandLine: "rg -u X" } },
      workspacePaths: [REPO],
    });
    expect(agy).toEqual({ format: "antigravity", toolName: "run_command", toolInput: { CommandLine: "rg -u X" }, cwd: REPO, truncated: false });

    expect(formatOutput("claude", { deny: false })).toBe("");
    expect(formatOutput("antigravity", { deny: false })).toBe("");
    expect(JSON.parse(formatOutput("antigravity", { deny: true, rule: "recursive grep" }))).toMatchObject({
      decision: "deny",
      reason: expect.stringContaining("(rule: recursive grep)"),
    });
  });

  it("ignores other tools and malformed input", () => {
    expect(decide({ toolName: "Read", toolInput: { file_path: "eval/qa/cases.json" }, cwd: REPO, entries, projectDir: REPO }).deny).toBe(false);
    expect(decide({ toolName: "Bash", toolInput: undefined, cwd: REPO, entries, projectDir: REPO }).deny).toBe(false);
    expect(decide({ toolName: "Bash", toolInput: { command: 5 }, cwd: REPO, entries, projectDir: REPO }).deny).toBe(false);
    expect(bash("grep -r 'unterminated").deny).toBe(true);
    expect(bash("echo \"$(").deny).toBe(false);
  });
});

function runHook(stdin) {
  return spawnSync(process.execPath, [SCRIPT], { input: stdin, encoding: "utf8", cwd: REPO });
}

describe("case-search guard as a process", () => {
  it("denies with the documented PreToolUse output and exit 0", () => {
    const run = runHook(JSON.stringify({ hook_event_name: "PreToolUse", tool_name: "Bash", tool_input: { command: "grep -r CANARY ." }, cwd: REPO }));
    expect(run.status).toBe(0);
    const output = JSON.parse(run.stdout);
    expect(output.hookSpecificOutput.hookEventName).toBe("PreToolUse");
    expect(output.hookSpecificOutput.permissionDecision).toBe("deny");
    expect(output.hookSpecificOutput.permissionDecisionReason).toContain("eval/qa/README.md");
    expect(output.hookSpecificOutput.permissionDecisionReason).not.toContain("CASE_TEXT");
  });

  it("denies a Grep tool call by glob", () => {
    const run = runHook(JSON.stringify({ tool_name: "Grep", tool_input: { pattern: "X", glob: "*.json" }, cwd: REPO }));
    expect(run.status).toBe(0);
    expect(JSON.parse(run.stdout).hookSpecificOutput.permissionDecision).toBe("deny");
  });

  it("handles Grok camelCase shell, built-in grep, and truncated payloads", () => {
    const shellDeny = runHook(
      JSON.stringify({
        hookEventName: "pre_tool_use",
        hook_event_name: "PreToolUse",
        toolName: "run_terminal_command",
        toolInput: { command: "rg --hidden -g '*.json' X eval" },
        cwd: REPO,
        workspaceRoot: REPO,
        toolInputTruncated: false,
      }),
    );
    expect(shellDeny.status).toBe(0);
    expect(JSON.parse(shellDeny.stdout).hookSpecificOutput.permissionDecision).toBe("deny");

    const grepDeny = runHook(
      JSON.stringify({
        hookEventName: "pre_tool_use",
        hook_event_name: "PreToolUse",
        toolName: "grep",
        toolInput: { pattern: "X", glob: "*.json", path: "eval" },
        cwd: REPO,
        workspaceRoot: REPO,
        toolInputTruncated: false,
      }),
    );
    expect(grepDeny.status).toBe(0);
    expect(JSON.parse(grepDeny.stdout).hookSpecificOutput.permissionDecision).toBe("deny");

    const truncatedDeny = runHook(
      JSON.stringify({
        hookEventName: "pre_tool_use",
        hook_event_name: "PreToolUse",
        toolName: "run_terminal_command",
        toolInput: { command: "echo hi" },
        cwd: REPO,
        workspaceRoot: REPO,
        toolInputTruncated: true,
      }),
    );
    expect(truncatedDeny.status).toBe(0);
    expect(JSON.parse(truncatedDeny.stdout).hookSpecificOutput.permissionDecision).toBe("deny");
  });

  it("handles Antigravity toolCall payloads: deny with decision JSON, pass-through with empty stdout", () => {
    const deny = runHook(
      JSON.stringify({
        hookEventName: "PreToolUse",
        toolCall: { id: "toolu_01", name: "run_command", args: { CommandLine: "grep -r X scripts/agent-hooks" } },
        cwd: REPO,
        workspacePaths: [REPO],
      }),
    );
    expect(deny.status).toBe(0);
    const parsed = JSON.parse(deny.stdout);
    expect(parsed.decision).toBe("deny");
    expect(parsed.reason).toContain("eval/qa/README.md");
    expect(parsed.reason).toContain("(rule: recursive grep)");

    const allow = runHook(
      JSON.stringify({
        hookEventName: "PreToolUse",
        toolCall: { id: "toolu_02", name: "run_command", args: { CommandLine: "rg X src" } },
        cwd: REPO,
        workspacePaths: [REPO],
      }),
    );
    expect(allow.status).toBe(0);
    // Antigravity falls back to proto3 allow_tool=false on `{}`, so pass-through must be empty stdout.
    expect(allow.stdout).toBe("");
  });

  it("prints nothing for an allowed call", () => {
    const run = runHook(JSON.stringify({ tool_name: "Bash", tool_input: { command: "rg X src" }, cwd: REPO }));
    expect(run.status).toBe(0);
    expect(run.stdout).toBe("");
  });

  it("fails open with one stderr line on bad input, exit 0", () => {
    for (const input of ["", "not json", "null", JSON.stringify({ tool_name: "Bash" })]) {
      const run = runHook(input);
      expect(run.status, input).toBe(0);
      expect(run.stdout, input).toBe("");
      expect(run.stderr.trim().split("\n").length, input).toBeLessThanOrEqual(1);
    }
  });
});

describe("case-search guard wiring", () => {
  const claudeSettings = JSON.parse(readFileSync(join(REPO, ".claude/settings.json"), "utf8"));
  const codexHooks = JSON.parse(readFileSync(join(REPO, ".codex/hooks.json"), "utf8"));
  const grokHooks = JSON.parse(readFileSync(join(REPO, ".grok/hooks/case-search-guard.json"), "utf8"));
  const agyHooks = JSON.parse(readFileSync(join(REPO, ".agents/hooks.json"), "utf8"));

  it("wires Claude Code, Codex, Grok, and Antigravity with short timeouts", () => {
    const [claudeGroup] = claudeSettings.hooks.PreToolUse;
    const [claudeHook] = claudeGroup.hooks;
    expect(claudeSettings.hooks.PreToolUse).toHaveLength(1);
    expect(claudeGroup.matcher).toBe("Bash|Grep");
    expect(claudeGroup.hooks).toHaveLength(1);
    expect(claudeHook.type).toBe("command");
    expect(claudeHook.command).toBe('node "$CLAUDE_PROJECT_DIR"/scripts/agent-hooks/case-search-guard.mjs');
    expect(claudeHook.timeout).toBeGreaterThan(0);
    expect(claudeHook.timeout).toBeLessThanOrEqual(10);

    const [codexGroup] = codexHooks.hooks.PreToolUse;
    const [codexHook] = codexGroup.hooks;
    expect(codexHooks.hooks.PreToolUse).toHaveLength(1);
    expect(codexGroup.matcher).toBe("Bash");
    expect(codexGroup.hooks).toHaveLength(1);
    expect(codexHook.type).toBe("command");
    expect(codexHook.command).toContain("scripts/agent-hooks/case-search-guard.mjs");
    expect(codexHook.timeout).toBeGreaterThan(0);
    expect(codexHook.timeout).toBeLessThanOrEqual(10);

    const [grokGroup] = grokHooks.hooks.PreToolUse;
    const [grokHook] = grokGroup.hooks;
    expect(grokHooks.hooks.PreToolUse).toHaveLength(1);
    expect(grokGroup.matcher).toBe("Bash|Grep");
    expect(grokGroup.hooks).toHaveLength(1);
    expect(grokHook.type).toBe("command");
    expect(grokHook.command).toBe('node "$GROK_WORKSPACE_ROOT"/scripts/agent-hooks/case-search-guard.mjs');
    expect(grokHook.timeout).toBeGreaterThan(0);
    expect(grokHook.timeout).toBeLessThanOrEqual(10);

    const [agyGroup] = agyHooks["case-search-guard"].PreToolUse;
    const [agyHook] = agyGroup.hooks;
    expect(agyHooks["case-search-guard"].PreToolUse).toHaveLength(1);
    expect(agyGroup.matcher).toBe("run_command|grep_search");
    expect(agyGroup.hooks).toHaveLength(1);
    expect(agyHook.type).toBe("command");
    expect(agyHook.command).toBe("node ../scripts/agent-hooks/case-search-guard.mjs");
    expect(agyHook.timeout).toBeGreaterThan(0);
    expect(agyHook.timeout).toBeLessThanOrEqual(10);
  });

  it("executes each CLI config's shell command end-to-end with its runtime cwd and env", () => {
    const runShell = (command, { cwd = REPO, env = process.env, stdin }) =>
      spawnSync("sh", ["-c", command], { cwd, env, input: stdin, encoding: "utf8" });

    const claudeRun = runShell(claudeSettings.hooks.PreToolUse[0].hooks[0].command, {
      env: { ...process.env, CLAUDE_PROJECT_DIR: REPO },
      stdin: JSON.stringify({ hook_event_name: "PreToolUse", tool_name: "Bash", tool_input: { command: "grep -r X ." }, cwd: REPO }),
    });
    expect(claudeRun.status).toBe(0);
    expect(JSON.parse(claudeRun.stdout).hookSpecificOutput.permissionDecision).toBe("deny");

    // Codex runs from the session cwd (including subdirectories) without CLAUDE_PROJECT_DIR.
    const codexRun = runShell(codexHooks.hooks.PreToolUse[0].hooks[0].command, {
      cwd: join(REPO, "src"),
      stdin: JSON.stringify({
        hook_event_name: "PreToolUse",
        tool_name: "Bash",
        tool_input: { command: "rg -g '*.json' X ../eval" },
        cwd: join(REPO, "src"),
        session_id: "thr_1",
        turn_id: "turn_1",
        tool_use_id: "call_1",
        model: "gpt-6.2-sol",
        permission_mode: "default",
        transcript_path: null,
      }),
    });
    expect(codexRun.status).toBe(0);
    expect(JSON.parse(codexRun.stdout).hookSpecificOutput.permissionDecision).toBe("deny");

    const grokRun = runShell(grokHooks.hooks.PreToolUse[0].hooks[0].command, {
      env: { ...process.env, GROK_WORKSPACE_ROOT: REPO },
      stdin: JSON.stringify({
        hookEventName: "pre_tool_use",
        hook_event_name: "PreToolUse",
        toolName: "run_terminal_command",
        toolInput: { command: "grep -r X ." },
        cwd: REPO,
        workspaceRoot: REPO,
        toolInputTruncated: false,
      }),
    });
    expect(grokRun.status).toBe(0);
    expect(JSON.parse(grokRun.stdout).hookSpecificOutput.permissionDecision).toBe("deny");

    // Antigravity sets the hook command's working directory to the directory containing hooks.json (.agents/).
    const agyRun = runShell(agyHooks["case-search-guard"].PreToolUse[0].hooks[0].command, {
      cwd: join(REPO, ".agents"),
      stdin: JSON.stringify({
        hookEventName: "PreToolUse",
        toolCall: { id: "toolu_01", name: "run_command", args: { CommandLine: "grep -r X ." } },
        cwd: REPO,
        workspacePaths: [REPO],
      }),
    });
    expect(agyRun.status).toBe(0);
    expect(JSON.parse(agyRun.stdout).decision).toBe("deny");
  });

  it("tracks the guard script and all four CLI hook config files without git-ignoring them", () => {
    const tracked = (path) => spawnSync("git", ["ls-files", "--error-unmatch", path], { cwd: REPO }).status;
    for (const file of [
      "scripts/agent-hooks/case-search-guard.mjs",
      ".claude/settings.json",
      ".codex/hooks.json",
      ".grok/hooks/case-search-guard.json",
      ".agents/hooks.json",
    ]) {
      expect(tracked(file), `${file} tracked`).toBe(0);
      expect(spawnSync("git", ["check-ignore", "-q", file], { cwd: REPO }).status, `${file} not ignored`).toBe(1);
    }
  });

  it("imports Node built-ins only", () => {
    const source = readFileSync(SCRIPT, "utf8");
    const specifiers = [...source.matchAll(/^import\s.*?from\s+"([^"]+)"/gm)].map((m) => m[1]);
    expect(specifiers.length).toBeGreaterThan(0);
    for (const specifier of specifiers) expect(specifier).toMatch(/^node:/);
    expect(source).not.toMatch(/\bimport\s*\(/);
    expect(source).not.toMatch(/\brequire\s*\(/);
  });
});
