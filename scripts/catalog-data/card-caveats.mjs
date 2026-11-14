/**
 * Protected caveats for compact search cards. A search card keeps the first
 * 220 characters of an operation's description, which drops a caveat stated
 * later in it. An entry here restates that caveat in one line, and the card
 * renderer keeps it inside the same 220 characters (src/mcp/tools.ts).
 *
 * Add an operation only when its full description already states the caveat
 * and a reader who misses it would state something false from a successful
 * result. The envelope and the server instructions already say that an empty
 * result is not absence and that a semantic row is a candidate: do not repeat
 * those here. Keys are exact exposed operation ids; the catalog builder fails
 * on an unknown key or an over-long line. The text never feeds search scoring.
 */
export const CARD_CAVEAT_MAX_CHARS = 135;

export const CARD_CAVEATS = Object.freeze({
  "lumenloop.find_content_by_entity":
    "Person: ok with empty groups shows only that this lookup linked nothing, not absence or a soft-empty; verify identity, source, date.",
  "lumenloop.find_av_passages":
    "start_offset orders passages; it is not a playback timestamp. created_at is not the recording date.",
  "scout.analyzeEcosystem":
    "gaps, developers and toolchain are supply-side and as-of dated: never demand or a headcount.",
  "scout.getHackathon":
    "Winner order is a ranking only where placementRank is a number; otherwise list position means nothing.",
  "scout.getLeaderboard":
    "tvl null means no figure, never zero. issues is the open backlog, not activity.",
  "scout.getStablecoins":
    "Compare marketCapUSD, not raw supply across pegs. null is unmeasured, never zero; check basis.",
  "scout.listAudits":
    "Absent means no audit on record here, not unaudited. null finding counts are not extracted, not zero.",
  "scout.searchRepos":
    "repoScore, stars and rank are discovery metadata, not security, license, audit or production evidence."
});
