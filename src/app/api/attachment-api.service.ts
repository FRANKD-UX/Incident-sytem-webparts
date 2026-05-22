import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { MockBackendService } from "./mock-backend.service";
import { Attachment } from "../shared/models/attachment.model";

@Injectable({ providedIn: "root" })
export class AttachmentApiService {
  private readonly mock = inject(MockBackendService);

  getAttachments(incidentId: string): Observable<Attachment[]> {
    return this.mock.getAttachments(incidentId);
  }

  uploadAttachments(
    _incidentId: string,
    _formData: FormData,
  ): Observable<unknown> {
    return new Observable((observer) => {
      observer.next({});
      observer.complete();
    });
  }

  deleteAttachment(
    _incidentId: string,
    _attachmentId: string,
  ): Observable<unknown> {
    return new Observable((observer) => {
      observer.next({});
      observer.complete();
    });
  }

  updateAttachment(
    _incidentId: string,
    _attachmentId: string,
    _updates: unknown,
  ): Observable<unknown> {
    return new Observable((observer) => {
      observer.next({});
      observer.complete();
    });
  }
}
