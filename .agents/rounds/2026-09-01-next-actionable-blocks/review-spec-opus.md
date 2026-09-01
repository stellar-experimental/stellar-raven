# Specification review

Reviewer: Claude Opus 5 at high effort.
Mode: read-only.
Fixed point: `9d4362f73ae51e495ac75ee6160593fa2738ef03`.

The reviewer returned `FINDINGS`.

1. Medium: the prose inventory omits the generated `src/mcp/micro-map.ts` text that
   `SERVER_INSTRUCTIONS` embeds. Add the surface and adjudicate its Data/RPC archetype.
2. Medium: the candidate filter ran over 44 explicit no-tool answers, not all 2,406 stored
   answers. Run an offer-focused scan across every stored answer. Record both denominators.
3. Medium: the parser ignores `--expect-agent-environment-sha256=<hash>`. With an optional flag,
   this form fails open. Reject the equals form before any paid call.
4. Low: the process tests cover only stored judging. Add a collection-mode failure test that
   proves no answering-agent spawn.
5. Low: the production report and `.agents/NEXT.md` contain stale self-descriptions. Record the
   completed `ARCHITECTURE.md` repair and scope the earlier audit statement.
6. Low: the queue removed the environment-pin item before its final validation was recorded.
   Record the completed validation before finalization.

The reviewer also verified the following facts:

- The pin value reaches collection and stored-judging metadata.
- The 17 no-tool candidate adjudications are sound.
- The production plan stays local-only and preserves its authorization gates.
- The `ARCHITECTURE.md` row matches the current source behavior.

Finding count: 6. Three medium. Three low.
