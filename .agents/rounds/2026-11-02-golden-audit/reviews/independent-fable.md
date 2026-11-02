# Independent review: golden audit 2026-11-02 (branch `eval/golden-audit-2026-11-02`)

Reviewer: Claude Fable 5.1, high effort. Role: independent adversarial reviewer.
Scope: `git diff origin/main...HEAD` in `/private/tmp/claude-501/raven-goldens-1102`
(commits `edba0ba8` and `b03f9338`). No repo file was edited. Review date: 2026-11-02.

Verdict: **no blocker**. Two major findings (one process, one claim wording), two minor,
two nits. The branch is mergeable after the owner answers the re-judge question (F1) and
rewords one golden (F2). Everything else sampled is sound.

Working files for this review (outside the repo):
`/private/tmp/claude-501/golden-audit/fable-gospel-diff.mjs`,
`/private/tmp/claude-501/golden-audit/fable-diff.json`,
`/private/tmp/claude-501/golden-audit/fable-show.mjs`, and the `show-*.txt`,
`avoid-kf-changes.txt`, `leniency-sample.txt` dumps in the same folder.

Note: the `/private/tmp/claude-501/golden-audit/` working files named below were scratch files and
are not retained. Section 4 lists the live URLs, which are re-walkable.

---

## 1. Method

1. Parsed-JSON diff of judge-facing fields (`question`, `golden.answer`, `golden.keyFacts`,
   `golden.avoid`, `golden.notes`, `tags.*`, `truth.status/freshness/asOf/reverifyBy`,
   `truth.verified`) for every changed battery file. Result: 483 files, 214 gospel changes,
   269 truth-only. Field counts: keyFacts 52, notes 177, answer 153, avoid 39, freshness 17,
   status 3, trap 0, question 0. Avoid items added 46 / removed 36; keyFacts added 62 /
   removed 64. Every one of the 214 gospel cases has a changed `truth.verified` with a
   non-empty `rootCause`.
2. Sampled 35 gospel cases, weighted to numeric/date/version keyFacts, negative claims,
   new or removed avoid items, partial-cap changes, status moves, and the Varial rename.
   For each sample I checked that the evidence is re-walkable, that `rootCause` names a
   defect, that disputed facts are not pinned, that volatile facts carry `asOf`, and that
   siblings do not contradict.
3. Live spot-verified 14 high-stakes facts myself (section 4 lists every URL).
4. Checked `eval/qa/judge.mjs` re-pins, `eval/qa/source-sentinels.json`,
   `eval/qa/consistency-register.json`, the register re-sweep, `.agents/TODO.md`, and the
   new `improvements/**` findings for evidence, secrets, and partner-tier detail.
5. Searched for score laundering: cases that only removed keyFacts or avoid items, leniency
   phrase growth in notes, and the re-judge requirement from the skill.

---

## 2. Findings

### F1 — MAJOR (process): saved rows were not re-judged after 73 gospel cases gained new leniency

- File: `.agents/rounds/2026-11-02-golden-audit.md` (owner decision 3) and the 214 gospel
  case files under `eval/qa/corpus/`.
- Field: `golden.notes` (judge-facing).
- What is wrong: the `golden-truth` skill says a golden change must re-judge the saved rows
  that the old golden scored. The ledger records this as an open owner decision, not as
  done. My diff shows leniency phrases in `notes` ("also-good", "accept", "do not penalize",
  "either is acceptable" and similar) rose from 84 to 140 lines (81 to 130 files). 73 gospel
  cases gained net-new leniency text. 15 of them changed notes only. Two cases removed
  keyFacts with no additions (`q-aas-claim-received-claimable-balances`,
  `q-anchor-platform-what`).
- Evidence: `/private/tmp/claude-501/golden-audit/fable-diff.json` (`notesPartialBefore/After`,
  `kfRemoved`), `/private/tmp/claude-501/golden-audit/leniency-sample.txt`.
- What I found when sampling: the five notes-only cases I read in full
  (`q-defi-reflector-oracle`, `q-hot-fee-pool-burn-deflation`, `q-zk-proof-systems-stellar`,
  `q-asset-usdc-eurc-issuer`, `q-anchor-platform-what`) are all symmetric (they also tighten
  what is wrong), dated, and tied to evidence. The two removal-only cases have real root
  causes: a 2026-08-29 long-fact split created a keyFact no RPC method supports (sd-061),
  and a 2026-07-11 rebalance absorbed repo-discovery keyFacts into a case whose question
  does not ask for repos. I do not see laundering intent. I see a missing instrument.
- Recommended fix: before merge, run a bounded re-judge of saved rows for the 73 cases with
  net-new leniency and record the flip direction (pass→fail, fail→pass counts) in the
  ledger. If the owner defers it, write the deferral and the 73-case list in the ledger so
  the next round can measure drift.

### F2 — MAJOR (claim wording): `q-scf-sdf-marketing-grant` attributes hidden page data to the rendered page

- File: `eval/qa/corpus/**/q-scf-sdf-marketing-grant.json`; also
  `improvements/stellar-docs/sd-077-*.md` and the ledger line for the status move
  confirmed→mixed.
- Fields: `golden.answer`, `golden.notes`, `truth.status`.
- What is wrong: the new answer and notes say the dedicated page's Traction criterion
  "asks whether the project is live with traction or preparing to launch soon". The live
  HTML at `https://stellar.org/grants-and-funding/marketing-grants` contains that sentence
  exactly once, inside the embedded JSON page data
  (`"description":"Is the project live with traction or preparing to launch soon?"`). The
  rendered Traction card carries no description. A rendered-text fetch shows the card
  title only. A reader of the page cannot see the quoted criterion.
- Evidence: `curl -s https://stellar.org/grants-and-funding/marketing-grants | grep -o
  'live with traction[^"]*'` returns the JSON string once;
  `/private/tmp/claude-501/golden-audit/mg.html` holds the saved HTML; WebFetch rendered
  text shows the Traction card without a description. Visible support for the "live or
  launching soon" wording is the 2022-08-02 blog post plus the page data.
- Why it matters: the judge now rewards an answer that quotes text no user can see on the
  canonical page, and the status move to `mixed` and sd-077 rest on the same reading.
- Recommended fix: reword `golden.answer` and `golden.notes` to attribute the
  "live/launching soon" criterion to the page data and the 2022 blog, not to the rendered
  page. Keep `mixed` only if the ADR/skill accepts page data as a source class; otherwise
  revert to the prior reading and move the page-data observation into sd-077 as the
  defect ("criterion description is authored but not rendered").

### F3 — MINOR: `q-infra-horizon-vs-rpc` adds a new trigger on the ADR-0008 Horizon-lifecycle slot

- File: `eval/qa/corpus/**/q-infra-horizon-vs-rpc.json`; `improvements/stellar-docs/sd-072-*.md`.
- Fields: `golden.notes` (new "partial" cap), `truth.status` confirmed→mixed.
- What is wrong: nothing in substance. The new partial cap cites the Lab API Explorer card
  ("Horizon is considered deprecated.") against the APIs overview ("nearing end-of-life").
  I verified both live. The wording passes the ADR-0008 lint shape (provenance, expiry).
  The caution reuses the Horizon-lifecycle slot, one of the three slots ADR-0008 allows. The
  original caution on that slot (sd-042) had expired on main. This is a new trigger on an
  accepted slot, not a fourth slot. The owner should know the slot is live again.
- Evidence: `https://developers.stellar.org/docs/tools/lab/api-explorer` (live fetch shows
  "Horizon is considered deprecated."); `https://developers.stellar.org/docs/data/apis`
  (shows "nearing end-of-life"). Note: a cached Parallel fetch returned stale 2026-10-01
  text without the deprecation line; a live WebFetch confirmed it.
- Recommended fix: add one line to the ledger naming the slot reuse and the new expiry so
  the ADR-0008 count stays auditable. No case change needed.

### F4 — MINOR: xBull avoid item is an undated absolute negative on a scheduled case

- File: `eval/qa/corpus/**/q-eco-xbull-wallet*.json` (the xBull case in the Varial/wallet
  cluster).
- Field: `golden.avoid`: "Do NOT say xBull is currently listed on the iOS App Store or
  Google Play".
- What is wrong: the claim is true today. I confirmed it live (section 4). The case is
  `scheduled` with `reverifyBy` 2027-02-23, so the fact may flip before the next sweep. The
  skill asks volatile negatives to carry an as-of marker. The avoid text has none.
- Recommended fix: append "(as of 2026-11-02)" to the avoid item, or move the absolute to
  notes with the date and keep the avoid item as "Do NOT assert a current store listing
  without a live check".

### F5 — NIT: Varial release numbering disagrees between cases and sk-030

- Files: `q-eco-freighter-wallet.json`, `q-edge-ambig-best-wallet.json` (`golden.notes`);
  `improvements/skills/sk-030-*.md`.
- What is wrong: the case notes call extension 5.50.0 (published 2026-10-29) the first
  Varial release/announcement. sk-030 cites 5.51.0 (published 2026-10-28). GitHub shows
  5.51.0 was published 2026-10-28 and mentions the "Varial Home screen"; 5.50.0 was
  published 2026-10-29 and carries the rename announcement. Both are defensible; they
  should say the same thing. The ledger says 18 Varial cases; 20 files contain "Varial".
- Evidence: `https://api.github.com/repos/stellar/freighter/releases`;
  `https://stellar.org/blog/foundation-news/freighter-is-now-varial`.
- Recommended fix: pick one anchor (the blog post date plus "extension 5.50.0 carries the
  announcement; 5.51.0 shipped first with Varial UI") and use it in both places. Correct the
  ledger count or state why two files are excluded.

### F6 — NIT: two gospel cases removed keyFacts with no replacement

- Files: `q-aas-claim-received-claimable-balances.json`, `q-anchor-platform-what.json`.
- Field: `golden.keyFacts`.
- What is wrong: nothing. Both root causes name a real authoring defect (see F1). I list
  them so the owner can see that the removal-only set is two cases, both explained.
- Recommended fix: none. Include them in the F1 re-judge set.

---

## 3. Checked and found sound

### 3.1 Status moves

- `q-eco-pyusd-stellar-freshness` disputed→confirmed: OCC Conditional Approval 1358
  (2025-12-12) converts Paxos Trust Company to Paxos Trust Company, N.A. (charter 25379).
  paxos.com/pyusd names Paxos. The Stellar TOML at token-metadata.paxos.com still names the
  LLC; the case notes say so. Evidence re-walkable. Sound.
- `q-scf-sdf-marketing-grant` confirmed→mixed: see F2.
- `q-infra-horizon-vs-rpc` confirmed→mixed: see F3.

### 3.2 Freshness moves (17)

15 stable→scheduled and 2 live→scheduled (`q-protocol-23-whisk-caps`,
`q-sor-build-target-wasm32v1`). All carry `asOf` 2026-11-02 and a `reverifyBy`. The 8
`reverifyBy` dates before 2027 are all tied to a named event (SCF #46 Panel Review, Bell
vote 2026-11-23, Freighter/Varial store listing). Sound.

### 3.3 Partial caps

"partial" appears newly in notes only for `q-infra-horizon-vs-rpc` (F3). It was removed
from 18 cases, including `q-pc-account-merge-reclaim-reserve` (base-reserve cap: sd-013
is fixed upstream; the live page carries the fixed wording), `q-pc-protocol-upgrade-timing`,
`q-protocol-27-cap-0071`, and the `q-scf-*` set. The remaining ADR-0008 slots in use are
within the allowed three. Sound.

### 3.4 Sampled gospel cases (35), all sound unless listed above

Protocol and versions: `q-protocol-28-activation`, `q-protocol-29-activation`,
`q-protocol-30-bell-vote`, `q-protocol-23-whisk-caps`, `q-protocol-27-cap-0071`,
`q-cap-0081-status`, `q-slp-0006-limits`, `q-slp-0007-limits`, `q-pc-protocol-upgrade-timing`,
`q-sor-build-target-wasm32v1`, `q-sor-deploy-contract-deprecation`,
`q-sor-update-current-contract-wasm`, `q-ml-dsa-sentinel-anchor`.
Core and SDK: `q-core-validate-soroban-memo`, `q-sdk-soroban-sdk-deployer`.
Ecosystem and incidents: `q-eco-freighter-wallet`, `q-edge-ambig-best-wallet`,
`q-eco-xbull-wallet`, `q-eco-pyusd-stellar-freshness`, `q-asset-usdc-eurc-issuer`,
`q-defi-yieldblox-incident`, `q-defi-comet-incident`, `q-defi-reflector-oracle`,
`q-eco-defi-tvl-current`, `q-eco-dtcc-tokenization`, `q-hot-fee-pool-burn-deflation`,
`q-zk-proof-systems-stellar`, `q-confidential-tokens-version`.
SCF and funding: `q-scf-total-distributed`, `q-scf-funding-by-category`,
`q-scf-sdf-marketing-grant`, `q-scf-46-panel-review`.
Infra and anchors: `q-infra-horizon-vs-rpc`, `q-anchor-platform-what`,
`q-aas-claim-received-claimable-balances`, `q-pc-account-merge-reclaim-reserve`,
`q-edge-noinfo-sep-9999`, `q-ti-bindings-to-nextjs-integration`.

For each: `truth.verified.evidence` points at a URL or commit I could open; `rootCause`
names a defect (stale pin, upstream change, authoring flaw, cross-case contradiction), not a
score rationale; no disputed fact is pinned as a keyFact; volatile numbers carry `asOf`;
no sibling in the same register cluster contradicts the new text. No new avoid item
punishes a TRUE claim. No avoid item punishes the word "Freighter" (the Varial rename keeps
the old name acceptable with a date).

### 3.5 `eval/qa/judge.mjs`

Four `PROMPT_SHA256_FIXTURES` re-pins: `q-edge-ambig-best-wallet`, `q-edge-noinfo-sep-9999`,
`q-scf-total-distributed`, `q-ti-bindings-to-nextjs-integration`. All four have judge-facing
changes in my diff. No other fixture id has a judge-facing change. Sound.

### 3.6 `eval/qa/source-sentinels.json`

Nine `caseAsOf` bumps to 2026-11-02, no other field changed. Sound.

### 3.7 `eval/qa/consistency-register.json` and re-sweep

Clusters, `numericInvariants`, and `dateContingentTraps` changed. The P28 trap now points at
the Bell vote 2026-11-23 with `reSwept` 2026-11-02. `register-resweep.json` has 150 entries:
134 consistent, 16 note-edit, 0 conflicts. I checked the P28/P29/P30 cluster and the
wallet-name cluster by hand. Sound.

### 3.8 `.agents/TODO.md`

Closes Varial, Confidential Tokens, SCF RFP, and near-due items. Adds "Re-verify the
event-tied goldens after SCF #46 Panel Review and the Bell vote". Updates the sd-003
retirement item with three Algolia-era cases. Matches the diff. Sound.

### 3.9 `improvements/**`

New findings sls-095..106, ll-032..038, sd-060..075, sd-077, sk-030/031, cs-003..007. I read
sls-096, ll-033, sd-060, cs-003, sk-030, sls-095, sd-072, sd-077 in full and the headers of
the rest. Each names an upstream defect with a URL or quote. A grep over the improvements
diff for key-like strings, bearer tokens, and partner-tier Lumenloop fields found only a
documentation mention of the header name `Authorization: Bearer` in sk-025 (no value). No
partner-tier detail. sd-077 inherits F2 (page-data vs rendered text). Sound otherwise.

---

## 4. Live verification I did myself (every URL hit)

Facts confirmed (14):

1. PYUSD issuer conversion: `https://www.occ.gov/topics/charters-and-licensing/interpretations-and-actions/2025/ca1358.pdf`,
   `https://www.paxos.com/pyusd`, `https://token-metadata.paxos.com/.well-known/stellar.toml`.
2. Horizon lifecycle wording conflict: `https://developers.stellar.org/docs/tools/lab/api-explorer`,
   `https://developers.stellar.org/docs/data/apis`.
3. Marketing grants Traction criterion: `https://stellar.org/grants-and-funding`,
   `https://stellar.org/grants-and-funding/marketing-grants` (WebFetch and raw curl).
4. Protocol versions and activation: `https://developers.stellar.org/docs/networks/software-versions`,
   `https://horizon.stellar.org/ledgers/64458446`.
5. Bell / Protocol 30 vote: `https://stellar.org/blog/developers/bell-protocol-30-upgrade-guide`.
6. Varial rename: `https://stellar.org/blog/foundation-news/freighter-is-now-varial`,
   `https://api.github.com/repos/stellar/freighter/releases`.
7. validateSorobanMemo: `https://raw.githubusercontent.com/stellar/stellar-core/master/src/transactions/TransactionFrame.cpp`.
8. SLP-0007: `https://raw.githubusercontent.com/stellar/stellar-protocol/master/limits/slp-0007.md`.
9. SDF fee-pool paper: `https://cdn.sanity.io/files/e2r40yh6/production-i18n/1e067e43...pdf`
   (via Parallel fetch; WebFetch cannot read the binary), `https://stellar.org/xlm-utility`.
10. DTCC launch: `https://www.dtcc.com/press-releases/2026/dtcc-tokenization-service-goes-live`.
11. soroban-sdk deprecations: `https://docs.rs/soroban-sdk/latest/soroban_sdk/deploy/struct.DeployerWithAddress.html`,
    `https://docs.rs/soroban-sdk/latest/soroban_sdk/deploy/struct.Deployer.html`.
12. YieldBlox incident: `https://horizon.stellar.org/transactions/01c2ba75...` (14,000 USDC
    at 00:20:50Z), `https://api.fxtwitter.com/script3official/status/2029289721114051073`
    (post-mortem, 2026-03-04, "~$10.5M"). I first hit status `2035066332887023761`, which
    is the 2026-03-20 remediation tweet, and corrected.
13. xBull store absence: `https://itunes.apple.com/lookup?id=6705122563` (0 results),
    `https://itunes.apple.com/lookup?bundleId=app.xbull.mobile` and `app.xbull.wallet`
    (0 results), `https://itunes.apple.com/search?term=xBull&entity=software` (no xBull).
14. Web searches (Parallel): xBull store listing, Comet exploit amount (717,518.92 USDC),
    YieldBlox post-mortem, Varial rename, Confidential Tokens v0.8.0.

Not independently re-fetched (case evidence judged sufficient and recent): CAP-0081 TBD
status, SLP-0006 figures, Confidential Tokens v0.8.0 release page.

---

## 5. Score laundering check

- Removal-only cases: 2, both with authoring-defect root causes (F6).
- Net-new leniency: 73 gospel cases; 15 notes-only; 5 read in full, all symmetric and dated.
- Status moves toward lenient: 2 (`mixed`), both evidence-backed (F2 wording caveat, F3).
- Re-judge of saved rows: not done (F1). This is the only guard the round skipped.

Conclusion: I found no case where a golden was moved to rescue a score. The missing
re-judge means the round cannot prove that claim with numbers. F1 asks for that proof.

---

## 6. Summary table

| ID | Severity | Path | Field | Action |
|----|----------|------|-------|--------|
| F1 | major | `.agents/rounds/2026-11-02-golden-audit.md`, 73 gospel cases | `golden.notes` | Run bounded re-judge; record flip direction |
| F2 | major | `q-scf-sdf-marketing-grant.json`, sd-077 | `golden.answer`, `golden.notes`, `truth.status` | Attribute criterion to page data + 2022 blog |
| F3 | minor | `q-infra-horizon-vs-rpc.json`, sd-072 | `golden.notes` partial cap | Ledger line naming slot reuse and expiry |
| F4 | minor | xBull wallet case | `golden.avoid` | Date the negative or soften to a live-check rule |
| F5 | nit | `q-eco-freighter-wallet.json`, `q-edge-ambig-best-wallet.json`, sk-030 | `golden.notes` | Align 5.50.0 vs 5.51.0; fix Varial count |
| F6 | nit | two removal-only cases | `golden.keyFacts` | None; include in F1 set |
