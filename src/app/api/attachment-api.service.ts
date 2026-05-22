import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AttachmentApiService {
  getAttachments(incidentId: string): Observable<any[]> { return of([]); }
  uploadAttachments(incidentId: string, formData: FormData): Observable<any> { return of({}); }
  deleteAttachment(incidentId: string, attachmentId: string): Observable<any> { return of({}); }
  updateAttachment(incidentId: string, attachmentId: string, payload: any): Observable<any> { return of({}); }
}
