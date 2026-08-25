# ADR-0006: Solo process lifecycle follows recursive ownership

- Status: superseded by `AGENTS.md` “Coordination” (2026-08-25); the ownership rule carried over
  to Herdr panes, the Solo mechanics did not
- Driver: recovery review after unrelated Solo processes were closed during release cleanup
- Evidence: `solo://proj/49/scratchpad/solo-process-owners--626`

## Context

Solo is a shared project control plane. Its process list can contain long-lived services, bounded
reviewers, timers, and work owned by different parent agents. Process idleness, a completed
handoff, or a broad cleanup request does not reveal whether the process is safe for a different
agent to close. During a release closeout, the root agent closed six processes that it had not
spawned. The user correctly identified that this could discard unanswered questions or make work
look reconciled when only its process record had been removed.

## Decision

Lifecycle authority is recursive and non-transferable by default:

- an agent may create Solo processes only as its own descendants;
- an agent may stop, close, interrupt, restart, or replace only itself and descendants it spawned;
- parent, sibling, unrelated, and other agents' descendant processes remain with their owners;
- idle state, stopped state, handoff text, release cleanup, or repository completion does not
  transfer ownership;
- if the owning agent is available, ask it to reconcile its process tree;
- if ownership is unknown or the owner is unavailable, lifecycle action requires an explicit user
  exception naming the exact process.

The same rule applies recursively to every descendant. A cleanup report may identify unrelated
processes, but it may not silently adopt or close them.

## Consequences

Release closeout must distinguish repository cleanliness from shared Solo-state ownership. The
root agent can close its own reviewer tree and timers, report unrelated residual processes, and
ask the appropriate owner or user to act. This is deliberately narrower than general repository
authority: permission to commit, deploy, or clean Git state does not imply permission to erase
another agent's control-plane state.
