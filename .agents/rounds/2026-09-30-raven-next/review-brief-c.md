# Review brief — PR C (skill tooling hardening), round raven-next 2026-09-30

You are an independent reviewer. The author and orchestrator is `raven-next` (Claude Fable 5.1).
Review the branch `chore/skill-tooling-hardening` against `origin/main` (`6dd94394`) in the
worktree `/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/raven-next-c`.

Read `AGENTS.md`, `ecosystem-skills/README.md`, and the three `TODO.md` items this PR closes (read
them at `origin/main`: "Stage the index before the pin swap", "Cover source location in the
pin-review digest", "Remove the inactive private-archive branches from build-index.mjs").

## What changed

1. `ecosystem-skills/build-index.mjs` — `--manifest`, `--catalog`, `--out` flags; fails closed on
   any source whose `type` is not `github`; the private-archive rendering branch and the
   partial-mirror banner are gone.
2. `ecosystem-skills/update.sh` — builds the index from the staged manifest and catalog into the
   work tree before the swap, then renames manifest, catalog, and index into place.
3. `scripts/check-pin-review.mjs` — the digest projection adds `owner`, `repo`, `path`.
4. `ecosystem-skills/PIN-REVIEW.md` — wording, and a dated note with the re-keyed tokens.
5. `ecosystem-skills/README.md` — "Swap last" and "Updating" describe the new order.
6. `test/check-pin-review-cli.test.mjs` and `test/build-index-cli.test.mjs` — new.
7. `.agents/TODO.md` — the three items removed.

## What to verify, independently

- Byte-identical rebuild: run `node ecosystem-skills/build-index.mjs` and confirm
  `git diff --exit-code ecosystem-skills/INDEX.md` (it fetches pinned SKILL.md files into the
  ignored cache; network is allowed).
- `node scripts/check-pin-review.mjs --base origin/main` prints "no skill pin or file selection
  moved", and `--digests` prints the five tokens in the PIN-REVIEW note.
- Construct a location-only manifest change yourself (same commit and blob shas, different
  `owner`) and confirm the checker exits 1 without a new ledger entry and 0 with one. Say whether
  the new tests actually prove that, or only something weaker.
- `update.sh`: read the swap section. Say whether any failure after the first `mv` is now possible,
  whether the `|| { …; exit 1; }` after `node build-index.mjs` is reachable under `set -e`, and
  whether the digest print still reads the swapped manifest. Do not run `update.sh` against
  upstream unless you can do so without writing to the repository (for example from a copy).
- Confirm `check-skills-drift.mjs` really rejects non-github source types, since the README and
  script comments now rely on that.
- Run `npm run typecheck`, `npm test`, `npm run build`, and `npm run secrets:scan -- --tree`.
- Check every edited sentence for the writing rules in `AGENTS.md` and for claims the diff does not
  support.

Do not edit repository files. Do not post anything upstream. Do not run paid evaluations.

## Output

Write your findings to `tmp/review-c-<your-lane>.md` under the worktree root (the Codex sandbox
cannot write under `.agents/`). Use this shape: a verdict line (`accept`, `accept with fixes`, or
`reject`), then a numbered list of findings, each with the file, the claim, your evidence, and the
fix you expect. End with a short list of things you verified and found correct. Reply in the pane
with only the file path.
