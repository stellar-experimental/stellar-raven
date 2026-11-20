/** Model-facing text budgets and contract checks; client limits live in test/helpers/mcp-tool-metadata.ts. */
import { describe, expect, it } from "vitest";
import { assertGeneratedTextNoNonExposedRefs } from "../scripts/build-family-text.mjs";
import { getCatalog } from "../src/catalog/load";
import {
  CLAUDE_CODE_INSTRUCTIONS_CAP_CHARS,
  CLAUDE_CODE_TOOL_DESCRIPTION_CAP_CHARS,
  CODEX_CATALOGUE_LINE_CHARS,
  GROK_CUT_CHARS,
  OPENCODE_LISTING_CHARS
} from "./helpers/mcp-tool-metadata";
import { SEARCH_OPENING } from "../src/mcp/family-text";
import {
  BASE_SERVER_INSTRUCTIONS,
  EXECUTE_DESCRIPTION,
  SEARCH_KINDS,
  SEARCH_DESCRIPTION,
  SERVER_INSTRUCTIONS,
  UPSTREAM_DOC_LINKS,
  rankedSearchInputSchema,
  searchNextSteps
} from "../src/mcp/tools";

describe("server instructions — Claude Code character budget", () => {
  it(`keeps the whole instructions string within ${CLAUDE_CODE_INSTRUCTIONS_CAP_CHARS} chars, so no client on the current limit cuts the contract`, () => {
    expect(SERVER_INSTRUCTIONS.length).toBeLessThanOrEqual(CLAUDE_CODE_INSTRUCTIONS_CAP_CHARS);
  });

  it(`keeps BASE within ${GROK_CUT_CHARS} chars, the smallest measured cut (Grok CLI), so it arrives whole`, () => {
    expect(BASE_SERVER_INSTRUCTIONS.length).toBeLessThanOrEqual(GROK_CUT_CHARS);
    expect(SERVER_INSTRUCTIONS.length).toBeLessThanOrEqual(GROK_CUT_CHARS);
  });

  it("what survives truncation IS the whole contract — BASE ends on a sentence boundary", () => {
    expect(BASE_SERVER_INSTRUCTIONS.endsWith(".")).toBe(true);
  });

  it(`opens with one line of at most ${CODEX_CATALOGUE_LINE_CHARS} chars that ends in a full stop and stands alone`, () => {
    const firstLine = SERVER_INSTRUCTIONS.split("\n")[0]!;
    expect(firstLine.length).toBeLessThanOrEqual(CODEX_CATALOGUE_LINE_CHARS);
    expect(firstLine.endsWith(".")).toBe(true);
    expect(firstLine).toContain("`search`");
    expect(firstLine).toContain("`execute`");
  });

  it("the surviving prefix carries every load-bearing rule", () => {
    const survived = SERVER_INSTRUCTIONS.slice(0, CLAUDE_CODE_INSTRUCTIONS_CAP_CHARS);
    for (const phrase of [
      "ok: true, data",
      "soft-empty",
      "NOT evidence of absence",
      "codemode.describe(",
      "codemode.skill.read(id, { sections })",
      "codemode.skill.run(",
      "codemode.artifact.info(id)",
      "exact-match — never guess",
      "open-world identity, history, or topic",
      "ok: true, data, asOf, asOfBasis, caveat?",
      '`asOf` is an upstream-stated date, or the observation time when `asOfBasis` is "observed"',
      'An ok `caveat` is "no-rows" or "unverified-match"',
      "ok results with a `caveat`, or off-target or adjacent rows, ground nothing",
      "lumenloop.search_content_semantic",
      "scout.searchResearch",
      "exact identity or canonical slug plus source and date"
    ]) {
      expect(survived, phrase).toContain(phrase);
    }
  });

  it("carries the evidence-discipline rules that no result signal can replace", () => {
    for (const phrase of [
      "copy exact symbols, types, formulas, and identifiers from results",
      "State visible source conflicts instead of choosing silently",
      "Require exact identity or canonical slug plus source and date before attribution; otherwise say unverified or ask for context."
    ]) {
      expect(BASE_SERVER_INSTRUCTIONS, phrase).toContain(phrase);
    }
  });

  it("leaves answer phrasing to the asOf and caveat result signals", () => {
    for (const phrase of ["date volatile values", "not found in these sources", "abstain after empty entity lookups"]) {
      expect(BASE_SERVER_INSTRUCTIONS, phrase).not.toContain(phrase);
    }
  });

  it("keeps the ok caveat lexically apart from the soft-empty error kind", () => {
    // "inconclusive" describes only soft-empty; no caveat value reuses "empty".
    expect(BASE_SERVER_INSTRUCTIONS.match(/inconclusive/g)).toEqual(["inconclusive"]);
    expect(BASE_SERVER_INSTRUCTIONS).toContain('"soft-empty" (inconclusive, NOT evidence of absence)');
    expect(EXECUTE_DESCRIPTION.match(/inconclusive/g)).toEqual(["inconclusive"]);
    expect(EXECUTE_DESCRIPTION).toMatch(/"soft-empty" means [^.]*: inconclusive, not evidence of absence\./);
    expect(EXECUTE_DESCRIPTION).toMatch(/"no-rows" is ok data/);
  });

  it("the served instructions are BASE alone: no per-family source map follows it", () => {
    expect(SERVER_INSTRUCTIONS).toBe(BASE_SERVER_INSTRUCTIONS);
    expect(SERVER_INSTRUCTIONS).not.toContain("Source Micro-Map");
    expect(SERVER_INSTRUCTIONS).not.toContain("Authority Rules");
  });

  it("binds the surface to one official upstream doc URL per service, on `search`", () => {
    const urls = [
      "https://api.lumenloop.com/v1/docs",
      "https://stellarlight.xyz/api/openapi.json",
      "https://developers.stellar.org/docs"
    ];
    for (const url of urls) expect(UPSTREAM_DOC_LINKS).toContain(url);
    // Reference metadata rides last, behind the contract the model acts on.
    expect(SEARCH_DESCRIPTION.endsWith(UPSTREAM_DOC_LINKS)).toBe(true);
    // The execute description spends that room on scripting rules instead.
    expect(EXECUTE_DESCRIPTION).not.toContain("Upstream docs");
  });

  it("advertises only searchable kinds while preserving exact section reads", () => {
    expect(SEARCH_KINDS).toEqual(["operation", "skill"]);
    expect(rankedSearchInputSchema.kind.description).toContain("not independent search hits");
    expect(SEARCH_DESCRIPTION).toContain("availableSections");
    expect(SEARCH_DESCRIPTION).not.toMatch(/kind.*skill sections/i);
  });

  it("labels recovery as caller-reported rather than host-verified execution", () => {
    const reason = rankedSearchInputSchema.reason.description ?? "";
    const recoverFrom = rankedSearchInputSchema.recoverFrom.description ?? "";
    for (const contract of [reason, recoverFrom]) {
      expect(contract).toMatch(/caller(?:-reported| reports)/i);
      expect(contract).not.toMatch(/evidence of a prior|verified attempt/i);
    }
    expect(recoverFrom).toContain("not an execution ledger");
  });
});

describe("tool descriptions — one contract inside the character cap", () => {
  it(`fits each whole description inside ${CLAUDE_CODE_TOOL_DESCRIPTION_CAP_CHARS} chars, so nothing is clipped`, () => {
    expect(SEARCH_DESCRIPTION.length).toBeLessThanOrEqual(CLAUDE_CODE_TOOL_DESCRIPTION_CAP_CHARS);
    expect(EXECUTE_DESCRIPTION.length).toBeLessThanOrEqual(CLAUDE_CODE_TOOL_DESCRIPTION_CAP_CHARS);
  });

  it(`keeps each description within ${GROK_CUT_CHARS} chars, the smallest measured cut; growth past it needs a measured reason`, () => {
    expect(SEARCH_DESCRIPTION.length).toBeLessThanOrEqual(GROK_CUT_CHARS);
    expect(EXECUTE_DESCRIPTION.length).toBeLessThanOrEqual(GROK_CUT_CHARS);
  });

  it(`opens each description with a first line of whole sentences that ends inside ${OPENCODE_LISTING_CHARS} chars, where OpenCode lists them`, () => {
    for (const [name, text] of Object.entries({ search: SEARCH_DESCRIPTION, execute: EXECUTE_DESCRIPTION })) {
      const firstLine = text.split("\n")[0]!;
      expect(firstLine.length, name).toBeLessThanOrEqual(OPENCODE_LISTING_CHARS);
      expect(firstLine.endsWith("."), name).toBe(true);
      // The line break follows at once, so the cut falls after the sentence, not inside the next one.
      expect(text[firstLine.length + 1], name).toBe("\n");
    }
  });

  it("the search opening names every operation family of the catalog and says hits are not evidence", () => {
    const families = new Set(
      getCatalog().entries.filter((entry) => entry.kind === "operation").map((entry) => entry.service)
    );
    const firstLine = SEARCH_DESCRIPTION.split("\n")[0]!;
    for (const family of families) expect(firstLine, family).toContain(family);
    expect(firstLine).toContain("not evidence");
    expect(SEARCH_DESCRIPTION.startsWith(SEARCH_OPENING)).toBe(true);
  });

  it("search carries the plan-then-compose workflow and the card shape", () => {
    for (const phrase of [
      "## Workflow",
      "Plan which source families could ground the answer before searching",
      "`search` once per candidate family",
      "Write ONE `execute` script that composes SEVERAL relevant operations",
      "Match breadth to the claim",
      // The breadth rule is only actionable with its open-world half attached.
      "needs a broad content/research family in the same script.",
      // What a card holds, and where the rest is.
      "`signature`",
      "`outputKeys`",
      'codemode.describe("<exact id>")',
      "Hit order is the ranking",
      "Never guess ids"
    ]) {
      expect(SEARCH_DESCRIPTION, phrase).toContain(phrase);
    }
  });

  it("execute carries the envelope, the evidence signals, and the helpers", () => {
    for (const phrase of [
      "sandbox with no network",
      "The ONLY globals are `lumenloop`, `scout`, `stellarDocs`, `stellarOrg`, `codemode`, and standard JavaScript",
      "Artifact reads resolve to the same envelope shape",
      "are called inside this script, never as top-level tools",
      "Ids are exact-match",
      "capped near 6k tokens",
      "{ ok: true, data, asOf, asOfBasis, caveat? }",
      "{ ok: false, error: { kind, message, hint? } }",
      "Check `r.ok` first",
      '"unverified-match" marks semantic candidates, not confirmed identity',
      "call the detail operation before answering specifics",
      "codemode.describe(id)",
      "codemode.search(query)",
      // src/skills/store.ts returns an array, not a map.
      "`r.data.sections` is an ARRAY of { section, content, url }"
    ]) {
      expect(EXECUTE_DESCRIPTION, phrase).toContain(phrase);
    }
  });

  it("states the payload-access rule once across the whole surface", () => {
    const pages = [
      { hits: [{}], truncated: true, widerCandidates: [{ basis: "catalog-anchor" }] },
      { hits: [], truncated: false, widerCandidates: [{ basis: "short-query-directory" }] }
    ].map((page) => searchNextSteps(page as unknown as Parameters<typeof searchNextSteps>[0]));
    const surface = [SERVER_INSTRUCTIONS, SEARCH_DESCRIPTION, EXECUTE_DESCRIPTION, ...pages].join("\n");
    expect(surface.match(/never `r\.projects`/g)).toEqual(["never `r.projects`"]);
    expect(EXECUTE_DESCRIPTION).toContain("`r.data.projects`, never `r.projects`");
  });

  it("teaches mechanics through host errors, not prefix text", () => {
    // src/executor/script-hints.ts and the providers own these lessons. The globals
    // rule is the exception: it is stated up front, with `fetch` as its one example.
    for (const mechanic of [/TypeScript/, /named functions/, /\brequire\b/, /SOURCE BASIS/]) {
      expect(EXECUTE_DESCRIPTION).not.toMatch(mechanic);
    }
  });

  it("names only exposed operations, and its worked example matches their schemas", () => {
    const catalog = getCatalog();
    const operations = new Map(
      catalog.entries.filter((entry) => entry.kind === "operation").map((entry) => [entry.id, entry])
    );
    // The guard checks every `service.name` token, in prose or in a call, against the manifest.
    const buildPageHint = searchNextSteps(
      { hits: [{}], truncated: true, widerCandidates: [] } as unknown as Parameters<typeof searchNextSteps>[0],
      { buildPlaybookHit: true }
    );
    expect(buildPageHint).toContain("scout.searchRepos");
    for (const [label, text] of Object.entries({
      SEARCH_DESCRIPTION,
      EXECUTE_DESCRIPTION,
      SERVER_INSTRUCTIONS,
      buildPageHint
    })) {
      expect(() => assertGeneratedTextNoNonExposedRefs(text, catalog.entries, label)).not.toThrow();
    }
    // It rejects an id that exists nowhere, written as prose and written as a call.
    for (const typo of ["Use `scout.searchReserch` for history.", "await scout.searchReserch({ query })"]) {
      expect(() => assertGeneratedTextNoNonExposedRefs(typo, catalog.entries, "fixture")).toThrow(/scout\.searchReserch/);
    }
    // Each call in the example passes only declared input fields.
    for (const [, id, args] of EXECUTE_DESCRIPTION.matchAll(/\b((?:lumenloop|stellarDocs)\.\w+)\(\{([^}]*)\}\)/g)) {
      const declared = Object.keys((operations.get(id!)!.inputSchema as { properties: object }).properties);
      for (const [, field] of args!.matchAll(/(\w+):/g)) expect(declared, `${id} ${field}`).toContain(field);
    }
  });
});

describe("source authority across description surfaces", () => {
  it("states no source-authority ranking on any description surface", () => {
    for (const text of [EXECUTE_DESCRIPTION, SEARCH_DESCRIPTION, SERVER_INSTRUCTIONS]) {
      expect(text).not.toContain("purely factual questions use docs first");
    }
    expect(EXECUTE_DESCRIPTION).not.toContain("Use Stellar Docs for protocol, standards, API, and implementation claims.");
    expect(SERVER_INSTRUCTIONS).not.toContain("start Scout/Lumenloop even when docs mention the topic");
  });

  it("gives no operation chains: search ranks operations, the family line names families", () => {
    expect(SERVER_INSTRUCTIONS).not.toContain("Workflow Archetypes");
    expect(SERVER_INSTRUCTIONS).not.toMatch(/\w+\.\w+ -> \w+\.\w+/);
  });
});
