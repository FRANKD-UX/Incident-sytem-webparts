import { Injectable } from "@angular/core";
import { delay } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { Escalation } from "../shared/models/escalation.model";
import { WorkflowStateService } from "./workflow-engine/workflow-state.service";

@Injectable({ providedIn: "root" })
export class EscalationApiService {
  constructor(private readonly workflow: WorkflowStateService) {}

  getEscalations(incidentId: string): Observable<Escalation[]> {
    return of(this.workflow.getEscalations(incidentId)).pipe(delay(60));
  }
}
