# raven-next — 2026-09-30

Lead agent `raven-next` (Claude Fable 5.1, pane `w3W:p2`). Base `origin/main` `6dd94394`.
Production: Worker Version `9f5a4151-8fa6-41d9-a68d-776052d6ddd5`, deployed 2026-09-30T20:46:29Z.

## Scope

Task 1: survey the service and the repo with live read-only probes. Rank what is worth doing next.
Task 2: land the clear, simple improvements. Each one passes its gates and an independent Herdr
review. Then it goes through a PR, CI, a squash merge, and a deploy. Production verification and
a receipt here close it.

Some actions need the owner's approval first. They are upstream filing or comments, paid
evaluation, exposure or policy changes, Algolia writes, and any `NEXT.md` owner decision. Any
destructive git action also needs it.

## Survey evidence (2026-09-30, about 20:50Z to 21:05Z)

Production and web surfaces:

- `/`, `/playground`, `/terms`, `/health`, `/health/skills`, `/og.png`, `/robots.txt`,
  `/sitemap.xml`, `/.well-known/oauth-authorization-server` → HTTP 200. `POST /mcp` without a
  token → HTTP 401. `/playground/chat` and `/register` → HTTP 405 on GET, as designed.
- `/health/skills` → `{"ok":true,"checkedAt":"2026-09-30T20:07:19.761Z","checked":64}`.
- Landing page says `60 operations`; `catalog/manifest.json` has `operation: 60, skill: 20,
  skill-section: 202`.
- `wrangler deployments status` → version `9f5a4151…` at 100% traffic, created 2026-09-30T20:46:26Z.
- `WRANGLER_PROFILE=sdf node scripts/check-usage-deployment.mjs` → tail consumer and retention
  schedule present. `check-private-usage.mjs` → file boundary passed. `check-usage-health.mjs`
  needs `USAGE_REPORT_TOKEN`, which only CI holds. The hourly workflow was green every hour today.
  These checks prove the consumer, the schedule, the file boundary, and canary freshness. They do
  not prove that the daily retention cleanup ran. That verification stays open in `TODO.md`.

MCP server and adapters, through the Raven connector:

- `search("builders directory profile count")` → `scout.getBuilders` first (gated, score 150),
  then `lumenloop.search_directory`; 31 total, truncated at 10.
- One `execute` ran four calls in parallel. `scout.getStatus` returned apiVersion `1.9.54` and
  these counts: builders 226, projects 1133, repos 13437, researchDocs 10893, sdfSkills 8.
  `scout.getBuilders` returned its no-match advisory with 226 profiles. `stellarDocs.search_docs`
  returned 3 hits. `lumenloop.search_directory` returned 2 rows. All four calls were `ok`.
  Latencies ran from 99 ms to 1105 ms.

Catalog, skills, evals, and gates on `main`:

- `node scripts/check-skills-drift.mjs` → all five sources `ok`; catalog snapshot 43 = live 43.
- `node scripts/check-mirrors.mjs --fetch` → 66 pinned files verified. `check-pin-review.mjs` → no
  pin moved.
- `npm run eval:routing -- --gate` → `GATE PASS` (baseline 2026-09-21T14:57:28Z).
- `npm run improvements:lint` → ok, 65 findings (61 reported-upstream, 3 declined-upstream, 1
  verified). `npm run improvements:probes` → 7 recurring, 0 fixed-candidate, 0 errors.
- `npm run eval:qa:lint -- --stale` → 0 errors, 62 known sourcing-guard warnings.

Upstream refs (read-only `gh api` over all 64 linked refs):

- 54 refs are open and unchanged. Seven are closed while the finding stays `reported-upstream`.
  `sd-027`: PR 2367 closed; replacement PR 2837 is still `REVIEW_REQUIRED` at head `108ba24e`.
  `sd-037`: issue 1981 closed; PR 2021 is open at head `777561b2` (the author's master merge of
  2026-09-29). A maintainer, `leighmcculloch` (`MEMBER`), approved that head at
  2026-09-29T21:44:44Z. GitHub reports `mergeable_state: blocked`. The default-branch READMEs
  still lack the SLP index, so the fix is not live. `sd-052`: see item 3. `sd-053`: PR 2789 fixed
  the predecessor; the finding tracks open issue 2602. `sls-024`, `sls-029`, `sls-033`: each
  already records the partial fix and the live residual.

CI, refresh, dependencies:

- `CI` green on `main` (20:46Z). `Refresh (live drift check)` failed 2026-09-26 to 2026-09-29 on the
  Scout `1.9.54` drift and passed 2026-09-30 after PR #182. `Usage archive health` green hourly.
- `npm audit` → 10 findings (8 high, 2 moderate). The seven findings from the 2026-09-17 audit
  remain. `@cloudflare/vitest-pool-workers` 0.22.0 is still the newest release (2026-09-18).
  Transformers 4.3.0 waits on the Vectorize migration. Three findings are new. `fast-uri` 3.1.7
  and `ip-address` 10.5.0 sit under `@modelcontextprotocol/sdk` (moderate). `npm audit fix
  --dry-run` changes exactly those two. `undici` 7.29.0 (high) is reached from
  `@ai-sdk/provider-utils` and both `miniflare` copies. 7.29.1 is patched (found by the PR B review).
- Dependabot open alerts: 7 (2 medium runtime-scope: `ip-address`, `undici`; 5 development).
- 16 direct packages are outdated. Majors: `@cloudflare/workers-oauth-provider` 0.10.3 → 1.2.1,
  `vitest` 4 → 5, `wrangler` 4.133 → 4.145 (minor), `agents` 0.20 → 0.24.

Agent tooling on this host:

- Codex `0.159.2` lists `gpt-6.1-sol` (the workhorse and the host default at high),
  `gpt-6-astra` (frontier), `gpt-6-sol`, and `gpt-6-luna`. Its descriptions call the three 5.6
  models older. Grok `1.0.44` defaults to `grok-4.7` with a 256k context. It also lists
  `grok-4.7-build-fast`, `grok-4.6`, and `grok-4.5`. Claude Code `2.1.286` accepts `fable`,
  `opus`, and `sonnet`. OpenCode is `1.18.32`.
- `research/agent-model-roster.md` was last verified 2026-08-25. Since then the Codex default
  moved from `gpt-5.6-sol` to `gpt-6.1-sol`. The Grok default moved from `grok-4.6` to
  `grok-4.7`. The Grok context figure moved from 500k to 256k. The CLI versions moved.
  `AGENTS.md` routes "Terra high" for routine work; the catalog now calls `gpt-5.6-terra` older.

Goldens (scan of `truth.reverifyBy` in `eval/qa/corpus/battery`):

| due | case |
| --- | --- |
| 2026-10-07 | `q-builder-content-by-person` |
| 2026-10-08 | `q-comp-yieldblox-oracle-incident`, `q-hist-meridian-2026-corrected-venue`, `q-hist-x402-stellar-announcement` |
| 2026-10-09 | `q-edge-closed-world-builder-directory-miss` |
| 2026-10-15 | `q-agent-payment-standard-choice`, `q-edge-strupey-ambiguous-stellar-history`, `q-pc-cross-redstone-sep40`, `q-rwa-tokenization-standards`, `q-sep-6-24-deprecation`, `q-sep53-message-signing` |
| 2026-10-20 | `q-org-sdf-enterprise-fund` |

The two 2026-10-08 register traps (YieldBlox, Meridian) must not be closed early.

## Ranked list

Each item: evidence, value, effort, label (`simple` or `needs-decision`).

1. **Record the PR #184 release receipt.** `grep 9f5a4151 .agents/ research/` finds nothing; the
   skill-system-audit ledger ends with "stay open until the PR merges and deploys". Value: the
   audit round's definition of done. Effort: 15 min. `simple`.
2. **Refresh `research/agent-model-roster.md` and the `AGENTS.md` lane names.** The defaults, the
   CLI versions, and the Grok context figure changed since 2026-08-25 (evidence above).
   `AGENTS.md` names a Terra lane; the catalog now describes that model as older. Value: correct
   reviewer selection for every future gate. Effort: 1 h. Roster facts: `simple`. Lane wording
   in `AGENTS.md`: `needs-decision`. Proposal: Astra high for hard work; Sol 6.1 high for
   routine work and bounded verification; Luna evidence-only. The owner named Sol, Astra, Grok,
   and Opus as the lanes for this session.
3. **`sd-052` is fixed upstream and live.** stellar-cli issue 2722 closed on 2026-09-29 through
   merged PR 2766. The live manual at `developers.stellar.org/docs/tools/cli/stellar-cli` now
   reads "Generate Python bindings (requires external plugin)". All five languages carry the note.
   Value: pipeline truth. Effort: 30 min to record `fixed-upstream` with dated evidence
   (`simple`). Draining it with the resolver needs a distinct reviewer and an upstream resolution
   comment. That comment is an outward write (`needs-decision`).
4. **Clear the two new moderate advisories.** `npm audit fix` changes only `fast-uri` → 3.1.8 and
   `ip-address` → 10.7.2. `undici` stays until a `miniflare` pin moves. Value: clears the two
   moderate audit findings and the `ip-address` Dependabot alert. The `undici` alert and the
   eight high findings remain until the relevant pins change. Effort: 1 h with `typecheck`,
   `test`, `build`, `test:smoke`. `simple`. Broader dependency work stays separately gated.
5. **Stale pointers in `PLAN.md` and `NEXT.md`.** `PLAN.md` §7 calls the September 14 audit "the
   latest reviewed drift". `NEXT.md` item 4 still asks to "coordinate the separately gated history
   cleanup". `TODO.md` closed that on 2026-09-17. Value: handoff accuracy. Effort: 10 min. `simple`.
6. **Skill tooling hardening from `TODO.md`.** Three items. Remove the inactive private-archive
   branches from `build-index.mjs`, with a byte-identical rebuild check. Add `owner`, `repo`, and
   `path` to the pin-review digest, with a location-only test. Build the index from staged files
   before the swap in `update.sh`. All three are reviewer-accepted deferrals with clear done
   criteria. Value: provenance and
   fail-closed refresh. Effort: 2 to 3 h. `simple`. The explicit cherry-pick mode is lower value
   (both cherry-picked sources have exclusion maps) and changes the manifest contract:
   `needs-decision`.
7. **Read the twelve Stellar Light `scf-*` skill bodies** against the four admission criteria.
   Record a per-skill verdict table for decision K. Value: unblocks K. Effort: 1.5 h. `simple`
   (the verdicts); the pin decision stays with the owner.
8. **File `sk-028` upstream.** Verified; dedupe on 2026-09-30 found only closed `sls-010`, which
   is about substring filtering, not the count. Effort: 10 min. `needs-decision` (outward write).
9. **Golden updates already queued.** `TODO.md` already directs four cases through
   `golden-truth`. They are `q-defi-x402-on-stellar-what` (board seat) and
   `q-gap-builders-person-empty` (114 → live 226 today). The other two are the dated reserve
   amounts in `q-asset-trustline-basics` and `q-asset-amm-fee-reserve`. They need source
   triangulation, an independent re-derivation, and
   the corpus gates. They need no further scheduling approval. Effort: 1 to 2 h each. `simple`
   (with the `golden-truth` gates).
9b. **Golden checks with a due date.** `q-builder-content-by-person` is due 2026-10-07 (author
   re-count) and can run now. The 2026-10-08 register traps (YieldBlox, Meridian) and the
   2026-10-08/09 cases wait for their dates. The 2026-10-15 and 2026-10-20 cases follow. Each is a
   `golden-truth` pass. `simple` when its date arrives.
10. **Dependency refresh beyond the audit fix.** In-range `npm update` moves zod 4.4 → 4.6, `ai`
    7.0.79 → 7.0.124, the `@ai-sdk/*` providers, vite, rolldown, react. The playground is the
    consumer and its only end-to-end instrument is paid. `needs-decision` (scope and whether a
    seeded `eval:playground` run is authorized). The `workers-oauth-provider` 1.x major is
    auth-critical: `needs-decision`.
11. **Community section of `skills.stellar.org`.** Snapshot beside `catalog.json` or record it as
    out of scope. `needs-decision` (scope).
12. **Vectorize Transformers runtime migration.** Needs the comparison design in `TODO.md` first.
    Effort: a day. `needs-decision`.
13. **Upstream rechecks.** PR 2837 (`sd-027`/`sd-034`) is unchanged. PR 2021 (`sd-037`) gained a
    maintainer approval on 2026-09-29. It is still `blocked` and unmerged. This PR records that in
    the `TODO.md` item. `sd-037` stays `reported-upstream` until the two README source checks show the
    fix. No reminder comment. Issue #167 stays blocked on a general intent mechanism. The
    September 17 routing and source-authority work (`NEXT.md` item 1) stays open.
14. **stellarDocs `hitsPerPage` default.** Three operations pass the value through and document
    `default: 5`, but an omitted value returns 20 hits (`TODO.md`, Adapters). Either choice changes
    what an agent sees, so the item asks for a measurement first. `needs-decision` (adapter
    default versus schema statement, and which instrument measures it).
15. **stellarDocs `content` only for returned hits.** Eight operations over-fetch 100 hits with
    `content` and keep 20. A two-pass design removes the payload waste; the measured cost is
    upstream bytes, not latency. Effort: half a day plus a live measurement. `simple` in design,
    but it changes upstream traffic, so it goes after items 1 to 6.
16. **Source-authority guidance for full-description clients.** `EXECUTE_DESCRIPTION` and
    `AUTHORITY_RULES` still conflict beyond the 2,048-character clip (`TODO.md`, Eval
    instruments). The item requires a full-description or Playground measurement, and the
    Playground runner has no answer-cost accounting or judge dollar cap. `needs-decision`
    (prompt text is policy; the measurement is paid).

The survey found no defect in the MCP server, the adapters, or the web surfaces. It found none in
the canary, CI, or the refresh workflows. The usage checks passed within the limits stated above.

## Plan for this block

PR A (bookkeeping and docs) carries items 1, 3 (status and evidence), and 5. It carries the
roster half of item 2; `AGENTS.md` waits for the owner. It also carries the `sd-037` note from
item 13. PR B (dependencies): item 4.
PR C (skill tooling): item 6. PR D (goldens): item 9 and the 2026-10-07 case from 9b. Item 7 runs
as a read-only research lane and writes its table here. Items 8, 10, 11, 12, 14, and 16 wait for
the owner. Item 15 follows the PRs above.

Each PR passes its gates and an independent review from a non-Fable lane (Sol, Astra, Grok, or
Opus). Every finding is reconciled. Then CI, squash merge, `npm run deploy`, production
verification, and a receipt below.

## Lanes

| lane | agent (model, effort) | pane | write set | status |
| --- | --- | --- | --- | --- |
| lead | `raven-next` (Claude Fable 5.1) | `w3W:p2` | this ledger, PRs A to D | running |
| review A | `rev-sol-a` (GPT-6.1-Sol, high) | `w3W:pC` | `review-a-sol.md`, `verify-a-sol.md`, `final-a-sol.md`, `final2-a-sol.md` in this round directory | accept (final, after three fix passes) |
| review B | `rev-astra-b` (GPT-6-Astra, high) | `w3W:pD` | `review-b-astra.md`, `verify-b-astra.md`, `final-b-astra.md` in this round directory | accept (final) |
| review C | `rev-grok-c` (Grok 4.7, high) | `w3W:pG` | `review-c-grok.md`, `verify-c-grok.md` in this round directory | accept with fixes; fix confirmed |
| review D | `rev-grok-c` (Grok 4.7, high), reused pane | `w3W:pG` | `review-d-grok.md` in this round directory | running |

Panes `w3W:pC`, `w3W:pD`, and `w3W:pG` were split from `w3W:p2` and belong to this lead.

## Reconciliation

### PR A (#185), reviewer `rev-sol-a`

| finding | disposition |
| --- | --- |
| PR 2021 has a `MEMBER` approval (2026-09-29T21:44:44Z) that the survey missed | fixed: survey, item 13, and the `TODO.md` `sd-037` item record it; status unchanged |
| The roster told agents to treat `gpt-5.6-terra` as retired, which is routing policy | fixed: the roster now states the catalog description and points to the open `AGENTS.md` decision |
| The ranked list omitted the two stellarDocs adapter items, the source-authority item, and the cleanup-verification limit | fixed: items 14 to 16 added; the usage conclusion narrowed |
| Item 9 put an owner gate on already queued golden updates | fixed: split into 9 (`simple`, queued) and 9b (dated) |
| Blanket "every id is stale" statements | fixed: the changed defaults, versions, and context figure are named |
| Long and passive sentences in the added prose | fixed where the reviewer cited lines; commands, tables, and quoted catalog text stay exact; the review brief stays as sent |

### PR B (#186), reviewer `rev-astra-b`

| finding | disposition |
| --- | --- |
| The `undici` completion condition demanded 7.30.0; 7.29.1 is patched and `miniflare` 5.20260930.0-alpha (Wrangler 4.145.0) pins it | fixed: condition now reads "outside the advisory ranges (7.29.1 or later)"; the Wrangler path is recorded |
| The `TODO.md` change only touched the completion line; the recheck paragraph was lost by a stale-buffer write | fixed: the paragraph is in, and the item states eight remaining findings |
| The audit README cited an uncommitted ledger | fixed: the recheck records revisions, counts, and gates inline |
| Sentence rules and a trailing blank line | fixed |

### PR C (#187), reviewer `rev-grok-c`

| finding | disposition |
| --- | --- |
| A forced failure of the second rename left a new manifest beside the old catalog and index; the README and script claimed nothing after the first rename could fail | fixed: the staged files move into a sibling directory first, the previous three files are kept beside them, and a trap restores them on a failed rename. The reviewer re-ran the forced failure on the new script: all three targets ended as the previous bytes. The success path leaves no `.swap.*` directory. README and comments describe this behavior. |

The reviewer verified everything else in the brief: byte-identical index rebuild, the five re-keyed
tokens, a location-only change on a copy of the production manifest (exit 1 without a ledger line,
exit 0 with one), the reachability of the index-build error handler under `set -e`, the drift
check's rejection of non-github sources, and the gates.

## Receipts

### PR A (#185) — bookkeeping, roster, `sd-052`, pointers

- Review: `rev-sol-a` (GPT-6.1-Sol, high), six findings plus one follow-up, final verdict accept.
  Four review files are in this round directory.
- CI passed (`Analyze`, `CodeQL`, `secrets`, `test`). GitHub merged the PR by squash as
  `e67f8d11bc4fb218a618516b16e32b1be01722be` at 2026-09-30T21:36:21Z. The branch was deleted.
- `npm ci` then `npm run deploy` from the clean `main` checkout at `e67f8d11`. The preflight
  printed `tree clean and HEAD == origin/main`. Worker Version ID
  `7b92d550-13d8-4202-9050-7e69c5617a2b`, version created 2026-09-30T21:36:39.221Z, deployment
  created 2026-09-30T21:36:41.912Z, 100% of traffic. The `postdeploy` hook passed.
- Verification at 21:36:51Z: the nine public routes returned HTTP 200; unauthenticated
  `POST /mcp` returned HTTP 401. The PR changed no Worker source, so no authenticated re-check
  was repeated beyond the PR B one.

### PR C (#187) — skill tooling hardening

- Review: `rev-grok-c` (Grok 4.7, high), one finding (a failed second rename left a mixed pin
  set), fixed with a rollback-guarded swap and re-verified by the reviewer on a copy.
- CI passed (`Analyze`, `CodeQL`, `secrets`, `test`). GitHub merged the PR by squash as
  `157c26b42038055b87f904e1c0b92479afad35a7` at 2026-09-30T21:40:10Z. The branch was deleted.
- `npm ci` then `npm run deploy` from the clean `main` checkout at `157c26b4`. The preflight
  printed `tree clean and HEAD == origin/main`. Worker Version ID
  `d6996315-bbfb-4406-95b1-d08be8822a0a`, version created 2026-09-30T21:40:28.306Z, deployment
  created 2026-09-30T21:40:31.289Z, 100% of traffic. The `postdeploy` hook passed.
- Verification at 21:40:34Z: the nine public routes returned HTTP 200; unauthenticated
  `POST /mcp` returned HTTP 401. The PR changed no Worker source, catalog, or manifest.

### PR B (#186) — dependency audit fix

- Review: `rev-astra-b` (GPT-6-Astra, high), four findings, all fixed; verification and final
  files are in this round directory. The reviewer's `undici` 7.29.1 finding corrected the
  completion condition.
- CI passed (`Analyze`, `CodeQL`, `secrets`, `test`). GitHub merged the PR by squash as
  `c87bc99a30aa09c8faea4bdcdc005e690ca28973` at 2026-09-30T21:28:11Z. The branch was deleted.
- `npm ci` then `npm run deploy` from the clean `main` checkout at `c87bc99a`. The preflight
  printed `tree clean and HEAD == origin/main`. Worker Version ID
  `3ddbfa5b-861f-4698-86c3-894e09bdc50c`, version created 2026-09-30T21:28:45.117Z, deployment
  created 2026-09-30T21:28:47.431Z, 100% of traffic. The `postdeploy` hook passed with the
  default credential this time: `Usage tail consumer and daily retention schedule are present.`
- Verification at 21:29:49Z: the nine public routes returned HTTP 200; unauthenticated
  `POST /mcp` returned HTTP 401; `/health/skills` reported `checked: 64` at 21:07:19Z. One
  authenticated `search` through the Raven connector returned three gated hits for a CLI
  bindings query (`stellarDocs.search_sdk_cli_tools_docs` first, score 254).

## PR D — golden freshness pass (queued items and the 2026-10-07 case)

Five owned cases changed under `golden-truth`. No key fact gained a new number. Dated amounts and
counts moved into dated wording; counts, roles, and protocol facts are unchanged. Live evidence
was collected between 20:56Z and 21:34Z on 2026-09-30.

### Corroboration matrices

| case | claim | verdict | classes | evidence |
| --- | --- | --- | --- | --- |
| `q-gap-builders-person-empty` | An absent query is a filter miss; the directory count is volatile (114 on 2026-07-11, 183 on 2026-09-14, 226 on 2026-09-30) | confirmed-as-of | C, D | Raven connector `scout.getBuilders({ q: "zzzzqqq" })` 20:56Z: `builders: []`, total 0, `matchMode: expanded`, advisory "The directory has 226 builder profiles, but none match these filters — … a filter miss, not an empty or unseeded directory"; `https://stellarlight.xyz/api/builders?q=zzzzqqq` 21:26:08Z same advisory; `/api/status` builders count 226, `lastUpdatedAt` 2026-09-30T12:57:22Z |
| `q-defi-x402-on-stellar-what` | The x402 Foundation launched operationally on 2026-07-14; SDF is a Premier member and states it holds a Governing Board seat (as of 2026-09-30) | confirmed-as-of | A, D, E | `https://stellar.org/x402` ("holds a seat on the Foundation's Governing Board, represented by Tomer Weller"); Linux Foundation press release dated July 14, 2026 ("operational launch"; SDF among 17 Premier members; 40 members); `https://x402.org/members` (Premier tier: "Appointed seat on the Governing Board"); tftc.io 2026-07-16 ("17 premier members with governing board seats"); SDF X post 2026-07-14 |
| `q-asset-trustline-basics` | One base reserve is 0.5 XLM on Mainnet today; a trustline adds one; a pool-share trustline adds two | confirmed-as-of | A, C | `developers.stellar.org/docs/learn/fundamentals/lumens` ("currently 0.5 XLM. Validators can vote to change the base reserve"); Horizon ledger 64703557 closed 2026-09-30T21:26:07Z, `base_reserve_in_stroops` 5000000, protocol 28 |
| `q-asset-amm-fee-reserve` | Pool-share trustline needs two base reserves; fee 30 bps | confirmed | A, B, C | liquidity-pools page ("A pool share trustline requires 2 base reserves instead of 1"; "30 bps, which is equal to 0.30%"); CAP-0038 (prior evidence); Horizon ledger 64703557 |
| `q-builder-content-by-person` | The official author index lists seven posts; the two repositories in the roster are archived and readable | confirmed-as-of | A, B | `developers.stellar.org/meetings/authors/kalepail` main list: seven articles 2024-01-26 to 2024-06-13 (the sidebar lists every meeting and is not the roster); GitHub API: `kalepail/passkey-kit` archived, moved to `stellar/passkey-kit`; `stellar/launchtube` archived, last push 2026-01-14; the four event and meeting pages HTTP 200 |

### Encoding

- `q-gap-builders-person-empty`: the answer dates the count; notes tell the grader to grade the
  filter-miss reading, not a fixed count. `rootCause`: `freshness-drift` and the `TODO.md` item.
- `q-defi-x402-on-stellar-what`: the governance sentence carries three dates (2026-07-10 unseated,
  2026-07-14 launch, 2026-09-30 seat); notes say the unseated reading is correct only as a
  pre-launch observation. New class D source added. `rootCause`: `freshness-drift` and the item.
- `q-asset-trustline-basics` and `q-asset-amm-fee-reserve`: XLM amounts dated as a Mainnet
  setting; key fact 2 of the AMM case binds the two-reserve count only. `rootCause`:
  `eval-authoring` and the `TODO.md` item.
- `q-builder-content-by-person`: no gospel change; notes and corroboration record the re-count
  and the archived repositories; `reverifyBy` 2027-01-07. `rootCause`: `freshness-drift`.

### Gates and register

- `npm run eval:qa:compile` → 501 cases; only the five intended cases changed.
- `npm run eval:qa:lint -- --since origin/main --stale` → 0 errors, 62 warnings (the `main` baseline;
  a transient key-fact length and snapshot-date warning was removed by binding the count only).
- `npm run eval:qa:register` reopened clusters 012, 017, 073, 114, 116, 123, 125, and 128;
  `register-review-d.json` re-swept each with a reason; `--check` → up to date.
- `npm run eval:plan -- eval/qa/results/2026-08-30T03-43-11-variantA.json` → byte-identical output on
  the branch and on `main`.
- Re-judge check: the saved run has one row among the five (`q-gap-builders-person-empty`,
  `partial`). Its verdict hinged on key fact 2 (filter miss versus empty directory), not on the count
  that moved. No paid re-judge.
- Sibling sweeps are recorded in each case's `truth.verified.evidence`.

