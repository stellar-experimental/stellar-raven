SHIP — all three reviewed findings are fixed.

1. **Finding 1: fixed.**

   Files: `eval/qa/lint-corpus.mjs` and `test/qa-corpus-lint.test.mjs`.
   The join condition now excludes complete caps and independent attribution sentences.
   The updated expression recognizes the existing imperative form.
   The original probe now reports the expired sd-901 cap when an active sd-902 cap follows it.
   The standalone WisdomTree imperative now reports a missing finding.
   The four new tests cover both cap orders and imperative caps with and without an active finding.
   All 52 tests passed.

   I compared detection across all 501 battery cases against the first review.
   Both versions detect 33 cap units and produce zero cap-finding warnings.
   Two sentence spans change because of the algorithm:

   - `q-defi-wisdomtree-crdt`: the detected unit now includes the following imperative grade sentence.
   - `q-eco-lobstr-wallet`: the detected unit now excludes the preceding plain leniency sentence.

   The LOBSTR cap remains detected with the same active findings.
   This is a harmless correction, not a lost cap.
   No other note changes detection because of the algorithm.
   The Blend cap text also changes because the author fixed finding 2.
   `tmp/rv-caps/detection-comparison.json` records the complete comparison.

2. **Finding 2: fixed.**

   Files: `q-edge-fresh-latest-blend-tvl.json` and `q-edge-noinfo-exact-tvl-figure.json`.
   The Blend cap now covers only missing quarter history under declined sls-039.
   It explicitly rejects credit for cached copies without provider or methodology fields.
   Both cases retain provider and date requirements.
   The verification records now describe the corrected sibling comparison.

   I repeated both live requests at 2026-11-02T21:53:20Z.
   [The Blend query](https://stellarlight.xyz/api/projects/search?q=Blend) returned `tvlSource: defillama`, `tvlMethodUrl`, and `tvlAsOf`.
   [TVL analysis](https://stellarlight.xyz/api/analyze?dimension=tvl) returned `provider: DefiLlama`, `asOf`, and `totalTvlUSD`.
   These responses support removing the resolved provenance exception.
   Only the Blend notes changed among these clusters' judge-facing fields since the first review.

   | Cluster | Verdict | Reason |
   |---|---|---|
   | cluster-021 | consistent | q-defi-aquarius-what-is, q-defi-defindex-honest, q-eco-defi-tvl-current, q-edge-fresh-latest-blend-tvl, and q-edge-noinfo-exact-tvl-figure preserve provider/date rules and limit partial credit to missing history. |
   | cluster-045 | consistent | q-defi-aquarius-what-is, q-defi-defindex-honest, q-eco-defi-tvl-current, q-edge-fresh-latest-blend-tvl, and q-edge-noinfo-exact-tvl-figure preserve provider/date rules and limit partial credit to missing history. |

3. **Finding 3: fixed.**

   Files: `q-soroban-auth-recursion-dos-audit.json` and `q-tool-soroban-auth-audit-live.json`.
   Both notes now date live confirmation to 2026-08-28.
   Both replace the unsupported pre-2026-08-25 cutoff with “earlier exact miss”.
   Their verification records distinguish the ingest commit from live confirmation.

   I fetched [the resolution comment](https://github.com/Stellar-Light/stellarlight/issues/1031#issuecomment-5455030587) at 2026-11-02T21:53:21Z.
   It states: “Independent verification on 2026-08-28 found the Veridise record first”.
   Fresh live requests also confirm the current behavior.
   V-SOR-APP-VUL-003 returns the Veridise record first with `exactKeys` and no `meta.exactMiss`.
   V-SOR-APP-VUL-999 retains its exact-miss warning.

| Check | Exit code | Result |
|---|---:|---|
| `node tmp/rv-caps/lint-probe.mjs` | 0 | Both reported detection defects are fixed. |
| `npx vitest run test/qa-corpus-lint.test.mjs` | 0 | 52 tests passed. |
| `npm run eval:qa:lint -- --since d6ad7350 --stale --enforce-floors` | 0 | 0 errors; 93 warnings; zero cap-finding warnings. |

Evidence: `tmp/rv-caps/recheck-sources.json`, `recheck-source-*.json`, `recheck-gate-*.log`, and `detection-comparison.json`.
I changed no tracked files and reviewed only the requested fixes.
