# Shareable durable `/playground` sessions

Status: deferred product idea only. The Playground remains stateless.

Recorded: 2026-07-15 from product discussion about durable private playground sessions that an
author may share publicly. A viewer can read a shared session without signing in. If that viewer
signs in and asks a follow-up, Raven creates a private fork owned by the viewer and continues there;
the shared source never becomes collaborative or writable by another user.

## Issue #40 status

Issue #40 requested a copy action, a larger paste limit, and cross-session history. PR #70 shipped
the copy action. The owner approved an 8,000-character user-message ceiling on 2026-08-28. The
owner kept cross-session history deferred and the shipped Playground stateless.

The input-limit change is queued in `.agents/TODO.md`. The durable-session design below remains an
unapproved idea and requires a new owner decision before implementation.

## Input-limit decision

The client keeps the complete pasted text visible. It shows a live count and the exact excess,
disables Send, and presents an accessible inline error. The server rejects a bypassed request with
the same 8,000-character contract. Neither layer truncates user input. A modal is unnecessary.

## Deferred design shape

If the owner reactivates durable sessions, use asynchronous conversation sharing rather than live
collaboration.

- Every new session is private and owned by the signed-in user.
- Owners can reopen private sessions after a browser, login, or Worker restart.
- An owner can opt one session into public-by-link reading and later revoke that link.
- A public viewer does not need an account to read the shared transcript.
- Viewing or signing in does not create a fork. The viewer's first follow-up message does.
- A fork is immediately private to the viewer, independent from the source, and receives a new
  canonical session URL.
- A non-author can never append to the author's session. The server owns this invariant; the UI is
  only an affordance.
- No explicit **Fork** button is needed. The ordinary composer is the transition point.
- Interrupted model-stream resumption is out of scope. A failed/interrupted turn may be retried as
  a new turn.

This differs from collaborative chat: no shared write cursor, presence, live synchronization,
conflict merging, or cross-user mutable state exists. Fork-on-send keeps ownership and privacy
obvious while satisfying the intended “friend sent me useful research; I want to ask my own next
question” flow.

## Intended user experience

### Author

1. Sign in and start a normal `/playground` conversation.
2. Raven persists each turn. The session appears in the author's recent-session list and has a
   stable private URL.
3. Select **Share** for that session. Raven creates a new unguessable public share token and exposes
   a copyable `/playground/share/<token>` URL.
4. Continue using the original session normally. Because the public link represents the live
   session, later completed author turns become visible to link viewers while sharing remains on.
5. Select **Stop sharing** to invalidate that token immediately. Sharing again creates a fresh
   token; old links do not reactivate.

Share confirmation must state the real boundary: anyone with the link can read the saved user
messages, assistant answers, and visible tool trace, and can retain an independent private copy by
continuing it. Revoking or deleting the source cannot delete forks already created by other users.

### Anonymous viewer

1. Open `/playground/share/<token>` without a Raven cookie.
2. Read and scroll the complete shared transcript and visible tool cards. No WorkOS gate covers the
   transcript.
3. See the normal composer area in a locked state with a compact static overlay, for example:

   > Sign in to ask a follow-up. Your first message creates a private copy.

4. The overlay's login control starts the existing WorkOS playground login. An alternate acceptable
   presentation is changing the disabled **Send** button label to **Sign in to continue**. Do not
   add a separate fork action.
5. Return to the same shared URL after login. Login only unlocks the composer; it does not create
   storage or consume model budget.

The transcript should remain readable behind neither a full-page modal nor a visual blur. Only the
composer needs locking. Keeping the input disabled until login avoids carrying an unsent prompt
through OAuth. If later feedback strongly favors pre-login drafting, `sessionStorage` can retain a
draft on the same origin without putting prompt text in a URL, cookie, parked login state, or log.

### Authenticated non-author

1. Open the shared URL and see the unlocked composer plus small permanent copy such as “Your first
   follow-up continues in a private copy.”
2. Enter a question and press the ordinary **Send** button.
3. Before model execution, server atomically snapshots the source into a new private session owned
   by this user and appends the new user turn there.
4. Response identifies the new canonical private session. Browser calls `history.replaceState`
   before consuming the SSE stream, changing the URL to the viewer's private session.
5. All model output and future turns belong only to the fork. Returning to the public link still
   shows the author's source.

If authenticated actor is source owner, sending continues the source rather than forking it.

## Meaning of durable and restarted

“Durable” means completed conversation state survives page reloads, browser restarts, expired demo
cookies, new Worker isolates, and deployment restarts. Reauthentication derives the same existing
peppered WorkOS subject, so the owner can list and reopen stored sessions.

“Restarted” does not mean resuming a provider's partially consumed token stream. On timeout,
disconnect, provider error, or Worker termination, retain a bounded failed/interrupted turn state
and let the user retry. Reliable provider-stream resumption is separate work with little value for
the sharing use case.

Durable ownership depends on `MCP_SERVER_SECRET` continuing to derive the same subject. Secret
rotation needs an identity-migration plan before production rotation; otherwise existing cookies,
OAuth subjects, and durable playground ownership all change together.

## Current implementation gap

Current playground is deliberately stateless:

- `src/demo/page.ts` holds user/assistant replay history only in browser memory.
- Each `POST /playground/chat` sends the whole current user/assistant message list.
- `src/demo/chat.ts` validates and clamps that browser-provided list to the newest 20 messages and
  the 24,000-character replay budget.
- Tool trace frames are display-only and are not replayed to the model on later turns.
- `src/demo/auth.ts` provides a two-hour signed cookie containing the stable peppered subject, but
  the cookie owns no conversation state.
- `src/server.ts` matches only exact playground paths and declares no Durable Objects or session
  storage.
- `OAUTH_KV` stores OAuth/login state and the best-effort hourly demo throttle. It is not suitable as
  the canonical conversation database because listing, relational ownership, fork snapshots, and
  coordinated writes need stronger query and transaction behavior.

The model/tool loop, cost caps, SSE format, WorkOS identity, same-origin protections, and session
affinity can remain. Persistence changes which side is authoritative for history: server storage,
not the browser request.

## Storage choice

Use one Cloudflare D1 database. Do not add Durable Objects for this feature.

D1 fits session lookup, per-owner listing, public-token lookup, ordered turns, ownership checks,
atomic fork creation, and retention cleanup. Durable Objects would be warranted for resumable live
streams or real-time multi-writer coordination; both are explicitly outside this design. Continue
using `OAUTH_KV` only for its current OAuth, parked-login, and coarse throttle roles.

Store complete turns directly in D1 initially. Forking may copy source rows into the new session.
That duplicates data, but produces simple independent ownership and deletion semantics at expected
playground volume. Do not introduce recursive ancestry reads, content-addressed turn graphs, or R2
trace blobs until measured D1 size or fork frequency makes copying material.

### Proposed schema

Exact SQL belongs in an implementation migration, but minimum logical shape is:

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
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  completed_at INTEGER,
  UNIQUE(session_id, position),
  FOREIGN KEY(session_id) REFERENCES playground_sessions(id) ON DELETE CASCADE
);
```

Required `status` values can stay narrow: `pending`, `complete`, and `failed`. `assistant_text` and
`trace_json` may contain bounded partial output for a failed turn. Do not add editable messages,
branches inside one session, collaborators, permissions tables, or generalized ACLs.

Use cryptographically random identifiers. Store a hash of the public share token rather than the
raw token in D1. Sharing is represented by a non-null token hash; revoking sets it to null. Enabling
sharing again generates a new token, preventing a previously revoked URL from becoming valid again.
The public URL remains a bearer link visible to its recipients and Cloudflare's request layer;
randomness prevents discovery, not deliberate forwarding or platform-operator access.

Generate titles locally from a clipped first user message. Do not spend another model call on
title generation.

## Saved transcript contract

Persist what the user could see and what future model turns need:

- user message text;
- final or bounded partial assistant text;
- `tool-start` input for `search` and `execute`;
- corresponding `tool-result` output and success state;
- stalled/failed status needed to render an honest interrupted card;
- turn timestamps and stable ordering.

Never persist or share `thinking`/reasoning frames. Do not persist transient `ready`, token-delta,
pulse, focus, scroll, or accessibility-announcement state. Accumulate token deltas into the saved
assistant text and tool frames into a bounded trace array, then write final state once per turn.

Opening or forking a session may render its full saved transcript. Model replay remains subject to
today's `clampHistory` contract: newest 20 user/assistant messages, then oldest messages dropped
until content fits 24,000 characters when possible. Saved tool traces remain display evidence and
are not inserted into later model context. A fork therefore preserves the visible research record
while giving the model the same bounded conversational memory it would have received had the
author continued normally.

Keep existing per-message, body, output, tool-call, execute-code, step, timeout, and hourly chat
limits. D1 persistence must not create an unbounded model-context path.

## Route and request shape

Prefer minimal additions around current server-rendered page and SSE handler:

- `GET /playground` — new/recent private sessions for authenticated users; existing public landing
  remains available when signed out.
- `GET /playground/s/<session-id>` — private canonical session page. Owner-only transcript.
- `GET /playground/share/<share-token>` — public shared transcript. Composer state depends on auth.
- `POST /playground/chat` — one new or continued turn. Replace browser-authored `messages` with a
  server-authoritative request such as `{ sessionId?, shareToken?, message }`.
- `POST /playground/s/<session-id>/share` — owner-only; enable sharing and return fresh public URL.
- `DELETE /playground/s/<session-id>/share` — owner-only; revoke current public token.
- `DELETE /playground/s/<session-id>` — owner-only session deletion.

An implementation may consolidate mutation routes, but must not consolidate access decisions in
browser code. Extend `isPlaygroundPath` with strict segment parsing rather than a broad
`startsWith("/playground")` catch-all that would absorb unrelated routes.

For same-origin SSE, `POST /playground/chat` can return the canonical private session ID in a
response header before stream consumption. This avoids adding a control frame solely for URL
navigation. The browser reads the header, replaces its URL, then handles existing SSE frames.

New-session creation can remain lazy: first signed-in send creates a private session and pending
turn. Merely loading `/playground` creates nothing.

## Authentication return flow

Current demo parked login state accepts only `/playground` and `/playground/`. Shared continuation
needs a bounded extension, not a general redirect parameter.

The shared page's login overlay should call `/playground/login` with a validated share token. The
login route parks a structured destination such as `{ kind: "shared", token }` in `OAUTH_KV`.
After WorkOS callback and signed-cookie creation, server reconstructs only the fixed internal route
`/playground/share/<validated-token>`. Never park or honor an arbitrary caller-provided `returnTo`
URL.

Login does not prove access to a private source and does not reserve a fork. On return, the shared
page performs the normal current visibility lookup. If author revoked sharing during login, show a
generic unavailable/private state and do not reveal or copy transcript data.

An expired cookie during an attempted send should preserve the typed draft in page memory, show
the login overlay, and avoid creating a fork. Optional `sessionStorage` draft recovery may follow
later; never serialize prompt text into the login URL or parked KV state.

## Server-side access rules

Apply this matrix on every request:

| Actor | Private source | Shared source | Send result |
| --- | --- | --- | --- |
| Anonymous | Generic unavailable/private response | Read-only transcript | Login required |
| Owner | Read and append | Read and append | Continue same session |
| Signed-in non-owner | Generic unavailable/private response | Read-only transcript | New private fork |

Return the same public response for a missing private session and an existing session owned by
someone else. A signed-out user following a private owner URL may see a generic “Unavailable or
private; sign in if this is yours” page, but status and content must not reveal existence.

All mutations retain current same-origin `Origin` and `Sec-Fetch-Site` enforcement, HttpOnly
SameSite=Strict cookie verification, body caps, and server-side authorization. Public GET access
does not weaken chat, share, revoke, or delete checks.

## Fork-on-send transaction

For a signed-in non-owner posting against a public share token:

1. Validate method, same-origin request, cookie, body size, message shape, and user-message cap.
2. Apply the existing subject hourly throttle before creating fork storage, so a rejected
   rate-limited send does not leave an empty session.
3. Resolve token hash and recheck that sharing is active inside the same coordinated database
   operation used to create the fork. A page rendered while public is not authorization to fork
   after revocation.
4. Snapshot only committed source turns. Exclude a source turn still marked `pending`.
5. Create a new session owned by current subject, with no share token and parent/fork metadata.
6. Copy the committed source turns into that session in stable order.
7. Append the viewer's new `pending` turn and increment session version.
8. Return the new private session ID before starting model/tool streaming.
9. Load clamped user/assistant context from the fork and run the existing model loop.
10. Finalize the pending row with assistant text, visible trace, status, and timestamps.

Steps 3–7 must be atomic. Concurrent author activity yields a deterministic snapshot through the
last committed turn visible to that transaction. Later source turns never flow into the fork.

For owner continuation, use the session `version` as an optimistic concurrency guard. Two browser
tabs submitting from stale versions should not silently interleave; one receives a conflict and
reloads current state. This provides enough coordination without per-session Durable Objects.

If model execution fails after fork creation, keep the private fork plus failed pending turn. The
viewer can retry there; never redirect the failed request back into the author's shared source.

## Privacy and public-sharing boundaries

- Public sharing is opt-in per session and off by default.
- No public session directory, search endpoint, sitemap entry, social preview transcript, or
  predictable identifier exists.
- Shared responses use `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow`, and a strict
  `Referrer-Policy` so browsers and crawlers do not casually propagate links or content.
- App telemetry never records raw session IDs, share tokens, prompts, assistant answers, or saved
  trace bodies. If joinable session telemetry becomes necessary, derive a short secret-keyed hash.
- D1 stores only the already-peppered WorkOS subject, never raw WorkOS user ID, email, access token,
  or identity profile.
- Public HTML safely escapes stored text and JSON hydration data. Existing markdown rendering must
  remain text-originated and CSP-constrained; saved tool output is untrusted data.
- Sharing consent warns that session text and tool results may contain facts or identifiers the
  author entered, and that forks survive revocation.
- Deleting a source removes its rows and disables its share URL. Already-copied fork contents remain
  owned by their fork authors; parent metadata should be nulled rather than blocking source delete.

Recommend a 90-day inactivity retention default plus explicit owner deletion for initial launch.
The exact retention period needs product/privacy confirmation before implementation. A scheduled
cleanup can delete expired private sources; existing independent forks follow their own activity
clock. Do not claim indefinite storage without an explicit policy and cost review.

## UI scope

Minimum UI additions:

- recent sessions list for signed-in owner, ordered by last activity;
- locally derived title and updated time;
- new-session action;
- share/copy-link and stop-sharing controls on owner sessions;
- delete control with confirmation;
- public transcript page;
- compact composer login overlay for anonymous viewers;
- small fork disclosure for authenticated non-owners;
- canonical URL replacement after new-session or fork creation;
- honest failed/interrupted turn rendering.

Do not add collaboration indicators, avatars, permissions management, nested branch trees, fork
visualization, editable titles/messages, reactions, comments, or public discovery. Parent metadata
exists for provenance and debugging; a visible branch graph can wait for demonstrated demand.

## Failure behavior

- Invalid/revoked public token: generic unavailable page; never fall back to author/private lookup.
- Share revoked between page load and send: reject without fork creation or model spend.
- Login expires before send: retain local draft for current page lifetime and show login overlay.
- D1 write fails before stream: return error; do not start model spend.
- Client disconnect/model timeout/provider failure: stop spend using current abort path and finalize
  failed turn when possible.
- Worker terminates after creating `pending`: next load renders it interrupted; a cleanup or load
  repair may change stale `pending` to `failed` after the 120-second turn ceiling plus margin.
- Final D1 write fails after model output streamed: report persistence failure in telemetry and UI
  on reload; do not pretend turn is durable. Avoid token-by-token D1 writes.
- Concurrent same-session send: optimistic version conflict; reload rather than reorder silently.
- Source deletion after fork: fork remains complete and private because rows were copied.

## Observability

Retain current `demo-chat`, `demo-step`, `demo-search`, `demo-execute`, and rejection events. Add only
low-cardinality facts needed to operate this feature, for example:

- `sessionMode`: `new`, `owner`, or `fork`;
- `sessionPersisted`: boolean;
- `forkSourceTurns`: bounded count;
- `shareAction`: `enable`, `revoke`, or `delete` on mutation events;
- D1 duration/failure category;
- stale-version or revoked-during-send rejection counts.

Never log the public token or raw session identifier. Anonymous shared-page reads likely need no
new app event unless traffic/cost evidence later requires one; Cloudflare request telemetry already
measures route traffic.

## Verification and rollout

Minimum focused checks:

- new session is private and reopens for same subject;
- another subject and anonymous caller cannot distinguish private from missing;
- shared transcript is readable without cookie;
- anonymous shared composer is locked while transcript remains visible;
- login returns only to validated shared destination;
- signed-in non-author first send creates private fork and never changes source;
- owner send continues source without fork;
- fork contains exact committed snapshot and excludes pending source turn;
- revocation between render and send blocks fork;
- stop-sharing invalidates token and re-sharing rotates it;
- fork remains after source unshare/delete;
- concurrent stale owner send conflicts cleanly;
- full saved transcript renders while model replay remains clamped;
- persisted trace excludes all `thinking` frames;
- malformed/oversized bodies and rate-limited sends create no session/fork;
- persistence failure prevents model start where possible;
- shared HTML and hydrated data escape hostile stored content;
- public pages emit noindex/no-store/referrer headers.

Update the playground semantic eval harness because `/playground/chat` will no longer accept a
browser-authored full `messages` array. Each eval run should create and later delete its own local
session rather than adding a special non-durable production path.

Baseline implementation verification remains `npm run typecheck`, `npm test`, and `npm run build`,
plus the narrow playground eval, generated-artifact rebuilds if touched, and
`npm run secrets:scan -- --tree` before commit. Deployment needs a D1 binding/migration, preview
verification, production migration, then live public/private/fork smoke checks.

## Estimated effort

One engineer, roughly 5–8 focused engineering days for the intended complete version:

1. D1 binding, migration, minimal persistence module, and access/fork tests: 1–2 days.
2. Server-authoritative chat history, pending/final turn writes, and route/auth changes: 1–2 days.
3. Session list, durable transcript hydration, sharing controls, and public login overlay: 1–2 days.
4. Race/security/failure tests, eval-harness update, docs, migration, and deployment verification:
   2 days.

A text-only prototype could fit 3–5 days, but omitting visible tool trace would make reopened and
shared Raven sessions materially less useful. Real-time collaboration or resumable provider
streams would be separate, substantially larger projects and are not prerequisites.

## Implementation order

If prioritized, ship in one reviewed vertical slice rather than exposing partially durable state:

1. Add D1 schema and pure store/access helpers.
2. Make stored session history authoritative for chat.
3. Add private reopen/list behavior.
4. Add tokenized public reads and share/revoke lifecycle.
5. Add validated shared-login return and fork-on-send transaction.
6. Add composer overlay, canonical URL switching, and saved trace rendering.
7. Run access/race/security checks, playground eval, migration, and production smoke tests.

Do not first ship public sharing without revocation, or persistence without server-side ownership
checks. Those are trust-boundary requirements, not optional polish.

## Deferred choices

Confirm before implementation:

- final inactivity retention period;
- whether author continuation appears live immediately to an already-open anonymous viewer only on
  reload, or via later polling (recommend reload only initially);
- exact public/private route naming and share copy;
- whether failed turns retain bounded partial assistant output or only an interrupted marker
  (recommend bounded visible partial output plus explicit failure state).

None changes core architecture: D1-owned private sessions, rotatable public read links, login-gated
composer, and atomic private fork on first non-author send.

## Repository references

- [`ARCHITECTURE.md`](../ARCHITECTURE.md) — current stateless playground and demo caps.
- [`research/demo-playground-design.md`](../research/demo-playground-design.md) — current WorkOS,
  SSE, history-clamp, cost, and trace decisions.
- [`src/server.ts`](../src/server.ts) — exact playground routing and current no-session boundary.
- [`src/demo/auth.ts`](../src/demo/auth.ts) — signed demo cookie and bounded login return state.
- [`src/demo/chat.ts`](../src/demo/chat.ts) — browser-authored replay, SSE turn, abort, throttle, and
  model loop.
- [`src/demo/page.ts`](../src/demo/page.ts) — in-memory client history, composer, and trace UI.
- [`src/demo/frames.ts`](../src/demo/frames.ts) — visible SSE frame contract.
- [`src/demo/budget.ts`](../src/demo/budget.ts) — replay and per-turn limits that remain in force.
