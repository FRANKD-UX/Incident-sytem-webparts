import { Injectable } from "@angular/core";
import { delay, of, Observable } from "rxjs";
import { WorkflowStateService } from "./workflow-engine/workflow-state.service";
import { WorkflowConfigurationService } from "./workflow-configuration.service";
import { PaginatedResponse } from "../shared/models/common.model";
import { Incident } from "../shared/models/incident.model";

@Injectable({
  providedIn: "root",
})
export class IncidentApiService {
  constructor(
    private readonly workflow: WorkflowStateService,
    private readonly workflowConfiguration: WorkflowConfigurationService,
  ) {}

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
    }).pipe(delay(60));
  }

  getIncident(id: string): Observable<Incident | null> {
    return of(this.workflow.getIncident(id)).pipe(delay(60));
  }

  createIncident(incident: Partial<Incident>): Observable<Incident> {
    return of(this.workflow.createIncident(incident)).pipe(delay(120));
  }

  updateIncident(
    id: string,
    updates: Partial<Incident>,
  ): Observable<Incident | null> {
    return of(this.workflow.updateIncident(id, updates)).pipe(delay(60));
  }

  getIncidentChain(
    incidentId: string,
  ): Observable<Incident["type"]["departmentChain"] | null> {
    const incident = this.workflow.getIncident(incidentId);

    if (!incident) {
      return of(null).pipe(delay(60));
    }

    const configuredChain =
      this.workflowConfiguration.resolvePublishedDepartmentChainForIncidentType(
        incident.type.id,
      );

    return of(
      configuredChain ?? this.workflow.getIncidentChain(incidentId),
    ).pipe(delay(60));
  }
}
