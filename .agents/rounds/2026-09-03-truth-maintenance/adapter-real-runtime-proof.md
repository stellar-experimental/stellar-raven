# Exact-old-runtime adapter proof

Date: 2026-09-03

## Result

The real candidate and exact baseline runtimes passed the free adapter proof.
No paid model call ran.

The runner and candidate revision was `65d2f98dd80305e9a2b9000c46e9a91ba0557cbc`.
The exact baseline revision was `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0`.
The adapter SHA-256 was `473690c7f10d5384be252bb97f9aa16ee88428d23589779289f5910c08e60303`.
The public adapter port was 8788.
The private Wrangler port was 8790.

## Clean topology

| role | worktree | revision | adapter mode |
|---|---|---|---|
| runner | `/private/tmp/stellar-raven-tm-runner` | `65d2f98dd80305e9a2b9000c46e9a91ba0557cbc` | both |
| candidate | `/private/tmp/stellar-raven-tm-candidate` | `65d2f98dd80305e9a2b9000c46e9a91ba0557cbc` | `verify-native` |
| baseline | `/private/tmp/stellar-raven-tm-baseline` | `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0` | `add-missing` |

Both server worktrees used `.dev.vars` bytes with SHA-256
`b1a85bbbf92700747e1f9a85aa6b919151d79b64ee0f28c93bf2b5078e311273`.
No secret value was printed.

## Candidate proof

The direct and adapted surfaces both reported SHA-256
`21a7c649c340119ab2a0f04347c8afee8aa4fb7ae68fc00c1fc876581ef955af`.
Both surfaces exposed two tools.

The direct and adapted initialize bodies were byte-identical.
Their SHA-256 was `0d73581f3449058a71c12d7b8963e428a31204525a91d390e68780d8fafdc4bb`.

The direct and adapted deterministic search bodies were byte-identical.
Their SHA-256 was `a4c029737317ddb0d48a4ee58da76c5336532b5e11fbf49e68e8723849bcb3cc`.

The preflight and postflight adapter attestations were byte-identical.
Their SHA-256 was `268efc875be951b11607ff21fc5a3f497338d6d0f05d8c83f0052d7bcc314422`.
The upstream process used PID 63580 and the clean candidate worktree.

## Exact baseline proof

The direct and adapted surfaces both reported SHA-256
`6cf5d1cdd3cd16c6b8bdb09a45917755cffaf0781f321734d7c9f7649a71d238`.
Both surfaces exposed two tools.

The direct initialize response omitted `serverInfo.sourceRevision`.
The adapted response added only revision `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0`.
Removing that field made the two parsed messages identical.
Their normalized SHA-256 was `b9c69383dbb578e51405775d936b634c1e3fe43c2ac3123d2e1c80f4f37e51ce`.

The direct and adapted deterministic search bodies were byte-identical.
Their SHA-256 was `7aef7a622654a7f54b73c5e5644e84d91f789d60c99798a99ed407301691bcb3`.

The preflight and postflight adapter attestations were byte-identical.
Their SHA-256 was `b68c2246e84aa1e0502c27a053367e3d8781f0f39bc529f6f2931d1604a11110`.
The upstream process used PID 67557 and the clean baseline worktree.

## Verdict

The adapter preserves candidate behavior and the exact old service behavior.
The old-mode metadata injection is narrow and attested.
The real-runtime proof gate passes.

PASS
