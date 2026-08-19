# Skill pin review ledger

Skill bodies are **prompt input**: what they say becomes instructions the model follows. They are
not vendored here, so a re-pin commit shows only hash changes — the text itself never appears in
`git diff` the way it did when the bodies were checked in. This ledger is the replacement gate.

**Every commit that changes what `MANIFEST.json` serves must add an entry here naming the new
`sel:` digest.** `scripts/check-pin-review.mjs` enforces it in CI, and it is a review record, not
a formality: the entry attests that a human read the body diff `ecosystem-skills/update.sh`
printed.

The `sel:` digest covers a source's whole selection — commit, skill names, file paths, and per-file
blob shas — not just its commit. Retargeting an entry to a different file inside the same pinned
tree, or adding/dropping a selected skill, changes which prompt input is served without moving the
commit, so the commit alone is not what the gate can key on. Print the current digests with
`node scripts/check-pin-review.mjs --digests`.

Three details the gate is strict about, each because the loose version was walkable:

- **The entry must be NEW in this diff.** An attestation that already existed at the base ref does
  not count. Reverting to a previously reviewed selection is still a decision to serve those bytes
  again today.
- **It must be a real `sel:` token.** A bare 12-hex string is not enough — this file is full of
  40-hex commit SHAs that contain one.
- **Removing a source needs an entry too**, since it changes everything that source served. Record
  it as `removed: <source-id>` with the reason.

Do **not** paste skill text into this file — that would re-create the vendored copy this design
removes. Summarize what changed and why it is safe to serve.

## Procedure

```bash
./ecosystem-skills/update.sh             # re-pins, prints the old->new body diff AND the new digests
node scripts/diff-pins.mjs <old> <new>   # re-print the diff on demand
node scripts/check-pin-review.mjs --digests   # the sel: digests to record
# then add an entry below, rebuild the generated artifacts, and commit together
```

What to look for in the diff, beyond "is it accurate": instructions that try to change the
agent's behavior outside the skill's topic, references to non-exposed operations or retired
skills, claims about this gateway's own capabilities, and anything resembling injected
instructions ("ignore previous", "you must", credentials, URLs to fetch).

## Entries

### 2026-07-30 — baseline (no pin movement)

| Source | Pinned commit | Selection | Reviewed |
| --- | --- | --- | --- |
| `lumenloop` | `d92c56bda17ab702d3202335cfe814d64e70e191` | `sel:a9447c2ec930` | baseline |
| `openzeppelin-stellar` | `6f215af60eb60017ab1a933ce9d22a479cd42b26` | `sel:4c4191f30c20` | baseline |
| `stellar-dev` | `52baea1d8cb1aa9441004ce44b723f55cbc90901` | `sel:d5e23e3d6eaa` | baseline |
| `stellar-light` | `f2659ff63cd891d48f6adeb024de7753bd9efb9f` | `sel:3ad627307640` | baseline |

These are the pins in force when the ledger was introduced; they were already serving and are
recorded here so the CI check has a starting state. The gate applies to every change after this
entry. The `sel:` column was added when the gate widened from commit-only to the whole served
selection; the digests are of the same pins already listed, not a re-pin.

### 2026-08-10 — stellar-dev re-pin (drift issue #19)

| Source | Pinned commit | Selection | Reviewed |
| --- | --- | --- | --- |
| `stellar-dev` | `9e3d3fe0de8587205b020e0148ea67525e38e494` | `sel:5f80e607aef7` | read + independently reviewed |

The other three sources did not move; their selections are unchanged from the baseline entry.

**What the selection gained.** A new skill, `cross-chain` (`SKILL.md`, `axelar.md`, `cctp.md`) —
CCTP V2, Axelar GMP/ITS, and NEAR Intents routing for Stellar. This is a new **exposed** surface:
the served skill count goes 19 → 20 and the catalog goes 276 → 283 entries (18 → 19 searchable
skills, 204 → 210 sections). It is filed into the `stellar-appdev` group in `groups.json`.

**What changed in already-served bodies.**

- `zk-proofs` — a status rewrite, not a rewording: CAP-0074 (BN254 base ops) and CAP-0075
  (Poseidon/Poseidon2 permutations) move from "proposed" to Final/Protocol 25+, CAP-0080 (BN254 G1
  MSM, Fr arithmetic, on-curve checks) is added at Protocol 26+, and the Noir and RISC Zero
  walkthroughs flip from attestation-oracle workarounds to on-chain verification.
- `standards` — the same CAP status corrections, plus a new K2 money-market section carrying ~20
  pubnet contract addresses dated 2026-07-31.
- `agentic-payments` — MPP "Channel mode" renamed "Session mode" (channel-backed), plus corrected
  `mppx` import paths, per-route handlers, and SDK version-alignment notes.
- `data` — drops the flat "Infinite Scroll queries back to genesis" claim; deep `getLedgers`
  history is now correctly framed as a property of the provider's data lake, bounded by
  `getHealth().oldestLedger` on a plain instance.

**Why it is safe to serve.** Reviewed by the author against the printed body diff and
independently by a separate agent (Solo scratchpad 795, Lane A) reading the old/new bodies
directly. No behavior-hijack directive, no "ignore previous"-class instruction, no literal
credential, and no reference to a non-exposed operation or a retired skill; every related-skill
link resolves to an exposed manifest entry, and the companion files are emitted as
`skills.stellar-dev.cross-chain#file:axelar.md` / `#file:cctp.md`. The gateway self-description in
`standards` is pre-existing, accurate, and unchanged by this pin. The CAP status claims were
corroborated against primary sources — the stellar-protocol CAP index and CAP documents, the
official ZK docs, and a live Horizon root reporting `current_protocol_version: 27` — rather than
taken on the vendor's word; the Nethermind UltraHonk and RISC Zero verifier claims were confirmed
at source level (the contracts import the CAP-0080 host functions they say they need) but not
built or executed here.

**Bounded risks accepted, recorded so they are not rediscovered as surprises.** Three of the new
and changed bodies direct the reader to re-check mutable external sources (Circle's token/Fast
matrices, the NEAR 1Click API docs, Axelar's on-chain registries and Axelarscan, K2's contract
page). That is correct staleness hygiene for fast-moving rails, but it is external prompt input and
does not outrank system or developer instructions. `cctp.md` also points at a third-party demo repo
with an install-and-run command — the only supply-chain execution prompt in the selection. The K2
addresses are upstream's word as of their stated date; treat the linked contract page as the source
of truth before anything hard-codes them.

### 2026-08-14 — stellar-dev and stellar-light re-pin (drift issue #20)

| Source | Pinned commit | Selection | Reviewed |
| --- | --- | --- | --- |
| `stellar-dev` | `812598a8538dc5479196145d2175b4a991bee1d9` | `sel:7aa692ae3f4e` | read in full |
| `stellar-light` | `0d169e4ab64ddcc87ef61cc8e1737151fd39a05e` | `sel:3c790de8392e` | read in full |

The `stellar-dev` selection changes 18 files. It splits four large skills into eight companion
files. It adds trustline-removal checks, durable Horizon cursor guidance, and contract-build
diagnostics. It also shortens the `zk-proofs` routing description.

The `stellar-light` selection changes two reference files. It documents new read-only filters,
code-evidence fields, confidence semantics, and current `smart-contracts` skill links.

The full old-pin to new-pin body diff was reviewed. The changed text contains no credential,
behavior-hijack instruction, retired skill, or non-exposed Raven operation reference. The new
companion files preserve the existing topics and make section reads smaller.

### 2026-08-19 — stellar-light re-pin

| Source | Pinned commit | Selection | Reviewed |
| --- | --- | --- | --- |
| `stellar-light` | `2eebd982dc31c20198f59b40e29c83dcf71f688b` | `sel:cdb4d944079c` | read in full |

The other three sources did not move. Their selections remain unchanged from the preceding entry.

The new selection documents useful read-only composite operations. Raven now exposes the
Hackathon Build Brief.

The raw skill also advertises `POST /api/feedback` and `GET /api/feedback`. The prior selection
already advertised both operations. Raven excludes the write because it is side-effecting. Raven
also excludes its schema-only read because the write is unavailable.

Raven applies one manifest-derived exposure filter to every selected file at build and read time.
The filter removes a complete Markdown section, table row, or list item that names an excluded
Scout path. It fails closed for an unsafe prose shape. This selection passed the guard across all
four files. Raven serves no feedback workflow from the pinned body.
