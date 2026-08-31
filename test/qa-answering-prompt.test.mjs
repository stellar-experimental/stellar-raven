import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentPrompt } from "../eval/qa/run-qa.mjs";

const fixtures = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("./fixtures/qa-answering-prompt-boundaries.json", import.meta.url)),
    "utf8"
  )
);

const surfaces = [
  { surface: "search-execute", searchTool: "search" },
  { surface: "per-operation", searchTool: "search" }
];

describe("QA answering prompt Raven capability boundary", () => {
  beforeEach(() => {
    vi.stubEnv("QA_AGENT_PROMPT_APPEND", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  for (const options of surfaces) {
    it(`includes the positive fixtures on ${options.surface}`, () => {
      const prompt = agentPrompt("fixture question", options);
      for (const expected of fixtures.positive) {
        expect(prompt).toContain(expected);
      }
    });

    it(`excludes the negative fixtures on ${options.surface}`, () => {
      const prompt = agentPrompt("fixture question", options);
      for (const rejected of fixtures.negative) {
        expect(prompt).not.toContain(rejected);
      }
    });
  }

  it("keeps the capability boundary when a run appends more instructions", () => {
    vi.stubEnv("QA_AGENT_PROMPT_APPEND", "Use the appended fixture instruction.");
    for (const options of surfaces) {
      const prompt = agentPrompt("fixture question", options);
      expect(prompt).toContain("Use the appended fixture instruction.");
      for (const expected of fixtures.positive) {
        expect(prompt).toContain(expected);
      }
    }
  });
});
