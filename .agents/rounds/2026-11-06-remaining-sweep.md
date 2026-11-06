# Truth maintenance continuation 2026-11-06 — remaining work

## Scope

Reopen the original full pending-improvement and drift sweep after PR380 and PR382.
Restore legacy MCP endpoints per the owner's explicit requirement. Starting clean main:
`d5f3a280cc58326ff70719f30f3301ca077a4d51`.

## Lane plan

User requests hc and Astra. All workers use interactive Codex `gpt-6-astra` at high;
no nested agents. Reports are durable files, and retirements require a different reviewer.

- t2r6 (`sweep-alias`): legacy host implementation and focused tests.
- t2r9 (`sweep-docs`): every active Docs finding plus sk-038, upstream activity and live triggers.
- t2rb (`sweep-other`): all other findings, author-owned PRs and Horizon monitor.
- Coordinator: live drift, coverage reconciliation, lifecycle changes, release, production proof.

## Drift verdict

Fresh inventory: Lumenloop, Scout and Mintlify contract snapshots unchanged. All skill pins
and both community catalogs unchanged; 67 selected files fetched and verified. Rendered Docs
anchors unchanged (976 pages, 4,081 headings, 82 ambiguous headings).

Fresh 978-title candidate was built in an isolated temporary clone and compared with the held
666-title manifest on all 544 routing cases. Legacy top1 falls 219→218 and top5 327→326;
q-edge-exhaustive-defi-deep-report loses top5, q-infra-hubble-vs-rpc-layer loses top1, and
q-holdout-a-05-groth16-soroban loses top3. The wallet-dapp operation also falls from rank2
to outside top5 on q-tool-wallets-kit. Retain held titles and #223. No threshold, exposure,
manifest or inventory change ships. Receipt: [drift-routing.json](../../research/audits/2026-11-06-remaining-sweep/drift-routing.json).
The clone was removed by its exit trap.

## Eval verdict

No paid answering or judging ran. Committed routing gate, eval self-test, register check and
QA stale/floors gate pass (zero errors; 85 existing warnings).

## Golden verdict

Reviewed all eight cases due by December4: three protocol, four SCF and one quantum case. Current primary sources support their dated distinctions; no answer or date-only extension is warranted. sls-097 retirement only updates provenance pointers, preserving the dated observation and expected fallback.

## Improvements/issues/PR verdict

All 102 starting active records are assigned (28 Docs + sk-038; 73 other records).
Open Raven issues at start: #223 and #167; no open upstream-ready handoffs.
Untouched recurrence-only issues remain silent.

- sd-081: correct the missed time-bounds partial fix; both deployed snippets now call
  setTimeout(30), while parse/XDR/footprint/import defects remain. Keep active.
- sls-115: new recurrence of the retired Horizon ceiling-note mechanism. Scout selects
  historical29 despite its own scanned source defining30. The prior November5 monitor pass
  missed this exact-reference check. Filed after independent confirmation and public snapshot: [Stellar-Light/stellarlight#1933](https://github.com/Stellar-Light/stellarlight/issues/1933). Read-back confirms the exact owner, author and source snapshot.
- sk-038: ordinary unbusted Docs assets URL remains stale. Canonical source/pin is corrected,
  but delivery is not fully fixed. No retirement or repeated upstream reminder.

Prior dated Docs/Scout reports receive clearly labelled correction notes; their original
observations remain visible. The new finding and the independently verified sls-097 documentation retirement leave 102 active records and 196 resolved receipts after lifecycle integration; no old ID is reused.

## Own-repo todos

Restore `/mcp` and its same-origin OAuth dependencies on live legacy domains.
The previous all-path redirect is incompatible with the owner's retained-client requirement.

## Decisions

- Preserve original aliases and their OAuth origin; canonical browser pages may redirect.
- DNS has no `agent.stellar.buzz`; authenticated Cloudflare enumeration confirms exactly
  `agents.stellar.buzz` and `raven.stellar.buzz` on this Worker. Both retain MCP/OAuth service.
  The connector lacked Workers domain-read permission; the existing Wrangler sdf profile
  supplied the read-only verification without changing credentials or account configuration.
- Publish through a reviewed PR, merge and deploy, verify live, then clean only owned workbenches.

## Final checklist

Completed so far: typecheck; 145 unit files / 3,134 passing tests and three expected failures;
production dry-run build; full smoke 9 files / 140 tests; free eval gates above;
improvements live-reference lint for 102 records; 15 probes recurring, zero fixed candidates,
inconclusive results or errors. Secret tree scan passes.

Independent alias review accepts the restoration and reproduces48 focused smoke tests.
A distinct reviewer also confirms the title-hold evidence directly from full routing rows.
Maintenance cross-review accepts the substantive scope. Lifecycle cleanup and independent final review are complete. Final live-reference lint passes for 102 active findings. Merge, live proof and owned-workbench cleanup follow.


## Reconciliation details

The deterministic coverage receipt confirms every starting ID appears exactly once in the two
review tables: 29 Docs/skill records and 73 other records. The review updates 14 additional local
records where current wording overstated missing metadata, missed partial progress, or treated
historical evidence as current. No recurrence-only upstream comments were added.

Two warranted public corrections were posted and read back with author/body verification:
- sd-081: https://github.com/stellar/stellar-docs/issues/2562#issuecomment-6686867459
- ll-022: https://github.com/lumenloop/lumenloop-backend/issues/38#issuecomment-6686881728

Docs PR3066 and PR3067 are proposed fixes, not deployed evidence. PR2752 remains draft/conflicted;
PR3053 has requested changes. Keep their findings active. No author-owned upstream PR needs
unhandled changes or a ceremonial rebase.

sls-097's original defect is the omitted 502 JSON contract, explicitly separate from model
availability. Author t2r9 and distinct reviewer t2r6 independently fetched live OpenAPI1.9.122,
confirmed the deployed PR1929 schema and directory fallback, and validated historical/current
handler error bodies with positive and negative local fixtures. This proves the documentation
fix without a paid POST or an unsupported claim about current model availability.
See `2026-11-06-remaining-sweep/sls097-author.md` and `cross-review.md`.


## Final lifecycle result

sls-097 retired through the resolver, with immutable source, live evidence and distinct review
in `improvements/resolved.json`. Golden answer and dates are unchanged; provenance links and
four historical locators now remain navigable after deletion. Final active count: 102; resolved:196.
Resolution verification was posted to both recorded upstream references and read back exactly:
- https://github.com/Stellar-Light/stellarlight/issues/1908#issuecomment-6687147857
- https://github.com/Stellar-Light/stellarlight/pull/1929#issuecomment-6687148441

Earlier preparation notes describe the pre-resolver state; this result supersedes those pending
steps. The final cross-review records verification of the removed file, receipt and generated index.
Production deployment and post-merge host verification will be recorded on the release PR.
