import { ChecklistTemplate } from "./checklist.model";
import { Attachment } from "./attachment.model";
import { AuditEntry } from "./audit.model";
import { Escalation } from "./escalation.model";
import { SlaState } from "./sla.model";
import { Department, User } from "./user.model";
import { Priority, IncidentStatus } from "./common.model";

export interface Incident {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  type: IncidentType;
  priority: Priority;
  status: IncidentStatus;
  currentDepartment: Department;
  originDepartment: Department;
  assignedTo?: User;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  tags: string[];
  customFields: Record<string, unknown>;
}

export interface IncidentType {
  id: string;
  name: string;
  code: string;
  description: string;
  departmentChain: DepartmentChain;
  defaultChecklists: ChecklistTemplate[];
  slaRules: SlaRule[];
  escalationRules: EscalationRule[];
  isActive: boolean;
}

export interface DepartmentChain {
  id: string;
  name: string;
  steps: ChainStep[];
  allowParallel: boolean;
  requireStrictOrder: boolean;
}

export interface ChainStep {
  order: number;
  department: Department;
  checklist: ChecklistTemplate;
  expectedActions: string[];
  sla: StepSla;
  isOptional: boolean;
}

export interface StepSla {
  responseTime: number;
  resolutionTime: number;
  escalationPoint: number;
}

export interface SlaRule {
  id: string;
  name: string;
  metric: SlaMetric;
  threshold: number;
  unit: "MINUTES" | "HOURS" | "DAYS";
  priority: Priority;
}

export type SlaMetric =
  | "INITIAL_RESPONSE"
  | "RESOLUTION"
  | "ESCALATION_RESPONSE";

export interface EscalationRule {
  id: string;
  name: string;
  trigger: EscalationTrigger;
  action: EscalationAction;
  targetRole: string;
  delay: number;
}

export type EscalationTrigger =
  | "SLA_BREACH"
  | "PENDING_CHECKLIST"
  | "STALE_INCIDENT"
  | "MANUAL";
export type EscalationAction =
  | "NOTIFY_MANAGER"
  | "REASSIGN"
  | "ESCALATE_DEPARTMENT";
