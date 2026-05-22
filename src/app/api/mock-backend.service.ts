import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay } from "rxjs";
import { DashboardSummary, DashboardKpi, DepartmentWorkload } from "../shared/models/dashboard.model";
import { Department } from "../shared/models/user.model";
import { PaginatedResponse, Priority } from "../shared/models/common.model";
import { Incident } from "../shared/models/incident.model";
import { WorkflowStateService } from "./workflow-engine/workflow-state.service";

@Injectable({ providedIn: "root" })
export class MockBackendService {
  constructor(private readonly workflow: WorkflowStateService) {
    (window as any).__workflowState = this.workflow;
  }

  getMockDashboardSummary(): Observable<DashboardSummary> {
    const incidents = this.workflow.getIncidents();
    const support: Department = { id: "SUP", name: "Support", code: "SUP", isActive: true };
    const accounts: Department = { id: "ACC", name: "Accounts", code: "ACC", isActive: true };
    const operations: Department = { id: "OPS", name: "Operations", code: "OPS", isActive: true };

    const kpis: DashboardKpi[] = [
      { id: "1", label: "Open Incidents", value: incidents.filter(i => i.status === "OPEN").length, change: 0, changeType: "NEUTRAL", icon: "warning", color: "#ef4444" },
      { id: "2", label: "In Progress", value: incidents.filter(i => i.status === "IN_PROGRESS").length, change: 0, changeType: "NEUTRAL", icon: "pending", color: "#f59e0b" },
      { id: "3", label: "Escalated", value: incidents.filter(i => i.status === "ESCALATED").length, change: 0, changeType: "NEUTRAL", icon: "error", color: "#dc2626" },
      { id: "4", label: "Resolved Today", value: incidents.filter(i => i.status === "RESOLVED").length, change: 0, changeType: "NEUTRAL", icon: "check_circle", color: "#10b981" },
    ];

    const workload: DepartmentWorkload[] = [
      { department: support, openIncidents: incidents.filter(i => i.currentDepartment.code === "SUP").length, inProgress: 0, escalated: 0, avgResolutionTime: 0, slaCompliance: 90 },
      { department: accounts, openIncidents: incidents.filter(i => i.currentDepartment.code === "ACC").length, inProgress: 0, escalated: 0, avgResolutionTime: 0, slaCompliance: 90 },
      { department: operations, openIncidents: incidents.filter(i => i.currentDepartment.code === "OPS").length, inProgress: 0, escalated: 0, avgResolutionTime: 0, slaCompliance: 90 },
    ];

    const summary: DashboardSummary = {
      kpis,
      workloadByDepartment: workload,
      trends: { daily: [], weekly: [], monthly: [] },
      recentIncidents: incidents.slice(0, 5),
      slaCompliance: { overall: 90, byDepartment: [], byPriority: [] },
    };

    return of(summary).pipe(delay(150));
  }

  getMockIncidents(): Observable<PaginatedResponse<Incident>> {
    const incidents = this.workflow.getIncidents();
    return of({
      data: incidents,
      pagination: {
        currentPage: 1,
        pageSize: incidents.length || 10,
        totalItems: incidents.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      success: true,
      timestamp: new Date().toISOString(),
      correlationId: "mock",
    }).pipe(delay(100));
  }

  getMockChecklist(incidentId: string) { return of(this.workflow.getChecklist(incidentId)).pipe(delay(100)); }
  getMockAttachments(incidentId: string) { return of(this.workflow.getAttachments(incidentId)).pipe(delay(100)); }
  getMockAuditTrail(incidentId: string) { return of(this.workflow.getAuditTrail(incidentId)).pipe(delay(100)); }
  getMockEscalations(incidentId: string) { return of(this.workflow.getEscalations(incidentId)).pipe(delay(100)); }
  getMockSlaState(incidentId: string) { return of(this.workflow.getSlaState(incidentId)).pipe(delay(100)); }
}
