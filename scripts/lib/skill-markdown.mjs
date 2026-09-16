/**
 * skill-markdown.mjs — the markdown helpers the skill builders MUST agree on.
 *
 * `build-catalog.mjs` and `build-super-spec.mjs` both turn pinned SKILL.md
 * bytes into section ids and descriptions, and those ids have to line up
 * exactly: the section key the catalog emits is the key `skill.read` resolves
 * and the super-spec advertises. They used to hold byte-identical private
 * copies of these three functions, each carrying a "MUST match
 * scripts/build-catalog.mjs" comment — a rule enforced by hope, where any edit
 * had to be made twice or section keys would silently drift apart. One
 * definition enforces it by construction.
 *
 * `src/skills/store.ts` deliberately keeps its own slugify: it is Worker
 * runtime code, a different tier from these build scripts, and an invariant
 * test asserts the two agree rather than importing across that boundary.
 */

/** Collapse whitespace, strip markdown links/emphasis/backticks for descriptions. */
export function plainText(markdown) {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Heading -> section slug. Empty input yields "section" so an id always exists. */
export function slugify(text) {
  return (
    plainText(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

function unquote(value) {
  if (value.length < 2) return value;
  const first = value[0];
  return (first === '"' || first === "'") && value.at(-1) === first
    ? value.slice(1, -1)
    : value;
}

function foldScalar(lines) {
  const paragraphs = [];
  let words = [];
  for (const line of lines) {
    const text = line.trim();
    if (text === "") {
      if (words.length > 0) {
        paragraphs.push(words.join(" "));
        words = [];
      }
      continue;
    }
    words.push(text);
  }
  if (words.length > 0) paragraphs.push(words.join(" "));
  return paragraphs.join("\n");
}

/** Minimal frontmatter parser for flat values and folded (`>`) text blocks. */
export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { attrs: {}, body: content };
  const block = match[1];
  const body = content.slice(match[0].length);
  const attrs = {};
  let currentKey = null;
  let foldedLines = null;

  const finishFolded = () => {
    if (currentKey && foldedLines) attrs[currentKey] = foldScalar(foldedLines);
    foldedLines = null;
  };

  for (const line of block.split("\n")) {
    const keyMatch = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s?(.*)$/);
    if (keyMatch) {
      finishFolded();
      currentKey = keyMatch[1];
      const value = keyMatch[2].trim();
      if (/^>[+-]?$/.test(value)) {
        attrs[currentKey] = "";
        foldedLines = [];
      } else {
        attrs[currentKey] = unquote(value);
      }
    } else if (currentKey && line.trim() !== "") {
      if (foldedLines) foldedLines.push(line);
      else attrs[currentKey] = `${attrs[currentKey]} ${line.trim()}`.trim();
    } else if (foldedLines) {
      foldedLines.push("");
    }
  }
  finishFolded();
  return { attrs, body };
}
