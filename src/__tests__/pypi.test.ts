import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPyPIDownloads, getPyPIDownloadsSafe, parseClickPyMetrics } from '../lib/pypi';

const clickPyHtml = `
["$","p",null,{"className":"text-xl mr-2 font-bold","children":"103K"}]
["$","p",null,{"className":"text-slate-200 text-center","children":"last day"}]
["$","p",null,{"className":"text-xl mr-2 font-bold","children":"594K"}]
["$","p",null,{"className":"text-slate-200 text-center","children":"last week"}]
["$","p",null,{"className":"text-xl mr-2 font-bold","children":"1.4M"}]
["$","p",null,{"className":"text-slate-200 text-center","children":"last month"}]
["$","p",null,{"className":"text-xl font-bold","children":"2.9M"}]
["$","p",null,{"className":"text-slate-200 md:text-center","children":"total"}]
`;

const zeroMetricsHtml = `
["$","p",null,{"children":"0"}]
["$","p",null,{"children":"last day"}]
["$","p",null,{"children":"0"}]
["$","p",null,{"children":"last week"}]
["$","p",null,{"children":"0"}]
["$","p",null,{"children":"last month"}]
["$","p",null,{"children":"0"}]
["$","p",null,{"children":"total"}]
`;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('parseClickPyMetrics', () => {
  it('parses abbreviated ClickPy download counts', () => {
    expect(parseClickPyMetrics(clickPyHtml, 'openhands-sdk')).toEqual({
      dailyDownloads: 103_000,
      weeklyDownloads: 594_000,
      monthlyDownloads: 1_400_000,
      allTimeDownloads: 2_900_000,
      package: 'openhands-sdk',
    });
  });
});

describe('getPyPIDownloads', () => {
  it('fetches metrics from the ClickPy dashboard instead of pypistats', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(clickPyHtml, { status: 200, statusText: 'OK' })
    );

    await expect(getPyPIDownloads('openhands-sdk')).resolves.toEqual({
      dailyDownloads: 103_000,
      weeklyDownloads: 594_000,
      monthlyDownloads: 1_400_000,
      allTimeDownloads: 2_900_000,
      package: 'openhands-sdk',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://clickpy.clickhouse.com/dashboard/openhands-sdk',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: expect.stringContaining('text/html'),
          'User-Agent': expect.stringContaining('OpenHands SDK Dashboard'),
        }),
      })
    );
  });
});

describe('getPyPIDownloadsSafe', () => {
  it('returns null for packages missing from PyPI when ClickPy reports zero metrics', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(zeroMetricsHtml, { status: 200, statusText: 'OK' }))
      .mockResolvedValueOnce(new Response('', { status: 404, statusText: 'Not Found' }));

    await expect(getPyPIDownloadsSafe('missing-package')).resolves.toBeNull();
  });

  it('does not perform a PyPI existence lookup when ClickPy already has metrics', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(clickPyHtml, { status: 200, statusText: 'OK' })
    );

    const result = await getPyPIDownloadsSafe('openhands-sdk');

    expect(result?.weeklyDownloads).toBe(594_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
