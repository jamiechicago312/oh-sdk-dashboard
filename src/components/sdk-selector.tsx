'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { type SdkEntry } from '@/lib/sdk-config';

interface SdkSelectorProps {
  sdks: SdkEntry[];
  currentSdkId: string;
}

/**
 * Dropdown that lets users switch between tracked SDKs.
 * Renders nothing when only one SDK is configured.
 * Selection is persisted in the `?sdk=` URL search param.
 */
export function SdkSelector({ sdks, currentSdkId }: SdkSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // No selector needed when there is only one SDK
  if (sdks.length <= 1) return null;

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sdk', event.target.value);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sdk-selector" className="text-sm font-medium text-indigo-100">
        SDK:
      </label>
      <select
        id="sdk-selector"
        value={currentSdkId}
        onChange={handleChange}
        aria-label="Select SDK"
        className="rounded-md border border-indigo-400 bg-indigo-700 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white"
      >
        {sdks.map((sdk) => (
          <option key={sdk.id} value={sdk.id}>
            {sdk.name}
          </option>
        ))}
      </select>
    </div>
  );
}
