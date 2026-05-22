import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClientService } from "../core/services/http-client.service";
import { AuditEntry } from "../shared/models/audit.model";

@Injectable({ providedIn: "root" })
export class AuditApiService {
  private readonly http = inject(HttpClientService);

  getAuditTrail(incidentId: string): Observable<AuditEntry[]> {
    return this.http.get<AuditEntry[]>(`/incidents/${incidentId}/audit`);
  }
}
