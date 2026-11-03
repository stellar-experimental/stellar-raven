import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";
import { assertDeadline } from "./runner-support.mjs";

/** The parent retains evidence if a blocked provider requires child termination. */
export class BindingClient {
  constructor({ spawn = fork } = {}) {
    this.child = spawn(fileURLToPath(new URL("./binding-worker.mjs", import.meta.url)), [], {
      stdio: ["ignore", "ignore", "ignore", "ipc"], execArgv: [], serialization: "json", detached: true
    });
    this.pending = null;
    this.stopped = false;
    this.child.on("message", (message) => {
      const pending = this.pending;
      if (!pending) return;
      if (["response", "response-boundary", "reported-cost", "raw-started"].includes(message.type)) {
        if (message.requestId !== pending.requestId) return this.fail("worker-request-identity-mismatch");
        try { pending.onEvidence(message); } catch { this.fail("incremental-evidence-write-failed"); }
      } else if (message.type === "fatal") this.fail("provider-worker-failed");
      else if (pending.expectedType === message.type) {
        this.pending = null;
        clearTimeout(pending.timer);
        pending.resolve(message);
      } else this.fail("unexpected-worker-message");
    });
    this.child.on("error", () => this.fail("provider-worker-spawn-failed"));
    this.child.on("exit", () => { this.stopped = true; this.rejectPending("provider-worker-exited"); });
  }

  rejectPending(code) {
    const pending = this.pending;
    if (pending) { this.pending = null; clearTimeout(pending.timer); pending.reject(new Error(code)); }
  }

  fail(code) {
    this.stopped = true;
    this.rejectPending(code);
    this.killOwnedGroup("SIGTERM");
    // A kernel backstop also covers a child that cannot handle SIGTERM.
    const kill = setTimeout(() => this.killOwnedGroup("SIGKILL"), 1000);
    kill.unref();
  }

  killOwnedGroup(signal) {
    // fork(detached:true) creates this owned process group on this macOS host.
    try {
      if (process.platform !== "win32" && Number.isSafeInteger(this.child.pid)) process.kill(-this.child.pid, signal);
      else this.child.kill(signal);
    } catch { this.child.kill(signal); }
  }

  send(message, expectedType, timeoutMs, onEvidence = () => {}) {
    if (this.stopped || this.pending) throw new Error("provider-worker-unavailable");
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => this.fail("provider-host-timeout"), timeoutMs);
      this.pending = { expectedType, requestId: message.requestId, timer, onEvidence, resolve, reject };
      this.child.send(message, (error) => { if (error) this.fail("provider-ipc-failed"); });
    });
  }

  async initialize(accountId) {
    return (await this.send({ type: "init", accountId }, "ready", 60_000)).identity;
  }

  async call({ plan, options, expectedIdentity, requestId, onEvidence }) {
    const remaining = assertDeadline(plan.deadline);
    return this.send({ type: "call", expectedIdentity, requestId, options, deadline: plan.deadline,
      requestTimeoutMs: Math.min(plan.requestTimeoutMs, remaining) }, "result",
    Math.min(plan.hostBackstopMs, remaining + plan.settlementGraceMs), onEvidence);
  }

  async identity() { return (await this.send({ type: "identity" }, "identity", 10_000)).identity; }

  async close() {
    if (this.stopped) return;
    this.stopped = true;
    this.rejectPending("provider-worker-closed");
    await new Promise((resolve) => {
      if (this.child.exitCode !== null || this.child.signalCode !== null) return resolve();
      const timer = setTimeout(() => { this.killOwnedGroup("SIGKILL"); }, 2000);
      this.child.once("exit", () => { clearTimeout(timer); resolve(); });
      this.child.send({ type: "close" }, (error) => { if (error) this.killOwnedGroup("SIGTERM"); });
    });
  }
}
