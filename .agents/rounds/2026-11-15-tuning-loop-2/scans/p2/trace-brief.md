# Trace brief (P2): why did, or did not, this row change between two runs of a Stellar question-answering evaluation?

You are given one packet per row: the question, tags, the golden answer, then two runs of the same agent on the same question: the earlier run (P1)
and the later run (P2). Each run section has the verdict (judge tier, missing facts, wrong claims, rationale), the final answer, and every tool call with
its full result as the agent saw it. (The `search` tool's results are not stored; only its input is.) Read everything; open nothing else; change no repository
file; run no model-calling command.

What differs in the later run (P2) from P1:
1. **Source.** A new source `stellarOrg` (operations `stellarOrg.search_site`, a site search of stellar.org, and `stellarOrg.get_page`, a page read) is in the
   catalog. Operation cards for it can appear on a `search` page, and `stellarOrg` is named in the `search` description and the `execute` globals. Results of a
   `stellarOrg` call carry the guard sentence as a standalone line.
2. **Description openings.** The first sentences of the `search` and `execute` tool descriptions were reworded (the namespace list that repeated the family line was
   removed, so each opens with a short whole sentence).
3. **Seven cards.** `search` called without `limit` now returns 7 cards, not 5.
The guard and the removed map are in BOTH runs and are not what changed.

For each row answer, in this order:
- **Move**: P1 to P2 verdict and judge tier on each side.
- **stellarOrg**: did the P2 agent call a `stellarOrg` operation (name it, its arguments, what it returned: ok or error, hit count, paths, page length)? Did the answer use anything it returned (quote)? Did the P1 agent get the same fact another way? If the P2 agent made a `stellarOrg` call on a question whose golden cites no stellar.org page, say INTRUSION and name what call, if any, it took the place of.
- **What changed in the answer**: the facts the two final answers state differently, and which of them the judge's missing facts or wrong claims name; where each comes from (the call and result, or "in no result").
- **Differences in calls**: operations called, in order, and any call one run made and the other did not (including a `search` made with and without `limit`).
- **Cause**, one of:
  - `source`: a fact gained or lost in a `stellarOrg` result, or a `stellarOrg` call that took the place of a call that held a fact (name both) - traced only if the transcript shows it;
  - `search-page`: the agent's script differs because the `search` page differs (a `stellarOrg` card, or two more cards from the default of 7) in a way the `search` input and the later calls show;
  - `delivery-text`: you can point to the description opening as the reason (rare; say why);
  - `retrieval variance`: different retrieval path with no tie to the three changes (different query wording, a page read in one and not the other);
  - `judge`: the answers are materially the same and the verdicts differ by tier or strictness;
  - `unclear`.
  Mark **traced** only when the transcript shows the mechanism. Otherwise **untraced**. Do not guess.
- **Over-hedge**: does the P2 answer hedge, attribute only, or call unverified a claim that a returned primary record or official family text states plainly? Quote it, or write none. For a claim resting on a `stellarOrg` result, say whether the answer states SDF programme facts (terms, eligibility, amounts, process) plainly or hedges them as SDF's own statement, and whether that follows the guard line.

Output: one `## <row id>` section per row with the fields above, then a final table `| row | move | stellarOrg called | cause | traced? | over-hedge |`.
Report back only the output file path.
