# Closeout proposal — protocol-history attempt three

Date: 2026-09-01
Author: Claude Fable 5 high
Status: proposed edits only. This report changes no documentation file. It reads the local result
file, the Terra verification, the ledger, `.agents/NEXT.md`, `.agents/TODO.md`, `eval/README.md`,
and `eval/vectorize/README.md`. It opens no cache. It loads no model. It uses no network.

## 1. Facts to record

| Fact | Value |
| --- | --- |
| Experiment | `clause-support-fit-v1` (Terra family 3; noisy-OR over the frozen 683 clauses; stable sort; no margin, no grid) |
| Measured outcome | `FAIL` |
| Verification | `result-verification-terra.md`, verdict `PASS`, zero discrepancies |
| Result stamp | `2026-09-01T14-22-28-993Z-clause-support-fit-v1` |
| Result SHA-256 | `a522bfa28ef4b06146c5f247ba64c08bfd6edaa4a81a0642c4010da2d6de479c` |
| Local result | `eval/vectorize/results/2026-09-01T14-22-28-993Z-clause-support-fit-v1.json` (gitignored) |
| Retained copy | `~/.cache/stellar-raven/eval-results/clause-support-fit-v1-2026-09-01/` (same SHA-256) |
| Implementation commit | `24de12200c459ac0ce9ae91e7a4f39988429bf20` |
| Source cache | attempt-two pair scores; file `fa1252fc…c2cec0bc`; scores `44c27468…c16fcd55`; record `ecea4c69…a01512fca1`; 563 queries; 383,273 scores |
| Calibration | identity `PASS`; max-clause `PASS` |
| Attempt accounting | attempt three is spent; the three-attempt box is spent |
| Production change | none |
| `improvements/` finding | none; the result measures this repository's ranking |
| Cost | `$0`; no model run; no network; no paid call |

Readings from the result file (Terra reproduced each one):

| Reading | Original top-1/3/5 of 8; captures | Blind top-1/3/5 of 11; captures | Changed rankings | New target captures | Routing gate |
| --- | --- | --- | ---: | ---: | --- |
| identity | 3/4/4; 1/4 | 3/3/3; 6/9 | 0 | 0 | pass |
| max-clause | 3/4/5; 2/4 | 2/2/3; 4/9 | 495 | 67 | fail |
| support-fit | 4/6/7; 2/4 | 5/6/10; 7/9 | 495 | 158 | fail |

Support-fit detail:

- Positive misses: `ph-protocol-upgrade-chronology`; `phb-auth-recursion-auditors`.
- Control captures: `ph-control-current-protocol`, `ph-control-validator-vote`;
  `phb-control-protocol-xdr-bug`, `phb-control-contract-fail-after-upgrade`,
  `phb-control-incident-runbook`, `phb-control-sdk-version-history`,
  `phb-control-kyc-breach-report`, `phb-control-client-protocol-version-failure`,
  `phb-control-failed-deploy-post-mortem`.
- Lane totals: legacy 220/266/276; skills 18/20/20; holdout 22/35/41 with 19 forbidden
  captures; extended strict 55/89/96; extended accept-either top-5 118.
- Gate failures: legacy top-1, top-3, top-5; holdout forbidden captures; all three extended strict
  floors; extended accept-either; `q-protocol-version-history-list` top-1 became
  `scout.searchResearch`.

Reading of the result. Multi-clause aggregation moved recall. Blind top-five rose from 3 to 10.
That is the best measured blind recall in the box. Precision fell at the same time. Control
captures rose to 2/4 and 7/9. The routing gate failed on every lane except skills top-1. The
pre-registered flood risk P2 (25 target clauses against a median of 6) is the measured cause
class. The measurement is decisive for this mechanism. It does not authorize a fourth attempt.

## 2. Status changes

### 2.1 `.agents/TODO.md` — routing item, append after the attempt-two paragraph

Keep the item open. The defect remains. Change its action state from "held for a brief" to
"box spent; trigger-only". Proposed text:

> The 2026-09-01 `clause-support-fit-v1` measurement also produced a verified `FAIL`.
> It was cache-only multi-clause aggregation over the retained attempt-two pair scores.
> Its result stamp is `2026-09-01T14-22-28-993Z-clause-support-fit-v1`, and its result SHA-256 is
> `a522bfa28ef4b06146c5f247ba64c08bfd6edaa4a81a0642c4010da2d6de479c`.
> Blind top-five rose from 3/11 to 10/11, while control captures rose to 2/4 and 7/9.
> The routing gate failed on legacy, holdout, and extended.
> The full record is `.agents/rounds/2026-09-01-protocol-history-attempt-three.md`.
> Attempt three is spent. The three-attempt box is spent. No fourth attempt is authorized.
> No production change shipped, and no `improvements/` finding applies.
>
> Reopen only through a trigger in
> `.agents/rounds/2026-09-01-protocol-history-attempt-three/brief-fable.md` section 16:
> T1 an upstream `x-routing` change for `GET /api/research`; T2 an owner decision on the frozen
> control set or the 19/19 bar; T3 an owner decision to open a new box for a non-card evidence
> source; T4 two or more unrelated live routing misses with transcripts.

The "Done when" sentence stays unchanged.

Optional monitor item, eval instruments section (single-source, monitor-only):

> ### Monitor vendor short-token prefix matching
>
> The 2026-09-01 token audit found that the vendored scorer's prefix rule has no minimum length.
> The tokenizer keeps one-character tokens, so a description that contains `a` prefix-matches
> every query token that starts with `a`. This is a single-source observation. Do not edit the
> vendor file from it. Record: `.agents/rounds/2026-09-01-protocol-history-attempt-three.md`.
>
> Done when: a second unrelated routing case shows coverage inflation from a one-character or
> two-character token, or a re-vendor changes the rule.

### 2.2 `.agents/NEXT.md`

- Header: `Updated 2026-09-01 after the attempt-three closeout.`
- State at handoff, add two bullets:
  - "The `clause-support-fit-v1` routing experiment completed on 2026-09-01 with a verified
    `FAIL`. Its stamp is `2026-09-01T14-22-28-993Z-clause-support-fit-v1`. Attempt three is
    spent. The three-attempt box is spent. No production routing change shipped."
  - "The support referee and its 18 tests are committed at `24de1220` and remain as the frozen
    cache-only instrument."
- Block 1 (routing): retitle to `Routing (box spent, trigger-only)`. Replace the two
  attempt paragraphs with one paragraph: three attempts, three verified `FAIL` results, stamps
  for each, the section 16 triggers, and "Do not start a fourth attempt." Move the block to the
  end of the ranked list.
- Block 2 (repository-level tooling recovery): unchanged text. It stays blocked until the free
  Horizon probe returns `28`.
- Block 3 (eval instruments): becomes ranked block 1. Its first item is the Raven
  capability-boundary diagnostic design. Its text is unchanged.
- Owner decisions: keep the product-loss margin question. Add one entry: "Decide whether to
  re-examine the frozen protocol-history control set or the 19/19 bar (trigger T2), or to open a
  new box for a corpus-derived route vocabulary source (trigger T3). Both need network or contract
  changes that no agent may start alone."
- Suggested sequence: "Start block 1 (the Raven diagnostic plan). Keep block 2 monitor-only until
  its probe returns `28`. Keep routing trigger-only. Resolve the two owner decisions when ready."

### 2.3 `eval/vectorize/README.md` — new dated section after the cross-encoder section

> ## Clause-support measurement attempt (2026-09-01)
>
> `clause-support-fit-v1` is attempt three of the protocol-history routing box. It reads the
> retained attempt-two pair-score cache only (file SHA-256 `fa1252fc…c2cec0bc`, scores
> `44c27468…c16fcd55`, record `ecea4c69…a01512fca1`). It replaces the max-clause fit with
> noisy-OR over each entry's positive and negative clauses. The negative rule is unchanged. The
> ordering is a stable descending sort of the attempt-two candidate union. There is no margin
> and no grid. The referee loads no model and scores no pair. Run it with
> `npm run eval:vectorize:support:run`; it needs `RAVEN_SUPPORT_CACHE_PATH` and
> `RAVEN_SUPPORT_IMPLEMENTATION_COMMIT`.
>
> The one authorized referee ran at commit `24de12200c459ac0ce9ae91e7a4f39988429bf20`. The
> stamp is `2026-09-01T14-22-28-993Z-clause-support-fit-v1`. The result SHA-256 is
> `a522bfa28ef4b06146c5f247ba64c08bfd6edaa4a81a0642c4010da2d6de479c`. Both calibrations passed:
> identity reproduced the lexical baseline, and max-clause reproduced the attempt-two pure
> reading.
>
> | Reading | Original top-five / controls | Blind top-five / controls | Routing gate | Changed rankings | Outcome |
> | --- | --- | --- | --- | ---: | --- |
> | identity | 4/8, 1/4 | 3/11, 6/9 | pass | 0 | calibration only |
> | max-clause | 5/8, 2/4 | 3/11, 4/9 | fail | 495 | calibration only |
> | support-fit | 7/8, 2/4 | 10/11, 7/9 | fail | 495 | fail |
>
> Support-fit raised blind top-five from 3 to 10 and original top-five from 4 to 7. It also
> raised control captures to 2/4 and 7/9, and it failed the routing gate on legacy (220/266/276),
> holdout (19 forbidden captures), and extended (55/89/96; accept-either 118). The measured
> outcome is `FAIL`. The independent Terra verification recomputed all three readings from the
> same cache and passed. No production search code changed. No `improvements/` finding applies.
> Attempt three is spent; the box is spent. See
> `.agents/rounds/2026-09-01-protocol-history-attempt-three.md` for the full record.

### 2.4 `eval/README.md` — one paragraph after the attempt-two paragraph

> The reviewed cache-only attempt three, `clause-support-fit-v1`, completed on 2026-09-01 and
> measured a verified `FAIL`: multi-clause aggregation raised blind recall to 10/11 but raised
> control captures to 7/9 and failed the routing gate. The experiment changed no production
> search code. The three-attempt box is spent. See `eval/vectorize/README.md` for the pins and
> table.

### 2.5 Round ledger — required before the documentation edits

The ledger has no referee entry and no verification entry yet. Append three entries: the
referee run (stamp, result hash, retained copy, exit status `1`, three readings), the Terra
verification (`PASS`, zero discrepancies), and the closeout. Rewrite the Outcome section to
`Complete`, with the `FAIL` result, the spent box, and the pointers above.

## 3. Next ranked block

Ranked block 1 becomes the eval-instruments item "Design a new Raven capability-boundary
diagnostic". It is free design work. Its gate is an independently reviewed plan with a new
mechanism and a new pre-registered diagnostic before any headline sample. No other free,
unblocked own-repo block exists in `.agents/TODO.md`.

## 4. Items that stay open or blocked

| Item | State | Reason |
| --- | --- | --- |
| Routing: `search` does not surface the research lane | open; trigger-only | three verified `FAIL` results; no fourth attempt; reopen only via T1–T4 |
| Repository-level tooling recovery | blocked; monitor-only | free Horizon probe still `25`; needs `28` |
| Owner decision: paired-QA product-loss margin | open; human-only | product impact decision |
| Owner decision: protocol-history contract (T2) or new non-card box (T3) | open; human-only | contract or network change |
| Friendbot network-context synthesis | monitor-only | single case |
| Stellar-Light/stellarlight#1031 | quiet watch | maintainer owns the close |
| `sls-080` | verified active | unchanged by this round |
| Vendor short-token prefix observation | monitor-only | single source |
| Local results under `eval/vectorize/results/` and both `~/.cache/stellar-raven/eval-results/` directories | retained evidence | prune eligibility after 2026-10-01 per `eval/EVALS.md` rule 7 |

## 5. What the closeout must not do

- Do not start, brief, or reserve a fourth attempt.
- Do not change `eval/gates.json`, either frozen contract, or any file under `src/`.
- Do not file an `improvements/` finding from this result.
- Do not edit the vendor scorer from the prefix observation.
- Do not run a paid lane. The next paid QA still needs its own pre-spend plan and review.
