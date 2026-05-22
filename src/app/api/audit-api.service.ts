import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { MockBackendService } from "./mock-backend.service";
import { AuditEntry } from "../shared/models/audit.model";

@Injectable({ providedIn: "root" })
export class AuditApiService {
  private readonly mock = inject(MockBackendService);

  getAuditTrail(incidentId: string): Observable<AuditEntry[]> {
    return this.mock.getAuditTrail(incidentId);
  }
}
