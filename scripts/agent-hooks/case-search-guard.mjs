#!/usr/bin/env node
/**
 * Claude Code PreToolUse hook (.claude/settings.json): keeps recursive searches out of the
 * case-bearing paths that the `.ignore` files list (eval/qa/README.md, "Searching without reading
 * case text").
 *
 * Scope: the guard stops accidental, ordinary command forms. A deliberate bypass (a script written
 * to a file, a pipe into a shell, an encoded command) is out of scope. Where the guard cannot
 * establish the scope of a search, it denies the risky form (a positive glob, a recursive grep, a
 * shell glob) instead of allowing it. A parse or internal error fails open.
 *
 * Bash: a command is denied when its command word is
 *   - grep/egrep/fgrep with a recursive flag (GNU long-option abbreviations included), a shell glob
 *     that could expand to a listed path, or a command-substitution file list;
 *   - `git grep` without a pathspec exclusion for every listed path;
 *   - rg with -u/--unrestricted/--no-ignore*, a positive -g/--glob/--iglob that could reach a listed
 *     path, a shell glob that could expand to one, or a command-substitution file list;
 *   - xargs or `find -exec` running grep or rg.
 * Grep tool: denied when `glob` reaches a listed path through an unset or ancestor `path`.
 *
 * Command recognition: the command line is split quote-aware into segments; `grep`/`rg` must be the
 * command word (after env assignments and wrappers) or git's subcommand, so a commit message, an
 * echo or a heredoc that merely names them passes. Each wrapper has its own option table. Strings
 * run by a shell (`bash -c`, `eval`, a heredoc fed to a shell) and command substitutions are
 * analyzed as commands. Every working directory the line could reach (the start directory and each
 * `cd` target) is tried against every segment, and a deny from any of them denies. Expansions the
 * guard cannot resolve count as wildcards. `$PWD` and `$HOME` resolve.
 *
 * The opt-in is the last `CASE_TEXT=maintenance` assignment that reaches the command; it propagates
 * into a shell script the command runs, not into outer command substitutions.
 *
 * Accepted false positive: a positive glob denies even when a later negative glob excludes every
 * listed path (`rg -g '*.json' -g '!eval/**' X`); `rg X src` is the substitute.
 *
 * Contract used (Claude Code 2.1.326): the payload is JSON on stdin with tool_name, tool_input and
 * cwd; a deny is exit 0 with this JSON on stdout:
 *   {"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny",
 *     "permissionDecisionReason":"..."}}
 * The guard blocks and never rewrites. It imports Node built-ins only.
 */
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const IGNORE_FILES = ["eval/.ignore", "eval/qa/.ignore", ".agents/rounds/.ignore"];
const OPT_IN_NAME = "CASE_TEXT";
const OPT_IN_VALUE = "maintenance";

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

// Private markers inside token text: an expansion the guard cannot resolve (a wildcard), and the
// two it can.
const UNKNOWN = "\u0001";
const PWD = "\u0002";
const HOME = "\u0003";
const OPERATOR_CHARS = new Set([";", "&", "|", "(", ")", "\n"]);
const META = "*?[]{}\\";

function newCommand() {
  return { tokens: [], heredocs: [], subs: [] };
}

/**
 * Split a command line into commands, quote-aware. A command is { tokens, heredocs, subs }: `subs`
 * holds the text of its command substitutions (and those in an unquoted heredoc body), `heredocs`
 * the bodies fed to it. A token is
 *   { text, pat, quoted, glob, unknown, subs, assign, valueStart }
 * `text` is the unquoted text; `pat` is a glob pattern in which quoted metacharacters are escaped, so
 * only the unquoted ones are active; `glob` marks an active metacharacter; `assign` is the variable
 * name of a leading `NAME=value` whose name was not quoted.
 */
export function tokenize(input) {
  const commands = [];
  let cur = newCommand();
  let word = null;
  const pending = [];
  const ensure = () => (word ??= { text: "", pat: "", quoted: false, glob: false, unknown: false, subs: 0, assign: null, valueStart: 0 });
  const endWord = () => {
    if (word) cur.tokens.push(word);
    word = null;
  };
  const endSegment = () => {
    endWord();
    if (cur.tokens.length || cur.subs.length || cur.heredocs.length) commands.push(cur);
    cur = newCommand();
  };
  const addChar = (c, quoted) => {
    const w = ensure();
    w.text += c;
    if (META.includes(c)) {
      w.pat += quoted ? `\\${c}` : c;
      if (!quoted && "*?[{".includes(c)) w.glob = true;
    } else w.pat += c;
  };
  const addMarker = (marker) => {
    const w = ensure();
    w.text += marker;
    w.pat += marker;
    if (marker === UNKNOWN) w.unknown = true;
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
  // `$` expansions, in or out of double quotes. Returns false when the `$` is a literal.
  const dollar = () => {
    const next = input[i + 1];
    if (next === "(") {
      const end = skipSubstitution(i + 2, "(", ")");
      cur.subs.push(input.slice(i + 2, end));
      ensure().subs++;
      addMarker(UNKNOWN);
      i = end + 1;
      return true;
    }
    if (next === "{") {
      const end = input.indexOf("}", i + 2);
      const name = input.slice(i + 2, end < 0 ? input.length : end);
      addMarker(name === "PWD" ? PWD : name === "HOME" ? HOME : UNKNOWN);
      i = (end < 0 ? input.length : end) + 1;
      return true;
    }
    if (next && /[A-Za-z_]/.test(next)) {
      let j = i + 1;
      while (j < input.length && /[A-Za-z0-9_]/.test(input[j])) j++;
      const name = input.slice(i + 1, j);
      addMarker(name === "PWD" ? PWD : name === "HOME" ? HOME : UNKNOWN);
      i = j;
      return true;
    }
    if (next && /[?$!@*#0-9-]/.test(next)) {
      addMarker(UNKNOWN);
      i += 2;
      return true;
    }
    return false;
  };
  const backtick = () => {
    const end = skipSubstitution(i + 1, "`", "`");
    cur.subs.push(input.slice(i + 1, end));
    ensure().subs++;
    addMarker(UNKNOWN);
    i = end + 1;
  };

  while (i < input.length) {
    const c = input[i];
    if (c === "\\") {
      if (input[i + 1] === "\n") {
        i += 2; // a line continuation joins the lines
        continue;
      }
      ensure().quoted = true;
      addChar(input[i + 1] ?? "", true);
      i += 2;
    } else if (c === "'") {
      const end = input.indexOf("'", i + 1);
      const stop = end < 0 ? input.length : end;
      ensure().quoted = true;
      for (const ch of input.slice(i + 1, stop)) addChar(ch, true);
      i = stop + 1;
    } else if (c === '"') {
      ensure().quoted = true;
      i++;
      while (i < input.length && input[i] !== '"') {
        if (input[i] === "\\") {
          const next = input[i + 1] ?? "";
          if (next === "\n") i += 2;
          else if (next === '"' || next === "\\" || next === "$" || next === "`") {
            addChar(next, true);
            i += 2;
          } else {
            addChar("\\", true);
            i++;
          }
        } else if (input[i] === "$" && dollar()) {
          // consumed
        } else if (input[i] === "`") backtick();
        else addChar(input[i++], true);
      }
      i++;
    } else if (c === "$" && input[i + 1] === "'") {
      ensure().quoted = true;
      i += 2;
      while (i < input.length && input[i] !== "'") {
        if (input[i] === "\\") {
          addChar(input[i + 1] ?? "", true);
          i += 2;
        } else addChar(input[i++], true);
      }
      i++;
    } else if (c === "$" && dollar()) {
      // consumed
    } else if (c === "`") backtick();
    else if (c === "#" && word === null) {
      while (i < input.length && input[i] !== "\n") i++;
    } else if (c === "~" && word === null && (i + 1 >= input.length || /[/\s;&|()]/.test(input[i + 1]))) {
      addMarker(HOME);
      i++;
    } else if (c === "<" && input.startsWith("<<<", i)) {
      endWord();
      const w = ensure();
      w.text = "<<<";
      w.pat = "<<<";
      endWord();
      i += 3;
    } else if (c === "<" && input[i + 1] === "<") {
      endWord();
      i += 2;
      if (input[i] === "-") i++;
      const record = { quoted: false, delimiter: "", body: "" };
      while (input[i] === " " || input[i] === "\t") i++;
      while (i < input.length && !/[\s;&|()<>]/.test(input[i])) {
        if (input[i] === "'" || input[i] === '"') {
          const q = input[i];
          const end = input.indexOf(q, i + 1);
          record.quoted = true;
          record.delimiter += input.slice(i + 1, end < 0 ? input.length : end);
          i = (end < 0 ? input.length : end) + 1;
        } else if (input[i] === "\\") {
          record.quoted = true;
          record.delimiter += input[i + 1] ?? "";
          i += 2;
        } else record.delimiter += input[i++];
      }
      cur.heredocs.push(record);
      pending.push({ record, owner: cur });
    } else if (c === "\n") {
      endSegment();
      i++;
      while (pending.length) {
        const { record, owner } = pending.shift();
        const body = [];
        while (i < input.length) {
          let end = input.indexOf("\n", i);
          if (end < 0) end = input.length;
          const line = input.slice(i, end);
          i = end + 1;
          if (line.replace(/^\t+/, "") === record.delimiter) break;
          body.push(line);
        }
        record.body = body.join("\n");
        if (!record.quoted) owner.subs.push(...substitutions(record.body));
      }
    } else if (OPERATOR_CHARS.has(c)) {
      endSegment();
      i++;
    } else if (c === " " || c === "\t") {
      endWord();
      i++;
    } else {
      const w = ensure();
      if (c === "=" && w.assign === null && !w.quoted && /^[A-Za-z_][A-Za-z0-9_]*$/.test(w.text)) {
        w.assign = w.text;
        w.valueStart = w.text.length + 1;
      }
      addChar(c, false);
      i++;
    }
  }
  endSegment();
  return { commands };
}

// ---------------------------------------------------------------- command resolution

const RESERVED = new Set(["!", "{", "}", "if", "then", "else", "elif", "fi", "do", "done", "while", "until"]);
const SHELLS = new Set(["bash", "sh", "zsh", "dash", "ksh"]);
const GREPS = new Set(["grep", "egrep", "fgrep"]);
const REDIRECT = /^[0-9]*(?:>>?|<{1,3}|&>|>&)/;
const BARE_REDIRECT = /^[0-9]*(?:>>?|<{1,3}|&>|>&)$/;

// Wrapper option tables: `value` options take the next word (unless attached with `=` or glued to a
// short option); every other dash word is a flag.
const WRAPPERS = {
  sudo: { value: ["-u", "-g", "-h", "-p", "-C", "-r", "-t", "-D", "-R", "-U", "-T"], long: ["--user", "--group", "--host", "--prompt", "--close-from", "--role", "--type", "--chdir", "--chroot", "--other-user", "--command-timeout"] },
  doas: { value: ["-u", "-C"], long: [] },
  command: { value: [], long: [] },
  builtin: { value: [], long: [] },
  exec: { value: ["-a"], long: [] },
  nohup: { value: [], long: [] },
  setsid: { value: [], long: [] },
  nice: { value: ["-n"], long: ["--adjustment"] },
  ionice: { value: ["-c", "-n", "-p", "-P", "-u", "-t"], long: ["--class", "--classdata", "--pid", "--pgid", "--uid"] },
  stdbuf: { value: ["-i", "-o", "-e"], long: ["--input", "--output", "--error"] },
  timeout: { value: ["-k", "-s"], long: ["--kill-after", "--signal"], duration: true },
  time: { value: ["-f", "-o"], long: ["--format", "--output"] },
  xargs: { value: ["-I", "-n", "-P", "-L", "-s", "-E", "-d", "-a"], long: ["--arg-file", "--delimiter", "--max-args", "--max-lines", "--max-chars", "--max-procs", "--process-slot-var", "--eof"] },
  env: { value: ["-u", "-C", "-S", "-P"], long: ["--unset", "--chdir", "--split-string"] },
};

/**
 * Resolve the command a segment runs, or null when it runs none. Returns
 * { env, name, args, via, query, cwdShift, split }: `env` is the environment the command sees (the
 * inherited one plus its assignments, last wins), `via` the wrappers passed through, `query` is true
 * for `command -v`/`-V` (nothing runs), `cwdShift` a token from `env -C`, `split` text from
 * `env -S`.
 */
export function resolveCommand(tokens, inherited) {
  const env = new Map(inherited);
  const via = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token.assign !== null) {
      env.set(token.assign, token.text.slice(token.valueStart));
      i++;
    } else if (!token.quoted && RESERVED.has(token.text)) i++;
    else if (!token.quoted && REDIRECT.test(token.text)) i += BARE_REDIRECT.test(token.text) ? 2 : 1;
    else break;
  }
  let cwdShift = null;
  let split = null;
  while (i < tokens.length) {
    const name = basename(tokens[i].text.replace(/^\\/, ""));
    const table = WRAPPERS[name];
    if (!table) return { env, name, args: tokens.slice(i + 1), via, query: false, cwdShift, split };
    via.push(name);
    i++;
    let durationPending = Boolean(table.duration);
    while (i < tokens.length) {
      const next = tokens[i];
      const text = next.text;
      if (name === "env" && next.assign !== null) {
        env.set(next.assign, text.slice(next.valueStart));
        i++;
      } else if (text === "--") {
        i++;
        break;
      } else if (text.startsWith("--") && text.length > 2) {
        const eq = text.indexOf("=");
        const long = eq < 0 ? text : text.slice(0, eq);
        let value = eq >= 0 ? { ...next, text: text.slice(eq + 1), pat: next.pat.slice(next.pat.indexOf("=") + 1) } : null;
        i++;
        if (eq < 0 && table.long.includes(long) && i < tokens.length) value = tokens[i++];
        if (name === "env") {
          if (long === "--ignore-environment") env.clear();
          else if (long === "--unset" && value) env.delete(value.text);
          else if (long === "--chdir") cwdShift = value;
          else if (long === "--split-string") split = value?.text ?? null;
        }
      } else if (text.startsWith("-") && text.length > 1) {
        i++;
        for (let k = 1; k < text.length; k++) {
          const letter = text[k];
          if (name === "command" && (letter === "v" || letter === "V")) return { env, name, args: [], via, query: true, cwdShift, split };
          if (name === "env" && letter === "i") env.clear();
          if (table.value.includes(`-${letter}`)) {
            const rest = text.slice(k + 1);
            const value = rest !== "" ? { text: rest, pat: rest } : i < tokens.length ? tokens[i++] : null;
            if (name === "env" && value) {
              if (letter === "u") env.delete(value.text);
              else if (letter === "C") cwdShift = value;
              else if (letter === "S") split = value.text;
            }
            break;
          }
        }
      } else if (durationPending) {
        durationPending = false;
        i++;
      } else break;
    }
  }
  // Only wrappers were left: nothing runs, except an `env -S` string.
  return via.length ? { env, name: "", args: [], via, query: false, cwdShift, split } : null;
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
const GREP_LONG = [
  "--extended-regexp", "--fixed-strings", "--basic-regexp", "--perl-regexp", "--regexp", "--file", "--ignore-case", "--no-ignore-case",
  "--word-regexp", "--line-regexp", "--null-data", "--no-messages", "--invert-match", "--version", "--help", "--max-count", "--byte-offset",
  "--line-number", "--line-buffered", "--with-filename", "--no-filename", "--label", "--only-matching", "--quiet", "--silent",
  "--binary-files", "--text", "--directories", "--devices", "--recursive", "--dereference-recursive", "--include", "--exclude",
  "--exclude-from", "--exclude-dir", "--files-without-match", "--files-with-matches", "--count", "--initial-tab", "--null",
  "--before-context", "--after-context", "--context", "--color", "--colour", "--binary", "--unix-byte-offsets",
];
const GREP_VALUE_LONG = new Set(["--regexp", "--file", "--max-count", "--after-context", "--before-context", "--context", "--include", "--exclude", "--exclude-from", "--exclude-dir", "--directories", "--devices", "--label", "--binary-files"]);

/** GNU getopt_long accepts any unambiguous prefix of a long option; an exact match always wins. */
function canonicalGrepLong(name) {
  if (GREP_LONG.includes(name)) return name;
  const candidates = GREP_LONG.filter((long) => long.startsWith(name));
  return candidates.length === 1 ? candidates[0] : name;
}

/**
 * Parse a grep or rg argument list into { flags: [{ name, value }], positionals: token[] }. `name`
 * is a long option (`--glob`) or a short letter (`-g`); `value` is its argument when it takes one.
 */
export function parseOptions(args, valueLetters, valueLong, canonical = (name) => name) {
  const flags = [];
  const positionals = [];
  for (let i = 0; i < args.length; i++) {
    const token = args[i];
    const text = token.text;
    if (!token.quoted && REDIRECT.test(text)) {
      if (BARE_REDIRECT.test(text)) i++; // a bare operator takes the next word as its target
      continue;
    }
    if (text === "--") {
      positionals.push(...args.slice(i + 1));
      break;
    }
    if (token.quoted && !text.startsWith("-")) positionals.push(token);
    else if (text.startsWith("--")) {
      const eq = text.indexOf("=");
      const name = canonical(eq < 0 ? text : text.slice(0, eq));
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
    } else if (c === UNKNOWN) out += ".*";
    else if (c === "?") out += ".";
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
    else if (c === "\\") out += (glob[++i] ?? "\\").replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
    else out += c.replace(/[.+^$()|\\/]/g, "\\$&");
  }
  return new RegExp(`^${out}$`, "i");
}

function relativeTo(projectDir, absolute) {
  return absolute === projectDir ? "" : absolute.slice(projectDir.length + sep.length);
}

/** True when a positive `-g` glob reaches the listed entry (by name, or by any suffix of its path). */
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

/** A path token as an absolute glob pattern for one working directory (null cwd: any prefix). */
function pathPattern(token, cwd, home) {
  const pattern = token.pat.replaceAll(HOME, home).replaceAll(PWD, cwd ?? UNKNOWN);
  if (pattern.startsWith(UNKNOWN)) return pattern;
  if (cwd === null && !pattern.startsWith("/")) return `${UNKNOWN}/${pattern}`;
  return resolve(cwd ?? "/", pattern);
}

/** True when a search over `paths` (empty means the cwd) walks into the entry without naming it. */
function scopeCoversEntry(paths, cwd, entry, home) {
  const scopes = paths.length ? paths.map((token) => pathPattern(token, cwd, home)) : [cwd === null ? UNKNOWN : resolve(cwd)];
  const parts = entry.path.split(sep);
  const ancestors = [];
  for (let end = 1; end < parts.length; end++) ancestors.push(parts.slice(0, end).join(sep) || sep);
  return scopes.some((scope) => {
    if (scope.includes(UNKNOWN)) return true; // an unresolved expansion in a search path: unknown scope
    const regex = globToRegExp(scope.replace(/\/+$/, "") || "/");
    return ancestors.some((ancestor) => regex.test(ancestor));
  });
}

function globDenied(globs, paths, cwd, entries, projectDir, home) {
  return entries.some(
    (entry) => scopeCoversEntry(paths, cwd, entry, home) && globs.some((glob) => globReachesEntry(glob, entry, projectDir)),
  );
}

const isMultiComponent = (component) => component === "**" || component.includes(UNKNOWN);

/** True when a path with an active glob could expand to a listed entry or to a path inside one. */
function globPositionalReaches(token, cwd, entries, home) {
  if (!token.glob) return false;
  const parts = pathPattern(token, cwd, home).split("/");
  return entries.some((entry) => {
    const entryParts = entry.path.split("/");
    for (let i = 0; i < entryParts.length; i++) {
      if (i >= parts.length) return false;
      if (isMultiComponent(parts[i])) return true;
      if (!globToRegExp(parts[i]).test(entryParts[i])) return false;
    }
    return true;
  });
}

// ---------------------------------------------------------------- segment rules

const GIT_OPTIONS_WITH_VALUE = new Set(["-c", "--git-dir", "--work-tree", "--namespace", "--exec-path", "--super-prefix", "--config-env", "--attr-source"]);

/** git's subcommand, its arguments, and the directory it runs in after every `-C`, in order. */
function gitState(args, cwd, home) {
  let where = cwd;
  for (let i = 0; i < args.length; i++) {
    const token = args[i];
    if (!token.text.startsWith("-")) return { name: token.text, rest: args.slice(i + 1), cwd: where };
    if (token.text === "-C" && args[i + 1]) {
      const target = args[++i];
      where = where === null || target.unknown || target.glob ? null : resolve(where, target.text.replaceAll(PWD, where).replaceAll(HOME, home));
    } else if (GIT_OPTIONS_WITH_VALUE.has(token.text)) i++;
  }
  return null;
}

/** True when the pathspecs exclude every listed entry. `:(top,exclude)` resolves from the top for its own pathspec only. */
function exclusionCovers(args, cwd, entries, projectDir, home) {
  const excluded = [];
  for (const token of args) {
    const text = token.text;
    let path = null;
    let base = cwd;
    if (text.startsWith(":!") || text.startsWith(":^")) path = text.slice(2);
    else {
      const magic = /^:\(([^)]*)\)(.*)$/.exec(text);
      if (magic && magic[1].split(",").includes("exclude")) {
        path = magic[2];
        if (magic[1].split(",").includes("top")) base = projectDir;
      }
    }
    if (path === null || token.glob || token.unknown) continue;
    excluded.push(resolve(base, path.replaceAll(HOME, home).replaceAll(PWD, base)));
  }
  return entries.every((entry) => excluded.some((ex) => entry.path === ex || entry.path.startsWith(`${ex}${sep}`)));
}

/** The deny reason for one resolved command in one working directory, or null. */
function segmentVerdict(command, cwdStart, ctx) {
  const { entries, projectDir, home } = ctx;
  const { name, args, via } = command;
  if (command.env.get(OPT_IN_NAME) === OPT_IN_VALUE) return null;
  let cwd = cwdStart;
  if (command.cwdShift) {
    const target = command.cwdShift;
    cwd = cwd === null || target.unknown || target.glob ? null : resolve(cwd, target.text.replaceAll(PWD, cwd).replaceAll(HOME, home));
  }

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
    const sub = gitState(args, cwd, home);
    if (!sub || sub.name !== "grep") return null;
    if (sub.cwd === null) return "git grep from an unknown directory";
    return exclusionCovers(sub.rest, sub.cwd, entries, projectDir, home) ? null : "git grep without an exclusion for every listed path";
  }

  if (GREPS.has(name)) {
    const { flags, positionals } = parseOptions(args, GREP_VALUE_LETTERS, GREP_VALUE_LONG, canonicalGrepLong);
    for (const { name: flag, value } of flags) {
      if (["--recursive", "--dereference-recursive", "-r", "-R"].includes(flag)) return "recursive grep";
      if (flag === "--directories" && value === "recurse") return "recursive grep";
      if (flag === "-d" && value === "recurse") return "recursive grep";
    }
    const explicitPattern = flags.some((f) => ["-e", "-f", "--regexp", "--file"].includes(f.name));
    const paths = explicitPattern ? positionals : positionals.slice(1);
    if (paths.some((t) => globPositionalReaches(t, cwd, entries, home))) return "shell glob that could expand to a listed path";
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
    if (globs.length && globDenied(globs, paths, cwd, entries, projectDir, home)) return "positive rg glob that reaches a listed path";
    if (paths.some((t) => globPositionalReaches(t, cwd, entries, home))) return "shell glob that could expand to a listed path";
    if (paths.some((t) => t.subs > 0)) return "command-substitution file list";
    return null;
  }
  return null;
}

// ---------------------------------------------------------------- command lines

/** Texts a command runs as commands of their own: a shell's script, `eval`, `env -S`. */
function nestedTexts(command, cmd) {
  const texts = [];
  if (command.split) texts.push(command.split);
  if (command.name === "eval") texts.push(command.args.map((t) => t.text).join(" "));
  if (!SHELLS.has(command.name)) return texts;
  let sawC = false;
  let sawS = false;
  let scriptFile = false;
  let script = null;
  const args = command.args;
  for (let i = 0; i < args.length; i++) {
    const text = args[i].text;
    if (!args[i].quoted && REDIRECT.test(text)) {
      if (BARE_REDIRECT.test(text)) i++;
      continue;
    }
    if (text === "--") {
      if (sawC && args[i + 1]) script = args[i + 1].text;
      else if (args[i + 1]) scriptFile = true;
      break;
    }
    if (text === "--rcfile" || text === "--init-file") i++;
    else if (text.startsWith("--")) continue;
    else if ((text.startsWith("-") || text.startsWith("+")) && text.length > 1) {
      for (let k = 1; k < text.length; k++) {
        if (text[k] === "c") sawC = true;
        else if (text[k] === "s") sawS = true;
        else if (text[k] === "o" || text[k] === "O") {
          i++;
          break;
        }
      }
    } else if (sawC) {
      script = text;
      break;
    } else {
      scriptFile = true;
      break;
    }
  }
  if (sawC) {
    if (script !== null) texts.push(script);
  } else if (!scriptFile || sawS) {
    // No -c and no script file: the shell reads its commands from stdin, which a heredoc or here-string feeds.
    for (const heredoc of cmd.heredocs) texts.push(heredoc.body);
    const here = cmd.tokens.findIndex((t) => t.text === "<<<" && !t.quoted);
    if (here >= 0 && cmd.tokens[here + 1]) texts.push(cmd.tokens[here + 1].text);
  }
  return texts;
}

/** Visit every command in a line, its substitutions and the texts it runs. Returns the first truthy result. */
function walk(text, env, depth, onCommand) {
  if (depth > 6) return null;
  const { commands } = tokenize(text);
  for (const cmd of commands) {
    for (const sub of cmd.subs) {
      const found = walk(sub, env, depth + 1, onCommand);
      if (found) return found;
    }
    const command = resolveCommand(cmd.tokens, env);
    if (!command || command.query) continue;
    const found = onCommand(command);
    if (found) return found;
    for (const nested of nestedTexts(command, cmd)) {
      const inner = walk(nested, command.env, depth + 1, onCommand);
      if (inner) return inner;
    }
  }
  return null;
}

const MAX_CWDS = 64;

/** Add the directories a `cd`/`pushd` can lead to. A directory the guard cannot resolve becomes null (unknown). */
function collectCwd(command, ctx) {
  if (command.name !== "cd" && command.name !== "pushd") return null;
  const target = command.args.find((t) => !(t.text.startsWith("-") && t.text.length > 1));
  for (const cwd of [...ctx.cwds]) {
    if (ctx.cwds.size >= MAX_CWDS) {
      ctx.cwds.add(null);
      break;
    }
    if (cwd === null) continue;
    if (!target) ctx.cwds.add(ctx.home);
    else if (target.unknown || target.glob || target.text === "-") ctx.cwds.add(null);
    else ctx.cwds.add(resolve(cwd, target.text.replaceAll(PWD, cwd).replaceAll(HOME, ctx.home)));
  }
  return null;
}

/** The deny reason for a command line, or null. */
export function bashVerdict(commandLine, state) {
  const ctx = { cwds: new Set([state.cwd]), entries: state.entries, projectDir: state.projectDir, home: state.home ?? homedir() };
  walk(commandLine, new Map(), 0, (command) => collectCwd(command, ctx));
  return walk(commandLine, new Map(), 0, (command) => {
    for (const cwd of ctx.cwds) {
      const reason = segmentVerdict(command, cwd, ctx);
      if (reason) return reason;
    }
    return null;
  });
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
  const state = { cwd: where, entries, projectDir, home: homedir() };
  if (toolName === "Bash" && typeof toolInput?.command === "string") {
    const rule = bashVerdict(toolInput.command, state);
    return rule ? { deny: true, rule } : { deny: false };
  }
  if (toolName === "Grep" && typeof toolInput?.glob === "string" && toolInput.glob !== "") {
    const paths = typeof toolInput.path === "string" && toolInput.path !== "" ? [{ pat: toolInput.path }] : [];
    const globs = toolInput.glob.split(/\s+/).filter(Boolean);
    return globDenied(globs, paths, state.cwd, entries, projectDir, state.home)
      ? { deny: true, rule: "positive Grep glob that reaches a listed path" }
      : { deny: false };
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
  try {
    const payload = JSON.parse(readFileSync(0, "utf8"));
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
