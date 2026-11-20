/**
 * Auto-escaping HTML tagged template for server-rendered pages.
 * Interpolations are HTML-escaped by default unless wrapped in `raw(...)` or
 * returned by a nested `html` template. Booleans and nullish values render `""`.
 */

/** Marks a string as already-safe HTML so `html` emits it without escaping. */
export class RawHtml {
  constructor(readonly value: string) {}
  toString(): string {
    return this.value;
  }
}

/** Wrap known-safe HTML so it passes through `html` interpolation unescaped. */
export function raw(value: string): RawHtml {
  return new RawHtml(value);
}

/** Escape the five HTML-significant characters. The canonical project escaper. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export type Html = RawHtml | string | number | boolean | null | undefined | Html[];

function render(value: Html): string {
  if (value == null || typeof value === "boolean") return "";
  if (value instanceof RawHtml) return value.value;
  if (Array.isArray(value)) {
    let out = "";
    for (const item of value) out += render(item);
    return out;
  }
  if (typeof value === "number") return String(value);
  return escapeHtml(value);
}

/**
 * Tagged template that auto-escapes interpolations. Returns `RawHtml` so
 * results compose without double-escaping; call `.toString()` (or coerce with
 * `+`/`String(...)`) at the response boundary to get the final string.
 */
export function html(strings: TemplateStringsArray, ...values: Html[]): RawHtml {
  let out = strings[0] ?? "";
  for (let i = 0; i < values.length; i++) {
    out += render(values[i]) + (strings[i + 1] ?? "");
  }
  return new RawHtml(out);
}
