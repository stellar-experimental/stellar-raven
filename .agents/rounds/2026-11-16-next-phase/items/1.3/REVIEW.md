# Item 1.3 plan review

Reviewer: Claude Fable 5.2 (`claude-fable-5-2`), high. Read-only against the worktree at
`a400553d`. I opened one QA case file, `q-soroban-cli-bindings`. Every other battery check was by
file name only (`rg -l`). I read no split file and called no model-graded command. Live reads on
2026-11-17 were keyless: two Docs `.md` pages and `gh api` on two upstream refs.

## Facts checked and correct

- 11 leaves read "not re-run" in the ledger's "Reach today" column; the plan's list matches.
- 6 confirmed gaps have no finding; the plan's list matches (15 confirmed, 9 covered).
- Ids: active maxima `sd-110`, `sls-120`, `ll-038`; `improvements/resolved.json` maxima `sd-104`,
  `sls-115`, `ll-021`. Next free: `sd-111`, `sls-121`, `ll-039`.
- `sd-077`: `improvements/stellar-docs/`, `status: verified`, intake `unclear`
  (`improvements/intake.json:214-217`). The precedent holds.
- `sd-110` is `reported-upstream` and still reproduces today: the page answers 200 and holds
  "TypeScript, JSON, Rust, Python, and Java"; stellar-docs#3151 is open; fix PR #3153 is open and
  unmerged. The cap is valid today.
- The six TODO titles exist as written (`.agents/TODO.md:62`, `:358`, `:384`, `:437`, `:776`, `:480`).
- `"Unnamed record"` comes from the site, not the adapter (`src/adapters/stellar-org.ts:109`).

## Findings

1. **blocking. Gates: `npm run eval:qa:compile` is missing.** The notes edit changes generated
   files, and CI fails when they are out of sync.
   - Evidence: `.github/workflows/ci.yml:132-134` runs `compile-qa.mjs` and diffs
     `eval/qa/cases.json`, `sample.json`, `tool-cases.json` and `lifecycle-registry.json`.
     `golden-truth` section 6 lists the command first.
   - Change: add it to step 6 and to the gates, before the lints. State the expected diff: one
     case and the header hash in `cases.json`, one `caseContentSha256` in
     `lifecycle-registry.json`, the header hash in `sample.json`, nothing in `tool-cases.json`.

2. **blocking. Step 6: the register step is incomplete and collides with the case allowlist.**
   - Evidence: the case is a member of `cluster-095` (with `q-sor-build-target-wasm32v1`,
     `q-sor-deploy-invoke-from-js-sdk`, `q-ti-scaffold-stellar`) and `cluster-103` (with
     `q-soroban-deploy-cli`). `npm run eval:qa:register` re-stamps and sets both to `reopen`. The
     register holds zero `reopen` entries today. `--check` passes with them left open
     (`eval/qa/register-helper.mjs:217-221`), so no gate catches it. Closing needs
     `-- --review <file>` after an independent review (`eval/qa/README.md:53-63`).
   - A consistency review normally reads the sibling members. The allowlist forbids that, and a
     sibling may be held-out; opening one spends its blindness for good.
   - Change: add the step. Stamp, then close both clusters with a review file. The review basis is
     the diff (one appended grading caution, no claim changed) and the cluster notes in the
     register. No sibling file is opened. The lead reviews, not the executor. Precedent:
     `CASE-DEFECTS.md:246`.

3. **blocking. Step 7, Pi Network and scam recovery: the placement rule files a search-absence
   claim on a developer-docs repo.** The pipeline bar is: name the canonical source, show why the
   surface undertakes the topic, name the smallest correction (`improvements-pipeline` SKILL.md:50-52).
   - Pi: the canonical source is Pi Network's own documentation (`gaps.json`, `ownerNote`). No
     Stellar page undertakes the topic. "Prefer a Docs page that answers adjacent questions" turns
     a net-new content request into a `docs-content` issue on `stellar/stellar-docs`. A public
     issue cannot be taken back.
   - Scam: the ledger already names the guide as a stellar.org blog post (`gaps.json`,
     `ownerNote`: "stellar.org blog, updated July 2022"). The Docs branch of the placement rule is
     moot. A guide on avoiding scams does not, by itself, undertake recovery steps.
   - Change: each 6(c) finding states three things in its evidence: the canonical source, read
     live; the host page and the sentence that shows it undertakes the topic; the smallest
     correction. Where no owner page undertakes the topic, say "net-new content request" in the
     first paragraph, class it `site-content`, set intake `unclear`, and keep it `verified` and
     unposted. That satisfies decision 6(c) ("file") under the `sd-077` precedent. Post to
     `stellar/stellar-docs` only if a Docs page undertakes the topic in its own words.
   - Dedupe the scam finding against `sd-108` (stellar-docs#3146, wallet-user safety guidance)
     and `sls-117` (the memo-recovery path). I recommend a separate record that cites both and no
     comment on #3146.

4. **should-fix. Step 3: the decision rule is Docs-only and contradicts the three classes.**
   - SEP-45: the TODO says the status is in the SEP file's research preamble and that the agent
     reaches it through research (`.agents/TODO.md:781-782`). That is "reached, not surfaced". The
     Raven-side fix sits under the held research-lane item (`.agents/TODO.md:632-679`, decision
     6(a)). "A fact on no Docs page → `docs-content` finding" would file a search-absence claim:
     the SEP file in `stellar/stellar-protocol` owns the status.
   - Change: ask first whether any reached source states the fact. File an `sd-` finding only when
     a named Docs page undertakes the topic. For SEP-45, add the row to the held item as evidence
     and write no new reachability item. The contract-id row is fine as planned: the deployer
     pages undertake the derivation ("derived from the deployer address and salt").

5. **should-fix. Step 1: no "did not reproduce" class, no early stop, no target fact per leaf.**
   - 13 of the 16 weight-3 leaves did not reproduce (`GAPS.md:25-27`). The same outcome is the
     likely one here, and the plan has no class for it.
   - Ten of the 11 rows have no case and no question (`leafCases: []`). "Two wordings" of what is
     left to the executor.
   - Change: add a fourth outcome, "did not reproduce, closed". Stop a leaf at the first wording
     that returns the fact; skip the second wording and the direct read. Have the lead add a table
     before execution: leaf, target fact (the row's `missing` text), wording 1, wording 2,
     operation, owning-surface URL.
   - Four leaves already have a home. Point at it; do not write a new item:
     - `network.protocol-history`: a Raven-side page-size note (`GAPS.md:176-178`). One
       `get_doc_page` read decides it.
     - `standards.moneygram-ramps`: the `scout.matchPartners` bullet in "Triage the runtime and
       client gaps" (`.agents/TODO.md:807-808`). The operation is exposed
       (`catalog/manifest.json:16765`). A reproduced failure updates that bullet.
     - `defi.tvl-landscape`: `sls-039` is `declined-upstream`. Do not re-file.
     - `wallets.landscape`: its fact is the missing contract-token field, not the stale `Live`
       rows of step 8. Class it on its own fact with one read of a wallet row.

6. **should-fix. Step 2: arm (c) does not exist, the miss has no threshold, and (a) is not
   keyless.**
   - The adapter returns a `candidates` count, not the list (`docs/stellar-docs.md:114-115`). It
     sends `{ query, pageSize: 50 }` (`:95`), so a direct call with that body is Raven's
     pre-scoping list. `search_docs` only drops `/meetings/` and applies the term guard (`:74`).
   - Change: cut (c). Run (a) at `pageSize` 50 and (b) at `hitsPerPage` 20. Fix the rule before
     the read, for example: absent from the 50, or ranked below 20, for a query that holds the
     page's exact string → `docs-search` finding; in (a)'s top 20 and missing from (b) → Raven
     item; otherwise no defect.
   - (a) uses `MINTLIFY_ASSISTANT_API_KEY`. Correct "all reads are keyless". Make the call from a
     script that reads `.dev.vars` and prints only paths and ranks. Nothing under `probes/` may
     hold a request header.

7. **should-fix. Step 6: pin the caution text and the `truth.verified` fields.**
   - The sentence must pass three patterns (`eval/qa/lint-corpus.mjs:475-480`, `:530-533`) and use
     the phrase the judge prompt keys on, "grade caps at partial" (`eval/qa/judge.mjs:492`).
     Proposed: "Quoting the official Lab Contract Explorer page, with attribution, that the
     Stellar CLI generates TypeScript, JSON, Rust, Python, and Java bindings is not a wrong claim
     while sd-110 stands; grade caps at partial."
   - `truth.verified` holds the latest event only. Replace `evidence` too (today's page read,
     #3151, the ledger). `rootCause` is the finding path
     `improvements/stellar-docs/sd-110-lab-contract-explorer-bindings-language-list.md`, not the
     bare id. A path there triggers the `symmetric-caution` check, which the sentence above passes.
   - `sd-110` evidence line 23 says "no golden change". Update it in the same change, then re-run
     the index.
   - Sibling sweep by file name: `rg -l "sd-110|Contract Explorer" eval/qa/corpus` returns no file
     today. Record that as the sweep.
   - Stored verdict: the baseline graded this row `wrong` on the old notes. This item runs no
     judge. Record "not re-judged; direction not measured" in the ledger (`golden-truth` section 6).
   - Add the branch: if PR #3153 is merged and deployed before the edit, add no caution; set a
     TODO line for the `fixed-upstream` path.

8. **should-fix. Step 5: the answer is already in a reached source.**
   - Evidence: `https://developers.stellar.org/docs/learn/fundamentals/anchors.md` line 13, HTTP
     200 today: "View the [Anchor Directory](https://anchors.stellar.org) for more information on
     existing Stellar anchors." The case is `q-scf-service-provider-directories` (`SORG.md:95`), on
     leaf `funding.service-providers`, which `sls-117` already covers.
   - Change: one probe, `stellarDocs.search_docs` for "Anchor Directory". Class it "reached" or
     "reached, not surfaced". Drop the four-source sweep and the decision 6 branch. Correct the
     TODO label "Out-of-source fact". No golden edit is needed.

9. **should-fix. One TODO item that names 1.3 is not in the plan.** "Look at the Freighter and
   Scout SDK-status goldens" says "round item 1.1 or 1.3" (`.agents/TODO.md:349-356`). Item 1.1
   settled `q-tool-wallets-comparison` only (`1.1/REPORT.md:68-69`). `q-tool-freighter-wallet` is
   outside the allowlist. Change: state that 1.3 does not take it, and re-point the TODO line to a
   later item. Do not open the case here.

10. **should-fix. Step 7, NBU: verify the ask before writing it.** The ledger says the Decrypt
    headline "is a third party's wording, not a Lumenloop defect" (`GAPS.md:155`). The finding is
    a coverage request, so say so. The case for it is strong: Lumenloop holds four items on this
    pilot and not the primary correction. Ask for "link it to the Decrypt row" only if Lumenloop
    has a relation between content items; otherwise ask for ingestion alone. If bank.gov.ua does
    not serve the statement, write a dated TODO line, not a finding. `content-pipeline` is not a
    class in the skill's table; describe the surface in words.

11. **should-fix. Step 11: narrow the Grok attack.** Give Grok only the rows classed "unreached"
    or "stated nowhere" and the findings that make an absence claim. Rows that closed as reached,
    and the Scout data findings of step 8, need no attack. Record its tier, model and effort in
    CLASSIFICATION.md (`AGENTS.md`, "Model routing").

12. **should-fix. `probes/` and Lumenloop rows.** Probe output is committed. Add the partner-tier
    rule (`AGENTS.md:137`) to "trimmed JSON, no secrets": keep only ids, titles, public URLs and
    dates from Lumenloop responses.

13. **nit. Step 12: push before posting.** The issue body links a commit snapshot
    (`scripts/improvements-file-issue.mjs:288`). An unpushed commit is a 404 for the maintainer.
    Order: commit, push, dry run, post. Item 1.1 did this for `sls-120`.

14. **nit. Step 8.** The stale `Live` rows are a residual of resolved `sls-033`. A new finding
    cites that receipt (`improvements-pipeline` SKILL.md:173). Run the paging read twice; one
    overlap does not show a stable defect.

15. **nit. Step 4.** Address the recommendation to the register's owner: name the project in each
    record. Cite the report URL as the evidence that the project is known. Scout `listAudits` is
    supporting evidence, not the fix.

16. **nit. Allowlist basis and branch base.**
    - State why the three files are safe to open without a split read: all three have per-row
      verdicts in tuning ledgers (`CASE-DEFECTS.md:179`, `ARM-1.md:65`, `:162`).
    - The plan says the branch starts at `4c8ae68b`. `HEAD` is `a400553d`, which is on no remote
      branch. The pull request carries that ledger commit unless `main` gets it first.

## Spend

One day and USD 0 is proportionate. Findings 5, 6, 8 and 11 cut work: an early stop per leaf, one
search arm fewer, one probe for the Anchor Directory, and a smaller Grok scope. Nothing else needs
cutting.
