# Item 8.2 executor E4: case text out of `ideas/` (PR 4)

Read `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/briefs/COMMON.md` first; its rules bind you, except that you may edit the files below.
You are a Claude Sonnet 5.5 executor. Work only in `/home/tyler/code/raven-wt/np-8.2-cases` on branch
`np/8.2-docs-case-text`. Read `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/EXPOSURE.md`, `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/RECONCILE.md` (rows R-02, R-03, R-15) and
`/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/audit/O.md` findings O-01 and O-47 (they describe what to remove, not the text).

Two files contain judge-facing text of golden QA cases. You read them to rewrite them. **Never quote
or paraphrase any of that text anywhere**: not in EXEC, a commit message, a message to a terminal,
`codegen-residues.md`, or your screen summary. Refer to a case only by its id and a field name.

## Do

1. Record the last commit holding each file: `git log -1 --format=%h -- <path>`.
2. `ideas/codegen-correctness-substrate.md`: `git mv` it to
   `research/audits/2026-08-07-codegen-partner-report.md`. Then sanitize: replace every quote of a
   case's judge-facing text, golden, key facts, avoid clauses or notes, and every expected-answer
   detail, with the case id and the field name only (lines 174-221; also check lines 42, 135, 157
   beside `q-sor-evm-to-soroban-porting`). Remove partner-side detail (a person's name, the partner's
   internal or regulatory processes; O-01 cites lines 213-221). Remove `solo://` links and Solo
   scratchpad references, replacing them with "(source: an internal note, not retained)". Add a first
   line under the title: "Moved from `ideas/` and sanitized on 2026-11-18 by round item 8.2: case
   text replaced by case ids, partner detail removed. A dated record, not a plan." Change nothing else.
3. `ideas/source-delivery-ranked-references.md` lines 28-62 (section 1) only: replace per-case detail
   with case ids and the finding ids that hold the public evidence (`sd-044`, `sd-004`, `sd-043`).
   Keep every section number and heading. Touch no other line (another executor edits lines 504-506
   and the status line in a separate pull request).
4. Write `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/codegen-residues.md` (it is not committed by you): the three residues from O-47, in
   your own words, with ids only: (1) the malformed-input guidance gap in the pinned smart-contracts
   skill (which skill, which section, what kind of gap; candidate `improvements/skills/` finding
   needing a recurrence probe); (2) the golden gaps as a list of case ids and the field each concerns,
   for a golden-maintenance lane; (3) "No instrument measures long-horizon codegen with Raven
   installed", with the trigger the note gives.
5. Run `rg -n 'q-[a-z0-9]+(-[a-z0-9]+)+' research/audits/2026-08-07-codegen-partner-report.md ideas/source-delivery-ranked-references.md`
   and confirm that every remaining id line carries an id and a field name only.
6. Gates, bare: `npm run typegen`, `npm run typecheck`, `npm test`, `npm run build`,
   `npm run secrets:scan -- --tree`, the link check
   `node /home/tyler/code/raven-wt/np-8.2/tmp/check-links.mjs research/audits/2026-08-07-codegen-partner-report.md ideas/*.md`
   (fix any link the move breaks, in files under `ideas/` only if a link points at the moved file;
   report others), and `git diff --stat origin/main -- src public wrangler.jsonc catalog specs` empty.
7. Commit with the normal hooks, message "Move the codegen partner note to research and remove case
   text from ideas/ (round item 8.2, PR 4)" with no detail about the removed text, ending:

   ```
   Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
   ```
   Do not push.
8. Write `.agents/rounds/2026-11-16-next-phase/items/8.2/EXEC-4.md` in your worktree and commit it:
   what you did per file (by line range and field name), the two last-commit hashes, each gate's
   one-line result, your terminal id (`$HC_TERMINAL_ID`) as a reader. Then report.
