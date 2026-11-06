# sls-097 documentation-contract closure assessment — 2026-11-06

Author lane: t2r9. **Accept as a fixed-upstream candidate for the full original documentation defect.** A distinct review and the normal resolver/reference/comment gates still precede retirement. This report does not claim that partner ranking currently succeeds or that the model provider is available. No paid POST, model invocation, source/finding/golden edit, GitHub mutation, or nested agent occurred.

## Original scope, independently recovered

Read the current finding, the exact filed [issue1908](https://github.com/Stellar-Light/stellarlight/issues/1908), the [original immutable finding](https://github.com/stellar-experimental/stellar-raven/blob/b6844fc7faccf8dfe182190967afd828383dfeca/improvements/stellar-light-scout/sls-097-partner-match-undocumented-502.md), and the November2 independent filing review (`.agents/rounds/2026-11-02-upstream-followup/rv-fl-review.md`, sls-097). They consistently define the defect as an omitted 502 response in OpenAPI. The recommendation requires the existing JSON `error` field, the GET directory fallback, and agreement with the handler. It explicitly separates investigation of ranking failure from that contract correction.

The observed POST established an actual response that the contract failed to describe. Requiring a successful paid model call now would introduce an availability acceptance criterion that the original report expressly separated. The current live missing-502 predicate is directly testable by GET. This is a scope correction, not a waiver of live verification.

The earlier plain-text `error code: 502` response was already marked nonrecurring in the original filed evidence, which reports two later application/json captures. This review does not certify arbitrary proxy/gateway responses or assert that the earlier transport failure is repaired.

## Fresh live evidence and source corroboration

All reads succeeded on November6 at approximately14:16–14:19UTC. Compact durable receipts, exact relevant schema slices, fixture bodies/results and source hashes are under `research/audits/2026-11-06-remaining-sweep/docs-sls097/`. Full immutable source bodies can be re-fetched from the links below. The original scratch directory was removed after archiving and verification.

| Evidence | Independent observation |
|---|---|
| `GET https://stellarlight.xyz/api/openapi.json` | HTTP200; OpenAPI3.1.0, API1.9.122. `paths["/api/partners/match"].post.responses["502"]` exists. |
| Live502 content | `application/json` references `#/components/schemas/ErrorResponse`, an object requiring string `error`; no `unavailable` property is required. |
| Live502 description | Describes transient provider failure, timeout or unreadable output; instructs retry later or use `GET /api/partners` filters. Distinguishes provider refusal as503/unavailable instead. |
| [PR1929](https://github.com/Stellar-Light/stellarlight/pull/1929) | Actual API state: merged November5 15:38:28Z; merge `56f10c0e03ca93634c26faf3432b607fecbc5cd8`, head `5f401df06564c48b976aceade17c8f184c81012c`. Issue1908 closed/completed. |
| PR review provenance | Author `theboycoder`; no formal GitHub reviews and no issue1908 comments. Vercel preview comment is deployment automation, not an independent approval. PR body's old draft/pending-review prose is not current state. All9 head checks pass. |
| Merge snapshot vs live spec | The entire502 response object and referenced ErrorResponse schema match exactly between merge `specs/openapi.json` and the fresh live document. The complete documents differ because the deployed version is later. |
| Current handler at main `b067fe79bd93cafce9070d39971ddb36420a5195` | Same bytes as merge handler. Lines402–406 return the original exact JSON error string with status502; lines350–352 return malformed-output JSON with status502. |
| Adjacent handler distinction | The classifier sends transient provider failures to502, permanent provider refusal to503/unavailable, and unexpected service faults to500. No execution of those network branches is claimed. |

Live schema SHA-256: `4dd846f44ef80603d5ec7ba0ea810762f2a5b6df9235b64f19a1ede2fd00db2c`.
Current and merge handler SHA-256: `4839048cd463d5161597bf2de9b13ef27bda479cb80cb655d9a4aa0d1515123e`.
Original immutable finding SHA-256: `41c4953ceeecad2e6b2977cd69868a01259a04c2ae5f62dc3242be0784fd5049`.

Pinned implementation:
[match handler](https://github.com/Stellar-Light/stellarlight/blob/b067fe79bd93cafce9070d39971ddb36420a5195/src/app/api/partners/match/route.ts#L393),
[classifier](https://github.com/Stellar-Light/stellarlight/blob/b067fe79bd93cafce9070d39971ddb36420a5195/src/lib/model-failure.ts),
[resolving spec snapshot](https://github.com/Stellar-Light/stellarlight/blob/56f10c0e03ca93634c26faf3432b607fecbc5cd8/specs/openapi.json).

## Local fixture, actual results

`node tmp/sweep-2026-11-06/docs/sls097/validate.mjs` ran at14:18:06UTC. It extracted the original JSON from the finding's fenced evidence and used Ajv2020 against the freshly served502 schema with its live components. TypeScript5.9.3 AST inspection extracted both current `NextResponse.json` bodies with literal status502; it did not import or execute the network handler.

| Fixture | Result |
|---|---|
| Original capture `{"error":"Matchmaking hit a snag. Try the /partners directory filters."}` | Valid |
| Current source failed-model502 body | Valid; byte-equivalent JSON to original capture |
| Current source malformed-output502 body | Valid |
| `{}` | Rejected: required error absent |
| `{"error":502}` | Rejected: error must be string |
| Earlier plain-text body as a string | Rejected: object required; explicitly outside the original final JSON omission predicate |

The negative controls show the fixture is not an unconditional pass. `validation.json` records schemas, inputs, source line locations and errors. Initial fixture setup tried the repository's TypeScript7 package, which lacks the former parser API; rerunning with the already isolated TypeScript5.9.3 parser passed all6 controls. That setup error was not an upstream defect.

Minimal independent reproduction from the repository root, with no model request:

```sh
curl -fsSL https://stellarlight.xyz/api/openapi.json -o /tmp/sls097-openapi.json
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
const spec = JSON.parse(readFileSync('/tmp/sls097-openapi.json', 'utf8'));
const response = spec.paths['/api/partners/match'].post.responses['502'];
assert(response);
assert.match(response.description, /GET \/api\/partners filters/);
const schema = response.content['application/json'].schema;
const validate = new Ajv2020({strict:false}).compile({...schema, components:spec.components});
assert(validate({error:'Matchmaking hit a snag. Try the /partners directory filters.'}));
assert(!validate({}));
assert(!validate({error:502}));
console.log('Original JSON contract documented and validated; availability not tested.');
JS
gh api repos/Stellar-Light/stellarlight/pulls/1929
curl -fsSL https://raw.githubusercontent.com/Stellar-Light/stellarlight/b067fe79bd93cafce9070d39971ddb36420a5195/src/app/api/partners/match/route.ts
```

## Golden and persistent reference reconciliation

Ran full ID/path searches including hidden repo notes and read the owned case, rather than inferring from generated cases. Exact scan: `tmp/sweep-2026-11-06/docs/sls097/id-references.txt`.

- **Active finding and generated index:** remove only through the resolver after distinct acceptance; add a complete `improvements/resolved.json` receipt. No existing resolved sls-097 entry or per-finding intake override was found. The finding has no recurrence probe to remove.
- **Owned golden:** `eval/qa/corpus/battery/assets-anchors-seps/q-gap-match-partners-degrade.json` has2 active-file path references in `truth.verified.evidence` and `rootCause`. Repoint those provenance references to the immutable source/resolved receipt and state that the schema omission is resolved. Preserve the dated502 observation and the general fallback behavior. The answer, keyFacts and avoid clauses do not require model health or an undocumented502; no grading/answer change is justified. Rebuild `eval/qa/cases.json` with its generator after any owned-case reference edit.
- **Register/sentinels:** no match for sls-097, q-gap-match-partners-degrade or matchPartners in the current consistency register or source-sentinels JSON. No register/sentinel edit is indicated.
- **Current TODO:** replace the full-paid-trigger retirement blocker with the documentation-only resolution once independently accepted. Do not silently convert it into a model-availability success claim or a new paid task.
- **Current round tables:** other.md, other-actions.json and cross-review.md currently say inconclusive/full-trigger blocked. Append or reconcile the final scoped judgment and link this author report plus the distinct review; avoid leaving the round's final active count inconsistent.
- **Historical ledgers/research:** November2/3/5 ledgers, QA followup case-dispositions and prior reviews record their dates' evidence/classification. Keep those observations historical; repair navigability with an immutable source or resolved receipt where needed rather than rewriting the original502 outcomes.
- **Upstream completion:** a substantive verification/resolution comment on issue1908 with commit-pinned source and the free live schema result is still a coordinator step. There are currently no issue1908 comments. Record PR1929 as the resolving ref. No upstream comment or resolver action was performed here.

## Proposed receipt scope and completion boundary

Suggested live-recheck text:

> 2026-11-06T14:16:52Z: GET /api/openapi.json returned200, version1.9.122, and documents POST /api/partners/match HTTP502 as application/json ErrorResponse with required string error and GET /api/partners fallback. At14:18:06Z, the original November2 JSON and both current commit-pinned handler502 bodies validated against that live schema; malformed controls failed. The live response contract equals resolving PR1929's merged schema. This resolves the original documentation omission. No model-backed POST ran and no current ranking availability is asserted.

The full **original documentation-contract defect is fixed**, not merely one portion of an availability incident. Residual model health remains unknown and was expressly separate in the filed recommendation. Distinct reviewer t2r6 must independently repeat the free GET, original-body validation and scope judgment before the coordinator retires the record. Author investigation is complete; owned command terminal t2tp was removed. All remaining steps above are explicit lifecycle integration/reviewer responsibilities, not missing author evidence.

## Authorized local preparation follow-up

After this read-only assessment, root authorized the local fixed-upstream transition and provenance preparation. Distinct reviewer t2r6 accepted the original documentation scope. [Preparation and validation](sls097-preparation.md) records the stable changes and six passing gates. This supersedes the pending-distinct-review wording above; actual resolver and upstream comments remain root-owned. Compact evidence was replayed successfully before own sls097 scratch and command terminal cleanup.
