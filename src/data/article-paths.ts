// Editorial reading paths. Every new post needs two relevant published neighbours.
export interface ArticlePath {
  category: string;
  label: string;
  href: string;
  description: string;
  related: [string, string];
}

export const articlePaths: Record<string, ArticlePath> = {
  "pervyy-shu-puer-dlya-chaynogo-magazina": {"category": "Первый шу в ассортименте", "label": "Подобрать шу пуэр для пробы", "href": "/contact/?topic=tea-selection#inquiry-form", "description": "Расскажите, какие чаи уже продаёте и для чего хотите добавить шу. Проверим подходящий вариант, стоимость платного образца и цену на пробное количество.", "related": ["kak-sravnit-obraztsy-shu-puera", "rassypnoy-puer-zayavka-postavshchiku"]},
  "kak-vybrat-obraztsy-kitayskogo-chaya": {"category": "Выбор платных образцов", "label": "Узнать стоимость образцов", "href": "/contact/?topic=other-tea#inquiry-form", "description": "Пришлите название или фото чая, напишите, что хотите проверить, и укажите город. Уточним, какие образцы можно подготовить, их вес, стоимость и пересылку.", "related": ["kak-sravnit-obraztsy-shu-puera", "ot-obraztsa-k-partii-puera"]},
  "kitayskiy-chay-dlya-magazina": {"category": "Подбор и оптовая цена", "label": "Написать, какой чай нужен", "href": "https://vk.ru/im/convo/-242419151", "description": "Пришлите название или фото упаковки. Уточним подходящие варианты, доступное количество и цену. Стоимость образца и пересылки согласуем до отправки.", "related": ["probnyy-zakaz-chernogo-i-zelenogo-chaya", "podbor-puera-po-foto-upakovki"]},
  "chay-so-sklada-v-rossii-ili-iz-kitaya": {"category": "Срок и место получения", "label": "Уточнить передачу и срок", "href": "/contact/?topic=delivery-plan#inquiry-form", "description": "Укажите чай, количество, нужную дату и место получения. Проверим, какую часть подготовки и передачи можно подтвердить, и что ещё нужно согласовать с перевозчиком.", "related": ["stoimost-partii-puera", "rezerv-puera-dlya-neskolkih-postavok"]},
  "chay-na-razves-ili-v-pachkah": {"category": "Количество для первой продажи", "label": "Посчитать чай и фасовку", "href": "/contact/?topic=marketplace-tea#inquiry-form", "description": "Напишите название чая, вес одной пачки и сколько пачек планируете продать. Рассчитаем чай на этот объём и отдельно уточним, какую фасовку можно предложить.", "related": ["stoimost-partii-puera", "zakaz-puera-neskolko-pozitsiy"]},
  "probnyy-zakaz-chernogo-i-zelenogo-chaya": {"category": "Первая закупка", "label": "Запросить цену на чай", "href": "/contact/?topic=other-tea#inquiry-form", "description": "Напишите, какой чай хотите взять на пробу и сколько примерно нужно: килограммы или число пачек с их весом. Проверим варианты и посчитаем цену на ваше количество.", "related": ["zakaz-puera-neskolko-pozitsiy", "ot-obraztsa-k-partii-puera"]},
  "rezerv-puera-dlya-neskolkih-postavok": {"category": "План закупок", "label": "Обсудить резерв и график поставок", "href": "/contact/?topic=repeat-order#inquiry-form", "description": "Укажите чай и сколько нужно к каждой дате. Проверим, какое количество поставщик может отложить, на какой срок и на каких условиях.", "related": ["povtornaya-zakupka-shu-puera", "zakaz-puera-neskolko-pozitsiy"]},
  "proverka-pressovki-puera-na-obrazce": {"category": "Проверка образцов", "label": "Подобрать чай и платные образцы", "href": "/contact/?topic=tea-selection#inquiry-form", "description": "Скажите, какой вес вы обычно отламываете от блина или кирпича. Уточним, какой платный образец можно подготовить, чтобы вы проверили чай привычным способом.", "related": ["kak-sravnit-obraztsy-shu-puera", "ot-obraztsa-k-partii-puera"]},
  "zakaz-puera-neskolko-pozitsiy": {"category": "Состав заказа", "label": "Проверить список чая", "href": "/contact/?topic=mixed-order#inquiry-form", "description": "Пришлите список с количеством по каждой позиции. Мы отметим, какие выпуски доступны и что нужно уточнить перед сборкой.", "related": ["ot-obraztsa-k-partii-puera", "stoimost-partii-puera"]},
  "foto-puera-dlya-prodazhi": {"category": "Материалы для продажи", "label": "Запросить фото для карточки чая", "href": "/contact/?topic=product-materials#inquiry-form", "description": "Укажите чай, упаковку и недостающий ракурс. Уточним, какие снимки доступны для публикации.", "related": ["dannye-dlya-kartochki-puera", "maket-upakovki-puera-pered-pechatyu"]},
  "podbor-puera-po-foto-upakovki": {"category": "Подбор чая", "label": "Обсудить поиск пуэра", "href": "/contact/?topic=tea-selection#inquiry-form", "description": "Начните с названия или ссылки на знакомый чай. Укажите, нужен ли тот же выпуск и какие отличия допустимы.", "related": ["povtornaya-zakupka-shu-puera", "rassypnoy-puer-zayavka-postavshchiku"]},
  "puer-lunchzhu-ves-upakovka": {"category": "Первая закупка", "label": "Уточнить чай и фасовку", "href": "/contact/?topic=tea-selection#inquiry-form", "description": "Напишите, какой чай хотите и как собираетесь его продавать: поштучно или целыми пачками. Перед расчётом уточним вес шарика и фасовку.", "related": ["dannye-dlya-kartochki-puera", "kak-sravnit-obraztsy-shu-puera"]},
  "rassypnoy-puer-zayavka-postavshchiku": {
    "category": "Закупка рассыпного чая",
    "label": "Запросить подбор и цену за кг",
    "href": "/contact/?topic=loose-puerh#inquiry-form",
    "description": "Укажите шу или шэн, примерный объём и фасовку. Предложим подходящие чаи, уточним цену за килограмм и стоимость образца.",
    "related": [
      "stoimost-partii-puera",
      "povtornaya-zakupka-shu-puera"
    ]
  },
  "maket-upakovki-puera-pered-pechatyu": {
    "category": "Упаковка",
    "label": "Обсудить макет и упаковку",
    "href": "/contact/?topic=private-label#inquiry-form",
    "description": "Укажите название выбранного чая и версию макета, которую собираетесь печатать. Обсудим, что нужно проверить до печати.",
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
    "label": "Запросить расчёт партии",
    "href": "/contact/?topic=batch-quote#inquiry-form",
    "description": "Укажите чай, количество и место передачи. Посчитаем стоимость на этот объём и отдельно укажем расходы, которые ещё нужно уточнить.",
    "related": [
      "rassypnoy-puer-zayavka-postavshchiku",
      "ot-obraztsa-k-partii-puera"
    ]
  },
  "dannye-dlya-kartochki-puera": {
    "category": "Для продавцов",
    "label": "Запросить данные для карточки",
    "href": "/contact/?topic=product-materials#inquiry-form",
    "description": "Укажите чай и площадку. Уточните, что вы продаёте по указанной цене: штуку, пачку или набор. Уточним, какие сведения и снимки этого выпуска можно предоставить для размещения.",
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
    "label": "Узнать, остался ли чай из той же партии",
    "href": "/contact/?topic=batch-quote#inquiry-form",
    "description": "Напишите, что указано на пакетике с образцом и сколько чая вам нужно. Проверим остаток и уточним цену с выбранной упаковкой.",
    "related": [
      "stoimost-partii-puera",
      "povtornaya-zakupka-shu-puera"
    ]
  },
  "shu-i-shen-puer-raznica": {
    "category": "Выбор чая",
    "label": "Сравнить чай в каталоге",
    "href": "/catalog/",
    "description": "Сравните шу и шэн по форме, году и описанию. Чтобы попробовать выбранный чай, можно запросить платный образец.",
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
