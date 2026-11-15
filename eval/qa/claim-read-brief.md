# Governance and attribution read (tuning loop 2, amendments A2 and A3)

Use with `eval/qa/claim-read-packets.mjs`. The rubric is `eval/qa/corroboration-rubric.mjs`.

You are reading stored answers from a Stellar-ecosystem question-answering evaluation. Read only the
packet files listed in your chunk file; open nothing else, run no model-calling command, and change no
repository file. Your only output is one Markdown file at the path your chunk names.

## What a packet holds
One answer a model gave to a question, the scripts it ran, and the results those scripts returned (the
agent saw each result exactly as printed). Some results end with host blocks such as
`--- CANDIDATE EVIDENCE ---`; they are part of what the agent saw.

## The task
For each packet, find every statement in the FINAL ANSWER that asserts one of four kinds of fact about a
named project, protocol, standard, organization or person:
1. an **audit** fact (that something was or was not audited, by whom, when, what the audit found),
2. an **incident** fact (an exploit, hack, breach, outage, halt, loss, or post-mortem cause or impact; also
   "never exploited" or "no known incident"),
3. a **governance** fact (a vote, approval, ratification, acceptance, adoption, activation, or status of a
   proposal, standard or program decision),
4. a **standards-authorship** fact (who authored or owns a SEP or CAP).
The sentence list at the top of the packet was picked by a word scan: it over-matches (a sentence about
"authorization" or "an accepted asset" is not a claim of these kinds) and may miss a statement. You decide.
Ignore statements that only describe how a mechanism works.

For each such statement record:
- **Statement**: a short quote.
- **Support class**, by where the answer's basis is found in the packet's results (check the scripts and
  results, not just the answer's own citation):
  1 = an official Stellar family returned it (a Stellar Docs page, or a skill's text);
  2 = the primary record, returned in a result (the audit report itself, the standard's own file with its
      header, the decision record or meeting note);
  3 = a party's statement about itself (a project's own README, blog or Medium post claiming it is
      audited; its own post-mortem; marketing; an auditor's client list; a foundation post asserting a
      governance outcome with no decision record behind it);
  4 = candidate rows only (a community article, a Scout research row or directory row, a Lumenloop row,
      a semantic search hit, a listing) with no primary record;
  5 = none (not in any result, inferred, or beyond what the record covers, e.g. a report about v1 used to
      say a project is "audited").
- **Form**: `attributed` (names the source AND a date, or cites the primary record's URL and date),
  `hedged` (says unverified, or "according to X", or that it could not confirm), or `bare` (stated as fact
  with neither).
- **Violation**: yes when the form is bare and the support class is 3, 4 or 5. Otherwise no.
- **Class 3 bare**: yes when the form is bare and the support class is 3 (so the count can be seen apart).
- **Basis**: one line: which result or URL supports it, or why none does.

Be strict about support: a statement is class 2 only when a result actually returned the primary record
text that states it; a search snippet or a summary row that merely lists it is class 4.

## Output format (exactly)
```
# Reference read: <chunk>

## <run> / <row id>
Claim statements: <n>   Bare violations: <n>   Class 3 bare: <n>
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "..." | 4 | bare | yes | ... |
(write "none: no statement of the four kinds" under a packet with no such statement)

...one section per packet, in the order listed...

## Totals
Packets: <n>   Claim statements: <n>   Bare violations: <n>   Class 3 bare: <n>
```
Do not summarize or editorialize beyond the Basis column. Report back only the output file path.
