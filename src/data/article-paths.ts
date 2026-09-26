// Navigation choices point to existing pages; article claims remain in content.
export const articlePaths: Record<string, { category: string; label: string; href: string }> = {
  'kak-sravnit-obraztsy-shu-puera': { category: 'Выбор образцов', label: 'Выбрать платные образцы', href: '/sample/' },
  'ot-obraztsa-k-partii-puera': { category: 'Согласование поставки', label: 'Обсудить выбранную партию', href: '/contact/#inquiry-form' },
  'shu-i-shen-puer-raznica': { category: 'Выбор чая', label: 'Сравнить чай в каталоге', href: '/catalog/' },
  'kak-vybrat-postavshika-puera-v-kitae': { category: 'Первая закупка', label: 'Выбрать платные образцы', href: '/sample/' },
  'privatnaya-marka-puera-rukovodstvo': { category: 'Свой бренд', label: 'Обсудить свой бренд', href: '/contact/?topic=private-label#inquiry-form' },
  'proizvodstvo-puera-ot-lista-do-blina': { category: 'О чае', label: 'Посмотреть пуэр', href: '/catalog/' },
  'khranenie-puera-usloviya-vyderzhki': { category: 'После закупки', label: 'Обсудить условия заказа', href: '/contact/#inquiry-form' },
};
