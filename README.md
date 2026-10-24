# 12 недель — персональный трекер целей

Веб-приложение по методике **«12 недель в году»**: сферы жизни, количественные и метрические цели, дашборд по неделям, статистика, RPG-геймификация (XP, уровни, достижения). Без входа данные в **localStorage**; после регистрации — синхронизация в **Supabase**.

## Стек

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + компоненты в стиле shadcn/ui
- Zustand + persist
- Recharts
- Framer Motion
- lucide-react

## Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

### Supabase (вход и облако)

1. Создайте проект на [supabase.com](https://supabase.com).
2. **SQL Editor** → выполните скрипт из `supabase/schema.sql`.
3. **Authentication → URL Configuration**: добавьте в Redirect URLs  
   `http://localhost:3000/auth/callback` и ваш прод-домен с тем же путём.
4. Скопируйте `.env.example` → `.env.local`, вставьте `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` из **Project Settings → API**.
5. Для реальной почты: **Authentication → SMTP** (Resend, Brevo и т.д.). Встроенная почта Supabase — только для тестов (2 письма/час).

Первый вход после регистрации подтянет локальные данные в облако, если в аккаунте ещё пусто.

## Продакшен (для разработчиков и AI-ассистентов)

**Это живой сайт с реальными пользователями.** Не отключать RLS, не коммитить секреты, не выкладывать дампы `user_profiles` / `app_state` в чаты и issues.

| Что | Значение |
|-----|----------|
| Основной URL | https://curious-frangollo-7d930e.netlify.app |
| Хостинг | [Netlify](https://www.netlify.com) (Next.js Runtime, `netlify.toml`) |
| Репозиторий | https://github.com/Wolens/12twelve_years_tracker |
| Бэкенд | Supabase Auth + таблица `public.user_profiles` (`app_state` jsonb), схема в `supabase/schema.sql` |
| Доступ к сайту | Netlify **Visitor access → Public** (не Private) |

Permalink отдельного деплоя (не обязательно основной домен):  
https://6adcdd46978ce9f88d6e13fc--curious-frangollo-7d930e.netlify.app/

**Переменные окружения** (локально `.env.local`, на Netlify в UI — не в git):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (значение = Publishable key в Supabase)

**Supabase Auth → Redirect URLs** должны включать:

- `https://curious-frangollo-7d930e.netlify.app/auth/callback`
- `http://localhost:3000/auth/callback` (для разработки)

**Синхронизация данных:** гость — `localStorage` (`useAppStore`); после входа — загрузка/сохранение в Supabase (`src/lib/cloud-sync.ts`, `useAuthStore` + `app-providers.tsx`).

## Страницы

| Путь | Описание |
|------|----------|
| `/` | Дашборд 12 недель |
| `/today` | Агрегация задач на сегодня |
| `/goals` | Создание и редактирование целей |
| `/stats` | Графики, streak, сводка по сферам |
| `/profile` | Уровень, XP, достижения |
| `/settings` | Тема, экспорт/импорт JSON, демо-данные, сброс цикла |
| `/onboarding` | Выбор сфер (первый запуск) |
| `/print-report` | Отчёт для печати / PDF |

## Скриншоты

> Добавьте скриншоты после запуска: `docs/screenshot-dashboard.png`, `docs/screenshot-stats.png`.

## PWA

В `public/manifest.json` указаны иконки `icon-192.png` и `icon-512.png`. Положите PNG в `public/` или замените путями на свои.

## Архитектура

```
src/
  app/           # маршруты App Router (+ auth/callback)
  components/    # UI, дашборд, графики, онбординг
  lib/           # геймификация, cloud-sync, supabase/
  store/         # useAppStore (local), useAuthStore (Supabase Auth)
  types/         # модели данных + версия хранилища
supabase/        # schema.sql для прод-БД
```

Ключ localStorage: `twelve-weeks-tracker-v1`.

## Демо

В **Настройки → Заполнить примером** подгружаются цели (рилсы, вес, накопления) с историей прогресса.

## Лицензия

MIT
