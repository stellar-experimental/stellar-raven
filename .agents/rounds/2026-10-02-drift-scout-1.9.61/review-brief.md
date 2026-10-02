# Adversarial review brief — live drift PR #216 (Scout 1.9.61)

You are the independent reviewer that `.agents/skills/live-drift-resolution/SKILL.md` Step 6
requires. The author is `raven-next` (Claude Fable 5.1). Do not trust the author's summary:
re-derive everything from the diff and the live surfaces. Do not edit repository files, do not
post upstream, do not deploy, and run nothing paid.

Branch `catalog/absorb-scout-1.9.61-drift` at `3c1183b7` against `origin/main` `38aa07fc`, in
`/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/raven-drift`. Read the runbook, then
the ledger `.agents/rounds/2026-10-02-drift-scout-1.9.61.md`, then issue #215.

## Re-derive

1. **Drift class.** Run the three `scripts/diff-inventory.mjs` modes (`surface`, `text`, `deep`)
   between `origin/main:inventory/stellar-light.json` and the branch file. Confirm no operation was
   added, removed, or renamed (compare the path·method set, not counts). List every operation whose
   description, `x-routing`, parameters, or responses changed, and every changed component.
2. **Exposure (ADR-0003).** Confirm `node scripts/build-catalog.mjs` prints the same exclusions as
   on `main` and that the manifest holds 282 IDs and 60 operations with no new callable surface.
   Check that no emitted text references a non-exposed operation.
3. **Runner-affecting check.** Intersect the touched operations with the runner-declared ops from
   `src/skills/runners/index.ts`. Say whether it is empty.
4. **Routing gate.** Run `npm run eval:compile && npm run eval:routing -- --gate`. Compare the lane
   totals with `eval/gates.json` on `origin/main`. Confirm that only the fingerprint, `baselinedAt`,
   `localTrace`, the accepted legacy top-3 total, and the note changed, and that every threshold is
   unchanged. Re-derive the one moved row (`q-defi-agentic-payment-standards-compare`): is the
   stated cause (new agent-cli docs titles feeding `x402`, `pay`, `apis` into the sdk/cli and
   soroban docs keyword sets) right? Is recording 297 as the accepted total while keeping the 298
   band center a defensible re-baseline under Step 4, or a moved goalpost?
5. **Keyword side effects.** The new agent-cli guide titles add generic words (`skills`, `output`,
   `model`, `authority`, `security`, `messages`, `spending`) to two docs operations. Use
   `node eval/run-routing.mjs --dump-ranked <file>` or targeted `search` calls through the catalog
   to look for queries where `scout.listSkills` or a Scout operation now loses to a docs operation
   because of those words. Report any case with evidence; the gate's lanes may not contain one.
6. **Skills mirror.** `node scripts/check-mirrors.mjs --fetch`, `check-pin-review.mjs --base
   origin/main`, `check-skills-drift.mjs`. Confirm the catalog snapshot added 19 `community`
   entries and removed none, and that `MANIFEST.json` changed only `synced_at`.
7. **Spec and adapter.** The new `searchResearch` parameters `sources` (array, form, explode
   false) and `perSource` ship in `specs/super-spec.json`. Check that `src/adapters/scout.ts` and
   `src/policy/validate.ts` accept and serialize them correctly (the ledger says `join(",")`), and
   probe the live service read-only to confirm the wire form works.
8. **Impact audit.** Search `eval/qa/corpus/battery`, `eval/plan`, `docs/`, `.agents/skills`,
   `src/`, and `improvements/` for anything that still teaches the old descriptions, counts, or
   version. Check the `sls-089` recheck line against the live OpenAPI document. Say whether any
   golden, improvement, or doc edit is missing.
9. **Secrets and scope.** `npm run secrets:scan -- --tree`; eyeball the generated diff for
   secret-shaped strings. Confirm the diff contains only generated artifacts plus the hand edits
   the ledger lists.

## Output

Write `tmp/review-drift-astra.md` under the worktree root: a verdict line (`safe to commit`,
`safe with fixes`, or `not safe`), numbered findings with file:line evidence and the expected fix,
and what you verified. Reply in the pane with only the path.
