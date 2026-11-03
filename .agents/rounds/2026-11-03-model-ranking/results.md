# Results: model-assisted search ranking (2026-11-03)

Verdict: **no ship**. No primary variant passes the repeat-1 development rules of the signed
contract ([contract.md](contract.md), Amendment 1, SHA-256
`a1cf67f6cb77e449ef2156b7cd39a1bb0902dd22f2e9ee8d3dbf330cc77c2346`). Search stays lexical-only.
Repeat 2, the confirmation part, and the R7 latency windows did not run, because a variant that
fails repeat 1 cannot pass (selection uses the lower repeat). No confirmation row was graded.

Coordinator: hc t16 (Claude Opus 5.5). Clarifications C1–C7 are in
[the owner follow-up ledger](../2026-11-03-owner-followup.md). Spend: USD 0.256 actual of the
USD 15 cap, all Workers AI through `cf` OAuth.

## Sources

Both sources reproduce the harness section 3 baselines exactly.

| Source | Build | `catalog/manifest.json` SHA-256 |
|---|---|---|
| main | clean clone at `e530c7f4` | `f018b979460a9a0d22bfafb9b2b57b67d7ddb31650719fd8a190bdcb6bbc1534` |
| fresh | `e530c7f4` + Scout 1.9.111, 682 titles, skill pin `789c9061` | `3d688f150cc53b0a3f169cc90e2e8792a1501d5373a4ae07a48d7552da7aaff5` |

Fallback pages are byte-identical to the baseline on both sources for every lane, probe, and
slice at `limit` 5 and 10 (4,230 pages per source).

## Development grades, repeat 1

Development part: 170 legacy and 12 skills rows per source (`partition.json`). W and L count
strict-key flips (top1, top3, top5, cardHit5). Q score input = W − 2L.

| Variant | Family | Legacy W−L main / fresh | Skills W−L | Q score input | First failing rule |
|---|---|---|---|---:|---|
| P1 `a-bb-mult` | bge-base, MULT β 0.15 | +5 / +7 | +1 / +1 | +5 | Q4 (both sources), also N8 |
| P2 `a-bb-rrf-m10` | bge-base, RRF + 10 | −22 / −18 | +2 / +2 | −136 | Q1 |
| P3 `a-bbp-rrf-m10` | bge-base prefixed, RRF + 10 | −19 / −20 | +2 / +2 | −132 | Q1 |
| P4 `a-q3-rrf-m10` | qwen3-embedding, RRF + 10 | −91 / −89 | +2 / +2 | −394 | Q1 (also Q9) |
| P5 `d-k-rrf` | bge-reranker, RRF | −33 / −30 | +2 / +2 | −163 | Q1 |
| P6 `c-cf-k-rrf` | clef-flash, RRF | +19 / +17 | +2 / +2 | 0 | Q3 main, Q2 fresh (also Q4, N8, Q9 fresh) |
| P7 `c-cl-k-rrf` | Clef, RRF | — | — | — | R6: USD 1.486 / 1,000 searches (limit USD 1.00) |
| P8 `f-dr` | dense + reranker | −37 / −35 | +2 / +2 | −197 | Q1 |

- P1 promotes hackathon operations on non-hackathon rows (for example `scout.searchHackathonBuilds`
  to rank 1 or 2 on `q-defi-stellarx-what-is` and `q-defi-streaming-payments-prior-art`), and
  moves Lumenloop content search down on S3 slices.
- P6 has the best net gain but 20 losses per source. Eleven (main) and eight (fresh) losses
  promote a page outside every accepted label (class u; the cap is 2). Fresh legacy top1 falls
  115 → 114. Removing the dApp override costs `q-sep-45-contract-auth` its top1 on fresh.
- The RRF variants replace the lexical selector and admit up to 10 model-only entries. They lose
  far more rows than they gain.
- The 2026-11-02 dense diagnostic (b1, W − L +20/+21) is the same MULT design. Its larger total
  includes the extended and holdout lanes, which this contract keeps gate-only, on all 338 legacy
  rows instead of the 170 development rows.

Cost screens (list price, margin included): P1 USD 0.0030, P5 USD 0.0130, P6 USD 0.235 per 1,000
searches. Clef fixed frame: 6,203 input tokens for a 60-card pool. All 26 captures finished with
zero `invalid` keys. One fresh bge-base batch recorded 30 false `error` keys: the error
classifier matched `\b401\b` inside embedding floats. The classifier was fixed and the keys were
repaired once under C2.

## Independent checks

- Grok 4.7 xhigh attacked the null result (read-only, offline regrade of P1 and P6, 12 loss
  rows checked by hand): **NULL HOLDS**. The fusion arithmetic matches the declared rules, and the
  W and L counts reproduce. It found one grader gap that does not change the verdict: the card
  `scout_hackathon_detail` binds to no catalog operation (`eval/lib/grade.mjs` `cardMatches`), so
  N15 cannot classify `q-scf-hackathon-detail-results` as a hackathon row. Other P1 Q4 failures
  stand without that row.
- Recorded Jev rankings (stellar-experimental/stellar-raven#294, fork
  `christian-rogobete/stellar-raven@897a2737`, Raven `b1dc8663`), graded offline under the same
  rules by Codex `gpt-6.1-sol` high. The headline table reproduces exactly. On mapped development
  rows Jev gains legacy W − L +20/+27, more than any in-network variant. It fails development
  interference (`scout.compareHackathons` to rank 3/2 on a non-hackathon row), repeat stability
  (415 of 792 ranked lists agree exactly between repeats; 11 strict-key changes on development rows
  against a limit of 5), the Extended lane (−20 to −24), and holdout forbidden captures (10 → 21/20).
  It uses a 2,000 ms deadline and sends the query outside Cloudflare.

## Evidence

Ignored archive in the main checkout: `eval/results/2026-11-03-model-ranking-evidence.tar.gz`
(SHA-256 `8cc9cc917e0aad987a333c037f9ab04a81f17d100518ba6314674e06d4d324e1`). It holds the
fixtures, capture manifest, spend ledger, grade reports, the Jev regrade, the null attack, and the
experiment seam (`src/catalog/ranking.ts`). The experiment code is not a runtime change.

## Consequences

- Owner decision B: answered as option (1), search stays lexical-only. The `AGENTS.md` rule
  change in `runtime-design.md` A1.7 does not apply.
- A future round needs a new contract. The evidence points to two leads: model evidence that
  cannot promote hackathon operations or unlabeled skills (P1 and P6 fail mostly there), and
  a stable ranker (Jev's repeat churn).
