import { existsSync } from "node:fs";

export const PAIRED_COLLECTION_CONTROL_SCHEMA = "qa-paired-collection-control-v1";

export class PairedCollectionCancelledError extends Error {
  constructor(message = "paired collection cancelled") {
    super(message);
    this.name = "PairedCollectionCancelledError";
    this.code = "paired-collection-cancelled";
  }
}

export function createPairedCollectionChildControl({
  arm,
  cancellationFile,
  processRef = process,
  cancellationExists = existsSync
}) {
  if (typeof processRef.send !== "function") {
    throw new Error("paired collection control requires a Node IPC channel");
  }
  if (!arm || !cancellationFile) {
    throw new Error("paired collection control requires an arm and a cancellation file");
  }

  let cancelled = false;
  let closing = false;
  let cancellationReason = "paired collection cancelled";
  const waiters = [];

  const cancelLocal = (reason) => {
    cancelled = true;
    cancellationReason = reason || cancellationReason;
    const waiter = waiters.shift();
    if (waiter) waiter({ schema: PAIRED_COLLECTION_CONTROL_SCHEMA, type: "cancel" });
  };
  processRef.on("message", (message) => {
    if (message?.schema !== PAIRED_COLLECTION_CONTROL_SCHEMA) return;
    if (message.type === "cancel") {
      cancelLocal(message.reason);
      return;
    }
    const waiter = waiters.shift();
    if (waiter) waiter(message);
  });
  processRef.on("disconnect", () => {
    if (!closing) cancelLocal("paired collection supervisor disconnected");
  });

  const assertActive = () => {
    if (cancelled || cancellationExists(cancellationFile)) {
      throw new PairedCollectionCancelledError(cancellationReason);
    }
  };
  const receive = () => new Promise((resolve) => waiters.push(resolve));
  const waitFor = async (type) => {
    for (;;) {
      assertActive();
      const message = await receive();
      if (message?.schema !== PAIRED_COLLECTION_CONTROL_SCHEMA) continue;
      if (message.type === "cancel") assertActive();
      if (message.type === type) return message;
    }
  };
  const send = (message, callback) => {
    assertActive();
    if (processRef.connected === false) {
      throw new PairedCollectionCancelledError("paired collection supervisor disconnected");
    }
    try {
      processRef.send({
        schema: PAIRED_COLLECTION_CONTROL_SCHEMA,
        arm,
        ...message
      }, callback);
    } catch (error) {
      cancelLocal("paired collection supervisor disconnected");
      throw new PairedCollectionCancelledError(error.message);
    }
  };

  return {
    assertActive,
    async ready(details) {
      send({ type: "ready", ...details });
      await waitFor("start");
    },
    async rowComplete({ index, id }) {
      send({ type: "row-complete", index, id });
      await waitFor("continue");
    },
    async postflightComplete() {
      send({ type: "postflight-complete" });
      await waitFor("finalize");
    },
    failed(error) {
      try {
        send({
          type: "failed",
          code: error?.code ?? "collection-failed",
          message: String(error?.message ?? error)
        });
      } catch {}
    },
    complete({ resultsPath }) {
      return new Promise((resolve, reject) => {
        try {
          send({ type: "complete", resultsPath }, (error) => {
            if (error) return reject(error);
            closing = true;
            if (processRef.connected !== false) processRef.disconnect();
            resolve();
          });
        } catch (error) {
          reject(error);
        }
      });
    },
    close() {
      if (processRef.connected === false) return;
      closing = true;
      try { processRef.disconnect(); } catch {}
    }
  };
}
