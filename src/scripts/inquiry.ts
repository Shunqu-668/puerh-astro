import { products } from "../data/products";
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
    const knownProduct = products.find(item => item.slug === product);
    const weightField = form.querySelector<HTMLInputElement>('[name="product_unit_weight_g"]');
    const productContext = form.querySelector<HTMLElement>('[data-product-context]');
    const volume = form.querySelector<HTMLInputElement>('[name="order_volume"]');
    let derivedVolume = '';
    function restoreProductContext() {
      if (requested) requested.value = knownProduct ? knownProduct.nameRu : (params.get('tea') || product).slice(0, 200);
      if (sku) sku.value = knownProduct?.slug || '';
      if (weightField) weightField.value = knownProduct ? String(knownProduct.unitWeightGrams) : '';
      if (productContext && knownProduct) {
        productContext.hidden = false;
        productContext.textContent = `${knownProduct.unitWeightGrams} г/шт. · ${knownProduct.unitsPerCarton} шт./коробка по каталогу. Партию и упаковку уточним; полная коробка не обязательна.`;
      }
      const q = Number(params.get('quantity'));
      const unit = params.get('unit');
      const valid = Number.isFinite(q) && q > 0 && q <= 1000000 && (unit === 'pieces' ? Number.isInteger(q) : unit === 'kg' && Math.abs(q * 1000 - Math.round(q * 1000)) < 0.00001);
      if (volume && knownProduct && valid) {
        const format = (value: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 3 }).format(value);
        volume.value = unit === 'pieces' ? `${format(q)} шт. (≈ ${format(q * knownProduct.unitWeightGrams / 1000)} кг нетто)` : `${format(q)} кг нетто (≈ ${format(q * 1000 / knownProduct.unitWeightGrams)} шт., ориентир)`;
        derivedVolume = volume.value;
      }
    }
    restoreProductContext();
    requested?.addEventListener('input', () => {
      // Manual tea changes must not leave the previous SKU or weight in the inquiry.
      const matches = knownProduct && requested.value === knownProduct.nameRu;
      if (sku) sku.value = matches ? knownProduct.slug : '';
      if (weightField) weightField.value = matches ? String(knownProduct.unitWeightGrams) : '';
      if (productContext) productContext.hidden = !matches;
      if (!matches && volume && volume.value === derivedVolume) volume.value = '';
    });
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
        restoreProductContext();
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
