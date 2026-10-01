import { expect, it, vi } from "vitest";
import { Window, type HTMLButtonElement } from "happy-dom";
import { demoPage } from "../src/demo/page";
import { DEMO_CAPS } from "../src/demo/budget";

it("runs the Playground page through submit, streaming, copy, and length refusal offline", async () => {
  // A separate window runs the complete emitted page, including its inline script.
  // No global DOM replacement or browser download is needed by the Node suite.
  const window = new Window({
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
    expect(document.querySelector(".answer-actions")).toBeNull();

    controller.enqueue(frame({ type: "token", text: last }));
    controller.enqueue(frame({ type: "done", reason: "stop" }));
    controller.close();
    await vi.waitFor(() => expect(send.disabled).toBe(false));
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
