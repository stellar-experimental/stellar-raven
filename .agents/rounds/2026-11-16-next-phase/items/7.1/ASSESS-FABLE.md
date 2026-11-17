# Item 7.1 assessment (Fable)

Assessor: Claude Fable 5.2, high effort, terminal `t1wp`, worktree at `131c6c1c`. No case file was
opened. Evidence is script source, counts, sizes, and a canary repository in my scratch directory
(ripgrep 14.1.1, the version on this box). No model call, no subagent.

## Recommendation in brief

Adopt **(e) + (c, minimal) + (b, in a different layout) + (a, as a one-tool rule) + (g)**, and apply
**(f)** through the retention rule the repository already has. Reject **(d)**. Hold a new option
**(h)** (git attributes) as the first fallback.

The core idea: make `rg` the one safe search tool, and make the unsafe ones fail fast. `.ignore`
files make `rg` skip case text (b); a hook denies recursive `grep`, `git grep` and
`rg --no-ignore` and points the lane to `rg` (c); the rule is then one sentence (a).

Only (c) would have stopped the three incidents. All three were Claude lanes running recursive
`grep` through Bash after the rule had been given. (b) alone would have stopped none of them.

## What I checked

| Brief fact | Result |
|---|---|
| 1. `.ignore` coverage | Partly wrong. See "Corrections" 1 and 2. |
| 2. Nothing runs ripgrep | Confirmed for `package.json` scripts, `.github/`, `scripts/`. No biome, fd or other `.ignore` reader in `package.json`. There is no `.ignore`, `.rgignore` or `.gitattributes` today. |
| 3. Case text outside the case folders | Confirmed. I re-ran the scan (golden fields, 3.7 s): 294 files. See "Corrections" 4. |
| 4. `eval/qa` holds more than cases | Confirmed: 49 scripts and 12 other top-level files beside `corpus/` (561 files) and `reviewed/` (9). |
| 5. `.claude/*` is git-ignored | Confirmed (`.gitignore`: `.claude/*`, `!.claude/skills`). Hooks under `--dangerously-skip-permissions`: not tested, because that needs a model-calling run. |
| 6. Routing runner | Confirmed: `eval/run-routing.mjs:480` and `:495` print the per-row tables. CI runs it at `.github/workflows/ci.yml:110`, so the rows also land in public CI logs. The gate failure lines (`:386`–`:397`) are aggregates already. |
| 7. `tmp/` | Confirmed: main checkout `tmp/fp` is 12 GB, `tmp/agentic` 4.5 MB. A third folder, `tmp/size-audit`, is not in the brief. |

**Grep and Glob tools: I do not have them.** This session exposes Bash, Read, Edit and Write only,
so I could not test them. The Claude Code 2.1.326 binary contains the strings
`CLAUDE_CODE_GLOB_NO_IGNORE` and `CLAUDE_CODE_GLOB_HIDDEN` and the literals `--no-ignore` and
`--hidden`. That suggests Glob can run without ignore files and that hidden folders are searched.
This is inference from strings, not a test. A lane that has the tools should run the canary test
below.

Other tools: `codex-cli 0.169.0` has a hook mechanism (`codex --help` lists
`--dangerously-bypass-hook-trust`); I did not check its events. `grok 1.0.88 --help` shows no hook.

## Corrections to the brief

1. **A root `.ignore` with anchored paths leaks on this ripgrep.** With `/eval/qa/corpus/` in a root
   `.ignore`, `rg <pat>` from the root and `rg <pat> eval/qa` skip the corpus, as the brief says. But
   `rg <pat> eval`, `cd eval && rg <pat>`, and `rg <pat> .agents` (for a dated round entry) search
   the ignored folder. The leak appears when two or more path components lie between the search
   root and the ignored entry. An `.ignore` placed in the entry's **immediate parent folder**, with a
   one-component entry (`eval/qa/.ignore` holding `/corpus/`), leaked from no root I tested: the
   repository root, `eval`, `eval/qa`, `.agents`, `.agents/rounds`, and `cd` into each (three runs,
   two entry orders; the root-layout leak is deterministic). The explicit path opt-in still works.
2. **`rg -g '*.json'` overrides a file-level entry.** A glob flag re-includes ignored *files* that
   match it, but does not descend into ignored *folders*. So `rg -g '*.json' <pat>` searched
   `eval/qa/cases.json` (2.6 MB, every compiled case) in both layouts, and skipped
   `eval/qa/corpus/`. `rg -t json` does not override. The Grep tool's `glob` parameter most likely
   maps to `-g` (untested). Consequence: a case-bearing file is safe only inside an ignored folder.
3. **`.agents` is a hidden folder.** Plain `rg` from the root never searches `.agents/rounds/` at
   all. The dated records matter for `rg --hidden`, for the Claude Grep tool if it passes
   `--hidden`, and for `grep -r` and `git grep`.
4. **Golden text outside the case folders is concentrated.** Of 40,695 golden shingles outside the
   case folders, 38,831 (95%) are in the two golden-audit rounds, and 38,009 (93%) are in their 114
   JSON files (8.8 MB together). Outside those rounds, 172 files match; 129 of them carry fewer than
   10 shingles, which is mostly shared public phrasing (two `src/` files match on 1 and 2 shingles).
   Only 6 carry 50 or more.
5. **Option (f) is existing policy.** `.agents/README.md` ("Retention") already says to delete
   intermediate reviews and raw outputs after reconciliation, and to keep a dated record only while
   a current artifact cites it. The two golden rounds were never pruned. No new deletion rule is
   needed.
6. **A missing option, (h): git attributes.** Marking case paths as binary for git makes `git grep`
   print `Binary file <path> matches` with no content, and makes `git diff`, `git show` and
   `git log -p` print `Binary files differ`. `git grep -a` and `git diff --text` are the opt-ins.
   Measured in the canary. Assessed below.
7. Minor: "nothing in the repository says which set a case is in" is not exact.
   `eval/qa/scan-tuning-exposure.mjs` names tuning target rows in source. Held-out and reserve
   membership is still unpublished.

## Options

Stopped = would have stopped the 5.3, 6.1 and 6.2 searches.

| Option | Stopped | Verdict |
|---|---|---|
| (a) Rule | 0 of 3 (it was already in the briefs) | Adopt, as one sentence |
| (b) Ignore files | 0 of 3 alone | Adopt in part: parent-folder layout, folder entries |
| (c) Hook | 3 of 3 | Adopt, minimal form |
| (d) Structural | 3 of 3 | Reject |
| (e) Runner | Separate problem | Adopt |
| (f) Flush dated records | 0 of 3 (the hits were corpus files) | Adopt in part, under the retention rule |
| (g) Archive `tmp/fp` | 0 of 3 | Adopt |
| (h) Git attributes | 0 of 3 (none used `git grep`) | Not now; first fallback |

### (a) Rule: adopt, as one sentence

- Pros: free; always loaded, unlike a brief; three incidents meet the "recurring friction" bar.
- Cons: a pathspec rule failed twice already. With 294 files outside the case folders, no pathspec
  a lane can remember is complete.
- So state a tool, not a pathspec: *"Search this repository with `rg` or the Grep tool. They skip
  the case-bearing paths (`.ignore`). Never run `grep -r`, `git grep`, or `rg` with `-u` or
  `--no-ignore` here. Only a golden-maintenance lane opens case text, by naming the exact path."*
  Put the mechanism and the maintenance opt-in in `eval/qa/README.md` ("Held-out split").

### (b) Ignore files: adopt in part

- Pros: makes the default search safe for every ripgrep-based tool and vendor (Codex prefers `rg`);
  an explicit path stays a natural opt-in; no runtime cost.
- Cons: nothing for `grep -r` and `git grep`; the holes in corrections 1 and 2; Glob may ignore it.
- Use the parent-folder layout and folder entries. Move the three generated files into a folder so
  the `-g` hole closes for the largest file. Path lists are under "Recommended combination".
- Dated records: list the two golden-audit rounds only. Do not list all of `.agents/rounds` or
  `research/`; lanes need those for context, and the tail is mostly incidental phrasing.
- A scan test: yes, as a ratchet, not an exact mirror. See "Tests".

### (c) Hook: adopt, minimal form

- Pros: the only cheap option that stops the observed failure. A deny costs the lane one retry.
- Cons: Claude lanes only; runs on every Bash call (one Node start); also applies to the owner's
  sessions; the bypass-mode behavior is unverified.
- **Block, do not rewrite.** A silent rewrite changes regex dialect and output format, and the lane
  then misreads its own result. A deny with a message teaches the lane.
- **Parse commands, not paths.** Deny when a command segment is: `grep`, `egrep` or `fgrep` with
  `-r`, `-R` or `--recursive`; `git … grep`; `xargs … grep`; or `rg` with `-u`, `--unrestricted` or
  any `--no-ignore*`. The message says: use `rg <pattern> [path]`. A scoped `grep -r foo src/` is
  denied too. That is deliberate: `rg foo src/` is equivalent, and the hook stays simple and
  predictable. `git log --grep` and `ps | grep` must pass.
- For the Grep tool (structured input), deny only when `glob` matches a file-level entry of an
  `.ignore` file and `path` is unset or an ancestor of it. That closes the `-g` hole for Claude.
- Opt-in: an env prefix on the command, `CASE_TEXT=maintenance`. The deny message says only a
  golden-maintenance lane may set it. `rg` with an explicit case path needs no marker.
- Fail open on any error, with a note on stderr.
- Codex has hooks; if a `PreToolUse` equivalent exists, reuse the same script. Otherwise Codex is
  covered by (b) only. Grok is uncovered; keep Grok lanes off repository-wide search by brief.
- **Stop rule:** if a probe shows hooks do not fire under `--dangerously-skip-permissions`, (c) is
  void. Then adopt (h) and (f) now, and reconsider (d).

### (d) Structural: reject

- Pros: the only option that covers every tool and vendor for the case folders.
- Cons: the costs the brief lists; a key in CI and in every lane for text that is public anyway;
  the 294 outside files remain.
- If a held-out exposure ever passes the hook and the ignore files, the form to build is packing,
  not encryption: all cases in one opaque archive behind one loader. No key, no membership leak.
  It still costs readable golden diffs in review.

### (e) Runner: adopt

- Pros: small, already an open item in `.agents/TODO.md`, removes holdout ids from every CI log.
- Cons: none worth weighing. Use `--rows` for the per-row tables; rows stay in the results file.
  List the routing blind files in `eval/.ignore` for the same reason (I did not open them).

### (f) Flush dated records: adopt in part

- Pros: removes 93% of the outside golden text from every tool at once, and makes the short
  pathspec (`eval/qa`, `eval/corpus`) nearly sufficient. It applies an existing rule.
- Cons: 28 files outside the two rounds reference them (12 round records, 6 under `research/`,
  7 `improvements/`, `.agents/TODO.md`, one `eval/qa` file, one `specs/` file); links need a check.
  It would not have stopped the three incidents.
- Remove: the 114 JSON intermediates under `.agents/rounds/2026-11-02-golden-audit/` and
  `.agents/rounds/2026-11-14-golden-coverage-audit/`, and the briefs there that no current artifact
  cites. Record `131c6c1c` as the last commit with the full tree in each round's Outcome section.
- Keep: every file a current artifact cites (`improvements/`, `.agents/TODO.md`,
  `eval/qa/README.md`), or re-point that link to a commit permalink. Keep all live files
  (`consistency-register.json`, `source-sentinels.json`, `routing-cases.json`, tests, fixtures) and
  this round's records. Do not rewrite other dated records.

### (g) Archive `tmp/fp` and `tmp/agentic`: adopt

- Pros: 12 GB of per-case data that is archived nowhere leaves the reach of `grep -r`, and gains a
  backup. Cons: owner-box work outside the repository; deletion is irreversible.
- Verify the archive (listing and SHA-256) before removing anything, and get the owner's
  confirmation for the removal. Classify `tmp/size-audit` in the same pass. Record archive path and
  hash in the item's disposition; do not edit the committed record that cites `tmp/fp`. Leave the
  `gca-eval` worktree and `eval/qa/results/splits/` alone.

### (h) Git attributes: not now

- Measured: `eval/qa/corpus/** -diff` gives the binary behavior. A named driver (`diff=casetext`)
  plus `git config diff.casetext.binary true` in `prepare` gives the same on a configured clone.
- Cons: `scripts/scan-secrets.mjs` parses `git diff --cached -U0` in staged mode, so it would go
  blind on case files unless it adds `--text`. Golden-maintenance lanes would need `--text` for
  every diff. A plain `-diff` likely hides golden diffs in GitHub review (not tested).
- No incident used `git grep`, and the hook denies it for Claude. Adopt this first if a `git grep`
  or `git diff` exposure happens, or if the hook stop rule fires.

## Answers to the five questions

1. The combination above. (c) carries the observed failure; (b) and (a) make the safe tool the
   default; (e), (f) and (g) are cheap and independent. Not stopped: a Grok lane's `grep -r`, a
   `cat` or Read of a case file, `git diff` on a golden commit, and `rg -g` on a file-level entry
   from a non-Claude lane.
2. Only the case-bearing paths, never whole `eval/qa`. Folder entries in the immediate parent's
   `.ignore`. The two golden-audit rounds and no other dated record. A scan test: yes, as a ratchet.
3. Yes, minimal: block, command-word matching, env-prefix opt-in, fail open.
4. (f): the JSON intermediates of the two golden rounds. (g): `tmp/fp` and `tmp/agentic`.
5. See "Corrections".

## Recommended combination

**Change 1 (one reviewed PR): (e), (a), (b), (c) and their tests.**

`eval/.ignore`:

```
/corpus/
/holdout-cases.json
/protocol-history-blind-cases.json
/protocol-history-blind-cases-v2.json
```

`eval/qa/.ignore`:

```
/corpus/
/compiled/
/reviewed/
/results/
/consistency-register.json
/source-sentinels.json
```

`.agents/rounds/.ignore`:

```
/2026-11-02-golden-audit/
/2026-11-14-golden-coverage-audit/
```

- `/compiled/` holds `cases.json`, `sample.json` and `tool-cases.json` after their move from
  `eval/qa/`. Roughly 30 files reference them (scripts, tests, one workflow, two skills, READMEs). If
  the move is deferred, list the three as file entries until it lands and record the `-g` hole.
- No root `.ignore`. Every entry is anchored, literal, and one component long.
- Not listed, by decision: `eval/routing-cases.json`, `eval/discovery/cases.json` and
  `eval/agentic/sample.json` (question text that routing lanes must read), `improvements/`,
  `test/`, and dated records outside the two rounds.
- `.gitignore`: add `!.claude/settings.json`. Hook script at
  `scripts/agent-hooks/case-search-guard.mjs`, one `PreToolUse` entry with matcher `Bash|Grep`.

**Change 2 (ledger-only PR):** (f). **Owner-box action:** (g), recorded in the item's disposition.

## Tests to require

1. **Hook decisions** (pure function, vitest table). Denied: `grep -rl X .`, `grep -rn X`,
   `grep -r X . | head`, `cd eval && grep -R X`, `git grep X`, `git -C . grep X`,
   `find . -name '*.json' | xargs grep X`, `rg -uu X`, `rg --no-ignore X`. Allowed:
   `grep X file.txt`, `ps aux | grep node`, `git log --grep=X`, `rg X`, `rg X src`,
   `CASE_TEXT=maintenance git grep X`. Grep tool: `glob: "*.json"` with no path denied;
   `glob: "*.ts"` allowed. Malformed input and a thrown error both allow.
2. **Hook wiring:** `.claude/settings.json` parses, names a script that exists, and is tracked.
3. **Ignore layout** (pure Node, always runs): each `.ignore` holds only anchored one-component
   literal entries; each entry exists in the tree or is git-ignored; the required entries are
   present.
4. **ripgrep behavior** (skipped when `rg` is absent): copy the three `.ignore` files into a temp
   tree with canary files at every listed path. Run `rg --hidden` from the root, `eval`, `eval/qa`,
   `.agents` and `.agents/rounds`, and by `cd` into each. No canary may print. An explicit path must
   print one. Run the same fixture once by hand from a lane that has Grep and Glob.
5. **Case-text ratchet:** promote `casetext-scan.mjs` to `eval/qa/` with golden fields and K=8. The
   test fails when a tracked file outside the ignored paths carries 50 or more golden shingles and
   is not in a committed baseline of path and ceiling. It prints paths and counts only. The first
   baseline is 5 files: `items/1.4/dated/PRESTAGE.md` (325),
   `.agents/rounds/2026-09-09-docs-golden-matrix-sol.md` (150),
   `research/audits/2026-11-09-improvements-sweep/review-lct-fable.md` (113),
   `.agents/rounds/2026-11-14-baseline-tuning/CASE-DEFECTS.md` (81), and one
   `test/fixtures/qa-verdict-consistency/` fixture (52).
6. **Runner:** default and `--gate` stdout holds the aggregates and no id from
   `holdout-cases.json` or the protocol-history files; `--rows` prints the tables; the results file
   holds every row in both modes; the exit code is unchanged for a passing and a failing gate.
7. **One live probe by the executor:** a Claude child under `--dangerously-skip-permissions` runs a
   canary `grep -r` in a scratch repository with the hook installed, to confirm the deny fires.
8. **Gates:** `npm run typecheck`, `npm test`, `npm run build`, `npm run eval:routing -- --gate`,
   and the `eval/` checks from `CONTRIBUTING.md`. If the generated files move:
   `npm run eval:qa:compile`, `npm run eval:qa:lint`, `npm run eval:routing:overlap`. Then
   `npm run secrets:scan -- --tree`.

Scratch evidence (canary repository, full golden-scan path list), which may not survive a reboot:
`/tmp/claude-1000/-home-tyler-code-raven-wt-np-7-1/b7e7ab5d-b8bb-4262-b6d4-a4957ad8d72c/scratchpad/`
