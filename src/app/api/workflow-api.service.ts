import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Department } from "../shared/models/user.model";
import { DepartmentChain, Incident } from "../shared/models/incident.model";

@Injectable({ providedIn: "root" })
export class WorkflowApiService {
  getDepartmentChains(): Observable<DepartmentChain[]> {
    return of([]);
  }
  getDepartments(): Observable<Department[]> {
    return of([]);
  }
  deleteDepartmentChain(_id: string): Observable<unknown> {
    return of({});
  }
  moveIncident(_incidentId: string, _payload: unknown): Observable<Incident> {
    return of({} as Incident);
  }
}
