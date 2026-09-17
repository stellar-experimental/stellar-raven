# D3 paired-answer review criteria: M1-C1 and M2 pairs (prepared before candidate results)

- **Status:** criteria only. No candidate artifact has been read.
- **Plan:** `/tmp/raven-routing-audit-2026-09-17/paid-plan.json` (reviewed; not changed).
- **Baseline read:** M1-B1 `repo/eval/qa/results/2026-09-17T01-33-03-variantA.json`.
  - `comparable: true`, `qa-five-track-v1`, `qa-agent-result-v4`, `qa-judge-case-v2`.
  - claude-sonnet-5 / claude-sonnet-5, rubric v2.10, pack p6, `stability-boundary-v1`, 8 panels,
    cap 10, $5.8820244, cost complete.

## 1. Unit of decision

- **The unit is one paired row:** the same case ID across the pair set out in `pairing`.
  - M1: C1↔B1 and C2↔B2.
  - M2: C1a↔B1a, C1b↔B1b, C2a↔B2a, C2b↔B2b.
- **Aggregate grades, share metrics, and the paired printer are not decision inputs.** The printer
  stays INDETERMINATE (n < 100 and changed B1/C1 case identity).
- **Blocking outcome = verified loss.** The candidate row lacks a **required key fact**, or adds a
  **new wrong claim**, that its paired baseline row did not. Transcript review plus live
  re-execution must confirm it.
  - One verified loss on any M1 control or on any Soroswap pair blocks D3, even in one replicate.
  - Replicates and re-judges diagnose cause; they never excuse a verified loss.
- **Grade-only differences** (for example partial→wrong) are not losses unless a fact-level loss
  is verified.
- **Invalid measurement is not fact quality.** A row is `invalid` only when a completeness,
  comparability, or transport guard fails (§6). Every other row with a produced answer is reviewed
  for facts, even when the answer is empty, a refusal, truncated by the agent's own limit, or
  judged wrong.

## 2. Fact-level comparison (per paired row)

1. **Golden reference.**
   - Unchanged 13 IDs: `caseInput.golden.keyFacts[]` and `golden.avoid[]` from each artifact, which
     must be identical between arms. Check `caseInputSha256` equality. A mismatch voids the pair,
     except for the three corrected IDs below.
   - Corrected IDs (`q-eco-lobstr-wallet`, `q-defi-aquarius-what-is`, `q-defi-soroswap-what-is`):
     judge against the **corrected golden** of pin `c6968e74…`. Use the M0 panel overlays for their
     grades (§4). The original B1 grades for these three are superseded evidence, not a baseline for
     loss.
2. **Required-fact coverage (reviewer-mapped, answer-visible).** For each `keyFacts[i]`, mark each
   arm's answer as present, absent, or contradicted.
   - `verdict.missingFacts` is judge prose, not an index; panel rows union paraphrases. Use it only as
     a pointer, never as the count.
   - **Loss candidate:** baseline present and candidate absent or contradicted.
3. **New wrong claims.** For each arm, list answer sentences that are false against the golden or
   the live source, and each fired `avoid` item.
   - Use `verdict.avoidMatches` indexes and `wrongClaims` as pointers, then confirm in the answer
     text.
   - **Loss candidate:** a wrong claim or avoid match in the candidate with no equivalent in the
     paired baseline.
4. **Verification of each loss candidate.**
   - **Transcript review:** `transcript[]` search `resultProjection` hits and the `execute` input
     code show whether the candidate reached, or failed to reach, the source carrying the fact.
   - **Live re-execution (free, read-only):** confirms whether the fact or claim is true now. The
     execute result bodies are not stored, only `resultChars`, so the reviewer must re-execute.
   - **Confirmed:** verified loss. **Refuted or unconfirmable:** monitor-only, with the reason.
5. **Cause attribution (diagnostic only).** Record whether the D3-affected ranking for that
   question changed. It did for Soroswap only, at limits 5, 8, and 10: `scout.searchProjects` left
   the page. Also record whether the candidate transcript used a different source family. Cause
   never removes a verified loss.
6. **Judge variance handling.** If the grade differs but no fact-level loss is found, record it as
   monitor-only. If M5 re-judge output later exists for that row, record the flip. M5 never
   overrides M0 for the corrected IDs and never overrides a verified loss.

## 3. Soroswap-specific checks (M1 row + M2 pairs; 6 observations per arm)

- **KeyFacts (corrected golden):**
  - PaltaLabs Soroban AMM and aggregation stack
  - contract, API, and UI as distinct layers
  - marketing chronology attributed
  - adapter set dated
- **Avoid items:** unattributed first/best history; classic SDEX executed by the on-chain
  aggregator; code presence taken as an active adapter.
- **Mechanism evidence (diagnostic):**
  - whether `scout.searchProjects` appears in any search page or execute code in each arm
  - whether the answer names the adapter set with a date, and against which source
  - the grading authority is the verified adapter configuration: Soroswap, Phoenix, and Aqua
    unpaused (cs-002)
- **Grading authority (committed golden, no added exception):** the committed Soroswap golden
  says the verified adapter configuration remains the grading authority. No ADR-0008 stale-docs
  attribution exception was adopted, and this review adds no attribution safe harbor beyond the
  committed golden text.
- **Separate two things when reviewing an answer that mentions the stale Soroswap docs labels**
  ("(currently on Testnet)" or "(Coming Soon)"):
  1. **A clearly attributed report of what a page says** (for example, "Soroswap's aggregator
     docs page labels Phoenix and Aqua as testnet"). Record it as a source report. Judge it only by
     whether the quote is accurate. It is not by itself an assertion of current adapter state.
  2. **An assertion of current adapter state** (for example, "Phoenix and Aqua are not live
     aggregator sources" or "only Soroswap is routed"), whether or not a page is named. Judge it
     against the verified configuration (Soroswap, Phoenix, Aqua unpaused; cs-002 read). A
     contradicting assertion is a wrong claim. If the paired baseline did not make it, it is a
     loss candidate under §2.
- **What the committed golden already grants:** attributed marketing chronology, and a dated
  adapter set. Apply only those. Do not extend them to excuse a current-state claim that conflicts
  with the verified configuration.

## 4. M0 panel overlays (kept separate)

- Record M0-B1 and M0-C1 as separate columns for the three corrected IDs: panel 3 re-judges of the
  original answers. M0-B1 is labeled non-identical with worktree cases; M0-C1 uses revision-pinned
  cases.
- **Never merge** M0 grades into the original M1-B1 `verdict` column or its tracks. Never substitute
  M5 for them.
- Fact-level review of those three rows still uses §2 against the corrected golden. The overlays are
  an additional grading view, not the loss decision.

## 5. Evidence fields per paired row (review record)

| Field | Content |
|---|---|
| `pair` | method, run labels, case ID |
| `artifacts` | both result paths plus SHA-256; for corrected IDs, M0 overlay paths |
| `integrity` | both `meta.comparable`; `caseInputSha256` equal or corrected-ID exception; tuple (model, judge, rubric, pack, tier, register SHA); QA implementation hash equal to M1-B1; row `outcomeClass`; `agent.failure`; `agent.mcpServers` raven connected |
| `goldenRef` | pin, keyFacts[], avoid[] used |
| `baseline` / `candidate` | `answerSha256`; per-keyFact present/absent/contradicted with a short answer quote; wrong claims (quote); fired avoid indexes (quote); original score, coreAnswer, judgeTierUsed, panelScores (context only) |
| `m0Overlay` | corrected IDs only: M0-B1 and M0-C1 score, missingFacts, wrongClaims, avoidMatches, panel votes |
| `lossCandidates[]` | type (keyFact loss or new wrong claim), keyFact index or claim quote, candidate quote |
| `transcriptEvidence` | search queries, top hit IDs, execute operation IDs, whether the fact-bearing source was reached |
| `liveRecheck` | operation or URL, observedAt, result class, quoted value |
| `rowValidity` | `valid` or `invalid`, with the failed guard named (§6); invalid rows get no fact review |
| `verdict` | valid rows only: `verified-loss` \| `monitor-only` \| `no-difference`, with reason. Invalid rows: `invalid-measurement` with the guard |
| `causeNote` | ranking changed yes/no; source-family change (diagnostic only) |

## 6. Invalid measurement versus fact-quality failure

Only a failed **completeness, comparability, or transport guard** makes a row an invalid
measurement. An invalid row gets no fact review and no loss decision; record it as
`invalid-measurement` with the guard, and never drop it silently.

**Invalid measurement (void):**
- **Completeness:** the M1 run is incomplete (unattempted or budget-stopped IDs, cost-accounting gap).
  That voids the whole paired replicate, per the plan. A row with no attempted answer is also void.
- **Comparability:** `meta.comparable` is not true; the model/judge/rubric/pack/tier/register tuple
  or QA implementation hash differs from M1-B1; remote identity, surface, or server-revision guard
  failure; or `caseInputSha256` differs for one of the 13 unchanged IDs.
- **Transport and harness availability:** the first answer attempt has `agent.failure.class` of
  `transport`, `timeout`, `spawn`, `protocol`, `provider-safeguard`, or `unclassified`, with no valid
  byte-identical retry; or the `raven` MCP server was not `connected`.

**Not invalid — review as fact quality:**
- `agent.failure.class` `agent` (the agent hit its own turn or limit). This is a T1 system failure
  and counts as the answer produced, even if empty.
- An empty, partial, off-topic, refusing, or hallucinated answer.
- A judge error, a panel disagreement, or a consistency-check error. The grade is unavailable, but
  the answer is still reviewed against the key facts and wrong-claim rules.
- A grade of wrong or partial in either arm.

- **Missing inputs:** any M0 overlay that is incomplete, budget-stopped, failed, or missing cost is
  **not used**. There is no overlay and no retry.
- **Scope limits:** discovery (M3/M4) is out of scope here, with per-ID transitions only. Fresh
  challenge per-case outputs stay sealed from the implementer.

## Post-collection evidence clarification

The stored M1 execute entries include `result` bodies as well as `resultChars`. Reviewers inspected these bodies.
This corrects the evidence-location description above; it changes no decision rule.
