import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isAfter, isBefore, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import Icon from "@/components/ui/icon";

interface Tournament {
  id: number;
  title: string;
  date: string;
  dateStart: string;
  place: string;
  type: "Спиннинг" | "Поплавок" | "Нахлыст" | "Фидер";
  region: string;
  subregion: string;
  fee: number;
  slots: number;
  registered: number;
  description: string;
  rules: string[];
  prizes: string[];
  organizer: string;
}

const REGION_COLORS: Record<string, string> = {
  ЦФО: "#E57373",
  СЗФО: "#64B5F6",
  ЮФО: "#FFB74D",
  СКФО: "#81C784",
  ПФО: "#BA68C8",
  УФО: "#4DB6AC",
  СФО: "#F06292",
  ДФО: "#4DD0E1",
};

const TYPE_ICONS: Record<string, string> = {
  Спиннинг: "Zap",
  Поплавок: "Circle",
  Нахлыст: "Wind",
  Фидер: "Anchor",
};

const REGIONS_MAP: Record<string, string[]> = {
  ЦФО: [
    "Московская обл.",
    "Тверская обл.",
    "Ярославская обл.",
    "Владимирская обл.",
    "Тульская обл.",
    "Рязанская обл.",
    "Калужская обл.",
    "Смоленская обл.",
  ],
  СЗФО: [
    "Ленинградская обл.",
    "Карелия",
    "Архангельская обл.",
    "Мурманская обл.",
    "Вологодская обл.",
    "Новгородская обл.",
    "Псковская обл.",
    "Калининградская обл.",
  ],
  ЮФО: [
    "Ростовская обл.",
    "Краснодарский край",
    "Волгоградская обл.",
    "Астраханская обл.",
    "Адыгея",
    "Крым",
  ],
  СКФО: [
    "Ставропольский край",
    "Дагестан",
    "Кабардино-Балкария",
    "Чечня",
    "Северная Осетия",
    "Ингушетия",
    "Карачаево-Черкесия",
  ],
  ПФО: [
    "Нижегородская обл.",
    "Самарская обл.",
    "Татарстан",
    "Башкортостан",
    "Пермский край",
    "Саратовская обл.",
    "Ульяновская обл.",
    "Чувашия",
  ],
  УФО: [
    "Свердловская обл.",
    "Челябинская обл.",
    "Тюменская обл.",
    "Курганская обл.",
    "ХМАО",
    "ЯНАО",
  ],
  СФО: [
    "Новосибирская обл.",
    "Иркутская обл.",
    "Красноярский край",
    "Алтайский край",
    "Кемеровская обл.",
    "Омская обл.",
    "Томская обл.",
    "Республика Алтай",
  ],
  ДФО: [
    "Приморский край",
    "Хабаровский край",
    "Сахалинская обл.",
    "Камчатский край",
    "Амурская обл.",
    "Якутия",
    "Магаданская обл.",
    "Забайкальский край",
  ],
};

const TOURNAMENTS: Tournament[] = [
  {
    id: 1,
    title: "Кубок Волги 2026",
    date: "12-14 апр 2026",
    dateStart: "2026-04-12",
    place: "Нижний Новгород",
    type: "Спиннинг",
    region: "ПФО",
    subregion: "Нижегородская обл.",
    fee: 2500,
    slots: 120,
    registered: 87,
    description:
      "Открытые соревнования по спиннинговой ловле на реке Волга в черте г. Нижний Новгород. Разрешена ловля с берега и лодки. Зачёт по сумме 5 наибольших рыб.",
    rules: [
      "Ловля с 06:00 до 14:00 без перерыва",
      "Разрешённые снасти: спиннинг, джиг, воблеры",
      "Минимальный размер рыбы: судак — 40 см, щука — 45 см",
      "Обязательна именная маркировка приманок",
      "Запрещены живые наживки и снасти с более чем 3 крючками",
    ],
    prizes: [
      "1 место — 30 000 ₽ + кубок",
      "2 место — 15 000 ₽",
      "3 место — 7 000 ₽",
    ],
    organizer: "Федерация рыболовного спорта ПФО",
  },
  {
    id: 2,
    title: "Чемпионат ЦФО по поплавку",
    date: "20 апр 2026",
    dateStart: "2026-04-20",
    place: "Рыбинское водохранилище",
    type: "Поплавок",
    region: "ЦФО",
    subregion: "Ярославская обл.",
    fee: 1800,
    slots: 80,
    registered: 34,
    description:
      "Официальный чемпионат Центрального федерального округа по поплавочной ловле. Ловля с берега в отведённых секторах.",
    rules: [
      "Сектора распределяются жеребьёвкой за 1 час до старта",
      "Длина удилища не более 13 м",
      "Запрещены прикормки с животными компонентами",
      "Ловля строго в границах сектора (3 метра)",
      "Рыба взвешивается живой и возвращается в водоём",
    ],
    prizes: [
      "1 место — 20 000 ₽ + медаль",
      "2 место — 10 000 ₽",
      "3 место — 5 000 ₽",
    ],
    organizer: "Рыболовный союз ЦФО",
  },
  {
    id: 3,
    title: "Северная рыбалка",
    date: "3-5 мая 2026",
    dateStart: "2026-05-03",
    place: "Ладожское озеро",
    type: "Нахлыст",
    region: "СЗФО",
    subregion: "Карелия",
    fee: 3500,
    slots: 40,
    registered: 22,
    description:
      "Престижный турнир по нахлыстовой ловле на Ладожском озере. Три дня соревнований в живописных условиях Карелии.",
    rules: [
      "Ловля только нахлыстом, мушки — исключительно безбородочные",
      "Принцип «поймал — отпусти» обязателен",
      "Зачёт по длине рыб (фото с мерной лентой)",
      "Каждый участник — отдельная лодка (предоставляется)",
      "Обязателен спасательный жилет",
    ],
    prizes: [
      "1 место — 50 000 ₽ + трофей",
      "2 место — 25 000 ₽",
      "3 место — 12 000 ₽",
    ],
    organizer: "Карельский клуб нахлыстовиков",
  },
  {
    id: 4,
    title: "Байкал Опен 2026",
    date: "17 мая 2026",
    dateStart: "2026-05-17",
    place: "оз. Байкал, Листвянка",
    type: "Спиннинг",
    region: "СФО",
    subregion: "Иркутская обл.",
    fee: 4000,
    slots: 60,
    registered: 48,
    description:
      "Международный открытый турнир на Байкале. Ловля омуля и хариуса спиннингом. Участники из 12 регионов России.",
    rules: [
      "Старт с берега, лодочная ловля запрещена",
      "Максимум 2 удилища на участника",
      "Зачётная рыба: омуль от 25 см, хариус от 20 см",
      "Обязательна регистрация улова в мобильном приложении",
      "Запрещены снасти с отводными поводками длиннее 50 см",
    ],
    prizes: [
      "1 место — 70 000 ₽ + кубок Байкала",
      "2 место — 35 000 ₽",
      "3 место — 15 000 ₽",
    ],
    organizer: "Байкальская лига рыболовного спорта",
  },
  {
    id: 5,
    title: "Кубок Дона",
    date: "24 мая 2026",
    dateStart: "2026-05-24",
    place: "Ростов-на-Дону",
    type: "Фидер",
    region: "ЮФО",
    subregion: "Ростовская обл.",
    fee: 2000,
    slots: 100,
    registered: 61,
    description:
      "Традиционный кубок по фидерной ловле на реке Дон. Командные и личные зачёты. Ловля леща, карася и плотвы.",
    rules: [
      "Сессия 4 часа, старт по сигналу",
      "Максимум 1 фидерное удилище + 1 страховочное",
      "Запрещены пружинные кормушки и метод",
      "Прикормка — не более 3 кг в сухом виде",
      "Рыба взвешивается после финиша, затем отпускается",
    ],
    prizes: [
      "1 место — 25 000 ₽",
      "2 место — 12 000 ₽",
      "3 место — 6 000 ₽",
    ],
    organizer: "Донской рыболовный клуб",
  },
  {
    id: 6,
    title: "Уральский трофей",
    date: "7-8 июн 2026",
    dateStart: "2026-06-07",
    place: "Верх-Исетский пруд",
    type: "Поплавок",
    region: "УФО",
    subregion: "Свердловская обл.",
    fee: 1500,
    slots: 50,
    registered: 19,
    description:
      "Двухдневный турнир по поплавочной ловле на водоёмах Свердловской области. Вся рыба возвращается в водоём.",
    rules: [
      "Два тура по 4 часа (суббота и воскресенье)",
      "Ловля только с берега в отведённом секторе",
      "Запрещены все виды прикормок промышленного производства",
      "Разрешены только натуральные наживки: червь, опарыш",
      "Зачёт по суммарному весу двух туров",
    ],
    prizes: [
      "1 место — 18 000 ₽ + трофей",
      "2 место — 9 000 ₽",
      "3 место — 4 500 ₽",
    ],
    organizer: "Уральская федерация рыболовства",
  },
  {
    id: 7,
    title: "Кавказский кубок",
    date: "14 июн 2026",
    dateStart: "2026-06-14",
    place: "Минеральные Воды",
    type: "Нахлыст",
    region: "СКФО",
    subregion: "Ставропольский край",
    fee: 2200,
    slots: 30,
    registered: 14,
    description:
      "Кубок Северного Кавказа по нахлыстовой ловле форели в горных реках Ставрополья. Уникальные условия горной рыбалки.",
    rules: [
      "Ловля только нахлыстом на горных участках реки",
      "Безбородочные крючки обязательны",
      "Зачёт по количеству и размеру пойманных форелей",
      "Передвижение по реке только пешком",
      "Запрещены снасти тяжелее 6 класса",
    ],
    prizes: [
      "1 место — 22 000 ₽ + кубок",
      "2 место — 11 000 ₽",
      "3 место — 5 500 ₽",
    ],
    organizer: "Федерация рыболовства СКФО",
  },
  {
    id: 8,
    title: "Приморский спиннинг",
    date: "21-22 июн 2026",
    dateStart: "2026-06-21",
    place: "Владивосток, бухта Золотой Рог",
    type: "Спиннинг",
    region: "ДФО",
    subregion: "Приморский край",
    fee: 3000,
    slots: 45,
    registered: 28,
    description:
      "Морской спиннинговый турнир во Владивостоке. Ловля морского окуня, трески и камбалы с берега и пирсов.",
    rules: [
      "Ловля с береговых сооружений и скал",
      "Зачётные виды: терпуг, камбала, морской окунь",
      "Максимум 2 удилища одновременно",
      "Запрещены сети, ловушки и донные снасти",
      "Фотофиксация каждого улова обязательна",
    ],
    prizes: [
      "1 место — 40 000 ₽ + кубок",
      "2 место — 20 000 ₽",
      "3 место — 10 000 ₽",
    ],
    organizer: "Дальневосточный рыболовный союз",
  },
  {
    id: 9,
    title: "Московский фидер-фест",
    date: "28 июн 2026",
    dateStart: "2026-06-28",
    place: "Истринское водохранилище",
    type: "Фидер",
    region: "ЦФО",
    subregion: "Московская обл.",
    fee: 2000,
    slots: 150,
    registered: 112,
    description:
      "Крупнейший фидерный фестиваль Подмосковья на Истринском водохранилище. Открыт для рыболовов любого уровня.",
    rules: [
      "Сессия 5 часов с одним перерывом 30 мин",
      "Разрешена любая фидерная оснастка",
      "Прикормка — не более 5 кг в сухом виде",
      "Зачёт по суммарному весу улова",
      "Обязателен садок не менее 3 м длиной",
    ],
    prizes: [
      "1 место — 35 000 ₽ + кубок",
      "2 место — 18 000 ₽",
      "3 место — 9 000 ₽",
    ],
    organizer: "Московский клуб фидеристов",
  },
  {
    id: 10,
    title: "Тюменский хищник",
    date: "5 июл 2026",
    dateStart: "2026-07-05",
    place: "оз. Андреевское",
    type: "Спиннинг",
    region: "УФО",
    subregion: "Тюменская обл.",
    fee: 1800,
    slots: 70,
    registered: 33,
    description:
      "Соревнования по ловле хищной рыбы спиннингом на озёрах Тюменской области. Зачётные виды: щука, окунь, судак.",
    rules: [
      "Ловля с лодок (предоставляются организатором)",
      "Максимум 1 удилище на участника",
      "Минимальный размер щуки — 40 см",
      "Улов взвешивается на контрольных весах",
      "Штраф за нарушение границ зоны ловли",
    ],
    prizes: [
      "1 место — 20 000 ₽",
      "2 место — 10 000 ₽",
      "3 место — 5 000 ₽",
    ],
    organizer: "Рыболовы Тюмени",
  },
  {
    id: 11,
    title: "Кубок Невы",
    date: "12 июл 2026",
    dateStart: "2026-07-12",
    place: "Санкт-Петербург, набережная",
    type: "Поплавок",
    region: "СЗФО",
    subregion: "Ленинградская обл.",
    fee: 1500,
    slots: 60,
    registered: 41,
    description:
      "Городские соревнования по поплавочной ловле в черте Санкт-Петербурга. Уникальная атмосфера рыбалки у стен Петропавловской крепости.",
    rules: [
      "Ловля с гранитных набережных",
      "Удилище не длиннее 7 м",
      "Прикормка разрешена в ограниченном объёме",
      "Зачёт по количеству рыб",
      "Запрещена ловля на живца",
    ],
    prizes: [
      "1 место — 15 000 ₽ + медаль",
      "2 место — 8 000 ₽",
      "3 место — 4 000 ₽",
    ],
    organizer: "Петербургское общество рыболовов",
  },
  {
    id: 12,
    title: "Казанский марафон",
    date: "19-20 июл 2026",
    dateStart: "2026-07-19",
    place: "Казань, Волга",
    type: "Фидер",
    region: "ПФО",
    subregion: "Татарстан",
    fee: 2200,
    slots: 90,
    registered: 56,
    description:
      "Двухдневный фидерный марафон на Волге в районе Казани. Состязания командного и личного зачёта.",
    rules: [
      "Два тура по 5 часов",
      "Командный зачёт: 3 человека от команды",
      "Разрешена любая фидерная оснастка",
      "Максимум 2 удилища одновременно",
      "Живая наживка и прикормка без ограничений по составу",
    ],
    prizes: [
      "1 место (команда) — 60 000 ₽",
      "1 место (личный) — 25 000 ₽",
      "2 место — 15 000 ₽",
    ],
    organizer: "Рыболовная ассоциация Татарстана",
  },
  {
    id: 13,
    title: "Алтай Трофи",
    date: "26 июл 2026",
    dateStart: "2026-07-26",
    place: "Телецкое озеро",
    type: "Нахлыст",
    region: "СФО",
    subregion: "Республика Алтай",
    fee: 5000,
    slots: 25,
    registered: 18,
    description:
      "Элитный нахлыстовый турнир на Телецком озере. Ловля хариуса и ленка в кристально чистых водах Алтая.",
    rules: [
      "Исключительно нахлыстовая ловля",
      "Мушки только сухие и нимфы, стримеры запрещены",
      "Принцип «поймал — отпусти»",
      "Зачёт по суммарной длине пойманных рыб",
      "Обязательно сопровождение егеря",
    ],
    prizes: [
      "1 место — 60 000 ₽ + трофей из кедра",
      "2 место — 30 000 ₽",
      "3 место — 15 000 ₽",
    ],
    organizer: "Алтайский клуб нахлыстовой ловли",
  },
  {
    id: 14,
    title: "Астраханский жор",
    date: "2-3 авг 2026",
    dateStart: "2026-08-02",
    place: "Астрахань, дельта Волги",
    type: "Спиннинг",
    region: "ЮФО",
    subregion: "Астраханская обл.",
    fee: 3500,
    slots: 80,
    registered: 72,
    description:
      "Легендарный турнир в дельте Волги. Ловля сома, судака и жереха в протоках и ериках Астраханской области.",
    rules: [
      "Ловля с лодок в обозначенной зоне",
      "Зачётные виды: сом, судак, жерех, сазан",
      "Минимальный вес зачётного сома — 5 кг",
      "Максимум 3 удилища на лодку",
      "GPS-трекер обязателен",
    ],
    prizes: [
      "1 место — 80 000 ₽ + кубок",
      "2 место — 40 000 ₽",
      "3 место — 20 000 ₽",
    ],
    organizer: "Астраханский рыболовный клуб «Дельта»",
  },
  {
    id: 15,
    title: "Камчатка Дикая",
    date: "9 авг 2026",
    dateStart: "2026-08-09",
    place: "р. Камчатка",
    type: "Нахлыст",
    region: "ДФО",
    subregion: "Камчатский край",
    fee: 8000,
    slots: 20,
    registered: 16,
    description:
      "Экстремальный нахлыстовый турнир на Камчатке. Ловля чавычи и кижуча в дикой природе полуострова.",
    rules: [
      "Только нахлыст класса 8-10",
      "Принцип «поймал — отпусти» строго обязателен",
      "Вертолётная заброска к месту ловли",
      "Обязательна медицинская страховка",
      "Перцовый спрей от медведей обязателен",
    ],
    prizes: [
      "1 место — 100 000 ₽ + трофей",
      "2 место — 50 000 ₽",
      "3 место — 25 000 ₽",
    ],
    organizer: "Камчатский клуб экстремальной рыбалки",
  },
  {
    id: 16,
    title: "Кубок Кубани",
    date: "16 авг 2026",
    dateStart: "2026-08-16",
    place: "Краснодар, р. Кубань",
    type: "Фидер",
    region: "ЮФО",
    subregion: "Краснодарский край",
    fee: 1800,
    slots: 110,
    registered: 89,
    description:
      "Массовый фидерный кубок на реке Кубань. Ловля карпа, сазана и толстолобика. Более 100 участников ежегодно.",
    rules: [
      "Сессия 5 часов без перерыва",
      "Максимум 2 фидерных удилища",
      "Прикормка без ограничений",
      "Зачёт по суммарному весу",
      "Обязателен подсак с мягкой сеткой",
    ],
    prizes: [
      "1 место — 30 000 ₽",
      "2 место — 15 000 ₽",
      "3 место — 7 500 ₽",
    ],
    organizer: "Кубанская рыболовная лига",
  },
  {
    id: 17,
    title: "Дагестанский кастинг",
    date: "23 авг 2026",
    dateStart: "2026-08-23",
    place: "Махачкала, Каспий",
    type: "Спиннинг",
    region: "СКФО",
    subregion: "Дагестан",
    fee: 2000,
    slots: 40,
    registered: 25,
    description:
      "Морской спиннинговый турнир на Каспийском море. Ловля кутума, воблы и каспийского лосося.",
    rules: [
      "Ловля с берега и причалов",
      "Зачётные виды: кутум, вобла, каспийский лосось",
      "Максимум 2 удилища",
      "Приманки только искусственные",
      "Фотофиксация обязательна",
    ],
    prizes: [
      "1 место — 25 000 ₽ + кубок",
      "2 место — 12 000 ₽",
      "3 место — 6 000 ₽",
    ],
    organizer: "Дагестанское рыболовное общество",
  },
  {
    id: 18,
    title: "Тверской поплавок",
    date: "30 авг 2026",
    dateStart: "2026-08-30",
    place: "Селигер",
    type: "Поплавок",
    region: "ЦФО",
    subregion: "Тверская обл.",
    fee: 1200,
    slots: 65,
    registered: 29,
    description:
      "Семейный турнир по поплавочной ловле на озере Селигер. Отдельные зачёты для взрослых и детей.",
    rules: [
      "Ловля с берега и мостков",
      "Удилище до 5 м для детского зачёта",
      "Прикормка только растительная",
      "Зачёт по количеству пойманных рыб",
      "Дети до 14 лет — бесплатное участие",
    ],
    prizes: [
      "1 место (взрослые) — 12 000 ₽",
      "1 место (дети) — подарочный набор",
      "2-3 место — призы от спонсоров",
    ],
    organizer: "Тверской рыболовный клуб «Селигер»",
  },
  {
    id: 19,
    title: "Хабаровский лосось",
    date: "6-7 сен 2026",
    dateStart: "2026-09-06",
    place: "Хабаровск, р. Амур",
    type: "Спиннинг",
    region: "ДФО",
    subregion: "Хабаровский край",
    fee: 3500,
    slots: 35,
    registered: 20,
    description:
      "Турнир по ловле тихоокеанского лосося на реке Амур. Кета и горбуша в период нерестового хода.",
    rules: [
      "Ловля только спиннингом с берега",
      "Зачётные виды: кета, горбуша, голец",
      "Минимальный размер зачётной рыбы — 35 см",
      "Принцип «поймал — отпусти» для самок с икрой",
      "Обязателен вейдерс или болотные сапоги",
    ],
    prizes: [
      "1 место — 45 000 ₽ + кубок",
      "2 место — 22 000 ₽",
      "3 место — 11 000 ₽",
    ],
    organizer: "Амурский рыболовный союз",
  },
  {
    id: 20,
    title: "Самарская осень",
    date: "13 сен 2026",
    dateStart: "2026-09-13",
    place: "Самара, Жигулёвское море",
    type: "Фидер",
    region: "ПФО",
    subregion: "Самарская обл.",
    fee: 1600,
    slots: 85,
    registered: 44,
    description:
      "Осенний фидерный фестиваль на Жигулёвском водохранилище. Ловля леща, густеры и плотвы в красочный период листопада.",
    rules: [
      "Сессия 4 часа",
      "Максимум 1 фидер + 1 пикер",
      "Прикормка до 4 кг сухой смеси",
      "Зачёт по суммарному весу",
      "Обязателен садок длиной не менее 2.5 м",
    ],
    prizes: [
      "1 место — 18 000 ₽",
      "2 место — 9 000 ₽",
      "3 место — 4 500 ₽",
    ],
    organizer: "Самарская федерация рыболовного спорта",
  },
  {
    id: 21,
    title: "Новосибирский хищник",
    date: "20 сен 2026",
    dateStart: "2026-09-20",
    place: "Обское водохранилище",
    type: "Спиннинг",
    region: "СФО",
    subregion: "Новосибирская обл.",
    fee: 2500,
    slots: 75,
    registered: 51,
    description:
      "Крупные спиннинговые соревнования на Обском водохранилище. Ловля щуки, окуня и судака с лодок.",
    rules: [
      "Ловля с моторных лодок (предоставляются)",
      "Максимум 2 удилища на экипаж",
      "Зачёт по 5 наибольшим рыбам",
      "GPS-контроль маршрута",
      "Запрещены эхолоты с боковым сканированием",
    ],
    prizes: [
      "1 место — 50 000 ₽ + кубок",
      "2 место — 25 000 ₽",
      "3 место — 12 500 ₽",
    ],
    organizer: "Новосибирский клуб спиннингистов",
  },
  {
    id: 22,
    title: "Калининградский балтик",
    date: "27 сен 2026",
    dateStart: "2026-09-27",
    place: "Куршская коса",
    type: "Поплавок",
    region: "СЗФО",
    subregion: "Калининградская обл.",
    fee: 2000,
    slots: 50,
    registered: 37,
    description:
      "Турнир по поплавочной ловле на Куршском заливе. Уникальная атмосфера Балтики и богатый видовой состав рыб.",
    rules: [
      "Ловля с берега Куршского залива",
      "Зачётные виды: лещ, плотва, окунь, судак",
      "Удилище не длиннее 11 м",
      "Прикормка разрешена",
      "Зачёт по суммарному весу за 4 часа",
    ],
    prizes: [
      "1 место — 20 000 ₽",
      "2 место — 10 000 ₽",
      "3 место — 5 000 ₽",
    ],
    organizer: "Балтийский рыболовный клуб",
  },
  {
    id: 23,
    title: "Челябинский карп",
    date: "4 окт 2026",
    dateStart: "2026-10-04",
    place: "оз. Увильды",
    type: "Фидер",
    region: "УФО",
    subregion: "Челябинская обл.",
    fee: 2500,
    slots: 55,
    registered: 30,
    description:
      "Карповый турнир на чистейшем озере Увильды. 24 часа непрерывной ловли карпа и амура.",
    rules: [
      "Марафон 24 часа (суббота - воскресенье)",
      "Максимум 3 удилища на участника",
      "Разрешены бойлы, пеллетс, кукуруза",
      "Карповый мат обязателен",
      "Фотофиксация каждого трофея",
    ],
    prizes: [
      "1 место — 35 000 ₽ + кубок",
      "2 место — 17 500 ₽",
      "3 место — 8 500 ₽",
    ],
    organizer: "Южно-Уральский карповый клуб",
  },
  {
    id: 24,
    title: "Ингушский форелевый",
    date: "11 окт 2026",
    dateStart: "2026-10-11",
    place: "Джейрахское ущелье",
    type: "Нахлыст",
    region: "СКФО",
    subregion: "Ингушетия",
    fee: 3000,
    slots: 20,
    registered: 8,
    description:
      "Камерный нахлыстовый турнир в горах Ингушетии. Ловля ручьевой форели в чистейших горных потоках.",
    rules: [
      "Только нахлыст класса 3-5",
      "Безбородочные крючки обязательны",
      "Принцип «поймал — отпусти»",
      "Зачёт по длине пойманных форелей",
      "Группы не более 5 человек на участке",
    ],
    prizes: [
      "1 место — 28 000 ₽ + авторский трофей",
      "2 место — 14 000 ₽",
      "3 место — 7 000 ₽",
    ],
    organizer: "Кавказский клуб форелевой ловли",
  },
];

type SortOption = "date" | "name" | "slots";

const SORT_LABELS: Record<SortOption, string> = {
  date: "По дате",
  name: "По названию",
  slots: "По свободным местам",
};

const FISHING_TYPES = ["Спиннинг", "Поплавок", "Нахлыст", "Фидер"] as const;

function TournamentModal({
  tournament,
  onClose,
}: {
  tournament: Tournament;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"info" | "rules" | "prizes">("info");
  const color = REGION_COLORS[tournament.region];
  const fillPercent = Math.round(
    (tournament.registered / tournament.slots) * 100
  );
  const freeSlots = tournament.slots - tournament.registered;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div
          className="h-2 w-full flex-shrink-0"
          style={{ background: color }}
        />

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">
              {tournament.title}
            </h2>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full text-white flex-shrink-0"
              style={{ background: color }}
            >
              {tournament.region}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 ml-3 transition-colors"
          >
            <Icon name="X" size={16} className="text-gray-500" />
          </button>
        </div>

        <div
          className="mx-6 mt-4 rounded-xl p-4"
          style={{
            background: `linear-gradient(135deg, ${color}15, ${color}30)`,
            border: `1px solid ${color}33`,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: "#1A5F8C" }}
            >
              <Icon
                name={TYPE_ICONS[tournament.type] ?? "Fish"}
                size={12}
                className="text-white"
              />
              {tournament.type}
            </div>
            <span className="text-xs text-gray-500">{tournament.subregion}</span>
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Icon name="Calendar" size={14} className="text-gray-400" />
              {tournament.date}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Icon name="MapPin" size={14} className="text-gray-400" />
              {tournament.place}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Icon name="Users" size={14} className="text-gray-400" />
              {tournament.registered}/{tournament.slots} мест
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1A5F8C]">
              <Icon name="Wallet" size={14} />
              {tournament.fee.toLocaleString("ru-RU")} ₽
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Заполненность</span>
              <span>
                {fillPercent}% &middot; осталось {freeSlots}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${fillPercent}%`, background: color }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-1 px-6 mt-4">
          {(
            [
              ["info", "О турнире"],
              ["rules", "Регламент"],
              ["prizes", "Призы"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === id
                  ? "bg-[#1A5F8C] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tab === "info" && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Описание
                </p>
                <p className="text-sm leading-relaxed text-gray-700">
                  {tournament.description}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Организатор
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: color }}
                  >
                    {tournament.organizer[0]}
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {tournament.organizer}
                  </p>
                </div>
              </div>
            </div>
          )}
          {tab === "rules" && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Правила проведения
              </p>
              {tournament.rules.map((rule, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: color }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700">
                    {rule}
                  </p>
                </div>
              ))}
            </div>
          )}
          {tab === "prizes" && (
            <div className="flex flex-col gap-2">
              {tournament.prizes.map((prize, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3.5 border border-gray-100 flex items-center gap-3 bg-gray-50"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                    style={{
                      background:
                        i === 0
                          ? "#FFD70022"
                          : i === 1
                          ? "#C0C0C022"
                          : "#CD7F3222",
                    }}
                  >
                    {i === 0 ? (
                      <Icon name="Trophy" size={20} className="text-yellow-500" />
                    ) : i === 1 ? (
                      <Icon name="Medal" size={20} className="text-gray-400" />
                    ) : (
                      <Icon name="Award" size={20} className="text-orange-400" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800">{prize}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <button
            className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(90deg, #1A5F8C, #2A8FC0)",
            }}
          >
            <Icon name="UserPlus" size={15} className="text-white" />
            Зарегистрироваться &middot;{" "}
            {tournament.fee.toLocaleString("ru-RU")} ₽
          </button>
        </div>
      </div>
    </div>
  );
}

function Tournaments() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedSubregions, setSelectedSubregions] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) => {
      const next = prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region];
      const removedRegion = prev.includes(region) ? region : null;
      if (removedRegion) {
        const subs = REGIONS_MAP[removedRegion] || [];
        setSelectedSubregions((s) => s.filter((sub) => !subs.includes(sub)));
      }
      return next;
    });
  };

  const toggleSubregion = (sub: string) => {
    setSelectedSubregions((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedRegions([]);
    setSelectedSubregions([]);
    setDateFrom("");
    setDateTo("");
    setSelectedTypes([]);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedRegions.length > 0) count++;
    if (selectedSubregions.length > 0) count++;
    if (dateFrom || dateTo) count++;
    if (selectedTypes.length > 0) count++;
    if (search.trim()) count++;
    return count;
  }, [selectedRegions, selectedSubregions, dateFrom, dateTo, selectedTypes, search]);

  const availableSubregions = useMemo(() => {
    if (selectedRegions.length === 0) return [];
    return selectedRegions.flatMap((r) => REGIONS_MAP[r] || []);
  }, [selectedRegions]);

  const filtered = useMemo(() => {
    let result = [...TOURNAMENTS];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.place.toLowerCase().includes(q) ||
          t.subregion.toLowerCase().includes(q) ||
          t.organizer.toLowerCase().includes(q)
      );
    }

    if (selectedRegions.length > 0) {
      result = result.filter((t) => selectedRegions.includes(t.region));
    }

    if (selectedSubregions.length > 0) {
      result = result.filter((t) => selectedSubregions.includes(t.subregion));
    }

    if (dateFrom) {
      const from = startOfDay(parseISO(dateFrom));
      result = result.filter(
        (t) =>
          isAfter(startOfDay(parseISO(t.dateStart)), from) ||
          startOfDay(parseISO(t.dateStart)).getTime() === from.getTime()
      );
    }

    if (dateTo) {
      const to = startOfDay(parseISO(dateTo));
      result = result.filter(
        (t) =>
          isBefore(startOfDay(parseISO(t.dateStart)), to) ||
          startOfDay(parseISO(t.dateStart)).getTime() === to.getTime()
      );
    }

    if (selectedTypes.length > 0) {
      result = result.filter((t) => selectedTypes.includes(t.type));
    }

    if (sortBy === "date") {
      result.sort(
        (a, b) =>
          parseISO(a.dateStart).getTime() - parseISO(b.dateStart).getTime()
      );
    } else if (sortBy === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title, "ru"));
    } else if (sortBy === "slots") {
      result.sort(
        (a, b) =>
          b.slots - b.registered - (a.slots - a.registered)
      );
    }

    return result;
  }, [
    search,
    selectedRegions,
    selectedSubregions,
    dateFrom,
    dateTo,
    selectedTypes,
    sortBy,
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://cdn.poehali.dev/projects/9e3df676-4573-415f-a58b-995e884ff7e5/bucket/423c6ded-6868-4e89-a3b4-670373c6795a.jpeg"
              alt="Logo"
              className="w-10 h-10 rounded-lg object-cover"
            />
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: "#1A5F8C" }}
            >
              ПРИМА
            </span>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#1A5F8C] transition-colors"
          >
            <Icon name="Home" size={16} />
            Главная
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1
            className="text-2xl sm:text-3xl font-bold mb-1"
            style={{ color: "#1A5F8C" }}
          >
            Соревнования
          </h1>
          <p className="text-gray-500 text-sm">
            Найдите турнир по рыбной ловле в вашем регионе
          </p>
        </div>

        <div className="relative mb-4">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Icon name="Search" size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию, месту, региону или организатору..."
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5F8C]/30 focus:border-[#1A5F8C] transition-all shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <Icon
                name="XCircle"
                size={18}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              />
            </button>
          )}
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#1A5F8C] transition-colors mb-3"
          >
            <Icon name="SlidersHorizontal" size={16} />
            <span>Фильтры</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1A5F8C] text-white text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
            <Icon
              name={showFilters ? "ChevronUp" : "ChevronDown"}
              size={14}
              className="text-gray-400"
            />
          </button>

          {showFilters && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Федеральный округ
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(REGION_COLORS).map(([reg, color]) => {
                    const active = selectedRegions.includes(reg);
                    return (
                      <button
                        key={reg}
                        onClick={() => toggleRegion(reg)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={{
                          background: active ? color : `${color}20`,
                          color: active ? "#fff" : color,
                          boxShadow: active
                            ? `0 2px 8px ${color}40`
                            : "none",
                        }}
                      >
                        {reg}
                      </button>
                    );
                  })}
                </div>
              </div>

              {availableSubregions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Регион
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSubregions.map((sub) => {
                      const active = selectedSubregions.includes(sub);
                      const parentRegion = selectedRegions.find((r) =>
                        (REGIONS_MAP[r] || []).includes(sub)
                      );
                      const parentColor = parentRegion
                        ? REGION_COLORS[parentRegion]
                        : "#1A5F8C";
                      return (
                        <button
                          key={sub}
                          onClick={() => toggleSubregion(sub)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all border"
                          style={{
                            background: active ? `${parentColor}15` : "white",
                            borderColor: active ? parentColor : "#e5e7eb",
                            color: active ? parentColor : "#6b7280",
                          }}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Даты
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">от</span>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1A5F8C]/30 focus:border-[#1A5F8C]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">до</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1A5F8C]/30 focus:border-[#1A5F8C]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Вид ловли
                </p>
                <div className="flex flex-wrap gap-2">
                  {FISHING_TYPES.map((type) => {
                    const active = selectedTypes.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                          active
                            ? "bg-[#1A5F8C] text-white border-[#1A5F8C] shadow-md shadow-[#1A5F8C]/20"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#1A5F8C]/40"
                        }`}
                      >
                        <Icon
                          name={TYPE_ICONS[type]}
                          size={12}
                          className={active ? "text-white" : "text-gray-400"}
                        />
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                  <Icon name="RotateCcw" size={13} />
                  Сбросить фильтры
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <p className="text-sm text-gray-600">
            Найдено:{" "}
            <span className="font-bold text-gray-900">
              {filtered.length}
            </span>{" "}
            соревновани
            {filtered.length === 1
              ? "е"
              : filtered.length >= 2 && filtered.length <= 4
              ? "я"
              : "й"}
          </p>
          <div className="flex items-center gap-1.5">
            {(["date", "name", "slots"] as SortOption[]).map((option) => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sortBy === option
                    ? "bg-[#1A5F8C] text-white shadow-sm"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {SORT_LABELS[option]}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Icon name="Fish" size={36} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Ничего не найдено
            </h3>
            <p className="text-sm text-gray-400 max-w-sm">
              Попробуйте изменить параметры поиска или сбросить фильтры, чтобы
              увидеть больше соревнований
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-[#1A5F8C] bg-[#1A5F8C]/10 hover:bg-[#1A5F8C]/20 transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((t) => {
              const color = REGION_COLORS[t.region];
              const fillPercent = Math.round(
                (t.registered / t.slots) * 100
              );
              const freeSlots = t.slots - t.registered;
              const formattedDate = (() => {
                try {
                  return format(parseISO(t.dateStart), "d MMM yyyy", {
                    locale: ru,
                  });
                } catch {
                  return t.date;
                }
              })();

              return (
                <div
                  key={t.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow relative group"
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ background: color }}
                  />

                  <div className="p-4 pl-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-bold text-sm text-gray-900 leading-tight">
                        {t.title}
                      </h3>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0"
                        style={{ background: color }}
                      >
                        {t.region}
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Icon
                          name="Calendar"
                          size={12}
                          className="text-gray-400"
                        />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Icon
                          name="MapPin"
                          size={12}
                          className="text-gray-400"
                        />
                        <span className="truncate">
                          {t.place}, {t.subregion}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
                        style={{ background: "#1A5F8C" }}
                      >
                        <Icon
                          name={TYPE_ICONS[t.type] ?? "Fish"}
                          size={11}
                          className="text-white"
                        />
                        {t.type}
                      </div>
                      <span
                        className="text-xs font-bold"
                        style={{ color: "#D9B48B" }}
                      >
                        {t.fee.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>
                          {t.registered} / {t.slots} участников
                        </span>
                        <span>
                          {freeSlots}{" "}
                          {freeSlots === 1
                            ? "место"
                            : freeSlots >= 2 && freeSlots <= 4
                            ? "места"
                            : "мест"}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${fillPercent}%`,
                            background:
                              fillPercent > 85
                                ? "#EF4444"
                                : fillPercent > 60
                                ? "#F59E0B"
                                : color,
                          }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTournament(t)}
                      className="w-full py-2 rounded-lg text-xs font-semibold transition-all border border-gray-200 text-gray-600 hover:bg-[#1A5F8C] hover:text-white hover:border-[#1A5F8C] flex items-center justify-center gap-1.5"
                    >
                      Подробнее
                      <Icon name="ArrowRight" size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedTournament && (
        <TournamentModal
          tournament={selectedTournament}
          onClose={() => setSelectedTournament(null)}
        />
      )}
    </div>
  );
}

export default Tournaments;
