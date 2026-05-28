import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOTS_DIR = path.join(__dirname, '..', 'upstream-snapshots');
const BASE_URL = 'https://puerhdirect.com';

const PAGES = [
  { url: '/', name: 'homepage' },
  { url: '/catalog', name: 'catalog' },
  { url: '/about', name: 'about' },
  { url: '/contact', name: 'contact' },
  { url: '/private-label', name: 'private-label' },
];

function stripDynamicContent(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractText(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchPage(page) {
  const url = BASE_URL + page.url;
  console.log(`Fetching: ${url}`);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'PUERH-DIRECT-Monitor/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

function getSnapshotPath(name) {
  return path.join(SNAPSHOTS_DIR, `${name}.html`);
}

function getTextPath(name) {
  return path.join(SNAPSHOTS_DIR, `${name}.txt`);
}

function generateDiff(oldText, newText) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  let added = [];
  let removed = [];

  const oldSet = new Set(oldLines.map(l => l.trim()).filter(Boolean));
  const newSet = new Set(newLines.map(l => l.trim()).filter(Boolean));

  for (const line of newSet) {
    if (!oldSet.has(line)) added.push(line);
  }
  for (const line of oldSet) {
    if (!newSet.has(line)) removed.push(line);
  }

  return { added: added.slice(0, 50), removed: removed.slice(0, 50) };
}

async function main() {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });

  const changes = [];

  for (const page of PAGES) {
    try {
      const html = await fetchPage(page);
      const cleaned = stripDynamicContent(html);
      const text = extractText(html);

      const htmlPath = getSnapshotPath(page.name);
      const textPath = getTextPath(page.name);

      const oldCleaned = fs.existsSync(htmlPath) ? stripDynamicContent(fs.readFileSync(htmlPath, 'utf8')) : '';
      const oldText = fs.existsSync(textPath) ? fs.readFileSync(textPath, 'utf8') : '';

      if (oldCleaned !== cleaned) {
        const diff = generateDiff(oldText, text);
        changes.push({
          name: page.name,
          url: BASE_URL + page.url,
          htmlSize: { old: oldCleaned.length, new: cleaned.length },
          addedLines: diff.added,
          removedLines: diff.removed,
        });

        fs.writeFileSync(htmlPath, html);
        fs.writeFileSync(textPath, text);
        console.log(`  → CHANGED: ${page.name}`);
      } else {
        console.log(`  → unchanged: ${page.name}`);
      }
    } catch (err) {
      console.error(`  → ERROR ${page.name}: ${err.message}`);
    }
  }

  if (changes.length === 0) {
    console.log('\nNo changes detected.');
    return;
  }

  console.log(`\n${changes.length} page(s) changed. Creating issue...\n`);

  const date = new Date().toISOString().slice(0, 10);
  const issueBody = [
    `## 上游变化报告 — ${date}`,
    '',
    `> 自动检测到 **${changes.length}** 个页面发生变化`,
    '',
    ...changes.map(c => {
      const parts = [
        `### [${c.name}](${c.url})`,
        '',
        `页面大小: ${c.htmlSize.old.toLocaleString()} → ${c.htmlSize.new.toLocaleString()} 字节`,
      ];
      if (c.addedLines.length > 0) {
        parts.push('');
        parts.push('**新增内容:**');
        parts.push('');
        parts.push(...c.addedLines.slice(0, 15).map(l => `- ${l}`));
        if (c.addedLines.length > 15) parts.push(`- ... 共 ${c.addedLines.length} 条`);
      }
      if (c.removedLines.length > 0) {
        parts.push('');
        parts.push('**移除内容:**');
        parts.push('');
        parts.push(...c.removedLines.slice(0, 15).map(l => `- ${l}`));
        if (c.removedLines.length > 15) parts.push(`- ... 共 ${c.removedLines.length} 条`);
      }
      return parts.join('\n');
    }),
    '',
    '---',
    '> 由 [upstream monitor workflow](https://github.com/Shunqu-668/puerh-astro/actions/workflows/monitor-upstream.yml) 自动生成',
    '',
    `🤖 请 @Shunqu-668 审核后回复 "sync: <页面名>" 触发同步`,
  ].join('\n');

  const tmpFile = path.join(os.tmpdir(), 'puerh-upstream-issue.md');
  fs.writeFileSync(tmpFile, issueBody);

  if (process.env.GITHUB_ACTIONS) {
    execSync(`gh issue create --title "上游变化 — ${date}" --body-file ${tmpFile} --label "upstream-change"`, {
      stdio: 'inherit',
    });
    console.log('\nIssue created.');
  } else {
    console.log('\n[local run] Issue body written to:', tmpFile);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
