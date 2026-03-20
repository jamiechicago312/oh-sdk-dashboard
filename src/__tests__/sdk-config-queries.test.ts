import { describe, it, expect } from 'vitest';
import { SDK_CONFIG } from '../lib/sdk-config';

/**
 * GitHub Search API uses `-qualifier:value` for negation (e.g. `-repo:owner/repo`).
 * Using `NOT qualifier:value` is invalid and silently returns wrong results.
 * These tests guard against that mistake being re-introduced.
 */
describe('SDK_CONFIG.dependencySearches', () => {
  it('contains at least one query', () => {
    expect(SDK_CONFIG.dependencySearches.length).toBeGreaterThan(0);
  });

  it.each(SDK_CONFIG.dependencySearches)(
    'query "%s" does not use NOT as a qualifier negation operator',
    (query) => {
      // Match "NOT <qualifier>:<value>" patterns — these are invalid GitHub search syntax.
      // Qualifier negation must use the "-qualifier:value" form.
      const invalidNot = /\bNOT\s+\w+:/;
      expect(invalidNot.test(query)).toBe(false);
    }
  );

  it('excludes the OpenHands org from the first query', () => {
    expect(SDK_CONFIG.dependencySearches[0]).toContain('-org:OpenHands');
  });

  it('excludes the SDK repo from the second query using correct -repo: syntax', () => {
    const secondQuery = SDK_CONFIG.dependencySearches[1];
    expect(secondQuery).toContain('-repo:OpenHands/software-agent-sdk');
    // Must NOT use the invalid "NOT repo:" form
    expect(secondQuery).not.toMatch(/\bNOT\s+repo:/);
  });

  it('excludes the OpenHands-CLI repo from the second query using correct -repo: syntax', () => {
    const secondQuery = SDK_CONFIG.dependencySearches[1];
    expect(secondQuery).toContain('-repo:OpenHands/OpenHands-CLI');
    expect(secondQuery).not.toMatch(/\bNOT\s+repo:/);
  });

  it('all queries use -qualifier: syntax for every exclusion', () => {
    for (const query of SDK_CONFIG.dependencySearches) {
      // Every negation should use the dash prefix form, not the NOT keyword form
      const notQualifierCount = (query.match(/\bNOT\s+\w+:/g) ?? []).length;
      expect(notQualifierCount).toBe(0);
    }
  });
});
