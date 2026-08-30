# Final adversarial review — Grok 4.6 — 2026-08-30

Diff under review: `git diff b53f62d -- eval/qa/corpus/battery eval/qa/consistency-register.json`\
Parsed: 54 case files (3 judge-facing, 51 truth-only) + register. No repository files were edited.

**Verdict: APPROVE-WITH-FIXES**

The dead-provenance replacements, the Protocol 27 and Freighter gospel refreshes, the four source-conflict encodings, the ledger-close-time disposition, and cluster-136 are sound. One judge-facing sentence overstates “exact type Wallet” as 64, one Live re-check line does not match its URL, and six `reSwept` reasons paste durable-rule jargon that those clusters do not own. Fix those three items. Do not expand the rest of the gospel.

---

## Check 1 — Judge-facing fields

Only these three files change `golden` (question / tags / surface unchanged):

| Case | New sentence true? | Durable rule kept? |
|---|---|---|
| `q-eco-stellar-wallets-list` | **No — see finding 1.** Keyword total 183, first rows Lobstr/xBull/Freighter, and “keyword ≠ type filter” are true. “64 unique records carried the exact `types` value Wallet” is not the sole-type count. | Date-the-roster / don’t freeze a count: kept. Exact-type vs keyword: the *rule* is kept, the *number* is the membership unique-id count (64), not `types == ["Wallet"]` (31). |
| `q-pc-protocol-27-zipper` | **Yes.** software-versions still says “Protocol 27 (Mainnet, July 8, 2026)” / Zipper. Horizon root today: `current_protocol_version` 27, `core_supported_protocol_version` 28. Ledger 63386819 closed 2026-07-08T17:00:10Z at protocol 27. CAP-0071-02 still says deprecation “in the future protocol (28 or later)”. Protocol 28 is not live. | Vote-vs-live, “or later”, dated Horizon check: kept. |
| `q-ti-freighter-localhost-not-detected` | **Yes.** Master manifest still `matches: ["<all_urls>"]`, `run_at: "document_start"`, no `all_frames`. Latest release tag `5.46.0` published 2026-08-26T20:27:49Z. Frontend guide still: “Freighter wallet requires a secure connection (HTTPS) to interact with your dapp.” | Manifest vs HTTPS-docs disagreement, don’t treat either as the only detection fix: kept. `reverifyBy` 2026-11-20 is a stagger, not a gospel change. |

No other changed case file altered `question`, `golden.*`, `tags`, or `surface`.

---

## Check 2 — Temporary-path replacements and Live re-check lines

Ledger rule vs this diff:

- Fable `conversions-copy-review.md` → exact replacement string: **24/24**.
- `/tmp/raven-qadeep/gt2/review-bN-partM.md` → `program-log.md § Session 2 › Batch N › Part M review (gt2-grok-rev)`: **25/25**.
- `/tmp/raven-qadeep/review-judge.md` → `research/qa-deep-dive-2026-08-25/review-judge.md`: **1/1**.
- `grep conversions-copy-review|/tmp/raven-qadeep` over the 54 files: **0 leftovers**.
- Every touched case has at least one `Live re-check 2026-08-30` line (243 such lines).

### Spot-check (curl, 2026-08-30; 25 URLs)

All HTTP 200 unless noted. Quotes are what the live body supported.

| URL | Status | Supports the keyFact it stands for? |
|---|---|---|
| https://developers.stellar.org/docs/validators | 200 | “nodes reach consensus, apply a transaction set, and update the ledger **every 3-5 seconds**.” |
| https://developers.stellar.org/docs/learn/fundamentals/stellar-stack | 200 | “update the ledger **every 5-7 seconds**.” |
| https://horizon.stellar.org/ | 200 | `current_protocol_version`: **27**; `core_supported_protocol_version`: **28**. |
| https://horizon.stellar.org/ledgers/63386819 | 200 | `closed_at` **2026-07-08T17:00:10Z**, `protocol_version` **27**. |
| https://horizon.stellar.org/ledgers?order=desc&limit=1 | 200 | `base_reserve_in_stroops` **5000000** (same as earlier 200-ledger probe). |
| https://developers.stellar.org/docs/networks/software-versions | 200 | Heading **Protocol 27 (Mainnet, July 8, 2026)**; Zipper; Protocol 28 Testnet TBD. |
| https://raw.githubusercontent.com/stellar/freighter/master/extension/public/static/manifest/v3.json | 200 | `matches: ["<all_urls>"]`, `run_at: "document_start"`, no `all_frames`. |
| https://api.github.com/repos/stellar/freighter/releases/latest | 200 | `tag_name`: **5.46.0**. |
| https://developers.stellar.org/docs/build/guides/dapps/frontend-guide | 200 | HTTPS-on-localhost sentence unchanged. |
| https://docs.freighter.app/extension-freighter-api/connecting | 200 | Connecting docs live. |
| https://finclusive.com/company/operating-provisions | 200 | TPSP, not a bank, not an MSB. |
| https://stellar.org/blog/policy/drive-inclusion-through-compliance | 200 | Names Biccos. |
| https://stellarlight.xyz/api/projects/search?q=wallet&limit=100&offset=0 | 200 | `counts.total` **183**, `returned` **99**, first names Lobstr / xBull / Freighter. |
| https://stellarlight.xyz/api/research?q=V-SOR-APP-VUL-003&limit=2 | 200 | Veridise first row; **no** `meta.exactMiss`. |
| https://veridise.com/wp-content/uploads/2025/02/VAR_Stellar_Soroban.pdf | 200 PDF | Live V2.1. |
| https://stellarsecurityportal.com/api/v1/reports/28 | 200 | V2 copy: `V-SOR-VUL-002 Denial of Service During Authorization` **Critical Investigated**; Table 2.3 Critical-Severity **0**. |
| https://developers.stellar.org/docs/learn/fundamentals/lumens | 200 | Base reserve 0.5 XLM; min two reserves. |
| https://www.certora.com/blog/roadmap-to-a-soroban-security-audit | 200 | Audit-class checklist still listed. |
| https://research.stellar.org/research-grants | 200 | Dedicated academic-grant page. |
| https://stellar.org/grants-and-funding | 200 | Index still live. |
| https://stellar.org/enterprise-fund/apply | 200 | Apply form exists. |
| https://hackerone.com/stellar?view_policy=true | 200 | HackerOne policy page. |
| https://stellar.org/grants-and-funding/bug-bounty | 200 | Bug-bounty marketing page. |
| https://github.com/stellar/stellar-protocol/blob/master/core/README.md | 200 | CAP registry README. |
| https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering | 200 | Declared-limit failure wording. |
| https://immunefi.com/bug-bounty/stellar/information/ | **404** | Cited as Not Found in the bug-bounty **Source conflict** line — that negative is true. Not a Live re-check that claims the URL exists. |
| https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival | 200 | Restoration semantics present. **Does not** mention denial of service, DoS, invariant, or state transition — **see finding 2**. |

Independent 199-delta Pubnet sample (this lane, 12:30Z): min 5 / max 7 / mean 5.678 / median 6 s over ledgers 64193568–64193767. Matches the case’s confirmed-as-of row.

---

## Check 3 — Corroboration verdicts

Counts on the 54 files: confirmed 60, confirmed-as-of 34, contradicted 13, unverifiable 3, disputed 2.

Every `contradicted` row is an avoid-mirrored trap (x402/MPP interchangeability, wrapped-USDC CCTP, FinClusive-universal-compliance, 3–5-second close, etc.). Legal under the skill.

The new ledger-close-time `contradicted` row for “Stellar ledgers close every 3–5 seconds (the golden.avoid trap)” names both the stack page (5–7) and `docs/validators` (still 3–5, marked stale). The avoid item only punishes an **immutable guarantee from one adjacent-ledger delta**, so an attributed validators quote is not the trap. Legal.

---

## Check 4 — Four source-conflict cases

`q-protocol-cap-process`, `q-scf-academic-research-grant`, `q-scf-sdf-bug-bounty`, `q-scf-vs-sdf-enterprise-fund`.

Each stays `truth.status: confirmed` with a `Source conflict 2026-08-30` evidence line. Live curl supports the two-sided conflict (README vs FBA wording; grants index vs research.stellar.org; grants bug-bounty vs HackerOne + Immunefi 404; grants “no application” vs `/enterprise-fund/apply` form).

**Sound as verified-with-conflict, not disputed.** In each file the golden already sides with the controlling owner page (CAP FBA activation, institution/PI research grants, HackerOne as intake, disclose Enterprise apply-form conflict). That is source-class A vs a weaker index/marketing page, not two equal authorities pinning different numbers. ADR-0008 correctly blocks a fourth canonical-page caution. Do not flip them to `disputed`.

---

## Check 5 — Ledger-close-time disposition and cluster-136

**Ledger-close-time: sound.** Golden still says “roughly 5–7 seconds” with a dated 2026-07-10 sample; fresh samples keep median 6 s (one 9 s delta in one sample does not break “roughly”). Official pages disagree (`docs/validators` 3–5 vs `stellar-stack` 5–7). Adding a fourth ADR-0008 caution would need an owner decision; leaving the Docs finding to the owner is the stated boundary. The avoid item is scoped to an immutable one-delta guarantee, not to an attributed quote of the validators page.

**Cluster-136: sound.** Members `q-gap-contracts-domain-empty`, `q-gap-hackathon-brief-evidence-boundaries`, `q-scout-hackathon-brief-first-hour` all encode the same evidence-gated empty-`contracts` / null-domain / don’t-bundle-rails-and-RFPs contract. They do not assert SCF award/tier/menu facts, so they must not join cluster-011/074/079/091. A future contract-rule change has to land in all three. `lastChecked` 2026-08-30; members were not edited this round, so no `reSwept` is required.

---

## Check 6 — Register `reSwept`

63 clusters have `reSwept.date` 2026-08-30.

- 57 use the generic “members changed only by judge-blind truth metadata … question, answer, keyFacts, avoid, and notes unchanged”. None of those 57 include the three gospel-changed ids. **Truthful.**
- 5 (006, 012, 022, 029, 034) name the wallets gospel refresh. **Partially truthful — see finding 3** (canned durable-rules clause).
- 1 (120) names the Protocol 27 Horizon refresh. **Same canned clause — finding 3.**
- Freighter is not a cluster member; no false “unchanged” claim about it.
- dateContingentTraps Protocol 28 disposition refreshed to 2026-08-30: matches live Horizon (27 / core_supported 28).

---

## Actionable findings

1. **`eval/qa/corpus/battery/defi-ecosystem/q-eco-stellar-wallets-list.json` — `golden.answer`.** The new sentence says “only 64 unique records carried the exact `types` value Wallet”. Live search 2026-08-30 (`q=wallet`, offset 0+100): `counts.total` 183; **64 unique ids have `"Wallet"` in `types`**; **31 unique ids have `types == ["Wallet"]`**. The corroboration row already states both figures. “Exact `types` value Wallet” reads as the sole-type filter (the durable distinction this case exists to grade). A later answer that reports 31 sole-type records would be marked wrong against 64. **Fix:** rewrite the judge-facing clause to “64 unique records had Wallet in `types` (31 had Wallet as the sole type)” — same wording as the corroboration row. Keep 183 / first-page names / as-of date.

2. **`eval/qa/corpus/battery/soroban/q-soroban-vuln-classes.json` — `truth.verified.evidence` Live re-check 2026-08-30 on `https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival`.** That line claims the page “still covers resource DoS and application invariants/state transitions.” Curl of the live HTML: **0** hits for “denial of service”, “dos”, “invariant”, or “state transition”. The sibling Live re-check on the same URL for P23+ restoration is fine; Certora + fees-resource-limits-metering already cover the DoS/limit keyFacts. **Fix:** drop or retarget the unsupported DoS/invariants line.

3. **`eval/qa/consistency-register.json` — `reSwept.reason` on cluster-006, 012, 022, 029, 034, and 120.** Each copy-pastes “the durable rules (dated roster, vote-versus-live, manifest-versus-guide) are unchanged.” Those three phrases are wallets / protocol-vote / Freighter rules. They are not the shared contract of e.g. cluster-006 (`q-eco-lobstr-wallet` + wallets-list) or cluster-120 (Protocol 27 siblings). The rest of each reason (who changed, what number moved, members still co-true) is fine. **Fix:** name only the durable rules that cluster actually shares.

No other gospel, temp-path, or 404-as-positive-evidence defects. After findings 1–3 land, this diff can ship.
