import { Injectable } from '@angular/core';
import { delay, of, Observable } from 'rxjs';
import { WorkflowStateService } from './workflow-engine/workflow-state.service';

@Injectable({
  providedIn: 'root',
})
export class IncidentApiService {
  constructor(private readonly workflow: WorkflowStateService) {}

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
    } as any).pipe(delay(60));
  }

  getIncident(id: string): Observable<any> {
    return of(this.workflow.getIncident(id) as any).pipe(delay(60));
  }

  createIncident(incident: any): Observable<any> {
    return of(this.workflow.createIncident(incident as any) as any).pipe(delay(120));
  }

  updateIncident(id: string, updates: any): Observable<any> {
    const existing = this.workflow.getIncident(id);
    return of({ ...(existing as any), ...(updates as any) } as any).pipe(delay(60));
  }

  getIncidentChain(incidentId: string): Observable<any> {
    return of(this.workflow.getIncidentChain(incidentId) as any).pipe(delay(60));
  }
}
