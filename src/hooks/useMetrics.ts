import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { metricsEngine, type MetricsFilters } from '../lib/metricsEngine';

export type TimeFilter = '7d' | '30d' | '90d' | 'all';

export function useMetrics(timeFilter: TimeFilter = '30d') {
  const { currentOrganization } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, [currentOrganization, timeFilter]);

  const getDateRange = (filter: TimeFilter) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (filter) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'all':
        startDate = new Date('2020-01-01');
        break;
    }

    return { startDate, endDate };
  };

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const dateRange = getDateRange(timeFilter);
      const filters: MetricsFilters = {
        organizationId: currentOrganization?.id,
        dateRange,
      };

      const data = await metricsEngine.aggregateAllMetrics(filters);
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
      setError('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadMetrics();
  };

  return {
    loading,
    metrics,
    error,
    refresh,
  };
}

export function useConversionMetrics(timeFilter: TimeFilter = '30d') {
  const { currentOrganization } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    loadMetrics();
  }, [currentOrganization, timeFilter]);

  const getDateRange = (filter: TimeFilter) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (filter) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'all':
        startDate = new Date('2020-01-01');
        break;
    }

    return { startDate, endDate };
  };

  const loadMetrics = async () => {
    setLoading(true);

    try {
      const dateRange = getDateRange(timeFilter);
      const filters: MetricsFilters = {
        organizationId: currentOrganization?.id,
        dateRange,
      };

      const data = await metricsEngine.calculateConversionRate(filters);
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load conversion metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, metrics };
}

export function useRevenueMetrics() {
  const { currentOrganization } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    loadMetrics();
  }, [currentOrganization]);

  const loadMetrics = async () => {
    setLoading(true);

    try {
      const filters: MetricsFilters = {
        organizationId: currentOrganization?.id,
      };

      const data = await metricsEngine.calculateMRR(filters);
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load revenue metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, metrics };
}

export function useProjectMetrics(timeFilter: TimeFilter = '30d') {
  const { currentOrganization } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    loadMetrics();
  }, [currentOrganization, timeFilter]);

  const getDateRange = (filter: TimeFilter) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (filter) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'all':
        startDate = new Date('2020-01-01');
        break;
    }

    return { startDate, endDate };
  };

  const loadMetrics = async () => {
    setLoading(true);

    try {
      const dateRange = getDateRange(timeFilter);
      const filters: MetricsFilters = {
        organizationId: currentOrganization?.id,
        dateRange,
      };

      const data = await metricsEngine.calculateProjectVelocity(filters);
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load project metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, metrics };
}
