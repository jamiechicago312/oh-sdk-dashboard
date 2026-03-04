# SDK Success Dashboard

A dashboard to track quantitative SDK success metrics from GitHub, npm, and PyPI.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Vercel Postgres + Drizzle ORM
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
# Database (Vercel Postgres)
POSTGRES_URL=

# GitHub API (optional - for higher rate limits)
GITHUB_TOKEN=
```

### Variable Details

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_URL` | Yes (for DB features) | Vercel Postgres connection string. Get this from Vercel Dashboard → Storage → Create Database → Postgres |
| `GITHUB_TOKEN` | No | GitHub Personal Access Token. Increases API rate limit from 60 to 5,000 requests/hour. [Create one here](https://github.com/settings/tokens) |

## Vercel Deployment Setup

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import this GitHub repository

2. **Create Postgres Database**
   - In Vercel Dashboard → Storage → Create Database → Postgres
   - Connect it to your project
   - `POSTGRES_URL` will be automatically added to environment variables

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add `GITHUB_TOKEN` (optional but recommended)

4. **Deploy**
   - Push to `main` branch to trigger deployment

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
