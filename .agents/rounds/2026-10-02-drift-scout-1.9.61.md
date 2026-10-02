# Live drift: Scout 1.9.61, with the Stellar Docs title vocabulary held — 2026-10-02

Issue #215, filed by the 06:48Z refresh run. Lead `raven-next` (Claude Fable 5.1, pane `w3W:p2`).
Base `origin/main` `38aa07fc`. Runbook: `.agents/skills/live-drift-resolution/SKILL.md`.
Independent reviewer: `rev-astra-drift` (Codex frontier, `gpt-6-astra`, high, pane `w3W:p1F`).

## Outcome in one paragraph

Scout 1.9.61 and the stellarlight catalog snapshot are absorbed. The Stellar Docs title snapshot is
**held** at its 2026-09-29 state: absorbing it made short agent-cli guide titles rescue two docs
operations into the gated tier on generic words, and the review measured four discovery regressions
from that. Against `main`, the final candidate changes no graded routing result; only the manifest
fingerprint re-baselines. Two findings gained dated rechecks, three `TODO.md` items record the
follow-up repairs, and #215 stays open for the title vocabulary until the keyword derivation is fixed.

## Regeneration (Step 1)

Run in order in a clean worktree at 14:20Z: `refresh-inventory.mjs`, `build-catalog.mjs`,
`micro-map:build`, `spec:build`, `build-op-classes.mjs`, then `ecosystem-skills/update.sh` for the
stellarlight catalog snapshot, then the catalog chain again. `inventory/lumenloop.json` and
`inventory/stellar-docs.json` were unchanged. After the review, `inventory/stellar-docs-titles.json`
was restored to `origin/main` and the chain ran again.

## Classification (Step 2)

`node scripts/diff-inventory.mjs <mode> HEAD:inventory/stellar-light.json inventory/stellar-light.json`:

| mode | result |
| --- | --- |
| `surface` | empty, exit 0: no operation added, removed, or renamed (38 paths before and after; the reviewer confirmed the path·method set and operation IDs) |
| `text` | exit 1: `scout.listSkills` and `scout.getSkill` descriptions changed; no summary, operationId, or `x-routing` change |
| `deep` | exit 1: paths and components differ |

Scout API version `1.9.54` → `1.9.61`. Every changed operation object, from the reviewer's full diff:

| operation | change |
| --- | --- |
| `scout.listSkills` | description names both sections of skills.stellar.org (`source=sdf`, `source=community`, "listed but not reviewed by SDF"), curated entries, approved submissions, and `meta.registry`; response adds `meta.registry` |
| `scout.getSkill` | description: raw `SKILL.md` content for every registry entry, not only SDF skills |
| `scout.searchResearch` | parameters: revised `source` description; new `sources` (array, form, `explode: false`) and `perSource` (default 8, max 25); responses add source metadata (`sourceEmpty`, `sourceDocCount`, `resultsHash`, `bySource`, `sourceAdvisory`), response headers, and 400/429/503 contracts |
| `scout.getChangelog`, `scout.getRfps` | response adds a `meta.warnings` schema |
| `scout.listAudits`, `scout.getChanges`, `scout.getStablecoins` | revised 400 description |

Changed components: `Meta` (revised `warnings.description`), `Skill` (new `registry`; revised
`source`, `install`, `rawUrl`, `argumentHint`, `userInvocable`), new `RequestError` (400 with
`error` and optional `hint`), new `RetryableError` (`error`, `retryAfterSeconds`, `advisory`).
`RetryableError` is referenced by `GET /api/research` for 429 and 503; `GET /api/hackathon-brief`
has description-only 400, 429, and 503 entries and is otherwise unchanged. Every Scout entry's
`provenance` moved with the version, and several `outputSchema` fields moved with the components.

Skills mirror: all five pins unchanged (`check-mirrors.mjs --fetch` → 66 files verified;
`check-pin-review.mjs` → no selection moved). The stellarlight catalog snapshot grew 43 → 62
entries: 19 `community` entries added, none removed; eight SDF entries changed install command and
repository metadata. `community.json` changed only `fetched_at`; `MANIFEST.json` only `synced_at`.

Class: **routing-relevant text plus model-visible schema**, no operation-surface change. Not
runner-affecting: the only runner declares three Lumenloop operations and
`inventory/lumenloop.json` is unchanged (reviewer: intersection empty).

Exposure (Step 3): no decision needed. `build-catalog.mjs` prints the same exclusions as `main`
(the paid Lumenloop research trio and eight Scout path·method pairs). 282 IDs and 60 operations
before and after; the ID sets are equal (reviewer).

## The held title vocabulary

The live Stellar Docs title snapshot grew 651 → 666 rows (563 → 575 distinct titles). Fourteen new
paths sit under `/docs/tools/cli/agent-cli` ("Stellar CLI for Agents", "Build and submit
transactions", "Check balances and metadata", "Delegate spending", "Pay for APIs with x402", "Send
tokens", "Sign messages", "USDT0 on mainnet", "Output and errors", "Skills", "Authority & Security
Model", and others); one is "Replay a ledger to collect its LedgerCloseMeta". Nothing was removed.

`scripts/build-catalog.mjs` `stellarDocsTitleExtras` turns those titles into `keywords` on
`stellarDocs.search_sdk_cli_tools_docs` (71 → 88 keywords) and `search_soroban_contract_docs`
(166 → 184), including `agents`, `pay`, `apis`, `x402`, `messages`, `usdt0`, `skills`, `output`,
`model`, `authority`, `security`, `spending`. `scoring.ts` `scoreWithKeywords` rescues an entry into
the gated tier on two keyword matches. The reviewer measured the result with in-memory ablations:

| query | 2026-09-29 titles | with the new titles | cause |
| --- | --- | --- | --- |
| "How do x402, MPP, AP2, and ACP compare…" (legacy row, expected `stellarDocs`) | `stellarDocs.search_docs` rank 3, score 326, backfill | `search_docs` out of the first five; `search_sdk_cli_tools_docs` rank 5, score 130, gated | removing the new `x402` keywords alone, or the new `pay` keywords alone, restores the order |
| "Stellar skills for signing messages" | `scout.listSkills` rank 3 (166) above sdk/cli docs (144) | docs rank 3 (168), `listSkills` rank 4 | new `skills` or `messages` keywords |
| "Stellar skills for security auditing" | `listSkills` rank 3 (166) above docs (153) | docs rank 3 (168), `listSkills` rank 4 | new `skills` keyword |
| "Stellar authority skills" | `listSkills` rank 3 (135) | sdk/cli docs rank 3, soroban docs rank 4, `listSkills` rank 5 | the new docs keyword sets |

The first row moved the legacy top-3 count 298 → 297. The lead first re-baselined that as a title
side effect; the reviewer rejected it (Step 4 requires an intended improvement, not an explained
loss) and CI's `eval:selftest` separately rejected a band center that differed from the accepted
total. Decision: hold `inventory/stellar-docs-titles.json` at `origin/main` and repair the
derivation first (`TODO.md`, Routing: "Keep docs page-title keywords from rescuing docs operations
on generic words"). The daily drift check will report the title snapshot until that item lands.

## Routing gate (Step 4)

Final candidate against the accepted baseline, `npm run eval:compile && npm run eval:routing -- --gate`:

| lane | accepted | final candidate |
| --- | --- | --- |
| legacy (338) | 219 / 298 / 326, card 112/182 | 219 / 298 / 326, card 112/182 |
| skills (23) | 17 / 23 / 23 | 17 / 23 / 23 |
| holdout (49) | 12 / 26 / 29, forbidden 10, passed 24 | 12 / 26 / 29, forbidden 10, passed 24 |
| extended (122, diagnostic) | 93 / 111 / 117 | 93 / 111 / 117 |

Against the `main` trace of the same day, 10 of 544 rows change a hit or a score within the first
five results and **no graded result changes**. The gate failed only on the manifest fingerprint.
`eval/gates.json` now carries the new manifest SHA-256
(`15a4fe9fe4c5f741…`, full value in the file), `baselinedAt` 2026-10-02T14:54:41.955Z, the local
trace name, and a dated note. **Every threshold and accepted total is unchanged.** `eval:selftest`
passes and the gate prints `GATE PASS`.

One discovery probe outside the gate still moves with the mirrored Scout wording: "Are there any
model context protocol skills for Stellar?" lists `scout.listSkills` at rank 3 (195) on `main` and
not in the first five on the candidate (`scout.getSkill` at 141 appears). Restoring the old
`listSkills` description restores the rank; the docs keywords are not the cause. General discovery
probes ("What Stellar AI skills can I install?", "List Stellar skills", "What community skills are
listed on skills.stellar.org?") are unchanged or improve (`listSkills` 391 → 401 on the last).
Recorded as a `TODO.md` diagnostic; the upstream description is mirrored, not edited.

### A catalog note was tried and withdrawn

Review finding 3: the new `source` parameter description says a comma in `source` is read like
`sources`, but Raven validates `source` against a single-value enum, so `source: "cap,sep"` fails
with "must be one of" before the adapter runs, while `sources: ["cap", "sep"]` works (live probe
14:30:24Z and the reviewer's adapter probe 14:37:28Z: four results, two per source). The lead
appended a catalog note to `scout.searchResearch` pointing callers at `sources`. Two wordings were
measured; each moved 12 graded routing rows (the note's tokens raised `searchResearch` scores
broadly: +1 legacy top-1, +7 card hits, −2 extended top-1). The note was withdrawn; the gap is
recorded as a `TODO.md` item under Adapters.

## Impact audit (Step 1b)

- **Runtime source.** `src/adapters/scout.ts` joins array parameters with `,`, which matches the
  new `sources` wire form (`style: form`, `explode: false`). `src/policy/validate.ts` rejects a
  string `sources`, invalid members, `perSource` 26, and fractional `perSource` (reviewer). No
  adapter change.
- **Golden and eval files.** No battery case, plan rule, or test quotes the old descriptions or
  passes `source` to `searchResearch`. The skill-discovery goldens already require live rows and
  date their counts (reviewer). No golden change.
- **Improvements.** `sls-089`: `GET /api/projects/search` still declares only a 200 response; the
  new `RetryableError` is declared on `/api/research` (429, 503) and described on
  `/api/hackathon-brief`; the contract gap persists and runtime recurrence was not re-tested; status
  unchanged, dated line added. `sk-027`: the pinned Scout skill is unchanged upstream, so the finding
  still reproduces; its present-tense count is corrected (62 entries, five sources, eight SDF) with a
  dated recheck. `sk-028`: unchanged (live builders now 252; the finding keeps its dated 226 and 233).
  The `community` entries the catalog now lists match the item closed by #203.
- **Docs and runbooks.** `eval/README.md` names the committed Scout version; updated to `1.9.61`.
  `.agents/TODO.md` routing item named `1.9.54` as the accepted source; updated. No skill or runbook
  quotes the changed descriptions.
- **Upstream issue state.** `Stellar-Light/stellarlight#1751` (`sls-089`) is open with no comment.

## Hand edits

`eval/gates.json` (fingerprint, `baselinedAt`, `localTrace`, note), `eval/README.md` (one
version string), `.agents/TODO.md` (one version string, three new items),
`improvements/stellar-light-scout/sls-089-…md` and `improvements/skills/sk-027-…md` (dated recheck
lines) with the regenerated `improvements/INDEX.md`, the review brief, and this ledger. Everything
else is generated. `inventory/stellar-docs-titles.json` equals `origin/main`.

## Review (Step 6)

`rev-astra-drift` reviewed `c4d60eb1` (the first candidate, with the titles absorbed and the
band center at 297): **not safe**, five findings (`review-drift-astra.md` in this round directory).

| finding | disposition |
| --- | --- |
| 1. The re-baseline accepted a regression (298 → 297) without an intended improvement | fixed: the title snapshot is held; totals and thresholds are unchanged; only the fingerprint moves |
| 2. The new title keywords displace `scout.listSkills` on three probes; the new `listSkills` description loses a fourth | fixed for the three title cases by the hold (probe table above); the fourth is recorded as a `TODO.md` diagnostic because the text is mirrored upstream wording |
| 3. The generated `source` description advertises a comma alias Raven rejects | recorded as a `TODO.md` item after two measured note wordings each moved 12 graded rows; the array form works and the validation error names the allowed values |
| 4. The `sls-089` recheck misattributed `RetryableError` to `/api/hackathon-brief` and overstated recurrence | fixed: the line names `/api/research` (429, 503), the description-only entries on `/api/hackathon-brief`, and says runtime recurrence was not re-tested |
| 5. `sk-027` still said the live catalog had 43 entries | fixed: 62 entries, five sources, dated recheck; the finding stays open |

Ledger corrections the reviewer asked for: "within the first five results" (not "below rank 5");
the new titles are "Delegate spending" and "USDT0 on mainnet" (not "Delegate Auth" or "USDT0
Transfers with LayerZero", which already existed); the full operation and component tables above
replace the shorter list.

Verification pass: (pending)

## Gates (Step 5)

- `node scripts/build-catalog.mjs` → exit 0, expected exclusions printed.
- `npm run eval:selftest` → pass; `npm run eval:routing -- --gate` → `GATE PASS`.
- `check-mirrors.mjs --fetch` → ok; `check-pin-review.mjs --base origin/main` → no move;
  `check-skills-drift.mjs` → every source `ok`, catalog 62 = 62.
- `npm run improvements:lint` → ok (66 findings); `-- --live` → see receipt.
- `npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke`,
  `npm run secrets:scan -- --tree`, `eval:qa:register -- --check`, `git diff --check`: see receipt.

## Receipt (Steps 7 and 8)

(pending)
