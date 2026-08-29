import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { validateCaseFile } from "../eval/qa/compile-qa.mjs";
import { decodeStrkey, findStrkeyCandidates, strkeyFindings } from "../eval/qa/strkey.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ACCOUNT = "GBWMQUGPPLSC62YPGD5CEHATOQRQMNLNAV2TMEXJ4ZYOTY4TJD6J2P45";
const CONTRACT = "CBQDK4Y3B2RYUSXE6JYYTHB6AIW655FPGE4OW7A2BWDZXZ5RALQ3UK3P";
const SEP_ACCOUNT = "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ";
const SEP_CONTRACT = "CA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUWDA";
const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

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

function base32Encode(bytes) {
  let output = "";
  let bits = 0;
  let bitCount = 0;
  for (const byte of bytes) {
    bits = (bits << 8) | byte;
    bitCount += 8;
    while (bitCount >= 5) {
      bitCount -= 5;
      output += BASE32[(bits >> bitCount) & 0x1f];
      bits &= (1 << bitCount) - 1;
    }
  }
  if (bitCount > 0) output += BASE32[(bits << (5 - bitCount)) & 0x1f];
  return output;
}

function encodeForVersion(version, payload) {
  const body = Uint8Array.from([version, ...payload]);
  const checksum = crc16XModem(body);
  return base32Encode(Uint8Array.from([...body, checksum & 0xff, checksum >> 8]));
}

function mutate(text, index = 10) {
  const replacement = text[index] === "A" ? "B" : "A";
  return `${text.slice(0, index)}${replacement}${text.slice(index + 1)}`;
}

describe("QA strkey validation", () => {
  it("decodes valid account and contract keys, including SEP-23 vectors", () => {
    for (const key of [ACCOUNT, SEP_ACCOUNT]) {
      expect(decodeStrkey(key)).toMatchObject({ ok: true, version: "account" });
    }
    for (const key of [CONTRACT, SEP_CONTRACT]) {
      expect(decodeStrkey(key)).toMatchObject({ ok: true, version: "contract" });
    }
  });

  it.each([
    ["account", ACCOUNT],
    ["contract", CONTRACT]
  ])("rejects transcription, length, and alphabet defects in a %s key", (_type, key) => {
    expect(decodeStrkey(mutate(key))).toMatchObject({ ok: false, reason: expect.stringMatching(/CRC16/) });
    expect(decodeStrkey(key.slice(0, -1))).toMatchObject({ ok: false });
    expect(decodeStrkey(`${key.slice(0, 8)}0${key.slice(9)}`)).toMatchObject({
      ok: false,
      reason: expect.stringMatching(/non-base32/)
    });
  });

  it("derives the decoded type from a valid version byte and rejects an unknown version", () => {
    const accountPayload = decodeStrkey(SEP_ACCOUNT).payload;
    const contractPayload = decodeStrkey(SEP_CONTRACT).payload;

    expect(decodeStrkey(encodeForVersion(2 << 3, accountPayload))).toMatchObject({
      ok: true,
      version: "contract"
    });
    expect(decodeStrkey(encodeForVersion(6 << 3, contractPayload))).toMatchObject({
      ok: true,
      version: "account"
    });
    expect(decodeStrkey(encodeForVersion(7 << 3, accountPayload))).toMatchObject({
      ok: false,
      reason: expect.stringMatching(/unknown version byte/)
    });
  });

  it.each([
    "GAAAAAAAACGC6",
    "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAACJUR"
  ])("rejects the SEP-23 invalid strkey vector %s", (key) => {
    expect(decodeStrkey(key)).toMatchObject({ ok: false });
  });

  it("finds candidate tokens and reports their JSON paths", () => {
    const broken = mutate(ACCOUNT);
    expect(findStrkeyCandidates(`valid ${CONTRACT}; broken ${broken}`)).toEqual([CONTRACT, broken]);
    expect(strkeyFindings({ golden: { keyFacts: [CONTRACT, `issuer ${broken}`] } })).toEqual([
      { path: "$.golden.keyFacts[1]", token: broken, reason: "CRC16 checksum mismatch" }
    ]);
  });

  it("rejects a CRC-broken strkey through the case compiler hook", () => {
    const source = join(
      ROOT,
      "eval/qa/corpus/battery/defi-ecosystem/q-defi-wisdomtree-crdt.json"
    );
    const kase = JSON.parse(readFileSync(source, "utf8"));
    const broken = mutate(ACCOUNT);
    kase.golden.answer = kase.golden.answer.replace(ACCOUNT, broken);

    const tempRoot = mkdtempSync(join(tmpdir(), "qa-strkey-"));
    const file = join(tempRoot, "defi-ecosystem", `${kase.id}.json`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify(kase, null, 2)}\n`);

    try {
      expect(() => validateCaseFile(file)).toThrow(
        expect.objectContaining({
          message: expect.stringContaining(`invalid strkey at $.golden.answer: ${broken}`)
        })
      );
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
