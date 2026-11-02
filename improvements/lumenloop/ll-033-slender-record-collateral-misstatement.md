---
id: ll-033
service: lumenloop
status: verified
discovered: 2026-11-02
upstreamTitle: The Slender directory description incorrectly says ordinary borrowing requires no collateral
evidence:
  - 2026-11-02T22:36:13Z Raven recheck (read-only): POST https://api.lumenloop.com/v1/tools/get_project {"slug":"slender"} returned HTTP 200. The description still says "lend and borrow assets without collateral".
  - 2026-11-02 public recheck: curl -sS -L https://www.certora.com/reports/slender returned HTTP 200. The 2024-05-22 audit describes ordinary loans as over-collateralized and describes flash loans separately. GET projects/slender.yaml on lumenloop/stellar-ecosystem-db main returned HTTP 200 with the incorrect sentence.
  - 2026-11-02 timeline check: gh api repos/lumenloop/stellar-ecosystem-db/commits?path=projects/slender.yaml&per_page=100, followed by raw file reads at all 11 commits. The first incorrect committed wording appears at 3a4b5b05a8fd6216843d3c9de00f69ca1b5a15b8 (2026-03-18T07:08:16Z). The preceding record at 4ca0449cd77396e82ad9ab3c8db4d6f415ff5b23 (2026-02-08T21:30:47Z) lacks that sentence. These dates describe exported files, not the live API introduction.
  - 2026-11-02 adjacent check: rg -n -i "without collateral|slender" over the current directory archive found the incorrect Slender description once. projects/lendoor.yaml also advertises uncollateralized credit, but it describes a different product. No Slender evidence supports changing Lendoor.
  - 2026-11-02 dedupe: gh search issues and gh search prs covered open and closed owner records. gh api --paginate issues?state=all supplied complete bodies. rg over improvements/ and improvements/resolved.json checked local records. No duplicate appeared among four issues and eight PRs in lumenloop/stellar-ecosystem-db. No active or resolved record owns this Slender wording correction.
  - Affected golden case: eval/qa/corpus/battery/defi-ecosystem/q-defi-blend-alternatives.json
  - Source record: https://github.com/lumenloop/stellar-ecosystem-db/blob/main/projects/slender.yaml. Audit: https://www.certora.com/reports/slender (2024-05-22).
---

## Finding

The `slender` directory description incorrectly says users can borrow assets without collateral.
Slender's audit describes ordinary loans as overcollateralized.
The description can cause callers to misstate the protocol's borrowing requirements.

## Evidence

Raven repeated `POST /v1/tools/get_project` with `{"slug":"slender"}` on 2026-11-02T22:36:13Z.
The request returned HTTP 200 with this description fragment:

```text
lend and borrow assets without collateral
```

A fresh public read of `projects/slender.yaml` returned the same sentence.
The [Certora audit overview](https://www.certora.com/reports/slender) describes ordinary borrowing through an overcollateralized loan.
It describes flash loans separately.
The audit dates to 2024-05-22 and predates the incorrect directory wording.

The exported record first contains the incorrect sentence at commit `3a4b5b05a8fd6216843d3c9de00f69ca1b5a15b8` on 2026-03-18.
The preceding file revision does not contain that sentence.
The file's latest change on 2026-06-29 did not introduce the incorrect sentence.

## Recommendation

Change `projects/slender.yaml` to state that ordinary borrowing requires collateral.
If the description mentions flash loans, explain their separate repayment condition.
The current evidence does not support changes to other protocols' collateral requirements.
