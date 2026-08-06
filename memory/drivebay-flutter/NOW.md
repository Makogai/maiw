# drivebay-flutter — Current handoff

## Goal

Shipped **KAN-117** polish + **KAN-118** mark-sold UI resilience on `origin/main` at `366a592`.

## Current state

Shipped in `366a592`:

- Chat picker: `pickMultiImage` (images only)
- Alerts: filter `message.received`; skip in-app banner for chat
- Listing detail: iPhone safe-area / sticky buyer bar; Mark sold on owner banner
- Mark sold: refresh lists even on API error; pop detail on success

Paired API: drivebay `ffc7d56` (KAN-117 inbox + KAN-118 Meili soft-fail)

Prior: **KAN-116** placeholders at `b5011b0`

## Exact next action

1. Hot-restart QA on device after API deploy: mark sold, alerts, chat attach, listing chrome
2. Transition **KAN-117** / **KAN-118** → In Review after QA

## Verification

- Pushed clean (skipped `android/build/` and GeneratedPluginRegistrant noise)
