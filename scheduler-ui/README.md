# File Pickup Scheduler — React Console

A React + Vite rebuild of `scheduler_app_1.py` (Streamlit), talking directly
to `api_server.py`. Same pages, same actions (start/stop/pause/resume/trigger,
add/remove sources, delete schedulers, view logs, run the ingestion agent,
generate presentations), professional dark/slate theme, collapsible sidebar,
and minimize/maximize on every panel so nothing overlaps.

## Pages

- **Dashboard** — stat cards, scheduler table (start/pause/run/edit/delete), recent scan activity from `/api/history`.
- **New Scheduler** — identity, frequency (minutely/hourly/daily/weekly/monthly/cron), timezone, JSON output template, output/delivery. Pushes the schedule to `/api/config`.
- **Schedulers** — full list with the same row actions as Dashboard.
- **Sources** — add local / GCP / Google Drive / Azure / S3 sources (posts to `/api/sources`, deletes via `DELETE /api/sources/{id}`), draft list, sources attached to saved schedulers.
- **History & Logs** — `/api/history`, expandable rows, JSON download, per-row delete (client-side hide) and "delete all".
- **Ingestion Agent** — Scan Ingestion Status, SQL Records (`/agent/ingested/structured`), Vector Store stats + semantic search (`/agent/vector/search`), Results (`/agent/results`), Logs (`/agent/logs`).
- **Presentation Agent** — schema snapshot, Generate (`/presentation/generate`), Job Status & Download with pipeline stepper, manifest audit trail, retry, and Recent Jobs (`/presentation/jobs`).
- **Settings** — credential-provider reference, log directory, export scan logs/scheduler configs as JSON, danger zone.

## Why some things use browser storage

`api_server.py` runs **one** live `FileScheduler` engine (`/api/status`,
`/api/config`, `/api/scheduler/*`). The Streamlit app's multi-scheduler
*profile list* (many named configs you can switch between) was Streamlit's
own local JSON file storage, not an API concept. This UI mirrors that with
`localStorage` (`src/api.js` → `ProfileStore`) so you keep the same workflow
without inventing endpoints that don't exist server-side. If you add real
CRUD endpoints for multiple scheduler profiles later, swap `ProfileStore` for
API calls — every page already reads/writes through that one module.

## Running it

```bash
npm install
# point the dev proxy at wherever api_server.py is running (default http://localhost:8000)
VITE_API_TARGET=http://localhost:8000 npm run dev
```

Open http://localhost:5173. All `/api`, `/agent`, `/presentation`, `/ws`
requests are proxied to `api_server.py` (see `vite.config.js`) so there's no
CORS setup needed in dev.

### Production build

```bash
npm run build
```

Serve the `dist/` folder from the same origin as `api_server.py` (e.g. mount
it as static files in FastAPI, or put both behind one nginx/reverse-proxy
host) — then `src/api.js` calls same-origin paths and everything just works.
If you must serve it from a different origin, set `VITE_API_BASE` at build
time to the full `api_server.py` origin and enable CORS there.

## File layout

```
src/
  api.js              — every api_server.py call in one place
  theme.css           — design tokens (colors, type, spacing)
  App.jsx / App.css   — sidebar shell, routing, connection status
  components/ui.jsx   — Panel (minimize/maximize), Card, Button, Badge,
                         Tabs, Modal/Confirm, Toasts, LogConsole, etc.
  lib/format.js        — frequency labels, date formatting
  pages/
    Dashboard.jsx
    NewScheduler.jsx
    SchedulerList.jsx
    Sources.jsx
    Logs.jsx
    IngestionAgent.jsx
    Presentation.jsx
    Settings.jsx
```

## Theme

Dark & light themes, applied via `data-theme` on `<html>` and persisted in
`localStorage` (`fps_theme`) — same mechanism as the CFO codebase. Dark is the
default: "Signal room" palette — deep slate-blue background (`#10161f`), cyan
accent for running/active states, amber for attention, coral for destructive
actions, violet for structured/vector data. The light theme overrides the same
tokens under `[data-theme="light"]` in `theme.css` (accents darkened for
contrast on white). Toggle lives in the top bar. Space Grotesk for headings,
Inter for body text, JetBrains Mono for IDs/JSON/logs.
