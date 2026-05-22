import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClientService } from "../core/services/http-client.service";
import { Attachment } from "../shared/models/attachment.model";
import { CommandResponse } from "../shared/models/common.model";

export interface AttachmentUpdatePayload {
  category?: Attachment["category"];
  isProofOfUptime?: boolean;
  metadata?: Partial<Attachment["metadata"]>;
}

@Injectable({ providedIn: "root" })
export class AttachmentApiService {
  private readonly http = inject(HttpClientService);

  getAttachments(incidentId: string): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`/incidents/${incidentId}/attachments`);
  }

  uploadAttachments(
    incidentId: string,
    formData: FormData,
  ): Observable<Attachment[]> {
    return this.http.post<Attachment[]>(
      `/incidents/${incidentId}/attachments`,
      formData,
    );
  }

  deleteAttachment(
    incidentId: string,
    attachmentId: string,
  ): Observable<CommandResponse> {
    return this.http.delete<CommandResponse>(
      `/incidents/${incidentId}/attachments/${attachmentId}`,
    );
  }

  updateAttachment(
    incidentId: string,
    attachmentId: string,
    updates: AttachmentUpdatePayload,
  ): Observable<Attachment> {
    return this.http.patch<Attachment>(
      `/incidents/${incidentId}/attachments/${attachmentId}`,
      updates,
    );
  }
}
