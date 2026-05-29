import { Injectable } from "@angular/core";
import { delay } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { SlaState } from "../shared/models/sla.model";
import { WorkflowStateService } from "./workflow-engine/workflow-state.service";

@Injectable({ providedIn: "root" })
export class SlaApiService {
  constructor(private readonly workflow: WorkflowStateService) {}

  getSlaState(incidentId: string): Observable<SlaState> {
    return of(this.workflow.getSlaState(incidentId)).pipe(delay(60));
  }
}
