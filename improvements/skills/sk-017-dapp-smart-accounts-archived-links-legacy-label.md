---
id: sk-017
service: skills
status: fixed-upstream
discovered: 2026-08-14
upstreamTitle: The dapp skill links two archived repositories and applies a legacy label the upstream README does not support
evidence:
  - 2026-08-14 live read of skills.stellar-dev.dapp file:smart-accounts.md at pinned commit 812598a8538dc5479196145d2175b4a991bee1d9 returned "**GitHub**: https://github.com/kalepail/smart-account-kit" and "**Legacy SDK**: https://github.com/kalepail/passkey-kit (for simpler use cases)"
  - 2026-08-14 GitHub API for kalepail/passkey-kit returns archived true and the description "[MOVED -> github.com/stellar/passkey-kit]"
  - 2026-08-14 GitHub API for kalepail/smart-account-kit returns archived true and the description "[MOVED -> github.com/stellar/smart-account-kit]"
  - "2026-08-14 the full 521-line stellar/passkey-kit README states: \"smart-account-kit is a sibling SDK built on the audited OpenZeppelin stellar-contracts account. It uses a different on-chain authorization model (context rules + an auth digest) than passkey-kit's flat Signatures map, so the two are not drop-in compatible - pick the model that fits your app.\""
  - 2026-08-14 a full-text scan of that README for "legacy", "precursor", "greenfield", "new project", "deprecat", and "supersede" found no statement of kit-level legacy status; the three "legacy" hits describe signer generations, the 1-9 contract error range, and superseded tuple events inside the contract
  - 2026-08-14 the full 1088-line stellar/smart-account-kit README never mentions passkey-kit and makes no successor claim
  - 2026-08-14 npm registry passkey-kit@0.16.2 carries no deprecated field; GitHub repository metadata reports archived false and disabled false
  - eval round 2026-08-14, main stamp 2026-08-14T03-56-23-variantA, row q-tool-passkeykit-smart-wallet
  - Solo scratchpad 809, todo 1543 review and todo 1550 root correction round
  - upstream issue filed 2026-08-19: https://github.com/stellar/stellar-dev-skill/issues/108
  - upstream fix merged 2026-08-19 in stellar/stellar-dev-skill PR 110 at commit df27f39edd673cdb02f338e352aea12aaabd8622: https://github.com/stellar/stellar-dev-skill/pull/110
  - 2026-08-19 exact new-pin body recheck at commit 1f4b94e01ca24a2c00cb3b2cb3fcf6d07ad76462: dapp/smart-accounts.md and both standards companion files link stellar/smart-account-kit and stellar/passkey-kit, remove the Legacy and Recommended labels, and state the sibling authorization-model boundary
---

## Finding

`skills/dapp/smart-accounts.md` gives two stale repository links and one
unsupported status label.

**Stale links.** The Resources block links
`https://github.com/kalepail/smart-account-kit` as the project's GitHub home and
`https://github.com/kalepail/passkey-kit` beside it. Both repositories are
archived. Their descriptions read "[MOVED -> github.com/stellar/smart-account-kit]"
and "[MOVED -> github.com/stellar/passkey-kit]". A reader who follows either
link lands on a frozen mirror instead of the canonical repository.

**Unsupported label.** The same block labels passkey-kit "Legacy SDK ... (for
simpler use cases)". The canonical `stellar/passkey-kit` README does not support
that label. Its only positioning statement describes the two kits as siblings:

> smart-account-kit is a sibling SDK built on the audited OpenZeppelin
> stellar-contracts account. It uses a different on-chain authorization model
> (context rules + an auth digest) than passkey-kit's flat `Signatures` map, so
> the two are not drop-in compatible — pick the model that fits your app.

The two kits are therefore not interchangeable, and the README asks the reader
to choose by authorization model rather than by recency. The skill instead
frames one kit as superseded and the other as the default. That framing steers a
reader away from a supported model for a reason the upstream source does not
state.

This record does not claim the two kits are equivalent. It claims only that the
"Legacy SDK" label has no upstream support, and that the model-selection
boundary the README states is missing from the skill.

This is the mirror image of `sd-034`. That record covers the Stellar Docs
smart-wallet guide, which routes readers to Passkey Kit and omits Smart Account
Kit. The two surfaces state opposite successor claims, and neither matches the
canonical READMEs. Both corrections should land on the same sibling-model
description.

## Evidence

The skill read, the two full README reads, the npm registry read, and the four
repository lookups all ran on 2026-08-14. The skill file was read at its pinned
commit `812598a8538dc5479196145d2175b4a991bee1d9`.

The positioning check was deliberately not based on repository activity.
Commit recency shows maintenance, not official status, so it cannot by itself
refute a legacy label. The refutation rests on the canonical README text, the
absence of any legacy or greenfield statement across both full READMEs, and the
absence of an npm deprecation notice.

Repository activity is recorded only as a supporting maintenance signal:
`stellar/passkey-kit` reports `pushed_at` 2026-08-13 and `stellar/smart-account-kit`
reports `pushed_at` 2026-08-04.

**Open question for the skill owner.** If the Stellar team does intend Passkey
Kit as a legacy precursor and directs greenfield projects to Smart Account Kit,
that intent is not published in either canonical README, in the repository
metadata, or on npm. Please state it in the `stellar/passkey-kit` README first.
The skill can then carry the same wording, and this record becomes a
documentation-sequencing fix rather than a correction.

## Recommendation

Replace both `kalepail` links with the canonical repositories:
`https://github.com/stellar/passkey-kit` and
`https://github.com/stellar/smart-account-kit`.

Remove the "Legacy SDK" label, or replace it with the wording the canonical
README already uses.

Add the model-selection boundary in one sentence: Passkey Kit uses a flat
multi-signer `Signatures` map, Smart Account Kit uses the OpenZeppelin
context-rule and auth-digest model, and the two are not drop-in compatible.

Keep the skill's wording aligned with `stellar/passkey-kit`. If that README
later declares a legacy status, change the skill to match it and cite it.
