export type WorkflowActionType =
  | "RETURN_TO_SUPPORT"
  | "COMPLETE_TECHNICAL_WORK"
  | "SCHEDULE_TECHNICIAN"
  | "APPROVE_CHANGE"
  | "REJECT_CHANGE"
  | "ESCALATE_TO_OPERATIONS"
  | "ESCALATE_TO_ACCOUNTS"
  | "CLOSE_INCIDENT";

export interface WorkflowActionRequest {
  incidentId: string;
  action: WorkflowActionType;
  payload?: Record<string, unknown>;
}

export interface WorkflowActionResult {
  incidentId: string;
  action: WorkflowActionType;
  successful: boolean;
  message?: string;
  resultingState?: string;
}
