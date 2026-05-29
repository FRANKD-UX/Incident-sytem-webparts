export interface Escalation {
  id: string;
  incidentId: string;
  triggerType: EscalationTrigger;
  triggerTime: string;
  escalatedTo: string;
  escalatedFrom: string;
  reason: string;
  status: EscalationStatus;
  resolvedAt?: string;
  resolvedBy?: string;
  notes: string[];
}

export type EscalationStatus =
  | "ACTIVE"
  | "ACKNOWLEDGED"
  | "RESOLVED"
  | "CANCELLED";

export type EscalationTrigger =
  | "SLA_BREACH"
  | "PENDING_CHECKLIST"
  | "STALE_INCIDENT"
  | "MANUAL";
