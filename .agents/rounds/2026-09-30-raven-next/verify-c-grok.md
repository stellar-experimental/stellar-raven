confirmed

Commit `20bb0a45` on `chore/skill-tooling-hardening`. The check used a copy of `ecosystem-skills/update.sh` lines 231–257. The copy ran under `set -euo pipefail` in `/tmp`. No repository file was changed. `update.sh` was not run against upstream.

## Failed second rename

The forced fault was the same one as finding 1. The destination `catalog.json` had the user-immutable flag. That blocks the second of the three final renames, `mv -f "$SWAP_DIR/catalog.json" "$CATALOG"`.

The script exited 1. The failing command was:

`mv: rename …/.swap.99341/catalog.json to …/catalog.json: Operation not permitted`

The rollback trap then ran. It printed `error: swap failed — restoring the previous manifest, catalog, and index`.

The three target files ended as the previous bytes:

- `MANIFEST.json` = `old-manifest`
- `catalog.json` = `old-catalog`
- `INDEX.md` = `old-index`

The manifest restore did run. After the trap, `.swap.*/MANIFEST.json.prev` was gone, and the target manifest was the previous text. The catalog rename had already failed, so that target was never replaced.

The same flag also blocks the restore rename of `catalog.json`. The trap printed `could not restore catalog.json` and returned. It left `.swap.99341` in the target directory. That directory still held `catalog.json` (`new-catalog`), `catalog.json.prev`, `INDEX.md`, and `INDEX.md.prev`. The early return also left the work directory in place.

## Success path

A second copy had no immutable flag. The script exited 0. The three targets were the new bytes: `new-manifest`, `new-catalog`, and `new-index`.

The check ran after `rm -rf "$SWAP_DIR"` and before the process exited. `find` printed no `.swap.*` directory. The work directory was still present at that moment. The exit trap removes it when the process exits.
