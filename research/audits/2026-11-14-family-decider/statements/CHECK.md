# Statement check

> Carried over from branch `exp/family-decider` (`.agents/rounds/2026-11-14-family-decider/statements/`) by the
> [family-decider record](../../2026-11-14-family-decider.md). `PLAN.md`, `PLAN-AMENDMENTS.md`, `REPORT.md`, and
> `source-families.b.mjs` stay on that branch. The "Final SHA-256" table below matches the two JSON files beside this
> one for those two files. Only its three relative links changed.

Lane `statement-check` (Claude Opus 5.5, fresh session, high effort), branch `exp/fd-st`,
2026-11-14. It ran the check in `PLAN.md` section 3 under amendment 8(a) of
`PLAN-AMENDMENTS.md`, on the outputs in `REPORT.md`.

## Result

| File | Records or strings verified | Corrected |
|---|---|---|
| `families.json` (`S1`) | 5 records, 10 strings (`grounds`, `notFor`) | 3 strings in 2 records |
| `endpoints.json` (`S2`) | 82 records | 2 records |
| `source-families.b.mjs` | 5 `line`, 5 `authority`, `FAMILY_LINE`, 3 `AUTHORITY_RULES` | 3 strings (`stellarDocs` line and authority, `stellarOrg` line), `FAMILY_LINE` |

Every other string matches its spec. The final hashes are under "Final SHA-256".

## Corrections and their evidence

1. **`scout.getSkill` promised what it cannot return** (`S2`). Before: "returns the entry's metadata
   and its full instruction text." After: "returns metadata and, for skills.stellar.org
   entries, the full SKILL.md text." Evidence: the manifest description returns "the complete
   raw SKILL.md text" only "for entries listed on skills.stellar.org". A live call confirmed
   this: `scout.getSkill({ name: "blend-sdk" })` (source `external`, kind `sdk`) returned
   `content: null`, and `anchors` (source `community`) returned 12,266 characters.
2. **`skills.stellar-dev.smart-contracts` left out the audit-review part it is primary for**
   (`S2`). Before: "... testing methods and a security checklist." After: "... testing methods,
   vulnerability classes and checklists." Evidence: the manifest skill description routes to
   `security.md` ("vulnerability classes, checklists, tooling, audits") and lists "reviewing,
   securing" as uses. The section `skills.stellar-dev.smart-contracts#file:security.md` exists.
   25 words.
3. **`stellarDocs` `grounds` left out wallets and dapps** (`S1`, and the arm B `line`). Added
   "wallets, dapps". Evidence: `stellarDocs.search_wallet_dapp_docs` (the Wallet SDK tutorial
   series, Build a Payment App, the passkey dapp, Freighter guides) and the `build` category of
   `stellarDocs.search_docs_in_category` ("apps/dapps"). 44 words.
4. **`stellarDocs` `notFor` favoured other families beyond their specs** (`S1`, and the arm B
   `authority`). Before: "Which projects, people, funding or audits exist (Scout, Lumenloop); SDF
   strategy and programs (stellar.org); tested step-by-step procedures (Skills)." After: "Which
   projects, people or funding exist (Scout, Lumenloop); audit records (Scout, stellar.org);
   SDF strategy (stellar.org); build and security playbooks (Skills)." Evidence, two points:
   - Audit records come from `scout.listAudits` and `stellarOrg.search_site` audit rows
     (`specs/stellar-org.json`, kind `audit` with `reportUrl`). No Lumenloop operation holds an
     audit register, and the old text left out stellar.org.
   - The docs do hold step-by-step procedure: `search_wallet_dapp_docs` returns "tutorial and
     guide sections", `search_soroban_contract_docs` covers getting started through deploy, and
     `search_sdk_cli_tools_docs` covers "the command sequence from new contract project to
     deployed contract". Telling a reader that docs cannot ground step-by-step procedure
     favoured Skills over the docs spec. The new wording names what Skills holds instead.

   SDF programs still appear in the `stellarOrg` `grounds`. 20 words.
5. **`stellarOrg` `grounds` gave the audit bank's name wrong** (`S1`, and the arm B `line`).
   "Soroban Audit Bank" became "Soroban Security Audit Bank", the name in
   `specs/stellar-org.json` (`search_site` description). 41 words.
6. **`FAMILY_LINE` left out wallet docs and security playbooks.** `stellarDocs=... SDK and
   anchor docs` became `SDK, wallet, anchor docs` (correction 3), and `skills=step-by-step
   build playbooks` became `skills=build and security playbooks` (corrections 2 and 4). To stay
   at 450 characters, two edits removed words without changing meaning: `SCF submissions and
   awards` became `SCF submissions, awards`, and `SDF's strategy` became `SDF strategy`.

## Checked and left unchanged

- `lumenloop.find_content_by_entity` leaves out "person". This is correct: the manifest catalog
  note says person lookups return empty groups even for well-covered people.
- `lumenloop.list_research` says "research and roundup pieces". A live call returned weekly
  roundups ("Stellar Weekly Roundup: Week of ...") with `id`, `title`, `format`, `status`, and
  `created_at`, as the statement says.
- `lumenloop.find_av_passages` says the rows carry the recording's title and link. A live call
  returned `title` and `url` on each row and no transcript text.
- `scout.getHackathon` "any stored event rules" matches the manifest: only DoraHacks events
  carry stored rules.
- The `stellarOrg` `notFor` clause "SDF blog, press and event posts (Scout, Lumenloop)" matches
  the spec's `filtered` rule. That rule drops `/blog`, `/press`, and `/events` rows because
  Scout and Lumenloop return them.
- The skill `purpose` lines were checked against the manifest's skill and skill-section
  entries. Each named part has a section: worked examples, templates, the testnet setup, the
  Scout API reference, the escrow API, the React SDK, and the Blocks components. The runnable
  digest has the input and output schema the line describes.
- Application development and audit coverage after the corrections:
  - Scout: repos and code answers, verified contracts, audit reports, cited audit passages.
  - Stellar Docs: contracts, SDK, CLI, RPC, wallets and dapps, anchors.
  - stellar.org: audit-bank records with report links.
  - Skills: contract writing, testing, security and upgrades.
  - Lumenloop: the spec grounds neither application development nor audits, so its text names
    neither.

  Scout `grounds` is at 45 of 45 words and was not changed.
- `AUTHORITY_RULES` were left as they are. Each rule follows from the `notFor` records and the
  deployed rules. None gives a family more than its spec supports.

## Budget and guard re-run

The re-run used the checks that `REPORT.md` names. It imported `estimateTokens`,
`validateFamilyPurposes`, and `assertGeneratedTextNoNonExposedRefs` from
`scripts/build-micro-map.mjs`. That last function also calls `assertNoNonExposedRefsInText`. The
micro-map was assembled the way `buildMicroMap` assembles it, with the manifest's family
counts. `SEARCH_DESCRIPTION` was rebuilt from the template in `src/mcp/tools.ts` with the arm B
`FAMILY_LINE`. Before the corrections, the re-run reproduced every number in the report.

| Budget | Limit | After correction |
|---|---|---|
| `grounds`, words | 45 | 41 to 45 |
| `notFor`, words | 20 | 15 to 20 |
| `purpose`, words | 25 | at most 25, all 82 |
| `S2` ids against the manifest's operation and skill entries, in order | equal | equal |
| `FAMILY_LINE`, characters | 450 | 450 |
| `SEARCH_DESCRIPTION` with the arm B line, characters | 2,048 | 2,035 |
| Micro-map estimate, tokens (characters / 4) | 770 | 765 (3,060 characters) |
| `validateFamilyPurposes` | pass | pass |
| `assertGeneratedTextNoNonExposedRefs` | pass | pass on every `S1` and `S2` string, the arm B micro-map, and `FAMILY_LINE` |

The code caps the micro-map at 700 tokens: `MICRO_MAP_MAX_TOKENS` in
`scripts/build-micro-map.mjs`. The report already flags this. The arm B harness still has to
raise the cap to 770.

## Files opened

- Round files: `PLAN.md` section 3, all of `PLAN-AMENDMENTS.md`, `statements/REPORT.md`, and
  the three statement files.
- `catalog/manifest.json`, read by script. For every operation and skill entry: description,
  input parameters and enums, output keys, and `cardCaveat`. For every skill-section entry: the
  id and the first 110 characters of its description.
- `specs/stellar-org.json`: the header, the backend constraints, and both operations.
- `ecosystem-skills/catalog.json`: the head and the source and kind of each entry. This only
  picked a non-registry entry for the probe.
- For the checks: `scripts/build-micro-map.mjs`, `scripts/emitted-text-guard.mjs` (head),
  `src/mcp/tools.ts` (the `SEARCH_DESCRIPTION` template), and the first lines of
  `scripts/catalog-data/source-families.mjs`.

Not opened: anything under `eval/`, `research/`, or `docs/`, any question set or label file,
`ecosystem-skills/README.md`, `ecosystem-skills/PIN-REVIEW.md`, `REVIEW.md`, `briefs/`, and any
other worktree. The Raven connector's server instructions, which carry the deployed micro-map,
were in this session's context from the start, as they were for the statement lane.

## Live read-only calls

One `execute` script on the deployed Raven connector made four free calls:
- `lumenloop.list_research({ limit: 4 })`
- `lumenloop.find_av_passages({ query: "soroban smart contracts", limit: 2 })`
- `scout.getSkill({ name: "blend-sdk" })`
- `scout.getSkill({ name: "anchors" })`

The arguments are my own generic words, not taken from any question set.

## Final SHA-256

| File | SHA-256 |
|---|---|
| `families.json` | `e9f13381d70fcf692a34526a88240058a3577aaf16753148cf778bfd41d6aa9f` |
| `endpoints.json` | `2c285b2062d9212f3121ec3973a196eb3340c8299ee94c5a7ad8eb9f76672aa8` |
| `source-families.b.mjs` | `e760bcc1990e58a5d9f4b0aa1ebd1d763a38e92894aa16998f0fec574229a1ee` |

These hashes are the ones to freeze in the round ledger.
