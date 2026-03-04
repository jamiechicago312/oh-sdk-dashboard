const GITHUB_API_BASE = 'https://api.github.com';

interface GitHubRepoInfo {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count: number;
}

interface GitHubContributor {
  login: string;
  contributions: number;
}

interface GitHubFork {
  full_name: string;
  pushed_at: string;
  created_at: string;
}

export interface RepoMetrics {
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
}

export interface ContributorMetrics {
  totalContributors: number;
  repeatContributors: number; // Contributors with 2+ contributions
}

export interface ForkMetrics {
  totalForks: number;
  activeForks: number; // Forks with commits after fork creation
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'SDK-Success-Dashboard',
  };
  
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  
  return headers;
}

async function fetchWithRateLimit<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: getHeaders() });
  
  if (response.status === 403) {
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    
    if (rateLimitRemaining === '0') {
      const resetDate = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000) : null;
      throw new Error(`GitHub API rate limit exceeded. Resets at: ${resetDate?.toISOString()}`);
    }
  }
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

async function fetchAllPages<T>(baseUrl: string, perPage = 100): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  
  while (true) {
    const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}per_page=${perPage}&page=${page}`;
    const data = await fetchWithRateLimit<T[]>(url);
    
    if (data.length === 0) break;
    
    results.push(...data);
    
    if (data.length < perPage) break;
    
    page++;
  }
  
  return results;
}

/**
 * Fetch basic repository metrics (stars, forks, issues, watchers)
 */
export async function getRepoMetrics(owner: string, repo: string): Promise<RepoMetrics> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;
  const data = await fetchWithRateLimit<GitHubRepoInfo>(url);
  
  return {
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    watchers: data.subscribers_count,
  };
}

/**
 * Fetch contributor metrics
 */
export async function getContributorMetrics(owner: string, repo: string): Promise<ContributorMetrics> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors`;
  const contributors = await fetchAllPages<GitHubContributor>(url);
  
  const repeatContributors = contributors.filter(c => c.contributions >= 2).length;
  
  return {
    totalContributors: contributors.length,
    repeatContributors,
  };
}

/**
 * Fetch fork metrics including active forks (forks with commits after creation)
 */
export async function getForkMetrics(owner: string, repo: string): Promise<ForkMetrics> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/forks?sort=newest`;
  const forks = await fetchAllPages<GitHubFork>(url);
  
  // Active fork = pushed_at is after created_at (has commits beyond the fork point)
  const activeForks = forks.filter(fork => {
    const pushedAt = new Date(fork.pushed_at);
    const createdAt = new Date(fork.created_at);
    return pushedAt > createdAt;
  }).length;
  
  return {
    totalForks: forks.length,
    activeForks,
  };
}

/**
 * Fetch all GitHub metrics for a repository
 */
export async function getAllGitHubMetrics(owner: string, repo: string) {
  const [repoMetrics, contributorMetrics, forkMetrics] = await Promise.all([
    getRepoMetrics(owner, repo),
    getContributorMetrics(owner, repo),
    getForkMetrics(owner, repo),
  ]);
  
  return {
    stars: repoMetrics.stars,
    forks: repoMetrics.forks,
    openIssues: repoMetrics.openIssues,
    watchers: repoMetrics.watchers,
    totalContributors: contributorMetrics.totalContributors,
    repeatContributors: contributorMetrics.repeatContributors,
    activeForks: forkMetrics.activeForks,
  };
}
