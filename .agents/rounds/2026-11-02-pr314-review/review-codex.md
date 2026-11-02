**Independent review of PR #314**

Reviewed `git diff ecc6da78..1ba59ccd` in `/private/tmp/raven-review-314` on 2026-11-02.
I checked all 12 changed files and all 20 matching battery cases.
I fetched all 18 current source URLs and the control sources.
I treated the PR description as claims, not evidence.

The live run returned 22 holds and no read errors.
The control run returned four drifts and one hold.
These results do not resolve the defects below.

The failure scenarios use local fixtures unless they identify live evidence.
They reproduce implementation behavior; they do not claim that GitHub experienced these failures.
No tracked files or GitHub resources changed.

1. **Medium — `eval/qa/source-sentinels.mjs:232`: Stale sentinels disappear from live reports without producing an error.**

   A case date changes while its sentinel retains the old date.
   The runner excludes that sentinel before fetching.
   With every sentinel stale, report mode exits 0 and prints `drift=0` and `errors=0`.
   The workflow then closes an existing issue at `.github/workflows/golden-sentinels.yml:77`.
   Partial staleness also permits closure when all remaining checks hold.
   The documented `--ids` reconfirmation command skips the stale sentinel too.

   Reproduce: `node tmp/review-probes.mjs`, then `node tmp/workflow-probe.mjs`.
   Inspect the `stale` results and the `all-stale` workflow result.
   `--check` correctly exits 1 for the same fixture.
   The committed battery test detects this mismatch, but the daily runner does not fail safely.

2. **Medium — `eval/qa/source-sentinels.mjs:172`: A source error removes a previously detected drift from the issue fingerprint.**

   Start with drifts A and B.
   On the next run, A returns HTTP 503 while B still drifts.
   The new report contains only B in its drift table.
   The workflow replaces the issue body and adds a comment at `.github/workflows/golden-sentinels.yml:72`.
   When A responds again, the workflow edits and comments again.
   Intermittent failures therefore generate repeated comments and remove unresolved cases from the drift table.

   Reproduce: `node tmp/review-probes.mjs` and `node tmp/workflow-probe.mjs`.
   Inspect `tmp/report-initial.md`, `tmp/report-partial.md`, and the `partial-error` workflow result.
   `test/source-sentinels.test.mjs:126` only adds an error for an unrelated ID.
   It does not test a previous drift becoming unreadable.
   Its claim that read errors cannot change the issue is therefore unsupported.

3. **Medium — `eval/qa/source-sentinels.mjs:145`: Successful HTTP responses become evidence of absence without a source-content check.**

   An absent check receives an empty HTTP 200 response or a human-verification page.
   The runner reports `hold`, with no read error.
   If that sentinel previously drifted and the other checks hold, the workflow can close the issue.
   HTTP success alone does not establish that the requested source loaded.

   Reproduce: `node tmp/review-probes.mjs`.
   Both the empty-page and challenge-page fixtures return `hold` for `x402-no-sep`.
   Require a source identity or expected content marker before evaluating absence.
   The all-HTTP-error guard does not cover this failure.

4. **Medium — `eval/qa/source-sentinels.json:220`: The x402 sentinel watches the repository introduction instead of the SEP list.**

   The [root README](https://github.com/stellar/stellar-protocol/blob/master/README.md) describes repository structure.
   The [ecosystem README](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/README.md) lists the actual proposals.
   A new x402 proposal can change the latter without changing the former.
   The sentinel then continues to report `hold`.
   The matching golden explicitly records verification against the ecosystem proposal directory.

   Reproduce: `node tmp/audit-evidence.mjs`.
   Its fixture adds an x402 proposal to the fetched proposal list.
   The watched root remains `hold`; the changed proposal list returns `drift`.
   Compare `eval/qa/corpus/battery/history-org-tokenomics/q-hist-x402-stellar-announcement.json:22`.

5. **Medium — `eval/qa/source-sentinels.json:132`: The ledger-limit anchor matches an explicitly historical value instead of the current network setting.**

   The [live fees page](https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering) qualifies the matched numbers with July 2026.
   It directs readers to Stellar Lab for current values.
   A validator vote can change the limits while that historical sentence remains correct.
   The sentinel then misses the change that requires re-verification.

   Reproduce: `node tmp/review-probes.mjs`, using the saved live page in `tmp/live-sources.json`.
   The `ledger-operation-limits` fixture adds different current limits while retaining the dated sentence.
   The sentinel still returns `hold`.
   The matching case treats both limits as current, validator-controlled settings.

6. **Medium — `eval/qa/source-sentinels.json:189`: The bounty sentinel monitors a page that its own golden identifies as stale.**

   The matching case gives the transition policy and live HackerOne profile authority over the older landing page.
   The sentinel instead checks historical partnership wording on that landing page.
   A closed intake or changed reporting route can leave that wording intact.
   The sentinel then misses the operational change.

   Reproduce: `node tmp/review-probes.mjs`.
   The fixture adds a closed-program notice while retaining the fetched partnership wording; the result remains `hold`.
   Compare `eval/qa/corpus/battery/compliance-rwa-payments/q-comp-security-disclosure-programs.json:10`.
   The [watched page](https://stellar.org/grants-and-funding/bug-bounty) currently contains the partnership wording.

7. **Medium — `eval/qa/source-sentinels.json:72` and `:112`: Two anchors omit the relationship that makes their matched text relevant.**

   `mazieres-chief-scientist` matches a title anywhere on the team page, without linking it to Mazières.
   `go-sdk-module` matches a module name without checking whether the page recommends or deprecates it.
   Both can hold after their intended fact changes.

   Reproduce: `node tmp/review-probes.mjs`.
   Replacing Mazières's name while retaining the title still returns `hold`.
   A page stating that `go-stellar-sdk` is deprecated also returns `hold`.
   Bind the title to the person and the module to its current recommendation.

8. **Low — `eval/qa/source-sentinels.json:62`: The board anchor requires presentation order and the next section's heading.**

   Reordering the same five members causes `drift`.
   Renaming the adjacent Advisors section also causes `drift`.
   Neither change alters the board roster tested by the golden.

   Reproduce: `node tmp/review-probes.mjs`.
   Both board fixtures modify the fetched team page and return `drift`.
   Compare the member set within the board section instead of its entire display sequence.

9. **Low — `eval/qa/source-sentinels.mjs:85`: The commit-pin guard accepts immutable raw GitHub URLs.**

   The guard rejects `/blob/<40-character SHA>/` and `/tree/<40-character SHA>/`.
   It accepts `https://raw.githubusercontent.com/<owner>/<repo>/<40-character SHA>/<path>`.
   Such a sentinel passes validation but cannot detect later source changes.

   Reproduce: `node tmp/review-probes.mjs`.
   The `raw pinned URL validation` result contains no problems or stale entries.
   Check the raw URL form as well as the GitHub page forms.

10. **Low — `research/audits/2026-11-02-golden-freshness-probe/README.md:115`: The audit overstates what its false-alarm evidence establishes.**

    The removed TODO required at most two false alarms across the original 35 probes.
    Part 2 instead tests newly selected anchors for 20 cases.
    Confirming those anchors during authoring establishes their initial fit, not the original 35-probe acceptance result.
    The quote sweep measures different strings and provides no independent test of the 22 production anchors.
    Its 72 observations span 18–97 days, not uniformly three to five weeks.
    The claimed future four-percent false-alarm load therefore exceeds the evidence.

    The audit also misclassifies the ACP mismatch at line 128.
    The [live ACP README](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol/blob/main/README.md) retains the maintainer sentence with Markdown formatting.
    Removing link and emphasis syntax restores the recorded quote exactly.
    The sentence did not simply become a badge.

    Reproduce: `node tmp/audit-evidence.mjs`.
    Inspect `quote-sweep.json`, `probes.json`, and the deleted TODO in `git diff ecc6da78..1ba59ccd -- .agents/TODO.md`.
    The evidence supports 68 of 72 retained quotes and four of five detected controls.
    It does not establish the stronger acceptance and future-rate claims.

11. **Low — `test/source-sentinels.test.mjs:72`: The angle-bracket test does not verify that normalization preserves angle brackets.**

    Its assertion counts `ghsa_id` fields instead of checking `Vec<T>`.
    Removing `<T>` leaves that count unchanged, so the named behavior can regress without failing this test.

    Reproduce: `node tmp/transport-probe.mjs`.
    Both correct normalization and incorrect HTML stripping return `hold` with two matches.
    The incorrect result loses `<T>`.
    Assert the normalized text or the literal `Vec<T>` value directly.

12. **Low — `eval/qa/source-sentinels.mjs:121`: An out-of-range numeric entity makes an otherwise usable source unreadable.**

    `String.fromCodePoint` throws for values above `0x10FFFF`.
    An unrelated `&#1114112;` or `&#x110000;` anywhere in a response therefore aborts normalization.
    The runner retries the same content and reports an error instead of checking the anchor.

    Reproduce: `node tmp/review-probes.mjs`.
    Both invalid-entity fixtures throw `Invalid code point 1114112`.
    Handle invalid entity values without discarding the entire source.

**Anchor coverage**

I compared every anchor with its matching case, including the answer, key facts, cautions, and source references.
Each result below describes the selected anchor's scope, not the entire golden's coverage.
All 22 anchors held during the live review.

| Sentinel | Assessment |
| --- | --- |
| `scf-46-submission-deadline` | Binds round, phase, and deadline on the current awards page. |
| `scf-45-ended` | Checks the ended phase; it does not establish “last concluded round” alone. |
| `scf-46-submission-deadline-edge` | Same useful deadline check for the sibling case. |
| `rpc-archive-provider-rows` | Counts nine archive cells correctly. Equal-sized roster replacements remain outside this count check. |
| `zenex-mainnet-deployment` | Checks the operator's deployment statement. It does not check current trading activity. |
| `sdf-board-roster` | Checks names, but also presentation order and the adjacent heading; finding 8 applies. |
| `mazieres-chief-scientist` | Does not bind the title to Mazières; finding 7 applies. |
| `sep55-draft` | Checks Draft status in the current proposal file. |
| `sep58-draft` | Checks Draft status in the current proposal file. |
| `flutter-sdk-soneso` | Binds the Flutter SDK to Soneso maintenance. It does not monitor package versions. |
| `go-sdk-module` | Checks name occurrence rather than current recommendation; finding 7 applies. |
| `enterprise-fund-portfolio` | Checks the owner's portfolio wording and amount. It does not claim a cash-investment total. |
| `ledger-operation-limits` | Watches a dated documentation sentence; finding 5 applies. |
| `mpp-payment-intents` | Checks two intents and Charge. Changes to Session alone can remain undetected. |
| `ml-dsa-not-shipped` | Detects an ML-DSA mention. It cannot distinguish Testnet, Mainnet, plans, or shipped features. |
| `instaward-cap` | Checks the cumulative $15,000 cap in the current rules. |
| `metamask-stellar-default` | Checks the explicit Stellar default-network statement. |
| `mainnet-base-reserve` | Checks the reserve field in the latest returned Horizon ledger. |
| `sdf-bug-bounty-hackerone` | Watches historical partnership wording on a weaker source; finding 6 applies. |
| `sdp-transaction-submission-service` | Checks TSS's submission role. It does not cover the native SEP-10/24 architecture. |
| `soroban-sdk-advisories` | Counts three advisory identifiers correctly. Patch-version changes without count changes remain undetected. |
| `x402-no-sep` | Watches the wrong repository file; finding 4 applies. |

**Checks that found sound behavior**

- `npm run eval:qa:sentinels -- --check` passed: 22 entries, no errors, no stale dates.
- All 10 tests passed with `npx vitest run test/source-sentinels.test.mjs --configLoader runner`.
- The default test command hit a shared dependency-directory write restriction; the alternate loader avoided that write.
- Live report mode produced zero drifts, zero errors, and exactly three valid `GITHUB_OUTPUT` assignment lines.
- The five controls produced four drifts and one hold. Meridian remained the missed control.
- Fresh regular expressions avoid shared `lastIndex` state. Repeated evaluations returned the same results.
- Current GitHub blob mappings preserve paths and remove fragments correctly.
- URL reuse worked. HTTP 404 received one attempt; HTTP 429 and HTTP 503 received two attempts.
- A stalled response body triggered both configured 25,000 ms deadlines in a shortened local timeout probe.
- All-fetch-error CLI mode exited 2. Unknown IDs exited 1.
- Dummy-token probes attached authorization only to `api.github.com`, excluding lookalike hosts and raw GitHub URLs.
- Native fetch removed authorization across a locally simulated cross-origin redirect.
- Local workflow tests covered creation, unchanged fingerprints, updates, clean closure, and retention after read errors.
- Shell values remained quoted. Issue-body fingerprints parsed correctly in those tests.
- The workflow requests repository content-read and issue-write permissions. It needs no separately configured secret.
- Fork execution still requires Actions and Issues enabled; I did not execute a fork workflow.
- The change does not modify golden truth, runtime exposure, or sandbox credentials.
- `git status --short` showed no tracked changes after the review probes.
