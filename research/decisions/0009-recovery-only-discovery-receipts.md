# ADR-0009: Recovery-only discovery and one-use host receipts

- Status: accepted (2026-08-30)
- Amends: [ADR-0003](./0003-build-time-exposure-filtering.md)

## Context

Some repository details need source-code recovery after official Docs evidence is empty or adjacent.
Ordinary ranking must not suggest that costly or weakly relevant detail operation as a first step.
Prompt guidance alone cannot enforce the required later-execute boundary.

## Decision

The manifest can mark an exposed operation as `discoveryMode: "recovery-only"`.
Ranked search excludes it. Exact describe, catalog, super-spec, and graph recovery still expose it.

The host owns the gate. A completed non-error source operation can issue one receipt through a
manifest `source-code` edge. The receipt binds the caller identity, source, target, issuing request,
version, issue time, expiry, and nonce. It expires after five minutes and authorizes one target call.

The host verifies the receipt and atomically consumes its R2 marker before adapter dispatch.
Dispatch runs the argument guard, receipt consumption, and adapter call in that order.
The sandbox and adapters receive neither the receipt state nor the signing secret. A refusal returns
the standard error envelope. The host logs the refusal reason and target without receipt content.

## Consequences

The manifest remains the exposed surface. This design adds no generic runtime allow or deny layer.
New recovery-only operations need an inbound manifest `source-code` edge and focused receipt tests.
