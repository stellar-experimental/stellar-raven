# Tuning plan: first loop on the 2026-11-14 baseline

Planner: Claude Fable 5.2, branch `evals/baseline-2026-11-14`. Reviewer: Claude Opus 5.5.
Implementer: Claude Sonnet 5.5. Inputs: [`BASELINE.md`](BASELINE.md), [`review.json`](review.json),
[the round ledger](../2026-11-14-baseline-tuning.md), the `run-evals` skill, and `AGENTS.md`
("Spend and evidence"). This plan changes no code. It read `sets.tuning` only from the split, and
tuning rows only from the stored baseline results.

## The four lines

1. **Decision.** For each change, one at a time: keep it or revert it. At the end, one more:
   ship the kept changes, or hold them. The arms are the docs detail relation (arm 1), exact rows
   on research results (arm 2), and, if the orchestrator authorizes it, instructions without the
   micro-map (arm 3).
2. **Smallest run.** One fixed panel of 48 tuning rows, named below, run once per arm on Claude
   Sonnet 5.5 with the pinned judge. Each arm is compared with the step before it on the same 48
   rows. Step 0 is the stored baseline (`2026-11-14T20-13-51-variantA`), reused while its identity
   pins still match, so it costs nothing. One client: no decision here depends on the client. The
   other 31 tuning rows are not run; section 2 says which and why.
3. **Stop rule, cap, estimate.** Each arm is one collection and one reading; an arm that does not
   meet the keep rule is reverted and is not run again. Cap USD 12 per panel run (48 rows at USD
   0.25; the tuning rows' 90th-percentile cost was USD 0.26). Estimate USD 8.80 and 30 minutes
   per run, at the baseline's USD 0.183 and 38 s per case. One held-out read at the end:
   estimate USD 21.80 and 75 minutes, cap USD 30. Loop estimate USD 39 with two arms, USD 48
   with three; the caps sum to USD 54 and USD 66. A changed pin, the cap, or a rate limit stops
   a run: report what completed, do not resume, do not re-judge.
4. **Review coverage.** In each arm: every panel row whose verdict or wrong-claim list changed
   (both transcripts), every target row, all six trap rows, and every fifth unchanged control in
   panel order. Held-out rows: counts only, never opened.

Subscription spend only, under the owner's 2026-11-14 approval in the ledger. Each run is its own
method run: the orchestrator writes its authorization in the ledger before launch.

## Decisions this plan needs before work starts

| # | Decision | My recommendation |
|---|---|---|
| D1 | Arm 2 adds an optional `exactRows` field to an ok result and one sentence to a host block. BASELINE.md says this output-contract change "needs its own decision". | Approve. The field is additive, and `caveat` keeps its two values. |
| D2 | Whether the caps audit's M3 (instructions with and without the micro-map) runs in this loop as arm 3. | Yes, last. It is one panel run, and it decides three open things (section 4). |
| D3 | Who launches the held-out read. No lane may read `sets.heldOut`. | The orchestrator, with a sealed id list; the launcher prints counts only. |

## What the free checks added to BASELINE.md

I ran these on 2026-11-14 with no model call. They change the picture for all three targets.

- **Target 2 is wider than nine cases.** In the baseline transcripts, 49 of 79 tuning rows ran a
  Stellar Docs search and never called `stellarDocs.get_doc_page`. Ten rows read a page. A page
  read costs little: the ten rows that read one averaged USD 0.194 against USD 0.179 for the 49.
- **The checkpoint has room for three candidates and the Docs searches already fill it.** After a
  Docs search it named `scout.searchResearch`, `lumenloop.search_content_semantic`, and
  `stellarDocs.search_meeting_notes`. `recoveryCandidatesFromSources` takes at most 3
  (`src/executor/run.ts:212`), so a fourth edge appended to a Docs profile would never be shown.
- **Target 1 is mostly a routing failure.** Only 2 of the 9 target rows called
  `scout.searchResearch` at all (`q-sep-43-web-wallet-api`, `q-sep-53-sign-verify-message`). In
  the other 7 the agent never reached research. `search` returned `scout.searchResearch` on none
  of the eight target rows that searched, at limits of 5, 8, and 10.
- **How a SEP or CAP row can be recognized.** One read-only production call: for "SEP-43 …" the
  first row has `source: "sep"` and a URL ending `sep-0043.md`; the second row, `sep-0060.md`,
  only cites SEP-43. For "CAP-38 …" the first row is `cap-0038.md` and the second `cap-0037.md`.
  "SEP-9999" returns no row with that number. On these rows `docKind` is `null` and `exactKeys`
  is absent, although the Scout schema documents `docKind: "spec"` for SEPs and CAPs. The
  identifier-named row has `confidence.relevance` of exactly 0.9: Scout detects the match and
  shows it only as a score.
- **Target 3 is partly a silent checkpoint.** 3 of the 7 target rows got no EVIDENCE CHECKPOINT
  at all. Two ran only operations with no retrieval profile (`scout.getLeaderboard`,
  `scout.getStatus`, `scout.analyzeEcosystem`, `scout.listSkills`), and one ran only skill reads.
  23 of the 60 exposed operations have no profile, and one unprofiled successful call silences
  the checkpoint for the whole `execute` (`src/executor/run.ts:206`). The other 4 rows got a
  checkpoint that named another family, and the agent stopped anyway.

"Exposed" below means what one baseline sample showed, read by a static scan of each script. An
agent can behave differently on the next run.

## 1. The changes

### Arm 1 (target 2): a `detail` relation in the recovery graph

**Mechanism.** The recovery graph gains a relation that means "the source returns parts of
records; the target returns one whole record, addressed by a field the source's rows carry". The
checkpoint renders it as its own sentence, outside the three alternatives.

1. `src/catalog/types.ts:111`: add `"detail"` to `RETRIEVAL_RELATIONS`.
2. `scripts/catalog-data/retrieval-profiles.mjs`: append
   `{ id: "stellarDocs.get_doc_page", relation: "detail", on: ["partial"] }` as the last edge of
   all 11 Stellar Docs search profiles (`search_docs`, `search_doc_titles`,
   `search_docs_in_category`, `search_meeting_notes`, and the seven scoped searches). All 11, so
   that the rule is about the family's shape and not about one operation. If the guard in step 3
   rejects one because its rows carry no `path`, drop that edge and say so.
3. Build guard, in `attachRetrievalProfiles` (`scripts/build-catalog.mjs:1147`) and the manifest
   check in `src/catalog/search.ts` (near line 313): a `detail` edge is valid only when the
   target's lane is `detail` and every required input of the target is a key of the source's
   row items (here `path`). Otherwise the build fails. This makes the relation a checked fact,
   and it lets another family add the edge later without new code.
4. `src/catalog/search.ts:1605`, `walkRecoveryCandidates`: skip `detail` edges, so the three
   alternatives and the `search` tool's `recovery` cards keep their members and order. Add a
   separate walk that returns the detail targets of successful source operations, minus targets
   already called in the same `execute`.
5. `src/executor/run.ts:188`, `evidenceRecoveryHint`: carry the detail targets on the hint
   (source operations, target id, join key). Compute them before the unprofiled-operation early
   return and independent of `mode`: that rule guards the "narrow lookups only" claim, which a
   detail pointer does not make.
6. `src/policy/evidence-checkpoint.ts:31`, `evidenceCheckpointBlock`: when the hint has detail
   targets, render one sentence first, generated from the ids and the key. Draft: "`<source
   ops>` returned sections of pages, not whole pages. Before you state a specific that the
   returned text does not show whole (a list, a number, a formula, code, a status), read the
   page: `stellarDocs.get_doc_page({ path })` with a hit's `path`." Limits on the final wording:
   built from the edge (no hand-typed operation name), no case vocabulary, about 260 characters.
   The two existing mode sentences stay byte-identical. A hint with detail targets and no
   alternatives still renders.
7. Regenerate `catalog/manifest.json` and any generated file that reads it with their scripts
   ([`scripts/README.md`](../../../scripts/README.md)); update the tests for the hint and the
   block.

**Why its own sentence and not a fourth candidate.** A page read is not "one bounded alternative
pass" for an unanswered question; it completes evidence the agent already has. Putting the edge
first in the list would also push `stellarDocs.search_meeting_notes` out of the three, which is a
second change in the same arm. The cap of 3 is not measured anywhere I read. This arm leaves it
alone so that one thing changes.

**It must not change.** `search` hits, order, `recovery`, and `widerCandidates`; the routing gate
denominators; the alternatives named after any operation; the checkpoint text of an `execute`
with no Docs search; tool descriptions, `SERVER_INSTRUCTIONS`, and the micro-map; the envelope
and `caveat`; the playground's call budget. No edge for another family in this arm: the reviewed
evidence is Docs only.

**Smallest free checks, in order.**

1. Gates, each run bare: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke`
   (the change touches `src/executor`), `npm run eval:routing -- --gate`, the generated-files
   sync check, `npm run secrets:scan -- --tree`.
2. Replay. Feed each stored baseline `execute` of the 79 tuning rows (its operation ids only)
   through the hint builder. Expected: the detail sentence on every `execute` with a successful
   Docs search and no page read, which covers at least one `execute` in each of the 49 rows; no
   detail sentence on any other; alternatives identical to the stored checkpoint text.
3. One live `execute` on the local `dev:eval` server with a Docs search only (sentence present),
   and one with a search and a page read (sentence absent). Record the added characters.
4. Reachability, read-only and with no model: for each of the 9 target rows, read the first two
   pages whose `path` the agent already had in its baseline results, and record whether the fact
   that the review found missing is on the page. Write "reachable: yes or no" per row in the
   ledger before the paid run. A row whose fact is on no page it was shown cannot move, and is
   not counted against the arm.

Add the 9 cases as evidence under the two existing `.agents/TODO.md` items ("Point agents at the
page when a docs hit has no body" and "Measure 'read past the snippet' guidance"); open no new
item.

### Arm 2 (target 1): exact rows on research results. Recommendation and reason

**I recommend the row-level signal, and I recommend against adding a source-map rule.**

- **It is nearest the failure.** In `q-sep-43-web-wallet-api` the product returned the SEP's own
  file first and labelled the call `unverified-match`; the agent said it "didn't treat [it] as
  evidence" and answered that nothing was found. Three host texts told it so at that moment: the
  envelope `caveat`, the CANDIDATE EVIDENCE block, and the checkpoint's last sentence. A rule in
  the micro-map cannot outvote text attached to the result itself.
- **It is a precondition.** Any later fix that sends an agent to research for a standard (a map
  rule, a routing repair, the family decider) delivers it to rows that the host calls
  candidates. Until that label is right, those fixes buy little.
- **Instruction text is the scarce resource.** `SERVER_INSTRUCTIONS` is 4,066 of 4,096
  characters on `main`. The authority rules are its last 600 characters: the first text any
  shorter client limit cuts, and text that PR 439 already pushes over the limit. A result-borne
  signal reaches every client and costs no instruction character.
- **Its reach is small, and the plan says so.** At baseline behavior it fires on three tuning
  rows: the two targets above and `q-pc-sponsored-reserves` (a "CAP-33" research query). It
  cannot help the 7 target rows that never called research. Those are a routing failure, and
  this loop does not fix it (see "What target 1 still needs").

**Mechanism.** The host marks a research row as exact when the query, the upstream source label,
and the row's URL agree on one document identifier. It judges no relevance.

1. `src/executor/providers.ts`, beside `resultCaveat` (line 273; call site line 511): a pure
   function over the entry, the call arguments, and the data. It applies only to candidate lanes.
   Row *i* is exact when either holds:
   - upstream says so: the row's `exactKeys` is a non-empty array (Scout's own row-level
     statement for audit finding ids, CVE and GHSA ids, and release tags; today such a row is
     labelled a candidate too);
   - identifier agreement: the query (`q` or `query`) contains a token of letters, an optional
     hyphen or space, and digits; the row's `source` equals those letters, ignoring case; and
     the last URL path segment, without its extension, is those letters, a hyphen, and the same
     number. No list of standards and no per-series constant.
2. The ok result gains an optional `exactRows: [{ index, key }]` (for example
   `{ index: 0, key: "sep-0043" }`), present only when non-empty. `caveat` is unchanged in value
   and in when it is set: the other rows are still candidates. `data` is not touched.
3. Host blocks. The `calls:` line (`src/policy/source-basis.ts:339`) shows
   `[caveat: unverified-match; exact: sep-0043]`. `candidateEvidenceBlock`
   (`src/policy/evidence-checkpoint.ts:26`) appends one generated sentence when any call has
   exact rows: "Exception: `<op>` returned the document that the query names by identifier
   (`<key>`, `<url>`). That row is the document itself: cite its own text, status, and date. The
   other rows stay candidates."
4. Types (`src/adapters/types.ts`), the operation ledger and summary (`src/executor/run.ts`),
   the public description of the envelope (`src/site.ts`), and tests.
5. Upstream first, through `improvements-pipeline`, both free: Scout research rows from the
   `sep` and `cap` sources return `docKind: null` where the schema says `spec`; and `exactKeys`
   does not cover SEP and CAP identifiers although the ranking already detects them. Verify each
   with a live read before filing. When upstream covers these identifiers, delete the identifier
   rule and keep the `exactKeys` rule.

**It must not change.** The `caveat` vocabulary; which calls count as candidate evidence; any
result with no exact row (its blocks stay byte-identical); tool descriptions,
`SERVER_INSTRUCTIONS`, the micro-map, the catalog, and `search`.

**Smallest free checks.**

1. Unit cases built from the four production responses above: the named document (exact); a row
   that only cites the identifier (not exact); a neighbouring number (not exact); an identifier
   with no document (none); a query with no identifier (none); zero padding and spacing
   (`SEP-0043`, `sep 43`); two identifiers in one query; a row whose URL slug matches and whose
   `source` does not (not exact); a row with non-empty `exactKeys` (exact).
2. Gates as in arm 1, without the catalog steps (the routing gate is free; run it anyway).
3. Live, read-only, no model: repeat the baseline's three identifier-naming research calls
   (SEP-43, SEP-53, CAP-33) and the SEP-57 and SEP-45 probes. Expected: one exact row each. Then
   the other 18 research-calling tuning rows' queries: expected none.

**What target 1 still needs, outside this arm.**

- The 7 rows that never reached research have one shared cause that is already an open item:
  `search` does not surface the research lane. This is new evidence for PH4 in `.agents/TODO.md`
  ("`search` does not surface the research lane for protocol-history questions"): the same
  absent lane on standards questions from different families (a wallet SEP, a token-compliance
  SEP, a CAP's status). The implementer adds the dated note there; the routing repair stays held
  until the owner rules on PH3.
- The micro-map says Stellar Docs is the authority for "standards status" and that research
  rows are "community-aggregated" until corroborated by Docs. Both are false for SEP and CAP
  files. I do not propose a new rule. If arm 3 removes the map, both sentences go with it. If the
  map stays, the next change that edits the map deletes those claims, with a net character
  count at or below zero.

### Target 3: nothing paid in this loop

- BASELINE.md proposed re-measuring the 7 rows after the target 2 change. I cut that: only 1 of
  the 7 ran a Docs search, so arm 1 cannot reach the other 6, and the run would show nothing.
- No wording change: the prose already teaches "pick both families up front".
- One free task now: list the 23 unprofiled operations and, for the 79 stored tuning rows, count
  the `execute` results that got no checkpoint and why (unprofiled operation, or skills only).
  Record it in `.agents/TODO.md`, under an existing item if one covers it, otherwise as a new
  item under "Executor and tool surface".
- The mechanism candidate for the next loop is graph coverage: profiles for the unprofiled
  operations, and a checkpoint for an `execute` that read only skills. It has three unrelated
  cases behind it (`q-data-network-metrics-sources`, `q-tool-cli-skills-discovery`,
  `q-cctp-v2-usdc-stellar`), which meets the bar for acting. It waits because it edits the same
  checkpoint as arm 1, and because the stellar.org source (section 4) may answer some of the
  seven rows by itself: the SDF mandate and Enterprise Fund pages are stellar.org pages.
- `q-scf-vs-sdf-enterprise-fund`'s unsupported paraphrase stays a single-case note.

## 2. The paired measurement

### The panel: 48 tuning rows, fixed for the whole loop

Selection rules, applied to the baseline sample, not chosen by hand:

- every target row of arms 1 and 2 (17 rows; `q-sep-45-contract-auth` is in both);
- every other row where arm 2's rule would have fired (1 row);
- **controls, exposed** (17): every baseline-correct row that ran a Docs search with no page
  read. Arm 1 can fire on all 17, and 9 of them also called research. Four are trap rows;
- **controls, unexposed** (6): every other baseline-correct row. No arm 1 or arm 2 mechanism
  fired on them. They come from six categories and include one trap row;
- **priority partials** (7): every baseline-partial row in `soroban` or `tooling-infra` where a
  mechanism can fire, outside the targets. Application development and audits matter most, so
  these show whether the changes help or harm there on rows nobody picked as targets.

Left out: the 4 rows with open case defects (their goldens may change), the 7 target 3 rows, and
20 other partial or wrong rows. Of those 20, the ones in the two priority categories ran no
exposed call at baseline, and the rest are in other categories; arm 1 can still fire on some of
the rest. The held-out read is the check on everything the panel does not cover.

| Case | Role | Category | Baseline | Docs search, no page read | Research called |
|---|---|---|---|---|---|
| `q-soroban-cli-bindings` | A1 target | soroban | wrong | yes | no |
| `q-infra-rpc-methods-list` | A1 target | tooling-infra | partial | yes | no |
| `q-soroban-contract-id-derivation` | A1 target | soroban | partial | yes | no |
| `q-smart-wallet-fee-sponsorship` | A1 target | compliance-rwa-payments | partial | yes | no |
| `q-ti-classic-submission-errors` | A1 target | tooling-infra | partial | yes | no |
| `q-pc-cross-redstone-sep40` | A1 target | protocol-core | partial | yes | no |
| `q-pc-sequence-numbers-ordering-replace` | A1 target | protocol-core | partial | yes | no |
| `q-pc-account-activation-not-found` | A1 target | protocol-core | partial | yes | no |
| `q-sep-45-contract-auth` | A1 and A2 target | assets-anchors-seps | partial | yes | no |
| `q-sep-43-web-wallet-api` | A2 target | assets-anchors-seps | wrong | yes | yes |
| `q-sep-53-sign-verify-message` | A2 target | assets-anchors-seps | partial | yes | yes |
| `q-crp-oz-rwa-erc3643-trex` | A2 target | compliance-rwa-payments | wrong | yes | no |
| `q-sep6-sep24-sep31-choice` | A2 target | assets-anchors-seps | partial | no | no |
| `q-nft-vault-contract-standards` | A2 target | assets-anchors-seps | partial | no | no |
| `q-net-protocol-meeting-notes-find-cap` | A2 target | protocol-core | partial | yes | no |
| `q-protocol-ledger-close-time` | A2 target | protocol-core | partial | yes | no |
| `q-edge-factcheck-soroswap-first-amm` | A2 target | edge-behavior | correct (trap) | no | no |
| `q-pc-sponsored-reserves` | A2 rule fires | protocol-core | partial | yes | yes |
| `q-asset-usdt0-layerzero-oft` | control, exposed | assets-anchors-seps | correct | yes | yes |
| `q-comp-aml-analytics-vendors` | control, exposed | compliance-rwa-payments | correct | yes | yes |
| `q-comp-sep8-regulated-assets-approval-server` | control, exposed | compliance-rwa-payments | correct | yes | no |
| `q-defi-agent-identity-stellar-experimental` | control, exposed | defi-ecosystem | correct | yes | yes |
| `q-defi-agentic-payment-standards-compare` | control, exposed | defi-ecosystem | correct | yes | no |
| `q-edge-asset-site-scam-detection` | control, exposed | edge-behavior | correct | yes | yes |
| `q-edge-inject-ignore-instructions` | control, exposed | edge-behavior | correct (trap) | yes | no |
| `q-edge-noinfo-stellar-native-privacy-default` | control, exposed | edge-behavior | correct (trap) | yes | no |
| `q-n3-issues-842-backup-faucet-wallet` | control, exposed | edge-behavior | correct (trap) | yes | yes |
| `q-n3-pi-network-wrong-chain` | control, exposed | edge-behavior | correct (trap) | yes | yes |
| `q-pc-quantum-preparedness-dormant` | control, exposed | protocol-core | correct | yes | no |
| `q-protocol-tier1-requirements` | control, exposed | protocol-core | correct | yes | no |
| `q-scf-instawards` | control, exposed | scf-grants-builders | correct | yes | yes |
| `q-sep24-interactive-deposit-flow` | control, exposed | assets-anchors-seps | correct | yes | no |
| `q-smart-account-scoped-policy-signers` | control, exposed | soroban | correct | yes | yes |
| `q-soroban-reentrancy` | control, exposed | soroban | correct | yes | yes |
| `q-zk-host-functions-status` | control, exposed | soroban | correct | yes | no |
| `q-aas-trustline-limit-lifecycle` | control, unexposed | assets-anchors-seps | correct | no | no |
| `q-asset-usdc-eurc-issuer` | control, unexposed | retail-consumer | correct | no | no |
| `q-edge-oos-solana-vs-aptos` | control, unexposed | edge-behavior | correct (trap) | no | no |
| `q-hot-fee-pool-burn-deflation` | control, unexposed | history-org-tokenomics | correct | no | no |
| `q-infra-which-indexer` | control, unexposed | tooling-infra | correct | no | no |
| `q-sor-custom-errors-find-failure-cause` | control, unexposed | soroban | correct | no | no |
| `q-sor-deploy-invoke-from-js-sdk` | priority partial | soroban | partial | yes | no |
| `q-soroban-check-auth-custom-account` | priority partial | soroban | partial | yes | no |
| `q-soroban-storage-types` | priority partial | soroban | partial | yes | no |
| `q-ti-enumerate-holders-airdrop` | priority partial | tooling-infra | partial | yes | no |
| `q-ti-parse-raw-ledger-data` | priority partial | tooling-infra | partial | yes | no |
| `q-tool-js-sdk-package` | priority partial | tooling-infra | partial | yes | no |
| `q-soroban-pre-mainnet-security-steps` | priority partial | soroban | partial | no | yes |

Baseline on these 48: 24 correct, 21 partial, 3 wrong.

### Which rows each change can affect, named before the run

| Arm | Can fire on | Expected to improve | Expected unchanged |
|---|---|---|---|
| 1 | The 38 panel rows with "yes" in the Docs column | The 9 A1 targets that free check 4 marks reachable | The 6 unexposed controls; any row with no Docs search in its new transcript |
| 2 | Any row whose new transcript has a research call that names an identifier | `q-sep-43-web-wallet-api`, `q-sep-53-sign-verify-message`; `q-pc-sponsored-reserves` may | Every row with no such call. At baseline that is 45 of 48 |
| 3 | All 48 (the instructions reach every row) | No row is promised. The A2 targets that never reached research are where the map's false authority claims act | Nothing is exempt |

A row that moves where its arm's mechanism did not fire is a noise observation. Record both
verdicts. It counts neither for nor against the arm.

Arm 2 gives the loop its noise floor without a run of its own: about 45 rows see a surface
that is the same for them in step 1 and step 2. Report their flips as the panel's observed
same-surface flip rate, and use it only to bound what variance can explain in arm 3 and the
held-out read.

### Pass rule

For a panel row, before against after:

- **up**: the verdict rises a grade, or it is unchanged and the answer now states the fact the
  review found missing, with no new wrong claim. Read the answer; `missingFacts` is judge prose
  and its length is not a measure.
- **down**: the verdict falls a grade, or a new wrong claim appears.
- **in the path**: the after-transcript shows the mechanism reached the row. Arm 1: the detail
  sentence appeared and a page read followed. Arm 2: an exact row was flagged in a result the
  answer used. For a row that went down, the mechanism's text in any result is enough.

Keep an arm only when all of these hold:

| # | Rule | Reverts when |
|---|---|---|
| K0 | **Delivered.** The text appears where the replay predicted, and behavior moves. Arm 1: page reads after a Docs search on the 9 targets rise from the baseline's 0 of 9. Arm 2: every research call that names an identifier whose document comes back carries the exact row. | The text is missing, or no target behaves differently. Then any verdict change is noise |
| K1 | **More correct.** At least two different rows go up with the mechanism in the path, and more rows go up than down among rows where it fired. Two is the skill's bar for acting, applied to a fix. | Fewer than two, or not more up than down |
| K2 | **No new wrong answer.** No panel row becomes `wrong` with the mechanism in the path. | One such row |
| K3 | **No control regression.** No control goes down with the mechanism in the path, and every trap row still passes its trap. | One such row, or one failed trap |
| K4 | **Cost stated.** Cost per answer and median turns, before and after, beside the verdicts. | Not by a number. If K1 to K3 hold, the orchestrator reverts for cost only when the rise outweighs the wrong answers removed. For arm 1, also report page reads on rows whose verdict did not change |

An arm that passes K0, K2, and K3 and misses K1 is inconclusive. Inconclusive reverts: the cases
stay red with a note, and the arm is not run again. For arm 2, K1 can be met only if both
reachable targets, or one and `q-pc-sponsored-reserves`, go up. That is a real chance of a
revert on a change I recommend. If the orchestrator would keep arm 2 as a correctness fix
whatever the count says, say so before the run and skip the run; do not run it and then
overrule the result.

Arm 3 uses K2 to K4 over all 48 rows with "in the path" always true, and a different K1: keep
the map only if removing it costs more rows than it gains, by more than the observed
same-surface flip rate can explain. Otherwise remove it: text that adds nothing an agent uses
is cut.

### Method

- Before any spend, assert 48 jobs planned. Compare rows only when `caseInputSha256` matches on
  both sides; a row whose case changed leaves the comparison and is reported.
- Pins as [`eval/qa/README.md`](../../../eval/qa/README.md) requires, computed in the collection
  shell. Each arm has a new surface hash; record it with the server revision.
- Judge: the default tier policy, and the baseline's stability register in every arm
  (`--stability-register`, SHA-256 `4322dd4d…f458`). A subset run panels different rows than the
  247-row run did, so record `judgeTierUsed` on both sides. No row is counted on its verdict
  alone, so a tier difference cannot decide an arm.
- Step 0 is the stored baseline only while three things hold: the arm branches from a commit
  whose surface hash is `b336fa14…3404` (free: `eval/report-live-surface.mjs`), the agent binary
  and environment hashes match, and the remote identity vector is still `046b0280…27e8`. If the
  vector moved, collect the panel once on the baseline revision first, as a named amendment
  with the same USD 12 cap. The same rule holds between any two steps.
- One server at a time: the arm's commit in the clean `gca-eval` worktree, started as the
  measuring lane's own `dev:eval` child, as the baseline brief did. Stop only that server.
- After each run, `npm run eval:plan` on the results (free). For arm 1, broad-to-detail use on
  the panel is the direct measure of K0.

### Held-out counts

Read once, when the loop ends with at least one arm kept, on the final kept surface: all 119
held-out cases, variant A, the same models and pins. The launcher (D3) takes the id list from
`sets.heldOut` and prints only: correct, partial, and wrong counts, the core-answer count, the
five-track numbers, and cost. No lane opens a held-out or reserve row, lists an id, or reads the
results file. The reserve set is not run in this loop. `sets.tuning` is the only part of
`~/backups/gca-2026-11-14-split-v2.json` a lane reads.

Reading, fixed now against the baseline's 37 correct, 72 partial, 10 wrong: ship the kept
changes when correct is at least 37 and wrong is at most 10. Otherwise hold: nothing is opened
and nothing is re-run, and the owner decides the next spend. If no arm was kept, skip the read.
If the remote vector has moved since the baseline, the counts also carry upstream drift; say so
beside them.

## 3. Ordering and independence

- **Order: arm 1, arm 2, arm 3.** Arm 1 first because it reaches the most rows and has the
  strongest evidence (the plan regrade: 0 wrongs among 9 rows that read a page, 8 among 52 that
  did not). Arm 3 last because it changes what every row sees.
- **One change per step.** Each arm is its own branch from the last kept commit and its own
  pull request. A reverted arm's branch closes, and the next arm starts from the last kept
  commit. Each step is compared only with the step before it, on the same 48 rows.
- **Disjoint text.** Arm 1 changes the checkpoint after a Docs search. Arm 2 changes the
  envelope and the candidate block on a research call that names an identifier. Arm 3 changes
  the server instructions. Arms 1 and 2 both edit `src/policy/evidence-checkpoint.ts`, in
  different functions.
- **The shared row.** `q-sep-45-contract-auth` needs both a page read and the SEP's status. Arm
  1 is read on it for the first, arm 2 for the second; stacking gives each step its own delta.
- **Parallel work, serial measurement.** The implementer may build arm 2 and run its free
  checks while arm 1 is measured, on a branch from the baseline commit, then rebase onto the
  kept commit. Nothing is measured on a surface that holds two unmeasured changes.
- **Nothing else lands mid-loop.** A merge to the measured branch from any other work changes
  the surface hash and voids the comparison.

## 4. What is in flight, and how it interacts

| Item | In this loop? | Why, and what it must do |
|---|---|---|
| **stellarOrg source** (PR 439, held; +624 characters, over 4,096) | No. It lands after the loop | It is a source addition with its own review and measurement, and the baseline was taken before it so its effect can be read against these rows. Mid-loop it would change the surface under both arms. Arms 1 and 2 use no instruction text, so they do not make its overflow worse. If arm 1 is kept, PR 439 adds a `detail` edge from `stellarOrg.search_site` to `stellarOrg.get_page` and profiles for both; the build guard checks the join key. It rebases onto the loop's final commit and is measured on this panel plus its own rows. It may also answer at least two target 3 rows (the SDF mandate and Enterprise Fund pages are stellar.org pages; unmeasured), which is one reason target 3 waits |
| **Caps audit M3** (the micro-map's value) | Yes, as arm 3, if D2 is approved | The "with map" arm is the step before it, so it costs one panel run. Its result decides three things: whether PR 439's overflow is solved by deletion (the map is 2,165 characters); whether the false authority claims in the map go by deletion; and whether the family decider's arm B (a rewritten map, 4,961 characters in total) has anything to win. Mechanism: `SERVER_INSTRUCTIONS` without the micro-map, through the build script and its tests, nothing else. Free check: the instructions test, and the `search` description unchanged |
| **Caps audit M2** (`execute` boundary 4,000 against 6,000) | No. After the loop | It pulls against arm 1: page reads add large results, and a lower boundary cuts them. Together they are confounded. Arm 1's run gives M2 its free first step: how many results reach the boundary, with and without page reads |
| **Caps audit M1** (search default 7 against 5) | No. Its free step can run now | It changes the search page, a third surface. It would not fix target 1: research was absent at limits 8 and 10 on those rows. The free replay of stored search queries at 5 and 7 changes no surface and can run beside the loop |
| **Client text-limit probe** (Codex may show about 512 characters) | An input, not an arm | See below |
| **Family decider** (`exp/family-decider`) | No | It changes the search page (arm R) and the map (arm B), tunes on its own FAM and SORG sets, and has a sealed confirmation and a freeze. Its QA step, if it gets one, comes after this loop, with the loop's final commit as its control and this panel as its tuning rows. The 7 target 1 rows that never reached research are the failure it aims at: they stay named in this record only, and nothing in that experiment is tuned on them by id |

**If the probe confirms that Codex shows about 512 characters.**

- Arms 1 and 2 are unaffected. Both act in tool results, which every client shows. That is why
  they are the first two arms.
- Arm 3 matters more: Codex users would already run without the map, and without most of BASE.
  If Claude Code loses nothing without the map, delete it for every client.
- From then on, no change in this or a later loop may put a rule that an answer depends on only
  in the server instructions. A rule goes in a result (checkpoint, caveat, card) or in the first
  512 characters.
- A follow-up outside this loop reorders BASE so that its first 512 characters carry the
  workflow, and measures it with a Codex lane. That needs the Codex runner in `.agents/TODO.md`
  ("Add a runner for Codex and Grok as QA answering clients").

If the probe shows Codex receives everything, nothing above changes: Claude Code still has 30
characters of headroom.

## 5. The loop

1. **Free work first** (no authorization): arm 1's implementation and free checks; the target 3
   coverage count; the two upstream findings; the PH4 note; M1's free replay if a lane is idle.
2. **Review.** An independent reviewer reads each arm's diff before its paid run, under the
   `AGENTS.md` reviewer rule. The orchestrator picks the reviewer and records tier, model, and
   effort.
3. **Measure arm 1.** Write its authorization in the ledger; run the panel; regrade the plan;
   review the declared rows; apply K0 to K4; record keep or revert, with result stamp, surface
   hash, cost, the rows that moved, and the noise observations.
4. **Measure arm 2** on the commit that step 3 left, the same way. Report the same-surface flip
   rate.
5. **Measure arm 3** if D2 was approved, the same way.
6. **End of loop.** The loop ends when the last authorized arm is decided. It ends early when
   two arms in a row revert (stop and re-plan from the transcripts; do not try a variant), when
   a cap or pin stops a run, or when the weekly subscription limit leaves no room for the
   held-out read. Then read the held-out counts once, apply the fixed reading, and close the
   round per the skill's section 8.

What the next loop inherits, in order: PR 439 on the final commit; graph coverage for target 3;
M2; the routing repair for standards questions if the owner opens PH3.

## Limits

- Exposure, the panel's roles, and every "expected" above rest on one baseline sample per row.
- I did not open the nine target 1 transcripts beyond their tool calls and search pages; the
  mechanisms come from BASELINE.md and `review.json`.
- The production read used four queries. Arm 2's free check 3 repeats it on the real ones.
- I did not trace where the candidate cap of 3 or the profile edge limit of 6 came from.
- The estimates use the baseline's cost per case. Arm 1 adds page reads; the baseline's
  page-reading rows cost about 8% more than its other Docs rows.
