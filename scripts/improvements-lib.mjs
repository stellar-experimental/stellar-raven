import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { writeFileAtomic } from "./lib/shared.mjs";

export const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
export const IMPROVEMENTS_DIR = path.join(ROOT, "improvements");
export const INDEX_PATH = path.join(IMPROVEMENTS_DIR, "INDEX.md");
export const INTAKE_PATH = path.join(IMPROVEMENTS_DIR, "intake.json");
export const RESOLVED_PATH = path.join(IMPROVEMENTS_DIR, "resolved.json");
export const SERVICE_ORDER = ["skills", "stellar-light-scout", "stellar-docs", "lumenloop", "workers-ai-provider"];
export const ALLOWED_SERVICES = new Set([
  "lumenloop",
  "stellar-light-scout",
  "stellar-docs",
  "skills",
  "workers-ai-provider",
]);
export const ALLOWED_STATUSES = new Set([
  "proposed",
  "verified",
  "reported-upstream",
  "declined-upstream",
  "fixed-upstream",
]);
export const GITHUB_REPO_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
export const UPSTREAM_TITLE_MIN = 20;
export const UPSTREAM_TITLE_MAX = 120;

// Containment detection of a GitHub issue/PR URL inside an evidence entry. This answers "was this
// record filed?", not "which exact ref is cited?" — the filer keeps a stricter whole-ref extractor
// (GITHUB_REF_RE in improvements-file-issue.mjs) for exact-match successor checks, and the two
// must not be merged.
export const GITHUB_EVIDENCE_REF_RE = /https:\/\/github\.com\/[^/\s)]+\/[^/\s)]+\/(?:issues|pull)\/\d+/i;

export function listFindingFiles() {
  const files = [];
  for (const service of readdirSync(IMPROVEMENTS_DIR, { withFileTypes: true })) {
    if (!service.isDirectory()) continue;
    const dir = path.join(IMPROVEMENTS_DIR, service.name);
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(path.join(dir, entry.name));
      }
    }
  }
  return files.sort();
}

/**
 * True when a `relPath` produced by `parseFinding` does not name a path inside the repository.
 *
 * Two shapes, because `path.relative` produces two. It walks up with `..` when it can reach the
 * target, and returns the target ABSOLUTE when it cannot — on Windows that is any file on another
 * drive letter, where a `..`-only check silently passes and an out-of-tree finding would file.
 *
 * The `..` test splits on the separator rather than `startsWith("..")`, which would also reject a
 * legitimate `..hidden/finding.md`.
 */
export function escapesRepo(relPath) {
  return path.isAbsolute(relPath) || relPath.split(path.sep)[0] === "..";
}

export function parseFinding(file) {
  const raw = readFileSync(file, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    throw new Error(`${file}: missing frontmatter`);
  }
  const frontmatterRaw = match[1];
  const body = raw.slice(match[0].length);
  return {
    file,
    relPath: path.relative(ROOT, file),
    raw,
    frontmatterRaw,
    frontmatter: parseFrontmatter(frontmatterRaw),
    body,
  };
}

export function parseFrontmatter(text) {
  const out = {};
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const top = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!top) continue;
    const [, key, value = ""] = top;
    if (value.trim() !== "") {
      out[key] = unquote(value.trim());
      continue;
    }

    const block = [];
    let j = i + 1;
    while (j < lines.length && /^  /.test(lines[j])) {
      block.push(lines[j]);
      j++;
    }
    i = j - 1;
    if (key === "evidence") out[key] = parseScalarList(block);
    else if (key === "recurrences") out[key] = parseObjectList(block);
    else if (key === "probe") out[key] = parseIndentedObject(block, 2);
    else out[key] = block.join("\n");
  }
  return out;
}

function parseScalarList(lines) {
  return lines
    .map((line) => line.match(/^  -\s*(.*)$/)?.[1])
    .filter((line) => line !== undefined)
    .map((line) => unquote(line.trim()));
}

function parseObjectList(lines) {
  const items = [];
  let current = null;
  for (const line of lines) {
    const start = line.match(/^  -\s*([A-Za-z0-9_-]+):\s*(.*)$/);
    if (start) {
      current = {};
      items.push(current);
      current[start[1]] = unquote(start[2].trim());
      continue;
    }
    const prop = line.match(/^    ([A-Za-z0-9_-]+):\s*(.*)$/);
    if (prop && current) current[prop[1]] = unquote(prop[2].trim());
  }
  return items;
}

function parseIndentedObject(lines, baseIndent) {
  const out = {};
  let currentKey = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prop = line.match(new RegExp(`^ {${baseIndent}}([A-Za-z0-9_-]+):(?:\\s*(.*))?$`));
    if (!prop) continue;
    const [, key, value = ""] = prop;
    if (value.trim() !== "") {
      out[key] = unquote(value.trim());
      currentKey = key;
      continue;
    }
    currentKey = key;
    const child = [];
    let j = i + 1;
    while (j < lines.length && new RegExp(`^ {${baseIndent + 2}}`).test(lines[j])) {
      child.push(lines[j]);
      j++;
    }
    i = j - 1;
    const hasLists = child.some((childLine) => childLine.match(new RegExp(`^ {${baseIndent + 2}}[A-Za-z0-9_-]+:\\s*$`)));
    if (hasLists) out[key] = parseExpectationObject(child, baseIndent + 2);
    else out[key] = parseScalarList(child.map((childLine) => childLine.slice(baseIndent)));
  }
  void currentKey;
  return out;
}

function parseExpectationObject(lines, indent) {
  const out = {};
  for (let i = 0; i < lines.length; i++) {
    const prop = lines[i].match(new RegExp(`^ {${indent}}([A-Za-z0-9_-]+):(?:\\s*(.*))?$`));
    if (!prop) continue;
    const [, key, value = ""] = prop;
    if (value.trim()) {
      out[key] = parseScalarValue(value.trim());
      continue;
    }
    const list = [];
    let j = i + 1;
    while (j < lines.length && new RegExp(`^ {${indent + 2}}-\\s+`).test(lines[j])) {
      list.push(unquote(lines[j].replace(new RegExp(`^ {${indent + 2}}-\\s+`), "").trim()));
      j++;
    }
    out[key] = list;
    i = j - 1;
  }
  return out;
}

function parseScalarValue(value) {
  if (/^\d+$/.test(value)) return Number(value);
  if (value === "true") return true;
  if (value === "false") return false;
  return unquote(value);
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function section(body, heading) {
  const marker = `## ${heading}`;
  const start = body.indexOf(marker);
  if (start === -1) return "";
  const after = body.slice(start + marker.length).replace(/^\s+/, "");
  const end = after.search(/\n##\s+/);
  return (end === -1 ? after : after.slice(0, end)).trim();
}

export function oneLineTitle(finding) {
  const findingText = section(finding.body, "Finding");
  const first = findingText
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .find(Boolean) ?? "";
  const title = first
    .replace(/[`*_]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\.$/, "");
  if (title.length <= 140) return title;
  const truncated = title.slice(0, 139);
  const boundary = truncated.lastIndexOf(" ");
  return `${boundary === -1 ? "" : truncated.slice(0, boundary)}…`;
}

/**
 * The upstreamTitle contract for one finding's frontmatter. Returns the error message (without a
 * file label), or null when the record complies.
 *
 * 1. A present, non-blank upstreamTitle must be UPSTREAM_TITLE_MIN-UPSTREAM_TITLE_MAX characters
 *    after trimming — the same cap the filer enforces at filing time (issueTitle in
 *    improvements-file-issue.mjs; both read the constants above, so the numbers exist once).
 *    Linting it here catches an out-of-cap title when the record lands, not only when someone
 *    runs the filer.
 * 2. A record past `proposed` (verified, reported-upstream, declined-upstream, fixed-upstream)
 *    must carry a non-blank upstreamTitle. Grandfather clause: a record whose evidence already
 *    cites a GitHub issue/PR URL predates the field — it was filed before upstreamTitle existed
 *    and cannot retroactively name the issue it opened — so it is exempt. A verified record with
 *    no filed ref has not been filed yet, so it must carry the title it will file with.
 *    (`proposed` is pre-filing and stays exempt.)
 */
export function upstreamTitleError(fm) {
  const title = String(fm.upstreamTitle ?? "").trim();
  if (title) {
    if (title.length < UPSTREAM_TITLE_MIN || title.length > UPSTREAM_TITLE_MAX) {
      return `upstreamTitle must be ${UPSTREAM_TITLE_MIN}-${UPSTREAM_TITLE_MAX} characters (got ${title.length})`;
    }
    return null;
  }
  if (!["verified", "reported-upstream", "declined-upstream", "fixed-upstream"].includes(fm.status)) {
    return null;
  }
  // Malformed frontmatter (`evidence: foo`) is reported by the lint's own list check; do not throw here.
  const evidence = Array.isArray(fm.evidence) ? fm.evidence : [];
  const filed = evidence.some((entry) => GITHUB_EVIDENCE_REF_RE.test(String(entry)));
  if (filed) return null;
  return `upstreamTitle is required at status '${fm.status}' (reader-first issue title, ${UPSTREAM_TITLE_MIN}-${UPSTREAM_TITLE_MAX} characters)`;
}

export function writeFindingFrontmatter(finding, updates) {
  const lines = finding.frontmatterRaw.split("\n");
  const setScalar = (key, value) => {
    const idx = lines.findIndex((line) => line.startsWith(`${key}:`));
    if (idx === -1) lines.push(`${key}: ${value}`);
    else lines[idx] = `${key}: ${value}`;
  };
  if (updates.status) setScalar("status", updates.status);
  if (updates.evidenceAppend) {
    const idx = lines.findIndex((line) => line === "evidence:");
    if (idx === -1) {
      lines.push("evidence:");
      lines.push(`  - ${updates.evidenceAppend}`);
    } else {
      let insertAt = idx + 1;
      while (insertAt < lines.length && /^  - /.test(lines[insertAt])) insertAt++;
      lines.splice(insertAt, 0, `  - ${updates.evidenceAppend}`);
    }
  }
  const next = `---\n${lines.join("\n")}\n---\n${finding.body}`;
  writeFileAtomic(finding.file, next);
}

export function renderIndex(findings = listFindingFiles().map(parseFinding)) {
  const rowsByService = new Map(SERVICE_ORDER.map((service) => [service, []]));

  for (const finding of findings) {
    const fm = finding.frontmatter;
    rowsByService.get(fm.service)?.push([
      fm.id,
      oneLineTitle(finding),
      fm.status,
      fm.discovered,
      (fm.recurrences ?? []).length,
    ]);
  }

  const lines = [
    "# Improvements Index",
    "",
    "> Generated by `npm run improvements:index`. Do not hand-edit.",
    "",
    `Total findings: ${findings.length}`,
    "",
  ];

  for (const service of SERVICE_ORDER) {
    const rows = rowsByService.get(service) ?? [];
    lines.push(`## ${service}`);
    lines.push("");
    lines.push(markdownTable(rows, ["id", "title", "status", "discovered", "recurrences"]));
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

/**
 * Write the generated index for `findings` and return how many it covered.
 *
 * The index entrypoint and the lifecycle commands share this function, so index rendering and the
 * atomic replace stay in one place.
 */
export function writeIndex(findings = listFindingFiles().map(parseFinding), file = INDEX_PATH) {
  writeFileAtomic(file, renderIndex(findings));
  return findings.length;
}

export function readIntake(file = INTAKE_PATH) {
  return JSON.parse(readFileSync(file, "utf8"));
}

export function readResolved(file = RESOLVED_PATH) {
  return JSON.parse(readFileSync(file, "utf8"));
}

export function resolveIntake(finding, intake) {
  const id = finding.frontmatter.id;
  const serviceName = finding.frontmatter.service;
  const override = intake.findings?.[id];
  if (override) {
    if (override.repo) {
      return { kind: "repo", repo: override.repo, source: `finding override ${id}` };
    }
    if (override.intake === "unclear") {
      return {
        kind: "unclear",
        source: `finding override ${id}`,
        reason: override.reason ?? "intake explicitly marked unclear",
      };
    }
    return {
      kind: "unresolved",
      source: `finding override ${id}`,
      reason: "override must set repo or intake: unclear",
    };
  }

  const service = intake.services?.[serviceName];
  if (!service) {
    return { kind: "unresolved", source: `service ${serviceName}`, reason: "service missing from intake.json" };
  }

  if (service.repo) {
    return { kind: "repo", repo: service.repo, source: `service ${serviceName}` };
  }

  if (service.type === "unclear") {
    const reason = service.decision ?? service.rule ?? service.reason;
    return reason
      ? { kind: "unclear", source: `service ${serviceName}`, reason }
      : { kind: "unresolved", source: `service ${serviceName}`, reason: "unclear service needs a decision/rule" };
  }

  if (service.type === "mixed") {
    const rule = service.contentRule ?? service.rankingRule ?? service.rule;
    return rule
      ? {
          kind: "mixed",
          source: `service ${serviceName}`,
          repos: [service.contentRepo].filter(Boolean),
          reason: rule,
        }
      : { kind: "unresolved", source: `service ${serviceName}`, reason: "mixed service needs a rule naming when it applies" };
  }

  if (service.default?.repo) {
    return { kind: "repo", repo: service.default.repo, source: `service ${serviceName} default` };
  }

  if (Array.isArray(service.default?.repos) && service.default.repos.length === 1) {
    return { kind: "repo", repo: service.default.repos[0], source: `service ${serviceName} default` };
  }

  if (Array.isArray(service.default?.repos) && service.default.repos.length > 1 && service.default.rule) {
    return {
      kind: "mixed",
      source: `service ${serviceName} default`,
      repos: service.default.repos,
      reason: service.default.rule,
    };
  }

  return { kind: "unresolved", source: `service ${serviceName}`, reason: "no repo, explicit unclear marker, or mixed rule" };
}

export function collectIntakeRepos(intake) {
  const repos = [];
  const add = (repo, source) => {
    if (repo !== undefined) repos.push({ repo, source });
  };

  for (const [serviceName, service] of Object.entries(intake.services ?? {})) {
    add(service.repo, `services.${serviceName}.repo`);
    add(service.contentRepo, `services.${serviceName}.contentRepo`);
    for (const [idx, repo] of (service.default?.repos ?? []).entries()) {
      add(repo, `services.${serviceName}.default.repos[${idx}]`);
    }
    for (const [name, repo] of Object.entries(service.sourceRepos ?? {})) {
      add(repo, `services.${serviceName}.sourceRepos.${name}`);
    }
    for (const [idx, repo] of (service.repoSearch?.publicReposObserved ?? []).entries()) {
      add(repo, `services.${serviceName}.repoSearch.publicReposObserved[${idx}]`);
    }
  }

  for (const [id, override] of Object.entries(intake.findings ?? {})) {
    add(override.repo, `findings.${id}.repo`);
  }

  return repos;
}

export function markdownTable(rows, headers) {
  const escape = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  const widths = headers.map((header, idx) =>
    Math.max(header.length, ...rows.map((row) => escape(row[idx]).length)),
  );
  const line = (cells) => `| ${cells.map((cell, idx) => escape(cell).padEnd(widths[idx])).join(" | ")} |`;
  return [
    line(headers),
    `| ${widths.map((width) => "-".repeat(width)).join(" | ")} |`,
    ...rows.map(line),
  ].join("\n");
}
