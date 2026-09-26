// Only fixed event names and non-personal, allowlisted context leave the site.
export const goalNames = ['pd_inquiry_click', 'pd_sample_select', 'pd_inquiry_start', 'pd_inquiry_success', 'pd_sample_success', 'pd_contact_click'] as const;
type Goal = typeof goalNames[number];
type Context = { form?: 'contact' | 'sample'; destination?: 'contact' | 'sample'; channel?: 'telegram' | 'whatsapp' | 'vk' | 'email' | 'phone'; sku?: string };
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
