#!/usr/bin/env node
/**
 * Live integration for CODE-SHAPED spec discovery via `execute` — boots
 * `wrangler dev` (real Dynamic Worker sandbox), drives tools/call over /mcp,
 * prints a trimmed transcript, kills the server.
 *
 * Under ADR-0001, `search` is the host-side ranked query. These spec cases run
 * through `execute`, whose sandbox provides codemode.spec() and the service
 * globals.
 *
 * Run manually: node test/live/run-live-spec-search.mjs
 * (Deliberately not part of `npm test` — needs the LOADER binding; case 5
 * additionally makes real Algolia traffic and needs .dev.vars keys.)
 *
 * Cases:
 *  1. execute: list services + callable counts from codemode.spec(); the
 *     execute sandbox DOES have service globals (unlike the retired search
 *     sandbox).
 *  2. execute: find SEP-24-related ops across services — direct keyword hits
 *     (stellarDocs) plus each service's generic search ops as fallback
 *     (lumenloop has no literal "SEP" text; its semantic-search ops are the
 *     SEP-24-capable surface).
 *  3. execute: grep the skills index (x-skill-index) for anchor/SEP material,
 *     down to section headings.
 *  4. execute: oversized result (the whole spec) → host-side truncation
 *     footer (policy/truncate.ts, ~6k-token budget).
 *  5. execute: codemode.spec() mid-script — use the spec to pick the anchor/
 *     SEP docs operation, then actually call it via the service global.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = 8798;
const BASE = `http://localhost:${PORT}`;

function trim(s, n = 1100) {
  const t = typeof s === "string" ? s : JSON.stringify(s);
  return t.length > n ? `${t.slice(0, n)}… [trimmed ${t.length - n} chars]` : t;
}

async function mcpCall(name, args) {
  const res = await fetch(`${BASE}/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name, arguments: args }
    })
  });
  const text = await res.text();
  const dataLines = text
    .split("\n")
    .filter((l) => l.startsWith("data:"))
    .map((l) => l.slice(5).trim());
  const payload = dataLines.length > 0 ? dataLines[dataLines.length - 1] : text;
  const parsed = JSON.parse(payload);
  if (parsed.error) return { isError: true, text: JSON.stringify(parsed.error) };
  const result = parsed.result ?? {};
  return {
    isError: Boolean(result.isError),
    text: (result.content ?? []).map((c) => c.text).join("\n")
  };
}

const CASES = [
  {
    label: "1. execute: list services + callable counts via codemode.spec() (service globals present)",
    tool: "execute",
    expect: ["lumenloop", "scout", "stellarDocs", "skills", '"hasLumenloopGlobal":true'],
    code: `async () => {
      const spec = await codemode.spec();
      const services = {};
      for (const methods of Object.values(spec.paths)) {
        for (const op of Object.values(methods)) {
          const svc = op["x-service"];
          services[svc] ??= { callable: 0, denied: 0 };
          if (op["x-policy"].allow) services[svc].callable++; else services[svc].denied++;
        }
      }
      return { services, hasLumenloopGlobal: typeof lumenloop !== "undefined", title: spec.info.title };
    }`
  },
  {
    label: "2. execute: SEP-24-related ops across services (direct hits + per-service search ops)",
    tool: "execute",
    expect: ["stellarDocs.search_anchor_sep_docs", "lumenloop.search_content_semantic"],
    code: `async () => {
      const spec = await codemode.spec();
      const direct = [];
      const searchOps = {};
      for (const methods of Object.values(spec.paths)) {
        for (const op of Object.values(methods)) {
          if (!op["x-policy"].allow) continue;
          const text = [op.operationId, op.summary, op.description, ...(op.tags ?? [])].join(" ");
          if (/sep-?24|anchor|deposit|withdraw/i.test(text)) {
            direct.push({ op: op.operationId, call: op["x-execute"] });
          }
          const name = op.operationId.split(".").pop();
          if (/^(search|find)/.test(name)) {
            (searchOps[op["x-service"]] ??= []).push(op.operationId);
          }
        }
      }
      return { direct: direct.slice(0, 10), searchOps };
    }`
  },
  {
    label: "3. execute: grep the skills index for anchor/SEP playbooks, down to sections",
    tool: "execute",
    expect: ["skills.stellar-dev.standards", "codemode.skill.read"],
    code: `async () => {
      const spec = await codemode.spec();
      const index = spec.paths["/skills/list_skills"].get["x-skill-index"];
      const hits = index
        .filter(s => /anchor|\\bSEPs?\\b|standard/i.test(s.description + " " + s.sections.join(" ")))
        .map(s => ({
          id: s.id,
          sections: s.sections.filter(h => /anchor|sep|standard/i.test(h))
        }));
      return { hits, readCall: spec.paths["/skills/read_skill"].post["x-execute"] };
    }`
  },
  {
    label: "4. execute: oversized result (whole spec) truncated host-side with the footer",
    tool: "execute",
    expect: ["--- TRUNCATED ---", "tokens (limit: 6000)"],
    code: `async () => await codemode.spec()`
  },
  {
    label: "5. execute: codemode.spec() mid-script → pick the anchor/SEP docs op → call it",
    tool: "execute",
    expect: ["stellarDocs.search_anchor_sep_docs", "developers.stellar.org"],
    code: `async () => {
      const spec = await codemode.spec();
      const specOps = [];
      for (const methods of Object.values(spec.paths)) {
        for (const op of Object.values(methods)) {
          if (op["x-policy"].allow && /anchor|sep/i.test(op.operationId)) specOps.push(op.operationId);
        }
      }
      const docs = await stellarDocs.search_anchor_sep_docs({ query: "SEP-24 hosted deposit and withdrawal", hitsPerPage: 3 });
      return {
        specOps,
        nbHits: docs.ok ? docs.data.nbHits : docs.error,
        topUrls: docs.ok ? docs.data.hits.map(h => h.url).slice(0, 3) : null
      };
    }`
  }
];

async function main() {
  console.log("booting wrangler dev …");
  const server = spawn("npx", ["wrangler", "dev", "--port", String(PORT)], {
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env
  });
  let serverLog = "";
  server.stdout.on("data", (d) => (serverLog += d));
  server.stderr.on("data", (d) => (serverLog += d));

  try {
    let up = false;
    for (let i = 0; i < 60; i++) {
      await sleep(1000);
      try {
        const res = await fetch(`${BASE}/health`);
        if (res.ok) {
          up = true;
          break;
        }
      } catch {
        /* not up yet */
      }
    }
    if (!up) throw new Error(`wrangler dev never became healthy.\n${serverLog.slice(-2000)}`);
    console.log("server healthy.\n");

    let failures = 0;
    for (const { label, tool, code, expect: expected } of CASES) {
      const started = Date.now();
      const r = await mcpCall(tool, { code });
      const ms = Date.now() - started;
      const missing = (expected ?? []).filter((s) => !r.text.includes(s));
      const pass = !r.isError && missing.length === 0;
      console.log(`=== ${label} (${ms} ms, isError=${r.isError}, ${pass ? "PASS" : "FAIL"})`);
      if (missing.length > 0) console.log(`    missing expected substrings: ${JSON.stringify(missing)}`);
      console.log(trim(r.text));
      console.log();
      if (!pass) failures += 1;
    }

    if (failures > 0) {
      console.error(`${failures} case(s) failed`);
      process.exitCode = 1;
    } else {
      console.log("all live spec-search cases passed.");
    }
  } finally {
    server.kill("SIGTERM");
    await sleep(1500);
    if (!server.killed) server.kill("SIGKILL");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
