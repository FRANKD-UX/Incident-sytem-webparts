import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClientService } from "../core/services/http-client.service";
import { SlaState } from "../shared/models/sla.model";

@Injectable({ providedIn: "root" })
export class SlaApiService {
  private readonly http = inject(HttpClientService);

  getSlaState(incidentId: string): Observable<SlaState> {
    return this.http.get<SlaState>(`/incidents/${incidentId}/sla`);
  }
}
