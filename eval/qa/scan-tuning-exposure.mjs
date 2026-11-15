#!/usr/bin/env node
/**
 * Deterministic exposure scan over the tuning rows of a stored QA results file.
 *
 * It decides, for each tuning row, whether the two tuning arms could have fired on the stored
 * transcript, by a static scan of the model's `execute` scripts. It reads no model output and
 * makes no call.
 *
 * - Arm 1 exposed: a `stellarDocs.search_*` operation appears in a script and
 *   `stellarDocs.get_doc_page` appears in none.
 * - Arm 2 exposed: a `scout.searchResearch` call carries a query that contains a
 *   letters-plus-digits identifier (`SEP-43`, `cap 33`, `ERC3643`). The query is read directly when
 *   the call holds a string literal. When it holds a variable (`qs.map(q => searchResearch({ q }))`),
 *   the string literals of the same script stand in for it, and the row is marked inferred. Both
 *   count as exposed; only a direct match makes a non-target row an "A2 rule fires" row.
 *
 * Hygiene: the split file is read for `sets.tuning` only. The results file is filtered by that id
 * list before any other row field is read, and the scan asserts the id count. A row outside
 * `sets.tuning` is never inspected.
 *
 * Usage: node eval/qa/scan-tuning-exposure.mjs --split <split.json> --results <results.json>
 *          [--json]
 */
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";

const TUNING_ROW_COUNT = 79;

/** Role inputs, from the tuning plan: the rows the plan names as targets of each arm. */
export const ARM1_TARGETS = [
  "q-soroban-cli-bindings",
  "q-infra-rpc-methods-list",
  "q-soroban-contract-id-derivation",
  "q-smart-wallet-fee-sponsorship",
  "q-ti-classic-submission-errors",
  "q-pc-cross-redstone-sep40",
  "q-pc-sequence-numbers-ordering-replace",
  "q-pc-account-activation-not-found",
  "q-sep-45-contract-auth"
];
export const ARM2_TARGETS = [
  "q-sep-45-contract-auth",
  "q-sep-43-web-wallet-api",
  "q-sep-53-sign-verify-message",
  "q-crp-oz-rwa-erc3643-trex",
  "q-sep6-sep24-sep31-choice",
  "q-nft-vault-contract-standards",
  "q-net-protocol-meeting-notes-find-cap",
  "q-protocol-ledger-close-time",
  "q-edge-factcheck-soroswap-first-amm"
];
export const PRIORITY_CATEGORIES = ["soroban", "tooling-infra"];
/**
 * Rows the plan leaves out of the panel because their cases were open defects. PR 442 edited
 * them after the stored baseline, so they are compared from step 0-prime onward only.
 */
export const OPEN_DEFECT_ROWS = [
  "q-token-xlm-supply-total-circulating",
  "q-scf-hackathons-active",
  "q-infra-testnet-vs-futurenet",
  "q-raph-stolen-wallet-recovery"
];

const DOCS_SEARCH_RE = /\bstellarDocs\.(search_[A-Za-z0-9_]+)\b/g;
const DOCS_PAGE_RE = /\bstellarDocs\.get_doc_page\b/;
const RESEARCH_RE = /\bscout\.searchResearch\b/g;
const QUERY_PROP_RE = /\b(?:query|q)\s*:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`$]*`)/;
const STRING_LITERAL_RE = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g;
const IDENTIFIER_RE = /\b[A-Za-z]{2,}[- ]?\d+\b/;

const isExecuteTool = (tool) => /(^|__)execute$/.test(String(tool ?? ""));

/** The script text of one execute transcript entry. */
export function scriptOf(entry) {
  const input = String(entry?.input ?? "");
  try {
    const parsed = JSON.parse(input);
    if (parsed && typeof parsed.code === "string") return parsed.code;
  } catch {
    // not JSON: the input is the script
  }
  return input;
}

/** The argument window after a call name: balanced parentheses when it is a direct call. */
function argumentWindow(code, from) {
  let i = from;
  while (i < code.length && /\s/.test(code[i])) i++;
  if (code[i] !== "(") return code.slice(from, from + 400);
  let depth = 0;
  for (let j = i; j < code.length; j++) {
    if (code[j] === "(") depth++;
    else if (code[j] === ")" && --depth === 0) return code.slice(i, j + 1);
  }
  return code.slice(i, i + 400);
}

/** What one stored transcript shows, by a static scan of its execute scripts. */
export function scanTranscript(transcript) {
  const docsSearchOps = new Set();
  let pageRead = false;
  let researchCalls = 0;
  const researchQueries = [];
  let dynamicResearchQueries = 0;
  const inferredTokens = new Set();
  for (const entry of transcript ?? []) {
    if (!isExecuteTool(entry?.tool)) continue;
    const code = scriptOf(entry);
    for (const m of code.matchAll(DOCS_SEARCH_RE)) docsSearchOps.add(m[1]);
    if (DOCS_PAGE_RE.test(code)) pageRead = true;
    for (const m of code.matchAll(RESEARCH_RE)) {
      researchCalls++;
      const literal = QUERY_PROP_RE.exec(argumentWindow(code, m.index + m[0].length));
      if (literal) {
        researchQueries.push(literal[1].slice(1, -1));
      } else {
        dynamicResearchQueries++;
        for (const str of code.match(STRING_LITERAL_RE) ?? []) {
          const token = IDENTIFIER_RE.exec(str.slice(1, -1))?.[0];
          if (token) inferredTokens.add(token);
        }
      }
    }
  }
  const identifierTokens = researchQueries.map((q) => IDENTIFIER_RE.exec(q)?.[0]).filter(Boolean);
  return {
    docsSearchOps: [...docsSearchOps].sort(),
    pageRead,
    arm1Exposed: docsSearchOps.size > 0 && !pageRead,
    researchCalls,
    researchQueries,
    dynamicResearchQueries,
    identifierTokens,
    inferredIdentifierTokens: [...inferredTokens].sort(),
    arm2Direct: identifierTokens.length > 0,
    arm2Exposed: identifierTokens.length > 0 || inferredTokens.size > 0
  };
}

/** Panel role of one scanned row, by the plan's selection rules. */
export function panelRole(row, scan) {
  if (OPEN_DEFECT_ROWS.includes(row.id)) return null;
  const baseline = row.baseline;
  const a1 = ARM1_TARGETS.includes(row.id);
  const a2 = ARM2_TARGETS.includes(row.id);
  if (a1 && a2) return "A1 and A2 target";
  if (a1) return "A1 target";
  if (a2) return "A2 target";
  const exposed = scan.arm1Exposed || scan.arm2Exposed;
  if (baseline === "correct") return exposed ? "control, exposed" : "control, unexposed";
  if (scan.arm2Direct) return "A2 rule fires";
  if (
    PRIORITY_CATEGORIES.includes(row.category) &&
    baseline === "partial" &&
    (scan.arm1Exposed || scan.researchCalls > 0)
  ) {
    return "priority partial";
  }
  return null;
}

/**
 * The tuning rows of a results file. The split's `sets.tuning` is read first, and the results rows
 * are selected by id before any other field of any row is read.
 */
export function selectTuningRows({ split, results }) {
  const tuningIds = split?.sets?.tuning;
  if (!Array.isArray(tuningIds) || tuningIds.length !== TUNING_ROW_COUNT) {
    throw new Error(`sets.tuning must list ${TUNING_ROW_COUNT} ids, got ${tuningIds?.length}`);
  }
  const wanted = new Set(tuningIds);
  if (wanted.size !== TUNING_ROW_COUNT) throw new Error("sets.tuning has duplicate ids");
  const selected = (results?.rows ?? []).filter((row) => wanted.has(row.id));
  if (selected.length !== TUNING_ROW_COUNT) {
    throw new Error(`results hold ${selected.length} of the ${TUNING_ROW_COUNT} tuning rows`);
  }
  return selected;
}

/** Scan the tuning rows of a results file. */
export function scanTuningRows({ split, results }) {
  return selectTuningRows({ split, results })
    .map((row) => {
      const scan = scanTranscript(row.transcript);
      const scanned = {
        id: row.id,
        category: row.tags?.category ?? row.caseInput?.tags?.category ?? null,
        trap: row.tags?.trap ?? row.caseInput?.tags?.trap ?? null,
        baseline: row.verdict?.score ?? null,
        ...scan
      };
      return { ...scanned, role: panelRole(scanned, scan) };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

const ROLE_ORDER = [
  "A1 target",
  "A1 and A2 target",
  "A2 target",
  "A2 rule fires",
  "control, exposed",
  "control, unexposed",
  "priority partial"
];

const yn = (v) => (v ? "yes" : "no");

export function renderMarkdown(rows) {
  const panel = rows
    .filter((r) => r.role)
    .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role) || a.id.localeCompare(b.id));
  const count = (list, fn) => list.filter(fn).length;
  const verdicts = (list) =>
    ["correct", "partial", "wrong"].map((v) => `${count(list, (r) => r.baseline === v)} ${v}`).join(", ");
  const lines = [
    "| Case | Role | Category | Baseline | Docs search, no page read | Research called | Identifier in research query |",
    "|---|---|---|---|---|---|---|"
  ];
  for (const r of panel) {
    const verdict = r.trap && r.baseline === "correct" ? "correct (trap)" : r.baseline;
    const direct = [...new Set(r.identifierTokens)];
    const inferred = r.inferredIdentifierTokens.filter((t) => !direct.includes(t));
    const token = direct.length || inferred.length ? [...direct, ...inferred.map((t) => `${t} (inferred)`)].join(", ") : "no";
    lines.push(
      `| \`${r.id}\` | ${r.role} | ${r.category} | ${verdict} | ${yn(r.arm1Exposed)} | ${yn(r.researchCalls > 0)} | ${token} |`
    );
  }
  const summary = [
    `Tuning rows scanned: ${rows.length} (asserted ${TUNING_ROW_COUNT}).`,
    `Arm 1 exposed (a \`stellarDocs.search_*\` call and no \`get_doc_page\`): ${count(rows, (r) => r.arm1Exposed)} of ${rows.length}.`,
    `Docs-searching rows that read a page: ${count(rows, (r) => r.docsSearchOps.length > 0 && r.pageRead)}; Docs-searching rows in all: ${count(rows, (r) => r.docsSearchOps.length > 0)}.`,
    `Rows that called \`scout.searchResearch\`: ${count(rows, (r) => r.researchCalls > 0)}.`,
    `Arm 2 exposed (a research query holds a letters-plus-digits identifier): ${count(rows, (r) => r.arm2Exposed)}, ${count(rows, (r) => r.arm2Direct)} from a string literal in the call and ${count(rows, (r) => r.arm2Exposed && !r.arm2Direct)} inferred from the script's literals.`,
    `Panel: ${panel.length} rows (${verdicts(panel)}).`
  ];
  return `${summary.join("\n")}\n\n${lines.join("\n")}\n`;
}

function main() {
  const { values } = parseArgs({
    options: { split: { type: "string" }, results: { type: "string" }, json: { type: "boolean", default: false } }
  });
  if (!values.split || !values.results) throw new Error("--split and --results are required");
  const split = JSON.parse(readFileSync(values.split, "utf8"));
  const results = JSON.parse(readFileSync(values.results, "utf8"));
  const rows = scanTuningRows({ split, results });
  process.stdout.write(values.json ? `${JSON.stringify(rows, null, 2)}\n` : renderMarkdown(rows));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
