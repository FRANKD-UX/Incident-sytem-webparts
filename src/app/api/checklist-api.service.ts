import { Injectable } from '@angular/core';
import { delay, of, Observable } from 'rxjs';
import { WorkflowStateService } from './workflow-engine/workflow-state.service';

@Injectable({
  providedIn: 'root',
})
export class ChecklistApiService {
  constructor(private readonly workflow: WorkflowStateService) {}

  getChecklist(incidentId: string): Observable<any> {
    return of(this.workflow.getChecklist(incidentId) as any).pipe(delay(60));
  }

  updateChecklistItem(incidentId: string, itemId: string, payload: any): Observable<any> {
    const checklist = this.workflow.updateChecklistItem(incidentId, itemId, payload as any);
    return of(checklist as any).pipe(delay(60));
  }
}
