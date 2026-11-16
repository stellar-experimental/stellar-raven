# Item 0.2 independent review — GPT-6 Astra (`gpt-6-astra`), high effort

Reviewer: Codex frontier, terminal `t1qs`; 2026-11-16. Scope: the phase-A diff against
`origin/main` on `np/0.2-absorb-drift-223`, following `tmp/0.2-codex-brief.md`.
Read AGENTS.md, the live-drift-resolution skill, PLAN.md, EXEC.md, TITLES-AB.md and
SCOUT-EXPOSURE.md. No agents, model-calling evals, paid calls, commits or source edits.

## Findings

No blocking, should-fix or nit findings in the requested scope.

## Independently verified evidence

1. **Drift classification and exposure.** Re-ran all three inventory comparison modes:
   Scout surface/text/deep exits **0/1/1**; Lumenloop **0/0/0**. Scout has routing-text and
   schema drift, not an operation-surface change. Its sole routing-text change is the
   `analyzeEcosystem` description. Whole-operation changes affect `analyzeEcosystem`,
   `hackathonBrief`, `getQualityReport`, `explainRepo` and `getRepoTrust`; shared schemas
   `LeaderboardProject`, `Project` and `Repo` also change. Independently compared every
   Scout path/method and operationId: no additions, removals or renames. Lumenloop and
   stellar.org inventories are unchanged. The Docs inventory diff changes only `fetchedAt`
   and `pageIndex` (979 to 982 pages), with its contract unchanged. All **286 exposed IDs**
   match origin/main, including **62 operations** (18 Lumenloop, 30 Scout, 12 Docs, 2
   stellar.org); operation transport method/URL/path identity is unchanged. Existing
   exclusions remain, including Scout quality/verify and the paid Lumenloop operations.

2. **Regeneration and gate.** `node scripts/build-catalog.mjs` exited **0**. `git status
   --short` was identical before and after; an additional byte-hash comparison found **no
   tracked file changed**. `npm run eval:compile` exited **0**. `npm run eval:routing --
   --gate` exited **0**, GATE PASS. Independent run:
   `eval/results/routing-2026-11-16T22-31-24-454Z.json`.

   Every field in every `evidence.acceptedTotals` object equals the rerun:

   | Lane | n | top1 | top3 | top5 | cardN | cardHit5 | Other accepted totals |
   |---|---:|---:|---:|---:|---:|---:|---|
   | Legacy | 338 | 220 | 293 | 327 | 182 | 113 | — |
   | Skills | 23 | 17 | 23 | 23 | 23 | 23 | — |
   | Holdout | 49 | 12 | 27 | 30 | 49 | 30 | 10 forbidden captures; 25 passed |

   Extended remains 93/112/117; protocol-history routing remains 6/7/7 with 3 control
   captures. The latter's aggregate `pass: false` is unchanged, not a new regression or a
   claim that the separately expired protocol-history source gate passed.

3. **Evidence edit accuracy.** A structural diff of `eval/gates.json` finds exactly three
   changed leaves: `evidence.inputs[0].sha256`, `evidence.localTrace`, and `evidence.notes`.
   Thresholds, accepted totals and baseline date are unchanged. The raw manifest SHA-256 is
   `8bbfb864eb37988d968d56a18b7a10291e31fda4f5eb25f3d25d82cc0642fc38`, matching the stamp.
   The named local trace exists and its lane aggregates match the independent rerun.
   Compared the rerun against `tmp/0.2-main-run.json`, first checking that the latter's
   manifest fingerprint equals the actual origin/main manifest. All 544 rows retain their
   grades. The changes match the note: 3 legacy score-only moves, 2 extended score-only
   moves, 2 extended top-five list changes, no skills or protocol-history changes, and 1
   holdout top-five list change (counts only). The named legacy/extended rows and score
   deltas match. Changed Scout descriptions/schema-derived keywords explain these moves;
   skill searchable text is unchanged. The review-outstanding sentence is the expected
   phase-A placeholder; phase B should replace it as already specified in EXEC.md.

4. **Pins and transport.** The saved base skill manifest is byte-identical to origin/main.
   Exactly two selected blobs changed, matching the complete reviewed body diff:
   `stellar-dev/standards/ecosystem.md` and
   `stellar-light/stellar-scout/references/api-reference.md`. OpenZeppelin's commit moved
   without selected-body changes. Checked all **224 skill/section transports** against the
   new source commits and per-file blob hashes: no mismatches. Both changed-body entries
   move URL, blob SHA and SHA-256 together; unchanged blobs correctly retain their hashes
   when only the commit URL moves. `node scripts/check-mirrors.mjs --fetch` exited **0**:
   **67 pinned files fetched upstream and verified**, cache bypassed.

5. **Held files and record hygiene.** `inventory/stellar-docs-titles.json` and
   `src/policy/scout-exposure.ts` are byte-unchanged against origin/main. Scanned all seven
   files under the item folder for routing-holdout identifiers and the skill body diff's
   substantive text: **zero matches**. No held-out or reserve QA case was opened. Routing
   holdout results were handled programmatically and reported only as counts; the runner's
   per-case terminal table was suppressed. `git diff --check` exited **0**.

## Security verdicts by source

- **lumenloop — PASS:** pins and selected bodies unchanged; no incoming prompt content.
- **openzeppelin-stellar — PASS:** commit advances, but all selected blob hashes remain
  unchanged; no incoming body instructions.
- **stellar-dev — PASS:** reviewed every changed line in `standards/ecosystem.md`. The
  additions concern Stellar oracle selection, verification and freshness checks. API-key
  and subscription mentions describe provider access prerequisites; they neither request
  disclosure of credentials nor direct unauthorized purchases. Public contract addresses
  are not signing keys. No host/user override, exfiltration command, seed handling request,
  unsafe signing instruction or out-of-scope content found.
- **stellar-light — PASS:** reviewed every changed line in the Scout API reference. Added
  instructions constrain interpretation of dated evidence, SDK status, TVL, issuer claims
  and contract attribution. They do not override host/user intent or request secrets,
  installs, payments or signing. No exfiltration or out-of-scope content found.
- **trustless-work — PASS:** pins and selected bodies unchanged; no incoming prompt content.
- **cavos-stellar directory entry — PASS:** inspected `ecosystem-skills/INDEX.md:78` and
  `:182`, `catalog.json:45` and `community.json:58`. The entry describes embedded Stellar
  wallets and links consistently to `cavos-labs/kit`. The displayed install command is a
  normal repository skill-install pointer, with no credential interpolation or chained
  commands. It was not executed. Cavos is a discovery entry only, absent from the pinned
  and exposed skill sets; this verdict covers the entry, not its unpinned remote body.

Phase-B attestation and full release gates remain the executor's planned work. This review
does not substitute for them. The only authored review artifact is this file; required
generators and the routing runner produced their normal outputs without changing the
tracked diff.

**Final verdict: PASS — no requested-scope finding blocks phase B.**
