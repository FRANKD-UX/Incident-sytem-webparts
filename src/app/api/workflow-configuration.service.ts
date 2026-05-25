import { Injectable } from "@angular/core";
import { Observable, delay, of, throwError } from "rxjs";
import { ChecklistTemplate } from "../shared/models/checklist.model";
import { DepartmentChain } from "../shared/models/incident.model";
import { Department } from "../shared/models/user.model";
import {
  WorkflowChain,
  WorkflowChainStatus,
  WorkflowChainStep,
  WorkflowIncidentTypeOption,
  WorkflowChainValidationResult,
} from "../shared/models/workflow-configuration.model";

const DEPARTMENTS: Department[] = [
  { id: "SUP", name: "Support", code: "SUP", isActive: true },
  { id: "OPS", name: "Operations", code: "OPS", isActive: true },
  { id: "ACC", name: "Accounts", code: "ACC", isActive: true },
  { id: "MGT", name: "Management", code: "MGT", isActive: true },
];

const INCIDENT_TYPES: WorkflowIncidentTypeOption[] = [
  {
    id: "INC-TYPE-SRV",
    code: "SERVICE",
    name: "Service Incident",
    description: "General service restoration and support workflow.",
  },
  {
    id: "INC-TYPE-BIL",
    code: "BILLING",
    name: "Billing Issue",
    description: "Customer billing, corrections, and account queries.",
  },
  {
    id: "INC-TYPE-INF",
    code: "INFRA",
    name: "Infrastructure Escalation",
    description: "Infrastructure, network, and platform recovery workflow.",
  },
  {
    id: "INC-TYPE-CHG",
    code: "CHANGE",
    name: "Change Request",
    description: "Controlled changes with approvals and technical handoff.",
  },
];

function nowIso(): string {
  return new Date().toISOString();
}

function randomId(prefix: string): string {
  const suffix =
    crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);
  return `${prefix}-${suffix}`;
}

function cloneStep(step: WorkflowChainStep): WorkflowChainStep {
  return {
    ...step,
    allowedActions: [...step.allowedActions],
    requiredChecklistItems: [...step.requiredChecklistItems],
  };
}

function cloneChain(chain: WorkflowChain): WorkflowChain {
  return {
    ...chain,
    steps: chain.steps.map((step) => cloneStep(step)),
  };
}

function departmentNameById(departmentId: string | null): string | null {
  if (!departmentId) {
    return null;
  }

  return (
    DEPARTMENTS.find((department) => department.id === departmentId)?.name ??
    null
  );
}

function departmentCodeById(departmentId: string): string {
  return (
    DEPARTMENTS.find((department) => department.id === departmentId)?.code ??
    departmentId
  );
}

function defaultStep(sequence: number): WorkflowChainStep {
  const department = DEPARTMENTS[0];
  return {
    id: randomId("step"),
    sequence,
    departmentId: department.id,
    departmentCode: department.code,
    departmentName: department.name,
    allowedActions: ["ACKNOWLEDGE", "RETURN_TO_PREVIOUS", "ESCALATE"],
    requiredChecklistItems: ["Review request", "Confirm ownership"],
    sendBackTargetDepartmentId: null,
    sendBackTargetDepartmentName: null,
    escalationTargetDepartmentId: null,
    escalationTargetDepartmentName: null,
    slaMinutes: 60,
    notes: "",
  };
}

function toDepartmentChain(chain: WorkflowChain): DepartmentChain {
  return {
    id: chain.id,
    name: chain.name,
    allowParallel: false,
    requireStrictOrder: true,
    steps: chain.steps.map((step) => ({
      order: step.sequence,
      department: {
        id: step.departmentId,
        name: step.departmentName,
        code: step.departmentCode,
        isActive: true,
      },
      checklist: {
        id: `${step.id}-checklist`,
        name: `${step.departmentName} checklist`,
        departmentId: step.departmentId,
        incidentTypeId: chain.incidentTypeId,
        items: step.requiredChecklistItems.map((item, index) => ({
          id: `${step.id}-item-${index + 1}`,
          description: item,
          isCompleted: false,
          isRequired: true,
          order: index + 1,
          category: "CONFIGURATION",
          evidenceRequired: false,
        })),
      } as ChecklistTemplate,
      expectedActions: [...step.allowedActions],
      sla: {
        responseTime: step.slaMinutes,
        resolutionTime: step.slaMinutes * 4,
        escalationPoint: Math.max(1, Math.floor(step.slaMinutes * 0.75)),
      },
      isOptional: false,
    })),
  };
}

function defaultDecisionAuthority(): string {
  return "Manager / CTO";
}

function normalizeSequence(steps: WorkflowChainStep[]): WorkflowChainStep[] {
  return steps.map((step, index) => ({
    ...cloneStep(step),
    sequence: index + 1,
    departmentCode: departmentCodeById(step.departmentId),
    departmentName:
      DEPARTMENTS.find((department) => department.id === step.departmentId)
        ?.name ?? step.departmentName,
    sendBackTargetDepartmentName: departmentNameById(
      step.sendBackTargetDepartmentId,
    ),
    escalationTargetDepartmentName: departmentNameById(
      step.escalationTargetDepartmentId,
    ),
  }));
}

@Injectable({
  providedIn: "root",
})
export class WorkflowConfigurationService {
  private readonly chains: WorkflowChain[] = [];
  private readonly chainCounter = { value: 1 };

  getDepartments(): Observable<Department[]> {
    return of(DEPARTMENTS.map((department) => ({ ...department }))).pipe(
      delay(40),
    );
  }

  getIncidentTypes(): Observable<WorkflowIncidentTypeOption[]> {
    return of(INCIDENT_TYPES.map((incidentType) => ({ ...incidentType }))).pipe(
      delay(40),
    );
  }

  getChains(): Observable<WorkflowChain[]> {
    const snapshot = this.chains.map((chain) => cloneChain(chain));
    return of(snapshot).pipe(delay(60));
  }

  getPublishedDepartmentChainForIncidentType(
    incidentTypeId: string,
  ): Observable<DepartmentChain | null> {
    return of(
      this.resolvePublishedDepartmentChainForIncidentType(incidentTypeId),
    ).pipe(delay(40));
  }

  resolvePublishedDepartmentChainForIncidentType(
    incidentTypeId: string,
  ): DepartmentChain | null {
    const chain = this.chains.find(
      (item) =>
        item.incidentTypeId === incidentTypeId && item.status === "published",
    );

    return chain ? toDepartmentChain(chain) : null;
  }

  getChain(chainId: string): Observable<WorkflowChain | null> {
    const chain = this.chains.find((item) => item.id === chainId);
    return of(chain ? cloneChain(chain) : null).pipe(delay(30));
  }

  createDraftChain(): WorkflowChain {
    const incidentType = INCIDENT_TYPES[0];
    const ownerDepartment = DEPARTMENTS[0];
    const chainNumber = this.chainCounter.value++;
    const now = nowIso();

    return {
      id: randomId("chain"),
      name: `Draft workflow chain ${chainNumber}`,
      incidentTypeId: incidentType.id,
      incidentTypeName: incidentType.name,
      triggerSource: "ALERT",
      finalDecisionAuthority: defaultDecisionAuthority(),
      autoUpdateUi: true,
      status: "draft",
      version: 1,
      ownerDepartmentId: ownerDepartment.id,
      ownerDepartmentName: ownerDepartment.name,
      steps: [defaultStep(1)],
      notes: "",
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
    };
  }

  saveDraft(chain: WorkflowChain): Observable<WorkflowChain> {
    const validation = this.validateChain(chain);
    if (!validation.valid) {
      return throwError(() => new Error(validation.errors.join("; ")));
    }

    const savedChain = this.upsertChain({
      ...chain,
      status: "draft",
    });

    return of(savedChain).pipe(delay(90));
  }

  publishChain(chain: WorkflowChain): Observable<WorkflowChain> {
    const validation = this.validateChain(chain);
    if (!validation.valid) {
      return throwError(() => new Error(validation.errors.join("; ")));
    }

    const publishedChain = this.upsertChain({
      ...chain,
      status: "published",
      publishedAt: nowIso(),
    });

    return of(publishedChain).pipe(delay(110));
  }

  disableChain(chainId: string): Observable<WorkflowChain> {
    const existing = this.chains.find((chain) => chain.id === chainId);
    if (!existing) {
      return throwError(() => new Error("Workflow chain not found."));
    }

    const updated = this.upsertChain({
      ...existing,
      status: "inactive",
    });

    return of(updated).pipe(delay(90));
  }

  deleteChain(chainId: string): Observable<{ acknowledged: boolean }> {
    const index = this.chains.findIndex((chain) => chain.id === chainId);
    if (index < 0) {
      return throwError(() => new Error("Workflow chain not found."));
    }

    if (!this.canDeleteChain(this.chains[index])) {
      return throwError(
        () => new Error("Only draft or inactive chains can be deleted."),
      );
    }

    this.chains.splice(index, 1);
    return of({ acknowledged: true }).pipe(delay(60));
  }

  canDeleteChain(chain: WorkflowChain): boolean {
    return chain.status !== "published";
  }

  validateChain(chain: WorkflowChain): WorkflowChainValidationResult {
    const errors: string[] = [];
    const name = chain.name.trim();

    if (!name) {
      errors.push("Chain name is required.");
    }

    if (!chain.incidentTypeId.trim()) {
      errors.push("Incident type is required.");
    }

    if (!chain.ownerDepartmentId.trim()) {
      errors.push("Owner department is required.");
    }

    if (chain.steps.length === 0) {
      errors.push("At least one step is required.");
    }

    const expectedSequence = chain.steps.map((step, index) => index + 1);
    const actualSequence = chain.steps.map((step) => step.sequence);
    const uniqueSequence = new Set(actualSequence);

    if (uniqueSequence.size !== actualSequence.length) {
      errors.push("Step sequence values must be unique.");
    }

    const sequenceValid = expectedSequence.every(
      (sequence, index) => actualSequence[index] === sequence,
    );

    if (!sequenceValid) {
      errors.push("Step order must be a continuous sequence starting at 1.");
    }

    for (const step of chain.steps) {
      if (!step.departmentId.trim()) {
        errors.push(`Step ${step.sequence} is missing a department.`);
      }

      if (step.slaMinutes <= 0) {
        errors.push(`Step ${step.sequence} must have a positive SLA value.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  addStep(chain: WorkflowChain): WorkflowChain {
    const steps = normalizeSequence([
      ...chain.steps,
      defaultStep(chain.steps.length + 1),
    ]);
    return {
      ...cloneChain(chain),
      steps,
      updatedAt: nowIso(),
    };
  }

  removeStep(chain: WorkflowChain, sequence: number): WorkflowChain {
    const steps = chain.steps
      .filter((step) => step.sequence !== sequence)
      .map((step) => cloneStep(step));

    return {
      ...cloneChain(chain),
      steps: normalizeSequence(steps),
      updatedAt: nowIso(),
    };
  }

  moveStep(
    chain: WorkflowChain,
    sequence: number,
    direction: -1 | 1,
  ): WorkflowChain {
    const nextSteps = [...chain.steps].map((step) => cloneStep(step));
    const currentIndex = nextSteps.findIndex(
      (step) => step.sequence === sequence,
    );
    const targetIndex = currentIndex + direction;

    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= nextSteps.length
    ) {
      return cloneChain(chain);
    }

    const [step] = nextSteps.splice(currentIndex, 1);
    nextSteps.splice(targetIndex, 0, step);

    return {
      ...cloneChain(chain),
      steps: normalizeSequence(nextSteps),
      updatedAt: nowIso(),
    };
  }

  updateStep(
    chain: WorkflowChain,
    updatedStep: WorkflowChainStep,
  ): WorkflowChain {
    const steps = chain.steps.map((step) =>
      step.sequence === updatedStep.sequence
        ? cloneStep(updatedStep)
        : cloneStep(step),
    );

    return {
      ...cloneChain(chain),
      steps: normalizeSequence(steps),
      updatedAt: nowIso(),
    };
  }

  private upsertChain(chain: WorkflowChain): WorkflowChain {
    const now = nowIso();
    const validation = this.validateChain(chain);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const normalizedChain: WorkflowChain = {
      ...cloneChain(chain),
      name: chain.name.trim(),
      incidentTypeName:
        INCIDENT_TYPES.find((item) => item.id === chain.incidentTypeId)?.name ??
        chain.incidentTypeName,
      triggerSource: chain.triggerSource,
      finalDecisionAuthority: chain.finalDecisionAuthority,
      autoUpdateUi: chain.autoUpdateUi,
      ownerDepartmentName:
        DEPARTMENTS.find(
          (department) => department.id === chain.ownerDepartmentId,
        )?.name ?? chain.ownerDepartmentName,
      status: chain.status as WorkflowChainStatus,
      version: chain.version + 1,
      steps: normalizeSequence(chain.steps),
      updatedAt: now,
      publishedAt:
        chain.status === "published" ? (chain.publishedAt ?? now) : null,
    };

    const index = this.chains.findIndex(
      (item) => item.id === normalizedChain.id,
    );
    if (index >= 0) {
      this.chains[index] = normalizedChain;
    } else {
      this.chains.unshift(normalizedChain);
    }

    return cloneChain(normalizedChain);
  }
}
