#!/usr/bin/env node
/**
 * Git commit/push attribution reminder (OPERATING.md §9 / ATTRIBUTION.md).
 *
 * Allows commit/push so agents can ship when the human has Attribution OFF.
 * Never add AI Co-authored-by / Made-with trailers or change git identity.
 */
const fs = require('fs');

let input = {};
try {
  input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
} catch {
  input = {};
}

const command = String(input.command || '');
const touchesCommit = /\bgit\b[\s\S]*\bcommit\b/.test(command);
const touchesPush = /\bgit\b[\s\S]*\bpush\b/.test(command);

if (!touchesCommit && !touchesPush) {
  process.stdout.write(JSON.stringify({ permission: 'allow' }));
  process.exit(0);
}

process.stdout.write(
  JSON.stringify({
    permission: 'allow',
    agent_message:
      'Git commit/push allowed. After commit, verify git log -1 --format=full has no AI trailers.',
  }),
);
process.exit(0);
