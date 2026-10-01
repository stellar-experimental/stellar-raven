#!/usr/bin/env node
/**
 * Manual live checks against an existing local server. The script never starts or stops a server.
 * Run: node test/live/run-live-execute.mjs --base-url http://localhost:<port>
 * These checks make real service calls and require the server's configured credentials.
 * They are separate from npm test. The offline suite validates their catalog references.
 */
import { existingServerUrl, isMain, mcpCall, parseRpc } from "./client.mjs";

function trim(s, n = 900) {
  const t = typeof s === "string" ? s : JSON.stringify(s);
  return t.length > n ? `${t.slice(0, n)}… [trimmed ${t.length - n} chars]` : t;
}

export const CASES = [
  {
    label: "1. fan-out: codemode.search + one free op per service + skill read",
    code: `async () => {
      const discovery = await codemode.search({ query: "search stellar docs", limit: 3 });
      const [status, dir, docs, skill] = await Promise.all([
        scout.getStatus({}),
        lumenloop.search_directory({ query: "soroban defi", limit: 3 }),
        stellarDocs.search_docs({ query: "soroban storage", hitsPerPage: 3 }),
        codemode.skill.read("skills.stellar-dev.standards")
      ]);
      console.log("discovery top hit:", discovery.hits[0] && discovery.hits[0].id);
      return {
        scoutApiVersion: status.ok ? status.data.apiVersion : status.error,
        scoutProjects: status.ok ? status.data.sources.find(s => s.name === "projects").count : null,
        lumenloopCount: dir.ok ? dir.data.count : dir.error,
        lumenloopTop: dir.ok && dir.data.projects[0] ? dir.data.projects[0].slug : null,
        docsNbHits: docs.ok ? docs.data.nbHits : docs.error,
        docsTopUrl: docs.ok ? docs.data.hits[0].url : null,
        skillChars: skill.ok ? skill.content.length : skill.error
      };
    }`
  },
  {
    label: "2. progression: broad search_directory → deeper get_project(top slug)",
    code: `async () => {
      const dir = await lumenloop.search_directory({ query: "soroswap", limit: 3 });
      if (!dir.ok || dir.data.count === 0) return { step1: dir };
      const slug = dir.data.projects[0].slug;
      const detail = await lumenloop.get_project({ slug, compact: true });
      return {
        broadCount: dir.data.count,
        slug,
        detailOk: detail.ok,
        detailCategory: detail.ok ? detail.data.category : detail.error,
        detailWebsite: detail.ok && detail.data.links ? detail.data.links.website : null
      };
    }`
  },
  {
    label: "3. catalog() as data: arbitrary filtering (service/kind counts; all callable)",
    code: `async () => {
      const cat = await codemode.catalog();
      return {
        total: cat.entries.length,
        byService: cat.entries.reduce((m, e) => (m[e.service] = (m[e.service] || 0) + 1, m), {}),
        policyFieldsPresent: cat.entries.some(e => "policy" in e || "cost" in e || "auth" in e),
        operations: cat.entries.filter(e => e.kind === "operation").length
      };
    }`
  },
  {
    label: "4. build-excluded op does not exist in the sandbox (unknown name fails loudly)",
    expect: '"threw":true',
    code: `async () => {
      try {
        await scout.submitPartnerListing({ orgName: "Test Org", contactEmail: "test@example.com" });
        return { threw: false };
      } catch (e) {
        return { threw: true, message: String(e.message).slice(0, 120) };
      }
    }`
  },
  {
    label: "5. fetch() throws (globalOutbound: null)",
    expect: '"threw":true',
    code: `async () => {
      try {
        await fetch("https://example.com");
        return { threw: false };
      } catch (e) {
        return { threw: true, message: String(e.message).slice(0, 120) };
      }
    }`
  },
  {
    label:
      "6. envelope guard split contract: payload reads throw a pointer; failed-call r.data is undefined + [envelope] warning; writes are write-through; raw envelope still returns",
    code: `async () => {
      const dir = await lumenloop.search_directory({ query: "soroswap", limit: 2 });
      const failed = await lumenloop.search_directory({ limit: 2 }); // missing required query -> guard error
      const sp = await scout.searchProjects({ q: "soroban", limit: 1 });
      const out = { okGuard: null, errGuardIsUndefined: null, metaGuard: null, writeBack: null, viaData: dir.ok ? dir.data.count : null, raw: dir };
      try { void dir.projects; out.okGuard = "NOT THROWN — guard missing"; }
      catch (e) { out.okGuard = String(e.message).slice(0, 160); }
      out.errGuardIsUndefined = typeof failed.data === "undefined";
      try { void sp.meta; out.metaGuard = "NOT THROWN — guard missing"; }
      catch (e) { out.metaGuard = String(e.message).slice(0, 160); }
      dir.count = dir.ok ? dir.data.count : -1;
      out.writeBack = dir.count;
      return out;
    }`,
    check: (text) => {
      if (!text.includes('"errGuardIsUndefined":true')) {
        return "failed.data was not undefined (errGuardIsUndefined false)";
      }
      if (!text.includes("[envelope] lumenloop.search_directory")) {
        return "console block missing the [envelope] lumenloop.search_directory warning";
      }
      if (!text.includes("use r.data.meta")) {
        return "sp.meta did not throw a pointer at r.data.meta";
      }
      const body = text.split("\n--- console")[0];
      try {
        const out = JSON.parse(body);
        if (typeof out.writeBack !== "number" || out.writeBack !== out.viaData) {
          return `writeBack ${out.writeBack} did not round-trip viaData ${out.viaData}`;
        }
      } catch (e) {
        return `unparseable case-6 result: ${e.message}`;
      }
      return null;
    }
  },
  {
    label: "7. search tool: build question surfaces a skill hit carrying availableSections",
    tool: "search",
    args: { query: "how do I write and deploy a soroban smart contract", limit: 10 },
    // Structured check runs on the parsed hits below (checkSearch).
    checkSearch: (hits) => {
      const skillHit = hits.find((h) => h.kind === "skill" && h.service === "skills");
      if (!skillHit) return "no skills.* skill hit in top-10";
      if (!Array.isArray(skillHit.availableSections) || skillHit.availableSections.length === 0) {
        return `skill hit ${skillHit.id} carries no availableSections`;
      }
      return null;
    }
  },
  {
    label: "8. oversized whole-skill read returns the FULL body plus an advisory notice",
    code: `async () => {
      const r = await codemode.skill.read("skills.stellar-dev.standards");
      return {
        pass: r.ok && typeof r.content === "string" && r.content.length > 24000 && typeof r.notice === "string" && r.availableSections.length > 10,
        notice: r.ok ? r.notice.slice(0, 140) : r.error,
        chars: r.ok ? r.content.length : 0,
        sectionCount: r.ok ? r.availableSections.length : 0
      };
    }`,
    expect: '"pass":true'
  },
  {
    label: "9. section-first read of the same oversized skill returns full section content, no notice",
    code: `async () => {
      const index = await codemode.skill.read("skills.stellar-dev.standards");
      if (!index.ok) return { pass: false, error: index.error };
      const slug = index.availableSections.find((s) => !s.startsWith("file:"));
      const r = await codemode.skill.read("skills.stellar-dev.standards", { sections: [slug] });
      return {
        pass: r.ok && r.sections.length === 1 && r.sections[0].content.length > 50 && r.notice === undefined,
        slug,
        chars: r.ok ? r.sections[0].content.length : 0
      };
    }`,
    expect: '"pass":true'
  }
];

async function main() {
  const BASE = existingServerUrl();
  const health = await fetch(`${BASE}/health`);
  if (!health.ok) throw new Error(`Server health check failed: HTTP ${health.status}`);

  let failures = 0;

  // initialize must carry the server instructions (workflow + envelope).
  const initRes = await fetch(`${BASE}/mcp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 0,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "live-test", version: "0.0.0" }
      }
    })
  });
  const initText = await initRes.text();
  const init = parseRpc(initText);
  const instructions = init.result?.instructions ?? "";
  const hasEnvelopeContract = instructions.includes("r.data.projects");
  console.log(`=== initialize carries instructions (envelope contract present: ${hasEnvelopeContract})`);
  console.log(trim(instructions, 300));
  console.log();
  if (!hasEnvelopeContract) failures += 1;
  for (const { label, code, tool, args, expect, check, checkSearch } of CASES) {
    const started = Date.now();
    const r = await mcpCall(BASE, tool ?? "execute", args ?? { code });
    const ms = Date.now() - started;
    let failReason = r.isError ? "isError" : null;
    if (!failReason && expect && !r.text.includes(expect)) failReason = `missing expected ${expect}`;
    if (!failReason && check) failReason = check(r.text);
    if (!failReason && checkSearch) {
      try {
        failReason = checkSearch(JSON.parse(r.text).hits ?? []);
      } catch (e) {
        failReason = `unparseable search response: ${e.message}`;
      }
    }
    console.log(`=== ${label} (${ms} ms, ${failReason ? `FAIL: ${failReason}` : "ok"})`);
    console.log(trim(r.text));
    console.log();
    if (failReason) failures += 1;
  }

  if (failures > 0) {
    console.error(`${failures} check(s) failed`);
    process.exitCode = 1;
  } else {
    console.log("all live cases completed without tool errors.");
  }
}

if (isMain(import.meta.url)) main().catch((e) => {
  console.error(e);
  process.exit(1);
});
