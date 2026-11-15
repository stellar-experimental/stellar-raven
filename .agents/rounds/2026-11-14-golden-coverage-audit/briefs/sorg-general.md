# Lane brief: sorg-general (is the stellar.org source general, or fitted to the goldens?)

Branch `feat/stellar-org-source` (PR 439, held). The owner's question: the source was designed from
three golden gaps and tested on queries derived from them. Does it serve a general-purpose Stellar
service, "especially application development and audits"? Do not read any golden case or
`eval/qa/corpus/` file in this lane. No model-calling eval commands, no deploy, no upstream posts.

## What the orchestrator found after the review (2026-11-14, live)

- The keyless search returns more kinds than the adapter keeps: `audit` rows (title "Project -
  Firm", `url` = the external audit report, `isExternal: true`), `tutorial` rows, `partner` rows.
  The adapter drops external rows and partner rows, so it throws away the audit register.
  "Certora" returns ten audit rows; "Blend Certora" returns Blend-related rows.
- The keyless search matches title, description and tags, not body text: "transformational
  enterprises" (body text of `/foundation/strategy`) does not return that page.
- SDF's Algolia index `pages` holds section records with full body text; it needs a search-only key.

## Work

1. Write a query set of 40 realistic questions that a developer, auditor, founder or analyst would
   ask and that stellar.org plausibly holds: at least 12 on audits and security (who audited X,
   which firms, where is the report, what the Audit Bank covers), at least 12 on application
   development (tutorials, tools, products such as Disbursement Platform or Anchor Platform, case
   studies), the rest on SDF programs, policy, learn pages and partners. Derive them from the site
   itself (sitemap, page titles, the kinds the search returns) and from `eval/qa/taxonomy.json` leaf
   names only. For each, name the stellar.org page or record that answers it (find it by browsing,
   not by the search under test). Save as `research/services/stellar-org-queries.json`.
2. Measure the keyless search on the set: for the natural question and for a short keyword form,
   record whether the answering row is in the top 5 and top 10, and what kind it is. Then measure
   what the current adapter returns for the same queries. Report the gap between the two.
3. Change the adapter so that nothing the site returns for a real question is thrown away without
   a reason: keep `audit` rows (project, firm, report URL as a field the model can cite; the page
   read stays fixed to stellar.org) and `tutorial` rows; decide on partner rows from the
   measurement, not from taste. Keep the blog, press and events filter only if the measurement
   shows other sources return those pages for the same questions; otherwise say so.
4. Re-measure, update tests and fixtures, re-run the routing gate and the gates in
   `briefs/stellar-org-source.md`.
5. Write the body-text misses (queries where the answer is on a page but the keyless search cannot
   find it) as a list in the report: that list is the case for or against the Algolia index, which
   the orchestrator will test on the same query set.

## Output

`.agents/rounds/2026-11-14-golden-coverage-audit/decisions/SORG-GENERAL.md`: the numbers first
(top-5 and top-10 recall by topic group, raw search versus adapter, before and after), then what
you changed, the body-text miss list, gate exit codes, and what you could not verify. Commit and
push.
