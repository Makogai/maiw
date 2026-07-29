# drivebay — Current handoff

## Goal

Confirm site boots after BOM fix; then pick next KAN item.

## Current state

- App HEAD **`d85e3c2`** (pushed): stripped UTF-8 BOM from 14 lang files
  (PowerShell `Set-Content` left BOM → corrupted Inertia/Livewire JSON →
  JSON popups / broken admin). Verified local Inertia JSON now starts with `{`.
- Prior: Vite HMR `127.0.0.1` (`1afeb2f`); AutoKlik trust blue (`b7df730`).

## Exact next action

Hard-refresh local. Redeploy Coolify so prod picks up `d85e3c2`. Then smoke
nav + admin login.
