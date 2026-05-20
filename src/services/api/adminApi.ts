import { FilterState } from '../../models/FilterState';
import { ApiClient } from './httpClient';
import { mockFilters } from './mockData';

export const getSavedFilters = async (client: ApiClient, useMockData: boolean): Promise<FilterState[]> => {
  if (useMockData) {
    return mockFilters;
  }

  return client.get<FilterState[]>('/admin/filters');
};
