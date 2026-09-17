# M1-C1 consequential gate — q-soroban-av-passkeys-talk (C1 ↔ B1)

- Reviewer: Fable high, independent of author and coordinator. Read-only. No paid calls, edits, or Wrangler.
- Criteria: `paid-comparison-review-criteria.md` (prepared before candidate results).
- Decision: **verified-loss** (required key fact 2 present in baseline, absent in candidate; confirmed by transcript and live re-execution).
  Under the predeclared one-loss rule this blocks D3 and stops further candidate collections.

## pair / artifacts / integrity

| Field | Value |
|---|---|
| pair | M1, C1 ↔ B1, `q-soroban-av-passkeys-talk` |
| baseline | `repo/eval/qa/results/2026-09-17T01-33-03-variantA.json` (finishedAt 2026-09-17T01:33:03Z; cost $5.8820244) |
| candidate | `repo/eval/qa/results/2026-09-17T03-21-24-variantA.json` (finishedAt 2026-09-17T03:21:24Z; cost $5.9831158) |
| integrity | both `meta.comparable: true`; both `complete: true` (16/16 rows, no failure rows, no error verdicts); judge claude-sonnet-5, rubric v2.10, pack p6, single tier in both rows; `caseInputSha256` equal (`ef7496f4dedd3d22…`) — unchanged ID; `agent.failure` null in both; raven MCP `connected` in both; outcomeClass graded-correct (B1) / graded-partial (C1) |
| goldenRef | keyFacts: (1) uses the exposed dot-qualified operation and returns summary-plus-source provenance; (2) states transcript text is absent; (3) treats `start_offset` as opaque. Avoid: retired `lumenloop_find_av_passages`, fabricated quotes/speakers/timestamps, summary-as-verbatim; silent docs substitution. Freshness `scheduled`; truth `confirmed`; GT-44 live service contract 2026-09-02 |
| rowValidity | valid (both arms) |

## per-keyFact coverage (answer-visible)

| keyFact | B1 (answerSha 820ebed0…) | C1 (answerSha 87e488fa…) |
|---|---|---|
| 1 exposed op + summary/source provenance | present in substance: "via LumenLoop AV-passage search"; four recordings listed with title, channel, URL; execute used `lumenloop.find_av_passages`. The dotted id is not named in prose. | present in substance: "from LumenLoop's AV index"; five recordings listed with title, channel, URL; execute used `lumenloop.find_av_passages`. The dotted id is not named in prose. **No difference** on the fact (the row count differs: 4 vs 5, both from returned rows). |
| 2 transcript text absent | **present**: "Note: these are AI-generated summaries of the recordings with links, not verbatim transcripts" | **absent**: the only precision note says "these are semantic-similarity passage matches from LumenLoop's AV index …; the `start_offset` values returned are opaque transcript-ordering offsets, not real playback timestamps … use the title/summary above". No sentence says the summaries are AI-generated or that transcript text is not returned. Not contradicted, but not stated. |
| 3 `start_offset` opaque | present: "the underlying passage-offset data isn't a clickable timestamp" | present: "opaque transcript-ordering offsets, not real playback timestamps". **No difference.** |

## new wrong claims / avoid items

- B1: none. Speaker names ("presenter Elliot", "presenter Chris Anataglio (SDF)") mirror the returned `summary` text.
- C1: none new. Speaker attributions ("Elliot (SDF developer advocate) walks through", "Chris Anataglio (SDF) presents") mirror the same summary text and match B1's practice. Row 5 ("SEP-30 & the Importance of Key Management and Recovery", wpB6ZT2aOFs) is a real returned row (present in the stored execute result and in my live call). No timestamps invented; no docs substitution; no retired operation name. `avoidMatches` empty in both judge verdicts.

## lossCandidates

1. keyFact loss, index 2 ("States transcript text is absent."). Baseline quote: "these are AI-generated summaries of the recordings with links, not verbatim transcripts". Candidate: no equivalent statement (closest: "semantic-similarity passage matches … use the title/summary above").

## transcriptEvidence

- B1: search "passkeys smart wallet signing podcast talk" → `lumenloop.find_av_passages` at rank 6; search "find audio video passages passkey" → rank 1; execute: 4 × `find_av_passages` (limit 5). Stored result rows carry `summary`, `long_summary`, `start_offset`; no `transcript`/`text`/`passage`/`speaker` field.
- C1: search "passkeys smart wallet signing talk" → `find_av_passages` at rank 9; search "find audio video passages speech" → rank 1 (its description text, returned to the agent, reads: "Transcript text itself is never returned — cite the link + the passage summary"); execute: 3 × `find_av_passages` (limit 8) + `search_content_semantic({types:["av"]})`. Stored result rows carry the same fields; no transcript-like field.
- Both arms reached the fact-bearing source (the operation description and the response shape). The candidate's omission is answer-side, not a retrieval miss.

## Correction and evidence note (2026-09-17)

- Corrected: the baseline answer lists **four** recordings, not five; the candidate lists five (its fifth, SEP-30, is a real returned row).
- Richer evidence than the criteria assume: §2.4 of the criteria says execute result bodies are not stored, only `resultChars`. In both artifacts the execute transcript entry carries a `result` string (B1: 25,811 chars; C1: 25,915 chars). Those stored bodies show the returned rows with `summary`, `long_summary`, `start_offset`, and no `transcript`/`text`/`passage`/`speaker` field, and they contain the SEP-30 row (`wpB6ZT2aOFs`). The live re-execution below confirms the same shape; the stored bodies are primary evidence for what each agent saw.

## liveRecheck (free, read-only)

- Mine, `lumenloop.find_av_passages({query:"passkeys smart wallet signing Stellar", limit:8})` at 2026-09-17 ~03:30Z: 8 rows; row keys `av_id,title,url,channel,summary,long_summary,slug,created_at,start_offset,similarity`; no transcript-like key; rows include av_id 1162, 445, 1616, 1505 (SEP-30), 506, 1481.
- Root, `av-live-recheck.json` (observedAt 2026-09-17T03:19:51Z): `codemode.describe` text "Transcript text itself is never returned — cite the link + the passage summary"; response rows with the same key set.
- Result class: the required fact is true now and the service contract is unchanged since GT-44.

## verdict

**verified-loss.** Required key fact 2 is present in B1 and absent in C1; transcripts show both arms had the fact available; live re-execution confirms the fact. Grade difference (correct → partial) is consistent with, but not the basis of, this decision. No new wrong claim.

## causeNote (diagnostic only, not a cause claim)

- First-search ranking for `lumenloop.find_av_passages`: rank 6 (B1 query "…podcast talk") vs rank 9 (C1 query "…talk"); the queries differ, so this is not an isolated D3 effect. Second search: rank 1 in both. Execute reached the same operation in both arms; C1 added one `search_content_semantic` AV call. Source family unchanged (Lumenloop AV lane).
