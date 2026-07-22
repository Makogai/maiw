#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const name = process.argv[2];

function fail(message) { console.error(`register: ${message}`); process.exit(1); }
function exists(file) { return fs.existsSync(file); }
function read(file) { return fs.readFileSync(file, 'utf8'); }
function ensure(dir) { fs.mkdirSync(dir, { recursive: true }); }
function write(file, value) { ensure(path.dirname(file)); fs.writeFileSync(file, value); }
function posix(file) { return file.split(path.sep).join('/'); }
function git(args, cwd) {
  try { return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return null; }
}

if (!name) fail('usage: node bin/register.js <app-folder>');
if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(name)) fail('invalid app folder name');
const appsRoot = path.join(ROOT, 'apps');
const appDir = path.resolve(appsRoot, name);
if (path.dirname(appDir) !== appsRoot || !exists(appDir)) fail(`apps/${name} does not exist`);

const memoryDir = path.join(ROOT, 'memory', name);
const templateDir = path.join(ROOT, 'templates');
ensure(path.join(memoryDir, 'topics'));
const files = {
  'NOW.md': 'NOW.md',
  'INDEX.md': 'INDEX.md',
  'topics/architecture.md': 'architecture.md',
  'topics/domain.md': 'domain.md',
  'topics/conventions.md': 'conventions.md',
  'topics/decisions.md': 'decisions.md',
};
for (const [destination, template] of Object.entries(files)) {
  const target = path.join(memoryDir, destination);
  if (!exists(target)) write(target, read(path.join(templateDir, template)).replace(/\{\{APP\}\}/g, name));
}

const metaFile = path.join(memoryDir, 'meta.json');
let old = {};
if (exists(metaFile)) { try { old = JSON.parse(read(metaFile)); } catch { fail(`memory/${name}/meta.json is invalid`); } }
const meta = {
  schemaVersion: 1,
  app: name,
  appPath: `apps/${name}`,
  remote: git(['config', '--get', 'remote.origin.url'], appDir),
  sourceCommit: old.sourceCommit || null,
  status: old.status || 'unlearned',
  registeredAt: old.registeredAt || new Date().toISOString(),
  lastSynchronizedAt: old.lastSynchronizedAt || null,
};
write(metaFile, JSON.stringify(meta, null, 2) + '\n');

const values = {
  APP: name,
  WRAPPER_DIR: posix(ROOT),
  CORE_DIR: posix(path.join(ROOT, 'core')),
  MEMORY_DIR: posix(memoryDir),
};
function render(template) {
  let output = read(path.join(templateDir, template));
  for (const [key, value] of Object.entries(values)) output = output.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  return output;
}
write(path.join(appDir, 'CLAUDE.md'), render('CLAUDE.md'));
write(path.join(appDir, 'AGENTS.md'), render('AGENTS.md'));
write(path.join(appDir, '.cursor', 'rules', 'continuity.mdc'), render('cursor-rule.mdc'));
const appCommand = (source) => read(source)
  .replace(/`core\//g, `\`${posix(path.join(ROOT, 'core'))}/`)
  .replace(/node bin\/maiw\.js/g, `node ${posix(path.join(ROOT, 'bin', 'maiw.js'))}`);
const cursorCommandsDir = path.join(appDir, '.cursor', 'commands');
for (const legacy of ['learn.md', 'resume.md', 'handoff.md', 'sync-memory.md', 'review.md']) {
  const target = path.join(cursorCommandsDir, legacy);
  if (exists(target)) fs.rmSync(target);
}
for (const file of fs.readdirSync(path.join(ROOT, '.cursor', 'commands'))) {
  if (file.endsWith('.md')) write(path.join(appDir, '.cursor', 'commands', file), appCommand(path.join(ROOT, '.cursor', 'commands', file)));
}
for (const file of fs.readdirSync(path.join(ROOT, '.claude', 'commands'))) {
  if (file.endsWith('.md')) write(path.join(appDir, '.claude', 'commands', file), appCommand(path.join(ROOT, '.claude', 'commands', file)));
}
fs.cpSync(path.join(ROOT, '.claude', 'skills', 'maiw'), path.join(appDir, '.claude', 'skills', 'maiw'), { recursive: true, force: true });
fs.cpSync(path.join(ROOT, '.agents', 'skills', 'maiw'), path.join(appDir, '.agents', 'skills', 'maiw'), { recursive: true, force: true });

const gitDir = git(['rev-parse', '--git-dir'], appDir);
if (gitDir) {
  const excludeFile = path.resolve(appDir, gitDir, 'info', 'exclude');
  ensure(path.dirname(excludeFile));
  let exclude = exists(excludeFile) ? read(excludeFile) : '';
  for (const item of ['CLAUDE.md', 'AGENTS.md', '.cursor/', '.claude/', '.agents/']) {
    if (!exclude.split(/\r?\n/).includes(item)) exclude += `${exclude && !exclude.endsWith('\n') ? '\n' : ''}${item}\n`;
  }
  write(excludeFile, exclude);
}

console.log(`Registered ${name} for Claude, Cursor, and Codex.`);
console.log(`Memory: memory/${name}/`);
console.log(`Next (Claude/Cursor): /maiw-learn ${name}`);
console.log(`Next (Codex): $maiw learn ${name}`);
