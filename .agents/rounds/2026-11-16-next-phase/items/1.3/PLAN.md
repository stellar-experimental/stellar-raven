# Item 1.3 plan: close the source-gap residue

Lead: Claude Opus 5.5, agentpc `t1rm`. Worktree `/home/tyler/code/raven-wt/np-1.3`, branch
`np/1.3-source-gap-residue` from `origin/main` at `4c8ae68b`. Local server: `npm run dev:eval`,
lead's child `1.3-server` (`t1rn`), `http://localhost:8787/mcp`, started clean at `a400553d`.

## Decision this item changes

For each residual source gap: does it become an upstream finding (posted under decision 4), an
own-repo `.agents/TODO.md` item, or is it closed? Every gap gets one class:

- **reached, not surfaced**: a source Raven reaches holds the fact; the miss is retrieval or
  ranking. Owner is Raven (TODO) or the upstream search (a `docs-search` finding).
- **held by an unreached source**: the fact exists only outside Raven's sources (decision 6).
  Recorded; filed only where decision 6(c) says so.
- **stated nowhere**: no owner-side page states it. A gap finding with a concrete content
  recommendation for the owning source.

## Facts re-checked against `main` (`4c8ae68b`)

- The gap ledger ([GAPS.md](../../../2026-11-14-golden-coverage-audit/gaps/GAPS.md), twin
  `gaps.json`) has exactly 11 leaves marked "not re-run": `network.protocol-history`,
  `standards.moneygram-ramps`, `standards.exchange-integration`, `defi.lending`,
  `defi.tvl-landscape`, `wallets.landscape`, `ecosystem.sdf`, `ecosystem.sdf-mandate-holdings`,
  `ecosystem.xlm-staking-rewards`, `ecosystem.history-origins`, `ecosystem.xlm-markets`.
- Confirmed gaps with no finding: `wallets.scams-phishing`, `standards.payment-patterns`,
  `ecosystem.chain-comparisons`, `wallets.pi-network`, `security.regulation-policy`,
  `assets.public-sector-cbdc`.
- Next free ids: `sd-111`, `sls-121` (reserved by the orchestrator), `ll-039` (active max `ll-038`,
  resolved max `ll-021`; not reserved, but items run one at a time). The executor re-checks all
  three maxima across the tree and `improvements/resolved.json` before writing.
- stellar.org page copy has no public issue tracker. Precedent `sd-077`: a stellar.org content
  finding lives in `improvements/stellar-docs/` with an `unclear` intake override and stays
  `verified`.
- `sd-110` is `reported-upstream`, so the `cap-finding` lint accepts a caution that names it.
- The TODO items this item closes or rewrites: "Audit source coverage", "Prove the stellar.org
  source" (Blend register and Anchor Directory bullets), "Check Docs search for the SEP-7
  payment-request page before filing", "Add a canonical-page caution to `q-soroban-cli-bindings`",
  "Two snippet-only rows no Docs page can answer", and the "Scout sweep, next round" bullet.

## Steps

All reads are keyless: the local server's `search`/`execute` (Lumenloop and Docs go through the
host adapters with `.dev.vars`), public pages, the Scout REST API, GitHub source. No model-graded
step, no eval command, no new battery case, no AI Gateway or Workers AI call.

**QA case scope.** The only case files this item opens are `q-soroban-cli-bindings`,
`q-soroban-contract-id-derivation` and `q-sep-45-contract-auth`. Open no other file under
`eval/qa/corpus/` and never read a split file. Where a gap row names another case, use the
committed gap-ledger text only.

Record every probe in `items/1.3/LEAVES.md` (one table: leaf or topic, wording 1, wording 2,
owning-surface read, result, class, action). Raw probe output goes to `items/1.3/probes/`
(trimmed JSON, no secrets).

1. **The 11 not-re-run leaves.** Per leaf: two wordings through Raven (`execute`, using the
   operation the gap row names plus one alternative family) and one direct read of the owning
   surface (the `.md` Docs page, the Scout REST endpoint, the Lumenloop row, or the stellar.org
   page). Class it. `wallets.landscape` joins step 8. `ecosystem.sdf-mandate-holdings` is
   decision 6(b) (Dashboard API, decided after 3.1): class it, file nothing.
2. **SEP-7 three-way** (`standards.payment-patterns`). Query `web+stellar:pay payment request QR
   code` and the bare `web+stellar:pay`: (a) the Mintlify search backend directly, with the
   assistant key, no Raven scoping; (b) through Raven's `stellarDocs.search_docs`; (c) Raven's
   candidate list before scoping, if the adapter exposes it (read
   [`docs/stellar-docs.md`](../../../../../docs/stellar-docs.md) for the scoping contract; no admin
   key). Record the rank of `/docs/build/apps/wallet/sep7` in each. Upstream ranking miss →
   `sd-` `docs-search` finding. Raven scoping hides it → a TODO item (no adapter change in this
   item). Found in both → record "no defect" and close the TODO item.
3. **Two snippet-only rows.** Read both case files. `q-soroban-contract-id-derivation`: does any
   Docs page (live `.md` plus a grep of `stellar/stellar-docs` at its current head) state the
   contract-id formula (SHA-256 of the `HashIdPreimage` contract-id preimage with the network id)?
   Name the canonical source (CAP-0046 or `stellar-xdr`). `q-sep-45-contract-auth`: does any Docs
   page state SEP-45's status, and what does the SEP file say today? A fact on a page → a TODO
   reachability line. A fact on no page → an `sd-` `docs-content` finding. A golden that no longer
   matches live truth → a `golden-truth` edit with live evidence. Then delete the TODO item.
4. **Blend audit register.** Read the stellar.org audit register (the page `get_page` serves and
   any public JSON it renders from). Count records titled `Unnamed record` and how many name a
   project only in the report URL. If confirmed: `sd-` `site-content` finding, intake override
   `unclear` (sd-077 precedent), with Scout `listAudits` named as the source that has the names.
5. **Anchor Directory.** Does any reached source (Docs, Scout projects or research, Lumenloop,
   stellar.org) state that the Anchor Directory is `anchors.stellar.org`? Yes → reached, not
   surfaced (TODO line if a retrieval fix is plausible, else closed). No → held by an unreached
   source; decision 6 note in the TODO. This item makes no golden edit to that case.
6. **Canonical-page caution on `q-soroban-cli-bindings`.** Per
   [CASE-DEFECTS.md](../../../2026-11-14-baseline-tuning/CASE-DEFECTS.md) and the `golden-truth`
   skill: append the lint-canonical caution naming the Lab Contract Explorer page and `sd-110` to
   `golden.notes`, update `truth.verified` (`by`, date, `rootCause` → `sd-110`), re-check `sd-110`
   live first. Run `npm run eval:qa:register`. Delete the TODO item.
7. **Decision 6(c): file the three content gaps.** Each needs its live re-check and a canonical
   owner-side source:
   - **NBU** (`assets.public-sector-cbdc`): fetch the bank.gov.ua statement of 2021-12-15; confirm
     Lumenloop holds the Decrypt item and not the statement. `ll-039`, `content-pipeline`, to
     `lumenloop/lumenloop-backend`: ingest the primary statement and link it to the Decrypt row.
   - **Scam recovery** (`wallets.scams-phishing`): find and read in full the held SDF scam guide
     (2020 to 2023); confirm no owner page says what a victim should do after a scam. File to the
     page's owner: `stellar/stellar-docs` if the adjacent guide is a Docs page, else an `sd-` with
     `unclear` intake (stellar.org copy).
   - **Pi Network** (`wallets.pi-network`): confirm no Stellar owner page says Pi is a separate
     network and Pi cannot be sent to a Stellar address. Same placement rule; prefer a Docs page
     that already answers adjacent "is X Stellar" questions if one exists.
8. **Scout wallet rows and paging** (1.1 REPORT item 4). Re-run once: the 5 `Live` wallet rows
   (spatium, freelii, bebop, sentit, elsa) with `availabilityCheck` and `statusAsOf`; `GET
   /api/projects/search?q=wallet` at `offset=0` and `offset=100` (record `total` and duplicate
   slugs). Each that reproduces and meets the `verified` bar → `sls-121`, `sls-122`. Dedupe against
   resolved `sls-033` and active Scout findings first.
9. **The two other confirmed gaps.** `ecosystem.chain-comparisons` (XRP Ledger facts) and
   `security.regulation-policy`: class them; decision 6(c) files neither. Record why in
   `LEAVES.md`.
10. **Write-up.** `items/1.3/CLASSIFICATION.md`: one row per gap (the 11, the 6 confirmed, SEP-7,
    the two rows, Blend, Anchor Directory, the two Scout reads) with class, owner, and the
    finding or TODO it became. Rewrite the TODO items listed above (delete those that are done;
    "Audit source coverage" points at CLASSIFICATION.md and keeps only the owner's source-test
    choice, which decision 6(b) defers to after 3.1). The dated GAPS.md stays unedited.
11. **Grok attack** (after step 10, before any posting). A Grok 4.7 child, high effort, gets
    CLASSIFICATION.md and every new finding, and tries to find each "missing" or "nowhere" fact in a
    source Raven reaches (keyless, local server and public pages). Findings to
    `tmp/1.3-grok.md`, copied to `items/1.3/GROK-REVIEW.md`. The executor reconciles each one.
    Fallback: Codex frontier.
12. **Post.** For each new finding: `npm run improvements:file -- --file <f> --dry-run`, read it as
    the maintainer, commit, then post (decision 4, no cap). An `unclear` finding stays `verified`
    with a note. Post nothing that the Grok review knocked down.

## Gates

Run bare, after the last edit: `npm run typecheck`, `npm test`, `npm run build`,
`npm run secrets:scan -- --tree`, `npm run improvements:index`, `npm run improvements:lint`,
`npm run improvements:lint -- --live`, `npm run eval:qa:lint -- --since origin/main`,
`npm run eval:qa:lint -- --stale --enforce-floors`, `npm run eval:qa:register -- --check`,
`npm run eval:selftest`. No `test:smoke`: `src/` is untouched.

## Stop rule

Per leaf or topic: two wordings and one direct read of the owning surface, then class it. No third
wording. A finding needs the `verified` bar; anything short of it is a dated TODO line with its next
check. Budget about one working day; USD 0.

## Risks

- **Opening a QA case outside scope.** Mitigated by the three-file allowlist above.
- **A wrong "nowhere" claim posted publicly.** Mitigated by the Grok attack before posting and by
  the skill's "search absence alone is not a content defect" rule: each content finding names the
  page that undertakes the topic.
- **Golden drift.** Only `q-soroban-cli-bindings` is certainly edited; the two snippet-only rows
  change only on live evidence, through `golden-truth`.
- **Index conflicts.** `improvements/INDEX.md` is generated; merge `main` and re-run the index
  before the pull request.
- **Server staleness.** The server runs the tree at `a400553d`; this item changes no `src/`, so it
  stays valid.

## Needs from the orchestrator or owner

- `ll-039` is outside the reserved ranges; the executor takes the next free `ll-` id.
- stellar.org findings have no public tracker (sd-077 and any new `unclear` ones). The report will
  ask whether the owner forwards them to the stellar.org web team.

## Reconciliation of the Fable review

[REVIEW.md](REVIEW.md), Claude Fable 5.2, high: 16 findings (3 blocking, 9 should-fix, 4 nit).
This section overrides the steps above where they differ.

| # | Disposition | Change |
|---|---|---|
| 1 | Adopted | Step 6 and the gates run `npm run eval:qa:compile` first. Expected diff: the one case and the header hash in `eval/qa/cases.json`, one `caseContentSha256` in `eval/qa/lifecycle-registry.json`, the header hash in `eval/qa/sample.json`, nothing in `eval/qa/tool-cases.json`. Anything else is a stop-and-report. |
| 2 | Adopted | After `npm run eval:qa:register`, `cluster-095` and `cluster-103` reopen. The executor stops there and reports; the **lead** writes the review file (basis: the diff, one appended grading caution, no claim changed, and the register's cluster notes; no sibling case is opened) and the executor closes both with `npm run eval:qa:register -- --review <file>`. |
| 3 | Adopted | Step 7 placement: each 6(c) finding's evidence states (a) the canonical source, read live; (b) the host page and the sentence that shows it undertakes the topic; (c) the smallest correction. Where no owner page undertakes the topic, the first paragraph says "net-new content request", the class is `site-content`, intake is `unclear`, and the finding stays `verified`, unposted, with a note. Post to `stellar/stellar-docs` only if a Docs page undertakes the topic in its own words. Pi: the canonical fact is Pi Network's own; the Stellar-side ask is an SDF FAQ line. Scam recovery: the held guide is a stellar.org blog post; dedupe against `sd-108` (stellar-docs#3146) and `sls-117`, write a separate record that cites both, and comment on neither. |
| 4 | Adopted | Step 3 asks first whether any reached source states the fact. SEP-45: the SEP file owns the status and research reaches it, so it is "reached, not surfaced"; add the row as evidence under the held research-lane item in the TODO, no new item, no finding. Contract-id row: as planned (the deployer pages undertake the derivation). |
| 5 | Adopted | Step 1 gains a fourth outcome, **did not reproduce, closed**. A leaf stops at the first wording that returns the target fact. Use the probe table below. The four leaves with a home point at it and get no new item. |
| 6 | Adopted | Step 2: arm (c) is cut. (a) the Mintlify backend at `pageSize` 50 (the adapter's own request body, `docs/stellar-docs.md`); (b) `stellarDocs.search_docs` at `hitsPerPage` 20. Rule, fixed now: page absent from (a)'s 50 or ranked below 20, for a query that holds the page's exact string → `docs-search` finding; in (a)'s top 20 and missing from (b) → Raven TODO item; otherwise no defect. (a) uses `MINTLIFY_ASSISTANT_API_KEY`: "all reads are keyless" is corrected to "no paid or model call"; the script reads `.dev.vars` itself and prints only paths and ranks. No request header goes under `probes/`. |
| 7 | Adopted | Step 6 uses this caution verbatim: "Quoting the official Lab Contract Explorer page, with attribution, that the Stellar CLI generates TypeScript, JSON, Rust, Python, and Java bindings is not a wrong claim while sd-110 stands; grade caps at partial." `truth.verified` is replaced whole (date, `by`, `evidence`: today's page read, stellar-docs#3151, the CASE-DEFECTS ledger; `rootCause`: `improvements/stellar-docs/sd-110-lab-contract-explorer-bindings-language-list.md`). Update `sd-110`'s "no golden change" evidence line and re-run the index. Record the sibling sweep (`rg -l "sd-110\|Contract Explorer" eval/qa/corpus`, no file) and "not re-judged; direction not measured". If PR #3153 is merged and deployed before the edit: no caution, and a TODO line for the `fixed-upstream` path instead. |
| 8 | Adopted | Step 5 is one probe: `stellarDocs.search_docs("Anchor Directory")`, plus the anchors page read already in REVIEW.md. Class it "reached" or "reached, not surfaced". Correct the TODO's "Out-of-source fact" bullet. No golden edit. |
| 9 | Adopted | This item does not take "Look at the Freighter and Scout SDK-status goldens"; re-point its "round item 1.1 or 1.3" text to "a later golden lane". No case is opened. |
| 10 | Adopted | NBU is a coverage request and says so; the Decrypt headline is not called a Lumenloop defect. Ask to link the statement to the Decrypt row only if Lumenloop exposes a content-to-content relation; else ingestion alone. If bank.gov.ua does not serve the statement, a dated TODO line instead of a finding. The surface is described in words, not a skill class. |
| 11 | Adopted | Grok gets only rows classed "held by an unreached source" or "stated nowhere", and the findings that make an absence claim. Step 8's Scout data findings and every "reached" row are out of its scope. CLASSIFICATION.md records its tier, model and effort. |
| 12 | Adopted | `probes/` keeps from Lumenloop responses only ids, titles, public URLs and dates (partner-tier rule). |
| 13 | Adopted | Step 12 order: commit, the lead pushes, dry run, post. The executor asks the lead to push (hc send) and waits for the reply before posting. |
| 14 | Adopted | Step 8: a stale-`Live` finding cites the `sls-033` receipt. The paging read runs twice; one overlap alone is not a finding. |
| 15 | Adopted | Step 4's recommendation is to the register's owner: name the project in each record; the report URL is evidence the project is known; Scout `listAudits` is supporting evidence. |
| 16 | Partly | Branch base: the branch carries the lead's ledger commit `a400553d` (the 1.2 Deployed cell, an orchestrator instruction); it lands with this pull request. The basis for the three-file allowlist is **not** written down: stating it would say which set those cases are in. The lead chose the three. |

### Probe table for step 1

Target fact is the ledger's `missing` text. Stop at the first wording that returns it.

| Leaf | Target fact | Wording 1 | Wording 2 | Operation | Owning surface | Existing home |
|---|---|---|---|---|---|---|
| `network.protocol-history` | Protocol release history beyond Protocol 20 from Software Versions | "Stellar protocol version history and release dates" | "Software Versions Protocol 23 release" | `stellarDocs.search_docs`, then `get_doc_page` on `/docs/networks/software-versions` | `https://developers.stellar.org/docs/networks/software-versions.md` | Raven page-size note (`GAPS.md` own-repo notes): one `get_doc_page` read decides whether the cap truncates |
| `standards.moneygram-ramps` | MoneyGram corridor detail | `scout.matchPartners` for a MoneyGram cash-out corridor | Scout anchor row for MoneyGram | `scout.matchPartners`, `scout` anchor detail | Scout REST anchor row | TODO "Triage the runtime and client gaps", `scout.matchPartners` bullet: update it only if the 503 reproduces |
| `standards.exchange-integration` | An exchange integration guide (deposit attribution, memos, pooled accounts) | "exchange integration guide" | "pooled accounts deposit memo exchange" | `stellarDocs.search_docs` | Docs pages under `/docs/build/guides/` and `/docs/learn/` | none |
| `defi.lending` | How Blend pools are structured (isolated pools, backstop) | "Blend lending pool structure backstop" | "how do Blend isolated lending pools work" | `lumenloop.search_content_semantic`, `scout.searchResearch`, Scout project row | Blend docs via Scout/Lumenloop rows | none |
| `defi.tvl-landscape` | A TVL ranking of Stellar DeFi protocols | `scout.getLeaderboard` `sort=tvl` | Scout project search with TVL fields | `scout.getLeaderboard` | Scout REST leaderboard | `sls-039` (`declined-upstream`): do not re-file |
| `wallets.landscape` | Whether Scout wallet rows say which wallets support contract tokens | one wallet row read (Freighter) | — | Scout project detail | Scout REST project row | sls-033 receipt (enumeration and availability only) |
| `ecosystem.sdf` | Current SDF leadership | "SDF leadership team CEO" | "Stellar Development Foundation executive team" | `scout.searchResearch`, `lumenloop.search_content_semantic` | `https://stellar.org/foundation/team` | none |
| `ecosystem.sdf-mandate-holdings` | Current SDF XLM holdings figure | "SDF mandate XLM holdings" | — | `stellarDocs.search_docs` | Docs Lumens page snapshot; dashboard.stellar.org | decision 6(b): class, file nothing |
| `ecosystem.xlm-staking-rewards` | XLM has no protocol staking; the 2026 rewards proposal | "does XLM have staking rewards" | "Stellar inflation ended staking yield XLM" | `stellarDocs.search_docs`, `scout.searchResearch`, `lumenloop.search_content_semantic` | Docs Lumens page | none |
| `ecosystem.history-origins` | Stellar's origin as a fork of Ripple (2014) and the relationship | "Stellar Ripple fork 2014 history" | "Jed McCaleb Ripple Stellar founding" | `lumenloop.search_content_semantic`, `scout.searchResearch` | Lumenloop article rows | none |
| `ecosystem.xlm-markets` | A regulated XLM investment product (e.g. an exchange-traded product) | "XLM ETP exchange traded product" | "Grayscale Stellar Lumens Trust" | `lumenloop.search_content_semantic`, `scout.searchResearch` | Lumenloop rows | outside Raven's scope if absent: class, file nothing |
