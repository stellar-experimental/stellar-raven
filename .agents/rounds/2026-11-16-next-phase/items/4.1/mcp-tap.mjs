#!/usr/bin/env node
/**
 * Item 4.1 step 3: a dependency-free HTTP proxy that records every MCP exchange.
 *
 * Usage: node mcp-tap.mjs --listen <port> --upstream <http://host:port> --log <file.jsonl>
 *
 * Forwards every method and path (including /.well-known/*) to the upstream, passes the
 * mcp-session-id header both ways, streams the reply unbuffered, and asks the upstream for an
 * identity encoding. Each exchange appends one JSONL line: time, method, path, HTTP status,
 * JSON-RPC id and method, tool name, arguments, and the full response body (SSE frames decoded
 * into `messages`). No request header is logged.
 */
import { appendFileSync } from "node:fs";
import http from "node:http";
import { parseArgs } from "node:util";

const { values: opt } = parseArgs({
  options: { listen: { type: "string" }, upstream: { type: "string" }, log: { type: "string" } }
});
if (!opt.listen || !opt.upstream || !opt.log) {
  console.error("usage: node mcp-tap.mjs --listen <port> --upstream <url> --log <file.jsonl>");
  process.exit(2);
}
const upstream = new URL(opt.upstream);
const HOP = new Set(["connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade", "host", "content-length"]);

/** Decodes an SSE body into the JSON data of each event. */
function decodeSse(text) {
  const out = [];
  for (const block of text.split(/\r?\n\r?\n/)) {
    const data = block
      .split(/\r?\n/)
      .filter((l) => l.startsWith("data:"))
      .map((l) => l.slice(5).replace(/^ /, ""))
      .join("\n");
    if (!data) continue;
    try {
      out.push(JSON.parse(data));
    } catch {
      out.push({ unparsed: data });
    }
  }
  return out;
}

const server = http.createServer((req, res) => {
  const t0 = Date.now();
  const reqChunks = [];
  req.on("data", (c) => reqChunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(reqChunks);
    let rpc = null;
    if (body.length) {
      try {
        rpc = JSON.parse(body.toString("utf8"));
      } catch {
        rpc = null;
      }
    }
    const headers = {};
    for (const [k, v] of Object.entries(req.headers)) if (!HOP.has(k)) headers[k] = v;
    headers["accept-encoding"] = "identity";
    headers.host = upstream.host;
    if (body.length) headers["content-length"] = String(body.length);
    const up = http.request(
      { host: upstream.hostname, port: upstream.port, method: req.method, path: req.url, headers },
      (ur) => {
        const rh = {};
        for (const [k, v] of Object.entries(ur.headers)) if (!HOP.has(k)) rh[k] = v;
        res.writeHead(ur.statusCode ?? 502, rh);
        const resChunks = [];
        ur.on("data", (c) => {
          resChunks.push(c);
          res.write(c);
        });
        ur.on("end", () => {
          res.end();
          const text = Buffer.concat(resChunks).toString("utf8");
          const ctype = String(ur.headers["content-type"] ?? "");
          let messages = [];
          if (ctype.includes("text/event-stream")) messages = decodeSse(text);
          else if (text) {
            try {
              messages = [JSON.parse(text)];
            } catch {
              messages = [{ unparsed: text }];
            }
          }
          const calls = Array.isArray(rpc) ? rpc : rpc ? [rpc] : [];
          const first = calls[0] ?? {};
          appendFileSync(
            opt.log,
            `${JSON.stringify({
              t: new Date(t0).toISOString(),
              ms: Date.now() - t0,
              httpMethod: req.method,
              path: req.url,
              status: ur.statusCode,
              rpcId: first.id ?? null,
              rpcMethod: first.method ?? null,
              tool: first.method === "tools/call" ? first.params?.name ?? null : null,
              arguments: first.method === "tools/call" ? first.params?.arguments ?? null : null,
              params: first.method && first.method !== "tools/call" ? first.params ?? null : null,
              sessionId: ur.headers["mcp-session-id"] ?? req.headers["mcp-session-id"] ?? null,
              contentType: ctype,
              messages
            })}\n`
          );
        });
        ur.on("error", () => res.destroy());
      }
    );
    up.on("error", (e) => {
      if (!res.headersSent) res.writeHead(502, { "content-type": "text/plain" });
      res.end(`tap upstream error: ${e.message}`);
      appendFileSync(opt.log, `${JSON.stringify({ t: new Date(t0).toISOString(), httpMethod: req.method, path: req.url, status: 502, tapError: e.message })}\n`);
    });
    res.on("close", () => up.destroy());
    if (body.length) up.write(body);
    up.end();
  });
});
server.listen(Number(opt.listen), "127.0.0.1", () => console.log(`tap listening on 127.0.0.1:${opt.listen} -> ${opt.upstream}`));
