import { Injectable } from "@angular/core";
import { delay } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { AuditEntry } from "../shared/models/audit.model";
import { WorkflowStateService } from "./workflow-engine/workflow-state.service";

@Injectable({ providedIn: "root" })
export class AuditApiService {
  constructor(private readonly workflow: WorkflowStateService) {}

  getAuditTrail(incidentId: string): Observable<AuditEntry[]> {
    return of(this.workflow.getAuditTrail(incidentId)).pipe(delay(60));
  }
}
