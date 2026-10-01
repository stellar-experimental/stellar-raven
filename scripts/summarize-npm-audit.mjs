#!/usr/bin/env node
/**
 * summarize-npm-audit.mjs - the report for the dependency-audit issue.
 *
 * Reads `npm audit --json` output (report version 2) and writes a deterministic Markdown report:
 * rows sorted by severity then package, advisory IDs sorted, no timestamps. The fingerprint is a
 * SHA-256 over the normalized findings, so the workflow edits the issue only when the findings
 * change. A malformed report or an npm error object exits 2, so a failed audit can never close the
 * issue as clean.
 *
 * Usage: node scripts/summarize-npm-audit.mjs <npm-audit.json> --out <report.md> [--commit <sha>]
 * Prints `findings=<n>` and `fingerprint=<sha256>` lines for $GITHUB_OUTPUT.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const MARKER = "npm-audit-report";
const SEVERITY_ORDER = ["critical", "high", "moderate", "low", "info"];

function advisoryId(url) {
  const last = typeof url === "string" ? url.split("/").pop() : "";
  return last || String(url);
}

function fixText(fixAvailable) {
  if (fixAvailable === true) return "available";
  if (!fixAvailable) return "none";
  const major = fixAvailable.isSemVerMajor ? " (major)" : "";
  return `\`${fixAvailable.name}@${fixAvailable.version}\`${major}`;
}

/** Validate an `npm audit --json` report and return its findings in a canonical order. */
export function normalizeAudit(report) {
  if (!report || typeof report !== "object") throw new Error("npm audit output is not a JSON object");
  if (report.error) {
    const code = report.error.code ?? "unknown";
    throw new Error(`npm audit failed (${code}): ${report.error.summary ?? "no summary"}`);
  }
  if (report.auditReportVersion !== 2) {
    throw new Error(`unsupported auditReportVersion ${JSON.stringify(report.auditReportVersion)}; expected 2`);
  }
  if (!report.vulnerabilities || typeof report.vulnerabilities !== "object") {
    throw new Error("npm audit output has no vulnerabilities object");
  }
  const findings = Object.values(report.vulnerabilities).map((v) => {
    if (!SEVERITY_ORDER.includes(v.severity)) throw new Error(`unknown severity ${JSON.stringify(v.severity)} for ${v.name}`);
    const advisories = new Set();
    const via = new Set();
    for (const item of v.via ?? []) {
      if (typeof item === "string") via.add(item);
      else advisories.add(advisoryId(item.url));
    }
    return {
      name: v.name,
      severity: v.severity,
      direct: Boolean(v.isDirect),
      range: v.range ?? "",
      advisories: [...advisories].sort(),
      via: [...via].sort(),
      fix: fixText(v.fixAvailable)
    };
  });
  findings.sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity) ||
      (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
  );
  return findings;
}

/** GitHub tables split on `|` even inside code spans, so every cell escapes it. */
function cell(text) {
  return text.replaceAll("|", "\\|");
}

function advisoryLink(id) {
  return /^GHSA-[0-9a-z-]+$/.test(id) ? `[${id}](https://github.com/advisories/${id})` : id;
}

export function fingerprint(findings) {
  return createHash("sha256").update(JSON.stringify(findings)).digest("hex");
}

/** Render the issue body. The first line carries the fingerprint the workflow compares. */
export function renderReport(findings, { commit } = {}) {
  const print = fingerprint(findings);
  const counts = SEVERITY_ORDER.map((s) => [s, findings.filter((f) => f.severity === s).length])
    .filter(([, n]) => n > 0)
    .map(([s, n]) => `${n} ${s}`);
  const lines = [`<!-- ${MARKER} fingerprint=${print} -->`];
  if (findings.length === 0) {
    lines.push("`npm audit` reports no vulnerable packages in `package-lock.json`.");
  } else {
    lines.push(
      `\`npm audit\` reports ${findings.length} vulnerable ${findings.length === 1 ? "package" : "packages"} ` +
        `in \`package-lock.json\`: ${counts.join(", ")}.`,
      "",
      "| Package | Severity | Direct | Vulnerable range | Advisories or source | Fix |",
      "|---|---|---|---|---|---|"
    );
    for (const f of findings) {
      const sources = [...f.advisories.map(advisoryLink), ...f.via.map((name) => `via \`${name}\``)].join(", ");
      const row = [`\`${f.name}\``, f.severity, f.direct ? "yes" : "no", `\`${f.range}\``, sources, f.fix];
      lines.push(`| ${row.map(cell).join(" | ")} |`);
    }
  }
  lines.push(
    "",
    commit ? `Report from commit \`${commit}\`. Reproduce it with \`npm audit\`.` : "Reproduce it with `npm audit`.",
    "",
    "The dependency-audit workflow edits this issue only when the findings change, and closes it when",
    "`npm audit` reports none. Record a blocked or deferred upgrade in `.agents/TODO.md` (Dependencies)."
  );
  return { body: `${lines.join("\n")}\n`, fingerprint: print, findings: findings.length };
}

function main() {
  const args = process.argv.slice(2);
  const input = args[0];
  const outIndex = args.indexOf("--out");
  const commitIndex = args.indexOf("--commit");
  const out = outIndex >= 0 ? args[outIndex + 1] : undefined;
  const commit = commitIndex >= 0 ? args[commitIndex + 1] : undefined;
  if (!input || !out) {
    console.error("usage: summarize-npm-audit.mjs <npm-audit.json> --out <report.md> [--commit <sha>]");
    process.exit(2);
  }
  let report;
  try {
    report = renderReport(normalizeAudit(JSON.parse(readFileSync(input, "utf8"))), { commit });
  } catch (error) {
    console.error(`::error::${error.message}`);
    process.exit(2);
  }
  writeFileSync(out, report.body);
  console.log(`findings=${report.findings}`);
  console.log(`fingerprint=${report.fingerprint}`);
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) main();
