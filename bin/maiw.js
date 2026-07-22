#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const APPS = path.join(ROOT, 'apps');
const MEMORY = path.join(ROOT, 'memory');
const [operation = 'help', ...args] = process.argv.slice(2);

function fail(message, code = 1) { console.error(`maiw: ${message}`); process.exit(code); }
function exists(file) { return fs.existsSync(file); }
function directories(root) { return exists(root) ? fs.readdirSync(root, { withFileTypes: true }).filter(x => x.isDirectory()).map(x => x.name).sort() : []; }
function valid(name) { return /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(name || ''); }
function deriveName(url) { return url.replace(/[?#].*$/, '').replace(/\.git$/, '').split(/[/:]/).pop(); }
function runNode(script, scriptArgs) {
  const result = spawnSync(process.execPath, [path.join(ROOT, 'bin', script), ...scriptArgs], { cwd: ROOT, encoding: 'utf8', stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
function inferName(requested) {
  if (requested) return requested;
  const relative = path.relative(APPS, process.cwd());
  if (relative && !relative.startsWith('..') && !path.isAbsolute(relative)) return relative.split(path.sep)[0];
  const candidates = directories(APPS).filter(name => name !== 'README.md');
  if (candidates.length === 1) return candidates[0];
  fail(candidates.length ? `multiple apps found; specify one: ${candidates.join(', ')}` : 'no app found under apps/');
}
function register(name) {
  if (!valid(name)) fail('invalid app name');
  runNode('register.js', [name]);
  return name;
}
function metadata(name) {
  const file = path.join(MEMORY, name, 'meta.json');
  if (!exists(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { fail(`memory/${name}/meta.json is invalid`); }
}
function printNext(name) {
  const meta = metadata(name);
  const operation = !meta || meta.status === 'unlearned' ? 'learn' : 'resume';
  console.log(`Next (Claude/Cursor): /maiw-${operation} ${name}`);
  console.log(`Next (Codex): $maiw ${operation} ${name}`);
}
function checkAdapters(name) {
  const app = path.join(APPS, name);
  const expected = [
    'CLAUDE.md',
    'AGENTS.md',
    '.claude/commands/maiw.md',
    '.claude/commands/maiw-clone.md',
    '.claude/commands/maiw-resume.md',
    '.claude/skills/maiw/SKILL.md',
    '.cursor/commands/maiw.md',
    '.cursor/commands/maiw-clone.md',
    '.cursor/commands/maiw-resume.md',
    '.cursor/rules/continuity.mdc',
    '.agents/skills/maiw/SKILL.md',
  ];
  const missing = expected.filter(file => !exists(path.join(app, file)));
  if (missing.length) fail(`${name} is missing adapters: ${missing.join(', ')}`);
  console.log(`Adapters OK: Claude, Cursor, Codex (${name})`);
}

switch (operation) {
  case 'clone': {
    const [url, requested] = args;
    if (!url) fail('usage: maiw clone <git-url> [name]');
    const name = requested || deriveName(url);
    if (!valid(name)) fail('could not derive a safe app name; provide one explicitly');
    const destination = path.join(APPS, name);
    if (!exists(destination)) {
      fs.mkdirSync(APPS, { recursive: true });
      execFileSync('git', ['clone', '--', url, destination], { cwd: ROOT, stdio: 'inherit' });
    } else {
      console.log(`apps/${name} already exists; clone skipped.`);
    }
    register(name);
    printNext(name);
    break;
  }
  case 'register': {
    const name = register(inferName(args[0]));
    printNext(name);
    break;
  }
  case 'ensure': {
    const [requested, url] = args;
    if (!requested) fail('usage: maiw ensure <name> [git-url]');
    if (!exists(path.join(APPS, requested))) {
      if (!url) fail(`apps/${requested} is missing; provide its Git URL`);
      execFileSync('git', ['clone', '--', url, path.join(APPS, requested)], { cwd: ROOT, stdio: 'inherit' });
    }
    register(requested);
    printNext(requested);
    break;
  }
  case 'status':
    runNode('memory.js', ['status', ...(args[0] ? [args[0]] : [])]);
    break;
  case 'doctor': {
    const name = inferName(args[0]);
    runNode('memory.js', ['validate', name]);
    checkAdapters(name);
    console.log('Wrapper scripts and registered memory are structurally valid.');
    break;
  }
  case 'learn':
  case 'resume':
  case 'handoff':
  case 'sync':
  case 'review': {
    const name = inferName(args[0]);
    if (!exists(path.join(MEMORY, name))) register(name);
    console.log(JSON.stringify({ agentOperation: operation, app: name, memory: `memory/${name}`, protocol: 'core/MAIW.md' }, null, 2));
    break;
  }
  case 'help':
    console.log('Usage: maiw <clone|register|ensure|learn|resume|handoff|sync|review|status|doctor|help> [args]');
    console.log('Examples:');
    console.log('  maiw clone <git-url> [name]');
    console.log('  maiw register [name]');
    console.log('  maiw ensure <name> [git-url]');
    console.log('  maiw resume <name>');
    break;
  default:
    fail(`unknown operation "${operation}"; run maiw help`, 2);
}
