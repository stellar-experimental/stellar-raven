# Repository audit — 2026-09-30

## Scope

Audit every directory and file for structure, clarity, accuracy, retention, privacy, test value,
and memory hygiene. Land the agreed changes in one PR from branch `chore/repo-audit-2026-09-30`.

The repository is public. Every tracked file must be clear, current, and hold nothing private
without need. This is not a code or service audit: retrieval quality, scoring, and code security are
out of scope.

Phases: audit (read-only lane reports), decide (owner questions, one owner lane per file), apply,
independent review, ship.

## Lanes

| lane | agent (model, effort) | pane | write set | status |
| --- | --- | --- | --- | --- |
| docs-public | Claude Opus 5.5, high | `w3W:p4` | public docs, `docs/operations.md`, `CONTRIBUTING.md` | applied |
| agent-docs | Claude Opus 5.5, high | `w3W:p5` | `AGENTS.md`, `.agents/` except rounds | applied |
| docs-arch | GPT-6.1-Sol, high | `w3W:p6` | `ARCHITECTURE.md`, `docs/stellar-docs.md`, ADRs, `src/` comments | applied |
| structure | GPT-6.1-Sol, high | `w3W:p7` | `package.json`, CI, `.gitignore`, `scripts/` | applied |
| records | GPT-6-Astra, high | `w3W:p8` | `.agents/rounds/`, `research/`, `ideas/`, `eval/qa/reviewed/` | applied |
| eval | GPT-6-Astra, high | `w3W:p9` | `eval/` | applied |
| tests | GPT-6-Astra, high | `w3W:pA` | `test/` | applied |
| privacy | Grok 4.7, high | `w3W:pB` | report only | audit complete |
| memory and orchestration | Claude Opus 5.5 | `w3W:p3` | memories, ledger, Git | applied |
| review: product and docs | Claude Fable 5.1, high | `w3W:pJ` | report only | ready after fixes |
| review: assumption attack | Grok 4.7, high (new session) | `w3W:pB` | report only | ready after fixes |

The orchestrator created and owns panes `w3W:p4`–`w3W:pB` and `w3W:pJ`. `AGENTS.md` routed hard
analysis to Sol and routine work to Terra; the installed Codex catalog offers GPT-6-Astra (frontier)
and GPT-6.1-Sol (workhorse), as in the 2026-09-30 skill system audit. Astra took the three largest
analysis lanes. Both reviewers differ from every author and from the orchestrator. Fable is the
matched tier for documentation; Grok is the vendor-diverse attack tier. The Grok reviewer ran in a
new session after the privacy lane, which made no edits, exited.

## Ledger

- Base `origin/main` `6dd94394`. Worktree clean before the branch.
- Base gates: `npm run typecheck` 0; `npm test` 122 files, 2,195 passed, 4 skipped;
  `npm run test:smoke` 5 files, 94 passed; `npm run build` 0; `npm run secrets:scan -- --tree`
  clean; `git status --short` empty after the build.

### Audit phase

All eight lane reports and the memory report were complete. No tracked file changed.

- docs-public: 32 findings. `THIRD-PARTY-NOTICES.md` names a missing `public/` folder and omits the
  embedded IBM Plex fonts. `README.md` and `LICENSE` name different copyright holders. About 60% of
  `README.md` is operator material. No contributor guide exists.
- agent-docs: 41 findings. Model routing names tiers that the installed Codex catalog no longer
  uses. `NEXT.md` duplicates five `TODO.md` items. Three skills state wrong facts.
- docs-arch: 37 findings. `ARCHITECTURE.md` misstates search selection, output footers, artifact
  ownership, and the skill read deadline. Proposed outline: about 405 lines plus three focused
  references.
- structure: 11 findings. No dead script or unused dependency was proven. The refresh workflow has
  no fork skip. `package.json` has no `engines` field and uses two undeclared tools.
- records: 752 tracked records classified: 337 keep, 19 consolidate, 396 delete (61,640 lines).
- eval: 15 findings. Four QA scripts serve only a completed experiment. 82 of the 623 retained
  `raven-next` files have no current reader. `eval/vectorize/` is a closed NO-SHIP experiment.
- tests: 9 findings. No broad deletion is justified. Two manual live scripts use removed interfaces.
- privacy: no live secret in the tree or reachable history. A second history rewrite stays declined.
  Secret scanning, push protection, private reporting, and Dependabot alerts are on.
- memory: 10 Claude memories and several Codex entries hold stale facts.

### Decisions

Owner answers (2026-09-30): apply the full retention proposal; retire `eval/vectorize/`; the
copyright holder is Stellar Development Foundation; delete about 286 MB of ignored local outputs in
the main checkout. The coordinator decided the doc layout (`docs/`, root `CONTRIBUTING.md`), the
`NEXT.md` merge into `TODO.md`, role-tier model routing with `.agents/model-roster.md`, tag-pinned
GitHub Actions, and the deferred items (a browser page test and an inventory diff script).

### Apply phase

Seven lanes applied the decisions to disjoint paths; the privacy lane made no edits. One follow-up
round relayed cross-lane requests (mostly comment pointers to the new docs and the removed
`PLAN §N` sections).

- Records: pass 1 deleted 396 history-only records; pass 2 deleted 202 more (57,799 lines) that lost
  their last live reference after the other lanes repointed comments and docs. Retained records that
  cite a deleted file now use commit-pinned links at `6dd94394` (one rule for links, backticked paths,
  and plain paths; decided after review finding F12). The Connectors Directory ledger was deleted: its own 2026-08-28 owner disposition moved
  that work outside the repository.
- `program-log.md` moved to `eval/qa/reviewed/2026-08-27-golden-truth/program-log.md`, byte-identical,
  so golden citations still resolve by name.
- Eval: `eval/vectorize/`, four completed-experiment QA scripts, and 82 unused prior-art authoring
  files were deleted. The compiled golden file stayed byte-identical.
- Tests: the three Vectorize experiment suites were deleted; the discovery assertions moved to
  `test/eval-discovery.test.mjs`. The four skipped RWA controls now always run against a test-local
  catalog: one passes and three are `it.fails` tripwires for the known routing defect.
- Docs: `README.md` 153 → 78 lines; `ARCHITECTURE.md` 941 → 397 lines; new `CONTRIBUTING.md`,
  `docs/operations.md`, `docs/stellar-docs.md` (with the complete Algolia guardrails),
  `src/catalog/README.md`, `src/skills/README.md`, `test/README.md`, and `.agents/model-roster.md`.
  `NEXT.md` merged into `TODO.md`.
- Structure: Node 24 in `engines` and `.nvmrc`; `esbuild` and `miniflare` declared; the
  `mcp:surface` launcher uses a private temporary folder; the refresh workflow skips cleanly on
  unconfigured forks; `actionlint` passes with ShellCheck.
- Source changes are comment-only; an esbuild comparison showed identical JavaScript for every
  changed TypeScript file.

### Review, merge, and fixes

- Checkpoint `5f0dcb1a`; every CI-equivalent gate passed on it.
- Independent review at `5f0dcb1a`: Grok 4.7 high returned "ready after fixes" with four findings
  (G1–G4); Claude Fable 5.1 high returned "ready after fixes" with sixteen (F1–F16). Both found
  every `AGENTS.md` hard rule and the Algolia guardrails intact, and no unplanned loss of test
  coverage (Fable compared all test names: 97 removed names are the planned Vectorize suites, two
  duplicates, and renamed or rewritten tests).
- `origin/main` moved during the round (#185–#189). Merge commit `49e04c16` kept this branch's
  structure; the owning lanes ported `main`'s `NEXT.md`, `TODO.md`, roster, and
  `ecosystem-skills/README.md` changes in follow-up round 2.
- Follow-up round 2 (`878cfea3`) fixed the findings. The largest fixes: the refresh workflow fails on
  this repository when a required secret is missing (F1, G1); the eval guides became current how-to
  guides, with 13 cited dated sections moved verbatim to `eval/qa/reviewed/2026-09-30-*-guide-records.md`
  and 49 uncited sections deleted (F4, G2); records passes restored 10 records that live artifacts
  still cite (F2, F5, pass 3).
- Decisions without change: F16 (synthetic gitleaks fixtures; the repository scanner passes); N2
  (three data-file strings point one link away from moved guide text; `eval/gates.json` and the
  register take part in hash checks); N3 (two end-of-file blank lines that came from `main`).
- Verification at `878cfea3`: Grok "ready" (G1–G4 resolved, no new finding); Fable "ready" (15 of
  16 resolved or decided, F11 closed by this section; no new medium or high finding; N1 fixed).

### Local and memory changes (outside the repository)

- Main checkout: deleted 293 MB of ignored outputs with owner approval — `dist/`, the skill cache,
  `usage/report-site/dist/`, 547 routing outputs that no tracked text in `6dd94394` or `e9b62871`
  names, and three raw August gauntlet JSON files behind tracked summaries. Kept `.wrangler/`, QA
  results, the 62 cited routing outputs, and `eval/local-lanes/`.
- Claude project memories: 16 stale files rewritten or merged; index at 29 entries. Codex: one ad-hoc
  correction note. Owner question still open: the pre-purge history bundles were not found.

## Outcome

Done. The branch deletes 705 files (589 history-only round, research, and reviewed-eval records, 82
unused prior-art authoring files, the Vectorize experiment, and completed-experiment scripts) and
leaves 1,823 tracked files. Current docs were rewritten against the code: `README.md` 78 lines,
`ARCHITECTURE.md` 397, `eval/README.md` 101, `eval/qa/README.md` 449. Runtime behavior is unchanged:
`src/` edits are comment-only and no generated artifact changed, so no deploy is needed.

Final gates on the merged tree: `secrets:scan --tree`, `typecheck`, `npm test` (122 files, 2,155
passed, 3 expected failures), `test:smoke` (94), all builds, the generated-artifact diff,
`check-pin-review`, `eval:selftest`, `eval:qa:lint -- --stale --enforce-floors`,
`eval:qa:register -- --check`, `improvements:lint`, `eval:routing -- --gate`, `actionlint`, and
`git diff --check origin/main` — all exit 0.

Owner follow-ups (answered 2026-10-01): no Dependabot security-update pull requests; npm audit
findings go to one deterministic issue instead (PR #191); the pre-purge
history bundles were deleted by the owner, so pre-purge history is not recoverable; the global Codex
Solo memory file was deleted. The banner's generator was only inferred from its original file name,
so the docs now state no generator. The "OpenAI Sites" name was inferred the same way (from
`usage/report-site/.openai/hosting.json`) and was removed for the same reason.
