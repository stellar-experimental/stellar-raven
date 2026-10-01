/**
 * Response redaction hook — scrub any accidental secret echo from data that
 * flows toward the sandbox/model (ARCHITECTURE.md result hygiene).
 *
 * Upstreams should never echo our keys, but "should" is not a control: this
 * is a cheap belt-and-braces pass over the SERIALIZED result. Values shorter
 * than 8 chars are ignored (would cause false-positive scrubbing).
 */

const MIN_SECRET_LENGTH = 8;
const REPLACEMENT = "[REDACTED]";

/**
 * Collect the redactable secret values from an env-like object. Every secret
 * the Worker holds is listed so an accidental upstream echo of ANY of them is
 * scrubbed before it reaches the sandbox/model. Named API-key tokens are
 * request data, never host environment values or sandbox inputs.
 *
 * The ALGOLIA_APPLICATION_ID_* names are DELIBERATELY absent: they are
 * semi-public app ids (appear in site payloads / hostnames by design), not
 * secrets — the refresh script even asserts they stay OUT of the generated
 * inventory. Adding them here would scrub public identifiers from
 * legitimate results.
 */
const SECRET_ENV_NAMES = [
  "LUMENLOOP_API_KEY",
  "ALGOLIA_API_KEY_DOCS",
  "ALGOLIA_API_KEY_SITE",
  "MCP_SERVER_SECRET",
  "WORKOS_API_KEY"
] as const;

export function secretsFromEnv(env: Record<string, unknown>): string[] {
  const out: string[] = [];
  for (const name of SECRET_ENV_NAMES) {
    const v = env[name];
    if (typeof v === "string" && v.length >= MIN_SECRET_LENGTH) out.push(v);
  }
  return out;
}

function scrubString(text: string, secrets: string[]): string {
  let out = text;
  for (const secret of secretVariants(secrets)) {
    // split/join — no regex escaping worries for arbitrary key material.
    if (out.includes(secret)) out = out.split(secret).join(REPLACEMENT);
  }
  return out;
}

function secretVariants(secrets: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const secret of secrets) {
    for (const candidate of [secret, jsonEscapedSecret(secret)]) {
      if (!candidate || seen.has(candidate)) continue;
      seen.add(candidate);
      out.push(candidate);
    }
  }
  return out;
}

function jsonEscapedSecret(secret: string): string {
  const encoded = JSON.stringify(secret);
  return encoded.slice(1, -1);
}

/**
 * Deep-redact a JSON-serializable value. Returns the value unchanged (same
 * reference) when no secret occurs anywhere in its serialization — the
 * common case stays allocation-free.
 */
export function redactSecrets<T>(value: T, secrets: string[]): T {
  if (secrets.length === 0) return value;
  if (typeof value === "string") {
    return scrubString(value, secrets) as unknown as T;
  }
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return value; // non-serializable: nothing we can scan
  }
  const variants = secretVariants(secrets);
  if (serialized === undefined || !variants.some((s) => serialized.includes(s))) return value;
  return JSON.parse(scrubString(serialized, variants)) as T;
}
