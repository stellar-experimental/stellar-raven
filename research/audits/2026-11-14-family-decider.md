# Family decider: could a small decision model help `search` route?

Date: 2026-11-14. Branch `research/family-decider-close`, from `origin/main` at `efb236e1`. The experiment
ran on `exp/family-decider` (tip `9667ac34`), which is never merged. No product code changed. Carried over:
the frozen purpose statements, in [`2026-11-14-family-decider/statements/`](2026-11-14-family-decider/statements/).

**Result.** The engine question is closed for the search page. As an append arm, no decision model beat the free
rule on the development rows; every page rule with more reach dropped labelled primary-family cards on some rows,
except one cell that abstained on 44% of rows. The rows a decider can win are rows that a general search
operation, already named in the base server instructions, reaches. Nothing ships from this round. The sealed
confirmation rows were never opened.

Ruling (orchestrator, 2026-11-14): the independent review of Plan 2 is accepted; the confirmation does not
launch; the engine question is closed for the search page; `FREEZE.json` is never committed; the sealed FAM
confirmation rows stay sealed and unspent for a later test that measures answers.

## The owner's question

2026-11-14: could a carefully prompted and tuned Jev or Clef "deciding engine" help Raven route, "if the tune
was good and the endpoint purpose statements were well written"? Test all of these and combinations.
The 2026-11-03 round had tried models as rerankers over about 60 cards and found no ship (about 20 losses per
source for Clef-flash; Jev unstable between repeats). It had not tried a decider that only chooses which of the
five source families can ground a question.

## What was tested

| Axis | Values |
|---|---|
| Engines | Clef-flash (`@cf/cloudflare/clef-flash`, Workers AI), Clef (`@cf/cloudflare/clef`), Jev (`jev-1.14.0`, TypeSafe, run on the owner's key from the Mac) |
| Statements | **S0** the committed family text; **S1** five rewritten statements for a model reader (what each source can ground, what it cannot); **S2** S1 plus 82 endpoint purpose lines. Written by a Claude Fable lane from specs and the manifest only, checked against the specs by a fresh Claude Opus lane |
| Decision form | Form F1: five yes/no probability questions, one per family; a family is chosen at probability ≥ τ, τ in {0.3, 0.4, 0.5, 0.6, 0.7}. One frame, never tuned |
| Page rules | **Append**: after the lexical page, add up to 2 cards from chosen families that are absent (cannot displace a lexical card). **Family-scoped (arm R)**: keep only chosen families' lexical cards (can displace). **Tail rule T** (Plan 2): append the next two lexical cards of chosen families; designed and reviewed, never run on sealed rows |
| Free controls | **A0** today's five-card page; **A1** seven lexical cards; **A2** the family floor (append the best card of each absent family, no model); **oracle** the labelled primary families as the decision |
| Captures | Five configurations (Clef-flash on S0, S1, S2; Clef on S1; Jev on S1), a second Clef-flash S1 capture 62.7 minutes after the first, and a second Jev capture about two minutes after the first. Each is 108 queries, 0 invalid, 0 error |

Sets, each with its own denominator:

| Set | Rows | Use |
|---|---:|---|
| FAM, new: 165 questions authored from the manifest and taxonomy leaf titles, 150 kept (50 of them from leaf titles only) | 68 development, 82 confirmation | Development rows were captured and graded. Confirmation rows were never captured or graded |
| SORG, 40 off-golden stellar.org questions in natural and keyword form | 20 questions × 2 forms, development half | Captured and graded; reported, never a gate (the set is biased toward the current stellar.org text) |
| Routing: legacy 338, skills 23, extended 122, holdout 49 | 532 | Sealed as confirmation-only (amendment 13). Aggregate counts only; no capture, no per-row output |
| QA tuning cases | 0 | No answer-quality run was made |

FAM labels: two independent fresh Claude sessions (Opus 5.5 and Sonnet 5.5) gave `primary`, `also`, and
`acceptableOps`; exact `primary` agreement 0.80, per-family kappa 0.81 to 0.96, 0 of 165 rows dropped, 3 rows
whose seed operation neither labeler accepted. Each capture graded a decision on operation reach: the page holds
a card in the row's `acceptableOps`. W and L count rows reached and lost against a named control.

## Headline numbers

FAM development: 68 rows, 64 with an operation label. Operation reach W/L is against A1 (seven lexical cards)
unless stated.

| Arm | Result | Note |
|---|---|---|
| A0 / A1 reach | 55 / 64 and 58 / 64 | A1 is +3/−0 against A0 |
| A2, free family floor | +3/−0 (61 / 64) | Admits an off-family card on 56 of 68 rows and `stellarOrg` on 33 of the 46 rows that do not label it |
| Oracle, append | +2/−1 (+1) | Stage 0 stop rule (+4 needed) fired before any call |
| Best possible append decider | +3/−0 | Operation-level ceiling of any append rule on these rows |
| Oracle, family-scoped (oracle-R) | +5/−0, sign test p = 1/32 | The reason the orchestrator opened amendment 15 despite the stop |

Engines at τ 0.5, development rows, first capture of each (family recall over 64 labelled rows; precision over
the chosen families, about 100 per cell; "family-scoped" is arm R at five cards):

| Capture | Recall | Precision | Append W/L | Family-scoped W/L | Strict-key losses top1/3/5/card@5 | USD per 1,000 searches |
|---|---:|---:|---:|---:|---|---:|
| Clef-flash S0 | 0.75 | 0.73 | 3/0 | 4/3 | 2/4/3/2 | 0.042 |
| Clef-flash S1 | 0.80 | 0.95 | 1/1 | 5/2 | 1/4/4/1 | 0.047 |
| Clef-flash S2 | 0.81 | 0.92 | 2/1 | 5/1 | 0/1/1/0 | 0.165 |
| Clef S1 | 0.86 | 0.93 | 2/1 | 5/3 | 3/6/6/3 | 0.298 |
| Jev S1 | 0.81 | 0.95 | 2/1 | 6/0 | 1/3/4/0 | 0.054 |

- **Append.** No engine beat A2. The best engine cells (+3/−0) were Clef-flash on S0 at τ ≤ 0.5, which behaves
  as A2 does. At S1 and S2 an engine reaches +2 or +3 only at the loosest τ and falls to +0 or +1 when it admits
  few off-family cards.
- **Family-scoped.** Every cell at +4 or more lost a strict key on 1 to 4 rows, except one. The engine chose an
  `also` family and left out the labelled `primary`, so its page lost the primary family's cards. One of 25 engine-by-τ
  cells met "+4 or more with zero losses": Clef-flash S1 at τ 0.7, +4/−0, which abstains on 30 of 68 rows, fails the
  sign test against A1 (p = 1/16), and was found after looking at all 25 cells.
- **Stability.** Clef-flash S1 differed on 2 of 68 chosen sets and 1 page between captures an hour apart at τ 0.5
  (limits 2% and 1%). Jev differed on 9 of 68 chosen sets and 4 pages at τ 0.5, two minutes apart.
- **Cost.** Every configuration was far inside USD 1.00 per 1,000 searches at the planned 1.5× margin. Latency
  inside a Worker was not measured. Jev's host time from the Mac was 86 ms median, 166 ms p95, 188 ms maximum, which
  says nothing about in-Worker time.
- **stellar.org (SORG development, 20 questions per form).** Natural form: A0 and A1 reach 3 of 20, the free floor
  19 (+16), the oracle 20 (+17); append engines at τ 0.5 +10 (Clef-flash S1), +11 (Clef), +12 (Jev), +14
  (Clef-flash S0), none above the floor. Keyword form: A1 9, the floor 13 (+4), engines at most +2.

Plan 2 (a tail rule that cannot displace any lexical card) was written, reviewed, and not launched. On
development it scored +5/−0 for Clef-flash S1 and +6/−0 for Jev. The independent review of it showed those wins are
the same six rows that any decision can win (6 of 64), and a model-free tail does as well:

| Tail design (FAM development, against A1) | W/L |
|---|---|
| Rule T, Clef-flash S1, τ 0.5 | 5/0 |
| Rule T, Jev S1, τ 0.5 | 6/0 |
| Rule T, oracle | 4/0 |
| Static tail: `stellarDocs.search_docs` and `lumenloop.search_content_semantic`, whichever are not on the page | 6/2 (net +4), all six winnable rows |
| A nine-card lexical page, against A0 | +6/−0 |

## Conclusion

In the reviewer's words (Claude Opus 5.5, review of Plan 2): "every row a family decider can win on the search
page (6 of 64 on development) is won by a general search operation that the base server instructions already
name to every client. A fixed, model-free tail of two of those ids reaches all six." Each of the six has an
acceptable id that `BASE_SERVER_INSTRUCTIONS` names; on two of them, today's page already carries one in
`widerCandidates`. A routing pass would show cards the agent already knows how to call, not answers it could not
get before. Append closed in round 1 (no engine beats the free rule), and replacement breaks the zero-loss
contract. The tail's whole development ceiling is general operations the instructions already name, so
confirming it would spend the sealed rows to learn what the instructions already explain. No further page rule
opens without new evidence.

## What this shows and does not show

Shows:

- A decider's reach on the search page, on 68 FAM development rows and 40 SORG development queries, at three
  engines and three statement sets.
- That reach is bounded by about six rows in 64, that those rows are reached by general operations the
  instructions name, and that the free rules (A1, A2, the static tail) match the engines there.
- That the engines recover only part of the stellar.org headroom that the free floor and the oracle reach.

Does not show:

- **No sealed confirmation.** FAM confirmation (82 rows) and every routing row were never captured or graded.
  Development gains of 4 to 6 rows are a handful of rows; the sample cannot support more.
- **No answer-quality run.** No QA, no agent discovery, no reader probe ran. Reach is not answers.
- **No latency, no cache, no Jev egress review.** Latency in a Worker (the gate for Clef-flash) was not measured.
  A Jev result could not ship in any case: it sends the query outside Cloudflare.
- **Arm B (the rewritten micro-map with no engine) never ran.** Its reader probe needed the freeze.
- **Shared prior.** All authors, labelers, and reviewers were Claude models (Fable 5.2 wrote the plans and the
  statements; Opus 5.5 and Sonnet 5.5 labeled, Opus 5.5 reviewed, Sonnet 5.5 implemented), by ruling. The labels
  record documented coverage, not verified answerability.
- **Selection after looking.** The page rules, tail orders, and the one clean cell were found on development rows.
  Development numbers under them are optimistic.

## Findings worth keeping

1. **Purpose statements written for a model raise family precision.** Clef-flash at τ 0.5 on FAM development:
   precision 0.73 with the committed text (S0) and 0.95 with the rewritten statements (S1); recall 0.75 to 0.80;
   off-family cards on append pages 13 to 2. The 82 endpoint lines (S2) added no precision and cost 3.5 times as
   much. A later round that uses a model for any family or source choice should start from the frozen statements in
   [`statements/`](2026-11-14-family-decider/statements/). They describe `stellarOrg`, which `main` does not hold
   yet, and were checked on the stellar.org source branch.
2. **Seven lexical cards against five is a free gain to measure.** On FAM development A1 reaches 58 of 64 against
   A0's 55 (+3/−0), and a nine-card page +6/−0; the caps audit found 11 more operation-card hits on 182 legacy rows
   (113 to 124) and no loss, at about 475 tokens per page. This is caps audit M1 in `.agents/TODO.md`, which also
   measures it on answers. Card count alone accounts for most of the engines' gain over today's page.
3. **Routing rows duplicate held-out QA questions.** Against the 168 held-out and reserve QA questions (exact or token
   Jaccard ≥ 0.8): 73 of 338 legacy and 26 of 122 extended routing rows match; 0 of 150 FAM rows, 0 of 40 SORG
   questions, and 0 of 23 skills rows. The matching row ids are held by the orchestrator, not recorded. Tuning on a
   routing row can therefore touch held-out content. The round treated every routing row as confirmation-only;
   `.agents/TODO.md` carries the decision.

One more note for whoever merges `feat/stellar-org-source`: at its tip (`b81e7a03`) the server instructions are 4,690
characters, 594 over the 4,096-character cut that Claude Code applies. A client loses the second half of Authority
Rule 2 and all of Rule 3, which sends SDF's own positions to stellar.org. On `main` they are 4,066.

## Spend

Engine calls, API-billed because no subscription CLI runs these models (authorized by the owner on 2026-11-14,
cap USD 5; amendment 15 cap USD 1):

| Item | Calls | USD |
|---|---:|---:|
| Clef-flash, Workers AI (433 calls including 1 shape check) | 433 | 0.0326 |
| Clef, Workers AI | 108 | 0.0322 |
| Jev, owner's TypeSafe key (216 requests, 1,287 mean input tokens at USD 0.042 per million; not ledgered, computed) | 216 | about 0.012 |
| **Total** | **757** | **about 0.08** (Workers AI ledger 0.0648) |

Subscription work was Claude models only (Fable, Opus, Sonnet); no per-token figure was recorded. The last
Workers AI call was the Clef-flash repeat at 2026-11-14 21:22 UTC; Plan 2 and its review made no engine call.

## Where the evidence lives

- **Branch** `exp/family-decider`, tip `9667ac34`; the development captures and grading are `babdc090`. Round files in
  `.agents/rounds/2026-11-14-family-decider/`: `PLAN.md`, `PLAN-AMENDMENTS.md`, `REVIEW.md`, `ORCHESTRATOR.md`,
  `IMPL-1.md` to `IMPL-3.md` (IMPL-3 holds every table above), `PLAN-2.md`, `REVIEW-2.md`, `statements/`, `sets/`
  (the 68 FAM development rows with labels, and the merge report), and `jev/` (the Jev bundle and its capture
  script). Code in `eval/family-decider/`. `FREEZE.draft.json` there is inert; `FREEZE.json` was never committed.
- **Local, ignored by git** (the owner's Linux machine, `/home/tyler`): `code/raven-wt/decider/eval/results/family-decider/`
  (4.2 MB: the capture fixtures for c0, c1, c2, d1, e1, `captures.jsonl`, `spend.jsonl`, `a15-results.json`,
  `a15-tables.md`). Nothing in it is archived elsewhere; copy it before the worktree is removed.

| File | SHA-256 |
|---|---|
| `captures.jsonl` | `c9c943349fbdbb3e916ba5cedc22bac83f0fcea7e3ee24c7dfe4184a2b8f65cf` |
| `spend.jsonl` | `8f7dea97dea82811ba51724eca56ac82fcfbc8a699cd81989daef5e707f80dbf` |
| `a15-results.json` | `1a115c55b1929212c9966982b99fc761fb3125b0971325e29c619c2b7f287b38` |

- **Sealed, held by the orchestrator outside the repository** (`/home/tyler/backups/fd-2026-11-14/split/`; hashes
  only, no lane has read the confirmation rows):

| File | SHA-256 |
|---|---|
| `fam.confirmation.json` (82 rows) | `07587dc04e2c993a92736d18610e4fc8fa78e04e77541863df4cfa83c85244ec` |
| `fam.confirmation.discovery.json` | `43c37eb8250ec87b4fbde6fea9e629a756f56a65590557df8b3cd2cd3a8ebc6d` |

The 68 development rows are on the branch: `sets/fam.development.json`,
`4092c3c9583ab7286cf9b08543f93f65a859ea8d8c774234521c5b098793aad2`.

- **Statements carried here** (frozen before any capture): `statements/families.json`
  `e9f13381d70fcf692a34526a88240058a3577aaf16753148cf778bfd41d6aa9f`, `statements/endpoints.json`
  `2c285b2062d9212f3121ec3973a196eb3340c8299ee94c5a7ad8eb9f76672aa8`, and `statements/CHECK.md`, the Opus check.
  `source-families.b.mjs` (`e760bcc1990e58a5d9f4b0aa1ebd1d763a38e92894aa16998f0fec574229a1ee`) is arm B code and stays on
  the branch.
- **Not carried: the FAM development rows as a discovery case file.** `eval/discovery/lib.mjs` on `main` refuses them.
  Its family list has four families and `main`'s manifest holds no `stellarOrg` entry, and 22 of the 64 labelled
  rows list `stellarOrg` operations (9 expect it as a family): `loadDiscoveryCases` stops at
  `case fam-ecosystem-01 has invalid expected family stellarOrg`. Dropping those rows would leave 42 rows and change
  the set. The rows, in the object form `cases.json` uses, stay on the branch at
  `.agents/rounds/2026-11-14-family-decider/sets/fam.development.discovery.json`. Move them once
  `stellarOrg` is in the manifest and the loader.
