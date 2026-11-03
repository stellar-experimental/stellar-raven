# Independent review — 2026-11-03 QA follow-up

Reviewer: Grok 4.7 high, terminal t9r.
Session: `01a1a1ad-6040-7f62-8b86-5a0238054c06`.
Packet time: `2026-11-03T15:49:32.251388+00:00`.
Packet SHA-256: `2a1355881e6fc6d7d4d0f07632512fff0f5245a0d8a63defe9abe8322697f8be`.
All 58 packet files match their recorded hashes and sizes.

## Verdict

This review clears the frozen follow-up records.
The earlier consumer-impact omission is reconciled.
The named holds stay open.
This review approves no publication, measurement, or unfinished fix.
Root may append the completion receipt after this clearance.

## Source patches

The review covers `sd-082` through `sd-095` and `sk-037`.
Each original finding state is `local-patch-prepared`.
The Docs patch SHA-256 is `24f4840432a2d820a45f6fc806f5a8683ec988e834746e505c94c7c06e075c24`.
Its size is 23668 bytes.
The skill patch SHA-256 is `eb7b6df6349ba7c379f96ffbf2c9ced0bd037e38035096da9360403bc372fe60`.
Its size is 880 bytes.
The additional Docs patch SHA-256 is `092e6bb27c62914cdbd2e0617c9d8e298990768c0a761ca7c2f786568be21302`.
Its size is 6741 bytes.
Both Docs clones are at `85d2d1b8e7a4451b7a6af0931f587ce73109b816`.
The skill clone is at `9c604c2be6ae69f962fbb578bce6b681d462fea5`.
The ledger patch changes heading levels and keeps the heading titles.
The skill patch keeps one supported Soroban operation in the inner transaction.
The passkey text says the website does not receive the private key.
It allows device-bound credentials or provider synchronization with end-to-end encryption.
It gives no recovery promise and no other-device promise.
The supplement records develop revision `4aff0437810d12e020571c1dc075597d032a0bb7`.
This review clears the passkey wording closeout.
Method-page generation stays pending for `sd-087` and `sd-094`.
The patches stay local.
The combined compatibility check used the heading-repaired Docs patch hash above.
`tmp/2026-11-03-qa-followup/root-patch-recheck.json` SHA-256 is `35a06facc1e4a365a9fddd9baf9996e25ff9315f547833754e6a06077f362fc8`.
Its size is 1080 bytes.
Both Docs orders produce tree `e602c8e855e414e690c801088c0c8cd7f69de1f2`.
The skill check produces tree `3bd0c06caafb1be35acb98f2e588eb7ade404e63`.
The receipt says the real clone indexes stay unchanged.
This review did not rerun `git apply`.

## Candidate

The candidate base is `0aea991fd36ecd5653eef07c317568c7aa71f0e8`.
Five candidate files match the manifest after hashes.

| File | SHA-256 |
|---|---|
| `eval/qa/non-anthropic/method.mjs` | `dae7fd89806d18ffea2540f571dcff8dcc20ad053071623d1700a7c24109ce77` |
| `eval/qa/non-anthropic/provider.mjs` | `e0c8c5e59b1756286367add26c32f420af7337e14fe817bbc14de20fb742e758` |
| `eval/qa/non-anthropic/runner-support.mjs` | `cc049cf16816d8844099042c7eaa88d233e2d6b9e0518c5bb6107e0d0a2246c4` |
| `eval/qa/non-anthropic/README.md` | `853526d1290ba1cce5b31019be8021a2897415e61d7e4cacbab3846629f39bdf` |
| `test/direct-grok-runner.test.ts` | `263d8a8b3e0dfb74c9c766a428f980e7c5296077896133c8b0259bdc3a29c534` |

Eight protected source files match the manifest.
The frozen method files match those same base hashes.
The baseline plan still requires 16 answer requests.
The last answer request uses tool choice `none`.
Earlier answer requests use tool choice `auto`.
The stored transcript uses the returned provider message.
A final tool call fails the run.
An incomplete final answer fails the run.
The judge call stays separate.
The runner schema and the plan schema stay separate.
The deadline `2026-11-03T10:00:00Z` is expired.
This review clears the awaiting-review status.
The candidate stays unmeasured.
Local commit `dc97a0369f076a7e0d30abc1e80d93fcc5925da8` contains only those five files.
Its parent is `0aea991fd36ecd5653eef07c317568c7aa71f0e8`.
The five files and the protected sources match the approved hashes.
This review launched no provider call.

## Digest

`case-dispositions.json` SHA-256 is `99aa13de40ae511d9c9c0e030b8e82445ea4753df033e34c8af6501e8c6437ed`.
Its size is 602752 bytes.
`case-dispositions.md` SHA-256 is `4996a95fecf35b8e91ea4937021b054aee80f92baf81e18f37419d8ca6be1ca0`.
Its size is 117746 bytes.
Both files end with one newline.
The file has 100 cases and 314 observations.
All 314 observations have action text.
Ninety-one action refs resolve in the 163-entry registry.
Two hundred thirty-five observations use action text without a registry ref.
`GC-PROTOCOL` and `GC-STAKING` are completed corrections.
`MR-STOP` remains an unmeasured mechanism candidate.
The consumer-impact section names both applied v4 corrections.
`followupCorpusCorrections` records both approved v4 hashes.
The digest boundary covers digest generation only.
The reconciliation SHA-256 is `aee68aa8a0626350f66a4c398915c9795300f0b7a92c66b3948427d43c0cd2ac`.
Its size is 2413 bytes.
The raw artifact stays unread.
Its preserved SHA-256 remains `c8ec22427dd373492493b49b1f96c3e46d5476b8a928aa452b3dfd1654e6ea8f`.
Both flat-describe samples stay usability limits.
The evidence shows no proven Raven contract violation.

## V4 recovery

The protocol file SHA-256 is `eb86f91504c5386f611da3603ac60b746b59806367dbba9b2a7142ef7404619b`.
The staking file SHA-256 is `3d73f46239500e6fb029999c333ff3f8b8506ba21986f3f28301dfc47b2686ea`.
Both cases are active and resolved.
Each reactivation date is 2026-11-03.
The reviewer is Grok 4.7 high, independent source verifier t9r.
The register SHA-256 is `f2a70d97ee1b546ed046791bdb17a9317d1bab720f8f169adac7e99850ca612e`.
All nine v4 receipt rows match the live member maps.
Each closure is `consistent` on 2026-11-03.
Each reason binds the matching v4 member hash.
The Bell trigger remains future on 2026-11-03.
The receipt records a bad first container shape and an accidental old v3 closure.
It then records reconstruction and the v4 closure.
The pre-closure register SHA-256 is `793d0acaffadf7a7995e8f3480a442f6b395cfed137aed7766fd92dcb6eb2885`.
The approval file SHA-256 remains `df3ee3c7cd4e6719831bbc1d4fa3e61db7f3b790729f4152994cb76915eda703`.

## Receipt shape

Both public register receipts use `members` rows with `caseId` and `sha256`.
The v4 receipt SHA-256 is `2e0082261e76175807fdee3e756db4b61ad74a33b063c1412235009fd5cf02f8`.
Its size is 12317 bytes.
The older receipt SHA-256 is `e6b69e36726491953720b3766d81948b6851fab645eaffde017b456721d82f5c`.
Its size is 12125 bytes.
It keeps the v3 hashes for the two edge cases.
Every other member identity matches the v4 receipt.
`q-defi-build-staking-for-own-token` keeps hash `4ab3f5cefb9083abf1a5c475259437168111285028866445d61f4167bb092066`.
Neither receipt keeps a case-id key directly beside a 64-character hash.
`.gitleaks.toml` and `scripts/scan-secrets.mjs` have no new edit.
Root reports that the full scan and the staged scan pass.
This review did not rerun those scans.

## Helper, checks, and docs

`eval/qa/register-helper.mjs` SHA-256 is `0c415c0b5c8f3282127b094f6a2af0884318d7496c5553d171d6213f7d689872`.
The shared review fields are `verdict`, `lastChecked`, and `reSwept`.
Date-trap closures may also set `triggerDateEvent` and `disposition`.
The lifecycle test SHA-256 is `54e009d8d491c056aad0e0eed1c3c9cdcd2acd1c21a0cdc46d60f9f50a9d0514`.
The test expects 501 cases and 505 reserved IDs.
It derives active and quarantined counts from the compiled cases.
The worktree HEAD is `4dfb20086d17e4229d8e02f35d9e0cc8c025c93b`.
That commit is the quarantine-only lifecycle repair.
The check base is `bdcf915fb552d054657b04b23abc561a65d395f3`.
`final-checks.json` SHA-256 is `18148c21814cb1be507be57cab68a853a2f5e580b41a3aa9373a1d62ea563ae8`.
The retained log SHA-256 is `6d1a52301948e7fce5c73f874c35fd19650c8a1a24fa20d4f3e390af0590eb8a`.
The log says 146 files passed.
The log says 3093 passed and 3 expected failures.
Corpus lint has 0 errors and 93 warnings.
The routing gate passes.
The protocol-history diagnostic still fails: top-5 is 7/8, and controls are 3/4.
The earlier t11g run stays 87 passes and 1 lifecycle failure.
This review did not rerun the suite.

`.agents/TODO.md` SHA-256 is `40fbecc8211fc0ddb52f353dc514bfc38df343ce14ba0d18a1de8d47f1533852`.
`eval/EVALS.md` SHA-256 is `0fcf7874fa7fb01c3394eb2cc5b9289b8dc0a58cdb54d8f2366496ce1ea9afc6`.
The audit README SHA-256 is `dc437f1bbcf8f194d9b4c562c38a2289b87b8231b0e4e285888e8b5bcb45d1c8`.
The diagnostic queue item is marked done.
The canary and the owner-policy holds stay open.
The docs keep the candidate unmeasured and the quality score withheld.

## Export format and historical status

`git diff --cached --check` reports 84 whitespace warnings.
83 warnings are trailing spaces on patch context lines.
One warning is the extra blank line in `additional-source-triage.initial24.md`.
Root keeps those patch and historical bytes exact.
Export manifests keep their historical status strings.
This review clears their pending-export and pending-closeout status.
It does not rewrite those manifest hashes.
`completion.json` is absent.
Root records the current review and local commit state there.

## Budget

`budget.json` SHA-256 is `87af6591c85ab3f3a0af0565170c00d395b844191a6afad3c92e445bca2589ee`.
The snapshot time is `2026-11-03T15:27:59.723419+00:00`.
`followupGrokUsd` is 2.48907472.
Combined Grok helpers are 43.04619732 of 45.
New measurement calls are 0.
`wholeSessionSpendVerified` is false.
Root moves 2 USD from the unassigned 9.237378 USD.
The helper allocation becomes 47 USD.
The unassigned amount becomes 7.237378 USD.
The total authorization stays 200 USD.
The new-session stop becomes 6.40 USD.
Prior helpers 40.55712260 plus 6.40 stay below 47.
The native amount before this turn is 2.48907472 USD.
That amount stays inside the 6.40 USD stop.
This review leaves `budget.json` unchanged.
Root records the reallocation after this report.
This review adds no research and no measurement.

## Reconciled finding

The digest-scope finding is closed.
The reconciliation file proves the 100 case objects and 314 observations stay equivalent.
The evidence catalog stays unchanged.
The JSON boundary now names the digest lane.
The old `productionOrCorpusEdits` field is absent.
Both applied v4 corpus corrections are named with their exact hashes.
`GC-PROTOCOL` and `GC-STAKING` are completed corrections.
`MR-STOP` is an unmeasured mechanism candidate.
Its target is `research/audits/2026-11-03-qa-followup/finalization-candidate.md`.
The packet pins these repaired bytes.
Source, corpus, and code hashes stay at the frozen packet values.

## Findings

This review finds no open defect in the frozen bytes.

These limits stay open:

- RWA still needs an owner, period, denominator, and component set.
- Phoenix still needs an owner and dated submission IDs with one status filter.
- Bounty policy still needs direct authoritative access.
- The candidate stays unmeasured behind the expired deadline.
- `sd-087` and `sd-094` still need external method-page generation.
- The three patches stay local and unpublished.
- The protocol-history diagnostic still fails.
- Native cost, the budget reallocation, commit IDs, and terminal cleanup belong in `completion.json`.
