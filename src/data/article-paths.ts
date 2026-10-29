// Navigation choices point to existing pages; article claims remain in content.
export const articlePaths: Record<string, { category: string; label: string; href: string }> = {
  "puer-lunchzhu-ves-upakovka": {"category": "Первая закупка", "label": "Уточнить чай и фасовку", "href": "/contact/?topic=tea-selection#inquiry-form"},
  'rassypnoy-puer-zayavka-postavshchiku': { category: 'Закупка рассыпного чая', label: 'Обсудить заявку на рассыпной пуэр', href: '/contact/?topic=tea-selection#inquiry-form' },
  'maket-upakovki-puera-pered-pechatyu': { category: 'Упаковка', label: 'Обсудить макет и упаковку', href: '/contact/?topic=private-label#inquiry-form' },
  'povtornaya-zakupka-shu-puera': { category: 'Повторная закупка', label: 'Обсудить повторную поставку', href: '/contact/#inquiry-form' },
  'stoimost-partii-puera': { category: 'Расчёт закупки', label: 'Запросить расчёт партии', href: '/contact/#inquiry-form' },
  'dannye-dlya-kartochki-puera': { category: 'Для продавцов', label: 'Обсудить чай для своей линейки', href: '/contact/?topic=private-label#inquiry-form' },
  'kak-sravnit-obraztsy-shu-puera': { category: 'Выбор образцов', label: 'Выбрать платные образцы', href: '/sample/' },
  'ot-obraztsa-k-partii-puera': { category: 'Согласование поставки', label: 'Обсудить выбранную партию', href: '/contact/#inquiry-form' },
  'shu-i-shen-puer-raznica': { category: 'Выбор чая', label: 'Сравнить чай в каталоге', href: '/catalog/' },
  'kak-vybrat-postavshika-puera-v-kitae': { category: 'Первая закупка', label: 'Выбрать платные образцы', href: '/sample/' },
  'privatnaya-marka-puera-rukovodstvo': { category: 'Свой бренд', label: 'Обсудить свой бренд', href: '/contact/?topic=private-label#inquiry-form' },
  'proizvodstvo-puera-ot-lista-do-blina': { category: 'О чае', label: 'Посмотреть пуэр', href: '/catalog/' },
  'khranenie-puera-usloviya-vyderzhki': { category: 'После закупки', label: 'Обсудить условия заказа', href: '/contact/#inquiry-form' },
};

// Explicit reading paths selected by procurement stage.
export const articleRelated: Record<string, string[]> = {
  "rassypnoy-puer-zayavka-postavshchiku": [
    "stoimost-partii-puera",
    "povtornaya-zakupka-shu-puera"
  ],
  "maket-upakovki-puera-pered-pechatyu": [
    "privatnaya-marka-puera-rukovodstvo",
    "dannye-dlya-kartochki-puera"
  ],
  "povtornaya-zakupka-shu-puera": [
    "kak-sravnit-obraztsy-shu-puera",
    "khranenie-puera-usloviya-vyderzhki"
  ],
  "stoimost-partii-puera": [
    "rassypnoy-puer-zayavka-postavshchiku",
    "ot-obraztsa-k-partii-puera"
  ],
  "dannye-dlya-kartochki-puera": [
    "maket-upakovki-puera-pered-pechatyu",
    "privatnaya-marka-puera-rukovodstvo"
  ],
  "kak-sravnit-obraztsy-shu-puera": [
    "ot-obraztsa-k-partii-puera",
    "povtornaya-zakupka-shu-puera"
  ],
  "ot-obraztsa-k-partii-puera": [
    "stoimost-partii-puera",
    "povtornaya-zakupka-shu-puera"
  ],
  "shu-i-shen-puer-raznica": [
    "kak-sravnit-obraztsy-shu-puera",
    "proizvodstvo-puera-ot-lista-do-blina"
  ],
  "kak-vybrat-postavshika-puera-v-kitae": [
    "kak-sravnit-obraztsy-shu-puera",
    "stoimost-partii-puera"
  ],
  "privatnaya-marka-puera-rukovodstvo": [
    "maket-upakovki-puera-pered-pechatyu",
    "dannye-dlya-kartochki-puera"
  ],
  "proizvodstvo-puera-ot-lista-do-blina": [
    "shu-i-shen-puer-raznica",
    "privatnaya-marka-puera-rukovodstvo"
  ],
  "khranenie-puera-usloviya-vyderzhki": [
    "povtornaya-zakupka-shu-puera",
    "rassypnoy-puer-zayavka-postavshchiku"
  ],
  "puer-lunchzhu-ves-upakovka": [
    "dannye-dlya-kartochki-puera",
    "kak-sravnit-obraztsy-shu-puera"
  ]
};
