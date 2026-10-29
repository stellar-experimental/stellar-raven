# Verification lane — C6 offline review, 2026-10-29

Reviewed: `tmp/impl/c6-offline.md` and `tmp/impl/c6-offline/` (model SHA-256 `f7ba8a73…`, frozen
`2026-10-29T00:14:26.950Z`). Method: I read the code, ran `check.mjs` and `evaluate.mjs` (both
exit 0, no paid call), checked 82 labels by hand, and ran an independent evaluation that also simulates
the gate (`c6-offline-eval.mjs`, output `runs/c6-offline-eval.json`). Spend in this lane: USD 0.

## Verdict

**I agree with the implementation lane: do not wire this gate.** I also go one step further. Under
the stop rule in my own design (`design-check8.md` §4.3), the class signal is too weak. C6 should
stop here, and nobody should tune it. Three parts of my design caused part of this failure, and I list
them in D1–D3. The implementation lane built the design faithfully.

## Claim-by-claim

| # | Claim | Verdict | Evidence |
|---|---|---|---|
| 1 | Accuracy on corpus: intent 50.8%, object 27.8%, joint 15.4% | CONFIRMED | My own run gives 269/531 intent and 147/531 object on distinct questions. One duplicate row explains the difference from 270/532 |
| 2 | Probe accuracy: 90 / 64 / 44 of 149 | CONFIRMED | |
| 3 | New held-out set: 82.8% intent, 59.4% object | CONFIRMED (number), **but it overstates** | See A3 |
| 4 | Deterministic, refit identical, frozen files unchanged | CONFIRMED | `check.mjs` and `evaluate.mjs` |
| 5 | No corpus or probe text in training | CONFIRMED for exact text | See L1 for near copies |
| 6 | Offline OZ and x402 table | CONFIRMED | The gate rejects the right OZ answers (skills and Docs), and the x402 blockers survive |
| 7 | RWA: positives stay; 2 of 3 controls rejected; check 8 not solved | CONFIRMED | Also: discovery is rejected on 4 of 10 RWA discovery probes (see G2) |
| 8 | Spend USD 0.569 of USD 3 (242 calls) | CONFIRMED | `check.mjs` output; the ledger is in `tmp/impl/spend.md` |
| 9 | Porter pinned to commit `74966c2b…` (F5) | CONFIRMED | `porter-source.json` |
| 10 | Token handling | CONFIRMED safe | `label.py` reads the OAuth token from the local config at run time and never prints it. No token pattern appears in `c6-offline/` or `spend.md` |

## Label quality (82 labels checked by hand against the source text)

| Sample | Correct | Wrong | Meaningless | Notes |
|---|---|---|---|---|
| Catalog (30) | 22 | 2 (objects: "category share" → `submission`, "contract interface" → `repo`) | 6 | One-word keywords such as "groth16", "rust", "incident", and "documentation" get an intent label. A keyword names a topic, not an action |
| `notFor` clauses (12) | 10 | 2 | 0 | **Serious:** `locateSource`'s clause "finding ecosystem projects' repos or code examples" → `locate/source-symbol`, the entry's own class |
| Probes (20) | 15 | 1 | 4 | "How do I read the decimals of a tokenized treasury SAC?" → `detail`, not `howto`. The short-token fragments ("app", "approach") cannot carry a class |
| Corpus (20) | 17 | 3 | 0 | The errors are borderline (reference vs content or inventory) |
| Synthetic review (11) | 9 corrections justified | — | — | Clef labeled "Show trends across …" and "Retrieve metadata for …" as `locate`. The corrections are right |

**T1. The object axis mixes two meanings.** For Docs and skills, the object is what the entry *returns*
(`doc-page`). For a question, the object is what the user *asks about* (`standard`, `asset`). These
never match. The evidence is in the confusion matrices: corpus `standard` → `doc-page` is 116 of 217,
and probe `asset` → `doc-page` is 18 of 35. The implementation lane reached the same conclusion.

## Design defects that this offline work exposes (mine)

**D1. Class-matched `notFor` clauses would reject entries on their own questions.** On fresh,
**50 of 100** clauses have the same intent and object as the entry itself. Examples:

- `getPartner` "discovering or listing partners" → `detail/partner`
- `getHackathonSubmission` "finding submissions on a topic" → `detail/submission`
- `locateSource` "finding ecosystem projects' repos" → `locate/source-symbol`

Two classes are too coarse to separate "one partner" from "list partners". My §3.4 rule ("a clause
whose class equals c\* fires with one token") would then reject these entries on their own correct
questions. The offline report does not test §3.4, so it misses this. Any future version must exclude
clauses whose classes fall inside the entry's own positive set.

**D2. The gate scope is wrong for entries with one source string.** Docs and Lumenloop entries have
one description, so each gets one class. I simulated the rule on the 531 corpus questions. It rejects
the 8 Lumenloop content operations on **531 of 531** rows. The classifier almost never predicts
`content`, so P(c\*) always exceeds P(content). It also rejects `get_doc_page_sections` on 526 rows.
My design said "every searchable operation and whole skill". At most, the gate should run only where
`rejectsRoutingIntent` already runs, which is entries with `routingExclusions`.

**D3. The "mixed query spreads its mass" property does not hold.** Naive Bayes posteriors saturate.
For example, "How do I read a wallet balance for tokenized treasury assets?" gets `doc-page` at 0.99,
and the four RWA positives get `asset` at 0.95–1.00. So the rule becomes "reject when the argmax class
is not in the entry's set". The implementation lane's four mixed questions show the same problem:
two of them lose the discovery entry that they need.

## Leakage

**L1.** There is no exact overlap. `collect.mjs` does not include the 12 protocol-history questions
in its held-out set, but none of them appears in training. Near copies do exist. I compared word
sets (Jaccard on content words). This gives **26 pairs ≥ 0.5** between catalog training strings and
held-out questions. The highest is 0.91: "Walk me through Stellar's protocol upgrade history from
Protocol 19 …". Others include the open SCF round question (0.71) and "What MCP servers exist"
(0.75). These are upstream Scout `exampleQuestions`, so they are legal training data. But they make
corpus accuracy slightly optimistic, which strengthens the negative verdict.

## Classifier generality

**G1.** No operation ID, query, or corpus row appears in the features. `FRAME_WORDS` is a hand-written
list of about 130 general verbs and question words. Some of them occur in the check-8 controls
("simulate", "read", "charge", "freeze"). They are generic verbs, and I see no sign of tuning. But
a hand list must be reviewed like a word list if it ever ships.

**G2. Structural cause of the poor corpus accuracy.**

- The training data is mostly Scout's own routing text. Of 1,575 catalog strings, 767 (49%) are
  `inventory` and only 41 (2.6%) are `howto`.
- Docs and Lumenloop add one string each.
- So the intent model learns Scout's discovery vocabulary. The corpus confusions follow from this:
  `howto` → `inventory` 35, and `reference` → `inventory` 57.
- The object features are a full word bag plus word pairs. This produces 795 KB of weights,
  not a few KB, so the object axis behaves as a topic model.

**A3. The new held-out set overstates accuracy.** It has 8 questions per intent, no product names, and
explicit cue verbs ("Count …", "Measure …", "Retrieve the complete record …", "Locate …"). This is
the same style as the synthetic training questions. The realistic numbers are the corpus numbers
(50.8 / 27.8 / 15.4%) and the long corpus questions (40.8 / 11.8 / 3.9%).

## Gate simulation on the watched entries (frozen model, rule §3.3, no witnesses)

| Probe group | Result | Wanted |
|---|---|---|
| RWA implementation (20) | `getRwaAssets` rejected on 19 | rejected |
| RWA discovery (10) | `getRwaAssets` rejected on **4** | kept |
| Locator negatives (20) | `locateSource` rejected on 20 | rejected |
| Locator positives (5) | `locateSource` rejected on 0 | kept |
| Hackathon negatives (22) | at least one hackathon op rejected on 22 | rejected |
| Hackathon positives (12) | **every** hackathon op rejected on 2 | at least one kept |

`locate` is the only clean class: 6 of 7 probes, 8 of 8 new, and all 5 positives. But D3 already
excludes `locateSource` by default, so a locate-only gate adds nothing now.

## For the lead

1. Stop C6. Do not wire the gate and do not tune the classifier (my stop rule, §4.3).
2. Record D1–D3 as negative design evidence: two-axis classes, a union over source strings, and Naive
   Bayes posteriors cannot carry this decision. A future attempt needs a different object axis
   (requested subject, not returned artifact) and a calibrated model. Treat that as new work, not as
   C7 in this round.
3. Next: the failure analysis (`c3-rulings.md`). The partial results are:

   | Candidate | What it fixes | What it costs |
   |---|---|---|
   | `c4p` + F4 + F5 | Check 5; grades equal to C2 | — |
   | `c4n` short-page fill | Most graded gains (11–12, with 0 losses) | Fails D2 |
   | C5 near-universal tokens on `c4p` | Lowers D2 (hackathon 7→4, locator 6→4) | 16 graded rows |

   Check 8, the D2 guard, and the holdout top3 floor are not solved by any candidate.

Evidence: `c6-offline-eval.mjs`, `runs/c6-offline-eval.json`, `runs/c6-check.log`, and
`runs/c6-evaluate.log`.
