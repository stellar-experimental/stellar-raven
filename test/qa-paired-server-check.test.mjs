import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  SERVER_LOST_CODE,
  assertDualBoundServersUnchanged,
  dualBoundServerIdentity,
  pairedListenerPairs
} from "../eval/lib/bound-server-identity.mjs";
import { createServerListenerCheck } from "../eval/qa/paired-collection-supervisor.mjs";
import { pairedListenerCheck } from "../eval/qa/run-p6-judge-self-test.mjs";
import { listenerCommandOutput } from "./helpers/paired-plan-fixtures.mjs";
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
const recorded = { adapter: listener(8789, 8789), upstream: listener(8791, 8791) };
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
    return { adapter: listener(target.adapterPort, 8789), upstream: listener(target.upstreamPort, 8791) };
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
        identify: () => ({ ...structuredClone(recorded), upstream: listener(8791, 53679) })
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

// The launch writes the production reader's output to listeners.json. Every new check must accept
// that serialized record and must stop when the production reader later sees a lost or new listener.
describe("serialized production listener identities", () => {
  const A = "a".repeat(40);
  const B = "b".repeat(40);
  const TARGETS = {
    baseline: { adapterPort: 8789, adapterRevision: A, upstreamPort: 8791, upstreamRevision: B },
    candidate: { adapterPort: 8788, adapterRevision: A, upstreamPort: 8790, upstreamRevision: A }
  };
  function launch() {
    const listeners = {
      8789: { pid: 4101, command: "node", cwd: "/w/baseline-runner", revision: A },
      8791: { pid: 4102, command: "workerd", cwd: "/w/baseline-server", revision: B },
      8788: { pid: 4103, command: "node", cwd: "/w/candidate-runner", revision: A },
      8790: { pid: 4104, command: "workerd", cwd: "/w/candidate-server", revision: A }
    };
    const spawnSyncImpl = listenerCommandOutput(listeners);
    const identify = (target) => dualBoundServerIdentity(target, { spawnSyncImpl });
    const records = Object.fromEntries(Object.entries(TARGETS)
      .map(([arm, target]) => [arm, { identity: identify(target), attestation: { mode: "fixture" } }]));
    // The same serialization as paired-launch.mjs.
    const bytes = Buffer.from(`${JSON.stringify(records, null, 2)}\n`);
    const plan = {
      arms: Object.fromEntries(Object.entries(TARGETS).map(([arm, target]) => [arm, { collectionCommand: [
        process.execPath, "eval/qa/run-qa.mjs", "--port", String(target.adapterPort),
        "--upstream-port", String(target.upstreamPort),
        "--server-revision", target.upstreamRevision, "--adapter-revision", target.adapterRevision
      ] }])),
      p6: { listenersPath: "/run/listeners.json", listenersSha256: createHash("sha256").update(bytes).digest("hex") }
    };
    const checks = {
      validator: () => pairedListenerPairs(JSON.parse(bytes), TARGETS),
      p6: pairedListenerCheck(plan.p6.listenersPath, plan.p6.listenersSha256, { readFile: () => bytes, identify }),
      supervisor: createServerListenerCheck(plan, { readFile: () => bytes, identify }),
      runQa: createPairedRunCheck({
        pairedControl: { assertActive: () => {} },
        arm: "baseline",
        listenerPair: () => records.baseline.identity,
        identify
      })
    };
    return { listeners, records, bytes, checks };
  }

  it("records numeric process IDs, as the production reader returns them", () => {
    const { records, bytes } = launch();
    const parsed = JSON.parse(bytes);
    for (const arm of ["baseline", "candidate"]) {
      for (const side of ["adapter", "upstream"]) {
        expect(typeof records[arm].identity[side].pid).toBe("number");
        expect(parsed[arm].identity[side].pid).toBe(records[arm].identity[side].pid);
      }
    }
  });

  it.each(["validator", "p6", "supervisor", "runQa"])("accepts the serialized record in the %s check", (name) => {
    const { checks } = launch();
    expect(() => checks[name]()).not.toThrow();
  });

  it.each(["p6", "supervisor", "runQa"])("the %s check stops when the baseline port loses its listener", (name) => {
    const { listeners, checks } = launch();
    delete listeners[8791];
    let error;
    try { checks[name](); } catch (caught) { error = caught; }
    expect(error.code).toBe(SERVER_LOST_CODE);
    expect(error.message).toMatch(/^baseline server stopped answering on its port or changed: bound server identity on port 8791/);
  });

  it.each(["p6", "supervisor", "runQa"])("the %s check stops when a restart puts another process on the port", (name) => {
    const { listeners, checks } = launch();
    listeners[8791].pid = 53679;
    expect(() => checks[name]()).toThrow(/^baseline server stopped answering on its port or changed: bound server identity changed during paid calls \(pid\)/);
  });

  it("refuses a record whose process IDs became strings", () => {
    const { bytes } = launch();
    const record = JSON.parse(bytes);
    record.baseline.identity.upstream.pid = String(record.baseline.identity.upstream.pid);
    expect(() => pairedListenerPairs(record, TARGETS)).toThrow(/baseline listener record is not a recorded listener pair/);
  });
});
