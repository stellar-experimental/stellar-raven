# Item 6.2 independent diff review

Reviewer: Codex frontier review lane, terminal `t1w2`; requested profile GPT-6 Astra, high effort.
Reviewed `np/6.2-docs-titles` at `d02c97ba1aefd2d51969dfade8c2e4317b09c038` against
`origin/main` at `5279f46a950068cd900f9a224f13b52178e6f275`, 2026-11-17.
Scope: the six checks in `briefs/CODEX-BRIEF.md`. No model calls, paid calls, tracked edits,
QA case reads, QA lint, split-file reads, or split-amendment execution.

## Findings

1. **Low — the per-arm budget check does not reserve a retry.**
   `items/6.2/ab-run.mjs:115-139` checks `spent + 4 <= 25` before the question, then can call
   `runAgent` twice before adding either attempt's cost to `spent`. At `spent = 20`, an attempt
   charged at USD 4 (including the null-cost fallback) plus its USD 4 retry can reach USD 28.
   This violates the declared per-client/arm cap if that path is used. **It did not affect this
   experiment:** every one of the 60 retained records has exactly one attempt, and the largest
   arm total is USD 6.37. Fix before reuse by checking the remaining arm budget before each
   attempt, including already incurred costs for the current question, and recording the failed
   attempt when the retry cannot fit. For this completed, pre-registered experiment, record the
   limitation without changing the historical scoring or collecting again. This does not block
   accepting the measured re-baseline.

No blocking or should-fix finding on the completed A/B, generated artifacts, or routing re-baseline.

## Routing and provenance

Ran the runner against the `origin/main` manifest exported to
`tmp/6.2/codex-base-manifest.json`; ran `npm run eval:routing -- --gate` against the branch.
Both commands exited 0. Runner stdout was redirected throughout. The old-manifest run has the
expected advisory evidence mismatch against the branch's new manifest fingerprint; the branch
run reports `GATE PASS`.

Independent traces:

- Base: `eval/results/routing-2026-11-17T20-20-11-436Z.json`.
- Branch: `eval/results/routing-2026-11-17T20-20-21-862Z.json`.
- Logs: `tmp/6.2/codex-base-routing.txt`, `tmp/6.2/codex-branch-routing.txt`.

Compared with `node tmp/6.2-compare.mjs <base> <branch>`, preserving holdout and
confirmation-only rows as counts. Every numerical statement in the new evidence note reproduces:

| Lane | Base → branch | Top-five list changes | Score-only changes |
|---|---|---:|---:|
| Legacy (338) | top1 220 → 219; top3 293 → 293; top5 327 → 326; cardHit5 113 → 113 | 18 | 41 |
| Extended (122) | top1/top3/top5/cardHit5 93/112/117/16 unchanged | 24 | 29 |
| Skills (23) | top1/top3/top5/cardHit5 17/23/23/23 unchanged | 2 | 3 |
| Protocol history (12) | All rows and aggregates identical | 0 | 0 |
| Holdout (49), counts only | top1 12 unchanged; top3 27 → 26; top5/cardHit5 30/30 unchanged; captures 11 and passed 24 unchanged | 5 | 7 |

Legacy losses are precisely `q-infra-hubble-vs-rpc-layer` (RPC/Horizon rank 1, score 433,
to rank 5, score 180; top1 and any1 lost) and `q-edge-exhaustive-defi-deep-report`
(`scout.searchResearch` leaves the top five as `stellarDocs.search_anchor_sep_docs` enters).
There are no gains and no confirmation-only grade changes. Protocol-history remains its existing
failed diagnostic: 8 positives with top1/top3/top5 6/7/7, and 3 captures among 4 controls.

Every accepted total matches the new trace, including denominators/card denominators. The legacy
band's accepted counts match, and its 1% width remains unchanged (3 rows). Skills floor and all
holdout floors/ceiling are byte-equivalent as parsed objects to `origin/main`: 17 and 12/26/29,
with capture ceiling 11. Holdout top3 is exactly its floor, as the note warns.

All four evidence hashes match their current inputs. Only the manifest hash changes from main:
`7a4fab7687507691d1ac7b219761fe9f9a7600b29ffb96d17f8815503c5caa29`.
The recorded `localTrace`, `routing-2026-11-17T20-15-40-285Z.json`, exists; its `ranAt` equals
`baselinedAt` (`2026-11-17T20:15:40.286Z`). All five lane aggregates in that trace match the
independent rerun. The evidence note accurately states the authorized zero-regression departure,
the A/B result, and its limitations. Its review status/path is a placeholder for the lead to finalize
when copying this report. Commits A and B still need to land together through the planned squash.

## Generated artifacts

- `node scripts/build-catalog.mjs --out tmp/6.2/codex-manifest.json`: byte-identical to the
  committed manifest (`cmp` exit 0).
- Ran the unchanged super-spec builder in an isolated scratch directory with read-only input
  symlinks and its own output directory: `tmp/6.2/codex-spec-root/specs/super-spec.json` is
  byte-identical to the committed spec (`cmp` exit 0). The branch diff changes only its two
  generated timestamp fields.
- Independently fetched the four public `llms.txt` indexes, traversed them using the refresh
  script's exported `parseLlmsIndex` and `normalizeTitles`, and checked all snapshot fields
  with the retained `fetchedAt`. All 982 titles match exactly, and all four index hashes and
  per-index counts match `inventory/stellar-docs.json`. The old snapshot has 666 entries;
  unique path additions/removals are exactly 342/23. Evidence:
  `tmp/6.2/codex-check-titles.mjs` and `tmp/6.2/codex-live-titles.json`.

## A/B harness, packets, and scoring

Read both scripts and the registered plan. Re-ran the offline `blind.mjs --selftest` (pass), and
`blind.mjs --score` against the retained answers/key and committed judge verdicts, writing only
`tmp/6.2/codex-score.{json,md}`. All 36 generated client/arm and per-pair table rows match
`RESULTS.md` exactly. The rule is absorb: 0 losses, 1 win, 29 ties; rule-pair net -1; client nets
-1/0/0; 0 missing; no inconclusive or hold trigger. The scorer is unchanged since pre-registration.
Each of the six answer files contains ten unique question keys, all answered, with one attempt each.

Checked all 30 actual saved judge-packet entries against the private key and source answer records:
X/Y mapping, answer text, tool calls, reference URLs, and result URLs match exactly. Packets expose
only the intended neutral fields. The judge assignment is correct (20 Opus-judged Fable/Sonnet
pairs, 10 Fable-judged Opus pairs), each pair is unique, both saved rubrics match the registered
rubric, and committed verdicts equal the original judge outputs. The judge briefs do not reveal
arm assignments. No arm leak or mis-scored observed pair was found.

The already documented empty-R attribution defect remains a limitation before reuse, but it cannot
change this result because there are no FRESH losses. The nondiscriminating Varial probe, X/Y
imbalance, one sample per cell, Claude-only coverage, and untested holdout loss are disclosed.
This review validates the retained scoring and packets; it does not buy another judgment round.

## Live text and split references

The removed hold text is gone from the summary script and inventory README. TODO keeps #223 open
for routing repair and accurately records the holdout floor. A protected repo-wide search found no
remaining live title-hold/Algolia-era claim outside dated research/round records and the historical
gate notes.

The split commit's additions contain no literal case ID or golden text. `TUNING_ROW_COUNT` is 93;
TODO records 93/109/45, v11, and SHA-256
`bb4390d3398f5e0cbdf99948bdd61be4b6872fe57c2484524802771407d71fd6`.
PRESTAGE has the same path/hash; all four dated lead briefs pass that v11 path. The amendment
script reads the exposed ID from the untracked input, rather than embedding it. No private split
file or exposure note was opened, so this verifies committed references rather than re-reading
private split membership.

Tracked working-tree files are unchanged. The pre-existing untracked CODEX-BRIEF.md remains.
The lead owns recording disposition of finding 1, copying this report, and final review provenance.

PASS
