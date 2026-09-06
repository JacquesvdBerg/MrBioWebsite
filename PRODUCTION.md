# Production

Code, logs, and API errors are English. Learner-facing content is Afrikaans.

## Environment

Copy `.env.example` and set these on the host:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser / SSR client key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. Required by the daily quiz job |
| `OPENAI_API_KEY` | Daily quiz generation |
| `CRON_SECRET` | Shared secret for the job endpoint |

Restart the process after changing env. The service role key must never be exposed to the browser.

Each job route allows up to **300 seconds** (`maxDuration`). One kind across all grades is typically 30–90 seconds. The master job for one grade is about 1–3 minutes.

Bruno collection: open the `bruno/` folder. Set `cronSecret` in the Local environment.

## Daily jobs

Same headers for every job:

```
Authorization: Bearer <CRON_SECRET>
Content-Type: application/json
```

Optional body:

```json
{ "date": "2026-08-31", "grade": 10 }
```

Empty body = all grades 8–12 for today (`Africa/Johannesburg`). Admin **Settings** can pause all generation. `GET` returns usage JSON.

| Job | URL |
| --- | --- |
| Master (all games) | `POST /api/jobs/daily-all` |
| Vasvra | `POST /api/jobs/daily-quiz` |
| Waar of onwaar | `POST /api/jobs/daily-true-or-false` |
| Woordsoektog | `POST /api/jobs/daily-word-search` |
| Kruiswoord | `POST /api/jobs/daily-crossword` |
| Pas die pare | `POST /api/jobs/daily-match-the-pairs` |
| Sit in volgorde | `POST /api/jobs/daily-put-in-order` |
| Diagramme | `POST /api/jobs/daily-diagram` |
| Geheuekaarte | `POST /api/jobs/daily-memory-cards` |
| Sorteer | `POST /api/jobs/daily-sorting` |
| Spoedvasvra | `POST /api/jobs/daily-speed-quiz` |

Master body can also limit kinds:

```json
{ "grade": 10, "kinds": ["quiz", "word-search"] }
```

In Bruno, start with `{ "grade": 10 }` on **Daily all games**. All grades × all games can approach the 300s cap.

Do not run OpenAI from Postgres.

## Cron — not created yet

**A production scheduler still needs to be created.** Prefer one nightly call to `/api/jobs/daily-all`.

`localhost` cannot be reached from Supabase or Vercel. Deploy first, then point the scheduler at the public origin.

Preferred: **Supabase `pg_cron` + `pg_net`** around **00:05 Africa/Johannesburg** (`SAST`, UTC+2, no DST). Alternative: Vercel Cron.

```sql
-- TODO: enable pg_cron and pg_net, then schedule this.
select net.http_post(
  url := 'https://YOUR_DOMAIN/api/jobs/daily-all',
  headers := jsonb_build_object(
    'Authorization', 'Bearer YOUR_CRON_SECRET',
    'Content-Type', 'application/json'
  ),
  body := '{}'::jsonb
);
```

Until that job exists, generate from Bruno after deploy.
