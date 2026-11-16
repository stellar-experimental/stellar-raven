# Trace brief: why did this row's verdict change between two runs of a Stellar question-answering evaluation?

You are given one packet per row. Each holds the question, tags, the golden answer, then two runs of the same agent on the same question: the
control (P0) and the run after two product changes. Each run section has the verdict (with the judge's missing facts, wrong claims and
rationale), the final answer, and every tool call with its full result as the agent saw it. Read everything in the packet; open nothing else;
change no repository file; run no model-calling command.

The two product changes between P0 and the later run:
1. **Guard.** Results that carry a `--- CANDIDATE EVIDENCE ---` block now end that block with a sentence beginning "Audit, incident,
   governance and standards-authorship claims are fact only when ..." (and the same sentence appears as its own line after a result that
   used a Scout or Lumenloop operation without that block). It tells the agent not to state such claims as fact unless an official family or a
   primary record a result returned states them.
2. **Map removal.** The server instructions the agent sees at the start no longer include a "Source Micro-Map" section (a description of each
   service family and three "Authority Rules": use the family that can ground the claim; treat Scout research and Lumenloop content as community-aggregated for governance, standards-authorship, incident and audit claims; official docs are authority for protocol claims, Scout/Lumenloop first for ecosystem facts). The rest of the instructions are unchanged.

For each row answer, in this order:
- **Move**: P0 verdict to the later verdict, and which judge tier each had (a tier change, single judge versus a three-judge panel, can alone move a borderline answer).
- **What changed in the answer**: the facts the two final answers state differently, quoted briefly, and which of them the judge's missing facts or wrong claims name.
- **Where each fact comes from**: for each such fact, the call and result in the packet that holds it, or "in no result".
- **Differences in calls**: which operations each run called and in what order, and whether a call one run made was not made by the other.
- **Cause**, one of:
  - `guard`: the guard sentence appears in a result in the later run and the change in the answer is a hedge, attribution or withheld claim that follows its wording (quote the sentence and the answer wording);
  - `map`: the later agent's routing, family choice or authority handling differs in a way that the removed map text addressed, and that difference produced the fact gained or lost (name the call);
  - `displacement`: a call one of the two changes caused took the place of the call that held the fact (name both calls);
  - `retrieval variance`: the runs took different retrieval paths for no reason you can tie to either change (different query wording, a page read in one and not the other);
  - `judge`: the answers are materially the same and the verdicts differ by tier or by grading strictness;
  - `unclear`.
  Mark the cause **traced** only when the transcript shows the mechanism (the fact is in, or missing from, a result the mechanism produced; or the wording follows the guard sentence). Otherwise mark it **untraced**. Do not guess.
- **Over-hedge**: in the later run, does the answer hedge, attribute only, or call unverified a claim that a returned official-family or primary-record text states plainly? Quote it, or write none.

Output: one Markdown file at the path your task names, one `## <row id>` section per row with the fields above, then a final table
`| row | move | cause | traced? | over-hedge |`. Report back only the file path.
