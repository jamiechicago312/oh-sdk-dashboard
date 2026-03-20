export const SDK_CONFIG = {
  name: 'OpenHands Software Agent SDK',
  description: 'A clean, modular SDK for building AI agents with OpenHands V1',
  github: {
    owner: 'OpenHands',
    repo: 'software-agent-sdk',
    url: 'https://github.com/OpenHands/software-agent-sdk',
  },
  pypi: {
    package: 'openhands-sdk',
    url: 'https://pypi.org/project/openhands-sdk/',
  },
  npm: null, // Python SDK - no npm package
  /**
   * GitHub code-search queries used to count dependent repositories.
   *
   * Two complementary signals:
   * 1. Repos that declare the SDK as a dependency (any package manager,
   *    including Poetry which uses the dist-name "software-agent-sdk").
   * 2. Repos that import directly from the SDK's Python module path.
   *
   * Both queries exclude the OpenHands org and the SDK's own repo to avoid
   * self-referential noise.
   */
  dependencySearches: [
    '"software-agent-sdk" -org:OpenHands -is:fork',
    '"from openhands.sdk" -repo:OpenHands/OpenHands-CLI -repo:OpenHands/software-agent-sdk',
  ],
} as const;
