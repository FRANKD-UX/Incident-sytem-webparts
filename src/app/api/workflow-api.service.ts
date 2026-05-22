import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClientService } from "../core/services/http-client.service";
import { Department } from "../shared/models/user.model";
import { DepartmentChain, Incident } from "../shared/models/incident.model";
import { CommandResponse, IncidentStatus } from "../shared/models/common.model";

export interface IncidentMovePayload {
  targetDepartmentId?: string;
  targetStatus?: IncidentStatus;
  note?: string;
}

@Injectable({ providedIn: "root" })
export class WorkflowApiService {
  private readonly http = inject(HttpClientService);

  getDepartmentChains(): Observable<DepartmentChain[]> {
    return this.http.get<DepartmentChain[]>("/workflows/chains");
  }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>("/departments");
  }

  deleteDepartmentChain(id: string): Observable<CommandResponse> {
    return this.http.delete<CommandResponse>(`/workflows/chains/${id}`);
  }

  moveIncident(
    incidentId: string,
    payload: IncidentMovePayload,
  ): Observable<Incident> {
    return this.http.post<Incident>(`/incidents/${incidentId}/move`, payload);
  }
}
