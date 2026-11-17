# Item 7.1 assessment (Sonnet 5.5)

Assessor: Claude Sonnet 5.5, independent of the other assessor. I opened no case file, no dated
record named in fact 3, and no `eval/qa` results. Evidence below is script source, counts, sizes,
`git ls-files`, and canary tests in a scratch git repo outside the worktree.

## Verdict in one paragraph

Adopt **(e) + (a, reworded) + (b, narrow) + (c, minimal, Claude-only, fail-open)**, and take **(f)
as a separate, later PR limited to the two golden-maintenance rounds' JSON intermediates**. Reject
(d). Do (g) as a plain owner chore, not repo work. The one real argument for the hook is that
three incidents in one round came from one failure mode (a Claude lane running recursive
`grep`/`git grep` through Bash) and that is the only mode `.ignore` cannot touch. A rule alone has
already failed twice (brief, option (a)). Keep the hook narrow so it is a just-in-time reminder
with the right pathspec in the message, not a security boundary.

## What I verified (and what I could not)

**Tools.** My session has **no Claude Code `Grep` or `Glob` tool** (Bash, Read, Edit, Write and
deferred MCP tools only). So I could not test whether those tools honor `.ignore`. I tested
`rg` 14.1.1 directly. Claude's Grep tool is documented as ripgrep-based, so it probably honors
`.ignore` when it has no explicit path; treat that as unverified and have the executor test it from
a lane that has the tool, in a scratch repo, before the rule text claims coverage.

**`rg` with a root `.ignore`** (canaries in `eval/qa/corpus/`, `eval/qa/cases.json`, a sibling
`eval/qa/run.mjs`, `docs/x.md`; `.ignore` listed the corpus dir, `cases.json`, `reviewed/`):

| Command | Searches ignored paths? |
|---|---|
| `rg PAT`, `rg PAT .`, `rg --files` | no (skipped) |
| `rg PAT eval/qa`, `cd eval/qa && rg PAT` (cases.json is a sibling) | no |
| `rg PAT eval/qa/corpus`, `rg PAT eval/qa/cases.json` | **yes** (explicit opt-in, as the brief says) |
| `rg PAT eval/qa/*` (shell expands the glob to explicit paths) | **yes**: this common idiom bypasses `.ignore` silently |
| `rg -u PAT`, `rg --no-ignore PAT`, `rg -uu PAT`, `rg --no-ignore-dot PAT` | **yes** |
| `rg -g '!eval/qa/corpus' PAT` | no (fine) |
| `git grep PAT`, `grep -rl PAT .` | **yes** (`.ignore` has no effect) |

So `.ignore` is a guard against the *default* ripgrep invocation and against accidents like a
bare `rg PAT` or the Grep tool with no path. It is not a guard against `grep -r`, `git grep`,
`rg -u`, or a shell glob. Single-letter `-u` is the common fix agents reach for when a search "finds
nothing", so expect it.

**Brief's fact 2 (nothing runs ripgrep).** Confirmed. `git grep` over `.github`, `package.json`,
`scripts`, `src`, `test`, `vitest.config.ts` and `eval` (case folders excluded) finds no `rg` or
`.ignore` use. The only `rg` text is agent-skill prose (`audit-reviewability`,
`improvements-pipeline`). vitest's `exclude` is an explicit list (`.claude/**`, `tmp/**`, ...) and
does not read `.ignore`. Adding `.ignore` cannot change CI, build, or tests. **Fact 3 (spread).** Re-ran `casetext-scan.mjs . 8` (3.7 s): 336 files match, 89 with 5+ cases,
as stated. Counts for the two dated rounds: `2026-11-02-golden-audit` is 71 files (64 JSON,
7 md, 4.2 MB, 3 files over 100 KB); `2026-11-14-golden-coverage-audit` is 110 files (50 JSON,
45 md, 12 txt, 4.6 MB, 17 files over 100 KB). They are 8.8 MB of the heaviest golden text and
sit entirely in `.agents/rounds/`. Live golden-derived files: `eval/qa/consistency-register.json`
(199 KB), `eval/qa/source-sentinels.json` (8 KB). Question-only live files:
`eval/routing-cases.json` (182 KB), `eval/discovery/cases.json`, `eval/agentic/sample.json`.
Inbound path references to the two rounds from outside them: about 23 files (ledgers, TODO,
seven `improvements/` records, five `research/` records, `specs/stellar-org.json`); none from `test/`,
`scripts/`, `src/` or `eval/`. So deleting their intermediates breaks links in prose only.

**Fact 4 and 7.** Agree: a whole-`eval/qa` exclusion also hides ~60 scripts, README and taxonomy, so list
files. `tmp/fp/` is only reachable from a lane in the main checkout (worktrees have no `tmp/`); I did
not touch it. It is owner hygiene, not repo work.

## Options

### (a) Rule in AGENTS.md
- Pros: free; covers every CLI; documents the opt-in for maintenance lanes.
- Cons: already ineffective by the brief's own account; a pathspec per tool in AGENTS.md is long
  and AGENTS.md says to add rules only after recurring friction (this is that friction, so it
  qualifies).
- **Verdict: adopt, reworded.** One short rule, not a per-tool pathspec table: "Search with
  `.ignore` in force. Never pass `-u`/`--no-ignore`, a glob over `eval/qa`, `grep -r` or
  `git grep` without the pathspec in `.ignore`; the hook prints it." The rule should point to
  `.ignore` as the list so the path list lives in one place. Say plainly that Codex and Grok lanes
  rely on the rule alone.

### (b) `.ignore`
- Pros: one file; honored by default by ripgrep, probably the Grep tool, VS Code; maintenance
  lanes opt in with an explicit path; zero effect on CI and tests (fact 2); also fixes the
  `audit-reviewability` and `improvements-pipeline` skill commands for free.
- Cons: leaks via `-u`, a shell glob, `grep -r`, `git grep` (tested above); in git it is a
  dotfile agents will not know about unless the rule names it.
- **Verdict: adopt in part**: case-bearing *files*, not whole `eval/qa`, and the two golden
  rounds. Exact list under "Recommended combination".

### (c) Hook
- Pros: the only option aimed at the observed failure (Bash `grep -r`, `git grep`); the deny
  message teaches the correct pathspec at the moment it matters, which a brief or AGENTS.md rule
  cannot do; the hook can read `.ignore` as its path list.
- Cons: shell parsing is approximate; covers Claude only; applies to the owner's interactive
  sessions in this repo; skip-permission behavior unconfirmed; a bug blocks work.
- **Verdict: adopt, minimal.** Design constraints:
  - Fail open on any parse error, missing `.ignore`, unknown input shape, or exception. Exit 0
    with no output unless a deny is certain.
  - Deny only when the command contains a recursive text search (`git grep`, `grep` with `-r`/`-R`
    or `--recursive` or `-[a-z]*r[a-z]*`, `rg`/`ag`/`ack` with `-u`/`--no-ignore`, or `find ...
    -exec|xargs grep`) **and** gives no scoping evidence. Scoping evidence is any of: the
    pathspec exclusion tokens for every `.ignore` entry; `--exclude-dir` for the corpus
    directory names; all positional path arguments resolved outside every `.ignore` path.
    A bare `git grep PAT`, `grep -rn PAT .`, `grep -r PAT eval` and `rg -u PAT` are denied;
    `git grep PAT -- src test`, `grep -rn PAT src`, `rg PAT` are allowed.
  - Do not hook the Grep/Glob tools: with `.ignore` they are covered by default; a matcher there
    adds false positives for little. (Re-check once the executor tests them.)
  - Opt-in: a literal marker comment in the command, `# case-read`, and an explicit path into a
    case path also counts as intent. Block, do not rewrite: rewriting a pipeline silently changes
    what the agent thinks it ran. The message prints the exact pathspec line to paste.
  - Do not attempt `cd`, variables, subshells, or aliases; those pass through (fail open). That is
    accepted: the goal is accident prevention.
- Rejected alternative: `permissions.deny` for `Bash(git grep:*)` / `Bash(grep -r:*)`: no parsing, but
  it blocks scoped daily searches too and cannot show the pathspec.

### (d) Structural (encrypt or move held-out text)
- Pros: only option that removes the content rather than hiding it.
- Cons: the brief already lists them: CI needs a key; set membership leaks if only held-out files
  move; history and the public remote keep every old copy; 300 other files still carry text.
- **Verdict: reject.** Cost is high and it does not fix the leak surface fact 3 shows.

### (e) Routing runner aggregates only
- Pros: removes a leak that happens on every run, by every lane and CI, needs no agent
  discipline; `.agents/TODO.md` already asks for it; rows stay in the results file; precedent
  exists (`eval/lib/confirmation-only.mjs`). Smallest change that stops a certain, recurring leak.
- Cons: one flag to remember when debugging.
- **Verdict: adopt.** Default prints aggregates; `--rows` (name to taste) restores the per-row
  tables (`console.table` at `eval/run-routing.mjs:479`, `:480`, `:496`, `:518`). Holdout and
  protocol-history rows first; check the non-holdout tables are not already safe to keep.

### (f) Flush dated case-bearing records
- Pros: shrinks the search surface for every tool, including `grep -r` and `git grep` which no
  other option fully controls; history keeps the files; AGENTS.md already says documentation links
  history rather than being history.
- Cons: ~23 inbound links to repoint (prose only, none in code or tests per my `git grep -l`);
  every deletion needs a written disposition; moves evidence a step from readers; touching the
  dated records is itself an exposure risk for whoever edits them.
- **Verdict: adopt in part, as its own PR after this item.** Scope: the 64 + 50 JSON
  intermediates in the two golden rounds (the files carrying 1,000 to 7,000 shingles). Keep the
  Markdown ledgers, review notes and scripts (`.mjs`/`.mts`), which the inbound links point at.
  Not in this item's must-ship set because (b) and the hook already hide these paths from the
  default and the scoped searches. Someone other than a held-out-exposed lane should do it, using
  counts and the scan script.

### (g) Archive main `tmp/fp/` and `tmp/agentic/`
- Pros: removes the largest per-case store from `grep -r`; frees 12 GB.
- Cons: not a repo change; the evidence archive deliberately excluded these paths, so archiving
  needs a decision about what to keep; one committed record cites a `tmp/fp/` file.
- **Verdict: adopt in part, as an owner chore.** Archive to `~/backups/` (mode 600, listing and
  hash) before deleting; keep the cited file. Not a gate for 7.1.

## Question answers

**Q1.** See "Recommended combination". Stopped: both content incidents (hook) and the routing table
print (e). Not stopped: a Codex or Grok `grep -r` (rule only); a pattern search that hits one
dated long-tail file; misuse of the opt-in marker; `cd` + `grep -r .` forms the hook fails open on.

**Q2. `.ignore` paths.** Files, not `eval/qa`: the corpora, the three generated case files,
`reviewed/`, `results/` (harmless; already git-ignored), the register and sentinels, and the two
golden rounds. Leave out `eval/routing-cases.json`, `eval/discovery/cases.json` and
`eval/agentic/sample.json` (question text only; those lanes search them as their own instruments)
and the long tail of dated `research/` and `improvements/` (scattered matches; hiding `research/`
blinds evidence lookups). A test keeps it in step (see "Tests").

**Q3.** Yes, narrow: block, no rewrite, opt-in by marker or explicit case path (details under (c)).
About 100 lines of Node plus a table test; one prevented exposure (a script, a split copy, rebriefs,
one fewer held-out case) repays it. Add Codex or Grok hooks in the same PR only if their committed
config contract is confirmed. Do not ship it if skip-permissions behavior cannot be confirmed: it
would give false cover.

**Q4. (f) and (g).** See verdicts. Stay in the tree: round ledgers (`.md`), review notes, scripts, the
committed `apply/RECONCILE.md` that cites `tmp/fp/`, and live golden-bearing files.

**Q5. Errors and extras.** (1) `.ignore` is not read by Codex or VS Code when `-u`, a glob or `git grep`
is used, so the brief's "read by Codex's shell rg" holds only for default `rg`. (2) Incident 5.3 was
names-only: two content incidents, both Claude Bash `grep`, one failure mode, so one targeted
control is proportionate. (3) The shell-glob hole (`eval/qa/*`) means the rule must say "never glob
over `eval/qa`". (4) `.claude/settings.json` affects the owner's sessions; say so in the PR body.
(5) The `audit-reviewability` and `improvements-pipeline` skills run repo-wide `rg`; they now skip
case paths, which is right. `golden-truth` should say its lane opts in with an explicit path.

## Recommended combination

**(e) + (a) + (b) + (c), then (f) later; (g) as an owner chore.**

Order of work: (e) first (deterministic, testable, no judgment), then `.ignore` and the rule
text, then the hook, then the containment test.

Exact `.ignore` (gitignore syntax, anchored; comment explains opt-in):

```
# Case-bearing paths. rg, the Grep tool and VS Code skip these; name a path explicitly to search it.
/eval/corpus/
/eval/qa/corpus/
/eval/qa/cases.json
/eval/qa/sample.json
/eval/qa/tool-cases.json
/eval/qa/reviewed/
/eval/qa/results/
/eval/qa/consistency-register.json
/eval/qa/source-sentinels.json
/.agents/rounds/2026-11-02-golden-audit/
/.agents/rounds/2026-11-14-golden-coverage-audit/
```

`git grep` pathspec the hook prints, derived from the same lines:

```
git grep PAT -- ':!eval/corpus' ':!eval/qa/corpus' ':!eval/qa/cases.json' ':!eval/qa/sample.json' \
  ':!eval/qa/tool-cases.json' ':!eval/qa/reviewed' ':!eval/qa/results' \
  ':!eval/qa/consistency-register.json' ':!eval/qa/source-sentinels.json' \
  ':!.agents/rounds/2026-11-02-golden-audit' ':!.agents/rounds/2026-11-14-golden-coverage-audit'
```

The hook should build both from `.ignore` at run time (one list, no drift), and print the
`grep -r --exclude-dir=...` form too.

Gitignore for the settings file: add `!.claude/settings.json` after `.claude/*`. Settings holds
only the `PreToolUse` entry (`matcher: "Bash"`) calling a committed script, for example
`scripts/hooks/guard-case-search.mjs`.

AGENTS.md rule (hard-rules block), about four lines: recursive search runs with `.ignore` in force;
no `-u`/`--no-ignore`, no glob over `eval/qa`; `grep -r` and `git grep` carry the pathspec the
hook prints; golden-maintenance lanes name the case path explicitly and say so in their brief;
Codex and Grok lanes are not hook-covered.

## Tests I would require

1. **Runner (e):** default `--gate` output on a fixture has the aggregate lines and no row ids;
   `--rows` prints them; the results JSON still holds every row in both modes.
2. **`.ignore` entries exist:** every entry resolves to at least one `git ls-files` path (no stale
   line). Cheap, offline.
3. **Containment (the Q2 test):** reuse `casetext-scan.mjs`'s shingling in a test (3.7 s on 2,225
   files; confirm it stays under the suite budget) but only over the *live* tree: `eval/`, `test/`,
   `src/`, `scripts/`, `catalog/`, `usage/`, `docs/`. Fail with paths and counts only (never text)
   when a file carries 8-word golden/notes shingles from 5 or more cases and is neither covered by
   `.ignore` nor on a small allowlist (the routing and discovery question files, test fixtures).
   Do not scan dated `.agents/rounds/`, `research/`, `improvements/`: they grow every round and
   would make the test a chore.
4. **Hook table test**: a list of command strings with expected allow/deny, in the repo, no
   network. Must-deny: bare `git grep PAT`; `grep -rn PAT .`; `grep -r PAT eval`; `rg -u PAT`;
   `rg --no-ignore PAT`; `find . -name '*.json' | xargs grep PAT`. Must-allow: `git grep PAT --
   src test`; the pathspec form above; `grep -rn PAT src scripts`; `rg PAT`; `rg PAT eval/qa/corpus
   # case-read`; `git log`, `ls`, `npm test`. Must-fail-open: malformed JSON on stdin, empty
   command, missing `.ignore`, a command the parser cannot split.
5. Hook opens only `.ignore` (no case file read on the deny path).
6. Baseline gates from AGENTS.md: `npm run typecheck`, `npm test`, `npm run build`, and
   `npm run secrets:scan -- --tree`.

Not required: a model run, CI changes, or a `.gitleaks` change (none of them read `.ignore`).

## Open items for the executor

- Confirm a `PreToolUse` hook denies under skip-permissions; confirm the Grep/Glob tools honor `.ignore`
  and still search an explicit ignored path (I had no such tools); read Codex 0.169's `hooks`
  contract (listed stable) and Grok's. Pick the marker: I prefer the `# case-read` comment.
