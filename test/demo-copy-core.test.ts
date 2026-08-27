/**
 * Playground answer-copy tests — the behavior half of the feature.
 *
 * DEMO_COPY_CORE is the copy action's source, split out of the page IIFE so it
 * can be evaluated and driven here (same trick as demo-scroll-core.test.ts for
 * mdCommitIndex). The page has no DOM library in its test lane, so this file
 * carries a minimal fake node — enough for createElement/appendChild/
 * insertBefore/nextSibling/addEventListener, which is all the core touches.
 * Each row carries its own role="status" node, so feedback is read from the
 * row rather than from an injected announce callback.
 *
 * The load-bearing assertion is that the clipboard receives the raw accumulated
 * Markdown, not the bubble's rendered text: the fake bubble deliberately
 * carries flattened textContent that differs from the source.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_COPY_CORE } from "../src/demo/page";

class FakeNode {
  readonly tagName: string;
  className = "";
  type = "";
  textContent = "";
  readonly children: FakeNode[] = [];
  parentNode: FakeNode | null = null;
  readonly attrs: Record<string, string> = {};
  private readonly listeners: Record<string, Array<() => void>> = {};

  constructor(tagName: string) {
    this.tagName = tagName;
  }

  appendChild(node: FakeNode): FakeNode {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  insertBefore(node: FakeNode, ref: FakeNode | null): FakeNode {
    const at = ref ? this.children.indexOf(ref) : -1;
    this.children.splice(at < 0 ? this.children.length : at, 0, node);
    node.parentNode = this;
    return node;
  }

  setAttribute(name: string, value: string): void {
    this.attrs[name] = value;
  }

  addEventListener(type: string, fn: () => void): void {
    (this.listeners[type] ??= []).push(fn);
  }

  click(): void {
    for (const fn of this.listeners.click ?? []) fn();
  }

  get nextSibling(): FakeNode | null {
    if (!this.parentNode) return null;
    return this.parentNode.children[this.parentNode.children.indexOf(this) + 1] ?? null;
  }
}

const doc = { createElement: (tag: string) => new FakeNode(tag) };

type Attach = (
  doc: unknown,
  nav: unknown,
  bubble: FakeNode | null,
  source: string
) => FakeNode | null;

const attachCopyRow = new Function(
  `${DEMO_COPY_CORE}; return attachCopyRow;`
)() as Attach;

// A source that only survives intact if the RAW answer is copied: a table, a
// fenced block, and inline syntax all collapse or vanish under textContent.
const MARKDOWN = [
  "## Fees",
  "",
  "| network | base fee |",
  "| --- | --- |",
  "| pubnet | 100 stroops |",
  "",
  "```bash",
  "stellar contract build",
  "```",
  "",
  "See the **fee** docs and `stellar contract deploy`."
].join("\n");

function bubbleIn(log: FakeNode, rendered: string): FakeNode {
  const bubble = new FakeNode("div");
  bubble.className = "msg assistant md";
  bubble.textContent = rendered;
  log.appendChild(bubble);
  return bubble;
}

function copyButton(row: FakeNode): FakeNode {
  const btn = row.children[0];
  if (!btn) throw new Error("action row has no button");
  return btn;
}

function statusNode(row: FakeNode): FakeNode {
  const node = row.children[1];
  if (!node) throw new Error("action row has no status node");
  return node;
}

/** Record the status node's non-empty messages in assignment order. */
function watchStatus(row: FakeNode): string[] {
  const heard: string[] = [];
  const node = statusNode(row);
  let text = "";
  Object.defineProperty(node, "textContent", {
    get: () => text,
    set: (v: string) => {
      text = v;
      if (v) heard.push(v);
    }
  });
  return heard;
}

const IDLE_NAME = "Copy this answer as Markdown";

describe("playground answer copy — attachment", () => {
  it("attaches exactly one action row directly below the answer", () => {
    const log = new FakeNode("div");
    const bubble = bubbleIn(log, "Fees network base fee");
    const row = attachCopyRow(doc, {}, bubble, MARKDOWN);

    expect(row).not.toBeNull();
    expect(bubble.nextSibling).toBe(row);
    expect(row?.className).toBe("answer-actions");
    expect(log.children.filter((n) => n.className === "answer-actions")).toHaveLength(1);
    expect(copyButton(row!).textContent).toBe("Copy");
  });

  it("gives the button a clear accessible name and a real button type", () => {
    const log = new FakeNode("div");
    const btn = copyButton(attachCopyRow(doc, {}, bubbleIn(log, "x"), "answer")!);
    expect(btn.tagName).toBe("button");
    expect(btn.type).toBe("button");
    expect(btn.attrs["aria-label"]).toBe(IDLE_NAME);
  });

  it("gives each row its own status region instead of the shared turn-progress one", () => {
    const log = new FakeNode("div");
    const status = statusNode(attachCopyRow(doc, {}, bubbleIn(log, "x"), "answer")!);
    expect(status.className).toBe("sr-only");
    expect(status.attrs.role).toBe("status");
    expect(status.attrs["aria-atomic"]).toBe("true");
    expect(status.textContent).toBe("");
  });

  it("stays unavailable when the turn produced no assistant text", () => {
    const log = new FakeNode("div");
    expect(attachCopyRow(doc, {}, bubbleIn(log, ""), "")).toBeNull();
    expect(attachCopyRow(doc, {}, null, MARKDOWN)).toBeNull();
    expect(log.children.filter((n) => n.className === "answer-actions")).toHaveLength(0);
  });

  it("attaches to a partial answer, and never twice to the same answer", () => {
    const log = new FakeNode("div");
    const bubble = bubbleIn(log, "Half an ans");
    // A turn cut off by length/incomplete/error still finishes through
    // finishTurn, so its partial text must become copyable.
    expect(attachCopyRow(doc, {}, bubble, "Half an ans")).not.toBeNull();
    expect(attachCopyRow(doc, {}, bubble, "Half an ans")).toBeNull();
    expect(log.children.filter((n) => n.className === "answer-actions")).toHaveLength(1);
  });

  it("keeps each answer's action row bound to its own answer", () => {
    const log = new FakeNode("div");
    const first = bubbleIn(log, "one");
    const second = bubbleIn(log, "two");
    attachCopyRow(doc, {}, first, "first answer");
    attachCopyRow(doc, {}, second, "second answer");
    expect(log.children.filter((n) => n.className === "answer-actions")).toHaveLength(2);
    expect(first.nextSibling?.className).toBe("answer-actions");
    expect(second.nextSibling?.className).toBe("answer-actions");
  });
});

describe("playground answer copy — clipboard value and feedback", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("copies the raw accumulated Markdown, not the rendered text", async () => {
    const written: string[] = [];
    const nav = { clipboard: { writeText: (s: string) => (written.push(s), Promise.resolve()) } };
    const log = new FakeNode("div");
    // What the renderer would have flattened the answer into — never the value
    // that should reach the clipboard.
    const bubble = bubbleIn(log, "Fees network base fee pubnet 100 stroops");
    const row = attachCopyRow(doc, nav, bubble, MARKDOWN)!;
    const announced = watchStatus(row);

    copyButton(row).click();
    await vi.runAllTimersAsync();

    expect(written).toEqual([MARKDOWN]);
    expect(written[0]).not.toBe(bubble.textContent);
    expect(written[0]).toContain("| network | base fee |");
    expect(written[0]).toContain("```bash");
    expect(written[0]).toContain("**fee**");
    expect(written[0]).toContain("## Fees");
    expect(announced).toEqual(["Answer copied to the clipboard."]);
  });

  it("confirms success on the button and its accessible name, then reverts both", async () => {
    const nav = { clipboard: { writeText: () => Promise.resolve() } };
    const log = new FakeNode("div");
    const btn = copyButton(attachCopyRow(doc, nav, bubbleIn(log, "a"), MARKDOWN)!);

    btn.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(btn.textContent).toBe("Copied");
    expect(btn.attrs["aria-label"]).toBe("Copied this answer");
    expect(btn.className).toContain("copied");

    await vi.advanceTimersByTimeAsync(1600);
    expect(btn.textContent).toBe("Copy");
    expect(btn.attrs["aria-label"]).toBe(IDLE_NAME);
    expect(btn.className).toBe("btn btn-ghost");
  });

  it("announces every attempt, including a repeat copy of the same answer", async () => {
    let ok = true;
    const nav = {
      clipboard: { writeText: () => (ok ? Promise.resolve() : Promise.reject(new Error("x"))) }
    };
    const log = new FakeNode("div");
    const row = attachCopyRow(doc, nav, bubbleIn(log, "a"), MARKDOWN)!;
    const heard = watchStatus(row);
    const btn = copyButton(row);

    btn.click();
    await vi.runAllTimersAsync();
    btn.click();
    await vi.runAllTimersAsync();
    ok = false;
    btn.click();
    await vi.runAllTimersAsync();
    btn.click();
    await vi.runAllTimersAsync();

    // The region is emptied before each message, so identical text still
    // produces a fresh status update for assistive technology.
    expect(heard).toEqual([
      "Answer copied to the clipboard.",
      "Answer copied to the clipboard.",
      "Copy failed — select the answer and copy it manually.",
      "Copy failed — select the answer and copy it manually."
    ]);
  });

  it("reports a rejected clipboard write instead of claiming success", async () => {
    const nav = { clipboard: { writeText: () => Promise.reject(new Error("NotAllowedError")) } };
    const log = new FakeNode("div");
    const row = attachCopyRow(doc, nav, bubbleIn(log, "a"), MARKDOWN)!;
    const announced = watchStatus(row);
    const btn = copyButton(row);

    btn.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(btn.textContent).toBe("Copy failed");
    expect(btn.attrs["aria-label"]).toBe("Copy failed");
    expect(btn.className).toContain("copyfail");

    await vi.runAllTimersAsync();
    expect(announced).toEqual(["Copy failed — select the answer and copy it manually."]);
    expect(btn.textContent).toBe("Copy");
    expect(btn.attrs["aria-label"]).toBe(IDLE_NAME);
  });

  it("reports failure when the Clipboard API is absent (insecure context)", async () => {
    const log = new FakeNode("div");
    const row = attachCopyRow(doc, {}, bubbleIn(log, "a"), MARKDOWN)!;
    const announced = watchStatus(row);
    const btn = copyButton(row);

    btn.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(btn.textContent).toBe("Copy failed");
    await vi.runAllTimersAsync();
    expect(announced).toEqual(["Copy failed — select the answer and copy it manually."]);
  });
});
