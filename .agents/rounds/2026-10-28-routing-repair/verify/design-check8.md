# Design note — intent and object compatibility for topical side-matches (check 8, D2, RWA probes)

Author: verification lane, 2026-10-28. Status: proposal with measured evidence. No tracked file was
changed and no model was called. Spend: USD 0.

## 1. The shared shape

A discovery, inventory, detail, or analytics operation enters a page because the query shares
**topical** tokens with the operation's routing text. The query **asks for something else**: an
implementation step, a reference fact, or a different kind of object. I traced each case with the
real `rejectsRoutingIntent` inputs (`tmp/verify/trace-intent.mjs`, which uses an export-only copy of
`search.ts` on the fresh catalog plus the RWA fixture):

| Query (abridged) | Entry | Rank | How it passes today |
|---|---|---:|---|
| Simulate a transfer of a tokenized bond through Stellar RPC | `getRwaAssets` | 3 | Positive phrase coverage 3 (`tokenized`, `bonds`, `stellar`). The best `notFor` coverage is 0 |
| Read a wallet balance for tokenized treasury assets | `getRwaAssets` | 2 | Positive 3 (`asset`, `tokenized`, `treasuries`). `notFor` "issue asset build tokenization contract" covers 1, and the rule needs 2 |
| Asset issuer: transfer fees, cap supply, freeze holder, protocol level | `getRwaAssets` | 1 | Positive 4 (`asset`, `actually`, `stellar`, `level`). Negative 2 < positive 4 + 1 |
| Walk me through issuing a tokenized real estate share | `getRwaAssets` | 1 | Positive 4 (useWhen). Negative 1 |
| Compare Soroswap and Aquarius as Stellar DEXes | `compareHackathons` | **1** | Positive 1 (`compare`). The identity-name fallback admits it on the single name token `compare` |
| What is SEP-10 and why does an anchor need it … KYC submission … | `analyzeHackathonSubmissions` | 2 | Positive 1. Not rejected through the identity token `submission`. Gated null, so it enters as ungated (367) |
| Show Phoenix's SCF submission history | `getHackathonSubmission` | 4 | Positive 2 (`show`, `stellar` from an example). Not rejected |
| What is the mainnet network passphrase string? | `locateSource` | **1** | Positive 2 from **one example instance** ("…declares the --network-passphrase flag…") |

Four sub-shapes appear, and they overlap:

- **(a) Intent mismatch.** The topic is right and the act is wrong. These are the RWA implementation
  and reference questions, and SEP-10 → analytics.
- **(b) Object mismatch.** The act is right and the thing is wrong: "compare DEXes" → compare
  *hackathons*, and "SCF submission history" → *hackathon* submission.
- **(c) Generic or near-universal tokens inflate positive coverage:** `stellar` (df 62 of 83 entries),
  `show`, `compare`, `actually`, and `level`.
- **(d) Example-instance tokens act as intent.** An example question names a concrete instance, such as
  `network passphrase`. That instance then admits every query about the instance.

## 2. What does not work (measured, so that candidates do not repeat it)

| Prototype | Rule | Result on fresh (544 rows + 149 probes) | Verdict |
|---|---|---|---|
| P1 IDF residual (`proto-residual.mjs`) | Drop entry *e* when another single entry explains more IDF-weighted query mass among *e*'s unexplained tokens than *e* explains in total | Legacy top5 326→**273**, extended top5 117→94. RWA implementation probes get **worse**, 9→12/20; the deferred controls move to rank 1, because the Docs winners are dropped too. Holdout top3 26→32 | Reject. Too blunt; every multi-part query flags its true owners |
| P2 identity witness (`patches/vA1.patch`) | The name-identity fallback needs min(2, *n*) non-generic name tokens, and `GENERIC_ROUTING_ACTION_TOKENS` are not identity | DEX→`compareHackathons` rank 1 is removed. Hackathon guard 7→6, locator guard 6→5, RWA implementation probes 9→7. But legacy top5 326→323: three `scfPitch` rows lose ("scf" alone is a real identity), and a true `locateSource` positive is lost | Reject as a global rule. It is useful only when scoped by (a) or (b) |
| Lexical informativeness | Count only low-df tokens toward positive coverage | RWA's topical tokens are **unique**: `tokenized`, `bonds`, `treasuries`, and `estate` all have df 0 outside RWA. Discovery and implementation questions share the same informative tokens (`univ.mjs`) | Cannot separate (a). Helps only (c) |

Conclusion: the intent and object signals are not in the topical tokens. A lexical rule can
reduce (c) and (d), but a class signal is needed for (a) and (b).

## 3. Proposal — two-axis compatibility gate, built offline, deterministic at serve time

### 3.1 Data (build time, committed, reviewed)

A closed, small taxonomy. These are general English intent and object classes, not operations:

- **Intent:** `inventory` (what exists, who, which, is X live), `howto` (build, operate, debug,
  integrate), `reference` (spec, definition, standard text, concept), `analytics` (shares, trends,
  counts across sets), `compare`, `detail` (one item by identifier), `locate` (where in source),
  `content` (articles, talks, editorial).
- **Object:** `project`, `asset`, `hackathon`, `submission`, `person`, `repo`, `source-symbol`,
  `doc-page`, `standard`, `funding-round`, `partner`, `content`, `network-fact`.

For every searchable operation and whole skill, the builder derives two sets: `intentClasses(e)` and
`objectClasses(e)`. The sources are the entry's own `purpose`, `useWhen`, `exampleQuestions`, and
`keywords` (Scout), its description (Docs, Lumenloop), or its skill description. Each `notFor` clause
also gets one intent class and one object class. Labels are produced once, with Clef `choice`
questions, one string at a time, and the set is the union over the strings. They are committed as
reviewed data (for example `scripts/catalog-data/intent-classes.json`, keyed by entry ID and source-text
hash). A source-text change invalidates its labels. The drift lane then re-labels and reviews the
diff, like any routing-text change. No label is hand-tuned to a test row.

### 3.2 Query classifier (serve time, deterministic, no model call)

- A committed linear model (multinomial naive Bayes or logistic) over unigram and bigram
  frame features: interrogatives, auxiliaries, imperative verbs, and the first three tokens. It
  outputs an intent posterior and an object posterior.
- Training data:
  1. The labeled catalog strings from 3.1.
  2. A synthetic question set per class, written and reviewed in the round (not taken from the eval
     corpus) and cross-labeled by Clef. Disagreements between the authored label and Clef are
     reviewed by hand.
- The weights are a few KB of JSON. Inference is a dot product. Ties break by fixed class order.
- The eval corpus (544 rows) and my 149 probes stay **held out**. They measure the model and never
  train it.

### 3.3 Rule

For a candidate operation *e* and a query *q*, let `c*` be the argmax intent, `o*` the argmax
object, and `P` the posteriors.

- **Incompatible** when `P(c*) > Σ_{c∈intentClasses(e)} P(c)` **or**
  `P(o*) > Σ_{o∈objectClasses(e)} P(o)`. In words: the query is more likely another class than all
  of *e*'s classes together. This is a comparison, with no tuned threshold. A mixed query ("which
  tokenized treasuries exist, and how do I read their balances?") spreads its mass, so *e* stays
  compatible.
- An incompatible *e* is **rejected** in `rejectsRoutingIntent`, unless an identity-strength witness
  exists. A witness is an exact ID or name, a complete input-enum witness (count ≥ 2, the existing
  rule), or the existing discriminative directory-vocabulary witness. A single shared name token is
  **not** a witness in the incompatible case. This is P2 scoped to sub-shapes (a) and (b), so
  `scfPitch` on SCF-pitch questions is not affected.
- A compatible *e* follows today's rules unchanged.

### 3.4 Interaction with the existing mechanisms

- **`routingExclusions` (`notFor`).** The existing rule (negative coverage ≥ 2 and ≥ positive − 1)
  stays as it is. One addition: a clause whose committed class equals `c*` (and `o*`, when the
  clause names an object) fires with **one** overlapping token. The `notFor` "how to issue an
  asset or build a tokenization contract" (class `howto`) then rejects "Walk me through issuing a
  tokenized real estate share" (`howto`, overlap `issuing`). Today that query covers 1 of the 2
  required tokens. The arrow targets (`-> stellarDocs / skills`) stay out of scoring. The builder
  may resolve them to exposed IDs for review reports only. They are never emitted to model-facing
  text (ADR-0003).
- **`discriminativeRoutingTokens`.** These stay unchanged. The directory-vocabulary witness (df == 1, in
  both `useWhen` and an example) remains one of the witnesses that override incompatibility.
  Separately, for sub-shape (c), positive phrase coverage should stop counting tokens that occur in
  more than half of the searchable entries (`stellar`: 62 of 83). This uses the same per-catalog
  frequency map and adds no list of words. Measure it as its own step.
- **Sub-shape (d) (example instances).** A token that appears **only** in `exampleQuestions` (not in
  `purpose`, `useWhen`, or `keywords`) may add rank but cannot count toward the positive-coverage
  admission threshold. This is the TODO's "keep phrase and field boundaries" direction. Measure it
  as its own step. The repeated-directory-example witness already requires both `useWhen` and an
  example, so it is unaffected.
- **Tier margin.** No new constant. Rejected entries never reach either tier, so a short page cannot
  backfill them. P1 showed that demotion alone is not enough: the RWA controls reach short pages.
  Entries that survive incompatibility through a witness enter normally, and
  `TIER_INTERLEAVE_MARGIN` keeps its current role.
- **Selector and quota.** Unchanged. The gate acts before `diversifyByService`.

### 3.5 Expected effect (hypotheses to measure, not claims)

| Target | Today (fresh) | Mechanism |
|---|---|---|
| Three `it.fails` RWA controls | ranks 3, 2, 1 | (a): `howto` or `reference` vs `inventory` |
| RWA implementation probes | 9/20 fixture, 10/20 builder | (a) |
| Builder-RWA corpus cost (4 rows, 20 pages) | −2 legacy top3 | (a). Many of the 20 pages are implementation or reference rows |
| Hackathon interference (7 rows), probe captures (5/22) | | (a) for SEP-10, anchor, and Horizon-backfill rows; (b) for the DEX→`compareHackathons` and SCF→hackathon-submission cases |
| Locator interference (6 rows), probe captures (4/20) | rank 1 on "mainnet network passphrase" | (a) `reference` vs `locate`, plus (d) |
| Check 8 positives, hackathon and locator positives | pass | They must stay; these are inventory, analytics, and locate frames |

## 4. Validation plan (before any serve-time code ships)

1. **Offline first, with zero serve-time change.** Commit the labels and the classifier. Report
   classifier accuracy on (i) the held-out probes, (ii) a fresh held-out probe set written after
   training, and (iii) the 532 graded corpus rows, labeled by Clef only as a measurement. Report
   the confusion matrix per class.
2. **One candidate per sub-mechanism**, all 544 rows on both sources, as the brief requires:
   C-a (intent gate), then C-b (object gate), then C-c (near-universal tokens), then C-d (example
   fields). Each candidate gets the full addendum-2 table, the D2 guard, the 149 probes, the
   fixture *and* builder RWA forms, and the short-token table.
3. **Stop rule.** If C-a does not move the three controls and the implementation probes without an
   unexplained loss, stop. Report that the class signal is too weak; do not tune it.
4. **Failure modes to watch.**
   - Mixed-intent questions lose a legitimate inventory operation. Track these with a dedicated
     mixed-intent probe set.
   - Unusual phrasing gets misclassified. Track it with the confusion matrix.
   - Label drift on upstream text changes. The source-text hash forces a re-label and review.
   - The classifier becomes a hidden per-query hack. It must not: no corpus row trains it, and the
     feature set is generic frames only.

## 5. Spend and approval

Labeling needs about 600 catalog strings and 100 `notFor` clauses, plus about 800 synthetic questions
for cross-labeling. That is about 1,500 Clef `choice` calls at about 300 input tokens each, roughly
0.45 M tokens. At USD 0.24 per million, the cost is **about USD 0.11**, or about USD 1 with ten-fold
headroom for retries and a Clef-flash comparison. **I ask the lead for approval before any call.**
I will log every batch in `tmp/verify/spend.md`. A no-spend fallback exists: the authored labels
alone, with Clef only as a cross-check. It is slower to review and has a higher risk of author bias.

## 6. Recommendation

- Do not ship P1 or a global P2.
- C-c and C-d are cheap and deterministic. The implementation lane can measure them now, without
  spend, as single-mechanism candidates.
- The three RWA controls and the RWA implementation class need the intent axis (C-a). Start with
  the offline labeling and classifier report (section 4, step 1) after the lead approves the spend.

Evidence: `trace-intent.mjs`, `proto-residual.mjs` with `runs/proto-residual-fresh.json`,
`patches/vA1.patch` with `runs/vA1-*` and `runs/vA1-diag.json`, and `univ.mjs`.
