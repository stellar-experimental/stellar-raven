accept with fixes

Reviewer: Grok. Author and orchestrator: `raven-next` (Claude Fable 5.1).
Branch `chore/skill-tooling-hardening` at `50377d3e8ae9bf5b317f0753b4d512271aaacff8`.
Base `origin/main` at `6dd9439461a286f5ca5f87722fb60f238c610d3d`.
No repository files were edited. `update.sh` was not run.

## Findings

### 1. A failure after the first rename can leave a mixed pin set

**File:** `ecosystem-skills/README.md` lines 86–87, and `ecosystem-skills/update.sh` lines 225–226.

**Claim:** The README says nothing after the first rename can fail. The script says nothing after the three renames can fail in a way that needs a rollback. Both sentences treat that as a guarantee.

**Evidence:** The swap is three plain `mv` commands under `set -euo pipefail` (`update.sh` lines 227–229). The `EXIT` trap is `rm -rf "$WORK"` (line 67). There is no restore between the moves.

I forced the second rename to fail on this machine. Both paths were on device `16777231`. I set the user-immutable flag on the destination catalog. The second `mv` printed `Operation not permitted`. The shell exited 1. The trap had removed the work directory. The manifest was the new file. The catalog was the old file. The index was the old file.

That result is a mixed pin set. The staged catalog and index were already deleted. The failed run could not finish the swap from those copies. Any non-zero status from the second or third `mv` takes this path. I did not send a signal. A signal between those commands uses this same trap.

The repo and `TMPDIR` are both device `16777231` here. The script still creates the work tree with `mktemp -d`. It does not place that tree in `ecosystem-skills/`. A different `TMPDIR` device makes `mv` a copy. A copy can stop after the first file.

Two later commands can also return non-zero after all three moves. One is the `jq` count in the summary line. The other is `node scripts/check-pin-review.mjs --digests | sed` under `pipefail` (lines 231–236). Those two do not mix the files. They still run after the first rename. I did not force those two to fail.

**Fix:** Keep the index build before the first `mv`. That part meets the TODO. Replace both sentences with the behavior the script has. Say that a failure before the first `mv` leaves the committed manifest, catalog, and index in place. Say that a failure of the second or third `mv` can leave a new manifest beside the old catalog or the old index. Say that the trap then deletes the staged copies that did not move. Keep the current guarantee only if a failed later `mv` puts the previous three files back. In that design, run the trap after the swap finishes.

## Verified

- `node ecosystem-skills/build-index.mjs` wrote `INDEX.md` (`21 categorized, 0 uncategorized`). `git diff --exit-code ecosystem-skills/INDEX.md` passed. The private-archive row is gone from `build-index.mjs`. The partial-mirror banner is gone too. All five manifest sources have `type` `github`. `status` is `complete`. That removal does not change the current index.
- `node scripts/check-pin-review.mjs --base origin/main` exited 0. It printed `pin-review: no skill pin or file selection moved.`
- `node scripts/check-pin-review.mjs --digests` printed the five current tokens in `ecosystem-skills/PIN-REVIEW.md` lines 371–375. I ran the `origin/main` checker on a copy of the same manifest. It printed the five `was` tokens on those lines.
- A location-only edit needs a new ledger line. I used a copy of the production manifest. I changed `lumenloop` `owner` from `lumenloop` to `someone-else`. The commit stayed `d92c56bda17ab702d3202335cfe814d64e70e191`. Every file path and blob sha stayed the same. The browse `url` still named `lumenloop/lumenloop-skills`. The checker exited 1. It printed `lumenloop d92c56bda17a sel:6b1929302da9 -> d92c56bda17a sel:e00c044a3c50  [MISSING FROM LEDGER]`. It did not write a ledger line. I then added `sel:e00c044a3c50`. The checker exited 0 and printed `[recorded]`.
- The new tests prove that owner case on the real checker. `test/check-pin-review-cli.test.mjs` runs that checker in a throwaway repo. The owner test keeps the commit and the file sha. It changes `owner`. It expects exit 1 and `[MISSING FROM LEDGER]`. It then writes that `sel:` token into the working-tree ledger. It expects exit 0 and `[recorded]`. The fixture manifest is synthetic and has one source. The `repo` and `path` tests prove the failure side only. The pass path is the same `newlyAttested` check. The owner test covers that path. `skillFileUrl` in `scripts/lib/skill-mirror.mjs` builds the raw URL from `owner`, `repo`, `path`, and `commit`. Those fields choose the fetch.
- The `|| { …; exit 1; }` after `node build-index.mjs` is reachable under `set -e`. This shell is bash 3.2.57. I put `node -e 'process.exit(3)'` on the left of `||`. The handler printed `REACHABLE`. The shell exited 7. The same command without `||` exited 3. The next line did not run. The real builder did the same. Its first source had `type` `lumenloop-archive`. `build-index.mjs` threw. The `||` body ran. The shell exited 9. The `--out` file was absent.
- The digest print reads the swapped manifest. `--digests` reads `ecosystem-skills/MANIFEST.json` beside the script. It exits before the base comparison (`scripts/check-pin-review.mjs` lines 75–80). `update.sh` runs that command after the three `mv` commands (lines 233–236).
- `scripts/check-skills-drift.mjs` rejects a source whose `type` is not `github`. `checkSource` throws `unknown source type` for every other type (lines 264–268). `Promise.allSettled` stores that throw as `status` `error`. The process then exits 2 (lines 322–336). A temp tree with one `lumenloop-archive` source exited 2. The partner note was `unknown source type "lumenloop-archive" — teach scripts/check-skills-drift.mjs about it`. `.github/workflows/refresh.yml` maps every status other than 0 or 1 to `drift=error`. The step `fail on skills drift check error` then exits 1.
- `npm run typecheck` exited 0. `npm test` exited 0. The run had 124 files, 2204 passed tests, and 4 skipped tests. It included `test/check-pin-review-cli.test.mjs` (6) and `test/build-index-cli.test.mjs` (3). `npm run build` exited 0. `npm run secrets:scan -- --tree` exited 0 and reported no leaks. The work tree was clean after these commands.
- The three closed TODO items from `origin/main` are gone. The index is built from the staged manifest and catalog before any `mv`. The projection includes `owner`, `repo`, and `path`. The owner test shows that a location-only change needs a new `sel:` token. The inactive archive branch is gone. The index rebuild was byte-identical. Finding 1 is the remaining gap in the swap wording.
- `AGENTS.md` says documentation must describe current behavior. The edited sentences match the script, except the two sentences in finding 1. The new `PIN-REVIEW.md` section matches the two checker runs. It states that no selection was reviewed today. `MANIFEST.json` is not in the diff.
