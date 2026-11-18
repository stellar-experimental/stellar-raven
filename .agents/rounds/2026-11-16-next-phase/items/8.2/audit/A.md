# Item 8.2 audit, set A: root docs and `docs/`

Auditor: Claude Sonnet 5.5, read-only. Branch `np/8.2-docs-audit` at `e0ad27d9`. Files covered:
`AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `ARCHITECTURE.md`, `PLAN.md`, `SECURITY.md`,
`THIRD-PARTY-NOTICES.md`, `docs/operations.md`, `docs/stellar-docs.md`, the PR template, both issue
templates, `research/decisions/*.md` (links and index only), and the comment at
`test/helpers/mcp-tool-metadata.ts:28-29`. No model call, no `wrangler dev`, no case file opened.

Findings are ordered by confidence of harm to a reader. `FROZEN` means the file is on the COMMON.md
frozen list and the lead defers the edit until run 2.2c has merged.

## Accuracy: the doc is wrong against the code

| id | file:line | class | doc says | evidence | proposed fix | conf |
|---|---|---|---|---|---|---|
| A-01 | `AGENTS.md:26` **FROZEN** | accuracy | "`CLAUDE.md` imports this file; do not duplicate rules there." | `ls CLAUDE.md` finds no such file. Commit `88659e30` ("Move owner delegations into AGENTS.md; drop CLAUDE.md") deleted it: "Claude Code reads AGENTS.md natively; a CLAUDE.md anywhere on the path stops it from doing so." `AGENTS.md` is now the only agent instruction file, and `.claude/settings.json` holds only the case-search hook. | Replace the sentence with: "Claude Code reads this file natively. Do not add a `CLAUDE.md`: one on the path stops it from doing so." | high |
| A-02 | `AGENTS.md:205` **FROZEN** | accuracy | "use `git grep` with the exclusion pathspec that `eval/qa/README.md` ("Held-out split") prints" | The pathspec is printed under `### Searching without reading case text` (`eval/qa/README.md:293-295`), a sibling `###` section after "Held-out split" and its "Maintenance exception". The "Held-out split" section holds no pathspec. The three `.ignore` files and `scripts/agent-hooks/case-search-guard.mjs` also point at "Held-out split" for the same layout, and the hook header cites a third name, "Searching without reading case text". | In `AGENTS.md`, cite the heading that has the text: `eval/qa/README.md` ("Searching without reading case text"). Keep the `Held-out split` and `Maintenance exception` headings as they are (frozen). The `.ignore` files and the hook message still say "Held-out split"; that section carries the rule's reason, so either point is defensible. Decide once and make all five places agree. | high |
| A-03 | `ARCHITECTURE.md:69` | accuracy | "The project does not use a Wrangler static-assets directory." | `wrangler.jsonc:7-9` has `"assets": { "directory": "./public" }`, and `public/` holds `_headers`, the logo SVGs and `listing/*.png`. `public/_headers:1`: "Static brand and listing images. The Worker serves every path without a file here." | Replace the sentence with: "Static brand and listing images in `public/` are served as Wrangler static assets before the Worker runs; `public/_headers` sets their cache, nosniff, and CSP headers. Every other path reaches the Worker." Keep "Generated fonts and the Open Graph image form part of the Worker bundle." | high |
| A-04 | `ARCHITECTURE.md:367` | accuracy | MCP `search` "Default 5 hits; maximum 50." | `src/mcp/tools.ts:55` `SEARCH_DEFAULT_LIMIT = 7`, with the comment "The public page is seven cards"; `searchLimitSchema` (`:60-67`) says "default 7, max 50"; `test/server.test.ts:820` pins `toBe(7)`. Commit `986ffbaa` (#447, "seven cards") changed it. The Playground default of 5 (`src/demo/tools.ts:166`) and its maximum of 6 (line 356 of the doc) are right. `codemode.search` default 10 and maximum 50 are right (`src/catalog/search.ts:191-192`). | "Default 7 hits; maximum 50. `codemode.search` defaults to 10." | high |
| A-05 | `docs/operations.md:20-21` | accuracy | Wrangler "stores credentials per directory in `~/.wrangler`" | Wrangler 4.164.0 keeps named profiles and directory bindings in the global Cloudflare config directory, not `~/.wrangler`: `node_modules/wrangler/wrangler-dist/cli.js:135836` `DIRECTORY_BINDINGS_FILE = "profiles/directory-bindings.json"`, resolved through `getCfConfigPath()` (`appName: "cloudflare"`, XDG config dir; `~/.config/cloudflare/` on this host). `~/.wrangler` does not exist here. The `auth list` and `auth activate <name> [dir]` commands are correct (`npx wrangler auth --help`). | "It stores each profile, and the directory each profile is bound to, in its global config directory, not in the repository, so bind the profile once per clone:" | medium (path is platform-dependent; the claim of `~/.wrangler` is wrong) |
| A-06 | `docs/operations.md:69-80` (Scheduled workflows table and the `REFRESH_ISSUE_ASSIGNEE` sentence) | accuracy | Lists three workflows (`refresh.yml`, `dependency-audit.yml`, `usage-health.yml`); says `REFRESH_ISSUE_ASSIGNEE` assigns "the drift, refresh-failure, and dependency issues". | `.github/workflows/golden-sentinels.yml` exists: daily `17 7 * * *`, also on a push to `eval/qa/source-sentinels.{json,mjs}`, keeps one open issue labeled `golden-sentinels`, and assigns it from `REFRESH_ISSUE_ASSIGNEE` (line 37). The table's lead sentence "Automated findings go to GitHub issues" is true but the table omits this workflow. | Add a row: `golden-sentinels.yml` / "Daily, and on each change to `eval/qa/source-sentinels.*` on `main`" / "One open issue labeled `golden-sentinels` for primary-source drift on a golden case. It needs no secret. The drift only queues a re-verification; it is never evidence by itself." Change line 80 to "...the drift, refresh-failure, dependency-audit, and golden-sentinels issues." | high |
| A-07 | `README.md:74` | accuracy | `npm test  # unit and contract tests (offline)` | `.github/workflows/ci.yml:62-70` ("NETWORK NOTE"): on a cold checkout `npm test` fetches the pinned skill files from `raw.githubusercontent.com` (`test/skills.test.ts`, `test/search.test.ts`, `test/executor-providers.test.ts` via `test/helpers/skill-source.ts`). `test/README.md` says the same: "A cold cache can require GitHub downloads." | `npm test            # unit and contract tests (no service credentials; a cold skill cache downloads pinned files from GitHub)` | high |
| A-08 | `README.md:85` and `AGENTS.md:15` | accuracy / term | README: PLAN.md answers "What is in scope, and which decisions are open?" | `PLAN.md:3-5` says the work queue `.agents/TODO.md` "holds outstanding work and open owner decisions"; PLAN has no open-decision list. `AGENTS.md:20` agrees with PLAN. | README row: "What is in scope, and what is built?" | high |
| A-09 | `SECURITY.md:28` and `SECURITY.md:32-35` | accuracy / term | In scope: "any retired hostname that still routes to it". Out of scope upstream: "Lumenloop, Stellar Light/Scout, and Stellar Docs". | README:36-38 says the two `stellar.buzz` hosts "remain supported" for MCP and OAuth; `ARCHITECTURE.md:23` calls them "aliases"; `wrangler.jsonc:73-76` says they "retain MCP and OAuth flows for existing clients". They are live, not retired. The fourth upstream, stellar.org (`stellarOrg.*`, README:20-22), is missing from the out-of-scope list. | "...the gateway at `raven.stellar.org` and its alias hostnames `raven.stellar.buzz` and `agents.stellar.buzz`." and "...Lumenloop, Stellar Light/Scout, Stellar Docs, and the stellar.org site." | high |
| A-10 | `CONTRIBUTING.md:45` (Checks table, usage row) | accuracy | `usage/` gate is `npm run test:usage-report`. | `ci.yml:44-46` runs three usage gates: `npm run build:usage`, `npm run test:usage-report`, `npm run build:usage-report`. Also in CI and not in the table: the pinned gitleaks suite (`ci.yml:47-58`), and `node eval/qa/lint-corpus.mjs --live-contract ... --since` (`ci.yml:93-97`), which fires for a change to `eval/qa/corpus/live/live-cases.json`. | Usage row: "`npm run build:usage`, `npm run test:usage-report`, `npm run build:usage-report`". Add to the `eval/` row: the frozen live contract lint, with the command line from `ci.yml`. | medium (the table says "the matching one", so a partial list misleads) |
| A-11 | `docs/operations.md:116` vs `src/site.ts:1145-1147` | accuracy / ownership | Operations table: Workers Logs, traces, request metadata live "at most 7 days". | The Terms page (`src/site.ts:1144-1147`) tells users: "observability data, which may include the queries submitted and the responses returned, for 30 days". `src/auth/retention.ts:5-8` says the Terms state the outer bound and disclosures of practice must match. The two numbers describe different things (platform practice vs promised bound) but the table does not say so, and `/terms` also says queries may be logged while operations.md:90-92 says the logs hold no queries. | Add one row note: "The Terms promise 30 days as the outer bound; Cloudflare's current Workers Logs window is 7 days." Resolve the query-text claim (operations.md says none; Terms says "may include"). Owner decision whether the Terms or operations.md changes. | medium |
| A-12 | `PLAN.md:53-55` | accuracy | "Source acceptance, paid evaluation, deployment, and upstream issue closure are separate decisions ([ADR-0008])." | `research/decisions/0008-human-review-eval-and-playground-policy.md` covers warning cleanup, canonical-page conflicts, repository-level recovery, the five-track QA schema and Playground scope. `rg -n -i "deploy|paid|closure"` finds no statement of this rule. The rule lives in `AGENTS.md` ("A paid method needs its own written authorization", "Owner delegations") and `.agents/skills/improvements-pipeline/SKILL.md`. | Cite `AGENTS.md#spend-and-evidence` and `AGENTS.md#owner-delegations-lead-session-only` instead of ADR-0008, or drop the ADR link. | medium |

## Stale history, dated state, or unowned open items

| id | file:line | class | issue | proposed fix | conf |
|---|---|---|---|---|---|
| A-14 | `ARCHITECTURE.md:79` | stale-history | "`BASE_SERVER_INSTRUCTIONS` is one complete contract and is the whole served instructions string; the per-family source map is gone." and "(2,048 before v2.1.296)". The source-map sentence narrates a removal (#447); the same sentence is in `src/mcp/tools.ts:179-181` ("the per-family source map that used to follow it is gone", code comment, other set). | Delete "; the per-family source map is gone". Drop "(2,048 before v2.1.296)": `test/helpers/mcp-tool-metadata.ts:26-27` owns that history. | high |
| A-15 | `ARCHITECTURE.md:79` | duplication | Client cut limits (Claude Code 4,096, Grok 2,033, OpenCode 117, Codex 200/230/201) are stated in `ARCHITECTURE.md:79`, `test/helpers/mcp-tool-metadata.ts:22-50`, `test/mcp-instructions.test.ts:1-12`, `.agents/TODO.md:145-170` and the research audit. Five homes for numbers that change with client releases. | In `ARCHITECTURE.md` keep the rule the code enforces ("tests hold the instructions string and each description to 2,033 characters, the smallest measured client cut, and the first line of each stands alone") and cite `test/helpers/mcp-tool-metadata.ts` as the owner of the per-client figures and sources. Remove the per-client numbers. | medium |
| A-16 | `ARCHITECTURE.md:30-36` | stale-history | The migration paragraph ("A grant issued before audience binding...", "An access token issued before audience binding... stays usable on all three origins until it expires... lasts at most one access-token lifetime") describes a one-time transition from PR #484. The access-token exception ends one hour after the deploy that carries #484; the grant sentence ends after the 90-day refresh window. The link label "item 7.3 PR 4 design record" names a round item. | After the deploy of #484 plus 90 days, delete both sentences. Until then, relabel the link to "OAuth per-origin design record" and add a TODO item with the removal date, so the sentence has an owner. Check first whether #484 is deployed (`git log origin/main` shows it merged; I did not read deploy state). | medium |
| A-17 | `ARCHITECTURE.md:240` | stale-history | "[The design note](.agents/rounds/2026-10-10-weekend/answer-style/design.md) records which instruction sentences these signals replace." This describes a replaced state. The link target exists, and a living doc may link a record, but the sentence is history narration. | "[The design note](...) records the design of these signals." | low |
| A-18 | `THIRD-PARTY-NOTICES.md:30-31` | orphan (open item with no owner) | "Whether the forwarded metadata and source URLs satisfy each upstream license is an open question for counsel." `rg -i "counsel|licen[sc]e" .agents/TODO.md` finds no item. An open owner decision lives in `.agents/TODO.md` (AGENTS.md map). OpenZeppelin skills are AGPL-3.0-only (table row), which raises the stakes. | File a TODO item "Counsel review of skill forwarding against upstream licenses" and keep a one-line pointer here, or reword the sentence to a fact: "Raven has not had counsel confirm that...". | medium |
| A-19 | `docs/operations.md:109` | stale-history (version-pinned) | "a registration made under oauth-provider 1.x renews for another 365 days when a token request arrives in its second half". The installed provider is 1.2.4 (`node_modules/@cloudflare/workers-oauth-provider/package.json`; renewal code at `oauth-provider.js:4685`). The "1.x" qualifier marks a version boundary that no longer separates anything in production. | "Registrations renew for another 365 days when a token request arrives in the second half, so one in use does not expire" and say what happens to a registration made before the renewal existed only if such registrations still exist (not verified). | low |

## Duplication and ownership

| id | where | class | detail | proposed fix | conf |
|---|---|---|---|---|---|
| A-20 | `README.md:41-43` vs `docs/operations.md:105-108`, `src/auth/retention.ts` | duplication | README states token lifetimes (1 hour, 90 days); `docs/operations.md` "Data retention" owns the table ("`src/auth/retention.ts` holds every retention duration") and `ARCHITECTURE.md:322` says operations owns it. Three homes. | README keeps the user-facing sentence but links the table: "...for 90 days (see [Data retention](./docs/operations.md#data-retention))". | low |
| A-21 | `AGENTS.md:71-73` vs `.agents/model-roster.md:25-36` | duplication | AGENTS.md names the eval and test model set and the "Run here, on `hc`, first" rule; the roster restates both (table and "Run on `hc` agents first" bullet). AGENTS.md:55-56 already says the roster owns IDs and launch lines. | Keep the rule in AGENTS.md; remove the repeated bullet from the roster, or point it at AGENTS.md. (Roster is outside set A.) | low |
| A-22 | `AGENTS.md:40`, `CONTRIBUTING.md:35`, `README.md:70-76`, `test/README.md` | duplication | Baseline gate list (typecheck, test, build, secrets scan) and "run each command bare" appear in four places. | Leave the AGENTS and CONTRIBUTING copies (different audiences). Make README "Test" say "The baseline gates are listed in CONTRIBUTING.md" and keep only the four commands with one-line gloss. Low value; skip unless the lead wants fewer homes. | low |
| A-23 | `docs/stellar-docs.md:63-66` vs `ARCHITECTURE.md:335` | duplication | The 24 s `OPERATION_BUDGET_MS` budget and its clipping rules are stated in both. They agree today. | `ARCHITECTURE.md` already links `src/adapters/types.ts`; leave. Noted for completeness. | low |

## Organization and terms

| id | file:line | class | issue | proposed fix | conf |
|---|---|---|---|---|---|
| A-24 | `AGENTS.md:13-23` (source-of-truth map) | organization | The map omits docs an agent needs by name elsewhere in AGENTS.md: `docs/stellar-docs.md` (Hard rules cite it), `eval/EVALS.md` and `eval/qa/README.md` (spend rules and held-out rule), `improvements/README.md`, `usage/README.md` (line 24 sends the reader there for private folders), `test/README.md`, `scripts/README.md`. | Add rows: "Eval instruments, gates, denominators / `eval/EVALS.md`", "Stellar Docs adapter contract and credentials / `docs/stellar-docs.md`", "Usage collection and private folders / `usage/README.md`", "Generated files and script ownership / `scripts/README.md`". **FROZEN** (AGENTS.md). | medium |
| A-25 | `README.md:81-91` (Documentation table) | organization | Omits `docs/stellar-docs.md`, `eval/EVALS.md`, `test/README.md` (linked in the body only), `improvements/README.md`, `ecosystem-skills/README.md`. | Add `eval/EVALS.md` ("How are answers measured?") and `ecosystem-skills/README.md` ("How are skill pins reviewed?"); `test/README.md` is already linked at line 78. | low |
| A-26 | `ARCHITECTURE.md:325` ("Shared by demo and MCP") and `:339` ("Playground-only") | term | "demo" and "Playground" name the same surface in adjacent headings (`src/demo/` is the code path; `DEMO_AI_GATEWAY_ID` the variable). Everywhere else the doc says Playground. | Heading: "Shared by the Playground and MCP". | low |
| A-27 | `ARCHITECTURE.md:18-91` | organization | `## 1. A search call, end to end` also holds request routing, OAuth, public site, Playground and MCP handler detail, so the OAuth design (about 40 lines) sits under the search heading. | Rename section 1 "Requests, authorization, and `search`", or split routes and auth into their own section. Renumbering would break the `#7-operating-limits-and-caps` and `#9-observability` anchors that `docs/operations.md` links, so rename without renumbering. | low |

## Test comment (`test/helpers/mcp-tool-metadata.ts:28-29`)

Current text, lines 28-29: "...Re-verify this figure / whenever a Claude Code version changes (.agents/TODO.md)."

`.agents/TODO.md:145` (heading "Re-verify each external client limit before changing model-facing text") and lines 164-166
state the trigger: "before a change to the server instructions or the tool descriptions, and when a client's release
notes name an MCP text limit. A client version bump alone does not fire it." The comment contradicts the TODO.

Proposed replacement for the two lines (keep the rest of the block):

```ts
// A user's CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH can change both limits. Re-verify this figure
// before a change to the server instructions or a tool description, and when Claude Code release
// notes name an MCP text limit; a version bump alone does not fire it (.agents/TODO.md, "Re-verify
// each external client limit before changing model-facing text"). The local tests count JavaScript
// characters.
```

The same file's Grok, OpenCode and Codex comments name no re-verify trigger. Confidence: high.

## AGENTS-RULE: rules that may no longer be needed (all FROZEN: `AGENTS.md`)

I found no rule that the code or tools make false or redundant. Candidates, with the evidence for each:

| id | rule | verdict | evidence |
|---|---|---|---|
| A-28 | `AGENTS.md:119` "Re-run `npm test` outside the Codex sandbox before trusting a red suite: it denies `ps`." | cannot verify; keep unless the lead can show it | `rg` finds no `ps` call in `test/`, `scripts/` or `eval/` (only a fixture string `ps aux | grep node` in `test/case-search-guard.test.mjs:212`). Some dependency (vitest or workerd) may call it. The rule might be stale, or true through a dependency. Ask the owner or reproduce under Codex; do not delete on this evidence. | low |
| A-29 | `AGENTS.md:208-209` Solo rule | keep | Solo references remain outside records: `eval/skills-cases.json`, `eval/build-question-overlay.json`, `eval/plan/coverage-rules.json`, `scripts/build-catalog.mjs`, `scripts/improvements-file-issue.mjs`, `ideas/*.md`, `ecosystem-skills/PIN-REVIEW.md`. The rule still guards new references. | n/a |
| A-30 | `AGENTS.md:40` "Run a gate command bare." duplicates `CONTRIBUTING.md:35` | keep both | See A-22; different audiences. | n/a |

## Cross-set pointers (not my files; for the lead to route)

- `scripts/build-catalog.mjs:619` ("see CLAUDE.md's research-lane rule") and `eval/plan/build-op-classes.mjs:24`
  ("CLAUDE.md: generated artifacts are rebuilt") cite a deleted file. The rule now lives in `AGENTS.md` "Hard rules".
- `src/mcp/tools.ts:179-181` code comment narrates the removed source map (same history as A-14).
- `src/auth/gate.ts:55-58` and `src/auth/redirects.ts:3-4` cite "DESIGN.md D1/D2 of the oauth-provider 1.x round";
  the file exists under `.agents/rounds/.../7.3/pr4-oauth/`, so a living comment points at a round record.
- `scripts/agent-hooks/case-search-guard.mjs:3-4` cites `eval/qa/README.md` "Searching without reading case text"; the
  `.ignore` files and `AGENTS.md` cite "Held-out split". See A-02.
- `research/prior-art.md:389` cites `ADR-0006`, which no longer exists (deleted 2026-10-01 per
  `.agents/rounds/2026-10-01-audit-verification.md:59`).
- `scripts/refresh-inventory.mjs:7` says "Plain Node 20+"; `package.json` engines is `>=24 <25`.

## ADR index and citations (links and index only)

Files: `0001`, `0002`, `0003`, `0004`, `0005`, `0007`, `0008`, `0009`, `0010`, `0011`. There is no
`0006` and no index file in `research/decisions/`.

| ADR | cited by living docs | note |
|---|---|---|
| 0001 | `PLAN.md`, `ARCHITECTURE.md:288`, `src/mcp/tools.ts`, `src/executor/run.ts` | correct number and topic |
| 0002 | `scripts/build-catalog.mjs:388`, `src/catalog/types.ts:216` | superseded in part by 0003; cited only from code comments |
| 0003 | `AGENTS.md:179`, `PLAN.md`, `ARCHITECTURE.md:392`, `.agents/skills/live-drift-resolution/SKILL.md`, scripts | correct |
| 0004 | **nothing** outside round records (`rg` finds it only in `.agents/rounds/**`) | orphan. `ARCHITECTURE.md:201` states the behavior it decided ("Artifact metadata intentionally includes `requestId` and `rayId`") without citing it. If 0004 is still the governing decision, cite it at `ARCHITECTURE.md` section 9; if it is superseded, its status line should say so (not my edit). |
| 0005 | `PLAN.md`, `ecosystem-skills/README.md`, `src/catalog/README.md`, `src/skills/README.md` | correct |
| 0006 | `research/prior-art.md:389` only | file deleted; the citation dangles |
| 0007 | `PLAN.md`, `ARCHITECTURE.md:111`, `src/catalog/README.md` | correct |
| 0008 | `PLAN.md:55` (wrong claim, see A-12), `AGENTS.md`-owned skills, `eval/qa/README.md`, `.agents/TODO.md` | PLAN citation does not match the ADR |
| 0009 | `eval/discovery/README.md:75` only | not cited in `ARCHITECTURE.md` section 2 (scoring), where "stays lexical" is the governing rule. Add: "[ADR-0009](research/decisions/0009-discovery-stays-lexical.md) records why discovery stays lexical." |
| 0010 | `ecosystem-skills/README.md:135` | fine |
| 0011 | `.agents/TODO.md:78,81` only | `PLAN.md` Scope and `ARCHITECTURE.md` intro state the two-tool surface and cite only 0001. Add 0011 beside 0001 in the `PLAN.md` Scope paragraph. |

Organization (low): add a one-page `research/decisions/README.md` index (number, title, status) so a reader sees that
0006 is intentionally absent and which ADRs a living doc owes a citation. ADR text stays untouched.

## Checked and correct

AGENTS.md
- Map rows resolve: `PLAN.md`, `ARCHITECTURE.md`, `README.md`, `docs/operations.md`, `.agents/skills/<name>/SKILL.md` (all eight skill folders have `SKILL.md`), `.agents/TODO.md`, `.agents/rounds/`, `.agents/README.md`, `research/`. `.claude/skills` is a symlink to `../.agents/skills`.
- `prepare` script sets `core.hooksPath scripts/git-hooks`; `scripts/git-hooks/pre-commit` exists.
- Baseline commands and script names (`typecheck`, `test`, `build`, `test:smoke`, `typegen`, `dev`, `dev:eval`, `secrets:scan -- --tree`) all exist in `package.json`; `vitest.config.ts:20` excludes `test/smoke/**`.
- `.dev.vars` placeholder note matches `ci.yml:30-35`.
- `hc ls`, `hc read`, `hc send`, `hc wait --children any|all`, `hc run --bg --name` exist (`hc --help`, `hc wait --help`).
- `wrangler kv bulk get` takes at most 100 keys (wrangler source `cli.js:98312`); `--remote` is a valid flag family.
- Three `.ignore` files exist and match `eval/qa/README.md:300-307`; the hook is wired in `.claude/settings.json` for `Bash|Grep`.
- Hard-rule function names: `assertNoNonExposedRefsInText` (`scripts/emitted-text-guard.mjs:55`), `assertNoNonExposedRefs` (`scripts/build-catalog.mjs:1261`, called at `:1379`), `npm test` guard, and the `prebuild` path (`build-family-text.mjs:91`).
- `globalOutbound: null` (`src/executor/run.ts:427,694`); `scout.matchPartners` is absent from both docs and manifest; `ADR-0003` exists.
- Model roster: Sonnet 5.5, GPT-6.1 Terra, Grok 4.7, Opus 5.5, GPT-6.1 Sol, exclusion of Haiku and GPT-6 Luna match `.agents/model-roster.md`.
- `usage/README.md:143-152` names the private folders.

README.md
- Hosts and routes (`raven.stellar.org`, alias redirect behavior, `/docs`, `/playground`, `/terms`, `/health`); token lifetimes 1 hour and 90 days match `src/auth/retention.ts`.
- Run locally steps 1-4: `.nvmrc` is 24; `.dev.vars` variable names match `ci.yml:35`; loopback hosts match `src/auth/gate.ts` (`LOOPBACK_HOSTNAMES` + `::1`); `typegen` script; default port 8787; `.env` read by `scripts/refresh-inventory.mjs`; `.dev.vars` and `.env` are gitignored; `env.d.ts` is gitignored.
- stellar.org drops `/blog`, `/press`, `/events` (`src/adapters/stellar-org.ts:45`); `mint_dsc_` prefix matches `docs/stellar-docs.md`.
- License line matches `LICENSE:190`.

CONTRIBUTING.md
- Every command in the Checks table exists; `check-pin-review.mjs --base` matches `ci.yml`; `eval:routing -- --gate`, `eval:selftest`, `eval:qa:lint -- --stale --enforce-floors`, `eval:qa:register -- --check`, `improvements:lint`, `test:usage-report` all match. The issue form name matches `.github/ISSUE_TEMPLATE/upstream-improvement-ready.yml`. `?template=upstream-improvement-handoff.md` matches the file name.

ARCHITECTURE.md
- Route handling order, alias list, `308`, per-origin providers at module scope and per-request providers on loopback, `providerEnv` copy, API-key then dev-bypass then OAuth order, `404` for other origins (`src/server.ts`, `src/hosts.ts`).
- Redirect allowlist `https:`, loopback `http:`, `claude:`, `cursor:`, `warp:`; `allowPrivateUseRedirectUris: true`; registration tolerance; authorization checks at three sites (`src/auth/workos.ts:275,482,521`); `redirect_refused:<scheme>`; `onError` logs `oauth_error` (`src/auth/gate.ts:109`).
- `createMcpHandler` from `agents/mcp/server`, fresh `McpServer` per request; `@cloudflare/codemode` 0.5.6 pin; `DynamicWorkerExecutor`; `buildSandbox`, `createExecuteRunner`, `prepareCatalogSearch`, `searchCatalogPage`, `candidateEvidenceSection`, `resultCaveat`, `RUNNERS`, `authSubjectFromProps`, `resolveArtifactOwner` all exist.
- `asOf` path precedence (`src/executor/providers.ts:297-302`); `exactRows`; Scout partial-read rules (`src/adapters/scout.ts:22-26`); `errorName` enum (`script-hints.ts:38`); status buckets (`run.ts:76`).
- Section 7 constants: 60 s (`run.ts:353`), 24 s, 20 s / 8 s / 30 s skills, 6,000 and 1,000-32,000 token budget, 100 log lines and 2,000 chars, 1,600 and 64 footer limits, 30 chats per hour, 384 KiB, 20 messages and 24,000 chars, 8,000 chars, 120 s turn, 7 steps, 4,096 output tokens, 3 + 3 calls, 5 default and 6 maximum Playground hits, 220 and 400 characters, 2 MiB artifact, 8,192-byte metadata, 12 ledger calls, 180-character operation names, 8 info and 4 read calls, `Retry-After: 3600`, `dev-local` and `dev-loopback` owners.
- Client-cut figures agree with `test/helpers/mcp-tool-metadata.ts` (4,096, 2,033, 117, 200); `SEARCH_OPENING_MAX_CHARS = 117`; `SEARCH_OPENING`, `FAMILY_LINE`, `BASE_SERVER_INSTRUCTIONS`, `UPSTREAM_DOC_LINKS` and the four service globals in `EXECUTE_DESCRIPTION`.
- Every markdown link and backticked repo path in the six root docs and two `docs/` files resolves (scripted check; no missing file or anchor). ADR links `0001`, `0003`, `0007` exist.
- `ci.yml` description (gate order, smoke lane offline, artifact sync gate) and `refresh.yml` description.

PLAN.md
- Build table and layout rows resolve; one runnable skill (`RUNNERS` has one entry, `skills.lumenloop.stellar-ecosystem-digest`); ADR-0001, 0003, 0005, 0007 citations are correct. "Not built" matches the `AGENTS.md` hard rule.

SECURITY.md
- `frontier@stellar.org` matches `src/site.ts:1156`; private vulnerability reporting is enabled (`gh api .../private-vulnerability-reporting` returns `{"enabled":true}`); `globalOutbound: null`; the issue-template config link matches the repository URL.

THIRD-PARTY-NOTICES.md
- Source ids match `ecosystem-skills/MANIFEST.json` (`lumenloop`, `openzeppelin-stellar`, `stellar-dev`, `stellar-light`, `trustless-work`); per-source `license_files` lists; vendored files and their `0.4.2` headers (`src/catalog/vendor/*.ts`); `scrubNonExposedRefs` in `src/skills/scrub.ts:287`; `src/fonts.ts`, `src/og.ts`, `scripts/gen-og.mjs`, `scripts/gen-site-fonts.mjs`, `ecosystem-skills/catalog.json`, `eval/corpus/PROVENANCE.md`, `assets/repo/banner.png`, `test/skill-content-not-vendored.test.ts` exist. Upstream license names in the table are not checkable offline.

docs/operations.md
- `predeploy` preflight and `DEPLOY_ALLOW_UNCLEAN=1`; `postdeploy` checks the tail consumer and the `17 3 * * *` cleanup schedule and skips without a credential; `wrangler auth list|activate` exist in 4.164.0.
- `mcp-key` actions, `--out` with mode `0600` and `wx`, name pattern `[a-z][a-z0-9-]{0,31}`, KV writes to `OAUTH_KV --remote`.
- `/health` and `/health/skills` (503 on failure or never ran; `src/skills/canary.ts:185-209`); cron `7 * * * *`.
- Workflow schedules, labels `drift`, `refresh-failure`, `dependency-audit`; no workflow opens a PR; no Dependabot config; `usage-health` opens no issue.
- Retention table matches `src/auth/retention.ts` (1 h, 90 d, 365 d, 10 min, 2 h, 2 h, 7 d, 13 months) and the `client-assertion-jti:` prefix; `deriveSubject` and `ownerHash` formulas (`src/auth/workos.ts:437`, `src/artifacts/store.ts:103`, 16 hex characters); `subject_hash` column and `length = 16` check in `usage/migrations/0001_usage.sql`; `demo-throttle:<subject>:<hour>` key; `grant:` and `token:` KV prefixes in the provider; AI Gateway payload collection off (`src/demo/model-config.ts:193-208`).

docs/stellar-docs.md
- Backend block (`apiBase`, `searchPath`, `pagePath`, `siteOrigin`, `candidateWindow` 50, `attemptTimeoutsMs` `[8000, 12000]`); 12 operations and every include/exclude scope in the operations table; `hitsPerPage` 1-20 default 5; `SNIPPET_CHARS` 300; `MAX_ERROR_BODY_CHARS` 1,024; `MIN_ATTEMPT_MS` 500; `OPERATION_BUDGET_MS` 24,000; the anchor fixture holds 11 distinct pages; `refresh.yml` runs `npm run docs:anchors:build`; `MINTLIFY_ASSISTANT_API_KEY` is the spec's `apiKeyEnv`.

Templates
- Finding-id examples, `improvements/resolved.json`, `fixed-upstream` status and the handoff template name match `scripts/improvements-file-issue.mjs:27,260` and `scripts/improvements-lint.mjs`.

Recent-change coverage (the brief's list): `@cloudflare/codemode` 0.5.6, `agents` 0.33 with `agents/mcp/server`, `@modelcontextprotocol/server` 2.4, `wrangler` 4.164, `@cloudflare/vitest-plugin`, `workers-oauth-provider` 1.2.4 per-origin providers and native-callback allowlist, `vitest` 5, the case-search hook and `.ignore` files, and `scout.matchPartners` removal are all either correctly reflected or not mentioned in my files. No doc in set A names `vitest-pool-workers`, `matchPartners` or a stale dependency version. The only dated version claim is the vendored-code `0.4.2` note, which is accurate.

## Not verified

- Upstream license names in `THIRD-PARTY-NOTICES.md` (needs the upstream repos).
- That #484 is deployed (A-16 depends on it).
- Whether the Codex sandbox denies `ps` (A-28).
- The platform-specific Wrangler profile path (A-05); the verified fact is only that it is not `~/.wrangler`.
