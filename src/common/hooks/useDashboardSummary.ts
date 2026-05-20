import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { DashboardSummary } from '../../models/DashboardSummary';
import { getDashboardSummary } from '../../services/api/dashboardApi';
import { useApiRuntime } from './useApiContext';

export const useDashboardSummary = (): UseQueryResult<DashboardSummary> => {
  const { client, config } = useApiRuntime();
  return useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => getDashboardSummary(client, config.useMockData)
  });
};
