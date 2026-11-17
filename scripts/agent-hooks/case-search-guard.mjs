#!/usr/bin/env node
/**
 * Claude Code PreToolUse hook (.claude/settings.json): keeps recursive searches out of the
 * case-bearing paths that the `.ignore` files list (eval/qa/README.md, "Held-out split").
 *
 * Bash: a command segment is denied when its command word is
 *   - grep/egrep/fgrep with a recursive flag, a shell glob over eval/ or .agents/, or a positive
 *     glob that reaches a listed path;
 *   - `git grep` without a pathspec exclusion for every listed path;
 *   - rg with -u/--unrestricted/--no-ignore*, a positive -g/--glob/--iglob that reaches a listed
 *     path, a shell glob over eval/ or .agents/, or a command-substitution file list;
 *   - xargs or `find -exec` running grep or rg.
 * Grep tool: denied when `glob` reaches a listed path through an unset or ancestor `path`.
 * `grep`/`rg` must be the command word (or git's subcommand), so a commit message, an echo or a
 * heredoc that merely names them passes. The guard blocks and never rewrites. It fails open: any
 * internal error prints one stderr line and exits 0. It imports Node built-ins only.
 *
 * Contract used (Claude Code 2.1.326): the payload is JSON on stdin with tool_name, tool_input and
 * cwd; a deny is exit 0 with this JSON on stdout:
 *   {"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny",
 *     "permissionDecisionReason":"..."}}
 */
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { basename, dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const IGNORE_FILES = ["eval/.ignore", "eval/qa/.ignore", ".agents/rounds/.ignore"];
const OPT_IN = "CASE_TEXT=maintenance";

export const DENY_MESSAGE =
  "Blocked: this search would reach case-bearing paths (held-out, reserve or golden text). " +
  "Search with `rg --hidden -g '!.git' <pattern> [path]`, and pass no shell glob over eval/ or .agents/. " +
  'See eval/qa/README.md, "Held-out split".';

/** Entries from the three `.ignore` files: { path: absolute, isDir }. */
export function loadEntries(projectDir = PROJECT_DIR) {
  const entries = [];
  for (const file of IGNORE_FILES) {
    const full = join(projectDir, file);
    if (!existsSync(full)) throw new Error(`${file} is missing`);
    for (const line of readFileSync(full, "utf8").split("\n")) {
      const text = line.trim();
      if (text === "" || text.startsWith("#")) continue;
      const isDir = text.endsWith("/");
      entries.push({ path: join(dirname(full), text.replace(/^\//, "").replace(/\/$/, "")), isDir });
    }
  }
  return entries;
}

// ---------------------------------------------------------------- shell tokenizer

const OPERATOR_CHARS = new Set([";", "&", "|", "(", ")", "\n"]);

/**
 * Split a command line into segments of tokens, quote-aware. Returns { segments, nested }:
 * `nested` holds the text of every command substitution and unquoted-heredoc substitution, to be
 * analyzed as commands of their own. Token: { text, quoted, glob (unquoted glob char), subs }.
 */
export function tokenize(input) {
  const segments = [];
  const nested = [];
  let tokens = [];
  let word = null;
  const heredocs = []; // { delimiter, quoted }
  const ensure = () => (word ??= { text: "", quoted: false, glob: false, subs: 0 });
  const endWord = () => {
    if (word) tokens.push(word);
    word = null;
  };
  const endSegment = () => {
    endWord();
    if (tokens.length) segments.push(tokens);
    tokens = [];
  };
  const skipSubstitution = (start, open, close) => {
    // `start` indexes the character after the opener; returns the index of the closing character.
    let depth = 1;
    let i = start;
    while (i < input.length) {
      const c = input[i];
      if (c === "\\") i += 2;
      else if (c === "'" && open !== "`") {
        const end = input.indexOf("'", i + 1);
        i = end < 0 ? input.length : end + 1;
      } else if (c === '"' && open !== "`") {
        i++;
        while (i < input.length && input[i] !== '"') i += input[i] === "\\" ? 2 : 1;
        i++;
      } else {
        if (c === open && open !== close) depth++;
        else if (c === close && --depth === 0) return i;
        i++;
      }
    }
    return input.length;
  };
  const substitutions = (text) => {
    const found = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "\\") i++;
      else if (text[i] === "$" && text[i + 1] === "(") {
        const end = skipSubstitution(i + 2, "(", ")");
        found.push(text.slice(i + 2, end));
        i = end;
      } else if (text[i] === "`") {
        const end = skipSubstitution(i + 1, "`", "`");
        found.push(text.slice(i + 1, end));
        i = end;
      }
    }
    return found;
  };

  let i = 0;
  let expectHeredoc = null; // the `<<` operator was just read
  while (i < input.length) {
    const c = input[i];
    if (c === "\\") {
      ensure().quoted = true;
      word.text += input[i + 1] ?? "";
      i += 2;
    } else if (c === "'") {
      const end = input.indexOf("'", i + 1);
      const stop = end < 0 ? input.length : end;
      ensure().quoted = true;
      word.text += input.slice(i + 1, stop);
      i = stop + 1;
    } else if (c === '"') {
      ensure().quoted = true;
      i++;
      while (i < input.length && input[i] !== '"') {
        if (input[i] === "\\") {
          word.text += input[i + 1] ?? "";
          i += 2;
        } else if (input[i] === "$" && input[i + 1] === "(") {
          const end = skipSubstitution(i + 2, "(", ")");
          nested.push(input.slice(i + 2, end));
          word.subs++;
          word.text += "$(…)";
          i = end + 1;
        } else if (input[i] === "`") {
          const end = skipSubstitution(i + 1, "`", "`");
          nested.push(input.slice(i + 1, end));
          word.subs++;
          word.text += "$(…)";
          i = end + 1;
        } else word.text += input[i++];
      }
      i++;
    } else if (c === "$" && input[i + 1] === "(") {
      const end = skipSubstitution(i + 2, "(", ")");
      nested.push(input.slice(i + 2, end));
      ensure().subs++;
      word.text += "$(…)";
      i = end + 1;
    } else if (c === "`") {
      const end = skipSubstitution(i + 1, "`", "`");
      nested.push(input.slice(i + 1, end));
      ensure().subs++;
      word.text += "$(…)";
      i = end + 1;
    } else if (c === "#" && word === null) {
      while (i < input.length && input[i] !== "\n") i++;
    } else if (c === "<" && input[i + 1] === "<" && input[i + 2] !== "<") {
      endWord();
      i += 2;
      if (input[i] === "-") i++;
      expectHeredoc = { quoted: false, delimiter: "" };
      while (input[i] === " " || input[i] === "\t") i++;
      while (i < input.length && !/[\s;&|()<>]/.test(input[i])) {
        if (input[i] === "'" || input[i] === '"') {
          const q = input[i];
          const end = input.indexOf(q, i + 1);
          expectHeredoc.quoted = true;
          expectHeredoc.delimiter += input.slice(i + 1, end < 0 ? input.length : end);
          i = (end < 0 ? input.length : end) + 1;
        } else if (input[i] === "\\") {
          expectHeredoc.quoted = true;
          expectHeredoc.delimiter += input[i + 1] ?? "";
          i += 2;
        } else expectHeredoc.delimiter += input[i++];
      }
      heredocs.push(expectHeredoc);
      expectHeredoc = null;
    } else if (c === "\n") {
      endSegment();
      i++;
      while (heredocs.length) {
        const { delimiter, quoted } = heredocs.shift();
        const body = [];
        while (i < input.length) {
          let end = input.indexOf("\n", i);
          if (end < 0) end = input.length;
          const line = input.slice(i, end);
          i = end + 1;
          if (line.replace(/^\t+/, "") === delimiter) break;
          body.push(line);
        }
        if (!quoted) nested.push(...substitutions(body.join("\n")));
      }
    } else if (OPERATOR_CHARS.has(c)) {
      endSegment();
      i++;
    } else if (c === " " || c === "\t") {
      endWord();
      i++;
    } else {
      ensure();
      if (c === "*" || c === "?" || c === "[" || c === "{") word.glob = true;
      word.text += c;
      i++;
    }
  }
  endSegment();
  return { segments, nested };
}

// ---------------------------------------------------------------- command resolution

const RESERVED = new Set(["!", "{", "}", "if", "then", "else", "elif", "fi", "do", "done", "while", "until", "time"]);
const WRAPPERS = new Set(["sudo", "doas", "command", "builtin", "exec", "nohup", "nice", "ionice", "env", "stdbuf", "timeout", "xargs", "setsid"]);
const WRAPPER_VALUE_OPTIONS = new Set([
  "-u", "-g", "-h", "-p", "-C", "-r", "-t", "-D", "-n", "-c", "-S", "-I", "-i", "-o", "-e", "-P", "-L", "-s", "-E", "-d", "-a", "-k",
  "--user", "--group", "--signal", "--kill-after", "--max-args", "--max-procs", "--replace", "--delimiter",
]);
const SHELLS = new Set(["bash", "sh", "zsh", "dash", "ksh"]);
const GREPS = new Set(["grep", "egrep", "fgrep"]);
const ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/;
const REDIRECT = /^[0-9]*(?:>>?|<|&>|>&)/;

/**
 * Resolve the command a segment runs: { env, via, name, args } or null. `via` lists the wrapper
 * names passed through (xargs matters); `args` are the tokens after the command word.
 */
export function resolveCommand(tokens) {
  const env = [];
  const via = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    const text = token.text;
    if (!token.quoted && ASSIGNMENT.test(text)) {
      env.push(text);
      i++;
    } else if (!token.quoted && RESERVED.has(text)) i++;
    else if (!token.quoted && REDIRECT.test(text)) i += /^[0-9]*(?:>>?|<|&>|>&)$/.test(text) ? 2 : 1;
    else break;
  }
  while (i < tokens.length) {
    const name = basename(tokens[i].text.replace(/^\\/, ""));
    if (!WRAPPERS.has(name)) return { env, via, name, args: tokens.slice(i + 1), tokens: tokens.slice(i) };
    via.push(name);
    i++;
    // Skip the wrapper's own options, assignments and (for timeout/nice) a duration.
    while (i < tokens.length) {
      const next = tokens[i];
      if (!next.quoted && ASSIGNMENT.test(next.text) && name === "env") env.push(next.text), i++;
      else if (next.text.startsWith("-") && next.text.length > 1) {
        i += WRAPPER_VALUE_OPTIONS.has(next.text) && !next.text.includes("=") ? 2 : 1;
      } else if (name === "timeout" && /^[0-9.]+[smhd]?$/.test(next.text)) i++;
      else break;
    }
  }
  return null;
}

// ---------------------------------------------------------------- option parsing

const GREP_VALUE_LETTERS = new Set(["e", "f", "m", "A", "B", "C", "d", "D"]);
const RG_VALUE_LETTERS = new Set(["g", "t", "T", "e", "f", "A", "B", "C", "m", "j", "M", "r", "E", "d"]);
const RG_VALUE_LONG = new Set([
  "--glob", "--iglob", "--type", "--type-not", "--regexp", "--file", "--after-context", "--before-context", "--context", "--max-count",
  "--threads", "--max-columns", "--replace", "--encoding", "--max-depth", "--maxdepth", "--type-add", "--type-clear", "--colors",
  "--ignore-file", "--pre", "--pre-glob", "--max-filesize", "--sort", "--sortr", "--path-separator", "--engine", "--dfa-size-limit",
  "--regex-size-limit", "--context-separator", "--field-context-separator", "--field-match-separator", "--hostname-bin", "--hyperlink-format",
]);
const GREP_VALUE_LONG = new Set(["--regexp", "--file", "--max-count", "--after-context", "--before-context", "--context", "--include", "--exclude", "--exclude-from", "--exclude-dir", "--directories", "--devices", "--label", "--binary-files"]);

/**
 * Parse a grep or rg argument list into { flags: [{ name, value }], positionals: token[] }. `name`
 * is a long option (`--glob`) or a short letter (`-g`); `value` is its argument when it takes one.
 */
export function parseOptions(args, valueLetters, valueLong) {
  const flags = [];
  const positionals = [];
  for (let i = 0; i < args.length; i++) {
    const token = args[i];
    const text = token.text;
    if (!token.quoted && REDIRECT.test(text)) {
      if (/^[0-9]*(?:>>?|<|&>|>&)$/.test(text)) i++; // a bare operator takes the next word as its target
      continue;
    }
    if (text === "--") {
      positionals.push(...args.slice(i + 1));
      break;
    }
    if (token.quoted && !text.startsWith("-")) positionals.push(token);
    else if (text.startsWith("--")) {
      const eq = text.indexOf("=");
      const name = eq < 0 ? text : text.slice(0, eq);
      if (eq >= 0) flags.push({ name, value: text.slice(eq + 1) });
      else if (valueLong.has(name) && i + 1 < args.length) flags.push({ name, value: args[++i].text });
      else flags.push({ name, value: null });
    } else if (text.startsWith("-") && text.length > 1) {
      for (let k = 1; k < text.length; k++) {
        const letter = text[k];
        if (valueLetters.has(letter)) {
          const rest = text.slice(k + 1);
          flags.push({ name: `-${letter}`, value: rest !== "" ? rest : i + 1 < args.length ? args[++i].text : null });
          break;
        }
        flags.push({ name: `-${letter}`, value: null });
      }
    } else positionals.push(token);
  }
  return { flags, positionals };
}

// ---------------------------------------------------------------- globs and scope

/** Compile a gitignore-style glob to a RegExp (anchored; `*` also crosses `/` and case is ignored, both conservative). */
export function globToRegExp(glob) {
  let out = "";
  let braces = 0;
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      while (glob[i + 1] === "*") i++;
      out += ".*";
    } else if (c === "?") out += ".";
    else if (c === "[") {
      const end = glob.indexOf("]", i + 2);
      if (end < 0) out += "\\[";
      else {
        out += `[${glob.slice(i + 1, end).replace(/^!/, "^").replace(/\\/g, "\\\\")}]`;
        i = end;
      }
    } else if (c === "{") {
      braces++;
      out += "(?:";
    } else if (c === "}" && braces > 0) {
      braces--;
      out += ")";
    } else if (c === "," && braces > 0) out += "|";
    else if (c === "\\") out += `\\${glob[++i] ?? "\\"}`;
    else out += c.replace(/[.+^$()|\\]/g, "\\$&");
  }
  return new RegExp(`^${out}$`, "i");
}

function relativeTo(projectDir, absolute) {
  return absolute === projectDir ? "" : absolute.slice(projectDir.length + sep.length);
}

/** True when a positive glob reaches the listed entry (by name, or by any suffix of its path). */
function globReachesEntry(glob, entry, projectDir) {
  const pattern = glob.replace(/^\.\//, "").replace(/^\//, "").replace(/\/+$/, "");
  if (pattern === "" || pattern.startsWith("!")) return false;
  const rel = relativeTo(projectDir, entry.path).split(sep);
  const probes = [];
  for (let start = 0; start < rel.length; start++) probes.push(rel.slice(start).join("/"));
  if (entry.isDir) probes.push(`${rel.join("/")}/x`);
  const regex = globToRegExp(pattern);
  return probes.some((probe) => regex.test(probe));
}

/** True when a search over `paths` (empty means the cwd) walks into the entry without naming it. */
function scopeCoversEntry(paths, cwd, entry) {
  const scopes = paths.length ? paths.map((p) => resolve(cwd, p)) : [resolve(cwd)];
  return scopes.some((scope) => entry.path.startsWith(scope === sep ? sep : `${scope}${sep}`));
}

function globDenied(globs, paths, cwd, entries, projectDir) {
  return entries.some(
    (entry) => scopeCoversEntry(paths, cwd, entry) && globs.some((glob) => globReachesEntry(glob, entry, projectDir)),
  );
}

/** A shell glob in an unquoted positional that expands inside eval/ or .agents/. */
function shellGlobOverCases(positionals, cwd, projectDir) {
  return positionals.some((token) => {
    if (!token.glob || token.quoted) return false;
    const rel = relativeTo(projectDir, resolve(cwd, token.text));
    return rel === "eval" || rel.startsWith(`eval${sep}`) || rel === ".agents" || rel.startsWith(`.agents${sep}`);
  });
}

// ---------------------------------------------------------------- segment rules

function exclusionCovers(args, cwd, entries, projectDir) {
  const excluded = [];
  for (const token of args) {
    let path = null;
    const text = token.text;
    if (text.startsWith(":!") || text.startsWith(":^")) path = text.slice(2);
    else {
      const magic = /^:\(([^)]*)\)(.*)$/.exec(text);
      if (magic && magic[1].split(",").includes("exclude")) {
        path = magic[2];
        if (magic[1].split(",").includes("top")) cwd = projectDir;
      }
    }
    if (path !== null) excluded.push(resolve(cwd, path));
  }
  return entries.every((entry) => excluded.some((ex) => entry.path === ex || entry.path.startsWith(`${ex}${sep}`)));
}

function gitSubcommand(args) {
  const OPTIONS_WITH_VALUE = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--exec-path", "--super-prefix", "--config-env"]);
  for (let i = 0; i < args.length; i++) {
    const text = args[i].text;
    if (!text.startsWith("-")) return { name: text, rest: args.slice(i + 1) };
    if (OPTIONS_WITH_VALUE.has(text)) i++;
  }
  return null;
}

function gitCwd(args, cwd) {
  for (let i = 0; i < args.length && args[i].text.startsWith("-"); i++) {
    if (args[i].text === "-C" && args[i + 1]) cwd = resolve(cwd, args[i + 1].text);
    if (["-c", "--git-dir", "--work-tree"].includes(args[i].text)) i++;
  }
  return cwd;
}

/** The deny reason for one resolved command, or null. */
function segmentVerdict(command, tokens, state) {
  const { cwd, entries, projectDir } = state;
  const { name, args, via } = command;
  if (command.env.includes(OPT_IN)) return null;

  if (via.includes("xargs") && (GREPS.has(name) || name === "rg")) return "xargs file list into a search";
  if (name === "find") {
    for (let i = 0; i < args.length; i++) {
      if (["-exec", "-execdir", "-ok", "-okdir"].includes(args[i].text)) {
        const target = basename((args[i + 1]?.text ?? "").replace(/^\\/, ""));
        if (GREPS.has(target) || target === "rg") return "find -exec search";
      }
    }
    return null;
  }
  if (name === "git") {
    const sub = gitSubcommand(args);
    if (!sub || sub.name !== "grep") return null;
    return exclusionCovers(sub.rest, gitCwd(args, cwd), entries, projectDir) ? null : "git grep without an exclusion for every listed path";
  }
  if (SHELLS.has(name) || name === "eval") return null; // analyzed as nested text by the caller

  if (GREPS.has(name)) {
    const { flags, positionals } = parseOptions(args, GREP_VALUE_LETTERS, GREP_VALUE_LONG);
    for (const { name: flag, value } of flags) {
      if (["--recursive", "--dereference-recursive", "-r", "-R"].includes(flag)) return "recursive grep";
      if (flag === "--directories" && value === "recurse") return "recursive grep";
      if (flag === "-d" && value === "recurse") return "recursive grep";
    }
    const explicitPattern = flags.some((f) => ["-e", "-f", "--regexp", "--file"].includes(f.name));
    const paths = explicitPattern ? positionals : positionals.slice(1);
    if (shellGlobOverCases(paths, cwd, projectDir)) return "shell glob over eval/ or .agents/";
    if (paths.some((t) => t.subs > 0)) return "command-substitution file list";
    return null;
  }
  if (name === "rg") {
    const { flags, positionals } = parseOptions(args, RG_VALUE_LETTERS, RG_VALUE_LONG);
    const globs = [];
    for (const { name: flag, value } of flags) {
      if (flag === "-u" || flag === "--unrestricted" || flag.startsWith("--no-ignore")) return "rg flag that disables the ignore files";
      if (["-g", "--glob", "--iglob"].includes(flag) && value !== null) globs.push(value);
    }
    const noPattern = flags.some((f) => ["-e", "-f", "--regexp", "--file", "--files", "--type-list"].includes(f.name));
    const paths = noPattern ? positionals : positionals.slice(1);
    if (globs.length && globDenied(globs, paths.map((t) => t.text), cwd, entries, projectDir)) return "positive rg glob that reaches a listed path";
    if (shellGlobOverCases(paths, cwd, projectDir)) return "shell glob over eval/ or .agents/";
    if (paths.some((t) => t.subs > 0)) return "command-substitution file list";
    return null;
  }
  return null;
}

/** The deny reason for a command line, or null. */
export function bashVerdict(commandLine, state, depth = 0) {
  if (depth > 6) return null;
  const { segments, nested } = tokenize(commandLine);
  let cwd = state.cwd;
  for (const tokens of segments) {
    const command = resolveCommand(tokens);
    if (!command) continue;
    if (command.name === "cd") {
      const target = command.args.find((t) => !t.text.startsWith("-"));
      if (target && target.subs === 0 && !/^[~$-]/.test(target.text)) cwd = resolve(cwd, target.text);
      continue;
    }
    if (SHELLS.has(command.name)) {
      const flag = command.args.findIndex((t) => /^-[a-z]*c$/.test(t.text));
      if (flag >= 0 && command.args[flag + 1]) {
        const reason = bashVerdict(command.args[flag + 1].text, { ...state, cwd }, depth + 1);
        if (reason) return reason;
      }
      continue;
    }
    if (command.name === "eval") {
      const reason = bashVerdict(command.args.map((t) => t.text).join(" "), { ...state, cwd }, depth + 1);
      if (reason) return reason;
      continue;
    }
    const reason = segmentVerdict(command, tokens, { ...state, cwd });
    if (reason) return reason;
  }
  for (const text of nested) {
    const reason = bashVerdict(text, { ...state, cwd }, depth + 1);
    if (reason) return reason;
  }
  return null;
}

/**
 * The decision for one tool call: { deny: false } or { deny: true, rule }. `rule` names the rule;
 * the user-facing message is DENY_MESSAGE.
 */
export function decide({ toolName, toolInput, cwd, entries, projectDir = PROJECT_DIR }) {
  let where = resolve(cwd || projectDir);
  try {
    where = realpathSync(where);
  } catch {
    // keep the lexical path
  }
  const state = { cwd: where, entries, projectDir };
  if (toolName === "Bash" && typeof toolInput?.command === "string") {
    const rule = bashVerdict(toolInput.command, state);
    return rule ? { deny: true, rule } : { deny: false };
  }
  if (toolName === "Grep" && typeof toolInput?.glob === "string" && toolInput.glob !== "") {
    const paths = typeof toolInput.path === "string" && toolInput.path !== "" ? [toolInput.path] : [];
    const globs = toolInput.glob.split(/\s+/).filter(Boolean);
    return globDenied(globs, paths, state.cwd, entries, projectDir) ? { deny: true, rule: "positive Grep glob that reaches a listed path" } : { deny: false };
  }
  return { deny: false };
}

export function denyOutput(rule) {
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: `${DENY_MESSAGE} (rule: ${rule})`,
    },
  };
}

function main() {
  let payload;
  try {
    payload = JSON.parse(readFileSync(0, "utf8"));
    const verdict = decide({
      toolName: payload.tool_name,
      toolInput: payload.tool_input,
      cwd: payload.cwd,
      entries: loadEntries(),
    });
    if (verdict.deny) process.stdout.write(`${JSON.stringify(denyOutput(verdict.rule))}\n`);
  } catch (error) {
    process.stderr.write(`case-search-guard: failed open (${error instanceof Error ? error.message : "error"})\n`);
  }
  process.exitCode = 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
