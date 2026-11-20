# Shareable durable `/playground` sessions

Status: deferred product idea (recorded 2026-07-15). The Playground remains stateless
([`ARCHITECTURE.md`](../ARCHITECTURE.md)). Reopen only on an owner decision, then confirm the four
deferred choices below before building.

## Core design: durable private sessions + fork-on-send sharing

Use asynchronous conversation sharing, not live collaboration (no shared write cursor, presence,
live sync, or branch trees):

- New sessions are private and owned by the signed-in user (created lazily on first send; loading
  `/playground` writes nothing).
- Owners can reopen private sessions across reloads/restarts, enable a public-by-link share URL
  (`/playground/share/<token>`), and revoke it (re-sharing rotates a fresh token; old links stay
  dead).
- Anonymous viewers read the shared transcript without signing in; only the composer is locked
  behind a login overlay (no full-page modal or blur).
- Viewing or signing in never creates a fork. An authenticated non-author's first follow-up
  atomically snapshots committed source turns into a new private session, appends the turn, and
  replaces the URL (`history.replaceState`) before streaming. Source owners continue the source.
- Non-authors can never append to an author's session (enforced server-side).
- Interrupted provider streams are not resumed; retain bounded failed/interrupted turn state so the
  user can retry.

Ownership keys on the peppered WorkOS subject derived from `MCP_SERVER_SECRET`; rotating that secret
requires an identity-migration plan first.

## Storage: D1 (no Durable Objects)

Check against [`.agents/TODO.md`](../.agents/TODO.md) ("Consider consolidating the auxiliary
Workers") before building. Keep `OAUTH_KV` for OAuth, parked login state, and coarse throttling
only. Store complete turns in one D1 database and copy committed source rows on fork (simple
independent ownership and deletion).

```sql
CREATE TABLE playground_sessions (
  id TEXT PRIMARY KEY,
  owner_subject TEXT NOT NULL,
  title TEXT NOT NULL,
  share_token_hash TEXT UNIQUE,
  parent_session_id TEXT,
  forked_at_turn_id TEXT,
  version INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  last_activity_at INTEGER NOT NULL
);
CREATE INDEX playground_sessions_owner_activity
  ON playground_sessions(owner_subject, last_activity_at DESC);

CREATE TABLE playground_turns (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  user_text TEXT NOT NULL,
  assistant_text TEXT,
  trace_json TEXT,
  status TEXT NOT NULL, -- pending | complete | failed
  created_at INTEGER NOT NULL,
  completed_at INTEGER,
  UNIQUE(session_id, position),
  FOREIGN KEY(session_id) REFERENCES playground_sessions(id) ON DELETE CASCADE
);
```

Store only a hash of the cryptographically random share token. Derive titles locally from a clipped
first user message (no extra model call).

## Transcript and replay contract

Persist per turn: user text, final or bounded partial assistant text, a bounded trace array
(`tool-start` input and `tool-result` output/success for `search`/`execute`), status, and
timestamps. Never persist or share `thinking` frames or transient UI state; write once per turn
(never token-by-token).

UI renders the full saved transcript; model replay stays clamped by `clampHistory` in
`src/demo/budget.ts` (newest 20 user/assistant messages, 24,000-char budget; tool traces remain
display-only). All existing per-turn/hourly caps stay enforced.

## Routes, auth return, and access matrix

Extend `isPlaygroundPath` (`src/server.ts`) with strict segment parsing:

- `GET /playground` — landing (signed out) or new/recent private sessions (signed in).
- `GET /playground/s/<session-id>` — owner-only canonical session.
- `GET /playground/share/<share-token>` — public read-only transcript; composer unlocks on login.
- `POST /playground/chat` — server-authoritative `{ sessionId?, shareToken?, message }` returning
  canonical session ID in a response header before SSE streaming.
- `POST` / `DELETE /playground/s/<session-id>/share` — owner-only enable/revoke sharing.
- `DELETE /playground/s/<session-id>` — owner-only delete (nulls child `parent_session_id`; forks
  survive independently).

**Auth return:** `/playground/login` accepts a validated share token and parks `{ kind: "shared",
token }` in `OAUTH_KV`, reconstructing only `/playground/share/<validated-token>` after WorkOS
callback (never arbitrary `returnTo`, never prompt text in URLs or KV).

| Actor | Private source | Shared source | Send result |
|---|---|---|---|
| Anonymous | Generic unavailable/private | Read-only transcript | Login required |
| Owner | Read and append | Read and append | Continue same session |
| Signed-in non-owner | Generic unavailable/private | Read-only transcript | New private fork |

Return identical responses for missing and non-owned private sessions. Retain `Origin` /
`Sec-Fetch-Site`, HttpOnly `SameSite=Strict` cookie, and body-cap checks on all mutations.

## Fork-on-send, concurrency, and failure rules

For a signed-in non-owner sending against a share token: validate request/cookie/caps and apply the
hourly throttle *before* writing; then atomically verify sharing is still active, snapshot committed
turns only (excluding `pending`), create the private fork + new `pending` turn, return the new
session ID, run the clamped model loop, and finalize the turn.

- **Owner concurrency:** guard owner sends with optimistic `version` checks (conflict → reload).
- **Revoked before send / expired cookie / D1 pre-write failure:** reject without creating a fork or
  starting model spend.
- **Client disconnect / timeout / provider failure:** stop spend via the existing abort path and
  finalize the `failed` turn when possible. After fork creation, keep the private fork with its
  `failed` turn for retry; never redirect back to the source.
- **Worker termination on `pending`:** mark stale `pending` turns `failed` after the turn timeout
  ceiling plus margin.
- **Post-stream D1 failure:** report persistence failure honestly in telemetry and UI.

## Privacy, headers, and observability

- Opt-in sharing only; no directory, search, sitemap, or social previews.
- Shared responses set `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow`, and strict
  `Referrer-Policy`.
- D1 stores only the peppered WorkOS subject (no raw user ID, email, or tokens). Escape all stored
  text/JSON hydration data; tool output is untrusted.
- Share consent warns that anyone with the link can read saved text/traces and that forks survive
  revocation or source deletion.
- Recommend 90-day inactivity retention + explicit owner deletion (confirm policy before build).
- Telemetry keeps existing `demo-chat-start`, `demo-chat`, `demo-step`, `demo-search`,
  `demo-execute`, and rejection events; add only low-cardinality fields (`sessionMode`,
  `sessionPersisted`, `forkSourceTurns`, `shareAction`, D1 failure category, conflict/revoked
  counts). Never log raw session IDs, share tokens, prompts, answers, or trace bodies.

## Rollout and deferred choices

Ship as one reviewed vertical slice (never public sharing without revocation or persistence without
server-side ownership checks). Update the playground semantic eval harness to create/delete local
sessions instead of sending browser-authored `messages`. Run access/race/escaping/header tests,
playground eval, D1 migration, and baseline gates (`typecheck`, `test`, `build`, `secrets:scan`).

Confirm four choices before implementation:

1. Final inactivity retention period.
2. Whether new author turns appear to open viewers on reload only (recommended) or via polling.
3. Exact route naming and share-consent copy.
4. Whether failed turns keep bounded partial assistant output plus failure state (recommended) or an
   interrupted marker only.

## References

- [`ARCHITECTURE.md`](../ARCHITECTURE.md),
  [`research/demo-playground-design.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/research/demo-playground-design.md)
- Code anchors: `src/server.ts`, `src/demo/{auth,budget,chat,frames,page}.ts`
