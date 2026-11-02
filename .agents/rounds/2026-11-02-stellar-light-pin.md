# 2026-11-02 — stellar-light pin absorb (owner decision E, option 1)

## Decision

The owner chose option 1 on 2026-11-02: absorb the upstream stellar-light pin now, so
`codemode.skill.read` stops serving the withdrawn Allbridge recommendation. Scout stays held at
1.9.61 (decision D, #223).

## Mechanism

Raven vendors no skill body. `ecosystem-skills/MANIFEST.json` pins a commit and a blob SHA for each
file. `codemode.skill.read` fetches the pinned upstream file, verifies the SHA, and applies
`scrubNonExposedRefs` (`src/skills/scrub.ts`). The scrub is the only host-side change to the text.
It enforces ADR-0003: served text never names an operation that the manifest does not expose.

The new `references/api-reference.md` names four Scout operations that 1.9.61 does not expose.
Live Scout 1.9.116 lists them with these exact methods and names, now recorded in
`OPTIONAL_EXCLUDED_SCOUT_OPERATIONS`:

| Operation | Name |
| --- | --- |
| `GET /api/sources/locate` | `locateSource` |
| `GET /api/hackathons/builds/{id}` | `getHackathonSubmission` |
| `GET /api/hackathons/analyze` | `analyzeHackathonSubmissions` |
| `GET /api/hackathons/review` | `reviewSubmission` (already listed) |

The scrub removes their four heading sections. Three prose sentences in the exposed
`GET /api/hackathons/builds` section also name `/api/hackathons/analyze`. The scrub threw on
them, so the build would fail closed. The scrub now removes each complete prose sentence that names
an excluded path. It keeps the line breaks when each source line ends a sentence. It never edits a
sentence in part, and a reference in a code fence still throws.

## Measurement

- Held pin `3b587aa9f23d`: the old and new scrub give byte-identical output for all four files.
- New pin `9f77b3f9433b`: all four files scrub without error; no excluded path or operation name
  survives. The removed sentences are the three that name `/api/hackathons/analyze`. The
  `hackathon` parameter forms stay in the section's Params list.
- Routing: the full result object matches an `origin/main` run (every case row, rank, score, and
  lane total). Only the manifest fingerprint in `eval/gates.json` moves.
- Residual: one served phrase, "(here only, not on analyze)", names the analyze tool without its
  path. It gives no way to call the tool.

## Review

Pending.
