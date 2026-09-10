import { describe, expect, it } from "vitest";
import { consentPage } from "../src/site";

const consent = {
  clientName: "Example client",
  scopes: ["mcp"],
  csrfToken: "test-csrf",
  formAction: "/authorize?client_id=example",
  redirectDestination: "https://client.example/oauth/callback"
};

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

  it("requires Terms for approval and permits cancellation without agreement", () => {
    const page = consentPage(consent);

    expect(page).toContain('name="tos_agree" id="tos-agree" required');
    expect(page).toContain('name="decision" value="deny" formnovalidate>Cancel</button>');
    expect(page).toContain('name="csrf_token" value="test-csrf"');
    expect(page).toContain("Sign in and connect");
    expect(page).not.toContain("<script");
  });
});
