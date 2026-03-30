const CLICKPY_DASHBOARD_BASE = 'https://clickpy.clickhouse.com/dashboard';
const PYPI_JSON_API_BASE = 'https://pypi.org/pypi';
const CLICKPY_HEADERS = {
  Accept: 'text/html,application/xhtml+xml',
  'User-Agent': 'OpenHands SDK Dashboard (+https://github.com/OpenHands/sdk-dashboard)',
};

export interface PyPIMetrics {
  weeklyDownloads: number;
  dailyDownloads: number;
  monthlyDownloads: number;
  allTimeDownloads: number;
  package: string;
}

function parseAbbreviatedNumber(value: string): number {
  const normalized = value.replace(/,/g, '').trim();
  const match = normalized.match(/^(\d+(?:\.\d+)?)([KMB])?$/i);

  if (!match) {
    throw new Error(`Unable to parse ClickPy metric value: ${value}`);
  }

  const [, amount, suffix] = match;
  const multiplier =
    suffix?.toUpperCase() === 'K'
      ? 1_000
      : suffix?.toUpperCase() === 'M'
        ? 1_000_000
        : suffix?.toUpperCase() === 'B'
          ? 1_000_000_000
          : 1;

  return Math.round(Number(amount) * multiplier);
}

function extractMetricValue(html: string, label: string): number {
  const labelPattern = label.replace(/\s+/g, '\\s+');
  const match = html.match(
    new RegExp(`"children":"([\\d.,]+(?:[KMB])?)"[\\s\\S]{0,200}"children":"${labelPattern}"`, 'i')
  );

  if (!match) {
    throw new Error(`Unable to find ClickPy ${label} metric in dashboard response`);
  }

  return parseAbbreviatedNumber(match[1]);
}

export function parseClickPyMetrics(html: string, packageName: string): PyPIMetrics {
  const normalizedHtml = html.replace(/\\"/g, '"');

  return {
    dailyDownloads: extractMetricValue(normalizedHtml, 'last day'),
    weeklyDownloads: extractMetricValue(normalizedHtml, 'last week'),
    monthlyDownloads: extractMetricValue(normalizedHtml, 'last month'),
    allTimeDownloads: extractMetricValue(normalizedHtml, 'total'),
    package: packageName,
  };
}

async function packageExistsOnPyPI(packageName: string): Promise<boolean> {
  const response = await fetch(`${PYPI_JSON_API_BASE}/${encodeURIComponent(packageName)}/json`, {
    headers: { Accept: 'application/json' },
  });

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    throw new Error(`PyPI package lookup failed: ${response.status} ${response.statusText}`);
  }

  return true;
}

/**
 * Fetch download counts for a PyPI package via ClickHouse-backed ClickPy data.
 */
export async function getPyPIDownloads(packageName: string): Promise<PyPIMetrics> {
  const response = await fetch(`${CLICKPY_DASHBOARD_BASE}/${encodeURIComponent(packageName)}`, {
    headers: CLICKPY_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`ClickPy dashboard error: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  return parseClickPyMetrics(html, packageName);
}

/**
 * Fetch downloads, returns null if package doesn't exist
 */
export async function getPyPIDownloadsSafe(packageName: string): Promise<PyPIMetrics | null> {
  const metrics = await getPyPIDownloads(packageName);

  if (
    metrics.dailyDownloads === 0 &&
    metrics.weeklyDownloads === 0 &&
    metrics.monthlyDownloads === 0 &&
    metrics.allTimeDownloads === 0
  ) {
    const exists = await packageExistsOnPyPI(packageName);
    if (!exists) {
      return null;
    }
  }

  return metrics;
}
