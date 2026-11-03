# Owner follow-up round 2026-11-03

Coordinator: hc terminal t16 (Claude Opus 5.5). This ledger records the owner's answers to the
2026-11-02 waiting list, the lanes, the order of work, and each verdict.

## Owner decisions (2026-11-03)

- **A** (paired measurement): read the overnight round's closeout first. If it answers A, retire A
  and delete the launch tooling. Otherwise find "an accurate but relatively quick and inexpensive
  solution".
- **B** (model call on the search path): explore query embeddings and models "like Jev, Clef,
  Particle-1 as well as other models" before landing anywhere. More evals and improvements are
  fine "as long as it's fast, actually improves things and doesn't cost too much per query".
  Parallel calls may hide latency.
- **D** (Scout hold, #223): revisit once B is decided.
- **#294** (Jev ranking PR): evaluate in light of B. Merge if the value is clear and worth it;
  otherwise close with a kind comment. Use multi-model planning, tests, and evals.
- **#167** (RWA exclusion): wait for B, then proceed under that choice.
- **Pin bump** (`stellar-dev` skill): wait for the other session's QA agents to finish. Then do
  the work with tests and evals, and ship with conviction.
- **Own-repo items** (sd-059, demo provider, golden URLs, HackMeridian goldens, routing): do the
  clear work through Sol agents; fix and merge where conviction stays clear.
- **Upstream**: do clear work in fresh-context Sol or Opus agents, coordinated with other work.

## Holds

- The other session's QA follow-up (`codex/golden-followup-2026-11-03`, hc t54 and its lanes)
  edits golden cases, the consistency register tooling, and upstream patches for sd-087, sd-088,
  and sk-037. It authorizes no push, filing, or deployment. Until it finishes and merges, this
  round does not edit golden cases or the register, does not deploy, and does not file those
  findings.
- Golden URL repair, HackMeridian golden proposals, and the skill pin bump start after that
  session finishes.

## Lanes (wave 1)

| Lane | hc | Model | Worktree / scope | Output |
|---|---|---|---|---|
| b-research | t12g | Grok 4.7 xhigh | research only | ranking-model survey |
| b-design | t12h | Claude Opus 5.5 high | `rv-b`, round folder only | contract, candidates, harness, runtime design |
| a-analysis | t12j | Claude Opus 5.5 high | read-only | decision A recommendation |
| demo | t12k | Codex gpt-6.1-sol high | `rv-demo` | `agents` 0.32.0 + `createAI` migration |
| sd059 | t12m | Codex gpt-6.1-sol high | `rv-sd059`, `tmp/` only | raw Discovery vs. adapter comparison |
| up-sweep | t12n | Claude Opus 5.5 high | `rv-up` | upstream state table, sd-048 patch package |

## Planned order

1. Wave 1 (above).
2. B contract: assumption attack by Gemini 4 Argon (OpenCode) before any candidate runs; the
   coordinator signs the contract and the spend cap.
3. B measurement: Sol lanes build the harness and measure candidate families on both sources.
   Kimi K3.1 Pro and Grok challenge the results; an independent reviewer from another family
   checks the winner.
4. B ship (if a candidate passes): implementation, `AGENTS.md` rule change, PR, review, merge.
   Then #294, #167, and D follow from that result.
5. After the other session finishes: skill pin bump, golden URL repair, HackMeridian goldens,
   deploy.

## Working evidence and decisions

(appended as lanes report)

### Decision A (2026-11-03): retire

Lane a-analysis (Claude Opus 5.5 high, read-only) found that the overnight round does not answer
A: it has one arm, one revision, a different runner and model family, and no aggregate. A cannot
get an accurate answer at any price now. The baseline `90d0ba75` reads the retired Algolia docs
index (48% of the sample), the identity guard no longer covers that source, and the frozen tuple
(pack `p6`) is stale. No ship decision waits on A, and forward-only rules out the rollback that a
`FAIL` could support. Spend so far without a result: $336. Under the owner's rule ("accurate but
relatively quick and inexpensive ... where/if/as possible"), the coordinator retires A. Lane
retire-a (hc t12v, Codex gpt-6.1-sol high, worktree `rv-a`) deletes the launch tooling and edits
the TODO, run sheet, and run-evals skill. A per-change scoped paired check replaces it for future
model-facing changes (report section 3).

### sd-059 raw probe

The coordinator ran `tmp/sd059/raw-probe.mjs` host-side (key loaded from `.dev.vars`, never
printed). All seven queries returned HTTP 200 with 50 candidates. The saved files hold no
credential (two matches are documentation code samples).

### Demo provider migration

Lane demo found two upstream API gaps in `agents` 0.32.0 `createAI`: catalog streams ignore
`resume:false`, and Claude string calls drop adaptive thinking and `xhigh` effort (native Claude
objects keep them but switch to passthrough billing). The lane restored the package files and
keeps `workers-ai-provider` until an option is chosen.

## Decision A retirement — 2026-11-03

The owner delegated retirement of decision A on 2026-11-03.
The August-to-September paired measurement closes without a result.
The retired Algolia baseline cannot support the planned comparison against Mintlify.
The 2026-11-02 diagnostic did not answer decision A.

The change removes eight launch files and two tests listed in
[the retired run sheet](2026-10-01-backlog-closeout/paired-run-sheet.md).
It removes decision A, its priority, its promotion item, and its prompt-change sequencing restriction from `.agents/TODO.md`.
The `run-evals` skill records the retirement.
The dated records, shared test helper, and all `eval/qa/` files stay unchanged.
The coordinator will remove the retired measurement freeze from `merge-and-deploy-as-work-completes`.
This decision authorizes no paid collection.

Validation: install, type generation, type checking, tests, build, and the tree secret scan all exited 0.
The tests passed 144 files and 3019 tests, with three expected failures.

### sd-059 comparison verdict (2026-11-03)

Lane sd059 (Codex gpt-6.1-sol high): verdict B, upstream retrieval. The expected result-code page
is absent from all seven raw Discovery candidate sets (top 50), so no Raven adapter step drops it.
A real-adapter replay (seven equality assertions against unmodified output) confirms the adapter
keeps every candidate except meeting sections. The public site MCP (`search_stellar_developer_docs`)
ranks an expected page first for all seven queries, and its `op_bad_signer` result carries the
`SET_OPTIONS_BAD_SIGNER` mapping. Discovery median 920 ms vs. site MCP 675 ms (single observations;
one MCP timeout at 30 s). Published site MCP limits: 5,000 requests/hour per IP, 10,000 searches/hour
per site. Evidence: `rv-sd059/tmp/sd059/` (not committed). Phase 2 measures D (Discovery), M (site MCP),
and P (both in parallel, RRF) on the full identifier probe and the golden docs pages.

### Merged and opened (2026-11-03)

- PR #340 (retire decision A): Argon APPROVE, CI green, merged as `f44fbb1a`.
- PR #341 (upstream sweep): cs-003 `fixed-upstream` (resolve waits for a golden-truth pass on the
  SEP goldens, held behind the other session, and a distinct reviewer), cs-008 `declined-upstream`,
  sd-048 errata PR stellar/stellar-protocol#2059 opened from the `kalepail` fork.
- Issue #339 (daily refresh crash since 2026-11-03 06:31Z, ADR-0003 leak guard on
  `analyzeHackathonSubmissions` in keyword-exclusion text): lane r339 (hc t13h, Codex Sol high,
  worktree `rv-339`). The coordinator ran `refresh-inventory.mjs` host-side (exit 0).
- Demo migration: blocked by two `createAI` gaps; `workers-ai-provider` stays. Lane demo-finding
  (hc t13s, Claude Opus high) packages the upstream finding for cloudflare/agents.

### B contract (2026-11-03)

Lane b-design delivered `contract.md` (SHA-256 `0ec05f5fa1850e12000c9947239cb75cb425ee471bcb4be8ece11fcd9930f0c0`),
`candidates.md`, `harness.md`, and `runtime-design.md` in `rv-b`, with no candidate measured.
b-research (Grok 4.7 xhigh) shortlist: bge-base, Clef-flash, bge-reranker, qwen3-embedding, Clef;
external decision models only as a conditional tier; no small LLM (including Particle-1) on the
search path. Assumption attacks before signing: Gemini 4 Argon high (hc t13j) and Kimi K3.1 Pro
high (hc t13k), both OpenRouter with zero retention.

### sd-059 backend A/B, development round (2026-11-03)

Pre-registered, free, 382 paired captures (536 labeled rows), no HTTP 429. Hit@5 by set (D Discovery /
M site MCP / P parallel RRF by page+anchor): identifiers 17/48/31; migration golden 178/175/166;
routing legacy 104/103/98; routing extended 79/79/78. M wins identifiers by 31 with no loss but loses
6 and gains 3 golden pages (four candidate omissions in its 10-record window). P loses pages through
anchor-split fusion keys. Lane verdict: keep D. Coordinator: the page-keyed fusion fix (P2) and an
identifier-shape route (R) came from reading this data, so phase 3 confirms them on a disjoint,
frozen confirmation set with a fresh capture before any production change.

### B contract attacks (2026-11-03)

Argon high: 24 findings (8 blockers), Kimi K3.1 Pro high: 23 findings (2 blockers). Both name class
(m) as too permissive, no untouched confirmation set across many variants, repeat cherry-picking, an
unfrozen fresh source, the weak fallback identity proof, unfiltered `limit: 5` only, and an
`AGENTS.md` rule text that forbids family f. Lane b-amend (hc t14s, Claude Opus high) writes
Amendment 1 and the reconciliation before any measurement.

### Demo provider: upstream finding filed (2026-11-03)

PR #342 merged (`d3849813`): cs-010 with a self-contained repro (byte-identical on agents 0.32.0
and 0.33.0 across Codex, Claude, and Argon runs; Argon APPROVE). Filed as cloudflare/agents#2809;
the stream-resume opt-out defers to the existing cloudflare/agents#2790. `workers-ai-provider`
stays. PR #343 records the filing.

### #339 fix: review round 1 (2026-11-03)

Argon high returned CHANGES: the `x-routing` scrub weakened a strict raw-text guard (and still
leaked split tokens into routing keywords), templated paths produced "upstream {id}", fully
excluded lists left stray text, and the super-spec change lacked a test. Lane r339-fix (hc t14w,
Codex Sol high) narrows the fix to operation descriptions and adds the missing tests.

### B contract signed (2026-11-03)

Lane b-amend wrote Amendment 1 (N1–N24) and `attack-reconciliation.md`, with no rejected finding.
It cuts the shippable set to 8 primary variants, adds a seeded development/confirmation split with one
finalist, replaces class (m) with a labels-based (m′)/(u) rule and a cap, counts the effect in distinct
rows with a sign test on the confirmation part, freezes the fresh source by SHA-256, proves fallback
identity on full pages, and prices one complete search. The coordinator signed it with a USD 15 spend
cap (tier X USD 0): `contract.md` SHA-256 `a1cf67f6cb77e449ef2156b7cd39a1bb0902dd22f2e9ee8d3dbf330cc77c2346`,
pushed in `1365fc62` before any candidate ran. Harness lanes: h-core (hc t15s, Sol xhigh), h-capture
(t15t, Sol high), h-latency (t15v, Sol high). Paid captures and the probe deploy run host-side by the
coordinator.

### #339 fix merged (2026-11-03)

Argon high round 2 returned APPROVE: all four round-1 findings resolved, 266 focused tests pass, and
reverting the three scripts fails 54 tests. PR #344 merged as `3ff5c59b` and closed #339. No
generated artifact changed, so no deploy follows. The next scheduled refresh reports the held Scout
1.9.116 drift (#223) instead of crashing.

### sd-059 phase 3 confirmation (2026-11-03)

Pre-registered (`registration.json` predates every confirmation request), 205 new query strings
(15 QA golden page rows, 190 Horizon result-code tokens), one host-side collection with no HTTP 429.
Hit@5 on identifiers: D 153, M 190, P2 178, R 171; QA golden 5 for every arm. Added-latency p95 over
D: P2 1,424 ms, R 1,258 ms, against the registered 600 ms limit. Both fail. P2 also fails the
development gate (migration golden hit@1 −1, hit@5 −2); R passes it. Verdict: keep D; no production
change. The site MCP gains come with tail latency (slowest 20.2 s) and a shared 10,000 searches/hour
site limit. The raw-candidate comparison closes the question that Raven's 2026-11-02 comment on
stellar/stellar-docs#2995 left open: Raven's filter is not a cause. Lane sd059-up (hc t165, Claude
Opus high, worktree `rv-sd059up`) recorded the evidence on sd-059. The coordinator posted
https://github.com/stellar/stellar-docs/issues/2995#issuecomment-6608646512: no content change requested;
the Discovery ranking gap goes to whoever holds the Mintlify relationship.

### B harness inputs and clarifications (2026-11-03)

- Main source: clean clone at `e530c7f4`; `catalog/manifest.json` byte SHA-256
  `f018b979460a9a0d22bfafb9b2b57b67d7ddb31650719fd8a190bdcb6bbc1534` (matches harness section 3).
- Fresh inputs: `eval/results/2026-10-28-routing-repair-evidence.tar.gz` SHA-256
  `ed4e32a37c8ea2cd0d66268dee82172a3f182d53a55272ad9813d08a61e00a4e`, run `baseline-fresh`:
  `inventory/stellar-light.json` (Scout 1.9.111) `f653ef3236baaf1259662a4999cb6731017a4d5f4c90ea4434b21ed6a5bd5ef8`,
  `inventory/stellar-docs-titles.json` (682 titles) `c9758cab3a97c107198d29543a01570e298a1ade2ee42487af4add1811e199d5`,
  `ecosystem-skills/MANIFEST.json` (pin `789c9061`) `ff12040593e3721ab7c9e749f2373a59298677a2605999ecc05fb0b96b4e9524`.
  All eight fresh runs in the archive carry the same three hashes. The rebuilt fresh manifest hash
  is `3d688f150cc53b0a3f169cc90e2e8792a1501d5373a4ae07a48d7552da7aaff5` (built once from the
  stellar-light source object). Both sources reproduce the harness section 3 totals exactly
  (h-core `tmp/model-ranking/fresh/hashes.json`).
- rt-c's c.1 + c.2 code was lane-local and is not retained. Family b (diagnostic only) is a
  reimplementation from `report-rt-c.md` and `candidates.md`, labeled as such.
- C1 (before any measurement): a ranking pool with fewer than 2 entries makes no model call and
  returns the fallback page (reason `trivial-pool`, cost 0, neither a timeout nor an error, counted
  per lane, excluded from latency samples).
- C2: for families a, b, and d, an `error` key after the one retry gets one key-level repair even
  when errors are at most 2%. The original line stays, the repair cost counts, and `invalid` keys
  are never recaptured. A failed repair fails that capture for shipping. Families c and f get no key
  repair; their errors count toward the 2% budget.
- Latency probe censor rule: a wait at the 5,000 ms probe cap is a censored timeout sample, never
  dropped. The late promise drains (30 s cap) before the next request, and the idle interval starts
  after the drain. Windows are not discarded or re-run. Reports show the raw wait and min(wait, T).
- C3 (N17 / harness A1.10 replay): reranker and Clef use all repeat-1 keys as the denominator. A key
  matches when both outputs are valid with equal top-five orders, or when both are non-valid (both
  fall back). Any other case is a mismatch; the gate stays at 98%. Vector keys all need cosine
  ≥ 0.999, and a replay error on a vector key fails the check.
- C4 (R7): a timeout is raw Worker model wait > T (500 ms), the condition that triggers fallback.
  The timeout, error, and invalid union uses that count. The p50 and p95 gates use wait plus the
  host p95 CPU. The count of calls with wait plus CPU above 500 ms is reported as a diagnostic only.

### B measurement progress (2026-11-03)

- Entry repeat 1 is complete on both sources for bge-base and qwen3 (all keys `ok`). The fresh
  bge-base capture first recorded 30 false `cf-login-failure` errors: the classifier matched
  `\b401\b` inside embedding floats. h-capture fixed it (exit code and stderr only, tested with
  0.401, 0.429, and 0.503) and the 30 keys were repaired once under C2.
- Clef fixed frame: 6,203 reported input tokens for a 60-card pool. Construction screens with
  margin: P1 USD 0.0030/1k, P5 USD 0.0130/1k, clef-flash USD 0.235/1k (worst USD 0.00031). Full
  Clef (P7, `c-cl-k-rrf`) projects USD 1.486/1k (worst USD 0.00198), above the USD 1/1k R6
  limit, so it stops at screening with no sample or full capture.
- R7 runs after development grading, only for variants that pass quality and cost.
- Q9 override catalogs (no dApp override, `compare/override.mjs`): main byte SHA-256
  `bd28a4c2cbf327ca162e033164a9804950f99e86aae1505c6d6fe73c53512310`, fresh
  `809c6ec9565ffb00af169ce5fc29243a4166c47fc8967a37145e309a8ae1e086`. Plans keep the frozen
  manifest in provenance and key the override catalog by its hash.
- C6: Q9 keys extend completed repeat-1 captures. The new keys must be disjoint from all captured
  keys. They run under a diagnostic capture ID, old keys stay unchanged, and the packaged fixture
  gets a new path and a manifest line naming both captures and hashes. Repeat 2 captures the full
  extended plan at once.
- C7: R6a output validity counts every query fixture key in a repeat (development and
  confirmation). Validity reads no labels, so the count reveals no confirmation outcome.

### Decision B: search stays lexical-only (2026-11-03)

Development grading of repeat 1 (lane b-grade, hc t18p, Codex Sol high, offline) fails every
primary variant; P7 stopped at the R6 cost screen. The coordinator cancelled repeat 2, the
confirmation part, and R7, because no failing variant can pass. Grok 4.7 xhigh (hc t191) attacked
the null result and confirmed it (NULL HOLDS). Spend: USD 0.256 of the USD 15 cap. Full record:
[model-ranking/results.md](2026-11-03-model-ranking/results.md). Decision B is answered as
option (1); the TODO decision entry is deleted.

### #294 (Jev) evaluated against the same contract (2026-11-03)

Lane jev-eval (hc t18s, Codex Sol high, offline) regraded the author's recorded Jev rankings. The
headline table reproduces exactly. Jev has the largest development gain measured (legacy W − L
+20/+27 on mapped rows) but fails interference, repeat stability, the Extended lane, and forbidden
captures, and its query leaves Cloudflare. Evidence: results.md "Independent checks".

### D revisited: absorb Scout 1.9.116 (2026-11-03)

With B lexical-only, the coordinator re-measured D on the unchanged scorer (lane d-absorb, hc
t192, Codex Sol high, offline, live 1.9.116 inventory fetched 2026-11-03T15:18Z, SHA-256
`41a168a8…b637a`). With all four new operations excluded: one strict loss (`q-scf-how-to-apply`
top3), two gains, none of the five 1.9.71 losses recurs, holdout forbidden captures unchanged
(10/49). Decision under the owner's delegation: absorb (option a). Lane d-ship (hc t199) reconciles
the tests.
