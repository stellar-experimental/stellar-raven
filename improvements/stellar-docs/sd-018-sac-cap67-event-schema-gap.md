---
id: sd-018
service: stellar-docs
status: fixed-upstream
discovered: 2026-07-11
upstreamTitle: Distinguish generic SEP-41 from current SAC/CAP-67 asset events in one schema
evidence:
  - token-interface page presents generic SEP-41 transfer/mint topic shapes
  - released/current rs-soroban-env appends sep0011_asset to direct SAC events; transfer has four topics, while mint/burn/clawback have three topics with the asset last
  - current host test_transfer_with_issuer passed and asserts the asset-appended shape
  - Solo scratchpad 575 GT-42 primary 3308 and blind 3315
  - upstream issue filed 2026-07-14: https://github.com/stellar/stellar-docs/issues/2593
  - independent Docs-team audit 2026-07-14 corrected the event shapes and history, identified muxed transfer/mint data maps, found existing transfer coverage, and traced stale generated comments to rs-soroban-sdk token.rs: https://gist.githubusercontent.com/ElliotFriend/3b3641b929b4408a834b85bcb4e75449/raw/a90e6b453ee3505ef2525b4428eaa75752e3ae08/raven-audit-rebuttal.md
  - corrected implementation scope posted and read back 2026-07-15: https://github.com/stellar/stellar-docs/issues/2593#issuecomment-4981955633
  - maintainer verified against rs-soroban-env and corrected the original framing 2026-07-21 (ElliotFriend): https://github.com/stellar/stellar-docs/issues/2593#issuecomment-5035730000
  - Raven accepted those maintainer corrections 2026-07-27 (our own comment, not a maintainer sign-off): https://github.com/stellar/stellar-docs/issues/2593#issuecomment-5091974420
  - SDK-side re-drift owner split into sd-038 and filed upstream 2026-07-27: https://github.com/stellar/rs-soroban-sdk/issues/1955
  - issue 2593 closed COMPLETED 2026-07-28 by https://github.com/stellar/stellar-docs/pull/2704 — but that PR changed six lines and scoped itself to the three StellarAssetInterface doc-comments, which is the sd-038 half, not this finding's recommendation
  - author-side live recheck 2026-07-31 — PARTIAL. Shipped: the SAC page now carries the corrected CAP-67 comment shapes, so the trailing sep0011_asset topic is at least visible somewhere. Still missing on https://developers.stellar.org/docs/tokens/token-interface: zero occurrences of sep0011_asset, CAP-67, clawback, or set_authorized; it still presents generic three-topic transfer and two-topic burn with nothing telling a reader that direct SAC events differ
  - independent adversarial reviewer (gpt-5.6-sol xhigh, Solo 4137, 2026-07-31) was briefed to argue the opposite — that this finding IS fully resolved and should be retired — and could not sustain it: "PARTIAL is the only defensible verdict". solo://proj/49/scratchpad/sol-review-2026-07-3--746
  - upstream issue filed 2026-07-31: https://github.com/stellar/stellar-docs/issues/2715
  - SDK residual re-scoped 2026-07-31 — six functions, not two (`approve`, `transfer`, `transfer_from`, `burn`, `burn_from`, `set_admin`); `set_admin` was wrong twice, omitting `sep0011_asset` and documenting a vec data payload where the host emits a bare `Address`. Verified against soroban-env-host 27.0.1 `builtin_contracts/stellar_asset_contract/event.rs`, where all seven SAC topic vecs end in `read_name(e)?`
  - the first direct doc-comment edit failed the then-current `token_entries.is_subset(&stellar_asset_entries)` test because `ScSpecEntry` included doc strings; this was a real implementation obstacle, not a permanent design constraint. Upstream later changed the comparison to strip docs and normalize SEP-41 event entries to SAC shapes
  - SDK residual filed upstream 2026-07-31 (design decision, not a doc edit): https://github.com/stellar/rs-soroban-sdk/issues/1979
  - `set_admin` correction filed upstream 2026-07-31 and merged 2026-08-03: https://github.com/stellar/rs-soroban-sdk/pull/1980
  - five shared-function corrections plus the invariant redesign merged 2026-08-03, closing issue 1979 COMPLETED: https://github.com/stellar/rs-soroban-sdk/pull/1984
  - live recheck 2026-08-03 — current rs-soroban-sdk main `b23287480dd04c497ce36f0370a2a0b42c9977ca` carries the correct SAC shapes for all six residual functions. The deployed SAC page has not ingested those merges: it still has only three `sep0011_asset` occurrences and the old `set_admin` shape. The generic token-interface page still has zero `sep0011_asset` or `CAP-67` occurrences
  - successor issue closed completed 2026-08-04 and its implementation deployed: https://github.com/stellar/stellar-docs/issues/2715 and https://github.com/stellar/stellar-docs/pull/2720
  - CAP-0067 citation follow-up merged and deployed 2026-08-04: https://github.com/stellar/stellar-docs/pull/2725
  - Docs maintainer deployment handoff with before/after markers: https://github.com/stellar-experimental/stellar-raven/issues/6
  - author-side live recheck 2026-08-05T23:46Z — token-interface contains seven sep0011_asset markers, four clawback markers, four set_authorized markers, two CAP-0067 markers, the full SEP-41/SAC comparison, classic-operation distinction, and required cross-links; SAC page contains four sep0011_asset markers and the corrected set_admin shape
  - distinct adversarial reviewer Solo process 4358 / Todo 1394 comment 3749 independently repeated the live trigger and every upstream reference on 2026-08-05 and approved retirement
---

## Finding

The generic token-interface event documentation does not clearly distinguish
custom SEP-41 events from current SAC events. Direct SAC transfer has four
topics (`transfer`, from, to, asset); mint, burn, and clawback each have three,
with the SEP-11 asset string last. Muxed transfer/mint destinations also move
amount and muxed id into a data map.

The trailing asset topic predates CAP-67. CAP-67 removed the admin topic from
mint/clawback, added muxed payloads, and unified Classic events. Existing
payment guidance already documents SAC transfer's fourth topic, so the gap is
one consolidated, accurate schema—not total absence.

## Evidence

**This is a successor to `stellar/stellar-docs#2593`, which was closed correctly.**
That issue was resolved by PR #2704, which synced the three `StellarAssetInterface`
doc-comments to their CAP-67 shapes. That work is done, verified live, and not
being re-litigated here — it was the SDK-copy half, tracked separately and
already fixed in `rs-soroban-sdk#1956`. What follows is the part of the original
report that the sync did not reach.

Live recheck 2026-07-31 of
<https://developers.stellar.org/docs/tokens/token-interface> — the page this
report is actually about: zero occurrences of `sep0011_asset`, `CAP-67`,
`clawback`, or `set_authorized`. It still presents generic three-topic
`transfer` and two-topic `burn`, with nothing indicating that direct SAC events
carry a trailing SEP-11 asset topic. A reader following that page alone will
decode a direct SAC event with the generic schema and mis-parse it.

The corrected shapes are now visible on the SAC page, so the information exists
on the site — but it is split across two pages with no cross-reference, and the
generic page never signals that a different schema applies. CAP-0067 is the
normative source for the SAC `transfer`/`burn` shapes and Classic unification.

## Status as of 2026-08-05

The reader-facing residual is fixed live. `stellar/stellar-docs#2715` closed via
PR #2720, and PR #2725 added the missing CAP-0067 citation. The generic
token-interface page now carries the full SEP-41-versus-SAC event table, the
direct-SAC versus Classic-unified distinction, the operation-metadata note, and
the required payment/event cross-links. The SAC page has also ingested the SDK
corrections, including the current `set_admin` topics and data payload.

An independent 2026-08-05 reviewer repeated the live trigger and upstream-ref
sweep and found no residual. This active record may be retired after the normal
immutable-source and upstream-comment gates.

## Recommendation

On the generic token-interface page, add an event-schema table distinguishing
custom SEP-41 from current SAC/CAP-67 `transfer`, `mint`, `burn`, and `clawback`
events, including topic counts and data payloads. Explain that direct SAC and
Classic unified events share the SAC schema and require transaction/operation
metadata to distinguish their path. Cross-link the existing payment and
event-indexing guidance, and the SAC page that now carries the corrected
`StellarAssetInterface` comments.

### SDK correction history

The first correction pass named only `transfer` and `burn`; reading the whole
trait found six stale SAC comments: `approve`, `transfer`, `transfer_from`,
`burn`, `burn_from`, and `set_admin`. The first direct edit of the five shared
functions failed because the subset test compared full `ScSpecEntry` values,
including doc strings. That failure correctly exposed a design decision, but it
did not make the fix impossible.

Upstream resolved the SDK lane on 2026-08-03. `rs-soroban-sdk#1980` corrected
`set_admin`. `rs-soroban-sdk#1984` corrected the other five and changed the
subset test to strip documentation and compare SEP-41 entries after adding the
SAC `sep0011_asset` event topic. Current SDK main now documents the six shapes
accurately while preserving generic SEP-41 text in `TokenInterface`.

That source fix was useful but not this finding's terminal condition. The
reader-facing distinction, cross-links, and generated SAC documentation have
now deployed and passed a fresh page recheck.
