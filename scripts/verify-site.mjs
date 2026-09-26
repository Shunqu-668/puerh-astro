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
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  if (new Set(ids).size !== ids.length) failures.push(name + ': duplicate element IDs');
  if (/MOQ\s*:?\s*20\s*(?:kg|кг)|Бесплатная доставка образцов|Wholesale from 10 pcs/i.test(html)) failures.push(name + ': obsolete terms');
  for (const match of html.matchAll(/\s(href|src|srcset)="([^"]+)"/g)) {
    const values = match[1] === 'srcset' ? match[2].split(',').map(candidate => candidate.trim().split(/\s+/)[0]) : [match[2]];
    for (const value of values) {
    const ref = value.replaceAll('&amp;', '&');
    if (!ref.startsWith('/') || ref.startsWith('//')) continue;
    references++;
    const target = resolveAsset(ref);
    if (!target || !fs.existsSync(target)) failures.push(name + ': missing ' + ref);
    const hash = new URL(ref, 'https://puerhdirect.ru').hash;
    if (hash && target && fs.existsSync(target) && target.endsWith('.html')) {
      const destination = fs.readFileSync(target, 'utf8');
      if (!destination.includes(`id="${decodeURIComponent(hash.slice(1))}"`)) failures.push(name + ': missing anchor ' + ref);
    }
    }
  }
  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([^]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); } catch { failures.push(name + ': invalid JSON-LD'); }
  }
}
const blogCount = fs.readdirSync(path.join(root, 'src/content/blog')).filter(name => name.endsWith('.md')).length;
assert.equal(pages.length, 57 + blogCount, 'Expected core routes plus published articles');
assert.deepEqual([...new Set(failures)], [], 'Static site regressions');
const specs = JSON.parse(fs.readFileSync(path.join(root, 'src/data/catalog-specs.json'), 'utf8'));
const sourceSpecs = JSON.parse(fs.readFileSync(path.join(root, '../research/upstream-20260910/spec-candidates.json'), 'utf8'));
assert.equal(specs.items.length, 42);
assert.equal(new Set(specs.items.map(s => s.slug)).size, 42);
for (const spec of specs.items) {
  const source = sourceSpecs.products.find(s => s.slug === spec.slug);
  assert.deepEqual([spec.grams, spec.cartonUnits, spec.source], [source.unitWeightGrams, source.unitsPerCartonCandidate, source.source]);
  const html = fs.readFileSync(path.join(dist, 'catalog/product', spec.slug, 'index.html'), 'utf8');
  assert.ok(html.includes(spec.grams + ' г') && html.includes(spec.cartonUnits + ' шт.'));
  const structured = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([^]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  const productData = structured.find(item => item['@type'] === 'Product');
  assert.equal(productData.weight.value, spec.grams);
  assert.equal(productData.weight.unitCode, 'GRM');
  assert.equal(productData.offers, undefined, 'Do not invent price or stock for structured data');
  for (const picture of html.matchAll(/<picture[^>]*>([^]*?)<\/picture>/g)) {
    const image = picture[1].match(/<img\b[^>]*>/)?.[0] || '';
    assert.match(image, /width="[1-9]\d*"/, 'Reserve intrinsic width for catalogue images');
    assert.match(image, /height="[1-9]\d*"/, 'Reserve intrinsic height for catalogue images');
  }
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
const goals = [];
await context.exposeBinding('__captureGoal', (_source, args) => { if (args[1] === 'reachGoal') goals.push(args); });
await context.addInitScript(() => { window.ym = (...args) => { window.__captureGoal(args); }; });
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
  await page.locator('img').evaluateAll(async images => {
    await Promise.all(images.filter(image => image.hasAttribute('src')).map(async image => {
      image.loading = 'eager';
      await image.decode();
    }));
  });
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {})));
    scrollTo({ top: 0, behavior: 'instant' });
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.screenshot({ path: path.join(output, name), fullPage, animations: 'disabled' });
}
try {
  await page.goto('https://puerhdirect.ru/');
  await page.locator('h1').waitFor();
  await screenshot('home-desktop.png');
  await screenshot('home-desktop-fold.png', false);
  checks.push('desktop homepage');
  await page.locator('header a[href="/catalog/"]').first().click();
  await page.locator('#tea-search').waitFor();
  assert.equal(await page.locator('[data-catalog-item]:visible').count(), 42);
  await page.locator('#tea-search').fill('чЕРный');
  assert.equal(await page.locator('[data-catalog-item]:visible').count(), 1, 'Search normalizes case and ё');
  await page.locator('#tea-type').selectOption('raw');
  assert.equal(await page.locator('[data-catalog-item]:visible').count(), 0);
  assert.equal(await page.locator('.catalog-empty').isVisible(), true);
  await page.locator('[data-reset-filters]').click();
  await page.locator('#tea-type').selectOption('ripe');
  await page.locator('#tea-shape').selectOption('brick');
  const matches = await page.locator('[data-catalog-item]:visible').evaluateAll(items => items.map(i => [i.dataset.kind, i.dataset.shape]));
  assert.ok(matches.length > 1 && matches.every(([type, shape]) => type === 'ripe' && shape === 'brick'));
  const filteredUrl = page.url();
  await page.reload();
  await page.locator('#tea-search').waitFor();
  assert.equal(await page.locator('[data-catalog-item]:visible').count(), matches.length);
  await page.locator('[data-catalog-item]:visible .product-card').first().click();
  await page.locator('.product-specs').waitFor();
  await page.goBack();
  await page.locator('#tea-search').waitFor();
  assert.equal(page.url(), filteredUrl);
  assert.equal(await page.locator('[data-catalog-item]:visible').count(), matches.length);
  await page.goto('https://puerhdirect.ru/catalog/raw-puerh/?shape=cake&q=2018');
  await page.locator('#tea-search').waitFor();
  assert.equal(await page.locator('#tea-type').count(), 0);
  assert.ok(await page.locator('[data-catalog-item]:visible').count() > 0);
  assert.ok(await page.locator('[data-catalog-item]:visible').evaluateAll(items => items.every(i => i.dataset.kind === 'raw' && i.dataset.shape === 'cake')));
  checks.push('catalogue search, combined filters, empty/reset, reload/back and category controls');
  checks.push('all 42 specifications match captured supplier sources and product pages');
  await page.goto('https://puerhdirect.ru/catalog/');
  const initialOrder = await page.locator('[data-catalog-item] a').evaluateAll(links => links.map(a => a.getAttribute('href')));
  for (const sorting of ['year-desc', 'year-asc', 'weight-asc', 'weight-desc']) {
    await page.locator('#tea-sort').selectOption(sorting);
    const [key, direction] = sorting.split('-');
    const values = await page.locator('[data-catalog-item]:visible').evaluateAll((items, key) => items.map(i => Number(i.dataset[key])), key);
    assert.deepEqual(values, [...values].sort((a, b) => (a - b) * (direction === 'desc' ? -1 : 1)));
  }
  await page.locator('#tea-type').selectOption('raw');
  await page.reload();
  assert.equal(await page.locator('#tea-sort').inputValue(), 'weight-desc');
  assert.ok(await page.locator('[data-catalog-item]:visible').evaluateAll(items => items.every(i => i.dataset.kind === 'raw')));
  await page.locator('[data-reset-filters]').click();
  assert.deepEqual(await page.locator('[data-catalog-item] a').evaluateAll(links => links.map(a => a.getAttribute('href'))), initialOrder);
  await page.goto('https://puerhdirect.ru/catalog/?sort=unknown');
  assert.equal(await page.locator('#tea-sort').inputValue(), '');
  checks.push('catalog year/weight ordering, combined filter persistence, original order reset and invalid query');
  await page.goto('https://puerhdirect.ru/catalog/');
  await page.locator('#tea-search').fill('медов');
  assert.ok(await page.locator('[data-catalog-item]:visible').count() > 3, 'Taste search returns a useful selection');
  assert.ok(await page.locator('[data-catalog-item]:visible').evaluateAll(items => items.every(i => /медов/i.test(i.dataset.search))));
  await page.locator('#tea-search').fill('Xinwen 2024');
  assert.equal(await page.locator('[data-catalog-item]:visible').count(), 4, 'Factory and year combine');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('https://puerhdirect.ru/catalog/');
  await page.locator('#tea-search').waitFor();
  assert.equal(await page.locator('#tea-shape').isVisible(), false);
  assert.ok((await page.locator('.product-card-photo').first().boundingBox()).y < 650, 'Mobile shows tea before a long wall of controls');
  await page.locator('[data-toggle-filters]').click();
  await page.locator('#tea-shape').selectOption('brick');
  await page.locator('#tea-sort').selectOption('year-desc');
  await page.reload();
  assert.equal(await page.locator('[data-toggle-filters]').getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator('#tea-shape').inputValue(), 'brick');
  await page.locator('[data-toggle-filters]').click();
  assert.equal(await page.locator('#tea-shape').isVisible(), false);
  await page.locator('[data-reset-filters]').click();
  assert.equal(await page.locator('[data-catalog-item]:visible').count(), 42);
  await page.setViewportSize({ width: 1440, height: 1000 });
  checks.push('taste/factory search and mobile progressive filters, first product visibility and state restoration');
  const productPath = '/catalog/product/2024-ripe-puerh-brick-black-pearl-xinwen/';
  const galleryRequests = [];
  const collectGalleryRequest = request => { if (request.resourceType() === 'image') galleryRequests.push(request.url()); };
  page.on('request', collectGalleryRequest);
  await page.goto('https://puerhdirect.ru' + productPath);
  const galleryPhotos = page.locator('[data-gallery-image]');
  assert.equal(await galleryPhotos.count(), 6, 'Include the five original detail photos');
  const secondPhoto = await galleryPhotos.nth(1).getAttribute('href');
  await galleryPhotos.last().scrollIntoViewIfNeeded();
  await galleryPhotos.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
  assert.equal(await page.locator('.image-detail img').getAttribute('src'), null, 'Detail image must not load before zoom opens');
  assert.ok(!galleryRequests.some(url => url.includes('/product-details/') || url.includes('-detail.webp')), 'Thumbnails must not download original/detail photographs');
  const thumbSources = await galleryPhotos.locator('img').evaluateAll(images => images.map(img => img.currentSrc));
  assert.ok(thumbSources.every(src => /-(160|320)\.webp$/.test(src)), 'Thumbnail pixels must match their small display size');
  const gallerySources = JSON.parse(fs.readFileSync(path.join(root, 'src/data/product-gallery.json'), 'utf8'));
  const blackPearlSlug = productPath.split('/').filter(Boolean).at(-1);
  const oldGallerySources = [`/images/images/products/${blackPearlSlug}/${blackPearlSlug}.webp`, ...gallerySources[blackPearlSlug]];
  const assetBytes = urls => [...new Set(urls)].reduce((total, url) => total + fs.statSync(resolveAsset(url)).size, 0);
  const desktopSources = [...thumbSources, await page.locator('.product-image-open img').evaluate(img => img.currentSrc)];
  const mobilePhotoPage = await context.newPage();
  await mobilePhotoPage.setViewportSize({ width: 390, height: 844 });
  await mobilePhotoPage.goto('https://puerhdirect.ru' + productPath);
  await mobilePhotoPage.locator('[data-gallery-image]').last().scrollIntoViewIfNeeded();
  await mobilePhotoPage.locator('.product-image-viewer img[src]').evaluateAll(images => Promise.all(images.map(img => img.decode())));
  const mobileSources = await mobilePhotoPage.locator('.product-image-viewer img[src]').evaluateAll(images => images.map(img => img.currentSrc));
  assert.ok(mobileSources.every(url => !url.endsWith('-detail.webp')), 'Mobile gallery must not preload full detail images');
  const mobileMain = await mobilePhotoPage.locator('.product-image-open img').evaluate(img => ({ width: img.naturalWidth, src: img.currentSrc }));
  assert.match(mobileMain.src, /-(320|640)\.webp$/, 'A 390px 1x viewport should select a smaller main image');
  await mobilePhotoPage.close();
  fs.writeFileSync(path.join(output, 'image-efficiency.json'), JSON.stringify({ date: new Date().toISOString(), scope: 'Black Pearl main photo + all six thumbnails, before opening zoom; file payload only, 1x DPR', beforeBytes: assetBytes(oldGallerySources), desktopAfterBytes: assetBytes(desktopSources), mobileAfterBytes: assetBytes(mobileSources), desktopSources, mobileSources }, null, 2));
  await galleryPhotos.nth(1).click();
  assert.equal(new URL(await page.locator('.product-image-open').getAttribute('href'), page.url()).href, new URL(secondPhoto, page.url()).href);
  await page.locator('.product-image-open img').evaluate(img => img.decode());
  const displayedPhoto = await page.locator('.product-image-open img').evaluate(img => img.currentSrc);
  assert.ok(displayedPhoto.includes('/optimized-products/') && !displayedPhoto.endsWith('-detail.webp'));
  assert.ok(!galleryRequests.includes(new URL(secondPhoto, page.url()).href), 'Selecting a photo must not fetch its zoom version');
  await page.locator('.product-image-open').click();
  await page.getByRole('dialog').waitFor();
  assert.equal(await page.locator('.image-detail img').getAttribute('src'), new URL(secondPhoto, 'https://puerhdirect.ru').href);
  await page.locator('.image-detail img').evaluate(img => img.decode());
  assert.ok(galleryRequests.includes(new URL(secondPhoto, page.url()).href), 'Opening zoom must fetch the detail version');
  page.off('request', collectGalleryRequest);
  checks.push('responsive product images: small thumbnails, size-specific display and zoom download only on demand');
  await page.keyboard.press('ArrowRight');
  assert.equal(await galleryPhotos.nth(2).getAttribute('aria-current'), 'true');
  await page.keyboard.press('Escape');
  await galleryPhotos.first().click();
  checks.push('real product gallery: thumbnail selection, displayed image, enlarged photo and keyboard navigation');
  await page.locator('.product-image-open').click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').isVisible(), false);
  assert.equal(await page.locator('.product-image-open').evaluate(el => el === document.activeElement), true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.product-image-open').click();
  assert.ok(await page.locator('.image-detail').evaluate(el => el.scrollWidth > el.clientWidth));
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.getByRole('button', { name: 'Закрыть фото', exact: true }).click();
  assert.notEqual(await page.locator('body').evaluate(el => getComputedStyle(el).overflow), 'hidden');
  await page.goto('https://puerhdirect.ru/catalog/');
  await page.locator('[data-catalog-item] a').first().click();
  await page.locator('.product-image-open').click();
  await page.getByRole('dialog').waitFor();
  await page.getByRole('button', { name: 'Закрыть фото', exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('https://puerhdirect.ru' + productPath);
  checks.push('product image detail viewer, Escape/focus restore, mobile pan/close and client navigation');
  await page.locator('.product-purchase').getByRole('link', { name: 'Запросить цену', exact: true }).click();
  await page.waitForURL('**/contact/**');
  await page.waitForFunction(() => document.querySelector('[name="product_sku"]')?.value);
  const inquiryLabel = 'Чёрный Жемчуг Синьвэнь · 2024 · Шу Пуэр · 250 г';
  assert.equal(await page.locator('[name="product_requested"]').inputValue(), inquiryLabel);
  assert.equal(await page.locator('#selected-product-name').textContent(), inquiryLabel);
  // All inquiry choices carry the existing source-backed weight and tea type, not query text.
  const inquiryCatalogue = JSON.parse(await page.locator('#inquiry-form').getAttribute('data-product-catalog'));
  assert.equal(inquiryCatalogue.length, 42);
  for (const spec of specs.items) {
    const choice = inquiryCatalogue.find(item => item.slug === spec.slug);
    assert.ok(choice, `Missing inquiry choice ${spec.slug}`);
    assert.ok(choice.name.endsWith(` · ${spec.grams} г`), `Wrong inquiry weight ${spec.slug}`);
    assert.ok(choice.name.includes(spec.slug.includes('-raw-') ? 'Шэн Пуэр' : 'Шу Пуэр'), `Wrong inquiry tea type ${spec.slug}`);
  }
  await screenshot('inquiry-context-desktop.png');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#selected-product').scrollIntoViewIfNeeded();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Inquiry context fits mobile');
  await screenshot('inquiry-context-mobile.png');
  await page.setViewportSize({ width: 320, height: 740 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Inquiry context fits narrow mobile');
  await page.setViewportSize({ width: 1440, height: 1000 });
  assert.equal(await page.locator('[name="product_sku"]').inputValue(), '2024-ripe-puerh-brick-black-pearl-xinwen');
  assert.equal(await page.locator('#inquiry-form [required]').count(), 2);
  await page.locator('#submit-btn').click();
  assert.equal(posts.length, 0, 'Empty contact must not submit');
  await page.locator('[name="contact"]').fill('+7 000 000-00-00');
  await page.locator('#submit-btn').click();
  assert.equal(posts.length, 0, 'Name is required');
  await page.locator('[name="name"]').fill('   ');
  await page.locator('#submit-btn').click();
  assert.equal(posts.length, 0, 'Whitespace name must not submit');
  await page.locator('[name="name"]').fill('LOCAL TEST');
  await page.locator('[name="contact"]').fill('not-a-phone');
  await page.locator('#submit-btn').click();
  assert.equal(posts.length, 0, 'Non-phone contact must not submit');
  await page.locator('[name="contact"]').fill('   ');
  await page.locator('#submit-btn').click();
  assert.equal(posts.length, 0, 'Whitespace contact must not submit');
  await page.locator('[name="contact"]').fill('+7 000 000-00-00');
  await page.locator('[name="email"]').fill('not-an-email');
  await page.getByRole('button', { name: /Отправить запрос/ }).click();
  assert.equal(posts.length, 0, 'Optional email must be valid when supplied');
  assert.equal(goals.filter(g => /success$/.test(g[2])).length, 0, 'Invalid forms never produce successful conversion events');
  assert.equal(goals.filter(g => g[2] === 'pd_inquiry_start').length, 1, 'Only one start event per form attempt');
  await page.locator('[name="email"]').fill('');
  await page.getByRole('button', { name: /Отправить запрос/ }).click();
  await page.locator('#form-success:not(.hidden)').waitFor();
  assert.equal(posts.length, 1);
  assert.equal(goals.filter(g => g[2] === 'pd_inquiry_success').length, 1, 'Only acknowledged service success is a conversion');
  assert.ok(posts[0].body.includes('2024-ripe-puerh-brick-black-pearl-xinwen'));
  assert.ok(posts[0].body.includes(inquiryLabel), 'Submitted inquiry must retain the displayed tea type and weight');
  assert.ok(posts[0].body.includes('LOCAL TEST'));
  assert.ok(posts[0].body.includes('+7 000 000-00-00'));
  assert.ok(!posts[0].body.includes('name="email"'), 'Omit blank optional email');
  assert.ok(!posts[0].body.includes('name="Тема запроса"'), 'Omit absent topic');
  assert.ok(posts[0].body.includes('name="Телефон"') && posts[0].body.includes('name="Товар"'));
  assert.ok(posts[0].body.includes('name="Страница"'));
  checks.push('required name and phone, blank/invalid input rejection, optional message, product context');
  await page.locator('[name="name"]').fill('LOCAL TEST');
  await page.locator('[name="message"]').fill('LOCAL TEST QUESTION');
  await page.locator('[name="email"]').fill('buyer@example.com');
  await page.locator('[name="contact"]').fill('+7 000 000-00-00');
  mode = 'error';
  await page.locator('#submit-btn').click();
  await page.locator('#form-error:not(.hidden)').waitFor();
  assert.equal(await page.locator('[name="message"]').inputValue(), 'LOCAL TEST QUESTION');
  assert.equal(await page.locator('[name="contact"]').inputValue(), '+7 000 000-00-00');
  assert.equal(await page.locator('[name="email"]').inputValue(), 'buyer@example.com');
  assert.ok(posts.at(-1).body.includes('name="email"') && posts.at(-1).body.includes('buyer@example.com'), 'Reserved email enables Reply-To');
  assert.equal(await page.locator('#submit-btn').isEnabled(), true);
  checks.push('server error preserves input and permits retry');
  mode = 'network-error';
  await page.locator('#submit-btn').click();
  await page.locator('#form-error:not(.hidden)').waitFor();
  assert.equal(await page.locator('[name="message"]').inputValue(), 'LOCAL TEST QUESTION');
  checks.push('network failure preserves input');
  mode = 'delay';
  await page.locator('#submit-btn').click();
  assert.equal(await page.locator('#submit-btn').isDisabled(), true);
  await page.locator('#inquiry-form').evaluate(form => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  await page.locator('#form-success:not(.hidden)').waitFor();
  assert.equal(posts.length, 4);
  checks.push('pending request cannot be submitted twice');
  await page.locator('#clear-product').click();
  assert.equal(await page.locator('[name="product_sku"]').inputValue(), '');
  assert.equal(await page.locator('[name="product_requested"]').inputValue(), '');
  assert.equal(await page.locator('#selected-product').isVisible(), false);
  await page.locator('[name="name"]').fill('LOCAL TEST');
  await page.locator('[name="contact"]').fill('+7 000 000-00-01');
  mode = 'success';
  await page.locator('#submit-btn').click();
  await page.locator('#form-success:not(.hidden)').waitFor();
  assert.ok(!posts.at(-1).body.includes('2024-ripe-puerh-brick-black-pearl-xinwen'));
  for (const label of ['Товар', 'Артикул', 'Тема запроса', 'Комментарий']) {
    assert.ok(!posts.at(-1).body.includes(`name="${label}"`), `Do not emit an empty ${label} email row`);
  }
  assert.equal(await page.locator('[name="product_sku"]').inputValue(), '', 'Reset must not restore removed product');
  await page.goto('https://puerhdirect.ru/contact/?product=not-a-real-tea&tea=Injected-name');
  await page.waitForFunction(() => document.querySelector('form')?.action.includes('web3forms'));
  assert.equal(await page.locator('[name="product_sku"]').inputValue(), '');
  assert.equal(await page.locator('#selected-product').isVisible(), false);
  await page.goto('https://puerhdirect.ru/contact/?product=2024-ripe-puerh-brick-black-pearl-xinwen&tea=Injected-name');
  await page.locator('#selected-product:not(.hidden)').waitFor();
  assert.ok(!(await page.locator('[name="product_requested"]').inputValue()).includes('Injected-name'));
  assert.equal(await page.locator('#selected-product-name').textContent(), inquiryLabel, 'URL text cannot override verified product facts');
  await page.locator('header a[href="/catalog/"]').first().click();
  await page.locator('header a[href="/contact/#inquiry-form"]').click();
  await page.waitForURL('**/contact/**');
  assert.equal(await page.locator('#selected-product').isVisible(), false);
  assert.equal(await page.locator('[name="product_sku"]').inputValue(), '');
  checks.push('removable verified product context, invalid query ignored and client navigation reset');
  await page.goto('https://puerhdirect.ru/private-label/');
  await page.getByRole('link', { name: 'Обсудить идею', exact: true }).click();
  await page.locator('#selected-product:not(.hidden)').waitFor();
  assert.equal(await page.locator('[name="inquiry_topic"]').inputValue(), 'Чай под своим брендом');
  assert.equal(await page.locator('[name="product_sku"]').inputValue(), '');
  await page.locator('[name="name"]').fill('LOCAL TOPIC TEST');
  await page.locator('[name="contact"]').fill('+7 000 000-00-00');
  await page.locator('#submit-btn').click();
  await page.locator('#form-success:not(.hidden)').waitFor();
  assert.ok(posts.at(-1).body.includes('Чай под своим брендом'));
  await page.locator('#clear-product').click();
  assert.equal(await page.locator('[name="inquiry_topic"]').inputValue(), '');
  await page.goto('https://puerhdirect.ru/contact/?topic=unknown-topic');
  assert.equal(await page.locator('[name="inquiry_topic"]').inputValue(), '');
  assert.equal(await page.locator('#selected-product').isVisible(), false);
  checks.push('service inquiry carries verified removable topic without extra fields');
  await page.goto('https://puerhdirect.ru' + productPath);
  await page.getByRole('link', { name: 'Выбрать образец', exact: true }).click();
  await page.waitForURL('**/sample/**');
  await page.waitForFunction(() => document.querySelector('#count')?.textContent === '1');
  assert.equal(await page.locator('#count').innerText(), '1');
  await page.locator('#sample-search').fill('Чёрный');
  assert.equal(await page.locator('.sample-card:visible').count(), 1);
  await page.locator('#sample-search').fill('missing-unique-tea');
  assert.equal(await page.locator('#sample-empty').isVisible(), true);
  assert.equal(await page.locator('#count').innerText(), '1', 'Filtering preserves selection');
  await page.locator('#sample-search').fill('');
  const boxes = page.locator('.sample-card input');
  for (let i = 0; i < 4; i++) await boxes.nth(i).check();
  assert.equal(await page.locator('#count').innerText(), '5');
  assert.equal(await page.locator('.sample-card input:disabled').count(), 37);
  await boxes.nth(0).uncheck();
  assert.equal(await page.locator('.sample-card input:disabled').count(), 0);
  await page.locator('[name="name"]').fill('LOCAL SAMPLE TEST');
  await page.locator('[name="contact"]').fill('+7 000 000-00-00');
  assert.equal(await page.locator('[name="email"]').getAttribute('required'), null);
  await page.locator('[name="email"]').fill('samples@example.com');
  await page.locator('[name="destination"]').fill('Local test city');
  mode = 'success';
  await page.locator('#submit-btn').click();
  await page.locator('#form-success:not(.hidden)').waitFor();
  assert.equal(await page.locator('#count').innerText(), '0');
  assert.equal(goals.filter(g => g[2] === 'pd_sample_success').length, 1, 'Sample success is separate from contact success');
  assert.ok(goals.some(g => g[2] === 'pd_sample_select'), 'Sample selection is measured');
  assert.ok(goals.some(g => g[2] === 'pd_inquiry_click'), 'Consultation entry is measured');
  const beforeContact = goals.filter(g => g[2] === 'pd_contact_click').length;
  const contactPopup = page.waitForEvent('popup');
  await page.locator('footer a[href^="https://t.me/"]').first().click();
  await (await contactPopup).close();
  assert.equal(goals.filter(g => g[2] === 'pd_contact_click').length, beforeContact + 1, 'One contact event for one channel click');
  assert.equal(goals.at(-1)[3].channel, 'telegram');
  for (const event of goals) {
    assert.ok(Object.keys(event[3]).every(k => ['page','form','destination','channel','sku'].includes(k)), 'Only allowlisted non-personal context');
    assert.ok(!JSON.stringify(event).includes('LOCAL TEST') && !JSON.stringify(event).includes('@') && !JSON.stringify(event).includes('+7 000'), 'No form values in analytics');
    assert.ok(!event[3].page?.includes('?'), 'Query strings are excluded from event context');
  }
  checks.push('Metrica: intent/start/selection/success separated; no invalid-form success or personal form values');
  assert.ok(posts.at(-1).body.includes('name="Образцы"'));
  assert.ok(posts.at(-1).body.includes('samples@example.com'));
  assert.ok(!/name="sample_\d+"/.test(posts.at(-1).body), 'Selected samples appear once, without raw checkbox duplicates');
  assert.equal(await page.locator('[name="email"]').inputValue(), '', 'Successful submission clears optional email');
  await page.locator('[name="name"]').fill('LOCAL SAMPLE TEST');
  await page.locator('[name="contact"]').fill('+7 000 000-00-00');
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
  await page.goto('https://puerhdirect.ru/sample/');
  assert.equal(await page.locator('.sample-card:visible').count(), 12);
  await page.locator('#sample-show-more').click();
  assert.equal(await page.locator('.sample-card:visible').count(), 24);
  await page.locator('#sample-type').selectOption('raw');
  assert.equal(await page.locator('.sample-card:visible input[data-type="ripe"]').count(), 0);
  await page.locator('.sample-card:visible input').first().check();
  await page.locator('#sample-type').selectOption('ripe');
  await page.locator('.sample-card:visible input').first().check();
  assert.equal(await page.locator('#sample-selected-list li').count(), 2);
  await page.locator('[name="name"]').fill('LOCAL FILTER TEST');
  await page.locator('[name="contact"]').fill('+7 000 000-00-00');
  await page.locator('#sample-only-selected').click();
  assert.equal(await page.locator('.sample-card:visible').count(), 2, 'Review includes both tea types');
  assert.equal(await page.locator('#sample-type').inputValue(), '');
  const remainingSlug = await page.locator('#sample-grid input:checked').last().inputValue();
  await page.locator('#sample-selected-list button').first().click();
  assert.equal(await page.locator('#sample-selected-list li').count(), 1);
  assert.equal(await page.locator('.sample-card:visible').count(), 1);
  assert.equal(await page.locator('[name="name"]').inputValue(), 'LOCAL FILTER TEST');
  assert.equal(await page.locator('#selected-samples-input').inputValue().then(text => text.startsWith(remainingSlug + ' — ')), true);
  mode = 'error';
  await page.locator('#submit-btn').click();
  await page.locator('#form-error:not(.hidden)').waitFor();
  assert.equal(await page.locator('#count').innerText(), '1');
  assert.equal(await page.locator('[name="contact"]').inputValue(), '+7 000 000-00-00');
  mode = 'success';
  await page.locator('#submit-btn').click();
  await page.locator('#form-success:not(.hidden)').waitFor();
  assert.ok(posts.at(-1).body.includes(remainingSlug));
  assert.equal(await page.locator('#sample-selected-list li').count(), 0);
  assert.equal(await page.locator('#sample-only-selected').getAttribute('aria-pressed'), 'false');
  assert.equal(await page.locator('.sample-card:visible').count(), 12);
  await page.locator('#sample-only-selected').click();
  assert.equal(await page.locator('#sample-empty').isVisible(), true);
  await page.locator('#sample-reset-filters').click();
  assert.equal(await page.locator('.sample-card:visible').count(), 12);
  await page.locator('a[href="/contact/?topic=tea-selection#inquiry-form"]').click();
  await page.waitForURL('**/contact/**');
  assert.equal(await page.locator('[name="inquiry_topic"]').inputValue(), 'Помощь с выбором чая');
  checks.push('sample batches, type filters, cross-filter review/removal, retry preservation and selection help');
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of pages.map(file => '/' + path.relative(dist, file).replaceAll('\\', '/').replace(/index\.html$/, ''))) {
      await page.goto('https://puerhdirect.ru' + route);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'horizontal overflow: ' + width + ' ' + route);
    }
  }
  checks.push(`${pages.length * 5} route/viewport overflow checks: all ${pages.length} pages at five widths`);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('https://puerhdirect.ru/');
  await screenshot('home-mobile.png');
  await screenshot('home-mobile-fold.png', false);
  assert.equal(await page.locator('.site-nav').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForFunction(() => document.querySelector('.site-nav')?.dataset.scrolled === 'true');
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.site-nav')).opacity === '0');
  assert.equal(await page.locator('.site-nav').evaluate(el => getComputedStyle(el).pointerEvents), 'none');
  // Small reversals must not flash the navigation; deliberate upward movement reveals it.
  await page.evaluate(() => window.scrollTo(0, 297));
  await page.waitForFunction(() => window.scrollY === 297);
  assert.equal(await page.locator('.site-nav').getAttribute('data-scroll-hidden'), 'true');
  await page.evaluate(() => window.scrollTo(0, 260));
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.site-nav')).opacity === '1');
  await page.evaluate(() => window.scrollTo(0, 420));
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.site-nav')).opacity === '0');
  await page.locator('.nav-identity').focus();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.site-nav')).opacity === '1');
  await page.evaluate(() => document.activeElement?.blur());
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => document.querySelector('.site-nav')?.dataset.scrolled === 'false');
  await page.locator('#menu-btn').click();
  assert.equal(await page.locator('#menu-btn').getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator('#menu-icon-close').isVisible(), true);
  assert.equal(await page.locator('main').evaluate(el => el.inert), true);
  assert.equal(await page.locator('.site-nav').getAttribute('data-scroll-hidden'), 'false');
  await page.locator('#mobile-menu a').last().focus();
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.nav-identity').evaluate(el => el === document.activeElement), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#menu-btn').getAttribute('aria-expanded'), 'false');
  assert.equal(await page.locator('main').evaluate(el => el.inert), false);
  assert.equal(await page.locator('#menu-btn').evaluate(el => el === document.activeElement), true);
  await page.locator('#menu-btn').click();
  await page.locator('#mobile-menu a[href="/sample/"]').click();
  await page.locator('#menu-btn').click();
  assert.equal(await page.locator('#mobile-menu').isVisible(), true);
  checks.push('transparent photo header, scroll state, mobile menu focus containment, Escape, content unlock and navigation reinitialization');
  // Clicking the logo must not pin the header open on later mouse/touch scrolling.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://puerhdirect.ru/');
  await page.locator('.nav-identity').click();
  await page.evaluate(() => window.scrollTo(0, 450));
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.site-nav')).opacity === '0');
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.site-nav')).opacity === '1');
  checks.push('direction-aware header: downward hide, upward reveal, jitter threshold, keyboard recovery, menu protection and pointer focus');
  const beforeLocal = posts.length;
  await page.goto('http://localhost/contact/');
  await page.locator('[name="name"]').fill('LOCAL TEST');
  await page.locator('[name="contact"]').fill('+7 000 000-00-00');
  await page.locator('#submit-btn').click();
  await page.getByText(/填写校验通过/).waitFor();
  assert.equal(posts.length, beforeLocal);
  checks.push('local preview cannot send external inquiries');
  await page.goto('https://puerhdirect.ru/blog/kak-vybrat-postavshika-puera-v-kitae/');
  assert.ok(await page.locator('.reading-toc').isVisible());
  await page.locator('[data-reading-theme]').click();
  assert.equal(await page.locator('.reading-surface').getAttribute('data-theme'), 'dark');
  await page.locator('[data-reading-size]').click();
  await page.waitForFunction(() => parseFloat(getComputedStyle(document.querySelector('.article-body')).fontSize) >= 21);
  await page.locator('.article-further a').first().click();
  await page.waitForFunction(() => document.querySelector('.reading-surface')?.getAttribute('data-theme') === 'dark');
  await page.locator('[data-reading-theme]').click();
  assert.equal(await page.locator('.reading-surface').getAttribute('data-theme'), 'light');
  await page.setViewportSize({width:390,height:844});
  await page.locator('.article-toc summary').click();
  const tocLinks = await page.locator('.article-toc a').evaluateAll(links => links.map(a => a.hash));
  assert.ok(tocLinks.length > 2);
  for (const hash of tocLinks) assert.ok(await page.evaluate(hash => !!document.getElementById(decodeURIComponent(hash.slice(1))), hash));
  assert.ok(await page.locator('.article-body h2').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize) > 20));
  await page.setViewportSize({width:1440,height:1000});
  checks.push('article light/dark, larger type, preference after client navigation and mobile TOC');
  await page.goto('https://puerhdirect.ru/faq/');
  await page.locator('.faq-list summary').first().click();
  assert.equal(await page.locator('.faq-list details').first().getAttribute('open'), '');
  checks.push('article contents anchors, readable heading styles and FAQ disclosure');
  // The new cross-page paths must retain category and inquiry context.
  for (const route of ['/catalog/', '/catalog/raw-puerh/', '/catalog/ripe-puerh/', '/catalog/teaware/', '/catalog/other-tea/']) {
    await page.goto('https://puerhdirect.ru' + route);
    assert.equal(await page.locator('.category-nav [aria-current="page"]').count(), 1);
    assert.equal(await page.locator('.category-nav [aria-current="page"]').getAttribute('href'), route);
  }
  await page.goto('https://puerhdirect.ru/faq/');
  await page.getByRole('link', { name: 'Доставка и документы', exact: true }).click();
  assert.ok(page.url().endsWith('#delivery'));
  await page.locator('#delivery summary').last().click();
  await page.locator('#delivery .faq-answer-link').click();
  await page.waitForURL('**/compliance/');
  await page.locator('.info-action .site-cta').click();
  await page.waitForURL('**/contact/?topic=documents#inquiry-form');
  await page.locator('#selected-product:not(.hidden)').waitFor();
  assert.equal(await page.locator('[name="inquiry_topic"]').inputValue(), 'Документы к заказу');
  assert.equal(await page.locator('#inquiry-form [required]').count(), 2);
  checks.push('category active state and FAQ-to-documents-to-short-inquiry path');
  await page.goto('https://puerhdirect.ru/blog/');
  assert.equal(await page.locator('.reading-feature, .reading-card').count(), blogCount);
  const articleUrls = await page.locator('.reading-feature, .reading-card a').evaluateAll(links => links.map(a => a.href));
  for (const url of articleUrls) {
    await page.goto(url);
    assert.equal(await page.locator('meta[property="og:type"]').getAttribute('content'), 'article');
    assert.equal(await page.locator('.article-further a').count(), 2);
    const cta = await page.locator('.article-next .site-cta').getAttribute('href');
    assert.ok(cta.startsWith('/'), 'Reading continues within the site');
  }
  await page.goto('https://puerhdirect.ru/blog/privatnaya-marka-puera-rukovodstvo/');
  await page.locator('.article-next .site-cta').click();
  await page.waitForURL('**/contact/?topic=private-label#inquiry-form');
  await page.locator('#selected-product:not(.hidden)').waitFor();
  assert.equal(await page.locator('[name="inquiry_topic"]').inputValue(), 'Чай под своим брендом');
  checks.push('all five reading paths, article sharing metadata, related reading and brand inquiry context');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('https://puerhdirect.ru/catalog/other-tea/');
  await page.getByRole('contentinfo').getByRole('link', { name: 'Политика конфиденциальности' }).click();
  await page.waitForURL('**/privacy/');
  await page.getByRole('link', { name: '← Связаться с нами', exact: true }).click();
  await page.waitForURL('**/contact/#inquiry-form');
  await page.getByRole('contentinfo').getByRole('link', { name: 'Образцы', exact: true }).click();
  await page.waitForURL('**/sample/');
  await page.locator('#sample-search').waitFor({ state: 'visible' });
  checks.push('mobile deep-footer privacy/contact/sample navigation');
  // Theme changes affect text contrast, product discovery and old prop-based CTAs.
  const contrastResults = [];
  for (const [name, route] of [['catalog', '/catalog/'], ['product', productPath], ['contact', '/contact/'], ['sample', '/sample/'], ['blog', '/blog/'], ['article', '/blog/shu-i-shen-puer-raznica/'], ['compliance', '/compliance/'], ['home', '/']]) {
    await page.goto('https://puerhdirect.ru' + route);
    const readings = await page.locator('.action-flame, .action-acid, .site-cta-primary, #submit-btn, .product-card-link, .form-input, .reading-link, .reading-category, .category-nav a, .selection-help a, .buying-steps a').evaluateAll(elements => {
      const rgb = value => (value.match(/[\d.]+/g) || []).map(Number);
      const lum = values => values.slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
      return elements.filter(el => el.getClientRects().length).map(el => {
        const color = rgb(getComputedStyle(el).color);
        let parent = el, bg;
        while (parent) {
          bg = rgb(getComputedStyle(parent).backgroundColor);
          if (bg.length === 3 || bg[3] === 1) break;
          parent = parent.parentElement;
        }
        const a = lum(color), b = lum(bg);
        return { text: (el.textContent || el.getAttribute('name') || '').trim().slice(0, 60), contrast: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) };
      });
    });
    for (const reading of readings) assert.ok(reading.contrast >= 4.5, `${name} contrast: ${JSON.stringify(reading)}`);
    contrastResults.push({ page: name, checked: readings.length, minimum: readings.length ? Math.min(...readings.map(r => r.contrast)) : null });
    if (['blog', 'compliance'].includes(name)) {
      for (const cta of await page.locator('.site-cta').all()) assert.ok((await cta.innerText()).trim(), 'CTA needs visible text');
    }
    if (name === 'product') {
      assert.ok(await page.locator('.product-character').isVisible());
      assert.match(await page.locator('.product-maker').innerText(), /Синьвэнь/);
      const telegram = new URL(await page.locator('.product-direct-chat').getAttribute('href'));
      assert.equal(telegram.pathname, '/sqvivi777');
      assert.match(telegram.searchParams.get('text'), /Чёрный Жемчуг.*2024.*250/);
      assert.ok(telegram.searchParams.get('text').includes(productPath));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    }
    if (['catalog', 'product', 'contact', 'sample'].includes(name)) {
      for (const [size, width, height] of [['mobile', 390, 844], ['desktop', 1440, 1000]]) {
        await page.setViewportSize({ width, height });
        await screenshot(`${name}-${size}-dark.png`, false);
        if (name === 'contact') await screenshot(`contact-${size}-simplified-full.png`);
      }
    }
  }
  checks.push('solid action/input/card text contrast at least 4.5:1');
  checks.push('visible Russian product character, maker and Telegram draft context; prop-based CTA labels');
  for (const route of ['/about/', '/private-label/']) {
    await page.goto('https://puerhdirect.ru' + route);
    for (const [size, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      await page.setViewportSize({ width, height });
      await screenshot(`${route.replaceAll('/', '')}-${size}-company.png`);
    }
  }
  assert.deepEqual(errors, []);
  const result = { date: new Date().toISOString(), staticPages: pages.length, localReferences: references, checks, contrastResults, mockedPosts: posts.length, pageErrors: errors, externalRequestsSent: 0 };
  fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(JSON.stringify({ url: page.url(), pageErrors: errors, message: error.message }));
  await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true });
  throw error;
} finally {
  await browser.close();
}
