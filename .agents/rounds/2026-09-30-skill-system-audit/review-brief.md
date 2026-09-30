# Independent review brief — 2026-09-30 skill system audit

You are an independent reviewer. The author and orchestrator is Claude Opus 5.5. You did not
write this work. Review it adversarially, from live sources, and report what is wrong or missing.

Repository: `/Users/kalepail/Desktop/stellar-raven-codemode` (read `AGENTS.md` first).

## What to review

1. **Merged PR #183** (`f65e165d`, base `605c1558`). Read `git show f65e165d` in full. Check
   every change for accuracy against the repo and live upstream state:
   - `ecosystem-skills/README.md` count fixes and the new "Adding a source" section. Compare the
     section with what PR #157 (`58954b67`) and `.agents/rounds/2026-09-16-trustless-work/`
     actually did. Is any step wrong, missing, or misleading?
   - `ecosystem-skills/update.sh`, `eval/plan/coverage-rules.json`,
     `research/skill-exposure-inventory.md`, `AGENTS.md`, `.agents/NEXT.md` (Scout version,
     item 3, decision K), `.agents/TODO.md` (narrowed freshness item, ledger pointer).
   - The golden refresh of
     `eval/qa/corpus/battery/tooling-infra/q-ti-stellar-lab-usage-and-new-ui.json` and the
     cluster re-close in `.agents/rounds/2026-09-30-skill-system-audit/register-review.json`.
     Judge it against `.agents/skills/golden-truth/SKILL.md`. Re-derive the claims from live
     sources yourself; do not trust the author's evidence notes.
2. **Finding `sk-027`** (`improvements/skills/sk-027-scout-skill-stale-skills-catalog.md`) and
   its filed issue https://github.com/Stellar-Light/stellar-scout/issues/14. Is every claim true
   at the pinned commit `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6` and on the live API? Is the
   recommendation the smallest correct fix? Judge it against
   `.agents/skills/improvements-pipeline/SKILL.md`.
3. **The audit's conclusions**, recorded in `.agents/rounds/2026-09-30-skill-system-audit.md`:
   pins current, 20 exposed skills and 202 sections, 43-entry catalog, production deploy
   `c4d27b61-e0f0-47a4-a6fe-6ce298fb1b81`. Verify read-only.
4. **What the audit missed.** Look across the skill system — `ecosystem-skills/`,
   `scripts/check-skills-drift.mjs`, `scripts/check-mirrors.mjs`, `scripts/build-catalog.mjs`
   skill handling, `.agents/skills/*/SKILL.md`, `.agents/README.md`, `THIRD-PARTY-NOTICES.md`,
   `inventory/`, `improvements/skills/` — for anything stale, wrong, unclear, or contradictory.

## Your lane emphasis

Your prompt names your lane. Cover all four areas, but go deepest on your lane.

## Rules

- Read-only, except for one file: your review at
  `.agents/rounds/2026-09-30-skill-system-audit/review-<your-agent-name>.md`.
- No git state changes (no commit, checkout, switch, stash, reset, push). No GitHub writes (no
  issue or PR comments). No deploys, no paid evaluations, no Algolia writes. Do not touch other
  Herdr panes.
- Live read-only probes are allowed: `curl`, `gh api` reads, `node scripts/check-*.mjs`,
  `npm test`, the Raven MCP if available.
- Cite exact files and lines, URLs, commands, and observed output. Say "unverified" when you
  could not check something.

## Output format

Write your review file with these sections:

1. `## Verdict` — `accept`, `accept with fixes`, or `reject`, with one sentence.
2. `## Findings` — one entry per issue: severity (`blocker`, `should-fix`, `nit`), location
   (`path:line` or URL), what is wrong, evidence, and the exact fix.
3. `## Additional work` — clear, low-risk improvements the audit missed, ranked. Mark each
   `simple` or `needs-decision`.
4. `## Checked and correct` — what you verified as right, with evidence.

When the file is complete, reply with only its path.
