# Common rules for every lane in this round

Round ledger: `.agents/rounds/2026-11-14-golden-coverage-audit.md`. Read its Scope first.

## Purpose

Raven informs AI agents with Stellar truth. The QA battery (`eval/qa/corpus/battery/`) measures
that. The owner wants a battery that covers the whole surface of Stellar by category, with as few
cases and as little judge-facing prose as possible, so that a run is cheap and its score means
"Raven answers correctly across the ecosystem". Bloat is a defect: a case, key fact, or note that
adds no measurement value should go.

## Rules

- Write only the files your brief names. Edit no case file, no code, and nothing under `eval/`
  unless your brief says so. Do not commit, push, or open a pull request.
- Start no sub-agents and no other terminals unless your brief says so.
- `eval/corpus/` is read-only prior art and never a source of truth.
- Post nothing outside this repository: no issues, comments, or messages.
- Paid Lumenloop research stays off. Use free read operations only.
- Never print or write a credential.

## Sources

Independence is between classes; two hits from one class are one witness
(`.agents/skills/golden-truth/SKILL.md`, sections 1 to 3, is the evidence bar).

| Class | Source | How |
|---|---|---|
| A | Official docs and sites | `parallel-cli extract <url>`; `parallel-cli search "<objective>" --include-domains developers.stellar.org,stellar.org` |
| B | Source code and repositories | `gh api`, `gh search code`, the `github` and `deepwiki` MCP tools |
| C | Live services | The `claude.ai Stellar Raven` MCP tools (`search`, then one `execute`): Lumenloop, Scout, Stellar Docs, skills |
| D | General web | `parallel-cli search` (use it freely); the `perplexity` MCP tools as a second engine |
| E | Stellar Docs index | `stellarDocs.search_docs` through Raven |

- Use `parallel-cli search` and `extract` by default. Use `parallel-cli research` only when two
  searches could not settle a topic.
- Raven is both a source (class C) and the system under test. When you check whether Raven can
  answer something, record what it returned; never treat its answer as proof of a fact.
- Record every source as `{class, ref, observedAt, quote}` with an exact URL or path and a quote of
  160 characters or fewer that a stranger can re-walk.

## Limits

If a tool or the model reports a rate or usage limit: halve your pace and retry with backoff. If
the limit still holds after 20 minutes, save your output file as it stands, add a top-level
`"stopped": "LIMIT: <what and when>"` field, report, and stop. Never continue on weaker sources and
never fill a gap from memory. An unverified item is recorded as unverified.

## Output and report

- Write your output file early and update it after every batch, so that nothing is lost.
- Output is valid JSON unless your brief says Markdown. Check it with
  `node -e 'JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"))' <file>`.
- When done or stuck, send one line with the path of your output file to the address in your
  launch line. Send nothing else.

## Errors the first verifier found (avoid them; verifiers, look for them)

- A rewrite moved a volatile claim's as-of date to today although the rot check did not re-read
  it. Keep the last verified date unless you hold evidence observed today.
- A `live` case's dated example figure was moved into key facts. A `live` or `scheduled` key fact
  must accept a later dated figure.
- Ordinary drift of a dated value, or a stale secondary page, was recorded as `changed`. Record
  drift as `holds` with the date, and check a legal-entity or status change against the primary
  record.
- A label or document was called wrong because a preamble did not mention it. Check the registry
  index.
- A rewrite turned an observation into a mechanism claim that the golden did not make.
- A compacted key fact kept ambiguous wording, or demanded coverage that its own answer lacks.
- A merge named a survivor that does not test the same knowledge, or one outside the battery
  without saying so.
- A directory question ("who is building X") was labelled `raven-mechanics`. Look for the world
  question under it first.
- Write avoid items in the corpus form: "Do NOT ...".
