import { readFileSync } from "node:fs";
import { scanPass, seriesOfCatalog } from "/home/tyler/code/raven-wt/loop2-run/eval/qa/scan-corroboration.mjs";
const RES = "/home/tyler/code/raven-wt/gca-eval/eval/qa/results";
const manifest = JSON.parse(readFileSync("/home/tyler/code/raven-wt/loop2-run/catalog/manifest.json","utf8"));
const series = seriesOfCatalog(manifest);
const operationIds = new Set((manifest.entries ?? []).map((e) => e.id));
const ID17 = ["q-comp-aml-analytics-vendors","q-comp-sep8-regulated-assets-approval-server","q-crp-oz-rwa-erc3643-trex","q-edge-asset-site-scam-detection","q-edge-inject-ignore-instructions","q-net-protocol-meeting-notes-find-cap","q-nft-vault-contract-standards","q-pc-cross-redstone-sep40","q-pc-quantum-preparedness-dormant","q-pc-sponsored-reserves","q-sep-43-web-wallet-api","q-sep-45-contract-auth","q-sep-53-sign-verify-message","q-sep24-interactive-deposit-flow","q-sep6-sep24-sep31-choice","q-soroban-oz-token","q-zk-host-functions-status"];
const RUNS = {baseline:"2026-11-14T20-13-51",step0prime:"2026-11-14T22-18-17",arm1:"2026-11-14T23-04-27",arm3:"2026-11-15T00-32-53",P0:"2026-11-15T04-31-41"};
const want = new Set(ID17);
for (const [label, st] of Object.entries(RUNS)) {
  const rows = JSON.parse(readFileSync(`${RES}/${st}-variantA.json`,"utf8")).rows.filter((r)=>want.has(r.id));
  const scans = rows.map((r)=>scanPass(r,{operationIds,series}));
  const named = scans.filter(s=>s.identifierNamed);
  const withRes = named.filter(s=>!s.identifierWithoutResearch);
  // any research call at all
  const anyRes = rows.filter(r => (r.transcript??[]).some(e=>/(^|__)execute$/.test(e.tool??"") && /scout\.searchResearch/.test(String(e.input??""))));
  console.log(label, "rows", rows.length, "named", named.length, "named+research-in-script", withRes.length, `${(100*withRes.length/named.length).toFixed(0)}%`, "anyResearchCall(rows)", anyRes.length);
  if (label==="P0") console.log(" P0 named-without-research:", named.filter(s=>s.identifierWithoutResearch).map(s=>s.id).join(","));
}
