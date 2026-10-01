# Independent review — rev-fable (product, docs, and upstream text)

Reviewer: Claude Fable 5.1, high. Author and orchestrator: Claude Opus 5.5. Reviewer differs from both.
Date: 2026-09-30. Tree: `2f79caab` (`origin/main` = `f65e165d`, plus the uncommitted ledger addendum).
Mode: read-only. Live probes: `curl`, `gh api`, the Raven production MCP, and the free repo gates.

## Verdict

`accept with fixes`. The merged docs, the golden refresh, and the audit's numbers are correct; the new
"Adding a source" section misstates three things the Trustless Work PR really did, and the sk-027 finding
misses one live fact and three stale locations an upstream maintainer will trip over.

## Findings

### F1 — should-fix — `ecosystem-skills/README.md:181-183` — admission bar contradicts the worked example

**What is wrong.** Bullet 3 of the admission bar says credentialed steps "are out of scope or scrubbed,
never served as instructions." The worked example serves them. The pinned Trustless Work skill
(`80e2467f`, `SKILL.md:68` and `:129`, `skills/api/core-concepts.md:76-88`, `skills/api/*-escrow.md:21-23`)
instructs `x-api-key: YOUR_API_KEY` on every request and tells the reader how to generate a key. The
scrub (`src/skills/scrub.ts:41`, `:95`, `:166`) removes only retired-skill and non-exposed Scout operation
references. It never removes credential or network steps. `PIN-REVIEW.md` records the vendor npm-install
prompts as "bounded risk accepted", not scrubbed.

**Evidence.** `curl https://raw.githubusercontent.com/Trustless-Work/trustlesswork-skill/80e2467f…/trustless-work-dev/SKILL.md | grep -n x-api-key` → lines 68, 129.

**Fix.** Replace the bullet with the real bar: "The skill may describe credentials, paid calls, writes, or
network fetches that the reader performs in their own environment. It must not instruct the model to act
against Raven's non-exposed operations or retired skills; `src/skills/scrub.ts` removes those references at
read time. Record any remaining supply-chain or credential prompts in `PIN-REVIEW.md` as accepted risk."

### F2 — should-fix — `ecosystem-skills/README.md:190-191` — "code changes are needed only for a new repo layout" is false for PR #157

**What is wrong.** PR #157 (`58954b67`) changed six count-contract tests and one gate baseline that
every new source will move: `test/catalog.test.ts` (whole-skill 19→20, sections 174→202, entries
253→282), `test/skills.test.ts` (`checked` 193→222), `test/search.test.ts` (candidate pool 79→66),
`test/skill-exposure-classification.test.ts` (required inventory row), `test/qa-lifecycle.test.mjs`
(501), the demo sample-trace match total, and `eval/gates.json` (catalog fingerprint). It also added a
host description override in `scripts/description-notes.mjs` and a search-admission change in
`src/catalog/skill-search-admission.ts`. Step 5 points at `live-drift-resolution` Step 1, which says the
tree should touch "only generated artifacts" and treats `eval/gates.json` edits as exceptional.

**Fix.** In step 1 or 5, add: "Expect the count contracts to move: `test/catalog.test.ts`,
`test/skills.test.ts`, `test/search.test.ts`, `test/skill-exposure-classification.test.ts` (add the new
id to the required rows), the demo trace totals, and the `eval/gates.json` catalog fingerprint. A routing
or description-note change is a separate decision with its own routing comparison, as in PR #157."

### F3 — should-fix — `ecosystem-skills/README.md:186,199-200` — step 6 understates two hard gates

**What is wrong.** "Add at least one golden or skills-routing case" reads as optional and as either/or.
It is neither. CI runs `npm run eval:qa:lint -- --stale --enforce-floors` (`.github/workflows/ci.yml:103`)
and `eval/qa/lint-corpus.mjs:628-630` errors on `skill floor 1; found 0` for every exposed skill, so an
active battery case is mandatory; a skills-routing case does not satisfy it. Second, the new id must be
committed as `proposed` in an earlier commit than its activation (`eval/qa/lifecycle.mjs:298`; the
compile anchors the previous registry at `HEAD^`, `eval/qa/compile-qa.mjs`). PR #164 landed the proposal
before PR #157 activated it, and the independent review had to say so explicitly
(`.agents/rounds/2026-09-16-trustless-work/independent-review.md`, "Activation in this candidate is
required for a mergeable tree"). "Steps, in one PR" hides this ordering.

**Fix.** Rewrite step 6: "Land one QA battery case per new skill. CI enforces `skill floor 1` per exposed
skill. Commit the case as `proposed` first, then activate it in a later commit with an independent
reviewer (`golden-truth` lifecycle rules). A skills-routing case in `eval/skills-cases.json` is additional,
not a substitute."

### F4 — should-fix — `ecosystem-skills/README.md:194-195` — step 3 omits `unpinnedUpstream`

**What is wrong.** For a cherry-picked source, `check-skills-drift.mjs` fails when any upstream sibling
directory is neither pinned nor listed under `groups.json` `unpinnedUpstream` (the file's own
`_unpinnedComment`). PR #157 added `trustless-work: { scripts }` and a later pin added `.github`. Step 3
only says "file the new skills in `groups.json`."

**Fix.** Append to step 3: "and list every unpinned sibling directory under `unpinnedUpstream` with a
reason, or the drift check fails."

### F5 — should-fix — `improvements/skills/sk-027-scout-skill-stale-skills-catalog.md:34-41` and issue #14 — the "five places" list is incomplete, and one live fact is missing

**What is wrong.** At `3b587aa9` the same stale list also appears at `SKILL.md:90`
("Soroban / dapp / assets / data / agentic-payments / zk-proofs / standards") and the README's install
list at `README.md:76-78` names `skills.stellar.org/soroban` and `skills.stellar.org/anchors`. `anchors`
is not an SDF skill on any surface. `improvements-pipeline` asks the filer to "grep adjacent and repeated
prose for the same claim so the smallest fix does not leave another page or later paragraph
contradictory." Step 5 of the recommendation ("Check `README.md` and `references/examples.md`") does not
name these lines, and `SKILL.md:90` is not mentioned at all.

Separately, the finding says "the removed `soroban` slug" and "the canonical slug is `smart-contracts`."
Both are true for `stellarlight.xyz/api/skills` and for `stellar/stellar-dev-skill`. But the Scout skill
tells users to install from `https://skills.stellar.org/skills/{name}/SKILL.md`, and that path still
serves `soroban`:

```
https://skills.stellar.org/skills/soroban/SKILL.md          -> 200 text/markdown, frontmatter name: soroban
https://skills.stellar.org/skills/smart-contracts/SKILL.md  -> 200 (body identical except lines 2-3)
https://skills.stellar.org/  index                          -> lists smart-contracts, does not list soroban
https://skills.stellar.org/skills/anchors/SKILL.md          -> 404
```

A maintainer who checks the install URL first will see `soroban` work and may push back. The issue does
not pre-empt that.

**Fix.** In the finding: add `SKILL.md:90` and `README.md:76-78` (`soroban`, `anchors`) to Evidence, and
add one evidence line: "`skills.stellar.org/skills/soroban/SKILL.md` still returns 200 as an unlisted
legacy copy; the index and the `/api/skills` catalog both use `smart-contracts`." Owner action on the
issue (outward-facing, not done by this review): one comment with those two facts, or leave it for the
maintainer's reply.

### F6 — should-fix — `ecosystem-skills/update.sh:36` — stale catalog count the audit missed in a file it edited

**What is wrong.** The header still says the directory snapshot has "≈30 ecosystem entries". Live and
snapshot both hold 43 (`node scripts/check-skills-drift.mjs` → `43 entries ok`;
`GET /api/skills` at 2026-09-30T19:56:19Z → `counts.total 43`). PR #183 fixed line 18 of the same header
and left line 36.

**Fix.** Replace "≈30 ecosystem entries across sources/kinds" with "entry count in `INDEX.md`", matching
the README fix.

### F7 — should-fix — [`.agents/NEXT.md:153-162`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) — decision K omits the bar's duplication criterion and the repo's idle state

**What is wrong.** Decision K is framed fairly on what it states: twelve skills (verified:
`skills/*/SKILL.md` = 12 at `main`), MIT (verified via `gh api`), entered the snapshot in PR #43 on
2026-07-27 (verified: `42be531d`, 2026-07-27). The name-level guesses hold up on a body read:
`scf-round-reviewer` needs an Airtable CSV in `data/` and `fetch-external-doc` runs `curl -sL` against
Google Docs. But the README's own admission bar has four criteria and K tests only one (read-only fit).
It does not mention that `skills.lumenloop.scf-submission-radar` and `skills.stellar-light.stellar-scout`
already cover SCF positioning and pitch drafting, which is the "do not duplicate an exposed skill"
criterion. It also does not record that the upstream repo's last push was 2026-07-23 (`gh api …
pushed_at`), which bears on whether a pin would go stale. Neither changes the safe default.

**Fix.** Add two sentences to K: "Overlap to resolve: `lumenloop/scf-submission-radar` and
`stellar-light/stellar-scout` already cover SCF positioning and pitch drafting. Upstream last pushed
2026-07-23." Also note the source layout is the standard `skills/` mode, so no `update.sh` code change is
needed.

### F8 — nit — `ecosystem-skills/README.md:203` — the "recorded decision" sentence does not name where K lives

The sentence says a non-admitted candidate needs a decision "in `.agents/TODO.md` or a round ledger."
Decision K is in [`.agents/NEXT.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md), which `.agents/README.md` names as the home of open owner decisions.
Add [`.agents/NEXT.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) (owner decisions) to the sentence.

### F9 — nit — `.agents/rounds/2026-09-30-skill-system-audit.md` — the deploy id is only in the brief

The brief cites production deploy `c4d27b61-e0f0-47a4-a6fe-6ce298fb1b81`; the ledger addendum says
"after the merge and deploy of PR #183" without the id or a live check. Verified read-only:
`npx wrangler deployments list --name stellar-raven-codemode` shows the newest deployment created
2026-09-30T19:49:09.958Z with version `c4d27b61-e0f0-47a4-a6fe-6ce298fb1b81` at 100%. Record the id and
the check in the ledger's Outcome or review section.

### F10 — nit — [`.agents/NEXT.md:3`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) — header stamp not refreshed

PR #183 edited items 1 and 3 and added decision K, but the file still says "Updated 2026-09-17". Bump to
2026-09-30 and name this round.

### F11 — nit — issue #14 body — evidence is stated twice

The filer renders the Markdown `Evidence` section and then appends the frontmatter list as "Additional
recorded evidence", so the maintainer reads each fact twice. This is the filer's template
(`scripts/improvements-file-issue.mjs:275-277`), not this finding. If the owner wants shorter issues,
keep frontmatter evidence to the durable probes and put the location list only in the body.

### F12 — nit — `ecosystem-skills/update.sh:25` — "Solo todo 825" in a live script header

The reference is dated provenance inside a comment, so it does not break the AGENTS.md rule against
adding live Solo paths. It is still a retired tracker id in an operational file. Optional: reword to
"retired 2026-07-03 (`RETIRED_ONBOARDING_SKILLS`, `scripts/exposure.mjs`)".

## Additional work

1. `simple` — Apply F1–F4 to "Adding a source" in one edit, then re-read it against PR #157's file list
   (`git show 58954b67 --stat`) as the acceptance check.
2. `simple` — Update sk-027 evidence per F5 and re-run `npm run improvements:index` and
   `npm run improvements:lint`. Whether to comment on issue #14 is the owner's call.
3. `simple` — Fix `update.sh:36` (F6), [NEXT.md](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) header (F10), and the README decision sentence (F8).
4. `needs-decision` — Decision K: read the twelve SCF bodies against all four admission criteria and
   record the overlap verdict (F7). Two of the twelve fail on a name read alone; the other ten need a
   body read, and `scf-live-context` maps cleanly onto `scout.getRfps`/`scout.searchResearch`.
5. `needs-decision` — `ecosystem-skills/README.md:155` cites "EVALS.md rule 1" with no path. The file is
   `eval/EVALS.md` and rule 1 is "One headline, two gates". Link it as `../eval/EVALS.md`.
6. `simple` — `eval/plan/coverage-rules.json:97` now lists five kinds; the live `meta.validKinds` has
   six (`agent-kit` is valid with zero entries). The text describes observed kinds, so it is not wrong.
   Consider "kinds per `meta.validKinds`" to stop the list from dating.
7. `needs-decision` — `THIRD-PARTY-NOTICES.md` says the retired-skill scrub "affects 7 LumenLoop files and
   1 Stellar Light file". I found no test pinning that count. Unverified here; either pin it in a test or
   drop the numbers.

## Checked and correct

- **Pinned Scout text (sk-027).** At `3b587aa9` (upstream `main` HEAD, committer date 2026-09-08):
  `SKILL.md:14`, `:240`, `:241`, `:312`; `references/api-reference.md:189` ("~30 entries", "the 7
  official SDF skills") and `:194` ("Full content of one SDF skill"); `README.md:64`;
  `references/examples.md:20` ("Also recommend `soroban`"). All eight quotes match byte-for-byte.
- **Live API (2026-09-30T19:56:19Z).** `GET /api/skills` → 43 entries, `bySource` sdf 8, stellarlight 15,
  lumenloop 8, external 12, community 0; sdf slugs exactly `agentic-payments, assets, cross-chain, dapp,
  data, smart-contracts, standards, zk-proofs`. `/api/skills/soroban` → 404 `unknown skill: soroban`.
  `/api/skills/smart-contracts` → 200. `.meta.counts` exists, so the recommendation's pointer is valid.
- **Recommendation's content claim.** `/api/skills/{name}` returns `skill.content` for `skill-md` entries
  from sdf (9057 chars), stellarlight (`stellar-scout` 34541, `scf-budget-builder` 5001), and lumenloop
  (8465); it returns no content for `mcp-server` and `sdk` entries. "Full content for sources that ship a
  SKILL.md, metadata only otherwise" is the smallest true description and matches upstream's own
  `api-reference.md:189`.
- **Raven production.** `scout.getSkill({ name: "soroban" })` → `soft-empty`, status 404.
  `codemode.skill.read("skills.stellar-light.stellar-scout")` served all four stale phrases from the
  finding. Twenty-two varied `codemode.search` queries surfaced exactly 20 `skills.*` ids, equal to the
  manifest's `skill: 20`; `catalog/manifest.json` counts are `operation 60, skill 20, skill-section 202`.
- **Dedupe.** `gh api repos/Stellar-Light/stellar-scout/issues?state=all` shows 14 issues; none other than
  #14 concerns the skills catalog description. #8, #11, #12 are the resolved sk-008/sk-018/sk-009 lineage.
- **Issue #14 body.** Opens with the automation notice and `generated-by-stellar-raven` marker, keeps all
  five sections, links the public file and the immutable `f65e165d` blob, and ends with the handoff. Title
  and first paragraph state surface and defect without eval ids. Sentences meet the writing-style rules.
  The frontmatter now carries the issue URL and status `reported-upstream` (commit `2f79caab`).
- **Intake.** `improvements/intake.json` `services.skills.default.repos` and `sourceRepos` hold the five
  source repos; the sk-027 override targets `Stellar-Light/stellar-scout`, which the pipeline skill names
  as the Scout skill owner. Step 2 of "Adding a source" matches PR #157's intake diff.
- **Pins and snapshot.** `node scripts/check-skills-drift.mjs` → all five sources `ok`, catalog `43
  entries ok`, exit 0. `node scripts/check-mirrors.mjs` → `mirror checks ok`.
  `node scripts/check-pin-review.mjs --base origin/main` → no pin moved. `MANIFEST.json` `skill_count 21`
  with `lumenloop-mcp-connect` retired from serving, so 20 served matches `INDEX.md` (21 pinned).
- **README count fixes.** `stellar-dev` row lists the eight slugs that `stellar/stellar-dev-skill`
  `skills/` holds at `main` (verified via tree listing) and at the pin `65375fd2`. `INDEX.md:72` carries
  "43 entries", so "count in `INDEX.md`" resolves.
- **`research/skill-exposure-inventory.md` note.** JSON `currentState` counts today: exposed 20,
  internal-guidance 2, removed 7, excluded-duplicate 7, out-of-scope-operational 10. The two added rows
  are `skills.stellar-dev.cross-chain` and `skills.trustless-work.trustless-work-dev` (the JSON itself
  dates the latter 2026-09-15). 28 references to `ecosystem-skills/skills/` remain, as the ledger says.
- **AGENTS.md.** `.agents/skills/` holds eight skills; the runbook list now names all eight, and the
  `retrieval-system-audit` line matches its frontmatter description.
- **[NEXT.md](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) item 1 and 3, TODO.md.** `inventory/stellar-light.json` `openapiVersion 1.9.54`; the
  2026-09-29 ledger records PR #182 merged and deployed. The narrowed TODO item quotes the freshness
  review's Case 5 sibling note (board seat, `q-defi-x402-on-stellar-what`, 2026-07-10) and Case 6 sibling
  note (114 vs 183 builders, `q-gap-builders-person-empty`) exactly. Ledger pointer resolves to
  `rounds/2026-09-29-truth-maintenance.md`.
- **Golden refresh, re-derived live (2026-09-30T19:58:44Z).** `cookbook/contract-assets` → 404;
  `cookbook/deploy-stellar-asset-contract` → 200 with `stellar contract asset deploy`; `docs/tools/lab` →
  200 naming Friendbot, Futurenet, and simulate; `lab/transactions` → 200 with "Fetch next sequence" and
  "Add Operation"; `lab/saved/keypairs` → 200; `quickstart` → 200 with "not intended for production";
  `lab.stellar.org/account/saved` loads `page-dbc03db5d85268bb.js`. `gh api` on `stellar/laboratory`
  (`main`): latest commit touching `jsonCipher.ts` and `localStorageSavedKeypairs.ts` is `624d40ff29ca`
  2025-09-04. Local `stellar 28.1.0 (c0f4d0da891b)` help text matches the new class-F row verbatim.
- **Golden-truth compliance.** No judge-facing field moved (diff touches only `truth.*`). `verified` is
  the latest event only, with `rootCause: ["freshness-drift"]`, an allowed explicit value
  (`eval/qa/README.md:102`, `lint-corpus.mjs:443`). `reverifyBy` 2026-12-31 is quarter-granular; seven
  cases share that date and the Q4 queue is spread across 29 dates, so it does not cliff. Sibling sweep
  recorded. Register re-close reasons match what I re-derived.
- **Gates on this tree.** `npm run eval:qa:lint -- --stale` → `0 error(s), 62 warning(s)`;
  `npm run improvements:lint` → `improvements lint ok (64 findings)`; `npm test` → 2185 passed, 4
  skipped, exit 0.
- **Deploy.** Newest deployment version `c4d27b61-e0f0-47a4-a6fe-6ce298fb1b81`, created
  2026-09-30T19:49:09.958Z, 100% (`wrangler deployments list`, read-only).
- **Trustless Work round records.** `source-review.md`, `independent-review.md`, and
  [`final-metadata-review.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-16-trustless-work/final-metadata-review.md) support steps 1, 2, 3, 4, and 7 of "Adding a source" as written; only the
  items in F1–F4 diverge.
