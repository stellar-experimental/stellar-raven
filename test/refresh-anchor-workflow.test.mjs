import { afterEach, describe, expect, it } from "vitest";
import { chmodSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const REPO = resolve(import.meta.dirname, "..");
const workflow = readFileSync(new URL("../.github/workflows/refresh.yml", import.meta.url), "utf8");
const captureName = "refresh docs section anchors without credentials";
const directories = [];

function step(name) {
  const start = workflow.indexOf(`      - name: ${name}\n`);
  if (start < 0) throw new Error(`Missing workflow step: ${name}`);
  const end = workflow.indexOf("\n      - ", start + 1);
  const block = workflow.slice(start, end < 0 ? undefined : end);
  const lines = block.split("\n");
  const run = lines.indexOf("        run: |");
  if (run < 0) throw new Error(`Missing run block: ${name}`);
  const body = [];
  for (const line of lines.slice(run + 1)) {
    if (line && !line.startsWith("          ")) break;
    body.push(line.slice(10));
  }
  return { block, script: body.join("\n") };
}

function run(script, { extraEnv = {}, withFakeGit = false } = {}) {
  const directory = mkdtempSync(join(tmpdir(), "refresh-anchor-workflow-"));
  directories.push(directory);
  const output = join(directory, "output");
  writeFileSync(output, "");
  writeFileSync(join(directory, ".env"), "");
  writeFileSync(join(directory, "skills-drift.json"), JSON.stringify({ results: [] }));
  symlinkSync(join(REPO, "scripts"), join(directory, "scripts"), "dir");

  const env = { ...process.env, GITHUB_OUTPUT: output, ...extraEnv };
  if (withFakeGit) {
    const binDir = join(directory, "bin");
    const fakeGit = join(binDir, "git");
    spawnSync("mkdir", ["-p", binDir]);
    writeFileSync(fakeGit, "#!/bin/sh\nexit 0\n");
    chmodSync(fakeGit, 0o755);
    env.PATH = `${binDir}:${env.PATH ?? ""}`;
  }

  const result = spawnSync("bash", ["-e", "-o", "pipefail", "-c", script], {
    cwd: directory,
    env,
    encoding: "utf8",
    timeout: 10_000
  });
  if (result.error) throw result.error;
  return { result, output: readFileSync(output, "utf8"), directory };
}

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true });
});

describe("daily anchor refresh failure handling", () => {
  it.each([[0, "ok"], [23, "error"]])("records capture exit %i as %s and permits later steps", (code, state) => {
    const capture = step(captureName);
    expect(capture.block).toContain("        id: anchors\n");
    expect(capture.block).toContain("        continue-on-error: true\n");
    const { result, output } = run(`npm() { return ${code}; }\n${capture.script}`);
    expect(result.status, result.stderr).toBe(code);
    expect(output).toBe(`state=${state}\n`);
    expect(workflow.indexOf(`      - name: ${captureName}`)).toBeLessThan(workflow.indexOf("      - name: materialize .env from repo secrets"));
  });

  it.each(["ok", "error", "", "unexpected"])("handles anchor state %j with no other drift", (state) => {
    const { result, output, directory } = run(step("detect drift").script, {
      withFakeGit: true,
      extraEnv: {
        ANCHORS_STATE: state,
        SKILLS_DRIFT: "false",
        PINS_STATE: "clean",
        GOSPEL_STATE: "clean",
        CANARY_STATE: "clean",
        RUN_URL: "https://github.com/example/repo/actions/runs/1"
      }
    });
    expect(result.status, result.stderr).toBe(0);
    const report = JSON.parse(readFileSync(join(directory, "drift-report.json"), "utf8"));
    if (state === "ok") {
      expect(output).toContain("drift=false\n");
      expect(report.items).toEqual([]);
      return;
    }
    expect(output).toContain("drift=true\n");
    expect(report.checks.anchors).toBe("error");
    expect(report.items.map((item) => item.key)).toEqual(["anchors:stellar-docs"]);
    const failure = step("fail on drift");
    expect(failure.block).toContain("if: steps.drift.outputs.drift == 'true'");
    expect(run(failure.script).result.status).toBe(1);
    expect(step("sync drift issues").block).toContain("steps.drift.outcome == 'success'");
  });
});
