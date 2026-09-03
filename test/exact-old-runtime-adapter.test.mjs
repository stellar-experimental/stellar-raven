import http from "node:http";
import { once } from "node:events";
import {
  brotliCompressSync,
  brotliDecompressSync,
  deflateRawSync,
  deflateSync,
  gunzipSync,
  gzipSync,
  inflateSync
} from "node:zlib";
import { describe, expect, it } from "vitest";
import {
  adaptInitializeMessage,
  adaptInitializeResponseBody,
  assertAdapterAttestation,
  createExactOldRuntimeAdapter
} from "../eval/qa/exact-old-runtime-adapter.mjs";
import {
  assertStableDualBoundServerIdentity,
  dualBoundServerIdentity
} from "../eval/lib/bound-server-identity.mjs";

const OLD_REVISION = "a".repeat(40);
const RUNNER_REVISION = "b".repeat(40);

async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return server.address().port;
}

async function close(server) {
  server.close();
  await once(server, "close");
}

function request(port, { body, headers = {}, path = "/mcp" }) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: "127.0.0.1",
      port,
      path,
      method: body === undefined ? "GET" : "POST",
      headers
    }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({
        status: res.statusCode,
        statusMessage: res.statusMessage,
        headers: res.headers,
        rawHeaders: res.rawHeaders,
        body: Buffer.concat(chunks)
      }));
    });
    req.on("error", reject);
    if (body !== undefined) req.end(body);
    else req.end();
  });
}

function identity(port, revision = OLD_REVISION) {
  return {
    verification: "listener-process-cwd",
    port,
    pid: 123,
    command: "workerd",
    cwd: "/tmp/old-server",
    revision,
    dirty: false
  };
}

function initializeMessage({ revision = null } = {}) {
  return {
    jsonrpc: "2.0",
    id: 1,
    result: {
      protocolVersion: "2025-03-26",
      capabilities: { tools: { listChanged: true } },
      serverInfo: {
        name: "raven",
        version: "0.1.0",
        ...(revision ? { sourceRevision: revision } : {})
      },
      instructions: "Keep every instruction byte."
    }
  };
}

function framedInitialize(contentType, message) {
  return Buffer.from(
    contentType === "text/event-stream"
      ? `event: message\ndata: ${JSON.stringify(message)}\n\n`
      : `${JSON.stringify(message)}\n`
  );
}

const CODECS = {
  identity: { encode: (body) => body, decode: (body) => body },
  gzip: { encode: gzipSync, decode: gunzipSync },
  deflate: { encode: deflateSync, decode: inflateSync },
  "raw-deflate": { encode: deflateRawSync, decode: inflateSync },
  br: { encode: brotliCompressSync, decode: brotliDecompressSync }
};

async function proxiedInitialize({
  mode,
  contentType = "application/json",
  codec = "identity",
  headers = {}
}) {
  const native = initializeMessage({ revision: mode === "verify-native" ? OLD_REVISION : null });
  const nativeDecoded = framedInitialize(contentType, native);
  const nativeBody = CODECS[codec].encode(nativeDecoded);
  const contentEncoding = codec === "raw-deflate" ? "deflate" : codec;
  const upstream = http.createServer((_req, res) => {
    res.sendDate = false;
    res.writeHead(203, "Pinned Initialize", {
      "Content-Type": contentType,
      ...(contentEncoding === "identity" ? {} : { "Content-Encoding": contentEncoding }),
      "Content-Length": nativeBody.length,
      "Mcp-Session-Id": "pinned-session",
      "X-Preserved": "yes",
      ...headers
    });
    res.end(nativeBody);
  });
  const upstreamPort = await listen(upstream);
  const upstreamIdentity = identity(upstreamPort);
  const adapter = createExactOldRuntimeAdapter({
    upstreamUrl: `http://127.0.0.1:${upstreamPort}`,
    sourceRevision: OLD_REVISION,
    mode,
    upstreamIdentity,
    attestUpstream: () => ({ ...upstreamIdentity })
  });
  const adapterPort = await listen(adapter);
  try {
    const result = await request(adapterPort, {
      body: Buffer.from('{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'),
      headers: { "content-type": "application/json" }
    });
    return { result, native, nativeBody, nativeDecoded };
  } finally {
    await close(adapter);
    await close(upstream);
  }
}

describe("exact-old-runtime MCP adapter", () => {
  it("passes requests, tool results, errors, schemas, and session headers unchanged", async () => {
    const requestBody = Buffer.from('{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}\n');
    const responseBody = Buffer.from(
      '[{"jsonrpc":"2.0","id":2,"result":{"tools":[{"name":"search","inputSchema":{"type":"object","properties":{"query":{"type":"string"}}}}]}},{"jsonrpc":"2.0","id":3,"error":{"code":-32602,"message":"preserve this error"}}]\n'
    );
    let receivedBody = null;
    let receivedSession = null;
    const upstream = http.createServer((req, res) => {
      const chunks = [];
      receivedSession = req.headers["mcp-session-id"];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => {
        receivedBody = Buffer.concat(chunks);
        res.writeHead(409, {
          "content-type": "application/json",
          "mcp-session-id": "session-response",
          "x-upstream-error": "preserved",
          "content-length": responseBody.length
        });
        res.end(responseBody);
      });
    });
    const upstreamPort = await listen(upstream);
    const upstreamIdentity = identity(upstreamPort);
    const adapter = createExactOldRuntimeAdapter({
      upstreamUrl: `http://127.0.0.1:${upstreamPort}`,
      sourceRevision: OLD_REVISION,
      mode: "add-missing",
      upstreamIdentity,
      attestUpstream: () => ({ ...upstreamIdentity })
    });
    const adapterPort = await listen(adapter);
    try {
      const result = await request(adapterPort, {
        body: requestBody,
        headers: {
          "content-type": "application/json",
          "content-length": requestBody.length,
          "mcp-session-id": "session-request"
        }
      });
      expect(receivedBody).toEqual(requestBody);
      expect(receivedSession).toBe("session-request");
      expect(result.status).toBe(409);
      expect(result.body).toEqual(responseBody);
      expect(result.headers["mcp-session-id"]).toBe("session-response");
      expect(result.headers["x-upstream-error"]).toBe("preserved");
    } finally {
      await close(adapter);
      await close(upstream);
    }
  });

  it.each(["application/json", "text/event-stream"])(
    "adds only sourceRevision to an old %s initialize result",
    (contentType) => {
    const native = initializeMessage();
    const body = framedInitialize(contentType, native);
    const adapted = adaptInitializeResponseBody(body, contentType, {
      mode: "add-missing",
      sourceRevision: OLD_REVISION
    });
    const text = adapted.toString("utf8");
    const data = contentType === "text/event-stream"
      ? text.split("\n").find((line) => line.startsWith("data: ")).slice(6)
      : text;
    const parsed = JSON.parse(data);
    const expected = structuredClone(native);
    expected.result.serverInfo.sourceRevision = OLD_REVISION;
    expect(parsed).toEqual(expected);
    expect(parsed.result.instructions).toBe(native.result.instructions);
    expect(parsed.result.capabilities).toEqual(native.result.capabilities);
  });

  it.each(["application/json", "text/event-stream"])(
    "verifies and preserves candidate %s initialize bytes",
    (contentType) => {
    const body = framedInitialize(contentType, initializeMessage({ revision: OLD_REVISION }));
    const adapted = adaptInitializeResponseBody(body, contentType, {
      mode: "verify-native",
      sourceRevision: OLD_REVISION
    });
    expect(adapted).toBe(body);
    expect(adapted).toEqual(body);
  });

  it("rejects native revision mismatches and forbidden old-arm mutations", () => {
    const base = { result: { serverInfo: { name: "raven" }, instructions: "same" } };
    expect(() => adaptInitializeMessage(base, {
      mode: "verify-native",
      sourceRevision: OLD_REVISION
    })).toThrow(/native source revision mismatch/);
    expect(() => adaptInitializeMessage({
      result: { serverInfo: { name: "raven", sourceRevision: "c".repeat(40) } }
    }, {
      mode: "add-missing",
      sourceRevision: OLD_REVISION
    })).toThrow(/requires no native source revision/);
  });

  it.each(["identity", "gzip", "deflate", "raw-deflate", "br"])(
    "mutates an old initialize response through the %s codec",
    async (codec) => {
      const { result, native } = await proxiedInitialize({ mode: "add-missing", codec });
      expect(result.status).toBe(203);
      const decoded = CODECS[codec].decode(result.body).toString("utf8");
      const parsed = JSON.parse(decoded);
      const expected = structuredClone(native);
      expected.result.serverInfo.sourceRevision = OLD_REVISION;
      expect(parsed).toEqual(expected);
      expect(result.headers["content-length"]).toBe(String(result.body.length));
    }
  );

  it.each([
    ["application/json", "identity"],
    ["application/json", "gzip"],
    ["application/json", "deflate"],
    ["application/json", "raw-deflate"],
    ["application/json", "br"],
    ["text/event-stream", "identity"],
    ["text/event-stream", "gzip"],
    ["text/event-stream", "deflate"],
    ["text/event-stream", "raw-deflate"],
    ["text/event-stream", "br"]
  ])("preserves the full candidate HTTP response for %s with %s", async (contentType, codec) => {
    const integrityHeaders = {
      ETag: '"native-etag"',
      Digest: "sha-256=native",
      "Content-MD5": "native-md5",
      "Content-Digest": "sha-256=:native:",
      "Repr-Digest": "sha-256=:representation:",
      "X-Amz-Checksum-Sha256": "native-amz",
      "X-Goog-Hash": "crc32c=native"
    };
    const { result, nativeBody } = await proxiedInitialize({
      mode: "verify-native",
      contentType,
      codec,
      headers: integrityHeaders
    });

    expect(result.status).toBe(203);
    expect(result.statusMessage).toBe("Pinned Initialize");
    expect(result.body).toEqual(nativeBody);
    expect(result.headers["content-length"]).toBe(String(nativeBody.length));
    expect(result.headers["content-type"]).toBe(contentType);
    expect(result.headers["content-encoding"]).toBe(codec === "raw-deflate" ? "deflate" : codec === "identity" ? undefined : codec);
    expect(result.headers["mcp-session-id"]).toBe("pinned-session");
    expect(result.headers["x-preserved"]).toBe("yes");
    expect(result.headers.etag).toBe('"native-etag"');
    expect(result.headers.digest).toBe("sha-256=native");
    expect(result.headers["content-md5"]).toBe("native-md5");
    expect(result.headers["content-digest"]).toBe("sha-256=:native:");
    expect(result.headers["repr-digest"]).toBe("sha-256=:representation:");
    expect(result.headers["x-amz-checksum-sha256"]).toBe("native-amz");
    expect(result.headers["x-goog-hash"]).toBe("crc32c=native");
  });

  it("removes stale integrity headers after old-arm mutation", async () => {
    const { result, nativeBody } = await proxiedInitialize({
      mode: "add-missing",
      headers: {
        ETag: '"native-etag"',
        Digest: "sha-256=native",
        "Content-MD5": "native-md5",
        "Content-Digest": "sha-256=:native:",
        "Repr-Digest": "sha-256=:representation:",
        "X-Amz-Checksum-Crc32": "native-amz",
        "X-Goog-Hash": "crc32c=native"
      }
    });

    expect(result.body).not.toEqual(nativeBody);
    expect(result.headers["content-length"]).toBe(String(result.body.length));
    expect(result.headers["x-preserved"]).toBe("yes");
    for (const name of [
      "etag",
      "digest",
      "content-md5",
      "content-digest",
      "repr-digest",
      "x-amz-checksum-crc32",
      "x-goog-hash"
    ]) {
      expect(result.headers[name]).toBeUndefined();
    }
  });

  it("streams non-initialize responses without buffering", async () => {
    let releaseSecond;
    const secondAllowed = new Promise((resolve) => { releaseSecond = resolve; });
    const upstream = http.createServer(async (_req, res) => {
      res.writeHead(200, { "content-type": "text/event-stream" });
      res.write("data: first\n\n");
      await secondAllowed;
      res.end("data: second\n\n");
    });
    const upstreamPort = await listen(upstream);
    const upstreamIdentity = identity(upstreamPort);
    const adapter = createExactOldRuntimeAdapter({
      upstreamUrl: `http://127.0.0.1:${upstreamPort}`,
      sourceRevision: OLD_REVISION,
      mode: "add-missing",
      upstreamIdentity,
      attestUpstream: () => ({ ...upstreamIdentity })
    });
    const adapterPort = await listen(adapter);
    try {
      const firstChunk = new Promise((resolve, reject) => {
        const req = http.request({
          hostname: "127.0.0.1",
          port: adapterPort,
          path: "/mcp",
          method: "POST",
          headers: { "content-type": "application/json" }
        }, (res) => {
          const chunks = [];
          res.once("data", (chunk) => {
            chunks.push(chunk);
            resolve({ res, chunks });
          });
        });
        req.on("error", reject);
        req.end('{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{}}');
      });
      const observed = await firstChunk;
      expect(observed.chunks[0].toString()).toBe("data: first\n\n");
      const completed = new Promise((resolve) => {
        observed.res.on("data", (chunk) => observed.chunks.push(chunk));
        observed.res.on("end", () => resolve(Buffer.concat(observed.chunks).toString()));
      });
      releaseSecond();
      await expect(completed).resolves.toBe("data: first\n\ndata: second\n\n");
    } finally {
      await close(adapter);
      await close(upstream);
    }
  });

  it("validates the out-of-band adapter attestation", () => {
    const attestation = {
      schema: "exact-old-runtime-adapter-v1",
      mode: "add-missing",
      sourceRevision: OLD_REVISION,
      implementationSha256: "d".repeat(64),
      upstream: { port: 8790, revision: OLD_REVISION, dirty: false }
    };
    expect(assertAdapterAttestation(attestation, {
      mode: "add-missing",
      sourceRevision: OLD_REVISION,
      implementationSha256: "d".repeat(64),
      upstreamPort: 8790
    }).matches).toBe(true);
    expect(() => assertAdapterAttestation(attestation, {
      mode: "verify-native",
      sourceRevision: OLD_REVISION,
      implementationSha256: "d".repeat(64),
      upstreamPort: 8790
    })).toThrow(/mode mismatch/);
  });
});

describe("dual listener identity", () => {
  const spawnSyncImpl = (command, args) => {
    if (command === "lsof" && args.includes("-iTCP:8788")) {
      return { status: 0, stdout: "p101\ncnode\n", stderr: "" };
    }
    if (command === "lsof" && args.includes("-iTCP:8790")) {
      return { status: 0, stdout: "p202\ncworkerd\n", stderr: "" };
    }
    if (command === "lsof" && args.includes("-p") && args.includes("101")) {
      return { status: 0, stdout: "p101\nfcwd\nn/tmp/runner\n", stderr: "" };
    }
    if (command === "lsof" && args.includes("-p") && args.includes("202")) {
      return { status: 0, stdout: "p202\nfcwd\nn/tmp/server\n", stderr: "" };
    }
    if (command === "git" && args[1] === "/tmp/runner" && args.includes("rev-parse")) {
      return { status: 0, stdout: `${RUNNER_REVISION}\n`, stderr: "" };
    }
    if (command === "git" && args[1] === "/tmp/server" && args.includes("rev-parse")) {
      return { status: 0, stdout: `${OLD_REVISION}\n`, stderr: "" };
    }
    if (command === "git" && args.includes("status")) {
      return { status: 0, stdout: "", stderr: "" };
    }
    return { status: 1, stdout: "", stderr: `unexpected ${command} ${args.join(" ")}` };
  };

  it("attests two clean listeners and preserves both after collection", () => {
    const before = dualBoundServerIdentity({
      adapterPort: 8788,
      adapterRevision: RUNNER_REVISION,
      upstreamPort: 8790,
      upstreamRevision: OLD_REVISION
    }, { spawnSyncImpl });
    expect(before.adapter.cwd).toBe("/tmp/runner");
    expect(before.upstream.cwd).toBe("/tmp/server");
    expect(assertStableDualBoundServerIdentity(before, structuredClone(before)).matches).toBe(true);
    expect(() => assertStableDualBoundServerIdentity(before, {
      ...structuredClone(before),
      upstream: { ...before.upstream, pid: 203 }
    })).toThrow(/changed during paid calls/);
  });

  it("rejects one port for both listeners", () => {
    expect(() => dualBoundServerIdentity({
      adapterPort: 8788,
      adapterRevision: RUNNER_REVISION,
      upstreamPort: 8788,
      upstreamRevision: OLD_REVISION
    }, { spawnSyncImpl })).toThrow(/ports must differ/);
  });
});
