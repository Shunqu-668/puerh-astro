let cleanup: (() => void) | undefined;
function initReading() {
  cleanup?.();
  const surface = document.querySelector<HTMLElement>('.reading-surface');
  if (!surface) return;
  const theme = surface.querySelector<HTMLButtonElement>('[data-reading-theme]')!;
  const size = surface.querySelector<HTMLButtonElement>('[data-reading-size]')!;
  const progress = surface.querySelector<HTMLElement>('.reading-progress')!;
  function setTheme(value: string) {
    surface!.dataset.theme = value;
    theme.textContent = value === 'dark' ? 'Светлый фон' : 'Тёмный фон';
    theme.setAttribute('aria-pressed', String(value === 'dark'));
  }
  try { setTheme(localStorage.getItem('pd-reading-theme') === 'dark' ? 'dark' : 'light'); } catch { setTheme('light'); }
  theme.onclick = () => {
    const value = surface.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(value);
    try { localStorage.setItem('pd-reading-theme', value); } catch { /* Preference is optional. */ }
  };
  size.onclick = () => {
    const large = surface.classList.toggle('large');
    size.textContent = large ? 'A− Обычный текст' : 'A+ Крупнее текст';
    size.setAttribute('aria-pressed', String(large));
  };
  function update() {
    const article = surface!.querySelector<HTMLElement>('.article-body')!;
    const rect = article.getBoundingClientRect();
    progress.style.width = `${Math.max(0, Math.min(100, -rect.top / Math.max(1, rect.height - innerHeight) * 100))}%`;
  }
  addEventListener('scroll', update, {passive:true});
  addEventListener('resize', update);
  update();
  cleanup = () => { removeEventListener('scroll', update); removeEventListener('resize', update); };
}
document.addEventListener('astro:page-load', initReading);
document.addEventListener('astro:before-swap', () => cleanup?.());
initReading();
