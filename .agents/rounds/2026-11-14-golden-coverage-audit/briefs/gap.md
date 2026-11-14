# Brief: gap research and new cases

Read `briefs/common.md` first. Your launch line names your lane (`gap-<n>`) and your slot file,
`gap/<lane>.slots.json`: a list of open slots, each `{leaf, title, scope, weight, volatility,
facet, draftQuestion, canonicalSources}`.

## Task

For each slot, find the one categorical question and its golden answer, proven from live sources,
and write it as a proposed case. Also record whether Raven can answer it today.

Read `.agents/skills/golden-truth/SKILL.md` in full and `eval/qa/corpus/README.md` once. Read two
or three files under `eval/qa/corpus/proposed/` for the proposal file form.

## Per slot

1. **Question.** One question a real agent, builder, integrator, analyst, or user would ask, that
   tests the heart of the leaf (the facet named in the slot). Not trivia, not a list request that
   only a directory could satisfy, and answerable by any correct source. Improve the draft
   question freely.
2. **Research.** Establish the answer from at least two independent source classes; numbers,
   versions, dates, and amounts need one primary source (class A or B). Use `parallel-cli search`
   and `extract` widely, `gh` for source code, and the `perplexity` tools as a second engine. For a
   weight-3 slot or a disputed fact, also run one `parallel-cli research`. Record each claim with
   its verdict (`confirmed`, `confirmed-as-of`, `disputed`, `unverifiable`) and evidence rows.
   - Never pin a disputed or unverifiable fact. Grade the durable form instead (the mechanism, the
     CAP or SEP id, "cite a dated primary source").
   - A `live` slot gets behavioral key facts that accept a later dated figure. A `scheduled` slot
     states its value with an as-of date and gets a `reverifyBy` date one quarter out; spread the
     dates across 2027-02-01 to 2027-04-30 by picking a different day for each case.
3. **Raven check.** Ask Raven the question the way an agent would: one `search` per source family,
   then one `execute`. Record `ravenReach`:
   - `answerable`: Raven's sources returned the key facts.
   - `reachable-not-surfaced`: a Raven source holds the fact (you confirmed it by a direct, exact
     read), but an ordinary search did not surface it.
   - `unreachable`: no Raven source holds it. Name the canonical owner and the page or record that
     should hold it.
   Record what you called and what came back in two or three lines. This is evidence about Raven;
   it never changes the golden.
4. **Golden.** Compact: an answer of 60 words or fewer where the truth allows; two to four key
   facts, each one predicate, each a world fact of 90 characters or fewer; avoid items ("Do NOT
   ...") only for claims you verified false or as a sourcing guard on a volatile value; notes for
   grading cautions only. No tool names and no provenance in judge-facing text.
5. **Duplicate check.** `grep -ril` the battery for the entity and the main terms. If an active
   case already tests this knowledge, do not write a case: record the slot as `covered-by` with
   that id.

If a slot cannot be answered with confidence from any source, do not write a case. Record it as
`no-golden` with what you tried. That is a real result.

## Output

- One proposal file per new case: `eval/qa/corpus/proposed/<category>/<id>.json`, in the form the
  existing proposals use, with `truth.lifecycle.state: "proposed"`, `truth.leaf`, full
  `truth.sources` and `truth.corroboration`, and `truth.origin: "golden-coverage-audit 2026-11-14"`.
  Choose `<category>` from the ten existing directories. Ids are `q-<short-topic>`; check that the
  id exists nowhere under `eval/qa/corpus/` or in `eval/qa/lifecycle-registry.json`.
- `.agents/rounds/2026-11-14-golden-coverage-audit/gap/<lane>.json`:

```json
{
  "lane": "gap-1",
  "slots": [
    {
      "leaf": "network.validators",
      "facet": "...",
      "result": "proposed | covered-by | no-golden",
      "caseId": "q-...",
      "coveredBy": null,
      "ravenReach": "answerable | reachable-not-surfaced | unreachable",
      "ravenEvidence": "What was called and what came back.",
      "owner": "For unreachable: the canonical owner and where the fact should live.",
      "note": null
    }
  ]
}
```

These are the only files you write. Done when every slot has a result and both outputs parse.
