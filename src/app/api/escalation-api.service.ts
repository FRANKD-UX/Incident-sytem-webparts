import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Escalation } from "../shared/models/escalation.model";

@Injectable({ providedIn: "root" })
export class EscalationApiService {
  getEscalations(_incidentId: string): Observable<Escalation[]> {
    return of([]);
  }
}
