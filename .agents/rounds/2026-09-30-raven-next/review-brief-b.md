# Review brief — PR B (dependency audit fix), round raven-next 2026-09-30

You are an independent reviewer. The author and orchestrator is `raven-next` (Claude Fable 5.1).
Review the branch `chore/audit-fix-fast-uri-ip-address` against `origin/main` (`6dd94394`) in the
worktree `/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/raven-next-b`.

Read `AGENTS.md` and the "Dependencies" section of `.agents/TODO.md` first.

## What changed

1. `package-lock.json` — `npm audit fix` moved `fast-uri` 3.1.7 → 3.1.8 and `ip-address` 10.5.0 →
   10.7.2. No `package.json` change. Twelve lockfile lines.
2. `research/audits/2026-09-17-dependency-audit/README.md` — a "Recheck 2026-09-30" section.
3. `.agents/TODO.md` — the dependency item records the recheck and the `undici` blocker.

## What to verify, independently

- Reproduce the audit state: `npm ci`, `npm audit --json | jq .metadata.vulnerabilities` before
  (on `origin/main`) and after (on this branch). Confirm the lockfile diff is exactly the two
  packages and that no other resolution moved.
- Confirm the `undici` claim: both installed `miniflare` copies pin `undici` exactly at `7.29.0`
  and `@ai-sdk/provider-utils` declares `^7.28.0`, so `npm update undici` changes nothing. Say
  whether a non-override path to 7.30.0 exists that the author missed.
- Check that the advisory ranges quoted in the README section match `npm audit --json`.
- Run `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:smoke`, and report the
  exact results. `npm run secrets:scan -- --tree` too.
- Check every edited sentence for the writing rules in `AGENTS.md` and for claims the diff does not
  support.

Do not edit repository files. Do not post anything upstream. Do not run paid evaluations.

## Output

Write your findings to `tmp/review-b-<your-lane>.md` under the worktree root (the Codex sandbox
cannot write under `.agents/`). Use this shape: a verdict line (`accept`, `accept with fixes`, or
`reject`), then a numbered list of findings, each with the file, the claim, your evidence, and the
fix you expect. End with a short list of things you verified and found correct. Reply in the pane
with only the file path.
