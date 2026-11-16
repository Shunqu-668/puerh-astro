// Isolated integration checks: all requests are fulfilled locally or mocked.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const calls = [], errors = [], checks = [];
const sentPayloads = [];
let mode = 'server', posts = 0;
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });
await context.exposeBinding('__metric', (_source, args) => calls.push(args));
await context.addInitScript(() => { window.ym = (...args) => window.__metric(args); });
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
await context.route('**/*', async route => {
  const url = new URL(route.request().url());
  if (url.hostname === 'api.web3forms.com') {
    posts++;
    sentPayloads.push(route.request().postDataBuffer()?.toString('utf8') || '');
    if (mode === 'network') return route.abort('failed');
    return route.fulfill({ status: mode === 'server' ? 500 : 200, contentType: 'application/json', body: mode === 'response' ? 'invalid-json' : JSON.stringify({ success: mode === 'success' }) });
  }
  if (['puerhdirect.ru', 'localhost'].includes(url.hostname)) {
    let file = path.resolve(dist, '.' + decodeURIComponent(url.pathname));
    if (!file.startsWith(dist + path.sep)) file = path.join(dist, 'index.html');
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: 'not found' });
    return route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
  }
  return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
});
const page = await context.newPage();
page.on('pageerror', e => errors.push(e.message));
const goal = (name) => calls.filter(c => c[1] === 'reachGoal' && c[2] === name);
const waitGoal = async (name, count) => {
  for (let i = 0; i < 20 && goal(name).length < count; i++) await page.waitForTimeout(100);
  assert.equal(goal(name).length, count, name + ' count');
};
async function masked() {
  const fields = await page.locator('form[data-inquiry-form] input, form[data-inquiry-form] textarea').evaluateAll(xs => xs.map(x => ({ mask: x.classList.contains('ym-hide-content'), keys: x.classList.contains('ym-disable-keys'), override: !!x.closest('.ym-record-keys,.ym-show-content') })));
  assert.ok(fields.length >= 4 && fields.every(x => x.mask && x.keys && !x.override));
  assert.equal(await page.locator('form.ym-disable-submit').count(), 1);
}
try {
  const product = '/catalog/product/2024-ripe-puerh-brick-black-pearl-xinwen/';
  await page.goto('https://puerhdirect.ru' + product);
  await waitGoal('pd_product_view', 1);
  assert.equal(goal('pd_product_view')[0][3].sku, '2024-ripe-puerh-brick-black-pearl-xinwen');
  await page.evaluate(() => document.dispatchEvent(new Event('astro:page-load')));
  await page.waitForTimeout(100);
  assert.equal(goal('pd_product_view').length, 1);
  assert.equal(calls.filter(c => c[1] === 'init').length, 1);
  assert.equal(calls.find(c => c[1] === 'init')[2].webvisor, true);
  checks.push('One product view per actual DOM navigation; no duplicate init/page-load view');

  const articleUrl = slug => 'https://puerhdirect.ru/blog/' + slug + '/';
  const taggedArticle = (slug, content) => articleUrl(slug) + '?utm_source=vk&utm_medium=social&utm_campaign=procurement_blog&utm_content=' + content;
  const packaging = 'maket-upakovki-puera-pered-pechatyu';
  await page.goto(taggedArticle(packaging, packaging));
  assert.equal(goal('pd_article_read').length, 0);
  await page.locator('[data-analytics-article]').evaluate(el => window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top + el.getBoundingClientRect().height - innerHeight + 2));
  await page.waitForTimeout(2000);
  assert.equal(goal('pd_article_read').length, 0, 'A jump to the bottom alone is not a read');
  await page.waitForTimeout(19500);
  assert.deepEqual(goal('pd_article_read').map(c => c[3].depth_percent), ['25','50','75','100']);
  assert.equal(goal('pd_article_read')[0][3].article_channel, 'vk_wall');
  await page.evaluate(() => document.dispatchEvent(new Event('astro:page-load')));
  await page.waitForTimeout(1100);
  assert.equal(goal('pd_article_read').length, 4);
  await page.locator('.article-next .site-cta').click();
  await page.waitForURL('**/contact/**');
  await masked();
  await page.waitForTimeout(1100);
  assert.equal(goal('pd_article_read').length, 4, 'Article timer stops after SPA navigation');
  checks.push('25/50/75/100 depth after 5/10/15/20 active seconds, once each; SPA cleanup');

  await page.locator('button[type=submit]').click();
  await waitGoal('pd_form_error', 1);
  assert.equal(goal('pd_form_error')[0][3].error_type, 'validation');
  assert.equal(posts, 0);
  await page.locator('[name=name]').fill('MASK_TEST_PERSON_20261021');
  await page.locator('[name=contact]').fill('+7 000 000 00 00');
  await page.locator('[name=email]').fill('mask-test-20261021@example.invalid');
  await page.locator('[name=message]').fill('MASK_TEST_INQUIRY_20261021');
  for (const error of ['server', 'response', 'network']) {
    mode = error;
    const before = goal('pd_form_error').length;
    await page.locator('button[type=submit]').click();
    await page.locator('#form-error').waitFor({ state: 'visible' });
    await waitGoal('pd_form_error', before + 1);
    assert.equal(goal('pd_form_error').at(-1)[3].error_type, error);
    assert.equal(goal('pd_inquiry_success').length, 0);
    await masked();
  }
  mode = 'success';
  await page.locator('button[type=submit]').click();
  await page.locator('#form-success').waitFor({ state: 'visible' });
  await waitGoal('pd_inquiry_success', 1);
  await masked();
  checks.push('Native validation deduplicated, server/malformed/network errors classified, success distinct');
  for (const event of ['pd_inquiry_click', 'pd_inquiry_start', 'pd_form_error', 'pd_inquiry_success']) {
    const p = goal(event).at(-1)[3];
    assert.equal(p.article_slug, packaging, event);
    assert.equal(p.article_channel, 'vk_wall', event);
    assert.equal(p.article_placement, 'footer', event);
  }
  assert.ok(sentPayloads.at(-1).includes(articleUrl(packaging)));
  assert.ok(sentPayloads.at(-1).includes('Сообщество VK'));
  assert.ok(!sentPayloads.at(-1).includes('utm_'));
  assert.equal(await page.evaluate(() => history.state?.pdArticleSource), undefined, 'Accepted form clears attribution from this entry');
  checks.push('VK wall article read, footer CTA, form started, errors and confirmed success; trusted article in delivered payload');

  await page.goto('https://puerhdirect.ru/sample/');
  await masked();
  await page.locator('[name=name]').fill('MASK_TEST_PERSON_20261021');
  await page.locator('[name=contact]').fill('+7 000 000 00 00');
  const before = goal('pd_form_error').length;
  await page.locator('button[type=submit]').click();
  await waitGoal('pd_form_error', before + 1);
  assert.equal(goal('pd_form_error').at(-1)[3].error_type, 'selection');
  assert.equal(goal('pd_form_error').at(-1)[3].form, 'sample');
  assert.equal(goal('pd_form_error').at(-1)[3].article_slug, undefined, 'Direct form has no article attribution');

  const compare = 'kak-sravnit-obraztsy-shu-puera';
  await page.goto(taggedArticle(compare, compare + '_channel'));
  await page.locator('.article-body a[href="/catalog/"]').click();
  await page.waitForURL('**/catalog/');
  await page.waitForFunction(() => history.state?.pdArticleSource?.placement === 'body');
  const catalogHit = calls.findLast(c => c[1] === 'hit' && c[2] === '/catalog/' && c[3]?.params?.article_slug === compare);
  assert.equal(catalogHit?.[3].params.article_channel, 'vk_channel');
  await page.goBack();
  await page.waitForURL('**/blog/' + compare + '/**');
  await page.goForward();
  await page.waitForURL('**/catalog/');
  await page.locator('main a[href^="/catalog/product/"]').first().click();
  await page.waitForURL('**/catalog/product/**');
  await page.waitForFunction(() => history.state?.pdArticleSource?.placement === 'body');
  await page.locator('main a[href^="/sample/?product="]').first().click();
  await page.waitForURL('**/sample/**');
  await page.locator('[name=name]').fill('MASK_TEST_PERSON_20261021');
  await page.locator('[name=contact]').fill('+7 000 000 00 00');
  await page.locator('button[type=submit]').click();
  await page.locator('#form-success').waitFor({ state: 'visible' });
  await waitGoal('pd_sample_success', 1);
  assert.equal(goal('pd_sample_success')[0][3].article_slug, compare);
  assert.equal(goal('pd_sample_success')[0][3].article_channel, 'vk_channel');
  assert.equal(goal('pd_sample_success')[0][3].article_placement, 'body');
  assert.ok(sentPayloads.at(-1).includes(articleUrl(compare)) && sentPayloads.at(-1).includes('Канал VK'));
  checks.push('VK channel body CTA, catalogue, back/forward, product and accepted sample enquiry preserve the first buying click');

  // A different article has its own source. Unknown or forged tags never enter metrics.
  const invalidTag = 'MASK_TEST_UNKNOWN_20261021';
  await page.goto(taggedArticle(packaging, invalidTag));
  const clicksBeforeUnknownTag = goal('pd_inquiry_click').length;
  await page.locator('.article-next a').click();
  await waitGoal('pd_inquiry_click', clicksBeforeUnknownTag + 1);
  await page.waitForURL('**/contact/**');
  assert.equal(goal('pd_inquiry_click').at(-1)[3].article_channel, 'unknown');
  assert.equal(goal('pd_inquiry_click').at(-1)[3].article_slug, packaging);
  await page.reload();
  await page.waitForFunction(() => Boolean(history.state?.pdArticleSource));
  await page.evaluate(() => { const now = Date.now(); Date.now = () => now + 31 * 60 * 1000; });
  const startsBeforeExpiredEntry = goal('pd_inquiry_start').length;
  await page.locator('[name=name]').fill('MASK_TEST_PERSON_20261021');
  await waitGoal('pd_inquiry_start', startsBeforeExpiredEntry + 1);
  assert.equal(goal('pd_inquiry_start').at(-1)[3].article_slug, undefined, 'Expired context on a reloaded entry is not reused');
  await page.goto('https://puerhdirect.ru/contact/?article_slug=MASK_TEST_UNKNOWN_20261021&article_channel=vk_wall');
  const successesBeforeDirectEntry = goal('pd_inquiry_success').length;
  await page.locator('[name=name]').fill('MASK_TEST_PERSON_20261021');
  await page.locator('[name=contact]').fill('+7 000 000 00 00');
  await page.locator('button[type=submit]').click();
  await page.locator('#form-success').waitFor({ state: 'visible' });
  await waitGoal('pd_inquiry_success', successesBeforeDirectEntry + 1);
  assert.equal(goal('pd_inquiry_success').at(-1)[3].article_slug, undefined);
  assert.ok(!sentPayloads.at(-1).includes('/blog/') && !sentPayloads.at(-1).includes('article_slug'));
  checks.push('Expired, unrecognized channel and forged direct-entry parameters cannot transfer a previous article');

  for (const c of calls.filter(x => x[1] === 'reachGoal')) {
    assert.ok(Object.keys(c[3]).every(k => ['page','form','destination','channel','sku','depth_percent','error_type','article_slug','article_channel','article_placement'].includes(k)));
    assert.doesNotMatch(JSON.stringify(c), /MASK_TEST|mask-test|@example|\+7 000|\?/);
  }
  checks.push('All SSR input/textarea values masked; no record overrides; submission auto-capture disabled; event payloads contain no canaries');
  const beforeLocal = calls.length;
  await page.goto('http://localhost/catalog/product/2024-ripe-puerh-brick-black-pearl-xinwen/');
  assert.equal(calls.length, beforeLocal, 'Local preview does not send analytics');
  assert.deepEqual(errors, []);
  const result = { date: new Date().toISOString(), checks, calls: calls.length, mockedPosts: posts, externalRequests: 0, pageErrors: errors, replayMaskingScope: 'SSR/DOM classes checked; actual Yandex playback requires separate live verification' };
  fs.writeFileSync(path.join(root,'artifacts/analytics-verification.json'), JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
} finally { await browser.close(); }
