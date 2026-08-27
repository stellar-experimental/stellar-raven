# Corpus goldens mission report

## Result

The mission is complete on branch `lane/corpus-goldens-20260825`.

Commit: `cb14f1485aa8acee57307120060f4c20e781635c`

The worktree is clean after the commit.

The `golden-truth` workflow required live source triangulation and dated provenance. It also required a sibling consistency sweep.

`HERDR_ENV` was empty, so no Herdr control command ran. The required live checks ran directly against both named sources.

## Files changed

- `eval/qa/lint-corpus.mjs`
- `test/qa-corpus-lint.test.mjs`
- `test/fixtures/qa-corpus/authoring-warnings.json`
- `eval/qa/run-qa.mjs`
- `eval/qa/corpus/battery/defi-ecosystem/q-defi-wisdomtree-crdt.json`
- `eval/qa/corpus/battery/tooling-infra/q-infra-horizon-vs-rpc.json`
- `eval/qa/corpus/battery/tooling-infra/q-ti-rpc-gettransactions-pagination-xdr.json`
- `eval/qa/cases.json`
- `eval/qa/sample.json`

The compile script updated `eval/qa/sample.json` only with the new corpus digest. Its 30 sampled cases did not change.

## Change summary

### Corpus lint

The lint now warns when a key fact exceeds 90 characters.

The lint also warns when a key fact contains multiple clear predicates.

The lint warns when an avoid item specifies presentation, omission, or phrasing behavior.

Concrete false-content avoid items remain silent under this new check.

The lint warns for `Rejects`, `Separates`, and `Distinguishes` predicates with question-absent objects.

The lint warns when a key fact contains its own `truth.asOf` or verification date.

The lint warns when an `improvements/` root cause lacks a symmetric caution in `golden.notes`.

All new findings use warning severity. They do not fail CI.

The same authoring lint also runs for live contract validation.

### Lint fixtures

The new fixture contains positive and negative examples for each warning class.

The focused lint test reports 22 passing tests.

### Answering contract

Both `agentPrompt` branches now require dates for changeable rosters, statuses, and values.

The same line requires exact symbols, types, and formulas from tool results.

No other prompt semantics changed.

### Symmetric cautions

The new lint flagged two cases among the six named cases.

- `q-infra-horizon-vs-rpc`
- `q-ti-rpc-gettransactions-pagination-xdr`

Both cases reference filed `improvements/` defects and lacked the required exact caution.

Each case now states the canonical-source protection and the partial-grade cap.

The other four named cases did not meet the new root-cause condition. They remained unchanged.

### WisdomTree CRDT repair

The golden answer now gives the verified issuer and SAC.

The answer dates the metadata to 2026-08-26.

The key facts now give the exact issuer and SAC as separate facts.

The provenance note gives both live URLs, the fetch date, and both observed values.

The latest verification event now records both receipts and the sibling sweep.

The root cause is `freshness-drift`.

The sibling sweep checked these cases:

- `q-defi-rwa-overview`
- `q-rwa-projects-tokenizing-stellar`
- `q-hist-wisdomtree-rwa`

No sibling contains a conflicting CRDT issuer or SAC.

## WisdomTree verification receipts

### WisdomTree owner TOML

URL: `https://stellar.wisdomtree.com/.well-known/stellar.toml`

Fetch completed: `2026-08-26T16:54:45Z`

HTTP `Date`: `Wed, 26 Aug 2026 16:54:45 GMT`

HTTP `ETag`: `"2e6236f24338fd9ba7fc962d4f821396"`

Observed CRDT issuer:

`GBWMQUGPPLSC62YPGD5CEHATOQRQMNLNAV2TMEXJ4ZYOTY4TJD6J2P45`

### Horizon exact asset query

URL: `https://horizon.stellar.org/assets?asset_code=CRDT&asset_issuer=GBWMQUGPPLSC62YPGD5CEHATOQRQMNLNAV2TMEXJ4ZYOTY4TJD6J2P45`

Fetch completed: `2026-08-26T16:54:46Z`

HTTP `Date`: `Wed, 26 Aug 2026 16:54:46 GMT`

Observed asset code: `CRDT`

Observed issuer:

`GBWMQUGPPLSC62YPGD5CEHATOQRQMNLNAV2TMEXJ4ZYOTY4TJD6J2P45`

Observed SAC:

`CBQDK4Y3B2RYUSXE6JYYTHB6AIW655FPGE4OW7A2BWDZXZ5RALQ3UK3P`

The two live sources agree on the issuer.

Horizon returns the candidate SAC for that exact issuer.

The sources did not disagree, so the golden repair proceeded.

The extraction receipt is `/tmp/raven-qadeep/wisdomtree-live-sources.json`.

The raw fetch receipts are:

- `/tmp/raven-qadeep/wisdomtree-toml.txt`
- `/tmp/raven-qadeep/wisdomtree-toml.headers`
- `/tmp/raven-qadeep/horizon-crdt.json`
- `/tmp/raven-qadeep/horizon-crdt.headers`

## Lint counts

The initial lint reported 0 errors and 103 warnings.

The final diff-aware full lint reported 0 errors and 1,465 warnings.

The warning delta is +1,362.

New warning counts:

- Key facts longer than 90 characters: 801
- Key facts with multiple predicates: 192
- Negative predicates with question-absent objects: 131
- Presentation, omission, or phrasing avoid items: 156
- Self-referential snapshot dates: 12
- Missing symmetric cautions: 70

These new counts total 1,362 warnings.

The previous 103 warnings remain.

## Gate outputs

### Dependency and type setup

- `npm ci`: passed, with 310 packages added.
- The prepare hook could not update the parent Git config inside the sandbox.
- Dependency installation still exited with status 0.
- `npm run typegen`: passed and wrote `env.d.ts`.
- Wrangler could not write its user log outside the sandbox.
- Type generation still exited with status 0.

### Corpus gates

- `npm run eval:qa:compile`: passed.
- Compiled cases: 499.
- Corpus SHA-256: `85a05476b21308e5b7b4c24a5bc55a4dfb0b8b1e536063809b27b68b97366abb`.
- Compiled sample: 30 cases.
- `npm run eval:qa:lint -- --since HEAD`: passed with 0 errors and 1,465 warnings.
- `npx vitest run test/qa-corpus-lint.test.mjs`: passed, 22 tests.

`npm run eval:qa:register` did not run because `eval/qa/consistency-register.json` is outside this lane's owner surface.

### Repository gates

- `npm run typecheck`: passed.
- `npm test`: passed, 84 test files and 1,237 tests.
- `npm run build`: passed.
- Build upload size: 6,938.90 KiB.
- Build gzip size: 1,392.54 KiB.
- `npm run secrets:scan -- --tree`: passed with no leaks.
- The commit hook scanned staged changes and found no leaks.
- `git diff --check`: passed.

## Commit

Commit subject: `Improve QA corpus truth linting`

Commit SHA: `cb14f1485aa8acee57307120060f4c20e781635c`

No push occurred.

## Independent review fixes — 2026-08-26

This section supersedes the earlier root-cause and final lint-count statements.

Review-fix commit: `ec235d2c1de10ad4a3dc4bcbee90119bb03277f3`

### C-B2 provenance correction

The old CRDT issuer and SAC were transcription errors from the 2026-07-11 import.

The independent reviewer found that both old identifiers failed CRC16 validation.

The old SAC was also one base32 character short.

The root cause no longer says `freshness-drift`.

It now records the 2026-07-11 transcription error explicitly.

It references `.agents/TODO.md#prevent-invalid-stellar-strkeys-in-golden-imports`.

It also preserves these upstream references:

- `improvements/stellar-light-scout/sls-023-rwa-product-deployment-status.md`
- `improvements/lumenloop/ll-012-rwa-live-planned-recall.md`

`.agents/TODO.md` now tracks validation for imported account and contract strkeys.

The golden notes now include the required symmetric caution for the deployment-status dispute.

The live issuer and SAC values did not change during this review fix.

### Avoid-lint advisory

The non-content avoid lint now exempts answer-visible sourcing conditions.

The exemption covers provider, scope, observation date, date, and dated-source requirements.

It also covers the shared instruction to date the changeable part.

The fixture now has two warning examples and four silent examples.

The silent examples include concrete false content and three answer-visible sourcing forms.

### Final lint counts

The final diff-aware lint reports 0 errors and 1,390 warnings.

The review fix removes 75 non-content warnings from the earlier 1,465 count.

The final warning delta from the original 103-warning baseline is +1,287.

Final new warning counts:

- Key facts longer than 90 characters: 801
- Key facts with multiple predicates: 192
- Negative predicates with question-absent objects: 131
- Presentation, omission, or phrasing avoid items: 81
- Self-referential snapshot dates: 12
- Missing symmetric cautions: 70

These final new counts total 1,287 warnings.

### Final gate rerun

- `npm run eval:qa:compile`: passed.
- Compiled cases: 499.
- Final corpus SHA-256: `c29ae61708dc564c0cceb19fe4ae34c444961c297449ebed3bcad5ef41dfa846`.
- Compiled sample: 30 cases.
- `node eval/qa/lint-corpus.mjs --since e488c4f`: passed with 0 errors and 1,390 warnings.
- `npx vitest run test/qa-corpus-lint.test.mjs`: passed, 22 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 84 test files and 1,237 tests.
- `npm run build`: passed.
- `npm run secrets:scan -- --tree`: passed with no leaks.
- The commit hook scanned staged changes and found no leaks.
- `git diff --check`: passed.

`eval/qa/consistency-register.json` remains untouched, as directed.

Integration must re-stamp and reconcile the seven reopened clusters.

No push occurred.
