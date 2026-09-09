# Independent review — isolated #109 advisory patch

Reviewer: Grok 4.6, high effort.
Role: independent adversarial reviewer.
This reviewer is not the Sol author and is not the Astra orchestrator.
No subagent ran.
This file is the only write.

## Verdict

**PASS.**

H1, H2, and M1–M5 stay reconciled as before.
H3 is closed on the current applied tree.
See the 2026-09-09T04:01:36Z append for the prefix re-run.

Root full and routing rerun is still active and is outside this isolated review.

## Actionable findings

### H3. Search tool prefix drops the open-world breadth rule

**Location:** `src/mcp/tools.ts` `SEARCH_DESCRIPTION`.
Pinned by `test/mcp-instructions.test.ts` “search's clipped prefix still carries the plan-then-compose workflow”.

**Observed:** Independent run at `2026-09-09T03:58:18Z`:

```
FAIL test/mcp-instructions.test.ts > tool descriptions — Claude Code 2KB clipped prefix
  > search's clipped prefix still carries the plan-then-compose workflow
AssertionError: needs a broad content/research family in the same script.
```

Rendered description length is 4,895.
The required phrase starts at index 2,078.
The 2,048 clip ends on `open-world identity, histo`.
The Returns paragraph is 97 characters longer than the prior sentence.

Catalog, MCP, and Playground boundary tests still pass.
This instruction test does not.

**Consequence:** Claude Code reads the clipped prefix when it decides how to call `search`.
It loses the open-world recovery rule that this repository already pins.

**Smallest repair:** Shorten the Returns paragraph by about 90 characters.
Keep the gated-page directory fact in `nextSteps` and the schema describe if the prefix cannot hold both.
Do not drop the breadth sentence from the first 2,048 characters.
Re-run `npx vitest run test/mcp-instructions.test.ts -t "clipped prefix"`.

## Reconciled from the first source pass

These first-pass findings are repaired in the applied tree.

| ID | First-pass issue | Applied repair |
| --- | --- | --- |
| H1 | `SEARCH_DESCRIPTION` called directory advice structurally poor only | Returns paragraph now names one-content-token gated pages. The prefix growth created H3. |
| H2 | `EXECUTE_DESCRIPTION` said poor pages only | In-sandbox copy now names directory advice on gated pages and says ranking does not change. |
| M1 | `rfp` missed the plural rule | Simple `s` plural now uses `length >= 2`. `rfp` matches `scout.getRfps`. `person` stays unresolved by design and has a test. |
| M2 | Short-query `nextSteps` hid broad advice | Extra sentence fires when a non-directory advisory remains. MCP and Playground tests pin it on `hypertron`. |
| M3 | Architecture table and gated-silence title were stale | Architecture paragraph and table name gated pages. The old silent-gated title is now multi-token. `PLAN.md` also names the exception. |
| M4 | Tests did not pin hits, `total`, or paging | Default-kind `freighter` freezes ids, scores, tiers, `total`, `truncated`, and `effectiveLimit` at limits 1 and 5. MCP and Playground copy that freeze. |
| M5 | Missing no-`kind`, Scout, Docs, hyphen | Those cases are in `test/search.test.ts`. MCP and Playground use default kind. |

## Ranking invariance evidence

Independent compare of `searchCatalogPage` on clean `8ab7b88` versus the applied tree.
Scorer and `catalog/manifest.json` are byte-identical across that pair.
Cases: 22.
Rank mismatches: 0.

Compared fields for every case: hit `id`, `service`, `kind`, `score`, `tier`; `total`; `truncated`; `effectiveLimit`; `confidence`.

Queries included the seven reported names, default-kind `freighter`, `audit`, `rfp`, `person`, `open x402`, `open-x402`, Scout/Docs/skill filters, `search directory`, two-token zero-hit, one-token zero-hit, gated multi-token, and the long remittance control.

Advisory output changed on 12 cases.
Ranked pages did not.

Default-kind `freighter` at limit 5 is:

- hits: `skills.stellar-dev.dapp` 75 gated, `stellarDocs.search_wallet_dapp_docs` 75 gated, `stellarDocs.search_soroban_contract_docs` 30 gated
- `total` 3, `truncated` false, `effectiveLimit` 5
- one `short-query-directory` hub: `scout.searchProjects`

MCP and Playground logs matched that page.

## Exact boundary tests

Independent runs on root at `2026-09-09T03:55:51Z` through `2026-09-09T03:58:41Z`:

| Command | Result |
| --- | --- |
| `npx vitest run test/search.test.ts -t "preserves the default-kind\|directory advisory\|operation word\|short-query directory\|service filter\|skill-only searches\|Scout directory\|Docs service filter\|literal identity\|zero-hit name"` | 21 passed, 74 skipped |
| `npx vitest run test/server.test.ts -t "short-name directory\|zero-hit name lookup"` | 2 passed, 72 skipped |
| `npx vitest run --config test/smoke/vitest.config.ts test/smoke/demo-tools.test.ts -t "short-name directory\|zero-hit name"` | 2 passed, 20 skipped |
| `npx vitest run test/mcp-instructions.test.ts -t "clipped prefix"` | 1 failed, 2 passed in that file |

Pinned behaviors that passed:

- one-content-token names add a directory hub
- `audit` and `rfp` add none
- `open x402` and `open-x402` add none
- skill-only searches add none
- Lumenloop, Scout, and Docs filters
- default-kind `freighter` ranking freeze
- zero-hit `hypertron` keeps directory plus two broad hubs and the extra `nextSteps` sentence
- `person` keeps `scout.getPeople` in hits and still adds the directory hub

This reviewer did not repeat the full 1,986-test baseline or the routing gate.
Root already recorded those on an earlier snapshot.
The current instruction-prefix failure is later than that snapshot.

## Scope and fixed point

- Mode: audit only.
- Spec: GitHub issue `stellar-experimental/stellar-raven#109`.
- Branch: `fix/search-directory-advisory`
- HEAD: `8ab7b88f95177022cd24c0d0acb6e619b19ea23c` (maintenance PR #135)
- Runtime at HEAD matches `b2dbde53e9c9910b6d49a87ccea829555eeb4ef1` for search, scoring, and the manifest
- Author apply artifact SHA-256: `b2076acb17852462a4b87ffc8a10be021e95efac498c3a31e4c6a1c7d9015a93`
- Live seven-file `git diff` SHA-256 versus HEAD: `6192e844103be3e5090d854e227e06e9158e8d69ad5b083b8d9db4069f4dd7ab`
- Checks: `2026-09-09T03:50:58Z` first source pass; `2026-09-09T03:59:18Z` applied re-review

Reviewed live files:

- `ARCHITECTURE.md`
- `src/catalog/search.ts`
- `src/demo/tools.ts`
- `src/mcp/tools.ts`
- `test/search.test.ts`
- `test/server.test.ts`
- `test/smoke/demo-tools.test.ts`

Extra in the working tree, still in scope for copy truth: `PLAN.md`.
Ignored: `.agents/rounds/2026-09-08-search-advisory-production-before.json` and the combined scoring candidate.

No paid call, deploy, upstream write, or commit.

## Invariant checklist

| Invariant | Applied result |
| --- | --- |
| No ranked hit, score, total, or paging change | Holds. 22/22 independent pages match. Tests freeze `freighter`. |
| No scorer, manifest, gates, or exposure edit | Holds for the seven named files. |
| Advisory stays opt-in conditional guidance | Holds in `nextSteps`. |
| One content token | Holds. |
| Honest two-word noncoverage | Holds, including `open-x402`. |
| Ordinary operation words | Holds for `audit` and `rfp`. `person` is an explicit non-match. |
| All service and kind filters | Holds in code and tests. |
| Public MCP and Playground | Ranking freeze and advice pass. The MCP tool prefix currently fails. |
| No query or op-id exceptions | Holds. Hub choice is recovery-graph centrality. |
| No independent endpoint routing | Holds. |

## Residual risk

`PLAN.md` is an eighth dirty file.
The edit matches the architecture sentence.
It is not a ranking change.

If the recovery graph later ranks `scout.searchRepos` first, the hub stops being a name lookup.
Current tests would fail that shift.

## Outcome

Fix H3, then re-run the clipped-prefix test.
Do not declare PASS until that test is green on the applied tree.
Ranking invariance and the catalog, MCP, and Playground boundary tests already support a pass after that fix.

## Append — 2026-09-09T04:00:58Z reconciliation

Root asked for a review of the eight live files, including `PLAN.md`.
This pass does not repeat the 22-case ranking experiment.

Live files versus `8ab7b88f95177022cd24c0d0acb6e619b19ea23c`:

- `ARCHITECTURE.md`
- `PLAN.md`
- `src/catalog/search.ts`
- `src/demo/tools.ts`
- `src/mcp/tools.ts`
- `test/search.test.ts`
- `test/server.test.ts`
- `test/smoke/demo-tools.test.ts`

### Person boundary

`matchesIdentityToken` matches equal tokens, regular `s` plurals at length `>= 2`, and `y`/`ies` at length `> 3`.
`scout.getPeople` tokenizes to `get` and `people`.
`person` is not `people`.
`person` plus `s` is `persons`, not `people`.

The catalog test `keeps literal identity tokens distinct from semantic matches` pins both facts:

- `scout.getPeople` still ranks for `person`
- the directory hub still appears as conditional advisory

`nextSteps` still says to use that hub only when ranked hits do not identify the entity.
The host does not run a lookup.

A `person` → `people` map would be an identity exception.
This reviewer does not require that map.
M1 is closed on this design.

### Reconciled claims that now hold

H1. `SEARCH_DESCRIPTION` names both triggers, including gated pages.
H2. `EXECUTE_DESCRIPTION` names both triggers, including gated pages.
M2. Broad follow-up copy remains when a later non-directory advisory exists.
M3. `PLAN.md`, the architecture paragraph, and the architecture table agree.
The gated-silence test title is now multi-token.
M4. Default-kind `freighter` freezes ids, scores, tiers, `total`, and `truncated` at limits 1 and 5.
Public MCP and Playground tests use default kind and the same freeze.
M5. Scout and Docs filters, hyphenated `open-x402`, and zero-hit `hypertron` composition are pinned.

User copy now says operation-name token match.
Independent catalog, MCP, and Playground checks at `2026-09-09T04:00:43Z`–`2026-09-09T04:00:58Z` passed:

- 21 catalog boundary tests
- 2 MCP tests
- 2 Playground tests

### Still open: H3

Independent re-run at `2026-09-09T04:00:43Z`:

```
FAIL test/mcp-instructions.test.ts
  tool descriptions — Claude Code 2KB clipped prefix
  > search's clipped prefix still carries the plan-then-compose workflow
```

The required phrase `needs a broad content/research family in the same script.` is still absent from the first 2,048 characters.
The clip still ends on `open-world identity, histo`.

Root’s 169 focused tests and 85 smoke tests do not replace this pin.
This test is the public MCP prefix contract.

Smallest repair is unchanged: shorten the Returns paragraph by about 90 characters, then re-run `npx vitest run test/mcp-instructions.test.ts -t "clipped prefix"`.

### Final verdict for this append

**CHANGES-REQUIRED** on H3 only.
Do not PASS until the clipped-prefix test is green.
Do not add a person-to-people synonym.

## Append — 2026-09-09T04:01:36Z H3 re-run

Root shortened only the `SEARCH_DESCRIPTION` Returns paragraph.
Both advisory triggers remain.
The copy still uses an operation-name token boundary, not a semantic nonmatch.

Current Returns paragraph:

> Returns TypeScript signatures, `confidence`, and `recoveryMetadata`. Unresolved one-content-token queries can add directory `widerCandidates` even with gated hits. Unresolved means no operation-name token match. Zero-hit/all-backfill pages can add broad semantic/research/A/V/corpus advice. Advice never changes ranking. Pass attempted exact IDs in `recoverFrom` (optional `reason`) for separate recovery candidates.

`EXECUTE_DESCRIPTION` is unchanged from the reconciled H2 text.
No scorer, ranking, or advisory-mechanism edit is in this delta.

Independent command:

```
npx vitest run test/mcp-instructions.test.ts
```

Result at `2026-09-09T04:01:36Z`: 14 passed, 0 failed.
The unchanged clipped-prefix gate is included.

H3 is closed.

### Final verdict

**PASS** for the isolated #109 advisory on the current applied tree.
Earlier dispositions stand: H1/H2/M2–M5 repaired; M1 `person` accepted as a literal token non-match.
This PASS does not wait on, and does not claim, the in-flight root full/routing rerun.
