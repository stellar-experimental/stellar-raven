// Verification-lane re-derivation of the twelve routing acceptance checks.
// Usage: node tmp/verify/accept.mjs <label> <pairMainLabel> <pairFreshLabel> [baselineMainLabel]
// Reads tmp/verify/runs/<label>-{routing,manifest}.json and imports scorer modules
// from tmp/verify/src-<label>/ so a candidate patch is measured with its own code.
// Writes tmp/verify/runs/<label>-accept.json; exit 1 when any strict check fails.
import fs from "node:fs";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = "/private/tmp/claude-501/raven-wt/routing-repair";
const V = `${ROOT}/tmp/verify`;
const [label, pairMain, pairFresh, baseLabel = "main"] = process.argv.slice(2);
assert.ok(label && pairMain && pairFresh, "usage: accept.mjs <label> <pairMain> <pairFresh> [baseline]");
const isFresh = label === pairFresh;
const src = `${V}/src-${label}`;
const mod = (p) => import(pathToFileURL(resolve(src, p)).href);
const { loadManifest, searchCatalogPage } = await mod("src/catalog/search.ts");
const { scoreEntryWeighted, scoreEntryWeightedUngated } = await mod("src/catalog/scoring.ts");
const { extractRoutingPhrases } = await mod("src/catalog/extract-routing-phrases.ts");
const { rwaEntry } = await mod("test/fixtures/rwa-routing.ts");

const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const sha = (b) => createHash("sha256").update(b).digest("hex");
const run = (l) => read(`${V}/runs/${l}-routing.json`);
const measured = run(label), base = run(baseLabel), main = run(pairMain), fresh = run(pairFresh);

// Manifest identity: the saved manifest, the scratch build, and the routing run agree.
const manifestBytes = fs.readFileSync(`${V}/runs/${label}-manifest.json`);
const builtBytes = fs.readFileSync(`${src}/catalog/manifest.json`);
assert.equal(sha(manifestBytes), sha(builtBytes), "saved manifest differs from scratch build");
assert.equal(sha(manifestBytes), measured.manifest.sha256, "routing run used another manifest");
const catalog = loadManifest(JSON.parse(manifestBytes));

const LANES = ["cases", "extendedCases", "skillsCases", "holdoutCases", "protocolHistoryCases"];
const SIZES = [338, 122, 23, 49, 12];
for (const r of [measured, base, main, fresh]) {
  assert.deepEqual(LANES.map((k) => r[k].length), SIZES);
  for (const k of LANES) assert.deepEqual(r[k].map((x) => x.id), base[k].map((x) => x.id));
}
const rows = (r) => LANES.flatMap((k) => r[k].map((x) => ({ ...x, lane: k })));
const byId = (r) => new Map(rows(r).map((x) => [x.id, x]));
const GRADE_KEYS = ["top1", "top3", "top5", "cardHit5", "any1", "any3", "any5", "forbiddenCapture", "pass"];
const gradeDiff = (a, b) => {
  const bm = byId(b);
  return rows(a).flatMap((x) => {
    const y = bm.get(x.id);
    const ch = GRADE_KEYS.filter((k) => x[k] !== y[k]);
    return ch.length ? [{ id: x.id, lane: x.lane, changes: Object.fromEntries(ch.map((k) => [k, [x[k], y[k]]])) }] : [];
  });
};
const orderDiff = (a, b) => {
  const bm = byId(b);
  return rows(a).filter((x) => JSON.stringify(x.topHits.map((h) => h.id)) !== JSON.stringify(bm.get(x.id).topHits.map((h) => h.id))).map((x) => x.id);
};
const lossesOf = (a, b, ids) => ids.map((id) => {
  const x = byId(a).get(id), y = byId(b).get(id);
  assert.ok(x && y, `missing row ${id}`);
  return { id, losses: GRADE_KEYS.filter((k) => k !== "forbiddenCapture" && x[k] === true && y[k] !== true), before: pick(x), after: pick(y) };
});
const pick = (x) => Object.fromEntries(["top1", "top3", "top5", "cardHit5"].map((k) => [k, x[k]]));

const page = (q, c = catalog) => searchCatalogPage(c, { query: q, limit: 5 }).hits.map(({ id, score, tier }) => ({ id, score, tier }));
const ids = (q, c) => page(q, c).map((h) => h.id);
const has = (q, id, c) => ids(q, c).includes(id);

// Reproducibility: every saved row equals a fresh search with the scratch code.
const questions = new Map();
const cf = read(`${src}/eval/routing-cases.json`);
for (const c of [...cf.cases, ...cf.extendedCases]) questions.set(c.id, c.question);
for (const c of read(`${src}/eval/skills-cases.json`).cases) questions.set(c.id, c.question);
for (const c of read(`${src}/eval/holdout-cases.json`).cases) questions.set(c.id, c.question);
const ph = read(`${src}/eval/protocol-history-cases.json`);
for (const c of [...ph.positiveCases, ...ph.controlCases]) questions.set(c.id, c.question);
let reproduced = 0;
for (const x of rows(measured)) {
  const q = questions.get(x.id); assert.ok(q, `no question for ${x.id}`);
  assert.deepEqual(page(q).map((h) => [h.id, h.score]), x.topHits.map((h) => [h.id, h.score]), `stale row ${x.id}`);
  reproduced++;
}

const out = { label, manifestSha256: sha(manifestBytes), reproduced, checks: {} };
const C = out.checks;

// 1. yieldblox / reflector intent survives source additions.
{
  const row = "What happened in the YieldBlox/Reflector oracle-manipulation incident, roughly how much was lost/recovered, and what are the design lessons?";
  const capProbe = extractRoutingPhrases({ purpose: ["alpha beta", "gamma delta", "epsilon zeta"], useWhen: ["yieldblox oracle"], exampleQuestions: ["reflector incident"] }, 6);
  // Stronger diagnostic: older intent in the middle of a field, then long new sections appended.
  const filler = (n) => Array.from({ length: 12 }, (_, i) => `token${n}x${i}`).join(" ");
  const longProbe = extractRoutingPhrases({
    useWhen: ["older audit history", "yieldblox oracle incident", "older lending risk", ...Array.from({ length: 30 }, (_, i) => filler(`u${i}`))],
    exampleQuestions: ["older question one", "reflector price feed incident", ...Array.from({ length: 30 }, (_, i) => filler(`e${i}`))]
  });
  const kept = (ps, t) => ps.some((p) => p.tokens.includes(t));
  C[1] = {
    pass: kept(capProbe, "yieldblox") && kept(capProbe, "reflector") && has(row, "scout.searchResearch"),
    rowHits: page(row),
    diagnosticLongSections: { yieldblox: kept(longProbe, "yieldblox"), reflector: kept(longProbe, "reflector") }
  };
}
// 2. generic words cannot route alone.
{
  const r = ["through", "network", "each", "walk through"].map((q) => {
    const p = page(q);
    return { q, hits: p, searchResearch: p.some((h) => h.id === "scout.searchResearch"), gated: p.filter((h) => h.tier === "gated").map((h) => h.id) };
  });
  C[2] = { pass: r.every((x) => !x.searchResearch), strictNoGated: r.every((x) => x.gated.length === 0), rows: r };
}
// 3. contract alone does not route explainRepo; a repository anchor does.
C[3] = { pass: !has("contract", "scout.explainRepo") && has("explain the contract repository code", "scout.explainRepo"), negative: page("contract"), positive: page("explain the contract repository code") };
// 4. Added "use" does not promote hackathonBrief above account-merge Docs.
{
  const withUse = "How does account merge work, what must I clear first, and can I use it to reclaim locked base-reserve XLM?";
  const r = [withUse, withUse.replace(" use it to", " it")].map((q) => {
    const l = ids(q), d = l.indexOf("stellarDocs.search_docs_in_category"), h = l.indexOf("scout.hackathonBrief");
    return { q, ids: l, docsRank: d, briefRank: h, pass: d >= 0 && h === -1, orderPass: d >= 0 && (h === -1 || d < h) };
  });
  C[4] = { pass: r.every((x) => x.pass), rows: r };
}
// 5. "has" does not match inside the schema keyword "phase" (synthetic + real entries).
{
  const e = { id: "demo.has", name: "has", service: "demo", kind: "operation", description: "Retrieve widgets" };
  const n = { ...e, id: "demo.lookup", name: "lookup" };
  const syn = [e, n].flatMap((x) => [
    [scoreEntryWeighted({ ...x, keywords: ["widgets"] }, "has widgets"), scoreEntryWeighted({ ...x, keywords: ["widgets", "phase"] }, "has widgets")],
    [scoreEntryWeightedUngated({ ...x, keywords: ["widgets"] }, "has widgets"), scoreEntryWeightedUngated({ ...x, keywords: ["widgets", "phase"] }, "has widgets")]
  ]);
  const generic = scoreEntryWeighted({ ...n, keywords: ["status", "phase", "value"] }, "status phase value");
  // Real data: removing "phase" from any entry's keywords never changes its score on "has" queries.
  const real = [];
  for (const raw of catalog.entries.filter((x) => (x.keywords ?? []).includes("phase"))) {
    // Mirror search.ts: the scorer sees {id, name, service, kind, description, keywords, routing*}.
    const entry = { id: raw.id, name: raw.id.split(".").pop(), service: raw.service, kind: raw.kind, description: raw.description, keywords: raw.keywords, routingKeywords: raw.routingKeywords, routingPhrases: raw.routingPhrases };
    for (const q of ["has", "what has changed", "which project has a grant", "which hackathon has the most submissions"]) {
      const a = scoreEntryWeighted(entry, q), b = scoreEntryWeighted({ ...entry, keywords: entry.keywords.filter((k) => k !== "phase") }, q);
      if (a !== b) real.push({ id: entry.id, q, with: a, without: b });
    }
  }
  C[5] = { pass: syn.every(([a, b]) => a === b) && generic === null, synthetic: syn, generic, realEntryDiffs: real, realPass: real.length === 0 };
}
// 6. Strong Docs evidence stays eligible after five weak gated candidates.
{
  const staking = "Since XLM has no native protocol staking, how can I build a staking or yield feature for my own Soroban token?";
  const kit = questions.get("q-tool-wallets-kit");
  const q = "alpha beta gamma wallet dapp";
  const probe = (description) => {
    const s = { id: "scout.weak0", name: "weak0", service: "scout", kind: "operation", description };
    const d = { id: "docs.walletDapp", name: "walletDapp", service: "docs", kind: "operation", description: "wallet dapp" };
    const c = { ...catalog, entries: [...Array.from({ length: 5 }, (_, i) => ({ ...s, id: `scout.weak${i}`, name: `weak${i}` })), d] };
    return { description, gated: scoreEntryWeighted(s, q), docsPresent: has(q, d.id, c) };
  };
  const syn = [probe("alphabet betamax gammaray"), probe("xalphax xbetax xgammax")];
  C[6] = {
    pass: has(staking, "stellarDocs.search_asset_token_docs") && has(kit, "stellarDocs.search_wallet_dapp_docs") && syn.every((p) => p.docsPresent),
    syntheticVacuous: syn.some((p) => p.gated === null),
    staking: page(staking), walletsKit: page(kit), synthetic: syn
  };
}
// 7. Eight regression rows: fixture presence and corpus grades vs the baseline.
{
  const t = fs.readFileSync(`${src}/test/drift-141-routing.test.ts`, "utf8");
  const eight = Function(`return ${t.match(/const rows = (\[[\s\S]*?\]) as const;/)[1]}`)();
  const pres = eight.map(([q, alt]) => ({ q, alt, ids: ids(q), pass: alt.some((a) => has(q, a)) }));
  const corpusIds = ["q-comp-yieldblox-oracle-incident", "q-defi-rwa-scf-similar", "q-protocol-network-passphrases-list", "q-skill-soroban-first-contract", "q-protocol-parallel-execution", "q-soroban-reentrancy", "q-pc-account-merge-reclaim-reserve", "q-defi-build-staking-for-own-token"];
  const grades = lossesOf(base, measured, corpusIds);
  C[7] = { pass: pres.every((x) => x.pass) && grades.every((g) => g.losses.length === 0), presence: pres, grades };
}
// 8. RWA discovery vs implementation, on the test fixture built from this label's inventory.
{
  const rc = loadManifest({ ...catalog, entries: [...catalog.entries, rwaEntry] });
  const grp = (qs, want) => qs.map((q) => ({ q, ids: ids(q, rc), pass: has(q, "scout.getRwaAssets", rc) === want }));
  const pos = grp(["Which tokenized real-world assets are live on Stellar?", "Show verified tokenized treasury funds and their issuers on Stellar.", "Are tokenized bonds and real estate assets live on Stellar?", "Is Franklin Templeton BENJI actually issued on Stellar?"], true);
  const neg = grp(["How do I get test XLM from Friendbot?", "What is Stellar RPC?", "How can I reduce a Soroban WASM binary size?", "How do I simulate a transaction?", "How do I fetch account balances?", "How do I create and issue a custom Stellar asset?", "How do I build a tokenization contract on Stellar?", "Walk me through issuing a new custom token on Stellar from scratch."], false);
  const def = grp(["Simulate a transfer of a tokenized bond through Stellar RPC.", "How do I read a wallet balance for tokenized treasury assets?", "As a Stellar asset issuer, can I charge transfer fees, cap supply, or freeze a holder, and what is actually possible at the protocol level?"], false);
  const ok = (g) => g.every((x) => x.pass);
  C[8] = { pass: ok(pos) && ok(neg) && ok(def), positives: ok(pos), negatives: ok(neg), deferred: ok(def), rows: [...pos, ...neg, ...def].filter((x) => !x.pass), fixtureSha256: sha(JSON.stringify(rwaEntry)) };
}
// 9. Leaderboard and RFP improvements remain.
{
  const p = [["top projects by GitHub activity", "scout.getLeaderboard"], ["Is there an open SCF RFP for developer tooling or indexing infrastructure I could build against?", "scout.getRfps"]];
  const g = lossesOf(base, measured, ["q-tool-leaderboard-open-issues", "q-scf-rfp-tooling"]);
  C[9] = { pass: p.every(([q, id]) => has(q, id)) && g.every((x) => x.losses.length === 0), probes: p.map(([q, id]) => ({ q, id, ids: ids(q) })), grades: g };
}
// 10. Legacy, skills, holdout gates; extended shows no regression.
{
  const fp = "catalog/manifest.json SHA-256 does not match the committed gate evidence — re-baseline gates.json explicitly";
  const fails = measured.gate.failures.filter((f) => !(isFresh && f === fp));
  const ext = ["top1", "top3", "top5", "cardHit5"].map((k) => [k, base.extendedLane.strict[k], measured.extendedLane.strict[k]]);
  const extRowLosses = gradeDiff(base, measured).filter((x) => x.lane === "extendedCases" && Object.entries(x.changes).some(([k, [a, b]]) => ["top1", "top3", "top5", "cardHit5"].includes(k) && a === true && b !== true));
  const lanes = { legacy: measured.overall, skills: measured.skillsLane, holdout: measured.holdoutLane };
  C[10] = { pass: fails.length === 0 && ext.every(([, a, b]) => b >= a), gateFailures: fails, fingerprintIgnored: isFresh, extended: ext, extendedRowLosses: extRowLosses, lanes };
}
// 11. Controlled-vocabulary operation for directory-taxonomy queries.
{
  const r = [["What project categories does the Stellar ecosystem directory actually track — give me the controlled list of category values it uses.", "lumenloop.get_categories"], ["ecosystem project category filter", "lumenloop.get_categories"], ["directory project categories list", "lumenloop.get_categories"], ["List the exact region values allowed by the project directory.", "lumenloop.get_regions"]].map(([q, id]) => ({ q, id, ids: ids(q), pass: has(q, id) }));
  C[11] = { pass: r.every((x) => x.pass), rows: r };
}
// 12. Fresh source: four rows at baseline-main grades, reviewSubmission excluded and absent, no cross-source graded losses (D1); the strict zero-change verdict is reported beside it.
{
  const inv = read(`${V}/src-${pairFresh}/inventory/stellar-light.json`);
  const [a, b, c] = inv.openapiVersion.split(".").map(Number);
  const freshEnough = a > 1 || (a === 1 && (b > 9 || (b === 9 && c >= 71)));
  const four = lossesOf(base, fresh, ["q-defi-agentic-payment-standards-compare", "q-defi-blend-alternatives", "q-defi-rwa-overview", "q-scf-funded-similar-payroll"]);
  const freshManifest = read(`${V}/runs/${pairFresh}-manifest.json`);
  const reviewExposed = freshManifest.entries.some((e) => e.id === "scout.reviewSubmission");
  const reviewCaptures = rows(fresh).filter((x) => x.topHits.some((h) => h.id === "scout.reviewSubmission")).map((x) => x.id);
  const changes = gradeDiff(main, fresh);
  const fp = "catalog/manifest.json SHA-256 does not match the committed gate evidence — re-baseline gates.json explicitly";
  const freshNumeric = fresh.gate.failures.filter((f) => f !== fp);
  const newOps = ["scout.analyzeHackathonSubmissions", "scout.getHackathonSubmission", "scout.locateSource", "scout.reviewSubmission"];
  const newOpRows = rows(fresh).flatMap((x) => x.topHits.map((h, i) => [x, h, i]).filter(([, h]) => newOps.includes(h.id)).map(([x, h, i]) => ({ id: x.id, lane: x.lane, op: h.id, rank: i + 1, score: h.score })));
  // D1 (lead, addendum 2): losses only between the paired sources on the 532 graded rows; gains listed.
  const graded = changes.filter((x) => x.lane !== "protocolHistoryCases");
  const crossLosses = graded.filter((x) => Object.entries(x.changes).some(([k, [a, b]]) => k !== "forbiddenCapture" && a === true && b !== true) || (x.changes.forbiddenCapture && x.changes.forbiddenCapture[0] === false && x.changes.forbiddenCapture[1] === true));
  const crossGains = graded.filter((x) => !crossLosses.includes(x));
  const common = freshEnough && four.every((x) => x.losses.length === 0) && reviewCaptures.length === 0 && !reviewExposed && freshNumeric.length === 0;
  C[12] = {
    pass: common && crossLosses.length === 0,
    strictZeroChangePass: common && changes.length === 0,
    crossLosses, crossGains,
    version: inv.openapiVersion, four, reviewExposed, reviewCapturesVacuous: !reviewExposed, reviewCaptures,
    gradeChanges: changes, orderChanges: orderDiff(main, fresh).length, freshNumericFailures: freshNumeric, newOpTop5: newOpRows
  };
}

out.allPass = Object.values(C).every((c) => c.pass);
out.gradeChangesVsBaseline = gradeDiff(base, measured);
out.totals = { legacy: pick(measured.overall ?? {}), raw: { overall: measured.overall, extended: measured.extendedLane.strict, skills: measured.skillsLane, holdout: measured.holdoutLane } };
fs.writeFileSync(`${V}/runs/${label}-accept.json`, JSON.stringify(out, null, 1) + "\n");
console.log(JSON.stringify({ label, manifest: out.manifestSha256.slice(0, 12), reproduced, checks: Object.fromEntries(Object.entries(C).map(([k, v]) => [k, v.pass])), allPass: out.allPass }));
process.exitCode = out.allPass ? 0 : 1;
