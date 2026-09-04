# Golden follow-up review — 2026-09-04 (Fable 5.1 xhigh)

Lane: bounded golden review. Worktree `/private/tmp/stellar-raven-tm-golden-followup`, branch
`codex/tm-golden-followup`, base `80aaf52`. Inputs: `post-candidate-measurement-fable.md`, the three
candidate row reviews (Sol, Terra, Fable), `AGENTS.md`, and `.agents/skills/golden-truth/SKILL.md`.

Rules applied: source classes A–F, class-level corroboration, verdict enum, "disputed is never
pinned", canonical-page caution grading with the ADR-0008 boundary of three cases, and `truth.verified`
moves with every judge-facing edit. This lane made no paid model calls and started no QA arm.

Evidence label: every live check below is dated 2026-09-04 and is **post-drift current truth**. It is
not candidate-window evidence. The candidate artifact is
`2026-09-04T05-40-51-variantA.json` in the runner worktree.

## Verdict

- One deterministic truth correction: `q-raph-lobstr-legitimacy`.
- Fourteen cases unchanged. Each has a named human-judgment or research blocker below.
- All golden checks and baseline gates pass. Commit is scoped to five files.

## Corroboration matrix

| Case | Status before | Claim re-checked | Live evidence 2026-09-04 (class) | Result | Action |
| --- | --- | --- | --- | --- | --- |
| q-scf-rfp-tooling | confirmed; asOf 2026-09-03; reverifyBy 2026-11-13 | Two open briefs, one synthetic #46 row, RFP-track scope | A: SCF handbook says "The RFP Track funds developer tooling…" and lists LayerZero DVN. C: Scout returned two open briefs (categories Infrastructure and Payments) plus one synthetic `scf-round-46` row; round 46 submissions run through 2026-11-08. | Roster and dates hold. The "Yes" reading is a judgment call. | Unchanged. Blocker B1. |
| q-sor-persistent-unbounded-collection-cap | confirmed; stable | One entry per key; network-controlled cap | A: storage-strategies page says "The entire serialized contract-data ledger entry is capped at 64 KiB" (12 mentions). A: resource-limits page renders client-side; no figure extracted. C: live network setting not queried. | Golden truth holds. Avoid 2 versus an attributed 64 KiB quote is a rubric choice. | Unchanged. Blocker B2. |
| q-protocol-ledger-close-time | confirmed; stable | 5–7 s observed versus 3–5 s docs | A: validators page still says 3–5 s. A: stellar-stack page says 5–7 s. `sd-047` is reported-upstream (issue #2805, PR #2806). C: no exposed operation returns ledger close timestamps. | The filed docs conflict persists. Key fact 1 needs a sample the surface cannot produce. | Unchanged. Blockers B3, B4. |
| q-ti-historical-pointintime-balances | confirmed; asOf 2026-07-11; reverifyBy 2027-01-07 | Avoid 3: no invented historical USD prices from ledger data | No live change needed. The candidate used trade-implied prices from Hubble trade rows. | Whether trade-implied prices count as "invented" is a methodology choice. | Unchanged. Blocker B5. |
| q-soroban-x402-auth-entry-signing | disputed; asOf 2026-08-11; reverifyBy 2026-11-19 | Official roster versus implementation evidence | B: Stellar Wallets Kit `albedo.module.ts` still throws "Albedo does not support the signAuthEntry function". A: developers.stellar.org x402 page (last updated 2026-09-02) still lists the roster and keeps Coinbase Testnet-only. A: Freighter docs expose `signAuthEntry` (extension) and `stellar_signAuthEntry` (mobile). | The dispute persists on both sides. Not past due. | Unchanged. |
| q-tool-cctp-stellar-integration | disputed; asOf 2026-08-11; reverifyBy 2026-11-26 | Stellar-source Fast eligibility; handler names | A: Circle supported-chains row reads "Stellar ✅ N/A ❌ ❌". A: finality page reads "Stellar 1 ~5 seconds". A: fees page has no Stellar row. A: Stellar→Arc quickstart says "Fast Transfer (1000 or less) or a Standard Transfer (2000 or more)" and passes 1000 as the "Fast Transfer finality threshold". A versus B: Circle reference spells `handle_receive_*`; GitHub master spells `handle_recv_*`. | Both disputes persist exactly as encoded. Not past due. | Unchanged. |
| q-pay-anchor-msb-licensing | confirmed; stable | Entity/activity/custody/route/jurisdiction framing | No new live check. The candidate transcripts show the docs' simple "anchor is the regulated party" framing (post-candidate report, Cluster 6). | Golden truth holds. A caution would be a fourth ADR-0008 case. | Unchanged. Blocker B6. |
| q-pay-travel-rule-aid-flows | confirmed; stable | Duty allocation by intermediary and route | No new live check. Same Cluster 6 shape. | Golden truth holds. Same ADR-0008 gate. | Unchanged. Blocker B6. |
| q-comp-finclusive-caas | mixed; asOf 2026-08-30 | FinClusive claims; partner row | C: the candidate transcript holds a `scout.getPartners` row with `url: https://stellarlight.xyz/partners/finclusive` and `generatedAt 2026-09-03T19:27:48Z`. The "fabricated directory" label is a judge artifact. | Golden truth holds. The blanket-obligation part of the verdict stands. | Unchanged. Blockers B6, B7. |
| q-crp-custodial-vs-noncustodial-wallets | confirmed; asOf 2026-07-11; live | Custody definition; SEP-31 choice | No new live check. Partial row shares the Cluster 6 shape. | Golden truth holds. | Unchanged. Blocker B6. |
| q-crp-become-an-anchor-licensing | unverifiable; asOf 2026-07-10; live | Legal perimeter method | No new live check. Partial row shares the Cluster 6 shape. Status stays unverifiable by design. | Golden truth holds. | Unchanged. Blocker B6. |
| q-ti-stellar-lab-usage-and-new-ui | disputed; asOf 2026-09-03; reverifyBy 2026-10-01 | Saved Keypairs conflict; "top right" claim | A: Lab docs page says keys are "obfuscated, but not encrypted" and pre-September 2025 keys "may remain in plain text". B: `stellar/laboratory` serializes `SavedKeypair` through `JSON.stringify`; code search "obfuscate" returns 0 hits, "SavedKeypair" 9 files. `sd-049` is still `proposed`. Transcript: the Quickstart docs page reads "in the top right corner". | The conflict persists. The "top right" penalty is a judge artifact. | Unchanged. Blockers B8, B9. |
| q-edge-metamask-evm-mental-model | confirmed; stable | Dated third-party Snap claim | D: npm `stellar-snap` 1.0.9 published 2025-07-08, not deprecated. The Snap is not on any exposed surface. | The dated claim holds. Tag `stable` sits beside a dated claim. | Unchanged. Blocker B10. |
| q-defi-aquarius-what-is | confirmed; stable | ICE family roles | A: Aquarius docs list ICE, upvoteICE, and governICE as non-transferable and mark downvoteICE deprecated in June 2026. No exposed surface hosts these docs. | Golden matches operator docs. Coverage diagnostic only. | Unchanged. Blocker B11. |
| q-raph-lobstr-legitimacy | confirmed; asOf 2026-08-31; reverifyBy 2026-11-30 | Where the key material lives | A: article 151000169419 says "We store the encrypted version of the Recovery phrase/Secret key on our server" and "The keys themselves can only be decrypted and accessed by users on-device". A: 151000001271 keeps the "before September 1, 2020" exception. A: 151000001273 keeps the migration deadline of July 10, 2026. A: 151000001289 says "We (the LOBSTR team) do not have access to users' Recovery phrases, Secret keys, Recovery codes, or Account passwords". | The answer omitted the server copy that its own corroboration row verified on 2026-08-31. | **Edited.** |

## Edit: q-raph-lobstr-legitimacy

Why this is deterministic. The case's own corroboration row (verdict confirmed-as-of, 2026-08-31) records
that LOBSTR stores an encrypted copy of the key material on its server. The answer said only "stored
locally/on-device". The 2026-08-31 corroboration row already verified the server copy, but the answer
omitted it. The parent answer was era-bounded and did not say `only`. The answer now states both
halves of the owner documentation. No new fact entered the case;
the metadata already carried it.

Before:

> Current LOBSTR documentation says keys for current or migrated accounts are encrypted with
> user-password participation and stored locally/on-device, while accounts created before 2020-09-01
> that were never migrated are a documented exception.

After:

> Current LOBSTR documentation says keys for current or migrated accounts are generated and encrypted
> on-device with user-password participation, are stored locally on-device for decryption and signing,
> and also exist as an encrypted copy on LOBSTR servers that LOBSTR says it cannot decrypt; accounts
> created before 2020-09-01 that were never migrated are a documented exception.

Metadata changes in the same diff:

- `truth.sources`: added the class A security article (151000169419).
- `truth.corroboration`: the server-copy row gained a 2026-09-04 re-observation with quotes.
- `truth.verified.date` → 2026-09-04; `truth.verified.by` names this lane and this report.
- `truth.verified.evidence`: one gospel-change line, three live re-check lines, one sibling sweep, one
  re-judge note.
- `truth.verified.rootCause`: appended an eval-authoring entry that names the omission.
- `truth.asOf` and `truth.reverifyBy` are unchanged. The dated activity observation in the answer is
  unchanged. `keyFacts`, `avoid`, `notes`, and tags are unchanged.

Sibling sweep 2026-09-04: grep `LOBSTR|on-device|server-side|Recovery Phrase` over
`eval/qa/corpus/battery`. Only this case states a LOBSTR key-storage location. `q-eco-lobstr-wallet`
says non-custodial only. No contradiction.

Re-judge: not run. This lane makes no paid calls. The candidate row failed on an era-independent
local-only claim and on the missing pre-2020 exception. The corrected answer contradicts that claim
more directly. The expected verdict direction is unchanged, so this edit does not launder a score.

## Unchanged cases and blockers

- **B1 q-scf-rfp-tooling (human judgment).** The golden answers "Yes" and names two briefs. The
  handbook defines the RFP Track as funding developer tooling. Scout labels the two live briefs
  Infrastructure and Payments. The owner must decide whether "developer tooling or indexing
  infrastructure" is met by the RFP-track definition or by the Scout category of each brief. Both
  readings are defensible, so this lane did not change the answer.
- **B2 q-sor-persistent-unbounded-collection-cap (rubric choice plus research).** Avoid 2 says do not
  freeze a universal byte limit. The docs page states 64 KiB in twelve places. The owner must decide
  whether an attributed, dated docs figure trips avoid 2. Research blocker: the live network setting
  for the contract-data entry size was not queried, and the resource-limits page renders client-side.
- **B3 q-protocol-ledger-close-time (rubric choice).** Key fact 1 requires a dated multi-ledger
  sample. No exposed operation returns ledger close timestamps. The owner must decide whether the
  key fact keeps that requirement or accepts an attributed docs range with a conflict disclosure.
- **B4 q-protocol-ledger-close-time (ADR-0008 decision).** Lint warns that the `sd-047` root cause
  has no symmetric caution in `golden.notes`. Adding one would be a fourth canonical-page caution
  case. The open TODO "Decide the ledger-close-time documentation conflict (D1)" owns this.
- **B5 q-ti-historical-pointintime-balances (methodology choice).** The owner must decide whether
  trade-implied USD prices derived from Hubble trade rows count as "invented from ledger data" under
  avoid 3, or as a documented external-price join.
- **B6 compliance cluster, five cases (ADR-0008 decision).** The docs are the exposed surface and
  state the simple "anchor is the regulated party" framing. The goldens require scoping by entity,
  activity, custody, route, and jurisdiction. A caution per case would exceed the three-case boundary.
  The owner must choose: expand ADR-0008 with independent review, or leave the goldens strict and
  route the gap to a coverage diagnostic. The golden truth itself is not in question.
- **B7 q-comp-finclusive-caas (re-judge).** The "fabricated directory" label is refuted by the
  transcript. A paid re-judge is needed to separate the artifact from the blanket-obligation finding.
- **B8 q-ti-stellar-lab-usage-and-new-ui (re-judge).** The "top right" penalty quotes the docs page
  in the transcript. A paid re-judge is needed.
- **B9 q-ti-stellar-lab-usage-and-new-ui (upstream).** `sd-049` is still `proposed`. The caution in
  `golden.notes` stays until source, UI, and documentation agree.
- **B10 q-edge-metamask-evm-mental-model (classification decision).** The answer carries a dated
  Snap claim while `tags.freshness` is `stable` and the case has no `truth.asOf` or
  `truth.reverifyBy`. Moving to `scheduled` is a classification decision with a re-verify cadence,
  not a truth correction.
- **B11 q-defi-aquarius-what-is (coverage decision).** The golden is true against operator docs.
  Key fact 3 asks for detail no exposed surface hosts. Whether the key fact should bind on the
  tested surface is a rubric choice.

## Consistency records and generated corpus

- Register membership: `q-raph-lobstr-legitimacy` and the five compliance cases are not in
  `eval/qa/consistency-register.json`. The other nine cases sit in clusters (for example
  `q-defi-aquarius-what-is` in five, `q-tool-cctp-stellar-integration` in two plus one numeric
  invariant and one date-contingent trap). None of those files changed.
- `npm run eval:qa:register` → "up to date; 0 reopened". The register file is unchanged.
- `npm run eval:qa:compile` rewrote `eval/qa/cases.json` (500 cases, sha256 `3d736cd1…`),
  `eval/qa/sample.json` (corpus sha only), and `eval/qa/lifecycle-registry.json` (one
  `caseContentSha256` re-stamp for the edited case).

## Checks

| Check | Command | Result |
| --- | --- | --- |
| Compile | `npm run eval:qa:compile` | pass |
| Register | `npm run eval:qa:register` | pass, 0 reopened |
| Lint | `npm run eval:qa:lint -- --since 80aaf52 --stale` | 0 errors, 62 warnings (all pre-existing; none name the edited case) |
| Plan regrade | `npm run eval:plan -- <variantA results>` | pass; 464/500 requiredCovered |
| Typecheck | `npm run typecheck` | pass |
| Unit tests | `npm test` | 103 files, 1771 tests, all pass |
| Build | `npm run build` | pass (dry-run) |
| Secrets | `npm run secrets:scan -- --tree` | clean, gitleaks no leaks |

## Review reconciliation

Review `golden-followup-review-sol.md` (commit `30ab2b6`, Codex Sol high) returned CHANGES-REQUIRED
with one blocking finding, F1. The verification evidence and this report had said the parent answer
read as the era-independent local-only claim that avoid item 4 forbids. That was wrong. The parent
answer was era-bounded and did not say `only`. The defect was only the omitted server copy. The
gospel-change evidence line in `truth.verified.evidence` and the Edit section above now carry the
reviewer's exact sentence. The `eval-authoring` root cause is unchanged. The generated corpus files
were rebuilt by script after the repair. No other golden decision changed.

## Side effects and risks

- `npm run eval:plan` wrote `2026-09-04T05-40-51-variantA.plan.json` next to the results file in the
  runner worktree. That path is gitignored there.
- Key fact 3 still says "local/on-device storage". A candidate that names only the server copy could
  still lose that key fact. Rewording the key fact is a rubric choice left to the owner.
- No paid re-judge ran. The verdict flip risk for the edited case is nil in the correct direction;
  see the re-judge note above.
- The worktree carries a placeholder `.dev.vars` and a generated `env.d.ts`. Both are gitignored and
  not committed.
