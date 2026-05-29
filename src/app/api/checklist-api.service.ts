import { Injectable } from "@angular/core";
import { delay, of, Observable } from "rxjs";
import { WorkflowStateService } from "./workflow-engine/workflow-state.service";
import {
  Checklist,
  ChecklistItemUpdatePayload,
} from "../shared/models/checklist.model";

@Injectable({
  providedIn: "root",
})
export class ChecklistApiService {
  constructor(private readonly workflow: WorkflowStateService) {}

  getChecklist(incidentId: string): Observable<Checklist> {
    return of(this.workflow.getChecklist(incidentId)).pipe(delay(60));
  }

  updateChecklistItem(
    incidentId: string,
    itemId: string,
    payload: ChecklistItemUpdatePayload,
  ): Observable<Checklist> {
    const checklist = this.workflow.updateChecklistItem(
      incidentId,
      itemId,
      payload,
    );
    return of(checklist).pipe(delay(60));
  }
}
