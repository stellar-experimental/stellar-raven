> Committed copy of `/home/tyler/backups/raven-next-phase/MANIFEST.md` on agentpc, made 2026-11-16 before any ref was deleted.

# Item 0.3 manifest: archived branches and refs (2026-11-16)

Everything below was bundled before any ref was deleted. Restore a ref with
`git fetch <bundle> <ref>:<ref>` (or `git clone --mirror <bundle>`); the bundle has no prerequisites.

## Files

| File | Bytes | SHA-256 |
|---|---|---|
| `raven-branches-2026-11-16.bundle` (55 refs) | 60868289 | `15f6ff8390c52e259c4fdc97621d2b6278b84d397451c5329d234e88a0138ce7` |
| `raven-wt-routing-results-2026-11-16.tar.zst` (230 files) | 1042829 | `9aa2884f1abd953be198198bfb096c149273ee814141572360e1eab2a00bc21a` |
| `heldout-private/raven-wt-qa-results-2026-11-16.tar.zst` (27 files; mode 700 directory; **no agent opens it**) | 5605658 | `60819728a949141c0fe881207d4a90983d0d112893f595d61f2e62824ad68b2e` |

Path-and-SHA-256 manifests: `raven-wt-routing-results-2026-11-16.manifest.sha256` and
`heldout-private/raven-wt-qa-results-2026-11-16.manifest.sha256`. Members start with their worktree
name (archived from `/home/tyler/code/raven-wt`). Expected ref list: `expected-refs.txt`. Raw
inventory lists: `0.3-inventory/`. Mac copy of the earlier tip: `mac-audit-golden-coverage.bundle`
(SHA-256 `db7844a3bc8dda67bcc01ddf57e183b8216a5be8443cfec9fcde2c3f7497b137`, same commit as
`refs/archive/mac/audit/golden-coverage`).

The pinned judge-stability register is `gca-eval/eval/qa/judge-stability.json`
(`4322dd4d…bf458`; `eval/qa/heldout-read.sh` pins it). `gca` holds a different register
(`6cdbaf39…44036`). Both are in the held-out tarball.

## Refs

Repository state at bundling: main clone `0bfbc8f4` (`origin/main`). `Action` is what phase B does:
"delete" only from this name-and-SHA list (never by pattern), with
`git push --force-with-lease=<branch>:<sha> origin :refs/heads/<branch>` remote and
`git update-ref -d refs/heads/<branch> <sha>` local.

| Ref | SHA | Kind | Disposition | Action |
|---|---|---|---|---|
| `refs/archive/mac/audit/golden-coverage` | `49ba554015b0b8245a3578d83f789c0cd70b1cdb` | Mac tip | On `main`: #436 (the licensing case it adds was retired in #438 and stays in `main` history); the Mac copy also lives in `mac-audit-golden-coverage.bundle` | temporary ref; delete after verify; Mac branch deleted by the orchestrator |
| `refs/archive/worktree/gca-eval` | `361ff2ef452cc2b9ed61329470b70b26313dca8a` | worktree HEAD | Archived: 20 scan files (also in `~/backups/loop2-scans-2026-11-15/`) and one ledger draft. The worktree stays by decision, detached, as a data directory (`eval/qa/heldout-read.sh` default register) | temporary ref; worktree stays |
| `refs/heads/audit/golden-coverage` | `64580f3b83bec6cc8d4ff54cdfc27409f7af1db6` | local branch | On `main`: ancestor of the Mac tip `49ba5540`, #436 | delete (by name and SHA) |
| `refs/heads/audit/scope-decisions` | `a21b9c4cc1af7fe854b8566c1cdca65e6f2a4026` | local branch | On `main`: #438 | delete (by name and SHA) |
| `refs/heads/chore/fp-round-record` | `860e8085e14c353abdb02854aa24de80322879df` | local branch | On `main`: #431 | delete (by name and SHA) |
| `refs/heads/docs/agentic-rewrite` | `595d926d07fa9d7284202139b8920ad2e60eafc3` | local branch | On `main`: #433 | delete (by name and SHA) |
| `refs/heads/docs/skills-eval-policy` | `6389453217944e60c4b4002efbcadab553ddace0` | local branch | On `main`: #432 | delete (by name and SHA) |
| `refs/heads/evals/baseline-2026-11-14` | `fd1b02e387353861c2602af7ca9ce106f3d1a871` | local branch | On `main`: every file's content is in `main` history | delete (by name and SHA) |
| `refs/heads/exp/family-decider` | `9667ac345f45c40105d4a307ecd97113181a7f79` | local branch | Archived, move owed: experiment closed in #445; record `research/audits/2026-11-14-family-decider.md`. The FAM development rows (`.agents/rounds/2026-11-14-family-decider/sets/fam.development.discovery.json`, also in `~/backups/fd-2026-11-14/split/`) are owed a move into `eval/discovery/` when the stellar.org routing-reach item is worked; the sealed split is in `~/backups/fd-2026-11-14/` | delete (by name and SHA) |
| `refs/heads/exp/fd-lab-a` | `885c990862615a653008f81d9ba55569e4b54d17` | local branch | Archived: lane of the closed family-decider experiment (labels, sets, statements) | delete (by name and SHA) |
| `refs/heads/exp/fd-lab-b` | `45e47e71800098a0eee33b4a0d259db1a7fdefe4` | local branch | Archived: lane of the closed family-decider experiment (labels, sets, statements) | delete (by name and SHA) |
| `refs/heads/exp/fd-sets` | `39ee9445aeea78dfc54c10c9af64517a880eb28d` | local branch | Archived: lane of the closed family-decider experiment (labels, sets, statements) | delete (by name and SHA) |
| `refs/heads/exp/fd-st` | `a0d20c1e5e5c340ae581871783f7965593f95aba` | local branch | Archived: lane of the closed family-decider experiment (labels, sets, statements) | delete (by name and SHA) |
| `refs/heads/feat/stellar-org-source` | `b81e7a03b3f0aea8a70dc183ef90ac2d4eb1f451` | local branch | Archived: #439 closed unmerged; the source merged through tuning loop 2 (#447); its TODO follow-ups are on `main` under "Prove the stellar.org source and settle its egress" | delete (by name and SHA) |
| `refs/heads/feat/trimmed-surface` | `17138cf34de7bdaeb9889ccc4c541c07a3612ae8` | local branch | On `main`: #430 | delete (by name and SHA) |
| `refs/heads/fp/brief` | `24307e8f3b63c27d0a13486e01177947adbae592` | local branch | Archived: screen-only scripts of the closed fp round | delete (by name and SHA) |
| `refs/heads/fp/calib` | `eb898412908c047f240eda93e6d74fe7b9e93fbf` | local branch | Archived: screen-only scripts of the closed fp round | delete (by name and SHA) |
| `refs/heads/fp/confirm` | `3eccab8116d8c260ff11da3702cb8cea78ee3716` | local branch | Archived: the fp round is closed (`.agents/rounds/2026-11-12-fp.md`); arm B shipped via #430 from a fresh branch. Each diverges from the other by one commit (`fp/harness` `0ebc7988`, `fp/confirm` `3eccab81`). Reusable only through its own reviewed pull request; restore from this bundle then | delete (by name and SHA) |
| `refs/heads/fp/harness` | `0ebc7988c0a3c2088052c7bd98f600c01e22b53b` | local branch | Archived: the fp round is closed (`.agents/rounds/2026-11-12-fp.md`); arm B shipped via #430 from a fresh branch. Each diverges from the other by one commit (`fp/harness` `0ebc7988`, `fp/confirm` `3eccab81`). Reusable only through its own reviewed pull request; restore from this bundle then | delete (by name and SHA) |
| `refs/heads/fp/plan` | `8cb767509a56ff3a6ec9b3bec890d8ca6c90d491` | local branch | On `main`: ancestor of `main` | delete (by name and SHA) |
| `refs/heads/fp/retrieve` | `4b36ee692a0afc8ef871dde1f11925865a692fa8` | local branch | Archived: the `retrieve`/`read` prototype was not built; all eleven variants scored below arm A | delete (by name and SHA) |
| `refs/heads/fp/surface` | `bc71a0183b4ca18a1c78b15e225c3a171f782ada` | local branch | Archived: arm B and its revisions; the shipped form is #430 | delete (by name and SHA) |
| `refs/heads/golden/baseline-case-defects` | `5298ca1403ff22cc77b1520346a7648a793af592` | local branch | On `main`: #442; the two differing files (`TODO.md`, `improvements/INDEX.md`) differ by the squash merge's conflict resolution and index rebuild | delete (by name and SHA) |
| `refs/heads/research/caps-audit` | `4946d7d7755e142fd35914e2860bbcbab60f28b4` | local branch | On `main`: #441 | delete (by name and SHA) |
| `refs/heads/research/client-limits-and-peers` | `d5e3afcfc739254c0e24e9a7cfbdaa31a68194d7` | local branch | On `main`: #444 | delete (by name and SHA) |
| `refs/heads/research/client-text-limits` | `61f53e97b704e5b46a1e3afc44560850cc9fed9e` | local branch | Archived: 184 run files, hash-identical to `~/backups/client-text-limits-2026-11-14/runs/`; the README line naming that folder is the only other difference and `main` already says the same | delete (by name and SHA) |
| `refs/heads/research/family-decider-close` | `fab34dc2b7a9efb9e17f2c559f84039aa02d6f27` | local branch | On `main`: #445 | delete (by name and SHA) |
| `refs/heads/research/mcp-peer-survey` | `2fea25c43dd9857ee9ff7f3a7427a3321f37cf50` | local branch | On `main`: every file's content is in `main` history | delete (by name and SHA) |
| `refs/heads/tune-final-backup` | `1f60d651ddd56ac47510bae7a5b550dce222e7b9` | local branch | Archived: snapshots taken while loop 1 was rebased (2026-11-14 21:17 to 21:28 UTC); superseded by `tune/loop-1` (#446) | delete (by name and SHA) |
| `refs/heads/tune-final-backup2` | `a462813ccdfc6aed7c20cf7b47d0b15850dca218` | local branch | Archived: snapshots taken while loop 1 was rebased (2026-11-14 21:17 to 21:28 UTC); superseded by `tune/loop-1` (#446) | delete (by name and SHA) |
| `refs/heads/tune-final-backup3` | `ddb84764de3abe00d5dc68f8c7e393a5c7bba144` | local branch | Archived: snapshots taken while loop 1 was rebased (2026-11-14 21:17 to 21:28 UTC); superseded by `tune/loop-1` (#446) | delete (by name and SHA) |
| `refs/heads/tune/loop-1` | `aaffbbb43d398c6c898dc034679e73c4ea17a643` | local branch | On `main`: #446 | delete (by name and SHA) |
| `refs/heads/tune/loop-1-arm2` | `cf874a0f6c985fff4aabcaa405dff0b43ddd8b24` | local branch | Archived: measured arm 2 branch; arm 2 shipped in #446, record `ARM-2.md` | delete (by name and SHA) |
| `refs/heads/tune/loop-1-arm3` | `d4919118cdcb2f4ec6e225223828abc92f056807` | local branch | Archived: measured arm 3 branch; the micro-map removal shipped in #447, record `ARM-3.md` | delete (by name and SHA) |
| `refs/heads/tune/loop-2` | `31dfa566ee9ddccf37f7cfca728a1b271a883fb7` | local branch | On `main`: #447; also holds the five cited commits (`a49ee918`, `940dc013`, `3d65d0ff`, `bd9719fb`, `b8ea957d`), see `tune/loop-2-runs` | delete (by name and SHA) |
| `refs/heads/tune/loop-2-runs` | `431cfbe0108c39a2f0f4afe3d1eb959ef1544777` | local branch | Archived: identifier pointer (`a49ee918`, `940dc013`), its replay tooling (`3d65d0ff`) and `bd9719fb`/`b8ea957d`; not shipped by the loop 2 rule (revert). The 18 scan files are also in `~/backups/loop2-scans-2026-11-15/` | delete (by name and SHA) |
| `refs/remotes/origin/evals/baseline-2026-11-14` | `fd1b02e387353861c2602af7ca9ce106f3d1a871` | origin branch | Same as the local branch `evals/baseline-2026-11-14` | delete (lease on SHA) |
| `refs/remotes/origin/exp/family-decider` | `9667ac345f45c40105d4a307ecd97113181a7f79` | origin branch | Same as the local branch `exp/family-decider` | delete (lease on SHA) |
| `refs/remotes/origin/exp/fd-lab-a` | `885c990862615a653008f81d9ba55569e4b54d17` | origin branch | Same as the local branch `exp/fd-lab-a` | delete (lease on SHA) |
| `refs/remotes/origin/exp/fd-lab-b` | `45e47e71800098a0eee33b4a0d259db1a7fdefe4` | origin branch | Same as the local branch `exp/fd-lab-b` | delete (lease on SHA) |
| `refs/remotes/origin/exp/fd-sets` | `39ee9445aeea78dfc54c10c9af64517a880eb28d` | origin branch | Same as the local branch `exp/fd-sets` | delete (lease on SHA) |
| `refs/remotes/origin/exp/fd-st` | `a0d20c1e5e5c340ae581871783f7965593f95aba` | origin branch | Same as the local branch `exp/fd-st` | delete (lease on SHA) |
| `refs/remotes/origin/feat/stellar-org-source` | `b81e7a03b3f0aea8a70dc183ef90ac2d4eb1f451` | origin branch | Same as the local branch `feat/stellar-org-source` | delete (lease on SHA) |
| `refs/remotes/origin/main` | `0bfbc8f4bca2970a47de80d0b9da0fb480697636` | origin branch | Bundle base so the bundle has no prerequisites; not archived content | keep |
| `refs/remotes/origin/research/client-text-limits` | `61f53e97b704e5b46a1e3afc44560850cc9fed9e` | origin branch | Same as the local branch `research/client-text-limits` | delete (lease on SHA) |
| `refs/remotes/origin/research/mcp-peer-survey` | `2fea25c43dd9857ee9ff7f3a7427a3321f37cf50` | origin branch | Same as the local branch `research/mcp-peer-survey` | delete (lease on SHA) |
| `refs/remotes/origin/tune/loop-1-arm2` | `cf874a0f6c985fff4aabcaa405dff0b43ddd8b24` | origin branch | Same as the local branch `tune/loop-1-arm2` | delete (lease on SHA) |
| `refs/remotes/origin/tune/loop-1-arm3` | `d4919118cdcb2f4ec6e225223828abc92f056807` | origin branch | Same as the local branch `tune/loop-1-arm3` | delete (lease on SHA) |
| `refs/remotes/origin/tune/loop-2-runs` | `431cfbe0108c39a2f0f4afe3d1eb959ef1544777` | origin branch | Same as the local branch `tune/loop-2-runs` | delete (lease on SHA) |
| `refs/tags/archive/golden-2026-11-02-method` | `83423f97502a1e2b02ae8afae67369689cf0244f` | tag | Kept: the 2026-11-06 cleanup's record (#384); on `origin` | keep |
| `refs/tags/archive/golden-finalization-2026-11-03` | `ec67d5dae982d85015ac885b3a1042c67779b858` | tag | Kept: the 2026-11-06 cleanup's record (#384); on `origin` | keep |
| `refs/tags/archive/model-ranking-contract-2026-11-03` | `23271979b43bb3cfc407992466ac928a5c70333b` | tag | Kept: the 2026-11-06 cleanup's record (#384); on `origin` | keep |
| `refs/tags/archive/qa-followup-2026-11-03` | `c3d89c68981432f071c07b8decac8e79804cfc22` | tag | Kept: the 2026-11-06 cleanup's record (#384); on `origin` | keep |
| `refs/tags/fp-archive/live-recipe-e1145497` | `d5cb404bb16b71aa4f752024506d0fc81ca0ea63` | tag (local only) | Archived, `fp/retrieve` disposition: one commit under `src/retrieve/*` and its tests, tagged 'fp round archive' 2026-11-14 | keep |
| `refs/tags/fp-archive/read-body-7be04d03` | `2357347879392a1b5f2bdf846aa38d2e67d43614` | tag (local only) | Archived, `fp/retrieve` disposition: one commit under `src/retrieve/*` and its tests, tagged 'fp round archive' 2026-11-14 | keep |

## Worktrees (agentpc)

| Worktree | State | Plan |
|---|---|---|
| `client-text-limits` | `research/client-text-limits` | remove (phase B, no `--force`) |
| `gca` | `evals/baseline-2026-11-14` | remove |
| `loop2` | `tune/loop-2` | remove |
| `loop2-run` | `tune/loop-2-runs` | remove |
| `sorg` | `feat/stellar-org-source` | remove |
| `tune` | `tune/loop-1` | remove |
| `gca-eval` | detached at `361ff2ef` | **stays**: data directory for the pinned register and stored QA results |

Before each removal: re-hash that worktree's archived paths against the manifests and check
`git status --porcelain --ignored` shows nothing beyond the not-kept list.

Not kept from any worktree (rebuilt by scripts or local state): `.dev.vars` (a secret; `gca`, `sorg`,
`tune` hold shorter subsets, none archived), `node_modules/`, `.wrangler/` (local dev-server state that
may hold local tokens), `dist/`, `ecosystem-skills/.cache/`, `env.d.ts`, empty `tmp/`.

## Not bundled, by choice

31 commits reachable only from reflogs (`git fsck --no-reflogs --unreachable`): superseded drafts of
bundled or merged commits, autostash entries, and heads of merged pull requests whose branches are
gone (#434, #435, #440, #450 to #452). `git branch -D` drops the branch reflogs that kept some of them.

## Sibling backups the dispositions rely on

| Path (under `/home/tyler/backups/`) | Files | SHA-256 |
|---|---|---|
| `fd-2026-11-14/` | 578 | tree `5861651a04b84de9b5602fe3738da186ef30e159bd3140d530ba277a3c4e668a` |
| `client-text-limits-2026-11-14/` | 184 | tree `15f711b21dc754795fe0c639c7d95afc858ed4b1f11a02e02a838469fa0bf45a` |
| `loop2-scans-2026-11-15/` | 89 | tree `546cf40483e0ba933aa13b55bad5602c0b51e2445ca0d949282a3fa653f3eeec` |
| `fp-2026-11-12-evidence.tar.zst` | 1 | `4484ac837d779e584feeff22cc859fef27cc84d5b964274118093d684897c857` |
| `gca-2026-11-14-split.json` | 1 | `f683852ee2922dce1b73504582fca7109a21b5cdff89d72a219c51d6f9890efa` |

"Tree" SHA-256 is `find <dir> -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum`, run from
`/home/tyler/backups/`. All of these, the bundle, both tarballs and this manifest go to the Mac
second copy before phase B deletes anything.
