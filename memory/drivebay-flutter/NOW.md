# drivebay-flutter — Current handoff

## Goal

Carry forward after shipped **KAN-52** contact-seller chat default at app HEAD `dfe2a5c`.

## Current state

- App HEAD is **`dfe2a5c`**.
- **KAN-52 Done `dfe2a5c`**:
  - Listing detail Contact no longer dead-ends when `contact_channels` is null.
  - Authenticated buyers open the contact sheet with in-app chat only; guests go to login.
  - When the seller shared phone/WhatsApp/Viber/email, the multi-channel sheet is unchanged.
  - Hint copy `sellerContactViaChatOnly` when chat is the only option.
- Prior shipped: KAN-23/24/35 Done.

## Exact next action

Pick the next Flutter/backend To Do from the KAN board.
