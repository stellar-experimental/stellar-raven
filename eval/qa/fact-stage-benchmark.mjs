import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, join, posix, relative, resolve, sep, win32 } from "node:path";

const DEFAULT_REPO_ROOT = join(import.meta.dirname, "..", "..");

// A case record is a container. Only these paths hold graded claims, so a
// reference must name one of them. A bare case id, a question, or any other
// container path proves nothing about the selected fact.
//
// The graded corpus stores keyFacts, avoid, and corroboration as arrays of
// separately graded claims. A reference to one of them must resolve to an
// array and must select one index: a reference to the whole list, or to a
// malformed scalar in its place, does not name a single claim.
const ARRAY_CLAIM_PATHS = new Set([
  "golden.avoid",
  "golden.keyFacts",
  "truth.corroboration",
]);
const SCALAR_CLAIM_PATHS = new Set(["golden.answer"]);
const CLAIM_PATHS = new Set([...ARRAY_CLAIM_PATHS, ...SCALAR_CLAIM_PATHS]);

export const FACT_STAGE_LABELS = [
  "absent-upstream",
  "route-uncalled",
  "called-fact-absent",
  "artifact-only",
  "visible-omitted",
  "contradicted",
  "judge-or-golden",
];

// Every row states one fact, the digest-bound claims that define it, and the
// dated review row that graded the case as a miss. A stage is an assertion
// about observed answering behavior, so it resolves through that graded row
// rather than through this table. A case belongs here when both records exist
// and both name it.
export const FACT_STAGE_BENCHMARK = [
  {
    caseId: "q-live-ll-active-jobs-recency",
    factId: "distinct-active-job-listing-identities",
    requiredIdentity: "each Lumenloop job row id and URL",
    requiredEvidenceClass: "returned listing identity",
    firstMissingStage: "contradicted",
    stageEvidence: {
      ref: "eval/qa/reviewed/2026-07-12-live-v3-baseline.md#new-case-behavioral-review",
      grade: "W / W",
      dispositionDigest:
        "sha256:c315411bc006e7543321eaef2de42ad78bd119992d1360e9dfbe19b1e287b933",
    },
    claimRefs: [
      "eval/qa/corpus/live/live-cases.json#golden.keyFacts[index=3]@sha256:7a26b4751ae483805cf9b5471247af1b8f1c6094ffcc9b6e70c5d2d75dcddec6",
      "eval/qa/corpus/live/live-cases.json#golden.avoid[index=2]@sha256:9649a51478af736b2a1d0c08e8b7a135dbe665ba1085a36d5de9a58efedf42a5",
    ],
    classificationRef:
      "eval/qa/reviewed/2026-08-24-fact-stage-classification.md#classification",
  },
  {
    caseId: "q-hist-quantum-preparedness-plan",
    factId: "dated-quantum-plan-publication",
    requiredIdentity: "SDF Quantum Preparedness Plan published 2026-06-09",
    requiredEvidenceClass: "dated SDF roadmap wording",
    firstMissingStage: "contradicted",
    stageEvidence: {
      ref: "eval/qa/reviewed/2026-07-super-corpus-baseline.md#wrong-and-partial-triage",
      grade: "wrong",
      dispositionDigest:
        "sha256:01cb4f8a42096fd8acea33698cb2d0947def4fb2103a0e659c404436ed6e9658",
    },
    claimRefs: [
      "eval/qa/corpus/battery/history-org-tokenomics/q-hist-quantum-preparedness-plan.json#golden.keyFacts[index=0]@sha256:d5601f41f7d75ee469983b757a5c06018577d783fdb3f6b53e74ac355508bfbe",
      "eval/qa/corpus/battery/history-org-tokenomics/q-hist-quantum-preparedness-plan.json#truth.corroboration[index=0]@sha256:50d300f6e2c65c46db69bec3e4c972783731cdc9ed185e9c6dfe44884cc5b3a6",
    ],
    classificationRef:
      "eval/qa/reviewed/2026-08-24-fact-stage-classification.md#classification",
  },
];

// Key order and whitespace are formatting, not claim content. Canonical
// serialization keeps a reformatted corpus file resolving while any edit to the
// claim itself breaks its digest.
function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const fields = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`);
    return `{${fields.join(",")}}`;
  }
  return JSON.stringify(value);
}

export function claimDigest(value) {
  return `sha256:${createHash("sha256").update(canonicalJson(value)).digest("hex")}`;
}

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

const CLAIM_FRAGMENT = /^([\w.]+)(?:\[index=(\d+)\])?(?:@(.+))?$/;
const DIGEST_FORM = /^sha256:[0-9a-f]{64}$/i;

function resolveJsonRef(parsed, ref, fragment, caseId) {
  const parts = CLAIM_FRAGMENT.exec(fragment);
  const path = parts?.[1];
  if (!path || !CLAIM_PATHS.has(path)) {
    throw new Error(
      `${ref} is not an explicit claim path for ${caseId}; use one of ${[...CLAIM_PATHS].join(", ")}`,
    );
  }
  const [, , rawIndex, digest] = parts;
  if (digest === undefined) {
    throw new Error(`${ref} must bind ${path} to a claim digest`);
  }
  if (!DIGEST_FORM.test(digest)) {
    throw new Error(`${ref} carries "${digest}", which is not a sha256 claim digest`);
  }

  const record = findCaseRecord(parsed, caseId);
  if (!record) throw new Error(`${ref} has no exact ${caseId} record`);
  const value = readPath(record, path);
  if (!isPresent(value)) {
    throw new Error(`${ref} resolves no ${path} claim on the ${caseId} record`);
  }

  let selected = value;
  let index = null;
  if (ARRAY_CLAIM_PATHS.has(path)) {
    if (!Array.isArray(value)) throw new Error(`${ref} does not resolve ${path} to a claim array`);
    if (rawIndex === undefined) throw new Error(`${ref} must select one claim array index`);
    index = Number(rawIndex);
    selected = value[index];
    if (!isPresent(selected)) throw new Error(`${ref} selects no claim at index ${index}`);
  } else if (rawIndex !== undefined) {
    throw new Error(`${ref} cannot index a scalar claim`);
  } else if (Array.isArray(value)) {
    throw new Error(`${ref} resolves ${path} to an array, not a scalar claim`);
  }

  const actual = claimDigest(selected);
  if (actual !== digest.toLowerCase()) {
    throw new Error(`${ref} does not match the claim it names; that claim digests to ${actual}`);
  }
  return { kind: "claim", path, index, digest: actual };
}

const FENCE_LINE = /^\s{0,3}(`{3,}|~{3,})(.*)$/;

// A fenced block is an example, not a record. Its headings and table rows are
// dropped before anything is matched, so a documented sample cannot resolve as
// the evidence it illustrates.
//
// Only a bare marker closes a block: the closing line must repeat the opening
// character, run at least as long, and carry nothing but whitespace after it.
// An opening line may carry an info string, so a fence line with trailing text
// keeps the block open and the rows below it stay unmatched.
function withoutFencedBlocks(text) {
  const kept = [];
  let fence = null;
  for (const line of text.split("\n")) {
    const marker = FENCE_LINE.exec(line);
    if (fence) {
      if (
        marker &&
        marker[1][0] === fence[0] &&
        marker[1].length >= fence.length &&
        marker[2].trim() === ""
      ) {
        fence = null;
      }
      continue;
    }
    if (marker) {
      fence = marker[1];
      continue;
    }
    kept.push(line);
  }
  return kept.join("\n");
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

const CASE_COLUMN_NAMES = new Set(["case", "case id", "caseid", "id"]);
const STAGE_COLUMN_NAMES = new Set(["first missing stage", "stage"]);
const FACT_COLUMN_NAMES = new Set(["fact", "fact id", "factid"]);
const GRADE_COLUMN_NAMES = new Set(["grade", "raw", "raw / reviewed"]);
const DISPOSITION_COLUMN_NAMES = new Set(["evidence and disposition", "disposition"]);

function columnFor(cells, names) {
  return cells.findIndex((cell) => names.has(cell.toLowerCase()));
}

function tableCells(line) {
  let text = line.trim();
  if (text.startsWith("|")) text = text.slice(1);
  if (text.endsWith("|")) text = text.slice(0, -1);
  return text.split("|").map((cell) => cell.replace(/`/g, "").trim());
}

function isAlignmentRow(cells) {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

// CommonMark reads a line indented four spaces, or one tab, as indented code.
// Such a line is an example, not a table row, and it interrupts any table
// above it.
const INDENTED_CODE_LINE = /^(?: {4}| {0,3}\t)/;

// A Markdown reference must name the case in the table's own Case or ID column.
// Scanning the whole row would let another case's note satisfy the reference,
// and a substring match would let `q-x-unrelated` satisfy `q-x`. The cell must
// equal the case id exactly. The header columns are returned with the row so a
// caller that expects a fact, stage, or grade can bind the row to them, not
// merely to the case id's presence.
function findCaseRow(section, caseId) {
  let columns = null;
  for (const line of section.split("\n")) {
    if (INDENTED_CODE_LINE.test(line) || !line.trimStart().startsWith("|")) {
      columns = null;
      continue;
    }
    const cells = tableCells(line);
    if (isAlignmentRow(cells)) continue;
    if (!columns) {
      const caseColumn = columnFor(cells, CASE_COLUMN_NAMES);
      if (caseColumn >= 0) {
        columns = {
          case: caseColumn,
          stage: columnFor(cells, STAGE_COLUMN_NAMES),
          fact: columnFor(cells, FACT_COLUMN_NAMES),
          grade: columnFor(cells, GRADE_COLUMN_NAMES),
          disposition: columnFor(cells, DISPOSITION_COLUMN_NAMES),
        };
      }
      continue;
    }
    if (cells[columns.case] === caseId) return { cells, columns };
  }
  return undefined;
}

// Presence alone proves nothing about the classification. When a caller states
// what fact, first missing stage, or grade a row must carry, every expected
// cell must exist in the matched table and equal the expectation exactly.
function assertRowBinding(ref, caseId, { cells, columns }, expect) {
  const bindings = [
    ["stage", "First missing stage", expect?.firstMissingStage],
    ["fact", "Fact", expect?.factId],
    ["grade", "Grade", expect?.grade],
  ];
  for (const [column, label, wanted] of bindings) {
    if (wanted === undefined) continue;
    const index = columns[column];
    if (index === -1 || cells[index] === undefined) {
      throw new Error(`${ref} carries no ${label} cell for ${caseId}`);
    }
    if (cells[index] !== wanted) {
      throw new Error(
        `${ref} records ${caseId} ${label.toLowerCase()} "${cells[index]}", not "${wanted}"`,
      );
    }
  }

  // A grade is one token that many cases share, so it cannot show that the row
  // observed this case's behavior. The saved disposition states that behavior,
  // and its digest keeps the row and the benchmark from drifting apart.
  const wantedDigest = expect?.dispositionDigest;
  if (wantedDigest === undefined) return;
  const index = columns.disposition;
  if (index === -1 || cells[index] === undefined) {
    throw new Error(`${ref} carries no Disposition cell for ${caseId}`);
  }
  const actual = claimDigest(cells[index]);
  if (actual !== wantedDigest.toLowerCase()) {
    throw new Error(
      `${ref} records a ${caseId} disposition digesting to ${actual}, not ${wantedDigest}`,
    );
  }
}

// The single evidence gate for every fact-stage reference. A JSON reference
// must resolve to one digest-bound claim on an exact case record; a Markdown
// reference must resolve to an exact heading whose own table names the case in
// a Case column.
export function resolveFactStageEvidence(ref, caseId, { repoRoot = DEFAULT_REPO_ROOT, expect } = {}) {
  if (/^solo:\/\//i.test(ref)) {
    throw new Error(`${ref} is context, not repository-verifiable evidence`);
  }
  if (posix.isAbsolute(ref) || win32.isAbsolute(ref)) throw new Error(`${ref} is an absolute path`);
  // A digest identifies a claim; it does not locate one. Detached, it names no
  // record a reviewer can open, in any letter case.
  if (/^sha256:/i.test(ref)) throw new Error(`${ref} is a detached digest, not a record`);

  const { path: relativePath, fragment } = splitRef(ref);
  if (!fragment) throw new Error(`${ref} needs an exact record or heading fragment`);

  const absoluteRoot = resolve(repoRoot);
  const realRoot = realpathSync(absoluteRoot);
  const absolutePath = resolve(absoluteRoot, relativePath);
  const pathFromRoot = relative(absoluteRoot, absolutePath);
  if (!pathFromRoot || pathFromRoot === ".." || pathFromRoot.startsWith(`..${sep}`) || isAbsolute(pathFromRoot)) {
    throw new Error(`${ref} escapes the repository root`);
  }
  if (!existsSync(absolutePath)) throw new Error(`${caseId} missing ${relativePath}`);
  // Lexical containment is not enough: a symlink inside the root can point
  // outside it. Compare canonical real paths so only targets that truly live
  // under the root (or in a symlinked root itself) resolve.
  const realPath = realpathSync(absolutePath);
  if (realPath !== realRoot && !realPath.startsWith(realRoot + sep)) {
    throw new Error(`${ref} escapes the repository root`);
  }
  const text = readFileSync(realPath, "utf8");
  if (text.length === 0) throw new Error(`${ref} is empty`);

  if (relativePath.endsWith(".json")) {
    return resolveJsonRef(JSON.parse(text), ref, fragment, caseId);
  }

  const section = resolveHeadingSection(withoutFencedBlocks(text), fragment);
  if (section === undefined) throw new Error(`${ref} names no exact heading ${fragment}`);
  const row = findCaseRow(section, caseId);
  if (!row) throw new Error(`${ref} section holds no exact ${caseId} row in a Case column`);
  assertRowBinding(ref, caseId, row, expect);
  return { kind: "row", heading: fragment };
}
