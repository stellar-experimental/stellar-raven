CHANGES-NEEDED

Reviewed `git diff 704d84ae 4a5d17a1` and the resulting files at `4a5d17a12441a572e74c8a451e0b695baeae26de`.
I made no paid call, started no server, changed no plan, and pushed nothing.
The review used the run-evals launch rules.

## Findings

### 1. P2 — The parser accepts a prefix and silently drops later calls

Evidence: `.agents/rounds/2026-10-12-call-pattern-triage/count-patterns.mjs:40`.

`parseExpressionAt` reads one expression, but the counter never checks whether that expression consumes the script.
This valid script demonstrates the error:

```js
await stellarDocs.search_docs({query:"x"});
await stellarDocs.search_docs({});
```

The counter reports one docs call, zero omissions, zero unknowns, and zero unparsed scripts.
The script contains two calls and one omission.
The fallback parser never runs because the first expression parses successfully.
This can corrupt the clip plan's primary metric without requesting manual reconciliation.

Fix: parse the entire script, or require complete input consumption before accepting an expression parse.
Preserve support for anonymous function expressions and allow trailing comments or semicolons.
Add a fixture with two top-level calls, including an omission in the second call.

Reproduction: `tmp/rp2-evidence/fixtures.json`, row `prefix-docs-only`.
Run the counter with `--rows` on that file.

### 2. P2 — Aliased section reads can still disappear from the inspection list

Evidence: `.agents/rounds/2026-10-12-call-pattern-triage/count-patterns.mjs:35` and `:138`.
The section plan selects scripts for inspection at `plan-section-guard.md:190` in the same directory.

Both fixtures contain a section read:

```js
async () => {
  const read = codemode.skill["read"];
  return read("skills.x", {sections:["a"]});
}
```

```js
async () => {
  await codemode.skill.read("skills.x");
  const read = codemode.skill.read;
  return read("skills.x", {sections:["a"]});
}
```

Both produce zero section-read scripts, zero unknown skill-read scripts, and zero unparsed scripts.
The first bypasses the text matcher through bracket notation.
The second suppresses the unknown fallback because a direct whole-skill read already exists.
Thus, the new unknown-inspection rule still misses scripts and can assign incorrect exposure.

Fix: track unresolved skill-read references through the syntax tree, including bracket notation.
Record unknown references even when the same script contains a resolved read.
Alternatively, require both readers to inspect every execute script before calculating S.

Reproduction: `tmp/rp2-evidence/fixtures.json`, rows `alias-bracket` and `mixed-alias`.

### 3. P2 — The confirmation schedule depends on the verdict it must establish

Evidence: `.agents/rounds/2026-10-12-call-pattern-triage/plan-section-text.md:35` and `:121`.
Also: `plan-section-guard.md:246`, `:338`, and `:348` in the same directory.

The text verdict must be confirmed before selecting the guard comparison.
However, the plan combines text and guard confirmation lists in one A1 or T1 command.
The selected guard comparison determines which artifact receives the combined list and the $4 allocation.

For example, all text mechanism checks pass, but the first grades show one consistent text regression.
Confirmation can retain that regression, selecting A/G, or clear it, selecting T/TG.
The operator cannot select the final shared list before that confirmation finishes.
Running text confirmation first can require another baseline command when the guard list contains different IDs.
The budget describes only three confirmation commands and one retry per artifact.
It does not allocate or describe that additional command.

Fix: declare an executable sequence that handles both text outcomes within explicit allocations.
One option confirms text first, then separately confirms the selected guard comparison.
Another option predeclares unions for both possible comparisons before either verdict.
State how shared confirmation results, command caps, and retries work under the chosen sequence.
Recalculate the budget if the sequence adds commands.

### 4. P2 — Agent-limit regressions have no applicable confirmation rule

Evidence: `.agents/rounds/2026-10-12-call-pattern-triage/plan-section-guard.md:204`, `:247`, and `:250`.
The text plan inherits these rules at `plan-section-text.md:124`.
The re-judge implementation skips unsuccessful answers at `eval/qa/re-judge.mjs:779`.

The new grade rule correctly maps `agent-limit` to zero.
Consider two baseline grades of `correct` and two candidate outcomes of `agent-limit`.
This produces a consistent regression that requires confirmation.
However, `re-judge.mjs` returns `skipped.reason: "unsuccessful-answer"` for the candidate.
It does not produce a confirmation grade or a T4/T5 judge failure.
The retry rule covers only T4/T5 failures.
The ordinary confirmation rule can instead classify a difference that fails confirmation as judge variance.
Therefore, the plan does not determine whether this system failure remains a blocking regression.

Fix: retain the zero grade for agent-limit outcomes during confirmation.
Confirm only the gradeable side and explicitly preserve the system-failure regression.
Do not classify a skipped unsuccessful answer as judge variance or authorize an answering retry.

I reproduced the skip through `rejudgeRows` with a judge callback that throws if called.
No judge call occurred.
Evidence: `tmp/rp2-evidence/grade-check.json`.

## Reconciliation of the eight RP findings

| RP finding | Result |
| --- | --- |
| 1: Combined change unmeasured | The four-arm design fixes the missing comparison. Finding 3 identifies a new confirmation dependency. |
| 2: Missing grades permit PASS | The coverage rule fixes the judge-error gap. Finding 4 identifies an unresolved agent-limit confirmation case. |
| 3: Text exposure excludes rows | Fixed. All 16 rows enter the text regression check. |
| 4: Zero section denominator | Fixed. T requires positive S and at least half of A's S. Otherwise, the rate claim is INDETERMINATE. |
| 5: Counter misclassification | The three original fixtures pass. Findings 1 and 2 prevent full closure. |
| 6: Mixed cost contracts | Fixed. The listed primary and supplementary groups reproduce separately. |
| 7: Playground environment assertion | Fixed. Each paid template has the assertion. Matching and changed environments produce exits 0 and 1. |
| 8: Helper absent from runner | Fixed. The external pinned copy passes its self-check from the A checkout with acorn 8.18.0. |

The original error-verdict reproduction still returns `aggregatesAllowed: true` for 16 rows with one judge error.
However, `rowOutcomeClass` identifies that row as `judge-error`.
The new coverage rule requires a valid retry grade or INDETERMINATE.
Thus, aggregate acceptance alone no longer permits PASS.

## Verified design and costs

I reconstructed the trees with `git merge-tree --write-tree --merge-base=<picked-commit-parent>`.
Temporary Git objects stayed under `tmp/rp2-evidence/objects`; no branch changed.

| Arm | Reconstructed tree |
| --- | --- |
| A | `ab4c63e3de9e85b479dea657169d2ff5a8ed9387` |
| T | `e74d9afdc4604975df233286b9d2fe77944b9e05` |
| G | `28a6411854bc93fca8e6a1b1c290028b31ed9cda` |
| TG, text first | `8d32d670a14c2428cbcd2fe70e33bc39ecdf2fc7` |
| TG, guard first | `8d32d670a14c2428cbcd2fe70e33bc39ecdf2fc7` |

All tree pins match.
The sequence A1, T1, G1, TG1, TG2, G2, T2, A2 gives every arm mean position 4.5.
The declared guard comparison correctly uses T/TG after text PASS and A/G otherwise.
Findings 3 and 4 prevent complete verdict decisions under the current confirmation rules.

The stated allocations add correctly:

- Clip: `1 + 4×3 + 3 + 2 + 2 + 2 = $22`.
- Shared sections: `8×12 + 10 + 6 + 8 + 12 = $132`.
- One section change: `4×12 + 6 + 4 + 4 + 12 = $74`.

All nine paid command templates contain exactly one `--max-budget-usd`.
Replacement and declared retry allocations are separate and bounded.
Finding 3 concerns the confirmation sequence, not this arithmetic.

The P1/P2 primary estimate reproduces as $6.0023247 from medians and $9.8798126 from maxima.
The P1 judge sample contains 136 costs, with median $0.0887084 and maximum $0.4132244.
Nine selected rows lack P1 judge history.
The supplementary estimate reproduces as $6.386139 and $9.1185678, with five rows lacking judge history.
The primary group uses rubric v2.11; the supplementary group adds v2.10.
Evidence: `tmp/rp2-evidence/costs.json`.

## Counter verification

The built-in self-check passes all 14 fixtures.
The three original RP fixtures now correctly identify the quoted key, missing top-level key, and quoted section key.

Across the eight stored MCP artifacts, I reproduced:

- 1,887 parsed docs calls and zero detected omissions.
- Four additional docs calls in the one unparsed script, giving the recorded total of 1,891.
- 199 section-read scripts and zero flagged unknown skill-read scripts.
- Seven unresolved docs references, all property-existence checks rather than additional calls.

I inspected the unparsed script and all seven references directly.
The four calls contain their required fields.
Across the four Playground artifacts, I reproduced 28 docs calls, six omissions, and six invalid-argument entries.
These historical matches do not resolve the new counter fixtures.

Evidence files are under `tmp/rp2-evidence/`.
Re-review the corrected counter and confirmation rules before launch.
