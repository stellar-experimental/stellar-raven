# Porter stemming experiment — token equivalence instead of bidirectional prefix

- Date: 2026-09-16 (local).
- Upstream prefix report: cloudflare/agents#2296.
- Candidate base: D3 frozen at `d4cac5a9`. The worktree is clean. D3 was not changed.
- Scope: one definition, no parameter search. No product edits, holdout or fresh54 reads, paid calls, or
  external writes.
- RWA stays excluded. The RWA-inclusive manifest was used only for the original controls.
- Workspace: `/tmp/raven-routing-audit-2026-09-17/code/stem/`
  - `v/cand/src/catalog`: copy of D3.
  - `v/stem/src/catalog`: the single change.
  - `measure.mjs`, `measure.json`: all measurements.
  - `losses.mjs`: mechanism of the top-5 losses.
- Grading uses `eval/lib/grade.mjs` and `eval/lib/labels.mjs`. The `cand` copy reproduces accepted totals
  (legacy 219/298/326, card@5 112; skills 17/23/23).

## Definition

- Package: `stemmer@2.0.1` (`github.com/words/stemmer`, MIT). It implements the published Porter (1980)
  algorithm and was installed only in the temporary directory.
- Change, identical in `vendor/search-scoring.ts` and the ungated replica in `scoring.ts`:

```diff
- field.tokens.some((c) => c.startsWith(token) || token.startsWith(c))
+ field.tokens.some((c) => porterStem(c) === porterStem(token))
```

- Order is unchanged: exact token (×4), then equal Porter stem (×2, replacing both prefix directions), then raw
  substring (×1).
- `porterStem` memoizes `stemmer(token)`.
- No custom suffixes, length thresholds, query maps, or token lists.
- Raven's own helper overlap functions are untouched.

## Results

### Routing lanes (limit 5)

| Lane | Variant | top1 | top3 | top5 | card@5 | any@1 | any@3 | any@5 | Lists changed |
|---|---|---|---|---|---|---|---|---|---|
| legacy n=338 | cand | 219 | 298 | 326 | 112 | 254 | 321 | 336 | — |
| legacy | stem | 231 | 303 | 318 | 111 | 273 | 320 | 328 | 316 |
| extended n=122 | cand | 93 | 111 | 117 | 16 | 102 | 118 | 121 | — |
| extended | stem | 94 | 104 | 108 | 10 | 104 | 115 | 116 | 117 |
| skills n=23 | cand | 17 | 23 | 23 | 23 | 17 | 23 | 23 | — |
| skills | stem | 17 | 23 | 23 | 23 | 17 | 23 | 23 | 22 |

Per-case direction:

- legacy: top1 +29/−17; top3 +18/−13; top5 +4/−12; card@5 +13/−14.
- extended: top1 +11/−10; top3 +4/−11; top5 +1/−10; card@5 +0/−6.
- skills: top1 +1/−1, otherwise unchanged.

Gate: the legacy band is ±3. Top-1 +12 and top-5 −8 both breach.

### Top-5 losses

- Legacy (12): `q-asset-rwa-tokenized-freshness`, `q-defi-aquarius-av`, `q-defi-aquarius-what-is`,
  `q-defi-benji-franklin-templeton`, `q-defi-blend-alternatives`, `q-defi-comet-content`,
  `q-defi-phoenix-what-is`, `q-defi-reflector-oracle`, `q-defi-soroswap-vs-stellarx`,
  `q-eco-stellar-rwa-stablecoin-volume`, `q-eco-wallets-similar`, `q-edge-deep-leave-no-stone-unturned-defi`.
- Legacy gains (4): `q-eco-defi-tvl-current`, `q-eco-stablecoins-on-stellar`, `q-eco-wallets-overview`,
  `q-soroban-storage-types`.
- Extended losses (10): `q-aas-trusted-asset-list-whitelist`, `q-crp-anchors-by-corridor`,
  `q-crp-custodial-vs-noncustodial-wallets`, `q-crp-remittance-founder-advisory`, `q-crp-tokenize-personal-rwa`,
  `q-edge-deep-leave-no-stone-unturned-wallets`, `q-edge-exchange-memo-lost-funds`,
  `q-scf-nontechnical-participation`, `q-ti-contract-verification-explorers`, `q-ti-launchtube-mercury`.
- Extended gain (1): `q-sor-reflector-integration-code`.

Loss mechanism: for each lost expected-service entry, I counted query-to-field pairs that matched only through a
prefix and have no equal Porter stem. That gives 184 pairs.

- 160 involve a token of 1–2 characters: fragments or stopwords such as `aquarius~a`, `token~to`, `on~once`,
  `i~incidents`, `does~do`, `amm~a`, `stellar~s`.
- 24 involve longer tokens:
  - Spurious, correctly removed: `there/they/them~the` (13), `without~with` (2), `report~repo`, `offer~off`,
    `forgot~for`.
  - Legitimate forms lost: `users~use` (2; Porter gives `user` / `us`), `fully~full` (2; `fulli` / `full`),
    `recover~recovery` (`recov` / `recoveri`), `build~builders` (derivation).

Most losses are entity-name "what is X" questions. Their expected family was admitted mainly by fragment and
stopword prefix matches, not by real lexical evidence.

### Original RWA controls (RWA-inclusive manifest; rank of `scout.getRwaAssets`, 0 = absent)

| Control | cand | stem |
|---|---|---|
| Simulate a transfer of a tokenized bond through Stellar RPC. | 3 | 0 |
| How do I read a wallet balance for tokenized treasury assets? | 2 | 2 |
| As a Stellar asset issuer, can I charge transfer fees, cap supply, or freeze a holder…? | 1 | 1 |
| Four discovery positives | 1, 2, 1, 1 | 1, 1, 1, 1 |
| Eight unrelated implementation negatives | all 0 | all 0 |

### Neutral upstream fixtures (vendored `scoreEntry`: weather, billing)

| Query | Expected | cand | stem |
|---|---|---|---|
| send slack message | none | [27, null] | [null, null] |
| read repository readme | none | [null, 55] | [null, null] |
| city forecast | weather | [153, null] | [153, null] |
| refund invoice | billing | [null, 481] | [null, 481] |
| forecasts | weather | [79, null] | [79, null] |
| refunds invoices | billing | [null, 133] | [null, 133] |
| forecast cities | weather | [null, null] | [143, null] (gain: `city`/`cities` → `citi`) |

### Exact IDs and drift guard

- Exact ID ranks itself first: 80/80 for both `cand` and `stem`.
- Gated scorer versus ungated replica, over lane plus RWA queries × searchable entries where the gate passes:
  `cand` 3,798 checked, 0 mismatches; `stem` 1,212 checked, 0 mismatches.

### Token controls (top-5 membership; totals cand → stem)

- Acronyms unchanged: `rpc`, `scf`, `kyc`, `horizon`, `tx history`.
- Tail shrink, from fragment matches removed: `xlm` 7→3, `wasm` 4→2, `defi` 4→1, `x402` 5→1.
- Other acronym changes: `sep`, `sac`, `dex` (tail swap); `SEP-24` (order, total 5→12); `acct balance` (tail,
  total 25→6).
- Word forms that keep their base-form entries: `projects`, `funds`, `hackathons`, `tokens`, `contracts`,
  `testing`, `deployed`, `deploys`, `simulates`, `stablecoins`, `passkeys`, `audits`, `anchors`.
  - Their tails shrink where fragment matches were removed: `passkeys` 7→2, `audits` 25→4, `anchors` 29→14,
    `issued` 12→4, `grants` 5→1.
  - `dexes` 1→0: no catalog token `dex`; the old hit came from a fragment.
- Spurious stems removed: `model` 1→0, `hash` 4→0, `ready` 5→1, `notable` 15→0, `offer` 25→0,
  `allbridge` 22→0, `comet` 1→0. `logic` stays 0.

### Runtime (483 lane queries, limit 5, seven alternating passes)

| Variant | Median pass | Per query |
|---|---|---|
| cand | 3,259.8 ms | 6.749 ms |
| stem | 6,737.8 ms | 13.950 ms |

The single definition as written is 2.07× slower. Precomputing field stems would not change semantics, but it was
not measured, per the one-definition rule.

## Feasibility and regressions

Feasible as a principled definition:

- It fixes both upstream false matches.
- It removes fragment, stopword, and spurious-stem matches.
- It keeps regular inflection and adds some (`cities`).
- Exact IDs, the drift guard, RWA negatives, and skills all hold.
- RWA control 1 is fixed. One RWA positive improves.

Not shippable as measured:

1. Legacy gate breach both ways (top1 +12, top5 −8). Extended top5 −9, top3 −7, card@5 −6.
2. Most losses are questions that relied on fragment evidence. Removing false evidence exposes that lexical search
   has no entity evidence for those questions, so any adoption needs an entity or recall repair first, or a
   reviewed re-baseline.
3. Porter overstemming and derivation limits lose `users/use`, `recover/recovery`, `fully/full`,
   `build/builders`.
4. RWA controls 2 and 3 are unchanged. Stemming does not solve the mixed-intent or issuer controls.
5. Runtime doubles in the direct implementation.
6. It deviates from vendored upstream semantics and adds a dependency. Adoption needs a winning A/B under the
   correctness-over-cost rule, or an upstream-aligned change through cloudflare/agents#2296.

Stop point: one definition measured. No Snowball variant, prefix hybrid, or optimization was tried.
