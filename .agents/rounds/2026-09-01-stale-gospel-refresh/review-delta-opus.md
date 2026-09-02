# Delta review — stale-gospel refresh

Follows: `.agents/rounds/2026-09-01-stale-gospel-refresh/review-final-opus.md`
Reviewer: Claude Opus 5, high effort. Same independent reviewer.
Review date: 2026-09-02 UTC (2026-09-01 local).
Scope: only the changes made after the final review. No file was edited by this review.

**Verdict for the non-register delta: PASS.**

The consistency-register closures are excluded by instruction. They remain unchanged and pending
explicit authorization.

---

## 1. What changed after the final review

Two new files entered the diff. Both are correct.

| File | Change |
| --- | --- |
| `.agents/TODO.md` | New item for the catalog `created_at` defect (N8). |
| `.agents/skills/golden-truth/SKILL.md` | New read-only probe rule (N9). |

Six case files, the generated artifacts, `sd-039`, and the round ledger also changed.
`eval/qa/consistency-register.json` did not change. Its diff is still the same 56 lines.

---

## 2. B1 — closed

The generated artifacts now match the case files exactly.

- A fresh `node eval/qa/compile-qa.mjs` in an isolated copy produced files that are byte-identical
  to the committed `eval/qa/cases.json`, `eval/qa/sample.json`, and `eval/qa/lifecycle-registry.json`.
  `cmp` reports no difference on any of the three.
- The committed `corpusContentSha256` is `70a7e5d6af9b1a3b24990f58674532480f0a06ca863abefe7fe10cdd24a1814e`
  in both `cases.json` and `sample.json`. The fresh compile produced the same value.
- The `ERROR [lifecycle-registry] q-ti-openzeppelin-relayer` line is gone.
- `npx vitest run` passes: 99 test files, 1595 tests. The corpus byte-pin is satisfied.

B1 is closed.

---

## 3. Lint status

```
node eval/qa/lint-corpus.mjs --since main --stale
  ERROR [date-trap] q-sor-confidential-tokens: disposition reverifyBy 2026-09-01 does not match truth.reverifyBy 2026-12-15
  1 error(s), 62 warning(s)

node eval/qa/register-helper.mjs --check   →  up to date
npm run improvements:lint                  →  improvements lint ok (66 findings)
npm run secrets:scan -- --tree             →  clean (+ gitleaks)
npx vitest run                             →  99 files, 1595 tests, all passed
```

The single remaining error is B2. It is part of the deferred register and date-trap closure. The
exact replacement text is in section 6.1 of the final review.

The warning count is 62. That equals the `main` baseline. The lint output names one of the seven
cases exactly once, and only in the date-trap error line. The delta added no warning.

`register-helper --check` reports `up to date`. The six clusters and the one date trap still carry
`verdict: "reopen"`, as instructed.

---

## 4. N1 to N12 — reconciliation

### N1 — RECONCILED

`golden.notes` in `q-soroban-av-passkeys-talk` now reads "`lumenloop.find_av_passages` is the A/V
summary lane" and "Each surfaced summary row carries its talk/podcast source through
`lumenloop.find_av_passages`". The grading sentence now reads "graded on returning real summary rows
with their talk/podcast provenance". That no longer contradicts the answer.

The retired underscore form survives only in the `avoid` item, where it correctly names the trap.

Checked against the exposed surface: `catalog/manifest.json` contains `lumenloop.find_av_passages`
5 times and `lumenloop_find_av_passages` 0 times. The notes now match the manifest.

### N2 — RECONCILED

All three stale GT stamps moved, and the four already-refreshed stamps are unchanged. The seven
cases now apply one rule.

| Case | Stamp now |
| --- | --- |
| `q-sor-evm-to-soroban-porting` | "GT-41 snapshot 2026-07-10, re-verified unchanged 2026-09-02" |
| `q-soroban-av-passkeys-talk` | "GT-44 live service contract 2026-09-02" |
| `q-ti-friendbot-ratelimit-alternatives` | "GT-52 CORRECTION re-verified 2026-09-01" |

The GT-41 form is the better of the two patterns. It keeps the original correction date and adds
the re-verification date. It does not overwrite provenance.

### N3 — RECONCILED

The corroboration row "The current Reflector operator site mentions x_* functions that conflict with
the live ABI" now carries `verdict: "contradicted"`. It is now symmetric with the Channels
Statuspage row, which uses the same verdict on the same evidentiary shape.

### N4 — RECONCILED

The row "A live Mainnet Beam oracle deployment exposing lastprice(caller, asset) exists" was added
with `verdict: "unverifiable"`. Its two evidence rows are the live operator registry and the
official provider table. A later reader can now see that the Beam signature is source-confirmed
only.

### N5 — RECONCILED

The Lab corroboration row no longer cites `https://lab.stellar.org/account/fund` or the lane file.
Both evidence rows are now official pages that a reviewer can re-walk:

- `https://developers.stellar.org/docs/tools/lab/account` — HTTP 200. This review quoted it in the
  final review: Friendbot funding of 10,000 XLM, USDC and EURC trustline creation, and no way to
  receive test USDC units.
- `https://developers.stellar.org/docs/build/guides/transactions/path-payments` — HTTP 200. This
  review confirmed it is a JavaScript SDK tutorial, not a Lab distribution route.

The `/tmp` provenance chain is gone from the case file.

### N6 — RECONCILED

`https://docs.validationcloud.io/v1/about/faucets` was added as a class A evidence row. Its note is
accurate: "The provider says it links to an existing Stellar faucet, so independence from Friendbot
is not established." That is the source that justifies the golden's existing caution. This review
re-fetched the page (HTTP 200) and confirmed the wording in the final review.

### N7 — RECONCILED

`golden.notes` now carries the clause "Reports a dated Friendbot rate-limit response that used HTTP
400 instead of 429" in the "Also good if the answer" list.

This review verified the underlying fact independently, because the clause is new judge-facing text.
`https://developers.circle.com/stablecoins/quickstarts/setup-usdc-trustline-stellar` shows
"Friendbot funding failed: 400" and explains "The Friendbot rate limit was exceeded. Wait a few
seconds and try again." The clause is true and source-backed. It is placed as permissive grading
guidance, not as a new gate, which is the correct strength.

### N8 — RECONCILED

`.agents/TODO.md` gains "Correct Lumenloop A/V `created_at` semantics". The item states the defect,
the observed counter-example (`created_at: 2026-04-02T23:21:21.744Z` on a DEVCON 2024 recording),
the evidence path, and a testable "Done when" clause that includes rebuilding generated catalog
outputs and adding focused tests. This meets the TODO format rule of stating what is wrong, how it
was found, and what done means.

### N9 — RECONCILED, both halves

The ledger now carries a dedicated "### Authorization deviation" heading. It names the cause: "A
reviewer called the documented Channels key-issuance endpoint while treating a `GET` as read-only."
That is the classification the final review asked for.

`.agents/skills/golden-truth/SKILL.md` gains two lines under the class C source description: "Use a
documented read path for a read-only probe. Treat provisioning, issuing, and creation endpoints as
side effects, including endpoints that use `GET`."

The rule is timeless. It carries no date, no round reference, and no case id. It sits in the class C
bullet, which is where live probes are defined. This complies with the skills-stay-timeless rule.

### N10 — RECONCILED

The `sd-039` 2026-09-02 recurrence now adds: "The page also links an inactive Channels Statuspage
and OpenZeppelin's 1.3.x guide while rendered docs label 1.5.x stable." This review verified both
facts in the final review, directly from the live Stellar Docs page.

`improvements/INDEX.md` shows recurrence count 4. `improvements:lint` passes with 66 findings.

### N11 — RECONCILED

`q-ti-openzeppelin-relayer` moved from `reverifyBy` 2026-11-19 to 2026-11-24. Current buckets:
2026-11-19 holds 9 cases, which is its `main` baseline; 2026-11-24 holds 1. The round no longer adds
a case to the corpus's largest existing cliff. The matrix-reconciliation table in the ledger was
updated to match.

### N12 — RECONCILED

The ledger states: "The funding sources were observed on 2026-09-01. The orchestrator reconciled
those matrices on 2026-09-02, so their `truth.asOf` and `truth.verified.date` values intentionally
differ." A later reader will not read the split as an error.

---

## 5. Unrequested changes in the delta

Three changes went beyond N1 to N12. This review checked each one. All are correct.

**5.1 Source-class corrections.** Three cases replaced "class inferred at migration" placeholders
with real classes and real notes.

- `q-sor-reflector-integration-code`: the contract repository moved from D to B, the operator
  registry from D to C, and the operator page from D to A.
- `q-ti-openzeppelin-relayer`: the two OpenZeppelin doc pages moved from D to A, the release tag
  from D to B, and the Statuspage from D to C.
- `q-ti-testnet-usdc-faucet`: three Circle documentation pages moved from D to A, and the live
  faucet page from D to C.

Each new class matches the skill's definitions: A for official docs and owner sites, B for source
and release records, C for live service surfaces. These are improvements. The old blanket D was
wrong for owner-published documentation.

**5.2 Circle source URL canonicalization.** Two `truth.sources` refs changed from
`stablecoins/quickstart-setup-usdc-trustline-stellar` and `stablecoins/quickstart-transfer-usdc-stellar`
to the `stablecoins/quickstarts/...` forms. This review checked both. The old forms return HTTP 308
and the new forms return HTTP 200. The old links were not broken. The change is a canonicalization,
not a repair. It is still an improvement, because a permanent redirect is a weaker citation than its
target.

**5.3 Relayer statuspage source ref.** The source list now names
`https://relayerchannelsmainnet.statuspage.io/inactive` at class C. This review confirmed the URL
returns HTTP 200 with the title "Stellar Relayer Channels Mainnet Status - Page Inactive".

---

## 6. New observations

These are small, they are all in durable records rather than in judge-facing gospel, and none of
them blocks. They are listed so the author can fold them into the close.

**D1 — The ledger still defers the Reflector README decision.** It says "The final reviewer will
decide whether to retain it in this ledger or request a separate owner action." The final review
decided: ledger-only, with no improvements record, no upstream issue, and no TODO, because
`reflector-network/reflector-contract` is not an exposed service, is not a pinned skill source, has
no collection, and has no `improvements/intake.json` owner mapping. The ledger should record that
decision instead of deferring it.

**D2 — One ledger table row is now slightly stale.** The reconciliation table calls
`q-sor-reflector-integration-code` "confirmed with one unverifiable clause". The shipped encoding is
now one `contradicted` clause plus one new `unverifiable` Beam-deployment row.

**D3 — Two `truth.verified.evidence` lists lag their own corroboration rows.**
`q-ti-testnet-usdc-faucet` still lists "Lab review 2026-09-01: https://lab.stellar.org/account/fund"
and does not name the two re-walkable pages that now carry the claim. The wording is honest, because
it says the page "did not establish" the route. Naming the two official pages would be stronger.
`q-ti-friendbot-ratelimit-alternatives` has the same shape: its "Provider review" line names only
the marketing page, not `docs.validationcloud.io`, which is the row that carries the nuance.

**D4 — TODO section placement.** The new catalog item sits under "## Eval instruments". It is a
catalog-description defect, not an eval instrument. The TODO scope line covers catalog work, so the
item is in the right file. Only the section heading is imprecise.

**D5 — The ledger "Outcome" section is not yet refreshed.** It still lists the final review as
pending. That is expected at this point and will change at close.

---

## 7. Result

Every item from N1 to N12 is fully reconciled. Each fix was checked against the change itself, and
each new judge-facing claim was checked against a primary source rather than against the round's own
notes. The three unrequested changes are all correct.

B1 is closed. The generated artifacts are byte-identical to a fresh compile, and the full test suite
passes.

Remaining, and excluded from this verdict by instruction: the six reopened clusters, the one date
trap, and the single `date-trap` lint error they cause. The exact closure text for all seven entries
is in section 6 of the final review.

**PASS for the non-register delta.**
