---
id: cs-003
service: canonical-source
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "ecosystem/README.md status column disagrees with the preamble Status of SEP-0007, 0008, 0014, 0039, and 0054"
evidence:
  - "2026-11-02T17:18Z live read of stellar/stellar-protocol master 0da06899c02f818be0132f42cea1f45d6396e20a (committed 2026-11-02): a script compared the Status cell of every row in https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/README.md with the 'Status:' line of the linked sep-NNNN.md preamble. Five rows disagree; all other rows match."
  - "SEP-0007: README row '| [SEP-0007](sep-0007.md) | URI Scheme to facilitate delegated signing | Interstellar | Final |'; sep-0007.md preamble 'Status: Active', 'Version: 2.1.0'. Commit 600c326b210d71ee031d7f3a40ca88191b4cdf9c (2020-03-03, #561) changed the preamble from 'Status: Final' to 'Status: Active' and did not change the README row."
  - "SEP-0008: README row '| [SEP-0008](sep-0008.md) | Regulated Assets | Interstellar | Final |'; sep-0008.md preamble 'Status: Active', 'Version 1.7.4'. Commit 936a617e04677f136e48a74eabc1a97d1300b5e0 (2020-12-08, 'SEP-8: update status to Active #777') changed the preamble from Final to Active and did not change the README row."
  - "SEP-0014: the README lists it in the Proposals table with Status 'Draft'; sep-0014.md preamble says 'Status: Active'. Commit f05f830eac4ddd179b72c8e42cc6cdf5b5abd035 (2022-06-16, 'SEP-14: change to active (#1241)') moved the row but kept the 'Draft' cell."
  - "SEP-0054: README row in the Proposals table says 'Active' (added by 13095ee6bc0e4ecc8a643ed4304b9c69b5c3d9dd, 2026-01-08, 'Add SEP-0054 proposal to active list (#1835)'); sep-0054.md preamble still says 'Status: Draft'."
  - "SEP-0039: README row sits in the Draft Proposals table with Status 'Active'; sep-0039.md preamble says 'Status: Draft'."
  - "Minor adjacent wording: the Abandoned table lists SEP-0013 as 'Abandoned', and sep-0013.md says 'Status: Rejected (In favor of SEP-6)'. 'Rejected' is not one of the README's defined SEP status terms."
  - "Dedupe 2026-11-02: gh search issues and PRs in stellar/stellar-protocol for 'README status', 'status mismatch README', 'preamble status', 'sep-0007 Final', 'SEP-14 status', 'SEP-39 status', and 'SEP-54 status' found no issue or PR about these rows."
  - "Golden consumers (eval-side encoding, status not gated): eval/qa/corpus/battery/assets-anchors-seps/q-sep-7-uri.json and q-sep-8-regulated-assets.json notes record the preamble-vs-README conflict; q-sep-catalog-list.json carries disputed truth rows for SEP-7 and SEP-8 and cites commits 600c326b and 936a617e."
  - upstream issue filed 2026-11-02: https://github.com/stellar/stellar-protocol/issues/2055
---

## Finding

The status table in `ecosystem/README.md` disagrees with the `Status:` preamble line of five SEPs:

| SEP | README status | Preamble status | Change that caused the split |
|---|---|---|---|
| SEP-0007 | Final | Active | `600c326b` (#561) changed the preamble only |
| SEP-0008 | Final | Active | `936a617e` (#777) changed the preamble only |
| SEP-0014 | Draft | Active | `f05f830e` (#1241) moved the row but kept `Draft` |
| SEP-0039 | Active (in Draft Proposals table) | Draft | row cell differs from its table |
| SEP-0054 | Active | Draft | `13095ee6` (#1835) changed the README only |

A reader or tool that reads only one of the two places gets a different status. For SEP-0007 and
SEP-0008, Active and Final have different meanings in the README's own status terms: Active is a
living document, and Final is immutable except for errata.

## Evidence

Reproduce with a read-only comparison at master `0da06899`:

```sh
curl -s https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/README.md | grep -E 'SEP-00(07|08|14|39|54)\]'
for n in 0007 0008 0014 0039 0054; do
  curl -s https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-$n.md | grep -m1 '^Status:'
done
```

The status-change commits for SEP-0007 and SEP-0008 show an explicit, deliberate move from Final to
Active in the preamble. This suggests that the README row is the stale side for those two SEPs. For
SEP-0054, the README change is the more recent edit. The owner must decide which side is correct.

## Recommendation

Make the README status cell match the preamble `Status:` line for SEP-0007, SEP-0008, SEP-0014,
SEP-0039, and SEP-0054. Move each row to the table that matches its status. If the README is the
intended authority for a SEP, update that SEP's preamble instead. Optional: add a CI check that
compares each README status cell with the linked preamble, next to the existing prettier check.
