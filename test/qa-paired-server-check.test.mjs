import { describe, expect, it } from "vitest";
import {
  SERVER_LOST_CODE,
  assertDualBoundServersUnchanged
} from "../eval/lib/bound-server-identity.mjs";
import {
  createRemoteIdentityGuard,
  REMOTE_IDENTITY_VECTOR_SCHEMA,
  remoteIdentityVectorSha256,
  runRemoteIdentityGuardedCall
} from "../eval/qa/remote-identity-guard.mjs";
import { createPairedRunCheck, runAnswerAttempts } from "../eval/qa/run-qa.mjs";
import { authorizeSpend, createSpendLedger, recordSpend } from "../eval/qa/spend-budget.mjs";

const revision = "a".repeat(40);
const listener = (port, pid) => ({
  port, pid, command: port % 2 ? "workerd" : "node", cwd: `/worktrees/${port}`, revision, dirty: false
});
const recorded = { adapter: listener(8789, "8789"), upstream: listener(8791, "8791") };
const vector = {
  schema: REMOTE_IDENTITY_VECTOR_SCHEMA,
  services: {
    scout: { openapiVersion: "test", canonicalOpenapiSha256: "1".repeat(64) },
    lumenloop: { advertisedContractIdentity: "test", canonicalInventorySha256: "2".repeat(64) },
    stellarDocs: { indexSettingsSha256: "3".repeat(64), canonicalTitleSetSha256: "4".repeat(64) }
  }
};
const transportFailure = { class: "transport", retryable: true, reason: "overloaded" };

// One paired baseline arm: the run-qa paired check, the remote identity guard, and the
// answering-attempt loop, with a fake listener reader and a fake answering call.
function pairedArm({ loseListener }) {
  const state = { lost: false, calls: 0, events: [] };
  const identify = (target) => {
    state.events.push("listener-check");
    if (state.lost) {
      throw new Error(`bound server identity on port ${target.upstreamPort}: expected one listener process, found 0`);
    }
    return { adapter: listener(target.adapterPort, "8789"), upstream: listener(target.upstreamPort, "8791") };
  };
  const check = createPairedRunCheck({
    pairedControl: { assertActive: () => {} },
    arm: "baseline",
    listenerPair: () => recorded,
    identify
  });
  const guard = createRemoteIdentityGuard({
    probeIdentity: { artifactPath: "fixture", sha256: "a".repeat(64) },
    expectedVectorSha256: remoteIdentityVectorSha256(vector),
    capture: () => {
      state.events.push("capture");
      if (loseListener === "during-before-capture" && state.calls === 0) state.lost = true;
      return vector;
    },
    checkCancelled: check
  });
  const ledger = createSpendLedger(10);
  const stopError = runAnswerAttempts((attempt) => runRemoteIdentityGuardedCall({
    guard,
    context: { id: "case-a", attempt },
    authorize: () => {
      check();
      return authorizeSpend(ledger, { method: "agent", id: "case-a", attempt });
    },
    call: () => {
      state.calls += 1;
      state.events.push("paid-call");
      if (loseListener === "after-first-attempt") state.lost = true;
      return { failure: transportFailure, costUsd: 0.1 };
    },
    recordSpend: (authorization, completed) => recordSpend(ledger, authorization, completed.costUsd)
  }));
  return { ...state, stopError, state };
}

describe("paired server checks before paid attempts", () => {
  it("passes while the recorded listener pair stays the same", () => {
    expect(() => assertDualBoundServersUnchanged({ baseline: recorded }, {
      identify: () => structuredClone(recorded)
    })).not.toThrow();
  });

  it("reports a lost or replaced listener with one stop code", () => {
    let error;
    try {
      assertDualBoundServersUnchanged({ candidate: recorded }, {
        identify: () => ({ ...structuredClone(recorded), upstream: listener(8791, "53679") })
      });
    } catch (caught) { error = caught; }
    expect(error.code).toBe(SERVER_LOST_CODE);
    expect(error.message).toMatch(/^candidate server stopped answering on its port or changed: .*\(pid\)/);
  });

  it("runs the retry after a transport failure while the listener stays", () => {
    const arm = pairedArm({ loseListener: "never" });
    expect(arm.state.calls).toBe(2);
    expect(arm.stopError).toBeNull();
  });

  it("prohibits the after-probe and the retry when the listener is lost during the first attempt", () => {
    const arm = pairedArm({ loseListener: "after-first-attempt" });
    expect(arm.state.calls).toBe(1);
    expect(arm.stopError.code).toBe(SERVER_LOST_CODE);
    expect(arm.stopError.message).toMatch(/^baseline server stopped answering on its port or changed: .*found 0$/);
    // The guard checks before its after-call probe, so no probe and no retry follow the loss.
    expect(arm.state.events.slice(-2)).toEqual(["paid-call", "listener-check"]);
  });

  it("checks again just before the answering call, after the identity probe", () => {
    const arm = pairedArm({ loseListener: "during-before-capture" });
    expect(arm.state.calls).toBe(0);
    expect(arm.stopError.code).toBe(SERVER_LOST_CODE);
    expect(arm.state.events.indexOf("paid-call")).toBe(-1);
  });

  it("makes no listener check for an unpaired run", () => {
    const events = [];
    createPairedRunCheck({
      pairedControl: null,
      arm: undefined,
      listenerPair: () => recorded,
      identify: () => { events.push("listener-check"); }
    })();
    expect(events).toEqual([]);
  });
});
