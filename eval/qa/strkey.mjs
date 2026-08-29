/**
 * Dependency-free Stellar strkey validation.
 *
 * Sources:
 * - https://github.com/stellar/js-stellar-base/blob/master/src/strkey.js
 * - https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0023.md
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const BASE32_VALUES = new Map([...BASE32_ALPHABET].map((character, index) => [character, index]));

const VERSION_TYPES = new Map([
  [6 << 3, "account"],
  [18 << 3, "seed"],
  [12 << 3, "muxed"],
  [19 << 3, "preAuthTx"],
  [23 << 3, "hashX"],
  [15 << 3, "signedPayload"],
  [2 << 3, "contract"],
  [11 << 3, "liquidityPool"],
  [1 << 3, "claimableBalance"]
]);

const FIXED_PAYLOAD_LENGTHS = new Map([
  ["account", 32],
  ["seed", 32],
  ["muxed", 40],
  ["preAuthTx", 32],
  ["hashX", 32],
  ["contract", 32],
  ["liquidityPool", 32],
  ["claimableBalance", 33]
]);

function invalid(reason) {
  return { ok: false, reason };
}

function decodeBase32(text) {
  const output = [];
  let bits = 0;
  let bitCount = 0;

  for (const character of text) {
    bits = (bits << 5) | BASE32_VALUES.get(character);
    bitCount += 5;
    while (bitCount >= 8) {
      bitCount -= 8;
      output.push((bits >> bitCount) & 0xff);
      bits &= (1 << bitCount) - 1;
    }
  }

  if (bitCount > 0 && bits !== 0) return invalid("non-zero unused base32 bits");
  return { ok: true, bytes: Uint8Array.from(output) };
}

function encodeBase32(bytes) {
  let output = "";
  let bits = 0;
  let bitCount = 0;

  for (const byte of bytes) {
    bits = (bits << 8) | byte;
    bitCount += 8;
    while (bitCount >= 5) {
      bitCount -= 5;
      output += BASE32_ALPHABET[(bits >> bitCount) & 0x1f];
      bits &= (1 << bitCount) - 1;
    }
  }

  if (bitCount > 0) output += BASE32_ALPHABET[(bits << (5 - bitCount)) & 0x1f];
  return output;
}

function crc16XModem(bytes) {
  let crc = 0;
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) === 0 ? crc << 1 : (crc << 1) ^ 0x1021;
      crc &= 0xffff;
    }
  }
  return crc;
}

function validateSignedPayload(payload) {
  if (payload.length < 40 || payload.length > 100) {
    return "signed payload must contain 32 key bytes, a 4-byte length, and 1-64 padded payload bytes";
  }

  const length = (
    (payload[32] * 0x1000000) +
    (payload[33] << 16) +
    (payload[34] << 8) +
    payload[35]
  );
  if (length < 1 || length > 64) return "signed payload length must be 1-64 bytes";

  const paddedLength = Math.ceil(length / 4) * 4;
  if (payload.length !== 36 + paddedLength) {
    return `signed payload length field ${length} does not match its padded payload`;
  }
  for (let index = 36 + length; index < payload.length; index += 1) {
    if (payload[index] !== 0) return "signed payload padding must contain only zero bytes";
  }
  return undefined;
}

export function decodeStrkey(text) {
  if (typeof text !== "string") return invalid("strkey must be a string");
  if (text.length === 0) return invalid("strkey must not be empty");
  if (text.includes("=")) return invalid("base32 padding is not allowed");
  if (!/^[A-Z2-7]+$/.test(text)) return invalid("strkey contains a non-base32 character");
  if ([1, 3, 6].includes(text.length % 8)) return invalid("invalid unpadded base32 length");

  const decoded = decodeBase32(text);
  if (!decoded.ok) return decoded;
  if (encodeBase32(decoded.bytes) !== text) return invalid("non-canonical base32 encoding");
  if (decoded.bytes.length < 3) return invalid("strkey is too short");

  const body = decoded.bytes.subarray(0, -2);
  const checksum = decoded.bytes.subarray(-2);
  const expectedChecksum = crc16XModem(body);
  const actualChecksum = checksum[0] | (checksum[1] << 8);
  if (actualChecksum !== expectedChecksum) return invalid("CRC16 checksum mismatch");

  const version = VERSION_TYPES.get(body[0]);
  if (version === undefined) return invalid(`unknown version byte ${body[0]}`);
  const payload = body.slice(1);

  if (version === "signedPayload") {
    const reason = validateSignedPayload(payload);
    if (reason !== undefined) return invalid(reason);
  } else {
    const expectedLength = FIXED_PAYLOAD_LENGTHS.get(version);
    if (payload.length !== expectedLength) {
      return invalid(`${version} payload must be ${expectedLength} bytes; got ${payload.length}`);
    }
  }

  if (version === "claimableBalance" && payload[0] !== 0) {
    return invalid(`unknown claimable balance type ${payload[0]}`);
  }

  return { ok: true, version, payload };
}

export function findStrkeyCandidates(text) {
  if (typeof text !== "string") return [];
  return text.match(/\b[GSMTXPCLB][A-Z2-7]{55,}\b/g) ?? [];
}

function childPath(parent, key) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
    ? `${parent}.${key}`
    : `${parent}[${JSON.stringify(key)}]`;
}

export function strkeyFindings(value, path = "$") {
  const findings = [];

  function walk(current, currentPath) {
    if (typeof current === "string") {
      for (const token of findStrkeyCandidates(current)) {
        const result = decodeStrkey(token);
        if (!result.ok) findings.push({ path: currentPath, token, reason: result.reason });
      }
      return;
    }
    if (Array.isArray(current)) {
      current.forEach((item, index) => walk(item, `${currentPath}[${index}]`));
      return;
    }
    if (current !== null && typeof current === "object") {
      for (const [key, item] of Object.entries(current)) walk(item, childPath(currentPath, key));
    }
  }

  walk(value, path);
  return findings;
}
