import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { MockBackendService } from "./mock-backend.service";
import { SlaState } from "../shared/models/sla.model";

@Injectable({ providedIn: "root" })
export class SlaApiService {
  private readonly mock = inject(MockBackendService);

  getSlaState(incidentId: string): Observable<SlaState> {
    return this.mock.getSlaState(incidentId);
  }
}
