const initialized = new WeakSet<HTMLFormElement>();
const isLocalPreview = () => !['puerhdirect.ru', 'www.puerhdirect.ru'].includes(location.hostname);

function setupInquiries() {
  document.querySelectorAll<HTMLFormElement>('form[data-inquiry-form]').forEach(form => {
    if (initialized.has(form)) return;
    initialized.add(form);
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const success = form.querySelector<HTMLElement>('#form-success')!;
    const error = form.querySelector<HTMLElement>('#form-error')!;
    const preview = form.querySelector<HTMLElement>('#form-preview')!;
    const selectionError = form.querySelector<HTMLElement>('#selection-error');
    const boxes = [...form.querySelectorAll<HTMLInputElement>('.sample-card input[type="checkbox"]')];
    const counter = form.querySelector<HTMLElement>('#count');
    const selectedField = form.querySelector<HTMLInputElement>('[name="selected_samples"]');
    const originalButton = button.innerHTML;
    let pending = false;
    const selected = () => boxes.filter(box => box.checked);
    function updateSamples() {
      const checked = selected();
      if (counter) counter.textContent = String(checked.length);
      if (selectedField) selectedField.value = checked.map(box => box.value + ' — ' + box.dataset.product).join(', ');
      boxes.forEach(box => { box.disabled = !box.checked && checked.length >= 5; });
      if (checked.length) selectionError?.classList.add('hidden');
    }
    boxes.forEach(box => box.addEventListener('change', updateSamples));
    const params = new URLSearchParams(location.search);
    const product = params.get('product') || '';
    const requested = form.querySelector<HTMLInputElement>('[name="product_requested"]');
    const sku = form.querySelector<HTMLInputElement>('[name="product_sku"]');
    if (requested) requested.value = (params.get('tea') || product).slice(0, 200);
    if (sku && /^[a-z0-9-]{1,160}$/.test(product)) sku.value = product;
    const chosenBox = boxes.find(box => box.value === product);
    if (chosenBox) chosenBox.checked = true;
    updateSamples();
    if (isLocalPreview()) {
      form.action = '#';
      preview.textContent = 'Локальный просмотр: форма проверяется без отправки. | 本地预览：表单可验证，不会发送真实询盘。';
      preview.classList.remove('hidden');
    }
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (pending) return;
      success.classList.add('hidden');
      error.classList.add('hidden');
      if (boxes.length && (selected().length < 1 || selected().length > 5)) {
        selectionError?.classList.remove('hidden');
        selectionError?.scrollIntoView({ block: 'center' });
        return;
      }
      if (!form.reportValidity()) return;
      if (isLocalPreview()) {
        preview.textContent = 'Форма заполнена корректно. В локальном просмотре запрос не отправляется. | 填写校验通过；本地预览未发送询盘。';
        preview.classList.remove('hidden');
        preview.focus();
        return;
      }
      pending = true;
      button.disabled = true;
      button.textContent = 'Отправка… | Sending…';
      form.setAttribute('aria-busy', 'true');
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(form.action, {
          method: 'POST', body: new FormData(form), signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok || data.success !== true) throw new Error('Submission rejected');
        form.reset();
        updateSamples();
        // Retain the product context for a possible follow-up request.
        if (requested) requested.value = (params.get('tea') || product).slice(0, 200);
        if (sku && /^[a-z0-9-]{1,160}$/.test(product)) sku.value = product;
        success.classList.remove('hidden');
        success.focus();
      } catch {
        error.classList.remove('hidden');
        error.focus();
      } finally {
        window.clearTimeout(timeout);
        pending = false;
        button.disabled = false;
        button.innerHTML = originalButton;
        form.removeAttribute('aria-busy');
      }
    });
  });
}
setupInquiries();
document.addEventListener('astro:page-load', setupInquiries);
