# Multi-tool plan evaluation

Offline grader that re-scores stored QA `transcript` tool calls on three axes: **set coverage** against `coverage-rules.json`, **broad→detail progression** per touched service, and **correlation** against stored judge verdicts.

**Anti-overfitting rule:** derive every acceptable set from documented service coverage (`research/services/lumenloop.md`, `research/services/stellar-light.md`, `docs/stellar-docs.md`, `catalog/manifest.json`), never from past agent behavior. Cite the coverage source in each rule's `why`.

## Run

```bash
npm run eval:plan -- eval/qa/results/<stamp>.json
node eval/plan/grade-plan.mjs <file> --rules eval/plan/coverage-rules.json
```

Writes `<stem>.plan.json` (replacing trailing `.json`, e.g., `run.json` → `run.plan.json`) next to the input and prints a summary table (no live server).

## Rule schema (`coverage-rules.json`)

Ordered rules, **first match wins**, ending with a catch-all; `overrides` (by case ID, with coverage `comment`) beat all rules.

```jsonc
{
  "overrides": { "<case-id>": { "comment": "why", /* plan fields */ } },
  "rules": [{
    "id": "scf-grants-builders",
    "why": "cite the coverage doc",
    "match": {
      "category": "scf-grants-builders",  // tags.category — string or array (AND across fields)
      "service": ["scout", "lumenloop"],  // tags.service  — string or array
      "question": "openzeppelin"          // case-insensitive regex
    },
    "plan": {
      "required": [],
      "anyOf": ["scout", "lumenloop"],
      "acceptable": ["scout", "lumenloop", "skills"],  // superset of required ∪ anyOf
      "progressionExpected": true
    }
  }]
}
```

`skills` counts as a service. Per-row grades: `requiredCovered` (all `required` and, if non-empty, ≥1 `anyOf`), `onPlanRatio` (`|touched ∩ acceptable| / |touched|`, or `null`), `offPlanServices` (informational), and `progression` / `progressionUsed` (broad op before detail op in transcript order; aggregated only when `progressionExpected`).

## Op extraction and classes

Extracts direct calls via `\b(lumenloop|scout|stellarDocs|stellarOrg)\.(\w+)\s*\(`, recognizes `codemode.skill.read`/`run` (and aliases) as `skills`, expands known `skill.run` IDs through declared runner operations (`via: <skillId>`, not proof of host execution), and extracts direct `mcp__<server>__<service>_<operation>` tools. Top-level MCP `search` and `codemode.search`/`catalog`/`spec`/`describe` are `meta-discovery` (outside touched services; MCP `search`, `codemode.search`, and `codemode.catalog` satisfy the broad step before a skill call).

Rebuild generated `op-classes.json` with `node eval/plan/build-op-classes.mjs` after catalog changes (never hand-edit). Operations class as `broad` (`search_`/`list_`/`find_` + plural `get*` overrides), `detail` (`get_`/`read_`/`explain`/`compare`), or `meta` (default, warning on unmatched ops).

## Limitations and decision rule

- Regex extraction misses dynamic dispatch (lower bound) and truncated 600-char execute inputs (`truncatedInputs`/`truncatedRows`).
- Sets are category-granular, so `offPlanServices` is informational; `anyOf`/`required` grade presence only (calling `scout.getStatus` touches `scout`, though `meta` ops never satisfy progression); progression checks order only, not data flow.
- Progression stays informational ([dated decision](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/eval/plan/README.md#results--2026-07-03-post-nudge-checkpoint-same-30-cases-variant-a)); reopen its weighting only when a transcript proves a wrong answer came from missing detail retrieval.
