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
sentence in part. A reference in a fenced or indented code block still throws.

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

Reviewer: Claude Fable 5.1 at high, a subagent of this session. Herdr was not active, so a Codex
frontier lane (the matched tier for scrub code) was not available. The author is Claude Opus 5.5.
Verdict: approve with changes. The reviewer reproduced the measurement, checked the blob SHAs, the
live Scout operation names, and the Allbridge and Varial claims, and found no leak in the served
bytes.

| # | Finding | Resolution |
| --- | --- | --- |
| 1 | An indented code block was split as prose instead of failing closed. | Fixed: `paragraphLine` rejects lines with four spaces or a tab; test added. |
| 2 | A sentence that ends with `)`, a quote, or `**` did not split, so the next sentence was also removed. | Fixed: `splitSentences` consumes closing marks before the whitespace test; tests added. |
| 3 | A line that ends in an abbreviation could leave a fragment. | Fixed: per-line mode also checks `ABBREVIATION_END_RE`; test added. |
| 4 | `/api/hackathons/builds/{id}` matched only the literal `{id}`. | Fixed in the scrub and in `assertNoNonExposedRefsInText`: a templated segment matches any concrete value; tests added. |
| 5 | The runtime scrub did not decode percent-encoded paths (existing gap). | Fixed: `containsExcludedScoutPath` also tests the decoded text, as the build guard does. |
| 6 | Table, quote, and list lines inside a fence were removed instead of failing closed (existing gap). | Fixed: fenced lines bypass every removal; test added. |
| 7 | The removed sentences held the only `.meta.counts` definition for the exposed builds operation; "(here only, not on analyze)" remains. | Accepted, not filed upstream: upstream documents its own API, where analyze is public, so the sentence mixing is not an upstream defect. The Params list keeps the `hackathon` forms. |
| 8 | The policy comment said to move the entries to the excluded list on absorb. | Fixed: the comment points to the exposure recommendation in `.agents/TODO.md`. |
| 9 | The gates note said "skill-section descriptions". | Fixed: it names the two skill file entries. |

After the fixes, all eight upstream files (held and new) scrub to the same bytes as commit
5816ed4f. The served text does not change.
