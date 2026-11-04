import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../lib/api.js';

export function useApi() {
  const { clearUser } = useAuth();
  const controller = useRef(null);

  useEffect(() => {
    const current = new AbortController();
    controller.current = current;
    return () => current.abort();
  }, []);

  return useCallback(
    async (path, options) => {
      try {
        return await apiFetch(path, { ...options, signal: controller.current.signal });
      } catch (error) {
        if (error.name === 'AbortError') return new Promise(() => {});
        if (error.status === 401) clearUser();
        throw error;
      }
    },
    [clearUser],
  );
}
