import { Injectable, signal } from "@angular/core";

import { WorkflowActionRequest } from "../../core/contracts/workflow-action.contract";
import { IncidentWorkflowState } from "../../core/contracts/workflow-state.contract";
import { Attachment } from "../../shared/models/attachment.model";
import { AuditEntry } from "../../shared/models/audit.model";
import {
  Checklist,
  ChecklistItemUpdatePayload,
} from "../../shared/models/checklist.model";
import { Incident, IncidentType } from "../../shared/models/incident.model";
import { SlaState } from "../../shared/models/sla.model";
import { Department, User } from "../../shared/models/user.model";
import { Escalation } from "../../shared/models/escalation.model";

type DepartmentCode = "SUP" | "OPS" | "ACC";
type DepartmentName = "Support" | "Operations" | "Accounts";
type IncidentStatus = Incident["status"];

type OperationsDispatchPayload = {
  technicianName?: string;
  bookingDate?: string;
  bookingWindow?: string;
  calloutStatus?: string;
  notes?: string;
};

type AccountsPayload = {
  actionType?: string;
  requestedValue?: string;
  approvedBy?: string;
  notes?: string;
  effectiveDate?: string;
  approved?: boolean;
};

const SUPPORT_DEPARTMENT: Department = {
  id: "SUP",
  name: "Support",
  code: "SUP",
  isActive: true,
};

const OPERATIONS_DEPARTMENT: Department = {
  id: "OPS",
  name: "Operations",
  code: "OPS",
  isActive: true,
};

const ACCOUNTS_DEPARTMENT: Department = {
  id: "ACC",
  name: "Accounts",
  code: "ACC",
  isActive: true,
};

const MOCK_AGENT: User = {
  id: "usr-1",
  displayName: "System Agent",
  email: "agent@test.com",
  department: SUPPORT_DEPARTMENT,
  role: {
    id: "role-agent",
    name: "AGENT",
    departmentId: SUPPORT_DEPARTMENT.id,
    permissions: [],
  },
  permissions: [],
};

const DEFAULT_INCIDENT_TYPE = (
  currentDepartment: Department,
): IncidentType => ({
  id: "TYPE-DEFAULT",
  name: "Service Incident",
  code: "SRV-DEFAULT",
  description: "Standard service workflow",
  departmentChain: {
    id: "CHAIN-SUP-ACC-OPS",
    name: "Support -> Accounts -> Operations",
    allowParallel: false,
    requireStrictOrder: true,
    steps: [
      {
        order: 1,
        department: SUPPORT_DEPARTMENT,
        checklist: {
          id: "chk-sup",
          name: "Support triage checklist",
          departmentId: SUPPORT_DEPARTMENT.id,
          incidentTypeId: "TYPE-DEFAULT",
          items: [],
        },
        expectedActions: [
          "ESCALATE_TO_OPERATIONS",
          "ESCALATE_TO_ACCOUNTS",
          "CLOSE_INCIDENT",
        ],
        sla: { responseTime: 30, resolutionTime: 240, escalationPoint: 45 },
        isOptional: false,
      },
      {
        order: 2,
        department: ACCOUNTS_DEPARTMENT,
        checklist: {
          id: "chk-acc",
          name: "Accounts review checklist",
          departmentId: ACCOUNTS_DEPARTMENT.id,
          incidentTypeId: "TYPE-DEFAULT",
          items: [],
        },
        expectedActions: [
          "APPROVE_CHANGE",
          "REJECT_CHANGE",
          "RETURN_TO_SUPPORT",
        ],
        sla: { responseTime: 60, resolutionTime: 360, escalationPoint: 120 },
        isOptional: true,
      },
      {
        order: 3,
        department: OPERATIONS_DEPARTMENT,
        checklist: {
          id: "chk-ops",
          name: "Operations dispatch checklist",
          departmentId: OPERATIONS_DEPARTMENT.id,
          incidentTypeId: "TYPE-DEFAULT",
          items: [],
        },
        expectedActions: [
          "SCHEDULE_TECHNICIAN",
          "COMPLETE_TECHNICAL_WORK",
          "RETURN_TO_SUPPORT",
        ],
        sla: { responseTime: 45, resolutionTime: 480, escalationPoint: 90 },
        isOptional: true,
      },
    ],
  },
  defaultChecklists: [],
  slaRules: [],
  escalationRules: [],
  isActive: true,
});

@Injectable({
  providedIn: "root",
})
export class WorkflowStateService {
  private readonly incidents = signal<Incident[]>([
    this.createSeedIncident({
      id: "INC-1001",
      referenceNumber: "INC-1001",
      title: "Customer fibre outage",
      description: "Customer reports intermittent fibre connectivity.",
      status: "IN_PROGRESS",
      currentDepartment: OPERATIONS_DEPARTMENT,
      priority: "HIGH",
      tags: ["outage", "fibre"],
      customFields: { workflowState: "OPERATIONS_PENDING" },
    }),
    this.createSeedIncident({
      id: "INC-1002",
      referenceNumber: "INC-1002",
      title: "Incorrect debit date",
      description: "Customer requested billing date change.",
      status: "OPEN",
      currentDepartment: ACCOUNTS_DEPARTMENT,
      priority: "MEDIUM",
      tags: ["billing"],
      customFields: { workflowState: "ACCOUNTS_REVIEW" },
    }),
    this.createSeedIncident({
      id: "INC-1003",
      referenceNumber: "INC-1003",
      title: "Planned maintenance notice",
      description: "Maintenance window needs customer notification.",
      status: "ESCALATED",
      currentDepartment: SUPPORT_DEPARTMENT,
      priority: "MEDIUM",
      tags: ["maintenance"],
      customFields: { workflowState: "SUPPORT_REVIEW" },
    }),
  ]);

  private readonly workflowStates = signal<
    Record<string, IncidentWorkflowState>
  >({
    "INC-1001": {
      incidentId: "INC-1001",
      workflowState: "OPERATIONS_PENDING",
      currentDepartment: "Operations",
      allowedActions: [
        "SCHEDULE_TECHNICIAN",
        "RETURN_TO_SUPPORT",
        "COMPLETE_TECHNICAL_WORK",
      ],
      checklistState: [
        {
          key: "router-reboot",
          label: "Router reboot confirmed",
          completed: true,
          required: true,
        },
        {
          key: "ont-check",
          label: "ONT status checked",
          completed: true,
          required: true,
        },
        {
          key: "customer-confirmed",
          label: "Customer availability confirmed",
          completed: false,
          required: true,
        },
      ],
      slaState: {
        status: "warning",
        dueAt: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
        minutesRemaining: 45,
      },
      ownership: {
        department: "Operations",
        assignee: "Field Dispatch",
      },
      timeline: [
        {
          at: new Date().toISOString(),
          type: "ESCALATED",
          message: "Escalated from Support to Operations",
        },
      ],
      escalationState: { active: false },
    },
    "INC-1002": {
      incidentId: "INC-1002",
      workflowState: "ACCOUNTS_REVIEW",
      currentDepartment: "Accounts",
      allowedActions: ["APPROVE_CHANGE", "REJECT_CHANGE", "RETURN_TO_SUPPORT"],
      checklistState: [
        {
          key: "reference-check",
          label: "Reference verified",
          completed: true,
          required: true,
        },
        {
          key: "payment-check",
          label: "Payment status reviewed",
          completed: false,
          required: true,
        },
      ],
      slaState: {
        status: "ok",
        dueAt: new Date(Date.now() + 1000 * 60 * 180).toISOString(),
        minutesRemaining: 180,
      },
      ownership: {
        department: "Accounts",
        assignee: "Accounts Queue",
      },
      timeline: [
        {
          at: new Date().toISOString(),
          type: "CREATED",
          message: "Assigned to Accounts",
        },
      ],
      escalationState: { active: false },
    },
    "INC-1003": {
      incidentId: "INC-1003",
      workflowState: "SUPPORT_REVIEW",
      currentDepartment: "Support",
      allowedActions: [
        "ESCALATE_TO_OPERATIONS",
        "ESCALATE_TO_ACCOUNTS",
        "CLOSE_INCIDENT",
      ],
      checklistState: [
        {
          key: "notice-drafted",
          label: "Maintenance notice drafted",
          completed: true,
          required: true,
        },
      ],
      slaState: {
        status: "ok",
        dueAt: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
        minutesRemaining: 120,
      },
      ownership: {
        department: "Support",
        assignee: "Support Queue",
      },
      timeline: [
        {
          at: new Date().toISOString(),
          type: "CREATED",
          message: "Maintenance notice created",
        },
      ],
      escalationState: { active: false },
    },
  });

  private readonly attachments = signal<Record<string, Attachment[]>>({
    "INC-1001": [],
    "INC-1002": [],
    "INC-1003": [],
  });

  private readonly escalations = signal<Record<string, Escalation[]>>({
    "INC-1001": [],
    "INC-1002": [],
    "INC-1003": [],
  });

  getIncidents(): Incident[] {
    return this.incidents();
  }

  getIncident(id: string): Incident | null {
    return this.incidents().find((incident) => incident.id === id) ?? null;
  }

  createIncident(incident: Partial<Incident>): Incident {
    const now = new Date().toISOString();
    const id = incident.id ?? `INC-${Math.floor(1000 + Math.random() * 9000)}`;
    const currentDepartment = incident.currentDepartment ?? SUPPORT_DEPARTMENT;

    const created: Incident = {
      id,
      referenceNumber: incident.referenceNumber ?? id,
      title: incident.title ?? "New incident",
      description: incident.description ?? "",
      type: incident.type ?? DEFAULT_INCIDENT_TYPE(currentDepartment),
      priority: incident.priority ?? "MEDIUM",
      status: incident.status ?? "OPEN",
      currentDepartment,
      originDepartment: incident.originDepartment ?? SUPPORT_DEPARTMENT,
      assignedTo: incident.assignedTo,
      createdBy: incident.createdBy ?? MOCK_AGENT,
      createdAt: incident.createdAt ?? now,
      updatedAt: now,
      resolvedAt: incident.resolvedAt,
      closedAt: incident.closedAt,
      tags: incident.tags ?? [],
      customFields: incident.customFields ?? {},
    };

    this.incidents.update((items) => [created, ...items]);
    this.ensureWorkflowState(
      id,
      this.departmentCodeToName(created.currentDepartment.code),
    );
    +this.attachments.update((items) => ({ ...items, [id]: items[id] ?? [] }));
    +this.escalations.update((items) => ({ ...items, [id]: items[id] ?? [] }));

    return created;
  }

  updateIncident(id: string, updates: Partial<Incident>): Incident | null {
    let updatedIncident: Incident | null = null;

    this.incidents.update((items) =>
      items.map((item) => {
        if (item.id !== id) {
          return item;
        }

        updatedIncident = {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString(),
          customFields: {
            ...item.customFields,
            ...(updates.customFields ?? {}),
          },
        };

        return updatedIncident;
      }),
    );

    return updatedIncident;
  }

  getIncidentChain(
    incidentId: string,
  ): Incident["type"]["departmentChain"] | null {
    return this.getIncident(incidentId)?.type?.departmentChain ?? null;
  }

  getChecklist(incidentId: string): Checklist {
    const state = this.workflowStates()[incidentId];

    return {
      id: `checklist-${incidentId}`,
      incidentId,
      chainStepId: `step-${this.departmentNameToCode(state?.currentDepartment ?? "Support").toLowerCase()}`,
      departmentId: this.departmentNameToCode(
        state?.currentDepartment ?? "Support",
      ),
      items: (state?.checklistState ?? []).map((item, index) => ({
        id: item.key,
        description: item.label,
        isCompleted: item.completed,
        isRequired: item.required,
        completedAt: item.completed ? new Date().toISOString() : undefined,
        completedBy: item.completed ? "system" : undefined,
        order: index + 1,
        category: "OPERATIONS",
        evidenceRequired: false,
      })),
      status: this.computeChecklistStatus(state?.checklistState ?? []),
    };
  }

  updateChecklistItem(
    incidentId: string,
    itemId: string,
    payload: ChecklistItemUpdatePayload,
  ): Checklist {
    const current = this.workflowStates()[incidentId];
    if (!current) {
      return this.getChecklist(incidentId);
    }

    const updatedChecklist = current.checklistState.map((item) =>
      item.key === itemId
        ? {
            ...item,
            completed: payload.isCompleted,
          }
        : item,
    );

    this.workflowStates.update((states) => ({
      ...states,
      [incidentId]: {
        ...current,
        checklistState: updatedChecklist,
      },
    }));

    this.appendTimeline(
      incidentId,
      "CHECKLIST_ITEM_COMPLETED",
      `Checklist item ${itemId} completed`,
    );
    return this.getChecklist(incidentId);
  }

  getAttachments(incidentId: string): Attachment[] {
    return this.attachments()[incidentId] ?? [];
  }

  getAuditTrail(incidentId: string): AuditEntry[] {
    const timeline = this.workflowStates()[incidentId]?.timeline ?? [];

    return timeline.map((entry, index) => ({
      id: `${incidentId}-${index + 1}`,
      incidentId,
      timestamp: entry.at,
      userId: MOCK_AGENT.id,
      userName: MOCK_AGENT.displayName,
      departmentId: this.departmentNameToCode(
        this.workflowStates()[incidentId]?.currentDepartment ?? "Support",
      ),
      departmentName:
        this.workflowStates()[incidentId]?.currentDepartment ?? "Support",
      action: this.toAuditAction(entry.type),
      details: entry.message,
      metadata: {},
      ipAddress: "127.0.0.1",
    }));
  }

  getEscalations(incidentId: string): Escalation[] {
    return this.escalations()[incidentId] ?? [];
  }

  getSlaState(incidentId: string): SlaState {
    const state = this.workflowStates()[incidentId]?.slaState;
    const now = new Date().toISOString();

    return {
      incidentId,
      metrics: [
        {
          metric: "RESOLUTION",
          target: 240,
          elapsed: state?.minutesRemaining
            ? Math.max(0, 240 - state.minutesRemaining)
            : 0,
          status: this.mapWorkflowSlaStatus(state?.status ?? "ok"),
          deadline: state?.dueAt ?? now,
          breachAt: state?.dueAt ?? now,
        },
      ],
      overallStatus: this.mapWorkflowSlaStatus(state?.status ?? "ok"),
      nextBreach: state?.dueAt,
      breaches: [],
    };
  }

  moveIncident(
    incidentId: string,
    payload: { fromDepartmentCode: string; toDepartmentCode: string },
  ): Incident | null {
    const targetDepartment = this.departmentCodeToDepartment(
      payload.toDepartmentCode,
    );

    const incident = this.updateIncident(incidentId, {
      currentDepartment: targetDepartment,
      status: targetDepartment.code === "SUP" ? "OPEN" : "IN_PROGRESS",
      customFields: {
        workflowState: `${targetDepartment.name.toUpperCase()}_PENDING`,
      },
    });

    const workflowState = this.workflowStates()[incidentId];
    if (workflowState) {
      this.workflowStates.update((states) => ({
        ...states,
        [incidentId]: {
          ...workflowState,
          currentDepartment: this.departmentCodeToName(targetDepartment.code),
          workflowState: `${targetDepartment.name.toUpperCase()}_PENDING`,
          allowedActions: this.defaultActionsForDepartment(
            targetDepartment.code as DepartmentCode,
          ),
        },
      }));
    }

    this.appendTimeline(
      incidentId,
      "DEPARTMENT_TRANSITION",
      `Moved from ${payload.fromDepartmentCode} to ${payload.toDepartmentCode}`,
    );

    return incident;
  }

  updateAccountsProcessing(
    incidentId: string,
    payload: AccountsPayload = {},
  ): IncidentWorkflowState | null {
    const incident = this.getIncident(incidentId);
    if (!incident) {
      return null;
    }

    this.updateIncident(incidentId, {
      customFields: {
        accountsProcessing: {
          ...payload,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    return this.applyWorkflowMutation(incidentId, {
      workflowState: payload.approved ? "ACCOUNTS_APPROVED" : "ACCOUNTS_REVIEW",
      allowedActions: payload.approved
        ? ["RETURN_TO_SUPPORT"]
        : ["APPROVE_CHANGE", "REJECT_CHANGE", "RETURN_TO_SUPPORT"],
      currentDepartment: "Accounts",
      ownership: {
        department: "Accounts",
        assignee: payload.approvedBy ?? "Accounts Queue",
      },
      timelineType: payload.approved ? "APPROVED" : "UPDATED",
      timelineMessage: payload.notes ?? "Accounts processing updated",
    });
  }

  updateOperationsDispatch(
    incidentId: string,
    payload: OperationsDispatchPayload = {},
  ): IncidentWorkflowState | null {
    const incident = this.getIncident(incidentId);
    if (!incident) {
      return null;
    }

    this.updateIncident(incidentId, {
      customFields: {
        operationsDispatch: {
          ...payload,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    return this.applyWorkflowMutation(incidentId, {
      workflowState:
        payload.calloutStatus === "COMPLETED"
          ? "TECHNICAL_WORK_COMPLETED"
          : "TECHNICIAN_SCHEDULED",
      allowedActions:
        payload.calloutStatus === "COMPLETED"
          ? ["RETURN_TO_SUPPORT"]
          : ["RETURN_TO_SUPPORT", "COMPLETE_TECHNICAL_WORK"],
      currentDepartment: "Operations",
      ownership: {
        department: "Operations",
        assignee: payload.technicianName || "Field Dispatch",
      },
      timelineType: "UPDATED",
      timelineMessage: payload.notes ?? "Operations dispatch updated",
    });
  }

  completeCurrentStep(incidentId: string): IncidentWorkflowState | null {
    return this.applyWorkflowMutation(incidentId, {
      workflowState: "STEP_COMPLETED",
      allowedActions: ["RETURN_TO_SUPPORT"],
      timelineType: "STATUS_CHANGED",
      timelineMessage: "Current workflow step completed",
    });
  }

  sendBack(incidentId: string, reason: string): IncidentWorkflowState | null {
    return this.submitWorkflowAction({
      incidentId,
      action: "RETURN_TO_SUPPORT",
      payload: { reason },
    });
  }

  submitWorkflowAction(
    request: WorkflowActionRequest,
  ): IncidentWorkflowState | null {
    const action = request.action;

    switch (action) {
      case "RETURN_TO_SUPPORT":
        return this.applyWorkflowMutation(request.incidentId, {
          workflowState: "SUPPORT_REVIEW",
          currentDepartment: "Support",
          allowedActions: [
            "ESCALATE_TO_OPERATIONS",
            "ESCALATE_TO_ACCOUNTS",
            "CLOSE_INCIDENT",
          ],
          ownership: {
            department: "Support",
            assignee: "Support Queue",
          },
          timelineType: "DEPARTMENT_TRANSITION",
          timelineMessage: `Returned to Support${request.payload?.["reason"] ? `: ${String(request.payload["reason"])}` : ""}`,
        });

      case "COMPLETE_TECHNICAL_WORK":
        return this.applyWorkflowMutation(request.incidentId, {
          workflowState: "TECHNICAL_WORK_COMPLETED",
          allowedActions: ["RETURN_TO_SUPPORT"],
          timelineType: "STATUS_CHANGED",
          timelineMessage: "Technical work completed",
        });

      case "SCHEDULE_TECHNICIAN":
        return this.applyWorkflowMutation(request.incidentId, {
          workflowState: "TECHNICIAN_SCHEDULED",
          allowedActions: ["RETURN_TO_SUPPORT", "COMPLETE_TECHNICAL_WORK"],
          timelineType: "UPDATED",
          timelineMessage: "Technician scheduled",
        });

      case "APPROVE_CHANGE":
        return this.applyWorkflowMutation(request.incidentId, {
          workflowState: "ACCOUNTS_APPROVED",
          allowedActions: ["RETURN_TO_SUPPORT"],
          timelineType: "STATUS_CHANGED",
          timelineMessage: "Accounts change approved",
        });

      case "REJECT_CHANGE":
        return this.applyWorkflowMutation(request.incidentId, {
          workflowState: "ACCOUNTS_REJECTED",
          allowedActions: ["RETURN_TO_SUPPORT"],
          timelineType: "STATUS_CHANGED",
          timelineMessage: "Accounts change rejected",
        });

      case "ESCALATE_TO_OPERATIONS":
        return this.applyWorkflowMutation(request.incidentId, {
          workflowState: "OPERATIONS_PENDING",
          currentDepartment: "Operations",
          allowedActions: [
            "SCHEDULE_TECHNICIAN",
            "RETURN_TO_SUPPORT",
            "COMPLETE_TECHNICAL_WORK",
          ],
          ownership: {
            department: "Operations",
            assignee: "Field Dispatch",
          },
          timelineType: "DEPARTMENT_TRANSITION",
          timelineMessage: "Escalated to Operations",
        });

      case "ESCALATE_TO_ACCOUNTS":
        return this.applyWorkflowMutation(request.incidentId, {
          workflowState: "ACCOUNTS_REVIEW",
          currentDepartment: "Accounts",
          allowedActions: [
            "APPROVE_CHANGE",
            "REJECT_CHANGE",
            "RETURN_TO_SUPPORT",
          ],
          ownership: {
            department: "Accounts",
            assignee: "Accounts Queue",
          },
          timelineType: "DEPARTMENT_TRANSITION",
          timelineMessage: "Escalated to Accounts",
        });

      case "CLOSE_INCIDENT":
        return this.applyWorkflowMutation(request.incidentId, {
          workflowState: "CLOSED",
          allowedActions: [],
          timelineType: "STATUS_CHANGED",
          timelineMessage: "Incident closed",
          status: "CLOSED",
        });

      default:
        return this.workflowStates()[request.incidentId] ?? null;
    }
  }

  private createSeedIncident(seed: {
    id: string;
    referenceNumber: string;
    title: string;
    description: string;
    status: IncidentStatus;
    currentDepartment: Department;
    priority: Incident["priority"];
    tags: string[];
    customFields: Record<string, unknown>;
  }): Incident {
    const now = new Date().toISOString();

    return {
      id: seed.id,
      referenceNumber: seed.referenceNumber,
      title: seed.title,
      description: seed.description,
      type: DEFAULT_INCIDENT_TYPE(seed.currentDepartment),
      priority: seed.priority,
      status: seed.status,
      currentDepartment: seed.currentDepartment,
      originDepartment: SUPPORT_DEPARTMENT,
      createdBy: MOCK_AGENT,
      createdAt: now,
      updatedAt: now,
      tags: seed.tags,
      customFields: seed.customFields,
    };
  }

  private applyWorkflowMutation(
    incidentId: string,
    mutation: {
      workflowState: string;
      allowedActions: string[];
      currentDepartment?: DepartmentName;
      ownership?: { department: DepartmentName; assignee?: string };
      timelineType: string;
      timelineMessage: string;
      status?: IncidentStatus;
    },
  ): IncidentWorkflowState | null {
    const current = this.workflowStates()[incidentId];
    if (!current) {
      return null;
    }

    const currentDepartment =
      mutation.currentDepartment ?? current.currentDepartment;
    const updated: IncidentWorkflowState = {
      ...current,
      workflowState: mutation.workflowState,
      currentDepartment,
      allowedActions: mutation.allowedActions,
      ownership: mutation.ownership ?? current.ownership,
      timeline: [
        ...current.timeline,
        {
          at: new Date().toISOString(),
          type: mutation.timelineType,
          message: mutation.timelineMessage,
        },
      ],
    };

    this.workflowStates.update((states) => ({
      ...states,
      [incidentId]: updated,
    }));

    this.incidents.update((items) =>
      items.map((item) =>
        item.id === incidentId
          ? {
              ...item,
              status:
                mutation.status ??
                this.mapWorkflowStateToStatus(
                  mutation.workflowState,
                  item.status,
                ),
              currentDepartment: this.departmentCodeToDepartment(
                this.departmentNameToCode(currentDepartment),
              ),
              updatedAt: new Date().toISOString(),
              customFields: {
                ...item.customFields,
                workflowState: mutation.workflowState,
              },
            }
          : item,
      ),
    );

    this.appendTimeline(
      incidentId,
      mutation.timelineType,
      mutation.timelineMessage,
    );
    return updated;
  }

  private ensureWorkflowState(
    incidentId: string,
    department: DepartmentName,
  ): void {
    if (this.workflowStates()[incidentId]) {
      return;
    }

    this.workflowStates.update((states) => ({
      ...states,
      [incidentId]: {
        incidentId,
        workflowState: "NEW",
        currentDepartment: department,
        allowedActions: this.defaultActionsForDepartment(
          this.departmentNameToCode(department),
        ),
        checklistState: [],
        slaState: { status: "ok" },
        ownership: { department },
        timeline: [],
        escalationState: { active: false },
      },
    }));
  }

  private appendTimeline(
    incidentId: string,
    type: string,
    message: string,
  ): void {
    const current = this.workflowStates()[incidentId];
    if (!current) {
      return;
    }

    this.workflowStates.update((states) => ({
      ...states,
      [incidentId]: {
        ...current,
        timeline: [
          ...current.timeline,
          {
            at: new Date().toISOString(),
            type,
            message,
          },
        ],
      },
    }));
  }

  private computeChecklistStatus(
    checklistState: IncidentWorkflowState["checklistState"],
  ): Checklist["status"] {
    if (!checklistState.length) {
      return "NOT_STARTED";
    }

    if (checklistState.every((item) => item.completed)) {
      return "COMPLETED";
    }

    if (checklistState.some((item) => item.completed)) {
      return "IN_PROGRESS";
    }

    return "NOT_STARTED";
  }

  private toAuditAction(value: string): AuditEntry["action"] {
    switch (value) {
      case "CREATED":
      case "UPDATED":
      case "CHECKLIST_ITEM_COMPLETED":
      case "CLOSED":
        return value;
      case "ESCALATED":
      case "DEPARTMENT_TRANSITION":
        return "DEPARTMENT_TRANSITION";
      case "STATUS_CHANGED":
        return "STATUS_CHANGED";
      default:
        return "CUSTOM";
    }
  }

  private mapWorkflowSlaStatus(
    status: "ok" | "warning" | "breach",
  ): SlaState["overallStatus"] {
    switch (status) {
      case "warning":
        return "APPROACHING_BREACH";
      case "breach":
        return "BREACHED";
      default:
        return "WITHIN_SLA";
    }
  }

  private defaultActionsForDepartment(
    departmentCode: DepartmentCode,
  ): string[] {
    switch (departmentCode) {
      case "OPS":
        return [
          "SCHEDULE_TECHNICIAN",
          "RETURN_TO_SUPPORT",
          "COMPLETE_TECHNICAL_WORK",
        ];
      case "ACC":
        return ["APPROVE_CHANGE", "REJECT_CHANGE", "RETURN_TO_SUPPORT"];
      default:
        return [
          "ESCALATE_TO_OPERATIONS",
          "ESCALATE_TO_ACCOUNTS",
          "CLOSE_INCIDENT",
        ];
    }
  }

  private departmentNameToCode(name: DepartmentName): DepartmentCode {
    switch (name) {
      case "Operations":
        return "OPS";
      case "Accounts":
        return "ACC";
      default:
        return "SUP";
    }
  }

  private departmentCodeToName(code: string): DepartmentName {
    switch (String(code).toUpperCase()) {
      case "OPS":
        return "Operations";
      case "ACC":
        return "Accounts";
      default:
        return "Support";
    }
  }

  private departmentCodeToDepartment(code: string): Department {
    switch (String(code).toUpperCase()) {
      case "OPS":
        return OPERATIONS_DEPARTMENT;
      case "ACC":
        return ACCOUNTS_DEPARTMENT;
      default:
        return SUPPORT_DEPARTMENT;
    }
  }

  private mapWorkflowStateToStatus(
    workflowState: string,
    fallback: IncidentStatus,
  ): IncidentStatus {
    if (workflowState === "CLOSED") {
      return "CLOSED";
    }

    if (workflowState.includes("PENDING") || workflowState.includes("REVIEW")) {
      return "IN_PROGRESS";
    }

    if (
      workflowState === "STEP_COMPLETED" ||
      workflowState === "TECHNICAL_WORK_COMPLETED"
    ) {
      return "PENDING_TRANSITION";
    }

    return fallback;
  }
}
