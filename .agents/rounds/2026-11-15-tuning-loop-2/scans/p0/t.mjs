import { pctNet, pAtLeast } from "./tnull.mjs";
for (const p of [0.13, 0.16, 0.34]) for (const n of [58, 50, 46, 34, 30]) console.log(`p=${p} n=${n} T95=${pctNet(n,p,0.95)} T97.5=${pctNet(n,p,0.975)} P(net>=6)=${(pAtLeast(n,p,6)*100).toFixed(1)}%`);
