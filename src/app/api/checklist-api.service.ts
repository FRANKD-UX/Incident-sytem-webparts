import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { MockBackendService } from "./mock-backend.service";
import { Checklist } from "../shared/models/checklist.model";

@Injectable({ providedIn: "root" })
export class ChecklistApiService {
  private readonly mock = inject(MockBackendService);

  getChecklist(incidentId: string): Observable<Checklist> {
    return this.mock.getChecklist(incidentId);
  }

  updateChecklistItem(
    _incidentId: string,
    _payload: unknown,
  ): Observable<unknown> {
    return new Observable((observer) => {
      observer.next({});
      observer.complete();
    });
  }
}
