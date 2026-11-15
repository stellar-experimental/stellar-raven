# Step 2 implementation: delivery text, the `stellarOrg` source, seven cards (free work, no paid run)

Implementer: Claude Sonnet 5.5 (`claude-sonnet-5-5`), terminal `loop2-impl2` (`t1ps`), worktree `raven-wt/loop2`, branch `tune/loop-2`.
Orchestrator: Claude Fable 5.2 (`kalepail-c3614nvxph-mbp/t40f`). Plan: [`PLAN.md`](PLAN.md) with [`PLAN-AMENDMENTS.md`](PLAN-AMENDMENTS.md) (A5, A7, A8, A9, A10) and the notes of
[`STEP-1-REVIEW.md`](STEP-1-REVIEW.md) that touch step 2 (R7, R8). Step 1's decision (guard and map removal both kept) is in the round ledger, from `P1.md` on
`origin/tune/loop-2-runs`. No model-calling command ran, no collection ran, nothing was deployed or uploaded. **P2 is not authorized by this file.**

## 1. Commits

Each item is its own commit. Worker code of every commit after `160cd1fa` is identical to it
(`git diff 160cd1fa HEAD -- src scripts catalog specs package.json wrangler.jsonc env.d.ts` is empty).

| Commit | What | Diff |
|---|---|---|
| `6d416f8e` | Round ledger: P1's result, step 1 decided (guard kept, map removal kept only with item 4's `search` opening, R7), with the run lane's caveats | 1 file, +25 |
| `0b07783a` | **Item 4, delivery text.** First lines that stand alone; the `search` opening generated from the manifest (A5); `execute` margin; tests at 2,033, 200 and 117 | 8 files, +149 −32 |
| `2796299c` | **Item 2, the `stellarOrg` source.** A merge commit of `origin/feat/stellar-org-source` (tip `b81e7a03`), resolved against the map removal, the generated files rebuilt, `eval/gates.json` re-stamped, one `detail` edge added | 63 files, +4,641 −105 against the first parent |
| `160cd1fa` | **Item 3, seven search cards by default**, with the page-size and byte measurements | 7 files, +256 −22 |
| `b3709f74` | Step 2 scans: panel roles and exposure facts (`eval/qa/scan-step2-roles.mjs`), the off-golden 40-question routing check | 9 files, +4,867 |
| `6523ee6e` | Live checks (local `dev:eval`, keyless) and a test that a stellarOrg-only run carries the guard line | 4 files, +127 |
| this file's commit, then a gate-row commit | `STEP-2-IMPL.md`, the ledger entry, the final gate row | docs only |

Reverting: item 3 reverts alone, clean. Item 2 reverts alone with `git revert -m 1 2796299c`, clean (the two later test files
`test/stellar-org-guard.test.ts` and `test/step2-roles-scan.test.mjs` then fail until they are reverted too). Item 4 reverts clean **after** item 2 is reverted; with item 2
in place it conflicts in `src/mcp/tools.ts`, `src/mcp/micro-map.ts` and `ARCHITECTURE.md`, where the merge resolution touched the same lines (checked in a scratch worktree).
The order item 4, item 2 is the plan's (the source then adds a family clause to a sentence a client cuts, and nothing else).

## 2. Item 4: the delivery text (`0b07783a`)

**What changed** (nothing else in the contracts):

- `scripts/catalog-data/source-families.mjs` holds `SEARCH_OPENING_TEMPLATE` (frozen) and `SEARCH_OPENING_MAX_CHARS` (117). `scripts/build-micro-map.mjs` fills `{families}` with the
  operation families of the manifest, in manifest order, and fails when the rendered line is over 117 characters or does not end in a full stop. It emits `SEARCH_OPENING` into
  `src/mcp/micro-map.ts`. A family added to the catalog is named with no edit; one that overflows forces a rewording.
- `SEARCH_DESCRIPTION` begins with `${SEARCH_OPENING}`, then the unchanged `## Workflow`. The old first line named the namespaces with globs and carried "Hits are cards to compose in
  `execute`; they are not evidence."; the family list is still in `FAMILY_LINE` further down, so it is now said once up front and once in detail.
- `EXECUTE_DESCRIPTION` begins with two sentences, then a paragraph break, then the unchanged globals sentence. The old second sentence listed the namespaces and the `codemode.*`
  helpers; the globals sentence and the "Helpers:" list at the end say both.
- Tests: the instructions string and both descriptions are held to 2,033 (Grok), replacing the 2,048 and 2,000 constants; the instructions' first line is at most 200 characters and ends
  in a full stop; each description's first line is at most 117 characters, ends in a full stop and is followed at once by a line break; the `search` first line names every operation family
  of the catalog; the generator's overflow and malformed-template cases.
- `ARCHITECTURE.md` paragraph rewritten for the new caps. BASE and the instructions string are byte-identical (`67a6bd0b…6c00`).

**Exact text, before and after** (counts include every character; `\n` is a line break):

Before, `search` (first 117 characters: `Ranked search over every exposed service operation (lumenloop.*, scout.*, stellarDocs.*) and whole skill. Hits are ca…`, cut mid-word):

> Ranked search over every exposed service operation (lumenloop.\*, scout.\*, stellarDocs.\*) and whole skill. Hits are cards to compose in `execute`; they are not evidence.

After, at this commit (three operation families), **104 characters**, the first line of 1,866:

> Ranked search over lumenloop, scout and stellarDocs operations and skills. Hits are cards, not evidence.

At the tip (four families), **116 characters**, followed by `\n\n## Workflow`:

> Ranked search over lumenloop, scout, stellarDocs and stellarOrg operations and skills. Hits are cards, not evidence.

Before, `execute` (the first 117 characters ended `…It can call only the operations found with \`sea`):

> Run one JavaScript async arrow function in a sandbox with no network. It can call only the operations found with `search` (`lumenloop.*`, `scout.*`, `stellarDocs.*`) and the `codemode.*` helpers. The ONLY globals are …

After, **115 characters** and then `\n\n`:

> Run one JavaScript async arrow function in a sandbox with no network. It calls only operations found with `search`.

then, unchanged: "The ONLY globals are `lumenloop`, `scout`, `stellarDocs`, `codemode`, and standard JavaScript (`fetch()` fails). …".

**Lengths, measured from the assembled modules at each tip, against the six figures** (the live server agrees: section 4, "Live checks"):

| Text | `main` `0a603453` | Step 1 tip (P1's Worker) | Item 4 `0b07783a` | Item 2 `2796299c` | Item 3 `160cd1fa` and later |
|---|---:|---:|---:|---:|---:|
| Served instructions (BASE) | 4,066 | 1,899 | 1,899 | 1,899 | 1,899 |
| `search` description | 1,930 | 1,930 | **1,866** | **1,960** | 1,960 |
| `execute` description | 2,029 | 2,029 | **1,950** | **1,964** | 1,964 |
| First line of the instructions | 133 | 133 | 133 | 133 | 133 |
| First line of `search` | 117 characters of a longer sentence | same | 104 | 116 | 116 |
| First line of `execute` | cut inside the second sentence | same | 115 | 115 | 115 |
| `FAMILY_LINE` | 359 | 359 | 359 | 441 | 441 |

| Figure | Instructions (1,899) | `search` (1,960) | `execute` (1,964) |
|---|---|---|---|
| 4,096 (Claude Code) | 2,197 under | 2,136 under | 2,132 under |
| 2,048 (Claude Code before v2.1.296) | 149 under | 88 under | 84 under |
| 2,033 (Grok CLI) | 134 under | **73 under** | **69 under** |
| 512 (Codex docs: "keep the first 512 self-contained") | the first 512 characters end inside the Workflow paragraph, in `…codemode.skill.read(id, { sectio` | the first 512 end in the family line, in `…wallet docs; s` | the first 512 end in the Compose paragraph, in `…then return a small ` |
| about 230 (Codex catalogue line, one server; 201 with two) | the first line is 133 characters and whole | not shown by Codex | not shown by Codex |
| 117 (OpenCode lists 117 characters, then `...`) | not listed | ends at its sentence end, `…not evidence.` | ends at its sentence end, `…found with \`search\`.` |

`execute` had 4 characters of margin under Grok's cut on `main`; it has 69 with the source. `search` has 73. The 512-character reading is a Codex-docs recommendation, not a measured cut, and the
instructions' first 512 characters are not self-contained (they were not before either); item 4 leaves BASE alone by instruction, so that is reported, not changed.

**Client probe harness: not re-run.** `research/audits/2026-11-14-client-text-limits/probe/raven_run.py` asks the client's own model to quote the tail of each text it received (its prompt
says "reply with exactly one JSON object … the final 150 characters you can see"), for Claude Code, Codex, Grok CLI and OpenCode. Every session needs a model call, and the
Codex, Grok and OpenCode runs need those clients' own subscriptions. So **no delivery claim changes from this commit alone.** What stays unverified until the probe runs against the
step 2 tip, per client: that Codex's catalogue line is the 133-character first line whole; that OpenCode's two 120-character lines end at the sentence ends above; that Grok now receives both
descriptions whole (1,960 and 1,964 are under its cut by measurement of its own limit, not by a session). Claude Code receives all three whole by its documented limit. The tests hold the arithmetic.

**A9 recorded as asked:** every length above is from the assembled modules at that tip, none from adding differences.

## 3. Item 2: the `stellarOrg` source (`2796299c`)

`git merge origin/feat/stellar-org-source` (tip `b81e7a03`, merge base `66301389`), a merge commit rather than a rebase: eleven branch commits would each conflict again, and one merge commit
reverts as one. Every review fix on the branch is in the tree unchanged: the `get_page` path guard and spec constraint, the linear tag regexes, the audit, tutorial and partner rows, the
200-character query cap, and its 71 adapter tests (`test/stellar-org-adapter.test.ts`: 71 passed after the merge).

**Resolved against the map removal.**

| File | Resolution |
|---|---|
| `scripts/catalog-data/source-families.mjs` | The branch's `SERVICE_FAMILY_PURPOSES` (with its `stellarOrg` purpose line) and `AUTHORITY_RULES` (with the sentence "SDF's own strategy, roadmap, and its stellar.org service-provider and audited-project directories start with stellar.org") have no home after the map removal, and are dropped. **Not re-homed** (Q6): the source's "not for protocol behaviour; blog, press and events elsewhere" guidance is served nowhere now. `FAMILY_LINE` keeps its `stellarOrg=` clause |
| `src/mcp/micro-map.ts` | Regenerated by `npm run micro-map:build` |
| `src/mcp/tools.ts` | HEAD's description structure; `stellarOrg` added to the `execute` globals sentence; the branch's `service` parameter text kept |
| `scripts/catalog-data/retrieval-profiles.mjs` | Both: the loop 1 `detail` edge on the Docs searches and the branch's two `stellarOrg` profiles |
| `src/site.ts` | "The five source families" (the branch's count) with HEAD's second sentence (the branch's "Raven's guidance tells your agent which to trust" referred to the map) |
| `ARCHITECTURE.md` | HEAD's paragraph (four services named, caps rewritten); the build table row names the stellar.org spec |
| `eval/gates.json` | HEAD's evidence, re-stamped (below) |
| `.agents/TODO.md` | The branch's "Finish the stellar.org source after merge" item; its paired-run bullet on the four named cases rewritten to name the loop 2 check (those four cases are outside `sets.tuning`) |

Catalog, manifest, super spec, op classes, globes, golden, routing and QA cases were rebuilt by their scripts (`scripts/build-catalog.mjs`, `micro-map:build`, `spec:build`, `site:globes`,
`eval/plan/build-op-classes.mjs`, the compilers); nothing was edited by hand. The `eval/gates.json` re-stamp changes the manifest SHA-256, the local trace name and prepends a note.

**Model-facing text it adds, and every length** (all measured at the tip):

| Text | Chars | Where |
|---|---:|---|
| `stellarOrg=SDF site: strategy, roadmap, programs, provider and audit directories; ` | +82 (`FAMILY_LINE` 359 → 441) | the `search` description, once per description |
| `stellarOrg` in the `search` opening | +12 (104 → 116) | the `search` first line |
| `, \`stellarOrg\`` in the `execute` globals sentence | +14 | `execute` (1,950 → 1,964) |
| `, or "stellarOrg"` in the `service` parameter text | +14 (87 → 101) | the `search` input schema |
| `stellarOrg.search_site` description | 579 (input schema JSON 383, output schema JSON 1,807) | a `search` card (clipped to 220 characters plus signature) and `codemode.describe` |
| `stellarOrg.get_page` description | 330 (input 292, output 533) | same |
| The `detail` sentence after a site search | 268 (a 298-character block with its header) | the EVIDENCE CHECKPOINT of a result with a successful site search and no page read |
| The standalone corroboration guard line after any run that returned `stellarOrg` rows | 417 (a line break pair and the 415-character guard) | the result (R8 below) |

The two operation descriptions are frozen at the branch tip; the scorer reads their tokens (the branch kept its "not for" guidance out of them for that reason). The `search_site`
description names "the Soroban Security Audit Bank and its security-audited projects list", which is the vocabulary behind the predicted intrusions in section 4.

**The `detail` edge (the plan's table row, built here).** One edge `stellarOrg.search_site → stellarOrg.get_page`, `relation: "detail"`, `on: ["partial"]`, joined on `path` (a `search_site` row
carries it on page rows; `detailJoinKeys` validates it at build). The checkpoint sentence for a Docs search says "returned sections of pages … A section is exact evidence"; a site search returns
page rows, not sections, so the edge carries its own nouns: an optional `part: { plural, singular }` on the edge (default: sections of pages). The Docs sentence is byte-identical (a test pins it).

```text
`stellarOrg.search_site` returned page rows, not whole pages. A row is exact evidence only for what it shows whole. Before you state a list, number, formula, code, or status it does not show whole, read the page: `stellarOrg.get_page({ path })` with that hit's `path`.
```

It changes no `search` hit, order or score (the relation is kept out of the alternatives and the search recovery cards, as for Docs) and no result without a site search.

**R8, decision left to the step 2 review.** `stellarOrg` is **not** added to `CORROBORATING_FAMILIES`: that would make SDF's own posts official for all four claim kinds by data (A2's class 3
includes "a foundation post asserting a governance outcome"). With it out, a run that returned `stellarOrg` rows carries the standalone guard line (417 characters); the live check below shows it once, and
`test/stellar-org-guard.test.ts` pins it. The audit register rows carry a report URL; the guard's "primary record a result returned" admits the report if it is read, not the register row. If the review
wants the SDF site official for programme and directory pages only, that is a new mechanism, not a data line.

**A8 note for P2.** A row in neither the source-exposed nor the seven-exposed set differs from P1 by the item 4 text and by this item's always-on description text (against P1's Worker, `search` goes from 1,930 to 1,960 characters and `execute` from 2,029 to 1,964; the
`service` parameter text and a family clause are in the `search` figure); its movement is a harm test of both together, and H3 at T stops the step without assigning cause.

## 4. Free checks

**Routing gate and the 544 rows** (aggregate counts only; `scans/step2/` and the scratch comparison print no row id). Run on the previous tip's manifest and on the merged one, per case:

| | Rows | Grade changed | Top-1 changed | Top-five list changed | Score changed outside those |
|---|---:|---:|---:|---:|---:|
| legacy 338, extended 122, skills 23, holdout lane 49, protocol-history 12 | 544 | **0** | **0** | **8** (5 legacy, 1 extended, 2 holdout lane, 0 skills, 0 protocol-history) | 0 |

Every changed list gains a `stellarOrg` operation: at rank 3 in one, 4 in two, 5 in six (nine gained operations; one list gains both). What they displace, by family: 3 Lumenloop, 5 Stellar Docs, 1 Scout. No order-only change. The accepted totals are identical;
`npm run eval:routing -- --gate` exits 0 after the re-stamp. (The branch's first comparison, against the 2026-11-12 baseline, found six lists. Its descriptions have since grown to name audit, tutorial and partner rows, which is the likelier cause of two more; this check does not separate that from the loop 1 manifest underneath. The gate itself names no changed row.)
**No row was read for a held-out or reserve duplicate**: the comparison script prints counts and does not write a row id.

**Off-golden 40-question set, the free routing check (reported, never a gate)** (`scans/step2/off-golden-*.txt`):

| | Natural question | Keyword |
|---|---:|---:|
| Adapter recall, `search_site` hits, stored snapshot, limit 10 | 33/40 at 5 and at 10 | 37/40 at 5 and at 10 |
| Catalog reach: a `stellarOrg` operation in the `search` page at limit 5 | 8/40 | 14/40 |
| Catalog reach at limit 7 (the new default) | 8/40 | 16/40 |

The adapter numbers equal the branch's (33 and 37 of 40). The branch recorded 7 of 40 for reach at 5 with a limit-12 query and top-five rank; this script ranks the real page at limit 5 and gets 8 on the
branch's own manifest as well as on the rebased one, so the difference is the method, not the merge. Seven cards add no natural-question reach and two keyword ones.

**Replay of the stored `search` calls of P0 and P1 on the rebased catalog** (`scans/step2/roles.md`, `roles.json`; selected by id over `sets.tuning` first; reads `id`, case tags, golden source URLs and the transcript's tool calls, no verdict):

| | P0 | P1 pass 1 |
|---|---:|---:|
| Panel rows with a `search` call | 52 | 54 |
| Source-exposed: a page gains a `stellarOrg` card | 4 | 5 |
| Seven-exposed: a `search` with no `limit` | 10 | 10 |
| Seven-used: a called operation at rank 6 or 7 of a default-limit page | 0 | 1 (`q-sor-custom-errors-find-failure-cause`, `stellarDocs.get_doc_page`) |
| Both | 0 | 0 |

The rows whose page would gain a `stellarOrg` card, and what it displaces: the source rows `q-hot-sdf-xlm-holdings-sales` (no displacement at limit 10) and `q-org-sdf-structure-mandate` (a skill and a Docs operation in P0, two Docs operations in P1), and
**three rows that are not source rows**: `q-protocol-tier1-requirements` (both runs: gains both `stellarOrg` operations at limit 8, displaces `stellarDocs.search_asset_token_docs` and `stellarDocs.search_docs_in_category`),
`q-soroban-reentrancy` (both runs: gains `search_site` at limit 8, displaces `stellarDocs.search_soroban_contract_docs`, which the stored P1 script **calls**) and `q-ti-parse-raw-ledger-data` (P1: displaces `lumenloop.search_directory` at limit 10).
This is the scorer reading the frozen `search_site` description ("Soroban Security Audit Bank", "security-audited", "organization" overlaps), not a mechanism: Q6 puts the "not for protocol behaviour" scope in the
results, not a description, if P2 shows two unrelated intrusions. The scan commits the definitions P2's reading uses (source-exposed, seven-exposed, seven-used, both) before P2 runs.

**Roles by rule** (`scans/step2/roles.md`):

- **Source rows (12):** `q-asset-usdc-eurc-issuer`, `q-comp-aml-analytics-vendors`, `q-data-network-metrics-sources`, `q-eco-stellar-rwa-stablecoin-volume`, `q-hot-fee-pool-burn-deflation`, `q-hot-sdf-xlm-holdings-sales`,
  `q-org-sdf-structure-mandate`, `q-raph-official-help-sdf-cannot-recover`, `q-scf-ambassador-program`, `q-scf-how-to-apply`, `q-scf-vs-sdf-enterprise-fund`, `q-soroban-pre-mainnet-security-steps`. Equal to the plan's list.
- **Identifier rows (17):** equal to the plan's list. The series named in them are `cap` and `sep` only (A6: nothing else fires on this panel). The rule here is A6's token rule (joined or hyphenated), over the 16 values of the `scout.searchResearch` `source` enum.
- **Guard rows (10)** are the step 1 set (`scans/guard-ids.txt`), unchanged.

**Seven cards, measured** (`scans/step2/search-page-size.json`, from `test/search-page-size.test.ts`, an env-gated test through an in-memory MCP client):

| Limit | Mean bytes | p50 | p90 | Max | Pages over Grok's 20,000 | Over Claude Code's 40,000-byte warning |
|---:|---:|---:|---:|---:|---:|---:|
| 5 | 6,992 | 6,686 | 9,839 | 14,816 | 0 | 0 |
| 7 | 8,889 | 8,555 | 11,616 | 16,839 | 0 | 0 |

All 460 legacy and extended questions return a full page at both limits. The mean page grows 1,897 bytes (about 475 tokens); the maxima equal the caps audit's (14,816 and 16,839), so the source added no card that changes them.
On the stored transcripts the default governs 10 searches in P0 (10 rows) and 11 in P1 (10 rows); the extra bytes per default page are 1,536 and 1,667 on average (maximum 1,870 and 1,947). Priced at bytes / 4 tokens, reread
once by every later model call of the question, they are **0.11% (P0) and 0.14% (P1) of a question's input tokens on average over all 58 rows, 0.64% and 0.82% on the rows with a default-limit search, at most 1.5%** (M1's bar is 5%).
Claude Code's own bar and Grok's clip are not approached. Leakage note (review Q2): the 11-of-182 card-hit evidence for seven is an aggregate over routing rows that include the off-limits duplicates, so the held-out read is not independent evidence for item 3.

**Live checks** (a `dev:eval` server on port 8811 from this worktree, started and stopped by this lane with `hc`; keyless; `stellarOrg` ran from this workstation, so it says nothing about Worker egress; `scans/step2/live-check.mjs`, `live-check.txt`, `live-surface-step2.json`):

| Check | Result |
|---|---|
| `report-live-surface` | instructions 1,899 characters, SHA-256 `67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00`; `search` 1,960; `execute` 1,964; descriptions 3,924; input schemas 1,661; serialized tool list 6,069; surface `42ec61020a5f38c73ac30eb204ff424f30220f68ee3827373071c077ada8f17f` |
| `stellarOrg.search_site` alone | 1,691-character result; the guard once, standalone; the `stellarOrg` detail sentence; no Docs sentence |
| `stellarOrg.get_page` alone, and a site search then a page read | the guard once; no detail sentence (the page was read) |
| A Docs search | no guard line; the Docs detail sentence ("returned sections of pages") unchanged |
| A script with no service call | 9 characters, no block |
| `search` with no `limit` | 7 hits (5,447 characters) for a broad question; 4 hits for a narrow one |

**Not run: the reachability record for the 12 source rows** (PLAN section 2, free checks before P2: does `search_site` on the question return a page the golden cites, and does `get_page` return its text). It sends each
case question to stellar.org's site search over the network; the instruction listed the committed scans and did not list a live probe against the source site, so I did not run it. It is free and read-only; the roles scan already
names the 12 rows and their golden paths. Until it runs, no source row is marked unreachable, and the "a row marked unreachable cannot move" rule has nothing to apply.

## 5. Gates, each bare, exit code on every commit tip

`npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke`, `npm run eval:routing -- --gate`, the CI "generated artifacts in sync" step (the ten generators, then `git diff --exit-code --stat` over the
generated paths), `npm run secrets:scan -- --tree`. Each ran with its output to a file, so the exit code is the command's.

| Tip | typecheck | test | build | smoke | routing gate | generated sync + diff | secrets | Tests (npm test / smoke) |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `0b07783a` item 4 | 0 | 0 | 0 | 0 | 0 | 0 / 0 | 0 | 3,513 passed, 3 expected fail, 4 skipped / 143 |
| `2796299c` item 2 | 0 | 0 | 0 | 0 | 0 | 0 / 0 | 0 | 3,588 / 143 |
| `160cd1fa` item 3 | 0 | 0 | 0 | 0 | 0 | 0 / 0 | 0 | 3,589 / 144 |
| `b3709f74` scans | 0 | 0 | 0 | 0 | 0 | 0 / 0 | 0 | 3,594 / 144 |
| `6523ee6e` live checks | 0 | 0 | 0 | 0 | 0 | 0 / 0 | 0 | 3,596 / 144 |
| `bd93f437` the record (docs only; Worker identical to `160cd1fa`) | 0 | 0 | 0 | 0 | 0 | 0 / 0 | 0 | 3,596 / 144 |

At item 3's first run `npm run test:smoke` exited 1: the default text is in the shared `limit` schema, and the Playground's wire-hash pin changed. The Playground serves its own default of 5, so the fix is
`searchLimitSchema(defaultLimit)` and the Playground tells its model "default 5" (its wire hash is unchanged); the row above is the second run, after the amend. The row for `bd93f437` was added by the commit after it; that commit changes this file only.

## 6. Deviations and decisions for the orchestrator

1. **A merge commit, not a rebase** for item 2 (section 3). One revert; the review fixes keep their history.
2. **The `detail` edge and its per-edge nouns are built here.** The plan's table lists the edge; the branch had none, and the Docs sentence says "sections of pages". An optional `part` on the edge carries the nouns. If the step 2 review wants the
   edge out, it is the one `retrieval-profiles.mjs` line plus the `part` code, with the 71 adapter tests unaffected.
3. **`stellarOrg` is not a corroborating family** (R8, section 3). Every `stellarOrg` result carries the 417-character guard line until the review decides.
4. **The `execute` opening drops "and the `codemode.*` helpers"** from its second sentence (the A5 draft, adopted). The globals sentence and the Helpers list still name `codemode`. The first line stands alone; a reviewer who wants the
   clause back needs a line break before it to keep OpenCode's cut at a sentence end.
5. **The `search` opening drops "to compose in `execute`"** (A5's draft). The workflow below it still says "Write ONE `execute` script that composes SEVERAL relevant operations".
6. **Playground schema text** is its own (`searchLimitSchema`); the Playground default and wire hash are unchanged, as the plan says.
7. **Not re-homed:** the source's scope guidance (Q6). Three non-source panel rows would see a `stellarOrg` card on stored queries (section 4); P2 reads them under A8 and the traced-displacement rule.
8. **Not run:** the client probe harness (needs each client's model), the reachability record (section 4), anything on Cloudflare.
9. **`.agents/TODO.md`**: the branch's four-case paired-run bullet is rewritten to the loop 2 check; the M1 item records the decision.
10. **The routing note in `eval/gates.json` names no row**: it gives counts, because the rows that duplicate held-out or reserve questions cannot be told from the rest.

## 7. What the orchestrator must verify on Cloudflare before P2 (amendment A7)

Required before P2 is authorized, with owner authorization. Nothing here ran.

1. **Whether a preview is possible at all.** `wrangler.jsonc` has `"workers_dev": false` and no `preview_urls`. A `wrangler versions upload` version has no preview URL unless the owner enables preview URLs (a config
   change for them to make). If it stays off, the rest of this step cannot run as written.
2. **Upload** (no traffic; the version is not deployed): from a checkout at the pushed tip, `npm ci && npm run typegen && npx wrangler versions upload --message "loop 2 step 2 preview, no traffic"`. Record the Version ID. Check that
   the version inherits the Worker's secrets and bindings; if it does not, the keyed call below cannot authenticate and the check needs a different route.
3. **One keyed `execute`** against that version's preview URL (the key as `docs/operations.md` describes; `npm run mcp-key -- create <name>` makes one) that calls both operations from the Worker:

   ```js
   async () => {
     const s = await stellarOrg.search_site({ query: "strategy", limit: 3 });
     const path = s.ok ? s.data.hits.find((h) => h.path)?.path : null;
     const p = path ? await stellarOrg.get_page({ path }) : null;
     return { search: s.ok ? s.data.hits.length : s.error, path, page: p ? (p.ok ? p.data.content.length : p.error) : null };
   }
   ```

   Expected from a workstation (`scans/step2/live-check.txt`): hits returned, the guard once, the `stellarOrg` detail sentence. A pass is hits and page text from the Worker. A refusal (a 403 or a challenge page from stellar.org's front)
   is the "front refuses Worker egress" case.
4. **If no preview is possible and no upload is authorized,** label P2's source reading "workstation egress", as A7 says, and make the post-deploy Worker check a gate: revert `2796299c` alone (`git revert -m 1`) if it fails.
5. **After the deploy, as plan section 9:** `initialize` returns 1,899 characters (SHA-256 above); `tools/list` returns descriptions of 1,960 and 1,964 characters (surface `42ec6102…f17f`); a keyed `execute` with a research call shows the
   guard; a Docs search shows the Docs detail sentence; a site search shows the `stellarOrg` one; a `search` with no `limit` returns 7 hits; the outbound status in Workers observability for `stellar.org`.

## 8. The P2 command (not run; needs the owner's authorization line in the ledger and the independent review of this diff)

P2 measures the step 2 surface against P1 (the guard and the map removal are both kept, so P1's pass 1 is the control). A10 is read as the orchestrator ruled: one pass over the 58 rows and no extra passes over the 12 source rows.
Cost: P1's pass 1 cost USD 12.02 for 58 rows; the cap below is the plan's P0 cap, not P2's 20.5, because the 24 source-row collections are cut. **Stop rules** as the plan's P2 row (H1, H2 on source-exposed rows; two unrelated rows down by a traced
displacement; seven-used rows; delivery text on rows in neither set, H3 at T); T is the orchestrator's 5 on the all-rows comparison and its own value on any subset, per A4.

```sh
cd /home/tyler/code/raven-wt/gca-eval && git fetch origin && git checkout --detach "$P2_COMMIT"   # tune/loop-2, the pushed tip of this step or later
npm ci && npm run typegen && test -z "$(git status --porcelain)"
# The Worker must be code-identical to 160cd1fa (the item 3 commit):
git diff --quiet 160cd1fa HEAD -- src scripts catalog specs package.json wrangler.jsonc env.d.ts || { echo "Worker changed since 160cd1fa"; exit 1; }
SERVER_REVISION=$(git rev-parse HEAD); PORT=8799
hc run --bg --name p2-server --cwd /home/tyler/code/raven-wt/gca-eval npm run dev:eval -- --port "$PORT"
hc wait p2-server --output Ready        # then the initialize POST from the run-evals skill must return 200
node eval/report-live-surface.mjs --port "$PORT" --expect-source-revision "$SERVER_REVISION" \
  --expect-sha256 42ec61020a5f38c73ac30eb204ff424f30220f68ee3827373071c077ada8f17f --json /tmp/raven-eval-surface-p2.json
# Stop if the report does not show: instructions 1899 chars, sha 67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00,
# search 1960, execute 1964, descriptions 3924. --expect-sha256 already fails the call on a surface mismatch.

export DISABLE_AUTOUPDATER=1
PIN_BIN=$(mktemp -d) && ln -s ~/.local/share/claude/versions/2.1.325 "$PIN_BIN/claude" && export PATH="$PIN_BIN:$PATH"
AGENT_BINARY_SHA256=$(sha256sum "$PIN_BIN/claude" | cut -d' ' -f1)   # must be 0dc4f4a9a165fc60746d7ae8489712e5fc352f1e7ad4eb22e7141bd0812eb0cf
AGENT_ENVIRONMENT_SHA256=$(node --input-type=module -e 'import { agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs"; process.stdout.write(agentEnvironmentIdentity().sha256)')
REMOTE_IDENTITY_PROBE=eval/qa/probe-remote-identities.mjs
REMOTE_IDENTITY_PROBE_SHA256=$(shasum -a 256 "$REMOTE_IDENTITY_PROBE" | cut -d' ' -f1)   # must be aabfb83fb8e956856d70f9b5657ea6fca2f64551073812fb646b3689a8f28d99
REMOTE_IDENTITY_SHA256=$(env -i PATH="$PATH" "$REMOTE_IDENTITY_PROBE" --stable-sha256)   # must equal P0's and P1's: 046b02808eabfdca9477d7e90c2d3ef3a15729911a86280ba4f91471c4a727e8 (a moved vector is reported)
STABILITY_REGISTER=/home/tyler/code/raven-wt/gca-eval/eval/qa/judge-stability.json   # sha 4322dd4d1ebfc30bc02a9def008039aba4f4b2395b1f9da5cabef56ec24bf458
PANEL_IDS=$(cat .agents/rounds/2026-11-15-tuning-loop-2/scans/panel-ids.txt)
test "$(echo "$PANEL_IDS" | tr ',' '\n' | sort -u | wc -l)" = 58   # the job count, before spend

# One judge policy (R2): P0's value (58), read from P0's results file, as for P1.
P0_RESULTS=eval/qa/results/2026-11-15T04-31-41-variantA.json
MAX_PANEL_CASES=$(node -e 'process.stdout.write(String(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).meta.judgeTiering.maxPanelCases))' "$P0_RESULTS")
test "$MAX_PANEL_CASES" = 58 || { echo "P0 judge cap is $MAX_PANEL_CASES, not 58: stop and ask the orchestrator"; exit 1; }

node eval/qa/run-qa.mjs --variant A --port "$PORT" --max-panel-cases "$MAX_PANEL_CASES" --stability-register "$STABILITY_REGISTER" --server-revision "$SERVER_REVISION" \
  --expect-sha256 42ec61020a5f38c73ac30eb204ff424f30220f68ee3827373071c077ada8f17f \
  --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256" \
  --remote-identity-probe "$REMOTE_IDENTITY_PROBE" --expect-remote-identity-probe-sha256 "$REMOTE_IDENTITY_PROBE_SHA256" \
  --expect-remote-identity-sha256 "$REMOTE_IDENTITY_SHA256" \
  --ids "$PANEL_IDS" --max-budget-usd 14.5     # one pass, 58 rows
# then, free: npm run eval:plan -- eval/qa/results/<stamp>-variantA.json ; hc kill p2-server
```

Pins, hashes only. The surface pin `42ec6102…f17f` is computed on this tip's Worker (it differs from P1's `dcc295de…4f18` because the descriptions, the family clause and the default changed). The source-revision pin is
the pushed tip at launch; the Worker identity check above is what ties it to the measured code. The pins the P1 run held (agent binary, probe, remote vector, stability register) are unchanged and must hold. The agent environment
hash differs by design (PATH is hashed). **After P2, read:** `scans/step2/roles.md`'s definitions on the P2 transcripts (source-exposed, seven-exposed, seven-used, both), the three intrusion rows of section 4, and the plan's P2 rules; the
research-call share on the 17 identifier rows is a free transcript count again (Q7).

## 9. State

`gca-eval` was not touched. No server runs from this lane (`step2-server` was killed; port 8811 is closed). The scratch worktree used to test reverts was removed. `.agents/rounds/2026-11-15-tuning-loop-2.md` has the step 2 entry. The
subscription subagent count for this step is zero.
