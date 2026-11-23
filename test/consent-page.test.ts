import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  Window,
  type HTMLButtonElement,
  type HTMLElement,
  type HTMLFormElement,
  type HTMLInputElement
} from "happy-dom";
import { CONSENT_HEADERS, consentPage } from "../src/site";

const consent = {
  clientName: "Example client",
  scopes: ["mcp"],
  csrfToken: "test-csrf",
  formAction: "/authorize?client_id=example",
  redirectDestination: "https://client.example/oauth/callback"
};

function extractSingleScript(html: string): string {
  const lower = html.toLowerCase();
  const start = lower.indexOf("<script");
  expect(start).toBeGreaterThanOrEqual(0);
  const openEnd = lower.indexOf(">", start);
  expect(openEnd).toBeGreaterThan(start);
  const closeStart = lower.indexOf("</script>", openEnd + 1);
  expect(closeStart).toBeGreaterThan(openEnd);
  expect(lower.indexOf("<script", closeStart + "</script>".length)).toBe(-1);
  return html.slice(openEnd + 1, closeStart);
}

function createOfflineConsentWindow() {
  return new Window({
    url: "https://raven.stellar.org/authorize?client_id=example",
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

describe("consent page", () => {
  it("renders client metadata and the complete return address as text", () => {
    const page = consentPage({
      ...consent,
      clientName: 'Example <Client> & "Tools"',
      redirectDestination: "https://client.example/callback?first=1&second=2"
    });

    expect(page).toContain("Example &lt;Client&gt; &amp; &quot;Tools&quot;");
    expect(page).not.toContain("<Client>");
    expect(page).toContain('<code dir="ltr">https://client.example/callback?first=1&amp;second=2</code>');
    expect(page).not.toContain('href="https://client.example');
    expect(page).toContain("not verified by Stellar Raven");
  });

  it("preserves a long native return address without truncating its path or query", () => {
    const redirectDestination = `com.example.client:/oauth/${"callback/".repeat(40)}?request=example`;
    const page = consentPage({ ...consent, redirectDestination });

    expect(page).toContain(`<code dir="ltr">${redirectDestination}</code>`);
  });

  it("shows the browser's serialized international hostname and path", () => {
    const page = consentPage({ ...consent, redirectDestination: "https://bücher.example/café" });

    expect(page).toContain('<code dir="ltr">https://xn--bcher-kva.example/caf%C3%A9</code>');
  });

  it("describes an empty scope request without a granted-permission pill", () => {
    const page = consentPage({ ...consent, scopes: [] });

    expect(page).toContain('<p class="scope-empty">No scopes requested.</p>');
    expect(page).not.toContain('<code class="scope-code">');
  });

  it("requires Terms for approval, permits cancellation without agreement, and pins its static script by sha256", () => {
    const page = consentPage(consent);
    const other = consentPage({
      clientName: 'Other </script><script>alert(1)</script>',
      scopes: ["mcp", "other"],
      csrfToken: "other-csrf",
      formAction: "/authorize?client_id=other",
      redirectDestination: "https://other.example/cb"
    });

    expect(page).toContain('name="tos_agree" id="tos-agree" required');
    expect(page).toContain('id="consent-cancel" name="decision" value="deny" formnovalidate');
    expect(page).toContain('name="csrf_token" value="test-csrf"');
    expect(page).toContain("Sign in and connect");

    const script = extractSingleScript(page);
    expect(extractSingleScript(other)).toBe(script);
    const hash = createHash("sha256").update(script, "utf8").digest("base64");
    const csp = CONSENT_HEADERS["content-security-policy"] ?? "";
    expect(csp).toContain(`script-src 'sha256-${hash}'`);
    expect(csp).not.toContain("unsafe-eval");
    expect(csp.includes("script-src 'unsafe-inline'")).toBe(false);
    expect(csp).not.toContain("form-action");
  });

  it("shows pending state on approve/cancel with full FormData, keeps live status outside aria-busy, bounds native Cancel handoff, and resets on pageshow", async () => {
    const window = createOfflineConsentWindow();
    try {
      const scheduled: Array<{ id: number; fn: () => void; ms: number; cleared: boolean }> = [];
      let nextTimerId = 1;
      window.setTimeout = ((fn: () => void, ms?: number) => {
        const entry = { id: nextTimerId++, fn, ms: ms ?? 0, cleared: false };
        scheduled.push(entry);
        return entry.id;
      }) as unknown as typeof window.setTimeout;
      window.clearTimeout = ((id: number) => {
        const entry = scheduled.find((item) => item.id === id);
        if (entry) entry.cleared = true;
      }) as unknown as typeof window.clearTimeout;

      window.document.write(consentPage(consent));
      const document = window.document;
      const form = document.querySelector<HTMLFormElement>("#consent-form")!;
      const approve = document.querySelector<HTMLButtonElement>("#consent-approve")!;
      const cancel = document.querySelector<HTMLButtonElement>("#consent-cancel")!;
      const tos = document.querySelector<HTMLInputElement>("#tos-agree")!;
      const status = document.querySelector("#consent-status")!;
      const handoff = document.querySelector<HTMLElement>("#consent-handoff")!;

      // Live status and handoff notice stay outside the aria-busy form so AT announces immediately.
      expect(form.contains(status)).toBe(false);
      expect(form.contains(handoff)).toBe(false);
      expect(handoff.hidden).toBe(true);

      const submitEvents: { defaultPrevented: boolean; formData: [string, unknown][] }[] = [];
      form.addEventListener("submit", (event) => {
        const submitter = (event as unknown as { submitter?: HTMLElement | null }).submitter ?? null;
        const formData = new (window.FormData as unknown as new (
          f: HTMLFormElement,
          s?: HTMLElement | null
        ) => Iterable<[string, unknown]>)(form, submitter);
        submitEvents.push({
          defaultPrevented: event.defaultPrevented,
          formData: [...formData]
        });
        event.preventDefault();
      });

      // Clicking Approve before checking Terms fails native validation: no submit, no loader.
      approve.click();
      expect(submitEvents).toHaveLength(0);
      expect(form.classList.contains("is-busy")).toBe(false);
      expect(approve.classList.contains("is-loading")).toBe(false);

      // Approve submission enters loading state while preserving csrf_token and tos_agree in FormData.
      tos.checked = true;
      approve.click();

      expect(submitEvents).toHaveLength(1);
      expect(submitEvents[0]!.defaultPrevented).toBe(false);
      expect(submitEvents[0]!.formData).toEqual([
        ["csrf_token", "test-csrf"],
        ["tos_agree", "on"]
      ]);
      expect(form.classList.contains("is-busy")).toBe(true);
      expect(form.getAttribute("aria-busy")).toBe("true");
      expect(approve.classList.contains("is-loading")).toBe(true);
      expect(approve.querySelector(".btn-label")?.textContent).toBe("Continuing to WorkOS…");
      expect(approve.disabled).toBe(false);
      expect(cancel.disabled).toBe(false);
      expect(tos.disabled).toBe(false);
      expect(approve.getAttribute("aria-disabled")).toBe("true");
      expect(cancel.getAttribute("aria-disabled")).toBe("true");
      expect(status.textContent).toBe("Continuing to WorkOS…");
      expect(scheduled).toHaveLength(0);

      // Second submit while busy is prevented (both click and direct submit event).
      approve.click();
      expect(submitEvents).toHaveLength(1);
      const duplicateSubmit = new window.Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(duplicateSubmit, "submitter", { value: approve });
      form.dispatchEvent(duplicateSubmit);
      expect(submitEvents[1]!.defaultPrevented).toBe(true);

      // Browser Back (bfcache pageshow) restores controls cleanly.
      window.dispatchEvent(new window.Event("pageshow"));
      expect(form.classList.contains("is-busy")).toBe(false);
      expect(form.getAttribute("aria-busy")).toBeNull();
      expect(approve.classList.contains("is-loading")).toBe(false);
      expect(approve.querySelector(".btn-label")?.textContent).toBe("Sign in and connect");
      expect(approve.getAttribute("aria-disabled")).toBeNull();
      expect(status.textContent).toBe("");

      // Cancel submission works without Terms (formnovalidate) and submits decision=deny.
      tos.checked = false;
      cancel.click();
      expect(submitEvents).toHaveLength(3);
      expect(submitEvents[2]!.defaultPrevented).toBe(false);
      expect(submitEvents[2]!.formData).toEqual([
        ["csrf_token", "test-csrf"],
        ["decision", "deny"]
      ]);
      expect(cancel.classList.contains("is-loading")).toBe(true);
      expect(cancel.disabled).toBe(false);
      expect(cancel.querySelector(".btn-label")?.textContent).toBe("Cancelling…");
      expect(approve.classList.contains("is-loading")).toBe(false);
      expect(status.textContent).toBe("Cancelling authorization…");
      expect(handoff.hidden).toBe(true);
      expect(scheduled).toHaveLength(1);
      expect(scheduled[0]!.ms).toBe(4000);

      // If a native-app handoff keeps this document visible with no lifecycle event,
      // the pending spinner settles after a bounded delay with conditional recovery instructions.
      scheduled[0]!.fn();
      expect(cancel.classList.contains("is-loading")).toBe(false);
      expect(form.getAttribute("aria-busy")).toBeNull();
      expect(cancel.querySelector(".btn-label")?.textContent).toBe("Cancellation requested");
      expect(handoff.hidden).toBe(false);
      expect(handoff.textContent).toContain("Cancellation requested. If your app opened, you can close this tab");
      expect(handoff.querySelector("a")?.getAttribute("href")).toBe("/authorize?client_id=example");
      expect(status.textContent).toBe(
        "Cancellation requested. If your app opened, you can close this tab — or start a new request."
      );

      // A subsequent pageshow still clears the settled state completely.
      window.dispatchEvent(new window.Event("pageshow"));
      expect(handoff.hidden).toBe(true);
      expect(form.classList.contains("is-busy")).toBe(false);
      expect(cancel.querySelector(".btn-label")?.textContent).toBe("Cancel");
      expect(status.textContent).toBe("");

      // A pageshow before the timer fires cancels the pending settle timer.
      cancel.click();
      expect(scheduled).toHaveLength(2);
      window.dispatchEvent(new window.Event("pageshow"));
      expect(scheduled[1]!.cleared).toBe(true);
    } finally {
      await window.happyDOM.close();
    }
  });
});
