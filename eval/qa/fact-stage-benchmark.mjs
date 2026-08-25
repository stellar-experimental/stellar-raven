import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, posix, relative, resolve, sep, win32 } from "node:path";

const DEFAULT_REPO_ROOT = join(import.meta.dirname, "..", "..");
const APPROVED_LOCAL_PREFIXES = ["eval/qa/results/"];

// A case record is a container. Only these paths hold graded claims, so a
// reference must name one of them. A bare case id, a question, or any other
// container path proves nothing about the selected fact.
const CLAIM_PATHS = new Set([
  "golden.answer",
  "golden.avoid",
  "golden.keyFacts",
  "truth.corroboration",
]);

export const FACT_STAGE_LABELS = [
  "absent-upstream",
  "route-uncalled",
  "called-fact-absent",
  "artifact-only",
  "visible-omitted",
  "contradicted",
  "judge-or-golden",
];

export const FACT_STAGE_BENCHMARK = [
  {
    caseId: "q-live-ll-active-jobs-recency",
    factId: "distinct-active-job-listing-identities",
    requiredIdentity: "each Lumenloop job row id and URL",
    requiredEvidenceClass: "returned listing identity",
    firstMissingStage: "contradicted",
    evidenceRefs: [
      "eval/qa/reviewed/2026-07-12-live-v3-baseline.md#new-case-behavioral-review",
      "eval/qa/corpus/live/live-cases.json#golden.keyFacts[index=3]",
      "eval/qa/reviewed/2026-08-24-fact-stage-classification.md#classification",
    ],
  },
  {
    caseId: "q-live-builders-artifact-continuation",
    factId: "builder-evidence-class-separation",
    requiredIdentity: "builder githubUsername or profile URL",
    requiredEvidenceClass:
      "separate profile, declared-project, codeEvidence, and onStellar fields",
    firstMissingStage: "visible-omitted",
    evidenceRefs: [
      "eval/qa/corpus/live/live-cases.json#golden.keyFacts[index=2]",
      "eval/qa/reviewed/2026-08-24-fact-stage-classification.md#classification",
    ],
  },
  {
    caseId: "q-ti-java-sdk-wallet-feebump",
    factId: "current-java-fee-bump-factories",
    requiredIdentity:
      "network.lightsail:stellar-sdk:4.0.1 FeeBumpTransaction",
    requiredEvidenceClass: "current Java source factory methods",
    firstMissingStage: "called-fact-absent",
    evidenceRefs: [
      "eval/qa/corpus/battery/tooling-infra/q-ti-java-sdk-wallet-feebump.json#golden.keyFacts[index=0]",
      "eval/qa/corpus/battery/tooling-infra/q-ti-java-sdk-wallet-feebump.json#truth.corroboration[index=0]",
      "eval/qa/reviewed/2026-08-24-fact-stage-classification.md#classification",
    ],
  },
  {
    caseId: "q-tool-cctp-stellar-integration",
    factId: "cctp-finality-and-handler-conflicts",
    requiredIdentity: "Stellar CCTP V2 domain 27 deployment",
    requiredEvidenceClass:
      "Circle primary documentation and deployed contract interface",
    firstMissingStage: "absent-upstream",
    evidenceRefs: [
      "eval/qa/corpus/battery/tooling-infra/q-tool-cctp-stellar-integration.json#truth.corroboration[index=2]",
      "eval/qa/consistency-register.json#clusters.entries[id=cluster-124]",
      "eval/qa/reviewed/2026-08-24-fact-stage-classification.md#classification",
    ],
  },
  {
    caseId: "q-hist-quantum-preparedness-plan",
    factId: "stage-1-planned-not-shipped",
    requiredIdentity: "SDF Quantum Preparedness Plan published 2026-06-09",
    requiredEvidenceClass: "dated SDF roadmap wording",
    firstMissingStage: "contradicted",
    evidenceRefs: [
      "eval/qa/corpus/battery/history-org-tokenomics/q-hist-quantum-preparedness-plan.json#golden.keyFacts[index=2]",
      "eval/qa/reviewed/2026-07-super-corpus-baseline.md#wrong-and-partial-triage",
      "eval/qa/corpus/battery/history-org-tokenomics/q-hist-quantum-preparedness-plan.json#truth.corroboration[index=1]",
      "eval/qa/reviewed/2026-08-24-fact-stage-classification.md#classification",
    ],
  },
  {
    caseId: "q-infra-rpc-provider-archive-tier",
    factId: "dated-seven-provider-archive-roster",
    requiredIdentity: "official Stellar RPC provider rows as of 2026-07-11",
    requiredEvidenceClass: "dated official provider table",
    firstMissingStage: "called-fact-absent",
    evidenceRefs: [
      "eval/qa/corpus/battery/tooling-infra/q-infra-rpc-provider-archive-tier.json#golden.keyFacts[index=0]",
      "eval/qa/consistency-register.json#clusters.entries[id=cluster-018]",
      "eval/qa/reviewed/2026-08-24-fact-stage-classification.md#classification",
    ],
  },
  {
    caseId: "q-defi-blend-alternatives",
    factId: "lending-project-lifecycle-conflicts",
    requiredIdentity: "OrbitCDP lifecycle conflict",
    requiredEvidenceClass: "Scout records and operator-owned lifecycle pages",
    firstMissingStage: "absent-upstream",
    evidenceRefs: [
      "eval/qa/corpus/battery/defi-ecosystem/q-defi-blend-alternatives.json#golden.keyFacts[index=1]",
      "eval/qa/corpus/battery/defi-ecosystem/q-defi-blend-alternatives.json#golden.avoid[index=0]",
      "eval/qa/reviewed/2026-08-24-fact-stage-classification.md#classification",
    ],
  },
  {
    caseId: "q-scf-build-award-cap",
    factId: "build-cap-and-payment-structure",
    requiredIdentity: "SCF Build Award",
    requiredEvidenceClass:
      "ownership collision; saved artifact verdict remains correct",
    firstMissingStage: "judge-or-golden",
    evidenceRefs: [
      "eval/qa/corpus/battery/scf-grants-builders/q-scf-build-award-cap.json#golden.keyFacts[index=2]",
      "eval/qa/consistency-register.json#clusters.entries[id=cluster-026]",
      "eval/qa/reviewed/2026-08-24-fact-stage-classification.md#classification",
    ],
  },
];


function splitRef(ref) {
  const hashIndex = ref.indexOf("#");
  return hashIndex === -1
    ? { path: ref, fragment: "" }
    : { path: ref.slice(0, hashIndex), fragment: decodeURIComponent(ref.slice(hashIndex + 1)) };
}

function isPresent(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function readPath(value, path) {
  let current = value;
  for (const part of path.split(".")) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[part];
  }
  return current;
}

// An exact case record: the file must itself be the case, or hold the case in
// a collection. There is no "any parsed object will do" fallback, so unrelated
// JSON cannot satisfy a reference.
function findCaseRecord(parsed, caseId) {
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed.id === caseId) {
    return parsed;
  }
  const collections = [];
  if (Array.isArray(parsed)) collections.push(parsed);
  if (parsed && typeof parsed === "object") {
    for (const value of Object.values(parsed)) {
      if (Array.isArray(value)) collections.push(value);
      else if (value && typeof value === "object") {
        for (const nested of Object.values(value)) {
          if (Array.isArray(nested)) collections.push(nested);
        }
      }
    }
  }
  for (const collection of collections) {
    const match = collection.find(
      (entry) =>
        entry && typeof entry === "object" && (entry.id === caseId || entry.caseId === caseId),
    );
    if (match) return match;
  }
  return undefined;
}

function headingSlug(text) {
  return text
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^\w\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// A Markdown reference must name an exact heading, and that heading's own
// section must name the case. A file that merely mentions the case id
// somewhere else does not resolve.
function resolveHeadingSection(text, fragment) {
  const lines = text.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const heading = /^(#{1,6})\s+(.*?)\s*$/.exec(lines[index]);
    if (!heading) continue;
    const [, hashes, title] = heading;
    if (title !== fragment && headingSlug(title) !== headingSlug(fragment)) continue;
    const level = hashes.length;
    let end = index + 1;
    while (end < lines.length) {
      const next = /^(#{1,6})\s+/.exec(lines[end]);
      if (next && next[1].length <= level) break;
      end += 1;
    }
    return lines.slice(index + 1, end).join("\n");
  }
  return undefined;
}

function resolveJsonRef(parsed, ref, fragment, caseId) {
  const indexed = /^([\w.]+)\[id=([^\]]+)\]$/.exec(fragment);
  if (indexed) {
    const [, path, wantedId] = indexed;
    const collection = readPath(parsed, path);
    if (!Array.isArray(collection)) {
      throw new Error(`${ref} does not resolve ${path} to a collection`);
    }
    const entry = collection.find((row) => row && typeof row === "object" && row.id === wantedId);
    if (!entry) throw new Error(`${ref} has no ${wantedId} record`);
    if (!Array.isArray(entry.members) || !entry.members.includes(caseId)) {
      throw new Error(`${ref} record ${wantedId} does not list ${caseId}`);
    }
    if (!isPresent(entry.label ?? entry.note)) {
      throw new Error(`${ref} record ${wantedId} carries no claim fields`);
    }
    return { kind: "repository" };
  }

  const claim = /^(golden\.(?:answer|avoid|keyFacts)|truth\.corroboration)(?:\[index=(\d+)\])?$/.exec(fragment);
  if (!claim || !CLAIM_PATHS.has(claim[1])) {
    throw new Error(
      `${ref} is not an explicit claim path for ${caseId}; use one of ${[...CLAIM_PATHS].join(", ")}`,
    );
  }
  const record = findCaseRecord(parsed, caseId);
  if (!record) throw new Error(`${ref} has no exact ${caseId} record`);
  const value = readPath(record, claim[1]);
  if (!isPresent(value)) {
    throw new Error(`${ref} resolves no ${claim[1]} claim on the ${caseId} record`);
  }
  if (Array.isArray(value)) {
    if (claim[2] === undefined) throw new Error(`${ref} must select one claim array index`);
    const selected = value[Number(claim[2])];
    if (!isPresent(selected)) throw new Error(`${ref} selects no claim at index ${claim[2]}`);
  } else if (claim[2] !== undefined) {
    throw new Error(`${ref} cannot index a scalar claim`);
  }
  return { kind: "repository" };
}

const CASE_COLUMN_NAMES = new Set(["case", "case id", "caseid", "id"]);

function tableCells(line) {
  let text = line.trim();
  if (text.startsWith("|")) text = text.slice(1);
  if (text.endsWith("|")) text = text.slice(0, -1);
  return text.split("|").map((cell) => cell.replace(/`/g, "").trim());
}

function isAlignmentRow(cells) {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

// A Markdown reference must name the case in the table's own Case or ID column.
// Scanning the whole row would let another case's note satisfy the reference,
// and a substring match would let `q-x-unrelated` satisfy `q-x`. The cell must
// equal the case id exactly.
function findCaseRow(section, caseId) {
  let caseColumn = -1;
  let inTable = false;
  for (const line of section.split("\n")) {
    if (!line.trimStart().startsWith("|")) {
      inTable = false;
      caseColumn = -1;
      continue;
    }
    const cells = tableCells(line);
    if (isAlignmentRow(cells)) continue;
    if (!inTable) {
      inTable = true;
      caseColumn = cells.findIndex((cell) => CASE_COLUMN_NAMES.has(cell.toLowerCase()));
      continue;
    }
    if (caseColumn >= 0 && cells[caseColumn] === caseId) return line;
  }
  return undefined;
}

// The single evidence gate for every fact-stage reference. Every repository
// reference must resolve to an exact case record, an exact register record, or
// an exact heading whose section names the case.
export function resolveFactStageEvidence(ref, caseId, { repoRoot = DEFAULT_REPO_ROOT } = {}) {
  if (ref.startsWith("solo://")) {
    throw new Error(`${ref} is context, not repository-verifiable evidence`);
  }
  if (posix.isAbsolute(ref) || win32.isAbsolute(ref)) throw new Error(`${ref} is an absolute path`);
  if (ref.startsWith("sha256:")) throw new Error(`${ref} is a detached digest, not a record`);

  const { path: relativePath, fragment } = splitRef(ref);
  if (!fragment) throw new Error(`${ref} needs an exact record or heading fragment`);

  const absoluteRoot = resolve(repoRoot);
  const absolutePath = resolve(absoluteRoot, relativePath);
  const pathFromRoot = relative(absoluteRoot, absolutePath);
  if (!pathFromRoot || pathFromRoot === ".." || pathFromRoot.startsWith(`..${sep}`) || isAbsolute(pathFromRoot)) {
    throw new Error(`${ref} escapes the repository root`);
  }
  if (!existsSync(absolutePath)) throw new Error(`${caseId} missing ${relativePath}`);
  const text = readFileSync(absolutePath, "utf8");
  if (text.length === 0) throw new Error(`${ref} is empty`);

  const kind = APPROVED_LOCAL_PREFIXES.some((prefix) => relativePath.startsWith(prefix))
    ? "approved-local"
    : "repository";

  if (relativePath.endsWith(".json")) {
    const resolved = resolveJsonRef(JSON.parse(text), ref, fragment, caseId);
    return { kind: kind === "approved-local" ? kind : resolved.kind };
  }

  const section = resolveHeadingSection(text, fragment);
  if (section === undefined) throw new Error(`${ref} names no exact heading ${fragment}`);
  const row = findCaseRow(section, caseId);
  if (!row) throw new Error(`${ref} section holds no exact ${caseId} row in a Case column`);
  return { kind };
}
