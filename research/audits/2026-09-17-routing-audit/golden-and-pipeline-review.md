# Golden corrections and canonical-source pipeline — independent review

- Reviewer: Fable high (Claude Fable 5.1), independent from proposer Opus and coordinator Astra.
- Date: 2026-09-17 (observations 01:40Z–02:05Z). Read-only. No repo edits, Git writes, paid calls,
  servers, new agents, external messages, or signed transactions. One unsigned, never-submitted
  `simulateTransaction` was run. One Chrome tab was opened and closed; a Discord OAuth prompt was
  not authorized.
- Inputs: `golden-corrections/proposed/*.json` (v2 LOBSTR, v3 Aquarius, v3 Soroswap),
  `golden-corrections/frozen/*.json`, `golden-corrections/lint-summary.json`, the worktree
  `repo/` on branch `fix/routing-generalization` at `d4cac5a9` with its dirty diff, and
  `scf-root-public-fields.json`. Prior blind pass: `lobstr-blind-review.md`.

## Reviewed hashes (SHA-256, from golden-corrections/README.md, files unchanged at review time)

| File | SHA-256 |
|---|---|
| frozen/q-eco-lobstr-wallet.json | 744ec07eab8a0e47ddb59ade2b439a5fad40e06538369e7b8e749fea20de7ca3 |
| frozen/q-defi-aquarius-what-is.json | c2eaf588afef2f1727d433c060381a19a565f791ec769d287d66e25b7b744c50 |
| frozen/q-defi-soroswap-what-is.json | ef5aa414ae3c68a2ecd817ffd8fe905857d946c51f958719f907140e2761f489 |
| proposed/q-eco-lobstr-wallet.json (v2) | 505d018d628ca002e413acbc7a549dd082c37ade7511e76ce0b68d86e1256755 |
| proposed/q-defi-aquarius-what-is.json (v3) | 764fbe7aeed889177169340e73079b59cdd7a0ae3b54a8e182600bbc023e1726 |
| proposed/q-defi-soroswap-what-is.json (v3) | c80a4f9a7d9ec559c46b8774940581b900c75f5b2e952223cd7e209fb16e67b5 |
| build-proposals.mjs (v3) | b0368fb272bc0784934f2f9644e0b646ab317a14d86651593646fe546146747a |

The consistency register stamps the frozen hashes for all three cases (`eval/qa/consistency-register.json`
lines 122, 362, 368, 423), so `npm run eval:qa:register` will reopen their clusters on application.

## 1. SCF raw-payload correction (contradiction reconciled)

The rendered SCF page shows only "Total awarded $232.0K*". The public Next.js RSC payload in the same
HTML carries both totals. Raw fetch of https://communityfund.stellar.org/project/lobstr-gcn at
2026-09-17T01:54:36Z, decoded from `self.__next_f.push` chunks:

```
"project":{"id":"rec9OnToqRfRU4gcN","title":"Lobstr","slug":"lobstr-gcn",
 "totalAwarded":232000,"totalPaid":267462.64, "awarded":true,
 "lastAwardedRound":17,"buildAwardRounds":["SCF #2","SCF #22","SCF #17"],
 "submissions":[
  {"id":"recWR4fbwZYJ72i34","status":"Awarded","project":"rec9OnToqRfRU4gcN","projectName":["Lobstr"],"roundName":"SCF #17","awardType":"Legacy v4.0 Award","budget":144000},
  {"id":"recLPGmYh7sNVjRz7","status":"Awarded","project":"rec9OnToqRfRU4gcN","projectName":["Lobstr"],"roundName":"SCF #22","awardType":"Legacy v5.0 Community Award","budget":88000},
  {"id":"reckAPLIsrEDIE0Zb","status":"Awarded","project":"rec9OnToqRfRU4gcN","projectName":["Lobstr"],"roundName":"SCF #2","awardType":"Legacy v1.0 Award"}]}
```

- Entity association verified: all three submissions reference `project rec9OnToqRfRU4gcN` and
  `projectName ["Lobstr"]`; the same project object with both totals is embedded in all three
  submission pages (recWR4fbwZYJ72i34, recLPGmYh7sNVjRz7, reckAPLIsrEDIE0Zb).
- Root's `scf-root-public-fields.json` excerpt matches this object byte for byte.
- History: Wayback `web/20260521081837id_/…/project/lobstr-gcn` already carried
  `totalAwarded 232000` and `totalPaid 267462.64`. The fields pre-date the 2026-07-11 verification that
  called both totals reconstructions, so "prior verification-scope error" is the right classification.
  The proposal's evidence line "No archived LOBSTR page was retrievable" is wrong and should cite this snapshot.
- Aggregator mapping (live 2026-09-17T01:57Z): Lumenloop `get_project lobstr` →
  `scf.awarded_total 267463` (= totalPaid rounded); Scout → `scfTotalAwardedUSD 232000`,
  `scfBasis "official-record"`, `scfSourceUrl` = the SCF page. Both copy one class A record on different
  bases. There was never a factual dispute, only a basis mismatch.
- Independence: two curl reads of one SDF page are one class A witness. They support the
  source-relative basis correction. They do not corroborate any amount for pinning (numeric bar: two
  independent classes, one primary). No amount may enter judge-facing text.
- Correction to `lobstr-blind-review.md` (§1, §2 row 7, §3): "per-project paid amounts are not
  published" is wrong. SDF publishes a project-level paid total in the public payload. Per-tranche
  and per-award paid amounts remain unpublished. All other blind-pass findings stand.
- Recorded oddities, not to pin: `lastAwardedRound` is 17 although SCF #22 is later; `totalPaid`
  exceeds `totalAwarded` by $35,462.64, consistent with an SCF #2 lumen award valued at payment, but
  no source says so.

## 2. Per-case verdicts

Common checks: question, `golden.keyFacts`, and `surface` are unchanged in all three cases
(asserted by diff). Offline lint reports zero findings for all three (`lint-summary.json`).

### 2.1 q-eco-lobstr-wallet — ACCEPT on application, with edits. No blocker.

Verdict basis: `truth.status disputed → mixed` and the amount row `disputed → unverifiable` are
correct. The frozen row's claim ("only the SCF #22 $88,000 amount was ever officially published … no
SCF #17 amount published") is false: submission recWR4fbwZYJ72i34 shows Requested Budget $144.0K.
Amounts stay out of answer, keyFacts, and avoid. New class A source row for the SCF page is correct.

Remaining corrections at apply time:

1. Remove the "SCF $232,000" fragment from the "GROUNDED 2026-06-22" note (root committed to this),
   so no judge-facing amount remains. Replace legacy op name `lumenloop_get_project` with
   `lumenloop.get_project`.
2. Refresh `truth.asOf` and the answer's "As of **2026-07-10**" to 2026-09-17; every live re-check is
   dated 2026-09-17 and Google Play was updated 2026-09-11.
3. `truth.verified.rootCause[0]` is prose. Add a `.agents/TODO.md` entry for the eval-side avoid
   overreach and point to it.
4. `rootCause[1]` cites ll-013 for "LumenLoop exposes the official paid total as scf.awarded_total",
   but `improvements/lumenloop/ll-013-scf-submission-award-fields.md` never mentions LOBSTR,
   `awarded_total`, or 267,463. Add a dated recurrence to ll-013 with the live observation
   (`get_project lobstr → scf.awarded_total 267463` = SCF `totalPaid 267462.64`).
5. Replace the evidence line "No archived LOBSTR page was retrievable (Wayback CDX 503/timeout)" with
   the 2026-05-21 snapshot citation above.
6. Minor: changed avoid item 1 still contains the inherited phrase "one verified current total",
   which matches the judge-blind `not-verified` regex. Confirm the diff-aware lint treats a modified
   item as not new before push.

### 2.2 q-defi-aquarius-what-is — ACCEPT on application, with edits. No blocker.

Sources verified independently:

- Class A (docs.aqua.network, live 2026-09-17): "Voters on markets with voting incentives receive daily
  payouts for as long as the market stays incentivized"; "Protocol voting incentives — funded
  automatically from AMM trading fees"; "Governance voting does not offer rewards — it's purely for
  protocol decision-making"; downvoteICE "was deprecated in June 2026"; lock multiplier "caps at 10x at
  1,095 days"; LP boost "up to x2.5". Reclassifying these from D to A is correct (operator's own docs).
- Class B: `AquariusDeFi/aqua-bribes@b714c86ace11bda511392311fcfb1c89f76ae814` (master head,
  2026-08-04): `rewards/reward_payer.py` `class BaseRewardPayer` with `_generate_payouts`,
  `_append_payment_op`, `_build_transaction`; `rewards/votes_loader.py` reads
  `https://voting-tracker.aqua.network` into `VoteSnapshot(votes_value, voting_account, market_key_id)`;
  `rewards/models.py` `class Payout` with `vote_snapshot` FK. `AquariusDeFi/aqua-governance@c937680a0326c591f16c229adfa431baf32a4b36`
  (master head, 2026-09-02): 121 blobs; zero `.py` files mention "reward" or "payout";
  `governance/onchain_hooks/asset_registry.py` and `governance/payment_statuses.py` exist. The
  qualified-negative wording is correct.
- Delegates page (kept docs-attributed): "10M AQUA is distributed among the top 20 whitelisted
  delegates"; "voting power, defined as the total amount of ICE delegated (dICE + gdICE)"; "The
  Signers Guild processes payments monthly". The docs define gdICE as delegated ICE for governance.
- Volatile TVL/rank grader text removed; no sibling case pins an Aquarius TVL share or rank.

Remaining corrections at apply time:

1. Add one sentence to `golden.notes` that the delegate reward pool computes voting power on dICE plus
   gdICE (governance-delegated ICE), so an accurate delegate-program statement is not graded as a
   "governance voting earns emissions" violation. The narrowed avoid item ("casting governance votes
   earns AQUA emissions") stays.
2. `rootCause` items 2 and 3 are prose eval-side flaws. Add `.agents/TODO.md` entries and point to them.

### 2.3 q-defi-soroswap-what-is — ACCEPT on application, with one owner decision. No blocker.

Verified independently:

- `soroswap/docs` main = `1d7a3c8a85616918415056ad2a0f6d2177fc1948`. `concepts/aggregator.mdx` line 16:
  "Stellar SDEX is not included as it is incompatible with Soroban-based smart contracts"; lines 13-14
  label Phoenix Protocol AMM and Aqua AMM "(currently on Testnet)". `aggregator/supported-amms.mdx`
  labels Aquarius AMM "(Coming Soon)". `api/index.mdx` line 19: "(Soroswap, Phoenix, Aqua and SDEX)".
  `index.mdx` line 3: "the first DEX and AMM aggregator on Stellar".
- `soroswap/.github` profile README line 25: "developed by the **PaltaLabs 🥑** Team".
- `soroswap/aggregator` `public/mainnet.contracts.json`: aggregator
  `CAYP3UWLJM7ZPTUKL6R6BFGTRWLZ46LRKOXTERI2K6BIJAWGYY62TXTO`, soroswap/phoenix/aqua adapters listed.
- Class F: unsigned, never-submitted `get_adapters` simulation at ledger 64464923 via
  https://mainnet.sorobanrpc.com and https://rpc.lightsail.network returned protocol_id 0, 1, 2 with
  `paused:false` and routers CAG5…JDDH, CCLZ…IO2G, CBQD…6QUK (identical on both providers).
- `improvements/resolved.json` sls-015 concerns OpenAPI `searchProjects` prose (liveRecheck
  2026-07-14), not project-record text, so removing the misattributed caution is correct.

Remaining items at apply time:

1. Owner decision: cs-002 makes `concepts/aggregator.mdx` a canonical page conflicting with the golden's
   dated adapter set. Golden-truth "Canonical-page conflict grading" requires an attributed quote to cap
   at partial with a `golden.notes` caution naming the page, the finding, and its expiry. The proposal
   records cs-002 only in `truth.verified.evidence`. Either add the caution (touches the ADR-0008
   three-case boundary; needs the owner's decision) or record in notes why it is withheld.
2. Open a `.agents/TODO.md` item for the flagged sibling pass (q-eco-dex-saturation,
   q-defi-soroswap-vs-stellarx grader notes merge API and on-chain aggregator layers).
3. `rootCause[0]` is prose; point it at that TODO entry.

### 2.4 Cross-cutting on application

- Set every `truth.verified.by` from "golden-truth correction draft 2026-09-17 (… not applied)" to the
  durable ledger reference: `.agents/rounds/2026-09-17-routing-audit.md`, naming author lane (Opus)
  and independent reviewer (Fable high).
- Run `npm run eval:qa:compile`, `npm run eval:qa:lint -- --since <merge-base>`, and
  `npm run eval:qa:register` (clusters "q-eco-lobstr-wallet + q-eco-stellar-wallets-list" and the
  Aquarius/Soroswap clusters will reopen).
- Re-judge the M1-B1 rows (`eval/qa/results/2026-09-17T01-33-03-variantA.json`) that hinged on these
  goldens and record the flip direction in the round ledger. The defects behind each change exist
  independently of the scores (SCF payload fields, Aquarius docs/source roles, sls-015 scope), which
  is what the score-laundering guard requires.

## 3. Canonical-source pipeline candidate — ACCEPT. No blocker.

Diff reviewed in `repo/` (branch `fix/routing-generalization`, HEAD `d4cac5a9`, dirty tree):
`scripts/improvements-lib.mjs`, `scripts/improvements-lint.mjs`, `test/improvements-lint.test.ts`,
`improvements/intake.json`, `improvements/README.md`, `improvements/INDEX.md`,
`.agents/skills/improvements-pipeline/SKILL.md`, `.agents/skills/run-evals/SKILL.md`,
`ARCHITECTURE.md`, `test/drift-141-routing.test.ts`, `improvements/skills/sk-022…`, `sk-025…`,
new `improvements/canonical-source/cs-001…`, `cs-002…`, and `.agents/rounds/2026-09-17-routing-audit.md`
plus the relocation of round artifacts to `research/audits/2026-09-17-routing-audit/`.

Gates run in the worktree:

- `node scripts/improvements-lint.mjs` → "improvements lint ok (59 findings)".
- `npx vitest run test/improvements-lint.test.ts test/drift-141-routing.test.ts` → 2 files passed,
  78 tests passed, 4 skipped.

Findings:

- Lib/lint/intake/README/skill/INDEX are consistent: `canonical-source` service, `cs-` prefix,
  `mixed` intake rule with per-finding overrides (cs-001 → cloudflare/agents, cs-002 → soroswap/docs).
  INDEX bytes match the generator (lint ok).
- cs-001: upstream issue https://github.com/cloudflare/agents/issues/2296 exists, OPEN, created
  2026-09-17T01:04:10Z. Cited Raven lines `src/catalog/vendor/search-scoring.ts:85` and
  `src/catalog/scoring.ts:474` both contain the bidirectional `startsWith` rule.
- cs-002: every docs, repository, and on-chain claim reproduced (see §2.3). Status `verified` with an
  intake override is consistent for an unfiled finding.
- sk-022/sk-025 evidence cites `2026-09-17T01-33-03-variantA.json`; the file exists at
  `eval/qa/results/` in the worktree, so the pointer resolves once committed.
- ARCHITECTURE.md "Routing admission" matches `rejectsRoutingIntent` in `src/catalog/search.ts:439`.
- Content survival of relocated round files: 15 of 17 byte-identical. `d3-review.md` gained a
  three-line status header only. `paid-plan-review.md` was rewritten (new title, expanded inputs; the
  original title and verdict lines are gone) while the `.agents/rounds/` copy is deleted.
  Non-blocking fix: keep the original text intact below the new status header.
- Nit: the third canonical-source unit test reads the live `improvements/intake.json` and asserts
  cs-001/cs-002; resolving either finding later breaks the test. Prefer a fixture intake.

## 4. Sources consulted for this review (beyond the blind pass)

- https://communityfund.stellar.org/project/lobstr-gcn (raw HTML, 2026-09-17T01:54:36Z) and the three
  submission pages; `web.archive.org/web/20260521081837id_/…/project/lobstr-gcn`.
- Raven MCP: `lumenloop.get_project({slug:"lobstr"})`, `scout.searchProjects({q:"LOBSTR"})` at 2026-09-17T01:57Z.
- docs.aqua.network `.md` pages: what-are-voting-incentives, aquarius-governance-community-led-decision-making,
  reward-program-for-delegates, ice-tokens-locking-aqua-and-getting-benefits, ice-boosts-how-to-maximize-lp-rewards, llms.txt.
- GitHub API/raw: AquariusDeFi/aqua-bribes@b714c86 (rewards/reward_payer.py, votes_loader.py, models.py);
  AquariusDeFi/aqua-governance@c937680 (full tree, all `.py` grepped); soroswap/docs@1d7a3c8a
  (concepts/aggregator.mdx, aggregator/supported-amms.mdx, api/index.mdx, index.mdx); soroswap/.github
  profile README; soroswap/aggregator public/mainnet.contracts.json; cloudflare/agents issue 2296.
- Stellar RPC: unsigned `simulateTransaction` of `get_adapters` on CAYP…TXTO via mainnet.sorobanrpc.com
  and rpc.lightsail.network (ledger 64464923).
- Repo: `eval/qa/lint-corpus.mjs` regexes, `eval/qa/consistency-register.json`,
  `improvements/resolved.json` (sls-011, sls-015), `improvements/lumenloop/ll-013…`, `ll-008…`, PLAN.md ADR-0008 pointer.

## 5. Application delta review (2026-09-17, after root applied the three corrections)

Scope: delta only, against the accepted proposals in §2. Worktree `repo/` on `fix/routing-generalization`
at HEAD `d4cac5a9` with the dirty tree. No current QA answers inspected. No edits, except the
disclosure below.

### 5.1 Applied case hashes (SHA-256 of `eval/qa/corpus/battery/defi-ecosystem/*.json`)

| Case | Applied |
|---|---|
| q-eco-lobstr-wallet | 0c7286f6dcc74724513aa5050c4c69edee1ef8d6fc33396188fdaceb7c2b5db7 |
| q-defi-aquarius-what-is | d78fb98ad5d3d3fe98b3048bd96a53c2174d3aa889a2e1e2d26e1ad05ea3fa3f |
| q-defi-soroswap-what-is | d5fdb61eb6cd07359a8f691eac89930ffbbb2e11490526471359ecd386a0dee4 |

`eval/qa/consistency-register.json` now carries these hashes; the five member clusters are marked
`verdict: "reopen"` with `reopened.reason: "member-content-changed"` dated 2026-09-17.

### 5.2 Delta verified against the accepted proposals

- **q-eco-lobstr-wallet.** Answer "As of" and `truth.asOf` moved to 2026-09-17. The "SCF $232,000"
  grounding fragment is removed and `lumenloop_get_project` is now `lumenloop.get_project`. Evidence[5]
  now cites `web.archive.org/web/20260521081837id_/…/project/lobstr-gcn` and drops the false "no
  archive retrievable" line. Evidence[7] points at
  `research/audits/2026-09-17-routing-audit/golden-and-pipeline-review.md` (present, byte-identical to
  this file at the time of copy). `verified.by` = ".agents/rounds/2026-09-17-routing-audit.md — Opus
  verification, Fable high independent review, coordinator reconciliation". rootCause[2] points at the
  new `.agents/TODO.md` entry "Complete the September 17 golden corrections and pilot regrading".
  Scan of answer + keyFacts + avoid + notes: no dollar amount, no legacy op name. ll-013 carries a
  dated 2026-09-17 recurrence recording `get_project({slug:lobstr}) → scf.awarded_total 267463` =
  rounded `totalPaid 267462.64` with `totalAwarded 232000`.
- **q-defi-aquarius-what-is.** Notes now state: "Those docs compute delegate voting power from dICE
  plus gdICE, including governance-delegated ICE; an attributed delegate-program statement does not
  claim that casting governance votes earns emissions." Ledger `by`; TODO pointer as rootCause[3].
  No amounts in judge-facing text.
- **q-defi-soroswap-what-is.** New "SOURCE STATUS 2026-09-17" note records that
  `concepts/aggregator.mdx` and `supported-amms.mdx` carry stale labels, that cs-002 records the
  conflict, that graders reconcile from the verified adapter configuration, and that "This update does
  not add a canonical-page grading exception; ADR-0008 requires a separate owner decision for
  expansion." That is the accepted "withhold and record why" option. Ledger `by`; TODO pointer.
  Inherited and out of scope (not a blocker): notes still carry Scout's "SCF $346,750" without a basis
  label and the legacy names `lumenloop_get_project` / `lumenloop_search_directory`.
- **`.agents/TODO.md`.** New entries: "Complete the September 17 golden corrections and pilot
  regrading", "Re-check the upstream codemode short-token repair" (supersedes the removed "Monitor
  vendor short-token prefix matching"), "Reconcile source-authority guidance for full-description
  clients", "Reconcile Soroswap API and contract scope in sibling grader notes". Each has a Done-when.
- **Relocated reviews.** `research/audits/…/paid-plan-review.md` = original text verbatim, preceded by a
  three-line status header, followed by the expanded reconciliation. `d3-review.md` = original plus a
  three-line status header. `lobstr-blind-review.md` copy = original plus a three-line supersession
  header. `golden-and-pipeline-review.md` copy = byte-identical to the /tmp original.
- **Unit test.** Root reports the intake-coupled canonical-source test was replaced with a generic
  fixture and focused tests pass; accepted as reported (not re-run in this pass).

### 5.3 Gates run in the worktree

- `npm run eval:qa:compile` → 501 cases; `cases.json` sha256
  `8ebc2358a3b0a6d25dbf8aa0ef8fc66f2e9eca277b16fc5363a68840d893fcae`; `sample.json` 30 cases;
  `lifecycle-registry.json` 501 reserved ids. **Disclosure:** this run rewrote the three generated
  files in the worktree. The generator is deterministic, but root should re-run compile before commit
  so the byte-pinned outputs are root's own.
- `npm run eval:qa:lint -- --since HEAD` → 0 errors, 62 warnings, none on the three cases (all
  pre-existing sourcing-guard / heuristic negative-claim / one q-tw-escrow warning).
- `node scripts/improvements-lint.mjs` → **FAILS**: "improvements/INDEX.md is stale; run npm run
  improvements:index" (ll-013 recurrences 5 → 6; index row still shows 5).

### 5.4 Remaining blockers and closure conditions

1. **BLOCKER (mechanical):** regenerate `improvements/INDEX.md` with `npm run improvements:index`;
   then `node scripts/improvements-lint.mjs` must report ok (expected 59 findings).
2. Re-run `npm run eval:qa:compile` after any further case edit (including item 3) so the committed
   generated files match; CI byte-pins them.
3. **Provenance-row correction (judge-blind, accepted):** see §5.5. After it, run compile, lint
   `--since <merge-base>`, and `npm run eval:qa:register` again (the LOBSTR clusters re-stamp).
4. Closure, not commit-blocking: the five reopened register clusters must return to `consistent`
   through the register helper after review; the M1-B1 rows that hinged on these goldens need symmetric
   regrading with flip direction recorded in `.agents/rounds/2026-09-17-routing-audit.md`; the sibling
   Soroswap pass and the Soroswap notes' inherited "$346,750" / legacy op names stay in the TODO.
5. Commit hygiene: `npm run secrets:scan -- --tree` before commit (not run in this pass).

### 5.5 LOBSTR inherited provenance row — narrow it (accepted correction, exact edit)

Applied `truth.corroboration[2]` reads:

```
claim: "LOBSTR built by Ultra Stellar, independent of SDF; no scale metrics in any live record"
verdict: "confirmed"
evidence: C (2026-07-03) "scout + lumenloop records … neither carries user/tx counts";
          D (2026-07-11) "lobstr.co / ultrastellar.com"
```

Problems: "independent of SDF" is an absolute negative the golden's own avoid item forbids asserting;
"no scale metrics in any live record" contradicts the answer's attributed 1M+ / 1.5M figures and fails
the negative-claim bar (absence from primary records + web sweep, dated and source-relative). The row is
judge-blind, so narrowing it does not change judge-facing scope. Exact replacement:

```
claim:   "LOBSTR is operated by Ultra Stellar and is presented as non-custodial (user-controlled keys)"
verdict: "confirmed"
evidence[0]: class C, ref unchanged, observedAt 2026-07-03, note:
  "scoped, dated observation: the Scout and Lumenloop directory records attributed Ultra Stellar and
   carried no user or transaction counts on 2026-07-03; not a claim about other sources"
evidence[1]: class D, ref unchanged, observedAt 2026-07-11, note:
  "re-checked 2026-09-17: lobstr.co 'You control your keys'; ultrastellar.com lists LOBSTR as its
   product; Google Play developer Ultra Stellar OU"
```

Add one `truth.verified.evidence` line: "Provenance row narrowed 2026-09-17: removed the inherited
'independent of SDF' and 'no scale metrics in any live record' negatives (unsupported under the
negative-claim bar and contradicted by the answer's attributed scale claims); operator and
non-custodial identity retained with dated evidence." Question, keyFacts, answer, and avoid unchanged.

### 5.6 Verdict

Golden corrections: ACCEPT as applied, subject to blocker 1 (index regeneration) and the judge-blind
row narrowing in §5.5. Pipeline: ACCEPT; `paid-plan-review.md` content survival is resolved and the
intake-coupled test nit is resolved per root's report.

## 6. Completion gate — final delta verdict (2026-09-17, ~22:12 local)

**PASS. No remaining golden or pipeline blocker.**

### 6.1 Final narrow delta confirmed

- `q-eco-lobstr-wallet` `truth.corroboration[2]` now reads: claim "LOBSTR is operated by Ultra Stellar and
  is presented as non-custodial (user-controlled keys)", verdict `confirmed`; evidence[0] class C
  (observedAt 2026-07-03) carries the scoped note "not a claim about other sources"; evidence[1] is
  class A, ref "https://lobstr.co/ and https://ultrastellar.com/", observedAt 2026-09-17 ("You control
  your keys"; LOBSTR listed as Ultra Stellar product; Google Play developer Ultra Stellar OU). Both
  inherited negatives ("independent of SDF", "no scale metrics in any live record") are removed. A
  matching `truth.verified.evidence` line records the narrowing and cites §5.5 of this review.
- `truth.sources` for LOBSTR: lobstr.co (A), ultrastellar.com (A), Google Play (F), XRPL Commons (D),
  SCF project page (A).
- `q-defi-soroswap-what-is`: no "ADR-0008" string in answer, keyFacts, avoid, or notes. The SOURCE STATUS
  paragraph ends: "The verified adapter configuration remains the grading authority for this case."
- All three cases: question unchanged, keyFacts unchanged, avoid item counts unchanged (2 / 3 / 2)
  versus the frozen files. No dollar amount in any LOBSTR or Aquarius judge-facing field.

### 6.2 Final case hashes (SHA-256)

| Case | Final |
|---|---|
| q-eco-lobstr-wallet | fe79ce3898b0b63ee88db1e729b63e9e9c29b5ec6bc92d41885e62477336197b |
| q-defi-aquarius-what-is | d78fb98ad5d3d3fe98b3048bd96a53c2174d3aa889a2e1e2d26e1ad05ea3fa3f |
| q-defi-soroswap-what-is | 85a819dfd79c3c03706a91fb88b5c41eeaa69863c33ce4027ef4b26acbde5b58 |

`eval/qa/consistency-register.json`: these hashes appear in all member stamps (12 occurrences); zero
clusters with `"verdict": "reopen"`; zero `reopened` blocks; cluster-022 `reSwept` 2026-09-17 verdict
`consistent`, with its note corrected to "SCF amounts are optional, and cited totals must name their
source, date, and awarded-versus-paid basis"; evidence pointer
`research/audits/2026-09-17-routing-audit/register-review.md`.

### 6.3 Gates re-run in the worktree (all green)

- `node scripts/improvements-lint.mjs` → "improvements lint ok (59 findings)". The §5.4 blocker
  (stale INDEX.md) is cleared.
- `npm run eval:qa:compile` → 501 cases; regenerated `cases.json`
  (sha256 8914bbfdd1996ffb57d87abc1849fca0a288fc45e61f68a0bc5362fbd3a19f93), `sample.json`, and
  `lifecycle-registry.json` were byte-identical to the tree. The tree was restored to root's bytes
  afterward, so this check left no change.
- `npm run eval:qa:lint -- --since HEAD` → 0 errors, 62 pre-existing warnings, none on the three cases.
- `node eval/qa/register-helper.mjs --check` → "[register-helper] up to date".
- `npx vitest run test/improvements-lint.test.ts test/drift-141-routing.test.ts` → 2 files passed,
  78 tests passed, 4 skipped (root replaced the intake-coupled test with a generic fixture).
- `npm run secrets:scan -- --tree` → clean (gitleaks, all tracked files, no leaks).

### 6.4 Not commit-blocking (tracked in `.agents/TODO.md`)

- Symmetric regrading of the M1-B1 rows that hinged on these goldens, with flip direction recorded in
  `.agents/rounds/2026-09-17-routing-audit.md`.
- Soroswap sibling-notes pass (q-eco-dex-saturation, q-defi-soroswap-vs-stellarx).
- Inherited Soroswap grounding note still carries Scout's "SCF $346,750" without a basis label and the
  legacy names `lumenloop_get_project` / `lumenloop_search_directory`.

Reviewer: Fable high, independent of author (Opus) and coordinator (Astra). Read-only throughout; the
only worktree writes were the compile-and-restore byte check in §6.3, which left the tree unchanged.
