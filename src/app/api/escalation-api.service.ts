import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClientService } from "../core/services/http-client.service";
import { Escalation } from "../shared/models/escalation.model";

@Injectable({ providedIn: "root" })
export class EscalationApiService {
  private readonly http = inject(HttpClientService);

  getEscalations(incidentId: string): Observable<Escalation[]> {
    return this.http.get<Escalation[]>(`/incidents/${incidentId}/escalations`);
  }
}
