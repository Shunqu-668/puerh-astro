import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOTS_DIR = path.join(__dirname, '..', 'upstream-snapshots');
const DIST_DIR = path.join(__dirname, '..', 'dist');
const UPSTREAM_URL = 'https://puerhdirect.com';
const OUR_URL = 'https://puerhdirect.ru';
const CONCURRENCY = 5;
const FETCH_TIMEOUT = 30000;

const BASE_PAGES = [
  { url: '/', name: 'homepage', ourPath: 'index.html' },
  { url: '/catalog', name: 'catalog', ourPath: 'catalog/index.html' },
  { url: '/about', name: 'about', ourPath: 'about/index.html' },
  { url: '/contact', name: 'contact', ourPath: 'contact/index.html' },
  { url: '/private-label', name: 'private-label', ourPath: 'private-label/index.html' },
];

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
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractStructure(html) {
  const sections = (html.match(/<section\b[^>]*>/gi) || []).length;
  const headings = {};
  for (const h of ['h1', 'h2', 'h3', 'h4']) {
    const m = html.match(new RegExp(`<${h}[ >]`, 'gi'));
    headings[h] = m ? m.length : 0;
  }
  const images = [...html.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/gi)].map(m => {
    const src = m[1];
    const alt = (m[0].match(/alt="([^"]*)"/) || [, ''])[1];
    return { src: src.replace(/\?.*/, ''), alt };
  });
  const mainCssClasses = [...new Set([...html.matchAll(/class="([^"]{5,60})"/gi)].map(m => m[1]).slice(0, 30))];

  return {
    sections,
    headings,
    imageCount: images.length,
    imageUrls: images.map(i => i.src),
    imageAlts: images.map(i => i.alt),
    cssClassCount: mainCssClasses.length,
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
  if (oldS.sections !== newS.sections) diffs.push(`区块: ${oldS.sections}→${newS.sections}`);
  for (const h of ['h1', 'h2', 'h3', 'h4']) {
    if (oldS.headings[h] !== newS.headings[h]) diffs.push(`<${h}>: ${oldS.headings[h]}→${newS.headings[h]}`);
  }
  if (oldS.imageCount !== newS.imageCount) diffs.push(`图片: ${oldS.imageCount}→${newS.imageCount}`);

  const oldImgSet = new Set(oldS.imageUrls.map(u => u.split('/').pop()));
  const newImgSet = new Set(newS.imageUrls.map(u => u.split('/').pop()));
  const addedImgs = [...newImgSet].filter(u => !oldImgSet.has(u));
  const removedImgs = [...oldImgSet].filter(u => !newImgSet.has(u));
  if (addedImgs.length > 0) diffs.push(`+${addedImgs.length}图`);
  if (removedImgs.length > 0) diffs.push(`-${removedImgs.length}图`);

  return diffs;
}

function getKeywords(text) {
  const words = text.split(/[\s,.\-!?()|«»"'\\/]+/).filter(w => w.length > 3).map(w => w.toLowerCase());
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  return Object.entries(freq).filter(([, c]) => c >= 2).map(([w]) => w);
}

async function discoverProductPages() {
  console.log('发现产品链接...');
  try {
    const html = await fetchWithRetry(UPSTREAM_URL + '/catalog');
    const links = [...new Set([...html.matchAll(/href="(\/catalog\/[^"]+)"/g)].map(m => m[1]))];

    const isSubcat = (l) => l.includes('/brick/') || l.includes('/cake/') || l.includes('/tuocha/')
      || l.includes('/loose/') || l.includes('/tea-pets/') || l.includes('/teapots-trays/')
      || l.includes('/teaware-other/') || l.includes('/dancong/') || l.includes('/green-tea/')
      || l.includes('/heicha/') || l.includes('/red-tea/') || l.includes('/tieguanyin/');

    const isCategory = (l) => ['/catalog/ripe-puerh', '/catalog/raw-puerh', '/catalog/teaware', '/catalog/other-tea'].includes(l);

    const products = links.filter(l => !isCategory(l) && !isSubcat(l) && l !== '/catalog')
      .map(l => ({ url: l, name: l.replace('/catalog/', 'catalog/') }));

    const subcats = links.filter(l => isSubcat(l))
      .map(l => ({ url: l, name: l.replace('/catalog/', 'catalog/') }));

    console.log(`  发现: ${BASE_PAGES.length}基础 + ${CATEGORY_PAGES.length}分类 + ${subcats.length}子分类 + ${products.length}产品`);
    return { products, subcats };
  } catch (err) {
    console.error('  发现失败:', err.message);
    return { products: [], subcats: [] };
  }
}

async function processPages(pages, label) {
  const results = [];
  for (let i = 0; i < pages.length; i += CONCURRENCY) {
    const batch = pages.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(async page => {
      try {
        const html = await fetchWithRetry(UPSTREAM_URL + page.url);
        return { page, html, ok: true };
      } catch (err) {
        return { page, html: null, ok: false, error: err.message };
      }
    }));
    results.push(...batchResults);
  }
  return results;
}

// 获取我们网站的页面内容（优先 live，fallback dist）
function getOurPage(page) {
  const paths = [
    path.join(DIST_DIR, page.ourPath),
    path.join(DIST_DIR, page.name.replace(/\//g, '_') + '.html'),
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return { html: fs.readFileSync(p, 'utf8'), source: 'dist' };
  }
  return null;
}

async function main() {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });

  const { products, subcats } = await discoverProductPages();
  const allUpstreamPages = [...BASE_PAGES, ...CATEGORY_PAGES, ...subcats, ...products];

  console.log(`\n抓取上游 ${allUpstreamPages.length} 页...\n`);
  const results = await processPages(allUpstreamPages, 'upstream');
  const errors = results.filter(r => !r.ok);
  const okResults = results.filter(r => r.ok);

  if (errors.length === allUpstreamPages.length && allUpstreamPages.length > 0) {
    console.error(`全部 ${allUpstreamPages.length} 页抓取失败`);
    process.exit(1);
  }

  // ====== 1. 上游自身变化检测（对比上次快照）======
  console.log(`\n--- 上游变化检测 (${okResults.length}页) ---\n`);
  const upstreamChanges = [];
  for (const { page, html } of okResults) {
    const text = extractText(html);
    const structure = extractStructure(html);
    const paths = getStorePath(page.name);

    const oldText = fs.existsSync(paths.txt) ? fs.readFileSync(paths.txt, 'utf8') : '';
    const oldStructure = fs.existsSync(paths.json) ? JSON.parse(fs.readFileSync(paths.json, 'utf8')) : null;

    // 更新快照
    fs.mkdirSync(path.dirname(paths.html), { recursive: true });
    fs.writeFileSync(paths.html, html);
    fs.writeFileSync(paths.txt, text);
    fs.writeFileSync(paths.json, JSON.stringify(structure, null, 2));

    const textChanged = oldText && oldText !== text;
    const structureDiffs = oldStructure ? compareStructure(oldStructure, structure) : [];
    const structureChanged = structureDiffs.length > 0;

    if (textChanged || structureChanged) {
      upstreamChanges.push({ name: page.name, url: UPSTREAM_URL + page.url, textChanged, structureChanged, structureDiffs });
      console.log(`  ⚡ 上游变化: ${page.name} ${textChanged?'[文本]':''}${structureChanged?'[结构]':''}`);
    }
  }

  // ====== 2. 上游 vs 本站对比 ======
  console.log(`\n--- 上游 vs 本站对比 (${BASE_PAGES.length} 核心页) ---\n`);

  const comparisonReport = [];
  for (const bp of BASE_PAGES) {
    const ourPage = getOurPage(bp);
    if (!ourPage) {
      comparisonReport.push({ name: bp.name, label: bp.url === '/' ? '首页' : bp.url.replace(/\//g, ''), error: '本站页面未找到' });
      console.log(`  ⚠ ${bp.name}: 本站页面未找到`);
      continue;
    }

    const utext = fs.readFileSync(getStorePath(bp.name).txt, 'utf8');
    const ustruct = JSON.parse(fs.readFileSync(getStorePath(bp.name).json, 'utf8'));
    const otext = extractText(ourPage.html);
    const ostruct = extractStructure(ourPage.html);

    const reportItem = { name: bp.name, label: bp.name, diffs: [] };

    // 结构对比
    if (ustruct.sections !== ostruct.sections)
      reportItem.diffs.push({ type: 'structure', detail: `区块数: 上游${ustruct.sections} vs 本站${ostruct.sections}` });
    for (const h of ['h1', 'h2', 'h3', 'h4']) {
      if (ustruct.headings[h] !== ostruct.headings[h])
        reportItem.diffs.push({ type: 'structure', detail: `<${h}>: 上游${ustruct.headings[h]} vs 本站${ostruct.headings[h]}` });
    }
    if (ustruct.imageCount !== ostruct.imageCount)
      reportItem.diffs.push({ type: 'structure', detail: `图片数: 上游${ustruct.imageCount} vs 本站${ostruct.imageCount}` });

    // 关键词对比
    const ignoreWords = new Set(['puerh', 'direct', 'direct—', 'directpuerh', 'whatsapp', 'telegram', 'wechat',
      'того', 'этого', 'есть', 'быть', 'phone', 'email', 'china', 'китай', 'китая', 'пуэр', 'пуэра',
      'contact', 'контакты', 'свяжитесь', 'главная', 'каталог', 'catalog', 'about', 'home', 'page',
      'privac', 'политика', 'конфиденциальности', 'все', 'для', 'под', 'что', 'как', 'это', 'nach',
      'alla', 'время', 'index', 'ещё', 'data', 'only', 'more', 'всех', 'ваши', 'ваше', 'наша', 'наши',
      'помощью', 'связи', 'более', 'менее', 'очень', 'также', 'кроме', 'после', 'before', 'after',
      'здесь', 'там', 'ещё', 'уже', 'если', 'чтоб', 'будет', 'могут', 'может', 'можно', 'нужно',
      'очень', 'самый', 'самом', 'самых', 'который', 'которые', 'которых', 'которого',
      '@puerhdirect', '@sqvivi777', '13728005309', '18042891507', '4289', '1507',
    ]);
    const uKeywords = getKeywords(utext).filter(w => !ignoreWords.has(w));
    const oKeywords = getKeywords(otext).filter(w => !ignoreWords.has(w));
    const uSet = new Set(uKeywords);
    const oSet = new Set(oKeywords);

    const onlyUpstream = uKeywords.filter(w => !oSet.has(w));
    const onlyOurs = oKeywords.filter(w => !uSet.has(w));

    if (onlyUpstream.length > 0)
      reportItem.diffs.push({ type: 'content', detail: `上游独有: ${onlyUpstream.slice(0, 12).join(', ')}${onlyUpstream.length > 12 ? ' ...+' + (onlyUpstream.length - 12) : ''}` });
    if (onlyOurs.length > 0)
      reportItem.diffs.push({ type: 'content', detail: `本站独有: ${onlyOurs.slice(0, 12).join(', ')}${onlyOurs.length > 12 ? ' ...+' + (onlyOurs.length - 12) : ''}` });

    // B2B 定位关键词检查
    const b2bKeywords = ['опт', 'оптовый', 'оптовые', 'wholesale', 'moq', '20kg', '20кг', 'карго', 'фанцунь', 'fangcun', 'коробками', 'партнер', 'партнёр'];
    const retailFlags = ['блин', 'блина', 'розница', 'подарок', 'подарков', 'розничный', 'розничные', '8г', '8g', '50г', '50g', 'retail', 'gift'];

    const uB2B = b2bKeywords.filter(kw => utext.toLowerCase().includes(kw));
    const oB2B = b2bKeywords.filter(kw => otext.toLowerCase().includes(kw));
    const uRetail = retailFlags.filter(kw => utext.toLowerCase().includes(kw));
    const oRetail = retailFlags.filter(kw => otext.toLowerCase().includes(kw));

    const missingB2B = uB2B.filter(kw => !oB2B.includes(kw));
    const extraRetail = oRetail.filter(kw => !uRetail.includes(kw));

    if (missingB2B.length > 0)
      reportItem.diffs.push({ type: 'b2b-gap', detail: `本站缺少B2B关键词: ${missingB2B.join(', ')}` });
    if (extraRetail.length > 0)
      reportItem.diffs.push({ type: 'retail-leak', detail: `本站有零售词(上游无): ${extraRetail.join(', ')}` });

    // SEO 元素检查（仅首页）
    if (bp.name === 'homepage') {
      const seoChecks = [];
      if (!ourPage.html.includes('hreflang="x-default"')) seoChecks.push('缺少 hreflang x-default');
      if (!ourPage.html.includes('vk:image')) seoChecks.push('缺少 VK meta 标签');
      if (!ourPage.html.includes('alternateName')) seoChecks.push('JSON-LD 缺 alternateName');
      if (seoChecks.length > 0)
        reportItem.diffs.push({ type: 'seo', detail: seoChecks.join('; ') });
    }

    if (reportItem.diffs.length === 0) {
      console.log(`  ✓ ${bp.name}: 基本一致`);
      reportItem.ok = true;
    } else {
      console.log(`  ⚡ ${bp.name}: ${reportItem.diffs.length} 项差异`);
      reportItem.diffs.forEach(d => console.log(`      [${d.type}] ${d.detail}`));
    }
    comparisonReport.push(reportItem);
  }

  // ====== 3. 产品覆盖对比 ======
  console.log(`\n--- 产品覆盖对比 ---`);
  const catHtml = fs.readFileSync(getStorePath('catalog').html, 'utf8');
  const upstreamProductSlugs = [...new Set([...catHtml.matchAll(/href="\/catalog\/([0-9]{4}-[a-z-]+)"/g)].map(m => m[1]))]
    .filter(s => !/^(ripe-puerh|raw-puerh|teaware|other-tea)/.test(s)).sort();

  let productReport = null;
  try {
    const prodTs = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'products.ts'), 'utf8');
    const ourSlugs = [...prodTs.matchAll(/slug:\s*"([^"]+)"/g)].map(m => m[1]).sort();
    const upstreamSet = new Set(upstreamProductSlugs);
    const ourSet = new Set(ourSlugs);
    const onlyUpstream = upstreamProductSlugs.filter(s => !ourSet.has(s));
    const onlyOurs = ourSlugs.filter(s => !upstreamSet.has(s));

    productReport = {
      upstreamCount: upstreamProductSlugs.length,
      ourCount: ourSlugs.length,
      matchCount: upstreamProductSlugs.filter(s => ourSet.has(s)).length,
      onlyUpstream,
      onlyOurs,
    };
    console.log(`  上游${upstreamProductSlugs.length}产品 vs 本站${ourSlugs.length}产品`);
    if (onlyUpstream.length > 0) console.log(`  上游独有(${onlyUpstream.length}): ${onlyUpstream.join(', ')}`);
    if (onlyOurs.length > 0) console.log(`  本站独有(${onlyOurs.length}): ${onlyOurs.join(', ')}`);
    if (onlyUpstream.length === 0 && onlyOurs.length === 0) console.log('  ✓ 产品完全同步');
  } catch (err) {
    console.log('  无法读取 products.ts:', err.message);
  }

  // ====== 4. 生成报告 ======
  const date = new Date().toISOString().slice(0, 10);
  const lines = [];

  lines.push(`# 上游监控报告 — ${date}`);
  lines.push('');
  lines.push(`> 监控 ${allUpstreamPages.length} 页 | ${errors.length} 抓取失败 | ${upstreamChanges.length} 上游变化 | ${comparisonReport.filter(r => !r.ok).length} 本站差异`);
  lines.push('');

  // 上游自身变化
  if (upstreamChanges.length > 0) {
    lines.push('## 📡 上游网站变化（与上次快照对比）');
    lines.push('');
    for (const c of upstreamChanges) {
      lines.push(`- **${c.name}** [${c.textChanged?'文本':''}${c.textChanged&&c.structureChanged?'+':''}${c.structureChanged?'结构':''}](${c.url})`);
      c.structureDiffs.forEach(d => lines.push(`  - ${d}`));
    }
    lines.push('');
  } else {
    lines.push('## 📡 上游网站：无变化');
    lines.push('');
  }

  // 本站差异
  const siteDiffs = comparisonReport.filter(r => !r.ok);
  if (siteDiffs.length > 0) {
    lines.push('## 🔴 本站与上游差异（需审核）');
    lines.push('');
    lines.push('| 页面 | 差异项 |');
    lines.push('|------|--------|');
    for (const r of siteDiffs) {
      if (r.error) {
        lines.push(`| ${r.label} | ⚠ ${r.error} |`);
      } else {
        const diffSummary = r.diffs.map(d => `[${d.type}] ${d.detail}`).join('<br>');
        lines.push(`| [${r.label}](${OUR_URL}/${r.name === 'homepage' ? '' : r.name}) | ${diffSummary} |`);
      }
    }
    lines.push('');
  } else {
    lines.push('## 🟢 本站与上游：基本一致');
    lines.push('');
  }

  // 产品覆盖
  if (productReport) {
    lines.push('## 📦 产品覆盖');
    lines.push('');
    lines.push(`上游 ${productReport.upstreamCount} 个 | 本站 ${productReport.ourCount} 个 | 匹配 ${productReport.matchCount} 个`);
    if (productReport.onlyUpstream.length > 0) {
      lines.push('');
      lines.push(`**上游独有 (${productReport.onlyUpstream.length}):** 需新增`);
      lines.push('');
      productReport.onlyUpstream.forEach(s => lines.push(`- \`${s}\``));
    }
    if (productReport.onlyOurs.length > 0) {
      lines.push('');
      lines.push(`**本站独有 (${productReport.onlyOurs.length}):** 可保留或移除`);
      lines.push('');
      productReport.onlyOurs.forEach(s => lines.push(`- \`${s}\``));
    }
    lines.push('');
  }

  if (errors.length > 0) {
    lines.push('## ⚠️ 抓取失败');
    lines.push('');
    errors.forEach(e => lines.push(`- **${e.page.name}**: ${e.error}`));
    lines.push('');
  }

  lines.push('---');
  lines.push(`> 自动生成于 ${new Date().toISOString()} | [监控脚本](https://github.com/Shunqu-668/puerh-astro/blob/main/scripts/monitor-upstream.mjs)`);
  lines.push('>');
  lines.push('> ⚠️ **不会自动同步任何内容。** 请审核上述差异后手动决定哪些需要更新。');

  const report = lines.join('\n');
  const reportFile = path.join(SNAPSHOTS_DIR, 'LATEST-REPORT.md');
  fs.writeFileSync(reportFile, report);

  console.log(`\n✓ 报告已保存: ${reportFile}`);

  // GitHub Actions 中创建 Issue
  if (process.env.GITHUB_ACTIONS) {
    try {
      execSync(`gh issue create --title "上游监控报告 — ${date}" --body-file "${reportFile}" --label "upstream-monitor"`, { stdio: 'inherit' });
      console.log('Issue created.');
    } catch (err) {
      console.error('创建 Issue 失败:', err.message);
    }
  } else {
    // 本地运行：直接打印报告路径
    console.log('\n' + '='.repeat(60));
    console.log(report);
    console.log('='.repeat(60));
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
