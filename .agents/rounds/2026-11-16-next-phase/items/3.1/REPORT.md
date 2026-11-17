# Item 3.1 report: read production once

Lead: Claude Opus 5.5, agentpc `t1s6`. PR [#461](https://github.com/stellar-experimental/stellar-raven/pull/461)
(branch `np/3.1-production-read`), open and not merged. Deploy: not needed, because no Worker bytes
change. Spend: USD 0.

The figures are not in this file. They are in `/home/tyler/code/raven-wt/np-3.1/tmp/3.1/FIGURES.md`
on agentpc (git-ignored, mode 0600), for the owner's private evidence folder.

## Result

| Question | Decision |
|---|---|
| Public `MAX_SEARCH_LIMIT` | Keep 50. More than 5% of top-level searches ask for more than 10, both after the seven-card deploy and over the whole window. |
| Lumenloop and Scout per-call timeouts | 24 s each, shipped by item 3.2. |
| Artifact caps 8 and 4 | Keep. There was no refusal in the window. |
| `EXECUTE_TIMEOUT_MS` | Not decided; keep 60 s. The platform half of the rule returned no rows. |
| 6(b) | The Dashboard lumens API is not measurable. The release source has an upper bound only. The committed evidence (item 1.3's classification and the HackMeridian probes) still decides it. |
| Next product item | 3.2, with the `errorName` and `scout.matchPartners` bullets, then 3.3. Application development shows very low error rates. Audits are low volume, and `scout.getRepoTrust` is mostly soft-empty (it is in the new anomalies TODO item). **Please confirm this order.** |

## Not read

- **User-agent families and per-client figures:** every query that grouped by the user-agent header returned no rows.
- **Platform `POST /mcp` wall time:** every query that filtered `cf-worker-event` with path `/mcp` returned no rows.
- **`recoveryHint` and artifact-write `skipped`:** neither key appeared in key discovery.

The telemetry `keys` endpoint ignores event filters and returns the same capped list for every family. My script trusted that list, so these queries ran on keys that the filtered rows may not carry. That is my script's defect. The skill now records the trap.

## Questions for you

1. **A Mac follow-up read (free, about 15 minutes of requests).** It would decide `EXECUTE_TIMEOUT_MS`, attribute the client 401 and 404 loops, and read `recoveryHint`, `skipped` and `errorName`. Its first step finds which row type carries the path and user-agent: group one recent hour by `$metadata.type`. That needs one round trip before I can write the main queries. It is outside this item's "one window, one read" stop rule, so I did not ask for it. Run it now as a 3.1 follow-up, or leave it in the TODO (current state)?
2. Confirm the next-item order: 3.2 first, then 3.3.

## Mac-only steps used

The Workers Logs read and its 549 per-slice re-runs ran on the Mac with your OAuth token, because agentpc's token gets 403 on the telemetry API. The first run hit HTTP 401 when the token expired. The first slice was dropped from every query, since part of it was past retention. The output is in `tmp/3.1/workers-logs-out/` on agentpc.

## Children

- `t1s7`: Claude Fable 5.2 plan review.
- `t1s8`: Claude Sonnet 5.5 executor.

Both are killed and removed.
