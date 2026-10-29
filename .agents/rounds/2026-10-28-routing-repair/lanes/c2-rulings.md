# Lead rulings on C2 (2026-10-28), from tmp/verify/c2.md

- Plan accepted (`tmp/impl/plan.md`). Fold `tmp/verify/design-check8.md` into C5/C6 when it lands.
- E1 and E2 are corrections to the C2 mechanism, not new mechanisms. Fold them into C3's parent:
  "supported" uses one shared canonicalization with the scorer (no ad hoc suffix list; `connected`
  vs `connect`, `publishes` vs `publish`, `used` vs `use` must count as supported;
  `openzeppelin`⊃`open` and `specific`⊃`spec` must not), and the coverage bonus and field weight
  reference the vendor constants instead of copies.
- OZ −top3 and Friendbot −top5: the removed evidence was spurious, so the mechanism stays. The
  losses are NOT accepted as final. A passing candidate must recover them through legitimate
  evidence or selection (C3/C4), because check 10 requires no extended regression and rule 2
  requires an accepted cause. "Honest loss" does not satisfy check 10.
