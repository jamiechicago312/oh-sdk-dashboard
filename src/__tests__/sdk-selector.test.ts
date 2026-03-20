import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

function readSrc(relativePath: string): string {
  return readFileSync(join(__dirname, '..', relativePath), 'utf-8');
}

// ---------------------------------------------------------------------------
// sdk-config.ts — multi-SDK support
// ---------------------------------------------------------------------------
describe('SDK selector — sdk-config.ts', () => {
  const src = readSrc('lib/sdk-config.ts');

  it('exports SdkEntry interface', () => {
    expect(src).toContain('export interface SdkEntry');
  });

  it('SdkEntry has an id field', () => {
    expect(src).toMatch(/id:\s*string/);
  });

  it('SdkEntry has github, pypi, and npm fields', () => {
    expect(src).toContain('github:');
    expect(src).toContain('pypi:');
    expect(src).toContain('npm:');
  });

  it('exports SDK_LIST array', () => {
    expect(src).toContain('export const SDK_LIST');
    expect(src).toContain('SdkEntry[]');
  });

  it('SDK_LIST contains at least two entries', () => {
    const entries = (src.match(/\{\s*id:/g) || []).length;
    expect(entries).toBeGreaterThanOrEqual(2);
  });

  it('exports findSdkById helper', () => {
    expect(src).toContain('export function findSdkById');
    expect(src).toContain('SDK_LIST.find');
  });

  it('SDK_CONFIG is still exported for backward compatibility', () => {
    expect(src).toContain('export const SDK_CONFIG');
  });
});

// ---------------------------------------------------------------------------
// sdk-selector.tsx — client component
// ---------------------------------------------------------------------------
describe('SDK selector — sdk-selector.tsx', () => {
  const src = readSrc('components/sdk-selector.tsx');

  it("is a 'use client' component", () => {
    expect(src).toContain("'use client'");
  });

  it('exports SdkSelector component', () => {
    expect(src).toContain('export function SdkSelector');
  });

  it('accepts sdks array and currentSdkId props', () => {
    expect(src).toContain('sdks:');
    expect(src).toContain('currentSdkId:');
  });

  it('returns null when only one SDK is configured', () => {
    expect(src).toContain('sdks.length <= 1');
    expect(src).toContain('return null');
  });

  it('uses useRouter from next/navigation', () => {
    expect(src).toContain('useRouter');
    expect(src).toContain("from 'next/navigation'");
  });

  it('uses useSearchParams from next/navigation', () => {
    expect(src).toContain('useSearchParams');
  });

  it('updates the ?sdk= URL param on selection change', () => {
    expect(src).toContain("params.set('sdk'");
    expect(src).toContain('router.push');
  });

  it('renders a <select> element with an aria-label', () => {
    expect(src).toContain('<select');
    expect(src).toContain('aria-label');
  });

  it('renders an <option> for each SDK', () => {
    expect(src).toContain('<option');
    expect(src).toContain('sdk.id');
    expect(src).toContain('sdk.name');
  });

  it('has an accessible label element tied to the select', () => {
    expect(src).toContain('<label');
    expect(src).toContain('htmlFor');
  });
});

// ---------------------------------------------------------------------------
// page.tsx — uses SDK selector and multi-SDK data fetching
// ---------------------------------------------------------------------------
describe('SDK selector — page.tsx', () => {
  const src = readSrc('app/page.tsx');

  it('imports SDK_LIST and findSdkById', () => {
    expect(src).toContain('SDK_LIST');
    expect(src).toContain('findSdkById');
  });

  it('imports SdkSelector component', () => {
    expect(src).toContain("import { SdkSelector }");
  });

  it('reads ?sdk= from searchParams', () => {
    expect(src).toContain('searchParams');
    expect(src).toContain("searchParams?.sdk");
  });

  it('falls back to SDK_LIST[0] when no sdk param is present', () => {
    expect(src).toContain('SDK_LIST[0]');
  });

  it('renders SdkSelector with the SDK list', () => {
    expect(src).toContain('<SdkSelector');
    expect(src).toContain('sdks={SDK_LIST}');
  });

  it('passes sdkRepo to TrendCharts', () => {
    expect(src).toContain('sdkRepo={sdkRepo}');
  });

  it('calls getMetrics with the selected SDK', () => {
    expect(src).toContain('getMetrics(selectedSdk)');
  });

  it('passes selectedSdk github repo to getStoredDependentRepos', () => {
    expect(src).toContain('getStoredDependentRepos(githubRepo)');
  });

  it('conditionally renders PyPI section based on sdk.pypi', () => {
    expect(src).toContain('selectedSdk.pypi');
  });
});

// ---------------------------------------------------------------------------
// trend-charts.tsx — accepts sdkRepo prop
// ---------------------------------------------------------------------------
describe('SDK selector — trend-charts.tsx', () => {
  const src = readSrc('components/trend-charts.tsx');

  it('TrendChartsProps includes sdkRepo', () => {
    expect(src).toContain('sdkRepo');
  });

  it('passes sdk param to the history API fetch', () => {
    expect(src).toContain("params.set('sdk', sdkRepo)");
  });

  it('includes sdkRepo in the useEffect dependency array', () => {
    expect(src).toContain('[period, sdkRepo]');
  });
});

// ---------------------------------------------------------------------------
// snapshots.ts — getStoredDependentRepos accepts optional githubRepo
// ---------------------------------------------------------------------------
describe('SDK selector — snapshots.ts', () => {
  const src = readSrc('lib/snapshots.ts');

  it('getStoredDependentRepos accepts an optional githubRepo parameter', () => {
    expect(src).toContain('githubRepo?:');
    expect(src).toContain('getStoredDependentRepos(');
  });

  it('looks up SDK by githubRepo when the param is provided', () => {
    expect(src).toContain('githubRepo');
    expect(src).toContain('eq(sdks.githubRepo');
  });

  it('falls back to getOrCreateSDK when githubRepo is omitted', () => {
    expect(src).toContain('getOrCreateSDK()');
  });
});
