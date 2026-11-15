# Lane brief: sorg (add stellar.org as a Raven source)

You are the author. Read `AGENTS.md`, `ARCHITECTURE.md` (catalog, adapters, exposure), ADR-0003,
`docs/stellar-docs.md`, and the Stellar Docs adapter and spec as the pattern to mirror. A different
model reviews your diff. Branch `feat/stellar-org-source` from `origin/main`; commit as you go; push
when done. Never `--no-verify`. No deploy. No model-calling eval commands. No upstream posts.

## Why

Golden cases on three taxonomy leaves miss for one reason: the fact lives only on a `stellar.org`
page that no Raven source holds (`.agents/TODO.md`, "Decide whether stellar.org pages outside Docs
belong in a Raven source"; `ecosystem.strategy-roadmap`, `security.audit-registry`,
`funding.service-providers`). The owner wants the source, provided it does not muddy other results.

## What the orchestrator measured (2026-11-14)

- `GET https://stellar.org/api/search?q=<query>&locale=en` is the site's own keyless search. It
  returns `{query, locale, results:[{id, kind, title, description, tags, url, isExternal}]}`, at most
  10 rows, kinds `page` and `partner`. A missing `q` returns 400 `invalid_query`.
- It ranks `/foundation/strategy` in the top two for "SDF strategy", `/ecosystem/service-providers`
  first for "service providers directory", `/audit-bank/projects` third for "audit bank projects",
  and `/foundation/roadmap` first for "roadmap".
- Pages are server-rendered: the `<main>` text of those three pages holds the facts (4,295, 4,806
  and 1,133 characters after tag stripping; the audit page lists "77 Results").
- The Sanity dataset behind the site is private; a Sanity token would expose drafts. SDF's Algolia
  index needs a secret. Use neither: the keyless endpoint plus a page read needs no credential.
- 707 of the 1,244 sitemap URLs are `/blog` and `/press`; 350 are `/events`. Scout and Lumenloop
  already hold blog and press content.

## Build

A new source family `stellarOrg` with two operations, mirroring the Docs pair:

1. `stellarOrg.search_site({ query, limit? })`: calls the keyless search, drops rows whose path
   starts with `/blog/`, `/press/` or `/events/` (other sources own those) and external rows, and
   returns compact rows (title, description, path, kind, tags).
2. `stellarOrg.get_page({ path })`: fetches `https://stellar.org<path>` host-side and returns the
   main text. Fixed origin; validate the path; refuse a redirect that leaves the origin; cap the
   response size; strip scripts and styles; keep headings and list structure readable.

Requirements:
- Host adapter owns all traffic. No secret, no new binding. `globalOutbound` stays `null`.
- The standard envelope: `ok`, `data`, `asOf`, `asOfBasis`, and the `no-rows` caveat on an empty
  search; errors and soft-empty stay distinct. Send a plain generic User-Agent.
- Catalog, manifest, spec, inventory, the source micro-map in the MCP instructions, and docs are
  updated through their scripts (`scripts/README.md`); never hand-edit a generated file.
- Authority wording for the micro-map: SDF's own site; primary for SDF strategy, roadmap, programs,
  service-provider and audited-project directories, and SDF's public statements; not for protocol
  behaviour (Docs own that) and not for blog, press or events (Scout and Lumenloop own those).
- Unit tests for both operations (fixtures, not live calls), the path guard, the prefix filter, and
  the envelope. Extend the drift/inventory machinery only as far as the existing pattern requires.
- Keep it small. No options beyond those above, no cache layer, no compatibility shim.

## Prove it does not muddy routing

- Run the routing gate (`run-evals` skill names the free, deterministic command) before and after.
  It must stay green; report any query whose top operation changed.
- Retrieval check, free and read-only: for the three leaves' cases (find them by leaf in
  `eval/qa/corpus/battery/`), show that `search` surfaces a `stellarOrg` operation for the question
  and that the two calls return a passage supporting each key fact. Record misses honestly.
- Pick ten unrelated questions across other domains from `eval/qa/sample.json` and show the top
  five `search` results are unchanged, or explain each change.

## Gates

Bare, from the repo root, with exit codes recorded: `npm run typecheck`, `npm test`,
`npm run build`, `npm run test:smoke` (you touch the executor path), the catalog and eval gates the
"Checks" table in `CONTRIBUTING.md` maps to the areas you touched, `npm run secrets:scan -- --tree`.

## Output

Write `research/services/stellar-org-site.md` (dated measurements and the design, in the style of
`research/services/stellar-docs-mintlify.md`, short) and
`.agents/rounds/2026-11-14-golden-coverage-audit/decisions/SORG.md`: what you built, the routing and
retrieval evidence, gate exit codes, every deviation from this brief and why, and what you could
not verify. If the measurements show the source should not ship, stop and say so instead.
