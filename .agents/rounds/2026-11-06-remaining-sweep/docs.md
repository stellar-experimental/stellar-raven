# Remaining Docs sweep — 2026-11-06

Reviewer t2r9; all **28 active stellar-docs findings plus sk-038** enumerated exactly once. **0 whole-finding fixed candidates; 27 still reproduce and 2 partial (sd-081, sk-038).** No source/finding/golden edits, GitHub mutations, paid calls, transactions, nested agents or commits by this lane. The coordinator owns any later reconciliation.

Read truth-maintenance, improvements-pipeline, improvements README, Nov5 root/Docs/independent/retirement ledgers and Nov6 skill-handoff/review. Fresh GETs and GitHub reads ran about13:52–14:00 UTC. Source snapshot `b085617ffa0f0d5df5b9380e64c55fb7f157b9ce`; external disposable clone `/tmp/raven-docs-sweep-2026-11-06`. Full deterministic request/source/check metadata: [docs-actions.json](docs-actions.json), [durable evidence](../../../research/audits/2026-11-06-remaining-sweep/docs-evidence.json). Exact raw responses and bodies: `tmp/sweep-2026-11-06/docs/`.

## Material omissions and changes

1. **sd-081 partial fix was missed by the Nov5 sweep.** PR [2977](https://github.com/stellar/stellar-docs/pull/2977) merged **Nov3 16:14:21Z**, commit `d7845d6c594bfac2c1a9cbc856ccd68d92d66eb0`, adding `.setTimeout(30)` to BOTH restoration copies. Their current lines60/357 confirm it. The initial Nov2 evidence predates the fix; the later missing-timebounds recurrence is wrong. Remove only the current timeout claim/recommendation; retain active residuals. Fresh TypeScript5.9.3/SDK17.4.0 fixture proves parse1131/1128 on both and TS2440 on exact helper+restore-data composition. Current `Api, Server` import ordering differs from old quoted `Server, Api`, with the same conflict.

2. **PR2752 is more than an idle green draft.** Current GraphQL says DIRTY/REVIEW_REQUIRED;15 unresolved threads,9 not outdated. Its identifier/serialization debate and Python/JS/Java/Go runnable-code problems need author resolution. Historical Aug19 green checks do not prove current merge readiness. A narrow Balance-ID sentence fix could be proposed only through the owner decision already offered on2998; do not create another ceremonial comment.

3. **New PRs3066 and3067 must be tracked.** sd-097/sd-098 now have real pending patches (both green, REVIEW_REQUIRED/BLOCKED), with bot self-review. Neither is deployed. PR3067 also removes a stray minus in auth code and changes invalid string-to-Address conversion to `Address::from_str`; the explicit placeholder still needs substitution. Source inspection/render checks do not replace compilation of complete snippets or emitted-event equivalence checks.

4. **sk-038 still has a delivery residual.** Ordinary, unbusted Docs URL returned old SHA `141b4f4417599cd1679f7c82f26fae50f6eb5ca9a50c12f66bc14f72e5694856`, including all3 old claims. Canonical and generated source match corrected hashes `ead389...` and `0cbd9c...`. Handoff381 is now CLOSED with a partial verification comment by **kalepail**, not owner acceptance of a full fix. Do not reopen notification or retire finding solely on that closure.

5. **PR3069 is pending Docs skill delivery work.** It changes8 generated skill source markers and4 Raven links in standards; its assets hunk changes provenance only. It does not supply new sk-038 prose and does not establish ordinary-URL cache correction. Track review/merge separately from sk-038.

6. **Protocol lookahead:** Mainnet remains29 while Testnet is30. Statuspage marks Nov3 Testnet upgrade completed; Mainnet vote remains scheduled Nov23 17:00UTC. The3 Nov24 cases use explicit dated illustrations and accept new grounded observations, so no forced extension or gospel edit is justified. Current answers must not call the Testnet vote pending.

## Per-ID state, action and evidence

Upstream states below are fresh reads, not inferred from issue labels. “Keep” means local tracking; silence remains the default. Exact URLs, head hashes, latest-comment authors and timestamps, review threads, checks and re-run commands are in the JSON.

| ID | Live state / evidence | Upstream state / blocker | Action / wake-up |
|---|---|---|---|
| sd-004 | **still-repro** — Pagination still says hardcoded. Owner ElliotFriend accepted stock caps as operational policy; no new recommendation to raise limits. | [2567](https://github.com/stellar/stellar-docs/issues/2567) closed; [2572](https://github.com/stellar/stellar-docs/pull/2572) merged  unknown | Keep declined; revisit only operator policy or implementation drift |
| sd-005 | **still-repro** — Both overview and x402 introduction still credit Coinbase Developer Platform. No newer upstream response. | [2565](https://github.com/stellar/stellar-docs/issues/2565) open | Keep narrowed attribution request; optional landscape comparison stays optional |
| sd-009 | **still-repro** — Canonical SEP-6 still says interactive components deprecated; anchors/SEP6 guides do not. Owner placement decision unchanged. | [2575](https://github.com/stellar/stellar-docs/issues/2575) closed | Keep declined; canonical SEP source coverage is the next useful event |
| sd-014 | **still-repro** — Fresh Discovery query returns adjacent lifecycle/simulation material; current Docs tree has no inclusion-proof/verification-guide phrase. Enhancement, not an incorrect existing wire description. | [2611](https://github.com/stellar/stellar-docs/issues/2611) open | Keep accepted enhancement; needs author and Core review |
| sd-032 | **still-repro** — Wallet intro still pins wallet^1.0.6/general^2.1.3; pub.dev wallet1.1.8 requires general^3.10.0. This is silent backtracking, not proved solver failure. Prior2810 closed unmerged. | [2606](https://github.com/stellar/stellar-docs/issues/2606) open; [2898](https://github.com/stellar/stellar-docs/pull/2898) open REVIEW_REQUIRED DIRTY | PR2898 needs rebase and current CI, then deployed dependency check |
| sd-035 | **still-repro** — Deployed tutorial intentionally pins @^1 and describes new StellarWalletsKit. Merged2659 was only the stopgap; package-scope claim stays withdrawn. | [2609](https://github.com/stellar/stellar-docs/issues/2609) open; [2659](https://github.com/stellar/stellar-docs/pull/2659) merged  unknown | Joint v2 migration of tutorial and basic-payment-app; no reminder |
| sd-048 | **still-repro** — CAP0075 interface still lists3,5,7,11; semantics and current host constant only5. Issue stale-bot closure is not a substantive decline. | [2010](https://github.com/stellar/stellar-protocol/issues/2010) closed; [2059](https://github.com/stellar/stellar-protocol/pull/2059) open  behind | Author PR2059 awaits review and branch refresh; no stale-bot keepalive |
| sd-050 | **still-repro** — Live prose still calls the library stellar-sdk beside a scoped npm link. No duplicate report. | [2561](https://github.com/stellar/stellar-docs/issues/2561) open | Keep existing oceans404 issue; wait SDK-section rewrite |
| sd-053 | **still-repro** — BACKFILL section still omits ordinary fresh-start archive tip and fatal local-gap precheck. Nov4 port is not deployed. | [2602](https://github.com/stellar/stellar-docs/issues/2602) open; [2899](https://github.com/stellar/stellar-docs/pull/2899) open REVIEW_REQUIRED DIRTY; Mintlify Deployment:failure | PR2899 needs conflict resolution, failed deployment check repair and RPC-team decision |
| sd-054 | **still-repro** — Both original pages still say5-7 seconds. Fresh Mainnet ledgers65337260–65337459 yield199 intervals of5s; not a guarantee for every ledger. | [2889](https://github.com/stellar/stellar-docs/issues/2889) open; [2931](https://github.com/stellar/stellar-docs/pull/2931) open REVIEW_REQUIRED DIRTY | PR2931 needs rebase to validators/index, links and adjacent usdt0 snippet |
| sd-058 | **still-repro** — Exact served extraction expressions throw txEnvelope.v1 is not a function and tx.toEnvelope(...).v1 is not a function on SDK17.4.0. No RPC/signature/submission. | [2909](https://github.com/stellar/stellar-docs/issues/2909) open; [2932](https://github.com/stellar/stellar-docs/pull/2932) open REVIEW_REQUIRED DIRTY | PR2932 needs rebase/current CI; after merge run both complete local flows |
| sd-059 | **still-repro** — Seven original bare/verbatim Discovery queries return200 and omit their expected result-code page from38–50 raw candidates. Public site MCP op_bad_signer returns Set Options first. No filter or content workaround is newly justified. | [2995](https://github.com/stellar/stellar-docs/issues/2995) open | Mintlify relationship owner must decide escalation; preserve no-content-edit request |
| sd-061 | **still-repro** — Live guide still says getLedgerEntries obtains Balance ID. GraphQL now says DIRTY, REVIEW_REQUIRED;15 unresolved threads,9 current, including identifier and runnable-code problems. Historical green build is not current readiness. | [2998](https://github.com/stellar/stellar-docs/issues/2998) open; [2752](https://github.com/stellar/stellar-docs/pull/2752) open REVIEW_REQUIRED DIRTY | Draft2752 needs author work; consider standalone sentence fix only after owner decision |
| sd-062 | **still-repro** — Live Registration page and BOTH OpenAPI YAML copies retain Anchor Platform separate-host paragraph and typos. Latest bot response claims TOML/troubleshooting corrections; not deployed. | [2999](https://github.com/stellar/stellar-docs/issues/2999) open; [3010](https://github.com/stellar/stellar-docs/pull/3010) open CHANGES_REQUESTED BLOCKED | ElliotFriend must clear requested review on3010; then page/spec/TOML/troubleshooting recheck |
| sd-064 | **still-repro** — Ordinary meetings/authors root, kalepail and elliotfriend URLs still404. Latest unrelated commenter is not a maintainer fix claim. | [2945](https://github.com/stellar/stellar-docs/pull/2945) open REVIEW_REQUIRED BLOCKED | 2945 needs maintainer review/merge, then all three redirect checks |
| sd-070 | **still-repro** — Live migration guide still says added Option c traps UnexpectedSize without SDK28/CAP86 scope. Old draft remains unmerged. | [2763](https://github.com/stellar/stellar-docs/pull/2763) open REVIEW_REQUIRED BLOCKED | Draft2763 needs author completion and maintainer review |
| sd-074 | **still-repro** — Scaffold and Hello World frontend still name environments.toml; proposed correction and removal of unsupported Public Good claim remain pending. | [2708](https://github.com/stellar/stellar-docs/pull/2708) open REVIEW_REQUIRED BLOCKED | 2708 needs maintainer review/merge; fork preview is neutral, not deployment |
| sd-077 | **still-repro** — Funding index requires a live product; dedicated Marketing Grants page data permits preparing to launch soon. No public issue owner established; do not manufacture one. | No public owner/ref | Keep verified/unclear owner; obtain program-owner eligibility decision |
| sd-081 | **partial** — Missed fix: BOTH restoreContract examples now have setTimeout(30), deployed by PR2977 Nov3. Both still fail TypeScript1131/1128, lack xdr import, read an instance key as entry and use a response as key. Exact helper+restore-data composition reports TS2440 Api conflict. | [2562](https://github.com/stellar/stellar-docs/issues/2562) open; [2977](https://github.com/stellar/stellar-docs/pull/2977) merged  unknown | Correct current missing-timebounds claim; keep parse/XDR/footprint/Api residual active |
| sd-088 | **still-repro** — Live SCP value, tx-set hash, close time and upgrades remain sibling headings; following-three-fields sentence persists. Nov5 CAP88 clarification exists only on PR. | [3035](https://github.com/stellar/stellar-docs/issues/3035) open; [3050](https://github.com/stellar/stellar-docs/pull/3050) open REVIEW_REQUIRED BLOCKED | 3050 awaits maintainer review; verify heading nesting and protocol-scoped ext text after deployment |
| sd-090 | **still-repro** — Live tagged examples still combine A/mapB; integer section still claims ScVec and struct JSON. PR also fixes Python to_uint32 and adjacent enum descriptions; CI is not Python/Java/PHP snippet execution evidence. | [3037](https://github.com/stellar/stellar-docs/issues/3037) open; [3052](https://github.com/stellar/stellar-docs/pull/3052) open REVIEW_REQUIRED BLOCKED | 3052 awaits review; execute each corrected language example before resolution |
| sd-091 | **still-repro** — Exact served HTTP function throws SyntaxError for all three mocked object responses. PR handles result.error after Nov6 response but remains CHANGES_REQUESTED. | [3038](https://github.com/stellar/stellar-docs/issues/3038) open; [3053](https://github.com/stellar/stellar-docs/pull/3053) open CHANGES_REQUESTED BLOCKED | Clear requested review on3053, then rerun success/top-level-error/result.error fixtures |
| sd-092 | **still-repro** — Live bullet still permits source of any operation or transaction. PR includes InvokeHostFunction restriction and explicit MuxedAddress argument qualification. | [3039](https://github.com/stellar/stellar-docs/issues/3039) open; [3054](https://github.com/stellar/stellar-docs/pull/3054) open REVIEW_REQUIRED BLOCKED | 3054 awaits review; after deployment preserve both source positions and fee-bump/destination distinction |
| sd-093 | **still-repro** — Live footprint sentence still serializes every overlap; storage-strategies still uses touch shared entries. PR includes adjacent write wording. | [3040](https://github.com/stellar/stellar-docs/issues/3040) open; [3055](https://github.com/stellar/stellar-docs/pull/3055) open REVIEW_REQUIRED BLOCKED | 3055 awaits review; check original sentence and adjacent touch/write copy after merge |
| sd-095 | **still-repro** — Live passkey private key never-leaves-device claim remains. PR removes hardware-key example and adds one-passkey/no-recovery boundary; no claim of actual user synchronization or vulnerability. | [3042](https://github.com/stellar/stellar-docs/issues/3042) open; [3057](https://github.com/stellar/stellar-docs/pull/3057) open REVIEW_REQUIRED BLOCKED | 3057 awaits Platform-team signoff, then maintainer merge and live recheck |
| sd-096 | **still-repro** — All3 invented source paths still308→404. Explicit owner decline remains; this is not evidence of formerly valid links regressing. | [3028](https://github.com/stellar/stellar-docs/issues/3028) closed | Keep declined and silent absent real inbound links or traffic |
| sd-097 | **still-repro** — Production Building with AI still says via Algolia. New one-line Mintlify PR is green, BLOCKED/REVIEW_REQUIRED; bot self-review is not independent acceptance. | [3064](https://github.com/stellar/stellar-docs/issues/3064) open; [3066](https://github.com/stellar/stellar-docs/pull/3066) open REVIEW_REQUIRED BLOCKED | Track NEW3066; await independent maintainer review and deployment |
| sd-098 | **still-repro** — All five live raw event publishes remain:4 auth +1 contract-spec. New typed-event PR is green, BLOCKED/REVIEW_REQUIRED; self-review reports source inspection, not full compilation. Placeholder addresses remain explicit placeholders. | [3065](https://github.com/stellar/stellar-docs/issues/3065) open; [3067](https://github.com/stellar/stellar-docs/pull/3067) open REVIEW_REQUIRED BLOCKED | Track NEW3067; compile snippets and compare topics/data before accepting deployed fix |
| sk-038 | **partial** — Canonical assets and generated Docs source corrected. Ordinary unbusted Docs skill URL still serves old prerequisite, nobody-can-sign warning and checklist; SHA141b4f441759... remains unchanged. Handoff381 CLOSED explicitly partial, not a resolved receipt. | [177](https://github.com/stellar/stellar-dev-skill/issues/177) closed; [178](https://github.com/stellar/stellar-dev-skill/pull/178) merged  unknown | Keep delivery residual active; recheck ordinary URL after cache expiry/invalidation |

## Handoffs and pending PR completeness

Read all current open Raven issues: only223 (drift) and167 (RWA) remain; neither is an inbound handoff. Fresh recent-handoff query returned all19 prior Docs notifications plus381, all closed. Their state, update time and URLs are in `docs-actions.json`; no new Docs notification was missed. sk-038 closure explicitly preserves its active residual.

Enumerated **all66 currently open stellar/stellar-docs PRs**, plus linked historical/cross-repo refs (141 refs total). All66 have state/head/check/latest activity receipts. Read actual patches and unresolved review threads for18 relevant PRs:2708,2752,2763,2898,2899,2931,2932,2945,3010,3050,3052,3053,3054,3055,3057,3066,3067,3069. No pending Docs PR in this set is authored by kalepail; direct author responsibility differs from a needed maintainer decision. CAP PR2059 is kalepail-owned and remains BEHIND/review-required with green checks.

PR3010 and3053 remain **CHANGES_REQUESTED**, despite responses claiming completed fixes. PR3057 explicitly needs Platform-team signoff. PR2898/2899/2931/2932 are DIRTY;2899 has a failing Mintlify deployment and cannot run the normal checks until conflicts clear. PR2763 remains draft; GraphQL BLOCKED should not be described as clean.

## Reproduction commands and fixed-candidate boundary

No entire record qualifies for retirement. The partial fix and next sk-038 resolution candidate have exact commands:

```sh
python3 research/audits/2026-11-06-remaining-sweep/docs-live.py sd-081 sk-038
npm install --prefix /tmp/raven-docs-sweep-sdk --ignore-scripts @stellar/stellar-sdk@17.4.0 typescript@5.9.3
node research/audits/2026-11-06-remaining-sweep/docs-sdk.mjs
gh api repos/stellar/stellar-docs/pulls/2977
gh api repos/stellar/stellar-docs/pulls/2977/files
curl -sS -L -D /tmp/sk038.headers 'https://developers.stellar.org/.well-known/agent-skills/assets/skill.md' -o /tmp/sk038.md
rg -n -C 4 'One hard prerequisite|Do it in this order|confirm the master key' /tmp/sk038.md
shasum -a 256 /tmp/sk038.md
```

For sk-038, inspect the prerequisite, handover warning and final checklist together; other signers/thresholds and complete lockout must be qualified. A successful cache-busted request, source hash or merged PR cannot substitute for this ordinary URL. Distinct reviewer plus lifecycle/reference reconciliation still gates retirement.

Other exact scripts: `python3 .../docs-github.py` inventories public activity; `node .../docs-search.mjs` repeats8 free searches (seven sd-059 triggers and sd-014), with the assistant key loaded privately; `python3 .../docs-protocol.py` performs network/version lookahead. Scripts live in `research/audits/2026-11-06-remaining-sweep/`. Source/HTTP mistakes during setup (guessed history-archives, scaffold and YAML paths) were corrected and rerun; their404s are not findings.

## Golden near-due source check

Read all corpus reverify dates through Dec4. The coordinator assigned SCF/quantum to another lane. For the3 Docs/protocol cases dueNov24, fresh authoritative live reads at14:00UTC independently agree: Horizon Mainnet ledger65337513/P29 and RPC65337514/P29; Horizon Testnet5589994/P30 and RPC5589995/P30. Statuspage confirms Testnet completion and Mainnet Nov23 vote. Both SDF Bell pages retain Nov23 schedule; upgrade guide retains mandatory SDK update for CAP88. Software Versions and network-upgrades guides were re-read. Exact hashes/requests are in durable evidence.

Next event: inspect Mainnet activation after Nov23 17:00UTC and reconcile byNov24 through golden-truth if the fact or answer contract needs a change. Do not push the date merely because this lookahead ran. No source sentinel or corpus was edited.

## Limits and closeout

No new claim that all Rust/Python/Java/PHP examples compile; that work remains explicit for PR3067/3052. No190-query ranking breadth rerun because all original7 still fail. No deployment, production grant test or paid eval. This lane changes only its assigned reports/audits/scratch. Independent alias acceptance and routing-hold spot check are in [alias-review.md](alias-review.md). Cleanup is complete: all owned command terminals were removed after saving receipts; no other lane terminal was touched.


## Integrated record review — complete

Independently reviewed the coordinator's exact working diffs for sd-061, sd-081, sd-091,
sd-097, sd-098 and the Docs continuation TODO against the captured issue/PR metadata,
actual patches, live pages and local fixtures. **Accepted; no blocking factual-scope findings.**
The records retain reported-upstream and distinguish proposed patches from deployed behavior.
The sd-081 correction preserves the historical November 2 observation, names the November 3
fixing PR/commit, and removes only the completed time-bounds request. The sd-091 correction
accurately captures the later branch handling of result.error without calling it approved or
shipped. The sd-098 address-construction change is not proof that literal placeholder addresses
run or complete examples compile; the record explicitly retains compilation and behavior checks.
The unrelated Scout TODO addition belongs to its other-lane review, not this acceptance.

Checked local report links: docs.md, docs-actions.json, docs-evidence.json, alias-review.md and
cross-review.md all exist and linked relative paths resolve. Command-terminal cleanup is done.
No work remains pending in this assigned Docs/review lane; the table's upstream follow-ups are
future owner/deployment events, not unfinished checks claimed as complete.
