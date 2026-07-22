#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const MEMORY = path.join(ROOT, 'memory');
const [command = 'status', selected] = process.argv.slice(2);
const required = ['meta.json', 'NOW.md', 'INDEX.md', 'topics/architecture.md', 'topics/domain.md', 'topics/conventions.md', 'topics/decisions.md'];
function exists(file) { return fs.existsSync(file); }
function read(file) { return fs.readFileSync(file, 'utf8'); }
function git(args, cwd) { try { return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } }
function names() { return selected ? [selected] : exists(MEMORY) ? fs.readdirSync(MEMORY, { withFileTypes: true }).filter(x => x.isDirectory()).map(x => x.name).sort() : []; }
if (!['status', 'validate'].includes(command)) { console.error('usage: node bin/memory.js status|validate [app]'); process.exit(2); }
let errors = 0;
for (const name of names()) {
  const dir = path.join(MEMORY, name);
  const issues = [];
  for (const file of required) if (!exists(path.join(dir, file))) issues.push(`missing ${file}`);
  let meta = null;
  if (exists(path.join(dir, 'meta.json'))) try { meta = JSON.parse(read(path.join(dir, 'meta.json'))); } catch { issues.push('invalid meta.json'); }
  if (meta && (meta.schemaVersion !== 1 || meta.app !== name)) issues.push('metadata identity/schema mismatch');
  for (const file of ['NOW.md', 'INDEX.md']) {
    const target = path.join(dir, file);
    if (exists(target) && read(target).split(/\r?\n/).length > (file === 'NOW.md' ? 120 : 150)) issues.push(`${file} exceeds token budget`);
  }
  if (command === 'validate') {
    if (issues.length) { for (const issue of issues) console.log(`ERROR ${name}: ${issue}`); errors += issues.length; }
    else console.log(`OK ${name}`);
  } else {
    const appDir = path.join(ROOT, 'apps', name);
    const head = exists(appDir) ? git(['rev-parse', 'HEAD'], appDir) : null;
    const fresh = !head ? 'no Git provenance' : !meta?.sourceCommit ? 'never synchronized' : head === meta.sourceCommit ? 'at memory commit' : 'code moved';
    console.log(`${name}: ${meta?.status || 'invalid'} | ${fresh}${issues.length ? ` | ${issues.length} issue(s)` : ''}`);
  }
}
if (!names().length) console.log('No app memory registered.');
if (errors) process.exit(1);

