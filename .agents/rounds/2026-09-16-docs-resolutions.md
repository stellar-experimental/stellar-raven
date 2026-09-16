# Docs resolution verification — 2026-09-16

## Scope

This record covers Raven handoffs #158–#162 and findings `sd-040`, `sd-041`, `sd-044`, `sd-045`, and `sd-051`.
The user authorized necessary fixes and closure work.
The Astra coordinator repeated the original source and index checks.
Grok 4.6 high completed the independent source, index, and golden review.

## Live evidence

The coordinator ran the probes at `2026-09-16T18:46:57Z` and `2026-09-16T18:47:41Z`.
The probes used the committed Raven Docs adapter with read-only production credentials.
Credentials remained in process memory.

| Finding | Source and index observation | Complete indexed sections |
| --- | --- | --- |
| `sd-040` | The conversion example returns `Result<Address, ConversionError>` without `.unwrap()`. The text distinguishes conversion errors from malformed-XDR panics. | 7 |
| `sd-041` | The lead states that many services still use memos. It retains support for memos and muxed accounts. | 15 |
| `sd-044` | Operation Modes documents the flag, default, setting, local-network limit, persistent-configuration limit, and one-ledger behavior. | 5 |
| `sd-045` | The frontend guide qualifies localhost HTTP and presents HTTPS as an option. | 35 |
| `sd-051` | The history page separates February 20 Mainnet activation from the February 5 software release. | 159 |

The original `sd-044` query returns two relevant indexed records.
The rendered Run Commands example contains the flag and the Core port mapping.
That example page itself returns a soft-empty index response.
This limitation does not reproduce the original missing-flag search trigger.
The evidence does not claim that every Quickstart page is indexed.

The source and index retain HTML entities in some code blocks.
Raw marker counts therefore do not prove the absence of an encoded code fragment.
The extracted section text establishes the `Result<Address, ConversionError>` return type.

Evidence files:

- [Source and index counts](2026-09-16-docs-resolutions/priority-recheck.json).
- [Complete affected section extracts](2026-09-16-docs-resolutions/priority-sections.json).
- [Original Quickstart search and example check](2026-09-16-docs-resolutions/sd044-recheck.json).

## Reproduction

Run from a configured repository root. Each script reads `.dev.vars` without printing credentials.

```sh
./node_modules/.bin/esbuild .agents/rounds/2026-09-16-docs-resolutions/scripts/priority-source-index-recheck.ts --bundle --platform=node --format=esm --outfile=/tmp/raven-docs-source-index.mjs
node /tmp/raven-docs-source-index.mjs
./node_modules/.bin/esbuild .agents/rounds/2026-09-16-docs-resolutions/scripts/priority-index-section-extract.ts --bundle --platform=node --format=esm --outfile=/tmp/raven-docs-sections.mjs
node /tmp/raven-docs-sections.mjs
./node_modules/.bin/esbuild .agents/rounds/2026-09-16-docs-resolutions/scripts/sd044-search-recheck.ts --bundle --platform=node --format=esm --outfile=/tmp/raven-docs-quickstart.mjs
node /tmp/raven-docs-quickstart.mjs
```

## Golden reconciliation

The independent reviewer approved the Freighter correction and its provenance.
The question and all three avoid rules remain unchanged.
The correction removes the expired HTTPS caution and uses the pinned Freighter source at `be7c780c7c7d6d1d2900515531b549fdce9a5ef3`.
The W3C note preserves the user-agent and loopback-resolution condition.
The same commit contains the `sd-045` receipt and the completed reviewer stamp.

The reviewer first inspected the primary checkout instead of this candidate worktree.
The reviewer withdrew the missing-ledger finding after checking the correct worktree.
The final report records the corrected merge SHA and measured timestamps.
Earlier observations in that dated report describe pre-landing state.
This ledger records the final candidate state.

- [Independent source matrix](2026-09-16-docs-resolutions/sd045-golden-matrix.json).
- [Golden and provenance approval](2026-09-16-docs-resolutions/freighter-golden-review.json).
- [Full independent review](2026-09-16-docs-resolutions/docs-review.md).
- [Unchanged saved plan results](2026-09-16-docs-resolutions/plan-invariance.json).

The saved plan run produced identical rows and totals before and after this change.
Only the run timestamp and checkout path changed.
No paid evaluation or paid rejudge ran.

## Resolution receipts

All five original source and index defects passed independent verification.
The coordinator posted eleven upstream resolution comments and read each comment back.
The resolver then wrote five receipts and removed the five active findings.
`improvements/intake.json` and the generated index match those receipts.
The active index now contains 56 findings.

[Posted comment URLs](2026-09-16-docs-resolutions/posted-resolution-comments.json) preserve the upstream verification references.
The parent will close Raven #158–#162 after this commit lands.
The #162 closure will correct its handoff year to February 5, 2024.

## Candidate verification

- Type generation and typecheck passed.
- All 2,074 unit tests passed across 114 files.
- The build passed.
- QA compilation retained 500 cases and 500 reserved IDs.
- The consistency register stayed current with zero reopened clusters.
- QA lint passed with zero errors and 60 existing warnings.
- Live improvements lint passed with 56 active findings.
- All seven recurrence probes ran: seven recurring, zero inconclusive, and zero errors.

No runtime code changed. These Docs corrections already reached their upstream production deployment.
The source/index probes used the Raven adapter directly, rather than the deployed worker MCP route.

## Other issue state

The owner closed Raven #40 at `2026-09-16T18:38:30Z`.
The coordinator observed the closure through the GitHub issue and event APIs.
The user then supplied an authenticated session and approved one short test message.
The production copy check passed at approximately `2026-09-16T19:00Z`.
The completed answer showed a Copy button and a successful copy message.
Native Chrome paste preserved the exact 22-character Markdown text:

```text
**Copy check**
`raven`
```

The coordinator cleared the unsent pasted text. No second message ran.
The page displayed the 8,000-character limit.
The browser automation clipboard could not read the page's clipboard directly.
Native Chrome paste supplied the actual clipboard verification.
The [acceptance comment](https://github.com/stellar-experimental/stellar-raven/issues/40#issuecomment-5702963203) records the result.
GitHub read-back confirmed the comment and the closed issue state.
