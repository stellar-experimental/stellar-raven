// Net = downs - ups; each of n rows flips with prob p, up or down with equal chance.
export function netDist(n, p) {
  // dist over net in [-n, n]
  let d = new Map([[0, 1]]);
  for (let i = 0; i < n; i++) {
    const nd = new Map();
    for (const [k, v] of d) {
      nd.set(k, (nd.get(k) ?? 0) + v * (1 - p));
      nd.set(k + 1, (nd.get(k + 1) ?? 0) + v * p / 2);
      nd.set(k - 1, (nd.get(k - 1) ?? 0) + v * p / 2);
    }
    d = nd;
  }
  return d;
}
export function pctNet(n, p, q) { // smallest k with P(net<=k) >= q
  const d = netDist(n, p); let c = 0;
  for (const k of [...d.keys()].sort((a, b) => a - b)) { c += d.get(k); if (c >= q - 1e-12) return k; }
}
export function pAtLeast(n, p, k) { const d = netDist(n, p); let s = 0; for (const [x, v] of d) if (x >= k) s += v; return s; }
if (process.argv[2] === "check") {
  for (const p of [0.34, 0.2, 0.14]) console.log(p, pctNet(50, p, 0.95), pctNet(50, p, 0.975), (pAtLeast(50, p, 6) * 100).toFixed(1) + "%");
}
