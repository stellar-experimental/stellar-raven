# Stellar Docs PR #2844 local repair

Base: `1e67426a49b7152f45c6ee559e964fc2f0cda1d9`.
Checkout: `/tmp/raven-execution-2026-09-16/docs2844-repair`.
Patch: `/tmp/raven-execution-2026-09-16/docs2844-repair.patch`.

The patch applies both existing ElliotFriend suggestions verbatim.
It removes the ambiguous exception wording from the two reserve paragraphs.
It preserves the reserve multiplier, subentry cap, links, and corrected arithmetic.
Only two lines change across two MDX files.

The parent read upstream CONTRIBUTING and the organization contribution rules.
No AGENTS.md or CLAUDE.md exists in this checkout.
Prettier passed for both files using the installed, pinned Prettier 3.9.4 binary.
`git diff --check` passed.
The first frozen install failed in the postman-code-generators dependency install script.
Its Yarn 1 subprocess rejected the parent pnpm packageManager declaration.
The next attempt sets the documented Yarn environment switch `SKIP_YARN_COREPACK_CHECK=1` for that process only.
This does not change dependency manifests or the lockfile.
The corrected frozen install passed.
The CI-equivalent CLI preparation, link correction, and full production build passed.
The build preserved `routes.txt`.
Generated CLI build changes were restored after validation.
The final patch still contains only the two intended paragraphs.
Build log: `/tmp/raven-execution-2026-09-16/docs2844-build.log`.

The independent technical review established the underlying reserve facts.
A separate final patch review remains pending.
No commit, push, review, comment, or merge occurred.
The existing PR still requires the upstream human approval gate.
