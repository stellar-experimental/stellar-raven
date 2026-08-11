---
id: sk-012
service: skills
status: fixed-upstream
discovered: 2026-07-11
evidence:
  - P4 H2 observed skills.stellar-dev.agentic-payments describe "MPP Channel mode" while current official MPP-on-Stellar material names the intent Session and implements it with a one-way payment channel; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - upstream issue filed 2026-07-13: https://github.com/stellar/stellar-dev-skill/issues/57
  - 2026-08-10 upstream re-pin live recheck: /tmp/skilldiff/stellar-dev__agentic-payments__SKILL.md.new names MPP Session mode as channel-backed and says the Session payment intent settles over a one-way payment channel; the prior public "MPP Channel mode" terminology trigger no longer reproduces
  - 2026-08-10 resolving upstream record read back: https://github.com/stellar/stellar-dev-skill/issues/57 is closed by maintainer kaankacar's comment citing merged PR https://github.com/stellar/stellar-dev-skill/pull/71
---

## Finding

The served agentic-payments skill presents "MPP Channel mode" as the public
mode name. Current MPP material uses Session for the payment intent, with a
one-way payment channel as its settlement mechanism; the wording blurs intent
and implementation.

## Evidence

P4 H2 compared the served skill terminology with the current official MPP on
Stellar documentation on 2026-07-11. The architecture is broadly aligned, but
the unqualified public label invites callers to describe a channel mechanism as
the protocol intent.

## Recommendation

Rename the guidance to "MPP Session (channel-backed)" and retain "channel" as
a search synonym. Briefly distinguish Session from one-time Charge behavior and
from the channel that settles the session.
