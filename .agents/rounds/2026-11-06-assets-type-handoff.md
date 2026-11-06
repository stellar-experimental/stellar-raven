# Assets skill fix and delivery follow-up — 2026-11-06

Raven handoff388 arrived while the paused Playground release was closing out.
This follow-up completes the live-source review without starting paid collection.
The $200 study ceiling, journals, cases and frozen measurement checkouts stay fixed.

## Source and delivery

| Finding | Root ordinary live check | Disposition |
| --- | --- | --- |
| sk-038 | Docs skill at 18:58:35 UTC now qualifies the prerequisite, complete-lockout handover warning and signer-threshold checklist; SHA-256 `ff836f85491d74fcd2f2d0d1331bff502f45c8ad53b6bf351dc39a1114976b55` | Retired through resolver after independent verification and public resolution comments |
| sk-039 | skills.stellar.org at 18:57:30 UTC matches PR181 merge source, SHA-256 `c88cc42460803e48f2b316311ae33bdd7f130a23b9710cd356d02fd2599f1146`; ordinary Docs skill still has both wrong types | Keep reported-upstream for the Docs copy; acknowledge partial fix without requesting another canonical type change |

Root read all three sk-038 sections and the neighboring sk-039 client/interface
text. The canonical client example was valid throughout. Separate Astra/high lane
`t361` repeats both live triggers, source refs, adjacent prose and repository
references. Fable remains unavailable because of its subscription limit.
[Root evidence](../../research/audits/2026-11-06-assets-type-handoff/root-live.json)
and [Docs residual](../../research/audits/2026-11-06-assets-type-handoff/root-docs-residual.json)
record ordinary URLs, timestamps and response hashes.

## Pin impact

The standard `ecosystem-skills/update.sh` advances only stellar-dev from
`5aafdf96760944ee112a8325b035d5e0f78eadb8` to
`ceeb2f17a0fd1da3f47e28c6a73a026883020c09`, the latest path-touching PR181 commit.
PR181 merged as `fb63412da70102edb527baf4cf3068f25713cd14`.
Only selected `assets/SKILL.md` changes. It corrects transfer/symbol types, adds
`transfer_from`, renames the approve parameter, and explains the valid client call.
The complete body diff was read; other selected bodies, sources and exposure stay fixed.

Catalog leaf comparison finds only timestamps, stellar-dev provenance/URLs and
13 assets body/section hash pairs. All 284 entry IDs and routing fields remain.
Spec changes are timestamps only. Micro-map and operation classes regenerate
without a diff. All 67 pinned files pass remote blob verification. The two
external skill directories differ only in their snapshot timestamps.

All **544 complete routing rows** preserve grades, top-five IDs/order and scores.
The ranked-ID dump also matches byte-for-byte. Only the catalog fingerprint and
its evidence note change in `eval/gates.json`; numerical thresholds, accepted
totals, labels and the baseline date stay fixed. The Docs-title and RWA holds in
issues223/167 remain active and receive no reminder comment.
[Routing comparison](../../research/audits/2026-11-06-assets-type-handoff/routing-comparison.json).

No runner operation, runtime adapter or golden fact changes. Existing transfer
and transfer_from goldens already distinguish their types. The controlled
Playground study must restore its original 092ce423 catalog, not this new
production pin; production-equivalence checks remain part of later promotion.

## Validation and review

The first local unit run discovered ignored archived patch copies and a standalone
Node test under `tmp/`, producing three suite-loader failures. `vitest.config.ts`
now excludes `tmp/**` beside its existing worktree exclusion. No tracked test is
removed. The ordinary suite then passes: 151 files, 3,348 passing tests and three
expected failures. Typecheck, build, pin attestation guard, routing gate, QA
lint/floors and consistency-register check also pass. The study evidence remains
intact at its original paths. Independent Astra/high t361 completed its review and accepted the candidate pin
and narrow test exclusion. It independently reproduced the valid client call
and the shown E0283 inference failure. It accepted sk-038 retirement and required
sk-039 to remain active. Its [full review](../../research/audits/2026-11-06-assets-type-handoff/independent-review.md)
records source, exposure, routing, goldens and reference checks. Zero tracked
suites disappeared; the clean main CI also runs151 files/3,348 passing tests.
Final lifecycle cleanup and deployment receipts follow.


## Lifecycle completion

The sk-038 resolver dry run was inspected, then the active file and intake override
were removed and its receipt appended. The immutable fixed source is
`c2f05adb6c6f8ec3d3eb4e33753e4f4128f5aaa3`. Resolution comments on issue177,
PR178 and handoff381 were read back with their exact bodies. sk-039 stays active;
its partial result was posted/read back on issue180, PR181 and handoff388.
[Public comment receipts](../../research/audits/2026-11-06-assets-type-handoff/public-comments.json).
The queue now names the generated/published Docs type copy as the next recheck,
not a further canonical patch. There are 101 active findings.

The independent final cleanup appendix accepts the actual removal, receipt,
public comments and pin record. Handoff388 is closed as a processed partial result;
sk-039 remains reported-upstream. Live improvements lint passes with101 records.
Previously run unchanged probes have15 recurring,0 fixed candidates and0 errors.
Tree/staged secret scans pass. All24 still-present frozen study code pins remain
byte-identical; the other7 paths belong to the intentionally removed frozen
worktrees and must be restored from the verified bundle before resumption.
