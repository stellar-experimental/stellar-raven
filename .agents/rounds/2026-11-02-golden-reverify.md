# 2026-11-02 — near-due golden re-verification

Trigger: drift issue #223 (run 41401244601) reported five battery cases past their
`truth.reverifyBy` date of 2026-11-01. The stale gate
(`npm run eval:qa:lint -- --stale --enforce-floors`) fails every PR until they are re-verified.

Scope: the 12 cases due through 2026-11-09, plus the siblings that the sweep found in conflict.
Single session, no Herdr. Author and orchestrator: Claude Opus 5.5. Four read-only research lanes
(Claude Opus 5.5 subagents) returned corroboration matrices. Two authoring subagents edited
disjoint case files. The author re-derived each gospel change from live sources before encoding it.
The independent review is outstanding; the owner runs it.

## Research lanes

| Lane | Cases | Matrix |
| --- | --- | --- |
| ZK and Soroban | `q-zk-host-functions-status`, `q-zk-verification-resource-budget`, `q-soroban-wasm-size-limit`, `q-passkey-smart-account-architecture` | `rounds/2026-11-02-golden-reverify/lane-zk.json` |
| Tooling | `q-mpp-discovery-and-modes`, `q-sor-reflector-integration-code`, `q-quickstart-manual-ledger-close` | `rounds/2026-11-02-golden-reverify/lane-tooling.json` |
| Protocol and infra | `q-anchor-sdp-what`, `q-protocol-base-reserve-min-balance`, `q-infra-rpc-provider-archive-tier` | `rounds/2026-11-02-golden-reverify/lane-protocol.json` |
| Events | `q-hist-meridian-2026-corrected-venue`, `q-scf-current-round` | `rounds/2026-11-02-golden-reverify/lane-events.json` |

## Outcomes

Gospel changes (judge-facing fields moved; `truth.verified.rootCause` set):

| Case | Change | Root cause |
| --- | --- | --- |
| `q-hist-meridian-2026-corrected-venue` | Event held; question, answer, keyFacts, and avoid move to past tense; freshness `stable`; `reverifyBy` removed | `freshness-drift` |
| `q-scf-current-round` | #46 deadline 2026-11-09; #45 ended and is last concluded; attributed Nov 8 capped at partial | `freshness-drift` |
| `q-edge-fresh-latest-scf-round` (sibling) | Same SCF state change | `freshness-drift` |
| `q-zk-host-functions-status` | keyFact 3 accepts the later Final CAP-0080 status; notes record Protocol 29 on 2026-11-02 | `freshness-drift` |
| `q-passkey-smart-account-architecture` | Origin and RP-ID checks assigned to the Relying Party; production verifiers omit them on-chain; symmetric caution | authoring flaw (W3C RP steps read as contract steps) |
| `q-anchor-sdp-what` | The 10,000 cap is source-enforced; the avoid item now traps only a protocol-limit claim | authoring flaw (source constant not read) |
| `q-anchor-sdp-vs-anchor-platform` (sibling) | Same cap fix; notes allow SEP-45 (official docs and source tree list it) | authoring flaw |
| `q-infra-rpc-provider-archive-tier` | Dated nine-row roster (node101 added 2026-09-08); getLedgers-only claim scoped to the official tier; beta full-history nodes are a dated nuance | `freshness-drift` |
| `q-quickstart-manual-ledger-close` | avoid[1] keeps only the obsolete `--core-manual-close` trap; `ENABLE_CORE_MANUAL_CLOSE` is not penalized (source read only; Docker not run) | authoring flaw (over-broad trap) |

Metadata only (no judge-facing change): `q-soroban-wasm-size-limit`,
`q-zk-verification-resource-budget`, `q-protocol-base-reserve-min-balance` (moved liquidity-pools
URL), `q-mpp-discovery-and-modes` (three dead sources repaired), and
`q-sor-reflector-integration-code` (Mainnet Beam row now `confirmed-as-of`; `blob/master` refs).

Deferred: `q-scf-open-rfps` and `q-scf-rfp-tooling` (RFP roster conflict; `.agents/TODO.md`).

Register: 17 entries reopened and re-swept. Cluster notes 018, 122, and 135 and the SCF
Submission invariant carry the new facts; the Meridian post-event trap is closed.

Possible upstream findings (not filed): the SDF oracle-providers table omits the Reflector Beam
Mainnet deployment, the Reflector README Beam example points at a Pulse contract ID, the RPC
Providers footnote omits SDF's archive-node beta, and `q-agent-payment-standard-choice` still cites
the dead `github.com/stellar/mpp` source.

## Author re-derivations

- SCF #46: `https://communityfund.stellar.org/awards` shows "Deadline to submit: November 9, 2026",
  SCF #46 in `Submission`, and SCF #45 `Ended`. Scout `GET /api/rfps?status=open` titles the
  synthetic row "SCF Round #46: submissions OPEN until 2026-11-09".
- SCF RFP roster: the official RFP Track page says "October 2026: New Q4 RFPs are coming soon" and
  lists no open brief. Scout still returns the two Q3 briefs. Deferred to `.agents/TODO.md`.
- Passkey: OpenZeppelin `webauthn.rs` at `ddc327eb`, lines 7-15, says origin and RP-ID-hash
  validation are "intentionally omitted". Passkey Kit `verify.rs` says "rpIdHash and origin are
  deliberately not pinned on-chain".
- SDP: `stellar-disbursement-platform-backend` `disbursement_handler.go:865` rejects more than
  `data.MaxInstructionsPerDisbursement` (10000) instructions.
- RPC providers: `stellar-docs` `docs/data/apis/rpc/providers.mdx` on `main` has 16 providers and
  9 RPC Archive rows (Validation Cloud, Gateway, Ankr, Obsrvr, OnFinality, Lightsail Network -
  Quasar, Exaion, GetBlock, node101).
- Meridian: the official site thanks attendees and points to 2027; the event-details page keeps
  October 28–29, 2026 at Convento do Beato, Lisbon.

## Related checks in the same session

- `@cloudflare/codemode` 0.5.6 (2026-10-29) still has the reverse-prefix match in `scoreField`
  (`token.startsWith(c)`). Upstream cloudflare/agents#2296 is open with no reply. Issue #167 stays
  open.

## Independent review

Reviewer: Claude Fable 5.1, run after the merge of #310 (`86cc5f53`) with an independent
re-derivation brief. It did not read the ledger or the matrices first.

Verdict: approve with changes. All nine gospel changes are true on live sources, and each has an
independent truth defect. The reviewer found no score laundering. The cautions are symmetric, and the
metadata-only cases changed no judge-facing field.

| # | Severity | Finding | Reconciliation |
| --- | --- | --- | --- |
| 1 | major | `q-scf-open-rfps` and `q-scf-rfp-tooling` still gave the 2026-11-08 deadline | Fixed: 2026-11-09 with an as-of date and the partial cap; the roster stays queued |
| 2 | minor | `q-infra-secp256r1-passkeys` and `q-passkey-platform-constraints` lacked the origin/RP-ID caution | Fixed: same caution added to the notes; key facts unchanged |
| 3 | minor | `q-sor-cross-warmancer-zk-stack` notes called CAP-0080 Implemented | Fixed: "Final since 2026-09-22" |
| 4 | minor | "Third-party posts still say November 8" had no source | Fixed: r/Stellar and @lumenloop posts named in the notes and sources |
| 5 | minor | The Anchor Platform source used the old repository name | Fixed: `stellar/anchor-platform` |
| 6 | nit | keyFact 5 in the two SCF round cases had two predicates | Fixed: one predicate; avoid[0] keeps the #44 trap |
| 7 | nit | The hackmeridian.com source still shows a countdown | Fixed: a source note says so |
| 8 | nit | Six cases fall due on 2026-11-12 | No change: the two SCF cases are event-triggered, and the TODO item says so |
