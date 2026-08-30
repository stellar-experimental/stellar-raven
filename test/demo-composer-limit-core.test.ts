import { describe, expect, it } from "vitest";
import { DEMO_COMPOSER_LIMIT_CORE } from "../src/demo/page";

class FakeElement {
  value = "";
  textContent = "";
  className = "";
  disabled = false;
  readonly attributes: Record<string, string> = {};

  setAttribute(name: string, value: string): void {
    this.attributes[name] = value;
  }
}

type LimitState = { excess: number; overLimit: boolean };
type UpdateComposerLimitState = (
  input: FakeElement,
  sendButton: FakeElement,
  count: FakeElement,
  announce: (message: string) => void,
  busy: boolean,
  wasOverLimit: boolean,
  limit: number
) => LimitState;
type ComposerSubmission = (
  input: FakeElement,
  limit: number,
  update: () => number,
  setNote: (message: string, kind: string) => void
) => string | null;

const composerCore = new Function(
  `${DEMO_COMPOSER_LIMIT_CORE}; return { updateComposerLimitState, composerSubmission };`
)() as {
  updateComposerLimitState: UpdateComposerLimitState;
  composerSubmission: ComposerSubmission;
};

function harness() {
  const input = new FakeElement();
  const sendButton = new FakeElement();
  const count = new FakeElement();
  const announcements: string[] = [];
  const notes: Array<{ message: string; kind: string }> = [];
  let wasOverLimit = false;

  const update = () => {
    const state = composerCore.updateComposerLimitState(
      input,
      sendButton,
      count,
      (message) => announcements.push(message),
      false,
      wasOverLimit,
      8000
    );
    wasOverLimit = state.overLimit;
    return state.excess;
  };

  return {
    input,
    sendButton,
    count,
    announcements,
    notes,
    update,
    submit: () => composerCore.composerSubmission(
      input,
      8000,
      update,
      (message, kind) => notes.push({ message, kind })
    )
  };
}

describe("playground composer limit", () => {
  it.each([7999, 8000])("keeps a %i-character message accessible and sendable", (length) => {
    const test = harness();
    const message = "x".repeat(length);
    test.input.value = message;

    expect(test.update()).toBe(0);
    expect(test.input.value).toBe(message);
    expect(test.count.textContent).toBe(`${length.toLocaleString()} / 8,000 characters`);
    expect(test.count.className).toBe("composer-count");
    expect(test.input.attributes["aria-invalid"]).toBe("false");
    expect(test.sendButton.disabled).toBe(false);
    expect(test.announcements).toEqual([]);
    expect(test.submit()).toBe(message);
  });

  it("keeps 8001 characters editable, disables Send, and announces only limit transitions", () => {
    const test = harness();
    const message = "x".repeat(8001);
    test.input.value = message;

    expect(test.update()).toBe(1);
    expect(test.input.value).toBe(message);
    expect(test.count.textContent).toBe("8,001 / 8,000 characters — 1 character over the limit");
    expect(test.count.className).toBe("composer-count over");
    expect(test.input.attributes["aria-invalid"]).toBe("true");
    expect(test.sendButton.disabled).toBe(true);
    expect(test.announcements).toEqual([
      "Message is 1 character over the 8,000-character limit. Send is disabled."
    ]);

    test.input.value = "x".repeat(8002);
    expect(test.update()).toBe(2);
    expect(test.announcements).toHaveLength(1);

    test.input.value = "x".repeat(8000);
    expect(test.update()).toBe(0);
    expect(test.sendButton.disabled).toBe(false);
    expect(test.input.attributes["aria-invalid"]).toBe("false");

    test.input.value = message;
    expect(test.update()).toBe(1);
    expect(test.announcements).toHaveLength(2);
  });

  it("does not submit an 8001-character message", () => {
    const test = harness();
    const message = "x".repeat(8001);
    test.input.value = message;

    expect(test.submit()).toBeNull();
    expect(test.input.value).toBe(message);
    expect(test.sendButton.disabled).toBe(true);
    expect(test.notes).toEqual([
      { message: "Message is 1 character over the 8,000-character limit.", kind: "err" }
    ]);
  });
});
