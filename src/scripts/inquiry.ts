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
    const sampleSearch = form.querySelector<HTMLInputElement>('#sample-search');
    const sampleType = form.querySelector<HTMLSelectElement>('#sample-type');
    const onlySelectedButton = form.querySelector<HTMLButtonElement>('#sample-only-selected');
    const resetFilters = form.querySelector<HTMLButtonElement>('#sample-reset-filters');
    const showMore = form.querySelector<HTMLButtonElement>('#sample-show-more');
    const selectedList = form.querySelector<HTMLUListElement>('#sample-selected-list');
    let onlySelected = false;
    let visibleLimit = 12;
    function filterSamples() {
      if (!sampleSearch) return;
      const words = sampleSearch.value.toLocaleLowerCase('ru').replace(/ё/g, 'е').trim().split(/\s+/).filter(Boolean);
      const matching = boxes.filter(box => {
        const text = (box.closest('.sample-card')?.textContent || '').toLocaleLowerCase('ru').replace(/ё/g, 'е');
        return words.every(word => text.includes(word)) && (!sampleType?.value || box.dataset.type === sampleType.value) && (!onlySelected || box.checked);
      });
      // Keep a preselected product visible even when it is beyond the first batch.
      const visible = new Set(matching.filter((box, index) => index < visibleLimit || box.checked));
      boxes.forEach(box => { box.closest<HTMLElement>('.sample-card')!.hidden = !visible.has(box); });
      const empty = form.querySelector<HTMLElement>('#sample-empty')!;
      empty.classList.toggle('hidden', matching.length > 0);
      empty.textContent = onlySelected ? 'Пока ничего не выбрано. Вернитесь ко всем видам чая.' : 'Ничего не найдено. Измените или сбросьте фильтры.';
      form.querySelector<HTMLElement>('#sample-visible-count')!.textContent = `Показано: ${visible.size} из ${matching.length}`;
      if (showMore) {
        showMore.hidden = visible.size >= matching.length;
        showMore.textContent = `Показать ещё · осталось ${matching.length - visible.size}`;
      }
      if (resetFilters) resetFilters.hidden = !words.length && !sampleType?.value && !onlySelected;
      onlySelectedButton?.setAttribute('aria-pressed', String(onlySelected));
    }
    function updateSamples() {
      const checked = selected();
      if (counter) counter.textContent = String(checked.length);
      if (selectedField) selectedField.value = checked.map(box => box.value + ' — ' + box.dataset.product).join(', ');
      boxes.forEach(box => { box.disabled = !box.checked && checked.length >= 5; });
      if (checked.length) selectionError?.classList.add('hidden');
      if (selectedList) {
        selectedList.replaceChildren();
        checked.forEach((box, index) => {
          const row = document.createElement('li');
          const label = document.createElement('span');
          label.textContent = `${box.dataset.product} · ${box.dataset.year}`;
          const remove = document.createElement('button');
          remove.type = 'button';
          remove.textContent = '×';
          remove.setAttribute('aria-label', `Убрать: ${label.textContent}`);
          remove.addEventListener('click', () => {
            box.checked = false;
            updateSamples();
            const next = selectedList.querySelectorAll<HTMLButtonElement>('button');
            (next[Math.min(index, next.length - 1)] || onlySelectedButton)?.focus();
          });
          row.append(label, remove);
          selectedList.append(row);
        });
        form.querySelector<HTMLElement>('#sample-summary-empty')!.hidden = checked.length > 0;
        form.querySelector<HTMLElement>('#sample-limit-note')!.hidden = checked.length < 5;
      }
      filterSamples();
    }
    boxes.forEach(box => box.addEventListener('change', updateSamples));
    if (sampleSearch) {
      form.querySelector<HTMLElement>('#sample-search-control')!.hidden = false;
      form.querySelector<HTMLElement>('#sample-summary')!.hidden = false;
      const filterChanged = () => { visibleLimit = 12; filterSamples(); };
      sampleSearch.addEventListener('input', filterChanged);
      sampleType?.addEventListener('change', filterChanged);
      onlySelectedButton?.addEventListener('click', () => {
        onlySelected = !onlySelected;
        sampleSearch.value = '';
        if (sampleType) sampleType.value = '';
        filterChanged();
      });
      resetFilters?.addEventListener('click', () => {
        sampleSearch.value = '';
        if (sampleType) sampleType.value = '';
        onlySelected = false;
        filterChanged();
      });
      showMore?.addEventListener('click', () => { visibleLimit += 12; filterSamples(); });
      form.querySelector('.sample-continue')?.addEventListener('click', () => {
        form.querySelector<HTMLElement>('#sample-details')?.focus({ preventScroll: true });
      });
      form.addEventListener('reset', () => queueMicrotask(() => {
        onlySelected = false;
        visibleLimit = 12;
        updateSamples();
      }));
    }
    const params = new URLSearchParams(location.search);
    let product = params.get('product') || '';
    let productName = (params.get('tea') || product).slice(0, 200);
    const topics: Record<string, string> = form.dataset.inquiryTopics ? JSON.parse(form.dataset.inquiryTopics) : {};
    const topicKey = params.get('topic') || '';
    let topic = Object.hasOwn(topics, topicKey) ? topics[topicKey] : '';
    const catalogue: { slug: string; name: string }[] | null = form.dataset.productCatalog ? JSON.parse(form.dataset.productCatalog) : null;
    if (catalogue) {
      const match = catalogue.find(item => item.slug === product);
      product = match?.slug || '';
      productName = match?.name || '';
    }
    const requested = form.querySelector<HTMLInputElement>('[name="product_requested"]');
    const sku = form.querySelector<HTMLInputElement>('[name="product_sku"]');
    const topicField = form.querySelector<HTMLInputElement>('[name="inquiry_topic"]');
    function restoreProduct() {
      if (requested) requested.value = productName;
      if (sku) sku.value = /^[a-z0-9-]{1,160}$/.test(product) ? product : '';
      if (topicField) topicField.value = topic;
      form.querySelector('#selected-product')?.classList.toggle('hidden', !product && !topic);
      const label = form.querySelector('#selected-product-name');
      if (label) label.textContent = productName || topic;
    }
    restoreProduct();
    form.querySelector('#clear-product')?.addEventListener('click', () => {
      product = '';
      productName = '';
      topic = '';
      restoreProduct();
      form.querySelector<HTMLInputElement>('[name="contact"]')?.focus();
    });
    const contact = form.querySelector<HTMLInputElement>('[name="contact"]');
    contact?.addEventListener('input', () => contact.setCustomValidity(''));
    const name = form.querySelector<HTMLInputElement>('[name="name"]');
    name?.addEventListener('input', () => name.setCustomValidity(''));
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
      if (contact) {
        contact.value = contact.value.trim();
        contact.setCustomValidity(contact.value ? '' : 'Укажите контакт для ответа.');
        if (contact.type === 'tel' && contact.value) {
          const digits = contact.value.replace(/\D/g, '');
          if (!/^[+()\d\s.-]+$/.test(contact.value) || digits.length < 7 || digits.length > 15) {
            contact.setCustomValidity('Укажите номер телефона с кодом страны.');
          }
        }
      }
      if (name?.required) {
        name.value = name.value.trim();
        name.setCustomValidity(name.value ? '' : 'Укажите ваше имя.');
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
      button.textContent = catalogue ? 'Отправка…' : 'Отправка… | Sending…';
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
        restoreProduct();
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
