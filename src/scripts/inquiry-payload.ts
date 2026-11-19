import type { PurchaseSource } from './article-source';

/** ASCII field names keep Web3Forms email headings readable; values retain their language. */
export function inquiryPayload(form: HTMLFormElement, pagePath: string, article?: PurchaseSource): FormData {
  const source = new FormData(form);
  const body = new FormData();
  const copy = (key: string, label = key) => {
    const value = source.get(key);
    if (typeof value === 'string' && value.trim()) body.set(label, value.trim());
  };
  // Preserve delivery settings and the honeypot. Never use visitor email as recipient.
  for (const key of ['access_key', 'from_name', 'subject', 'redirect', 'botcheck']) copy(key);
  body.set('Request type', form.id === 'sample-form' ? 'Запрос образцов' : 'Запрос с сайта');
  copy('name', 'Name');
  copy('contact', 'Phone');
  // The reserved email field gives Web3Forms the customer's Reply-To address.
  copy('email');
  copy('inquiry_topic', 'Inquiry topic');
  copy('product_requested', 'Product');
  copy('product_sku', 'SKU');
  copy('selected_samples', 'Selected samples');
  copy('destination', 'Destination');
  copy('message', 'Message');
  if (article) {
    body.set('Article', `https://puerhdirect.ru/blog/${article.slug}/`);
    if (article.channel === 'vk_wall') body.set('Article channel', 'Сообщество VK');
    if (article.channel === 'vk_channel') body.set('Article channel', 'Канал VK');
  }
  // Do not forward query parameters, which could contain unrelated personal data.
  body.set('Page', `https://puerhdirect.ru${pagePath}`);
  return body;
}
