import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay } from "rxjs";
import { Checklist, ChecklistItemUpdatePayload } from "../shared/models/checklist.model";
import { WorkflowStateService } from "./workflow-engine/workflow-state.service";

@Injectable({ providedIn: "root" })
export class ChecklistApiService {
  constructor(private readonly workflow: WorkflowStateService) {}

  getChecklist(incidentId: string): Observable<Checklist> {
    return of(this.workflow.getChecklist(incidentId)).pipe(delay(60));
  }

  updateChecklistItem(
    incidentId: string,
    itemId: string,
    payload: ChecklistItemUpdatePayload,
  ): Observable<any> {
    const checklist = this.workflow.updateChecklistItem(incidentId, itemId, payload);
    return of(checklist).pipe(delay(60));
  }
}
