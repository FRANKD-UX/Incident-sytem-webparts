export type Department =
  | 'Support'
  | 'Operations'
  | 'Accounts';

export type SlaStatus =
  | 'ok'
  | 'warning'
  | 'breach';

export interface ChecklistItemState {
  key: string;
  label: string;
  completed: boolean;
  required: boolean;
}

export interface WorkflowTimelineEvent {
  at: string;
  type: string;
  message: string;
}

export interface WorkflowOwnershipState {
  department: Department;
  assignee?: string;
}

export interface WorkflowSlaState {
  status: SlaStatus;
  dueAt?: string;
  minutesRemaining?: number;
}

export interface EscalationState {
  active: boolean;
  reason?: string;
}

export interface IncidentWorkflowState {
  incidentId: string;
  workflowState: string;
  currentDepartment: Department;
  allowedActions: string[];
  checklistState: ChecklistItemState[];
  slaState: WorkflowSlaState;
  ownership: WorkflowOwnershipState;
  timeline: WorkflowTimelineEvent[];
  escalationState?: EscalationState;
}
