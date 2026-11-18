# Item 8.2 audit, set D: folder guides

Auditor: Claude Sonnet 5.5, read-only. Branch `np/8.2-docs-audit` at `e0ad27d9`. No file was edited
except this one. `npm run improvements:lint`, `node ecosystem-skills/build-index.mjs`,
`node scripts/improvements-index.mjs`, `node scripts/check-pin-review.mjs --base origin/main` and
`node scripts/check-mirrors.mjs` all ran. `git status --short` and `git diff --stat` stayed clean
afterwards (no tracked file changed, nothing to restore).

Summary: 24 findings. Most guides are accurate. The weak spots are the `scripts/README.md`
generated-output table (incomplete), the `test/README.md` coverage table (41 test files unmapped, one
scope claim wrong), `ecosystem-skills/PIN-REVIEW.md` (heading levels, order and one stale status),
and the `plugins/openai/` set (dated status in living files, procedure inside records, stale counts in
an unsent draft). Nothing in set D is `FROZEN`; one proposal touches `.agents/TODO.md`, marked below.

## Findings

| id | file:line | class | what the doc says | evidence | proposed fix | conf |
|---|---|---|---|---|---|---|
| D-01 | `scripts/README.md:30` | accuracy | The `node eval/qa/compile-qa.mjs` row lists `cases.json`, `sample.json`, `lifecycle-registry.json`. | `eval/qa/compile-qa.mjs:336-339` also writes `TOOL_CASES_PATH` (`eval/qa/tool-cases.json`), and the CI sync guard (`.github/workflows/ci.yml`, "generated artifacts in sync") diffs `eval/qa/tool-cases.json`. The generated-output table is the list `AGENTS.md` and `CONTRIBUTING.md:46` send agents to. | Replace the Output cell with ``eval/qa/cases.json`, `eval/qa/sample.json`, `eval/qa/tool-cases.json`, `eval/qa/lifecycle-registry.json` ``. | high |
| D-02 | `scripts/README.md:16-33` | ownership | The table is titled "Generated-output entrypoints" and `AGENTS.md`/`CONTRIBUTING.md:46` say it lists every generated file. | It omits `inventory/*.json` (`scripts/refresh-inventory.mjs`, rewritten by `refresh.yml` daily; owner: `inventory/README.md`), and `ecosystem-skills/MANIFEST.json`, `catalog.json`, `community.json` (`ecosystem-skills/update.sh`; owner: `ecosystem-skills/README.md`). `ecosystem-skills/INDEX.md` is listed, its sibling outputs are not. Both groups are "never hand-edited, rebuilt by a script". | Add two rows: ``| `node scripts/refresh-inventory.mjs` | `inventory/*.json` | no (daily `refresh.yml` reports drift) |`` and ``| `ecosystem-skills/update.sh` | `ecosystem-skills/MANIFEST.json`, `catalog.json`, `community.json`, `INDEX.md` | no (CI never runs it; `check-mirrors.mjs` and `check-pin-review.mjs` gate the result) |``. Mark the `INDEX.md` row's guard as the `build-index.mjs` regeneration only. | medium |
| D-03 | `scripts/README.md:53` | accuracy | "Declarations exist for `build-catalog.mjs`, `exposure.mjs`, `emitted-text-guard.mjs`, and `lib/skill-mirror.mjs`." | `scripts/build-family-text.d.mts` also exists, and `test/mcp-instructions.test.ts:15` imports `build-family-text.mjs` across the TypeScript boundary. Five declarations, not four. | Add `build-family-text.mjs` to the list. | high |
| D-04 | `test/README.md:8` | accuracy | `npm test` scope is "`test/*.test.ts` and `test/*.test.mjs`". | `npx vitest list --filesOnly` also lists `research/audits/2026-11-06-playground-final-resolution/blind-packets.test.mjs`. `vitest.config.ts:20` excludes only `node_modules`, `.claude`, `tmp`, `test/smoke`, `usage/report-site/test`. The file is tracked and runs in `npm test` and CI. | Either state the extra file ("plus one audit packet test under `research/audits/`"), or (preferred) move it under `test/` or add `research/**` to the exclude. The second option is a **code-defect**: a dated record folder should not hold a test that gates CI. Lead decides; fix text only if the file stays. | high |
| D-05 | `test/README.md:29-49` | organization | The "Test group" table maps test files to coverage areas. | 41 of 178 `test/*.test.{ts,mjs}` files match no row (script in scratchpad, patterns taken from the table). Includes areas added since the table was written: `case-search-guard`, `case-search-ignore`, `case-text-scan` (#478), `oauth-origins` (#484), `corroboration-*` (5 files), `hosts`, `per-source-status`, `stellar-org-*` (3), `stellar-docs-anchor*` (2), `stellar-community`, `heldout-read`, `source-sentinels`, `gate-evidence`, `gateway-judge`, `description-notes`, `diff-inventory`, `refresh-anchor-workflow`, `replay-*` (3), `script-hints`, `title-keywords`, `tuning-*-scan` (2), `step2-roles-scan`, `split-amend`, `claim-read-packets`, `code-scanning-regressions`, `diagnostic-rejudge-source`, `exact-evidence`, `identifier-token`, `protocol-history-report`, `run-routing-manifest-evidence`, `runner-error-text`, `argument-aliases`. | Add rows, for example: ``| `case-search-*`, `case-text-scan*`, `heldout-read*`, `source-sentinels*` | Case-text guards: the agent search hook, the `.ignore` layout, held-out reads |``; ``| `oauth-origins*`, `hosts*` | Per-origin OAuth providers, native-callback allowlist, host routing |``; ``| `corroboration-*` | Corroboration rubric, guard, build, and scan |``; ``| `stellar-org-*`, `stellar-docs-anchor*`, `stellar-community*`, `per-source-status*` | Adapter guards, anchors, community snapshot, per-source status |``; and add `description-notes*`, `diff-inventory*`, `refresh-anchor-workflow*`, `gate-evidence*`, `gateway-judge*`, `replay-*`, `tuning-*`, `title-keywords*` to the nearest existing row. Alternative: state "The table names groups, not every file" and keep it short; but then say what guards new areas. | high |
| D-06 | `test/README.md:19-22` and `:16` | accuracy | Smoke lane "blocks unexpected outbound Worker requests". | `test/smoke/vitest.config.ts` `outboundService` blocks all but pinned skill-file URLs, which it serves from the local map. README line 19 covers the cache but line 16 reads as an absolute wall. Minor. Also the README never names the runner (`@cloudflare/vitest-plugin`, #483) while the config comment does. | Optional: "The smoke configuration runs under `@cloudflare/vitest-plugin`; its outbound wall serves only pinned skill files locally and refuses every other request." | low |
| D-07 | `ecosystem-skills/README.md:66-67` vs `:73` | term | "Every source is public, and the re-pin uses no credential" and then "`update.sh` needs an authenticated `gh` CLI". | `ecosystem-skills/update.sh:48` "Requires: gh (authenticated), jq, node, curl, git. No API keys." and uses `gh api`. The two sentences use "credential" differently. | Line 66-67: "Every source is public, and the re-pin needs no Raven or service credential (only your own `gh` login)." | medium |
| D-08 | `ecosystem-skills/README.md:77-79` | accuracy | Commands `./update.sh` and `node build-index.mjs` are shown without a working directory. | `AGENTS.md`, `CI`, `update.sh` header and `PIN-REVIEW.md:38` all run `./ecosystem-skills/update.sh` and `node ecosystem-skills/build-index.mjs` from the repo root. `build-index.mjs:42` resolves its own directory, so both forms work. | Use root-relative forms (`./ecosystem-skills/update.sh`, `node ecosystem-skills/build-index.mjs`) as `PIN-REVIEW.md` and `ci.yml` do. | medium |
| D-09 | `ecosystem-skills/PIN-REVIEW.md:45-621` | organization | `## Entries` holds the ledger. | Headings are inconsistent: entries 2026-11-16 to 2026-09-16 are `###` under `## Entries`, entries 2026-09-30 to 2026-11-06 are `##` (peers of "Entries"). Order is also mixed: the first four are newest-first (11-16, 11-09, 11-06, 11-03), then 09-29, 07-30 and the rest oldest-first; the 2026-11-02, 11-05 and 11-06 (assets) entries sit at the bottom. `rg -n "^### \|^## "` shows it. A reader looking for the newest pin entry reads the wrong end. CI (`check-pin-review.mjs`) only needs a `sel:` token in the diff, so a reorder is safe. | Make all entries `###` under `## Entries`, newest first. Do it as a pure move (no text change) so the ledger stays a record. Optional; the lead may defer. | medium |
| D-10 | `ecosystem-skills/PIN-REVIEW.md:622` | stale-history | The 2026-11-05 `stellar-light` row says "author read; independent review pending". | The same entry ends (line 644) "Independent review: `.agents/rounds/2026-11-05-truth-maintenance/drift-review.md` (ACCEPT)". Reviewed-column and prose disagree. | Change the cell to "author read; independent review accepted (see below)". It is a ledger correction, not a rewrite of a reviewed attestation, but flag it to the lead because `PIN-REVIEW.md` entries are attestations. | medium |
| D-11 | `ecosystem-skills/PIN-REVIEW.md:3-6` | stale-history | "…so a re-pin commit shows only hash changes — the text itself never appears in `git diff` the way it did when the bodies were checked in." | The living header carries history ("when the bodies were checked in"; same pattern at `:8-9` "replacement gate", `:28-29` "re-create the vendored copy"). `README.md` states the present design without the history. | "Skill bodies are prompt input. They are not vendored, so a re-pin commit shows only hash changes. This ledger is the review gate." Drop the "way it did" clause. | low |
| D-12 | `plugins/openai/README.md:7-10`, `:34-37` | stale-history | "**Status.** The last recorded portal state (October 23, 2026) is version `0.1.2`, in review and not published." and "Publication choices, confirmed by the owner on October 7, 2026". | Dated status in a living guide. The same state is owned by `RESUBMISSION.md` (record) and `.agents/TODO.md` "OpenAI plugin submission" (`FROZEN` file). Three places carry the portal state. | Replace the Status paragraph with: "Portal state and the open work are in [the work queue](../../.agents/TODO.md) under "OpenAI plugin submission"; the last recorded state is in [RESUBMISSION.md](RESUBMISSION.md). Check the portal before you act." Keep the October 7 owner choices but link them to `VERIFICATION.md` instead of a date. | medium |
| D-13 | `plugins/openai/README.md:13-20` | organization | The table is headed "Record" and lists all six files as records, including `RESUBMISSION.md` ("the reviewer-access procedure"). | Classification of every file in `plugins/openai/`: README.md = **living guide** (rules, package, build, open requirements). `domain-verification/README.md` = **living guide** (deploy, validation). `RESUBMISSION.md` = **dated record** (self-declared "Historical record", 2026-10-23) but lines 79-110 ("Account preparation", "Portal update", "Draft secure sign-in instructions") are live procedure inside a record. `VERIFICATION.md` = **dated record** (2026-10-07, self-declared; one dated 11-06 recheck). `MCP-FINDINGS.md` = **dated record** (2026-10-23 scan; ends with a live "Next action"). `EXCEPTION-REQUEST.md` = **dated record and unsent draft** (self-declared). `REVIEW-CASES-2026-10-23.md` = **dated record**. `review-evidence-2026-10-23.json` = **dated record**. `stellar-raven/plugin.json`, `mcp.json` = the living package. | Add a "Kind" column to the README table (record or draft) so a reader and an agent know none of them is an instruction. Move the three procedure sections of `RESUBMISSION.md` into the README "Review materials" section (reviewer-access procedure already half-lives there at `:73-76`), leaving `RESUBMISSION.md` a pure record. | medium |
| D-14 | `plugins/openai/README.md:73-76` vs `RESUBMISSION.md:21-24,79-87` | duplication | Reviewer access: README says reviewers use a dedicated OAuth sign-in and the portal stores the credentials; `RESUBMISSION.md` states the same plus the checks. | Two owners of one procedure (name both: `README.md` "Review materials" and `RESUBMISSION.md` "Account preparation"/"Portal update"). | Resolved by D-13: one home (README), record keeps only what happened on 10-23. | medium |
| D-15 | `plugins/openai/README.md:51-58`, `VERIFICATION.md:165` ("Policy observation"), `.agents/TODO.md` "OpenAI plugin submission" | duplication | The 30-day versus 7-day retention discrepancy is described in all three. README links to the record anchor `VERIFICATION.md#policy-observation` as if it were the live statement. | Facts verified: `src/site.ts:1146` says queries and responses are stored "for 30 days"; `docs/operations.md:115-116` says Workers Logs, traces and request metadata are "at most 7 days". The discrepancy still holds. A living doc should own the open item, the record only the dated check. | Keep the live statement in the README (already there), drop the "(policy observation)" link or label it "recorded check". Leave the `TODO.md` copy for the lead (`FROZEN` until 2.2c merges). | low |
| D-16 | `plugins/openai/README.md:50-52` | stale-history | "The earlier OpenAI audit named OAuth resource and scope checks for review." | No link or record names that audit; the bullet narrates history without a pointer. | Link the source (`VERIFICATION.md` section "OAuth and automated findings" or the audit record) or reword: "OAuth resource and scope checks may be reviewed." | low |
| D-17 | `plugins/openai/EXCEPTION-REQUEST.md:48` and `MCP-FINDINGS.md:36-39` | accuracy | The follow-up text to send says "a fixed catalog with 60 service operations and 20 skill entries". `MCP-FINDINGS.md` records 18 Lumenloop, 30 Scout, 12 Docs (60). | Current `catalog/manifest.json` (generated 2026-11-17): 18 Lumenloop, 29 Scout (`scout.matchPartners` removed, #467), 12 stellarDocs, 2 stellarOrg = **61 operations**; 20 skill entries. The draft is unsent and says "Refresh ... catalog details before sending", but the quoted counts are now wrong in the send-ready paragraph. | Replace the count sentence with a placeholder and an instruction: "Its two tools use a fixed catalog of `<operations>` service operations and `<skills>` skill entries (read both from `catalog/manifest.json` when sending)." `MCP-FINDINGS.md` is a dated snapshot and already says so; leave it. | high |
| D-18 | `plugins/openai/EXCEPTION-REQUEST.md:58` | accuracy | Signs the unsent message "Thank you, Tyler". | Cosmetic and a personal name in a repo doc; also the message speaks for the owner. Not a fact claim. | Replace with "Thank you, `<owner>`" or the SDF contact. Low priority. | low |
| D-19 | `plugins/openai/domain-verification/README.md:27-30` | stale-history | "The last recorded run (2026-11-06, Node 24.22.0, after a toolchain refresh) passed with zero audit findings; it deployed nothing and says nothing about the current portal or route state." | A dated run result in a living guide. The recheck cannot be trusted next month. | Delete the sentence; keep the command list and "The compiled Worker contains only the fixed-response handler." If a run record is wanted, it belongs in the round ledger. | medium |
| D-20 | `plugins/openai/domain-verification/README.md:22-24` | duplication | Names deployment version `27edfddf-…` and route ID `8376ade1…`. | The same IDs are in `VERIFICATION.md` ("Domain verification service"). Two copies of dated facts. | Drop the IDs here and keep "the verification notes record the first deployment". | low |
| D-21 | `assets/brand/README.md:39` | accuracy | Files table row ``../../public/raven-icon.svg` / `raven-icon-512.png` `` reads as if both files are in `public/`. | `ls`: `public/` holds `raven-icon.svg` only; `raven-icon-512.png` is in `assets/brand/`. `plugins/openai/stellar-raven/assets/raven-icon-512.png` is a third copy. | Split into two rows: ``| `../../public/raven-icon.svg` | … |`` and ``| `raven-icon-512.png` | … |``. | high |
| D-22 | `assets/brand/listing.md:53-54` | accuracy | "It does not record the search totals or the `scfAsOf` date range that the frames also show." | `research/listing-carousel-evidence-2026-10-07.md:66,69,74` records the `scfAsOf` field in the projection and `meta.counts.total` = 43 Lending projects, 33 awarded. The sentence is at least partly wrong. I did not open the carousel PNGs to compare the frames. | Reword to what is actually missing after comparing the frames, or delete the sentence and keep "The frames quote live values. Check them against the evidence file before a new submission." | low |
| D-23 | `assets/brand/listing.md` (last paragraphs and line 4) | stale-history | "Verification used Python 3.9.6 and zlib 1.2.12. Pillow 12.3.0 and fontTools 4.67.0 also gave identical files on 2026-10-15." and "The files date from 2026-10-07." | Dated verification narration in a doc titled "design record", which is allowed to carry dates; but the rebuild section is a procedure. | Keep (it is labelled a design record). Optionally move the 2026-10-15 sentence to the evidence record. | low |
| D-24 | `src/catalog/README.md:3-8` | accuracy | "[load.ts] validates it once per Worker isolate. [types.ts] defines its schema and file-pin constraints. Entry IDs are globally unique; operation terminal names are unique within each service." | `src/catalog/load.ts` only caches `loadManifest` from `search.ts`; the uniqueness rules are enforced in `src/catalog/search.ts:232-300` (`superRefine`: duplicate id, terminal-name uniqueness, legal JS identifier), the file-pin shape in `types.ts:91-96`. | "[load.ts](load.ts) caches the validated manifest once per Worker isolate; `loadManifest` in [search.ts](search.ts) validates it. [types.ts](types.ts) defines the schema and file-pin constraints; `search.ts` enforces globally unique entry IDs and per-service unique terminal names." | medium |

## Other observations (not table rows)

- `improvements/README.md:100-118` ("Upstream filing channels") duplicates the routing rules that
  `improvements/intake.json` (`services.*`) owns and `improvements-lint` enforces. Both are kept in
  sync by hand, and `improvements/intake.json` is the machine owner. Suggest a single line: "The
  repository for each collection is set in `improvements/intake.json`; the lines below are
  orientation." Low priority, class `duplication`, confidence medium. The `sd-059 → stellar-docs#2995`
  example is correct (`sd-059` evidence line 13).
- `usage/README.md:40-43` states the 13-month retention in prose; `src/auth/retention.ts:53`
  (`USAGE_RETENTION_MONTHS`), `docs/operations.md:115` and `src/site.ts:1148` also state it. The README
  already defers other periods to the operations guide. Consider "see `docs/operations.md#data-retention`
  for the period" and keep only the mechanism here. `duplication`, low.
- `inventory/README.md:18-19`: "reads `LUMENLOOP_API_KEY` and `MINTLIFY_ASSISTANT_API_KEY` from `.env`".
  `scripts/refresh-inventory.mjs:74` merges `.env` with `process.env` (CI supplies them as env). Add
  "or the environment". Also the script header (`:7`) says "Plain Node 20+" while the README says Node
  24; a code-comment drift, **code-defect** (trivial). `accuracy`, low.
- `usage/README.md:55`: "uses the account in this directory's config" — "this directory" is `usage/`;
  say `usage/wrangler.jsonc`. `term`, low.
- No finding for #472, #482, #483, #484, #485 and #467 in set D: none of these files names
  `@cloudflare/vitest-pool-workers`, `agents/mcp/server`, per-origin OAuth providers, or
  `scout.matchPartners`. (The pool is named only in `.agents/TODO.md:1120`, frozen and out of set.)
  `scripts/README.md:8` already documents the case-search hook (#478).
- `ecosystem-skills/README.md` and `src/skills/README.md` split ownership cleanly ("pin-update and
  review procedures" in the first, read and run behavior in the second); no overlap found.

## Generated files: sync

- `npm run improvements:lint`: `improvements lint ok (93 findings)`. `improvements/INDEX.md` header
  says 93; `node scripts/improvements-index.mjs` rewrote it with no diff. **In sync.**
- `node ecosystem-skills/build-index.mjs`: `INDEX.md written: 21 categorized, 0 uncategorized.` No
  diff. **In sync.** Skill counts in its source table (8/3/8/1/1) match `MANIFEST.json`.
- `node scripts/check-pin-review.mjs --base origin/main`: "no skill pin or file selection moved";
  `--digests` output matches the three `sel:` values in the newest entry
  (`66a21fa7d3e1`, `5e7b81b76438`, `e9a0fe5ef280`). `node scripts/check-mirrors.mjs`: `mirror checks ok`.

## Checked and correct

**scripts/README.md.** Every command in the table exists in `package.json` or on disk
(`family-text:build`, `spec:build`, `site:globes`, `site:fonts`, `site:og`, `docs:anchors:build`,
`eval:routing:overlap`, `improvements:index`, the three `node` entry points, `eval/plan/build-op-classes.mjs`).
Outputs match the scripts: `build-family-text.mjs:27-28` (`src/mcp/family-text.ts`,
`src/policy/corroboration.ts`), `gen-globes.mjs` (`src/demo/globe.ts`, `src/consent-globe.ts`),
`build-super-spec.mjs:67`. CI guards match `ci.yml` "generated artifacts in sync": catalog, family-text,
spec, globes, `ecosystem-skills/INDEX.md`, golden compile, routing, QA, op-classes. Overlap guard is
`npm test` (`test/routing-qa-overlap.test.mjs:42`); improvements index guard is
`improvements-lint.mjs:239-242`. `docs:anchors:build` is run by `refresh.yml:159`. `site:fonts` and
`site:og` write directly and are not in CI. `writeFileAtomic` use matches (catalog, family-text, spec,
globes, build-index, qa/routing/op-classes compilers, overlap, improvements writes); the golden
`compile.mjs` and the two operator generators use `writeFileSync`. `scripts/agent-hooks/case-search-guard.mjs`
and `.claude/settings.json` (PreToolUse `Bash|Grep`) exist. `run-mcp-surface.mjs` builds into a temp dir,
forwards `process.argv`, removes the directory in `finally`.

**improvements/README.md.** Collections `lumenloop`, `stellar-light-scout`, `stellar-docs`, `skills`,
`workers-ai-provider`, `canonical-source` exist; statuses equal `ALLOWED_STATUSES`; `declined-upstream`
requires `disposition` (lint `:84-89`); `upstreamTitle` rule; `generated-by-stellar-raven` marker and
`raven` label (`improvements-file-issue.mjs:28,172`); the **Upstream improvement ready for verification**
issue form (`.github/ISSUE_TEMPLATE/upstream-improvement-ready.yml`); `intake.json` `canonical-source`
is `mixed` with a per-finding repo; `improvements:file -- --file … --dry-run`; `MINTLIFY_ADMIN_API_KEY`
is documented in `docs/stellar-docs.md`; `docs/stellar-docs.md`, `eval/EVALS.md` exist; all local links
and anchors resolve.

**usage/README.md and usage/report-site/README.md.** Collector is a Tail Worker with no `fetch` handler
(`src/usage/collector.ts:154-160` has `tail` and `scheduled` only); three attempts per write (`:94`);
daily cron `17 3 * * *` (`usage/wrangler.jsonc`); `USAGE_RETENTION_MONTHS` imported from
`src/auth/retention.ts` (value 13); `tail_consumers: [{ service: "stellar-raven-usage" }]` in
`wrangler.jsonc:93`; migrations 0001-0003 and the snapshot table with `expires_at_ms`; the cleanup
deletes expired snapshots (`collector.ts:160`); report Worker requires bearer `REPORT_TOKEN`, serves
only `/report` and `/launch`, sets `Cache-Control: no-store`, returns 404 for a missing or expired
snapshot (`worker.js`); `usage-report.mjs` flags `--from`, `--to` (exclusive), `--local`,
`WRANGLER_PROFILE`; combined rows use the `'all'` surface with `COUNT(DISTINCT … subject_hash)`;
credential order in `check-usage-deployment.mjs`; `usage-health.yml` skips with a notice when
`USAGE_REPORT_TOKEN` is unset; `ci.yml` runs `build:usage`, `test:usage-report`, `build:usage-report`;
`check-private-usage.mjs` runs from `scan-secrets.mjs` (pre-commit and CI `--tree`);
`docs/operations.md#deploy` exists; report-site scripts `test`, `check`, `build`; `env.example` and
`.openai/hosting.json` exist. The README names the two private folders, says the repo works without
them, and no script, test or workflow reads them (`rg` for `aux-priv` finds only the README line).

**inventory/README.md.** `LUMENLOOP_PARTNER_TOOLS` is the 3-name list in `refresh-inventory.mjs:44`;
`inventory/lumenloop.json` has 21 tools (18 guest, 3 `partner_stub`), 14 skills, `me.tools.available` 21,
33 OpenAPI operations over 31 paths, `changelogCursor` and `openapiVersion`; `stellar-light.json` has
`changelogLatest`, `openapiVersion`, `operationCount`, `status`; the other three files have the stated
keys; `refresh.yml` is daily (`17 6 * * *`), uses `RAVEN_SERVICE_URL` and `REFRESH_ISSUE_ASSIGNEE`, and
the fork skip logic matches (`:64-74`); `docs/operations.md#scheduled-workflows` exists; `.nvmrc` is 24;
`specs/stellar-docs.json` and `specs/stellar-org.json` exist.

**test/README.md.** Commands exist; `vitest.config.ts` excludes smoke, report-site tests and
`.claude/**`, `tmp/**`; `test/smoke/vitest.config.ts` uses `@cloudflare/vitest-plugin` `cloudflareTest`,
`remoteBindings: false`, fakes for the three secrets, and an `outboundService` wall; the three
`it.fails.each` controls are in `test/drift-141-routing.test.ts:188`; every glob in the Test group table
matches at least one file; `test/live/run-live-execute.mjs` and `run-live-spec-search.mjs` take
`--base-url`; `fixtures/`, `helpers/`, `stubs/` exist; all links resolve.

**src/catalog/README.md.** `search.ts` default limit 10 (`DEFAULT_SEARCH_LIMIT`), MCP default 7
(`src/mcp/tools.ts:55`), max 50 (`search.ts:192`, `tools.ts:65`); `Number.isFinite` default
(`search.ts:1245`); field weights 12/10/8/5/2 and multipliers (`vendor/search-scoring.ts:35-40,80`);
coverage gate 1.0 for at most two tokens and 0.6 otherwise (`:133`); section weight 0.75 and keyword blend
0.4 (`scoring.ts:114,238`); `ACRONYM_FORM_LIMIT` 32; diversity quota `max(2, ceil(0.4 * limit))`
(`scoring.ts:560`); 1.6 interleave margin (`search.ts:201`); `preserveStrongBackfill`,
`preserveIntentWithinServiceQuota`, `rejectsRoutingIntent`, `tier: "gated" | "backfill"`;
`COMPACT_OUTPUT_THRESHOLD` 2000; `deriveWiderCandidates(…, 3, …)`; `searchable: false` for sections
(`types.ts:203-208`); the vendor header names `@cloudflare/codemode@0.4.2` while the package is 0.5.6,
which the README correctly describes as independent. ADR-0003, 0005, 0007 files exist.

**src/skills/README.md.** `FETCH_TIMEOUT_MS` 8000 and one retry (`source.ts:57,126`);
`SKILL_READ_DEADLINE_MS` 20 s (`:64`); `RUNNER_DEADLINE_MS` 30 s (`run.ts:53`); executor 60 s
(`executor/run.ts:353`); memo/cache/upstream retrieval names (`source.ts:50`); digest runner defaults and
ranges (`stellar-ecosystem-digest.ts:144-151,235-237`); `assertRunnersWired` in `runners/index.ts`;
`skills.lumenloop.stellar-ecosystem-digest` is in the manifest; `/health/skills` and the hourly canary
cron (`wrangler.jsonc:104`, `canary.ts:37`); `check-mirrors.mjs --fetch`.

**ecosystem-skills/README.md.** Layout files all exist; `sources.json` modes `all/root/pick` and pick
lists match; source skill counts (8, 3, 8, 1, 1 = 21) match `MANIFEST.json` and `INDEX.md`;
`license_files` include `NOTICE` for OpenZeppelin only; `RETIRED_ONBOARDING_SKILLS`,
`RETIRED_PARTNER_ONBOARDING_SKILLS` (`scripts/exposure.mjs:94-96`) and `assertRetirementNamesResolve`
(`build-catalog.mjs:484,1305`); `check-skills-drift.mjs [--json]` with exit 1 on drift (2 on error);
`stellar-community.mjs <out>` and the `ECOSYSTEM_CARDS` reader; `refresh.yml` runs the drift check and
never `update.sh`; `research/skill-exposure-inventory.json`, `THIRD-PARTY-NOTICES.md`, the Trustless
Work round ledger and ADR-0010 exist; `eval/skills-cases.json` has `retiredCases`; `eval/gates.json`
exists. `PIN-REVIEW.md` header rules match `check-pin-review.mjs` flags `--base` and `--digests`;
`scripts/diff-pins.mjs` exists.

**plugins/openai.** `plugin.json` has 5 positive and 3 negative cases, subtitle 26 characters, starter
prompts 68/95/65 characters, `demo_recording_url` equal to the README link, version `0.1.2`,
`publication.countries: []`; the operations named in the cases (`stellarDocs.search_soroban_contract_docs`,
`scout.searchProjects` with a `type` input, `lumenloop.get_scf_submissions`, `scout.getStablecoins`)
exist in the manifest; `mcp.json` URL `https://raven.stellar.org/mcp`; execute annotation is
`readOnlyHint: true`, `openWorldHint: false` (`src/mcp/tools.ts:383-385`); artifact retention is 7 days
(`src/artifacts/store.ts:9`, operations table); `/terms` says 30 days (`src/site.ts:1146`) and the
operations guide says at most 7 (`docs/operations.md:115-116`); commits `65f38b83`, `aa004d7d`,
`8c0e6ee2`, `dd8724e5` exist (#234-#237); the TODO section "OpenAI plugin submission" exists; the
domain-verification route, zone `stellar.buzz`, Worker name, Node `^24.22.0` and scripts match
`cloudflare.config.ts` and `package.json`; `improvements/lumenloop/ll-013-scf-submission-award-fields.md`
and `review-evidence-2026-10-23.json` exist.

**assets.** `public/` holds `raven-icon.svg`, `raven-logo-{dark,light}.svg`, `listing/`, `_headers`,
`.assetsignore`; `wrangler.jsonc:8` serves `./public` as assets; `test/auth.test.ts:641` checks the
three files for the mark path; token hexes (`--bg #0e150d`, `--green #151f14`, `--orange #ff5500`,
`--orange-2 #ff7a33`, `--fog #eef0e2`) match `TOKENS` in `src/site.ts:75-78`; `pattern.svg` is 15,245
bytes, seed 20261007, 18 stars, minimum gap 22 (`make_pattern.py`); `tools/make_pattern.py` and
`outline_logos.py` exist; `src/og.ts` serves `/og.png`; `assets/repo/banner.png` is used by
`README.md:2`; `research/listing-carousel-evidence-2026-10-07.md` exists. All markdown links in the 17
files (local paths and heading anchors) resolve (script run over every file in the set).
