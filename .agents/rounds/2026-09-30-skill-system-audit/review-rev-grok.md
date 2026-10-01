# Independent review — rev-grok

Lane: live re-derivation and assumption attack.
Reviewer: Grok 4.7. Author and orchestrator: Claude Opus 5.5.
Scope: merged PR #183 (`f65e165d`, parent `605c15584ba88b2cfc9d7d7a14a1655caa62397c`), finding `sk-027`, and the 2026-09-30 skill-system audit.
Probe window: 2026-09-30T20:03Z through 2026-09-30T20:07Z, plus a recount in the same review.
This review does not use the author's evidence notes as proof. Each claim below was re-derived from the pin, the live API, the docs pages, or the repository.

## Verdict

Accept with fixes: the skill-pin bytes, the 20 exposed skills, the 202 skill sections, the 43-entry Scout catalog, production version `c4d27b61-e0f0-47a4-a6fe-6ce298fb1b81`, and the core `sk-027` API facts check out, while the finding omits live stale lines and its first fix hardcodes a new roster, and the golden refresh stamps `2026-09-30` over a Quickstart `/lab` sentence the current Quickstart tree does not support.

## Findings

### 1. should-fix — `sk-027` omits live stale lines, and the recommendation conflicts with itself

Location: `improvements/skills/sk-027-scout-skill-stale-skills-catalog.md:51-58` and https://github.com/Stellar-Light/stellar-scout/issues/14

The cited lines at `Stellar-Light/stellar-scout` commit `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6` are true.
`SKILL.md:14` and `SKILL.md:312` list seven names and include `soroban`.
`SKILL.md:240-241` calls `/api/skills` an SDF catalog and `/api/skills/{name}` the full content of one SDF skill.
`README.md:64` says "7 official skills".
`references/examples.md:20` says "Also recommend `soroban`".
`references/api-reference.md:189` says "~30 entries" and lists the same seven names.
`references/api-reference.md:194` says "Full content of one SDF skill".

The live catalog shape is also true.
`GET https://stellarlight.xyz/api/skills` at 2026-09-30T20:03:07Z returned HTTP 200.
`meta.generatedAt` was `2026-09-30T19:56:20.244Z`.
`meta.counts` was returned 43, total 43, bySource sdf 8, stellarlight 15, lumenloop 8, external 12, community 0.
The sdf slugs were `agentic-payments`, `assets`, `cross-chain`, `dapp`, `data`, `smart-contracts`, `standards`, `zk-proofs`.
`GET /api/skills/soroban` returned HTTP 404 and `{"error":"unknown skill: soroban"}` (88 bytes).
`GET /api/skills/smart-contracts` returned HTTP 200, source `sdf`, `content` length 9057.
`GET /api/skills/cross-chain` returned HTTP 200, source `sdf`, `content` length 9270.
`GET /api/skills/stellar-scout` returned HTTP 200, source `stellarlight`, `content` length 34541.
The author's earlier generation time `2026-09-30T19:24:07.210Z` is an older response with the same counts.
This probe did not fetch that exact generation.

The finding's location list is incomplete. The same pin also contains:

- `SKILL.md:90`: "Soroban / dapp / assets / data / agentic-payments / zk-proofs / standards". The display name is Soroban. The list omits `cross-chain`.
- `README.md:76`: `skills.stellar.org/soroban`.
- `README.md:78`: `skills.stellar.org/anchors`. A search for `soroban` misses this third bad slug.
- `references/examples.md:30` and `:32` already name `smart-contracts` and its `SKILL.md` URL. Line 20 of the same file still says `soroban`.

`references/api-reference.md:189` is already a merged multi-source description.
It names Stellarlight, lumenloop, and external skills.
It already says `/api/skills/{name}` returns full `SKILL.md` content for sources that ship one, and metadata otherwise.
It already points at `.meta.counts.bySource`.
The defects on that line are the "~30" count and the seven-name list.
Line 194 contradicts line 189.
A maintainer who treats line 189 as an SDF-only sentence will rewrite a paragraph that is already partly correct.

The first recommendation sentence says to replace `soroban` with `smart-contracts` in every list and add `cross-chain`.
That writes a new fixed roster of eight names.
The later sentence says to remove fixed counts or point at `.meta.counts`.
Those two instructions conflict.
The live `.meta.counts` object has `returned`, `total`, and `bySource`.
A hardcoded 43 or 8 will go stale the same way 7 and ~30 did.

`soroban` is absent from the Scout API, from the `stellar/stellar-dev-skill` tree, and from the official card list.
`GET https://api.github.com/repos/stellar/stellar-dev-skill/contents/skills/soroban` returned `404 Not Found`.
`site/src/data/skills.ts` at main lists eight `source` paths (`skills.ts:84-133`): smart-contracts, dapp, assets, data, agentic-payments, zk-proofs, standards, cross-chain.
It has no `soroban` card and no `anchors` card.
These public URLs still differ from that tree:

- `https://skills.stellar.org/skills/soroban/SKILL.md` returned HTTP 200 on 2026-09-30T20:07:33Z (71331 bytes, `last-modified` Wed, 23 Sep 2026 16:35:50 GMT, body starts `name: soroban`).
- `https://skills.stellar.org/skills/smart-contracts/SKILL.md` returned HTTP 200 (9103 bytes).
- `https://skills.stellar.org/skills/cross-chain/SKILL.md` returned HTTP 200 (9336 bytes).
- `https://skills.stellar.org/skills/anchors/SKILL.md` returned HTTP 404.
- `https://skills.stellar.org/soroban` returned HTTP 404.
- The HTML pages `/skills/soroban/`, `/skills/smart-contracts/`, `/skills/anchors/`, and `/skills/cross-chain/` returned HTTP 404. An HTML 404 is site routing. It does not prove the raw `SKILL.md` is gone.

`GET /api/skills/anchors` also returned HTTP 404 and `unknown skill: anchors`.

Issue 14 is open. User `kalepail` created it at `2026-09-30T19:53:24Z`. Labels are empty. The repository label list is `bug`, `documentation`, `duplicate`, `enhancement`, `good first issue`, `help wanted`, `invalid`, `question`, `wontfix`. It has no `raven` label, so an empty label set matches `.agents/skills/improvements-pipeline/SKILL.md` (the filer applies `raven` only when the target exposes it). The issue body carries Finding, Evidence, Recommendation, Source Record, and Resolution Handoff. Leave the open issue without a new comment. The silence rule in that skill covers an untouched issue.

Exact fix: search the pin for `soroban` and for `anchors`. Delete enumerated SDF rosters and fixed counts. Point readers at `.meta.counts`. Keep the slug `smart-contracts` only where a concrete slug is required (`references/examples.md:20` and `README.md:76`). Replace `README.md:78` `anchors` with a live slug or delete that bullet. Tell the maintainer that `references/api-reference.md:189` is already multi-source, and that line 194 is the sentence to correct. State that `https://skills.stellar.org/skills/soroban/SKILL.md` still serves the old body. Do not write 43 or 8 into the skill.

### 2. should-fix — the golden `asOf` covers a Quickstart `/lab` sentence the current tree does not support

Location: `eval/qa/corpus/battery/tooling-infra/q-ti-stellar-lab-usage-and-new-ui.json:12` and `:42`

`git show 605c1558` versus `git show f65e165d` of this file: `question`, `golden.answer`, `golden.keyFacts`, `golden.avoid`, and `golden.notes` are byte-identical.
`truth.asOf` moved from `2026-09-09` to `2026-09-30`.
`truth.reverifyBy` moved from `2026-10-01` to `2026-12-31`.
`truth.status` stays `confirmed`.
The only source URL change removes `cookbook/contract-assets` and adds `cookbook/deploy-stellar-asset-contract`.

The answer still says: "Quickstart exposes a local `/lab` with custom endpoints".
The 2026-09-30 stamp now covers that sentence.
`.agents/skills/golden-truth/SKILL.md` says an unverifiable fact must not be claimed, and a volatile fact carries `asOf` only for the fact that was verified.

Evidence against the `/lab` sentence:

- The stripped text of `https://developers.stellar.org/docs/tools/quickstart` (HTTP 200) contains none of `/lab`, `Friendbot`, `custom endpoint`, or `localhost`. It does say "the quickstart image is not intended for production purposes."
- `https://raw.githubusercontent.com/stellar/quickstart/master/README.md` (21892 bytes, HTTP 200) documents friendbot on `:8000/friendbot` for local, testnet, and futurenet modes (`README.md:121`). A search for `lab` found the old Laboratory link `https://laboratory.stellar.org/#account-creator?network=test`. It found no `/lab` path.
- `gh api repos/stellar/quickstart/git/trees/master?recursive=1` returned 146 paths at tip `258a5b6e0e9978648f9f02a072d38efb4c7dec70`. No path contains `lab`.

The cluster re-close can stand for the two sentences it actually cites.
[`.agents/rounds/2026-09-30-skill-system-audit/register-review.json`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-30-skill-system-audit/register-review.json) cluster-023 cites Friendbot for Testnet and Futurenet, and "not intended for production".
Both of those sentences are true on the pages above.
The Lab docs page says: "You can use Friendbot to fund those accounts directly on Lab for Testnet and Futurenet."
This finding does not reopen that cluster note.

The same answer names signer categories wallet-kit, hardware, external, and raw-secret.
The guessed URL `https://developers.stellar.org/docs/tools/lab/transactions/sign` returned a Page Not Found body.
That guessed 404 does not prove the sign page was removed.
Those four category names stay unverified.
The transactions page does contain "Fetch next sequence", "Add Operation", and "Sign in Transaction Signer".

Exact fix: remove the Quickstart `/lab` sentence from the confirmed answer, or replace it with a sentence the current Quickstart README supports (`:8000/friendbot` in local, testnet, and futurenet modes). Record the signer-category sentence as unverified until a current sign page is quoted. Then set `truth.asOf` only over the claims this refresh actually re-derived.

### 3. should-fix — "Adding a source" omits the steps PR #157 actually required

Location: `ecosystem-skills/README.md:187-204`

The section names PR #157 and `.agents/rounds/2026-09-16-trustless-work/` as the worked example.
The acceptance record says the reviewer accepted all 15 ordered-ID movements across the 544-row comparison, with no routing-threshold change.
It also says the independent reviewer accepted activation of the unchanged PR #164 gospel for `q-tw-escrow-api-auth-custody`.
`eval/gates.json` had to record the new catalog fingerprint.
`groups.json:15-18` records `scripts` and `.github` under `unpinnedUpstream.trustless-work`.

The new procedure is short of that example:

- Step 5 points only at `live-drift-resolution` Step 1, the regenerate commands. Skill-description changes also need the routing gate in Step 4 of that skill, and a fingerprint update when the gate moves. PR #157 did that movement. Thresholds stayed put.
- The phrase "in one PR" covers the pin, the catalog, the routing fingerprint, and the golden. The golden itself came from PR #164 and was activated in the #157 candidate.
- No step says to record non-skill directories in `groups.json` `unpinnedUpstream`. `scripts/check-skills-drift.mjs:111-150` fails a cherry-picked source when a directory is neither pinned nor recorded, once that source already has an exclusion map. `source.path === "."` is still scanned. The empty-path early return on line 112 applies to a path of `""` (stellar-scout), where the repo is the skill. Line 115 skips the sibling scan when the exclusion map is empty. An operator who copies the README and leaves the map empty gets silence. An operator who records only some directories gets `DRIFT` for the rest.
- Line 203 says an unadmitted candidate is recorded in `.agents/TODO.md` or a round ledger. Decision K for the SCF skills was recorded in [`.agents/NEXT.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md).

Exact fix: add a step to record every non-skill directory in `unpinnedUpstream`, including path `"."` sources. Point step 5 at the routing gate and `eval/gates.json` when descriptions change, and say thresholds move only when the movement is an intended improvement. Say the golden may land in the admission PR or in a reviewed activation of an already-written case. Name [`.agents/NEXT.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) as a valid place for an unadmitted decision.

### 4. nit — decision K uses a catalog name whose upstream directory differs

Location: [`.agents/NEXT.md:155-160`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) and `ecosystem-skills/catalog.json:345-351`

The twelve `scf-*` catalog names are real.
`git log -S 'scf-budget-builder' -- ecosystem-skills/catalog.json` shows `42be531d9d7b6d3b8194403e1c0140544045c6a0` at `2026-07-27T09:58:01-04:00` with subject `catalog: absorb Scout 1.8.28 and ecosystem skills drift (#43)`.
The PR #43 date in decision K is correct.
Eleven repository paths use `skills/scf-*`.
`scf-fetch-external-doc` points at `skills/fetch-external-doc`.
The taglines support the name-level judgment: `scf-round-reviewer` says "from a CSV export", and `scf-fetch-external-doc` says it fetches Google Docs, Drive, GitHub, Notion, and IPFS.
Bodies were not read in this review. The decision already says the fit is name-level.

Exact fix: write the upstream directory `skills/fetch-external-doc` next to the catalog name `scf-fetch-external-doc`.

## Additional work

1. needs-decision. File a successor finding for `SKILL.md:91` at the same pin. The sentence says the Builders directory is "currently in the dozens, not hundreds". `GET https://stellarlight.xyz/api/status` at 2026-09-30T20:03:09Z returned builders `count` 226, `lastUpdatedAt` `2026-09-30T12:57:22.194Z`, notes "Synced from Stellar Passport". The skill names the same source. 226 is a different defect from the skills-catalog roster. `.agents/skills/improvements-pipeline/SKILL.md` says a materially different residual gets a successor. Do not edit issue 14 and do not add a comment there.
2. simple. When the successor or the `sk-027` fix is edited, keep the "~4,700-chunk" research sentence and the "2,000+" repo floor out of that patch. `GET /api/status` repos `count` was 13437, so "2,000+" remains a true floor. This review did not prove that a status document count and a vector-chunk count are the same number. The `api-reference.md` research sentence says "~4,500+ chunks". The `SKILL.md:242` sentence says "~4,700-chunk". Those two pin sentences already disagree with each other. Treat that pair as its own check before anyone files it.

## Checked and correct

Pins, counted from GitHub on 2026-09-30T20:03:07Z. "Current" here means the pinned skill-tree bytes match the latest commit that touches the pinned path. For two sources, repo `main` is newer and the skill tree is unchanged.

| Source | Pinned commit | Latest commit on the pinned path | Repo `main` | Skill-tree result |
|---|---|---|---|---|
| lumenloop/lumenloop-skills `skills/` | `d92c56bda17ab702d3202335cfe814d64e70e191` (2026-06-16T03:06:57Z) | same pin | `40cb36fa69a5629b07eca3ee7c33b0af84a52be3` (2026-06-16T03:31:50Z) | recursive `skills/` tree diff empty (30 and 30). Blobs for `stellar-ecosystem-digest` and `stellar-project-dossier` match (`a70ae8de…`, `e567240b…`). |
| OpenZeppelin/openzeppelin-skills `skills/` | `6f215af60eb60017ab1a933ce9d22a479cd42b26` | same as `main` (2026-07-15T13:00:58Z) | same | 3 pinned dirs (`develop-secure-contracts`, `setup-stellar-contracts`, `upgrade-stellar-contracts`) plus the 8 names in `groups.json` `unpinnedUpstream`. No unclassified directory in the listed tree. |
| stellar/stellar-dev-skill `skills/` | `65375fd2b2582af27fd267f912e8c6d01752120d` (2026-09-15T15:59:11Z) | same pin | `73b609d5e837ee6ab07ec14a413b6c225f777686` (2026-09-23T16:34:33Z) | recursive `skills/` tree diff empty (30 and 30). `skills/standards/ecosystem.md` blob matches (`f07066b3…`). |
| Stellar-Light/stellar-scout | `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6` (2026-09-08T00:38:50Z) | same | same | The finding's "upstream HEAD on 2026-09-30" is true for this repository. |
| Trustless-Work/trustlesswork-skill | `80e2467f34041b9f70e66d6c2f567fc76ba9b1bb` (2026-09-27T01:44:59Z) | same | same | Pin equals `main`. |

`ecosystem-skills/MANIFEST.json` `skill_count` is 21 (8 + 3 + 8 + 1 + 1).
`research/skill-exposure-inventory.json` has 46 rows: exposed 20, internal-guidance 2 (`lumenloop-mcp-connect`, `stellar-developer-activity`), removed 7, excluded-duplicate 7, out-of-scope-operational 10.
The 21st pinned skill is the internal-guidance row `lumenloop-mcp-connect`.
`catalog/manifest.json` has 282 entries: operation 60, skill 20, skill-section 202.
`ecosystem-skills/catalog.json` has 43 entries, `fetched_at` `2026-09-29T19:23:49Z`, the same bySource counts as the live API.
Identity compare of local `name` to live `slug`, local `title` to live `name`, and `tagline`, `kind`, `source`, `install`, `repository`, `homepage`: 43 overlapping keys, 0 diffs, no only-live key, no only-local key.
`node scripts/check-skills-drift.mjs` and `node scripts/check-mirrors.mjs` were not executed. The tree and blob compares above are the pin-byte evidence.

Production, read at 2026-09-30T20:07:29Z with wrangler 4.133.0, active profile `sdf`, from this repository:

- `npx wrangler deployments status`: Created `2026-09-30T19:49:09.958Z`, Author `ecosystem@stellar.org`, Version(s) `(100%) c4d27b61-e0f0-47a4-a6fe-6ce298fb1b81`, that version Created `2026-09-30T19:49:07.398Z`. Tag and Message are empty. The version id is the active deployment. The message does not name PR #183.
- `npx wrangler versions list` shows the previous version `5774bb56-d1f9-4725-ae65-bfd35e3c0bce` (Created `2026-09-29T20:03:11.231Z`, message `PR #182: Scout 1.9.54 and independently verified maintenance`) and then `c4d27b61`.
- `curl -sI https://raven.stellar.org/` returned HTTP/2 200. The saved body is 154114 bytes and the title text starts "Stellar Raven — the Stellar MCP server for AI agents".
- `curl -sI https://raven.stellar.org/mcp` returned HTTP/2 401 with `www-authenticate` Bearer realm `OAuth`.
- An authenticated production search was not run. The author's `scout.getSkill({ name: "soroban" })` soft-empty and the author's `codemode.skill.read` of the four phrases stay unverified.

`sk-027` pipeline shape. Status is `reported-upstream`. Evidence includes the issue URL. The public sections match the issue body read back with `gh api`. The snapshot link is `f65e165d`. A byte diff of that blob against the issue body was not completed. The current file on this branch adds the issue URL after filing. This review does not call the snapshot wrong.

Golden claims that this probe re-derived:

- Lab docs, HTTP 200: Friendbot funding on Lab for Testnet and Futurenet. "Deploy smart contracts" on that page is WASM upload. A dedicated Lab SAC button was not clicked. The golden already says not to claim that button unless the UI is reverified.
- Transactions docs, HTTP 200: "Add Operation", "Fetch next sequence", "Sign in Transaction Signer", "View in XDR viewer". The words "Change Trust" are absent from this page. The golden says "Change Trust or another operation", so that absence is not a contradiction.
- Saved keypairs docs, HTTP 200: only Testnet and Futurenet; "Saved keypairs are obfuscated, but not encrypted"; "keypairs saved before September 2025 may remain in plain text"; "You can only save keypairs on test networks—never on Mainnet"; "Fund with Friendbot" for 10,000 XLM after a Testnet or Futurenet reset.
- `https://lab.stellar.org/account/saved` HTTP 200 still loads `/_next/static/chunks/app/(sidebar)/account/saved/page-dbc03db5d85268bb.js` (28654 bytes, HTTP 200). The bundle contains the warning "Saved keypairs are stored in the browser’s localstorage unencrypted and with no protection." The served function is `e.split("").map((e,r)=>String.fromCharCode(e.charCodeAt(0)^t.charCodeAt(r%t.length))).join("")`, with `n` taken from `TESTNET`. `get` tries `JSON.parse` first, then `JSON.parse(a(atob(e),n))`. `set` stores `btoa(a(JSON.stringify(e),n))`. The identifier `encryptJson` is absent from this chunk. The algorithm and the plaintext fallback are present.
- `stellar/laboratory` `jsonCipher.ts` at main uses `const SALT = Networks.TESTNET` and `encryptJson = btoa(xorCipher(JSON.stringify(data), SALT))`. The comment says the salt obscures data and is not for sensitive data. Helper blobs `jsonCipher.ts` `670eaef3387cd75f318781cc19441e046e06e5fb` and `localStorageSavedKeypairs.ts` `1b4293ceb13634b6ec795ead6ce4e2f23d6d3437` match at `624d40ff29ca`, at `bbbe48c79b8a90bbc548115a0573c912b1e9fa9e`, and at main `b4b6465a29f9622eebbe7d46ce0117b552e87d91`. Compare `624d40ff29ca...bbbe48c` is ahead by 233. Compare `bbbe48c...main` is ahead by 2. The helper content is unchanged. `bbbe48c` is not current HEAD.
- Cookbook `deploy-stellar-asset-contract` HTTP 200 shows `stellar contract asset deploy` and `stellar contract id asset`. The word "deterministic" is absent from that page. Local `stellar` 28.1.0 (`c0f4d0da891bbf214c08b8c5035ae6db80e9a3bd`) help says `stellar contract asset deploy` deploys the builtin Stellar Asset Contract, and `stellar contract id asset` "Derive the contract id for a builtin Stellar Asset Contract" with required `--asset`. The deprecated `stellar contract asset id` text points at `stellar contract id asset`.
- The followed `cookbook/contract-assets` body contains "Page Not Found". The original status code in the saved header file was not read. A search under `eval/qa` finds that dead URL only as evidence text in this case and in generated `eval/qa/cases.json:52796`.
- Quickstart "not intended for production" is true, as cited under finding 2.
- `GET /api/status` `apiVersion` is `1.9.54`. A full OpenAPI byte compare against `inventory/stellar-light.json` was not done.

`AGENTS.md:141` names `retrieval-system-audit`. The skill file exists. A word-for-word compare of that bullet with the skill frontmatter was not done.

PR #183 diff `605c1558..f65e165d` is 17 files, 356 insertions, 59 deletions. `catalog/manifest.json` is not in that diff.

Unverified, on purpose: the author's `npm test`, typecheck, build, secrets scan, improvements lint, and QA lint; `check-skills-drift.mjs` and `check-mirrors.mjs` execution; authenticated production `search` and the author's tool reads; the `f65e165d` finding blob versus the issue 14 body; the original HTTP status before the contract-assets redirect; a Lab UI click for a SAC button; a current docs page for the four signer categories; research chunk counts versus `researchDocs`.

## Probe log

Commands:

- `gh api repos/lumenloop/lumenloop-skills/commits/main`
- `gh api repos/lumenloop/lumenloop-skills/commits?sha=main&path=skills&per_page=1`
- recursive git tree compare of `lumenloop/lumenloop-skills` `skills/` at main and at the pin
- blob compare of `skills/stellar-ecosystem-digest/SKILL.md` and `skills/stellar-project-dossier/SKILL.md`
- `gh api repos/OpenZeppelin/openzeppelin-skills/commits/main`
- `gh api repos/OpenZeppelin/openzeppelin-skills/commits?sha=main&path=skills&per_page=1`
- OpenZeppelin `skills/` directory listing versus `groups.json` `unpinnedUpstream`
- `gh api repos/stellar/stellar-dev-skill/commits/main`
- `gh api repos/stellar/stellar-dev-skill/commits?sha=main&path=skills&per_page=1`
- recursive git tree compare of `stellar/stellar-dev-skill` `skills/` at main and at the pin
- blob compare of `skills/standards/ecosystem.md`
- `gh api repos/stellar/stellar-dev-skill/contents/skills/soroban` (404)
- `gh api repos/stellar/stellar-dev-skill/contents/site/src/data/skills.ts`
- `gh api repos/Stellar-Light/stellar-scout/commits/main`
- `gh api repos/Stellar-Light/stellar-scout/commits?sha=main&per_page=1`
- raw fetches of `SKILL.md`, `README.md`, `references/api-reference.md`, and `references/examples.md` at commit `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6`
- `gh api repos/Trustless-Work/trustlesswork-skill/commits/main`
- `gh api repos/Stellar-Light/stellar-scout/issues/14 --jq '{state,user:.user.login,created_at,labels,title}'`
- `gh api repos/Stellar-Light/stellar-scout/labels --jq '.[].name'`
- `gh api repos/stellar/laboratory/contents/src/helpers/jsonCipher.ts` and `localStorageSavedKeypairs.ts` at main, at `624d40ff29ca`, and at `bbbe48c79b8a90bbc548115a0573c912b1e9fa9e`
- `gh api repos/stellar/laboratory/compare/624d40ff29ca897f07290ca52011893175dae200...bbbe48c79b8a90bbc548115a0573c912b1e9fa9e`
- `gh api repos/stellar/laboratory/compare/bbbe48c79b8a90bbc548115a0573c912b1e9fa9e...main`
- `gh api repos/stellar/quickstart/git/trees/master?recursive=1`
- `git log -S 'scf-budget-builder' --format='%H %cI %s' -- ecosystem-skills/catalog.json`
- `git rev-parse f65e165d^`
- `git diff --stat 605c1558 f65e165d`
- `git show 605c1558:eval/qa/corpus/battery/tooling-infra/q-ti-stellar-lab-usage-and-new-ui.json` compared in node with `git show f65e165d:` of the same path
- `rg -n cookbook/contract-assets eval/qa`
- node count of `catalog/manifest.json` kinds and `ecosystem-skills/MANIFEST.json` skill counts
- python identity compare of `ecosystem-skills/catalog.json` entries to the saved live `/api/skills` body
- python count of `research/skill-exposure-inventory.json` `currentState`
- python count of `scf-*` catalog names and repository paths
- `npx wrangler deployments status`
- `npx wrangler versions list`
- `stellar version`
- `stellar contract asset --help`
- `stellar contract id asset --help`

URLs:

- https://stellarlight.xyz/api/skills
- https://stellarlight.xyz/api/skills/soroban
- https://stellarlight.xyz/api/skills/smart-contracts
- https://stellarlight.xyz/api/skills/cross-chain
- https://stellarlight.xyz/api/skills/dapp
- https://stellarlight.xyz/api/skills/anchors
- https://stellarlight.xyz/api/skills/stellar-scout
- https://stellarlight.xyz/api/status
- https://skills.stellar.org/
- https://skills.stellar.org/soroban
- https://skills.stellar.org/skills/soroban/
- https://skills.stellar.org/skills/soroban/SKILL.md
- https://skills.stellar.org/skills/smart-contracts/
- https://skills.stellar.org/skills/smart-contracts/SKILL.md
- https://skills.stellar.org/skills/cross-chain/
- https://skills.stellar.org/skills/cross-chain/SKILL.md
- https://skills.stellar.org/skills/anchors/
- https://skills.stellar.org/skills/anchors
- https://skills.stellar.org/skills/anchors/SKILL.md
- https://raw.githubusercontent.com/Stellar-Light/stellar-scout/3b587aa9f23d21fc572f6e93cb6d11031dbc24e6/SKILL.md
- https://raw.githubusercontent.com/Stellar-Light/stellar-scout/3b587aa9f23d21fc572f6e93cb6d11031dbc24e6/README.md
- https://raw.githubusercontent.com/Stellar-Light/stellar-scout/3b587aa9f23d21fc572f6e93cb6d11031dbc24e6/references/api-reference.md
- https://raw.githubusercontent.com/Stellar-Light/stellar-scout/3b587aa9f23d21fc572f6e93cb6d11031dbc24e6/references/examples.md
- https://developers.stellar.org/docs/tools/lab
- https://developers.stellar.org/docs/tools/lab/transactions
- https://developers.stellar.org/docs/tools/lab/saved/keypairs
- https://developers.stellar.org/docs/tools/quickstart
- https://developers.stellar.org/docs/tools/cli/cookbook/contract-assets
- https://developers.stellar.org/docs/tools/cli/cookbook/deploy-stellar-asset-contract
- https://developers.stellar.org/docs/tools/lab/transactions/sign
- https://lab.stellar.org/account/saved
- https://lab.stellar.org/_next/static/chunks/app/(sidebar)/account/saved/page-dbc03db5d85268bb.js
- https://raw.githubusercontent.com/stellar/quickstart/master/README.md
- https://raven.stellar.org/
- https://raven.stellar.org/mcp
- https://github.com/Stellar-Light/stellar-scout/issues/14
