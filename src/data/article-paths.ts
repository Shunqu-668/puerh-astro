// Editorial reading paths. Every new post needs two relevant published neighbours.
export interface ArticlePath {
  category: string;
  label: string;
  href: string;
  description: string;
  related: [string, string];
}

export const articlePaths: Record<string, ArticlePath> = {
  "rezerv-puera-dlya-neskolkih-postavok": {"category": "План закупок", "label": "Обсудить резерв и график поставок", "href": "/contact/?topic=repeat-order#inquiry-form", "description": "Укажите чай, общий объём и график: сколько и когда нужно отгрузить. Проверим доступный вариант и обсудим возможность резерва, его срок и условия расчёта.", "related": ["povtornaya-zakupka-shu-puera", "zakaz-puera-neskolko-pozitsiy"]},
  "proverka-pressovki-puera-na-obrazce": {"category": "Проверка образцов", "label": "Подобрать чай и платные образцы", "href": "/contact/?topic=tea-selection#inquiry-form", "description": "Укажите форму чая, способ использования и предполагаемый объём. Уточним подходящие варианты, вид платного образца и условия дальнейшего расчёта партии.", "related": ["kak-sravnit-obraztsy-shu-puera", "ot-obraztsa-k-partii-puera"]},
  "zakaz-puera-neskolko-pozitsiy": {"category": "Состав заказа", "label": "Проверить список чая", "href": "/contact/?topic=mixed-order#inquiry-form", "description": "Пришлите список с количеством по каждой позиции. Мы отметим, какие выпуски доступны и что нужно уточнить перед сборкой.", "related": ["ot-obraztsa-k-partii-puera", "stoimost-partii-puera"]},
  "foto-puera-dlya-prodazhi": {"category": "Материалы для продажи", "label": "Запросить фото для карточки чая", "href": "/contact/?topic=product-materials#inquiry-form", "description": "Укажите чай, упаковку и недостающий ракурс. Уточним, какие снимки доступны для публикации.", "related": ["dannye-dlya-kartochki-puera", "maket-upakovki-puera-pered-pechatyu"]},
  "podbor-puera-po-foto-upakovki": {"category": "Подбор чая", "label": "Обсудить поиск пуэра", "href": "/contact/?topic=tea-selection#inquiry-form", "description": "Начните с названия или ссылки на знакомый чай. Укажите, нужен ли тот же выпуск и какие отличия допустимы.", "related": ["povtornaya-zakupka-shu-puera", "rassypnoy-puer-zayavka-postavshchiku"]},
  "puer-lunchzhu-ves-upakovka": {"category": "Первая закупка", "label": "Уточнить чай и фасовку", "href": "/contact/?topic=tea-selection#inquiry-form", "description": "Укажите шу или шэн, массу шарика, общий объём и нужную упаковку. Уточним чай и условия по вашему запросу.", "related": ["dannye-dlya-kartochki-puera", "kak-sravnit-obraztsy-shu-puera"]},
  "rassypnoy-puer-zayavka-postavshchiku": {
    "category": "Закупка рассыпного чая",
    "label": "Запросить подбор и цену за кг",
    "href": "/contact/?topic=loose-puerh#inquiry-form",
    "description": "Укажите шу или шэн, примерный объём и фасовку. Уточним подходящие варианты, условия платного образца и расчёт за килограмм.",
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
    "label": "Проверить прежний выпуск шу",
    "href": "/contact/?topic=repeat-order#inquiry-form",
    "description": "Укажите прежний выпуск, нужное количество и дату пополнения. Проверим его доступность и отдельно обсудим образец, если потребуется замена.",
    "related": [
      "kak-sravnit-obraztsy-shu-puera",
      "khranenie-puera-usloviya-vyderzhki"
    ]
  },
  "stoimost-partii-puera": {
    "category": "Расчёт закупки",
    "label": "Рассчитать мою партию",
    "href": "/contact/?topic=batch-quote#inquiry-form",
    "description": "Укажите чай, количество и место передачи. Подготовим сопоставимый расчёт и отметим расходы, которые пока не подтверждены.",
    "related": [
      "rassypnoy-puer-zayavka-postavshchiku",
      "ot-obraztsa-k-partii-puera"
    ]
  },
  "dannye-dlya-kartochki-puera": {
    "category": "Для продавцов",
    "label": "Запросить данные для карточки",
    "href": "/contact/?topic=product-materials#inquiry-form",
    "description": "Укажите чай, площадку и продаваемую единицу. Уточним, какие сведения и снимки этого выпуска можно предоставить для размещения.",
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
    "label": "Уточнить партию по образцу",
    "href": "/contact/?topic=batch-quote#inquiry-form",
    "description": "Укажите маркировку образца и нужное количество. Уточним, доступна ли та же партия, и обсудим расчёт для выбранной упаковки.",
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
    "label": "Запросить образец для проверки",
    "href": "/sample/",
    "description": "Выберите знакомую позицию из каталога. Уточним, какую пробу можно подготовить, сколько она стоит и во что обойдётся пересылка.",
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
    "label": "Подобрать форму пуэра",
    "href": "/contact/?topic=tea-selection#inquiry-form",
    "description": "Расскажите, как будете продавать чай: на развес, целым блином или порциями. Подберём форму для сравнения и уточним условия пробы.",
    "related": [
      "shu-i-shen-puer-raznica",
      "privatnaya-marka-puera-rukovodstvo"
    ]
  },
  "khranenie-puera-usloviya-vyderzhki": {
    "category": "После закупки",
    "label": "Уточнить выпуск перед пополнением",
    "href": "/contact/?topic=repeat-order#inquiry-form",
    "description": "Назовите чай с прошлой поставки и нужное количество. Уточним, какой выпуск доступен сейчас и что известно о его хранении.",
    "related": [
      "povtornaya-zakupka-shu-puera",
      "rassypnoy-puer-zayavka-postavshchiku"
    ]
  }
};
