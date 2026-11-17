#!/usr/bin/env node
/**
 * Keyless probe for the dated golden runs (round items 2.1 and 2.2). Read-only, no dependencies.
 *
 *   node probe.mjs [--protocol] [--software-versions] [--scf] [--quantum] [--out <path>]
 *
 * No section flag runs every section. The output is one JSON object on stdout, or in `--out`.
 * A section that fails reports `{ ok: false, error }` and the others still run. GitHub reads go
 * through `gh api`. The probe states what it saw; it never decides an outcome. PRESTAGE.md holds
 * the outcome test.
 */
import { execFile } from "node:child_process";
import { writeFileSync } from "node:fs";
import { promisify } from "node:util";

const run = promisify(execFile);
const HORIZON = { mainnet: "https://horizon.stellar.org", testnet: "https://horizon-testnet.stellar.org" };
const RPC = { mainnet: "https://mainnet.sorobanrpc.com", testnet: "https://soroban-testnet.stellar.org" };
/** A Mainnet ledger known to run Protocol 29 (closed 2026-10-01). The bisection starts here. */
const KNOWN_P29_LEDGER = 64717645;
const STATUS = "https://status.stellar.org/api/v2";
const DOCS_VERSIONS = "https://developers.stellar.org/docs/networks/software-versions.md";
const SCF_AWARDS = "https://communityfund.stellar.org/awards";
const SCOUT_RFPS = "https://stellarlight.xyz/api/rfps?status=open";
const BELL_GUIDE = "https://stellar.org/blog/developers/bell-protocol-30-upgrade-guide";

async function get(url, init) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000), ...init });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response;
}
const getJson = async (url, init) => (await get(url, init)).json();
const getText = async (url) => (await get(url)).text();
const gh = async (path) => JSON.parse((await run("gh", ["api", path], { maxBuffer: 16e6 })).stdout);
const textOf = (html) => html.replace(/<[^>]*>/g, " ").replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ");

async function section(fn) {
  try {
    return { ok: true, ...(await fn()) };
  } catch (error) {
    return { ok: false, error: String(error?.message ?? error) };
  }
}

const ledgerRow = (r) => ({ sequence: r.sequence, closed_at: r.closed_at, protocol_version: r.protocol_version });

async function horizonRoot(network) {
  const root = await getJson(`${HORIZON[network]}/`);
  const latest = (await getJson(`${HORIZON[network]}/ledgers?order=desc&limit=1`))._embedded.records[0];
  return {
    current_protocol_version: root.current_protocol_version,
    core_supported_protocol_version: root.core_supported_protocol_version,
    core_latest_ledger: root.core_latest_ledger,
    history_latest_ledger: root.history_latest_ledger,
    network_passphrase: root.network_passphrase,
    latestLedger: ledgerRow(latest),
  };
}

async function rpcLatest(network) {
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getLatestLedger" });
  const r = await getJson(RPC[network], { method: "POST", headers: { "content-type": "application/json" }, body });
  return { protocolVersion: r.result.protocolVersion, sequence: r.result.sequence, closeTime: r.result.closeTime };
}

/** First Mainnet ledger at Protocol 30 or above, by bisection over `/ledgers/{seq}`. */
async function activationLedger(latest) {
  const at = async (seq) => ledgerRow(await getJson(`${HORIZON.mainnet}/ledgers/${seq}`));
  if (latest.protocol_version < 30) return { found: false, note: "latest Mainnet ledger is below Protocol 30" };
  let lo = KNOWN_P29_LEDGER;
  let hi = latest.sequence;
  const first = await at(lo);
  if (first.protocol_version >= 30) throw new Error(`start ledger ${lo} already at Protocol ${first.protocol_version}`);
  let steps = 0;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if ((await at(mid)).protocol_version >= 30) hi = mid;
    else lo = mid;
    steps += 1;
  }
  return { found: true, steps, L: await at(hi), Lminus1: await at(lo) };
}

async function statusRows() {
  const [all, upcoming] = await Promise.all([getJson(`${STATUS}/scheduled-maintenances.json`), getJson(`${STATUS}/scheduled-maintenances/upcoming.json`)]);
  const pick = (feed) =>
    (feed.scheduled_maintenances ?? [])
      .filter((m) => /upgrade/i.test(m.name))
      .map(({ name, status, scheduled_for, scheduled_until, resolved_at }) => ({ name, status, scheduled_for, scheduled_until, resolved_at }));
  return { scheduledMaintenances: pick(all), upcoming: pick(upcoming), note: "status is resolved by the clock; a completed row proves nothing" };
}

async function coreReleases() {
  const rows = await gh("repos/stellar/stellar-core/releases?per_page=10");
  return rows.map((r) => ({ tag_name: r.tag_name, prerelease: r.prerelease, published_at: r.published_at }));
}

async function bellGuide() {
  let url = BELL_GUIDE;
  try {
    await get(url);
  } catch {
    const sitemap = await getText("https://stellar.org/sitemap.xml");
    url = [...sitemap.matchAll(/<loc>([^<]*bell[^<]*upgrade-guide[^<]*)<\/loc>/gi)][0]?.[1];
    if (!url) throw new Error("Bell upgrade guide not found in the stellar.org sitemap");
  }
  const text = textOf(await getText(url));
  const lines = [...text.matchAll(/[A-Z][a-z]+ \d{1,2}, \d{4}, ?\d{4} UTC ?[—-][^.]{0,60}/g)].map((m) => m[0].trim());
  return { url, scheduleLines: [...new Set(lines)] };
}

async function protocol() {
  const [mainnet, testnet] = await Promise.all([section(() => horizonRoot("mainnet")), section(() => horizonRoot("testnet"))]);
  const [rpcMainnet, rpcTestnet] = await Promise.all([section(() => rpcLatest("mainnet")), section(() => rpcLatest("testnet"))]);
  const out = {
    horizon: { mainnet, testnet },
    rpc: { mainnet: rpcMainnet, testnet: rpcTestnet },
    activation: await section(() => (mainnet.ok ? activationLedger(mainnet.latestLedger) : Promise.reject(new Error("Mainnet root unavailable")))),
    status: await section(statusRows),
    coreReleases: await section(async () => ({ rows: await coreReleases() })),
    bellGuide: await section(bellGuide),
  };
  return out;
}

async function softwareVersions() {
  const md = await getText(DOCS_VERSIONS);
  const headings = [];
  let current;
  for (const line of md.split("\n")) {
    const h = line.match(/^## (Protocol \d+.*)$/);
    if (h) {
      current = { heading: h[1].trim(), rows: [] };
      headings.push(current);
    } else if (current && /^\| /.test(line) && !/^\| -/.test(line)) {
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      if (cells[0] !== "Software") current.rows.push(cells);
    }
  }
  return { url: DOCS_VERSIONS, headings, hasProtocol30: headings.some((h) => /^Protocol 30\b/.test(h.heading)) };
}

/** The first balanced `{...}` after `from` in `text`. */
function balanced(text, from) {
  const start = text.indexOf("{", from);
  let depth = 0;
  for (let i = start; i < text.length; i += 1) {
    if (text[i] === "{") depth += 1;
    else if (text[i] === "}" && (depth -= 1) === 0) return text.slice(start, i + 1);
  }
  return null;
}

async function scf() {
  const html = await getText(SCF_AWARDS);
  const text = textOf(html);
  const rounds = [...text.matchAll(/SCF #(\d+) ([A-Za-z ]+?) Deadline to submit: ([A-Za-z]+ \d{1,2}, \d{4})/g)].map((m) => ({
    round: Number(m[1]),
    phase: m[2].trim(),
    deadlineToSubmit: m[3],
  }));
  // The awards page embeds each round's phase dates in its Next.js payload (escaped JSON).
  const payload = html.replace(/\\"/g, '"');
  const at = payload.indexOf("SCF #46 is currently");
  const dates = at < 0 ? null : balanced(payload, payload.indexOf('"dates":', at));
  let round46Dates = null;
  try {
    round46Dates = dates ? JSON.parse(dates) : null;
  } catch {
    round46Dates = { unparsed: dates };
  }
  const scout = await section(async () => {
    const feed = await getJson(SCOUT_RFPS);
    return {
      url: SCOUT_RFPS,
      scfRound: feed.meta?.scfRound ?? null,
      counts: feed.meta?.counts ?? null,
      rfpTitles: (feed.rfps ?? []).filter((r) => r.rowType === "rfp").map((r) => r.title),
    };
  });
  return {
    awardsUrl: SCF_AWARDS,
    rounds,
    scf47Present: /SCF #47\b/.test(text),
    round46Card: text.match(/SCF #46 is currently in [^.]*\./)?.[0] ?? null,
    round46Dates,
    scout,
  };
}

async function quantum() {
  const md = Buffer.from((await gh("repos/stellar/stellar-protocol/contents/core/cap-0087.md")).content, "base64").toString("utf8");
  return {
    cap: "CAP-0087",
    status: md.match(/^Status: .*$/m)?.[0] ?? null,
    protocolVersion: md.match(/^Protocol version: .*$/m)?.[0] ?? null,
  };
}

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const outIndex = args.indexOf("--out");
const outPath = outIndex >= 0 ? args[outIndex + 1] : null;
const sections = { "--protocol": protocol, "--software-versions": softwareVersions, "--scf": scf, "--quantum": quantum };
const chosen = Object.keys(sections).filter(flag);
const names = chosen.length ? chosen : Object.keys(sections);

const result = { probedAt: new Date().toISOString(), sections: {} };
for (const name of names) result.sections[name.slice(2)] = await section(sections[name]);
const json = `${JSON.stringify(result, null, 2)}\n`;
if (outPath) writeFileSync(outPath, json);
else process.stdout.write(json);
