# SDK Success Dashboard

A dashboard to track quantitative SDK success metrics from GitHub, npm, and PyPI.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase Postgres + Drizzle ORM
- **Charts:** Recharts
- **Deployment:** Vercel

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

Create a `.env.local` file for local development:

```env
# Database (Supabase Postgres)
DATABASE_URL=

# GitHub API (optional - for higher rate limits)
GITHUB_TOKEN=

# Cron job authorization (required for daily snapshots)
CRON_SECRET=
```

### Variable Details

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes (for DB features) | Supabase Postgres connection string. Get from [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → Database → Connection string |
| `GITHUB_TOKEN` | No | GitHub Personal Access Token (no scopes needed for public repos). Increases API rate limit from 60 to 5,000 requests/hour. [Create one here](https://github.com/settings/tokens) |
| `CRON_SECRET` | Yes (for cron) | Secret token to authorize cron job requests. Generate with: `openssl rand -base64 32` |

## Database Setup

This project uses [Drizzle ORM](https://orm.drizzle.team/) with Supabase Postgres.

### Available Commands

```bash
# Generate migrations from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Push schema directly (development)
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Initial Setup

1. Create a project at [Supabase](https://supabase.com/dashboard) (free tier available)
2. Go to Project Settings → Database → Connection string (URI)
3. Copy the connection string to `DATABASE_URL` in `.env.local`
4. Push the schema to create tables:
   ```bash
   npm run db:push
   ```

## Vercel Deployment Setup

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import this GitHub repository

2. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add `DATABASE_URL` (from Supabase)
   - Add `GITHUB_TOKEN` (optional but recommended)
   - Add `CRON_SECRET` (generate with `openssl rand -base64 32`)

3. **Run Database Migration**
   - Run `npm run db:push` locally with production DATABASE_URL

4. **Deploy**
   - Push to `main` branch to trigger deployment

## Daily Cron Job

The dashboard automatically collects metrics once per day at 6:00 AM UTC.

### How It Works

- **Endpoint:** `POST /api/cron/collect`
- **Schedule:** `0 6 * * *` (daily at 6:00 AM UTC)
- **Database:** Creates ONE snapshot per day (skips if already exists)

### Setup

1. Generate a secret: `openssl rand -base64 32`
2. Add to Vercel: Project Settings → Environment Variables → `CRON_SECRET`
3. Vercel Cron is configured in `vercel.json` and activates on deploy

### Manual Trigger (Testing)

```bash
curl -X POST https://your-app.vercel.app/api/cron/collect \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

> **Note:** Vercel Cron requires Pro plan or higher. On Hobby plan, use external cron services like [cron-job.org](https://cron-job.org) to call the endpoint daily.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [shadcn/ui Components](https://ui.shadcn.com/)
