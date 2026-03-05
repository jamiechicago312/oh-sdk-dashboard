import { db } from './db';
import { sdks, metricsSnapshots } from './schema';
import { eq, and, desc } from 'drizzle-orm';
import { getAllGitHubMetrics } from './github';
import { getPyPIDownloads } from './pypi';
import { SDK_CONFIG } from './sdk-config';

export interface SnapshotData {
  githubStars: number;
  githubForks: number;
  githubActiveForks: number;
  githubContributors: number;
  githubRepeatContributors: number;
  githubDependentRepos: number | null;
  npmDownloadsWeekly: number | null;
  pypiDownloadsWeekly: number;
}

/**
 * Get or create the SDK record in the database
 */
export async function getOrCreateSDK(): Promise<number> {
  // Check if SDK already exists
  const existing = await db
    .select()
    .from(sdks)
    .where(eq(sdks.githubRepo, `${SDK_CONFIG.github.owner}/${SDK_CONFIG.github.repo}`))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  // Create new SDK record
  const result = await db
    .insert(sdks)
    .values({
      name: SDK_CONFIG.name,
      githubRepo: `${SDK_CONFIG.github.owner}/${SDK_CONFIG.github.repo}`,
      npmPackage: null,
      pypiPackage: SDK_CONFIG.pypi.package,
    })
    .returning({ id: sdks.id });

  return result[0].id;
}

/**
 * Collect current metrics from all APIs
 */
export async function collectCurrentMetrics(): Promise<SnapshotData> {
  const [github, pypi] = await Promise.all([
    getAllGitHubMetrics(SDK_CONFIG.github.owner, SDK_CONFIG.github.repo),
    getPyPIDownloads(SDK_CONFIG.pypi.package),
  ]);

  return {
    githubStars: github.stars,
    githubForks: github.forks,
    githubActiveForks: github.activeForks,
    githubContributors: github.totalContributors,
    githubRepeatContributors: github.repeatContributors,
    githubDependentRepos: null, // Not implemented yet
    npmDownloadsWeekly: null, // Python SDK only
    pypiDownloadsWeekly: pypi.weeklyDownloads,
  };
}

/**
 * Save a daily snapshot to the database.
 * Uses upsert logic to ensure only one snapshot per SDK per day.
 */
export async function saveDailySnapshot(
  sdkId: number,
  data: SnapshotData,
  date?: Date
): Promise<{ isNew: boolean; snapshotId: number }> {
  const snapshotDate = date || new Date();
  const dateString = snapshotDate.toISOString().split('T')[0]; // YYYY-MM-DD

  // Check if snapshot already exists for this date
  const existing = await db
    .select()
    .from(metricsSnapshots)
    .where(
      and(
        eq(metricsSnapshots.sdkId, sdkId),
        eq(metricsSnapshots.date, dateString)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing snapshot
    await db
      .update(metricsSnapshots)
      .set({
        githubStars: data.githubStars,
        githubForks: data.githubForks,
        githubActiveForks: data.githubActiveForks,
        githubContributors: data.githubContributors,
        githubRepeatContributors: data.githubRepeatContributors,
        githubDependentRepos: data.githubDependentRepos,
        npmDownloadsWeekly: data.npmDownloadsWeekly,
        pypiDownloadsWeekly: data.pypiDownloadsWeekly,
      })
      .where(eq(metricsSnapshots.id, existing[0].id));

    return { isNew: false, snapshotId: existing[0].id };
  }

  // Insert new snapshot
  const result = await db
    .insert(metricsSnapshots)
    .values({
      sdkId,
      date: dateString,
      githubStars: data.githubStars,
      githubForks: data.githubForks,
      githubActiveForks: data.githubActiveForks,
      githubContributors: data.githubContributors,
      githubRepeatContributors: data.githubRepeatContributors,
      githubDependentRepos: data.githubDependentRepos,
      npmDownloadsWeekly: data.npmDownloadsWeekly,
      pypiDownloadsWeekly: data.pypiDownloadsWeekly,
    })
    .returning({ id: metricsSnapshots.id });

  return { isNew: true, snapshotId: result[0].id };
}

/**
 * Collect and save today's snapshot (main entry point)
 */
export async function collectAndSaveSnapshot(): Promise<{
  success: boolean;
  isNew: boolean;
  snapshotId: number;
  date: string;
}> {
  const sdkId = await getOrCreateSDK();
  const metrics = await collectCurrentMetrics();
  const today = new Date();
  const { isNew, snapshotId } = await saveDailySnapshot(sdkId, metrics, today);

  return {
    success: true,
    isNew,
    snapshotId,
    date: today.toISOString().split('T')[0],
  };
}

/**
 * Get historical snapshots for an SDK
 */
export async function getHistoricalSnapshots(
  sdkId: number,
  days: number = 30
): Promise<typeof metricsSnapshots.$inferSelect[]> {
  return db
    .select()
    .from(metricsSnapshots)
    .where(eq(metricsSnapshots.sdkId, sdkId))
    .orderBy(desc(metricsSnapshots.date))
    .limit(days);
}

/**
 * Get the latest snapshot for an SDK
 */
export async function getLatestSnapshot(
  sdkId: number
): Promise<typeof metricsSnapshots.$inferSelect | null> {
  const result = await db
    .select()
    .from(metricsSnapshots)
    .where(eq(metricsSnapshots.sdkId, sdkId))
    .orderBy(desc(metricsSnapshots.date))
    .limit(1);

  return result[0] || null;
}
