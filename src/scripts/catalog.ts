const initialized = new WeakSet<HTMLElement>();
const normalize = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е').trim();
function setupCatalog() {
  document.querySelectorAll<HTMLElement>('[data-catalog-browser]').forEach(root => {
    if (initialized.has(root)) return;
    initialized.add(root);
    const form = root.querySelector<HTMLFormElement>('form')!;
    const query = form.querySelector<HTMLInputElement>('[name="q"]')!;
    const type = form.querySelector<HTMLSelectElement>('[name="type"]');
    const shape = form.querySelector<HTMLSelectElement>('[name="shape"]')!;
    const sort = root.querySelector<HTMLSelectElement>('[name="sort"]')!;
    const grid = root.querySelector<HTMLElement>('.catalog-grid')!;
    const items = [...root.querySelectorAll<HTMLElement>('[data-catalog-item]')];
    const count = root.querySelector<HTMLElement>('[data-result-count]')!;
    const reset = root.querySelector<HTMLButtonElement>('[data-reset-filters]')!;
    const empty = root.querySelector<HTMLElement>('.catalog-empty')!;
    const toggle = root.querySelector<HTMLButtonElement>('[data-toggle-filters]')!;
    function expandFilters(expanded: boolean) {
      root.dataset.filtersExpanded = String(expanded);
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.textContent = expanded ? 'Скрыть фильтры' : 'Фильтры и порядок';
    }
    toggle.addEventListener('click', () => expandFilters(root.dataset.filtersExpanded !== 'true'));
    function apply(writeUrl = true) {
      const words = normalize(query.value).split(/\s+/).filter(Boolean);
      let found = 0;
      items.forEach(item => {
        const match = (!type?.value || item.dataset.kind === type.value) &&
          (!shape.value || item.dataset.shape === shape.value) &&
          words.every(word => normalize(item.dataset.search || '').includes(word));
        item.hidden = !match;
        if (match) found++;
      });
      count.textContent = String(found);
      empty.hidden = found > 0;
      reset.hidden = !query.value && !type?.value && !shape.value && !sort.value;
      const ordered = [...items];
      if (sort.value) {
        const [key, direction] = sort.value.split('-');
        ordered.sort((a, b) => (Number(a.dataset[key]) - Number(b.dataset[key])) * (direction === 'desc' ? -1 : 1));
      }
      ordered.forEach(item => grid.append(item));
      if (writeUrl) {
        const url = new URL(location.href);
        for (const [name, value] of [['q', query.value.trim()], ['type', type?.value || ''], ['shape', shape.value], ['sort', sort.value]]) {
          if (value) url.searchParams.set(name, value);
          else url.searchParams.delete(name);
        }
        history.replaceState(history.state, '', url);
      }
    }
    function readUrl() {
      const params = new URLSearchParams(location.search);
      query.value = params.get('q') || '';
      if (type) type.value = ['raw', 'ripe'].includes(params.get('type') || '') ? params.get('type')! : '';
      shape.value = ['cake', 'brick', 'tuocha'].includes(params.get('shape') || '') ? params.get('shape')! : '';
      sort.value = ['year-desc', 'year-asc', 'weight-asc', 'weight-desc'].includes(params.get('sort') || '') ? params.get('sort')! : '';
      apply(false);
    }
    form.hidden = false;
    root.querySelector<HTMLElement>('.catalog-sort')!.hidden = false;
    sort.addEventListener('change', () => apply());
    form.addEventListener('submit', event => { event.preventDefault(); apply(); });
    query.addEventListener('input', () => apply());
    form.addEventListener('change', () => apply());
    reset.addEventListener('click', () => { form.reset(); sort.value = ''; apply(); query.focus(); });
    readUrl();
    expandFilters(Boolean(type?.value || shape.value || sort.value));
  });
}
setupCatalog();
document.addEventListener('astro:page-load', setupCatalog);
