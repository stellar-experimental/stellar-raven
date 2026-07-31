---
id: sd-018
service: stellar-docs
status: reported-upstream
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
  - SDK residual re-scoped 2026-07-31 — six functions, not two (approve, transfer, transfer_from, burn, burn_from, set_admin); set_admin is wrong twice, omitting sep0011_asset and documenting a vec data payload where the host emits a bare Address. Verified against soroban-env-host 27.0.1 builtin_contracts/stellar_asset_contract/event.rs, where all seven SAC topic vecs end in read_name(e)?
  - the doc-comment remedy is structurally blocked for the five shared functions: stellar-asset-spec/src/tests/spec.rs asserts token_entries.is_subset(&stellar_asset_entries) and ScSpecEntry carries the doc string, so TokenInterface and StellarAssetInterface must document the ten shared functions byte-identically. Reproduced by making the edit and watching the test fail. This also retracts the implication that sd-038's three-function scope was an oversight — those are the only SAC-only functions among the incorrect ones, so the scope was forced
  - SDK residual filed upstream 2026-07-31 (design decision, not a doc edit): https://github.com/stellar/rs-soroban-sdk/issues/1979
  - set_admin correction filed upstream 2026-07-31: https://github.com/stellar/rs-soroban-sdk/pull/1980
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

## Status as of 2026-07-31

Upstream closed `stellar/stellar-docs#2593` as COMPLETED, but the merged work
covered the SDK-copy sync tracked as `sd-038`, not the recommendation below. A
closed issue is evidence to inspect, not proof of resolution, so this finding
stays active with its scope narrowed to what genuinely did not ship:

- **Shipped** — the three `StellarAssetInterface` doc-comments are correct on
  both the SDK and the embedded SAC-page copy, which makes the trailing
  `sep0011_asset` topic visible for `mint`, `clawback`, and `set_authorized`.
- **Not shipped** — a consolidated SEP-41-versus-SAC event table covering
  `transfer`, `mint`, `burn`, and `clawback` with topic counts and payload
  variants; the direct-SAC versus Classic-unified distinction; the note that
  transaction/operation metadata is what separates those two paths; and the
  cross-links to the existing payment and event-indexing guidance. The generic
  token-interface page — the page this finding is actually about — is unchanged
  and still teaches only the generic shapes.

A successor upstream report should name that residual directly rather than
reopening 2593, whose thread is now about the doc-comment sync.

Read the `reported-upstream` status with that in mind. It is historically true —
this was filed, as 2593 — but **both** refs on this record are now closed, and
they closed covering the `sd-038` half, so no owner is currently tracking the
residual above. The status cannot be walked back to `verified` while those refs
are cited (the lint enforces that citing an upstream URL implies a filing, which
is the right invariant), so the honest resolution is to make the status true
again by filing the successor rather than by relabelling. `upstreamTitle` is
already retitled to the residual so a filing generates the successor's heading
instead of the original issue's.

## Recommendation

On the generic token-interface page, add an event-schema table distinguishing
custom SEP-41 from current SAC/CAP-67 `transfer`, `mint`, `burn`, and `clawback`
events, including topic counts and data payloads. Explain that direct SAC and
Classic unified events share the SAC schema and require transaction/operation
metadata to distinguish their path. Cross-link the existing payment and
event-indexing guidance, and the SAC page that now carries the corrected
`StellarAssetInterface` comments.

The original report also asked that the stale `mint`/`clawback` comments be
corrected in `rs-soroban-sdk` `token.rs`, since the Docs copy is generated from
it and would otherwise re-drift. That is done **for the three functions
`sd-038` scoped** — `rs-soroban-sdk#1956` merged 2026-07-27 and
`stellar-docs#2704` re-synced the embedded copy 2026-07-28, both verified live
2026-07-31.

**Correction 2026-07-31: the SDK half is NOT wholly done, and an earlier version
of this section wrongly said it was.** `pub trait StellarAssetInterface`
re-declares `transfer` (~`token.rs:296`) and `burn` (~`token.rs:340`) with its
own doc-comments, and those still carry the generic SEP-41 shapes
`["transfer", from, to]` and `["burn", from]` — omitting the trailing
`sep0011_asset` topic. CAP-0067 specifies
`["transfer", from:Address, to:Address, sep0011_asset:String]` and
`["burn", from:Address, sep0011_asset:String]` for SAC events, and this
finding's own host-test evidence says the same. The live SAC docs page embeds
that block, so `sep0011_asset` appears there exactly three times — only the
three functions `sd-038` covered.

That residual is currently owned by nobody: `sd-038` retired against its own
deliberately narrow three-function scope, and this finding plus `#2715` cover
the Docs `token-interface` page. It was missed because the reviewer read only
the line range `sd-038` named rather than the whole trait — a correct verdict on
a cherry-picked evidence window. Filing it upstream is tracked separately; do
not read the paragraph above as "the SDK is now SAC-accurate".

**Correction 2026-07-31 (second pass): the residual is now filed, it is larger
than two functions, and — the part that matters — the remedy above is wrong.**
The paragraph reads as though correcting the doc-comments is the fix. It is not,
for five of the six affected functions, and anyone who takes it at face value
will hit the wall described below rather than land a patch.

- **Six functions, not two.** Reading the whole trait rather than the two named
  lines: `approve`, `transfer`, `transfer_from`, `burn`, `burn_from`, and
  `set_admin` all carry pre-CAP-67 shapes. `set_admin` is wrong twice — it omits
  `sep0011_asset` *and* documents `data = [new_admin: Address]` where the host
  passes a bare `Address`. That is the same cherry-picked-window error this
  record already names, repeated one level up.
- **The doc-comment fix is structurally blocked.**
  `StellarAssetInterface` is a superset of `TokenInterface`, and
  `stellar-asset-spec/src/tests/spec.rs` asserts
  `token_entries.is_subset(&stellar_asset_entries)`. `ScSpecEntry` carries the
  doc string, so the ten shared functions must stay byte-identical across both
  traits. Appending `sep0011_asset` to the SAC copies fails that assertion —
  reproduced by making the edit and running the test. Editing `TokenInterface`
  to match is not available either: a generic SEP-41 token has no SEP-11 asset,
  so the asset-free shapes are correct there.
- **Which retracts a claim this record implies.** `sd-038`'s narrow
  three-function scope was not a reviewer oversight — `set_authorized`, `mint`,
  and `clawback` are exactly the SAC-only functions among the incorrect ones,
  and they are the only ones the invariant permits. The scope was forced. This
  record should not be read as evidence that upstream under-reviewed.
- **Disposition.** `set_admin`, the one remaining SAC-only case, is fixed by
  `rs-soroban-sdk#1980`. The other five are filed as `rs-soroban-sdk#1979`,
  which asks for a design decision — relax the invariant, replace the inline
  shapes with a pointer to the SAC page, accept the SDK text and correct only
  the Docs copy, or split the traits' doc surfaces. Until that is answered, the
  Docs-side residual this finding tracks cannot be closed by an SDK sync, so
  `#2715` stands on its own rather than waiting on upstream.
