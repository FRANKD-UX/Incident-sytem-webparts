import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { WorkflowStateService } from "./workflow-engine/workflow-state.service";

@Injectable({ providedIn: "root" })
export class WorkflowApiService {
  constructor(private readonly workflow: WorkflowStateService) {}

  getDepartmentChains(): Observable<any[]> {
    return of([]); 
  }

  getDepartments(): Observable<any[]> {
    return of([]);
  }

  deleteDepartmentChain(id: string): Observable<any> {
    return of({});
  }

  moveIncident(
    incidentId: string,
    payload: { fromDepartmentCode: string; toDepartmentCode: string },
  ): Observable<any> {
    return of(this.workflow.moveIncident(incidentId, payload));
  }
}
