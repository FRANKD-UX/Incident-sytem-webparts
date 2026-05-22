import { Injectable } from "@angular/core";
import { HttpRequest } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";
import {
  AdminDashboardStats,
  DashboardSummary,
} from "../shared/models/dashboard.model";
import { Incident, DepartmentChain } from "../shared/models/incident.model";
import { Checklist } from "../shared/models/checklist.model";
import { Attachment } from "../shared/models/attachment.model";
import { AuditEntry } from "../shared/models/audit.model";
import { SlaState } from "../shared/models/sla.model";
import { Escalation } from "../shared/models/escalation.model";
import { Department, User, UserPermissions } from "../shared/models/user.model";
import { PaginatedResponse } from "../shared/models/common.model";

export class MockBackendError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

@Injectable({ providedIn: "root" })
export class MockBackendService {
  private readonly departments: Department[] = [
    { id: "1", name: "Support", code: "SUP", isActive: true },
    { id: "2", name: "Operations", code: "OPS", isActive: true },
    { id: "3", name: "Infrastructure", code: "INF", isActive: true },
  ];

  private readonly departmentChains: DepartmentChain[] = [
    {
      id: "chain-standard",
      name: "Standard Incident Chain",
      allowParallel: false,
      requireStrictOrder: true,
      steps: [],
    },
    {
      id: "chain-critical",
      name: "Critical Incident Chain",
      allowParallel: false,
      requireStrictOrder: true,
      steps: [],
    },
  ];

  private incidents: Incident[] = [
    this.createIncidentRecord({
      id: "INC-001",
      referenceNumber: "INC-2026-001",
      title: "Finance portal outage",
      description: "Finance users cannot load the portal homepage.",
      priority: "CRITICAL",
      status: "ESCALATED",
      currentDepartmentId: "3",
      originDepartmentId: "1",
      tags: ["finance", "portal"],
    }),
    this.createIncidentRecord({
      id: "INC-002",
      referenceNumber: "INC-2026-002",
      title: "Network latency in Building A",
      description: "Intermittent packet loss impacting the access layer.",
      priority: "HIGH",
      status: "IN_PROGRESS",
      currentDepartmentId: "2",
      originDepartmentId: "1",
      tags: ["network", "latency"],
    }),
    this.createIncidentRecord({
      id: "INC-003",
      referenceNumber: "INC-2026-003",
      title: "VPN authentication errors",
      description: "Remote staff are unable to establish new VPN sessions.",
      priority: "HIGH",
      status: "OPEN",
      currentDepartmentId: "1",
      originDepartmentId: "1",
      tags: ["vpn", "authentication"],
    }),
  ];

  private readonly checklists = new Map<string, Checklist>([
    [
      "INC-001",
      {
        id: "CL-001",
        incidentId: "INC-001",
        chainStepId: "STEP-1",
        departmentId: "3",
        status: "IN_PROGRESS",
        items: [
          {
            id: "CI-001",
            description: "Collect outage evidence from infrastructure monitoring.",
            isCompleted: true,
            isRequired: true,
            completedAt: new Date().toISOString(),
            completedBy: "Jane Smith",
            order: 1,
            category: "Evidence",
            evidenceRequired: true,
            evidenceType: "ATTACHMENT",
          },
          {
            id: "CI-002",
            description: "Confirm stakeholder communications have been issued.",
            isCompleted: false,
            isRequired: true,
            order: 2,
            category: "Communication",
            evidenceRequired: false,
          },
        ],
      },
    ],
    [
      "INC-002",
      {
        id: "CL-002",
        incidentId: "INC-002",
        chainStepId: "STEP-2",
        departmentId: "2",
        status: "IN_PROGRESS",
        items: [
          {
            id: "CI-003",
            description: "Validate switch health and uplink telemetry.",
            isCompleted: false,
            isRequired: true,
            order: 1,
            category: "Technical",
            evidenceRequired: false,
          },
        ],
      },
    ],
    [
      "INC-003",
      {
        id: "CL-003",
        incidentId: "INC-003",
        chainStepId: "STEP-1",
        departmentId: "1",
        status: "NOT_STARTED",
        items: [
          {
            id: "CI-004",
            description: "Confirm Entra ID sign-in logs for failed VPN attempts.",
            isCompleted: false,
            isRequired: true,
            order: 1,
            category: "Authentication",
            evidenceRequired: true,
            evidenceType: "ATTACHMENT",
          },
        ],
      },
    ],
  ]);

  private readonly attachments = new Map<string, Attachment[]>([
    [
      "INC-001",
      [
        {
          id: "ATT-001",
          incidentId: "INC-001",
          fileName: "portal-outage-timeline.pdf",
          fileType: "application/pdf",
          fileSize: 182340,
          uploadedBy: "Jane Smith",
          uploadedAt: new Date().toISOString(),
          category: "DOCUMENT",
          isProofOfUptime: false,
          url: "#",
          metadata: {
            uploadedFromDepartment: "Infrastructure",
            description: "Bridge notes and monitoring evidence",
            tags: ["timeline", "evidence"],
          },
        },
      ],
    ],
    ["INC-002", []],
    ["INC-003", []],
  ]);

  private readonly auditTrail = new Map<string, AuditEntry[]>([
    [
      "INC-001",
      [
        {
          id: "AUD-001",
          incidentId: "INC-001",
          timestamp: new Date().toISOString(),
          userId: "1",
          userName: "Jane Smith",
          departmentId: "1",
          departmentName: "Support",
          action: "CREATED",
          details: "Incident created from service desk triage.",
          metadata: {},
          ipAddress: "127.0.0.1",
        },
      ],
    ],
    ["INC-002", []],
    ["INC-003", []],
  ]);

  private readonly escalations = new Map<string, Escalation[]>([
    [
      "INC-001",
      [
        {
          id: "ESC-001",
          incidentId: "INC-001",
          triggerType: "SLA_BREACH",
          triggerTime: new Date().toISOString(),
          escalatedTo: "Infrastructure Manager",
          escalatedFrom: "Operations Lead",
          reason: "Initial response target exceeded",
          status: "ACTIVE",
          notes: ["Executive stakeholders notified"],
        },
      ],
    ],
    ["INC-002", []],
    ["INC-003", []],
  ]);

  private readonly slaStates = new Map<string, SlaState>([
    [
      "INC-001",
      {
        incidentId: "INC-001",
        overallStatus: "BREACHED",
        nextBreach: undefined,
        metrics: [
          {
            metric: "INITIAL_RESPONSE",
            target: 15,
            elapsed: 22,
            status: "BREACHED",
            deadline: new Date(Date.now() - 15 * 60_000).toISOString(),
            breachAt: new Date(Date.now() - 7 * 60_000).toISOString(),
          },
        ],
        breaches: [
          {
            id: "BR-001",
            metric: "INITIAL_RESPONSE",
            breachedAt: new Date(Date.now() - 7 * 60_000).toISOString(),
            severity: "CRITICAL",
            acknowledged: true,
          },
        ],
      },
    ],
    [
      "INC-002",
      {
        incidentId: "INC-002",
        overallStatus: "APPROACHING_BREACH",
        nextBreach: new Date(Date.now() + 20 * 60_000).toISOString(),
        metrics: [
          {
            metric: "RESOLUTION",
            target: 240,
            elapsed: 198,
            status: "APPROACHING_BREACH",
            deadline: new Date(Date.now() + 42 * 60_000).toISOString(),
            breachAt: new Date(Date.now() + 42 * 60_000).toISOString(),
          },
        ],
        breaches: [],
      },
    ],
    [
      "INC-003",
      {
        incidentId: "INC-003",
        overallStatus: "WITHIN_SLA",
        metrics: [
          {
            metric: "INITIAL_RESPONSE",
            target: 30,
            elapsed: 10,
            status: "WITHIN_SLA",
            deadline: new Date(Date.now() + 20 * 60_000).toISOString(),
            breachAt: new Date(Date.now() + 20 * 60_000).toISOString(),
          },
        ],
        breaches: [],
      },
    ],
  ]);

  private readonly userPermissions: UserPermissions = {
    userId: "1",
    departmentId: "1",
    departmentName: "Support",
    role: "Incident Administrator",
    permissions: [],
    allowedIncidentTypes: ["1"],
    allowedActions: ["CREATE", "READ", "UPDATE", "DELETE", "MANAGE"],
  };

  private readonly currentUser: User = {
    id: "1",
    displayName: "Jane Smith",
    email: "jane.smith@contoso.com",
    department: { id: "1", name: "Support", code: "SUP", isActive: true },
    role: {
      id: "role-1",
      name: "Incident Administrator",
      departmentId: "1",
      permissions: ["CREATE", "READ", "UPDATE", "DELETE", "MANAGE"],
    },
    permissions: [
      {
        resource: "INCIDENTS",
        actions: ["CREATE", "READ", "UPDATE", "DELETE", "MANAGE"],
        scope: "ALL",
      },
    ],
  };

  getDashboardSummary(): DashboardSummary {
    const incidents = this.clone(this.incidents);
    const openIncidents = incidents.filter((incident) => incident.status === "OPEN").length;
    const inProgress = incidents.filter((incident) => incident.status === "IN_PROGRESS").length;
    const escalated = incidents.filter((incident) => incident.status === "ESCALATED").length;
    const resolvedToday = incidents.filter((incident) => incident.status === "RESOLVED").length;

    return {
      kpis: [
        {
          id: "open-incidents",
          label: "Open Incidents",
          value: openIncidents,
          change: 2,
          changeType: "INCREASE",
          icon: "warning",
          color: "#ef4444",
        },
        {
          id: "in-progress",
          label: "In Progress",
          value: inProgress,
          change: 1,
          changeType: "NEUTRAL",
          icon: "pending",
          color: "#f59e0b",
        },
        {
          id: "escalated",
          label: "Escalated",
          value: escalated,
          change: 1,
          changeType: "INCREASE",
          icon: "error",
          color: "#dc2626",
        },
        {
          id: "resolved-today",
          label: "Resolved Today",
          value: resolvedToday,
          change: 0,
          changeType: "NEUTRAL",
          icon: "check_circle",
          color: "#10b981",
        },
      ],
      workloadByDepartment: this.departments.map((department) => {
        const departmentIncidents = incidents.filter(
          (incident) => incident.currentDepartment.id === department.id,
        );

        return {
          department,
          openIncidents: departmentIncidents.filter((incident) => incident.status === "OPEN").length,
          inProgress: departmentIncidents.filter(
            (incident) => incident.status === "IN_PROGRESS",
          ).length,
          escalated: departmentIncidents.filter((incident) => incident.status === "ESCALATED").length,
          avgResolutionTime: departmentIncidents.length ? 180 : 0,
          slaCompliance: departmentIncidents.length ? 89 : 100,
        };
      }),
      trends: { daily: [], weekly: [], monthly: [] },
      recentIncidents: incidents,
      slaCompliance: {
        overall: 89,
        byDepartment: this.departments.map((department) => ({
          departmentId: department.id,
          compliance: department.id === "3" ? 74 : 92,
        })),
        byPriority: [
          { priority: "CRITICAL", compliance: 72 },
          { priority: "HIGH", compliance: 86 },
          { priority: "MEDIUM", compliance: 94 },
          { priority: "LOW", compliance: 98 },
        ],
      },
    };
  }

  getAdminStats(): AdminDashboardStats {
    return {
      incidentTypes: 6,
      workflows: this.departmentChains.length,
      slaRules: 9,
      roles: 5,
    };
  }

  getIncidents(): Incident[] {
    return this.clone(this.incidents);
  }

  getIncident(incidentId: string): Incident {
    return this.clone(this.requireIncident(incidentId));
  }

  createIncident(payload: Partial<Incident>): Incident {
    const now = new Date().toISOString();
    const created = this.createIncidentRecord({
      id: `INC-${String(this.incidents.length + 1).padStart(3, "0")}`,
      referenceNumber: payload.referenceNumber ?? `INC-2026-10${this.incidents.length + 1}`,
      title: payload.title ?? "New incident",
      description: payload.description ?? "Incident description pending.",
      priority: payload.priority ?? "MEDIUM",
      status: payload.status ?? "OPEN",
      currentDepartmentId: payload.currentDepartment?.id ?? payload.originDepartment?.id ?? "1",
      originDepartmentId: payload.originDepartment?.id ?? "1",
      createdAt: now,
      updatedAt: now,
      tags: payload.tags ?? [],
      customFields: payload.customFields ?? {},
    });

    this.incidents = [created, ...this.incidents];
    this.checklists.set(created.id, {
      id: `CL-${created.id}`,
      incidentId: created.id,
      chainStepId: "STEP-1",
      departmentId: created.currentDepartment.id,
      status: "NOT_STARTED",
      items: [],
    });
    this.attachments.set(created.id, []);
    this.auditTrail.set(created.id, []);
    this.escalations.set(created.id, []);
    this.slaStates.set(created.id, {
      incidentId: created.id,
      metrics: [],
      overallStatus: "WITHIN_SLA",
      breaches: [],
    });

    return this.clone(created);
  }

  updateIncident(incidentId: string, updates: Partial<Incident>): Incident {
    const incident = this.requireIncident(incidentId);
    const updatedIncident: Incident = {
      ...incident,
      ...updates,
      currentDepartment: updates.currentDepartment ?? incident.currentDepartment,
      originDepartment: updates.originDepartment ?? incident.originDepartment,
      updatedAt: new Date().toISOString(),
    };

    this.incidents = this.incidents.map((existing) =>
      existing.id === incidentId ? updatedIncident : existing,
    );

    return this.clone(updatedIncident);
  }

  deleteIncident(incidentId: string): { acknowledged: boolean } {
    this.requireIncident(incidentId);
    this.incidents = this.incidents.filter((incident) => incident.id !== incidentId);
    this.checklists.delete(incidentId);
    this.attachments.delete(incidentId);
    this.auditTrail.delete(incidentId);
    this.escalations.delete(incidentId);
    this.slaStates.delete(incidentId);

    return { acknowledged: true };
  }

  getChecklist(incidentId: string): Checklist {
    const checklist = this.checklists.get(incidentId);
    if (!checklist) {
      throw new MockBackendError(404, "CHECKLIST_NOT_FOUND", "Checklist not found.");
    }

    return this.clone(checklist);
  }

  updateChecklistItem(
    incidentId: string,
    itemId: string,
    payload: { isCompleted?: boolean },
  ): Checklist {
    const checklist = this.getChecklist(incidentId);
    const now = new Date().toISOString();
    const items = checklist.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            isCompleted: payload.isCompleted ?? item.isCompleted,
            completedAt: payload.isCompleted ? now : undefined,
            completedBy: payload.isCompleted ? "Jane Smith" : undefined,
          }
        : item,
    );

    if (!items.some((item) => item.id === itemId)) {
      throw new MockBackendError(404, "CHECKLIST_ITEM_NOT_FOUND", "Checklist item not found.");
    }

    const updatedChecklist: Checklist = {
      ...checklist,
      items,
      status: items.every((item) => item.isCompleted) ? "COMPLETED" : "IN_PROGRESS",
      completedAt: items.every((item) => item.isCompleted) ? now : undefined,
      completedBy: items.every((item) => item.isCompleted) ? "Jane Smith" : undefined,
    };

    this.checklists.set(incidentId, updatedChecklist);
    return this.clone(updatedChecklist);
  }

  getAttachments(incidentId: string): Attachment[] {
    this.requireIncident(incidentId);
    return this.clone(this.attachments.get(incidentId) ?? []);
  }

  uploadAttachment(incidentId: string, request: HttpRequest<unknown>): Attachment[] {
    this.requireIncident(incidentId);

    const formData = request.body instanceof FormData ? request.body : null;
    const rawFile = formData?.get("file");
    const file = rawFile instanceof File ? rawFile : null;
    const uploaded = {
      id: `ATT-${Date.now()}`,
      incidentId,
      fileName: file?.name ?? String(formData?.get("fileName") ?? "attachment.bin"),
      fileType: file?.type || String(formData?.get("fileType") ?? "application/octet-stream"),
      fileSize:
        file?.size ??
        Number(formData?.get("fileSize") ?? 0),
      uploadedBy: "Jane Smith",
      uploadedAt: new Date().toISOString(),
      category: (formData?.get("category") as Attachment["category"] | null) ?? "DOCUMENT",
      isProofOfUptime: String(formData?.get("isProofOfUptime") ?? "false") === "true",
      url: "#",
      metadata: {
        uploadedFromDepartment: "Support",
        description: String(formData?.get("description") ?? ""),
        tags: [],
      },
    } satisfies Attachment;

    const attachments = [...(this.attachments.get(incidentId) ?? []), uploaded];
    this.attachments.set(incidentId, attachments);

    return this.clone(attachments);
  }

  updateAttachment(
    incidentId: string,
    attachmentId: string,
    updates: Partial<Attachment>,
  ): Attachment {
    const attachments = this.attachments.get(incidentId) ?? [];
    const existingAttachment = attachments.find((attachment) => attachment.id === attachmentId);
    if (!existingAttachment) {
      throw new MockBackendError(404, "ATTACHMENT_NOT_FOUND", "Attachment not found.");
    }

    const updatedAttachment: Attachment = {
      ...existingAttachment,
      ...updates,
      metadata: {
        ...existingAttachment.metadata,
        ...updates.metadata,
      },
    };

    this.attachments.set(
      incidentId,
      attachments.map((attachment) =>
        attachment.id === attachmentId ? updatedAttachment : attachment,
      ),
    );

    return this.clone(updatedAttachment);
  }

  deleteAttachment(
    incidentId: string,
    attachmentId: string,
  ): { acknowledged: boolean } {
    const attachments = this.attachments.get(incidentId) ?? [];
    if (!attachments.some((attachment) => attachment.id === attachmentId)) {
      throw new MockBackendError(404, "ATTACHMENT_NOT_FOUND", "Attachment not found.");
    }

    this.attachments.set(
      incidentId,
      attachments.filter((attachment) => attachment.id !== attachmentId),
    );

    return { acknowledged: true };
  }

  getAuditTrail(incidentId: string): AuditEntry[] {
    this.requireIncident(incidentId);
    return this.clone(this.auditTrail.get(incidentId) ?? []);
  }

  getEscalations(incidentId: string): Escalation[] {
    this.requireIncident(incidentId);
    return this.clone(this.escalations.get(incidentId) ?? []);
  }

  getSlaState(incidentId: string): SlaState {
    const state = this.slaStates.get(incidentId);
    if (!state) {
      throw new MockBackendError(404, "SLA_NOT_FOUND", "SLA state not found.");
    }

    return this.clone(state);
  }

  getDepartmentChains(): DepartmentChain[] {
    return this.clone(this.departmentChains);
  }

  getDepartments(): Department[] {
    return this.clone(this.departments);
  }

  deleteDepartmentChain(chainId: string): { acknowledged: boolean } {
    if (!this.departmentChains.some((chain) => chain.id === chainId)) {
      throw new MockBackendError(404, "CHAIN_NOT_FOUND", "Workflow chain not found.");
    }

    return { acknowledged: true };
  }

  moveIncident(
    incidentId: string,
    payload: { targetDepartmentId?: string; targetStatus?: Incident["status"] },
  ): Incident {
    const incident = this.requireIncident(incidentId);
    const targetDepartment = payload.targetDepartmentId
      ? this.departments.find((department) => department.id === payload.targetDepartmentId)
      : incident.currentDepartment;

    if (!targetDepartment) {
      throw new MockBackendError(
        404,
        "DEPARTMENT_NOT_FOUND",
        "Target department could not be resolved.",
      );
    }

    return this.updateIncident(incidentId, {
      currentDepartment: targetDepartment,
      status: payload.targetStatus ?? incident.status,
    });
  }

  getUserPermissions(): UserPermissions {
    return this.clone(this.userPermissions);
  }

  getCurrentUser(): User {
    return this.clone(this.currentUser);
  }

  validateAuthToken(token: string): { valid: boolean } {
    return { valid: token.trim().length > 0 };
  }

  refreshAuthToken(_token: string): { token: string } {
    return { token: `mock-refresh-token-${Date.now()}` };
  }

  getMockDashboardSummary(): Observable<DashboardSummary> {
    const summary: DashboardSummary = {
      kpis: [
        {
          id: "kpi-open",
          label: "Open",
          value: 47,
          change: 12,
          changeType: "INCREASE",
          icon: "inbox",
          color: "#6b7280",
        },
        {
          id: "kpi-progress",
          label: "In Progress",
          value: 28,
          change: -5,
          changeType: "DECREASE",
          icon: "sync",
          color: "#3b82f6",
        },
        {
          id: "kpi-escalated",
          label: "Escalated",
          value: 8,
          change: 2,
          changeType: "INCREASE",
          icon: "priority_high",
          color: "#ef4444",
        },
        {
          id: "kpi-resolved",
          label: "Resolved",
          value: 15,
          change: 25,
          changeType: "INCREASE",
          icon: "task_alt",
          color: "#10b981",
        },
      ],
      workloadByDepartment: [
        {
          department: this.departments[0],
          openIncidents: 19,
          inProgress: 11,
          escalated: 2,
          avgResolutionTime: 210,
          slaCompliance: 88,
        },
        {
          department: this.departments[1],
          openIncidents: 16,
          inProgress: 10,
          escalated: 3,
          avgResolutionTime: 180,
          slaCompliance: 86,
        },
        {
          department: this.departments[2],
          openIncidents: 12,
          inProgress: 7,
          escalated: 3,
          avgResolutionTime: 250,
          slaCompliance: 81,
        },
      ],
      trends: { daily: [], weekly: [], monthly: [] },
      recentIncidents: [],
      slaCompliance: {
        overall: 85,
        byDepartment: this.departments.map((department) => ({
          departmentId: department.id,
          compliance: department.id === "3" ? 80 : 87,
        })),
        byPriority: [
          { priority: "CRITICAL", compliance: 70 },
          { priority: "HIGH", compliance: 82 },
          { priority: "MEDIUM", compliance: 91 },
          { priority: "LOW", compliance: 96 },
        ],
      },
    };

    return this.withDelay(summary);
  }

  getMockIncidents(): Observable<PaginatedResponse<Incident>> {
    const departmentSupport = this.departments[0];
    const departmentOperations = this.departments[1];
    const now = new Date().toISOString();
    const incident: Incident = {
      id: "INC-2024-001",
      referenceNumber: "INC-2024-001",
      title: "Network connectivity issue in Building A",
      description: "Users report packet loss and intermittent access to services.",
      type: {
        id: "1",
        name: "Network Incident",
        code: "NET-INC",
        description: "Network and connectivity related incident type",
        departmentChain: this.departmentChains[0],
        defaultChecklists: [],
        slaRules: [],
        escalationRules: [],
        isActive: true,
      },
      priority: "HIGH",
      status: "IN_PROGRESS",
      currentDepartment: departmentOperations,
      originDepartment: departmentSupport,
      assignedTo: this.currentUser,
      createdBy: this.currentUser,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now,
      tags: ["network", "critical"],
      customFields: {},
    };

    const response: PaginatedResponse<Incident> = {
      data: [incident],
      success: true,
      message: "Mock incidents loaded.",
      timestamp: now,
      correlationId: `mock-${Date.now()}`,
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    return this.withDelay(response);
  }

  getMockChecklist(_incidentId: string): Observable<Checklist> {
    const checklist: Checklist = {
      id: "CHK-2024-001",
      incidentId: "INC-2024-001",
      chainStepId: "STEP-OPS-1",
      departmentId: "2",
      status: "IN_PROGRESS",
      items: [
        {
          id: "ITEM-1",
          description: "Verify network equipment power and link status.",
          isCompleted: true,
          isRequired: true,
          completedAt: new Date(Date.now() - 120 * 60_000).toISOString(),
          completedBy: "Jane Smith",
          order: 1,
          category: "Verification",
          evidenceRequired: false,
        },
        {
          id: "ITEM-2",
          description: "Check switch configuration for VLAN routing anomalies.",
          isCompleted: false,
          isRequired: true,
          order: 2,
          category: "Configuration",
          evidenceRequired: true,
          evidenceType: "ATTACHMENT",
        },
        {
          id: "ITEM-3",
          description: "Document findings and interim mitigation notes.",
          isCompleted: false,
          isRequired: true,
          order: 3,
          category: "Documentation",
          evidenceRequired: true,
          evidenceType: "NOTE",
        },
      ],
    };

    return this.withDelay(checklist);
  }

  getMockAttachments(_incidentId: string): Observable<Attachment[]> {
    const attachments: Attachment[] = [
      {
        id: "ATT-2024-001",
        incidentId: "INC-2024-001",
        fileName: "network-diagram.pdf",
        fileType: "application/pdf",
        fileSize: 245760,
        uploadedBy: "Jane Smith",
        uploadedAt: new Date(Date.now() - 100 * 60_000).toISOString(),
        category: "DOCUMENT",
        isProofOfUptime: false,
        url: "#",
        metadata: {
          uploadedFromDepartment: "Operations",
          description: "Current Building A network topology diagram.",
          tags: ["network", "diagram"],
        },
      },
    ];

    return this.withDelay(attachments);
  }

  getMockAuditTrail(_incidentId: string): Observable<AuditEntry[]> {
    const audit: AuditEntry[] = [
      {
        id: "AUD-MOCK-001",
        incidentId: "INC-2024-001",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        userId: "1",
        userName: "Jane Smith",
        departmentId: "1",
        departmentName: "Support",
        action: "CREATED",
        details: "Incident created from support ticket escalation.",
        metadata: {},
        ipAddress: "127.0.0.1",
      },
      {
        id: "AUD-MOCK-002",
        incidentId: "INC-2024-001",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        userId: "1",
        userName: "Jane Smith",
        departmentId: "2",
        departmentName: "Operations",
        action: "DEPARTMENT_TRANSITION",
        fromState: "Support",
        toState: "Operations",
        details: "Transferred for network diagnostics and remediation.",
        metadata: {},
        ipAddress: "127.0.0.1",
      },
    ];

    return this.withDelay(audit);
  }

  private withDelay<T>(value: T): Observable<T> {
    const delayMs = 300 + Math.floor(Math.random() * 200);
    return of(this.clone(value)).pipe(delay(delayMs));
  }

  private requireIncident(incidentId: string): Incident {
    const incident = this.incidents.find((entry) => entry.id === incidentId);
    if (!incident) {
      throw new MockBackendError(404, "INCIDENT_NOT_FOUND", "Incident not found.");
    }

    return incident;
  }

  private createIncidentRecord(input: {
    id: string;
    referenceNumber: string;
    title: string;
    description: string;
    priority: Incident["priority"];
    status: Incident["status"];
    currentDepartmentId: string;
    originDepartmentId: string;
    createdAt?: string;
    updatedAt?: string;
    tags: string[];
    customFields?: Record<string, unknown>;
  }): Incident {
    const currentDepartment = this.departments.find(
      (department) => department.id === input.currentDepartmentId,
    );
    const originDepartment = this.departments.find(
      (department) => department.id === input.originDepartmentId,
    );

    if (!currentDepartment || !originDepartment) {
      throw new Error(
        `Department seed data is invalid for currentDepartmentId=${input.currentDepartmentId} and originDepartmentId=${input.originDepartmentId}.`,
      );
    }

    const timestamp = input.createdAt ?? new Date().toISOString();

    return {
      id: input.id,
      referenceNumber: input.referenceNumber,
      title: input.title,
      description: input.description,
      type: {
        id: "1",
        name: "Technology Incident",
        code: "TECH-INC",
        description: "Operational incident workflow",
        departmentChain: this.departmentChains[0],
        defaultChecklists: [],
        slaRules: [],
        escalationRules: [],
        isActive: true,
      },
      priority: input.priority,
      status: input.status,
      currentDepartment,
      originDepartment,
      createdBy: {
        id: "1",
        displayName: "Jane Smith",
        email: "jane@example.com",
        department: originDepartment,
        role: {
          id: "role-1",
          name: "Incident Manager",
          departmentId: originDepartment.id,
          permissions: ["MANAGE_INCIDENTS"],
        },
        permissions: [],
      },
      createdAt: timestamp,
      updatedAt: input.updatedAt ?? timestamp,
      tags: input.tags,
      customFields: input.customFields ?? {},
    };
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
