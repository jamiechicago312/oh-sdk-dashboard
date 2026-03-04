# SDK Success Dashboard - Implementation Plan

## 📋 Overview

This dashboard will track and visualize SDK success metrics based on the research from the [SDK Success Notion page](https://www.notion.so/SDK-Success-3177be798a17804894f9fe3292f32537). The goal is to move beyond vanity metrics and focus on meaningful engagement, contributor confidence, and real-world impact.

## 🎯 What We're Tracking

Based on the SDK Success research, we'll track two types of metrics:

### Quantitative Metrics
- **GitHub Stars & Forks**: Interest and potential usage indicators
- **Download/Installation Counts**: npm, PyPI downloads
- **Dependencies in Other Projects**: How many projects use the SDK
- **Active Forks**: Forks with commits beyond the forking point

### Qualitative Metrics (Most Important!)
- **Community Showcases**: Projects shared via Slack/Discord
- **Case Studies**: Real-world success stories
- **Contributor Confidence**: Repeat contributions, engagement quality
- **Incentive Program Participation**: Hackathon submissions, demo calls

---

## 🏗️ Technical Architecture

### Stack
- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Vercel Postgres (you have a paid account)
- **ORM**: Drizzle ORM (lightweight, TypeScript-native)
- **Deployment**: Vercel (automatic deployments from GitHub)
- **Data Fetching**: GitHub API, npm API, PyPI API

### Why Vercel Postgres?
- Native integration with Vercel deployment
- Serverless-friendly with connection pooling
- Included in paid Vercel plans
- No additional infrastructure to manage

---

## 📊 Database Schema

```sql
-- SDK being tracked
CREATE TABLE sdks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  github_repo VARCHAR(255), -- e.g., "openhands/sdk"
  npm_package VARCHAR(255),
  pypi_package VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Daily snapshots of quantitative metrics
CREATE TABLE metrics_snapshots (
  id SERIAL PRIMARY KEY,
  sdk_id INTEGER REFERENCES sdks(id),
  date DATE NOT NULL,
  github_stars INTEGER,
  github_forks INTEGER,
  github_active_forks INTEGER,
  npm_downloads_weekly INTEGER,
  pypi_downloads_weekly INTEGER,
  dependent_repos INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Community showcases and success stories
CREATE TABLE showcases (
  id SERIAL PRIMARY KEY,
  sdk_id INTEGER REFERENCES sdks(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(500),
  author VARCHAR(255),
  source VARCHAR(50), -- 'slack', 'discord', 'github', 'manual'
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contributors and their engagement
CREATE TABLE contributors (
  id SERIAL PRIMARY KEY,
  sdk_id INTEGER REFERENCES sdks(id),
  github_username VARCHAR(255) NOT NULL,
  contribution_count INTEGER DEFAULT 0,
  first_contribution DATE,
  last_contribution DATE,
  is_repeat_contributor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Incentive program tracking
CREATE TABLE incentive_events (
  id SERIAL PRIMARY KEY,
  sdk_id INTEGER REFERENCES sdks(id),
  event_type VARCHAR(50), -- 'hackathon', 'demo_call', 'swag', 'blog_post'
  title VARCHAR(255),
  participant_count INTEGER,
  date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📁 Project Structure

```
oh-sdk-dashboard/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Main dashboard
│   ├── api/
│   │   ├── metrics/
│   │   │   └── route.ts            # Metrics API
│   │   ├── showcases/
│   │   │   └── route.ts            # Showcases CRUD
│   │   ├── cron/
│   │   │   └── collect/route.ts    # Scheduled data collection
│   │   └── github/
│   │       └── webhook/route.ts    # GitHub webhook handler
│   ├── showcases/
│   │   └── page.tsx                # Community showcases page
│   └── admin/
│       └── page.tsx                # Admin panel for manual entry
├── components/
│   ├── ui/                         # shadcn components
│   ├── charts/
│   │   ├── stars-chart.tsx
│   │   ├── downloads-chart.tsx
│   │   └── contributors-chart.tsx
│   ├── metrics-card.tsx
│   ├── showcase-card.tsx
│   └── dashboard-header.tsx
├── lib/
│   ├── db.ts                       # Database connection
│   ├── schema.ts                   # Drizzle schema
│   ├── github.ts                   # GitHub API utils
│   ├── npm.ts                      # npm API utils
│   └── pypi.ts                     # PyPI API utils
├── drizzle/
│   └── migrations/                 # Database migrations
├── drizzle.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up Tailwind CSS and shadcn/ui
- [ ] Configure Vercel Postgres and Drizzle ORM
- [ ] Create database schema and run migrations
- [ ] Build basic dashboard layout

### Phase 2: Data Collection (Week 2)
- [ ] Implement GitHub API integration (stars, forks, contributors)
- [ ] Implement npm download stats API
- [ ] Implement PyPI download stats API
- [ ] Create Vercel Cron job for daily metric collection
- [ ] Build active forks analysis

### Phase 3: Dashboard Views (Week 3)
- [ ] Build metrics overview cards
- [ ] Create time-series charts for trends
- [ ] Build contributor engagement view
- [ ] Implement showcase gallery
- [ ] Add filtering and date range selection

### Phase 4: Community Features (Week 4)
- [ ] Build showcase submission form
- [ ] Create admin panel for manual entries
- [ ] Add case study highlighting
- [ ] Implement incentive program tracking
- [ ] Build notification system for milestones

### Phase 5: Polish & Deploy (Week 5)
- [ ] Add responsive design
- [ ] Implement dark mode
- [ ] Performance optimization
- [ ] Add loading states and error handling
- [ ] Final testing and production deployment

---

## 🔑 Environment Variables

```env
# Vercel Postgres
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# GitHub API (for higher rate limits)
GITHUB_TOKEN=

# Optional: Slack webhook for notifications
SLACK_WEBHOOK_URL=
```

---

## 📈 Dashboard Features

### Main Dashboard
1. **Key Metrics Overview**
   - Total stars with trend indicator
   - Weekly downloads (combined npm + PyPI)
   - Active contributors count
   - Featured showcases count

2. **Trend Charts**
   - Stars over time (30/90/365 days)
   - Downloads trend
   - Contributor growth

3. **Recent Activity**
   - Latest showcases
   - Recent contributors
   - Milestone achievements

### Showcases Page
- Gallery of community projects
- Filterable by source (Slack, Discord, GitHub)
- Featured projects highlighting
- Submission form for new showcases

### Admin Panel
- Manual metric entry
- Showcase moderation
- Incentive event logging
- SDK configuration

---

## 🔄 Data Collection Strategy

### Automated (Daily Cron Job)
- GitHub stars, forks, active forks count
- npm weekly downloads
- PyPI weekly downloads
- Dependent repos count (GitHub API)
- New contributors detection

### Manual Entry (Admin Panel)
- Community showcases discovered in Slack/Discord
- Case study details
- Hackathon/demo call participation
- Swag recipients

### Webhooks (Real-time)
- GitHub webhook for new stars, forks, issues
- Optional: Slack app for showcase submissions

---

## 🎨 Design Principles

1. **Clarity over complexity**: Focus on metrics that matter
2. **Storytelling**: Highlight community success, not just numbers
3. **Actionable insights**: Surface trends and recommendations
4. **Accessible**: Mobile-friendly, dark mode support

---

## 📚 Next Steps

1. **Approve this plan** and I'll start Phase 1 implementation
2. **Set up Vercel Postgres** in your Vercel dashboard (Settings > Storage > Create Database)
3. **Get a GitHub token** with `repo` and `read:org` scopes for API access
4. **Identify SDKs to track**: Which repos/packages should we monitor?

---

## 🔗 Resources

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Drizzle ORM](https://orm.drizzle.team/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [GitHub REST API](https://docs.github.com/en/rest)
- [npm Registry API](https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md)
- [PyPI Stats API](https://pypistats.org/api/)

---

*Plan created based on SDK Success research from Notion. Ready to build something meaningful! 🚀*
