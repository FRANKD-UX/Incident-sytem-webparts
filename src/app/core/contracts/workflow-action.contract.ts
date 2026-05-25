export interface WorkflowActionRequest {
  incidentId: string;
  action: string;
  payload?: Record<string, unknown>;
}
