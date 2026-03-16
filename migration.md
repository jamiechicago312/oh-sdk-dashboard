# Database Migration Guide

The database tables need to be created before the cron job can run. Follow these steps:

## Option 1: Using the Migration API (Recommended)

### 1. Deploy the code
Make sure the latest code with `/api/db/migrate` is deployed to Vercel.

### 2. Run the migration
Send a POST request to trigger the migration:

```bash
curl -X POST https://your-project.vercel.app/api/db/migrate
```

If you have `CRON_SECRET` set, add the authorization header:

```bash
curl -X POST https://your-project.vercel.app/api/db/migrate \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 3. Verify
The response should be:
```json
{
  "success": true,
  "message": "Database tables created successfully"
}
```

---

## Option 2: Using Drizzle CLI Locally

### 1. Set up local environment
Create a `.env.local` file with your Neon database URL:

```bash
echo 'DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@host/neondb?sslmode=require' > .env.local
```

### 2. Run the migration
```bash
npm run db:push
```

---

## Required Tables

The following tables are created:
- `sdks` - Stores SDK records
- `metrics_snapshots` - Stores daily metrics snapshots

Both tables include the necessary constraints and indexes for the cron job to function.
