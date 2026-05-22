import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay } from "rxjs";
import { Incident, IncidentType, DepartmentChain } from "../shared/models/incident.model";
import { PaginatedResponse } from "../shared/models/common.model";
import { WorkflowStateService } from "./workflow-engine/workflow-state.service";

@Injectable({ providedIn: "root" })
export class IncidentApiService {
  constructor(private readonly workflow: WorkflowStateService) {}

  getIncidents(): Observable<PaginatedResponse<Incident>> {
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
      correlationId: "demo",
    }).pipe(delay(100));
  }

  getIncidentById(id: string): Observable<Incident> {
    return of(this.workflow.getIncident(id)!).pipe(delay(60));
  }

  createIncident(incident: Partial<Incident>): Observable<Incident> {
    return of(this.workflow.createIncident(incident as any)).pipe(delay(120));
  }

  updateIncident(id: string, updates: Partial<Incident>): Observable<Incident> {
    const existing = this.workflow.getIncident(id);
    return of({ ...(existing as Incident), ...updates }).pipe(delay(60));
  }

  deleteIncident(id: string): Observable<void> {
    return of(void 0).pipe(delay(20));
  }

  getIncidentTypes(): Observable<IncidentType[]> {
    return of([]).pipe(delay(20));
  }

  getIncidentChain(incidentId: string): Observable<DepartmentChain> {
    return of(this.workflow.getIncidentChain(incidentId)).pipe(delay(60));
  }
}
