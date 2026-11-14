# Brief: case audit

Read `briefs/common.md` first. Your launch line names your lane and your case list file,
`audit/<lane>.cases.txt` (one case file path per line).

## Task

Audit every case in your list as a measurement item. For each one decide whether it earns its
place in a compact battery that scores Stellar truth, and what its smallest correct form is.

Read `eval/qa/README.md` section "Case schema and golden lifecycle" and
`.agents/skills/golden-truth/SKILL.md` once. Then work in batches of about eight cases and append
records to your output file after each batch.

## Per case

1. **Purpose.** Classify what the case measures:
   - `stellar-truth`: a fact or procedure about Stellar that is true whatever tool answers it.
   - `behavior`: a trap or safety behavior (scam check, injection, out of scope, fabrication bait,
     no-info, freshness honesty).
   - `raven-mechanics`: how Raven's own operations, skills, envelopes, or vocabularies behave. An
     agent using any other tool could not satisfy it.
   - `mixed`: say which parts are which.
2. **Topic.** Two to four short topic labels in plain words (for example "SEP-24 interactive
   deposit flow"), and one sentence naming the categorical knowledge the case tests. If you cannot
   name it, that is a finding.
3. **Question.** Is it what a real agent or user would ask? Is it answerable, unambiguous, and
   aimed at what matters in the topic rather than at trivia? Would a strong answer from another
   correct source still pass?
4. **Key facts.** Mark each as `world` (a fact about Stellar), `process` (prescribes how the answer
   is produced or worded), or `operation` (names a Raven operation or skill). Flag a key fact that
   holds several predicates, restates another, or is trivia beside the main point.
5. **Rot.** `truth.asOf` and `truth.verified` show the last check (most are 2026-11-02). Re-check
   live, with two source classes, only what can have moved or looks doubtful: versions, dates,
   rosters, amounts, statuses, URLs, "current" claims, and any fact you believe is wrong. Check at
   least the single most important claim of every `scheduled` and `live` case. Record what you
   checked and what you found. Do not re-verify stable facts that the last audit confirmed unless
   you have a reason; state the reason.
6. **Duplicates.** Name any other case in your list that tests the same knowledge, and which one
   should survive. Note suspected duplicates in other categories by topic (you can list ids with
   `ls eval/qa/corpus/battery/*/`; read another category's case only to confirm a duplicate).
7. **Verdict.** One of:
   - `keep`: correct, compact, and needed as is.
   - `tighten`: needed, but the question or golden should change. Give the rewrite.
   - `merge`: folds into another case. Name the survivor and what it must absorb.
   - `retire`: duplicated, obsolete, unanswerable, trivia, or no measurement value. Give the
     score-independent reason.
   - `move-tool-lane`: `raven-mechanics` that still gives visibility nothing else gives. Say what
     would go unseen without it. If routing gates, unit tests, or the frozen live lane
     (`eval/qa/corpus/live/`) already cover it, the verdict is `retire`.
8. **Rewrite** (for `tighten`, and for a `merge` survivor). Propose the compact judge-facing form:
   - `question`: unchanged unless it is the problem.
   - `answer`: 60 words or fewer where the truth allows. No provenance, no dates of past checks, no
     tool names. A volatile value carries its as-of date.
   - `keyFacts`: two to four, each one predicate, each a `world` fact, each 90 characters or fewer.
     For a `behavior` case the key facts state the required behavior.
   - `avoid`: only claims verified false, or a sourcing guard for a volatile value.
   - `notes`: grading cautions only (symmetric cautions, accepted alternatives, caps). Everything
     else in today's notes belongs in the judge-blind `truth` block; list what moves there.
   A rewrite changes no fact unless your rot check found the fact wrong, and then it carries the
   evidence. Never weaken a correct, important fact to save words.

Never judge a case by how well any agent scored on it. You do not read results.

## Output

`.agents/rounds/2026-11-14-golden-coverage-audit/audit/<lane>.json`:

```json
{
  "lane": "audit-protocol-core",
  "records": [
    {
      "id": "q-...",
      "purpose": "stellar-truth",
      "topics": ["...", "..."],
      "tests": "One sentence.",
      "questionIssues": [],
      "keyFacts": [{"i": 0, "kind": "world", "issue": null}],
      "rot": [{"claim": "...", "result": "holds | changed | unverifiable", "evidence": [{"class": "A", "ref": "...", "observedAt": "2026-11-14", "quote": "..."}]}],
      "duplicates": [{"id": "q-...", "survivor": "q-...", "why": "..."}],
      "verdict": "tighten",
      "reason": "One or two sentences.",
      "rewrite": {"question": null, "answer": "...", "keyFacts": ["..."], "avoid": ["..."], "notes": "...", "movedToTruth": ["..."]},
      "wordsBefore": 266,
      "wordsAfter": 85,
      "confidence": "high | medium | low"
    }
  ],
  "summary": {"keep": 0, "tighten": 0, "merge": 0, "retire": 0, "move-tool-lane": 0, "factsChanged": 0},
  "crossCategoryDuplicates": ["topic: ids or description"],
  "missing": ["Topics in this category's area that no case in your list tests and that matter."]
}
```

`wordsBefore` and `wordsAfter` count answer, key facts, avoid, and notes together. `rewrite` is
`null` for `keep` and `retire`.

Done when every case in your list has a record, the summary counts match, and the file parses.
