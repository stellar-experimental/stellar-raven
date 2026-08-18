/**
 * Focused tests for eval/qa/agent-result.mjs. The pure parser turns one
 * `claude -p --output-format stream-json` spawn into one structured outcome.
 *
 * The parser is the seam: run-qa.mjs's runAgent and these fixtures are its
 * only two adapters, so classification rules are pinned here against
 * sanitized real stream shapes rather than against a live provider.
 *
 * Fixtures are sanitized copies of observed shapes (test/fixtures/qa-agent-streams/):
 * the provider-safeguard stream reproduces q-n3-ssrf-metadata-endpoint from
 * the 2026-08-14 canonical round (two attempts, zero output tokens, empty
 * transcript, is_error with subtype "success").
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  parseAgentResult,
  AGENT_RESULT_SCHEMA,
  FAILURE_CLASSES,
  READ_EXECUTE_OUTCOMES,
  FINAL_PROJECTION_STATES
} from "../eval/qa/agent-result.mjs";

const stream = (name) =>
  readFileSync(fileURLToPath(new URL(`./fixtures/qa-agent-streams/${name}.jsonl`, import.meta.url)), "utf8");

describe("parseAgentResult — provider safeguard before any MCP call", () => {
  it("classifies the q-n3 stream as provider-safeguard, non-retryable, with an empty transcript", () => {
    const outcome = parseAgentResult(
      { stdout: stream("provider-safeguard"), stderr: "", status: 0, signal: null },
      { promptChars: 1226 }
    );

    expect(outcome.schema).toBe(AGENT_RESULT_SCHEMA);
    expect(outcome.failure).toMatchObject({
      class: "provider-safeguard",
      retryable: false,
      subtype: "success",
      exitStatus: 0,
      signal: null
    });
    // The provider spoke before the MCP server did: no tool calls, no output.
    expect(outcome.transcript).toEqual([]);
    expect(outcome.usage.final.output_tokens).toBe(0);
    expect(outcome.turns).toBe(1);
    expect(outcome.costUsd).toBeCloseTo(0.1194867);
    expect(outcome.promptChars).toBe(1226);
    // The safeguard text is a provider notice, never a candidate answer.
    expect(outcome.answer).toBe("");
  });

  it("never marks a safeguard retryable and keeps a bounded, non-actionable excerpt", () => {
    const outcome = parseAgentResult({ stdout: stream("provider-safeguard"), stderr: "", status: 0, signal: null });

    expect(FAILURE_CLASSES).toContain("provider-safeguard");
    expect(outcome.failure.retryable).toBe(false);
    expect(outcome.failure.messageExcerpt).toContain("safeguards flagged this message");
    expect(outcome.failure.messageExcerpt.length).toBeLessThanOrEqual(400);
    // No rewritten/bypassing request may be derived from the parser output.
    expect(Object.keys(outcome.failure)).not.toContain("retryRequest");
  });
});

describe("parseAgentResult — failure classes are exclusive and fixture-backed", () => {
  it("separates transport, agent turn-cap, protocol, spawn, and timeout from provider safeguards", () => {
    const transport = parseAgentResult(
      { stdout: stream("transport-connection-closed"), stderr: "", status: 0, signal: null }
    );
    expect(transport.failure).toMatchObject({ class: "transport", retryable: true });

    const maxTurns = parseAgentResult({ stdout: stream("agent-max-turns"), stderr: "", status: 0, signal: null });
    expect(maxTurns.failure).toMatchObject({ class: "agent", retryable: false, subtype: "error_max_turns" });

    const protocolOnly = parseAgentResult({
      stdout: '{"type":"system","subtype":"init","session_id":"x"}\n',
      stderr: "MCP server raven failed to connect",
      status: 1,
      signal: null
    });
    expect(protocolOnly.failure).toMatchObject({ class: "protocol", retryable: false, exitStatus: 1 });

    const spawned = parseAgentResult({
      stdout: "",
      stderr: "",
      status: null,
      signal: null,
      spawnError: { message: "spawn claude ENOENT", code: "ENOENT" }
    });
    expect(spawned.failure).toMatchObject({ class: "spawn", retryable: false });

    const timedOut = parseAgentResult({
      stdout: "",
      stderr: "",
      status: null,
      signal: "SIGTERM",
      spawnError: { message: "spawnSync claude ETIMEDOUT", code: "ETIMEDOUT" }
    });
    expect(timedOut.failure).toMatchObject({ class: "timeout", retryable: false, signal: "SIGTERM" });
  });

  it("classifies the observed Claude CLI 529 overload as retryable transport", () => {
    const outcome = parseAgentResult(
      { stdout: stream("transport-529-overloaded"), stderr: "", status: 1, signal: null }
    );

    expect(outcome.failure).toMatchObject({
      class: "transport",
      retryable: true,
      subtype: "success",
      exitStatus: 1,
      signal: null
    });
    expect(outcome.failure.messageExcerpt).toMatch(/^API Error: 529 Overloaded\./);
    expect(outcome.answer).toBe("");
    expect(outcome.transcript).toEqual([]);
  });

  it("treats a nonzero exit status as a failure even when the result message looks clean", () => {
    // The provider can emit a complete-looking result and STILL exit nonzero.
    // Returning failure:null there let the answer through to a paid judge.
    const outcome = parseAgentResult({
      stdout:
        '{"type":"result","subtype":"success","is_error":false,"result":"a complete-looking answer","num_turns":3,"total_cost_usd":0.4}\n',
      stderr: "",
      status: 1,
      signal: null
    });

    expect(outcome.failure).toMatchObject({
      class: "unclassified",
      retryable: false,
      exitStatus: 1,
      signal: null
    });
    expect(outcome.failure.reason).toContain("exited with status 1");
  });

  it("treats a terminating signal as a failure even when the result message looks clean", () => {
    const outcome = parseAgentResult({
      stdout:
        '{"type":"result","subtype":"success","is_error":false,"result":"a complete-looking answer","num_turns":3}\n',
      stderr: "",
      status: null,
      signal: "SIGKILL"
    });

    expect(outcome.failure).toMatchObject({ class: "unclassified", retryable: false, signal: "SIGKILL" });
    expect(outcome.failure.reason).toContain("SIGKILL");
  });

  it("keeps a clean exit with a clean result failure-free", () => {
    const outcome = parseAgentResult({
      stdout: '{"type":"result","subtype":"success","is_error":false,"result":"fine","num_turns":2}\n',
      stderr: "",
      status: 0,
      signal: null
    });
    expect(outcome.failure).toBeNull();
    expect(outcome.answer).toBe("fine");
  });

  it("lets a provider error keep its specific class even when the process also exited nonzero", () => {
    // A transport blip legitimately exits nonzero; the terminal-state check must
    // not overwrite the more specific (and retryable) provider classification.
    const outcome = parseAgentResult({
      stdout:
        '{"type":"result","subtype":"success","is_error":true,"result":"API Error: Connection closed mid-response.","num_turns":2}\n',
      stderr: "",
      status: 1,
      signal: null
    });
    expect(outcome.failure).toMatchObject({ class: "transport", retryable: true, exitStatus: 1 });
  });

  it("leaves an unknown provider error unclassified instead of guessing", () => {
    const outcome = parseAgentResult({
      stdout:
        '{"type":"result","subtype":"error_during_execution","is_error":true,"result":"Something entirely new happened","num_turns":2}\n',
      stderr: "",
      status: 0,
      signal: null
    });
    expect(outcome.failure).toMatchObject({ class: "unclassified", retryable: false });
  });

  it("does not classify unknown HTTP status errors as retryable transport failures", () => {
    for (const statusCode of [400, 401, 403, 500]) {
      const outcome = parseAgentResult({
        stdout: JSON.stringify({
          type: "result",
          subtype: "error_during_execution",
          is_error: true,
          result: `API Error: ${statusCode} provider rejected the request`,
          num_turns: 1
        }),
        stderr: "",
        status: 0,
        signal: null
      });
      expect(outcome.failure).toMatchObject({ class: "unclassified", retryable: false });
    }
  });

  it("does not claim a provider safeguard happened before MCP when a tool call exists", () => {
    const outcome = parseAgentResult({
      stdout: [
        JSON.stringify({
          type: "assistant",
          message: {
            content: [{ type: "tool_use", id: "t1", name: "mcp__raven__search", input: { query: "x" } }]
          }
        }),
        JSON.stringify({
          type: "result",
          subtype: "success",
          is_error: true,
          result: "Provider safeguards flagged this message. See real-time-cyber-safeguards-on-claude."
        })
      ].join("\n"),
      stderr: "",
      status: 0,
      signal: null
    });

    expect(outcome.failure).toMatchObject({ class: "provider-safeguard", retryable: false });
    expect(outcome.failure.reason).toBe("provider safeguard blocked the request after an MCP call");
  });

  it("fails on a malformed JSON stream line before a clean result", () => {
    const outcome = parseAgentResult({
      stdout: [
        '{"type":"assistant","message":',
        '{"type":"result","subtype":"success","is_error":false,"result":"looks clean","num_turns":1}'
      ].join("\n"),
      stderr: "",
      status: 0,
      signal: null
    });

    expect(outcome.failure).toMatchObject({ class: "protocol", retryable: false });
    expect(outcome.answer).toBe("");
  });

  it("returns no failure for a normal answered run", () => {
    const outcome = parseAgentResult({ stdout: stream("artifact-continuation"), stderr: "", status: 0, signal: null });
    expect(outcome.failure).toBeNull();
    expect(outcome.answer).toContain("RAVEN-TAIL-SENTINEL");
  });
});

describe("parseAgentResult — bounded diagnostic capture", () => {
  it("stores a redacted bounded stderr excerpt plus a sha256 of the whole stream", () => {
    const stderr = `boom\nAuthorization: Bearer sk-live-FAKE000111222333\n${"z".repeat(9000)}`;
    const outcome = parseAgentResult({ stdout: "", stderr, status: 1, signal: null });

    expect(outcome.stderr.chars).toBe(stderr.length);
    expect(outcome.stderr.sha256).toBe(createHash("sha256").update(stderr).digest("hex"));
    expect(outcome.stderr.excerpt.length).toBeLessThanOrEqual(2000);
    expect(outcome.stderr.excerpt).not.toContain("sk-live-FAKE000111222333");
    expect(outcome.stderr.excerpt).toContain("[REDACTED]");
  });

  it("captures per-turn numeric usage when the provider emits it", () => {
    const outcome = parseAgentResult({ stdout: stream("artifact-continuation"), stderr: "", status: 0, signal: null });

    expect(outcome.usage.perTurnAvailable).toBe(true);
    expect(outcome.usage.perTurn).toEqual([
      { turn: 1, inputTokens: 12, outputTokens: 340, cacheCreationInputTokens: 18000, cacheReadInputTokens: 0 },
      { turn: 2, inputTokens: 9, outputTokens: 210, cacheCreationInputTokens: 0, cacheReadInputTokens: 18000 },
      { turn: 3, inputTokens: 7, outputTokens: 180, cacheCreationInputTokens: 0, cacheReadInputTokens: 24000 }
    ]);
  });

  it("numbers per-turn usage by assistant-message ordinal, not by how many carried usage", () => {
    // Turn 2 emitted no usage block. Recording turn 3's counters as "turn 2"
    // would silently re-label which turn the tokens belong to.
    const outcome = parseAgentResult({ stdout: stream("usage-gap"), stderr: "", status: 0, signal: null });

    expect(outcome.usage.perTurnAvailable).toBe(true);
    expect(outcome.usage.perTurn.map((t) => t.turn)).toEqual([1, 3]);
    expect(outcome.usage.perTurn[1]).toEqual({
      turn: 3,
      inputTokens: 7,
      outputTokens: 180,
      cacheCreationInputTokens: 0,
      cacheReadInputTokens: 24000
    });
  });

  it("reports missing per-turn usage as unavailable rather than inferring it from characters", () => {
    const outcome = parseAgentResult({ stdout: stream("provider-safeguard"), stderr: "", status: 0, signal: null });
    expect(outcome.usage.perTurnAvailable).toBe(false);
    expect(outcome.usage.perTurn).toEqual([]);
  });
});

describe("parseAgentResult — artifact continuation outcomes", () => {
  /**
   * The first telemetry cut mixed three different things under names that read
   * like one: STATIC `codemode.artifact.*` occurrences in execute source, the
   * number of executes containing them, and per-read outcomes. Its buckets also
   * did not partition — the two historical `Cannot read properties of undefined`
   * rows (q-pc-sponsored-reserves, q-protocol-operation-types-list) landed in no
   * field at all. These tests pin the replacement shape and its arithmetic.
   */
  const totalOf = (readExecutes) =>
    READ_EXECUTE_OUTCOMES.reduce((sum, outcome) => sum + readExecutes[outcome], 0);

  /** One execute whose source is `code` and whose visible result body is `body`. */
  const oneExecute = (code, body, isError = false) =>
    [
      JSON.stringify({
        type: "assistant",
        message: {
          role: "assistant",
          content: [{ type: "tool_use", id: "t1", name: "mcp__raven__execute", input: { code } }]
        }
      }),
      JSON.stringify({
        type: "user",
        message: {
          role: "user",
          content: [{ type: "tool_result", tool_use_id: "t1", is_error: isError, content: [{ type: "text", text: body }] }]
        }
      }),
      JSON.stringify({ type: "result", subtype: "success", is_error: false, result: "Done.", num_turns: 1 })
    ].join("\n");

  const READ = "const r = await codemode.artifact.read('11111111-2222-4333-8444-555555555555');";
  const INDETERMINATE = { total: 1, successful: 0, denied: 0, indeterminate: 1 };

  it("separates observed call sites, read-containing executes, and the projection outcome", () => {
    const outcome = parseAgentResult({ stdout: stream("artifact-continuation"), stderr: "", status: 0, signal: null });

    expect(outcome.artifacts).toEqual({
      handlesObserved: 1,
      // STATIC TEXTUAL occurrences — not a runtime call count, and no bound in
      // either direction (a loop undercounts, a string or comment overcounts).
      callSites: { info: 1, read: 1 },
      readExecutes: { total: 1, bounded: 1, truncated: 0, guardFailed: 0, hostDenied: 0, otherFailed: 0 },
      // The execute is a clean bounded projection — the BUCKET records that. The
      // read OUTCOME is still indeterminate: this script guarded on `r.ok` and
      // projected `r.data.tailNote`, but it returned a small answer instead of
      // the envelope, so no `ok:true` was ever visible. Source text is not
      // evidence, so a correctly written continuation
      // reads as unproven here. That is the fail-closed direction and it is the
      // superseded expectation from the earlier `successful: 1` contract.
      readOutcomes: { total: 1, successful: 0, denied: 0, indeterminate: 1 },
      hostDenialReasons: {},
      finalProjection: "bounded",
      readBytes: null
    });
    expect(totalOf(outcome.artifacts.readExecutes)).toBe(outcome.artifacts.readExecutes.total);
  });

  it("classifies a fail-loud guard failure as guardFailed, not as a denied or bounded read", () => {
    const outcome = parseAgentResult({ stdout: stream("artifact-wrong-envelope"), stderr: "", status: 0, signal: null });

    expect(outcome.artifacts.readExecutes).toEqual({
      total: 1,
      bounded: 0,
      truncated: 0,
      guardFailed: 1,
      hostDenied: 0,
      otherFailed: 0
    });
    expect(outcome.artifacts.hostDenialReasons).toEqual({});
    expect(outcome.artifacts.finalProjection).toBe("guard-failed");
    expect(totalOf(outcome.artifacts.readExecutes)).toBe(1);
  });

  it("classifies a closed host denial by its host reason and nothing else", () => {
    const outcome = parseAgentResult({ stdout: stream("artifact-not-found"), stderr: "", status: 0, signal: null });

    expect(outcome.artifacts.readExecutes).toEqual({
      total: 1,
      bounded: 0,
      truncated: 0,
      guardFailed: 0,
      hostDenied: 1,
      otherFailed: 0
    });
    expect(outcome.artifacts.hostDenialReasons).toEqual({ "not-found": 1 });
    expect(outcome.artifacts.finalProjection).toBe("host-denied");
    expect(totalOf(outcome.artifacts.readExecutes)).toBe(1);
  });

  it("keeps a post-read TypeError separate without claiming the read returned ok", () => {
    const outcome = parseAgentResult({ stdout: stream("artifact-typeerror"), stderr: "", status: 0, signal: null });

    expect(outcome.artifacts.readExecutes).toEqual({
      total: 1,
      bounded: 0,
      truncated: 0,
      guardFailed: 0,
      hostDenied: 0,
      otherFailed: 1
    });
    expect(outcome.artifacts.hostDenialReasons).toEqual({});
    expect(outcome.artifacts.finalProjection).toBe("other-failed");
    expect(outcome.artifacts.readOutcomes).toEqual({
      total: 1,
      successful: 0,
      denied: 0,
      indeterminate: 1
    });
    expect(totalOf(outcome.artifacts.readExecutes)).toBe(1);
  });

  it("does not call an observed ok:false artifact read successful", () => {
    const stdout = [
      JSON.stringify({
        type: "assistant",
        message: {
          role: "assistant",
          content: [{
            type: "tool_use",
            id: "t1",
            name: "mcp__raven__execute",
            input: {
              code: "async () => { const r = await codemode.artifact.read('11111111-2222-4333-8444-555555555555'); return { ok: r.ok }; }"
            }
          }]
        }
      }),
      JSON.stringify({
        type: "user",
        message: {
          role: "user",
          content: [{
            type: "tool_result",
            tool_use_id: "t1",
            is_error: false,
            content: [{ type: "text", text: '{"ok":false}' }]
          }]
        }
      }),
      JSON.stringify({ type: "result", subtype: "success", is_error: false, result: "No artifact.", num_turns: 1 })
    ].join("\n");

    const outcome = parseAgentResult({ stdout, stderr: "", status: 0, signal: null });
    expect(outcome.artifacts.readOutcomes).toEqual({
      total: 1,
      successful: 0,
      denied: 1,
      indeterminate: 0
    });
    expect(outcome.artifacts.hostDenialReasons).toEqual({ unknown: 1 });
  });

  it("does not treat unrelated data projection as successful read evidence", () => {
    const stdout = [
      JSON.stringify({
        type: "assistant",
        message: {
          role: "assistant",
          content: [{
            type: "tool_use",
            id: "t1",
            name: "mcp__raven__execute",
            input: {
              code: "async () => { const r = await codemode.artifact.read('11111111-2222-4333-8444-555555555555'); return { value: unrelated.data }; }"
            }
          }]
        }
      }),
      JSON.stringify({
        type: "user",
        message: {
          role: "user",
          content: [{
            type: "tool_result",
            tool_use_id: "t1",
            is_error: false,
            content: [{ type: "text", text: '{"value":1}' }]
          }]
        }
      }),
      JSON.stringify({ type: "result", subtype: "success", is_error: false, result: "Done.", num_turns: 1 })
    ].join("\n");

    const outcome = parseAgentResult({ stdout, stderr: "", status: 0, signal: null });
    expect(outcome.artifacts.readOutcomes).toEqual({
      total: 1,
      successful: 0,
      denied: 0,
      indeterminate: 1
    });
  });

  it("does not call a truncated read execute successful on a data reference alone", () => {
    // Sanitized from q-agent-identity-erc8004-stellar, transcript entry 6 of
    // eval/qa/results/2026-07-11T15-36-44-variantA.json (artifact ids, hashes
    // and bodies replaced; the `info.data ?? info` shape is the observed one).
    // The script never branches on `info.ok`, the execute's own result truncated
    // again, and the visible body carries no `ok:true` envelope. Nothing here
    // proves the read returned data, so the outcome must stay indeterminate — a
    // `.data` reference is source text, not read evidence.
    const outcome = parseAgentResult({ stdout: stream("artifact-unproven-read"), stderr: "", status: 0, signal: null });

    expect(outcome.artifacts.readExecutes).toEqual({
      total: 1,
      bounded: 0,
      truncated: 1,
      guardFailed: 0,
      hostDenied: 0,
      otherFailed: 0
    });
    expect(outcome.artifacts.readOutcomes).toEqual({
      total: 1,
      successful: 0,
      denied: 0,
      indeterminate: 1
    });
    expect(outcome.artifacts.finalProjection).toBe("truncated");
    expect(outcome.artifacts.handlesObserved).toBe(2);
  });

  it("does not call a bounded read execute successful on a data reference alone", () => {
    // Same fail-closed rule in the completed-execute case: the projection ran to
    // a bounded result, but `r.data ?? fallback` tolerates a failed read, no
    // `r.ok` was consulted, and the visible body shows no envelope. Bounded is
    // the only success BUCKET; it is still not success EVIDENCE by itself.
    const stdout = [
      JSON.stringify({
        type: "assistant",
        message: {
          role: "assistant",
          content: [{
            type: "tool_use",
            id: "t1",
            name: "mcp__raven__execute",
            input: {
              code: "async () => { const r = await codemode.artifact.read('11111111-2222-4333-8444-555555555555'); return { rows: (r.data ?? {}).rows ?? [] }; }"
            }
          }]
        }
      }),
      JSON.stringify({
        type: "user",
        message: {
          role: "user",
          content: [{
            type: "tool_result",
            tool_use_id: "t1",
            is_error: false,
            content: [{ type: "text", text: '{"rows":[]}' }]
          }]
        }
      }),
      JSON.stringify({ type: "result", subtype: "success", is_error: false, result: "Done.", num_turns: 1 })
    ].join("\n");

    const outcome = parseAgentResult({ stdout, stderr: "", status: 0, signal: null });
    expect(outcome.artifacts.readExecutes.bounded).toBe(1);
    expect(outcome.artifacts.readOutcomes).toEqual({
      total: 1,
      successful: 0,
      denied: 0,
      indeterminate: 1
    });
  });

  it("does not accept a bare r.ok consult as a fail-fast guard", () => {
    // Consulting `r.ok` is not branching on it. Both scripts below read the
    // status and then use `r.data ?? fallback` anyway, so execution proves
    // nothing: a denied read produces the same bounded body. Only a guard that
    // LEAVES on failure (`if (!r.ok) return …`) makes the later `r.data` use
    // evidence that the read returned data.
    const bodies = [
      // consulted by logging only
      "async () => { const r = await codemode.artifact.read('11111111-2222-4333-8444-555555555555'); console.log('read ok?', r.ok); return { rows: (r.data ?? {}).rows ?? [] }; }",
      // consulted by returning it under a non-envelope key, still no guard
      "async () => { const r = await codemode.artifact.read('11111111-2222-4333-8444-555555555555'); return { readOk: r.ok, rows: (r.data ?? {}).rows ?? [] }; }"
    ];

    for (const code of bodies) {
      const stdout = [
        JSON.stringify({
          type: "assistant",
          message: {
            role: "assistant",
            content: [{ type: "tool_use", id: "t1", name: "mcp__raven__execute", input: { code } }]
          }
        }),
        JSON.stringify({
          type: "user",
          message: {
            role: "user",
            content: [{
              type: "tool_result",
              tool_use_id: "t1",
              is_error: false,
              content: [{ type: "text", text: '{"rows":[]}' }]
            }]
          }
        }),
        JSON.stringify({ type: "result", subtype: "success", is_error: false, result: "Done.", num_turns: 1 })
      ].join("\n");

      const outcome = parseAgentResult({ stdout, stderr: "", status: 0, signal: null });
      expect(outcome.artifacts.readExecutes.bounded).toBe(1);
      expect(outcome.artifacts.readOutcomes).toEqual({
        total: 1,
        successful: 0,
        denied: 0,
        indeterminate: 1
      });
    }
  });

  it("does not accept a fail-fast guard that exists only inside a comment", () => {
    // Text is not code. A commented-out guard and a commented-out `.data` use
    // never ran, so the execute proves nothing about the read — the parser must
    // read the source as source, not as a string to grep.
    const code = 'async () => { const r = await codemode.artifact.read("11111111-2222-4333-8444-555555555555"); /* if (!r.ok) return {}; r.data */ return {rows: []}; }';
    const stdout = [
      JSON.stringify({
        type: "assistant",
        message: {
          role: "assistant",
          content: [{ type: "tool_use", id: "t1", name: "mcp__raven__execute", input: { code } }]
        }
      }),
      JSON.stringify({
        type: "user",
        message: {
          role: "user",
          content: [{
            type: "tool_result",
            tool_use_id: "t1",
            is_error: false,
            content: [{ type: "text", text: '{"rows":[]}' }]
          }]
        }
      }),
      JSON.stringify({ type: "result", subtype: "success", is_error: false, result: "Done.", num_turns: 1 })
    ].join("\n");

    const outcome = parseAgentResult({ stdout, stderr: "", status: 0, signal: null });
    expect(outcome.artifacts.readExecutes.bounded).toBe(1);
    expect(outcome.artifacts.readOutcomes).toEqual({
      total: 1,
      successful: 0,
      denied: 0,
      indeterminate: 1
    });
  });

  /**
   * Reproductions A, B and C. Each one
   * writes a real fail-fast guard and then puts `.data` somewhere that proves
   * nothing: on the FAILURE return, inside a string, inside a comment. Source
   * text cannot carry read evidence at all, which is why the static-source
   * inference was removed rather than made cleverer.
   */
  it("reproduction A: .data on the failure return is not success evidence", () => {
    const outcome = parseAgentResult({
      stdout: oneExecute(`async () => { ${READ} if (!r.ok) return { via: r.data }; return { tail: 'ok' }; }`, '{"via":null}'),
      stderr: "",
      status: 0,
      signal: null
    });
    expect(outcome.artifacts.readExecutes.bounded).toBe(1);
    expect(outcome.artifacts.readOutcomes).toEqual(INDETERMINATE);
  });

  it("reproduction B: .data inside a string after a real guard is not success evidence", () => {
    const outcome = parseAgentResult({
      stdout: oneExecute(
        `async () => { ${READ} if (!r.ok) return { ok: false }; const s = "r.data"; return { unrelated: [1] }; }`,
        '{"unrelated":[1]}'
      ),
      stderr: "",
      status: 0,
      signal: null
    });
    expect(outcome.artifacts.readExecutes.bounded).toBe(1);
    expect(outcome.artifacts.readOutcomes).toEqual(INDETERMINATE);
  });

  it("reproduction C: .data inside a comment after a real guard is not success evidence", () => {
    const outcome = parseAgentResult({
      stdout: oneExecute(
        `async () => { ${READ} if (!r.ok) return { ok: false }; /* r.data */ return { unrelated: [1] }; }`,
        '{"unrelated":[1]}'
      ),
      stderr: "",
      status: 0,
      signal: null
    });
    expect(outcome.artifacts.readExecutes.bounded).toBe(1);
    expect(outcome.artifacts.readOutcomes).toEqual(INDETERMINATE);
  });

  it("counts a successful read only from a visible ok:true envelope", () => {
    // The ONE positive proof. The source here consults nothing — it returns the
    // envelope — so the count comes purely from what the model could see.
    const outcome = parseAgentResult({
      stdout: oneExecute(`async () => { ${READ} return r; }`, '{"ok":true,"data":{"rows":[]}}'),
      stderr: "",
      status: 0,
      signal: null
    });
    expect(outcome.artifacts.readOutcomes).toEqual({ total: 1, successful: 1, denied: 0, indeterminate: 0 });
  });

  it("does not count a visible ok:true envelope from a FAILED execute", () => {
    // The execute errored, so whatever body it left behind is the wreckage of a
    // run that did not complete. An `ok:true` envelope inside it is not a
    // projection the answer could use. The bucket says otherFailed; the read
    // outcome must agree rather than claim a success the run never delivered.
    const outcome = parseAgentResult({
      stdout: oneExecute(`async () => { ${READ} return r; }`, '{"ok":true,"data":{}}', true),
      stderr: "",
      status: 0,
      signal: null
    });
    expect(outcome.artifacts.readExecutes.otherFailed).toBe(1);
    expect(outcome.artifacts.readOutcomes).toEqual(INDETERMINATE);
  });

  it("keeps the read-execute buckets a partition across every fixture", () => {
    for (const name of [
      "artifact-continuation",
      "artifact-wrong-envelope",
      "artifact-not-found",
      "artifact-typeerror",
      "artifact-unproven-read",
      "provider-safeguard",
      "usage-gap",
      "nonexecute-artifact-mention"
    ]) {
      const { artifacts } = parseAgentResult({ stdout: stream(name), stderr: "", status: 0, signal: null });
      expect(totalOf(artifacts.readExecutes)).toBe(artifacts.readExecutes.total);
      const denied = Object.values(artifacts.hostDenialReasons).reduce((s, n) => s + n, 0);
      expect(denied).toBe(artifacts.readExecutes.hostDenied);
      expect(FINAL_PROJECTION_STATES).toContain(artifacts.finalProjection);
    }
  });

  it("ignores artifact API text in a NON-execute tool input", () => {
    // Only execute source can contain runnable artifact calls. A search query
    // that quotes `codemode.artifact.read(...)` is prose, not work. Here the
    // mention comes AFTER the real (failed) read, so a leak would also
    // overwrite finalProjection with a phantom success.
    // keepWholeResult mirrors run-qa's per-operation surface, where NON-execute
    // tool results are stored too — so the non-execute result below is really
    // present and really scanned.
    const outcome = parseAgentResult(
      { stdout: stream("nonexecute-artifact-mention"), stderr: "", status: 0, signal: null },
      { keepWholeResult: () => true }
    );

    expect(outcome.artifacts.callSites).toEqual({ info: 0, read: 1 });
    expect(outcome.artifacts.readExecutes).toEqual({
      total: 1,
      bounded: 0,
      truncated: 0,
      guardFailed: 1,
      hostDenied: 0,
      otherFailed: 0
    });
    expect(outcome.artifacts.finalProjection).toBe("guard-failed");
    // ONE handle: the execute's own. The search result quotes a second, different
    // id — a handle named by a search hit was never issued to this run.
    expect(outcome.artifacts.handlesObserved).toBe(1);
    // The non-execute call still belongs in the transcript.
    expect(outcome.transcript.map((entry) => entry.tool)).toEqual([
      "mcp__raven__execute",
      "mcp__raven__execute",
      "mcp__raven__search"
    ]);
  });

  it("records nothing at all when only a non-execute tool mentions the artifact API", () => {
    const stdout = [
      JSON.stringify({
        type: "assistant",
        message: {
          role: "assistant",
          content: [
            {
              type: "tool_use",
              id: "s1",
              name: "mcp__raven__search",
              input: { query: 'codemode.artifact.read("11111111-2222-4333-8444-555555555555")' }
            }
          ]
        }
      }),
      JSON.stringify({
        type: "user",
        message: {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: "s1",
              is_error: false,
              content: [
                {
                  type: "text",
                  text: "artifact: id=99999999-8888-4777-8666-555555555555 sha256=deadbeefcafe bytes=1234 expiresAt=2026-08-24T00:00:00.000Z"
                }
              ]
            }
          ]
        }
      }),
      JSON.stringify({ type: "result", subtype: "success", is_error: false, num_turns: 1, result: "no artifact was read" })
    ].join("\n");

    const outcome = parseAgentResult({ stdout, stderr: "", status: 0, signal: null }, { keepWholeResult: () => true });
    expect(outcome.artifacts.callSites).toEqual({ info: 0, read: 0 });
    expect(outcome.artifacts.readExecutes.total).toBe(0);
    expect(outcome.artifacts.finalProjection).toBe("none");
    // No execute ran, so no handle was issued to this run — even though a
    // stored non-execute result displays a well-formed handle marker.
    expect(outcome.artifacts.handlesObserved).toBe(0);
  });

  it("reports a zero artifact record and no projection for a run that never saw a handle", () => {
    const outcome = parseAgentResult({ stdout: stream("provider-safeguard"), stderr: "", status: 0, signal: null });

    expect(outcome.artifacts).toEqual({
      handlesObserved: 0,
      callSites: { info: 0, read: 0 },
      readExecutes: { total: 0, bounded: 0, truncated: 0, guardFailed: 0, hostDenied: 0, otherFailed: 0 },
      readOutcomes: { total: 0, successful: 0, denied: 0, indeterminate: 0 },
      hostDenialReasons: {},
      finalProjection: "none",
      readBytes: null
    });
  });
});
