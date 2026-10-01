#!/usr/bin/env node
/**
 * Manual live checks against an existing local server. The script never starts or stops a server.
 * Run: node test/live/run-live-spec-search.mjs --base-url http://localhost:<port>
 * These checks make real service calls and require the server's configured credentials.
 * They are separate from npm test. The offline suite validates their catalog references.
 */
import { existingServerUrl, isMain, mcpCall, parseRpc } from "./client.mjs";

function trim(s, n = 1100) {
  const t = typeof s === "string" ? s : JSON.stringify(s);
  return t.length > n ? `${t.slice(0, n)}… [trimmed ${t.length - n} chars]` : t;
}

export const CASES = [
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
          services[svc] ??= { callable: 0 };
          services[svc].callable++;
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
          if (/anchor|sep/i.test(op.operationId)) specOps.push(op.operationId);
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
  const BASE = existingServerUrl();
  const health = await fetch(`${BASE}/health`);
  if (!health.ok) throw new Error(`Server health check failed: HTTP ${health.status}`);

  let failures = 0;
  for (const { label, tool, code, expect: expected } of CASES) {
    const started = Date.now();
    const r = await mcpCall(BASE, tool, { code });
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
}

if (isMain(import.meta.url)) main().catch((e) => {
  console.error(e);
  process.exit(1);
});
