export type TourStep = {
  id: string;
  route: string;
  /** Query string without leading ? (e.g. tab=goals) */
  search?: string;
  selector: string;
  /** Matching bottom-nav item to lift above the overlay */
  nav: "weeks" | "today" | "hero" | "stats" | "profile";
  title: string;
  text: string;
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: "week-map",
    route: "/",
    selector: '[data-tour="week-map"]',
    nav: "weeks",
    title: "Карта 12 недель",
    text: "12 клеток — 12 недель. Выбери неделю, поставь мини-задачи и закрывай их по одной.",
  },
  {
    id: "hero-goals",
    route: "/hero",
    search: "tab=goals",
    selector: '[data-tour="hero-goals"]',
    nav: "hero",
    title: "Цели на 12 недель",
    text: "Стоит заглянуть в «Герой → Цели»: опиши, о чём цель, и при желании укажи начальное и целевое число. Задачи по неделям ставишь на «12 недель».",
  },
  {
    id: "today-board",
    route: "/today",
    selector: '[data-tour="today-board"]',
    nav: "today",
    title: "Сегодня",
    text: "Каждый день открывай эту вкладку: здесь собирается то, что нужно сделать прямо сейчас.",
  },
  {
    id: "stats-board",
    route: "/stats",
    selector: '[data-tour="stats-board"]',
    nav: "stats",
    title: "Статистика",
    text: "Прогресс цикла, задачи по целям, XP за дни — всё в одном месте. Числовые цели обновляй в «Герой → Цели».",
  },
  {
    id: "profile-xp",
    route: "/profile",
    selector: '[data-tour="profile-xp"]',
    nav: "profile",
    title: "Опыт и уровни",
    text: "Закрыл задачу — получил XP. Уровень, streak и ачивки живут в профиле.",
  },
];
