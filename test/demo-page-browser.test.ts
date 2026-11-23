import { expect, it, vi } from "vitest";
import { Window, type HTMLAnchorElement, type HTMLButtonElement, type HTMLInputElement } from "happy-dom";
import { demoPage } from "../src/demo/page";
import { DEMO_CAPS } from "../src/demo/budget";

function createOfflineWindow() {
  // A separate window runs the complete emitted page, including its inline script.
  // No global DOM replacement or browser download is needed by the Node suite.
  return new Window({
    url: "https://playground.test/playground",
    settings: {
      enableJavaScriptEvaluation: true,
      suppressInsecureJavaScriptEnvironmentWarning: true,
      disableJavaScriptFileLoading: true,
      disableCSSFileLoading: true,
      enableImageFileLoading: false,
      disableErrorCapturing: true,
      fetch: {
        interceptor: {
          beforeAsyncRequest() { throw new Error("Unexpected network request in offline test"); },
          beforeSyncRequest() { throw new Error("Unexpected network request in offline test"); }
        }
      }
    }
  });
}

it("runs the Playground page through submit, streaming, copy, and length refusal offline", async () => {
  const window = createOfflineWindow();
  const encoder = new TextEncoder();
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const stream = new ReadableStream<Uint8Array>({ start(value) { controller = value; } });
  const fetch = vi.fn(async () => new Response(stream, {
    headers: { "content-type": "text/event-stream" }
  }));
  const writeText = vi.spyOn(window.navigator.clipboard, "writeText").mockResolvedValue();
  // The page only needs the response's stream interface. Use Node's stream to
  // control chunk delivery independently from the DOM's event loop.
  Object.defineProperty(window, "fetch", { value: fetch });
  const frame = (value: object) => encoder.encode(`data: ${JSON.stringify(value)}\n\n`);

  try {
    window.document.write(demoPage({ authenticated: true }));
    const document = window.document;
    const input = document.querySelector("textarea")!;
    const form = document.querySelector("form")!;
    const send = document.querySelector<HTMLButtonElement>("#send")!;
    const setInput = (value: string) => {
      input.value = value;
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
    };
    const submit = () => form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));

    expect(document.activeElement).toBe(input);
    setInput("  Explain Stellar assets.  ");
    send.click();
    expect(fetch).toHaveBeenCalledExactlyOnceWith("/playground/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "Explain Stellar assets." }] })
    });
    expect(input.value).toBe("");
    expect(send.disabled).toBe(true);
    expect(send.classList.contains("is-loading")).toBe(true);
    expect(send.getAttribute("aria-busy")).toBe("true");
    expect(send.querySelector(".btn-label")?.textContent).toBe("Sending…");
    expect(document.querySelector(".msg.user")?.textContent).toBe("Explain Stellar assets.");
    // A second submit while busy must not start another request.
    submit();
    expect(fetch).toHaveBeenCalledTimes(1);

    controller.enqueue(frame({ type: "ready" }));
    controller.enqueue(frame({ type: "tool-start", id: "search-1", tool: "search", input: { query: "assets" } }));
    controller.enqueue(frame({ type: "tool-result", id: "search-1", tool: "search", ok: true, output: { hits: [], total: 0 } }));
    controller.enqueue(frame({ type: "tool-start", id: "execute-1", tool: "execute", input: { code: "return {};" } }));

    const first = "**Stellar assets** 🌟\n\n";
    const last = "Use `trustlines` to hold an asset.";
    const token = frame({ type: "token", text: first });
    // Split inside a UTF-8 character and before the SSE delimiter. This checks
    // the page's decoder and frame buffer, not a replacement stream parser.
    const split = token.indexOf(0xf0) + 2;
    controller.enqueue(token.slice(0, split));
    controller.enqueue(token.slice(split, -1));
    controller.enqueue(token.slice(-1));
    await vi.waitFor(() => {
      expect(document.querySelector(".msg.assistant.streaming")?.textContent).toContain("Stellar assets 🌟");
    });
    expect(send.disabled).toBe(true);
    expect(send.classList.contains("is-loading")).toBe(true);
    expect(send.querySelector(".btn-label")?.textContent).toBe("Working…");
    expect(document.querySelector(".answer-actions")).toBeNull();

    controller.enqueue(frame({ type: "token", text: last }));
    controller.enqueue(frame({ type: "done", reason: "stop" }));
    controller.close();
    await vi.waitFor(() => expect(send.disabled).toBe(false));
    expect(send.classList.contains("is-loading")).toBe(false);
    expect(send.getAttribute("aria-busy")).toBeNull();
    expect(send.querySelector(".btn-label")?.textContent).toBe("Send");
    const answer = document.querySelector(".msg.assistant")!;
    expect(answer.classList.contains("streaming")).toBe(false);
    expect(answer.querySelector("strong")?.textContent).toBe("Stellar assets");
    expect(answer.querySelector("code")?.textContent).toBe("trustlines");
    expect(document.querySelector("#sr")?.textContent).toBe("Reply finished");
    expect(document.querySelector("#sysnote")?.textContent).toBe("");
    expect(document.querySelector(".pulse")).toBeNull();
    expect([...document.querySelectorAll(".tcard .st")].map(node => node.textContent)).toEqual(["ok", "stalled"]);
    expect(document.querySelectorAll(".answer-actions")).toHaveLength(1);
    const copy = document.querySelector<HTMLButtonElement>(".answer-actions button")!;
    expect(copy.getAttribute("aria-label")).toBe("Copy this answer as Markdown");
    copy.click();
    expect(writeText).toHaveBeenCalledExactlyOnceWith(first + last);
    await vi.waitFor(() => {
      expect(copy.textContent).toBe("Copied");
      expect(document.querySelector('.answer-actions [role="status"]')?.textContent).toBe("Answer copied to the clipboard.");
    });
    expect(document.querySelector("#sr")?.textContent).toBe("Reply finished");

    const tooLong = "x".repeat(DEMO_CAPS.maxUserMessageChars + 1);
    setInput(tooLong);
    expect(input.value).toBe(tooLong);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(send.disabled).toBe(true);
    expect(document.querySelector("#composer-count")?.textContent).toContain("1 character over the limit");
    expect(document.querySelector("#sr")?.textContent).toContain("Send is disabled.");
    // Submit directly as well: the handler must reject excess text even when
    // a caller bypasses the disabled button (for example the Enter handler).
    submit();
    expect(document.querySelector("#sysnote")?.textContent).toContain("Message is 1 character over");
    expect(input.value).toBe(tooLong);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll(".msg.user")).toHaveLength(1);
    setInput("x".repeat(DEMO_CAPS.maxUserMessageChars));
    expect(input.getAttribute("aria-invalid")).toBe("false");
    expect(send.disabled).toBe(false);
  } finally {
    // Clear the page's copy-feedback timers even after a failed assertion.
    await window.happyDOM.close();
  }
});

it("shows a stream error, stalls the open tool card, and enables Send again", async () => {
  const window = createOfflineWindow();
  const encoder = new TextEncoder();
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(value) { controller = value; },
    cancel() { cancelled = true; }
  });
  const fetch = vi.fn(async () => new Response(stream, {
    headers: { "content-type": "text/event-stream" }
  }));
  Object.defineProperty(window, "fetch", { value: fetch });
  const frame = (value: object) => encoder.encode(`data: ${JSON.stringify(value)}\n\n`);

  try {
    window.document.write(demoPage({ authenticated: true }));
    const document = window.document;
    const input = document.querySelector("textarea")!;
    const send = document.querySelector<HTMLButtonElement>("#send")!;
    input.value = "Explain Stellar assets.";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    send.click();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(send.disabled).toBe(true);

    controller.enqueue(frame({ type: "tool-start", id: "search-error", tool: "search", input: { query: "assets" } }));
    await vi.waitFor(() => expect(document.querySelector(".tcard .st")?.textContent).toBe("running"));
    controller.enqueue(frame({ type: "error", message: "The test stream failed." }));
    // The error frame itself finishes the turn and cancels the reader without waiting for EOF.
    await vi.waitFor(() => {
      expect(document.querySelector("#sysnote")?.textContent).toBe("The test stream failed.");
      expect(document.querySelector(".tcard .st")?.textContent).toBe("stalled");
      expect(send.disabled).toBe(false);
      expect(send.classList.contains("is-loading")).toBe(false);
      expect(send.querySelector(".btn-label")?.textContent).toBe("Send");
      expect(cancelled).toBe(true);
    });
  } finally {
    await window.happyDOM.close();
  }
});

it("stops reading on a terminal frame so a previous turn cannot clear the next turn's loader", async () => {
  const window = createOfflineWindow();
  const encoder = new TextEncoder();
  const frame = (value: object) => encoder.encode(`data: ${JSON.stringify(value)}\n\n`);

  let turnACancelled = false;
  let turnAReads = 0;
  let turnBController!: ReadableStreamDefaultController<Uint8Array>;
  let callIndex = 0;
  const fetch = vi.fn(async () => {
    if (callIndex++ === 0) {
      return {
        ok: true,
        status: 200,
        body: {
          getReader() {
            return {
              read() {
                turnAReads++;
                if (turnAReads === 1) {
                  return Promise.resolve({
                    done: false,
                    value: new Uint8Array([
                      ...frame({ type: "token", text: "First answer." }),
                      ...frame({ type: "done", reason: "stop" })
                    ])
                  });
                }
                return Promise.resolve({ done: true });
              },
              cancel() {
                turnACancelled = true;
                return Promise.resolve();
              }
            };
          }
        }
      } as unknown as Response;
    }
    const stream = new ReadableStream<Uint8Array>({
      start(controller) { turnBController = controller; }
    });
    return new Response(stream, { headers: { "content-type": "text/event-stream" } });
  });
  Object.defineProperty(window, "fetch", { value: fetch });

  try {
    window.document.write(demoPage({ authenticated: true }));
    const document = window.document;
    const input = document.querySelector("textarea")!;
    const send = document.querySelector<HTMLButtonElement>("#send")!;
    const submitText = (value: string) => {
      input.value = value;
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
      send.click();
    };

    // Turn A finishes on its done frame, cancels its reader, and makes no further reads.
    submitText("First question");
    await vi.waitFor(() => {
      expect(send.disabled).toBe(false);
      expect(turnACancelled).toBe(true);
    });
    expect(turnAReads).toBe(1);

    // User immediately sends Turn B; Turn B stays busy with no spurious warning.
    submitText("Second question");
    await vi.waitFor(() => expect(turnBController).toBeDefined());
    turnBController.enqueue(frame({ type: "ready" }));
    await vi.waitFor(() => {
      expect(send.disabled).toBe(true);
      expect(send.classList.contains("is-loading")).toBe(true);
      expect(send.querySelector(".btn-label")?.textContent).toBe("Working…");
    });
    expect(turnAReads).toBe(1);
    expect(document.querySelector("#sysnote")?.textContent).toBe("");

    // Turn B finishes normally on its own done frame.
    turnBController.enqueue(frame({ type: "token", text: "Second answer." }));
    turnBController.enqueue(frame({ type: "done", reason: "stop" }));
    await vi.waitFor(() => {
      expect(send.disabled).toBe(false);
      expect(send.classList.contains("is-loading")).toBe(false);
      expect(send.querySelector(".btn-label")?.textContent).toBe("Send");
    });
    expect(document.querySelector("#sysnote")?.textContent).toBe("");
    expect([...document.querySelectorAll(".msg.assistant")].map((n) => n.textContent)).toEqual([
      "First answer.",
      "Second answer."
    ]);
  } finally {
    await window.happyDOM.close();
  }
});

it("runs the locked Playground gate through ToS gating, pending loader, modifier clicks, and pageshow reset", async () => {
  const window = createOfflineWindow();
  try {
    window.document.write(demoPage({ authenticated: false }));
    const document = window.document;
    const gate = document.querySelector(".gate")!;
    const signin = document.querySelector<HTMLAnchorElement>("#signin")!;
    const tos = document.querySelector<HTMLInputElement>("#tos-agree")!;
    const status = document.querySelector("#signin-status")!;

    expect(signin.getAttribute("aria-disabled")).toBe("true");
    expect(signin.classList.contains("is-loading")).toBe(false);

    // Clicking while ToS is unchecked is blocked and stays idle.
    const blocked = new window.MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    signin.dispatchEvent(blocked);
    expect(blocked.defaultPrevented).toBe(true);
    expect(signin.classList.contains("is-loading")).toBe(false);

    // Checking ToS enables sign-in; modifier-click (new tab) does not lock the current tab.
    tos.checked = true;
    tos.dispatchEvent(new window.Event("change", { bubbles: true }));
    expect(signin.getAttribute("aria-disabled")).toBeNull();

    const modClick = new window.MouseEvent("click", { bubbles: true, cancelable: true, button: 0, metaKey: true });
    signin.dispatchEvent(modClick);
    expect(modClick.defaultPrevented).toBe(false);
    expect(signin.classList.contains("is-loading")).toBe(false);

    // Prevent happy-dom from navigating on normal click while observing our listener's decision.
    const seen: boolean[] = [];
    signin.addEventListener("click", (event) => {
      seen.push(event.defaultPrevented);
      event.preventDefault();
    });

    const first = new window.MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    signin.dispatchEvent(first);
    expect(seen).toEqual([false]);
    expect(gate.classList.contains("is-busy")).toBe(true);
    expect(signin.classList.contains("is-loading")).toBe(true);
    expect(signin.getAttribute("aria-busy")).toBe("true");
    expect(signin.getAttribute("aria-disabled")).toBe("true");
    expect(signin.querySelector(".btn-label")?.textContent).toBe("Signing in…");
    expect(status.textContent).toBe("Continuing to WorkOS…");

    // Duplicate click while navigating is prevented.
    const second = new window.MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    signin.dispatchEvent(second);
    expect(seen).toEqual([false, true]);

    // Browser Back (bfcache pageshow) resets the gate cleanly.
    window.dispatchEvent(new window.Event("pageshow"));
    expect(gate.classList.contains("is-busy")).toBe(false);
    expect(signin.classList.contains("is-loading")).toBe(false);
    expect(signin.getAttribute("aria-busy")).toBeNull();
    expect(signin.getAttribute("aria-disabled")).toBeNull();
    expect(signin.querySelector(".btn-label")?.textContent).toBe("Sign in to try it");
    expect(status.textContent).toBe("");
  } finally {
    await window.happyDOM.close();
  }
});
