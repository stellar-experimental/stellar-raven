---
id: sd-046
service: stellar-docs
status: verified
discovered: 2026-08-25
upstreamTitle: The Protocol 24 state-archival incident has no retrievable record in the docs corpus
evidence:
  - 2026-08-25 live, question from eval case q-protocol-24-whisk-incident run against four lanes
  - stellarDocs.search_docs returned 10 hits carrying none of the required incident facts
  - stellarDocs.search_meeting_notes returned 6 hits carrying none of them
  - scout.searchResearch returned 478, Hot Archive, and CAP-0076 from the CAP corpus
  - lumenloop.search_content_semantic over articles carried none of them
  - successor to sd-001, opened by the independent resolution recheck of that finding
---

## Finding

The Stellar Docs corpus holds no retrievable account of the Protocol 24 state-archival incident.
The facts exist, but only in the CAP corpus, reachable through Scout research rather than through
any Stellar Docs lane.

This is a distinct defect from `sd-001`. That one was a crawler fault: a page existed and was
dropped from the index. This one is a content gap: the incident is documented as a protocol
change proposal, and nowhere in the docs a reader would search.

## Evidence

On 2026-08-25 the question from eval case `q-protocol-24-whisk-incident` — "Why did Stellar ship
Protocol 24 so soon after Protocol 23, and what was the state-archival bug?" — ran against four
lanes. The case's golden requires the latest-TTL-versus-stale-entry-version eviction defect, the
counts 478 / 84 / 77 / 394, `CAP-0076`, Hot Archive, and the 31,879,035-stroop fee-pool
remediation.

| lane | hits | required facts present |
|---|---|---|
| `stellarDocs.search_docs` | 10 | none |
| `stellarDocs.search_meeting_notes` | 6 | none |
| `scout.searchResearch` | 6 | `478`, `Hot Archive`, `CAP-0076` |
| `lumenloop.search_content_semantic` (articles) | 6 | none |

Only the CAP corpus carries them. A reader who asks the docs why Protocol 24 followed Protocol 23
so quickly cannot find out from the docs.

`/docs/networks/software-versions` now indexes correctly after the `sd-001` fix and answers
"what is in Protocol 24". It does not answer "what went wrong", and it is not the place for it.

## Recommendation

Publish the incident where a reader looks for it: a state-archival incident note, or a Protocol 24
section that states why the upgrade happened and links `CAP-0076`. The material already exists in
the CAP; the gap is that nothing in the docs points at it.

The docs already carry state-archival concept pages under
`/docs/learn/fundamentals/contract-development/storage/state-archival`. A short "known incidents"
subsection there, linking the CAP, would close this without new research.

## Note on sd-001

The `sd-001` fix moved `/meetings/2025/10/16` out of the general docs lane's top 20 for the
phrasing `Protocol 24 Whisk state archival`; the meetings lane still ranks it first. That meeting
does not carry the required counts either, so the displacement is not the cause of this gap. It
does mean the `sd-001` change did not help this question, and may have made the general lane
slightly less useful for it.
