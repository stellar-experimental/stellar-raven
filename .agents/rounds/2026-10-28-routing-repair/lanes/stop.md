# Lead: stop rule reached (2026-10-29)

C6 is not wired. The offline prototype fails its validation (both lanes agree; verify design stop
rule §4.3). Six designs are spent (C1–C6). No further candidate.

Implementation lane, final tasks:

1. Two source-only diagnostics on the UNCHANGED main scorer (no candidate code), each with all
   twelve checks (D1 reading and strict), the addendum-2 per-row table against baseline-main, the
   D2 guard, and the 149 probes:
   - `src-scout`: fresh Scout 1.9.111 + the stellar-light pin; main Docs titles (666);
     `analyzeHackathonSubmissions` and `getHackathonSubmission` exposed; `reviewSubmission`,
     `locateSource`, RWA, quality, verify excluded.
   - `src-titles`: main Scout 1.9.61 and pin; fresh Docs titles (682) only.
   These tell the owner whether the Scout absorb and the title absorb can ship apart from the
   repair. Do not change the tracked tree.
2. `tmp/impl/failure-analysis.md`: for each of the twelve checks and the D2 guard, the best candidate
   result, why each mechanism failed, the negative design evidence (including C6 D1–D3 from
   `tmp/verify/c6-offline.md`), the best partial candidates and what each fixes and costs, the two
   diagnostics above, and any real upstream finding (Scout or Docs routing text that causes
   captures) with evidence, or "none". Total Clef spend.
3. Reply with one line naming the file.
