import { Injectable } from '@angular/core';
import { delay, of, Observable } from 'rxjs';
import { WorkflowStateService } from './workflow-engine/workflow-state.service';

@Injectable({
  providedIn: 'root',
})
export class MockBackendService {
  constructor(private readonly workflow: WorkflowStateService) {}

  getMockDashboardSummary(): Observable<any> {
    return this.getDashboardSummary();
  }

  getDashboardSummary(): Observable<any> {
    const incidents = this.workflow.getIncidents();
    const departments = [
      { id: 'SUP', name: 'Support', code: 'SUP', isActive: true },
      { id: 'ACC', name: 'Accounts', code: 'ACC', isActive: true },
      { id: 'OPS', name: 'Operations', code: 'OPS', isActive: true },
    ];

    return of({
      kpis: [
        { id: '1', label: 'Open Incidents', value: incidents.filter((i: any) => i.status === 'OPEN').length, change: 0, changeType: 'NEUTRAL', icon: 'warning', color: '#ef4444' },
        { id: '2', label: 'In Progress', value: incidents.filter((i: any) => i.status === 'IN_PROGRESS').length, change: 0, changeType: 'NEUTRAL', icon: 'pending', color: '#f59e0b' },
        { id: '3', label: 'Escalated', value: incidents.filter((i: any) => i.status === 'ESCALATED').length, change: 0, changeType: 'NEUTRAL', icon: 'error', color: '#dc2626' },
        { id: '4', label: 'Resolved Today', value: incidents.filter((i: any) => i.status === 'RESOLVED').length, change: 0, changeType: 'NEUTRAL', icon: 'check_circle', color: '#10b981' },
      ],
      recentIncidents: incidents.slice(0, 5) as any,
      workloadByDepartment: departments.map((department) => {
        const departmentIncidents = incidents.filter((i: any) => i.currentDepartment.code === department.code);
        return {
          department,
          openIncidents: departmentIncidents.filter((i: any) => i.status === 'OPEN').length,
          inProgress: departmentIncidents.filter((i: any) => i.status === 'IN_PROGRESS').length,
          escalated: departmentIncidents.filter((i: any) => i.status === 'ESCALATED').length,
          avgResolutionTime: 0,
          slaCompliance: department.code === 'OPS' ? 78 : 92,
        };
      }),
      trends: { daily: [], weekly: [], monthly: [] },
      slaCompliance: { overall: 87, byDepartment: [], byPriority: [] },
    } as any).pipe(delay(80));
  }

  getIncidents(): Observable<any> {
    const incidents = this.workflow.getIncidents();
    return of({
      data: incidents as any,
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
    } as any).pipe(delay(80));
  }

  getMockChecklist(incidentId: string): Observable<any> {
    return of(this.workflow.getChecklist(incidentId) as any).pipe(delay(100));
  }

  getMockAttachments(incidentId: string): Observable<any> {
    return of(this.workflow.getAttachments(incidentId) as any).pipe(delay(100));
  }

  getMockAuditTrail(incidentId: string): Observable<any> {
    return of(this.workflow.getAuditTrail(incidentId) as any).pipe(delay(100));
  }

  getMockEscalations(incidentId: string): Observable<any> {
    return of(this.workflow.getEscalations(incidentId) as any).pipe(delay(100));
  }

  getMockSlaState(incidentId: string): Observable<any> {
    return of(this.workflow.getSlaState(incidentId) as any).pipe(delay(100));
  }
}
