---
id: ll-029
service: lumenloop
status: reported-upstream
discovered: 2026-08-18
upstreamTitle: Five Lumenloop tools publish a results object schema that conflicts with their live payload shape
evidence:
  - 2026-08-18 deployed codemode.describe exposed the inventory output schema for all five operations
  - 2026-08-18 independent live calls reproduced two grouped objects and three top-level arrays
  - inventory/lumenloop.json fetched 2026-07-06 declares the same results and text object for all five operations
  - Solo scratchpad 816 Lumenloop schema correction review
  - reported upstream 2026-08-19 through existing issue 35: https://github.com/lumenloop/lumenloop-backend/issues/35#issuecomment-5347713582
---

## Finding

Five public Lumenloop tools declare an output object with optional `results` and `text` fields. The
live payload for each tool uses a different top-level shape.

- `find_content_by_entity` returns grouped collections named `articles`, `av`, `events`,
  `proposals`, and `scf_submissions`.
- `find_similar_projects_semantic` returns a top-level array.
- `find_similar_scf_submissions` returns a top-level array.
- `get_related_projects` returns an object with a `content` field.
- `get_tags_vocabulary` returns a top-level array.

An agent that follows the published contract reads `r.data.results`. That value is undefined for
all five operations. The wrong contract can therefore erase valid rows from an otherwise
successful call.

`ll-019` already tracks the same defect for `find_av_passages`. This finding covers the other five
operations and keeps the A/V date semantics separate.

## Evidence

Independent read-only calls on 2026-08-18 reproduced every shape. The deployed catalog still
rendered a `results?` output field for each operation at that time.

The committed inventory snapshot stores the same legacy object schema for these tools. The local
gateway now suppresses those disproved schemas until exact replacements exist. It leaves the raw
payload unchanged.

## Recommendation

Publish one exact output schema for each operation.

- Use an array schema for the two similarity operations and `get_tags_vocabulary`.
- Define the grouped collection object returned by `find_content_by_entity`.
- Define the `content` container returned by `get_related_projects`.

Add a contract test that validates each live response against the public tool inventory. Keep
optional fields optional when one successful observation does not establish their presence.
