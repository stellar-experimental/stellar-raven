import { EventEmitter } from "node:events";
import { describe, expect, it } from "vitest";
import {
  PAIRED_COLLECTION_CONTROL_SCHEMA,
  PairedCollectionCancelledError,
  createPairedCollectionChildControl
} from "../eval/qa/paired-collection-control.mjs";

class FakeProcess extends EventEmitter {
  connected = true;
  sent = [];

  send(message, callback) {
    this.sent.push(message);
    callback?.(null);
  }

  disconnect() {
    this.connected = false;
    this.emit("disconnect");
  }
}

const supervisorMessage = (type, extra = {}) => ({
  schema: PAIRED_COLLECTION_CONTROL_SCHEMA,
  type,
  ...extra
});

describe("paired collection child control", () => {
  it("waits at each barrier and closes only after completion delivery", async () => {
    const processRef = new FakeProcess();
    const control = createPairedCollectionChildControl({
      arm: "baseline",
      cancellationFile: "/unused",
      processRef,
      cancellationExists: () => false
    });

    const ready = control.ready({ selectedIdsSha256: "a" });
    expect(processRef.sent.at(-1)).toMatchObject({ arm: "baseline", type: "ready" });
    processRef.emit("message", supervisorMessage("start"));
    await ready;

    const row = control.rowComplete({ index: 0, id: "case-a" });
    expect(processRef.sent.at(-1)).toMatchObject({ type: "row-complete", index: 0, id: "case-a" });
    processRef.emit("message", supervisorMessage("continue", { index: 0 }));
    await row;

    const postflight = control.postflightComplete();
    processRef.emit("message", supervisorMessage("finalize"));
    await postflight;
    await control.complete({ resultsPath: "/result.json" });
    expect(processRef.sent.at(-1)).toMatchObject({ type: "complete", resultsPath: "/result.json" });
    expect(processRef.connected).toBe(false);
  });

  it("stops before another spend when the exclusive marker exists", () => {
    const processRef = new FakeProcess();
    const control = createPairedCollectionChildControl({
      arm: "candidate",
      cancellationFile: "/cancelled",
      processRef,
      cancellationExists: () => true
    });
    expect(() => control.assertActive()).toThrow(PairedCollectionCancelledError);
    expect(() => control.failed(new Error("ignored"))).not.toThrow();
  });

  it("rejects a pending barrier after supervisor cancellation", async () => {
    const processRef = new FakeProcess();
    const control = createPairedCollectionChildControl({
      arm: "candidate",
      cancellationFile: "/unused",
      processRef,
      cancellationExists: () => false
    });
    const barrier = control.ready({});
    processRef.emit("message", supervisorMessage("cancel", { reason: "peer stopped" }));
    await expect(barrier).rejects.toThrow(/peer stopped/);
  });

  it("handles an already closed channel during cleanup", () => {
    const processRef = new FakeProcess();
    const control = createPairedCollectionChildControl({
      arm: "baseline",
      cancellationFile: "/unused",
      processRef,
      cancellationExists: () => false
    });
    processRef.connected = false;
    expect(() => control.close()).not.toThrow();
    expect(() => control.assertActive()).not.toThrow();
    expect(() => control.failed(new Error("closed"))).not.toThrow();
  });
});
