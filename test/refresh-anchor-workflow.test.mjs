import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

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

function run(script) {
  const directory = mkdtempSync(join(tmpdir(), "refresh-anchor-workflow-"));
  directories.push(directory);
  const output = join(directory, "output");
  writeFileSync(output, "");
  writeFileSync(join(directory, ".env"), "");
  const result = spawnSync("bash", ["-e", "-o", "pipefail", "-c", script], {
    cwd: directory,
    env: { ...process.env, GITHUB_OUTPUT: output },
    encoding: "utf8",
    timeout: 5_000
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
    const values = {
      "steps.anchors.outputs.state": state,
      "steps.skills.outputs.drift": "false",
      "steps.pins.outputs.state": "clean",
      "steps.gospel.outputs.state": "clean",
      "steps.canary.outputs.state": "clean"
    };
    const script = step("detect drift").script.replace(/\$\{\{\s*([^}]+?)\s*\}\}/g, (_, expression) => values[expression] ?? "fixture");
    const { result, output, directory } = run(`git() { return 0; }\n${script}`);
    expect(result.status, result.stderr).toBe(0);
    if (state === "ok") {
      expect(output).toContain("drift=false\n");
      return;
    }
    expect(output).toContain("drift=true\n");
    const report = readFileSync(join(directory, "drift-report.md"), "utf8");
    expect(report).toContain("Docs section anchor capture failed");
    expect(report).toContain("Other service refresh checks continued.");
    expect(report).toContain("The committed anchor index stays in place.");
    expect(report).toContain("Headings without an indexed match use page URLs.");
    expect(report).toContain("re-run `npm run docs:anchors:build`");
    const failure = step("fail on drift");
    expect(failure.block).toContain("if: steps.drift.outputs.drift == 'true'");
    expect(run(failure.script).result.status).toBe(1);
    expect(step("open or update drift issue").block).toContain("if: always() && steps.drift.outputs.drift == 'true'");
  });
});
