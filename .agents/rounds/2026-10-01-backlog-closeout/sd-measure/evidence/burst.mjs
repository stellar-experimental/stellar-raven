import { writeFileSync } from "node:fs";
const categories = ["Infrastructure","Tooling","User-Facing App","Asset","Protocol/Contract","Anchor","Partner Integration"];
const types = ["Wallet","DEX","Lending","Bridge","Infrastructure","Payments","Anchor","SDK","Indexer","Explorer","Analytics","AI","Gaming","Education","Security","NFT","RWA","Stablecoin","Social Impact","RPC","Faucet","Card Issuing","Exchange","Oracle","Yield"];
const reqs = [{ k: "status", path: "/api/status" }];
for (const c of categories) reqs.push({ k: `cat:${c}`, q: { category: c, limit: 1 } });
for (const t of types) reqs.push({ k: `type:${t}`, q: { type: t, limit: 1 } });
for (const c of categories) reqs.push({ k: `catLive:${c}`, q: { category: c, status: "Live", limit: 1 } });
for (const t of types) reqs.push({ k: `typeLive:${t}`, q: { type: t, status: "Live", limit: 1 } });
async function one(r) { const url = "https://stellarlight.xyz" + (r.path ?? "/api/projects/search?" + new URLSearchParams(r.q)); const t0 = Date.now();
  try { const res = await fetch(url, { signal: AbortSignal.timeout(60000) }); const text = await res.text(); let j = null; try { j = JSON.parse(text); } catch {}
    return { k: r.k, status: res.status, ms: Date.now() - t0, total: j?.meta?.counts?.total ?? null, returned: j?.meta?.counts?.returned ?? null, metaKeys: j?.meta ? Object.keys(j.meta) : null, metaError: j?.meta?.error ?? null, warn: j?.meta?.warning ?? j?.meta?.degraded ?? j?.meta?.partial ?? null, rows: Array.isArray(j?.projects) ? j.projects.length : null, bytes: text.length, zeroMeta: j?.meta?.counts?.total === 0 ? j.meta : undefined, headers: res.status !== 200 ? Object.fromEntries(res.headers) : undefined };
  } catch (e) { return { k: r.k, status: "ERR", ms: Date.now() - t0, err: String(e.message ?? e) }; } }
const mode = process.argv[2];
let out;
if (mode === "burst") out = await Promise.all(reqs.map(one));
else { out = []; for (const r of reqs.filter((x) => /Tooling|User-Facing|Payments|SDK|RWA|^catLive:(Infrastructure|Protocol)/.test(x.k))) out.push(await one(r)); }
writeFileSync(new URL(`./burst-${mode}-${Date.now()}.json`, import.meta.url), JSON.stringify(out, null, 1));
console.log(mode, "requests:", out.length, "| non-200:", out.filter((x) => x.status !== 200).map((x) => `${x.k}:${x.status}`).join(",") || "none", "| max ms:", Math.max(...out.map((x) => x.ms)));
for (const x of out) if (/Tooling|User-Facing|Payments|SDK|RWA|^catLive:(Infrastructure|Protocol)|^cat:Infrastructure/.test(x.k) || x.total === 0 || x.status !== 200) console.log(`  ${x.k.padEnd(28)} status ${x.status} total ${x.total} rows ${x.rows} ${x.ms}ms${x.metaError ? " metaError=" + x.metaError : ""}${x.warn ? " warn=" + JSON.stringify(x.warn) : ""}`);
const z = out.find((x) => x.zeroMeta && !/Asset|Anchor|Partner/.test(x.k)); if (z) console.log("example zero meta:", JSON.stringify(z.zeroMeta).slice(0, 900));
