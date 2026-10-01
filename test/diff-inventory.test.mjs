import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { compareInventory } from "../scripts/diff-inventory.mjs";

const SCRIPT = resolve(import.meta.dirname, "../scripts/diff-inventory.mjs");
const inventory = (operation = {}, components = {}) => ({
  openapi: { paths: { "/example": { get: operation } }, components }
});
let root;

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
  root = undefined;
});

function run(mode, before, after) {
  root = mkdtempSync(join(tmpdir(), "diff-inventory-"));
  const oldPath = join(root, "old.json");
  const newPath = join(root, "new.json");
  writeFileSync(oldPath, JSON.stringify(before));
  writeFileSync(newPath, JSON.stringify(after));
  return spawnSync(process.execPath, [SCRIPT, mode, oldPath, newPath], { encoding: "utf8" });
}

describe("inventory surface comparison", () => {
  it("detects a path rename with an unchanged operation count", () => {
    const result = run("surface", inventory(), { openapi: { paths: { "/renamed": { get: {} } } } });
    expect(result.status).toBe(1);
    expect(result.stdout).toBe("- GET /example\n+ GET /renamed\n");
    expect(result.stderr).toBe("");
  });

  it("compares all seven methods and ignores path metadata", () => {
    const before = { openapi: { paths: {
      "/z": { summary: "Old", parameters: [], trace: {} },
      "/a": { head: {}, options: {}, delete: {}, patch: {}, put: {}, post: {}, get: {} }
    } } };
    const after = { openapi: { paths: { "/z": { summary: "New", parameters: [{}], trace: {} } } } };
    expect(compareInventory(before, after, "surface").lines).toEqual([
      "- DELETE /a", "- GET /a", "- HEAD /a", "- OPTIONS /a", "- PATCH /a", "- POST /a", "- PUT /a"
    ]);
  });

  it("ignores object-key order and supports inventories without paths", () => {
    expect(compareInventory({}, { openapi: { paths: {} } }, "surface").changed).toBe(false);
    const before = { openapi: { paths: { "/z": { post: {} }, "/a": { get: {} } } } };
    const after = { openapi: { paths: { "/a": { get: {} }, "/z": { post: {} } } } };
    expect(compareInventory(before, after, "surface").lines).toEqual([]);
  });
});

describe("inventory routing-text comparison", () => {
  it.each(["operationId", "summary", "description", "x-routing"])("detects a %s change", (field) => {
    const result = run("text", inventory(), inventory({ [field]: field === "x-routing" ? { terms: ["new"] } : "new" }));
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("- GET /example ::  ::  ::  :: null\n");
    expect(result.stdout).toContain("+ GET /example :: ");
  });

  it("normalizes whitespace, missing fields, and routing object-key order", () => {
    const before = inventory({
      operationId: " getExample ", summary: " Read\n an\t example ", description: null,
      "x-routing": { z: [{ b: 2, a: 1 }], a: true }
    });
    const after = inventory({
      summary: "Read an example", operationId: "getExample",
      "x-routing": { a: true, z: [{ a: 1, b: 2 }] }
    });
    expect(compareInventory(before, after, "text")).toEqual({ changed: false, lines: [] });
    expect(compareInventory(inventory(), inventory({ "x-routing": null }), "text").changed).toBe(false);
  });

  it("preserves routing array order and prints sorted text rows", () => {
    const before = inventory({ "x-routing": ["a", "b"] });
    const after = inventory({ "x-routing": ["b", "a"] });
    expect(compareInventory(before, after, "text").lines).toEqual([
      '- GET /example ::  ::  ::  :: ["a","b"]',
      '+ GET /example ::  ::  ::  :: ["b","a"]'
    ]);
  });
});

describe("inventory deep comparison", () => {
  it.each(["parameters", "requestBody", "responses", "x-execute", "x-other"])("detects a %s-only change", (field) => {
    const before = inventory();
    const after = inventory({ [field]: { nested: ["new"] } });
    expect(compareInventory(before, after, "surface").changed).toBe(false);
    expect(compareInventory(before, after, "text").changed).toBe(false);
    expect(compareInventory(before, after, "deep")).toEqual({
      changed: true, lines: ["paths identical: false", "components identical: true"]
    });
  });

  it("detects shared components changes through the command", () => {
    const result = run("deep", inventory(), inventory({}, { schemas: { Example: { type: "string" } } }));
    expect(result.status).toBe(1);
    expect(result.stdout).toBe("paths identical: true\ncomponents identical: false\n");
    expect(result.stderr).toBe("");
  });

  it("compares path metadata, missing sections, and schema array order", () => {
    const before = inventory();
    const after = inventory();
    after.openapi.paths["/example"].parameters = [];
    expect(compareInventory(before, after, "deep").changed).toBe(true);
    expect(compareInventory({}, { openapi: { paths: {} } }, "deep").changed).toBe(true);
    expect(compareInventory(inventory(), { openapi: { paths: inventory().openapi.paths } }, "deep").changed).toBe(true);
    expect(compareInventory(inventory({ enum: ["a", "b"] }), inventory({ enum: ["b", "a"] }), "deep").changed).toBe(true);
  });

  it("ignores provenance and object-key order, including nested objects", () => {
    const before = inventory({ responses: { 200: { z: 2, a: 1 } }, summary: "Example" });
    const after = inventory({ summary: "Example", responses: { 200: { a: 1, z: 2 } } });
    before.fetchedAt = "old";
    after.fetchedAt = "new";
    after.version = "new";
    const result = run("deep", before, after);
    expect(result.status).toBe(0);
    expect(result.stdout).toBe("paths identical: true\ncomponents identical: true\n");
  });

  it("preserves JSON keys named __proto__", () => {
    const before = inventory({}, JSON.parse('{"schemas":{"__proto__":{"type":"string"}}}'));
    const after = inventory({}, JSON.parse('{"schemas":{"__proto__":{"type":"number"}}}'));
    expect(compareInventory(before, after, "deep").lines[1]).toBe("components identical: false");
  });
});

describe("inventory command contract", () => {
  it.each(["surface", "text"])("prints nothing when %s is equal", (mode) => {
    const result = run(mode, inventory(), inventory());
    expect(result.status).toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe("");
  });

  it("loads a Git snapshot and the working file without Git writes", () => {
    root = mkdtempSync(join(tmpdir(), "diff-inventory-"));
    const snapshot = join(root, "snapshot.json");
    writeFileSync(snapshot, execFileSync("git", ["show", "HEAD:inventory/stellar-light.json"], {
      cwd: resolve(import.meta.dirname, ".."), encoding: "utf8"
    }));
    const result = spawnSync(process.execPath, [SCRIPT, "deep", "HEAD:inventory/stellar-light.json", snapshot], {
      cwd: tmpdir(), encoding: "utf8"
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toBe("paths identical: true\ncomponents identical: true\n");
    expect(result.stderr).toBe("");
  });

  it("reports usage errors separately from drift", () => {
    const result = spawnSync(process.execPath, [SCRIPT, "unknown"], { encoding: "utf8" });
    expect(result.status).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Usage:");
  });

  it("reports a missing Git source as an error", () => {
    const result = spawnSync(process.execPath, [SCRIPT, "deep", "HEAD:inventory/missing.json", "inventory/stellar-light.json"], { encoding: "utf8" });
    expect(result.status).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("diff-inventory:");
  });

  it("reports malformed JSON and invalid inventory objects as errors", () => {
    const result = run("deep", null, inventory());
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Invalid inventory object:");
    writeFileSync(join(root, "old.json"), "{");
    const invalidJson = spawnSync(process.execPath, [SCRIPT, "deep", join(root, "old.json"), join(root, "new.json")], { encoding: "utf8" });
    expect(invalidJson.status).toBe(2);
    expect(invalidJson.stdout).toBe("");
    expect(invalidJson.stderr).toContain("diff-inventory:");
  });
});
