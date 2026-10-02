# Review — sd-052 drain and sk-028 filing

Reviewer: Grok. Author: raven-next (Claude Fable 5.1). Date: 2026-10-02.
Worktree: `improvements/sd-052-resolve-sk-028-file`. Base: `origin/main` `8e5234ba`.
This review did not edit repository files and did not post upstream.

## Part 1 — sd-052

Verdict: go

### Findings

None.

### Resolution comment

The short dry-run comment is accurate, short, and appropriate on closed issue 2722.
Issue 2722 has no comments. Post this comment before the real resolve.
Do not pass `--upstream-commented` until that post exists.

```
Raven independently rechecked sd-052 on 2026-10-02 and confirmed the original trigger is resolved live.

Live recheck: 2026-10-02 live page https://developers.stellar.org/docs/tools/cli/stellar-cli says "Generate Python bindings (requires external plugin)". Java, Flutter, Swift, and PHP use the same note. stellar 28.1.0 exits 1 for each command and links https://github.com/lightsail-network/stellar-contract-bindings.

The active finding is being retired under the ephemeral improvements lifecycle. Immutable source snapshot: https://github.com/stellar-experimental/stellar-raven/blob/e67f8d11bc4fb218a618516b16e32b1be01722be/improvements/stellar-docs/sd-052-cli-bindings-placeholder-languages.md
```

The third sentence uses the resolver's own words. The live result is in the second paragraph.
The snapshot blob `1f4968e6cc23dc3774d052f4a98722fc31ad06e8` matches the current finding file.
The public URL for commit `e67f8d11bc4fb218a618516b16e32b1be01722be` resolves.

### Verified

1. Issue 2722 is closed as completed at 2026-09-29T21:42:55Z by fnando. PR 2766 closed it.
   PR 2766 merged at 2026-09-29T21:42:53Z as `d0b26d9f47e72d3ab5949c467cb11d452933cce8`.
   leighmcculloch approved it. The PR changes `FULL_HELP_DOCS.md` and `cmd/soroban-cli/src/commands/contract/bindings.rs`.
2. On 2026-10-02T02:02:01Z, `GET https://developers.stellar.org/docs/tools/cli/stellar-cli` returned HTTP 200.
   `last-modified` is Wed, 30 Sep 2026 23:27:59 GMT. `cf-cache-status` is DYNAMIC.
   The HTML SHA-256 is `73c3b5fff1d0ed787d1c5f537d80c3abdc74dc520a1b8f36127d9f27991ea3a3`.
   That time matches the successful docs deploy run 36790846642, created 2026-09-30T23:23:37Z.
   The docs image build uses `pnpm stellar-cli:build --no-minify --cli-ref=main` in the Dockerfile.
   `main` of stellar-cli has the plugin note. Tag `v28.1.0` `FULL_HELP_DOCS.md` does not.
3. The live page says these lines:
   - `python` — Generate Python bindings (requires external plugin)
   - `java` — Generate Java bindings (requires external plugin)
   - `flutter` — Generate Flutter bindings (requires external plugin)
   - `swift` — Generate Swift bindings (requires external plugin)
   - `php` — Generate PHP bindings (requires external plugin)
   Each language also has its own heading with the same sentence.
   `kmp` carries the same note. The original finding names the five languages above.
4. Installed `stellar 28.1.0 (c0f4d0da891bbf214c08b8c5035ae6db80e9a3bd)` still exits 1 for python, java, flutter, swift, and php.
   Each error is: `python binding generation is not implemented in the stellar-cli, but is available via the tool located here: https://github.com/lightsail-network/stellar-contract-bindings` with the language name changed.
   The local `--help` on this release still says `Generate Python bindings` with no plugin note.
   The latest GitHub release is v28.1.0 from 2026-09-26, before the merge.
   The published manual is the finding surface, and that page is deployed.
   The release binary picks up the help text in a later release. That lag does not need a successor finding.
5. The manual wording matches the behavior for the original defect.
   The page marks each command as an external plugin. The command still exits before it generates bindings.
   The page does not include the Lightsail URL. The error prints that URL.
   `docs/tools/cli/plugins-list.mdx` already lists `lightsail-network/stellar-contract-bindings`.
   That tool is the separate `stellar-contract-bindings` CLI from pip.
   A built-in subcommand does not fall through to a plugin. The error path still gives the URL.
   A successor finding is not required.
6. Code search in `stellar/stellar-docs` found no other page that lists python, java, flutter, swift, or php bindings commands.
   The committed manual file is a 133-byte stub. The build fills it from stellar-cli.
7. `rg -n "sd-052" .` has three hits:
   - `improvements/stellar-docs/sd-052-cli-bindings-placeholder-languages.md`
   - `improvements/INDEX.md` line 53
   - `improvements/intake.json` line 165, the `stellar/stellar-cli` override
   The resolver deletes the file, removes that override, and regenerates the index.
   No golden, register, research note, or Algolia rule cites `sd-052`.
   `q-soroban-cli-bindings` does not cite this id. Its placeholder-language fact remains true.
8. The dry-run resolver wrote no files. `git status` stayed clean for the finding, intake, index, and resolved ledger.

## Part 2 — sk-028

Verdict: go with fixes

### Findings

1. The recommendation names only `SKILL.md` and `references/api-reference.md`.
   Those paths in `Stellar-Light/stellar-scout` are mirrors.
   Evidence: both repos have the same blob for the skill (`de459e784e9e927f42662aa53ab22c8dedab04b7`) and the same blob for the API reference (`5035cc98f1e0a7339ab9837e2dee19e7da0616cb`).
   `Stellar-Light/stellarlight` `SHIPPING.md` says distribution repos are not the edit target. The monorepo is canonical.
   `scripts/sync-scout-skill-mirror.ts` says `public/skills/stellar-scout.md` is canonical.
   `src/lib/stellar-scout-skill.ts` is a generated mirror. The stale sentence is on line 104 there.
   `.github/workflows/sync-scout-skill.yml` copies `public/skills/stellar-scout.md` and `public/skills/references/*.md` into `Stellar-Light/stellar-scout`.
   The last successful run is 2026-09-08, and it produced scout commit `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6`.
   `improvements/README.md` sends skill content to `Stellar-Light/stellar-scout`. The intake override does that.
   That target is acceptable when the issue names the canonical files.
   Expected fix: replace the first recommendation sentence before filing. State all four edit points:
   - Edit `public/skills/stellar-scout.md` line 91 in `Stellar-Light/stellarlight`.
   - Edit `public/skills/references/api-reference.md` line 104 in the same repo.
   - Regenerate `src/lib/stellar-scout-skill.ts`. Do not hand-edit it.
   - Sync those files to `Stellar-Light/stellar-scout`.
   Keep the current intake target, or file on `Stellar-Light/stellarlight` and name the mirror. Either owner is acceptable with that text.

2. Three evidence sentences in the rendered body use internal workflow language.
   The title and the Finding section do not. Change these sentences before filing:
   - `Raven found this during an independent review of its Scout skill pin on 2026-09-30 (.agents/rounds/2026-09-30-skill-system-audit/review-rev-grok.md). It is a different defect from the skills-catalog description in open issue 14 of the same repository (sk-027), so it is a successor finding, not a residual of that issue.`
   - `Dedupe 2026-09-30 found no Stellar-Light/stellar-scout issue for the builder count.`
   - `Dedupe 2026-10-02 over all 13 Stellar-Light/stellar-scout issues found none for the builder count. Closed issue 2 covers substring filtering. Open issue 14 covers the skills catalog.`
   Expected fix: say that a 2026-10-02 check of all 13 `Stellar-Light/stellar-scout` issues found no builder-count report. Closed issue 2 covers substring filtering. Open issue 14 covers the skills catalog. Drop `sk-027`, `Dedupe`, `successor finding`, and the `.agents/rounds` path.

### Sentences that can stay

The title has 116 characters. It names the skill and both stale sizes.
The six Finding sentences match the live lines and the live count of 233.
The other two recommendation sentences are the smallest correction.
Point readers at the `builders` count in `/api/status`, or at the advisory text.
`meta.counts.total` on a no-match query is 0. The advisory text carries 233. The recommendation already says advisory, so that sentence can stay.
The source-record and handoff paragraphs come from the filer. Leave them.

### Verified

1. `Stellar-Light/stellar-scout` HEAD is `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6` at 2026-09-08T00:38:50Z.
   `SKILL.md` line 91 contains `currently in the dozens, not hundreds`.
   `references/api-reference.md` line 104 contains `small and sparse (~110 profiles`.
   The same two lines are in `Stellar-Light/stellarlight` at `public/skills/stellar-scout.md` line 91 and `public/skills/references/api-reference.md` line 104.
   `stellarlight` main HEAD is `98eb8ae133d822badf02ec341f301e45cb335537` at 2026-10-02T00:57:19Z. Those skill lines are still present.
2. `GET https://stellarlight.xyz/api/status` at 2026-10-02T02:06:59.622Z returned builders `count` 233 and `lastUpdatedAt` `2026-10-01T13:42:53.078Z`.
   The notes say `Synced from Stellar Passport — small and growing dataset`. That note has no fixed count.
   `GET https://stellarlight.xyz/api/builders?q=zzzzqqq` at 2026-10-02T02:10:05Z returned advisory summary: `The directory has 233 builder profiles, but none match these filters`.
   This review did not re-run the 2026-09-30 request that recorded 226.
3. `Stellar-Light/stellar-scout` has 13 issues: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, and 14.
   Number 12 is merged PR `fix: sk-009 — api-reference catches up to live openapi@1.8.41`, not a builder-count issue.
   No issue title covers the fixed builder count. Issue 2 is substring filtering. Issue 14 is the skills catalog.
   `Stellar-Light/stellarlight` has 140 issues. Title and text searches for the builder count, `dozens`, `110 profiles`, and `Builders directory` found no matching issue.
   Nearby titles are issue 322 (region filters), issue 521 (`scfTier`), and issue 768 (SDF skill count).
   The charter owner for this skill text is `Stellar-Light/stellar-scout`, with the canonical edit in `Stellar-Light/stellarlight` as finding 1 says.
   The API count is current, so this is not an API defect for `stellarlight` alone.
4. `npm run improvements:file -- --file improvements/skills/sk-028-scout-skill-stale-builder-count.md --dry-run` exited 0 and posted nothing.
   The rendered title is the `upstreamTitle`. The body has the marker, the five sections, and snapshot `5fb3181800cf`.
   That snapshot blob `36812cbdd1014a1d03b3cced036af184f697f07a` matches this worktree file, and the commit is on GitHub.
   The `main` source link is blob `3fe5eb065803b7b9ab6264c88bb8bc3f222915fd`. It is the older record, before the 233 refresh.
   The snapshot is the text this dry run rendered.
   The dry run does not print the repo. Intake override `sk-028` resolves to `Stellar-Light/stellar-scout`.
5. `npm run improvements:lint` exited 0. The result line is `improvements lint ok (67 findings)`.
