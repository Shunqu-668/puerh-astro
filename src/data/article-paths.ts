// Editorial reading paths. Every new post needs two relevant published neighbours.
export interface ArticlePath {
  category: string;
  label: string;
  href: string;
  description: string;
  related: [string, string];
}

export const articlePaths: Record<string, ArticlePath> = {
  "puer-lunchzhu-ves-upakovka": {"category": "Первая закупка", "label": "Уточнить чай и фасовку", "href": "/contact/?topic=tea-selection#inquiry-form", "description": "Укажите шу или шэн, массу шарика, общий объём и нужную упаковку. Уточним чай и условия по вашему запросу.", "related": ["dannye-dlya-kartochki-puera", "kak-sravnit-obraztsy-shu-puera"]},
  "rassypnoy-puer-zayavka-postavshchiku": {
    "category": "Закупка рассыпного чая",
    "label": "Обсудить заявку на рассыпной пуэр",
    "href": "/contact/?topic=tea-selection#inquiry-form",
    "description": "Опишите шу или шэн, нужный объём и фасовку. Эти данные помогут обсудить подбор рассыпного чая.",
    "related": [
      "stoimost-partii-puera",
      "povtornaya-zakupka-shu-puera"
    ]
  },
  "maket-upakovki-puera-pered-pechatyu": {
    "category": "Упаковка",
    "label": "Обсудить макет и упаковку",
    "href": "/contact/?topic=private-label#inquiry-form",
    "description": "Пришлите выбранный чай и текущую версию макета. Обсудим, что нужно проверить до печати.",
    "related": [
      "privatnaya-marka-puera-rukovodstvo",
      "dannye-dlya-kartochki-puera"
    ]
  },
  "povtornaya-zakupka-shu-puera": {
    "category": "Повторная закупка",
    "label": "Обсудить повторную поставку",
    "href": "/contact/#inquiry-form",
    "description": "Укажите знакомый выпуск или пришлите фото упаковки. Наличие партии и условия повторной поставки проверим отдельно.",
    "related": [
      "kak-sravnit-obraztsy-shu-puera",
      "khranenie-puera-usloviya-vyderzhki"
    ]
  },
  "stoimost-partii-puera": {
    "category": "Расчёт закупки",
    "label": "Запросить расчёт партии",
    "href": "/contact/#inquiry-form",
    "description": "Пришлите название чая и примерный объём. Уточним состав расчёта и ещё не согласованные расходы.",
    "related": [
      "rassypnoy-puer-zayavka-postavshchiku",
      "ot-obraztsa-k-partii-puera"
    ]
  },
  "dannye-dlya-kartochki-puera": {
    "category": "Для продавцов",
    "label": "Уточнить сведения о чае",
    "href": "/contact/?topic=tea-selection#inquiry-form",
    "description": "Укажите выбранный чай и площадку. Обсудим, какие сведения и фотографии нужны для вашей карточки.",
    "related": [
      "maket-upakovki-puera-pered-pechatyu",
      "privatnaya-marka-puera-rukovodstvo"
    ]
  },
  "kak-sravnit-obraztsy-shu-puera": {
    "category": "Выбор образцов",
    "label": "Выбрать платные образцы",
    "href": "/sample/",
    "description": "Выберите до пяти платных образцов из каталога. Стоимость и доставку согласуем до отправки.",
    "related": [
      "ot-obraztsa-k-partii-puera",
      "povtornaya-zakupka-shu-puera"
    ]
  },
  "ot-obraztsa-k-partii-puera": {
    "category": "Согласование поставки",
    "label": "Обсудить выбранную партию",
    "href": "/contact/#inquiry-form",
    "description": "Пришлите название выбранного чая и нужное количество. Партию и условия заказа подтвердим отдельно.",
    "related": [
      "stoimost-partii-puera",
      "povtornaya-zakupka-shu-puera"
    ]
  },
  "shu-i-shen-puer-raznica": {
    "category": "Выбор чая",
    "label": "Сравнить чай в каталоге",
    "href": "/catalog/",
    "description": "Сравните шу и шэн по форме, году и описанию. Вкус выбранного чая можно оценить на платном образце.",
    "related": [
      "kak-sravnit-obraztsy-shu-puera",
      "proizvodstvo-puera-ot-lista-do-blina"
    ]
  },
  "kak-vybrat-postavshika-puera-v-kitae": {
    "category": "Первая закупка",
    "label": "Выбрать платные образцы",
    "href": "/sample/",
    "description": "Для первого сравнения можно выбрать платные образцы. Состав набора и доставку согласуем до отправки.",
    "related": [
      "kak-sravnit-obraztsy-shu-puera",
      "stoimost-partii-puera"
    ]
  },
  "privatnaya-marka-puera-rukovodstvo": {
    "category": "Свой бренд",
    "label": "Обсудить свой бренд",
    "href": "/contact/?topic=private-label#inquiry-form",
    "description": "Для обсуждения упаковки пригодятся фото выбранного чая и макет, если он уже есть.",
    "related": [
      "maket-upakovki-puera-pered-pechatyu",
      "dannye-dlya-kartochki-puera"
    ]
  },
  "proizvodstvo-puera-ot-lista-do-blina": {
    "category": "О чае",
    "label": "Посмотреть пуэр",
    "href": "/catalog/",
    "description": "Посмотрите фабричные выпуски в каталоге. Свою упаковку можно обсудить для уже выбранного чая.",
    "related": [
      "shu-i-shen-puer-raznica",
      "privatnaya-marka-puera-rukovodstvo"
    ]
  },
  "khranenie-puera-usloviya-vyderzhki": {
    "category": "После закупки",
    "label": "Обсудить условия заказа",
    "href": "/contact/#inquiry-form",
    "description": "Если выбираете чай для своего запаса, расскажите о планируемом объёме и условиях хранения.",
    "related": [
      "povtornaya-zakupka-shu-puera",
      "rassypnoy-puer-zayavka-postavshchiku"
    ]
  }
};
