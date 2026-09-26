/** Web3Forms renders custom fields as email rows; omit absent context and duplicates. */
export function inquiryPayload(form: HTMLFormElement, pagePath: string): FormData {
  const source = new FormData(form);
  const body = new FormData();
  const copy = (key: string, label = key) => {
    const value = source.get(key);
    if (typeof value === 'string' && value.trim()) body.set(label, value.trim());
  };
  // Preserve delivery settings and the honeypot. Never use visitor email as recipient.
  for (const key of ['access_key', 'from_name', 'subject', 'redirect', 'botcheck']) copy(key);
  body.set('Тип запроса', form.id === 'sample-form' ? 'Запрос образцов' : 'Запрос с сайта');
  copy('name', 'Имя');
  copy('contact', 'Телефон');
  // The reserved email field gives Web3Forms the customer's Reply-To address.
  copy('email');
  copy('inquiry_topic', 'Тема запроса');
  copy('product_requested', 'Товар');
  copy('product_sku', 'Артикул');
  copy('selected_samples', 'Образцы');
  copy('destination', 'Город');
  copy('message', 'Комментарий');
  // Do not forward query parameters, which could contain unrelated personal data.
  body.set('Страница', `https://puerhdirect.ru${pagePath}`);
  return body;
}
