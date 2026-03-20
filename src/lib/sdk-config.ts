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
   * All queries are scoped to package-dependency declaration files so that
   * documentation, markdown notes, and unrelated source files do not inflate
   * the count.  Three complementary signals cover the two common Python
   * package managers:
   *
   * 1. pip / uv / conda  — "openhands-sdk" in requirements.txt
   * 2. Poetry / Hatch / PDM — "openhands-sdk" in pyproject.toml
   * 3. Poetry git-source — "software-agent-sdk" in pyproject.toml
   *    (Poetry uses the GitHub repo name, not the PyPI dist name, when the
   *     dependency is declared as a git source)
   *
   * All three exclude the OpenHands org so the SDK's own repo and sibling
   * projects are not counted.
   */
  dependencySearches: [
    '"openhands-sdk" filename:requirements.txt -org:OpenHands',
    '"openhands-sdk" filename:pyproject.toml -org:OpenHands',
    '"software-agent-sdk" filename:pyproject.toml -org:OpenHands',
  ],
} as const;
