import { Department } from "./user.model";

export type WorkflowChainStatus = "draft" | "published" | "inactive";

export interface WorkflowIncidentTypeOption {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface WorkflowChainStep {
  id: string;
  sequence: number;
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  allowedActions: string[];
  requiredChecklistItems: string[];
  sendBackTargetDepartmentId: string | null;
  sendBackTargetDepartmentName: string | null;
  escalationTargetDepartmentId: string | null;
  escalationTargetDepartmentName: string | null;
  slaMinutes: number;
  notes: string;
}

export interface WorkflowChain {
  id: string;
  name: string;
  incidentTypeId: string;
  incidentTypeName: string;
  triggerSource: WorkflowChainTriggerSource;
  finalDecisionAuthority: string;
  autoUpdateUi: boolean;
  status: WorkflowChainStatus;
  version: number;
  ownerDepartmentId: string;
  ownerDepartmentName: string;
  steps: WorkflowChainStep[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface WorkflowChainDraft extends WorkflowChain {}

export interface WorkflowChainInput {
  name: string;
  incidentTypeId: string;
  status: WorkflowChainStatus;
  version: number;
  ownerDepartmentId: string;
  notes: string;
  steps: WorkflowChainStep[];
}

export interface WorkflowChainValidationResult {
  valid: boolean;
  errors: string[];
}

export interface WorkflowConfigurationSnapshot {
  departments: Department[];
  incidentTypes: WorkflowIncidentTypeOption[];
  chains: WorkflowChain[];
}

export type WorkflowChainTriggerSource = "ALERT" | "MANUAL";

export function cloneWorkflowStep(step: WorkflowChainStep): WorkflowChainStep {
  return {
    ...step,
    allowedActions: [...step.allowedActions],
    requiredChecklistItems: [...step.requiredChecklistItems],
  };
}

export function cloneWorkflowChain(chain: WorkflowChain): WorkflowChain {
  return {
    ...chain,
    steps: chain.steps.map((step) => cloneWorkflowStep(step)),
  };
}

export const WORKFLOW_TRIGGER_LABELS: Record<
  WorkflowChainTriggerSource,
  string
> = {
  ALERT: "Alert-driven",
  MANUAL: "Manual",
};
