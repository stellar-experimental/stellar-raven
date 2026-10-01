# Independent executable amendment review

Verdict: GO PAID 2 OK

Review date: 2026-10-01. The reviewer did not author this amendment.
No gap remains within this bounded review.
The coordinator's explicit `GO PAID 2` remains necessary before collection.

## Checked

### Fixed executable

I read `amend-sd-binary.md` and the final executable amendment in `sd-measure-plan.md:1598`.
The private directory has mode `0700` and contains only its `claude` link.
That link directly targets `/Users/kalepail/.local/share/claude/versions/2.1.287`.
It does not target the public `/Users/kalepail/.local/bin/claude` symlink.
I independently checked the versioned file through the private command.

- Version: `2.1.287 (Claude Code)`.
- SHA-256: `6eab8333fe2121553100d8f40bfada384a3e989b94f947e18ba6677a6fcb41ea`.
- Resolved command: `$B/sd-measure-bin/claude`.
- Real path: `/Users/kalepail/.local/share/claude/versions/2.1.287`.

`eval/lib/executable-identity.mjs:14` searches `PATH` in order.
Its identity function records the real path, version, and file hash at line 35.
The amendment places the private directory first and asserts that position before each collection.
Moving the public symlink cannot redirect this command.

### Answering and judge paths

I read the current code in the `sd-adapter` worktree.
`eval/qa/run-qa.mjs:1623` resolves and checks `claude` before collection.
Line 1862 passes that captured `resolvedPath` into the answering runner.
Lines 838–847 pass the same command to `spawnSync`.
Line 1633 supplies that captured path to every inline judge call.
`eval/qa/judge.mjs:593` executes the supplied command.
Both paths therefore reach the same versioned file through the private link.
Both child processes inherit the prepared collection environment.

### Environment and failure propagation

`agentEnvironmentIdentity()` includes `PATH` but excludes `DISABLE_AUTOUPDATER`.
I independently confirmed that changing only this flag leaves the environment hash unchanged.
The amendment separately asserts `DISABLE_AUTOUPDATER === "1"` before freezing and before each paid command.
It also requires `QA_AGENT_PROMPT_APPEND` to remain absent.

The freeze uses exclusive creation with `flag: "wx"` and mode `0600`.
The plan requires one persistent collection shell and forbids replacing the frozen expected hash after a mismatch.
The real collection freeze file remains absent.
The author's validation receipt does not substitute for that future collection freeze.

The per-command assertion checks the directory contents, link target, resolved path, real path, version, hash, and frozen environment.
The plan explicitly requires failure propagation, such as `set -e`, before the next paid command.
The runner independently checks the binary and environment hashes at lines 1623–1631 before its paid loop.

I tested the amendment assertion without creating a freeze file or running collection.
I held the expected environment hash in memory for these tests.
A harmless shell marker represented the next command.

| Assertion case | Exit code | Next command reached |
| --- | ---: | --- |
| Correct prepared environment and binary | 0 | Yes |
| `DISABLE_AUTOUPDATER=0` | 1 | No |
| Private directory removed from first `PATH` position | 1 | No |
| Hashed Claude environment changed | 1 | No |
| Expected binary hash changed | 1 | No |

### Other reviewed conditions

The original plan remains byte-identical to its identity-stop receipt.
The first **80639 bytes** reproduce SHA-256 `ce82e5db26d94c8ffdd8fcbb8a9b3e053f471a3dd5a62e232327d7b359cb9838`.
That hash comes from `reports/sd-measure-checks/paid-launch-stop.json`.
The amendment follows that unchanged content.
The complete reviewed plan has SHA-256 `b1f014f1cec7a5de1ec53a4058b0abf284a9c0cca68613842b1a6d6cdffe2028`.

The amendment supersedes only the executable and environment preparation.
The four existing commands retain one budget flag each.
Their order remains baseline battery, baseline live, candidate battery, and candidate live.
Their caps remain `$25`, `$20`, `$25`, and `$20`; the total remains `$90`.
The 20 battery cases, 15 live cases, models, two-call panels, and source pins remain unchanged.
The server order, variance rules, reading rules, allocation restrictions, and stop rules remain unchanged.
Repeated judging still requires separate bounded authorization.
The amendment preserves all revision, surface, remote identity, input, and cost assertions.

Both worktree revisions still match their recorded commits.
All Appendix C evaluation file hashes match in both worktrees.

## Review limits

This review validates the amendment and its executable-resolution path.
It does not replace the collection-time assertions or the original launch conditions.
I ran only free local identity checks and assertion tests.
I made no paid call, network probe, server start, Git write, or environment-file read.
I changed only this review report.
