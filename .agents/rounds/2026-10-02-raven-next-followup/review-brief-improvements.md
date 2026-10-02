# Review brief — improvements follow-up (sd-052 drain, sk-028 filing), 2026-10-02

You are the distinct reviewer that `.agents/skills/improvements-pipeline/SKILL.md` requires before
a finding is drained and before an upstream write. The author is `raven-next` (Claude Fable 5.1).
Worktree: `/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/raven-next-imp`, branch
`improvements/sd-052-resolve-sk-028-file`, base `origin/main` `8e5234ba`.

Read the skill first, in particular "Upstream filing", step 6 of the resolver procedure, and
`references/upstream-writing-style.md`. Nothing has been posted upstream yet. Do not post anything
yourself and do not edit repository files.

## Part 1 — `sd-052` (drain a fixed finding)

Record: `improvements/stellar-docs/sd-052-cli-bindings-placeholder-languages.md`, status
`fixed-upstream`. Upstream: stellar/stellar-cli issue 2722 (closed) and PR 2766 (merged).

Do every step-6 check yourself, fresh, without trusting the author's evidence:

1. Read the finding and the current upstream issue and PR directly (`gh`).
2. Confirm the change is deployed, not merely merged: read
   `https://developers.stellar.org/docs/tools/cli/stellar-cli` now and quote what it says for the
   Python, Java, Flutter, Swift, and PHP binding commands.
3. Execute the original trigger if you can: the finding says the placeholder commands exit with a
   not-implemented error while the manual presents them as generators. Say whether the manual
   wording now matches the behavior.
4. Scan adjacent behavior for a residual that needs a successor finding (for example the missing
   link to the external tool, or other pages that list these languages as generators, such as the
   Stellar Docs bindings or SDK pages).
5. Run `rg -n "sd-052" .` and say whether any golden, register, research, Algolia-rule, intake, or
   other persistent reference needs reconciling before the record is deleted.
6. Read the resolution comment the resolver prints (run the dry run below) as a stellar-cli
   maintainer. Say whether it is accurate, short, and appropriate on a closed issue.

```sh
npm run improvements:resolve -- --file improvements/stellar-docs/sd-052-cli-bindings-placeholder-languages.md \
  --live-recheck "<your dated recheck>" --review-evidence "<you>" \
  --resolving-ref https://github.com/stellar/stellar-cli/pull/2766 \
  --references-reviewed --upstream-commented --dry-run
```

## Part 2 — `sk-028` (file a verified finding)

Record: `improvements/skills/sk-028-scout-skill-stale-builder-count.md`, status `verified`.
Target: `Stellar-Light/stellar-scout`.

1. Re-derive the evidence live: upstream `SKILL.md` line 91 and `references/api-reference.md`
   line 104 at upstream HEAD, and `https://stellarlight.xyz/api/status` (builders count).
2. Dedupe: list every issue in `Stellar-Light/stellar-scout` (open and closed) and confirm none
   covers the builder count. Check `Stellar-Light/stellarlight` too if the defect could be filed
   there instead; say which repository is the right owner under `improvements/README.md`.
3. Run `npm run improvements:file -- --file improvements/skills/sk-028-scout-skill-stale-builder-count.md --dry-run`
   and read the rendered title and body as the upstream maintainer. Apply the skill's rule: the
   title and first paragraph state the surface and the defect with no eval ids or internal
   workflow language; the smallest correction comes first; every claim matches current evidence.
   Name any sentence you would change before filing.
4. Run `npm run improvements:lint` and report the result.

## Output

Write `tmp/review-improvements-grok.md` under the worktree root: a verdict line per part
(`go`, `go with fixes`, or `no-go`), a numbered list of findings with evidence and the expected
fix, and what you verified. Reply in the pane with only the path.
