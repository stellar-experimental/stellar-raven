/**
 * Server-instructions budget guard. Claude Code truncates
 * injected MCP server instructions at exactly 2,048 characters (measured in
 * production 2026-07-13: the pre-fix 2,160-char BASE cut off mid-sentence
 * inside the envelope contract and the micro-map below it never arrived).
 * BASE_SERVER_INSTRUCTIONS must therefore be a complete, self-sufficient
 * workflow/envelope contract inside that budget; everything after it
 * (micro-map) is bonus for full-injection clients only.
 */
import { describe, expect, it } from "vitest";
import {
  BASE_SERVER_INSTRUCTIONS,
  EXECUTE_DESCRIPTION,
  SEARCH_KINDS,
  SEARCH_DESCRIPTION,
  SERVER_INSTRUCTIONS,
  UPSTREAM_DOC_LINKS,
  rankedSearchOutputSchema,
  rankedSearchInputSchema,
  recoveryCandidateSchema,
  searchHitSchema
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
      "off-target, adjacent, or only semantic candidates",
      "lumenloop.search_content_semantic",
      "scout.searchResearch",
      "exact identity or canonical slug plus source and date"
    ]) {
      expect(survived, phrase).toContain(phrase);
    }
  });

  it("carries the bounded evidence-discipline clause", () => {
    for (const phrase of [
      "date volatile values with their as-of date",
      "Copy exact symbols, types, formulas, and identifiers from results",
      'Say "not found in these sources", not "does not exist"',
      "State visible source conflicts instead of choosing silently",
      "Broaden vocabulary or abstain after empty entity lookups"
    ]) {
      expect(BASE_SERVER_INSTRUCTIONS, phrase).toContain(phrase);
    }
    expect(BASE_SERVER_INSTRUCTIONS).toContain("otherwise say unverified or ask for context");
  });

  it("micro-map still rides after BASE for full-injection clients", () => {
    expect(SERVER_INSTRUCTIONS.startsWith(`${BASE_SERVER_INSTRUCTIONS}\n\n`)).toBe(true);
    expect(SERVER_INSTRUCTIONS.length).toBeGreaterThan(CLAUDE_CODE_INSTRUCTIONS_CAP);
  });

  it("binds each freeform tool to one official upstream doc URL per service", () => {
    const bindings = [
      "Lumenloop — API guide https://api.lumenloop.com/v1/docs",
      "Stellar Light/Scout (scout) — OpenAPI https://stellarlight.xyz/api/openapi.json",
      "Stellar Docs — https://developers.stellar.org/docs"
    ];
    for (const contract of [SEARCH_DESCRIPTION, EXECUTE_DESCRIPTION]) {
      for (const binding of bindings) {
        expect(contract).toContain(binding);
      }
    }
  });

  it("makes prior-art discovery a bounded design-stage preflight, not a universal build gate", () => {
    for (const contract of [SEARCH_DESCRIPTION, EXECUTE_DESCRIPTION]) {
      expect(contract).toMatch(/at most two .*discovery calls/i);
      expect(contract).toContain("one focused detail call");
      expect(contract).toContain("three returned candidates");
      expect(contract).toMatch(/scope, pitfalls, and build-vs-integrate/i);
      expect(contract).toMatch(/single-step how-tos and debugging/i);
      expect(contract).toMatch(/license\/audit\/deployment\/compatibility.*unknown unless source-backed/i);
    }
    expect(EXECUTE_DESCRIPTION).toContain("scout.searchRepos");
    expect(EXECUTE_DESCRIPTION).toContain("scout.searchProjects");
    expect(EXECUTE_DESCRIPTION).toMatch(/never API, security, maintenance, or production authority/i);
  });

  it("states one coherent cross-tier score and promotion contract", () => {
    const scoreDescription = searchHitSchema.shape.score.description ?? "";
    const tierDescription = searchHitSchema.shape.tier.description ?? "";
    for (const contract of [SEARCH_DESCRIPTION, scoreDescription, tierDescription]) {
      expect(contract).toContain(">=1.6x");
    }
    expect(SEARCH_DESCRIPTION).toContain("Hit order is authoritative");
    expect(SEARCH_DESCRIPTION).not.toMatch(/always ranked below every gated hit/i);
    expect(SEARCH_DESCRIPTION).not.toMatch(/only among same-tier/i);
  });

  it("advertises only searchable kinds while preserving exact section reads", () => {
    expect(SEARCH_KINDS).toEqual(["operation", "skill"]);
    expect(rankedSearchInputSchema.kind.description).toContain("not independent search hits");
    expect(SEARCH_DESCRIPTION).toContain("not independent ranked hits");
    expect(SEARCH_DESCRIPTION).toContain("availableSections");
    expect(SEARCH_DESCRIPTION).not.toMatch(/kind.*skill sections/i);
  });

  it("labels recovery as caller-reported rather than host-verified execution", () => {
    const from = recoveryCandidateSchema.shape.from.description ?? "";
    const recovery = rankedSearchOutputSchema.recovery.description ?? "";
    const reason = rankedSearchInputSchema.reason.description ?? "";
    for (const contract of [from, recovery, reason]) {
      expect(contract).toMatch(/caller(?:-reported| reports)/i);
      expect(contract).not.toMatch(/evidence of a prior|verified attempt/i);
    }
    expect(rankedSearchInputSchema.recoverFrom.description).toContain("not an execution ledger");
    expect(recovery).toContain("does not verify an execution ledger");
  });
});

/**
 * Tool-description prefix budget. Claude Code clips a tool description at the
 * same 2,048 characters it clips injected server instructions, so the prefix —
 * not the whole string — is what the model reads while it decides how to call
 * the tool. Whatever sits early spends that budget.
 *
 * The upstream documentation URLs — one official link per source family — are
 * trailing reference metadata and provide no runtime guidance. They therefore
 * belong after the behavior contract rather than inside the clipped prefix.
 *
 * These tests hold both invariants. Each clipped prefix must still carry the
 * rules the model acts on — search's plan-then-compose workflow, including the
 * open-world half of its breadth rule, and execute's envelope contract and
 * `## Rules` opener. The URLs must ship in the full description and must not
 * appear in the prefix.
 */
describe("tool descriptions — Claude Code 2KB clipped prefix", () => {
  const clipped = (description: string) => description.slice(0, CLAUDE_CODE_INSTRUCTIONS_CAP);

  it("search's clipped prefix still carries the plan-then-compose workflow", () => {
    const survived = clipped(SEARCH_DESCRIPTION);
    for (const phrase of [
      "## Workflow",
      "Plan which source families could ground the answer before searching",
      "`search` once per candidate family",
      "Write ONE `execute` script that composes SEVERAL relevant operations",
      "Match breadth to the claim",
      // The breadth rule is only actionable with its open-world half attached.
      "needs a broad content/research family in the same script."
    ]) {
      expect(survived, phrase).toContain(phrase);
    }
  });

  it("execute's clipped prefix still carries the envelope contract and the globals rule", () => {
    const survived = clipped(EXECUTE_DESCRIPTION);
    for (const phrase of [
      "Service-call payloads live under `.data`",
      "## Rules",
      "The ONLY globals are `lumenloop`, `scout`, `stellarDocs`, `codemode`, and standard JavaScript."
    ]) {
      expect(survived, phrase).toContain(phrase);
    }
  });

  it("ships the upstream doc URLs in full without spending the clipped budget", () => {
    for (const contract of [SEARCH_DESCRIPTION, EXECUTE_DESCRIPTION]) {
      expect(contract).toContain(UPSTREAM_DOC_LINKS);
      expect(clipped(contract)).not.toContain("Upstream documentation:");
    }
  });
});
