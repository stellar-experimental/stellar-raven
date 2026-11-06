# Offline full-transcript review

`blind-packets.mjs` accepts the complete **pending** matrix from the frozen
`orchestrate.readFinalsMatrix`, the original pinned native/Judge B receipts at the
paths in that matrix, the committed selection, and the frozen `eval/qa/cases.json`
bytes. It does not run a model, grade content, alter the journal, or contact a server.

Generate only after all 1,616 normalized cells are available:

```sh
node research/audits/2026-11-06-playground-final-resolution/blind-packets.mjs generate \
  tmp/playground-final/pending-matrix.json /path/to/frozen/eval/qa/cases.json \
  tmp/playground-final/blind-review
```

The output directory must be new; its parent must already exist. All CLI output
files are restricted to this repository's ignored `tmp/` or `eval/local-lanes/`
trees, created exclusively with mode 0600 in mode 0700 directories. Original
receipts are read in place. No raw payload belongs in tracked research files.

Give reviewers only their assigned JSON files from `blind-review/packets/`.
Keep `root-only-sidecar.json`, the matrix, and receipts with the coordinator.
“Root-only” means coordinator-only distribution, not Unix root ownership or an
access boundary against another process running as the same OS user.

Each of 101 packets contains 16 opaque cells, a quoted question and full golden,
and each cell's entire native answer and ordered tool transcript. The structural
allowlist excludes model/repeat/cost/latency/native filenames and A/B verdicts.
The native transcript schema is checked, with unknown fields rejected rather than
silently dropped. Tool-call IDs are replaced with per-cell transcript ordinals
(`t1`, `t2`, …); the tool-error path can otherwise expose provider-specific ID
prefixes. The private transcript hash still binds the original unmodified receipt.
Tool arguments/results, tool names, error flags, result sizes and answers remain verbatim: natural
self-identification or identity-like source text inside them is not redacted.
Thus structural blinding is guaranteed, semantic anonymity is not. Packet
instructions mark all evidence as untrusted quoted data, never commands to follow.

A private 32-byte random key makes source cell IDs opaque with HMAC-SHA256.
Sorting by those opaque IDs gives deterministic case-specific order for the same
key and inputs. Preserve the sidecar: a new generation uses a new key. The sidecar
maps every blind ID back to the original cell ID and case ID, native receipt hash,
answer hash, transcript hash, and nullable B receipt hash. Duplicate native
receipt hash + case ID pairs are rejected, as are missing/duplicate model/case/repeat
cells. The sidecar includes matrix, corpus and packet hashes.

Reviewers produce **one JSON file per packet**, shaped as follows (repeat the cell
object for all 16 distinct cells; placeholders are not valid reviews):

```json
{
  "contract": "playground-blind-review/v1",
  "packetId": "packet-001",
  "packetSha256": "SHA256_OF_JSON_STRINGIFY_PARSED_PACKET",
  "cells": [{
    "cellId": "OPAQUE_CELL_ID",
    "score": "partial",
    "safety": "not-applicable",
    "reason": "Evidence-based explanation covering this answer and full transcript.",
    "reviewer": "reviewer identity, model and effort where applicable",
    "reviewed": true
  }]
}
```

Score is `correct`, `partial`, or `wrong` when `answerFailure` is null; it must be
JSON null otherwise. Answer failure is copied from the frozen matrix, never
classified here. Safety is `pass` or `fail` on the safety case; `fail` or
`not-applicable` elsewhere. Every cell needs a nonblank reason and reviewer.
No code assigns defaults, interprets transcript text, or infers any judgment.
Reviewer identity is an attestation string, not cryptographic authentication.

The packet hash is SHA-256 of UTF-8 `JSON.stringify(JSON.parse(packetBytes))`,
without pretty-print spaces or trailing newline. Reviewers may compute it locally
without changing the packet; the coordinator also retains it in the sidecar.

```sh
node research/audits/2026-11-06-playground-final-resolution/blind-packets.mjs join \
  tmp/playground-final/pending-matrix.json /path/to/frozen/eval/qa/cases.json \
  tmp/playground-final/blind-review tmp/playground-final/reviews \
  tmp/playground-final/adjudications.json
```

The joiner rereads and hashes original native and B receipts, rechecks frozen cases,
regenerates packets, and compares the entire sidecar and each packet. It requires
all 101 reviews, exactly 16 distinct expected cells each, and matching packet hashes.
Keep only the 101 packet JSON files and 101 review JSON files in their respective
directories; a stray JSON file fails the denominator check. Record the identity
and effort of each assigned reviewer in the round ledger.

It emits `playground-finals-adjudication/v1` with original source cell IDs and the
four source hashes for the frozen reader. The coordinator should pass that result
back through `orchestrate.mjs matrix --journal ... --adjudications ...` before any
decision. Inputs must come from the trusted coordinator: self-consistent replacement
of every root-held input is outside the hash-checking trust boundary.

Tests (synthetic source receipts only):

```sh
node_modules/.bin/vitest run research/audits/2026-11-06-playground-final-resolution/blind-packets.test.mjs
```
