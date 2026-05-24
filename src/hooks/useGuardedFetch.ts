import { useRef, useState, useCallback } from 'react';

/**
 * Wraps an async function with a concurrency guard and loading state.
 *
 * @param fetchFn - The async function to execute.
 * @param tag - Optional label for error logging (default: 'useGuardedFetch').
 * @returns An object containing the stable `execute` callback and `isLoading` state.
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
