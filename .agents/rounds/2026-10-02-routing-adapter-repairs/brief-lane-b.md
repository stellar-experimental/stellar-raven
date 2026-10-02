# Lane B — do not return a failed Scout backend read as data

Worktree: `/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/lane-b`
Branch: `fix/scout-failed-read-not-data`. Read `brief-common.md` in this directory first.

## Problem (from `.agents/TODO.md`, "Do not return a failed Scout backend read as data")

Found on 2026-10-01 in the Stellar Docs adapter measurement. Under a parallel batch of 65
`scout.searchProjects` calls, Scout returned HTTP 200 with `counts.total: 0`, no rows, and
`meta.warnings` that begins "backend read failed" and reports a timeout. The adapter
(`src/adapters/scout.ts`) returned `ok` data. One answer then called two populated categories
unused. A direct burst of the same 65 requests reproduced one such response.

Done when: a response whose own metadata reports a failed backend read does not resolve as `ok`
data, a test pins the mapping, and the unread-parameter warning stays a success.

## Steps

1. Read the contract table in the header of `src/adapters/scout.ts` and the mapping code (the
   `meta.error` → soft-empty branch is the closest precedent). Read the `Meta.warnings` schema in
   `inventory/stellar-light.json` (Scout 1.9.61). Then read the upstream Scout source (public
   GitHub repository `Stellar-Light/stellar-scout`; network access is enabled) and enumerate every
   warning Scout emits for a failed backend read versus advisory warnings such as an unread
   parameter. Cite file and line in the report. Build the matcher from the service's own signal:
   if Scout emits a structured code, use it; if only a string family exists, match that family and
   document the upstream source.
2. Mapping. The lead's recommendation: `ok: false`, `kind: "error"` (a backend failure is a
   service error and inconclusive, not a soft-empty miss), `status: 200`, `message` = the warning
   text, and a `hint` that says the read failed transiently, retry once, then report the result as
   inconclusive. Keep `soft-empty` for genuine misses and `meta.error`. Any non-failure warning
   keeps today's success shape, including however warnings surface in `data` now. If you disagree
   with the mapping, state why in the report and implement what you believe is right.
3. Tests next to the existing Scout adapter tests under `test/`: (a) 200 with a failed-backend-read
   warning and zero rows → error; (b) 200 with an unread-parameter warning and rows → ok with data
   and the warning still visible; (c) the existing `meta.error` soft-empty case unchanged; (d) a
   failed-read warning that arrives with rows, if upstream can emit that: decide and pin it.
4. Documentation: if `ARCHITECTURE.md`, `docs/`, or the adapter header documents the Scout mapping
   table, update it to describe the new row.
5. Live check, read-only and light: one or two direct Scout calls with `curl` to confirm the
   current response shape on a normal `searchProjects` call. Do not burst the service.
6. Gates: the common gates plus `npm run test:smoke` (the adapter runs under `src/executor`).
7. In the report, recommend the measurement before release: which eval lane, which cases, and
   why. The lead runs any paid measurement.
