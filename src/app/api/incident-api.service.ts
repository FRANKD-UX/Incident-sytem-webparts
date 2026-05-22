import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClientService } from "../core/services/http-client.service";
import { Incident } from "../shared/models/incident.model";
import { QueryParams } from "../shared/models/common.model";

@Injectable({ providedIn: "root" })
export class IncidentApiService {
  private readonly http = inject(HttpClientService);

  getIncidents(params?: QueryParams): Observable<Incident[]> {
    return this.http.get<Incident[]>("/incidents", { params });
  }

  getIncident(incidentId: string): Observable<Incident> {
    return this.http.get<Incident>(`/incidents/${incidentId}`);
  }

  createIncident(payload: Partial<Incident>): Observable<Incident> {
    return this.http.post<Incident>("/incidents", payload);
  }

  updateIncident(
    incidentId: string,
    updates: Partial<Incident>,
  ): Observable<Incident> {
    return this.http.patch<Incident>(`/incidents/${incidentId}`, updates);
  }

  deleteIncident(incidentId: string): Observable<{ acknowledged: boolean }> {
    return this.http.delete<{ acknowledged: boolean }>(`/incidents/${incidentId}`);
  }
}
