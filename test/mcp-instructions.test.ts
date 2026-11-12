/**
 * Model-facing text budget and contract. Claude Code keeps exactly 2,048
 * characters of injected MCP server instructions and of each tool description
 * (measured in production 2026-07-13: a 2,160-char BASE cut off mid-sentence
 * inside the envelope contract). Each field must therefore be one complete
 * contract inside that budget. The micro-map after BASE is the only text a
 * clipping client is allowed to miss.
 *
 * These tests hold what each contract must say and where it may say it. They
 * do not pin wording beyond the rules a model acts on.
 */
import { describe, expect, it } from "vitest";
import { assertNoNonExposedRefsInText } from "../scripts/emitted-text-guard.mjs";
import { getCatalog } from "../src/catalog/load";
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

const CLAUDE_CODE_INSTRUCTIONS_CAP = 2048;
// Headroom so ordinary wording edits don't silently creep back over the cap.
const BUDGET = 2000;

describe("server instructions — Claude Code 2KB budget", () => {
  it(`keeps BASE within ${BUDGET} chars (hard client cap ${CLAUDE_CODE_INSTRUCTIONS_CAP})`, () => {
    expect(BASE_SERVER_INSTRUCTIONS.length).toBeLessThanOrEqual(BUDGET);
  });

  it("what survives truncation IS the whole contract — BASE ends on a sentence boundary", () => {
    // Budget + prefix invariants above/below make containment automatic; the
    // check that isn't automatic is that BASE reads complete where the client
    // cuts — it must end mid-nothing, not mid-sentence.
    expect(BASE_SERVER_INSTRUCTIONS.endsWith(".")).toBe(true);
  });

  it("the surviving prefix carries every load-bearing rule", () => {
    const survived = SERVER_INSTRUCTIONS.slice(0, CLAUDE_CODE_INSTRUCTIONS_CAP);
    for (const phrase of [
      "ok: true, data", // envelope shape
      "soft-empty", // two-way error.kind + inconclusive semantics
      "NOT evidence of absence",
      "codemode.describe(", // detail-on-demand step
      "codemode.skill.read(id, { sections })", // skills read path
      "codemode.skill.run(", // runnable dispatch
      "codemode.artifact.info(id)", // truncation recovery
      "exact-match — never guess", // id discipline
      "open-world identity, history, or topic",
      "ok: true, data, asOf, asOfBasis, caveat?", // host-derived ok signals
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
    // .agents/rounds/2026-10-10-weekend/answer-style/design.md names each replacement.
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

  it("micro-map still rides after BASE for full-injection clients", () => {
    expect(SERVER_INSTRUCTIONS.startsWith(`${BASE_SERVER_INSTRUCTIONS}\n\n`)).toBe(true);
    expect(SERVER_INSTRUCTIONS.length).toBeGreaterThan(CLAUDE_CODE_INSTRUCTIONS_CAP);
  });

  it("binds each freeform tool to one official upstream doc URL per service", () => {
    const urls = [
      "https://api.lumenloop.com/v1/docs",
      "https://stellarlight.xyz/api/openapi.json",
      "https://developers.stellar.org/docs"
    ];
    for (const url of urls) expect(UPSTREAM_DOC_LINKS).toContain(url);
    for (const contract of [SEARCH_DESCRIPTION, EXECUTE_DESCRIPTION]) {
      // Reference metadata rides last, behind the contract the model acts on.
      expect(contract.endsWith(UPSTREAM_DOC_LINKS)).toBe(true);
    }
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

describe("tool descriptions — one contract inside the 2,048-character cap", () => {
  it("fits each whole description inside the cap, so nothing is clipped", () => {
    expect(SEARCH_DESCRIPTION.length).toBeLessThanOrEqual(CLAUDE_CODE_INSTRUCTIONS_CAP);
    expect(EXECUTE_DESCRIPTION.length).toBeLessThanOrEqual(CLAUDE_CODE_INSTRUCTIONS_CAP);
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
      "Ids are exact-match",
      "capped near 6k tokens",
      "{ ok: true, data, asOf, asOfBasis, caveat? }",
      "{ ok: false, error: { kind, message, hint? } }",
      "Check `r.ok` first",
      '"unverified-match" marks semantic candidates, not confirmed identity',
      "call the detail operation before answering specifics",
      "codemode.describe(id)",
      "codemode.search(query)",
      // src/skills/store.ts returns an array; 8.3% of section reads treated it as a map.
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
    // src/executor/script-hints.ts and the providers own these lessons.
    for (const mechanic of [/\bfetch\b/, /TypeScript/, /named functions/, /\brequire\b/, /SOURCE BASIS/]) {
      expect(EXECUTE_DESCRIPTION).not.toMatch(mechanic);
    }
  });

  it("names only exposed operations, and its worked example matches their schemas", () => {
    const catalog = getCatalog();
    const operations = new Map(
      catalog.entries.filter((entry) => entry.kind === "operation").map((entry) => [entry.id, entry])
    );
    for (const [label, text] of Object.entries({ SEARCH_DESCRIPTION, EXECUTE_DESCRIPTION, SERVER_INSTRUCTIONS })) {
      expect(() => assertNoNonExposedRefsInText(text, label)).not.toThrow();
      for (const [id] of text.matchAll(/\b(?:lumenloop|scout|stellarDocs)\.[A-Za-z_]\w*(?=\()/g)) {
        expect(operations.has(id), `${label} names ${id}`).toBe(true);
      }
    }
    // Each call in the example passes only declared input fields.
    for (const [, id, args] of EXECUTE_DESCRIPTION.matchAll(/\b((?:lumenloop|stellarDocs)\.\w+)\(\{([^}]*)\}\)/g)) {
      const declared = Object.keys((operations.get(id!)!.inputSchema as { properties: object }).properties);
      for (const [, field] of args!.matchAll(/(\w+):/g)) expect(declared, `${id} ${field}`).toContain(field);
    }
  });
});

describe("source authority across description surfaces", () => {
  it("leaves source authority to the micro-map's rules", () => {
    for (const text of [EXECUTE_DESCRIPTION, SEARCH_DESCRIPTION, SERVER_INSTRUCTIONS]) {
      expect(text).not.toContain("purely factual questions use docs first");
    }
    expect(EXECUTE_DESCRIPTION).not.toContain("Use Stellar Docs for protocol, standards, API, and implementation claims.");
    expect(SERVER_INSTRUCTIONS).toContain("start Scout/Lumenloop even when docs mention the topic");
  });

  it("gives no operation chains: search ranks operations, the map names families", () => {
    expect(SERVER_INSTRUCTIONS).not.toContain("Workflow Archetypes");
    expect(SERVER_INSTRUCTIONS).not.toMatch(/\w+\.\w+ -> \w+\.\w+/);
  });
});
