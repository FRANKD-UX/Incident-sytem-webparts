import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiResponse } from "../shared/models/common.model";
import { Incident } from "../shared/models/incident.model";
import { IncidentWorkflowState } from "../core/contracts/workflow-state.contract";
import { HttpClientService } from "../core/services/http-client.service";

@Injectable({ providedIn: "root" })
export class WorkflowApiService {
  constructor(private readonly http: HttpClientService) {}

  getDepartmentChains(): Observable<Incident["type"]["departmentChain"][]> {
    return this.http
      .get<Incident["type"]["departmentChain"][]>(
        "/workflow/department-chains",
      )
      .pipe(map((response) => response.data ?? []));
  }

  getDepartments(): Observable<Incident["currentDepartment"][]> {
    return this.http
      .get<Incident["currentDepartment"][]>("/workflow/departments")
      .pipe(map((response) => response.data ?? []));
  }

  deleteDepartmentChain(_id: string): Observable<{ acknowledged: boolean }> {
    return this.http
      .delete<{ acknowledged: boolean }>(`/workflow/department-chains/${_id}`)
      .pipe(
        map((response) => ({ acknowledged: response.data?.acknowledged ?? false })),
      );
  }

  moveIncident(
    incidentId: string,
    payload: { fromDepartmentCode: string; toDepartmentCode: string },
  ): Observable<Incident | null> {
    return this.http
      .post<Incident>(`/incidents/${incidentId}/move`, payload)
      .pipe(map((response) => this.mapIncidentOrNull(response)));
  }

  completeCurrentStep(
    incidentId: string,
  ): Observable<IncidentWorkflowState | null> {
    return this.http
      .post<IncidentWorkflowState>(`/incidents/${incidentId}/complete-step`, {})
      .pipe(map((response) => response.data ?? null));
  }

  sendBack(
    incidentId: string,
    reason: string,
  ): Observable<IncidentWorkflowState | null> {
    return this.http
      .post<IncidentWorkflowState>(`/incidents/${incidentId}/send-back`, {
        reason,
      })
      .pipe(map((response) => response.data ?? null));
  }

  private mapIncidentOrNull(response: ApiResponse<Incident>): Incident | null {
    if (!response?.data) {
      return null;
    }

    return {
      ...response.data,
      tags: response.data.tags ?? [],
      customFields: response.data.customFields ?? {},
    };
  }
}
