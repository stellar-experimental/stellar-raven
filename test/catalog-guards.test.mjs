/**
 * Builder drift-guard tests for the runnable-skill attachment
 * (scripts/build-catalog.mjs attachRunnableSkills / assertNoNonExposedRefs,
 * design research/skill-run-design.md §5/§12): a registry key with no emitted
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
  assertBuildAuthorityIdsResolve
} from "../scripts/build-catalog.mjs";
import { RUNNERS } from "../src/skills/runners/index.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIGEST = "skills.lumenloop.stellar-ecosystem-digest";

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
