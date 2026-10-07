// Brand SVGs served from raven.stellar.org for external listings that require
// a self-hosted image (the Claude connector directory's icon and logo slots).
// Built from RAVEN_PATH so the served mark cannot drift from the site; the
// masters in assets/brand/ must equal these strings (test/auth.test.ts).
import { RAVEN_PATH } from "./site";

const MARK = `<path d="${RAVEN_PATH}" fill="#FF5500"/>`;

function logo(wordmark: string, label: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 72" width="360" height="72">
  <g transform="translate(6 14) scale(1.83)">${MARK}</g>
  <text x="86" y="34" font-family="'IBM Plex Serif',Georgia,serif" font-weight="600" font-size="28" letter-spacing="-0.4" fill="${wordmark}">Stellar Raven</text>
  <text x="88" y="54" font-family="'IBM Plex Mono',ui-monospace,monospace" font-weight="500" font-size="12" letter-spacing="2.9" fill="${label}">CODEMODE</text>
</svg>
`;
}

/** Public path -> SVG body. Paths match the file names in assets/brand/. */
export const BRAND_SVGS: ReadonlyMap<string, string> = new Map([
  [
    "/raven-icon.svg",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <g transform="translate(-51.2 -51.2) scale(25.6)">${MARK}</g>
</svg>
`
  ],
  // Light wordmark for dark pages, dark wordmark for light pages.
  ["/raven-logo-dark.svg", logo("#EEF0E2", "#9AA890")],
  ["/raven-logo-light.svg", logo("#151F14", "#6B7A63")]
]);
