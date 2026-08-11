/**
 * Public presentation surface for stellar-raven-codemode.
 *
 * Two server-rendered pages, one visual system:
 *   - landingPage()  → GET /            (public marketing page)
 *   - consentPage()  → GET /authorize   (OAuth consent, rendered by workos.ts)
 *
 * Design — "dithered signal": a dark-green field (#151f14) with a single hot
 * orange (#ff5500), a Bayer-dithered orange globe rising out of the bottom-left
 * corner (a faithful port of Paper's Dithering `sphere` shader, hand-written in
 * inline WebGL2 so the page stays self-contained). The globe carries the retro /
 * digital signal; the type is the IBM Plex superfamily — Plex Serif (display),
 * Plex Sans (body), Plex Mono (utility), one shared skeleton — set on the right
 * so the copy never fights the animation. The pitch is benefit-first ("all of
 * Stellar context, one connection"): hero + stat strip + four-pillar bento + one-vs-many
 * contrast; the `search`/`execute` mechanics live in a mono footnote for the
 * technical crowd. The CTA is per-client install (the connect panel).
 *
 * Fully self-contained + CSP-safe: fonts are embedded base64 (font-src data:),
 * the raven marks are inline SVG data URIs (img-src data:), all motion is the
 * one WebGL canvas. The landing page allows inline script (the shader + tab/copy
 * helpers); the consent page stays script-free and hardened.
 */
import {
  PLEX_SERIF_600_WOFF2,
  PLEX_SERIF_700_WOFF2,
  PLEX_SANS_400_WOFF2,
  PLEX_SANS_600_WOFF2,
  PLEX_MONO_400_WOFF2,
  PLEX_MONO_500_WOFF2
} from "./fonts";
import { escapeHtml } from "./html";
import { CONSENT_GLOBE_PNG_BASE64 } from "./consent-globe";

const MCP_ENDPOINT = "https://raven.stellar.org/mcp";
export const HOST = "raven.stellar.org";
export const OG_IMAGE = "https://raven.stellar.org/og.png";

// Orange raven/star mark — reads as both a bird in flight and a four-point
// stellar spark. Inline SVG data URI (favicon) + raw path (in-page marks).
const RAVEN_PATH =
  "M2 14C8 13 10 9 12 4C14 9 16 13 22 14C16 14 13 16 12 20C11 16 8 14 2 14Z";
export const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='" +
  RAVEN_PATH +
  "' fill='%23ff5500'/%3E%3C/svg%3E";

export function ravenSvg(cls: string): string {
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${RAVEN_PATH}"/></svg>`;
}

// ---------------------------------------------------------------------------
// Design system
// ---------------------------------------------------------------------------

function face(family: string, weight: number, b64: string): string {
  return (
    `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;` +
    `src:url(data:font/woff2;base64,${b64}) format('woff2')}`
  );
}

export const FONT_FACE =
  face("IBM Plex Serif", 600, PLEX_SERIF_600_WOFF2) +
  face("IBM Plex Serif", 700, PLEX_SERIF_700_WOFF2) +
  face("IBM Plex Sans", 400, PLEX_SANS_400_WOFF2) +
  face("IBM Plex Sans", 600, PLEX_SANS_600_WOFF2) +
  face("IBM Plex Mono", 400, PLEX_MONO_400_WOFF2) +
  face("IBM Plex Mono", 500, PLEX_MONO_500_WOFF2);

export const TOKENS = `:root{
  --bg:#0e150d; --green:#151f14; --green-2:#182617;
  --orange:#ff5500; --orange-2:#ff7a33; --orange-soft:rgba(255,85,0,.13);
  --fog:#eef0e2; --dim:#9aa890; --ash:#71806a;
  --line:rgba(238,240,226,.12); --line-2:rgba(238,240,226,.22);
  --display:'IBM Plex Serif',Georgia,'Times New Roman',serif;
  --sans:'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  --maxw:1200px;
}`;

export const BASE = `
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--fog);font-family:var(--sans);
  font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;
  min-height:100vh;overflow-x:hidden}
a{color:inherit;text-decoration:none}
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 32px;position:relative;z-index:2}
::selection{background:var(--orange);color:#180a00}

/* the live dither globe — fixed full-bleed canvas + a green fallback under it */
.stage{position:fixed;inset:0;z-index:0;background:var(--green)}
#gl{position:absolute;inset:0;width:100%;height:100%;display:block}
body.no-gl #gl{display:none}
body.no-gl .stage{background:
  radial-gradient(60% 60% at 12% 108%,rgba(255,85,0,.5),rgba(255,85,0,.06) 45%,transparent 66%),var(--green)}
/* legibility scrim: darken the RIGHT column where the copy lives; let the globe
   breathe on the lower-left */
.scrim{position:fixed;inset:0;z-index:1;pointer-events:none;
  background:
    radial-gradient(74% 66% at 84% 44%,rgba(14,21,13,.92),rgba(14,21,13,.55) 44%,transparent 72%),
    linear-gradient(180deg,rgba(14,21,13,.6),transparent 20%),
    radial-gradient(120% 90% at 100% 0%,rgba(255,85,0,.05),transparent 55%)}

.eyebrow{display:inline-flex;align-items:center;gap:12px;font-family:var(--mono);font-size:12px;
  font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:var(--dim)}
.eyebrow .live{display:inline-flex;align-items:center;gap:7px;color:var(--orange)}
.eyebrow .dot{width:7px;height:7px;border-radius:50%;background:var(--orange);
  box-shadow:0 0 0 0 rgba(255,85,0,.7);animation:pulse 2.4s ease-out infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(255,85,0,.55)}70%{box-shadow:0 0 0 10px rgba(255,85,0,0)}100%{box-shadow:0 0 0 0 rgba(255,85,0,0)}}

/* ---- top bar: just the logo, prominent ---- */
.top{position:relative;z-index:5}
.top-in{display:flex;align-items:center;height:92px}
.brand{display:flex;align-items:center;gap:14px}
.brand .rv{width:34px;height:34px;fill:var(--orange);flex:none;filter:drop-shadow(0 0 16px rgba(255,85,0,.55))}
.brand .wm{display:flex;flex-direction:column;line-height:1}
.brand .wm b{font-family:var(--display);font-weight:600;font-size:25px;letter-spacing:-.015em;color:var(--fog)}
.brand .wm i{font-family:var(--mono);font-style:normal;font-size:11px;font-weight:500;letter-spacing:.24em;
  text-transform:uppercase;color:var(--dim);margin-top:5px}
.top-nav{margin-left:auto;display:flex;align-items:center;gap:10px}
.top-nav .btn-ghost{padding:9px 15px;font-size:12px}

/* ---- buttons ---- */
.btn{display:inline-flex;align-items:center;gap:9px;font-family:var(--sans);font-weight:600;
  font-size:15px;padding:13px 20px;border-radius:12px;border:1px solid transparent;cursor:pointer;
  line-height:1;white-space:nowrap;transition:transform .15s ease,box-shadow .2s,background .2s,color .2s,border-color .2s}
.btn:active{transform:translateY(1px)}
.btn-primary{background:var(--orange);color:#180a00;box-shadow:0 12px 36px -12px rgba(255,85,0,.8)}
.btn-primary:hover{background:var(--orange-2);box-shadow:0 16px 44px -12px rgba(255,85,0,.95);transform:translateY(-2px)}
.btn-ghost{background:transparent;color:var(--dim);border-color:var(--line-2);font-family:var(--mono);
  font-weight:500;font-size:11px;letter-spacing:.02em;padding:8px 13px;border-radius:9px}
.btn-ghost:hover{border-color:var(--orange);color:var(--fog)}
.btn-outline{background:transparent;color:var(--fog);border-color:var(--line-2)}
.btn-outline:hover{border-color:var(--orange);color:var(--orange);transform:translateY(-2px)}
.btn:focus-visible,a:focus-visible,button:focus-visible{outline:2px solid var(--orange);outline-offset:3px}

/* ---- hero: copy in a right-aligned column, clear of the globe ---- */
.hero{position:relative;min-height:calc(100vh - 92px);display:flex;flex-direction:column;
  justify-content:center;padding:32px 0 60px}
.hero-in{max-width:700px;margin-left:auto}
h1.title{font-family:var(--display);font-weight:700;margin:22px 0 0;line-height:.98;
  font-size:clamp(52px,8vw,104px);letter-spacing:-.025em;color:var(--fog)}
h1.title .r{color:var(--orange);text-shadow:0 0 40px rgba(255,85,0,.35)}
.lede{font-size:clamp(16px,1.7vw,19px);color:var(--fog);opacity:.94;max-width:46ch;margin:24px 0 0;line-height:1.6}
.lede b{font-weight:600}
.lede code{font-family:var(--mono);font-size:.85em;font-weight:500;color:var(--orange);background:var(--orange-soft);
  border:1px solid rgba(255,85,0,.24);padding:1px 6px;border-radius:6px;white-space:nowrap}

/* ---- connect panel (the CTA) ---- */
.connect{margin-top:34px;border:1px solid var(--line-2);border-radius:16px;overflow:hidden;
  background:linear-gradient(180deg,rgba(24,38,23,.74),rgba(14,21,13,.7));
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  box-shadow:0 30px 70px -34px rgba(0,0,0,.75),inset 0 1px 0 rgba(238,240,226,.05)}
.connect-head{display:flex;align-items:center;gap:11px;padding:16px 18px;border-bottom:1px solid var(--line)}
.connect-head .h{font-family:var(--sans);font-weight:600;font-size:14px;color:var(--fog)}
.connect-head .end{margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--dim);
  display:flex;align-items:center;gap:8px}
.connect-head .end .rv{width:15px;height:15px;fill:var(--orange)}
.connect-head .end b{color:var(--orange);font-weight:500}
/* client tabs: cut from the terminal's own material and joined to it (active tab
   shares the term fill, drops its bottom border, and overlaps the term's top edge
   by 1px so there's no seam). Strip is inset past the term's rounded corner. */
.tabs{display:flex;gap:3px;overflow-x:auto;overflow-y:hidden;touch-action:pan-x;overscroll-behavior-x:contain;
  padding:14px 12px 0 24px;scrollbar-width:none;position:relative;z-index:1}
.tabs::-webkit-scrollbar{display:none}
.tab{font-family:var(--mono);font-size:12px;font-weight:500;padding:8px 15px 11px;border:1px solid transparent;
  border-bottom:0;border-radius:10px 10px 0 0;color:var(--dim);cursor:pointer;white-space:nowrap;
  background:transparent;position:relative;transition:color .15s,background .15s,border-color .15s}
.tab:hover{color:var(--fog);background:rgba(238,240,226,.045)}
.tab.active{color:var(--orange);background:rgba(6,10,6,.82);border-color:var(--line);margin-bottom:-1px;z-index:3}
.term{position:relative;margin:0 12px 12px;border:1px solid var(--line);border-radius:12px;background:rgba(6,10,6,.82);overflow:hidden}
.term-bar{display:flex;align-items:center;gap:7px;padding:11px 14px;border-bottom:1px solid var(--line)}
.tl{width:10px;height:10px;border-radius:50%}.tl.r{background:#ff5f57}.tl.y{background:#febc2e}.tl.g{background:#28c840}
.term-name{margin-left:8px;font-family:var(--mono);font-size:11.5px;color:var(--ash)}
.term-copy{margin-left:auto}
.panel{display:none}.panel.active{display:block}
pre.code{margin:0;padding:16px 18px;font-family:var(--mono);font-size:12.5px;line-height:1.72;
  color:#d3dac8;white-space:pre;overflow-x:auto;overflow-y:hidden;touch-action:pan-x;overscroll-behavior-x:contain}
pre.code .c{color:var(--ash);font-style:italic}
pre.code .p{color:var(--fog)}
pre.code .s{color:var(--orange-2)}
pre.code .k{color:#93d6a6}
.connect-foot{display:flex;flex-wrap:wrap;gap:6px 18px;padding:4px 18px 12px;font-family:var(--sans);
  font-size:12.5px;color:var(--dim)}
.connect-foot .tk{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.connect-foot .tk::before{content:"✓";color:var(--orange);font-weight:600}
.connect-foot b{color:var(--fog);font-weight:600}
.connect-legal{padding:0 18px 16px;font-family:var(--sans);font-size:11.5px;color:var(--ash);line-height:1.55}
.connect-legal a{color:var(--dim);text-decoration:underline;text-underline-offset:2px}
.connect-legal a:hover{color:var(--orange)}
.copied{color:var(--orange)!important;border-color:var(--orange)!important}

/* ---- below-the-fold sections: frosted-glass field over the globe ---- */
/* Two layers ramping in together over ~155px: a light dark wash (never fully
   opaque, so the dither keeps glowing through) and a masked backdrop blur that
   melts the dots into soft fog before any content appears. */
.below{position:relative;z-index:2;
  background:linear-gradient(180deg,transparent,
    rgba(14,21,13,.2) 30px,rgba(14,21,13,.42) 60px,rgba(14,21,13,.58) 90px,
    rgba(14,21,13,.68) 120px,rgba(14,21,13,.72) 155px)}
.below::before{content:"";position:absolute;inset:0;pointer-events:none;
  backdrop-filter:blur(10px) saturate(.9);-webkit-backdrop-filter:blur(10px) saturate(.9);
  mask-image:linear-gradient(180deg,transparent,#000 150px);
  -webkit-mask-image:linear-gradient(180deg,transparent,#000 150px)}
.below>*{position:relative;z-index:1}
/* no backdrop-filter support -> the sharp dither would sit right behind copy;
   fall back to the near-opaque field */
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){
  .below{background:linear-gradient(180deg,transparent,
    rgba(14,21,13,.32) 30px,rgba(14,21,13,.6) 60px,rgba(14,21,13,.8) 90px,
    rgba(14,21,13,.92) 120px,rgba(14,21,13,.96) 155px)}
  footer{background:rgba(14,21,13,.96)}
}
.sec{max-width:980px;margin:0 auto;padding:72px 32px 8px}
.sec .eyebrow{margin-bottom:14px}
.sec h2{font-family:var(--display);font-weight:700;font-size:clamp(30px,4vw,44px);line-height:1.08;
  letter-spacing:-.02em;color:var(--fog);margin:0}
.sec .sub{font-size:16px;color:var(--dim);max-width:62ch;margin:16px 0 0;line-height:1.65}
.sec .sub b{color:var(--fog);font-weight:600}

/* stat strip — the numbers ARE the social proof */
.stats{display:flex;flex-wrap:wrap;gap:10px 0;justify-content:center;max-width:980px;margin:0 auto;
  padding:120px 32px 0;font-family:var(--mono);font-size:13px;color:var(--dim)}
.stats .st{display:flex;align-items:baseline;gap:8px;padding:0 22px;border-left:1px solid var(--line)}
.stats .st:first-child{border-left:0}
.stats b{color:var(--orange);font-weight:500;font-size:17px}

/* bento of the four pillars */
.bento{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:34px}
.cell{border:1px solid var(--line);border-radius:16px;padding:22px 24px;
  background:linear-gradient(180deg,rgba(24,38,23,.72),rgba(14,21,13,.6))}
.cell .tag{font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.2em;
  text-transform:uppercase;color:var(--orange)}
.cell h3{font-family:var(--display);font-weight:600;font-size:21px;letter-spacing:-.01em;
  color:var(--fog);margin:10px 0 8px}
.cell p{font-size:14px;color:var(--dim);margin:0 0 16px;line-height:1.6}
.chips{display:flex;flex-wrap:wrap;gap:7px}
.chip{font-family:var(--mono);font-size:11.5px;color:var(--dim);border:1px solid var(--line);
  border-radius:999px;padding:4px 11px;white-space:nowrap}
.chip.hot{color:var(--orange);border-color:rgba(255,85,0,.3);background:var(--orange-soft)}

/* convergence strip — many sources, one wire, your agent */
.flow{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:10px 14px;
  margin:26px 0 0;font-family:var(--mono);font-size:12.5px;color:var(--ash)}
.flow .fnode{border:1px solid var(--line);border-radius:8px;padding:6px 12px;color:var(--dim)}
.flow .fnode.hub{color:var(--orange);border-color:rgba(255,85,0,.4);background:var(--orange-soft);
  display:inline-flex;align-items:center;gap:7px}
.flow .fnode.hub .rv{width:13px;height:13px;fill:var(--orange)}
.flow .farrow{color:var(--orange);letter-spacing:-.06em}

/* one vs many */
.vs{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:34px}
.vs .col{border:1px solid var(--line);border-radius:16px;padding:22px 24px;
  background:linear-gradient(180deg,rgba(24,38,23,.5),rgba(14,21,13,.45))}
.vs .col.win{border-color:rgba(255,85,0,.36);
  background:linear-gradient(180deg,rgba(24,38,23,.8),rgba(14,21,13,.7));
  box-shadow:0 26px 60px -34px rgba(255,85,0,.35)}
.vs h3{font-family:var(--mono);font-size:11.5px;font-weight:500;letter-spacing:.2em;
  text-transform:uppercase;color:var(--ash);margin:0 0 14px}
.vs .col.win h3{color:var(--orange)}
.vs ul{list-style:none;margin:0;padding:0}
.vs li{display:flex;gap:12px;align-items:baseline;padding:9px 0;font-size:14px;color:var(--dim);line-height:1.55;
  border-top:1px solid var(--line)}
.vs li:first-child{border-top:0}
.vs li::before{content:"×";color:var(--ash);font-weight:600}
.vs .col.win li{color:var(--fog)}
.vs .col.win li::before{content:"✓";color:var(--orange)}
.vs li b{color:var(--fog);font-weight:600}

/* under-the-hood footnote for the technical crowd */
.hood{margin:26px 0 0;font-family:var(--mono);font-size:12.5px;color:var(--ash);line-height:1.7;
  max-width:74ch}
.hood code{color:var(--orange);background:var(--orange-soft);border:1px solid rgba(255,85,0,.24);
  padding:1px 6px;border-radius:6px;font-size:.95em}

/* closing CTA */
.cta-row{display:flex;align-items:center;justify-content:center;gap:22px;flex-wrap:wrap;
  max-width:980px;margin:0 auto;padding:58px 32px 74px;text-align:center}
.cta-row .line{font-family:var(--display);font-weight:600;font-size:clamp(21px,2.6vw,27px);
  letter-spacing:-.015em;color:var(--fog)}

/* ---- footer: the last row of the same frosted field — flush against .below
   (no margin) with only a hairline rule between ---- */
footer{position:relative;z-index:2;border-top:1px solid var(--line);padding:26px 0 34px;
  background:rgba(14,21,13,.72);
  backdrop-filter:blur(10px) saturate(.9);-webkit-backdrop-filter:blur(10px) saturate(.9)}
.foot{display:flex;flex-wrap:wrap;gap:14px 26px;align-items:center;justify-content:space-between}
.foot .l{font-family:var(--mono);font-size:12px;color:var(--ash);text-shadow:0 1px 3px rgba(14,21,13,.9)}
.foot .l b{color:var(--dim);font-weight:400}
.foot-links{display:flex;gap:24px}
.foot-links a{font-family:var(--mono);font-size:12px;color:var(--dim);text-shadow:0 1px 3px rgba(14,21,13,.9)}
.foot-links a:hover{color:var(--orange)}

@media (max-width:820px){
  .wrap{padding:0 22px}
  .top-in{height:74px}
  .brand .rv{width:28px;height:28px}
  .brand .wm b{font-size:21px}
  .hero{min-height:auto;padding:18px 0 40px}
  .hero-in{max-width:100%;margin-left:0}
  h1.title{font-size:clamp(44px,13vw,68px)}
  .scrim{background:
    linear-gradient(180deg,var(--bg) 4%,rgba(14,21,13,.9) 40%,rgba(14,21,13,.6) 58%,rgba(14,21,13,.3) 76%,rgba(14,21,13,.55))}
  .connect-head .end{display:none}
  .sec{padding:52px 22px 6px}
  .below{background:linear-gradient(180deg,transparent,
    rgba(14,21,13,.26) 35px,rgba(14,21,13,.48) 70px,rgba(14,21,13,.64) 105px,rgba(14,21,13,.72) 140px)}
  .below::before{mask-image:linear-gradient(180deg,transparent,#000 130px);
    -webkit-mask-image:linear-gradient(180deg,transparent,#000 130px)}
  .stats{padding:110px 22px 0}
  .stats .st{padding:0 14px}
  .bento,.vs{grid-template-columns:1fr}
  .cta-row{padding:44px 22px 58px}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`;

// ---------------------------------------------------------------------------
// WebGL2 dither-sphere shader — hand-written port of Paper's `sphere` +
// 4x4 Bayer ordered dithering. Two colors only (back = green, front = orange),
// a rotating light, pixelated to `PXSIZE` cells.
// ---------------------------------------------------------------------------

const VERT = `#version 300 es
in vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_scale;
uniform vec2 u_offset;
uniform float u_px;
uniform vec3 u_back;
uniform vec3 u_front;
out vec4 o;
const float bayer[16] = float[16](
  0.0, 8.0, 2.0, 10.0,
  12.0, 4.0, 14.0, 6.0,
  3.0, 11.0, 1.0, 9.0,
  15.0, 7.0, 13.0, 5.0);
void main(){
  vec2 fc = gl_FragCoord.xy;
  vec2 cell = floor(fc / u_px);
  vec2 px = (cell + 0.5) * u_px;
  float m = min(u_res.x, u_res.y);
  vec2 uv = (px - 0.5 * u_res) / m;
  uv /= u_scale;
  uv -= u_offset;
  vec2 sUV = uv * 2.0;
  float d = 1.0 - dot(sUV, sUV);
  vec3 pos = vec3(sUV, sqrt(max(0.0, d)));
  float t = 0.5 * u_time;
  vec3 lp = normalize(vec3(cos(1.5 * t), 0.8, sin(1.25 * t)));
  float shape = max(0.0, dot(lp, pos)) * step(0.0, d);
  int bx = int(mod(cell.x, 4.0));
  int by = int(mod(cell.y, 4.0));
  float thr = bayer[by * 4 + bx] / 16.0;
  float on = step(thr, shape - 0.0008);
  vec3 col = mix(u_back, u_front, on);
  o = vec4(col, 1.0);
}`;

// Tuning knobs for the globe (bottom-left, large). Kept together to nudge.
const GL_TUNE = {
  speed: 0.56,
  scale: 1.72,
  offX: -0.36,
  offY: -0.46,
  px: 3.0
};

const SCRIPT = `
(function(){
  var cv = document.getElementById('gl');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gl = cv && cv.getContext ? cv.getContext('webgl2', {antialias:false, alpha:false, powerPreference:'low-power'}) : null;
  if(!gl){ document.body.classList.add('no-gl'); }
  else {
    var VS = ${JSON.stringify(VERT)};
    var FS = ${JSON.stringify(FRAG)};
    var speed = ${GL_TUNE.speed}, scale = ${GL_TUNE.scale}, offX = ${GL_TUNE.offX}, offY = ${GL_TUNE.offY}, PX = ${GL_TUNE.px};
    function mk(t, s){ var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; }
    var prog = gl.createProgram();
    gl.attachShader(prog, mk(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){ document.body.classList.add('no-gl'); }
    else {
      gl.useProgram(prog);
      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
      var la = gl.getAttribLocation(prog, 'a');
      gl.enableVertexAttribArray(la);
      gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);
      var uRes = gl.getUniformLocation(prog, 'u_res');
      var uTime = gl.getUniformLocation(prog, 'u_time');
      var uScale = gl.getUniformLocation(prog, 'u_scale');
      var uOff = gl.getUniformLocation(prog, 'u_offset');
      var uPx = gl.getUniformLocation(prog, 'u_px');
      gl.uniform3f(gl.getUniformLocation(prog, 'u_back'), 0.082, 0.122, 0.078);
      gl.uniform3f(gl.getUniformLocation(prog, 'u_front'), 1.0, 0.333, 0.0);
      gl.uniform1f(uScale, scale);
      gl.uniform2f(uOff, offX, offY);
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      function resize(){
        var w = cv.clientWidth, h = cv.clientHeight;
        cv.width = Math.max(1, Math.round(w * dpr));
        cv.height = Math.max(1, Math.round(h * dpr));
        gl.viewport(0, 0, cv.width, cv.height);
        gl.uniform2f(uRes, cv.width, cv.height);
        gl.uniform1f(uPx, PX * dpr);
      }
      window.addEventListener('resize', resize);
      resize();
      var start = null;
      function frame(now){
        if(start === null) start = now;
        gl.uniform1f(uTime, (now - start) / 1000 * speed);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if(!reduce) requestAnimationFrame(frame);
      }
      if(reduce){ gl.uniform1f(uTime, 5.2); gl.drawArrays(gl.TRIANGLES, 0, 3); }
      else requestAnimationFrame(frame);
    }
  }
  // ---- tabs + copy ----
  function activate(tab){
    var name = tab.getAttribute('data-tab');
    var tabs = document.querySelectorAll('.tab');
    for(var i=0;i<tabs.length;i++) tabs[i].classList.remove('active');
    tab.classList.add('active');
    var panels = document.querySelectorAll('.panel');
    for(var j=0;j<panels.length;j++) panels[j].classList.toggle('active', panels[j].getAttribute('data-panel') === name);
  }
  function flash(btn){
    var orig = btn.getAttribute('data-label') || btn.textContent;
    btn.setAttribute('data-label', orig);
    btn.textContent = 'Copied';
    btn.classList.add('copied');
    setTimeout(function(){ btn.textContent = orig; btn.classList.remove('copied'); }, 1400);
  }
  document.addEventListener('click', function(e){
    var t = e.target.closest ? e.target.closest('[data-tab]') : null;
    if(t){ activate(t); return; }
    var c = e.target.closest ? e.target.closest('[data-copy]') : null;
    if(c){
      var el = document.querySelector(c.getAttribute('data-copy'));
      if(el && navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(el.innerText).then(function(){ flash(c); }, function(){});
      }
      return;
    }
  });
})();
`;

// ---------------------------------------------------------------------------
// Page shells
// ---------------------------------------------------------------------------

export const OG_ALT =
  "Stellar Raven — Stellar docs and ecosystem context, one connection. A Bayer-dithered orange globe " +
  "beside the endpoint raven.stellar.org/mcp.";

function head(
  title: string,
  description: string,
  css: string,
  headExtra: string = "",
  noindex: boolean = false,
  path: string = "/"
): string {
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}"/>
${noindex ? `<meta name="robots" content="noindex"/>\n` : ""}<meta name="theme-color" content="#0e150d"/>
<meta name="color-scheme" content="dark"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${escapeHtml(title)}"/>
<meta property="og:description" content="${escapeHtml(description)}"/>
<meta property="og:image" content="${OG_IMAGE}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:type" content="image/png"/>
<meta property="og:image:alt" content="${escapeHtml(OG_ALT)}"/>
<meta property="og:url" content="https://${HOST}${path}"/>
<meta property="og:site_name" content="Stellar Raven"/>
<meta property="og:locale" content="en_US"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${escapeHtml(title)}"/>
<meta name="twitter:description" content="${escapeHtml(description)}"/>
<meta name="twitter:image" content="${OG_IMAGE}"/>
<meta name="twitter:image:alt" content="${escapeHtml(OG_ALT)}"/>
<link rel="icon" href="${FAVICON}"/>
<link rel="apple-touch-icon" href="${FAVICON}"/>
<link rel="canonical" href="https://${HOST}${path}"/>
<style>${FONT_FACE}${TOKENS}${css}</style>${headExtra}
</head><body>`;
}

// ---------------------------------------------------------------------------
// Landing page
// ---------------------------------------------------------------------------

const CLIENTS: Array<{ id: string; name: string; term: string; code: string }> = [
  {
    id: "cc",
    name: "Claude Code",
    term: "terminal",
    code:
      `<span class="c"># add the remote server over HTTP, then authorize</span>\n` +
      `<span class="p">claude</span> mcp add --transport http <span class="s">stellar-raven</span> <span class="p">\\</span>\n` +
      `  <span class="s">"${MCP_ENDPOINT}"</span>\n` +
      `<span class="c"># run /mcp -> Authenticate -> sign in in your browser</span>`
  },
  {
    id: "codex",
    name: "Codex",
    term: "terminal",
    code:
      `<span class="c"># add the streamable-HTTP server, then log in</span>\n` +
      `<span class="p">codex</span> mcp add <span class="s">stellar-raven</span> --url <span class="s">"${MCP_ENDPOINT}"</span>\n` +
      `<span class="p">codex</span> mcp login <span class="s">stellar-raven</span>  <span class="c"># opens your browser</span>`
  },
  {
    id: "cursor",
    name: "Cursor",
    term: "~/.cursor/mcp.json",
    code:
      `<span class="c">// ~/.cursor/mcp.json  (or .cursor/mcp.json per project)</span>\n` +
      `{\n` +
      `  <span class="k">"mcpServers"</span>: {\n` +
      `    <span class="k">"stellar-raven"</span>: { <span class="k">"url"</span>: <span class="s">"${MCP_ENDPOINT}"</span> }\n` +
      `  }\n` +
      `}\n` +
      `<span class="c">// Cursor runs the OAuth sign-in on first use</span>`
  },
  {
    id: "cd",
    name: "Claude Desktop",
    term: "Settings -> Connectors",
    code:
      `<span class="c"># Settings -> Connectors -> Add custom connector</span>\n` +
      `<span class="c"># paste the endpoint:</span>\n` +
      `<span class="s">${MCP_ENDPOINT}</span>\n` +
      `<span class="c"># approve the browser sign-in — that's it</span>`
  },
  {
    id: "vscode",
    name: "VS Code",
    term: "terminal",
    code:
      `<span class="c"># add via the CLI (or .vscode/mcp.json)</span>\n` +
      `<span class="p">code</span> --add-mcp <span class="s">'{"name":"stellar-raven","type":"http","url":"${MCP_ENDPOINT}"}'</span>`
  },
  {
    id: "other",
    name: "Other",
    term: "mcp.json",
    code:
      `<span class="c"># no native remote/OAuth support? bridge with mcp-remote</span>\n` +
      `{\n` +
      `  <span class="k">"mcpServers"</span>: {\n` +
      `    <span class="k">"stellar-raven"</span>: {\n` +
      `      <span class="k">"command"</span>: <span class="s">"npx"</span>,\n` +
      `      <span class="k">"args"</span>: [<span class="s">"-y"</span>, <span class="s">"mcp-remote@latest"</span>, <span class="s">"${MCP_ENDPOINT}"</span>, <span class="s">"--transport"</span>, <span class="s">"http-only"</span>]\n` +
      `    }\n` +
      `  }\n` +
      `}`
  }
];

function tabButtons(): string {
  return CLIENTS.map(
    (c, i) => `<button class="tab${i === 0 ? " active" : ""}" data-tab="${c.id}">${escapeHtml(c.name)}</button>`
  ).join("");
}

function panels(): string {
  return CLIENTS.map((c, i) => {
    const codeId = `code-${c.id}`;
    return `<div class="panel${i === 0 ? " active" : ""}" data-panel="${c.id}">
  <div class="term">
    <div class="term-bar"><span class="tl r"></span><span class="tl y"></span><span class="tl g"></span>
      <span class="term-name">${escapeHtml(c.term)}</span>
      <button class="btn btn-ghost term-copy" data-copy="#${codeId}">Copy</button>
    </div>
    <pre class="code" id="${codeId}">${c.code}</pre>
  </div>
</div>`;
  }).join("");
}

function brand(): string {
  return `<a class="brand" href="/">${ravenSvg("rv")}<span class="wm"><b>Stellar Raven</b><i>codemode</i></span></a>`;
}

// JSON-LD structured data — landing page only (the consent page stays
// script-free). `<` / `>` / `&` are unicode-escaped so the serialized JSON can
// never break out of the <script> element.
const JSONLD =
  `<script type="application/ld+json">` +
  JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `https://${HOST}/#website`,
        url: `https://${HOST}/`,
        name: "Stellar Raven",
        description:
          "Stellar docs, live ecosystem data, community intel, and proven playbooks in one MCP connection for AI agents."
      },
      {
        "@type": "SoftwareApplication",
        "@id": `https://${HOST}/#app`,
        name: "Stellar Raven",
        url: `https://${HOST}/`,
        image: OG_IMAGE,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any (remote MCP server)",
        featureList: [
          "Official Stellar developer docs search",
          "Live Stellar ecosystem data (projects, graded repos, builders, partners)",
          "Community intel (news, media, events, governance, SCF)",
          "Curated skill playbooks read section by section",
          "Sandboxed no-network code execution composing multiple sources",
          "One OAuth sign-in, no service API keys"
        ],
        description:
          "A remote MCP server that gives AI agents Stellar docs and ecosystem context in one connection: " +
          "official docs, live ecosystem data, community intel, and curated playbooks, unified in one " +
          "catalog. Its search tool ranks every operation and skill; its execute tool runs agent-written " +
          "JavaScript in a sandboxed, no-network runtime. One OAuth sign-in, no service API keys.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: { "@type": "Organization", name: "Stellar", url: "https://stellar.org" }
      }
    ]
  })
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026") +
  `</script>`;

export function landingPage(): string {
  return (
    head(
      "Stellar Raven — the Stellar MCP server for AI agents",
      "One connection gives your AI agent Stellar docs, live ecosystem data, community intel, and proven playbooks. One sign-in, no service API keys.",
      BASE,
      JSONLD
    ) +
    `<div class="stage"><canvas id="gl"></canvas></div><div class="scrim"></div>` +
    `<header class="top"><div class="wrap top-in">${brand()}` +
    `<nav class="top-nav"><a class="btn btn-ghost" href="/playground">Playground</a></nav></div></header>` +
    `<main class="wrap"><section class="hero" id="connect"><div class="hero-in">
  <p class="eyebrow">Remote MCP server <span class="live"><span class="dot"></span>live</span></p>
  <h1 class="title">Stellar <span class="r">Raven</span></h1>
  <p class="lede"><b>Stellar docs and ecosystem context, one connection.</b> Raven gives your AI agent the
    official docs, live ecosystem data, community intel, and proven playbooks — and cross-references
    them into answers no single source can give. No service API keys. Paste the endpoint, sign
    in, ask.</p>

  <div class="connect">
    <div class="connect-head">
      <span class="h">Connect your agent</span>
      <span class="end">${ravenSvg("rv")}<b>${escapeHtml(HOST)}</b>/mcp</span>
    </div>
    <div class="tabs">${tabButtons()}</div>
    ${panels()}
    <div class="connect-foot"><span class="tk"><b>No service API keys</b> — one browser sign-in</span>
      <span class="tk"><b>Sandboxed</b> — agent code runs with no network</span>
      <span class="tk"><b>Low upkeep</b> — checked against live services daily</span></div>
    <div class="connect-legal">By using Stellar Raven you acknowledge you have read and agreed to the
      <a href="/terms">Terms of Service</a> and the
      <a href="https://stellar.org/privacy-policy" target="_blank" rel="noopener">Privacy
      Policy</a>.</div>
  </div>
</div></section></main>` +
    `<div class="below">
  <div class="stats" aria-label="What one connection covers">
    <span class="st"><b>54</b> live operations</span>
    <span class="st"><b>283</b> catalog entries</span>
    <span class="st"><b>19</b> playbooks</span>
    <span class="st"><b>1</b> sign-in</span>
    <span class="st"><b>0</b> API keys</span>
  </div>

  <section class="sec" id="roof">
    <p class="eyebrow">Under one roof</p>
    <h2>Finally, Stellar context in one place.</h2>
    <p class="sub">Wired up separately, this is a stack of servers, API keys, and upkeep.
      Raven bundles it behind one endpoint — and keeps the catalog checked against live services.</p>
    <div class="bento">
      <div class="cell">
        <div class="tag">Official docs</div>
        <h3>The source of truth, ranked for agents</h3>
        <p>Official Stellar developer docs, searched the way agents actually ask.</p>
        <div class="chips"><span class="chip">smart contracts</span><span class="chip">SDKs</span><span class="chip">RPC &amp; Horizon</span><span class="chip">SEPs &amp; standards</span></div>
      </div>
      <div class="cell">
        <div class="tag">Live ecosystem data</div>
        <h3>Current and graded, not training-data stale</h3>
        <p>Curated intelligence on who is building what across the network — refreshed from the live services.</p>
        <div class="chips"><span class="chip">920+ projects</span><span class="chip">2,300+ graded repos</span><span class="chip">builders &amp; partners</span><span class="chip">research corpus</span></div>
      </div>
      <div class="cell">
        <div class="tag">Community intel</div>
        <h3>What the ecosystem is shipping and funding</h3>
        <p>News, media, and money flows — the context your agent can't get from docs alone.</p>
        <div class="chips"><span class="chip">news &amp; research</span><span class="chip">podcasts &amp; video</span><span class="chip">events &amp; jobs</span><span class="chip">governance &amp; SCF</span></div>
      </div>
      <div class="cell">
        <div class="tag">Proven playbooks</div>
        <h3>Tested procedures, read mid-task</h3>
        <p>Eighteen step-by-step guides your agent pulls in section by section, exactly when it needs them.</p>
        <div class="chips"><span class="chip">smart contracts</span><span class="chip">payments</span><span class="chip">dApps</span><span class="chip">data &amp; indexing</span></div>
      </div>
    </div>
    <div class="flow" aria-hidden="true">
      <span class="fnode">docs</span><span class="fnode">data</span><span class="fnode">intel</span><span class="fnode">playbooks</span>
      <span class="farrow">──▶</span>
      <span class="fnode hub">${ravenSvg("rv")}${escapeHtml(HOST)}/mcp</span>
      <span class="farrow">──▶</span>
      <span class="fnode">your agent</span>
    </div>
  </section>

  <section class="sec" id="why">
    <p class="eyebrow">Why a gateway</p>
    <h2>One install replaces the pile.</h2>
    <p class="sub">The point isn't fewer tabs — it's a <b>smarter agent</b>. When every source lives in
      one catalog, Raven can answer the questions that fall between services.</p>
    <div class="vs">
      <div class="col">
        <h3>Wiring it yourself</h3>
        <ul>
          <li>A separate MCP server for every service</li>
          <li>API keys to obtain, store, and rotate</li>
          <li>Dozens of tool schemas crowding the context window</li>
          <li>One source per question — you do the cross-referencing</li>
          <li>Breaks quietly whenever any service changes</li>
        </ul>
      </div>
      <div class="col win">
        <h3>Pointing at Raven</h3>
        <ul>
          <li><b>One endpoint,</b> one browser sign-in</li>
          <li><b>No keys</b> — secrets stay server-side, out of your agent's reach</li>
          <li><b>Two lean tools</b> that leave the context window to your work</li>
          <li><b>One answer</b> composed from several sources at once</li>
          <li><b>Checked daily</b> against the live services</li>
        </ul>
      </div>
    </div>
    <p class="hood">Under the hood: two MCP tools. <code>search</code> ranks 283 catalog entries — operations, docs, and
      skill sections; <code>execute</code> runs your agent's JavaScript in a no-network sandbox where
      every call is validated against the catalog.</p>
  </section>

  <div class="cta-row">
    <span class="line">Two minutes from paste to expert.</span>
    <a class="btn btn-primary" href="#connect">Connect your agent</a>
    <a class="btn btn-outline" href="/playground">Try the playground</a>
  </div>
</div>` +
    siteFooter() +
    `<script>${SCRIPT}</script></body></html>`
  );
}

function siteFooter(): string {
  return `<footer><div class="wrap foot">
  <div class="l">${escapeHtml(HOST)} <b>·</b> Stellar context, one connection</div>
  <div class="foot-links">
    <a href="https://github.com/stellar-experimental/stellar-raven" target="_blank" rel="noopener">GitHub</a>
    <a href="https://stellar.org" target="_blank" rel="noopener">Stellar</a>
    <a href="/terms">Raven Terms</a>
    <a href="https://stellar.org/terms-of-service" target="_blank" rel="noopener">Stellar Terms</a>
    <a href="https://stellar.org/privacy-policy" target="_blank" rel="noopener">Privacy</a>
  </div>
</div></footer>`;
}

// ---------------------------------------------------------------------------
// Consent page (OAuth /authorize) — same system, script-free + hardened.
// ---------------------------------------------------------------------------

const CONSENT_CSS = `
body{display:flex;flex-direction:column}
/* Same baked dither-globe as the playground (script-free page: a data: PNG
   background is fine under img-src data:, no WebGL/canvas needed). The approve
   screen is an INVITING surface, so this variant is a LIGHT OLIVE lifted above
   the field — the inverse of the playground's darker, recessed sphere. */
.stage{background:var(--green)}
/* Match the homepage WebGL globe exactly (see the demo page for the derivation):
   same sphere size (840px frame = 240vmin), centred on 50vw − 61.92vmin rather than left-pinned. */
.stage::after{content:"";position:absolute;inset:0;
  background-image:url("data:image/png;base64,${CONSENT_GLOBE_PNG_BASE64}");
  background-position:calc(50vw - 159.86vmin) bottom;background-size:240vmin auto;background-repeat:no-repeat;
  image-rendering:pixelated}
/* gentle top veil for depth; fades clear over the bottom-left sphere so the
   olive glow reads (the centred card carries its own contrast for its text). */
.scrim{background:
  linear-gradient(180deg,rgba(14,21,13,.5) 0%,rgba(14,21,13,.15) 22%,transparent 55%,transparent 100%)}
main.auth{flex:1;display:flex;align-items:center;justify-content:center;padding:40px 22px 64px;
  position:relative;z-index:2}
.card{width:100%;max-width:460px;border:1px solid var(--line-2);border-radius:20px;
  background:linear-gradient(180deg,rgba(24,38,23,.84),rgba(14,21,13,.82));
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  box-shadow:0 40px 90px -38px rgba(0,0,0,.85),inset 0 1px 0 rgba(238,240,226,.05);overflow:hidden}
.card-top{padding:36px 34px 0;text-align:center}
.conn{display:flex;align-items:center;justify-content:center;margin:6px 0 24px}
.node{width:58px;height:58px;border-radius:16px;display:flex;align-items:center;justify-content:center;
  background:rgba(6,10,6,.7);border:1px solid var(--line-2)}
.node.raven .rv{width:30px;height:30px;fill:var(--orange);filter:drop-shadow(0 0 12px rgba(255,85,0,.7))}
.node.client{font-family:var(--display);font-weight:600;font-size:24px;color:var(--fog)}
.wire{position:relative;width:52px;height:2px;background:linear-gradient(90deg,var(--line-2),var(--orange))}
.wire::after{content:"";position:absolute;top:50%;left:50%;width:8px;height:8px;border-radius:50%;
  transform:translate(-50%,-50%);background:var(--orange);box-shadow:0 0 12px rgba(255,85,0,.8)}
.card h1{font-family:var(--display);font-weight:600;font-size:clamp(23px,7vw,27px);line-height:1.15;letter-spacing:-.015em;
  max-width:18ch;margin:0 auto;color:var(--fog);text-wrap:balance;overflow-wrap:anywhere}
.card .sub{color:var(--dim);font-size:15px;max-width:35ch;margin:14px auto 0;line-height:1.55;
  text-wrap:balance}
.card .sub b{color:var(--fog);font-weight:600}
.panel-h{font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;
  color:var(--dim);padding:28px 34px 4px}
.scopes{list-style:none;margin:0;padding:0 34px}
/* grid so the tick centres on the mcp pill by row (align-items:center), while the
   description flows in column 2 under the pill — no per-element margin nudging. */
.scopes li{display:grid;grid-template-columns:auto 1fr;column-gap:12px;align-items:center;padding:13px 0;border-top:1px solid var(--line)}
.scopes li:first-child{border-top:0}
.tick{flex:none}
.scope-code{grid-column:2;justify-self:start;font-family:var(--mono);font-size:12px;color:var(--orange);background:var(--orange-soft);
  border:1px solid rgba(255,85,0,.24);padding:1px 7px;border-radius:6px}
.scope-desc{grid-column:2;font-size:13.5px;color:var(--dim);margin-top:6px;line-height:1.5}
.act{padding:24px 34px 32px}
.act .btn-primary{width:100%;justify-content:center;padding:15px}
.consent-row{display:flex;align-items:flex-start;gap:10px;cursor:pointer;font-size:12.5px;
  color:var(--dim);line-height:1.5;margin:0 0 16px}
/* centre the box on the first line, not the whole phrase (see the demo page). */
.consent-row input{flex:none;font-size:inherit;margin-top:calc((1.5em - 15px)/2);width:15px;height:15px;accent-color:var(--orange);cursor:pointer}
.consent-row span{min-width:0;max-width:48ch;text-wrap:balance}
.consent-row a{color:var(--fog);text-decoration:underline;text-underline-offset:2px}
.consent-row a:hover{color:var(--orange)}
/* CSS-only gate (script-free page): the submit button is inert until #tos-agree
   is checked. Server-side POST /authorize also requires tos_agree — this is UX,
   not the enforcement boundary. */
.act:not(:has(#tos-agree:checked)) .btn-primary{opacity:.45;pointer-events:none;
  cursor:not-allowed;box-shadow:none;transform:none}
.note{display:flex;gap:9px;align-items:center;font-size:12.5px;color:var(--dim);margin:16px 0 0;line-height:1.5}
.note span{min-width:0;text-wrap:balance}
.note svg{flex:none}
.auth-brand{display:flex;align-items:baseline;justify-content:center;gap:11px;padding:30px 0 4px;
  position:relative;z-index:2}
.auth-brand .rv{width:22px;height:22px;fill:var(--orange);filter:drop-shadow(0 0 12px rgba(255,85,0,.5));align-self:center}
.auth-brand b{font-family:var(--display);font-weight:600;font-size:17px;color:var(--fog)}
.auth-brand i{font-family:var(--mono);font-style:normal;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--ash)}
@media (max-width:380px){
  .card-top,.panel-h,.scopes,.act{padding-inline:22px}
  .card h1{max-width:21ch}
}
`;

const TICK =
  `<svg class="tick" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">` +
  `<path d="M13 4.5 6.5 11 3 7.5" fill="none" stroke="#ff5500" stroke-width="2" ` +
  `stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ARROW =
  `<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">` +
  `<path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="#180a00" stroke-width="1.9" ` +
  `stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SHIELD =
  `<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">` +
  `<path d="M8 1.5 13 3.3v4.2c0 3-2.1 5.5-5 6.9-2.9-1.4-5-3.9-5-6.9V3.3L8 1.5Z" ` +
  `fill="none" stroke="#71806a" stroke-width="1.3" stroke-linejoin="round"/></svg>`;

const SCOPE_GLOSS: Record<string, string> = {
  mcp: "Run search and execute against the Stellar service catalog on your behalf."
};

/**
 * View-model rendering for the consent page. workos.ts passes the already-safe
 * display strings and wraps the result in a Response (cookies live there).
 */
export function consentPage(args: {
  clientName: string;
  scopes: string[];
  csrfToken: string;
  formAction: string;
}): string {
  const clientName = escapeHtml(args.clientName.trim() || "Unknown MCP client");
  const initial = escapeHtml((args.clientName.trim() || "?").charAt(0).toUpperCase());
  const scopes = args.scopes.length ? args.scopes : ["(no scopes requested)"];
  const scopeItems = scopes
    .map((s) => {
      const gloss = SCOPE_GLOSS[s];
      return (
        `<li>${TICK}<code class="scope-code">${escapeHtml(s)}</code>` +
        (gloss ? `<div class="scope-desc">${escapeHtml(gloss)}</div>` : ``) +
        `</li>`
      );
    })
    .join("");
  return (
    head("Authorize · Stellar Raven", "Authorize an MCP client to connect to Stellar Raven.", BASE + CONSENT_CSS, "", true) +
    `<div class="stage"></div><div class="scrim"></div>` +
    `<div class="auth-brand">${ravenSvg("rv")}<b>Stellar Raven</b><i>codemode</i></div>` +
    `<main class="auth"><div class="card">
  <div class="card-top">
    <div class="conn"><div class="node client">${initial}</div><div class="wire"></div>
      <div class="node raven">${ravenSvg("rv")}</div></div>
    <h1>${clientName} wants to connect</h1>
    <p class="sub">It will access <b>Stellar Raven</b> for you once you sign in with WorkOS.</p>
  </div>
  <div class="panel-h">This connection grants</div>
  <ul class="scopes">${scopeItems}</ul>
  <div class="act">
    <form method="post" action="${escapeHtml(args.formAction)}">
      <input type="hidden" name="csrf_token" value="${escapeHtml(args.csrfToken)}"/>
      <label class="consent-row"><input type="checkbox" name="tos_agree" id="tos-agree"/>
        <span>I have read and agree to the
        <a href="/terms" target="_blank" rel="noopener">Terms of Service</a>
        and the <a href="https://stellar.org/privacy-policy" target="_blank" rel="noopener">Privacy Policy</a>.</span></label>
      <button class="btn btn-primary" type="submit">Approve and continue ${ARROW}</button>
    </form>
    <p class="note">${SHIELD}<span>Only continue if you started this connection. Approving redirects
      you to WorkOS AuthKit to sign in — your password never reaches this server.</span></p>
  </div>
</div></main>` +
    `</body></html>`
  );
}

// ---------------------------------------------------------------------------
// Terms of Service (GET /terms) — the Raven-specific terms that supplement the
// Stellar.org ToS. Script-free static prose in the same visual system; the
// authoritative copy lives here (this file is the source of truth).
// ---------------------------------------------------------------------------

export const TERMS_EFFECTIVE_DATE = "August 5, 2026";

const TERMS_CSS = `
.stage{background:var(--green)}
.stage::after{content:"";position:absolute;inset:0;
  background-image:url("data:image/png;base64,${CONSENT_GLOBE_PNG_BASE64}");
  background-position:calc(50vw - 159.86vmin) bottom;background-size:240vmin auto;background-repeat:no-repeat;
  image-rendering:pixelated;opacity:.5}
.scrim{background:linear-gradient(180deg,rgba(14,21,13,.86) 0%,rgba(14,21,13,.92) 40%,rgba(14,21,13,.96) 100%)}
/* header + footer share the prose column so the page reads as one measure */
.top-in,.foot{max-width:780px;margin:0 auto}
.legal{max-width:780px;margin:0 auto;padding:8px 32px 80px;position:relative;z-index:2}
.legal h1{font-family:var(--display);font-weight:700;font-size:clamp(32px,5vw,48px);line-height:1.05;
  letter-spacing:-.02em;color:var(--fog);margin:0}
.legal .eff{font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--orange);margin:16px 0 0}
.legal h2{font-family:var(--mono);font-size:12.5px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;
  color:var(--orange);margin:44px 0 0;padding-top:22px;border-top:1px solid var(--line)}
.legal p{font-size:15.5px;color:var(--dim);line-height:1.7;margin:16px 0 0}
.legal p b{color:var(--fog);font-weight:600}
.legal p.caps{font-size:13.5px;letter-spacing:.01em}
.legal a{color:var(--fog);text-decoration:underline;text-underline-offset:2px;overflow-wrap:anywhere}
.legal a:hover{color:var(--orange)}
.legal .lead{font-size:17px;color:var(--fog);opacity:.94}
.legal ol{margin:16px 0 0;padding-left:22px;color:var(--dim);font-size:15.5px;line-height:1.7}
.legal li{margin-top:10px}
`;

/** Section bodies keyed by heading — plain paragraphs unless marked otherwise. */
const TERMS_BODY = `
<h1>Stellar Raven Terms of Service</h1>
<p class="eff">Effective ${TERMS_EFFECTIVE_DATE}</p>
<p class="lead">These Terms of Service ("Terms") govern your access to and use of raven.stellar.org,
raven.stellar.buzz, and agents.stellar.buzz, together with any successor or alias hostname for the
same service, including the Model Context Protocol endpoint and the public playground (collectively,
the "Service"), operated by the Stellar Development Foundation ("SDF," "we," or "us").</p>
<p>By accessing or using the Service, you agree to be bound by the
<a href="https://stellar.org/terms-of-service" target="_blank" rel="noopener">Stellar.org Terms of Service</a>
(the "Stellar ToS") and the
<a href="https://stellar.org/privacy-policy" target="_blank" rel="noopener">Stellar.org Privacy Policy</a>
(the "Privacy Policy"), each of which is incorporated herein by reference.</p>
<p>To the extent these Terms address a topic not covered by the Stellar ToS, these Terms apply. To the
extent of any direct conflict between these Terms and the Stellar ToS, these Terms control with respect
to your use of the Service.</p>

<h2>1. About Stellar Raven</h2>
<p>The Service is a remote Model Context Protocol ("MCP") gateway that lets AI coding assistants and
developers look up Stellar-ecosystem information and reach existing Stellar-ecosystem services through a
single connection. It exposes two tools: <b>search</b>, which locates relevant operations, documentation,
and reference material, and <b>execute</b>, which runs assistant-generated code in an isolated sandbox
with no network access to call third-party services through controlled, host-side adapters.</p>
<p>The Service is a read-only information-retrieval tool. The execute tool functions solely as a read-only
proxy to third-party services and does not sign, authorize, or submit transactions, custody assets or
keys, or move value on any network. The Service does not host its own content; it retrieves content from
third-party sources and returns results.</p>

<h2>2. Who these Terms apply to</h2>
<p>The Service is designed to be accessed both directly by you and by AI agents acting on your behalf. You
are responsible for all activity conducted through your account, including all activity of any AI agent,
assistant, or automated system you connect to or direct through the Service. References to "you" include
the human or entity account holder, and you agree that you are accountable for your agents' use of the
Service and for all content submitted through your account.</p>

<h2>3. Eligibility and permitted use</h2>
<p>Your use of the Service is subject to the eligibility requirements of the Stellar ToS, including its
sanctions and export-control representations. Notwithstanding the "personal, non-commercial use only"
limitation in the Stellar ToS, you may use the Service for developer and commercial purposes, including
building, testing, and deploying applications on Stellar, subject to these Terms and any applicable
open-source license.</p>

<h2>4. Content licensing</h2>
<p>The Service retrieves and returns content from third-party sources, each of which is governed by its own
license and terms. Any content that is authored and made available by SDF through the Service is provided
under the <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener">Apache
License 2.0</a>, or such other open-source license as may be indicated in the applicable source
repository. You may use, copy, modify, and distribute that content in accordance with the applicable
license terms. For clarity, the intellectual property restrictions in the "Intellectual property rights"
section of the Stellar ToS do not limit rights expressly granted to you by an applicable open-source
license.</p>

<h2>5. Third-party services and content</h2>
<p>The Service acts as a conduit to third-party services and content maintained by projects across the
Stellar ecosystem. SDF does not host, control, or endorse third-party services or content, and such
services and content are subject to their own licenses, terms, and privacy practices. When you or your
agent use the Service, your request may be routed to those third-party services and the results returned
to you. SDF makes no representation or warranty regarding the accuracy, completeness, security, or
legality of any third-party service or content, and your use of it is at your own risk. SDF is not
responsible for the practices of any third-party service that receives or responds to a request routed
through the Service.</p>

<h2>6. No warranty; use at your own risk</h2>
<p class="caps">THE SERVICE AND ALL CONTENT AND RESULTS PROVIDED THROUGH IT ARE PROVIDED "AS IS" AND "AS
AVAILABLE" WITHOUT ANY WARRANTY OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WARRANTIES
OF ACCURACY, COMPLETENESS, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>
<p>Content and results returned by the Service may be incomplete, outdated, or incorrect. You are solely
responsible for evaluating, testing, and independently verifying any content or result obtained from the
Service before relying on it, including any code derived from or informed by such content. SDF is not
responsible for any harm, loss, or damage resulting from your reliance on content or results provided
through the Service.</p>

<h2>7. AI-generated output</h2>
<p>The Service is designed to be used with AI coding assistants. Any code or other output produced by an AI
assistant using the Service is AI-generated output, not SDF output. You are solely responsible for
reviewing, testing, and securing any such output before use or deployment, including reviewing it for
errors, security vulnerabilities, and compliance with applicable licenses. The AI Tools provisions of the
Stellar ToS apply to your use of AI-generated output obtained through or informed by the Service.</p>

<h2>8. Acceptable use</h2>
<p>In addition to the prohibited uses in the Stellar ToS, you agree not to:</p>
<ol type="a">
  <li>submit personal data, sensitive personal information, confidential information, trade secrets,
    credentials, private keys, or any content you do not have the right to submit;</li>
  <li>attempt to circumvent, disable, or escape the sandbox, or use the execute tool to run code intended
    to exfiltrate data, access credentials, or establish network connections;</li>
  <li>attempt to cause the Service to sign, authorize, or submit transactions, or otherwise use the
    Service other than as a read-only information-retrieval tool;</li>
  <li>use the Service to overload, disrupt, or interfere with the Service or any third-party service
    reached through it; or</li>
  <li>probe, scan, or test the vulnerability of the Service, breach or circumvent its authentication,
    rate limiting, or access controls, or otherwise attack the Service or the infrastructure it runs
    on. This restriction applies to SDF's deployment of the Service, not to the source code, which
    you may use, modify, and redistribute under its open-source license as described in Section 4.</li>
</ol>

<h2>9. Data and privacy</h2>
<p>Your use of the Service is subject to the Privacy Policy. The following describes how the Service
handles data, and supplements that policy:</p>
<p><b>Authentication.</b> Sign-in is handled by WorkOS, a third-party authentication provider, which
receives your email address and holds it on SDF's behalf to identify your account. The Service itself
receives only an account identifier from WorkOS, which is one-way hashed before storage; the Service
does not store your email address. Authentication tokens issued by WorkOS during sign-in are not
retained. The Service does not collect names, addresses, payment information, wallet keys, or
special-category data.</p>
<p><b>Operational logs.</b> The Service's own structured logs contain content-free operational data such
as status, timing, counts, exposed operation identifiers, and pseudonymous account joins. They do not
contain submitted queries, execute code, tool results, response or answer text, provider error messages,
or hashes derived from that content. Cloudflare may separately retain platform request metadata under
its fixed retention schedule, currently no longer than seven days.</p>
<p><b>Temporary artifacts.</b> For authenticated MCP use, an oversized, secret-redacted execute result
may be stored in SDF's Cloudflare R2 environment for up to seven days so the same authenticated account
can inspect it. These artifacts have no public URL and expire automatically.</p>
<p><b>No sensitive data.</b> You should not submit personal, confidential, or sensitive information to the
Service. You are solely responsible for the content you or your agent submit, and for any consequences of
submitting content you should not have submitted.</p>
<p><b>Your choices.</b> Raven's structured content logging and AI Gateway request logging are disabled
for every user. You may request deletion
of data associated with your account by contacting us at
<a href="mailto:frontier@stellar.org">frontier@stellar.org</a>. Active grants, rate-limit records, and
temporary artifacts can be removed; platform logs already retained by Cloudflare expire on their fixed
schedule rather than through selective deletion.</p>

<h2>10. Changes; contact</h2>
<p>We may modify these Terms or the Service at any time without prior notice. Your continued use of the
Service after any modification constitutes acceptance of the revised Terms. Questions about these Terms
may be directed to <a href="mailto:legal@stellar.org">legal@stellar.org</a>.</p>
`;

export function termsPage(): string {
  return (
    head(
      "Terms of Service · Stellar Raven",
      `The Stellar Raven Terms of Service, effective ${TERMS_EFFECTIVE_DATE} — how the MCP gateway and public playground may be used.`,
      BASE + TERMS_CSS,
      "",
      false,
      "/terms"
    ) +
    `<div class="stage"></div><div class="scrim"></div>` +
    `<header class="top"><div class="wrap top-in">${brand()}` +
    `<nav class="top-nav"><a class="btn btn-ghost" href="/">Home</a>` +
    `<a class="btn btn-ghost" href="/playground">Playground</a></nav></div></header>` +
    `<main class="legal">${TERMS_BODY}</main>` +
    siteFooter() +
    `</body></html>`
  );
}

export const TERMS_HEADERS: Record<string, string> = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "public, max-age=300",
  "content-security-policy":
    "default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data:; " +
    "frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer"
};

// ---------------------------------------------------------------------------
// Response headers — landing allows inline script (shader + tabs); consent is
// script-free. Both self-contained: font-src data:, img-src data:, no network.
// Consent intentionally omits form-action, matching the prior Raven handlers:
// Chromium can block OAuth consent POST/redirect chains when it is present.
// The explicit approval click, double-submit CSRF token, and bound single-use
// state cookie are the protections for that POST.
// ---------------------------------------------------------------------------

export const LANDING_HEADERS: Record<string, string> = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "public, max-age=300",
  "content-security-policy":
    "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; " +
    "font-src data:; img-src data:; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; " +
    "form-action 'self' https://raven.stellar.org https://raven.stellar.buzz https://agents.stellar.buzz",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer"
};

export const CONSENT_HEADERS: Record<string, string> = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "no-store",
  // The consent URL carries the client's `state` and `code_challenge` in its
  // query string, and this page invites the user to click through to /terms
  // and to the Stellar privacy policy. The default referrer policy would send
  // that whole URL on the same-origin hop — straight into request logs — so
  // send no referrer at all. Matches the /callback interstitial.
  "referrer-policy": "no-referrer",
  "content-security-policy":
    "default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data:; " +
    "frame-ancestors 'none'; base-uri 'none'",
  "x-frame-options": "DENY",
  "x-content-type-options": "nosniff"
};

// ---------------------------------------------------------------------------
// Crawler surfaces — robots.txt + sitemap.xml. Canonical host is HOST
// (raven.stellar.org); the OAuth/API paths are disallowed since they carry no
// indexable content. Wired to routes in auth/workos.ts.
// ---------------------------------------------------------------------------

export function robotsTxt(): string {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /authorize",
    "Disallow: /callback",
    "Disallow: /playground",
    "Disallow: /mcp",
    `Sitemap: https://${HOST}/sitemap.xml`,
    ""
  ].join("\n");
}

export function sitemapXml(): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `  <url><loc>https://${HOST}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n` +
    `  <url><loc>https://${HOST}/terms</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>\n` +
    `</urlset>\n`
  );
}

export const ROBOTS_HEADERS: Record<string, string> = {
  "content-type": "text/plain; charset=utf-8",
  "cache-control": "public, max-age=86400"
};

export const SITEMAP_HEADERS: Record<string, string> = {
  "content-type": "application/xml; charset=utf-8",
  "cache-control": "public, max-age=86400"
};
