import { useState, useEffect, useRef } from 'react';
import { Logger } from '../lib/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Global Memory Cache mapping query keys to payload entries
// 3-minute default TTL prevents stale active records while heavily optimizing rapid route transitions
const GLOBAL_QUERY_CACHE = new Map<string, CacheEntry<any>>();

export function useCachedQuery<T>(
  queryKey: string | null,
  queryFn: () => Promise<T>,
  ttlMilliseconds: number = 180000 // 3 minutes
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!queryKey) {
      if (isMounted.current) setLoading(false);
      return;
    }

    const executeSWR = async () => {
      try {
        if (isMounted.current) setLoading(true);

        const cached = GLOBAL_QUERY_CACHE.get(queryKey);
        const isFresh = cached && (Date.now() - cached.timestamp < ttlMilliseconds);

        if (isFresh && cached) {
          if (isMounted.current) {
            setData(cached.data);
            setLoading(false);
          }
          return;
        }

        // Cache miss or stale -> Fetch over network
        const result = await queryFn();

        GLOBAL_QUERY_CACHE.set(queryKey, {
          data: result,
          timestamp: Date.now()
        });

        if (isMounted.current) {
          setData(result);
          setError(null);
        }
      } catch (err: any) {
        Logger.error(`[SWR] Query failed for key: ${queryKey}`, err);
        if (isMounted.current) setError(err);
      } finally {
         if (isMounted.current) setLoading(false);
      }
    };

    executeSWR();
  }, [queryKey]);

  return { data, loading, error };
}

/**
 * Utility to force evict a specific cache key (e.g. after a mutation)
 */
export function invalidateQueryCache(queryKey: string) {
  GLOBAL_QUERY_CACHE.delete(queryKey);
}
