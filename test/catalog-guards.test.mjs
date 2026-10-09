/**
 * Builder drift-guard tests for the runnable-skill attachment
 * (scripts/build-catalog.mjs attachRunnableSkills / assertNoNonExposedRefs,
 * src/skills/README.md): a registry key with no emitted
 * skill entry throws; a declared op that resolves to no emitted operation
 * throws; a planted non-exposed reference inside a runnable schema trips the
 * ADR-0003 leak guard. A `.test.mjs` file (the test/plan-grade.test.mjs
 * precedent) because the guards live in a plain-JS script the TS config
 * deliberately does not type (no allowJs) — build-catalog.mjs gates its
 * main() so importing the exports here never triggers a build.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  attachRunnableSkills,
  assertNoNonExposedRefs,
  assertBuildAuthorityIdsResolve,
  assertScoutExclusionsResolve
} from "../scripts/build-catalog.mjs";
import { RUNNERS } from "../src/skills/runners/index.ts";
import { rewriteScoutRefs, scoutRefRewrites } from "../scripts/description-notes.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIGEST = "skills.lumenloop.stellar-ecosystem-digest";

describe("Scout exposure data matches the source contract", () => {
  const inventory = JSON.parse(readFileSync(join(ROOT, "inventory", "stellar-light.json"), "utf8"));

  it("accepts the current contract and still rejects a removed excluded operation", () => {
    expect(() => assertScoutExclusionsResolve(inventory.openapi)).not.toThrow();
    const changed = structuredClone(inventory.openapi);
    delete changed.paths["/api/feedback"].post;
    expect(() => assertScoutExclusionsResolve(changed)).toThrow("no longer present");
  });

  it("requires an exposure decision when a skill-only collection enters OpenAPI", () => {
    const changed = structuredClone(inventory.openapi);
    changed.paths["/api/repos"] = { get: { operationId: "listRepos" } };
    expect(() => assertScoutExclusionsResolve(changed)).toThrow("Previously unlisted Scout paths");
  });

  it("rejects a renamed excluded operation even when its path stays the same", () => {
    const changed = structuredClone(inventory.openapi);
    changed.paths["/api/quality"].get.operationId = "renamedQualityReport";
    expect(() => assertScoutExclusionsResolve(changed)).toThrow("operation names changed");
  });

  it("requires an exposure decision when the reviewed submission operation enters this older inventory", () => {
    const changed = structuredClone(inventory.openapi);
    changed.paths["/api/hackathons/review"] = { get: { operationId: "reviewSubmission" } };
    expect(() => assertScoutExclusionsResolve(changed)).toThrow("Previously unlisted Scout paths");
  });
});

/**
 * The committed manifest's entries with the runnable attachment UNDONE —
 * the exact pre-attach shape attachRunnableSkills receives in the builder
 * (skill entries carry null schemas until the registry attaches them).
 */
function preAttachEntries() {
  return JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8")).entries.map(
    (entry) => {
      if (entry.runnable !== true) return entry;
      const { runnable: _runnable, ...rest } = entry;
      return { ...rest, inputSchema: null, outputSchema: null };
    }
  );
}

describe("attachRunnableSkills — fail-loud drift guards (design §5)", () => {
  it("re-attaches the committed state from the pre-attach shape (round trip)", () => {
    const attached = attachRunnableSkills(preAttachEntries(), RUNNERS);
    for (const [id, runner] of Object.entries(RUNNERS)) {
      const entry = attached.find((e) => e.id === id);
      expect(entry.runnable).toBe(true);
      expect(entry.inputSchema).toEqual(runner.inputSchema);
      expect(entry.outputSchema).toEqual(runner.outputSchema);
    }
    // Non-registry entries pass through untouched (same object identity).
    const untouched = preAttachEntries().filter((e) => !RUNNERS[e.id]);
    expect(attached.filter((e) => !RUNNERS[e.id]).length).toBe(untouched.length);
  });

  it("throws when a registry key has no emitted skill entry (renamed/retired skill)", () => {
    const withoutSkill = preAttachEntries().filter((e) => e.id !== DIGEST);
    expect(() => attachRunnableSkills(withoutSkill, RUNNERS)).toThrow(
      /matched no emitted skill entry/
    );
  });

  it("throws when a registry key resolves to a non-skill entry", () => {
    const registry = { "lumenloop.get_project": RUNNERS[DIGEST] };
    expect(() => attachRunnableSkills(preAttachEntries(), registry)).toThrow(
      /matched no emitted skill entry/
    );
  });

  it("throws when a declared op resolves to no emitted operation entry (upstream retirement)", () => {
    const withoutOp = preAttachEntries().filter((e) => e.id !== "lumenloop.search_content_semantic");
    expect(() => attachRunnableSkills(withoutOp, RUNNERS)).toThrow(
      /declares op "lumenloop\.search_content_semantic" which resolves to no emitted operation entry/
    );
  });
});

describe("assertNoNonExposedRefs — all emitted schema JSON follows ADR-0003", () => {
  const textFields = {
    description: (text) => text,
    keywords: (text) => [text],
    routingKeywords: (text) => [text],
    routingPhrases: (text) => [{ field: "purpose", tokens: [text] }],
    routingExclusions: (text) => [{ tokens: ["avoid", text] }],
    knownAliases: (text) => [text],
    knownAliasTriggers: (text) => [text],
    inputSchema: (text) => ({ type: "object", properties: { value: { description: text } } }),
    outputSchema: (text) => ({ type: "object", properties: { value: { description: text } } })
  };

  for (const [field, value] of Object.entries(textFields)) {
    it.each(["reviewSubmission", "getRwaAssets"])(`rejects bare %s in ${field}`, (name) => {
      const entry = preAttachEntries().find((entry) => entry.id === "scout.searchProjects");
      expect(() => assertNoNonExposedRefs([{ ...entry, [field]: value(`Use ${name} here.`) }]))
        .toThrow(/ADR-0003 leak/);
    });
  }

  it("rejects an excluded child path after the Scout rewrite", () => {
    const inventory = JSON.parse(readFileSync(join(ROOT, "inventory", "stellar-light.json"), "utf8"));
    const text = "See GET /api/hackathons/review before you apply.";
    const description = rewriteScoutRefs(text, scoutRefRewrites(inventory.openapi));
    expect(description).toBe(text);
    const entry = preAttachEntries().find((entry) => entry.id === "scout.getHackathons");
    expect(() => assertNoNonExposedRefs([{ ...entry, description }])).toThrow(/ADR-0003 leak/);
  });

  it.each(["inputSchema", "outputSchema"])("rejects a bare excluded name in runnable %s", (field) => {
    const entry = attachRunnableSkills(preAttachEntries(), RUNNERS).find((entry) => entry.id === DIGEST);
    expect(() => assertNoNonExposedRefs([{ ...entry, [field]: { description: "Use reviewSubmission." } }]))
      .toThrow(/ADR-0003 leak/);
  });

  it("passes on the real attached entries (the build's own steady state)", () => {
    expect(() => assertNoNonExposedRefs(attachRunnableSkills(preAttachEntries(), RUNNERS))).not.toThrow();
  });

  it("a planted non-exposed op reference inside a runnable inputSchema description trips the build", () => {
    const planted = attachRunnableSkills(preAttachEntries(), RUNNERS).map((entry) => {
      if (entry.id !== DIGEST) return entry;
      return {
        ...entry,
        inputSchema: {
          ...entry.inputSchema,
          description: "if ambiguous, fall back to scout.submitFeedback"
        }
      };
    });
    expect(() => assertNoNonExposedRefs(planted)).toThrow(/ADR-0003 leak/);
  });

  it("a planted excluded lumenloop tool name inside a runnable outputSchema description trips it too", () => {
    const planted = attachRunnableSkills(preAttachEntries(), RUNNERS).map((entry) => {
      if (entry.id !== DIGEST) return entry;
      return {
        ...entry,
        outputSchema: {
          ...entry.outputSchema,
          description: "escalate via request_research when coverage is thin"
        }
      };
    });
    expect(() => assertNoNonExposedRefs(planted)).toThrow(/ADR-0003 leak/);
  });

  it("a planted non-exposed op inside a non-runnable operation inputSchema trips the build", () => {
    const planted = preAttachEntries().map((entry) =>
      entry.id === "scout.searchProjects"
        ? {
            ...entry,
            inputSchema: {
              ...entry.inputSchema,
              description: "submit corrections with scout.submitFeedback"
            }
          }
        : entry
    );
    expect(() => assertNoNonExposedRefs(planted)).toThrow(/ADR-0003 leak/);
  });

  it("a planted excluded path inside a non-runnable operation outputSchema trips the build", () => {
    const planted = preAttachEntries().map((entry) =>
      entry.id === "scout.searchProjects"
        ? {
            ...entry,
            outputSchema: {
              ...entry.outputSchema,
              description: "aggregated from POST /api/feedback"
            }
          }
        : entry
    );
    expect(() => assertNoNonExposedRefs(planted)).toThrow(/ADR-0003 leak/);
  });

  it("scrubs excluded endpoint prose from the generated operation schemas", () => {
    const projects = preAttachEntries().find((entry) => entry.id === "scout.searchProjects");
    const schema = JSON.stringify(projects.outputSchema);
    expect(schema).not.toContain("POST /api/feedback");
    expect(schema).toContain("Aggregated nightly from upstream feedback vote kinds.");
  });
});

describe("assertBuildAuthorityIdsResolve — role ids are pinned to skills that churn upstream", () => {
  it("passes on the real catalog", () => {
    const entries = JSON.parse(
      readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8")
    ).entries;
    expect(() => assertBuildAuthorityIdsResolve(entries)).not.toThrow();
  });

  it("throws when an upstream rename orphans a role id, instead of dropping the role", () => {
    const entries = JSON.parse(
      readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8")
    ).entries.filter((e) => e.id !== "skills.stellar-dev.dapp");
    expect(() => assertBuildAuthorityIdsResolve(entries)).toThrow(
      /BUILD_AUTHORITY_SKILL_ROLES names skills that no longer exist: skills\.stellar-dev\.dapp/
    );
  });
});
