import { ApiClient } from '../api/httpClient';
import { PermissionAction, PermissionDecision } from './permissionTypes';

export const getPermissionDecision = async (
  client: ApiClient,
  useMockData: boolean,
  action: PermissionAction
): Promise<PermissionDecision> => {
  if (useMockData) {
    return { action, allowed: true };
  }

  return client.get<PermissionDecision>('/permissions/decision', { params: { action } });
};
