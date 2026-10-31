# Деплой на Cloudflare Workers (OpenNext)

Приложение собирается через [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) (Next.js 14 + middleware + `/auth/callback`).

## Бесплатный тариф

Workers Free: **100 000 запросов/день**, статика без лимита, **500 сборок/месяц** — для личного трекера обычно достаточно.

## 1. Аккаунт и GitHub

1. [dash.cloudflare.com](https://dash.cloudflare.com) → войти через **GitHub**.
2. **Workers & Pages** → **Create** → **Import Git repository** → `Wolens/12twelve_years_tracker`.

## 2. Настройки сборки (Workers Builds)

| Поле | Значение |
|------|----------|
| Production branch | `main` |
| Build command | `npm run build:cloudflare` |

Если мастер просит **Framework preset**, выбери **None** / custom и укажи команду выше.

### Переменные (Build variables and secrets)

Те же, что в `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Без них сборка или auth на проде не заработают.

При подключении Git Cloudflare часто сам запускает `wrangler deploy` после сборки OpenNext — если деплой не стартует, используй CLI (`npm run deploy:cloudflare`).

## 3. CLI (альтернатива)

```bash
npm install
copy .dev.vars.example .dev.vars   # заполнить ключи Supabase
npx wrangler login
npm run deploy:cloudflare
```

Локальная проверка в рантайме Workers:

```bash
npm run preview:cloudflare
```

Обычная разработка без изменений: `npm run dev`.

## 4. Supabase после первого деплоя

**Authentication → URL Configuration → Redirect URLs**, добавь:

- `https://<твой-worker>.workers.dev/auth/callback`  
  (точный URL смотри в Cloudflare после деплоя)
- `http://localhost:3000/auth/callback`

**Site URL** можно поставить на прод-адрес Cloudflare.

## 5. Netlify

Старый прод на Netlify можно оставить или отключить; новый основной хостинг — Cloudflare (обнови URL в README после деплоя).

## Версии

- `@opennextjs/cloudflare@1.15.x` — последняя ветка с **Next.js 14** (новее требует Next 15+).
- `wrangler.toml`: `nodejs_compat`, worker `twelve-weeks-tracker`.
