import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  getAuditTrail(incidentId: string): Observable<any[]> { return of([]); }
}
