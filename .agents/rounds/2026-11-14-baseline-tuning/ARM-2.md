# Arm 2: exact rows on research results, measured without arm 1

Run lane: Claude Sonnet 5.5 (`claude-sonnet-5-5`), terminal `tune-run`.
Authorization: ledger "Plan 2", arm 2 (amendment A5): free checks 1 to 3 on a commit that is `origin/main` plus arm 2 only,
then the five identifier-naming panel rows three times each, cap USD 4 in total. No resume, no re-judge beyond the three planned repeats.

## 1. Result

**Keep, by A5's rule exactly.** Three rows had an exact row come back. In all three, a majority of repeats use the exact row's
text. No repeat of any of the five rows states a status or date its returned text does not show. No control repeat lost its
correct core answer. I recommend keeping as well, as a contract fix; see section 7 for what the read does and does not show.

## 2. The commit and the free checks

Branch `tune/loop-1-arm2`, from `tune/loop-1`, with `a321c5b7` (arm 1) reverted: `e0d6f4c8b3068c91d4d15e07203ac34ebc7688d5`.
The revert applied cleanly (18 files, +27 −693). The code diff against `origin/main` is arm 2's 15 files only
(`src/executor/providers.ts`, `src/policy/exact-evidence.ts`, `src/policy/source-basis.ts`, `src/executor/run.ts`,
`src/mcp/tools.ts`, `src/demo/tools.ts`, `src/adapters/types.ts`, `src/site.ts`, and their tests, plus the exposure scan's test). The
catalog, manifest, `eval/gates.json` and every instruction or tool description are `origin/main`'s.

Each command bare, exit code printed:

| Gate | Exit |
|---|---:|
| `npm run typecheck` | 0 |
| `npm test` (152 files passed, 2 skipped; 3,430 tests passed, 3 expected fail, 2 skipped) | 0 |
| `npm run build` | 0 |
| `npm run test:smoke` (9 files, 142 tests) | 0 |
| `npm run eval:routing -- --gate` (GATE PASS) | 0 |
| Generated artifacts in sync (the ten CI generators, then `git diff --exit-code` on the CI path list) | 0 and 0 |
| `npm run secrets:scan -- --tree` | clean |

Free checks, from the plan:

1. **Unit cases.** `test/executor-providers.test.ts`, `test/exact-evidence.test.ts`, `test/source-basis.test.ts` pass (129 tests): the named
   document, a row that only cites it, a neighbouring number, an identifier with no document, a query with no identifier, zero padding and
   spacing, two identifiers in one query, a matching slug under another source, the two A4 cases (a non-empty `exactKeys` with a
   non-matching slug is not exact; a matching row whose chunk lacks the preamble is exact), a non-candidate lane, quoting only plain https.
2. **Gates:** the table above.
3. **Live, read-only, no model** (`test/replay-exact-rows.test.ts`, `RAVEN_REPLAY_LIVE=1`, against the stored baseline's 79 tuning rows,
   selected by `sets.tuning` id first): 90 live Scout calls (81 stored research queries from 26 rows, plus nine fixed probes), all `ok`.
   **17 calls carry an exact row, 73 none.** The named document came back and was marked for `SEP-43`, `SEP-53`, `SEP-57`, `SEP-45`, `CAP-33`, `CAP-38`,
   `SEP-12`, `SEP-1` (one row each); `SEP-9999` got none. The stored queries that named `Protocol 21`, `USDT0`, `Tier 1`, `Pi Network` got none.
   The stored queries that name several CAPs marked each named document (2 to 3 rows). No call was marked on a query that does not name an
   existing document.

## 3. The read

| Item | Value |
|---|---|
| Server | `dev:eval` on port 8798, own `hc` child, revision `e0d6f4c8…`, clean `gca-eval` worktree detached there; stopped afterwards, port closed |
| Live check before spend | `scout.searchResearch({ q: 'SEP-43 standard interface' })` through this server: `exactRows: [{index 0, key 'sep-0043'}]`, footer `[caveat: unverified-match; exact: sep-0043]`, the exception sentence in the CANDIDATE EVIDENCE block |
| Rows | `q-sep-43-web-wallet-api`, `q-sep-53-sign-verify-message`, `q-pc-sponsored-reserves`, `q-comp-aml-analytics-vendors`, `q-edge-asset-site-scam-detection` |
| Collections | Three runs of the five ids, one `run-qa.mjs` call each (the runner has no repeat flag), each given the remaining budget as its cap (4.0000, then 3.0556, then 2.1566); 5 ids asserted before spend; all three: 5 of 5 rows, 5 judged, 0 failures, `comparable` true, 0 failed remote captures |
| Stamps | `2026-11-14T23-27-33`, `2026-11-14T23-30-06`, `2026-11-14T23-33-28` (all `-variantA`) |
| Cost | USD 0.9444 + 0.8990 + 1.0581 = **USD 2.9015** of the 4.00 cap. Time: three collections took 3 min 0 s, 2 min 32 s, 3 min 21 s |
| Judge | `claude-sonnet-5`, same stability register and `--max-panel-cases 50` as the panel runs; panels used: 1, 0, 1 |

Pins, hashes only: surface `b336fa14…3404` (unchanged, by design); wrapper `0dc4f4a9…eb0cf`; probe `aabfb83f…8d99`; remote vector
`046b0280…27e8` (unchanged); register `4322dd4d…f458`; environment `015a3750…2561` (PATH is hashed; new each shell). Every pin equalled its
expected value before spend; surface and revision matched before and after in all three collections.

## 4. Verdicts

| Row | Stored baseline | Step 0-prime | Arm 1 | Arm 2, repeats 1 / 2 / 3 |
|---|---|---|---|---|
| `q-sep-43-web-wallet-api` | wrong | correct | wrong | partial / partial / partial |
| `q-sep-53-sign-verify-message` | partial | partial | partial | partial / partial / partial |
| `q-pc-sponsored-reserves` | partial | partial | partial | partial / partial / partial |
| `q-comp-aml-analytics-vendors` | correct | correct | correct | correct / correct / correct |
| `q-edge-asset-site-scam-detection` | correct | partial | correct | correct / correct / correct |

Core answer is `correct` in all 15 repeats. Verdicts are stable inside this read (no row varies across its three repeats); they do not
separate arm 2 from the other columns except on `q-sep-43-web-wallet-api`, where the three repeats sit between the extremes the other runs
showed (wrong, correct, wrong).

## 5. How often an exact row came back, and what the agent did with it

**8 of 15 repeats (3 of 5 rows).** Per execute, the exact marker appeared 13 times, each time with the exception sentence, and once more the sentence appeared
with no `calls:` marker (section 6).

| Row | Repeats with an exact row | What the agent did |
|---|---|---|
| `q-sep-43-web-wallet-api` | 3 of 3 (`sep-0043`; 2, 2, 2 marked executes) | All three called `scout.searchResearch` with `SEP-43` or `SEP-43 wallet interface`, saw the marker, **then re-queried the same text to pull the marked row out and answered from it**: title, `Status: Draft`, `Version: 1.2.1`, `Created: 2024-04-11`, authors, discussion link. All three said plainly that they had only the preamble ("I could only retrieve its preamble, so I can't say what the API itself contains") and named the spec URL. The row's returned text is the preamble chunk only, so the verdict stayed `partial` (no methods, no error shapes). One repeat (3) also cited the x402 guide for two of the methods |
| `q-pc-sponsored-reserves` | 2 of 3 (repeats 2 and 3; `cap-0033`) | Both used it: "defined in CAP-33, which scout lists as 'Final'" (repeat 2; the row's `st` and preamble show `Final`), and "Status is Final, protocol version 14/15" plus "CAP-0031 was rejected in favor of it" (repeat 3; both lines are in the returned rows). Repeat 1 never called research; no exact row existed |
| `q-comp-aml-analytics-vendors` | 3 of 3 (`sep-0012`) | All three put the preamble facts in the answer ("SEP-12 (Active, v1.15.0, last updated 2024-07-23)"; repeats 2 and 3 say "the returned text shows Status: Active, Version 1.15.0, updated 2024-07-23"), then went on to the vendor question as before |
| `q-sep-53-sign-verify-message` | 0 of 3 | No repeat called research at all (the baseline's did, with `SEP-53`). Arm 2 had nothing to act on; the rows stayed `partial` |
| `q-edge-asset-site-scam-detection` | 0 of 3 | Two repeats called research with a topic query, none with an identifier. Nothing marked, as it should be (a control: arm 2 must not fire on it) |

The A4 sentence did what it says: where it appeared the agents quoted the preamble and stopped short of inventing the body. The preamble-only
chunk is also the limit of what arm 2 can deliver on `q-sep-43-web-wallet-api`: the mark reports the document came back, not that the right
chunk did.

## 6. Was any exact marking wrong?

**No.** All eight exact-bearing repeats carry a key equal to the identifier in the query (`SEP-43` to `sep-0043`, `CAP-33` to `cap-0033`,
`SEP-12` to `sep-0012`) and a row whose URL is that document. Neighbours in the same results were not marked: in `q-pc-sponsored-reserves`
repeat 3 the `cap-0031` row (Rejected, in favor of CAP-0033) came back beside the marked `cap-0033` row and stayed a candidate; in the SEP-12
repeats the `sep-0009` row (Standard KYC Fields) stayed a candidate. No identifier query that returned its document went unmarked. Two
notes, neither an error:

- `q-comp-aml-analytics-vendors` repeat 3 named the identifier inside a list variable (`qs`), as did the stored baseline row. The host marked it from the call's
  arguments and the sentence appeared. The `calls:` footer shows the first four calls and "(+4 more)", so the footer carries no `exact:`
  marker in that result. The marker is visible in the sentence.
- A query with an identifier and no returned document gets nothing (`SEP-9999`, free check 3).

**Status or date claims.** For all 15 repeats I extracted every status word (Draft, Final, Active, ...), every `YYYY-MM-DD` date, every semantic version
and every protocol-version string from the answer and searched the transcript's returned results and inputs for it. Every claim is in the returned
text (the `2026-11-14` "as of" date is the run date). Formatting differences only (`v1.15.0` against `Version 1.15.0`; `protocol version 14/15` against
`Protocol version: 14/15`). One repeat of the control `q-edge-asset-site-scam-detection` quotes `2023-07-08`; the SDF post it cites says "On July 8, 2023", so it is shown.

## 7. A5's keep rule, applied

| Condition | Result | Met |
|---|---|---|
| In at least 2 of the 3 rows where an exact row came back, a majority of repeats use the exact row's text | 3 of 3 rows. `q-sep-43-web-wallet-api` 3 of 3 repeats; `q-comp-aml-analytics-vendors` 3 of 3; `q-pc-sponsored-reserves` 2 of 3 repeats (the two where a row came back; the third had none). Read on all repeats it is 2 of 3, still a majority | Yes |
| No repeat states a status or date that the returned text does not show | 0 of 15 | Yes |
| No control repeat loses its correct core answer by a traced down | The controls are `q-comp-aml-analytics-vendors` (baseline correct) and `q-edge-asset-site-scam-detection` (baseline correct): all 6 repeats `correct`, core `correct`. No control went down | Yes |

**Keep by the rule.** My recommendation is the same.

- It behaves as a contract fix: whenever a research result carried the named document, the agent was told so by the host and used the document's own status, version
  and dates; where the preamble was the only chunk it said so. The identifier rule fired on 17 of 90 live calls and on none that did not name a
  document that exists.
- It does not show a gain in grades: three rows were already at their level in the other runs, and the one that moved (`q-sep-43-web-wallet-api`, `partial` in all three) is stable
  rather than higher than the best other run. The value is the one the plan gave it: a correct status line the host can vouch for.
- Limits. 15 repeats, three collections, one client. The 2 of 5 rows with no exact row show where arm 2 cannot act: the agent did not call research with the
  identifier (`SEP-53`), which is the routing problem `PH4` in `.agents/TODO.md` already tracks. The sentence also seems to make agents stop at
  the marked chunk (two repeats re-queried to extract it, one raised `limit`); I cannot say from three repeats whether it keeps them from the body, and
  the 0-prime `correct` on `q-sep-43-web-wallet-api` shows the body was reachable by a different query.

## 8. State

Created: `tune2-server` (`t1p8`, killed by me, port 8798 closed) and `tune2-collect` (`t1p9`, exited 0). `gca-eval` stays detached at `e0d6f4c8`,
clean; the three results JSONs are in its ignored `eval/qa/results/`. Branch `tune/loop-1-arm2` holds the revert commit and this record; `tune/loop-1`
holds this record. No resume, no re-run, no re-judge.
