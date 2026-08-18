/**
 * Tests for the auto-escaping `html` template helper (src/html.ts).
 * The load-bearing property is that interpolations escape by default and
 * only `raw()` / nested `html` pass through unescaped.
 */
import { describe, expect, it } from "vitest";
import { html, raw, escapeHtml, RawHtml } from "../src/html";
import { renderPublicHeadMetadata } from "../src/site";

describe("escapeHtml", () => {
  it("escapes the five significant characters", () => {
    expect(escapeHtml(`<a href="x" data-y='z'>&</a>`)).toBe(
      "&lt;a href=&quot;x&quot; data-y=&#039;z&#039;&gt;&amp;&lt;/a&gt;"
    );
  });
});

describe("html tagged template", () => {
  it("escapes interpolated strings by default", () => {
    const evil = `<script>alert("x")</script>`;
    const out = html`<p>${evil}</p>`.toString();
    expect(out).toBe("<p>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;</p>");
    expect(out).not.toContain("<script>");
  });

  it("treats the static parts of the template as trusted markup", () => {
    expect(html`<b class="x">hi</b>`.toString()).toBe(`<b class="x">hi</b>`);
  });

  it("passes raw() through without escaping", () => {
    expect(html`<div>${raw("<b>bold</b>")}</div>`.toString()).toBe("<div><b>bold</b></div>");
  });

  it("composes nested html without double-escaping", () => {
    const inner = html`<li>${"a & b"}</li>`;
    expect(html`<ul>${inner}</ul>`.toString()).toBe("<ul><li>a &amp; b</li></ul>");
  });

  it("renders arrays element-by-element with per-element escaping", () => {
    const items = ["a<", "b&"];
    const out = html`<ul>${items.map((i) => html`<li>${i}</li>`)}</ul>`.toString();
    expect(out).toBe("<ul><li>a&lt;</li><li>b&amp;</li></ul>");
  });

  it("renders null, undefined, and booleans as empty (guard patterns)", () => {
    const show = false;
    expect(html`<p>${null}${undefined}${show && html`x`}</p>`.toString()).toBe("<p></p>");
  });

  it("renders numbers as their string form, unescaped", () => {
    expect(html`<span>${42}</span>`.toString()).toBe("<span>42</span>");
  });

  it("returns a RawHtml that coerces to its string via +", () => {
    const r = html`<i>${"x"}</i>`;
    expect(r).toBeInstanceOf(RawHtml);
    expect("" + r).toBe("<i>x</i>");
  });
});

describe("renderPublicHeadMetadata", () => {
  it("escapes its inputs and returns no page shell, CSS, or extra markup", () => {
    const out = renderPublicHeadMetadata({
      title: `<script>"title"</script>`,
      description: `description's & detail`,
      path: `/path?next="quoted"&other=<tag>`,
      noindex: true
    });

    expect(out).toContain("<title>&lt;script&gt;&quot;title&quot;&lt;/script&gt;</title>");
    expect(out).toContain('content="description&#039;s &amp; detail"');
    expect(out).toContain(
      'href="https://raven.stellar.org/path?next=&quot;quoted&quot;&amp;other=&lt;tag&gt;"'
    );
    expect(out).toContain('<meta name="robots" content="noindex"/>');
    expect(out).not.toContain("<script>");
    expect(out).not.toContain("<style>");
    expect(out).not.toContain("<!doctype html>");
    expect(out).not.toContain("<head>");
  });
});
