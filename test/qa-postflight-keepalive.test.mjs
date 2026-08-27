import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const RUN_QA_PATH = fileURLToPath(new URL("../eval/qa/run-qa.mjs", import.meta.url));
const REPORT_LIVE_SURFACE_PATH = fileURLToPath(
  new URL("../eval/report-live-surface.mjs", import.meta.url)
);

// The raw fixture controls an unadvertised idle close and the exact chunked response.
const SERVER_SOURCE = String.raw`
  const net = require("node:net");
  const tools = ["search", "execute"].map((name) => ({
    name,
    description: name,
    inputSchema: { type: "object" },
    outputSchema: { type: "object" }
  }));
  const server = net.createServer((socket) => {
    console.log("connection");
    let buffered = Buffer.alloc(0);
    socket.setTimeout(1000, () => socket.destroy());
    socket.on("data", (chunk) => {
      buffered = Buffer.concat([buffered, chunk]);
      while (true) {
        const headerEnd = buffered.indexOf("\r\n\r\n");
        if (headerEnd < 0) return;
        const headers = buffered.subarray(0, headerEnd).toString();
        const length = Number(/content-length:\s*(\d+)/i.exec(headers)?.[1] ?? 0);
        const bodyEnd = headerEnd + 4 + length;
        if (buffered.length < bodyEnd) return;
        const message = JSON.parse(buffered.subarray(headerEnd + 4, bodyEnd).toString());
        buffered = buffered.subarray(bodyEnd);
        const result = message.method === "initialize"
          ? {
              protocolVersion: "2025-03-26",
              capabilities: {},
              serverInfo: { name: "keepalive-fixture", version: "0" },
              instructions: "fixture"
            }
          : { tools };
        const event = "data: " + JSON.stringify({ jsonrpc: "2.0", id: message.id, result }) + "\n\n";
        socket.write(
          "HTTP/1.1 200 OK\r\ncontent-type: text/event-stream\r\ntransfer-encoding: chunked\r\n\r\n" +
          Buffer.byteLength(event).toString(16) + "\r\n" + event + "\r\n0\r\n\r\n"
        );
      }
    });
  });
  server.listen(0, "localhost", () => console.log(server.address().port));
`;

const CLIENT_SOURCE = String.raw`
  const { spawnSync } = await import("node:child_process");
  const { pathToFileURL } = await import("node:url");
  const moduleUrl = pathToFileURL(process.argv[1]).href + "?postflight-test";
  const port = Number(process.argv[2]);
  const mode = process.argv[3];
  const probe = mode === "qa"
    ? async () => {
        const { probeLiveSurface } = await import(moduleUrl);
        await probeLiveSurface(port, {
          surface: "search-execute",
          searchTool: "search",
          plainSurface: null
        });
      }
    : async () => {
        const { fetchLiveSurface } = await import(moduleUrl);
        await fetchLiveSurface("http://localhost:" + port + "/mcp");
      };
  await probe();
  spawnSync(process.execPath, ["-e", "Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1500)"]);
  await probe();
`;

async function startServer() {
  const child = spawn(process.execPath, ["-e", SERVER_SOURCE], {
    stdio: ["ignore", "pipe", "inherit"]
  });
  const output = [];
  child.stdout.on("data", (chunk) => output.push(String(chunk)));
  const [chunk] = await once(child.stdout, "data");
  return {
    child,
    port: Number(String(chunk).trim()),
    connectionCount: () => output.join("").split("\n").filter((line) => line === "connection").length
  };
}

async function waitForConnectionCount(connectionCount, expected) {
  const deadline = Date.now() + 1000;
  while (connectionCount() < expected && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

describe("evaluation postflight connection lifetime", () => {
  it.each([
    ["QA", RUN_QA_PATH, "qa"],
    ["discovery", REPORT_LIVE_SURFACE_PATH, "discovery"]
  ])("uses fresh connections for the %s postflight probe", async (_label, modulePath, mode) => {
    const { child, port, connectionCount } = await startServer();
    try {
      const result = spawnSync(
        process.execPath,
        ["--input-type=module", "-e", CLIENT_SOURCE, modulePath, String(port), mode],
        { encoding: "utf8" }
      );
      expect(result.status, result.stderr).toBe(0);
      await waitForConnectionCount(connectionCount, 4);
      expect(connectionCount()).toBe(4);
    } finally {
      child.kill();
    }
  });
});
