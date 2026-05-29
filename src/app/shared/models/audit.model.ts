export interface AuditEntry {
  id: string;
  incidentId: string;
  timestamp: string;
  userId: string;
  userName: string;
  departmentId: string;
  departmentName: string;
  action: AuditAction;
  fromState?: string;
  toState?: string;
  details: string;
  metadata: Record<string, any>;
  ipAddress: string;
}

export type AuditAction =
  | "CREATED"
  | "UPDATED"
  | "STATUS_CHANGED"
  | "DEPARTMENT_TRANSITION"
  | "CHECKLIST_ITEM_COMPLETED"
  | "CHECKLIST_COMPLETED"
  | "ATTACHMENT_ADDED"
  | "ATTACHMENT_REMOVED"
  | "ESCALATED"
  | "DEESCALATED"
  | "RESOLVED"
  | "CLOSED"
  | "REOPENED"
  | "COMMENT_ADDED"
  | "CUSTOM";
