/**
 * useGuardedFetch.ts
 *
 * Reusable hook that wraps an async fetch-and-sync operation with:
 *   - A ref guard to prevent concurrent executions
 *   - An `isLoading` state for spinner / refreshing indicators
 *   - A stable `execute` callback safe to pass to onRefresh, useFocusEffect, etc.
 */

import { useRef, useState, useCallback } from 'react';

/**
 * @param fetchFn  The async work to perform (fetch → upsert, etc.).
 *                 Receives no arguments — close over whatever you need.
 * @param tag      Optional label for console.error logs.
 */
export function useGuardedFetch(
  fetchFn: () => Promise<void>,
  tag: string = 'useGuardedFetch',
) {
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false);

  const execute = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      await fetchFn();
    } catch (error) {
      console.error(`[${tag}] failed:`, error);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [fetchFn, tag]);

  return { execute, isLoading };
}
