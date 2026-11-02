# Independent review of PR #314

Reviewed at merge commit `1ba59ccd`. All 22 current sentinels match their pages on 2026-11-02. The defects below are missed changes, false holds, and issue-sync holes. They are not current false alarms.

## Findings

### 1. High — the x402 anchor cannot see a new SEP

- Location: `eval/qa/source-sentinels.json:216`
- Defect: The absent check reads the protocol repository root README, and that file does not list SEP titles.
- Failure: A new file under `ecosystem/` adds x402 to `ecosystem/README.md`. The root README keeps its static example tree (`sep-0001.md`, `sep-0002.md`, `sep-0003.md`). The sentinel still holds, so the case is not queued.
- Source: The case fact is `eval/qa/corpus/battery/history-org-tokenomics/q-hist-x402-stellar-announcement.json:14`. On 2026-11-02 the root README (2,577 bytes) has no `x402` and no SEP index. `ecosystem/README.md` has 110 `sep-` rows and also has no `x402`.

### 2. Medium — a stale sentinel is skipped and reported as clean

- Location: `eval/qa/source-sentinels.mjs:231`
- Defect: A live run drops a sentinel whose `caseAsOf` differs from `truth.asOf`, then exits 0.
- Failure: `truth.asOf` moves and `caseAsOf` stays. `npm run eval:qa:sentinels -- --ids <id>` prints no row. `--report` prints `drift=0` and `errors=0`. `.github/workflows/golden-sentinels.yml:77` then closes the open issue. The golden-truth skill at `.agents/skills/golden-truth/SKILL.md:176` tells the editor to re-confirm with `--ids` before updating `caseAsOf`. That command skips the sentinel while the dates differ.
- Reproduce: Write a one-sentinel file for `q-scf-current-round` with `caseAsOf` `2020-01-01`. `node eval/qa/source-sentinels.mjs --sentinels <file> --ids scf-46-submission-deadline` exits 0 with empty stdout. The same file with `--report` prints `drift=0`, `errors=0`, and fingerprint `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` (SHA-256 of `[]`). `--check` on that file exits 1. The daily workflow does not pass `--check`.

### 3. Medium — an absent check treats any HTTP 200 body as a pass

- Location: `eval/qa/source-sentinels.mjs:131`
- Defect: An absent check holds whenever the match count is zero, including a challenge page or an empty document.
- Failure: `developers.stellar.org` returns HTTP 200 and a challenge page that does not contain `ML-DSA`. `ml-dsa-not-shipped` holds. If the other sentinels hold, the workflow closes the issue while the versions page was not read. `x402-no-sep` uses the same kind.
- Reproduce: Call `runSentinels` with a fake fetch that returns HTTP 200 and `<html>Just a moment</html>` for `ml-dsa-not-shipped`. The verdict is `hold`. A HTTP 404 on the same helper becomes `error` after one try, so the 200 path is the hole.

### 4. Medium — workflow dispatch can close the issue from another branch

- Location: `.github/workflows/golden-sentinels.yml:21`
- Defect: The job does not require `main`, and a report with no drift closes the repository issue.
- Failure: Dispatch the workflow on a branch whose anchors all hold. The close step runs. The repository issue closes even when `main` would still report drift.
- Reproduce: Read the workflow. `workflow_dispatch` is line 21. The close is lines 77–79. The job has no `github.ref` check. This review did not start a workflow run.

### 5. Medium — the archive count does not identify the nine providers

- Location: `eval/qa/source-sentinels.json:40`
- Defect: The count check requires nine marks in the archive column and does not require the nine names.
- Failure: One archive provider is replaced and the column still has nine check marks. The sentinel holds. The golden names a specific roster. A new column before RPC Archive also moves the hard-coded `{4}` offset, so the pattern can count the wrong column.
- Reproduce: Fetch the raw `providers.mdx` through `fetchUrl`. The header is Provider, Futurenet, Testnet, Mainnet, Dedicated Nodes, RPC Archive. The nine matches are Validation Cloud, Gateway, Ankr, Obsrvr, OnFinality, Lightsail Network - Quasar, Exaion, GetBlock, and node101. The case roster is `eval/qa/corpus/battery/tooling-infra/q-infra-rpc-provider-archive-tier.json:9`.

### 6. Medium — the Go module anchor is an unscoped substring

- Location: `eval/qa/source-sentinels.json:111`
- Defect: The pattern `go-stellar-sdk` matches a longer module name and any leftover mention.
- Failure: The docs move the current module to `go-stellar-sdk-v2`, or they mark `go-stellar-sdk` as old, and one old string remains. The sentinel holds. The live client-SDK page already matches the pattern 7 times.
- Reproduce: `evaluate` on text that contains only `go-stellar-sdk-v2` returns `hold`. The case requires `github.com/stellar/go-stellar-sdk` at `eval/qa/corpus/battery/tooling-infra/q-tool-go-sdk-ingest.json:12`.

### 7. Medium — the MPP anchor does not require Session

- Location: `eval/qa/source-sentinels.json:141`
- Defect: The pattern stops at the word Charge and does not require the Session intent.
- Failure: The page drops Session and keeps the sentence "supports two payment intents: Charge". The sentinel holds. The golden requires both modes.
- Reproduce: The normalized docs text at the match is "supports two payment intents: Charge Immediate one-time payments." The case answer is `eval/qa/corpus/battery/compliance-rwa-payments/q-mpp-discovery-and-modes.json:9`. The word Session on that page occurs in the nav label "MPP Session Guide", which this pattern does not read.

### 8. Medium — the Zenex anchor skips the market status

- Location: `eval/qa/source-sentinels.json:51`
- Defect: The pattern matches the deployments-page introduction and does not match the XLM-USD market status.
- Failure: The market status leaves Active and the introduction stays. The sentinel holds.
- Reproduce: The normalized window is "This page lists every contract of the live Zenex deployment on Stellar mainnet". The case records the status sentence from that same page at `eval/qa/corpus/battery/defi-ecosystem/q-defi-perps-whitespace.json:100`.

### 9. Medium — the ledger-limit anchor reads only one docs sentence

- Location: `eval/qa/source-sentinels.json:131`
- Defect: The pattern matches one docs sentence and does not read the live ledger settings that the golden cites.
- Failure: Validators change the smart-contract lane limit. The docs sentence "as of July 2026, 1,000 non-smart-contract operations and 2,000 smart contract transactions" stays. The sentinel holds. That sentence tells the reader to use Stellar Lab for the current values.
- Reproduce: The docs page matches that sentence. The same-day Horizon ledger at `https://horizon.stellar.org/ledgers?order=desc&limit=1` has `max_tx_set_size` 1000 and does not carry the 2,000 lane value. The case cites Docs plus live settings at `eval/qa/corpus/battery/protocol-core/q-protocol-max-tx-set-size.json:9`.

### 10. Medium — the ML-DSA check is absence of one string on the versions page

- Location: `eval/qa/source-sentinels.json:149`
- Defect: Any use of `ML-DSA` on the software-versions page is drift, and a release note that uses only a CAP id is a miss.
- Failure: The page adds "ML-DSA is planned for a later protocol". The sentinel drifts while the feature is still unshipped. A protocol section that names the feature only by CAP id leaves the sentinel on hold after it ships.
- Reproduce: The normalized versions page contains "Soroban host functions for BLS12-381" and "Protocol 29" and does not contain `ML-DSA`. The case sources at `eval/qa/corpus/battery/history-org-tokenomics/q-hist-quantum-preparedness-plan.json:38` are the plan article, the protocol-upgrades page, and Horizon.

### 11. Medium — the title anchor is not bound to Mazières

- Location: `eval/qa/source-sentinels.json:72`
- Defect: The pattern is the unbound phrase "Founder and Chief Scientist".
- Failure: His name leaves the leadership list and the CMS description string remains. The sentinel holds. The golden is that the page data applies this title to him.
- Reproduce: On the team page the phrase occurs once. The 400 characters before it contain the title "Candace Kelly" and do not contain Mazières. The following card fields through the thumbnail are null. His name appears in the leadership list about 5,000 characters earlier. The case is `eval/qa/corpus/battery/history-org-tokenomics/q-org-mazieres-chief-scientist.json:9`.

### 12. Medium — the README overstates what `npm test` checks

- Location: `eval/qa/README.md:194`
- Defect: The README says `npm test` fails unless the anchor was re-confirmed live. The test only compares `caseAsOf` with `truth.asOf`.
- Failure: An editor sets `caseAsOf` to the new `truth.asOf` and does not fetch the page. `npm test` passes. The daily job then watches a dead anchor.
- Reproduce: `test/source-sentinels.test.mjs:134` calls `validateSentinels` and does not fetch. `npx vitest run test/source-sentinels.test.mjs` passes 10 tests.

### 13. Low — "SCF #45 Ended" survives the next round change

- Location: `eval/qa/source-sentinels.json:21`
- Defect: The pattern matches a historical card that the awards page keeps after later rounds end.
- Failure: SCF #46 ends and #45 is no longer the last concluded round. The card still says "SCF #45 Ended". This sentinel holds. The separate #46 deadline sentinel can still fire if that card's phase label is rewritten.
- Reproduce: The normalized awards page shows "SCF #46 Submission Deadline to submit: November 9, 2026" beside "SCF #45 Ended" and "SCF #44 Ended". The key fact is `eval/qa/corpus/battery/scf-grants-builders/q-scf-current-round.json:14`.

### 14. Low — the board anchor is tied to the next heading

- Location: `eval/qa/source-sentinels.json:63`
- Defect: The pattern ends with the prefix `Advis` from the following Advisors heading.
- Failure: The five directors stay and the next heading is renamed. The sentinel drifts.
- Reproduce: The normalized team page has "Asiff Hirji Advisors Patrick Collison". The five names match `eval/qa/corpus/battery/history-org-tokenomics/q-org-sdf-board-directors.json` as of 2026-08-18.

### 15. Low — the Flutter anchor does not watch the dated versions

- Location: `eval/qa/source-sentinels.json:102`
- Defect: The pattern is the Soneso maintainer sentence and does not include the dated package versions.
- Failure: `stellar_wallet_flutter_sdk` or `stellar_flutter_sdk` publishes a version after 1.1.3 or 3.2.1. The Soneso sentence stays. The sentinel holds.
- Reproduce: The maintainer sentence matches the client-SDK page twice. The dated versions are `eval/qa/corpus/battery/tooling-infra/q-tool-flutter-mobile-sdk.json:14`.

### 16. Low — commit-pinned raw URLs and slash branch names bypass the guards

- Location: `eval/qa/source-sentinels.mjs:85` and `eval/qa/source-sentinels.mjs:106`
- Defect: The pin check only rejects a 40-hex `blob` or `tree` URL on `github.com`, and the raw mapper takes one path segment as the ref.
- Failure: A sentinel URL on `raw.githubusercontent.com` with a 40-hex commit passes validation and cannot drift. A blob URL whose branch is `feature/foo` is fetched as ref `feature` and path `foo/...`, so the fetch misses the file.
- Reproduce: `validateSentinels` accepts `https://raw.githubusercontent.com/o/r/0123456789abcdef0123456789abcdef01234567/a.md`. `fetchUrl("https://github.com/o/r/blob/feature/foo/docs/a.md")` returns `https://raw.githubusercontent.com/o/r/feature/foo/docs/a.md`. No current sentinel uses either form.

### 17. Low — an invalid numeric character reference becomes a silent miss

- Location: `eval/qa/source-sentinels.mjs:121`
- Defect: `String.fromCodePoint` throws on a numeric character reference above U+10FFFF, and the sentinel is then an error rather than a drift.
- Failure: A page contains `&#1114112;`. That sentinel is unreadable on every run. If nothing else drifts, the workflow opens no issue and the anchor is not tested.
- Reproduce: `normalize("ok &#1114112; tail")` throws `RangeError: Invalid code point 1114112`. `fetchText` catches that error.

### 18. Low — named tests do not cover the issue sync or the live exit codes

- Location: `test/source-sentinels.test.mjs:125`
- Defect: The fingerprint test says read errors cannot churn the issue, and it never runs the workflow or the CLI.
- Failure: The stale-list test at line 38 passes while the CLI exits 0 for a stale id. The fetch test at line 100 uses HTTP 404 and does not cover an HTTP 200 challenge body. A regression in findings 2 and 3 stays green.
- Reproduce: `npx vitest run test/source-sentinels.test.mjs` reports 10 passed.

### 19. Low — the 4 percent figure is not a sentinel measurement

- Location: `research/audits/2026-11-02-golden-freshness-probe/README.md:133`
- Defect: The text calls the freeform quote-sweep failure rate the expected sentinel false-alarm load.
- Failure: A reader treats 4 percent as the measured false-alarm rate of the 22 sentinels. The sweep counts evidence-note quotes, and 11 of its hold rows repeat a quote and a URL.
- Reproduce: `quote-sweep.json` has 154 rows. Rows dated July through October 2026 with a non-error verdict: 75. Three of those are the FinCEN PDF. The other 72 are 68 hold and 4 drift. Those 4 drifts are the four sources named in the README. Each of the 75 quotes occurs in a class A or B note. The README's own next paragraph says freeform quotes are not usable anchors.

## Checked and sound

- Live re-read on 2026-11-02: all 22 sentinels hold. The five controls score 4 drift and 1 hold. The Meridian control still matches "Meridian 2026 is a two-day in-person conference taking place" on the event page. That is the miss the audit describes.
- The SCF #46 deadline string is the card phase label. Ended cards on the same page say "Ended", so a rewrite of the #46 card drops `scf-46-submission-deadline`.
- The archive count today is the RPC Archive column, and its nine names match the golden roster.
- SEP-55 and SEP-58 each match `Status: Draft` once, in the preamble.
- The MetaMask sentence matches once. The base-reserve pattern is a colon, an optional space, `5000000`, and a word boundary. The latest Horizon ledger matches it. `application/hal+json` is not treated as HTML.
- The advisory endpoint returns 3 unique `ghsa_id` values with no token. With `GITHUB_TOKEN` set, the runner sends `Authorization` only to `https://api.github.com/`. A local cross-origin redirect dropped that header.
- The Instaward sentence, the HackerOne sentence, and "portfolio totaling over $100m" match their pages.
- The SDP pattern allows the space before the colon. The quote-sweep exact quote misses that space. The sentinel holds.
- The board names are contiguous and match the golden list. Finding 14 is only the heading suffix.
- `--check` reports 22 sentinels, 0 errors, 0 stale, and exits 0. A stale file exits 1 under `--check`.
- Every fetch failing exits 2 after it writes the output lines. The workflow has no `continue-on-error`, so the close step does not run.
- A HTTP 503 is tried twice. A HTTP 404 is tried once. `evaluate` builds a new regular expression on each call. `[^<>]` strips a tag that contains a newline.
- The three `GITHUB_OUTPUT` lines are `drift`, `errors`, and `fingerprint`. Stale warnings go to stderr. The fingerprint `sed` extracts 64 hex characters from the marker line. A small body does not trip `pipefail` with `head`.
- Workflow permissions are `contents: read` and `issues: write`. The triggers are schedule, push to `main`, and `workflow_dispatch`. There is no pull-request trigger and no secret. The shell variables in the issue step are quoted.
- Protocol 29 on the versions page is "a security-focused release" and "introduces no new CAPs". `limits/slp-0006.md` says `Status: Final`. Both incidental sentences are true. The sweep file stores the Protocol 29 heading and does not store the SLP row.
- This review did not run a GitHub Actions workflow and did not write to GitHub.
