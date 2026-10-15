// Reduced from stellar/stellar-dev-skill site/src/data/skills.ts, read 2026-10-15.
const ECOSYSTEM_CARD_SOURCES = [
  { title: "Zed", copyValue: "https://example.com/z", description: "First in source order." },
  { title: "Alpha", copyValue: "https://example.com/a", description: "Second in source order." },
] as const;

export const ECOSYSTEM_CARDS = [...ECOSYSTEM_CARD_SOURCES].sort(
  (a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }),
);
