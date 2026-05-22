import { Injectable } from "@angular/core";
import { of } from "rxjs";
import { DashboardSummary } from "../shared/models/dashboard.model";
import { Incident } from "../shared/models/incident.model";
import { Checklist } from "../shared/models/checklist.model";
import { Attachment } from "../shared/models/attachment.model";
import { AuditEntry } from "../shared/models/audit.model";
import { SlaState } from "../shared/models/sla.model";

@Injectable({ providedIn: "root" })
export class MockBackendService {
  getDashboardSummary() {
    const summary: DashboardSummary = {
      kpis: [
        {
          id: "1",
          label: "Open Incidents",
          value: 47,
          change: 12,
          changeType: "INCREASE",
          icon: "warning",
          color: "#ef4444",
        },
        {
          id: "2",
          label: "In Progress",
          value: 28,
          change: 5,
          changeType: "DECREASE",
          icon: "pending",
          color: "#f59e0b",
        },
        {
          id: "3",
          label: "Escalated",
          value: 8,
          change: 2,
          changeType: "INCREASE",
          icon: "error",
          color: "#dc2626",
        },
        {
          id: "4",
          label: "Resolved Today",
          value: 15,
          change: 25,
          changeType: "INCREASE",
          icon: "check_circle",
          color: "#10b981",
        },
      ],
      workloadByDepartment: [
        {
          department: { id: "1", name: "Support", code: "SUP", isActive: true },
          openIncidents: 12,
          inProgress: 8,
          escalated: 2,
          avgResolutionTime: 240,
          slaCompliance: 85,
        },
        {
          department: {
            id: "2",
            name: "Operations",
            code: "OPS",
            isActive: true,
          },
          openIncidents: 18,
          inProgress: 12,
          escalated: 4,
          avgResolutionTime: 360,
          slaCompliance: 78,
        },
      ],
      trends: { daily: [], weekly: [], monthly: [] },
      recentIncidents: [],
      slaCompliance: { overall: 85, byDepartment: [], byPriority: [] },
    };
    return of(summary);
  }

  getIncidents() {
    const incidents: Incident[] = [
      {
        id: "INC-001",
        referenceNumber: "INC-2024-001",
        title: "Network connectivity issue in Building A",
        description: "Multiple users reporting intermittent connectivity",
        type: {
          id: "1",
          name: "Network Incident",
          code: "NET-INC",
          description: "Network related incidents",
          departmentChain: {
            id: "1",
            name: "Standard",
            steps: [],
            allowParallel: false,
            requireStrictOrder: true,
          },
          defaultChecklists: [],
          slaRules: [],
          escalationRules: [],
          isActive: true,
        },
        priority: "HIGH",
        status: "IN_PROGRESS",
        currentDepartment: {
          id: "2",
          name: "Operations",
          code: "OPS",
          isActive: true,
        },
        originDepartment: {
          id: "1",
          name: "Support",
          code: "SUP",
          isActive: true,
        },
        createdBy: {
          id: "1",
          displayName: "Jane Smith",
          email: "jane@example.com",
          department: { id: "1", name: "Support", code: "SUP", isActive: true },
          role: { id: "1", name: "Agent", departmentId: "1", permissions: [] },
          permissions: [],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["network", "critical"],
        customFields: {},
      },
    ];
    return of(incidents);
  }

  getChecklist(incidentId: string) {
    const checklist: Checklist = {
      id: "CL-1",
      incidentId,
      chainStepId: "STEP-1",
      departmentId: "2",
      items: [
        {
          id: "CI-1",
          description: "Verify equipment",
          isCompleted: false,
          isRequired: true,
          order: 1,
          category: "Technical",
          evidenceRequired: false,
        },
      ],
      status: "IN_PROGRESS",
    };
    return of(checklist);
  }

  getAttachments(incidentId: string) {
    const attachments: Attachment[] = [
      {
        id: "A1",
        incidentId,
        fileName: "diag.pdf",
        fileType: "application/pdf",
        fileSize: 12345,
        uploadedBy: "Jane",
        uploadedAt: new Date().toISOString(),
        category: "DOCUMENT",
        isProofOfUptime: false,
        url: "#",
        metadata: { uploadedFromDepartment: "Support", tags: [] },
      },
    ];
    return of(attachments);
  }

  getAuditTrail(incidentId: string) {
    const trail: AuditEntry[] = [
      {
        id: "AU1",
        incidentId,
        timestamp: new Date().toISOString(),
        userId: "1",
        userName: "Jane Smith",
        departmentId: "1",
        departmentName: "Support",
        action: "CREATED",
        details: "Created incident",
        metadata: {},
        ipAddress: "127.0.0.1",
      },
    ];
    return of(trail);
  }

  getSlaState(incidentId: string) {
    const state: SlaState = {
      incidentId,
      metrics: [],
      overallStatus: "WITHIN_SLA",
      breaches: [],
    };
    return of(state);
  }
}
