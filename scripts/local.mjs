import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
process.env.ASTRO_TELEMETRY_DISABLED = '1';
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 12)) {
  console.error('Node.js 22.12 or later is required. Recommended: Node 24 LTS.');
  process.exit(1);
}
const mode = process.argv[2] || 'preview';
const astro = path.join(root, 'node_modules/astro/bin/astro.mjs');
function run(file, args) {
  const result = spawnSync(process.execPath, [file, ...args], { cwd: root, env: process.env, stdio: 'inherit', windowsHide: true });
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) process.exit(result.status || 1);
}
if (mode === 'setup') {
  const npm = path.resolve(root, '../tooling/npm/package/bin/npm-cli.js');
  if (!fs.existsSync(npm)) {
    console.error('Use npm ci --ignore-scripts in this folder with a standard Node.js installation.');
    process.exit(1);
  }
  process.env.npm_config_cache = path.resolve(root, '../tooling/npm-cache');
  run(npm, ['ci', '--ignore-scripts', '--no-audit', '--no-fund']);
} else {
  if (!fs.existsSync(astro)) {
    console.error('Dependencies missing. Run npm ci --ignore-scripts or node scripts/local.mjs setup first.');
    process.exit(1);
  }
  if (mode === 'preview') run(astro, ['dev', '--host', '127.0.0.1', '--port', '4321']);
  else if (mode === 'check') {
    run(astro, ['build']);
    run(path.join(root, 'scripts/verify-site.mjs'), []);
    run(path.join(root, 'scripts/verify-seo.mjs'), []);
  } else {
    console.error('Supported modes: preview, check, setup');
    process.exit(1);
  }
}
