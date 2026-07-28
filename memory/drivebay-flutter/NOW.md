# drivebay-flutter — Current handoff

## Goal

QA and ship **KAN-52** contact-seller default-to-chat on top of app HEAD `071ec63`
(local uncommitted).

## Current state

- App HEAD is **`071ec63`** (+ uncommitted KAN-52).
- **KAN-52 In Review (local)**:
  - Listing detail Contact no longer dead-ends when `contact_channels` is null.
  - Authenticated buyers open the contact sheet with in-app chat only; guests go to login.
  - When the seller shared phone/WhatsApp/Viber/email, the multi-channel sheet is unchanged.
  - Hint copy `sellerContactViaChatOnly` when chat is the only option.
  - `ListingContactChannels.hasExternalChannels` helper + unit test.
- Prior shipped: KAN-23/24/35 Done.

## Exact next action

1. Commit + push `apps/drivebay-flutter` KAN-52.
2. QA: listing with no shared contacts → Contact opens chat sheet; listing with phone → sheet
   still shows channels.
3. Mark KAN-52 Done after QA.
