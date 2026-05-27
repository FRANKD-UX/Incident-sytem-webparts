import { Injectable } from '@angular/core';
import { delay, of, Observable } from 'rxjs';
import { WorkflowStateService } from './workflow-engine/workflow-state.service';
import { DashboardSummary, AdminDashboardStats } from '../shared/models/dashboard.model';
import { PaginatedResponse } from '../shared/models/common.model';
import { Incident } from '../shared/models/incident.model';
import { Checklist } from '../shared/models/checklist.model';
import { Attachment } from '../shared/models/attachment.model';
import { AuditEntry } from '../shared/models/audit.model';
import { Escalation } from '../shared/models/escalation.model';
import { SlaState } from '../shared/models/sla.model';
import { Department } from '../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class MockBackendService {
  constructor(private readonly workflow: WorkflowStateService) {}

  getMockDashboardSummary(): Observable<DashboardSummary> {
    return this.getDashboardSummary();
  }

  getDashboardSummary(): Observable<DashboardSummary> {
    const incidents = this.workflow.getIncidents();
    const departments: Department[] = [
      { id: 'SUP', name: 'Support', code: 'SUP', isActive: true },
      { id: 'ACC', name: 'Accounts', code: 'ACC', isActive: true },
      { id: 'OPS', name: 'Operations', code: 'OPS', isActive: true },
    ];

    return of({
      kpis: [
        { id: '1', label: 'Open Incidents', value: incidents.filter((i) => i.status === 'OPEN').length, change: 0, changeType: 'NEUTRAL' as const, icon: 'warning', color: '#ef4444' },
        { id: '2', label: 'In Progress', value: incidents.filter((i) => i.status === 'IN_PROGRESS').length, change: 0, changeType: 'NEUTRAL' as const, icon: 'pending', color: '#f59e0b' },
        { id: '3', label: 'Escalated', value: incidents.filter((i) => i.status === 'ESCALATED').length, change: 0, changeType: 'NEUTRAL' as const, icon: 'error', color: '#dc2626' },
        { id: '4', label: 'Resolved Today', value: incidents.filter((i) => i.status === 'RESOLVED').length, change: 0, changeType: 'NEUTRAL' as const, icon: 'check_circle', color: '#10b981' },
      ],
      recentIncidents: incidents.slice(0, 5),
      workloadByDepartment: departments.map((department) => {
        const departmentIncidents = incidents.filter((i) => i.currentDepartment.code === department.code);
        return {
          department,
          openIncidents: departmentIncidents.filter((i) => i.status === 'OPEN').length,
          inProgress: departmentIncidents.filter((i) => i.status === 'IN_PROGRESS').length,
          escalated: departmentIncidents.filter((i) => i.status === 'ESCALATED').length,
          avgResolutionTime: 0,
          slaCompliance: department.code === 'OPS' ? 78 : 92,
        };
      }),
      trends: { daily: [], weekly: [], monthly: [] },
      slaCompliance: { overall: 87, byDepartment: [], byPriority: [] },
    }).pipe(delay(80));
  }

  getIncidents(): Observable<PaginatedResponse<Incident>> {
    const incidents = this.workflow.getIncidents();
    return of({
      data: incidents,
      pagination: {
        currentPage: 1,
        pageSize: incidents.length,
        totalItems: incidents.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      success: true,
      timestamp: new Date().toISOString(),
      correlationId: crypto.randomUUID?.() ?? String(Date.now()),
    }).pipe(delay(80));
  }

  getMockAdminStats(): Observable<AdminDashboardStats> {
    const incidents = this.workflow.getIncidents();
    return of({
      incidentTypes: new Set(incidents.map((incident) => incident.type.id)).size,
      workflows: new Set(incidents.map((incident) => incident.type.departmentChain.id)).size,
      slaRules: incidents.reduce(
        (total, incident) => total + incident.type.slaRules.length,
        0,
      ),
      roles: 3,
    }).pipe(delay(80));
  }

  getMockChecklist(incidentId: string): Observable<Checklist | null> {
    return of(this.workflow.getChecklist(incidentId)).pipe(delay(100));
  }

  getMockAttachments(incidentId: string): Observable<Attachment[]> {
    return of(this.workflow.getAttachments(incidentId)).pipe(delay(100));
  }

  getMockAuditTrail(incidentId: string): Observable<AuditEntry[]> {
    return of(this.workflow.getAuditTrail(incidentId)).pipe(delay(100));
  }

  getMockEscalations(incidentId: string): Observable<Escalation[]> {
    return of(this.workflow.getEscalations(incidentId)).pipe(delay(100));
  }

  getMockSlaState(incidentId: string): Observable<SlaState> {
    return of(this.workflow.getSlaState(incidentId)).pipe(delay(100));
  }
}
