import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOTS_DIR = path.join(__dirname, '..', 'upstream-snapshots');
const BASE_URL = 'https://puerhdirect.com';
const CONCURRENCY = 5;
const FETCH_TIMEOUT = 30000;

// 基础页面（固定监控）
const BASE_PAGES = [
  { url: '/', name: 'homepage' },
  { url: '/catalog', name: 'catalog' },
  { url: '/about', name: 'about' },
  { url: '/contact', name: 'contact' },
  { url: '/private-label', name: 'private-label' },
];

// 分类/子分类页面
const CATEGORY_PAGES = [
  { url: '/catalog/ripe-puerh', name: 'catalog/ripe-puerh' },
  { url: '/catalog/raw-puerh', name: 'catalog/raw-puerh' },
  { url: '/catalog/teaware', name: 'catalog/teaware' },
  { url: '/catalog/other-tea', name: 'catalog/other-tea' },
];

async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      clearTimeout(timeout);
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

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

// 提取页面结构指纹：区块数、标题层级、图片列表、关键CSS类
function extractStructure(html) {
  const sections = (html.match(/<section\b[^>]*>/gi) || []).length;
  const headings = {};
  for (const h of ['h1', 'h2', 'h3', 'h4']) {
    const matches = html.match(new RegExp(`<${h}\\b[^>]*>`, 'gi'));
    headings[h] = matches ? matches.length : 0;
  }
  const images = [...html.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/gi)].map(m => {
    const src = m[1];
    const alt = (m[0].match(/alt="([^"]*)"/) || [,''])[1];
    return { src, alt };
  });
  const mainCssClasses = [...new Set([...html.matchAll(/class="([^"]{5,60})"/gi)].map(m => m[1]).slice(0, 30))];

  return {
    sections,
    headings,
    imageCount: images.length,
    imageUrls: images.map(i => i.src.replace(BASE_URL, '').replace(/\?.*/, '')),
    imageAlts: images.map(i => i.alt),
    cssClassCount: mainCssClasses.length,
    cssClasses: mainCssClasses,
    htmlSize: html.length,
  };
}

function getStorePath(name) {
  const safe = name.replace(/\//g, '_');
  return {
    html: path.join(SNAPSHOTS_DIR, `${safe}.html`),
    txt: path.join(SNAPSHOTS_DIR, `${safe}.txt`),
    json: path.join(SNAPSHOTS_DIR, `${safe}.json`),
  };
}

function compareStructure(oldS, newS) {
  const diffs = [];
  if (oldS.sections !== newS.sections) diffs.push(`区块数: ${oldS.sections} → ${newS.sections}`);
  for (const h of ['h1', 'h2', 'h3', 'h4']) {
    if (oldS.headings[h] !== newS.headings[h]) diffs.push(`<${h}>: ${oldS.headings[h]} → ${newS.headings[h]}`);
  }
  if (oldS.imageCount !== newS.imageCount) diffs.push(`图片数: ${oldS.imageCount} → ${newS.imageCount}`);

  const oldImgSet = new Set(oldS.imageUrls);
  const newImgSet = new Set(newS.imageUrls);
  const addedImgs = [...newImgSet].filter(u => !oldImgSet.has(u));
  const removedImgs = [...oldImgSet].filter(u => !newImgSet.has(u));
  if (addedImgs.length > 0) diffs.push(`新增图片: +${addedImgs.length} 张`);
  if (removedImgs.length > 0) diffs.push(`移除图片: -${removedImgs.length} 张`);

  if (oldS.cssClassCount !== newS.cssClassCount) diffs.push(`CSS类数: ${oldS.cssClassCount} → ${newS.cssClassCount}`);
  if (oldS.htmlSize !== newS.htmlSize) diffs.push(`HTML大小: ${oldS.htmlSize} → ${newS.htmlSize} 字节`);

  return diffs;
}

function generateTextDiff(oldText, newText) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const oldSet = new Set(oldLines.map(l => l.trim()).filter(Boolean));
  const newSet = new Set(newLines.map(l => l.trim()).filter(Boolean));
  const added = [];
  const removed = [];
  for (const line of newSet) { if (!oldSet.has(line)) added.push(line); }
  for (const line of oldSet) { if (!newSet.has(line)) removed.push(line); }
  return {
    added: added.slice(0, 30),
    removed: removed.slice(0, 30),
  };
}

// 从 catalog 页面发现所有产品链接
async function discoverProductPages() {
  console.log('Discovering product links from catalog...');
  try {
    const html = await fetchWithRetry(BASE_URL + '/catalog');
    const links = [...new Set([...html.matchAll(/href="(\/catalog\/[^"]+)"/g)].map(m => m[1]))];
    const products = links
      .filter(l => !['/catalog/ripe-puerh', '/catalog/raw-puerh', '/catalog/teaware', '/catalog/other-tea'].includes(l))
      .filter(l => !l.includes('/brick/') && !l.includes('/cake/') && !l.includes('/tuocha/') && !l.includes('/loose/'))
      .filter(l => !l.includes('/tea-pets/') && !l.includes('/teapots-trays/') && !l.includes('/teaware-other/'))
      .filter(l => !l.includes('/dancong/') && !l.includes('/green-tea/') && !l.includes('/heicha/') && !l.includes('/red-tea/') && !l.includes('/tieguanyin/'))
      .filter(l => l !== '/catalog')
      .map(l => ({ url: l, name: l.replace('/catalog/', 'catalog/') }));

    // 子分类页面
    const subcats = links
      .filter(l => l.includes('/brick/') || l.includes('/cake/') || l.includes('/tuocha/') || l.includes('/loose/')
        || l.includes('/tea-pets/') || l.includes('/teapots-trays/') || l.includes('/teaware-other/')
        || l.includes('/dancong/') || l.includes('/green-tea/') || l.includes('/heicha/') || l.includes('/red-tea/') || l.includes('/tieguanyin/'))
      .map(l => ({ url: l, name: l.replace('/catalog/', 'catalog/') }));

    console.log(`  Found: ${BASE_PAGES.length} base + ${CATEGORY_PAGES.length} cats + ${subcats.length} subcats + ${products.length} products`);
    return { products, subcats };
  } catch (err) {
    console.error('  Discovery failed:', err.message);
    return { products: [], subcats: [] };
  }
}

async function processPages(pages, label) {
  const results = [];
  for (let i = 0; i < pages.length; i += CONCURRENCY) {
    const batch = pages.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(async page => {
      try {
        console.log(`  [${label}] ${page.url}`);
        const html = await fetchWithRetry(BASE_URL + page.url);
        return { page, html, ok: true };
      } catch (err) {
        console.error(`  [${label}] ERROR ${page.url}: ${err.message}`);
        return { page, html: null, ok: false, error: err.message };
      }
    }));
    results.push(...batchResults);
  }
  return results;
}

function analyzePage(page, html) {
  const cleaned = stripDynamicContent(html);
  const text = extractText(html);
  const structure = extractStructure(html);
  const paths = getStorePath(page.name);

  const oldText = fs.existsSync(paths.txt) ? fs.readFileSync(paths.txt, 'utf8') : '';
  const oldStructure = fs.existsSync(paths.json) ? JSON.parse(fs.readFileSync(paths.json, 'utf8')) : null;

  const textChanged = oldText !== text;
  const structureDiffs = oldStructure ? compareStructure(oldStructure, structure) : [];
  const structureChanged = structureDiffs.length > 0;

  // 始终更新快照
  fs.mkdirSync(path.dirname(paths.html), { recursive: true });
  fs.writeFileSync(paths.html, html);
  fs.writeFileSync(paths.txt, text);
  fs.writeFileSync(paths.json, JSON.stringify(structure, null, 2));

  if (!textChanged && !structureChanged) return null;

  const textDiff = textChanged ? generateTextDiff(oldText, text) : { added: [], removed: [] };

  return {
    name: page.name,
    url: BASE_URL + page.url,
    textChanged,
    structureChanged,
    structureDiffs,
    addedLines: textDiff.added,
    removedLines: textDiff.removed,
    structure: { old: oldStructure, new: structure },
  };
}

async function main() {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });

  const { products, subcats } = await discoverProductPages();

  const allPages = [...BASE_PAGES, ...CATEGORY_PAGES, ...subcats, ...products];
  console.log(`\nMonitoring ${allPages.length} pages...\n`);

  const results = await processPages(allPages, 'fetch');

  const errors = results.filter(r => !r.ok);
  const okResults = results.filter(r => r.ok);

  console.log(`\nAnalyzing ${okResults.length} pages (${errors.length} errors)...\n`);

  const changes = [];
  for (const { page, html } of okResults) {
    const change = analyzePage(page, html);
    if (change) {
      changes.push(change);
      const kind = [change.textChanged && '文本', change.structureChanged && '结构'].filter(Boolean).join('+');
      console.log(`  → ${kind}变化: ${page.name}`);
      change.structureDiffs.forEach(d => console.log(`      ${d}`));
    } else {
      console.log(`  → 无变化: ${page.name}`);
    }
  }

  if (errors.length === allPages.length && allPages.length > 0) {
    console.error(`\nAll ${allPages.length} pages failed. Exiting with error.`);
    process.exit(1);
  }

  // 提交快照
  if (process.env.GITHUB_ACTIONS) {
    try {
      execSync('git config user.name "puerh-web"');
      execSync('git config user.email "puerh-web@users.noreply.github.com"');
      execSync('git add upstream-snapshots/');
      const diffCheck = execSync('git diff --staged --quiet', { stdio: 'pipe' });
      // no diff → nothing to commit
    } catch {
      // diff exists → commit
      execSync(`git commit -m "chore: 更新上游快照 $(date +%Y-%m-%d)"`);
      execSync('git push');
      console.log('Snapshots committed.');
    }
  }

  if (changes.length === 0) {
    console.log('\n✓ 无变化。');
    return;
  }

  console.log(`\n${changes.length} 个页面发生变化，生成报告...\n`);

  const date = new Date().toISOString().slice(0, 10);
  const textChanges = changes.filter(c => c.textChanged);
  const structureChanges = changes.filter(c => c.structureChanged && !c.textChanged);

  const sections = [
    `## 上游变化报告 — ${date}`,
    '',
    `> 监控 **${allPages.length}** 个页面，检测到 **${changes.length}** 个变化`,
    `> ${textChanges.length} 个文本变化 · ${structureChanges.length} 个结构变化 · ${errors.length} 个抓取失败`,
    '',
  ];

  if (textChanges.length > 0) {
    sections.push('## 📝 文本内容变化');
    sections.push('');
    for (const c of textChanges) {
      sections.push(`### [${c.name}](${c.url})`);
      sections.push('');
      if (c.structureDiffs.length > 0) {
        sections.push('**结构变化:**');
        c.structureDiffs.forEach(d => sections.push(`- ${d}`));
        sections.push('');
      }
      if (c.addedLines.length > 0) {
        sections.push('**新增内容:**');
        sections.push('');
        c.addedLines.slice(0, 15).forEach(l => sections.push(`- ${l}`));
        if (c.addedLines.length > 15) sections.push(`- ... 共 ${c.addedLines.length} 条`);
        sections.push('');
      }
      if (c.removedLines.length > 0) {
        sections.push('**移除内容:**');
        sections.push('');
        c.removedLines.slice(0, 15).forEach(l => sections.push(`- ${l}`));
        if (c.removedLines.length > 15) sections.push(`- ... 共 ${c.removedLines.length} 条`);
        sections.push('');
      }
    }
  }

  if (structureChanges.length > 0) {
    sections.push('## 🏗️ 仅结构变化（文本未变）');
    sections.push('');
    for (const c of structureChanges) {
      sections.push(`### [${c.name}](${c.url})`);
      c.structureDiffs.forEach(d => sections.push(`- ${d}`));
      sections.push('');
    }
  }

  if (errors.length > 0) {
    sections.push('## ⚠️ 抓取失败');
    sections.push('');
    errors.forEach(e => sections.push(`- **${e.page.name}**: ${e.error}`));
    sections.push('');
  }

  sections.push('---');
  sections.push(`> 由 [upstream monitor workflow](https://github.com/Shunqu-668/puerh-astro/actions/workflows/monitor-upstream.yml) 自动生成`);
  sections.push(`> 监控范围: ${BASE_PAGES.length} 基础页 + ${CATEGORY_PAGES.length} 分类 + ${subcats.length} 子分类 + ${products.length} 产品 = ${allPages.length} 页`);
  sections.push('');
  sections.push('🤖 请 @Shunqu-668 审核变化后手动同步对应页面。');

  const issueBody = sections.join('\n');
  const tmpFile = path.join(os.tmpdir(), 'puerh-upstream-issue.md');
  fs.writeFileSync(tmpFile, issueBody);

  if (process.env.GITHUB_ACTIONS) {
    try {
      execSync(`gh issue create --title "上游变化 — ${date}" --body-file "${tmpFile}" --label "upstream-change"`, { stdio: 'inherit' });
      console.log('Issue created.');
    } catch (err) {
      console.error('Failed to create issue:', err.message);
      console.log('Issue body saved to:', tmpFile);
    }
  } else {
    console.log('[local run] Report saved to:', tmpFile);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
