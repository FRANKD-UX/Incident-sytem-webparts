export type PermissionAction = 'tickets.read' | 'tickets.write' | 'tickets.assign' | 'admin.filters.manage' | 'reports.read';

export interface PermissionDecision {
  action: PermissionAction;
  allowed: boolean;
  reason?: string;
}
