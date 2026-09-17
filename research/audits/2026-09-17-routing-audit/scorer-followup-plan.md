# Scorer follow-up plan after the upstream prefix report

- Date: 2026-09-16 (local).
- Mode: read-only analysis.
- Candidate: D3 frozen at `d4cac5a9`.
- Not done: product edits, challenge or holdout reading, paid calls, external writes, or new agents.
- Throwaway measurement copy: `/tmp/raven-routing-audit-2026-09-17/code/fwdprefix/`
  (`cand` = D3 `src/catalog`, `fwd` = one-direction patch).
- Raw results: `fwdprefix/measure.json`, `fwdprefix/measure.txt`, `fwdprefix/wordpairs.mjs` output.

## 1. Verdict

1. Only one scorer defect is proven and externally owned: bidirectional prefix matching plus punctuation
   fragments inflates vendor coverage. It is upstream in `@cloudflare/codemode` through `main` `16b6856`.
   See `upstream-prefix-review.md`.
2. Removing only reverse-prefix matching is not a principled standalone repair for this product.
   - It matches a type-ahead contract (the query is a prefix of the field).
   - Raven receives complete natural-language questions. The reverse direction currently carries real
     query-side inflection (`projects`→`project`, `deployed`→`deploy`).
   - Measured result: +16 legacy top-1, but −11 legacy top-5, −11 extended top-5, and 301 of 338 legacy lists
     changed. It breaches the ±1% legacy band. Reject it as the next repair. Keep the data as evidence.
3. The next general experiment should replace prefix guessing with a defined token-equivalence contract,
   without authored length or frequency thresholds. Section 5 lists the options and required controls.
4. The source-authority contradiction lives entirely past the 2,048-character client clip. Correcting it
   changes only full-text consumers (full-injection MCP clients and the Playground), not the Claude Code
   visible prefix.

## 2. Proven bugs versus preferences

### Proven (reproducible defect against a stated contract)

| ID | Finding | Evidence | Owner |
|---|---|---|---|
| P1 | Fragment and short-token reverse-prefix matches count toward the vendor coverage gate. | Neutral fixture: `send slack message` → `weather.getForecast` (27); `read repository readme` → `billing.refundInvoice` (55, full-coverage bonus). Same in 0.4.2, 0.5.1, 0.5.2, `main`. The RWA issuer control gets vendor score 475 with 15 of 25 query tokens matched (coverage 0.6). Nine matches use stopwords or fragments; `actually→a` decides the gate. | Upstream Cloudflare `cloudflare/agents` `packages/codemode/src/connectors/search.ts:68`; Raven vendor copy and ungated replica |
| P2 | The tokenizer turns possessives and hyphenated prefixes into standalone tokens (`city's` → `s`, `re-billed` → `re`). | Same fixture. Census over lane questions × searchable entries: 64,587 reverse-only matches whose field token is 1–2 characters, for example `stellar<-s` 1,896, `are<-a` 2,752. | Upstream tokenizer (same file) |
| P3 | RWA controls could skip in CI when production exposes RWA. | Fixed and frozen in D3 (`26f64237`). | Raven test |
| P4 | Directory admission depended on source field placement. | Fixed and frozen in D3 (`181d5b0f`). Synthetic metamorphic controls fail on baseline. | Raven `search.ts` |

### Design or preference findings (not proven bugs; require their own hypothesis and measurement)

| ID | Finding | Why not a proven bug |
|---|---|---|
| Q1 | notFor positive coverage counts ubiquitous `stellar`. | The rule literally counts two positive phrase tokens. A frequency cutoff was rejected (91 lists, lost coverage). Any repair needs a defined weighting, not a cutoff. |
| Q2 | Routing-only rescue returns the full augmented score and marks the hit `gated`. | ARCHITECTURE defines tier 1 as the whole lever pipeline, including keyword rescue. The model-facing wording "gated (strict, primary)" is imprecise, but the behavior is documented. The removal ablation lost true RWA hits because `fullPageUngatedAdmission` is coupled to it. |
| Q3 | The stopword rescue runs only after a gate failure. | Documented and measured as intentional. Its interaction with P1 is the actual defect path. |
| Q4 | Case-shaped rules: freshness reorder (1 list), vocabulary intent (2), dense-vocabulary witness (3), `people→person` / `token≡asset` (2). | Overfit and reviewability debt, not incorrect output. Evaluate as one-rule deletion candidates, like D3. |
| Q5 | Single WisdomTree alias pack boosts one Lumenloop operation over an RWA operation. | Receipt-backed data. The brief says aliases are not invalid in general. Revisit only with RWA exposure. |
| Q6 | Five parallel stem and plural helpers (`canonicalRoutingToken`, `routingConceptToken`, `tokensOverlap`, `matchesIdentityToken`, `regularPluralBase`). | Duplication. A shared token-equivalence contract (Section 5) would remove it. |
| Q7 | Tests embed verbatim routing-case questions. | Reviewability risk. Overlap with holdout was not checkable in this lane. |

## 3. One-direction experiment: remove `token.startsWith(fieldToken)`, keep `fieldToken.startsWith(token)`

Patch (throwaway copy only), applied to both `src/catalog/vendor/search-scoring.ts` and the ungated replica in
`src/catalog/scoring.ts`:

```diff
- field.tokens.some((c) => c.startsWith(token) || token.startsWith(c))
+ field.tokens.some((c) => c.startsWith(token))
```

Validation: the `cand` copy reproduces the accepted gate totals (legacy 219/298/326, card@5 112; skills
17/23/23), so the harness matches `eval/run-routing.mjs` grading for these lanes. Holdout and fresh54 were not
run.

### Lane results

| Lane | Variant | top1 | top3 | top5 | card@5 | any@1 | any@5 | Lists changed |
|---|---|---|---|---|---|---|---|---|
| legacy (n=338) | cand | 219 | 298 | 326 | 112 | 254 | 336 | — |
| legacy | fwd | 235 | 298 | 315 | 110 | 279 | 327 | 301 |
| extended (n=122) | cand | 93 | 111 | 117 | 16 | 102 | 121 | — |
| extended | fwd | 94 | 101 | 106 | 10 | 106 | 116 | 107 |
| skills (n=23) | cand | 17 | 23 | 23 | 23 | 17 | 23 | — |
| skills | fwd | 17 | 23 | 23 | 23 | 17 | 23 | 21 |

Per-case direction:

- legacy: top-5 lost 15, gained 4; top-1 lost 17, gained 33.
- extended: top-5 lost 11, gained 0; top-1 lost 11, gained 12.
- skills: no grade change.

Gate impact: the legacy band is ±3 (1% of 338). Top-1 +16 and top-5 −11 both breach. Extended top-5 −11.

Extended top-5 losses: `q-aas-trusted-asset-list-whitelist`, `q-crp-anchors-by-corridor`,
`q-crp-custodial-vs-noncustodial-wallets`, `q-crp-remittance-founder-advisory`, `q-crp-tokenize-personal-rwa`,
`q-defi-market-making-kelp`, `q-edge-deep-leave-no-stone-unturned-wallets`, `q-scf-nontechnical-participation`,
`q-ti-contract-verification-explorers`, `q-ti-friendbot-ratelimit-alternatives`, `q-ti-launchtube-mercury`.

Legacy top-5 losses (all 15): `q-asset-rwa-tokenized-freshness`, `q-defi-aquarius-av`,
`q-defi-aquarius-what-is`, `q-defi-benji-franklin-templeton`, `q-defi-blend-alternatives`,
`q-defi-comet-content`, `q-defi-liquid-staking-whitespace`, `q-defi-phoenix-what-is`,
`q-defi-reflector-oracle`, `q-defi-soroswap-vs-stellarx`, `q-eco-stellar-rwa-stablecoin-volume`,
`q-eco-wallets-similar`, `q-edge-deep-leave-no-stone-unturned-defi`, `q-edge-noinfo-fake-project-quasarswap`,
`q-soroban-auth-recursion-dos-audit`.

### RWA controls (RWA-inclusive manifest, rank of `scout.getRwaAssets`; 0 = absent from top 5)

| Query | cand | fwd |
|---|---|---|
| Simulate a transfer of a tokenized bond through Stellar RPC. | 3 | 0 |
| How do I read a wallet balance for tokenized treasury assets? | 2 | 1 (worse) |
| As a Stellar asset issuer, can I charge transfer fees, cap supply, or freeze a holder…? | 1 | 1 |
| Four RWA discovery positives | 1, 2, 1, 1 | 1, 1, 1, 1 |
| Eight unrelated implementation negatives | all 0 | all 0 |

### Neutral upstream fixtures (vendored `scoreEntry`: weather, billing)

| Query | cand | fwd | Expected |
|---|---|---|---|
| send slack message | [27, null] | [null, null] | no match (fixed) |
| read repository readme | [null, 55] | [null, null] | no match (fixed) |
| city forecast | [153, null] | [153, null] | match |
| refund invoice | [null, 481] | [null, 481] | match |
| forecasts | [79, null] | [null, null] | match (lost inflection) |
| refunds invoices | [null, 133] | [null, null] | match (lost inflection) |

### Exact token and acronym controls (top 5)

- Unchanged: `rpc`, `scf`, `kyc`, `horizon`, `tx history` (alias), `lumenloop.search_directory`.
- Order-only changes (exact-ID first retained): `scout.searchProjects`, `stellarDocs.search_docs`, `SEP-24`.
- Tail membership changes: `sep`, `sac`, `dex`, `soroban`, `contracts`.
- Page shrinks, because tail entries matched only through reverse prefix: `xlm`, `wasm`, `defi`, `x402`,
  `passkeys`, `audits`, `stablecoins`, `hackathons`, `deployed`, `testing`.
- Top-1 moved: `anchors` (`search_anchor_sep_docs` → `skills.stellar-dev.standards`); `tokens`
  (`search_asset_token_docs` → `lumenloop.find_content_about_project`).

### Legitimate matches lost (reverse-only pairs from lane questions; descriptive classification, not a threshold)

572 distinct query tokens rely only on reverse prefix. 240 map to a field token of 3+ characters; 332 map to a
shorter field token.

- Legitimate inflection or word-form, lost by fwd: `projects<-project`, `operations<-operation`,
  `grants<-grant`, `funds<-fund`, `dexes<-dex`, `amms<-amm`, `flows<-flow`, `issued<-issue`,
  `deploys<-deploy`, `deployments<-deploy`, `simulates<-simulate`, `examples<-example`,
  `requirements<-requirement`, `signatures<-signature`, `programs<-program`, `organizations<-organization`,
  `auditors<-auditor`, `implementations<-implementation`, `languages<-language`, `passphrases<-pass`
  (partial), `trended<-trend`, `submits<-submit`, `emitted<-emit`, `typed<-type`, `prices<-price`,
  `indexing<-index`, `officially<-official`, `natively<-native`, `tiers<-tier`, `roles<-role`.
- Abbreviation-like: `info` (from `information`), `spec` (from `specify`/`specified`), `auth` (from
  `authenticate`/`authorized`) — the field holds the abbreviation and the query holds the full word.
- Spurious stems that fwd correctly removes: `model<-mode`, `hash<-has`, `ready<-read`, `logic<-log`,
  `factory<-fact`, `notable<-not`, `offer<-off`, `often<-oft`, `allbridge<-all`, `comet<-com`,
  `compile<-com`, `restore<-rest`, `definitive<-defi`, `address<-add`, `minimum<-min`, `backing<-back`.
- Fragments and stopwords that fwd correctly removes: `are<-a`, `there<-the`, `stellar<-s`, `soroban<-s`,
  `token<-to`, `official<-of`, `oracle<-or`, `issuer<-is`, `reflector<-re`, `soroswap<-so`.

Conclusion: reverse prefix mixes three things — real inflection, spurious stems, and fragments. Removing the
direction removes all three. No principled autocomplete contract separates them, so fwd is not an acceptable
standalone contract for question-shaped search.

## 4. Source-authority wording and the 2 KB prefix

Measured with the D3 worktree modules (`code/prefix-offsets.mjs`):

| Text | Length | Conflicting wording | Offset | Inside 2,048 clip |
|---|---|---|---|---|
| `BASE_SERVER_INSTRUCTIONS` | 1,977 | none. It says only "`stellarDocs.search_docs` for technical text" (offset 1,214). | — | yes (whole base) |
| `SERVER_INSTRUCTIONS` micro-map `AUTHORITY_RULES` | 7,864 total | "Official docs are authority …" / "for ecosystem facts … start Scout/Lumenloop even when docs mention the topic" | 3,839 / 4,034 | no |
| `EXECUTE_DESCRIPTION` skills paragraph | 9,684 total | "purely factual questions use docs first" | 5,956 | no |
| `SEARCH_DESCRIPTION` | 4,887 total | none relevant | — | — |

- Claude Code clips server instructions and tool descriptions at 2,048 characters
  (`test/mcp-instructions.test.ts`, `CLAUDE_CODE_INSTRUCTIONS_CAP`). This session's own injected Raven
  instructions end in `[truncated]` right after the base.
- A correction to either passage therefore changes only full-injection MCP clients and the Playground.
  The Playground uses full `SERVER_INSTRUCTIONS` (`src/demo/prompt.ts:28`) and full descriptions
  (`src/demo/tools.ts:269`).
- To change Claude Code-visible behavior, a rule must enter `BASE_SERVER_INSTRUCTIONS` under the 2,000-character
  budget. The base has 23 characters of headroom now, so any addition must displace existing base text. That
  is a separate prompt experiment with its own brief.

## 5. Practical follow-up plan

### Step 0 — Upstream (no local code)

File the drafted upstream report after approval (`upstream-prefix-review.md`). Track the upstream response.
Do not fork local vendor semantics silently.

### Step 1 — Token-equivalence contract experiment (replaces bidirectional prefix; no authored thresholds)

Hypothesis: a match should mean equal tokens or the same externally defined word form, not an arbitrary
prefix. Candidate definitions, each measured separately:

1. Symmetric standard English stemming with the Snowball/Porter algorithm, used as an external definition in
   the same way as the existing Snowball-style stopword provenance. Match when stems are equal. Keep the
   forward prefix only for the query's last token if type-ahead is a required contract (it is not currently
   documented).
2. Tokenizer contract: treat intra-word apostrophes as part of the word and drop the possessive/contraction
   suffix (`city's` → `city`). Treat hyphenated words both as the joined form and as parts, and exclude the
   bound prefix as its own token. This addresses P2 without a length threshold.
3. Combination of 1 and 2.

Apply the definition identically in the vendor copy, the ungated replica, and (in a later step) the five Raven
helper functions (Q6). Keep the drift guard equality. Do not introduce minimum lengths or document-frequency
cutoffs.

### Step 2 — Minimal required controls for any next scorer repair

1. Neutral upstream fixtures: `send slack message` and `read repository readme` → no match; `city forecast`,
   `refund invoice`, `forecasts`, `refunds invoices` → match.
2. Inflection controls from measured losses: `projects`, `operations`, `grants`, `funds`, `dexes`, `deployed`,
   `deploys`, `simulates`, `issued`, `passkeys`, `stablecoins`, `hackathons`, `audits`, `anchors` keep their
   base-form entries at the current rank class.
3. Spurious-stem negatives: `model/mode`, `hash/has`, `ready/read`, `logic/log`, `notable/not`, `offer/off`,
   `allbridge/all`, `comet/com` must not match through the shorter word alone.
4. Exact token and acronym controls: `rpc`, `sep`, `scf`, `xlm`, `sac`, `kyc`, `wasm`, `dex`, `defi`, `x402`,
   `horizon`, `SEP-24`, alias `tx history`, `acct balance`. Every searchable entry ID ranks itself first.
5. Lane gates: legacy strict ±band, extended, skills floors, card@5, accept-either; holdout and fresh54
   evaluated only by the eval lane.
6. RWA #167 controls on the RWA-inclusive manifest (CI-activated since D3), plus the four discovery positives
   and eight unrelated negatives.
7. D3 field-placement metamorphic controls and the exact-ID controls.
8. Vendor versus ungated replica drift guard (`test/scoring.test.ts`).
9. Runtime benchmark against the recorded runtime baseline.
10. Protocol-history diagnostic lane.

Stop rules: any exact-ID, exposure, or RWA-negative regression; any legacy or skills gate breach not explained
by reviewed per-case improvements; any change adopted by tuning against fresh54.

### Step 3 — One-rule deletion candidates (independent of Step 1)

Evaluate each separately with the D3 protocol:

- freshness reorder (1 list)
- vocabulary intent rule (2)
- dense-vocabulary witness (3)
- `people→person` and `token≡asset` (2)

Each needs synthetic mechanism controls and a reviewed record of the moved cases.

### Step 4 — Deferred design questions (need their own briefs)

- Q1: notFor positive-coverage weighting. Needs a defined weighting model, not a cutoff.
- Q2: tier semantics for routing rescue. Requires a coupled change with `fullPageUngatedAdmission`, because
  removal alone lost true RWA hits.
- Source-authority wording (Section 4). This is a prompt experiment, separate from scorer work. State whether
  it targets the full-text surfaces only or the base prefix.
