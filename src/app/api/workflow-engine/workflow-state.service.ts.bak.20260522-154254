import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Department, User } from "../../shared/models/user.model";
import {
  Checklist,
  ChecklistItem,
  ChecklistItemUpdatePayload,
  ChecklistStatus,
} from "../../shared/models/checklist.model";
import { AuditAction, AuditEntry } from "../../shared/models/audit.model";
import { Attachment } from "../../shared/models/attachment.model";
import { Escalation } from "../../shared/models/escalation.model";
import { SlaState } from "../../shared/models/sla.model";
import {
  DepartmentChain,
  Incident,
  IncidentType,
} from "../../shared/models/incident.model";
import {
  IncidentStatus,
  PaginationMetadata,
  Priority,
} from "../../shared/models/common.model";

type WorkflowFlow =
  | "SUPPORT_TO_ACCOUNTS"
  | "SUPPORT_TO_OPERATIONS"
  | "OPERATIONS_TO_SUPPORT";

type DepartmentCode = "SUP" | "ACC" | "OPS";

interface WorkflowStepRuntime {
  order: number;
  department: Department;
  checklist: Checklist;
  expectedActions: string[];
  completed: boolean;
  completedAt?: string;
}

interface WorkflowRecord {
  incident: Incident;
  type: IncidentType;
  chain: DepartmentChain;
  steps: WorkflowStepRuntime[];
  currentStepIndex: number;
  checklistByDepartment: Record<string, Checklist>;
  auditTrail: AuditEntry[];
  attachments: Attachment[];
  escalations: Escalation[];
  slaState: SlaState;
}

@Injectable({ providedIn: "root" })
export class WorkflowStateService {
  private readonly storageKey = "incidentops.workflow.demo.v1";

  private readonly records$ = new BehaviorSubject<WorkflowRecord[]>(this.load());

  private seq = 1;

  snapshot(): WorkflowRecord[] {
    return this.records$.value;
  }

  getIncidents(): Incident[] {
    return this.records$.value.map((r) => r.incident);
  }

  getIncident(id: string): Incident | undefined {
    return this.records$.value.find((r) => r.incident.id === id)?.incident;
  }

  getChecklist(incidentId: string): Checklist {
    const record = this.requireRecord(incidentId);
    const current = record.steps[record.currentStepIndex];
    return record.checklistByDepartment[current.department.code] ?? current.checklist;
  }

  getAttachments(incidentId: string): Attachment[] {
    return this.requireRecord(incidentId).attachments;
  }

  getAuditTrail(incidentId: string): AuditEntry[] {
    return this.requireRecord(incidentId).auditTrail;
  }

  getEscalations(incidentId: string): Escalation[] {
    return this.requireRecord(incidentId).escalations;
  }

  getSlaState(incidentId: string): SlaState {
    return this.requireRecord(incidentId).slaState;
  }

  getIncidentChain(incidentId: string): DepartmentChain {
    return this.requireRecord(incidentId).chain;
  }

  createIncident(input: Partial<Incident> & { customFields?: Record<string, unknown> }): Incident {
    const flow = (input.customFields?.["flowType"] as WorkflowFlow) ?? "SUPPORT_TO_OPERATIONS";
    const createdAt = new Date().toISOString();
    const id = input.id ?? `INC-${String(this.seq++).padStart(3, "0")}`;
    const type = this.buildType(flow);
    const chain = type.departmentChain;

    const originDepartment = this.pickOriginDepartment(flow);
    const currentDepartment = this.pickInitialDepartment(flow);

    const incident: Incident = {
      id,
      referenceNumber: input.referenceNumber ?? `${id}-${new Date().getFullYear()}`,
      title: input.title ?? this.defaultTitle(flow),
      description: input.description ?? "",
      type,
      priority: (input.priority ?? "MEDIUM") as Priority,
      status: "OPEN",
      currentDepartment,
      originDepartment,
      assignedTo: input.assignedTo,
      createdBy: input.createdBy ?? this.mockUser(originDepartment),
      createdAt,
      updatedAt: createdAt,
      resolvedAt: undefined,
      closedAt: undefined,
      tags: input.tags ?? this.defaultTags(flow),
      customFields: {
        ...(input.customFields ?? {}),
        flowType: flow,
      },
    };

    const steps = chain.steps.map((step) => {
      const checklist = this.buildChecklistForFlow(flow, incident.id, step.department);
      return {
        order: step.order,
        department: step.department,
        checklist,
        expectedActions: step.expectedActions,
        completed: false,
      } as WorkflowStepRuntime;
    });

    const record: WorkflowRecord = {
      incident,
      type,
      chain,
      steps,
      currentStepIndex: 0,
      checklistByDepartment: Object.fromEntries(
        steps.map((s) => [s.department.code, s.checklist]),
      ),
      auditTrail: [
        this.audit(
          incident.id,
          "CREATED",
          originDepartment,
          `Incident created for ${this.flowLabel(flow)}`,
          { flowType: flow },
        ),
      ],
      attachments: [],
      escalations: [],
      slaState: {
        incidentId: incident.id,
        overallStatus: "WITHIN_SLA",
        metrics: [],
        breaches: [],
      },
    };

    this.records$.next([record, ...this.records$.value]);
    this.persist();
    return incident;
  }

  updateChecklistItem(
    incidentId: string,
    itemId: string,
    payload: ChecklistItemUpdatePayload,
  ): Checklist {
    const records = [...this.records$.value];
    const record = this.requireRecord(incidentId, records);
    const current = record.steps[record.currentStepIndex];
    const checklist = record.checklistByDepartment[current.department.code];

    const updatedItems = checklist.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            isCompleted: payload.isCompleted,
            completedAt: payload.isCompleted ? new Date().toISOString() : undefined,
            completedBy: payload.isCompleted ? record.incident.createdBy.displayName : undefined,
          }
        : item,
    );

    const allRequiredDone = updatedItems.every((item) => !item.isRequired || item.isCompleted);
    const allDone = updatedItems.every((item) => item.isCompleted);

    const nextChecklist: Checklist = {
      ...checklist,
      items: updatedItems,
      status: (allDone ? "COMPLETED" : "IN_PROGRESS") as ChecklistStatus,
      completedAt: allDone ? new Date().toISOString() : undefined,
    };

    record.checklistByDepartment[current.department.code] = nextChecklist;
    record.steps[record.currentStepIndex] = {
      ...current,
      checklist: nextChecklist,
      completed: allDone,
      completedAt: allDone ? new Date().toISOString() : current.completedAt,
    };

    record.auditTrail.unshift(
      this.audit(
        incidentId,
        "CHECKLIST_ITEM_COMPLETED",
        current.department,
        `Checklist item ${itemId} updated`,
        { itemId, isCompleted: payload.isCompleted },
      ),
    );

    record.incident.status = allRequiredDone ? "PENDING_TRANSITION" : "PENDING_CHECKLIST";
    record.incident.updatedAt = new Date().toISOString();

    this.records$.next(records);
    this.persist();
    return nextChecklist;
  }

  completeCurrentStep(incidentId: string): Incident {
    const records = [...this.records$.value];
    const record = this.requireRecord(incidentId, records);
    const current = record.steps[record.currentStepIndex];
    const checklist = record.checklistByDepartment[current.department.code];

    if (!checklist.items.every((item) => !item.isRequired || item.isCompleted)) {
      record.incident.status = "PENDING_CHECKLIST";
      this.records$.next(records);
      this.persist();
      return record.incident;
    }

    current.completed = true;
    current.completedAt = new Date().toISOString();

    record.auditTrail.unshift(
      this.audit(
        incidentId,
        "CHECKLIST_COMPLETED",
        current.department,
        `${current.department.name} checklist completed`,
      ),
    );

    if (record.currentStepIndex < record.steps.length - 1) {
      const nextStep = record.steps[record.currentStepIndex + 1];
      record.currentStepIndex += 1;
      record.incident.currentDepartment = nextStep.department;
      record.incident.status = "IN_PROGRESS";
      record.auditTrail.unshift(
        this.audit(
          incidentId,
          "DEPARTMENT_TRANSITION",
          nextStep.department,
          `Moved to ${nextStep.department.name}`,
          { from: current.department.code, to: nextStep.department.code },
        ),
      );
    } else {
      record.incident.status = "RESOLVED";
      record.incident.resolvedAt = new Date().toISOString();
      record.auditTrail.unshift(
        this.audit(
          incidentId,
          "RESOLVED",
          current.department,
          "Incident resolved by final department",
        ),
      );
    }

    record.incident.updatedAt = new Date().toISOString();
    this.records$.next(records);
    this.persist();
    return record.incident;
  }

  sendBack(incidentId: string, reason: string): Incident {
    const records = [...this.records$.value];
    const record = this.requireRecord(incidentId, records);
    const current = record.steps[record.currentStepIndex];

    if (record.currentStepIndex === 0) {
      return record.incident;
    }

    const previous = record.steps[record.currentStepIndex - 1];
    record.currentStepIndex -= 1;
    record.incident.currentDepartment = previous.department;
    record.incident.status = "PENDING_TRANSITION";
    record.incident.updatedAt = new Date().toISOString();

    record.auditTrail.unshift(
      this.audit(
        incidentId,
        "UPDATED",
        current.department,
        `Sent back to ${previous.department.name}: ${reason}`,
        { reason, from: current.department.code, to: previous.department.code },
      ),
    );

    this.records$.next(records);
    this.persist();
    return record.incident;
  }

  moveIncident(incidentId: string, payload: { fromDepartmentCode: string; toDepartmentCode: string }): Incident {
    if (payload.toDepartmentCode === "COMPLETED") {
      const records = [...this.records$.value];
      const record = this.requireRecord(incidentId, records);
      record.incident.status = "RESOLVED";
      record.incident.resolvedAt = new Date().toISOString();
      record.incident.updatedAt = new Date().toISOString();
      this.records$.next(records);
      this.persist();
      return record.incident;
    }

    const records = [...this.records$.value];
    const record = this.requireRecord(incidentId, records);
    const nextStepIndex = record.steps.findIndex(
      (step) => step.department.code === payload.toDepartmentCode,
    );
    if (nextStepIndex === -1) return record.incident;

    record.currentStepIndex = nextStepIndex;
    record.incident.currentDepartment = record.steps[nextStepIndex].department;
    record.incident.status = "IN_PROGRESS";
    record.incident.updatedAt = new Date().toISOString();

    record.auditTrail.unshift(
      this.audit(
        incidentId,
        "DEPARTMENT_TRANSITION",
        record.incident.currentDepartment,
        `Moved to ${record.incident.currentDepartment.name}`,
        { from: payload.fromDepartmentCode, to: payload.toDepartmentCode },
      ),
    );

    this.records$.next(records);
    this.persist();
    return record.incident;
  }

  private buildChecklistForFlow(flow: WorkflowFlow, incidentId: string, department: Department): Checklist {
    const items = this.itemsForFlow(flow, department.code);
    return {
      id: `CL-${incidentId}-${department.code}`,
      incidentId,
      chainStepId: `STEP-${department.code}`,
      departmentId: department.id,
      items,
      status: "IN_PROGRESS",
    };
  }

  private itemsForFlow(flow: WorkflowFlow, departmentCode: string): ChecklistItem[] {
    if (flow === "SUPPORT_TO_ACCOUNTS" && departmentCode === "SUP") {
      return [
        this.item("SUP-1", "Verify customer account / user reference", 1, "Validation", false, "CONFIRMATION"),
        this.item("SUP-2", "Confirm request type and record support summary", 2, "Documentation", true, "NOTE"),
      ];
    }

    if (flow === "SUPPORT_TO_ACCOUNTS" && departmentCode === "ACC") {
      return [
        this.item("ACC-1", "Validate billing / profile change", 1, "Validation", false, "CONFIRMATION"),
        this.item("ACC-2", "Apply requested account update", 2, "Action", true, "NOTE"),
      ];
    }

    if (flow === "SUPPORT_TO_OPERATIONS" && departmentCode === "SUP") {
      return [
        this.item("OPS-1", "Run first-line checks", 1, "Troubleshooting", true, "NOTE"),
        this.item("OPS-2", "Capture customer consent", 2, "Consent", true, "CONFIRMATION"),
        this.item("OPS-3", "Attach evidence of checks", 3, "Evidence", true, "ATTACHMENT"),
      ];
    }

    if (flow === "SUPPORT_TO_OPERATIONS" && departmentCode === "OPS") {
      return [
        this.item("OPS-4", "Assign technician", 1, "Dispatch", false, "NOTE"),
        this.item("OPS-5", "Book technician date", 2, "Dispatch", false, "NOTE"),
        this.item("OPS-6", "Mark call-out completed", 3, "Resolution", true, "NOTE"),
      ];
    }

    if (flow === "OPERATIONS_TO_SUPPORT" && departmentCode === "OPS") {
      return [
        this.item("MNT-1", "Record maintenance window", 1, "Maintenance", true, "NOTE"),
        this.item("MNT-2", "Brief Support", 2, "Briefing", true, "CONFIRMATION"),
      ];
    }

    if (flow === "OPERATIONS_TO_SUPPORT" && departmentCode === "SUP") {
      return [
        this.item("MNT-3", "Notify callers of planned maintenance", 1, "Client Notice", true, "NOTE"),
        this.item("MNT-4", "Update call centre script", 2, "Client Notice", false, "NOTE"),
      ];
    }

    return [
      this.item("GEN-1", "Complete required work", 1, "General", true, "NOTE"),
    ];
  }

  private item(
    id: string,
    description: string,
    order: number,
    category: string,
    required: boolean,
    evidenceType: "ATTACHMENT" | "NOTE" | "CONFIRMATION",
  ): ChecklistItem {
    return {
      id,
      description,
      isCompleted: false,
      isRequired: required,
      order,
      category,
      evidenceRequired: true,
      evidenceType,
    };
  }

  private buildType(flow: WorkflowFlow): IncidentType {
    const chain = this.buildChain(flow);
    return {
      id: `TYPE-${flow}`,
      name: this.flowLabel(flow),
      code: flow,
      description: this.flowDescription(flow),
      departmentChain: chain,
      defaultChecklists: [],
      slaRules: [],
      escalationRules: [],
      isActive: true,
    };
  }

  private buildChain(flow: WorkflowFlow): DepartmentChain {
    const support = this.department("SUP", "Support");
    const accounts = this.department("ACC", "Accounts");
    const operations = this.department("OPS", "Operations");

    if (flow === "SUPPORT_TO_ACCOUNTS") {
      return {
        id: "CHAIN-SUP-ACC",
        name: "Support to Accounts",
        allowParallel: false,
        requireStrictOrder: true,
        steps: [
          this.chainStep(1, support, "Support intake", ["Capture account issue", "Validate reference"]),
          this.chainStep(2, accounts, "Accounts resolution", ["Apply account correction", "Confirm closure"]),
        ],
      };
    }

    if (flow === "SUPPORT_TO_OPERATIONS") {
      return {
        id: "CHAIN-SUP-OPS",
        name: "Support to Operations",
        allowParallel: false,
        requireStrictOrder: true,
        steps: [
          this.chainStep(1, support, "Support first-line checks", ["Run checks", "Capture consent", "Attach evidence"]),
          this.chainStep(2, operations, "Operations dispatch", ["Assign tech", "Book date", "Complete call-out"]),
        ],
      };
    }

    return {
      id: "CHAIN-OPS-SUP",
      name: "Operations to Support",
      allowParallel: false,
      requireStrictOrder: true,
      steps: [
        this.chainStep(1, operations, "Maintenance planning", ["Record maintenance", "Brief Support"]),
        this.chainStep(2, support, "Support notice", ["Inform callers", "Update scripts"]),
      ],
    };
  }

  private chainStep(order: number, department: Department, checklistName: string, expectedActions: string[]) {
    return {
      order,
      department,
      checklist: {
        id: `TPL-${department.code}-${order}`,
        name: checklistName,
        items: [],
        departmentId: department.id,
        incidentTypeId: "",
      },
      expectedActions,
      sla: {
        responseTime: order === 1 ? 60 : 120,
        resolutionTime: order === 1 ? 240 : 480,
        escalationPoint: order === 1 ? 120 : 240,
      },
      isOptional: false,
    };
  }

  private pickOriginDepartment(flow: WorkflowFlow): Department {
    if (flow === "OPERATIONS_TO_SUPPORT") {
      return this.department("OPS", "Operations");
    }
    return this.department("SUP", "Support");
  }

  private pickInitialDepartment(flow: WorkflowFlow): Department {
    if (flow === "SUPPORT_TO_ACCOUNTS") return this.department("SUP", "Support");
    if (flow === "SUPPORT_TO_OPERATIONS") return this.department("SUP", "Support");
    return this.department("OPS", "Operations");
  }

  private defaultTitle(flow: WorkflowFlow): string {
    if (flow === "SUPPORT_TO_ACCOUNTS") return "Account support request";
    if (flow === "SUPPORT_TO_OPERATIONS") return "Fibre fault escalation";
    return "Maintenance notification";
  }

  private defaultTags(flow: WorkflowFlow): string[] {
    if (flow === "SUPPORT_TO_ACCOUNTS") return ["accounts", "support"];
    if (flow === "SUPPORT_TO_OPERATIONS") return ["support", "operations", "fault"];
    return ["operations", "support", "maintenance"];
  }

  private flowLabel(flow: WorkflowFlow): string {
    if (flow === "SUPPORT_TO_ACCOUNTS") return "Support to Accounts";
    if (flow === "SUPPORT_TO_OPERATIONS") return "Support to Operations";
    return "Operations to Support";
  }

  private flowDescription(flow: WorkflowFlow): string {
    if (flow === "SUPPORT_TO_ACCOUNTS") return "Billing and account changes";
    if (flow === "SUPPORT_TO_OPERATIONS") return "Fault escalation after first-line checks";
    return "Maintenance notice for Support";
  }

  private mockUser(department: Department): User {
    return {
      id: "u1",
      displayName: `${department.name} User`,
      email: `${department.code.toLowerCase()}@example.com`,
      department,
      role: { id: "r1", name: "Agent", departmentId: department.id, permissions: [] },
      permissions: [],
    };
  }


  private department(code: "SUP" | "ACC" | "OPS", name: string): Department {
    return {
      id: code,
      name,
      code,
      isActive: true,
    };
  }

  private audit(
    incidentId: string,
    action: AuditAction,
    department: Department,
    details: string,
    metadata: Record<string, unknown> = {},
  ): AuditEntry {
    return {
      id: `${incidentId}-${action}-${Date.now()}`,
      incidentId,
      timestamp: new Date().toISOString(),
      userId: "u1",
      userName: department.name,
      departmentId: department.id,
      departmentName: department.name,
      action,
      details,
      metadata,
      ipAddress: "127.0.0.1",
    };
  }

  private requireRecord(incidentId: string, records = this.records$.value): WorkflowRecord {
    const record = records.find((r) => r.incident.id === incidentId);
    if (!record) {
      throw new Error(`Incident ${incidentId} not found`);
    }
    return record;
  }

  private persist(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.records$.value));
    } catch {
      // Ignore storage errors in demo mode
    }
  }

  private load(): WorkflowRecord[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return [this.seedRecord()];
      }
      const parsed = JSON.parse(raw) as WorkflowRecord[];
      return parsed.length ? parsed : [this.seedRecord()];
    } catch {
      return [this.seedRecord()];
    }
  }

  private seedRecord(): WorkflowRecord {
    const incident = this.createSeedIncident();
    const type = incident.type;
    const chain = type.departmentChain;
    const steps = chain.steps.map((step) => ({
      order: step.order,
      department: step.department,
      checklist: this.buildChecklistForFlow(
        "SUPPORT_TO_OPERATIONS",
        incident.id,
        step.department,
      ),
      expectedActions: step.expectedActions,
      completed: false,
    }));

    return {
      incident,
      type,
      chain,
      steps,
      currentStepIndex: 1,
      checklistByDepartment: Object.fromEntries(
        steps.map((s) => [s.department.code, s.checklist]),
      ),
      auditTrail: [
        this.audit(
          incident.id,
          "CREATED",
          incident.originDepartment,
          "Seed incident created",
        ),
      ],
      attachments: [],
      escalations: [],
      slaState: {
        incidentId: incident.id,
        overallStatus: "WITHIN_SLA",
        metrics: [],
        breaches: [],
      },
    };
  }

  private createSeedIncident(): Incident {
    const now = new Date().toISOString();
    return {
      id: "INC-001",
      referenceNumber: "INC-2024-001",
      title: "Network connectivity issue in Building A",
      description: "Multiple users reporting intermittent connectivity",
      type: this.buildType("SUPPORT_TO_OPERATIONS"),
      priority: "HIGH",
      status: "IN_PROGRESS",
      currentDepartment: this.department("OPS", "Operations"),
      originDepartment: this.department("SUP", "Support"),
      createdBy: this.mockUser(this.department("SUP", "Support")),
      createdAt: now,
      updatedAt: now,
      tags: ["network", "critical"],
      customFields: {
        flowType: "SUPPORT_TO_OPERATIONS",
        customerConsent: true,
        firstLineChecks: ["Line test", "Power cycle", "ONT lights checked"],
      },
    };
  }
}
