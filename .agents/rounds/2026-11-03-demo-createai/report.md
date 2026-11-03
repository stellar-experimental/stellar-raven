# Lane demo-finding report (2026-11-03)

Lane: demo-finding. Author: Claude Opus 5.5 (high). Worktree: `/private/tmp/rv-demo`, branch
`demo/agents-createai-1103` at `e530c7f4`. No commit, push, issue, or comment was made.

## Result

The finding is ready for filing as `cs-010` at status `verified`. The upstream title is
"createAI: string catalog models drop Anthropic adaptive thinking and effort providerOptions".
Intake resolves it to `cloudflare/agents`.

## What I verified myself

1. **Repro re-run.** I copied the repro to an empty scratch folder and ran `npm ci --ignore-scripts`
   and `npm run repro` on Node v24.13.0. Exit code was 0. All three checks reproduced. The output
   was byte-identical to the Codex lane's `observed.jsonl`.
2. **Newer release.** `agents@0.33.0` was released on 2026-11-03. I re-ran the same script against
   it. The output was byte-identical, so both gaps remain.
3. **Current main.** `cloudflare/agents` main at `1f3bd921` still hardcodes
   `format: "chat-completions"` in `language.ts:428` and still has `withResume` in
   `transport.ts:359`. No `src/models` commit since 2026-10-29 touches these paths.
4. **Source citations.** I fetched the tagged `agents@0.32.0` files from GitHub. They are
   byte-identical to the Codex lane's local copies. I corrected one range (`language.ts` 421-432).
5. **Migration-parity claim.** `workers-ai-provider@4.0.0` (installed) maps `anthropic` to
   `runWireFormat: "anthropic"`. Raven's `cloudflareAnthropic` plugin wraps `@ai-sdk/anthropic`.
   So today the adaptive `thinking` and `effort` options reach catalog `/run`. The loss on
   migration is real, not inferred.
6. **Owner.** `npm view agents@0.32.0 repository bugs` names `cloudflare/agents`.

## Changes from the draft

- **Dedupe changed the resume ask.** cloudflare/agents#2790 (open, 2026-11-02, another user)
  already requests an opt-out for automatic stream resume. The finding now leads with the
  Anthropic options gap only. It cites #2790 for resume, adds Raven as one more use case, and
  states that no Raven failure from automatic resume is known. It does not file a duplicate.
- **Smaller, concrete ask.** The core run transport already maps `format: "messages"` to
  `/v1/messages`, and `agents/models/pi-ai` uses that for Anthropic catalog IDs. The
  recommendation now asks to use that path for `anthropic/*` string models, with a warning as
  the interim minimum. It also cites cloudflare/agents#2631 (array `system` on `/run`) as a
  known risk for that path.
- **Status `verified`, not `proposed`.** The repro re-executes the published package today. It
  proves the request-construction defect against the upstream surface.
- **Internal language removed.** The owner-facing text has no owner requirements, gauntlet, eval,
  or lane terms. The git-history review of `resume: false` stays out of the issue. The native-route
  coverage note is one dated sentence that says we did not re-test it.
- **Repro path.** The repro now lives under `.agents/rounds/2026-11-03-demo-createai/repro/`
  (no `node_modules`). The issue body links its public `tree/main` URL, which resolves only
  after the commit reaches `main`. `tmp/demo/repro/` was removed after the move.

## Files

- `improvements/canonical-source/cs-010-createai-catalog-drops-anthropic-provider-options.md` (new)
- `improvements/intake.json`: `cs-010` override to `cloudflare/agents`; `updated` set to 2026-11-03.
- `improvements/INDEX.md`: regenerated (115 findings).
- `.agents/TODO.md`: "Move the demo off the deprecated `workers-ai-provider`" now records the
  2026-11-03 block, keeps `workers-ai-provider`, and makes done-when wait on the upstream fix and
  a resume decision. I kept the `wai-001` close-out sentence because it is still accurate.
- `.agents/rounds/2026-11-03-demo-createai/repro/`: `package.json`, `package-lock.json`,
  `repro.mjs`, `README.md` (updated with dated version results), `observed.jsonl` (my run).
- `.agents/rounds/2026-11-03-demo-createai/dry-run.md`: rendered issue from the dry run.

## Gates (all bare, all exit 0)

- `.dev.vars` already matched the CI names-only stub byte for byte (checked with `cmp`, not read).
- `npm ci`, `npm run typegen`
- `npm run improvements:index` (115 findings)
- `npm run improvements:lint` (ok)
- `npm run improvements:lint -- --live` (ok, live intake and GitHub refs including #2790 and #2631)
- `npm run improvements:file -- --file <cs-010> --dry-run`
- `npm run secrets:scan -- --tree` (clean; tracked files only). A separate `gitleaks dir` on the
  two new untracked paths found no leaks.

## For the coordinator

- Id collision risk: `cs-010` is the next id (max active `cs-009`, resolved `cs-002`). No other
  lane brief in this round names a `cs-` id. Recheck before merge if another lane files a
  canonical-source finding.
- Commit and merge before filing. Otherwise the repro link and the immutable snapshot do not
  resolve. Then run `npm run improvements:file -- --file improvements/canonical-source/cs-010-createai-catalog-drops-anthropic-provider-options.md`.
- Per the no-noise rule, do not comment on #2790. The cs-010 issue links it, which creates a
  backlink.
- Independent review of the finding text is outstanding.
