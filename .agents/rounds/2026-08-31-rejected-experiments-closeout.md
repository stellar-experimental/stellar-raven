# Rejected experiments closeout — 2026-08-31

## Scope

This is a record-only closeout on `origin/main`.
It records two rejected experiments and their next triggers.
It does not ship either implementation or any local result artifact.

| Experiment | Pull request | State | Snapshot commit | Independent review |
| --- | --- | --- | --- | --- |
| Repository tooling recovery v2 | https://github.com/stellar-experimental/stellar-raven/pull/102 | Closed without merge | `6baec0a4a1e0fc5b84ccce30a656af7f9ddcaa68` | PASS; SHA-256 `52ce44f14fb762439ab28e53860080d165e36e601fd4be97120ca4cb566a1930` |
| QA capability-boundary prompt | https://github.com/stellar-experimental/stellar-raven/pull/103 | Closed without merge | `fb9a35ebb5f76bad773050c2977deabe77ab74da` | PASS; SHA-256 `b19331cc469643e788a6d9c7b75481e552115a48d8fcadf21cf90e8aac11a8d5` |

## Repository tooling recovery v2

The frozen contract was `repository-tooling-recovery-v2`.
It returned 9 of 12 positive recoveries and 0 of 8 premature detours.
It had zero projection errors.
Its identity and review checks passed.

The reviewed result had 18 of 20 correct answers and 20 of 20 grounded answers.
It used 20 paid calls with zero retries.
It cost `$4.5646914`.

| Artifact | SHA-256 |
| --- | --- |
| Canonical collection | `da4a4e245b05c737023d6e858e8b8866b00375649b0a90b2be0a1b68da6424da` |
| Local collection | `4f4ee34353b236dd6d00ec896fa7888b5c19702a76a0809a67a9f35246e68bb8` |
| Local review packet | `08a41ee2cad8822043b5263bfbcc8f28378e0fd85dc1499dd0710e56aefd1c33` |
| Local annotations | `08691d62a8f501d57684866d56e00d801474799754544308df2684e3bf24a207` |
| Local reviewed result | `e53a83952e5701ef49a33c955e59ebfa002413b542937c22c49a166f8e0a7ac0` |

`sls-080` is the reported-upstream active Scout finding from this result.
The v2 collection recorded 1 stale numeric answer in 12 successful repository answers.
The free Horizon probe also returned `25`.
It ran at `2026-08-31T01:42:10.098Z` with scanned ref
`82660510ecda7fd365a14d08badb9d85fa22bc32`.

The finding was filed at https://github.com/Stellar-Light/stellarlight/issues/1134.
GitHub read back the issue as OPEN with the expected title.
GitHub reports `createdAt: 2026-08-31T02:49:22Z`.
The body contains `generated-by-stellar-raven`, the active main source link, and the immutable `b59517d` snapshot.
The body also contains the full evidence and the resolution handoff.

No product change ships from this experiment.
Do not run another paid collection until the DeepWiki answer equals the source value at the
response's own `scannedRef`. The source value was `28` for this reading.
The ranking selection trigger remains three qualifying positive operation-selection misses after
recovery. The Docs-versus-repository conflict stays monitor-only until three successful-recovery
recurrences. Each recurrence is a dated re-execution of `sls-080`. It must use the required
Docs-first, inspect, then one-later-`scout.explainRepo` sequence. Record the same finding identity,
case ID, result stamp, and transcript.
The `stellar-cli` fallback candidate did not reproduce and has no active finding.
`sls-081` is a withdrawn historical identifier.
The next Scout finding uses `sls-082`.
G1 remains a pre-registered v3 candidate only.

## QA capability-boundary prompt

Method 1 produced `2026-08-30T17-41-18-variantA.json`.
Its SHA-256 is `b6a596fb370817136a4b7f5afa6aa4d8f6a9e92a2355f1d807d179c479e3a256`.
It used two answering calls and six judge calls.
It cost `$0.4597096`.

The artifact is invalid as a measurement because its inherited environment hash differed from the
registered value. Its five-track T3 safety failure is one observation.
The external lookup control was partial.
The capability-boundary Method 2 was the deterministic sample-30 headline with an offline plan
regrade. It did not run. This result does not authorize the capability-boundary Method 2. Its
authorization is spent. The five-track Method 2 is separate and complete.

No prompt change ships from this experiment.
The next attempt needs a stronger mechanism and a new pre-registered diagnostic.
It needs both before any headline sample.
The Friendbot network-context failure stays monitor-only.
Judge stability and the owner product-loss margin remain open.

## Evidence retrieval

Both snapshot commits are outside current local and remote branch ancestry. Closed pull-request
refs preserve a retrieval path while GitHub retains them:

```sh
git fetch origin pull/102/head
git fetch origin pull/103/head
```

PR #102 contains `.agents/rounds/2026-08-30-repository-tooling-recovery.md` and the G1 record at
`6baec0a4a1e0fc5b84ccce30a656af7f9ddcaa68`. PR #103 contains
`.agents/rounds/2026-08-30-qa-prompt-boundaries.md` at
`fb9a35ebb5f76bad773050c2977deabe77ab74da`.

The 2026-09-01 audit did not find the local Method 1 or recovery-v2 result artifacts. Their exact
SHA-256 values above remain the durable artifact identities. The current queue carries the
load-bearing mechanism, gate, and trigger facts.

## Outcome

The next work uses the current queue order in `.agents/NEXT.md`.
This record preserves the evidence without preserving either rejected implementation.
