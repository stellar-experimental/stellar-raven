import { mkdtemp, open, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
// @ts-expect-error local executable module intentionally exposes production seams.
import { QuarantineNoticeEmittedError, exitCodeForRunDisposition, formatQuarantineNotice, handleEntryDiagnostic, writeAtomicQuarantine } from "../scripts/run-playground-semantic-eval.mjs";

const directories: string[] = [];
afterEach(async () => { await Promise.all(directories.splice(0).map((directory) => import("node:fs/promises").then(({ rm }) => rm(directory, { recursive: true, force: true })))); });

async function fixturePath() {
  const directory = await mkdtemp(path.join(tmpdir(), "raven-quarantine-writer-"));
  directories.push(directory);
  return path.join(directory, "run-playground-semantic-quarantine.json");
}

describe("quarantine atomic writer and production notices", () => {
  it("writes exact mode-0600 JSON atomically with no temp residue", async () => {
    const out = await fixturePath();
    await writeAtomicQuarantine(out, { artifactContract: "fixture" }, { tempId: () => "fixed" });
    expect(await readFile(out, "utf8")).toBe('{\n  "artifactContract": "fixture"\n}\n');
    expect((await stat(out)).mode & 0o777).toBe(0o600);
    await expect(stat(`${out}.fixed.tmp`)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("preserves an unowned wx collision and removes an owned temp after rename failure", async () => {
    const collision = await fixturePath();
    await writeFile(`${collision}.fixed.tmp`, "keep", { mode: 0o600 });
    await expect(writeAtomicQuarantine(collision, { ok: true }, { tempId: () => "fixed" })).rejects.toMatchObject({ code: "EEXIST" });
    expect(await readFile(`${collision}.fixed.tmp`, "utf8")).toBe("keep");

    const failedRename = await fixturePath();
    await expect(writeAtomicQuarantine(failedRename, { ok: true }, { tempId: () => "owned", renameFile: async () => { throw new Error("rename denied"); } })).rejects.toThrow(/rename denied/);
    await expect(stat(`${failedRename}.owned.tmp`)).rejects.toMatchObject({ code: "ENOENT" });

    const failedWrite = await fixturePath();
    await expect(writeAtomicQuarantine(failedWrite, { ok: true }, {
      tempId: () => "partial",
      openFile: async (file: string, flags: string, mode: number) => {
        const handle = await open(file, flags as any, mode);
        return { close: () => handle.close(), writeFile: async (text: string) => { await handle.writeFile(text.slice(0, 4)); throw new Error("disk full"); } };
      }
    })).rejects.toThrow(/disk full/);
    await expect(stat(`${failedWrite}.partial.tmp`)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("maps dispositions and emits only safe accounting marker fields", () => {
    expect(exitCodeForRunDisposition({ kind: "normal" })).toBe(0);
    expect(exitCodeForRunDisposition({ kind: "quarantined" })).toBe(1);
    const notice = formatQuarantineNotice({
      path: "/tmp/unsafe\npath\u001b.json", reason: { code: "generation-check-error" },
      treeAtStart: { generationSha256: "a".repeat(64) }, treeAtFinish: null,
      artifact: {
        quarantinedMeta: { judge: { enabled: true } },
        quarantinedRows: [{ id: "a" }],
        spend: {
          actual: { answerCallsStarted: 1, judgeCallsStarted: 0 },
          selectedCaseIds: ["a"], caseIdsAttempted: ["a"], caseIdsJudged: []
        }
      },
      writeFailed: true, error: { name: "Error", message: "disk\nfull" }
    });
    expect(notice).toContain("QUARANTINE WRITE FAILED — NOT A RESULT");
    expect(notice).toMatch(/path="\/tmp\/unsafe path .json" reason=.+ startGeneration=.+ answerStarted=1/);
    expect(notice).not.toMatch(/answer=|transcript|frame|cookie|\n/);

    const emitted: string[] = [];
    expect(handleEntryDiagnostic(new QuarantineNoticeEmittedError(), (line: string) => emitted.push(line))).toEqual({ exitCode: 1, emitted: false });
    expect(emitted).toEqual([]);
    expect(handleEntryDiagnostic(new Error("ordinary\n\u001b failure"), (line: string) => emitted.push(line))).toEqual({ exitCode: 1, emitted: true });
    expect(emitted).toEqual(["playground semantic eval failed: ordinary failure"]);
  });
});
