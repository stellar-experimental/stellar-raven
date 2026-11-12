# Independent golden review: cap reconciliation for sls-024 and sls-029 (2026-11-12)

**Verdict: approve with changes.** The cap decisions are right in all six cases. Three changes are
required before merge (F1 breaks a CI gate; F2 and F3 leave dead pointers in committed truth
metadata). Two judge-facing wording changes are recommended (F4, F5). All 15 reopened register
entries are consistent; the drafted items are in `tmp/caps-register-review.json`.

Reviewer: Claude Fable (`claude-fable-5-2`), a different model and session from the author
(Codex gpt-6.1-sol, lane `caps-1112`). I re-derived each trigger from live sources before opening
`tmp/caps-report.md` or the three matrices. No tracked file was edited; only `tmp/caps-review.md`
and `tmp/caps-register-review.json` were written.

## Findings

### F1. Required: the Fluxity edit breaks `npm run eval:selftest`

`eval/qa/corpus/live/live-cases.json` is the frozen `live-data-canonical-v3` contract. Its own
`$comment` says "Any case-content change requires an explicit contract-version bump, provenance
note, and digest update." The edit changed case content without any of the three.

- Pinned digest (file `contractProvenance.caseContentDigest` and `eval/self-test.mjs:540`):
  `2a9c98d1…c23340`. Working-tree digest: `89ed56e8…b29617`.
- `npm run eval:selftest` exits 1: `FAIL live-data-canonical-v3 pins carried-v2 identity, ordered
  membership, and full case content`. CI runs this command. The author's gate table did not.

Two ways to fix it:

1. **Revert the Fluxity case to HEAD (recommended).** The old note is not a partial cap, the
   `cap-finding` lane does not read it, and its grading rule is still true: it is state-conditional
   and already covers populated qualifiers. Only the label "sls-024 discriminator" is stale. The
   author brief allowed a notes change "only if the sls-024 discriminator wording becomes false";
   it has not. Record the 2026-11-12 Fluxity observation in the round ledger and queue the note
   rewording in `.agents/TODO.md` for the next deliberate live-contract revision.
2. Keep the edit and do a real contract bump: new contract name, provenance note, digest in the
   file and in `eval/self-test.mjs`, and every `live-data-canonical-v3` reference. That starts a new
   denominator against `eval/qa/reviewed/2026-07-12-live-v3-baseline.md`, which is a large cost for
   a notes-only change.

If option 2 is chosen, the new note text itself is sound. Two things would then also need fixing in
that case: `truth.asOf` is still 2026-07-12 and `truth.reverifyBy` is 2026-10-01, already past.

### F2. Required: committed evidence points at gitignored `tmp/` files and a ledger that does not exist

- Every changed case cites `tmp/caps-lifecycle-matrix.md`, `tmp/caps-oracle-matrix.md`, or
  `tmp/caps-remittance-matrix.md` in `truth.verified.evidence`. `/tmp/` is gitignored
  (`.gitignore:43`), so these pointers are dead on commit. This is the defect class already queued
  in `.agents/TODO.md` ("Replace expired temporary evidence in golden truth metadata"), which the
  remittance case lists in its own `rootCause`.
- Every `truth.verified.by` names `.agents/rounds/2026-11-12-truth-maintenance.md`. That file is not
  in the tree.

Fix: create the ledger in the same change, move the three matrices under
`.agents/rounds/2026-11-12-truth-maintenance/`, repoint the evidence strings, then rerun
`npm run eval:qa:compile` and `npm run eval:qa:register` (member hashes cover the truth block).

### F3. Required with same-change retirement: use the receipt form in `rootCause` (this also settles the four warnings)

The new `rootCause` entries name `improvements/stellar-light-scout/sls-024-…md` and
`sls-029-…md`. The retirement deletes those files in the same change, so the paths dangle. Three
dangling `rootCause` paths already exist in the corpus (sls-096, sls-097, sd-082); this adds more.

The repo precedent for an ended cap is the receipt form, for example
`"improvements/resolved.json entry sd-078: live Docs correction removes the source conflict that
justified the cap."` (`q-sor-p23-auto-restore-extendto`; also sk-001 in `q-soroban-deploy-cli` and
sd-008 in `q-protocol-27-cap-0071`).

**On the four new `symmetric-caution` warnings:** do not add a sentence to silence them.

- The lint fires because `rootCause` names an `improvements/` path and the notes have no
  lint-canonical caution. That form needs "canonical/official/upstream source", "not a wrong claim",
  and a partial grade (`hasSymmetricCaution`, `eval/qa/lint-corpus.mjs:496`).
- Any sentence in that form with no active finding id is a `cap-finding` **error**
  (`lint-corpus.mjs:587-598`). A finding-independent sentence that satisfies the warning is
  therefore impossible by construction. The author's reading is correct.
- The lint exempts `improvements/resolved.json` pointers. Converting the sls-024 and sls-029 path
  entries in the five battery cases to the receipt form clears all four warnings. I simulated this
  in memory with both findings absent: `cap-finding` 0, `symmetric-caution` 18 → 14.

The warnings are acceptable only if the caps change lands before the receipts exist. The brief says
it is one change, so switch to the receipt form. Convert the pre-existing sls-024 entries in
`q-pc-l2-payment-channels-starlight` and `q-hist-remittance-corridors` too; the Starlight warning
comes from that older entry.

### F4. Recommended (judge-facing): reword the OrbitCDP sentence as a no-penalty caution

New sentence in `q-defi-named-newer-protocols`: "Report Scout's dated Inactive label and the
operator's Live on Stellar banner as source-relative claims; neither surface alone establishes
current deployment or definitive shutdown."

The imperative "Report … and …" reads as a new requirement that both surfaces appear. No key fact
requires either. The case is `truth.status: disputed`, and the skill (Step 5) wants an explicit
"do not penalize either" caution for disputed facts. The removed cap at least said the Scout quote
was not wrong; the replacement no longer says so. Suggested text:

> Sources disagree on OrbitCDP's lifecycle: do not penalize an answer that attributes Scout's dated
> Inactive label, the operator's Live on Stellar banner, or both, and do not require both. Neither
> surface alone establishes current deployment or definitive shutdown.

I checked this text against the lint in memory: it is not parsed as a cap.

### F5. Optional (judge-facing): bind the wallets avoid item to the inference, not the quote

With the cap gone, `q-eco-stellar-wallets-list` grades the claim only through "Do NOT treat
keyword/semantic matches, directory Live, or app code as proof of exact Wallet typing or current
availability." That avoid still punishes a false inference: live Scout bases include
`site-liveness`, `repo-activity`, and `source-inherited`, and xBull is `Live` while its iOS and
Android rows are `unavailable`. So no true claim is punished, and removing the cap is right.

Scout now serves dated, basis-qualified labels and separate per-platform `availability` records. An
answer that reports those accurately should not trip the avoid. One line would remove the doubt:

> Reporting a wallet's dated Scout lifecycle label, or Scout's separate per-platform availability
> records, as attributed observations does not fire the availability avoid; it fires only when a
> Live label is itself offered as proof of current app availability.

Also checked in memory: not parsed as a cap.

### F6. Minor: two evidence strings a stranger cannot re-walk

- `q-eco-stellar-wallets-list` evidence[10] says "The known App Store and Google Play URLs returned
  404" without the URLs. Add `https://apps.apple.com/us/app/xbull-wallet/id6705122563` and
  `https://play.google.com/store/apps/details?id=app.xbull.wallet`. Scout's own lifecycle note
  names a different Play id, `app.xbull.mobile`; it also returns 404 (my check, 15:15:35Z).
- `q-defi-reflector-oracle` evidence[23] cites a content-hashed bundle,
  `reflector.network/docs.40142536….js`. It resolves today and will break at the next site deploy.
  The pinned README in evidence[22] carries the same Pulse/Beam claim; add
  `https://reflector.network/docs` as the stable entry point.

### F7. Residual for the owner (not blocking): Scout's Coins.ph partner prose

I confirm the author's residual independently. `GET https://stellarlight.xyz/api/partners/anchor-coins-ph`
(2026-11-12T15:20:09Z) still says, in the present tense, "providing PHP fiat on/off-ramps and
remittances on Stellar", with `freshness.status: aging` and `isCurrent: false`. The project row is
`Live` on a `site-liveness` basis dated 2026-08-27 with `deployment.network: unknown`. The golden
calls Coins.ph "a historical Stellar route".

This is partner-profile prose, not a lifecycle label, so it is outside sls-024 and the cap's Scout
half is correctly removed. No active finding covers it (no match for Coins.ph in `improvements/`
outside `resolved.json`). I agree with not inventing a cap. The parent should run the
`improvements-pipeline` dedupe and either file a finding or record a plain-rule decision in the
ledger. The avoid item is universal ("every historic/announced capability"), so it does not trap a
single attributed Coins.ph statement.

### F8. Observation, out of scope

`q-eco-defi-market-map` notes say "Band + RedStone live on mainnet; DIA/Lightecho/Orally too".
`tmp/review-retire.md` (sls-029 section) reports that Scout now shows DIA's only address as an
absent testnet contract and Lightecho's mainnet feed as stale. I did not re-fetch those two rows.
This does not affect cluster-019's claim (Reflector is not the sole provider), and this diff does
not touch that case. Worth a check in the next truth pass.

## What I verified

### 1. Triggers re-derived from live sources (all times UTC, 2026-11-12)

| Case | Scout (class C) | Independent class | Result |
| --- | --- | --- | --- |
| OrbitCDP | `q=OrbitCDP` 15:14:41Z: `Inactive`, `human-verified`, `statusAsOf` 2026-09-05, source `orbitcdp.finance`, deployment unknown | A: `https://orbitcdp.finance/` 15:15:30Z: "Live on Stellar" banner, every stat an em dash | Label now carries basis, date, and source and matches the golden's description of the conflict. Cap trigger gone. The real-world dispute remains and stays unpinned. |
| xBull / wallets | `q=xBull` 15:14:42Z: `Live`, `human-verified`, 2026-08-29; note scopes Live to web + Chrome extension; `availability` rows mark iOS and Android `unavailable` | A: Chrome Web Store listing 15:15:31Z (xBull Wallet, Creit Technologies LLP, 1.40.0). iTunes lookup id 6705122563: `resultCount 0`. Play `app.xbull.wallet` and `app.xbull.mobile`: 404. `xbull.app`: TLS handshake failed, inconclusive | Label is qualified and availability is a separate field. Cap trigger gone. |
| Centaurus / Starlight | `q=Centaurus` 15:14:43Z: `Inactive`, `human-verified`, 2026-07-13, old Live label retracted in the note | B: GitHub API `centaurus-project/centaurus` `pushed_at` 2022-01-05, not archived; `stellar-deprecated/starlight` `archived: true`. A: Docs glossary 15:20:09Z: "no longer maintained … archived since April 2024". sd-015 is in `improvements/resolved.json` (2026-07-27) | Neither source carries the old wording. Both cap branches are moot. |
| MoneyGram / remittance | `q=MoneyGram` 15:14:44Z: `Live`, `human-verified`, 2026-09-02; description says "170+ cash-out countries" | A: `stellar.org/products-and-tools/moneygram` 15:15:38Z: "170+ Countries with USDC cash-out". Lumenloop runtime `get_project(moneygram)` 15:20:32Z and its source YAML 15:16:02Z: "operating in over 200 countries and territories". `stellar-ecosystem-db#3` still open | Scout no longer carries 200+. Lumenloop does. **Keeping only ll-008 is correct.** |
| Reflector | `q=Reflector` 15:14:46Z: 12 product records (4 mainnet, 8 testnet), `official-address` tier, observations checked 03:32:05Z; three mainnet Pulse feeds `observed-updating`, mainnet Beam `observed-stale` (last update 2026-10-22) | Operator config `orchestrator.reflector.network/config` 15:15:35Z: the same four mainnet contract ids. B: pinned `reflector-contract` README: Pulse free, Beam prepaid | Product and network evidence now exists. Cap trigger gone. |
| Fluxity | `q=Fluxity` 15:14:47Z: `Live`, `repo-activity`, 2026-08-14, source is the landing-page repo, `supportedNetworks ["stellar"]` on an `scf-award` basis, deployment unknown | B: GitHub API `luanlabs/fluxity.finance` `pushed_at` 2026-08-14. A: `https://fluxity.finance/` 15:15:36Z still says "Join our waitlist" | Qualifiers populated; no deployment proof. The existing state-conditional golden already handles this (see F1). |

The author's matrices, read afterwards, agree with these results. I spot-checked six of the
author's cited URLs (Chrome Web Store version, Reflector README, Reflector docs bundle, MoneyGram
integrate page, xBull README, App Store 404); all reproduce.

### 2. Judge-facing sentences

- `question`, `golden.answer`, `keyFacts`, `avoid`, and `tags` are unchanged in all six cases
  (parsed-JSON diff against HEAD). Only `golden.notes` and `truth.verified` changed.
- No judge-facing text in the battery or the live suites names sls-024 or sls-029 any more.
- No guidance that still holds was lost, with the F4 caveat. The deleted Starlight line "sd-015
  captures glossary lifecycle ambiguity; sls-024 captures project-status conflicts" was bookkeeping,
  not grading guidance.
- No avoid item punishes a true claim (F5 covers the one place a judge could over-fire).
- No disputed fact is pinned. OrbitCDP stays `disputed` and source-relative.
- The remittance cap names only Lumenloop and ll-008 (`reported-upstream`), and passes `cap-finding`.

### 3. Lint warnings

See F3.

### 4. `truth.verified`

| Field | Result |
| --- | --- |
| `date` | 2026-11-12 on all six. |
| `by` | Names the lane and the round ledger on all six. The ledger file is missing (F2). |
| `evidence` | URLs with UTC times and a recorded sibling sweep on all six. Exceptions: F2 (`tmp/` pointers), F6 (two weak strings). |
| `rootCause` | `freshness-drift` and the finding path present on all six. Remittance and Starlight already carried the sls-024 path; the report's "added" wording is loose there but the content is right. Form: F3. |

Earlier evidence entries were kept, as the author brief required. The skill says the case file
carries the latest event only, so the arrays are long (up to 31 entries). Not a finding against the
author.

### 5. Gates

| Check | Result |
| --- | --- |
| `npm run eval:qa:lint -- --since origin/main --stale --enforce-floors` | exit 0, 0 errors, 85 warnings. Matches the report. |
| Retirement rehearsal | Confirmed in memory rather than by moving tracked files: with sls-024 and sls-029 absent, `cap-finding` reports 0. Control: the HEAD notes under the same condition give 4 `cap-finding` errors, so the lane does bite. |
| `npm run eval:qa:register -- --check` | exit 0, up to date. |
| `cases.json` sync | The five changed ids match their case files. `sample.json` changes only its corpus hash; `lifecycle-registry.json` only five content hashes. |
| `git diff --check` | clean. |
| `npm run eval:selftest` | **exit 1** (F1). |

Not run: `npm run typecheck`, `npm test`, `npm run build`, `eval:routing --gate`. No code changed.

### 6. Register re-sweep

I read the judge-facing fields of all 48 distinct member cases across the 15 reopened entries. All
15 are consistent. The only judge-facing changes are the removed or narrowed cap sentences in five
members; none touches a fact any cluster pins. Items are in `tmp/caps-register-review.json` in the
requested shape.

Apply them after the final content is stamped. F2 and F3 change truth metadata only. F4 and F5
change one notes sentence each without changing meaning, and my verdicts for clusters 006, 010, 012,
015, 022, 028, 029, and 034 hold for the suggested wording. Any other judge-facing edit to a member
needs a fresh look at its clusters.

One pre-existing asymmetry in cluster-002, not caused by this change: the Lumenloop 200+ quote is
capped at partial in `q-hist-remittance-corridors`, while `q-crp-anchors-by-corridor` has no cap and
punishes attributing 200+ to the Stellar off-ramp. They are compatible, because the cap covers the
accurate corporate-footprint quote and not its attribution to the off-ramp. The entry's "grader-caution
candidate" note still fits.
