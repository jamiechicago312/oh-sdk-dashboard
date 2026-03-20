export interface SdkEntry {
  /** Unique key for this SDK, also used as the `?sdk=` URL param value. */
  id: string;
  name: string;
  description: string;
  github: {
    owner: string;
    repo: string;
    url: string;
  };
  pypi: {
    package: string;
    url: string;
  } | null;
  npm: {
    package: string;
    url: string;
  } | null;
  /** GitHub code-search queries used to count dependent repositories. */
  dependencySearches: string[];
}

/**
 * All SDKs tracked by the dashboard.
 * Add entries here to make new SDKs available in the SDK selector.
 * The first entry is the default.
 */
export const SDK_LIST: SdkEntry[] = [
  {
    id: 'OpenHands/software-agent-sdk',
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
    npm: null,
    dependencySearches: [
      '"software-agent-sdk" -org:OpenHands -is:fork',
      '"from openhands.sdk" NOT repo:OpenHands/OpenHands-CLI NOT repo:OpenHands/software-agent-sdk',
    ],
  },
  {
    id: 'All-Hands-AI/OpenHands',
    name: 'OpenHands',
    description: 'Code Less, Make More — open-source AI software development agent',
    github: {
      owner: 'All-Hands-AI',
      repo: 'OpenHands',
      url: 'https://github.com/All-Hands-AI/OpenHands',
    },
    pypi: {
      package: 'openhands-ai',
      url: 'https://pypi.org/project/openhands-ai/',
    },
    npm: null,
    dependencySearches: [
      '"openhands-ai" -org:All-Hands-AI -is:fork',
    ],
  },
];

/** Look up an SDK by its id (owner/repo string). Returns undefined if not found. */
export function findSdkById(id: string): SdkEntry | undefined {
  return SDK_LIST.find((sdk) => sdk.id === id);
}

/**
 * Legacy single-SDK config — kept for backward compatibility.
 * New code should prefer SDK_LIST and findSdkById.
 */
export const SDK_CONFIG = SDK_LIST[0];
