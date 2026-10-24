export type TourStep = {
  id: string;
  route: string;
  selector: string;
  /** Matching bottom-nav item to lift above the overlay */
  nav: "weeks" | "today" | "goals" | "stats" | "profile";
  title: string;
  text: string;
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: "week-map",
    route: "/",
    selector: '[data-tour="week-map"]',
    nav: "weeks",
    title: "Карта сезона",
    text: "12 клеток — 12 недель. Выбери неделю, поставь мини-задачи и закрывай их по одной.",
  },
  {
    id: "goals-board",
    route: "/goals",
    selector: '[data-tour="goals-board"]',
    nav: "goals",
    title: "Цели сезона",
    text: "Сюда ставишь то, чего хочешь добиться за 12 недель: счётчики, метрики или разовые цели.",
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
    id: "profile-xp",
    route: "/profile",
    selector: '[data-tour="profile-xp"]',
    nav: "profile",
    title: "Опыт и уровни",
    text: "Закрыл задачу — получил XP. Уровень, streak и ачивки живут в профиле.",
  },
];
