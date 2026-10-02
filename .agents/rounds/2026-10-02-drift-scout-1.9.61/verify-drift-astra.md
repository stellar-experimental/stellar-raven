not safe

I verified `35882740bad35397b81211318f96b067294bafc7` against `origin/main` at `38aa07fc8a4b05c5fa271d0227d2e80c2fdc650d`.
Findings 1, 4, and 5 are resolved.
The three title-driven cases in Finding 2 are resolved.
I accept the fourth discovery probe as a tracked follow-up, for the reasons below.
Finding 3 remains an unresolved contract defect and prevents my merge approval.

**Disposition of the five findings**

| Finding | Verdict | Verification |
| --- | --- | --- |
| 1: lowered routing baseline | Resolved | The title snapshot equals the base. Every threshold and accepted total equals the base. |
| 2: three title-driven discovery losses | Resolved | All three probes recover their base hit order and scores. |
| 2: expanded MCP discovery query | Accepted follow-up | The loss remains. Further analysis identifies an incidental prefix match as the cause of the old score. |
| 3: unsupported advertised comma alias | Unresolved; blocks approval | The generated description still promises an input that `validateArgs` rejects. |
| 4: incorrect `sls-089` recheck | Resolved in the finding | The record now distinguishes response descriptions from schemas and disclaims a fresh runtime reproduction. |
| 5: stale `sk-027` count | Resolved | The finding dates both counts. The regenerated index matches its source. |

1. **[P2] A TODO does not resolve the new parameter-contract contradiction.**

   Evidence: `catalog/manifest.json:19051`, `catalog/manifest.json:19073`, `specs/super-spec.json:4248`, and `.agents/TODO.md:27`.
   I repeated validation against the new manifest:

   ```js
   { q: "base reserve", source: "cap,sep", perSource: 2 }
   // Rejected at source: "must be one of: ..."

   { q: "base reserve", sources: ["cap", "sep"], perSource: 2 }
   // Accepted: [] validation issues.
   ```

   The shipped description still says a comma in `source` works like `sources`.
   The validation error lists individual source values; it does not direct callers to the supported array form.
   This is a deterministic contradiction in the model-visible contract.

   The ledger records two failed note experiments at `.agents/rounds/2026-10-02-drift-scout-1.9.61.md:120`.
   It says each experiment moved 12 graded rows.
   Those results justify withdrawing those two implementations.
   They do not establish that the contradictory contract is acceptable.
   The committed ledger does not contain the exact trial wordings or their complete result files.
   I therefore verified the recorded claim, not the measurements themselves.

   Expected fix: make the served description and validator agree before merging this contract change.
   A correction must preserve routing evidence and must not weaken validation globally.
   Possible approaches include contract-only rendering guidance or explicit, validated support for the alias.
   Keep the TODO for broader work, but do not mark this defect resolved by its existence.

**The fourth discovery probe can remain a follow-up**

Yes. I accept deferral of this specific probe for the source refresh.
This acceptance follows additional causal checks; the green gate alone does not justify it.

The query is:

```text
Are there any model context protocol skills for Stellar?
```

The base places `scout.listSkills` at rank 3, with score 195.
The candidate omits it from the first five results and places `scout.getSkill` at rank 5.
The directory operation also remains absent with limits 10 and 20.
This is a real discovery limitation, not a paging fix.

However, the old admission depends on matching `any` to the article `an` in the old description.
The vendor scorer permits that prefix match at `src/catalog/vendor/search-scoring.ts:85`.
It then applies a 60% token-coverage requirement at `src/catalog/vendor/search-scoring.ts:129`.

The base matches six of nine query tokens, including `any` through `an`.
The new description removes that article and matches five of nine tokens.
Neither description matches the three content tokens `model`, `context`, and `protocol` directly.
The shorter, stopword-filtered query fails the coverage requirement in both versions.

Two in-memory experiments isolate the cause:

- Removing only `an` from the base phrase `an install` reproduces the candidate's missing result.
- Adding only `an` to the candidate description restores rank 3 and score 195.

These are diagnostic experiments, not proposed fixes.
The issue is not a general penalty for description length.
The expanded MCP wording needs a general matching repair, independent of this source refresh.
Preserving an incidental article match would not establish correct MCP understanding.

The direct MCP query, `Are there any MCP skills for Stellar?`, retains `scout.listSkills` at rank 3.
`What Stellar AI skills can I install?` and `List Stellar skills` retain their complete base results.
The community-registry query retains rank 1 and raises the directory score from 391 to 401.

The existing TODO at `.agents/TODO.md:148` provides a suitable follow-up location.
Add this measured cause to that record and replace its description-length hypothesis.
Keep the original failing probe and measure a general repair without query-specific exceptions.
My acceptance of this follow-up does not accept the separate parameter-contract contradiction.

**Repeated classification and gates**

I reran all three inventory diff modes against the requested base:

| Mode | Exit | Result |
| --- | --- | --- |
| `surface` | 0 | Equal path/method sets and operation IDs. |
| `text` | 1 | Only the `listSkills` and `getSkill` descriptions change. |
| `deep` | 1 | Complete paths and components differ. |

The eight changed operations remain:
`listAudits`, `getChangelog`, `getChanges`, `searchResearch`, `getRfps`, `listSkills`, `getSkill`, and `getStablecoins`.
The four changed components remain `Meta`, `Skill`, `RequestError`, and `RetryableError`.
No summary or `x-routing` change appears.
There is no new callable operation.

I reran `npm run eval:compile`, `npm run eval:routing -- --gate`, and `npm run eval:selftest`.
All pass.
I compared the complete 544-record result set with the base result set.
Ten records change a hit or score; no graded result changes.

| Lane | Base and candidate |
| --- | --- |
| Legacy top-1 / top-3 / top-5 | 219 / 298 / 326 |
| Legacy card hits | 112 / 182 |
| Skills top-1 / top-3 / top-5 | 17 / 23 / 23 |
| Holdout top-1 / top-3 / top-5 | 12 / 26 / 29 |
| Holdout forbidden captures / passed | 10 / 24 |
| Extended top-1 / top-3 / top-5 | 93 / 111 / 117 |

Only these gate fields differ from the base:

- `baselinedAt`
- `evidence.inputs[0].sha256`
- `evidence.localTrace`
- `note`

The manifest fingerprint is `15a4fe9fe4c5f741a26a39e7d4037575a05f753e70865ca01dd08abdf2e6ccba`.
Every accepted total and threshold remains unchanged.
The held title snapshot is byte-identical to `origin/main`.

**Repeated discovery probes**

I repeated the original 80-query probe set and the 285-query expanded probe set.
The expanded set now contains only the fourth discovery loss discussed above.

| Probe | New candidate result |
| --- | --- |
| Payment-standards comparison | `stellarDocs.search_docs` returns at rank 3, score 326; complete base order restored. |
| `Stellar skills for signing messages` | `scout.listSkills` rank 3, score 166; complete base order restored. |
| `Stellar skills for security auditing` | `scout.listSkills` rank 3, score 166; complete base order restored. |
| `Stellar authority skills` | `scout.listSkills` rank 3, score 135; complete base order restored. |
| Expanded MCP discovery | The reported loss remains; accepted as the bounded follow-up explained above. |

**Record wording and generation**

`sls-089:18` now correctly limits the new schema references to `/api/research`.
It calls the `/api/hackathon-brief` entries description-only.
It expressly says runtime recurrence was not re-tested.
The status remains `reported-upstream`.

`sk-027:20` adds the dated 62-entry observation.
`sk-027:26` preserves the historical 43-entry observation and distinguishes the current five populated sources.
The generated index no longer presents 43 as an undated current count.

One minor ledger phrase still needs correction at `.agents/rounds/2026-10-02-drift-scout-1.9.61.md:139`.
It says `RetryableError` is “described on” `/api/hackathon-brief`.
That endpoint describes status codes, not the named schema or its response fields.
Use the precise wording already present in `sls-089:18`.
This wording issue does not reinstate the corrected finding record.

Catalog, micro-map, super-spec, operation-class, and improvements-index regeneration produce no tracked differences.
The catalog still contains 282 IDs and 60 operations, with the expected exclusions.
Improvements lint and `git diff --check` pass.

The source worktree remains clean.
I wrote no repository file and made no upstream post, deployment, or paid call.
This pass uses the committed contract; it does not repeat the earlier live probes or certify deployment.

Evidence and reproduction scripts are in:

```text
/private/tmp/verify-drift-astra.pVAnKP/
  diff-surface.log
  diff-text.log
  diff-deep.log
  gate.log
  selftest.log
  candidate/eval/results/routing-2026-10-02T15-00-17-865Z.json
  probe-routing.mjs
  probe-routing.json
  probe-expanded.mjs
  probe-expanded.json
  focused.mjs
  focused.json
  discovery-detail.mjs
  discovery-detail.log
  discovery-detail.json
```

`node /private/tmp/verify-drift-astra.pVAnKP/focused.mjs` repeats the decisive offline checks.
