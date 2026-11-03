# sd-048 PR package (draft; not pushed, not opened)

Target: `stellar/stellar-protocol`, base `master` at `ded60f56201478b82b341151a6c44f7d1a4aec6e`
(2026-11-03). Local clone with the change: `/private/tmp/rv-up/tmp/stellar-protocol`, branch
`raven/sd-048-cap-0075-poseidon2-degree` (uncommitted edit). Patch file:
[`sd-048-cap-0075.patch`](sd-048-cap-0075.patch).

## Defect on current master (verified 2026-11-03T15:10Z)

`core/cap-0075.md` at `ded60f56` (last change to the file: `d186cf31`, #1996, 2026-08-20):

| line | text |
|---|---|
| 61 | `poseidon_permutation` docs: "d: S-box degree (5 for BLS12_381/BN254)" (backticks omitted) |
| 78 | `poseidon2_permutation` docs: "d: S-box degree (3, 5, 7, or 11)" (the defect) |
| 124 | "Only d=5 is supported, which is the standard choice for both BLS12-381 and BN254." |
| 157 | Error conditions: "d is not 5" |
| 239 | "minimal parameter validation (vector lengths, supported S-box degree and state sizes)" |

No other line in `core/` contains "3, 5, 7, or 11". No open stellar-protocol PR touches CAP-0075.

Source of truth, `stellar/rs-soroban-env` `main` at `0c99950e96128beba3319aa96b116646ce974e69`:

- `soroban-env-common/env.json` line 2725 (`poseidon2_permutation`): "d: S-box degree (5 for BLS12_381/BN254)".
- `soroban-env-host/src/crypto/poseidon/mod.rs` line 19: `pub(crate) const SUPPORTED_SBOX_DEGREES: [u32; 1] = [5];`
- `soroban-env-host/src/crypto/poseidon/poseidon2_params.rs` lines 32 to 35: a degree that is not in
  `SUPPORTED_SBOX_DEGREES` fails with "Poseidon2: unsupported s-box degree".

## Repository rules checked

- `CONTRIBUTING.md`: CAP changes follow `core/README.md`. `./bin/prettier.sh` runs `yarn sep-prettify`;
  the prettier workflow runs only on `ecosystem/*.md`, so it does not apply to this file.
- `core/README.md` line 20 to 21: "A final CAP should only be updated to correct errata." CAP-0075
  is `Status: Final`. This change is errata only. It does not change semantics: the CAP text, the
  ABI, and the host already accept only degree 5.
- `.github/copilot-instructions.md`: surgical edits to Final CAPs; keep preamble, status, and dates.
  The patch changes one string and nothing else.
- CI on `core/`: `mddiffcheck.yml` (checks diff blocks against stellar-core and stellar-xdr; this
  edit is in a JSON block, not a diff block) and `lineendings.yml` (LF only; the file has 0 CR bytes
  after the edit).
- No PR template exists. Precedent: #1996 ("Correct CAP-0075 interface errata"), an external
  contributor PR. The CAP owner `jayz22` approved and merged it; its body was "Fixes #1980" plus
  "cc" to the owner.
- `kalepail` has `write` permission on `stellar/stellar-protocol`, and the fork
  `kalepail/stellar-protocol` exists. Either a branch on the upstream repo or a fork branch works.

## Patch

~~~~diff
diff --git a/core/cap-0075.md b/core/cap-0075.md
index 98f98fd..810851a 100644
--- a/core/cap-0075.md
+++ b/core/cap-0075.md
@@ -75,7 +75,7 @@ Two new functions with export names `p` and `q` in the crypto module (`c`) are a
       { "name": "round_constants", "type": "VecObject" }
    ],
    "return": "VecObject",
-   "docs": "Performs Poseidon2 permutation on input vector. `input`: vector of field elements (length `t`). `field`: `BLS12_381` or `BN254`. `t`: state size. `d`: S-box degree (3, 5, 7, or 11). `rounds_f`: number of full rounds (must be even). `rounds_p`: number of partial rounds. `mat_internal_diag_m_1`: internal matrix diagonal minus 1 as `Vec<Scalar>` (length `t`). `round_constants`: (`rounds_f` + `rounds_p`)-by-`t` round constants matrix as `Vec<Vec<Scalar>>`. Returns output vector after permutation.",
+   "docs": "Performs Poseidon2 permutation on input vector. `input`: vector of field elements (length `t`). `field`: `BLS12_381` or `BN254`. `t`: state size. `d`: S-box degree (5 for `BLS12_381`/`BN254`). `rounds_f`: number of full rounds (must be even). `rounds_p`: number of partial rounds. `mat_internal_diag_m_1`: internal matrix diagonal minus 1 as `Vec<Scalar>` (length `t`). `round_constants`: (`rounds_f` + `rounds_p`)-by-`t` round constants matrix as `Vec<Vec<Scalar>>`. Returns output vector after permutation.",
    "min_supported_protocol": 25
 }
 ```
~~~~

## PR title

```
CAP-0075: list only S-box degree 5 in the poseidon2_permutation docs
```

## PR body

```markdown
The `poseidon2_permutation` interface docs in CAP-0075 list `d` values 3, 5, 7, and 11. This PR changes that text to degree 5 only. The new text matches the `poseidon_permutation` entry on line 61.

The rest of the CAP already supports only degree 5:

- "Permutation Parameters" says: "Only d=5 is supported".
- "Error Conditions" says the host traps when `d` is not 5.

The shipped host agrees:

- [`env.json` line 2725](https://github.com/stellar/rs-soroban-env/blob/0c99950e96128beba3319aa96b116646ce974e69/soroban-env-common/env.json#L2725) documents `d: S-box degree (5 for BLS12_381/BN254)`.
- [`poseidon/mod.rs` line 19](https://github.com/stellar/rs-soroban-env/blob/0c99950e96128beba3319aa96b116646ce974e69/soroban-env-host/src/crypto/poseidon/mod.rs#L19) sets `SUPPORTED_SBOX_DEGREES` to `[5]`.
- [`poseidon2_params.rs` lines 32 to 35](https://github.com/stellar/rs-soroban-env/blob/0c99950e96128beba3319aa96b116646ce974e69/soroban-env-host/src/crypto/poseidon/poseidon2_params.rs#L32-L35) rejects other degrees with "Poseidon2: unsupported s-box degree".

This is an errata fix to a Final CAP. It does not change behavior.

Refs stellar/stellar-protocol#2010

cc @jayz22
```

Notes for the owner before posting:

- The `cc @jayz22` line notifies the CAP owner, as in #1996. Remove it if a quieter PR is preferred.
- "Refs" does not close #2010, which is already closed by the stale bot. Do not write "Fixes" or
  "Closes", and do not reopen #2010.
- After the merge: re-run the `sd-048` evidence command against `master`, then follow the resolver
  path with a distinct reviewer. Post the resolution comment on #2010 and pass the PR as
  `--resolving-ref`.
