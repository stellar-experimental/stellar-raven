# Tuning plan amendments

Adopted by the orchestrator (Claude Fable 5.2) on 2026-11-14 from [TUNING-PLAN-REVIEW.md](TUNING-PLAN-REVIEW.md) (Claude Opus 5.5), all of them, verbatim. Where an amendment and the plan differ, the amendment governs. Rulings: D1, D2 and D3 as the plan recommends; D2 as narrowed by A6.

## A1 (replace the "in the path" bullet and K1 to K3 in section 2, "Pass rule"):

- **traced**: a row's change is traced to the arm when the review finds the cause in the
  after-transcript. Up: the answer now states the fact the review found missing, and that fact's
  text is in a result the mechanism produced (arm 1: a `get_doc_page` read that followed the
  detail sentence; arm 2: a row flagged exact). Down: the new wrong claim, or the lost fact,
  traces to the same kind of result, or to a call the mechanism's text displaced (the agent read
  a page instead of a call it made at the step before, and the lost fact came from that call).
  A change with no traced cause is a noise observation. Record both verdicts. It counts neither
  for nor against the arm.

| # | Rule | Reverts when |
|---|---|---|
| K1 | **More correct.** At least two different rows go up, traced, and traced ups outnumber traced downs. | Fewer than two traced ups, or not more traced ups than traced downs |
| K2 | **No new wrong answer.** No row becomes `wrong` by a traced down. | One such row |
| K3 | **No control regression.** No control goes down by a traced down, and every trap row passes its trap. A trap failure is reviewed from the transcript. One that the review classifies as a judge artifact, under the skill's triage table, is recorded and does not revert | One traced control down, or one trap failure that is not a judge artifact |
| K5 | **Untraced movement within noise.** The untraced net (downs minus ups) over the panel is no larger than the larger of 3 and the net observed between step 0 and step 0′ | A larger untraced net: stop and re-plan, because the arm may act through a path the review cannot see |

## A3 (section 2, "The panel"):

Exposure is computed by one committed, deterministic scan of the stored executes (path recorded
in the ledger), over `sets.tuning` only. It counts a row as arm 1 exposed when any `stellarDocs.search_*`
operation was called and `stellarDocs.get_doc_page` was not, and as arm 2 exposed when a
`scout.searchResearch` query string contains a letters-plus-digits identifier. The table is
regenerated from that scan. Changes from the current table: `q-sep6-sep24-sep31-choice` and
`q-nft-vault-contract-standards` become Docs "yes"; `q-protocol-tier1-requirements` becomes research
"yes"; `q-comp-aml-analytics-vendors` and `q-edge-asset-site-scam-detection` are listed as arm 2
can-fire controls. Add `q-soroban-vuln-classes` and `q-soroban-oz-token` as priority partials. The
panel becomes 50 rows (24 correct, 23 partial, 3 wrong), and the per-run cap becomes USD 12.50.

## A4 (section 1, arm 2, mechanism steps 1 and 3):

- Step 1: delete the `exactKeys` branch from "exact". Rows with non-empty `exactKeys` keep today's
  label. If upstream later serves a document-identity statement (finding 5's `docKind: "spec"`
  or an `exactKeys` that covers SEP and CAP identifiers as document identity), that statement
  replaces the identifier rule.
- Step 3, the generated sentence becomes: "Exception: `<op>` returned the document the query
  names by identifier (`<key>`, `<url>`). That row is the document itself, not a candidate. State
  only what its returned text shows. A status or version line that is not in the returned text is
  unverified. The other rows stay candidates."
- Free check 1 adds two unit cases: a row with non-empty `exactKeys` and a non-matching slug (not
  exact), and a matching row whose content chunk lacks the preamble (exact; the sentence makes no
  status claim).

## A6 (section 2, the arm 3 rule; section 4, the M3 row):

Arm 3 decides one thing: keep or delete the current micro-map in `SERVER_INSTRUCTIONS` for Claude
Code v2.1.296 or later. It is a decision by default: the map stays only if removing it costs at
least 6 net panel rows (the 95th-percentile null net for two fresh runs; recompute it from the step 0 and step 0′
movement), or lowers required-service coverage in `npm run eval:plan` on 3 or more rows with no
offsetting gain. A traced trap failure also keeps the map. The result does not license any claim
about claude.ai, Desktop, Codex, Grok, or older Claude Code. It does not decide whether a rewritten
map (the family decider's arm B) can win, and it does not settle PR 439 beyond freeing the
characters. The `search` description's FAMILY_LINE stays in both sides, so the result is the
map's value on top of it. If the orchestrator accepts the burden of proof on the map without a
run, under "cost counts", record that and skip the run. Arm 3 can change the outcome only for a
loss of 6 or more rows.

## A7 (section 1, arm 1, step 6; "It must not change"; K4; K0):

- Step 6 draft: "`<source ops>` returned sections of pages, not whole pages. A section is exact
  evidence only for what it shows whole. Before you state a list, number, formula, code, or
  status it does not show whole, read the page: `stellarDocs.get_doc_page({ path })` with that
  hit's `path`." The wording is frozen and committed before free check 4, and is not changed
  after any target transcript or golden has been read.
- "It must not change" adds: in the playground, a hint whose only content is detail targets does
  not use the turn's recovery-advice cycle. A test proves that an alternatives hint after it is
  still shown.
- K0 for arm 1: among panel rows where the detail sentence appeared, at least half read a page
  afterwards (the stored tuning rate is 10 page reads among 66 Docs-searching rows). A rise from
  0 of 9 targets is not enough, because chance alone gives at least 1 of 9 about 70% of the time.
- K4 for arm 1 also reports results that reached the execute boundary and artifact reads per
  answer. The orchestrator flags the arm when cost per answer rises more than 20%, or median turns
  rise by more than 1, on rows whose verdict did not change.

## A8 (section 2, "Held-out counts", the reading paragraph):

Reading, fixed now: the held-out read checks for harm, not for gain. Ship the kept changes unless
wrong is at least 15 or correct is at most 31. Together these hold a neutral surface about 6 to
10% of the time. The launcher also prints paired counts against the stored baseline, as a
diagnostic: rows up, rows down, rows that became wrong, rows that left wrong. It prints no ids.
No held-out result is described as an improvement. Run the read when at least one arm is kept,
including arm 2 kept as a contract fix (A5).

## A9 (section 2, "Held-out counts", and arm 1 free check 2):

Every script that reads a stored results file selects rows by `sets.tuning` id before it reads
any other field, and asserts 79 (or the panel size). After the held-out read prints its counts,
the launcher moves the results file out of `eval/qa/results/` into a sealed path outside the
repository, records its SHA-256 in the ledger, and no register or plan script is run on it. Arm
1's sentence and arm 2's sentence are committed before any free check that reads a golden or a
missing fact. The reviewer of each arm's diff checks that neither changed afterwards.

## A11 (orchestrator)

PR 442 edited four tuning cases after the stored baseline (q-token-xlm-supply-total-circulating, q-scf-hackathons-active, q-infra-testnet-vs-futurenet, q-raph-stolen-wallet-recovery), and PR 441 changed tests only. Step 0-prime and every arm therefore run from origin/main at 6ce86dce or later, not from 66301389. Before step 0-prime, assert that the live surface SHA-256 still equals b336fa142e9a618a8857179d5b1f96495f08d36d7af15c13556c8e95c67c3404; stop if it does not. The four edited cases are left out of the step 0 against step 0-prime movement, because their judge input changed, and are compared from step 0-prime onward only.
