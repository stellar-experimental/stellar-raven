# Upstream docs findings review

Date: 2026-09-04

Reviewer lane: Claude Opus 5 at xhigh effort

Author lane: Codex Terra, per `upstream-docs-findings-terra.md`

Commit under review: `8012adb8b84158970ff42b7bb6e399197f4919b9`

Branch: `codex/tm-docs-findings`

Worktree: `/private/tmp/stellar-raven-tm-docs-findings`

Follow-up commit: this report plus three corrections.

## Verdict

`CHANGES-REQUIRED`, now applied in this follow-up commit.

All four findings describe real, current upstream defects.
I reproduced every one against a freshly fetched primary source.
Two records carried defects that would have damaged a public filing.
I corrected them. No filing happened before this review.

| Finding | Substance | Record as committed | Action |
|---|---|---|---|
| `sk-022` | PASS | PASS | none |
| `sd-050` | PASS | CHANGES-REQUIRED | corrected |
| `sd-051` | PASS | CHANGES-REQUIRED | corrected |
| `sd-052` | PASS | PASS | none |
| intake mapping | — | CHANGES-REQUIRED | corrected |

## Method

I read `AGENTS.md`, `improvements/README.md`, and the improvements-pipeline skill.
I read the diff before the author report.
I re-fetched every primary source rather than trusting the recorded quotes.
I re-ran the Stellar CLI commands on the local binary.
I also read the four cited golden case files, which the author report did not use as a check.

## Commands

| Command | Result |
|---|---|
| `stellar --version` | `stellar 27.1.0 (8e402ea28202950b272fbabc34caad4d2f64fe87)` |
| `stellar contract bindings --help` | lists rust, typescript, python, java, flutter, swift, php |
| `stellar contract bindings {python,java,flutter,swift,php}` | each exits 1 with a not-implemented error |
| `stellar contract bindings {python,java,flutter,swift,php} --help` | each reads `Generate <Language> bindings`, no marker |
| `stellar contract bindings rust` | requests `--wasm <WASM>` |
| `stellar contract bindings typescript` | requests `--output-dir` and one Wasm/hash/contract-id input |
| `curl` on six primary pages | all HTTP 200, see the table below |
| `npm run improvements:index` | 68 findings, byte-identical before my edits |
| `npm run improvements:lint` | ok, 68 findings |
| `npm run improvements:lint -- --live` | ok, live intake checked |
| `npm run improvements:file -- --file <each> --dry-run` | see the intake finding below |
| `npm test` | 103 files, 1,771 tests, all pass |
| `npm run secrets:scan -- --tree` | clean, no leaks |

I made no write to any upstream service. I filed no issue and posted no comment.

## Primary sources re-fetched

| Source | Result |
|---|---|
| `developers.stellar.org/docs/tools/sdks/client-sdks` | HTTP 200, last updated Sep 2, 2026 |
| `raw.githubusercontent.com/stellar/js-stellar-sdk/main/README.md` | HTTP 200 |
| `registry.npmjs.org/stellar-sdk` | HTTP 200 |
| `registry.npmjs.org/@stellar/stellar-sdk` | HTTP 200 |
| `developers.stellar.org/docs/networks/software-versions` | HTTP 200 |
| `stellar.org/blog/developers/protocol-20-upgrade-guide` | HTTP 200 |
| `developers.stellar.org/docs/tools/cli/stellar-cli` | HTTP 200 |
| OpenZeppelin skill at pin `6f215af6` and at `main` | HTTP 200, byte-identical |
| `docs.openzeppelin.com/stellar-contracts/utils/upgradeable` | HTTP 200 |
| `OpenZeppelin/stellar-contracts` macros and upgradeable sources | HTTP 200 |

## Finding-by-finding verdicts

### `sk-022` — PASS, no change

Every claim reproduced.

The skill at `main` and at the pinned manifest commit `6f215af6` are byte-identical.
Line 44 reads: the recommended way to use these is through derive macros,
`#[derive(Upgradeable)]` and `#[derive(UpgradeableMigratable)]`.

The current documentation contains zero occurrences of the word `derive`.
It defines `#[contractclient(name = "UpgradeableClient")] pub trait Upgradeable`.
It says to implement this trait directly using `#[contractimpl]`.
It carries a section headed "Why There Is No Migratable Trait".

I also checked the library itself, which the record does not cite.
`packages/macros/src/lib.rs` on `main` holds eight `proc_macro_attribute` macros.
It holds zero `proc_macro_derive` entries and zero Upgradeable or Migratable mentions.
`packages/contract-utils/src/upgradeable/mod.rs:49` carries the same no-Migratable note.
The word "retired" in the title is therefore correct, not rhetorical.

The `examples/upgradeable` tree holds `v1`, `v2`, `lazy-v1`, `lazy-v2`, and `upgrader`.
It holds no `UpgradeableMigratable` example.
The skill's line 100 promises such an example, so that line is also wrong.

Owner `OpenZeppelin/openzeppelin-skills` is correct and matches the `sk-015` precedent.
`sk-015` is a different defect in the same file, so `sk-022` is not a duplicate.

### `sd-050` — PASS on substance, record corrected

The page prose reproduced exactly: `stellar-sdk` is the JavaScript library for
communicating with Stellar RPC and Horizon.
The page links `https://www.npmjs.com/package/@stellar/stellar-sdk`.
The SDK repository README reproduced exactly: `npm install --save @stellar/stellar-sdk`.

Two record defects would have shipped into a public `stellar/stellar-docs` issue.

**Defect 1: the title said "unusable".** That is false.
The npm registry serves `stellar-sdk` at latest 13.3.0, published 2025-04-21.
It carries a deprecation notice that points to the scoped package.
An install of the unscoped name succeeds and returns a stale package.
The current `@stellar/stellar-sdk` is 17.0.1, published 2026-08-25.
The real harm is a silent four-major-version regression, not an install failure.

**Defect 2: the record claimed the page leads readers to an unscoped install command.**
The page contains no install command. I searched it and found zero.
A maintainer could have rejected the whole issue on that one sentence.

I corrected the title to name the deprecated unscoped package.
I replaced the install-command claim with the verified registry facts.
The recommendation was already correct and is unchanged.

The repository's own golden agrees with the corrected wording.
`q-tool-js-sdk-package` avoids naming `stellar-sdk` as unscoped and legacy.

### `sd-051` — PASS on substance, record corrected

Both quoted strings reproduced exactly.
The heading reads `Protocol 20: Soroban Phase 1 (Mainnet Edition) (February 5, 2024)`.
The upgrade guide reads: on February 20 at 1700 UTC, the Stellar Mainnet upgraded to Protocol 20.

The ambiguity claim is stronger than the record stated, and one part was hazardous.

The record said the page does not say February 5 is a software-release date.
That sentence is literally true but weak, because the page is titled Software Versions.
The verified evidence is the page's own heading convention.
Sibling headings read `Protocol 21 (Mainnet, June 18, 2024)` and
`Protocol 22 (Mainnet, December 5, 2024)`.
Those use the Mainnet token for a network activation date.

**The recommendation carried a wrong-edit hazard.**
It asked the owner to add the February 20 activation date to the same entry.
That entry is headed Phase 1, but its own table lists Phase 0 Limits and Phase 0 Fees.
The upgrade guide records February 20 as the upgrade vote plus Phase 0.
The separate February 27, 2024 entry lists Phase 1 Limits and Phase 1 Fees.
A literal fix would therefore have stamped "Phase 1 activated February 20" onto the page.
That statement is false.

The improvements-pipeline calibration rule requires this check.
It asks the author to sweep adjacent prose so the smallest fix leaves nothing contradictory.

I added the sibling-heading evidence and the Phase 0 versus Phase 1 mismatch.
I changed the recommendation to name Phase 0 for February 20.
I added a line that asks the owner to correct the Phase 1 heading.

The repository's own golden corroborates the dates.
`q-hist-soroban-launch-protocol20` records Phase 0 on February 20, Phase 1 on
February 27, and Phase 2 on March 19.

### `sd-052` — PASS, no change

Every claim reproduced on the current binary and the current page.

`stellar 27.1.0` is installed. All five placeholder commands exit 1.
Each prints: `<language> binding generation is not implemented in the stellar-cli,
but is available via the tool located here:`
`https://github.com/lightsail-network/stellar-contract-bindings`.

The manual page lists all five under `stellar contract bindings`.
The page contains zero occurrences of "not implemented", "lightsail", or
"stellar-contract-bindings".
Each per-language section reads only `Generate <Language> bindings` plus a bare usage line.

Rust and TypeScript reached argument parsing and requested their required inputs.
That confirms the record's scope claim: only the placeholder languages are affected.

The `stellar/stellar-cli` intake override is correct.
The manual mirrors the CLI help byte for byte, including the CLI's own
`⚠️ Deprecated, use ...` markers on `optimize`, `inspect`, and `install`.
That precedent supports the record's recommendation directly, because the CLI
already has a marker style it can reuse for the placeholders.
The record keeps the `stellar-docs` collection with a cross-repo override, which
matches the `sd-037` and `sd-048` precedent.

## Duplicate check

I checked active findings and the 117-entry resolved ledger.
No duplicate exists for any of the four.

| Neighbour | Relationship | Conclusion |
|---|---|---|
| `sd-033` resolved | same page as `sd-050`, Python SDK capability defect | distinct |
| `sd-008` resolved | same page as `sd-051`, Protocol 27 Mainnet status lag | distinct |
| `sd-001` resolved | same page as `sd-051`, crawler record cap | distinct |
| `sd-026` resolved | `contract optimize` deprecation | distinct from `sd-052` |
| `sd-011` resolved | Horizon offer effects | not raised, correctly rejected |
| `sk-015` active | same skill file as `sk-022`, trigger scope defect | distinct |

The author rejected two candidates for `sd-026` and `sd-011`. Both rejections are correct.

## Permanent IDs

The maximum before this commit was `sd-049` active and `sd-038` resolved.
The maximum was `sk-021` active and `sk-020` resolved.
`sd-050`, `sd-051`, `sd-052`, and `sk-022` are the next free IDs.
No ID is reused from the resolved ledger.

## Intake mapping — corrected

`sd-052` to `stellar/stellar-cli` is correct.
`sk-022` to `OpenZeppelin/openzeppelin-skills` is correct.

`sd-050` and `sd-051` carried no override, and that blocked filing.
The `stellar-docs` service intake is type `mixed`.
The filer refused both records:
`intake is mixed ...; add a finding override or pass --repo after manual triage`.

Every other filed `stellar-docs` content finding carries an explicit override.
That covers `sd-003` through `sd-046`, including the still-proposed `sd-046`.
Both new records are plain `docs-content` findings owned by `stellar/stellar-docs`.
The intake's own `contentRule` says exactly that.

I added both overrides. Both records now render an owner-resolved issue body.

## Public evidence

Each record cites a gitignored results artifact at
`eval/qa/results/2026-09-04T05-40-51-variantA.json`.
That path matches the format `improvements/README.md` prescribes, so it is house style.
The artifact itself is not public, so I checked the provenance a stranger can reach.

All four cited case IDs exist as committed corpus files:

- `eval/qa/corpus/battery/tooling-infra/q-tool-js-sdk-package.json`
- `eval/qa/corpus/battery/history-org-tokenomics/q-hist-soroban-launch-protocol20.json`
- `eval/qa/corpus/battery/soroban/q-soroban-cli-bindings.json`
- `eval/qa/corpus/battery/soroban/q-soroban-oz-upgradeable-macro.json`

More importantly, no finding's `verified` status depends on that artifact.
I reproduced every defect from primary sources alone.
The artifact supplies provenance for which claim to check, nothing more.

This matters because that artifact is the stopped mixed-upstream candidate.
The post-candidate stop audit calls its verdicts diagnostic only.
Using those verdicts as a filing trigger is sound. Using them as proof would not be.
The records use them correctly, as a pointer beside independent live evidence.

## Golden cross-check

The author report did not check the goldens. I did.
All four goldens already encode the correct upstream truth.

- `q-tool-js-sdk-package` avoids the unscoped legacy name.
- `q-hist-soroban-launch-protocol20` records the three phased dates.
- `q-soroban-cli-bindings` states the placeholder commands are not built-in generators.
- `q-soroban-oz-upgradeable-macro` avoids the retired derives.

No golden change is needed, so no `golden-truth` work follows from this lane.
The wrong verdicts came from the upstream surfaces, not from bad goldens.
That is the correct root-cause classification for all four records.

## Recommendations, not blocking

1. `sk-022` cites the OpenZeppelin skill at `blob/main/...`, a moving reference.
   `sk-015` cites the same file at a pinned raw commit.
   Add the pin `6f215af60eb60017ab1a933ce9d22a479cd42b26` before filing, because
   `main` can move and leave the public issue unverifiable.
2. When `sk-022` is filed, cross-link the open
   `OpenZeppelin/openzeppelin-skills` issue 14 from `sk-015`.
   Both defects live in the same file, so one maintainer will handle both.
3. `sk-022` may add the missing-example fact I verified: the `examples/` tree has no
   `UpgradeableMigratable` example, although the skill's line 100 promises one.
4. `sd-049` also carries no intake override and will hit the same mixed-intake refusal.
   That predates this commit and belongs to the `sd-049` owner-authority task.

## Risks

The four records are now accurate, but none is filed.
The post-candidate stop audit blocks upstream filing without explicit owner authority.
Do not file any of the four until that authority exists.

`sd-052` targets `stellar/stellar-cli`, not the docs repository.
A reader who scans only the collection name may file it to the wrong owner.
The override protects the script path; a hand-filed issue would not be protected.

`sd-051` asks for a heading correction as well as a date addition.
That is a slightly wider ask than the original record.
It is still the smallest correct fix, because the narrower ask produced a false statement.

The `stellar-sdk` npm state is mutable.
If the package is unpublished later, the `sd-050` evidence line needs a re-check.

## Blockers

1. Owner authority for upstream filing is still absent. This is the round-level gate.
2. No other blocker remains. The four records are accurate, deduplicated, owner-mapped,
   and reproducible from public sources.

## Definition-of-done check

| Item | Result |
|---|---|
| Diff scoped, unrelated work preserved | PASS |
| Required gates pass | PASS |
| Generated artifacts from scripts | PASS, `INDEX.md` regenerated |
| Secrets scanning | PASS |
| Independent review completed | this document |
| Findings corrected only where necessary | PASS, three corrections |
| No upstream write performed | PASS |
