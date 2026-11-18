# Item 8.2 EXEC-1: PR 1 (root, `docs/`, ADR index)

Executor: Claude Sonnet 5.5, worktree `/home/tyler/code/raven-wt/np-8.2`, branch
`np/8.2-docs-audit` from `e0ad27d9`. Not pushed. Three commits:

| Commit | Content |
|---|---|
| `45b1bc02` | `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `ARCHITECTURE.md`, `PLAN.md`, `SECURITY.md`, `THIRD-PARTY-NOTICES.md`, `docs/operations.md` |
| `e73d4575` | new `research/decisions/README.md`; the owner's 8.2 instruction in round `DECISIONS.md` ("Follow-up answers (2026-11-18)") |
| `f0ec667e` | four code comments (comments only; no `src/`) |

This file and the rest of `items/8.2/` stay uncommitted for the lead.

## Findings

| Id | Result | How |
|---|---|---|
| A-01 / O-03 | applied (R-10 form) | `AGENTS.md`: "There is no `CLAUDE.md`; Claude Code reads this file natively." The prohibition is not added. `test -e CLAUDE.md` confirms the file is absent. |
| A-02 / O-23 | applied | `AGENTS.md` search rule now cites `eval/qa/README.md` ("Searching without reading case text"), the heading that holds the pathspec (`eval/qa/README.md:271`). The `Held-out split` heading and Maintenance exception are untouched. The hook message and three `.ignore` headers keep "Held-out split" (deferred item). |
| A-03 | applied | `ARCHITECTURE.md` public-site paragraph: `public/` is served as Wrangler static assets; `public/_headers` sets headers; fonts and the Open Graph image stay in the bundle. `wrangler.jsonc` has `assets.directory ./public`. |
| A-04 / O-04 | applied | MCP search row cites `SEARCH_DEFAULT_LIMIT` (`src/mcp/tools.ts:55`, 7) and links `src/catalog/README.md#search-interfaces` for both interfaces' defaults. No number is restated. |
| A-05 | applied | `docs/operations.md`: profiles and directory bindings live in Wrangler's global config directory (`DIRECTORY_BINDINGS_FILE = "profiles/directory-bindings.json"`, `cli.js:135836`). `~/.wrangler` does not exist on this host. The path itself is not named (platform-dependent). |
| A-06 | applied | Added the `golden-sentinels.yml` row (daily cron `17 7 * * *`, push on `eval/qa/source-sentinels.*`, label `golden-sentinels`); the assignee sentence names four issue kinds. |
| A-07 | applied | `README.md` test comment: no service credentials; a cold skill cache downloads pinned files from GitHub (`ci.yml` "NETWORK NOTE"). |
| A-08 | applied | README row: "What is in scope, and what is built?". PLAN's opening line: "what is built, and what is not built". |
| A-09 / O-27 alias host | applied | `SECURITY.md`: scope names the alias hosts `raven.stellar.buzz` and `agents.stellar.buzz`; the upstream list adds the stellar.org site. `ARCHITECTURE.md` "are aliases" becomes "are alias hosts". |
| A-10 | applied, with one omission | CONTRIBUTING usage row lists the three CI usage commands; the `eval/` row adds the live-contract lint (`--since "$(git merge-base HEAD origin/main)"`). The gitleaks suite is not a command a contributor runs: CI installs the binary and the suite self-skips without it. Not added. |
| A-11 | no edit (owner question) | `/terms` says 30 days (`src/site.ts:1144-1147`); operations says 7. Already in the TODO OpenAI item. |
| A-12 | applied | PLAN "Change rules" cites `AGENTS.md#spend-and-evidence` and `AGENTS.md#owner-delegations-lead-session-only` instead of ADR-0008. |
| A-14 / O-25 | applied | `ARCHITECTURE.md` MCP tool paragraph: removed "(2,048 before v2.1.296)", "the per-family source map is gone", and the duplicate `FAMILY_LINE` sentence (one copy remains). |
| A-15 | applied | Per-client figures (4,096; Grok; Codex 230/201; OpenCode) removed; the enforced rule stays (2,033, first line at most 200 and at most 117 characters, full stop) and `test/helpers/mcp-tool-metadata.ts` is named as owner. The 200 and 117 figures stay because tests and `SEARCH_OPENING_MAX_CHARS` enforce them. |
| A-16 / O-25 | applied (R-11 form) | "A grant with no resource binds to the origin that first refreshes it. An access token with no audience stays usable on all three origins until it expires, at most one hour." Link relabeled "OAuth per-origin design record". No "migration" framing; no deploy date needed. |
| A-17 / O-25 | applied | Deleted the "design note ... replace" sentence and its link. |
| A-18 | applied (R-07 form) | `THIRD-PARTY-NOTICES.md`: "...has not had counsel review. [The work queue](./.agents/TODO.md) tracks it." No anchor. The sentence is true only after PR 3 adds the TODO item. |
| A-19 | applied | Dropped "under oauth-provider 1.x". The provider code (`oauth-provider.js:4685`) renews a stamped registration in its second half. |
| A-20 | applied | README token-lifetime sentence links `docs/operations.md#data-retention`. |
| A-24 / O-13 | applied | `AGENTS.md` map gained six rows: `docs/stellar-docs.md`, `eval/EVALS.md`, `test/README.md`, `scripts/README.md`, `improvements/README.md`, `research/decisions/README.md`. The plan named five targets plus `docs/stellar-docs.md`; `usage/README.md` is already named in the paragraph below the map. |
| A-25 | applied | README documentation table gained `eval/EVALS.md` and `ecosystem-skills/README.md`. |
| A-26 / O-27 | applied | "Shared by the Playground and MCP". |
| A-27 / R-18 | applied | Section 1 heading text is "Requests, authorization, and `search`"; the "1." and all section numbers are unchanged. No link to the old anchor exists (`rg`). `.github/workflows/refresh.yml` and other section-number citations stay valid. |
| O-08 | applied | `research/decisions/README.md`: number, title, status, applying living doc for each ADR; 0006 "Withdrawn: Solo process ownership; deleted in #195" (added `cc08aa32`, deleted `5038da35`). New links: ADR-0004 in `ARCHITECTURE.md` section 9, ADR-0009 in section 2, ADR-0011 beside ADR-0001 in `PLAN.md`. |
| O-14 | applied | `PLAN.md` "Repository layout" dropped. `ARCHITECTURE.md` table gained service snapshots, skill pins, and `wrangler.jsonc`. |
| O-20 / R-18 | applied | `ARCHITECTURE.md` points at `specs/stellar-org.json` and `src/adapters/stellar-org.ts`; the research file is "the 2026-11-14 measurement". No new doc. |
| O-25 rows (ARCHITECTURE) | applied | Rows `:32-36`, `:79`, `:240` done (see A-14, A-16, A-17). |
| O-27 mirror/pin | applied | `ARCHITECTURE.md`: "daily pin check (`check-mirrors.mjs --fetch`)", "missing pinned skill files", "pinned-file availability". "Does not keep a durable owned mirror" and "Never mirror" stay: they mean a copy of content. |
| O-27 LumenLoop | applied | `THIRD-PARTY-NOTICES.md:97` "Lumenloop". The upstream copyright line is untouched. |
| `ARCHITECTURE.md:416` / R-16 | applied | "Catalog, spec, and family-text checks reject stale generated outputs." (`ci.yml` diffs `src/mcp/family-text.ts`.) |
| Decision 3 comments | applied | `test/helpers/mcp-tool-metadata.ts` (A's text), `scripts/build-catalog.mjs:619` and `eval/plan/build-op-classes.mjs:24` (`AGENTS.md` "Hard rules"), `scripts/refresh-inventory.mjs:7` (Node 24). No `src/` comment touched. |
| `docs/stellar-docs.md` | not touched | No PR 1 finding needed it. |
| Declined per PLAN | not applied | A-22, A-23, A-28 (kept; O-33 proposes moving it), A-29, A-30. |

## Gates

| Gate | Result |
|---|---|
| `npm run typegen` | Types written to `env.d.ts`. |
| `npm run typecheck` | Exit 0. |
| `npm test` | Exit 0: 174 files passed, 5 skipped; 4190 tests passed, 3 expected fail, 8 skipped. |
| `npm run build` | Exit 0 (prebuild family text, then Wrangler dry run). |
| `npm run secrets:scan -- --tree` | Clean. The pre-commit scan was also clean for each commit. |
| Link check (`tmp/check-links.mjs`, the brief's file list plus `research/decisions/README.md`) | 0 problems, anchors included. |
| `git diff --stat origin/main -- src public wrangler.jsonc catalog specs` | Empty. |

Not run: `test:smoke` (no `src/executor` or `src/demo` change), `improvements:lint`, any eval, QA lint,
`wrangler dev` or deploy.

## Deviations and notes for the lead

- The plan allows `AGENTS.md` accuracy and map fixes only. The six map rows and the two sentence
  fixes are all that changed there. No rule moved or was cut.
- ADR-0011's text says "five compact cards per search"; the code now returns seven
  (`SEARCH_DEFAULT_LIMIT`). The ADR is a record and was not changed. The index points readers at the
  living docs.
- `THIRD-PARTY-NOTICES.md` says the work queue "tracks" the counsel review before the TODO item
  exists. The sentence becomes true when PR 3 lands; if PR 3 slips, the lead should hold PR 1 or
  reword.
- A-04: the MCP row in `ARCHITECTURE.md` no longer states the default number. A reader needs
  `src/catalog/README.md` for it.
- The brief says `PLAN.md` ("Correction to the frozen list") and `RECONCILE.md` override `COMMON.md`;
  nothing in PR 1 needed the corrected frozen list beyond the `AGENTS.md` accuracy rule above.
- The lead still has to commit `items/8.2/` (PLAN, REVIEW, RECONCILE, EXPOSURE, audit, briefs, this
  file).
