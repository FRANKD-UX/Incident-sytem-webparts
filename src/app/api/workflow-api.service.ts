import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { WorkflowStateService } from "./workflow-engine/workflow-state.service";
import { Incident } from "../shared/models/incident.model";
import { IncidentWorkflowState } from "../core/contracts/workflow-state.contract";

@Injectable({ providedIn: "root" })
export class WorkflowApiService {
  constructor(private readonly workflow: WorkflowStateService) {}

  getDepartmentChains(): Observable<Incident["type"]["departmentChain"][]> {
    return of([]);
  }

  getDepartments(): Observable<Incident["currentDepartment"][]> {
    return of([]);
  }

  deleteDepartmentChain(_id: string): Observable<{ acknowledged: boolean }> {
    return of({ acknowledged: true });
  }

  moveIncident(
    incidentId: string,
    payload: { fromDepartmentCode: string; toDepartmentCode: string },
  ): Observable<Incident | null> {
    return of(this.workflow.moveIncident(incidentId, payload));
  }

  completeCurrentStep(
    incidentId: string,
  ): Observable<IncidentWorkflowState | null> {
    return of(this.workflow.completeCurrentStep(incidentId));
  }

  sendBack(
    incidentId: string,
    reason: string,
  ): Observable<IncidentWorkflowState | null> {
    return of(this.workflow.sendBack(incidentId, reason));
  }
}
