import { pathToFileURL } from "node:url";

export function isMain(url) {
  return process.argv[1] !== undefined && url === pathToFileURL(process.argv[1]).href;
}

export function existingServerUrl(argv = process.argv.slice(2)) {
  if (argv.length !== 2 || argv[0] !== "--base-url") {
    throw new Error("Usage: node <script> --base-url <existing local server URL>");
  }
  const url = new URL(argv[1]);
  if (url.protocol !== "http:" || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
      || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("--base-url must name an existing local HTTP server origin");
  }
  return url.origin;
}

export function parseRpc(text) {
  const lines = text.split("\n").filter((line) => line.startsWith("data:"));
  return JSON.parse(lines.length ? lines.at(-1).slice(5).trim() : text);
}

export async function mcpCall(base, name, args) {
  const response = await fetch(`${base}/mcp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } })
  });
  if (!response.ok) throw new Error(`MCP HTTP ${response.status}`);
  const parsed = parseRpc(await response.text());
  if (parsed.error) return { isError: true, text: JSON.stringify(parsed.error) };
  const result = parsed.result ?? {};
  return { isError: Boolean(result.isError), text: (result.content ?? []).map((part) => part.text).join("\n") };
}
