export interface Checklist {
  id: string;
  incidentId: string;
  chainStepId: string;
  departmentId: string;
  items: ChecklistItem[];
  completedAt?: string;
  completedBy?: string;
  status: ChecklistStatus;
}

export interface ChecklistItem {
  id: string;
  description: string;
  isCompleted: boolean;
  isRequired: boolean;
  completedAt?: string;
  completedBy?: string;
  order: number;
  category: string;
  evidenceRequired: boolean;
  evidenceType?: "ATTACHMENT" | "NOTE" | "CONFIRMATION";
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  items: ChecklistTemplateItem[];
  departmentId: string;
  incidentTypeId: string;
}

export interface ChecklistTemplateItem {
  description: string;
  isRequired: boolean;
  order: number;
  category: string;
  evidenceRequired: boolean;
  evidenceType?: "ATTACHMENT" | "NOTE" | "CONFIRMATION";
}

export type ChecklistStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "SKIPPED";
