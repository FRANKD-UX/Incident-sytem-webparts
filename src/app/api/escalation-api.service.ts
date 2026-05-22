import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EscalationApiService {
  getEscalations(incidentId: string): Observable<any[]> { return of([]); }
}
