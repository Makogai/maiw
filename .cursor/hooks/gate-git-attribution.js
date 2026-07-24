#!/usr/bin/env node
/**
 * Pause agent git commit/push so the human can verify no AI attribution trailers.
 * Reads Cursor beforeShellExecution JSON on stdin; writes permission JSON on stdout.
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

const action = touchesPush ? 'push' : 'commit';
const userMessage = [
  `Agent wants to run git ${action}.`,
  'Before approving, confirm Cursor attribution is OFF',
  '(Cursor Settings → Agents → Attribution → Commit Attribution + PR Attribution),',
  'then check the commit has no Co-authored-by / Made-with / Cursor / Claude / Codex trailer:',
  '  git log -1 --format=full',
  touchesPush
    ? 'Prefer committing/pushing yourself if unsure.'
    : 'If a trailer appears, abort and strip it before any push.',
].join(' ');

const agentMessage = [
  `Stopped before git ${action} (OPERATING.md §9).`,
  'Do not retry silently. Tell the user to verify attribution is disabled and that',
  '`git log -1 --format=full` has no AI Co-authored-by / Made-with trailers,',
  'then let them approve this command or run the git step themselves.',
].join(' ');

process.stdout.write(
  JSON.stringify({
    permission: 'ask',
    user_message: userMessage,
    agent_message: agentMessage,
  }),
);
process.exit(0);
