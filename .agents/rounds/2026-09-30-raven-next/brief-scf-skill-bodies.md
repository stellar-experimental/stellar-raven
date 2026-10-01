# Research brief — read the twelve Stellar Light `scf-*` skill bodies (decision K input)

You are a read-only research lane for round `raven-next` 2026-09-30. Lead: `raven-next`
(Claude Fable 5.1). Repository worktree for reference files:
`/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/raven-next-d`.

Read first:

- [`.agents/NEXT.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) decision K (what the owner must decide and the four criteria the read must feed).
- `ecosystem-skills/README.md`, section "Adding a source", the "Admission bar" list.
- `ecosystem-skills/catalog.json` entries whose `name` starts with `scf-` (twelve; note that
  `scf-fetch-external-doc` lives upstream at `skills/fetch-external-doc`).

Then read each skill body at upstream HEAD of `Stellar-Light/awesome-stellar-community-fund`
(`SKILL.md` plus any referenced files under the skill directory), using `gh api` or raw GitHub.
Record the commit SHA you read.

For overlap, read the two exposed skills at their pinned commits (from
`ecosystem-skills/MANIFEST.json`): `lumenloop/lumenloop-skills` `skills/scf-submission-radar` and
`Stellar-Light/stellar-scout` root `SKILL.md`.

## Output

Write `tmp/scf-skill-bodies-astra.md` under your current working directory with:

1. The upstream commit SHA and date, and the license file present.
2. One row per skill: name; what it does in one sentence; every admission-bar criterion answered
   (yes / no / partial, with the line-level evidence); the network, credential, file-upload, CSV,
   or write steps it contains; overlap with `scf-submission-radar` and `stellar-scout` (none /
   partial / duplicate, with the overlapping section named); your fit verdict for a read-only
   gateway (`fit`, `fit with scrub`, `no fit`) and one line of reasoning.
3. A short list of anything decision K should know that the name-level triage missed.

Do not recommend a pin set; the owner decides. Do not edit repository files. Do not post
upstream. Reply in the pane with only the file path.
