import { SDK_CONFIG } from '@/lib/sdk-config';
import { getAllGitHubMetrics } from '@/lib/github';
import { getPyPIDownloads } from '@/lib/pypi';
import { MetricsCard } from '@/components/metrics-card';
import { RefreshCountdown } from '@/components/refresh-countdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

async function getMetrics() {
  try {
    const [github, pypi] = await Promise.all([
      getAllGitHubMetrics(SDK_CONFIG.github.owner, SDK_CONFIG.github.repo),
      getPyPIDownloads(SDK_CONFIG.pypi.package),
    ]);
    return { github, pypi, error: null };
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    return { github: null, pypi: null, error: 'Failed to fetch metrics' };
  }
}

// Revalidate every 5 minutes (server-side cache only, not DB writes)
export const revalidate = 300;

export default async function Home() {
  const { github, pypi, error } = await getMetrics();
  const lastUpdated = new Date().toISOString();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white">{SDK_CONFIG.name}</h1>
          <p className="text-indigo-200 mt-2">{SDK_CONFIG.description}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* SDK Info Banner */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex gap-6 text-sm">
                <Link 
                  href={SDK_CONFIG.github.url}
                  target="_blank"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span>{SDK_CONFIG.github.owner}/{SDK_CONFIG.github.repo}</span>
                </Link>
                <Link 
                  href={SDK_CONFIG.pypi.url}
                  target="_blank"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="text-lg">🐍</span>
                  <span>{SDK_CONFIG.pypi.package}</span>
                </Link>
              </div>
              <RefreshCountdown lastUpdated={lastUpdated} refreshInterval={300} />
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* GitHub Metrics */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">📊 GitHub Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <MetricsCard 
            title="Stars" 
            value={github?.stars ?? '--'} 
            icon="⭐"
            loading={!github && !error}
          />
          <MetricsCard 
            title="Forks" 
            value={github?.forks ?? '--'} 
            icon="🍴"
            loading={!github && !error}
          />
          <MetricsCard 
            title="Active Forks" 
            value={github?.activeForks ?? '--'} 
            icon="🔥"
            subtitle="with commits"
            loading={!github && !error}
          />
          <MetricsCard 
            title="Contributors" 
            value={github?.totalContributors ?? '--'} 
            icon="👥"
            subtitle="total"
            loading={!github && !error}
          />
          <MetricsCard 
            title="Repeat Contributors" 
            value={github?.repeatContributors ?? '--'} 
            icon="🔁"
            subtitle="2+ commits"
            loading={!github && !error}
          />
          <MetricsCard 
            title="Open Issues" 
            value={github?.openIssues ?? '--'} 
            icon="🐛"
            loading={!github && !error}
          />
        </div>

        {/* PyPI Metrics */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">🐍 PyPI Downloads</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricsCard 
            title="Weekly Downloads" 
            value={pypi?.weeklyDownloads ?? '--'} 
            icon="📈"
            highlight
            loading={!pypi && !error}
          />
          <MetricsCard 
            title="Daily Downloads" 
            value={pypi?.dailyDownloads ?? '--'} 
            icon="📅"
            loading={!pypi && !error}
          />
          <MetricsCard 
            title="Last 30 Days" 
            value={pypi?.monthlyDownloads ?? '--'} 
            icon="📆"
            loading={!pypi && !error}
          />
          <MetricsCard 
            title="All Time" 
            value={pypi?.allTimeDownloads ?? '--'} 
            icon="🏆"
            loading={!pypi && !error}
          />
        </div>

        {/* Charts Placeholder */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">📈 Trends Over Time</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">GitHub Stars Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground">
                📈 Coming soon - Historical data collection required
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">PyPI Weekly Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground">
                📊 Coming soon - Historical data collection required
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 text-center text-sm text-muted-foreground">
        OpenHands Software Agent SDK Dashboard • Data from GitHub &amp; PyPI APIs
      </footer>
    </div>
  );
}
