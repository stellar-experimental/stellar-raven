# Deletion review — `sd-001`, `sd-036`, `sk-020`

- Round: `.agents/rounds/2026-09-01-free-improvements-maintenance.md`, deletion-review lane.
- Reviewer: Claude Opus 5, effort high, pane `w1H:p3`. Author of the three findings and of the
  round orchestration is a different agent, so the distinct-reviewer bar is met.
- Method: read `AGENTS.md`, `.agents/skills/improvements-pipeline/SKILL.md`, `improvements/README.md`,
  and each finding in full. Every upstream ref, deployed source, and trigger below was executed
  fresh by this lane. No other agent's report was read; `terra-evidence.md` in this directory was
  left unopened.
- Writes: this file only. No comment was posted. No finding, intake entry, golden, generated file,
  or ledger was modified.
- Working-tree note: a concurrent lane modified `improvements/INDEX.md`,
  `improvements/stellar-docs/sd-047-*.md`, and
  `improvements/stellar-light-scout/sls-080-*.md` during this review. `npm run improvements:lint`
  failed once mid-review on a transient stale index and passed afterwards
  (`improvements lint ok (69 findings)`). Run the resolver only after that lane settles, because
  the resolver regenerates `INDEX.md`.

## Verdicts

| finding | verdict | one-line reason |
|---|---|---|
| `sd-001` | **PASS** | The crawler defect is fixed and now proven on a settled full reindex; two blockers from the 2026-08-25 DO-NOT-RETIRE are gone. Retire after the repo-side reference cleanup listed below. |
| `sd-036` | **SUCCESSOR** | The named `field` selector and protocol-version errata are fixed, but the same interface block still carries an S-box-degree line that contradicts the CAP's own normative text and the shipped ABI. |
| `sk-020` | **PASS** | Upstream fixed on all three affected lines, the re-pin is deployed, and production `skill.read` returns `stellardev`. No residual anywhere in the four pinned skill trees. |

---

## `sd-001` — crawler dropped `/docs/networks/software-versions`

### Prior blocker state

The 2026-08-25 distinct review returned DO-NOT-RETIRE for three reasons. Each is re-derived here.

**Blocker 2 (mixed index state) — cleared.** This was the strongest objection: only the target URL
had been recrawled, so the no-regression evidence was a sample. A full reindex has since run.
Read-only `GET https://crawler.algolia.com/api/1/crawlers/79c5d36e-ce6e-4ec3-bed3-04a30818122d`
on 2026-09-01 returns:

```
"running": true, "reindexing": false,
"lastReindexStartedAt": "2026-09-01T12:00:01.677Z",
"lastReindexEndedAt":   "2026-09-01T12:04:05.299Z"
```

`GET /api/1/crawlers/{id}/stats/urls` returns 854 URLs in four buckets: 660 `DONE/success`,
178 `http_not_found`, 10 `unmatched_file_type`, 6 `http_redirect_invalid`. **No
`extracted_too_many_records` bucket exists.** The whole corpus was re-extracted under the patched
extractor and no page is dropped for the over-cap reason. Both indexes now report 14,761 entries
with `updatedAt 2026-09-01T12:04:00.150Z` (2026-08-28 recorded 14,759), and `docs_replica_agent`
is a replica of the primary with the same count and stamp.

**Blocker 3 (repo cleanup had not run) — this round's work.** Listed under "Persistent references".

**Blocker 1 (original trigger still fails) — no longer blocking, with a caveat.** The finding's own
trigger is the docs-search behavior for protocol-version queries. Freshly executed against
`crawler_Stellar Docs - Docusaurus` and `docs_replica_agent`, docs facet, at
`2026-09-01T18:26:25Z`:

| query | primary | replica | rank-1 URL |
|---|---|---|---|
| `Protocol 22` | #1 | #1 | `…/software-versions#protocol-22-mainnet-december-5-2024` |
| `Protocol 23` | #1 | #1 | `…/software-versions#whisk-protocol-23-mainnet-september-3-2025` |
| `Protocol 24` | #1 | #1 | `…/software-versions#protocol-24-mainnet-october-22-2025` |
| `Protocol 24 release` | #1 | #1 | `…/software-versions#release-notes-7` |
| `Protocol 25` | #1 | — | `…/software-versions#protocol-25-mainnet-january-22-2026` |
| `Protocol 26` | #1 | — | `…/software-versions#protocol-26-mainnet-may-6-2026` |
| `Protocol 27` | #1 | #1 | `…/software-versions#protocol-27-mainnet-july-8-2026` |
| `Protocol 28` | #1 | — | `…/software-versions#protocol-28-testnet-tbd` |
| `software versions` | #1 | #1 | `…/docs/networks/software-versions` |

The 2026-07-03 defect (page absent from the index; `Protocol 24` returning SEP-24 anchor pages) does
not reproduce anywhere in Protocol 20-28. The eval case `q-protocol-24-whisk-incident` does still
fail, but its missing facts are a Raven routing gap, not a docs gap: freshly re-run, no docs-lane
query reaches them.

```
"CAP-0076 eviction defect fee pool"            -> sep31/integration, ledgers#fee-pool, lumens#dashboard-api
"Whisk eviction defect 478 84 77 394"          -> check-auth-tutorials#test-cases, …#complete-code-1
"state archival eviction incident remediation" -> state-archival#examples, choosing-the-right-storage
```

That gap already has an own-repo home: `.agents/TODO.md` → "Routing → `search` does not surface the
research lane for protocol-history questions", which records that `scout.searchResearch` holds
478 / 84 / 77 / 394, `CAP-0076`, Hot Archive, and the 31,879,035-stroop remediation. Per
`improvements/README.md`, own-repo fixes belong in that queue, not in a finding. Holding an upstream
record open for a Raven ranking defect would make `improvements/` an archive, which the charter
forbids.

### Collateral controls, re-run fresh

| control | primary | replica |
|---|---|---|
| `stellar cli install command` | **#1** `…/install-cli#stellar-cli` | #5 (top = `…/example-contracts/deployer#run-the-contract`) |
| `brew install stellar-cli` | #1 | #1 |
| `publish event contract events` | #1 | #1 |
| `fee bump transaction inner outer envelope` | #1 | #1 |

The replica difference is **not** a regression from this fix. Query rules are not shared with
replicas, and `npm run eval:algolia-raven` on the same day scores
`sd-006-cli-install-intent` at primary+rules **#1** and primary rules-disabled **#5** — the identical
rank the replica returns. The replica is behaving as the rules-disabled control. Raven queries the
primary only (`catalog/manifest.json` pins `"index": "crawler_Stellar Docs - Docusaurus"` on all 12
docs operations; `scripts/refresh-inventory.mjs:58` uses the same name), so the load-bearing
`raven-promote-stellar-cli-install` rule is intact on the surface Raven serves.

### Residuals, re-checked

| recorded residual | state on 2026-09-01 |
|---|---|
| `Protocol 27` returns the page at rank 4 | **resolved** — now rank 1 |
| bare version number matches a `/meetings/YYYY/MM/DD` fragment | **partly resolved** — `Protocol 23 release` now returns five `software-versions` anchors in the docs lane; the collision survives only in the meetings lane (`/meetings/2026/07/23#the-privacy-stack`) |
| natural-language phrasing misses | **persists** — `what is in Protocol 23` returns `…/build/guides/archival/restore-data-js`, page absent |
| coarse fallback loses table-cell strings | **persists** — `Poseidon Rust SDK` returns `…/build/apps/zk#resources-1`, page absent |
| `Protocol 24 Whisk state archival` displacement | **persists as recorded** — `/meetings/2025/10/16` absent from the docs lane top 20 in both indexes; rank **#1** in the meetings lane (`/meetings/2025/10/16#protocol-discussion`) |

No successor finding is warranted. The two persisting residuals are the accepted, documented
trade-off of a general fix (the 750-record cap is an Algolia platform limit with no configuration
lever) and generic natural-language ranking quality with no concrete owner-facing correction. The
displacement is a deliberate, recorded outcome, and the recovery path the finding named from the
start still works.

### Persistent references — `rg -n "sd-001" .`

| location | classification | action |
|---|---|---|
| `scripts/eval-algolia-raven.mjs:21-27` case `sd-001-protocol-24` | **rewrite — precondition** | The case asserts `/meetings/2025/10/16` + `Whisk`/`state`/`archival` for query `Protocol 24`. Live today it is `miss` on all four strategies. The fix deliberately displaced that target, so the case now reports a permanent failure attributed to a finding that will no longer exist. Convert it to a monitor-only canary asserting `/docs/networks/software-versions` at rank 1, following the `sd-006` precedent that `improvements/README.md` already cites for retaining a canary after retirement. |
| `improvements/README.md:141` | **rewrite** | Reads "Search-mechanism gaps … (`sd-001`, `sd-003`; resolved precedent `sd-006` is in `resolved.json`)". Move `sd-001` next to `sd-006` as a resolved precedent; `sd-003` stays as the live example. Not lint-enforced — the same file already cites retired `sd-007` / `sd-008` — but leaving it implies an active record. |
| `improvements/intake.json:111` override | **remove — automatic** | The resolver deletes the per-finding override itself. |
| `improvements/INDEX.md:38` | **regenerate — automatic** | |
| `research/services/stellar-docs-algolia.md:28,99` | **historical retention** | Dated research narrating the applied crawler change. `research/` is evidence, not an instruction layer. Leave it. |
| `.agents/rounds/2026-08-28-improvements-hygiene.md`, `.agents/rounds/2026-09-01-remaining-work-adversarial-audit*/…`, `research/audits/2026-08-29-*/…` | **historical retention** | Dated round and audit records. Leave them. |
| `test/improvements-file-issue.test.ts:567` | **retain — unrelated** | `escapesRepo("..hidden/sd-001.md")` is a path-traversal fixture string, not a reference to the finding. |
| `.agents/TODO.md:49`, `.agents/NEXT.md:104`, this round ledger | **round bookkeeping** | Close at round closeout, not by the resolver. |

Goldens: no golden case references `sd-001`. `q-protocol-24-whisk-incident` cites blog and
`cap-0076.md` sources and its `truth.verified.rootCause` names eval-side compression plus a
`.agents/TODO.md` entry — nothing to reconcile.

Probes: the finding has no `probe` frontmatter, so `npm run improvements:probes` is unaffected.

### Resolution comment

`sd-001` contains **no** GitHub issue or PR URL. The resolver harvests `upstreamRefs: []`, so
`--upstream-comment-na` is required and correct: the defect was fixed by direct Algolia crawler
remediation, never filed. `improvements/README.md` explicitly permits `fixed-upstream` without an
issue URL when the evidence records a dated recheck.

### Safe resolver inputs

Preconditions: rewrite the harness case and the README line, and let the concurrent lane's
`INDEX.md` edits settle.

```sh
npm run improvements:resolve -- \
  --file improvements/stellar-docs/sd-001-protocol-n-vs-sep-n-tokenization.md \
  --resolved 2026-09-01 \
  --live-recheck "2026-09-01T18:26:25Z live Algolia recheck on the settled index: full reindex 2026-09-01T12:00:01.677Z-12:04:05.299Z (crawler 79c5d36e, stats/urls shows 660 DONE and no extracted_too_many_records bucket); both crawler_Stellar Docs - Docusaurus and docs_replica_agent hold 14,761 entries at updatedAt 2026-09-01T12:04:00.150Z; Protocol 22/23/24/24 release/25/26/27/28 and 'software versions' each rank a /docs/networks/software-versions anchor #1 in both indexes; controls 'brew install stellar-cli', 'publish event contract events', 'fee bump transaction inner outer envelope' hold #1 in both and 'stellar cli install command' holds #1 on the primary Raven queries; residual natural-language and table-cell misses persist as the recorded accepted trade-off" \
  --review-evidence "Distinct reviewer Opus 5 high (pane w1H:p3), 2026-09-01: re-derived the fix without the author transcript; cleared the 2026-08-25 DO-NOT-RETIRE blockers 2 (settled full reindex) and 3 (reference cleanup); confirmed blocker 1 is the own-repo routing gap already tracked in .agents/TODO.md and not an upstream defect; verified the replica's rank-5 install-cli result equals the primary rules-disabled control and Raven serves the primary index only; scanned residuals and found no successor warranted" \
  --references-reviewed --upstream-comment-na --dry-run
```

Repo resolves from the intake override to `stellar/stellar-docs` with no `--repo` needed. Source
commit pins to `5e23340be0da63630f86e662f010219cf0458eef`, which is public on
`stellar-experimental/stellar-raven`. Drop `--dry-run` once the two rewrites are in place.

---

## `sd-036` — CAP-0075 protocol-version and field-selector errata

### The named defect is fixed

Fresh source recheck of `stellar/stellar-protocol` `core/cap-0075.md` on `main`, 2026-09-01:

- Both interface blocks now read `{ "name": "field", "type": "Symbol" }` (lines 52 and 69).
- Both `docs` strings document `` `BLS12_381` or `BN254` `` (lines 61, 78).
- Both blocks keep `"min_supported_protocol": 25` (lines 62, 79).
- A new Semantics subsection states "The `field` parameter is a `Symbol` that selects the scalar
  field" (line 112).
- The preamble carries `Status: Final`, `Protocol version: 25`. No `Protocol 24` string remains.
- The description now reads "permutation primitives … allowing developers to construct hash
  functions", which satisfies the finding's third recommendation.

Shipped ABI cross-check, `stellar/rs-soroban-env` `main` `soroban-env-common/env.json` lines
2696-2726: `poseidon_permutation` and `poseidon2_permutation` both declare
`{ "name": "field", "type": "Symbol" }` with `"min_supported_protocol": 25`. CAP and ABI now agree.

Upstream refs, read back fresh:

- `https://github.com/stellar/stellar-protocol/issues/1980` — closed, `state_reason: completed`,
  `closed_at 2026-08-20T16:31:15Z`, opened by `kalepail` (Raven's filing). Two comments, both from
  others: `leighmcculloch` 2026-07-15 author notification, `github-actions[bot]` 2026-08-14 stale
  notice. No Raven resolution comment is present.
- `https://github.com/stellar/stellar-protocol/pull/1996` — merged 2026-08-20T16:31:14Z, merge
  commit `d186cf3187722ebcdbd647e782449e543f9d0ef3`, author `JFWooten4`, title
  "📝 Correct CAP-0075 interface errata". Third-party contributor, not Raven.

### Residual in the same interface block — the reason for SUCCESSOR

PR #1996 corrected the prose but left one line in the JSON interface block. In current
`core/cap-0075.md`:

- line 78, `poseidon2_permutation` `docs`: `` `d`: S-box degree (3, 5, 7, or 11) ``
- line 124, Semantics: "`d`: S-box degree. The S-box is defined as S(x) = x^d. **Only d=5 is
  supported**, which is the standard choice for both BLS12-381 and BN254."
- line 163, Error Conditions: "The host function will trap if … `d` is not 5"

The interface block contradicts the same CAP's own normative text two sections later. It also
contradicts the shipped ABI: `env.json` line 2725 reads
`d: S-box degree (5 for BLS12_381/BN254)`, and the host enforces it —
`soroban-env-host/src/crypto/poseidon/mod.rs:19` declares
`pub(crate) const SUPPORTED_SBOX_DEGREES: [u32; 1] = [5];`, checked by both
`poseidon_params.rs:32` and `poseidon2_params.rs:32`, which return `INVALID_INPUT`
"Poseidon2: unsupported s-box degree" for anything else. A contract author following the CAP's
interface block with `d = 3` gets a trap.

This is the same class the finding owns — a CAP-0075 interface block disagreeing with the shipped
ABI — but it is a distinct claim that `sd-036` never asserted, and PR #1996 was the change that made
it self-contradictory. Per the charter, that is a successor, not a stretch of the old record.
Dedupe is clean: `search/issues repo:stellar/stellar-protocol cap-0075` returns only #1875, #1980,
and #1996, all closed; a `"S-box"` search over the repo returns nothing related.

Lower-confidence adjacent observation, **not** part of the successor claim: the CAP states Poseidon2
supports `t` in {2, 3, 4, 8, 12, 16, 20, 24}, while `poseidon2.rs` accepts `t == 2`, `t == 3`, or any
`t` divisible by 4. Verify against the authors' intent before asserting a divergence.

### Persistent references — `rg -n "sd-036" .`

| location | classification | action |
|---|---|---|
| `eval/qa/corpus/battery/protocol-core/q-protocol-bn254-poseidon-xray.json` | **rewrite — precondition, `golden-truth` lane** | Three coupled staleness points, all now factually wrong: (1) `golden.answer` says "CAP-0075 says `U32Val` field selector and contains one stray P24 sentence"; (2) `golden.avoid` warns against choosing "the CAP's stale U32Val interface"; (3) `golden.notes` caps grading at partial "while … `sd-036` still shows `U32Val`". `truth.verified.rootCause` also cites the finding path, which dangles after deletion. `eval/qa/lint-corpus.mjs:531` pairs an `improvements/` rootCause with a symmetric caution in `golden.notes`, so the caution and the rootCause must be edited together. Point rootCause at the `resolved.json` receipt and the successor. |
| `eval/qa/cases.json:29576,29662,29666-29668,29677` | **regenerate** | Generated; rebuild with `npm run eval:qa:compile` after the case edit. Never hand-edit. |
| `improvements/intake.json:155` override | **remove — automatic** | |
| `improvements/INDEX.md:49` | **regenerate — automatic** | |
| `research/audits/2026-07-11-gt31-protocol-caps-reserves.md:88,113,137,171` | **historical retention** | The dated GT-31 audit that produced the finding. |
| `research/audits/2026-08-29-temp-artifact-reconciliation/{fable,sol}-review.md` | **historical retention** | Dated review records; the `>`-prefix note about `INDEX.md` is a separate own-repo generator nit. |
| `.agents/rounds/2026-08-28-improvements-hygiene.md`, `2026-09-01-*` | **historical retention** | |
| `.agents/TODO.md:49`, `.agents/NEXT.md:104` | **round bookkeeping** | |

Probes: no `probe` frontmatter.

### Resolution comment

Required — the resolver harvests two refs and will demand `--upstream-commented`:

```
https://github.com/stellar/stellar-protocol/issues/1980
https://github.com/stellar/stellar-protocol/pull/1996
```

Post the resolver-printed comment on **issue #1980 only**, and add the successor link to it. That
matches the `sls-074` / `sls-075` / `sls-076` receipts, each of which lists an issue and a PR in
`upstreamRefs` but records one comment URL on the issue. #1996 is a third-party contributor's merged
PR; a retirement notice there is noise under the quiet-by-default rule. Record in
`--review-evidence` which ref received the comment and why the PR did not. Read the posted comment
back from GitHub before dropping `--dry-run`.

### Safe resolver inputs

Preconditions, in order: file the successor `sd-048` (next id — active max `sd-047`, resolved max
`sd-038`), land the `golden-truth` edit to `q-protocol-bn254-poseidon-xray.json` plus
`npm run eval:qa:compile`, then post the comment on #1980 with the successor link.

```sh
npm run improvements:resolve -- \
  --file improvements/stellar-docs/sd-036-cap-0075-protocol-version-field-selector-errata.md \
  --resolved 2026-09-01 \
  --resolving-ref https://github.com/stellar/stellar-protocol/pull/1996 \
  --live-recheck "2026-09-01 source recheck of stellar/stellar-protocol core/cap-0075.md on main: both interface blocks declare field: Symbol (lines 52, 69), both docs strings name BLS12_381/BN254, both keep min_supported_protocol 25, no Protocol 24 string remains, and Semantics states the field parameter is a Symbol; cross-checked against stellar/rs-soroban-env main soroban-env-common/env.json lines 2696-2726 where both permutations declare field: Symbol at min_supported_protocol 25. Issue 1980 closed completed 2026-08-20T16:31:15Z by merged PR 1996 (merge commit d186cf3187722ebcdbd647e782449e543f9d0ef3). Residual S-box-degree erratum in the same block carried to successor sd-048." \
  --review-evidence "Distinct reviewer Opus 5 high (pane w1H:p3), 2026-09-01: independently fetched the CAP and env.json rather than using the author transcript; read issue 1980 and PR 1996 back from GitHub and confirmed both comments on 1980 are third-party; found a residual the PR left behind (poseidon2 docs line 78 still says S-box degree 3, 5, 7, or 11 against the CAP's own 'Only d=5 is supported' at line 124 and SUPPORTED_SBOX_DEGREES = [5] in soroban-env-host/src/crypto/poseidon/mod.rs:19) and filed it as self-contained successor sd-048; reconciled the q-protocol-bn254-poseidon-xray golden and its compiled corpus; resolution comment posted on issue 1980 only, not on third-party PR 1996" \
  --references-reviewed --upstream-commented --dry-run
```

Repo resolves from the intake override to `stellar/stellar-protocol`. Source commit pins to
`5e23340be0da63630f86e662f010219cf0458eef` (public). If the successor is not filed this round, the
verdict stands at SUCCESSOR and `sd-036` stays in the active queue.

---

## `sk-020` — stale Discord vanity code in the `standards` skill

### Upstream, re-derived

- `https://github.com/stellar/stellar-dev-skill/issues/113` — closed, `state_reason: completed`,
  `closed_at 2026-08-25T20:41:23Z`, opened by `kalepail`, 4 comments.
- `https://github.com/stellar/stellar-dev-skill/pull/114` — merged 2026-08-25T20:41:22Z, merge
  commit `db82b5dec15be462745f6f0da8a0f7779b2cb748`, author `kaankacar`.
- `https://github.com/stellar/ecosystem-resources/issues/9` — **now closed, `completed`**, updated
  2026-08-26T10:00:12Z. The finding still describes it as "still open"; that text is stale, and the
  file is being deleted, so no correction is needed in place.

Current default branches, fetched raw:

```
stellar/stellar-dev-skill  main  skills/standards/resources.md:233
  - [Stellar Developers Discord](https://discord.gg/stellardev)
stellar/stellar-dev-skill  main  README.md:126
  - [Stellar Discord](https://discord.gg/stellardev)
stellar/ecosystem-resources main learning/README.md:181
  | **Discord** | [discord.gg/stellardev](https://discord.gg/stellardev) |
```

All three lines the finding named are fixed.

### Deployed, not merely merged

`ecosystem-skills/MANIFEST.json` pins `stellar-dev` at
`b78983c92330d81943fa99cdaee4e4a52e85eba3` (`commit_date 2026-08-25T20:39:05Z`). Production was
exercised directly through `mcp__stellar-raven` `execute` against `raven.stellar.org`:

```js
codemode.skill.read("skills.stellar-dev.standards", { sections: ["file:resources.md"] })
```

returns `- [Stellar Developers Discord](https://discord.gg/stellardev)`, and a whole-skill read
reports
`url: https://raw.githubusercontent.com/stellar/stellar-dev-skill/b78983c92330d81943fa99cdaee4e4a52e85eba3/skills/standards/SKILL.md`.
The deployed pin is the re-pinned commit, so the finding's own retirement condition — "confirm by
live `skill.read` that `file:resources.md` returns `stellardev`" — is met. The finding's sentence
"the production deployment still serves the previous pin" is now obsolete.

### Residual sweep

All four pinned skill trees were downloaded at their manifest commits (`stellar-dev`
`b78983c9`, `lumenloop` `d92c56bd`, `openzeppelin-stellar` `6f215af6`, `stellar-light` `d25b9f6b`)
and searched with the explicit character class the finding prescribes,
`discord\.gg/stellar([^A-Za-z0-9]|$)`:

```
NO STALE MATCHES
```

The only `discord.gg` strings anywhere in the four trees are the two corrected `stellardev` links in
`stellar-dev`. No successor is warranted.

### Persistent references — `rg -n "sk-020" .` and the stale-code sweep

| location | classification | action |
|---|---|---|
| `improvements/INDEX.md:17` | **regenerate — automatic** | |
| `ecosystem-skills/PIN-REVIEW.md:182,194,196` | **historical retention** | The dated re-pin record; line 194 quotes the old code as narrative evidence, which is correct and must stay. |
| `eval/corpus/raven-next/research/golden/_dossiers/scf-grants-builders.md:272` | **historical retention — do not edit** | Read-only vendored prior art under `eval/corpus/`, protected by the `AGENTS.md` hard rule. It mentions both codes as historical text. |
| `.agents/TODO.md:49`, `.agents/NEXT.md:104`, round ledgers, `research/audits/…` | **round bookkeeping / historical retention** | |
| `src/site.ts:833,1412` | **retain — already correct** | Both already use `stellardev`. |

No intake override exists for `sk-020`. No `probe` frontmatter. No golden case references it.

### Resolution comment

Required. Harvested refs:

```
https://github.com/stellar/ecosystem-resources/issues/9
https://github.com/stellar/stellar-dev-skill/issues/113
https://github.com/stellar/stellar-dev-skill/pull/114
```

Post the resolver-printed comment on **`stellar-dev-skill#113` only**. `#114` is the contributor's
merged PR, and `ecosystem-resources#9` is a different repository's separate defect that its own
owner already closed — a Raven retirement notice there would be off-topic noise. Note in
`--review-evidence` that the harvested `upstreamRefs` list includes `#9` because the regex scans the
whole file, that `#9` is a related-defect reference rather than a resolving ref, and that it was
independently confirmed closed-completed with its line fixed.

### Safe resolver inputs

`sk-020` resolves to intake `kind: "mixed"` across four skill repos, so the resolver **fails without
`--repo`**. Pass `stellar/stellar-dev-skill` explicitly.

```sh
npm run improvements:resolve -- \
  --file improvements/skills/sk-020-standards-skill-stale-discord-vanity.md \
  --repo stellar/stellar-dev-skill \
  --resolved 2026-09-01 \
  --resolving-ref https://github.com/stellar/stellar-dev-skill/pull/114 \
  --resolving-ref https://github.com/stellar/stellar-dev-skill/issues/113 \
  --live-recheck "2026-09-01 production skill.read against raven.stellar.org returns '- [Stellar Developers Discord](https://discord.gg/stellardev)' for skills.stellar-dev.standards file:resources.md, served from pin b78983c92330d81943fa99cdaee4e4a52e85eba3; raw main confirms stellar-dev-skill skills/standards/resources.md:233 and README.md:126 plus ecosystem-resources learning/README.md:181 all read discord.gg/stellardev; a discord\\.gg/stellar([^A-Za-z0-9]|\$) sweep across all four pinned skill trees (b78983c9, d92c56bd, 6f215af6, d25b9f6b) returns no stale match" \
  --review-evidence "Distinct reviewer Opus 5 high (pane w1H:p3), 2026-09-01: independently fetched all three upstream files and read issue 113, PR 114, and ecosystem-resources issue 9 back from GitHub; confirmed the deploy by live production skill.read rather than by the manifest alone; swept all four pinned skill trees with the prescribed character class and found no residual; ecosystem-resources#9 appears in upstreamRefs only because the regex scans the whole file, is a different repo's separate defect, is now closed-completed with its line fixed, and received no comment; resolution comment posted on stellar-dev-skill#113 only" \
  --references-reviewed --upstream-commented --dry-run
```

Source commit pins to `462ff2b1976040d9d04097981f71ae8970f1439c`, public on
`stellar-experimental/stellar-raven`.

---

## Blockers and open items for the round owner

1. **`sd-036` cannot retire this round unless the successor is filed.** Next id `sd-048`. Its
   verified claim: `core/cap-0075.md` line 78 documents `d` as "3, 5, 7, or 11" while line 124 says
   "Only d=5 is supported", line 163 traps when "`d` is not 5", `env.json:2725` says
   "5 for BLS12_381/BN254", and `SUPPORTED_SBOX_DEGREES = [5]`. Owner `stellar/stellar-protocol`.
   Smallest correction: one docs string. `improvements/intake.json` needs an `sd-048` override
   mirroring `sd-036`'s, since the `stellar-docs` service rule is `mixed`.
2. **`sd-036` needs a `golden-truth` edit before deletion**, coupled across `golden.answer`,
   `golden.avoid`, `golden.notes`, and `truth.verified.rootCause` in
   `q-protocol-bn254-poseidon-xray.json`, then `npm run eval:qa:compile`.
3. **`sd-001` needs the harness case rewritten before deletion**, or the repo keeps a permanently
   failing check named after a deleted finding.
4. **Sequencing.** A concurrent lane is editing `improvements/`. Run the resolver after it settles;
   it regenerates `INDEX.md`.
5. **Post before you resolve.** For `sd-036` and `sk-020`, post the resolver-printed comment, read it
   back from GitHub, then re-run without `--dry-run`. Use
   `gh api … --jq .body` for byte-exact checks, not the GitHub MCP `issue_read` tool.
6. **Validation after cleanup**: `npm run improvements:index`, `npm run improvements:lint`,
   `npm run improvements:lint -- --live`, `npm run improvements:probes`,
   `npm run eval:qa:lint`, `npm run secrets:scan -- --tree`. Baselines observed this session:
   improvements lint ok at 69 findings; corpus lint 0 errors, 61 warnings.

## Commands this lane executed

- `gh api repos/stellar/stellar-protocol/issues/1980`, `…/issues/1980/comments`, `…/pulls/1996`,
  `…/pulls/1996/files`, `…/contents/core/cap-0075.md`
- `gh api repos/stellar/stellar-dev-skill/issues/113`, `…/pulls/114`,
  `gh api repos/stellar/ecosystem-resources/issues/9`
- `gh api 'search/issues?q=repo:stellar/stellar-protocol+cap-0075+in:title,body'`
- raw fetches of `rs-soroban-env` `env.json`, `poseidon/mod.rs`, `poseidon_params.rs`,
  `poseidon2_params.rs`, `poseidon2.rs`
- pinned-tree tarballs for all four skill sources, swept with the prescribed character class
- `mcp__stellar-raven` `search` and `execute` (`codemode.skill.read`) against production
- read-only Algolia search API against both indexes; read-only crawler `GET /crawlers`,
  `GET /crawlers/{id}`, `GET /crawlers/{id}/stats/urls`
- `npm run eval:algolia-raven`, `npm run improvements:lint`, `npm run eval:qa:lint`
- `rg -n "<id>" .` for each finding id; read-only `renderIndex()` comparison

No write, no `PATCH`, no `POST /urls/crawl`, no comment, and no repository file change other than
this report.
