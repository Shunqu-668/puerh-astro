import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPSTREAM = 'https://puerhdirect.com';
const OUT = path.join(__dirname, '..', 'src', 'data', 'product-descriptions.json');
const CONCURRENCY = 5;
const TIMEOUT = 30000;

// 从 products.ts 读 slug 列表
const prodTs = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'products.ts'), 'utf8');
const slugs = [...prodTs.matchAll(/slug:\s*"([^"]+)"/g)].map(m => m[1]);

// 排除只存在于本站的产品（上游没有的）
// 监控报告显示本站多了: 2017-ripe-puerh-cake-xiongfeng7571-xiongfeng
// 这个上游没有，跳过

async function fetchText(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (e) {
    clearTimeout(t);
    throw e;
  }
}

function cleanFooter(text) {
  return text
    .replace(/\bPUERH DIRECT\b[\s\S]*$/i, '')
    .replace(/\bPremium Puerh Wholesale\b[\s\S]*$/i, '')
    .replace(/\bОптовые поставки\b[\s\S]*$/i, '')
    .replace(/\bТОЛЬКО ОПТ\b[\s\S]*$/i, '')
    .replace(/\bB2B PUERH\b[\s\S]*$/i, '')
    .replace(/\bCUSTOM MANUFACTURING\b[\s\S]*$/i, '')
    .replace(/\bКОНТРАКТНОЕ ПРОИЗВОДСТВО\b[\s\S]*$/i, '')
    .trim();
}

function extractDescriptions(html) {
  // 移除 script/style
  const clean = html.replace(/<script[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 提取纯文本
  const text = clean.replace(/<[^>]+>/g, '\n').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\n\s*\n/g, '\n').trim();

  let descRu = '', descEn = '', descCn = '';

  // 格式1: Описание | Description:
  const descMatch1 = text.match(/Описание\s*\|\s*Description:\s*([\s\S]*?)(?=Китайский оригинал|中文溯源|$)/i);
  // 格式2: Russian Description / English Description
  const descMatchRu = text.match(/Russian Description\s*\n+([\s\S]*?)(?=English Description|$)/i);
  const descMatchEn = text.match(/English Description\s*\n+([\s\S]*?)(?=PUERH DIRECT|Premium|Оптовые|ТОЛЬКО|B2B|CUSTOM|КОНТРАКТНОЕ|\n{3,}|$)/i);
  // 格式3: Описание для B2B: / B2B Description:
  const b2bRu = text.match(/Описание для B2B:\s*([\s\S]*?)(?=B2B Description:|$)/i);
  const b2bEn = text.match(/B2B Description:\s*([\s\S]*?)(?=中文溯源|PUERH DIRECT|Premium|Оптовые|ТОЛЬКО|\n{3,}|$)/i);

  if (descMatch1) {
    const raw = descMatch1[1].trim();
    const cyrillicEnd = raw.search(/[а-яёА-ЯЁ][^а-яёА-ЯЁ]*[.。!?]\s+[A-Z][a-z]/);
    if (cyrillicEnd >= 0) {
      const splitPoint = raw.indexOf('. ', cyrillicEnd) + 2;
      descRu = raw.slice(0, splitPoint).trim();
      descEn = raw.slice(splitPoint).trim();
    } else {
      const parts = raw.split(/\n+/);
      if (parts.length >= 2) {
        descRu = parts[0].trim();
        descEn = parts.slice(1).join(' ').trim();
      } else {
        descRu = raw;
      }
    }
  } else if (descMatchRu || descMatchEn) {
    descRu = descMatchRu ? descMatchRu[1].trim().replace(/\n+/g, ' ').trim() : '';
    descEn = descMatchEn ? descMatchEn[1].trim().replace(/\n+/g, ' ').trim() : '';
  } else if (b2bRu || b2bEn) {
    descRu = b2bRu ? b2bRu[1].trim().replace(/\n+/g, ' ').trim() : '';
    descEn = b2bEn ? b2bEn[1].trim().replace(/\n+/g, ' ').trim() : '';
  }

  // 找中文溯源 (支持两种格式)
  const cnMatch1 = text.match(/Китайский оригинал\s*\|\s*中文溯源:\s*([\s\S]*?)(?=PUERH DIRECT|Premium|Оптовые|ТОЛЬКО|B2B|CUSTOM|КОНТРАКТНОЕ|\n{3,}|$)/i);
  const cnMatch2 = text.match(/中文溯源：\s*([\s\S]*?)(?=PUERH DIRECT|Premium|Оптовые|ТОЛЬКО|B2B|CUSTOM|КОНТРАКТНОЕ|\n{3,}|$)/i);
  if (cnMatch1) descCn = cleanFooter(cnMatch1[1].trim());
  else if (cnMatch2) descCn = cleanFooter(cnMatch2[1].trim());

  return { descRu, descEn, descCn };
}

async function main() {
  console.log(`准备抓取 ${slugs.length} 款产品描述...\n`);

  const results = {};
  let done = 0;

  for (let i = 0; i < slugs.length; i += CONCURRENCY) {
    const batch = slugs.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(async slug => {
      const url = `${UPSTREAM}/catalog/${slug}`;
      try {
        const html = await fetchText(url);
        const desc = extractDescriptions(html);
        return { slug, url, ...desc, ok: true };
      } catch (err) {
        return { slug, url, ok: false, error: err.message };
      }
    }));

    for (const r of batchResults) {
      done++;
      if (r.ok && (r.descRu || r.descEn)) {
        results[r.slug] = { descRu: r.descRu, descEn: r.descEn, descCn: r.descCn };
        console.log(`  ✓ ${done}/${slugs.length} ${r.slug}`);
      } else if (r.ok) {
        console.log(`  ~ ${done}/${slugs.length} ${r.slug} (空描述)`);
      } else {
        console.log(`  ✗ ${done}/${slugs.length} ${r.slug} (${r.error})`);
      }
    }
  }

  fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log(`\n完成！${Object.keys(results).length}/${slugs.length} 款产品已保存到 ${OUT}`);
}

main().catch(err => { console.error(err); process.exit(1); });
