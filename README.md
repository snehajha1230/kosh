# Kosh

**Kosh** is a personal finance demo built with Next.js. It lets you explore income, expenses, net balance, and category breakdowns with a small dashboard of charts and filters. All data lives in the browser—there is no backend.

## Features

- **Landing page** — Marketing-style entry with navigation into the app.
- **Dashboard** (`/dashboard`) — Overview, income, expenses, and insights tabs with summary cards.
- **Transactions** — Sortable, filterable list; **Admin** role can add, edit, and delete entries (Viewer is read-only).
- **Charts & visuals** — Balance-over-time chart (range presets, hover details), expense pie chart, income semi-gauges, and insight cards driven by your data.
- **Theme** — Light / dark mode, persisted with your session data.
- **Persistence** — Transactions, role, and theme are saved in **localStorage** (demo reset available when signed in as Admin).

## Tech stack

| Layer | Choice |
|--------|--------|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| UI | [React](https://react.dev/) 19 |
| Styling | [Tailwind CSS](https://tailwindcss.com/) 4 |
| Language | TypeScript |

## Getting started

**Requirements:** Node.js 20+ recommended (aligned with `@types/node` in the repo).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page. The dashboard lives at [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run the production server (after `build`) |
| `npm run lint` | ESLint |

## Project layout

```
app/                    # Routes, layout, global styles, providers
components/
  dashboard/            # Dashboard shell, charts, transactions UI
  finance/              # React context for finance state
  landing/              # Landing page
lib/
  aggregates.ts         # Sums, daily series, monthly rollups
  finance-insights.ts   # Insight card copy from data
  mock-data.ts          # Seed transactions for first load
  storage.ts            # localStorage load/save
  types.ts              # Shared TypeScript types
```

## Data & privacy

- Seed data is defined in `lib/mock-data.ts` as `INITIAL_TRANSACTIONS`.
- Hydrated state uses the key `zorvyn-finance-state-v2` in `localStorage` (see `lib/storage.ts`).
- Clearing site data or using **Reset demo data** (Admin, dashboard footer) restores the original demo set.

## Roles

- **Viewer** — Browse dashboards and transactions; cannot mutate data.
- **Admin** — Full CRUD on transactions plus demo reset.

The role is stored locally with the rest of the app state.

## License

Private project (`"private": true` in `package.json`). Adjust this section if you publish or open-source the repo.
