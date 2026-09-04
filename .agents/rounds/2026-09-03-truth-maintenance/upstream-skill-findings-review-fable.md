# Upstream skill findings review

Date: 2026-09-04
Role: independent reviewer for `sk-022`, `sk-023`, and `sk-024` before filing
Model: Claude Fable 5.1 at `xhigh`
Worktree: `/private/tmp/stellar-raven-tm-skill-review`, branch `codex/tm-skill-findings-review`

I started from the three record files, not from the author report.
I re-fetched every primary source and recomputed every recorded hash.
I read `upstream-skill-findings-terra.md` only after my own analysis was complete.
I made no paid model call. I filed no upstream issue. I made no golden change.

## Verdict

`CHANGES-REQUIRED` on the records as committed in `8d1b50a`.
All three defects are real, current, distinct, and correctly owned.
Three of the changes were required before filing. I applied every change in this commit.
After the corrections, all three records pass every gate and are ready to file.

| record | truth | scope as found | corrections applied | final |
|---|---|---|---|---|
| `sk-022` | confirmed | correct, under-specified | pinned commit and hash, removal commit and first clean release, probe, seven-location fix list, case-file note | ready |
| `sk-023` | confirmed | one overstatement | exact quotes replace "calls MPP a Stellar-native stack", served-pin equality, prevalence rows, `mppx` versus `@stellar/mpp` sentence, surface-named title | ready |
| `sk-024` | confirmed | one misleading claim | removed the implied key-free Stellar facilitator, added the official two-option Docs evidence, prevalence rows, location list, spelled-out title | ready |
| intake | blocked | `sk-023` and `sk-024` had no owner override; the filer refused both | overrides to `stellar/stellar-dev-skill` | resolves |

## Independent source verification

Every recorded SHA-256 reproduced on 2026-09-04. Fetch method: `curl -sSL` plus `shasum -a 256`.

| source | revision or date | SHA-256 | recorded | result |
|---|---|---|---|---|
| openzeppelin-skills `upgrade-stellar-contracts/SKILL.md` | `6f215af` (main head, served pin) | `80f565db…9b71` | none in `sk-022` | added |
| docs.openzeppelin.com upgradeable page | 2026-09-04 | `55a9d1f0…aeb0` | none in `sk-022` | added |
| stellar-dev-skill `mpp.md` | `790f607`, `b78983c`, main | `14214c9a…279d` | match | identical bytes at all three |
| stellar-dev-skill `x402.md` | `790f607`, `b78983c`, main | `5b07269e…f950` | match | identical bytes at all three |
| stellar-dev-skill `SKILL.md` | `790f607`, `b78983c`, main | `2af48a37…f570` | match | identical bytes at all three |
| mpp.dev/overview | 2026-09-04 | `39c571e5…0dd4` | match | |
| mpp.dev/protocol | 2026-09-04 | `a2abfffc…575d` | match | |
| developers.stellar.org MPP page | 2026-09-04 | `9056df99…82f7` | match | rendered HTML hash; volatile |
| docs.x402.org facilitators.md | 2026-09-04 | `aceb37a8…1be5` | match | |
| docs.x402.org faq.md | 2026-09-04 | `bd0e9176…2013` | match | |
| developers.stellar.org x402 page | 2026-09-04, last updated 2026-09-02 | `d63191ee…18f6` | none | added as dated read |
| developers.stellar.org built-on-stellar page | 2026-09-04 | not recorded | none | added as dated read |

Revision facts from the GitHub API:

- `stellar/stellar-dev-skill` main head is `790f607b` (2026-09-03T15:27:35Z). The served pin `b78983c9` is dated 2026-08-25. The agentic-payments directory last changed on 2026-08-19 (`bd743733`). The two revisions carry identical bytes for all three files.
- `OpenZeppelin/openzeppelin-skills` main head is `6f215af6` (2026-07-15). The upgrade skill file last changed on 2026-03-04 (`2c40ea9e`).
- `OpenZeppelin/stellar-contracts` commit `e7722e4923accfd754991a56b3226e0a834c27a1` (pull request 585, "Remove Upgradeable derive macros", merged 2026-02-26T14:06:40Z) removed the derives and the internal traits. `packages/macros/src/lib.rs` at tag `v0.6.0` (2026-01-09) defines them. The same file at tag `v0.7.0` (2026-04-03) does not. GitHub code search for `UpgradeableMigratable` in that repository returns zero results on main.

## Record-by-record review

### sk-022: OpenZeppelin upgrade skill teaches retired derive APIs as current

Truth. Confirmed. The skill at the served pin recommends `#[derive(Upgradeable)]` and `#[derive(UpgradeableMigratable)]` as "the recommended way". The current documentation defines only the `Upgradeable` trait, tells implementors to use `#[contractimpl]`, and has a section titled "Why There Is No Migratable Trait".

Claim scope. The record as found did not say when the API was retired. The calibration rule requires the first bad release. The derives exist through `v0.6.0` and are absent from `v0.7.0`. The skill file was reorganized on 2026-02-23 and last touched on 2026-03-04, three days after the removal commit. I added those facts. I did not claim that the skill's code fails to compile, because I did not compile it.

Terminology. Correct. The record uses the exact trait and macro names.

Duplicates. `sk-015` targets the description trigger scope of the same skill and is `reported-upstream`. It does not cover retired APIs. No resolved entry covers this defect. The golden `q-soroban-oz-upgradeable-macro` has encoded the retired derives as an avoid trap since 2026-08-27, so no golden change is needed. I added that note and a cross-reference to `sk-015` in prose, without the issue URL, so the base lint keeps `verified` as the status.

Owner and ID. `improvements/intake.json` already routes `sk-022` to `OpenZeppelin/openzeppelin-skills`. The filer dry run resolves that owner. `sk-022` is the next free ID after `sk-021`; the resolved ledger tops out at `sk-020`.

Evidence quality. The first evidence line cited a `blob/main` URL without a commit or hash. I replaced it with the pinned raw URL, the hash, and the served-pin statement. The transcript for row `q-soroban-oz-upgradeable-macro` contains the raw URL at `6f215af`, which proves the served pin reached the answer.

Probe. The record had none. I added one that matches `#[derive(UpgradeableMigratable)]` on the main raw file. It reports recurring.

Recommendation. The derive claim appears in seven places in the skill, including the description item (2). The smallest fix that leaves no contradiction must touch all seven. I listed them. I also asked the owner to re-verify the SEP-49 version-metadata sentence, because the skill attributes that behavior to the removed macros.

Split or merge. Keep as one record. The description overlap with `sk-015` is a cross-reference, not a merge.

### sk-023: The agentic-payments MPP guide omits MPP's payment-method-agnostic scope

Truth. Confirmed. `mpp.md` never states the scope of MPP. Its first sentence is "Facilitator-free machine payments settled directly on Stellar". A "When to use MPP" bullet says "You're building a Stellar-native payment stack". The router says "payments on Stellar". mpp.dev/protocol says MPP "works with any payment network" and has a section titled "Payment method agnostic". The Stellar Docs page links the MPP specification separately from `@stellar/mpp` and calls `mppx` the core MPP framework library.

Claim scope. The record as found said "The current guide calls MPP a Stellar-native payment stack". That sentence in the guide describes the reader's goal, not MPP. I replaced the paraphrase with the exact quotes. The finding stands on the absence of any scope sentence, which is exact.

Terminology. I aligned the recommended sentence with the source's own term, "payment method agnostic", and named the two packages the guide installs.

Duplicates. `sk-012` and `sk-016` are resolved and cover mode naming and discovery. `sd-005` is the Docs-side positioning finding on a different surface. Not a duplicate. I recorded the distinction.

Owner and ID. The `skills` service rule is mixed. The filer refused the record: "intake is mixed; add a finding override". I added an override to `stellar/stellar-dev-skill`, which `intake.json` already names as the `stellar-dev` source repository. `sk-023` is the next free ID.

Evidence quality. The record cited commit `790f607`, which is current main. The candidate rows read the served pin `b78983c`. The bytes are identical, and I recorded that equality so the candidate-window evidence and the current source are the same object. I added prevalence: two candidate rows reproduced the "Stellar-native" framing; one received a wrong verdict.

Probe. Present and recurring.

Recommendation. One scope sentence, one package sentence, one link. Unchanged in intent.

Split or merge. Keep separate from `sk-024`. Different file, different defect, different smallest fix.

### sk-024: The x402 guide presents OpenZeppelin Channels and its API key as the only facilitator path

Truth. Confirmed. The router table says "Needs facilitator? | Yes (OZ Channels)". The shared setup says "x402 additionally needs the web-only OZ Channels key generator". `x402.md` throws "OZ_API_KEY is required" at startup and says "Required, not optional". The only alternative is one parenthetical, "(or a self-hosted relayer)", with no configuration. x402.org says anyone can run a facilitator and documents self-facilitation. The official Stellar x402 page lists two facilitator options for Stellar.

Claim scope, one correction. The record as found said the x402 facilitator page "lists the free public Stellar option" and "lists facilitators with no API key requirement". The Stellar entry on that page, Built on Stellar, is the OpenZeppelin Channels endpoint. Its Docs page uses `channels.openzeppelin.com` URLs and requires a generated API key on testnet and mainnet. The provider with no key requirement is not a Stellar provider. As written, an upstream reader could infer that a key-free Stellar facilitator exists. It does not, on this evidence. I rewrote the finding around the facts that hold: the protocol is permissionless, self-facilitation is documented, the official Stellar page lists the Coinbase facilitator on testnet and the Built on Stellar facilitator, and the key is a requirement of that second provider.

Terminology. The title used "OZ Channels". I spelled out "OpenZeppelin Channels" in the title and kept `OZ Channels` as the quoted token from the skill.

Duplicates. `sd-039` covers Relayer versus Channels product identity on Docs Tools pages. Different surface. Not a duplicate. The golden `q-soroban-x402-auth-entry-signing` already forbids generalizing the hosted key requirement, so no golden change is needed.

Owner and ID. Same intake refusal as `sk-023`. I added the override to `stellar/stellar-dev-skill`. `sk-024` is the next free ID.

Evidence quality. Added the served-pin equality, the dated official Docs evidence, the Built on Stellar page evidence, and prevalence: three candidate rows reproduced the framing, one wrong, one partial, one carried in a partial row for other reasons.

Probe. Present and recurring.

Recommendation. Reworked to the smallest correction that matches the official Stellar page: keep the OpenZeppelin example and label it, change the table cell, add one alternatives sentence with two links, and scope the key text to OpenZeppelin Channels. I listed every location that repeats the universal wording.

Split or merge. Keep as one record. The root table and `x402.md` express one defect.

## Comparison with the author report

I agree with Terra's three verdicts, the duplicate search, the ID assignment, and the decision not to file a dapp finding.

Three statements in the author report need correction:

- "The x402 primary pages describe … a public Stellar option, and a provider with no key requirement." The public Stellar option is the OpenZeppelin Channels endpoint and it requires a key. The keyless provider is not a Stellar provider. The corrected `sk-024` no longer relies on either reading.
- "The full live lint result remains unavailable." `npm run improvements:lint -- --live` completed here in the worktree and passed with 70 findings and live intake checked.
- The author report cites "current contract implementation commit `9c5e279a`". I could not tie that commit to the removal. The removal commit is `e7722e49` (pull request 585). I recorded that commit and the release boundary.

The author report's finding counts (66 and 67) predate later branch commits. The index now carries 70 findings.

## Commands

Run in the worktree unless stated.

```sh
git rev-parse --abbrev-ref HEAD && git rev-parse HEAD && git status --porcelain
curl -sSL <each primary source> ; shasum -a 256 <each fetched file>
gh api repos/stellar/stellar-dev-skill/commits/{790f607b…,b78983c9…,main}
gh api "repos/stellar/stellar-dev-skill/commits?path=skills/agentic-payments&per_page=5"
gh api repos/OpenZeppelin/openzeppelin-skills/commits/main
gh api "repos/OpenZeppelin/openzeppelin-skills/commits?path=skills/upgrade-stellar-contracts/SKILL.md"
gh api "repos/OpenZeppelin/stellar-contracts/commits?path=packages/contract-utils/src/upgradeable"
gh api repos/OpenZeppelin/stellar-contracts/pulls/585
gh api repos/OpenZeppelin/stellar-contracts/releases/tags/{v0.6.0,v0.7.0}
gh api "search/code?q=UpgradeableMigratable+repo:OpenZeppelin/stellar-contracts"
npm ci
npm run improvements:index
npm run improvements:lint
npm run improvements:lint -- --live
npm run improvements:probes -- --service skills
npx vitest run test/improvements-lint.test.ts test/improvements-run-probes.test.ts test/improvements-file-issue.test.ts test/improvements-resolve.test.ts test/improvements-writes.test.mjs
npm run improvements:file -- --file improvements/skills/<record>.md --dry-run   # all three
npm run secrets:scan -- --tree
git diff --check
```

Results after the corrections:

| gate | result |
|---|---|
| `improvements:index` | wrote 70 findings; committed bytes match |
| `improvements:lint` | ok, 70 findings |
| `improvements:lint -- --live` | ok, live intake checked |
| `improvements:probes -- --service skills` | 7 recurring, 0 fixed-candidate, 0 inconclusive, 0 errors |
| focused vitest | 5 files, 41 tests passed |
| filer dry run | all three resolve an owner and render the five required sections |
| `secrets:scan -- --tree` | clean |
| `git diff --check` | clean |

The transcript checks used the candidate artifact at
`/private/tmp/stellar-raven-tm-runner/eval/qa/results/2026-09-04T05-40-51-variantA.json`.
Rows `q-soroban-oz-upgradeable-macro`, `q-defi-agentic-payment-standards-compare`,
`q-soroban-x402-auth-entry-signing`, `q-mpp-discovery-and-modes`, `q-defi-x402-on-stellar-what`,
and `q-agent-payment-standard-choice` contain the served raw URLs and the quoted skill text.

## Risks

- The filer omits the immutable snapshot line while a record has uncommitted edits. File only after this commit lands, so the snapshot points at the corrected text.
- The Stellar Docs pages are hashed as rendered HTML. Those hashes will drift with any site change. The records carry dated reads for them, not only hashes.
- `sk-021` also targets `stellar/stellar-dev-skill` and has no intake override. It is outside this review's scope, but the filer will refuse it in the same way.
- The eval artifact cited in all three records is a stopped mixed-upstream diagnostic. The skill sources did not change during the arm, so the rows remain valid evidence that the skill text reached the answers. The records say so.

## Blockers

- Filing needs owner authority. The stop audit keeps upstream filing blocked until the owner authorizes it. Nothing in this review filed anything.
- No other blocker. The records are ready for `npm run improvements:file` once authority exists.
