/**
 * Host hints for script mistakes. The messages below are the sandbox's own
 * (workerd and @cloudflare/codemode 0.5.1, observed 2026-11-12); the smoke
 * lane holds that the assembled worker still produces them.
 */
import { describe, expect, it } from "vitest";
import { withScriptHint } from "../src/executor/script-hints";

const GLOBALS = ["lumenloop", "scout", "stellarDocs", "codemode"];

describe("withScriptHint", () => {
  it.each([
    ["horizon is not defined", "the only globals available in the sandbox are: lumenloop, scout, stellarDocs, codemode, and standard JavaScript"],
    ['Tool "notAnOp" not found', "operation ids are exact-match"],
    [
      "This worker is not permitted to access the internet via global functions like fetch(). It must use capabilities (such as bindings in 'env') to talk to the outside world.",
      "the sandbox has no network"
    ],
    ["Failed to start Worker:\nUncaught SyntaxError: Missing initializer in const declaration", "plain JavaScript"],
    ["object is not iterable (cannot read property Symbol(Symbol.iterator))", "`Promise.all` takes an array"]
  ])("says how to fix %j", (message, fix) => {
    const hinted = withScriptHint(message, GLOBALS);
    expect(hinted.startsWith(message)).toBe(true);
    expect(hinted).toContain(fix);
  });

  it("leaves a script's own error unchanged", () => {
    expect(withScriptHint("plain-boom", GLOBALS)).toBe("plain-boom");
  });
});
