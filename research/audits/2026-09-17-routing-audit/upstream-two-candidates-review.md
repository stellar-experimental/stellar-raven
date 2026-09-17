# Two upstream candidates from the M1-C1 vs B1 matrix — verification

- Date: 2026-09-17 (live checks 03:35Z).
- Mode: read-only. No paid calls, repo edits, filings, messages, Wrangler, or fresh discovery outputs.
- Source: `paired-review/M1-C1-vs-B1-matrix.json` rows `q-defi-aquarius-what-is` and `q-tool-soroban-auth-audit-live`.
- Raw evidence: `/tmp/raven-routing-audit-2026-09-17/code/upstream-two/`.

## Existing findings checked first

- Active findings (candidate repo `c6968e74`, plus the recorded `sls-085`): none covers the Aquarius description or
  Veridise disposition coverage.
- Resolved findings in `improvements/resolved.json`:
  - `sls-026`: Aquarius SCF award totals (issue #511). This is a different field.
  - `sls-064` / `sls-070`: audit relation metadata (PR #983).
  - `sls-071`: explicit exact-miss (PR #979).
  - `sls-074`: `V-SOR-APP-VUL-003` exact miss (issue #1031). The live check still shows no `meta.exactMiss`.
- Prior local decisions:
  - `research/audits/2026-09-17-routing-audit/four-goldens-review.md` marked the Aquarius wording
    monitor-only, not filed.
  - `pilot-trace-review.md` recorded the Veridise disposition as agent-side projection truncation, and severity
    metadata as monitor-only.

## Candidate 1 — Scout Aquarius description merges governICE and upvoteICE: VERIFIED, new, owner-actionable

- Live `GET https://stellarlight.xyz/api/projects/search?q=aquarius&limit=3` → 200 (sha256 `ecd622fe…`).
- Row `aquarius`, `shortDescription` ends with: "AQUA locks into ICE for on-chain DAO governance votes directing
  rewards across DEX/AMM markets."
- Canonical Aquarius documentation, fetched 2026-09-17:

  | Page | SHA-256 | Relevant lines |
  |---|---|---|
  | `ice-tokens-locking-aqua-and-getting-benefits.md` | `1cf038f3…` | ICE: "No direct operational use" (46); upvoteICE votes for markets (47); governICE votes on proposals (48). Line 58 notes that both voting types run on ICE. |
  | `aquarius-governance-community-led-decision-making.md` | `28186c71…` | "Governance voting does not offer rewards" (12) |
  | `how-to-make-a-governance-vote.md` | `e1c7c8cc…` | "Voting uses governICE" (15) |

- Assessment: the documentation supports "locking AQUA gives voting power". The description then attributes
  reward direction to DAO governance votes. Rewards follow market votes (upvoteICE), and governance votes
  (governICE) carry no rewards. The error is precise and owner-fixable wording.
- Consumer relevance: both paired arms collapsed the ICE variants. This is consistent with the description, but
  causality is not proven, so the draft says so.
- Dedupe: GitHub search on `Stellar-Light/stellarlight` for "aquarius ICE", governICE, and upvoteICE returned 0
  results. "aquarius description" returned 7 unrelated data and curation PRs.
- Draft: `/tmp/raven-routing-audit-2026-09-17/sls-086-draft.md`.
  - `upstreamTitle`: "Aquarius project description credits reward direction to ICE governance votes" (77 characters).
  - Prevalence: one row.
  - The jq reproduction was tested against the saved response.
- Coordinator decision needed: this reverses the earlier monitor-only disposition. Record the change, or keep the
  item monitor-only.

## Candidate 2 — Veridise invalid ruling missing from `searchResearch`: REJECTED (no source coverage gap)

Five live `GET /api/research` queries (03:35:44Z) used `source=audit`, `protocol=Stellar Soroban Core`, and
`limit=20`:

1. `V-SOR-VUL-002`
2. `V-SOR-APP-VUL-003`
3. a summary-of-issues phrasing
4. `Veridise Soroban Core invalid issues`
5. a number-of-issues-by-severity phrasing

Response files are `veridise-1..5.json`, with sha256 `c5d0fa27…`, `61b9710e…`, `b70bf5dd…`, `41ec682a…`,
`2921f107…`. No response contains `meta.exactMiss`.

The corpus contains every fact the golden requires, and the queries return them near the top:

| Fact | Chunk | Text | Ranks by query (1–5) |
|---|---|---|---|
| V2 inline invalid judgment | report 28 chunk 7 (`V-SOR-VUL-002:`, 5,703 chars) | "Why Invalid … linear in the number of trackers … costly … likely not worth it" | 1, 3, 16, 1, 11 |
| V2.1 appendix item | report 42 chunk 16 (`V-SOR-APP-VUL-003:`, 5,688 chars) | "Why Invalid" at character 3,813, with the "A.2 Invalid Issues" footer | 2, 1, 18, 2, 12 |
| Zero valid Critical | report 28 chunk 1 (766 chars) | "Table 2.3: Vulnerability Summary … Critical-Severity Issues 0 0 … TOTAL 8 4" | –, 16, 2, 7, 1 |
| V2.1 relocation | report 42 chunk 0 (3,488 chars) | "Aug. 27, 2025 V2.1 (Intended Behavior and Invalid Issues moved to the Appendix)" | 6, 10, 6, 3, 7 |

Conclusion:

- The matrix root-cause note "Scout research chunks do not surface the V2 inline invalid judgment or zero
  valid-Critical summary" is not reproduced.
- The M1 answers fail because agents clipped content or did not query for the summary. That matches the earlier
  trace diagnosis (`pilot-trace-review.md`: `slice(0,1500)` removed "Why Invalid").
- Upstream mapping: no new Scout finding. The exact-identifier path stays covered by resolved `sls-074` (#1031).
- Observation only, not filed per coordinator direction: the summary chunk (report 28 chunk 1) carries
  `severity: "critical"` metadata even though it is a table of zero Critical issues. Severity metadata alone is
  not a filing basis.
- Own-repo follow-up remains as previously proposed: agent composition guidance on reading full audit rows and
  summary tables. This is not an upstream item.
