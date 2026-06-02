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
    .replace(/<link[^>]*rel="stylesheet"[^>]*>/gi, '')
    .replace(/\b[a-f0-9]{8,}\b/gi, 'HASH')
    .replace(/"[a-f0-9]{8,}"/gi, '"HASH"')
    .replace(/\/[a-f0-9]{8,}\./g, '/HASH.')
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
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

  let errorCount = 0;

  for (const page of PAGES) {
    try {
      const html = await fetchPage(page);
      const cleaned = stripDynamicContent(html);
      const text = extractText(html);

      const htmlPath = getSnapshotPath(page.name);
      const textPath = getTextPath(page.name);

      const oldCleaned = fs.existsSync(htmlPath) ? stripDynamicContent(fs.readFileSync(htmlPath, 'utf8')) : '';
      const oldText = fs.existsSync(textPath) ? fs.readFileSync(textPath, 'utf8') : '';

      const textChanged = oldText !== text;
      const htmlChanged = oldCleaned !== cleaned;

      if (textChanged) {
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
        console.log(`  → TEXT CHANGED: ${page.name}`);
      } else if (htmlChanged) {
        fs.writeFileSync(htmlPath, html);
        fs.writeFileSync(textPath, text);
        console.log(`  → html-only change (ignored): ${page.name}`);
      } else {
        console.log(`  → unchanged: ${page.name}`);
      }
    } catch (err) {
      errorCount++;
      console.error(`  → ERROR ${page.name}: ${err.message}`);
        if (err.cause) console.error(`    cause: ${err.cause}`);
    }
  }

  if (errorCount === PAGES.length) {
    console.error(`\nAll ${PAGES.length} pages failed to fetch. Exiting with error.`);
    process.exit(1);
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
    try {
      execSync(`gh issue create --title "上游变化 — ${date}" --body-file ${tmpFile} --label "upstream-change"`, {
        stdio: 'inherit',
      });
      console.log('\nIssue created.');
    } catch (err) {
      console.error('Failed to create issue:', err.message);
      console.log('Issue body saved to:', tmpFile);
    }
  } else {
    console.log('\n[local run] Issue body written to:', tmpFile);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
