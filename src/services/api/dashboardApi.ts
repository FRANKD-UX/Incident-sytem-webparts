import { DashboardSummary } from '../../models/DashboardSummary';
import { ApiClient } from './httpClient';
import { mockDashboardSummary } from './mockData';

export const getDashboardSummary = async (client: ApiClient, useMockData: boolean): Promise<DashboardSummary> => {
  if (useMockData) {
    return mockDashboardSummary;
  }

  return client.get<DashboardSummary>('/dashboard/summary');
};
