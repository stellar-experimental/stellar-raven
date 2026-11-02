Lane A rejects all three designs. No candidate passes Amendment 1. Keep the current scorer and all floors.

The measurements use commit `d6ad7350046e8e283cda4c19b553dc903041d019`. Each routing run contains 544 rows. Each probe run contains 149 queries.

The main source uses its committed manifest. The fresh source uses frozen Scout 1.9.111, 682 titles, and stellar-light pin `789c9061`.

The amended fresh fixture excludes reviewSubmission, getRwaAssets, getQualityReport, verifyClaim, and locateSource. It exposes the two archived hackathon read operations.

The earlier `*-v1` directories retain the initial fresh fixture with locateSource exposed. These runs remain diagnostics.

The fresh manifest comes from the current builder and frozen inputs. It does not reuse the old generated manifest.

This work authorizes no source absorb, deployment, floor change, or issue closure. No paid evaluation or model call ran.

**Designs**

| Design | Change | Result |
|---|---|---|
| a1 | c4p, F4, and the pinned F5 Porter copy. Schema words cannot create gated admission. Unsupported schema rank evidence contributes nothing. | Reject. Mechanism probes pass, but strict losses remain. |
| a2 | a1 plus short-page filling against existing service counts. The quota stays `serviceQuota(limit + 10)`. | Reject. Every measured page equals a1. Keeping the prior quota removes the c4n gains too. |
| a3 | a2 with identity-backed service slots and a description-backed replacement exception. The final tier ordering keeps the 1.6 margin. | Reject. Generic identity words promote unrelated entries. The expanded replacement rule also fails G11. |

a1.patch (`tmp/rt-a/a1.patch`) · a2.patch (`tmp/rt-a/a2.patch`) · a3.patch (`tmp/rt-a/a3.patch`)

All patches compare with origin/main at d6ad7350. No fourth design ran. The no-override measurements are required diagnostics.

**Required probes**

| Design/source | 1 | 2 | 3 | 4 | 5 | 6 | G9 positives | G9 ordinary negatives | Mixed controls passing |
|---|---|---|---|---|---|---|---|---|---|
| a1/main | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 0/3 |
| a1/fresh | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 0/3 |
| a2/main | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 0/3 |
| a2/fresh | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 0/3 |
| a3/main | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 0/3 |
| a3/fresh | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 0/3 |

Checks 1–6 are bounded probes. Their passing results do not establish general token safety. The frozen drift tests remain unchanged.

**Strict counts and G2**

The count order is top1/top3/top5/cardHit5. W and L count strict-key flips inside each lane. Holdout counts top5 once.

| Design/source | Lane | Baseline | Candidate | W | L | G2 |
|---|---|---|---|---|---|---|
| a1/main | legacy | 218/294/327/113 | 219/293/327/113 | 1 | 1 | PASS |
| a1/main | extended | 93/111/117/16 | 93/111/116/16 | 0 | 1 | FAIL |
| a1/main | skills | 17/23/23/23 | 17/23/23/23 | 0 | 0 | PASS |
| a1/main | holdout | 12/27/30/30 | 12/26/30/30 | 0 | 1 | FAIL |
| a1/fresh | legacy | 219/293/327/113 | 220/292/326/113 | 1 | 2 | FAIL |
| a1/fresh | extended | 93/112/117/16 | 93/112/116/16 | 0 | 1 | FAIL |
| a1/fresh | skills | 17/23/23/23 | 17/23/23/23 | 0 | 0 | PASS |
| a1/fresh | holdout | 12/27/30/30 | 12/26/30/30 | 0 | 1 | FAIL |
| a2/main | legacy | 218/294/327/113 | 219/293/327/113 | 1 | 1 | PASS |
| a2/main | extended | 93/111/117/16 | 93/111/116/16 | 0 | 1 | FAIL |
| a2/main | skills | 17/23/23/23 | 17/23/23/23 | 0 | 0 | PASS |
| a2/main | holdout | 12/27/30/30 | 12/26/30/30 | 0 | 1 | FAIL |
| a2/fresh | legacy | 219/293/327/113 | 220/292/326/113 | 1 | 2 | FAIL |
| a2/fresh | extended | 93/112/117/16 | 93/112/116/16 | 0 | 1 | FAIL |
| a2/fresh | skills | 17/23/23/23 | 17/23/23/23 | 0 | 0 | PASS |
| a2/fresh | holdout | 12/27/30/30 | 12/26/30/30 | 0 | 1 | FAIL |
| a3/main | legacy | 218/294/327/113 | 218/293/325/112 | 1 | 5 | FAIL |
| a3/main | extended | 93/111/117/16 | 90/109/116/15 | 3 | 10 | FAIL |
| a3/main | skills | 17/23/23/23 | 17/23/23/23 | 0 | 0 | PASS |
| a3/main | holdout | 12/27/30/30 | 12/27/34/34 | 6 | 2 | PASS |
| a3/fresh | legacy | 219/293/327/113 | 219/292/325/112 | 1 | 5 | FAIL |
| a3/fresh | extended | 93/112/117/16 | 90/110/116/15 | 3 | 10 | FAIL |
| a3/fresh | skills | 17/23/23/23 | 17/23/23/23 | 0 | 0 | PASS |
| a3/fresh | holdout | 12/27/30/30 | 12/26/34/34 | 5 | 2 | PASS |

**G3, G4, G7, G8, G10, G11, and G12**

| Design/source | G3 | Exact --gate | Hackathon pairs, baseline→candidate | New pairs / improved ranks | Forbidden captures | G8 exclusions | G11 | G12 changed pages / strict changes |
|---|---|---|---|---|---|---|---|---|
| a1/main | FAIL | PASS | 45→46 | 1 / 0 | 10→10 | PASS | PASS | 7 / 0 |
| a1/fresh | FAIL | FAIL | 66→66 | 3 / 1 | 10→10 | PASS | PASS | 7 / 0 |
| a2/main | FAIL | PASS | 45→46 | 1 / 0 | 10→10 | PASS | PASS | 7 / 0 |
| a2/fresh | FAIL | FAIL | 66→66 | 3 / 1 | 10→10 | PASS | PASS | 7 / 0 |
| a3/main | FAIL | FAIL | 45→56 | 13 / 1 | 10→14 | PASS | FAIL | 6 / 0 |
| a3/fresh | FAIL | FAIL | 66→76 | 17 / 3 | 10→14 | PASS | FAIL | 6 / 0 |

G7 counts non-hackathon `(row, operation)` pairs across all eight watched hackathon operations. It uses the archived intent annotations.

The analysis also reports the old two-operation D2 subset. Both scopes reject the repair when new pairs appear.

a1/main G3 violations: legacy.top3 294→293, allowed drop 0; extended.top5 117→116, allowed drop 0.

a1/fresh G3 violations: legacy.top3 293→292, allowed drop 0; legacy.top5 327→326, allowed drop 0; extended.top5 117→116, allowed drop 0.

a2/main G3 violations: legacy.top3 294→293, allowed drop 0; extended.top5 117→116, allowed drop 0.

a2/fresh G3 violations: legacy.top3 293→292, allowed drop 0; legacy.top5 327→326, allowed drop 0; extended.top5 117→116, allowed drop 0.

a3/main G3 violations: legacy.top3 294→293, allowed drop 0; legacy.top5 327→325, allowed drop 0; legacy.cardHit5 113→112, allowed drop 0; extended.top1 93→90, allowed drop 0; extended.top3 111→109, allowed drop 0; extended.top5 117→116, allowed drop 0; extended.cardHit5 16→15, allowed drop 0; holdout.forbiddenCaptures 10→14, allowed drop 0.

a3/fresh G3 violations: legacy.top3 293→292, allowed drop 0; legacy.top5 327→325, allowed drop 0; legacy.cardHit5 113→112, allowed drop 0; extended.top1 93→90, allowed drop 0; extended.top3 112→110, allowed drop 0; extended.top5 117→116, allowed drop 0; extended.cardHit5 16→15, allowed drop 0; holdout.forbiddenCaptures 10→14, allowed drop 0.

The fresh exact gate fails the committed manifest fingerprint. Main a1 and a2 pass the exact gate, despite other failures.

The `--manifest` option checks the default checkout fingerprint. It does not check the selected manifest fingerprint.

Therefore, this report uses separate exact commands without `--manifest` for G4. The saved override runs remain diagnostic evidence.

a1 fails 18/30 synthetic G10 comparisons. Example: {"token":"in","witness":"integration","field":"description","query":"in widgets","before":{"gated":75,"ungated":25},"after":{"gated":55,"ungated":55},"pass":false}.

a2 fails 18/30 synthetic G10 comparisons. Example: {"token":"in","witness":"integration","field":"description","query":"in widgets","before":{"gated":75,"ungated":25},"after":{"gated":55,"ungated":55},"pass":false}.

a3 fails 18/30 synthetic G10 comparisons. Example: {"token":"in","witness":"integration","field":"description","query":"in widgets","before":{"gated":75,"ungated":25},"after":{"gated":55,"ungated":55},"pass":false}.

G10 tests description, schema-keyword, and routing-keyword fields. It tests standalone admission and score changes beside `widgets`.

The pairs include `in`/`integration`, `type`/`types`, `1`/`lvl1`, `a`/`phase`, and `is`/`list`.

G12 removes only the existing dApp description override, then rebuilds each source manifest. Changed scores and page order remain visible.

No strict grade changes follow its removal. However, graded pages change, so the requested page-stability reading fails.

G11 records every full gated page and its selection stages. a3 changes the existing replacement threshold and fails this condition.

**Every graded loss and G5 evidence**

Each loss has complete before/after score traces, selection stages, query tokens, and per-field matches. Unchanged scores indicate selection changes.

The token tables distinguish whole words, prefixes, and substrings. The score deltas use the actual public scoring functions.

a1/main: token traces (`tmp/rt-a/a1-main/token-traces.json`), selection traces (`tmp/rt-a/a1-main/loss-traces.json`).

| Lost row | Lost grades | Cause |
|---|---|---|
| q-soroban-oz-upgradeable-macro | top3 | Schema cleaning removes `open`→`op` and `for`→`fork` contributions from Soroban Docs. Its ungated score falls 457→448. The unchanged Scout score is 281. The 1.6 margin requires 449.6, so Docs moves below rank 3. This is removed spurious evidence, class (a). |
| q-ti-friendbot-ratelimit-alternatives | top5, any5 | Schema cleaning removes `rate` inside `generate`, `is` inside `prerequisites`, and the unsupported `to` prefix contribution. Wallet Docs falls 219→212. Directory search stays 217 and takes the fifth slot. This is removed spurious evidence, class (a). |
| q-holdout-a-05-groth16-soroban | top3 | Wallet Docs loses schema-only gated admission from `proofs` and `soroban` keywords. Soroban Docs enters at 323 with whole description tokens `soroban` and `contract`. The ZK skill stays 164 and moves from rank 3 to 4. No new forbidden capture appears. The removed schema words are valid words. G5(a) alone does not justify their removal. The new Docs competitor has whole-word evidence under G5(b). |

a1/fresh: token traces (`tmp/rt-a/a1-fresh/token-traces.json`), selection traces (`tmp/rt-a/a1-fresh/loss-traces.json`).

| Lost row | Lost grades | Cause |
|---|---|---|
| q-soroban-oz-upgradeable-macro | top3 | Schema cleaning removes `open`→`op` and `for`→`fork` contributions from Soroban Docs. Its ungated score falls 457→448. The unchanged Scout score is 281. The 1.6 margin requires 449.6, so Docs moves below rank 3. This is removed spurious evidence, class (a). |
| q-soroban-x402-auth-entry-signing | top5 | Soroban Docs loses schema-only gated admission. Its schema keywords include `wallets`, `support`, `entry`, `signing`, and `payments`. Its ungated score stays 399. Fresh Scout descriptions and phrases fill five gated slots. The weakest selected score is 266, so 399 misses the 1.6 replacement margin. This is an admission loss, not a new score contribution. These valid schema words do not establish G5(a). |
| q-ti-friendbot-ratelimit-alternatives | top5, any5 | Schema cleaning removes `rate` inside `generate`, `is` inside `prerequisites`, and the unsupported `to` prefix contribution. Wallet Docs falls 219→212. Directory search stays 217 and takes the fifth slot. This is removed spurious evidence, class (a). |
| q-holdout-a-05-groth16-soroban | top3 | Wallet Docs loses schema-only gated admission from `proofs` and `soroban` keywords. Soroban Docs enters at 323 with whole description tokens `soroban` and `contract`. The ZK skill stays 164 and moves from rank 3 to 4. No new forbidden capture appears. The removed schema words are valid words. G5(a) alone does not justify their removal. The new Docs competitor has whole-word evidence under G5(b). |

a2/main: token traces (`tmp/rt-a/a2-main/token-traces.json`), selection traces (`tmp/rt-a/a2-main/loss-traces.json`).

| Lost row | Lost grades | Cause |
|---|---|---|
| q-soroban-oz-upgradeable-macro | top3 | Schema cleaning removes `open`→`op` and `for`→`fork` contributions from Soroban Docs. Its ungated score falls 457→448. The unchanged Scout score is 281. The 1.6 margin requires 449.6, so Docs moves below rank 3. This is removed spurious evidence, class (a). |
| q-ti-friendbot-ratelimit-alternatives | top5, any5 | Schema cleaning removes `rate` inside `generate`, `is` inside `prerequisites`, and the unsupported `to` prefix contribution. Wallet Docs falls 219→212. Directory search stays 217 and takes the fifth slot. This is removed spurious evidence, class (a). |
| q-holdout-a-05-groth16-soroban | top3 | Wallet Docs loses schema-only gated admission from `proofs` and `soroban` keywords. Soroban Docs enters at 323 with whole description tokens `soroban` and `contract`. The ZK skill stays 164 and moves from rank 3 to 4. No new forbidden capture appears. The removed schema words are valid words. G5(a) alone does not justify their removal. The new Docs competitor has whole-word evidence under G5(b). |

a2/fresh: token traces (`tmp/rt-a/a2-fresh/token-traces.json`), selection traces (`tmp/rt-a/a2-fresh/loss-traces.json`).

| Lost row | Lost grades | Cause |
|---|---|---|
| q-soroban-oz-upgradeable-macro | top3 | Schema cleaning removes `open`→`op` and `for`→`fork` contributions from Soroban Docs. Its ungated score falls 457→448. The unchanged Scout score is 281. The 1.6 margin requires 449.6, so Docs moves below rank 3. This is removed spurious evidence, class (a). |
| q-soroban-x402-auth-entry-signing | top5 | Soroban Docs loses schema-only gated admission. Its schema keywords include `wallets`, `support`, `entry`, `signing`, and `payments`. Its ungated score stays 399. Fresh Scout descriptions and phrases fill five gated slots. The weakest selected score is 266, so 399 misses the 1.6 replacement margin. This is an admission loss, not a new score contribution. These valid schema words do not establish G5(a). |
| q-ti-friendbot-ratelimit-alternatives | top5, any5 | Schema cleaning removes `rate` inside `generate`, `is` inside `prerequisites`, and the unsupported `to` prefix contribution. Wallet Docs falls 219→212. Directory search stays 217 and takes the fifth slot. This is removed spurious evidence, class (a). |
| q-holdout-a-05-groth16-soroban | top3 | Wallet Docs loses schema-only gated admission from `proofs` and `soroban` keywords. Soroban Docs enters at 323 with whole description tokens `soroban` and `contract`. The ZK skill stays 164 and moves from rank 3 to 4. No new forbidden capture appears. The removed schema words are valid words. G5(a) alone does not justify their removal. The new Docs competitor has whole-word evidence under G5(b). |

a3/main: token traces (`tmp/rt-a/a3-main/token-traces.json`), selection traces (`tmp/rt-a/a3-main/loss-traces.json`).

| Lost row | Lost grades | Cause |
|---|---|---|
| q-protocol-ledger-entry-types | top5 | The identity rule defers Docs because its operation names lack the query tokens. It promotes skills through the broad identity token `stellar`. These skills replace both Docs entries. Schema admission also removes the earlier gated Docs scores. The new identity preference is not subject evidence. G5 class (b) fails. |
| q-protocol-network-passphrases-list | top3, top5 | The identity rule defers protocol Docs despite whole description tokens `network`, `testnet`, and `futurenet`. It admits `list_documents` through `list` and skills through `stellar`. Lower-scoring generic entries remove all Docs hits. G5 class (b) fails. |
| q-scf-build-tranches | cardHit5 | The relaxed replacement margin admits `find_similar_scf_submissions` at 209 over `searchResearch` at 192. The promoted entry matches whole description tokens `scf` and `award`, plus identity token `scf`. It does not meet the unchanged 1.6 margin. The lost card follows the changed replacement rule. The promoted entry has whole-word evidence, but the threshold changed. |
| q-soroban-oz-upgradeable-macro | top3 | Schema cleaning removes `open`→`op` and `for`→`fork` contributions from Soroban Docs. Its ungated score falls 457→448. The unchanged Scout score is 281. The 1.6 margin requires 449.6, so Docs moves below rank 3. This is removed spurious evidence, class (a). |
| q-aas-claimable-predicates-expiry-reserves | top1, top3, top5, any1, any3 | The identity rule replaces the five Docs results with entries admitted through `stellar` and `list`. These identity tokens do not identify claimable-balance rules. Several promoted descriptions contain only `stellar` or no query token. G5 class (b) fails. |
| q-pc-bucketlist-vs-merkle-inclusion-proof | top1, top3, top5 | The identity rule promotes entries through `list` and `stellar`. It removes all five higher-scoring Docs results. The promoted descriptions lack the requested proof distinction. G5 class (b) fails. |
| q-pc-sequence-numbers-ordering-replace | top1, top3, top5, any1 | The identity rule removes all five Docs results. It promotes `compareHackathons` through the stemmed identity match `compared`→`compare`. It also promotes SCF operations through `submissions` and skills through `stellar`. These matches do not describe transaction ordering. G5 and G7 fail. |
| q-scf-submission-lifecycle-deadlines | cardHit5 | Short-page selection favors identity token `scf` over the higher-scoring `getRfps` result. The relaxed replacement rule also admits similar submissions through whole description tokens `scf`, `community`, and `round`. The expected RFP card leaves the page. The replacement no longer requires the 1.6 margin. The change affects short-page membership here. |
| q-holdout-a-05-groth16-soroban | top3 | Wallet Docs loses schema-only gated admission from `proofs` and `soroban` keywords. Soroban Docs enters at 323 with whole description tokens `soroban` and `contract`. The ZK skill stays 164 and moves from rank 3 to 4. No new forbidden capture appears. The removed schema words are valid words. G5(a) alone does not justify their removal. The new Docs competitor has whole-word evidence under G5(b). |
| q-holdout-a-10-oz-emergency-stop | forbiddenCapture | The identity rule admits setup and upgrade skills through `contract`. Whole description matches include `soroban`, `contract`, `open`, and `zeppelin`. The new setup skill is a forbidden capture for this question. G5 class (b) forbids this added capture. |
| q-holdout-a-14-poseidon-merkle | forbiddenCapture | The identity rule admits hackathon builds through `builds` and generic contract skills through `contract`. Higher-scoring Docs entries leave the page. The generic smart-contract skill adds a forbidden capture. G5 class (b) and G7 fail. |
| q-holdout-b-16-wallet-usdc-refresh | forbiddenCapture | The identity rule promotes `skills.stellar-dev.assets` at 368 through `asset`. It replaces `find_av_passages` at 474. Its description matches `asset` and `use`, but the new skill is a forbidden capture. G5 class (b) fails. |
| q-holdout-c-10-scf-positioning | top5, cardHit5, pass | The identity rule defers `scf-submission-radar` despite ten whole description matches. Its abbreviated identity lacks the expanded query words. It admits `stellar-content-auditor` through `stellar`, replacing the expected skill at a lower score. G5 class (b) fails. |
| q-holdout-c-18-dapp-invoke | forbiddenCapture, pass | Schema cleaning removes three Docs gated admissions. The identity rule then favors `build` and `contract` entries. Main adds hackathon builds; fresh adds `listContracts`. Both add the forbidden generic smart-contract skill. G5 class (b) and G7 fail. |

a3/fresh: token traces (`tmp/rt-a/a3-fresh/token-traces.json`), selection traces (`tmp/rt-a/a3-fresh/loss-traces.json`).

| Lost row | Lost grades | Cause |
|---|---|---|
| q-protocol-ledger-entry-types | top5 | The identity rule defers Docs because its operation names lack the query tokens. It promotes skills through the broad identity token `stellar`. These skills replace both Docs entries. Schema admission also removes the earlier gated Docs scores. The new identity preference is not subject evidence. G5 class (b) fails. |
| q-protocol-network-passphrases-list | top3, top5 | The identity rule defers protocol Docs despite whole description tokens `network`, `testnet`, and `futurenet`. It admits `list_documents` through `list` and skills through `stellar`. Lower-scoring generic entries remove all Docs hits. G5 class (b) fails. |
| q-scf-build-tranches | cardHit5 | The relaxed replacement margin admits `find_similar_scf_submissions` at 209 over `searchResearch` at 192. The promoted entry matches whole description tokens `scf` and `award`, plus identity token `scf`. It does not meet the unchanged 1.6 margin. The lost card follows the changed replacement rule. The promoted entry has whole-word evidence, but the threshold changed. |
| q-soroban-oz-upgradeable-macro | top3 | Schema cleaning removes `open`→`op` and `for`→`fork` contributions from Soroban Docs. Its ungated score falls 457→448. The unchanged Scout score is 281. The 1.6 margin requires 449.6, so Docs moves below rank 3. This is removed spurious evidence, class (a). |
| q-aas-claimable-predicates-expiry-reserves | top1, top3, top5, any1, any3 | The identity rule replaces the five Docs results with entries admitted through `stellar` and `list`. These identity tokens do not identify claimable-balance rules. Several promoted descriptions contain only `stellar` or no query token. G5 class (b) fails. |
| q-pc-bucketlist-vs-merkle-inclusion-proof | top1, top3, top5 | The identity rule promotes entries through `list` and `stellar`. It removes all five higher-scoring Docs results. The promoted descriptions lack the requested proof distinction. G5 class (b) fails. |
| q-pc-sequence-numbers-ordering-replace | top1, top3, top5 | The identity rule removes all five Docs results. It promotes `compareHackathons` through the stemmed identity match `compared`→`compare`. It also promotes SCF operations through `submissions` and skills through `stellar`. These matches do not describe transaction ordering. G5 and G7 fail. |
| q-scf-submission-lifecycle-deadlines | cardHit5 | Short-page selection favors identity token `scf` over the higher-scoring `getRfps` result. The relaxed replacement rule also admits similar submissions through whole description tokens `scf`, `community`, and `round`. The expected RFP card leaves the page. The replacement no longer requires the 1.6 margin. The change affects short-page membership here. |
| q-holdout-a-05-groth16-soroban | top3 | Wallet Docs loses schema-only gated admission from `proofs` and `soroban` keywords. Soroban Docs enters at 323 with whole description tokens `soroban` and `contract`. The ZK skill stays 164 and moves from rank 3 to 4. No new forbidden capture appears. The removed schema words are valid words. G5(a) alone does not justify their removal. The new Docs competitor has whole-word evidence under G5(b). |
| q-holdout-a-10-oz-emergency-stop | forbiddenCapture | The identity rule admits setup and upgrade skills through `contract`. Whole description matches include `soroban`, `contract`, `open`, and `zeppelin`. The new setup skill is a forbidden capture for this question. G5 class (b) forbids this added capture. |
| q-holdout-a-14-poseidon-merkle | forbiddenCapture | The identity rule admits hackathon builds through `builds` and generic contract skills through `contract`. Higher-scoring Docs entries leave the page. The generic smart-contract skill adds a forbidden capture. G5 class (b) and G7 fail. |
| q-holdout-b-16-wallet-usdc-refresh | forbiddenCapture | The identity rule promotes `skills.stellar-dev.assets` at 368 through `asset`. It replaces `find_av_passages` at 474. Its description matches `asset` and `use`, but the new skill is a forbidden capture. G5 class (b) fails. |
| q-holdout-c-10-scf-positioning | top5, cardHit5, pass | The identity rule defers `scf-submission-radar` despite ten whole description matches. Its abbreviated identity lacks the expanded query words. It admits `stellar-content-auditor` through `stellar`, replacing the expected skill at a lower score. G5 class (b) fails. |
| q-holdout-c-18-dapp-invoke | forbiddenCapture, pass | Schema cleaning removes three Docs gated admissions. The identity rule then favors `build` and `contract` entries. Main adds hackathon builds; fresh adds `listContracts`. Both add the forbidden generic smart-contract skill. G5 class (b) and G7 fail. |

**Interference sets**

a1/main new pairs: q-skill-scf-radar-positioning → scout.searchHackathonBuilds at 4.

a1/main improved ranks: none.

a1/fresh new pairs: q-defi-lending-scf-flagships → scout.searchHackathonBuilds at 4; q-defi-lumenloop-categories-vocab → scout.analyzeHackathonSubmissions at 5; q-skill-scf-radar-positioning → scout.searchHackathonBuilds at 4.

a1/fresh improved ranks: q-holdout-b-10-nextjs-payment → scout.searchHackathonBuilds at 3.

a2/main new pairs: q-skill-scf-radar-positioning → scout.searchHackathonBuilds at 4.

a2/main improved ranks: none.

a2/fresh new pairs: q-defi-lending-scf-flagships → scout.searchHackathonBuilds at 4; q-defi-lumenloop-categories-vocab → scout.analyzeHackathonSubmissions at 5; q-skill-scf-radar-positioning → scout.searchHackathonBuilds at 4.

a2/fresh improved ranks: q-holdout-b-10-nextjs-payment → scout.searchHackathonBuilds at 3.

a3/main new pairs: q-asset-sdex-vs-amm → scout.compareHackathons at 5; q-soroban-canonical-examples-source → scout.searchHackathonBuilds at 5; q-defi-bridge-evm-to-stellar-axelar → scout.compareHackathons at 5; q-pc-sequence-numbers-ordering-replace → scout.compareHackathons at 2; q-sor-build-target-wasm32v1 → scout.searchHackathonBuilds at 5; q-ti-cli-rust-windows-troubleshooting → scout.searchHackathonBuilds at 5; q-ti-java-sdk-wallet-feebump → scout.searchHackathonBuilds at 4; q-ti-stellar-lab-usage-and-new-ui → scout.searchHackathonBuilds at 4; q-skill-scf-radar-positioning → scout.searchHackathonBuilds at 4; q-skill-builder-quickstart-remittance → scout.searchHackathonBuilds at 5; q-holdout-a-04-oz-workspace-setup → scout.searchHackathonBuilds at 5; q-holdout-c-08-tipping-plan → scout.searchHackathonBuilds at 5; q-holdout-c-18-dapp-invoke → scout.searchHackathonBuilds at 4.

a3/main improved ranks: q-defi-sdex-offer-lifecycle → scout.searchHackathonBuilds at 3.

a3/fresh new pairs: q-asset-sdex-vs-amm → scout.compareHackathons at 5; q-defi-lumenloop-categories-vocab → scout.analyzeHackathonSubmissions at 5; q-soroban-canonical-examples-source → scout.searchHackathonBuilds at 5; q-defi-bridge-evm-to-stellar-axelar → scout.compareHackathons at 5; q-pc-l2-payment-channels-starlight → scout.compareHackathons at 5; q-pc-sequence-numbers-ordering-replace → scout.analyzeHackathonSubmissions at 1; q-sor-build-target-wasm32v1 → scout.searchHackathonBuilds at 5; q-ti-channel-accounts-throughput → scout.analyzeHackathonSubmissions at 5; q-ti-channel-accounts-throughput → scout.getHackathonSubmission at 3; q-ti-cli-rust-windows-troubleshooting → scout.searchHackathonBuilds at 5; q-ti-java-sdk-wallet-feebump → scout.searchHackathonBuilds at 4; q-ti-launchtube-mercury → scout.getHackathonSubmission at 4; q-ti-stellar-lab-usage-and-new-ui → scout.searchHackathonBuilds at 4; q-skill-scf-radar-positioning → scout.searchHackathonBuilds at 4; q-holdout-a-04-oz-workspace-setup → scout.searchHackathonBuilds at 5; q-holdout-a-08-contract-security-review → scout.analyzeHackathonSubmissions at 3; q-holdout-c-08-tipping-plan → scout.searchHackathonBuilds at 5.

a3/fresh improved ranks: q-scf-build-tranches → scout.searchHackathonBuilds at 2; q-skill-agentic-payments-paid-api → scout.getHackathon at 4; q-holdout-b-10-nextjs-payment → scout.searchHackathonBuilds at 3.

locateSource has zero production-fixture captures because G8 excludes it. The preserved v1 fixture supplies the exposure diagnostic.

a1 locator diagnostic: 6→6; new rows none; improved ranks none.

a2 locator diagnostic: 6→6; new rows none; improved ranks none.

a3 locator diagnostic: 6→9; new rows q-edge-inject-fabricate-citation-instruction, q-ti-historical-events-beyond-retention, q-ti-multisig-recover-lobstr-vault; improved ranks none.

**A5 and the amendment**

Amendment 1 withdraws the original A5 veto. Its historical results remain diagnostic only.

a1: old A5 FAIL; added cross-source losses: q-soroban-x402-auth-entry-signing (top5).

a2: old A5 FAIL; added cross-source losses: q-soroban-x402-auth-entry-signing (top5).

a3: old A5 FAIL; added cross-source losses: q-holdout-a-08-contract-security-review (top3).

**Validation**

| Design | Typecheck | Unit suite | Smoke | Build | Eval self-test | Catalog/spec regeneration |
|---|---|---|---|---|---|---|
| a1 | PASS | FAIL | PASS | PASS | PASS | PASS |

a1: ⎯⎯⎯⎯⎯⎯⎯ Failed Tests 9 ⎯⎯⎯⎯⎯⎯⎯; Test Files  5 failed | 137 passed (142); Tests  9 failed | 3044 passed | 3 expected fail (3056). unit log (`tmp/rt-a/a1-test.log`).

| a2 | PASS | FAIL | PASS | PASS | PASS | PASS |

a2: ⎯⎯⎯⎯⎯⎯ Failed Tests 10 ⎯⎯⎯⎯⎯⎯⎯; Test Files  7 failed | 135 passed (142); Tests  10 failed | 3043 passed | 3 expected fail (3056). unit log (`tmp/rt-a/a2-test.log`).

| a3 | PASS | FAIL | PASS | PASS | PASS | PASS |

a3: ⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯; Test Files  4 failed | 138 passed (142); Tests  8 failed | 3045 passed | 3 expected fail (3056). unit log (`tmp/rt-a/a3-test.log`).

The real scoring failures include schema-only admission expectations, the full-page total witness, and the service-quota witness.

The full suites also contain process-cleanup and timing failures. The logs preserve every failure. No test or expectation was changed.

The validation uses separate Git clones under `tmp/rt-a/check-*`, with Git environment variables removed. Smoke tests use fake keys.

An earlier validation passed builder Git variables into fixture tests. Those tests changed shared Git settings and created one local fixture commit.

I stopped that run. t16 restored the shared settings, branch, and index to d6ad7350. I then reran validation in isolated clones.

The aborted run is not validation evidence. No push or deployment occurred. The final tracked worktree is clean.

G13 passes: all designs keep synchronous, pure search without model calls. G14 does not apply. G15 passes: no test changed.

**Exact result files**

| Design/source | Result JSON | Exit |
|---|---|---|
| baseline/main | routing result (`tmp/rt-a/baseline/eval/results/routing-2026-11-02T21-35-09-648Z.json`) | 0 |
| baseline/fresh | routing result (`tmp/rt-a/fresh-gate-baseline/eval/results/routing-2026-11-02T21-35-16-112Z.json`) | 1 |
| a1/main | routing result (`tmp/rt-a/a1/eval/results/routing-2026-11-02T21-35-24-721Z.json`) | 0 |
| a1/fresh | routing result (`tmp/rt-a/fresh-gate-a1/eval/results/routing-2026-11-02T21-35-46-291Z.json`) | 1 |
| a2/main | routing result (`tmp/rt-a/a2/eval/results/routing-2026-11-02T21-36-01-534Z.json`) | 0 |
| a2/fresh | routing result (`tmp/rt-a/fresh-gate-a2/eval/results/routing-2026-11-02T21-36-17-312Z.json`) | 1 |
| a3/main | routing result (`tmp/rt-a/a3/eval/results/routing-2026-11-02T21-36-26-105Z.json`) | 1 |
| a3/fresh | routing result (`tmp/rt-a/fresh-gate-a3/eval/results/routing-2026-11-02T21-36-34-918Z.json`) | 1 |

G6 does not select a winner because no design passes. The strict-flip tables retain its comparison inputs.

Secret scanning: a1 PASS, a2 PASS, a3 PASS.

Final integrity receipt (`tmp/rt-a/final-integrity.json`) confirms the clean branch and matching result files.

**Supporting evidence**

a1: aggregate analysis (`tmp/rt-a/a1-analysis.json`), amended checks (`tmp/rt-a/a1-amended.json`), validation commands (`tmp/rt-a/a1-validation.json`).

a2: aggregate analysis (`tmp/rt-a/a2-analysis.json`), amended checks (`tmp/rt-a/a2-amended.json`), validation commands (`tmp/rt-a/a2-validation.json`).

a3: aggregate analysis (`tmp/rt-a/a3-analysis.json`), amended checks (`tmp/rt-a/a3-amended.json`), validation commands (`tmp/rt-a/a3-validation.json`).

Each `*-nooverride/receipt.json` names its G12 result file. Each `*/checks.json` contains all 149 probe pages.

Current contract SHA-256: `657ca2ed2b2563c9b2b07d67b29f103be141d6a0fb2defaa226b037dcf5c494b`.

No new upstream finding is established. The observed defects belong to Raven scoring and page selection.

Recommendation: reject a1, a2, and a3. The next authorized design must fix short-token evidence before changing service-slot selection.
