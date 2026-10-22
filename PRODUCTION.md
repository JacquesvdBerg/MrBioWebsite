# Production

Code, logs, and API errors are English. Learner-facing content is Afrikaans.

## Environment

Copy `.env.example` and set these on the host:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser / SSR client key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. Required by the daily jobs and for reading the OpenAI key |
| `CRON_SECRET` | Shared secret for the job endpoint |

Restart the process after changing env. The service role key must never be exposed to the browser.

The OpenAI API key is not an env var. The teacher pastes it under **Admin > Instellings > AI-verbinding**, where it is checked against OpenAI and stored in `public.app_secrets` (service role only; see `supabase/migrations/20261021120000_app_secrets.sql`). Without a key the daily jobs fail with a clear error.

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

## Weekly schedule (Vercel Cron)

`vercel.json` schedules the jobs. Vercel calls each path with `GET` and `Authorization: Bearer <CRON_SECRET>`, so `CRON_SECRET` must stay set in Vercel. Times are UTC; South Africa is UTC+2.

| When (SAST) | Path | What |
| --- | --- | --- |
| Monday 00:05 | `/api/jobs/weekly-games/10` | All games for graad 10 |
| Monday 00:20 | `/api/jobs/weekly-games/11` | All games for graad 11 |
| Monday 00:35 | `/api/jobs/weekly-games/12` | All games for graad 12 |
| Monday 06:00 | `/api/jobs/weekly-fact` | Feit van die week |

One grade per call keeps each run inside the 300 second limit. On the Hobby plan Vercel may start a job any time within the scheduled hour.

The game pages show the newest set dated on or before today, so a Monday set stays up all week.

The fact job publishes the oldest fact the teacher marked **Goedgekeur**. With none waiting, OpenAI writes one for the grade whose turn it is (by ISO week, cycling 8 to 12) and publishes it. It skips a week that already has a published fact, and respects the pause switch in Settings.

Run by hand (same secret):

```
POST /api/jobs/weekly-games/10
POST /api/jobs/weekly-fact
POST /api/jobs/weekly-fact?dry=1   # writes a fact and returns it without saving
```
