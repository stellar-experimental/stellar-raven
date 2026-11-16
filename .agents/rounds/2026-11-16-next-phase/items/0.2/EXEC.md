# Item 0.2 execution record, phase A

Executor: Claude Sonnet 5.5 (agentpc), worktree `/home/tyler/code/raven-wt/np-0.2`, branch
`np/0.2-absorb-drift-223` at `dfb7793d`. Run 2026-11-16, free and local: no subagent, no hc child,
no model-calling eval, no paid call, no AI Gateway or Workers AI. Phase A is steps 1 to 6, 9 and
10. Nothing is committed. Raw logs and compare outputs are in `tmp/` (ignored); the skill body diff
is in `tmp/0.2-skill-body-diff.txt` and is not committed.

Stamped manifest SHA-256 (final tree, titles held, no exposure change):
`8bbfb864eb37988d968d56a18b7a10291e31fda4f5eb25f3d25d82cc0642fc38`. It was re-asserted after step 5
and after step 6 and is the value on disk now.

No stop rule fired. No deviation from the plan except the three items under "Deviations".

## Step 1: regenerate (exit 0 throughout)

| Command | Exit | Result |
|---|---|---|
| `npm run docs:anchors:build` | 0 | 979 pages, 4131 headings, 82 ambiguous, 18 changed pages, 8 removed pages |
| `(set -a; . ./.dev.vars; set +a; node scripts/refresh-inventory.mjs)` | 0 | `stellar-docs`, `stellar-docs-titles`, `stellar-light` written; `lumenloop` and `stellar-org` unchanged; 982 page titles; no secret printed |
| copy titles to `tmp/0.2-titles-fresh.json`, `git checkout HEAD -- inventory/stellar-docs-titles.json` | 0 | hold restored |
| `node scripts/build-catalog.mjs` | 0 | guards passed; Scout exposure unchanged at 30 operations |
| `npm run micro-map:build`, `npm run spec:build`, `node eval/plan/build-op-classes.mjs` | 0, 0, 0 | `micro-map.ts` and `op-classes.json` unchanged; `super-spec.json` +10 lines |

## Step 2: classify

`stellar-light` (1.9.135 to 1.9.150): `surface` exit 0 (equal), `text` exit 1 (one change), `deep`
exit 1 (paths and components differ).

- `text`: one operation, `GET /api/analyze` (`analyzeEcosystem`). The description changes
  "Soroban-SDK version-status distribution" to "Soroban-SDK and JS-SDK version-status distribution,
  apart and combined".
- `deep`: operations `analyzeEcosystem`, `hackathonBrief`, `getQualityReport` (excluded),
  `explainRepo`, `getRepoTrust`; component schemas `LeaderboardProject`, `Project`, `Repo`. 246
  paths added, 0 removed, 18 changed (mostly descriptions; new fields include `jsSdkStatus`,
  `sorobanSdkStatus`, `stellarJsDep`, `toolchain.adoption`, `goneRepos`, `lifecycle`, `wasLive`).
  `GET /api/verify` unchanged.

`lumenloop`: `surface` 0, `text` 0, `deep` 0. All equal.

`inventory/stellar-docs.json` (from `git diff HEAD` and a key comparison): `contract` unchanged;
only `fetchedAt` and `pageIndex` moved (pageCount 979 to 982, two section hashes and counts).
`inventory/stellar-org.json` did not move, so the skill's stellar.org branch does not apply.

Runner ops (`skills.lumenloop.stellar-ecosystem-digest`: `lumenloop.search_content_semantic`,
`lumenloop.list_documents`, `lumenloop.find_content_by_entity`) intersect the touched operations
(all Scout) in the empty set.

Anchors: `npx vitest run test/adapters.test.ts test/stellar-docs-anchor-build.test.mjs
test/stellar-docs-anchors.test.ts` exit 0, 3 files, 141 tests passed. Removed anchor pages (8):
`/docs/build/guides/archival/{create-restoration-footprint,extend-persistent-entry,restore-contract,restore-data}-js`,
`/docs/build/guides/rpc/{generate-ledger-keys-python,retrieve-contract-code-js,retrieve-contract-code-python}`,
`/docs/build/guides/transactions/submit-transaction-wait-js`. Added: the same eight without the
suffix, plus `/docs/build/agentic-payments/x402/seller-and-agent-guide`,
`/docs/tokens/asset-issuance-stack`, `/meetings/2026/11/12`.

Class: routing text (one Scout description) plus schema and data drift; Docs and skill pin drift.

## Step 3: skill pins and directories

`git show HEAD:ecosystem-skills/MANIFEST.json > tmp/0.2-manifest-base.json`, then
`./ecosystem-skills/update.sh` exit 0 (log `tmp/0.2-update.log`).

- Pins moved: `openzeppelin-stellar` `584262af9eed` to `f82d2d958800` (no body change),
  `stellar-dev` `ceeb2f17a0fd` to `421ca30a671c`, `stellar-light` `0f3040cf41bc` to `f1f781b925a9`.
  `lumenloop` and `trustless-work` pins unchanged. 21 skills across 5 sources.
- Body diff (`node scripts/diff-pins.mjs`, exit 0), 2 skill files changed, counts only:
  - `stellar-dev/standards/ecosystem.md`: +35 -2 lines (sha `56be3f99ddd5` to `eda80578aaa0`,
    31061 to 35363 bytes).
  - `stellar-light/stellar-scout/references/api-reference.md`: +12 -10 lines (76862 to 84443 bytes).
  - The body text stays in `tmp/0.2-skill-body-diff.txt` for the Codex reviewer.
- Directories: `catalog.json` 82 to 83 entries, one new `community` skill-md entry
  `cavos-stellar` ("Cavos", `https://github.com/cavos-labs/kit`, install
  `npx skills add https://github.com/cavos-labs/kit`); `community.json` 50 to 51 snapshot rows
  with the same `cavos-stellar` raw SKILL.md URL on `cavos-labs/kit` `main`. The Codex review
  should read its rendered `INDEX.md` row.
- `groups.json`: 21 categorized, 0 uncategorized, so nothing filed. `node
  ecosystem-skills/build-index.mjs` exit 0.
- `PIN-REVIEW.md` attestation: not recorded (phase B). `update.sh` prints these to record:
  `lumenloop d92c56bda17a sel:6b1929302da9`, `openzeppelin-stellar f82d2d958800
  sel:66a21fa7d3e1`, `stellar-dev 421ca30a671c sel:5e7b81b76438`, `stellar-light f1f781b925a9
  sel:e9a0fe5ef280`, `trustless-work 80e2467f3404 sel:b23fec8248ff`.
- Rebuilt catalog, micro-map, spec and op classes (exit 0 each). Catalog skill rows change only in
  `transport` (url and sha), not in searchable text: the entry field diff against `origin/main`
  shows only `description` (1 entry), `keywords` (9), `outputSchema` (7) and `transport` (127).
- `node scripts/check-mirrors.mjs --fetch` exit 0: "fetched + verified 67 pinned skill files
  (upstream, cache bypassed)", "mirror checks ok".

## Step 4: routing gate and re-stamp

`npm run eval:compile` exit 0. `npm run eval:routing -- --gate` on the final tree: exit 1 with
exactly one failure line, "catalog/manifest.json SHA-256 does not match the committed gate
evidence". Compared every row with `origin/main`'s manifest
(`node eval/run-routing.mjs --manifest tmp/0.2-manifest-main.json`, exit 0, GATE PASS; the main
manifest is byte-identical to the committed one). Compare script: `tmp/0.2-compare.mjs`.

Result, 544 rows: every accepted total equal in every lane, **0 graded changes in every lane**
(legacy 338, extended 122, skills 23, protocol history 12, holdout 49). Totals (all equal):
legacy 220/293/327, card@5 113; extended 93/112/117; skills 17/23/23; holdout 12/27/30, captures
10, passed 25; protocol history 6/7/7, control captures 3.

Non-graded movement, all from the `analyzeEcosystem` description and the keyword sets re-derived
from the changed Scout output schemas:

- Legacy, 3 score-only moves: `q-asset-amm-fee-reserve` (`scout.analyzeEcosystem` 308 to 316),
  `q-defi-comet-what-is` (`scout.analyzeEcosystem` 185 to 195), `q-infra-horizon-deprecated`
  (`scout.explainRepo` 216 to 226, new keywords `js`, `current`, `supported`, `deprecated`).
- Extended, 2 score-only moves: `q-defi-named-newer-protocols` (`scout.analyzeEcosystem` 293 to
  304), `q-ti-historical-pointintime-balances` (`scout.analyzeEcosystem` 410 to 408).
- Extended, 2 top-five list changes: `q-aas-publish-asset-metadata-toml` (`scout.explainRepo`
  leaves; `scout.vetIdea` enters at rank 4), `q-sor-testing-negative-auth-events`
  (`scout.analyzeEcosystem` leaves rank 5, `stellarDocs.search_docs` enters).
- Skills and protocol history: no change. Holdout lane: 1 top-five list change (count only).

Re-stamp (`tmp/0.2-restamp.mjs`, `eval/gates.json` only, 3 insertions and 3 deletions): the
`catalog/manifest.json` input SHA-256 to the stamped value above, `localTrace` to
`routing-2026-11-16T22-24-53-662Z.json`, and `notes` replaced by a 2026-11-16 paragraph naming
each cause above (holdout by count), then "Prior note:" and the 2026-11-15 paragraph with its
git-history pointer; the 2026-11-14 paragraph is dropped. Thresholds, `acceptedTotals` and
`baselinedAt` untouched. The note says the independent review is outstanding; phase B updates it.
Confirmation: `npm run eval:routing -- --gate` exit 0, "GATE PASS ... committed evidence
verified; local trace routing-2026-11-16T22-24-53-662Z.json".

## Step 5: titles A/B

Details in [`TITLES-AB.md`](TITLES-AB.md). `build-catalog.mjs --out
tmp/0.2-fresh-titles-manifest.json` exit 0; hold restored; stamped SHA re-asserted equal.
Fresh against held: legacy 219/293/326/113 (2 graded losses, 0 gains: `q-edge-exhaustive-defi-deep-report`
top5, `q-infra-hubble-vs-rpc-layer` top1), extended and skills unchanged in grades, holdout lane
12/26/30, captures 10, passed 25 (1 top-3 loss by count, 0 gains). **Verdict: fails decision 3's
rule on the gates; the hold stays. Same as the lead's verdict.** The known `q-tool-wallets-kit` row
does not change. The removed title paths are the same 8 pages plus 15 `/meetings` and root
pages; 17 existing pages retitled, including `/docs/build/guides/freighter*` to "Varial".

## Step 6: Scout exposure candidate (record only)

Details in [`SCOUT-EXPOSURE.md`](SCOUT-EXPOSURE.md). Removing the `GET /api/quality` entry:
`build-catalog.mjs` exit 0 (no guard failed); the three named test files exit 1 with 3 failures,
all in `test/catalog.test.ts` (`:397` count 31 vs 30, `:656` and `:678` routing-id lists); gate
exit 1 with the allowed SHA line only. Lanes against the held tree: legacy 221/294/328 (1 gain),
extended 93/111/117 (1 loss), skills equal, holdout equal by count, protocol history 5/7/7 (1 loss,
`ph-soroban-auth-audit-history` rank 1 to 2). **Verdict: not equal or better with zero graded
losses; quality stays excluded.** Restored (`git checkout -- src/policy/scout-exposure.ts`),
rebuilt, SHA re-asserted equal to the stamped value, `git status` shows no change in `src/policy`.

## Step 9: consumers (`git grep`, tracked files; QA hits by file path, none opened)

Searched `eval/qa/`, `eval/*cases*.json`, `eval/plan/`, `improvements/`, `src/`, `test/`, `docs/`.

| Term | Hits | Disposition |
|---|---|---|
| Scout versions `1.9.135`, `1.9.150` | only `improvements/stellar-light-scout/sls-033`, `sls-107`, `sls-116`, `sls-117`, `sls-118`, `sls-119` (dated evidence quoting the version) | No edit needed: dated evidence, not live claims |
| `analyzeEcosystem` description text ("version-status distribution", "toolchain") | no hit outside generated files; `toolchain` appears only in `test/fixtures/evidence-pack.mjs` | No edit needed |
| Schema-only op names `hackathonBrief`, `getQualityReport`, `explainRepo`, `getRepoTrust` | name references only: `src/executor/run.ts`, `src/policy/scout-exposure.ts`, `test/catalog-guards.test.mjs`, `test/catalog.test.ts`, `test/corroboration-guard.test.ts`, `test/description-notes.test.mjs`, `test/drift-141-routing.test.ts`, `test/qa-harness-preconditions.test.mjs`, `test/search.test.ts`, `eval/discovery/cases.json`, `eval/plan/build-op-classes.mjs`, `eval/plan/coverage-rules.json`, `eval/qa/cases.json`, `eval/qa/corpus/battery/soroban/q-soroban-deploy-cli.json`, `eval/qa/corpus/battery/tooling-infra/q-ti-rpc-gettransactions-pagination-xdr.json`, `eval/qa/corpus/retired/q-ti-explain-repo-payload-status.json`, `eval/qa/reviewed/2026-09-30-qa-guide-records.md`, `improvements/resolved.json` | No edit needed: names, ids and routing only; the names did not change and the tests run in phase B (`npm test`) |
| New schema terms (`jsSdkStatus`, `sorobanSdkStatus`, `stellarJsDep`, `goneRepos`, `wasLive`, `versionStatus`, `codeVerified`, `byMajor`, `twice-weekly`, ...) | `test/fixtures/evidence-pack.mjs` (synthetic payload, `versionStatus: "unknown"` still in the vocabulary); `improvements/resolved.json`; `eval/qa/cases.json`, `eval/qa/corpus/battery/soroban/q-soroban-cli-bindings.json`, `eval/qa/corpus/battery/tooling-infra/q-tool-indexer-repos-discovery.json`, `eval/qa/reviewed/2026-07-12-live-v3-baseline.md`, `eval/qa/sample.json` | Fixture and improvements: no edit needed. QA files: not opened (could be held-out or reserve); routed to item 1.1 or 1.3 for a golden-truth look at whether the new SDK-status fields touch any case |
| The 8 removed anchor pages | `improvements/stellar-docs/sd-081-contract-restoration-example-obsolete-xdr.md` (9, cites `restore-contract-js`, `restore-data-js`, `submit-transaction-wait-js` as live evidence), `improvements/intake.json` (1, `restore-contract-js.mdx` source file), `improvements/resolved.json` (6, dated rechecks) | `resolved.json` and `intake.json`: no edit needed (dated or source-file names). **sd-081 is `reported-upstream`**; its evidence URLs now describe pages that Docs renamed without the `-js` suffix. Route to item 1.1 for a recurrence probe at the new paths via `improvements-pipeline`; no edit here |
| Removed title paths (`-js`, `-python` guide variants, `/meetings` archive, author and tag pages) | same as the row above; no `eval/qa`, test, `src` or `docs` hit | No edit needed |
| Freighter pages now titled "Varial" (`/docs/build/guides/freighter*`) | `docs/stellar-docs.md:83` (a path prefix in a profile table); `eval/qa/cases.json` (4), `eval/qa/corpus/battery/retail-consumer/q-tool-freighter-wallet.json` (3), `eval/qa/corpus/battery/tooling-infra/q-tool-wallets-comparison.json` (1); `improvements/lumenloop/ll-032`, `improvements/skills/sk-030` (rename findings) | `docs/stellar-docs.md`: no edit needed (the path is unchanged). The titles stay held, so Raven still serves the old titles; the QA files are not opened and are routed to item 1.1 or 1.3 (Docs retitled Freighter to Varial; golden-truth decides). ll-032 and sk-030 are existing rename findings, no edit here |

No golden is edited in this item.

## Step 10: standing drift duties

- **Horizon protocol ceiling.** `curl --get --data-urlencode 'repo=stellar/stellar-horizon'
  --data-urlencode 'q=Which Horizon ingestion constant pins the highest supported protocol
  version, and what is its value?' https://stellarlight.xyz/api/repos/explain`: HTTP 200 (base
  URL from `inventory/stellar-light.json`). `meta.generatedAt` 2026-11-16T22:29:05.405Z;
  `codeVerified.scannedRef` `01ba44a988b3ebc2d68d3cb6747fa2c2733773cd` (scanned
  2026-11-16T18:39:38Z); `answerSource` `stellarlight-code-scan`; `answerAsOf`
  2026-11-16T18:39:38.290Z. Answer: `MaxSupportedProtocolVersion = 30` in
  `internal/ingest/main.go`. Source check with `gh api` at that ref: line 38
  `MaxSupportedProtocolVersion uint32 = 30`. **The answer equals the source value.** The Scout
  curated note still says 29 (verified 2026-10-08 at `430a28e`, where the source does read 29); Scout
  marks that as `sourceCheck.state: conflict` and leads with the scan reading, so the answer is
  correct and the conflict is disclosed. No mismatch to report. Deviation from the TODO's "local
  Raven server" wording: a direct GET of the same public Scout endpoint, no dev server.
- **`npm run eval:protocol-history`**: exit 1, the expected stop. Both
  `protocol-history-routing-v2` and `protocol-history-blind-v2` print `source-expired
  (manifest-sha256, target-scoring-sha256, target-routing-sha256)`, "No protocol-history question
  was scored." Audit result `eval/results/protocol-history-2026-11-16T22-29-12-124Z.json`.

## Final tree (phase A)

`git status`: modified `catalog/manifest.json`, `ecosystem-skills/{INDEX.md,MANIFEST.json,
catalog.json,community.json}`, `eval/gates.json`, `inventory/{stellar-docs,stellar-light}.json`,
`specs/super-spec.json`, `src/adapters/stellar-docs-anchors.json`; untracked: the item folder. Not
touched: `inventory/stellar-docs-titles.json`, `inventory/stellar-org.json`, `micro-map.ts`,
`op-classes.json`, `groups.json`, `src/policy/scout-exposure.ts`, `.agents/TODO.md`, goldens. The
11 gates in step 11, the `PIN-REVIEW.md` attestation and the commit are phase B.

## Deviations and notes for the lead

1. Step 6 test run: three `test/catalog.test.ts` failures (`:397`, `:656`, `:678`), not the two
   the plan named (`:397`, `:403`). `:403` is behind `:397` in the same test and was never reached;
   `:656` and `:678` are routing-id list pins. All by construction.
2. `update.sh` already rebuilt `INDEX.md` in the repo; the plan's separate `build-index.mjs` run
   changed nothing further (21 categorized, 0 uncategorized).
3. `tmp/0.2-final-run.json` is the final-tree gate run (`routing-2026-11-16T22-24-53-662Z.json`)
   and is the `localTrace`. The runner prints holdout-lane per-case rows to its own terminal
   output, so they sit in `tmp/0.2-gate1.log` and were visible in my terminal; nothing from them is
   in any committed file or in this record.
4. The `eval/gates.json` note says the independent review is outstanding. Phase B should update
   that sentence with the reviewer's tier, model, effort and record path, and re-run the gate.
5. Item 0.4 inputs: fresh Docs titles now cost three rows (2 legacy, 1 holdout by count), not the
   `q-tool-wallets-kit` row; `GET /api/quality` ran as a candidate, 1 gain and 2 losses, stays
   excluded.

# Phase B (steps 8, 11, 12)

## Step 8: reconcile and attest

Independent review: Codex frontier, GPT-6 Astra (`gpt-6-astra`), high effort, agentpc `t1qs`,
verdict PASS with zero findings, every skill source PASS including the `cavos-stellar` directory
entry; record [`REVIEW-CODEX.md`](REVIEW-CODEX.md). **No finding to reconcile.** The manifest did
not change, so there was no re-stamp.

- `ecosystem-skills/PIN-REVIEW.md`: one new entry, "2026-11-16", at the top of "Entries". It
  records `openzeppelin-stellar` `sel:66a21fa7d3e1`, `stellar-dev` `sel:5e7b81b76438` and
  `stellar-light` `sel:e9a0fe5ef280` (the digests `update.sh` and `check-pin-review.mjs --digests`
  print), names the reviewer and `REVIEW-CODEX.md`, and states counts and a summary only. No skill
  text. `lumenloop` and `trustless-work` did not move.
- `node scripts/check-pin-review.mjs --base origin/main`: exit 0, "3 selection change(s), all
  recorded".
- `eval/gates.json` note: the "independent review is outstanding" sentence now names Codex
  frontier, GPT-6 Astra, high effort, PASS with zero findings, the `REVIEW-CODEX.md` path and that
  it matched 544 of 544 rows. Only that sentence changed (3 insertions, 3 deletions in the file
  against `HEAD`, the same as the re-stamp).

## Step 11: gates (each run bare, output in `tmp/0.2-g-*.log`)

| Gate | Exit | Summary |
|---|---|---|
| `npm run typecheck` | 0 | clean after `npm run typegen` (see the note below) |
| `npm test` | 0 | 164 files passed, 5 skipped; 3608 tests passed, 3 expected fail, 5 skipped |
| `npm run build` | 0 | bundle builds (`--dry-run`) |
| `npm run eval:routing -- --gate` | 0 | GATE PASS, committed evidence verified; local trace `routing-2026-11-16T22-24-53-662Z.json` |
| `npm run eval:selftest` | 0 | "self-test: all checks passed" |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 | 0 errors, 98 warnings (no error; the lint run did not read or print any held-out case into this record) |
| `npm run eval:qa:register -- --check` | 0 | "up to date" |
| `node scripts/check-mirrors.mjs --fetch` | 0 | 67 pinned files fetched upstream and verified, "mirror checks ok" |
| `node scripts/check-pin-review.mjs --base origin/main` | 0 | 3 selection changes, all recorded |
| `npm run secrets:scan -- --tree` | 0 | "clean — scanned all tracked files" |
| `git diff --check` | 0 | clean |

Note on the first `npm run typecheck`: it exited 1 with 77 `TS2339`/`TS2344` errors, all "property
missing on type `Env`" (for example `OAUTH_KV`, `MCP_SERVER_SECRET`). The worktree had no
`env.d.ts` (gitignored, generated). That is the failure `AGENTS.md` describes for a fresh clone,
not a regression. `npm run typegen` (exit 0, `.dev.vars` already present) generated it, and the
rerun exited 0. `npm test` exited 0 both before and after. `npm run test:smoke` is not required
(no `src/executor` or `src/demo` change). The stamped manifest SHA-256 is still
`8bbfb864eb37988d968d56a18b7a10291e31fda4f5eb25f3d25d82cc0642fc38` after all gates.

## Step 12: commit

One commit on `np/0.2-absorb-drift-223`, normal hooks (pre-commit secrets scan), no `--no-verify`,
not pushed. Content: the generated files in the plan's list, `eval/gates.json` evidence,
`ecosystem-skills/PIN-REVIEW.md`, and the item folder (`PLAN.md`, `REVIEW.md`, `REVIEW-CODEX.md`,
`EXEC.md`, `TITLES-AB.md`, `SCOUT-EXPOSURE.md`, `briefs/`). Nothing from `tmp/`. The commit hash
is in the report message.
