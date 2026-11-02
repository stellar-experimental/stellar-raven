# Lane rt-b report — dense diagnostic and token-boundary matching (2026-11-02)

Author: Claude Opus 5.5 (lane rt-b). Measured under contract v1 plus Amendment 1, and t16's re-scope message:
(1) dense evidence as an OFFLINE diagnostic only (G13), (2) main effort on a pure-function design for the
short-token prefix/substring defect class (G10). No commit, push, deploy, or other agent. No paid eval.

**Verdict: no rt-b design passes. Nothing from this lane should ship.** The two findings that matter:

1. Dense evidence helps (W − L is +20 on main and +21 on fresh). G13 forbids shipping it, and it also fails G3/G7 by one count each.
2. Token-boundary matching fixes the G10 defect class, but it fails G2/G3/G7 by large margins on both sources. The
   baseline's recall for broad retrieval lanes rests on the same spurious stopword and short-token evidence
   that G10 forbids. About 80% of the losses are broad-lane entries that leave the top five. The contract also has two internal conflicts (section 5).

## 1. Sources and baselines

- **main**: worktree at `d6ad7350`. `origin/main` is now `35fa569f`, but no measured file changed
  (`src/catalog`, `eval/run-routing.mjs`, `scripts/description-notes.mjs`, `src/policy`, `inventory`).
- **fresh**: `d6ad7350` plus the frozen archive `inventory/stellar-light.json` (Scout 1.9.111) and the 682-title
  `inventory/stellar-docs-titles.json`. `scout-exposure.ts` exposes `analyzeHackathonSubmissions` and
  `getHackathonSubmission` (as on 2026-10-28). It keeps `reviewSubmission` and `locateSource` excluded (G8).
  Main's newer stellar-light skill pin (9f77b3f9) and the Mintlify `stellar-docs.json` stay, because the archive
  pin 789c9061 is older than main's and the Algolia-era docs inventory no longer matches main's code.
  The fresh tree was first built with `locateSource` exposed. After G8 I rebuilt it and re-measured every fresh run.
  The lane totals of the fresh baseline did not change.
- Baselines were remeasured at `d6ad7350` (G1): main legacy 218/294/327/113, fresh 219/293/327/113. The fresh-vs-main
  source diff is W 2, L 1 (`q-scf-how-to-apply` top3), hackathon captures 0→7.
- Trees: `tmp/rt-b/src/{base,cand}-{main,fresh}`, `tmp/rt-b/src/g12-main`. Run JSONs: `tmp/rt-b/runs/<label>.json`
  (copies of the `eval/results/routing-*.json` files). Per-run comparisons: `<label>.cmp.json` (all keys),
  `<label>.g2.json` (G2/G3/G7), `<label>.probes.json` (checks 1–6 + G10).

Baseline JSONs: `tmp/rt-b/runs/base-main.json`, `tmp/rt-b/runs/base-fresh.json`.

## 2. Research (short)

- Upstream ranking is lexical only. The vendored scorer is `searchConnectors` from `@cloudflare/codemode`
  (`src/catalog/vendor/search-scoring.ts` header; installed 0.5.1 `dist/index.js` has no embedding or vector code).
- The Cloudflare API MCP server uses "search and execute": the model writes JS over the OpenAPI spec. There is no
  server-side ranking at all. Sources: https://developers.cloudflare.com/agents/model-context-protocol/codemode/ ,
  https://github.com/cloudflare/mcp , https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/
- Workers AI embedding models (`cf ai models list --task "Text Embeddings"`):
  bge-small-en-v1.5 (384 d, 512 tok, $0.0202/M), bge-base-en-v1.5 (768 d, 512 tok, $0.0666/M),
  bge-large-en-v1.5 (1024 d, $0.204/M), bge-m3 ($0.0118/M), qwen3-embedding-0.6b ($0.0118/M, 8k ctx, batch 32,
  instruction-aware), embeddinggemma-300m (no listed price). Model pages:
  https://developers.cloudflare.com/workers-ai/models/bge-base-en-v1.5/ ,
  https://developers.cloudflare.com/workers-ai/models/qwen3-embedding-0.6b/
- So a dense layer is a deviation from upstream. Under G13 it is a diagnostic only.

## 3. Design b1 — dense evidence (OFFLINE diagnostic only, G13/G14)

Pinned: `@cf/baai/bge-base-en-v1.5`, 768 dimensions, mean pooling, no query prefix. Entry text = `denseEntryText`
(`<name words> (<service> <kind>): <description>`). Only the exposed searchable entries were embedded (80 main, 82 fresh; G14).
Fusion: lexical tiers and admission are unchanged. Each admitted candidate's score is multiplied by `1 + 0.15·rel`, where
`rel = clamp((cos − median)/(max − median), −1, 1)` over the exposed entries.

Parameter choice (legacy lane only, before any other lane was read; recorded in `tmp/rt-b/dense-preregistration.md`):
the legacy grid was bge-base β 0.15 → 221/297/326/117, 0.3 → 220/294/328/118, 0.5 → 218/296/329/119, and
bge-small 0.15/0.3/0.5 → 223/292/328/113, 219/289/324/113, 221/287/323/113.
qwen3-embedding was dropped: dense-only legacy service top1 was 39/338, against 174 for bge-base and 181 for bge-small.
The likely cause is the asymmetric documents/queries API, and I did not debug it.
Spend: 47 calls, est. USD 0.0048 total (`tmp/rt-b/spend.md`; tokens are estimated high at chars/3).

| run | legacy | extended | skills | holdout t1/t3/t5 | holdout forbidden |
| --- | --- | --- | --- | --- | --- |
| base-main | 218/294/327/113 | 93/111/117/16 | 17/23/23/23 | 12/27/30 | 10 |
| dense-main | 221/297/326/117 | 94/115/118/15 | 18/23/23/23 | 14/28/35 | 11 |
| base-fresh | 219/293/327/113 | 93/112/117/16 | 17/23/23/23 | 12/27/30 | 10 |
| dense-fresh | 223/298/326/116 | 95/113/118/15 | 18/23/23/23 | 14/28/35 | 11 |

G2 W/L by lane (main | fresh): legacy 17/9 | 20/10, extended 9/5 | 8/5, skills 1/0 | 1/0, holdout 8/0 | 8/0.
It fails only by single counts: G3 legacy top5 327→326 and extended cardHit5 16→15; G7 holdout forbidden 10→11; and on fresh,
one new hackathon capture. It also fails G13 by construction.

**Does dense rank the missed rows better, and in which class?** (`tmp/rt-b/missed.mjs`, `tmp/rt-b/missed-{main,fresh}.json`)
I classified the rows the lexical baseline misses at top3 by where the target sits lexically:

| class (main) | n | dense fixes top3 | dense fixes top5 only |
| --- | --- | --- | --- |
| legacy, target in gated tier | 35 | 3 | 0 |
| legacy, target ungated-only | 9 | 1 | 0 |
| extended, ungated-only | 9 | 4 | 0 |
| extended, gated | 2 | 1 | 0 |
| holdout, ungated-only | 19 | 0 | 5 |
| holdout, gated | 3 | 1 | 0 |

The fresh numbers are similar (legacy gated 36→5 fixed). No missed target is absent from both tiers. Every target at least
scores ungated, so the rt-g claim that "dense cannot reach a target outside the gated pool" is too strong here: dense
moves ungated-only holdout skill targets into the top five through backfill and interleave. Dense mostly helps
paraphrase questions where the right family is admitted but outranked (holdout OZ/ZK skills, Scout vs Docs ties). It
does not fix the lexical defect classes themselves (prefix, substring, stopword, schema-only). It only reweights around them.
Patch: `tmp/rt-b/b1-dense-diagnostic.patch` (eval-harness env hook; the Worker is not wired).

## 4. Design b2 — token-boundary matching (pure function)

Change: in the vendor `scoreField` and its ungated replica (`scoring.ts`, kept in lockstep for the drift guard), whole-query
phrase matches respect token boundaries, and a query token matches a field token by one rule. I measured four rule variants
of this one design, and I report all of them:

- **strict**: whole token only.
- **morph**: whole token, or the existing `tokensOverlap` rule (plural fold; prefix pair with shorter ≥ 4 and ratio ≥ 0.75).
- **p4**: whole token, plural fold, or a prefix pair where both tokens are ≥ 4 characters. No raw substring.
- **short**: upstream rules, except that stopwords and tokens shorter than 3 characters match whole tokens only, and
  prefix partners must be ≥ 3 characters.

| run | legacy | extended | skills | holdout t1/t3/t5 | forb. | G2 W/L legacy, ext, skills, holdout |
| --- | --- | --- | --- | --- | --- | --- |
| tb-strict-main | 233/289/309/98 | 85/102/107/10 | 13/22/23/22 | 14/26/29 | 11 | 57/70, 13/28, 2/6, 10/8 |
| tb-morph-main | 241/293/311/101 | 89/102/105/10 | 14/23/23/23 | 15/28/32 | 15 | 65/60, 14/26, 1/4, 10/5 |
| tb-p4-main | 240/294/311/99 | 90/101/107/11 | 15/23/23/23 | 15/29/32 | 15 | 60/63, 13/23, 1/3, 10/5 |
| tb-short-main | 240/296/312/104 | 89/103/108/11 | 16/23/23/23 | 15/26/31 | 17 | 61/59, 14/25, 1/2, 10/7 |
| tb-strict-fresh | 233/289/308/99 | 85/102/108/10 | 13/22/23/22 | 14/26/29 | 11 | 57/71, 13/28, 2/6, 10/8 |
| tb-morph-fresh | 240/293/311/101 | 89/103/107/10 | 14/23/23/23 | 15/28/31 | 14 | 65/62, 14/26, 1/4, 9/5 |
| tb-p4-fresh | 239/294/311/99 | 90/102/108/11 | 15/23/23/23 | 15/29/32 | 14 | 60/65, 13/23, 1/3, 10/5 |
| tb-short-fresh | 239/296/312/104 | 89/105/109/11 | 16/23/23/23 | 15/26/30 | 16 | 61/61, 14/24, 1/2, 9/7 |

Every variant raises legacy top1 by 15–23 and holdout top1 by 2–3. Every variant loses legacy top5 by 15–19, legacy cardHit5 by 9–15, and extended by 8–11 on
top5. Extended W − L is negative everywhere. Holdout forbidden rises in every variant (10→11 for strict, up to 17 for short). On fresh, the hackathon set grows by 4–6 new
(row, op) pairs in morph, p4, and short (G7). No variant passes A2/G2, G3, or G7 on either source.

**Mechanism checks and G10** (`tmp/rt-b/probes.mjs`, the logic of the 2026-10-28 `acceptance.mjs` checks 1–6 plus a G10 probe):

| run | 1 | 2 | 3 | 4 | 5 | 6 | G10 (in/integration, with/without, 1/lvl1, type/types, has/phase) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| base-main | P | P | P | P | F | P | F (all five fail) |
| base-fresh | P | P | P | P | F | F (wallets, `approach`→`app`) | F (all five fail) |
| tb-strict (both) | P | P | P | F | F | P | P |
| tb-morph / tb-short (both) | P | P | P | F | F | P | F (type/types only) |
| tb-p4 (both) | P | P | P | F | F | P | F (with/without, type/types) |

- Check 6 (fresh) is fixed by every variant: `approach` no longer prefix-matches `app`.
- Check 5: the `has`/`phase` half now passes in all variants. The remaining failure is the `status phase value` part, which is
  schema-only keyword admission (`scoreWithKeywords` rescues when two schema keywords match). That is the rt-a C2/c4p
  mechanism, and it is independent of the token rule.
- Check 4 fails under every boundary rule. The account-merge query keeps no gated hit, and `search_docs_in_category` leaves.
  The 2026-10-09 TODO entry already records that this fixture's baseline presence depends on the stopword `i`
  prefix-matching `in` in the Docs id and name. See section 5.

**Loss causes (G5).** `tmp/rt-b/attrib.mjs` writes per-row traces to `tmp/rt-b/runs/tb-short-{main,fresh}.loss-trace.json`
(each lost row, the entries that left, and every removed query→field token pair). For tb-short on main: 101 loss rows. In 98 of them,
the entry that left had matched through removed prefix or substring evidence (912 prefix pairs, 157 substring pairs). The top pairs were
`do~docs`, `on~one`, `it⊂…`, `on~once`, `i~is`, `they~the`, `are~a`, `i~in`, `s~search`, `does~do`, `token~to`, `asset~as`, `soroban~so`.
Three rows are reorder-only. Under G5 the removed evidence is class (a), but G2/G3 still fail.

**Root cause.** About 80 of the 101 tb-short main losses are broad retrieval-lane entries that leave the top five, mostly
`lumenloop.search_content_semantic` (Lumenloop legacy top5 56→39) and the Docs corpus lanes. Example trace
(`tmp/rt-b/trace.mjs`): for "What is Comet on Stellar — is it a major live DEX?", `search_content_semantic` passes the
gate only through `on` inside `content`/`semantic`, `a`, and `dex`→`de`. Without them, content coverage is 2/5 and the gate fails.
The baseline routes unknown-entity questions to the broad content lane for the wrong reason. A pure fix for G10 removes that
recall. Restoring it needs an explicit, general rule for broad lanes. G11 forbids such a rule as ungated fill on a full page, so it
would have to be a gated-admission rule for open-world lanes. That is a separate design that this lane did not measure, and
its interference risk is the one the TODO history describes.

**G12** (`SKILL_DESCRIPTION_OVERRIDES["skills.stellar-dev.dapp"]` removed, main): the unchanged scorer has zero graded change
(`g12-base-main`). tb-short loses one more extended row (`g12-short-main`). So the override is no longer load-bearing on
current main.

**A7 status (b2, default rule morph, worktree):**
- `npm run typecheck`: PASS.
- `npx vitest run --dir test`: 26 failed of 3056, in 16 files. The failures are search/scoring/drift tests that assert old pages or scores, `test/server.test.ts`, and one `it.fails` RWA mixed control
  ("Simulate a transfer of a tokenized bond through Stellar RPC."), which now passes and so fails its marker (the rt-g trap). Log: `tmp/rt-b/test-morph.log`.
- I did not run `test:smoke` or `build` because no variant passes A2/G2.

Patch: `tmp/rt-b/b2-token-boundary.patch`. It is against `origin/main`. `RAVEN_TOKEN_MATCH` selects strict/morph/p4/short, and the default is morph.
It is an experiment patch, not a shippable diff. I restored the worktree's tracked files, so `git status` is clean.

## 5. Contract findings for the orchestrator

1. **G10 vs check 4.** Check 4's positive (account-merge keeps `search_docs_in_category`) holds on the baseline only through
   `i`→`in` prefix evidence. G10 forbids exactly that. A scorer that passes G10 fails check 4 unless it adds new legitimate
   evidence for that row. Consider making check 4 a diagnostic, or rewording it.
2. **G10's `type/types` pair is a plural.** Its gates-note source is the Returns field name `type` sitting in the description,
   not bad morphology. A literal G10 forbids plural folding, and only the strict variant passes it. Strict is also the worst on
   every lane (legacy W − L −13, skills top1 17→13). Consider limiting G10's pairs to non-morphological prefix and substring
   matches, or treating `type/types` as a source-text item.
3. **Check 5 has two halves.** The `has`/`phase` half is the substring defect, and b2 fixes it. The `status phase value` half is
   schema-only admission (rt-a's line). A lexical token rule cannot pass check 5 alone.
4. G2/G3 effectively forbid any rule that removes spurious evidence the baseline's recall depends on, unless a second mechanism
   restores that recall. Broad-lane recall is the dominant case here.

## 6. Recommendation

Ship nothing from rt-b. If the owner wants the G10 defect fixed, the evidence points to two changes measured together:
(a) token-boundary matching (the `short` or `morph` rule) and (b) an explicit, general admission rule for open-world broad
lanes (semantic/research/av) on questions with unmatched content tokens. Measure (b) first on its own against the
interference sets, and decide contract findings 1–2 before that run. Dense evidence is the strongest measured
recall signal (+20/+21 W − L), but G13 rules it out on the search path. It stays a diagnostic.

## 7. Spend

Workers AI embeddings only, through `cf ai run`: 47 calls, est. USD 0.0048 of the USD 5 cap. No other paid call.
Ledger: `tmp/rt-b/spend.md`.
