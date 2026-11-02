// Mintlify: does any of the 50 candidates contain an exact identifier? (sd-059 evidence)
// Run from the repo root: node .agents/rounds/2026-11-02-mintlify-migration/ident-probe.mjs <out.json>
// For each identifier: does any of Mintlify's 50 candidates contain it verbatim? Where is the first such chunk?
import { readFileSync, writeFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(".env","utf8").split("\n").map(l=>l.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)).filter(Boolean).map(m=>[m[1],m[2].replace(/^["']|["']$/g,"")]));
const post = async (body) => (await fetch("https://api.mintlify.com/discovery/v1/search/stellardevelopmentfoundation", { method: "POST", headers: { Authorization: `Bearer ${env.MINTLIFY_ASSISTANT_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(body) })).json();
const ids = ["op_bad_signer","SET_OPTIONS_BAD_SIGNER","op_low_reserve","op_too_many_signers","op_underfunded","op_no_trust","op_line_full","op_cross_self","op_over_source_max","op_under_dest_min","tx_bad_seq","tx_insufficient_fee","tx_too_late","tx_bad_auth_extra","CHANGE_TRUST_LOW_RESERVE","MANAGE_SELL_OFFER_CROSS_SELF","PATH_PAYMENT_STRICT_RECEIVE_OVER_SENDMAX","ACCOUNT_MERGE_HAS_SUB_ENTRIES","contract_data_entry_size_bytes","getLedgerEntries","simulateTransaction","restore_footprint","extend_footprint_ttl","AUTH_CLAWBACK_ENABLED_FLAG","SorobanAuthorizationEntry"];
const out = [];
for (const id of ids) {
  for (const q of [id, `${id} error meaning`]) {
    const r = await post({ query: q, pageSize: 50 });
    const at = Array.isArray(r) ? r.findIndex((c) => c.content.includes(id)) : -2;
    out.push({ q, rank: at, n: Array.isArray(r) ? r.length : 0, path: at >= 0 ? r[at].path.split("/").slice(-2).join("/") : null });
  }
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
for (const o of out) console.log(String(o.rank).padStart(3), o.n, o.q, o.path ?? "");
const bare = out.filter((o, i) => i % 2 === 0), wrapped = out.filter((o, i) => i % 2 === 1);
const s = (xs) => ({ top1: xs.filter((o) => o.rank === 0).length, top5: xs.filter((o) => o.rank >= 0 && o.rank < 5).length, any50: xs.filter((o) => o.rank >= 0).length, of: xs.length });
console.log(JSON.stringify({ bare: s(bare), wrapped: s(wrapped) }));
