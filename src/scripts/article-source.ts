// Sources belong to a single, deliberate buying path in one tab. Separate visits,
// navigation to unrelated pages and links opened in a new tab have no inferred source.
const publishedSlugs = new Set(Object.keys(import.meta.glob('../content/blog/*.md')).map(path => path.split('/').pop()!.slice(0, -3)));
const stateKey = 'pdArticleSource';
const lifetimeMs = 30 * 60 * 1000;

type ArticleChannel = 'vk_wall' | 'vk_channel' | 'unknown';
export interface ArticleEntry { slug: string; channel: ArticleChannel }
export interface PurchaseSource extends ArticleEntry { placement: 'body' | 'footer'; expires: number }

export function activeArticle(): ArticleEntry | undefined {
  const slug = document.querySelector<HTMLElement>('main [data-analytics-article]')?.dataset.analyticsArticle;
  if (!slug || !publishedSlugs.has(slug) || location.pathname !== `/blog/${slug}/`) return;
  const params = new URLSearchParams(location.search);
  const matches = (key: string, value: string) => params.getAll(key).length === 1 && params.get(key) === value;
  let channel: ArticleChannel = 'unknown';
  if (matches('utm_source', 'vk') && matches('utm_medium', 'social') && matches('utm_campaign', 'procurement_blog')) {
    if (matches('utm_content', slug)) channel = 'vk_wall';
    if (matches('utm_content', slug + '_channel')) channel = 'vk_channel';
  }
  return { slug, channel };
}

function purchasePage(path: string): boolean {
  return /^\/(?:contact|sample|private-label|compliance|catalog(?:\/(?:[a-z0-9-]+|product\/[a-z0-9-]+))?)\/?$/.test(path);
}

export function currentPurchaseSource(): PurchaseSource | undefined {
  const saved = history.state?.[stateKey];
  if (!saved || saved.path !== location.pathname || !purchasePage(saved.path) || !publishedSlugs.has(saved.slug)) return;
  if (!['vk_wall', 'vk_channel', 'unknown'].includes(saved.channel) || !['body', 'footer'].includes(saved.placement)) return;
  const remaining = saved.expires - Date.now();
  if (typeof saved.expires !== 'number' || !(remaining > 0 && remaining <= lifetimeMs)) return;
  return { slug: saved.slug, channel: saved.channel, placement: saved.placement, expires: saved.expires };
}

export function sourceForBuyingLink(link: Element): PurchaseSource | undefined {
  const article = activeArticle();
  if (!article) return currentPurchaseSource();
  const placement = link.closest('[data-analytics-article]') ? 'body' : link.closest('.article-next') ? 'footer' : undefined;
  return placement && { ...article, placement, expires: Date.now() + lifetimeMs };
}

function updateEntry(state: Record<string, unknown>) {
  try { history.replaceState(state, ''); } catch { /* Optional measurement. */ }
}

export function clearPurchaseSource() {
  if (history.state?.[stateKey]) {
    const state = { ...history.state };
    delete state[stateKey];
    updateEntry(state);
  }
}

// Astro supplies the actual activated link, then creates the destination history
// entry before after-swap. Back/forward reuses its own entry, never the last article
// seen in the tab. Refresh may resume that same entry until its original expiry.
document.addEventListener('astro:before-swap', event => {
  if (event.navigationType === 'traverse' || event.to.origin !== location.origin || !purchasePage(event.to.pathname)) return;
  const link = event.sourceElement?.closest('a[href]');
  if (!link) return;
  const source = sourceForBuyingLink(link);
  if (!source) return;
  const path = event.to.pathname;
  document.addEventListener('astro:after-swap', () => {
    if (location.pathname === path) updateEntry({ ...history.state, [stateKey]: { ...source, path } });
  }, { once: true });
});

export function sourceParameters(source?: ArticleEntry | PurchaseSource): Record<string, string> {
  if (!source) return {};
  const data: Record<string, string> = { article_slug: source.slug, article_channel: source.channel };
  if ('placement' in source) data.article_placement = source.placement;
  return data;
}
