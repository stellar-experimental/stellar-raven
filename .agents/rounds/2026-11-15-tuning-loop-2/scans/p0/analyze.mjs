// P0 analysis. Rows are selected by the committed panel ids before any other field is read.
// Usage: node analyze.mjs exact <p0.json>                     -> writes frozen exact-marker list (transcripts only)
//        node analyze.mjs move <p0.json> <exactfile>           -> movement tables, T, share on identifier rows
import { readFileSync, writeFileSync } from "node:fs";
import { scanPass, seriesOfCatalog } from "/home/tyler/code/raven-wt/loop2-run/eval/qa/scan-corroboration.mjs";
import { scriptOf } from "/home/tyler/code/raven-wt/loop2-run/eval/qa/scan-tuning-exposure.mjs";

const R = "/home/tyler/code/raven-wt/loop2-run/.agents/rounds/2026-11-15-tuning-loop-2";
const RES = "/home/tyler/code/raven-wt/gca-eval/eval/qa/results";
const PANEL = readFileSync(`${R}/scans/panel-ids.txt`, "utf8").trim().split(",");
const IDENT17 = ["q-comp-aml-analytics-vendors","q-comp-sep8-regulated-assets-approval-server","q-crp-oz-rwa-erc3643-trex","q-edge-asset-site-scam-detection","q-edge-inject-ignore-instructions","q-net-protocol-meeting-notes-find-cap","q-nft-vault-contract-standards","q-pc-cross-redstone-sep40","q-pc-quantum-preparedness-dormant","q-pc-sponsored-reserves","q-sep-43-web-wallet-api","q-sep-45-contract-auth","q-sep-53-sign-verify-message","q-sep24-interactive-deposit-flow","q-sep6-sep24-sep31-choice","q-soroban-oz-token","q-zk-host-functions-status"];
const STORED = {
  baseline: `${RES}/2026-11-14T20-13-51-variantA.json`,
  step0prime: `${RES}/2026-11-14T22-18-17-variantA.json`,
  arm1: `${RES}/2026-11-14T23-04-27-variantA.json`,
  arm3: `${RES}/2026-11-15T00-32-53-variantA.json`
};
const ORD = { wrong: 0, partial: 1, correct: 2 };
const MARK = "returned the document the query names by identifier";

function load(file) {
  const j = JSON.parse(readFileSync(file, "utf8"));
  const want = new Set(PANEL);
  const rows = j.rows.filter((r) => want.has(r.id));
  return { meta: j.meta, rows };
}

const mode = process.argv[2];
if (mode === "exact") {
  const { rows } = load(process.argv[3]);
  if (rows.length !== 58) throw new Error(`P0 rows ${rows.length}`);
  const exact = rows.filter((r) => (r.transcript ?? []).some((e) => String(e.result ?? "").includes(MARK))).map((r) => r.id).sort();
  writeFileSync(`${R}/scans/p0-exact-rows.txt`, exact.join(",") + "\n");
  console.log(exact.length, exact.join("\n"));
}

if (mode === "move") {
  const p0 = load(process.argv[3]);
  const exact = new Set(readFileSync(process.argv[4], "utf8").trim().split(",").filter(Boolean));
  const tier = (r) => r.verdict?.meta?.judgeTierUsed ?? "single";
  const score = (r) => r.verdict?.score;
  const byId = (rows) => new Map(rows.map((r) => [r.id, r]));
  const P0 = byId(p0.rows);
  const out = {};
  const manifest = JSON.parse(readFileSync("/home/tyler/code/raven-wt/loop2-run/catalog/manifest.json", "utf8"));
  void manifest;
  for (const [label, file] of Object.entries(STORED)) {
    const s = load(file);
    const S = byId(s.rows);
    const ARM1 = new Set(load(STORED.arm1).rows.map((r) => r.id));
    const shared = PANEL.filter((id) => ARM1.has(id) && S.has(id) && P0.has(id));
    const compare = (ids) => {
      let up = 0, down = 0, same = 0, newWrong = 0;
      const changed = [];
      for (const id of ids) {
        const a = S.get(id), b = P0.get(id);
        const d = ORD[score(b)] - ORD[score(a)];
        if (d === 0) { same++; continue; }
        if (d > 0) up++; else down++;
        if (score(b) === "wrong") newWrong++;
        changed.push({ id, from: score(a), to: score(b), tierFrom: tier(a), tierTo: tier(b), move: d > 0 ? "up" : "down", exact: exact.has(id) });
      }
      return { n: ids.length, up, down, same, net: down - up, flips: up + down, newWrong, changed };
    };
    const matched = (ids) => ids.filter((id) => tier(S.get(id)) === tier(P0.get(id)));
    const all = compare(shared);
    const noExact = compare(shared.filter((id) => !exact.has(id)));
    const tm = compare(matched(shared.filter((id) => !exact.has(id))));
    const tmAll = compare(matched(shared));
    out[label] = { sharedN: shared.length, all, noExact, tierMatchedNoExact: tm, tierMatchedAll: tmAll };
  }
  writeFileSync("/tmp/claude-1000/p0-move.json", JSON.stringify(out, null, 1));
  for (const [label, o] of Object.entries(out)) { console.log(`\n-- changed rows vs ${label} (all shared)`); for (const c of o.all.changed) console.log(`${c.id} ${c.from}->${c.to} ${c.move} tier ${c.tierFrom}->${c.tierTo}${c.exact ? " EXACT" : ""}`); }
  for (const [label, o] of Object.entries(out)) {
    console.log(`\n== P0 vs ${label}: shared ${o.sharedN}`);
    for (const k of ["all", "noExact", "tierMatchedNoExact", "tierMatchedAll"]) {
      const c = o[k];
      console.log(`${k}: n=${c.n} flips=${c.flips} up=${c.up} down=${c.down} net(down-up)=${c.net} newWrong=${c.newWrong}`);
    }
  }
}
