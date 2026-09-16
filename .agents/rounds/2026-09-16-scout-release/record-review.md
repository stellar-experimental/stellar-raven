# Scout release-record review

Date: 2026-09-16

Scope: The staged `.agents/rounds` release metadata against base `022970d5`.

Result: BLOCKED. Two record-integrity findings need repair before publication.
No runtime file changed.

## Findings

### High — dated worktree snapshot claims current state

`.agents/rounds/2026-09-16-scout-release/final-worktree-disposition.md:3`

The document calls its pre-cleanup disposition current.
It says removal is unauthorized and production checks remain pending.
It also lists the three controls as present and clean.

The release record states that those controls were removed after production verification.
Current Git worktree metadata no longer lists `deploy`, `scout-runtime-accepted`, or `scout-runtime-audit`.
The source-integration checkout also contains this staged metadata update.

The document identifies itself as a snapshot, but it has no observation time.
Its current-state wording can mislead a later reader.

Action: Label this document as a dated pre-cleanup snapshot.
Add its observation time and a link to the superseding release record.
Remove the unqualified `Current verdict` and `Current worktree state` labels.

### High — cleanup claims lack durable support

`.agents/rounds/2026-09-16-scout-release.md:72`

The release record claims the removals and scoped `sdf` binding deactivation.
The cleanup receipt records only paths, heads, clean state, ancestry, and removal.
It does not record ownership, authorization, binding identity, or deactivation verification.

Current Git metadata supports the three absences.
It also supports the two recorded ancestor relationships.
It cannot prove the actor, the owner check, or the deleted binding scope.

Action: Add a non-secret cleanup receipt for the owner decision and binding result.
State the binding scope, verification method, and observation time.
Keep the primary and profile bindings out of the receipt values.

## Verified evidence

- All changed paths are under `.agents/rounds`.
- The diff has no whitespace error.
- All new JSON files parse successfully.
- All local Markdown targets in changed metadata exist.
- The production proof equals its expected catalog, search, skill, and companion values.
- It records 17 of 17 matching search hashes and a matching full catalog hash.
- It records the pinned Scout body and three matching companion files.
- The health observation is post-deployment.
- Its embedded skill canary predates deployment and is correctly scoped as older evidence.
- The deployment record marks the source revision as not independently observed.
- The supplied authenticated PR #168 readback records four successful checks.
- The supplied authenticated issue #141 readback records its stated closure time.
- The direct issue #167 readback recorded an open state before a later network failure.
- PR #168 records the reviewed head and squash commit with equal Git trees.

## Verification limit

A later GitHub API call failed with a network error.
This review did not retry that call.
The supplied authenticated readbacks support the PR #168 and issue #141 claims.

## Boundary

This audit did not run production probes or inspect secret-file contents.
It did not modify repository files, branches, worktrees, bindings, or panes.

## Repair recheck

Result: ACCEPTED. The two earlier blockers are resolved.
No new defect appears in the repaired scope.

The worktree document now identifies a pre-cleanup historical snapshot.
It records the original report time and links the superseding release record.
The original report artifact has the same modification time.
Its removal restriction now applies only to the earlier read-only audit.

The new cleanup receipt records the root coordinator decision and excluded scope.
It records clean-state, ancestry, removal, and absence checks.
It records the scoped deactivation command, exit code, response, and time window.
The response contains no credential value or other binding value.
The release record now limits the claim to that directory binding.

The receipt JSON parses successfully.
Both repaired local links resolve.
Current Git metadata omits all three removed controls.
The two retained cleanup commit heads remain ancestors of `origin/main`.
The repaired diff has no whitespace error.

This recheck did not broaden the original review scope.
