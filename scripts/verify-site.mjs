import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const output = path.join(root, 'artifacts');
fs.mkdirSync(output, { recursive: true });
const pages = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.name.endsWith('.html')) pages.push(target);
  }
}
walk(dist);
const failures = [];
let references = 0;
function resolveAsset(url) {
  const urlPath = decodeURIComponent(new URL(url, 'https://puerhdirect.ru').pathname);
  let candidate = path.resolve(dist, '.' + urlPath);
  if (!candidate.startsWith(dist + path.sep) && candidate !== dist) return null;
  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) candidate = path.join(candidate, 'index.html');
  else if (!path.extname(candidate)) candidate = path.join(candidate, 'index.html');
  return candidate;
}
for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const name = path.relative(dist, file);
  const title = html.match(/<title>([^]*?)<\/title>/)?.[1] || '';
  if (!title || (title.match(/PUERH DIRECT/g) || []).length !== 1) failures.push(name + ': title');
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) failures.push(name + ': h1');
  if (!html.includes('rel="canonical"')) failures.push(name + ': canonical');
  if (/MOQ\s*:?\s*20\s*(?:kg|кг)|Бесплатная доставка образцов|Wholesale from 10 pcs/i.test(html)) failures.push(name + ': obsolete terms');
  for (const match of html.matchAll(/(?:href|src|srcset)="([^"]+)"/g)) {
    const ref = match[1].replaceAll('&amp;', '&');
    if (!ref.startsWith('/') || ref.startsWith('//')) continue;
    references++;
    const target = resolveAsset(ref);
    if (!target || !fs.existsSync(target)) failures.push(name + ': missing ' + ref);
  }
  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([^]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); } catch { failures.push(name + ': invalid JSON-LD'); }
  }
}
assert.equal(pages.length, 62, 'Expected existing 62 routes');
assert.deepEqual([...new Set(failures)], [], 'Static site regressions');
const supplierSpecs = JSON.parse(fs.readFileSync(path.join(root, 'docs/imported-product-specs.json'), 'utf8'));
assert.equal(supplierSpecs.products.length, 42);
for (const spec of supplierSpecs.products) {
  const html = fs.readFileSync(path.join(dist, 'catalog/product', spec.slug, 'index.html'), 'utf8');
  assert.match(html, new RegExp('data-unit-weight[^>]*>' + spec.unitWeightGrams + '</span>'));
  assert.ok(html.includes(spec.unitsPerCarton + ' шт. / коробка'), spec.slug + ' carton mismatch');
  assert.ok(html.includes('Актуальную партию'), spec.slug + ' lacks batch qualification');
}
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml' };
const chromeCandidates = [
  process.env.BROWSER_EXECUTABLE,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean);
const executablePath = chromeCandidates.find(p => fs.existsSync(p));
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
let mode = 'success';
const posts = [];
const errors = [];
const checks = [];
await context.route('**/*', async route => {
  const url = new URL(route.request().url());
  if (url.hostname === 'api.web3forms.com') {
    assert.equal(route.request().method(), 'POST');
    posts.push({ mode, body: route.request().postData() || '' });
    if (mode === 'delay') await new Promise(resolve => setTimeout(resolve, 300));
    if (mode === 'network-error') return route.abort();
    return route.fulfill({ status: mode === 'error' ? 500 : 200, contentType: 'application/json', body: JSON.stringify({ success: mode !== 'error' }) });
  }
  if (['puerhdirect.ru', 'localhost'].includes(url.hostname)) {
    const file = resolveAsset(url.href);
    if (!file || !fs.existsSync(file)) return route.fulfill({ status: 404, body: 'Missing local file' });
    return route.fulfill({ status: 200, contentType: mime[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
  }
  // All external network is mocked; tests never send inquiries or analytics.
  return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
});
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
async function screenshot(name, fullPage = true) {
  await page.evaluate(async () => {
    await Promise.allSettled(document.getAnimations().map(animation => animation.finished));
    window.scrollTo({ top: 0, behavior: 'instant' });
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.locator('img').evaluateAll(async images => {
    await Promise.all(images.map(async image => {
      image.loading = 'eager';
      await image.decode();
    }));
  });
  await page.screenshot({ path: path.join(output, name), fullPage, animations: 'disabled' });
}
try {
  await page.goto('https://puerhdirect.ru/');
  await page.locator('h1').waitFor();
  await screenshot('home-desktop.png');
  await screenshot('home-desktop-firstscreen.png', false);
  checks.push('desktop homepage');
  const productPath = '/catalog/product/2024-ripe-puerh-brick-black-pearl-xinwen/';
  await page.goto('https://puerhdirect.ru' + productPath);
  await page.locator('#quote-quantity').fill('12');
  assert.match(await page.locator('#quantity-result').innerText(), /3 кг нетто/);
  assert.match(await page.locator('[data-quote-link]').getAttribute('href'), /quantity=12&unit=pieces/);
  await screenshot('product-desktop.png');
  await page.locator('[data-quote-link]').click();
  await page.waitForURL('**/contact/**');
  await page.waitForFunction(() => document.querySelector('[name="product_sku"]')?.value);
  assert.match(await page.locator('[name="product_requested"]').inputValue(), /./);
  assert.equal(await page.locator('[name="product_sku"]').inputValue(), '2024-ripe-puerh-brick-black-pearl-xinwen');
  assert.match(await page.locator('[name="order_volume"]').inputValue(), /12 шт.*3 кг/);
  assert.equal(await page.locator('[name="product_unit_weight_g"]').inputValue(), '250');
  await screenshot('contact-desktop.png');
  await page.locator('[name="name"]').fill('LOCAL TEST');
  await page.locator('[name="contact"]').fill('local-test-no-delivery');
  await page.locator('[name="order_volume"]').fill('3 кг');
  await page.getByRole('button', { name: /Отправить запрос/ }).click();
  await page.locator('#form-success:not(.hidden)').waitFor();
  assert.equal(posts.length, 1);
  assert.ok(posts[0].body.includes('2024-ripe-puerh-brick-black-pearl-xinwen'));
  checks.push('product-to-inquiry context and mocked success');
  await page.locator('[name="name"]').fill('LOCAL TEST');
  await page.locator('[name="contact"]').fill('local-test-no-delivery');
  mode = 'error';
  await page.locator('#submit-btn').click();
  await page.locator('#form-error:not(.hidden)').waitFor();
  assert.equal(await page.locator('[name="name"]').inputValue(), 'LOCAL TEST');
  assert.equal(await page.locator('#submit-btn').isEnabled(), true);
  checks.push('server error preserves input and permits retry');
  mode = 'network-error';
  await page.locator('#submit-btn').click();
  await page.locator('#form-error:not(.hidden)').waitFor();
  assert.equal(await page.locator('[name="name"]').inputValue(), 'LOCAL TEST');
  checks.push('network failure preserves input');
  mode = 'delay';
  await page.locator('#submit-btn').click();
  assert.equal(await page.locator('#submit-btn').isDisabled(), true);
  await page.locator('#inquiry-form').evaluate(form => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  await page.locator('#form-success:not(.hidden)').waitFor();
  assert.equal(posts.length, 4);
  checks.push('pending request cannot be submitted twice');
  await page.goto('https://puerhdirect.ru' + productPath);
  await page.locator('.sample-text-link').click();
  await page.waitForURL('**/sample/**');
  await page.waitForFunction(() => document.querySelector('#count')?.textContent === '1');
  assert.equal(await page.locator('#count').innerText(), '1');
  const boxes = page.locator('.sample-card input');
  for (let i = 0; i < 4; i++) await boxes.nth(i).check();
  assert.equal(await page.locator('#count').innerText(), '5');
  assert.equal(await page.locator('.sample-card input:disabled').count(), 37);
  await boxes.nth(0).uncheck();
  assert.equal(await page.locator('.sample-card input:disabled').count(), 0);
  await page.locator('[name="name"]').fill('LOCAL SAMPLE TEST');
  await page.locator('[name="contact"]').fill('local-test-no-delivery');
  await page.locator('[name="destination"]').fill('Local test city');
  mode = 'success';
  await page.locator('#submit-btn').click();
  await page.locator('#form-success:not(.hidden)').waitFor();
  assert.equal(await page.locator('#count').innerText(), '0');
  await page.locator('[name="name"]').fill('LOCAL SAMPLE TEST');
  await page.locator('[name="contact"]').fill('local-test-no-delivery');
  await page.locator('[name="destination"]').fill('Local test city');
  const beforeEmpty = posts.length;
  await page.locator('#submit-btn').click();
  await page.locator('#selection-error:not(.hidden)').waitFor();
  assert.equal(posts.length, beforeEmpty);
  checks.push('sample preselection, cap, reset and empty selection validation');
  // Navigate away and back using ClientRouter, not a full page reload.
  await page.locator('header a[href="/catalog/"]').first().click();
  await page.locator('header a[href="/sample/"]').first().click();
  await boxes.nth(0).check();
  assert.equal(await page.locator('#count').innerText(), '1');
  checks.push('sample controls after repeated client navigation');
  await page.goto('https://puerhdirect.ru/catalog/');
  assert.equal(await page.locator('[data-product-card]:visible').count(), 42);
  await page.locator('#tea-search').fill('чёрный');
  assert.equal(await page.locator('[data-product-card]:visible').count(), 1);
  await page.locator('#tea-search').fill('черный');
  assert.equal(await page.locator('[data-product-card]:visible').count(), 1);
  await page.locator('#tea-shape').selectOption('cake');
  assert.equal(await page.locator('[data-product-card]:visible').count(), 0);
  await page.locator('[data-reset-filters]').click();
  assert.equal(await page.locator('[data-product-card]:visible').count(), 42);
  await page.locator('#tea-search').fill('Black Pearl');
  assert.equal(await page.locator('[data-result-count]').innerText(), '1');
  await page.locator('#tea-search').fill('');
  await screenshot('catalog-desktop.png', false);
  await page.locator('header a[href="/"]').click();
  await page.locator('header a[href="/catalog/"]').first().click();
  await page.locator('#tea-search').fill('2024');
  assert.equal(await page.locator('[data-product-card]:visible').count(), 4);
  checks.push('catalog search, Cyrillic normalization, shape filter, empty/reset and client navigation');

  await page.goto('https://puerhdirect.ru' + productPath);
  await page.locator('#quote-quantity').fill('-1');
  assert.ok(!(await page.locator('[data-quote-link]').getAttribute('href')).includes('quantity='));
  await page.locator('#quote-quantity').fill('1.5');
  assert.match(await page.locator('#quantity-result').innerText(), /целое/);
  await page.locator('#quote-unit').selectOption('kg');
  assert.match(await page.locator('#quantity-result').innerText(), /6 шт/);
  await page.locator('[data-quote-link]').click();
  await page.waitForURL('**/contact/**');
  await page.waitForFunction(() => document.querySelector('[name="order_volume"]')?.value);
  assert.match(await page.locator('[name="order_volume"]').inputValue(), /1,5 кг.*6 шт/);
  await page.locator('[name="product_requested"]').fill('Different tea');
  assert.equal(await page.locator('[name="product_sku"]').inputValue(), '');
  assert.equal(await page.locator('[name="product_unit_weight_g"]').inputValue(), '');
  assert.equal(await page.locator('[data-product-context]').isVisible(), false);
  assert.equal(await page.locator('[name="order_volume"]').inputValue(), '');
  await page.goto('https://puerhdirect.ru/contact/?product=not-a-product&quantity=12&unit=pieces');
  assert.equal(await page.locator('[name="product_sku"]').inputValue(), '');
  assert.equal(await page.locator('[name="order_volume"]').inputValue(), '');
  await page.goto('https://puerhdirect.ru/catalog/product/2004-raw-puerh-cake-banzhangshengtai/');
  await page.locator('#quote-unit').selectOption('kg');
  await page.locator('#quote-quantity').fill('3');
  assert.match(await page.locator('#quantity-result').innerText(), /8,403 шт.*ориентир/);
  checks.push('piece/kg conversion, fractional pieces, invalid quantities and stale/unknown SKU protection');

  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/catalog/', productPath, '/contact/', '/sample/', '/catalog/raw-puerh/', '/catalog/ripe-puerh/', '/private-label/', '/blog/kak-vybrat-postavshika-puera-v-kitae/', '/about/']) {
      await page.goto('https://puerhdirect.ru' + route);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'horizontal overflow: ' + width + ' ' + route);
    }
  }
  checks.push('50 route/viewport overflow checks');
  await page.goto('https://puerhdirect.ru/blog/kak-vybrat-postavshika-puera-v-kitae/');
  assert.equal(await page.locator('.article-content h2').count(), 6);
  assert.equal(await page.getByRole('link', { name: 'Получить прайс-лист', exact: true }).count(), 1);
  await screenshot('buyer-guide-desktop.png');
  for (const route of ['/blog/', '/compliance/']) {
    await page.goto('https://puerhdirect.ru' + route);
    const labels = await page.locator('.tea-cta').allTextContents();
    assert.ok(labels.length && labels.every(label => label.trim().length > 0), route + ' empty CTA');
  }
  checks.push('article, blog and document CTAs have visible accessible names');
  await page.goto('https://puerhdirect.ru/sample/');
  await screenshot('sample-desktop.png', false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('https://puerhdirect.ru' + productPath);
  await screenshot('product-mobile.png');
  await page.goto('https://puerhdirect.ru/catalog/');
  await screenshot('catalog-mobile.png', false);
  await page.goto('https://puerhdirect.ru/contact/');
  await screenshot('contact-mobile.png');
  await page.goto('https://puerhdirect.ru/');
  await screenshot('home-mobile.png');
  await screenshot('home-mobile-firstscreen.png', false);
  await page.locator('#menu-btn').click();
  assert.equal(await page.locator('#menu-btn').getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator('#menu-icon-close').isVisible(), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#menu-btn').getAttribute('aria-expanded'), 'false');
  await page.locator('#menu-btn').click();
  await page.locator('#mobile-menu a[href="/sample/"]').click();
  await page.locator('#menu-btn').click();
  assert.equal(await page.locator('#mobile-menu').isVisible(), true);
  checks.push('mobile menu icon, Escape and navigation reinitialization');
  const beforeLocal = posts.length;
  await page.goto('http://localhost/contact/');
  await page.locator('[name="name"]').fill('LOCAL TEST');
  await page.locator('[name="contact"]').fill('local-test-no-delivery');
  await page.locator('#submit-btn').click();
  await page.getByText(/填写校验通过/).waitFor();
  assert.equal(posts.length, beforeLocal);
  checks.push('local preview cannot send external inquiries');
  assert.deepEqual(errors, []);
  const result = { date: new Date().toISOString(), staticPages: pages.length, localReferences: references, checks, mockedPosts: posts.length, pageErrors: errors, externalRequestsSent: 0 };
  fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(JSON.stringify({ url: page.url(), pageErrors: errors, message: error.message }));
  await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true });
  throw error;
} finally {
  await browser.close();
}
