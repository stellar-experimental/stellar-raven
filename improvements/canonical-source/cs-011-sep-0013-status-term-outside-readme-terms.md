---
id: cs-011
service: canonical-source
status: reported-upstream
discovered: 2026-11-03
upstreamTitle: "ecosystem/README.md lists SEP-0013 as Abandoned, but its preamble says Rejected, which is not a defined status term"
evidence:
  - "2026-11-03: stellar/stellar-protocol master ba980f02dc50025e86e83e3d9bef430b59104a15 ecosystem/README.md line 119 lists SEP-0013 in the Abandoned Proposals table with Status 'Abandoned'; ecosystem/sep-0013.md line 7 says 'Status: Rejected (In favor of SEP-6)'. Source: https://github.com/stellar/stellar-protocol/blob/ba980f02dc50025e86e83e3d9bef430b59104a15/ecosystem/sep-0013.md"
  - "2026-11-03: the README 'SEP Status Terms' section (lines 19-45 at the same commit) does not define 'Rejected'. A full compare of all 60 README rows against the linked preamble Status lines finds SEP-0013 as the only status mismatch (author lane and independent reviewer, .agents/rounds/2026-11-03-cs003-golden-pass-review.md)."
  - "Predecessor: improvements/resolved.json entry cs-003 (the five-row README vs preamble mismatch, fixed by stellar/stellar-protocol PR #2058). cs-003 recorded this SEP-0013 wording as minor adjacent wording outside its recommendation."
  - "Golden consumers: no battery case asserts SEP-0013's status (rg of eval/qa/corpus/battery on 2026-11-03)."
  - "reported upstream 2026-11-03 in the cs-003 resolution comment, without a separate issue: https://github.com/stellar/stellar-protocol/issues/2055#issuecomment-6611940463"
---

## Finding

`ecosystem/README.md` lists SEP-0013 as `Abandoned`.
The preamble of `ecosystem/sep-0013.md` says `Status: Rejected (In favor of SEP-6)`.
`Rejected` is not one of the status terms that the README defines.
This is the only README row whose status differs from its preamble.

## Evidence

See the frontmatter evidence. The difference is wording only; both surfaces agree that SEP-0013 is not in use.

## Recommendation

Change the SEP-0013 preamble to a defined term, for example `Status: Abandoned (In favor of SEP-6)`.
Alternatively, add `Rejected` to the README status terms.
