# Lane brief: scope-apply (apply the owner's scope decisions to the battery)

Read `briefs/common.md`, then `decisions/SCOPE.md` (sections A5, A6, B4), then the `golden-truth`
skill. The owner approved every recommendation in SCOPE.md on 2026-11-14, including the optional
`q-edge-oos-solana-vs-aptos` edit. You are the author. A different model re-derives the two new
cases blind and reviews your diff afterwards, so leave the new cases `proposed`.

Work on branch `audit/scope-decisions` (create it from `origin/main`). Commit as you go; push the
branch when done. Never `--no-verify`. No upstream posts. No model-calling eval commands.

## Changes

1. Retire `q-pay-anchor-msb-licensing` through the lifecycle (tombstone, reason from SCOPE.md A6).
   Check that the tombstones that name it as a survivor still point somewhere true; fix them.
2. Propose the XLM US-classification case on `security.regulation-policy`. SCOPE.md read the SEC
   release and SDF's letter only as excerpts and took the letter's date from a secondary report.
   Read both primary documents in full first, confirm every key fact and date, and meet the
   evidence bar (two independent source classes). Change the draft where the primaries disagree.
3. Propose the issuer and institutional custody case on `security.key-custody` (SCOPE.md B4). Three
   drafted facts rest on one Docs page: find a second source class for each or drop the fact.
4. Move `q-pc-multisig-setup-lifecycle` to primary `protocol.signatures-multisig`.
5. Rewrite as SCOPE.md A6 says: `q-defi-agentic-payment-standards-compare`,
   `q-defi-agent-identity-stellar-experimental`, `q-asset-usdc-eurc-issuer`,
   `q-edge-oos-solana-vs-aptos`. For the EURC case, settle which Circle entity is the legal issuer
   from circle.com before you write the note. If Scout's `issuerOfRecord` is wrong, record a
   `verified` finding under `improvements/` (improvements-pipeline skill; do not post it).
6. Optional source note on `q-n3-pi-network-wrong-chain` as SCOPE.md says.
7. Keep `eval/qa/taxonomy.json` `openSlots` true to the tree while the two cases are proposed.
8. Keep key facts compact: single predicate, at most 90 characters where the fact allows, no
   non-Stellar fact required. Judge-facing text stays free of provenance.

## Gates

Run bare, from the repo root, and record each exit code: `npm run eval:qa:compile`,
`npm run eval:qa:lint -- --stale --enforce-floors`, the register check and selftest named in
`eval/qa/README.md`, `npm run typecheck`, `npm test`, `npm run improvements:lint` (if you touched
`improvements/`), `npm run secrets:scan -- --tree`.

## Output

Write `.agents/rounds/2026-11-14-golden-coverage-audit/decisions/APPLY.md`: what changed per case,
the sources read for each new key fact (URL, date read, quote), every deviation from SCOPE.md and
why, gate exit codes, and what you could not verify. Commit it. Do not record which held-out set
any case is in.
