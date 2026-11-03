import { Response as MiniflareResponse } from "miniflare";

export function responseBrand(value) {
  if (value instanceof Response) return "node-response";
  if (value instanceof MiniflareResponse) return "miniflare-response";
  return "unrecognized";
}

/** Preserve real response data across the documented platform proxy boundary. */
export function normalizeProxyResponse(value) {
  const brand = responseBrand(value);
  if (brand === "node-response") return value;
  if (brand !== "miniflare-response") throw new Error("proxy-response-brand-invalid");
  return new Response(value.body, { status: value.status, statusText: value.statusText, headers: [...value.headers] });
}
