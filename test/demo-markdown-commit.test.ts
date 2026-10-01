import { describe, expect, it } from "vitest";
import { DEMO_SCRIPT_CORE } from "../src/demo/page";

const mdCommitIndex = new Function(`${DEMO_SCRIPT_CORE}; return mdCommitIndex;`)() as (
  text: string,
  from: number
) => number;

describe("playground streaming markdown commits", () => {
  it("commits only complete blocks outside fenced code", () => {
    expect(mdCommitIndex("first\n\nsecond", 0)).toBe(7);

    const fenced = "before\n\n```js\nconst x = 1;\n\nstill code\n```\n\nafter";
    expect(mdCommitIndex(fenced, 0)).toBe(fenced.indexOf("after"));
    expect(mdCommitIndex(fenced.slice(8), 0)).toBe(fenced.slice(8).indexOf("after"));
  });

  it("advances monotonically as chunks arrive without losing text", () => {
    const source = "one\n\n- two\n- three\n\n```\na\n\nb\n```\n\n| h |\n| - |\n| v |\n\nend";
    let committed = 0;
    for (let end = 1; end <= source.length; end += 3) {
      const visible = source.slice(0, Math.min(end, source.length));
      const next = mdCommitIndex(visible, committed);
      expect(next).toBeGreaterThanOrEqual(committed);
      if (next > committed) {
        const prefix = visible.slice(0, next);
        expect(prefix).toMatch(/\n[ \t]*\n$/);
        expect(prefix.split("\n").filter((line) => line.startsWith("```")).length % 2).toBe(0);
      }
      committed = next;
    }
  });
});
