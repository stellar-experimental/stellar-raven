# Frozen repository-tooling recovery suite

This lane measures repository-only facts after adjacent or empty Stellar Docs evidence.
It stays separate from routing, QA, live-data, plan, agentic, and holdout lanes.

`cases.json` is the frozen `repository-tooling-recovery-v2` contract.
It contains 12 positive cases and eight negative controls.
The content digest and ordered-ID digest freeze its identity.
Change either digest only with a new contract version and a new decision record.
The suite carries no expected evidence label.
Blind review decides whether the first Docs result is `empty`, `adjacent`, `sufficient`, or `other`.

Run the free checks:

```sh
npm run eval:repo-recovery:lint
npm run eval:repo-recovery -- --gate
```

The free measurement checks exact recovery eligibility and the recovery-only discovery mechanism.
It fails if `scout.explainRepo` enters ordinary ranked discovery.
It does not claim cross-execute recovery, agent recovery, or answer quality.

The paid collector writes a raw `repository-recovery-collection-v1` artifact.
It never writes `answerReview`.
It reuses the QA answering parser, budget ledger, isolation guard, binary pin,
live-surface pin, server-process pin, and source-identity guard.

Run a paid collection only after separate authorization:

```sh
RECOVERY_SERVER_REVISION="$(git rev-parse HEAD)"
test -z "$(git status --porcelain=v1 --untracked-files=all)"
# Read the current surfaceSha256 from this report before setting the next value.
node eval/report-live-surface.mjs --port 8788
RECOVERY_SURFACE_SHA256="<surfaceSha256 from the report>"
npm run eval:repo-recovery:collect -- \
  --suite eval/repo-recovery/cases.json \
  --port 8788 \
  --model claude-sonnet-5 \
  --server-revision "$RECOVERY_SERVER_REVISION" \
  --expect-sha256 "$RECOVERY_SURFACE_SHA256" \
  --expect-agent-binary-sha256 625869b01e0050f260b2980fac248fd9cef9e462612bded4ec9d3d49ff8969a5 \
  --max-paid-calls 40 \
  --max-budget-usd 30.00 \
  --collector-author codex-gpt-5.6-sol-high \
  --orchestrator codex-gpt-5.6-sol-high \
  --output eval/repo-recovery/results/repository-tooling-recovery-v2-collection.json
```

Start `npm run dev:eval -- --port 8788` from the same clean revision first.
The collector accepts a paid-call cap from 1 through 40.
The collector requires the fixed `$30.00` cap in its CLI and exported path.

The raw artifact retains every paid answering attempt and transcript.
It also retains the current case when a post-call stop makes the run incomplete.
It also retains exact execute inputs and results, and projected search results.
Before the first paid answering call, the collector runs a zero-cost Raven readiness check.
It calls each distinct positive-suite Stellar Docs initial operation with a deterministic query.
It rejects unavailable operations and provider-error envelopes before it authorizes a paid call.
It accepts `soft-empty` because a valid zero-hit result proves service readiness.
`meta.docsReadiness` retains each operation ID, outcome, error kind, and numeric status.
It does not retain error messages or Docs hit payloads.
The check sends no credentials and does not print service responses.
Its deterministic projection normalizes code exactly like the executor.
It records static source order and exact argument source from that normalized code.
Static JSON-like arguments also appear under `operations[].args`.
It resolves direct calls, simple service aliases, destructured calls, and static computed calls.
An unresolved dynamic service call or a parse error makes the gate fail.

The collector permits one transport retry for each case.
The successful path is exactly 20 paid answering calls.
The maximum path is 40 paid answering calls.
It stops before another call on a call-cap or budget-cap breach.
It also stops on unsafe isolation, a Raven disconnect, or any identity change.
An identity stop records the failing surface, revision, and process observation when available.

Every paid collection requires these exact pins:

- a clean runner and server at the same 40-character revision;
- the bound server process and its worktree;
- the live MCP `surfaceSha256`;
- the answering executable SHA-256 and version;
- the answering model and prompt identity;
- one USD cap and one paid-call cap.

Prepare the independent review packet after collection:

```sh
npm run eval:repo-recovery:review -- \
  --collection eval/repo-recovery/results/<stamp>-collection.json \
  --prepare /tmp/repo-recovery-review-packet.json
```

An eligible independent reviewer must inspect every stored answer and transcript.
The reviewer writes a separate `repository-recovery-review-annotations-v1` JSON file.
The file identifies the exact raw collection SHA-256.
It records the reviewer identity, model, effort, and independence attestation.
Each case records the reviewed initial-evidence operation and an independent `answerReview`.

```jsonc
{
  "artifactSchema": "repository-recovery-review-annotations-v1",
  "collectionSha256": "<sha256(JSON.stringify(collection))>",
  "reviewedAt": "<ISO timestamp>",
  "reviewer": {
    "identity": "<agent session identity>",
    "model": "<reviewer model>",
    "effort": "high",
    "independent": true
  },
  "rows": [{
    "id": "rr-pos-example",
    "initialEvidenceReview": {
      "operationSequence": 1,
      "outcome": "adjacent",
      "evidence": ["The stored Docs result is related but omits the requested constant."]
    },
    "answerReview": {
      "correct": true,
      "grounded": true,
      "evidence": ["The answer matches the pinned source and cites its commit."]
    }
  }]
}
```

Use `operationSequence: null` and `outcome: "other"` when the required initial operation never ran.

Join the annotations without a model call:

```sh
npm run eval:repo-recovery:review -- \
  --collection eval/repo-recovery/results/<stamp>-collection.json \
  --annotations eval/repo-recovery/results/<stamp>-annotations.json \
  --output eval/repo-recovery/results/<stamp>-reviewed.json
```

The join rejects a reviewer string that equals or contains a disqualified actor string.
This is a mechanical check plus an independence attestation.
It cannot prove who operated the reviewer.
The operator must record the exact Herdr agent name and full model ID.
It rejects incomplete annotations and a collection hash mismatch.
It never overwrites the raw collection.
The grader reports `reviewReasons` when the reviewed artifact fails integrity checks.

The complete reviewed result has this shape:

```jsonc
{
  "artifactSchema": "repository-recovery-reviewed-v1",
  "contract": "repository-tooling-recovery-v2",
  "caseContentDigest": "sha256(JSON.stringify(cases))=<hex>",
  "orderedIdsDigest": "sha256(ids.join(\"\\n\"))=<hex>",
  "rows": [{
    "id": "rr-pos-example",
    "operations": [
      { "id": "stellarDocs.search_sdk_cli_tools_docs", "evidence": "adjacent" },
      { "id": "scout.explainRepo", "args": { "repo": "stellar/stellar-cli" } }
    ],
    "answerReview": {
      "correct": true,
      "grounded": true,
      "evidence": ["commit-pinned source reference"]
    }
  }]
}
```

A positive passes only when Docs comes first and its reviewed evidence is `empty` or `adjacent`.
The trace must then contain one pinned `scout.explainRepo` call in a later execute.
The reviewed answer must be correct and grounded.

The later-execute rule proves that the model inspected the first result before recovery.
A conditional recovery inside the first execute therefore does not pass.
This is an intentional false-negative boundary.
Static source order inside one execute is evidence only, not a runtime trace.

Unit and smoke suites enforce this boundary with a host receipt.
A completed qualifying authority operation can mint a five-minute receipt after its execute ends.
The receipt binds the authenticated identity, source, target, request, version, expiry, and nonce.
A later execute supplies it through the top-level `recoveryReceipt` field.
The host consumes it before the `scout.explainRepo` adapter call.
The receipt permits one matching call and rejects alteration, wrong ownership, expiry, and replay.
The execute result renders the target manifest description, input signature, and a copyable execute input beside the receipt.
Argument validation runs before receipt consumption, so a rejected argument set does not consume the receipt.

The frozen contract does not measure a later recovery detour after sufficient Docs evidence.
Each qualifying non-error Docs call can issue a receipt and add one R2 write.
Telemetry records a `recovery_receipt` event with `outcome: "consumed"`, source, and target.
It never records receipt content.
Monitor the pre-registered 0–5% `scout.explainRepo` operation-share band after deployment.
Do not change frozen cases or goldens to measure this risk.

A negative fails when `scout.explainRepo` occurs before Docs or a skill, or in the same execute.
The gate needs at least 10 positive passes and zero premature negative detours.

Grade a stored result with:

```sh
npm run eval:repo-recovery:grade -- <results.json> --gate
```

This command reads stored evidence only.
It accepts only `repository-recovery-reviewed-v1` artifacts.
Any operation-projection error makes the whole gate fail.

The current launch plan uses `claude-sonnet-5` for answers.
Two recent collect-only eight-case QA runs used the same model.
They used Claude Code `2.1.247` with wrapper SHA-256
`a8b9ec4b7c77b2538a5e299e8d900c3793f69d7101c0661cfd1146b76406c297`.
That cohort differs from the planned 20-case recovery lane on pinned Claude Code `2.1.251`.
The runs cost `$2.2461662` and `$2.3726368`.
Their eight-call means are `$0.280770775` and `$0.2965796`.
The 16 row costs have a `$0.0661584` minimum and a `$0.2353369` median.
Their maximum is `$0.5837418`, and their mean is `$0.2886751875`.
The 20-call path estimates `$5.6154155` through `$5.931592` from the two run means.
Repeating the observed row maximum for 20 calls gives `$11.674836`.
The higher run mean gives `$11.863184` for 40 calls.
Repeating the observed row maximum for 40 calls gives a conservative `$23.349672` bound.
Use a hard `$30.00` collector cap.
This adds `$6.650328`, or 28.4815%, above that conservative bound.
The collector rejects any other cap for this reviewed method.

The independent review is a separate method.
It needs its own authorization if its reviewer incurs a paid provider call.

All result JSON files remain local under `eval/repo-recovery/results/`.
This follows the local-only evidence rule in `eval/EVALS.md`.
Keep the collection, annotations, and reviewed artifact together in that directory.
Record their exact SHA-256 values and the final metrics in the dated round ledger.
