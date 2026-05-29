import { Injectable } from "@angular/core";
import { delay } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { Attachment } from "../shared/models/attachment.model";
import { WorkflowStateService } from "./workflow-engine/workflow-state.service";

@Injectable({ providedIn: "root" })
export class AttachmentApiService {
  constructor(private readonly workflow: WorkflowStateService) {}

  getAttachments(incidentId: string): Observable<Attachment[]> {
    return of(this.workflow.getAttachments(incidentId)).pipe(delay(60));
  }

  uploadAttachments(
    _incidentId: string,
    _formData: FormData,
  ): Observable<{ acknowledged: boolean }> {
    return of({ acknowledged: true });
  }

  deleteAttachment(
    _incidentId: string,
    _attachmentId: string,
  ): Observable<{ acknowledged: boolean }> {
    return of({ acknowledged: true });
  }

  updateAttachment(
    _incidentId: string,
    _attachmentId: string,
    _payload: Partial<Attachment>,
  ): Observable<{ acknowledged: boolean }> {
    return of({ acknowledged: true });
  }
}
