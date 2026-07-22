#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const required = [
  '.agents/skills/maiw/SKILL.md',
  '.agents/skills/maiw/agents/openai.yaml',
  '.agents/skills/maiw/references/operations.md',
  '.claude/skills/maiw/SKILL.md',
  '.claude/skills/maiw/references/operations.md',
  '.claude/commands/maiw.md',
  '.claude/commands/maiw-clone.md',
  '.claude/commands/maiw-resume.md',
  '.cursor/commands/maiw.md',
  '.cursor/commands/maiw-clone.md',
  '.cursor/commands/maiw-resume.md',
  '.cursor/rules/maiw.mdc',
  'AGENTS.md',
  'CLAUDE.md',
];
let failed = false;
for (const file of required) {
  const target = path.join(ROOT, file);
  if (!fs.existsSync(target)) { console.error(`Missing adapter file: ${file}`); failed = true; }
}
for (const file of ['.agents/skills/maiw/SKILL.md', '.claude/skills/maiw/SKILL.md']) {
  const body = fs.readFileSync(path.join(ROOT, file), 'utf8');
  if (!/^---\r?\n[\s\S]*?^name: maiw\r?$/m.test(body) || !/^description: .+$/m.test(body)) {
    console.error(`Invalid skill frontmatter: ${file}`); failed = true;
  }
  if (/TODO|PLACEHOLDER/.test(body)) { console.error(`Unresolved placeholder: ${file}`); failed = true; }
}
if (failed) process.exit(1);
console.log('Claude, Cursor, and Codex adapter packages are valid.');
