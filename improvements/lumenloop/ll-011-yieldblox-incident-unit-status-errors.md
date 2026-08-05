---
id: ll-011
service: lumenloop
status: reported-upstream
discovered: 2026-07-10
evidence:
  - live get_document on research id 66 and article id 6520
  - summaries describe $61 million or $61M XLM and blur attempted incident, affected Blend/YieldBlox component, and containment status
  - primary operator/on-chain evidence establishes a completed 2026-02-22 drain, distinct quarantine, remediation, and unproven attacker recovery
  - Solo scratchpad 575 GT-09 primary process 3226
  - P4 N2 recurrence 2026-07-11 independently rechecked the exact 61,249,278.31 XLM and 1,000,196.70 USDC transfers, 48,069,094 XLM quarantine, and distinct 2026 V2 versus 2022 incident context; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - 2026-08-04 exact live get_document recurrence: article 6520 still says "$61M XLM" in its short summary, while research 66 now says a "$10 million" Blend attack and that quarantine prevented full exfiltration; the two summaries still conflict on unit, affected component, completed loss, and containment status
  - https://github.com/lumenloop/lumenloop-backend/issues/24
recurrences:
  - date: 2026-07-11
    evidence: N2's independent on-chain/primary matrix confirms the existing amount-role and status defect: borrowed XLM and USDC, quarantined XLM, and valuation-dependent USD estimates must remain separate; the Lumenloop summaries still need those typed fields and attribution.
  - date: 2026-08-04
    evidence: live research 66 and article 6520 remain internally inconsistent; article short summary retains "$61M XLM", while research 66 broadens the affected component to Blend and frames quarantine as preventing full exfiltration despite the completed YieldBlox community-pool drain
---

## Finding

Lumenloop's YieldBlox incident summaries repeat material unit, identity, and
status errors. The current research document 66 calls it a "$10 million"
Blend attack and says quarantine prevented full exfiltration. Article 6520's
long summary is more specific, while its short summary still says "$61M XLM."
Earlier research wording also used the mixed "$61 million in XLM" unit.

The underlying quantity is 61,249,278.3064502 XLM, not a dollar-denominated
asset amount. The event was a completed drain from a community-managed
YieldBlox Blend V2 pool. About 48 million XLM was later quarantined, while
supplier and backstop remediation occurred separately; quarantine and
remediation are not proof of attacker-fund recovery.

## Evidence

Live read-only get_document calls for research id 66 and article id 6520 were
run again on 2026-08-04. Their summaries were compared with Script3/YieldBlox
operator notices and postmortem, Reflector disclosures, remediation records,
independent Blockaid/BlockSec reporting, and representative on-chain
transactions.

The evidence supports a manipulated USTRY/USDC SDEX trade propagated through
Reflector Pulse and accepted by the pool. It does not establish a Blend core,
Reflector contract, or Stellar protocol exploit.

## Recommendation

Correct or supersede the published summaries. Store event date separately from
newsletter/article publication date, keep asset quantities separate from USD
valuations, identify the YieldBlox community pool rather than Blend broadly,
and separate completed drain, validator quarantine, remediation, and
attacker-fund recovery.

Add a factual-conflict regression that rejects "$61M XLM," May as the event
date, attempted/contained-before-loss framing, and quarantine-as-recovery.
