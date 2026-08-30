# Golden metadata remainder — research worker rules (2026-08-30)

Repository (read-only for you except the scratch pack): /Users/kalepail/.herdr/worktrees/stellar-raven-codemode/next-golden-metadata-remainder
Skill to follow: .agents/skills/golden-truth/SKILL.md (read it once; source classes A–F and the corroboration bar are defined there).
Scratch pack: /private/tmp/claude-501/-Users-kalepail--herdr-worktrees-stellar-raven-codemode-next-golden-metadata-remainder/c806e38b-aaef-430e-bcdb-657f684db97c/scratchpad/gmr/pack

## What you do

You are a RESEARCH worker. You re-verify every `golden.keyFacts` entry of each assigned case live and
write an evidence matrix. You do NOT edit any repository file. The orchestrator owns every case edit.

## Hard limits

- Never edit, create, or delete a file inside the repository. Write only inside the scratch pack.
- Do not run git. Do not run npm scripts. You may run `node eval/qa/lint-corpus.mjs` read-only if useful.
- Do not run paid Lumenloop research. Never print secrets.
- Use live sources: class A official docs (curl/fetch), class B source repos, class C live service APIs
  (stellarlight.xyz, horizon.stellar.org, etc.), class F running a free command. The aggregator that made
  a claim never corroborates itself.
- Never stretch weak evidence. `unverifiable` and `CONFLICT` are honest, useful results.

## Per case procedure

1. Read `eval/qa/corpus/battery/<category>/<id>.json`. List every atomic claim in `golden.keyFacts`
   (and, when a keyFact is a behavior rule, the concrete fact in `golden.answer` that it depends on).
2. For each keyFact, do ONE dated live re-check against a primary source (class A, B, C, or F). Prefer the
   URLs already in `truth.sources[]`. Record the URL and what the page/source/response confirms.
   Numeric, version, date, or amount claims need two independent classes, one of them A or B.
3. If a live source contradicts a claim, record `CONFLICT: <claim> vs <url> — <observed text>`. Do not
   invent a fix. If every URL for a fact is unreachable, record `UNREACHED: <url>`.
4. Sibling sweep: `grep -rl "<entity or number>" eval/qa/corpus/battery`, read the hits, record
   `Sibling sweep 2026-08-30: grep <terms> → <ids>; no contradiction` (or the contradiction).
5. Write the machine-readable matrix JSON (format below) to `<pack>/matrices/<lane>/<id>.json`, then
   APPEND the human matrix (format below) to `<pack>/matrices/matrices-<lane>.md`.

## Matrix JSON (`<pack>/matrices/<lane>/<id>.json`)

```json
{
  "id": "<case id>",
  "lane": "<a|b|c|d>",
  "verifiedOn": "2026-08-30",
  "result": "DONE | CONFLICT | UNREACHED",
  "claims": [
    {
      "keyFactIndex": 0,
      "claim": "<keyFact text verbatim>",
      "verdict": "confirmed | confirmed-as-of | disputed | contradicted | unverifiable",
      "sources": [
        {"class": "A", "ref": "<url or repo path>", "quote": "<exact text or observed value>", "asOf": "2026-08-30"}
      ],
      "notes": "<nuance, or empty>"
    }
  ],
  "evidenceLines": [
    "Live re-check 2026-08-30: <url> — <what it confirms>"
  ],
  "siblingSweep": "Sibling sweep 2026-08-30: grep <terms> → <ids>; no contradiction",
  "conflicts": ["CONFLICT: ... "],
  "unreached": ["UNREACHED: ..."],
  "overallNotes": "<anything the orchestrator must know>"
}
```

`evidenceLines` must contain exactly one `Live re-check 2026-08-30: …` line per keyFact (index order),
each ≤ 240 characters, each naming one URL. Do not put the words corpus, reviewer, golden, or catalog
into an evidence line. `result` is `DONE` only when every keyFact verdict is `confirmed` or
`confirmed-as-of`.

## Human matrix (append to `<pack>/matrices/matrices-<lane>.md`)

```
## <case id> — <lane> — 2026-08-30
- keyFacts[i]: "<text>" → <verdict> — <class>: <url> — "<quote>" (as of 2026-08-30)   [one per fact]
- Sibling sweep 2026-08-30: grep <terms> → <ids>; <verdict>
- Conflicts: none | CONFLICT: …
- Result: DONE | CONFLICT | UNREACHED
```

## Report

When a batch is complete, write `<pack>/reports/<lane>-<batch>.md` with one line per case
(`id — DONE|CONFLICT|UNREACHED — <one line>`) and reply with ONLY that file path.
