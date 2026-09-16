import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const origin = 'https://puerhdirect.ru';
const baseline = process.argv.includes('--baseline');
const files = [];
function walk(dir) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) files.push(p); } }
walk(dist);
const decode = s => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m => [m[1], decode(m[2])]));
const issues = [], warnings = [], rows = [];
const check = (ok, route, message) => { if (!ok) issues.push({ route, message }); };
const seen = { title: new Map(), description: new Map(), canonical: new Map() };
const inbound = new Map();
const outgoing = new Map();
for (const file of files) {
  const route = '/' + path.relative(dist, file).replaceAll('\\', '/').replace(/index\.html$/, '');
  const html = fs.readFileSync(file, 'utf8');
  // Crawl the built HTML itself: discovery must not rely on client scripts.
  const crawlHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, '');
  outgoing.set(route, new Set());
  const meta = [...html.matchAll(/<meta\b[^>]*>/g)].map(m => attrs(m[0]));
  const getMeta = name => meta.find(m => m.name === name || m.property === name)?.content || '';
  const links = [...html.matchAll(/<link\b[^>]*>/g)].map(m => attrs(m[0]));
  const canonicals = links.filter(l => l.rel === 'canonical');
  const title = decode(html.match(/<title>([^]*?)<\/title>/)?.[1] || '');
  const description = getMeta('description');
  const canonical = canonicals[0]?.href || '';
  const noindex = /noindex/.test(getMeta('robots'));
  const nodes = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([^]*?)<\/script>/g)].flatMap(m => { try { const n = JSON.parse(m[1]); return n['@graph'] || [n]; } catch { issues.push({route,message:'Invalid JSON-LD'}); return []; } });
  check(canonicals.length === 1 && canonical === origin + route, route, 'Canonical must match clean HTTPS route, including trailing slash');
  check(/<html[^>]*lang="ru"/.test(html), route, 'Missing Russian language');
  check((html.match(/<h1[\s>]/g) || []).length === 1, route, 'Expected one H1');
  check(title.length > 0 && description.length > 0, route, 'Missing title or description');
  check(noindex === (route === '/404.html'), route, 'Unexpected indexing policy');
  check(getMeta('og:url') === canonical, route, 'OG URL differs from canonical');
  const image = getMeta('og:image');
  check(image.startsWith(origin + '/') && fs.existsSync(path.join(dist, new URL(image || origin).pathname)), route, 'Missing local sharing image');
  check(!!getMeta('og:image:alt'), route, 'Missing sharing image description');
  const website = nodes.find(n => n['@type'] === 'WebSite');
  const webpage = nodes.find(n => ['WebPage','CollectionPage','ContactPage','AboutPage','FAQPage'].includes(n['@type']) && n['@id'] === canonical + '#webpage');
  const organization = nodes.find(n => n['@type'] === 'Organization');
  check(website?.url === origin + '/' && organization?.['@id'] === origin + '/#organization', route, 'Missing stable website/organization entities');
  check(webpage?.url === canonical && webpage?.inLanguage === 'ru-RU', route, 'Missing linked page entity');
  for (const key of ['title','description','canonical']) {
    const value = {title, description, canonical}[key];
    check(!seen[key].has(value), route, 'Duplicate ' + key + ' with ' + seen[key].get(value));
    seen[key].set(value, route);
  }
  const product = nodes.find(n => n['@type'] === 'Product');
  if (product) {
    check(product.url === canonical && product['@id'] === canonical + '#product', route, 'Product URL/id missing');
    check(product.offers === undefined && product.aggregateRating === undefined && product.review === undefined, route, 'Unverified price/review introduced');
    check(product.image?.length > 0 && product.weight?.value > 0, route, 'Product identity/specification missing');
    check(['Вид чая', 'Год выпуска', 'Форма', 'Вес единицы', 'В коробке'].every(label => html.includes(label)), route, 'Visible product specifications missing');
  }
  const faq = nodes.find(n => n['@type'] === 'FAQPage');
  if (faq) {
    check(faq['@id'] === canonical + '#webpage', route, 'FAQ entity must identify the visible page');
    for (const question of faq.mainEntity || []) {
      const id = question['@id']?.split('#')[1];
      check(id && html.includes(`id="${id}"`), route, 'FAQ answer lacks a stable visible anchor');
      check(html.includes(question.name) && html.includes(question.acceptedAnswer?.text), route, 'FAQ structured text differs from visible answer');
    }
  }
  const article = nodes.find(n => n['@type'] === 'Article');
  if (article) {
    check(article.mainEntityOfPage?.['@id'] === canonical + '#webpage' && article.image?.length > 0, route, 'Article page/image links missing');
    check(Date.parse(article.dateModified) >= Date.parse(article.datePublished), route, 'Article modification precedes publication');
    check(html.includes(article.datePublished) && html.includes(article.dateModified), route, 'Structured dates not visible');
  }
  for (const m of crawlHtml.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const value = decode(m[1]);
    if (!value.startsWith('/') || value.startsWith('//')) continue;
    const u = new URL(value, origin);
    outgoing.get(route).add(u.pathname);
    if (!path.extname(u.pathname)) check(u.pathname.endsWith('/'), route, 'Noncanonical internal link: ' + value);
    if (u.pathname !== route) inbound.set(u.pathname, (inbound.get(u.pathname) || 0) + 1);
  }
  if (title.length > 85) warnings.push({route,message:'Long title; inspect actual search snippet',length:title.length});
  rows.push({route,title,description,canonical,noindex,types:nodes.map(n=>n['@type']),product:!!product,article:!!article});
}
const sitemapFiles = fs.readdirSync(dist).filter(f => /^sitemap-\d+\.xml$/.test(f));
const sitemapUrls = sitemapFiles.flatMap(f => [...fs.readFileSync(path.join(dist,f),'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>decode(m[1])));
const indexable = rows.filter(r=>!r.noindex && r.route !== '/404.html');
const depths = new Map([['/',0]]), queue = ['/'];
for (let i = 0; i < queue.length; i++) {
  for (const target of outgoing.get(queue[i]) || []) {
    if (outgoing.has(target) && !depths.has(target)) { depths.set(target, depths.get(queue[i]) + 1); queue.push(target); }
  }
}
for (const row of indexable) {
  row.crawlDepth = depths.get(row.route) ?? null;
  check(row.crawlDepth !== null && row.crawlDepth <= 3, row.route, 'Not reachable from home within three static HTML links');
}
check(JSON.stringify([...new Set(sitemapUrls)].sort()) === JSON.stringify(indexable.map(r=>r.canonical).sort()), 'sitemap', 'Sitemap must contain exactly the canonical indexable pages');
for (const row of indexable) check((inbound.get(row.route) || 0) > 0, row.route, 'No crawlable inbound link');
const robots = fs.readFileSync(path.join(dist,'robots.txt'),'utf8');
check(robots.includes('Sitemap: ' + origin + '/sitemap-index.xml') && !/Disallow:\s*\/\s*(?:\n|$)/.test(robots), 'robots.txt', 'Production crawl/sitemap policy');
check(!/^Host:/im.test(robots), 'robots.txt', 'Obsolete Host directive');
const yandexGroup = robots.split(/User-agent:\s*Yandex\s*\n/i)[1] || '';
check(yandexGroup.includes('Allow: /') && yandexGroup.includes('Clean-param:'), 'robots.txt', 'Yandex-specific crawl/attribution rules missing');
check(!robots.split(/User-agent:\s*Yandex/i)[0].includes('Clean-param:'), 'robots.txt', 'Yandex-only directive leaked to generic group');
for (const category of ['raw-puerh', 'ripe-puerh']) {
  const html = fs.readFileSync(path.join(dist,'catalog',category,'index.html'),'utf8');
  check(html.includes('id="buying-guide"') && html.includes('/blog/shu-i-shen-puer-raznica/') && html.includes('/faq/#minimum-order'), category, 'Static category guidance or source links missing');
}
const report = {date:new Date().toISOString(),mode:baseline?'before':'after',pages:rows.length,indexable:indexable.length,products:rows.filter(r=>r.product).length,articles:rows.filter(r=>r.article).length,sitemapUrls:sitemapUrls.length,issues,warnings,limitations:['Local validation only: no live indexing or ranking verification','42 inquiry-only products have no price/reviews and are not eligible for Google Product rich snippets on this basis','Existing verification and Metrica IDs require account ownership confirmation'],rows};
fs.mkdirSync(path.join(root,'artifacts'), {recursive:true});
fs.writeFileSync(path.join(root,'artifacts',baseline?'seo-before.json':'seo-verification.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,rows:undefined,issues:issues.slice(0,15)},null,2));
if (!baseline) assert.equal(issues.length,0,'SEO checks failed; see artifacts/seo-verification.json');
