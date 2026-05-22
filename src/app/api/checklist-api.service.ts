import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClientService } from "../core/services/http-client.service";
import { Checklist } from "../shared/models/checklist.model";

export interface ChecklistItemUpdatePayload {
  isCompleted?: boolean;
  note?: string;
  evidenceAttachmentIds?: string[];
}

@Injectable({ providedIn: "root" })
export class ChecklistApiService {
  private readonly http = inject(HttpClientService);

  getChecklist(incidentId: string): Observable<Checklist> {
    return this.http.get<Checklist>(`/incidents/${incidentId}/checklist`);
  }

  updateChecklistItem(
    incidentId: string,
    itemId: string,
    payload: ChecklistItemUpdatePayload,
  ): Observable<Checklist> {
    return this.http.patch<Checklist>(
      `/incidents/${incidentId}/checklist/${itemId}`,
      payload,
    );
  }
}
