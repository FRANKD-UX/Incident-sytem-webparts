import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { FilterState } from '../../models/FilterState';
import { getSavedFilters } from '../../services/api/adminApi';
import { useApiRuntime } from './useApiContext';

export const useSavedFilters = (): UseQueryResult<FilterState[]> => {
  const { client, config } = useApiRuntime();
  return useQuery({
    queryKey: ['savedFilters'],
    queryFn: () => getSavedFilters(client, config.useMockData)
  });
};
