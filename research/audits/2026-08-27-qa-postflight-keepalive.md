# QA postflight keep-alive failure — 2026-08-27

## Finding

The QA runner used one global Node fetch pool before and after a synchronous answering-agent process.
Wrangler closed the idle preflight connection while `spawnSync` blocked Node's event loop.
The immediate postflight then reused that stale socket and received `ECONNRESET`.

The replacement connector qualification produced a valid answer with three MCP calls.
It reported `raven` as connected and cost `$0.0953756`.
The local result stamp is `2026-08-27T15-43-06-variantA.json`.
The postflight fetch failed before a request reached Wrangler.
The runner preserved the row and correctly suppressed comparability.

## Reproduction

A child TCP fixture returns the same chunked event-stream response shape as Wrangler.
It closes an idle connection while a child process blocks the caller's event loop.
The second call to the exported `probeLiveSurface` function failed before the fix.

The live reproduction also failed with `ECONNRESET` after a synchronous six-second block.
The same reproduction failed through `fetchLiveSurface`, which probes after paid discovery agents.
An asynchronous wait passed.
A direct IPv4 URL still failed.
Adding `connection: close` passed.

## Decision

QA and discovery surface probes send `connection: close`.
Each preflight and postflight probe therefore gets fresh connections.
This changes only the evaluation harness.
It does not change Raven's MCP surface or answering-agent traffic.

The regression test drives `probeLiveSurface` and `fetchLiveSurface` through an independent TCP server.
It fails if a stale pooled socket can cross the synchronous agent boundary.
