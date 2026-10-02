# Retrieval demand report

Status: possible future work. The live id query is enough until someone needs the question text,
or needs the same ranking after the Workers Logs window.

MCP is the primary surface. The Playground is a secondary source. Include it when the same report
already has a place for it. Do not design the collection around it.

## The desire

The desired reading is the question an MCP caller is trying to answer. Take that reading from the
text the MCP client actually sends. A catalog id or an operation id is only a proxy for that
question.

Two MCP texts carry the intent:

1. **Lookup strings inside `execute`.** The model sends code. The string arguments to content
   lookups are the closest text Raven receives to the question being answered. Examples are the
   query passed to `lumenloop.search_content_semantic`, `stellarDocs.search_docs`, or
   `scout.searchResearch`. The operation id says which tool ran. The argument says what the model
   asked that tool to find.
2. **Catalog `search` query.** The model also sends a `search` query so Raven can pick source
   material. That text is a shorter distillation. It often names a tool family, not the question.

MCP does not receive the person's original question. The host model keeps it. The reading above is
the model's distillation, taken from the text that arrives on `/mcp`.

The Playground message on `/playground/chat` is the person's own words. `demo-chat-start` records
`latestUserChars` and `historyChars` only. That message is out of scope for the primary extract.
Playground search ids and Playground executes can sit beside the MCP counts.

## What logs can show today

Workers Observability calculations can rank these MCP fields for about 7 days:

- `op.id`, each upstream operation an execute script calls
- `search` field `top.0`, the first catalog id, split by `source` (`tool` or `codemode`)
- `skill_read.id` and `skill_run.id`

`demo-search` field `top.0` is the same fact for the Playground. Keep it in a secondary column.

The query shape that held on 2026-10-02:

- service `stellar-raven-codemode`
- app logs only, `$metadata.type = cf-worker`
- `view: calculations`, grouped counts
- 14 adjacent windows of 12 hours across 7 days
- `abr_level` 1 on every window

A flat 7-day `events` query is the wrong instrument. The
[observability skill](../.agents/skills/cloudflare-observability-review/SKILL.md) owns that trap.
The procedure there is the way to repeat this sample.

Leave the resulting counts out of git. [The usage guide](../usage/README.md) forbids committed
production counts.

Read the ranking as call volume. One execute script can call the same operation many times. Say
that in any share-out. These counts show which tools run. They do not show the question.

`op` has no surface field today, so an operation total mixes MCP execute and Playground execute.
MCP execute is the bulk of that mix. A share-out should say the count is mixed, or split it once
the surface is known.

## Held intent extract

This note exists for a redacted extract of the two MCP texts:

- the string arguments of search-like operations inside `execute`
- the catalog `search` query string

Store an aggregate, such as token counts or a short redacted form. Keep the operation id with the
lookup string so the subject stays attached to the tool. Do not store the execute script.

The id counts above can be kept as the safe layer under that extract. An id table alone does not
meet the desire.

Gates before any collection:

- Redact secrets before storage. Host-secret redaction is not enough. Callers paste their own keys
  into query text and into code.
- Name the purpose, who can read it, and the retention period.
- Update the usage disclosure before collection starts.
- Follow the usage guide's ban on a published list of raw queries or reversible short-query hashes.
  A private aggregate can exist under that ban. A public "top questions" list of raw strings cannot.

Playground chat text stays out. It is the text most likely to contain a pasted secret, and it is
not the primary source. Full execute code stays out for the same reason.

## What this note is not

This is not a raw log archive. [The R2 retention note](./observability-r2-retention.md) covers that
held path, and its trigger is forensic history rather than a subject reading.

This is not the monthly usage report. That report stores tool counts and account hashes. It stores
no catalog ids and no query text.

This is not per-user memory. [The personalization note](./per-user-mcp-observability.md) covers
that held path.

## Id aggregate, if the 7-day window is not enough

Build a small count of public ids when an operator needs the MCP ranking on a schedule, or after
Workers Logs expire. Keep one row per day and id, with a count. Include:

- operation id
- search first-id, with source `tool` or `codemode`
- skill-read id and skill-run id
- surface, so MCP stays separate from Playground

Add Playground search first-id in the same table when the surface column exists. Do not add a
Playground-only store.

Keep the no-payload rule from [the architecture](../ARCHITECTURE.md) for this layer. Store no
query text, execute code, answers, account hashes, or request ids in the id table. Catalog ids
and operation ids are already public.

Put either aggregate next to the usage collector only after its purpose, access, and retention
are written down. The 13-month response table is a different purpose. Do not widen it by default.
