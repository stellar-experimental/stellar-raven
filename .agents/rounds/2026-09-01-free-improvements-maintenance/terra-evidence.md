# Free improvements maintenance — Terra evidence lane

Date: 2026-09-01

Scope: read-only evidence. This lane did not post upstream comments. This lane did
not modify finding files or generated files.

## Inputs read

The lane read `AGENTS.md`, `.agents/skills/improvements-pipeline/SKILL.md`,
`improvements/README.md`, `.agents/NEXT.md`, and these four findings:

- `improvements/stellar-docs/sd-001-protocol-n-vs-sep-n-tokenization.md`
- `improvements/stellar-docs/sd-036-cap-0075-protocol-version-field-selector-errata.md`
- `improvements/skills/sk-020-standards-skill-stale-discord-vanity.md`
- `improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md`

The exact TODO question was:

> Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?

The TODO requires repository `stellar/stellar-horizon`.

## GitHub state

Command:

```sh
for target in Stellar-Light/stellarlight#1031 Stellar-Light/stellarlight#1134 stellar/stellar-docs#2805; do repo=${target%#*}; number=${target##*#}; gh issue view "$number" --repo "$repo" --json number,title,state,stateReason,createdAt,updatedAt,closedAt,author,comments,closedByPullRequestsReferences,labels,assignees,milestone,url; done
```

| Ref | Title | State and close reason | Linked work | Issue comments and update time |
| --- | --- | --- | --- | --- |
| `Stellar-Light/stellarlight#1031` | `Include appendix audit identifiers in exact-match indexing` | OPEN. No close reason. | No linked PR or issue. | One comment by `kalepail`, 2026-08-28T16:27:13Z. It records that the trigger no longer reproduced. `updatedAt`: 2026-08-28T16:27:13Z. |
| `Stellar-Light/stellarlight#1134` | `Date DeepWiki answers separately from scanned repository content` | CLOSED, `COMPLETED`, 2026-08-31T04:11:41Z. | Closing PR [#1136](https://github.com/Stellar-Light/stellarlight/pull/1136), merged 2026-08-31T04:11:40Z, commit `8fa9e6edd78f8890cd4018babf04493af70d1164`. Follow-up PR [#1174](https://github.com/Stellar-Light/stellarlight/pull/1174), merged 2026-09-01T03:02:37Z, commit `76cb312d6bcee5260d98720402204feb774a3be6`. | Three comments by `theboycoder`: 2026-08-31T03:57:25Z, 2026-09-01T01:47:10Z, and 2026-09-01T03:14:52Z. The last states that the exact monitor wording returns `28` with `answerSource: knowledge-note`. `updatedAt`: 2026-09-01T03:14:52Z. |
| `stellar/stellar-docs#2805` | `The Validators introduction says ledgers close every 3-5 seconds while the Stellar Stack page says every 5-7 seconds` | OPEN. No close reason. | Linked PR [#2806](https://github.com/stellar/stellar-docs/pull/2806), OPEN, created by `ElliotFriend`, and last updated 2026-08-31T19:01:55Z. | No issue comments. `updatedAt`: 2026-08-31T14:27:45Z. |

Commands for linked PR reads:

```sh
gh pr view 1136 --repo Stellar-Light/stellarlight --json number,title,state,isDraft,author,createdAt,updatedAt,closedAt,mergedAt,mergeCommit,url,comments,reviews
gh pr view 1174 --repo Stellar-Light/stellarlight --json number,title,state,isDraft,author,createdAt,updatedAt,closedAt,mergedAt,mergeCommit,url,comments,reviews
gh pr view 2806 --repo stellar/stellar-docs --json number,title,state,isDraft,author,createdAt,updatedAt,closedAt,mergedAt,mergeCommit,url,comments,reviews
```

PR #2806 has three `stellar-jenkins-ci` preview comments. It has no requested-change review state.
One `copilot-pull-request-reviewer` review identified a minimum-balance formula concern. A later
Copilot review reported no new comments. `ElliotFriend` added one empty `COMMENTED` review.

## Author-side live triggers

### sd-001

Command:

```sh
curl -sS --max-time 90 http://localhost:8787/mcp -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' --data-raw '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"execute","arguments":{"code":"async () => { const queries = [\"Protocol 22\", \"Protocol 23\", \"Protocol 24\", \"Protocol 24 release\", \"software versions\", \"stellar cli install command\", \"brew install stellar-cli\", \"publish event contract events\", \"fee bump transaction inner outer envelope\"]; const responses = await Promise.all(queries.map(query => stellarDocs.search_docs({ query, hitsPerPage: 1 }))); return responses.map((response, index) => { const hit = response.ok ? response.data?.hits?.[0] : null; return { query: queries[index], ok: response.ok, url: hit?.url ?? null, title: hit?.hierarchy?.lvl0 ?? hit?.title ?? null, error: response.ok ? null : response.error ?? null }; }); }"}}}'
```

All nine reads succeeded. The top hits were:

| Query | Top URL |
| --- | --- |
| `Protocol 22` | `/docs/networks/software-versions#protocol-22-mainnet-december-5-2024` |
| `Protocol 23` | `/docs/networks/software-versions#whisk-protocol-23-mainnet-september-3-2025` |
| `Protocol 24` | `/docs/networks/software-versions#protocol-24-mainnet-october-22-2025` |
| `Protocol 24 release` | `/docs/networks/software-versions#release-notes-7` |
| `software versions` | `/docs/networks/software-versions` |
| `stellar cli install command` | `/docs/tools/cli/install-cli#stellar-cli` |
| `brew install stellar-cli` | `/docs/tools/cli/install-cli#stellar-cli` |
| `publish event contract events` | `/docs/build/guides/events/publish` |
| `fee bump transaction inner outer envelope` | `/docs/build/guides/transactions/fee-bump-transactions` |

Result: the original missing-page trigger does not reproduce. The recorded controls also hold.

### sd-036

Command:

```sh
gh api 'repos/stellar/stellar-protocol/contents/core/cap-0075.md' -H 'Accept: application/vnd.github.raw+json' | rg -n -C 3 'field|BLS12_381|BN254|min_supported_protocol'
```

Result: both interface blocks specify `field` as `Symbol`. Both document `BLS12_381` and
`BN254`. Both retain `min_supported_protocol: 25`. The reported contradiction does not reproduce.

### sk-020

Commands:

```sh
gh api 'repos/stellar/stellar-dev-skill/contents/skills/standards/resources.md' -H 'Accept: application/vnd.github.raw+json' | rg -n 'discord\.gg/stellar'
gh api 'repos/stellar/stellar-dev-skill/contents/README.md' -H 'Accept: application/vnd.github.raw+json' | rg -n 'discord\.gg/stellar'
```

Result: `resources.md:233` reads `https://discord.gg/stellardev`. `README.md:126` also reads
`https://discord.gg/stellardev`. The stale `discord.gg/stellar` trigger does not reproduce.

## sls-080 required free reading

The existing listener was confirmed before the reading:

```sh
lsof -nP -iTCP:8787 -sTCP:LISTEN
```

Result: `workerd` PID `15147` listened on `127.0.0.1:8787` and `[::1]:8787`.

Command:

```sh
curl -sS --max-time 90 http://localhost:8787/mcp -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' --data-raw '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"execute","arguments":{"code":"async () => { const result = await scout.explainRepo({ q: \"Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?\", repo: \"stellar/stellar-horizon\" }); if (!result.ok) return result; const data = result.data; return { value: data.answer, generatedAt: data.meta?.generatedAt ?? null, scannedRef: data.codeVerified?.scannedRef ?? null, answerSource: data.answerSource ?? null, repo: data.repo ?? null, routedVia: data.routedVia ?? null }; }"}}}'
```

Returned values:

- Value: `Horizon's protocol ceiling: MaxSupportedProtocolVersion = 28`.
- `generatedAt`: `2026-09-01T18:23:41.351Z`.
- `scannedRef`: `82660510ecda7fd365a14d08badb9d85fa22bc32`.
- `answerSource`: `knowledge-note`.
- Repository: `stellar/stellar-horizon`.
- Routing: `explicit`.

Source command:

```sh
gh api 'repos/stellar/stellar-horizon/contents/internal/ingest/main.go?ref=82660510ecda7fd365a14d08badb9d85fa22bc32' -H 'Accept: application/vnd.github.raw+json' | rg -n -C 3 'MaxSupportedProtocolVersion'
```

Source value at that `scannedRef`: `MaxSupportedProtocolVersion uint32 = 28`.

Result: the returned value matches the source value at the response's own `scannedRef`.
The freshness blocker therefore clears under the TODO match rule. This evidence does not authorize
a paid collection.

## Risks and blockers

- This lane is author-side evidence only. A distinct reviewer must independently re-run the three
  fixed-upstream triggers before any deletion-candidate resolution.
- This lane did not inspect all persistent references or prepare deletion receipts. It must not
  retire `sd-001`, `sd-036`, or `sk-020`.
- `#1031` remains open. Its only issue comment is by `kalepail`. No maintainer activity supports a
  new upstream message. The no-noise rule applies.
- `#2805` remains open. PR #2806 remains open. The issue has no maintainer comment.
- `#1134` is closed and its monitor now matches source. The finding file still needs the authorized
  lifecycle update and a distinct review before retirement.
- The first sandboxed local `curl` could not connect to port 8787. The required reading succeeded
  when the same local command ran outside that sandbox. No new Wrangler process was started.
