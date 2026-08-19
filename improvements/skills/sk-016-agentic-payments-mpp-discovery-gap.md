---
id: sk-016
service: skills
status: reported-upstream
discovered: 2026-08-14
upstreamTitle: The agentic-payments MPP guide omits the MPP discovery layer
evidence:
  - 2026-08-14 live read of skills.stellar-dev.agentic-payments file:mpp.md at pinned commit 812598a8538dc5479196145d2175b4a991bee1d9 returned 11875 characters with zero matches for "openapi", "x-payment-info", "offers", "MPPScan", "registry", and "discover"
  - 2026-08-14 the only "challenge" matches in that file are SDK event-type string literals on two code-comment lines, not the 402 Challenge authority rule
  - 2026-08-14 live read of https://mpp.dev/advanced/discovery confirms servers publish an OpenAPI 3.1 document at /openapi.json with x-payment-info offers, that MPPScan and the mpp.dev services directory are the two aggregators, and that "Discovery documents are informational hints. The runtime 402 Challenge remains the authoritative source of payment terms."
  - 2026-08-14 the same page states that adding discovery() to an mppx server serves /openapi.json automatically, and mpp.md already teaches mppx server setup
  - eval round 2026-08-14, main stamp 2026-08-14T03-56-23-variantA, row q-mpp-discovery-and-modes
  - Solo scratchpad 809, todo 1544 review
  - upstream issue filed 2026-08-19: https://github.com/stellar/stellar-dev-skill/issues/107
---

## Finding

The agentic-payments skill teaches MPP Charge mode and MPP Session mode. It does
not teach the MPP discovery layer.

`mpp.md` builds an `mppx` server for both modes. The `mppx` SDK exposes a
`discovery()` call that serves `/openapi.json` with `x-payment-info` offers for
each paid route. The file never names that call.

The file also omits the authority rule. MPP treats the discovery document as an
informational hint and treats the runtime 402 Challenge as authoritative for
price, token, network, expiry, and terms. `mpp.md` mentions "challenge" only as
an SDK event-type string in two code comments.

The two optional aggregators are absent as well: MPPScan and the mpp.dev
services directory, including the read-only `https://mpp.dev/mcp/services`
surface.

A developer who follows the skill ships a working paid API that no agent can
find. The skill answers "how do I charge" and never answers "how does a paying
agent discover me".

## Evidence

The skill read and the specification read both ran on 2026-08-14.

The skill file was read at its pinned commit
`812598a8538dc5479196145d2175b4a991bee1d9`. Its headings are: "When to use MPP",
"Charge mode: per-request payments", "Session mode: high-frequency off-chain
payments", "Session lifecycle", "Prerequisites", "Server:", "Client:", "Closing
the channel (server-initiated):", "Packages and subpath imports", "Testnet
runbook", and "Common pitfalls". No heading covers discovery.

`https://mpp.dev/advanced/discovery` supplied every fact above on the same day.

## Recommendation

Add one "Discovery" section to `skills/agentic-payments/mpp.md`. Keep it short.
It needs four points:

1. Serve an OpenAPI 3.1 document, commonly at `/openapi.json`, with
   `x-payment-info` offers on each paid operation. Show the `mppx`
   `discovery()` call that generates it.
2. State that discovery metadata is advisory, and that the runtime 402
   Challenge is authoritative for price, token, network, expiry, and terms.
3. Name MPPScan and the mpp.dev services directory as optional registrations,
   and link `https://mpp.dev/mcp/services`.
4. State that listing a service in a registry does not verify any client
   payment.

Add a matching line to the SKILL.md decision table so a reader selling an API
reaches the discovery step.
