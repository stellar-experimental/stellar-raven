#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import http from "node:http";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  brotliCompressSync,
  brotliDecompressSync,
  deflateSync,
  gunzipSync,
  gzipSync,
  inflateRawSync,
  inflateSync
} from "node:zlib";
import {
  assertStableBoundServerIdentity,
  boundServerIdentity,
  gitWorktreeIdentity
} from "../lib/bound-server-identity.mjs";

export const ADAPTER_ATTESTATION_PATH = "/__raven_eval_adapter";
export const ADAPTER_MODES = new Set(["add-missing", "verify-native"]);
export const RUNTIME_ADAPTER_SCHEMA = "exact-old-runtime-adapter-v1";

const IMPLEMENTATION_PATH = fileURLToPath(import.meta.url);

export function sha256Bytes(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function adapterImplementationSha256() {
  return sha256Bytes(readFileSync(IMPLEMENTATION_PATH));
}

export function assertAdapterAttestation(
  attestation,
  { mode, sourceRevision, implementationSha256, upstreamPort, upstreamIdentity = null }
) {
  const expectedRevision = assertRevision(sourceRevision);
  if (attestation?.schema !== RUNTIME_ADAPTER_SCHEMA) {
    throw new Error("runtime adapter attestation schema mismatch");
  }
  if (attestation.mode !== mode) {
    throw new Error(`runtime adapter attestation mode mismatch: expected ${mode}, received ${attestation.mode}`);
  }
  if (attestation.sourceRevision !== expectedRevision) {
    throw new Error("runtime adapter attestation source revision mismatch");
  }
  if (attestation.implementationSha256 !== implementationSha256) {
    throw new Error("runtime adapter implementation SHA-256 mismatch");
  }
  if (attestation.upstream?.port !== upstreamPort) {
    throw new Error("runtime adapter attestation upstream port mismatch");
  }
  if (attestation.upstream?.revision !== expectedRevision || attestation.upstream?.dirty !== false) {
    throw new Error("runtime adapter attestation upstream worktree mismatch");
  }
  if (upstreamIdentity) {
    const fields = ["port", "pid", "cwd", "revision", "dirty"];
    const changed = fields.filter(
      (field) => attestation.upstream?.[field] !== upstreamIdentity[field]
    );
    if (changed.length > 0) {
      throw new Error(`runtime adapter attestation listener mismatch: ${changed.join(", ")}`);
    }
  }
  return { ...attestation, matches: true };
}

export async function fetchAdapterAttestation(port, expected, { fetchImpl = fetch } = {}) {
  const response = await fetchImpl(`http://127.0.0.1:${port}${ADAPTER_ATTESTATION_PATH}`, {
    headers: { connection: "close" }
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`runtime adapter attestation HTTP ${response.status}: ${text.slice(0, 200)}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("runtime adapter attestation returned invalid JSON");
  }
  return assertAdapterAttestation(parsed, expected);
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function sourceRevisionOf(message) {
  const value = message?.result?.serverInfo?.sourceRevision;
  return typeof value === "string" ? value.trim().toLowerCase() : null;
}

function assertRevision(value) {
  const revision = String(value ?? "").trim().toLowerCase();
  if (!/^[a-f0-9]{40}$/.test(revision)) {
    throw new Error("runtime adapter source revision must be a 40-character lowercase commit");
  }
  return revision;
}

export function adaptInitializeMessage(message, { mode, sourceRevision }) {
  if (!ADAPTER_MODES.has(mode)) throw new Error(`unknown runtime adapter mode: ${mode}`);
  const revision = assertRevision(sourceRevision);
  const nativeRevision = sourceRevisionOf(message);
  if (!message?.result || !message.result.serverInfo || typeof message.result.serverInfo !== "object") {
    throw new Error("runtime adapter initialize response has no result.serverInfo object");
  }
  if (mode === "verify-native") {
    if (nativeRevision !== revision) {
      throw new Error(
        `runtime adapter native source revision mismatch: expected ${revision}, received ${nativeRevision ?? "none"}`
      );
    }
    return { message, changed: false, nativeRevision };
  }
  if (nativeRevision !== null) {
    throw new Error(
      `runtime adapter add-missing mode requires no native source revision; received ${nativeRevision}`
    );
  }
  const adapted = cloneJson(message);
  adapted.result.serverInfo.sourceRevision = revision;
  return { message: adapted, changed: true, nativeRevision: null };
}

function adaptJsonText(text, options) {
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) {
    let changes = 0;
    const messages = parsed.map((message) => {
      if (!message?.result?.serverInfo) return message;
      const adapted = adaptInitializeMessage(message, options);
      if (adapted.changed) changes++;
      return adapted.message;
    });
    if (changes > 1) throw new Error("runtime adapter found multiple initialize responses in one batch");
    if (options.mode === "add-missing" && changes !== 1) {
      throw new Error("runtime adapter found no initialize response to attest");
    }
    if (options.mode === "verify-native" && !parsed.some((message) => message?.result?.serverInfo)) {
      throw new Error("runtime adapter found no initialize response to verify");
    }
    return options.mode === "verify-native" ? text : JSON.stringify(messages);
  }
  const adapted = adaptInitializeMessage(parsed, options);
  return adapted.changed ? JSON.stringify(adapted.message) : text;
}

export function adaptInitializeResponseBody(body, contentType, options) {
  const input = Buffer.isBuffer(body) ? body : Buffer.from(body);
  const text = input.toString("utf8");
  if (String(contentType ?? "").toLowerCase().includes("text/event-stream")) {
    let found = 0;
    let changed = false;
    const output = text.replace(/(^|\n)(data:[ \t]*)([^\r\n]*)(?=\r?\n|$)/g, (whole, lead, prefix, data) => {
      if (!data.trim().startsWith("{") && !data.trim().startsWith("[")) return whole;
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        return whole;
      }
      const messages = Array.isArray(parsed) ? parsed : [parsed];
      if (!messages.some((message) => message?.result?.serverInfo)) return whole;
      found++;
      const adapted = adaptJsonText(data, options);
      if (adapted !== data) changed = true;
      return `${lead}${prefix}${adapted}`;
    });
    if (found !== 1) {
      throw new Error(`runtime adapter expected one initialize SSE message, found ${found}`);
    }
    if (options.mode === "add-missing" && !changed) {
      throw new Error("runtime adapter did not add the old runtime source revision");
    }
    if (options.mode === "verify-native" && output !== text) {
      throw new Error("runtime adapter changed a native initialize response");
    }
    return options.mode === "verify-native" ? input : Buffer.from(output);
  }
  const output = adaptJsonText(text, options);
  return options.mode === "verify-native" ? input : Buffer.from(output);
}

const BODY_INTEGRITY_HEADERS = new Set([
  "content-digest",
  "content-md5",
  "digest",
  "etag",
  "repr-digest",
  "x-goog-hash"
]);

function isBodyIntegrityHeader(name) {
  const normalized = String(name).toLowerCase();
  return BODY_INTEGRITY_HEADERS.has(normalized) || normalized.startsWith("x-amz-checksum-");
}

export function headersAfterBodyMutation(rawHeaders, length) {
  const headers = [];
  let hadContentLength = false;
  for (let index = 0; index < rawHeaders.length; index += 2) {
    const name = rawHeaders[index];
    const value = rawHeaders[index + 1];
    const normalized = String(name).toLowerCase();
    if (normalized === "content-length") {
      hadContentLength = true;
      continue;
    }
    if (isBodyIntegrityHeader(normalized)) continue;
    headers.push(name, value);
  }
  if (hadContentLength) headers.push("Content-Length", String(length));
  return headers;
}

function contentCodec(encoding) {
  const normalized = String(encoding ?? "identity").trim().toLowerCase();
  if (normalized === "" || normalized === "identity") {
    return { decode: (body) => body, encode: (body) => body };
  }
  if (normalized === "gzip") return { decode: gunzipSync, encode: gzipSync };
  if (normalized === "deflate") {
    return {
      decode(body) {
        try {
          return inflateSync(body);
        } catch {
          return inflateRawSync(body);
        }
      },
      encode: deflateSync
    };
  }
  if (normalized === "br") return { decode: brotliDecompressSync, encode: brotliCompressSync };
  throw new Error(`runtime adapter cannot attest content-encoding ${normalized}`);
}

function isInitializeRequest(body) {
  try {
    const parsed = JSON.parse(body.toString("utf8"));
    const messages = Array.isArray(parsed) ? parsed : [parsed];
    return messages.some((message) => message?.method === "initialize");
  } catch {
    return false;
  }
}

function safeEnd(res, status, message) {
  if (res.headersSent) {
    res.destroy(new Error(message));
    return;
  }
  const body = JSON.stringify({ error: message });
  res.writeHead(status, { "content-type": "application/json", "content-length": Buffer.byteLength(body) });
  res.end(body);
}

export function createExactOldRuntimeAdapter({
  upstreamUrl,
  sourceRevision,
  mode,
  upstreamIdentity,
  attestUpstream,
  implementationSha256 = adapterImplementationSha256()
}) {
  const target = new URL(upstreamUrl);
  const revision = assertRevision(sourceRevision);
  if (!ADAPTER_MODES.has(mode)) throw new Error(`unknown runtime adapter mode: ${mode}`);
  if (target.protocol !== "http:") throw new Error("runtime adapter upstream must use http");
  if (typeof attestUpstream !== "function") throw new Error("runtime adapter requires upstream listener attestation");

  const attestStableUpstream = () => {
    const current = attestUpstream();
    assertStableBoundServerIdentity(upstreamIdentity, current);
    return current;
  };

  return http.createServer((req, res) => {
    if (req.method === "GET" && req.url === ADAPTER_ATTESTATION_PATH) {
      try {
        const current = attestStableUpstream();
        const body = JSON.stringify({
          schema: RUNTIME_ADAPTER_SCHEMA,
          mode,
          sourceRevision: revision,
          implementationSha256,
          upstream: {
            url: target.toString(),
            port: current.port,
            pid: current.pid,
            cwd: current.cwd,
            revision: current.revision,
            dirty: current.dirty
          }
        });
        res.writeHead(200, {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body),
          "cache-control": "no-store"
        });
        res.end(body);
      } catch (error) {
        safeEnd(res, 503, String(error.message ?? error));
      }
      return;
    }

    const requestChunks = [];
    const headers = { ...req.headers, host: target.host };
    const upstreamRequest = http.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port,
        method: req.method,
        path: req.url,
        headers
      },
      (upstreamResponse) => {
        const initialize = isInitializeRequest(Buffer.concat(requestChunks));
        if (!initialize) {
          res.writeHead(
            upstreamResponse.statusCode ?? 502,
            upstreamResponse.statusMessage,
            upstreamResponse.rawHeaders
          );
          upstreamResponse.pipe(res);
          return;
        }

        const responseChunks = [];
        upstreamResponse.on("data", (chunk) => responseChunks.push(chunk));
        upstreamResponse.on("end", () => {
          try {
            attestStableUpstream();
            const body = Buffer.concat(responseChunks);
            const codec = contentCodec(upstreamResponse.headers["content-encoding"]);
            const decoded = codec.decode(body);
            const adaptedDecoded = adaptInitializeResponseBody(
              decoded,
              upstreamResponse.headers["content-type"],
              { mode, sourceRevision: revision }
            );
            const adapted = mode === "verify-native" ? body : codec.encode(adaptedDecoded);
            const responseHeaders = adapted === body
              ? upstreamResponse.rawHeaders
              : headersAfterBodyMutation(upstreamResponse.rawHeaders, adapted.length);
            res.writeHead(
              upstreamResponse.statusCode ?? 502,
              upstreamResponse.statusMessage,
              responseHeaders
            );
            res.end(adapted);
          } catch (error) {
            safeEnd(res, 502, String(error.message ?? error));
          }
        });
        upstreamResponse.on("error", (error) => safeEnd(res, 502, String(error.message ?? error)));
      }
    );
    upstreamRequest.on("error", (error) => safeEnd(res, 502, String(error.message ?? error)));
    req.on("data", (chunk) => {
      requestChunks.push(chunk);
      upstreamRequest.write(chunk);
    });
    req.on("end", () => upstreamRequest.end());
    req.on("error", (error) => upstreamRequest.destroy(error));
  });
}

function parseCli(args) {
  if (args.length === 1 && args[0] === "--print-sha256") return { printSha256: true };
  const flags = new Set(["--port", "--upstream-port", "--source-revision", "--adapter-revision", "--mode"]);
  const values = {};
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];
    if (!flags.has(flag) || !value || value.startsWith("--")) {
      throw new Error("runtime adapter requires spaced values for --port, --upstream-port, --source-revision, --adapter-revision, and --mode");
    }
    if (flag in values) throw new Error(`runtime adapter repeats ${flag}`);
    values[flag] = value;
  }
  if (Object.keys(values).length !== flags.size) {
    throw new Error("runtime adapter requires --port, --upstream-port, --source-revision, --adapter-revision, and --mode");
  }
  const port = Number(values["--port"]);
  const upstreamPort = Number(values["--upstream-port"]);
  for (const [label, value] of [["port", port], ["upstream port", upstreamPort]]) {
    if (!Number.isInteger(value) || value < 1 || value > 65_535) {
      throw new Error(`runtime adapter ${label} is invalid: ${value}`);
    }
  }
  if (port === upstreamPort) throw new Error("runtime adapter ports must differ");
  return {
    port,
    upstreamPort,
    sourceRevision: assertRevision(values["--source-revision"]),
    adapterRevision: assertRevision(values["--adapter-revision"]),
    mode: values["--mode"]
  };
}

async function main(args) {
  const parsed = parseCli(args);
  if (parsed.printSha256) {
    console.log(adapterImplementationSha256());
    return;
  }
  if (!ADAPTER_MODES.has(parsed.mode)) throw new Error(`unknown runtime adapter mode: ${parsed.mode}`);
  const adapterWorktree = gitWorktreeIdentity(process.cwd());
  if (adapterWorktree.dirty) throw new Error("runtime adapter worktree is dirty");
  if (adapterWorktree.revision !== parsed.adapterRevision) {
    throw new Error(
      `runtime adapter revision mismatch: expected ${parsed.adapterRevision}, worktree is ${adapterWorktree.revision}`
    );
  }
  const attestUpstream = () => boundServerIdentity(parsed.upstreamPort, parsed.sourceRevision);
  const upstreamIdentity = attestUpstream();
  const implementationSha256 = adapterImplementationSha256();
  const server = createExactOldRuntimeAdapter({
    upstreamUrl: `http://127.0.0.1:${parsed.upstreamPort}`,
    sourceRevision: parsed.sourceRevision,
    mode: parsed.mode,
    upstreamIdentity,
    attestUpstream,
    implementationSha256
  });
  server.listen(parsed.port, "127.0.0.1", () => {
    console.log(
      `exact-old-runtime adapter :${parsed.port} -> :${parsed.upstreamPort} · ${parsed.mode} · ` +
      `source ${parsed.sourceRevision} · sha256 ${implementationSha256}`
    );
  });
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(`exact-old-runtime adapter failed: ${error.message}`);
    process.exit(1);
  });
}
