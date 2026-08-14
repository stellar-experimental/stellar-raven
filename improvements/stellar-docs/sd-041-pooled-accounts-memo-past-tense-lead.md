---
id: sd-041
service: stellar-docs
status: verified
discovered: 2026-08-14
upstreamTitle: The pooled-accounts guide opens by placing memos in the past, then tells readers to keep supporting memos
evidence:
  - 2026-08-14 live read of https://developers.stellar.org/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos returned the past-tense lead and the current-practice recommendation on the same page
  - eval round 2026-08-14, main stamp 2026-08-14T03-56-23-variantA, Stellar Docs rows 10 and 14 both reproduced the misleading lead
  - Solo scratchpad 809, todo 1541 finding F2
---

## Finding

The pooled-accounts guide opens with a past-tense statement about memos. The
same page later tells the reader to keep supporting memos.

The lead says: "We used memos in the past for this purpose, however, using muxed
accounts is better in the long term."

The intro note then says: "At this time, there isn't support for muxed accounts
by all wallets, exchanges, and anchors, so you may want to support both memos
and muxed accounts, at least for a while."

The "Memo - differentiated accounts" section repeats the second position:
"Supporting muxed accounts is better in the long term, but for now you may want
to support both memos and muxed accounts as all exchanges, anchors, and wallets
may not support muxed accounts."

A reader who stops at the lead concludes that memos are historical. That
conclusion is wrong. Memos remain the required path for many exchanges,
anchors, and wallets today. The page is the canonical guide for this decision,
so the lead controls the reader's first impression.

## Evidence

The live page read on 2026-08-14 returned all three sentences above.

Two unrelated eval rows in the 2026-08-14 round read the page and repeated the
past-tense framing. The rows are separate questions with separate transcripts.
This is a page-wording defect, not a single reader error.

## Recommendation

Change the lead to state current practice. One sentence is enough. For example:
"Memos and muxed accounts both identify a user inside a pooled account today.
Muxed accounts are the better long-term choice."

Keep the existing "support both" guidance. Remove the past tense from the lead
so the page states one position.
