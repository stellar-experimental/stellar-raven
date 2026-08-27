/**
 * Class-level entity identities that help catalog routes match alternate
 * names. Every alias pack must cite a checked-in receipt that proves all
 * names identify the same entity class. Do not add aliases from an eval
 * question or answer without that independent receipt standard.
 */
export const KNOWN_ALIAS_PACKS = Object.freeze([
  {
    // WisdomTree's live stellar.toml records code CRDT, anchor asset CRDYX,
    // and the full fund name in one currency record.
    provenance: [
      {
        path: "research/qa-deep-dive-2026-08-25/receipts/wisdomtree-live-sources.json",
        sha256: "49df01cdaaf1368881dd643ff53c93d2fa238bfa39fb7eaa6d4efea4eb8bedb6"
      },
      {
        path: "research/qa-deep-dive-2026-08-25/receipts/wisdomtree-toml.txt",
        sha256: "773b534176e3a9b7bdc9671568226d15978192fed4914725d786534a8168c156"
      }
    ],
    aliases: [
      "CRDT",
      "CRDYX",
      "WisdomTree Private Credit and Alternative Income Digital Fund",
      "WisdomTree Private Credit"
    ],
    triggers: ["CRDT", "CRDYX", "WisdomTree"],
    entryIds: [
      "lumenloop.find_content_by_entity"
    ]
  }
]);
