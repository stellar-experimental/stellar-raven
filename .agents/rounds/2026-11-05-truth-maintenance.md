# Truth maintenance 2026-11-05

## Scope

Review every active improvement and outstanding drift/upstream-ready issue against current upstream evidence. Merge verified completed work, retain unresolved findings, and avoid routine upstream comments. User authorized hc Astra fan-out and cleanup of workbenches created for this round.

## Lane plan

- Coordinator (`t1d1`): drift regeneration, cross-lane reconciliation, gates, resolution receipts, publication.
- Astra high Docs lane (`t2dv`): every stellar-docs finding and related inbound handoff.
- Astra high Scout lane (`t2dw`): every stellar-light-scout finding and related upstream state.
- Astra high other lane (`t2dx`): every Lumenloop, skills, canonical-source, and workers-ai-provider finding.
- Workers own separate report files; coordinator owns shared artifacts and status changes. Independent live rechecks precede every retirement.
- Use hc per explicit user instruction, superseding legacy Herdr launch syntax. No paid evals or research calls.

## Drift verdict

Candidate absorbs Scout 1.9.122, the Mintlify contract snapshot, heading anchors, and
stellar-dev `77bf4e8fc253` / stellar-light `f63e83a02102` pins. No new operation is exposed.
All twelve Scout exclusions remain. Inventory surface and routing-text comparisons are equal;
whole-object comparison differs on sixteen operations and twelve shared schemas. This is schema
contract drift, not provenance-only drift. The only runner uses three Lumenloop operations;
the changed-operation intersection is empty.

The fresh Docs title vocabulary (666 → 978) remains rejected: on `q-tool-wallets-kit`,
`stellarDocs.search_wallet_dapp_docs` drops from rank 2 out of the top five. The existing title
hold and issue #223 remain open. With held titles, all 544 cases retain their grades and all
lane totals are unchanged. One extended case, `q-sor-testing-negative-auth-events`, replaces
its fifth result (`stellarDocs.search_docs`) with `scout.analyzeEcosystem`; the first four
results remain Docs. This schema-keyword capture stays within the existing general routing
work item. No threshold or accepted total changes; only the manifest evidence hash refreshes.

Mintlify changed heading links from `aria-label="Navigate to header"` to heading-specific
labels. The existing builder silently emitted zero headings. The repaired parser accepts the
navigation-label family while requiring a matching fragment, and refuses a zero-heading index.
Live recapture: 976 pages, 4,081 headings, 82 ambiguous headings. Against the committed index,
one existing page adds headings and five pages appear; no prior page disappears. Focused tests: 141 pass.

Commands: `npm run docs:anchors:build`, `node scripts/refresh-inventory.mjs`,
`./ecosystem-skills/update.sh`, `node scripts/check-mirrors.mjs --fetch`, catalog/micro-map/spec/
op-class builders, `node scripts/diff-inventory.mjs surface|text|deep`, and baseline/fresh/held
`node eval/run-routing.mjs --dump-ranked ...` comparisons. All 67 pinned files passed live hash
verification. The full title candidate and intermediate logs remain under ignored `tmp/`.

Durable routing evidence: `research/audits/2026-11-05-drift-routing.json` records manifest hashes,
complete operation-change categories, lane totals, three score changes (one ordering change), and
the rejected title-refresh example. No grade changes occur. Distinct Astra/high t2dw accepted after the canonical redirect escape
and a metadata typo were fixed; see `drift-review.md`.

The sd-079 live closure also triggers the existing Hosting TODO: all alias routes now redirect,
with a reconnect notice in README and the public guide. Current `llms-full.txt` has zero alias
host mentions. The alias unit and assembled-worker smoke checks pass (127 smoke tests).

## Eval verdict

Free focused gates only; no new paid answering or judge measurement authorized.

## Golden verdict

Final stale/floor lint passes with 0 errors and 85 warnings. No past-due case exists.
The next four-week queue includes four SCF/RFP cases (November 10–12), three protocol cases
(November 24), and the quantum-plan case (December 1). Scout lane checks the four SCF/RFP cases
because this round changes their underlying findings. Protocol/quantum cases remain on their
existing due dates unless this round establishes new evidence. Remove resolved-conflict caps
only after live confirmation through golden-truth.

## Improvements/issues/PR verdict

All 130 starting records appear exactly once across the primary action tables: Docs 46,
Scout 23, other collections 61. Set comparison against `fec1c79f` reports no missing or extra IDs.
The primary classifications are evidence, not automatic retirement decisions; distinct fresh
checks in `docs-independent.md` and `upstream-independent.md` gate each closure.

The other-collections review found 53 still reproducible, three partial, three inconclusive and
two fixed. The three uncertain Lumenloop claims remain explicitly unproven; missing metadata
is not upgraded into a demonstrated false statement. cs-007 is now filed and read back as
https://github.com/trionlabs/stellar-8004/issues/71. Paxos metadata intake remains honestly unclear.

Thirty-one retirements are complete: twenty Docs findings, sk-037, cs-011, and nine Scout findings. The sd-089 partial concern was resolved by independent SDK-shaped fixtures; its successful restoration preview is valid and separate restoration guidance remains intact.
Each receipt records the original-source permalink, fresh trigger, distinct reviewer and the
posted/read-back resolution comment. Scout partials remain active, including sls-101's stale
values despite its improved warning.

## Own-repo todos

Hosting alias completion is removed from TODO. Follow-up tasks now name the exact owner data
jobs, pending PR deployment signals, original triggers and uncertain evidence to check. No
recurrence-only upstream reminder is queued.

## Decisions

Preserve unrelated existing worktrees. Upstream closure or merge alone is not proof of deployment or resolution.

## Final checklist

All 130 original findings reviewed; 31 independently verified retirements, 3 new residual findings, and 102 remaining records. Nineteen Docs handoffs closed and read back. Live intake lint passes; final probes report 15 recurring, 0 fixed candidates, 0 inconclusive and 0 errors.

All requested independent reviews have completed and findings are reconciled: drift, all retirements, seven Docs goldens, twelve Scout cases plus the wallet note, historical provenance, register semantics and prompt fixtures. Deterministic eval selftests, routing, pin review, corpus lint, register check, static judge fixtures and the guarded Albedo sentinel pass. Generated artifacts were rebuilt with their scripts. No paid answering/judge run or rescoring occurred.

Typecheck, dry-run build and 127 smoke tests pass. On committed a210d39c, all 145 unit files pass: 3,134 tests plus three expected failures. The pre-commit cs-001 permalink failure disappears on the committed snapshot without a test or implementation change. Full generated-artifact rebuild produces zero diff, and register --check passes. Tree and staged secret scans pass, including all new evidence and reproduction scripts. All three Astra workers and their owned children/checkouts are cleaned up. Publication/deployment follows.

### Production before publication

The connected Raven `execute` call on 2026-11-06 describes `scout.getStablecoins`
without `assetType` and reads the dapp skill from `9c604c2be6ae69f962fbb578bce6b681d462fea5`.
The served body does not contain the corrected mixed-transaction warning. This establishes
that the pending pin/schema changes need deployment, not only a merge.

### Previously retired findings with open upstream issues

Read all 234 unique GitHub refs from 164 existing receipts; all resolved to their expected issue/PR.
Four were still open. Fresh checks on 2026-11-06:

- sd-003: `stellarDocs.search_docs({query:"getTransactions API reference limit",hitsPerPage:3})`
  returns the exact RPC method page first. Existing November 2 resolution comment already explains
  Mintlify coverage. Closed stellar/stellar-docs#2566 without another comment; read back closed/completed.
- sls-068: `scout.searchRepos({q:"fluxity",limit:20})` returns exactly four luanlabs repositories
  (`fluxity-interface`, `fluxity-api`, `fluxity-v1-core`, `fluxity.finance`), all linked to Fluxity.
  Existing August 25 resolution comment remains valid. Closed Stellar-Light/stellarlight#972 silently;
  read back closed/completed.
- sd-029: stellar/stellar-docs#2602 remains open because active successor sd-053 owns the remaining
  BACKFILL documentation defect. No comment or closure.
- sls-020: the exact original transition query returns the complete consolidation record at rank 3
  (meeting its top-three criterion), and the controlling HackerOne policy at rank 12. Both retain
  the May 7 date, deprecated general Immunefi program and separate OpenZeppelin carve-out.
  The initial top-two projection was insufficient, not a regression. Closed Stellar-Light/stellar-scout#10
  without another comment; read back closed/completed.

Substantive correction posted and read back: [Liqvid award/submission correction](https://github.com/Stellar-Light/stellarlight/issues/1903#issuecomment-6674314385),
by Raven author kalepail. The correct awarded rounds are 37 and 45; 30 and 44 were not awarded.
This is a correction to our original recommendation, not maintainer acceptance.

sd-096 now records ElliotFriend's explicit November 5 decline: the three source paths never existed.
The 308-to-404 requests still reproduce, but no real historic link is established. No refiling or
follow-up comment is warranted without new traffic evidence.


### Final code verification

Independent review found an inherited double-slash redirect escape. The redirect now builds the
canonical origin first, then assigns pathname/search; unit and assembled-worker tests cover
`//evil.example/mcp?x=1` staying on the canonical host. Typecheck, 127 smoke tests, and dry-run
build pass. The first full-unit rerun had one intentional prompt-fixture mismatch after removing
the obsolete sd-078 golden caveat; 3,133 tests passed and three expected failures remained.
The fixture is recomputed from `buildJudgePrompt`, not from a model verdict; all 15 static
prompt fixtures then pass. Final corpus/gate/full-unit results follow below.

Deployment destination checked read-only with `wrangler whoami`: active profile `sdf`, account
Ecosystem - Stellar (`ba55b7ae9acfb3ed152103e3497c0752`), Worker `stellar-raven-codemode`.


A full local blob audit of the resolved receipts found six unavailable historical snapshot SHAs:
sd-010/018/033/043 and sls-020/023. The receipt dates and resolution claims are unchanged;
sourceCommit/sourceUrl now point to the latest surviving record revision on origin/main before
retirement. Exact before/after mappings: `research/audits/2026-11-05-improvements/resolved-source-repairs.json`.
The old sls-020 SHA also returned GitHub422. Independent public-blob verification is recorded in
`upstream-independent.md`; no new upstream reminder is needed for a local provenance repair.

### Adjacent residuals and historical provenance

Three independently accepted residuals were filed and read back as kalepail:
- sk-038: https://github.com/stellar/stellar-dev-skill/issues/177 (custom SAC admin signer qualification).
- sd-097: https://github.com/stellar/stellar-docs/issues/3064 (outdated Algolia backend name).
- sd-098: https://github.com/stellar/stellar-docs/issues/3065 (five deprecated raw event examples on two other pages).

The existing cs-007 filing brings this round to four warranted new upstream reports. No routine recurrence reminders were posted.

Historical reference review caught a second provenance issue: eight Scout/skill source links needed older revisions to match the original captured hashes. Those links now identify the exact bytes. Eight Docs finding captures have no matching revision in surviving main history. Their original hashes are retained as capturedSha256, while snapshotSha256 and snapshotNote explicitly identify and qualify the later published context. No historical result or capture digest was replaced to manufacture agreement.
