import { useCallback, useEffect, useState } from 'react';
import { lastMonths } from '../lib/months.js';
import { useApi } from './useApi.js';

const EMPTY = { summary: { total: 0, byCategory: [], series: [] }, budget: 0, recent: [], recentTotal: 0 };

export function useSummary() {
  const request = useApi();
  const [data, setData] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [month] = lastMonths(1);
    try {
      const [summary, budget, recent] = await Promise.all([
        request(`/summary?month=${month}`),
        request('/budget'),
        request(`/expenses?limit=5&from=${month}-01`),
      ]);
      setData({ summary, budget: budget.budget.monthlyAmount, recent: recent.items, recentTotal: recent.total });
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, [request]);

  useEffect(() => {
    load();
  }, [load]);

  const setBudget = useCallback((budget) => setData((current) => ({ ...current, budget })), []);

  return { ...data, error, setBudget };
}
