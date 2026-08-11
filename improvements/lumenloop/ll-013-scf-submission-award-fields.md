---
id: ll-013
service: lumenloop
status: reported-upstream
discovered: 2026-07-10
evidence:
  - https://github.com/lumenloop/lumenloop-backend/issues/26
  - live lumenloop.get_scf_submissions({slug:"blend"}) response asOf 2026-07-10
  - current official SCF Blend submission/project payload fetched independently the same day
  - Solo scratchpad 575 GT-14 primary process 3239 and independent blind process 3242
  - GT-17 recurrence: RWA semantic results required official-page checks to distinguish Awarded from Test Transaction, Ready for Payment, and Information Collection
  - GT-18 recurrence: Soroswap returned four correct linked rows, but official pages were still required to establish Awarded status, exact amount semantics, and three numbered rounds versus four awards
  - GT-38 recurrence: Aquarius submissions exposed four bare budgets totaling $391K without statuses while the project summary returned the three-Awarded-row $291K basis; Blend and Soroswap still required official status/paid fields
  - GT-37 recurrence: oracle/passkey/payroll rows exposed populated budgets without awarded/paid status, including partial-payment and non-awarded fixtures
recurrences:
  - date: 2026-07-10
    evidence: GT-38 primary/blind probes reproduced bare-budget ambiguity across Aquarius, Blend, and Soroswap, including a Pending Aquarius row with a populated budget
  - date: 2026-07-10
    evidence: GT-37 primary/blind probes broadened the recurrence to Band, SocketFi, PayZoll, Reflector, CodeLnPay, partial-payment rows, and non-awarded rows with populated budgets
  - date: 2026-07-10
    evidence: GT-40 aggregate reconciliation confirmed that bare submission budgets cannot resolve reconstructed, round-ledger, project-record, awarded, or paid lifetime totals
  - date: 2026-07-11
    evidence: P4 Lane X observed successful exact-slug submission lookups whose rows retained linked_project_slug:null while Decaf used linked_project_slugs:["decaf"]; an unambiguous successful lookup therefore still cannot provide a stable primary project join or amount/status semantics. solo://proj/49/scratchpad/super-corpus-rebuild--585
  - date: 2026-08-11
    evidence: "Live Blend output still exposes bare budget without award, payment, currency, or basis fields; issue #26 remains open."
---

## Finding

`lumenloop.get_scf_submissions({slug:"blend"})` links the correct Blend Capital
submission and returns `round`, `award_type`, and `budget: "50000"`, but the
live response does not expose a currency-qualified awarded amount, award
status, paid amount, or amount basis. The current official SCF project payload
for the same record reports $50K, `Awarded`, `totalAwarded=50000`, and
`totalPaid=50000`.

A consumer cannot tell from the Lumenloop response alone whether `budget`
means requested budget, approved award, displayed project amount, or paid
amount. This can turn a correct link into either an underclaim ("status
unknown") or an unsupported overclaim ("budget means awarded and paid").

## Evidence

The live read on 2026-07-10 returned the Blend submission
`recRSgNDEycVg2xG8`, round `Liquidity Award - '24 Q1`, award type `Liquidity
Award`, and `budget: "50000"`. Independent extraction of the current official
SCF payload resolved the missing semantics and was reproduced by the GT-14
blind reviewer.

The finding concerns normalized response fields. It does not require Lumenloop
to merge older Script3/OptionBlox/YieldBlox team-lineage awards into Blend.

GT-17 reproduced the ambiguity across RWA/tokenization results. Official pages
showed several Awarded submissions, but also Talwex at Test Transaction, Lend
tokenized real estate at Ready for Payment, and TERWA Wine Asset Vault at
Information Collection despite populated Build/amount fields. The normalized
discovery result cannot safely answer "was funded" without official status.

## Recommendation

Expose source-provenance fields per submission/project:

- `awardStatus`;
- `awardedAmount` and `paidAmount`;
- `currency`;
- `amountBasis` (`requested-budget`, `displayed-award`, `project-total`, or
  reconstruction);
- `sourceUrl` and `asOf`;
- separate project totals from team/predecessor lineage.

Add a Blend regression fixture that returns the official Q1-2024 award/status
fields without inferring them from bare `budget`.

Add RWA cross-status fixtures so semantic similarity, `award_type`, and a
populated amount never substitute for the source submission's current status.

Add a Soroswap fixture for SCF #15/#17/#21 plus the Q1-2024 Liquidity Award.
It should expose four Awarded submissions totaling $346,750 while preserving
that there are three numbered rounds and a separate supporting-program award.
