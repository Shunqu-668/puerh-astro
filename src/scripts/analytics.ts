// Only fixed event names and non-personal, allowlisted context leave the site.
export const goalNames = ['pd_inquiry_click', 'pd_sample_select', 'pd_inquiry_start', 'pd_inquiry_success', 'pd_sample_success', 'pd_contact_click', 'pd_article_read', 'pd_product_view', 'pd_form_error'] as const;
type Goal = typeof goalNames[number];
export type FormError = 'validation' | 'selection' | 'server' | 'response' | 'network' | 'timeout';
type Context = { form?: 'contact' | 'sample'; destination?: 'contact' | 'sample'; channel?: 'telegram' | 'whatsapp' | 'vk' | 'email' | 'phone'; sku?: string; depth?: 25 | 50 | 75 | 100; error?: FormError };
type MetricsWindow = Window & { ym?: (...args: unknown[]) => void };
export function trackGoal(goal: Goal, context: Context = {}) {
  if (!['puerhdirect.ru', 'www.puerhdirect.ru'].includes(location.hostname)) return;
  const ym = (window as MetricsWindow).ym;
  if (typeof ym !== 'function') return;
  const params: Record<string, string> = {};
  if (/^\/[a-z0-9/-]*$/.test(location.pathname)) params.page = location.pathname;
  if (context.form && ['contact', 'sample'].includes(context.form)) params.form = context.form;
  if (context.destination && ['contact', 'sample'].includes(context.destination)) params.destination = context.destination;
  if (context.channel && ['telegram', 'whatsapp', 'vk', 'email', 'phone'].includes(context.channel)) params.channel = context.channel;
  if (context.sku && /^[a-z0-9-]{1,160}$/.test(context.sku)) params.sku = context.sku;
  if (context.depth && [25, 50, 75, 100].includes(context.depth)) params.depth_percent = String(context.depth);
  if (context.error && ['validation', 'selection', 'server', 'response', 'network', 'timeout'].includes(context.error)) params.error_type = context.error;
  // Analytics must never interrupt navigation, successful form handling or resets.
  try { ym(109468811, 'reachGoal', goal, params); } catch { /* Optional measurement. */ }
}

document.addEventListener('click', event => {
  const anchor = (event.target as Element | null)?.closest?.('a[href]');
  if (!anchor) return;
  let url: URL;
  try { url = new URL(anchor.getAttribute('href') || '', location.href); } catch { return; }
  if (url.origin === location.origin) {
    const route = url.pathname.replace(/\/+$/, '');
    if (route === '/contact' || route === '/sample') {
      trackGoal('pd_inquiry_click', { destination: route === '/sample' ? 'sample' : 'contact' });
    }
    return;
  }
  const channel = url.protocol === 'mailto:' ? 'email' : url.protocol === 'tel:' ? 'phone'
    : ['t.me', 'telegram.me'].includes(url.hostname) ? 'telegram'
    : ['wa.me', 'api.whatsapp.com'].includes(url.hostname) ? 'whatsapp'
    : ['vk.com', 'vk.ru'].includes(url.hostname) ? 'vk' : undefined;
  if (channel) trackGoal('pd_contact_click', { channel });
});

let initialized = false;
let trackedMain: Element | null = null;
let stopReading = () => {};

function trackPageContent() {
  const main = document.querySelector('main');
  if (!main || main === trackedMain) return;
  stopReading();
  trackedMain = main;
  const product = main.querySelector<HTMLElement>('[data-analytics-product]');
  if (product) trackGoal('pd_product_view', { sku: product.dataset.analyticsProduct });

  const article = main.querySelector<HTMLElement>('[data-analytics-article]');
  if (!article) return;
  const sent = new Set<number>();
  // Measure reached article depth after active, visible dwell, not claimed comprehension.
  let visibleMs = 0;
  let previousTick = performance.now();
  let previousVisible = document.visibilityState === 'visible';
  let lastActivity = performance.now();
  const active = () => { lastActivity = performance.now(); };
  const tick = () => {
    const now = performance.now();
    const visible = document.visibilityState === 'visible';
    const rect = article.getBoundingClientRect();
    if (visible && previousVisible && rect.top < innerHeight && rect.bottom > 0 && now - lastActivity < 60000) {
      visibleMs += Math.min(now - previousTick, 1500);
    }
    previousTick = now;
    previousVisible = visible;
    if (!visible || rect.height <= 0 || rect.top >= innerHeight || rect.bottom <= 0) return;
    const depth = Math.min(100, Math.max(0, ((innerHeight - rect.top) / rect.height) * 100));
    for (const threshold of [25, 50, 75, 100] as const) {
      if (!sent.has(threshold) && depth + 0.1 >= threshold && visibleMs >= threshold * 200) {
        sent.add(threshold);
        trackGoal('pd_article_read', { depth: threshold });
      }
    }
  };
  const timer = window.setInterval(tick, 1000);
  const controller = new AbortController();
  for (const type of ['scroll', 'pointerdown', 'keydown']) {
    window.addEventListener(type, active, { passive: true, signal: controller.signal });
  }
  document.addEventListener('visibilitychange', tick, { signal: controller.signal });
  stopReading = () => { window.clearInterval(timer); controller.abort(); };
}

export function initializeAnalytics() {
  if (initialized || !['puerhdirect.ru', 'www.puerhdirect.ru'].includes(location.hostname)) return;
  initialized = true;
  const w = window as any;
  w.ym = w.ym || function (...args: unknown[]) { (w.ym.a = w.ym.a || []).push(args); };
  w.ym.l = Date.now();
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://mc.yandex.ru/metrika/tag.js';
  document.head.append(tag);
  w.ym(109468811, 'init', { clickmap: true, accurateTrackBounce: true, trackLinks: true, webvisor: true });
  let previousPage = location.pathname;
  document.addEventListener('astro:page-load', () => {
    if (location.pathname !== previousPage) {
      w.ym(109468811, 'hit', location.pathname, { title: document.title, referer: previousPage });
      previousPage = location.pathname;
    }
    trackPageContent();
  });
  document.addEventListener('astro:before-swap', () => { stopReading(); trackedMain = null; });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', trackPageContent, { once: true });
  else trackPageContent();
}
