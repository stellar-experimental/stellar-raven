# Independent audit — main scoring mechanisms, the fresh Scout 1.9.72 snapshot, and the repair report

Note (orchestrator, 2026-10-08): line numbers below refer to the 393-line report revision this audit read; the retained report is longer. Reviewer evidence is in the local archive under `routing-repair/reviewer-evidence/`.

Date: 2026-10-08. Auditor: Claude Fable 5.1 (high), read-only lane. I changed no source file,
label, gate, inventory, or `.agents` file. No paid eval ran. All my runs used a clean
`git archive HEAD` (f2197cae) copy in the session scratchpad, so the implementer's in-flight edits
to `src/` did not affect them. Scripts, patches, result JSONs, per-row diffs, and logs are copied to
`tmp/routing-repair/reviewer-evidence/` (see its `README.md`). Revision 2: corrects three
statements from revision 1 (sections 3.5, 3.6, 6), reconciles the `has`/`phase` distinction
(section 3.7), and adds the report review (section 9).

## 1. Verdict on the no-ship decision

**Agree: do not commit a partial scorer change, and keep Scout 1.9.72 and the 674-title Docs
snapshot held.** The brief forbids a partial commit when no general repair meets the checks. My
row-level diffs of every candidate confirm that none meets them (section 4). The final `structural`
candidate adds a holdout forbidden capture (`q-holdout-b-07-sep24-fields`) and a holdout top-1 loss
(`q-holdout-a-17-audit-registry`) on main, and on fresh still loses payroll top-3 and keeps
`reviewSubmission` at rank 2 on holdout `q-holdout-c-12-blend-directory`. The tracked tree is clean.

## 2. Audited facts

| Claim | Audit result |
| --- | --- |
| Brief: "legacy routing drops top1 219→220" | Top-1 rises by one. Fresh, unmodified code, all three ops exposed: 220/295/324/110 (`fresh-routing.json`; my rebuild agrees). The losses are top-3, top-5, and cardHit5. |
| Fresh manifest provenance | My scratch build from `fresh-scout.json` + `fresh-titles.json` is byte-identical to `tmp/routing-repair/fresh-manifest.json` (sha256 prefix `4e293ec58dac`). |
| `experiments.json` | It records policies and exits only. `comparison-summary.json` carries the totals; cite it. The `structured-combined` record now lists its four effective policies (the coherent-scoring replacement in the first harness was a no-op); the report discloses this correctly. |
| "cross-service alone passes the main gate" | True under the band, not row-clean: `q-soroban-current-sdk-cli-version` top-3 true→false on main. |
| Check 12 "absorb needs only a fingerprint re-baseline" | Not met even with `reviewSubmission` excluded and no scorer change: 7 graded flips, 220/295/325/111 (my `fresh-noreview` run; matches the 2026-10-06 ledger). |
| Docs 674-title snapshot alone | 0 graded flips, 2 top-five order changes (`titles-only` run). The wallets-kit loss is an ungraded membership change. |
| Scout 1.9.72 alone (old titles) | Produces all 8 graded flips by itself (`scout-only` run). The two sources do not interact on graded rows. |
| Committed `eval/plan/op-classes.json` | 60 operations, `unmatched: []` (`git show HEAD:…`). Revision 1 of this audit wrongly described a temporary working-tree file. The two `meta` defaults appear only when a manifest with the new operations is classified. |

## 3. Mechanism findings (main code)

### 3.1 Wallets-kit: a 3-letter prefix admits a weak gated row, and the full page then locks out a 565-score ungated row

Reproduced on clean HEAD code (`reviewer-evidence/scripts/wallet.mjs`):

- Only `approach` matters; `sponsorship` alone changes nothing.
- The query tokenizes `dApp` into `d` and `app`. The vendor prefix rule lets `app` match the new
  keyword `approach`. That extra matched token lifts coverage in the keyword-augmented pass over
  60%: `scoreEntry(augmented)` goes null→445, rescued as `round(445 × 0.4) = 178`.
- The gated pool grows from 4 to 5 rows, so the page is full. The ungated wallet docs op (565)
  needs a full-page replacement path. `preserveStrongBackfill` needs the victim's service to exceed
  quota (stellarDocs has exactly 2); `preserveIntentWithinServiceQuota` needs a structured or
  targeted witness a Docs search op cannot supply. A 178-score row stays; a 565-score row leaves.

Two general defects: (1) short-token prefix matching inside keyword fields; (2) full-page
replacement is gated on service overflow, not on score dominance (check 6). The implementer's
`cross-service` policy relaxed the victim rule to `> 1`; on fresh it placed `skills.stellar-dev.dapp`
(369) on the wallets page, not the wallet docs op. The candidate that restores the wallet docs op on
fresh is `gate-only-keywords` (and `structural`, which contains it), because it stops the `app`
admission; see section 9 for the report sentence that attributes this to the replacement policy.

### 3.2 How much of the gated tier rests on weak matches

`reviewer-evidence/scripts/gatedeps3.mjs`, main manifest, 460 legacy+extended queries × 60 ops:

| Gate rule | Admitted (query, op) pairs |
| --- | ---: |
| Current pipeline (full query OR stopword rescue, vendor prefix/substring rules) | 4,801 |
| Content tokens only, vendor prefix/substring rules | 2,345 |
| Content tokens, whole token or ≥4-char prefix at 0.75 length ratio | 451 |
| Content tokens, whole token only | 300 |

4,350 of 4,801 current admissions (91%) fail a content-token, whole-or-long-prefix gate. The
corpus and baselines sit on stopword and short-prefix shrapnel. This is why `keyword-boundaries`
(28 main flips) and `gate-only-keywords` (21 main flips) lose rows such as `q-ti-launchtube-mercury`:
their only admission witness is a prefix match on a schema or title keyword. A boundary rule must
be scoped (augmented pass, tokens shorter than four characters) and measured alone.

### 3.3 Admission-only example policy: which consumer admits each capture

`routingPhrases` has four consumers; the implementer's `admission-only` patch changes one:

| Consumer | File | Role | Patched by `admission-only`? |
| --- | --- | --- | --- |
| `hasCoherentRoutingWitness` | `scoring.ts` | Admits the routing blend when the vendor base is null | No |
| `rejectsRoutingIntent` early return (`positiveCoverage >= 2`) | `search.ts:532` | Admission before scoring | Yes |
| `rejectsRoutingIntent` negative margin | `search.ts:531` | Rejection | No (by design) |
| `discriminativeDirectoryVocabularyCoverage` | `search.ts` | Needs useWhen + example corroboration | No |
| `structuredIntentCoverage` | `search.ts` | Selection and replacement | No |

Traces on the fresh manifest (`reviewer-evidence/scripts/trace.mjs`):

| Row → captured op | Base | Final | Admission path | Example policy can fix it? |
| --- | --- | --- | --- | --- |
| `q-pc-sequence-numbers-ordering-replace` → `reviewSubmission` rank 1 | null | 282 gated | Consumer 1: example "Review my Stellar hackathon submission…" (`stellar` + `submissions`). `notFor` overlap is one token. | Not by the `search.ts:532` patch (still rank 1 under `admission-only-fresh`). |
| `q-scf-ecosystem-listing-partner-jobs` → `getHackathonSubmission` rank 1 (596) | null | 596 gated | Consumer 1: **useWhen** "what exactly did <winner> submit, and did it become a project" (`project` + `become`). | No; not an example phrase; two generic tokens. |
| `q-hist-remittance-corridors` → `getHackathon` rank 1 | null | 120 gated | Example "Stellar Hacks: Real-World ZK…" (`real` + `world` + `stellar`). | Partly; the event name is a proper noun. |
| `q-defi-rwa-overview` → `getHackathon` rank 3 | 110 | 162 gated | Same example; `what they became` adds a point. | Same. |
| `q-defi-blend-alternatives` → `getClusters` rank 5 | 148 | 189 gated | Example "How crowded is lending on Stellar?" (`lending` + `stellar`). | Yes for admission. |
| `q-comp-sep10-auth-role` → `analyzeHackathonSubmissions` rank 2 | null | 408 backfill | No witness; short-page fill via exact `submission` and schema keyword `anchor`. | Not an admission question. |

Four of the six two-token witnesses contain `stellar` or `project`.

**Design concern (untested, recommended next bounded candidate).** Exclude catalog-universal tokens
from phrase-witness counting, using the document-frequency idea the builder already applies to
schema keywords (`OP_KEYWORD_MAX_DF`). That removes the witness for the sequence-number,
partner-jobs, and Blend captures and keeps `real`+`world` for the event example. It names no
operation or question and leaves example corroboration intact for the directory rule.

**Design concern (proper-noun examples).** Treat capitalized multi-word spans in `exampleQuestions`
as one alias phrase that must match whole, or drop them from token witnesses; the known-alias
mechanism already has this shape.

### 3.4 Example topic versus requested action — my probe

Untested hypothesis from the 2026-10-06 report: example-only vocabulary should not score at full
routing weight unless the example is coherently matched. Probe (`reviewer-evidence/scripts/
example-topic-probe-*.patch`, side files `example-only-{main,fresh}.json`): example tokens absent
from purpose/useWhen/keywords contribute to the routing blend only when an example phrase has ≥2
matched content tokens.

| Run | Legacy | Extended | Holdout | Graded flips vs main |
| --- | --- | --- | --- | --- |
| probe, main | 218/297/326/112 | 92/111/117/16 | 12/26/29, captures 10 | 4 (losses `q-soroban-reentrancy` top3, `q-soroban-sdk-cve` top1, `q-crp-remittance-founder-advisory`; gain `q-defi-build-staking-for-own-token`) |
| probe + admission-only, fresh | 219/296/327/107 | 92/112/117/16 | 12/26/29, captures 11 | 16; standards, Blend, RWA recover; payroll top-3 still lost; holdout capture b-07 |

Rejected in this form: `scf` + `payments` on scfPitch's example "What angles should my SCF pitch
take for a payments idea?" satisfies the coherence test, so `payments` still scores 20 points and
scfPitch (209) stays ahead of `find_similar_scf_submissions` (192).

### 3.5 Identity coherence, gate-only keywords, cross-service

- Two tested mechanisms remove `reviewSubmission` from the sequence-number row:
  `identity-coherence` (all non-generic identity tokens must overlap) and `gate-only-keywords`
  (a null base may be rescued only through keyword tokens that pass `tokensOverlap`). Revision 1
  of this audit named only the first; the candidate table in section 4 shows both. Neither removes
  the holdout `q-holdout-c-12-blend-directory` capture, which is admitted by purpose/useWhen
  witnesses `project`+`built` and `project`+`links` (section 3.3 applies).
- `identity-coherence` costs 9 main rows (`q-scf-verified-members` loses top-1/3/5;
  `q-builder-by-scf-tier` loses top-3/5): those rows depend on one identity token.
- `cross-service` does not address any of the four real regressions (section 3.1).

### 3.6 Caps and truncation (corrected)

`extractRoutingPhrases` implements round-robin fair allocation at the 256-token cap, and
`attachRoutingKeywords` caps at 256 tokens. Revision 1 said no operation hits either cap; that is
wrong for phrases. `reviewer-evidence/scripts/cap.mjs`: `scout.searchResearch` has 421 uncapped
phrase tokens (89 phrases) and is cut to 256 tokens (27 phrases); the cut drops 61 `keywords`
phrases and 1 `useWhen` phrase, and keeps all `purpose` and `exampleQuestions` phrases. The cut is
identical on main and fresh (its x-routing did not change), so it does not cause any 1.9.72
movement, but it means searchResearch's multiword keyword vocabulary is mostly absent from phrase
witnesses while its `routingKeywords` (202 tokens, under the 256 cap) still carry those tokens for
scoring. That asymmetry (tokens score but cannot witness) is a design concern for any policy that
tightens witness rules. No operation hits the `routingKeywords` cap.

### 3.7 `has` inside `phase`: why the standalone test passes while the combined probe moves

The standalone test (`test/routing-evidence.test.ts`, "does not boost has from the unrelated
schema word phase") scores the one-token query `has` against `keywords: ["phase"]`. The keyword
field is admitted only when `schemaMatches` (computed with `tokensOverlap`, which rejects
`phase`/`has`) is non-empty or there are ≥2 matches. With no admitted match the keyword array is
never appended, so the score equals the no-keyword score. The test exercises the **admission
guard** only.

The combined probe scores a query where other keywords are legitimately matched. Then
`scoreWithKeywords` appends the **entire** keyword array (`joinedKeywords(field.tokens)`,
`scoring.ts:215`), and the vendor substring rule `raw.includes("has")` matches `has` inside
`phase`, adding `5 × 1 × 0.4 = 2` points. My clean-HEAD reproduction
(`reviewer-evidence/scripts/phase.mjs`): `alpha beta has zeta` against `["alpha","beta","phase"]`
scores 21, against `["alpha","beta","unrelated"]` 19. The implementer's `has widgets` probe
reports 141→143 for the same two-point delta; `schema-substring-probe.json` does not record the
entry used, so I could not reproduce the absolute numbers (with description `Retrieve widgets` the
base is null and both score 75), but the delta and mechanism are the same.

So check 5 has two halves: admission (passes today) and **projection** (fails today). The
`structural` candidate fixes neither for an already-gated entry because `gate-only-keywords` acts
only when the base is null; its own acceptance probe shows 19/19 only because that probe's base is
null. The general fix is to append only matched keywords (what `keyword-boundaries` does) while
keeping the admission witnesses that prefix matches currently supply (section 3.2 explains why
that second half is the hard part).

## 4. Candidate matrix, audited row diffs against main

From my `rdiff` runs over the implementer's result files (`reviewer-evidence/rdiff/`). "Graded"
counts rows whose top1/top3/top5/cardHit5/any*/forbidden/pass changed. **Row denominators:** the
supplied `rdiff.mjs` compares grade flags, which the 12 protocol-history diagnostic rows do not
carry (they store `targetRank`), so its graded counts cover 532 rows; its order counts cover all
544. I re-derived the protocol-history movements from `targetRank` directly
(`reviewer-evidence/scripts/ph-check.mjs`) and they agree with the implementer's
`protocol-diagnostic-flips.md`:

| Candidate | Protocol-history diagnostic change (main and fresh alike) |
| --- | --- |
| identity-coherence, structural | control `ph-control-soroban-deploy` newly captured (target rank null→5) |
| structured-scoring | positives `ph-protocol-corrective-upgrade-history` 1→2 and `ph-soroban-auth-audit-history` 1→5 (two top-1 and one top-3 lost); control `ph-control-clawback-cap` released (4→null) |
| all other candidates, unmodified fresh | none |

These diagnostics change no gate total; they add to the rejection of `identity-coherence`,
`structural`, and `structured-scoring`. The graded counts below exclude them.

| Candidate | Main: graded flips | Fresh: graded flips | Four real regressions on fresh | `reviewSubmission` on non-hackathon rows (fresh) |
| --- | ---: | ---: | --- | --- |
| unmodified | 0 | 8 | all four lost | sequence@1, holdout c-12@2, payroll@5, lifecycle-deadlines@2 |
| cross-service | 1 | 9 | all four lost | same |
| schema-rank-only | 3 | 11 | all four lost | same |
| identity-coherence | 9 | 15 | all four lost | sequence removed; c-12@2 remains |
| admission-only | 10 (incl. holdout capture b-07) | 13 | standards, Blend, RWA recover; payroll lost | sequence@1 remains |
| example-admission | 11 | 14 | same as admission-only | same |
| gate-only-keywords | 21 | 27 | all four lost | sequence removed; c-12@2 remains |
| keyword-boundaries | 28 | 33 | all four lost | — |
| structural (gate-only-keywords + admission-only + identity-coherence + cross-service) | 38 | 38 | payroll lost | c-12@2, payroll@5 remain |
| structured-combined (keyword-boundaries + schema-rank-only + example-admission + cross-service; four policies) | 40 | 40 | — | — |
| structured-scoring (coherent-scoring + keyword-boundaries) | 57 | 60 | — | — |

No candidate has zero unexplained main flips and all four recoveries.

## 5. Exposure recommendation

**Expose `analyzeHackathonSubmissions` and `getHackathonSubmission` with the next accepted
snapshot; exclude `GET /api/hackathons/review` (`reviewSubmission`) in
`src/policy/scout-exposure.ts`.**

- All three are read-only GETs with only `x-routing` as an extension; no cost or side-effect marker.
- Excluding `reviewSubmission` removes one graded flip (`q-pc-sequence-numbers-ordering-replace`
  top-1) and the payroll top-5/card loss; the two read ops change no graded row (`fresh-noreview`:
  7 flips, 220/295/325/111). On fresh, `reviewSubmission` enters 8 top-fives, including rank 1 on
  a protocol question and rank 2 on holdout `q-holdout-c-12-blend-directory`.
- Leak check: a build with the exclusion added contains no `reviewSubmission`,
  `/api/hackathons/review`, `hackathons/review`, or `getHackathons/review` string
  (`reviewer-evidence/results/manifest-fresh-noreview.json`). The fresh spec mentions the path and
  operationId only in its own definition, so the open leak-guard gap in `.agents/TODO.md` is not
  triggered by this snapshot; it still needs its fix before a later spec references the path.
- Ungraded captures that remain with the two read ops exposed: `getHackathonSubmission` rank 1 on
  `q-scf-ecosystem-listing-partner-jobs` and rank 3 on `q-scf-current-round`;
  `analyzeHackathonSubmissions` rank 2 (backfill) on `q-comp-sep10-auth-role`. These are generic
  witness defects (3.3), not reasons to withhold the operations, but they belong in the decision.

## 6. The two `meta` defaults (corrected)

The committed `eval/plan/op-classes.json` has 60 operations and no unmatched entries. The two
defaults appear only when the fresh manifest is classified. Decisions:

- `scout.analyzeHackathonSubmissions` → **broad**: `groups[]`, `total.values[]`,
  `winnersVsOthers.values[]`; a collection rollup with `searchHackathonBuilds` filters. Same rule as
  the `scout.analyzeEcosystem: "broad"` override. Add an `OP_OVERRIDES` entry.
- `scout.reviewSubmission` → **detail** if ever exposed: keyed on one `link`, returns
  `review.submission`, `review.checks[]`, `review.similar`, `review.pitch` about that submission,
  the same shape class as `getRepoTrust`. While excluded, add no override (a dead key); record the
  decision so a later exposure does not default to `meta` silently.
- `scout.getHackathonSubmission` classifies as detail through the `get` prefix.

## 7. Impacts of the fresh Scout snapshot beyond scoring

- `src/policy/scout-exposure.ts`: add the review exclusion. `src/skills/scrub.ts` derives its
  patterns from that set; I found no skill prose naming the path in the mirrored index, but bodies
  are fetched, so the pin review must confirm.
- `getHackathonSubmission` uses path parameter `{id}`; the adapter already templates
  `/api/hackathons/{slug}`. Same mechanism, not separately exercised here.
- Generated artifacts: `catalog/manifest.json`, `specs/super-spec.json`, `src/mcp/micro-map.ts`
  (Scout line must read 32 ops, not the 33 the all-three build produced),
  `eval/plan/op-classes.json` (with the override; build must print no `unmatched` warning).
- Tests hard-coding the Scout count: `test/catalog.test.ts:316` and `test/super-spec.test.ts:154`
  expect 30; both move to 32. The three `it.fails` RWA controls in `test/drift-141-routing.test.ts`
  still fail under every candidate; keep the markers.
- `eval/gates.json` cannot absorb the fresh snapshot with a fingerprint-only change (7 flips, four
  real regressions). The 674-title snapshot is absorbable on grades (0 flips) but fails the brief's
  added wallets-kit check until 3.1 is repaired.
- Goldens: three cleared proposals and one blocked in `eval/qa/corpus/proposed/scf-grants-builders/`
  wait on the absorb; `eval:qa:lint --enforce-floors` will require floors for the two new read ops.
  The queued winner-golden reconciliation and store-gap items activate on absorb.
- Improvements: no new upstream finding; the example-vocabulary effects are Raven scoring defects.
- Documentation: `research/services/stellar-light.md` endpoint table needs the three new rows and
  the changed `searchHackathonBuilds` filters; no other doc carries a Scout count that changes.
  Docs title ownership: `/docs/build/guides/transactions/fee-sponsorship` is owned by
  `search_soroban_contract_docs` through its `/docs/build/guides/` prefix (broader than the
  operation's subject). The meeting-date and "75 posts tagged" pages add no keywords. A mapping
  change is a Docs-spec decision under `docs/stellar-docs.md`, not part of this repair.

## 8. What I did not verify

- Live adapter calls for the new operations (no network in this lane).
- Semantic review of all 84 ungraded top-five order changes on fresh; I traced the nine rows named
  in the brief and the round ledger.
- The implementer's `source-attribution.json` one-field restorations; I read its structure only.

## 9. Review of `tmp/routing-repair-report.md` (revision read 2026-10-08, 393 lines)

Numbers I checked agree with my evidence: the fresh totals, every lane total in the measured-results
table (their movement columns compare against the same source with the unchanged scorer, so they
differ from my main-relative counts by design), the eight fresh flips and their causes, the
wallets-kit score arithmetic (12/21→13/21, 445, 178), the acceptance outcomes for checks 5, 8, 10,
and 12, the exposure and class recommendations, and the verification exit codes I could re-derive
(routing gate, builder, op-classes). The disclosure of the first harness's ineffective
coherent-scoring replacement is accurate and `experiments.json` now matches.

Material corrections for the report:

1. **Check 6 evidence sentence.** "The broader replacement policy also restores the fresh
   wallets-kit result" is wrong. `cross-service-fresh` alone does not restore
   `search_wallet_dapp_docs` (its wallets page gains `skills.stellar-dev.dapp` 369).
   `gate-only-keywords-fresh` alone does (`search_docs` 465, `search_wallet_dapp_docs` 565 at rank
   2). In the `structural` candidate the restoration comes from `gate-only-keywords`, which stops
   the `app`→`approach` admission so the gated page is short again. Rewrite the sentence to
   attribute it to the gate-only keyword check.
2. **Check 5 wording.** State both halves: the admission guard passes (standalone test), the
   projection fails (`scoring.ts:215` appends the whole keyword array; `has` substring inside
   `phase` adds 2 points whenever another keyword admits the field). Say that the structural
   candidate's 19/19 probe passes only because that probe's vendor base is null, and that
   `gate-only-keywords` never runs for an already-gated entry. Record the probe entry's
   description in `schema-substring-probe.json` so 141/143 is reproducible.
3. **Phrase cap.** The "Other mechanism findings" paragraph says the extractor preserves field
   boundaries and allocates its budget; add that `scout.searchResearch` is cut from 421 to 256
   phrase tokens (61 keyword phrases and 1 useWhen phrase dropped, identical on main and fresh),
   so witness rules and scoring vocabulary diverge for that operation.

### 9.1 Delta review after the corrections (final)

Re-read `tmp/routing-repair-report.md` after the implementer applied the corrections. Verdict:
**accept; no open material finding.**

- Check 6 now attributes the wallets-kit restoration to the gate-only keyword check preventing the
  false fifth gated result (report line 234). Matches my evidence.
- Check 5 now separates the null-base 19/19 probe from the already-gated 141/143 case (report
  lines 97–100). `schema-substring-probe.json` records the entry (`demo.has`, name `has`,
  description `Retrieve widgets`) and query `has widgets`; the name-field exact match explains the
  141 base, and the +2 delta is the `has`-inside-`phase` substring. Reproducible.
- The cap paragraph states 421→256 tokens, 89→27 phrases, 61 keyword phrases and one useWhen
  phrase dropped, identical on main and fresh (report lines 78–79). Matches `cap.mjs`.
- The protocol-history diagnostic appendix is linked (report line 185) and agrees with my
  `ph-check.mjs` re-derivation; the 532/544 denominator distinction is stated.
- The exposure section keeps the strict repair-first sequence and now distinguishes the read
  operations' grade neutrality from their ungraded captures. Consistent with section 5 here.

Minor:

- "Ten tested policies fail at least one required check" (todo-update.md): eleven named
  experiments ran (ten policies plus `restored`); say "every tested policy".
- The report's `structured-combined` row descriptions are consistent with four policies; keep the
  table's "Combine the preceding four policies" wording and do not reintroduce coherent scoring
  there.
- The exposure table recommends exposing the two read ops "after the repair passes". My
  recommendation adds that exposing them is safe on grades today (0 graded change) and that the
  hold is driven by the twelve rewritten routing texts, not by the two read operations; the report
  may keep the stricter sequencing, but should say which part of the snapshot causes the hold.
